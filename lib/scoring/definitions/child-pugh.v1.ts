/**
 * Chronic liver disease — severity / operative and prognostic risk. Pathway definition v1.0.0.
 * ONE score: Child-Pugh (Child-Turcotte-Pugh).
 *
 * Five items, 1–3 points each, total 5–15. Class A 5–6, B 7–9, C 10–15. Bilirubin, albumin and
 * INR fill from the LFT/coagulation; ascites and encephalopathy are clinician taps. Used for
 * prognosis and to gauge peri-procedural risk — it is not a treatment instruction, and MELD is
 * the preferred score for transplant listing and some acute decisions.
 *
 * STATUS: draft — not yet offered to any unit pending clinician review. Source: Pugh RN et al.,
 * Br J Surg 1973;60:646–9.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, label: "at assessment" };

const childCard: CardDefinition = {
  cardId: "child_pugh",
  title: "Child-Pugh score — chronic liver disease",
  shortName: "Child-Pugh",
  citation:
    "Child-Pugh (Child-Turcotte-Pugh) — Pugh RN et al., Br J Surg 1973;60:646–9. Total 5–15: Class A 5–6 (well-compensated), B 7–9 (significant compromise), C 10–15 (decompensated). Prognostic and peri-procedural risk gauge — MELD is preferred for transplant listing.",
  type: "calculator",
  timingLabel: "at assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 5, max: 6, text: "Child-Pugh A (5–6) — well-compensated. ~1-year survival high; lower peri-procedural risk.", tone: "neutral" },
    { min: 7, max: 9, text: "Child-Pugh B (7–9) — significant functional compromise. Elective procedures need senior / hepatology input.", tone: "attention" },
    { min: 10, max: 15, text: "Child-Pugh C (10–15) — decompensated. High peri-procedural mortality; hepatology review; consider transplant assessment.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "child.bilirubin",
      label: "Total bilirubin — < 2 / 2–3 / > 3 mg/dL",
      inputKey: "bilirubin",
      canonicalUnit: null,
      window: W,
      selector: "highest",
      points: 3,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gt", value: 3 }, points: 3, label: "> 3 mg/dL" },
        { rule: { op: "gte", value: 2 }, points: 2, label: "2–3 mg/dL" },
        { rule: { op: "present" }, points: 1, label: "< 2 mg/dL" },
      ],
      required: true,
    },
    {
      componentId: "child.albumin",
      label: "Serum albumin — > 3.5 / 2.8–3.5 / < 2.8 g/dL",
      inputKey: "albumin",
      canonicalUnit: null,
      window: W,
      selector: "lowest",
      points: 3,
      rule: { op: "present" },
      bands: [
        { rule: { op: "lt", value: 2.8 }, points: 3, label: "< 2.8 g/dL" },
        { rule: { op: "lt", value: 3.5 }, points: 2, label: "2.8–3.5 g/dL" },
        { rule: { op: "present" }, points: 1, label: "> 3.5 g/dL" },
      ],
      required: true,
    },
    {
      componentId: "child.inr",
      label: "INR — < 1.7 / 1.7–2.3 / > 2.3",
      inputKey: "inr",
      canonicalUnit: null,
      window: W,
      selector: "highest",
      points: 3,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gt", value: 2.3 }, points: 3, label: "> 2.3" },
        { rule: { op: "gte", value: 1.7 }, points: 2, label: "1.7–2.3" },
        { rule: { op: "present" }, points: 1, label: "< 1.7" },
      ],
      required: true,
    },
    {
      componentId: "child.ascites",
      label: "Ascites — none / mild (diuretic-controlled) / moderate–severe",
      inputKey: "child_ascites",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 3,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Ascites?",
        recordLabel: "Ascites (Child-Pugh)",
        options: [
          { label: "None", record: "no ascites", satisfied: true, points: 1, normal: true },
          { label: "Mild / diuretic-controlled", record: "mild ascites, diuretic-controlled", satisfied: true, points: 2 },
          { label: "Moderate–severe / refractory", record: "moderate to severe or refractory ascites", satisfied: true, points: 3 },
        ],
      },
    },
    {
      componentId: "child.encephalopathy",
      label: "Hepatic encephalopathy — none / grade 1–2 / grade 3–4",
      inputKey: "child_encephalopathy",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 3,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Hepatic encephalopathy?",
        recordLabel: "Encephalopathy (Child-Pugh)",
        options: [
          { label: "None", record: "no hepatic encephalopathy", satisfied: true, points: 1, normal: true },
          { label: "Grade 1–2 (mild–moderate)", record: "grade 1–2 hepatic encephalopathy", satisfied: true, points: 2 },
          { label: "Grade 3–4 (severe)", record: "grade 3–4 hepatic encephalopathy", satisfied: true, points: 3 },
        ],
      },
    },
  ],
};

export const childPughV1: PathwayDefinition = {
  pathwayId: "child_pugh",
  pathwayVersion: "1.0.0",
  title: "Chronic liver disease — severity",
  status: "draft",
  clinicalOwner: "PENDING — awaiting single-clinician review (Internal Medicine / Gastroenterology / Surgery).",
  sourceReferences: [
    { label: "Pugh RN et al., Br J Surg 1973", citation: "Transection of the oesophagus for bleeding oesophageal varices. Br J Surg 1973;60:646–9." },
  ],
  reviewDueAt: "2027-09-30",
  diagnosisTriggers: {
    codes: ["K74.6", "K70.30", "K70.31", "K76.6", "I85.0"],
    textPatterns: ["cirrhosis", "chronic liver disease", "cld", "decompensated liver disease", "decompensated cirrhosis", "portal hypertension", "hepatic decompensation", "alcoholic liver disease", "child pugh"],
    excludePatterns: ["acute liver failure", "fulminant hepatic failure", "compensated cirrhosis stable outpatient", "post liver transplant"],
  },
  eligibility: { minAgeYears: 16, notes: ["Established chronic liver disease / cirrhosis. Not for acute (fulminant) liver failure — a different assessment."] },
  exclusions: ["Acute / fulminant liver failure.", "Post-liver-transplant."],
  cards: [childCard],
  tasks: [
    {
      key: "child_bloods",
      cardId: "child_pugh",
      componentId: null,
      action: "Send LFT with bilirubin & albumin, coagulation (INR), renal profile, and CBC",
      reason: "Bilirubin, albumin and INR are three of the five Child-Pugh criteria.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "bilirubin",
    },
  ],
  checkpoints: [],
  recomputePolicy: ["new_lab", "new_observation", "manual"],
  institutionalToggles: {},
};
