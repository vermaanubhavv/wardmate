/**
 * Time-window helpers. Every one REQUIRES an explicit window — there is no "latest value"
 * shortcut, because mixing admission / first-24h / post-resuscitation / 48-hour values is the
 * exact failure the DOCX forbids ("Time windows are part of the definition").
 *
 * Pure functions over `EngineInput[]`. No database, no clock except the `now` passed in.
 */

import type {
  EngineInput,
  InstanceClock,
  Instant,
  TimeWindow,
  WindowAnchor,
} from "./types";

const HOUR_MS = 3_600_000;

function anchorInstant(anchor: WindowAnchor, clock: InstanceClock, checkpointAt: Instant | null): Instant | null {
  switch (anchor) {
    case "admission":
      return clock.admission;
    case "symptom_onset":
      return clock.symptomOnset;
    case "activation":
      return clock.activation;
    case "checkpoint":
      return checkpointAt;
  }
}

export type ResolvedWindow = { startMs: number | null; endMs: number | null; window: TimeWindow };

/** Resolve a definition window to absolute epoch-ms bounds for this instance. */
export function resolveWindow(
  window: TimeWindow,
  clock: InstanceClock,
  checkpointAt: Instant | null = null
): ResolvedWindow {
  const anchor = anchorInstant(window.anchor, clock, checkpointAt);
  if (anchor === null) return { startMs: null, endMs: null, window };
  const base = Date.parse(anchor);
  const startMs = window.startHours != null ? base + window.startHours * HOUR_MS : base;
  const endMs = window.endHours != null ? base + window.endHours * HOUR_MS : null;
  return { startMs, endMs, window };
}

/** True when `at` falls inside the resolved window (start inclusive, end inclusive). */
export function inWindow(at: Instant, rw: ResolvedWindow): boolean {
  if (rw.startMs === null) return false;
  const t = Date.parse(at);
  if (Number.isNaN(t)) return false;
  if (t < rw.startMs) return false;
  if (rw.endMs !== null && t > rw.endMs) return false;
  return true;
}

/** All inputs for `key` that fall inside the window, oldest first. */
export function valuesInWindow(inputs: EngineInput[], key: string, rw: ResolvedWindow): EngineInput[] {
  return inputs
    .filter((i) => i.key === key && inWindow(i.at, rw))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

// ---------------------------------------------------------------------------
// Selectors — each returns a single EngineInput or null (never a fabricated zero)
// ---------------------------------------------------------------------------

/** The value nearest the window start (used for "admission value"). */
export function admissionValue(inputs: EngineInput[], key: string, rw: ResolvedWindow): EngineInput | null {
  const vs = valuesInWindow(inputs, key, rw);
  if (vs.length === 0 || rw.startMs === null) return null;
  return vs.reduce((best, v) =>
    Math.abs(Date.parse(v.at) - rw.startMs!) < Math.abs(Date.parse(best.at) - rw.startMs!) ? v : best
  );
}

/** Earliest value in the window ("first available value"). */
export function firstAvailable(inputs: EngineInput[], key: string, rw: ResolvedWindow): EngineInput | null {
  return valuesInWindow(inputs, key, rw)[0] ?? null;
}

export function highestValue(inputs: EngineInput[], key: string, rw: ResolvedWindow): EngineInput | null {
  const vs = valuesInWindow(inputs, key, rw).filter((v) => v.value != null);
  if (vs.length === 0) return null;
  return vs.reduce((best, v) => ((v.value as number) > (best.value as number) ? v : best));
}

export function lowestValue(inputs: EngineInput[], key: string, rw: ResolvedWindow): EngineInput | null {
  const vs = valuesInWindow(inputs, key, rw).filter((v) => v.value != null);
  if (vs.length === 0) return null;
  return vs.reduce((best, v) => ((v.value as number) < (best.value as number) ? v : best));
}

/**
 * The "worst" value for a criterion — the one that most favours the criterion being met.
 * `direction: "high"` picks the maximum (e.g. WBC > 16,000), `"low"` picks the minimum
 * (e.g. calcium < 8).
 */
export function worstValue(
  inputs: EngineInput[],
  key: string,
  rw: ResolvedWindow,
  direction: "high" | "low"
): EngineInput | null {
  return direction === "high" ? highestValue(inputs, key, rw) : lowestValue(inputs, key, rw);
}

/** Value at (nearest to, and not after) the checkpoint instant, within the window. */
export function valueAtCheckpoint(
  inputs: EngineInput[],
  key: string,
  rw: ResolvedWindow,
  checkpointAt: Instant
): EngineInput | null {
  const t = Date.parse(checkpointAt);
  const vs = valuesInWindow(inputs, key, rw).filter((v) => Date.parse(v.at) <= t);
  return vs.length ? vs[vs.length - 1] : null;
}

/**
 * Change from baseline: (selected value in `rw`) − (selected value in `baselineRw`).
 * Returns null unless BOTH endpoints exist — a fall/rise cannot be asserted from one reading.
 */
export function changeFromBaseline(
  inputs: EngineInput[],
  key: string,
  rw: ResolvedWindow,
  baselineRw: ResolvedWindow,
  select: (i: EngineInput[], k: string, w: ResolvedWindow) => EngineInput | null
): { delta: number; current: EngineInput; baseline: EngineInput } | null {
  const baseline = select(inputs, key, baselineRw);
  const current = select(inputs, key, rw);
  if (!baseline || !current || baseline.value == null || current.value == null) return null;
  return { delta: round(current.value - baseline.value, 2), current, baseline };
}

/**
 * Total hours a value for `key` stayed at/above `threshold` within the window. Used for the
 * Atlanta persistence timer ("organ failure ≥ 48 h"). Conservative: only counts spans between
 * consecutive in-window readings that are BOTH above threshold.
 */
export function durationAboveThreshold(
  inputs: EngineInput[],
  key: string,
  rw: ResolvedWindow,
  threshold: number,
  direction: "above" | "below" = "above"
): number {
  const vs = valuesInWindow(inputs, key, rw).filter((v) => v.value != null);
  let hours = 0;
  for (let n = 1; n < vs.length; n++) {
    const a = vs[n - 1].value as number;
    const b = vs[n].value as number;
    const meets = (x: number) => (direction === "above" ? x >= threshold : x <= threshold);
    if (meets(a) && meets(b)) {
      hours += (Date.parse(vs[n].at) - Date.parse(vs[n - 1].at)) / HOUR_MS;
    }
  }
  return round(hours, 1);
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
