import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, GHAI_PAEDIATRICS, HUTCHISONS, MACLEODS, val, yn, YOUMANS } from "@/content/history-trees/_helpers";

/**
 * PROBLEM WITH A BRAIN SHUNT (VP SHUNT) — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Neurosurgery ward and casualty, north India. Most patients are children and the informant
 * is usually a parent, who often knows better than anyone what a blocked shunt looked like
 * last time. Hydrocephalus after tuberculous meningitis is a common reason for the shunt
 * locally. Differentials: shunt blockage with raised pressure, shunt infection,
 * over-drainage / slit ventricles, disconnection, fracture or migration of the tube, abdominal
 * complications (pseudocyst, peritonitis, bowel perforation), CSF leak from the wound,
 * seizures, and an intercurrent viral illness or gastroenteritis that mimics a malfunction.
 */
export const shuntProblemV1: HistoryTree = {
  id: "shunt_problem",
  version: "1.0.0",
  complaint: "Problem with a brain shunt (VP shunt)",
  triggers: ["vp shunt", "shunt problem", "shunt block", "shunt blocked", "shunt blockage", "shunt malfunction", "shunt infection", "shunt dysfunction", "shunt tube", "brain shunt", "shunted child", "shunt revision", "blocked shunt"],
  setting: "Neurosurgery ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [YOUMANS, GHAI_PAEDIATRICS, BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("shunt problem"),
    val("hpi", "shunt_reason", "Why the shunt was put in", "Why was the shunt put in — hydrocephalus from birth, after meningitis or brain TB, a tumour, a bleed, or with a swelling on the back at birth?", ["hydrocephalus", "big head", "from birth", "meningitis", "tb meningitis", "brain tb", "tumour", "bleed", "premature", "spina bifida", "swelling on back", "after injury"], { teach: "The reason for the shunt shapes the risks: shunts after infection or bleeding block more often, and a child with spina bifida may also have a tethered cord or Chiari problems." }),
    val("hpi", "shunt_date", "When the shunt was inserted", "When and where was the shunt first put in?", ["months ago", "years ago", "inserted", "operated", "put in", "at birth", "hospital", "first surgery"], { numeric: true }),
    val("hpi", "shunt_revisions", "Previous revisions", "How many times has the shunt been changed or re-operated, when was the last, and why?", ["revision", "revised", "changed", "re operated", "second surgery", "third time", "blocked before", "infected before", "last operation", "no revision"], { numeric: true }),
    val("hpi", "last_malfunction_picture", "How the last malfunction looked", "When the shunt blocked before, what did it look like — headache, vomiting, sleepiness, eyes turning down, fits, or a change in behaviour?", ["last time", "same as before", "similar", "headache", "vomiting", "sleepy", "eyes down", "fits", "irritable", "not himself", "not herself"], { teach: "A parent's account that this looks like the last blockage is one of the most useful single pieces of history in a shunted child." }),
    yn("hpi", "like_last_time", "Same as the previous malfunction", "Does the family feel this is the same as when the shunt blocked before?", ["same as last time", "exactly like before", "just like before", "different from before", "not like last time"]),
    val("hpi", "baseline_state", "Usual state before this illness", "What is the patient's usual state — walking, talking, feeding, schooling, head size — and how does today compare?", ["usually", "normally", "before this", "walks", "talks", "goes to school", "baseline", "not himself", "not herself", "lost skills"]),
    yn("hpi", "valve_type_mri", "Programmable valve or recent scan", "Is the valve an adjustable (programmable) one, and has there been a recent MRI or contact with a strong magnet?", ["programmable", "adjustable valve", "setting", "mri", "magnet", "card", "valve pressure"], { tier: "detailed" }),
    yn("associated", "shunt_headache", "Headache", "Is there headache, and is it worse on waking or lying down, or worse on sitting or standing up?", ["headache", "sir dard", "morning headache", "worse lying", "worse on standing", "better lying down", "holding head"]),
    yn("associated", "postural_headache", "Headache relieved by lying flat", "Is the headache relieved by lying flat and brought on by sitting or standing?", ["better lying down", "relieved lying", "worse standing", "worse sitting up", "postural", "comes on standing"], { teach: "A headache eased by lying flat points towards the shunt draining too much rather than too little." }),
    yn("associated", "shunt_vomiting", "Vomiting", "Any vomiting, how often, and is it worse in the morning or without nausea?", ["vomiting", "ulti", "morning vomiting", "projectile", "repeated vomiting", "times"]),
    yn("associated", "irritability_feeding", "Irritability or poor feeding in an infant", "In an infant, is there irritability, a high-pitched cry, or refusal of feeds?", ["irritable", "crying", "high pitched cry", "not feeding", "refusing feeds", "poor feeding", "doodh nahi pee raha"]),
    yn("associated", "head_fontanelle", "Head size or soft spot", "Is the head growing faster, the soft spot bulging, or the scalp veins more prominent?", ["head growing", "bigger head", "bulging fontanelle", "tense fontanelle", "soft spot", "scalp veins", "sutures"]),
    yn("associated", "shunt_fever", "Fever", "Any fever, and since when?", ["fever", "bukhar", "temperature", "high grade", "low grade", "no fever"]),
    yn("associated", "tract_swelling", "Swelling or redness along the tube", "Any swelling, redness, pain or fluid collection over the valve or along the course of the tube in the neck, chest or abdomen?", ["swelling over valve", "swelling along tube", "redness", "red track", "fluid collection", "puffy", "tender tube", "pain along tube"]),
    yn("associated", "wound_leak", "Fluid from the wound", "Is clear fluid leaking from the head or abdominal wound?", ["leaking", "clear fluid", "watery discharge", "wound wet", "csf leak", "fluid from wound"]),
    yn("associated", "abdominal_symptoms", "Abdominal pain or swelling", "Any abdominal pain, swelling, a lump in the abdomen, or change in bowel habit?", ["abdominal pain", "pet dard", "abdominal swelling", "distension", "lump in abdomen", "constipation", "loose stools"]),
    yn("associated", "vision_eyes", "Eye or vision change", "Any blurring, double vision, a new squint, or eyes looking downwards?", ["blurring", "double vision", "squint", "eyes down", "sunsetting", "cannot look up", "vision"]),
    yn("associated", "shunt_seizures", "Seizures", "Any fits, and are they new or more frequent than usual?", ["fits", "fit", "jerking", "convulsion", "more fits", "new fits", "daura"]),
    yn("associated", "sick_contacts", "Illness in contacts", "Is anyone else at home unwell with fever, cold, loose stools or vomiting?", ["others ill", "sibling ill", "family unwell", "contacts", "cold", "loose stools at home", "same illness", "outbreak"], { teach: "Illness in the household makes a viral cause more likely, but a shunt can block during any intercurrent illness, so this weighs the story rather than settles it." }),
    yn("associated", "trauma_or_growth", "Fall, pull on the tube, or growth", "Any recent fall, knock over the tube, a feeling of something snapping, or a big growth spurt since the shunt was placed?", ["fall", "knock", "hit", "tube pulled", "snapped", "growth spurt", "grown tall", "years since"]),
    // Red flags
    yn("red_flag", "reduced_consciousness", "Drowsiness or difficult to wake", "Is the patient drowsier than usual, difficult to wake, or not responding normally?", ["drowsy", "sleepy", "difficult to wake", "not responding", "unconscious", "lethargic", "confused", "behosh"], { teach: "Drowsiness in a shunted patient is taken as a blocked shunt until shown otherwise, because deterioration can be rapid." }),
    yn("red_flag", "upgaze_palsy", "Eyes turning down or loss of upward gaze", "Are the eyes turned down, unable to look up, or is there a new squint?", ["eyes down", "sunsetting", "setting sun", "cannot look up", "new squint", "eyes turning"], { teach: "Downward-turned eyes and a new squint are signs of rising pressure on the upper brainstem." }),
    yn("red_flag", "breathing_pulse_change", "Irregular breathing or slow pulse", "Any pauses in breathing, irregular breathing, or a slow pulse noted?", ["pauses in breathing", "irregular breathing", "apnoea", "slow pulse", "low heart rate", "stops breathing"], { teach: "Irregular breathing with a slow pulse is a late sign of raised pressure and signals that time is very short." }),
    yn("red_flag", "fever_recent_surgery", "Fever within months of shunt surgery", "Has there been fever with redness over the tube, or fever within a few months of the last shunt operation?", ["fever after surgery", "recent operation", "weeks after surgery", "months after surgery", "redness over tube", "pus", "wound infection"], { teach: "Most shunt infections declare themselves in the months after an operation, often with only fever and vague unwellness." }),
    yn("red_flag", "tube_exposed", "Tube exposed or coming out", "Is any part of the tube visible through the skin, or coming out of the anus, navel, vagina or a wound?", ["tube visible", "tube exposed", "tube coming out", "from anus", "from navel", "per rectum", "skin broken over tube", "extrusion"], { teach: "A tube passing out through the bowel or skin means a direct route for infection into the brain." }),
    yn("red_flag", "peritonitis_signs", "Severe abdominal pain or a rigid, swollen abdomen", "Is the abdominal pain severe with fever, a hard swollen belly, or repeated vomiting?", ["severe abdominal pain", "rigid abdomen", "hard belly", "tense abdomen", "guarding", "peritonitis", "fever with abdominal pain"]),
  ],
  differentials: [
    { id: "shunt_obstruction", name: "Shunt blockage with raised intracranial pressure", pointers: ["reduced_consciousness", "upgaze_palsy", "like_last_time", "shunt_vomiting", "head_fontanelle"], discriminators: ["last_malfunction_picture", "like_last_time", "shunt_headache", "shunt_vomiting", "head_fontanelle", "reduced_consciousness", "upgaze_palsy"] },
    { id: "shunt_infection", name: "Shunt infection", pointers: ["fever_recent_surgery", "tract_swelling", "shunt_fever"], discriminators: ["fever_recent_surgery", "shunt_revisions", "tract_swelling", "shunt_fever", "wound_leak", "tube_exposed"] },
    { id: "over_drainage", name: "Over-drainage or slit ventricles", pointers: ["postural_headache"], discriminators: ["postural_headache", "shunt_headache", "valve_type_mri", "shunt_date"] },
    { id: "disconnection_migration", name: "Disconnection, fracture or migration of the tube", pointers: ["trauma_or_growth", "tract_swelling"], discriminators: ["trauma_or_growth", "tract_swelling", "shunt_date", "last_malfunction_picture"] },
    { id: "abdominal_complication", name: "Abdominal pseudocyst, peritonitis or bowel perforation", pointers: ["abdominal_symptoms", "peritonitis_signs", "tube_exposed"], discriminators: ["abdominal_symptoms", "peritonitis_signs", "tube_exposed", "shunt_fever", "shunt_revisions"] },
    { id: "csf_leak", name: "CSF leak from the wound", pointers: ["wound_leak"], discriminators: ["wound_leak", "shunt_revisions", "tract_swelling", "shunt_fever"] },
    { id: "seizure_disorder", name: "Seizures without a shunt malfunction", pointers: ["shunt_seizures"], discriminators: ["shunt_seizures", "baseline_state", "reduced_consciousness", "shunt_reason"] },
    { id: "intercurrent_illness", name: "Viral illness or gastroenteritis mimicking a malfunction", pointers: ["sick_contacts", "shunt_fever"], discriminators: ["sick_contacts", "abdominal_symptoms", "like_last_time", "reduced_consciousness", "head_fontanelle"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "shunt_reason", "shunt_date", "shunt_revisions", "last_malfunction_picture", "like_last_time", "baseline_state", "progression", "prior_treatment", "prior_investigations"],
  },
};
