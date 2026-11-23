/**
 * GTA VI — Atlas y Guía Interactiva de Leonida
 * Shared Live Community Backend (Vercel Serverless Function + Upstash Redis REST)
 *
 * Zero npm dependencies — uses native Web Standard Request/Response + fetch()
 * against Upstash Redis REST /pipeline for atomic, low-latency global state.
 *
 * Redis Keys:
 *   atlas:pins       (Hash)  pinId -> JSON(marker + ownerHash)
 *   atlas:votes      (Hash)  markerId -> integer vote delta
 *   atlas:comments   (List)  JSON({ id, markerId, author, text, createdAt })
 *   atlas:activity   (List)  JSON({ type, markerId, title, author, text, createdAt })
 *   atlas:voted:<id> (Set)   hashed clientIds who already voted on marker <id>
 *   atlas:rl:<h>:<m> (Key)   per-IP per-minute rate limit counter (TTL 120s)
 */

import crypto from "node:crypto";

const KEYS = {
  PINS: "atlas:pins",
  VOTES: "atlas:votes",
  COMMENTS: "atlas:comments",
  ACTIVITY: "atlas:activity",
};

const MAX_PINS = 1500;
const MAX_COMMENTS = 800;
const MAX_ACTIVITY = 40;

const ALLOWED_CATEGORIES = new Set([
  "event", "landmark", "collectible", "secret", "weapon", "heist",
  "property", "vehicle", "activity", "food", "nightlife", "commerce",
  "service", "wildlife", "law", "navigation",
]);

function getRedisConfig() {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).replace(/\/+$/, "");
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    "";
  return { url, token, configured: Boolean(url && token) };
}

