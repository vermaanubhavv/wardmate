import Link from "next/link";
import { notFound } from "next/navigation";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { listTrees } from "@/lib/history-check/trees";
import { listExamChecklists } from "@/lib/history-check/exams";
import { listFluidTopics } from "@/lib/fluids/topics";
import { FLUID_GROUPS, FLUID_GROUP_LABEL } from "@/lib/fluids/types";
import type { HistoryTree } from "@/lib/history-check/types";
import { getSpecialtyPack, listSpecialties } from "@/lib/specialty";
import { getCurrentWard, getWardSpecialtyStored } from "@/lib/ward";
import LearnSearch from "./learn-search";

function TreeList({ trees }: { trees: HistoryTree[] }) {
  return (
    <ul className="ios-group">
      {trees.map((t) => (
        <li key={t.id} data-search={t.complaint.toLowerCase()}>
          <Link href={`/learn/history/${t.id}`} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-subhead last:border-b-0 active:bg-chip">
            <span>{t.complaint}</span>
            <span className="text-title3 text-muted">›</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The trees grouped by department: the unit's own first, in its pack's order, then every other
 * department's in the order the packs list them, each tree once (under the first department
 * that names it), and the trees no pack names under "Other".
 */
function groupTrees(trees: HistoryTree[], ownKey: string) {
  const byId = new Map(trees.map((t) => [t.id, t]));
  const placed = new Set<string>();
  const take = (ids: string[]) =>
    ids.flatMap((id) => {
      const t = byId.get(id);
      if (!t || placed.has(id)) return [];
      placed.add(id);
      return [t];
    });
  const packs = listSpecialties();
  const own = packs.find((p) => p.key === ownKey);
  const ownTrees = own ? take(own.historyTreeIds) : [];
  const others = packs
    .filter((p) => p.key !== ownKey)
    .map((p) => ({ key: p.key as string, label: p.label, trees: take(p.historyTreeIds) }));
  others.push({ key: "other", label: "Other", trees: trees.filter((t) => !placed.has(t.id)) });
  return { ownTrees, others: others.filter((g) => g.trees.length > 0) };
}

/**
 * The academic shelf: every complaint tree and examination checklist the app ships, as
 * reading material. Nothing here is about a patient. Behind the same flag as the card.
 */
export default async function LearnIndexPage() {
  if (!historyCheckEnabled()) notFound();
  const { ward } = await getCurrentWard();
  const pack = getSpecialtyPack(ward ? await getWardSpecialtyStored(ward.id) : null);
  const { ownTrees, others } = groupTrees(listTrees(), pack.key);
  const exams = listExamChecklists();
  const fluids = listFluidTopics();
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-6">
        <Link href="/" className="text-body text-accent">‹ Home</Link>
        <p className="text-footnote text-muted">Learn</p>
      </header>
      <div id="learn">
      <div className="px-4 pb-2">
        <LearnSearch rootId="learn" />
      </div>
      {ownTrees.length > 0 && (
        <section className="px-4 pb-6" data-learn-group>
          <p className="ios-group-header mb-2 px-4">Your department · {pack.label}</p>
          <TreeList trees={ownTrees} />
        </section>
      )}
      <section className="px-4 pb-6" data-learn-group>
        <p className="ios-group-header mb-2 px-4">{ownTrees.length > 0 ? "Other departments" : "Taking a history"}</p>
        {others.map((g) => (
          <details key={g.key} className="mb-2" data-learn-group>
            <summary className="cursor-pointer px-4 py-2 text-subhead">
              {g.label} <span className="text-muted">· {g.trees.length}</span>
            </summary>
            <TreeList trees={g.trees} />
          </details>
        ))}
      </section>
      <section className="px-4 pb-6" data-learn-group>
        <p className="ios-group-header mb-2 px-4">Examination</p>
        <ul className="ios-group">
          {exams.map((e) => (
            <li key={e.id} data-search={e.title.toLowerCase()}>
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
      <section className="px-4 pb-6" data-learn-group>
        <p className="ios-group-header mb-2 px-4">IV Fluid and Electrolyte Correction</p>
        <p className="mb-3 px-4 text-[12px] text-muted">
          A digest of Pandya&apos;s <span className="italic">Practical Guidelines on Fluid Therapy</span>, 3rd edition. Unlike the lists above these pages carry the book&apos;s doses, rates and targets, each quoted with its page; every topic stays pending until a clinician signs it off.
        </p>
        {FLUID_GROUPS.map((g) => {
          const topics = fluids.filter((t) => t.group === g);
          if (topics.length === 0) return null;
          return (
            <div key={g} className="mb-4" data-learn-group>
              <p className="mb-1 px-4 text-[12px] font-semibold text-muted">{FLUID_GROUP_LABEL[g]}</p>
              <ul className="ios-group">
                {topics.map((t) => (
                  <li key={t.id} data-search={t.title.toLowerCase()}>
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
    </div>
  );
}
