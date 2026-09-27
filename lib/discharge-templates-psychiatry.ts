import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * PSYCHIATRY discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * Same rule as lib/discharge-templates.ts: what is written here prints as written unless the
 * resident changes it; a genuinely patient-specific blank is `[ … ]` and prints as a visible
 * blank, never as a guess.
 *
 * Medication lines are a STARTING SET to be checked against each patient. EVERY psychotropic
 * dose (antipsychotics, mood stabilisers, antidepressants, benzodiazepines, naltrexone,
 * buprenorphine, anticholinergics) is `[ … ]` on purpose — each is titrated on the ward and
 * never guessed here. Only non-psychotropic supplements (thiamine, folic acid) carry a dose.
 *
 * Every template carries a risk / safety-plan element in advice and patientActions, written as
 * advice to the patient and family. Wording is kept neutral about admission status and the
 * Mental Healthcare Act — no legal claims are printed.
 *
 * Non-operative: the `procedure` block is mostly "Nil". Ordered specific before general
 * (first match wins, lib/specialty/discharge.ts): self-harm, then substance use, then
 * delirium, depression, mania, psychosis, OCD / anxiety.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

const titrated = (generic: string, extra: Partial<TemplateMedication> = {}): TemplateMedication => ({
  generic,
  dose: "[ … ]",
  route: "PO",
  frequency: "[ as titrated in ward ]",
  duration: "[ … ]",
  status: "new",
  ...extra,
});

const M = {
  antipsychotic: titrated("[ Olanzapine / Risperidone / Aripiprazole / Haloperidol ]"),
  anticholinergic: titrated("Trihexyphenidyl", { indication: "only if stiffness or tremor from the antipsychotic" }),
  benzoShort: titrated("[ Lorazepam / Clonazepam ]", { duration: "[ … ] days only, then stop as advised", indication: "short-term, for sleep / agitation; family to keep and hand out" }),
  moodStabiliser: titrated("[ Lithium / Sodium valproate ]", { indication: "blood levels as advised" }),
  antidepressant: titrated("[ Escitalopram / Sertraline / Fluoxetine ]", { indication: "takes 2–4 weeks to work; do not stop suddenly" }),
  thiamine: { generic: "Thiamine", strength: "100 mg", route: "PO", frequency: "TDS", duration: "3 months", status: "new" } as TemplateMedication,
  folic: { generic: "Folic acid", strength: "5 mg", route: "PO", frequency: "OD", duration: "1 month", status: "new" } as TemplateMedication,
  bComplex: { generic: "Vitamin B-complex", dose: "1 tablet", route: "PO", frequency: "OD", duration: "1 month", status: "new" } as TemplateMedication,
};

const RF_PSY = [
  "Any thought of harming yourself or ending your life, or talk of it",
  "Not sleeping for two nights or more",
  "Stopping the medicines, or refusing them",
  "The old symptoms coming back — suspiciousness, hearing voices, very high or very low mood",
  "Aggression or threats towards others",
];
const RF_SIDE_EFFECTS = ["Stiffness, shaking, restlessness, high fever with muscle stiffness, or fainting (medicine side-effects)"];

const SAFETY_PLAN =
  "Safety plan: the family keeps the medicines and hands out each dose; only [ … ] days' supply at home at a time. Remove or lock away pesticides, rat poison, acids, ropes, sharp objects and spare tablets. Someone stays with the patient if there is any talk of self-harm. If thoughts of self-harm come: tell a family member at once, call [ ward / doctor phone number ] or Tele-MANAS 14416, or come to the emergency department.";
const FAMILY_SUPERVISION =
  "The family supervises the medicines daily. Do not stop or change any medicine without the doctor, even if the patient feels well.";
