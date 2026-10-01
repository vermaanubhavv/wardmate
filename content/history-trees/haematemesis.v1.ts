import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * HAEMATEMESIS / UPPER GI BLEEDING — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Adult medicine / surgical ward, north India. Two questions run in parallel: how much has been
 * lost and is the patient compensating, and where is it coming from. Differentials: peptic
 * ulcer, oesophageal or gastric varices, Mallory-Weiss tear, erosive gastritis (painkillers,
 * alcohol), gastric malignancy, coagulopathy, and swallowed blood from the nose or chest.
 */
export const haematemesisV1: HistoryTree = {
  id: "haematemesis",
  version: "1.2.0",
  complaint: "Vomiting of blood",
  triggers: ["haematemesis", "hematemesis", "vomiting blood", "vomited blood", "blood in vomit", "coffee ground vomit", "coffee ground", "khoon ki ulti", "upper gi bleed", "blood in vomitus"],
  setting: "Adult medicine / surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    DAS_CLINICAL_SURGERY,
    HAMILTON_BAILEY,
    BAILEY_LOVE,
    SABISTON,
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
    yn("associated", "jaundice_swelling", "Yellow eyes / abdominal swelling / leg swelling", "Any yellowness of the eyes, swelling of the abdomen, or swelling of the legs?", ["jaundice", "yellow eyes", "abdominal distension", "ascites", "leg swelling", "pedal oedema", "dark urine"]),
    yn("red_flag", "confusion", "Confusion / drowsiness / sleep reversal", "Any confusion, irrelevant talk, drowsiness, or day-night sleep reversal?", ["confusion", "irrelevant talk", "drowsy", "day night reversal", "altered sensorium", "sleep reversal", "flapping"]),
    yn("associated", "weight_appetite_dysphagia", "Weight loss / appetite / difficulty swallowing", "Any weight loss, loss of appetite, early fullness, or difficulty swallowing?", ["weight loss", "loss of appetite", "early satiety", "full after", "difficulty swallowing", "dysphagia", "food sticking"]),
    yn("associated", "nose_throat_bleed", "Nose bleed / coughing blood / dental procedure", "Any nose bleed, bleeding gums, coughing of blood, or recent dental work?", ["nose bleed", "epistaxis", "bleeding gums", "coughing blood", "haemoptysis", "dental", "tooth extraction"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "shock_features", "Giddiness on standing / cold clammy / low BP", "Any severe giddiness on sitting up, cold clammy skin, or a recorded low blood pressure?", ["severe giddiness", "on standing", "cold", "clammy", "low bp", "hypotension", "pulse fast", "shock", "unrecordable"], { teach: "Postural giddiness severe enough to stop the patient sitting up marks a large loss, and a normal lying blood pressure does not exclude it." }),
    yn("red_flag", "ongoing_large_bleed", "Large or continuing bleeding", "Is the bleeding large in volume, with clots, or still continuing?", ["large amount", "clots", "continuing", "still bleeding", "repeated", "several times", "profuse", "fresh blood"], { teach: "Volume and whether the bleeding has stopped set the pace of everything that follows." }),
    yn("red_flag", "known_liver_disease", "Known liver disease / alcohol / varices", "Any known liver disease, cirrhosis, hepatitis B or C, or previously diagnosed varices?", ["liver disease", "cirrhosis", "hepatitis", "alcohol", "varices", "portal hypertension", "hbv", "hcv", "banding", "endoscopy"], { teach: "Bleeding in known liver disease is taken as variceal until endoscopy shows otherwise, because that pathway and its timing differ from an ulcer." }),
    yn("exposure", "nsaid_steroid_anticoagulant", "Painkillers / steroids / blood thinners", "Has the patient taken painkillers, including aspirin, or steroids in the recent weeks?", ["nsaid", "painkillers", "diclofenac", "ibuprofen", "aspirin", "steroid", "blood thinner", "warfarin", "clopidogrel", "anticoagulant"], { teach: "Painkillers and blood thinners both cause and worsen upper gut bleeding, and the patient rarely volunteers them without being asked." }),
    yn("associated", "previous_bleed_ulcer", "Previous bleed or ulcer", "Any previous episode of vomiting blood, black stools, or a known ulcer?", ["previous bleed", "previous episode", "known ulcer", "peptic ulcer", "black stools before", "endoscopy", "h pylori"], { teach: "A previous bleed names the likely source and raises the chance of another one." }),
    yn("red_flag", "chest_pain_breathless", "Chest pain / breathlessness", "Any chest pain or breathlessness with the bleeding?", ["chest pain", "breathlessness", "breathless", "angina", "palpitations"], { teach: "Blood loss strains a heart with narrowed arteries, and chest pain during a bleed changes the urgency." }),
    PREGNANCY,
    val("exposure", "alcohol", "Alcohol", "How much alcohol, and when was the last drink?", ["alcohol", "drinking", "last drink", "daily", "binge", "desi", "whisky", "quarter"]),
    yn("exposure", "h_pylori_family_cancer", "Family history of ulcer or stomach cancer", "Any family history of peptic ulcer or stomach cancer?", ["family history", "ulcer", "stomach cancer", "gastric cancer", "father", "mother", "sibling"], { tier: "detailed" }),
    yn("exposure", "caustic_traditional", "Corrosive or traditional remedies", "Any corrosive substance swallowed, or traditional or herbal remedies taken?", ["corrosive", "acid", "caustic", "herbal", "ayurvedic", "traditional", "desi dawa", "swallowed"], { tier: "detailed" }),
    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    yn("exposure", "iron_bismuth", "Iron or bismuth tablets", "Is the patient taking iron or bismuth tablets that could blacken the stool?", ["iron tablets", "iron", "bismuth", "haematinic", "black stools from iron", "no iron"], { tier: "detailed", teach: "Das points out that iron and bismuth blacken the stool, which is formed and not sticky, unlike true melaena." }),
    yn("exposure", "smoking", "Smoking", "Does the patient smoke, and how much?", ["smoking", "smoker", "smokes", "bidi", "cigarette", "tobacco", "non smoker", "no smoking"], { tier: "detailed", teach: "Das records smoking in every abdominal case because it bears on peptic ulcer and its perforation." }),
    val("hpi", "pain_periodicity", "Periodicity of earlier pain", "Did the earlier stomach pain come in spells with pain-free months, and has that pattern changed to constant pain?", ["spells", "pain free months", "seasonal", "periodicity", "now constant", "lost periodicity", "never had pain"], { tier: "detailed", teach: "Das treats loss of the old periodic pattern of ulcer pain as a reason to think beyond a simple ulcer." }),
    yn("associated", "stale_food_vomiting", "Vomiting of food eaten long before", "Has the patient vomited large amounts containing food eaten many hours or a day earlier?", ["undigested food", "food eaten yesterday", "stale food", "copious vomiting", "projectile", "evening vomiting", "no such vomiting"], { tier: "detailed", teach: "Das reads vomit containing the previous day's food as a sign of an outlet blocked by an ulcer or a growth." }),
    val("exposure", "dietary_habit", "Dietary habit", "Are the meals regular, and is the food usually very spicy?", ["irregular meals", "skips meals", "odd hours", "spicy food", "chillies", "tea", "coffee", "regular meals"], { tier: "detailed", teach: "Das notes that peptic ulcer patients commonly keep irregular, spicy meals." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("exposure", "stress_illness", "Burn, head injury or serious illness", "Is the patient being treated for a burn, a head injury or another serious illness?", ["burns", "head injury", "icu", "ventilator", "sepsis", "major surgery", "critically ill", "no serious illness"], { tier: "detailed", teach: "Hamilton Bailey lists burns, head injury and other severe stress among the causes of stomach and duodenal ulceration." }),
    yn("exposure", "kidney_failure", "Kidney failure", "Is there known kidney failure, or is the patient on dialysis?", ["kidney failure", "renal failure", "ckd", "dialysis", "high creatinine", "no kidney disease"], { tier: "detailed", teach: "Hamilton Bailey lists kidney failure among the illnesses to ask about when bleeding may come from a clotting fault." }),
    yn("exposure", "recent_abdominal_injury", "Abdominal injury in recent weeks", "Was there an injury to the abdomen in the weeks before the bleeding?", ["injury", "blow to abdomen", "accident", "fall", "liver injury", "trauma", "no injury"], { tier: "detailed", teach: "Hamilton Bailey notes that a liver injury can bleed into the bile ducts weeks later, with upper gut bleeding, right upper pain and jaundice." }),
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("red_flag", "aortic_graft", "Previous aortic operation or graft", "Has the patient had an operation on the aorta, or a graft or stent for an aneurysm?", ["aortic graft", "aortic surgery", "aneurysm repair", "aneurysm", "stent graft", "evar", "no aortic surgery"], { teach: "Schwartz asks that a fistula between an aortic graft and the gut be considered in every patient with a graft who bleeds; a small first bleed can precede a torrential one." }),
    IMMUNOCOMPROMISE,
    ...surgicalBackground({ acute: true, omit: ["surg_weight_loss"], detailed: ["surg_anaesthetic_problem", "surg_exercise_tolerance"] }),
  ],
  differentials: [
    { id: "peptic_ulcer", name: "Peptic ulcer", pointers: ["abdominal_pain", "nsaid_steroid_anticoagulant", "previous_bleed_ulcer", "melaena"], discriminators: ["abdominal_pain", "nsaid_steroid_anticoagulant", "previous_bleed_ulcer", "appearance", "h_pylori_family_cancer", "smoking", "pain_periodicity", "stale_food_vomiting", "dietary_habit", "stress_illness"] },
    { id: "varices", name: "Oesophageal or gastric varices", pointers: ["known_liver_disease", "jaundice_swelling", "confusion", "alcohol"], discriminators: ["known_liver_disease", "jaundice_swelling", "confusion", "alcohol", "amount", "appearance"] },
    { id: "mallory_weiss", name: "Mallory-Weiss tear", pointers: ["retching_first"], discriminators: ["retching_first", "amount", "alcohol", "appearance"] },
    { id: "erosive_gastritis", name: "Erosive gastritis", pointers: ["nsaid_steroid_anticoagulant", "alcohol", "abdominal_pain"], discriminators: ["nsaid_steroid_anticoagulant", "alcohol", "abdominal_pain", "amount", "caustic_traditional", "stress_illness"] },
    { id: "malignancy", name: "Gastric or oesophageal malignancy", pointers: ["weight_appetite_dysphagia", "h_pylori_family_cancer"], discriminators: ["weight_appetite_dysphagia", "h_pylori_family_cancer", "duration", "abdominal_pain", "appearance", "pain_periodicity", "stale_food_vomiting"] },
    { id: "coagulopathy", name: "Bleeding disorder / anticoagulation", pointers: ["surg_bleeding_tendency", "nsaid_steroid_anticoagulant", "surg_blood_thinners"], discriminators: ["surg_bleeding_tendency", "nsaid_steroid_anticoagulant", "known_liver_disease", "kidney_failure"] },
    { id: "swallowed_blood", name: "Swallowed blood from nose or chest", pointers: ["nose_throat_bleed"], discriminators: ["nose_throat_bleed", "appearance", "amount", "melaena"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "amount", "appearance", "retching_first", "melaena", "fresh_blood_stool", "progression", "prior_treatment", "prior_investigations"],
  },
};
