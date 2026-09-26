"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** A4 less the print margins set on the sheet's page: 297 − 2 × 12 mm tall, 210 − 12 − 20 mm
 *  wide (the binding gutter). A hair under, so rounding never pushes a side onto a second page. */
const PAGE_H_MM = 271;
const PAGE_W_MM = 178;
/** Below this the text stops being readable on paper; a side that still does not fit overflows
 *  onto a second page rather than printing unreadably small. */
const MIN_ZOOM = 0.6;

/**
 * One side of the history sheet, held to exactly one A4 page.
 *
 * Laid out at the printed width on screen too, so what is measured here is what prints. When
 * the content runs taller than the page, the whole side is zoomed down just enough to fit —
 * and widened by the same factor, so it still fills the page edge to edge. Nothing is cut:
 * a side that cannot fit even at MIN_ZOOM is left to spill over.
 */
export default function FitPage({ children, breakAfter = false }: { children: React.ReactNode; breakAfter?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      // Measure at zoom 1 and full width: a millimetre probe gives the page height in CSS px.
      el.style.zoom = "1";
      el.style.width = `${PAGE_W_MM}mm`;
      const probe = document.createElement("div");
      probe.style.height = `${PAGE_H_MM}mm`;
      document.body.appendChild(probe);
      const budget = probe.getBoundingClientRect().height;
      probe.remove();
      let z = 1;
      // Zooming and widening reflows the text into fewer lines, so step down until it fits.
      for (let i = 0; i < 8; i++) {
        el.style.zoom = String(z);
        el.style.width = `${PAGE_W_MM / z}mm`;
        // The rendered (zoomed) height — what lands on paper.
        const h = el.getBoundingClientRect().height;
        if (h <= budget || z <= MIN_ZOOM) break;
        z = Math.max(MIN_ZOOM, z * Math.min(0.97, budget / h));
      }
      setZoom(z);
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("beforeprint", fit);
    return () => window.removeEventListener("beforeprint", fit);
  }, [children]);

  return (
    <div
      ref={ref}
      style={{ zoom, width: `${PAGE_W_MM / zoom}mm`, breakAfter: breakAfter ? "page" : undefined }}
      className="mx-auto bg-white print:mx-0"
    >
      {children}
    </div>
  );
}
