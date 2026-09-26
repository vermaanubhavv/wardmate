import {
  MEDICINE_DISCHARGE_TEMPLATES,
  MEDICINE_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-medicine";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The psychiatry pack.
 *
 * WHAT MAKES A PSYCHIATRY WARD DIFFERENT, and why each difference is handled the way it is:
 *
 * 1. THE HISTORY IS USUALLY SOMEBODY ELSE'S. The attendant gives it, and what they saw is the
 *    observation — "has not slept for four nights", "talks to himself", "stopped the tablets
 *    two months ago". The guidance below keeps the informant's words as the informant's words
 *    and refuses to convert them into the patient's own account, which is a different fact.
 *
 * 2. THE MENTAL STATE EXAMINATION IS DICTATED AS DESCRIPTIONS, NOT VERDICTS. "Affect blunted",
 *    "thought block present", "insight grade 2" are findings said aloud. The app stores them as
 *    said. It never infers a diagnosis from a run of findings, and it never grades severity.
 *
 * 3. RISK IS THE ONE THING THAT MUST NEVER BE GUESSED. What was said about self-harm, by whom,
 *    and when, is stored verbatim; silence is silence. The app does not score risk, rank it,
 *    or turn it into a disposition — the same rule the `low_mood` history tree keeps, and the
 *    reason its risk questions are red flags rather than a scale. If a future version ever
 *    wants a structured risk instrument, it goes through the scoring engine's review process
 *    like every other score, not into this pack quietly.
 *
 * 4. THERE IS NO OPERATION. The day is the hospital day, like internal medicine. ECT is
 *    recorded as a procedure with its session number as said; it does not start a post-op
 *    clock.
 *
 * 5. THE LEGAL FRAME IS PART OF THE RECORD. Whether an admission is independent or supported,
 *    and who the nominated representative is, is dictated on Indian psychiatric wards under the
 *    Mental Healthcare Act. It is recorded as spoken, as text. The app takes no view on it,
 *    asserts nothing about the patient's capacity, and adds no field that would invite one.
 *
 * WHAT THIS PACK BORROWS. Discharge templates are the medicine ones — a psychiatric discharge
 * summary's shape (problem, course, what was started, follow-up) is closer to a medical one
 * than to an operative one. Its own templates (first episode psychosis, mania, depression with
 * a risk review, alcohol detoxification) are the first thing to add past pilot.
 *
 * SCORING IS CIWA-Ar ONLY, and only because it is already built, reviewed and active for
 * alcohol withdrawal, which this ward manages daily. No depression, mania or risk scale is
 * offered, because none has been built and reviewed here.
 *
 * NOT YET PILOTED ON A REAL UNIT. `SPECIALTY_PACKS=on` for the picker, the scoring engine's own
 * flag plus a per-ward row for CIWA-Ar, and patch 0082 run first. Clinical content is pending
 * clinician review.
 */
export const psychiatryPack: SpecialtyPack = {
  key: "psychiatry",
  label: "Psychiatry",
  blurb: "Counts hospital days. Mental state recorded as dictated, risk recorded never inferred.",

  terminology: {
    dayLabel: "HD",
    admissionNoun: "problem",
  },

  admissionPhrase: "a psychiatry admission",

  // The hospital day, always. ECT and any bedside procedure are procedures, not operations,
  // and do not restart the count.
  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine:
    "You convert a psychiatry resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Psychiatry ward — what the words mean here:

- WHO IS SPEAKING IS PART OF THE FACT. "Mother says he has not slept for four nights", "patient denies hearing voices", "sister reports he stopped tablets two months ago". Keep the informant inside the observation. An attendant's account and the patient's own account are different observations and must never be merged.
- THE MENTAL STATE EXAMINATION IS STORED AS DESCRIBED, IN THE TERMS USED: "kempt", "eye contact poor", "speech pressured", "affect blunted", "thought block present", "delusion of persecution", "third person auditory hallucinations", "oriented to time place person", "insight grade 2". Record each as said. Do NOT assemble them into a diagnosis, and do not rate severity anywhere.
- RISK IS RECORDED, NEVER INFERRED OR SCORED. "Says life is not worth living", "denies any plan", "attempted by consuming tablets two days ago", "no thoughts of harming anyone". Store exactly what was said, with who said it. If nothing was said about risk, record NOTHING — silence is not a denial, and an absent risk statement must never be stored as a negative.
- WHAT WAS CONSUMED OR DONE IN AN ACT IS STORED LITERALLY: the substance named, the amount named, the time named, and how it came to light. Do not estimate an amount, convert units, or infer intent from the method.
- SUBSTANCE USE IS A QUANTITY AND A TIME: "last drink yesterday evening", "about 350 ml daily for ten years", "heroin by injection, last dose this morning", "tremors since morning". Record the substance, the amount as spoken, and the time of the last use — that time is what the withdrawal course is read against.
- MEDICATIONS ARE OFTEN CHANGED ON THE ROUND and are recorded with any dose, route and frequency actually spoken: "olanzapine increased", "started on lorazepam", "depot due next week", "lithium level sent". Never expand a class into a drug, and never supply a dose that was not said.
- ECT IS A PROCEDURE, recorded as said with the session number: "ECT number 4 given today", "modified ECT, seizure duration 32 seconds". It does not make the patient post-operative and does not reset the day count.
- SLEEP, FOOD AND SELF-CARE ARE THE DAILY OBSERVATIONS this ward rounds on: "slept 3 hours", "refused breakfast", "bathed without prompting", "mixing with other patients". Record them as spoken, including the number of hours when one was given.
- THE LEGAL FRAME IS TEXT, RECORDED AS SPOKEN: "independent admission", "supported admission under the Mental Healthcare Act", "nominated representative is the brother", "attendant staying with patient". The app takes no view on capacity or consent and must not summarise these into a judgement.
- Abbreviations to leave AS SAID: "MSE", "ECT", "MHCA", "CIWA", "BPSD", "OCD", "PTSD", "DTs". Store the letters that were said.
`.trim(),

  checklistAnchor: "admission",

  // Medicine's templates, on purpose — see the header.
  dischargeTemplates: MEDICINE_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: MEDICINE_GENERIC_DISCHARGE_TEMPLATE,

  // Alcohol withdrawal only, and only because CIWA-Ar is already built, reviewed and active.
  // No mood, psychosis or risk scale is offered: none has been built here.
  scoringKeys: ["ciwa_ar"],

  // No OT notes slot: this department has no operating theatre.
  formatKinds: ["investigation", "interdepartmental", "discharge", "notes", "logo"] as FormatKind[],

  pickerPhase: "before_surgery",

  // Empty: no psychiatry checklist exists, and none of medicine's is a psychiatric admission.
  checklistFamilies: [],

  lexiconSpecialty: "psychiatry",

  // The two psychiatry trees first, then the presentations that arrive through casualty and
  // through liaison referrals.
  historyTreeIds: [
    "low_mood",
    "altered_behaviour",
    "poisoning_snakebite",
    "altered_sensorium",
    "generalised_weakness",
    "giddiness",
    "headache",
    "loss_of_weight_appetite",
  ],
};
