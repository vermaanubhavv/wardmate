import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * TOOTHACHE / FACIAL SWELLING — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Dental and maxillofacial ward, north India. Most toothache is pulpal; the history exists to
 * find the dental infection that has left the tooth — spreading into the floor of the mouth,
 * the eye, or the neck — and the non-healing ulcer or loose tooth in a tobacco user that is
 * not an infection at all.
 * Differentials: reversible or irreversible pulpitis, periapical abscess, pericoronitis around
 * a wisdom tooth, periodontal abscess, spreading odontogenic infection (submandibular or
 * Ludwig's, canine space), sinusitis felt in the upper teeth, temporomandibular joint pain,
 * trigeminal neuralgia, osteomyelitis of the jaw, oral malignancy.
 */
export const toothacheV1: HistoryTree = {
  id: "toothache",
  version: "1.0.0",
  complaint: "Toothache / facial swelling",
  triggers: ["toothache", "tooth pain", "dental pain", "facial swelling", "swelling of face", "cheek swelling", "gum swelling", "gum bleeding", "loose tooth", "wisdom tooth", "jaw pain", "cannot open mouth", "daant dard", "mouth ulcer not healing"],
  setting: "Dental and maxillofacial ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [BAILEY_LOVE, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("tooth pain"),
    val("hpi", "site", "Which tooth or which part of the face", "Which tooth or part of the jaw hurts — upper or lower, front or back, and which side?", ["upper", "lower", "left", "right", "back tooth", "front tooth", "molar", "wisdom", "whole side", "cannot localise"]),
    val("hpi", "pain_character", "Character of the pain", "What is the pain like — sharp on biting, throbbing, or a constant ache, and does it keep the patient awake?", ["sharp", "throbbing", "constant", "dull", "shooting", "electric", "on biting", "keeps awake", "at night", "comes and goes"]),
    yn("hpi", "trigger_hot_cold", "Pain with hot, cold or sweet things", "Does the pain come on with hot, cold or sweet things, and does it settle quickly or linger?", ["hot", "cold", "sweet", "settles quickly", "lingers", "minutes", "on drinking", "sensitive", "no trigger"], { teach: "Pain that lingers for minutes after a hot or cold stimulus, rather than settling at once, asks whether the pulp has passed the point of recovery." }),
    yn("hpi", "swelling", "Swelling of the gum or face", "Is there swelling of the gum or face, when did it start, and is it increasing?", ["gum swelling", "facial swelling", "cheek", "under the jaw", "eye", "increasing", "since yesterday", "hours", "firm", "soft"]),
    yn("hpi", "discharge_taste", "Pus or bad taste in the mouth", "Any pus, bad taste, or bad smell from the tooth or gum?", ["pus", "bad taste", "foul", "smell", "discharge", "drained", "burst", "salty", "bleeding gums"]),
    yn("associated", "fever_unwell", "Fever or feeling unwell", "Any fever, chills, or feeling generally unwell since the pain or swelling started?", ["fever", "chills", "unwell", "weakness", "not eating", "malaise", "rigors"]),
    yn("associated", "trauma_dental_work", "Injury or recent dental treatment", "Any injury to the face or tooth, or recent filling, root treatment, or extraction?", ["injury", "fall", "hit", "filling", "root canal", "extraction", "removed", "recent treatment", "cleaning", "days after"]),
    yn("associated", "nasal_symptoms", "Blocked nose, worse on bending forward", "Any blocked nose or nasal discharge, and is the upper tooth pain worse on bending forward?", ["blocked nose", "nasal discharge", "bending forward", "several upper teeth", "cold", "sinus", "pressure", "one side"], { tier: "detailed", teach: "Pain across several upper teeth that worsens on bending forward asks about the sinus above them rather than any one tooth." }),
    yn("associated", "jaw_joint_symptoms", "Clicking or pain in front of the ear on chewing", "Any clicking, pain in front of the ear, or difficulty chewing on that side?", ["clicking", "in front of ear", "joint", "chewing", "grinding", "clenching", "locking", "morning", "stress"], { tier: "detailed" }),
    yn("associated", "neuralgic_pattern", "Brief shock-like pains triggered by touch", "Are the pains brief, shock-like, set off by touching the face, washing, shaving or a cold breeze?", ["shock like", "brief", "seconds", "touching", "washing", "shaving", "breeze", "eating", "one side", "attacks"], { tier: "detailed" }),
    yn("associated", "dental_history_hygiene", "Previous dental problems and care", "Any previous toothaches, extractions, or long-standing decay, and how are the teeth cleaned?", ["previous", "extractions", "decay", "cavities", "brushing", "once daily", "manjan", "never", "multiple teeth", "bleeding while brushing"], { tier: "detailed" }),
    yn("associated", "diabetes_comorbidity", "Diabetes or long-term illness", "Any diabetes, kidney or liver disease, or long-term medicines?", ["diabetes", "sugar", "uncontrolled", "kidney", "liver", "long term", "tablets", "elderly"]),
    yn("exposure", "tobacco_areca", "Tobacco, gutka, areca nut, alcohol", "Any tobacco, gutka, khaini, areca nut or alcohol, how much, and for how many years?", ["tobacco", "gutka", "khaini", "paan", "areca", "supari", "smoking", "bidi", "alcohol", "years", "placed in cheek"]),
    // Red flags
    yn("red_flag", "swelling_floor_of_mouth", "Swelling under the tongue or both sides under the jaw", "Any swelling under the tongue or under the jaw on both sides, with the tongue pushed up, drooling, or a changed voice?", ["under the tongue", "floor of mouth", "both sides", "under jaw", "tongue pushed", "drooling", "voice change", "cannot swallow saliva", "firm swelling"], { teach: "Swelling in the floor of the mouth pushing the tongue up threatens the airway before it threatens anything else." }),
    yn("red_flag", "airway_breathing", "Difficulty breathing or swallowing", "Any difficulty breathing, noisy breathing, or inability to swallow saliva?", ["difficulty breathing", "noisy", "stridor", "cannot swallow", "saliva", "drooling", "sitting up", "choking", "breathless"], { teach: "Noisy breathing or drooling with a dental infection marks an airway being narrowed from outside." }),
    yn("red_flag", "trismus", "Unable to open the mouth fully", "How wide can the mouth be opened, and has that reduced over the past days?", ["cannot open", "trismus", "two fingers", "one finger", "reduced", "since yesterday", "opening normally", "painful to open"], { teach: "A mouth that opens less each day marks infection spreading into the muscle spaces around the jaw." }),
    yn("red_flag", "eye_involvement", "Swelling around the eye / double vision", "Any swelling around the eye, double vision, or change in vision with an upper tooth infection?", ["around the eye", "eyelid", "closed eye", "double vision", "vision", "proptosis", "upper tooth", "spreading upwards"], { teach: "Swelling tracking to the eye from an upper tooth raises spread along veins that drain towards the skull." }),
    yn("red_flag", "neck_swelling_spread", "Swelling spreading down the neck or to the chest", "Is the swelling spreading down the neck or towards the chest, with pain on turning the head?", ["down the neck", "chest", "spreading", "turning head", "neck stiffness", "redness", "firm", "rapidly"], { teach: "Swelling tracking down the neck raises infection moving along the tissue planes towards the chest." }),
    yn("red_flag", "numb_lip_loose_teeth", "Numb lip or chin / teeth loosening", "Any numbness of the lip or chin, or teeth becoming loose without injury?", ["numb lip", "numbness", "chin", "loose teeth", "without injury", "several teeth", "jaw pain", "bone exposed", "discharging sinus"], { teach: "A numb lower lip with loosening teeth raises disease within the jaw bone rather than around the tooth." }),
    yn("red_flag", "non_healing_ulcer", "Ulcer or white patch not healing for weeks", "Any ulcer, white or red patch in the mouth that has not healed for three weeks, or a lump in the neck?", ["ulcer", "not healing", "three weeks", "white patch", "red patch", "growth", "neck lump", "weight loss", "difficulty opening", "bleeding"], { teach: "A mouth ulcer that has not healed in three weeks in a tobacco user asks about a growth, and such an ulcer is often first shown to a dentist." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "pulpitis", name: "Pulpitis", pointers: ["trigger_hot_cold", "pain_character"], discriminators: ["trigger_hot_cold", "pain_character", "swelling", "fever_unwell", "duration"] },
    { id: "periapical_abscess", name: "Periapical abscess", pointers: ["swelling", "discharge_taste", "pain_character"], discriminators: ["swelling", "discharge_taste", "fever_unwell", "trigger_hot_cold", "site"] },
    { id: "pericoronitis", name: "Pericoronitis around a wisdom tooth", pointers: ["site", "trismus", "swelling"], discriminators: ["site", "trismus", "swelling", "discharge_taste", "duration"] },
    { id: "periodontal_abscess", name: "Periodontal abscess", pointers: ["dental_history_hygiene", "discharge_taste", "swelling"], discriminators: ["dental_history_hygiene", "discharge_taste", "swelling", "trigger_hot_cold", "numb_lip_loose_teeth"] },
    { id: "spreading_odontogenic", name: "Spreading odontogenic infection", pointers: ["swelling_floor_of_mouth", "trismus", "neck_swelling_spread"], discriminators: ["swelling_floor_of_mouth", "trismus", "neck_swelling_spread", "airway_breathing", "fever_unwell"] },
    { id: "sinusitis", name: "Sinusitis felt in the upper teeth", pointers: ["nasal_symptoms", "site"], discriminators: ["nasal_symptoms", "site", "trigger_hot_cold", "swelling", "pain_character"] },
    { id: "tmj_pain", name: "Temporomandibular joint pain", pointers: ["jaw_joint_symptoms"], discriminators: ["jaw_joint_symptoms", "trigger_hot_cold", "swelling", "site", "pain_character"] },
    { id: "trigeminal_neuralgia", name: "Trigeminal neuralgia", pointers: ["neuralgic_pattern", "pain_character"], discriminators: ["neuralgic_pattern", "pain_character", "trigger_hot_cold", "swelling", "duration"] },
    { id: "osteomyelitis", name: "Osteomyelitis of the jaw", pointers: ["numb_lip_loose_teeth", "diabetes_comorbidity", "discharge_taste"], discriminators: ["numb_lip_loose_teeth", "diabetes_comorbidity", "discharge_taste", "duration", "immunocompromise"] },
    { id: "oral_malignancy", name: "Oral malignancy", pointers: ["non_healing_ulcer", "tobacco_areca", "numb_lip_loose_teeth"], discriminators: ["non_healing_ulcer", "tobacco_areca", "numb_lip_loose_teeth", "duration", "trismus"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "site", "pain_character", "trigger_hot_cold", "swelling", "discharge_taste", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
