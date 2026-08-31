/**
 * Safe unit normalisation for the analytes the scoring engine reasons about.
 *
 * RULES (DOCX "Units"):
 *  - Preserve the original value and unit — the caller keeps `original`, this only returns the
 *    converted number.
 *  - Reject ambiguous or unsupported units. Never guess. A rejected unit makes the component
 *    `unknown`, never zero or normal.
 *  - Where a criterion depends on the laboratory's own limit of normal, the caller uses the
 *    printed reference range instead of a converted absolute — this file is only for the
 *    threshold-based criteria (BISAP BUN, Ranson cut-offs, Marshall creatinine, etc.).
 *
 * Canonical units used by the engine:
 *  bun mg/dL · urea mg/dL · glucose mg/dL · calcium mg/dL · creatinine mg/dL ·
 *  wbc cells/mm3 · ldh IU/L · ast IU/L · pao2 mmHg · base_deficit mEq/L · hct % ·
 *  sbp mmHg · hr /min · rr /min · temp C · paco2 mmHg · fio2 fraction · pf_ratio mmHg
 */

export type UnitResult =
  | { ok: true; value: number; unit: string }
  | { ok: false; reason: "unsupported_unit" | "ambiguous_unit"; detail: string };

const clean = (u: string | null | undefined) =>
  (u ?? "")
    .toLowerCase()
    .replace(/µ/g, "u")
    .replace(/\s+/g, "")
    .replace(/per/g, "/")
    .trim();

/** Molar masses / factors for the conversions we actually support. */
const MMOL_L_TO_MG_DL: Record<string, number> = {
  // BUN (as nitrogen): 1 mmol/L urea-N ≈ 2.8 mg/dL BUN
  bun: 2.8,
  // Urea (whole molecule): 1 mmol/L ≈ 6.0 mg/dL
  urea: 6.006,
  glucose: 18.016,
  calcium: 4.008, // 1 mmol/L Ca ≈ 4.0 mg/dL
  creatinine: null as unknown as number, // handled below (µmol/L)
};

type Analyte =
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
  | "fio2";

const CANONICAL: Record<Analyte, string> = {
  bun: "mg/dL",
  urea: "mg/dL",
  glucose: "mg/dL",
  calcium: "mg/dL",
  creatinine: "mg/dL",
  wbc: "cells/mm3",
  ldh: "IU/L",
  ast: "IU/L",
  pao2: "mmHg",
  base_deficit: "mEq/L",
  hct: "%",
  sbp: "mmHg",
  hr: "/min",
  rr: "/min",
  temp: "C",
  paco2: "mmHg",
  fio2: "fraction",
};

/**
 * Normalise a recorded (value, unit) for `analyte` into the engine's canonical unit.
 *
 * A missing unit is accepted ONLY where the analyte has one near-universal ward unit in
 * Indian practice (mg/dL for the chemistry panel, mmHg for pressures). WBC with no unit is
 * ambiguous ("11.2" vs "11200") and is rejected rather than guessed.
 */
