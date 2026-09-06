import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The general-surgery pack — WardMate exactly as it has always behaved.
 *
 * Every value here is what the code did before this folder existed. Nothing in this file is a
 * new decision; it is the old hardcoded assumption, written down where it can be swapped. If a
 * change here alters what a surgical unit sees, the change is wrong.
 */
export const generalSurgeryPack: SpecialtyPack = {
  key: "general_surgery",
  label: "General Surgery",
  blurb: "Counts post-operative days. Operation-keyed checklists and discharge summaries.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "operation",
  },

  // Operated patients are counted from the operation, everyone else from admission — and the
  // label always says which. This is lib/patients.ts dayLabel(), moved, not changed.
  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert a surgical resident's spoken ward-round note into structured observations.",
  extractGuidance: "",

  checklistAnchor: "post_op",

  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  scoringKeys: [
    "acute_pancreatitis",
    "acute_appendicitis",
    "acute_cholecystitis",
    "acute_cholangitis",
    "upper_gi_bleeding",
  ],

  // All six slots, listed rather than derived from FORMAT_KINDS: that constant lives in a
  // server-only module, and these packs are read by client components too.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "ot_notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "after_surgery",

  lexiconSpecialty: "general-surgery",
};
