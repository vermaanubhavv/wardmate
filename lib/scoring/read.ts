/**
 * Read model for the scoring engine's two surfaces: a line in the progress note, and items in
 * the to-do list. There is no separate scoring screen.
 *
 * Everything here returns empty when the feature flag is closed for the ward (test 16).
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "./flag";
import type { CardResult } from "./types";

const DISCLAIMER =
  "BISAP is decision support computed from recorded values — not a substitute for clinical assessment or institutional protocol.";

// ---------------------------------------------------------------------------
// Progress-note line(s)
// ---------------------------------------------------------------------------

/**
 * The score as it should read in the progress note. Empty array when the engine is off, no
 * pancreatitis pathway is active, or nothing has been recorded yet.
 *
 *   ["BISAP – 2/5",
 *    "BISAP ≥ 3 — higher-risk screen; review monitoring and escalation needs."   (only if ≥3)
 *    "(BISAP is decision support …)"]
 *
 * or, incomplete:
 *   ["BISAP – 2 so far (mental status, pleural effusion not recorded)", "(BISAP is …)"]
 */
export async function getScoreNoteLines(patientId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("ward_id")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient || !(await isScoringEngineEnabled(patient.ward_id))) return [];

  const { data: instances } = await supabase
    .from("pathway_instances")
    .select("id")
    .eq("patient_id", patientId)
    .eq("pathway_id", "acute_pancreatitis")
    .in("status", ["active", "suggested"]);
  if (!instances || instances.length === 0) return [];

  const { data: cards } = await supabase
    .from("pathway_cards")
    .select("result")
    .eq("card_id", "bisap")
    .in(
      "instance_id",
      instances.map((i) => i.id)
    );

  const card = cards?.[0]?.result as CardResult | undefined;
  if (!card || card.state === "not_started") return [];

  const known = card.components.filter((c) => c.status === "satisfied" || c.status === "not_satisfied").length;
  const unknownLabels = card.components
    .filter((c) => c.status === "unknown")
    .map((c) => shortLabel(c.label));

  const lines: string[] = [];
  if (unknownLabels.length === 0 && card.total != null) {
    lines.push(`BISAP – ${card.total}/5`);
    if (card.total >= 3 && card.interpretation) lines.push(card.interpretation.text);
  } else {
    const running = card.total ?? 0;
    lines.push(
      `BISAP – ${running} so far (of ${known}/5 assessed; ${unknownLabels.join(", ")} not recorded)`
    );
  }
  lines.push(`(${DISCLAIMER})`);
  return lines;
}

function shortLabel(label: string): string {
  return label
    .replace(/\s*\(.*\)\s*/g, "")
    .replace(/^Impaired mental status.*/, "mental status")
    .replace(/^SIRS present.*/, "SIRS")
    .replace(/^Pleural effusion.*/, "pleural effusion")
    .replace(/^BUN.*/, "BUN")
    .replace(/^Age.*/, "age")
    .toLowerCase()
    .trim();
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

const OPEN = ["suggested", "linked", "accepted"];

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
