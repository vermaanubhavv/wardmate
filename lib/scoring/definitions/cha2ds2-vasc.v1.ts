/**
 * Atrial fibrillation — stroke risk. Pathway definition v1.0.0. ONE score: CHA₂DS₂-VASc.
 *
 * Congestive heart failure / LV dysfunction (1), Hypertension (1), Age ≥ 75 (2) or 65–74 (1),
 * Diabetes (1), Stroke / TIA / thromboembolism (2), Vascular disease (1), Sex category female
 * (1). Used to decide whether the stroke risk of non-valvular AF is high enough to offset the
 * bleeding risk of oral anticoagulation — always read together with HAS-BLED.
 *
 * STATUS: active — single-clinician pilot sign-off (Dr. Anubhav, 2026-09-07); departmental review still due by reviewDueAt. Added with the internal-medicine
 * specialty pack (docs/specialty-packs.md §8). Sources: Lip GYH et al., Chest 2010;137:263–72;
 * ESC 2020 AF guidelines.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, label: "at assessment" };

const yesNo = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const card: CardDefinition = {
  cardId: "cha2ds2_vasc",
  title: "CHA₂DS₂-VASc — stroke risk in atrial fibrillation",
  shortName: "CHA₂DS₂-VASc",
  citation:
    "CHA₂DS₂-VASc — Lip GYH et al., Chest 2010;137:263–72; ESC 2020 AF guidelines. Non-valvular AF only. Guidelines suggest oral anticoagulation should be considered at ≥ 1 (men) / ≥ 2 (women) and is recommended at ≥ 2 (men) / ≥ 3 (women), after weighing bleeding risk (HAS-BLED) and patient preference. Not a treatment instruction.",
  type: "calculator",
  timingLabel: "at assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 1, text: "CHA₂DS₂-VASc 0–1. Low annual stroke risk. Anticoagulation generally not indicated at 0; at 1 (men) it may be considered. Confirm the score with the patient's history.", tone: "neutral" },
    { min: 2, max: 9, text: "CHA₂DS₂-VASc ≥ 2. Annual stroke risk is high enough that guidelines recommend discussing oral anticoagulation, weighing bleeding risk (HAS-BLED) and patient preference.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "chadsv.chf",
      label: "Congestive heart failure / LV dysfunction",
      inputKey: "chf_history",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Heart failure or LV dysfunction?", recordLabel: "CHF / LV dysfunction", options: yesNo },
    },
    {
      componentId: "chadsv.htn",
      label: "Hypertension (history / on treatment)",
      inputKey: "htn_history",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "History of hypertension?", recordLabel: "Hypertension", options: yesNo },
    },
    {
      componentId: "chadsv.age",
      label: "Age ≥ 75 → 2, 65–74 → 1",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gte", value: 75 }, points: 2, label: "≥ 75 years" },
        { rule: { op: "in_range", range: [65, 74.999] }, points: 1, label: "65–74 years" },
      ],
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "chadsv.dm",
      label: "Diabetes mellitus",
      inputKey: "dm_history",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Diabetes mellitus?", recordLabel: "Diabetes", options: yesNo },
    },
    {
      componentId: "chadsv.stroke",
      label: "Prior stroke / TIA / thromboembolism",
      inputKey: "stroke_history",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Prior stroke, TIA or systemic embolism?", recordLabel: "Prior stroke / TIA / TE", options: yesNo },
    },
    {
      componentId: "chadsv.vascular",
      label: "Vascular disease (prior MI, peripheral arterial disease, aortic plaque)",
      inputKey: "vascular_history",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Vascular disease (MI, PAD, aortic plaque)?", recordLabel: "Vascular disease", options: yesNo },
    },
    {
      componentId: "chadsv.sex",
      label: "Sex category female",
      inputKey: "sex",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 1,
      rule: { op: "eq", value: "female" },
      required: true,
      noAutoTask: true,
    },
  ],
};

export const cha2ds2VascV1: PathwayDefinition = {
  pathwayId: "cha2ds2_vasc",
  pathwayVersion: "1.0.0",
  title: "Atrial fibrillation — stroke risk",
  // Reviewed against the cited source and signed off for pilot use by Dr. Anubhav on
  // 2026-09-07. Triple-gated at runtime; departmental governance review still due (reviewDueAt).
  status: "active",
  clinicalOwner: "Reviewed against the cited sources and signed off for pilot use by Dr. Anubhav — 2026-09-07. Single-clinician sign-off; Internal Medicine departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Lip GYH et al., Chest 2010", citation: "Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation. Chest 2010;137:263–72." },
    { label: "ESC 2020 AF guidelines", citation: "Hindricks G et al. Eur Heart J 2021;42:373–498." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["I48", "I48.0", "I48.1", "I48.2", "I48.91"],
    textPatterns: [
      "atrial fibrillation",
      "atrial flutter",
      " af ",
      "new onset af",
      "new-onset atrial fibrillation",
      "paroxysmal af",
      "rapid af",
      "af with fast ventricular rate",
    ],
    excludePatterns: [
      "valvular atrial fibrillation",
      "rheumatic",
      "mechanical valve",
      "mitral stenosis",
    ],
  },
  eligibility: { minAgeYears: 18, notes: ["Non-valvular atrial fibrillation / flutter only. Valvular AF (moderate–severe mitral stenosis or a mechanical valve) is anticoagulated regardless of score."] },
  exclusions: ["Valvular AF — anticoagulate per valve guidance, not this score."],
  cards: [card],
  tasks: [
    {
      key: "chadsv_bleeding_risk",
      cardId: null,
      componentId: null,
      action: "Assess bleeding risk (HAS-BLED) and document the anticoagulation decision with the patient",
      reason: "A stroke-risk score is only half of the anticoagulation decision — it must be weighed against bleeding risk and patient preference.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
