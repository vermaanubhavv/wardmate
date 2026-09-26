import type { createClient } from "@/lib/supabase/server";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { getTree, listTrees, suggestTrees } from "@/lib/history-check/trees";
import { loadSources, type HistoryCheckRun } from "@/lib/history-check/store";
import { buildRunView, type RunView } from "@/lib/history-check/view";
import type { TreeChoice } from "@/app/patients/[id]/history-check-card";

type Supa = Awaited<ReturnType<typeof createClient>>;

const RUN_COLUMNS =
  "id, patient_id, tree_id, tree_version, prompt_version, model, input_hash, source_entry_ids, status, result, usage, cost_usd, error, resolutions, created_at";

export type HistoryCheckCardData = {
  trees: TreeChoice[];
  runs: Record<string, RunView>;
  hasSources: boolean;
};

/**
 * What the patient page hands the card: the complaint choices (with the ones the chief
 * complaints suggest first), the newest run of each complaint rendered for both modes, and
 * whether there is anything to check at all. Null when the flag is off — the card is then
 * not rendered, and nothing here is queried.
 */
export async function loadHistoryCheckCard(
  supabase: Supa,
  patient: { id: string; display_name: string; bed: string | null; age_years: number | null; sex: string | null; surgery_date: string | null },
  chiefComplaintTexts: string[],
  /**
   * The unit's own complaints, from its specialty pack (`historyTreeIds`).
   *
   * It sorts AND it decides what the picker shows first — `department: true` below. What it
   * still never does is make a tree unreachable: everything else is one "More…" away, because a
   * chest pain on an ENT ward is still a chest pain and a tree a resident cannot reach is worse
   * than a list that is too long. Empty — an unrecognised specialty, or the packs flag off —
   * restores the pre-pack behaviour exactly: no department band, every chip shown at once.
   */
  departmentTreeIds: string[] = []
): Promise<HistoryCheckCardData | null> {
  if (!historyCheckEnabled()) return null;

  const suggested = new Set(suggestTrees(chiefComplaintTexts).map((t) => t.id));
  const isDepartment = new Set(departmentTreeIds);
  const trees: TreeChoice[] = listTrees().map((t) => ({
    id: t.id,
    complaint: t.complaint,
    suggested: suggested.has(t.id),
    department: isDepartment.has(t.id),
  }));
  // What the resident dictated comes first, then what this department admits, then everything
  // else in registry order. Within the department band the pack's own order is kept, because
  // that order is a clinical statement (fever on chemotherapy leads the oncology list).
  // Array.prototype.sort is stable, so the untouched bands keep registry order.
  const deptRank = new Map(departmentTreeIds.map((id, i) => [id, i]));
  const band = (t: TreeChoice) => (t.suggested ? 0 : deptRank.has(t.id) ? 1 : 2);
  trees.sort((a, b) => {
    const d = band(a) - band(b);
    if (d !== 0) return d;
    if (band(a) === 1) return (deptRank.get(a.id) ?? 0) - (deptRank.get(b.id) ?? 0);
    return 0;
  });

  const [sources, { data: rows }] = await Promise.all([
    loadSources(supabase, patient.id),
    supabase.from("history_checks").select(RUN_COLUMNS).eq("patient_id", patient.id).order("created_at", { ascending: false }),
  ]);

  const header = [patient.bed, patient.display_name, [patient.age_years, patient.sex].filter((x) => x != null && x !== "").join("/")]
    .filter(Boolean)
    .join(" · ");
  const postOp = Boolean(patient.surgery_date);

  const runs: Record<string, RunView> = {};
  for (const row of (rows ?? []) as HistoryCheckRun[]) {
    if (runs[row.tree_id]) continue; // newest first — keep the first seen per tree
    const tree = getTree(row.tree_id, row.tree_version);
    if (!tree) continue;
    // Quotes were checked against the sources of THAT run. If the case history has since
    // changed, source indices may point elsewhere; the quote text itself is still the quote,
    // so the card shows it with the run's own entry list where it can.
    const runSources = row.source_entry_ids
      .map((id) => sources.find((s) => s.entryId === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s, index) => ({ ...s, index }));
    runs[row.tree_id] = buildRunView(tree, row, runSources, { postOp, header });
  }

  return { trees, runs, hasSources: sources.length > 0 };
}
