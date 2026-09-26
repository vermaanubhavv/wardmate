"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { caseHistorySectionOf } from "@/lib/case-history";
import { complaintChipsFor, pastChipsFor } from "@/lib/case-history-chips";
import { leadsFor, readField, writeField } from "@/lib/case-history-departments";
import DictationOverlay from "./dictation-overlay";
import type { Observation } from "@/lib/patient-state";
import type { WardRanges } from "@/lib/exam-summary";
import { CaseHistoryCard } from "../case-history-card";
import { Field, Area } from "../discharge/discharge-fields";
import {
  IconCheck,
  SelChip,
  OptionRow,
  statusChip,
  genBtn,
  approveBtn,
  DictateArea,
  UncertainList,
  PillsAndText,
} from "../card-kit";
import {
  replaceCaseHistorySection,
  replaceCaseHistoryExam,
  applyCompiledCaseHistory,
  applyRelevantNegatives,
  approveCaseHistoryDiagnosis,
  approveCaseHistoryPlan,
} from "./actions";

/** "3 days", "2 weeks", "6/12", "1 yr" → an approximate day count, for ordering complaints
 *  longest-standing first. Unparseable durations sort last (Infinity keeps tap order stable
 *  only when every complaint has one). */
function durationToDays(raw: string): number {
  const s = raw.toLowerCase().trim();
  if (!s) return Number.POSITIVE_INFINITY;
  const m = s.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h|day|d|week|wk|w|month|mon|mo|m|year|yr|y)/);
  if (!m) return Number.POSITIVE_INFINITY;
  const n = parseFloat(m[1]);
  const u = m[2];
  if (/^h/.test(u)) return n / 24;
  if (/^d/.test(u)) return n;
  if (/^w/.test(u)) return n * 7;
  if (/^(mo|mon|m)$/.test(u)) return n * 30;
  return n * 365;
}

/** Split a stored complaint back into its bare name and duration. Only the canonical "<name> ×
 *  <duration>" shape this file writes is recognised — a comma, a semicolon, or a long tail
 *  means it is not a single "name × duration" and is returned untouched. */
function splitDuration(stored: string): { name: string; duration: string } {
  const m = stored.match(/^(.+?)\s*[×x]\s*([^,;×x]{1,24})$/);
  if (m && m[1].trim() && durationToDays(m[2]) !== Number.POSITIVE_INFINITY) {
    return { name: m[1].trim(), duration: m[2].trim() };
  }
  return { name: stored.trim(), duration: "" };
}

export type WorkspaceObs = { id: string; kind: string; label: string; value: string | null };

// --- the clerking, card by card ----------------------------------------------------------
//
// Complaint and past-history chips are chosen per specialty (lib/case-history-chips.ts) — see
// `complaintChips` / `pastChips` below, computed from the `specialty` prop. Medication chips
// stay shared: DM/HTN/CKD drug classes are equally relevant on a surgical or a medicine ward.

/** Personal / addiction history — the standard Indian case-sheet section past history does not
 *  itself answer (a patient K/C/O nothing can still be a chronic smoker). No "K/C/O" prefix —
 *  see historyCard's chipPrefix option — these read as plain statements, not declared history. */
const PERSONAL_CHIPS = [
  "Non-smoker",
  "Smoker",
  "Ex-smoker",
  "Alcohol — occasional",
  "Alcohol — regular",
  "Tobacco chewing",
  "Gutka / paan chewing",
  "Vegetarian diet",
  "Normal bowel & bladder",
];

const MED_CHIPS = [
  "Antihypertensive",
  "Oral hypoglycaemic",
  "Insulin",
  "Antiplatelet",
  "Anticoagulant",
  "Steroid",
  "Inhaler",
  "Thyroxine",
  "CKD medication",
];

/** For a medication class the resident taps, the common drugs in it — offered right there as a
 *  dropdown of pills so the class chip (kept for a quick generic entry) can be followed
 *  immediately by the actual drug name, without typing it out. */
const DRUG_OPTIONS: Record<string, string[]> = {
  "Antihypertensive": [
    "Amlodipine", "Telmisartan", "Losartan", "Enalapril", "Ramipril",
    "Metoprolol", "Atenolol", "Hydrochlorothiazide", "Chlorthalidone",
  ],
  "Oral hypoglycaemic": [
    "Metformin", "Glimepiride", "Gliclazide", "Sitagliptin", "Vildagliptin",
    "Empagliflozin", "Voglibose", "Pioglitazone",
  ],
  "CKD medication": [
    "Erythropoietin", "Iron sucrose", "Calcium carbonate", "Sodium bicarbonate",
    "Cholecalciferol", "Furosemide", "Cinacalcet",
  ],
};

const PICCLE_SIGNS = [
  { label: "pallor", title: "Pallor" },
  { label: "icterus", title: "Icterus" },
  { label: "cyanosis", title: "Cyanosis" },
  { label: "clubbing", title: "Clubbing" },
  { label: "lymphadenopathy", title: "Lymphadenopathy" },
  { label: "oedema", title: "Oedema" },
  { label: "jvp", title: "JVP" },
];

// One HOPI card per complaint. Each carries the attributes a resident would ask about that
// symptom — a row of quick pills each, plus free text for the narrative. Pills are matched
// against and written into the same one free-text string that gets stored, so the card
// round-trips: tap "Colicky" and it appears in the sentence; re-open and the pill reads as on.
type HopiAttr = { label: string; options: string[] };

