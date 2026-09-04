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

/**
 * The report an analyte belongs to. Used to decide how prominently a result is shown — a
 * deranged MCV on a CBC is not read the way a deranged creatinine on a KFT is — never to
 * change or interpret the value itself.
 */
export type LabPanel =
  | "cbc"
  | "kft"
  | "lft"
  | "coag"
  | "abg"
  | "pancreatic"
  | "inflammatory";

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
  /** Which report this analyte sits on. */
  panel?: LabPanel;
  /**
   * A result that is not worth putting in front of anyone even when it is out of range — a
   * red-cell index, an eosinophil fraction, a urate. It is still recorded and still shown on
   * request; it is just never flagged or foregrounded. Failing to shout about one of these is
   * not the dangerous direction — the resident asked for exactly this.
   */
  minor?: boolean;
};

const LABS: LabDef[] = [
  // --- CBC: the four that a round reads, plus the differential --------------------------------
  {
    label: "Hb",
    aliases: ["hb", "hb%", "haemoglobin", "hemoglobin", "hgb"],
    ranges: [{ low: 13, high: 15 }], // narrower of the two sexes — see pickRanges()
    bySex: { male: [{ low: 13, high: 17 }], female: [{ low: 12, high: 15 }] },
    panel: "cbc",
  },
  {
    label: "TLC",
    aliases: ["tlc", "total count", "total leucocyte count", "wbc", "white cell count", "counts", "leucocyte count", "tc"],
    ranges: [{ low: 4000, high: 11000 }, { low: 4, high: 11 }],
    panel: "cbc",
  },
  {
    label: "Platelets",
    aliases: ["platelet", "platelets", "platelet count", "plt"],
    ranges: [{ low: 150000, high: 450000 }, { low: 150, high: 450 }, { low: 1.5, high: 4.5 }],
    panel: "cbc",
  },
  {
    label: "Neutrophils",
    aliases: ["neutrophils", "neutrophil", "polymorphs", "polymorphonuclear", "anc", "absolute neutrophil count"],
    ranges: [{ low: 40, high: 75 }, { low: 2000, high: 7500 }, { low: 2, high: 7.5 }],
    panel: "cbc",
  },
  {
    label: "Lymphocytes",
    aliases: ["lymphocytes", "lymphocyte", "alc", "absolute lymphocyte count"],
    ranges: [{ low: 20, high: 45 }, { low: 1000, high: 3000 }, { low: 1, high: 3 }],
    panel: "cbc",
  },
  {
    label: "Monocytes",
    aliases: ["monocytes", "monocyte"],
    ranges: [{ low: 2, high: 10 }, { low: 200, high: 950 }],
    panel: "cbc",
  },
  {
    label: "Eosinophils",
    aliases: ["eosinophils", "eosinophil", "aec", "absolute eosinophil count"],
    ranges: [{ low: 1, high: 6 }, { low: 20, high: 500 }, { low: 0.02, high: 0.5 }],
    panel: "cbc",
    minor: true,
  },
  { label: "Basophils", aliases: ["basophils", "basophil"], ranges: [{ low: 0, high: 2 }], panel: "cbc", minor: true },
  { label: "MCV", aliases: ["mcv", "mean corpuscular volume"], ranges: [{ low: 80, high: 100 }], panel: "cbc", minor: true },
  { label: "MCH", aliases: ["mch", "mean corpuscular haemoglobin", "mean corpuscular hemoglobin"], ranges: [{ low: 27, high: 33 }], panel: "cbc", minor: true },
  { label: "MCHC", aliases: ["mchc"], ranges: [{ low: 32, high: 36 }], panel: "cbc", minor: true },
  { label: "RDW", aliases: ["rdw", "rdw-cv", "red cell distribution width"], ranges: [{ low: 11.5, high: 14.5 }], panel: "cbc", minor: true },
  { label: "RBC count", aliases: ["rbc", "rbc count", "red blood cell count", "red cell count"], ranges: [{ low: 4.2, high: 5.9 }], panel: "cbc", minor: true },
  { label: "PCV", aliases: ["pcv", "hct", "haematocrit", "hematocrit", "packed cell volume"], ranges: [{ low: 36, high: 50 }], panel: "cbc", minor: true },
  { label: "MPV", aliases: ["mpv", "mean platelet volume"], ranges: [{ low: 7.5, high: 11.5 }], panel: "cbc", minor: true },
  { label: "ESR", aliases: ["esr", "erythrocyte sedimentation rate"], ranges: [{ low: 0, high: 20 }], panel: "cbc", minor: true },

  // --- KFT: urea, creatinine, and every electrolyte; potassium leads (see keyLabRank) ---------
  { label: "Urea", aliases: ["urea", "blood urea", "b. urea", "s. urea", "serum urea"], ranges: [{ low: 15, high: 40 }], panel: "kft" },
  { label: "Creatinine", aliases: ["creatinine", "s. creatinine", "sr. creatinine", "sr creatinine", "serum creatinine", "cr"], ranges: [{ low: 0.6, high: 1.3 }], panel: "kft" },
  { label: "Na", aliases: ["na", "sodium", "serum sodium"], ranges: [{ low: 135, high: 145 }], panel: "kft" },
  { label: "K", aliases: ["k", "potassium", "serum potassium"], ranges: [{ low: 3.5, high: 5.1 }], panel: "kft" },
  { label: "Cl", aliases: ["cl", "chloride", "serum chloride"], ranges: [{ low: 98, high: 107 }], panel: "kft" },
  { label: "Ca", aliases: ["ca", "calcium", "serum calcium", "corrected calcium", "total calcium"], ranges: [{ low: 8.5, high: 10.5 }], panel: "kft" },
  { label: "Mg", aliases: ["mg", "magnesium", "serum magnesium"], ranges: [{ low: 1.7, high: 2.4 }], panel: "kft" },
  { label: "PO₄", aliases: ["po4", "phosphate", "phosphorus", "serum phosphate", "inorganic phosphorus"], ranges: [{ low: 2.5, high: 4.5 }], panel: "kft" },
  { label: "Uric acid", aliases: ["uric acid", "ua", "serum uric acid"], ranges: [{ low: 3.5, high: 7.2 }], panel: "kft", minor: true },

  // --- LFT: shown only where deranged; ALP is the one a biliary patient keeps -----------------
  { label: "T. bilirubin", aliases: ["bilirubin", "total bilirubin", "t bilirubin", "t. bilirubin", "serum bilirubin", "s. bilirubin", "sr. bilirubin"], ranges: [{ low: 0.2, high: 1.2 }], panel: "lft" },
  { label: "D. bilirubin", aliases: ["direct bilirubin", "d bilirubin", "d. bilirubin", "conjugated bilirubin"], ranges: [{ low: 0, high: 0.3 }], panel: "lft" },
  { label: "SGOT", aliases: ["sgot", "ast", "aspartate transaminase"], ranges: [{ low: 5, high: 40 }], panel: "lft" },
  { label: "SGPT", aliases: ["sgpt", "alt", "alanine transaminase"], ranges: [{ low: 5, high: 40 }], panel: "lft" },
  { label: "ALP", aliases: ["alp", "alkaline phosphatase", "s. alp", "sap"], ranges: [{ low: 40, high: 130 }], panel: "lft" },
  { label: "GGT", aliases: ["ggt", "gamma gt", "gamma-glutamyl transferase", "ggtp"], ranges: [{ low: 9, high: 48 }], panel: "lft" },
  { label: "Albumin", aliases: ["albumin", "serum albumin"], ranges: [{ low: 3.5, high: 5.2 }], panel: "lft" },
  { label: "Total protein", aliases: ["total protein", "serum protein"], ranges: [{ low: 6, high: 8.3 }], panel: "lft" },

  // --- Coagulation, pancreatic, inflammatory, ABG -------------------------------------------
  { label: "INR", aliases: ["inr", "pt inr", "pt-inr", "pt/inr"], ranges: [{ low: 0.8, high: 1.2 }], panel: "coag" },
  { label: "PT", aliases: ["pt", "prothrombin time"], ranges: [{ low: 11, high: 15 }], panel: "coag" },
  { label: "APTT", aliases: ["aptt", "activated partial thromboplastin time", "ptt"], ranges: [{ low: 25, high: 35 }], panel: "coag" },
  { label: "Amylase", aliases: ["amylase", "serum amylase"], ranges: [{ low: 30, high: 110 }], panel: "pancreatic" },
  { label: "Lipase", aliases: ["lipase", "serum lipase"], ranges: [{ low: 10, high: 140 }], panel: "pancreatic" },
  { label: "CRP", aliases: ["crp", "c reactive protein", "c-reactive protein"], ranges: [{ low: 0, high: 5 }], panel: "inflammatory" },
  { label: "Lactate", aliases: ["lactate", "serum lactate"], ranges: [{ low: 0.5, high: 2 }], panel: "abg" },
  { label: "pH", aliases: ["ph"], ranges: [{ low: 7.35, high: 7.45 }], panel: "abg" },
  { label: "HCO₃", aliases: ["hco3", "bicarbonate", "bicarb"], ranges: [{ low: 22, high: 26 }], panel: "abg" },
  { label: "pCO₂", aliases: ["pco2"], ranges: [{ low: 35, high: 45 }], panel: "abg" },
];

