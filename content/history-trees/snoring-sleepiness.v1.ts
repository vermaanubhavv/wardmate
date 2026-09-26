import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * SNORING / DAYTIME SLEEPINESS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Pulmonary medicine outpatient and sleep clinic, north India. The patient is asleep for
 * everything that matters here, so the history belongs to whoever shares the room: the
 * witnessed pauses, the gasping, the restlessness. It is asked because the daytime cost —
 * falling asleep at work or at the wheel — is what the patient actually came about, and
 * because morning headache and uncontrolled blood pressure are often the only other clues.
 * Differentials: obstructive sleep apnoea, obesity hypoventilation, nasal obstruction or
 * enlarged tonsils and adenoids, hypothyroidism, poor sleep habits or shift work, insomnia,
 * depression, narcolepsy, chronic lung disease with night-time hypoxia, sedative or alcohol use.
 */
export const snoringSleepinessV1: HistoryTree = {
  id: "snoring_sleepiness",
  version: "1.0.0",
  complaint: "Snoring / daytime sleepiness",
  triggers: ["snoring", "snores", "loud snoring", "daytime sleepiness", "sleepy in the day", "falling asleep", "stops breathing in sleep", "gasping at night", "choking in sleep", "sleep apnoea", "sleep apnea", "kharrate", "unrefreshing sleep", "morning headache"],
  setting: "Pulmonary medicine outpatient and sleep clinic, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("snoring"),
    val("hpi", "snoring_character", "How loud, and every night or not", "How loud is the snoring — heard from the next room — and does it happen every night and in every position?", ["loud", "next room", "every night", "some nights", "on back", "on the side", "disturbs others", "sleeping separately", "since years"]),
    yn("hpi", "witnessed_apnoea", "Pauses in breathing seen by someone else", "Has anyone seen the breathing stop during sleep, followed by gasping, choking or a loud snort?", ["stops breathing", "pauses", "gasping", "choking", "snort", "wife noticed", "family noticed", "frightening", "nobody has seen", "sleeps alone"], { teach: "Witnessed pauses ending in a gasp are the part of this history the patient cannot give, and they are recorded as the observer's words rather than the patient's." }),
    val("hpi", "daytime_sleepiness", "Where sleep intrudes in the day", "In what situations does sleep come during the day — watching television, sitting in a meeting, eating, or while driving or riding?", ["television", "reading", "meeting", "sitting", "after lunch", "driving", "riding", "at work", "in conversation", "traffic signal", "never"], { teach: "Which situations sleep intrudes into separates ordinary tiredness from sleepiness that overrides what the person is doing." }),
    yn("hpi", "unrefreshing_sleep", "Waking unrefreshed / morning headache / dry mouth", "Does the patient wake unrefreshed, with a headache in the morning or a dry mouth and sore throat?", ["unrefreshed", "tired on waking", "morning headache", "dry mouth", "sore throat", "heavy head", "wakes tired", "refreshed"]),
    yn("hpi", "nocturia_restlessness", "Waking to pass urine / restless sleep / sweating", "Does the patient wake more than once to pass urine, thrash about, or sweat at night?", ["passing urine", "twice", "several times", "restless", "thrashing", "tossing", "sweating", "sitting up", "sound sleep"], { tier: "detailed" }),
    val("associated", "weight_neck", "Weight gain and collar size", "Has there been weight gain, and has the collar or neck size increased?", ["weight gain", "kg", "collar", "neck size", "shirt tight", "obese", "increased", "stable weight"], { numeric: true }),
    yn("associated", "nasal_obstruction", "Blocked nose / mouth breathing", "Is the nose blocked on one or both sides, and does the patient breathe through the mouth at night?", ["blocked nose", "one side", "both sides", "mouth breathing", "deviated septum", "allergy", "sneezing", "tonsils", "adenoids", "drops used"]),
    yn("associated", "thyroid_symptoms", "Weight gain with cold intolerance, constipation, hoarse voice", "Any feeling cold, constipation, dry skin, or a deepening of the voice along with the weight gain?", ["cold intolerance", "feeling cold", "constipation", "dry skin", "hoarse", "deep voice", "hair loss", "puffy face", "slow"], { tier: "detailed" }),
    yn("associated", "cardio_metabolic", "High blood pressure, diabetes, heart rhythm problems", "Any high blood pressure — especially difficult to control — diabetes, or an irregular heartbeat?", ["blood pressure", "hypertension", "difficult to control", "multiple tablets", "diabetes", "sugar", "irregular", "palpitations", "heart"], { teach: "Blood pressure that stays high on several agents, and rhythm problems that start at night, are asked about because sleep-disordered breathing sits behind some of them." }),
    yn("associated", "lung_disease", "Known asthma, COPD or long-standing lung disease", "Any known asthma, long-standing cough with sputum, or previous treatment for a lung disease?", ["asthma", "copd", "smoker", "cough with sputum", "inhaler", "wheeze", "tuberculosis", "lung disease", "breathless on walking"]),
    yn("associated", "sleep_habits_shift", "Sleep timing, shift work, screen use", "What time does the patient sleep and wake, is there shift or night work, and how long is sleep on most nights?", ["sleeps at", "wakes at", "hours of sleep", "shift work", "night duty", "driver", "phone at night", "irregular", "afternoon nap"], { teach: "Short or shifting sleep explains daytime sleepiness on its own, and the question comes before the breathing questions are read as the answer." }),
    yn("associated", "mood_insomnia", "Low mood, difficulty falling asleep, waking early", "Any low mood, difficulty falling asleep, or waking in the early hours and being unable to sleep again?", ["low mood", "sad", "difficulty falling asleep", "waking early", "early hours", "cannot sleep again", "worry", "stress"], { tier: "detailed" }),
    yn("associated", "cataplexy_pattern", "Sudden sleep attacks / weakness with laughter", "Any sudden irresistible sleep attacks, dreams on falling asleep, or brief weakness of the legs on laughing or anger?", ["sleep attacks", "irresistible", "dreams", "on falling asleep", "weakness", "laughing", "anger", "knees give way", "cannot move on waking"], { tier: "detailed" }),
    yn("exposure", "sedative_alcohol", "Alcohol or sleeping tablets at night", "Any alcohol in the evening, or sleeping tablets, and has the snoring worsened with them?", ["alcohol", "evening", "peg", "sleeping tablets", "sedative", "worse after", "daily", "occasionally", "none"]),
    // Red flags
    yn("red_flag", "driving_sleepiness", "Falling asleep while driving or at work", "Has the patient fallen asleep, or nearly done so, while driving, riding, or operating a machine, and has there been a near miss?", ["driving", "riding", "machine", "near miss", "accident", "dozed off", "at the wheel", "long distance", "professional driver", "never drives"], { teach: "Sleep intruding while driving or at a machine is asked directly because the risk falls on other people as well as the patient." }),
    yn("red_flag", "morning_headache_confusion", "Morning headache with drowsiness or confusion through the day", "Any headache on waking that clears through the morning, with drowsiness or confusion during the day?", ["morning headache", "clears", "drowsy", "confused", "poor concentration", "forgetful", "irritable", "falling asleep in conversation"], { teach: "A headache present on waking that clears through the morning raises carbon dioxide building up during the night." }),
    yn("red_flag", "ankle_swelling_breathless", "Swelling of the feet or breathlessness on exertion", "Any swelling of the feet, breathlessness on walking, or blueness of the lips?", ["swelling of feet", "pedal oedema", "breathless", "on walking", "blue lips", "cyanosis", "cannot lie flat", "abdominal distension"], { teach: "Swollen feet with breathlessness in someone who snores heavily raise night-time hypoxia having reached the right side of the heart." }),
    yn("red_flag", "nocturnal_choking_arrhythmia", "Waking choking / palpitations or chest pain at night", "Does the patient wake at night choking, or with palpitations or chest pain?", ["wakes choking", "gasping", "palpitations", "chest pain", "at night", "frightened", "sitting up", "sweating"], { teach: "Waking with choking, palpitations or chest pain places the events at night rather than in the day, which changes what is looked for." }),
    yn("red_flag", "paediatric_pattern", "In a child: mouth breathing, poor school performance, bed wetting", "In a child, is there mouth breathing, restless sleep, bed wetting, or a fall in school performance?", ["child", "mouth breathing", "restless", "bed wetting", "school performance", "hyperactive", "adenoids", "tonsils", "not growing", "snoring every night"], { teach: "In a child the daytime sign is often restlessness or slipping school performance rather than sleepiness, and enlarged tonsils and adenoids are the common cause." }),
    yn("red_flag", "severe_obesity_hypoventilation", "Marked obesity with breathlessness at rest", "Is there marked obesity with breathlessness at rest or on slight exertion, or sleeping sitting up?", ["obesity", "very heavy", "breathless at rest", "slight exertion", "sleeping sitting", "cannot lie flat", "swollen", "drowsy"], { teach: "Breathlessness at rest with marked obesity raises ventilation that is inadequate awake as well as asleep." }),
  ],
  differentials: [
    { id: "osa", name: "Obstructive sleep apnoea", pointers: ["witnessed_apnoea", "snoring_character", "daytime_sleepiness", "weight_neck"], discriminators: ["witnessed_apnoea", "snoring_character", "daytime_sleepiness", "weight_neck", "unrefreshing_sleep", "sleep_habits_shift"] },
    { id: "obesity_hypoventilation", name: "Obesity hypoventilation", pointers: ["severe_obesity_hypoventilation", "morning_headache_confusion", "ankle_swelling_breathless"], discriminators: ["severe_obesity_hypoventilation", "morning_headache_confusion", "ankle_swelling_breathless", "weight_neck", "witnessed_apnoea"] },
    { id: "upper_airway_obstruction", name: "Nasal obstruction or enlarged tonsils and adenoids", pointers: ["nasal_obstruction", "paediatric_pattern"], discriminators: ["nasal_obstruction", "paediatric_pattern", "snoring_character", "witnessed_apnoea", "weight_neck"] },
    { id: "hypothyroidism", name: "Hypothyroidism", pointers: ["thyroid_symptoms", "weight_neck"], discriminators: ["thyroid_symptoms", "weight_neck", "daytime_sleepiness", "snoring_character", "duration"] },
    { id: "insufficient_sleep", name: "Insufficient sleep or shift work", pointers: ["sleep_habits_shift", "daytime_sleepiness"], discriminators: ["sleep_habits_shift", "daytime_sleepiness", "witnessed_apnoea", "unrefreshing_sleep", "snoring_character"] },
    { id: "insomnia_depression", name: "Insomnia or depression", pointers: ["mood_insomnia", "unrefreshing_sleep"], discriminators: ["mood_insomnia", "unrefreshing_sleep", "daytime_sleepiness", "sleep_habits_shift", "witnessed_apnoea"] },
    { id: "narcolepsy", name: "Narcolepsy", pointers: ["cataplexy_pattern", "daytime_sleepiness"], discriminators: ["cataplexy_pattern", "daytime_sleepiness", "witnessed_apnoea", "snoring_character", "sleep_habits_shift"] },
    { id: "chronic_lung_disease", name: "Chronic lung disease with night-time hypoxia", pointers: ["lung_disease", "ankle_swelling_breathless"], discriminators: ["lung_disease", "ankle_swelling_breathless", "morning_headache_confusion", "witnessed_apnoea", "weight_neck"] },
    { id: "sedative_related", name: "Alcohol or sedative related", pointers: ["sedative_alcohol", "snoring_character"], discriminators: ["sedative_alcohol", "snoring_character", "witnessed_apnoea", "daytime_sleepiness", "mood_insomnia"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "snoring_character", "witnessed_apnoea", "daytime_sleepiness", "unrefreshing_sleep", "progression", "prior_treatment", "prior_investigations"],
  },
};
