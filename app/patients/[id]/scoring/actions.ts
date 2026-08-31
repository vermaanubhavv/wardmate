"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isScoringEngineEnabled } from "@/lib/scoring/flag";
import { recomputeInstance, syncPatientPathways, audit } from "@/lib/scoring/store";
import { hashResult } from "@/lib/scoring/engine";
import type { CardResult } from "@/lib/scoring/types";

type Result = { error: string | null };
const OK: Result = { error: null };

type Authorized = {
  ok: true;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string };
  patient: { id: string; ward_id: string };
};
type AuthFailure = { ok: false; error: string };

/** Resolve the signed-in user + assert they are a member of the patient's ward. */
async function authorize(patientId: string): Promise<Authorized | AuthFailure> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Sign in again." };

  // RLS already scopes this select to wards the user belongs to.
  const { data: patient } = await supabase
    .from("patients")
    .select("id, ward_id")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return { ok: false, error: "Patient not found, or you are not on this ward." };
  if (!(await isScoringEngineEnabled(patient.ward_id))) {
    return { ok: false, error: "The scoring engine is not enabled for this ward." };
  }
  return { ok: true, supabase, user, patient };
}

async function instanceForPatient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  instanceId: string,
  patientId: string
) {
  const { data } = await supabase
    .from("pathway_instances")
    .select("id, patient_id, ward_id, status")
    .eq("id", instanceId)
    .eq("patient_id", patientId)
    .maybeSingle();
  return data;
}

// ---------------------------------------------------------------------------
// Pathway lifecycle
// ---------------------------------------------------------------------------

export async function activatePathway(patientId: string, instanceId: string): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };

  await a.supabase
    .from("pathway_instances")
    .update({ status: "active", activated_by: a.user.id, activated_at: new Date().toISOString() })
    .eq("id", instanceId);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "pathway_accepted",
    detail: { by: "clinician" },
  });
  await recomputeInstance(instanceId, "manual");
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

export async function dismissPathway(
  patientId: string,
  instanceId: string,
  reason: string
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  if (!reason.trim()) return { error: "A dismissal reason is required." };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };

  await a.supabase
    .from("pathway_instances")
    .update({ status: "dismissed", dismissed_reason: reason.trim() })
    .eq("id", instanceId);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "pathway_dismissed",
    detail: { reason: reason.trim() },
  });
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

export async function resolvePathway(patientId: string, instanceId: string): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };
  await a.supabase.from("pathway_instances").update({ status: "resolved" }).eq("id", instanceId);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "pathway_resolved",
    detail: {},
  });
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

// ---------------------------------------------------------------------------
// Classification inputs (clinician-entered, never inferred)
// ---------------------------------------------------------------------------

export async function setRansonAetiology(
  patientId: string,
  instanceId: string,
  aetiology: "non_gallstone" | "gallstone" | "uncertain"
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };
  await a.supabase.from("pathway_instances").update({ ranson_aetiology: aetiology }).eq("id", instanceId);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "component_overridden",
    detail: { field: "ranson_aetiology", value: aetiology },
  });
  await recomputeInstance(instanceId, "manual");
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

export async function setAtlantaInputs(
  patientId: string,
  instanceId: string,
  inputs: {
    localComplications?: boolean | null;
    systemicComplications?: boolean | null;
    organFailureDurationHours?: number | null;
    organFailureResolved?: boolean | null;
  }
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };
  const { data: cur } = await a.supabase
    .from("pathway_instances")
    .select("classification_inputs")
    .eq("id", instanceId)
    .single();
  const merged = { ...(cur?.classification_inputs ?? {}), ...inputs };
  await a.supabase.from("pathway_instances").update({ classification_inputs: merged }).eq("id", instanceId);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "component_overridden",
    detail: { field: "atlanta_classification_inputs", value: inputs },
  });
  await recomputeInstance(instanceId, "manual");
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

export async function setCtFindings(
  patientId: string,
  instanceId: string,
  ct: { pancreatic_inflammation?: string; pancreatic_necrosis?: string; extrapancreatic?: string }
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };
  const { data: cur } = await a.supabase
    .from("pathway_instances")
    .select("classification_inputs")
    .eq("id", instanceId)
    .single();
  const ci = (cur?.classification_inputs ?? {}) as Record<string, unknown>;
  const merged = { ...ci, ct: { ...((ci.ct as Record<string, string>) ?? {}), ...ct } };
  await a.supabase.from("pathway_instances").update({ classification_inputs: merged }).eq("id", instanceId);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "component_overridden",
    detail: { field: "mctsi_ct_findings", value: ct, source: "clinician-entered from signed report" },
  });
  await recomputeInstance(instanceId, "new_imaging");
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

// ---------------------------------------------------------------------------
// Verification & overrides
// ---------------------------------------------------------------------------

export async function verifyCard(patientId: string, cardRowId: string): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };

  const { data: card } = await a.supabase
    .from("pathway_cards")
    .select("id, instance_id, ward_id, card_id, result, state")
    .eq("id", cardRowId)
    .eq("patient_id", patientId)
    .maybeSingle();
  if (!card) return { error: "Score card not found." };

  const result = card.result as CardResult;
  if (result.missingRequiredCount > 0 || card.state === "incomplete") {
    return { error: "This card still has unknown required components. Resolve or mark them not applicable first." };
  }
  if (card.state === "not_started") return { error: "Nothing to verify yet." };

  const h = hashResult(result.components, result.total, result.classification);
  await a.supabase
    .from("pathway_cards")
    .update({ verified_by: a.user.id, verified_at: new Date().toISOString(), verified_hash: h, state: "verified" })
    .eq("id", cardRowId);
  await audit(a.supabase, {
    instanceId: card.instance_id,
    patientId,
    wardId: card.ward_id,
    actorId: a.user.id,
    action: "result_verified",
    detail: { card: card.card_id, total: result.total, classification: result.classification },
  });
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

export async function overrideComponent(
  patientId: string,
  instanceId: string,
  componentId: string,
  value: string,
  reason: string
): Promise<Result> {
  const a = await authorize(patientId);
  if (!a.ok) return { error: a.error };
  if (!reason.trim()) return { error: "A reason is required to override an imported value." };
  const inst = await instanceForPatient(a.supabase, instanceId, patientId);
  if (!inst) return { error: "Pathway not found." };

  const numeric = Number((value.match(/-?\d+(?:\.\d+)?/) ?? [])[0]);
  await audit(a.supabase, {
    instanceId,
    patientId,
    wardId: inst.ward_id,
    actorId: a.user.id,
    action: "component_overridden",
    detail: {
      component_id: componentId,
      value: value.trim(),
      numeric: Number.isFinite(numeric) ? numeric : null,
      reason: reason.trim(),
    },
  });
  await recomputeInstance(instanceId, "manual");
  revalidatePath(`/patients/${patientId}`);
  return OK;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function declineTask(patientId: string, taskId: string, reason: string): Promise<Result> {
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
  return OK;
}

export async function completeTask(patientId: string, taskId: string): Promise<Result> {
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
    .update({
      status: "completed",
      completed_by: a.user.id,
      completed_at: new Date().toISOString(),
      completion_source: "manual",
    })
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
  return OK;
}

/** Called from the patient page load to keep pathways in step with new observations. */
export async function refreshPatientScoring(patientId: string): Promise<void> {
  await syncPatientPathways(patientId);
}
