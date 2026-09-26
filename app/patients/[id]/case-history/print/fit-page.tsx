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
 * One side of the history sheet, as a fixed A4 frame.
 *
 * The side is exactly one page tall and lays its content out as a column, so the ruled writing
 * areas inside it (`flex-1`) stretch to take up whatever the recorded content leaves — a sparse
 * patient gets more room to write, never a half-empty page. When the content is taller than the
 * page even with those areas at their minimum, the whole side is zoomed down just enough to fit,
 * and enlarged by the same factor so it still fills the page edge to edge. Nothing is cut: a
 * side that cannot fit even at MIN_ZOOM spills onto a second page.
 *
 * Laid out at the printed size on screen too, so what is measured here is what prints.
 */
export default function FitPage({ children, breakAfter = false }: { children: React.ReactNode; breakAfter?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const size = (z: number) => {
      el.style.zoom = String(z);
      el.style.width = `${PAGE_W_MM / z}mm`;
      el.style.height = `${PAGE_H_MM / z}mm`;
    };
    // Both heights are in the element's own units, so the comparison holds at any zoom.
    const overflows = () => el.scrollHeight > el.clientHeight + 1;
    const fit = () => {
      let z = 1;
      size(z);
      for (let i = 0; i < 10 && overflows() && z > MIN_ZOOM; i++) {
        z = Math.max(MIN_ZOOM, z * Math.min(0.97, el.clientHeight / el.scrollHeight));
        size(z);
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
      style={{
        zoom,
        width: `${PAGE_W_MM / zoom}mm`,
        height: `${PAGE_H_MM / zoom}mm`,
        breakAfter: breakAfter ? "page" : undefined,
      }}
      className="flex flex-col overflow-hidden bg-white shadow-[0_0_0_12mm_white,0_2px_16px_12mm_rgba(0,0,0,0.12)] print:overflow-visible print:shadow-none"
    >
      {children}
    </div>
  );
}
