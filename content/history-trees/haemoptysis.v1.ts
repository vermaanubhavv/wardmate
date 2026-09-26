import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * COUGHING BLOOD — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Pulmonary medicine ward, north India, where tuberculosis — active, or healed and leaving a
 * cavity behind — accounts for most of this complaint. Two questions run underneath the whole
 * history: is the blood really coming from the chest rather than the nose or the stomach, and
 * how much of it is there, because volume is what kills first and quickly.
 * Differentials: pulmonary tuberculosis, post-tubercular bronchiectasis or aspergilloma,
 * pneumonia or lung abscess, bronchogenic carcinoma, bronchiectasis, pulmonary embolism,
 * mitral stenosis and other cardiac causes, anticoagulation or a bleeding disorder,
 * vasculitis with kidney involvement, bleeding from the nose or stomach mistaken for the chest.
 */
export const haemoptysisV1: HistoryTree = {
  id: "haemoptysis",
  version: "1.0.0",
  complaint: "Coughing blood",
  triggers: ["haemoptysis", "hemoptysis", "coughing blood", "blood in sputum", "blood in cough", "blood stained sputum", "spitting blood", "khansi mein khoon", "blood while coughing", "streaks of blood"],
  setting: "Pulmonary medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    { title: "National TB Elimination Programme: presumptive TB definition", source: "NTEP, Government of India", url: "https://journals.lww.com/ascp/fulltext/2022/10020/national_tb_elimination_program__ntep___at_a.1.aspx" },
    { title: "Hemoptysis: evaluation and management", source: "American Family Physician (PubMed)", pmid: "25955625" },
    rce("Does this patient have pulmonary embolism?", 2003, "14657070"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("coughing of blood"),
    val("hpi", "amount", "How much blood", "How much blood has come — streaks in the sputum, a spoonful, a cupful, and over what time?", ["streaks", "specks", "spoonful", "spoons", "cup", "cupful", "bowl", "ml", "in 24 hours", "each episode", "small amount", "large amount"], { numeric: true, teach: "The volume coughed, and over how long, is the part of this history that decides how urgent the rest of it becomes." }),
    val("hpi", "blood_character", "What the blood looks like", "What does the blood look like — bright red and frothy, mixed with sputum, or old dark clots?", ["bright red", "frothy", "mixed with sputum", "rusty", "dark", "clots", "old blood", "blood stained", "pink"], { teach: "Frothy bright blood mixed with sputum comes from the airway, while dark coffee-coloured material with food raises the stomach instead." }),
    yn("hpi", "source_confusion", "Where the blood is coming from", "Was the blood coughed up, vomited, or noticed coming from the nose or gums?", ["coughed", "vomited", "from nose", "gums", "bleeding gums", "after vomiting", "from throat", "not sure", "tickle in chest"], { teach: "Blood swallowed from the nose or brought up from the stomach is told apart from the chest only by asking where it started." }),
    yn("hpi", "episodes", "How many episodes", "How many times has blood come, over how many days, and is each episode larger than the last?", ["once", "twice", "many times", "daily", "episodes", "increasing", "same", "stopped", "days"]),
    yn("associated", "chronic_cough_sputum", "Cough and sputum", "How long has the cough been present, how much sputum comes each day, and does it change with posture?", ["cough", "weeks", "months", "sputum", "cupful", "copious", "foul", "on lying", "posture", "mornings", "dry cough"], { teach: "Large volumes of sputum brought up in a particular posture raise permanently damaged airways as the source." }),
    yn("associated", "fever_night_sweats_weight", "Fever, night sweats, weight loss", "Any evening fever, night sweats, loss of appetite, or weight loss, and how much weight?", ["evening fever", "night sweats", "weight loss", "appetite", "kg", "months", "low grade", "no fever"], { teach: "Weeks of cough with evening fever, night sweats and weight loss meet the programme definition of presumptive tuberculosis, which is a threshold for testing rather than a diagnosis." }),
    yn("associated", "chest_pain_breathlessness", "Chest pain or breathlessness with the blood", "Any chest pain or breathlessness along with the blood, and did they start together?", ["chest pain", "pleuritic", "on breathing", "breathless", "started together", "sudden", "one side", "no pain"]),
    yn("associated", "past_tb", "Past tuberculosis and treatment taken", "Any past tuberculosis, and was the full course completed, when, and was it ever repeated?", ["past tb", "tuberculosis", "att", "treatment", "completed", "left in between", "defaulted", "years ago", "repeated", "cured", "sputum positive"], { teach: "Blood coughed years after treated tuberculosis raises a cavity left behind rather than active disease returning, and the two are followed differently." }),
    yn("associated", "tb_contact", "Contact with tuberculosis", "Any contact with someone with tuberculosis at home or at work?", ["contact", "family", "husband", "wife", "neighbour", "work", "on treatment", "coughing", "no contact"]),
    yn("associated", "cardiac_history", "Heart disease, breathlessness on lying flat, swelling of feet", "Any known heart disease, rheumatic fever, breathlessness on lying flat, or swelling of the feet?", ["heart disease", "rheumatic", "valve", "mitral", "orthopnoea", "lying flat", "pillows", "swelling of feet", "palpitations"]),
    yn("associated", "leg_swelling_immobility", "Swollen calf, long travel, recent surgery or bed rest", "Any swelling or pain in one calf, recent long travel, surgery, or a period of bed rest?", ["calf", "swollen leg", "one leg", "long journey", "surgery", "bed rest", "immobile", "plaster", "weeks"]),
    yn("associated", "bleeding_elsewhere", "Bleeding at other sites / blood thinning treatment", "Any bleeding from the gums, in the urine, or under the skin, or any blood thinning treatment?", ["gums", "urine", "bruises", "petechiae", "blood thinner", "anticoagulant", "warfarin", "acitrom", "aspirin", "clopidogrel", "valve"]),
    yn("associated", "urine_changes_joint_rash", "Blood in the urine, swelling, joint pains or rash", "Any blood in the urine, puffiness of the face, joint pains, or rash along with the blood in the cough?", ["blood in urine", "smoky urine", "puffy face", "swelling", "joint pains", "rash", "sinusitis", "nose crusting"], { tier: "detailed", teach: "Blood from the chest together with blood in the urine raises a process affecting the lungs and kidneys at once." }),
    yn("exposure", "tobacco_occupation", "Tobacco, and dust or smoke at work or at home", "Any smoking or tobacco use and for how many years, and any exposure to stone dust, mine work, or cooking smoke?", ["smoking", "bidi", "cigarette", "years", "packs", "quit", "tobacco", "stone", "dust", "quarry", "mine", "silica", "chulha", "cooking smoke"]),
    // Red flags
    yn("red_flag", "massive_bleed", "Large volume of blood at once", "Has a large amount of blood come at once — a cupful or more, or blood filling the mouth faster than it can be spat out?", ["cupful", "large amount", "filling the mouth", "gushing", "continuous", "bowl", "cannot spit", "soaked", "repeated large"], { teach: "A large volume coughed at once threatens the airway by drowning it, before any blood is lost from the circulation." }),
    yn("red_flag", "breathlessness_hypoxia", "Breathless, unable to lie flat, blue lips", "Any severe breathlessness, inability to lie flat, or blueness of the lips since the bleeding?", ["breathless", "severe", "cannot lie", "blue", "cyanosis", "gasping", "fast breathing", "restless", "drowsy"], { teach: "Breathlessness during or after coughing blood asks whether blood has entered the other parts of the lung." }),
    yn("red_flag", "haemodynamic_compromise", "Giddiness, sweating, fainting", "Any giddiness on standing, sweating, fainting, or a racing pulse with the bleeding?", ["giddy", "on standing", "sweating", "fainted", "collapsed", "racing pulse", "cold hands", "pallor", "weak"], { teach: "Faintness and a racing pulse after coughing blood mark blood loss that the circulation is no longer compensating for." }),
    yn("red_flag", "weight_loss_smoker_persistent", "Long-term smoker with weight loss or a changed cough", "In a long-term smoker, has the cough changed in character, with weight loss, hoarseness, or a lump in the neck?", ["smoker", "years", "cough changed", "new cough", "weight loss", "hoarseness", "neck lump", "chest pain", "not improving", "clubbing"], { teach: "A changed cough with weight loss in a long-term smoker raises a growth in the airway rather than an infection." }),
    yn("red_flag", "ongoing_bleeding_now", "Still bringing up blood now", "Is blood still coming up now, and when was the last episode?", ["still coming", "just now", "minutes ago", "continuous", "stopped", "last episode", "hours ago", "settled"], { teach: "Bleeding that is still going on is a different history from one that stopped yesterday, and the time of the last episode says which." }),
    IMMUNOCOMPROMISE,
  ],
  differentials: [
    { id: "pulmonary_tb", name: "Pulmonary tuberculosis", pointers: ["fever_night_sweats_weight", "chronic_cough_sputum", "tb_contact"], discriminators: ["fever_night_sweats_weight", "chronic_cough_sputum", "tb_contact", "past_tb", "duration"] },
    { id: "post_tb_sequelae", name: "Post-tubercular bronchiectasis or aspergilloma", pointers: ["past_tb", "chronic_cough_sputum", "episodes"], discriminators: ["past_tb", "chronic_cough_sputum", "episodes", "fever_night_sweats_weight", "amount"] },
    { id: "pneumonia_abscess", name: "Pneumonia or lung abscess", pointers: ["fever_night_sweats_weight", "chest_pain_breathlessness", "blood_character"], discriminators: ["fever_night_sweats_weight", "chest_pain_breathlessness", "blood_character", "duration", "chronic_cough_sputum"] },
    { id: "bronchogenic_carcinoma", name: "Bronchogenic carcinoma", pointers: ["weight_loss_smoker_persistent", "tobacco_occupation"], discriminators: ["weight_loss_smoker_persistent", "tobacco_occupation", "duration", "fever_night_sweats_weight", "episodes"] },
    { id: "bronchiectasis", name: "Bronchiectasis", pointers: ["chronic_cough_sputum", "episodes"], discriminators: ["chronic_cough_sputum", "episodes", "past_tb", "amount", "duration"] },
    { id: "pulmonary_embolism", name: "Pulmonary embolism", pointers: ["leg_swelling_immobility", "chest_pain_breathlessness"], discriminators: ["leg_swelling_immobility", "chest_pain_breathlessness", "onset_mode", "amount", "haemodynamic_compromise"] },
    { id: "cardiac", name: "Mitral stenosis or other cardiac cause", pointers: ["cardiac_history", "blood_character"], discriminators: ["cardiac_history", "blood_character", "chest_pain_breathlessness", "duration", "amount"] },
    { id: "coagulopathy", name: "Anticoagulation or a bleeding disorder", pointers: ["bleeding_elsewhere"], discriminators: ["bleeding_elsewhere", "amount", "episodes", "blood_character", "source_confusion"] },
    { id: "vasculitis", name: "Vasculitis with kidney involvement", pointers: ["urine_changes_joint_rash"], discriminators: ["urine_changes_joint_rash", "duration", "fever_night_sweats_weight", "amount", "bleeding_elsewhere"] },
    { id: "pseudohaemoptysis", name: "Bleeding from the nose or stomach", pointers: ["source_confusion", "blood_character"], discriminators: ["source_confusion", "blood_character", "amount", "chronic_cough_sputum", "bleeding_elsewhere"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "amount", "blood_character", "source_confusion", "episodes", "onset_mode", "progression", "prior_treatment", "prior_investigations"],
  },
};
