/**
 * Opioid withdrawal — pathway definition v1.0.0. ONE score: the Clinical Opiate Withdrawal
 * Scale (COWS).
 *
 * Eleven clinician-observed items with their published anchor scores; total 0–48. 5–12 mild,
 * 13–24 moderate, 25–36 moderately severe, > 36 severe; 0–4 is below the mild range.
 *
 * Resting pulse is read from charted heart rate (≤ 80 → 0, 81–100 → 1, 101–120 → 2,
 * > 120 → 4). COWS takes the pulse after the patient has sat or lain for one minute; the engine
 * cannot tell a resting value apart, so it takes the HIGHEST charted rate in the assessment
 * window (−2 h to +6 h around admission) and the clinician can override it. The engine has no
 * "now"-anchored window, so this card is the admission COWS; re-scores need a fresh assessment.
 *
 * It describes withdrawal severity; it does not itself prescribe.
 *
 * STATUS: active — signed off for pilot use by Dr Anubhav Verma, 2026-09-28 (single-clinician sign-off;
 * departmental review due 2027-09-01). Source: Wesson DR, Ling W. J Psychoactive Drugs 2003;35:253–9.
 */

import type { CardDefinition, ComponentInput, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -2, endHours: 6, label: "admission assessment (−2 h to +6 h)" };

/** A COWS item: `levels` are [anchor text, points] with the first (0 points) the normal one. */
const item = (componentId: string, label: string, question: string, levels: [string, number][]): ComponentInput => ({
  componentId,
  label,
  inputKey: componentId.replace("cows.", "cows_"),
  canonicalUnit: null,
  window: W,
  selector: "worst",
  points: Math.max(...levels.map(([, p]) => p)),
  rule: { op: "present" },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: {
    question,
    recordLabel: label,
    options: levels.map(([text, pts], i) => ({
      label: `${text} (${pts})`,
      record: `${label}: ${text.toLowerCase()}`,
      satisfied: pts > 0,
      ...(pts > 0 ? { points: pts } : {}),
      ...(i === 0 ? { normal: true } : {}),
    })),
  },
});

