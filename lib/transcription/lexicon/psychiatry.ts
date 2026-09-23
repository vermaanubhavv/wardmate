import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The psychiatry keyterm core.
 *
 * WHY THESE WORDS. A psychiatric history is dictated in phrases no other ward uses: the mental
 * state examination in its own order ("affect", "thought block", "delusion of persecution",
 * "insight grade"), the drugs by name and by class ("olanzapine", "escitalopram", "sodium
 * valproate", "depot injection"), the withdrawal and de-addiction vocabulary ("CIWA", "last
 * drink", "delirium tremens", "craving"), and the Indian legal and social language a real
 * admission carries ("MHCA admission", "nominated representative", "attendant consent").
 *
 * Everything here is tagged `psychiatry`. Terms shared with medicine (delirium's causes, the
 * fever workup, the poisoning vocabulary) are not repeated — the shared categories reach them.
 *
 * WHAT IS DELIBERATELY NOT IN THIS FILE. No risk-scoring vocabulary and no severity grading
 * words that the app might then be tempted to compute. Risk is recorded as what was said, by
 * whom, and when — see the pack's extraction guidance. A lexicon exists so the dictation is
 * transcribed correctly, never so a judgement can be inferred from it.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`;
 * `__tests__/psychiatry-collisions.test.ts` pins that nothing left fires inside an unrelated
 * word. "ECT" is spelled out for exactly that reason.
 */

const PSY = "psychiatry" as const;

function entry(
  term: string,
  categories: MedicalLexiconEntry["categories"],
  aliases: string[] = [],
  triggers: string[] = [],
  priority: number = PRIORITY.SPECIALTY
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories,
    specialties: [PSY],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const mse = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.SPECIALTY);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);
const ward = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["india-ward"], a, tr, PRIORITY.INDIA_WARD);

export const PSYCHIATRY: MedicalLexiconEntry[] = [
  // --- Diagnoses ----------------------------------------------------------------------------
  dx("depressive episode", ["major depressive disorder", "recurrent depressive disorder", "melancholic features", "dysthymia"], ["low mood"]),
  dx("bipolar affective disorder", ["manic episode", "hypomania", "mixed affective episode", "rapid cycling"], ["elevated mood"]),
  dx("schizophrenia", ["first episode psychosis", "acute and transient psychotic disorder", "schizoaffective disorder", "residual schizophrenia"], ["hearing voices"]),
  dx("generalised anxiety disorder", ["panic disorder", "panic attack", "social anxiety disorder", "phobic anxiety"], ["palpitations", "worry"]),
  dx("obsessive compulsive disorder", ["obsessions and compulsions", "checking rituals", "contamination fears"], ["rituals"]),
  dx("post-traumatic stress disorder", ["acute stress reaction", "adjustment disorder", "flashbacks and nightmares"], ["nightmares"]),
  dx("alcohol dependence syndrome", ["harmful use of alcohol", "alcohol withdrawal", "delirium tremens", "alcoholic hallucinosis", "Wernicke encephalopathy"], ["last drink"]),
  dx("opioid dependence", ["opioid withdrawal", "heroin use", "injecting drug use", "cannabis dependence", "nicotine dependence"], ["craving"]),
  dx("somatic symptom disorder", ["dissociative disorder", "conversion disorder", "medically unexplained symptoms", "possession state"], ["many investigations"]),
  dx("delirium", ["acute confusional state", "sundowning", "hyperactive delirium", "hypoactive delirium"], ["fluctuating", "disoriented"]),
  dx("dementia", ["major neurocognitive disorder", "Alzheimer dementia", "vascular dementia", "behavioural and psychological symptoms of dementia"], ["memory loss"]),
  dx("intentional self-harm", ["deliberate self-harm", "self-poisoning", "suicidal attempt", "suicidal ideation", "non-suicidal self-injury"], ["self harm"]),

  // --- The mental state examination, in the order it is dictated ------------------------------
  mse("appearance and behaviour", ["kempt", "unkempt", "eye contact", "rapport established", "psychomotor agitation", "psychomotor retardation", "catatonic signs"], ["mental state"]),
  mse("speech description", ["pressured speech", "poverty of speech", "increased tone and tempo", "relevant and coherent", "circumstantial"], ["mental state"]),
  mse("affect description", ["euthymic affect", "depressed affect", "elated affect", "blunted affect", "restricted affect", "congruent affect", "labile affect"], ["mental state"]),
  mse("thought form", ["thought block", "loosening of association", "flight of ideas", "tangentiality", "perseveration"], ["mental state"]),
  mse("thought content", ["delusion of persecution", "delusion of reference", "grandiose delusion", "delusion of infidelity", "nihilistic delusion", "thought insertion", "thought broadcast"], ["mental state"]),
  mse("perceptual disturbance", ["auditory hallucination", "visual hallucination", "third person hallucination", "running commentary", "illusions reported"], ["mental state"]),
  mse("cognition assessed", ["oriented to time place person", "disoriented to time", "attention and concentration", "immediate recall", "recent memory", "remote memory", "MMSE score"], ["mental state"]),
  mse("insight and judgement", ["insight grade", "partial insight", "absent insight", "judgement intact", "test judgement"], ["mental state"]),

  // --- Treatment vocabulary --------------------------------------------------------------------
  drug("olanzapine", ["risperidone", "quetiapine", "aripiprazole", "haloperidol", "clozapine", "atypical antipsychotic"], ["psychosis"]),
  drug("escitalopram", ["sertraline", "fluoxetine", "venlafaxine", "mirtazapine", "antidepressant started"], ["low mood"]),
  drug("sodium valproate", ["lithium carbonate", "carbamazepine", "lamotrigine", "mood stabiliser", "lithium level"], ["bipolar"]),
  drug("lorazepam", ["diazepam", "clonazepam", "chlordiazepoxide", "benzodiazepine taper"], ["withdrawal", "agitation"]),
  drug("thiamine supplementation", ["parenteral thiamine", "vitamin B complex", "naltrexone", "acamprosate", "disulfiram", "buprenorphine naloxone"], ["de-addiction"]),
  drug("depot antipsychotic", ["long acting injectable", "fluphenazine decanoate", "paliperidone palmitate", "depot injection due"], ["adherence"]),
  proc("electroconvulsive therapy", ["modified ECT session", "ECT course", "pre-anaesthetic fitness for ECT", "seizure duration recorded"], ["catatonia"]),
  proc("psychotherapy", ["cognitive behaviour therapy", "supportive psychotherapy", "motivational interviewing", "family psychoeducation", "relapse prevention"], ["counselling"]),
  entry("extrapyramidal side effects", ["diagnosis"], ["akathisia", "parkinsonian features", "acute dystonia", "tardive dyskinesia", "neuroleptic malignant syndrome"], ["antipsychotic"], PRIORITY.EXACT_PATIENT),

  // --- The Indian ward's own language -------------------------------------------------------------
  ward("Mental Healthcare Act admission", ["MHCA admission", "independent admission", "supported admission", "nominated representative", "mental health review board"], ["admission"]),
  ward("attendant stays with patient", ["attendant present", "one attendant allowed", "family supervision", "constant observation", "special observation"], ["supervision"]),
  ward("sharps and ligature check", ["ward round safety check", "belongings checked", "valuables handed over"], ["observation"]),
  ward("follow up in outpatient", ["OPD follow up", "psychiatry OPD", "review after two weeks", "community follow up", "defaulted follow up"], ["follow up"]),
];
