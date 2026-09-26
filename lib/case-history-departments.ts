/**
 * The history cards each department leads with, and what it asks inside them.
 *
 * Read by the case-history workspace (card order, and a labelled field per prompt) and by the
 * printed history sheet (a boxed block with the same prompts and a table to complete by hand),
 * so the clerking and the paper ask the same questions in the same order.
 *
 * A prompt is a question, never a value. A field the resident fills is stored inside the card's
 * own free text as "<field>: <answer>" — the same one string the chips and dictation write — so
 * nothing here needs a column of its own and nothing is ever filled in by the app.
 * No dependencies beyond types — safe to import from client components.
 */
import type { HistorySection } from "@/lib/case-history";
import type { SpecialtyKey } from "@/lib/specialty/types";

type LeadTable = {
  /** Labelled prompts: a field in the workspace, a blank on paper. */
  fields?: string[];
  /** A grid on paper to complete by hand. */
  columns?: string[];
  rows?: number;
  /** Each recorded line takes the first column of its own row (one operation, one drug);
   *  otherwise the recorded lines print above the table as they were stored. */
  recordedInRows?: boolean;
};
export type Lead = {
  key: HistorySection["key"];
  /** Paper only: take the large block only when something was recorded. The workspace still
   *  asks the card early — a previous operation is what a surgeon asks about first. */
  ifRecorded?: boolean;
  table?: LeadTable;
};

const ONCO_HISTORY = ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity"] as const;

const SURGICAL: Lead = {
  key: "surgical",
  ifRecorded: true,
  table: { columns: ["Procedure (as recorded)", "Year", "Hospital", "Anaesthesia / complications"], rows: 2, recordedInRows: true },
};

const DEPARTMENT_LEAD: Record<SpecialtyKey, Lead[]> = {
  general_surgery: [SURGICAL],
  burns_plastic_surgery: [SURGICAL],
  ent: [SURGICAL],
  ophthalmology: [SURGICAL],
  obstetrics_gynaecology: [
    {
      key: "obstetric",
      table: {
        fields: ["Menarche", "Cycles", "LMP", "EDD", "Obstetric score (G P L A)", "Contraception"],
        columns: ["Pregnancy / year", "Mode of delivery", "Outcome", "Complications"],
        rows: 3,
      },
    },
    SURGICAL,
  ],
  medical_oncology: ONCO_HISTORY.map((key) => ({ key })),
  internal_medicine: [
    {
      key: "past",
      table: { columns: ["Condition (as recorded)", "Since", "Treatment", "Control / complications"], rows: 3, recordedInRows: true },
    },
    {
      key: "medication",
      table: { columns: ["Drug (as recorded)", "Dose & frequency", "Since", "Compliance"], rows: 3, recordedInRows: true },
    },
  ],
  pulmonary_medicine: [
    {
      key: "past",
      table: { fields: ["H/o TB / ATT", "Asthma / COPD", "Previous admissions / ventilation", "Vaccination (influenza / pneumococcal)"] },
    },
    { key: "personal", table: { fields: ["Smoking — pack-years", "Quit (year)", "Biomass / chulha exposure", "Alcohol"] } },
    { key: "environmental", table: { fields: ["Occupation", "Dust / fumes / silica", "Pets / birds", "Housing / ventilation"] } },
  ],
  psychiatry: [
    {
      key: "personal",
      table: {
        fields: ["Premorbid personality", "Past psychiatric history", "Sleep / appetite", "Forensic history"],
        columns: ["Substance", "Age at onset", "Quantity / pattern", "Last use"],
        rows: 3,
      },
    },
    { key: "family", table: { fields: ["Psychiatric illness", "Substance use", "Suicide"] } },
  ],
  // Pending clinician review.
  orthopaedics: [
    {
      key: "surgical",
      ifRecorded: true,
      table: { columns: ["Fracture / procedure (as recorded)", "Year", "Implant", "Complications"], rows: 2, recordedInRows: true },
    },
    { key: "personal", table: { fields: ["Occupation", "Handedness", "Activity level / sport", "Smoking"] } },
  ],
  urology: [
    SURGICAL,
    { key: "past", table: { fields: ["Renal / ureteric stones", "Previous catheterisation", "Recurrent UTI", "DM / CKD"] } },
  ],
  neurosurgery: [
    SURGICAL,
    { key: "past", table: { fields: ["Seizures", "Previous head injury", "Hypertension", "Anticoagulants / antiplatelets"] } },
  ],
  // No birth, developmental or immunisation card exists yet, so a child's history asks them
  // inside personal history — the card a paediatric clerking already fills first.
  paediatrics: [
    {
      key: "personal",
      table: { fields: ["Birth history (term / preterm, weight)", "Feeding history", "Developmental milestones", "Immunisation"] },
    },
    { key: "family", table: { fields: ["Consanguinity", "Similar illness in family", "Siblings"] } },
  ],
  // AMPLE, less the parts other cards already carry; the event is asked on the HOPI card.
  // Pending clinician review.
  emergency_medicine: [
    { key: "hopi", table: { fields: ["Time of injury / onset", "Mechanism of injury"] } },
    { key: "past", table: { fields: ["Allergies", "Last meal (time)", "Tetanus immunisation", "Anticoagulants / antiplatelets"] } },
  ],
  dermatology: [
    {
      key: "medication",
      table: { columns: ["Drug (as recorded)", "Started", "Reaction / eruption"], rows: 3, recordedInRows: true },
    },
    { key: "family", table: { fields: ["Atopy (asthma / eczema / rhinitis)", "Psoriasis", "Similar lesions in contacts"] } },
    { key: "environmental", table: { fields: ["Occupation", "Contact exposures (cement, dyes, plants)", "Sun exposure"] } },
  ],
};

/** The lead cards for a unit, in order. An unknown department leads with nothing. */
export function leadsFor(specialty: string | null | undefined): Lead[] {
  return DEPARTMENT_LEAD[(specialty ?? "") as SpecialtyKey] ?? [];
}

// A card's text is "; "-separated parts; a prompt's answer is the part "<field>: <answer>".
const parts = (text: string) => text.split(/\s*;\s*/).map((p) => p.trim()).filter(Boolean);
const isField = (part: string, field: string) => part.toLowerCase().startsWith(`${field.toLowerCase()}:`);

/** A prompt's answer inside a card's text, or "" when it was not answered. */
export function readField(text: string, field: string): string {
  const part = parts(text).find((p) => isField(p, field));
  return part ? part.slice(field.length + 1).trim() : "";
}

/** The card's text with a prompt's answer set, replaced or appended — or removed when blank. */
export function writeField(text: string, field: string, value: string): string {
  const v = value.replace(/[;\n]/g, ",").trim();
  const list = parts(text);
  const i = list.findIndex((p) => isField(p, field));
  if (i >= 0) {
    if (v) list[i] = `${field}: ${v}`;
    else list.splice(i, 1);
  } else if (v) list.push(`${field}: ${v}`);
  return list.join("; ");
}

/** Split a card's recorded lines into its prompts' answers and whatever else was said. */
export function splitFields(lines: string[], fields: string[]): { answers: Record<string, string>; rest: string[] } {
  const answers: Record<string, string> = {};
  const rest = lines
    .map((line) => {
      let left = line;
      for (const f of fields) {
        const a = readField(left, f);
        if (!a) continue;
        answers[f] = a;
        left = writeField(left, f, "");
      }
      return left.trim();
    })
    .filter(Boolean);
  return { answers, rest };
}
