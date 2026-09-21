import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * LOSS OF WEIGHT / APPETITE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine / surgical / oncology ward, north India. First job: is the weight loss real
 * and unintentional, and is the appetite lost (anorexia) or is eating painful or impossible?
 * Differentials: malignancy, tuberculosis and other chronic infection, HIV, diabetes,
 * hyperthyroidism, malabsorption, chronic organ failure, depression, poor intake / social.
 */
export const lossOfWeightAppetiteV1: HistoryTree = {
  id: "loss_of_weight_appetite",
  version: "1.0.0",
  complaint: "Loss of weight / appetite",
  triggers: ["loss of weight", "weight loss", "loss of appetite", "reduced appetite", "anorexia", "decreased appetite", "not eating", "poor appetite", "wasting", "emaciation", "cachexia"],
  setting: "Adult medicine / surgical / oncology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("loss of weight or appetite"),
    val("hpi", "weight_change", "How much weight", "How much weight has been lost, over what period, and how was it measured?", ["kg", "kilos", "pounds", "weight", "over months", "clothes loose", "belt", "measured", "weighed"], { numeric: true }),
    val("hpi", "appetite_pattern", "Appetite pattern", "Is the appetite reduced for everything, or only some foods, or is eating painful or difficult?", ["reduced appetite", "no appetite", "early satiety", "full after", "painful to eat", "difficulty swallowing", "specific foods", "food aversion"]),
    yn("hpi", "intentional", "Intentional or unintentional", "Was the weight loss intentional, through dieting or exercise?", ["intentional", "unintentional", "dieting", "exercise", "trying to lose", "without trying", "not trying"]),
    yn("associated", "fever_sweats", "Fever / night sweats", "Any fever or drenching night sweats?", ["fever", "night sweats", "evening rise", "chills", "sweating"]),
    yn("associated", "cough_breathlessness", "Cough / breathlessness", "Any cough, breathlessness, or blood in the sputum?", ["cough", "breathlessness", "haemoptysis", "blood in sputum", "sputum", "chest pain"]),
    yn("associated", "bowel_habit", "Bowel habit / blood in stool", "Any change in bowel habit, diarrhoea, or blood in the stool?", ["diarrhoea", "constipation", "blood in stool", "change in bowel habit", "fatty stools", "black stools", "loose stools"]),
    yn("associated", "swallowing_vomiting", "Swallowing difficulty / vomiting", "Any difficulty swallowing, pain on swallowing, or vomiting?", ["dysphagia", "difficulty swallowing", "painful swallowing", "vomiting", "regurgitation", "odynophagia"]),
    yn("associated", "thirst_urine", "Thirst / passing urine often", "Any excess thirst, passing urine often, or tiredness?", ["thirst", "polyuria", "frequent urine", "polydipsia", "tiredness", "fatigue"]),
    yn("associated", "heat_intolerance", "Heat intolerance / palpitations / tremor", "Any heat intolerance, palpitations, tremor, or sweating?", ["heat intolerance", "palpitations", "tremor", "sweating", "irritability", "increased appetite"], { tier: "detailed" }),
    yn("associated", "mood", "Low mood / loss of interest / social", "Any low mood, loss of interest, or difficulty affording or preparing food?", ["low mood", "sad", "loss of interest", "depressed", "cannot afford", "lives alone", "cannot cook", "social"], { tier: "detailed" }),
    yn("associated", "dental_mouth", "Mouth / dental problems", "Any mouth ulcers, painful teeth, or poorly fitting dentures?", ["mouth ulcers", "toothache", "dental", "dentures", "sore mouth", "oral"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "significant_loss", "Marked weight loss", "Has the weight fallen by more than a tenth in six months?", ["significant weight loss", "more than 10 percent", "marked weight loss", "10 kg", "lost a lot", "cachexia", "wasting"], { teach: "A fall of more than a tenth of body weight in six months, without dieting, is the threshold that makes further history mandatory." }),
    yn("red_flag", "night_sweats_fever", "Persistent fever / night sweats", "Any fever lasting more than two weeks, or drenching night sweats?", ["persistent fever", "fever for weeks", "night sweats", "drenching", "evening rise", "pyrexia"], { teach: "Fever and night sweats with weight loss widen the list to tuberculosis, lymphoma and other chronic infection." }),
    yn("red_flag", "dysphagia_gi_bleed", "Difficulty swallowing / GI bleeding", "Any difficulty swallowing, vomiting of blood, or black or bloody stools?", ["difficulty swallowing", "dysphagia", "vomiting blood", "melaena", "blood in stool", "black stools", "haematemesis"], { teach: "Weight loss with swallowing difficulty or bleeding from the gut is a story that asks for an early look inside." }),
    yn("red_flag", "haemoptysis", "Coughing blood", "Any cough with blood, or a cough lasting more than three weeks?", ["haemoptysis", "blood in sputum", "cough for weeks", "chronic cough", "coughing blood"], { teach: "Weight loss with a long cough or blood in the sputum asks about the lung, including tuberculosis." }),
    yn("red_flag", "lumps_jaundice", "Lumps / jaundice / abdominal swelling", "Any lump in the neck, armpit, groin, or breast, jaundice, or abdominal swelling?", ["lump", "swelling", "jaundice", "abdominal distension", "lymph nodes", "neck lump", "breast lump"], { teach: "A palpable lump, yellow eyes or a swollen abdomen with weight loss shifts the question towards a mass or organ disease." }),
    yn("red_flag", "hiv_risk", "HIV risk / immunosuppression", "Any risk of HIV, or known HIV?", ["hiv", "risk factors", "unprotected sex", "needle", "transfusion", "immunosuppressed"], { teach: "Wasting is a classic late feature of HIV, and the history is the only way to ask." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"]),
    yn("exposure", "tobacco_alcohol", "Tobacco / gutka / alcohol", "Any smoking, tobacco or gutka chewing, or alcohol use?", ["smoking", "tobacco", "gutka", "paan", "alcohol", "chewing"]),
    yn("exposure", "family_cancer", "Family history of cancer", "Any family history of cancer?", ["family history", "cancer", "father", "mother", "sibling", "cancer in family"], { tier: "detailed" }),
    yn("exposure", "drugs_supplements", "Drugs affecting appetite", "Any new drugs, metformin, digoxin, antibiotics, or herbal remedies since the appetite fell?", ["new drug", "metformin", "digoxin", "antibiotics", "herbal", "ayurvedic", "started"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "malignancy", name: "Malignancy", pointers: ["significant_loss", "dysphagia_gi_bleed", "lumps_jaundice", "tobacco_alcohol"], discriminators: ["significant_loss", "dysphagia_gi_bleed", "lumps_jaundice", "tobacco_alcohol", "family_cancer", "appetite_pattern", "bowel_habit"] },
    { id: "tb_infection", name: "Tuberculosis / chronic infection", pointers: ["night_sweats_fever", "haemoptysis", "tb_contact"], discriminators: ["night_sweats_fever", "haemoptysis", "tb_contact", "cough_breathlessness", "fever_sweats"] },
    { id: "hiv", name: "HIV-related", pointers: ["hiv_risk", "immunocompromise"], discriminators: ["hiv_risk", "immunocompromise", "bowel_habit", "fever_sweats"] },
    { id: "diabetes", name: "Diabetes", pointers: ["thirst_urine"], discriminators: ["thirst_urine", "appetite_pattern", "weight_change"] },
    { id: "thyroid", name: "Hyperthyroidism", pointers: ["heat_intolerance"], discriminators: ["heat_intolerance", "appetite_pattern", "bowel_habit", "weight_change"] },
    { id: "malabsorption", name: "Malabsorption / chronic GI disease", pointers: ["bowel_habit", "swallowing_vomiting"], discriminators: ["bowel_habit", "swallowing_vomiting", "appetite_pattern", "dental_mouth"] },
    { id: "depression_social", name: "Depression / social causes", pointers: ["mood"], discriminators: ["mood", "appetite_pattern", "intentional", "dental_mouth"] },
    { id: "drug_related", name: "Drug-related", pointers: ["drugs_supplements"], discriminators: ["drugs_supplements", "onset", "swallowing_vomiting"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "weight_change", "appetite_pattern", "intentional", "progression", "prior_treatment", "prior_investigations"],
  },
};
