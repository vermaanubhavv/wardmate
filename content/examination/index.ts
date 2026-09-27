import type { ExamChecklist } from "@/lib/history-check/exam-types";
import { generalPhysicalV1 } from "@/content/examination/general-physical.v1";
import { cardiovascularV1 } from "@/content/examination/cardiovascular.v1";
import { respiratoryV1 } from "@/content/examination/respiratory.v1";
import { abdomenV1 } from "@/content/examination/abdomen.v1";
import { neurologicalV1 } from "@/content/examination/neurological.v1";
import { obstetricV1 } from "@/content/examination/obstetric.v1";
import { gynaecologicalV1 } from "@/content/examination/gynaecological.v1";
import { breastV1 } from "@/content/examination/breast.v1";
import { entV1 } from "@/content/examination/ent.v1";
import { eyeV1 } from "@/content/examination/eye.v1";
import { skinV1 } from "@/content/examination/skin.v1";
import { mentalStateV1 } from "@/content/examination/mental-state.v1";
import { musculoskeletalV1 } from "@/content/examination/musculoskeletal.v1";
import { spineV1 } from "@/content/examination/spine.v1";
import { paediatricV1 } from "@/content/examination/paediatric.v1";
import { newbornV1 } from "@/content/examination/newborn.v1";
import { burnsWoundV1 } from "@/content/examination/burns-wound.v1";
import { genitourinaryV1 } from "@/content/examination/genitourinary.v1";

/** Every examination checklist the academic view can show. Add a file, add a line. */
export const EXAM_CHECKLISTS: readonly ExamChecklist[] = [
  generalPhysicalV1,
  cardiovascularV1,
  respiratoryV1,
  abdomenV1,
  neurologicalV1,
  obstetricV1,
  gynaecologicalV1,
  breastV1,
  entV1,
  eyeV1,
  skinV1,
  mentalStateV1,
  musculoskeletalV1,
  spineV1,
  paediatricV1,
  newbornV1,
  burnsWoundV1,
  genitourinaryV1,
];
