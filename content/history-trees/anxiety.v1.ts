import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, KAPLAN_SADOCK, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * ANXIETY / PANIC ATTACKS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Psychiatry ward and OPD, north India, where anxiety usually arrives as a body complaint —
 * ghabrahat, heart sinking, a choking feeling, "gas" rising to the chest — after a round of
 * normal ECGs. The tree asks what an attack is like, what it is tied to, and what the body
 * could be doing instead, before it asks what the mind is doing.
 * Differentials: panic disorder, generalised anxiety disorder, phobias, obsessive-compulsive
 * disorder, PTSD or acute stress reaction, somatic symptom disorder, depression with anxiety,
 * substance- or withdrawal-related anxiety, and the medical mimics — thyrotoxicosis,
 * arrhythmia, hypoglycaemia, asthma and phaeochromocytoma.
 */
export const anxietyV1: HistoryTree = {
  id: "anxiety",
  version: "1.0.0",
  complaint: "Anxiety / panic attacks",
  triggers: ["anxiety", "anxious", "panic", "panic attack", "panic attacks", "ghabrahat", "ghabrahat hona", "bechaini", "tension", "worry", "worrying", "excessive worry", "fear", "phobia", "nervousness", "dil baith raha", "dil dubna", "choking feeling", "ocd", "obsessions", "compulsions", "repeated hand washing"],
  setting: "Psychiatry ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [KAPLAN_SADOCK, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("anxiety"),
    val("hpi", "anxiety_description", "How the anxiety is described", "In the patient's own words, what does the anxiety feel like, and is it in attacks or present most of the time?", ["ghabrahat", "bechaini", "heart sinking", "fear", "tension", "worry", "attacks", "all the time", "most of the day", "comes suddenly", "own words"]),
    val("hpi", "attack_features", "What happens in an attack", "During an attack, is there pounding heart, breathlessness, choking, chest tightness, sweating, trembling, tingling, dizziness, or fear of dying or losing control?", ["palpitation", "heart pounding", "breathless", "choking", "chest tight", "sweating", "trembling", "tingling", "numbness", "dizzy", "fear of dying", "going mad", "losing control"]),
    val("hpi", "attack_timing", "Length and frequency of attacks", "How long does an attack last, how often do they come, and have any woken the patient from sleep?", ["minutes", "hours", "times a week", "daily", "at night", "wakes from sleep", "peak", "settles"], { numeric: true }),
    val("hpi", "attack_triggers", "Situations that bring it on", "Are the attacks out of the blue, or do they come only in particular places or situations — crowds, travel, going out alone, heights, needles, or being watched?", ["out of the blue", "unexpected", "crowd", "market", "bus", "travelling", "alone", "heights", "closed space", "needles", "blood", "public speaking", "being watched", "exams"]),
    yn("hpi", "avoidance", "Avoidance and anticipatory fear", "Are places or activities now avoided for fear of an attack, and is there worry between attacks about the next one?", ["avoids", "stopped going", "does not go out", "needs company", "fear of next attack", "anticipatory", "housebound", "no avoidance"]),
    yn("hpi", "generalised_worry", "Worry about many everyday things", "Is there worry about many everyday matters — health, family, money, work — that is hard to control, with tension, poor sleep and tiredness?", ["worries about everything", "cannot stop worrying", "family", "money", "health", "tense", "muscle tension", "on edge", "poor sleep", "tired", "irritable"]),
    yn("hpi", "obsessions_compulsions", "Unwanted repeated thoughts or acts", "Are there unwanted thoughts that keep returning — dirt, doubt, harm, religious or sexual — or acts repeated to settle them, such as washing, checking or counting?", ["repeated thoughts", "cannot stop thinking", "dirt", "contamination", "doubt", "checking", "washing", "counting", "cleaning", "hours", "knows it is excessive", "rituals"]),
    yn("hpi", "trauma_exposure", "A frightening event and its return", "Was there a frightening or life-threatening event — assault, accident, violence, disaster — and does it return as nightmares, flashbacks or startling?", ["accident", "assault", "violence", "abuse", "disaster", "death seen", "nightmares", "flashbacks", "startle", "avoids reminders", "since the event"], { teach: "Anxiety that dates from a particular event reads differently, and the event is often not volunteered unless asked." }),
    yn("associated", "somatic_focus", "Body symptoms and many consultations", "Is there repeated worry about a physical illness, many doctors consulted or tests done, and reassurance that does not last?", ["many doctors", "tests normal", "reports normal", "ecg normal", "gas", "heart problem", "worried about illness", "not reassured", "repeated visits"]),
    yn("associated", "low_mood", "Low mood and loss of interest", "Has there also been low mood, loss of interest, or hopelessness alongside the anxiety?", ["low mood", "sad", "loss of interest", "hopeless", "crying", "not enjoying", "mood okay"]),
    yn("associated", "sleep_appetite", "Sleep and appetite", "How have sleep and appetite been — difficulty falling asleep, waking with worry, or eating less?", ["difficulty falling asleep", "cannot sleep", "waking at night", "appetite", "eating less", "weight loss", "sleep normal"], { tier: "detailed" }),
    yn("associated", "thyroid_features", "Heat intolerance, weight loss, tremor", "Any weight loss despite eating well, heat intolerance, fine tremor of the hands, or a swelling in the front of the neck?", ["weight loss", "eating well", "heat intolerance", "sweating", "tremor", "hands shake", "neck swelling", "goitre", "thyroid", "loose stools"], { teach: "An overactive thyroid produces the same racing heart and restlessness, and is worth asking about before the anxiety is taken as primary." }),
    yn("associated", "episodic_medical", "Wheeze, low sugar, headaches with high blood pressure", "Are the attacks linked to wheeze, to missed meals or diabetes medicines, or to headache and sweating with high blood pressure readings?", ["wheeze", "asthma", "inhaler", "missed meal", "diabetic", "sugar low", "insulin", "headache with sweating", "high bp during attack", "pale during attack"], { teach: "Wheeze, low blood sugar and surges of blood pressure can all present as sudden fear with a racing heart." }),
    yn("associated", "past_psychiatric", "Previous episodes and treatment", "Any similar episodes before, and was treatment taken — and was any medicine stopped recently?", ["previous episode", "similar before", "psychiatric treatment", "tablets", "stopped recently", "first time", "counselling"], { tier: "detailed" }),
    yn("exposure", "substance_caffeine", "Tea, coffee, alcohol, cannabis, sleeping tablets", "How much tea, coffee or energy drink is taken, and is there alcohol, cannabis or sleeping-tablet use, or recent stopping of any of them?", ["tea", "coffee", "energy drink", "cups", "alcohol", "cannabis", "ganja", "bhang", "sleeping tablets", "stopped suddenly", "withdrawal", "none"]),
    yn("exposure", "medicines_thyroxine", "Medicines that can cause anxiety", "Is the patient taking thyroid tablets, asthma inhalers or tablets, steroids, or slimming or cold medicines?", ["thyroxine", "thyroid tablets", "salbutamol", "inhaler", "theophylline", "deriphyllin", "steroid", "slimming", "cold medicine", "decongestant"], { tier: "detailed" }),
    yn("exposure", "life_stressors", "Current stresses", "Any current stress — exams, marriage, family conflict, debt, job loss, illness in the family?", ["exams", "marriage", "family conflict", "in laws", "debt", "job loss", "illness in family", "harassment", "violence at home", "no stress"]),
    // Red flags
    yn("red_flag", "suicide_risk", "Thoughts of ending life", "Have there been thoughts that life is not worth living, or of ending life, and has there been any attempt?", ["suicidal", "wants to die", "end life", "not worth living", "attempt", "plan", "no such thoughts", "denies"], { teach: "Severe anxiety, especially with low mood or alcohol, carries risk of self-harm that is only known when asked directly." }),
    yn("red_flag", "cardiac_features", "Chest pain on exertion, fainting, irregular heartbeat", "Does the chest pain or racing heart come on with exertion, with fainting or near fainting, or with an irregular beat or a family history of sudden death?", ["on exertion", "walking", "climbing stairs", "fainted", "blackout", "irregular", "skipping beats", "sudden death in family", "chest pain", "known heart disease"], { teach: "Exertional symptoms, fainting and an irregular pulse are the features that point back to the heart rather than away from it." }),
    yn("red_flag", "harm_to_others", "Harm to others or unwanted harming thoughts", "Have there been thoughts of harming someone, and if they are unwanted intrusive thoughts, is there any intent or has any act followed?", ["harming others", "harm child", "intrusive thoughts", "fear of harming", "never acted", "intent", "anger", "threats", "none"], { teach: "Unwanted harming thoughts that the patient finds distressing differ from intent, and the difference is only known by asking." }),
    yn("red_flag", "severe_dysfunction", "Unable to leave home, eat or work", "Has the patient become unable to leave home, eat, sleep, or look after children or work?", ["housebound", "cannot go out", "not eating", "not sleeping for days", "stopped work", "cannot look after children", "bedbound"]),
  ],
  differentials: [
    { id: "panic_disorder", name: "Panic disorder", pointers: ["attack_features", "avoidance"], discriminators: ["attack_features", "attack_timing", "attack_triggers", "avoidance", "cardiac_features"] },
    { id: "gad", name: "Generalised anxiety disorder", pointers: ["generalised_worry"], discriminators: ["generalised_worry", "duration", "sleep_appetite", "anxiety_description", "life_stressors"] },
    { id: "phobia", name: "Specific or social phobia, agoraphobia", pointers: ["attack_triggers", "avoidance"], discriminators: ["attack_triggers", "avoidance", "attack_features", "onset"] },
    { id: "ocd", name: "Obsessive-compulsive disorder", pointers: ["obsessions_compulsions"], discriminators: ["obsessions_compulsions", "duration", "low_mood", "harm_to_others"] },
    { id: "ptsd_acute_stress", name: "PTSD or acute stress reaction", pointers: ["trauma_exposure"], discriminators: ["trauma_exposure", "onset", "duration", "sleep_appetite", "avoidance"] },
    { id: "somatic_symptom", name: "Somatic symptom disorder / illness anxiety", pointers: ["somatic_focus"], discriminators: ["somatic_focus", "prior_investigations", "duration", "low_mood", "generalised_worry"] },
    { id: "depression_anxiety", name: "Depression with anxiety", pointers: ["low_mood", "sleep_appetite"], discriminators: ["low_mood", "sleep_appetite", "suicide_risk", "past_psychiatric", "duration"] },
    { id: "substance_related", name: "Substance- or withdrawal-related anxiety", pointers: ["substance_caffeine", "medicines_thyroxine"], discriminators: ["substance_caffeine", "medicines_thyroxine", "attack_timing", "onset"] },
    { id: "thyrotoxicosis", name: "Thyrotoxicosis", pointers: ["thyroid_features"], discriminators: ["thyroid_features", "medicines_thyroxine", "anxiety_description", "sleep_appetite"] },
    { id: "arrhythmia", name: "Arrhythmia", pointers: ["cardiac_features"], discriminators: ["cardiac_features", "attack_features", "attack_timing", "onset_mode"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["episodic_medical"], discriminators: ["episodic_medical", "attack_timing", "attack_triggers"] },
    { id: "asthma", name: "Asthma", pointers: ["episodic_medical"], discriminators: ["episodic_medical", "attack_features", "attack_triggers", "medicines_thyroxine"] },
    { id: "phaeochromocytoma", name: "Phaeochromocytoma", pointers: ["episodic_medical"], discriminators: ["episodic_medical", "attack_features", "attack_triggers", "cardiac_features"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "anxiety_description", "attack_features", "attack_timing", "attack_triggers", "avoidance", "generalised_worry", "progression", "prior_treatment", "prior_investigations"],
  },
};
