import type { SpecialtyKey, SpecialtyPack } from "./types";

/** The department's name where space is tight — the ward header's subtitle. */
export const SHORT_LABELS: Record<SpecialtyKey, string> = {
  general: "General",
  general_surgery: "Gen. Surgery",
  medical_oncology: "Med. Oncology",
  internal_medicine: "Int. Medicine",
  obstetrics_gynaecology: "OBG",
  pulmonary_medicine: "Pulm. Medicine",
  ent: "ENT",
  psychiatry: "Psychiatry",
  ophthalmology: "Ophthalmology",
  dermatology: "Dermatology",
  burns_plastic_surgery: "Burns & Plastics",
  orthopaedics: "Ortho",
  urology: "Urology",
  neurosurgery: "Neurosurgery",
  paediatrics: "Paediatrics",
  emergency_medicine: "Emergency",
};

export function shortLabel(pack: Pick<SpecialtyPack, "key" | "label">): string {
  return SHORT_LABELS[pack.key] ?? pack.label;
}
