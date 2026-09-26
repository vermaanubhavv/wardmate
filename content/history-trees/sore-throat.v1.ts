import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * SORE THROAT — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult medicine / ENT ward, north India. Most sore throats are viral; the history exists to
 * find the airway emergency and the streptococcal infection that matters for its sequelae.
 * Diphtheria remains a real differential in an under-immunised north-Indian population.
 * Differentials: viral pharyngitis, streptococcal pharyngitis, infectious mononucleosis,
 * peritonsillar abscess, epiglottitis or deep neck space infection, diphtheria, candidiasis,
 * agranulocytosis from a drug, acid reflux.
 */
export const soreThroatV1: HistoryTree = {
  id: "sore_throat",
  version: "1.0.0",
  complaint: "Sore throat",
  triggers: ["sore throat", "throat pain", "pain in throat", "painful swallowing", "odynophagia", "pharyngitis", "tonsillitis", "gala kharab", "throat infection", "scratchy throat"],
  setting: "Adult medicine / ENT ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    rce("The rational clinical examination. Does this patient have strep throat?", 2000, "11147989"),
    rce("Does this patient have infectious mononucleosis? The Rational Clinical Examination systematic review", 2016, "27115266"),
    ebem("The clinical diagnosis of streptococcal pharyngitis", 2005, "15988434"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("sore throat"),
    val("hpi", "side", "One side or both", "Is the pain on one side of the throat or both?", ["one side", "both sides", "unilateral", "bilateral", "left", "right", "whole throat"]),
    val("hpi", "severity_swallowing", "Effect on swallowing", "Can the patient swallow solids, liquids, and their own saliva?", ["solids", "liquids", "saliva", "cannot swallow", "painful to swallow", "drooling", "managing", "difficulty swallowing"]),
    yn("hpi", "fever", "Fever", "Any fever, and how high?", ["fever", "high fever", "chills", "rigors", "temperature", "febrile"]),
    yn("hpi", "cough_coryza", "Cough / runny nose / hoarseness", "Any cough, runny nose, sneezing, or hoarseness of voice?", ["cough", "runny nose", "coryza", "sneezing", "hoarse", "hoarseness", "voice change", "nasal discharge", "cold"]),
    yn("associated", "neck_swelling", "Neck glands / neck swelling", "Any tender glands in the neck, or swelling of the neck?", ["neck glands", "lymph nodes", "swelling", "tender", "cervical", "neck swelling", "lumps in neck"]),
    yn("associated", "rash", "Rash", "Any rash on the body?", ["rash", "red rash", "sandpaper", "scarlet", "skin rash", "spots"]),
    yn("associated", "abdominal_pain_fatigue", "Fatigue / abdominal fullness", "Any marked tiredness lasting weeks, or fullness or pain in the upper abdomen?", ["fatigue", "tiredness", "weeks", "abdominal fullness", "left upper", "spleen", "abdominal pain", "exhausted"]),
    yn("associated", "ear_pain", "Ear pain", "Any pain in the ear, or discharge from the ear?", ["ear pain", "earache", "otalgia", "ear discharge", "referred"], { tier: "detailed" }),
    yn("associated", "mouth_ulcers", "Mouth ulcers / white patches", "Any ulcers in the mouth, or white patches on the tongue or palate?", ["mouth ulcers", "ulcers", "white patches", "thrush", "candidiasis", "coating", "membrane", "curdy"]),
    yn("associated", "reflux_symptoms", "Heartburn / acid reflux", "Any heartburn, acid coming up, or a sour taste, especially at night?", ["heartburn", "acid", "reflux", "sour taste", "regurgitation", "at night", "burning in chest"], { tier: "detailed" }),
    yn("associated", "contact_history", "Contact with a similar illness", "Any contact with someone with a sore throat in the past two weeks?", ["contact", "family member", "school", "similar illness", "sore throat in family", "two weeks"]),
    yn("associated", "recurrence", "Recurrent sore throats", "How often has this happened before in the past year?", ["recurrent", "repeated", "times a year", "every month", "again", "previous episodes", "first time"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "airway_compromise", "Difficulty breathing / noisy breathing / drooling", "Any difficulty breathing, noisy breathing, or inability to swallow saliva so that it drools?", ["difficulty breathing", "noisy breathing", "stridor", "drooling", "cannot swallow saliva", "sitting up to breathe", "choking", "breathless"], { teach: "Noisy breathing or drooling with a sore throat marks a narrowing airway, where examining the throat can precipitate complete obstruction." }),
    yn("red_flag", "trismus_unilateral", "Unable to open the mouth / severe one-sided pain", "Any difficulty opening the mouth, severe pain on one side, or a muffled voice?", ["cannot open mouth", "trismus", "one side", "severe pain", "muffled", "hot potato", "uvula", "deviation"], { teach: "Difficulty opening the mouth with severe one-sided pain points to a collection beside the tonsil rather than simple inflammation." }),
    yn("red_flag", "neck_stiffness_swelling", "Neck stiffness / swelling / pain on turning the head", "Any neck stiffness, swelling of the neck, or pain on turning the head?", ["neck stiffness", "neck swelling", "turning head", "torticollis", "neck pain", "hard swelling", "fullness"], { teach: "Swelling or stiffness spreading into the neck raises infection tracking into the deep neck spaces." }),
    yn("red_flag", "membrane_bleeding", "Grey membrane in the throat", "Any greyish white membrane in the throat that bleeds when touched?", ["membrane", "grey", "greyish", "white membrane", "bleeds", "adherent", "diphtheria", "pseudomembrane"], { teach: "An adherent membrane that bleeds on touching raises diphtheria, which remains present where immunisation coverage is incomplete." }),
    yn("red_flag", "immunisation_status", "Childhood immunisation", "Was the childhood immunisation schedule completed, including tetanus and diphtheria boosters?", ["immunisation", "immunization", "vaccination", "vaccinated", "dpt", "booster", "not vaccinated", "incomplete", "schedule"], { teach: "Immunisation status changes which throat infections remain possible, and few adults volunteer that history unless asked." }),
    yn("red_flag", "drug_induced_agranulocytosis", "New drugs / cancer treatment / mouth ulcers with fever", "Any new drugs such as antithyroid tablets, or chemotherapy, with fever and mouth ulcers?", ["antithyroid", "carbimazole", "methimazole", "chemotherapy", "new drug", "mouth ulcers", "fever", "low counts", "neutropenia"], { teach: "A sore throat with fever in someone on marrow-suppressing drugs can be the first sign that the white cells have gone." }),
    yn("red_flag", "persistent_unilateral", "Sore throat lasting weeks / weight loss / neck lump", "Has the sore throat lasted more than three weeks, with weight loss, hoarseness, or a neck lump?", ["three weeks", "weeks", "persistent", "weight loss", "hoarseness", "neck lump", "smoker", "not improving"], { tier: "detailed", teach: "A sore throat that persists for weeks, especially with a neck lump or hoarseness in a tobacco user, asks about a growth rather than an infection." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "tobacco_alcohol", "Tobacco / gutka / alcohol", "Any smoking, tobacco or gutka chewing, or alcohol?", ["smoking", "tobacco", "gutka", "paan", "alcohol", "chewing", "bidi"]),
    yn("exposure", "sexual_exposure", "Sexual exposure", "Any recent unprotected sexual contact, including oral contact?", ["unprotected", "sexual contact", "oral sex", "new partner", "sti", "hiv risk"], { tier: "detailed" }),
    yn("exposure", "rheumatic_fever_history", "Past rheumatic fever", "Any past rheumatic fever, joint pains with fever, or heart valve problem?", ["rheumatic fever", "joint pains", "valve", "rhd", "penicillin injections", "chorea"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "viral", name: "Viral pharyngitis", pointers: ["cough_coryza", "fever"], discriminators: ["cough_coryza", "fever", "neck_swelling", "mouth_ulcers", "duration"] },
    { id: "streptococcal", name: "Streptococcal pharyngitis", pointers: ["fever", "neck_swelling", "contact_history", "rash"], discriminators: ["fever", "neck_swelling", "contact_history", "cough_coryza", "rash", "rheumatic_fever_history"] },
    { id: "mononucleosis", name: "Infectious mononucleosis", pointers: ["abdominal_pain_fatigue", "neck_swelling", "duration"], discriminators: ["abdominal_pain_fatigue", "neck_swelling", "duration", "rash", "fever", "prior_treatment"] },
    { id: "peritonsillar_abscess", name: "Peritonsillar abscess", pointers: ["trismus_unilateral", "side", "severity_swallowing"], discriminators: ["trismus_unilateral", "side", "severity_swallowing", "neck_stiffness_swelling", "fever"] },
    { id: "deep_neck_infection", name: "Epiglottitis / deep neck space infection", pointers: ["airway_compromise", "neck_stiffness_swelling", "severity_swallowing"], discriminators: ["airway_compromise", "neck_stiffness_swelling", "severity_swallowing", "onset_mode", "fever"] },
    { id: "diphtheria", name: "Diphtheria", pointers: ["membrane_bleeding", "immunisation_status", "neck_stiffness_swelling"], discriminators: ["membrane_bleeding", "immunisation_status", "neck_stiffness_swelling", "mouth_ulcers", "fever"] },
    { id: "candidiasis", name: "Oropharyngeal candidiasis", pointers: ["mouth_ulcers", "immunocompromise"], discriminators: ["mouth_ulcers", "immunocompromise", "drug_induced_agranulocytosis", "sexual_exposure"] },
    { id: "agranulocytosis", name: "Drug-induced agranulocytosis", pointers: ["drug_induced_agranulocytosis", "mouth_ulcers", "fever"], discriminators: ["drug_induced_agranulocytosis", "mouth_ulcers", "fever", "prior_treatment"] },
    { id: "reflux", name: "Acid reflux", pointers: ["reflux_symptoms", "recurrence"], discriminators: ["reflux_symptoms", "recurrence", "fever", "duration", "cough_coryza"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "side", "severity_swallowing", "fever", "cough_coryza", "progression", "prior_treatment", "prior_investigations"],
  },
};
