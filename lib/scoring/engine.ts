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
  firstAvailable,
  resolveWindow,
  valuesInWindow,
  worstValue,
  type ResolvedWindow,
} from "./time-windows";
import { evaluateSirs } from "./sirs";

export type EvaluateContext = {
  inputs: EngineInput[];
  clock: InstanceClock;
  /** componentId → clinician override (kept and re-applied on every recompute). */
  overrides: Record<
    string,
    { value: string; numeric: number | null; reason: string; by: string; at: Instant }
  >;
  /** Prior verification, cleared by the caller when inputs changed materially. */
  verification: Record<string, { by: string; at: Instant; resultHash: string }>;
  /**
   * componentId → the clinician's recorded assessment of a `clinicianAssessed` criterion
   * (from the pathway instance, not from observations).
   */
  assessedComponents?: Record<
    string,
    { satisfied: boolean; points?: number; text: string; at: Instant; by: string }
  >;
  now: Instant;
};

function selectValue(
  def: ComponentInput,
  inputs: EngineInput[],
  rw: ResolvedWindow
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

function evaluateComponent(def: ComponentInput, ctx: EvaluateContext): ComponentResult {
  const rw = resolveWindow(def.window, ctx.clock);

  // A clinician-assessed criterion: prefer the explicit assessment recorded from the card;
  // otherwise fall through to the observation path (a finding the resident dictated).
  if (def.clinicianAssessed) {
    const a = ctx.assessedComponents?.[def.componentId];
    if (a) {
      const pts = a.satisfied ? a.points ?? def.points : 0;
      return {
        componentId: def.componentId,
        label: def.label,
        status: a.satisfied ? "satisfied" : "not_satisfied",
        rawValue: a.text,
        normalizedValue: null,
        unit: null,
        sourceId: null,
        sourceAt: a.at,
        window: rw.window,
        points: pts,
        contribution: null,
        missingReason: null,
      };
    }
    const fromObs = evaluateComponentRaw(def, ctx, rw);
    return fromObs.status === "unknown" ? componentUnknown(def, rw, "requires_verification") : fromObs;
  }

  // Clinician override wins, but the imported result is computed first and kept underneath.
  const imported = evaluateComponentRaw(def, ctx, rw);
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
  rw: ResolvedWindow
): ComponentResult {
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

  const picked = selectValue(def, ctx.inputs, rw);
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

  const rawValue = `${picked.original.value}${picked.original.unit ? " " + picked.original.unit : ""}`;
  const base = {
    componentId: def.componentId,
    label: def.label,
    rawValue,
    normalizedValue: picked.value,
    unit: picked.unit ?? def.canonicalUnit,
    sourceId: picked.sourceId,
    sourceAt: picked.at,
    window: rw.window,
    contribution: null,
    missingReason: null as MissingReason | null,
  };

  // Graded criterion: first matching band wins.
  if (def.bands && def.bands.length > 0) {
    if (evaluateRule(def.rule, picked.value, picked.text) === "not_evaluable") {
      return { ...componentUnknown(def, rw, "insufficient_inputs"), rawValue: picked.original.value };
    }
    const hit = def.bands.find((b) => evaluateRule(b.rule, picked.value, picked.text) === "met");
    return { ...base, status: hit ? "satisfied" : "not_satisfied", points: hit?.points ?? 0 };
  }

  const evalRes = evaluateRule(def.rule, picked.value, picked.text);
  if (evalRes === "not_evaluable") {
    return { ...componentUnknown(def, rw, "insufficient_inputs"), rawValue: picked.original.value };
  }
  const met = evalRes === "met";
  return { ...base, status: met ? "satisfied" : "not_satisfied", points: met ? def.points : 0 };
}

// ---------------------------------------------------------------------------
// Card-level
// ---------------------------------------------------------------------------

export function evaluateCard(card: CardDefinition, ctx: EvaluateContext): CardResult {
  let components: ComponentResult[];
  let total: number | null = null;
  let classification: string | null = null;

  if (card.calculation.kind === "sirs") {
    const rw = resolveWindow(card.inputs[0].window, ctx.clock);
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
  } else {
    // sum_points, max_points and tiered_classification
    components = card.inputs.map((def) => evaluateComponent(def, ctx));
    if (card.calculation.kind === "tiered_classification") {
      const calc = card.calculation;
      const defById = new Map(card.inputs.map((i) => [i.componentId, i]));
      classification = calc.fallback;
      for (const tier of calc.tiers) {
        const need = calc.tierThresholds?.[tier] ?? 1;
        const met = components.filter(
          (c) => defById.get(c.componentId)?.tier === tier && c.status === "satisfied"
        ).length;
        if (met >= need) {
          classification = tier;
          break;
        }
      }
    }
  }

  const requiredIds = new Set(card.inputs.filter((i) => i.required).map((i) => i.componentId));
  const missingRequired = components.filter(
    (c) => requiredIds.has(c.componentId) && c.status === "unknown"
  );
  const missingRequiredCount = missingRequired.length;

  // Calculator total: the real total only once every required component is known; otherwise a
  // *provisional* total when the only gaps are clinician assessments (objective data complete).
  let provisionalTotal: number | null = null;
  let assumedComponentIds: string[] = [];
  if (card.calculation.kind === "sum_points" || card.calculation.kind === "max_points") {
    const combine = (cs: ComponentResult[]) =>
      card.calculation.kind === "max_points"
        ? cs.reduce((m, c) => Math.max(m, c.points), 0)
        : cs.reduce((s, c) => s + c.points, 0);
    const anyKnown = components.some((c) => c.status === "satisfied" || c.status === "not_satisfied");
    total = anyKnown && missingRequired.length === 0 ? combine(components) : null;

    const assessedDefIds = new Set(card.inputs.filter((i) => i.clinicianAssessed).map((i) => i.componentId));
    const objectiveUnknown = missingRequired.filter((c) => !assessedDefIds.has(c.componentId));
    const pendingAssessments = missingRequired.filter((c) => assessedDefIds.has(c.componentId));
    if (objectiveUnknown.length === 0 && pendingAssessments.length > 0) {
      // Unknown criteria contribute 0 points — the assumption, shown not stored.
      provisionalTotal = combine(components);
      assumedComponentIds = pendingAssessments.map((c) => c.componentId);
    }
  }

  // For a tiered classification: incomplete only while a tier ABOVE the resolved class still
  // has an unknown criterion that could push it higher.
  let tierProvisionalIncomplete = false;
  if (card.calculation.kind === "tiered_classification") {
    const calc = card.calculation;
    const defById = new Map(card.inputs.map((i) => [i.componentId, i]));
    const resolvedRank = calc.tiers.indexOf(classification ?? calc.fallback);
    const higherTiers = resolvedRank === -1 ? calc.tiers : calc.tiers.slice(0, resolvedRank);
    // Only a REQUIRED unknown criterion in a higher tier keeps the grade provisional; optional
    // labs not yet back are assumed not deranged (the same assumption a provisional total makes).
    tierProvisionalIncomplete = components.some(
      (c) =>
        c.status === "unknown" &&
        requiredIds.has(c.componentId) &&
        higherTiers.includes(defById.get(c.componentId)?.tier ?? "")
    );
  }

  // Composite cards: treat an unknown classification as incomplete.
  const compositeIncomplete =
    (card.calculation.kind === "sirs" && classification === "not_evaluable") ||
    tierProvisionalIncomplete;

  const interpretation = interpret(card, total ?? provisionalTotal, classification);

  const resultHash = hashResult(components, total, classification);
  const priorVerify = ctx.verification[card.cardId];
  const verified = priorVerify && priorVerify.resultHash === resultHash;

  const state: CardState = deriveState({
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
    provisionalTotal,
    assumedComponentIds,
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
  componentsAllUnknown: boolean;
  missingRequiredCount: number;
  compositeIncomplete: boolean;
  verified: boolean;
  staleVerify: boolean;
}): CardState {
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
    const key = classification.replace(/_/g, " ");
    const band = card.interpretationBands.find(
      (b) => b.class === classification || b.text.toLowerCase().includes(key)
    );
    if (band) return { text: band.text, tone: band.tone };
  }
  return null;
}

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
