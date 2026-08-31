/**
 * Missing-data task generation.
 *
 * Rules (DOCX §5):
 *  - Only suggest a task for a component that is genuinely `unknown` AND clinically justified.
 *  - Before creating an investigation task, check for (1) an acceptable existing result in the
 *    time window, (2) an active matching order, (3) an existing unresolved matching task. If
 *    any exists, LINK it instead of creating a duplicate.
 *  - Never emit a task for a `noAutoTask` component (pleural effusion / CT for mCTSI).
 *  - Never place an order. Output is always a clinician-reviewable suggestion.
 *  - A dedup key makes repeated trigger delivery idempotent.
 *
 * Pure. The caller supplies the current world (existing results, orders, open tasks).
 */

import type {
  CardResult,
  EngineInput,
  GeneratedTask,
  GeneratedTaskDefinition,
  InstanceClock,
  Instant,
  PathwayDefinition,
} from "./types";

export type ExistingWorld = {
  /** Component inputKeys for which an acceptable result already exists in-window. */
  resolvedInputKeys: Set<string>;
  /** Active order identifiers keyed by inputKey (this product has no order entry yet: empty). */
  activeOrders: Set<string>;
  /** Dedup keys of tasks already present (any status except declined-permanently). */
  openTaskKeys: Set<string>;
  /** Ward-disabled institutional toggles. */
  disabledToggles: Set<string>;
};

export type TaskDecision = {
  task: GeneratedTask;
  outcome: "create" | "link_existing_result" | "link_existing_order" | "already_present" | "suppressed_toggle";
};

function dueAt(
  def: GeneratedTaskDefinition,
  clock: InstanceClock
): Instant | null {
  if (def.dueFromAnchor == null || def.dueAtHours == null) return null;
  const base =
    def.dueFromAnchor === "admission"
      ? clock.admission
      : def.dueFromAnchor === "symptom_onset"
        ? clock.symptomOnset
        : def.dueFromAnchor === "activation"
          ? clock.activation
          : null;
  if (!base) return null;
  return new Date(Date.parse(base) + def.dueAtHours * 3_600_000).toISOString();
}

/** Turn the definition's task list into concrete decisions against the current world. */
export function planPathwayTasks(
  def: PathwayDefinition,
  cards: CardResult[],
  inputs: EngineInput[],
  clock: InstanceClock,
  world: ExistingWorld
): TaskDecision[] {
  const decisions: TaskDecision[] = [];
  void inputs;

  // 1. Static day-1 tasks from the definition.
  for (const t of def.tasks) {
    const dedupKey = `${def.pathwayId}:task:${t.key}`;
    const task: GeneratedTask = {
      cardId: t.cardId,
      componentId: t.componentId,
      action: t.action,
      reason: t.reason,
      priority: t.priority,
      responsibleRole: t.responsibleRole,
      sourceRule: `definition.tasks.${t.key}`,
      dedupKey,
      dueAt: dueAt(t, clock),
      institutionalToggle: t.institutionalToggle,
    };
    decisions.push(classify(task, t.institutionalToggle, t.componentId ?? t.key, world));
  }

  // 2. Dynamic tasks for each mandatory component still `unknown` (and not noAutoTask).
  for (const card of cards) {
    const cardDef = def.cards.find((c) => c.cardId === card.cardId);
    if (!cardDef) continue;
    for (const comp of card.components) {
      if (comp.status !== "unknown") continue;
      if (comp.missingReason === "checkpoint_not_due") continue; // locked stage — not yet due
      const inputDef = cardDef.inputs.find((i) => i.componentId === comp.componentId);
      if (!inputDef || !inputDef.required || inputDef.noAutoTask) continue;

      const dedupKey = `${def.pathwayId}:${card.cardId}:${comp.componentId}`;
      const task: GeneratedTask = {
        cardId: card.cardId,
        componentId: comp.componentId,
        action: `Obtain ${comp.label} (${comp.window.label})`,
        reason: `${card.title} needs ${comp.label}; currently unknown. A score component is never assumed normal.`,
        priority: "soon",
        responsibleRole: "resident",
        sourceRule: `missing_component:${card.cardId}.${comp.componentId}`,
        dedupKey,
        dueAt: null,
        institutionalToggle: null,
      };
      decisions.push(classify(task, null, inputDef.inputKey, world));
    }
  }

  return dedupeDecisions(decisions);
}

function classify(
  task: GeneratedTask,
  toggle: string | null,
  inputKeyOrSlug: string,
  world: ExistingWorld
): TaskDecision {
  if (toggle && world.disabledToggles.has(toggle)) {
    return { task, outcome: "suppressed_toggle" };
  }
  if (world.openTaskKeys.has(task.dedupKey)) {
    return { task, outcome: "already_present" };
  }
  if (world.resolvedInputKeys.has(inputKeyOrSlug)) {
    return { task, outcome: "link_existing_result" };
  }
  if (world.activeOrders.has(inputKeyOrSlug)) {
    return { task, outcome: "link_existing_order" };
  }
  return { task, outcome: "create" };
}

/** Collapse decisions that share a dedup key — keep the first, drop the rest. */
function dedupeDecisions(decisions: TaskDecision[]): TaskDecision[] {
  const seen = new Set<string>();
  const out: TaskDecision[] = [];
  for (const d of decisions) {
    if (seen.has(d.task.dedupKey)) continue;
    seen.add(d.task.dedupKey);
    out.push(d);
  }
  return out;
}

/**
 * The canonical event deduplication key from the DOCX §4:
 *   `encounter_id:pathway_id:pathway_version:event_type:source_id:checkpoint`
 */
export function eventDedupKey(a: {
  encounterId: string;
  pathwayId: string;
  pathwayVersion: string;
  eventType: string;
  sourceId: string | null;
  checkpoint: string | null;
}): string {
  return [
    a.encounterId,
    a.pathwayId,
    a.pathwayVersion,
    a.eventType,
    a.sourceId ?? "-",
    a.checkpoint ?? "-",
  ].join(":");
}
