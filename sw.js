const CACHE = "tlk-2026-27-v24";
self.addEventListener("install", (e) => { e.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request, { cache: "no-store" }).catch(() => caches.match(e.request)));
});
