import Link from "next/link";
import { notFound } from "next/navigation";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { listTrees } from "@/lib/history-check/trees";
import { listExamChecklists } from "@/lib/history-check/exams";
import { listFluidTopics } from "@/lib/fluids/topics";
import { FLUID_GROUPS, FLUID_GROUP_LABEL } from "@/lib/fluids/types";

/**
 * The academic shelf: every complaint tree and examination checklist the app ships, as
 * reading material. Nothing here is about a patient. Behind the same flag as the card.
 */
export default function LearnIndexPage() {
  if (!historyCheckEnabled()) notFound();
  const trees = listTrees();
  const exams = listExamChecklists();
  const fluids = listFluidTopics();
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/" className="text-body text-accent">‹ Home</Link>
        <p className="text-footnote text-muted">Learn</p>
      </header>
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">Taking a history</p>
        <ul className="ios-group">
          {trees.map((t) => (
            <li key={t.id}>
              <Link href={`/learn/history/${t.id}`} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-subhead last:border-b-0 active:bg-chip">
                <span>{t.complaint}</span>
                <span className="text-title3 text-muted">›</span>
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
              <Link href={`/learn/examination/${e.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-subhead active:bg-chip">
                <span>{e.title}</span>
                <span className="text-title3 text-muted">›</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 px-4 text-caption text-muted">
          Each page shows whether a clinician has reviewed it. It lists questions to ask and signs to look for; it never states a diagnosis or a treatment.
        </p>
      </section>
      <section className="px-4 pb-6">
        <p className="ios-group-header mb-2 px-4">IV Fluid and Electrolyte Correction</p>
        <p className="mb-3 px-4 text-[12px] text-muted">
          A digest of Pandya&apos;s <span className="italic">Practical Guidelines on Fluid Therapy</span>, 3rd edition. Unlike the lists above these pages carry the book&apos;s doses, rates and targets, each quoted with its page; every topic stays pending until a clinician signs it off.
        </p>
        {FLUID_GROUPS.map((g) => {
          const topics = fluids.filter((t) => t.group === g);
          if (topics.length === 0) return null;
          return (
            <div key={g} className="mb-4">
              <p className="mb-1 px-4 text-[12px] font-semibold text-muted">{FLUID_GROUP_LABEL[g]}</p>
              <ul className="ios-group">
                {topics.map((t) => (
                  <li key={t.id}>
                    <Link href={`/learn/fluids/${t.id}`} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0 active:bg-chip">
                      <span className="min-w-0">
                        <span className="block text-[15px]">{t.title}</span>
                        <span className="block truncate text-[12px] text-muted">{t.summary}</span>
                      </span>
                      <span className="text-xl text-muted">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
