"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "@/lib/scoring/flag";
import { audit } from "@/lib/scoring/store";

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
