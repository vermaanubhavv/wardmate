import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * PALPITATIONS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: supraventricular tachycardia, atrial fibrillation / flutter, ventricular
 * tachycardia, sinus tachycardia (anaemia, fever, thyroid excess, anxiety, hypovolaemia),
 * ectopic beats, panic / anxiety, drug or stimulant induced, hypoglycaemia.
 */
export const palpitationsV1: HistoryTree = {
  id: "palpitations",
  version: "1.0.0",
  complaint: "Palpitations",
  triggers: ["palpitations", "palpitation", "racing heart", "heart racing", "fast heart beat", "fast heartbeat", "pounding", "fluttering", "irregular heart beat", "missed beats"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Palpitations: evaluation in the primary care setting (systematic review)", source: "Ann Intern Med", year: 1998, pmid: "9556463" },
    { title: "ESC guidelines for the management of patients with supraventricular tachycardia", source: "Eur Heart J", year: 2020, pmid: "31504425" },
    rce("Is this patient clinically depressed?", 2002),
    MACLEODS,
  ],
  slots: [
    ...commonHpi("palpitations"),
    val("hpi", "character", "Character", "Can the patient tap out the rhythm — fast and regular, fast and irregular, or single skipped beats?", ["regular", "irregular", "fast", "rapid", "skipped", "missed beat", "thumping", "pounding", "fluttering", "tap", "rhythm", "character"]),
    val("hpi", "onset_offset", "Onset and offset", "Is the start and stop of each episode sudden, or gradual?", ["suddenly", "sudden", "abruptly", "gradually", "gradual", "builds up", "fades", "stops suddenly", "onset", "offset", "switch"]),
    val("hpi", "episode_duration", "Duration of each episode", "How long does each episode last — seconds, minutes, or hours?", ["seconds", "minutes", "hours", "lasts", "lasted", "episode", "duration", "days"], { numeric: true }),
    val("hpi", "frequency", "Frequency", "How often do the episodes occur?", ["daily", "weekly", "times a day", "times a week", "once", "frequency", "every", "occasionally", "continuous"]),
    val("hpi", "triggers", "Triggers", "What brings it on — exertion, rest, lying on the left side, stress, caffeine, standing up?", ["exertion", "exercise", "rest", "lying", "left side", "stress", "anxiety", "caffeine", "tea", "coffee", "standing", "after meals", "trigger", "brought on"]),
    val("hpi", "termination", "What stops it", "What stops the episode — holding breath, cold water, vomiting, rest, or nothing?", ["holding breath", "valsalva", "cold water", "vomiting", "rest", "stops on its own", "nothing", "terminat", "relieved"], { tier: "detailed" }),
    val("hpi", "activity_at_onset", "Activity at onset", "What was the patient doing when it started — at rest, during exertion, on waking, at night?", ["at rest", "during exertion", "walking", "sleeping", "woke", "night", "sitting", "activity"], { tier: "detailed" }),
    yn("associated", "chest_pain", "Chest pain", "Any chest pain or tightness with the episodes?", ["chest pain", "chest tightness", "chest discomfort", "angina"]),
    yn("associated", "breathlessness", "Breathlessness", "Any breathlessness with the episodes?", ["breathlessness", "breathless", "dyspnoea", "dyspnea", "shortness of breath"]),
    yn("associated", "giddiness", "Giddiness / light-headedness", "Any giddiness or light-headedness with the episodes?", ["giddiness", "giddy", "light headed", "lightheaded", "dizziness", "dizzy", "presyncope"]),
    yn("associated", "sweating_tremor", "Sweating / tremor / heat intolerance", "Any sweating, tremor, heat intolerance or weight loss between episodes?", ["sweating", "tremor", "heat intolerance", "weight loss", "thyroid", "goitre"]),
    yn("associated", "anxiety_features", "Anxiety features", "Any tingling of the hands and lips, fear, or a sense of impending doom with the episodes?", ["tingling", "fear", "impending doom", "panic", "anxious", "anxiety", "hyperventilat", "choking feeling"], { tier: "detailed" }),
    yn("associated", "polyuria_after", "Passing urine after an episode", "Does the patient pass a large amount of urine after an episode?", ["polyuria", "passes urine after", "large amount of urine", "urine after"], { tier: "detailed" }),
    yn("associated", "fever_pallor_bleeding", "Fever / pallor / blood loss", "Any fever, pallor, or recent blood loss (sinus tachycardia)?", ["fever", "pallor", "pale", "blood loss", "bleeding", "menorrhagia", "anaemia", "anemia"], { tier: "detailed" }),
    yn("associated", "previous_episodes", "Previous episodes / prior ECG", "Has this happened before, and was an ECG taken during an episode?", ["previous", "before", "earlier", "recurrent", "ecg during", "holter", "documented"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "syncope", "Syncope with palpitations", "Has the patient fainted or nearly fainted during an episode?", ["syncope", "fainted", "fainting", "blackout", "loss of consciousness", "collapsed", "nearly fainted"], { teach: "A blackout during palpitations points to a ventricular arrhythmia or a very fast supraventricular rate, which needs monitoring rather than reassurance." }),
    yn("red_flag", "exertional", "Palpitations on exertion", "Are the episodes brought on by exertion?", ["exertion", "exercise", "on walking", "climbing", "during activity", "exertional"], { teach: "Palpitations brought on by exertion raise structural heart disease and catecholamine-sensitive arrhythmias, unlike those at rest." }),
    yn("red_flag", "structural_heart_disease", "Known heart disease", "Any known heart attack, heart failure, valve disease, cardiomyopathy or heart surgery?", ["heart attack", "myocardial infarction", "mi", "heart failure", "valve", "rheumatic", "cardiomyopathy", "heart surgery", "heart disease", "stent"], { teach: "In a scarred or dilated heart the same symptom is far more likely to be ventricular tachycardia." }),
    yn("red_flag", "family_sudden_death", "Family history of sudden death", "Has anyone in the family died suddenly at a young age, or drowned or fainted unexplained?", ["sudden death", "died suddenly", "family history", "young age", "drowned", "unexplained fainting", "inherited"], { teach: "Sudden death in a young relative raises an inherited arrhythmia syndrome or cardiomyopathy that an ECG may show." }),
    yn("red_flag", "chest_pain_breathless_with", "Chest pain or breathlessness during episodes", "Are the episodes accompanied by chest pain or breathlessness?", ["chest pain", "breathless", "breathlessness", "dyspnoea"], { teach: "Ischaemia or heart failure during the episode marks a rate the heart cannot tolerate." }),
    yn("red_flag", "drugs_stimulants", "Drugs / stimulants", "Any salbutamol, thyroxine, decongestants, energy drinks, alcohol binge, or recreational stimulant use?", ["salbutamol", "thyroxine", "decongestant", "energy drink", "alcohol", "binge", "cocaine", "amphetamine", "stimulant", "tobacco", "gutkha"], { teach: "A stimulant or a drug explains many episodes; without asking, the search moves to the heart." }),
    yn("red_flag", "diabetes_hypoglycaemia", "Diabetes on treatment", "Is the patient diabetic on insulin or tablets, and do episodes come with hunger or sweating?", ["diabetes", "diabetic", "insulin", "hunger", "sweating", "hypoglycaemia", "sugar low"], { teach: "Hypoglycaemia presents as palpitations with sweating and hunger in a treated diabetic." }),
    PREGNANCY,
    // Exposures
    yn("exposure", "caffeine_tobacco", "Caffeine / tobacco", "How much tea, coffee, or tobacco does the patient take?", ["tea", "coffee", "caffeine", "tobacco", "smoking", "cigarettes", "beedi", "gutkha"], { tier: "detailed" }),
    yn("exposure", "sleep_stress", "Sleep and stress", "Any recent sleep loss, stress or bereavement?", ["sleep", "stress", "bereavement", "worry", "tension", "exams"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "svt", name: "Supraventricular tachycardia", pointers: ["onset_offset", "character", "termination", "polyuria_after"], discriminators: ["onset_offset", "character", "termination", "polyuria_after", "episode_duration", "syncope", "previous_episodes"] },
    { id: "af", name: "Atrial fibrillation / flutter", pointers: ["character", "structural_heart_disease", "sweating_tremor"], discriminators: ["character", "structural_heart_disease", "sweating_tremor", "drugs_stimulants", "breathlessness", "episode_duration"] },
    { id: "vt", name: "Ventricular tachycardia", pointers: ["syncope", "structural_heart_disease", "exertional", "chest_pain_breathless_with"], discriminators: ["syncope", "structural_heart_disease", "exertional", "chest_pain_breathless_with", "family_sudden_death", "onset_offset"] },
    { id: "sinus_tachy", name: "Sinus tachycardia (fever, anaemia, thyroid, hypovolaemia)", pointers: ["fever_pallor_bleeding", "sweating_tremor", "onset_offset"], discriminators: ["fever_pallor_bleeding", "sweating_tremor", "onset_offset", "triggers", "pregnancy"] },
    { id: "ectopics", name: "Ectopic beats", pointers: ["character", "activity_at_onset"], discriminators: ["character", "activity_at_onset", "episode_duration", "caffeine_tobacco", "syncope"] },
    { id: "anxiety", name: "Panic / anxiety", pointers: ["anxiety_features", "sleep_stress", "triggers"], discriminators: ["anxiety_features", "sleep_stress", "triggers", "onset_offset", "syncope", "exertional", "previous_episodes"] },
    { id: "drug_induced", name: "Drug or stimulant induced", pointers: ["drugs_stimulants", "caffeine_tobacco"], discriminators: ["drugs_stimulants", "caffeine_tobacco", "triggers", "onset_offset"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["diabetes_hypoglycaemia"], discriminators: ["diabetes_hypoglycaemia", "sweating_tremor", "triggers", "termination"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "character", "onset_offset", "episode_duration", "frequency", "triggers", "termination", "activity_at_onset", "progression", "prior_treatment", "prior_investigations"],
  },
};
