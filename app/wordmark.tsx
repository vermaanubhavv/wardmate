/**
 * The app's name, and the space a logo will eventually occupy.
 *
 * Temporary on purpose: the mark to the left is a plain accent tile standing in for artwork,
 * and the whole row is sized so that dropping a real logo in its place changes nothing around
 * it — same height, same alignment, same gap to the ward name below.
 *
 * Set in Geist, which the app already loads, at tight tracking and medium weight. A second
 * font for one word would cost a download on a hospital connection to say the same thing.
 */
export default function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      {/* Stand-in for the logo. Fixed 20px square so artwork can replace it in place. */}
      <span
        aria-hidden
        className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-accent text-[13px] font-bold leading-none text-accent-ink"
      >
        C
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Core<span className="text-muted">Resident</span>
      </span>
    </div>
  );
}
