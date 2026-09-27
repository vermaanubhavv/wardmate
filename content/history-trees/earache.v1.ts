import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DHINGRA, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * EARACHE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * ENT ward and casualty, north India. Most ear pain comes from the ear canal or the middle ear,
 * but a normal-looking ear with pain is often referred from the teeth, jaw joint, tonsils or a
 * growth in the throat. The history exists to separate the two, and to catch the diabetic with
 * skull base infection, the child with mastoiditis, and the shingles that weakens the face.
 * Differentials: otitis externa, furunculosis, acute otitis media, wax or foreign body,
 * eustachian tube dysfunction, malignant otitis externa in diabetes, mastoiditis, referred pain
 * from teeth / jaw joint / tonsils, referred pain from throat or larynx malignancy, herpes zoster
 * oticus.
 */
export const earacheV1: HistoryTree = {
  id: "earache",
  version: "1.0.0",
  complaint: "Earache",
  triggers: ["earache", "pain in ear", "pain in the ear", "ear ache", "painful ear", "kaan dard", "kaan me dard", "kaan mein dard", "ear hurts", "ear is paining"],
  setting: "ENT ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DHINGRA, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("ear pain"),
    val("hpi", "side", "Which ear", "Which ear hurts, or are both painful?", ["right ear", "left ear", "both ears", "one side", "bilateral", "unilateral"]),
    val("hpi", "pain_character", "Character and severity", "What is the pain like — throbbing, dull, sharp, shooting — and does it disturb sleep?", ["throbbing", "dull", "sharp", "shooting", "severe", "mild", "night", "sleep", "constant", "on and off"]),
    yn("hpi", "pain_on_touch_chewing", "Pain on touching the ear or chewing", "Is the pain worse on pulling or pressing the ear, or on chewing and opening the mouth?", ["pulling the ear", "touching the ear", "pressing", "tragus", "chewing", "opening mouth", "jaw movement", "eating"], { teach: "Pain on moving the outer ear points to the ear canal, while pain on chewing with a normal ear points towards the jaw joint." }),
    yn("hpi", "ear_discharge", "Discharge from the ear", "Has any discharge come from the ear, and did the pain ease once it came?", ["discharge", "pus", "watery", "blood", "wet ear", "pain relieved", "burst"]),
    yn("hpi", "hearing_blocked", "Blocked feeling / reduced hearing", "Does the ear feel blocked or full, or has hearing reduced?", ["blocked", "fullness", "full feeling", "hearing loss", "decreased hearing", "muffled", "popping", "crackling"]),
    yn("associated", "cold_flight", "Recent cold / air travel / diving", "Was there a recent cold, sore throat, air travel or diving before the pain started?", ["cold", "coryza", "sore throat", "flight", "air travel", "plane", "diving", "swimming", "nose block"]),
    yn("associated", "ear_manipulation", "Ear cleaning / object in the ear / water", "Has the ear been cleaned with a bud, pin or stick, has anything entered the ear, or has water gone in?", ["ear bud", "cotton bud", "matchstick", "hairpin", "pin", "scratching", "insect", "something in ear", "water", "oil", "swimming", "wax"]),
    yn("associated", "itching_ear", "Itching in the ear", "Has the ear been itching before or with the pain?", ["itching", "itchy", "irritation", "scratching"]),
    yn("associated", "tooth_jaw", "Tooth or jaw problem", "Any toothache, decayed or recently removed tooth, clicking of the jaw, or teeth grinding?", ["toothache", "tooth pain", "decayed tooth", "extraction", "wisdom tooth", "jaw clicking", "jaw pain", "grinding", "bruxism"], { teach: "When the ear itself looks normal, the teeth and jaw joint are among the commonest sources of pain felt in the ear." }),
    yn("associated", "throat_pain_swallow", "Throat pain / painful swallowing", "Is there throat pain or pain on swallowing, and does swallowing make the ear hurt?", ["throat pain", "sore throat", "painful swallowing", "odynophagia", "tonsils", "tonsillitis", "pain on swallowing"]),
    yn("associated", "vesicles_rash", "Blisters on or around the ear", "Any blisters or rash on the ear, in the ear canal, or on the palate?", ["blisters", "vesicles", "rash", "shingles", "herpes", "zoster", "burning pain"], { teach: "Blisters on the ear with severe pain point to shingles of the facial nerve, which can weaken the face and hearing." }),
    val("exposure", "tobacco_alcohol", "Tobacco / alcohol", "Does the patient smoke, chew tobacco, gutka or paan, or drink alcohol?", ["smoking", "bidi", "cigarette", "tobacco", "gutka", "khaini", "paan", "alcohol", "drinking"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "diabetes_severe_pain", "Diabetes with severe, persistent ear pain", "Is the patient diabetic, and is the ear pain severe, worse at night, or not settling after treatment?", ["diabetic", "diabetes", "sugar", "severe pain", "night pain", "not settling", "not relieved", "persistent", "elderly"], { teach: "Severe, persistent ear pain in an older diabetic raises infection spreading from the ear canal into the skull base." }),
    yn("red_flag", "postaural_swelling", "Swelling behind the ear", "Any swelling, redness or tenderness behind the ear, or has the ear been pushed forward?", ["swelling behind ear", "postaural", "mastoid", "redness", "tender", "ear pushed forward", "fluctuant"], { teach: "Swelling behind the ear with the pinna pushed forward raises infection in the mastoid bone." }),
    yn("red_flag", "facial_weakness", "Weakness of the face", "Any drooping of the face, inability to close the eye, or deviation of the mouth?", ["facial weakness", "facial palsy", "drooping", "cannot close eye", "mouth deviation", "face twisted"], { teach: "Facial weakness with ear pain raises shingles of the facial nerve or spread of infection along it." }),
    yn("red_flag", "headache_fever_drowsy", "High fever / headache / drowsiness / neck stiffness", "Any high fever, severe headache, vomiting, neck stiffness, drowsiness or fits?", ["high fever", "severe headache", "vomiting", "neck stiffness", "drowsy", "altered", "fits", "seizure"], { teach: "Fever with headache or altered sensorium in an ear infection raises spread inside the skull." }),
    yn("red_flag", "hoarse_dysphagia_weight", "Hoarseness / difficulty swallowing / weight loss / neck lump", "Any change in voice, difficulty swallowing, blood in the saliva, a lump in the neck, or weight loss?", ["hoarseness", "change in voice", "difficulty swallowing", "dysphagia", "blood in saliva", "neck lump", "weight loss"], { teach: "Ear pain with a normal ear alongside voice change, swallowing trouble or a neck lump asks about a growth in the throat or larynx." }),
    yn("red_flag", "vertigo_sudden_deafness", "Giddiness / sudden hearing loss", "Any spinning giddiness, vomiting, or a sudden loss of hearing in that ear?", ["vertigo", "giddiness", "spinning", "imbalance", "sudden deafness", "sudden hearing loss", "cannot hear"]),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "otitis_externa", name: "Otitis externa", pointers: ["pain_on_touch_chewing", "ear_manipulation", "itching_ear"], discriminators: ["pain_on_touch_chewing", "ear_manipulation", "itching_ear", "ear_discharge", "diabetes_severe_pain"] },
    { id: "furunculosis", name: "Furunculosis of the ear canal", pointers: ["pain_on_touch_chewing", "ear_manipulation"], discriminators: ["pain_on_touch_chewing", "ear_manipulation", "pain_character", "hearing_blocked", "diabetes_severe_pain"] },
    { id: "acute_otitis_media", name: "Acute otitis media", pointers: ["cold_flight", "hearing_blocked", "ear_discharge"], discriminators: ["cold_flight", "hearing_blocked", "ear_discharge", "pain_character", "headache_fever_drowsy"] },
    { id: "wax_foreign_body", name: "Impacted wax or foreign body", pointers: ["ear_manipulation", "hearing_blocked"], discriminators: ["ear_manipulation", "hearing_blocked", "onset_mode", "side", "ear_discharge"] },
    { id: "eustachian_dysfunction", name: "Eustachian tube dysfunction / barotrauma", pointers: ["cold_flight", "hearing_blocked"], discriminators: ["cold_flight", "hearing_blocked", "pain_character", "ear_discharge", "onset_mode"] },
    { id: "malignant_otitis_externa", name: "Skull base (malignant) otitis externa", pointers: ["diabetes_severe_pain", "immunocompromise", "facial_weakness"], discriminators: ["diabetes_severe_pain", "immunocompromise", "facial_weakness", "ear_discharge", "duration"] },
    { id: "mastoiditis", name: "Mastoiditis", pointers: ["postaural_swelling", "headache_fever_drowsy"], discriminators: ["postaural_swelling", "headache_fever_drowsy", "ear_discharge", "hearing_blocked", "progression"] },
    { id: "referred_dental_tmj_tonsil", name: "Referred pain from teeth, jaw joint or tonsils", pointers: ["tooth_jaw", "throat_pain_swallow"], discriminators: ["tooth_jaw", "throat_pain_swallow", "pain_on_touch_chewing", "hearing_blocked", "ear_discharge"] },
    { id: "referred_malignancy", name: "Referred pain from throat or larynx malignancy", pointers: ["hoarse_dysphagia_weight", "tobacco_alcohol"], discriminators: ["hoarse_dysphagia_weight", "tobacco_alcohol", "throat_pain_swallow", "duration", "hearing_blocked"] },
    { id: "herpes_zoster_oticus", name: "Herpes zoster oticus", pointers: ["vesicles_rash", "facial_weakness"], discriminators: ["vesicles_rash", "facial_weakness", "vertigo_sudden_deafness", "pain_character", "immunocompromise"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "pain_character", "pain_on_touch_chewing", "ear_discharge", "hearing_blocked", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
