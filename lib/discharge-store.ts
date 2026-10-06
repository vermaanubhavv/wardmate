import { createClient } from "@/lib/supabase/server";
import { getDischargeContext, type DischargeContext, type DischargeRow } from "@/lib/discharge-data";
import { compileDischargeDraft } from "@/lib/discharge-compile";
import { runDischargeChecks, buildCheckContext, type DischargeCheck } from "@/lib/discharge-checks";
import type { DischargeDraft, DischargeSectionId, Procedure } from "@/lib/discharge-entities";
import { finalCheck, polishProse, type FinalFix } from "@/lib/final-check";
import { checkDates } from "@/lib/date-check-ai";
import { dateAnchors } from "@/lib/date-check";

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
  admission: { column: "encounter", key: "admission" },
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
  const compiled = compileDischargeDraft(context, { pack: context.pack });
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
  // The workspace drafts its AI sections in parallel, so a sibling write can create the row
  // between our select and insert (unique patient_id). The row is a fresh draft: just update it.
  if (error?.code === "23505") {
    const { error: upErr } = await supabase
      .from("discharge_summaries")
      .update({ [column]: value, updated_at: now })
      .eq("patient_id", patientId);
    return upErr ? { ok: false, error: upErr.message } : { ok: true };
  }
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
  const admission = {
    ...draft.admission,
    dischargedAt: draft.admission.dischargedAt ?? now,
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
    encounter: admission, // the column keeps its original name
    updated_at: now,
  };

  const { error } = existing
    ? await supabase.from("discharge_summaries").update(patch).eq("patient_id", patientId)
    : await supabase
        .from("discharge_summaries")
        .insert({ patient_id: patientId, ward_id: context.wardId, created_by: user.id, ...patch });
  if (error) return { ok: false, error: error.message };
  // No proofread here: the print sheet starts it the moment it opens (print-button.tsx), so
  // Finalise does not wait on the model.
  return { ok: true };
}

/**
 * Sonnet's proofread of the summary — run each time the print sheet opens, and on Word download.
 *
 * The Clinical Course is re-punctuated and re-framed (polishProse); every other text field gets
 * the mechanical fixes only (finalCheck), and its questions are kept beside the summary, never
 * applied. Writes straight to the row, finalised or not: this is the app tidying its own output,
 * recorded in final_check, not the resident editing. Skipped when nothing has changed since the
 * last proofread. A failed pass changes nothing — lib/final-check.ts.
 */
export async function proofreadDischarge(patientId: string): Promise<{ changed: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = await getDischargeContext(patientId);
  if (!user || !context) return { changed: false };

  const lastCheck = (context.row?.final_check as { checkedAt?: string } | null)?.checkedAt;
  if (lastCheck && context.row?.updated_at && Date.parse(lastCheck) >= Date.parse(context.row.updated_at)) return { changed: false };

  const draft = mergeDischargeDraft(context);
  const course = draft.clinicalCourse.text;
  const fields = dischargeFields(draft);
  const [polished, checked, dateQuestions] = await Promise.all([
    polishProse(course, "Clinical Course of a discharge summary"),
    finalCheck(fields, "discharge summary"),
    // Haiku reads the dates, code compares them — lib/date-check.ts.
    checkDates(Object.values(fields).join("\n"), dateAnchors(draft)),
  ]);
  let fixes: FinalFix[] = checked.fixes;
  if (polished !== course) {
    // The reworded course replaces it whole, so the line-level fixes to it are moot.
    checked.fields.clinicalCourse = polished;
    fixes = [...fixes.filter((f) => f.field !== "clinicalCourse"), { field: "clinicalCourse", kind: "reworded", before: course, after: polished }];
  }
  const fixedDraft = withDischargeFields(draft, checked.fields);
  const fixedSections = new Set(fixes.map((f) => f.field.split(":")[0] as DischargeSectionId));

  const now = new Date().toISOString();
  const patch = {
    updated_at: now,
    final_check: { checkedAt: now, fixes, questions: [...new Set([...dateQuestions, ...checked.questions])] },
    ...Object.fromEntries(
      [...fixedSections].map((id) => [SECTION_COLUMN[id].column, fixedDraft[SECTION_COLUMN[id].key]])
    ),
  };
  const { error } = context.row
    ? await supabase.from("discharge_summaries").update(patch).eq("patient_id", patientId)
    : await supabase
        .from("discharge_summaries")
        .insert({ patient_id: patientId, ward_id: context.wardId, created_by: user.id, ...patch });
  if (error) console.warn("final-check: could not save", error.message);
  return { changed: !error && fixes.length > 0 };
}

