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
// Bump these when the app's shape changes enough that a cached shell or page could render
// wrong against the new code — the activate handler below deletes every cache not named here,
// so a version bump wipes the old ones on the next load. (v2: the discharge workspace became
// a card stack; old cached discharge pages rendered the previous accordion. v3: payloads are
// keyed by path alone, and background prefetches are no longer stored. v4: a payload's key is
// marked so it can never be found for — or overwrite — the same path's page.)
const SHELL = "wardmate-shell-v2";
const PAGES = "wardmate-pages-v4";

// How long a screen's network fetch may take before the saved copy is shown instead.
const PATIENCE_MS = 3000;
// Once a fetch has run past PATIENCE_MS or failed, the signal is known to be weak, and every
// tap waiting the full three seconds before the saved copy appears is the slowness residents
// report. For the next minute the saved copy is shown after this much instead; a fetch that
// comes back fast ends the window early. Held in memory: the worker forgetting it on restart
// only means one more patient wait.
const SLOW_PATIENCE_MS = 800;
const SLOW_WINDOW_MS = 60_000;
let slowUntil = 0;
// A full page load (opened from the home screen, reloaded, or the back button) whose saved
// copy is this young is answered from the cache at once, marked as saved, while the network
// fetches the live one behind it and the bar then offers it. Opening the app was the one place
// a resident still sat through a cold Vercel instance — three seconds, on the first open of
// the morning. Only documents: in-app taps and router.refresh fetch payloads, and a refresh
// after a tick must never be answered with the copy from before it.
const RECENT_MS = 5 * 60_000;
// When this phone last sent a write (a server action, an upload, a queued card going out):
// a saved copy older than that is from before the write and must not be the first thing
// shown, or a resident sees a card they just saved come up empty. In memory — a restarted
// worker forgets it and falls back to the network-first path, which is never wrong.
let lastWriteAt = 0;

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

// Web push (patch 0115). The payload is {title, body, url}; nothing in it names a patient.
self.addEventListener("push", (event) => {
  let data = { title: "WardMate", body: "", url: "/" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // An empty or non-JSON push still shows the app's name.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).toString();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => "focus" in c);
      if (open) return open.navigate(url).then((c) => c?.focus());
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    lastWriteAt = Date.now();
    return;
  }

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

  // The ward list prefetches every patient it shows, and a prefetch is a partial payload. Stored,
  // it was what the offline lookup found first for that patient; Next.js rejected it, fell back
  // to loading the page as a document, which had never been saved, and the resident got "not
  // opened on this phone yet" for a patient they had opened. Prefetches go to the network alone.
  if (isPayload && request.headers.has("Next-Router-Prefetch")) return;

  // A payload is saved under its path with `_rsc` taken off, so there is one copy per screen and
  // each visit replaces the last. `_rsc` changes with every build and with where the tap came
  // from, so keyed by it the cache filled with near-duplicates and a lookup returned any of them.
  //
  // The `wm-payload` mark keeps it apart from the page at the same path. Without it the two
  // shared one key: whichever came last overwrote the other, and a page that took longer than
  // PATIENCE_MS was answered with the saved payload — the app drew a screen of raw React data.
  const key = isPayload
    ? (() => {
        const u = new URL(request.url);
        u.searchParams.delete("_rsc");
        u.searchParams.set("wm-payload", "1");
        return u.toString();
      })()
    : request;

  if (isDocument || isPayload) {
    const patience = Date.now() < slowUntil ? SLOW_PATIENCE_MS : PATIENCE_MS;
    const startedAt = Date.now();
    const network = fetch(request).then((res) => {
      const took = Date.now() - startedAt;
      if (took > patience) slowUntil = Date.now() + SLOW_WINDOW_MS;
      else if (took < SLOW_PATIENCE_MS) slowUntil = 0;
      // A redirect to /login means the session is gone; caching that would strand the app
      // on a sign-in page it serves to itself from disk.
      if (res.ok && res.type !== "opaqueredirect") {
        const copy = res.clone();
        caches.open(PAGES).then((c) => c.put(key, copy));
      }
      return res;
    });
    network.catch(() => {
      slowUntil = Date.now() + SLOW_WINDOW_MS;
    });
    // A slow answer still lands in the cache after the saved copy has been shown, so the
    // next open of this screen is fresher. The worker must stay alive long enough to write it.
    event.waitUntil(network.catch(() => {}));
    // The tab this answers. A payload goes back to the page that asked for it. A document is
    // the page about to be created: for a navigation out of an existing tab, event.clientId
    // names the page being LEFT, and a message sent there after the live screen lands is
    // dropped — the "newer copy" offer never showed on a reload.
    const clientId = isDocument ? event.resultingClientId || event.clientId : event.clientId;
    // When the saved copy went out first and the live one lands later, the screen is told, so
    // the bar can offer it rather than leave the resident reading a copy marked out of date.
    const tellFresh = () =>
      network.then(
        (res) => {
          if (res.ok && clientId)
            self.clients.get(clientId).then((client) => client?.postMessage({ type: "screen-fresh" }));
        },
        () => {}
      );

    // ignoreVary is load-bearing for payloads: Next.js sends `Vary: RSC` on them, so the cache
    // would only return one to a request carrying the identical RSC header. Without it the
    // entries are written and then never found again — offline support that silently does
    // nothing, which is worse than none, because it is only discovered on a ward with no signal.
    const saved = () => caches.match(key, { ignoreVary: isPayload });

    // Tells the screen whether what it is about to draw is live. A payload's page already
    // exists, so it gets a message. A document's page does not exist yet, so a saved one is
    // stamped instead: a meta tag the connection bar reads on load, carrying when it was
    // fetched. (The page's own render time cannot be trusted for this: pages with no
    // per-request data, /login among them, are rendered once at build time.)
    const report = async (res, fromCache) => {
      const date = res.headers.get("date");
      if (isPayload && clientId) {
        self.clients.get(clientId).then((client) =>
          client?.postMessage({ type: "screen", fromCache, date })
        );
      }
      if (isDocument && fromCache) {
        const html = (await res.text()).replace(
          "<head>",
          `<head><meta name="wm-saved-at" content="${date || ""}">`
        );
        const headers = new Headers(res.headers);
        headers.delete("content-length");
        return new Response(html, { status: res.status, statusText: res.statusText, headers });
      }
      return res;
    };

    // A document whose saved copy is under RECENT_MS old goes out now; the network answer
    // lands in the cache behind it and the screen is told it is there.
    const recent = async () => {
      if (!isDocument) return null;
      const hit = await saved();
      const at = Date.parse(hit?.headers.get("date") || "");
      return hit && Date.now() - at < RECENT_MS && at > lastWriteAt ? hit : null;
    };

    const fromNetwork = () =>
      // One bar of signal does not fail a fetch, it stalls it — for as long as a minute, at
      // the bedside. So the network gets PATIENCE_MS to answer and then the saved copy is
      // shown, marked as such. No saved copy: keep waiting, there is nothing better to offer.
      Promise.race([network, new Promise((r) => setTimeout(r, patience))])
        .then(async (res) => {
          if (res) return report(res, false);
          const hit = await saved();
          if (!hit) return network.then((r) => report(r, false));
          tellFresh();
          return report(hit, true);
        })
        .catch(async () => {
          const hit = await saved();
          if (hit) return report(hit, true);

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
        });

    event.respondWith(
      recent().then((hit) => {
        if (!hit) return fromNetwork();
        tellFresh();
        return report(hit, true);
      })
    );
  }
});
