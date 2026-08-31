"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { caseHistorySectionOf } from "@/lib/case-history";
import type { Observation } from "@/lib/patient-state";
import type { WardRanges } from "@/lib/exam-summary";
import { CaseHistoryCard } from "../case-history-card";
import { Field, Area } from "../discharge/discharge-fields";
import { IconCheck, SelChip, OptionRow, statusChip, genBtn, approveBtn } from "../card-kit";
import {
  replaceCaseHistorySection,
  replaceCaseHistoryExam,
  approveCaseHistoryDiagnosis,
  approveCaseHistoryPlan,
} from "./actions";

export type WorkspaceObs = { id: string; kind: string; label: string; value: string | null };

// --- the clerking, card by card ----------------------------------------------------------

const COMPLAINT_CHIPS = [
  "Pain abdomen",
  "Vomiting",
  "Fever",
  "Jaundice",
  "Lump",
  "Abdominal distension",
  "Constipation",
  "Loose stools",
  "Bleeding per rectum",
  "Burning micturition",
  "Loss of appetite",
  "Loss of weight",
];

const PAST_CHIPS = ["DM", "HTN", "TB (Koch's)", "IHD", "Asthma / COPD", "Thyroid", "Seizure", "CKD"];

const MED_CHIPS = [
  "Antihypertensive",
  "Oral hypoglycaemic",
  "Insulin",
  "Antiplatelet",
  "Anticoagulant",
  "Steroid",
  "Inhaler",
  "Thyroxine",
];

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
type HopiAttr = { label: string; options: string[]; multi?: boolean };

const GENERIC_HOPI: HopiAttr[] = [
  { label: "Onset", options: ["Sudden", "Gradual"] },
  { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
  { label: "Progression", options: ["Improving", "Static", "Worsening"] },
  { label: "Severity", options: ["Mild", "Moderate", "Severe"] },
  { label: "Timing", options: ["Constant", "Intermittent", "Worse at night", "After food"] },
];

const SYMPTOM_TEMPLATES: { match: RegExp; attrs: HopiAttr[] }[] = [
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
      { label: "Aggravated by", options: ["Movement", "Food", "Fatty food", "Coughing", "Deep breath"], multi: true },
      { label: "Relieved by", options: ["Rest", "Vomiting", "Leaning forward", "Antacids", "Passing stool / flatus"], multi: true },
      { label: "Associated with", options: ["Vomiting", "Fever", "Distension", "Constipation", "Loose stools", "Anorexia", "Jaundice", "Dysuria", "Haematuria"], multi: true },
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
      { label: "Associated with", options: ["Pain abdomen", "Distension", "Constipation", "Obstipation", "Fever", "Weight loss"], multi: true },
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
      { label: "Associated with", options: ["Night sweats", "Weight loss", "Cough", "Dysuria", "Pain abdomen", "Loose stools", "Rash"], multi: true },
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
      { label: "Associated with", options: ["Fever", "Weight loss", "Anorexia", "Vomiting", "Abdominal lump"], multi: true },
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
      { label: "Associated with", options: ["Pain abdomen", "Vomiting", "Constipation", "Skin changes", "Other lumps", "Weight loss"], multi: true },
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
      { label: "Associated with", options: ["Pain abdomen", "Vomiting", "Constipation", "Breathlessness", "Visible peristalsis"], multi: true },
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
      { label: "Associated with", options: ["Pain abdomen", "Distension", "Tenesmus", "Weight loss", "Anorexia"], multi: true },
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
      { label: "Associated with", options: ["Fever", "Pain abdomen", "Vomiting", "Dehydration", "Weight loss"], multi: true },
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
      { label: "Associated with", options: ["Mucus", "Mass / prolapse", "Change in bowel habit", "Weight loss", "Pallor / giddiness"], multi: true },
    ],
  },
  {
    match: /burning micturition|dysuria|urin/i,
    attrs: [
      { label: "Onset", options: ["Sudden", "Gradual"] },
      { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
      { label: "Voiding", options: ["Increased frequency", "Urgency", "Poor stream", "Incomplete emptying", "Terminal dribbling"], multi: true },
      { label: "Urine", options: ["Haematuria", "Cloudy / turbid", "Foul-smelling", "Clear"] },
      { label: "Pain site", options: ["Suprapubic", "Loin", "Urethral"] },
      { label: "Associated with", options: ["Fever", "Rigors", "Loin pain", "Nausea / vomiting"], multi: true },
    ],
  },
  {
    match: /appetite/i,
    attrs: [
      { label: "Duration", options: ["<1 month", "1–3 months", ">3 months"] },
      { label: "Severity", options: ["Mild", "Marked", "Aversion to food"] },
      { label: "Progression", options: ["Improving", "Static", "Worsening"] },
      { label: "Associated with", options: ["Weight loss", "Nausea", "Early satiety", "Pain abdomen", "Altered taste"], multi: true },
    ],
  },
  {
    match: /weight/i,
    attrs: [
      { label: "Amount", options: ["2–5 kg", "5–10 kg", ">10 kg", "Not quantified"] },
      { label: "Over", options: ["<1 month", "1–3 months", "3–6 months", ">6 months"] },
      { label: "Appetite", options: ["Preserved", "Reduced"] },
      { label: "Associated with", options: ["Fever", "Night sweats", "Cough", "Bowel change", "Lump", "Anorexia"], multi: true },
    ],
  },
];

