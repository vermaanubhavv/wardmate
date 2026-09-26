"use client";

import { useEffect } from "react";

/** Tells the phone's browser about /sw.js, which is what makes "Add to Home Screen" work. */
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Under `next dev` chunk names are stable across edits, so the worker's cache-first
    // /_next/static/ rule would pin stale CSS/JS. Drop any worker a dev tab picked up.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .then(() => caches.keys())
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not being installable is not worth breaking the page over.
    });

    // Being on /login means there is no session, so any ward screens sitting in the offline
    // cache belong to somebody who has signed out. A shared phone must not keep them.
    if (window.location.pathname.startsWith("/login")) {
      navigator.serviceWorker.ready
        .then((reg) => reg.active?.postMessage("clear-pages"))
        .catch(() => {});
    }
  }, []);
  return null;
}
