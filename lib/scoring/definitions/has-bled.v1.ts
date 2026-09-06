/**
 * Atrial fibrillation — bleeding risk on anticoagulation. Pathway definition v1.0.0. ONE
 * score: HAS-BLED.
 *
 * One point each for: uncontrolled Hypertension (SBP > 160), Abnormal renal function, Abnormal
 * liver function, prior Stroke, Bleeding history or predisposition, Labile INR, Elderly
 * (> 65), Drugs (antiplatelets / NSAIDs) and Alcohol excess. ≥ 3 flags a patient at higher
 * bleeding risk who needs closer review and correction of modifiable factors — it does NOT by
 * itself contraindicate anticoagulation.
 *
 * STATUS: draft — clinical governance sign-off pending. Added with the internal-medicine
 * specialty pack (docs/specialty-packs.md §8). Source: Pisters R et al., Chest 2010;138:1093–100.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, label: "at assessment" };

const yesNo = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const clin = (
  componentId: string,
  label: string,
  inputKey: string,
  question: string,
  recordLabel: string
) => ({
  componentId,
  label,
  inputKey,
  canonicalUnit: null,
  window: W,
  selector: "first" as const,
  points: 1,
  rule: { op: "present" as const },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: { question, recordLabel, options: yesNo },
});

const card: CardDefinition = {
  cardId: "has_bled",
  title: "HAS-BLED — bleeding risk on anticoagulation",
  shortName: "HAS-BLED",
  citation:
    "HAS-BLED — Pisters R et al., Chest 2010;138:1093–100. A score ≥ 3 indicates higher bleeding risk: review more often, correct modifiable factors (blood pressure, labile INR, concomitant antiplatelets/NSAIDs, alcohol), and use with caution. It does NOT on its own contraindicate anticoagulation; a high stroke risk (CHA₂DS₂-VASc) usually still favours it.",
  type: "calculator",
  timingLabel: "at assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 2, text: "HAS-BLED 0–2 — lower bleeding risk. Standard review. Confirm the score against the full history.", tone: "neutral" },
    { min: 3, max: 9, text: "HAS-BLED ≥ 3 — higher bleeding risk. Anticoagulate with caution, review more frequently, and correct modifiable factors (BP, labile INR, antiplatelets/NSAIDs, alcohol). Not a contraindication by itself.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "hasbled.htn",
      label: "Uncontrolled hypertension (systolic BP > 160 mmHg)",
      inputKey: "sbp",
      canonicalUnit: "mmHg",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gt", value: 160 },
      required: true,
    },
    clin("hasbled.renal", "Abnormal renal function (dialysis, transplant, creatinine > 2.26 mg/dL)", "renal_impairment", "Abnormal renal function (dialysis, transplant, creatinine > 2.26 mg/dL)?", "Abnormal renal function"),
    clin("hasbled.liver", "Abnormal liver function (cirrhosis, bilirubin > 2× normal with AST/ALT > 3×)", "liver_impairment", "Abnormal liver function (cirrhosis, or bilirubin > 2× with transaminases > 3×)?", "Abnormal liver function"),
    clin("hasbled.stroke", "Prior stroke", "stroke_history", "Prior stroke?", "Prior stroke"),
    clin("hasbled.bleeding", "Prior major bleeding or predisposition to bleeding (including anaemia)", "bleeding_history", "Prior major bleeding, or a predisposition to bleed (incl. anaemia)?", "Bleeding history / predisposition"),
    clin("hasbled.labile_inr", "Labile INR (time in therapeutic range < 60% on a vitamin-K antagonist)", "labile_inr", "Labile INR (TTR < 60% on warfarin)?", "Labile INR"),
    {
      componentId: "hasbled.elderly",
      label: "Elderly (age > 65)",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 1,
      rule: { op: "gt", value: 65 },
      required: true,
      noAutoTask: true,
    },
    clin("hasbled.drugs", "Concomitant antiplatelet drugs or NSAIDs", "antiplatelet_nsaid", "On antiplatelet drugs or regular NSAIDs?", "Antiplatelets / NSAIDs"),
    clin("hasbled.alcohol", "Alcohol excess (≥ 8 units per week)", "alcohol_excess", "Alcohol ≥ 8 units per week?", "Alcohol excess"),
  ],
};

export const hasBledV1: PathwayDefinition = {
  pathwayId: "has_bled",
  pathwayVersion: "1.0.0",
  title: "Atrial fibrillation — bleeding risk",
  // Activated for the internal-medicine pilot on the product owner's direction (2026-09-04).
  // Still triple-gated at runtime; formal governance review still due — see reviewDueAt.
  status: "active",
  clinicalOwner: "Internal Medicine unit (pilot activation 2026-09-04; formal review pending)",
  sourceReferences: [
    { label: "Pisters R et al., Chest 2010", citation: "A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest 2010;138:1093–100." },
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
      "on anticoagulation",
      "started on anticoagulation",
    ],
    excludePatterns: ["valvular atrial fibrillation", "mechanical valve"],
  },
  eligibility: { minAgeYears: 18, notes: ["Bleeding-risk adjunct to a CHA₂DS₂-VASc anticoagulation decision in non-valvular AF."] },
  exclusions: [],
  cards: [card],
  tasks: [
    {
      key: "hasbled_modifiable",
      cardId: "has_bled",
      componentId: null,
      action: "Address modifiable bleeding-risk factors: blood pressure control, review antiplatelets/NSAIDs, alcohol, and INR stability",
      reason: "The value of HAS-BLED is in flagging correctable factors, not in withholding anticoagulation.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [],
  recomputePolicy: ["new_lab", "new_observation", "manual"],
  institutionalToggles: {},
};
