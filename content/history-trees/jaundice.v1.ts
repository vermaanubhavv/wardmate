import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * JAUNDICE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine ward, north India. Differentials: acute viral hepatitis (A/E, B), alcoholic
 * hepatitis, drug-induced liver injury (including anti-tubercular drugs), obstructive jaundice
 * (stone, malignancy), decompensated cirrhosis, haemolysis (including malaria), leptospirosis,
 * sepsis / cholangitis, pregnancy-related liver disease.
 */
export const jaundiceV1: HistoryTree = {
  id: "jaundice",
  version: "1.0.0",
  complaint: "Jaundice",
  triggers: ["jaundice", "yellowish discolouration", "yellow discoloration", "yellowness of eyes", "yellow eyes", "icterus", "yellow urine"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient with liver disease have cirrhosis?", 2012, "22357834"),
    rce("The rational clinical examination. Physical examination of the liver", 1994, "8196144"),
    rce("Does this patient have acute cholecystitis?", 2003, "12503981"),
    { title: "Leptospirosis in India: a systematic review and meta-analysis of clinical profile, treatment and outcomes", source: "PubMed", year: 2023, pmid: "37701390" },
    { title: "Does this patient have a severe upper gastrointestinal bleed?", source: "JAMA (Rational Clinical Examination)", year: 2012, pmid: "22416103" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("jaundice"),
    val("hpi", "first_noticed", "Where first noticed", "Where was the yellowness first noticed — eyes, urine, skin — and by whom?", ["eyes", "urine", "skin", "noticed by", "first noticed", "sclera", "conjunctiva", "palms"]),
    val("hpi", "prodrome", "Prodrome before jaundice", "Was there fever, loss of appetite, nausea or malaise for some days before the yellowness appeared?", ["prodrome", "before the jaundice", "preceded by", "fever before", "malaise", "flu like", "loss of appetite before", "nausea before", "distaste"]),
    yn("hpi", "dark_urine", "Dark urine", "Is the urine dark or high-coloured?", ["dark urine", "dark coloured urine", "high coloured urine", "high colored urine", "cola coloured", "tea coloured", "yellow urine"]),
    yn("hpi", "pale_stools", "Pale stools", "Are the stools pale or clay-coloured?", ["pale stools", "clay coloured", "clay colored", "white stools", "chalky"]),
    yn("hpi", "pruritus", "Itching", "Any itching?", ["itching", "pruritus", "itch", "scratching"]),
    yn("associated", "fever", "Fever / chills", "Any fever, chills or rigors?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "abdominal_pain", "Abdominal pain", "Any abdominal pain, and where?", ["abdominal pain", "pain abdomen", "right hypochondrium", "right upper", "epigastric", "pain in abdomen"]),
    yn("associated", "nausea_vomiting", "Nausea / vomiting", "Any nausea or vomiting?", ["nausea", "vomiting", "vomit", "vomited"]),
    yn("associated", "appetite", "Loss of appetite / aversion to food", "Any loss of appetite or aversion to food or smoking?", ["loss of appetite", "appetite", "anorexia", "distaste", "aversion", "not eating"]),
    yn("associated", "weight_loss", "Weight loss", "Any weight loss?", ["weight loss", "lost weight", "losing weight"]),
    yn("associated", "abdominal_distension", "Abdominal distension / leg swelling", "Any abdominal distension or swelling of the legs?", ["distension", "distended", "ascites", "leg swelling", "pedal oedema", "pedal edema", "swelling of feet", "oedema", "edema"]),
    yn("associated", "gi_bleed", "Blood in vomit / black stools", "Any blood in vomit or black tarry stools?", ["blood in vomit", "haematemesis", "hematemesis", "black stools", "malena", "melena", "melaena", "tarry"]),
    yn("associated", "bleeding_tendency", "Bleeding tendency", "Any easy bruising, gum bleeding or nose bleeding?", ["bruising", "bruises", "gum bleeding", "bleeding gums", "nose bleed", "epistaxis", "bleeding"]),
    yn("associated", "joint_pain_rash", "Joint pain / rash", "Any joint pain or rash (as in viral hepatitis prodrome or leptospirosis)?", ["joint pain", "arthralgia", "rash", "urticaria", "body ache", "myalgia"], { tier: "detailed" }),
    yn("associated", "calf_pain_red_eyes", "Calf pain / red eyes", "Any calf pain or redness of the eyes?", ["calf pain", "calf tenderness", "red eyes", "conjunctival suffusion", "redness of eyes"], { tier: "detailed" }),
    yn("associated", "previous_jaundice", "Previous jaundice / known liver disease", "Any previous jaundice, known hepatitis B or C, or known liver disease?", ["previous jaundice", "earlier jaundice", "hepatitis b", "hepatitis c", "hbsag", "liver disease", "cirrhosis", "fatty liver", "known case"]),
    // Red flags
    yn("red_flag", "altered_sensorium", "Drowsiness / confusion / sleep reversal", "Any drowsiness, confusion, irrelevant talk, or day-night sleep reversal (encephalopathy)?", ["drowsy", "drowsiness", "confused", "confusion", "altered sensorium", "irrelevant talk", "sleep reversal", "irritable", "disoriented", "unconscious", "behaviour change"]),
    yn("red_flag", "bleeding_manifestations", "Bleeding manifestations", "Any bleeding from any site?", ["bleeding", "haematemesis", "hematemesis", "malena", "melena", "epistaxis", "gum bleeding", "petechiae"]),
    yn("red_flag", "urine_output", "Reduced urine output", "Has the urine output reduced?", ["urine output", "decreased urine", "reduced urine", "less urine", "oliguria", "not passing urine"]),
    yn("red_flag", "fever_with_rigors_pain", "Fever with rigors and right upper pain", "Is there fever with rigors together with right upper abdominal pain (cholangitis)?", ["rigors", "chills", "fever with", "right hypochondrium", "right upper", "charcot"]),
    yn("red_flag", "alcohol", "Alcohol", "How much alcohol, for how long, and when was the last drink?", ["alcohol", "drinks", "drinker", "alcoholic", "daily drinking", "binge", "last drink", "country liquor", "desi"]),
    yn("red_flag", "hepatotoxic_drugs", "Hepatotoxic drugs / ATT / herbal", "Any anti-tubercular drugs, paracetamol excess, herbal or ayurvedic preparations, or other new drugs recently?", ["att", "akt", "anti tubercular", "isoniazid", "rifampicin", "paracetamol", "herbal", "ayurvedic", "desi dawai", "bhasma", "new medicine", "started on", "drug", "supplements", "anabolic"]),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "water_food", "Unsafe water / outside food / contacts", "Any outside food, unsafe drinking water, or similar jaundice in family or locality?", ["outside food", "street food", "unsafe water", "contaminated water", "similar cases", "jaundice in family", "others at home", "locality", "outbreak"]),
    yn("exposure", "blood_sexual", "Blood / needle / sexual exposure", "Any transfusion, injections, tattoo, dialysis, needle sharing, or unprotected sexual exposure?", ["transfusion", "blood transfusion", "injection", "injections", "needle", "tattoo", "dialysis", "sexual", "unprotected", "multiple partners", "iv drug", "surgery", "dental"]),
    yn("exposure", "travel_water", "Travel / flood water / rodents", "Any travel, wading through flood water, or rodent exposure?", ["travel", "travelled", "flood", "flood water", "rain water", "wading", "sewage", "rat", "rats", "rodent", "farm", "paddy"], { tier: "detailed" }),
    yn("exposure", "family_history", "Family history of liver disease / anaemia", "Any family history of jaundice, liver disease, or anaemia (haemolytic disorders)?", ["family history", "family", "sibling", "parents", "thalassaemia", "thalassemia", "sickle", "g6pd", "anaemia in family"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "viral_hepatitis", name: "Acute viral hepatitis", pointers: ["prodrome", "appetite", "nausea_vomiting", "water_food", "fever"], discriminators: ["prodrome", "appetite", "nausea_vomiting", "water_food", "blood_sexual", "fever", "dark_urine"] },
    { id: "alcoholic", name: "Alcoholic hepatitis", pointers: ["alcohol", "fever", "abdominal_pain"], discriminators: ["alcohol", "fever", "abdominal_pain", "abdominal_distension", "altered_sensorium"] },
    { id: "dili", name: "Drug-induced liver injury (incl. ATT)", pointers: ["hepatotoxic_drugs"], discriminators: ["hepatotoxic_drugs", "prodrome", "pruritus", "joint_pain_rash"] },
    { id: "obstructive", name: "Obstructive jaundice (stone / malignancy)", pointers: ["pale_stools", "pruritus", "abdominal_pain", "weight_loss"], discriminators: ["pale_stools", "pruritus", "abdominal_pain", "weight_loss", "fever_with_rigors_pain", "progression"] },
    { id: "cirrhosis", name: "Decompensated chronic liver disease", pointers: ["abdominal_distension", "previous_jaundice", "gi_bleed", "altered_sensorium"], discriminators: ["abdominal_distension", "previous_jaundice", "gi_bleed", "altered_sensorium", "alcohol", "bleeding_tendency"] },
    { id: "haemolysis", name: "Haemolysis (incl. malaria)", pointers: ["fever", "family_history", "dark_urine"], discriminators: ["fever", "family_history", "dark_urine", "pale_stools", "travel_water", "hepatotoxic_drugs"] },
    { id: "leptospirosis", name: "Leptospirosis", pointers: ["travel_water", "calf_pain_red_eyes", "fever", "urine_output"], discriminators: ["travel_water", "calf_pain_red_eyes", "fever", "urine_output", "bleeding_manifestations"] },
    { id: "cholangitis_sepsis", name: "Cholangitis / sepsis", pointers: ["fever_with_rigors_pain", "altered_sensorium"], discriminators: ["fever_with_rigors_pain", "altered_sensorium", "urine_output", "abdominal_pain"] },
    { id: "pregnancy_liver", name: "Pregnancy-related liver disease", pointers: ["pregnancy"], discriminators: ["pregnancy", "abdominal_pain", "nausea_vomiting", "pruritus"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "first_noticed", "prodrome", "dark_urine", "pale_stools", "pruritus", "progression", "prior_treatment", "prior_investigations"],
  },
};
