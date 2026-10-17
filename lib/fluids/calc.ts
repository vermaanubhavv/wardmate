/**
 * Pure formulas from the fluid-therapy text, each with the inputs a page needs to work it.
 * Only formulas the source edition prints are here (serum osmolality is the one exception: the
 * page names its variables and units but the equation is an image lost in extraction, and the
 * topic says so). A calculator is a claim that the book gives this formula, not that the
 * formula exists somewhere. No
 * rounding beyond one decimal, no clinical judgement: the page shows the number amber with
 * the book's own caveats beside it.
 */
export type CalcInput = { key: string; label: string; unit: string; min: number; max: number; step?: number };
export type CalcResult = { value: number; unit: string; note?: string };
export type Calculator = {
  name: string;
  inputs: CalcInput[];
  run: (v: Record<string, number>) => CalcResult;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

export const CALCULATORS = {
  tbw: {
    name: "Total body water",
    inputs: [
      { key: "weight", label: "Weight", unit: "kg", min: 1, max: 300 },
      { key: "percent", label: "Body water (60 adult man, 50 adult woman; less when older or obese)", unit: "% of weight", min: 40, max: 80, step: 5 },
    ],
    run: (v) => {
      const tbw = (v.weight * v.percent) / 100;
      return { value: r1(tbw), unit: "L", note: `two-thirds intracellular ≈ ${r1((tbw * 2) / 3)} L, one-third extracellular ≈ ${r1(tbw / 3)} L` };
    },
  },
  serum_osmolality: {
    name: "Calculated serum osmolality",
    inputs: [
      { key: "na", label: "Sodium", unit: "mEq/L", min: 100, max: 200 },
      { key: "glucose", label: "Glucose", unit: "mg/dL", min: 0, max: 2000 },
      { key: "bun", label: "Blood urea nitrogen", unit: "mg/dL", min: 0, max: 300 },
    ],
    run: (v) => ({ value: r1(2 * v.na + v.glucose / 18 + v.bun / 2.8), unit: "mOsm/kg", note: "normal 275–290 mOsm/kg" }),
  },
  anion_gap: {
    name: "Anion gap",
    inputs: [
      { key: "na", label: "Sodium", unit: "mEq/L", min: 100, max: 200 },
      { key: "cl", label: "Chloride", unit: "mEq/L", min: 60, max: 150 },
      { key: "hco3", label: "Bicarbonate", unit: "mEq/L", min: 1, max: 60 },
    ],
    run: (v) => ({ value: r1(v.na - (v.cl + v.hco3)), unit: "mEq/L", note: "normal 12 ± 2 mEq/L" }),
  },
  map: {
    name: "Mean arterial pressure",
    inputs: [
      { key: "sbp", label: "Systolic", unit: "mmHg", min: 40, max: 300 },
      { key: "dbp", label: "Diastolic", unit: "mmHg", min: 10, max: 200 },
    ],
    run: (v) => ({ value: r1(v.dbp + (v.sbp - v.dbp) / 3), unit: "mmHg" }),
  },
  daily_maintenance: {
    name: "Daily maintenance water (adult, 25–30 mL/kg)",
    inputs: [{ key: "weight", label: "Weight", unit: "kg", min: 20, max: 300 }],
    run: (v) => ({ value: Math.round(25 * v.weight), unit: "mL/day at 25 mL/kg", note: `${Math.round(30 * v.weight)} mL/day at 30 mL/kg; with it about 1 mEq/kg each of sodium and potassium and 50–100 g glucose` }),
  },
  holliday_segar: {
    name: "Maintenance fluid by weight (100 / 50 / 20 mL/kg)",
    inputs: [{ key: "weight", label: "Weight", unit: "kg", min: 1, max: 150 }],
    run: (v) => {
      const w = v.weight;
      const perDay = w <= 10 ? 100 * w : w <= 20 ? 1000 + 50 * (w - 10) : 1500 + 20 * (w - 20);
      return { value: Math.round(perDay), unit: "mL/day", note: `${r1(perDay / 24)} mL/h` };
    },
  },
  parkland: {
    name: "Parkland formula (first 24 h after a burn)",
    inputs: [
      { key: "weight", label: "Weight", unit: "kg", min: 1, max: 300 },
      { key: "tbsa", label: "Burn area", unit: "% TBSA", min: 1, max: 100 },
    ],
    run: (v) => {
      const total = 4 * v.weight * v.tbsa;
      return { value: Math.round(total), unit: "mL Ringer's lactate in 24 h", note: `half, ${Math.round(total / 2)} mL, in the first 8 h counted from the time of the burn (${Math.round(total / 16)} mL/h); the rest over the next 16 h (${Math.round(total / 32)} mL/h). Titrate to urine output — the formula is a starting point.` };
    },
  },
  drip_rate: {
    name: "Drip rate",
    inputs: [
      { key: "volume", label: "Volume", unit: "mL", min: 1, max: 5000 },
      { key: "hours", label: "Over", unit: "h", min: 0.1, max: 48, step: 0.5 },
      { key: "dropFactor", label: "Drop factor (15 macro, 60 micro)", unit: "drops/mL", min: 10, max: 60, step: 5 },
    ],
    run: (v) => ({ value: Math.round((v.volume * v.dropFactor) / (v.hours * 60)), unit: "drops/min", note: `${Math.round(v.volume / v.hours)} mL/h` }),
  },
  corrected_sodium_glucose: {
    name: "Sodium corrected for hyperglycaemia",
    inputs: [
      { key: "na", label: "Measured sodium", unit: "mEq/L", min: 90, max: 180 },
      { key: "glucose", label: "Glucose", unit: "mg/dL", min: 100, max: 2000 },
    ],
    // Table 20.6: 1.6 mEq/L per 100 mg/dL above 100; the factor is 2.4 once glucose exceeds 400.
    run: (v) => {
      const f = v.glucose > 400 ? 2.4 : 1.6;
      return { value: r1(v.na + (f * (v.glucose - 100)) / 100), unit: "mEq/L", note: `factor ${f} per 100 mg/dL above 100` };
    },
  },
  sodium_requirement: {
    name: "Sodium requirement (conventional formula)",
    inputs: [
      { key: "desired", label: "Desired sodium", unit: "mEq/L", min: 100, max: 150 },
      { key: "na", label: "Actual sodium", unit: "mEq/L", min: 90, max: 150 },
      { key: "tbw", label: "Total body water", unit: "L", min: 5, max: 120, step: 0.5 },
    ],
    run: (v) => {
      const mEq = (v.desired - v.na) * v.tbw;
      return { value: r1(mEq), unit: "mEq sodium", note: `≈ ${Math.round(mEq * 2)} mL of 3% saline at 2 mL per mEq. A rough guide only — the book relies on frequent sodium checks, not the formula.` };
    },
  },
  adrogue_madias: {
    name: "Adrogué–Madias: change in serum sodium per litre infused",
    inputs: [
      { key: "infNa", label: "Infusate sodium", unit: "mEq/L", min: 0, max: 1026 },
      { key: "na", label: "Serum sodium", unit: "mEq/L", min: 90, max: 200 },
      { key: "tbw", label: "Total body water", unit: "L", min: 5, max: 120, step: 0.5 },
    ],
    run: (v) => ({ value: r1((v.infNa - v.na) / (v.tbw + 1)), unit: "mEq/L per litre", note: "The book warns this formula risks inadvertent overcorrection; measure sodium frequently." }),
  },
  free_water_deficit: {
    name: "Free water deficit",
    inputs: [
      { key: "tbw", label: "Current total body water", unit: "L", min: 5, max: 120, step: 0.5 },
      { key: "na", label: "Serum sodium", unit: "mEq/L", min: 141, max: 200 },
    ],
    run: (v) => ({ value: r1(v.tbw * (v.na / 140 - 1)), unit: "L", note: "Add ongoing and insensible losses; the book corrects the total deficit over 48–72 hours." }),
  },
  corrected_calcium: {
    name: "Calcium corrected for albumin",
    inputs: [
      { key: "ca", label: "Measured total calcium", unit: "mg/dL", min: 2, max: 20, step: 0.1 },
      { key: "albumin", label: "Serum albumin", unit: "g/dL", min: 0.5, max: 6, step: 0.1 },
    ],
    run: (v) => ({ value: r1(v.ca + 0.8 * (4 - v.albumin)), unit: "mg/dL", note: "The book says this overestimates ionised calcium in hypoalbuminaemia; measure ionised calcium when in doubt." }),
  },
} satisfies Record<string, Calculator>;

export type CalcKey = keyof typeof CALCULATORS;

export function runCalculator(key: CalcKey, values: Record<string, number>): CalcResult | null {
  const c = CALCULATORS[key] as Calculator;
  for (const i of c.inputs) {
    const x = values[i.key];
    if (typeof x !== "number" || !Number.isFinite(x) || x < i.min || x > i.max) return null;
  }
  return c.run(values);
}
