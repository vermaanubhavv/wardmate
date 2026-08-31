/**
 * The card evaluator: pure, deterministic, no I/O.
 *
 * `evaluateCard` turns a `CardDefinition` + the patient's available inputs into a `CardResult`
 * whose every component keeps raw value, unit, source, timestamp, window and points. It never
 * returns a bare number, never treats a missing value as zero/normal, and never moves a card
 * to `verified` on its own.
 */

import type {
  CardDefinition,
  CardResult,
  CardState,
  ComponentInput,
  ComponentResult,
  EngineInput,
  InstanceClock,
  Instant,
  MissingReason,
} from "./types";
import { evaluateRule } from "./operators";
import {
  admissionValue,
  changeFromBaseline,
  firstAvailable,
  resolveWindow,
  valueAtCheckpoint,
  valuesInWindow,
  worstValue,
  type ResolvedWindow,
} from "./time-windows";
import { evaluateSirs } from "./sirs";
import { classifyAtlanta, evaluateMarshall, type AtlantaInput } from "./marshall";

export type EvaluateContext = {
  inputs: EngineInput[];
  clock: InstanceClock;
  /** checkpointKey → due instant, for cards locked/anchored to a checkpoint. */
  checkpointDueAt: Record<string, Instant>;
  /** componentId → clinician override (kept and re-applied on every recompute). */
  overrides: Record<
    string,
    { value: string; numeric: number | null; reason: string; by: string; at: Instant }
  >;
  /** Prior verification, cleared by the caller when inputs changed materially. */
  verification: Record<string, { by: string; at: Instant; resultHash: string }>;
  /** Clinician-confirmed classification inputs for Atlanta-type cards. */
  classificationInputs?: {
    localComplications?: boolean | null;
    systemicComplications?: boolean | null;
    organFailureDurationHours?: number | null;
    organFailureResolved?: boolean | null;
  };
  now: Instant;
};

function selectValue(
  def: ComponentInput,
  inputs: EngineInput[],
  rw: ResolvedWindow,
  checkpointAt: Instant | null,
  clock: InstanceClock
): EngineInput | null {
  switch (def.selector) {
    case "admission":
      return admissionValue(inputs, def.inputKey, rw);
    case "first":
      return firstAvailable(inputs, def.inputKey, rw);
    case "highest":
      return worstValue(inputs, def.inputKey, rw, "high");
    case "lowest":
      return worstValue(inputs, def.inputKey, rw, "low");
    case "worst": {
      // "worst" = whichever extreme makes the rule more likely to be met.
      const dir =
        def.rule.op === "lt" || def.rule.op === "lte" ? "low" : "high";
      return worstValue(inputs, def.inputKey, rw, dir);
    }
    case "at_checkpoint":
      return checkpointAt ? valueAtCheckpoint(inputs, def.inputKey, rw, checkpointAt) : null;
    case "change_from_baseline": {
      if (!def.baselineWindow) return null;
      const baseRw = resolveWindow(def.baselineWindow, clock, checkpointAt);
      const dir = def.rule.op === "lt" || def.rule.op === "lte" ? "low" : "high";
      const sel = (i: EngineInput[], k: string, w: ResolvedWindow) => worstValue(i, k, w, dir);
      const cb = changeFromBaseline(inputs, def.inputKey, rw, baseRw, sel);
      if (!cb) return null;
      // Represent the delta as a synthetic input carrying both endpoints' provenance.
      return {
        ...cb.current,
        value: cb.delta,
        original: {
          value: `${cb.current.original.value} vs baseline ${cb.baseline.original.value}`,
          unit: cb.current.original.unit,
        },
        sourceQuote: `${cb.current.sourceQuote} · baseline: ${cb.baseline.sourceQuote}`,
      };
    }
  }
}

function componentUnknown(
  def: ComponentInput,
  rw: ResolvedWindow,
  reason: MissingReason
): ComponentResult {
  return {
    componentId: def.componentId,
    label: def.label,
    status: "unknown",
    rawValue: null,
    normalizedValue: null,
    unit: def.canonicalUnit,
    sourceId: null,
    sourceAt: null,
    window: rw.window,
    points: 0,
    contribution: null,
    missingReason: reason,
  };
}

