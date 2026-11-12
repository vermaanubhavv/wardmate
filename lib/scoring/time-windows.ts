/**
 * Time-window helpers. Every one REQUIRES an explicit window — there is no "latest value"
 * shortcut, because mixing admission / first-24h / post-resuscitation / 48-hour values is the
 * exact failure the DOCX forbids ("Time windows are part of the definition").
 *
 * Pure functions over `EngineInput[]`. No database, no clock except the `now` passed in.
 */

import type { EngineInput, InstanceClock, Instant, TimeWindow } from "./types";

const HOUR_MS = 3_600_000;

export type ResolvedWindow = { startMs: number | null; endMs: number | null; window: TimeWindow };

/** Resolve a definition window to absolute epoch-ms bounds for this instance. Every window is
 *  anchored at admission (the only anchor any definition uses). */
export function resolveWindow(window: TimeWindow, clock: InstanceClock): ResolvedWindow {
  const base = Date.parse(clock.admission);
  const startMs = window.startHours != null ? base + window.startHours * HOUR_MS : base;
  const endMs = window.endHours != null ? base + window.endHours * HOUR_MS : null;
  return { startMs, endMs, window };
}

/** True when `at` falls inside the resolved window (start inclusive, end inclusive). */
function inWindow(at: Instant, rw: ResolvedWindow): boolean {
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

function highestValue(inputs: EngineInput[], key: string, rw: ResolvedWindow): EngineInput | null {
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
