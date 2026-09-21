import type { ExamChecklist } from "@/lib/history-check/exam-types";
import { generalPhysicalV1 } from "@/content/examination/general-physical.v1";
import { cardiovascularV1 } from "@/content/examination/cardiovascular.v1";
import { respiratoryV1 } from "@/content/examination/respiratory.v1";
import { abdomenV1 } from "@/content/examination/abdomen.v1";
import { neurologicalV1 } from "@/content/examination/neurological.v1";

/** Every examination checklist the academic view can show. Add a file, add a line. */
export const EXAM_CHECKLISTS: readonly ExamChecklist[] = [
  generalPhysicalV1,
  cardiovascularV1,
  respiratoryV1,
  abdomenV1,
  neurologicalV1,
];
