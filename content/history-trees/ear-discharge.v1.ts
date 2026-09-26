import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DHINGRA, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * EAR DISCHARGE / HEARING LOSS — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * ENT ward, north India. A discharging ear is common and usually chronic; the history exists
 * to separate the safe chronic ear from the one eroding bone, and to catch the intracranial
 * spread and the malignant external otitis that arrive on a medical ward as headache or fever.
 * Differentials: acute otitis media, chronic otitis media (mucosal / squamous), otitis externa,
 * malignant otitis externa in diabetes, foreign body, traumatic perforation, cholesteatoma with
 * intracranial spread, age-related or noise-induced sensorineural loss, wax.
 */
export const earDischargeV1: HistoryTree = {
  id: "ear_discharge",
  version: "1.0.0",
  complaint: "Ear discharge / hearing loss",
  triggers: ["ear discharge", "discharge from ear", "ear pain", "earache", "otalgia", "otorrhoea", "otorrhea", "hearing loss", "decreased hearing", "hard of hearing", "deafness", "kaan behna", "pus from ear", "blocked ear", "ear infection"],
  setting: "ENT ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [DHINGRA, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("ear discharge"),
    val("hpi", "side", "Which ear", "Which ear is affected, or are both?", ["right ear", "left ear", "both ears", "one side", "bilateral", "unilateral"]),
    val("hpi", "discharge_character", "Character of the discharge", "What does the discharge look and smell like — watery, mucoid, pus, blood, or foul smelling?", ["watery", "mucoid", "mucopurulent", "pus", "purulent", "blood", "bloody", "foul smelling", "scanty", "profuse", "no discharge"]),
    yn("hpi", "hearing_loss", "Hearing loss", "Has hearing changed in that ear, and does it change when the ear discharges?", ["hearing loss", "decreased hearing", "cannot hear", "muffled", "hearing reduced", "hearing normal", "hard of hearing"]),
    yn("hpi", "ear_pain", "Ear pain", "Any pain in the ear, and is it worse on pulling the ear or chewing?", ["ear pain", "earache", "otalgia", "pain on pulling", "pain on chewing", "no pain", "throbbing"]),
    yn("associated", "tinnitus", "Ringing in the ear", "Any ringing, buzzing or noise in the ear?", ["tinnitus", "ringing", "buzzing", "noise in ear", "whistling"], { tier: "detailed" }),
    yn("associated", "vertigo", "Giddiness on moving the head", "Any spinning sensation, giddiness, or unsteadiness on walking?", ["vertigo", "giddiness", "spinning", "unsteady", "imbalance", "dizzy", "falls"], { teach: "Vertigo with a discharging ear asks whether the disease has reached the balance organ rather than staying in the middle ear." }),
    yn("associated", "upper_respiratory", "Cold / throat infection / nose block", "Any recent cold, throat infection, or blocked nose before the ear trouble started?", ["cold", "coryza", "throat infection", "sore throat", "nose block", "nasal obstruction", "sneezing", "runny nose"]),
    yn("associated", "water_entry_trauma", "Water in the ear / injury / object in the ear", "Any swimming, water entering the ear, a slap or injury to the ear, or something put into the ear?", ["water", "swimming", "bathing", "slap", "injury", "trauma", "cotton bud", "ear bud", "stick", "foreign body", "insect", "oil"]),
    yn("associated", "ear_surgery", "Past ear surgery or ear drops", "Any previous ear surgery, or repeated treatment for the same ear?", ["ear surgery", "operated", "myringoplasty", "mastoid", "previous surgery", "ear drops", "repeated treatment", "same ear"], { tier: "detailed" }),
    yn("associated", "noise_ototoxic_exposure", "Loud noise / drugs that affect hearing", "Any work around loud noise, or a long course of injections for tuberculosis or a serious infection?", ["loud noise", "factory", "generator", "gunfire", "headphones", "injections", "tuberculosis", "streptomycin", "amikacin", "gentamicin", "kanamycin"], { tier: "detailed", teach: "Noise and certain injectable courses damage the inner ear, and the loss is often noticed long after the exposure." }),
    // Red flags
    yn("red_flag", "headache_fever_neck", "Headache with fever / vomiting / neck stiffness", "Any headache with fever, vomiting, or neck stiffness since the ear started discharging?", ["headache", "fever", "vomiting", "neck stiffness", "drowsy", "altered", "seizure", "photophobia"], { teach: "Headache and fever in a chronically discharging ear raise spread of infection inside the skull." }),
    yn("red_flag", "facial_weakness", "Weakness of one side of the face", "Any drooping of the face, inability to close the eye, or slurred speech on that side?", ["facial weakness", "facial palsy", "drooping", "cannot close eye", "mouth deviation", "face twisted", "slurring"], { teach: "Facial weakness beside a discharging ear points to disease reaching the nerve as it runs through the middle ear." }),
    yn("red_flag", "postaural_swelling", "Swelling or tenderness behind the ear", "Any swelling, redness or tenderness behind the ear, or has the ear been pushed forward?", ["swelling behind ear", "postaural", "mastoid", "tender", "redness", "ear pushed forward", "fluctuant"], { teach: "Swelling behind the ear with the pinna pushed forward raises infection in the mastoid bone." }),
    yn("red_flag", "foul_bloody_granulation", "Foul smelling or blood stained discharge", "Is the discharge foul smelling, blood stained, or scanty and persistent despite treatment?", ["foul smelling", "offensive", "blood stained", "bleeding", "scanty", "persistent", "not settling", "granulation", "flakes"], { teach: "A scanty, foul or blood stained discharge that will not settle raises bone erosion rather than a simple mucosal infection." }),
    yn("red_flag", "diabetes_severe_pain", "Diabetes with severe ear pain", "Is the patient diabetic, and is the ear pain severe and out of proportion, especially at night?", ["diabetic", "diabetes", "sugar", "severe pain", "out of proportion", "night pain", "elderly", "not relieved"], { teach: "Severe ear pain in an older person with diabetes raises infection spreading into the skull base." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "acute_otitis_media", name: "Acute otitis media", pointers: ["ear_pain", "upper_respiratory", "duration"], discriminators: ["ear_pain", "upper_respiratory", "duration", "discharge_character", "hearing_loss"] },
    { id: "csom_mucosal", name: "Chronic otitis media, mucosal", pointers: ["discharge_character", "hearing_loss", "duration"], discriminators: ["discharge_character", "duration", "hearing_loss", "foul_bloody_granulation", "upper_respiratory"] },
    { id: "csom_squamous", name: "Chronic otitis media, squamous (cholesteatoma)", pointers: ["foul_bloody_granulation", "vertigo", "facial_weakness"], discriminators: ["foul_bloody_granulation", "vertigo", "facial_weakness", "headache_fever_neck", "postaural_swelling"] },
    { id: "otitis_externa", name: "Otitis externa", pointers: ["water_entry_trauma", "ear_pain"], discriminators: ["water_entry_trauma", "ear_pain", "discharge_character", "hearing_loss", "diabetes_severe_pain"] },
    { id: "malignant_otitis_externa", name: "Skull base (malignant) otitis externa", pointers: ["diabetes_severe_pain", "facial_weakness"], discriminators: ["diabetes_severe_pain", "facial_weakness", "headache_fever_neck", "immunocompromise", "ear_pain"] },
    { id: "mastoiditis", name: "Mastoiditis", pointers: ["postaural_swelling", "headache_fever_neck"], discriminators: ["postaural_swelling", "headache_fever_neck", "ear_pain", "discharge_character", "onset_mode"] },
    { id: "foreign_body_trauma", name: "Foreign body or traumatic perforation", pointers: ["water_entry_trauma", "onset_mode"], discriminators: ["water_entry_trauma", "onset_mode", "discharge_character", "ear_pain", "hearing_loss"] },
    { id: "sensorineural_loss", name: "Sensorineural hearing loss", pointers: ["noise_ototoxic_exposure", "tinnitus", "hearing_loss"], discriminators: ["noise_ototoxic_exposure", "tinnitus", "hearing_loss", "discharge_character", "vertigo"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "side", "discharge_character", "ear_pain", "hearing_loss", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
