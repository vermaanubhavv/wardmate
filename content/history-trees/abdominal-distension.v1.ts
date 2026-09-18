import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * ABDOMINAL DISTENSION / ASCITES — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: cirrhosis with portal hypertension, tuberculous peritonitis, malignant
 * ascites (ovarian, GI, peritoneal), heart failure / constrictive pericarditis, nephrotic
 * syndrome, intestinal obstruction, hepatic vein obstruction (Budd-Chiari), pancreatic
 * ascites, ovarian mass, pregnancy.
 */
export const abdominalDistensionV1: HistoryTree = {
  id: "abdominal_distension",
  version: "1.0.0",
  complaint: "Abdominal distension",
  triggers: ["abdominal distension", "distension of abdomen", "distended abdomen", "swelling of abdomen", "abdominal swelling", "ascites", "fluid in abdomen", "bloating", "abdomen enlarged", "pet phoolna"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient have ascites? How to divine fluid in the abdomen", 1992, "1532036"),
    { title: "EASL clinical practice guidelines for the management of patients with decompensated cirrhosis", source: "J Hepatol", year: 2018, pmid: "29653741" },
    { title: "Index-TB guidelines: extrapulmonary tuberculosis (abdominal TB)", source: "Ministry of Health and Family Welfare, India", year: 2016 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("distension"),
    val("hpi", "pace", "Pace of distension", "Did the abdomen swell over days, weeks or months?", ["days", "weeks", "months", "rapidly", "gradually", "slowly", "overnight", "pace"]),
    val("hpi", "sequence_swelling", "Where swelling started", "Did the swelling start in the abdomen or the legs first, or the face?", ["abdomen first", "legs first", "feet first", "face first", "ankles", "then abdomen", "started in", "sequence"]),
    yn("hpi", "leg_swelling", "Leg swelling", "Is there swelling of the legs, and up to what level?", ["leg swelling", "pedal oedema", "ankle", "feet", "up to", "knees", "thighs", "scrotal", "oedema"]),
    val("hpi", "pain", "Abdominal pain", "Any abdominal pain — where, and is it colicky or continuous?", ["pain", "colicky", "colic", "continuous", "dull", "right upper", "epigastric", "all over", "no pain", "painless"]),
    yn("hpi", "vomiting_constipation", "Vomiting / constipation / stopped passing flatus", "Any vomiting, constipation, or has the passing of flatus stopped?", ["vomiting", "vomit", "constipation", "not passed stool", "flatus", "no gas", "obstipation", "bilious"]),
    yn("hpi", "breathlessness_lying", "Breathlessness / unable to lie flat", "Is the patient breathless or unable to lie flat because of the abdomen?", ["breathless", "breathlessness", "lie flat", "orthopnoea", "sitting up", "dyspnoea"]),
    yn("hpi", "early_satiety_weight", "Early fullness / weight change", "Does the patient feel full early, and has the weight changed apart from the abdomen?", ["full early", "early satiety", "cannot eat", "weight loss", "lost weight", "weight gain", "wasting", "thin arms"]),
    val("hpi", "urine_output_colour", "Urine output and colour", "How much urine is being passed, and is it dark or frothy?", ["urine", "output", "less urine", "reduced", "dark", "frothy", "froth", "oliguria"]),
    yn("associated", "jaundice", "Jaundice", "Any yellowness of the eyes, now or in the past?", ["jaundice", "yellow", "yellowish", "icterus", "past jaundice"]),
    yn("associated", "haematemesis_melaena", "Blood in vomit / black stools", "Any blood in the vomit or black stools, now or before?", ["haematemesis", "hematemesis", "blood in vomit", "black stools", "melaena", "melena", "malena", "varices", "banding"]),
    yn("associated", "altered_sleep_confusion", "Sleep reversal / confusion", "Any reversal of the sleep pattern, forgetfulness, irrelevant talk, or drowsiness?", ["sleep reversal", "awake at night", "sleeps in the day", "confusion", "confused", "irrelevant", "drowsy", "forgetful", "encephalopathy"]),
    yn("associated", "fever_night_sweats", "Fever / evening rise / night sweats", "Any fever, evening rise of temperature, or night sweats?", ["fever", "evening rise", "night sweats", "low grade", "chills"]),
    yn("associated", "facial_puffiness", "Facial puffiness", "Any puffiness of the face, especially in the morning?", ["puffiness", "puffy face", "face swelling", "periorbital", "morning"], { tier: "detailed" }),
    yn("associated", "bowel_habit_change", "Change in bowel habit / blood in stool", "Any change in bowel habit, diarrhoea, or blood in the stool?", ["bowel habit", "diarrhoea", "diarrhea", "constipation", "blood in stool", "alternating", "mucus"], { tier: "detailed" }),
    yn("associated", "menstrual_pelvic", "Menstrual irregularity / pelvic symptoms", "For women: any missed periods, irregular bleeding, or pelvic pain?", ["periods", "missed period", "amenorrhoea", "irregular bleeding", "pelvic pain", "menstrual", "postmenopausal bleeding"], { tier: "detailed" }),
    yn("associated", "itching_bruising", "Itching / bruising / gum bleeding", "Any itching of the skin, easy bruising, or gum bleeding?", ["itching", "pruritus", "bruising", "bruises", "gum bleeding", "bleeding tendency"], { tier: "detailed" }),
    yn("associated", "chest_pain_palpitations", "Chest pain / palpitations / neck vein fullness", "Any chest pain, palpitations, or fullness of the neck veins noticed?", ["chest pain", "palpitations", "neck veins", "heart disease", "rheumatic", "pericarditis"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "fever_with_abdominal_pain", "Fever with abdominal pain in ascites", "Is there fever or abdominal pain together with the distension?", ["fever", "abdominal pain", "tender", "pain with fever", "rigors"], { teach: "Fever or pain in an ascitic abdomen means spontaneous bacterial peritonitis until the fluid is tapped; the tap cannot wait for the morning." }),
    yn("red_flag", "confusion_drowsiness", "Confusion or drowsiness", "Is there any confusion, drowsiness, or irrelevant talk?", ["confusion", "confused", "drowsy", "drowsiness", "irrelevant talk", "unconscious", "encephalopathy"], { teach: "Hepatic encephalopathy in a cirrhotic always has a precipitant: infection, bleeding, constipation, a drug, or electrolytes. The history is the search for it." }),
    yn("red_flag", "gi_bleeding", "Blood in vomit or black stools", "Any blood in the vomit or black stools?", ["haematemesis", "hematemesis", "blood in vomit", "black stools", "melaena", "melena", "malena"], { teach: "Variceal bleeding in a patient with ascites is the deadliest complication of portal hypertension." }),
    yn("red_flag", "obstruction_features", "Vomiting with no flatus / colicky pain", "Is there vomiting with colicky pain and no passage of flatus or stool?", ["vomiting", "colicky", "colic", "no flatus", "not passing flatus", "obstipation", "not passed stool", "bilious"], { teach: "Distension with vomiting and no flatus is intestinal obstruction, a surgical problem that fluid-thinking misses." }),
    yn("red_flag", "rapid_onset_pain_jaundice", "Rapid ascites with pain and jaundice", "Did the ascites appear within days along with right upper abdominal pain and jaundice?", ["within days", "rapid", "sudden", "right upper", "pain", "jaundice", "tender liver"], { teach: "Rapid painful ascites with jaundice points to hepatic vein thrombosis (Budd-Chiari), which is common in young Indians and treatable if found early." }),
    yn("red_flag", "breathless_at_rest", "Breathless at rest", "Is the patient breathless at rest or unable to lie flat?", ["breathless at rest", "cannot lie flat", "orthopnoea", "gasping", "breathlessness"], { teach: "Tense ascites, a pleural effusion, or heart failure behind the ascites all present as breathlessness; each is handled differently." }),
    yn("red_flag", "reduced_urine", "Reduced urine output", "Has the urine output fallen?", ["less urine", "reduced urine", "oliguria", "not passing urine", "urine output"], { teach: "Falling urine output in cirrhosis raises hepatorenal syndrome, where diuretics do harm." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "alcohol", "Alcohol", "Does the patient drink alcohol — what, how much, for how long, and when was the last drink?", ["alcohol", "alcoholic", "drinks", "drinking", "liquor", "daru", "desi", "years", "last drink", "quarter", "bottle"]),
    yn("exposure", "hepatitis_risk", "Hepatitis risk", "Any past jaundice, transfusion, tattoo, injections from unqualified practitioners, or a family history of liver disease?", ["hepatitis", "hepatitis b", "hepatitis c", "transfusion", "tattoo", "injections", "quack", "family history", "liver disease in family", "needle"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact?", ["tb", "tuberculosis", "koch", "att", "tb contact", "past tb"]),
    yn("exposure", "drugs_herbal", "Drugs / herbal medicines", "Any long-term medicines, anti-tuberculosis drugs, methotrexate, or herbal and traditional preparations?", ["att", "akt", "methotrexate", "herbal", "ayurvedic", "desi", "bhasma", "medicines", "tablets", "long term"], { tier: "detailed" }),
    yn("exposure", "diabetes_obesity", "Diabetes / obesity (fatty liver)", "Is the patient diabetic or overweight?", ["diabetes", "diabetic", "obese", "overweight", "fatty liver"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "cirrhosis", name: "Cirrhosis with portal hypertension", pointers: ["alcohol", "jaundice", "haematemesis_melaena", "altered_sleep_confusion", "hepatitis_risk"], discriminators: ["alcohol", "jaundice", "haematemesis_melaena", "altered_sleep_confusion", "hepatitis_risk", "early_satiety_weight", "sequence_swelling", "pace", "diabetes_obesity"] },
    { id: "tb_peritonitis", name: "Tuberculous peritonitis", pointers: ["fever_night_sweats", "tb_contact", "early_satiety_weight", "pain"], discriminators: ["fever_night_sweats", "tb_contact", "early_satiety_weight", "pain", "pace", "immunocompromise", "bowel_habit_change"] },
    { id: "malignant", name: "Malignant ascites (ovarian, gastrointestinal, peritoneal)", pointers: ["early_satiety_weight", "menstrual_pelvic", "bowel_habit_change", "pace"], discriminators: ["early_satiety_weight", "menstrual_pelvic", "bowel_habit_change", "pace", "pain", "jaundice", "fever_night_sweats"] },
    { id: "cardiac", name: "Heart failure / constrictive pericarditis", pointers: ["sequence_swelling", "breathlessness_lying", "chest_pain_palpitations"], discriminators: ["sequence_swelling", "breathlessness_lying", "chest_pain_palpitations", "leg_swelling", "jaundice", "tb_contact"] },
    { id: "nephrotic", name: "Nephrotic syndrome", pointers: ["facial_puffiness", "urine_output_colour", "sequence_swelling"], discriminators: ["facial_puffiness", "urine_output_colour", "sequence_swelling", "diabetes_obesity", "jaundice", "leg_swelling"] },
    { id: "obstruction", name: "Intestinal obstruction", pointers: ["obstruction_features", "vomiting_constipation", "pain"], discriminators: ["obstruction_features", "vomiting_constipation", "pain", "pace", "bowel_habit_change", "tb_contact"] },
    { id: "budd_chiari", name: "Hepatic vein obstruction (Budd-Chiari)", pointers: ["rapid_onset_pain_jaundice", "pace"], discriminators: ["rapid_onset_pain_jaundice", "pace", "alcohol", "hepatitis_risk", "pregnancy", "drugs_herbal"] },
    { id: "pancreatic", name: "Pancreatic ascites", pointers: ["pain", "alcohol"], discriminators: ["pain", "alcohol", "vomiting_constipation", "jaundice", "pace"] },
    { id: "ovarian_pregnancy", name: "Ovarian mass / pregnancy", pointers: ["menstrual_pelvic", "pregnancy"], discriminators: ["menstrual_pelvic", "pregnancy", "pace", "leg_swelling", "urine_output_colour"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "pace", "sequence_swelling", "leg_swelling", "pain", "vomiting_constipation", "breathlessness_lying", "early_satiety_weight", "urine_output_colour", "progression", "prior_treatment", "prior_investigations"],
  },
};