function evaluateComponent(
  def: ComponentInput,
  ctx: EvaluateContext,
  checkpointAt: Instant | null
): ComponentResult {
  const rw = resolveWindow(def.window, ctx.clock, checkpointAt);

  // Clinician override wins, but the imported result is computed first and kept underneath.
  const imported = evaluateComponentRaw(def, ctx, rw, checkpointAt);
  const ov = ctx.overrides[def.componentId];
  if (!ov) return imported;

  const evalRes = evaluateRule(def.rule, ov.numeric, ov.value);
  const met = evalRes === "met";
  return {
    componentId: def.componentId,
    label: def.label,
    status: evalRes === "not_evaluable" ? "unknown" : met ? "satisfied" : "not_satisfied",
    rawValue: ov.value,
    normalizedValue: ov.numeric,
    unit: def.canonicalUnit,
    sourceId: null,
    sourceAt: ov.at,
    window: rw.window,
    points: met ? def.points : 0,
    contribution: null,
    missingReason: evalRes === "not_evaluable" ? "insufficient_inputs" : null,
    override: { value: ov.value, reason: ov.reason, by: ov.by, at: ov.at, original: strip(imported) },
  };
}

function strip(c: ComponentResult): Omit<ComponentResult, "override"> {
  const rest = { ...c };
  delete rest.override;
  return rest;
}

function evaluateComponentRaw(
  def: ComponentInput,
  ctx: EvaluateContext,
  rw: ResolvedWindow,
  checkpointAt: Instant | null
): ComponentResult {
  if (rw.startMs === null) return componentUnknown(def, rw, "checkpoint_not_due");

  // Composite input: SIRS present / absent, evaluated over this component's window.
  if (def.inputKey === "sirs_present") {
    const s = evaluateSirs(ctx.inputs, rw);
    if (s.status === "not_evaluable") {
      return { ...componentUnknown(def, rw, "insufficient_inputs"), rawValue: `${s.metCount}/${s.assessableCount} SIRS criteria assessable` };
    }
    const met = s.status === "present";
    const src = s.criteria.find((c) => c.status === "met") ?? null;
    return {
      componentId: def.componentId,
      label: def.label,
      status: met ? "satisfied" : "not_satisfied",
      rawValue: `${s.metCount} SIRS criteria met`,
      normalizedValue: s.metCount,
      unit: "criteria",
      sourceId: src?.sourceId ?? null,
      sourceAt: src?.sourceAt ?? null,
      window: rw.window,
      points: met ? def.points : 0,
      contribution: null,
      missingReason: null,
    };
  }

  // Are there any values for this key at all (regardless of window)?
  const anyForKey = ctx.inputs.filter((i) => i.key === def.inputKey);
  const inWin = valuesInWindow(ctx.inputs, def.inputKey, rw);

  if (anyForKey.length > 0 && inWin.length === 0) {
    return componentUnknown(def, rw, "outside_time_window");
  }

  const picked = selectValue(def, ctx.inputs, rw, checkpointAt, ctx.clock);
  if (!picked) {
    // A value WAS recorded in the window but its unit could not be resolved — surface that as
    // an ambiguous/unsupported-unit unknown with the raw value shown, never as "no data".
    const badUnit = inWin.find((i) => i.unitError);
    if (badUnit) {
      const reason: MissingReason = badUnit.unitError!.includes("ambiguous")
        ? "ambiguous_unit"
        : "unsupported_unit";
      return { ...componentUnknown(def, rw, reason), rawValue: badUnit.original.value };
    }
    return componentUnknown(def, rw, "no_data");
  }

  if (picked.unitError) {
    const reason: MissingReason = picked.unitError.includes("ambiguous")
      ? "ambiguous_unit"
      : "unsupported_unit";
    return { ...componentUnknown(def, rw, reason), rawValue: picked.original.value };
  }

  const evalRes = evaluateRule(def.rule, picked.value, picked.text);
  if (evalRes === "not_evaluable") {
    return { ...componentUnknown(def, rw, "insufficient_inputs"), rawValue: picked.original.value };
  }
  const met = evalRes === "met";
  return {
    componentId: def.componentId,
    label: def.label,
    status: met ? "satisfied" : "not_satisfied",
    rawValue: `${picked.original.value}${picked.original.unit ? " " + picked.original.unit : ""}`,
    normalizedValue: picked.value,
    unit: picked.unit ?? def.canonicalUnit,
    sourceId: picked.sourceId,
    sourceAt: picked.at,
    window: rw.window,
    points: met ? def.points : 0,
    contribution: null,
    missingReason: null,
  };
}

// ---------------------------------------------------------------------------
// Card-level
// ---------------------------------------------------------------------------

/**
 * Whether a card may be marked `verified` by a clinician. Never true while a mandatory
 * component is `unknown` — a score is not verifiable until every required input has a value
 * or an explicit not-applicable (DOCX safety rule: missing is not zero).
 */
export function canVerifyCard(r: CardResult): { ok: boolean; reason?: string } {
  if (r.state === "not_started") return { ok: false, reason: "nothing computed yet" };
  if (r.missingRequiredCount > 0) return { ok: false, reason: `${r.missingRequiredCount} required component(s) unknown` };
  if (r.state === "incomplete") return { ok: false, reason: "card incomplete" };
  return { ok: true };
}

