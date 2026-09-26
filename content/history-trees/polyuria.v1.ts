import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * POLYURIA / POLYDIPSIA — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult medicine ward, north India. The first separation is true polyuria (large volumes) from
 * frequency (small volumes, often), because the two lead in entirely different directions.
 * Differentials: diabetes mellitus, diabetes insipidus (cranial or nephrogenic), hypercalcaemia,
 * chronic kidney disease, diuretic effect, primary polydipsia, urinary tract infection,
 * recovering acute kidney injury.
 */
export const polyuriaV1: HistoryTree = {
  id: "polyuria",
  version: "1.0.0",
  complaint: "Passing urine often / excess thirst",
  triggers: ["polyuria", "polydipsia", "excess thirst", "increased thirst", "passing urine often", "frequent urination", "increased urine output", "excess urine", "drinking a lot of water", "urinating frequently", "nocturia"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("increased urine and thirst"),
    val("hpi", "volume_vs_frequency", "Volume or frequency", "Is a large amount passed each time, or small amounts very often?", ["large amount", "large volume", "small amounts", "often", "each time", "full bladder", "little urine", "buckets", "volume"]),
    val("hpi", "daily_volume", "Amount in a day", "Roughly how much urine is passed in a day, and how much is being drunk?", ["litres", "glasses", "bottles", "per day", "amount", "jug", "how much water", "intake"], { numeric: true }),
    yn("hpi", "nocturia", "Getting up at night", "Is the patient getting up at night to pass urine, and how many times?", ["nocturia", "at night", "getting up", "times at night", "night urine", "wakes to pass urine"]),
    yn("hpi", "thirst_at_night", "Thirst waking from sleep", "Is thirst strong enough to wake the patient at night to drink?", ["thirst at night", "wakes to drink", "keeps water", "bottle by bed", "dry mouth at night", "craving water"]),
    val("hpi", "fluid_preference", "What is being drunk", "What is being drunk — plain water, sweet drinks, tea, or cold water specifically?", ["water", "cold water", "sweet drinks", "juice", "tea", "sugarcane", "ice water", "soft drinks"], { tier: "detailed" }),
    yn("associated", "weight_appetite", "Weight loss / appetite", "Any weight loss despite eating well, or increased appetite?", ["weight loss", "lost weight", "increased appetite", "eating more", "polyphagia", "clothes loose"]),
    yn("associated", "fatigue", "Tiredness / weakness", "Any tiredness or generalised weakness?", ["tiredness", "fatigue", "weakness", "lethargy", "no energy"]),
    yn("associated", "blurring", "Blurring of vision", "Any blurring of vision, and does it change through the day?", ["blurring", "blurred vision", "vision changes", "spectacle change", "eyesight"]),
    yn("associated", "burning_urine", "Burning urine / fever", "Any burning on passing urine, fever, or loin pain?", ["burning", "dysuria", "fever", "loin pain", "urgency", "cloudy urine", "foul smelling"]),
    yn("associated", "infections_itching", "Recurrent infections / genital itching / slow healing", "Any recurrent boils, genital itching, or wounds that heal slowly?", ["boils", "recurrent infections", "genital itching", "itching", "slow healing", "wound not healing", "fungal", "candidiasis"]),
    yn("associated", "numbness_tingling", "Numbness / tingling of feet", "Any numbness, tingling, or burning of the feet?", ["numbness", "tingling", "burning feet", "pins and needles", "neuropathy", "loss of sensation"], { tier: "detailed" }),
    yn("associated", "bone_pain_constipation", "Bone pain / constipation / abdominal pain", "Any bone pain, constipation, abdominal pain, or kidney stones?", ["bone pain", "constipation", "abdominal pain", "stones", "renal colic", "calcium"], { tier: "detailed" }),
    yn("associated", "swelling_frothy_urine", "Swelling / frothy urine", "Any swelling of the face or legs, or frothy urine?", ["swelling", "puffiness", "pedal oedema", "frothy urine", "foamy", "protein in urine"], { tier: "detailed" }),
    yn("associated", "headache_vision_field", "Headache / visual field loss / periods stopped", "Any headache, loss of side vision, or periods stopping?", ["headache", "visual field", "side vision", "tunnel vision", "periods stopped", "amenorrhoea", "libido", "pituitary"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "ketosis_features", "Vomiting / abdominal pain / deep breathing", "Any vomiting, abdominal pain, or deep sighing breathing with the thirst?", ["vomiting", "abdominal pain", "deep breathing", "sighing", "rapid breathing", "acetone", "fruity", "kussmaul"], { teach: "Vomiting, abdominal pain and deep breathing alongside thirst mark a metabolic emergency rather than simple hyperglycaemia." }),
    yn("red_flag", "altered_sensorium", "Drowsiness / confusion", "Any drowsiness, confusion, or excessive sleepiness?", ["drowsy", "drowsiness", "confusion", "confused", "sleepy", "altered sensorium", "not responding", "irrelevant talk"], { teach: "Drowsiness with heavy fluid losses points to either very high sugars or a sodium that has shifted." }),
    yn("red_flag", "dehydration_reduced_intake", "Unable to keep up with drinking", "Is the patient unable to drink enough to keep up, or has the urine output now fallen?", ["cannot drink", "not able to drink", "urine reduced", "less urine", "dry mouth", "sunken eyes", "not passing urine"], { teach: "When the losses outrun what a patient can drink, a manageable problem becomes a circulatory one quickly." }),
    yn("red_flag", "rapid_weight_loss", "Rapid weight loss in a young patient", "Has a young patient lost weight rapidly over weeks despite eating?", ["rapid weight loss", "young", "over weeks", "despite eating", "thin", "wasted", "lost weight fast"], { teach: "Rapid weight loss with thirst in a young patient suggests insulin deficiency that will not wait for an outpatient appointment." }),
    yn("red_flag", "head_injury_surgery", "Head injury / brain surgery / pituitary problem", "Any head injury, brain surgery, or known pituitary problem before this started?", ["head injury", "brain surgery", "pituitary", "trauma", "neurosurgery", "tumour", "radiotherapy"], { tier: "detailed", teach: "Large dilute volumes starting after a head injury or brain surgery point to the hormone that concentrates urine having been lost." }),
    PREGNANCY,
    yn("exposure", "known_diabetes_family", "Known diabetes / family history", "Any known diabetes, prediabetes, or diabetes in the family?", ["diabetes", "diabetic", "sugar", "prediabetes", "family history", "father", "mother", "gestational"]),
    yn("exposure", "diuretics_drugs", "Diuretics / lithium / steroids", "Any water tablets, lithium, steroids, or new medicines?", ["diuretic", "water tablet", "furosemide", "lithium", "steroid", "new medicine", "started"], { tier: "detailed" }),
    yn("exposure", "kidney_disease", "Known kidney disease", "Any known kidney disease, or a recent episode of kidney injury?", ["kidney disease", "ckd", "renal", "creatinine", "dialysis", "kidney injury", "recovering"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "diabetes_mellitus", name: "Diabetes mellitus", pointers: ["weight_appetite", "known_diabetes_family", "infections_itching", "blurring"], discriminators: ["weight_appetite", "known_diabetes_family", "infections_itching", "blurring", "ketosis_features", "rapid_weight_loss", "numbness_tingling"] },
    { id: "diabetes_insipidus", name: "Diabetes insipidus", pointers: ["thirst_at_night", "daily_volume", "head_injury_surgery", "headache_vision_field"], discriminators: ["thirst_at_night", "daily_volume", "head_injury_surgery", "headache_vision_field", "fluid_preference", "diuretics_drugs", "weight_appetite"] },
    { id: "hypercalcaemia", name: "Hypercalcaemia", pointers: ["bone_pain_constipation"], discriminators: ["bone_pain_constipation", "weight_appetite", "altered_sensorium", "daily_volume"] },
    { id: "ckd", name: "Chronic kidney disease", pointers: ["kidney_disease", "nocturia", "swelling_frothy_urine"], discriminators: ["kidney_disease", "nocturia", "swelling_frothy_urine", "fatigue", "volume_vs_frequency"] },
    { id: "diuretic", name: "Diuretic effect", pointers: ["diuretics_drugs"], discriminators: ["diuretics_drugs", "onset", "nocturia", "daily_volume"] },
    { id: "primary_polydipsia", name: "Primary polydipsia", pointers: ["fluid_preference", "thirst_at_night"], discriminators: ["fluid_preference", "thirst_at_night", "daily_volume", "weight_appetite", "nocturia"] },
    { id: "uti", name: "Urinary tract infection", pointers: ["burning_urine", "volume_vs_frequency"], discriminators: ["burning_urine", "volume_vs_frequency", "daily_volume", "thirst_at_night"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "volume_vs_frequency", "daily_volume", "nocturia", "thirst_at_night", "fluid_preference", "progression", "prior_treatment", "prior_investigations"],
  },
};
