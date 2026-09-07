/**
 * Alcohol withdrawal — pathway definition v1.0.0. ONE score: CIWA-Ar.
 *
 * Ten clinician-observed items. Nine are scored 0–7, the last (orientation / clouding of
 * sensorium) 0–4; total 0–67. This card offers a 4-level scale per item (mapped to the CIWA-Ar
 * anchor points) so it can be completed quickly at the bedside. < 8 minimal withdrawal
 * (usually no medication); 8–15 mild–moderate (symptom-triggered benzodiazepine per local
 * protocol); ≥ 15–16 marks a higher risk of seizures and delirium tremens — closer monitoring.
 *
 * It guides monitoring frequency and symptom-triggered dosing; it does not itself prescribe.
 * Not valid in a patient who cannot communicate, is delirious from another cause, or has a
 * primary medical illness driving the observations.
 *
 * STATUS: draft — not yet offered to any unit pending clinician review. Source: Sullivan JT
 * et al., Br J Addict 1989;84:1353–7.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "since presentation (dynamic)" };

/** A CIWA-Ar item scored 0–7, offered as four anchor levels. */
const item7 = (
  componentId: string,
  shortLabel: string,
  question: string,
  levels: [string, string, string, string]
) => ({
  componentId,
  label: shortLabel,
  inputKey: componentId.replace("ciwa.", "ciwa_"),
  canonicalUnit: null,
  window: W,
  selector: "worst" as const,
  points: 7,
  rule: { op: "present" as const },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: {
    question,
    recordLabel: shortLabel,
    options: [
      { label: levels[0], record: `${shortLabel}: ${levels[0].toLowerCase()}`, satisfied: false, normal: true },
      { label: levels[1], record: `${shortLabel}: ${levels[1].toLowerCase()}`, satisfied: true, points: 2 },
      { label: levels[2], record: `${shortLabel}: ${levels[2].toLowerCase()}`, satisfied: true, points: 4 },
      { label: levels[3], record: `${shortLabel}: ${levels[3].toLowerCase()}`, satisfied: true, points: 7 },
    ],
  },
});

const ciwaCard: CardDefinition = {
  cardId: "ciwa_ar",
  title: "CIWA-Ar — alcohol withdrawal",
  shortName: "CIWA-Ar",
  citation:
    "CIWA-Ar — Sullivan JT et al., Br J Addict 1989;84:1353–7. Total 0–67. < 8 minimal; 8–15 mild–moderate (symptom-triggered benzodiazepine per local protocol); ≥ 15–16 higher risk of withdrawal seizures and delirium tremens. Guides monitoring and dosing frequency — it does not prescribe. Invalid if the patient cannot communicate or another illness is driving the signs.",
  type: "calculator",
  timingLabel: "re-score at each observation set",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, max: 7, text: "CIWA-Ar < 8 — minimal withdrawal. Medication not usually required; continue scheduled monitoring and thiamine.", tone: "neutral" },
    { min: 8, max: 14, text: "CIWA-Ar 8–14 — mild to moderate withdrawal. Symptom-triggered benzodiazepine per local protocol; re-score after each dose.", tone: "attention" },
    { min: 15, max: 67, text: "CIWA-Ar ≥ 15 — moderate to severe withdrawal, higher risk of seizures / delirium tremens. Increase monitoring frequency; senior review; consider a higher level of care.", tone: "attention" },
  ],
  inputs: [
    item7("ciwa.nausea", "Nausea / vomiting", "Nausea and vomiting?", ["None", "Mild nausea, no vomiting", "Intermittent nausea with dry heaves", "Constant nausea, frequent dry heaves / vomiting"]),
    item7("ciwa.tremor", "Tremor", "Tremor (arms extended, fingers spread)?", ["None", "Not visible but felt fingertip to fingertip", "Moderate with arms extended", "Severe, even with arms not extended"]),
    item7("ciwa.sweats", "Paroxysmal sweats", "Sweating?", ["None", "Barely perceptible, palms moist", "Beads of sweat obvious on forehead", "Drenching sweats"]),
    item7("ciwa.anxiety", "Anxiety", "Anxiety?", ["None, at ease", "Mildly anxious", "Moderately anxious or guarded", "Acute panic state"]),
    item7("ciwa.agitation", "Agitation", "Agitation?", ["Normal activity", "Somewhat more than normal", "Moderately fidgety and restless", "Paces or thrashes about constantly"]),
    item7("ciwa.tactile", "Tactile disturbance", "Tactile disturbance (itching, pins and needles, numbness, bugs on skin)?", ["None", "Very mild", "Mild to moderate", "Moderate to severe / continuous hallucinations"]),
    item7("ciwa.auditory", "Auditory disturbance", "Auditory disturbance (harsh sounds, hearing things)?", ["Not present", "Very mild harshness / ability to frighten", "Mild to moderate", "Moderate to severe / continuous hallucinations"]),
    item7("ciwa.visual", "Visual disturbance", "Visual disturbance (light sensitivity, seeing things)?", ["Not present", "Very mild sensitivity", "Mild to moderate", "Moderate to severe / continuous hallucinations"]),
    item7("ciwa.headache", "Headache / fullness in head", "Headache or fullness in the head?", ["Not present", "Very mild", "Moderate", "Severe / extremely severe"]),
    {
      componentId: "ciwa.orientation",
      label: "Orientation and clouding of sensorium (0–4)",
      inputKey: "ciwa_orientation",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 4,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Orientation and clouding of sensorium?",
        recordLabel: "Orientation / sensorium",
        options: [
          { label: "Oriented, can do serial additions", record: "oriented, serial additions intact", satisfied: false, normal: true },
          { label: "Cannot do serial additions / unsure of date", record: "cannot do serial additions or unsure of the date", satisfied: true, points: 1 },
          { label: "Disoriented to date by ≤ 2 days", record: "disoriented to date by no more than 2 calendar days", satisfied: true, points: 2 },
          { label: "Disoriented to place / person", record: "disoriented to place and/or person", satisfied: true, points: 4 },
        ],
      },
    },
  ],
};

