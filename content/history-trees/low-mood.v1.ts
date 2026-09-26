import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, KAPLAN_SADOCK, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * LOW MOOD / SELF-HARM — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Psychiatry ward and liaison referrals, north India, where low mood often arrives as body
 * symptoms and an attempt often arrives through casualty. The risk questions are in the tree
 * because asking them directly is the only way they get asked, and because an unasked risk
 * question must never be recorded as a negative.
 * Differentials: depressive episode, bipolar disorder in a depressed phase, adjustment
 * reaction to a life event, anxiety disorder, alcohol or substance related mood disturbance,
 * hypothyroidism and other medical causes, grief, psychosis with depressive features.
 */
export const lowMoodV1: HistoryTree = {
  id: "low_mood",
  version: "1.0.0",
  complaint: "Low mood / self-harm",
  triggers: ["low mood", "depressed", "depression", "sadness", "crying spells", "not interested", "loss of interest", "self harm", "suicidal", "suicide attempt", "attempted", "poisoning attempt", "wants to die", "hopeless", "udaasi", "man nahi lagta", "sleeplessness"],
  setting: "Psychiatry ward and liaison referrals, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [KAPLAN_SADOCK, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("low mood"),
    val("hpi", "mood_description", "How the mood is described", "In the patient's own words, how has the mood been, and is it low through most of the day?", ["sad", "low", "empty", "crying", "no feeling", "most of the day", "every day", "worse in morning", "fluctuating", "own words"]),
    yn("hpi", "anhedonia", "Loss of interest", "Has interest or pleasure been lost in things that were enjoyed before?", ["no interest", "loss of interest", "not enjoying", "stopped", "hobbies", "nothing feels good", "still enjoys", "anhedonia"]),
    yn("hpi", "sleep_change", "Sleep", "How is sleep — difficulty falling asleep, waking early, or sleeping much more than usual?", ["sleep", "not sleeping", "difficulty falling asleep", "waking early", "early morning", "sleeping more", "disturbed sleep", "sleep normal"]),
    val("hpi", "appetite_weight", "Appetite and weight", "Has appetite or weight changed, and by how much?", ["appetite", "not eating", "eating less", "eating more", "weight loss", "weight gain", "kg", "clothes loose"], { numeric: true }),
    yn("hpi", "energy_function", "Energy and daily functioning", "Has energy dropped, and has work, study or housework stopped or become harder?", ["tired", "no energy", "fatigue", "stopped working", "not going to work", "housework", "bathing", "self care", "managing"]),
    yn("associated", "guilt_worthlessness", "Guilt / worthlessness / hopelessness", "Has the patient spoken of being a burden, worthless, or that nothing will improve?", ["guilt", "worthless", "burden", "useless", "hopeless", "no future", "blaming self", "sinful", "nothing will change"]),
    yn("associated", "concentration", "Concentration and memory", "Any difficulty concentrating, following conversation, or making small decisions?", ["concentration", "cannot focus", "forgetting", "memory", "decisions", "reading", "attention", "mind blank"], { tier: "detailed" }),
    yn("associated", "somatic_presentation", "Body symptoms without a found cause", "Any body aches, headache, or stomach complaints that have been investigated without a cause being found?", ["body ache", "headache", "stomach", "burning", "weakness", "investigated", "nothing found", "many doctors", "reports normal"], { teach: "Low mood in this setting is often brought as body symptoms, and the psychological question is reached only when asked directly." }),
    yn("associated", "past_episodes", "Previous similar episodes or psychiatric treatment", "Any similar episode before, and was psychiatric treatment taken, and for how long?", ["previous episode", "similar before", "psychiatric treatment", "tablets", "stopped treatment", "admitted", "years ago", "first episode"]),
    yn("associated", "elevated_phase", "Periods of unusually high mood or overactivity", "Has there ever been a period of days when the patient needed little sleep, talked much more, spent heavily, or felt unusually powerful?", ["high mood", "overactive", "talking more", "less sleep", "spending", "grandiose", "irritable", "elated", "never"], { teach: "A past period of elevated mood and reduced need for sleep changes which illness the current low phase belongs to, and such a period is volunteered only when asked." }),
    yn("associated", "psychotic_features", "Hearing voices / fixed false beliefs", "Any hearing of voices when nobody is there, or beliefs others find untrue such as being watched or blamed?", ["voices", "hearing", "nobody there", "beliefs", "watched", "followed", "poisoned", "blamed", "muttering", "none"]),
    yn("associated", "medical_causes", "Thyroid, steroids, chronic illness, recent childbirth", "Any thyroid problem, steroid treatment, long-term illness, or a recent delivery?", ["thyroid", "hypothyroid", "steroids", "chronic illness", "cancer", "delivery", "childbirth", "postpartum", "long illness"]),
    yn("exposure", "substance_use", "Alcohol or drug use and recent change", "Any alcohol, cannabis, opioid or other substance use, and has it increased recently or stopped suddenly?", ["alcohol", "drinking", "daily", "cannabis", "ganja", "opioid", "smack", "tablets", "increased", "stopped suddenly", "withdrawal"]),
    yn("exposure", "life_events", "Recent loss, conflict, debt or exam failure", "Any recent death in the family, marital or family conflict, debt, job loss, or failure in exams?", ["death", "bereavement", "loss", "conflict", "marital", "quarrel", "debt", "loan", "job loss", "exam", "failure", "harassment", "violence"]),
    // Red flags
    yn("red_flag", "suicidal_thoughts", "Thoughts that life is not worth living", "Have there been thoughts that life is not worth living, or of ending life?", ["thoughts of dying", "not worth living", "end life", "suicidal thoughts", "wish to die", "better if dead", "denies", "no such thoughts"], { teach: "Asking directly about thoughts of ending life is how the question is answered at all; leaving it unasked is not the same as a negative." }),
    yn("red_flag", "plan_intent", "A plan or preparation", "Has any plan been made, or anything arranged or written, and is the intent still present?", ["plan", "method", "arranged", "note", "written", "collected", "rope", "pesticide", "tablets kept", "still wants", "no plan"], { teach: "A formed plan or preparation carries different weight from a passing thought, and the intent now is a separate question from the intent yesterday." }),
    yn("red_flag", "past_attempt", "Previous attempt or self-harm", "Has there been any previous attempt or act of self-harm, when, and by what means?", ["previous attempt", "attempted", "self harm", "cutting", "poisoning", "hanging", "overdose", "how long ago", "first time", "never"], { teach: "A previous attempt is among the most consistently reported markers of further risk, and the time since the last one matters." }),
    yn("red_flag", "current_attempt_details", "Details of the act that brought the patient in", "If an act has just happened, what was taken or done, when, how much, and was it found by chance or disclosed?", ["consumed", "tablets", "pesticide", "insecticide", "hanging", "cutting", "how much", "time", "found by", "told someone", "alone", "note left"], { teach: "What was taken and when decides the medical course, and whether the act was concealed or disclosed speaks to the intent behind it." }),
    yn("red_flag", "access_means_support", "Access to means / living alone / no support", "Is there ready access to pesticides, firearms or stored tablets at home, and is the patient alone without family support?", ["pesticide", "insecticide", "stored", "firearm", "tablets at home", "alone", "living alone", "no support", "family away", "estranged"], { teach: "Access to means and being alone are the parts of risk that can be changed by the people around the patient." }),
    yn("red_flag", "not_eating_drinking", "Not eating or drinking / severe withdrawal", "Has the patient stopped eating or drinking, stopped speaking, or become unable to care for themselves?", ["not eating", "not drinking", "stopped speaking", "mute", "not moving", "stupor", "dehydrated", "bed bound", "not bathing"], { teach: "Stopping food and fluids turns a psychiatric presentation into a medical emergency within days." }),
    yn("red_flag", "harm_to_others", "Thoughts of harming others / children at home", "Have there been thoughts of harming anyone else, and are there young children dependent on the patient?", ["harming others", "harm to child", "children", "dependent", "thoughts", "anger", "threats", "none"], { teach: "Risk to dependants is asked separately because it changes who else needs to be considered beyond the patient." }),
  ],
  differentials: [
    { id: "depressive_episode", name: "Depressive episode", pointers: ["anhedonia", "sleep_change", "guilt_worthlessness"], discriminators: ["anhedonia", "sleep_change", "guilt_worthlessness", "duration", "elevated_phase"] },
    { id: "bipolar_depression", name: "Bipolar disorder, depressed phase", pointers: ["elevated_phase", "past_episodes"], discriminators: ["elevated_phase", "past_episodes", "sleep_change", "mood_description", "duration"] },
    { id: "adjustment", name: "Adjustment reaction to a life event", pointers: ["life_events", "duration"], discriminators: ["life_events", "duration", "anhedonia", "energy_function", "guilt_worthlessness"] },
    { id: "anxiety", name: "Anxiety disorder", pointers: ["sleep_change", "somatic_presentation"], discriminators: ["sleep_change", "somatic_presentation", "anhedonia", "concentration", "mood_description"] },
    { id: "substance_related", name: "Alcohol or substance related mood disturbance", pointers: ["substance_use"], discriminators: ["substance_use", "duration", "sleep_change", "past_episodes", "life_events"] },
    { id: "medical_cause", name: "Hypothyroidism or another medical cause", pointers: ["medical_causes", "energy_function"], discriminators: ["medical_causes", "energy_function", "appetite_weight", "somatic_presentation", "duration"] },
    { id: "grief", name: "Grief", pointers: ["life_events", "mood_description"], discriminators: ["life_events", "mood_description", "guilt_worthlessness", "duration", "energy_function"] },
    { id: "psychotic_depression", name: "Depression with psychotic features", pointers: ["psychotic_features", "guilt_worthlessness"], discriminators: ["psychotic_features", "guilt_worthlessness", "not_eating_drinking", "past_episodes", "mood_description"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "mood_description", "anhedonia", "sleep_change", "appetite_weight", "energy_function", "progression", "prior_treatment", "prior_investigations"],
  },
};
