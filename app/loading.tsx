/**
 * What the ward list looks like while its data is on the way.
 *
 * The point is not decoration. Every screen here is server-rendered against a database in
 * another city, so a tap used to leave the old screen sitting there for a second or more with
 * nothing to say it had registered — which reads as a missed tap, and gets tapped again.
 * Next.js swaps this in the instant the navigation starts, so the response is immediate even
 * when the answer is not.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-16">
      <div className="h-9 w-40 rounded-lg bg-chip" />
      <div className="mt-3 h-4 w-24 rounded bg-chip" />

      <div className="mt-6 ios-group">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="ios-row flex items-center gap-3 px-4 py-3.5">
            <div className="h-7 w-9 shrink-0 rounded-md bg-chip" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-1/2 rounded bg-chip" />
              <div className="mt-2 h-3 w-3/4 rounded bg-chip" />
            </div>
          </div>
        ))}
      </div>

      {/* Deliberately still: a pulsing skeleton on a screen that appears for half a second
          draws more attention to the wait than it hides. */}
      <span className="sr-only">Loading the ward</span>
    </div>
  );
}
