/* GTA VI — Atlas de Leonida · PWA Service Worker
   - /api/*       -> Always live network (never cached)
   - /extracted/* -> Cache-first (immutable images & maps for instant mobile load)
   - Shell & JSON -> Network-first with cache fallback when offline
*/
const CACHE_NAME = "leonida-atlas-v4";
const CORE_SHELL = [
  "/",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/data/assets.json",
  "/data/markers.json",
  "/data/events.json",
  "/data/guides.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept live community API
  if (url.pathname.startsWith("/api/")) return;

  // Immutable extracted images & maps: cache-first
  if (url.pathname.startsWith("/extracted/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  // App shell & data JSONs: network-first with offline fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
