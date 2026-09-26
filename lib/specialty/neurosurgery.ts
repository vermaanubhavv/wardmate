import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The neurosurgery pack — head injury, the brain, the spine and the shunt.
 *
 * WHAT MAKES A NEUROSURGICAL WARD DIFFERENT. It keeps the surgical clock, but the observation
 * that matters most is not a wound or a drain: it is whether the patient is the same as an hour
 * ago.
 *
 * 1. THE CONSCIOUS LEVEL IS THE VITAL SIGN. "E3V4M5", "GCS 9 from 13", "pupils equal and
 *    reacting", "left pupil 4 mm sluggish" — the numbers and the letters are recorded exactly as
 *    spoken, WITH what they were before when that was said. The app never computes a total from
 *    components nobody added up, and never calls a deterioration.
 *
 * 2. A CHANGE IS THE FINDING, and its timing is part of it: "drowsier since morning", "vomited
 *    twice", "new weakness on the right", "seizure at 4 am". A neurosurgical note is a
 *    comparison, so the guidance keeps the comparison words the resident used.
 *
 * 3. THE OPERATION AND THE HARDWARE ARE NAMED IN SHORTHAND: "decompressive craniectomy", "burr
 *    hole", "VP shunt", "EVD", "ACDF", "laminectomy", "clipping", "coiling". Stored as said.
 *
 * 4. THE SPINE HAS A LEVEL, AND THE LEVEL IS DATA: "D12 burst fracture", "L4-L5 disc",
 *    "power 2 by 5 in both lower limbs", "bladder involvement". A level is never inferred.
 *
 * WHAT IT BORROWS, AND WHEN TO STOP. Discharge templates are the general-surgery ones — a
 * craniotomy discharge is post-operative in shape. Its own (post-craniotomy, head-injury advice,
 * shunt warning signs, post-spinal-fixation) belong in a
 * `lib/discharge-templates-neurosurgery.ts` past pilot.
 *
 * SCORING IS DELIBERATELY EMPTY. The Glasgow Coma Scale is dictated and stored, not scored by
 * this app: it is an examination the resident performs, and a total this app assembled from
 * remembered components would be a number nobody said. No outcome model (Marshall, Rotterdam,
 * Hunt and Hess, WFNS) is offered, because every one of them is prognostic and a prognosis at a
 * bedside is what this app refuses to produce.
 *
 * NOT YET PILOTED ON A REAL UNIT. `SPECIALTY_PACKS=on` for the picker, patch 0086 before a unit
 * can pick it.
 */
export const neurosurgeryPack: SpecialtyPack = {
  key: "neurosurgery",
  label: "Neurosurgery",
  blurb: "Head injury, brain, spine and shunts. Counts post-operative days; conscious level and its change first.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "operation",
  },

  admissionPhrase: "a neurosurgical admission",

  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert a neurosurgical resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Neurosurgical ward — what the words mean here:

- THE CONSCIOUS LEVEL IS RECORDED EXACTLY AS SPOKEN, in whatever form it was said: "GCS 13", "E3V4M6", "E4V5M6 equals 15", "GCS 9 down from 13". If the resident gave components, keep the components; if they gave a total, keep the total. NEVER add components into a total yourself and never fill in a component that was not said.
- PUPILS ARE A FINDING WITH SIDE AND SIZE: "pupils equal and reacting", "right pupil 5 mm not reacting", "anisocoria", "sluggish on the left". Keep the side; never infer one.
- A CHANGE AND ITS TIMING ARE THE POINT: "more drowsy since morning", "same as yesterday", "obeying commands now", "new weakness right upper limb", "seizure at 4 am, one episode, generalised". Preserve the comparison and the time exactly as said. Do NOT conclude deterioration or improvement; record the words.
- POWER IS A NUMBER WITH A LIMB: "power 2 by 5 in both lower limbs", "grade 4 right hand", "plegic left side", "sensation lost below D12". Keep the scale as said.
- THE SPINE LEVEL IS DATA: "D12 burst fracture", "L4-L5 disc prolapse", "C5-C6 ACDF done", "cauda equina features", "bladder and bowel involved". Never infer a level from an image name or an earlier note.
- OPERATIONS AND HARDWARE ARE NAMED AS SPOKEN: "decompressive craniectomy", "burr hole and evacuation", "VP shunt", "EVD in situ", "clipping of aneurysm", "coiling done", "laminectomy", "pedicle screw fixation", "duroplasty", "cranioplasty". Record as procedure_done with the words said.
- DRAINS, DRESSINGS AND CSF are recorded with their figures: "EVD draining 15 ml per hour", "CSF clear", "drain removed", "no CSF leak", "bone flap sunken", "wound healthy". These are observations or existing drain fields.
- IMAGING IS RECORDED AS THE REPORT WAS READ OUT: "CT shows acute SDH 8 mm with midline shift 6 mm", "no fresh bleed", "contusion frontal", "hydrocephalus with periventricular lucency". Keep the measurements said; never estimate a shift nobody measured.
- ANTI-EPILEPTICS AND OSMOTHERAPY are drugs with doses as spoken: "levetiracetam 500 twice daily", "mannitol 100 ml eighth hourly", "3 percent saline running", "phenytoin loaded". Amber until confirmed, like every drug.
- Abbreviations to leave AS SAID: "GCS", "EVD", "VP shunt", "SDH", "EDH", "SAH", "ICH", "ICP", "ACDF", "TBI", "DC" (decompressive craniectomy — store the letters said).
`.trim(),

  checklistAnchor: "post_op",

  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  // Empty on purpose — see the header. GCS is dictated, never scored here, and every
  // neurosurgical outcome model is prognostic.
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

  // Empty: no neurosurgical checklist is written. A head-injury observation checklist and a
  // shunt checklist are the first two, and both need this unit's sign-off.
  checklistFamilies: [],

  lexiconSpecialty: "neurosurgery",

  // The head injury leads: it is what arrives at night and what fills the beds.
  historyTreeIds: [
    "head_injury",
    "altered_sensorium",
    "limb_weakness",
    "headache",
    "low_back_pain",
    "giddiness",
    "fever",
  ],
};
