import type { DischargeTemplate } from "@/lib/discharge-templates";
import { CONDITION_VARIABLES, type ConditionVariableKey } from "@/lib/discharge-entities";
import type { SpecialtyKey, SpecialtyPack } from "./types";

/**
 * Template selection, per specialty.
 *
 * These are the pack-aware versions of listDischargeTemplates / getDischargeTemplate /
 * matchDischargeTemplate in lib/discharge-templates.ts. They live here rather than there so
 * lib/discharge-templates.ts never has to import lib/specialty — the packs import the
 * templates, and the dependency runs one way only.
 */

export function listDischargeTemplatesFor(pack: SpecialtyPack): { key: string; label: string }[] {
  return [...pack.dischargeTemplates, pack.genericDischargeTemplate].map((t) => ({
    key: t.key,
    label: t.label,
  }));
}

export function getDischargeTemplateFor(
  pack: SpecialtyPack,
  key: string | null | undefined
): DischargeTemplate | null {
  if (!key) return null;
  if (key === pack.genericDischargeTemplate.key) return pack.genericDischargeTemplate;
  return pack.dischargeTemplates.find((t) => t.key === key) ?? null;
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
  for (const text of [head, procedure, `${procedure} ${diagnosis}`.trim()]) {
    if (!text) continue;
    const byText = pack.dischargeTemplates.find((t) => t.match.test(text));
    if (byText) return byText;
  }
  if (input.templateFamily) {
    const byFamily = pack.dischargeTemplates.find((t) =>
      t.families?.includes(input.templateFamily!)
    );
    if (byFamily) return byFamily;
  }
  return null;
}

// --- What the discharge workspace offers, per specialty ----------------------------------------
//
// The workspace was written for a general-surgery ward: an operation list, a post-op drug set
// with an NSAID in it, and wound / drain / bowel at discharge. A medicine unit is offered its
// own. Packs not listed in NON_OPERATIVE (surgery and the other operating departments) get
// exactly what the workspace offered before this existed.

/** One row of a one-tap discharge set. Added on request only, as unconfirmed resident rows. */
export type UsualDischargeMedication = {
  generic: string;
  strength: string | null;
  dose: string | null;
  route: string | null;
  frequency: string;
  indication?: string | null;
};

// The ~50 operations a general-surgery ward performs most often, offered under the Procedure
// box the same way the diagnosis box offers COMMON_DIAGNOSES (lib/patients.ts) — a suggestion,
// never a constraint. Naming matches the regexes in lib/discharge-templates.ts and
// lib/discharge-compile.ts (SPECIMEN_RULES) wherever it can, so picking one from here also
// picks up the right discharge template and histopathology default.
export const SURGICAL_PROCEDURE_SUGGESTIONS = [
  "Laparoscopic cholecystectomy",
  "Open cholecystectomy",
  "Laparoscopic appendicectomy",
  "Appendicectomy (open)",
  "Inguinal hernioplasty (mesh repair)",
  "Laparoscopic hernia repair (TEP)",
  "Umbilical hernia repair",
  "Incisional hernia repair",
  "Ventral hernia repair",
  "Femoral hernia repair",
  "Exploratory laparotomy",
  "Graham's patch closure for perforated duodenal ulcer",
  "Small bowel resection and anastomosis",
  "Adhesiolysis for intestinal obstruction",
  "Right hemicolectomy",
  "Left hemicolectomy",
  "Sigmoidectomy",
  "Anterior resection",
  "Abdominoperineal resection (APR)",
  "Hartmann's procedure",
  "Total colectomy",
  "Loop ileostomy formation",
  "Colostomy formation",
  "Stoma closure",
  "Modified radical mastectomy (MRM)",
  "Breast conservation surgery with axillary clearance",
  "Wide local excision with sentinel lymph node biopsy",
  "Excision biopsy of a breast lump",
  "Total thyroidectomy",
  "Hemithyroidectomy",
  "Haemorrhoidectomy",
  "Fistulectomy for fistula in ano",
  "Lateral internal sphincterotomy",
  "Incision and drainage of abscess",
  "Pilonidal sinus excision",
  "Excision of sebaceous cyst",
  "Excision of lipoma",
  "Varicose vein stripping / EVLT",
  "Hydrocelectomy (eversion of sac)",
  "Orchidectomy",
  "Circumcision",
  "Splenectomy",
  "Whipple's procedure (pancreaticoduodenectomy)",
  "Distal pancreatectomy",
  "Subtotal gastrectomy",
  "Total gastrectomy",
  "Gastrojejunostomy",
  "Feeding jejunostomy",
  "CBD exploration with T-tube drainage",
  "Drainage of liver abscess",
];

