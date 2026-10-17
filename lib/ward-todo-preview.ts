import type { WardTask } from "./todo";
import type { ScoringTask } from "./scoring/read";
import { urgencyRank, type Urgency } from "./urgency";

/**
 * One line for the ward page's to-do preview card — the top few outstanding jobs across
 * the whole unit, red first then yellow, so a doctor sees what's urgent without opening
 * /todo. Plan-tasks only (lib/todo.ts): the scoring engine's suggestions are not on the ward
 * screen yet.
 */
export type TodoPreviewItem = {
  id: string;
  text: string;
  urgency: Urgency;
  bed: string;
  patientId: string;
  patientName: string;
};

/** The scoring engine's own priority scale, mapped onto the same red/yellow/green a
 *  plan-task's urgency uses, so the two sources can be ranked together — for the /todo page's
 *  "By type" view (app/todo/todo-lists.tsx). */
export function scoringPriorityToUrgency(priority: ScoringTask["priority"]): Urgency {
  if (priority === "urgent") return "red";
  if (priority === "soon") return "yellow";
  return "green";
}

export function buildWardTodoPreview(tasks: WardTask[], limit = 3): TodoPreviewItem[] {
  return tasks
    .map((t) => ({
      id: t.id,
      text: t.value_text ?? t.label,
      urgency: t.effective,
      bed: t.patient.bed,
      patientId: t.patient_id,
      patientName: t.patient.display_name,
    }))
    .sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency))
    .slice(0, limit);
}
