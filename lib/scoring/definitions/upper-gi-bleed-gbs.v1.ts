/**
 * Acute upper GI bleeding — pathway definition v1.0.0. ONE score: the Glasgow-Blatchford Score
 * (pre-endoscopy). GBS 0–1 identifies very-low-risk patients who may be considered for
 * outpatient management — a clinician + local-policy decision, not the app's.
 *
 * Urea bands are expressed in mg/dL (converted from the original mmol/L). Haemoglobin uses the
 * male thresholds for both sexes in this first version — the safe direction (slight
 * over-scoring for women); a sex-aware version is a later refinement.
 *
 * STATUS: draft — clinical governance sign-off pending. Sources: [15], [16].
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at presentation" };

const yn = (recordLabel: string, question: string, points: number) => ({
  question,
  recordLabel,
  options: [
    { label: "No", record: "absent", satisfied: false, normal: true },
    { label: "Yes", record: "present", satisfied: true, points },
  ],
});

const gbsCard: CardDefinition = {
  cardId: "gbs",
  title: "Glasgow-Blatchford Score",
  shortName: "GBS",
  citation:
    "Glasgow-Blatchford Score — Blatchford O et al., Lancet 2000;356:1318–1321; ACG Upper GI bleeding guideline 2021. GBS 0–1 = very low risk; guidelines suggest such patients may be considered for outpatient management with clinician assessment and local policy.",
  type: "calculator",
  timingLabel: "before endoscopy",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 1, text: "GBS 0–1 — very low risk. May be considered for outpatient management (clinician + local policy).", tone: "neutral" },
    { min: 2, max: 6, text: "GBS 2–6 — admit; inpatient endoscopy.", tone: "attention" },
    { min: 7, max: 23, text: "GBS ≥ 7 — higher risk. Early endoscopy and resuscitation per pathway.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "gbs.urea",
      label: "Blood urea / BUN (banded)",
      inputKey: "bun",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 6,
      rule: { op: "present" },
      bands: [
        { rule: { op: "gte", value: 70 }, points: 6, label: "≥ 25 mmol/L" },
        { rule: { op: "in_range", range: [28, 69.999] }, points: 4, label: "10–24.9 mmol/L" },
        { rule: { op: "in_range", range: [22.4, 27.999] }, points: 3, label: "8.0–9.9 mmol/L" },
        { rule: { op: "in_range", range: [18.2, 22.399] }, points: 2, label: "6.5–7.9 mmol/L" },
      ],
      required: true,
    },
    {
      componentId: "gbs.hb",
      label: "Haemoglobin (g/dL, banded)",
      inputKey: "hb",
      canonicalUnit: null,
      window: W,
      selector: "lowest",
      points: 6,
      rule: { op: "present" },
      bands: [
        { rule: { op: "lt", value: 10 }, points: 6, label: "< 10" },
        { rule: { op: "in_range", range: [10, 11.999] }, points: 3, label: "10–11.9" },
        { rule: { op: "in_range", range: [12, 12.999] }, points: 1, label: "12–12.9" },
      ],
      required: true,
    },
    {
      componentId: "gbs.sbp",
      label: "Systolic BP (mmHg, banded)",
      inputKey: "sbp",
      canonicalUnit: "mmHg",
      window: W,
      selector: "lowest",
      points: 3,
      rule: { op: "present" },
      bands: [
        { rule: { op: "lt", value: 90 }, points: 3, label: "< 90" },
        { rule: { op: "in_range", range: [90, 99] }, points: 2, label: "90–99" },
        { rule: { op: "in_range", range: [100, 109] }, points: 1, label: "100–109" },
      ],
      required: true,
    },
    {
      componentId: "gbs.pulse",
      label: "Pulse ≥ 100 /min",
      inputKey: "hr",
      canonicalUnit: "/min",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gte", value: 100 },
      required: true,
    },
    {
      componentId: "gbs.melaena",
      label: "Melaena",
      inputKey: "melaena",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: yn("Melaena", "Melaena present?", 1),
    },
    {
      componentId: "gbs.syncope",
      label: "Presentation with syncope",
      inputKey: "syncope",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: yn("Syncope", "Syncope at presentation?", 2),
    },
    {
      componentId: "gbs.hepatic",
      label: "Known hepatic disease",
      inputKey: "hepatic_disease",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: yn("Hepatic disease", "Known hepatic disease (cirrhosis / chronic liver disease)?", 2),
    },
    {
      componentId: "gbs.cardiac",
      label: "Known cardiac failure",
      inputKey: "cardiac_failure",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 2,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: yn("Cardiac failure", "Known cardiac failure?", 2),
    },
  ],
};

export const upperGiBleedGbsV1: PathwayDefinition = {
  pathwayId: "upper_gi_bleeding",
  pathwayVersion: "1.0.0",
  title: "Acute upper GI bleeding",
  status: "draft",
  clinicalOwner: "PENDING_CLINICAL_OWNER (General Surgery + Gastroenterology)",
  sourceReferences: [
    { label: "Glasgow-Blatchford Score", citation: "Blatchford O et al. Lancet 2000;356:1318–1321." },
    { label: "ACG Upper GI and ulcer bleeding guideline", citation: "Laine L et al. Am J Gastroenterol 2021;116:899–917." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["K92.0", "K92.1", "K92.2", "I85.01"],
    textPatterns: ["upper gi bleed", "upper gi bleeding", "ugib", "haematemesis", "hematemesis", "malena", "melaena", "melena", "coffee ground vomiting", "bleeding peptic ulcer", "variceal bleed"],
    excludePatterns: ["lower gi bleed", "per rectal bleeding", "haemorrhoidal bleed", "resolved gi bleed"],
  },
  eligibility: { minAgeYears: 16, notes: ["Pre-endoscopy risk score. Post-endoscopy risk (full Rockall) is a later addition."] },
  exclusions: ["Lower GI bleeding.", "Bleeding already controlled at endoscopy (use a post-endoscopy score)."],
  cards: [gbsCard],
  tasks: [
    {
      key: "gbs_bloods",
      cardId: "gbs",
      componentId: null,
      action: "Send CBC (Hb), KFT (urea), LFT, coagulation, and group & crossmatch",
      reason: "Haemoglobin and blood urea are the two heaviest-weighted Glasgow-Blatchford criteria; group & save readies transfusion.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "hb",
    },
    {
      key: "gbs_meds_review",
      cardId: null,
      componentId: null,
      action: "Review anticoagulants / antiplatelets / NSAIDs and hold as appropriate",
      reason: "Drug review is part of initial UGIB management and affects endoscopy timing.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "gbs_recheck_6h", dueFrom: "admission", dueAtHours: 6, label: "Recheck GBS after resuscitation / serial Hb", recomputeCards: ["gbs"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
