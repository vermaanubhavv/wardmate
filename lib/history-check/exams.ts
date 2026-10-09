import { EXAM_CHECKLISTS } from "@/content/examination";
import { validateExamChecklist } from "@/lib/history-check/exam-schema";
import { validatedOnce } from "@/lib/history-check/schema";
import type { ExamChecklist } from "@/lib/history-check/exam-types";

/** Validated on first use, like the trees: a bad checklist fails loudly, not on the ward. */
export const listExamChecklists = validatedOnce(EXAM_CHECKLISTS, validateExamChecklist, "Exam checklist");

export function getExamChecklist(id: string): ExamChecklist | null {
  return listExamChecklists().find((c) => c.id === id) ?? null;
}
