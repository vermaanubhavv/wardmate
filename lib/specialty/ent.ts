import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The ENT pack — otorhinolaryngology, head and neck surgery.
 *
 * WHAT MAKES AN ENT WARD DIFFERENT. It is a surgical department, so it keeps the surgical
 * clock: an operated patient counts from the operation, everyone else from admission, exactly
 * as general surgery does. What it does not share with general surgery is what the round is
 * about.
 *
 * 1. THE AIRWAY IS THE ORGAN AT RISK. Stridor, a tracheostomy tube, a post-tonsillectomy bleed
 *    and a deep neck space infection are all airway problems first and everything else second.
 *    The extraction guidance below is built around recording those words as said, with their
 *    side and their timing, because in this department the history is often minutes old.
 *
 * 2. LATERALITY IS CLINICAL DATA, NOT A DETAIL. Right ear, left ear, one nostril, one vocal
 *    cord: almost every finding on this ward belongs to a side, and a side dropped from a note
 *    is a side that gets operated on wrongly. The guidance refuses to infer one.
 *
 * 3. THE OPERATION IS NAMED IN SHORTHAND. "Type 1 tympanoplasty", "MRM", "FESS", "SMR",
 *    "adenotonsillectomy" — stored as the letters and words said, never expanded by the app.
 *
 * 4. THE CASEMIX IS CHRONIC EAR DISEASE AND TOBACCO. Chronic otitis media with its sequelae,
 *    and oral cavity / laryngeal malignancy in tobacco and areca-nut users, in a population
 *    that presents late.
 *
 * WHAT THIS PACK BORROWS, AND WHEN TO STOP. Discharge templates are the general-surgery ones:
 * an ENT discharge is a post-operative discharge in shape — operation, findings, what was
 * removed, wound and suture care, when to come back — and a generic surgical template holds
 * that. Its own templates (tympanoplasty, FESS, tonsillectomy, tracheostomy care at home,
 * post-laryngectomy) are the first thing to add past pilot, in a
 * `lib/discharge-templates-ent.ts`.
 *
 * SCORING IS DELIBERATELY EMPTY. WardMate has built no ENT pathway, and an empty list is a
 * clinical statement — an ENT unit must not be offered Ranson's or CURB-65 because they happen
 * to exist. Nothing is offered until something is built and reviewed.
 *
 * NOT YET PILOTED ON A REAL UNIT. Gated as every pack is: `SPECIALTY_PACKS=on` for the picker,
 * and patch 0082 run before a unit can pick this specialty. Clinical content is pending
 * clinician review.
 */
export const entPack: SpecialtyPack = {
  key: "ent",
  label: "ENT (Otorhinolaryngology)",
  blurb: "Ear, nose, throat, head and neck. Counts post-operative days; airway and laterality first.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "operation",
  },

  admissionPhrase: "an ENT admission",

  // The surgical clock, unchanged: operated patients from the operation, everyone else from
  // admission, and the label always says which.
  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert an ENT resident's spoken ward-round note into structured observations.",

  extractGuidance: `
ENT ward — what the words mean here:

- LATERALITY IS PART OF THE FINDING. "Right ear discharging", "left nostril blocked", "left cord immobile" — keep the side inside the observation exactly as said. If no side was spoken, record none. NEVER infer a side from an earlier entry, from the operation, or from which side is commoner.
- AIRWAY WORDS ARE RECORDED VERBATIM AND WITH THEIR TIMING: "stridor present", "noisy breathing since morning", "drooling", "cannot swallow saliva", "tracheostomy tube in situ", "decannulated yesterday", "tube changed". These are observations, not conclusions — do not grade an airway as stable or unstable yourself.
- OPERATION NAMES ARE STORED AS SPOKEN and never expanded: "type 1 tympanoplasty", "cortical mastoidectomy", "MRM", "FESS", "SMR", "septoplasty", "adenotonsillectomy", "direct laryngoscopy and biopsy", "tracheostomy", "total laryngectomy with neck dissection". Record as procedure_done with the words said.
- EXAMINATION SHORTHAND IS A FINDING, NOT A DIAGNOSIS: "otoscopy shows central perforation", "attic retraction", "DNE shows polyp in middle meatus", "IDL shows left cord palsy", "Rinne negative on the right", "Weber lateralised to left". Keep the finding; do not turn it into a named disease the resident did not say.
- AUDIOLOGY NUMBERS ARE INVESTIGATIONS: "PTA shows 45 dB conductive loss", "air-bone gap 30 dB", "tympanogram type B", "BERA normal". Record the number spoken with its unit. Never grade a hearing loss the resident did not grade.
- PACKS, DRAINS AND TUBES have things said about them each round: "anterior pack in situ", "pack removed", "no fresh bleed", "drain 20 ml serous", "grommet in place", "tracheostomy tube size changed". These are notes or existing drain fields, not new operations.
- POST-OPERATIVE BLEEDING IS TIME-CRITICAL AND IS RECORDED WITH ITS VOLUME AS SAID: "spat out two mouthfuls of blood", "fresh bleed from tonsillar fossa", "swallowing repeatedly". Do not estimate a volume nobody gave.
- TOBACCO, GUTKA AND ARECA NUT are exposures this ward asks about on every head-and-neck admission. Record the substance and the duration exactly as spoken.
- Abbreviations to leave AS SAID: "RT" (ambiguous — radiotherapy or Ryle's tube), "MRM" (modified radical mastoidectomy here, but store the letters said), "FESS", "SMR", "DNS", "PTA", "IDL", "DNE", "CSOM", "BERA".
`.trim(),

  checklistAnchor: "post_op",

  // General surgery's templates, on purpose — see the header for what to add and when.
  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  // Empty on purpose. Nothing ENT-specific has been built and reviewed, and offering an
  // unrelated pathway because it exists would be worse than offering none.
  scoringKeys: [],

  // All six slots: this department operates.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "ot_notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "after_surgery",

  // Empty, deliberately, exactly as scoringKeys is: no ENT checklist has been written, and an
  // ENT unit must not be handed general surgery's operations (lap chole, appendicectomy) just
  // because it also operates. The operation is still typed freely and kept as typed; only the
  // checklist behind it is absent until this unit's own are seeded.
  checklistFamilies: [],

  lexiconSpecialty: "ent",

  // Ear first — the discharging ear is what fills this ward — then nose, then throat and neck.
  historyTreeIds: [
    "ear_discharge",
    "epistaxis",
    "hoarseness",
    "sore_throat",
    "giddiness",
    "dysphagia",
    "lump",
    "snoring_sleepiness",
    "head_injury",
    "fever",
  ],
};
