/**
 * Necrotising soft-tissue infection / Fournier gangrene — pathway definition v1.0.0. ONE score:
 * LRINEC, as an ADJUNCT ONLY.
 *
 * SAFETY (DOCX, non-negotiable): a low LRINEC must NEVER produce an "NSTI excluded" or a
 * reassuring green state. Meta-analysis: sensitivity ~68% at ≥ 6, ~41% at ≥ 8. Every
 * interpretation band on this card is `attention`, and the low-score band says in plain words
 * that it does not rule the diagnosis out. Scoring and imaging must not delay senior surgical
 * review or exploration.
 *
 * STATUS: draft — not yet offered to any unit pending clinician review. Sources: Wong CH et al.,
 * Crit Care Med 2004;32:1535–41; Fernando SM et al. (diagnostic accuracy meta-analysis), Ann
 * Surg 2019;269:58–65.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at presentation" };

const lrinecCard: CardDefinition = {
  cardId: "lrinec",
  title: "LRINEC score",
  shortName: "LRINEC",
  citation:
    "LRINEC — Wong CH et al., Crit Care Med 2004;32:1535–41. Adjunct only. Diagnostic-accuracy meta-analysis (Fernando SM et al., Ann Surg 2019): sensitivity ≈ 68% at ≥ 6, ≈ 41% at ≥ 8 — a LOW SCORE DOES NOT RULE OUT necrotising infection. High clinical suspicion mandates immediate senior surgical review and exploration regardless of this number; scoring and imaging must not delay source control.",
  type: "calculator",
  timingLabel: "at presentation — adjunct only",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "deterioration", "manual"],
  interpretationBands: [
    // Every band is `attention` — there is no reassuring state for this score.
    { min: 0, max: 5, text: "LRINEC < 6 — this DOES NOT exclude necrotising infection (sensitivity ≈ 68% at ≥ 6). If clinical suspicion is present — pain out of proportion, rapid progression, systemic toxicity, skin changes, crepitus — arrange urgent senior surgical review now, independent of this score.", tone: "attention" },
    { min: 6, max: 7, text: "LRINEC 6–7 — raised concern for necrotising infection. Immediate senior surgical review and consideration of exploration; do not wait on imaging.", tone: "attention" },
    { min: 8, max: 13, text: "LRINEC ≥ 8 — high concern. Immediate senior surgical review, resuscitation, broad-spectrum antibiotics per local policy, and theatre planning.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "lrinec.crp",
      label: "CRP (< 150 → 0, ≥ 150 mg/L → 4)",
      inputKey: "crp",
      canonicalUnit: null,
      window: W,
      selector: "highest",
      points: 4,
      rule: { op: "present" },
      bands: [{ rule: { op: "gte", value: 150 }, points: 4, label: "≥ 150 mg/L" }],
      required: true,
    },
    {
      componentId: "lrinec.wbc",
      label: "WBC (< 15 → 0, 15–25 → 1, > 25 ×10⁹/L → 2)",
      inputKey: "wbc",
      canonicalUnit: "cells/mm3",
      window: W,
      selector: "highest",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gt", value: 25000 }, points: 2, label: "> 25,000" },
        { rule: { op: "in_range", range: [15000, 25000] }, points: 1, label: "15,000–25,000" },
      ],
      required: true,
    },
    {
      componentId: "lrinec.hb",
      label: "Haemoglobin (> 13.5 → 0, 11–13.5 → 1, < 11 g/dL → 2)",
      inputKey: "hb",
      canonicalUnit: null,
      window: W,
      selector: "lowest",
      points: 2,
      rule: { op: "present" },
      bands: [
        { rule: { op: "lt", value: 11 }, points: 2, label: "< 11" },
        { rule: { op: "in_range", range: [11, 13.5] }, points: 1, label: "11–13.5" },
      ],
      required: true,
    },
    {
      componentId: "lrinec.sodium",
      label: "Sodium (≥ 135 → 0, < 135 mmol/L → 2)",
      inputKey: "sodium",
      canonicalUnit: null,
      window: W,
      selector: "lowest",
      points: 2,
      rule: { op: "lt", value: 135 },
      required: true,
    },
    {
      componentId: "lrinec.creatinine",
      label: "Creatinine (≤ 1.6 → 0, > 1.6 mg/dL → 2)",
      inputKey: "creatinine",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 2,
      rule: { op: "gt", value: 1.6 },
      required: true,
    },
    {
      componentId: "lrinec.glucose",
      label: "Glucose (≤ 180 → 0, > 180 mg/dL → 1)",
      inputKey: "glucose",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gt", value: 180 },
      required: true,
    },
  ],
};

export const lrinecV1: PathwayDefinition = {
  pathwayId: "nsti",
  pathwayVersion: "1.0.0",
  title: "Necrotising soft-tissue infection",
  status: "draft",
  clinicalOwner: "PENDING — awaiting single-clinician review. NOTE: the low-score safeguard (a low LRINEC never reads as 'excluded' / green) must be explicitly confirmed at review.",
  sourceReferences: [
    { label: "Wong CH et al., Crit Care Med 2004", citation: "The LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis) score. Crit Care Med 2004;32:1535–41." },
    { label: "Fernando SM et al., Ann Surg 2019", citation: "Necrotizing soft tissue infection: diagnostic accuracy of physical examination, imaging, and LRINEC score. Ann Surg 2019;269:58–65." },
  ],
  reviewDueAt: "2027-09-30",
  diagnosisTriggers: {
    codes: ["M72.6", "N49.3", "A48.0"],
    textPatterns: ["necrotising fasciitis", "necrotizing fasciitis", "necrotising soft tissue infection", "nsti", "fournier gangrene", "fournier's gangrene", "gas gangrene", "flesh eating infection"],
    excludePatterns: ["cellulitis", "simple abscess", "erysipelas", "resolved necrotising"],
  },
  eligibility: { minAgeYears: 16, notes: ["Adjunct only. The clinical picture — not this score — drives the decision to explore."] },
  exclusions: ["Uncomplicated cellulitis or a simple abscess."],
  cards: [lrinecCard],
  tasks: [
    {
      key: "lrinec_senior_review",
      cardId: null,
      componentId: null,
      action: "Urgent senior surgical review NOW — do not wait on the score, bloods or imaging",
      reason: "The decision to explore is clinical. LRINEC is an adjunct with poor sensitivity; delay to source control worsens mortality.",
      priority: "urgent",
      responsibleRole: "senior",
      institutionalToggle: null,
    },
    {
      key: "lrinec_bloods",
      cardId: "lrinec",
      componentId: null,
      action: "Send CBC, CRP, U&E (sodium, creatinine), glucose, lactate, coagulation, and blood group & crossmatch",
      reason: "All six LRINEC parameters plus resuscitation and theatre readiness.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "sodium",
    },
    {
      key: "lrinec_mark_extent",
      cardId: null,
      componentId: null,
      action: "Mark the skin margin with the time; reassess for spread every 1–2 hours",
      reason: "Rate of spread is one of the most useful bedside signs and is easily lost without a marked baseline.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "lrinec_review_2h", dueFrom: "admission", dueAtHours: 2, label: "Re-score and reassess spread at 2 hours", recomputeCards: ["lrinec"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
