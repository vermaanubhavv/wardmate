// Offline support.
//
// The rule this has to respect: nothing clinical may be shown as if it were current when it
// is not. So pages ARE cached now — a round in a basement corridor is the case this exists
// for — but the app says plainly when what you are looking at came out of that cache, and
// when it was fetched. A stale patient record you know is stale is useful. One you think is
// live is dangerous.
//
// Writes are never cached or replayed here. They queue in IndexedDB, in the page, where the
// resident can see how many are waiting. A service worker that silently re-sent a POST could
// double-record a drug, and on iOS it cannot run in the background anyway.
const SHELL = "wardmate-shell-v1";
const PAGES = "wardmate-pages-v1";

const ASSETS = ["/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  // addAll fails the whole install if one asset 404s; each is added on its own so a missing
  // icon cannot leave the app with no service worker at all.
  event.waitUntil(
    caches.open(SHELL).then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => {}))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL && k !== PAGES).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Emptied when the app reaches /login, so a signed-out phone is not still holding the ward.
self.addEventListener("message", (event) => {
  if (event.data === "clear-pages") {
    caches.delete(PAGES);
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Build output is content-hashed, so it can be served from cache forever and fetched once.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
    return;
  }

  // Screens. Network first, always — a signal that works must win, so nobody is shown
  // yesterday's drain output while standing at the bed. The cache is the fallback only.
  //
  // Two shapes have to be caught, not one. Typing a URL or reopening the app from the home
  // screen fetches a document. But tapping a patient inside the app does NOT: Next.js fetches
  // a React payload instead, marked by an RSC header and an `_rsc` query parameter. Caching
  // only documents therefore cached only the screen the app happened to open on, and every
  // patient tapped from the list stayed unavailable offline — the exact case this is for.
  const isDocument =
    request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html");
  const isPayload = request.headers.has("RSC") || url.searchParams.has("_rsc");

  if (isDocument || isPayload) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // A redirect to /login means the session is gone; caching that would strand the app
          // on a sign-in page it serves to itself from disk.
          if (res.ok && res.type !== "opaqueredirect") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => {
          // Both relaxations are load-bearing for payloads, and neither is optional.
          //
          // ignoreSearch: the `_rsc` parameter is a build fingerprint, so after a deploy an
          // exact match misses and a patient cached this morning looks unvisited.
          //
          // ignoreVary: Next.js sends `Vary: RSC` on these, so the cache will only return one
          // to a request carrying the identical RSC header. Without this the entries are
          // written and then never found again — offline support that silently does nothing,
          // which is worse than none, because it is only discovered on a ward with no signal.
          const hit = await caches.match(request, {
            ignoreSearch: isPayload,
            ignoreVary: isPayload,
          });
          if (hit) return hit;

          // A payload has no useful fallback — the app would try to render an error page as
          // React data. Better to fail the fetch and let the app keep the screen it is on.
          if (isPayload) return Response.error();

          // Never seen this screen before, and no signal to fetch it. Say so rather than
          // showing the browser's own error, which reads like the app is broken.
          return new Response(
            `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
             <style>body{font:17px -apple-system,system-ui,sans-serif;margin:0;padding:24px;
             background:#f2f2f7;color:#000}h1{font-size:22px;margin:0 0 8px}
             p{color:#8e8e93;margin:0 0 16px;line-height:1.4}a{color:#ff3b30;text-decoration:none}</style>
             <h1>No signal</h1>
             <p>This screen has not been opened on this phone yet, so there is nothing saved to
             show. Anything you have recorded is still safe and will be sent when you are back
             online.</p>
             <p><a href="/">Go to the ward</a></p>`,
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
  }
});
