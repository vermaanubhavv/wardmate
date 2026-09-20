import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, MACLEODS, paedBackground, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * COUGH AND DIFFICULT BREATHING IN A CHILD — v1.0.0. PENDING CLINICIAN REVIEW.
 * Paediatric ward, north India. Work of breathing and oxygenation matter more than the
 * respiratory rate or what can be heard through the stethoscope, which is where the published
 * evidence and bedside habit most often part company. Differentials: pneumonia, bronchiolitis,
 * asthma or viral wheeze, croup, foreign body aspiration, upper respiratory infection,
 * tuberculosis, pertussis, and cardiac failure presenting as fast breathing.
 */
export const paediatricBreathingV1: HistoryTree = {
  id: "paediatric_breathing",
  version: "1.0.0",
  complaint: "Cough or difficult breathing in a child",
  triggers: ["cough in child", "child breathing difficulty", "fast breathing child", "child cough", "baby breathing", "wheeze child", "chest indrawing", "noisy breathing child", "paediatric cough", "saans"],
  setting: "Paediatric ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this child have pneumonia? The Rational Clinical Examination systematic review", 2017, "28763554"),
    rce("The rational clinical examination. Does this infant have pneumonia?", 1998, "9450716"),
    ebem("The clinical diagnosis of infantile pneumonia", 2006, "17061320"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("cough or difficult breathing"),
    ...paedBackground(),
    val("hpi", "cough_character", "Character of the cough", "Is the cough dry, wet, barking, or does it come in bouts that end in a whoop or vomiting?", ["dry", "wet", "productive", "barking", "seal", "bouts", "paroxysm", "whoop", "vomiting after cough", "night cough"]),
    val("hpi", "breathing_difficulty", "How the breathing looks", "Is the breathing fast, is the chest drawing in below the ribs, is there grunting, or are the nostrils flaring?", ["fast breathing", "chest indrawing", "retractions", "grunting", "nasal flaring", "head nodding", "using neck muscles", "normal"]),
    val("hpi", "noisy_breathing", "Noisy breathing and when it occurs", "Is there noise on breathing in, on breathing out, or both, and is it there at rest or only when upset?", ["breathing in", "inspiratory", "stridor", "breathing out", "expiratory", "wheeze", "at rest", "when crying", "when upset", "both"]),
    val("hpi", "feeding_speech", "Feeding, speech and play", "Can the child feed, drink and speak or cry normally, or does breathlessness interrupt them?", ["feeding", "cannot feed", "stops to breathe", "short sentences", "one word", "weak cry", "cannot complete", "plays normally", "refusing feeds"]),
    yn("hpi", "fever", "Fever", "Any fever, and how high?", ["fever", "high grade", "measured", "temperature", "chills"]),
    yn("hpi", "choking_episode", "A choking episode", "Was there a sudden episode of choking, coughing or going blue, particularly while eating or playing with a small object?", ["choking", "sudden", "while eating", "peanut", "small object", "playing", "went blue", "coughing fit", "witnessed"]),
    yn("associated", "wheeze_history", "Previous wheezing episodes", "Has the child wheezed before, and does it come with colds, exercise, or at night?", ["wheezed before", "previous episodes", "with colds", "exercise", "night", "recurrent", "first time", "inhaler"]),
    yn("associated", "runny_nose", "Runny nose or sore throat", "Any runny nose, blocked nose, or sore throat before this started?", ["runny nose", "blocked nose", "coryza", "sore throat", "cold", "sneezing"]),
    yn("associated", "cyanosis_apnoea", "Going blue or pauses in breathing", "Any bluish colour of the lips or tongue, or pauses in breathing?", ["blue", "bluish", "lips", "tongue", "cyanosis", "pauses", "apnoea", "stopped breathing", "dusky"]),
    yn("associated", "chest_pain_abdominal", "Chest or abdominal pain", "Any chest pain, or pain in the upper abdomen with the cough?", ["chest pain", "abdominal pain", "upper abdomen", "hurts to breathe", "side pain"], { tier: "detailed" }),
    yn("associated", "swelling_sweating_feeds", "Sweating with feeds or swelling", "Does the baby sweat or tire during feeds, or is there swelling of the face or feet?", ["sweating", "tires", "during feeds", "stops feeding", "swelling", "puffiness", "feet", "face"], { tier: "detailed" }),
    yn("associated", "weight_loss_night_sweats", "Weight loss or night sweats", "Any weight loss, failure to gain weight, or night sweats?", ["weight loss", "not gaining", "night sweats", "losing weight", "thin"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "severe_respiratory_distress", "Grunting, head nodding or severe indrawing", "Is the child grunting, nodding the head with each breath, or drawing in deeply below the ribs?", ["grunting", "head nodding", "severe indrawing", "deep retractions", "subcostal", "intercostal", "struggling", "using all muscles"], { teach: "Grunting and increased work of breathing carry more weight than the respiratory rate or the chest findings, and they identify the child who will tire." }),
    yn("red_flag", "cyanosis_hypoxia", "Blue lips or low oxygen", "Are the lips or tongue blue, or has a low oxygen level been recorded?", ["blue", "cyanosis", "lips", "tongue", "low oxygen", "saturation", "spo2", "dusky", "pale"], { teach: "Low oxygen saturation is among the findings most strongly associated with pneumonia in a child, and a normal saturation makes it considerably less likely." }),
    yn("red_flag", "unable_to_feed", "Unable to feed or drink", "Is the child unable to feed or drink because of the breathing?", ["cannot feed", "unable to drink", "stops to breathe", "refusing", "too breathless", "not taking"], { teach: "A child too breathless to feed is spending everything on breathing, and that is a clearer measure of severity than any count." }),
    yn("red_flag", "lethargy_consciousness", "Lethargy or difficulty waking", "Is the child abnormally sleepy, floppy, or difficult to wake?", ["lethargic", "drowsy", "floppy", "difficult to wake", "unresponsive", "not alert", "limp"], { teach: "Drowsiness in a breathless child can mark a rising carbon dioxide and exhaustion rather than settling, and marks the point at which support is needed." }),
    yn("red_flag", "stridor_at_rest", "Noisy breathing in, present at rest", "Is there harsh noise on breathing in that is present even when the child is calm and at rest?", ["stridor", "breathing in", "at rest", "harsh", "when calm", "not only crying", "barking", "hoarse"], { teach: "Stridor at rest marks a narrowing upper airway, and distressing the child, including by examining the throat, can close it completely." }),
    yn("red_flag", "choking_foreign_body", "Sudden choking with a small object", "Did the symptoms begin abruptly with a choking episode while eating nuts or playing with a small object?", ["choking", "abruptly", "peanut", "nut", "small object", "bead", "while eating", "while playing", "sudden onset", "one side"], { teach: "An abrupt onset with a choking episode points to an inhaled object, which can sit for weeks being treated as asthma." }),
    yn("red_flag", "apnoea_young_infant", "Pauses in breathing, or a young infant", "Are there pauses in breathing, or is this a baby under two months?", ["pauses", "apnoea", "stopped breathing", "under two months", "young infant", "newborn", "weeks old"], { teach: "Young infants tire quickly and stop breathing rather than struggling visibly, so apnoea can be the first sign rather than a late one." }),
    yn("red_flag", "immunisation_incomplete", "Immunisation not up to date", "Is immunisation incomplete for the age?", ["not vaccinated", "incomplete", "not up to date", "missed", "no card", "never"], { teach: "An unimmunised child remains at risk from the airway and chest infections the schedule has otherwise made rare." }),
    yn("red_flag", "malnutrition_child", "Severe wasting or swelling of the feet", "Is the child visibly very thin, or is there swelling of both feet?", ["very thin", "wasted", "visible ribs", "swelling of feet", "oedema", "malnutrition"], { teach: "Malnutrition blunts the signs of chest infection and worsens its outcome, so the usual thresholds do not apply." }),
    yn("exposure", "tb_contact", "TB contact", "Is anyone at home being treated for tuberculosis, or coughing for more than two weeks?", ["tb", "tuberculosis", "koch", "att", "contact", "coughing", "two weeks", "grandparent", "family"]),
    yn("exposure", "smoke_exposure", "Smoke exposure at home", "Is there cooking on a wood or dung fire indoors, or does anyone at home smoke?", ["wood", "dung", "chulha", "indoor", "smoke", "smoking", "bidi", "cooking fire", "ventilation"]),
    yn("exposure", "sick_contacts", "Others with cough at home", "Is anyone else at home or at school coughing?", ["contact", "sibling", "school", "coughing", "similar", "family", "outbreak"]),
    yn("exposure", "allergy_family_history", "Family history of asthma or allergy", "Any asthma, allergy or eczema in the child or the family?", ["asthma", "allergy", "eczema", "family history", "allergic", "mother", "father", "sibling"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "pneumonia_child", name: "Pneumonia", pointers: ["severe_respiratory_distress", "cyanosis_hypoxia", "fever", "breathing_difficulty"], discriminators: ["severe_respiratory_distress", "cyanosis_hypoxia", "fever", "breathing_difficulty", "unable_to_feed", "immunisation_incomplete", "noisy_breathing"] },
    { id: "bronchiolitis", name: "Bronchiolitis", pointers: ["runny_nose", "noisy_breathing", "apnoea_young_infant", "feeding_speech"], discriminators: ["runny_nose", "noisy_breathing", "apnoea_young_infant", "feeding_speech", "wheeze_history", "fever"] },
    { id: "asthma_viral_wheeze", name: "Asthma or viral wheeze", pointers: ["wheeze_history", "noisy_breathing", "allergy_family_history"], discriminators: ["wheeze_history", "noisy_breathing", "allergy_family_history", "cough_character", "fever", "prior_treatment"] },
    { id: "croup", name: "Croup", pointers: ["cough_character", "stridor_at_rest", "noisy_breathing"], discriminators: ["cough_character", "stridor_at_rest", "noisy_breathing", "fever", "choking_episode"] },
    { id: "foreign_body", name: "Inhaled foreign body", pointers: ["choking_foreign_body", "choking_episode"], discriminators: ["choking_foreign_body", "choking_episode", "onset_mode", "noisy_breathing", "cough_character"] },
    { id: "uri", name: "Upper respiratory infection", pointers: ["runny_nose", "cough_character"], discriminators: ["runny_nose", "cough_character", "breathing_difficulty", "severe_respiratory_distress", "feeding_speech"] },
    { id: "tuberculosis_child", name: "Tuberculosis", pointers: ["tb_contact", "weight_loss_night_sweats", "growth"], discriminators: ["tb_contact", "weight_loss_night_sweats", "growth", "duration", "cough_character", "malnutrition_child"] },
    { id: "pertussis", name: "Pertussis", pointers: ["cough_character", "immunisation_incomplete", "apnoea_young_infant"], discriminators: ["cough_character", "immunisation_incomplete", "apnoea_young_infant", "duration", "fever"] },
    { id: "cardiac_child", name: "Cardiac failure presenting as fast breathing", pointers: ["swelling_sweating_feeds", "growth", "feeding_speech"], discriminators: ["swelling_sweating_feeds", "growth", "feeding_speech", "birth_history", "fever", "noisy_breathing"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "cough_character", "breathing_difficulty", "noisy_breathing", "feeding_speech", "choking_episode", "progression", "immunisation", "prior_treatment", "prior_investigations"],
  },
};