export const ciwaArV1: PathwayDefinition = {
  pathwayId: "ciwa_ar",
  pathwayVersion: "1.0.0",
  title: "Alcohol withdrawal",
  status: "draft",
  clinicalOwner: "PENDING — awaiting single-clinician review (Internal Medicine).",
  sourceReferences: [
    { label: "Sullivan JT et al., Br J Addict 1989", citation: "Assessment of alcohol withdrawal: the revised CIWA-Ar scale. Br J Addict 1989;84:1353–7." },
  ],
  reviewDueAt: "2027-09-30",
  diagnosisTriggers: {
    codes: ["F10.23", "F10.239", "F10.231", "F10.232"],
    textPatterns: ["alcohol withdrawal", "delirium tremens", "dts", "alcohol dependence for detox", "withdrawal seizure", "impending dts", "chronic alcoholic with withdrawal"],
    excludePatterns: ["alcohol withdrawal resolved", "no features of withdrawal", "stable on chlordiazepoxide taper day"],
  },
  eligibility: { minAgeYears: 18, notes: ["A patient at risk of, or in, alcohol withdrawal who can communicate. Not valid in delirium from another cause or when a medical illness is driving the observations."] },
  exclusions: ["Cannot communicate / intubated — use a symptom-triggered protocol not requiring subjective items.", "Withdrawal complete."],
  cards: [ciwaCard],
  tasks: [
    {
      key: "ciwa_thiamine_glucose",
      cardId: null,
      componentId: null,
      action: "Confirm parenteral thiamine cover is in place before any glucose (Wernicke prophylaxis); check glucose, electrolytes including magnesium, and renal & liver profile",
      reason: "Wernicke prophylaxis and correction of the deficiencies that accompany alcohol withdrawal — standard care alongside CIWA-Ar monitoring.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
    {
      key: "ciwa_monitoring",
      cardId: "ciwa_ar",
      componentId: null,
      action: "Start CIWA-Ar monitoring at the interval your protocol sets (commonly 1–4 hourly), and re-score after every symptom-triggered dose",
      reason: "The score only works as a trend; a single value does not guide symptom-triggered dosing.",
      priority: "soon",
      responsibleRole: "nursing",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "ciwa_review_4h", dueFrom: "admission", dueAtHours: 4, label: "Review CIWA-Ar trend and monitoring interval", recomputeCards: ["ciwa_ar"] },
  ],
  recomputePolicy: ["new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
