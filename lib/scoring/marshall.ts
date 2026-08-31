/**
 * Modified Marshall organ-dysfunction scoring and the Revised Atlanta classification for
 * acute pancreatitis (DOCX Card C).
 *
 * Modified Marshall (each system 0–4; organ failure = score ≥ 2):
 *   Respiratory  PaO₂/FiO₂:  >400=0 · 301–400=1 · 201–300=2 · 101–200=3 · ≤101=4
 *   Renal        creatinine (mg/dL): <1.4=0 · 1.4–1.8=1 · 1.9–3.6=2 · 3.7–4.9=3 · >4.9=4
 *   Cardiovascular  SBP (mmHg, off inotropes): >90=0 · <90 fluid-responsive=1 ·
 *                   <90 not fluid-responsive=2 · pH<7.3=3 · pH<7.2=4
 *
 * Revised Atlanta severity:
 *   Mild              — no organ failure AND no local/systemic complication
 *   Moderately severe — transient organ failure (< 48 h) and/or local/systemic complication
 *   Severe            — persistent organ failure (≥ 48 h)
 *
 * The persistence timer is started by the engine when a system first reaches ≥ 2; this file
 * only classifies given the measured duration. Organ failure is NEVER labelled persistent
 * before 48 h have actually elapsed.
 */

import type { EngineInput } from "./types";
import type { ResolvedWindow } from "./time-windows";
import { worstValue, lowestValue } from "./time-windows";

export type OrganSystem = "respiratory" | "renal" | "cardiovascular";

export type MarshallSystemScore = {
  system: OrganSystem;
  score: number | null; // null = not evaluable
  organFailure: boolean; // score ≥ 2
  basis: string | null; // e.g. "P/F 180"
  sourceId: string | null;
  sourceAt: string | null;
};

export type MarshallResult = {
  systems: MarshallSystemScore[];
  anyOrganFailure: boolean;
  evaluable: boolean;
};

function respiratoryScore(pf: number): number {
  if (pf > 400) return 0;
  if (pf > 300) return 1;
  if (pf > 200) return 2;
  if (pf > 100) return 3;
  return 4;
}

function renalScore(cr: number): number {
  if (cr < 1.4) return 0;
  if (cr <= 1.8) return 1;
  if (cr <= 3.6) return 2;
  if (cr <= 4.9) return 3;
  return 4;
}

export function evaluateMarshall(inputs: EngineInput[], rw: ResolvedWindow): MarshallResult {
  const systems: MarshallSystemScore[] = [];

  // Respiratory — prefer a directly recorded P/F ratio; else derive from PaO₂ + FiO₂.
  {
    const pf = worstValue(inputs, "pf_ratio", rw, "low");
    let basis: string | null = null;
    let sourceId: string | null = null;
    let sourceAt: string | null = null;
    let score: number | null = null;
    if (pf && pf.value != null) {
      score = respiratoryScore(pf.value);
      basis = `P/F ${pf.value}`;
      sourceId = pf.sourceId;
      sourceAt = pf.at;
    } else {
      const pao2 = worstValue(inputs, "pao2", rw, "low");
      const fio2 = worstValue(inputs, "fio2", rw, "high");
      if (pao2 && pao2.value != null && fio2 && fio2.value != null && fio2.value > 0) {
        const ratio = Math.round(pao2.value / fio2.value);
        score = respiratoryScore(ratio);
        basis = `P/F ${ratio} (PaO₂ ${pao2.value} / FiO₂ ${fio2.value})`;
        sourceId = pao2.sourceId;
        sourceAt = pao2.at;
      }
    }
    systems.push({
      system: "respiratory",
      score,
      organFailure: score != null && score >= 2,
      basis,
      sourceId,
      sourceAt,
    });
  }

  // Renal — creatinine.
  {
    const cr = worstValue(inputs, "creatinine", rw, "high");
    const score = cr && cr.value != null ? renalScore(cr.value) : null;
    systems.push({
      system: "renal",
      score,
      organFailure: score != null && score >= 2,
      basis: cr && cr.value != null ? `creatinine ${cr.value} mg/dL` : null,
      sourceId: cr?.sourceId ?? null,
      sourceAt: cr?.at ?? null,
    });
  }

  // Cardiovascular — SBP and pH. Fluid-responsiveness is not something the engine can infer,
  // so <90 without a pH is scored 1 (transient/fluid-responsive assumption is the safest that
  // still flags a low pressure); pH < 7.3 → 3, pH < 7.2 → 4.
  {
    const sbp = lowestValue(inputs, "sbp", rw);
    const ph = lowestValue(inputs, "ph", rw);
    let score: number | null = null;
    let basis: string | null = null;
    let sourceId: string | null = null;
    let sourceAt: string | null = null;
    if (ph && ph.value != null && ph.value < 7.2) {
      score = 4;
      basis = `pH ${ph.value}`;
      sourceId = ph.sourceId;
      sourceAt = ph.at;
    } else if (ph && ph.value != null && ph.value < 7.3) {
      score = 3;
      basis = `pH ${ph.value}`;
      sourceId = ph.sourceId;
      sourceAt = ph.at;
    } else if (sbp && sbp.value != null) {
      score = sbp.value > 90 ? 0 : 1;
      basis = `SBP ${sbp.value} mmHg`;
      sourceId = sbp.sourceId;
      sourceAt = sbp.at;
    }
    systems.push({
      system: "cardiovascular",
      score,
      organFailure: score != null && score >= 2,
      basis,
      sourceId,
      sourceAt,
    });
  }

  const evaluable = systems.some((s) => s.score != null);
  return { systems, anyOrganFailure: systems.some((s) => s.organFailure), evaluable };
}

