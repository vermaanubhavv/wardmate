import { createClient } from "@/lib/supabase/server";
import { derivePatientState } from "@/lib/patient-state";
import { getTemplateForPatient, getProcedureLabels, procedureFor } from "@/lib/templates";
import { isIdentifierLabel } from "@/lib/patients";
import { buildDischargeNote, type DischargeNote } from "@/lib/discharge";
import { getFormularyMappings, getFormularySize } from "@/lib/formulary";
import { getWardFormats } from "@/lib/formats";

export type DischargeContext = {
  note: DischargeNote;
  wardId: string;
  /** 0 when this ward has never imported its hospital formulary — the screen then says nothing
   *  about formulary linking at all, rather than offering a picker with nothing in it. */
  formularySize: number;
};

/**
 * Everything the discharge summary needs, fetched once and shared by both places it renders —
 * the print page and the Word-document download. Kept in one place so the two can never drift:
 * a fix to one (like the isIdentifierLabel filter below) automatically applies to the other.
 */
export async function getDischargeContext(patientId: string): Promise<DischargeContext | null> {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, ward_id, display_name, age_years, sex, bed, mrd_no, uhid_ip_no, primary_diagnosis, admitted_on, surgery_date, post_op_day, admission_day, management, template_family, template_variant, procedure_text"
    )
    .eq("id", patientId)
    .maybeSingle();

  if (!patient) return null;

  const [{ data: entriesData }, procedures, { data: wardRow }, template, formularyMappings, formularySize, wardFormats] =
    await Promise.all([
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
      getFormularyMappings(patient.ward_id),
      getFormularySize(patient.ward_id),
      getWardFormats(patient.ward_id),
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

  // What was written the day the patient came in, kept separate from the rest of the record.
  // "History on Admission" is the clerking — complaints, history of presenting illness, past
  // history, examination on arrival — and today's exam findings are not that. Without this,
  // the section filled with whatever notes happened to be lying around, which on a post-op
  // patient meant the anaesthetic line off a photographed OT note printing as their history.
  const admissionObservations = (entriesData ?? [])
    .filter((e) => e.is_case_history)
    .flatMap((e) => e.observations)
    .filter((o) => !isIdentifierLabel(o.label));

  const note = buildDischargeNote(patient, patientState, medications, procedure, {
    admissionObservations,
    letterhead: wardRow?.letterhead ?? null,
    wardName: wardRow?.name ?? null,
    formularyMappings,
    logoUrl: wardFormats.get("logo")?.url ?? null,
  });

  return { note, wardId: patient.ward_id as string, formularySize };
}
