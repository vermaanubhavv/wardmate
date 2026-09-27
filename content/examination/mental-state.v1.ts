import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { HUTCHISONS, KAPLAN_SADOCK, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * MENTAL STATE EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * A structured record of what is observed and elicited now, at this interview, from appearance
 * through cognition to insight. Much of it is gathered while the history is being taken; the
 * remaining items are asked directly. Suicidal and homicidal ideation are always asked and
 * always recorded — asking does not put the idea into the patient's mind.
 *
 * Each item says how to elicit the sign and what it is associated with. Nothing names a
 * treatment, and nothing tells the reader what the patient has.
 */
const item = (
  id: string,
  label: string,
  how: string,
  significance: string,
  extra: Partial<Pick<ExamItem, "normal" | "tier">> = {}
): ExamItem => ({ id, label, how, significance, ...extra });

const d = { tier: "detailed" as const };

export const mentalStateV1: ExamChecklist = {
  id: "mental_state",
  version: "1.0.0",
  title: "Mental state examination",
  setting: "Psychiatry ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [KAPLAN_SADOCK, MACLEODS, HUTCHISONS],
  sections: [
    {
      id: "appearance_behaviour",
      title: "Appearance and behaviour",
      intro: "Observed from the moment the patient is seen; describe what you see in plain words rather than labels.",
      items: [
        item("appearance", "General appearance", "Describe build, grooming, clothing, hygiene, apparent age against stated age, and any injuries, scars or signs of self-harm.", "Self-neglect is associated with depression, psychosis, dementia and substance use; flamboyant dress with elevated mood; fresh cuts or ligature marks with recent self-harm and need direct questions about risk.", { normal: "Well kempt, appropriately dressed, looks stated age." }),
        item("behaviour", "Behaviour and eye contact", "Observe eye contact, facial expression, posture, gestures, restlessness, and any abnormal movements such as tremor, tics, stereotypies, mannerisms or posturing.", "Poor eye contact and a downcast posture are associated with depression; hypervigilance with anxiety and persecutory ideas; stereotypies, posturing and waxy flexibility with catatonia; tremor and restlessness with withdrawal states and drug side effects.", { normal: "Good eye contact, no abnormal movements." }),
        item("rapport", "Rapport and attitude", "Note whether rapport could be established, and whether the patient is cooperative, guarded, suspicious, hostile, seductive or withdrawn towards the interviewer.", "Guardedness and suspicion are associated with persecutory ideas; difficulty establishing rapport with psychosis and with severe depression; hostility is also a risk marker for the interview itself.", { normal: "Rapport established easily, cooperative." }),
        item("psychomotor", "Psychomotor activity", "Observe the amount and speed of movement: slowed, reduced and delayed, or increased, restless and purposeless. Note whether the patient can sit through the interview.", "Psychomotor retardation is associated with depression and catatonia; agitation with anxiety, agitated depression, mania, delirium and withdrawal states.", { normal: "Psychomotor activity normal." }),
      ],
    },
    {
      id: "speech",
      title: "Speech",
      items: [
        item("speech", "Speech", "Describe rate, volume, tone, quantity, spontaneity and reaction time, and whether speech is relevant and coherent. Record a verbatim sample of anything unusual.", "Pressured, loud, rapid speech is associated with mania; slow, soft speech with long reaction time and poverty of speech with depression; mutism with catatonia and severe depression; slurred speech with intoxication and neurological disease.", { normal: "Speech spontaneous, normal rate, volume and tone, relevant and coherent." }),
      ],
    },
    {
      id: "mood_affect",
      title: "Mood and affect",
      items: [
        item("mood", "Mood (subjective)", "Ask an open question — 'How have you been feeling in yourself?' — and record the answer in the patient's own words. Then ask about diurnal variation, interest, enjoyment, hopelessness and guilt.", "Persistent low mood with loss of enjoyment and hopelessness is associated with a depressive episode and with higher risk; an elated or irritable mood with mania.", { normal: "Mood described by patient as 'fine'." }),
        item("affect", "Affect (objective)", "Observe the emotional expression during the interview: its quality, range, reactivity, stability, and whether it matches what is being discussed.", "A blunted or flat affect is associated with schizophrenia and depression; a labile affect with mania, organic brain disease and intoxication; an incongruent affect (laughing while describing a loss) with psychosis.", { normal: "Affect euthymic, reactive, appropriate to content." }),
      ],
    },
    {
      id: "thought",
      title: "Thought",
      intro: "Form is how the thoughts are linked; content is what they are about. Record examples verbatim.",
      items: [
        item("thought_form", "Thought form and stream", "Listen to how ideas follow one another: whether the patient reaches the point, drifts (circumstantiality, tangentiality), jumps between ideas (flight of ideas), loses the link (derailment), stops suddenly (block), or uses new words.", "Flight of ideas is associated with mania; derailment, neologisms and thought block with schizophrenia; circumstantiality with anxious and obsessional personalities and with epilepsy.", { normal: "Goal-directed, no formal thought disorder." }),
        item("preoccupations", "Preoccupations and worries", "Ask what is on the patient's mind most, what worries them, and whether any thought keeps coming back.", "Themes of guilt, worthlessness and ruin are associated with depression; grandiose themes with mania; health-focused preoccupation with health anxiety and somatic symptom disorders.", d),
        item("delusions", "Delusions", "Ask gently about beliefs: whether anyone is trying to harm them, whether people talk about them or send messages through the television, whether they have special powers, whether their thoughts are controlled, inserted, withdrawn or broadcast. Test the conviction by gentle challenge, and record content verbatim.", "Firmly held false beliefs out of keeping with the patient's cultural background are associated with psychosis of many causes, including schizophrenia, mood disorder with psychotic features, delirium and substance use; passivity phenomena and thought alienation are first-rank features.", { normal: "No delusions elicited." }),
        item("overvalued_ideas", "Overvalued ideas", "Where a belief is held strongly but is understandable in the patient's culture and background, ask how certain they are and whether it could be otherwise.", "An overvalued idea is held with less than delusional conviction and is associated with eating disorders, body dysmorphic disorder and some personality disorders; beliefs about witchcraft, spirit possession and dhat are judged against the patient's cultural group.", d),
        item("obsessions", "Obsessions and compulsions", "Ask whether unwanted thoughts, images or urges keep coming into the mind despite trying to push them away, whether they recognise them as their own, and whether they feel driven to repeat actions such as washing, checking or counting.", "Recurrent intrusive thoughts recognised as one's own and resisted, with repetitive acts, are associated with obsessive-compulsive disorder; obsessional symptoms also occur in depression and schizophrenia.", { normal: "No obsessions or compulsions." }),
        item("suicidal_ideation", "Suicidal ideation — explicit risk assessment", "Always ask directly, stepwise: whether life feels worth living, whether they have wished to be dead, whether they have thought of ending their life, whether they have a plan, the means, a time, any preparations or a note, past attempts, and what keeps them going. Record the answers verbatim.", "A plan, access to means, preparation, recent attempt, hopelessness, psychosis with commands and poor support are associated with high immediate risk, and the level of risk and the patient's safety need to be discussed with the senior on the same day.", { normal: "Denies suicidal ideation, intent or plan when asked directly." }),
        item("homicidal_ideation", "Homicidal ideation and harm to others", "Ask directly about any thoughts of harming anyone else, who, whether there is a plan or means, and any past violence.", "Thoughts of harming a named person with a plan or means are associated with high risk to others and need the same-day senior discussion; persecutory delusions about a specific person raise this risk.", { normal: "Denies thoughts of harming others when asked directly." }),
        item("self_harm_other_risk", "Other risk items", "Ask about self-harm without suicidal intent, risk of neglect, risk from others (exploitation, abuse), risk to dependants, and driving or occupational risk.", "Risk extends beyond suicide: self-neglect, vulnerability to exploitation and risk to children in the patient's care are associated with severe illness and are recorded as separate items.", d),
      ],
    },
    {
      id: "perception",
      title: "Perception",
      items: [
        item("hallucinations", "Hallucinations", "Ask whether they have heard voices or sounds when no one was around, seen things others could not see, or had unusual smells, tastes or bodily sensations. For voices ask how many, whether they speak to or about the patient, running commentary, commands and what they command. Watch for the patient responding to unseen stimuli.", "Third-person voices and running commentary are associated with schizophrenia; second-person derogatory voices with psychotic depression; visual hallucinations with delirium, intoxication and withdrawal; olfactory and gustatory with temporal lobe disease; command hallucinations to harm are a risk item.", { normal: "No perceptual abnormalities." }),
        item("illusions", "Illusions and other perceptual changes", "Ask whether familiar things have looked distorted or misperceived, or whether they or their surroundings have felt unreal.", "Illusions are associated with delirium, fatigue and high arousal; depersonalisation and derealisation with anxiety and depression.", d),
      ],
    },
    {
      id: "cognition",
      title: "Cognition",
      intro: "Record the level of consciousness first; if impaired, every other cognitive finding is read in that light.",
      items: [
        item("consciousness", "Level of consciousness", "Observe whether the patient is alert, drowsy, fluctuating or stuporous across the interview; note the Glasgow Coma Scale when impaired.", "Clouding or fluctuation of consciousness is associated with delirium, which has a medical cause to be found and changes the reading of every other item.", { normal: "Conscious, alert." }),
        item("orientation", "Orientation", "Ask the time of day, date, month, year, where they are, and who the people around them are.", "Disorientation, especially to time, is associated with delirium and dementia, and is usually preserved in functional psychosis and depression.", { normal: "Oriented to time, place and person." }),
        item("attention", "Attention and concentration", "Ask the patient to subtract 7 from 100 serially for five steps, or to spell a word backwards, or to repeat a string of digits forwards and backwards (digit span).", "Poor attention is associated with delirium, where inattention is the core deficit, and with depression, anxiety and mania; a forward digit span below five suggests impaired attention.", { normal: "Serial sevens correct; digit span normal." }),
        item("memory", "Memory — immediate, recent and remote", "Immediate: register three unrelated words and recall straight away. Recent: recall the three words after five minutes, and ask about events of the last day. Remote: ask about verifiable past events, such as schooling or marriage.", "Poor recent memory with preserved remote memory is associated with dementia and with alcohol-related amnesia, where gaps may be filled by confabulation; patchy recall with poor effort with depression.", { normal: "Immediate, recent and remote memory intact." }),
        item("abstraction", "Abstract thinking", "Ask the meaning of a common proverb in the patient's own language, and similarities between pairs such as an apple and a banana.", "Concrete answers are associated with schizophrenia, frontal lobe disease and dementia; answers must be read against education and culture.", d),
        item("general_knowledge", "General knowledge and intelligence", "Ask about current events and well-known facts appropriate to the patient's education, and estimate intelligence from vocabulary and schooling.", "Knowledge below that expected for the patient's education is associated with intellectual disability and cognitive decline, and sets the baseline against which other answers are judged.", d),
        item("screening_score", "Standard cognitive screening", "Where cognitive impairment is suspected, use a standard screening instrument such as the MMSE or its Hindi version, recording the total and the items missed.", "A low score is associated with cognitive impairment, but the score is influenced by education and language and cannot on its own separate delirium, dementia and depression.", d),
      ],
    },
    {
      id: "insight_judgement",
      title: "Insight and judgement",
      items: [
        item("insight", "Insight — graded", "Ask what the patient thinks is wrong, whether they see it as an illness, what has caused it, and whether they think they need help. Grade from complete denial through awareness with blame on external factors, to intellectual insight, to true emotional insight.", "Poor insight is associated with psychosis and mania and with poor engagement with care; graded insight recorded now is compared at every later review.", { normal: "Insight present — recognises the illness and the need for help." }),
        item("judgement", "Judgement", "Assess personal judgement from the patient's recent decisions and plans, and social judgement from their response to everyday situations; hypothetical test questions add little.", "Impaired judgement is associated with mania, psychosis, frontal lobe disease and intoxication, and bears on capacity and safety.", { normal: "Judgement intact." }),
      ],
    },
  ],
};
