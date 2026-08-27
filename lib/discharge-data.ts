import { createClient } from "@/lib/supabase/server";
import { derivePatientState } from "@/lib/patient-state";
import { getTemplateForPatient, getProcedureLabels, procedureFor } from "@/lib/templates";
import { isIdentifierLabel } from "@/lib/patients";
import { buildDischargeNote, type DischargeNote } from "@/lib/discharge";

/**
 * Everything the discharge summary needs, fetched once and shared by both places it renders —
 * the print page and the Word-document download. Kept in one place so the two can never drift:
 * a fix to one (like the isIdentifierLabel filter below) automatically applies to the other.
 */
export async function getDischargeNote(patientId: string): Promise<DischargeNote | null> {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, mrd_no, primary_diagnosis, admitted_on, surgery_date, post_op_day, admission_day, management, template_family, template_variant, procedure_text"
    )
    .eq("id", patientId)
    .maybeSingle();

  if (!patient) return null;

  const [{ data: entriesData }, procedures, { data: wardRow }, template] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "recorded_at, is_case_history, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, ref_low, ref_high, ref_text)"
      )
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false }),
    getProcedureLabels(),
    supabase.from("wards").select("name, letterhead").eq("id", patient.ward_id).maybeSingle(),
    getTemplateForPatient(patient),
  ]);

  // Bed number and the patient's own name are properties of the patient, not clinical findings
  // — the same filter the main patient page applies before deriving anything from an
  // observation. Without it, "Bed number 1" and the patient's own name printed straight into
  // "History and course in hospital" as if they were part of the narrative.
  const allObservations = (entriesData ?? [])
    .flatMap((e) => e.observations)
    .filter((o) => !isIdentifierLabel(o.label));
  const patientState = derivePatientState(allObservations, template);
  const procedure = procedureFor(patient, procedures);

  const seenDrugs = new Set<string>();
  const medications = allObservations.filter((o) => o.kind === "medication").filter((o) => {
    const key = o.label.toLowerCase().trim();
    if (seenDrugs.has(key)) return false;
    seenDrugs.add(key);
    return true;
  });

  return buildDischargeNote(patient, patientState, medications, procedure, {
    letterhead: wardRow?.letterhead ?? null,
    wardName: wardRow?.name ?? null,
  });
}
