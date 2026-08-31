/**
 * Test fixtures for the scoring engine. Every value carries an explicit unit and timestamp
 * (DOCX acceptance test: "Use fixed clinical fixtures with explicit units and timestamps").
 */

import type { CardDefinition, EngineInput, InstanceClock } from "../types";
import type { EvaluateContext, EvaluateContext as _EC } from "../engine";
import { acutePancreatitisV1, PANCREATITIS_EXTENDED_CARDS } from "../definitions/acute-pancreatitis.v1";

export const ADMISSION = "2026-01-10T00:00:00+05:30"; // 10 Jan 2026, midnight IST
export const H = (n: number) => new Date(Date.parse(ADMISSION) + n * 3_600_000).toISOString();

export function clock(nowHours = 12, opts: Partial<InstanceClock> = {}): InstanceClock {
  return {
    admission: ADMISSION,
    symptomOnset: null,
    activation: ADMISSION,
    now: H(nowHours),
    ...opts,
  };
}

let seq = 0;
export function input(
  key: string,
  value: number | null,
  unit: string | null,
  atHours: number,
  extra: Partial<EngineInput> = {}
): EngineInput {
  seq += 1;
  return {
    key,
    value,
    unit,
    text: extra.text ?? (value != null ? String(value) : null),
    original: extra.original ?? { value: value != null ? String(value) : "", unit },
    at: H(atHours),
    sourceId: `obs-${seq}`,
    sourceQuote: extra.sourceQuote ?? `${key} ${value ?? ""} ${unit ?? ""}`.trim(),
    refLow: extra.refLow ?? null,
    refHigh: extra.refHigh ?? null,
    ...(extra.unitError ? { unitError: extra.unitError } : {}),
  };
}

export function ctx(inputs: EngineInput[], over: Partial<_EC> = {}): EvaluateContext {
  return {
    inputs,
    clock: over.clock ?? clock(over.now ? undefined : 12),
    checkpointDueAt: over.checkpointDueAt ?? {},
    overrides: over.overrides ?? {},
    verification: over.verification ?? {},
    classificationInputs: over.classificationInputs,
    assessedComponents: over.assessedComponents ?? {},
    now: over.now ?? (over.clock ?? clock()).now,
  } as EvaluateContext;
}

export function card(cardId: string): CardDefinition {
  const c = [...acutePancreatitisV1.cards, ...PANCREATITIS_EXTENDED_CARDS].find((x) => x.cardId === cardId);
  if (!c) throw new Error(`no card ${cardId}`);
  return c;
}

export { acutePancreatitisV1 };