/** The resident's own word for it. Their judgement needs no reference range behind it. */
const SAID_HIGH = /\b(raised|elevated|high|increased|rising)\b/i;
const SAID_LOW = /\b(low|reduced|decreased|dropping|dropped|falling)\b/i;
const SAID_ABNORMAL = /\b(deranged|derangement|abnormal|grossly)\b/i;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Where the range that judged a result came from, weakest last. */
export type RangeSource = "report" | "ward" | "builtin";

export type LabReading = {
  label: string;
  /** The value exactly as recorded. Never rewritten, never rounded, never unit-converted. */
  value: string;
  flag: LabFlag | null;
  /** "13–17" — the range the flag was judged against, so the judgement can be checked. */
  range: string | null;
  /** Which authority that range came from. Null when the resident's own wording decided it. */
  source: RangeSource | null;
};

/** An externally supplied range: printed on the report, or accumulated for this ward. */
export type SuppliedRange = {
  low: number | null;
  high: number | null;
  /** As printed, preferred for display over anything reconstructed from the numbers. */
  text?: string | null;
  source: RangeSource;
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
  sex: string | null,
  supplied?: SuppliedRange | null
): LabReading | null {
  const def = findLab(label);
  // A supplied range makes any analyte judgeable, including ones this file has never heard of —
  // which is the point of reading ranges off the report. With neither a definition nor a
  // supplied range there is nothing to judge against, so the caller shows it as an ordinary
  // finding rather than this function pretending to an opinion.
  if ((!def && !supplied) || !value || !value.trim()) return null;

  const name = def?.label ?? label;
  const v = value.trim();

  // What the resident said outranks any range: they were looking at the patient.
  const said = (flag: LabFlag): LabReading => ({ label: name, value: v, flag, range: null, source: null });
  if (SAID_ABNORMAL.test(v)) return said("abnormal");
  if (SAID_HIGH.test(v)) return said("high");
  if (SAID_LOW.test(v)) return said("low");

  const n = firstNumber(v);
  // An unreadable value is shown, not judged — flag null with no range means "we could not
  // tell", and the caller must display it rather than fold it away.
  if (n === null) return { label: name, value: v, flag: null, range: null, source: null };

  // The report's own printed range beats the ward's accumulated one, which beats the built-in
  // table. The one printed beside this very number is the closest thing to ground truth there is.
  let low: number | null;
  let high: number | null;
  let printed: string;
  let source: RangeSource;

  if (supplied && (supplied.low !== null || supplied.high !== null)) {
    low = supplied.low;
    high = supplied.high;
    source = supplied.source;
    printed =
      supplied.text?.trim() ||
      (low !== null && high !== null
        ? `${trim(low)}–${trim(high)}`
        : low !== null
          ? `> ${trim(low)}`
          : `< ${trim(high as number)}`);
  } else if (def) {
    const r = pickRange(n, pickRanges(def, sex));
    low = r.low;
    high = r.high;
    printed = `${trim(r.low)}–${trim(r.high)}`;
    source = "builtin";
  } else {
    return { label: name, value: v, flag: null, range: null, source: null };
  }

  if (low !== null && n < low) return { label: name, value: v, flag: "low", range: printed, source };
  if (high !== null && n > high) return { label: name, value: v, flag: "high", range: printed, source };
  return { label: name, value: v, flag: null, range: printed, source };
}

