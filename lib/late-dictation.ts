import { SHARED_VITALS, vitalKey, type ProgressNoteConfig } from "@/lib/progress-note-config";
import type { DischargeDraft, DischargeSectionId } from "@/lib/discharge-entities";

/**
 * "Record now, process later" for the live dictation panel (note, discharge, clerking).
 *
 * With no signal the panel records the take into the outbox instead of losing it. When the
 * signal returns the connection bar sends it to /api/entries/late-dictation, which transcribes
 * it and fills the same cards the live panel would have filled — on the server, because by
 * then the screen is usually closed. Anything that does not land cleanly on a card (a drug, a
 * diagnosis, a sentence the sorter could not place) goes to "To check" instead.
 *
 * Pure and client-safe: the live panel and the route share these mappings, so a line is filed
 * the same way whether it was sorted live or an hour later.
 */

export type LateScreen = "note" | "discharge" | "clerking";
export const LATE_SCREENS: readonly LateScreen[] = ["note", "discharge", "clerking"];
export const LATE_LABEL: Record<LateScreen, string> = {
  note: "Note dictation",
  discharge: "Discharge dictation",
  clerking: "Clerking dictation",
};

export type Line = { section: string; text: string };
export type OfferedSection = { key: string; label: string; hint?: string };

/** How a line that did not land on a card is stored: a `note` observation awaiting
 *  confirmation, so it shows in "To check" with this reason beside it. */
export const NOT_PLACED_LABEL = "not placed";
export const NOT_PLACED_NOTE = "Dictated with no signal — put it on the right card";

/** What goes where, for the sections whose label alone is ambiguous to the sorter. */
const HINTS: Record<string, string> = {
  complaints: "fresh complaints and overnight events, in the patient's or doctor's words",
  sensorium: "conscious, oriented, drowsy, GCS",
  "vital:BP": "blood pressure — the value only",
  "vital:PR": "pulse rate — the value only",
  "vital:RR": "respiratory rate — the value only",
  "vital:Temp": "temperature, or afebrile — the value only",
  "vital:SpO2": "oxygen saturation and on what support — the value only",
  "vital:GRBS": "capillary blood sugar — the value only",
  "vital:ICU": "ICU / HDU support: vasopressor, ventilator, HFNC",
  flatus: 'exactly "Passed" or "Not passed"',
  stool: 'exactly "Passed" or "Not passed"',
  assessment: "the doctor's overall impression today: stable, improving, deteriorating",
  plan: "each job, investigation, referral or management step for today — one line each",
  indication: "why the patient was admitted",
  clinicalCourse: "what happened during the stay: surgery, recovery, events",
  condition: "the patient's condition at discharge",
  primaryCareActions: "what the local doctor should do or check after discharge",
  patientActions: "follow-up visits and what the patient must do",
  meds: "each drug the patient is on, with dose, route and frequency — one line each",
  medications: "discharge drugs with dose and frequency — one line each",
  other: "anything else worth recording that fits no other section",
};

/** The sections as the sorter is offered them: key, label and a hint where the label is vague. */
export function offered(sections: { key: string; label: string }[]): OfferedSection[] {
  return sections.map(({ key, label }) => ({
    key,
    label,
    hint: HINTS[key] ?? (key.startsWith("vital:") ? "the value only" : undefined),
  }));
}

/** The progress note's sections — the keys the note workspace offers the live panel. */
export function noteSections(config: ProgressNoteConfig): { key: string; label: string }[] {
  return [
    { key: "complaints", label: "Complaints / overnight" },
    { key: "sensorium", label: "Sensorium" },
    ...[...SHARED_VITALS, ...(config.extraVitals ?? [])].map((v) => ({ key: vitalKey(v.key), label: v.label })),
    ...config.examSections.map((s) => ({ key: s.id, label: s.title })),
    ...(config.bowelLine
      ? [
          { key: "flatus", label: "Flatus" },
          { key: "stool", label: "Stool" },
        ]
      : []),
    { key: "assessment", label: "Assessment" },
    { key: "plan", label: "Plan" },
    { key: "meds", label: "Medications" },
  ];
}

export type NoteRow = { kind: "note" | "exam" | "vital" | "plan"; label: string; text: string; amber: boolean };

/**
 * Sorted lines → the observations today's note reads, stored the way each card stores its line
 * (app/patients/[id]/note/actions.ts). Any number stays amber; a vital always does, as when
 * dictated live. Medications are a standing list the card rewrites whole, so a dictated drug is
 * not appended to it unseen: it goes to "To check" with anything else that did not map.
 */
