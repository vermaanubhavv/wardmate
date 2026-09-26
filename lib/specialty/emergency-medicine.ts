import {
  MEDICINE_DISCHARGE_TEMPLATES,
  MEDICINE_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-medicine";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The emergency medicine pack — casualty, the resuscitation bay, the observation ward.
 *
 * WHAT MAKES AN EMERGENCY DEPARTMENT DIFFERENT FROM EVERY OTHER PACK HERE:
 *
 * 1. THE CLOCK IS HOURS, NOT DAYS, and the app must not pretend otherwise. `dayCount` still
 *    returns the admission day, because that is the only clock every patient has — but the
 *    guidance below insists on the TIME of each observation, because on this ward "an hour ago"
 *    is the difference between two different patients. Hours since arrival are already computed
 *    from `admitted_on` for the checklist triggers.
 *
 * 2. THE PATIENT MAY HAVE NO NAME AND NO HISTORY. An unknown, unaccompanied patient is normal
 *    here. Nothing about the identity may be invented to fill a gap — an unknown age stays
 *    unknown, and "brought dead" and "brought unresponsive" are different statements.
 *
 * 3. THE DIAGNOSIS IS USUALLY NOT MADE. A working impression, a differential, and what was done
 *    while it was being worked out: that is the record. The guidance therefore keeps
 *    "query" and "to rule out" wording exactly as spoken rather than promoting it to a diagnosis.
 *
 * 4. WHAT WAS GIVEN, WHEN, AND WHAT HAPPENED NEXT is the whole note. Every drug carries a time,
 *    every intervention a response: "adrenaline at 10:42, ROSC at 10:46".
 *
 * 5. DISPOSITION IS THE OUTCOME. Admitted under which unit, referred where, discharged against
 *    advice, left without being seen, shifted to ICU, died in the department. It is recorded as
 *    stated, because it is the one thing every emergency episode ends with.
 *
 * SCORING is the four adult pathways an emergency physician actually reaches for, all built,
 * reviewed and `status: "active"`: `heart_score` for undifferentiated chest pain, `qsofa` for the
 * septic patient at the door, `wells_pe` and `wells_dvt`, and `upper_gi_bleeding` for the
 * haematemesis that needs a triage decision now. Nothing else is offered — no triage category
 * and no early-warning score, because both drive an allocation decision this app does not make.
 *
 * DISCHARGE TEMPLATES are the condition-keyed medicine ones. Most emergency episodes do not end
 * in a discharge summary at all, and those that do are usually an observation-ward discharge,
 * which is medicine in shape.
 *
 * NOT YET PILOTED ON A REAL UNIT. `SPECIALTY_PACKS=on` for the picker, patch 0086 before a unit
 * can pick it.
 */
export const emergencyMedicinePack: SpecialtyPack = {
  key: "emergency_medicine",
  label: "Emergency Medicine",
  blurb: "Casualty and the resuscitation bay. Counts from arrival; the time of everything, and the disposition.",

  terminology: {
    dayLabel: "Day",
    admissionNoun: "arrival",
  },

  admissionPhrase: "an emergency department attendance",

  // The admission day: the only clock every patient here has. Hours since arrival drive the
  // triggers, and the guidance below is what keeps the times inside the observations.
  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine:
    "You convert an emergency physician's spoken note into structured observations.",

  extractGuidance: `
Emergency department — what the words mean here:

- THE TIME IS PART OF THE OBSERVATION, wherever it was said: "at 10:42", "on arrival", "ten minutes after the bolus", "since two hours", "last seen normal at 8 pm". Keep it exactly as spoken. Never invent a time and never convert a clock time into an interval or the other way round.
- WHAT WAS GIVEN AND WHAT FOLLOWED ARE RECORDED TOGETHER AS SAID: "adrenaline 1 mg at 10:42", "ROSC at 10:46", "two litres crystalloid, pressure came up to 90 systolic", "naloxone given, became responsive", "intubated at second attempt". Do not infer that an intervention worked; record the response that was stated.
- A WORKING IMPRESSION IS NOT A DIAGNOSIS, and its hedging is preserved: "query intestinal obstruction", "to rule out MI", "likely poisoning, substance unknown", "chest pain for evaluation". NEVER promote a query to a diagnosis, and never resolve a differential.
- THE UNKNOWN PATIENT STAYS UNKNOWN: "unknown male, around 40", "no attendant", "brought by police", "no history available". Record exactly that. Never estimate an age, a name or a history to fill a field.
- TRAUMA IS RECORDED BY MECHANISM, TIME AND WHAT WAS FOUND: "road traffic accident, two hours back, hit by a truck", "fall from 10 feet", "alleged assault", "helmet not worn". Injuries are listed as found, with their side. A side is never inferred.
- THE AIRWAY, BREATHING AND CIRCULATION FINDINGS ARE RECORDED, NOT GRADED: "maintaining airway", "intubated with 7.5 tube", "bag and mask ventilation", "saturation 78 percent room air", "pulse not palpable", "cold peripheries", "CPR ongoing for 20 minutes". Do not label a shock type or a stability the physician did not state.
- POISONING AND OVERDOSE detail is stored as stated: the substance, the amount, the time, the route and whether anyone saw it — "consumed unknown pesticide", "around 30 tablets", "two hours back", "vomited once at home", "smell of kerosene". Never name a compound the resident did not name.
- THE POINT-OF-CARE NUMBERS ARE INVESTIGATIONS with their unit as said: "capillary glucose 48", "lactate 4.2", "pH 7.1", "potassium 6.8 on gas", "ECG shows ST elevation in 2, 3 and aVF", "FAST positive in Morison's pouch". Record as spoken.
- THE DISPOSITION IS ALWAYS RECORDED AS STATED: "admitted under surgery", "shifted to ICU", "referred to higher centre", "discharged against medical advice", "left without being seen", "declared brought dead at 11:05". It is the outcome of the episode and it is never inferred from what came before.
- Abbreviations to leave AS SAID: "ROSC", "CPR", "GCS", "FAST", "AMA", "LAMA", "BD" (brought dead — store the letters said), "RTA", "OP poisoning", "ETT", "NIV".
`.trim(),

  checklistAnchor: "admission",

  dischargeTemplates: MEDICINE_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: MEDICINE_GENERIC_DISCHARGE_TEMPLATE,

  // The four an emergency physician reaches for, all active. No triage category and no
  // early-warning score — see the header.
  scoringKeys: ["heart_score", "qsofa", "wells_pe", "wells_dvt", "upper_gi_bleeding"],

  // No OT notes slot: a department that resuscitates and refers does not run a theatre.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "before_surgery",

  // Empty: no emergency checklist is written. The obvious first ones — a resuscitation
  // checklist, a poisoning checklist, a polytrauma primary survey — are exactly the clinical
  // content that needs a department's own sign-off before it goes near a patient.
  checklistFamilies: [],

  lexiconSpecialty: "emergency-medicine",

  // Shock first: the patient who cannot wait is the one this department exists for.
  historyTreeIds: [
    "shock",
    "poisoning_snakebite",
    "chest_pain",
    "breathlessness",
    "altered_sensorium",
    "head_injury",
    "limb_injury",
    "burns",
    "haematemesis",
    "fever",
  ],
};
