import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * GASTROINTESTINAL BLEEDING (haematemesis / melaena / haematochezia) — v1.0.0.
 * CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: peptic ulcer, oesophageal / gastric varices, erosive gastritis (NSAID,
 * alcohol), Mallory-Weiss tear, malignancy, lower GI causes (haemorrhoids, dysentery,
 * inflammatory bowel disease, colorectal cancer), coagulopathy / anticoagulants, swallowed
 * blood (epistaxis, haemoptysis).
 */
export const giBleedV1: HistoryTree = {
  id: "gi_bleed",
  version: "1.0.0",
  complaint: "Blood in vomit or stool",
  triggers: ["haematemesis", "hematemesis", "blood in vomit", "vomiting blood", "vomited blood", "melaena", "melena", "malena", "black stools", "black stool", "tarry stools", "blood in stool", "bleeding per rectum", "haematochezia", "hematochezia", "gi bleed", "upper gi bleed"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient have a severe upper gastrointestinal bleed?", 2012, "22416103"),
    { title: "Glasgow-Blatchford score: a risk score to predict need for treatment for upper-gastrointestinal haemorrhage", source: "Lancet", year: 2000, pmid: "11073021" },
    { title: "ACG clinical guideline: upper gastrointestinal and ulcer bleeding", source: "Am J Gastroenterol", year: 2021, pmid: "33929377" },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("bleeding"),
    val("hpi", "form", "Form of the blood", "Was the blood vomited, passed as black tarry stool, or passed as fresh red blood per rectum?", ["vomited", "vomit", "haematemesis", "black", "tarry", "melaena", "melena", "fresh blood", "red blood", "per rectum", "on the paper", "mixed with stool", "coating"]),
    val("hpi", "colour_vomit", "Colour of vomit", "Was the vomit fresh red, or dark like coffee grounds?", ["fresh red", "bright red", "dark", "coffee ground", "coffee grounds", "brown", "clots", "colour"]),
    val("hpi", "amount", "Amount", "Roughly how much — a streak, a cupful, or more, and how many times?", ["streak", "streaks", "cupful", "cup", "glass", "bucket", "small amount", "large amount", "times", "episodes", "amount", "quantity"], { numeric: true }),
    yn("hpi", "retching_first", "Retching before blood", "Did forceful vomiting or retching without blood come first?", ["retching", "vomiting first", "vomited first", "forceful", "then blood", "after vomiting"]),
    val("hpi", "stool_details", "Stool details", "Are the stools black and sticky with a foul smell, or is red blood mixed with or on the surface of formed stool?", ["black", "sticky", "tarry", "foul", "smell", "mixed", "surface", "on the stool", "after passing", "formed", "loose", "mucus"]),
    yn("hpi", "abdominal_pain", "Abdominal pain", "Any abdominal pain — where, and its relation to meals?", ["abdominal pain", "epigastric", "pain abdomen", "burning", "before meals", "after meals", "at night", "hunger pain", "pain"]),
    yn("hpi", "giddiness_syncope", "Giddiness / fainting", "Any giddiness on standing, or fainting?", ["giddiness", "giddy", "fainting", "fainted", "syncope", "light headed", "dizziness", "collapsed", "blackout"]),
    val("hpi", "urine_output", "Urine output", "When was urine last passed, and how much?", ["urine", "passed urine", "urine output", "not passed urine", "less urine", "oliguria"]),
    yn("associated", "dyspepsia_history", "Prior dyspepsia / ulcer", "Any past acidity, ulcer, endoscopy, or H. pylori treatment?", ["acidity", "ulcer", "peptic", "endoscopy", "h pylori", "helicobacter", "gastritis", "dyspepsia", "heartburn"]),
    yn("associated", "liver_disease_features", "Liver disease features", "Any known liver disease, jaundice, abdominal swelling, or leg swelling?", ["liver disease", "cirrhosis", "cld", "jaundice", "ascites", "abdominal swelling", "leg swelling", "varices", "portal hypertension", "hepatitis"]),
    yn("associated", "weight_loss_dysphagia", "Weight loss / difficulty swallowing / early fullness", "Any weight loss, loss of appetite, difficulty swallowing, or feeling full early?", ["weight loss", "lost weight", "anorexia", "loss of appetite", "dysphagia", "difficulty swallowing", "early satiety", "full early", "lump"]),
    yn("associated", "bowel_habit_change", "Change in bowel habit", "Any recent change in bowel habit, diarrhoea, or mucus in the stool?", ["bowel habit", "diarrhoea", "diarrhea", "constipation", "mucus", "alternating", "urgency", "tenesmus"], { tier: "detailed" }),
    yn("associated", "nosebleed_cough_blood", "Nosebleed or coughed blood", "Any nosebleed or coughing up of blood that may have been swallowed?", ["nosebleed", "epistaxis", "coughed", "haemoptysis", "hemoptysis", "swallowed blood", "from the nose"], { tier: "detailed" }),
    yn("associated", "bleeding_elsewhere", "Bleeding elsewhere", "Any bleeding from gums, skin bruising, or in the urine (bleeding tendency)?", ["gums", "gum bleeding", "bruising", "bruises", "petechiae", "blood in urine", "haematuria", "bleeding tendency"], { tier: "detailed" }),
    yn("associated", "previous_bleeds", "Previous bleeds / transfusions", "Any previous episode of bleeding, endoscopy or transfusion?", ["previous", "before", "earlier", "transfusion", "transfused", "endoscopy", "banding", "recurrent"], { tier: "detailed" }),
    yn("associated", "fever", "Fever", "Any fever with the bleeding?", ["fever", "febrile", "temperature", "chills"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "large_volume_fresh", "Large-volume or fresh red bleed", "Was the bleed large in volume or fresh red, or repeated within hours?", ["large", "profuse", "bucket", "fresh red", "bright red", "repeated", "again", "continuous", "clots"], { teach: "Volume and colour are the bedside estimate of how fast the bleeding is; fresh red vomit or repeated bleeds mark an active source." }),
    yn("red_flag", "shock_symptoms", "Shock symptoms", "Any fainting, cold sweat, confusion, or very fast heartbeat?", ["fainted", "fainting", "syncope", "cold sweat", "sweating", "confused", "confusion", "drowsy", "palpitations", "racing", "collapse"], { teach: "Symptoms of hypovolaemia appear before the haemoglobin falls; the first count after a bleed is falsely reassuring." }),
    yn("red_flag", "anticoagulants_antiplatelets", "Blood thinners", "Is the patient on warfarin, newer anticoagulants, aspirin, clopidogrel, or heparin?", ["warfarin", "acitrom", "acenocoumarol", "anticoagulant", "blood thinner", "aspirin", "ecosprin", "clopidogrel", "heparin", "rivaroxaban", "apixaban", "dabigatran"], { teach: "Anticoagulation changes both the risk of continued bleeding and the first thing to reverse; the drug is found only by asking for every tablet." }),
    yn("red_flag", "nsaid_steroid_use", "Painkillers / steroids", "Any painkillers (diclofenac, ibuprofen, aspirin) or steroids in the past weeks, including from a chemist or a traditional healer?", ["nsaid", "painkiller", "pain killer", "diclofenac", "ibuprofen", "aspirin", "steroid", "prednisolone", "dexa", "chemist", "desi", "ayurvedic", "bhasma", "joint pain tablets"], { teach: "Over-the-counter painkillers and traditional preparations are the commonest cause of a bleeding ulcer on Indian wards and are rarely volunteered." }),
    yn("red_flag", "known_varices_cirrhosis", "Known cirrhosis / varices", "Is the patient known to have cirrhosis or varices?", ["cirrhosis", "varices", "portal hypertension", "cld", "chronic liver disease", "banding"], { teach: "A variceal bleed behaves and is treated differently from an ulcer bleed; the answer decides the first drug and the urgency of endoscopy." }),
    yn("red_flag", "elderly_comorbid", "Elderly / heart, kidney or liver disease", "Is the patient over 60, or known to have heart, kidney or liver disease?", ["elderly", "over 60", "years old", "heart disease", "heart failure", "ihd", "kidney disease", "ckd", "liver disease", "diabetes"], { teach: "Age and comorbidity are the components of every bleeding risk score; they decide whether the patient can wait for a morning endoscopy." }),
    yn("red_flag", "alcohol", "Alcohol", "Does the patient drink alcohol, how much, and was there a binge before the bleed?", ["alcohol", "alcoholic", "drinks", "drinking", "binge", "liquor", "daru", "desi"], { teach: "Alcohol links three causes at once: gastritis, a Mallory-Weiss tear after retching, and varices from cirrhosis." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    // Exposures
    yn("exposure", "iron_bismuth", "Iron tablets / bismuth / beetroot", "Is the patient taking iron tablets or bismuth, or ate beetroot (black or red stools without bleeding)?", ["iron", "iron tablets", "bismuth", "beetroot", "black stools after", "colour of stool"], { tier: "detailed" }),
    yn("exposure", "family_history_gi", "Family history of bowel cancer / bleeding disorder", "Any family history of bowel cancer or a bleeding disorder?", ["family history", "bowel cancer", "colon cancer", "haemophilia", "bleeding disorder"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "peptic_ulcer", name: "Peptic ulcer bleed", pointers: ["dyspepsia_history", "nsaid_steroid_use", "abdominal_pain", "form"], discriminators: ["dyspepsia_history", "nsaid_steroid_use", "abdominal_pain", "form", "colour_vomit", "alcohol", "known_varices_cirrhosis"] },
    { id: "varices", name: "Variceal bleed", pointers: ["known_varices_cirrhosis", "liver_disease_features", "large_volume_fresh", "alcohol"], discriminators: ["known_varices_cirrhosis", "liver_disease_features", "large_volume_fresh", "alcohol", "previous_bleeds", "abdominal_pain"] },
    { id: "erosive_gastritis", name: "Erosive gastritis (NSAID, alcohol, stress)", pointers: ["nsaid_steroid_use", "alcohol", "colour_vomit"], discriminators: ["nsaid_steroid_use", "alcohol", "colour_vomit", "amount", "dyspepsia_history"] },
    { id: "mallory_weiss", name: "Mallory-Weiss tear", pointers: ["retching_first", "alcohol"], discriminators: ["retching_first", "alcohol", "colour_vomit", "amount", "liver_disease_features"] },
    { id: "malignancy", name: "Upper GI malignancy", pointers: ["weight_loss_dysphagia", "colour_vomit"], discriminators: ["weight_loss_dysphagia", "duration", "dyspepsia_history", "amount", "family_history_gi"] },
    { id: "lower_gi", name: "Lower GI source (haemorrhoids, dysentery, colitis, colorectal cancer)", pointers: ["form", "stool_details", "bowel_habit_change"], discriminators: ["form", "stool_details", "bowel_habit_change", "weight_loss_dysphagia", "fever", "family_history_gi", "abdominal_pain"] },
    { id: "coagulopathy", name: "Coagulopathy / anticoagulant bleeding", pointers: ["anticoagulants_antiplatelets", "bleeding_elsewhere"], discriminators: ["anticoagulants_antiplatelets", "bleeding_elsewhere", "liver_disease_features", "fever", "family_history_gi"] },
    { id: "swallowed_blood", name: "Swallowed blood (nose or lung)", pointers: ["nosebleed_cough_blood"], discriminators: ["nosebleed_cough_blood", "colour_vomit", "abdominal_pain", "form"] },
    { id: "pseudo_melaena", name: "Black stool without bleeding (iron, bismuth)", pointers: ["iron_bismuth"], discriminators: ["iron_bismuth", "stool_details", "giddiness_syncope", "shock_symptoms"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "form", "colour_vomit", "amount", "retching_first", "stool_details", "abdominal_pain", "giddiness_syncope", "urine_output", "progression", "prior_treatment", "prior_investigations"],
  },
};
