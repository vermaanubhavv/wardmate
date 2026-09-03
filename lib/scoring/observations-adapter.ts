/**
 * Turns WardMate `observations` rows into the engine's `EngineInput[]`.
 *
 * This is the ONLY place the engine's vocabulary meets WardMate's. It reuses existing data —
 * spoken vitals, photographed labs, imaging findings — rather than asking for anything again
 * (DOCX: "Reuse valid existing observations, laboratory results and imaging findings").
 *
 * Nothing here invents a value. An observation whose unit can't be resolved becomes an
 * EngineInput carrying `unitError`, which the engine renders as `unknown` — never zero.
 */

import { normalizeUnit } from "./units";
import type { EngineInput, Instant } from "./types";

/** The subset of an `observations` row the adapter needs. */
export type ObservationRow = {
  id: string;
  kind: string;
  label: string;
  value_text: string | null;
  value_num: number | null;
  unit: string | null;
  source_quote: string;
  recorded_at: string;
  ref_low: number | null;
  ref_high: number | null;
};

export type PatientFacts = {
  ageYears: number | null;
  sex: string | null;
  admittedAt: Instant;
};

type AnalyteSpec = {
  key: string;
  aliases: RegExp;
  /** analyte name for `normalizeUnit`, or null for categorical/boolean. */
  unitAnalyte:
    | "bun"
    | "urea"
    | "glucose"
    | "calcium"
    | "creatinine"
    | "wbc"
    | "ldh"
    | "ast"
    | "pao2"
    | "base_deficit"
    | "hct"
    | "sbp"
    | "hr"
    | "rr"
    | "temp"
    | "paco2"
    | "fio2"
    | null;
};

const ANALYTES: AnalyteSpec[] = [
  { key: "bun", aliases: /\b(bun|blood urea nitrogen|urea nitrogen)\b/i, unitAnalyte: "bun" },
  { key: "urea", aliases: /\b(urea|blood urea|b\.?\s?urea|s\.?\s?urea|serum urea)\b/i, unitAnalyte: "urea" },
  { key: "glucose", aliases: /\b(glucose|rbs|random blood sugar|blood sugar|bsl|grbs)\b/i, unitAnalyte: "glucose" },
  { key: "calcium", aliases: /\b(calcium|s\.?\s?ca|serum calcium|corrected calcium)\b/i, unitAnalyte: "calcium" },
  { key: "creatinine", aliases: /\b(creatinine|s\.?\s?creat|sr\.?\s?creatinine|serum creatinine)\b/i, unitAnalyte: "creatinine" },
  { key: "wbc", aliases: /\b(wbc|tlc|total leu?cocyte count|total count|white cell count|leu?cocyte count)\b/i, unitAnalyte: "wbc" },
  { key: "band_percent", aliases: /\b(band forms?|bands?|immature (neutrophils|forms)|left shift)\b/i, unitAnalyte: null },
  { key: "ldh", aliases: /\b(ldh|lactate dehydrogenase)\b/i, unitAnalyte: "ldh" },
  { key: "ast", aliases: /\b(ast|sgot|aspartate (amino)?transaminase)\b/i, unitAnalyte: "ast" },
  { key: "pao2", aliases: /\b(pao2|pa o2|arterial (po2|oxygen))\b/i, unitAnalyte: "pao2" },
  { key: "paco2", aliases: /\b(paco2|pa co2|arterial co2)\b/i, unitAnalyte: "paco2" },
  { key: "fio2", aliases: /\b(fio2|fi o2|inspired oxygen fraction)\b/i, unitAnalyte: "fio2" },
  { key: "pf_ratio", aliases: /\b(p\/f ratio|pf ratio|pao2\/fio2|p:f ratio)\b/i, unitAnalyte: null },
  { key: "base_deficit", aliases: /\b(base deficit|base excess|be\b)\b/i, unitAnalyte: "base_deficit" },
  { key: "hct", aliases: /\b(h(a)?ematocrit|hct|pcv|packed cell volume)\b/i, unitAnalyte: "hct" },
  { key: "sbp", aliases: /\b(systolic( blood pressure| bp)?|sbp)\b/i, unitAnalyte: "sbp" },
  { key: "hr", aliases: /\b(heart rate|pulse( rate)?|hr\b)\b/i, unitAnalyte: "hr" },
  { key: "rr", aliases: /\b(resp(iratory)? rate|rr\b)\b/i, unitAnalyte: "rr" },
  { key: "temp", aliases: /\b(temp(erature)?|febrile|pyrexia)\b/i, unitAnalyte: "temp" },
  { key: "ph", aliases: /\b(ph\b|arterial ph|blood ph)\b/i, unitAnalyte: null },
  { key: "amylase", aliases: /\b(amylase)\b/i, unitAnalyte: null },
  { key: "lipase", aliases: /\b(lipase)\b/i, unitAnalyte: null },
  { key: "triglycerides", aliases: /\b(triglycerides?|tg\b)\b/i, unitAnalyte: null },
  { key: "crp", aliases: /\b(crp|c-reactive protein)\b/i, unitAnalyte: null },
  { key: "inr", aliases: /\b(inr|pt.?inr|international normalised ratio)\b/i, unitAnalyte: null },
  { key: "platelets", aliases: /\b(platelets?|platelet count|plt)\b/i, unitAnalyte: null },
  { key: "bilirubin", aliases: /\b(total bilirubin|t\.?\s?bilirubin|serum bilirubin|s\.?\s?bilirubin|bilirubin)\b/i, unitAnalyte: null },
  { key: "albumin", aliases: /\b(serum albumin|s\.?\s?albumin|albumin)\b/i, unitAnalyte: null },
  { key: "neutrophil_percent", aliases: /\b(neutrophils?|polymorphs?|neutrophil %|anc %|n%)\b/i, unitAnalyte: null },
  { key: "hb", aliases: /\b(h(a)?emoglobin|hb%?|hgb)\b/i, unitAnalyte: null },
];

