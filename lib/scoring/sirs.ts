/**
 * SIRS, computed from whatever of temperature / heart rate / respiratory rate (or PaCO₂) /
 * WBC (or band %) is available in the given window, using the standard definition.
 *
 * Standard criteria (≥ 2 for SIRS):
 *   1. Temperature > 38 °C or < 36 °C
 *   2. Heart rate > 90 /min
 *   3. Respiratory rate > 20 /min OR PaCO₂ < 32 mmHg
 *   4. WBC > 12,000/mm³ or < 4,000/mm³ OR > 10 % immature (band) forms
 *
 * The locally approved definition can be swapped via config later; this is the default.
 *
 * Returns `not_evaluable` UNLESS at least two criteria could actually be assessed AND the
 * result is not already decidable — i.e. we never say "SIRS absent" when we only had one
 * value. If two criteria are already met, SIRS is `present` even with the rest missing.
 */

import type { EngineInput } from "./types";
import type { ResolvedWindow } from "./time-windows";
import { worstValue } from "./time-windows";

export type SirsCriterion = {
  id: "temperature" | "heart_rate" | "respiratory_rate" | "wbc";
  label: string;
  status: "met" | "not_met" | "unknown";
  value: string | null;
  sourceId: string | null;
  sourceAt: string | null;
};

export type SirsResult = {
  status: "present" | "absent" | "not_evaluable";
  metCount: number;
  assessableCount: number;
  criteria: SirsCriterion[];
};

export function evaluateSirs(inputs: EngineInput[], rw: ResolvedWindow): SirsResult {
  const temp = worstValue(inputs, "temp", rw, "high");
  const tempLow = worstValue(inputs, "temp", rw, "low");
  const hr = worstValue(inputs, "hr", rw, "high");
  const rr = worstValue(inputs, "rr", rw, "high");
  const paco2 = worstValue(inputs, "paco2", rw, "low");
  const wbcHigh = worstValue(inputs, "wbc", rw, "high");
  const wbcLow = worstValue(inputs, "wbc", rw, "low");
  const bands = worstValue(inputs, "band_percent", rw, "high");

  const criteria: SirsCriterion[] = [];

  // 1. Temperature
  {
    const hot = temp && temp.value != null && temp.value > 38;
    const cold = tempLow && tempLow.value != null && tempLow.value < 36;
    const src = hot ? temp : cold ? tempLow : (temp ?? tempLow);
    criteria.push({
      id: "temperature",
      label: "Temp > 38 °C or < 36 °C",
      status: hot || cold ? "met" : src ? "not_met" : "unknown",
      value: src ? `${src.value} ${src.unit ?? ""}`.trim() : null,
      sourceId: src?.sourceId ?? null,
      sourceAt: src?.at ?? null,
    });
  }
  // 2. Heart rate
  criteria.push({
    id: "heart_rate",
    label: "Heart rate > 90 /min",
    status: hr && hr.value != null ? (hr.value > 90 ? "met" : "not_met") : "unknown",
    value: hr ? `${hr.value} /min` : null,
    sourceId: hr?.sourceId ?? null,
    sourceAt: hr?.at ?? null,
  });
  // 3. Respiratory rate OR PaCO₂
  {
    const rrMet = rr && rr.value != null && rr.value > 20;
    const paco2Met = paco2 && paco2.value != null && paco2.value < 32;
    const src = rrMet ? rr : paco2Met ? paco2 : (rr ?? paco2);
    criteria.push({
      id: "respiratory_rate",
      label: "RR > 20 /min or PaCO₂ < 32 mmHg",
      status: rrMet || paco2Met ? "met" : src ? "not_met" : "unknown",
      value: src ? `${src.value} ${src.unit ?? ""}`.trim() : null,
      sourceId: src?.sourceId ?? null,
      sourceAt: src?.at ?? null,
    });
  }
  // 4. WBC OR bands
  {
    const highMet = wbcHigh && wbcHigh.value != null && wbcHigh.value > 12000;
    const lowMet = wbcLow && wbcLow.value != null && wbcLow.value < 4000;
    const bandMet = bands && bands.value != null && bands.value > 10;
    const src = highMet ? wbcHigh : lowMet ? wbcLow : bandMet ? bands : (wbcHigh ?? wbcLow ?? bands);
    criteria.push({
      id: "wbc",
      label: "WBC > 12,000 or < 4,000 /mm³ or > 10 % bands",
      status: highMet || lowMet || bandMet ? "met" : src ? "not_met" : "unknown",
      value: src ? `${src.value} ${src.unit ?? ""}`.trim() : null,
      sourceId: src?.sourceId ?? null,
      sourceAt: src?.at ?? null,
    });
  }

  const metCount = criteria.filter((c) => c.status === "met").length;
  const assessableCount = criteria.filter((c) => c.status !== "unknown").length;

  let status: SirsResult["status"];
  if (metCount >= 2) status = "present";
  else if (assessableCount === 4) status = "absent";
  else status = "not_evaluable";

  return { status, metCount, assessableCount, criteria };
}
