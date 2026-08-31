import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { derivePatientState, type Observation, type PatientState } from "@/lib/patient-state";
import { getTemplateForPatient, getProcedureLabels, procedureFor } from "@/lib/templates";
import { isIdentifierLabel } from "@/lib/patients";
import { getFormularyMappings, getFormularySize } from "@/lib/formulary";
import { getWardFormats } from "@/lib/formats";

/**
 * The raw materials a discharge summary is compiled and rendered from — patient, every
 * observation on the record, the derived state, the operation, the ward heading, the signed-in
 * doctor, and the discharge_summaries row if one exists.
 *
 * Fetched once and shared by everything that touches a discharge: the compiler
 * (lib/discharge-compile.ts), the AI digest (lib/discharge-ai.ts), the completeness checks
 * (lib/discharge-checks.ts), the printable document (lib/discharge-render.ts) and the Word
 * export. Keeping it in one place is why a fix to any of those cannot leave the others behind.
 */
export type DischargePatient = {
  id: string;
  ward_id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  mrd_no: string | null;
  uhid_ip_no: string | null;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  management: string | null;
  template_family: string | null;
  template_variant: string | null;
  procedure_text: string | null;
};

export type DischargeRow = {
  id: string;
  status: "draft" | "finalised";
  finalised_at: string | null;
  indication_for_admission: unknown;
  encounter: unknown;
  diagnoses: unknown;
  procedures: unknown;
  clinical_course: unknown;
  relevant_investigations: unknown;
  histopathology: unknown;
  medications: unknown;
  condition_at_discharge: unknown;
  primary_care_actions: unknown;
  patient_actions: unknown;
  advice: unknown;
  red_flags: unknown;
  authentication: unknown;
};

export type DischargeDoctor = {
  display_name: string | null;
  designation: string | null;
  department: string | null;
};

export type DischargeContext = {
  patient: DischargePatient;
  wardId: string;
  wardName: string | null;
  letterhead: string | null;
  logoUrl: string | null;
  doctor: DischargeDoctor | null;
  /** Every observation on the record, with identifiers (bed, name, age) already filtered out —
   *  the same filter the patient page applies before deriving anything. Newest first. */
  observations: Observation[];
  /** Everything recorded on the admission clerking, in its own right. */
  admissionObservations: Observation[];
  patientState: PatientState;
  procedure: string | null;
  /** Latest of each drug recorded, newest first. */
  medications: Observation[];
  formularyMappings: Map<string, string>;
  /** 0 when this ward has never imported its hospital formulary. */
  formularySize: number;
  /** The stored discharge_summaries row, or null when nothing has been saved yet. */
  row: DischargeRow | null;
};

const DISCHARGE_ROW_COLUMNS =
  "id, status, finalised_at, indication_for_admission, encounter, diagnoses, procedures, clinical_course, relevant_investigations, histopathology, medications, condition_at_discharge, primary_care_actions, patient_actions, advice, red_flags, authentication";

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

  const [
    { data: entriesData },
    procedures,
    { data: wardRow },
    { data: profileRow },
    template,
    formularyMappings,
    formularySize,
    wardFormats,
    { data: dischargeRow },
  ] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "recorded_at, is_case_history, observations(id, kind, label, value_text, value_num, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, pac_verdict, ref_low, ref_high, ref_text)"
      )
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false }),
    getProcedureLabels(),
    supabase.from("wards").select("name, letterhead").eq("id", patient.ward_id).maybeSingle(),
    getUser().then((u) => supabase.from("profiles").select("display_name, designation, department").eq("id", u?.id ?? "").maybeSingle()),
    getTemplateForPatient(patient),
    getFormularyMappings(patient.ward_id),
    getFormularySize(patient.ward_id),
    getWardFormats(patient.ward_id),
    supabase.from("discharge_summaries").select(DISCHARGE_ROW_COLUMNS).eq("patient_id", patientId).maybeSingle(),
  ]);

  // Bed number and the patient's own name are properties of the patient, not clinical findings
  // — the same filter the patient page applies before deriving anything.
  const observations = (entriesData ?? [])
    .flatMap((e) => e.observations)
    .filter((o) => !isIdentifierLabel(o.label)) as Observation[];

  const patientState = derivePatientState(observations, template);
  const procedure = procedureFor(patient, procedures);

  const seenDrugs = new Set<string>();
  const medications = observations
    .filter((o) => o.kind === "medication")
    .filter((o) => {
      const key = o.label.toLowerCase().trim();
      if (seenDrugs.has(key)) return false;
      seenDrugs.add(key);
      return true;
    });

  const admissionObservations = (entriesData ?? [])
    .filter((e) => e.is_case_history)
    .flatMap((e) => e.observations)
    .filter((o) => !isIdentifierLabel(o.label)) as Observation[];

  return {
    patient: patient as DischargePatient,
    wardId: patient.ward_id as string,
    wardName: wardRow?.name ?? null,
    letterhead: wardRow?.letterhead ?? null,
    logoUrl: wardFormats.get("logo")?.url ?? null,
    doctor: profileRow
      ? {
          display_name: profileRow.display_name ?? null,
          designation: profileRow.designation ?? null,
          department: profileRow.department ?? null,
        }
      : null,
    observations,
    admissionObservations,
    patientState,
    procedure,
    medications,
    formularyMappings,
    formularySize,
    row: (dischargeRow as DischargeRow | null) ?? null,
  };
}
