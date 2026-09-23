import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The burns and plastic surgery pack.
 *
 * WHAT MAKES A BURNS WARD DIFFERENT, and why this is the first pack since medical oncology to
 * need a database change rather than only a file:
 *
 * 1. THE CLOCK STARTS BEFORE THE ADMISSION. Every other department counts from something that
 *    happened in the hospital — the operation, the cycle, the admission. A burns unit counts
 *    from the burn, and the burn usually happened somewhere else, hours or days earlier. A
 *    patient burned on Tuesday who reaches the ward on Thursday is on post-burn day 3, and a
 *    note that says day 1 is wrong about the only number this ward navigates by. That is why
 *    patch 0085 adds `patients.burn_date` and `current_patients.burn_day` — the app would
 *    otherwise have to guess, and guessing is the thing this app does not do.
 *
 *    `burn_day` is 1-based like the chemotherapy cycle and unlike the post-operative day: a
 *    burns unit calls the day of the injury post-burn day 1. The label always names its clock,
 *    so "PBD 3" and "POD 3" can never be confused on adjacent beds.
 *
 * 2. THE SAME PATIENT HAS TWO CLOCKS AFTER GRAFTING, and the burn one leads. A grafted patient
 *    is PBD 14 and POD 3 of the graft at the same time; the ward speaks the first and mentions
 *    the second. `dayCount` therefore prefers the burn date when one is recorded and falls back
 *    to the operation, then to admission — so a plastic-surgery patient who was never burned
 *    (a flap, a contracture release, a cleft) counts post-operatively, exactly as surgery does.
 *
 * 3. AREA AND DEPTH ARE ESTIMATES, AND THEY ARE THE INPUT TO A CALCULATION THIS APP REFUSES TO
 *    MAKE. Fluid resuscitation is computed from the percentage burnt, the weight and the hour
 *    of injury. WardMate records what was said and calculates nothing: no percentage column, no
 *    formula in the lexicon, no fluid volume the resident did not dictate. The percentage is an
 *    observation in their words, revised as the burn declares itself, and whose estimate it is
 *    stays attached to it.
 *
 * 4. THE HOUR OF INJURY LIVES IN THE HISTORY, NOT IN A COLUMN. The `burns` history tree has a
 *    `time_of_injury` slot that carries its own verbatim quote. A date drives a day counter; an
 *    hour would drive arithmetic, and that is the line.
 *
 * 5. THE CIRCUMSTANCES ARE RECORDED AS GIVEN, WITHOUT COMMENT. How a burn happened is read
 *    again long after the admission, sometimes by people who are not clinicians. The guidance
 *    keeps the informant's words as the informant's words and adds nothing — no inference about
 *    how plausible an account is, and no judgement dressed up as a finding.
 *
 * WHAT THIS PACK BORROWS. The general-surgery discharge templates: a burns or flap discharge is
 * operative in shape. Its own (post-grafting care, donor-site care, contracture physiotherapy
 * and splinting, scar management) are the first thing to add past pilot.
 *
 * SCORING IS EMPTY. The burns severity indices are real instruments — and they are exactly the
 * kind that would be read as a prognosis at a bedside. None has been built or reviewed here,
 * and an empty list is the honest state.
 *
 * NOT YET PILOTED. `SPECIALTY_PACKS=on` and patch 0085 first. Clinical content is pending
 * clinician review.
 */