/** The bedside procedures a medicine ward does. Suggestions only, like the operation list. */
export const MEDICINE_PROCEDURE_SUGGESTIONS = [
  "Diagnostic pleural tap",
  "Therapeutic pleural tap",
  "Diagnostic ascitic tap",
  "Therapeutic paracentesis",
  "Central venous line insertion",
  "Lumbar puncture",
  "Haemodialysis",
  "Blood transfusion",
  "Bone marrow aspiration",
  "Non-invasive ventilation (NIV)",
];

// The resident's usual post-op discharge set — one tap fills in all five instead of five
// separate "Add a medication" rounds. Never auto-inserted; only added on request, same as any
// other drug the resident types in by hand.
export const SURGICAL_DISCHARGE_SET: UsualDischargeMedication[] = [
  { generic: "Pantop", strength: "40 mg", dose: null, route: "Oral", frequency: "OD" },
  { generic: "Paracetamol", strength: "500 mg", dose: null, route: "Oral", frequency: "TDS" },
  { generic: "Ondansetron", strength: "4 mg", dose: null, route: "Oral", frequency: "OD" },
  { generic: "Diclofenac", strength: "50 mg", dose: null, route: "Oral", frequency: "SOS" },
  { generic: "MVI", strength: null, dose: "1 tablet", route: "Oral", frequency: "OD" },
];

// A medicine ward's set carries no NSAID: its patients are the CKD, elderly, cirrhotic and
// anticoagulated ones an SOS diclofenac harms. Paracetamol covers fever and pain.
export const MEDICINE_DISCHARGE_SET: UsualDischargeMedication[] = [
  { generic: "Pantoprazole", strength: "40 mg", dose: "1 tablet", route: "Oral", frequency: "OD" },
  { generic: "Paracetamol", strength: "650 mg", dose: "1 tablet", route: "Oral", frequency: "SOS", indication: "Fever" },
];

/** Condition-at-discharge chips a medicine unit is shown, in the order a medicine round says them. */
export const MEDICINE_CONDITION_KEYS: ConditionVariableKey[] = [
  "afebrile",
  "spo2",
  "oralIntake",
  "sugars",
  "bp",
  "sensorium",
  "ambulation",
];

/** Departments that do not operate. Every other pack keeps the surgical workspace unchanged. */
const NON_OPERATIVE: readonly SpecialtyKey[] = [
  "internal_medicine",
  "medical_oncology",
  "pulmonary_medicine",
  "psychiatry",
  "dermatology",
  "paediatrics",
  "emergency_medicine",
];

export type DischargeProfile = {
  /** The unit's specialty — the diagnosis box offers its commonest diagnoses. */
  specialty: SpecialtyPack["key"];
  /** Surgical unit: the Operation card, the operation list and the Histopathology card. */
  operative: boolean;
  /** The Specialty placeholder on the Encounter card. */
  specialtyLabel: string;
  procedureSuggestions: string[];
  /** [] = no one-tap set is offered. */
  usualMedicationSet: UsualDischargeMedication[];
  /** The Condition-at-Discharge chips shown (any variable that already holds a value is shown too). */
  conditionKeys: ConditionVariableKey[];
  /** How many chips must be set (or free text written) before the summary can be finalised. */
  conditionMinimum: number;
};

/** What the discharge workspace offers this unit. Plain data, so a server page can hand it to a client card. */
export function dischargeProfileFor(pack: SpecialtyPack): DischargeProfile {
  if (!NON_OPERATIVE.includes(pack.key)) {
    return {
      specialty: pack.key,
      operative: true,
      specialtyLabel: pack.label,
      procedureSuggestions: SURGICAL_PROCEDURE_SUGGESTIONS,
      usualMedicationSet: SURGICAL_DISCHARGE_SET,
      conditionKeys: CONDITION_VARIABLES.map((v) => v.key),
      conditionMinimum: 5,
    };
  }
  return {
    specialty: pack.key,
    operative: false,
    specialtyLabel: pack.label,
    procedureSuggestions: MEDICINE_PROCEDURE_SUGGESTIONS,
    // Paediatric doses go by weight; a fixed adult tablet set would be wrong for most children.
    usualMedicationSet: pack.key === "paediatrics" ? [] : MEDICINE_DISCHARGE_SET,
    conditionKeys: MEDICINE_CONDITION_KEYS,
    // Four of seven, not five: sugars and BP only apply to a diabetic or hypertensive patient,
    // and requiring five would push a resident to tick a state the patient never had. Free text
    // still satisfies the check on its own.
    conditionMinimum: 4,
  };
}