export function evaluateCard(card: CardDefinition, ctx: EvaluateContext): CardResult {
  const checkpointAt =
    card.lockedUntilCheckpoint != null
      ? ctx.checkpointDueAt[card.lockedUntilCheckpoint] ?? null
      : null;

  // Locked-until-checkpoint card that is not due yet: every component reads checkpoint_not_due.
  const checkpointDue =
    card.lockedUntilCheckpoint == null ||
    (checkpointAt != null && Date.parse(ctx.now) >= Date.parse(checkpointAt));

  let components: ComponentResult[];
  let total: number | null = null;
  let classification: string | null = null;

  if (card.calculation.kind === "sirs") {
    const rw = resolveWindow(card.inputs[0].window, ctx.clock, checkpointAt);
    const s = evaluateSirs(ctx.inputs, rw);
    components = s.criteria.map((c) => ({
      componentId: `sirs.${c.id}`,
      label: c.label,
      status: c.status === "met" ? "satisfied" : c.status === "not_met" ? "not_satisfied" : "unknown",
      rawValue: c.value,
      normalizedValue: null,
      unit: null,
      sourceId: c.sourceId,
      sourceAt: c.sourceAt,
      window: rw.window,
      points: 0,
      contribution: c.status === "met" ? "sirs_criterion" : null,
      missingReason: c.status === "unknown" ? "no_data" : null,
    }));
    total = s.status === "present" ? 1 : s.status === "absent" ? 0 : null;
    classification = s.status;
  } else if (card.calculation.kind === "modified_marshall") {
    const rw = resolveWindow(card.inputs[0].window, ctx.clock, checkpointAt);
    const m = evaluateMarshall(ctx.inputs, rw);
    components = m.systems.map((sys) => ({
      componentId: `marshall.${sys.system}`,
      label: `${cap(sys.system)} (Modified Marshall)`,
      status: sys.score == null ? "unknown" : sys.organFailure ? "satisfied" : "not_satisfied",
      rawValue: sys.basis,
      normalizedValue: sys.score,
      unit: "marshall points",
      sourceId: sys.sourceId,
      sourceAt: sys.sourceAt,
      window: rw.window,
      points: sys.score ?? 0,
      contribution: sys.organFailure ? "organ_failure" : null,
      missingReason: sys.score == null ? "no_data" : null,
    }));
    total = m.evaluable ? Math.max(...m.systems.map((s) => s.score ?? 0)) : null;
    classification = m.anyOrganFailure ? "organ_failure" : m.evaluable ? "no_organ_failure" : "unknown";
  } else if (card.calculation.kind === "revised_atlanta") {
    const rw = resolveWindow(card.inputs[0].window, ctx.clock, checkpointAt);
    const m = evaluateMarshall(ctx.inputs, rw);
    const ci = ctx.classificationInputs ?? {};
    const a: AtlantaInput = {
      organFailurePresent: m.anyOrganFailure,
      organFailureDurationHours: ci.organFailureDurationHours ?? null,
      organFailureResolved: Boolean(ci.organFailureResolved),
      localComplications: ci.localComplications ?? null,
      systemicComplications: ci.systemicComplications ?? null,
    };
    const res = classifyAtlanta(a);
    components = [
      marshallSummaryComponent(m, rw.window),
      classComponent("atlanta.local_complications", "Local complications", ci.localComplications, rw.window),
      classComponent("atlanta.systemic_complications", "Systemic complications", ci.systemicComplications, rw.window),
      {
        componentId: "atlanta.organ_failure_duration",
        label: "Organ-failure duration",
        status: ci.organFailureDurationHours == null ? "unknown" : "satisfied",
        rawValue: ci.organFailureDurationHours == null ? null : `${ci.organFailureDurationHours} h`,
        normalizedValue: ci.organFailureDurationHours ?? null,
        unit: "h",
        sourceId: null,
        sourceAt: null,
        window: rw.window,
        points: 0,
        contribution: res.organFailureCategory,
        missingReason: ci.organFailureDurationHours == null ? "requires_verification" : null,
      },
    ];
    total = null;
    classification = res.classification;
  } else {
    // sum_points and structured_extraction
    components = card.inputs.map((def) =>
      !checkpointDue ? componentUnknown(def, resolveWindow(def.window, ctx.clock, checkpointAt), "checkpoint_not_due") : evaluateComponent(def, ctx, checkpointAt)
    );
    if (card.calculation.kind === "sum_points") {
      const anyKnown = components.some((c) => c.status === "satisfied" || c.status === "not_satisfied");
      total = anyKnown ? components.reduce((s, c) => s + c.points, 0) : null;
    }
  }

  const requiredIds = new Set(card.inputs.filter((i) => i.required).map((i) => i.componentId));
  const missingRequiredCount = components.filter(
    (c) => requiredIds.has(c.componentId) && c.status === "unknown"
  ).length;
  // Composite cards: treat an unknown classification as incomplete.
  const compositeIncomplete =
    (card.calculation.kind === "revised_atlanta" && classification === "unknown") ||
    (card.calculation.kind === "sirs" && classification === "not_evaluable") ||
    (card.calculation.kind === "modified_marshall" && classification === "unknown");

  const interpretation = interpret(card, total, classification);

  const resultHash = hashResult(components, total, classification);
  const priorVerify = ctx.verification[card.cardId];
  const verified = priorVerify && priorVerify.resultHash === resultHash;

  const state: CardState = deriveState({
    card,
    checkpointDue,
    componentsAllUnknown: components.every((c) => c.status === "unknown"),
    missingRequiredCount,
    compositeIncomplete,
    verified: Boolean(verified),
    staleVerify: Boolean(priorVerify && !verified),
  });

  return {
    cardId: card.cardId,
    cardType: card.type,
    title: card.title,
    state,
    components,
    total,
    classification: card.type === "calculator" ? null : classification,
    interpretation,
    formulaVersion: `${card.cardId}@definition`,
    computedAt: ctx.now,
    verifiedBy: verified ? priorVerify!.by : null,
    verifiedAt: verified ? priorVerify!.at : null,
    missingRequiredCount: missingRequiredCount + (compositeIncomplete ? 1 : 0),
  };
}