async function redisPipeline(commands) {
  const { url, token } = getRedisConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Redis HTTP ${res.status}: ${body.slice(0, 160)}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected Redis pipeline response");
  }
  return data.map((row) => {
    if (row && row.error) throw new Error(row.error);
    return row ? row.result : null;
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function hashValue(val) {
  return crypto
    .createHash("sha256")
    .update(`leonida-v1:${String(val || "")}`)
    .digest("hex")
    .slice(0, 20);
}

function cleanText(val, maxLen) {
  return String(val ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function sanitizeImage(url) {
  const s = cleanText(url, 260);
  if (!s) return "";
  // Allow only first-party atlas asset paths
  if (/^\/extracted\/[a-z0-9_/-]+\.(png|webp|jpg|jpeg)$/i.test(s)) {
    return s;
  }
  return "";
}

function sanitizeBlip(blip) {
  const s = cleanText(blip, 60).replace(/\.(png|webp)$/i, "");
  if (/^[a-z0-9_-]+$/i.test(s)) return s;
  return "blip_pin";
}

function parseHgetall(raw) {
  const out = {};
  if (!raw) return out;
  if (Array.isArray(raw)) {
    for (let i = 0; i + 1 < raw.length; i += 2) {
      out[raw[i]] = raw[i + 1];
    }
    return out;
  }
  if (typeof raw === "object") return raw;
  return out;
}

function getClientIp(request) {
  const xff = request.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0].trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

async function enforceRateLimit(request, bucket, maxPerMinute) {
  const ipHash = hashValue(getClientIp(request));
  const minute = Math.floor(Date.now() / 60000);
  const key = `atlas:rl:${bucket}:${ipHash}:${minute}`;
  const [count] = await redisPipeline([
    ["INCR", key],
    ["EXPIRE", key, "120"],
  ]);
  if (Number(count) > maxPerMinute) {
    return false;
  }
  return true;
}

function stripOwnerMeta(pin, viewerOwnerHash) {
  if (!pin || typeof pin !== "object") return null;
  const { ownerHash, ...pub } = pin;
  return {
    ...pub,
    isCommunity: true,
    isMine: Boolean(viewerOwnerHash && ownerHash && viewerOwnerHash === ownerHash),
  };
}

async function handleGet(request) {
  const cfg = getRedisConfig();
  if (!cfg.configured) {
    return jsonResponse({
      ok: true,
      live: false,
      pins: [],
      votes: {},
      comments: {},
      activity: [],
      stats: { pins: 0, comments: 0, totalVotes: 0 },
    });
  }

  const clientToken = request.headers.get("x-client-token") || "";
  const viewerHash = clientToken ? hashValue(clientToken) : "";

  const [rawPins, rawVotes, rawComments, rawActivity] = await redisPipeline([
    ["HGETALL", KEYS.PINS],
    ["HGETALL", KEYS.VOTES],
    ["LRANGE", KEYS.COMMENTS, "0", String(MAX_COMMENTS - 1)],
    ["LRANGE", KEYS.ACTIVITY, "0", String(MAX_ACTIVITY - 1)],
  ]);

  const pinMap = parseHgetall(rawPins);
  const pins = [];
  for (const val of Object.values(pinMap)) {
    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      const clean = stripOwnerMeta(parsed, viewerHash);
      if (clean && clean.id) pins.push(clean);
    } catch (_) { /* skip corrupted entry */ }
  }
  pins.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const voteMapRaw = parseHgetall(rawVotes);
  const votes = {};
  let totalVotes = 0;
  for (const [k, v] of Object.entries(voteMapRaw)) {
    const n = parseInt(v, 10) || 0;
    if (n !== 0) {
      votes[k] = n;
      totalVotes += Math.max(0, n);
    }
  }

  const commentsByMarker = {};
  let totalComments = 0;
  const listComments = Array.isArray(rawComments) ? rawComments : [];
  // Stored newest-first via LPUSH; reverse so each marker displays chronologically
  for (let i = listComments.length - 1; i >= 0; i--) {
    try {
      const c = typeof listComments[i] === "string" ? JSON.parse(listComments[i]) : listComments[i];
      if (!c || !c.markerId || !c.text) continue;
      if (!commentsByMarker[c.markerId]) commentsByMarker[c.markerId] = [];
      commentsByMarker[c.markerId].push({
        id: c.id,
        author: c.author || "Jugador",
        text: c.text,
        createdAt: c.createdAt,
        isLive: true,
      });
      totalComments++;
    } catch (_) { /* noop */ }
  }

  const activity = [];
  const listAct = Array.isArray(rawActivity) ? rawActivity : [];
  for (const item of listAct) {
    try {
      const a = typeof item === "string" ? JSON.parse(item) : item;
      if (a && a.type) activity.push(a);
    } catch (_) { /* noop */ }
  }

  return jsonResponse({
    ok: true,
    live: true,
    syncedAt: new Date().toISOString(),
    stats: {
      pins: pins.length,
      comments: totalComments,
      totalVotes,
    },
    pins,
    votes,
    comments: commentsByMarker,
    activity,
  });
}

async function handlePost(request) {
  const cfg = getRedisConfig();
  if (!cfg.configured) {
    return jsonResponse({ ok: false, live: false, error: "Base de datos en vivo no conectada todavía." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonResponse({ ok: false, error: "Cuerpo JSON inválido." }, 400);
  }

  const action = cleanText(body?.action, 30);
  const clientToken = request.headers.get("x-client-token") || cleanText(body?.clientToken, 80);
  const ownerHash = clientToken ? hashValue(clientToken) : hashValue(getClientIp(request));

  if (action === "create_pin") {
    if (!(await enforceRateLimit(request, "pin", 10))) {
      return jsonResponse({ ok: false, error: "Demasiados pines seguidos. Espera un minuto." }, 429);
    }
    const title = cleanText(body.title, 120);
    if (title.length < 2) {
      return jsonResponse({ ok: false, error: "El título del marcador debe tener al menos 2 caracteres." }, 400);
    }
    const x = Number(body.x);
    const y = Number(body.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0.5 || x > 99.5 || y < 0.5 || y > 99.5) {
      return jsonResponse({ ok: false, error: "Coordenadas fuera del mapa de Leonida." }, 400);
    }
    const category = ALLOWED_CATEGORIES.has(body.category) ? body.category : "landmark";
    const [existingCount] = await redisPipeline([["HLEN", KEYS.PINS]]);
    if (Number(existingCount) >= MAX_PINS) {
      return jsonResponse({ ok: false, error: "Límite de marcadores comunitarios alcanzado temporalmente." }, 429);
    }

    const now = new Date().toISOString();
    const id = `com-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
    const author = cleanText(body.author, 40) || "Explorador";
    const region = cleanText(body.region, 80);
    const description = cleanText(body.description, 800);
    const blip = sanitizeBlip(body.blip);
    const image = sanitizeImage(body.image);

    const record = {
      id,
      mapId: "leonida_full",
      title,
      category,
      blip,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      region,
      description,
      howTo: cleanText(body.howTo, 400),
      image,
      author,
      votes: 1,
      verified: false,
      isCommunity: true,
      createdAt: now,
      ownerHash,
    };

    const actItem = {
      type: "pin",
      markerId: id,
      title,
      region,
      author,
      blip,
      createdAt: now,
    };

    await redisPipeline([
      ["HSET", KEYS.PINS, id, JSON.stringify(record)],
      ["LPUSH", KEYS.ACTIVITY, JSON.stringify(actItem)],
      ["LTRIM", KEYS.ACTIVITY, "0", String(MAX_ACTIVITY - 1)],
    ]);

    return jsonResponse({
      ok: true,
      marker: stripOwnerMeta(record, ownerHash),
      activity: actItem,
    }, 201);
  }

  if (action === "update_pin") {
    if (!(await enforceRateLimit(request, "pin", 15))) {
      return jsonResponse({ ok: false, error: "Espera un momento antes de volver a editar." }, 429);
    }
    const id = cleanText(body.id, 80);
    if (!id.startsWith("com-")) {
      return jsonResponse({ ok: false, error: "Solo se pueden editar en vivo los pines creados por la comunidad." }, 403);
    }
    const [rawExisting] = await redisPipeline([["HGET", KEYS.PINS, id]]);
    if (!rawExisting) {
      return jsonResponse({ ok: false, error: "Marcador comunitario no encontrado." }, 404);
    }
    const existing = typeof rawExisting === "string" ? JSON.parse(rawExisting) : rawExisting;
    if (existing.ownerHash && existing.ownerHash !== ownerHash) {
      return jsonResponse({ ok: false, error: "Solo quien creó este marcador puede editarlo en vivo." }, 403);
    }

    const title = cleanText(body.title, 120) || existing.title;
    const x = Number.isFinite(Number(body.x)) ? Math.max(0.5, Math.min(99.5, Number(body.x))) : existing.x;
    const y = Number.isFinite(Number(body.y)) ? Math.max(0.5, Math.min(99.5, Number(body.y))) : existing.y;
    const updated = {
      ...existing,
      title,
      category: ALLOWED_CATEGORIES.has(body.category) ? body.category : existing.category,
      blip: body.blip ? sanitizeBlip(body.blip) : existing.blip,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      region: cleanText(body.region, 80) || existing.region,
      description: cleanText(body.description, 800),
      author: cleanText(body.author, 40) || existing.author,
      image: body.image !== undefined ? sanitizeImage(body.image) : existing.image,
      updatedAt: new Date().toISOString(),
    };

    await redisPipeline([["HSET", KEYS.PINS, id, JSON.stringify(updated)]]);
    return jsonResponse({ ok: true, marker: stripOwnerMeta(updated, ownerHash) });
  }

  if (action === "delete_pin") {
    const id = cleanText(body.id, 80);
    if (!id.startsWith("com-")) {
      return jsonResponse({ ok: false, error: "Los pines de la Guía Oficial no se pueden eliminar del mapa compartido." }, 403);
    }
    const [rawExisting] = await redisPipeline([["HGET", KEYS.PINS, id]]);
    if (!rawExisting) {
      return jsonResponse({ ok: false, error: "Marcador comunitario no encontrado." }, 404);
    }
    const existing = typeof rawExisting === "string" ? JSON.parse(rawExisting) : rawExisting;
    if (existing.ownerHash && existing.ownerHash !== ownerHash) {
      return jsonResponse({ ok: false, error: "Solo el autor de este marcador puede eliminarlo del mapa compartido." }, 403);
    }
    await redisPipeline([["HDEL", KEYS.PINS, id]]);
    return jsonResponse({ ok: true, deletedId: id });
  }

  if (action === "vote") {
    if (!(await enforceRateLimit(request, "vote", 30))) {
      return jsonResponse({ ok: false, error: "Demasiados votos seguidos. Espera un momento." }, 429);
    }
    const markerId = cleanText(body.markerId, 80);
    if (!markerId || !/^[a-z0-9_-]+$/i.test(markerId)) {
      return jsonResponse({ ok: false, error: "ID de marcador inválido." }, 400);
    }
    const votedKey = `atlas:voted:${markerId}`;
    const [added] = await redisPipeline([["SADD", votedKey, ownerHash]]);
    if (Number(added) === 0) {
      const [curDelta] = await redisPipeline([["HGET", KEYS.VOTES, markerId]]);
      return jsonResponse({
        ok: true,
        alreadyVoted: true,
        votesDelta: parseInt(curDelta, 10) || 0,
      });
    }
    const [newDelta] = await redisPipeline([["HINCRBY", KEYS.VOTES, markerId, "1"]]);
    return jsonResponse({
      ok: true,
      alreadyVoted: false,
      votesDelta: parseInt(newDelta, 10) || 1,
    });
  }

  if (action === "comment") {
    if (!(await enforceRateLimit(request, "comment", 12))) {
      return jsonResponse({ ok: false, error: "Demasiadas notas en poco tiempo. Espera un minuto." }, 429);
    }
    const markerId = cleanText(body.markerId, 80);
    const markerTitle = cleanText(body.markerTitle, 120) || markerId;
    const text = cleanText(body.text, 400);
    const author = cleanText(body.author, 40) || "Explorador";
    if (!markerId || !/^[a-z0-9_-]+$/i.test(markerId)) {
      return jsonResponse({ ok: false, error: "ID de marcador inválido." }, 400);
    }
    if (text.length < 2) {
      return jsonResponse({ ok: false, error: "Escribe al menos 2 caracteres en tu nota." }, 400);
    }
    const now = new Date().toISOString();
    const comment = {
      id: `cmt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString("hex")}`,
      markerId,
      author,
      text,
      createdAt: now,
    };
    const actItem = {
      type: "comment",
      markerId,
      title: markerTitle,
      author,
      text: text.slice(0, 120),
      createdAt: now,
    };

    await redisPipeline([
      ["LPUSH", KEYS.COMMENTS, JSON.stringify(comment)],
      ["LTRIM", KEYS.COMMENTS, "0", String(MAX_COMMENTS - 1)],
      ["LPUSH", KEYS.ACTIVITY, JSON.stringify(actItem)],
      ["LTRIM", KEYS.ACTIVITY, "0", String(MAX_ACTIVITY - 1)],
    ]);

    return jsonResponse({ ok: true, comment: { ...comment, isLive: true }, activity: actItem }, 201);
  }

  return jsonResponse({ ok: false, error: `Acción desconocida: ${action}` }, 400);
}

export default {
  async fetch(request) {
    try {
      if (request.method === "GET") {
        return await handleGet(request);
      }
      if (request.method === "POST") {
        return await handlePost(request);
      }
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204 });
      }
      return jsonResponse({ ok: false, error: "Method Not Allowed" }, 405);
    } catch (err) {
      console.error("[api/community] error:", err);
      return jsonResponse({ ok: false, error: "Error temporal al conectar con la comunidad en vivo." }, 500);
    }
  },
};