const NO_SUBSTANCES = "No alcohol, cannabis (ganja / bhang), tobacco or other drugs — they worsen the illness and interact with the medicines.";
const ROUTINE = "Keep a regular routine: fixed sleep and meal times, some daily activity, and gradual return to work or study as advised.";
const DRIVING = "Do not drive or operate machinery until the doctor says it is safe on these medicines.";
const PSY_OPD = "Attend the Psychiatry OPD on [ … ] with a family member.";
const CALL_PLAN = "If there are any thoughts of self-harm: tell the family, call [ … ] / Tele-MANAS 14416, or come to the emergency department at once.";

const PROCEDURE_NIL = {
  name: "Nil",
  anaesthesia: "",
  findings: "[ relevant investigations — CBC, renal, liver, thyroid, glucose, ECG, imaging ]",
  drains: "",
  complications: "Nil",
  outcome: "[ Symptoms improved; insight __; risk reviewed ]",
};

export const PSYCHIATRY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "psychiatry_generic",
  label: "Psychiatry — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient was admitted with [ presenting problem ] for [ evaluation / inpatient management ].",
    primaryDiagnosis: "",
    procedure: PROCEDURE_NIL,
    clinicalCourse:
      "Admitted on [ date ] with [ presentation ], brought by [ … ]. [ Working diagnosis. ] [ Treatment given and response. ] At discharge: [ mental state summary ]; risk reviewed on [ date ] — [ … ]. Fit for discharge into the care of [ family member ] with the plan below.",
    medications: [],
    advice: adv([
      { module: "Medicines", text: FAMILY_SUPERVISION },
      { module: "Safety plan", text: SAFETY_PLAN },
      { module: "Lifestyle", text: NO_SUBSTANCES },
      { module: "Routine", text: ROUTINE },
    ]),
    redFlags: RF_PSY,
    patientActions: [PSY_OPD, CALL_PLAN, "Bring this summary and all medicines to every visit."],
    primaryCareActions: [],
    conditionAllSatisfactory: false,
  },
  clerkingFocus:
    "Presenting symptoms with onset, duration and course; informant and reliability; precipitants; past episodes, treatment and adherence; substance use; medical illness; family history of mental illness and suicide; personal and premorbid history. Mental state examination; risk assessment (self-harm, harm to others, self-neglect, vulnerability); physical examination. Baseline: CBC, renal and liver function, thyroid, glucose, lipids, ECG as the medicines need; urine drug screen where relevant.",
  progressNote:
    "Each day — sleep; food intake; mental state (mood, psychotic features, behaviour); risk review; medicine doses and side-effects; family meetings. For discharge — symptoms settled, risk reviewed and documented, family briefed on the safety plan and supervision of medicines.",
};

