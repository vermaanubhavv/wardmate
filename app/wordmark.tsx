/**
 * The app's name, with the real mark — no longer a placeholder tile.
 *
 * The mark is the same SVG that produced every app icon (`public/mark.svg`), inlined rather
 * than an <img>, so it inherits `currentColor` and never needs a second export whenever the
 * accent changes. Kept out of `public/icon.svg`, which is the square, backgrounded version
 * for the home screen — this is the bare ring, sized for sitting next to text.
 */
export default function Wordmark() {
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 100 100" className="h-6 w-6 shrink-0 text-accent" aria-hidden>
        <path
          d="M 70.58 25.51 A 32 32 0 1 0 70.58 74.53"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 70.58 74.53 Q 75 83 84 83"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="87.5" cy="83" r="7" fill="currentColor" />
        <circle cx="36" cy="50" r="3.8" fill="currentColor" />
        <circle cx="48" cy="50" r="3.8" fill="currentColor" />
        <circle cx="60" cy="50" r="3.8" fill="currentColor" />
      </svg>
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        ward<span className="text-accent">mate</span>
      </span>
    </div>
  );
}
