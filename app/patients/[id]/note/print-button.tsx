"use client";

/** The browser's own print dialog — the sheet below is styled for it (see the @media print
 *  rules on the page), so this is the whole implementation. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full rounded-xl bg-card px-4 py-3 text-center text-body font-semibold text-accent active:opacity-70 print:hidden"
    >
      Print
    </button>
  );
}
