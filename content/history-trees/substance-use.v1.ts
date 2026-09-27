import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, KAPLAN_SADOCK, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * ALCOHOL OR SUBSTANCE USE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Psychiatry ward and OPD, north India, including the de-addiction clinic and patients
 * brought from medicine and surgery wards when they start withdrawing after admission. The
 * substances are the ones dictated here: daru and country liquor, smack and heroin, doda and
 * poppy husk, bhang, charas and ganja, tobacco and gutkha, and solvent sniffing in adolescents.
 * The tree asks what is used, how much, when last, and what happens on stopping, because the
 * time since the last drink or dose is what decides the next forty-eight hours.
 * Differentials: alcohol dependence, alcohol withdrawal (including delirium tremens and
 * withdrawal seizures), Wernicke's encephalopathy, opioid dependence, cannabis use disorder,
 * tobacco dependence, inhalant use in adolescents, benzodiazepine misuse, co-occurring
 * depression, substance-induced or co-occurring psychosis, alcohol-related liver disease.
 */
export const substanceUseV1: HistoryTree = {
  id: "substance_use",
  version: "1.0.0",
  complaint: "Alcohol or substance use",
  triggers: ["alcohol", "alcoholic", "alcohol dependence", "alcohol withdrawal", "drinking problem", "daru", "sharab", "nasha", "de addiction", "deaddiction", "smack", "heroin", "doda", "poppy husk", "opium", "afeem", "bhang", "charas", "ganja", "cannabis", "substance use", "drug addiction", "addiction", "withdrawal", "delirium tremens", "sniffing", "solvent", "whitener"],
  setting: "Psychiatry ward and OPD, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [KAPLAN_SADOCK, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("substance use"),
    val("hpi", "substances_used", "Which substances", "Which substances are used — alcohol, smack or heroin, doda or poppy husk, bhang, charas or ganja, tobacco, sleeping tablets, or anything sniffed?", ["alcohol", "daru", "country liquor", "desi", "beer", "whisky", "smack", "heroin", "doda", "poppy husk", "afeem", "opium", "bhang", "charas", "ganja", "tobacco", "gutkha", "bidi", "sleeping tablets", "sniffing", "whitener", "solvent"]),
    val("hpi", "quantity_pattern", "Amount and pattern", "How much is used on a typical day, how often, and has the amount needed to go up over time?", ["quarter", "half", "bottle", "daily", "every day", "weekends", "binge", "grams", "packets", "times a day", "increased", "more than before", "tolerance"], { numeric: true }),
    val("hpi", "route", "Route of use", "How is it taken — drunk, smoked, chased on foil, eaten, sniffed, or injected?", ["drinks", "smoked", "chasing", "foil", "eaten", "chewed", "sniffed", "inhaled", "injected", "injecting", "iv", "needle"]),
    val("hpi", "last_use", "Last drink or dose", "When was the last drink or dose taken, and how much?", ["last drink", "last dose", "last used", "hours ago", "yesterday", "days ago", "this morning", "since admission", "stopped on"], { numeric: true, teach: "The time since the last drink or dose sets when withdrawal is expected to begin and peak." }),
    yn("hpi", "morning_use", "Use on waking / relief use", "Is the first drink or dose taken soon after waking, to settle shaking or restlessness?", ["morning drink", "first thing", "on waking", "eye opener", "to stop shaking", "relief drinking", "cannot start the day"]),
    yn("hpi", "control_loss", "Craving and loss of control", "Is there strong craving, difficulty stopping once started, or use continuing despite clear harm?", ["craving", "cannot stop", "loss of control", "despite", "knows it is harmful", "tried to stop", "failed to stop", "more than intended"]),
    yn("hpi", "withdrawal_symptoms", "Symptoms on stopping", "What happens when use is stopped or reduced — shaking, sweating, sleeplessness, restlessness, body aches, watering eyes, yawning or loose stools?", ["tremor", "shaking", "sweating", "cannot sleep", "restless", "body ache", "watering eyes", "runny nose", "yawning", "loose stools", "goose flesh", "anxious", "no withdrawal"]),
    yn("hpi", "abstinence_attempts", "Previous attempts to stop and treatment", "Has stopping been tried before, was de-addiction treatment taken, and what led to relapse?", ["tried to stop", "de addiction", "deaddiction", "rehab", "nasha mukti", "admitted before", "relapse", "started again", "longest abstinence", "first attempt"]),
    yn("associated", "social_harm", "Effect on work, family and money", "Has use led to lost work, family conflict, debt, selling belongings, or trouble with police?", ["lost job", "absent from work", "quarrel", "family conflict", "violence at home", "debt", "sold", "stealing", "police", "arrested", "accident"], { tier: "detailed" }),
    yn("associated", "mood_symptoms", "Low mood or anxiety", "Has there been low mood, loss of interest, or anxiety, and did it begin before the substance use or after?", ["low mood", "sad", "loss of interest", "anxious", "worried", "before drinking started", "after drinking started", "only when drinking", "mood okay"], { teach: "Whether low mood began before the use or only during it changes how the two are thought of together." }),
    yn("associated", "psychotic_symptoms", "Voices or suspiciousness", "Any hearing of voices, seeing things, or suspicion that a spouse is unfaithful or that others are plotting?", ["voices", "hearing things", "seeing things", "suspicious", "doubts wife", "infidelity", "plotting", "followed", "only when using", "persists when not using"]),
    yn("associated", "liver_symptoms", "Jaundice, abdominal swelling, vomiting blood", "Any yellow eyes, swelling of the abdomen or feet, black stools, or vomiting blood?", ["jaundice", "yellow eyes", "abdominal swelling", "ascites", "swelling of feet", "black stools", "vomited blood", "liver", "abdominal pain"], { teach: "Liver and pancreatic damage change which medicines are safe and may be what brought the patient to hospital." }),
    yn("associated", "nutrition_weight", "Diet, weight loss and numbness", "Has the patient been eating poorly or losing weight, and is there numbness or burning in the feet?", ["not eating", "poor diet", "weight loss", "thin", "numbness", "burning feet", "tingling", "weakness in legs"], { tier: "detailed" }),
    yn("associated", "tobacco_use", "Tobacco", "Is tobacco used — bidi, cigarette, gutkha, khaini or zarda — and how much each day?", ["bidi", "cigarette", "smoking", "gutkha", "khaini", "zarda", "pan masala", "hookah", "tobacco", "non smoker"]),
    yn("exposure", "injecting_risk", "Injecting and shared needles", "Has any drug been injected, were needles or syringes shared, and has testing for HIV or hepatitis been done?", ["injected", "injecting", "shared needle", "shared syringe", "iv drug", "hiv", "hepatitis", "hcv", "abscess", "tested", "never injected"], { teach: "Shared injecting equipment carries blood-borne infection, and injection sites are a source of abscess and sepsis." }),
    yn("exposure", "prescribed_sedatives", "Sleeping tablets or cough syrups", "Are sleeping tablets, painkillers or codeine cough syrups being taken, and are they bought without a prescription?", ["sleeping tablets", "alprazolam", "nitrazepam", "tramadol", "codeine", "cough syrup", "painkiller", "without prescription", "chemist", "over the counter"], { tier: "detailed" }),
    yn("exposure", "family_substance", "Substance use in the family", "Does anyone else in the family drink or use drugs?", ["father drinks", "family history", "brother", "relatives", "family members", "nobody in family"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "withdrawal_delirium", "Confusion, seeing things, severe shaking after stopping", "Since stopping, has the patient become confused, not known where they are, seen insects or people who are not there, or shaken severely with sweating?", ["disoriented", "not recognising", "seeing insects", "seeing things", "severe tremor", "drenching sweat", "agitated", "picking at air", "fearful", "delirium"], { teach: "Confusion with hallucinations and marked shaking in the days after the last drink is a medical emergency with a real mortality." }),
    yn("red_flag", "withdrawal_seizure", "Fits after stopping", "Has there been a fit in the days after the last drink or dose, now or in a previous attempt to stop?", ["fit", "seizure", "convulsion", "fell and jerked", "unconscious", "tongue bite", "previous withdrawal fit", "no fits"], { teach: "A previous withdrawal fit is among the strongest markers that the next withdrawal may also be complicated." }),
    yn("red_flag", "wernicke_features", "Unsteady walking, double vision, confusion", "Is there unsteadiness on walking, double vision or abnormal eye movements, or new confusion?", ["unsteady", "staggering", "ataxia", "falls", "double vision", "eyes moving", "nystagmus", "confused", "forgetful", "cannot walk straight"], { teach: "Unsteadiness, eye-movement trouble and confusion together in a heavy drinker are asked about early because the damage can become permanent within days." }),
    yn("red_flag", "overdose_risk", "Overdose, unconsciousness, slow breathing", "Has there been an episode of unconsciousness, slow breathing or a near overdose, especially after a period of not using?", ["overdose", "unconscious", "found collapsed", "slow breathing", "blue lips", "pinpoint pupils", "naloxone", "after release", "after rehab", "never overdosed"], { teach: "Tolerance falls quickly during abstinence, so a return to the old amount after rehab or jail is a known point of overdose risk." }),
    yn("red_flag", "suicide_risk", "Thoughts of ending life", "Have there been thoughts that life is not worth living, a plan, or any previous attempt, including while intoxicated?", ["suicidal", "wants to die", "end life", "not worth living", "previous attempt", "plan", "while drunk", "no such thoughts", "denies"], { teach: "Intoxication lowers the threshold for acting on thoughts of self-harm, so the question is asked directly whatever the presenting substance." }),
    yn("red_flag", "harm_to_others", "Violence, driving intoxicated, children at risk", "Has there been violence towards the spouse or children, driving while intoxicated, or children left unsafe?", ["beats wife", "domestic violence", "hits children", "violent when drunk", "drives drunk", "driving", "children alone", "threats", "no violence"], { teach: "Risk to others, especially a spouse and children, is asked separately because it changes who else needs protection." }),
    yn("red_flag", "gi_bleed_liver_failure", "Vomiting blood, black stools, drowsiness with jaundice", "Any vomiting of blood, black tarry stools, or drowsiness in a patient who is yellow or swollen?", ["vomiting blood", "haematemesis", "black stools", "melaena", "drowsy", "yellow and drowsy", "bleeding", "abdominal swelling"], { teach: "Bleeding and drowsiness in a patient with liver disease can resemble withdrawal and are asked about so they are not missed." }),
  ],
  differentials: [
    { id: "alcohol_dependence", name: "Alcohol dependence", pointers: ["morning_use", "control_loss", "withdrawal_symptoms"], discriminators: ["substances_used", "quantity_pattern", "morning_use", "control_loss", "withdrawal_symptoms"] },
    { id: "alcohol_withdrawal", name: "Alcohol withdrawal, including delirium tremens and withdrawal seizures", pointers: ["last_use", "withdrawal_symptoms", "withdrawal_delirium", "withdrawal_seizure"], discriminators: ["last_use", "withdrawal_symptoms", "withdrawal_delirium", "withdrawal_seizure", "abstinence_attempts"] },
    { id: "wernicke", name: "Wernicke's encephalopathy", pointers: ["wernicke_features", "nutrition_weight"], discriminators: ["wernicke_features", "nutrition_weight", "quantity_pattern", "withdrawal_delirium", "duration"] },
    { id: "opioid_dependence", name: "Opioid dependence (heroin / smack, doda / poppy husk)", pointers: ["route", "withdrawal_symptoms", "injecting_risk"], discriminators: ["substances_used", "route", "withdrawal_symptoms", "injecting_risk", "overdose_risk"] },
    { id: "cannabis_use", name: "Cannabis use disorder (bhang, charas, ganja)", pointers: ["substances_used", "psychotic_symptoms"], discriminators: ["substances_used", "quantity_pattern", "psychotic_symptoms", "mood_symptoms", "control_loss"] },
    { id: "tobacco_dependence", name: "Tobacco dependence", pointers: ["tobacco_use"], discriminators: ["tobacco_use", "morning_use", "control_loss", "abstinence_attempts"] },
    { id: "inhalant_use", name: "Inhalant use in adolescents", pointers: ["route", "substances_used"], discriminators: ["substances_used", "route", "social_harm", "family_substance", "mood_symptoms"] },
    { id: "benzodiazepine_misuse", name: "Benzodiazepine or other prescription drug misuse", pointers: ["prescribed_sedatives"], discriminators: ["prescribed_sedatives", "quantity_pattern", "withdrawal_seizure", "control_loss", "last_use"] },
    { id: "co_occurring_depression", name: "Co-occurring depression", pointers: ["mood_symptoms", "suicide_risk"], discriminators: ["mood_symptoms", "suicide_risk", "abstinence_attempts", "social_harm", "duration"] },
    { id: "substance_psychosis", name: "Substance-induced or co-occurring psychosis", pointers: ["psychotic_symptoms"], discriminators: ["psychotic_symptoms", "substances_used", "last_use", "withdrawal_delirium", "harm_to_others"] },
    { id: "liver_disease", name: "Alcohol-related liver disease or pancreatitis", pointers: ["liver_symptoms", "gi_bleed_liver_failure"], discriminators: ["liver_symptoms", "gi_bleed_liver_failure", "quantity_pattern", "duration", "nutrition_weight"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "substances_used", "quantity_pattern", "route", "last_use", "morning_use", "control_loss", "withdrawal_symptoms", "abstinence_attempts", "progression", "prior_treatment", "prior_investigations"],
  },
};
