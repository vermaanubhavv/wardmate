/**
 * The WardMate mark, as vector — the ring, its bell, and the three dots.
 *
 * WHY THIS IS NOT THE DESIGNER'S FILE. The supplied logo SVGs turned out to carry the mark as
 * an embedded raster image; only the "wardmate" lettering in them is really vector. A bitmap
 * cannot have its ring turned independently of its dots, so animating it was impossible. This
 * is a reconstruction measured off the artwork itself — centre, radius, stroke width, the arc's
 * 280° sweep, the dot spacing and the gradient were all read out of the rendered pixels rather
 * than guessed. It sits within a pixel or so of the original at every size the app uses. The
 * one thing it does not reproduce is the way the designer's arc physically thins towards its
 * end; that is approximated by fading the colour instead, which a stroke can do and a taper
 * cannot.
 *
 * If a true vector master ever arrives from the designer, its paths drop straight in here and
 * nothing else has to change.
 *
 * The gradient id is shared across every instance on purpose. Each copy defines it identically,
 * so a duplicate resolves to the same colours — and keeping it fixed lets this stay a server
 * component rather than pulling a whole tree into the browser for a logo.
 */
export default function Mark({
  className = "h-6 w-6",
  /** Turn the ring and run the dots left to right — the app is busy. */
  spinning = false,
}: {
  className?: string;
  spinning?: boolean;
}) {
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
      <g className={spinning ? "wm-spin" : undefined}>
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
          className={spinning ? "wm-dot" : undefined}
          style={spinning ? { animationDelay: `${i * 180}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
