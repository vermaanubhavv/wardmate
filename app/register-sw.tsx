"use client";

import { useEffect } from "react";

/** Tells the phone's browser about /sw.js, which is what makes "Add to Home Screen" work. */
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
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