const GENERIC_HOPI: HopiAttr[] = [
  { label: "Onset", options: ["Sudden", "Gradual"] },
  { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
  { label: "Progression", options: ["Improving", "Static", "Worsening"] },
  { label: "Severity", options: ["Mild", "Moderate", "Severe"] },
  { label: "Timing", options: ["Constant", "Intermittent", "Worse at night", "After food"] },
];

const SYMPTOM_TEMPLATES: { match: RegExp; attrs: HopiAttr[] }[] = [
  {
    // Checked before the generic pain/ache template below, which would otherwise catch
    // "headache" too (it contains "ache") and ask abdominal-pain questions for it.
    match: /headache|migraine|cephalgia/i,
    attrs: [
      { label: "Site", options: ["Unilateral", "Bilateral", "Frontal", "Occipital", "Temporal", "Generalised"] },
      { label: "Onset", options: ["Sudden (thunderclap)", "Gradual"] },
      { label: "Character", options: ["Throbbing", "Pressing / tightening", "Sharp / stabbing", "Dull ache"] },
      { label: "Severity", options: ["Mild", "Moderate", "Severe — worst ever"] },
      { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
      { label: "Pattern", options: ["First episode", "Recurrent", "Chronic daily"] },
      { label: "Aggravated by", options: ["Straining / coughing", "Bending forward", "Light", "Noise", "Movement"] },
      { label: "Relieved by", options: ["Rest", "Dark quiet room", "Analgesics", "Sleep"] },
      { label: "Associated with", options: ["Nausea / vomiting", "Photophobia", "Phonophobia", "Visual disturbance", "Neck stiffness", "Fever", "Weakness / numbness", "Loss of consciousness", "Seizure"] },
    ],
  },
  {
    match: /pain|ache/i,
    attrs: [
      { label: "Site", options: ["Epigastric", "RUQ", "LUQ", "RIF", "LIF", "Periumbilical", "Suprapubic", "Loin", "Generalised", "Shifting"] },
      { label: "Onset", options: ["Sudden", "Gradual", "After meals", "At night"] },
      { label: "Character", options: ["Colicky", "Dull ache", "Burning", "Cramping", "Sharp / stabbing", "Constant"] },
      { label: "Radiation", options: ["To back", "To right shoulder", "To groin", "To tip of shoulder", "None"] },
      { label: "Severity", options: ["Mild", "Moderate", "Severe"] },
      { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
      { label: "Progression", options: ["Improving", "Static", "Worsening"] },
      { label: "Aggravated by", options: ["Movement", "Food", "Fatty food", "Coughing", "Deep breath"] },
      { label: "Relieved by", options: ["Rest", "Vomiting", "Leaning forward", "Antacids", "Passing stool / flatus"] },
      { label: "Associated with", options: ["Vomiting", "Fever", "Distension", "Constipation", "Loose stools", "Anorexia", "Jaundice", "Dysuria", "Haematuria"] },
    ],
  },
  {
    match: /vomit|emesis/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", ">1 week"] },
      { label: "Frequency", options: ["1–2 / day", "3–5 / day", ">5 / day"] },
      { label: "Content", options: ["Food particles", "Bilious", "Blood / coffee-ground", "Feculent", "Watery"] },
      { label: "Relation to food", options: ["Soon after eating", "Delayed", "Unrelated"] },
      { label: "Nature", options: ["Projectile", "Effortless", "Preceded by nausea"] },
      { label: "Progression", options: ["Improving", "Static", "Worsening"] },
      { label: "Associated with", options: ["Pain abdomen", "Distension", "Constipation", "Obstipation", "Fever", "Weight loss"] },
    ],
  },
  {
    match: /fever|pyrexia/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
      { label: "Grade", options: ["Low-grade", "High-grade", "Documented >101°F"] },
      { label: "Pattern", options: ["Continuous", "Intermittent", "Remittent", "Evening rise"] },
      { label: "Chills / rigors", options: ["With rigors", "With chills only", "No chills"] },
      { label: "Progression", options: ["Improving", "Static", "Worsening"] },
      { label: "Associated with", options: ["Night sweats", "Weight loss", "Cough", "Dysuria", "Pain abdomen", "Loose stools", "Rash"] },
    ],
  },
  {
    match: /jaundice|icterus|yellow/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month"] },
      { label: "Progression", options: ["Increasing", "Decreasing", "Fluctuating"] },
      { label: "Pain", options: ["Painful", "Painless"] },
      { label: "Urine", options: ["High-coloured", "Normal"] },
      { label: "Stools", options: ["Clay-coloured", "Pale", "Normal"] },
      { label: "Pruritus", options: ["Present", "Absent"] },
      { label: "Associated with", options: ["Fever", "Weight loss", "Anorexia", "Vomiting", "Abdominal lump"] },
    ],
  },
  {
    match: /lump|swelling|mass/i,
    attrs: [
      { label: "Site", options: ["Groin", "Umbilical", "Epigastric", "Scrotal", "Neck", "Breast", "Abdominal wall", "Other"] },
      { label: "Duration", options: ["<1 month", "1–6 months", "6–12 months", ">1 year"] },
      { label: "Onset", options: ["Noticed incidentally", "After straining / lifting"] },
      { label: "Progression", options: ["Increasing in size", "Static", "Decreasing"] },
      { label: "Pain", options: ["Painful", "Painless"] },
      { label: "Reducibility", options: ["Reducible", "Irreducible", "Reducible on lying down"] },
      { label: "Cough impulse", options: ["Present", "Absent"] },
      { label: "Associated with", options: ["Pain abdomen", "Vomiting", "Constipation", "Skin changes", "Other lumps", "Weight loss"] },
    ],
  },
  {
    match: /distension|distention|bloat/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", ">1 week"] },
      { label: "Extent", options: ["Localised", "Generalised"] },
      { label: "Progression", options: ["Increasing", "Static", "Decreasing"] },
      { label: "Flatus / stool", options: ["Passing normally", "Reduced", "Absent (obstipation)"] },
      { label: "Associated with", options: ["Pain abdomen", "Vomiting", "Constipation", "Breathlessness", "Visible peristalsis"] },
    ],
  },
  {
    match: /constipat/i,
    attrs: [
      { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month", "Long-standing"] },
      { label: "Bowel frequency", options: ["Once in 2–3 days", "Once in 4–7 days", "<Once a week"] },
      { label: "Stool", options: ["Hard", "Pellet-like", "Narrow calibre"] },
      { label: "Pattern", options: ["Progressive", "Alternating with diarrhoea"] },
      { label: "Blood / mucus", options: ["Blood in stool", "Mucus", "Neither"] },
      { label: "Associated with", options: ["Pain abdomen", "Distension", "Tenesmus", "Weight loss", "Anorexia"] },
    ],
  },
  {
    match: /loose stool|diarrh|motions/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
      { label: "Frequency", options: ["3–5 / day", "6–10 / day", ">10 / day"] },
      { label: "Consistency", options: ["Watery", "Semi-formed", "Mucoid"] },
      { label: "Blood / mucus", options: ["Blood present", "Mucus present", "Neither"] },
      { label: "Timing", options: ["Nocturnal", "Post-prandial", "Tenesmus"] },
      { label: "Associated with", options: ["Fever", "Pain abdomen", "Vomiting", "Dehydration", "Weight loss"] },
    ],
  },
  {
    match: /bleeding per rectum|per rectal bleed|pr bleed|blood in stool|melena|melaena/i,
    attrs: [
      { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month", "Recurrent"] },
      { label: "Colour", options: ["Bright red", "Dark red", "Altered / maroon", "Melena (black tarry)"] },
      { label: "Amount", options: ["Streaks on stool", "Mixed with stool", "Splash in the pan", "Dripping after stool"] },
      { label: "Relation to defecation", options: ["During", "After", "Unrelated"] },
      { label: "Pain", options: ["Painful", "Painless"] },
      { label: "Associated with", options: ["Mucus", "Mass / prolapse", "Change in bowel habit", "Weight loss", "Pallor / giddiness"] },
    ],
  },
  {
    match: /burning micturition|dysuria|urin/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
      { label: "Voiding", options: ["Increased frequency", "Urgency", "Poor stream", "Incomplete emptying", "Terminal dribbling"] },
      { label: "Urine", options: ["Haematuria", "Cloudy / turbid", "Foul-smelling", "Clear"] },
      { label: "Pain site", options: ["Suprapubic", "Loin", "Urethral"] },
      { label: "Associated with", options: ["Fever", "Rigors", "Loin pain", "Nausea / vomiting"] },
    ],
  },
  {
    match: /appetite/i,
    attrs: [
      { label: "Duration", options: ["<1 month", "1–3 months", ">3 months"] },
      { label: "Severity", options: ["Mild", "Marked", "Aversion to food"] },
      { label: "Progression", options: ["Improving", "Static", "Worsening"] },
      { label: "Associated with", options: ["Weight loss", "Nausea", "Early satiety", "Pain abdomen", "Altered taste"] },
    ],
  },
  {
    match: /weight/i,
    attrs: [
      { label: "Amount", options: ["2–5 kg", "5–10 kg", ">10 kg", "Not quantified"] },
      { label: "Over", options: ["<1 month", "1–3 months", "3–6 months", ">6 months"] },
      { label: "Appetite", options: ["Preserved", "Reduced"] },
      { label: "Associated with", options: ["Fever", "Night sweats", "Cough", "Bowel change", "Lump", "Anorexia"] },
    ],
  },
];

const DURATION_QUICK = ["1 day", "3 days", "1 week", "2 weeks", "1 month"];

function hopiAttrsFor(complaint: string): HopiAttr[] {
  return SYMPTOM_TEMPLATES.find((t) => t.match.test(complaint))?.attrs ?? GENERIC_HOPI;
}

// --- medical oncology --------------------------------------------------------------------
// Quick taps for the four oncology history cards. Each writes its own words into the same free
// text the resident can type or dictate into, so a card filled by tapping and one filled by
// speaking are the same card.
const ONCO_DISEASE_PILLS = [
  "Newly diagnosed", "Recurrent", "Biopsy proven", "Cytology proven", "On imaging only",
  "Early stage", "Locally advanced", "Metastatic",
];
const ONCO_TREATMENT_PILLS = [
  "Treatment naive", "Surgery done", "Radiotherapy done", "Neoadjuvant", "Adjuvant",
  "Palliative intent", "First line", "Second line", "Third line or beyond",
];
const ONCO_CYCLE_PILLS = [
  "First cycle", "Full dose", "Dose reduced", "Cycle delayed", "Day care",
  "Admitted for this cycle", "Growth factor given",
];
const ONCO_TOXICITY_PILLS = [
  "No toxicity", "Nausea / vomiting", "Mucositis", "Diarrhoea", "Constipation",
  "Peripheral neuropathy", "Fever", "Neutropenia", "Thrombocytopenia",
  "Anaemia needing transfusion", "Hand-foot syndrome", "Fatigue",
];

// Node stations, in survey order — the same order a resident actually palpates in. Each tap
// appends "<station> — <finding>" so several stations can be recorded without one overwriting
// another; typing or dictating adds size, number, mobility, matting or tenderness in the
// resident's own words.
const NODE_STATIONS = ["Cervical", "Supraclavicular", "Axillary", "Inguinal"];
const NODE_FINDINGS = ["not enlarged", "enlarged", "matted", "fixed", "tender", "firm", "mobile"];

const MUCOSITIS_GRADES: { line: string; label: string }[] = [
  { line: "No mucositis", label: "No mucositis" },
  { line: "Grade 1 mucositis", label: "Grade 1 — soreness, no ulcers" },
  { line: "Grade 2 mucositis", label: "Grade 2 — ulcers, can eat solids" },
  { line: "Grade 3 mucositis", label: "Grade 3 — ulcers, only liquids" },
  { line: "Grade 4 mucositis", label: "Grade 4 — cannot swallow, feeding tube / TPN needed" },
];
const SKIN_LINE_PILLS = [
  "Hand-foot syndrome", "Rash", "Extravasation site", "Alopecia",
  "Petechiae", "Ecchymoses", "Nail changes",
  "Chemoport site clean", "PICC site clean", "Line site erythema", "Line site discharge",
];

/** ECOG, in the wording the scale actually uses. Exclusive — one patient, one status. */
const ECOG_CHOICES: { line: string; label: string }[] = [
  { line: "ECOG 0", label: "0 — Fully active, no restriction" },
  { line: "ECOG 1", label: "1 — Restricted in strenuous activity; walks, does light work" },
  { line: "ECOG 2", label: "2 — Up and about more than half the day; cannot work" },
  { line: "ECOG 3", label: "3 — In bed or a chair more than half the day; limited self-care" },
  { line: "ECOG 4", label: "4 — Completely confined to bed or chair" },
];

const ABDOMEN_PILLS = ["Soft", "Non-tender", "Tender", "Guarding", "Distended", "Lump", "Organomegaly"];
const CHEST_PILLS = ["Clear", "NVBS", "Bilateral air entry equal", "Added sounds", "Decreased air entry"];

