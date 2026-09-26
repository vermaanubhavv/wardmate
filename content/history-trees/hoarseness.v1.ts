import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, DHINGRA, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * HOARSENESS OF VOICE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * ENT ward, north India, where tobacco and gutka are common and a change of voice is brought
 * late. The history exists to find the airway that is narrowing, and the hoarseness lasting
 * beyond three weeks in a tobacco user that must be looked at rather than treated as laryngitis.
 * Differentials: acute laryngitis, vocal abuse with nodules, laryngopharyngeal reflux,
 * laryngeal carcinoma, vocal cord palsy from a chest or neck lesion or after thyroid surgery,
 * laryngeal tuberculosis, hypothyroidism, functional dysphonia.
 */
export const hoarsenessV1: HistoryTree = {
  id: "hoarseness",
  version: "1.0.0",
  complaint: "Hoarseness of voice",
  triggers: ["hoarseness", "hoarse voice", "change in voice", "voice change", "husky voice", "loss of voice", "aphonia", "dysphonia", "awaz baithna", "cannot speak loudly"],
  setting: "ENT ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DHINGRA, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("change in voice"),
    val("hpi", "voice_character", "How the voice has changed", "How has the voice changed — husky, breathy, weak, or lost altogether?", ["husky", "hoarse", "breathy", "weak", "rough", "whisper", "no voice", "aphonia", "strained", "fluctuating"]),
    yn("hpi", "variability", "Better or worse at times", "Is the voice worse at the end of the day, better after rest, or the same throughout?", ["worse in evening", "better after rest", "same throughout", "fluctuating", "varies", "constant", "improving", "worsening"], { tier: "detailed" }),
    yn("hpi", "voice_use", "Voice use / shouting / smoking", "Is the voice used heavily at work — teaching, calling out, singing — and was there recent shouting?", ["teacher", "shouting", "singer", "hawker", "calling out", "voice use", "marriage", "loud", "vendor"]),
    yn("associated", "sore_throat_cold", "Recent cold or throat infection", "Was there a cold, cough or throat infection just before the voice changed?", ["cold", "coryza", "throat infection", "sore throat", "cough", "fever", "viral", "recent illness"]),
    yn("associated", "swallowing_difficulty", "Difficulty or pain on swallowing", "Any difficulty swallowing, pain on swallowing, or food sticking in the throat?", ["difficulty swallowing", "dysphagia", "pain on swallowing", "odynophagia", "food sticking", "solids", "liquids", "choking on food"]),
    yn("associated", "reflux_symptoms", "Heartburn / throat clearing / early morning hoarseness", "Any heartburn, sour taste, repeated throat clearing, or a voice that is worst on waking?", ["heartburn", "acid", "sour taste", "throat clearing", "lump in throat", "worst on waking", "night", "regurgitation"], { tier: "detailed" }),
    yn("associated", "neck_swelling", "Neck swelling", "Any swelling in the neck, in the midline or at the side?", ["neck swelling", "midline", "goitre", "thyroid", "lump in neck", "lymph node", "enlarging"]),
    yn("associated", "thyroid_symptoms", "Weight, cold intolerance, constipation, puffiness", "Any weight gain, feeling cold, constipation, or puffiness of the face?", ["weight gain", "cold intolerance", "feeling cold", "constipation", "puffy", "dry skin", "slow", "hair loss"], { tier: "detailed" }),
    yn("associated", "prior_neck_chest_surgery", "Past neck or chest surgery / intubation", "Any past thyroid or chest surgery, or a period on a ventilator with a tube in the throat?", ["thyroid surgery", "neck surgery", "chest surgery", "ventilator", "intubation", "tube in throat", "icu", "after operation"], { teach: "The nerve to the voice box runs through the neck and chest, so the voice can change after surgery or prolonged intubation." }),
    yn("exposure", "tobacco_alcohol", "Tobacco / gutka / alcohol", "Any smoking, tobacco or gutka chewing, or alcohol, and for how many years?", ["smoking", "bidi", "cigarette", "tobacco", "gutka", "paan", "khaini", "alcohol", "years", "chewing"]),
    yn("exposure", "tb_contact", "Contact with tuberculosis / chronic cough", "Any cough lasting weeks, evening fever, or contact with someone with tuberculosis?", ["cough for weeks", "evening fever", "night sweats", "tuberculosis", "tb", "contact", "sputum", "weight loss"]),
    // Red flags
    yn("red_flag", "stridor_breathing", "Noisy or difficult breathing", "Any noisy breathing, difficulty breathing, or breathlessness on lying flat?", ["noisy breathing", "stridor", "difficulty breathing", "breathless", "on lying", "sitting up", "whistling", "gasping"], { teach: "Noisy breathing with a changed voice marks a narrowing airway, which can close over hours." }),
    yn("red_flag", "persistent_three_weeks", "Voice changed for more than three weeks", "Has the voice been changed for more than three weeks without improving?", ["three weeks", "more than three weeks", "months", "not improving", "persistent", "continuous", "getting worse"], { teach: "Hoarseness beyond three weeks in a tobacco user asks for the voice box to be looked at rather than treated again." }),
    yn("red_flag", "weight_loss_neck_node", "Weight loss / neck lump / referred ear pain", "Any weight loss, a hard lump in the neck, or pain in the ear on the same side?", ["weight loss", "loss of appetite", "hard lump", "neck node", "ear pain", "referred", "growing", "fixed"], { teach: "Weight loss, a hard neck node or ear pain with hoarseness raise a growth rather than inflammation." }),
    yn("red_flag", "haemoptysis_aspiration", "Blood in the spit / coughing on swallowing", "Any blood in the spit, or coughing and choking each time food or water is swallowed?", ["blood in spit", "haemoptysis", "blood stained sputum", "coughing on swallowing", "choking", "aspirating", "water goes wrong way"], { teach: "Coughing on every swallow with a changed voice raises a cord that is not closing, leaving the airway unprotected." }),
  ],
  differentials: [
    { id: "acute_laryngitis", name: "Acute laryngitis", pointers: ["sore_throat_cold", "duration", "voice_use"], discriminators: ["sore_throat_cold", "duration", "voice_use", "persistent_three_weeks", "voice_character"] },
    { id: "vocal_abuse", name: "Vocal abuse with nodules", pointers: ["voice_use", "variability"], discriminators: ["voice_use", "variability", "duration", "voice_character", "persistent_three_weeks"] },
    { id: "reflux", name: "Laryngopharyngeal reflux", pointers: ["reflux_symptoms", "variability"], discriminators: ["reflux_symptoms", "variability", "duration", "sore_throat_cold", "voice_character"] },
    { id: "laryngeal_carcinoma", name: "Laryngeal or hypopharyngeal carcinoma", pointers: ["persistent_three_weeks", "tobacco_alcohol", "weight_loss_neck_node"], discriminators: ["persistent_three_weeks", "tobacco_alcohol", "weight_loss_neck_node", "swallowing_difficulty", "stridor_breathing"] },
    { id: "cord_palsy", name: "Vocal cord palsy", pointers: ["prior_neck_chest_surgery", "haemoptysis_aspiration", "neck_swelling"], discriminators: ["prior_neck_chest_surgery", "haemoptysis_aspiration", "neck_swelling", "voice_character", "onset_mode"] },
    { id: "laryngeal_tb", name: "Laryngeal tuberculosis", pointers: ["tb_contact", "persistent_three_weeks"], discriminators: ["tb_contact", "persistent_three_weeks", "swallowing_difficulty", "weight_loss_neck_node", "duration"] },
    { id: "hypothyroidism", name: "Hypothyroidism", pointers: ["thyroid_symptoms", "neck_swelling"], discriminators: ["thyroid_symptoms", "neck_swelling", "voice_character", "duration", "variability"] },
    { id: "functional", name: "Functional dysphonia", pointers: ["variability", "voice_use"], discriminators: ["variability", "voice_use", "stridor_breathing", "persistent_three_weeks", "voice_character"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "voice_character", "onset_mode", "variability", "voice_use", "progression", "prior_treatment", "prior_investigations"],
  },
};