function hopiAttrsFor(complaint: string): HopiAttr[] {
  return SYMPTOM_TEMPLATES.find((t) => t.match.test(complaint))?.attrs ?? GENERIC_HOPI;
}

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
  | "complaints"
  | "hopi"
  | "past"
  | "family"
  | "medication"
  | "surgical"
  | "obstetric"
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
  primaryDiagnosis,
  observations,
  fullObservations,
  rangeEntries,
}: {
  patientId: string;
  sex: string | null;
  primaryDiagnosis: string | null;
  observations: WorkspaceObs[];
  fullObservations: Observation[];
  rangeEntries: [string, { low: number | null; high: number | null; text: string | null }][];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
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

  const seededComplaints = useMemo(
    () => (bySection.chief ?? []).map((o) => (o.value ?? "").trim()).filter(Boolean),
    [bySection]
  );
  const [complaints, setComplaints] = useState<string[]>(seededComplaints);
  const [customComplaint, setCustomComplaint] = useState("");

  const [hopi, setHopi] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const o of bySection.hopi ?? []) {
      const v = (o.value ?? "").trim();
      const m = v.match(/^([^:]{2,40}):\s*([\s\S]+)$/);
      if (m) out[m[1].trim()] = m[2].trim();
    }
    return out;
  });

  const seedHistory = (key: string): { mode: Mode; text: string } => {
    const lines = (bySection[key] ?? []).map((o) => (o.value ?? "").trim()).filter(Boolean);
    if (lines.length === 0) return { mode: "unset", text: "" };
    if (lines.every(readsDenial)) return { mode: "none", text: "" };
    return { mode: "significant", text: lines.join("; ") };
  };
  const [past, setPast] = useState(() => seedHistory("past"));
  const [family, setFamily] = useState(() => seedHistory("family"));
  const [surgical, setSurgical] = useState(() => seedHistory("surgical"));

  const [medication, setMedication] = useState<{ none: boolean; text: string }>(() => {
    const lines = (bySection.medication ?? []).map((o) => (o.value ?? "").trim()).filter(Boolean);
    if (lines.length === 0) return { none: false, text: "" };
    if (lines.every(readsDenial)) return { none: true, text: "" };
    return { none: false, text: lines.join("\n") };
  });

  const [obstetric, setObstetric] = useState<string>(() =>
    ((bySection.obstetric ?? [])[0]?.value ?? "").trim()
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

  const [diagnosis, setDiagnosis] = useState<{ text: string; uncertain: string[] }>({
    text: primaryDiagnosis ?? "",
    uncertain: [],
  });
  const [plan, setPlan] = useState<{ items: string[]; uncertain: string[] }>({ items: [], uncertain: [] });

  // --- steps -------------------------------------------------------------------------

  const complaintList = complaints.length > 0 ? complaints : ["Presenting illness"];
  const STEPS: { id: StepId; title: string }[] = [
    { id: "complaints", title: "Complaints" },
    ...complaintList.map((c, i) => ({ id: `hopi` as StepId, title: `HOPI — ${c}`, _c: c, _i: i })),
    { id: "past", title: "Past history" },
    { id: "family", title: "Family history" },
    { id: "medication", title: "Medication history" },
    { id: "surgical", title: "Surgical history" },
    ...(sex && /^f/i.test(sex) ? [{ id: "obstetric" as StepId, title: "Menstrual & obstetric" }] : []),
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

  async function persist(id: StepId): Promise<boolean> {
    const L = "history of presenting illness";
    let res: { ok: boolean; error?: string } = { ok: true };
    if (id === "complaints") res = await replaceCaseHistorySection(patientId, "chief complaints", "note", complaints);
    else if (id === "hopi")
      res = await replaceCaseHistorySection(
        patientId,
        L,
        "note",
        complaintList.filter((c) => (hopi[c] ?? "").trim()).map((c) => `${c}: ${hopi[c].trim()}`)
      );
    else if (id === "past") res = await replaceCaseHistorySection(patientId, "past history", "note", composeHistory(past));
    else if (id === "family") res = await replaceCaseHistorySection(patientId, "family history", "note", composeHistory(family));
    else if (id === "surgical") res = await replaceCaseHistorySection(patientId, "surgical history", "note", composeHistory(surgical));
    else if (id === "medication")
      res = await replaceCaseHistorySection(
        patientId,
        "medication history",
        "note",
        medication.none ? ["None"] : medication.text.split("\n").map((s) => s.trim()).filter(Boolean)
      );
    else if (id === "obstetric")
      res = await replaceCaseHistorySection(patientId, "menstrual and obstetric history", "note", obstetric.trim() ? [obstetric.trim()] : []);
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
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  async function generate(section: "diagnosis" | "plan") {
    setGenerating(section);
    setMessage(null);
    try {
      const r = await fetch(`/api/patients/${patientId}/case-history/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage(data.error ?? "Could not generate.");
      } else if (section === "diagnosis") {
        setDiagnosis({ text: String(data.text ?? ""), uncertain: data.uncertainPoints ?? [] });
      } else {
        setPlan({ items: Array.isArray(data.items) ? data.items : [], uncertain: data.uncertainPoints ?? [] });
      }
    } catch {
      setMessage("No signal. Try again.");
    }
    setGenerating(null);
  }

  function approve(section: "diagnosis" | "plan") {
    startTransition(async () => {
      const res =
        section === "diagnosis"
          ? await approveCaseHistoryDiagnosis(patientId, diagnosis.text)
          : await approveCaseHistoryPlan(patientId, plan.items);
      if (!res.ok) {
        setMessage(res.error ?? "Could not save.");
        return;
      }
      setMessage(section === "diagnosis" ? "Diagnosis saved to the patient." : "Plan added to the to-do list.");
      router.refresh();
    });
  }

  // --- card bodies ------------------------------------------------------------------

  const toggleInList = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  function historyCard(
    state: { mode: Mode; text: string },
    setState: (s: { mode: Mode; text: string }) => void,
    id: StepId,
    opts?: { chips?: string[]; placeholder?: string }
  ) {
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
                        : (state.text ? `${state.text.replace(/[;\s]+$/, "")}; ` : "") + `K/C/O ${c}`;
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

  function body(): React.ReactNode {
    const id = current.id;
    if (id === "complaints")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">Tap every complaint the patient came in with. Add anything not listed.</p>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set([...COMPLAINT_CHIPS, ...complaints])].map((c) => (
              <SelChip key={c} selected={complaints.includes(c)} onClick={() => { toggleInList(complaints, c, setComplaints); mark("complaints"); }}>
                {c}
              </SelChip>
            ))}
          </div>
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
          {attrs.map((a) => (
            <AttrGroup key={a.label} attr={a} value={hopi[c] ?? ""} onChange={set} />
          ))}
          <DictateArea value={hopi[c] ?? ""} onChange={set} placeholder={`${c} — in the patient's own words`} rows={4} />
        </>
      );
    }

    if (id === "past") return historyCard(past, (s) => setPast(s), "past", { chips: PAST_CHIPS, placeholder: "e.g. K/C/O DM since 2019, on Metformin" });
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
                      if (medication.text.toLowerCase().includes(c.toLowerCase())) return;
                      setMedication({ none: false, text: (medication.text ? medication.text.replace(/\n+$/, "") + "\n" : "") + c });
                      mark("medication");
                    }}
                  >
                    {c}
                  </SelChip>
                ))}
              </div>
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

    if (id === "obstetric")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">LMP, cycle, obstetric score (G/P/L/A), menopause — whatever is relevant.</p>
          <DictateArea value={obstetric} onChange={(v) => { setObstetric(v); mark("obstetric"); }} placeholder="e.g. LMP 12/07, regular 28-day cycle, P2L2, not menopausal" rows={4} />
        </>
      );

    if (id === "piccle")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">Tap each sign you checked. Leave a sign untouched if you did not look for it.</p>
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

    if (id === "diagnosis")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">The AI drafts a provisional diagnosis from the clerking above. Read it, edit it, then approve — approving writes it to the patient.</p>
          <button type="button" disabled={generating === "diagnosis"} onClick={() => generate("diagnosis")} className={genBtn}>
            {generating === "diagnosis" ? "Generating…" : diagnosis.text ? "Regenerate with AI" : "Generate with AI"}
          </button>
          <UncertainList points={diagnosis.uncertain} />
          <Area value={diagnosis.text} onChange={(v) => setDiagnosis({ ...diagnosis, text: v })} rows={3} placeholder="Provisional diagnosis" />
          {diagnosis.text.trim() && (
            <button type="button" onClick={() => approve("diagnosis")} disabled={pending} className={approveBtn}>
              Approve — save to patient
            </button>
          )}
        </>
      );

    if (id === "plan")
      return (
        <>
          <p className="text-[12px] leading-[1.45] text-muted">The AI drafts an initial plan. Edit the list, then approve — approving puts each line on the to-do list.</p>
          <button type="button" disabled={generating === "plan"} onClick={() => generate("plan")} className={genBtn}>
            {generating === "plan" ? "Generating…" : plan.items.length ? "Regenerate with AI" : "Generate with AI"}
          </button>
          <UncertainList points={plan.uncertain} />
          <div className="flex flex-col gap-2">
            {plan.items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it}
                  onChange={(e) => setPlan({ ...plan, items: plan.items.map((x, j) => (j === i ? e.target.value : x)) })}
                  className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
                />
                <button type="button" onClick={() => setPlan({ ...plan, items: plan.items.filter((_, j) => j !== i) })} className="shrink-0 px-2 text-[13px] text-muted">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setPlan({ ...plan, items: [...plan.items, ""] })} className="self-start text-[13px] font-medium text-accent">
              + Add a line
            </button>
          </div>
          {plan.items.some((i) => i.trim()) && (
            <button type="button" onClick={() => approve("plan")} disabled={pending} className={approveBtn}>
              Approve — add to to-do list
            </button>
          )}
        </>
      );

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
        <div className="rounded-[10px] border border-line bg-card">
          <CaseHistoryCard observations={fullObservations} sex={sex} wardRanges={wardRanges} />
        </div>
        {dirty.size > 0 && <p className="text-[13px] text-orange-700">{dirty.size} card(s) not yet saved — step back into them.</p>}
        <Link href={`/patients/${patientId}`} className="self-start text-[14px] font-semibold text-accent">
          Done — back to patient
        </Link>
      </>
    );
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-3 px-4 pb-40">
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
        <div className="flex flex-col gap-3 px-4 py-4">{body()}</div>
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

