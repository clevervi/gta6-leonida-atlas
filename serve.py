"""
GTA 6 Community Map & Collectibles Tracker — Local Backend Server
-----------------------------------------------------------------
Run: python serve.py
Opens at http://127.0.0.1:8765 (override port via PORT env var).
Strictly serves and writes files ONLY inside this project directory;
never reads or modifies the original game dump folder.
"""
import base64
import datetime
import json
import os
import re
import threading
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

PROJECT_ROOT = Path(__file__).resolve().parent
WEB_DIR = PROJECT_ROOT / "web"
DATA_DIR = PROJECT_ROOT / "data"
EXTRACTED_DIR = PROJECT_ROOT / "extracted"

MARKERS_FILE = DATA_DIR / "community_markers.json"
PROGRESS_FILE = DATA_DIR / "user_progress.json"
MANIFEST_FILE = DATA_DIR / "game_assets_manifest.json"
EVENTS_FILE = DATA_DIR / "events.json"
EXTRACTED_INDEX_FILE = DATA_DIR / "extracted_index.json"
CUSTOM_MAP_META = DATA_DIR / "custom_map_meta.json"

STATE_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def read_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


def load_markers_doc() -> dict:
    doc = read_json(MARKERS_FILE, {"version": 2, "updatedAt": utc_now(), "markers": []})
    if not isinstance(doc, dict) or not isinstance(doc.get("markers"), list):
        doc = {"version": 2, "updatedAt": utc_now(), "markers": []}
    return doc


def load_progress_doc() -> dict:
    doc = read_json(PROGRESS_FILE, {"foundMarkers": [], "foundCollectibles": [], "completedEvents": [], "unlockedTrophies": [], "updatedAt": utc_now()})
    if not isinstance(doc, dict):
        doc = {"foundMarkers": [], "foundCollectibles": [], "completedEvents": [], "unlockedTrophies": [], "updatedAt": utc_now()}
    doc.setdefault("foundMarkers", [])
    doc.setdefault("foundCollectibles", [])
    doc.setdefault("completedEvents", [])
    doc.setdefault("unlockedTrophies", [])
    return doc


class CommunityMapHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Keep console readable
        super().log_message(fmt, *args)

    def translate_path(self, path: str) -> str:
        parsed = unquote(urlparse(path).path)
        if parsed == "/" or parsed == "":
            return str(WEB_DIR / "index.html")
        if parsed.startswith("/data/"):
            rel = parsed[len("/data/"):].lstrip("/")
            target = (DATA_DIR / rel).resolve()
            if str(target).startswith(str(DATA_DIR.resolve())):
                return str(target)
            return str(WEB_DIR / "404")
        if parsed.startswith("/extracted/"):
            rel = parsed[len("/extracted/"):].lstrip("/")
            target = (EXTRACTED_DIR / rel).resolve()
            if str(target).startswith(str(EXTRACTED_DIR.resolve())):
                return str(target)
            return str(WEB_DIR / "404")
        rel = parsed.lstrip("/")
        target = (WEB_DIR / rel).resolve()
        if str(target).startswith(str(WEB_DIR.resolve())):
            return str(target)
        return str(WEB_DIR / "404")

    def _read_body_json(self, max_bytes: int = 25 * 1024 * 1024) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        if length > max_bytes:
            raise ValueError(f"Payload too large ({length} bytes)")
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def _send_json(self, code: int, obj: dict):
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def end_headers(self):
        parsed = urlparse(self.path).path
        if parsed.startswith("/extracted/"):
            self.send_header("Cache-Control", "public, max-age=3600")
        elif not parsed.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/assets":
            manifest = read_json(MANIFEST_FILE, {"maps": [], "branding": {}, "blips": [], "collectibles": []})
            custom_meta = read_json(CUSTOM_MAP_META, None)
            if custom_meta and (DATA_DIR / custom_meta.get("filename", "")).exists():
                for m in manifest.get("maps", []):
                    if m.get("id") == "leonida_custom":
                        m["customFile"] = f"/data/{custom_meta['filename']}?t={custom_meta.get('ts', '')}"
                        m["customName"] = custom_meta.get("originalName", "Mapa Personalizado")
                        if custom_meta.get("width") and custom_meta.get("height"):
                            m["customWidth"] = custom_meta["width"]
                            m["customHeight"] = custom_meta["height"]
            self._send_json(200, manifest)
            return

        if path == "/api/events":
            ev_doc = read_json(EVENTS_FILE, {"guide100": {}, "events": []})
            self._send_json(200, ev_doc)
            return

        if path == "/api/gallery":
            idx = read_json(EXTRACTED_INDEX_FILE, {})
            self._send_json(200, idx)
            return

        if path == "/api/markers":
            qs = parse_qs(parsed.query)
            map_filter = qs.get("mapId", [None])[0]
            with STATE_LOCK:
                doc = load_markers_doc()
            markers = doc["markers"]
            if map_filter:
                markers = [m for m in markers if m.get("mapId") == map_filter]
            self._send_json(200, {"version": doc.get("version", 2), "updatedAt": doc.get("updatedAt"), "markers": markers})
            return

        if path == "/api/progress":
            with STATE_LOCK:
                doc = load_progress_doc()
            self._send_json(200, doc)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            # Create single marker
            if path == "/api/markers":
                body = self._read_body_json()
                title = str(body.get("title", "")).strip()
                if not title:
                    raise ValueError("El titulo del pin es obligatorio.")
                map_id = str(body.get("mapId", "leonida_full")).strip() or "leonida_full"
                x = float(body.get("x", 50))
                y = float(body.get("y", 50))
                marker = {
                    "id": str(body.get("id") or f"usr-{uuid.uuid4().hex[:8]}"),
                    "mapId": map_id,
                    "title": title[:120],
                    "category": str(body.get("category", "landmark")).strip()[:40],
                    "blip": str(body.get("blip", "blip_pin")).strip()[:60],
                    "x": round(max(0.0, min(100.0, x)), 2),
                    "y": round(max(0.0, min(100.0, y)), 2),
                    "region": str(body.get("region", "")).strip()[:80],
                    "description": str(body.get("description", "")).strip()[:1000],
                    "image": str(body.get("image", "")).strip()[:400],
                    "source_tex": str(body.get("source_tex", "Comunidad")).strip()[:60],
                    "author": str(body.get("author", "Jugador")).strip()[:50] or "Jugador",
                    "votes": int(body.get("votes", 1)),
                    "verified": bool(body.get("verified", False)),
                    "createdAt": utc_now(),
                    "comments": [],
                }
                with STATE_LOCK:
                    doc = load_markers_doc()
                    doc["markers"].append(marker)
                    doc["updatedAt"] = utc_now()
                    write_json(MARKERS_FILE, doc)
                self._send_json(201, {"ok": True, "marker": marker})
                return

            # Upvote marker
            m_vote = re.fullmatch(r"/api/markers/([^/]+)/vote", path)
            if m_vote:
                mid = unquote(m_vote.group(1))
                with STATE_LOCK:
                    doc = load_markers_doc()
                    found = next((m for m in doc["markers"] if m.get("id") == mid), None)
                    if not found:
                        self._send_json(404, {"ok": False, "error": "Marcador no encontrado"})
                        return
                    found["votes"] = int(found.get("votes", 0)) + 1
                    doc["updatedAt"] = utc_now()
                    write_json(MARKERS_FILE, doc)
                self._send_json(200, {"ok": True, "marker": found})
                return

            # Add comment to marker
            m_comm = re.fullmatch(r"/api/markers/([^/]+)/comments", path)
            if m_comm:
                mid = unquote(m_comm.group(1))
                body = self._read_body_json()
                text = str(body.get("text", "")).strip()
                author = str(body.get("author", "Jugador")).strip()[:40] or "Jugador"
                if not text:
                    raise ValueError("El comentario no puede estar vacio.")
                comment = {"author": author, "text": text[:500], "createdAt": utc_now()}
                with STATE_LOCK:
                    doc = load_markers_doc()
                    found = next((m for m in doc["markers"] if m.get("id") == mid), None)
                    if not found:
                        self._send_json(404, {"ok": False, "error": "Marcador no encontrado"})
                        return
                    found.setdefault("comments", []).append(comment)
                    doc["updatedAt"] = utc_now()
                    write_json(MARKERS_FILE, doc)
                self._send_json(201, {"ok": True, "comment": comment, "marker": found})
                return

            # Bulk save / import markers
            if path == "/api/save-markers":
                body = self._read_body_json()
                if not isinstance(body, dict) or not isinstance(body.get("markers"), list):
                    raise ValueError("El JSON debe contener una lista 'markers'.")
                with STATE_LOCK:
                    doc = {
                        "version": 2,
                        "updatedAt": utc_now(),
                        "markers": body["markers"],
                    }
                    write_json(MARKERS_FILE, doc)
                self._send_json(200, {"ok": True, "saved_count": len(doc["markers"])})
                return

            # Save user checklist progress (found markers + found collectibles + completed events + trophies)
            if path == "/api/progress":
                body = self._read_body_json()
                found_markers = sorted({str(x) for x in body.get("foundMarkers", []) if x})
                found_colls = sorted({str(x) for x in body.get("foundCollectibles", []) if x})
                completed_events = sorted({str(x) for x in body.get("completedEvents", []) if x})
                unlocked_trophies = sorted({str(x) for x in body.get("unlockedTrophies", []) if x})
                with STATE_LOCK:
                    doc = {
                        "foundMarkers": found_markers,
                        "foundCollectibles": found_colls,
                        "completedEvents": completed_events,
                        "unlockedTrophies": unlocked_trophies,
                        "updatedAt": utc_now(),
                    }
                    write_json(PROGRESS_FILE, doc)
                self._send_json(200, {"ok": True, "progress": doc})
                return

            # Upload custom Leonida map image (base64 data URL)
            if path == "/api/custom-map":
                body = self._read_body_json(max_bytes=20 * 1024 * 1024)
                data_url = str(body.get("dataUrl", ""))
                orig_name = str(body.get("name", "leonida_custom.png"))[:120]
                m = re.match(r"^data:image/(png|jpeg|jpg|webp);base64,(.+)$", data_url, flags=re.IGNORECASE)
                if not m:
                    raise ValueError("Formato de imagen invalido. Usa PNG, JPG o WEBP.")
                ext = "jpg" if m.group(1).lower() in ("jpeg", "jpg") else m.group(1).lower()
                raw_img = base64.b64decode(m.group(2))
                filename = f"custom_leonida_map.{ext}"
                with STATE_LOCK:
                    for old_ext in ("png", "jpg", "webp"):
                        old_p = DATA_DIR / f"custom_leonida_map.{old_ext}"
                        if old_p.exists() and old_p.name != filename:
                            old_p.unlink(missing_ok=True)
                    (DATA_DIR / filename).write_bytes(raw_img)
                    meta = {
                        "filename": filename,
                        "originalName": orig_name,
                        "width": int(body.get("width", 0) or 0),
                        "height": int(body.get("height", 0) or 0),
                        "ts": str(int(datetime.datetime.now().timestamp())),
                    }
                    write_json(CUSTOM_MAP_META, meta)
                self._send_json(200, {"ok": True, "url": f"/data/{filename}?t={meta['ts']}", "meta": meta})
                return

            self._send_json(404, {"ok": False, "error": "Endpoint API no encontrado"})
        except Exception as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})

    def do_PUT(self):
        parsed = urlparse(self.path)
        m_upd = re.fullmatch(r"/api/markers/([^/]+)", parsed.path)
        if not m_upd:
            self._send_json(404, {"ok": False, "error": "Endpoint no encontrado"})
            return
        try:
            mid = unquote(m_upd.group(1))
            body = self._read_body_json()
            with STATE_LOCK:
                doc = load_markers_doc()
                found = next((m for m in doc["markers"] if m.get("id") == mid), None)
                if not found:
                    self._send_json(404, {"ok": False, "error": "Marcador no encontrado"})
                    return
                for field in ("title", "category", "blip", "region", "description", "image", "guideInfo", "reward", "howToStart"):
                    if field in body:
                        found[field] = str(body[field]).strip()
                if "x" in body:
                    found["x"] = round(max(0.0, min(100.0, float(body["x"]))), 2)
                if "y" in body:
                    found["y"] = round(max(0.0, min(100.0, float(body["y"]))), 2)
                doc["updatedAt"] = utc_now()
                write_json(MARKERS_FILE, doc)
            self._send_json(200, {"ok": True, "marker": found})
        except Exception as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/custom-map":
            with STATE_LOCK:
                for ext in ("png", "jpg", "webp"):
                    (DATA_DIR / f"custom_leonida_map.{ext}").unlink(missing_ok=True)
                CUSTOM_MAP_META.unlink(missing_ok=True)
            self._send_json(200, {"ok": True})
            return

        m_del = re.fullmatch(r"/api/markers/([^/]+)", path)
        if m_del:
            mid = unquote(m_del.group(1))
            with STATE_LOCK:
                doc = load_markers_doc()
                before = len(doc["markers"])
                doc["markers"] = [m for m in doc["markers"] if m.get("id") != mid]
                if len(doc["markers"]) == before:
                    self._send_json(404, {"ok": False, "error": "Marcador no encontrado"})
                    return
                doc["updatedAt"] = utc_now()
                write_json(MARKERS_FILE, doc)
            self._send_json(200, {"ok": True, "deleted": mid})
            return

        self._send_json(404, {"ok": False, "error": "Endpoint no encontrado"})


def main():
    port = int(os.environ.get("PORT", "8765"))
    server = ThreadingHTTPServer(("127.0.0.1", port), CommunityMapHandler)
    print(f"GTA 6 Community Map & Collectibles Tracker running at http://127.0.0.1:{port}")
    print(f"Project root: {PROJECT_ROOT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


if __name__ == "__main__":
    main()
