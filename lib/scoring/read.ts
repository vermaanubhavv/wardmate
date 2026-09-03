/**
 * Read model for the scoring engine's surfaces: the score card(s) on the patient page, a line
 * in the progress note, and items in the to-do list. There is no separate scoring screen.
 *
 * Everything here returns empty when the feature flag is closed for the ward (test 16).
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "./flag";
import { getDefinition } from "./definitions/registry";
import type { CardDefinition, CardResult } from "./types";

const OPEN = ["suggested", "accepted"];
const CARD_TYPES = new Set(["calculator", "structured_classification"]);

async function activeInstances(supabase: Awaited<ReturnType<typeof createClient>>, patientId: string) {
  const { data } = await supabase
    .from("pathway_instances")
    .select("id, pathway_id, pathway_version")
    .eq("patient_id", patientId)
    .in("status", ["active", "suggested"]);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Patient-page score cards
// ---------------------------------------------------------------------------

export type AssessOption = { label: string; normal: boolean };
export type ScoreAssess = { componentId: string; question: string; options: AssessOption[] };

export type ScoreCardView = {
  instanceId: string;
  patientId: string;
  cardId: string;
  pathwayTitle: string;
  shortName: string;
  citation: string | null;
  maxPoints: number | null;
  result: CardResult;
  /** Per clinician-assessed component still needing an answer. */
  assessable: ScoreAssess[];
};

function cardMeta(def: CardDefinition) {
  const maxPoints =
    def.calculation.kind === "sum_points"
      ? def.inputs.reduce((s, i) => s + Math.max(i.points, ...(i.assess?.options.map((o) => o.points ?? i.points) ?? [i.points])), 0)
      : null;
  const assessable: ScoreAssess[] = def.inputs
    .filter((i) => i.clinicianAssessed && i.assess)
    .map((i) => ({
      componentId: i.componentId,
      question: i.assess!.question,
      options: i.assess!.options.map((o) => ({ label: o.label, normal: Boolean(o.normal) })),
    }));
  return { maxPoints, assessable, shortName: def.shortName ?? def.title, citation: def.citation ?? null };
}

export async function getScoreCards(patientId: string): Promise<ScoreCardView[]> {
  const supabase = await createClient();
  const { data: patient } = await supabase.from("patients").select("ward_id").eq("id", patientId).maybeSingle();
  if (!patient || !(await isScoringEngineEnabled(patient.ward_id))) return [];

  const instances = await activeInstances(supabase, patientId);
  if (instances.length === 0) return [];

  const { data: rows } = await supabase
    .from("pathway_cards")
    .select("instance_id, card_id, result")
    .in("instance_id", instances.map((i) => i.id));

  const views: ScoreCardView[] = [];
  for (const inst of instances) {
    const def = getDefinition(inst.pathway_id, inst.pathway_version);
    if (!def) continue;
    for (const row of (rows ?? []).filter((r) => r.instance_id === inst.id)) {
      const cardDef = def.cards.find((c) => c.cardId === row.card_id);
      if (!cardDef || !CARD_TYPES.has(cardDef.type)) continue;
      const result = row.result as CardResult;
      if (result.state === "not_started") continue;
      const meta = cardMeta(cardDef);
      const stillUnknown = new Set(
        result.components.filter((c) => c.status === "unknown").map((c) => c.componentId)
      );
      views.push({
        instanceId: inst.id,
        patientId,
        cardId: row.card_id,
        pathwayTitle: def.title,
        shortName: meta.shortName,
        citation: meta.citation,
        maxPoints: meta.maxPoints,
        result,
        assessable: meta.assessable.filter((a) => stillUnknown.has(a.componentId)),
      });
    }
  }
  return views;
}

// ---------------------------------------------------------------------------
// Progress-note line(s)
// ---------------------------------------------------------------------------

const DISCLAIMER =
  "Scores are decision support computed from recorded values — not a substitute for clinical assessment or institutional protocol.";

export async function getScoreNoteLines(patientId: string): Promise<string[]> {
  const cards = await getScoreCards(patientId);
  if (cards.length === 0) return [];

  const lines: string[] = [];
  for (const v of cards) {
    const r = v.result;
    if (r.total != null || r.provisionalTotal != null) {
      const complete = r.missingRequiredCount === 0 && r.total != null;
      if (complete) {
        lines.push(`${v.shortName} – ${r.total}${v.maxPoints != null ? `/${v.maxPoints}` : ""}`);
        if (r.interpretation?.tone === "attention") lines.push(r.interpretation.text);
      } else {
        const running = r.provisionalTotal ?? r.total ?? 0;
        const provisional = r.provisionalTotal != null;
        lines.push(
          `${v.shortName} – ${running}${v.maxPoints != null ? `/${v.maxPoints}` : ""} ` +
            (provisional
              ? "(provisional — assuming normal for what is not yet recorded)"
              : `(so far — ${r.missingRequiredCount} not recorded)`)
        );
      }
    } else if (r.classification && r.classification !== "unknown") {
      const label = r.classification.replace(/_/g, " ");
      lines.push(`${v.shortName} – ${label}${r.missingRequiredCount > 0 ? " (provisional)" : ""}`);
      if (r.interpretation?.tone === "attention") lines.push(r.interpretation.text);
    }
  }
  if (lines.length > 0) lines.push(`(${DISCLAIMER})`);
  return lines;
}

// ---------------------------------------------------------------------------
// To-do-list items
// ---------------------------------------------------------------------------

export type ScoringTask = {
  id: string;
  patientId: string;
  action: string;
  reason: string;
  priority: "routine" | "soon" | "urgent";
  responsibleRole: string;
  status: string;
  dueAt: string | null;
};

export async function getPatientScoringTasks(patientId: string): Promise<ScoringTask[]> {
  const supabase = await createClient();
  const { data: patient } = await supabase.from("patients").select("ward_id").eq("id", patientId).maybeSingle();
  if (!patient || !(await isScoringEngineEnabled(patient.ward_id))) return [];

  const { data } = await supabase
    .from("pathway_tasks")
    .select("id, patient_id, action, reason, priority, responsible_role, status, due_at")
    .eq("patient_id", patientId)
    .in("status", OPEN)
    .order("priority", { ascending: false });

  return (data ?? []).map(mapTask);
}

/** patientId → open scoring tasks, for the ward-wide /todo screen. */
export async function getWardScoringTasks(wardId: string): Promise<Map<string, ScoringTask[]>> {
  const supabase = await createClient();
  if (!(await isScoringEngineEnabled(wardId))) return new Map();

  const { data } = await supabase
    .from("pathway_tasks")
    .select("id, patient_id, action, reason, priority, responsible_role, status, due_at")
    .eq("ward_id", wardId)
    .in("status", OPEN);

  const out = new Map<string, ScoringTask[]>();
  for (const row of data ?? []) {
    const t = mapTask(row);
    const list = out.get(t.patientId) ?? [];
    list.push(t);
    out.set(t.patientId, list);
  }
  return out;
}

function mapTask(row: {
  id: string;
  patient_id: string;
  action: string;
  reason: string;
  priority: string;
  responsible_role: string;
  status: string;
  due_at: string | null;
}): ScoringTask {
  return {
    id: row.id,
    patientId: row.patient_id,
    action: row.action,
    reason: row.reason,
    priority: (row.priority as ScoringTask["priority"]) ?? "routine",
    responsibleRole: row.responsible_role,
    status: row.status,
    dueAt: row.due_at,
  };
}