function deriveState(a: {
  card: CardDefinition;
  checkpointDue: boolean;
  componentsAllUnknown: boolean;
  missingRequiredCount: number;
  compositeIncomplete: boolean;
  verified: boolean;
  staleVerify: boolean;
}): CardState {
  if (a.card.lockedUntilCheckpoint != null && !a.checkpointDue) return "not_started";
  if (a.componentsAllUnknown) return "not_started";
  if (a.staleVerify) return "stale";
  if (a.verified) return "verified";
  if (a.missingRequiredCount > 0 || a.compositeIncomplete) return "incomplete";
  return "complete_unverified";
}

function interpret(
  card: CardDefinition,
  total: number | null,
  classification: string | null
) {
  if (total != null) {
    for (const band of card.interpretationBands) {
      if (total >= band.min && (band.max == null || total <= band.max)) {
        return { text: band.text, tone: band.tone };
      }
    }
  }
  if (classification && classification !== "unknown" && classification !== "not_evaluable") {
    const band = card.interpretationBands.find((b) => b.text.toLowerCase().includes(classification.replace(/_/g, " ")));
    if (band) return { text: band.text, tone: band.tone };
  }
  return null;
}

function marshallSummaryComponent(
  m: ReturnType<typeof evaluateMarshall>,
  window: ComponentInput["window"]
): ComponentResult {
  return {
    componentId: "atlanta.organ_failure",
    label: "Organ failure (Modified Marshall ≥ 2)",
    status: !m.evaluable ? "unknown" : m.anyOrganFailure ? "satisfied" : "not_satisfied",
    rawValue: m.systems
      .filter((s) => s.score != null)
      .map((s) => `${s.system} ${s.score}`)
      .join(", ") || null,
    normalizedValue: m.evaluable ? Math.max(...m.systems.map((s) => s.score ?? 0)) : null,
    unit: "marshall points",
    sourceId: null,
    sourceAt: null,
    window,
    points: 0,
    contribution: m.anyOrganFailure ? "organ_failure" : null,
    missingReason: m.evaluable ? null : "no_data",
  };
}

function classComponent(
  id: string,
  label: string,
  value: boolean | null | undefined,
  window: ComponentInput["window"]
): ComponentResult {
  return {
    componentId: id,
    label,
    status: value == null ? "unknown" : value ? "satisfied" : "not_satisfied",
    rawValue: value == null ? null : value ? "present" : "absent",
    normalizedValue: null,
    unit: null,
    sourceId: null,
    sourceAt: null,
    window,
    points: 0,
    contribution: null,
    missingReason: value == null ? "requires_verification" : null,
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * A stable hash of everything a clinician verified against, so a later data change flips the
 * card to `stale` rather than silently keeping the old sign-off (DOCX requirement 9 + audit).
 */
export function hashResult(
  components: ComponentResult[],
  total: number | null,
  classification: string | null
): string {
  const shape = components
    .map((c) => `${c.componentId}=${c.status}:${c.normalizedValue ?? ""}:${c.sourceId ?? ""}`)
    .join("|");
  return `${total ?? "-"}/${classification ?? "-"}#${shape}`;
}
