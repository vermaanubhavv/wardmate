import { EXAM_CHECKLISTS } from "@/content/examination";
import { validateExamChecklist } from "@/lib/history-check/exam-schema";
import type { ExamChecklist } from "@/lib/history-check/exam-types";

let checked: readonly ExamChecklist[] | null = null;

/** Validated on first use, like the trees: a bad checklist fails loudly, not on the ward. */
export function listExamChecklists(): readonly ExamChecklist[] {
  if (!checked) {
    const ids = new Set<string>();
    for (const c of EXAM_CHECKLISTS) {
      const res = validateExamChecklist(c);
      if (!res.ok) {
        const detail = res.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
        throw new Error(`Exam checklist ${c.id}@${c.version} is invalid — ${detail}`);
      }
      const key = `${c.id}@${c.version}`;
      if (ids.has(key)) throw new Error(`Duplicate exam checklist ${key}`);
      ids.add(key);
    }
    checked = EXAM_CHECKLISTS;
  }
  return checked;
}

export function getExamChecklist(id: string): ExamChecklist | null {
  return listExamChecklists().find((c) => c.id === id) ?? null;
}
