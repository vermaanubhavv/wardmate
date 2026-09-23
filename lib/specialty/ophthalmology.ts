import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The ophthalmology pack.
 *
 * WHAT MAKES AN EYE WARD DIFFERENT. It is a surgical department and keeps the surgical clock —
 * operated patients from the operation, everyone else from admission. What it does not share
 * with any other department is that almost every fact on the round belongs to ONE EYE, and is
 * recorded in a notation that must survive intact.
 *
 * 1. THE EYE IS PART OF THE VALUE. "6 by 12" is meaningless without "right eye". A vision
 *    recorded against the wrong eye, or against no eye, is not a lesser record — it is a wrong
 *    one, and the eye that gets operated on is chosen from notes like these. The guidance below
 *    refuses to infer a side from anything: not from the operation, not from an earlier entry,
 *    not from which eye is commoner.
 *
 * 2. VISUAL ACUITY IS A NOTATION, NOT A NUMBER. "6/12", "6/60", "counting fingers at 2 metres",
 *    "hand movements close to face", "perception of light present with accurate projection".
 *    None of these convert into one another and the app never converts them. They are stored as
 *    the resident said them, with unaided / best-corrected / pinhole kept as part of the
 *    statement, because those are three different measurements of the same eye.
 *
 * 3. PRESSURE, TOO, IS A PER-EYE NUMBER with the instrument attached: applanation and
 *    non-contact tonometry are not interchangeable, and "digital tension" is not a number at all.
 *
 * 4. THE CASEMIX IS CATARACT AND THE DIABETIC EYE, in volume, with corneal ulcers, glaucoma
 *    and trauma alongside. A post-operative eye that becomes painful with falling vision is the
 *    one time-critical event on this ward, and it is a red flag in the vision-loss tree too.
 *
 * WHAT THIS PACK BORROWS. Discharge templates are the general-surgery ones: an eye discharge is
 * operative in shape — what was done, to which eye, drops and their taper, when to return. Its
 * own (cataract surgery, trabeculectomy, vitrectomy, keratoplasty, each with its drop schedule
 * as dictated) are the first thing to add past pilot, in `lib/discharge-templates-eye.ts`.
 *
 * SCORING IS EMPTY, deliberately. No ophthalmic pathway has been built and reviewed here, and
 * an eye unit must not be offered a surgical or medical score because it happens to exist.
 *
 * NOT YET PILOTED. `SPECIALTY_PACKS=on` for the picker and patch 0083 run first. Clinical
 * content is pending clinician review.
 */
export const ophthalmologyPack: SpecialtyPack = {
  key: "ophthalmology",
  label: "Ophthalmology",
  blurb: "Eye unit. Counts post-operative days; every vision and pressure belongs to one named eye.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "operation",
  },

  admissionPhrase: "an ophthalmology admission",

  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert an ophthalmology resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Eye ward — what the words mean here:

- EVERY FINDING BELONGS TO ONE EYE AND THE EYE IS PART OF THE VALUE. "Right eye 6 by 12", "left eye counting fingers", "RE pressure 16", "LE quiet". Keep the eye inside the observation exactly as said, including when both eyes are described in one sentence — that is two observations. If no eye was named, record none. NEVER infer the eye from the operation, from an earlier entry, or from which side is commoner.
- VISUAL ACUITY IS STORED AS THE NOTATION SPOKEN, never converted: "6/12", "6 by 60", "20/40", "counting fingers at 3 metres", "counting finger close to face", "hand movements", "perception of light present", "PL positive with accurate projection", "no perception of light". Do not turn counting fingers into a fraction, do not turn a fraction into a percentage, and do not decide that one is better or worse than another.
- UNAIDED, BEST-CORRECTED AND PINHOLE ARE DIFFERENT MEASUREMENTS of the same eye. Keep whichever was said as part of the statement: "unaided 6/36, pinhole 6/12", "BCVA 6/9". Never record one as the other, and never assume a vision is best-corrected.
- INTRAOCULAR PRESSURE CARRIES ITS INSTRUMENT: "applanation 18", "NCT 24", "digital tension normal". Record the number when a number was spoken, with the method as said. "Digital tension" is a clinical impression, not a value — store the words, not a number.
- THE OPERATION IS RECORDED IN THE SHORTHAND USED, with the eye: "right eye phaco with PCIOL", "left eye SICS", "trabeculectomy with mitomycin", "pars plana vitrectomy with silicone oil", "YAG capsulotomy". Record as procedure_done with the words said; never expand initials into a longer name the resident did not use.
- EXAMINATION FINDINGS ARE FINDINGS, NOT DIAGNOSES: "anterior chamber quiet", "cells 2 plus", "hypopyon 2 mm", "KPs present", "fundus hazy view", "disc cup 0.7", "RAPD present", "cornea clear". Keep the finding as said; do not name a disease the resident did not name.
- DROPS ARE MEDICATIONS AND THEIR EYE AND TAPER MATTER: "prednisolone drops six times a day in the right eye", "drops tapered to four times", "timolol twice daily both eyes", "atropine at night". Record the drug, the eye, and any spoken frequency. Never invent a taper that was not dictated.
- A PAINFUL EYE AFTER SURGERY OR AN INJECTION IS TIME-CRITICAL. "Pain since last night, vision dropped, lids swollen, hypopyon" — record each as said with its timing. Do not grade the severity yourself.
- INJURY IS RECORDED WITH THE OBJECT AND THE TIME: "hit by a cricket ball two hours ago", "iron piece while hammering", "lime fell into the left eye, washed at home". The object and the interval are the clinical facts.
- Abbreviations to leave AS SAID: "RE"/"LE"/"BE", "IOL", "PCIOL", "IOP", "NCT", "BCVA", "PL"/"PR", "CF", "HM", "RAPD", "PRP", "OCT", "FFA", "DCR", "ROP", "SICS". Store the letters that were said.
`.trim(),

  checklistAnchor: "post_op",

  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  // Empty on purpose: nothing ophthalmic has been built and reviewed here.
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

  lexiconSpecialty: "ophthalmology",

  // The two eye trees first. Headache and polyuria follow because this ward is where an acute
  // angle closure and an undiagnosed diabetes are often first met.
  historyTreeIds: ["red_eye", "vision_loss", "headache", "polyuria", "limb_injury", "fever"],
};
