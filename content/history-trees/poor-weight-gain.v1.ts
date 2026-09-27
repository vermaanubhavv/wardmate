import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, GHAI_PAEDIATRICS, HUTCHISONS, IMNCI, MACLEODS, paedBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * POOR WEIGHT GAIN — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Paediatric ward, north India. Most children who do not gain weight are not getting enough
 * to eat, and a careful account of what the child actually eats in a day answers more than
 * any test. The rest of the history looks for where the calories are being lost or burnt —
 * the gut, the lungs, the heart, the kidneys — and for the home the child is growing up in.
 * Informant is usually the mother.
 * Differentials: inadequate intake or feeding practice, severe acute malnutrition,
 * tuberculosis, recurrent infections and diarrhoea, malabsorption including coeliac disease,
 * congenital heart disease, chronic kidney disease or renal tubular acidosis, hypothyroidism,
 * HIV infection, and psychosocial causes.
 */
export const poorWeightGainV1: HistoryTree = {
  id: "poor_weight_gain",
  version: "1.0.0",
  complaint: "Poor weight gain",
  triggers: ["poor weight gain", "not gaining weight", "failure to thrive", "faltering growth", "growth faltering", "underweight child", "malnutrition", "severe acute malnutrition", "weight not increasing", "vajan nahi badh raha", "kamzor bachcha", "thin child", "wasted child"],
  setting: "Paediatric ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [GHAI_PAEDIATRICS, IMNCI, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("poor weight gain"),
    ...paedBackground(),
    val("hpi", "diet_recall", "What the child ate yesterday", "What did the child eat and drink from waking yesterday to waking today, and how much of each?", ["breakfast", "lunch", "dinner", "roti", "rice", "dal", "milk", "biscuits", "tea", "cups", "katori", "twenty four hours", "yesterday", "snacks"]),
    val("hpi", "feeding_practice", "How the child has been fed", "Was the child exclusively breastfed, when were other foods started, and is animal or diluted milk or a bottle being used?", ["exclusive breastfeeding", "breastfed", "top milk", "cow milk", "buffalo milk", "diluted", "watered down", "bottle", "weaning", "complementary feeds", "started at", "months"]),
    val("hpi", "appetite", "Appetite", "Is the child hungry and eager to eat, or uninterested in food?", ["hungry", "eats well", "good appetite", "poor appetite", "not interested in food", "refuses food", "fussy", "picky"]),
    val("hpi", "stool_pattern", "Stools", "What are the stools like — frequent, loose, bulky, pale, greasy or foul-smelling — and did it change when wheat was started?", ["loose", "bulky", "pale", "greasy", "foul smelling", "floating", "frequent", "normal stools", "constipated", "after wheat", "roti started"]),
    yn("hpi", "recurrent_illness", "Frequent illnesses", "How often has the child been ill in the past year — chest infections, loose stools, ear discharge, mouth thrush or skin infections?", ["frequent illness", "recurrent", "again and again", "pneumonia", "loose stools", "ear discharge", "thrush", "skin infections", "admitted before", "every month"]),
    yn("associated", "chronic_cough_fever", "Long cough or fever", "Has the child had a cough or fever lasting more than two weeks, or night sweats?", ["cough", "fever", "two weeks", "long standing", "night sweats", "evening fever", "on and off"]),
    yn("associated", "breathless_feeds", "Breathless or sweaty on feeding", "Does the child get breathless or sweaty during feeds, or tire before finishing a feed?", ["breathless on feeding", "sweating during feeds", "tires on feeding", "stops feeding", "fast breathing", "blue", "heart problem"]),
    yn("associated", "thirst_urine", "Excess thirst or urine", "Does the child drink or pass urine much more than other children, or crave salt?", ["thirsty", "drinks a lot", "passes urine a lot", "frequent urination", "wet bed", "salt craving", "polyuria"]),
    yn("associated", "vomiting_regurgitation", "Vomiting or bringing up food", "Does the child vomit or bring up food regularly after meals?", ["vomiting", "vomits", "brings up", "regurgitation", "spitting", "after meals", "after feeds"]),
    yn("associated", "pica_worms", "Eating mud or passing worms", "Does the child eat mud or chalk, or have worms been seen in the stool?", ["eats mud", "mitti", "chalk", "pica", "worms", "keede", "passed worm", "itching at anus"], { tier: "detailed" }),
    yn("associated", "cold_constipation", "Cold, sluggish and constipated", "Is the child unusually sluggish, constipated, or feeling the cold more than others?", ["sluggish", "slow", "constipation", "constipated", "feels cold", "dry skin", "puffy face", "hoarse cry"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "feet_swelling", "Swelling of both feet", "Is there swelling of both feet or the face?", ["swelling of feet", "swollen feet", "pedal oedema", "puffy face", "both feet", "pitting", "sujan"], { teach: "Swelling of both feet in a thin child is a sign of severe acute malnutrition in its own right, whatever the weight reads." }),
    yn("red_flag", "severe_visible_wasting", "Severe visible wasting", "Is the child visibly very thin — ribs and bones showing, loose skin over the buttocks?", ["very thin", "ribs showing", "bones showing", "loose skin", "baggy pants", "old man face", "skin and bones", "wasted"], { teach: "Visible severe wasting marks the child who needs the malnutrition pathway, where infection, low sugar and low temperature are common and easily missed." }),
    yn("red_flag", "sam_danger_signs", "Danger signs", "Is the child not eating at all, very drowsy, cold to touch, vomiting everything, or has had a fit?", ["not eating at all", "drowsy", "lethargic", "cold to touch", "vomits everything", "fit", "convulsion", "unable to drink"], { teach: "A malnourished child with any IMNCI danger sign has complicated malnutrition, where infection and a low sugar can present with nothing more than these." }),
    yn("red_flag", "chronic_diarrhoea_blood", "Loose stools for weeks or blood in stool", "Have the loose stools continued for more than two weeks, or is there blood in the stool?", ["two weeks", "persistent", "chronic diarrhoea", "blood in stool", "bloody", "weeks"], { teach: "Persistent diarrhoea both causes and follows malnutrition, and blood in the stool points to causes that a feeding change alone will not reach." }),
    yn("red_flag", "weight_loss", "Losing weight", "Is the child actually losing weight, not just failing to gain?", ["losing weight", "weight loss", "lost weight", "getting thinner", "clothes loose", "vajan ghat"], { teach: "Actual weight loss, as opposed to slow gain, points more toward an active illness such as tuberculosis, HIV or diabetes than toward intake alone." }),
    // Home and family
    yn("exposure", "tb_contact", "Contact with tuberculosis", "Does anyone in the house have a long cough or tuberculosis, or have they been on treatment for it?", ["tb", "tuberculosis", "tb contact", "long cough", "on att", "dots", "grandfather cough", "family member cough"], { teach: "In India a household contact with tuberculosis is one of the commonest hidden reasons a child stops gaining weight." }),
    yn("exposure", "hiv_risk", "HIV risk", "Is either parent known to have HIV, or has the child had blood transfusions or had a parent who died young of a long illness?", ["hiv", "parent hiv", "mother hiv", "transfusion", "blood given", "parent died", "long illness", "art"], { tier: "detailed" }),
    val("exposure", "home_situation", "Home and care", "Who looks after the child during the day, how many children are at home, is there enough food for the family, and is there any stress at home?", ["mother working", "grandmother", "caregiver", "siblings", "children at home", "food at home", "money", "poor", "stress", "fights", "alcohol", "neglect"]),
    val("exposure", "family_growth", "Family build and similar children", "How tall and heavy are the parents, and has any sibling had the same problem?", ["parents short", "father height", "mother height", "small family", "sibling thin", "sibling same", "runs in family"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "inadequate_intake", name: "Inadequate intake or feeding practice", pointers: ["diet_recall", "feeding_practice", "appetite"], discriminators: ["diet_recall", "feeding_practice", "appetite", "home_situation", "feeding_nutrition"] },
    { id: "sam", name: "Severe acute malnutrition", pointers: ["feet_swelling", "severe_visible_wasting", "sam_danger_signs"], discriminators: ["feet_swelling", "severe_visible_wasting", "sam_danger_signs", "diet_recall", "chronic_diarrhoea_blood"] },
    { id: "tb", name: "Tuberculosis", pointers: ["tb_contact", "chronic_cough_fever", "weight_loss"], discriminators: ["tb_contact", "chronic_cough_fever", "weight_loss", "appetite", "immunisation"] },
    { id: "recurrent_infection", name: "Recurrent infections and diarrhoea", pointers: ["recurrent_illness", "chronic_diarrhoea_blood", "pica_worms"], discriminators: ["recurrent_illness", "chronic_diarrhoea_blood", "stool_pattern", "home_situation", "immunisation"] },
    { id: "malabsorption", name: "Malabsorption including coeliac disease", pointers: ["stool_pattern", "chronic_diarrhoea_blood"], discriminators: ["stool_pattern", "appetite", "diet_recall", "chronic_diarrhoea_blood", "pica_worms"] },
    { id: "chd", name: "Congenital heart disease", pointers: ["breathless_feeds", "recurrent_illness"], discriminators: ["breathless_feeds", "recurrent_illness", "birth_history", "development"] },
    { id: "renal", name: "Chronic kidney disease or renal tubular acidosis", pointers: ["thirst_urine", "vomiting_regurgitation"], discriminators: ["thirst_urine", "vomiting_regurgitation", "appetite", "cold_constipation"] },
    { id: "hypothyroid", name: "Hypothyroidism", pointers: ["cold_constipation", "development"], discriminators: ["cold_constipation", "development", "family_growth", "appetite"] },
    { id: "hiv", name: "HIV infection", pointers: ["hiv_risk", "recurrent_illness", "weight_loss"], discriminators: ["hiv_risk", "recurrent_illness", "chronic_diarrhoea_blood", "weight_loss", "tb_contact"] },
    { id: "psychosocial", name: "Psychosocial causes", pointers: ["home_situation", "appetite"], discriminators: ["home_situation", "diet_recall", "appetite", "development", "feeding_practice"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "growth", "diet_recall", "feeding_practice", "appetite", "stool_pattern", "recurrent_illness", "feeding_nutrition", "progression", "prior_treatment", "prior_investigations"],
  },
};
