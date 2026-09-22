import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, BROWSE, commonHpi, HAMILTON_BAILEY, MACLEODS, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * NECK SWELLING (THYROID) — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical ward, north India. The generic `lump` tree also fires on a neck swelling and
 * the card is built to show both; this one adds what the texts ask only of a thyroid — whether
 * it moves on swallowing, what it presses on, and whether the gland is working too hard or too
 * little. Differentials: simple or multinodular goitre, solitary nodule, thyroiditis, Graves'
 * disease, thyroid malignancy, a lymph node or another neck swelling that is not the thyroid.
 */
export const thyroidSwellingV1: HistoryTree = {
  id: "thyroid_swelling",
  version: "1.0.0",
  complaint: "Neck swelling (thyroid)",
  triggers: ["thyroid", "thyroid swelling", "goitre", "goiter", "swelling in front of neck", "swelling in the neck", "neck swelling", "front of neck", "gale me sujan"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [BROWSE, BAILEY_LOVE, HAMILTON_BAILEY, SABISTON, MACLEODS],
  slots: [
    ...commonHpi("neck swelling"),
    val("hpi", "site_side", "Where in the neck", "Whereabouts in the neck is the swelling — in the middle, to one side, or both sides?", ["midline", "middle", "one side", "both sides", "right", "left", "front of neck", "below the jaw", "side of neck"]),
    yn("hpi", "moves_on_swallowing", "Moves on swallowing", "Does the swelling move up and down when the patient swallows?", ["moves on swallowing", "moves up", "goes up on swallowing", "does not move", "moves with swallowing", "moves on protruding the tongue"]),
    val("hpi", "size_change", "Change in size", "Has the swelling grown, shrunk or stayed the same, and over how long?", ["increased", "grown", "same size", "static", "decreased", "months", "years", "weeks", "suddenly increased"], { numeric: true }),
    yn("hpi", "pain", "Pain or tenderness", "Is the swelling painful or tender, and did the pain come on suddenly?", ["painful", "tender", "painless", "sudden pain", "ache", "sore", "pain on touching"]),
    yn("associated", "pressure_symptoms", "Pressure symptoms", "Any difficulty swallowing, difficulty breathing, or a change in the voice?", ["difficulty swallowing", "dysphagia", "difficulty breathing", "breathless", "stridor", "change in voice", "hoarse", "hoarseness", "noisy breathing"]),
    yn("associated", "lying_flat_breathing", "Breathing worse lying flat", "Is the breathing worse on lying flat, or does the patient sleep propped up because of the swelling?", ["worse lying flat", "cannot lie flat", "sleeps propped", "sleeps sitting", "choking at night", "worse at night"], { tier: "detailed" }),
    yn("associated", "overactive_features", "Features of an overactive gland", "Any weight loss despite a good appetite, palpitations, tremor, excessive sweating, heat intolerance, or loose stools?", ["weight loss", "good appetite", "palpitations", "tremor", "trembling", "sweating", "heat intolerance", "cannot tolerate heat", "loose stools", "irritable", "anxious"]),
    yn("associated", "underactive_features", "Features of an underactive gland", "Any weight gain, cold intolerance, constipation, dry skin, hair fall, or excessive sleepiness?", ["weight gain", "cold intolerance", "feels cold", "constipation", "dry skin", "hair fall", "sleepy", "lethargy", "puffiness", "slow"]),
    yn("associated", "eye_symptoms", "Eye symptoms", "Any prominence of the eyes, watering, double vision, or difficulty closing the eyes?", ["prominent eyes", "bulging eyes", "protruding", "watering", "double vision", "cannot close eyes", "staring", "gritty"]),
    yn("associated", "menstrual_change", "Change in the periods", "Has there been any change in the periods since the swelling appeared?", ["periods", "menstrual", "heavy periods", "scanty", "irregular", "stopped", "no change in periods"], { tier: "detailed" }),
    yn("associated", "other_neck_lumps", "Other lumps in the neck", "Are there any other lumps in the neck, above the collarbone, or in the armpit?", ["other lumps", "nodes", "lymph nodes", "above the collarbone", "supraclavicular", "axilla", "multiple swellings", "side of the neck"]),
    // Red flags
    yn("red_flag", "rapid_growth_hard", "Rapid growth, hard or fixed", "Has the swelling grown quickly over weeks, or does it feel hard and fixed to the tissue around it?", ["rapid growth", "grew quickly", "rapidly increasing", "hard", "stony hard", "fixed", "not moving", "irregular"], { teach: "Rapid growth in a swelling that was stable for years, and a hard fixed feel, change how quickly the swelling needs to be assessed." }),
    yn("red_flag", "voice_change", "Change in the voice", "Has the voice changed or become hoarse since the swelling appeared?", ["hoarse", "hoarseness", "voice change", "voice became", "weak voice", "cannot shout", "no voice change"], { teach: "A voice that changes as a neck swelling grows asks about the nerve that runs beside the gland." }),
    yn("red_flag", "breathing_difficulty", "Difficulty breathing or noisy breathing", "Is there any difficulty breathing, noisy breathing, or a sense of the throat closing?", ["difficulty breathing", "noisy breathing", "stridor", "throat closing", "choking", "breathless at rest", "cannot breathe"], { teach: "Noisy or difficult breathing with a neck swelling is asked first because the airway is the one thing that cannot wait." }),
    yn("red_flag", "neck_radiation", "Previous radiation to the neck", "Was there any radiation treatment to the neck or chest, especially in childhood?", ["radiation", "radiotherapy", "sikai", "treatment to the neck", "in childhood", "no radiation"], { teach: "Radiation to the neck, particularly early in life, changes what a thyroid swelling appearing years later can be." }),
    yn("red_flag", "family_thyroid_cancer", "Family history of thyroid cancer or neck lumps", "Any thyroid cancer, or an operation on the thyroid, in a blood relative?", ["family history", "mother", "father", "sister", "brother", "thyroid cancer", "thyroid operation", "goitre in family", "no family history"], { teach: "A thyroid cancer in a blood relative raises the pre-test question for a new nodule." }),
    // Exposures and background
    yn("exposure", "known_thyroid_treatment", "Already known and treated", "Was the thyroid ever tested or treated before — tablets, an operation, or an injection of radioactive iodine?", ["thyroid test", "tft", "thyroid tablets", "thyroxine", "carbimazole", "operated", "thyroid surgery", "radioactive iodine", "rai", "never treated"]),
    yn("exposure", "iodine_diet_water", "Diet and water", "Does the family use iodised salt, and is the patient from a hilly or a known goitre area?", ["iodised salt", "iodized salt", "rock salt", "hills", "hilly area", "goitre area", "endemic", "well water", "same problem in the village"], { tier: "detailed" }),
    ...surgicalBackground(),
  ],
  differentials: [
    { id: "simple_goitre", name: "Simple or multinodular goitre", pointers: ["moves_on_swallowing", "size_change", "iodine_diet_water"], discriminators: ["moves_on_swallowing", "size_change", "iodine_diet_water", "pressure_symptoms", "overactive_features", "rapid_growth_hard"] },
    { id: "solitary_nodule", name: "Solitary thyroid nodule", pointers: ["site_side", "size_change"], discriminators: ["site_side", "size_change", "rapid_growth_hard", "family_thyroid_cancer", "neck_radiation", "other_neck_lumps"] },
    { id: "thyroiditis", name: "Thyroiditis", pointers: ["pain", "onset_mode", "overactive_features"], discriminators: ["pain", "onset_mode", "overactive_features", "underactive_features", "size_change", "duration"] },
    { id: "graves", name: "Graves' disease", pointers: ["overactive_features", "eye_symptoms"], discriminators: ["overactive_features", "eye_symptoms", "site_side", "size_change", "known_thyroid_treatment"] },
    { id: "hypothyroid_goitre", name: "Goitre with an underactive gland", pointers: ["underactive_features", "menstrual_change"], discriminators: ["underactive_features", "menstrual_change", "size_change", "known_thyroid_treatment"] },
    { id: "thyroid_malignancy", name: "Thyroid malignancy", pointers: ["rapid_growth_hard", "voice_change", "other_neck_lumps", "neck_radiation"], discriminators: ["rapid_growth_hard", "voice_change", "other_neck_lumps", "neck_radiation", "family_thyroid_cancer", "pain", "breathing_difficulty"] },
    { id: "not_thyroid", name: "A neck swelling that is not the thyroid", pointers: ["other_neck_lumps", "site_side"], discriminators: ["moves_on_swallowing", "site_side", "other_neck_lumps", "pain", "size_change"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "site_side", "moves_on_swallowing", "size_change", "pain", "progression", "prior_treatment", "prior_investigations"],
  },
};