export function normalizeUnit(
  analyte: Analyte,
  rawValue: number,
  rawUnit: string | null
): UnitResult {
  if (!Number.isFinite(rawValue)) {
    return { ok: false, reason: "unsupported_unit", detail: "value is not a number" };
  }
  const u = clean(rawUnit);
  const canon = CANONICAL[analyte];

  // -- Chemistry panel: mg/dL canonical, mmol/L (or µmol/L for creatinine) convertible ------
  if (["bun", "urea", "glucose", "calcium", "creatinine"].includes(analyte)) {
    if (u === "" || u === "mg/dl" || u === "mgpercent" || u === "mg%") {
      return { ok: true, value: rawValue, unit: canon };
    }
    if (analyte === "creatinine" && (u === "umol/l" || u === "umol/dl")) {
      // 1 mg/dL creatinine = 88.42 µmol/L
      return { ok: true, value: round(rawValue / 88.42), unit: canon };
    }
    if (u === "mmol/l") {
      const f = MMOL_L_TO_MG_DL[analyte];
      if (!f) return { ok: false, reason: "unsupported_unit", detail: `mmol/L for ${analyte}` };
      return { ok: true, value: round(rawValue * f), unit: canon };
    }
    if (u === "g/l" || u === "g/dl" || u === "mg/l") {
      return { ok: false, reason: "ambiguous_unit", detail: `${rawUnit} for ${analyte}` };
    }
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for ${analyte}` };
  }

  // -- WBC: count. Reject unitless (scale ambiguous). ---------------------------------------
  if (analyte === "wbc") {
    if (u === "cells/mm3" || u === "/mm3" || u === "/ul" || u === "cells/ul" || u === "/cumm") {
      return { ok: true, value: rawValue, unit: canon };
    }
    if (u === "x10^9/l" || u === "10^9/l" || u === "x10e9/l" || u === "10*9/l" || u === "k/ul" || u === "10^3/ul") {
      return { ok: true, value: round(rawValue * 1000), unit: canon };
    }
    if (u === "") {
      return { ok: false, reason: "ambiguous_unit", detail: "WBC with no unit (11.2 vs 11200)" };
    }
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for WBC` };
  }

  // -- Haematocrit: percent, or fraction (0–1). --------------------------------------------
  if (analyte === "hct") {
    if (u === "%" || u === "") {
      if (rawValue > 0 && rawValue <= 1) return { ok: true, value: round(rawValue * 100), unit: "%" };
      return { ok: true, value: rawValue, unit: "%" };
    }
    if (u === "l/l" || u === "fraction") return { ok: true, value: round(rawValue * 100), unit: "%" };
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for haematocrit` };
  }

  // -- Enzymes: IU/L ≡ U/L. ---------------------------------------------------------------
  if (analyte === "ldh" || analyte === "ast") {
    if (u === "iu/l" || u === "u/l" || u === "") return { ok: true, value: rawValue, unit: canon };
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for ${analyte}` };
  }

  // -- Pressures / gases: mmHg canonical, kPa convertible. --------------------------------
  if (analyte === "pao2" || analyte === "paco2" || analyte === "sbp") {
    if (u === "mmhg" || u === "") return { ok: true, value: rawValue, unit: "mmHg" };
    if (u === "kpa") return { ok: true, value: round(rawValue * 7.50062), unit: "mmHg" };
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for ${analyte}` };
  }

  // -- Base deficit / excess: mEq/L ≡ mmol/L. --------------------------------------------
  if (analyte === "base_deficit") {
    if (u === "meq/l" || u === "mmol/l" || u === "") return { ok: true, value: rawValue, unit: canon };
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for base deficit` };
  }

  // -- Rates. ---------------------------------------------------------------------------
  if (analyte === "hr" || analyte === "rr") {
    if (u === "/min" || u === "bpm" || u === "" || u === "breaths/min") {
      return { ok: true, value: rawValue, unit: canon };
    }
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for ${analyte}` };
  }

  // -- Temperature: Celsius canonical, Fahrenheit convertible. ---------------------------
  if (analyte === "temp") {
    if (u === "c" || u === "°c" || u === "") {
      // A value in the 96–108 range with no unit is almost certainly Fahrenheit; but rather
      // than guess, only convert when F is explicit. Unitless is taken as Celsius.
      return { ok: true, value: rawValue, unit: "C" };
    }
    if (u === "f" || u === "°f") return { ok: true, value: round(((rawValue - 32) * 5) / 9, 2), unit: "C" };
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for temperature` };
  }

  // -- FiO2: fraction canonical, percent convertible. -----------------------------------
  if (analyte === "fio2") {
    if (u === "" || u === "fraction") {
      if (rawValue > 1) return { ok: true, value: round(rawValue / 100, 3), unit: "fraction" };
      return { ok: true, value: rawValue, unit: "fraction" };
    }
    if (u === "%") return { ok: true, value: round(rawValue / 100, 3), unit: "fraction" };
    return { ok: false, reason: "unsupported_unit", detail: `${rawUnit} for FiO2` };
  }

  return { ok: false, reason: "unsupported_unit", detail: `${rawUnit ?? "(none)"} for ${analyte}` };
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export const SUPPORTED_ANALYTES: readonly string[] = Object.keys(CANONICAL);
export function canonicalUnitFor(analyte: string): string | null {
  return (CANONICAL as Record<string, string>)[analyte] ?? null;
}