const VITALS: { key: string; label: string; placeholder: string }[] = [
  { key: "BP", label: "BP", placeholder: "120/80" },
  { key: "PR", label: "PR", placeholder: "84 /min" },
  { key: "RR", label: "RR", placeholder: "16 /min" },
  { key: "Temp", label: "Temp", placeholder: "Afebrile" },
  { key: "SpO2", label: "SpO₂", placeholder: "98% RA" },
];

type Mode = "unset" | "none" | "significant";
type SignState = "unset" | "normal" | "abnormal";

const DENIAL = /^(no|nil|not|none|nad|nr|negative|unremarkable|insignificant|absent)\b/i;
const readsDenial = (s: string) => DENIAL.test(s.trim()) || /no relevant|not relevant|nil relevant/i.test(s);

type StepId =
  | "demographics"
  | "complaints"
  | "hopi"
  | "past"
  | "personal"
  | "family"
  | "medication"
  | "surgical"
  | "obstetric"
  | "dietary"
  | "environmental"
  | "negatives"
  | "onco_disease"
  | "onco_treatment"
  | "onco_cycle"
  | "onco_toxicity"
  | "performance"
  | "onco_nodes"
  | "onco_mucosa_line"
  | "piccle"
  | "vitals"
  | "abdomen"
  | "chest"
  | "local"
  | "diagnosis"
  | "plan"
  | "review";

