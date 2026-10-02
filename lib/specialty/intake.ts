import { getSpecialtyPack } from "./index";
import type { SpecialtyKey, SpecialtyPack } from "./types";

/**
 * What the add/edit-patient forms offer, per department. Kept out of the packs themselves so
 * they stay untouched; every lookup here falls back to general surgery's values for a key it
 * does not know, which is how the app behaved before this file existed.
 */

/**
 * Does this unit count days from an operation? Read off the pack's own day clock rather than
 * kept as a second list: a patient with a post-op day gets a POD only on a ward that has one.
 * Units without it (medicine, oncology, psychiatry…) are never offered Pre-op/Post-op.
 */
export function hasOperationClock(pack: SpecialtyPack): boolean {
  return pack.dayCount({ admission_day: 1, post_op_day: 1 }).clock === "post_op";
}

/**
 * The 50 diagnoses a general-surgery ward admits most often, **ordered by frequency** — so the
 * combobox can show the top few before the resident has typed anything and narrow as they do.
 * The order is the ranking; slice(0, 5) is "the common ones". Anything typed that is not on
 * this list is still kept exactly as written — this only offers, never constrains.
 */
export const COMMON_DIAGNOSES = [
  "Cholelithiasis",
  "Acute appendicitis",
  "Acute calculous cholecystitis",
  "Inguinal hernia",
  "Fissure in ano",
  "Haemorrhoids",
  "Fistula in ano",
  "Hydrocele",
  "Acute pancreatitis",
  "Perforation peritonitis",
  "Intestinal obstruction",
  "Umbilical hernia",
  "Incisional hernia",
  "Diabetic foot",
  "Soft tissue abscess",
  "Cellulitis",
  "Lipoma",
  "Sebaceous cyst",
  "Perianal abscess",
  "Pilonidal sinus",
  "Carcinoma breast",
  "Carcinoma stomach",
  "Carcinoma rectum",
  "Carcinoma colon",
  "Choledocholithiasis",
  "Gastric outlet obstruction",
  "Thyroid swelling",
  "Varicose veins",
  "Blunt abdominal trauma",
  "Chronic pancreatitis",
  "Acute cholangitis",
  "Liver abscess",
  "Perforated peptic ulcer",
  "Carcinoma gallbladder",
  "Carcinoma pancreas",
  "Splenic injury",
  "Rectal prolapse",
  "Breast abscess",
  "Thyroid nodule",
  "Multinodular goitre",
  "Femoral hernia",
  "Ventral hernia",
  "Necrotising fasciitis",
  "Mirizzi syndrome",
  "Ischiorectal abscess",
  "Volvulus",
  "Intussusception",
  "Empyema gallbladder",
  "Strangulated hernia",
  "Biliary colic",
] as const;

/** Common admissions to an Indian medicine ward, commonest first. Suggestions only. */
const MEDICINE_DIAGNOSES = [
  "Dengue fever",
  "Enteric fever",
  "Community-acquired pneumonia",
  "Acute kidney injury",
  "Diabetic ketoacidosis",
  "Decompensated chronic liver disease",
  "Acute decompensated heart failure",
  "Stroke",
  "Sepsis",
  "COPD exacerbation",
  "Malaria",
  "Acute gastroenteritis",
  "Urinary tract infection",
  "Pulmonary tuberculosis",
  "Hypertensive emergency",
  "Chronic kidney disease",
  "Hyponatraemia",
  "Severe anaemia",
  "Organophosphate poisoning",
  "Scrub typhus",
];

const PULMONARY_DIAGNOSES = [
  "COPD exacerbation",
  "Community-acquired pneumonia",
  "Pulmonary tuberculosis",
  "Acute exacerbation of asthma",
  "Pleural effusion",
  "Pneumothorax",
  "Interstitial lung disease",
  "Bronchiectasis",
  "Lung abscess",
  "Pulmonary embolism",
  "Empyema",
  "Haemoptysis",
];

const DIAGNOSES: Partial<Record<SpecialtyKey, readonly string[]>> = {
  general_surgery: COMMON_DIAGNOSES,
  internal_medicine: MEDICINE_DIAGNOSES,
  pulmonary_medicine: PULMONARY_DIAGNOSES,
};

/**
 * The diagnoses the box offers on an empty field, for this unit. A surgical unit without its
 * own list borrows general surgery's; a non-surgical one without a list gets none — offering
 * Cholelithiasis on a psychiatry ward is worse than offering nothing.
 */
export function commonDiagnosesFor(key: string | null | undefined): readonly string[] {
  const pack = getSpecialtyPack(key);
  return DIAGNOSES[pack.key] ?? (hasOperationClock(pack) ? COMMON_DIAGNOSES : []);
}
