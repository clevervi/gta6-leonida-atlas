/* ==========================================================================
   GTA VI — Atlas y Guía Interactiva de Leonida
   Mapa Completo · Eventos y Extraños y Locos · Guía y Trofeos · Coleccionables · Arsenal
   Compatible con despliegue estático en Vercel (localStorage) y servidor local
   ========================================================================== */

(() => {
  "use strict";

  const LS_PROGRESS = "gta6_atlas_progress_v2";
  const LS_USER_PINS = "gta6_atlas_user_pins_v2";

  const CATEGORIES = {
    event:       { label: "Eventos",    blip: "blip_contact" },
    landmark:    { label: "Lugares",    blip: "blip_landmark" },
    collectible: { label: "Botín",      blip: "blip_collectible" },
    secret:      { label: "Secretos",   blip: "blip_secret" },
    weapon:      { label: "Armas",      blip: "blip_weapon" },
    heist:       { label: "Golpes",     blip: "blip_heist" },
    property:    { label: "Moteles",    blip: "blip_motel" },
    vehicle:     { label: "Vehículos",  blip: "blip_vehicle" },
    activity:    { label: "Carreras",   blip: "blip_race" },
    food:        { label: "Comida",     blip: "blip_food" },
    nightlife:   { label: "Clubs",      blip: "blip_nightclub" },
    commerce:    { label: "Tiendas",    blip: "blip_shop" },
    service:     { label: "Talleres",   blip: "blip_garage" },
    wildlife:    { label: "Fauna",      blip: "blip_wildlife" },
    law:         { label: "Policía",    blip: "blip_police" },
    navigation:  { label: "Radar",      blip: "blip_radar" },
  };

  const EVENT_TYPES = [
    { id: "all",      label: "Todos",              blip: "blip_contact" },
    { id: "stranger", label: "Extraños y Peristas",blip: "logo_bigfoot" },
    { id: "random",   label: "Eventos Aleatorios", blip: "blip_mystery_rooster" },
    { id: "hunting",  label: "Caza Legendaria",    blip: "blip_hunting" },
    { id: "activity", label: "Actividades 100%",   blip: "blip_race" },
    { id: "secret",   label: "Secretos",           blip: "blip_secret" },
  ];

  const EVENT_TYPE_LABEL = {
    stranger: "Extraños / Perista",
    random:   "Evento Aleatorio",
    hunting:  "Caza Legendaria",
    activity: "Actividad 100%",
    secret:   "Secreto",
  };

  const MECH_CATEGORIES = [
    { id: "all",     label: "Todos los Manuales" },
    { id: "combat",  label: "Armas y Combate" },
    { id: "money",   label: "Dinero y Robos" },
    { id: "explore", label: "Caza y 100%" },
    { id: "atlas",   label: "Uso del Atlas" },
  ];

  const TROPHY_CATEGORIES = [
    { id: "all",       label: "Todos" },
    { id: "missable",  label: "Perdibles" },
    { id: "strangers", label: "Extraños y Locos" },
    { id: "explore",   label: "Exploración y 100%" },
    { id: "combat",    label: "Combate y Robos" },
    { id: "story",     label: "Historia" },
  ];

  const COLL_CATEGORIES = [
    { id: "all",       label: "Todos",      blip: "blip_collectible" },
    { id: "medals",    label: "Medallas",   blip: "blip_chest" },
    { id: "cards",     label: "Cartas",     blip: "blip_cards" },
    { id: "comics",    label: "Cómics",     blip: "blip_diamond" },
    { id: "secrets",   label: "Secretos",   blip: "blip_secret" },
    { id: "wildlife",  label: "Fauna",      blip: "blip_wildlife" },
    { id: "locations", label: "Locaciones", blip: "blip_landmark" },
    { id: "vehicles",  label: "Vehículos",  blip: "blip_vehicle" },
  ];

  const COLL_CAT_LABEL = Object.fromEntries(COLL_CATEGORIES.map((c) => [c.id, c.label]));

  const ARSENAL_CATEGORIES = [
    { id: "all",       label: "Todo" },
    { id: "firearms",  label: "Armas de Fuego" },
    { id: "sidearms",  label: "Pistolas" },
    { id: "heavy",     label: "Pesadas" },
    { id: "gear",      label: "Equipo / Melee" },
    { id: "supercars", label: "Superdeportivos" },
    { id: "muscle",    label: "Muscle" },
    { id: "classics",  label: "Clásicos" },
    { id: "luxury",    label: "Lujo" },
    { id: "offroad",   label: "Off-Road" },
    { id: "bikes",     label: "Motos" },
    { id: "aircraft",  label: "Aeronaves" },
    { id: "boats",     label: "Náutica" },
    { id: "military",  label: "Policía / Militar" },
    { id: "plates",    label: "Matrículas" },
  ];

  const ARSENAL_CAT_MAP = Object.fromEntries(ARSENAL_CATEGORIES.map((c) => [c.id, c.label]));
  const WEAPON_CATS = new Set(["firearms", "sidearms", "heavy", "gear"]);

  const BLIP_GROUPS = [
    { id: "wordmarks",  label: "Distritos y Condados" },
    { id: "all",        label: "Todos los Iconos" },
    { id: "badges",     label: "Insignias Policiales" },
    { id: "logos",      label: "Emblemas y Locales" },
    { id: "collectible",label: "Coleccionables" },
    { id: "landmark",   label: "Lugares" },
    { id: "weapon",     label: "Armas" },
    { id: "vehicle",    label: "Vehículos" },
    { id: "property",   label: "Propiedades" },
    { id: "commerce",   label: "Comercio" },
    { id: "activity",   label: "Actividades" },
    { id: "nightlife",  label: "Vida Nocturna" },
    { id: "wildlife",   label: "Fauna" },
    { id: "secret",     label: "Secretos" },
    { id: "heist",      label: "Golpes" },
    { id: "navigation", label: "Radar / GPS" },
  ];

  const LEONIDA_REGIONS = [
    { id: "all",           name: "Leonida",       sec: "5 CONDADOS", blip: "logo_visit_leonida", fit: true, wordmarkId: null },
    { id: "vice_city",     name: "Vice City",     sec: "G-7",        blip: "blip_vice_day",      x: 76.2, y: 52.0, zoom: 4.6, wordmarkId: "wm_vicedale_county" },
    { id: "port_gellhorn", name: "Port Gellhorn", sec: "E-3",        blip: "badge_pgpd",         x: 32.9, y: 40.0, zoom: 4.1, wordmarkId: "wm_kelly_county" },
    { id: "lummox",        name: "Mt. Kalaga",    sec: "B-5",        blip: "blip_hunting",       x: 52.7, y: 18.5, zoom: 3.5, wordmarkId: "wm_lummox_county" },
    { id: "leonard",       name: "Ambrosia",      sec: "E-6",        blip: "logo_ambrosia_mc",   x: 65.5, y: 34.8, zoom: 3.9, wordmarkId: "wm_leonard_county" },
    { id: "mariana",       name: "Grassrivers",   sec: "I-5",        blip: "blip_gator",         x: 50.0, y: 65.2, zoom: 3.8, wordmarkId: "wm_mariana_county" },
    { id: "keys",          name: "Leonida Keys",  sec: "L-5",        blip: "blip_boat",          x: 43.6, y: 84.7, zoom: 3.5, wordmarkId: "wm_key_lento" },
  ];

  const state = {
    manifest: { maps: [], branding: {}, wordmarks: {}, blips: [], collectibles: [], arsenal: [] },
    blipFileMap: new Map(),
    events: [],
    guide100: null,
    guides: { roadmap: null, mechanics: [], trophies: [] },
    baseMarkers: [],
    markers: [],
    userPins: { added: [], overrides: {}, deleted: [], votes: {}, comments: {} },
    foundMarkers: new Set(),
    foundCollectibles: new Set(),
    completedEvents: new Set(),
    unlockedTrophies: new Set(),
    hasLocalApi: false,

    activeView: "map",
    activeMapId: "leonida_full",
    activeRegionId: "all",
    mapTheme: "night",
    selectedMarkerId: null,
    highlightedEventId: null,
    highlightedGuideId: null,

    enabledCategories: new Set(Object.keys(CATEGORIES)),
    searchQuery: "",
    hideFound: false,
    showLabels: false,
    showPins: true,

    // Map viewport transform & canvas tile engine
    imgW: 5395,
    imgH: 7521,
    pxPerMile: 600,
    vpW: 960,
    vpH: 640,
    dpr: 1,
    vpRect: null,
    mapInitialized: false,
    scale: 0.1,
    fitScale: 0.1,
    tx: 0,
    ty: 0,
    rafId: 0,
    tweenRafId: 0,
    wordmarkTimer: null,
    dragging: false,
    minimapDragging: false,
    dragMoved: 0,
    dragStartX: 0,
    dragStartY: 0,
    dragOrigTx: 0,
    dragOrigTy: 0,
    pointers: new Map(),
    lastPinchDist: 0,
    lastPinchMidX: 0,
    lastPinchMidY: 0,
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
    pendingDeepLink: null,
    pinNodes: [],
    reticleCoords: null,
    lastZoomText: "",
    lastGridText: "",
    lastCoordsText: "",
    hoverClientX: null,
    hoverClientY: null,
    hoverRafId: 0,

    // Lazy-rendered secondary tabs (slashes initial DOM size & RAM by ~85%)
    renderedViews: new Set(["map"]),

    // Placement & GPS Route Measure modes
    placing: false,
    measuring: false,
    routePoints: [],
    preferredBlip: "blip_pin",
    modalSelectedBlip: "blip_pin",

    // Global search command palette
    cmdItems: [],
    cmdActiveIdx: 0,

    // Sub-view filters
    eventType: "all",
    eventSearch: "",
    eventsOnlyPending: false,
    mechCat: "all",
    trophyCat: "all",
    trophySearch: "",
    trophiesOnlyPending: false,
    collCat: "all",
    collSearch: "",
    collOnlyPending: false,
    arsenalCat: "all",
    arsenalSearch: "",
    blipGroup: "wordmarks",
  };

  function norm(str) {
    return String(str ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function coordsToGridSector(xPct, yPct) {
    const colIdx = Math.max(0, Math.min(8, Math.floor((xPct / 100) * 9)));
    const rowIdx = Math.max(0, Math.min(12, Math.floor((yPct / 100) * 13)));
    return `${String.fromCharCode(65 + rowIdx)}-${colIdx + 1}`;
  }

  function guessCountyLabel(xPct, yPct) {
    const sec = coordsToGridSector(xPct, yPct);
    if (yPct < 26.5) return `Lummox County · Sector ${sec}`;
    if (yPct > 73.0) return `Leonida Keys · Sector ${sec}`;
    if (yPct > 58.0 && xPct < 54.5) return `Mariana County · Sector ${sec}`;
    if (xPct < 52.0 && yPct <= 58.0) return `Kelly County · Sector ${sec}`;
    if (yPct < 42.5) return `Leonard County · Sector ${sec}`;
    return `Vice-Dale County · Sector ${sec}`;
  }

  const $ = (id) => document.getElementById(id);

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function blipUrl(blipId) {
    if (!blipId) return state.blipFileMap.get("blip_pin") || "/extracted/blips/blip_pin.png";
    if (blipId.startsWith("/")) return blipId;
    const clean = blipId.replace(/\.(png|webp)$/i, "");
    return state.blipFileMap.get(clean) || `/extracted/blips/${clean}.png`;
  }

  function wordmarkUrl(wmId) {
    if (!wmId) return null;
    if (wmId.startsWith("/")) return wmId;
    return state.manifest.wordmarks?.[wmId]?.file || `/extracted/wordmarks/${wmId}.png`;
  }

  function toast(msg, isError = false) {
    const el = document.createElement("div");
    el.className = `toast${isError ? " error" : ""}`;
    el.textContent = msg;
    $("toast-stack").appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }

  function showZoneWordmark(url) {
    const box = $("zone-wordmark-toast");
    const img = $("zone-wordmark-img");
    if (!box || !img) return;
    if (state.wordmarkTimer) {
      clearTimeout(state.wordmarkTimer);
      state.wordmarkTimer = null;
    }
    if (!url) {
      box.classList.remove("is-visible");
      box.classList.add("hidden");
      return;
    }
    img.src = url;
    box.classList.remove("hidden");
    requestAnimationFrame(() => box.classList.add("is-visible"));
    state.wordmarkTimer = setTimeout(() => {
      box.classList.remove("is-visible");
      state.wordmarkTimer = setTimeout(() => {
        box.classList.add("hidden");
        state.wordmarkTimer = null;
      }, 380);
    }, 2200);
  }

  async function api(url, opts = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  async function fetchStaticFirst(staticUrl, apiFallbackUrl) {
    try {
      const res = await fetch(staticUrl);
      if (res.ok) return await res.json();
    } catch (_) {
      // ignore and try fallback
    }
    if (apiFallbackUrl) {
      return await api(apiFallbackUrl);
    }
    throw new Error(`No se pudo cargar ${staticUrl}`);
  }

  // =========================================================================
  // LOCALSTORAGE + OPTIONAL LOCAL API PERSISTENCE (100% VERCEL READY)
  // =========================================================================
  function loadLocalState() {
    try {
      const p = JSON.parse(localStorage.getItem(LS_PROGRESS) || "null");
      if (p && typeof p === "object") {
        state.foundMarkers = new Set(p.foundMarkers || []);
        state.foundCollectibles = new Set(p.foundCollectibles || []);
        state.completedEvents = new Set(p.completedEvents || []);
        state.unlockedTrophies = new Set(p.unlockedTrophies || []);
      }
    } catch (_) { /* noop */ }

    try {
      const u = JSON.parse(localStorage.getItem(LS_USER_PINS) || "null");
      if (u && typeof u === "object") {
        state.userPins = {
          added: Array.isArray(u.added) ? u.added : [],
          overrides: u.overrides && typeof u.overrides === "object" ? u.overrides : {},
          deleted: Array.isArray(u.deleted) ? u.deleted : [],
          votes: u.votes && typeof u.votes === "object" ? u.votes : {},
          comments: u.comments && typeof u.comments === "object" ? u.comments : {},
        };
      }
    } catch (_) { /* noop */ }
  }

  function saveLocalUserPins() {
    try {
      localStorage.setItem(LS_USER_PINS, JSON.stringify(state.userPins));
    } catch (_) { /* noop */ }
  }

  function rebuildMergedMarkers() {
    const delSet = new Set(state.userPins.deleted || []);
    const merged = [];

    for (const base of state.baseMarkers) {
      if (delSet.has(base.id)) continue;
      const ov = state.userPins.overrides?.[base.id];
      const m = ov ? { ...base, ...ov } : { ...base };
      const extraVotes = Number(state.userPins.votes?.[base.id] || 0);
      m.votes = Number(m.votes || 0) + extraVotes;
      const extraComms = state.userPins.comments?.[base.id] || [];
      m.comments = [...(base.comments || []), ...extraComms];
      merged.push(m);
    }

    for (const added of state.userPins.added || []) {
      if (delSet.has(added.id)) continue;
      const ov = state.userPins.overrides?.[added.id];
      const m = ov ? { ...added, ...ov } : { ...added };
      const extraVotes = Number(state.userPins.votes?.[added.id] || 0);
      m.votes = Number(m.votes || 0) + extraVotes;
      const extraComms = state.userPins.comments?.[added.id] || [];
      m.comments = [...(added.comments || []), ...extraComms];
      merged.push(m);
    }

    state.markers = merged;
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  async function init() {
    try {
      const isLocalHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);

      const [manifest, markersDoc, eventsDoc, guidesDoc] = await Promise.all([
        fetchStaticFirst("/data/assets.json", isLocalHost ? "/api/assets" : null),
        fetchStaticFirst("/data/markers.json", isLocalHost ? "/api/markers" : null),
        fetchStaticFirst("/data/events.json", isLocalHost ? "/api/events" : null),
        fetchStaticFirst("/data/guides.json", null).catch(() => ({ roadmap: null, mechanics: [], trophies: [] })),
      ]);

      state.manifest = manifest;
      state.blipFileMap = new Map((manifest.blips || []).map((b) => [b.id, b.file]));
      state.baseMarkers = markersDoc.markers || [];
      state.events = eventsDoc.events || [];
      state.guide100 = eventsDoc.guide100 || null;
      state.guides = {
        roadmap: guidesDoc?.roadmap || null,
        mechanics: guidesDoc?.mechanics || [],
        trophies: guidesDoc?.trophies || [],
      };

      loadLocalState();

      // When running on local serve.py (port 8765), also sync with local API cleanly
      if (isLocalHost && window.location.port === "8765") {
        try {
          const res = await fetch("/api/progress");
          if (res.ok) {
            const pdoc = await res.json();
            state.hasLocalApi = true;
            for (const x of pdoc.foundMarkers || []) state.foundMarkers.add(x);
            for (const x of pdoc.foundCollectibles || []) state.foundCollectibles.add(x);
            for (const x of pdoc.completedEvents || []) state.completedEvents.add(x);
            for (const x of pdoc.unlockedTrophies || []) state.unlockedTrophies.add(x);
          }
        } catch (_) {
          state.hasLocalApi = false;
        }
      }

      if (state.hasLocalApi) {
        state.markers = state.baseMarkers.map((m) => ({ ...m }));
      } else {
        rebuildMergedMarkers();
      }

      // Auto-collapse sidebar on small mobile viewports so the map is immediately visible
      if (window.innerWidth <= 860) {
        $("sidebar").classList.add("collapsed");
      }

      populateModalSelects();
      bindEvents();
      renderRegionBar();
      renderCategoryFilters();

      const qp = new URLSearchParams(window.location.search);
      const qRegion = qp.get("region");
      const qPin = qp.get("pin");
      const qZoom = parseFloat(qp.get("zoom") || "");
      const qTheme = qp.get("theme");
      const qRoute = qp.get("route");
      const qView = qp.get("view");
      const qBlips = qp.get("blips");
      const qArsenal = qp.get("arsenal");
      const qEventType = qp.get("type");
      const qEventId = qp.get("event");
      const qSearch = qp.get("search");

      if (qBlips && BLIP_GROUPS.some((g) => g.id === qBlips)) {
        state.blipGroup = qBlips;
      }
      if (qArsenal && ARSENAL_CATEGORIES.some((c) => c.id === qArsenal)) {
        state.arsenalCat = qArsenal;
      }
      if (qEventType && EVENT_TYPES.some((t) => t.id === qEventType)) {
        state.eventType = qEventType;
      }
      if (qEventId) {
        state.highlightedEventId = qEventId;
      }

      const savedTheme = localStorage.getItem("gta6_map_theme");
      state.mapTheme = (qTheme === "day" || qTheme === "night")
        ? qTheme
        : (savedTheme === "day" || savedTheme === "night" ? savedTheme : "night");

      state.activeMapId = state.manifest.maps[0]?.id || "leonida_full";
      state.pendingDeepLink = {
        region: qRegion,
        pin: qPin,
        zoom: Number.isFinite(qZoom) ? qZoom : null,
        route: qRoute,
      };

      loadFullLeonidaMap();
      updateGlobalProgressCounters();

      if (qView && ["map", "events", "guide", "collectibles", "arsenal", "blips"].includes(qView)) {
        switchView(qView);
      } else if (qEventId) {
        switchView("events");
      }
      if (qSearch) {
        openGlobalSearch(qSearch);
      }

      // Register PWA Service Worker for instant cached repeat opens
      if ("serviceWorker" in navigator && window.location.protocol === "https:") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    } catch (err) {
      console.error(err);
      toast(`Error al inicializar la guía: ${err.message}`, true);
    }
  }

  function populateModalSelects() {
    const catSel = $("pin-category");
    catSel.innerHTML = Object.entries(CATEGORIES)
      .map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`)
      .join("");

    const imgSel = $("pin-image-select");
    const opts = ['<option value="">Sin imagen adjunta</option>'];
    if (state.events.length) {
      opts.push('<optgroup label="Eventos y Misiones">');
      for (const ev of state.events) {
        if (ev.image) opts.push(`<option value="${esc(ev.image)}">${esc(ev.title)}</option>`);
      }
      opts.push("</optgroup>");
    }
    const colls = state.manifest.collectibles || [];
    if (colls.length) {
      opts.push('<optgroup label="Coleccionables y Lugares">');
      for (const c of colls) {
        opts.push(`<option value="${esc(c.file)}">${esc(c.title)}</option>`);
      }
      opts.push("</optgroup>");
    }
    const ars = state.manifest.arsenal || [];
    if (ars.length) {
      opts.push('<optgroup label="Arsenal, Vehiculos y Matriculas">');
      for (const a of ars) {
        opts.push(`<option value="${esc(a.file)}">${esc(a.title)}</option>`);
      }
      opts.push("</optgroup>");
    }
    imgSel.innerHTML = opts.join("");

    renderModalBlipPicker();
  }

  function renderModalBlipPicker() {
    const grid = $("blip-picker-grid");
    const mapBlips = (state.manifest.blips || []).filter((b) => b.is_map_blip);
    grid.innerHTML = mapBlips
      .map(
        (b) => `
      <button type="button" class="blip-opt${b.id === state.modalSelectedBlip ? " selected" : ""}" data-blip="${esc(b.id)}" title="${esc(b.label)}">
        <img src="${esc(b.file)}" alt="${esc(b.label)}" loading="lazy" />
      </button>`
      )
      .join("");
  }

  // =========================================================================
  // VIEW SWITCHING
  // =========================================================================
  function updateMobileBackdrop() {
    const bd = $("mobile-backdrop");
    if (!bd) return;
    const isMob = window.innerWidth <= 760;
    const sidebarOpen = !$("sidebar").classList.contains("collapsed");
    const inspOpen = !$("inspector").classList.contains("hidden");
    bd.classList.toggle("hidden", !(isMob && (sidebarOpen || inspOpen)));
  }

  function ensureViewRendered(viewName) {
    if (state.renderedViews.has(viewName)) return;
    state.renderedViews.add(viewName);
    if (viewName === "events") {
      renderGuide100Box();
      renderEventsView();
    } else if (viewName === "guide") {
      renderGuideView();
    } else if (viewName === "collectibles") {
      renderCollectiblesView();
    } else if (viewName === "arsenal") {
      renderArsenalView();
    } else if (viewName === "blips") {
      renderBlipsView();
    }
  }

  function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll(".nav-tab, .mob-tab").forEach((btn) => {
      const active = btn.dataset.view === viewName;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === `view-${viewName}`);
    });
    if (viewName !== "map" && window.innerWidth <= 760) {
      $("sidebar").classList.add("collapsed");
      $("inspector").classList.add("hidden");
      updateMobileBackdrop();
    }
    ensureViewRendered(viewName);
    if (viewName === "map") {
      requestAnimationFrame(() => {
        syncCanvasSize();
        scheduleRender();
      });
    } else if (viewName === "events" && state.highlightedEventId) {
      requestAnimationFrame(() => {
        const card = document.querySelector(`[data-event-card="${CSS.escape(state.highlightedEventId)}"]`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else if (viewName === "guide" && state.highlightedGuideId) {
      requestAnimationFrame(() => {
        const card = document.querySelector(`[data-guide-card="${CSS.escape(state.highlightedGuideId)}"]`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  function jumpToMarkerOnMap(markerId) {
    const mk = state.markers.find((x) => x.id === markerId);
    if (!mk) {
      toast("Marcador no encontrado en el mapa.", true);
      return;
    }
    if (mk.category) state.enabledCategories.add(mk.category);
    state.hideFound = false;
    $("chk-hide-found").checked = false;
    state.searchQuery = "";
    $("map-search").value = "";
    $("btn-clear-search").classList.add("hidden");
    renderCategoryFilters();
    switchView("map");
    requestAnimationFrame(() => {
      syncCanvasSize();
      openInspector(mk.id, true, 4.8, true);
      if (mk.wordmark) showZoneWordmark(mk.wordmark);
    });
  }

  // =========================================================================
  // HIGH-PERFORMANCE TILE PYRAMID CANVAS ENGINE + SCREEN-SPACE CULLED PINS
  // =========================================================================
  const MAX_CACHED_TILES = 44;
  const tileCache = new Map(); // url -> { img, ready, failed }
  const baseCache = new Map(); // url -> { img, ready }
  let mapCtx = null;

  function getActiveMap() {
    return (state.manifest.maps || []).find((m) => m.id === state.activeMapId) || state.manifest.maps[0];
  }

  function getBaseImage(url) {
    if (!url) return null;
    let entry = baseCache.get(url);
    if (!entry) {
      const img = new Image();
      img.decoding = "async";
      entry = { img, ready: false };
      img.onload = () => {
        entry.ready = true;
        scheduleRender();
      };
      img.src = url;
      baseCache.set(url, entry);
    }
    return entry.ready ? entry.img : null;
  }

  function getTileImage(url, cacheOnly = false) {
    let entry = tileCache.get(url);
    if (entry) {
      // Touch LRU position
      tileCache.delete(url);
      tileCache.set(url, entry);
      return entry.ready ? entry.img : null;
    }
    if (cacheOnly) return null;
    const img = new Image();
    img.decoding = "async";
    entry = { img, ready: false, failed: false };
    img.onload = () => {
      entry.ready = true;
      scheduleRender();
    };
    img.onerror = () => {
      entry.failed = true;
    };
    img.src = url;
    tileCache.set(url, entry);

    while (tileCache.size > MAX_CACHED_TILES) {
      const oldestKey = tileCache.keys().next().value;
      tileCache.delete(oldestKey);
    }
    return null;
  }

  function syncCanvasSize() {
    const vp = $("map-viewport");
    const canvas = $("map-canvas");
    if (!vp || !canvas) return;
    const rect = vp.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || vp.clientWidth || 960));
    const h = Math.max(1, Math.round(rect.height || vp.clientHeight || 640));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.vpW = w;
    state.vpH = h;
    state.dpr = dpr;
    state.vpRect = rect;

    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    if (!mapCtx) {
      mapCtx = canvas.getContext("2d", { alpha: false });
    }
  }

  function cancelCameraTween() {
    if (state.tweenRafId) {
      cancelAnimationFrame(state.tweenRafId);
      state.tweenRafId = 0;
    }
  }

  function animateCameraTo(targetScale, targetTx, targetTy, animate = true) {
    cancelCameraTween();
    if (!animate) {
      state.scale = targetScale;
      state.tx = targetTx;
      state.ty = targetTy;
      scheduleRender();
      return;
    }
    const startScale = state.scale;
    const startTx = state.tx;
    const startTy = state.ty;
    const startTime = performance.now();
    const duration = 340;

    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      state.scale = startScale + (targetScale - startScale) * ease;
      state.tx = startTx + (targetTx - startTx) * ease;
      state.ty = startTy + (targetTy - startTy) * ease;
      renderMapFrame();
      if (t < 1) {
        state.tweenRafId = requestAnimationFrame(step);
      } else {
        state.tweenRafId = 0;
      }
    };
    state.tweenRafId = requestAnimationFrame(step);
  }

  function scheduleRender() {
    if (state.rafId) return;
    state.rafId = requestAnimationFrame(() => {
      state.rafId = 0;
      renderMapFrame();
    });
  }

  function drawTileLevel(lv, visX0, visY0, visX1, visY1, tx, ty, scale, cacheOnly = false) {
    const { cols, rows, tpl } = lv;
    const tileW = state.imgW / cols;
    const tileH = state.imgH / rows;
    const c0 = Math.max(0, Math.floor(visX0 / tileW));
    const c1 = Math.min(cols - 1, Math.floor(visX1 / tileW));
    const r0 = Math.max(0, Math.floor(visY0 / tileH));
    const r1 = Math.min(rows - 1, Math.floor(visY1 / tileH));

    for (let r = r0; r <= r1; r++) {
      const wy0 = (r * state.imgH) / rows;
      const wy1 = ((r + 1) * state.imgH) / rows;
      const dy = ty + wy0 * scale;
      const dh = (wy1 - wy0) * scale + 0.65;
      for (let c = c0; c <= c1; c++) {
        const url = tpl.replace("{c}", String(c)).replace("{r}", String(r));
        const img = getTileImage(url, cacheOnly);
        if (!img) continue;
        const wx0 = (c * state.imgW) / cols;
        const wx1 = ((c + 1) * state.imgW) / cols;
        const dx = tx + wx0 * scale;
        const dw = (wx1 - wx0) * scale + 0.65;
        mapCtx.drawImage(img, dx, dy, dw, dh);
      }
    }
  }

  function drawRouteOnCanvas(tx, ty, scale) {
    const pts = state.routePoints;
    if (!pts.length || !mapCtx) return;

    const screenPts = pts.map((p) => ({
      x: tx + (p.x / 100) * state.imgW * scale,
      y: ty + (p.y / 100) * state.imgH * scale,
    }));

    mapCtx.save();
    if (screenPts.length >= 2) {
      mapCtx.lineCap = "round";
      mapCtx.lineJoin = "round";
      // Dark matte under-stroke
      mapCtx.beginPath();
      mapCtx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) {
        mapCtx.lineTo(screenPts[i].x, screenPts[i].y);
      }
      mapCtx.strokeStyle = "rgba(8, 10, 14, 0.85)";
      mapCtx.lineWidth = 6;
      mapCtx.stroke();

      // Amber GPS dashed line
      mapCtx.setLineDash([8, 5]);
      mapCtx.strokeStyle = "#f0a533";
      mapCtx.lineWidth = 3;
      mapCtx.stroke();
      mapCtx.setLineDash([]);
    }

    for (let i = 0; i < screenPts.length; i++) {
      const p = screenPts[i];
      const fill = i === 0 ? "#34c77b" : i === screenPts.length - 1 ? "#d84363" : "#f0a533";
      mapCtx.beginPath();
      mapCtx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      mapCtx.fillStyle = fill;
      mapCtx.fill();
      mapCtx.lineWidth = 2;
      mapCtx.strokeStyle = "#08090c";
      mapCtx.stroke();
    }
    mapCtx.restore();
  }

  function renderMapFrame() {
    const m = getActiveMap();
    if (!m) return;
    if (!mapCtx || state.vpW <= 1) syncCanvasSize();
    if (!mapCtx) return;

    const { vpW, vpH, dpr, tx, ty, scale, imgW, imgH } = state;

    // 1. Paint map canvas (GPU-accelerated, ~15 MB VRAM max!)
    mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mapCtx.fillStyle = state.mapTheme === "day" ? "#0b1118" : "#070b12";
    mapCtx.fillRect(0, 0, vpW, vpH);
    mapCtx.imageSmoothingEnabled = true;
    mapCtx.imageSmoothingQuality = "medium";

    const visX0 = Math.max(0, -tx / scale);
    const visY0 = Math.max(0, -ty / scale);
    const visX1 = Math.min(imgW, (vpW - tx) / scale);
    const visY1 = Math.min(imgH, (vpH - ty) / scale);

    if (visX1 > visX0 && visY1 > visY0) {
      const themeTiles = m.tiles?.[state.mapTheme];
      if (themeTiles) {
        const baseImg = getBaseImage(themeTiles.base);
        if (baseImg) {
          mapCtx.drawImage(baseImg, tx, ty, imgW * scale, imgH * scale);
        }
        const effectiveW = imgW * scale * dpr;
        const levels = themeTiles.levels || [];
        let targetIdx = -1;
        for (let i = 0; i < levels.length; i++) {
          if (effectiveW >= levels[i].minWidth) targetIdx = i;
        }
        // Draw already-cached coarser tiles underneath, only fetch the target detail level
        for (let i = 0; i <= targetIdx; i++) {
          drawTileLevel(levels[i], visX0, visY0, visX1, visY1, tx, ty, scale, i < targetIdx);
        }
      } else {
        // Fallback for legacy single-file manifest
        const fallbackUrl = state.mapTheme === "day" ? (m.dayFile || m.file) : (m.nightFile || m.file);
        const fullImg = getBaseImage(fallbackUrl);
        if (fullImg) {
          mapCtx.drawImage(fullImg, tx, ty, imgW * scale, imgH * scale);
        }
      }
    }

    // 2. Paint GPS Route directly on canvas
    if (state.routePoints.length) {
      drawRouteOnCanvas(tx, ty, scale);
    }

    // 3. Position & cull visible screen-space pins (ZERO CSS var recalcs!)
    if (state.showPins && state.pinNodes.length) {
      const pad = 42;
      for (let i = 0; i < state.pinNodes.length; i++) {
        const p = state.pinNodes[i];
        const sx = tx + p.wx * scale;
        const sy = ty + p.wy * scale;
        const offscreen = sx < -pad || sx > vpW + pad || sy < -pad || sy > vpH + pad;
        if (offscreen) {
          if (!p.culled) {
            p.el.classList.add("is-culled");
            p.culled = true;
          }
        } else {
          if (p.culled) {
            p.el.classList.remove("is-culled");
            p.culled = false;
          }
          p.el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
        }
      }
    }

    // 4. Placement reticle in screen space
    if (state.reticleCoords) {
      const rx = tx + (state.reticleCoords.x / 100) * imgW * scale;
      const ry = ty + (state.reticleCoords.y / 100) * imgH * scale;
      $("placement-reticle").style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
    }

    // 5. Update Zoom HUD only when changed + Minimap rect
    const zoomRatio = scale / Math.max(0.01, state.fitScale);
    const zText = `${Math.round(zoomRatio * 100)}%`;
    if (zText !== state.lastZoomText) {
      state.lastZoomText = zText;
      $("hud-zoom").textContent = zText;
    }
    updateMinimap();
  }

  function applyTransform() {
    scheduleRender();
  }

  function renderRegionBar() {
    const bar = $("region-bar");
    bar.innerHTML = LEONIDA_REGIONS.map(
      (r) => `
      <button type="button" class="region-tab${r.id === state.activeRegionId ? " active" : ""}" data-region-id="${esc(r.id)}">
        <img src="${blipUrl(r.blip)}" alt="" class="region-tab-icon" />
        <span>${esc(r.name)}</span>
        <span class="region-tab-sec">${esc(r.sec)}</span>
      </button>`
    ).join("");
  }

  function applyThemeUI() {
    const m = getActiveMap();
    const isDay = state.mapTheme === "day";
    $("btn-theme-night").classList.toggle("active", !isDay);
    $("btn-theme-day").classList.toggle("active", isDay);
    $("map-viewport").classList.toggle("day-mode", isDay);
    $("hud-source").textContent = isDay ? "MODO DÍA" : "MODO NOCHE";
    if (m) {
      $("minimap-img").src = isDay ? (m.minimapDay || m.dayFile || "") : (m.minimapNight || m.nightFile || "");
    }
  }

  function setMapTheme(theme) {
    if (theme !== "day" && theme !== "night") return;
    if (state.mapTheme === theme) return;
    state.mapTheme = theme;
    localStorage.setItem("gta6_map_theme", theme);
    applyThemeUI();
    scheduleRender();
  }

  function loadFullLeonidaMap() {
    const m = getActiveMap();
    if (!m) return;

    state.pxPerMile = m.pxPerMile || 600;
    state.imgW = m.width || 5395;
    state.imgH = m.height || 7521;
    applyThemeUI();
    syncCanvasSize();

    // Warm base overview immediately (~220 KB WebP)
    const themeTiles = m.tiles?.[state.mapTheme];
    if (themeTiles?.base) getBaseImage(themeTiles.base);

    renderCategoryFilters();
    renderMarkers();

    if (!state.mapInitialized) {
      state.mapInitialized = true;
      fitMapToViewport(false);

      if (state.pendingDeepLink) {
        const dl = state.pendingDeepLink;
        state.pendingDeepLink = null;
        if (dl.route) {
          const pts = dl.route
            .split(";")
            .map((s) => s.split(",").map(Number))
            .filter((p) => p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
          if (pts.length) {
            state.routePoints = pts.map(([x, y]) => ({ x, y }));
            setMeasureMode(true);
            renderRoute();
          }
        }
        if (dl.pin && state.markers.some((x) => x.id === dl.pin)) {
          openInspector(dl.pin, true, dl.zoom || 4.8, false);
        } else if (dl.region && LEONIDA_REGIONS.some((r) => r.id === dl.region)) {
          jumpToRegion(dl.region, false);
        }
      }
    } else {
      scheduleRender();
    }
  }

  function jumpToRegion(regionId, animate = true) {
    const reg = LEONIDA_REGIONS.find((r) => r.id === regionId);
    if (!reg) return;
    state.activeRegionId = reg.id;
    renderRegionBar();
    if (reg.fit) {
      showZoneWordmark(null);
      fitMapToViewport(animate);
    } else {
      focusOnCoords(reg.x, reg.y, reg.zoom, animate, true);
      if (animate && reg.wordmarkId) {
        showZoneWordmark(wordmarkUrl(reg.wordmarkId));
      }
    }
  }

  function fitMapToViewport(animate = false) {
    syncCanvasSize();
    const pad = 16;
    const scale = Math.max(0.03, Math.min((state.vpW - pad) / state.imgW, (state.vpH - pad) / state.imgH));
    state.fitScale = scale;
    const targetTx = (state.vpW - state.imgW * scale) / 2;
    const targetTy = (state.vpH - state.imgH * scale) / 2;
    state.activeRegionId = "all";
    renderRegionBar();
    animateCameraTo(scale, targetTx, targetTy, animate);
  }

  function updateMinimap() {
    const rectEl = $("minimap-rect");
    if (!rectEl || !state.imgW || !state.imgH || state.vpW <= 1) return;
    if (window.innerWidth <= 760) return; // minimap hidden on mobile
    const leftPct = Math.max(0, Math.min(100, (-state.tx / state.scale / state.imgW) * 100));
    const topPct = Math.max(0, Math.min(100, (-state.ty / state.scale / state.imgH) * 100));
    const rightPct = Math.max(0, Math.min(100, ((state.vpW - state.tx) / state.scale / state.imgW) * 100));
    const bottomPct = Math.max(0, Math.min(100, ((state.vpH - state.ty) / state.scale / state.imgH) * 100));
    rectEl.style.left = `${leftPct.toFixed(1)}%`;
    rectEl.style.top = `${topPct.toFixed(1)}%`;
    rectEl.style.width = `${Math.max(4, rightPct - leftPct).toFixed(1)}%`;
    rectEl.style.height = `${Math.max(4, bottomPct - topPct).toFixed(1)}%`;
  }

  // =========================================================================
  // GPS ROUTE & DISTANCE MEASURER (DRAWN DIRECTLY ON CANVAS)
  // =========================================================================
  function setMeasureMode(active) {
    state.measuring = active;
    if (active && state.placing) setPlacementMode(false);
    $("map-viewport").classList.toggle("measuring", active);
    $("route-banner").classList.toggle("hidden", !active);
    $("btn-measure-route").classList.toggle("is-active", active);
    if (!active) {
      state.routePoints = [];
    }
    renderRoute();
  }

  function renderRoute() {
    const pts = state.routePoints;
    if (!pts.length) {
      $("route-readout").textContent = "Haz clic en el mapa para trazar puntos y medir distancia";
      scheduleRender();
      return;
    }
    let totalPx = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = ((pts[i].x - pts[i - 1].x) / 100) * state.imgW;
      const dy = ((pts[i].y - pts[i - 1].y) / 100) * state.imgH;
      totalPx += Math.hypot(dx, dy);
    }
    const miles = totalPx / state.pxPerMile;
    const km = miles * 1.60934;
    if (pts.length === 1) {
      $("route-readout").textContent = `Origen en Sector ${coordsToGridSector(pts[0].x, pts[0].y)} — haz clic en el destino`;
    } else {
      $("route-readout").textContent = `${miles.toFixed(2)} mi · ${km.toFixed(2)} km (${pts.length} puntos)`;
    }
    scheduleRender();
  }

  function zoomAt(clientX, clientY, factor) {
    cancelCameraTween();
    const rect = state.vpRect || $("map-viewport").getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const wx = (mx - state.tx) / state.scale;
    const wy = (my - state.ty) / state.scale;

    const minS = state.fitScale * 0.72;
    const maxS = Math.max(2.0, state.fitScale * 16);
    const nextScale = Math.min(maxS, Math.max(minS, state.scale * factor));
    state.scale = nextScale;
    state.tx = mx - wx * nextScale;
    state.ty = my - wy * nextScale;
    scheduleRender();
  }

  function focusOnCoords(xPct, yPct, zoomFactor = 4.4, animate = true, exactZoom = false) {
    syncCanvasSize();
    const maxS = Math.max(2.0, state.fitScale * 16);
    const desired = state.fitScale * zoomFactor;
    const targetScale = Math.min(maxS, Math.max(state.fitScale, exactZoom ? desired : Math.max(state.scale, desired)));
    const wx = (xPct / 100) * state.imgW;
    const wy = (yPct / 100) * state.imgH;
    const targetTx = state.vpW / 2 - wx * targetScale;
    const targetTy = state.vpH / 2 - wy * targetScale;
    $("hud-grid").textContent = coordsToGridSector(xPct, yPct);
    $("hud-coords").textContent = `${xPct.toFixed(1)}, ${yPct.toFixed(1)}`;
    animateCameraTo(targetScale, targetTx, targetTy, animate);
  }

  function clientToMapPercent(clientX, clientY) {
    const rect = state.vpRect || $("map-viewport").getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const wx = (mx - state.tx) / state.scale;
    const wy = (my - state.ty) / state.scale;
    return {
      x: Math.max(0, Math.min(100, (wx / state.imgW) * 100)),
      y: Math.max(0, Math.min(100, (wy / state.imgH) * 100)),
      inside: wx >= 0 && wx <= state.imgW && wy >= 0 && wy <= state.imgH,
    };
  }

  // =========================================================================
  // FILTERING & RENDERING MARKERS (CACHED SCREEN-SPACE NODES)
  // =========================================================================
  function getMapMarkers() {
    return state.markers.filter((m) => m.mapId === state.activeMapId);
  }

  function getFilteredMarkers() {
    const q = norm(state.searchQuery.trim());
    return getMapMarkers().filter((m) => {
      if (!state.enabledCategories.has(m.category)) return false;
      if (state.hideFound && state.foundMarkers.has(m.id)) return false;
      if (q) {
        const hay = norm(`${m.title} ${m.region} ${m.description} ${m.howTo || ""} ${CATEGORIES[m.category]?.label || ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderCategoryFilters() {
    const mapMarkers = getMapMarkers();
    const counts = {};
    for (const m of mapMarkers) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }

    const container = $("category-filters");
    const orderedKeys = Object.keys(CATEGORIES).sort((a, b) => {
      if (a === "event") return -1;
      if (b === "event") return 1;
      return (counts[b] || 0) - (counts[a] || 0);
    });
    container.innerHTML = orderedKeys
      .map((key) => {
        const cfg = CATEGORIES[key];
        const cnt = counts[key] || 0;
        const on = state.enabledCategories.has(key);
        return `
          <button class="cat-chip${on ? " active" : " off"}" data-cat="${key}" title="${esc(cfg.label)} (${cnt})">
            <img src="${blipUrl(cfg.blip)}" alt="" class="cat-chip-icon" />
            <span class="cat-chip-label">${esc(cfg.label)}</span>
            <span class="cat-chip-count">${cnt}</span>
          </button>`;
      })
      .join("");
  }

  function renderMarkers() {
    const checkIcon = blipUrl("ui_check");
    const allOnMap = getMapMarkers();
    const foundOnMap = allOnMap.filter((m) => state.foundMarkers.has(m.id)).length;
    const pct = allOnMap.length ? Math.round((foundOnMap / allOnMap.length) * 100) : 0;
    $("map-progress-text").textContent = `${foundOnMap} / ${allOnMap.length} (${pct}%)`;
    $("map-progress-bar").style.width = `${pct}%`;

    const visible = getFilteredMarkers();
    $("visible-count").textContent = String(visible.length);

    const layer = $("map-pins-layer");
    layer.classList.toggle("hide-labels", !state.showLabels);
    layer.classList.toggle("pins-hidden", !state.showPins);
    layer.innerHTML = visible
      .map((m) => {
        const isFound = state.foundMarkers.has(m.id);
        const isSel = state.selectedMarkerId === m.id;
        const isBadge = /^(badge_|logo_)/.test(m.blip || "") || m.category === "event";
        return `
          <button type="button"
                  class="map-pin${isSel ? " selected" : ""}${isFound ? " is-found" : ""}"
                  data-marker-id="${esc(m.id)}"
                  title="${esc(m.title)}">
            <span class="pin-disc${isBadge ? " is-badge" : ""}">
              <img src="${blipUrl(m.blip)}" alt="" decoding="async" />
              ${isFound ? `<span class="pin-found-dot"><img src="${checkIcon}" alt="" /></span>` : ""}
            </span>
            <span class="pin-label">${esc(m.title)}</span>
          </button>`;
      })
      .join("");

    // Cache DOM refs + world pixel coords so pan/zoom never queries DOM or parses floats
    const els = layer.children;
    state.pinNodes = new Array(visible.length);
    for (let i = 0; i < visible.length; i++) {
      const m = visible[i];
      state.pinNodes[i] = {
        el: els[i],
        wx: (m.x / 100) * state.imgW,
        wy: (m.y / 100) * state.imgH,
        culled: false,
      };
    }
    scheduleRender();

    const listEl = $("marker-list");
    if (!visible.length) {
      listEl.innerHTML = `<div class="empty-state">No hay ubicaciones visibles con los filtros actuales.</div>`;
      return;
    }

    listEl.innerHTML = visible
      .map((m) => {
        const isFound = state.foundMarkers.has(m.id);
        const isSel = state.selectedMarkerId === m.id;
        return `
          <button type="button" class="marker-item${isSel ? " selected" : ""}${isFound ? " is-found" : ""}" data-marker-id="${esc(m.id)}">
            <img src="${blipUrl(m.blip)}" alt="" class="marker-item-icon" loading="lazy" decoding="async" />
            <span class="marker-item-text">
              <span class="marker-item-title">${esc(m.title)}</span>
              <span class="marker-item-sub">${esc(m.region || CATEGORIES[m.category]?.label || m.category)}</span>
            </span>
            ${isFound ? `<img src="${checkIcon}" alt="Encontrado" class="marker-item-check" />` : ""}
          </button>`;
      })
      .join("");
  }

  // =========================================================================
  // INSPECTOR DRAWER
  // =========================================================================
  function openInspector(markerId, shouldFocus = false, zoomFactor = 4.6, animate = true) {
    const m = state.markers.find((x) => x.id === markerId);
    if (!m) return;
    state.selectedMarkerId = m.id;

    if (shouldFocus) {
      focusOnCoords(m.x, m.y, zoomFactor, animate, false);
    }

    const linkedEvent = m.eventId ? state.events.find((e) => e.id === m.eventId) : null;

    $("insp-blip").src = blipUrl(m.blip);
    $("insp-cat").textContent = linkedEvent
      ? (EVENT_TYPE_LABEL[linkedEvent.type] || "Evento")
      : (CATEGORIES[m.category]?.label || m.category);
    $("insp-title").textContent = m.title;
    $("insp-desc").textContent = m.description || "Sin descripción adicional.";
    $("insp-region").textContent = m.region || guessCountyLabel(m.x, m.y);
    $("insp-coords").textContent = `${coordsToGridSector(m.x, m.y)} · ${m.x.toFixed(1)}, ${m.y.toFixed(1)}`;
    $("insp-author").textContent = m.author || "Guía de Leonida";
    $("insp-votes").textContent = String(m.votes || 0);

    const wmBar = $("insp-wordmark-bar");
    if (m.wordmark) {
      $("insp-wordmark").src = m.wordmark;
      $("insp-wordmark").alt = m.region || m.title;
      wmBar.classList.remove("hidden");
    } else {
      wmBar.classList.add("hidden");
    }

    const isFound = state.foundMarkers.has(m.id);
    const badges = [];
    if (linkedEvent) {
      if (linkedEvent.chapter) badges.push(`<span class="badge verified">${esc(linkedEvent.chapter)}</span>`);
      if (linkedEvent.character) badges.push(`<span class="badge">${esc(linkedEvent.character)}</span>`);
      if (linkedEvent.missable) badges.push(`<span class="ev-pill missable">Perdible</span>`);
    } else {
      if (m.verified) badges.push(`<span class="badge verified">Guía Oficial</span>`);
      else badges.push(`<span class="badge">Pin Personal</span>`);
    }
    if (isFound) badges.push(`<span class="badge found">Encontrado</span>`);
    $("insp-badges").innerHTML = badges.join("");
    $("btn-insp-delete").classList.remove("hidden");
    $("btn-insp-edit").classList.remove("hidden");

    const howtoBox = $("insp-howto-box");
    const evGuideEl = $("insp-event-guide");
    if (linkedEvent) {
      howtoBox.classList.add("hidden");
      const stepsHtml = (linkedEvent.steps || [])
        .map((s) => `<li>${esc(s)}</li>`)
        .join("");
      const tipsHtml = (linkedEvent.tips || [])
        .map((t) => `<li>${esc(t)}</li>`)
        .join("");
      evGuideEl.innerHTML = `
        <div>
          <span class="insp-ev-k">CÓMO EMPEZAR</span>
          <span>${esc(linkedEvent.howToStart)}</span>
        </div>
        ${stepsHtml ? `<div><span class="insp-ev-k">PASOS DE LA MISIÓN</span><ol class="insp-ev-steps">${stepsHtml}</ol></div>` : ""}
        <div>
          <span class="insp-ev-k">RECOMPENSA</span>
          <span>${esc(linkedEvent.reward)}</span>
        </div>
        ${tipsHtml ? `<div><span class="insp-ev-k">CONSEJOS</span><ul class="insp-ev-steps">${tipsHtml}</ul></div>` : ""}
        <button type="button" class="btn btn-sm btn-flat" data-open-event="${esc(linkedEvent.id)}">VER EN EVENTOS Y MISIONES</button>
      `;
      evGuideEl.classList.remove("hidden");
    } else {
      evGuideEl.classList.add("hidden");
      evGuideEl.innerHTML = "";
      if (m.howTo) {
        $("insp-howto-text").textContent = m.howTo;
        howtoBox.classList.remove("hidden");
      } else {
        howtoBox.classList.add("hidden");
      }
    }

    const foundBtn = $("btn-insp-found");
    foundBtn.classList.toggle("is-found", isFound);
    $("btn-insp-found-label").textContent = isFound ? "Encontrado" : "Marcar Encontrado";

    const mediaBox = $("insp-media");
    if (m.image) {
      $("insp-image").src = m.image;
      mediaBox.classList.remove("hidden");
    } else {
      mediaBox.classList.add("hidden");
    }

    renderInspectorComments(m);
    $("inspector").classList.remove("hidden");
    if (window.innerWidth <= 860) {
      $("sidebar").classList.add("collapsed");
    }
    updateMobileBackdrop();
    renderMarkers();
    requestAnimationFrame(() => {
      syncCanvasSize();
      scheduleRender();
    });
  }

  function renderInspectorComments(m) {
    const comms = m.comments || [];
    $("insp-comments-count").textContent = String(comms.length);
    const list = $("insp-comments-list");
    if (!comms.length) {
      list.innerHTML = `<div class="muted">Sin notas aún. Comparte un consejo o pista sobre este lugar.</div>`;
      return;
    }
    list.innerHTML = comms
      .map(
        (c) => `
      <div class="comment-card">
        <div class="comment-head">
          <span class="comment-author">${esc(c.author || "Jugador")}</span>
          <span class="comment-date">${esc((c.createdAt || "").slice(0, 10))}</span>
        </div>
        <p class="comment-body">${esc(c.text)}</p>
      </div>`
      )
      .join("");
  }

  function closeInspector() {
    state.selectedMarkerId = null;
    $("inspector").classList.add("hidden");
    updateMobileBackdrop();
    renderMarkers();
    requestAnimationFrame(() => {
      syncCanvasSize();
      scheduleRender();
    });
  }

  // =========================================================================
  // PIN PLACEMENT & CREATE / EDIT MODAL (LOCAL API OR LOCALSTORAGE)
  // =========================================================================
  function setPlacementMode(active, preferredBlip = null) {
    state.placing = active;
    if (active && state.measuring) setMeasureMode(false);
    if (preferredBlip) state.preferredBlip = preferredBlip;
    $("map-viewport").classList.toggle("placing", active);
    $("placement-banner").classList.toggle("hidden", !active);
    $("btn-add-pin").classList.toggle("is-active", active);
    if (!active) {
      state.reticleCoords = null;
      $("placement-reticle").classList.add("hidden");
    }
  }

  function openPinModal({ editMarker = null, x = 50, y = 50 } = {}) {
    const isEdit = Boolean(editMarker);
    $("pin-edit-id").value = isEdit ? editMarker.id : "";
    $("pin-modal-title").textContent = isEdit ? "EDITAR MARCADOR" : "NUEVO MARCADOR";
    $("pin-submit-label").textContent = isEdit ? "ACTUALIZAR" : "GUARDAR MARCADOR";

    $("pin-title").value = isEdit ? editMarker.title : "";
    $("pin-category").value = isEdit ? editMarker.category : "landmark";
    $("pin-region").value = isEdit ? editMarker.region || "" : guessCountyLabel(x, y);
    $("pin-x").value = (isEdit ? editMarker.x : x).toFixed(1);
    $("pin-y").value = (isEdit ? editMarker.y : y).toFixed(1);
    $("pin-description").value = isEdit ? editMarker.description || "" : "";
    $("pin-author").value = isEdit ? editMarker.author || "" : localStorage.getItem("gta6_author") || "";
    $("pin-image-select").value = isEdit ? editMarker.image || "" : "";

    state.modalSelectedBlip = isEdit ? editMarker.blip : state.preferredBlip || "blip_pin";
    $("modal-preview-blip").src = blipUrl(state.modalSelectedBlip);
    const sec = coordsToGridSector(Number($("pin-x").value), Number($("pin-y").value));
    $("pin-modal-subtitle").textContent = `Leonida · Sector ${sec} (${Number($("pin-x").value).toFixed(1)}, ${Number($("pin-y").value).toFixed(1)})`;
    renderModalBlipPicker();

    $("pin-modal-backdrop").classList.remove("hidden");
    setTimeout(() => $("pin-title").focus(), 40);
  }

  function closePinModal() {
    $("pin-modal-backdrop").classList.add("hidden");
    state.reticleCoords = null;
    $("placement-reticle").classList.add("hidden");
  }

  async function savePinForm(e) {
    e.preventDefault();
    const editId = $("pin-edit-id").value.trim();
    const authorVal = $("pin-author").value.trim() || "Jugador";
    localStorage.setItem("gta6_author", authorVal);

    const payload = {
      mapId: state.activeMapId,
      title: $("pin-title").value.trim(),
      category: $("pin-category").value,
      blip: state.modalSelectedBlip,
      x: parseFloat($("pin-x").value),
      y: parseFloat($("pin-y").value),
      region: $("pin-region").value.trim(),
      description: $("pin-description").value.trim(),
      author: authorVal,
      image: $("pin-image-select").value,
    };

    try {
      if (state.hasLocalApi) {
        if (editId) {
          const res = await api(`/api/markers/${encodeURIComponent(editId)}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          const idx = state.markers.findIndex((m) => m.id === editId);
          if (idx >= 0) state.markers[idx] = res.marker;
          toast("Marcador actualizado.");
          closePinModal();
          renderCategoryFilters();
          openInspector(editId, false);
        } else {
          const res = await api("/api/markers", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          state.markers.push(res.marker);
          state.enabledCategories.add(res.marker.category);
          toast("Nuevo pin guardado.");
          closePinModal();
          setPlacementMode(false);
          renderCategoryFilters();
          openInspector(res.marker.id, false);
        }
        return;
      }

      // Static / Vercel browser persistence mode
      if (editId) {
        state.userPins.overrides[editId] = { ...(state.userPins.overrides[editId] || {}), ...payload };
        saveLocalUserPins();
        rebuildMergedMarkers();
        toast("Marcador actualizado en tu navegador.");
        closePinModal();
        renderCategoryFilters();
        openInspector(editId, false);
      } else {
        const newMarker = {
          id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          ...payload,
          votes: 1,
          verified: false,
          createdAt: new Date().toISOString(),
          comments: [],
        };
        state.userPins.added.push(newMarker);
        saveLocalUserPins();
        rebuildMergedMarkers();
        state.enabledCategories.add(newMarker.category);
        toast("Nuevo pin guardado en tu navegador.");
        closePinModal();
        setPlacementMode(false);
        renderCategoryFilters();
        openInspector(newMarker.id, false);
      }
    } catch (err) {
      toast(err.message, true);
    }
  }

  // =========================================================================
  // PROGRESS PERSISTENCE
  // =========================================================================
  async function persistProgress() {
    updateGlobalProgressCounters();
    const payload = {
      foundMarkers: Array.from(state.foundMarkers),
      foundCollectibles: Array.from(state.foundCollectibles),
      completedEvents: Array.from(state.completedEvents),
      unlockedTrophies: Array.from(state.unlockedTrophies),
    };
    try {
      localStorage.setItem(LS_PROGRESS, JSON.stringify(payload));
    } catch (_) { /* noop */ }

    if (state.hasLocalApi) {
      try {
        await api("/api/progress", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (err) {
        toast(`No se pudo sincronizar el progreso local: ${err.message}`, true);
      }
    }
  }

  function updateGlobalProgressCounters() {
    const totalEv = state.events.length;
    const doneEv = state.completedEvents.size;
    const evPct = totalEv ? Math.round((doneEv / totalEv) * 100) : 0;
    $("nav-events-count").textContent = `${doneEv}/${totalEv}`;
    $("ev-progress-pct").textContent = `${evPct}%`;
    $("ev-progress-bar").style.width = `${evPct}%`;
    $("ev-progress-detail").textContent = `${doneEv} de ${totalEv} completados`;

    const totalTr = (state.guides.trophies || []).length;
    const doneTr = state.unlockedTrophies.size;
    const trPct = totalTr ? Math.round((doneTr / totalTr) * 100) : 0;
    if ($("nav-trophy-count")) $("nav-trophy-count").textContent = `${doneTr}/${totalTr}`;
    if ($("tr-progress-pct")) {
      $("tr-progress-pct").textContent = `${trPct}%`;
      $("tr-progress-bar").style.width = `${trPct}%`;
      $("tr-progress-detail").textContent = `${doneTr} de ${totalTr} desbloqueados`;
    }

    const totalColls = (state.manifest.collectibles || []).length;
    const foundColls = state.foundCollectibles.size;
    const pct = totalColls ? Math.round((foundColls / totalColls) * 100) : 0;
    $("nav-coll-count").textContent = `${foundColls}/${totalColls}`;
    $("nav-arsenal-count").textContent = String((state.manifest.arsenal || []).length);
    $("coll-progress-pct").textContent = `${pct}%`;
    $("coll-progress-bar").style.width = `${pct}%`;
    $("coll-progress-detail").textContent = `${foundColls} de ${totalColls} encontrados`;
  }

  // =========================================================================
  // VIEW 2: EVENTS, STRANGERS & FREAKS, LEGENDARY HUNTS & 100% ACTIVITIES
  // =========================================================================
  function renderGuide100Box() {
    const box = $("guide-100-box");
    const g = state.guide100;
    if (!box || !g || !g.title) {
      if (box) box.classList.add("hidden");
      return;
    }
    const bucketsHtml = (g.buckets || [])
      .map(
        (b) => `
      <div class="g100-bucket">
        <div class="g100-bucket-top">
          <span>${esc(b.label)}</span>
          <span class="g100-bucket-pct">${b.weight}%</span>
        </div>
        <p>${esc(b.text)}</p>
      </div>`
      )
      .join("");
    box.innerHTML = `
      <div class="guide-100-head">
        <h2>${esc(g.title)}</h2>
      </div>
      <p class="guide-100-intro">${esc(g.intro)}</p>
      <div class="guide-100-buckets">${bucketsHtml}</div>
      <div class="guide-100-tips">
        <span><strong>Modo Enfoque:</strong> ${esc(g.focusTip)}</span>
        <span><strong>Trofeos:</strong> ${esc(g.trophyNote)}</span>
      </div>
    `;
  }

  function renderEventsView() {
    const checkIcon = blipUrl("ui_check");
    const allEvents = state.events || [];
    $("events-type-pills").innerHTML = EVENT_TYPES.map((t) => {
      const cnt = t.id === "all" ? allEvents.length : allEvents.filter((e) => e.type === t.id).length;
      return `
        <button class="filter-pill${state.eventType === t.id ? " active" : ""}" data-ev-type="${t.id}">
          <img src="${blipUrl(t.blip)}" alt="" />
          <span>${esc(t.label)} (${cnt})</span>
        </button>`;
    }).join("");

    const q = norm(state.eventSearch.trim());
    const filtered = allEvents.filter((ev) => {
      if (state.eventType !== "all" && ev.type !== state.eventType) return false;
      if (state.eventsOnlyPending && state.completedEvents.has(ev.id)) return false;
      if (q) {
        const hay = norm(`${ev.title} ${ev.subtitle} ${ev.character} ${ev.chapter} ${ev.region} ${ev.summary} ${ev.howToStart} ${ev.reward} ${(ev.steps || []).join(" ")}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const grid = $("events-grid");
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">No hay eventos o misiones que coincidan con el filtro actual.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((ev) => {
        const isDone = state.completedEvents.has(ev.id);
        const isHi = state.highlightedEventId === ev.id;
        const typeLabel = EVENT_TYPE_LABEL[ev.type] || ev.type;
        const openByDefault = ev.id === "kirk" || isHi;
        const firstMarkerId = (ev.markerIds || [])[0] || "";

        const stepsHtml = (ev.steps || []).map((s) => `<li>${esc(s)}</li>`).join("");
        const tipsHtml = (ev.tips || []).map((t) => `<li>${esc(t)}</li>`).join("");

        return `
          <article class="event-card${isDone ? " is-done" : ""}${isHi ? " is-highlighted" : ""}" data-event-card="${esc(ev.id)}">
            <div class="event-media"
                 data-lightbox-src="${esc(ev.image)}"
                 data-lightbox-title="${esc(ev.title)}"
                 data-lightbox-meta="${esc(ev.subtitle || typeLabel)} · ${esc(ev.region)}">
              <img src="${esc(ev.image)}" alt="${esc(ev.title)}" loading="lazy" />
              <div class="event-media-badges">
                <span class="ev-pill">${esc(typeLabel)}</span>
                ${ev.missable ? `<span class="ev-pill missable">Perdible</span>` : ""}
                ${isDone ? `<span class="ev-pill done">Completado</span>` : ""}
              </div>
            </div>

            <div class="event-body">
              <div class="event-head">
                <img src="${blipUrl(ev.blip)}" alt="" class="event-blip" />
                <div class="event-title-wrap">
                  <h3 class="event-title">${esc(ev.title)}</h3>
                  <span class="event-subtitle">${esc(ev.subtitle)}</span>
                </div>
              </div>

              <div class="event-meta-chips">
                <span class="ev-meta-chip"><strong>Cuándo:</strong> ${esc(ev.chapter)}</span>
                <span class="ev-meta-chip"><strong>Personaje:</strong> ${esc(ev.character)}</span>
                <span class="ev-meta-chip"><strong>Zona:</strong> ${esc(ev.region)}</span>
              </div>

              <p class="event-summary">${esc(ev.summary)}</p>

              <div class="event-start-box">
                <strong>CÓMO EMPEZAR</strong>
                <span>${esc(ev.howToStart)}</span>
              </div>

              <details class="ev-details"${openByDefault ? " open" : ""}>
                <summary>GUÍA PASO A PASO, RECOMPENSA Y CONSEJOS</summary>
                <div class="ev-details-body">
                  ${stepsHtml ? `<ol class="ev-steps">${stepsHtml}</ol>` : ""}
                  <div class="ev-reward-line">
                    <strong>Recompensa:</strong> ${esc(ev.reward)}
                    ${ev.trophy && ev.trophy !== "—" ? `<br /><strong>Trofeo:</strong> ${esc(ev.trophy)}` : ""}
                  </div>
                  ${tipsHtml ? `<ul class="ev-tips-list">${tipsHtml}</ul>` : ""}
                </div>
              </details>

              <div class="event-foot">
                <span class="muted">${esc(ev.trophy && ev.trophy !== "—" ? ev.trophy : ev.region)}</span>
                <div class="event-foot-actions">
                  ${
                    firstMarkerId
                      ? `<button type="button" class="btn btn-sm btn-flat" data-goto-marker="${esc(firstMarkerId)}">VER EN MAPA</button>`
                      : ""
                  }
                  <button type="button" class="btn btn-sm ${isDone ? "btn-check is-found" : "btn-flat"}" data-toggle-event="${esc(ev.id)}">
                    <img src="${checkIcon}" alt="" class="ui-icon" />
                    <span>${isDone ? "Completado" : "Marcar"}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>`;
      })
      .join("");
  }

  // =========================================================================
  // VIEW 3: PLAYER MECHANICS ("CÓMO HACERLO") & TROPHIES / ACHIEVEMENTS
  // =========================================================================
  function renderGuideView() {
    const checkIcon = blipUrl("ui_check");
    const rm = state.guides.roadmap;
    const rmBox = $("roadmap-box");
    if (rmBox && rm) {
      rmBox.innerHTML = `
        <div class="roadmap-stats">
          <div class="rm-stat"><span class="rm-stat-k">TROFEOS / LOGROS</span><span class="rm-stat-v">${esc(rm.totalTrophies)} (100% Un Jugador)</span></div>
          <div class="rm-stat"><span class="rm-stat-k">DURACIÓN ESTIMADA</span><span class="rm-stat-v">${esc(rm.estimatedHours)}</span></div>
          <div class="rm-stat"><span class="rm-stat-k">DIFICULTAD</span><span class="rm-stat-v">${esc(rm.difficulty)}</span></div>
          <div class="rm-stat"><span class="rm-stat-k">MODO LIBRE FINAL</span><span class="rm-stat-v">Sí (sin bloqueo de 100%)</span></div>
        </div>
        <div class="rm-alerts">
          <div class="rm-alert is-danger">
            <strong>ALERTA DE PERDIBLES</strong>
            <span>${esc(rm.missableAlert)}</span>
          </div>
          <div class="rm-alert">
            <strong>AVISO DE TRUCOS</strong>
            <span>${esc(rm.cheatWarning)}</span>
          </div>
        </div>
      `;
    }

    // Section A: Mechanics Playbooks
    const mechs = state.guides.mechanics || [];
    $("mech-cat-pills").innerHTML = MECH_CATEGORIES.map((c) => {
      const cnt = c.id === "all" ? mechs.length : mechs.filter((m) => m.category === c.id).length;
      return `<button class="filter-pill${state.mechCat === c.id ? " active" : ""}" data-mech-cat="${c.id}">${esc(c.label)} (${cnt})</button>`;
    }).join("");

    const filteredMechs = mechs.filter((m) => state.mechCat === "all" || m.category === state.mechCat);
    $("mechanics-grid").innerHTML = filteredMechs
      .map((m, idx) => {
        const isHi = state.highlightedGuideId === m.id;
        const openByDefault = idx < 2 || isHi;
        const ctrlsHtml = (m.controls || [])
          .map(
            (c) => `
          <div class="mech-ctrl-chip">
            <span class="mech-ctrl-key">${esc(c.key)}</span>
            <span class="mech-ctrl-act">${esc(c.action)}</span>
          </div>`
          )
          .join("");
        const stepsHtml = (m.steps || []).map((s) => `<li>${esc(s)}</li>`).join("");
        const tipsHtml = (m.tips || []).map((t) => `<li>${esc(t)}</li>`).join("");
        return `
          <article class="mech-card${isHi ? " is-highlighted" : ""}" data-guide-card="${esc(m.id)}">
            <div class="event-head">
              <img src="${blipUrl(m.blip)}" alt="" class="event-blip" />
              <div class="event-title-wrap">
                <h3 class="event-title">${esc(m.title)}</h3>
                <span class="event-subtitle">${esc(m.subtitle)}</span>
              </div>
            </div>
            <p class="event-summary">${esc(m.summary)}</p>
            ${ctrlsHtml ? `<div class="mech-controls">${ctrlsHtml}</div>` : ""}
            <details class="ev-details"${openByDefault ? " open" : ""}>
              <summary>INDICACIONES PASO A PASO ("CÓMO HACERLO")</summary>
              <div class="ev-details-body">
                ${stepsHtml ? `<ol class="ev-steps">${stepsHtml}</ol>` : ""}
                ${tipsHtml ? `<ul class="ev-tips-list">${tipsHtml}</ul>` : ""}
              </div>
            </details>
            ${
              m.markerId
                ? `<div class="event-foot">
                     <span class="muted">Ubicación de referencia en Leonida</span>
                     <button type="button" class="btn btn-sm btn-flat" data-goto-marker="${esc(m.markerId)}">VER EN MAPA</button>
                   </div>`
                : ""
            }
          </article>`;
      })
      .join("");

    // Section B: Trophies Checklist
    const trophies = state.guides.trophies || [];
    $("trophy-cat-pills").innerHTML = TROPHY_CATEGORIES.map((c) => {
      const cnt =
        c.id === "all"
          ? trophies.length
          : c.id === "missable"
            ? trophies.filter((t) => t.missable).length
            : trophies.filter((t) => t.category === c.id).length;
      return `<button class="filter-pill${state.trophyCat === c.id ? " active" : ""}" data-trophy-cat="${c.id}">${esc(c.label)} (${cnt})</button>`;
    }).join("");

    const tq = norm(state.trophySearch.trim());
    const filteredTr = trophies.filter((t) => {
      if (state.trophyCat === "missable" && !t.missable) return false;
      else if (state.trophyCat !== "all" && state.trophyCat !== "missable" && t.category !== state.trophyCat) return false;
      if (state.trophiesOnlyPending && state.unlockedTrophies.has(t.id)) return false;
      if (tq) {
        const hay = norm(`${t.title} ${t.tier} ${t.requirement} ${t.howTo}`);
        if (!hay.includes(tq)) return false;
      }
      return true;
    });

    const tGrid = $("trophies-grid");
    if (!filteredTr.length) {
      tGrid.innerHTML = `<div class="empty-state">No hay trofeos que coincidan con el filtro actual.</div>`;
      return;
    }

    tGrid.innerHTML = filteredTr
      .map((t) => {
        const isDone = state.unlockedTrophies.has(t.id);
        const isHi = state.highlightedGuideId === t.id;
        return `
          <article class="trophy-card${isDone ? " is-done" : ""}${isHi ? " is-highlighted" : ""}" data-guide-card="${esc(t.id)}">
            <div class="trophy-top">
              <h3 class="trophy-title">${esc(t.title)}</h3>
              <div class="trophy-badges">
                ${t.missable ? `<span class="ev-pill missable">Perdible</span>` : ""}
                <span class="tier-pill tier-${esc(t.tier)}">${esc(t.tier)}</span>
              </div>
            </div>
            <p class="trophy-req">${esc(t.requirement)}</p>
            <div class="card-howto">
              <strong>CÓMO CONSEGUIRLO:</strong>${esc(t.howTo)}
            </div>
            <div class="event-foot">
              <div class="card-foot-actions">
                ${t.markerId ? `<button type="button" class="btn btn-sm btn-flat" data-goto-marker="${esc(t.markerId)}">VER EN MAPA</button>` : ""}
                ${t.eventId ? `<button type="button" class="btn btn-sm btn-flat" data-open-event="${esc(t.eventId)}">VER GUÍA</button>` : ""}
              </div>
              <button type="button" class="btn btn-sm ${isDone ? "btn-check is-found" : "btn-flat"}" data-toggle-trophy="${esc(t.id)}">
                <img src="${checkIcon}" alt="" class="ui-icon" />
                <span>${isDone ? "Desbloqueado" : "Marcar"}</span>
              </button>
            </div>
          </article>`;
      })
      .join("");
  }

  // =========================================================================
  // VIEW 4: COLLECTIBLES VAULT
  // =========================================================================
  function renderCollectiblesView() {
    const checkIcon = blipUrl("ui_check");
    const colls = state.manifest.collectibles || [];
    const pillBar = $("coll-cat-pills");
    pillBar.innerHTML = COLL_CATEGORIES.map((c) => {
      const cnt = c.id === "all" ? colls.length : colls.filter((x) => x.category === c.id).length;
      return `
        <button class="filter-pill${state.collCat === c.id ? " active" : ""}" data-coll-cat="${c.id}">
          <img src="${blipUrl(c.blip)}" alt="" />
          <span>${esc(c.label)} (${cnt})</span>
        </button>`;
    }).join("");

    const q = norm(state.collSearch.trim());
    const filtered = colls.filter((c) => {
      if (state.collCat !== "all" && c.category !== state.collCat) return false;
      if (state.collOnlyPending && state.foundCollectibles.has(c.id)) return false;
      if (q) {
        const hay = norm(`${c.title} ${c.description} ${c.howTo || ""} ${c.category} ${COLL_CAT_LABEL[c.category] || ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const grid = $("collectibles-grid");
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">No hay coleccionables que coincidan con el filtro.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((c) => {
        const isFound = state.foundCollectibles.has(c.id);
        const catLabel = COLL_CAT_LABEL[c.category] || c.category;
        const containCls = (c.category === "medals" || c.category === "cards" || c.category === "comics") ? " is-contain" : "";
        return `
          <article class="coll-card${isFound ? " is-found" : ""}" data-coll-id="${esc(c.id)}">
            <div class="coll-thumb${containCls}" data-lightbox-src="${esc(c.file)}" data-lightbox-title="${esc(c.title)}" data-lightbox-meta="${esc(catLabel)} · ${esc(c.description)}">
              <img src="${esc(c.thumb || c.file)}" alt="${esc(c.title)}" loading="lazy" />
              ${isFound ? `<span class="coll-found-badge"><img src="${checkIcon}" alt="" /> Hallado</span>` : ""}
            </div>
            <div class="coll-body">
              <h3 class="coll-title">${esc(c.title)}</h3>
              <p class="coll-desc">${esc(c.description)}</p>
              ${c.howTo ? `<div class="card-howto"><strong>CÓMO:</strong>${esc(c.howTo)}</div>` : ""}
              <div class="coll-foot">
                <span class="muted">${esc(catLabel)}</span>
                <div class="card-foot-actions">
                  ${c.markerId ? `<button type="button" class="btn btn-sm btn-flat" data-goto-marker="${esc(c.markerId)}" title="Ver zona en el mapa">MAPA</button>` : ""}
                  <button type="button" class="btn btn-sm ${isFound ? "btn-check is-found" : "btn-flat"}" data-toggle-coll="${esc(c.id)}">
                    <img src="${checkIcon}" alt="" class="ui-icon" />
                    <span>${isFound ? "Completado" : "Marcar"}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>`;
      })
      .join("");
  }

  // =========================================================================
  // VIEW 5: ARSENAL, VEHICLES & LICENSE PLATES
  // =========================================================================
  function renderArsenalView() {
    const items = state.manifest.arsenal || [];
    const pillBar = $("arsenal-cat-pills");

    pillBar.innerHTML = ARSENAL_CATEGORIES.map((c) => {
      const cnt = c.id === "all" ? items.length : items.filter((x) => x.category === c.id).length;
      if (c.id !== "all" && cnt === 0) return "";
      return `
        <button class="filter-pill${state.arsenalCat === c.id ? " active" : ""}" data-arsenal-cat="${c.id}">
          <span>${esc(c.label)} (${cnt})</span>
        </button>`;
    }).join("");

    const q = norm(state.arsenalSearch.trim());
    const filtered = items.filter((a) => {
      if (state.arsenalCat !== "all" && a.category !== state.arsenalCat) return false;
      if (q) {
        const hay = norm(`${a.title} ${a.description} ${a.howTo || ""} ${a.category} ${ARSENAL_CAT_MAP[a.category] || ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const grid = $("arsenal-grid");
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">No hay elementos en Arsenal o Garaje que coincidan con la búsqueda.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((a) => {
        const stageCls = WEAPON_CATS.has(a.category)
          ? "is-weapon"
          : a.category === "plates"
            ? "is-plate"
            : "is-vehicle";
        const catLabel = ARSENAL_CAT_MAP[a.category] || a.category;
        return `
          <article class="arsenal-card" data-arsenal-id="${esc(a.id)}">
            <div class="arsenal-stage ${stageCls}"
                 data-lightbox-src="${esc(a.file)}"
                 data-lightbox-title="${esc(a.title)}"
                 data-lightbox-meta="${esc(catLabel)} · ${esc(a.description)}">
              <img src="${esc(a.file)}" alt="${esc(a.title)}" loading="lazy" />
              <span class="arsenal-cat-tag">${esc(catLabel)}</span>
            </div>
            <div class="arsenal-body">
              <h3 class="arsenal-title">${esc(a.title)}</h3>
              <p class="arsenal-desc">${esc(a.description)}</p>
              ${a.howTo ? `<div class="card-howto"><strong>DÓNDE / USO:</strong>${esc(a.howTo)}</div>` : ""}
              ${
                a.markerId
                  ? `<div class="arsenal-foot">
                       <span class="muted">${esc(catLabel)}</span>
                       <button type="button" class="btn btn-sm btn-flat" data-goto-marker="${esc(a.markerId)}">VER EN MAPA</button>
                     </div>`
                  : ""
              }
            </div>
          </article>`;
      })
      .join("");
  }

  // =========================================================================
  // VIEW 5: DISTRICTS, WORDMARKS & MAP ICONS
  // =========================================================================
  function renderBlipsView() {
    const blips = (state.manifest.blips || []).filter((b) => b.is_map_blip);
    const wordmarks = Object.values(state.manifest.wordmarks || {});

    $("blips-group-pills").innerHTML = BLIP_GROUPS.map((g) => {
      let cnt = 0;
      if (g.id === "all") cnt = blips.length;
      else if (g.id === "wordmarks") cnt = wordmarks.length;
      else cnt = blips.filter((b) => b.group === g.id).length;
      return `<button class="filter-pill${state.blipGroup === g.id ? " active" : ""}" data-blip-group="${g.id}">${esc(g.label)} (${cnt})</button>`;
    }).join("");

    const grid = $("blips-catalog-grid");
    if (state.blipGroup === "wordmarks") {
      grid.classList.add("is-wordmarks");
      grid.innerHTML = wordmarks
        .map(
          (w) => `
        <article class="wordmark-card"
                 data-lightbox-src="${esc(w.file)}"
                 data-lightbox-title="${esc(w.label)}"
                 data-lightbox-meta="Distrito y zona del Estado de Leonida">
          <div class="wordmark-stage">
            <img src="${esc(w.file)}" alt="${esc(w.label)}" loading="lazy" />
          </div>
          <div class="wordmark-info">
            <span class="wordmark-name">${esc(w.label)}</span>
            <span class="wordmark-meta">LEONIDA</span>
          </div>
        </article>`
        )
        .join("");
      return;
    }

    grid.classList.remove("is-wordmarks");
    const filtered = blips.filter((b) => state.blipGroup === "all" || b.group === state.blipGroup);
    grid.innerHTML = filtered
      .map(
        (b) => `
      <div class="blip-card">
        <div class="blip-card-stage"
             data-lightbox-src="${esc(b.file)}"
             data-lightbox-title="${esc(b.label)}"
             data-lightbox-meta="Icono oficial del mapa de Leonida">
          <img src="${esc(b.file)}" alt="${esc(b.label)}" loading="lazy" />
        </div>
        <div class="blip-card-name">${esc(b.label)}</div>
        <button type="button" class="btn btn-sm btn-flat" data-use-blip="${esc(b.id)}">Usar en Pin</button>
      </div>`
      )
      .join("");
  }

  // =========================================================================
  // LIGHTBOX
  // =========================================================================
  function openLightbox(src, title, meta = "") {
    $("lightbox-img").src = src;
    $("lightbox-title").textContent = title || "Vista Ampliada";
    $("lightbox-meta").textContent = meta;
    $("lightbox").classList.remove("hidden");
  }

  function closeLightbox() {
    $("lightbox").classList.add("hidden");
    $("lightbox-img").src = "";
  }

  // =========================================================================
  // GLOBAL INSTANT SEARCH COMMAND PALETTE (CTRL+K)
  // =========================================================================
  const QUICK_SEARCH_CHIPS = [
    "Kirk Skunk Ape",
    "Bret Vogel caza",
    "Ganar dinero rápido",
    "Meditación perdible",
    "Maletero armas",
    "Flamencos",
    "WAiNK",
    "Campos de tiro",
    "Moses",
    "Yasmani",
  ];

  function openGlobalSearch(initialQuery = "") {
    $("global-search-backdrop").classList.remove("hidden");
    const inp = $("global-search-input");
    inp.value = initialQuery;
    renderGlobalSearchResults(initialQuery);
    setTimeout(() => {
      inp.focus();
      inp.select();
    }, 20);
  }

  function closeGlobalSearch() {
    $("global-search-backdrop").classList.add("hidden");
  }

  function renderGlobalSearchResults(rawQuery) {
    const box = $("global-search-results");
    const q = norm((rawQuery || "").trim());

    if (!q) {
      state.cmdItems = [];
      state.cmdActiveIdx = 0;
      box.innerHTML = `
        <div class="cmd-quick-wrap">
          <div class="cmd-group-head">BÚSQUEDAS RÁPIDAS POPULARES</div>
          <div class="cmd-quick-chips">
            ${QUICK_SEARCH_CHIPS.map((c) => `<button type="button" class="cmd-chip" data-quick-q="${esc(c)}">${esc(c)}</button>`).join("")}
          </div>
          <div class="muted">Escribe cualquier personaje, misión, arma, coche, animal, trofeo o sector del mapa (ej. "G-7", "caimán", "dinero", "perdible").</div>
        </div>`;
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);
    const matches = (hay) => {
      const h = norm(hay);
      return terms.every((t) => h.includes(t));
    };

    const groups = [];
    const flat = [];

    const addGroup = (label, items) => {
      if (!items.length) return;
      groups.push({ label, items: items.map((it) => ({ ...it, _idx: flat.push(it) - 1 })) });
    };

    // 1. Events & Strangers
    addGroup(
      "Eventos, Extraños y Peristas",
      state.events
        .filter((e) => matches(`${e.title} ${e.subtitle} ${e.character} ${e.region} ${e.summary} ${e.howToStart} ${e.trophy}`))
        .slice(0, 6)
        .map((e) => ({
          kind: "event",
          id: e.id,
          title: e.title,
          sub: `${e.chapter} · ${e.region}`,
          tag: EVENT_TYPE_LABEL[e.type] || "Evento",
          icon: blipUrl(e.blip),
        }))
    );

    // 2. Mechanics & Trophies
    const guideMatches = [];
    for (const m of state.guides.mechanics || []) {
      if (matches(`${m.title} ${m.subtitle} ${m.summary} ${(m.steps || []).join(" ")}`)) {
        guideMatches.push({
          kind: "mechanic",
          id: m.id,
          title: m.title,
          sub: m.subtitle,
          tag: "Manual",
          icon: blipUrl(m.blip),
        });
      }
    }
    for (const t of state.guides.trophies || []) {
      if (matches(`${t.title} ${t.tier} ${t.requirement} ${t.howTo} ${t.missable ? "perdible" : ""}`)) {
        guideMatches.push({
          kind: "trophy",
          id: t.id,
          title: t.title,
          sub: t.requirement,
          tag: t.missable ? "Perdible" : `Trofeo ${t.tier}`,
          icon: blipUrl("blip_chest"),
        });
      }
    }
    addGroup("Guía del Jugador y Trofeos", guideMatches.slice(0, 6));

    // 3. Map Markers
    addGroup(
      "Ubicaciones en el Mapa",
      state.markers
        .filter((m) => matches(`${m.title} ${m.region} ${m.description} ${m.howTo || ""} ${CATEGORIES[m.category]?.label || ""}`))
        .slice(0, 7)
        .map((m) => ({
          kind: "marker",
          id: m.id,
          title: m.title,
          sub: m.region || guessCountyLabel(m.x, m.y),
          tag: CATEGORIES[m.category]?.label || "Mapa",
          icon: blipUrl(m.blip),
        }))
    );

    // 4. Collectibles
    addGroup(
      "Coleccionables",
      (state.manifest.collectibles || [])
        .filter((c) => matches(`${c.title} ${c.description} ${c.howTo || ""} ${COLL_CAT_LABEL[c.category] || ""}`))
        .slice(0, 5)
        .map((c) => ({
          kind: "collectible",
          id: c.id,
          title: c.title,
          sub: c.description,
          tag: COLL_CAT_LABEL[c.category] || "Coleccionable",
          icon: c.thumb || c.file,
        }))
    );

    // 5. Arsenal & Garage
    addGroup(
      "Arsenal y Garaje",
      (state.manifest.arsenal || [])
        .filter((a) => matches(`${a.title} ${a.description} ${a.howTo || ""} ${ARSENAL_CAT_MAP[a.category] || ""}`))
        .slice(0, 5)
        .map((a) => ({
          kind: "arsenal",
          id: a.id,
          title: a.title,
          sub: a.description,
          tag: ARSENAL_CAT_MAP[a.category] || "Arsenal",
          icon: a.file,
        }))
    );

    // 6. District Wordmarks
    addGroup(
      "Distritos de Leonida",
      Object.values(state.manifest.wordmarks || {})
        .filter((w) => matches(w.label))
        .slice(0, 4)
        .map((w) => ({
          kind: "wordmark",
          id: w.id,
          title: w.label,
          sub: "Distrito y condado de Leonida",
          tag: "Distrito",
          icon: w.file,
        }))
    );

    state.cmdItems = flat;
    state.cmdActiveIdx = 0;

    if (!flat.length) {
      box.innerHTML = `<div class="empty-state">Sin resultados para "${esc(rawQuery)}". Prueba con "Kirk", "Bret", "dinero", "maletero", "WAiNK" o un sector como "G-7".</div>`;
      return;
    }

    box.innerHTML = groups
      .map(
        (g) => `
        <div class="cmd-group-head">${esc(g.label)}</div>
        ${g.items
          .map(
            (it) => `
          <button type="button" class="cmd-item${it._idx === 0 ? " is-active" : ""}" data-cmd-idx="${it._idx}">
            <img src="${esc(it.icon)}" alt="" class="cmd-item-icon" />
            <span class="cmd-item-text">
              <span class="cmd-item-title">${esc(it.title)}</span>
              <span class="cmd-item-sub">${esc(it.sub)}</span>
            </span>
            <span class="cmd-item-tag">${esc(it.tag)}</span>
          </button>`
          )
          .join("")}`
      )
      .join("");
  }

  function setCmdActive(nextIdx) {
    const total = state.cmdItems.length;
    if (!total) return;
    state.cmdActiveIdx = ((nextIdx % total) + total) % total;
    document.querySelectorAll("#global-search-results .cmd-item").forEach((el) => {
      const on = Number(el.dataset.cmdIdx) === state.cmdActiveIdx;
      el.classList.toggle("is-active", on);
      if (on) el.scrollIntoView({ block: "nearest" });
    });
  }

  function executeCmdItem(item) {
    if (!item) return;
    closeGlobalSearch();
    if (item.kind === "marker") {
      jumpToMarkerOnMap(item.id);
    } else if (item.kind === "event") {
      state.highlightedEventId = item.id;
      state.eventType = "all";
      state.eventSearch = "";
      $("events-search").value = "";
      state.renderedViews.add("events");
      renderGuide100Box();
      renderEventsView();
      switchView("events");
    } else if (item.kind === "mechanic" || item.kind === "trophy") {
      state.highlightedGuideId = item.id;
      state.mechCat = "all";
      state.trophyCat = "all";
      state.trophySearch = "";
      $("trophy-search").value = "";
      state.renderedViews.add("guide");
      renderGuideView();
      switchView("guide");
    } else if (item.kind === "collectible") {
      state.collCat = "all";
      state.collSearch = item.title;
      $("coll-search").value = item.title;
      state.renderedViews.add("collectibles");
      renderCollectiblesView();
      switchView("collectibles");
    } else if (item.kind === "arsenal") {
      state.arsenalCat = "all";
      state.arsenalSearch = item.title;
      $("arsenal-search").value = item.title;
      state.renderedViews.add("arsenal");
      renderArsenalView();
      switchView("arsenal");
    } else if (item.kind === "wordmark") {
      state.blipGroup = "wordmarks";
      state.renderedViews.add("blips");
      renderBlipsView();
      switchView("blips");
    }
  }

  // =========================================================================
  // EXPORT / IMPORT COMMUNITY PACK JSON
  // =========================================================================
  function exportCommunityJson() {
    const pack = {
      app: "GTA VI Atlas de Leonida",
      version: 5,
      exportedAt: new Date().toISOString(),
      markers: state.markers,
      progress: {
        foundMarkers: Array.from(state.foundMarkers),
        foundCollectibles: Array.from(state.foundCollectibles),
        completedEvents: Array.from(state.completedEvents),
        unlockedTrophies: Array.from(state.unlockedTrophies),
      },
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gta6-leonida-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Progreso exportado (${state.markers.length} marcadores).`);
  }

  function importCommunityJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        if (!Array.isArray(parsed.markers)) {
          throw new Error("El archivo JSON no contiene una lista 'markers'.");
        }
        if (state.hasLocalApi) {
          await api("/api/save-markers", {
            method: "POST",
            body: JSON.stringify({ markers: parsed.markers }),
          });
          state.markers = parsed.markers;
        } else {
          const baseIds = new Set(state.baseMarkers.map((m) => m.id));
          const importedIds = new Set(parsed.markers.map((m) => m.id));
          state.userPins = { added: [], overrides: {}, deleted: [], votes: {}, comments: {} };
          for (const bid of baseIds) {
            if (!importedIds.has(bid)) state.userPins.deleted.push(bid);
          }
          for (const mk of parsed.markers) {
            if (baseIds.has(mk.id)) state.userPins.overrides[mk.id] = mk;
            else state.userPins.added.push(mk);
          }
          saveLocalUserPins();
          rebuildMergedMarkers();
        }
        if (parsed.progress) {
          state.foundMarkers = new Set(parsed.progress.foundMarkers || []);
          state.foundCollectibles = new Set(parsed.progress.foundCollectibles || []);
          state.completedEvents = new Set(parsed.progress.completedEvents || []);
          state.unlockedTrophies = new Set(parsed.progress.unlockedTrophies || []);
          await persistProgress();
        }
        renderCategoryFilters();
        renderMarkers();
        if (state.renderedViews.has("events")) renderEventsView();
        if (state.renderedViews.has("guide")) renderGuideView();
        if (state.renderedViews.has("collectibles")) renderCollectiblesView();
        toast(`Importados ${state.markers.length} marcadores.`);
      } catch (err) {
        toast(`Error al importar JSON: ${err.message}`, true);
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // EVENT BINDINGS (INCLUDING 2-FINGER TOUCH PINCH-TO-ZOOM)
  // =========================================================================
  function bindEvents() {
    document.querySelectorAll(".nav-tab, .mob-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    $("mobile-backdrop")?.addEventListener("click", () => {
      $("sidebar").classList.add("collapsed");
      if (!$("inspector").classList.contains("hidden")) closeInspector();
      else updateMobileBackdrop();
    });

    $("btn-add-pin").addEventListener("click", () => {
      if (state.activeView !== "map") switchView("map");
      setPlacementMode(!state.placing);
    });
    $("btn-cancel-placement").addEventListener("click", () => setPlacementMode(false));

    $("btn-measure-route").addEventListener("click", () => {
      if (state.activeView !== "map") switchView("map");
      setMeasureMode(!state.measuring);
    });
    $("btn-route-undo").addEventListener("click", () => {
      state.routePoints.pop();
      renderRoute();
    });
    $("btn-route-clear").addEventListener("click", () => {
      state.routePoints = [];
      renderRoute();
    });
    $("btn-route-close").addEventListener("click", () => setMeasureMode(false));

    $("btn-theme-night").addEventListener("click", () => setMapTheme("night"));
    $("btn-theme-day").addEventListener("click", () => setMapTheme("day"));

    $("btn-export-json").addEventListener("click", exportCommunityJson);
    $("input-import-json").addEventListener("change", (e) => {
      importCommunityJson(e.target.files?.[0]);
      e.target.value = "";
    });

    $("region-bar").addEventListener("click", (e) => {
      const btn = e.target.closest(".region-tab");
      if (btn) jumpToRegion(btn.dataset.regionId, true);
    });

    $("map-search").addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      $("btn-clear-search").classList.toggle("hidden", !state.searchQuery);
      renderMarkers();
    });
    $("btn-clear-search").addEventListener("click", () => {
      state.searchQuery = "";
      $("map-search").value = "";
      $("btn-clear-search").classList.add("hidden");
      renderMarkers();
    });
    $("chk-hide-found").addEventListener("change", (e) => {
      state.hideFound = e.target.checked;
      renderMarkers();
    });
    $("chk-show-labels").addEventListener("change", (e) => {
      state.showLabels = e.target.checked;
      renderMarkers();
    });

    $("category-filters").addEventListener("click", (e) => {
      const chip = e.target.closest(".cat-chip");
      if (!chip) return;
      const cat = chip.dataset.cat;
      if (state.enabledCategories.has(cat)) state.enabledCategories.delete(cat);
      else state.enabledCategories.add(cat);
      renderCategoryFilters();
      renderMarkers();
    });
    $("btn-cat-all").addEventListener("click", () => {
      state.enabledCategories = new Set(Object.keys(CATEGORIES));
      renderCategoryFilters();
      renderMarkers();
    });
    $("btn-cat-none").addEventListener("click", () => {
      state.enabledCategories.clear();
      renderCategoryFilters();
      renderMarkers();
    });

    $("marker-list").addEventListener("click", (e) => {
      const item = e.target.closest(".marker-item");
      if (item) openInspector(item.dataset.markerId, true);
    });
    $("map-pins-layer").addEventListener("click", (e) => {
      const pin = e.target.closest(".map-pin");
      if (!pin) return;
      e.stopPropagation();
      if (state.placing) return;
      if (state.measuring) {
        const m = state.markers.find((x) => x.id === pin.dataset.markerId);
        if (m) {
          state.routePoints.push({ x: m.x, y: m.y });
          renderRoute();
        }
        return;
      }
      openInspector(pin.dataset.markerId, false);
    });

    const vp = $("map-viewport");
    vp.addEventListener("wheel", (e) => {
      e.preventDefault();
      // Smooth normalized zoom step for both mouse wheel & precision trackpads
      const clampedDelta = Math.max(-140, Math.min(140, e.deltaY));
      const factor = Math.pow(1.0018, -clampedDelta);
      zoomAt(e.clientX, e.clientY, factor);
    }, { passive: false });

    vp.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (e.target.closest(".map-pin")) return;
      cancelCameraTween();
      state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      vp.setPointerCapture(e.pointerId);

      if (state.pointers.size === 1) {
        state.dragging = true;
        state.dragMoved = 0;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.dragOrigTx = state.tx;
        state.dragOrigTy = state.ty;
        vp.classList.add("dragging");
      } else if (state.pointers.size === 2) {
        state.dragging = false;
        const pts = Array.from(state.pointers.values());
        state.lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        state.lastPinchMidX = (pts[0].x + pts[1].x) / 2;
        state.lastPinchMidY = (pts[0].y + pts[1].y) / 2;
      }
    });

    vp.addEventListener("pointermove", (e) => {
      if (state.pointers.has(e.pointerId)) {
        state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // 2-finger simultaneous pinch-zoom + smooth pan on mobile/tablet touch screens
      if (state.pointers.size === 2) {
        const pts = Array.from(state.pointers.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        if (state.lastPinchDist > 10 && dist > 10) {
          if (state.lastPinchMidX || state.lastPinchMidY) {
            state.tx += midX - state.lastPinchMidX;
            state.ty += midY - state.lastPinchMidY;
          }
          zoomAt(midX, midY, dist / state.lastPinchDist);
        }
        state.lastPinchDist = dist;
        state.lastPinchMidX = midX;
        state.lastPinchMidY = midY;
        return;
      }

      if (state.dragging) {
        const dx = e.clientX - state.dragStartX;
        const dy = e.clientY - state.dragStartY;
        state.dragMoved = Math.max(state.dragMoved, Math.hypot(dx, dy));
        state.tx = state.dragOrigTx + dx;
        state.ty = state.dragOrigTy + dy;
        scheduleRender();
        return;
      }

      // Throttle hover coordinate HUD updates to 1 rAF (zero main-thread spam)
      state.hoverClientX = e.clientX;
      state.hoverClientY = e.clientY;
      if (!state.hoverRafId) {
        state.hoverRafId = requestAnimationFrame(() => {
          state.hoverRafId = 0;
          if (state.hoverClientX == null || state.dragging) return;
          const pos = clientToMapPercent(state.hoverClientX, state.hoverClientY);
          const cText = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}`;
          const gText = coordsToGridSector(pos.x, pos.y);
          if (cText !== state.lastCoordsText) {
            state.lastCoordsText = cText;
            $("hud-coords").textContent = cText;
          }
          if (gText !== state.lastGridText) {
            state.lastGridText = gText;
            $("hud-grid").textContent = gText;
          }
        });
      }
    });

    const endPointer = (e) => {
      state.pointers.delete(e.pointerId);
      if (vp.hasPointerCapture(e.pointerId)) {
        vp.releasePointerCapture(e.pointerId);
      }
      if (state.pointers.size < 2) {
        state.lastPinchDist = 0;
        state.lastPinchMidX = 0;
        state.lastPinchMidY = 0;
      }
      if (!state.dragging) return;
      state.dragging = false;
      vp.classList.remove("dragging");

      if (state.dragMoved < 8) {
        const pos = clientToMapPercent(e.clientX, e.clientY);
        if (state.placing) {
          state.reticleCoords = { x: pos.x, y: pos.y };
          $("placement-reticle").classList.remove("hidden");
          scheduleRender();
          openPinModal({ x: pos.x, y: pos.y });
        } else if (state.measuring && pos.inside) {
          state.routePoints.push({ x: pos.x, y: pos.y });
          renderRoute();
        } else if (e.pointerType === "touch") {
          const now = Date.now();
          if (now - state.lastTapTime < 320 && Math.hypot(e.clientX - state.lastTapX, e.clientY - state.lastTapY) < 42) {
            zoomAt(e.clientX, e.clientY, 1.75);
            state.lastTapTime = 0;
          } else {
            state.lastTapTime = now;
            state.lastTapX = e.clientX;
            state.lastTapY = e.clientY;
          }
        }
      }
    };
    vp.addEventListener("pointerup", endPointer);
    vp.addEventListener("pointercancel", endPointer);

    vp.addEventListener("dblclick", (e) => {
      if (state.placing || state.measuring || e.target.closest(".map-pin")) return;
      zoomAt(e.clientX, e.clientY, 1.75);
    });

    const mm = $("minimap-panel");
    const panFromMinimap = (e) => {
      const r = mm.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      cancelCameraTween();
      state.tx = state.vpW / 2 - (xPct / 100) * state.imgW * state.scale;
      state.ty = state.vpH / 2 - (yPct / 100) * state.imgH * state.scale;
      scheduleRender();
    };
    mm.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      state.minimapDragging = true;
      mm.setPointerCapture(e.pointerId);
      panFromMinimap(e);
    });
    mm.addEventListener("pointermove", (e) => {
      if (!state.minimapDragging) return;
      panFromMinimap(e);
    });
    mm.addEventListener("pointerup", (e) => {
      state.minimapDragging = false;
      if (mm.hasPointerCapture(e.pointerId)) mm.releasePointerCapture(e.pointerId);
    });

    $("btn-zoom-in").addEventListener("click", () => {
      const r = state.vpRect || vp.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.45);
    });
    $("btn-zoom-out").addEventListener("click", () => {
      const r = state.vpRect || vp.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.45);
    });
    $("btn-zoom-fit").addEventListener("click", () => fitMapToViewport(true));
    $("btn-toggle-pins").addEventListener("click", () => {
      state.showPins = !state.showPins;
      $("btn-toggle-pins").classList.toggle("is-on", state.showPins);
      $("map-pins-layer").classList.toggle("pins-hidden", !state.showPins);
      if (state.showPins) scheduleRender();
    });
    $("btn-toggle-sidebar").addEventListener("click", () => {
      const opening = $("sidebar").classList.contains("collapsed");
      $("sidebar").classList.toggle("collapsed");
      if (opening && window.innerWidth <= 760 && !$("inspector").classList.contains("hidden")) {
        closeInspector();
      }
      updateMobileBackdrop();
      requestAnimationFrame(() => {
        syncCanvasSize();
        scheduleRender();
      });
    });

    // Inspector actions
    $("btn-close-inspector").addEventListener("click", closeInspector);
    $("insp-media").addEventListener("click", () => {
      const m = state.markers.find((x) => x.id === state.selectedMarkerId);
      if (m?.image) openLightbox(m.image, m.title, m.region || "Leonida");
    });
    $("insp-wordmark-bar").addEventListener("click", () => {
      const m = state.markers.find((x) => x.id === state.selectedMarkerId);
      if (m?.wordmark) openLightbox(m.wordmark, m.title, m.region || "Distrito de Leonida");
    });
    $("insp-event-guide").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-event]");
      if (!btn) return;
      state.highlightedEventId = btn.dataset.openEvent;
      state.eventType = "all";
      state.eventSearch = "";
      $("events-search").value = "";
      renderEventsView();
      switchView("events");
    });

    $("btn-insp-share").addEventListener("click", async () => {
      const mid = state.selectedMarkerId;
      if (!mid) return;
      const shareUrl = `${window.location.origin}${window.location.pathname}?pin=${encodeURIComponent(mid)}&zoom=4.8`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast("Enlace directo copiado al portapapeles.");
      } catch (_) {
        window.prompt("Copia este enlace directo:", shareUrl);
      }
    });

    $("btn-insp-found").addEventListener("click", async () => {
      const mid = state.selectedMarkerId;
      if (!mid) return;
      if (state.foundMarkers.has(mid)) state.foundMarkers.delete(mid);
      else state.foundMarkers.add(mid);
      await persistProgress();
      openInspector(mid, false);
    });

    $("btn-insp-vote").addEventListener("click", async () => {
      const mid = state.selectedMarkerId;
      if (!mid) return;
      try {
        if (state.hasLocalApi) {
          const res = await api(`/api/markers/${encodeURIComponent(mid)}/vote`, { method: "POST" });
          const idx = state.markers.findIndex((x) => x.id === mid);
          if (idx >= 0) state.markers[idx] = res.marker;
        } else {
          state.userPins.votes[mid] = Number(state.userPins.votes[mid] || 0) + 1;
          saveLocalUserPins();
          rebuildMergedMarkers();
        }
        openInspector(mid, false);
        toast("Voto registrado.");
      } catch (err) {
        toast(err.message, true);
      }
    });

    $("btn-insp-edit").addEventListener("click", () => {
      const m = state.markers.find((x) => x.id === state.selectedMarkerId);
      if (m) openPinModal({ editMarker: m });
    });

    $("btn-insp-delete").addEventListener("click", async () => {
      const m = state.markers.find((x) => x.id === state.selectedMarkerId);
      if (!m) return;
      if (!window.confirm(`¿Eliminar el marcador "${m.title}"?`)) return;
      try {
        if (state.hasLocalApi) {
          await api(`/api/markers/${encodeURIComponent(m.id)}`, { method: "DELETE" });
          state.markers = state.markers.filter((x) => x.id !== m.id);
        } else {
          if (!state.userPins.deleted.includes(m.id)) state.userPins.deleted.push(m.id);
          state.userPins.added = state.userPins.added.filter((x) => x.id !== m.id);
          saveLocalUserPins();
          rebuildMergedMarkers();
        }
        state.foundMarkers.delete(m.id);
        await persistProgress();
        closeInspector();
        renderCategoryFilters();
        toast("Marcador eliminado.");
      } catch (err) {
        toast(err.message, true);
      }
    });

    $("comment-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const mid = state.selectedMarkerId;
      if (!mid) return;
      const author = $("comment-author").value.trim() || localStorage.getItem("gta6_author") || "Jugador";
      const text = $("comment-text").value.trim();
      if (!text) return;
      localStorage.setItem("gta6_author", author);
      try {
        if (state.hasLocalApi) {
          const res = await api(`/api/markers/${encodeURIComponent(mid)}/comments`, {
            method: "POST",
            body: JSON.stringify({ author, text }),
          });
          const idx = state.markers.findIndex((x) => x.id === mid);
          if (idx >= 0) state.markers[idx] = res.marker;
        } else {
          state.userPins.comments[mid] = state.userPins.comments[mid] || [];
          state.userPins.comments[mid].push({ author, text, createdAt: new Date().toISOString() });
          saveLocalUserPins();
          rebuildMergedMarkers();
        }
        $("comment-text").value = "";
        openInspector(mid, false);
        toast("Nota publicada.");
      } catch (err) {
        toast(err.message, true);
      }
    });

    // Pin Modal events
    $("btn-close-pin-modal").addEventListener("click", closePinModal);
    $("btn-cancel-pin-modal").addEventListener("click", closePinModal);
    $("pin-modal-backdrop").addEventListener("click", (e) => {
      if (e.target === $("pin-modal-backdrop")) closePinModal();
    });
    $("pin-form").addEventListener("submit", savePinForm);
    $("blip-picker-grid").addEventListener("click", (e) => {
      const opt = e.target.closest(".blip-opt");
      if (!opt) return;
      state.modalSelectedBlip = opt.dataset.blip;
      $("modal-preview-blip").src = blipUrl(state.modalSelectedBlip);
      renderModalBlipPicker();
    });
    $("pin-category").addEventListener("change", (e) => {
      if (!$("pin-edit-id").value) {
        const defaultBlip = CATEGORIES[e.target.value]?.blip;
        if (defaultBlip) {
          state.modalSelectedBlip = defaultBlip;
          $("modal-preview-blip").src = blipUrl(defaultBlip);
          renderModalBlipPicker();
        }
      }
    });

    // Events & Missions View events
    $("events-type-pills").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      state.eventType = btn.dataset.evType;
      state.highlightedEventId = null;
      renderEventsView();
    });
    $("events-search").addEventListener("input", (e) => {
      state.eventSearch = e.target.value;
      renderEventsView();
    });
    $("events-only-pending").addEventListener("change", (e) => {
      state.eventsOnlyPending = e.target.checked;
      renderEventsView();
    });
    $("events-grid").addEventListener("click", async (e) => {
      const gotoBtn = e.target.closest("[data-goto-marker]");
      if (gotoBtn) {
        jumpToMarkerOnMap(gotoBtn.dataset.gotoMarker);
        return;
      }
      const toggleBtn = e.target.closest("[data-toggle-event]");
      if (toggleBtn) {
        const eid = toggleBtn.dataset.toggleEvent;
        if (state.completedEvents.has(eid)) state.completedEvents.delete(eid);
        else state.completedEvents.add(eid);
        await persistProgress();
        renderEventsView();
        return;
      }
      const lb = e.target.closest("[data-lightbox-src]");
      if (lb) {
        openLightbox(lb.dataset.lightboxSrc, lb.dataset.lightboxTitle, lb.dataset.lightboxMeta);
      }
    });

    // Guide & Trophies View events
    $("mech-cat-pills").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      state.mechCat = btn.dataset.mechCat;
      state.highlightedGuideId = null;
      renderGuideView();
    });
    $("mechanics-grid").addEventListener("click", (e) => {
      const gotoBtn = e.target.closest("[data-goto-marker]");
      if (gotoBtn) jumpToMarkerOnMap(gotoBtn.dataset.gotoMarker);
    });
    $("trophy-cat-pills").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      state.trophyCat = btn.dataset.trophyCat;
      state.highlightedGuideId = null;
      renderGuideView();
    });
    $("trophy-search").addEventListener("input", (e) => {
      state.trophySearch = e.target.value;
      renderGuideView();
    });
    $("trophy-only-pending").addEventListener("change", (e) => {
      state.trophiesOnlyPending = e.target.checked;
      renderGuideView();
    });
    $("trophies-grid").addEventListener("click", async (e) => {
      const gotoBtn = e.target.closest("[data-goto-marker]");
      if (gotoBtn) {
        jumpToMarkerOnMap(gotoBtn.dataset.gotoMarker);
        return;
      }
      const openEvBtn = e.target.closest("[data-open-event]");
      if (openEvBtn) {
        state.highlightedEventId = openEvBtn.dataset.openEvent;
        state.eventType = "all";
        state.eventSearch = "";
        $("events-search").value = "";
        renderEventsView();
        switchView("events");
        return;
      }
      const toggleBtn = e.target.closest("[data-toggle-trophy]");
      if (toggleBtn) {
        const tid = toggleBtn.dataset.toggleTrophy;
        if (state.unlockedTrophies.has(tid)) state.unlockedTrophies.delete(tid);
        else state.unlockedTrophies.add(tid);
        await persistProgress();
        renderGuideView();
      }
    });

    // Global Search (Ctrl+K) events
    $("btn-global-search").addEventListener("click", () => openGlobalSearch(""));
    $("global-search-backdrop").addEventListener("click", (e) => {
      if (e.target === $("global-search-backdrop")) closeGlobalSearch();
    });
    $("global-search-input").addEventListener("input", (e) => {
      renderGlobalSearchResults(e.target.value);
    });
    $("global-search-input").addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCmdActive(state.cmdActiveIdx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCmdActive(state.cmdActiveIdx - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCmdItem(state.cmdItems[state.cmdActiveIdx]);
      }
    });
    $("global-search-results").addEventListener("click", (e) => {
      const quick = e.target.closest("[data-quick-q]");
      if (quick) {
        const q = quick.dataset.quickQ;
        $("global-search-input").value = q;
        renderGlobalSearchResults(q);
        $("global-search-input").focus();
        return;
      }
      const itemBtn = e.target.closest("[data-cmd-idx]");
      if (itemBtn) {
        executeCmdItem(state.cmdItems[Number(itemBtn.dataset.cmdIdx)]);
      }
    });

    // Collectibles View events
    $("coll-cat-pills").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      state.collCat = btn.dataset.collCat;
      renderCollectiblesView();
    });
    $("coll-search").addEventListener("input", (e) => {
      state.collSearch = e.target.value;
      renderCollectiblesView();
    });
    $("coll-only-pending").addEventListener("change", (e) => {
      state.collOnlyPending = e.target.checked;
      renderCollectiblesView();
    });
    $("collectibles-grid").addEventListener("click", async (e) => {
      const gotoBtn = e.target.closest("[data-goto-marker]");
      if (gotoBtn) {
        jumpToMarkerOnMap(gotoBtn.dataset.gotoMarker);
        return;
      }
      const toggleBtn = e.target.closest("[data-toggle-coll]");
      if (toggleBtn) {
        const cid = toggleBtn.dataset.toggleColl;
        if (state.foundCollectibles.has(cid)) state.foundCollectibles.delete(cid);
        else state.foundCollectibles.add(cid);
        await persistProgress();
        renderCollectiblesView();
        return;
      }
      const lb = e.target.closest("[data-lightbox-src]");
      if (lb) {
        openLightbox(lb.dataset.lightboxSrc, lb.dataset.lightboxTitle, lb.dataset.lightboxMeta);
      }
    });

    // Arsenal & Garage View events
    $("arsenal-cat-pills").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      state.arsenalCat = btn.dataset.arsenalCat;
      renderArsenalView();
    });
    $("arsenal-search").addEventListener("input", (e) => {
      state.arsenalSearch = e.target.value;
      renderArsenalView();
    });
    $("arsenal-grid").addEventListener("click", (e) => {
      const gotoBtn = e.target.closest("[data-goto-marker]");
      if (gotoBtn) {
        jumpToMarkerOnMap(gotoBtn.dataset.gotoMarker);
        return;
      }
      const lb = e.target.closest("[data-lightbox-src]");
      if (lb) {
        openLightbox(lb.dataset.lightboxSrc, lb.dataset.lightboxTitle, lb.dataset.lightboxMeta);
      }
    });

    // Districts & Map Icons View events
    $("blips-group-pills").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      state.blipGroup = btn.dataset.blipGroup;
      renderBlipsView();
    });
    $("blips-catalog-grid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-use-blip]");
      if (btn) {
        const bid = btn.dataset.useBlip;
        switchView("map");
        setPlacementMode(true, bid);
        toast("Haz clic en el mapa para colocar tu marcador.");
        return;
      }
      const lb = e.target.closest("[data-lightbox-src]");
      if (lb) {
        openLightbox(lb.dataset.lightboxSrc, lb.dataset.lightboxTitle, lb.dataset.lightboxMeta);
      }
    });

    // Lightbox & Keyboard shortcuts
    $("btn-close-lightbox").addEventListener("click", closeLightbox);
    $("lightbox").addEventListener("click", (e) => {
      if (e.target === $("lightbox")) closeLightbox();
    });
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if ($("global-search-backdrop").classList.contains("hidden")) openGlobalSearch("");
        else closeGlobalSearch();
        return;
      }

      const tag = (e.target?.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";

      if (e.key === "Escape") {
        if (!$("global-search-backdrop").classList.contains("hidden")) closeGlobalSearch();
        else if (!$("lightbox").classList.contains("hidden")) closeLightbox();
        else if (!$("pin-modal-backdrop").classList.contains("hidden")) closePinModal();
        else if (state.placing) setPlacementMode(false);
        else if (state.measuring) setMeasureMode(false);
        else if (!$("inspector").classList.contains("hidden")) closeInspector();
        return;
      }
      if (typing || state.activeView !== "map") return;

      const k = e.key.toLowerCase();
      if (k === "f") {
        fitMapToViewport(true);
      } else if (k === "p") {
        $("btn-toggle-pins").click();
      } else if (k === "m") {
        setMeasureMode(!state.measuring);
      } else if (k === "n") {
        setMapTheme(state.mapTheme === "night" ? "day" : "night");
      } else if (k === "l") {
        $("chk-show-labels").checked = !state.showLabels;
        state.showLabels = $("chk-show-labels").checked;
        renderMarkers();
      } else if (e.key === "+" || e.key === "=") {
        $("btn-zoom-in").click();
      } else if (e.key === "-") {
        $("btn-zoom-out").click();
      } else if (e.key === "/") {
        e.preventDefault();
        $("map-search").focus();
      }
    });
    window.addEventListener("resize", () => {
      updateMobileBackdrop();
      if (state.activeView === "map") {
        syncCanvasSize();
        scheduleRender();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
