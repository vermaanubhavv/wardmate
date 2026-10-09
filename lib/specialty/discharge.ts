import {
  DISCHARGE_TEMPLATES,
  GENERIC_DISCHARGE_TEMPLATE,
  type DischargeTemplate,
} from "@/lib/discharge-templates";
import { BURNS_PLASTIC_SURGERY_DISCHARGE_TEMPLATES, BURNS_PLASTIC_SURGERY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-burns-plastic-surgery";
import { DERMATOLOGY_DISCHARGE_TEMPLATES, DERMATOLOGY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-dermatology";
import { EMERGENCY_DISCHARGE_TEMPLATES, EMERGENCY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-emergency";
import { ENT_DISCHARGE_TEMPLATES, ENT_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-ent";
import { MEDICINE_DISCHARGE_TEMPLATES, MEDICINE_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-medicine";
import { ONCOLOGY_DISCHARGE_TEMPLATES, ONCOLOGY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-oncology";
import { NEUROSURGERY_DISCHARGE_TEMPLATES, NEUROSURGERY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-neurosurgery";
import { OBGYN_DISCHARGE_TEMPLATES, OBGYN_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-obgyn";
import { OPHTHALMOLOGY_DISCHARGE_TEMPLATES, OPHTHALMOLOGY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-ophthalmology";
import { ORTHOPAEDICS_DISCHARGE_TEMPLATES, ORTHOPAEDICS_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-orthopaedics";
import { PAEDIATRICS_DISCHARGE_TEMPLATES, PAEDIATRICS_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-paediatrics";
import { PSYCHIATRY_DISCHARGE_TEMPLATES, PSYCHIATRY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-psychiatry";
import { PULMONARY_DISCHARGE_TEMPLATES, PULMONARY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-pulmonary";
import { UROLOGY_DISCHARGE_TEMPLATES, UROLOGY_GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates-urology";
import type { SpecialtyKey, SpecialtyPack } from "./types";

/**
 * Template selection, per specialty.
 *
 * Template listing and matching live here rather than in lib/discharge-templates.ts so
 * lib/discharge-templates.ts never has to import lib/specialty — this file imports the
 * templates, and the dependency runs one way only.
 *
 * The templates are kept off the packs themselves (lib/specialty/*.ts): a pack is read by
 * most client screens, and carrying every department's templates on it put ~600 KB of
 * discharge text into the ward list, patient page and to-do bundles.
 */

type DischargeTemplateSet = {
  /** The discharge templates this unit is offered, most specific first. */
  templates: DischargeTemplate[];
  /** The fallback when the typed diagnosis matches none of them. */
  generic: DischargeTemplate;
};

const DISCHARGE_TEMPLATE_SETS: Record<SpecialtyKey, DischargeTemplateSet> = {
  general_surgery: { templates: DISCHARGE_TEMPLATES, generic: GENERIC_DISCHARGE_TEMPLATE },
  medical_oncology: { templates: ONCOLOGY_DISCHARGE_TEMPLATES, generic: ONCOLOGY_GENERIC_DISCHARGE_TEMPLATE },
  internal_medicine: { templates: MEDICINE_DISCHARGE_TEMPLATES, generic: MEDICINE_GENERIC_DISCHARGE_TEMPLATE },
  obstetrics_gynaecology: { templates: OBGYN_DISCHARGE_TEMPLATES, generic: OBGYN_GENERIC_DISCHARGE_TEMPLATE },
  pulmonary_medicine: { templates: PULMONARY_DISCHARGE_TEMPLATES, generic: PULMONARY_GENERIC_DISCHARGE_TEMPLATE },
  ent: { templates: ENT_DISCHARGE_TEMPLATES, generic: ENT_GENERIC_DISCHARGE_TEMPLATE },
  psychiatry: { templates: PSYCHIATRY_DISCHARGE_TEMPLATES, generic: PSYCHIATRY_GENERIC_DISCHARGE_TEMPLATE },
  ophthalmology: { templates: OPHTHALMOLOGY_DISCHARGE_TEMPLATES, generic: OPHTHALMOLOGY_GENERIC_DISCHARGE_TEMPLATE },
  dermatology: { templates: DERMATOLOGY_DISCHARGE_TEMPLATES, generic: DERMATOLOGY_GENERIC_DISCHARGE_TEMPLATE },
  burns_plastic_surgery: { templates: BURNS_PLASTIC_SURGERY_DISCHARGE_TEMPLATES, generic: BURNS_PLASTIC_SURGERY_GENERIC_DISCHARGE_TEMPLATE },
  orthopaedics: { templates: ORTHOPAEDICS_DISCHARGE_TEMPLATES, generic: ORTHOPAEDICS_GENERIC_DISCHARGE_TEMPLATE },
  urology: { templates: UROLOGY_DISCHARGE_TEMPLATES, generic: UROLOGY_GENERIC_DISCHARGE_TEMPLATE },
  neurosurgery: { templates: NEUROSURGERY_DISCHARGE_TEMPLATES, generic: NEUROSURGERY_GENERIC_DISCHARGE_TEMPLATE },
  paediatrics: { templates: PAEDIATRICS_DISCHARGE_TEMPLATES, generic: PAEDIATRICS_GENERIC_DISCHARGE_TEMPLATE },
  emergency_medicine: { templates: EMERGENCY_DISCHARGE_TEMPLATES, generic: EMERGENCY_GENERIC_DISCHARGE_TEMPLATE },
};

/** This unit's discharge templates and its fallback. */
export function dischargeTemplatesFor(pack: SpecialtyPack): DischargeTemplateSet {
  return DISCHARGE_TEMPLATE_SETS[pack.key];
}

export function listDischargeTemplatesFor(pack: SpecialtyPack): { key: string; label: string }[] {
  const { templates, generic } = dischargeTemplatesFor(pack);
  return [...templates, generic].map((t) => ({
    key: t.key,
    label: t.label,
  }));
}

export function getDischargeTemplateFor(
  pack: SpecialtyPack,
  key: string | null | undefined
): DischargeTemplate | null {
  if (!key) return null;
  const { templates, generic } = dischargeTemplatesFor(pack);
  if (key === generic.key) return generic;
  return templates.find((t) => t.key === key) ?? null;
}

/**
 * The template the typed procedure / diagnosis / care-template family points at, or null.
 *
 * Same rule as the surgical version it generalises: the diagnosis wording is the most specific
 * signal and is tried first; the care-template family is only a fallback. First match wins, so
 * each pack's array is ordered specific-before-general.
 *
 * The diagnosis HEAD is tried before the rest. A resident's diagnosis line names the condition
 * first and hangs history and incidental findings off it: "Deep organ space SSI ? bile leak with
 * s/p lap cholecystectomy with post exp. laparotomy ivo pyoperitoneum and SAIO". Matched whole,
 * the trailing "SAIO" picked the intestinal-obstruction template — its diet and bowel advice
 * printed on a bile-leak summary. So: the head (before the first "with", "s/p", "post", "in view
 * of", "k/c/o", comma or semicolon), then the procedure actually done, then everything together
 * as before. A cause ("due to", "secondary to") stays in the head: the cause is often the point.
 */
const DIAGNOSIS_TAIL =
  /\s+(?:with|w\/|s\/p|status post|post|ivo|i\/v\/o|in view of|k\/c\/o|known case of|h\/o|and)\s+|[,;]/i;

export function matchDischargeTemplateFor(
  pack: SpecialtyPack,
  input: {
    procedureText?: string | null;
    diagnosisText?: string | null;
    templateFamily?: string | null;
  }
): DischargeTemplate | null {
  const diagnosis = input.diagnosisText?.trim() ?? "";
  const procedure = input.procedureText?.trim() ?? "";
  const head = diagnosis.split(DIAGNOSIS_TAIL)[0].trim();
  const { templates } = dischargeTemplatesFor(pack);
  for (const text of [head, procedure, `${procedure} ${diagnosis}`.trim()]) {
    if (!text) continue;
    const byText = templates.find((t) => t.match.test(text));
    if (byText) return byText;
  }
  if (input.templateFamily) {
    const byFamily = templates.find((t) =>
      t.families?.includes(input.templateFamily!)
    );
    if (byFamily) return byFamily;
  }
  return null;
}

export * from "./discharge-profile";
