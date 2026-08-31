"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "@/lib/scoring/flag";
import { audit, syncPatientPathways } from "@/lib/scoring/store";
import { getDefinition } from "@/lib/scoring/definitions/registry";
import type { ComponentInput } from "@/lib/scoring/types";

type Result = { error: string | null };
const OK: Result = { error: null };

/** Resolve the signed-in user + assert they are a member of the patient's ward. */
async function authorize(patientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You are signed out. Sign in again." };
  const { data: patient } = await supabase
    .from("patients")
    .select("id, ward_id")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return { ok: false as const, error: "Patient not found, or you are not on this ward." };
  if (!(await isScoringEngineEnabled(patient.ward_id))) {
    return { ok: false as const, error: "The scoring engine is not enabled for this ward." };
  }
  return { ok: true as const, supabase, user };
}

/** Tick a scoring to-do item done. */
export async function completeScoringTask(patientId: string, taskId: string): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const { data: task } = await a.supabase
    .from("pathway_tasks")
    .select("id, instance_id, ward_id, action")
    .eq("id", taskId)
    .eq("patient_id", patientId)
    .maybeSingle();
  if (!task) return { error: "Task not found." };
  await a.supabase
    .from("pathway_tasks")
    .update({ status: "completed", completed_by: a.user.id, completed_at: new Date().toISOString(), completion_source: "manual" })
    .eq("id", taskId);
  await audit(a.supabase, {
    instanceId: task.instance_id,
    patientId,
    wardId: task.ward_id,
    actorId: a.user.id,
    action: "task_completed",
    detail: { task: task.action, source: "manual" },
  });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
  return OK;
}

// ---------------------------------------------------------------------------
// Clinician-assessed score criteria (mental status, guarding, melaena, …)
// ---------------------------------------------------------------------------

async function loadInstance(supabase: Awaited<ReturnType<typeof createClient>>, instanceId: string, patientId: string) {
  const { data } = await supabase
    .from("pathway_instances")
    .select("id, ward_id, pathway_id, pathway_version, classification_inputs")
    .eq("id", instanceId)
    .eq("patient_id", patientId)
    .maybeSingle();
  return data;
}

function findAssessComponent(pathwayId: string, version: string, componentId: string): ComponentInput | null {
  const def = getDefinition(pathwayId, version);
  if (!def) return null;
  for (const card of def.cards) {
    const c = card.inputs.find((i) => i.componentId === componentId && i.clinicianAssessed && i.assess);
    if (c) return c;
  }
  return null;
}

/** One clinician-assessed criterion, recorded from the score card. */
export async function setScoreFinding(
  patientId: string,
  instanceId: string,
  componentId: string,
  optionIndex: number
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await loadInstance(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Score not found." };

  const comp = findAssessComponent(inst.pathway_id, inst.pathway_version, componentId);
  const opt = comp?.assess?.options[optionIndex];
  if (!comp || !opt) return { error: "Unknown score criterion." };

  await writeAssessments(a.supabase, a.user.id, patientId, inst, [
    { componentId, recordLabel: comp.assess!.recordLabel, opt },
  ]);
  await syncPatientPathways(patientId);
  revalidatePath(`/patients/${patientId}`);
  revalidatePath(`/patients/${patientId}/note`);
  return OK;
}

/** The one-tap "confirm normal": set every pending clinician-assessed criterion on a card to
 *  its normal option. */
export async function confirmScoreNormal(
  patientId: string,
  instanceId: string,
  cardId: string
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await loadInstance(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Score not found." };
  const def = getDefinition(inst.pathway_id, inst.pathway_version);
  const cardDef = def?.cards.find((c) => c.cardId === cardId);
  if (!cardDef) return { error: "Score card not found." };

  const already = (inst.classification_inputs?.assessed as Record<string, unknown>) ?? {};
  const writes = cardDef.inputs
    .filter((i) => i.clinicianAssessed && i.assess && !already[i.componentId])
    .map((i) => {
      const opt = i.assess!.options.find((o) => o.normal)!;
      return { componentId: i.componentId, recordLabel: i.assess!.recordLabel, opt };
    });
  if (writes.length === 0) return OK;

  await writeAssessments(a.supabase, a.user.id, patientId, inst, writes);
  await syncPatientPathways(patientId);
  revalidatePath(`/patients/${patientId}`);
  revalidatePath(`/patients/${patientId}/note`);
  return OK;
}

async function writeAssessments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  patientId: string,
  inst: { id: string; ward_id: string; classification_inputs: Record<string, unknown> | null },
  writes: { componentId: string; recordLabel: string; opt: NonNullable<ComponentInput["assess"]>["options"][number] }[]
) {
  const now = new Date().toISOString();

  // 1. Structured: on the instance, authoritative for the engine.
  const assessed = { ...((inst.classification_inputs?.assessed as Record<string, unknown>) ?? {}) };
  for (const w of writes) {
    assessed[w.componentId] = {
      satisfied: w.opt.satisfied,
      points: w.opt.points,
      text: w.opt.record,
      at: now,
      by: userId,
    };
  }
  await supabase
    .from("pathway_instances")
    .update({ classification_inputs: { ...(inst.classification_inputs ?? {}), assessed } })
    .eq("id", inst.id);

  // 2. Human-visible: a plain observation per finding, so it shows in the note / case history.
  const { data: entry } = await supabase
    .from("entries")
    .insert({
      patient_id: patientId,
      author_id: userId,
      source: "manual",
      transcript: writes.map((w) => `${w.recordLabel}: ${w.opt.record}`).join("\n"),
    })
    .select("id")
    .single();
  if (entry) {
    await supabase.from("observations").insert(
      writes.map((w) => ({
        entry_id: entry.id,
        patient_id: patientId,
        kind: "exam" as const,
        label: w.recordLabel,
        value_text: w.opt.record,
        source_quote: `${w.recordLabel}: ${w.opt.record}`,
        needs_confirmation: false,
      }))
    );
  }

  for (const w of writes) {
    await audit(supabase, {
      instanceId: inst.id,
      patientId,
      wardId: inst.ward_id,
      actorId: userId,
      action: "component_overridden",
      detail: { component_id: w.componentId, value: w.opt.record, satisfied: w.opt.satisfied, source: "score card" },
    });
  }
}

/** Decline a scoring to-do item, with a required reason (DOCX safety rule). */

/** Decline a scoring to-do item, with a required reason (DOCX safety rule). */
export async function declineScoringTask(patientId: string, taskId: string, reason: string): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  if (!reason.trim()) return { error: "A reason is required to decline a task." };
  const { data: task } = await a.supabase
    .from("pathway_tasks")
    .select("id, instance_id, ward_id, action")
    .eq("id", taskId)
    .eq("patient_id", patientId)
    .maybeSingle();
  if (!task) return { error: "Task not found." };
  await a.supabase
    .from("pathway_tasks")
    .update({ status: "declined", decline_reason: reason.trim() })
    .eq("id", taskId);
  await audit(a.supabase, {
    instanceId: task.instance_id,
    patientId,
    wardId: task.ward_id,
    actorId: a.user.id,
    action: "task_declined",
    detail: { task: task.action, reason: reason.trim() },
  });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/todo");
  return OK;
}
