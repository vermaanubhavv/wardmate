import { STANDARD_RED_FLAGS } from "@/lib/discharge-templates-medicine";
import type { DischargeTemplate } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The General pack — WardMate with no department.
 *
 * This is the base every unit stands on. A unit whose department is not set, or not recognised,
 * gets this rather than general surgery: no operation clock, no operation-keyed checklists, no
 * surgical chips or exam lines, and prompts that name no department. Every department —
 * general surgery included — is a pack layered on the same app; this is what is left with none.
 *
 * Kept deliberately thin. A choice made here is the neutral one, not a department's guess: no
 * checklists (`[]`), no department history order, the scores any ward meets, and the standard
 * systemic examination.
 */

const GENERAL_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "general_generic",
  label: "General — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient was admitted with [ presenting problem ] for [ investigation / management / procedure ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure during this admission, if any ]",
      anaesthesia: "",
      findings: "[ relevant findings and results ]",
      drains: "[ lines / tubes / catheters at discharge, if any ]",
      complications: "Nil",
      outcome: "[ Outcome of this admission ]",
    },
    clinicalCourse:
      "Admitted on [ … ] with [ presentation ]. [ Working diagnosis and how it was reached. ] [ Treatment given during the admission. ] The patient improved, was stable, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: [
      { id: "adv-0", module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor. Bring the full list to every visit." },
      { id: "adv-1", module: "Follow-up", text: "Attend the OPD on [ … ] with all reports. Get the tests below done before that visit." },
    ],
    redFlags: STANDARD_RED_FLAGS,
    patientActions: [
      "Attend the OPD on [ … ].",
      "Bring this summary and all reports to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course; associated symptoms and pertinent negatives; past medical and surgical history and all current drugs; examination on arrival; provisional diagnosis and the workup planned.",
  progressNote:
    "Each day — symptoms; vitals; examination; oral intake; results back; the day's plan. For discharge — stable, tolerating orals, medicines prescribed, and follow-up written down.",
};

export const generalPack: SpecialtyPack = {
  key: "general",
  label: "General",
  blurb: "No department. Counts hospital days. The standard history, examination and discharge summary.",

  terminology: {
    dayLabel: "Day",
    admissionNoun: "admission",
  },

  admissionPhrase: "a hospital admission",

  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine: "You convert a doctor's spoken ward-round note into structured observations.",
  extractGuidance: "",

  checklistAnchor: "admission",
  operative: false,

  dischargeTemplates: [],
  genericDischargeTemplate: GENERAL_DISCHARGE_TEMPLATE,

  // The scores any inpatient ward meets, whatever its department.
  scoringKeys: ["qsofa", "kdigo_aki", "wells_dvt", "wells_pe", "ciwa_ar", "child_pugh"],

  formatKinds: ["investigation", "interdepartmental", "discharge", "notes", "logo"] as FormatKind[],

  pickerPhase: "before_surgery",
  // No department, so no department's checklists — never another pack's work to fill the space.
  checklistFamilies: [],

  lexiconSpecialty: "general",

  // No department order: the History check picker shows every tree.
  historyTreeIds: [],
  examIds: ["general_physical", "cardiovascular", "respiratory", "abdomen", "neurological"],
};
