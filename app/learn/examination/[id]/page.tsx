import Link from "next/link";
import { notFound } from "next/navigation";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { getExamChecklist } from "@/lib/history-check/exams";
import { statusChip } from "@/app/patients/[id]/card-kit";
import ReferenceList from "../../reference-list";

/**
 * An examination checklist as a teaching page. Every point has an (i) beside it that opens
 * how to elicit the sign and what a positive finding is seen in. Plain <details>, so the page
 * works with no script and the whole thing can be read offline once loaded.
 */
export default async function LearnExaminationPage({ params }: { params: Promise<{ id: string }> }) {
  if (!historyCheckEnabled()) notFound();
  const { id } = await params;
  const list = getExamChecklist(id);
  if (!list) notFound();
  const count = list.sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/learn" className="text-[17px] text-accent">‹ Learn</Link>
        <p className="truncate text-[13px] text-muted">{list.title}</p>
      </header>

      <section className="px-4 pb-4">
        <div className="ios-group px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-[20px] font-semibold">{list.title}</h1>
            {statusChip(list.reviewStatus === "reviewed" ? `Reviewed · ${list.reviewedBy}` : "Pending clinician review", list.reviewStatus === "reviewed" ? "ok" : "warn")}
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {list.setting} · v{list.version} · {count} points in {list.sections.length} sections
          </p>
          <p className="mt-2 text-[13px]">
            Tap <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-accent text-[11px] font-semibold text-accent">i</span> beside any point for how to check it and what a finding is seen in.
          </p>
        </div>
      </section>

      {list.sections.map((s) => (
        <section key={s.id} className="px-4 pb-4">
          <p className="ios-group-header mb-2 px-4">{s.title}</p>
          {s.intro && <p className="mb-2 px-4 text-[13px] text-muted">{s.intro}</p>}
          <ol className="ios-group">
            {s.items.map((it) => (
              <li key={it.id} className="border-b border-line last:border-b-0">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 active:bg-chip [&::-webkit-details-marker]:hidden">
                    <span className="text-[15px]">
                      {it.label}
                      {it.tier === "detailed" && <span className="ml-1.5 text-[11px] text-muted">detailed</span>}
                    </span>
                    <span
                      aria-label={`How to check ${it.label}`}
                      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-accent text-[12px] font-semibold text-accent group-open:bg-accent group-open:text-accent-ink"
                    >
                      i
                    </span>
                  </summary>
                  <div className="border-t border-line bg-chip/40 px-4 py-3 text-[13px] leading-snug">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">How to check</p>
                    <p className="mt-0.5">{it.how}</p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-muted">Seen in</p>
                    <p className="mt-0.5">{it.significance}</p>
                    {it.normal && (
                      <>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-muted">Record as normal</p>
                        <p className="mt-0.5">{it.normal}</p>
                      </>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <ReferenceList references={list.references} />
    </div>
  );
}
