import type { DischargeContext } from "@/lib/discharge-data";
import type { Observation, PatientState } from "@/lib/patient-state";
import { consultantForWard } from "@/lib/unit-consultants";
import { generalSurgeryPack, type SpecialtyPack } from "@/lib/specialty";
import { getDischargeTemplateFor, matchDischargeTemplateFor } from "@/lib/specialty/discharge";
import { compileDischargeDraft } from "@/lib/discharge-compile";
import { buildCheckContext, type DischargeCheckContext } from "@/lib/discharge-checks";
import type { DischargeDraft } from "@/lib/discharge-entities";
import type { DischargeTemplate } from "@/lib/discharge-templates";

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
  ward: { id: string; name: string; letterhead: string | null; consultant_in_charge?: string | null } | null,
  logoUrl: string | null,
  formularyMappings: Map<string, string>,
  observations: Observation[],
  patientState: PatientState,
  medications: Observation[],
  /** The unit's specialty pack. Defaults to general surgery, so an older caller behaves the
   *  way this function always did. */
  pack: SpecialtyPack = generalSurgeryPack,
  /** See DischargeContext.isEsicFaridabad. Defaults true — the same fallback
   *  getWardIsEsicFaridabad uses when a ward's own value cannot be read — so an older caller
   *  keeps printing the letterhead it always has. */
  isEsicFaridabad = true
): DischargeContext {
  const age = Number(identity.age);
  const admitted = identity.admittedOn?.trim() || new Date().toISOString().slice(0, 10);
  return {
    pack,
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
    wardConsultant: consultantForWard(ward?.consultant_in_charge ?? null, ward?.name),
    letterhead: ward?.letterhead ?? null,
    logoUrl,
    isEsicFaridabad,
    doctor: null,
    observations,
    admissionObservations: [],
    patientState,
    procedure: identity.procedure?.trim() || null,
    medications,
    formularyMappings,
    formularySize: 0,
    row: null,
    aiDraftStale: false,
  };
}

/** The template picker's "No template — start blank". */
export const NO_TEMPLATE = "__none__";

/**
 * A one-off draft, compiled by the same compileDischargeDraft and checked by the same
 * buildCheckContext a ward patient's discharge uses, along the diagnosis template the resident
 * chose: NO_TEMPLATE = none; a key = that template; otherwise the one the typed procedure /
 * diagnosis points at. seedAll — with no record, the template's `[ … ]` blanks fill every
 * section it has a skeleton for.
 */
export function buildOneOffDraft(
  context: DischargeContext,
  templateKey: string | null | undefined,
  identity: OneOffIdentity
): { draft: DischargeDraft; checkContext: DischargeCheckContext; template: DischargeTemplate | null } {
  const template =
    templateKey === NO_TEMPLATE
      ? null
      : (getDischargeTemplateFor(context.pack, templateKey) ??
        matchDischargeTemplateFor(context.pack, {
          procedureText: identity.procedure,
          diagnosisText: identity.diagnosis,
        }));
  return {
    draft: compileDischargeDraft(context, { template, seedAll: true, pack: context.pack }),
    checkContext: buildCheckContext(context),
    template,
  };
}
