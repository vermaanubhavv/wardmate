/**
 * Burns — Abbreviated Burn Severity Index (ABSI). Pathway definition v1.0.0. ONE score.
 *
 * ABSI (Tobiasen J, Hiebert JM, Edlich RF, Ann Plast Surg 1982;8:95): female sex 1; age
 * 0–20 → 1, 21–40 → 2, 41–60 → 3, 61–80 → 4, 81+ → 5; inhalation injury 1; full-thickness
 * burn present 1; TBSA in 10 % steps, 1–10 % → 1 … 91–100 % → 10. Total 2–18, read against the
 * published threat-to-life / probability-of-survival categories.
 *
 * What it is NOT: a triage, transfer, fluid or surgical decision. It is a prognostic prompt.
 *
 * STATUS: PENDING CLINICIAN REVIEW — draft; hidden at runtime until signed off.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, label: "at admission" };

const yesNo = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const tbsaOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i * 10 + 1}–${(i + 1) * 10} %`,
  record: `TBSA ${i * 10 + 1}–${(i + 1) * 10}%`,
  satisfied: true,
  points: i + 1,
  ...(i === 0 ? { normal: true } : {}),
}));

const absiCard: CardDefinition = {
  cardId: "absi",
  title: "ABSI — Abbreviated Burn Severity Index",
  shortName: "ABSI",
  citation:
    "ABSI — Tobiasen J et al., Ann Plast Surg 1982;8:95. Sex, age band, inhalation injury, full-thickness burn and TBSA. Total 2–3 very low threat to life (survival ≥ 99 %), 4–5 moderate (98 %), 6–7 moderately severe (80–90 %), 8–9 serious (50–70 %), 10–11 severe (20–40 %), ≥ 12 maximum (≤ 10 %). A prognostic prompt, not a treatment decision.",
  type: "calculator",
  timingLabel: "at admission",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 2, max: 3, text: "ABSI 2–3 — very low threat to life; published probability of survival ≥ 99 %.", tone: "neutral" },
    { min: 4, max: 5, text: "ABSI 4–5 — moderate threat to life; published probability of survival 98 %.", tone: "neutral" },
    { min: 6, max: 7, text: "ABSI 6–7 — moderately severe threat to life; published probability of survival 80–90 %.", tone: "attention" },
    { min: 8, max: 9, text: "ABSI 8–9 — serious threat to life; published probability of survival 50–70 %.", tone: "attention" },
    { min: 10, max: 11, text: "ABSI 10–11 — severe threat to life; published probability of survival 20–40 %.", tone: "attention" },
    { min: 12, max: 18, text: "ABSI ≥ 12 — maximum threat to life; published probability of survival ≤ 10 %.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "absi.sex",
      label: "Sex female",
      inputKey: "sex",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 1,
      rule: { op: "eq", value: "female" },
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "absi.age",
      label: "Age 0–20 → 1, 21–40 → 2, 41–60 → 3, 61–80 → 4, 81+ → 5",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 5,
      rule: { op: "present" },
      bands: [
        { rule: { op: "lte", value: 20 }, points: 1, label: "0–20 years" },
        { rule: { op: "lte", value: 40 }, points: 2, label: "21–40 years" },
        { rule: { op: "lte", value: 60 }, points: 3, label: "41–60 years" },
        { rule: { op: "lte", value: 80 }, points: 4, label: "61–80 years" },
        { rule: { op: "present" }, points: 5, label: "81+ years" },
      ],
      required: true,
      noAutoTask: true,
    },
    {
      componentId: "absi.inhalation",
      label: "Inhalation injury",
      inputKey: "absi_inhalation",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Inhalation injury?", recordLabel: "Inhalation injury (ABSI)", options: yesNo },
    },
    {
      componentId: "absi.full_thickness",
      label: "Full-thickness burn present",
      inputKey: "absi_full_thickness",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 1,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Any full-thickness burn?", recordLabel: "Full-thickness burn (ABSI)", options: yesNo },
    },
    {
      componentId: "absi.tbsa",
      label: "Total body surface area burned — 1 point per 10 %",
      inputKey: "absi_tbsa",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 10,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: { question: "Total body surface area burned?", recordLabel: "TBSA burned (ABSI)", options: tbsaOptions },
    },
  ],
};

export const absiV1: PathwayDefinition = {
  pathwayId: "absi",
  pathwayVersion: "1.0.0",
  title: "Burns — Abbreviated Burn Severity Index",
  status: "draft",
  clinicalOwner: "PENDING CLINICIAN REVIEW — drafted 2026-09-28 from the cited source; not yet signed off. Departmental review due 2027-09-01.",
  sourceReferences: [
    {
      label: "Tobiasen J et al., Ann Plast Surg 1982",
      citation: "Tobiasen J, Hiebert JM, Edlich RF. The abbreviated burn severity index. Ann Plast Surg 1982;8:95.",
    },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    // Normalised substring match: "burn" also covers burns / flame burn / electrical burn.
    textPatterns: ["burn", "scald"],
    excludePatterns: ["heartburn", "heart burn", "burning micturition", "burning sensation", "burning pain", "burning feet"],
  },
  eligibility: { notes: ["Thermal, electrical or scald burns. ABSI is a prognostic prompt."] },
  exclusions: [],
  cards: [absiCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
