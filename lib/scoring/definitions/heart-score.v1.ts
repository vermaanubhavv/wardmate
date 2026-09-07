/**
 * Chest pain — risk of a major adverse cardiac event. Pathway definition v1.0.0. ONE score:
 * the HEART score.
 *
 * History, ECG, Age, Risk factors, Troponin — 0/1/2 each, total 0–10. 0–3 low risk (≈ 1–2 %
 * 6-week MACE — outpatient / early discharge may be reasonable), 4–6 moderate (admit / observe,
 * serial troponin), 7–10 high (early invasive strategy). It supports disposition; it does not
 * diagnose ACS or replace serial troponin and clinical judgement.
 *
 * STATUS: active — single-clinician pilot sign-off (Dr. Anubhav, 2026-09-07); departmental review due 2027-09-30. Runtime is triple-gated (env flag + per-ward row + the specialty pack scoringKeys).
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at assessment" };

const heartCard: CardDefinition = {
  cardId: "heart",
  title: "HEART score — chest pain",
  shortName: "HEART",
  citation:
    "HEART score — Six AJ et al., Neth Heart J 2008;16:191–6; validated Backus BE et al., Int J Cardiol 2013. 0–3 ≈ 1–2 % 6-week MACE (consider early discharge / outpatient); 4–6 moderate (admit, serial troponin); 7–10 high (early invasive strategy). Supports disposition — does not diagnose ACS or replace serial troponin.",
  type: "calculator",
  timingLabel: "at assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 3, text: "HEART 0–3 — low risk (≈ 1–2 % 6-week MACE). Early discharge / outpatient follow-up may be reasonable after a negative troponin, per clinical judgement and local policy.", tone: "neutral" },
    { min: 4, max: 6, text: "HEART 4–6 — moderate risk. Admit / observe with serial troponin; cardiology review.", tone: "attention" },
    { min: 7, max: 10, text: "HEART 7–10 — high risk. Cardiology review for an early invasive strategy.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "heart.history",
      label: "History — slightly / moderately / highly suspicious",
      inputKey: "heart_history",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "How suspicious is the history for cardiac chest pain?",
        recordLabel: "Chest pain history",
        options: [
          { label: "Slightly suspicious", record: "history slightly suspicious", satisfied: false, normal: true },
          { label: "Moderately suspicious", record: "history moderately suspicious", satisfied: true, points: 1 },
          { label: "Highly suspicious", record: "history highly suspicious", satisfied: true, points: 2 },
        ],
      },
    },
    {
      componentId: "heart.ecg",
      label: "ECG — normal / non-specific repolarisation / significant ST deviation",
      inputKey: "heart_ecg",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "ECG?",
        recordLabel: "ECG (HEART)",
        options: [
          { label: "Normal", record: "ECG normal", satisfied: false, normal: true },
          { label: "Non-specific repolarisation", record: "ECG non-specific repolarisation changes / LBBB / LVH / digoxin", satisfied: true, points: 1 },
          { label: "Significant ST deviation", record: "ECG significant ST-segment deviation not due to LBBB/LVH/digoxin", satisfied: true, points: 2 },
        ],
      },
    },
    {
      componentId: "heart.age",
      label: "Age — < 45 / 45–64 / ≥ 65",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gte", value: 65 }, points: 2, label: "≥ 65" },
        { rule: { op: "in_range", range: [45, 64.999] }, points: 1, label: "45–64" },
      ],
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "heart.risk_factors",
      label: "Risk factors — none / 1–2 / ≥ 3 or known atherosclerotic disease",
      inputKey: "heart_risk_factors",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Cardiac risk factors (HTN, diabetes, dyslipidaemia, smoking, family history, obesity)?",
        recordLabel: "Cardiac risk factors",
        options: [
          { label: "None", record: "no cardiac risk factors", satisfied: false, normal: true },
          { label: "1–2", record: "1–2 cardiac risk factors", satisfied: true, points: 1 },
          { label: "≥ 3 / known CAD/PAD/CVD", record: "≥ 3 risk factors or known atherosclerotic disease", satisfied: true, points: 2 },
        ],
      },
    },
    {
      componentId: "heart.troponin",
      label: "Troponin — ≤ normal / 1–3× ULN / > 3× ULN",
      inputKey: "heart_troponin",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Initial troponin (against your lab's upper limit of normal)?",
        recordLabel: "Troponin (HEART)",
        options: [
          { label: "≤ normal limit", record: "troponin at or below the normal limit", satisfied: false, normal: true },
          { label: "1–3× ULN", record: "troponin 1–3× the upper limit of normal", satisfied: true, points: 1 },
          { label: "> 3× ULN", record: "troponin greater than 3× the upper limit of normal", satisfied: true, points: 2 },
        ],
      },
    },
  ],
};

export const heartScoreV1: PathwayDefinition = {
  pathwayId: "heart_score",
  pathwayVersion: "1.0.0",
  title: "Chest pain — cardiac risk",
  status: "active",
  clinicalOwner: "Reviewed against the cited sources and signed off for pilot use by Dr. Anubhav — 2026-09-07. Single-clinician sign-off; departmental review due 2027-09-30.",
  sourceReferences: [
    { label: "Six AJ et al., Neth Heart J 2008", citation: "Chest pain in the emergency room: value of the HEART score. Neth Heart J 2008;16:191–6." },
    { label: "Backus BE et al., Int J Cardiol 2013", citation: "A prospective validation of the HEART score for chest pain patients. Int J Cardiol 2013;168:2153–8." },
  ],
  reviewDueAt: "2027-09-30",
  diagnosisTriggers: {
    codes: ["R07.4", "R07.9", "I20.9", "I24.9"],
    textPatterns: ["chest pain", "chest pain for evaluation", "acute coronary syndrome", "? acs", "unstable angina", "atypical chest pain", "cardiac chest pain", "rule out mi", "r/o mi"],
    excludePatterns: ["st elevation mi", "stemi", "confirmed nstemi", "post pci", "musculoskeletal chest pain confirmed", "chest pain non-cardiac confirmed"],
  },
  eligibility: { minAgeYears: 21, notes: ["Undifferentiated chest pain where ACS is a consideration. Not for a confirmed STEMI/NSTEMI (already an ACS pathway) or clearly non-cardiac pain."] },
  exclusions: ["Confirmed STEMI or NSTEMI.", "Clearly non-cardiac chest pain."],
  cards: [heartCard],
  tasks: [
    {
      key: "heart_ecg_trop",
      cardId: "heart",
      componentId: null,
      action: "12-lead ECG now and a troponin; repeat troponin per local protocol (e.g. 0/1 h or 0/3 h)",
      reason: "ECG and troponin are two of the five HEART criteria and the score is not reliable on a single troponin.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "heart_recheck_3h", dueFrom: "admission", dueAtHours: 3, label: "Re-score after the repeat troponin", recomputeCards: ["heart"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
