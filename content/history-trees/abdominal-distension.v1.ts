import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, HUTCHISONS, MACLEODS, PREGNANCY, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * ABDOMINAL DISTENSION — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Adult surgical / medicine ward, north India. The classical "five Fs": fluid, flatus, faeces,
 * fat, foetus (and a mass). Differentials: ascites (portal hypertension, tuberculous, malignant,
 * cardiac, nephrotic), intestinal obstruction, organomegaly or a mass, urinary retention,
 * pregnancy, obesity.
 */
export const abdominalDistensionV1: HistoryTree = {
  id: "abdominal_distension",
  version: "1.2.0",
  complaint: "Abdominal distension",
  triggers: ["abdominal distension", "distension of abdomen", "distended abdomen", "swelling of abdomen", "abdominal swelling", "bloating", "bloated", "increased abdominal girth", "swollen abdomen", "belly swelling"],
  setting: "Adult surgical / medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, MACLEODS, HUTCHISONS, BAILEY_LOVE, SABISTON],
  slots: [
    ...commonHpi("abdominal distension"),
    val("hpi", "pattern", "Constant or intermittent", "Is the distension constant, or does it come and go with meals or through the day?", ["constant", "intermittent", "after meals", "worse in evening", "comes and goes", "throughout the day", "gradual"]),
    val("hpi", "girth", "Change in girth", "By how much has the belly grown — clothes tight, belt notches, measured girth?", ["clothes tight", "belt", "girth", "measured", "notch", "increased size", "trousers", "saree"]),
    yn("associated", "pain", "Abdominal pain", "Any abdominal pain, and is it colicky?", ["pain", "colicky", "cramps", "abdominal pain"]),
    yn("associated", "vomiting", "Vomiting", "Any vomiting, and is it bilious or faeculent?", ["vomiting", "vomit", "bilious", "faeculent"]),
    yn("associated", "leg_swelling", "Swelling of legs / face", "Any swelling of the legs or face?", ["swelling", "pedal oedema", "oedema", "edema", "puffiness", "leg swelling"]),
    yn("associated", "jaundice", "Yellowness of eyes", "Any yellowness of the eyes or dark urine?", ["jaundice", "yellow eyes", "yellowness", "dark urine", "icterus"]),
    yn("associated", "breathlessness", "Breathlessness / orthopnoea", "Any breathlessness, especially lying flat?", ["breathlessness", "breathless", "orthopnoea", "lying flat", "pnd"]),
    yn("associated", "fever_sweats", "Fever / night sweats", "Any fever or night sweats?", ["fever", "night sweats", "evening rise", "chills"]),
    yn("associated", "appetite_weight", "Appetite / weight", "Any loss of appetite, or weight loss with a growing belly?", ["appetite", "weight loss", "lost weight", "loss of weight", "thin limbs"]),
    yn("associated", "menstrual_pregnancy", "Missed periods / menstrual change", "In a woman, any missed periods or change in periods?", ["missed periods", "amenorrhoea", "lmp", "pregnant", "menstrual", "heavy periods"], { tier: "detailed" }),
    yn("associated", "gas_belching", "Belching / passing gas / food-related", "Is it related to food, with belching, passing gas, or intolerance of milk or wheat?", ["belching", "gas", "flatulence", "milk", "wheat", "lactose", "after meals"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "obstruction", "Absolute constipation with vomiting", "Has the patient stopped passing both stool and flatus?", ["no stool", "no flatus", "absolute constipation", "vomiting", "colicky", "obstipation"], { teach: "A swollen abdomen with vomiting and no stool or flatus is the pattern of obstruction, where timing decides the outcome." }),
    yn("red_flag", "acute_pain_fever", "Severe pain with fever", "Is there severe abdominal pain with fever or a rigid abdomen?", ["severe pain", "fever", "rigid", "peritonitis", "worst pain", "guarding"], { teach: "Fever with sudden severe pain and a swollen abdomen asks about infection of the fluid or a hollow organ leak." }),
    yn("red_flag", "gi_bleed", "Vomiting blood / black stools", "Any vomiting of blood or black stools?", ["haematemesis", "vomiting blood", "melaena", "black stools", "hematemesis", "coffee ground"], { teach: "Vomiting blood with a swollen abdomen asks about portal hypertension and varices." }),
    yn("red_flag", "confusion", "Confusion / drowsiness", "Any confusion, day-night reversal, or drowsiness?", ["confusion", "drowsy", "day night reversal", "altered sensorium", "irrelevant talk", "sleep reversal"], { teach: "Confusion with a swollen abdomen in liver disease points to a brain effect of liver failure." }),
    yn("associated", "weight_loss_mass", "Lump felt / early fullness", "Has the patient felt a lump in the abdomen, or felt full after a few mouthfuls?", ["weight loss", "lump", "mass", "early satiety", "full after", "hard lump"], { teach: "Weight loss with progressive swelling raises a mass or a malignancy-related collection." }),
    yn("red_flag", "urinary_retention", "Not passing urine", "Has the patient not passed urine for many hours, with lower abdominal fullness?", ["not passing urine", "retention", "no urine", "lower abdominal fullness", "full bladder"], { teach: "A tense lower swelling with no urine raises a bladder question before an abdominal one." }),
    PREGNANCY,
    yn("exposure", "alcohol_liver", "Alcohol / hepatitis / liver disease", "Any alcohol, past hepatitis, or known liver disease?", ["alcohol", "hepatitis", "liver disease", "cirrhosis", "jaundice", "hbv", "hcv", "drinker"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"]),
    yn("exposure", "cardiac_renal", "Known heart or kidney disease", "Any known heart failure, kidney disease, or nephrotic syndrome?", ["heart failure", "cardiac", "kidney disease", "ckd", "nephrotic", "renal", "protein in urine"], { tier: "detailed" }),
    yn("exposure", "previous_surgery", "Previous abdominal surgery", "Any previous abdominal surgery or hernia?", ["surgery", "operation", "laparotomy", "hernia", "adhesions"], { tier: "detailed" }),
    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    yn("red_flag", "pain_became_constant", "Colicky pain turned constant", "Has colicky pain changed to a constant, burning pain?", ["became constant", "now constant", "continuous pain", "burning pain", "was colicky", "no longer comes and goes"], { teach: "Das warns that colic of obstruction turning constant is the change seen when the blood supply of the gut is threatened." }),
    yn("red_flag", "blood_mucus_stool", "Blood and mucus per rectum", "Any fresh blood or mucus passed per rectum with the distension?", ["blood per rectum", "blood and mucus", "mucus in stool", "red currant jelly", "jelly like stool", "bloody stool", "no blood in stool"], { teach: "Das reads blood and mucus with obstructive pain as a pointer to intussusception or a strangulated or thrombosed gut." }),
    val("hpi", "vomiting_timing", "When vomiting began", "Did vomiting start together with the pain, some hours later, or only after the belly swelled?", ["with the pain", "same time", "hours later", "later", "after distension", "late", "no vomiting"], { tier: "detailed", teach: "Das uses the timing of vomiting against pain to judge how high in the gut a blockage lies." }),
    yn("hpi", "laxative_escalation", "Needing more and more laxatives", "Has the patient needed more and more laxative to open the bowels?", ["more laxatives", "increasing laxatives", "purgatives", "needs laxative daily", "laxative not working", "no laxatives"], { tier: "detailed", teach: "Das names constipation needing ever more purgatives as the presenting symptom of a narrowing growth in the left colon." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("exposure", "previous_cancer", "Earlier cancer", "Has the patient ever been treated for a cancer, and where?", ["cancer", "malignancy", "treated for cancer", "chemotherapy", "radiotherapy", "operated for cancer", "tumour", "no cancer"], { teach: "Hamilton Bailey asks about a known cancer because spread to the peritoneum explains new fluid or a blocked bowel in such a patient." }),
    yn("associated", "postmenopausal_bleeding", "Bleeding after menopause", "In a woman past menopause, has there been any bleeding per vaginum?", ["postmenopausal bleeding", "bleeding after menopause", "bleeding per vaginum", "spotting", "no bleeding after menopause"], { tier: "detailed", teach: "Hamilton Bailey pairs bleeding after menopause, a growing girth and weight loss as the history that points toward a pelvic cancer." }),
    yn("hpi", "previous_attacks", "Earlier attacks that settled", "Has the belly swollen up like this before and settled on its own?", ["similar attacks", "happened before", "previous episodes", "settled on its own", "relieved by passing gas", "first time", "no previous attacks"], { tier: "detailed", teach: "Hamilton Bailey reads earlier attacks of pain, swelling and constipation that went away as earlier twists of the sigmoid colon that untwisted." }),
    yn("hpi", "meal_after_fast", "Large meal after a fast", "Did the swelling begin after a large meal following a religious fast?", ["after fasting", "broke fast", "after roza", "after vrat", "navratri", "large meal", "heavy meal", "no fasting"], { tier: "detailed", teach: "Hamilton Bailey lists a large meal after religious fasting among the triggers of sigmoid volvulus." }),
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("exposure", "ileus_setting", "Began in hospital, after an operation, or on morphine-type drugs", "Did the swelling begin while in hospital — after an operation or injury, during bed rest, or while on morphine-type pain medicines?", ["in hospital", "after operation", "post-operative", "bed rest", "bedridden", "morphine", "tramadol", "opioid", "after injury", "after caesarean"], { tier: "detailed", teach: "Schwartz describes colonic pseudo-obstruction in patients already in hospital, on narcotics or bed rest, where the colon dilates with no mechanical block." }),
    ...surgicalBackground({ acute: true, omit: ["surg_weight_loss", "surg_menstrual_obstetric"], detailed: ["surg_anaesthetic_problem", "surg_transfusion", "surg_exercise_tolerance", "surg_bleeding_tendency"] }),
  ],
  differentials: [
    { id: "ascites_portal", name: "Ascites (portal hypertension)", pointers: ["alcohol_liver", "jaundice", "leg_swelling", "gi_bleed"], discriminators: ["alcohol_liver", "jaundice", "leg_swelling", "gi_bleed", "confusion", "appetite_weight"] },
    { id: "ascites_tb_malignant", name: "Ascites (tuberculous / malignant)", pointers: ["fever_sweats", "tb_contact", "appetite_weight", "weight_loss_mass"], discriminators: ["fever_sweats", "tb_contact", "appetite_weight", "weight_loss_mass", "pain", "previous_cancer", "postmenopausal_bleeding"] },
    { id: "ascites_cardiac_renal", name: "Ascites (cardiac / nephrotic)", pointers: ["cardiac_renal", "leg_swelling", "breathlessness"], discriminators: ["cardiac_renal", "leg_swelling", "breathlessness"] },
    { id: "obstruction", name: "Intestinal obstruction", pointers: ["obstruction", "vomiting", "pain"], discriminators: ["obstruction", "vomiting", "pain", "previous_surgery", "pain_became_constant", "blood_mucus_stool", "vomiting_timing", "laxative_escalation", "previous_cancer", "previous_attacks", "meal_after_fast", "ileus_setting"] },
    { id: "mass", name: "Mass / organomegaly", pointers: ["weight_loss_mass", "appetite_weight"], discriminators: ["weight_loss_mass", "appetite_weight", "pain", "girth", "laxative_escalation", "postmenopausal_bleeding"] },
    { id: "pregnancy", name: "Pregnancy", pointers: ["menstrual_pregnancy", "pregnancy"], discriminators: ["menstrual_pregnancy", "pregnancy", "girth"] },
    { id: "gas_functional", name: "Gaseous distension / functional", pointers: ["gas_belching", "pattern"], discriminators: ["gas_belching", "pattern", "obstruction", "appetite_weight", "previous_attacks", "ileus_setting"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "pattern", "girth", "obstruction", "progression", "prior_treatment", "prior_investigations"],
  },
};