export const PSYCHIATRY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Deliberate self-harm / overdose (checked first) ----
  {
    key: "deliberate_self_harm",
    label: "Deliberate self-harm / overdose (after medical clearance)",
    match: /self[- ]harm|\bDSH\b|overdose|suicid(e|al) attempt|attempted suicide|\bpoisoning\b|consumption of|ingestion/i,
    scaffold: {
      indication: "Patient was transferred after medical treatment of [ overdose of __ / poisoning with __ / self-injury ] for psychiatric assessment and management.",
      primaryDiagnosis: "Deliberate self-harm by [ method ] — underlying [ diagnosis / no mental illness identified ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ] after [ method ] on [ date ]; medically cleared by [ unit ] on [ date ]. Psychiatric assessment: [ circumstances, intent, planning, precipitants ]. Diagnosis [ … ]. Treated with [ … ] and supportive therapy; family meetings held on [ … ]. At discharge: no current thoughts of self-harm [ as stated by the patient ], [ mental state ]. Risk reviewed on [ date ] — [ … ]. Safety plan made with the patient and family.",
      medications: [
        { ...M.antidepressant, indication: "if started; family to keep and hand out; do not stop suddenly" },
        M.benzoShort,
        { generic: "[ Drug taken in overdose ]", status: "stopped", indication: "[ stopped / to be reviewed by the prescribing doctor ]" },
      ],
      advice: adv([
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Medicines", text: FAMILY_SUPERVISION },
        { module: "Support", text: "Talk to someone you trust when things feel difficult. Problems that led to this admission can be worked on — keep the counselling appointments." },
        { module: "Lifestyle", text: NO_SUBSTANCES },
        { module: "Medical follow-up", text: "[ Blood tests after the overdose / poisoning — … — on … ]" },
      ]),
      redFlags: RF_PSY,
      patientActions: [PSY_OPD, "Attend the first follow-up within 7 days of discharge — [ date ].", CALL_PLAN, "[ Get … repeated on … for the medical follow-up. ]"],
      primaryCareActions: ["Contact within the first week after discharge; limited prescriptions; ask directly about self-harm thoughts at every visit."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Method, time, amount, and who found the patient; intent (note, planning, precautions against discovery, belief about lethality); regret or continued wish to die; precipitants; previous attempts; current depression, psychosis, substance use; access to means; supports; family history of suicide. Mental state examination; structured risk assessment. Medical clearance and any residual organ injury documented.",
    progressNote:
      "Each day — mood; thoughts of self-harm (asked directly); sleep; intake; engagement; family meetings; observation level. For discharge — no active self-harm intent, risk reviewed and documented, safety plan made and given to the family, follow-up within 7 days booked.",
  },

  // ---- Alcohol dependence — detox completed ----
  {
    key: "alcohol_dependence",
    label: "Alcohol dependence — detoxification completed",
    match: /alcohol|delirium tremens|\bADS\b|\bDTs\b|wernicke/i,
    scaffold: {
      indication: "Patient was admitted with alcohol dependence [ with withdrawal / complicated withdrawal — seizures / delirium ] for detoxification and relapse prevention.",
      primaryDiagnosis: "Alcohol dependence syndrome — [ uncomplicated withdrawal / withdrawal seizures / delirium tremens ] [ ± alcohol-related liver disease ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ]; last drink on [ … ]. Withdrawal managed with a [ chlordiazepoxide / lorazepam ] taper guided by CIWA-Ar, completed on [ date ], with parenteral thiamine. [ Complications: … ]. Liver function [ … ]. Motivational sessions held; the patient [ expressed wish to stay abstinent ]. Relapse-prevention medicine [ … ] started. Fit for discharge.",
      medications: [
        M.thiamine,
        M.folic,
        M.bComplex,
        titrated("[ Naltrexone / Acamprosate / Baclofen ]", { indication: "anti-craving; liver function as advised" }),
        titrated("Disulfiram", { indication: "only if agreed by the patient with full understanding; never with any alcohol", status: "new" }),
        { generic: "[ Chlordiazepoxide / Lorazepam ]", status: "stopped", indication: "taper completed in the ward — not to be continued at home" },
      ],
      advice: adv([
        { module: "Alcohol", text: "No alcohol at all, not even a small amount. A slip is not a failure — return to the OPD at once rather than continue drinking." },
        { module: "Medicines", text: FAMILY_SUPERVISION },
        { module: "Support", text: "Attend the de-addiction follow-up and self-help group (e.g. Alcoholics Anonymous) meetings. Avoid drinking friends and places for now." },
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Diet", text: "Regular balanced meals." },
      ]),
      redFlags: [...RF_PSY, "Shaking, sweating, seeing things, confusion or a fit (withdrawal)", "Yellow eyes, vomiting blood, black stools or abdominal swelling"],
      patientActions: [PSY_OPD, "Get liver function repeated on [ … ].", CALL_PLAN],
      primaryCareActions: ["Support abstinence; monitor liver function; screen family members for distress."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Age at first drink, pattern and quantity (standard drinks / day), last drink; dependence features (craving, tolerance, withdrawal, loss of control, salience, continued use despite harm); past withdrawal seizures or delirium; previous abstinence and treatment; other substances; complications (liver, pancreas, neuropathy, memory, trauma); family, work and legal impact; motivation. Examination: withdrawal signs (CIWA-Ar), Wernicke features, liver stigmata. Baseline: CBC, LFT with GGT, renal function, glucose, electrolytes, magnesium; USG abdomen.",
    progressNote:
      "Each day — CIWA-Ar and taper dose; orientation; sleep; intake; thiamine; mood; motivation. For discharge — withdrawal over, taper completed, anti-craving plan agreed, family briefed.",
  },

  // ---- Opioid dependence ----
  {
    key: "opioid_dependence",
    label: "Opioid dependence",
    match: /opioid|opiate|heroin|brown sugar|\bsmack\b|buprenorphine|\bOST\b|\bOAT\b|codeine|tramadol dependence|injecting drug/i,
    scaffold: {
      indication: "Patient was admitted with opioid dependence [ heroin / codeine / tramadol / … ] for [ detoxification / induction on opioid substitution ].",
      primaryDiagnosis: "Opioid dependence syndrome [ substance; route — oral / smoked / injecting ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ]; last use on [ … ]. Withdrawal assessed with COWS and managed with [ buprenorphine induction / symptomatic treatment ]. [ Stabilised on buprenorphine __ / completed detoxification and started naltrexone after an opioid-free period ]. Screening: HIV [ … ], HBsAg [ … ], HCV [ … ]. Motivational sessions held. Fit for discharge.",
      medications: [
        titrated("[ Buprenorphine / Buprenorphine-naloxone ]", { route: "SL", frequency: "[ as stabilised in ward ]", indication: "opioid substitution; dispensed as per the clinic arrangement" }),
        titrated("Naltrexone", { indication: "only if chosen instead of substitution, after an opioid-free period" }),
        M.benzoShort,
      ],
      advice: adv([
        { module: "Overdose risk", text: "After a break from opioids the body loses tolerance — using the old amount can kill. Never mix opioids with alcohol or sleeping pills. Never use alone." },
        { module: "Medicines", text: FAMILY_SUPERVISION + " Keep the substitution medicine locked away from children." },
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Injecting", text: "If injecting at any time: never share needles or syringes; use the nearest needle-syringe programme." },
        { module: "Support", text: "Attend the de-addiction clinic and self-help group (e.g. Narcotics Anonymous) meetings." },
      ]),
      redFlags: [...RF_PSY, "Very sleepy, slow breathing, or pin-point pupils — call an ambulance", "Fever, swelling or pain at an injection site"],
      patientActions: [PSY_OPD, "Attend the de-addiction clinic on [ … ] for the next dose / review.", CALL_PLAN],
      primaryCareActions: ["Continue opioid substitution without gaps; screen and treat HIV, hepatitis B and C; hepatitis B vaccination."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Substance, route, quantity and cost per day, last use; dependence features; injecting and sharing; previous overdoses; previous treatment (detox, substitution); other substances; complications (abscess, endocarditis, blood-borne viruses); legal and family impact; motivation. Examination: COWS, injection sites, pupils, nutrition. Baseline: CBC, LFT, renal function, urine drug screen, HIV / HBsAg / HCV with consent, ECG if methadone.",
    progressNote:
      "Each day — COWS; dose and response; craving; sleep; intake; mood; ward behaviour. For discharge — stable on the plan, overdose risk explained, clinic arrangement made.",
  },

  // ---- Delirium resolved ----
  {
    key: "delirium_resolved",
    label: "Delirium — resolved",
    match: /delirium|acute confusional state|encephalopathy/i,
    scaffold: {
      indication: "Patient was admitted / referred with an acute confusional state (delirium) due to [ cause ] for evaluation and management.",
      primaryDiagnosis: "Delirium due to [ cause — infection / metabolic / drug / … ] — resolved [ ± underlying dementia ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ] with [ fluctuating confusion / agitation / drowsiness ]. Cause identified as [ … ] and treated [ … ]. Managed with reorientation, sleep hygiene, family presence [ and low-dose antipsychotic for severe agitation, stopped on __ ]. Delirium resolved by [ date ]; at discharge the patient is oriented and [ baseline cognition __ ].",
      medications: [
        { generic: "[ Low-dose antipsychotic used for the delirium — haloperidol / quetiapine ]", status: "stopped", indication: "stopped before discharge; not to be restarted without review" },
        { ...M.thiamine, indication: "if alcohol use or malnutrition" },
      ],
      advice: adv([
        { module: "Recovery", text: "Thinking may take weeks to return fully to normal. Keep a clock and calendar visible, glasses and hearing aids on, and a family member nearby." },
        { module: "Medicines", text: "Avoid sleeping pills and new medicines without asking the doctor — they can bring the confusion back." },
        { module: "Safety", text: "Supervise walking to prevent falls; family keeps the medicines and hands out each dose." },
        { module: "Diet", text: "Enough fluids and regular meals." },
      ]),
      redFlags: ["Confusion, drowsiness or restlessness coming back", "Fever, not passing urine, or not eating or drinking", "A fall or a head injury", "Seeing or hearing things that are not there"],
      patientActions: [PSY_OPD, "Attend the [ treating unit ] OPD on [ … ] for the underlying cause.", "[ Memory check on … if an underlying dementia is suspected. ]"],
      primaryCareActions: ["Review drugs that can cause delirium; screen cognition once recovered; manage the underlying cause."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Onset and fluctuation of confusion (from the informant); baseline cognition and function; new drugs (anticholinergics, sedatives, opioids, steroids); alcohol or sedative withdrawal; infection, urine retention, constipation, pain, dehydration; sensory impairment. Examination: attention (months backwards), CAM, orientation, focal neurology, infection source, hydration. Baseline: CBC, electrolytes, glucose, renal and liver function, calcium, urine routine, cultures, [ CT head / LP as indicated ].",
    progressNote:
      "Each day — CAM; attention; sleep–wake cycle; agitation and any sedation given; cause being treated; intake and output; falls. For discharge — CAM negative, oriented, sedative stopped, family briefed.",
  },

  // ---- Severe depression (with risk review and safety plan) ----
  {
    key: "severe_depression",
    label: "Severe depression (with risk review and safety plan)",
    match: /depress|\bMDD\b|melancholi/i,
    scaffold: {
      indication: "Patient was admitted with a severe depressive episode [ with suicidal thoughts / with psychotic symptoms / not eating ] for inpatient management.",
      primaryDiagnosis: "[ Recurrent ] depressive disorder, current episode severe [ with / without psychotic symptoms ]",
      procedure: { ...PROCEDURE_NIL, name: "[ Nil / Electroconvulsive therapy — __ sessions, last on __ ]", anaesthesia: "[ General anaesthesia for ECT, if given ]" },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ HAM-D __ ]. Started on [ antidepressant ] [ + antipsychotic ] [ + ECT — __ sessions ]. Sleep and appetite improved by [ … ]; mood [ … ]. Risk reviewed on [ date ]: [ no current thoughts of self-harm as stated by the patient / … ]. Safety plan made with the patient and family. Fit for discharge.",
      medications: [M.antidepressant, { ...M.antipsychotic, indication: "only if psychotic symptoms" }, M.benzoShort],
      advice: adv([
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Medicines", text: FAMILY_SUPERVISION + " Antidepressants take 2–4 weeks to work fully and must be continued for months after feeling well." },
        { module: "Routine", text: ROUTINE },
        { module: "Lifestyle", text: NO_SUBSTANCES },
        { module: "Driving", text: DRIVING },
      ]),
      redFlags: [...RF_PSY, "Sudden calmness or giving away belongings after a period of low mood", ...RF_SIDE_EFFECTS],
      patientActions: [PSY_OPD, "Attend the first follow-up within 7 days — [ date ].", CALL_PLAN],
      primaryCareActions: ["Ask about self-harm thoughts at every visit; limited prescriptions; encourage continuation of treatment."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Low mood, anhedonia, fatigue; sleep, appetite and weight; guilt, hopelessness; psychotic symptoms; suicidal ideation, plans and attempts; duration and precipitants; past episodes and any mania / hypomania (bipolarity); substance use; medical causes (thyroid, anaemia, drugs); family history of mood disorder and suicide. Mental state examination; structured risk assessment. Baseline: CBC, thyroid, glucose, renal and liver function, B12 where relevant; ECG before some medicines.",
    progressNote:
      "Each day — mood; sleep; food intake; psychotic features; thoughts of self-harm (asked directly); medicine dose and side-effects; ECT session notes if given. For discharge — improving, risk reviewed and documented, safety plan given to the family, follow-up within 7 days booked.",
  },

  // ---- Bipolar mania ----
  {
    key: "bipolar_mania",
    label: "Bipolar disorder — mania",
    match: /\bmania\b|\bmanic\b|hypomani|\bBPAD\b|bipolar/i,
    scaffold: {
      indication: "Patient was admitted with a manic episode [ with psychotic symptoms ] for inpatient management.",
      primaryDiagnosis: "Bipolar affective disorder, current episode mania [ with / without psychotic symptoms ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ YMRS __ ]. Started on [ mood stabiliser ] [ + antipsychotic ]. Sleep normalised by [ … ]; mood and behaviour settled [ YMRS __ at discharge ]. [ Lithium / valproate level: … ]. Insight [ … ]. Risk reviewed on [ date ]. Fit for discharge.",
      medications: [M.moodStabiliser, M.antipsychotic, M.benzoShort, M.anticholinergic],
      advice: adv([
        { module: "Medicines", text: FAMILY_SUPERVISION + " [ On lithium: drink enough water, avoid painkillers like ibuprofen / diclofenac without asking, and get the blood level checked as advised. ]" },
        { module: "Early warning signs", text: "Reduced sleep, talking fast, spending sprees, irritability — these are early signs of a relapse. Come to the OPD early." },
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Routine", text: ROUTINE },
        { module: "Lifestyle", text: NO_SUBSTANCES },
        { module: "Driving", text: DRIVING },
      ]),
      redFlags: [...RF_PSY, "Vomiting, diarrhoea, coarse shaking, unsteadiness or confusion (lithium side-effects)", ...RF_SIDE_EFFECTS],
      patientActions: [PSY_OPD, "Get [ lithium / valproate level, renal and thyroid function ] on [ … ].", CALL_PLAN],
      primaryCareActions: ["Monitor drug levels, renal and thyroid function, weight and glucose; avoid antidepressants without psychiatry advice."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Elevated or irritable mood, decreased need for sleep, pressured speech, grandiosity, increased activity, risky spending or sexual behaviour; psychotic symptoms; duration; past depressive and manic episodes; treatment and adherence; substance use; family history. Mental state examination; risk (harm to self, others, reputation, finances). Baseline: CBC, renal and thyroid function, LFT, glucose, lipids, pregnancy test in women of child-bearing age, ECG.",
    progressNote:
      "Each day — sleep hours; mood and activity; speech; psychotic features; aggression; risk; medicine doses, levels and side-effects. For discharge — sleeping, calm, levels in range, insight noted, family briefed.",
  },

  // ---- Schizophrenia / acute psychosis ----
  {
    key: "schizophrenia_psychosis",
    label: "Schizophrenia / acute psychosis",
    match: /schizophren|schizoaffective|psychos|psychotic|\bATPD\b|delusional disorder/i,
    scaffold: {
      indication: "Patient was admitted with [ first-episode / relapse of ] psychosis [ suspiciousness / hearing voices / disorganised behaviour ] for inpatient management.",
      primaryDiagnosis: "[ Schizophrenia / acute and transient psychotic disorder / schizoaffective disorder / … ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ PANSS / BPRS __ ]. Started on [ antipsychotic ] [ + … ]. Psychotic symptoms [ reduced ]; sleep and self-care improved; behaviour calm on the ward. Insight [ … ]. Side-effects [ … ]. Risk reviewed on [ date ]. Psychoeducation given to the family. Fit for discharge.",
      medications: [M.antipsychotic, M.anticholinergic, M.benzoShort],
      advice: adv([
        { module: "Medicines", text: FAMILY_SUPERVISION + " Most relapses happen when medicines are stopped. [ Depot injection due on … ]" },
        { module: "Early warning signs", text: "Poor sleep, withdrawal from family, suspiciousness or talking to self are early signs of relapse. Come to the OPD early." },
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Routine", text: ROUTINE },
        { module: "Lifestyle", text: NO_SUBSTANCES },
        { module: "Driving", text: DRIVING },
      ]),
      redFlags: [...RF_PSY, ...RF_SIDE_EFFECTS],
      patientActions: [PSY_OPD, "[ Get weight, blood sugar and lipids checked on … ]", CALL_PLAN],
      primaryCareActions: ["Monitor weight, glucose and lipids on antipsychotics; support adherence; rehabilitation and disability-benefit referral where relevant."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Positive symptoms (delusions, hallucinations, disorganisation), negative symptoms, onset and duration; precipitants; substance use (cannabis, stimulants); past episodes, treatment, adherence and response; organic causes (fever, head injury, seizures, drugs); family history. Mental state examination; risk (self-harm, violence, self-neglect). Baseline: CBC, glucose, lipids, renal, liver and thyroid function, ECG; urine drug screen; CT / MRI if atypical or first episode with neurological signs.",
    progressNote:
      "Each day — sleep; self-care; psychotic features; behaviour and aggression; insight; medicine dose and side-effects (EPS, sedation); family engagement. For discharge — symptoms reduced, calm, risk reviewed, family briefed on relapse signs and supervision of medicines.",
  },

  // ---- OCD / anxiety disorder ----
  {
    key: "ocd_anxiety",
    label: "OCD / anxiety disorder",
    match: /\bOCD\b|obsessive|compulsive|anxiety|panic|phobi|\bGAD\b/i,
    scaffold: {
      indication: "Patient was admitted with [ severe obsessive–compulsive symptoms / anxiety disorder ] [ with marked functional impairment / depression ] for inpatient management.",
      primaryDiagnosis: "[ Obsessive–compulsive disorder / panic disorder / generalised anxiety disorder / … ] [ ± comorbid depression ]",
      procedure: PROCEDURE_NIL,
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ Y-BOCS / HAM-A __ ]. Started on [ SSRI ] with [ exposure and response prevention / CBT / relaxation training ]. Symptoms [ reduced to __ ]. Risk reviewed on [ date ]. Family taught how to support without taking part in rituals / reassurance. Fit for discharge.",
      medications: [
        titrated("[ Fluoxetine / Fluvoxamine / Sertraline / Escitalopram ]", { indication: "takes 6–12 weeks for full effect; do not stop suddenly" }),
        M.benzoShort,
      ],
      advice: adv([
        { module: "Therapy", text: "Keep practising the exercises (exposure and response prevention / breathing / relaxation) daily as taught. Keep the therapy appointments." },
        { module: "Family", text: "Family: be supportive, but do not join in rituals or give repeated reassurance — it keeps the symptoms going." },
        { module: "Medicines", text: FAMILY_SUPERVISION },
        { module: "Safety plan", text: SAFETY_PLAN },
        { module: "Lifestyle", text: NO_SUBSTANCES + " Cut down tea, coffee and energy drinks." },
      ]),
      redFlags: [...RF_PSY, "Symptoms taking up so much time that eating, sleeping or bathing stop"],
      patientActions: [PSY_OPD, "Attend therapy on [ … ].", CALL_PLAN],
      primaryCareActions: ["Support continuation of the SSRI for months after improvement; avoid long-term benzodiazepines."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Obsessions and compulsions (content, time per day, resistance, insight) or anxiety symptoms (panic attacks, worry, avoidance); duration; impairment; comorbid depression, tics, substance use; suicidal ideation; family accommodation; previous treatment and doses. Mental state examination; risk assessment. Baseline: CBC, thyroid function, glucose; ECG where relevant.",
    progressNote:
      "Each day — symptom severity (Y-BOCS / HAM-A); therapy sessions and homework; sleep; mood; thoughts of self-harm; medicine dose and side-effects. For discharge — symptoms reduced, therapy plan set, family briefed.",
  },
];
