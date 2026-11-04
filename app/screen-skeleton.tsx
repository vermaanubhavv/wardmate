/**
 * What a back-bar screen (To do, To check, Handover, Unit, a round review) looks like while
 * its data is on the way: the pinned back bar, a large title, and the first group — the same
 * shapes the real screen draws, so nothing jumps when it arrives.
 *
 * The root app/loading.tsx already covers every route, but it is the ward list's shape: six
 * bed rows under a wordmark. A tap on "To do" drew a ward that then turned into a to-do list.
 * Each of those screens now names this instead. Still, not pulsing, for the reason
 * app/loading.tsx gives.
 */
export default function ScreenSkeleton({ rows = 4, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="top-bar flex min-h-11 items-center border-b border-line/60 px-4 pb-2.5">
        <div className="h-4 w-14 rounded bg-chip" />
      </div>
      <div className="px-4 pb-3 pt-4">
        <div className="h-9 w-40 rounded-lg bg-chip" />
        <div className="mt-2 h-4 w-56 rounded bg-chip" />
      </div>
      <div className="px-4">
        <div className="ios-group">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="ios-row flex items-center gap-3 px-4 py-3.5">
              <div className="h-4 w-4 shrink-0 rounded-full bg-chip" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded bg-chip" />
                <div className="mt-2 h-3 w-1/3 rounded bg-chip" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
