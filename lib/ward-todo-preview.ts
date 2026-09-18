import type { WardTask } from "./todo";
import type { ScoringTask } from "./scoring/read";
import { urgencyRank, type Urgency } from "./urgency";

/**
 * One line for the ward page's to-do preview card — the top few outstanding jobs across
 * the whole unit, red first then yellow, so a doctor sees what's urgent without opening
 * /todo. Merges the same two sources /todo itself reads (lib/todo.ts's plan-tasks and the
 * scoring engine's generated tasks, lib/scoring/read.ts) rather than inventing a third.
 */
export type TodoPreviewItem = {
  id: string;
  text: string;
  urgency: Urgency;
  bed: string;
  patientId: string;
  patientName: string;
  /** Set only for a scoring-engine suggestion — the pathway/score it came from. */
  suggestedBy?: string;
};

/** The scoring engine's own priority scale, mapped onto the same red/yellow/green a
 *  plan-task's urgency uses, so the two sources can be ranked together. Exported for the
 *  /todo page's own "By type" view (app/todo/todo-lists.tsx), which merges the same two
 *  sources this preview does. */
export function scoringPriorityToUrgency(priority: ScoringTask["priority"]): Urgency {
  if (priority === "urgent") return "red";
  if (priority === "soon") return "yellow";
  return "green";
}

export function buildWardTodoPreview(
  tasks: WardTask[],
  scoringByPatient: Map<string, ScoringTask[]>,
  patients: { id: string; bed: string; display_name: string }[],
  limit = 3
): TodoPreviewItem[] {
  const byId = new Map(patients.map((p) => [p.id, p]));

  const fromTasks: TodoPreviewItem[] = tasks.map((t) => ({
    id: t.id,
    text: t.value_text ?? t.label,
    urgency: t.effective,
    bed: t.patient.bed,
    patientId: t.patient_id,
    patientName: t.patient.display_name,
  }));

  const fromScoring: TodoPreviewItem[] = [];
  for (const [patientId, items] of scoringByPatient) {
    const p = byId.get(patientId);
    if (!p) continue;
    for (const s of items) {
      fromScoring.push({
        id: s.id,
        text: s.action,
        urgency: scoringPriorityToUrgency(s.priority),
        bed: p.bed,
        patientId,
        patientName: p.display_name,
        suggestedBy: s.pathwayTitle ?? undefined,
      });
    }
  }

  return [...fromTasks, ...fromScoring]
    .sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency))
    .slice(0, limit);
}

/** Total outstanding across both sources — for "N outstanding" on the ward page and the
 *  preview card's own count, the same total /todo itself reports. */
export function countWardOutstanding(
  tasks: WardTask[],
  scoringByPatient: Map<string, ScoringTask[]>
): number {
  let scoringCount = 0;
  for (const items of scoringByPatient.values()) scoringCount += items.length;
  return tasks.length + scoringCount;
}
