import type { ExamChecklist } from "@/lib/history-check/exam-types";
import { generalPhysicalV1 } from "@/content/examination/general-physical.v1";

/** Every examination checklist the academic view can show. Add a file, add a line. */
export const EXAM_CHECKLISTS: readonly ExamChecklist[] = [generalPhysicalV1];