export default function CaseHistoryWorkspace({
  patientId,
  sex,
  demographics,
  primaryDiagnosis,
  observations,
  fullObservations,
  rangeEntries,
  specialty = "general_surgery",
}: {
  patientId: string;
  sex: string | null;
  /** Read-only identity for the first screen: name, age, sex and bed are all that identify a patient. */
  demographics: { name: string; age: number | null; bed: string | null };
  primaryDiagnosis: string | null;
  observations: WorkspaceObs[];
  fullObservations: Observation[];
  rangeEntries: [string, { low: number | null; high: number | null; text: string | null }][];
  /** The unit's department. An oncology unit gets four extra history cards and a performance
   *  status card; every other unit's stack is exactly what it has always been. */
  specialty?: string;
}) {
  const oncology = specialty === "medical_oncology";
  const complaintChips = useMemo(() => complaintChipsFor(specialty), [specialty]);
  const pastChips = useMemo(() => pastChipsFor(specialty), [specialty]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const liveDictationOn = process.env.NEXT_PUBLIC_LIVE_DICTATION === "1";
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [dictating, setDictating] = useState(() => liveDictationOn && searchParams.get("dictate") === "1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<StepId>>(new Set());
  const [generating, setGenerating] = useState<string | null>(null);

  const wardRanges: WardRanges = useMemo(() => new Map(rangeEntries), [rangeEntries]);

  const bySection = useMemo(() => {
    const m: Record<string, WorkspaceObs[]> = {};
    for (const o of observations) {
      if (o.kind === "plan") continue;
      const key = caseHistorySectionOf(o.label) ?? "other";
      (m[key] ??= []).push(o);
    }
    return m;
  }, [observations]);

  const examValue = (aliases: string[]) =>
    observations.find((o) => aliases.includes(o.label.toLowerCase().trim()))?.value ?? "";

  // --- seed every card from the record, once -----------------------------------------

  const seededComplaintRows = useMemo(
    () =>
      (bySection.chief ?? [])
        .map((o) => splitDuration((o.value ?? "").trim()))
        .filter((r) => r.name),
    [bySection]
  );
  const [complaints, setComplaints] = useState<string[]>(seededComplaintRows.map((r) => r.name));
  const [complaintDur, setComplaintDur] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const r of seededComplaintRows) if (r.duration) out[r.name] = r.duration;
    return out;
  });
  const [customComplaint, setCustomComplaint] = useState("");

  // HOPI is stored as "<complaint>: (<duration>) <narrative>" — pull the three apart on the way in.
  const seededHopi = useMemo(() => {
    const text: Record<string, string> = {};
    const dur: Record<string, string> = {};
    for (const o of bySection.hopi ?? []) {
      const v = (o.value ?? "").trim();
      const m = v.match(/^([^:]{2,40}):\s*([\s\S]+)$/);
      if (!m) continue;
      const key = m[1].trim();
      let body = m[2].trim();
      const dm = body.match(/^\(([^)]{1,40})\)\s*([\s\S]*)$/);
      if (dm) {
        dur[key] = dm[1].trim();
        body = dm[2].trim();
      }
      text[key] = body;
    }
    return { text, dur };
  }, [bySection]);
  const [hopi, setHopi] = useState<Record<string, string>>(() => seededHopi.text);
  const [hopiDur, setHopiDur] = useState<Record<string, string>>(() => seededHopi.dur);

  const seedHistory = (key: string): { mode: Mode; text: string } => {
    const lines = (bySection[key] ?? []).map((o) => (o.value ?? "").trim()).filter(Boolean);
    if (lines.length === 0) return { mode: "unset", text: "" };
    if (lines.every(readsDenial)) return { mode: "none", text: "" };
    return { mode: "significant", text: lines.join("; ") };
  };
  // Oncology cards. Plain free text seeded from the record — the chips below write into the
  // same string, so a card filled by tapping and a card filled by dictation are the same card.
  const seedText = (key: string) =>
    (bySection[key] ?? []).map((o) => (o.value ?? "").trim()).filter(Boolean).join("; ");
  const [oncoDisease, setOncoDisease] = useState(() => seedText("onco_disease"));
  const [oncoTreatment, setOncoTreatment] = useState(() => seedText("onco_treatment"));
  const [oncoCycle, setOncoCycle] = useState(() => seedText("onco_cycle"));
  const [oncoToxicity, setOncoToxicity] = useState(() => seedText("onco_toxicity"));
  const [performance, setPerformance] = useState(() => seedText("performance"));
  const [oncoNodes, setOncoNodes] = useState(() => examValue(["lymph node survey"]));
  const [oncoMucosaLine, setOncoMucosaLine] = useState(() => examValue(["mucosa, skin and vascular access"]));

  const [past, setPast] = useState(() => seedHistory("past"));
  const [personal, setPersonal] = useState(() => seedHistory("personal"));
  const [family, setFamily] = useState(() => seedHistory("family"));
  const [surgical, setSurgical] = useState(() => seedHistory("surgical"));

  const [medication, setMedication] = useState<{ none: boolean; text: string }>(() => {
    const lines = (bySection.medication ?? []).map((o) => (o.value ?? "").trim()).filter(Boolean);
    if (lines.length === 0) return { none: false, text: "" };
    if (lines.every(readsDenial)) return { none: true, text: "" };
    return { none: false, text: lines.join("\n") };
  });
  /** Add a drug as its own line, name plus a dose/frequency placeholder to fill in — every
   *  chip-picked drug carries the same "dose, frequency" prompt as free-typed lines. */
  function appendMedLine(name: string) {
    if (medication.text.toLowerCase().includes(name.toLowerCase())) return;
    const line = `${name} — dose, frequency`;
    setMedication({ none: false, text: (medication.text ? medication.text.replace(/\n+$/, "") + "\n" : "") + line });
    mark("medication");
  }

  const [obstetric, setObstetric] = useState<string>(() =>
    ((bySection.obstetric ?? [])[0]?.value ?? "").trim()
  );
  const [dietary, setDietary] = useState<string>(() => ((bySection.dietary ?? [])[0]?.value ?? "").trim());
  const [environmental, setEnvironmental] = useState<string>(() =>
    ((bySection.environmental ?? [])[0]?.value ?? "").trim()
  );

  const [piccle, setPiccle] = useState<Record<string, { state: SignState; note: string }>>(() => {
    const out: Record<string, { state: SignState; note: string }> = {};
    for (const s of PICCLE_SIGNS) {
      const v = examValue([s.label]).trim();
      out[s.label] = !v
        ? { state: "unset", note: "" }
        : readsDenial(v) || /^absent|^nil|^normal/i.test(v)
          ? { state: "normal", note: "" }
          : { state: "abnormal", note: v.replace(/^present\s*[—-]\s*/i, "") };
    }
    return out;
  });

  const [vitals, setVitals] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    out.BP = examValue(["bp", "blood pressure"]);
    out.PR = examValue(["pr", "pulse", "pulse rate", "heart rate"]);
    out.RR = examValue(["rr", "respiratory rate"]);
    out.Temp = examValue(["temp", "temperature", "fever"]);
    out.SpO2 = examValue(["spo2", "saturation", "oxygen saturation"]);
    return out;
  });

  const [abdomen, setAbdomen] = useState<string>(() =>
    examValue(["per abdomen", "abdomen", "p/a", "pa"])
  );
  const [chest, setChest] = useState<string>(() => examValue(["chest", "respiratory system", "rs"]));
  const [local, setLocal] = useState<string>(() => examValue(["local examination", "local exam"]));

  const seededDifferentials = useMemo(() => {
    const row = observations.find((o) => o.label.toLowerCase().trim() === "differential diagnosis");
    return (row?.value ?? "")
      .split(/\s*;\s*|\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [observations]);
  const seededNegatives = useMemo(
    () =>
      (
        observations.find((o) => /^(relevant|pertinent) negatives?$/.test(o.label.toLowerCase().trim()))
          ?.value ?? ""
      ).trim(),
    [observations]
  );
  const [diagnosis, setDiagnosis] = useState<{ text: string; differentials: string[]; uncertain: string[] }>({
    text: primaryDiagnosis ?? "",
    differentials: seededDifferentials,
    uncertain: [],
  });
  const [negatives, setNegatives] = useState<{ text: string; uncertain: string[] }>({
    text: seededNegatives,
    uncertain: [],
  });
  const [plan, setPlan] = useState<{ workup: string[]; conservative: string[]; medications: string[]; uncertain: string[] }>({
    workup: [],
    conservative: [],
    medications: [],
    uncertain: [],
  });
  const [planTab, setPlanTab] = useState<"workup" | "conservative" | "medications">("workup");
  /** Which medication-class chip's drug dropdown is open, if any. */
  const [drugPicker, setDrugPicker] = useState<string | null>(null);

  // Carry the medication-history list into the treatment plan automatically — a patient's
  // existing regular medications default to continued in the plan unless the resident removes
  // them there. Tracks what it last copied so an edited history line replaces the stale plan
  // line instead of leaving a duplicate, without touching lines the resident added by hand.
  const syncedMedsRef = useRef<string[]>([]);
  useEffect(() => {
    const lines = medication.none ? [] : medication.text.split("\n").map((s) => s.trim()).filter(Boolean);
    setPlan((p) => {
      const prevSynced = syncedMedsRef.current;
      const kept = p.medications.filter((m) => lines.includes(m) || !prevSynced.includes(m));
      const meds = [...kept, ...lines.filter((l) => !kept.includes(l))];
      return meds.length === p.medications.length && meds.every((m, i) => m === p.medications[i])
        ? p
        : { ...p, medications: meds };
    });
    syncedMedsRef.current = lines;
  }, [medication.text, medication.none]);
  const [compiled, setCompiled] = useState<{ sections: { label: string; text: string }[]; uncertain: string[] } | null>(null);

  // --- steps -------------------------------------------------------------------------

  const complaintList = complaints.length > 0 ? complaints : ["Presenting illness"];
  // The pertinent-negatives card appears the moment a provisional diagnosis exists — the one
  // the "add patient" card sets, or one generated later in this workspace.
  const hasDiagnosisForNegatives = (primaryDiagnosis ?? "").trim().length > 0 || diagnosis.text.trim().length > 0;
  const leads = leadsFor(specialty);
  const leadFirst = (cards: { id: StepId; title: string }[]) => {
    const lead = leads.map((l) => cards.find((c) => c.id === l.key)).filter((c) => !!c);
    return [...lead, ...cards.filter((c) => !lead.includes(c))];
  };
  // The cards whose text a department prompt can write into. Answering a prompt counts as
  // recording something, so a yes/no card flips to "Significant".
  const promptText: Partial<Record<StepId, [string, (v: string) => void]>> = {
    past: [past.text, (v) => setPast({ mode: "significant", text: v })],
    personal: [personal.text, (v) => setPersonal({ mode: "significant", text: v })],
    family: [family.text, (v) => setFamily({ mode: "significant", text: v })],
    environmental: [environmental, setEnvironmental],
    obstetric: [obstetric, setObstetric],
  };

  const STEPS: { id: StepId; title: string }[] = [
    { id: "demographics", title: "Demographics" },
    { id: "complaints", title: "Complaints" },
    ...complaintList.map((c, i) => ({ id: `hopi` as StepId, title: `HOPI — ${c}`, _c: c, _i: i })),
    ...(hasDiagnosisForNegatives ? [{ id: "negatives" as StepId, title: "Relevant negatives" }] : []),
    // The department's lead cards come straight after the presenting illness — an obstetric
    // history is most of an OBG clerking — then the rest in their usual order. Same order the
    // printed sheet uses (lib/case-history-departments.ts).
    ...leadFirst([
      { id: "past", title: "Past history" },
      { id: "personal", title: "Personal history" },
      { id: "family", title: "Family history" },
      { id: "medication", title: "Medication history" },
      { id: "surgical", title: "Surgical history" },
      { id: "dietary", title: "Dietary history" },
      { id: "environmental", title: "Environmental history" },
      ...((sex && /^f/i.test(sex)) || specialty === "obstetrics_gynaecology"
        ? [{ id: "obstetric" as StepId, title: "Menstrual & obstetric" }]
        : []),
      // The disease, then what has been given for it, then what is running now, then what the
      // last cycle did — the order an oncologist actually asks in.
      ...(oncology
        ? [
            { id: "onco_disease" as StepId, title: "Oncological history" },
            { id: "onco_treatment" as StepId, title: "Treatment received" },
            { id: "onco_cycle" as StepId, title: "Current cycle" },
            { id: "onco_toxicity" as StepId, title: "Toxicity since last cycle" },
          ]
        : []),
    ]),
    ...(oncology
      ? [
          { id: "performance" as StepId, title: "Performance status" },
          { id: "onco_nodes" as StepId, title: "Lymph node survey" },
          { id: "onco_mucosa_line" as StepId, title: "Mucosa, skin & line" },
        ]
      : []),
    { id: "piccle", title: "General examination" },
    { id: "vitals", title: "Vitals" },
    { id: "abdomen", title: "Per abdomen" },
    { id: "chest", title: "Chest" },
    { id: "local", title: "Local examination" },
    { id: "diagnosis", title: "Provisional diagnosis" },
    { id: "plan", title: "Plan" },
    { id: "review", title: "Review" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any;

  const current = STEPS[step] as { id: StepId; title: string; _c?: string; _i?: number };
  const mark = (id: StepId) => {
    setDirty((s) => new Set(s).add(id));
    setMessage(null);
  };

  /** Complaints as they are stored: "<name> × <duration>", longest-standing first when every
   *  selected complaint carries a parseable duration; tap order otherwise. */
  function orderedComplaints(): string[] {
    const rows = complaints.map((c) => ({ c, d: (complaintDur[c] ?? "").trim() }));
    const allTimed = rows.length > 0 && rows.every((r) => durationToDays(r.d) !== Number.POSITIVE_INFINITY);
    const sorted = allTimed
      ? [...rows].sort((a, b) => durationToDays(b.d) - durationToDays(a.d))
      : rows;
    return sorted.map((r) => (r.d ? `${r.c} × ${r.d}` : r.c));
  }

  async function persist(id: StepId): Promise<boolean> {
    const L = "history of presenting illness";
    let res: { ok: boolean; error?: string } = { ok: true };
    if (id === "complaints") res = await replaceCaseHistorySection(patientId, "chief complaints", "note", orderedComplaints());
    else if (id === "hopi")
      res = await replaceCaseHistorySection(
        patientId,
        L,
        "note",
        complaintList
          .filter((c) => (hopi[c] ?? "").trim())
          .map((c) => `${c}: ${(hopiDur[c] ?? "").trim() ? `(${hopiDur[c].trim()}) ` : ""}${hopi[c].trim()}`)
      );
    else if (id === "negatives") res = await applyRelevantNegatives(patientId, negatives.text);
    else if (id === "past") res = await replaceCaseHistorySection(patientId, "past history", "note", composeHistory(past));
    else if (id === "personal") res = await replaceCaseHistorySection(patientId, "personal history", "note", composeHistory(personal));
    else if (id === "family") res = await replaceCaseHistorySection(patientId, "family history", "note", composeHistory(family));
    else if (id === "surgical") res = await replaceCaseHistorySection(patientId, "surgical history", "note", composeHistory(surgical));
    else if (id === "medication")
      res = await replaceCaseHistorySection(
        patientId,
        "medication history",
        "note",
        medication.none ? ["None"] : medication.text.split("\n").map((s) => s.trim()).filter(Boolean)
      );
    else if (id === "dietary")
      res = await replaceCaseHistorySection(patientId, "dietary history", "note", dietary.trim() ? [dietary.trim()] : []);
    else if (id === "environmental")
      res = await replaceCaseHistorySection(patientId, "environmental history", "note", environmental.trim() ? [environmental.trim()] : []);
    else if (id === "obstetric")
      res = await replaceCaseHistorySection(patientId, "menstrual and obstetric history", "note", obstetric.trim() ? [obstetric.trim()] : []);
    else if (id === "onco_disease")
      res = await replaceCaseHistorySection(patientId, "oncological history", "note", oneLine(oncoDisease));
    else if (id === "onco_treatment")
      res = await replaceCaseHistorySection(patientId, "treatment received", "note", oneLine(oncoTreatment));
    else if (id === "onco_cycle")
      res = await replaceCaseHistorySection(patientId, "current cycle", "note", oneLine(oncoCycle));
    else if (id === "onco_toxicity")
      res = await replaceCaseHistorySection(patientId, "toxicity since last cycle", "note", oneLine(oncoToxicity));
    else if (id === "performance")
      res = await replaceCaseHistorySection(patientId, "performance status", "note", oneLine(performance));
    else if (id === "onco_nodes")
      res = await replaceCaseHistoryExam(patientId, [{ label: "lymph node survey", kind: "exam", value: oncoNodes.trim() || null }]);
    else if (id === "onco_mucosa_line")
      res = await replaceCaseHistoryExam(patientId, [{ label: "mucosa, skin and vascular access", kind: "exam", value: oncoMucosaLine.trim() || null }]);
    else if (id === "piccle")
      res = await replaceCaseHistoryExam(
        patientId,
        PICCLE_SIGNS.map((s) => ({
          label: s.label,
          kind: "exam" as const,
          value:
            piccle[s.label].state === "unset"
              ? null
              : piccle[s.label].state === "normal"
                ? "Absent"
                : piccle[s.label].note.trim()
                  ? `Present — ${piccle[s.label].note.trim()}`
                  : "Present",
        }))
      );
    else if (id === "vitals")
      res = await replaceCaseHistoryExam(
        patientId,
        VITALS.map((v) => ({ label: v.key, kind: "vital" as const, value: vitals[v.key]?.trim() || null }))
      );
    else if (id === "abdomen")
      res = await replaceCaseHistoryExam(patientId, [{ label: "per abdomen", kind: "exam", value: abdomen.trim() || null }]);
    else if (id === "chest")
      res = await replaceCaseHistoryExam(patientId, [{ label: "chest", kind: "exam", value: chest.trim() || null }]);
    else if (id === "local")
      res = await replaceCaseHistoryExam(patientId, [{ label: "local examination", kind: "exam", value: local.trim() || null }]);

    if (!res.ok) {
      setMessage(res.error ?? "Could not save — your edits are still here.");
      return false;
    }
    setDirty((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    return true;
  }

  function goTo(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    const leaving = current;
    if (dirty.has(leaving.id) && leaving.id !== "review" && leaving.id !== "diagnosis" && leaving.id !== "plan") {
      startTransition(async () => {
        await persist(leaving.id);
        router.refresh();
      });
    }
    setStep(index);
    setMenuOpen(false);
    maybeAutoDraftNegatives(index);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  async function generate(section: "diagnosis" | "plan" | "compile" | "negatives") {
    setGenerating(section);
    setMessage(null);
    try {
      const r = await fetch(`/api/patients/${patientId}/case-history/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          section === "negatives"
            ? { section, diagnosis: diagnosis.text, differentials: diagnosis.differentials }
            : { section }
        ),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage(data.error ?? "Could not generate.");
      } else if (section === "diagnosis") {
        setDiagnosis((d) => ({
          ...d,
          text: String(data.text ?? ""),
          differentials: Array.isArray(data.differentials) ? data.differentials.map(String) : [],
          uncertain: data.uncertainPoints ?? [],
        }));
      } else if (section === "negatives") {
        setNegatives({ text: String(data.text ?? ""), uncertain: data.uncertainPoints ?? [] });
        if (String(data.text ?? "").trim()) mark("negatives");
      } else if (section === "plan") {
        setPlan({
          workup: Array.isArray(data.workup) ? data.workup : [],
          conservative: Array.isArray(data.conservative) ? data.conservative : [],
          medications: Array.isArray(data.medications) ? data.medications : [],
          uncertain: data.uncertainPoints ?? [],
        });
      } else {
        setCompiled({
          sections: Array.isArray(data.sections) ? data.sections : [],
          uncertain: data.uncertainPoints ?? [],
        });
      }
    } catch {
      setMessage("No signal. Try again.");
    }
    setGenerating(null);
  }

  function applyCompiled() {
    if (!compiled) return;
    startTransition(async () => {
      const res = await applyCompiledCaseHistory(patientId, compiled.sections);
      if (!res.ok) {
        setMessage(res.error ?? "Could not apply.");
        return;
      }
      setCompiled(null);
      setMessage("Case history rewritten. Any card can still be edited.");
      router.refresh();
    });
  }

  function approve(section: "diagnosis" | "plan") {
    startTransition(async () => {
      const res =
        section === "diagnosis"
          ? await approveCaseHistoryDiagnosis(patientId, diagnosis.text, diagnosis.differentials)
          : await approveCaseHistoryPlan(patientId, [...plan.workup, ...plan.conservative, ...plan.medications]);
      if (!res.ok) {
        setMessage(res.error ?? "Could not save.");
        return;
      }
      setMessage(
        section === "diagnosis" ? "Diagnosis and differentials saved." : "Plan added to the to-do list."
      );
      router.refresh();
    });
  }

  // Reaching the Review step compiles the tapped/dictated history into proper case-history
  // prose automatically — the resident still reads, edits and applies it. Fires once per visit
  // to Review; the manual "Rewrite" button covers re-runs.
  const autoCompiledFor = useRef<string | null>(null);
  const hasHistory = useMemo(
    () => observations.some((o) => caseHistorySectionOf(o.label)),
    [observations]
  );
  useEffect(() => {
    if (current.id !== "review") return;
    if (compiled || generating || dirty.size > 0 || !hasHistory) return;
    if (autoCompiledFor.current === "done") return;
    autoCompiledFor.current = "done";
    void generate("compile");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, compiled, generating, dirty.size, hasHistory]);

  // Landing on the Relevant-negatives card with a diagnosis and nothing written yet drafts it
  // once (kicked from goTo, not an effect). Manual "Rewrite with AI" covers re-runs.
  const autoNegativesDone = useRef(false);
  function maybeAutoDraftNegatives(index: number) {
    if (STEPS[index]?.id !== "negatives" || autoNegativesDone.current) return;
    if (generating || negatives.text.trim() || !hasDiagnosisForNegatives) return;
    autoNegativesDone.current = true;
    void generate("negatives");
  }

  // --- card bodies ------------------------------------------------------------------

  const toggleInList = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  function historyCard(
    state: { mode: Mode; text: string },
    setState: (s: { mode: Mode; text: string }) => void,
    id: StepId,
    opts?: { chips?: string[]; placeholder?: string; chipPrefix?: string }
  ) {
    // "K/C/O " reads right for a declared medical history ("K/C/O DM"); personal-history chips
    // ("Non-smoker", "Tobacco chewing") are plain statements and take no prefix at all.
    const prefix = opts?.chipPrefix ?? "K/C/O ";
    return (
      <>
        <div className="flex flex-col gap-2">
          <OptionRow selected={state.mode === "none"} onClick={() => { setState({ ...state, mode: "none" }); mark(id); }}>
            No relevant history
          </OptionRow>
          <OptionRow selected={state.mode === "significant"} onClick={() => { setState({ ...state, mode: "significant" }); mark(id); }}>
            Significant — record it
          </OptionRow>
        </div>
        {state.mode === "significant" && (
          <>
            {opts?.chips && (
              <div className="flex flex-wrap gap-1.5">
                {opts.chips.map((c) => (
                  <SelChip
                    key={c}
                    selected={new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(state.text)}
                    onClick={() => {
                      const has = new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(state.text);
                      const text = has
                        ? state.text
                        : (state.text ? `${state.text.replace(/[;\s]+$/, "")}; ` : "") + `${prefix}${c}`;
                      setState({ ...state, text });
                      mark(id);
                    }}
                  >
                    {c}
                  </SelChip>
                ))}
              </div>
            )}
            <DictateArea
              value={state.text}
              onChange={(v) => { setState({ ...state, text: v }); mark(id); }}
              placeholder={opts?.placeholder ?? "Type or speak the detail"}
              rows={3}
            />
          </>
        )}
      </>
    );
  }

  /** The department's questions for a lead card — each a labelled field writing
   *  "<field>: <answer>" into the card's own text, so the text box below shows it too. A table
   *  on the printed sheet is offered here as the shape each line should take. */
  function departmentPrompts(): React.ReactNode {
    const lead = leads.find((l) => l.key === current.id);
    if (!lead?.table) return null;
    const binding = promptText[current.id];
    const { fields, columns, recordedInRows } = lead.table;
    return (
      <div className="flex flex-col gap-2 rounded-[10px] bg-chip/50 p-2.5">
        {fields && binding && (
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <label key={f} className="flex flex-col gap-0.5">
                <span className="text-[12px] font-medium text-muted">{f}</span>
                <input
                  value={readField(binding[0], f)}
                  onChange={(e) => {
                    binding[1](writeField(binding[0], f, e.target.value));
                    mark(current.id);
                  }}
                  className="rounded-[8px] border border-line bg-card px-2 py-1.5 text-[14px]"
                />
              </label>
            ))}
          </div>
        )}
        {columns && recordedInRows && (
          <p className="text-[12px] text-muted">Record each one separately: {columns.join(" · ").replace(" (as recorded)", "")}</p>
        )}
      </div>
    );
  }

  function body(): React.ReactNode {
    const id = current.id;
    if (id === "demographics")
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
          <dt className="text-muted">Name</dt><dd>{demographics.name}</dd>
          <dt className="text-muted">Age</dt><dd>{demographics.age !== null ? `${demographics.age} years` : "Not recorded"}</dd>
          <dt className="text-muted">Sex</dt><dd>{sex || "Not recorded"}</dd>
          <dt className="text-muted">Bed</dt><dd>{demographics.bed || "Not recorded"}</dd>
        </dl>
      );

    if (id === "complaints")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">Tap every complaint the patient came in with. Add anything not listed, then say how long each one has been going on.</p>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set([...complaintChips, ...complaints])].map((c) => (
              <SelChip key={c} selected={complaints.includes(c)} onClick={() => { toggleInList(complaints, c, setComplaints); mark("complaints"); }}>
                {c}
              </SelChip>
            ))}
          </div>
          {complaints.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">How long has each been present?</span>
              {complaints.map((c, i) => (
                <div key={c} className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-auto text-[14px]">{i + 1}. {c}</span>
                  <div className="flex items-center gap-1">
                    {DURATION_QUICK.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => { setComplaintDur({ ...complaintDur, [c]: d }); mark("complaints"); }}
                        className={
                          "rounded-full px-2 py-1 text-[11px] whitespace-nowrap " +
                          ((complaintDur[c] ?? "").trim().toLowerCase() === d
                            ? "bg-accent text-accent-ink"
                            : "bg-chip text-muted")
                        }
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <input
                    value={complaintDur[c] ?? ""}
                    onChange={(e) => { setComplaintDur({ ...complaintDur, [c]: e.target.value }); mark("complaints"); }}
                    placeholder="e.g. 3 days"
                    className="h-9 w-24 shrink-0 rounded-[10px] border border-line bg-card px-2 text-[14px] outline-none focus:border-accent"
                  />
                </div>
              ))}
              <span className="text-[11px] text-muted">Longest-standing complaint is listed first automatically.</span>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={customComplaint}
              onChange={(e) => setCustomComplaint(e.target.value)}
              placeholder="Another complaint"
              className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => {
                const v = customComplaint.trim();
                if (!v) return;
                if (!complaints.includes(v)) setComplaints([...complaints, v]);
                setCustomComplaint("");
                mark("complaints");
              }}
              className="shrink-0 rounded-[10px] border border-line px-3 text-[14px] font-medium text-accent"
            >
              Add
            </button>
          </div>
        </>
      );

    if (id === "hopi") {
      const c = current._c ?? complaintList[0];
      const attrs = hopiAttrsFor(c);
      const set = (v: string) => { setHopi({ ...hopi, [c]: v }); mark("hopi"); };
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            Tap what fits <span className="font-medium">{c}</span> — each tap adds to the line below. Then type or speak anything the pills can&rsquo;t say.
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[13px] font-medium text-muted">Duration</span>
            {DURATION_QUICK.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setHopiDur({ ...hopiDur, [c]: d }); mark("hopi"); }}
                className={
                  "rounded-full px-2 py-1 text-[11px] whitespace-nowrap " +
                  ((hopiDur[c] ?? "").trim().toLowerCase() === d ? "bg-accent text-accent-ink" : "bg-chip text-muted")
                }
              >
                {d}
              </button>
            ))}
            <input
              value={hopiDur[c] ?? ""}
              onChange={(e) => { setHopiDur({ ...hopiDur, [c]: e.target.value }); mark("hopi"); }}
              placeholder="e.g. 3 days"
              className="h-9 w-28 rounded-[10px] border border-line bg-card px-2.5 text-[14px] outline-none focus:border-accent"
            />
          </div>
          {attrs.map((a) => (
            <AttrGroup key={a.label} attr={a} value={hopi[c] ?? ""} onChange={set} />
          ))}
          <DictateArea value={hopi[c] ?? ""} onChange={set} placeholder={`${c} — in the patient's own words`} rows={4} />
        </>
      );
    }

    if (id === "past") return historyCard(past, (s) => setPast(s), "past", { chips: pastChips, placeholder: "e.g. K/C/O DM since 2019, on Metformin" });
    if (id === "personal")
      return historyCard(personal, (s) => setPersonal(s), "personal", {
        chips: PERSONAL_CHIPS,
        chipPrefix: "",
        placeholder: "e.g. non-smoker, occasional alcohol, normal bowel and bladder",
      });
    if (id === "family") return historyCard(family, (s) => setFamily(s), "family", { placeholder: "e.g. Father — carcinoma colon" });
    if (id === "surgical") return historyCard(surgical, (s) => setSurgical(s), "surgical", { placeholder: "e.g. Appendicectomy 2015" });

    if (id === "medication")
      return (
        <>
          <div className="flex flex-col gap-2">
            <OptionRow selected={medication.none} onClick={() => { setMedication({ none: true, text: "" }); mark("medication"); }}>
              Not on any regular medication
            </OptionRow>
            <OptionRow selected={!medication.none} onClick={() => { setMedication({ ...medication, none: false }); mark("medication"); }}>
              On medication — list it
            </OptionRow>
          </div>
          {!medication.none && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {MED_CHIPS.map((c) => (
                  <SelChip
                    key={c}
                    selected={medication.text.toLowerCase().includes(c.toLowerCase())}
                    onClick={() => {
                      if (DRUG_OPTIONS[c]) setDrugPicker((cur) => (cur === c ? null : c));
                      appendMedLine(c);
                    }}
                  >
                    {c}
                  </SelChip>
                ))}
              </div>
              {drugPicker && DRUG_OPTIONS[drugPicker] && (
                <div className="flex flex-col gap-1.5 rounded-[10px] bg-chip/50 p-2.5">
                  <span className="text-[12px] font-medium text-muted">Common {drugPicker} drugs</span>
                  <div className="flex flex-wrap gap-1.5">
                    {DRUG_OPTIONS[drugPicker].map((d) => (
                      <SelChip
                        key={d}
                        selected={medication.text.toLowerCase().includes(d.toLowerCase())}
                        onClick={() => appendMedLine(d)}
                      >
                        {d}
                      </SelChip>
                    ))}
                  </div>
                </div>
              )}
              <DictateArea
                value={medication.text}
                onChange={(v) => { setMedication({ none: false, text: v }); mark("medication"); }}
                placeholder={"One drug per line — name, dose, frequency"}
                rows={4}
              />
            </>
          )}
        </>
      );

    if (id === "dietary")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">What the patient eats: vegetarian or mixed, meals a day, appetite, recent change — only what was said.</p>
          <DictateArea value={dietary} onChange={(v) => { setDietary(v); mark("dietary"); }} placeholder="e.g. mixed diet, three meals a day, appetite reduced for two weeks" rows={4} />
        </>
      );

    if (id === "environmental")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">Housing, water source, sanitation, occupational or travel exposure — only what was said.</p>
          <DictateArea value={environmental} onChange={(v) => { setEnvironmental(v); mark("environmental"); }} placeholder="e.g. borewell water, works in a stone quarry, no recent travel" rows={4} />
        </>
      );

    if (id === "obstetric")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">LMP, cycle, obstetric score (G/P/L/A), menopause — whatever is relevant.</p>
          <DictateArea value={obstetric} onChange={(v) => { setObstetric(v); mark("obstetric"); }} placeholder="e.g. LMP 12/07, regular 28-day cycle, P2L2, not menopausal" rows={4} />
        </>
      );

    if (id === "piccle") {
      const piccleKeys = ["pallor", "icterus", "cyanosis", "clubbing", "lymphadenopathy", "oedema"];
      const allNormal = piccleKeys.every((k) => piccle[k]?.state === "normal");
      const setAllPiccle = (state: SignState) => {
        const next = { ...piccle };
        for (const k of piccleKeys) next[k] = { state, note: "" };
        setPiccle(next);
        mark("piccle");
      };
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            <span className="font-medium">PICCLE</span> — Pallor, Icterus, Cyanosis, Clubbing,
            Lymphadenopathy, (o)Edema. Tap each sign you checked; leave a sign untouched if you
            did not look for it.
          </p>
          <button
            type="button"
            onClick={() => setAllPiccle(allNormal ? "unset" : "normal")}
            className={
              "self-start rounded-[10px] px-3 py-1.5 text-[13px] font-semibold " +
              (allNormal ? "bg-accent text-accent-ink" : "border border-line text-accent")
            }
          >
            {allNormal ? "✓ Normal PICCLE — tap to clear" : "All normal — no PICCLE"}
          </button>
          <div className="flex flex-col gap-2">
            {PICCLE_SIGNS.map((s) => {
              const st = piccle[s.label];
              return (
                <div key={s.label} className="flex flex-col gap-1.5 rounded-[10px] border border-line p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-[14px] font-medium">{s.title}</span>
                    <SelChip selected={st.state === "normal"} onClick={() => { setPiccle({ ...piccle, [s.label]: { ...st, state: st.state === "normal" ? "unset" : "normal" } }); mark("piccle"); }}>
                      Normal
                    </SelChip>
                    <SelChip selected={st.state === "abnormal"} onClick={() => { setPiccle({ ...piccle, [s.label]: { ...st, state: st.state === "abnormal" ? "unset" : "abnormal" } }); mark("piccle"); }}>
                      Present
                    </SelChip>
                  </div>
                  {st.state === "abnormal" && (
                    <input
                      value={st.note}
                      onChange={(e) => { setPiccle({ ...piccle, [s.label]: { ...st, note: e.target.value } }); mark("piccle"); }}
                      placeholder="Detail (e.g. mild, bilateral)"
                      className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] outline-none focus:border-accent"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      );
    }

    if (id === "vitals")
      return (
        <div className="grid grid-cols-2 gap-3">
          {VITALS.map((v) => (
            <Field key={v.key} label={v.label} value={vitals[v.key] ?? ""} onChange={(nv) => { setVitals({ ...vitals, [v.key]: nv }); mark("vitals"); }} placeholder={v.placeholder} />
          ))}
        </div>
      );

    if (id === "abdomen") return <PillsAndText pills={ABDOMEN_PILLS} value={abdomen} onChange={(v) => { setAbdomen(v); mark("abdomen"); }} placeholder="Anything else on the abdomen" />;
    if (id === "chest") return <PillsAndText pills={CHEST_PILLS} value={chest} onChange={(v) => { setChest(v); mark("chest"); }} placeholder="Anything else on the chest" />;

    if (id === "local")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">The examination of the presenting problem itself — the lump, the hernia, the wound, the perianal region.</p>
          <DictateArea value={local} onChange={(v) => { setLocal(v); mark("local"); }} placeholder="Site, size, tenderness, consistency, margins…" rows={6} />
        </>
      );

    if (id === "onco_disease")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            What the cancer IS. Site, what the biopsy showed, the stage, and when it was
            diagnosed — the facts every later decision is read against.
          </p>
          <PillsAndText
            pills={ONCO_DISEASE_PILLS}
            value={oncoDisease}
            onChange={(v) => { setOncoDisease(v); mark("onco_disease"); }}
            placeholder="Primary site, histology and grade, IHC / molecular markers, stage, date of diagnosis"
            rows={5}
          />
        </>
      );

    if (id === "onco_treatment")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            What has already been given for it — surgery, radiotherapy, earlier lines of
            chemotherapy — with how many cycles and what the response was.
          </p>
          <PillsAndText
            pills={ONCO_TREATMENT_PILLS}
            value={oncoTreatment}
            onChange={(v) => { setOncoTreatment(v); mark("onco_treatment"); }}
            placeholder="What was given, how many cycles, when it finished, and the response"
            rows={5}
          />
        </>
      );

    if (id === "onco_cycle")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            The cycle running now, in words. The day count on the ward list is not taken from
            here — it comes from the regimen and cycle start date on the patient record, which
            the pen beside the patient&rsquo;s name sets.
          </p>
          <PillsAndText
            pills={ONCO_CYCLE_PILLS}
            value={oncoCycle}
            onChange={(v) => { setOncoCycle(v); mark("onco_cycle"); }}
            placeholder="Regimen, which cycle, which day, and any dose change with the reason"
            rows={5}
          />
        </>
      );

    if (id === "onco_toxicity")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            What the last cycle did to the patient. Write a grade only if one was actually
            decided — otherwise say what it stopped them doing, which is the more useful record
            anyway.
          </p>
          <PillsAndText
            pills={ONCO_TOXICITY_PILLS}
            value={oncoToxicity}
            onChange={(v) => { setOncoToxicity(v); mark("onco_toxicity"); }}
            placeholder="e.g. mouth ulcers for four days, could not take solids; no fever"
            rows={5}
          />
        </>
      );

    if (id === "performance") {
      const setEcog = (line: string) => {
        // The ECOG line is replaced; anything typed after it is kept. One patient has one
        // performance status, so these are exclusive — but the note beside it is not.
        const rest = performance.replace(/^ECOG\s*\d[^;]*;?\s*/i, "").trim();
        setPerformance(rest ? `${line}; ${rest}` : line);
        mark("performance");
      };
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            Judged from the patient in front of you, not from what they say. It decides
            fitness for the next cycle, so it is worth being honest about.
          </p>
          <div className="flex flex-col gap-2">
            {ECOG_CHOICES.map((c) => (
              <OptionRow
                key={c.line}
                selected={performance.trim().toLowerCase().startsWith(c.line.toLowerCase())}
                onClick={() => setEcog(c.line)}
              >
                {c.label}
              </OptionRow>
            ))}
          </div>
          <DictateArea
            value={performance}
            onChange={(v) => { setPerformance(v); mark("performance"); }}
            placeholder="Weight trend, what they can and cannot do, who is looking after them"
            rows={3}
          />
        </>
      );
    }

    if (id === "onco_nodes")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            Station by station. Tap a station, then what you found there — the tap appends
            &ldquo;Station — finding&rdquo; to the line below, so more than one station can be
            recorded. Size, number and consistency are worth adding in your own words.
          </p>
          <div className="flex flex-col gap-2">
            {NODE_STATIONS.map((station) => (
              <div key={station} className="flex flex-wrap items-center gap-1.5">
                <span className="w-24 shrink-0 text-[13px] font-medium text-muted">{station}</span>
                {NODE_FINDINGS.map((f) => (
                  <SelChip
                    key={f}
                    selected={new RegExp(`${escRe(station)}\\s*—\\s*[^;]*\\b${escRe(f)}\\b`, "i").test(oncoNodes)}
                    onClick={() => {
                      const line = `${station} — ${f}`;
                      setOncoNodes((v) => (v.trim() ? `${v.trim()}; ${line}` : line));
                      mark("onco_nodes");
                    }}
                  >
                    {f}
                  </SelChip>
                ))}
              </div>
            ))}
          </div>
          <DictateArea
            value={oncoNodes}
            onChange={(v) => { setOncoNodes(v); mark("onco_nodes"); }}
            placeholder="Size in cm, number, mobility, matting, tenderness — per station"
            rows={4}
          />
        </>
      );

    if (id === "onco_mucosa_line")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            The mucositis grade decides whether the next cycle can go ahead on schedule. Skin,
            nails and the line site are what a chemotherapy round examines that a surgical round
            does not.
          </p>
          <div className="flex flex-col gap-2">
            {MUCOSITIS_GRADES.map((g) => (
              <OptionRow
                key={g.line}
                selected={oncoMucosaLine.trim().toLowerCase().startsWith(g.line.toLowerCase())}
                onClick={() => {
                  const rest = oncoMucosaLine.replace(/^(No mucositis|Grade \d mucositis)[^;]*;?\s*/i, "").trim();
                  setOncoMucosaLine(rest ? `${g.line}; ${rest}` : g.line);
                  mark("onco_mucosa_line");
                }}
              >
                {g.label}
              </OptionRow>
            ))}
          </div>
          <PillsAndText
            pills={SKIN_LINE_PILLS}
            value={oncoMucosaLine}
            onChange={(v) => { setOncoMucosaLine(v); mark("onco_mucosa_line"); }}
            placeholder="Ulcer site, rash distribution, line site findings"
            rows={4}
          />
        </>
      );

    if (id === "diagnosis")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">The AI drafts a provisional diagnosis from the case history above. Read it, edit it, then approve — approving writes it to the patient.</p>
          <button type="button" disabled={generating === "diagnosis"} onClick={() => generate("diagnosis")} className={genBtn}>
            {generating === "diagnosis" ? "Generating…" : diagnosis.text ? "Regenerate with AI" : "Generate with AI"}
          </button>
          <UncertainList points={diagnosis.uncertain} />
          <Area value={diagnosis.text} onChange={(v) => setDiagnosis({ ...diagnosis, text: v })} rows={3} placeholder="Provisional diagnosis" />

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-muted">Differential diagnosis</span>
            {diagnosis.differentials.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={d}
                  onChange={(e) => setDiagnosis({ ...diagnosis, differentials: diagnosis.differentials.map((x, j) => (j === i ? e.target.value : x)) })}
                  className="h-10 flex-1 rounded-[10px] border border-line bg-card px-3 text-[14px] outline-none focus:border-accent"
                />
                <button type="button" onClick={() => setDiagnosis({ ...diagnosis, differentials: diagnosis.differentials.filter((_, j) => j !== i) })} className="shrink-0 px-2 text-[13px] text-muted">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setDiagnosis({ ...diagnosis, differentials: [...diagnosis.differentials, ""] })} className="self-start text-[13px] font-medium text-accent">
              + Add a differential
            </button>
          </div>

          <p className="text-[11px] leading-[1.4] text-muted">
            The differential feeds the <span className="font-medium">Relevant negatives</span>{" "}
            card near the top of the stack. Regenerate that card after editing this list.
          </p>

          {diagnosis.text.trim() && (
            <button type="button" onClick={() => approve("diagnosis")} disabled={pending} className={approveBtn}>
              Approve — save diagnosis &amp; differentials
            </button>
          )}
        </>
      );

    if (id === "negatives")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            The pertinent negatives that close the history of presenting illness — the ones that
            support{" "}
            <span className="font-medium">{(primaryDiagnosis ?? diagnosis.text ?? "the diagnosis").trim() || "the diagnosis"}</span>{" "}
            and argue against the differentials. One or two sentences, main points only. It
            prints at the end of the HOPI on the case sheet and folds into the discharge summary.
          </p>
          <button type="button" disabled={generating === "negatives"} onClick={() => generate("negatives")} className={genBtn}>
            {generating === "negatives" ? "Writing…" : negatives.text.trim() ? "Rewrite with AI" : "Draft with AI"}
          </button>
          <UncertainList points={negatives.uncertain} />
          <Area
            value={negatives.text}
            onChange={(v) => { setNegatives({ ...negatives, text: v }); mark("negatives"); }}
            rows={4}
            placeholder="e.g. There is no history of fever, weight loss or altered bowel habit, and no previous similar episodes."
          />
        </>
      );

    if (id === "plan") {
      const hasAny = plan.workup.length > 0 || plan.conservative.length > 0 || plan.medications.length > 0;
      const PLAN_TABS: { id: "workup" | "conservative" | "medications"; title: string }[] = [
        { id: "workup", title: "Workup" },
        { id: "conservative", title: "Conservative" },
        { id: "medications", title: "Medications" },
      ];
      const list = plan[planTab];
      const setList = (items: string[]) => setPlan({ ...plan, [planTab]: items });
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">
            The AI drafts an initial plan from the complaints and provisional diagnosis on record — workup, conservative
            measures, and specific medications for this presentation. Edit any line, then approve — approving puts every
            line, across all three, on the to-do list.
          </p>
          <button type="button" disabled={generating === "plan"} onClick={() => generate("plan")} className={genBtn}>
            {generating === "plan" ? "Generating…" : hasAny ? "Regenerate with AI" : "Generate with AI"}
          </button>
          <UncertainList points={plan.uncertain} />
          <div className="flex gap-1.5">
            {PLAN_TABS.map((t) => (
              <SelChip key={t.id} selected={planTab === t.id} onClick={() => setPlanTab(t.id)}>
                {t.title}
                {plan[t.id].length > 0 ? ` (${plan[t.id].length})` : ""}
              </SelChip>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {list.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it}
                  onChange={(e) => setList(list.map((x, j) => (j === i ? e.target.value : x)))}
                  className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
                />
                <button type="button" onClick={() => setList(list.filter((_, j) => j !== i))} className="shrink-0 px-2 text-[13px] text-muted">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setList([...list, ""])} className="self-start text-[13px] font-medium text-accent">
              + Add a line
            </button>
          </div>
          {[...plan.workup, ...plan.conservative, ...plan.medications].some((i) => i.trim()) && (
            <button type="button" onClick={() => approve("plan")} disabled={pending} className={approveBtn}>
              Approve — add to to-do list
            </button>
          )}
        </>
      );
    }

    // review
    const missing: string[] = [];
    if (complaints.length === 0) missing.push("no complaints recorded");
    if (!diagnosis.text.trim() && !primaryDiagnosis) missing.push("no provisional diagnosis");
    return (
      <>
        <span
          className={
            "inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[12px] font-semibold " +
            (missing.length === 0 ? "bg-accent/10 text-accent" : "bg-orange-100 text-orange-700")
          }
        >
          {missing.length === 0 ? (
            <>
              <IconCheck className="h-3.5 w-3.5" /> Nothing outstanding
            </>
          ) : (
            missing.join(" · ")
          )}
        </span>
        <div className="flex flex-col gap-2 rounded-[10px] border border-line bg-card p-3">
          <p className="text-[12px] leading-[1.45] text-muted">
            The AI writes the tapped fragments and dictated bits up into a proper case history —
            in clinical prose, in the usual order and language — using what is already on record
            for this patient. It runs on its own when you reach this step. Read it, edit any
            paragraph, then apply.
          </p>
          <button
            type="button"
            disabled={generating === "compile" || pending}
            onClick={() => generate("compile")}
            className={genBtn}
          >
            {generating === "compile" ? "Writing…" : compiled ? "Rewrite" : "Compile into prose with AI"}
          </button>
          {compiled && (
            <>
              <UncertainList points={compiled.uncertain} />
              {compiled.sections.map((s, i) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{s.label}</span>
                  <Area
                    value={s.text}
                    onChange={(v) =>
                      setCompiled({
                        ...compiled,
                        sections: compiled.sections.map((x, j) => (j === i ? { ...x, text: v } : x)),
                      })
                    }
                    rows={s.label === "history of presenting illness" ? 5 : 2}
                  />
                </div>
              ))}
              <button type="button" onClick={applyCompiled} disabled={pending} className={approveBtn}>
                Apply to case history
              </button>
            </>
          )}
        </div>

        <div className="rounded-[10px] border border-line bg-card">
          <CaseHistoryCard observations={fullObservations} sex={sex} wardRanges={wardRanges} />
        </div>
        {dirty.size > 0 && <p className="text-[13px] text-orange-700">{dirty.size} card(s) not yet saved — step back into them.</p>}

        <Link
          href={`/patients/${patientId}/case-history/print`}
          className="self-start rounded-[10px] border border-line px-3 py-2 text-[14px] font-semibold text-accent"
        >
          Print / save as PDF
        </Link>
        {compiled && (
          <p className="text-[12px] text-orange-700">
            Apply the compiled prose above before printing, or the sheet prints the rough notes.
          </p>
        )}

        <Link href={`/patients/${patientId}`} className="self-start text-[14px] font-semibold text-accent">
          Done — back to patient
        </Link>
      </>
    );
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  const dictationFilled: Record<string, boolean> = {
    complaints: complaints.length > 0,
    hopi: Object.values(hopi).some((t) => (t ?? "").trim()),
    past: past.mode !== "unset",
    family: family.mode !== "unset",
    medication: medication.none || medication.text.trim().length > 0,
    surgical: surgical.mode !== "unset",
    obstetric: obstetric.trim().length > 0,
    dietary: dietary.trim().length > 0,
    environmental: environmental.trim().length > 0,
    examination: PICCLE_SIGNS.some((s) => piccle[s.label].state !== "unset") || VITALS.some((v) => (vitals[v.key] ?? "").trim()),
    abdomen: abdomen.trim().length > 0,
    chest: chest.trim().length > 0,
    local: local.trim().length > 0,
    diagnosis: diagnosis.text.trim().length > 0,
    plan: plan.workup.length > 0 || plan.conservative.length > 0 || plan.medications.length > 0,
  };

  return (
    <div className="flex flex-col gap-3 px-4 pb-40">
      {dictating && (
        <DictationOverlay
          specialty={specialty}
          patientId={patientId}
          initialFilled={dictationFilled}
          initialComplaints={complaints}
          onClose={() => {
            setDictating(false);
            router.refresh();
          }}
        />
      )}

      {liveDictationOn && !dictating && (
        <button
          type="button"
          onClick={() => setDictating(true)}
          className="ios-group flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-chip"
        >
          <span>
            <span className="block text-[15px] font-semibold text-accent">Dictate the whole clerking</span>
            <span className="block text-[13px] text-muted">
              Speak in any order — each part is sorted into its card as you go.
            </span>
          </span>
          <span aria-hidden className="text-xl">🎤</span>
        </button>
      )}

      <div className="ios-group overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.03em] text-muted">
            Case history · {step + 1} of {STEPS.length}
          </p>
          <div className="mt-0.5 flex items-start justify-between gap-2">
            <h2 className="text-[24px] font-bold leading-tight tracking-[-0.021em]">{current.title}</h2>
            {dirty.has(current.id) && statusChip("unsaved", "warn")}
          </div>
        </div>
        <div className="h-[3px] bg-[#e2e2e9]">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">
          {departmentPrompts()}
          {body()}
        </div>
      </div>

      <button type="button" onClick={() => setMenuOpen((o) => !o)} className="self-center text-[13px] font-medium text-accent">
        {menuOpen ? "Hide cards" : "Jump to a card"}
      </button>
      {menuOpen && (
        <div className="ios-group flex flex-col p-1.5">
          {STEPS.map((s, i) => (
            <button
              key={`${s.id}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={"flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[14px] " + (i === step ? "bg-chip font-medium" : "")}
            >
              <span className={"h-2 w-2 shrink-0 rounded-full " + (dirty.has(s.id) ? "bg-orange-500" : "bg-line")} />
              <span className="text-muted">{i + 1}.</span>
              <span className="flex-1">{(s as { title: string }).title}</span>
            </button>
          ))}
        </div>
      )}

      {message && <p className="text-[13px] text-muted">{message}</p>}

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className="rounded-[12px] border border-line px-5 py-3 text-[15px] font-semibold disabled:opacity-40">
            Back
          </button>
          {current.id === "review" ? (
            <Link href={`/patients/${patientId}`} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-center text-[16px] font-semibold text-accent-ink">
              Done
            </Link>
          ) : (
            <button type="button" onClick={() => goTo(step + 1)} className="flex-1 rounded-[12px] bg-accent px-4 py-3 text-[16px] font-semibold text-accent-ink">
              {dirty.has(current.id) ? "Save & next" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** A free-text oncology card's value, as the one line it is stored as. An empty card stores
 *  nothing at all rather than an empty string — absence is shown, never filled. */
function oneLine(text: string): string[] {
  const t = text.trim();
  return t ? [t] : [];
}

function composeHistory(state: { mode: Mode; text: string }): string[] {
  if (state.mode === "none") return ["No relevant history"];
  if (state.mode === "significant") return state.text.trim() ? [state.text.trim()] : [];
  return [];
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** One HOPI attribute — a labelled row of quick pills that append their phrase to the
 *  complaint's free-text line and read as "on" when that phrase is already in it. */
function AttrGroup({
  attr,
  value,
  onChange,
}: {
  attr: HopiAttr;
  value: string;
  onChange: (v: string) => void;
}) {
  const has = (p: string) => value.toLowerCase().includes(p.toLowerCase());
  const drop = (text: string, p: string) =>
    text
      .replace(new RegExp(`\\s*,?\\s*${escRe(p)}`, "i"), "")
      .replace(/^\s*,\s*/, "")
      .replace(/\s{2,}/g, " ")
      .replace(/,\s*,/g, ",")
      .trim();
  const append = (text: string, p: string) =>
    text.trim() ? `${text.trim().replace(/[.,;]\s*$/, "")}, ${p}` : p;

  function toggle(p: string) {
    if (has(p)) return onChange(drop(value, p));
    onChange(append(value, p));
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-muted">{attr.label}</span>
      <div className="flex flex-wrap gap-1.5">
        {attr.options.map((o) => (
          <SelChip key={o} selected={has(o)} onClick={() => toggle(o)}>
            {o}
          </SelChip>
        ))}
      </div>
    </div>
  );
}

