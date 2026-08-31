/**
 * Read model for the patient-page scoring panel. Server-only. Returns nothing when the
 * feature flag is closed for the ward (test 16: flag-off = unchanged behaviour).
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "./flag";
import { getDefinition } from "./definitions/registry";
import type { CardResult, PathwayInstanceStatus } from "./types";

export const SCORING_DISCLAIMER =
  "This module supports, but does not replace, clinical judgement and institutional protocols. " +
  "No score prescribes surgery, ERCP, antibiotics, transfusion, ICU transfer or discharge. " +
  "Missing data is shown as unknown, never assumed normal.";

export type ScoringCardView = {
  id: string;
  cardId: string;
  title: string;
  result: CardResult;
  verifiedBy: string | null;
  verifiedAt: string | null;
};

export type ScoringTaskView = {
  id: string;
  action: string;
  reason: string;
  priority: "routine" | "soon" | "urgent";
  responsibleRole: string;
  status: string;
  dueAt: string | null;
  cardId: string | null;
  sourceRule: string;
  declineReason: string | null;
};

export type ScoringInstanceView = {
  id: string;
  pathwayId: string;
  pathwayVersion: string;
  title: string;
  status: PathwayInstanceStatus;
  triggerDiagnosis: string;
  triggeredAt: string;
  ransonAetiology: "non_gallstone" | "gallstone" | "uncertain" | null;
  clinicalOwner: string;
  reviewDueAt: string;
  nextCheckpointAt: string | null;
  sourceReferences: { label: string; citation: string }[];
  cards: ScoringCardView[];
  tasks: ScoringTaskView[];
  checkpoints: { key: string; label: string; dueAt: string; executedAt: string | null }[];
};

export type PatientScoring = {
  enabled: boolean;
  disclaimer: string;
  instances: ScoringInstanceView[];
};

export async function getPatientScoring(patientId: string): Promise<PatientScoring> {
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("ward_id")
    .eq("id", patientId)
    .maybeSingle();

  if (!patient || !(await isScoringEngineEnabled(patient.ward_id))) {
    return { enabled: false, disclaimer: SCORING_DISCLAIMER, instances: [] };
  }

  const { data: instances } = await supabase
    .from("pathway_instances")
    .select("*")
    .eq("patient_id", patientId)
    .in("status", ["suggested", "active", "resolved"])
    .order("triggered_at", { ascending: true });

  const views: ScoringInstanceView[] = [];
  for (const inst of instances ?? []) {
    const def = getDefinition(inst.pathway_id, inst.pathway_version);

    const { data: cards } = await supabase
      .from("pathway_cards")
      .select("id, card_id, result, verified_by, verified_at")
      .eq("instance_id", inst.id);

    const { data: tasks } = await supabase
      .from("pathway_tasks")
      .select("id, action, reason, priority, responsible_role, status, due_at, card_id, source_rule, decline_reason")
      .eq("instance_id", inst.id)
      .order("priority", { ascending: false });

    const { data: checkpoints } = await supabase
      .from("pathway_checkpoints")
      .select("checkpoint_key, due_at, executed_at")
      .eq("instance_id", inst.id)
      .order("due_at", { ascending: true });

    views.push({
      id: inst.id,
      pathwayId: inst.pathway_id,
      pathwayVersion: inst.pathway_version,
      title: def?.title ?? inst.pathway_id,
      status: inst.status,
      triggerDiagnosis: inst.trigger_diagnosis,
      triggeredAt: inst.triggered_at,
      ransonAetiology: inst.ranson_aetiology,
      clinicalOwner: def?.clinicalOwner ?? "PENDING",
      reviewDueAt: def?.reviewDueAt ?? "PENDING",
      nextCheckpointAt: inst.next_checkpoint_at,
      sourceReferences: def?.sourceReferences ?? [],
      cards: (cards ?? [])
        .map((c) => ({
          id: c.id,
          cardId: c.card_id,
          title: (c.result as CardResult)?.title ?? c.card_id,
          result: c.result as CardResult,
          verifiedBy: c.verified_by,
          verifiedAt: c.verified_at,
        }))
        .sort((a, b) => cardOrder(a.cardId) - cardOrder(b.cardId)),
      tasks: (tasks ?? []).map((t) => ({
        id: t.id,
        action: t.action,
        reason: t.reason,
        priority: t.priority,
        responsibleRole: t.responsible_role,
        status: t.status,
        dueAt: t.due_at,
        cardId: t.card_id,
        sourceRule: t.source_rule,
        declineReason: t.decline_reason,
      })),
      checkpoints: (checkpoints ?? []).map((c) => ({
        key: c.checkpoint_key,
        label: def?.checkpoints.find((d) => d.key === c.checkpoint_key)?.label ?? c.checkpoint_key,
        dueAt: c.due_at,
        executedAt: c.executed_at,
      })),
    });
  }

  return { enabled: true, disclaimer: SCORING_DISCLAIMER, instances: views };
}

function cardOrder(cardId: string): number {
  const order = ["bisap", "ranson_admission", "ranson_48h", "atlanta", "mctsi"];
  const idx = order.findIndex((p) => cardId.startsWith(p));
  return idx === -1 ? 99 : idx;
}

/** History of one card, for the "why did this change" view. */
export async function getCardHistory(cardRowId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pathway_card_history")
    .select("state, result, computed_at")
    .eq("card_id_ref", cardRowId)
    .order("computed_at", { ascending: false });
  return (data ?? []).map((r) => ({
    state: r.state,
    computedAt: r.computed_at,
    result: r.result as CardResult,
  }));
}
