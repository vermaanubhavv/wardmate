import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, PREGNANCY, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * LUMP IN THE ABDOMEN — v1.0.0. CLINICAL CONTENT: PENDING REVIEW.
 * Adult general surgery ward, north India. Built from S. Das, A Manual on Clinical Surgery,
 * 13th ed., ch. 35 "Examination of an abdominal lump", whose history section points back to the
 * swelling (ch. 3), chronic abdominal (ch. 34) and urinary (ch. 37) chapters. `lump` is the
 * superficial lump; this is the lump inside the abdomen, where the region and the gut, biliary,
 * urinary and gynaecological symptoms carry the history. docs/surgical-history.md §10.
 *
 * The urinary slot rests on ch. 35's pointer to ch. 37 rather than on ch. 35 itself. No aortic
 * aneurysm differential: Das gives only examination signs for it.
 */
export const abdominalLumpV1: HistoryTree = {
  id: "abdominal_lump",
  version: "1.0.0",
  complaint: "Lump in the abdomen",
  triggers: ["abdominal lump", "lump in abdomen", "lump abdomen", "lump in the abdomen", "abdominal mass", "mass abdomen", "mass in abdomen", "lump in stomach", "lump in right iliac fossa", "lump in left iliac fossa", "epigastric lump"],
  setting: "Adult general surgery ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, BAILEY_LOVE],
  slots: [
    ...commonHpi("lump in the abdomen"),
    val("hpi", "site", "Site", "Where in the abdomen is the lump, and where did it first appear?", ["right hypochondrium", "epigastrium", "epigastric", "left hypochondrium", "right lumbar", "left lumbar", "umbilical", "around the umbilicus", "right iliac fossa", "rif", "left iliac fossa", "hypogastrium", "suprapubic", "loin", "flank", "site"], { teach: "Das builds the whole differential of an abdominal lump region by region, and the patient may know where a large lump began." }),
    val("hpi", "first_noticed", "How it was noticed", "How was the lump first noticed — by chance, by someone else, or because of pain?", ["noticed by chance", "accidentally", "while bathing", "someone noticed", "doctor found", "felt it", "because of pain", "first noticed"], { teach: "Das warns that a lump noticed casually, without pain, deserves more careful examination than a painful one." }),
    val("hpi", "growth", "Growth", "Has the lump grown since it was noticed, how quickly, and did it suddenly enlarge after staying the same?", ["grown", "growing", "increasing in size", "rapidly", "slowly", "same size", "static", "suddenly increased", "smaller", "decreased"], { teach: "Das reads slow growth, rapid growth, sudden enlargement after a static phase and shrinkage as pointing in different directions." }),
    val("hpi", "pain_sequence", "Pain before or after the lump", "Did pain come before the lump appeared, or did the lump come first?", ["pain first", "pain before", "lump first", "pain came later", "painless", "no pain"], { teach: "Das stresses that in inflammation pain precedes the swelling, while most growths are painless to begin with." }),
    yn("hpi", "pain", "Pain in the lump", "Is the lump painful?", ["pain", "painful", "tender", "dull ache", "dragging", "colicky", "throbbing", "painless"]),
    yn("hpi", "reducible", "Comes out on standing or coughing", "Does the lump come out on standing or coughing and go back on lying down?", ["comes out on coughing", "on standing", "goes back", "disappears on lying down", "reducible", "cough impulse", "does not go back"], { teach: "Das lists hernias through the abdominal wall, including through an old scar, among lumps that come and go." }),
    yn("associated", "appetite", "Appetite", "Any loss of appetite?", ["loss of appetite", "anorexia", "not eating", "eats less", "no loss of appetite"]),
    yn("associated", "fever_evening", "Fever / evening rise", "Any fever, especially in the evening?", ["fever", "evening rise", "evening fever", "night sweats", "temperature", "no fever"], { teach: "Das links evening fever with a lump to tuberculous glands or bowel, and fever generally to an inflammatory mass." }),
    yn("associated", "stale_food_vomiting", "Vomiting of food eaten long before", "Any vomiting, and does it contain food eaten many hours earlier?", ["vomiting", "undigested food", "food eaten yesterday", "copious vomiting", "projectile", "no vomiting"], { teach: "Das reads stale-food vomiting as an outlet blocked at the pylorus, where an upper abdominal lump may sit." }),
    yn("associated", "bowel_change", "Change in bowel habit", "Any change in bowel habit — increasing constipation, or constipation alternating with loose stools?", ["constipation", "increasing constipation", "loose stools", "diarrhoea", "alternating", "change in bowel habit", "no change in bowel habit"], { teach: "Das names alternating constipation and diarrhoea, or rising constipation, as the bowel change that goes with a colonic growth." }),
    yn("associated", "blood_mucus_stool", "Blood or mucus in stool", "Any blood or mucus passed with the stool?", ["blood in stool", "mucus", "slime", "red currant jelly", "jelly like", "bleeding per rectum", "no blood in stool"], { teach: "Das links red-currant-jelly stool with a colicky lump to intussusception, and rectal bleeding to colonic disease." }),
    yn("associated", "jaundice", "Jaundice / itching / pale stools", "Any yellowness of the eyes, itching, or pale stools?", ["jaundice", "yellow eyes", "itching", "pruritus", "pale stools", "clay coloured", "dark urine", "no jaundice"]),
    yn("associated", "pallor", "Pallor / tiredness", "Any pallor, tiredness, or breathlessness on exertion?", ["pale", "pallor", "anaemia", "anaemic", "tired", "weakness", "breathless on exertion", "low hb"], { teach: "Das lists anaemia among the features of a caecal or colonic growth and of an enlarged spleen." }),
    yn("associated", "urinary", "Urinary symptoms", "Any blood in the urine, loin pain, or difficulty passing urine?", ["blood in urine", "haematuria", "hematuria", "loin pain", "difficulty passing urine", "retention", "poor stream", "no urinary complaints"]),
    yn("associated", "heavy_periods", "Heavy periods", "In a woman, are the periods heavy or prolonged?", ["heavy periods", "menorrhagia", "prolonged periods", "clots", "irregular periods", "normal periods"], { tier: "detailed", teach: "Das ties heavy periods with an irregular pelvic lump in a woman before menopause to fibroid." }),
    yn("associated", "other_lumps", "Other lumps", "Any other lump — above the collarbone, in the groin, or a swelling of the testis?", ["neck lump", "above collarbone", "supraclavicular", "groin lump", "testis swelling", "scrotal swelling", "other swellings", "no other lumps"], { tier: "detailed", teach: "Das asks about other lumps and looks at the left supraclavicular fossa and scrotum, because spread or a testicular primary can present as an abdominal lump." }),
    // Red flags
    yn("red_flag", "weight_loss", "Weight loss", "Has the patient lost weight without trying?", ["weight loss", "lost weight", "clothes loose", "thin", "no weight loss"], { teach: "Das notes marked, progressive weight loss with gut carcinoma, which raises the urgency of the lump's assessment." }),
    yn("red_flag", "obstruction", "Stool and flatus stopped", "Has the patient stopped passing stool and flatus, with colicky pain and vomiting?", ["not passing stool", "no flatus", "absolute constipation", "obstipation", "colicky pain", "vomiting", "distension"], { teach: "Das lists obstruction as a presentation of intussusception, mesenteric cysts and retroperitoneal growths." }),
    yn("red_flag", "fever_rigor", "High fever with rigors", "Any high fever with chills and rigors?", ["rigors", "chills", "shivering", "high fever", "spiking fever"], { teach: "Das links rigors with a liver lump or jaundice to pus — liver abscess, cholangitis or portal pyaemia." }),
    yn("red_flag", "gi_bleed", "Vomiting blood / black stools", "Any vomiting of blood or black tarry stools?", ["vomiting blood", "haematemesis", "hematemesis", "coffee ground", "melaena", "malena", "black stools", "tarry"], { teach: "Das links coffee-ground vomiting with an epigastric lump to slow bleeding from a gastric growth or ulcer." }),
    yn("red_flag", "fainting", "Fainting or giddiness", "Any sudden fainting or giddiness?", ["fainting", "fainted", "giddiness", "collapse", "light headed", "cold sweat"], { teach: "Das notes that a lump beside the uterus after a missed period can follow a slow tubal leak, and fainting marks blood loss." }),
    PREGNANCY,
    // Exposures
    yn("exposure", "alcohol", "Alcohol", "Any alcohol use, and how much?", ["alcohol", "drinks", "drinker", "daily drinking", "binge", "no alcohol", "teetotaller"]),
    yn("exposure", "smoking", "Smoking", "Does the patient smoke, and how much?", ["smoking", "smoker", "bidi", "cigarette", "tobacco", "non smoker"], { tier: "detailed" }),
    yn("exposure", "abdominal_injury", "Injury to the abdomen", "Any injury to the abdomen before the lump appeared?", ["injury", "blow to abdomen", "fall", "accident", "trauma", "kicked", "no injury"], { teach: "Das lists a pancreatic pseudocyst, an iliac abscess and a rectus sheath haematoma as lumps that follow injury." }),
    yn("exposure", "amoebic_dysentery", "Past dysentery", "Any past attack of dysentery with blood and mucus?", ["dysentery", "amoebic", "amoebiasis", "blood and mucus", "no dysentery"], { tier: "detailed", teach: "Das asks about dysentery months or years earlier when a tender right upper lump suggests a liver abscess." }),
    yn("exposure", "urticaria", "Past attacks of hives", "Any past attacks of itchy wheals over the body?", ["urticaria", "hives", "itchy wheals", "allergic rash", "no urticaria"], { tier: "detailed", teach: "Das cites a history of urticaria as a clue to a hydatid cyst of the liver." }),
    yn("exposure", "worms", "Worms passed", "Has the patient ever passed worms in the stool or vomit?", ["worms", "roundworm", "passed worms", "worm in vomit", "no worms"], { tier: "detailed", teach: "Das notes that roundworm impaction forms a right iliac lump and that the patient often reports passing worms." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("exposure", "previous_cancer", "Earlier cancer", "Has the patient ever been treated for a cancer, and where?", ["cancer", "malignancy", "treated for cancer", "chemotherapy", "radiotherapy", "operated for cancer", "tumour", "no cancer"], { teach: "Hamilton Bailey asks about a known cancer because spread to the liver or nodes may be what is felt as the lump." }),
    yn("associated", "postmenopausal_bleeding", "Bleeding after menopause", "In a woman past menopause, has there been any bleeding per vaginum?", ["postmenopausal bleeding", "bleeding after menopause", "bleeding per vaginum", "spotting", "no bleeding after menopause"], { tier: "detailed", teach: "Hamilton Bailey pairs bleeding after menopause, a growing girth and weight loss as the history that points toward a uterine or ovarian cancer." }),
    yn("exposure", "past_malaria", "Past malaria", "Has the patient had malaria, or repeated fevers with chills, in the past?", ["malaria", "fever with chills", "repeated fevers", "antimalarial", "no malaria"], { tier: "detailed", teach: "Hamilton Bailey notes that the spleen enlarges over days in malaria and can stay enlarged in people living where malaria is common." }),
    ...surgicalBackground({ omit: ["surg_weight_loss"] }),
  ],
  differentials: [
    { id: "liver", name: "Liver lump (abscess, hydatid cyst, tumour)", pointers: ["fever_rigor", "amoebic_dysentery", "urticaria", "jaundice"], discriminators: ["site", "fever_rigor", "amoebic_dysentery", "urticaria", "jaundice", "alcohol", "weight_loss", "previous_cancer"] },
    { id: "gallbladder", name: "Gallbladder / biliary lump", pointers: ["jaundice", "fever_rigor"], discriminators: ["jaundice", "fever_rigor", "pain", "site", "surg_past_illnesses"] },
    { id: "gastric", name: "Stomach / pyloric growth", pointers: ["stale_food_vomiting", "appetite", "weight_loss"], discriminators: ["stale_food_vomiting", "appetite", "weight_loss", "gi_bleed", "pallor", "site"] },
    { id: "colonic", name: "Colonic growth (caecum, transverse, sigmoid)", pointers: ["bowel_change", "pallor", "blood_mucus_stool", "weight_loss"], discriminators: ["bowel_change", "blood_mucus_stool", "pallor", "appetite", "weight_loss", "obstruction", "surg_family_illness"] },
    { id: "ileocaecal_tb_crohn", name: "Ileocaecal tuberculosis / Crohn's", pointers: ["fever_evening", "bowel_change", "weight_loss"], discriminators: ["fever_evening", "bowel_change", "weight_loss", "pain", "surg_past_illnesses"] },
    { id: "appendicular", name: "Appendicular mass / abscess", pointers: ["pain_sequence", "fever_evening"], discriminators: ["pain_sequence", "site", "pain", "duration", "fever_evening"] },
    { id: "intussusception", name: "Intussusception", pointers: ["blood_mucus_stool", "obstruction"], discriminators: ["blood_mucus_stool", "obstruction", "pain", "site"] },
    { id: "pseudocyst", name: "Pancreatic pseudocyst", pointers: ["abdominal_injury", "alcohol", "surg_past_illnesses"], discriminators: ["abdominal_injury", "alcohol", "surg_past_illnesses", "site", "stale_food_vomiting"] },
    { id: "spleen", name: "Enlarged spleen", pointers: ["pallor", "jaundice"], discriminators: ["pallor", "jaundice", "fever_evening", "site", "surg_family_illness", "surg_bleeding_tendency", "past_malaria"] },
    { id: "lymph_nodes", name: "Lymph node mass (tuberculous, lymphoma, secondaries)", pointers: ["other_lumps", "fever_evening", "weight_loss"], discriminators: ["other_lumps", "fever_evening", "weight_loss", "growth", "previous_cancer"] },
    { id: "renal_bladder", name: "Kidney or bladder swelling", pointers: ["urinary"], discriminators: ["urinary", "site", "pain"] },
    { id: "pelvic_gynae", name: "Uterine / ovarian / tubal swelling", pointers: ["pregnancy", "heavy_periods"], discriminators: ["pregnancy", "heavy_periods", "fainting", "site", "growth", "postmenopausal_bleeding"] },
    { id: "parietal", name: "Abdominal-wall swelling (hernia, haematoma)", pointers: ["reducible", "abdominal_injury"], discriminators: ["reducible", "abdominal_injury", "pain", "site", "surg_previous_operations"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site", "first_noticed", "growth", "pain_sequence", "pain", "reducible", "progression", "prior_treatment", "prior_investigations"],
  },
};
