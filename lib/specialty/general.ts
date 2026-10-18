import type { FormatKind } from "@/lib/formats";
import { admissionDayCount, type SpecialtyPack } from "./types";

/**
 * The General pack — WardMate with no department.
 *
 * The base every unit stands on. A unit whose department is not set or not recognised gets this,
 * never another department's pack: no operation clock (so every plugin that asks
 * hasOperationClock() gives its neutral variant), no checklists, no department history order,
 * the standard systemic examination, and prompts that name no department. Every department —
 * general surgery included — is a pack on top of the same app. Its discharge templates are in
 * lib/discharge-templates-general.ts, kept off the pack like every department's.
 *
 * Deliberately thin: a choice here is the neutral one, never a department's guess.
 */
export const generalPack: SpecialtyPack = {
  key: "general",
  label: "General",
  blurb: "No department. Counts hospital days. The standard history, examination and discharge summary.",

  admissionPhrase: "a hospital admission",

  // Hospital days only: no operation clock, so no Pre-op/Post-op and no surgical plugins.
  dayCount: admissionDayCount,

  extractRoleLine: "You convert a doctor's spoken ward-round note into structured observations.",
  extractGuidance: "",

  // The scores any adult inpatient ward meets, whatever its department.
  scoringKeys: ["qsofa", "kdigo_aki", "wells_dvt", "wells_pe", "ciwa_ar", "child_pugh"],

  formatKinds: ["investigation", "interdepartmental", "discharge", "notes", "logo"] as FormatKind[],

  pickerPhase: "before_surgery",
  // No department, so no department's checklists — never another pack's work to fill the space.
  checklistFamilies: [],

  lexiconSpecialty: "general",

  // No department order: the History check picker shows every tree.
  historyTreeIds: [],
  examIds: ["general_physical", "cardiovascular", "respiratory", "abdomen", "neurological"],
};
