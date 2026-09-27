/**
 * Stevens-Johnson syndrome / toxic epidermal necrolysis — SCORTEN. Pathway definition v1.0.0.
 *
 * SCORTEN (Bastuji-Garin S et al., J Invest Dermatol 2000;115:149–53): one point each for
 * age ≥ 40, malignancy, heart rate ≥ 120/min, body surface area detached > 10 % at day 1,
 * serum urea > 10 mmol/L, bicarbonate < 20 mmol/L, glucose > 14 mmol/L. Validated within the
 * first 24 hours of admission; the published predicted mortality is shown per band.
 *
 * What it is NOT: a triage, transfer or treatment decision. It is a prognostic prompt.
 *
 * STATUS: active — signed off for pilot use by Dr Anubhav Verma, 2026-09-28 (single-clinician sign-off;
 * departmental review due 2027-09-01).
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: 0, endHours: 24, label: "first 24 hours of admission" };

const yesNo = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const scortenCard: CardDefinition = {
  cardId: "scorten",
  title: "SCORTEN — SJS / TEN severity",
  shortName: "SCORTEN",
  citation:
    "SCORTEN — Bastuji-Garin S et al., J Invest Dermatol 2000;115:149–53. Seven criteria, one point each, scored within 24 h of admission. Predicted mortality 0–1: 3.2 %, 2: 12.1 %, 3: 35.3 %, 4: 58.3 %, ≥ 5: 90 %. A prognostic prompt, not a treatment decision.",
  type: "calculator",
  timingLabel: "first 24 hours of admission",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 1, text: "SCORTEN 0–1 — published predicted mortality 3.2 %.", tone: "neutral" },
    { min: 2, max: 2, text: "SCORTEN 2 — published predicted mortality 12.1 %.", tone: "attention" },
    { min: 3, max: 3, text: "SCORTEN 3 — published predicted mortality 35.3 %.", tone: "attention" },
    { min: 4, max: 4, text: "SCORTEN 4 — published predicted mortality 58.3 %.", tone: "attention" },
    { min: 5, max: 7, text: "SCORTEN ≥ 5 — published predicted mortality 90 %.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "scorten.age",
      label: "Age ≥ 40 years",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 1,
      rule: { op: "gte", value: 40 },
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "scorten.malignancy",
      label: "Malignancy",
      inputKey: "scorten_malignancy",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Associated malignancy?", recordLabel: "Malignancy (SCORTEN)", options: yesNo },
    },
    {
      componentId: "scorten.hr",
      label: "Heart rate ≥ 120 /min",
      inputKey: "hr",
      canonicalUnit: "/min",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gte", value: 120 },
      required: true,
    },
    {
      componentId: "scorten.bsa",
      label: "Body surface area detached > 10 % at day 1",
      inputKey: "scorten_bsa_detached",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Epidermal detachment on day 1?",
        recordLabel: "BSA detached (SCORTEN)",
        options: [
          { label: "≤ 10 % BSA", record: "detachment 10% BSA or less", satisfied: false, normal: true },
          { label: "> 10 % BSA", record: "detachment more than 10% BSA", satisfied: true },
        ],
      },
    },
    {
      componentId: "scorten.urea",
      label: "Serum urea > 10 mmol/L (> 60 mg/dL)",
      inputKey: "urea",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 1,
      // 10 mmol/L × 6.006 (the adapter's urea factor) — exact, so 10 mmol/L itself scores 0.
      rule: { op: "gt", value: 60.06 },
      required: true,
    },
    {
      componentId: "scorten.bicarbonate",
      label: "Serum bicarbonate < 20 mmol/L",
      inputKey: "bicarbonate",
      canonicalUnit: null,
      window: W,
      selector: "lowest",
      points: 1,
      rule: { op: "lt", value: 20 },
      required: true,
    },
    {
      componentId: "scorten.glucose",
      label: "Serum glucose > 14 mmol/L (> 252 mg/dL)",
      inputKey: "glucose",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 1,
      // 14 mmol/L × 18.016 (the adapter's glucose factor) — exact, so 14 mmol/L itself scores 0.
      rule: { op: "gt", value: 252.224 },
      required: true,
    },
  ],
};

export const scortenV1: PathwayDefinition = {
  pathwayId: "scorten",
  pathwayVersion: "1.0.0",
  title: "SJS / TEN — SCORTEN",
  status: "active",
  clinicalOwner: "Reviewed against the cited source and signed off for pilot use by Dr Anubhav Verma — 2026-09-28. Single-clinician sign-off; departmental review due 2027-09-01.",
  sourceReferences: [
    {
      label: "Bastuji-Garin S et al., J Invest Dermatol 2000",
      citation: "SCORTEN: a severity-of-illness score for toxic epidermal necrolysis. J Invest Dermatol 2000;115:149–53.",
    },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    // Matching is a normalised substring test (triggers.ts), so a bare "ten" would fire on
    // "hypertension" / "tender" — TEN alone is only caught via "sjs/ten" or the full name.
    textPatterns: ["sjs", "stevens johnson", "toxic epidermal necrolysis", "sjs/ten", "sjs-ten"],
    excludePatterns: ["sjs ruled out", "ten ruled out", "not sjs"],
  },
  eligibility: { notes: ["Stevens-Johnson syndrome / toxic epidermal necrolysis. Validated within 24 h of admission."] },
  exclusions: [],
  cards: [scortenCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_lab", "new_observation", "manual"],
  institutionalToggles: {},
};
