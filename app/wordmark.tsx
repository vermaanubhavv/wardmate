/**
 * The app's name, and the space a logo will eventually occupy.
 *
 * Temporary on purpose: the mark to the left is a plain accent tile standing in for artwork,
 * and the whole row is sized so that dropping a real logo in its place changes nothing around
 * it — same height, same alignment, same gap to the ward name below.
 *
 * Set in the system face the rest of the app uses — SF Pro on an iPhone — at tight tracking.
 * A second font for one word would cost a download on a hospital connection to say the same
 * thing in a slightly different shape.
 */
export default function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      {/* Stand-in for the logo. Fixed square so artwork can replace it in place. */}
      <span
        aria-hidden
        className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-accent text-[13px] font-bold leading-none text-accent-ink"
      >
        W
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Ward<span className="text-muted">Mate</span>
      </span>
    </div>
  );
}
