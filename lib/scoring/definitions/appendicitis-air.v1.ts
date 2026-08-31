/**
 * Acute appendicitis — pathway definition v1.0.0. ONE score: the Appendicitis Inflammatory
 * Response (AIR) score. WSES identifies AIR (and the Adult Appendicitis Score) as the best
 * adult clinical prediction tools, and advises against Alvarado for positive confirmation.
 *
 * STATUS: draft — clinical governance sign-off pending. Sources: [5].
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, endHours: 48, label: "at presentation" };

const yesNoOptions = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const airCard: CardDefinition = {
  cardId: "air",
  title: "Appendicitis Inflammatory Response score",
  shortName: "AIR",
  citation:
    "AIR score — Andersson & Andersson; WSES Jerusalem guidelines 2020 (World J Emerg Surg 2020;15:27). 0–4 low probability, 5–8 intermediate (imaging / observation), 9–12 high. Use with age, sex, pregnancy status and examination — not as a stand-alone diagnosis.",
  type: "calculator",
  timingLabel: "at presentation",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 4, text: "AIR 0–4 — low probability. Consider discharge / outpatient review if clinically appropriate.", tone: "neutral" },
    { min: 5, max: 8, text: "AIR 5–8 — intermediate probability. Imaging or active observation.", tone: "attention" },
    { min: 9, max: 12, text: "AIR 9–12 — high probability. Surgical review; imaging as per pathway.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "air.vomiting",
      label: "Vomiting",
      inputKey: "vomiting",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Vomiting?", recordLabel: "Vomiting", options: yesNoOptions },
    },
    {
      componentId: "air.rif_pain",
      label: "Right iliac fossa pain",
      inputKey: "rif_pain",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Right iliac fossa pain?", recordLabel: "RIF pain", options: yesNoOptions },
    },
    {
      componentId: "air.guarding",
      label: "Guarding / rebound tenderness",
      inputKey: "guarding",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 3,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Guarding / rebound?",
        recordLabel: "Guarding / rebound",
        options: [
          { label: "None", record: "none", satisfied: false, normal: true },
          { label: "Light", record: "light guarding", satisfied: true, points: 1 },
          { label: "Moderate", record: "moderate guarding", satisfied: true, points: 2 },
          { label: "Strong", record: "strong guarding / rebound", satisfied: true, points: 3 },
        ],
      },
    },
    {
      componentId: "air.temp",
      label: "Temperature > 38.5 °C",
      inputKey: "temp",
      canonicalUnit: "C",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gt", value: 38.5 },
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "air.neutrophils",
      label: "Neutrophils (70–84 % → 1, ≥ 85 % → 2)",
      inputKey: "neutrophil_percent",
      canonicalUnit: "%",
      window: W,
      selector: "highest",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gte", value: 85 }, points: 2, label: "≥ 85 %" },
        { rule: { op: "in_range", range: [70, 84.999] }, points: 1, label: "70–84 %" },
      ],
      required: true,
    },
    {
      componentId: "air.wbc",
      label: "WBC (10.0–14.9 → 1, ≥ 15 ×10⁹/L → 2)",
      inputKey: "wbc",
      canonicalUnit: "cells/mm3",
      window: W,
      selector: "highest",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gte", value: 15000 }, points: 2, label: "≥ 15,000" },
        { rule: { op: "in_range", range: [10000, 14999] }, points: 1, label: "10,000–14,900" },
      ],
      required: true,
    },
    {
      componentId: "air.crp",
      label: "CRP (10–49 → 1, ≥ 50 mg/L → 2)",
      inputKey: "crp",
      canonicalUnit: null,
      window: W,
      selector: "highest",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gte", value: 50 }, points: 2, label: "≥ 50 mg/L" },
        { rule: { op: "in_range", range: [10, 49.999] }, points: 1, label: "10–49 mg/L" },
      ],
      required: true,
    },
  ],
};

export const appendicitisAirV1: PathwayDefinition = {
  pathwayId: "acute_appendicitis",
  pathwayVersion: "1.0.0",
  title: "Acute appendicitis",
  status: "draft",
  clinicalOwner: "PENDING_CLINICAL_OWNER (General Surgery + Emergency)",
  sourceReferences: [
    { label: "WSES Jerusalem guidelines 2020", citation: "Di Saverio S et al. World J Emerg Surg 2020;15:27." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["K35", "K35.80", "K35.9"],
    textPatterns: ["acute appendicitis", "appendicitis", "? appendicitis", "acute appendix", "rif pain for evaluation"],
    excludePatterns: ["appendicular lump", "appendicular mass", "interval appendicectomy", "post appendicectomy", "h/o appendicectomy"],
  },
  eligibility: { minAgeYears: 16, notes: ["Adult clinical prediction card — not for isolated paediatric use."] },
  exclusions: ["Appendicular mass / lump (different pathway).", "Pregnancy — interpret with obstetric input."],
  cards: [airCard],
  tasks: [
    {
      key: "air_bloods",
      cardId: "air",
      componentId: null,
      action: "Send CBC with differential and CRP",
      reason: "Neutrophil %, white-cell count and CRP are three of the seven AIR criteria.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "crp",
    },
    {
      key: "air_urine_preg",
      cardId: null,
      componentId: null,
      action: "Send urine analysis; pregnancy test if applicable",
      reason: "Rule out urinary and gynaecological mimics before committing to an appendicitis pathway.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "air_review_12h", dueFrom: "admission", dueAtHours: 12, label: "Re-score AIR / review at 12 hours", recomputeCards: ["air"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
