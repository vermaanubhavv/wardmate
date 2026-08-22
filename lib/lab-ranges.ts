/**
 * Typical adult reference ranges, used for one purpose only: deciding which recorded blood
 * result is worth putting in front of a resident on the progress screen.
 *
 * WHAT THIS IS NOT. It does not create, alter or interpret a value. The number shown is the
 * number that was recorded, unchanged. This decides display order and nothing else.
 *
 * WHY IT IS ALLOWED TO EXIST AT ALL, given this app does not make clinical judgements: because
 * the judgement is shown rather than hidden. Every flagged result prints the range it was
 * judged against — "Hb 8.2 ↓ (13–17)" — so a resident sees immediately why it was flagged and
 * can dismiss it in the same glance. Reference ranges differ between laboratories, with age,
 * and in pregnancy; printing the range is what makes that difference visible instead of
 * silently authoritative.
 *
 * THE SAFETY DIRECTION IS ONE-WAY. A result this file does not recognise, or whose value cannot
 * be read as a number, is never called normal — it is passed through and shown. Failing to flag
 * a deranged result is the dangerous mistake; flagging a normal one costs a line of screen.
 * Every default here leans that way.
 */

export type LabFlag = "high" | "low" | "abnormal";

type Range = { low: number; high: number };

type LabDef = {
  /** How it prints, in the unit's own shorthand. */
  label: string;
  aliases: string[];
  /**
   * One entry per plausible unit scale the same result gets written in — a total count is
   * written "11200" on one report and "11.2" on the next, and both are the same result. The
   * scale nearest the recorded number's order of magnitude is the one used.
   */
  ranges: Range[];
  /** Where the normal range genuinely differs by sex. Used only when sex is on record. */
  bySex?: { male: Range[]; female: Range[] };
};

const LABS: LabDef[] = [
  {
    label: "Hb",
    aliases: ["hb", "haemoglobin", "hemoglobin", "hgb"],
    ranges: [{ low: 13, high: 15 }], // narrower of the two sexes — see pickRanges()
    bySex: { male: [{ low: 13, high: 17 }], female: [{ low: 12, high: 15 }] },
  },
  {
    label: "TLC",
    aliases: ["tlc", "total count", "total leucocyte count", "wbc", "white cell count", "counts", "leucocyte count"],
    ranges: [{ low: 4000, high: 11000 }, { low: 4, high: 11 }],
  },
  {
    label: "Platelets",
    aliases: ["platelet", "platelets", "platelet count", "plt"],
    ranges: [{ low: 150000, high: 450000 }, { low: 150, high: 450 }, { low: 1.5, high: 4.5 }],
  },
  { label: "Urea", aliases: ["urea", "blood urea"], ranges: [{ low: 15, high: 40 }] },
  { label: "Creatinine", aliases: ["creatinine", "s. creatinine", "serum creatinine", "cr"], ranges: [{ low: 0.6, high: 1.3 }] },
  { label: "Na", aliases: ["na", "sodium", "serum sodium"], ranges: [{ low: 135, high: 145 }] },
  { label: "K", aliases: ["k", "potassium", "serum potassium"], ranges: [{ low: 3.5, high: 5.1 }] },
  { label: "Cl", aliases: ["cl", "chloride", "serum chloride"], ranges: [{ low: 98, high: 107 }] },
  { label: "T. bilirubin", aliases: ["bilirubin", "total bilirubin", "t bilirubin", "t. bilirubin", "serum bilirubin"], ranges: [{ low: 0.2, high: 1.2 }] },
  { label: "D. bilirubin", aliases: ["direct bilirubin", "d bilirubin", "d. bilirubin", "conjugated bilirubin"], ranges: [{ low: 0, high: 0.3 }] },
  { label: "SGOT", aliases: ["sgot", "ast", "aspartate transaminase"], ranges: [{ low: 5, high: 40 }] },
  { label: "SGPT", aliases: ["sgpt", "alt", "alanine transaminase"], ranges: [{ low: 5, high: 40 }] },
  { label: "ALP", aliases: ["alp", "alkaline phosphatase"], ranges: [{ low: 40, high: 130 }] },
  { label: "Albumin", aliases: ["albumin", "serum albumin"], ranges: [{ low: 3.5, high: 5.2 }] },
  { label: "Total protein", aliases: ["total protein", "serum protein"], ranges: [{ low: 6, high: 8.3 }] },
  { label: "INR", aliases: ["inr", "pt inr", "pt-inr"], ranges: [{ low: 0.8, high: 1.2 }] },
  { label: "PT", aliases: ["pt", "prothrombin time"], ranges: [{ low: 11, high: 15 }] },
  { label: "Amylase", aliases: ["amylase", "serum amylase"], ranges: [{ low: 30, high: 110 }] },
  { label: "Lipase", aliases: ["lipase", "serum lipase"], ranges: [{ low: 10, high: 140 }] },
  { label: "CRP", aliases: ["crp", "c reactive protein", "c-reactive protein"], ranges: [{ low: 0, high: 5 }] },
  { label: "Lactate", aliases: ["lactate", "serum lactate"], ranges: [{ low: 0.5, high: 2 }] },
  { label: "pH", aliases: ["ph"], ranges: [{ low: 7.35, high: 7.45 }] },
  { label: "HCO₃", aliases: ["hco3", "bicarbonate", "bicarb"], ranges: [{ low: 22, high: 26 }] },
  { label: "pCO₂", aliases: ["pco2"], ranges: [{ low: 35, high: 45 }] },
];

