import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * GENERALISED WEAKNESS / FATIGUE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult medicine ward, north India. Differentials: anaemia, electrolyte disturbance
 * (hypokalaemia, hyponatraemia), infection including tuberculosis, hypothyroidism, diabetes
 * (hyperglycaemia or hypoglycaemia), chronic kidney or liver disease, depression, malignancy,
 * medication effect. Focal limb weakness has its own tree.
 */
export const generalisedWeaknessV1: HistoryTree = {
  id: "generalised_weakness",
  version: "1.0.0",
  complaint: "Generalised weakness",
  triggers: ["generalised weakness", "generalized weakness", "general weakness", "fatigue", "tiredness", "lethargy", "easy fatigability", "malaise", "body ache and weakness"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("weakness"),
    val("hpi", "distribution", "Which muscles", "Is the weakness all over, or worse in the thighs and shoulders, or in the hands and feet?", ["all over", "generalised", "generalized", "thighs", "shoulders", "proximal", "hands", "feet", "distal", "climbing stairs", "getting up from chair"]),
    val("hpi", "fatigue_vs_weakness", "Tiredness or loss of power", "Is it tiredness and lack of energy, or actual loss of power in the muscles?", ["tired", "tiredness", "lack of energy", "loss of power", "cannot lift", "cannot stand", "easily fatigued", "exhausted"]),
    val("hpi", "function", "Effect on daily activity", "What can the patient no longer do — walk, climb stairs, work, self-care?", ["cannot walk", "cannot climb", "cannot work", "bedridden", "needs help", "daily activities", "stairs", "self care", "housebound"]),
    val("hpi", "pattern", "Pattern through the day", "Is it worse after activity, towards evening, or on waking?", ["after activity", "evening", "morning", "exertion", "worse at night", "after exercise", "throughout the day", "fluctuates"]),
    yn("associated", "appetite_weight", "Appetite / weight", "Any loss of appetite or weight loss?", ["appetite", "weight loss", "lost weight", "loss of weight", "anorexia", "weight gain"]),
    yn("associated", "fever_sweats", "Fever / night sweats", "Any fever or night sweats?", ["fever", "night sweats", "sweating", "chills", "evening rise"]),
    yn("associated", "bowel_bleeding", "Blood loss", "Any black stools, blood in stool, blood in urine, or heavy periods?", ["black stools", "melaena", "blood in stool", "bleeding", "haematuria", "blood in urine", "heavy periods", "menorrhagia", "piles"]),
    yn("associated", "gi_losses", "Vomiting / loose stools", "Any recent vomiting or loose stools?", ["vomiting", "loose stools", "diarrhoea", "diarrhea", "dehydration"]),
    yn("associated", "urine_thirst", "Thirst / urine", "Any excess thirst, passing urine more often, or reduced urine?", ["thirst", "polyuria", "frequent urine", "reduced urine", "nocturia", "polydipsia"]),
    yn("associated", "breathless_palpitation", "Breathlessness / palpitations", "Any breathlessness on exertion, palpitations, or giddiness?", ["breathless", "breathlessness", "palpitations", "giddiness", "dizziness", "sob"]),
    yn("associated", "mood_sleep", "Mood / sleep", "Any low mood, loss of interest, or disturbed sleep?", ["low mood", "sad", "loss of interest", "sleep", "insomnia", "depressed", "anxiety"], { tier: "detailed" }),
    yn("associated", "cold_constipation", "Cold intolerance / constipation / dry skin", "Any cold intolerance, constipation, dry skin or hair loss?", ["cold intolerance", "constipation", "dry skin", "hair loss", "weight gain", "puffiness"], { tier: "detailed" }),
    yn("associated", "cramps_tingling", "Cramps / tingling", "Any muscle cramps, twitching, or tingling of hands and feet?", ["cramps", "twitching", "tingling", "numbness", "paraesthesia", "carpopedal"], { tier: "detailed" }),
    yn("associated", "diet", "Diet", "What is the diet like — vegetarian, mixed, and is it adequate in iron and protein?", ["vegetarian", "mixed diet", "vegan", "poor diet", "adequate", "milk", "meat", "diet"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "focal_weakness", "Focal weakness / facial droop / speech", "Is the weakness on one side, or with facial deviation or slurred speech?", ["one side", "hemiparesis", "facial deviation", "slurred speech", "slurring", "unilateral", "facial droop"], { teach: "Weakness confined to one side, or with a speech or facial change, needs a stroke-style history rather than a generalised one." }),
    yn("red_flag", "ascending_weakness", "Rapidly ascending weakness", "Has weakness climbed from the legs upward over days, with tingling, or difficulty breathing or swallowing?", ["ascending", "legs first", "spreading upwards", "difficulty swallowing", "difficulty breathing", "tingling", "over days", "rapidly progressive"], { teach: "Weakness that climbs upward over days, especially with breathing or swallowing difficulty, is a neurological emergency pattern." }),
    yn("red_flag", "bleeding", "Ongoing bleeding", "Is there any ongoing or recent bleeding — black stools, vomiting blood, or heavy bleeding per vaginum?", ["black stools", "melaena", "vomiting blood", "haematemesis", "bleeding", "heavy bleeding", "hematemesis"], { teach: "Blood loss is a common and treatable reason for sudden weakness and easily missed when the loss is slow." }),
    yn("red_flag", "dyselectrolyte_symptoms", "Palpitations / cramps / paralysis episodes", "Any episodes of sudden limb paralysis, palpitations, or severe cramps, especially after vomiting, diarrhoea or diuretics?", ["periodic paralysis", "sudden weakness", "palpitations", "cramps", "diuretics", "after vomiting", "after diarrhoea", "potassium"], { teach: "Sudden weakness after fluid loss or with diuretics raises a low potassium or sodium." }),
    yn("red_flag", "hypoglycaemia", "Sweating / tremor / diabetic on treatment", "Is the patient diabetic on treatment, with episodes of sweating, tremor or confusion?", ["hypoglycaemia", "hypoglycemia", "sweating", "tremor", "diabetic", "sugar low", "insulin", "confusion"], { teach: "Weakness with sweating and tremor in a treated diabetic points to low blood sugar, a quick question with quick consequences." }),
    yn("red_flag", "weight_loss_significant", "Significant weight loss", "Has there been marked weight loss, more than a tenth of body weight in six months?", ["weight loss", "lost weight", "marked weight loss", "clothes loose", "loss of weight"], { teach: "Unintentional weight loss with fatigue widens the list to chronic infection and malignancy." }),
    yn("red_flag", "steroid_use", "Steroids / drugs", "Any long-term steroids, diuretics, statins, or other regular medicines?", ["steroid", "steroids", "prednisolone", "diuretic", "statin", "regular medicines", "traditional medicine", "ayurvedic"], { teach: "Several common drugs cause weakness directly or through the salts they shift." }),
    PREGNANCY,
    IMMUNOCOMPROMISE,
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact with someone with tuberculosis?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact"]),
    yn("exposure", "sun_exposure", "Sun exposure / occupation", "Is the patient outdoors in heat all day, or exposed to chemicals or pesticides?", ["heat", "sun", "outdoor", "farmer", "pesticide", "chemical", "labourer"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "anaemia", name: "Anaemia", pointers: ["breathless_palpitation", "bowel_bleeding", "diet"], discriminators: ["bowel_bleeding", "bleeding", "diet", "breathless_palpitation", "gi_losses"] },
    { id: "electrolyte", name: "Electrolyte disturbance", pointers: ["gi_losses", "cramps_tingling", "dyselectrolyte_symptoms"], discriminators: ["gi_losses", "cramps_tingling", "dyselectrolyte_symptoms", "steroid_use", "urine_thirst"] },
    { id: "infection_tb", name: "Chronic infection including tuberculosis", pointers: ["fever_sweats", "appetite_weight", "tb_contact"], discriminators: ["fever_sweats", "appetite_weight", "tb_contact", "weight_loss_significant", "immunocompromise"] },
    { id: "diabetes", name: "Diabetes-related", pointers: ["urine_thirst", "hypoglycaemia"], discriminators: ["urine_thirst", "hypoglycaemia", "appetite_weight", "prior_treatment"] },
    { id: "thyroid", name: "Hypothyroidism", pointers: ["cold_constipation"], discriminators: ["cold_constipation", "mood_sleep", "appetite_weight"] },
    { id: "organ_failure", name: "Chronic kidney or liver disease", pointers: ["urine_thirst", "appetite_weight"], discriminators: ["urine_thirst", "appetite_weight", "gi_losses", "steroid_use"] },
    { id: "neuromuscular", name: "Neuromuscular cause", pointers: ["distribution", "ascending_weakness", "focal_weakness"], discriminators: ["distribution", "ascending_weakness", "focal_weakness", "cramps_tingling", "pattern"] },
    { id: "depression", name: "Depression / psychological", pointers: ["mood_sleep"], discriminators: ["mood_sleep", "fatigue_vs_weakness", "function"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "distribution", "fatigue_vs_weakness", "function", "pattern", "progression", "prior_treatment", "prior_investigations"],
  },
};
