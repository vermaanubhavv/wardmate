/**
 * The bridge between the database and the pure engine. Server-only.
 *
 * `syncPatientPathways` is the single trigger entrypoint — call it after any diagnosis change
 * and on patient-page load. It is idempotent and retry-safe:
 *   - trigger detection upserts one instance per (patient, pathway, version)
 *   - every recompute is deterministic from the current observations
 *   - tasks / cards / checkpoints all have unique keys, so a repeated call changes nothing
 *
 * Nothing here escalates, prescribes or orders. Cards are computed `complete_unverified` at
 * best; a clinician verifies separately (see scoring/actions.ts).
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "./flag";
import { triggerableDefinitions, getDefinition } from "./definitions/registry";
import { detectTriggers, isWorkingDiagnosis } from "./triggers";
import { evaluateCard, hashResult, type EvaluateContext } from "./engine";
import { toEngineInputs, type ObservationRow, type PatientFacts } from "./observations-adapter";
import { planPathwayTasks, type ExistingWorld } from "./tasks";
import { dueCheckpoints } from "./checkpoints";
import type {
  CardDefinition,
  CardResult,
  InstanceClock,
  Instant,
  PathwayDefinition,
} from "./types";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

const nowIso = (): Instant => new Date().toISOString();

// ---------------------------------------------------------------------------
// Public entrypoints
// ---------------------------------------------------------------------------

export async function syncPatientPathways(patientId: string): Promise<void> {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, ward_id, age_years, sex, admitted_on, primary_diagnosis, status")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return;
  if (!(await isScoringEngineEnabled(patient.ward_id))) return;

  const diagnosisText = await collectDiagnosisText(supabase, patientId, patient.primary_diagnosis);
  const defs = triggerableDefinitions();
  const matches = detectTriggers({ text: diagnosisText }, defs);

  for (const m of matches) {
    await upsertInstance(supabase, {
      patientId,
      wardId: patient.ward_id,
      pathwayId: m.pathwayId,
      pathwayVersion: m.pathwayVersion,
      triggerSource: m.source,
      triggerDiagnosis: m.diagnosisText,
      working: isWorkingDiagnosis(m.diagnosisText),
    });
  }

  // Recompute every open instance for this patient (also picks up resolved data changes).
  const { data: instances } = await supabase
    .from("pathway_instances")
    .select("*")
    .eq("patient_id", patientId)
    .in("status", ["suggested", "active"]);

  for (const inst of instances ?? []) {
    await recomputeInstanceRow(supabase, inst, "new_observation");
  }
}

export async function recomputeInstance(instanceId: string, trigger = "manual"): Promise<void> {
  const supabase = await createClient();
  const { data: inst } = await supabase
    .from("pathway_instances")
    .select("*")
    .eq("id", instanceId)
    .maybeSingle();
  if (!inst) return;
  if (!(await isScoringEngineEnabled(inst.ward_id))) return;
  await recomputeInstanceRow(supabase, inst, trigger);
}

/**
 * Record an inbound trigger event with the canonical dedup key. Returns false when the event
 * was already delivered (unique-violation) — the caller then does nothing (DOCX §4).
 */