/** True when this label is a blood result at all — normal or not. */
export function isKnownLab(label: string): boolean {
  return findLab(label) !== null;
}

/**
 * The name an analyte accumulates under, so "Haemoglobin", "HAEMOGLOBIN" and "Hb" all land on
 * one row of the ward's reference table instead of three. Unknown analytes keep their own
 * normalised name — the ward table is allowed to learn tests this file has never heard of, and
 * that is most of the value in reading ranges off real reports.
 */
export function canonicalLabName(label: string): string {
  return findLab(label)?.label ?? norm(label);
}

/** The report a known analyte sits on, or null for one this file has no panel for. */
export function labPanel(label: string): LabPanel | null {
  return findLab(label)?.panel ?? null;
}

/**
 * True for a result that is never worth foregrounding even when it is out of range — a
 * red-cell index, an eosinophil fraction, a urate. The resident asked for these to stay out
 * of the way; they are still recorded and still shown when the fold is opened.
 */
export function isMinorLab(label: string): boolean {
  return findLab(label)?.minor === true;
}

/**
 * Sort key for the results kept on the face of the card. Potassium leads its panel — a
 * dangerous K is the electrolyte a round acts on first — then the rest hold the order they
 * were recorded in.
 */
export function keyLabRank(label: string): number {
  return canonicalLabName(label) === "K" ? 0 : 1;
}
