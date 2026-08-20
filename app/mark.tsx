/**
 * The WardMate mark.
 *
 * Two different sources, on purpose, and the choice is made here so no caller has to know it.
 *
 * STANDING STILL: the real artwork. `public/mark.png` is the ring cropped straight out of the
 * designer's own lockup — not a redraw, the actual pixels — so this is what "the icon is not
 * original" is asking for. Compared side by side against the vector below, the vector reads
 * darker, its gap sits at the wrong angle, and it is missing the soft fade the real arc has
 * toward its tip. Nobody should be looking at an approximation when the exact thing is sitting
 * right there.
 *
 * MOVING: a hand-measured vector reconstruction. The designer's supplied SVGs turn out to embed
 * the mark as a raster image — only the "wardmate" lettering in them is real vector — and a
 * bitmap cannot have its ring turned independently of its dots. So the spinning state alone
 * falls back to a redraw, geometry read off the rendered pixels (centre, radius, stroke width,
 * the arc's 280° sweep, dot spacing, the gradient), because animation cannot happen any other
 * way with what was supplied. It is close but not exact, and it should stay confined to the
 * few seconds a resident is looking at a spinner rather than at the brand.
 *
 * If a true vector master ever arrives from the designer, its paths replace the ones below and
 * this whole split goes away.
 */
export default function Mark({
  className = "h-6 w-6",
  /** Turn the ring and run the dots left to right — the app is busy. */
  spinning = false,
}: {
  className?: string;
  spinning?: boolean;
}) {
  if (!spinning) {
    // eslint-disable-next-line @next/next/no-img-element -- the real artwork, not a Next asset
    return <img src="/mark.png" alt="" className={className} aria-hidden />;
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="wm-ring" x1="0.1" y1="1" x2="0.95" y2="0.05">
          <stop offset="0" stopColor="#00857F" />
          <stop offset="0.45" stopColor="#009C92" />
          <stop offset="0.75" stopColor="#00B5A2" />
          <stop offset="1" stopColor="#5FD8CA" />
        </linearGradient>
      </defs>

      {/* Ring and bell turn together: the bell is the end of the tube, not a separate object. */}
      <g className="wm-spin">
        <circle
          cx="50"
          cy="50"
          r="45.4"
          fill="none"
          stroke="url(#wm-ring)"
          strokeWidth="8.9"
          strokeLinecap="round"
          /* 280° of a 285.3 circumference, less one round cap, started at the arc's own angle. */
          strokeDasharray="212.9 285.3"
          transform="rotate(35.7 50 50)"
        />
        <circle cx="91.3" cy="82.9" r="7.4" fill="#00857F" />
      </g>

      {/* Left to right, the way the reading runs. */}
      {[34.0, 52.1, 70.4].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="50.15"
          r="4.68"
          fill="#0d9c93"
          className="wm-dot"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </svg>
  );
}