export async function recordEvent(a: {
  patientId: string;
  wardId: string;
  instanceId: string | null;
  eventType: string;
  dedupKey: string;
  sourceId: string | null;
  checkpoint: string | null;
  payload?: Record<string, unknown>;
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("pathway_events").insert({
    patient_id: a.patientId,
    ward_id: a.wardId,
    instance_id: a.instanceId,
    event_type: a.eventType,
    dedup_key: a.dedupKey,
    source_id: a.sourceId,
    checkpoint: a.checkpoint,
    payload: a.payload ?? {},
  });
  if (error) {
    // 23505 = unique_violation → this exact event was already processed.
    if ((error as { code?: string }).code === "23505") return false;
    throw error;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Trigger / instance lifecycle
// ---------------------------------------------------------------------------

async function collectDiagnosisText(
  supabase: SupabaseServer,
  patientId: string,
  primary: string | null
): Promise<string> {
  const { data: dx } = await supabase
    .from("observations")
    .select("value_text, label, source_quote")
    .eq("patient_id", patientId)
    .eq("kind", "diagnosis");
  const parts = [primary ?? ""];
  for (const d of dx ?? []) parts.push(d.value_text ?? "", d.label ?? "");
  return parts.filter(Boolean).join(" ; ");
}

async function upsertInstance(
  supabase: SupabaseServer,
  a: {
    patientId: string;
    wardId: string;
    pathwayId: string;
    pathwayVersion: string;
    triggerSource: string;
    triggerDiagnosis: string;
    working: boolean;
  }
): Promise<void> {
  const { data: existing } = await supabase
    .from("pathway_instances")
    .select("id, status")
    .eq("patient_id", a.patientId)
    .eq("pathway_id", a.pathwayId)
    .eq("pathway_version", a.pathwayVersion)
    .maybeSingle();

  if (existing) return; // never re-trigger; a dismissed instance stays dismissed.

  const status = a.working ? "suggested" : "active";
  const { data: created } = await supabase
    .from("pathway_instances")
    .insert({
      patient_id: a.patientId,
      ward_id: a.wardId,
      pathway_id: a.pathwayId,
      pathway_version: a.pathwayVersion,
      status,
      trigger_source: a.triggerSource,
      trigger_diagnosis: a.triggerDiagnosis,
      activated_at: status === "active" ? nowIso() : null,
    })
    .select("id")
    .single();

  if (created) {
    await audit(supabase, {
      instanceId: created.id,
      patientId: a.patientId,
      wardId: a.wardId,
      action: status === "active" ? "pathway_accepted" : "pathway_suggested",
      detail: { trigger_source: a.triggerSource, diagnosis: a.triggerDiagnosis, auto: true },
    });
    await ensureCheckpoints(supabase, created.id, a.patientId, a.wardId, a.pathwayId, a.pathwayVersion);
  }
}

// ---------------------------------------------------------------------------
// Recompute
// ---------------------------------------------------------------------------

type InstanceRow = {
  id: string;
  patient_id: string;
  ward_id: string;
  pathway_id: string;
  pathway_version: string;
  status: string;
  ranson_aetiology: "non_gallstone" | "gallstone" | "uncertain" | null;
  classification_inputs: Record<string, unknown>;
};

async function loadDefinition(
  supabase: SupabaseServer,
  pathwayId: string,
  version: string
): Promise<PathwayDefinition | null> {
  // DB override for this exact version wins; otherwise the built-in.
  const { data: row } = await supabase
    .from("pathway_definitions")
    .select("definition, status")
    .eq("pathway_id", pathwayId)
    .eq("pathway_version", version)
    .maybeSingle();
  if (row?.definition) return row.definition as PathwayDefinition;
  return getDefinition(pathwayId, version);
}

async function recomputeInstanceRow(
  supabase: SupabaseServer,
  inst: InstanceRow,
  trigger: string
): Promise<void> {
  const def = await loadDefinition(supabase, inst.pathway_id, inst.pathway_version);
  if (!def) return;

  const { data: patient } = await supabase
    .from("patients")
    .select("age_years, sex, admitted_on")
    .eq("id", inst.patient_id)
    .maybeSingle();
  if (!patient) return;

  const { data: obs } = await supabase
    .from("observations")
    .select("id, kind, label, value_text, value_num, unit, source_quote, recorded_at, ref_low, ref_high")
    .eq("patient_id", inst.patient_id)
    .order("recorded_at", { ascending: true });

  const admittedAt = toInstant(patient.admitted_on);
  const symptomOnset = findSymptomOnset(obs ?? []);
  const facts: PatientFacts = {
    ageYears: patient.age_years ?? null,
    sex: patient.sex ?? null,
    admittedAt,
  };
  const inputs = toEngineInputs((obs ?? []) as ObservationRow[], facts);

  // Add CT-extraction inputs the clinician entered on the instance (mCTSI).
  for (const [k, v] of Object.entries((inst.classification_inputs?.ct as Record<string, string>) ?? {})) {
    inputs.push({
      key: `ct_${k}`,
      value: null,
      unit: null,
      text: String(v),
      original: { value: String(v), unit: null },
      at: nowIso(),
      sourceId: `instance.ct.${k}`,
      sourceQuote: `CT report (clinician-entered): ${v}`,
      refLow: null,
      refHigh: null,
    });
  }

  const { checkpointDueAt, dueNow } = await syncCheckpoints(supabase, inst, def);

  const clock: InstanceClock = {
    admission: admittedAt,
    symptomOnset,
    activation: inst.status === "active" ? admittedAt : null,
    now: nowIso(),
  };

  const priorVerification = await loadVerification(supabase, inst.id);

  const ctx: EvaluateContext = {
    inputs,
    clock,
    checkpointDueAt,
    overrides: await loadOverrides(supabase, inst.id),
    verification: priorVerification,
    classificationInputs: readClassificationInputs(inst),
    assessedComponents: (inst.classification_inputs?.assessed as EvaluateContext["assessedComponents"]) ?? {},
    now: clock.now,
  };

  const applicableCards = selectApplicableCards(def, inst, inputs);
  const results: CardResult[] = [];

  for (const cardDef of applicableCards) {
    const result = evaluateCard(cardDef, ctx);
    results.push(result);
    await persistCard(supabase, inst, result);
  }

  // Persist task decisions.
  const world = await buildExistingWorld(supabase, inst, def, inputs);
  const clockForTasks: InstanceClock = { ...clock, activation: admittedAt };
  const decisions = planPathwayTasks(def, results, inputs, clockForTasks, world);
  for (const d of decisions) {
    await persistTaskDecision(supabase, inst, d);
  }

  // Reconcile: drop any still-open task this recompute did not re-propose (a task from an
  // earlier pathway version, a component now satisfied, a card now complete). Only untouched
  // suggestions are removed — anything a clinician accepted, completed or declined is kept for
  // the audit trail. This is what keeps the to-do list from accumulating stale rows.
  const liveKeys = new Set(
    decisions
      .filter((d) => d.outcome === "create" || d.outcome === "already_present")
      .map((d) => d.task.dedupKey)
  );
  const { data: openRows } = await supabase
    .from("pathway_tasks")
    .select("id, dedup_key, status")
    .eq("instance_id", inst.id)
    .in("status", ["suggested", "linked"]);
  const stale = (openRows ?? []).filter((r) => !liveKeys.has(r.dedup_key));
  if (stale.length > 0) {
    await supabase
      .from("pathway_tasks")
      .delete()
      .in(
        "id",
        stale.map((r) => r.id)
      );
  }

  // Mark any checkpoints that just ran.
  for (const cp of dueNow) {
    await supabase
      .from("pathway_checkpoints")
      .update({ executed_at: nowIso() })
      .eq("id", cp.id)
      .is("executed_at", null);
    await audit(supabase, {
      instanceId: inst.id,
      patientId: inst.patient_id,
      wardId: inst.ward_id,
      action: "checkpoint_executed",
      detail: { checkpoint: cp.checkpoint_key, trigger },
    });
  }

  await supabase
    .from("pathway_instances")
    .update({ next_checkpoint_at: nextPendingCheckpoint(checkpointDueAt), updated_at: nowIso() })
    .eq("id", inst.id);
}

// ---------------------------------------------------------------------------
// Card selection (aetiology / CT gating)
// ---------------------------------------------------------------------------

function selectApplicableCards(
  def: PathwayDefinition,
  inst: InstanceRow,
  inputs: EvaluateContext["inputs"]
): CardDefinition[] {
  return def.cards.filter((card) => {
    // Ranson variant gating — never silently choose (DOCX Card B).
    if (card.cardId.startsWith("ranson_")) {
      const ae = inst.ranson_aetiology;
      const isGallstone = card.cardId.includes("gallstone") && !card.cardId.includes("nongallstone");
      const isNonGallstone = card.cardId.includes("nongallstone");
      if (ae === "gallstone") return isGallstone;
      if (ae === "non_gallstone") return isNonGallstone;
      // uncertain / unset: show BOTH admission variants; keep 48-hour variants hidden until
      // the clinician commits to an aetiology.
      return card.cardId.startsWith("ranson_admission_");
    }
    // mCTSI — only when a contrast CT report actually exists.
    if (card.requiresAnyInputPresent) {
      const keys = card.inputs.map((i) => i.inputKey);
      return inputs.some((i) => keys.includes(i.key));
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Checkpoints
// ---------------------------------------------------------------------------

async function ensureCheckpoints(
  supabase: SupabaseServer,
  instanceId: string,
  patientId: string,
  wardId: string,
  pathwayId: string,
  version: string
): Promise<void> {
  const def = await loadDefinition(supabase, pathwayId, version);
  if (!def) return;
  const { data: patient } = await supabase
    .from("patients")
    .select("admitted_on")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return;
  const admittedAt = Date.parse(toInstant(patient.admitted_on));

  for (const cp of def.checkpoints) {
    const dueAt = new Date(admittedAt + cp.dueAtHours * 3_600_000).toISOString();
    await supabase
      .from("pathway_checkpoints")
      .upsert(
        { instance_id: instanceId, patient_id: patientId, ward_id: wardId, checkpoint_key: cp.key, due_at: dueAt },
        { onConflict: "instance_id,checkpoint_key", ignoreDuplicates: true }
      );
  }
}

async function syncCheckpoints(
  supabase: SupabaseServer,
  inst: InstanceRow,
  def: PathwayDefinition
): Promise<{ checkpointDueAt: Record<string, Instant>; dueNow: { id: string; checkpoint_key: string }[] }> {
  await ensureCheckpoints(supabase, inst.id, inst.patient_id, inst.ward_id, inst.pathway_id, inst.pathway_version);
  const { data: rows } = await supabase
    .from("pathway_checkpoints")
    .select("id, checkpoint_key, due_at, executed_at")
    .eq("instance_id", inst.id);
  const checkpointDueAt: Record<string, Instant> = {};
  for (const r of rows ?? []) checkpointDueAt[r.checkpoint_key] = r.due_at;

  const nowIsoStr = nowIso();
  const due = dueCheckpoints(
    (rows ?? []).map((r) => ({ checkpointKey: r.checkpoint_key, dueAt: r.due_at, executedAt: r.executed_at })),
    nowIsoStr
  );
  const dueNow = due
    .map((d) => {
      const row = (rows ?? []).find((r) => r.checkpoint_key === d.checkpointKey);
      return row ? { id: row.id, checkpoint_key: row.checkpoint_key } : null;
    })
    .filter((x): x is { id: string; checkpoint_key: string } => x != null);
  void def;
  return { checkpointDueAt, dueNow };
}

function nextPendingCheckpoint(map: Record<string, Instant>): Instant | null {
  const future = Object.values(map)
    .filter((d) => Date.parse(d) > Date.now())
    .sort();
  return future[0] ?? null;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

async function persistCard(supabase: SupabaseServer, inst: InstanceRow, result: CardResult): Promise<void> {
  const { data: existing } = await supabase
    .from("pathway_cards")
    .select("id, result, state")
    .eq("instance_id", inst.id)
    .eq("card_id", result.cardId)
    .maybeSingle();

  const prevHash = existing
    ? hashResult(
        (existing.result as CardResult).components ?? [],
        (existing.result as CardResult).total ?? null,
        (existing.result as CardResult).classification ?? null
      )
    : null;
  const newHash = hashResult(result.components, result.total, result.classification);
  const changed = prevHash !== newHash;

  const { data: row } = await supabase
    .from("pathway_cards")
    .upsert(
      {
        instance_id: inst.id,
        patient_id: inst.patient_id,
        ward_id: inst.ward_id,
        card_id: result.cardId,
        card_type: result.cardType,
        state: result.state,
        result: result as unknown as Record<string, unknown>,
        verified_by: result.verifiedBy,
        verified_at: result.verifiedAt,
        computed_at: result.computedAt,
      },
      { onConflict: "instance_id,card_id" }
    )
    .select("id")
    .single();

  if (row && (changed || !existing)) {
    await supabase.from("pathway_card_history").insert({
      card_id_ref: row.id,
      instance_id: inst.id,
      ward_id: inst.ward_id,
      state: result.state,
      result: result as unknown as Record<string, unknown>,
    });
    await audit(supabase, {
      instanceId: inst.id,
      patientId: inst.patient_id,
      wardId: inst.ward_id,
      action: "card_calculated",
      detail: {
        card: result.cardId,
        total: result.total,
        classification: result.classification,
        state: result.state,
        missing: result.missingRequiredCount,
      },
    });
  }
}

async function persistTaskDecision(
  supabase: SupabaseServer,
  inst: InstanceRow,
  decision: import("./tasks").TaskDecision
): Promise<void> {
  const t = decision.task;
  const { data: existing } = await supabase
    .from("pathway_tasks")
    .select("id, status")
    .eq("instance_id", inst.id)
    .eq("dedup_key", t.dedupKey)
    .maybeSingle();

  // Never resurrect a declined/completed task, never duplicate an open one — but DO refresh the
  // wording/priority of an untouched suggestion so an old pathway version's text is replaced.
  if (existing) {
    if (decision.outcome === "suppressed_toggle" && existing.status === "suggested") {
      await supabase.from("pathway_tasks").update({ status: "declined", decline_reason: "institutional toggle disabled", institutional_override: true }).eq("id", existing.id);
    } else if (decision.outcome === "create" && existing.status === "suggested") {
      await supabase
        .from("pathway_tasks")
        .update({ action: t.action, reason: t.reason, priority: t.priority, responsible_role: t.responsibleRole, card_id: t.cardId, component_id: t.componentId, source_rule: t.sourceRule })
        .eq("id", existing.id);
    }
    return;
  }

  if (decision.outcome === "already_present") return;
  if (decision.outcome === "suppressed_toggle") {
    await audit(supabase, {
      instanceId: inst.id,
      patientId: inst.patient_id,
      wardId: inst.ward_id,
      action: "task_suppressed",
      detail: { dedup_key: t.dedupKey, reason: "institutional_toggle", action: t.action },
    });
    return;
  }

  // The input already has a result (or an active order) — nothing to ask for. Record it in the
  // audit trail but do NOT put a row on the to-do list.
  if (decision.outcome === "link_existing_result" || decision.outcome === "link_existing_order") {
    await audit(supabase, {
      instanceId: inst.id,
      patientId: inst.patient_id,
      wardId: inst.ward_id,
      action: "task_suppressed",
      detail: { dedup_key: t.dedupKey, reason: decision.outcome, action: t.action },
    });
    return;
  }

  await supabase.from("pathway_tasks").insert({
    instance_id: inst.id,
    patient_id: inst.patient_id,
    ward_id: inst.ward_id,
    card_id: t.cardId,
    component_id: t.componentId,
    action: t.action,
    reason: t.reason,
    priority: t.priority,
    responsible_role: t.responsibleRole,
    source_rule: t.sourceRule,
    dedup_key: t.dedupKey,
    status: "suggested",
    due_at: t.dueAt,
  });

  await audit(supabase, {
    instanceId: inst.id,
    patientId: inst.patient_id,
    wardId: inst.ward_id,
    action: "task_generated",
    detail: { dedup_key: t.dedupKey, action: t.action, outcome: decision.outcome, reason: t.reason },
  });
}

async function buildExistingWorld(
  supabase: SupabaseServer,
  inst: InstanceRow,
  def: PathwayDefinition,
  inputs: EvaluateContext["inputs"]
): Promise<ExistingWorld> {
  const { data: openTasks } = await supabase
    .from("pathway_tasks")
    .select("dedup_key, status")
    .eq("instance_id", inst.id);
  const openTaskKeys = new Set(
    (openTasks ?? []).filter((t) => t.status !== "declined").map((t) => t.dedup_key)
  );

  // A component whose input key has ANY value already recorded counts as "resolved" for the
  // purpose of not asking for it again — the score itself still shows unknown if the value is
  // out of window, but we don't spam a duplicate order.
  const resolvedInputKeys = new Set(inputs.map((i) => i.key));

  const { data: toggleRows } = await supabase
    .from("ward_scoring_toggles")
    .select("toggle_key, enabled")
    .eq("ward_id", inst.ward_id)
    .eq("pathway_id", inst.pathway_id);
  const disabledToggles = new Set<string>();
  for (const [key, defaultOn] of Object.entries(def.institutionalToggles)) {
    const row = (toggleRows ?? []).find((r) => r.toggle_key === key);
    const on = row ? row.enabled : defaultOn;
    if (!on) disabledToggles.add(key);
  }

  return { resolvedInputKeys, activeOrders: new Set(), openTaskKeys, disabledToggles };
}

async function loadOverrides(supabase: SupabaseServer, instanceId: string) {
  const { data } = await supabase
    .from("pathway_audit")
    .select("detail, occurred_at, actor_id")
    .eq("instance_id", instanceId)
    .eq("action", "component_overridden")
    .order("occurred_at", { ascending: true });
  const map: EvaluateContext["overrides"] = {};
  for (const row of data ?? []) {
    const d = row.detail as { component_id: string; value: string; numeric: number | null; reason: string };
    if (!d?.component_id) continue;
    map[d.component_id] = {
      value: d.value,
      numeric: d.numeric ?? null,
      reason: d.reason,
      by: row.actor_id ?? "unknown",
      at: row.occurred_at,
    };
  }
  return map;
}

async function loadVerification(supabase: SupabaseServer, instanceId: string) {
  const { data } = await supabase
    .from("pathway_cards")
    .select("card_id, verified_by, verified_at, verified_hash")
    .eq("instance_id", instanceId);
  const map: EvaluateContext["verification"] = {};
  for (const row of data ?? []) {
    if (row.verified_by && row.verified_at && row.verified_hash) {
      map[row.card_id] = { by: row.verified_by, at: row.verified_at, resultHash: row.verified_hash };
    }
  }
  return map;
}

function readClassificationInputs(inst: InstanceRow): EvaluateContext["classificationInputs"] {
  const ci = inst.classification_inputs ?? {};
  return {
    localComplications: (ci.localComplications as boolean | null | undefined) ?? null,
    systemicComplications: (ci.systemicComplications as boolean | null | undefined) ?? null,
    organFailureDurationHours: (ci.organFailureDurationHours as number | null | undefined) ?? null,
    organFailureResolved: (ci.organFailureResolved as boolean | null | undefined) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function toInstant(date: string): Instant {
  // `admitted_on` is a DATE. Anchor at 00:00 local (Asia/Kolkata) → UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T00:00:00+05:30`;
  return new Date(date).toISOString();
}

function findSymptomOnset(obs: ObservationRow[]): Instant | null {
  const hit = obs.find((o) => /symptom onset|onset of pain|pain (started|began)|since \d+ (h|hour|day)/i.test(`${o.label} ${o.source_quote}`));
  if (!hit) return null;
  const m = /since (\d+)\s*(hour|hr|h|day|d)/i.exec(`${hit.label} ${hit.source_quote}`);
  if (m) {
    const n = Number(m[1]);
    const ms = /d/i.test(m[2]) ? n * 86_400_000 : n * 3_600_000;
    return new Date(Date.parse(hit.recorded_at) - ms).toISOString();
  }
  return null;
}

export async function audit(
  supabase: SupabaseServer,
  a: {
    instanceId: string | null;
    patientId: string;
    wardId: string;
    action: string;
    detail: Record<string, unknown>;
    actorId?: string | null;
  }
): Promise<void> {
  await supabase.from("pathway_audit").insert({
    instance_id: a.instanceId,
    patient_id: a.patientId,
    ward_id: a.wardId,
    actor_id: a.actorId ?? null,
    action: a.action,
    detail: a.detail,
  });
}

// Re-export for actions.ts
export { getDefinition } from "./definitions/registry";
