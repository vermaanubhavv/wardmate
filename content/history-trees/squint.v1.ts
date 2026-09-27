import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, GHAI_PAEDIATRICS, HUTCHISONS, MACLEODS, paedBackground, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * SQUINT / EYES NOT ALIGNED — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward and OPD, north India. Two different histories share one complaint. In a child,
 * usually told by a parent, the questions are when it was first seen, whether it comes and
 * goes, whether glasses straighten it, and whether the turned eye sees at all — and the white
 * glow in the pupil comes before everything else. In an adult, a new squint with double
 * vision is a nerve, junction, muscle or orbit problem until shown otherwise, and the painful
 * one with a large pupil is counted in hours.
 * Differentials: infantile / concomitant esotropia, accommodative esotropia, intermittent
 * exotropia, amblyopia, sensory squint from a poorly seeing eye (cataract, retinoblastoma),
 * microvascular third / fourth / sixth nerve palsy, third nerve palsy from an aneurysm,
 * sixth nerve palsy from raised intracranial pressure, thyroid eye disease, myasthenia gravis,
 * decompensated old squint, traumatic squint.
 */
export const squintV1: HistoryTree = {
  id: "squint",
  version: "1.0.0",
  complaint: "Squint / eyes not aligned",
  triggers: ["squint", "strabismus", "crossed eyes", "cross eyed", "eyes not aligned", "eyes not straight", "eye turning in", "eye turning out", "lazy eye", "amblyopia", "esotropia", "exotropia", "bhenga", "bhengapan", "tedhi aankh", "aankh tedhi", "tirchi aankh"],
  setting: "Eye ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, GHAI_PAEDIATRICS, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("squint"),
    // Birth and development matter for a child's squint and not for an adult's, so they sit in
    // the long case only.
    ...paedBackground()
      .filter((s) => s.id === "birth_history" || s.id === "development")
      .map((s) => ({ ...s, tier: "detailed" as const })),
    val("hpi", "first_noticed", "When first noticed / old photographs", "At what age was the squint first noticed, and do old photographs show it?", ["first noticed", "since birth", "since infancy", "at months", "at years", "photographs", "photos", "old photo", "baby photo", "recently noticed"], { teach: "A squint present from early infancy and one that appears in a child who was straight before are different problems with different urgency." }),
    val("hpi", "eye_and_direction", "Which eye, and which way", "Which eye turns, and does it turn in, out, up or down — or do the eyes take turns?", ["right eye", "left eye", "either eye", "alternating", "turns in", "inwards", "towards nose", "turns out", "outwards", "up", "down", "same eye always"], { teach: "An eye that always turns while the other fixes is the one at risk of not learning to see; eyes that take turns usually share the work." }),
    val("hpi", "constant_intermittent", "Constant or comes and goes", "Is the squint there all the time, or only at times — when tired, ill, daydreaming or looking far?", ["all the time", "constant", "comes and goes", "sometimes", "intermittent", "when tired", "when ill", "daydreaming", "looking far", "evening"]),
    yn("hpi", "near_worse_glasses", "Worse on near work / straighter with glasses", "Is the inward turn worse when looking at near things, and does it straighten when glasses are worn?", ["near", "reading", "looking at toys", "close work", "glasses", "spectacles", "chashma", "straight with glasses", "less with glasses", "far sighted"], { teach: "An inward turn that grows on close focusing and settles with glasses points to focusing effort driving the eyes inwards." }),
    yn("hpi", "closes_eye_sunlight", "Closes one eye in bright light", "Does the child close or rub one eye in bright sunlight?", ["closes one eye", "shuts one eye", "sunlight", "bright light", "outdoors", "squeezes eye", "rubs eye in sun"], { tier: "detailed", teach: "Closing one eye in sunlight is a common early sign of an outward turn that the child is still able to control at times." }),
    yn("hpi", "poor_vision_one_eye", "One eye sees poorly", "Does one eye see poorly — does the child object when the better eye is covered, or bump into things on one side?", ["sees poorly", "weak eye", "cannot see", "objects to covering", "cries when covered", "bumps into things", "poor vision", "kam dikhta", "school screening"], { teach: "An eye that sees poorly from any cause tends to drift, and a turned eye in a young child tends to stop being used — each can lead to the other." }),
    yn("hpi", "head_posture", "Head tilt or turn", "Is the head held tilted or turned to one side, especially when looking at something?", ["head tilt", "tilted head", "head turn", "face turn", "chin up", "chin down", "neck tilted", "torticollis"], { tier: "detailed", teach: "A head held tilted or turned is often the patient keeping single vision by avoiding the direction a weak muscle works in." }),
    yn("hpi", "double_vision", "Double vision", "Is there double vision, and are the images side by side or one above the other?", ["double vision", "diplopia", "seeing double", "two images", "side by side", "one above the other", "do dikhna"], { teach: "Adults with a new squint see double; young children usually switch off the image from the turned eye instead, so its absence in a child is expected." }),
    yn("hpi", "variability_fatigue", "Worse with fatigue, better with rest", "Does the squint or double vision vary through the day — worse in the evening or after reading, better after sleep?", ["evening", "end of day", "tired", "fatigue", "after reading", "better after rest", "better in morning", "varies", "fluctuating"], { teach: "A squint that varies with use and recovers with rest raises a problem at the nerve-muscle junction." }),
    yn("hpi", "ptosis", "Drooping eyelid", "Is either eyelid drooping?", ["drooping", "droop", "ptosis", "lid down", "eye looks small", "heavy lid", "palak"]),
    yn("associated", "previous_patching_surgery", "Glasses, patching or squint surgery before", "Were glasses, patching or squint surgery used before, and was the advice followed?", ["patching", "patch", "occlusion", "glasses", "spectacles", "squint surgery", "operated", "exercises", "stopped wearing", "not followed"]),
    yn("associated", "family_history", "Squint or thick glasses in the family", "Is there squint, lazy eye or thick glasses in parents or siblings?", ["family history", "mother", "father", "sibling", "brother", "sister", "runs in family", "thick glasses", "lazy eye"], { tier: "detailed" }),
    yn("associated", "childhood_squint", "Squint in childhood (adult patient)", "In an adult, was there a squint or lazy eye in childhood that has now become more noticeable?", ["since childhood", "childhood squint", "lazy eye", "as a child", "old squint", "worse now", "increased now"], { tier: "detailed", teach: "A long-standing squint that was held straight can break down in adult life and appear new, sometimes with double vision." }),
    yn("associated", "diabetes_hypertension", "Diabetes / hypertension", "Is the patient known to have diabetes or high blood pressure, and how well controlled is it?", ["diabetes", "diabetic", "sugar", "hypertension", "high bp", "blood pressure", "uncontrolled", "insulin"], { teach: "Diabetes and high blood pressure are a common background to an adult nerve palsy that recovers on its own, once other causes have been considered." }),
    yn("associated", "thyroid_symptoms", "Bulging eyes / thyroid symptoms", "Any staring or bulging eyes, gritty eyes, heat intolerance, weight loss, palpitations, or known thyroid disease?", ["bulging", "staring", "prominent eyes", "gritty", "thyroid", "heat intolerance", "weight loss", "palpitations", "goitre"], { teach: "Thyroid eye disease stiffens the eye muscles and is a common cause of a new vertical squint in adults." }),
    yn("associated", "injury", "Head or eye injury", "Was there a head injury or a blow to the eye or face before the squint appeared?", ["head injury", "blow", "hit", "fall", "road traffic", "accident", "injury", "trauma", "ball"]),
    // Red flags
    yn("red_flag", "white_pupil", "White glow in the pupil", "Has a white or cat's-eye glow been seen in the pupil, in person or in a flash photograph?", ["white pupil", "white reflex", "white glow", "cat's eye", "cats eye", "shine in eye", "white in photo", "leukocoria", "safed"], { teach: "A white glow in the pupil of a young child with a squint raises a tumour inside the eye or a cataract, and both are time-critical." }),
    yn("red_flag", "sudden_headache_pupil", "Sudden severe headache / large pupil / drooping lid", "Did the squint start with a sudden severe headache, or with a drooping lid and one pupil larger than the other?", ["sudden headache", "worst headache", "thunderclap", "severe headache", "large pupil", "dilated pupil", "unequal pupils", "drooping", "neck stiffness"], { teach: "A painful third nerve palsy with a large pupil raises an aneurysm pressing on the nerve, which may bleed within hours." }),
    yn("red_flag", "raised_pressure_symptoms", "Headache on waking / vomiting / unsteady walk", "Is there headache worse on waking, vomiting, unsteady walking, drowsiness, or in a baby a bulging soft spot or growing head?", ["morning headache", "worse on waking", "vomiting", "unsteady", "falls", "drowsy", "sleepy", "bulging fontanelle", "big head", "head growing"], { teach: "A new inward turn with headache and vomiting raises pressure inside the skull, which stretches the sixth nerve whatever the cause." }),
    yn("red_flag", "bulbar_neuro_symptoms", "Swallowing / speech / breathing / limb weakness", "Any difficulty swallowing, slurred or nasal speech, breathlessness, facial weakness, or weakness or numbness of the limbs?", ["difficulty swallowing", "choking", "slurred", "nasal speech", "breathless", "facial weakness", "limb weakness", "numbness", "unsteady", "cannot hold head"], { teach: "A squint with swallowing or breathing difficulty raises a junction disease that can reach the breathing muscles, or a lesion in the brainstem." }),
    yn("red_flag", "proptosis_red_painful", "Eye pushed forward, red and painful", "Is the eye pushed forward, red, swollen or painful, with fever or loss of vision?", ["pushed forward", "protruding", "proptosis", "bulging", "red", "swollen", "painful", "fever", "loss of vision"], { teach: "A protruding, painful eye raises infection, inflammation or a mass in the orbit, which can compress the optic nerve." }),
  ],
  differentials: [
    { id: "infantile_esotropia", name: "Infantile / concomitant esotropia", pointers: ["first_noticed", "eye_and_direction"], discriminators: ["first_noticed", "eye_and_direction", "constant_intermittent", "near_worse_glasses", "family_history", "birth_history"] },
    { id: "accommodative_esotropia", name: "Accommodative esotropia", pointers: ["near_worse_glasses"], discriminators: ["near_worse_glasses", "first_noticed", "constant_intermittent", "family_history", "previous_patching_surgery"] },
    { id: "intermittent_exotropia", name: "Intermittent exotropia", pointers: ["closes_eye_sunlight", "constant_intermittent"], discriminators: ["closes_eye_sunlight", "constant_intermittent", "eye_and_direction", "variability_fatigue"] },
    { id: "amblyopia", name: "Amblyopia", pointers: ["poor_vision_one_eye", "eye_and_direction"], discriminators: ["poor_vision_one_eye", "eye_and_direction", "previous_patching_surgery", "family_history", "white_pupil"] },
    { id: "sensory_squint", name: "Sensory squint from a poorly seeing eye (cataract, retinoblastoma)", pointers: ["white_pupil", "poor_vision_one_eye"], discriminators: ["white_pupil", "poor_vision_one_eye", "first_noticed", "family_history", "injury"] },
    { id: "microvascular_palsy", name: "Microvascular third, fourth or sixth nerve palsy", pointers: ["double_vision", "diabetes_hypertension"], discriminators: ["diabetes_hypertension", "double_vision", "sudden_headache_pupil", "ptosis", "head_posture", "onset_mode"] },
    { id: "aneurysm_third_palsy", name: "Third nerve palsy from an aneurysm", pointers: ["sudden_headache_pupil", "ptosis"], discriminators: ["sudden_headache_pupil", "ptosis", "double_vision", "onset_mode", "diabetes_hypertension"] },
    { id: "raised_icp_sixth", name: "Sixth nerve palsy from raised intracranial pressure", pointers: ["raised_pressure_symptoms", "double_vision"], discriminators: ["raised_pressure_symptoms", "eye_and_direction", "bulbar_neuro_symptoms", "onset_mode", "injury"] },
    { id: "thyroid_eye_disease", name: "Thyroid eye disease", pointers: ["thyroid_symptoms", "double_vision"], discriminators: ["thyroid_symptoms", "proptosis_red_painful", "variability_fatigue", "eye_and_direction", "progression"] },
    { id: "myasthenia", name: "Myasthenia gravis", pointers: ["variability_fatigue", "ptosis", "bulbar_neuro_symptoms"], discriminators: ["variability_fatigue", "ptosis", "bulbar_neuro_symptoms", "double_vision", "thyroid_symptoms"] },
    { id: "decompensated_squint", name: "Decompensated old squint", pointers: ["childhood_squint", "previous_patching_surgery"], discriminators: ["childhood_squint", "previous_patching_surgery", "double_vision", "onset_mode", "variability_fatigue"] },
    { id: "traumatic_squint", name: "Squint after head or orbital injury", pointers: ["injury"], discriminators: ["injury", "double_vision", "head_posture", "onset"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "first_noticed", "eye_and_direction", "constant_intermittent", "near_worse_glasses", "closes_eye_sunlight", "poor_vision_one_eye", "head_posture", "double_vision", "variability_fatigue", "ptosis", "progression", "prior_treatment", "prior_investigations"],
  },
};
