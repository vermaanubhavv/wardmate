/**
 * Acute cholangitis — pathway definition v1.0.0. ONE grading: Tokyo Guidelines 2018 severity
 * (Grade I / II / III). Grade III = any organ dysfunction; Grade II = ANY TWO of five criteria;
 * Grade I = neither.
 *
 * STATUS: draft — clinical governance sign-off pending. Sources: [8].
 * (The 2019 ASGE choledocholithiasis-risk categories are a separate decision aid, out of scope
 * for this one-grading-per-disease card.)
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "since admission (dynamic)" };

const yn = (recordLabel: string, question: string) => ({
  question,
  recordLabel,
  options: [
    { label: "No", record: "absent", satisfied: false, normal: true },
    { label: "Yes", record: "present", satisfied: true },
  ],
});

const tg18Card: CardDefinition = {
  cardId: "tg18_cholangitis",
  title: "Tokyo Guidelines 2018 severity",
  shortName: "Tokyo grade",
  citation:
    "Tokyo Guidelines 2018 — Kiriyama S et al., J Hepatobiliary Pancreat Sci 2018;25:17–30. Grade III = organ dysfunction; Grade II = any 2 of (abnormal WBC, fever ≥ 39 °C, age ≥ 75, bilirubin ≥ 5 mg/dL, low albumin); Grade I = neither. Escalate Grade II/III for early biliary drainage planning.",
  type: "structured_classification",
  timingLabel: "dynamic — re-grade on change",
  calculation: {
    kind: "tiered_classification",
    tiers: ["grade_iii", "grade_ii"],
    fallback: "grade_i",
    tierThresholds: { grade_ii: 2 },
  },
  requiresConfirmation: true,
  recomputeOn: ["new_lab", "new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, class: "grade_i", text: "Grade I (mild) — responds to initial medical management. Biliary drainage electively / if no response.", tone: "neutral" },
    { min: 0, class: "grade_ii", text: "Grade II (moderate) — early biliary drainage. Senior GI / HPB review.", tone: "attention" },
    { min: 0, class: "grade_iii", text: "Grade III (severe) — organ dysfunction. Urgent drainage and organ support per local policy.", tone: "attention" },
  ],
  inputs: [
    // --- Grade III ---
    { componentId: "tg18ch.hypotension", label: "Vasopressor-requiring hypotension", inputKey: "vasopressor", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_iii", noAutoTask: true, clinicianAssessed: true, assess: yn("Vasopressor-requiring hypotension", "Hypotension needing vasopressors?") },
    { componentId: "tg18ch.consciousness", label: "Altered level of consciousness", inputKey: "altered_consciousness", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_iii", noAutoTask: true, clinicianAssessed: true, assess: yn("Altered consciousness", "Altered level of consciousness?") },
    { componentId: "tg18ch.respiratory", label: "PaO₂/FiO₂ < 300", inputKey: "pf_ratio", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 300 }, required: false, tier: "grade_iii" },
    { componentId: "tg18ch.renal", label: "Creatinine > 2 mg/dL", inputKey: "creatinine", canonicalUnit: "mg/dL", window: W, selector: "highest", points: 0, rule: { op: "gt", value: 2 }, required: false, tier: "grade_iii" },
    { componentId: "tg18ch.hepatic", label: "INR > 1.5", inputKey: "inr", canonicalUnit: null, window: W, selector: "highest", points: 0, rule: { op: "gt", value: 1.5 }, required: false, tier: "grade_iii" },
    { componentId: "tg18ch.haematologic", label: "Platelets < 100,000/mm³", inputKey: "platelets", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 100000 }, required: false, tier: "grade_iii" },
    // --- Grade II: any 2 of these ---
    { componentId: "tg18ch.wbc", label: "WBC > 12,000 or < 4,000/mm³", inputKey: "wbc", canonicalUnit: "cells/mm3", window: W, selector: "worst", points: 0, rule: { op: "present" }, bands: [{ rule: { op: "gt", value: 12000 }, points: 1 }, { rule: { op: "lt", value: 4000 }, points: 1 }], required: false, tier: "grade_ii" },
    { componentId: "tg18ch.fever", label: "Fever ≥ 39 °C", inputKey: "temp", canonicalUnit: "C", window: W, selector: "highest", points: 0, rule: { op: "gte", value: 39 }, required: false, tier: "grade_ii" },
    { componentId: "tg18ch.age", label: "Age ≥ 75 years", inputKey: "age_years", canonicalUnit: null, window: { anchor: "admission", startHours: -12, endHours: 24, label: "at admission" }, selector: "admission", points: 0, rule: { op: "gte", value: 75 }, required: false, tier: "grade_ii" },
    { componentId: "tg18ch.bilirubin", label: "Total bilirubin ≥ 5 mg/dL", inputKey: "bilirubin", canonicalUnit: null, window: W, selector: "highest", points: 0, rule: { op: "gte", value: 5 }, required: false, tier: "grade_ii" },
    { componentId: "tg18ch.albumin", label: "Albumin < 2.5 g/dL (≈ 0.7 × lower limit)", inputKey: "albumin", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 2.5 }, required: false, tier: "grade_ii" },
  ],
};

export const cholangitisTg18V1: PathwayDefinition = {
  pathwayId: "acute_cholangitis",
  pathwayVersion: "1.0.0",
  title: "Acute cholangitis",
  status: "draft",
  clinicalOwner: "PENDING_CLINICAL_OWNER (General Surgery + HPB / Gastroenterology)",
  sourceReferences: [
    { label: "TG18 cholangitis diagnosis & severity", citation: "Kiriyama S et al. J Hepatobiliary Pancreat Sci 2018;25:17–30." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["K83.0", "K80.30", "K80.50"],
    textPatterns: ["acute cholangitis", "ascending cholangitis", "cholangitis", "? cholangitis", "obstructive jaundice with sepsis", "cbd stone with cholangitis"],
    excludePatterns: ["primary sclerosing cholangitis", "psc", "cholangiocarcinoma", "recurrent pyogenic cholangitis stable"],
  },
  eligibility: { minAgeYears: 16, notes: ["Grades severity once cholangitis is the working diagnosis. Choledocholithiasis-risk stratification is a separate decision."] },
  exclusions: ["Cholangiocarcinoma.", "Primary sclerosing cholangitis without an acute infective episode."],
  cards: [tg18Card],
  tasks: [
    {
      key: "tg18ch_bloods",
      cardId: "tg18_cholangitis",
      componentId: null,
      action: "Send CBC, CRP, complete LFT with bilirubin/ALP/GGT, KFT, PT/INR, and blood cultures before antibiotics if it will not delay care",
      reason: "WBC, bilirubin, albumin, INR, creatinine and platelets feed the Tokyo Guidelines severity grading.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "bilirubin",
    },
    {
      key: "tg18ch_usg",
      cardId: null,
      componentId: null,
      action: "Arrange ultrasound abdomen; add lactate / ABG if unwell",
      reason: "Confirms biliary obstruction and identifies the drainage target.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "tg18ch_reassess_12h", dueFrom: "admission", dueAtHours: 12, label: "Re-grade Tokyo severity at 12 hours", recomputeCards: ["tg18_cholangitis"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
