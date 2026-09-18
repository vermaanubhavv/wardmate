import type { Reference } from "@/lib/history-check/types";

/**
 * A bedside examination checklist for the academic view. Nothing here is extracted from
 * dictation or stored per patient — it is reading material shown beside the history so a
 * student knows what to look for and how. Every item explains HOW to elicit the sign (the
 * "(i)" text) and WHERE it is seen, phrased as associations, never as a diagnosis.
 */
export type ExamItem = {
  /** Stable id within the checklist. */
  id: string;
  /** What is being checked: "Pallor". */
  label: string;
  /** How to check it — shown behind the (i) button. Plain steps a student can follow. */
  how: string;
  /** What a positive or abnormal finding is associated with. "Seen in …", never "this is …". */
  significance: string;
  /** How to record a normal finding, when the wording is conventional. */
  normal?: string;
  /** "core" is shown in ward mode too; "detailed" only in academic mode. Default core. */
  tier?: "core" | "detailed";
};

export type ExamSection = {
  id: string;
  title: string;
  /** One or two lines on why this section matters and in what order to do it. */
  intro?: string;
  items: ExamItem[];
};

export type ExamChecklist = {
  id: string;
  version: string;
  title: string;
  setting: string;
  reviewStatus: "pending_clinician_review" | "reviewed";
  reviewedBy: string | null;
  references: Reference[];
  sections: ExamSection[];
};
