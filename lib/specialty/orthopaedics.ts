import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The orthopaedics pack — trauma and elective bone and joint surgery.
 *
 * WHAT MAKES AN ORTHOPAEDIC WARD DIFFERENT. It keeps the surgical clock, because an operated
 * patient is counted from the operation exactly as in general surgery. What differs is what
 * every sentence on the round is about.
 *
 * 1. THE INJURY HAS A SIDE, A BONE AND A MECHANISM, and all three are dictated together:
 *    "right intertrochanteric femur, fall at home, three days back". A side dropped from a
 *    note is a side that gets operated on wrongly, so the guidance below refuses to infer one.
 *
 * 2. THE IMPLANT IS THE TREATMENT, and it is named in shorthand — "DHS", "PFN", "TKR", "K-wire",
 *    "ex-fix", "hemiarthroplasty". Stored as the letters and words said, never expanded by the
 *    app into an implant nobody named.
 *
 * 3. WEIGHT BEARING AND RANGE OF MOVEMENT ARE THE DAILY NUMBERS. "Non-weight bearing",
 *    "partial weight bearing with walker", "knee flexion 0 to 90" are what changes between one
 *    round and the next, and they are ordinary observations.
 *
 * 4. THE LIMB IS WATCHED FOR THINGS THAT COST IT. Distal pulses, sensation, capillary refill,
 *    pain out of proportion, a tight cast: compartment syndrome and a vascular injury are the
 *    two emergencies, and both are recorded as what was found, never as a grade this app
 *    invents.
 *
 * WHAT IT BORROWS, AND WHEN TO STOP. Discharge templates are the general-surgery ones: an
 * orthopaedic discharge has the shape of a post-operative one — operation, implant, wound,
 * weight-bearing instruction, when to come back. Its own (post-arthroplasty, fracture fixation,
 * spine, amputation) belong in a `lib/discharge-templates-orthopaedics.ts` past pilot.
 *
 * SCORING is the two Wells pathways and nothing else. They are built, reviewed and active, and
 * venous thromboembolism after a hip fracture or an arthroplasty is this ward's own risk rather
 * than a score borrowed for the sake of having one. No fracture classification is offered:
 * Garden, Neer and Schatzker are read off an image by the surgeon, and a classification this
 * app produced would be a diagnosis it is not allowed to make.
 *
 * NOT YET PILOTED ON A REAL UNIT. Gated as every pack is: `SPECIALTY_PACKS=on` for the picker,
 * and patch 0086 run before a unit can pick this specialty.
 */
export const orthopaedicsPack: SpecialtyPack = {
  key: "orthopaedics",
  label: "Orthopaedics",
  blurb: "Trauma, arthroplasty and spine. Counts post-operative days; side, implant and weight bearing first.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "operation",
  },

  admissionPhrase: "an orthopaedic admission",

  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert an orthopaedic resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Orthopaedic ward — what the words mean here:

- SIDE IS PART OF THE FINDING, ALWAYS. "Right hip", "left tibia", "both knees" — keep the side inside the observation exactly as said. If no side was spoken, record none. NEVER infer a side from an earlier entry, from the operation, or from which side is commoner.
- THE INJURY IS RECORDED WITH ITS MECHANISM AND ITS AGE AS SPOKEN: "fall from height", "road traffic accident", "twisting injury while walking", "slipped in bathroom", "three days back", "same day". Do not convert a mechanism into a diagnosis.
- FRACTURE NAMES AND CLASSIFICATIONS ARE STORED AS SPOKEN, never inferred: "intertrochanteric femur", "neck of femur", "both bone forearm", "distal radius", "comminuted", "displaced", "Garden 3", "Neer 2 part". If the resident did not classify it, it has no classification.
- IMPLANTS AND FIXATION ARE NAMED IN SHORTHAND and kept that way: "DHS", "PFN", "CRIF with K-wire", "ORIF with plating", "hemiarthroplasty", "total knee replacement", "external fixator", "spanning ex-fix", "interlocking nail", "cement spacer". Record as procedure_done with the words said.
- IMMOBILISATION IS A DAILY OBSERVATION: "above knee POP slab", "below elbow cast", "cast changed", "skin traction 3 kg", "Thomas splint", "cervical collar", "brace on". Record the device and what was done to it.
- WEIGHT BEARING AND RANGE OF MOVEMENT are observations with their own words: "non-weight bearing", "toe touch", "partial weight bearing with walker", "full weight bearing", "knee flexion 0 to 90", "straight leg raise able", "quadriceps drill started". Keep the numbers said; never estimate a range nobody measured.
- THE LIMB CHECK IS RECORDED AS FINDINGS, NOT A VERDICT: "distal pulses present", "dorsiflexion absent", "sensation intact over first web space", "capillary refill under two seconds", "pain on passive stretch", "cast feels tight", "swelling increasing". Compartment syndrome and vascular injury are conclusions a surgeon draws; record what was observed and let the gap stand if nothing was said.
- THE WOUND AND THE PIN SITES have things said about them each round: "wound healthy", "soakage present", "pin site discharging", "sutures removed", "dressing changed", "gape at proximal end". These are observations or existing drain and wound fields.
- TRACTION, BLOOD LOSS AND TRANSFUSION are said as numbers: "two units transfused", "drain 150 ml", "haemoglobin 7.8". Record the number with its unit.
- Abbreviations to leave AS SAID: "DHS", "PFN", "TKR", "THR", "ORIF", "CRIF", "POP", "ACL", "PLIF", "AKA", "BKA", "ex-fix". "RTA" is a mechanism, not a diagnosis.
`.trim(),

  checklistAnchor: "post_op",

  // General surgery's templates, on purpose — see the header.
  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  // The two Wells pathways only: built, active, and this ward's own risk after a hip fracture
  // or an arthroplasty. No fracture classification is a score this app may produce.
  scoringKeys: ["wells_dvt", "wells_pe"],

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

  // Empty, exactly as scoringKeys is not: no orthopaedic checklist has been written, and this
  // unit must not be handed general surgery's operations because it also operates. A
  // post-arthroplasty and a fracture-fixation checklist are the first to seed.
  checklistFamilies: [],

  lexiconSpecialty: "orthopaedics",

  // Trauma leads, because in this country it fills the ward — then the joint, then the spine.
  historyTreeIds: [
    "limb_injury",
    "joint_pain",
    "low_back_pain",
    "limb_weakness",
    "leg_ulcer",
    "lump",
    "fever",
    "head_injury",
  ],
};
