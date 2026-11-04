/**
 * Sodium correction worksheet: the hyponatraemia chapter's printed formulas chained for one set
 * of typed numbers — total body water, the 24-hour correction limit, the sodium the book's
 * formulas say that limit takes, and what one litre of a chosen fluid is predicted to do.
 *
 * Every constant here is the book's and carries the quote it came from; the test checks each
 * quote is word for word in a signed-off topic and each table value matches that topic's table.
 * No quote, no number. Nothing is stored and nothing is about a named patient.
 */
import { round } from "@/lib/scoring/units";

export type Cite = { topic: "hyponatraemia" | "body_water_and_units" | "hypertonic_saline"; text: string; page: string; pageKind: "book" | "pdf" };

const hypo = (text: string, page: string): Cite => ({ topic: "hyponatraemia", text, page, pageKind: "book" });

/** Table 1.1, adult rows only: the hyponatraemia chapter is an adult chapter. */
export const BODY_WATER = [
  { id: "male", label: "Adult male", percent: 60 },
  { id: "female", label: "Adult female", percent: 50 },
  { id: "elderly", label: "Elderly", percent: 50 },
  { id: "obese", label: "Adult obese", percent: 50 },
] as const;
export const BODY_WATER_CITE: Cite = {
  topic: "body_water_and_units",
  text: "Total body water content is about 60% of body weight in a young adult male and about 50% in a young adult female",
  page: "6",
  pageKind: "pdf",
};

/** The 24-hour limits on book p234. Where the book prints a range the ceiling is its upper end. */
export const SODIUM_LIMITS = [
  { id: "acute", label: "Acute (under 48 h), not high ODS risk", limit: 10, printed: "10 mEq/L over the first 24 hours", cite: hypo("the rate of correction should not exceed 10 mEq/L over the first 24 hours", "234") },
  { id: "acute_high", label: "Acute (under 48 h), high ODS risk", limit: 8, printed: "8 mEq/L over 24 hours on any day", cite: hypo("In patients at high risk of ODS, the correction rate should not exceed 8 mEq/L over 24 hours on any day", "234") },
  { id: "chronic", label: "Chronic (over 48 h, or not known), low ODS risk", limit: 8, printed: "4–8 mEq/L over 24 hours", cite: hypo("should not exceed 4–8 mEq/L over 24 hours, and in high-risk patients for ODS, it should not exceed 4–6 mEq/L over 24 hours", "234") },
  { id: "chronic_high", label: "Chronic (over 48 h, or not known), high ODS risk", limit: 6, printed: "4–6 mEq/L over 24 hours", cite: hypo("should not exceed 4–8 mEq/L over 24 hours, and in high-risk patients for ODS, it should not exceed 4–6 mEq/L over 24 hours", "234") },
] as const;

/** Table 20.9 (book p237), without the bicarbonates: they are not sodium-correction fluids here. */
export const INFUSATES = [
  { id: "ns3", label: "3% NaCl", na: 513 },
  { id: "ns5", label: "5% NaCl", na: 855 },
  { id: "ns09", label: "0.9% NaCl", na: 154 },
  { id: "plasmalyte", label: "PlasmaLyte", na: 140 },
  { id: "rl", label: "Ringer's lactate", na: 130 },
  { id: "ns045", label: "0.45% NaCl", na: 77 },
  { id: "isolyte_g", label: "Isolyte-G", na: 65 },
  { id: "isolyte_m", label: "Isolyte-M", na: 40 },
  { id: "ns02", label: "0.2% NaCl", na: 34 },
  { id: "d5", label: "5% dextrose", na: 0 },
] as const;
export const INFUSATE_CITE = hypo("8.4% NaHCO₃ 1000 Ringer's lactate 130", "237");

export const CITES = {
  goal: hypo("The goal of correction of sodium is up to 130 mEq/L and not its normal value", "234"),
  conventional: hypo("Sodium Requirement = (Desired Na⁺ - Actual Na⁺) × Total Body Water", "235"),
  adrogue: hypo("Change in Serum Sodium Concentration = (Infusate Na / L – Serum Na) / (Total Body Water (L) + 1)", "236"),
  rule: hypo("Administration of 1mL/kg of 3% NaCl (hypertonic saline) increases the serum Na⁺ by 1mEq/L.", "236"),
  unreliable: hypo("Different equations and formulas cannot predict serum sodium change reliably while infusing 3% NaCl", "240"),
  measure: hypo("rely on frequent measurements of the serum sodium for correcting hyponatremia", "241"),
  monitor: hypo("monitor serum sodium very closely (2–4 hourly)", "234"),
  bolusUs: hypo("The infusion of a 100 mL bolus of 3% hypertonic saline intravenously over 10 minutes is recommended for initial treatment (American Guidelines 2013)", "233"),
  bolusRepeat: hypo("this bolus may be repeated twice (for a total dose of 300 mL)", "233"),
  bolusEu: hypo("150 mL bolus infusions of 3% saline (to be given over 20 minutes)", "233"),
  initialGoal: hypo("The goal of initial urgent treatment is to raise serum sodium by 4–6 mEq/L", "233"),
  ods: hypo("usually delayed by 2–6 days following rapid overcorrection", "234"),
  saline3: { topic: "hypertonic_saline", text: "Sodium concentration of 3% and 5% hypertonic saline is 513 mEq/L and 855 mEq/L respectively", page: "123", pageKind: "book" } as Cite,
};

/** 3% NaCl holds 513 mEq of sodium per litre. */
const NA_3PC = 513;

export type SodiumInput = { weight: number; na: number; bodyWater: string; situation: string; infusate: string };

export type SodiumWorked = {
  tbw: number;
  limit: (typeof SODIUM_LIMITS)[number];
  /** Serum sodium the 24-hour limit allows, capped at the book's goal of 130. */
  target: number;
  cappedAtGoal: boolean;
  /** Conventional formula: sodium needed to reach `target`, and that sodium as 3% NaCl. */
  mEq: number;
  ml3pcByFormula: number;
  /** The 1 mL/kg rule for the same rise. */
  ml3pcByRule: number;
  infusate: (typeof INFUSATES)[number];
  /** Adrogué–Madias: predicted change in serum sodium from one litre of the infusate. */
  risePerLitre: number;
};

export function workSodiumCorrection(i: SodiumInput): SodiumWorked | null {
  const water = BODY_WATER.find((b) => b.id === i.bodyWater);
  const limit = SODIUM_LIMITS.find((s) => s.id === i.situation);
  const infusate = INFUSATES.find((f) => f.id === i.infusate);
  const ok = (x: number, min: number, max: number) => Number.isFinite(x) && x >= min && x <= max;
  // Adults only, and only below the goal of 130 — above it the book has nothing to correct towards.
  if (!water || !limit || !infusate || !ok(i.weight, 20, 300) || !ok(i.na, 90, 129)) return null;

  const tbw = (i.weight * water.percent) / 100;
  const target = Math.min(i.na + limit.limit, 130);
  const rise = target - i.na;
  const mEq = rise * tbw;
  return {
    tbw: round(tbw, 1),
    limit,
    target,
    cappedAtGoal: target < i.na + limit.limit,
    mEq: round(mEq, 1),
    ml3pcByFormula: Math.round((mEq * 1000) / NA_3PC),
    ml3pcByRule: Math.round(rise * i.weight),
    infusate,
    risePerLitre: round((infusate.na - i.na) / (tbw + 1), 1),
  };
}
