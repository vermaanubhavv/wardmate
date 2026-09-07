/**
 * Sepsis screen — pathway definition v1.0.0. TWO cards: qSOFA and SIRS.
 *
 * qSOFA (quick SOFA): one point each for respiratory rate ≥ 22/min, altered mentation
 * (GCS < 15), and systolic BP ≤ 100 mmHg. ≥ 2 identifies a patient with suspected infection
 * at higher risk of a poor outcome — prompt senior review, lactate, cultures and source
 * assessment. It is a PROMPT, not a diagnosis of sepsis and not an ICU trigger.
 *
 * SIRS (≥ 2 of temperature, heart rate, respiratory rate, white-cell count) is shown
 * alongside because Indian medicine units still use it at the bedside and it is more sensitive
 * early; the engine computes it from whatever vitals and counts are recorded (lib/scoring/sirs.ts).
 *
 * STATUS: active — single-clinician pilot sign-off (Dr. Anubhav, 2026-09-07); departmental review still due by reviewDueAt. Added with the internal-medicine
 * specialty pack (docs/specialty-packs.md §8). Sources: Singer M et al. (Sepsis-3), JAMA
 * 2016;315:801–10; Seymour CW et al., JAMA 2016;315:762–74.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "since presentation (dynamic)" };

const qsofaCard: CardDefinition = {
  cardId: "qsofa",
  title: "qSOFA — quick Sepsis-related Organ Failure Assessment",
  shortName: "qSOFA",
  citation:
    "qSOFA — Singer M et al. (The Third International Consensus Definitions for Sepsis and Septic Shock), JAMA 2016;315:801–10. Respiratory rate ≥ 22, altered mentation (GCS < 15), systolic BP ≤ 100 — one point each. ≥ 2 in a patient with suspected infection warrants prompt senior review, lactate, blood cultures and a source assessment. Not a diagnosis of sepsis; not a substitute for clinical judgement or a full SOFA score.",
  type: "calculator",
  timingLabel: "since presentation — re-score on change",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, max: 1, text: "qSOFA 0–1 — lower risk on this screen. Continue to monitor; re-score if the patient changes.", tone: "neutral" },
    { min: 2, max: 3, text: "qSOFA ≥ 2 with suspected infection — higher risk of a poor outcome. Prompt senior review, lactate, blood cultures before antibiotics, and a source assessment.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "qsofa.rr",
      label: "Respiratory rate ≥ 22 /min",
      inputKey: "rr",
      canonicalUnit: "/min",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gte", value: 22 },
      required: true,
    },
    {
      componentId: "qsofa.sbp",
      label: "Systolic BP ≤ 100 mmHg",
      inputKey: "sbp",
      canonicalUnit: "mmHg",
      window: W,
      selector: "lowest",
      points: 1,
      rule: { op: "lte", value: 100 },
      required: true,
    },
    {
      componentId: "qsofa.mentation",
      label: "Altered mentation (GCS < 15)",
      inputKey: "mental_status",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 1,
      // The adapter records mental status as a flag: 0 = impaired, 1 = intact.
      rule: { op: "eq", value: 0 },
      required: true,
    },
  ],
};

const sirsCard: CardDefinition = {
  cardId: "sirs",
  title: "SIRS — systemic inflammatory response",
  shortName: "SIRS",
  citation:
    "SIRS — Bone RC et al., Chest 1992. Two or more of: temperature > 38 °C or < 36 °C; heart rate > 90/min; respiratory rate > 20/min (or PaCO₂ < 32 mmHg); white-cell count > 12 000 or < 4 000/mm³ (or > 10 % bands). Sensitive but non-specific; shown alongside qSOFA, not instead of clinical assessment.",
  type: "structured_classification",
  timingLabel: "since presentation — re-score on change",
  calculation: { kind: "sirs" },
  recomputeOn: ["new_lab", "new_observation", "deterioration", "manual"],
  requiresConfirmation: true,
  interpretationBands: [
    { min: 0, class: "absent", text: "SIRS not met on the values recorded.", tone: "neutral" },
    { min: 0, class: "present", text: "SIRS present (≥ 2 criteria). Non-specific — interpret with the source assessment and qSOFA.", tone: "attention" },
    { min: 0, class: "not_evaluable", text: "Not enough of temperature, heart rate, respiratory rate and white-cell count are recorded to assess SIRS.", tone: "neutral" },
  ],
  inputs: [
    // A carrier input only: the SIRS card computes from every vital/count in the window
    // (lib/scoring/sirs.ts) and uses this input solely for its time window.
    {
      componentId: "sirs.window",
      label: "SIRS assessment window",
      inputKey: "temp",
      canonicalUnit: "C",
      window: W,
      selector: "worst",
      points: 0,
      rule: { op: "present" },
      required: false,
      noAutoTask: true,
    },
  ],
};

export const qsofaV1: PathwayDefinition = {
  pathwayId: "qsofa",
  pathwayVersion: "1.0.0",
  title: "Sepsis screen",
  // Reviewed against the cited source and signed off for pilot use by Dr. Anubhav on
  // 2026-09-07. Triple-gated at runtime; departmental governance review still due (reviewDueAt).
  status: "active",
  clinicalOwner: "Reviewed against the cited sources and signed off for pilot use by Dr. Anubhav — 2026-09-07. Single-clinician sign-off; Internal Medicine departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Singer M et al. (Sepsis-3), JAMA 2016", citation: "The Third International Consensus Definitions for Sepsis and Septic Shock. JAMA 2016;315:801–10." },
    { label: "Seymour CW et al., JAMA 2016", citation: "Assessment of Clinical Criteria for Sepsis. JAMA 2016;315:762–74." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["A41", "A41.9", "R65.1", "R65.2"],
    textPatterns: [
      "sepsis",
      "? sepsis",
      "septic shock",
      "septicaemia",
      "septicemia",
      "bacteraemia",
      "bacteremia",
      "urosepsis",
      "severe sepsis",
    ],
    excludePatterns: ["sepsis screen negative", "no evidence of sepsis"],
  },
  eligibility: { minAgeYears: 16, notes: ["Adult sepsis screen. qSOFA is a risk-stratification prompt, not a diagnosis."] },
  exclusions: ["Neutropenic sepsis on an oncology unit follows the febrile-neutropenia pathway."],
  cards: [qsofaCard, sirsCard],
  tasks: [
    {
      key: "qsofa_lactate",
      cardId: "qsofa",
      componentId: null,
      action: "Send a venous lactate and blood cultures (before the first antibiotic dose)",
      reason: "A raised qSOFA with suspected infection should prompt a lactate, cultures before antibiotics, and a source assessment.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "lactate",
    },
    {
      key: "qsofa_obs",
      cardId: "qsofa",
      componentId: null,
      action: "Chart a full set of observations including respiratory rate and blood pressure",
      reason: "Respiratory rate, blood pressure and mental state are the three qSOFA criteria.",
      priority: "urgent",
      responsibleRole: "nursing",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "qsofa_review_6h", dueFrom: "admission", dueAtHours: 6, label: "Re-score qSOFA / SIRS and review the source at 6 hours", recomputeCards: ["qsofa", "sirs"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