const cowsCard: CardDefinition = {
  cardId: "cows",
  title: "COWS — Clinical Opiate Withdrawal Scale",
  shortName: "COWS",
  citation:
    "COWS — Wesson DR, Ling W. J Psychoactive Drugs 2003;35:253–9. Eleven items, total 0–48: 5–12 mild, 13–24 moderate, 25–36 moderately severe, > 36 severe. Resting pulse is taken after sitting or lying for one minute; here it is the highest charted heart rate in the assessment window. Describes severity; it does not prescribe.",
  type: "calculator",
  timingLabel: "admission assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 4, text: "COWS 0–4 — below the mild range.", tone: "neutral" },
    { min: 5, max: 12, text: "COWS 5–12 — mild opioid withdrawal.", tone: "neutral" },
    { min: 13, max: 24, text: "COWS 13–24 — moderate opioid withdrawal.", tone: "attention" },
    { min: 25, max: 36, text: "COWS 25–36 — moderately severe opioid withdrawal.", tone: "attention" },
    { min: 37, max: 48, text: "COWS > 36 — severe opioid withdrawal.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "cows.pulse",
      label: "Resting pulse rate",
      inputKey: "hr",
      canonicalUnit: "/min",
      window: W,
      selector: "highest",
      points: 4,
      rule: { op: "present" },
      bands: [
        { rule: { op: "lte", value: 80 }, points: 0, label: "≤ 80 /min" },
        { rule: { op: "lte", value: 100 }, points: 1, label: "81–100 /min" },
        { rule: { op: "lte", value: 120 }, points: 2, label: "101–120 /min" },
        { rule: { op: "gt", value: 120 }, points: 4, label: "> 120 /min" },
      ],
      required: true,
    },
    item("cows.sweating", "Sweating", "Sweating over the past half hour, not due to room temperature or activity?", [
      ["No report of chills or flushing", 0],
      ["Subjective report of chills or flushing", 1],
      ["Flushed or observable moistness on face", 2],
      ["Beads of sweat on brow or face", 3],
      ["Sweat streaming off face", 4],
    ]),
    item("cows.restlessness", "Restlessness", "Restlessness during the assessment?", [
      ["Able to sit still", 0],
      ["Reports difficulty sitting still, but is able to do so", 1],
      ["Frequent shifting or extraneous movements of legs/arms", 3],
      ["Unable to sit still for more than a few seconds", 5],
    ]),
    item("cows.pupils", "Pupil size", "Pupil size?", [
      ["Pinned or normal size for room light", 0],
      ["Possibly larger than normal for room light", 1],
      ["Moderately dilated", 2],
      ["So dilated that only the rim of the iris is visible", 5],
    ]),
    item("cows.aches", "Bone or joint aches", "Bone or joint aches (new, not from a prior condition)?", [
      ["Not present", 0],
      ["Mild diffuse discomfort", 1],
      ["Severe diffuse aching of joints/muscles", 2],
      ["Rubbing joints or muscles, unable to sit still from discomfort", 4],
    ]),
    item("cows.rhinorrhoea", "Runny nose or tearing", "Runny nose or tearing, not from a cold or allergy?", [
      ["Not present", 0],
      ["Nasal stuffiness or unusually moist eyes", 1],
      ["Nose running or tearing", 2],
      ["Nose constantly running or tears streaming", 4],
    ]),
    item("cows.gi", "GI upset", "GI upset over the last half hour?", [
      ["No GI symptoms", 0],
      ["Stomach cramps", 1],
      ["Nausea or loose stool", 2],
      ["Vomiting or diarrhoea", 3],
      ["Multiple episodes of diarrhoea or vomiting", 5],
    ]),
    item("cows.tremor", "Tremor", "Tremor with hands outstretched?", [
      ["No tremor", 0],
      ["Tremor can be felt but not observed", 1],
      ["Slight tremor observable", 2],
      ["Gross tremor or muscle twitching", 4],
    ]),
    item("cows.yawning", "Yawning", "Yawning during the assessment?", [
      ["No yawning", 0],
      ["Yawning once or twice", 1],
      ["Yawning three or more times", 2],
      ["Yawning several times a minute", 4],
    ]),
    item("cows.anxiety", "Anxiety or irritability", "Anxiety or irritability?", [
      ["None", 0],
      ["Reports increasing irritability or anxiousness", 1],
      ["Obviously irritable or anxious", 2],
      ["So irritable or anxious that participation is difficult", 4],
    ]),
    item("cows.gooseflesh", "Gooseflesh skin", "Gooseflesh (piloerection)?", [
      ["Skin is smooth", 0],
      ["Piloerection can be felt or hairs standing up on arms", 3],
      ["Prominent piloerection", 5],
    ]),
  ],
};

export const cowsV1: PathwayDefinition = {
  pathwayId: "cows",
  pathwayVersion: "1.0.0",
  title: "Opioid withdrawal",
  status: "active",
  clinicalOwner: "Reviewed against the cited source and signed off for pilot use by Dr Anubhav Verma — 2026-09-28. Single-clinician sign-off; departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Wesson DR, Ling W. J Psychoactive Drugs 2003", citation: "The Clinical Opiate Withdrawal Scale (COWS). J Psychoactive Drugs 2003;35:253–9." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    textPatterns: ["opioid withdrawal", "opioid dependence", "heroin", "smack", "doda", "buprenorphine"],
    excludePatterns: ["opioid withdrawal resolved"],
  },
  eligibility: { minAgeYears: 18, notes: ["A patient at risk of, or in, opioid withdrawal who can be observed and communicate."] },
  exclusions: ["Cannot communicate / sedated — several items are subjective."],
  cards: [cowsCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
