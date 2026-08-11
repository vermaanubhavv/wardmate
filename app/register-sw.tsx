"use client";

import { useEffect } from "react";

/** Tells the phone's browser about /sw.js, which is what makes "Add to Home Screen" work. */
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not being installable is not worth breaking the page over.
    });
  }, []);
  return null;
}
