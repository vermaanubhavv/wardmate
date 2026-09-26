import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * DYSPHAGIA — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult surgical / medicine ward, north India. Three questions carry most of the weight: solids
 * or liquids, progressive or intermittent, and at what level food sticks. Solids-then-liquids
 * progressing over weeks with weight loss is a mechanical narrowing until shown otherwise.
 * Differentials: oesophageal carcinoma, benign stricture (reflux or corrosive), achalasia,
 * oesophageal web or ring, pharyngeal pouch, neurological or bulbar dysphagia, extrinsic
 * compression, infective oesophagitis.
 */
export const dysphagiaV1: HistoryTree = {
  id: "dysphagia",
  version: "1.0.0",
  complaint: "Difficulty swallowing",
  triggers: ["dysphagia", "difficulty swallowing", "difficulty in swallowing", "food sticking", "food gets stuck", "cannot swallow", "unable to swallow", "trouble swallowing", "nigalne me dikkat", "odynophagia"],
  setting: "Adult surgical / medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("difficulty swallowing"),
    val("hpi", "solids_liquids", "Solids or liquids", "Is the difficulty with solid food, with liquids, or with both?", ["solids", "solid food", "liquids", "water", "both", "roti", "rice", "only solids", "even water", "semi solids"]),
    val("hpi", "progression_pattern", "Progressive or intermittent", "Has it steadily worsened from solids to liquids, or does it come and go?", ["progressive", "steadily", "worsened", "solids then liquids", "intermittent", "comes and goes", "on and off", "same since", "sudden"]),
    val("hpi", "level", "Where food sticks", "Where does the food seem to stick — in the throat, behind the upper chest, or lower down?", ["throat", "neck", "upper chest", "behind the breastbone", "retrosternal", "lower chest", "epigastrium", "level", "points to"]),
    yn("hpi", "odynophagia", "Pain on swallowing", "Is swallowing painful, and where is the pain felt?", ["painful swallowing", "odynophagia", "pain on swallowing", "burning on swallowing", "hurts to swallow"]),
    yn("hpi", "regurgitation", "Bringing food back up", "Does undigested food or liquid come back up, and how long after eating?", ["regurgitation", "comes back", "undigested", "brings up", "after eating", "at night", "on lying down", "vomits food", "hours later"]),
    yn("hpi", "nocturnal_cough_aspiration", "Coughing or choking with swallowing", "Any coughing, choking, or food going into the wind-pipe while swallowing, or coughing at night?", ["coughing", "choking", "goes into windpipe", "aspiration", "at night", "wakes coughing", "nasal regurgitation", "comes out of nose"]),
    yn("associated", "weight_appetite", "Weight loss / appetite", "Any weight loss, and how much over what period?", ["weight loss", "lost weight", "clothes loose", "appetite", "kg", "over months"]),
    yn("associated", "heartburn", "Heartburn / acid reflux", "Any long-standing heartburn, acid coming up, or a sour taste?", ["heartburn", "acid", "reflux", "sour taste", "burning in chest", "at night", "on bending", "years"]),
    yn("associated", "hoarseness", "Hoarseness / change in voice", "Any hoarseness or change in the voice?", ["hoarseness", "hoarse", "voice change", "husky", "whisper", "lost voice"]),
    yn("associated", "neck_swelling", "Neck swelling / lump", "Any lump in the neck, or swelling above the collar bone?", ["neck swelling", "lump", "collar bone", "supraclavicular", "goitre", "thyroid", "gland"]),
    yn("associated", "chest_symptoms", "Cough / breathlessness / chest pain", "Any cough, breathlessness, or chest pain?", ["cough", "breathlessness", "chest pain", "recurrent chest infection", "pneumonia", "fever with cough"]),
    yn("associated", "neuro_symptoms", "Weakness / slurred speech / drooling", "Any limb weakness, slurred speech, drooling, or facial deviation?", ["weakness", "slurred speech", "drooling", "facial deviation", "stroke", "double vision", "droopy eyelids", "tongue"]),
    yn("associated", "gurgling_neck_swelling", "Gurgling in the neck / bad breath", "Any gurgling sound in the neck, a swelling that appears on eating, or foul breath?", ["gurgling", "neck swelling on eating", "foul breath", "halitosis", "pouch", "bulge in neck"], { tier: "detailed" }),
    yn("associated", "anaemia_symptoms", "Tiredness / pallor", "Any tiredness, breathlessness on exertion, or pallor?", ["tiredness", "pallor", "pale", "breathless on exertion", "weakness", "anaemia"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "progressive_solids_to_liquids", "Steady progression from solids to liquids", "Has the difficulty progressed steadily from solid food to semi-solids and then to liquids over weeks?", ["progressive", "solids to liquids", "over weeks", "now liquids", "steadily worse", "cannot take water", "getting worse"], { teach: "A steady march from solids through semi-solids to liquids over weeks describes a lumen narrowing progressively, which is a different problem from intermittent sticking." }),
    yn("red_flag", "weight_loss_significant", "Marked weight loss", "Has there been marked weight loss alongside the swallowing difficulty?", ["weight loss", "marked", "lost weight", "clothes loose", "wasted", "kg in months"], { teach: "Weight loss alongside progressive dysphagia raises a malignant narrowing and sets the urgency for looking inside." }),
    yn("red_flag", "complete_obstruction", "Unable to swallow even saliva", "Is the patient now unable to swallow even saliva, or is food impacted and not going down?", ["cannot swallow saliva", "drooling", "impacted", "stuck", "nothing goes down", "spitting saliva", "food stuck now"], { teach: "An inability to swallow saliva marks a lumen that is now effectively blocked, which cannot wait for an elective list." }),
    yn("red_flag", "aspiration_pneumonia", "Recurrent chest infection / choking at night", "Any recurrent chest infections, or choking and coughing at night?", ["recurrent chest infection", "pneumonia", "choking at night", "coughing at night", "aspiration", "fever with cough"], { teach: "Repeated chest infections with dysphagia mark food entering the airway, which becomes the more urgent problem." }),
    yn("red_flag", "corrosive_history", "Past swallowing of a corrosive", "Was any acid, alkali or corrosive substance ever swallowed, even years ago?", ["corrosive", "acid", "alkali", "swallowed", "years ago", "childhood", "tezab", "burn"], { teach: "A corrosive swallowed even years earlier scars the oesophagus, and that history reframes a stricture found later." }),
    yn("red_flag", "tobacco_alcohol", "Tobacco / gutka / alcohol", "Any smoking, tobacco or gutka chewing, or alcohol, and for how many years?", ["smoking", "tobacco", "gutka", "paan", "alcohol", "chewing", "bidi", "years", "khaini"], { teach: "Tobacco and alcohol are the dominant risks for oesophageal cancer, and quantifying the years changes the pre-test question." }),
    yn("red_flag", "hoarseness_with_dysphagia", "Hoarse voice with the swallowing difficulty", "Has the voice become hoarse alongside the difficulty swallowing?", ["hoarse", "hoarseness", "voice change", "with dysphagia", "husky"], { tier: "detailed", teach: "A voice that changes as swallowing worsens raises involvement of the nerve running beside the oesophagus." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "family_cancer", "Family history of gastrointestinal cancer", "Any family history of cancer of the food pipe or stomach?", ["family history", "oesophageal cancer", "stomach cancer", "gastric", "father", "mother", "sibling"], { tier: "detailed" }),
    yn("exposure", "hot_beverages_diet", "Very hot drinks / diet", "Any habit of very hot tea, or a diet low in fruit and vegetables?", ["hot tea", "very hot", "scalding", "diet", "fruit", "vegetables", "pickles", "smoked food"], { tier: "detailed" }),
    yn("exposure", "previous_surgery_radiation", "Previous neck or chest surgery / radiotherapy", "Any previous surgery or radiotherapy to the neck or chest?", ["surgery", "radiotherapy", "radiation", "neck", "chest", "operation", "thyroid surgery"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "carcinoma", name: "Oesophageal or gastro-oesophageal carcinoma", pointers: ["progressive_solids_to_liquids", "weight_loss_significant", "tobacco_alcohol", "hoarseness_with_dysphagia"], discriminators: ["progressive_solids_to_liquids", "weight_loss_significant", "tobacco_alcohol", "hoarseness_with_dysphagia", "solids_liquids", "level", "neck_swelling", "family_cancer"] },
    { id: "benign_stricture", name: "Benign stricture (reflux or corrosive)", pointers: ["heartburn", "corrosive_history", "solids_liquids"], discriminators: ["heartburn", "corrosive_history", "progression_pattern", "weight_appetite", "solids_liquids"] },
    { id: "achalasia", name: "Achalasia", pointers: ["solids_liquids", "regurgitation", "progression_pattern"], discriminators: ["solids_liquids", "regurgitation", "progression_pattern", "nocturnal_cough_aspiration", "level", "duration"] },
    { id: "web_ring", name: "Oesophageal web or ring", pointers: ["progression_pattern", "anaemia_symptoms", "level"], discriminators: ["progression_pattern", "anaemia_symptoms", "level", "solids_liquids", "weight_appetite"] },
    { id: "pharyngeal_pouch", name: "Pharyngeal pouch", pointers: ["gurgling_neck_swelling", "regurgitation", "level"], discriminators: ["gurgling_neck_swelling", "regurgitation", "level", "nocturnal_cough_aspiration"] },
    { id: "neurological", name: "Neurological or bulbar dysphagia", pointers: ["neuro_symptoms", "nocturnal_cough_aspiration", "level"], discriminators: ["neuro_symptoms", "nocturnal_cough_aspiration", "level", "solids_liquids", "onset_mode", "aspiration_pneumonia"] },
    { id: "extrinsic", name: "Extrinsic compression", pointers: ["neck_swelling", "chest_symptoms", "hoarseness"], discriminators: ["neck_swelling", "chest_symptoms", "hoarseness", "level", "previous_surgery_radiation"] },
    { id: "infective", name: "Infective oesophagitis", pointers: ["odynophagia", "immunocompromise"], discriminators: ["odynophagia", "immunocompromise", "duration", "solids_liquids", "weight_appetite"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "solids_liquids", "progression_pattern", "level", "odynophagia", "regurgitation", "nocturnal_cough_aspiration", "progression", "prior_treatment", "prior_investigations"],
  },
};
