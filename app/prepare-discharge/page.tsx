import Link from "next/link";
import { getCurrentWard, getActivePatients } from "@/lib/ward";
import { compareBeds } from "@/lib/patients";

/**
 * "Prepare discharge" from the ward screen: which patient?
 *
 * Two answers, and they are genuinely different things. A patient on the list gets a record —
 * the papers become observations, the to-do list updates, every value can be traced back to
 * the page it came from. A one-off gets a document and nothing else. Both are offered here,
 * with the difference said plainly rather than left to be discovered.
 */
export default async function PrepareDischargeChooser() {
  const { ward } = await getCurrentWard();
  const { patients } = ward ? await getActivePatients(ward.id) : { patients: [] };
  const sorted = [...patients].sort((a, b) => compareBeds(a.bed, b.bed));

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-16 pt-8">
      <Link href="/ward" className="text-body text-accent">
        ‹ Ward
      </Link>
      <h1 className="mt-3 ios-large-title text-title1 leading-tight">Prepare discharge</h1>
      <p className="mt-1 text-subhead text-muted">
        Photograph the papers and let them fill the summary.
      </p>

      {sorted.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-subhead text-muted">A patient on this unit</p>
          <ul className="ios-group divide-y divide-line">
            {sorted.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/patients/${p.id}/prepare-discharge`}
                  className="flex items-baseline gap-3 px-4 py-3 active:bg-chip"
                >
                  {p.bed && (
                    <span className="shrink-0 rounded-md bg-chip px-1.5 py-0.5 text-footnote tabular-nums">
                      {p.bed}
                    </span>
                  )}
                  <span className="flex-1 truncate text-subhead">{p.display_name}</span>
                  <span className="shrink-0 text-footnote text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-footnote leading-relaxed text-muted">
            The papers become part of that patient&rsquo;s record, so every line of the summary
            can be traced back to the page it came from.
          </p>
        </section>
      )}

      <section className="mt-8">
        <p className="mb-2 text-subhead text-muted">Somebody not on this unit</p>
        <Link
          href="/prepare-discharge/new"
          className="flex w-full items-center justify-center rounded-[10px] border border-line px-4 py-3 text-body font-medium"
        >
          One-off summary
        </Link>
        <p className="mt-2 text-footnote leading-relaxed text-muted">
          For a patient who is not in WardMate — another unit&rsquo;s, or one you are only
          writing the summary for. It prints on this unit&rsquo;s heading and then keeps
          nothing: no record, no to-do list, and nothing to trace back to afterwards.
        </p>
      </section>
    </div>
  );
}