// --- The text the final check may proofread ---------------------------------------------
// Keys are "<section id>:<row>" so a fix maps back to the one column it changed. Medications
// are left out on purpose: drug names and doses are never edited, only asked about.

const PROCEDURE_TEXT = ["name", "indication", "findings", "drains", "complications", "outcome"] as const;

function dischargeFields(d: DischargeDraft): Record<string, string> {
  const f: Record<string, string> = {};
  const put = (k: string, v: string | null | undefined) => {
    if (v?.trim()) f[k] = v;
  };
  put("indication", d.indicationForAdmission.text);
  d.diagnoses.forEach((x) => put(`diagnoses:${x.id}`, x.text));
  d.procedures.forEach((p) => PROCEDURE_TEXT.forEach((k) => put(`procedures:${p.id}:${k}`, p[k])));
  put("clinicalCourse", d.clinicalCourse.text);
  d.relevantInvestigations.items.forEach((i) => put(`relevantInvestigations:${i.id}`, i.text));
  put("conditionAtDischarge:prose", d.conditionAtDischarge.prose);
  put("conditionAtDischarge:freeText", d.conditionAtDischarge.freeText);
  d.primaryCareActions.forEach((a, i) => put(`primaryCareActions:${i}`, a));
  d.patientActions.forEach((a, i) => put(`patientActions:${i}`, a));
  d.advice.items.forEach((a) => put(`advice:${a.id}`, a.text));
  d.redFlags.items.forEach((r, i) => put(`redFlags:${i}`, r));
  return f;
}

/** Put proofread text back. A row the check emptied (a removed placeholder) is dropped. */
function withDischargeFields(d: DischargeDraft, f: Record<string, string>): DischargeDraft {
  const g = (k: string, v: string) => f[k] ?? v;
  const prose = g("conditionAtDischarge:prose", d.conditionAtDischarge.prose);
  return {
    ...d,
    indicationForAdmission: { ...d.indicationForAdmission, text: g("indication", d.indicationForAdmission.text) },
    diagnoses: d.diagnoses.map((x) => ({ ...x, text: g(`diagnoses:${x.id}`, x.text) })).filter((x) => x.text.trim()),
    procedures: d.procedures.map((p) => {
      const out: Procedure = { ...p };
      for (const k of PROCEDURE_TEXT) if (p[k] != null) out[k] = g(`procedures:${p.id}:${k}`, p[k] as string);
      return out;
    }),
    clinicalCourse: { ...d.clinicalCourse, text: g("clinicalCourse", d.clinicalCourse.text) },
    relevantInvestigations: {
      ...d.relevantInvestigations,
      items: d.relevantInvestigations.items.map((i) => ({ ...i, text: g(`relevantInvestigations:${i.id}`, i.text) })),
    },
    conditionAtDischarge: {
      ...d.conditionAtDischarge,
      prose,
      // A fixed prose is hand-edited from here on, or the next vars change would rebuild the typo.
      proseEdited: d.conditionAtDischarge.proseEdited || prose !== d.conditionAtDischarge.prose,
      freeText:
        d.conditionAtDischarge.freeText == null
          ? null
          : g("conditionAtDischarge:freeText", d.conditionAtDischarge.freeText),
    },
    primaryCareActions: d.primaryCareActions.map((a, i) => g(`primaryCareActions:${i}`, a)).filter((a) => a.trim()),
    patientActions: d.patientActions.map((a, i) => g(`patientActions:${i}`, a)).filter((a) => a.trim()),
    advice: { ...d.advice, items: d.advice.items.map((a) => ({ ...a, text: g(`advice:${a.id}`, a.text) })).filter((a) => a.text.trim()) },
    redFlags: { ...d.redFlags, items: d.redFlags.items.map((r, i) => g(`redFlags:${i}`, r)).filter((r) => r.trim()) },
  };
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
