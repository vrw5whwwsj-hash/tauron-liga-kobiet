const CACHE = "tlk-2026-27-v15";
const ASSETS = ["./" ,"./index.html","./manifest.json","./css/app.css","./css/ptr.css","./js/app.js","./js/i18n.js","./js/tv.js","./js/stats.js","./js/ptr.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const live = url.pathname.includes("/data/") || url.pathname.endsWith(".json");
  if (live) {
    e.respondWith(fetch(e.request).then((res) => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((cached) => {
    const net = fetch(e.request).then((res) => {
      if (res && res.status === 200 && e.request.method === "GET") {
        const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => cached);
    return net.catch(() => cached);
  }));
});
