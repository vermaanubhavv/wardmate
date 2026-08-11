// Deliberately minimal for now: it exists so the phone will offer "Add to Home Screen",
// and it caches only the icons. Nothing clinical is cached, so you can never be shown a
// stale patient record. Real offline support comes later, once the data model is settled.
const CACHE = "coreresident-static-v1";
const ASSETS = ["/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "GET" && ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
  }
});
