import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PARSONS_EYE, val, yn } from "@/content/history-trees/_helpers";

/**
 * BULGING OF THE EYE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Eye ward and OPD, north India. One side or both, how fast, and whether it hurts carry most
 * of this history. Slow painless bulging of both eyes is usually the thyroid; a painful one
 * that came over days with fever, or in an uncontrolled diabetic with black nasal crusts, is
 * counted in hours, as is a bulging eye after injury that has gone tense.
 * Differentials: thyroid eye disease, orbital cellulitis or abscess, rhino-orbital
 * mucormycosis, orbital tumour in adults (lymphoma, haemangioma, lacrimal gland tumour,
 * metastasis), orbital tumour in children (retinoblastoma, rhabdomyosarcoma), carotid-cavernous
 * fistula, idiopathic orbital inflammation (pseudotumour), traumatic / retrobulbar
 * haemorrhage, sinus mucocele.
 */
export const proptosisV1: HistoryTree = {
  id: "proptosis",
  version: "1.0.0",
  complaint: "Bulging of the eye",
  triggers: ["proptosis", "exophthalmos", "bulging eye", "bulging of eye", "bulging of the eye", "protruding eye", "eye coming out", "eye pushed forward", "prominent eye", "aankh bahar aa gayi", "aankh bahar nikal rahi", "aankh ubhri hui"],
  setting: "Eye ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("bulging of the eye"),
    val("hpi", "side", "One eye or both", "Is one eye bulging or both, and if both, is one worse?", ["right eye", "left eye", "both eyes", "one eye", "one side", "bilateral", "unilateral", "one more than the other"], { teach: "Bulging of both eyes leans towards the thyroid; one eye alone widens the list to infection, growths and vascular causes." }),
    val("hpi", "direction_displacement", "Straight forward or pushed to one side", "Is the eye pushed straight forward, or also pushed down, up, in or out?", ["straight forward", "pushed down", "pushed up", "pushed out", "pushed in", "downwards", "outwards", "displaced", "lower than other eye"], { tier: "detailed", teach: "An eye pushed down and in suggests a mass in the upper outer orbit near the tear gland; one pushed down and out, a mass from the sinuses." }),
    yn("hpi", "pain", "Pain in or around the eye", "Is the bulging eye painful, and does moving the eye hurt?", ["pain", "painful", "ache", "pain on moving", "tender", "throbbing", "painless", "no pain"], { teach: "Painful bulging points to inflammation, infection or bleeding; painless slow bulging to a growth or the thyroid." }),
    yn("hpi", "double_vision", "Double vision", "Is there double vision, and in which direction of gaze is it worse?", ["double vision", "diplopia", "seeing double", "two images", "looking up", "looking down", "looking sideways"]),
    yn("hpi", "gritty_watering_lid_retraction", "Gritty, watering, staring eyes", "Are the eyes gritty, watering or unable to close fully, with a staring look?", ["gritty", "sandy", "watering", "staring", "lids pulled back", "cannot close eye", "eyes open while sleeping", "dry eye", "red eyes"], { teach: "A staring look with gritty eyes and lids that do not close fully is the commonest story of thyroid eye disease." }),
    yn("hpi", "pulsation_bruit", "Pulsating eye or whooshing sound", "Does the eye throb in time with the pulse, or is there a whooshing sound in the head?", ["pulsating", "throbbing", "pulsation", "whooshing", "swishing", "noise in head", "sound in ear", "bruit", "machinery sound"], { teach: "A pulsating eye with a whooshing sound in the head raises an abnormal connection between the carotid artery and the veins behind the eye." }),
    yn("hpi", "variable_with_straining", "Bulging that changes with bending or straining", "Does the bulging increase on bending forward, straining or crying?", ["bending", "bending forward", "straining", "crying", "coughing", "increases", "comes and goes", "head down", "valsalva"], { tier: "detailed", teach: "Bulging that increases on bending or straining raises a venous malformation in the orbit." }),
    yn("associated", "thyroid_symptoms", "Thyroid symptoms", "Any heat intolerance, weight loss, palpitations, tremor, neck swelling, or known thyroid disease or treatment?", ["thyroid", "hyperthyroid", "goitre", "neck swelling", "heat intolerance", "weight loss", "palpitations", "tremor", "radioiodine", "thyroid tablets"], { teach: "Thyroid eye disease can appear before, with or after the gland disease, and smoking makes it worse." }),
    yn("associated", "smoking", "Smoking", "Does the patient smoke bidi, cigarettes or hookah, and how much?", ["smoking", "smoker", "bidi", "cigarette", "hookah", "tobacco", "ex smoker", "non smoker"], { tier: "detailed" }),
    yn("associated", "sinus_tooth_symptoms", "Cold, sinus pain, blocked nose or toothache", "Any recent cold, blocked nose, sinus pain, or toothache on the same side?", ["cold", "blocked nose", "sinus", "sinusitis", "nasal discharge", "toothache", "dental", "headache over cheek", "forehead pain"], { teach: "Infection and slow expanding cysts often reach the orbit from the sinuses, so the nose matters as much as the eye." }),
    yn("associated", "head_injury_history", "Head or face injury, recent or past", "Was there a head or face injury, recently or in the past months, before the bulging began?", ["head injury", "face injury", "road traffic", "accident", "fall", "blow", "hit", "trauma", "fracture", "months ago"], { teach: "Bulging that appears after a head injury, even weeks later, raises a traumatic connection between the carotid artery and the veins behind the eye." }),
    yn("associated", "weight_loss_lumps_cancer", "Weight loss, lumps elsewhere or known cancer", "Any weight loss, night sweats, lumps in the neck, armpit or breast, or a known cancer anywhere?", ["weight loss", "night sweats", "lumps", "neck lump", "glands", "breast lump", "cancer", "malignancy", "lymphoma", "chemotherapy"], { tier: "detailed", teach: "Painless slowly growing bulging in an older adult with weight loss or a known cancer raises a lymphoma or a spread growth in the orbit." }),
    yn("associated", "child_white_reflex", "In a child: white pupil, squint or rapid bulging", "In a child, has anyone noticed a white glow in the pupil in photographs, a new squint, or bulging that grew over days to weeks?", ["child", "white pupil", "white reflex", "cat's eye", "photo", "squint", "rapidly growing", "few weeks", "baby"], { teach: "A white pupil or rapidly growing bulging in a child raises a malignant eye or orbital tumour, where time matters." }),
    yn("associated", "steroid_covid_history", "Recent COVID or steroid course", "Has the patient had COVID or a course of steroids in the recent weeks or months?", ["covid", "corona", "steroid", "steroids", "dexamethasone", "oxygen", "hospitalised", "post covid"], { teach: "Recent steroids or COVID on a background of uncontrolled sugars was the setting of the mucormycosis wave in north India." }),
    // Red flags
    yn("red_flag", "fever_rapid_onset", "Fever with bulging that came over hours to days", "Is there fever, and did the bulging, redness and lid swelling come on over hours to days?", ["fever", "chills", "rapid", "over days", "overnight", "hours", "red", "lid swelling", "swollen shut", "unwell"], { teach: "Fever with bulging that developed over days raises infection within the orbit, which can spread to the veins behind the eye and the brain." }),
    yn("red_flag", "vision_falling", "Vision falling or colours dulled", "Is the vision in the bulging eye dropping, or do colours look washed out?", ["vision dropping", "blurred", "cannot see", "dim", "colours", "washed out", "faded", "vision loss", "dark"], { teach: "Falling vision or dulled colours in a bulging eye raise pressure on the optic nerve, which is counted in hours." }),
    yn("red_flag", "black_nasal_crusts", "Black crusts in nose or palate / facial numbness", "Any black crusts in the nose or on the palate, blood-stained nasal discharge, facial pain, or numbness of the cheek?", ["black crust", "black discharge", "black patch", "palate", "blood stained nasal discharge", "facial pain", "facial numbness", "cheek numb", "tooth loosening", "nose blocked"], { teach: "An uncontrolled diabetic or recently steroid-treated patient with black nasal crusts and a bulging eye raises an invasive fungal infection that spreads by the hour." }),
    yn("red_flag", "tense_after_injury", "Tense, painful bulging eye right after injury", "After a recent injury, did the eye become rapidly tense, painful and pushed forward, with falling vision?", ["after injury", "tense", "hard eye", "rapidly", "painful", "pushed forward", "bleeding", "black eye", "cannot open", "vision dropping"], { teach: "Rapid tense bulging after injury raises bleeding behind the eye compressing the optic nerve, where sight is lost within hours." }),
    yn("red_flag", "drowsy_headache_both_eyes", "Headache, drowsiness, vomiting or the other eye involved", "Is there severe headache, drowsiness, vomiting, confusion, or has the other eye started to swell as well?", ["headache", "severe headache", "drowsy", "confused", "vomiting", "other eye", "both eyes swollen", "neck stiffness", "fits", "seizure"], { teach: "Spread to the other eye with headache and drowsiness raises clotting in the cavernous sinus, a threat to life." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "thyroid_eye_disease", name: "Thyroid eye disease", pointers: ["gritty_watering_lid_retraction", "thyroid_symptoms", "side"], discriminators: ["thyroid_symptoms", "gritty_watering_lid_retraction", "side", "double_vision", "smoking", "vision_falling"] },
    { id: "orbital_cellulitis", name: "Orbital cellulitis or abscess", pointers: ["fever_rapid_onset", "pain", "sinus_tooth_symptoms"], discriminators: ["fever_rapid_onset", "pain", "sinus_tooth_symptoms", "vision_falling", "drowsy_headache_both_eyes", "immunocompromise"] },
    { id: "mucormycosis", name: "Rhino-orbital mucormycosis", pointers: ["black_nasal_crusts", "immunocompromise", "steroid_covid_history"], discriminators: ["black_nasal_crusts", "immunocompromise", "steroid_covid_history", "vision_falling", "sinus_tooth_symptoms"] },
    { id: "orbital_tumour_adult", name: "Orbital tumour — lymphoma, haemangioma, lacrimal gland tumour, metastasis", pointers: ["direction_displacement", "weight_loss_lumps_cancer"], discriminators: ["direction_displacement", "weight_loss_lumps_cancer", "pain", "onset_mode", "progression", "side"] },
    { id: "orbital_tumour_child", name: "Orbital or eye tumour in a child — retinoblastoma, rhabdomyosarcoma", pointers: ["child_white_reflex"], discriminators: ["child_white_reflex", "progression", "onset_mode", "fever_rapid_onset"] },
    { id: "cc_fistula", name: "Carotid-cavernous fistula", pointers: ["pulsation_bruit", "head_injury_history"], discriminators: ["pulsation_bruit", "head_injury_history", "double_vision", "side", "onset_mode"] },
    { id: "pseudotumour", name: "Idiopathic orbital inflammation (pseudotumour)", pointers: ["pain", "double_vision"], discriminators: ["pain", "fever_rapid_onset", "onset_mode", "side", "thyroid_symptoms"] },
    { id: "retrobulbar_haemorrhage", name: "Traumatic / retrobulbar haemorrhage", pointers: ["tense_after_injury", "head_injury_history"], discriminators: ["tense_after_injury", "head_injury_history", "vision_falling", "pain"] },
    { id: "sinus_mucocele", name: "Sinus mucocele", pointers: ["sinus_tooth_symptoms", "direction_displacement"], discriminators: ["sinus_tooth_symptoms", "direction_displacement", "progression", "pain"] },
    { id: "orbital_varix", name: "Orbital venous malformation (varix)", pointers: ["variable_with_straining"], discriminators: ["variable_with_straining", "pulsation_bruit", "side", "progression"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "direction_displacement", "pain", "double_vision", "gritty_watering_lid_retraction", "pulsation_bruit", "variable_with_straining", "progression", "prior_treatment", "prior_investigations"],
  },
};