const IMAGING = /\b(x-?ray|cxr|chest film|ct\b|ct scan|cect|usg|ultrasound|sonograph|imaging|radiograph)\b/i;
const NEGATED = /\b(no|nil|absent|without|ruled out|negative for|not seen)\b/i;

function numFrom(row: ObservationRow): number | null {
  if (row.value_num != null && Number.isFinite(row.value_num)) return row.value_num;
  const m = (row.value_text ?? "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function baseInput(row: ObservationRow, key: string): Omit<EngineInput, "value" | "unit" | "text"> {
  return {
    key,
    original: { value: row.value_text ?? (row.value_num != null ? String(row.value_num) : ""), unit: row.unit },
    at: row.recorded_at,
    sourceId: row.id,
    sourceQuote: row.source_quote,
    refLow: row.ref_low,
    refHigh: row.ref_high,
  };
}

export function toEngineInputs(rows: ObservationRow[], patient: PatientFacts): EngineInput[] {
  const out: EngineInput[] = [];

  // Synthetic: age at admission, from the patient record (not a timestamped observation).
  if (patient.ageYears != null) {
    out.push({
      key: "age_years",
      value: patient.ageYears,
      unit: "years",
      text: String(patient.ageYears),
      original: { value: String(patient.ageYears), unit: "years" },
      at: patient.admittedAt,
      sourceId: "patient.age_years",
      sourceQuote: `Age ${patient.ageYears} years (patient record)`,
      refLow: null,
      refHigh: null,
    });
  }

  let sawBun = false;
  let sawUrea: EngineInput | null = null;

  for (const row of rows) {
    const hay = `${row.label} ${row.value_text ?? ""} ${row.source_quote}`;

    // --- Mental status ---------------------------------------------------
    if (/\bgcs\b/i.test(hay) || /\b(orient|disorient|confus|drowsy|obtunded|altered mental|encephalopath|alert)/i.test(hay)) {
      const gcs = /\bgcs[^0-9]*(\d{1,2})/i.exec(hay)?.[1];
      // 0 = impaired mental status (BISAP criterion met), 1 = intact. Original text kept.
      let flag: number | null = null;
      let label: string;
      if (gcs) {
        flag = Number(gcs) < 15 ? 0 : 1;
        label = `GCS ${gcs}`;
      } else if (/\b(no|nil|not)\b[^.]*\b(confus|disorient)|(fully )?(alert|oriented|conscious and oriented|e4v5m6)\b/i.test(hay)) {
        flag = 1;
        label = "alert / oriented";
      } else if (/\b(disorient|confus|drowsy|obtunded|altered mental|encephalopath)/i.test(hay)) {
        flag = 0;
        label = row.value_text ?? "impaired mental status";
      } else {
        label = row.value_text ?? "mental status noted";
      }
      out.push({
        ...baseInput(row, "mental_status"),
        value: flag,
        unit: flag == null ? null : "flag",
        text: label,
      });
      continue;
    }

    // --- Pleural effusion — imaging evidence only ----------------------
    if (/pleural effusion|pleural fluid/i.test(hay)) {
      const isImaging = IMAGING.test(hay) || /radiolog|report/i.test(row.kind);
      if (isImaging) {
        out.push({
          ...baseInput(row, "pleural_effusion"),
          value: null,
          unit: null,
          text: NEGATED.test(hay) ? "absent" : "present",
        });
      }
      continue;
    }

    // --- Local / systemic complications (Atlanta) ---------------------
    if (/\b(necrosis|pseudocyst|walled-off|peripancreatic collection|acute (peri)?pancreatic (fluid )?collection|apfc|anfc)\b/i.test(hay)) {
      out.push({ ...baseInput(row, "local_complication"), value: null, unit: null, text: NEGATED.test(hay) ? "absent" : "present" });
      continue;
    }

    // --- Fluid sequestration (Ranson) --------------------------------
    if (/fluid sequestration|third space|fluid deficit/i.test(hay)) {
      const litres = /(-?\d+(?:\.\d+)?)\s*(l|lit|litre|liter)/i.exec(hay)?.[1];
      out.push({
        ...baseInput(row, "fluid_sequestration"),
        value: litres ? Number(litres) : numFrom(row),
        unit: "L",
        text: row.value_text,
      });
      continue;
    }

    // --- Known analytes --------------------------------------------
    const spec = ANALYTES.find((a) => a.aliases.test(row.label) || a.aliases.test(row.source_quote));
    if (!spec) continue;

    const raw = numFrom(row);
    let value: number | null = raw;
    let unit: string | null = row.unit;
    let unitError: string | undefined;

    if (spec.unitAnalyte && raw != null) {
      const n = normalizeUnit(spec.unitAnalyte, raw, row.unit);
      if (n.ok) {
        value = n.value;
        unit = n.unit;
      } else {
        value = null;
        unitError = `${n.reason}: ${n.detail}`;
      }
    }

    // Platelet count is written on Indian reports as "1.5" (lakh), "150" (×10³/µL) or
    // "150000" (/µL). Bring to /µL by order of magnitude.
    if (spec.key === "platelets" && value != null) {
      if (value < 20) value = Math.round(value * 100_000);
      else if (value < 1000) value = Math.round(value * 1000);
      unit = "/µL";
    }

    const input: EngineInput = {
      ...baseInput(row, spec.key),
      value,
      unit,
      text: row.value_text,
      ...(unitError ? { unitError } : {}),
    };
    out.push(input);

    if (spec.key === "bun") sawBun = true;
    if (spec.key === "urea" && input.value != null) sawUrea = input;
  }

  // Derive BUN from urea when BUN itself was never recorded (Indian labs report "blood urea").
  // BUN (mg/dL) ≈ urea (mg/dL) × 0.4665.
  if (!sawBun && sawUrea && sawUrea.value != null) {
    out.push({
      ...sawUrea,
      key: "bun",
      value: Math.round(sawUrea.value * 0.4665 * 10) / 10,
      unit: "mg/dL",
      original: { value: `${sawUrea.original.value} (urea)`, unit: sawUrea.original.unit },
      sourceQuote: `${sawUrea.sourceQuote} — BUN derived from urea × 0.4665`,
    });
  }

  return out;
}
