import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * PALPITATIONS — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult medicine ward, north India. The history does most of the work here: rate and regularity
 * tapped out by the patient, how it starts and stops, and what happened during the episode.
 * Differentials: sinus tachycardia (anaemia, fever, thyrotoxicosis, anxiety), atrial
 * fibrillation or flutter, supraventricular tachycardia, ventricular tachycardia, ectopic beats,
 * drug or stimulant effect, hypoglycaemia, structural or rheumatic heart disease.
 */
export const palpitationsV1: HistoryTree = {
  id: "palpitations",
  version: "1.0.0",
  complaint: "Palpitations",
  triggers: ["palpitations", "palpitation", "heart racing", "racing heart", "fluttering", "heart beating fast", "awareness of heartbeat", "thumping in chest", "irregular heartbeat", "dhadkan"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    rce("Did this patient have cardiac syncope? The Rational Clinical Examination systematic review", 2019, "31237649"),
    rce("Does this patient with chest pain have acute coronary syndrome? The Rational Clinical Examination systematic review", 2015, "26547467"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("palpitations"),
    val("hpi", "rate_rhythm", "Rate and rhythm", "Can the patient tap out the beat — fast or slow, regular or irregular?", ["fast", "slow", "regular", "irregular", "tapping", "racing", "skipping", "missed beat", "rate", "rhythm", "thumping"]),
    val("hpi", "start_stop", "How it starts and stops", "Does an episode start and stop suddenly, or build up and fade away gradually?", ["sudden", "suddenly", "abrupt", "gradual", "builds up", "fades", "switch", "starts suddenly", "stops suddenly", "tapers"]),
    val("hpi", "episode_duration", "How long an episode lasts", "How long does one episode last — seconds, minutes, or hours?", ["seconds", "minutes", "hours", "few seconds", "half an hour", "all day", "lasts", "duration of episode"], { numeric: true }),
    val("hpi", "frequency", "How often", "How often do the episodes come — many times a day, weekly, or rarely?", ["times a day", "daily", "weekly", "monthly", "rarely", "every day", "occasionally", "frequency", "once in"]),
    val("hpi", "trigger", "Trigger", "What brings it on — exertion, rest, lying on one side, emotion, tea or coffee, or nothing at all?", ["exertion", "rest", "lying down", "left side", "emotion", "stress", "tea", "coffee", "no trigger", "on standing", "after meals", "at night"]),
    yn("hpi", "termination_manoeuvre", "What stops it", "Does anything stop an episode — holding the breath, bearing down, coughing, or splashing cold water?", ["holding breath", "bearing down", "valsalva", "coughing", "cold water", "stops on its own", "pressing neck"], { tier: "detailed" }),
    yn("associated", "chest_pain", "Chest pain", "Any chest pain or heaviness with the episodes?", ["chest pain", "chest heaviness", "chest discomfort", "retrosternal", "tightness"]),
    yn("associated", "breathlessness", "Breathlessness", "Any breathlessness during the episodes, or on exertion between them?", ["breathlessness", "breathless", "shortness of breath", "dyspnoea", "on exertion", "orthopnoea"]),
    yn("associated", "giddiness", "Giddiness / near-faint", "Any giddiness, dimming of vision, or a feeling of about to faint?", ["giddiness", "dizziness", "near faint", "about to faint", "dimming", "blackout", "light headed"]),
    yn("associated", "sweating_tremor", "Sweating / tremor / hunger", "Any sweating, tremor, or hunger with the episodes?", ["sweating", "tremor", "shaking", "hunger", "cold sweat", "clammy"]),
    yn("associated", "weight_heat", "Weight loss / heat intolerance", "Any weight loss, heat intolerance, or loose stools?", ["weight loss", "heat intolerance", "loose stools", "increased appetite", "sweating excessively", "irritability"]),
    yn("associated", "anaemia_symptoms", "Pallor / tiredness / bleeding", "Any tiredness, pallor, heavy periods, or black stools?", ["tiredness", "pallor", "pale", "heavy periods", "menorrhagia", "black stools", "melaena", "bleeding"]),
    yn("associated", "anxiety", "Anxiety / panic", "Any anxiety, fear, or tingling around the mouth and hands with the episodes?", ["anxiety", "panic", "fear", "tingling", "hyperventilation", "stress", "worry"], { tier: "detailed" }),
    yn("associated", "swelling_orthopnoea", "Leg swelling / breathless lying flat", "Any leg swelling, or breathlessness on lying flat or at night?", ["leg swelling", "pedal oedema", "orthopnoea", "lying flat", "pnd", "night breathlessness"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "syncope_during", "Fainting during an episode", "Did the patient actually faint or fall during an episode, rather than just feel giddy?", ["fainted", "faint", "collapsed", "loss of consciousness", "fell", "blackout", "syncope", "unconscious"], { teach: "Fainting during a palpitation, rather than merely feeling giddy, points to a rhythm that briefly stopped the circulation." }),
    yn("red_flag", "exertional", "Palpitations on exertion", "Does exertion bring the episodes on, rather than their coming at rest?", ["on exertion", "while walking", "climbing stairs", "during exercise", "physical activity", "while working"], { teach: "Palpitations brought on by exertion, rather than at rest, raise a structural or exercise-triggered rhythm problem." }),
    yn("red_flag", "chest_pain_severe", "Chest pain / breathlessness at rest", "Any severe chest pain, or breathlessness at rest, during the episodes?", ["severe chest pain", "crushing", "breathless at rest", "sweating with chest pain", "radiating to arm", "jaw"], { teach: "Chest pain or breathlessness at rest alongside palpitations widens the question to ischaemia and to failing pump function." }),
    yn("red_flag", "family_sudden_death", "Family history of sudden death", "Any sudden or unexplained death in a young family member, or unexplained drowning?", ["sudden death", "died suddenly", "young age", "unexplained death", "drowning", "family history", "brother", "sister", "father"], { teach: "A young relative who died suddenly or drowned unexpectedly raises an inherited rhythm disorder, and only the history can ask about it." }),
    yn("red_flag", "structural_heart_disease", "Known heart disease", "Any known rheumatic heart disease, valve problem, past heart attack, or weak heart?", ["rheumatic heart disease", "rhd", "valve", "heart attack", "myocardial infarction", "cardiomyopathy", "weak heart", "ejection fraction", "heart failure"], { teach: "A heart already scarred by rheumatic valve disease or a past infarct changes what a palpitation can mean." }),
    yn("red_flag", "stroke_symptoms", "Weakness / speech disturbance", "Any episode of limb weakness, facial deviation, or slurred speech?", ["weakness", "facial deviation", "slurred speech", "slurring", "hemiparesis", "transient weakness", "numbness"], { tier: "detailed", teach: "An irregular rhythm can throw a clot to the brain, so a past weakness or speech episode belongs in this history." }),
    PREGNANCY,
    yn("exposure", "stimulants_drugs", "Stimulants and drugs", "Any tea, coffee, tobacco, alcohol, thyroid tablets, inhalers, decongestants, or weight-loss remedies?", ["tea", "coffee", "caffeine", "tobacco", "alcohol", "thyroxine", "inhaler", "salbutamol", "decongestant", "weight loss", "supplements", "energy drink"]),
    yn("exposure", "diuretics_vomiting", "Diuretics / vomiting / loose stools", "Any water tablets, recent vomiting, or loose stools?", ["diuretic", "water tablet", "furosemide", "vomiting", "loose stools", "diarrhoea", "potassium"], { tier: "detailed" }),
    yn("exposure", "rheumatic_fever", "Past rheumatic fever / sore throat in childhood", "Any childhood rheumatic fever, joint pains with fever, or recurrent sore throats?", ["rheumatic fever", "joint pains", "childhood", "sore throat", "chorea", "penicillin injections"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "sinus_secondary", name: "Sinus tachycardia from a secondary cause", pointers: ["anaemia_symptoms", "weight_heat", "stimulants_drugs"], discriminators: ["rate_rhythm", "start_stop", "anaemia_symptoms", "weight_heat", "stimulants_drugs", "trigger"] },
    { id: "atrial_fibrillation", name: "Atrial fibrillation / flutter", pointers: ["rate_rhythm", "structural_heart_disease", "stroke_symptoms", "rheumatic_fever"], discriminators: ["rate_rhythm", "episode_duration", "structural_heart_disease", "stroke_symptoms", "rheumatic_fever", "breathlessness"] },
    { id: "svt", name: "Supraventricular tachycardia", pointers: ["start_stop", "termination_manoeuvre", "rate_rhythm"], discriminators: ["start_stop", "termination_manoeuvre", "rate_rhythm", "episode_duration", "giddiness"] },
    { id: "vt", name: "Ventricular tachycardia", pointers: ["syncope_during", "structural_heart_disease", "exertional", "family_sudden_death"], discriminators: ["syncope_during", "structural_heart_disease", "exertional", "family_sudden_death", "chest_pain_severe"] },
    { id: "ectopics", name: "Ectopic beats", pointers: ["rate_rhythm", "trigger"], discriminators: ["rate_rhythm", "episode_duration", "trigger", "frequency"] },
    { id: "thyrotoxicosis", name: "Thyrotoxicosis", pointers: ["weight_heat"], discriminators: ["weight_heat", "sweating_tremor", "rate_rhythm", "frequency"] },
    { id: "anaemia", name: "Anaemia", pointers: ["anaemia_symptoms", "breathlessness"], discriminators: ["anaemia_symptoms", "breathlessness", "rate_rhythm", "trigger"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["sweating_tremor"], discriminators: ["sweating_tremor", "trigger", "prior_treatment", "episode_duration"] },
    { id: "anxiety", name: "Anxiety / panic", pointers: ["anxiety"], discriminators: ["anxiety", "start_stop", "trigger", "rate_rhythm"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "rate_rhythm", "start_stop", "episode_duration", "frequency", "trigger", "termination_manoeuvre", "progression", "prior_treatment", "prior_investigations"],
  },
};
