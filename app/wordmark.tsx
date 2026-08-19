/**
 * The app's name, with the real mark — the actual designed logo, not a hand-traced stand-in.
 *
 * `public/mark.png` is a raster crop of the ring-only mark from the designer's full lockup
 * (`public/logo-lockup-source.svg`), not the lettered "wm" version used on the square app icon —
 * that one carries its own letters because there is no room next to it to spell the name out.
 * A gradient ring can't be a `currentColor` SVG, so this stays a small cached raster rather than
 * a hand-redrawn vector that would drift from the design over time.
 */
export default function Wordmark() {
  return (
    <div className="flex items-center gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mark.png" alt="" className="h-6 w-6 shrink-0" aria-hidden />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        ward<span className="text-accent">mate</span>
      </span>
    </div>
  );
}