// ---------------------------------------------------------------------------
// Revised Atlanta
// ---------------------------------------------------------------------------

export type AtlantaInput = {
  /** Any organ system currently at Marshall ≥ 2. */
  organFailurePresent: boolean;
  /**
   * Longest measured duration (hours) a system has stayed at ≥ 2, from the persistence timer.
   * Null when organ failure has never been recorded.
   */
  organFailureDurationHours: number | null;
  /** Whether organ failure has resolved (was present, now every system < 2). */
  organFailureResolved: boolean;
  localComplications: boolean | null;
  systemicComplications: boolean | null;
};

export type AtlantaResult = {
  classification: "mild" | "moderately_severe" | "severe" | "unknown";
  organFailureCategory: "none" | "transient" | "persistent" | "ongoing_under_48h" | "unknown";
  rationale: string;
};

const PERSISTENCE_HOURS = 48;

export function classifyAtlanta(a: AtlantaInput): AtlantaResult {
  const complicationsKnown = a.localComplications != null && a.systemicComplications != null;
  const anyComplication = Boolean(a.localComplications) || Boolean(a.systemicComplications);

  // Persistent organ failure ⇒ severe, but ONLY once ≥ 48 h have actually elapsed.
  if (a.organFailureDurationHours != null && a.organFailureDurationHours >= PERSISTENCE_HOURS) {
    return {
      classification: "severe",
      organFailureCategory: "persistent",
      rationale: `Organ failure documented for ${a.organFailureDurationHours} h (≥ 48 h).`,
    };
  }

  if (a.organFailurePresent) {
    return {
      classification: "moderately_severe",
      organFailureCategory: "ongoing_under_48h",
      rationale:
        "Organ failure currently present but < 48 h so far — not yet classifiable as persistent. Persistence check scheduled.",
    };
  }

  if (a.organFailureResolved) {
    return {
      classification: "moderately_severe",
      organFailureCategory: "transient",
      rationale: "Organ failure resolved within 48 h (transient).",
    };
  }

  // No organ failure ever.
  if (!complicationsKnown) {
    return {
      classification: "unknown",
      organFailureCategory: "none",
      rationale: "No organ failure recorded; local/systemic complication status not yet assessed.",
    };
  }
  if (anyComplication) {
    return {
      classification: "moderately_severe",
      organFailureCategory: "none",
      rationale: "Local or systemic complication without persistent organ failure.",
    };
  }
  return {
    classification: "mild",
    organFailureCategory: "none",
    rationale: "No organ failure and no local or systemic complication.",
  };
}

export { PERSISTENCE_HOURS };
