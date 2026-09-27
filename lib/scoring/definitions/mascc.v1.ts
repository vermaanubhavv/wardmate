/**
 * Febrile neutropenia — MASCC risk index. Pathway definition v1.0.0. ONE score.
 *
 * Multinational Association for Supportive Care in Cancer risk index (Klastersky J et al.,
 * J Clin Oncol 2000;18:3038–51). Seven items, maximum 26: burden of illness (no/mild 5,
 * moderate 3, severe 0), no hypotension (SBP > 90) 5, no COPD 4, solid tumour or haematological
 * malignancy with no previous fungal infection 4, no dehydration requiring IV fluids 3,
 * outpatient at onset of fever 3, age < 60 years 2. A total ≥ 21 identifies a LOW-risk group.
 *
 * What it is NOT: a decision about outpatient or oral management, or about antibiotics. It is a
 * prompt that sits beside the clinician's assessment. Unknown items score 0 in a provisional
 * total, which can only err towards "higher risk".
 *
 * STATUS: active — signed off for pilot use by Dr Anubhav Verma, 2026-09-28 (single-clinician sign-off;
 * departmental review due 2027-09-01).
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, endHours: 24, label: "at presentation with fever" };

const masccCard: CardDefinition = {
  cardId: "mascc",
  title: "MASCC risk index — febrile neutropenia",
  shortName: "MASCC",
  citation:
    "MASCC risk index — Klastersky J et al., J Clin Oncol 2000;18:3038–51. Maximum 26; ≥ 21 identifies patients at low risk of serious complications. A prompt beside clinical judgement, never a decision about outpatient care or treatment.",
  type: "calculator",
  timingLabel: "at presentation with fever",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 20, text: "MASCC 0–20 — higher risk of serious complications on this index. Has a senior reviewed the febrile-neutropenia plan?", tone: "attention" },
    { min: 21, max: 26, text: "MASCC 21–26 — low risk on MASCC — still a prompt, not a decision about outpatient care.", tone: "neutral" },
  ],
  inputs: [
    {
      componentId: "mascc.burden",
      label: "Burden of illness — no or mild symptoms 5 / moderate 3 / severe 0",
      inputKey: "mascc_burden",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 5,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Burden of illness from the febrile neutropenic episode?",
        recordLabel: "Burden of illness (MASCC)",
        options: [
          { label: "No or mild symptoms", record: "no or mild symptoms", satisfied: true, points: 5, normal: true },
          { label: "Moderate symptoms", record: "moderate symptoms", satisfied: true, points: 3 },
          { label: "Severe symptoms / moribund", record: "severe symptoms", satisfied: false },
        ],
      },
    },
    {
      componentId: "mascc.no_hypotension",
      label: "No hypotension (systolic BP > 90 mmHg)",
      inputKey: "sbp",
      canonicalUnit: "mmHg",
      window: W,
      selector: "lowest",
      points: 5,
      rule: { op: "gt", value: 90 },
      required: true,
    },
    {
      componentId: "mascc.no_copd",
      label: "No chronic obstructive pulmonary disease",
      inputKey: "mascc_copd",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 4,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Chronic obstructive pulmonary disease?",
        recordLabel: "COPD (MASCC)",
        options: [
          { label: "No COPD", record: "no COPD", satisfied: true, points: 4, normal: true },
          { label: "COPD", record: "COPD present", satisfied: false },
        ],
      },
    },
    {
      componentId: "mascc.tumour_fungal",
      label: "Solid tumour, or haematological malignancy with no previous fungal infection",
      inputKey: "mascc_tumour_fungal",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 4,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Tumour type and previous fungal infection?",
        recordLabel: "Tumour type / previous fungal infection (MASCC)",
        options: [
          { label: "Solid tumour, or haematological with no previous fungal infection", record: "solid tumour or haematological malignancy without previous fungal infection", satisfied: true, points: 4, normal: true },
          { label: "Haematological with previous fungal infection", record: "haematological malignancy with previous fungal infection", satisfied: false },
        ],
      },
    },
    {
      componentId: "mascc.no_dehydration",
      label: "No dehydration requiring IV fluids",
      inputKey: "mascc_dehydration",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 3,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Dehydration requiring IV fluids?",
        recordLabel: "Dehydration requiring IV fluids (MASCC)",
        options: [
          { label: "No", record: "no dehydration requiring IV fluids", satisfied: true, points: 3, normal: true },
          { label: "Yes", record: "dehydration requiring IV fluids", satisfied: false },
        ],
      },
    },
    {
      componentId: "mascc.outpatient",
      label: "Outpatient at onset of fever",
      inputKey: "mascc_outpatient",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 3,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Where was the patient when the fever began?",
        recordLabel: "Status at onset of fever (MASCC)",
        options: [
          { label: "Outpatient", record: "outpatient at onset of fever", satisfied: true, points: 3, normal: true },
          { label: "Inpatient", record: "inpatient at onset of fever", satisfied: false },
        ],
      },
    },
    {
      componentId: "mascc.age",
      label: "Age < 60 years",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 2,
      rule: { op: "lt", value: 60 },
      required: true,
      noAutoTask: true,
    },
  ],
};

export const masccV1: PathwayDefinition = {
  pathwayId: "mascc",
  pathwayVersion: "1.0.0",
  title: "Febrile neutropenia — MASCC risk index",
  status: "active",
  clinicalOwner: "Reviewed against the cited source and signed off for pilot use by Dr Anubhav Verma — 2026-09-28. Single-clinician sign-off; departmental review due 2027-09-01.",
  sourceReferences: [
    {
      label: "Klastersky J et al., J Clin Oncol 2000",
      citation: "The Multinational Association for Supportive Care in Cancer risk index: a multinational scoring system for identifying low-risk febrile neutropenic cancer patients. J Clin Oncol 2000;18:3038–51.",
    },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    textPatterns: ["febrile neutropenia", "neutropenic fever", "neutropenic sepsis", "fever on chemotherapy", "fever post chemotherapy", "post-chemotherapy fever"],
    excludePatterns: ["no neutropenia", "neutropenia ruled out"],
  },
  eligibility: { minAgeYears: 16, notes: ["Adults with cancer and febrile neutropenia. A risk prompt, not a management decision."] },
  exclusions: [],
  cards: [masccCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
