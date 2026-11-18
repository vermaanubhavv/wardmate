/**
 * The WardMate mark: a ring that tapers like a loading circle, a bead at its thick end, and
 * three dots inside — someone talking.
 *
 * One drawing for everything. The same vector is the logo standing still and the spinner
 * while the app is busy (the ring and bead turn, the dots run left to right), and
 * `assets/brand-source/wardmate-mark.svg` is this exact geometry as a file — the app icons,
 * favicon and splash are rendered from it.
 *
 * It is drawn in the accent teal by default; a caller that needs it in another colour (white
 * on the share card) sets a text colour, since every shape fills with currentColor.
 */

/** The tapering ring, in a 100 x 100 box centred on (50, 50). */
export const MARK_RING =
  "M78.99 78.99L77.41 80.46L75.75 81.84L74.01 83.13L72.22 84.32L70.36 85.41L68.45 86.40L66.49 87.29L64.49 88.07L62.45 88.75L60.38 89.31L58.29 89.76L56.17 90.11L54.05 90.34L51.91 90.45L49.78 90.46L47.65 90.35L45.53 90.12L43.43 89.79L41.35 89.35L39.30 88.79L37.29 88.14L35.31 87.37L33.38 86.51L31.50 85.54L29.68 84.48L27.91 83.32L26.21 82.07L24.59 80.74L23.03 79.32L21.56 77.83L20.16 76.26L18.86 74.62L17.64 72.92L16.52 71.16L15.49 69.34L14.56 67.48L13.74 65.56L13.01 63.62L12.39 61.63L11.88 59.62L11.47 57.59L11.17 55.54L10.98 53.49L10.90 51.42L10.93 49.36L11.07 47.31L11.31 45.26L11.66 43.24L12.12 41.24L12.68 39.27L13.35 37.34L14.11 35.44L14.98 33.59L15.93 31.79L16.98 30.05L18.12 28.36L19.35 26.75L20.66 25.20L22.04 23.72L23.50 22.32L25.03 21.00L26.62 19.76L28.28 18.62L29.99 17.56L31.75 16.60L33.56 15.73L35.41 14.96L37.29 14.29L39.21 13.72L41.15 13.25L43.11 12.89L45.08 12.63L47.06 12.47L49.04 12.42L51.02 12.48L53.00 12.64L54.95 12.90L56.89 13.26L58.81 13.73L60.69 14.30L62.54 14.96L64.35 15.72L66.11 16.57L67.82 17.51L69.48 18.54L71.08 19.66L72.62 20.85L74.09 22.13L75.48 23.48L76.81 24.89L78.05 26.38L79.21 27.92L80.29 29.52L81.28 31.17L82.18 32.87L82.99 34.62L82.26 34.95L81.38 33.30L80.41 31.70L79.36 30.15L78.22 28.67L77.02 27.24L75.74 25.89L74.40 24.61L72.99 23.40L71.52 22.26L70.00 21.21L68.43 20.25L66.81 19.36L65.15 18.57L63.45 17.86L61.72 17.25L59.96 16.73L58.18 16.30L56.38 15.97L54.57 15.73L52.76 15.59L50.94 15.55L49.12 15.60L47.32 15.75L45.52 15.99L43.75 16.32L41.99 16.75L40.27 17.27L38.57 17.88L36.92 18.57L35.30 19.35L33.73 20.22L32.21 21.16L30.75 22.18L29.34 23.27L27.99 24.44L26.71 25.67L25.50 26.97L24.36 28.32L23.29 29.74L22.30 31.20L21.39 32.71L20.57 34.27L19.82 35.86L19.17 37.49L18.60 39.15L18.12 40.83L17.73 42.54L17.43 44.26L17.22 45.99L17.10 47.72L17.08 49.46L17.15 51.20L17.30 52.92L17.55 54.63L17.89 56.33L18.31 58.00L18.82 59.64L19.42 61.26L20.10 62.83L20.86 64.37L21.70 65.86L22.62 67.31L23.60 68.70L24.66 70.03L25.79 71.31L26.98 72.52L28.23 73.67L29.54 74.75L30.90 75.76L32.31 76.69L33.76 77.55L35.25 78.33L36.79 79.02L38.35 79.64L39.94 80.17L41.56 80.61L43.19 80.97L44.84 81.25L46.50 81.43L48.16 81.53L49.83 81.54L51.49 81.47L53.14 81.30L54.78 81.06L56.40 80.72L58.00 80.30L59.58 79.80L61.12 79.22L62.63 78.56L64.10 77.82L65.53 77.01L66.91 76.12L68.24 75.17L69.53 74.15L70.75 73.06L71.92 71.92Z";
export const MARK_BEAD = { cx: 76.5, cy: 76.5, r: 8.5 };
export const MARK_DOTS = [35, 50, 65];

export default function Mark({
  className = "h-6 w-6",
  /** Turn the ring and run the dots left to right — the app is busy. */
  spinning = false,
}: {
  className?: string;
  spinning?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={`text-accent ${className}`} aria-hidden>
      <g className={spinning ? "wm-spin" : undefined}>
        <path d={MARK_RING} />
        <circle {...MARK_BEAD} />
      </g>
      {MARK_DOTS.map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="50"
          r="5.5"
          className={spinning ? "wm-dot" : undefined}
          style={spinning ? { animationDelay: `${i * 180}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
