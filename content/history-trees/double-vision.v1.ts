import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * DOUBLE VISION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward and casualty, north India. The first question splits the whole history: does the
 * doubling stay with one eye covered (an eye problem) or go away (the eyes are not moving
 * together)? Binocular doubling is then a nerve, junction, muscle or orbit problem, and the
 * painful third nerve palsy and the raised-pressure sixth are counted in hours.
 * Differentials: monocular doubling from cataract, refractive or corneal cause, microvascular
 * third / fourth / sixth nerve palsy, third nerve palsy from a posterior communicating artery
 * aneurysm, sixth nerve palsy from raised intracranial pressure, myasthenia gravis, thyroid
 * eye disease, orbital floor fracture, orbital mass or orbital cellulitis, decompensated
 * childhood squint, giant cell arteritis.
 */
export const doubleVisionV1: HistoryTree = {
  id: "double_vision",
  version: "1.0.0",
  complaint: "Double vision",
  triggers: ["double vision", "diplopia", "seeing double", "seeing two images", "do do dikhna", "do dikhai deta", "drooping eyelid", "ptosis", "deviation of eye", "eye turned"],
  setting: "Eye ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("double vision"),
    val("hpi", "monocular_binocular", "One eye or both eyes open", "Does the double vision go away when either eye is covered, or does it stay with one eye closed?", ["one eye closed", "covering", "covered", "goes away", "disappears", "persists", "still double", "monocular", "binocular", "both eyes open"], { teach: "Doubling that stays with one eye closed points to the eye itself; doubling that goes away points to the eyes not moving together." }),
    val("hpi", "separation_direction", "How the images are separated", "Are the two images side by side, one above the other, or tilted, and is the doubling worse looking in one direction?", ["side by side", "horizontal", "one above the other", "vertical", "tilted", "oblique", "looking left", "looking right", "looking down", "looking up", "stairs", "reading", "distance"], { teach: "Side-by-side images worse at distance lean towards the sixth nerve, and vertical images worse on reading or stairs towards the fourth." }),
    yn("hpi", "variability_fatigue", "Worse with fatigue, better with rest", "Does the doubling vary through the day — worse in the evening or after reading, better after sleep or rest?", ["evening", "end of day", "tired", "fatigue", "after reading", "better after rest", "better in morning", "varies", "fluctuating", "comes and goes"], { teach: "Doubling that worsens with use and recovers with rest raises a problem at the nerve-muscle junction rather than a fixed nerve palsy." }),
    yn("hpi", "ptosis", "Drooping eyelid", "Is either eyelid drooping, and does the droop change through the day?", ["drooping", "droop", "ptosis", "lid down", "cannot open eye", "eyelid falling", "heavy lid"]),
    yn("hpi", "pain", "Pain around the eye", "Is there pain around or behind the eye, or pain on moving the eye?", ["pain", "pain behind eye", "pain on moving", "aching", "retro orbital", "painless", "no pain"]),
    yn("associated", "diabetes_hypertension", "Diabetes / hypertension", "Is the patient known to have diabetes or high blood pressure, and how well controlled is it?", ["diabetes", "diabetic", "sugar", "hypertension", "high bp", "blood pressure", "uncontrolled", "controlled", "insulin"], { teach: "Diabetes and high blood pressure are the commonest background to a nerve palsy that recovers on its own, but only once other causes have been considered." }),
    yn("associated", "thyroid_symptoms", "Thyroid symptoms", "Any staring or bulging eyes, gritty watering eyes, heat intolerance, weight loss, palpitations, or known thyroid disease?", ["bulging", "staring", "prominent eyes", "gritty", "thyroid", "hyperthyroid", "heat intolerance", "weight loss", "palpitations", "goitre", "tremor"], { teach: "Thyroid eye disease is the commonest cause of vertical doubling in adults and can appear before, with, or after the gland disease." }),
    yn("associated", "trauma", "Injury to the eye or head", "Was there a recent blow to the eye or face, or a head injury?", ["injury", "blow", "hit", "fall", "road traffic", "ball", "fist", "head injury", "trauma", "black eye"]),
    yn("associated", "childhood_squint", "Squint in childhood", "Was there a squint or lazy eye in childhood, or glasses or patching as a child?", ["squint", "lazy eye", "childhood", "patching", "glasses as child", "since childhood", "old photos", "operated for squint"], { tier: "detailed", teach: "A long-standing squint that was controlled can break down in adult life and present as new doubling." }),
    yn("associated", "blurred_one_eye", "Blurring or glare in one eye", "Is vision in one eye hazy or blurred, with glare from headlights or bright light?", ["hazy", "blurred", "misty", "glare", "headlights", "halo", "cataract", "glasses changed", "spectacles"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "sudden_severe_headache", "Sudden severe headache / enlarged pupil", "Did the doubling start with a sudden, severe headache, or with a drooping lid and one pupil larger than the other?", ["sudden headache", "worst headache", "thunderclap", "severe headache", "large pupil", "dilated pupil", "unequal pupils", "drooping", "neck stiffness"], { teach: "A painful third nerve palsy with a sudden headache raises an aneurysm pressing on the nerve, which may bleed within hours." }),
    yn("red_flag", "raised_pressure_symptoms", "Headache on waking / vomiting / greying of vision", "Is there headache worse on waking, lying down or coughing, with vomiting or brief greying-out of vision?", ["morning headache", "worse on waking", "worse lying down", "coughing", "straining", "vomiting", "greying", "blacking out", "transient obscuration"], { teach: "The sixth nerve has a long course and is often the first to fail when pressure inside the skull rises, whatever the cause." }),
    yn("red_flag", "bulbar_limb_weakness", "Swallowing / speech / breathing / limb weakness", "Any difficulty swallowing, slurred or nasal speech, breathlessness, facial numbness, or weakness of the neck or limbs?", ["difficulty swallowing", "choking", "slurred", "nasal speech", "breathless", "facial numbness", "facial weakness", "neck weakness", "limb weakness", "unsteady"], { teach: "Doubling with swallowing or breathing difficulty raises a junction disease that can reach the breathing muscles, or a lesion in the brainstem." }),
    yn("red_flag", "orbital_swelling_fever", "Swollen, protruding eye with fever", "Is the eye swollen, red and pushed forward, with fever or pain on moving the eye?", ["swollen", "pushed forward", "protruding", "proptosis", "fever", "red eye", "lid swelling", "pain on moving", "sinusitis"], { teach: "A swollen protruding eye with fever raises infection inside the orbit, which can spread backwards towards the brain." }),
    yn("red_flag", "upgaze_nausea_after_injury", "Nausea or fainting on looking up after injury", "After a blow to the eye, is there nausea, vomiting or faintness on trying to look up?", ["nausea", "vomiting", "faint", "looking up", "cannot look up", "upgaze", "after injury", "child"], { teach: "In children, a muscle trapped in an orbital floor fracture can cause vomiting on looking up with very little bruising to show for it." }),
    yn("red_flag", "jaw_scalp_symptoms", "Jaw pain on chewing / scalp tenderness", "Any pain in the jaw on chewing, tenderness of the scalp on combing, or new headache over the temples?", ["jaw pain", "chewing", "scalp tender", "combing", "temple", "temporal headache", "weight loss", "shoulder stiffness"], { teach: "In older patients, jaw pain on chewing and scalp tenderness raise inflamed arteries that can take the sight within days." }),
  ],
  differentials: [
    { id: "monocular_cause", name: "Monocular doubling from cataract, refractive or corneal cause", pointers: ["monocular_binocular", "blurred_one_eye"], discriminators: ["monocular_binocular", "blurred_one_eye", "onset_mode", "progression"] },
    { id: "microvascular_palsy", name: "Microvascular third, fourth or sixth nerve palsy", pointers: ["diabetes_hypertension", "separation_direction"], discriminators: ["diabetes_hypertension", "sudden_severe_headache", "ptosis", "pain", "separation_direction", "progression"] },
    { id: "pcom_aneurysm", name: "Third nerve palsy from a posterior communicating artery aneurysm", pointers: ["sudden_severe_headache", "ptosis"], discriminators: ["sudden_severe_headache", "ptosis", "pain", "onset_mode", "diabetes_hypertension"] },
    { id: "raised_icp", name: "Sixth nerve palsy from raised intracranial pressure", pointers: ["raised_pressure_symptoms", "separation_direction"], discriminators: ["raised_pressure_symptoms", "separation_direction", "bulbar_limb_weakness", "progression", "trauma"] },
    { id: "myasthenia", name: "Myasthenia gravis", pointers: ["variability_fatigue", "ptosis", "bulbar_limb_weakness"], discriminators: ["variability_fatigue", "ptosis", "bulbar_limb_weakness", "pain", "thyroid_symptoms"] },
    { id: "thyroid_eye_disease", name: "Thyroid eye disease", pointers: ["thyroid_symptoms", "separation_direction"], discriminators: ["thyroid_symptoms", "separation_direction", "variability_fatigue", "orbital_swelling_fever", "progression"] },
    { id: "orbital_fracture", name: "Orbital floor (blowout) fracture", pointers: ["trauma", "upgaze_nausea_after_injury"], discriminators: ["trauma", "upgaze_nausea_after_injury", "separation_direction", "pain", "onset"] },
    { id: "orbital_mass_cellulitis", name: "Orbital mass or orbital cellulitis", pointers: ["orbital_swelling_fever", "pain"], discriminators: ["orbital_swelling_fever", "pain", "progression", "onset_mode", "thyroid_symptoms"] },
    { id: "decompensated_squint", name: "Decompensated childhood squint", pointers: ["childhood_squint"], discriminators: ["childhood_squint", "onset_mode", "variability_fatigue", "progression"] },
    { id: "giant_cell_arteritis", name: "Giant cell arteritis", pointers: ["jaw_scalp_symptoms"], discriminators: ["jaw_scalp_symptoms", "pain", "onset_mode", "blurred_one_eye"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "monocular_binocular", "separation_direction", "variability_fatigue", "ptosis", "pain", "progression", "prior_treatment", "prior_investigations"],
  },
};
