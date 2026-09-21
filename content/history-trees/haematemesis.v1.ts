import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * HAEMATEMESIS / UPPER GI BLEEDING — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult medicine / surgical ward, north India. Two questions run in parallel: how much has been
 * lost and is the patient compensating, and where is it coming from. Differentials: peptic
 * ulcer, oesophageal or gastric varices, Mallory-Weiss tear, erosive gastritis (painkillers,
 * alcohol), gastric malignancy, coagulopathy, and swallowed blood from the nose or chest.
 */
export const haematemesisV1: HistoryTree = {
  id: "haematemesis",
  version: "1.0.0",
  complaint: "Vomiting of blood",
  triggers: ["haematemesis", "hematemesis", "vomiting blood", "vomited blood", "blood in vomit", "coffee ground vomit", "coffee ground", "khoon ki ulti", "upper gi bleed", "blood in vomitus"],
  setting: "Adult medicine / surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("The rational clinical examination. Is this patient hypovolemic?", 1999, "10086438"),
    rce("The rational clinical examination. Physical examination of the liver", 1994, "8196144"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("vomiting of blood"),
    val("hpi", "amount", "Amount of blood", "How much blood — streaks, a cupful, a bowlful, and how many times?", ["streaks", "cupful", "bowl", "glass", "large amount", "small amount", "how many times", "episodes", "profuse", "litres"], { numeric: true }),
    val("hpi", "appearance", "Appearance of the blood", "Was it fresh red blood, clots, or dark like coffee grounds?", ["fresh", "red", "bright red", "clots", "coffee ground", "dark", "black", "altered blood", "brown"]),
    yn("hpi", "retching_first", "Retching before the blood", "Was there forceful vomiting or retching of food first, with blood appearing only afterwards?", ["retching", "vomiting first", "food first", "after vomiting", "forceful", "strained to vomit", "then blood"]),
    yn("hpi", "melaena", "Black tarry stools", "Any black, tarry, foul-smelling stools?", ["black stools", "melaena", "malena", "tarry", "sticky stools", "foul smelling", "black motion"]),
    yn("hpi", "fresh_blood_stool", "Fresh blood per rectum", "Any fresh or maroon blood passed per rectum?", ["fresh blood", "maroon", "blood per rectum", "red blood in stool", "clots per rectum"], { tier: "detailed" }),
    yn("associated", "abdominal_pain", "Abdominal pain / dyspepsia", "Any epigastric pain, burning, or indigestion before this, and is it related to meals?", ["epigastric pain", "burning", "indigestion", "dyspepsia", "hunger pain", "after meals", "before meals", "night pain", "acidity"]),
    yn("associated", "giddiness_syncope", "Giddiness / fainting", "Any giddiness, fainting, or sweating, especially on sitting or standing up?", ["giddiness", "fainting", "syncope", "sweating", "on standing", "collapsed", "light headed", "cold sweat"]),
    yn("associated", "jaundice_swelling", "Yellow eyes / abdominal swelling / leg swelling", "Any yellowness of the eyes, swelling of the abdomen, or swelling of the legs?", ["jaundice", "yellow eyes", "abdominal distension", "ascites", "leg swelling", "pedal oedema", "dark urine"]),
    yn("associated", "confusion", "Confusion / drowsiness / sleep reversal", "Any confusion, irrelevant talk, drowsiness, or day-night sleep reversal?", ["confusion", "irrelevant talk", "drowsy", "day night reversal", "altered sensorium", "sleep reversal", "flapping"]),
    yn("associated", "weight_appetite_dysphagia", "Weight loss / appetite / difficulty swallowing", "Any weight loss, loss of appetite, early fullness, or difficulty swallowing?", ["weight loss", "loss of appetite", "early satiety", "full after", "difficulty swallowing", "dysphagia", "food sticking"]),
    yn("associated", "nose_throat_bleed", "Nose bleed / coughing blood / dental procedure", "Any nose bleed, bleeding gums, coughing of blood, or recent dental work?", ["nose bleed", "epistaxis", "bleeding gums", "coughing blood", "haemoptysis", "dental", "tooth extraction"], { tier: "detailed" }),
    yn("associated", "bleeding_elsewhere", "Bruising / bleeding elsewhere", "Any easy bruising, bleeding from other sites, or a known bleeding disorder?", ["bruising", "bleeding elsewhere", "petechiae", "bleeding disorder", "platelets", "gums", "haematuria"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "shock_features", "Giddiness on standing / cold clammy / low BP", "Any severe giddiness on sitting up, cold clammy skin, or a recorded low blood pressure?", ["severe giddiness", "on standing", "cold", "clammy", "low bp", "hypotension", "pulse fast", "shock", "unrecordable"], { teach: "Postural giddiness severe enough to stop the patient sitting up marks a large loss, and a normal lying blood pressure does not exclude it." }),
    yn("red_flag", "ongoing_large_bleed", "Large or continuing bleeding", "Is the bleeding large in volume, with clots, or still continuing?", ["large amount", "clots", "continuing", "still bleeding", "repeated", "several times", "profuse", "fresh blood"], { teach: "Volume and whether the bleeding has stopped set the pace of everything that follows." }),
    yn("red_flag", "known_liver_disease", "Known liver disease / alcohol / varices", "Any known liver disease, cirrhosis, hepatitis, heavy alcohol use, or previously diagnosed varices?", ["liver disease", "cirrhosis", "hepatitis", "alcohol", "varices", "portal hypertension", "hbv", "hcv", "banding", "endoscopy"], { teach: "Bleeding in known liver disease is treated as variceal from the outset, because that pathway and its timing differ from an ulcer." }),
    yn("red_flag", "nsaid_steroid_anticoagulant", "Painkillers / steroids / blood thinners", "Any painkillers, aspirin, steroids, or blood thinners in the recent weeks?", ["nsaid", "painkillers", "diclofenac", "ibuprofen", "aspirin", "steroid", "blood thinner", "warfarin", "clopidogrel", "anticoagulant"], { teach: "Painkillers and blood thinners both cause and worsen upper gut bleeding, and the patient rarely volunteers them without being asked." }),
    yn("red_flag", "previous_bleed_ulcer", "Previous bleed or ulcer", "Any previous episode of vomiting blood, black stools, or a known ulcer?", ["previous bleed", "previous episode", "known ulcer", "peptic ulcer", "black stools before", "endoscopy", "h pylori"], { teach: "A previous bleed names the likely source and raises the chance of another one." }),
    yn("red_flag", "chest_pain_breathless", "Chest pain / breathlessness", "Any chest pain or breathlessness with the bleeding?", ["chest pain", "breathlessness", "breathless", "angina", "palpitations"], { tier: "detailed", teach: "Blood loss strains a heart with narrowed arteries, and chest pain during a bleed changes the urgency." }),
    PREGNANCY,
    yn("exposure", "alcohol", "Alcohol", "How much alcohol, and when was the last drink?", ["alcohol", "drinking", "last drink", "daily", "binge", "desi", "whisky", "quarter"]),
    yn("exposure", "h_pylori_family_cancer", "Family history of ulcer or stomach cancer", "Any family history of peptic ulcer or stomach cancer?", ["family history", "ulcer", "stomach cancer", "gastric cancer", "father", "mother", "sibling"], { tier: "detailed" }),
    yn("exposure", "caustic_traditional", "Corrosive or traditional remedies", "Any corrosive substance swallowed, or traditional or herbal remedies taken?", ["corrosive", "acid", "caustic", "herbal", "ayurvedic", "traditional", "desi dawa", "swallowed"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "peptic_ulcer", name: "Peptic ulcer", pointers: ["abdominal_pain", "nsaid_steroid_anticoagulant", "previous_bleed_ulcer", "melaena"], discriminators: ["abdominal_pain", "nsaid_steroid_anticoagulant", "previous_bleed_ulcer", "appearance", "h_pylori_family_cancer"] },
    { id: "varices", name: "Oesophageal or gastric varices", pointers: ["known_liver_disease", "jaundice_swelling", "confusion", "alcohol"], discriminators: ["known_liver_disease", "jaundice_swelling", "confusion", "alcohol", "amount", "appearance"] },
    { id: "mallory_weiss", name: "Mallory-Weiss tear", pointers: ["retching_first"], discriminators: ["retching_first", "amount", "alcohol", "appearance"] },
    { id: "erosive_gastritis", name: "Erosive gastritis", pointers: ["nsaid_steroid_anticoagulant", "alcohol", "abdominal_pain"], discriminators: ["nsaid_steroid_anticoagulant", "alcohol", "abdominal_pain", "amount", "caustic_traditional"] },
    { id: "malignancy", name: "Gastric or oesophageal malignancy", pointers: ["weight_appetite_dysphagia", "h_pylori_family_cancer"], discriminators: ["weight_appetite_dysphagia", "h_pylori_family_cancer", "duration", "abdominal_pain", "appearance"] },
    { id: "coagulopathy", name: "Bleeding disorder / anticoagulation", pointers: ["bleeding_elsewhere", "nsaid_steroid_anticoagulant"], discriminators: ["bleeding_elsewhere", "nsaid_steroid_anticoagulant", "known_liver_disease"] },
    { id: "swallowed_blood", name: "Swallowed blood from nose or chest", pointers: ["nose_throat_bleed"], discriminators: ["nose_throat_bleed", "appearance", "amount", "melaena"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "amount", "appearance", "retching_first", "melaena", "fresh_blood_stool", "progression", "prior_treatment", "prior_investigations"],
  },
};
