import type { DischargeContext } from "@/lib/discharge-data";
import type { Observation, PatientState } from "@/lib/patient-state";

/**
 * The in-memory DischargeContext a one-off discharge summary is compiled and rendered from —
 * for somebody who is not a patient in WardMate. No database row, no stored observations that
 * outlive the request; the ward heading, logo and formulary are the signing doctor's own.
 */
export type OneOffIdentity = {
  name?: string;
  age?: string;
  sex?: string;
  ipNo?: string;
  mrdNo?: string;
  admittedOn?: string;
  procedure?: string;
  surgeryDate?: string;
  diagnosis?: string;
};

export function oneOffContext(
  identity: OneOffIdentity,
  ward: { id: string; name: string; letterhead: string | null } | null,
  logoUrl: string | null,
  formularyMappings: Map<string, string>,
  observations: Observation[],
  patientState: PatientState,
  medications: Observation[]
): DischargeContext {
  const age = Number(identity.age);
  const admitted = identity.admittedOn?.trim() || new Date().toISOString().slice(0, 10);
  return {
    patient: {
      id: "",
      ward_id: ward?.id ?? "",
      display_name: (identity.name ?? "").trim(),
      age_years: Number.isFinite(age) && age > 0 ? age : null,
      sex: identity.sex?.trim() || null,
      bed: "",
      mrd_no: identity.mrdNo?.trim() || null,
      uhid_ip_no: identity.ipNo?.trim() || null,
      primary_diagnosis: identity.diagnosis?.trim() || null,
      admitted_on: admitted,
      surgery_date: identity.surgeryDate?.trim() || null,
      post_op_day: null,
      admission_day: 1,
      management: null,
      template_family: null,
      template_variant: null,
      procedure_text: identity.procedure?.trim() || null,
    },
    wardId: ward?.id ?? "",
    wardName: ward?.name ?? null,
    letterhead: ward?.letterhead ?? null,
    logoUrl,
    doctor: null,
    observations,
    admissionObservations: [],
    patientState,
    procedure: identity.procedure?.trim() || null,
    medications,
    formularyMappings,
    formularySize: 0,
    row: null,
  };
}
