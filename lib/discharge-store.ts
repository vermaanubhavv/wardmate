import { createClient } from "@/lib/supabase/server";
import { getDischargeContext, type DischargeContext, type DischargeRow } from "@/lib/discharge-data";
import { compileDischargeDraft } from "@/lib/discharge-compile";
import { buildConditionProse } from "@/lib/discharge-compile";
import { runDischargeChecks, buildCheckContext, type DischargeCheck } from "@/lib/discharge-checks";
import type { DischargeDraft, DischargeSectionId } from "@/lib/discharge-entities";

/**
 * The stored discharge, merged over a freshly compiled one.
 *
 * A section the resident has never saved is jsonb null in the row, and shows its COMPILED value
 * — so it keeps tracking the record as rounds are added. The first save writes the section's
 * real shape, and from then on the stored value wins. This is the whole reason the workspace
 * can be left and come back to without losing edits, and equally without freezing a section
 * that was never touched.
 */

type ColumnKey = keyof Omit<DischargeRow, "id" | "status" | "finalised_at">;

const SECTION_COLUMN: Record<DischargeSectionId, { column: ColumnKey; key: keyof DischargeDraft }> = {
  indication: { column: "indication_for_admission", key: "indicationForAdmission" },
  encounter: { column: "encounter", key: "encounter" },
  diagnoses: { column: "diagnoses", key: "diagnoses" },
  procedures: { column: "procedures", key: "procedures" },
  clinicalCourse: { column: "clinical_course", key: "clinicalCourse" },
  relevantInvestigations: { column: "relevant_investigations", key: "relevantInvestigations" },
  histopathology: { column: "histopathology", key: "histopathology" },
  medications: { column: "medications", key: "medications" },
  conditionAtDischarge: { column: "condition_at_discharge", key: "conditionAtDischarge" },
  primaryCareActions: { column: "primary_care_actions", key: "primaryCareActions" },
  patientActions: { column: "patient_actions", key: "patientActions" },
  advice: { column: "advice", key: "advice" },
  redFlags: { column: "red_flags", key: "redFlags" },
  authentication: { column: "authentication", key: "authentication" },
};

export function mergeDischargeDraft(context: DischargeContext): DischargeDraft {
  const compiled = compileDischargeDraft(context);
  const row = context.row;
  if (!row) return compiled;

  const merged: DischargeDraft = { ...compiled, status: row.status, finalisedAt: row.finalised_at };
  for (const { column, key } of Object.values(SECTION_COLUMN)) {
    const stored = row[column];
    if (stored !== null && stored !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (merged as any)[key] = stored;
    }
  }
  return merged;
}

async function wardIdFor(patientId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("current_patients")
    .select("ward_id")
    .eq("id", patientId)
    .maybeSingle();
  return (data?.ward_id as string | undefined) ?? null;
}

/** Write one section. Creates the row on first save. */
export async function writeDischargeSection(
  patientId: string,
  sectionId: DischargeSectionId,
  value: unknown
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { column } = SECTION_COLUMN[sectionId];
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("discharge_summaries")
    .select("id, status")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "finalised")
      return { ok: false, error: "This summary is finalised. Reopen it before editing." };
    const { error } = await supabase
      .from("discharge_summaries")
      .update({ [column]: value, updated_at: now })
      .eq("patient_id", patientId);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const wardId = await wardIdFor(patientId);
  if (!wardId) return { ok: false, error: "Patient not found." };
  const { error } = await supabase.from("discharge_summaries").insert({
    patient_id: patientId,
    ward_id: wardId,
    created_by: user.id,
    [column]: value,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Approve an AI section — Clinical Course, Indication, or the Relevant Investigations list. */
export async function approveDischargeSection(
  patientId: string,
  sectionId: "clinicalCourse" | "indication" | "relevantInvestigations"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const context = await getDischargeContext(patientId);
  if (!context) return { ok: false, error: "Patient not found." };
  const draft = mergeDischargeDraft(context);
  const now = new Date().toISOString();

  if (sectionId === "clinicalCourse") {
    if (!draft.clinicalCourse.text.trim()) return { ok: false, error: "Nothing to approve yet." };
    return writeDischargeSection(patientId, "clinicalCourse", {
      ...draft.clinicalCourse,
      approvedAt: now,
      approvedBy: user.id,
    });
  }
  if (sectionId === "indication") {
    if (!draft.indicationForAdmission.text.trim()) return { ok: false, error: "Nothing to approve yet." };
    return writeDischargeSection(patientId, "indication", {
      ...draft.indicationForAdmission,
      approvedAt: now,
      approvedBy: user.id,
    });
  }
  return writeDischargeSection(patientId, "relevantInvestigations", {
    ...draft.relevantInvestigations,
    approvedAt: now,
    approvedBy: user.id,
  });
}

/** Finalise. Runs the completeness checks server-side and refuses while any block remains. */
export async function finaliseDischargeSummary(
  patientId: string
): Promise<{ ok: boolean; blocking?: DischargeCheck[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const context = await getDischargeContext(patientId);
  if (!context) return { ok: false, error: "Patient not found." };
  const draft = mergeDischargeDraft(context);

  const { blocking } = runDischargeChecks(draft, buildCheckContext(context));
  if (blocking.length > 0) return { ok: false, blocking };

  const now = new Date().toISOString();
  const authentication = {
    ...draft.authentication,
    completedAt: draft.authentication.completedAt ?? now,
  };
  const encounter = {
    ...draft.encounter,
    dischargedAt: draft.encounter.dischargedAt ?? now,
  };

  const { data: existing } = await supabase
    .from("discharge_summaries")
    .select("id")
    .eq("patient_id", patientId)
    .maybeSingle();

  const patch = {
    status: "finalised" as const,
    finalised_at: now,
    finalised_by: user.id,
    authentication,
    encounter,
    updated_at: now,
  };

  if (existing) {
    const { error } = await supabase.from("discharge_summaries").update(patch).eq("patient_id", patientId);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const wardId = context.wardId;
  const { error } = await supabase
    .from("discharge_summaries")
    .insert({ patient_id: patientId, ward_id: wardId, created_by: user.id, ...patch });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function reopenDischargeSummary(patientId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("discharge_summaries")
    .update({ status: "draft", finalised_at: null, finalised_by: null, updated_at: new Date().toISOString() })
    .eq("patient_id", patientId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Reset a draft to a freshly compiled one — deletes the stored row. */
export async function resetDischargeSummary(patientId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("discharge_summaries").delete().eq("patient_id", patientId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Recompute the Condition-at-Discharge prose from its variables unless the resident edited it. */
export function withConditionProse(condition: DischargeDraft["conditionAtDischarge"]): DischargeDraft["conditionAtDischarge"] {
  if (condition.proseEdited) return condition;
  return { ...condition, prose: buildConditionProse(condition.vars) };
}
