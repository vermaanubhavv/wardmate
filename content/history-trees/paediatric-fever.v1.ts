import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, ebem, HUTCHISONS, MACLEODS, paedBackground, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * FEVER IN A CHILD — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Paediatric ward, north India. The younger the child, the less the fever localises and the
 * lower the threshold for looking everywhere. A febrile infant under three months is a
 * different problem from a febrile five-year-old, and the history is where that distinction
 * begins. Differentials: viral illness, pneumonia, urinary tract infection, meningitis,
 * malaria, dengue, enteric fever, otitis media, tuberculosis, and a focus in the skin or joints.
 */
export const paediatricFeverV1: HistoryTree = {
  id: "paediatric_fever",
  version: "1.0.0",
  complaint: "Fever in a child",
  triggers: ["fever in child", "child fever", "paediatric fever", "baby fever", "infant fever", "bukhar bachcha", "febrile child", "fever in infant", "febrile infant"],
  setting: "Paediatric ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [
    rce("Does this child have pneumonia? The Rational Clinical Examination systematic review", 2017, "28763554"),
    ebem("Does this child have a urinary tract infection?", 2008, "19380042"),
    rce("The rational clinical examination. Does this adult patient have acute meningitis?", 1999, "10411200"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("fever"),
    ...paedBackground(),
    val("hpi", "fever_pattern", "Pattern and measurement", "How high has the fever been, was it measured with a thermometer, and does it come down fully between spikes?", ["measured", "thermometer", "touch", "degrees", "high grade", "low grade", "continuous", "intermittent", "comes down", "spikes", "chills"], { numeric: true }),
    val("hpi", "activity_feeding", "Activity and feeding during the fever", "Is the child playing and alert between fever spikes, or lethargic and refusing feeds?", ["playing", "active", "alert", "lethargic", "dull", "not playing", "refusing feeds", "irritable", "sleepy", "inconsolable"]),
    yn("associated", "cough_breathing", "Cough or fast breathing", "Any cough, noisy breathing, or breathing faster than usual?", ["cough", "fast breathing", "noisy", "wheeze", "chest indrawing", "grunting", "flaring", "rapid breathing"]),
    yn("associated", "loose_stools_vomiting", "Loose stools or vomiting", "Any loose stools or vomiting, and how many times a day?", ["loose stools", "diarrhoea", "vomiting", "times a day", "watery", "blood in stool", "green vomit"]),
    yn("associated", "urine_symptoms", "Urinary symptoms", "Any crying on passing urine, foul-smelling urine, or a change in how often the nappy is wet?", ["crying on passing urine", "foul smelling", "smelly urine", "nappy", "wet", "frequency", "burning", "straining"]),
    yn("associated", "rash", "Rash", "Any rash, and does it fade when pressed?", ["rash", "spots", "fades", "does not fade", "petechiae", "blanching", "red spots", "blisters"]),
    yn("associated", "ear_throat", "Ear or throat symptoms", "Any ear pain, ear discharge, pulling at the ear, sore throat, or refusal to swallow?", ["ear pain", "ear discharge", "pulling ear", "sore throat", "refusing to swallow", "tonsils", "drooling"]),
    yn("associated", "seizure", "Seizure", "Any fit or abnormal jerking with the fever?", ["fit", "seizure", "convulsion", "jerking", "twitching", "stiffening", "rolled eyes"]),
    yn("associated", "joint_limb", "Limb pain or refusal to use a limb", "Any swollen joint, limp, or refusal to move or bear weight on a limb?", ["joint swelling", "limp", "refusing to walk", "not moving", "bear weight", "painful limb", "swollen"]),
    yn("associated", "neck_bulging_fontanelle", "Neck stiffness or a bulging soft spot", "Any neck stiffness, arching of the back, or a bulging soft spot on the head in an infant?", ["neck stiffness", "stiff neck", "arching", "bulging fontanelle", "soft spot", "full fontanelle", "opisthotonus"]),
    yn("associated", "swelling_abscess", "Skin infection or swelling", "Any boil, abscess, wound, or red tender swelling anywhere?", ["boil", "abscess", "wound", "red", "tender", "swelling", "pus", "cellulitis", "infected"]),
    // Red flags
    yn("red_flag", "young_infant", "Fever in a baby under three months", "Is this a baby under three months of age with a fever?", ["under three months", "newborn", "neonate", "two months", "one month", "young infant", "small baby", "weeks old"], { teach: "Under three months a baby cannot localise infection and the usual signs are absent, so fever alone carries a high chance of serious bacterial infection." }),
    yn("red_flag", "lethargy_not_feeding", "Lethargy or refusal to feed", "Is the child unusually sleepy, difficult to wake, floppy, or refusing to feed altogether?", ["lethargic", "difficult to wake", "drowsy", "floppy", "not feeding", "refusing feeds", "unresponsive", "limp", "no eye contact"], { teach: "A child who will not feed or cannot be roused between fever spikes is behaving very differently from one who plays, and that difference outweighs the temperature." }),
    yn("red_flag", "non_blanching_rash", "Rash that does not fade on pressure", "Does any part of the rash stay visible when pressed with a glass?", ["does not fade", "non blanching", "stays", "petechiae", "purpura", "glass test", "bruise like", "spreading"], { teach: "A fever with a rash that will not blanch is treated as meningococcal sepsis until shown otherwise, and it can progress within hours in a child." }),
    yn("red_flag", "respiratory_distress", "Chest indrawing, grunting or flaring", "Is the chest drawing in below the ribs, is the baby grunting, or are the nostrils flaring?", ["chest indrawing", "retractions", "grunting", "flaring", "nasal flaring", "head nodding", "very fast breathing", "blue"], { teach: "Increased work of breathing and low oxygen carry more weight than the respiratory rate or what can be heard through the stethoscope." }),
    yn("red_flag", "poor_perfusion", "Cold hands and feet or mottled skin", "Are the hands and feet cold, is the skin mottled, or does colour return slowly after pressing?", ["cold hands", "cold feet", "mottled", "slow return", "capillary refill", "pale", "blue", "dusky"], { teach: "Cold mottled peripheries in a febrile child mark circulatory compromise, which arrives before the blood pressure falls." }),
    yn("red_flag", "reduced_urine", "Fewer wet nappies", "Have there been noticeably fewer wet nappies, or no urine passed for many hours?", ["fewer nappies", "dry nappy", "not passed urine", "reduced", "hours", "less urine"], { teach: "Nappy count is the most reliable measure of fluid state a parent can give, and it falls before the child looks dry." }),
    yn("red_flag", "prolonged_fever", "Fever lasting more than five days", "Has the fever lasted more than five days?", ["five days", "more than five", "a week", "persistent", "not settling", "continuing", "days"], { teach: "Fever beyond five days moves the question past a simple viral illness towards enteric fever, tuberculosis and the inflammatory syndromes of childhood." }),
    yn("red_flag", "immunisation_gap", "Immunisation not up to date", "Is immunisation incomplete or not up to date for the age?", ["not vaccinated", "incomplete", "not up to date", "missed", "no card", "due", "never vaccinated"], { teach: "An unimmunised child remains at risk from infections the schedule has otherwise made rare, and that changes the whole differential." }),
    yn("red_flag", "malnutrition", "Severe wasting or swelling of the feet", "Is the child visibly very thin, or is there swelling of both feet?", ["very thin", "wasted", "visible ribs", "swelling of feet", "oedema", "malnutrition", "not gaining", "loose skin"], { teach: "Severe malnutrition blunts fever and the signs of infection, and it changes how a child tolerates both the illness and its treatment." }),
    yn("exposure", "sick_contact", "Contact with someone ill", "Is anyone at home, at school or in the neighbourhood ill with a similar fever, rash or cough?", ["contact", "sibling", "mother", "school", "neighbourhood", "similar", "outbreak", "same illness"]),
    yn("exposure", "tb_contact", "TB contact", "Is anyone at home being treated for tuberculosis, or coughing for a long time?", ["tb", "tuberculosis", "koch", "att", "contact", "coughing long", "family member", "grandparent"]),
    yn("exposure", "mosquito_area", "Mosquito exposure and local outbreaks", "Is there mosquito exposure, stagnant water, or dengue or malaria in the area at present?", ["mosquito", "stagnant water", "dengue", "malaria", "outbreak", "area", "cooler", "monsoon"]),
    yn("exposure", "water_food", "Drinking water and food", "What is the source of drinking water, and has there been any outside or street food recently?", ["water source", "borewell", "tap", "boiled", "street food", "outside food", "hand pump", "stored water"], { tier: "detailed" }),
    yn("exposure", "recent_travel_admission", "Recent travel or hospital admission", "Any recent travel, or hospital admission or procedure in the past weeks?", ["travel", "village", "admitted", "hospital", "procedure", "catheter", "recently discharged"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "viral", name: "Viral illness", pointers: ["cough_breathing", "sick_contact", "activity_feeding"], discriminators: ["activity_feeding", "cough_breathing", "sick_contact", "prolonged_fever", "fever_pattern", "rash"] },
    { id: "pneumonia", name: "Pneumonia", pointers: ["cough_breathing", "respiratory_distress"], discriminators: ["cough_breathing", "respiratory_distress", "activity_feeding", "fever_pattern", "immunisation"] },
    { id: "uti", name: "Urinary tract infection", pointers: ["urine_symptoms", "young_infant", "reduced_urine"], discriminators: ["urine_symptoms", "young_infant", "loose_stools_vomiting", "fever_pattern", "prolonged_fever"] },
    { id: "meningitis", name: "Meningitis", pointers: ["neck_bulging_fontanelle", "seizure", "lethargy_not_feeding", "non_blanching_rash"], discriminators: ["neck_bulging_fontanelle", "seizure", "lethargy_not_feeding", "non_blanching_rash", "young_infant", "immunisation_gap"] },
    { id: "malaria", name: "Malaria", pointers: ["fever_pattern", "mosquito_area"], discriminators: ["fever_pattern", "mosquito_area", "recent_travel_admission", "prolonged_fever", "activity_feeding"] },
    { id: "dengue", name: "Dengue", pointers: ["mosquito_area", "rash", "poor_perfusion"], discriminators: ["mosquito_area", "rash", "poor_perfusion", "non_blanching_rash", "fever_pattern", "loose_stools_vomiting"] },
    { id: "enteric", name: "Enteric fever", pointers: ["prolonged_fever", "water_food", "loose_stools_vomiting"], discriminators: ["prolonged_fever", "water_food", "fever_pattern", "activity_feeding", "rash"] },
    { id: "otitis_throat", name: "Otitis media or throat infection", pointers: ["ear_throat"], discriminators: ["ear_throat", "cough_breathing", "activity_feeding", "fever_pattern"] },
    { id: "tuberculosis", name: "Tuberculosis", pointers: ["tb_contact", "prolonged_fever", "malnutrition", "growth"], discriminators: ["tb_contact", "prolonged_fever", "growth", "malnutrition", "cough_breathing", "immunisation"] },
    { id: "skin_bone_joint", name: "Skin, bone or joint focus", pointers: ["swelling_abscess", "joint_limb"], discriminators: ["swelling_abscess", "joint_limb", "fever_pattern", "activity_feeding"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "fever_pattern", "activity_feeding", "feeding_nutrition", "progression", "birth_history", "immunisation", "development", "prior_treatment", "prior_investigations"],
  },
};