function composeHistory(state: { mode: Mode; text: string }): string[] {
  if (state.mode === "none") return ["No relevant history"];
  if (state.mode === "significant") return state.text.trim() ? [state.text.trim()] : [];
  return [];
}

function UncertainList({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <div className="rounded-[10px] bg-orange-50 p-2.5 text-[13px] text-orange-800">
      <p className="font-medium">The AI could not resolve these — check them:</p>
      <ul className="mt-1 list-disc pl-4">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

/** The container/codec MediaRecorder actually produces varies by browser — Safari/iOS gives
 *  mp4, Chrome/Android gives webm/opus. The transcriber picks its decoder from the file
 *  extension, so the real type has to be carried through, not assumed. Same list the round
 *  recorder uses (app/patients/[id]/recorder.tsx). */
const REC_MIME =
  ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"].find(
    (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
  ) ?? "";

function extFor(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

/** A textarea with a tap-to-record button that appends a transcript from /api/transcribe.
 *  Tap to start, tap to stop — a press-and-hold cannot host getUserMedia's permission prompt. */
function DictateArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [status, setStatus] = useState<"idle" | "recording" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // The latest value, so an append that lands after the resident has typed more does not
  // clobber it with a stale closure.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  async function start() {
    if (status !== "idle") return;
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone blocked — allow it for this site in your browser settings.");
      return;
    }
    const rec = new MediaRecorder(stream, REC_MIME ? { mimeType: REC_MIME } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const mime = rec.mimeType || REC_MIME || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 1200) {
        setStatus("idle");
        setError("Nothing was recorded — hold on a moment longer before stopping.");
        return;
      }
      setStatus("working");
      const form = new FormData();
      form.append("audio", blob, `note.${extFor(mime)}`);
      try {
        const r = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = await r.json();
        if (!r.ok || !data.text) {
          setError(data.error ?? "Could not transcribe that — try again.");
        } else {
          const prev = valueRef.current.trim();
          onChange(prev ? `${prev} ${data.text}` : data.text);
        }
      } catch {
        setError("No connection — the audio was not sent.");
      }
      setStatus("idle");
    };
    mediaRef.current = rec;
    rec.start();
    setStatus("recording");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] border border-line bg-card px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-accent"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={status === "recording" ? () => mediaRef.current?.stop() : start}
          disabled={status === "working"}
          className={
            "self-start rounded-[10px] px-3 py-1.5 text-[13px] font-medium " +
            (status === "recording" ? "bg-red-500 text-white" : "border border-line text-accent")
          }
        >
          {status === "recording" ? "■ Stop" : status === "working" ? "Transcribing…" : "🎤 Speak"}
        </button>
        {error && <span className="text-[12px] text-red-600">{error}</span>}
      </div>
    </div>
  );
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
    let t = value;
    if (!attr.multi) for (const o of attr.options) if (o !== p && has(o)) t = drop(t, o);
    onChange(append(t, p));
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

function PillsAndText({
  pills,
  value,
  onChange,
  placeholder,
}: {
  pills: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  // The pills prepend a phrase; the text carries anything they cannot say. On load the value is
  // just free text, so a pill reads as "on" when its phrase already appears in it.
  const has = (p: string) => new RegExp(`(^|,\\s*)${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(value);
  const toggle = (p: string) => {
    if (has(p)) {
      onChange(
        value
          .replace(new RegExp(`(^|,\\s*)${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "")
          .replace(/^,\s*/, "")
          .trim()
      );
    } else {
      onChange(value.trim() ? `${value.trim()}, ${p}` : p);
    }
  };
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {pills.map((p) => (
          <SelChip key={p} selected={has(p)} onClick={() => toggle(p)}>
            {p}
          </SelChip>
        ))}
      </div>
      <DictateArea value={value} onChange={onChange} placeholder={placeholder} rows={3} />
    </>
  );
}