export const burnsPlasticSurgeryPack: SpecialtyPack = {
  key: "burns_plastic_surgery",
  label: "Burns & Plastic Surgery",
  blurb: "Counts post-burn days from the date of the injury, not from admission. Grafts and flaps keep the operative clock.",

  terminology: {
    dayLabel: "PBD",
    admissionNoun: "burn",
  },

  admissionPhrase: "a burns and plastic surgery admission",

  // Burn first, then the operation, then admission. A burned patient who has been grafted is
  // on both clocks; this ward speaks the burn one, and the label always says which is shown.
  dayCount: (p) => {
    if (p.burn_day != null) {
      return { clock: "burn", n: p.burn_day, text: `PBD ${p.burn_day}` };
    }
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert a burns and plastic surgery resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Burns and plastic surgery ward — what the words mean here:

- THE DAY SPOKEN IS USUALLY THE POST-BURN DAY: "post-burn day 5", "PBD 5", "day 5 of burn". Record kind "day_number" with the number as said. A post-operative day on this ward belongs to a graft or a flap and is said as such — "POD 3 of grafting". Keep whichever was spoken, with the words that name its clock. Never convert one into the other and never compute either from a date.
- PERCENTAGE BURNT IS RECORDED ONLY AS SPOKEN, with whose estimate it is if that was said: "about 45 percent", "40 to 45 percent by rule of nines", "re-assessed as 35 percent today". Never compute a percentage, never average two estimates, and never convert a description of the burnt areas into a number.
- DEPTH IS A DESCRIPTION, NOT A GRADE THE APP ASSIGNS: "superficial partial thickness over the chest", "deep dermal on the right arm", "full thickness circumferential over the left forearm", "mixed depth". Record the depth with the site as said.
- FLUIDS ARE RECORDED AS GIVEN AND NEVER CALCULATED. "Ringer lactate 200 ml per hour", "3 litres in the first 8 hours", "fluids titrated to urine output". Record the volume and rate actually spoken. Do NOT apply any resuscitation formula, do not compute a requirement from the percentage and weight, and do not suggest a rate. This app records; it does not resuscitate.
- URINE OUTPUT IS THE NUMBER THIS WARD WATCHES: "30 ml per hour", "output dropped to 15 ml in the last hour", "cola coloured urine". Record each value spoken with its interval, and keep the colour wording verbatim.
- THE WOUND HAS A STATE EACH ROUND: "slough present over the back", "granulation tissue seen", "green discharge from the left thigh", "graft take about 80 percent", "graft slough over the ankle", "donor site dry". Record as said, with the site. Never grade a wound as improving or worsening yourself.
- A FLAP IS MONITORED IN COLOUR AND REFILL: "flap pink, capillary refill 2 seconds", "flap congested since morning", "venous congestion", "flap pale". These are observations with a time, and the time matters — record it when it was said.
- DRESSINGS, ESCHAROTOMY AND GRAFTING ARE PROCEDURES recorded as spoken: "escharotomy over the right forearm", "tangential excision and split thickness skin graft from the right thigh", "dressing under anaesthesia", "collagen sheet applied", "vacuum dressing changed".
- HOW THE BURN HAPPENED IS RECORDED IN THE INFORMANT'S OWN WORDS and attributed to them: "patient says the stove burst while cooking", "brother says she was alone in the room". Store the account and who gave it. Add nothing: no view on whether an account fits the injury, and no inference about intent — if a clinician states a concern, that statement is the observation, in their words.
- TETANUS STATUS AND FIRST AID ARE PART OF THE ADMISSION RECORD: "tetanus toxoid given outside", "immunisation status not known", "poured cold water for 10 minutes", "toothpaste applied at home". Record what was said, without comment.
- Abbreviations to leave AS SAID: "PBD", "TBSA", "STSG", "FTSG", "SSD" (silver sulphadiazine), "NPWT", "RL" (Ringer lactate). Store the letters that were said.
`.trim(),

  // The wound, the dressings and the grafts hang off the operation where there is one; the
  // burn's own clock is a count, not a checklist anchor, and the engine anchors it knows are
  // post_op, cycle and admission. Grafting is what the checklists here will key to.
  checklistAnchor: "post_op",

  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  // Empty on purpose: the burns severity indices are exactly the kind of number that would be
  // read as a prognosis at a bedside, and none has been built or reviewed here.
  scoringKeys: [],

  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "ot_notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "after_surgery",

  lexiconSpecialty: "burns_plastic_surgery",

  // The burn first, then the injuries and wounds this unit also takes.
  historyTreeIds: ["burns", "limb_injury", "leg_ulcer", "lump", "shock", "fever", "head_injury"],
};
