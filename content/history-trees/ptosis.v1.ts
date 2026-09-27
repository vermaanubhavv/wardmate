import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * DROOPING OF THE EYELID — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Eye ward and OPD, north India. Most drooping lids are present from birth or come slowly
 * with age; the history exists to find the few that are nerve or junction problems. Whether
 * the droop varies with fatigue, whether the eye moves and the eyes stay together, and
 * whether the pupil has changed sort them. A new droop with a large pupil and headache, or
 * with a small pupil and neck pain, is counted in hours; in a child the question is whether
 * the lid is covering the pupil while vision is still developing.
 * Differentials: congenital ptosis, aponeurotic (age-related) ptosis, myasthenia gravis,
 * third nerve palsy (microvascular or from an aneurysm), Horner syndrome (including carotid
 * dissection and lung apex causes), mechanical ptosis from a lid mass, chalazion or oedema,
 * pseudoptosis, traumatic ptosis.
 */
export const ptosisV1: HistoryTree = {
  id: "ptosis",
  version: "1.0.0",
  complaint: "Drooping of the eyelid",
  triggers: ["ptosis", "drooping eyelid", "drooping of eyelid", "drooping of the eyelid", "drooping of lid", "eyelid drooping", "droopy eyelid", "droopy lid", "lid droop", "blepharoptosis", "palak girna", "palak jhukna", "palak latakna", "palak neeche"],
  setting: "Eye ward and OPD, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("drooping of the eyelid"),
    val("hpi", "side", "Which lid", "Is the drooping in one eyelid or both?", ["right eye", "left eye", "right lid", "left lid", "one eye", "both eyes", "bilateral", "unilateral", "alternating"], { teach: "A droop that moves from one eye to the other over days points away from a fixed nerve or lid problem and towards the nerve-muscle junction." }),
    yn("hpi", "since_birth", "Present since birth", "Has the droop been there since birth or early childhood, and do old photographs show it?", ["since birth", "from birth", "congenital", "since childhood", "photographs", "photos", "baby photo", "always been there"]),
    yn("hpi", "covers_pupil_child", "Lid covering the pupil in a child", "In a child, does the lid cover the pupil, and has vision in that eye been checked?", ["covers the pupil", "covering the eye", "cannot see under lid", "eye closed", "vision checked", "weak eye", "lazy eye", "glasses"], { teach: "A lid covering the pupil while a child's vision is still developing can stop that eye learning to see, which makes the timing matter." }),
    yn("hpi", "chin_up_brow_raise", "Chin lifted / eyebrows raised to see", "Does the patient lift the chin or raise the eyebrows to see from under the lid?", ["chin up", "head tilted back", "raises eyebrows", "forehead wrinkled", "lifts the lid", "lifts lid with finger", "head back"], { tier: "detailed" }),
    yn("hpi", "jaw_wink", "Lid moves with chewing or sucking", "Does the drooping lid jump up when the child chews, sucks or opens the mouth?", ["chewing", "sucking", "feeding", "opens mouth", "jaw", "lid jumps", "winks", "moves while eating"], { tier: "detailed", teach: "A lid that lifts with jaw movement in a child with a droop from birth reflects miswired nerves to the lid and jaw muscles." }),
    yn("hpi", "variability_fatigue", "Worse with fatigue, better with rest", "Does the droop vary through the day — worse in the evening or after reading, better after sleep or rest?", ["evening", "end of day", "tired", "fatigue", "after reading", "better after rest", "better in morning", "varies", "fluctuating", "comes and goes"], { teach: "A droop that worsens with use and recovers with rest raises a problem at the nerve-muscle junction rather than in the lid or nerve." }),
    yn("hpi", "double_vision", "Double vision", "Is there double vision, and does it go away when one eye is covered?", ["double vision", "diplopia", "seeing double", "two images", "do dikhna", "goes away on covering"], { teach: "A droop with double vision points to the nerve or junction that also moves the eye, not to the lid alone." }),
    yn("hpi", "pupil_change", "One pupil larger or smaller", "Has anyone noticed one pupil larger or smaller than the other?", ["pupil", "large pupil", "dilated pupil", "small pupil", "unequal pupils", "pinpoint", "different size", "black part bigger"], { teach: "With a droop, a larger pupil on that side points to the third nerve and a smaller one to the sympathetic chain." }),
    yn("hpi", "less_sweating_face", "Less sweating on one side of the face", "Is there less sweating, or a drier and warmer face, on the same side?", ["less sweating", "no sweating", "dry face", "one side dry", "sweats on one side", "flushing one side"], { tier: "detailed" }),
    yn("hpi", "lid_lump_swelling", "Lump or swelling of the lid", "Is there a lump, swelling or heaviness of the lid itself weighing it down?", ["lump", "swelling", "heavy lid", "chalazion", "stye", "gudheri", "anjani", "growth", "puffy lid", "mass"], { teach: "A lump or swelling in the lid can pull it down mechanically, and a growing one is worth a closer look for a growth." }),
    yn("hpi", "excess_skin_other_eye", "Excess lid skin / sunken or small eye / other eye prominent", "Is it folded extra skin hanging over the lid rather than the lid itself, or is the drooping eye small or sunken, or the other eye more prominent?", ["extra skin", "loose skin", "skin folds", "hanging skin", "sunken eye", "small eye", "other eye bulging", "other eye prominent", "artificial eye"], { teach: "Extra skin, a small or sunken eye, or a bulging fellow eye can look like a droop when the lid itself is working normally." }),
    yn("associated", "contact_lens_surgery_rubbing", "Past eye surgery, contact lenses or eye rubbing", "Has the patient had eye surgery, worn contact lenses for years, or rubbed the eyes a lot?", ["cataract surgery", "eye surgery", "operated", "contact lens", "hard lens", "rubbing", "rubs eyes", "old age", "gradually"], { teach: "Surgery, years of contact lenses and repeated rubbing stretch the tendon that lifts the lid, which is the commonest cause of a droop in older adults." }),
    yn("associated", "diabetes_hypertension", "Diabetes / hypertension", "Is the patient known to have diabetes or high blood pressure, and how well controlled is it?", ["diabetes", "diabetic", "sugar", "hypertension", "high bp", "blood pressure", "uncontrolled", "insulin"], { teach: "Diabetes and high blood pressure are a common background to a third nerve palsy that recovers on its own, once an aneurysm has been considered." }),
    yn("associated", "injury", "Injury to the lid, eye or head", "Was there an injury to the lid, eye or head, or a cut on the upper lid, before the droop?", ["injury", "blow", "hit", "cut", "laceration", "fall", "road traffic", "accident", "trauma", "head injury"]),
    yn("associated", "smoking_chest_arm", "Smoker / cough / arm or shoulder pain", "Is the patient a smoker, with cough, blood in sputum, weight loss, or pain in the shoulder or down the inner arm?", ["smoker", "smoking", "bidi", "cough", "blood in sputum", "weight loss", "shoulder pain", "arm pain", "hand weakness"], { tier: "detailed", teach: "A growth at the top of the lung can press on the sympathetic chain in the neck and show up first as a small pupil and droop." }),
    // Red flags
    yn("red_flag", "sudden_headache_large_pupil", "Sudden severe headache with a large pupil", "Did the droop start with a sudden severe headache, eye pain, or a pupil larger on the same side?", ["sudden headache", "worst headache", "thunderclap", "severe headache", "large pupil", "dilated pupil", "unequal pupils", "eye pain", "vomiting", "neck stiffness"], { teach: "A painful third nerve palsy with a large pupil raises an aneurysm pressing on the nerve, which may bleed within hours." }),
    yn("red_flag", "neck_face_pain_small_pupil", "Neck, face or eye pain with a small pupil", "Did the droop come with pain in the neck, face, jaw or around the eye, especially after neck strain, a jerk, a massage or an injury?", ["neck pain", "face pain", "jaw pain", "pain around eye", "headache", "neck injury", "neck massage", "chiropractic", "jerk", "whiplash", "small pupil"], { teach: "A new painful droop with a small pupil raises a tear in the carotid artery wall, which can cause a stroke in the following days." }),
    yn("red_flag", "bulbar_breathing", "Swallowing / speech / breathing / neck weakness", "Any difficulty swallowing, choking, slurred or nasal speech, breathlessness, or weakness of the neck or limbs?", ["difficulty swallowing", "choking", "nasal speech", "slurred", "breathless", "shortness of breath", "neck weakness", "head drop", "limb weakness", "chewing tires"], { teach: "A droop with swallowing or breathing difficulty raises a junction disease that can reach the breathing muscles." }),
    yn("red_flag", "brainstem_symptoms", "Sudden vertigo / numbness / limb weakness / unsteadiness", "At onset, was there sudden vertigo, numbness or weakness of the face or limbs, slurred speech, hiccups, or unsteadiness?", ["vertigo", "giddiness", "chakkar", "numbness", "weakness", "slurred speech", "hiccups", "unsteady", "falling to one side", "hoarse"], { teach: "A droop with sudden vertigo, numbness or unsteadiness raises a stroke in the brainstem, which is time-critical." }),
  ],
  differentials: [
    { id: "congenital_ptosis", name: "Congenital ptosis", pointers: ["since_birth", "covers_pupil_child"], discriminators: ["since_birth", "covers_pupil_child", "jaw_wink", "chin_up_brow_raise", "double_vision", "side"] },
    { id: "aponeurotic_ptosis", name: "Aponeurotic (age-related) ptosis", pointers: ["contact_lens_surgery_rubbing"], discriminators: ["contact_lens_surgery_rubbing", "onset_mode", "variability_fatigue", "double_vision", "pupil_change", "side"] },
    { id: "myasthenia", name: "Myasthenia gravis", pointers: ["variability_fatigue", "double_vision", "bulbar_breathing"], discriminators: ["variability_fatigue", "double_vision", "bulbar_breathing", "side", "pupil_change"] },
    { id: "third_nerve_microvascular", name: "Microvascular third nerve palsy", pointers: ["double_vision", "diabetes_hypertension"], discriminators: ["diabetes_hypertension", "pupil_change", "sudden_headache_large_pupil", "double_vision", "onset_mode"] },
    { id: "third_nerve_aneurysm", name: "Third nerve palsy from an aneurysm", pointers: ["sudden_headache_large_pupil", "pupil_change"], discriminators: ["sudden_headache_large_pupil", "pupil_change", "double_vision", "onset_mode", "diabetes_hypertension"] },
    { id: "horner_syndrome", name: "Horner syndrome (carotid dissection, lung apex, brainstem)", pointers: ["pupil_change", "less_sweating_face", "neck_face_pain_small_pupil"], discriminators: ["neck_face_pain_small_pupil", "pupil_change", "less_sweating_face", "smoking_chest_arm", "brainstem_symptoms", "injury"] },
    { id: "mechanical_ptosis", name: "Mechanical ptosis (lid mass, chalazion, oedema)", pointers: ["lid_lump_swelling"], discriminators: ["lid_lump_swelling", "progression", "onset_mode", "variability_fatigue"] },
    { id: "pseudoptosis", name: "Pseudoptosis (excess lid skin, small or sunken eye, fellow-eye proptosis)", pointers: ["excess_skin_other_eye"], discriminators: ["excess_skin_other_eye", "double_vision", "since_birth", "side"] },
    { id: "traumatic_ptosis", name: "Traumatic ptosis", pointers: ["injury"], discriminators: ["injury", "double_vision", "pupil_change", "onset"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "since_birth", "covers_pupil_child", "variability_fatigue", "double_vision", "pupil_change", "lid_lump_swelling", "excess_skin_other_eye", "progression", "prior_treatment", "prior_investigations"],
  },
};
