const CACHE = "tlk-2026-27-v48";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function offlineResponse(request) {
  if (request.mode === "navigate") {
    return new Response(
      "<!doctype html><html lang=pl><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>VolleyNews</title><body style='font-family:-apple-system,sans-serif;background:#0b1220;color:#f6f3ec;padding:24px'><h1>VolleyNews</h1><p>Brak połączenia z serwerem. Odśwież stronę za chwilę.</p></body></html>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  return new Response("", { status: 504, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response) return response;
    } catch (err) {}
    const cached = await caches.match(event.request);
    return cached || offlineResponse(event.request);
  })());
});
