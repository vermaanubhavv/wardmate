import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * SHOCK / UNDIFFERENTIATED HYPOTENSION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Emergency ward, north India. A history taken in parallel with resuscitation rather than
 * before it, organised around the four mechanisms: loss of volume, failure of the pump,
 * obstruction to filling, and loss of vascular tone. Differentials: hypovolaemic shock from
 * bleeding or fluid loss, septic shock, cardiogenic shock, obstructive shock (tamponade,
 * tension pneumothorax, pulmonary embolism), anaphylaxis, adrenal crisis, neurogenic shock,
 * and shock from poisoning or envenomation.
 */
export const shockV1: HistoryTree = {
  id: "shock",
  version: "1.0.0",
  complaint: "Shock / low blood pressure",
  triggers: ["shock", "hypotension", "low bp", "low blood pressure", "collapse", "collapsed", "unrecordable bp", "cold peripheries", "pulse not felt", "fainting", "peripheries cold"],
  setting: "Emergency ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    rce("The rational clinical examination. Is this patient hypovolemic?", 1999, "10086438"),
    rce("Does this patient with chest pain have acute coronary syndrome? The Rational Clinical Examination systematic review", 2015, "26547467"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("collapse"),
    val("informant", "collateral", "Collateral history", "Who brought the patient, what did they see, and what treatment was given before arrival?", ["brought by", "family", "saw", "found", "local doctor", "treatment outside", "drip", "injection", "referred from"]),
    val("hpi", "speed_of_onset", "How quickly it came on", "Did the collapse happen over seconds, minutes, or hours to days?", ["seconds", "minutes", "hours", "days", "sudden", "gradual", "suddenly", "over time", "abrupt"]),
    val("hpi", "preceding_symptoms", "What came first", "What was the first thing the patient complained of before collapsing — fever, chest pain, breathlessness, bleeding, pain, or giddiness?", ["fever", "chest pain", "breathlessness", "bleeding", "pain", "giddiness", "vomiting", "loose stools", "abdominal pain", "rash", "first complained"]),
    yn("hpi", "posture_related", "Related to standing", "Did it happen on standing up or after prolonged standing?", ["on standing", "after standing", "got up", "postural", "prolonged standing", "sitting up"]),
    yn("associated", "bleeding_visible", "Visible bleeding", "Any bleeding seen — vomiting blood, black stools, bleeding per vaginum, from a wound, or from the nose?", ["vomiting blood", "haematemesis", "black stools", "melaena", "bleeding per vaginum", "wound", "nose", "visible blood", "trauma"]),
    yn("associated", "fluid_losses", "Vomiting, loose stools or poor intake", "Any vomiting, loose stools, high fever with sweating, or inability to drink over the past days?", ["vomiting", "loose stools", "diarrhoea", "sweating", "not drinking", "poor intake", "dehydrated", "burns"]),
    yn("associated", "fever_infection", "Fever or a source of infection", "Any fever, chills, cough, burning urine, a wound, or an abscess?", ["fever", "chills", "rigors", "cough", "burning urine", "wound", "abscess", "cellulitis", "infection", "pus"]),
    yn("associated", "chest_pain_breathless", "Chest pain or breathlessness", "Any chest pain, breathlessness, or palpitations before the collapse?", ["chest pain", "breathlessness", "breathless", "palpitations", "tightness", "radiating", "sweating with chest pain"]),
    yn("associated", "abdominal_pain", "Abdominal or back pain", "Any severe abdominal or back pain, and did it come on suddenly?", ["abdominal pain", "back pain", "severe", "sudden", "tearing", "colicky", "distension"]),
    yn("associated", "rash_swelling", "Rash, itching or swelling of the face", "Any rash, itching, swelling of the lips or face, or difficulty breathing soon after a drug, food or sting?", ["rash", "itching", "hives", "swelling of lips", "face", "throat", "wheeze", "after injection", "after food", "sting", "immediately"]),
    yn("associated", "urine_output", "Urine passed", "How much urine has been passed since this began?", ["urine", "not passed", "reduced", "less urine", "catheter", "dark", "how much"]),
    yn("associated", "altered_sensorium", "Drowsiness or confusion", "Any drowsiness, confusion, or restlessness?", ["drowsy", "confusion", "restless", "agitated", "unresponsive", "irrelevant talk", "altered"]),
    yn("associated", "limb_weakness_trauma", "Injury or limb weakness", "Any injury, especially to the chest, abdomen or spine, or any weakness of the limbs?", ["injury", "trauma", "accident", "fall", "chest", "abdomen", "spine", "weakness", "cannot move legs"]),
    // Red flags
    yn("red_flag", "ongoing_bleeding", "Bleeding that has not stopped", "Is there bleeding that is still going on, internally or externally?", ["still bleeding", "continuing", "not stopped", "large amount", "clots", "soaked", "internal", "ongoing"], { teach: "In a bleeding patient the pressure follows the bleeding, so whether it has stopped matters more than any single reading." }),
    yn("red_flag", "trauma_mechanism", "Significant injury", "Was there a road traffic collision, a fall from height, or a penetrating injury?", ["road traffic", "fall from height", "penetrating", "stab", "gunshot", "crush", "thrown", "high speed"], { teach: "After significant injury, bleeding into the chest, abdomen, pelvis or thighs can be large and completely hidden." }),
    yn("red_flag", "anaphylaxis_trigger", "Collapse within minutes of a drug, food or sting", "Did the collapse follow within minutes of an injection, a tablet, a food, or an insect sting?", ["within minutes", "after injection", "after tablet", "after food", "sting", "bee", "immediately after", "minutes later", "contrast"], { teach: "A collapse within minutes of an exposure, especially with rash or swelling, points to anaphylaxis, which is reversed by an action taken early." }),
    yn("red_flag", "chest_pain_ischaemic", "Chest pain with sweating", "Was there chest pain with sweating, or pain radiating to the arm, jaw or back?", ["chest pain", "sweating", "radiating", "arm", "jaw", "back", "crushing", "heaviness", "tearing"], { teach: "Chest pain with sweating alongside a low pressure raises a failing pump or a tearing aorta, two problems managed in opposite directions." }),
    yn("red_flag", "sudden_breathlessness", "Sudden breathlessness", "Did severe breathlessness come on abruptly, with or without chest pain?", ["sudden breathlessness", "abrupt", "severe", "gasping", "cannot breathe", "chest pain", "one side"], { teach: "Abrupt breathlessness with collapse raises an obstruction to filling, such as a clot in the lung or air trapped in the chest." }),
    yn("red_flag", "steroid_withdrawal", "Long-term steroids recently stopped", "Is the patient on long-term steroids, and were they recently stopped or missed?", ["steroid", "steroids", "prednisolone", "stopped", "missed", "long term", "addison", "adrenal"], { teach: "Stopping long-term steroids abruptly can produce a collapse that does not respond to fluid alone, and only the history finds it." }),
    yn("red_flag", "envenomation_poisoning", "Snake bite, sting or poisoning", "Any snake bite, scorpion sting, or substance swallowed before this?", ["snake bite", "scorpion", "sting", "poison", "swallowed", "insecticide", "celphos", "phosphide", "tablet"], { teach: "Envenomation and several common poisons cause collapse directly, and each has its own course that a general approach will miss." }),
    yn("red_flag", "pregnancy_bleeding", "Pregnancy or recent delivery", "Is the patient pregnant, recently delivered, or has she missed a period, and is there any bleeding or abdominal pain?", ["pregnant", "missed period", "amenorrhoea", "delivered", "postpartum", "bleeding", "abdominal pain", "lmp", "ectopic"], { teach: "In a woman of childbearing age, collapse with abdominal pain and a missed period is a ruptured ectopic pregnancy until excluded." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "cardiac_history", "Known heart disease", "Any known heart disease, previous heart attack, valve disease, or pacemaker?", ["heart disease", "heart attack", "myocardial infarction", "valve", "rheumatic", "pacemaker", "cardiomyopathy", "ejection fraction"]),
    yn("exposure", "medications", "Regular medicines", "What regular medicines are being taken, especially blood pressure tablets, water tablets, insulin, or blood thinners?", ["antihypertensive", "bp tablets", "diuretic", "water tablet", "insulin", "blood thinner", "beta blocker", "recently started", "dose changed"]),
    yn("exposure", "recent_procedure", "Recent surgery, procedure or immobility", "Any recent surgery, procedure, plaster cast, long journey, or prolonged bed rest?", ["surgery", "operation", "procedure", "plaster", "long journey", "bed rest", "immobile", "recently discharged"]),
    yn("exposure", "dialysis_organ_failure", "Dialysis or known organ failure", "Is the patient on dialysis, or known to have kidney, liver or lung failure?", ["dialysis", "kidney failure", "ckd", "liver failure", "cirrhosis", "copd", "oxygen at home", "missed dialysis"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "haemorrhagic", name: "Haemorrhagic shock", pointers: ["ongoing_bleeding", "bleeding_visible", "trauma_mechanism", "pregnancy_bleeding"], discriminators: ["ongoing_bleeding", "bleeding_visible", "trauma_mechanism", "pregnancy_bleeding", "abdominal_pain", "speed_of_onset"] },
    { id: "hypovolaemic_nonhaemorrhagic", name: "Hypovolaemic shock from fluid loss", pointers: ["fluid_losses", "urine_output", "posture_related"], discriminators: ["fluid_losses", "urine_output", "posture_related", "fever_infection", "speed_of_onset", "bleeding_visible"] },
    { id: "septic", name: "Septic shock", pointers: ["fever_infection", "altered_sensorium", "immunocompromise"], discriminators: ["fever_infection", "altered_sensorium", "immunocompromise", "urine_output", "speed_of_onset", "dialysis_organ_failure"] },
    { id: "cardiogenic", name: "Cardiogenic shock", pointers: ["chest_pain_ischaemic", "chest_pain_breathless", "cardiac_history"], discriminators: ["chest_pain_ischaemic", "chest_pain_breathless", "cardiac_history", "medications", "speed_of_onset", "sudden_breathlessness"] },
    { id: "obstructive", name: "Obstructive shock (tamponade, tension pneumothorax, pulmonary embolism)", pointers: ["sudden_breathlessness", "recent_procedure", "trauma_mechanism"], discriminators: ["sudden_breathlessness", "recent_procedure", "trauma_mechanism", "chest_pain_breathless", "cardiac_history"] },
    { id: "anaphylaxis", name: "Anaphylaxis", pointers: ["anaphylaxis_trigger", "rash_swelling"], discriminators: ["anaphylaxis_trigger", "rash_swelling", "speed_of_onset", "sudden_breathlessness"] },
    { id: "adrenal_crisis", name: "Adrenal crisis", pointers: ["steroid_withdrawal", "fluid_losses"], discriminators: ["steroid_withdrawal", "fluid_losses", "abdominal_pain", "altered_sensorium", "medications"] },
    { id: "neurogenic", name: "Neurogenic shock", pointers: ["limb_weakness_trauma", "trauma_mechanism"], discriminators: ["limb_weakness_trauma", "trauma_mechanism", "speed_of_onset", "chest_pain_breathless"] },
    { id: "toxic", name: "Shock from poisoning or envenomation", pointers: ["envenomation_poisoning"], discriminators: ["envenomation_poisoning", "speed_of_onset", "altered_sensorium", "preceding_symptoms", "medications"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "speed_of_onset", "preceding_symptoms", "posture_related", "progression", "prior_treatment", "prior_investigations"],
  },
};
