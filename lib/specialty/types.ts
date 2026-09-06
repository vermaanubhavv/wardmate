import type { DischargeTemplate } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { Specialty as LexiconSpecialty } from "@/lib/transcription/lexicon/types";

/**
 * A specialty pack is everything WardMate has to know differently because a unit is a
 * medical oncology or internal medicine unit rather than a general-surgery one.
 *
 * WHY A PACK AND NOT A FORK. There is one WardMate. A unit picks its department when it is
 * created (`wards.specialty`, patch 0060) and that choice defines the unit for good — a
 * unit's join code makes residents of that department. Everything specialty-specific is read
 * from the pack at the point of use instead of being hardcoded, so adding a third department
 * later is a new file in this folder, not a second app.
 *
 * THE RULE THIS FOLDER KEEPS: `general_surgery` reproduces today's behaviour EXACTLY. If the
 * database patch has not been run, or a ward carries a specialty nobody recognises,
 * `getSpecialtyPack()` returns the surgery pack and the app behaves exactly as it always has.
 * Degrade, don't crash — the same rule the glossary and the RPC fallbacks already follow.
 *
 * WHAT A PACK MUST NEVER TOUCH: the verbatim-quote guarantee in lib/extract.ts. A pack supplies
 * the words describing WHO is speaking; the check that every stored value can be quoted from
 * the transcript is specialty-independent and is the whole clinical guarantee of the app.
 */

export const SPECIALTY_KEYS = [
  "general_surgery",
  "medical_oncology",
  "internal_medicine",
] as const;
export type SpecialtyKey = (typeof SPECIALTY_KEYS)[number];

/**
 * The patient fields any pack is allowed to count days from. A superset: a surgical patient
 * has null chemo fields, an oncology patient has null surgery fields, and both are normal.
 */
export type DayCountPatient = {
  admission_day: number;
  post_op_day: number | null;
  /** Days since the current chemotherapy cycle started, 1-based. See patch 0060. */
  cycle_day?: number | null;
  cycle_number?: number | null;
  regimen?: string | null;
};

/**
 * The day a patient is on, and which clock it was counted by.
 *
 * `text` is what prints on the card. It always names the clock, because "day 3" meaning two
 * different things on two adjacent beds is exactly the ambiguity this app exists to remove.
 */
export type DayCount = {
  clock: "post_op" | "cycle" | "admission";
  n: number;
  text: string;
};

export type SpecialtyPack = {
  key: SpecialtyKey;
  /** How the department is named in the picker and on screen. */
  label: string;
  /** One line under the picker option, for a resident choosing at unit setup. */
  blurb: string;

  terminology: {
    /** The short name of the day counter — "POD", "C2D3". Used in help text, not on cards. */
    dayLabel: string;
    /** What the unit calls the thing a patient is admitted under. */
    admissionNoun: string;
  };

  /** The day a patient is on. Never returns null — every patient has at least an admission day. */
  dayCount: (patient: DayCountPatient) => DayCount;

  /**
   * The opening line of the extraction system prompt — who the app is listening to. Everything
   * else in that prompt, including every safety rule, is shared.
   */
  extractRoleLine: string;
  /**
   * A specialty section appended to the shared extraction prompt, or "" for none. Guidance
   * only: it can tell the model what a word means on this ward, never permit inventing a value.
   */
  extractGuidance: string;

  /**
   * Which clock the unit's auto-triggered checklist items hang off. Surgery counts from the
   * operation; oncology counts from the cycle, falling back to admission.
   * See lib/checklist-triggers.ts.
   */
  checklistAnchor: "post_op" | "cycle" | "admission";

  /** The discharge templates this unit is offered, most specific first. */
  dischargeTemplates: DischargeTemplate[];
  /** The fallback when the typed diagnosis matches none of them. */
  genericDischargeTemplate: DischargeTemplate;

  /**
   * The scoring pathways offered to this unit. Empty means "offer nothing" — an empty list is
   * a deliberate clinical statement, not a gap: an oncology unit should not be shown Ranson's.
   */
  scoringKeys: string[];

  /** Which uploaded-document slots the /formats page shows. */
  formatKinds: FormatKind[];

  /**
   * Which `care_templates.phase` rows this unit's checklist picker offers.
   *
   * The enum is `before_surgery` / `after_surgery` because it was written for a surgical ward,
   * and it is stored data on live rows, so it is not being renamed. What it MEANS is "which
   * checklist applies now". A surgical unit picks the after-the-operation one. A medical
   * oncology patient never has an operation date, so `phaseFor()` computes `before_surgery`
   * for them and that is the row their checklist must be filed under — the same value the
   * picker therefore has to offer.
   */
  pickerPhase: "before_surgery" | "after_surgery";

  /** The keyterm lexicon core this unit's dictation is boosted with. */
  lexiconSpecialty: LexiconSpecialty;
};
