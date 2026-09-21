import Link from "next/link";
import { notFound } from "next/navigation";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { listTrees } from "@/lib/history-check/trees";
import { listExamChecklists } from "@/lib/history-check/exams";

/**
 * The academic shelf: every complaint tree and examination checklist the app ships, as
 * reading material. Nothing here is about a patient. Behind the same flag as the card.
 */
export default function LearnIndexPage() {
  if (!historyCheckEnabled()) notFound();
  const trees = listTrees();
  const exams = listExamChecklists();
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/" className="text-[17px] text-accent">‹ Home</Link>
        <p className="text-[13px] text-muted">Learn</p>
      </header>
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Taking a history</p>
        <ul className="ios-group">
          {trees.map((t) => (
            <li key={t.id}>
              <Link href={`/learn/history/${t.id}`} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-[15px] last:border-b-0 active:bg-chip">
                <span>{t.complaint}</span>
                <span className="text-xl text-muted">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Examination</p>
        <ul className="ios-group">
          {exams.map((e) => (
            <li key={e.id}>
              <Link href={`/learn/examination/${e.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px] active:bg-chip">
                <span>{e.title}</span>
                <span className="text-xl text-muted">›</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 px-4 text-[12px] text-muted">
          Content is pending clinician review. It lists questions to ask and signs to look for; it never states a diagnosis or a treatment.
        </p>
      </section>
    </div>
  );
}
