import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * ABDOMINAL DISTENSION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical / medicine ward, north India. The classical "five Fs": fluid, flatus, faeces,
 * fat, foetus (and a mass). Differentials: ascites (portal hypertension, tuberculous, malignant,
 * cardiac, nephrotic), intestinal obstruction, organomegaly or a mass, urinary retention,
 * pregnancy, obesity.
 */
export const abdominalDistensionV1: HistoryTree = {
  id: "abdominal_distension",
  version: "1.0.0",
  complaint: "Abdominal distension",
  triggers: ["abdominal distension", "distension of abdomen", "distended abdomen", "swelling of abdomen", "abdominal swelling", "bloating", "bloated", "increased abdominal girth", "swollen abdomen", "belly swelling"],
  setting: "Adult surgical / medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("abdominal distension"),
    val("hpi", "pattern", "Constant or intermittent", "Is the distension constant, or does it come and go with meals or through the day?", ["constant", "intermittent", "after meals", "worse in evening", "comes and goes", "throughout the day", "gradual"]),
    val("hpi", "girth", "Change in girth", "By how much has the belly grown — clothes tight, belt notches, measured girth?", ["clothes tight", "belt", "girth", "measured", "notch", "increased size", "trousers", "saree"]),
    yn("hpi", "flatus_stools", "Flatus and stools passed", "Is the patient passing stool and flatus?", ["flatus", "stools", "passing stool", "constipation", "not passing", "gas"]),
    yn("associated", "pain", "Abdominal pain", "Any abdominal pain, and is it colicky?", ["pain", "colicky", "cramps", "abdominal pain"]),
    yn("associated", "vomiting", "Vomiting", "Any vomiting, and is it bilious or faeculent?", ["vomiting", "vomit", "bilious", "faeculent"]),
    yn("associated", "leg_swelling", "Swelling of legs / face", "Any swelling of the legs or face?", ["swelling", "pedal oedema", "oedema", "edema", "puffiness", "leg swelling"]),
    yn("associated", "jaundice", "Yellowness of eyes", "Any yellowness of the eyes or dark urine?", ["jaundice", "yellow eyes", "yellowness", "dark urine", "icterus"]),
    yn("associated", "breathlessness", "Breathlessness / orthopnoea", "Any breathlessness, especially lying flat?", ["breathlessness", "breathless", "orthopnoea", "lying flat", "pnd"]),
    yn("associated", "fever_sweats", "Fever / night sweats", "Any fever or night sweats?", ["fever", "night sweats", "evening rise", "chills"]),
    yn("associated", "appetite_weight", "Appetite / weight", "Any loss of appetite, or weight loss with a growing belly?", ["appetite", "weight loss", "lost weight", "loss of weight", "thin limbs"]),
    yn("associated", "urine", "Difficulty passing urine", "Any difficulty passing urine or a feeling of a full bladder?", ["difficulty passing urine", "retention", "full bladder", "dribbling", "poor stream"], { tier: "detailed" }),
    yn("associated", "menstrual_pregnancy", "Missed periods / menstrual change", "In a woman, any missed periods or change in periods?", ["missed periods", "amenorrhoea", "lmp", "pregnant", "menstrual", "heavy periods"], { tier: "detailed" }),
    yn("associated", "gas_belching", "Belching / passing gas / food-related", "Is it related to food, with belching, passing gas, or intolerance of milk or wheat?", ["belching", "gas", "flatulence", "milk", "wheat", "lactose", "after meals"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "obstruction", "Absolute constipation with vomiting", "Has the patient passed neither stool nor flatus, with vomiting and colicky pain?", ["no stool", "no flatus", "absolute constipation", "vomiting", "colicky", "obstipation"], { teach: "A swollen abdomen with vomiting and no stool or flatus is the pattern of obstruction, where timing decides the outcome." }),
    yn("red_flag", "acute_pain_fever", "Severe pain with fever", "Is there severe abdominal pain with fever or a rigid abdomen?", ["severe pain", "fever", "rigid", "peritonitis", "worst pain", "guarding"], { teach: "Fever with sudden severe pain and a swollen abdomen asks about infection of the fluid or a hollow organ leak." }),
    yn("red_flag", "gi_bleed", "Vomiting blood / black stools", "Any vomiting of blood or black stools?", ["haematemesis", "vomiting blood", "melaena", "black stools", "hematemesis", "coffee ground"], { teach: "Vomiting blood with a swollen abdomen asks about portal hypertension and varices." }),
    yn("red_flag", "confusion", "Confusion / drowsiness", "Any confusion, day-night reversal, or drowsiness?", ["confusion", "drowsy", "day night reversal", "altered sensorium", "irrelevant talk", "sleep reversal"], { teach: "Confusion with a swollen abdomen in liver disease points to a brain effect of liver failure." }),
    yn("red_flag", "weight_loss_mass", "Weight loss / mass / early satiety", "Any unintentional weight loss, a lump felt, or feeling full after a few mouthfuls?", ["weight loss", "lump", "mass", "early satiety", "full after", "hard lump"], { teach: "Weight loss with progressive swelling raises a mass or a malignancy-related collection." }),
    yn("red_flag", "urinary_retention", "Not passing urine", "Has the patient not passed urine for many hours, with lower abdominal fullness?", ["not passing urine", "retention", "no urine", "lower abdominal fullness", "full bladder"], { tier: "detailed", teach: "A tense lower swelling with no urine raises a bladder question before an abdominal one." }),
    PREGNANCY,
    yn("exposure", "alcohol_liver", "Alcohol / hepatitis / liver disease", "Any alcohol, past hepatitis, or known liver disease?", ["alcohol", "hepatitis", "liver disease", "cirrhosis", "jaundice", "hbv", "hcv", "drinker"]),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"]),
    yn("exposure", "cardiac_renal", "Known heart or kidney disease", "Any known heart failure, kidney disease, or nephrotic syndrome?", ["heart failure", "cardiac", "kidney disease", "ckd", "nephrotic", "renal", "protein in urine"], { tier: "detailed" }),
    yn("exposure", "previous_surgery", "Previous abdominal surgery", "Any previous abdominal surgery or hernia?", ["surgery", "operation", "laparotomy", "hernia", "adhesions"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "ascites_portal", name: "Ascites (portal hypertension)", pointers: ["alcohol_liver", "jaundice", "leg_swelling", "gi_bleed"], discriminators: ["alcohol_liver", "jaundice", "leg_swelling", "gi_bleed", "confusion", "appetite_weight"] },
    { id: "ascites_tb_malignant", name: "Ascites (tuberculous / malignant)", pointers: ["fever_sweats", "tb_contact", "appetite_weight", "weight_loss_mass"], discriminators: ["fever_sweats", "tb_contact", "appetite_weight", "weight_loss_mass", "pain"] },
    { id: "ascites_cardiac_renal", name: "Ascites (cardiac / nephrotic)", pointers: ["cardiac_renal", "leg_swelling", "breathlessness"], discriminators: ["cardiac_renal", "leg_swelling", "breathlessness", "urine"] },
    { id: "obstruction", name: "Intestinal obstruction", pointers: ["obstruction", "vomiting", "pain", "flatus_stools"], discriminators: ["obstruction", "flatus_stools", "vomiting", "pain", "previous_surgery"] },
    { id: "mass", name: "Mass / organomegaly", pointers: ["weight_loss_mass", "appetite_weight"], discriminators: ["weight_loss_mass", "appetite_weight", "pain", "girth"] },
    { id: "pregnancy", name: "Pregnancy", pointers: ["menstrual_pregnancy", "pregnancy"], discriminators: ["menstrual_pregnancy", "pregnancy", "girth"] },
    { id: "gas_functional", name: "Gaseous distension / functional", pointers: ["gas_belching", "pattern"], discriminators: ["gas_belching", "pattern", "flatus_stools", "appetite_weight"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "pattern", "girth", "flatus_stools", "progression", "prior_treatment", "prior_investigations"],
  },
};