export function noteRows(lines: Line[], config: ProgressNoteConfig): { rows: NoteRow[]; unplaced: string[] } {
  const vitals = [...SHARED_VITALS, ...(config.extraVitals ?? [])];
  const rows: NoteRow[] = [];
  const unplaced: string[] = [];
  for (const { section: k, text } of lines) {
    const amber = /\d/.test(text);
    const vital = vitals.find((v) => vitalKey(v.key) === k);
    const exam = config.examSections.find((s) => s.id === k);
    if (k === "complaints" || k === "assessment") rows.push({ kind: "note", label: k, text, amber });
    else if (k === "sensorium") rows.push({ kind: "exam", label: "sensorium", text, amber });
    else if (vital) rows.push({ kind: "vital", label: vital.key, text, amber: true });
    else if (exam) rows.push({ kind: "exam", label: exam.label, text, amber });
    else if ((k === "flatus" || k === "stool") && config.bowelLine && /^(not )?passed\.?$/i.test(text))
      rows.push({ kind: "exam", label: k, text: /^not/i.test(text) ? "Not passed" : "Passed", amber: false });
    else if (k === "plan") rows.push({ kind: "plan", label: "plan", text, amber });
    else unplaced.push(text);
  }
  return { rows, unplaced };
}

/** The discharge summary's sections — the keys the discharge workspace offers the live panel.
 *  `held` ones are sorted but placed by the resident: drugs, the diagnosis, anything else. */
export const DISCHARGE_LIVE_SECTIONS: { key: string; label: string; held?: boolean; drug?: boolean }[] = [
  { key: "indication", label: "Indication for admission" },
  { key: "diagnoses", label: "Diagnosis", held: true },
  { key: "clinicalCourse", label: "Clinical course" },
  { key: "medications", label: "Discharge medications", held: true, drug: true },
  { key: "condition", label: "Condition at discharge" },
  { key: "primaryCareActions", label: "For the local doctor" },
  { key: "patientActions", label: "Follow-up" },
  { key: "other", label: "Other — place by hand", held: true },
];

/**
 * Sorted lines → the discharge draft, the same way the workspace drops them in while live.
 * An AI-written section a line is added to loses its approval, exactly as when typed.
 */
export function applyDischargeLines(
  draft: DischargeDraft,
  lines: Line[]
): { draft: DischargeDraft; touched: DischargeSectionId[]; unplaced: string[] } {
  const add = (prev: string, t: string) => (prev.trim() ? `${prev.trim()} ${t}` : t);
  const touched = new Set<DischargeSectionId>();
  const unplaced: string[] = [];
  let n = draft;
  for (const { section, text } of lines) {
    if (section === "indication") {
      n = { ...n, indicationForAdmission: { ...n.indicationForAdmission, text: add(n.indicationForAdmission.text, text), source: "resident", approvedAt: null, approvedBy: null } };
      touched.add("indication");
    } else if (section === "clinicalCourse") {
      n = { ...n, clinicalCourse: { ...n.clinicalCourse, text: add(n.clinicalCourse.text, text), source: "resident", approvedAt: null, approvedBy: null } };
      touched.add("clinicalCourse");
    } else if (section === "condition") {
      n = { ...n, conditionAtDischarge: { ...n.conditionAtDischarge, freeText: add(n.conditionAtDischarge.freeText ?? "", text) } };
      touched.add("conditionAtDischarge");
    } else if (section === "primaryCareActions" || section === "patientActions") {
      n = { ...n, [section]: [...n[section], text] };
      touched.add(section);
    } else unplaced.push(text);
  }
  return { draft: n, touched: [...touched], unplaced };
}

/** The draft field each touched section is stored from. */
export const DISCHARGE_DRAFT_KEY: Partial<Record<DischargeSectionId, keyof DischargeDraft>> = {
  indication: "indicationForAdmission",
  clinicalCourse: "clinicalCourse",
  conditionAtDischarge: "conditionAtDischarge",
  primaryCareActions: "primaryCareActions",
  patientActions: "patientActions",
};

/**
 * A long take split at sentence ends into pieces about the size of one spoken pause — what the
 * sorter is built for. A single sentence longer than `max` is kept whole, never cut mid-word.
 */
export function chunks(text: string, max = 500): string[] {
  const out: string[] = [];
  let cur = "";
  for (const s of text.split(/(?<=[.?!])\s+/).map((x) => x.trim()).filter(Boolean)) {
    if (cur && cur.length + 1 + s.length > max) {
      out.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  return out;
}

/** "10:42" in ward time — what the bar and the timeline print. */
export const wardTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });

/** A recording time the phone sent, trusted only within reason: never in the future (a wrong
 *  clock), never older than a week (a lost phone found later is a new conversation). */
export function recordedAtFrom(raw: unknown, now = Date.now()): string {
  const t = Date.parse(String(raw ?? ""));
  if (!Number.isFinite(t) || t > now || t < now - 7 * 864e5) return new Date(now).toISOString();
  return new Date(t).toISOString();
}