/** The resident's own word for it. Their judgement needs no reference range behind it. */
const SAID_HIGH = /\b(raised|elevated|high|increased|rising)\b/i;
const SAID_LOW = /\b(low|reduced|decreased|dropping|dropped|falling)\b/i;
const SAID_ABNORMAL = /\b(deranged|derangement|abnormal|grossly)\b/i;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export type LabReading = {
  label: string;
  /** The value exactly as recorded. Never rewritten, never rounded, never unit-converted. */
  value: string;
  flag: LabFlag | null;
  /** "13–17" — the range the flag was judged against, so the judgement can be checked. */
  range: string | null;
};

/** Is this label a blood result this file knows a range for? */
function findLab(label: string): LabDef | null {
  const l = norm(label).replace(/^s\.?\s+|^serum\s+/, "");
  return (
    LABS.find((d) => d.aliases.some((a) => a === l || a === norm(label))) ?? null
  );
}

/**
 * The first number in the recorded text. Deliberately simple: a result is written "8.2",
 * "8.2 g/dL" or "Hb 8.2", never as a sum. Returns null when there is no number to read, which
 * sends the result down the show-it-anyway path.
 */
function firstNumber(value: string): number | null {
  const m = value.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

/**
 * The scale the result was written in, chosen by order of magnitude — "11200" and "11.2" are
 * the same total count, and comparing either against the wrong scale would call a normal count
 * wildly deranged, or worse, a deranged one normal.
 */
function pickRange(value: number, ranges: Range[]): Range {
  if (ranges.length === 1 || value <= 0) return ranges[0];
  const distance = (r: Range) =>
    Math.abs(Math.log10(value) - Math.log10((r.low + r.high) / 2 || 1));
  return ranges.reduce((best, r) => (distance(r) < distance(best) ? r : best), ranges[0]);
}

function pickRanges(def: LabDef, sex: string | null): Range[] {
  if (!def.bySex) return def.ranges;
  const s = norm(sex ?? "");
  if (s.startsWith("m")) return def.bySex.male;
  if (s.startsWith("f")) return def.bySex.female;
  // Sex not on record: use the narrower band shared by both, so a result that would be
  // abnormal for either sex still gets flagged. Erring toward flagging is the safe direction,
  // and the printed range makes any over-flag obvious at a glance.
  return def.ranges;
}

const trim = (n: number) => String(Number(n.toFixed(2)));

/**
 * Read one recorded result. Returns null when the label is not a blood investigation this file
 * knows — the caller then treats it as an ordinary finding and shows it, rather than this
 * function quietly deciding it was normal.
 */
export function classifyLab(
  label: string,
  value: string | null,
  sex: string | null
): LabReading | null {
  const def = findLab(label);
  if (!def || !value || !value.trim()) return null;

  const v = value.trim();

  // What the resident said outranks any range: they were looking at the patient.
  if (SAID_ABNORMAL.test(v)) return { label: def.label, value: v, flag: "abnormal", range: null };
  if (SAID_HIGH.test(v)) return { label: def.label, value: v, flag: "high", range: null };
  if (SAID_LOW.test(v)) return { label: def.label, value: v, flag: "low", range: null };

  const n = firstNumber(v);
  // A known lab with an unreadable value is shown, not judged — flag null with no range means
  // "we could not tell", and the caller must display it rather than fold it away.
  if (n === null) return { label: def.label, value: v, flag: null, range: null };

  const range = pickRange(n, pickRanges(def, sex));
  const printed = `${trim(range.low)}–${trim(range.high)}`;

  if (n < range.low) return { label: def.label, value: v, flag: "low", range: printed };
  if (n > range.high) return { label: def.label, value: v, flag: "high", range: printed };
  return { label: def.label, value: v, flag: null, range: printed };
}

/** True when this label is a blood result at all — normal or not. */
export function isKnownLab(label: string): boolean {
  return findLab(label) !== null;
}
