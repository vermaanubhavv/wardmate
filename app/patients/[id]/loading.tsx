/**
 * What a patient looks like while the record is on the way: the navigation bar, the name
 * line, the banner, three tiles and the tab strip — the same shapes the real screen draws, so
 * nothing jumps when it arrives. Still, not pulsing, for the reason app/loading.tsx gives.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="top-bar flex min-h-11 items-center border-b border-line/60 px-4 pb-2.5">
        <div className="h-4 w-14 rounded bg-chip" />
      </div>
      <div className="px-4 pb-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-10 rounded-md bg-chip" />
          <div className="h-6 w-40 rounded bg-chip" />
        </div>
        <div className="ios-group mt-5 h-24" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[74px] rounded-[12px] bg-card" />
          ))}
        </div>
      </div>
      <div className="mx-4 h-10 rounded-[9px] bg-fill-tertiary" />
      <span className="sr-only">Loading the patient</span>
    </div>
  );
}
