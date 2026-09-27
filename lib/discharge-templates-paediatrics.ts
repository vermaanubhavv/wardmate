import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * PAEDIATRICS discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * Drafted to replace the adult medicine templates the paediatric ward borrowed until now (see
 * lib/specialty/paediatrics.ts). Not yet read through by a paediatric unit; intended to be
 * corrected from that review before it is relied on.
 *
 * THE NO-DOSE RULE (lib/specialty/paediatrics.ts): the app NEVER calculates or states a
 * paediatric dose. Medicines are pre-filled by name, route and frequency where the choice is
 * standard, but every dose is the visible blank "[ as charted — by weight or age ]" and `strength` is left
 * out — the resident copies the dose from the chart, exactly as written. Nothing here multiplies
 * by a weight, converts to millilitres, or checks a range.
 *
 * The weight at discharge is a clinical value and is a `[ … ]` blank in every clinical course,
 * never estimated from age.
 *
 * `[ … ]` marks every patient-specific blank. Red flags follow the IMNCI danger signs in the
 * words a parent uses. First match wins (lib/specialty/discharge.ts), so the array is ordered
 * specific before general — e.g. neonatal and meningitis before seizure, SAM before diarrhoea,
 * bronchiolitis before pneumonia, febrile seizure (word-bounded, so "afebrile" does not hit it)
 * before epilepsy.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

/** The only dose text a paediatric template ever carries. */
const PER_KG = "[ as charted — by weight or age ]";

const med = (
  generic: string,
  route: string,
  frequency: string,
  extra: Partial<TemplateMedication> = {}
): TemplateMedication => ({ generic, dose: PER_KG, route, frequency, status: "new", ...extra });

const M = {
  paracetamolSos: med("Paracetamol", "PO", "SOS for fever", { status: "prn" }),
  ors: med("ORS (low-osmolarity)", "PO", "after each loose stool", { indication: "until the diarrhoea stops" }),
  zinc: med("Zinc", "PO", "OD", { duration: "14 days", indication: "continue even after the diarrhoea stops" }),
  amoxicillin: med("Amoxicillin", "PO", "BD", { duration: "[ … ] days in total, counting days in hospital" }),
  rescueMidazolam: med("Midazolam (buccal / intranasal)", "Buccal / intranasal", "SOS for a fit lasting more than five minutes", {
    status: "prn",
    indication: "only if the treating team has written a home rescue plan",
  }),
};

const WEIGHT = "Weight at discharge [ … ] kg (admission weight [ … ] kg, date [ … ]).";

const NO_PROCEDURE = {
  name: "[ Procedure during this admission, if any — lumbar puncture, IV cannulation only, blood transfusion ]",
  anaesthesia: "",
  drains: "",
  complications: "Nil",
  outcome: "[ Outcome of this admission ]",
};

// IMNCI general danger signs, in a parent's words.
const RF_CHILD = [
  "Not able to drink or breastfeed",
  "Vomits everything",
  "A fit (convulsion)",
  "Very sleepy, difficult to wake, or floppy",
  "Fast breathing, difficult breathing, or the chest pulling in with each breath",
  "Fever that comes back or does not settle",
];
// IMNCI young-infant (0–2 months) danger signs.
const RF_NEWBORN = [
  "Not feeding well, or stops sucking",
  "A fit, or stiffening of the body",
  "Fast breathing, grunting, or the chest pulling in with each breath",
  "Feels hot (fever) or feels cold to touch",
  "Moves only when touched, or does not move at all",
  "Yellow colour of the palms or soles, or yellow colour spreading",
  "Redness or pus around the umbilicus, or many skin pustules",
];

const FEEDING = { module: "Feeding", text: "Continue breastfeeding and the usual food. Offer small, frequent feeds and extra fluids while the child is unwell, and extra food for two weeks after recovery." };
const IMMUNISATION = { module: "Immunisation", text: "Immunisation status on the card: [ up to date for age / due — … ]. Get any missed vaccines given at the next immunisation day; the illness is not a reason to delay them once well." };
const MEDICINES = { module: "Medicines", text: "Give the medicines exactly as written, measured with the syringe or cup provided — never a household spoon. Do not change a dose without asking the doctor." };
const followUp = (when: string) => ({ module: "Follow-up", text: `Attend the paediatric OPD ${when} with this summary and the child's weight card.` });

export const PAEDIATRICS_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "paediatrics_generic",
  label: "Paediatrics — generic template",
  match: /.^/,
  scaffold: {
    indication: "Child was admitted with [ presenting problem ] for [ investigation / treatment / monitoring ].",
    primaryDiagnosis: "",
    procedure: { ...NO_PROCEDURE, findings: "[ relevant results — cultures, counts, imaging ]" },
    clinicalCourse: `Admitted on [ date ] with [ presentation ], history from [ mother / father / … ]. [ Working diagnosis and how it was reached. ] [ Treatment given. ] The child improved, is afebrile, feeding well and active, and was fit for discharge on [ date ]. ${WEIGHT}`,
    medications: [],
    advice: adv([MEDICINES, FEEDING, IMMUNISATION, followUp("on [ … ]")]),
    redFlags: RF_CHILD,
    patientActions: [
      "Attend the paediatric OPD on [ … ].",
      "Bring this summary, the immunisation card and all reports to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course, and who gave the history; associated symptoms and danger signs; feeding and urine output; birth, immunisation, developmental and nutritional history; family and contact history. Examination: weight, length/height and MUAC with the date, vitals, hydration, respiratory distress, systemic examination. Provisional diagnosis and plan.",
  progressNote:
    "Each day — weight (with date), feeding and intake, urine and stool counts, vitals and saturation, danger signs, examination, results back, the day's plan. For discharge — afebrile, feeding well, active, danger signs absent, parents taught the medicines and the danger signs, follow-up written down.",
};

export const PAEDIATRICS_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Neonatal sepsis (before jaundice: sepsis is the governing diagnosis when both are typed) ----
  {
    key: "paed_neonatal_sepsis",
    label: "Neonatal sepsis",
    match: /neonatal sepsis|newborn sepsis|sepsis (in|of) (the |a )?(newborn|neonate)|(early|late)[- ]onset (neonatal )?sepsis/i,
    scaffold: {
      indication: "Newborn was admitted on day [ … ] of life with [ poor feeding / lethargy / fever / hypothermia / fast breathing ] and a clinical picture of neonatal sepsis for antibiotics and monitoring.",
      primaryDiagnosis: "Neonatal sepsis — [ early / late onset; culture positive (organism) / culture negative; ± meningitis excluded by LP ]",
      procedure: { ...NO_PROCEDURE, findings: "[ sepsis screen; blood culture and sensitivity; CSF if done ]" },
      clinicalCourse: `Admitted on day [ … ] of life, birth weight [ … ] kg, [ term / preterm ] [ … ] weeks. Sepsis screen [ … ]; blood culture [ … ]. Treated with IV [ … ] for [ … ] days. [ Complications, if any. ] Now feeding well on [ breastfeeds / expressed breast milk ], maintaining temperature, active, and gaining weight. ${WEIGHT}`,
      medications: [],
      advice: adv([
        { module: "Feeding", text: "Exclusive breastfeeding on demand, at least 8 times in 24 hours, day and night. No water, honey, ghutti or other feeds." },
        { module: "Warmth", text: "Keep the baby warm — skin-to-skin (kangaroo) care with the mother, covered head and feet." },
        { module: "Hygiene", text: "Wash hands before handling the baby. Keep the cord clean and dry; apply nothing on it." },
        IMMUNISATION,
        followUp("after [ … ] days for a weight check"),
      ]),
      redFlags: RF_NEWBORN,
      patientActions: [
        "Attend the paediatric OPD after [ … ] days for a weight and feeding check.",
        "[ Hearing screen (OAE / BERA) on [ … ] — if meningitis or aminoglycosides. ]",
        "Get the birth-dose vaccines given if not already done.",
      ],
      primaryCareActions: ["Home visit to check feeding, warmth and weight gain."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Age in days; birth weight and gestation; maternal risk factors (PROM > 18 hours, maternal fever, foul liquor, UTI); place and mode of delivery; resuscitation; feeding; temperature; lethargy, poor suck, fast breathing, apnoea, fits, jaundice, umbilical or skin infection. Examination: weight with date, temperature, CRT, respiratory distress, fontanelle, tone, umbilicus, skin. Baseline: sepsis screen, blood culture before antibiotics, blood glucose, CSF where indicated.",
    progressNote:
      "Each day — weight, feeding (breastfeeds / EBM volume as said), temperature, activity, respiratory status, jaundice, culture status, antibiotic day. For discharge — feeding well at the breast, maintaining temperature in room air, weight gaining, antibiotic course complete, mother taught danger signs.",
  },

  // ---- Neonatal jaundice ----
  {
    key: "paed_neonatal_jaundice",
    label: "Neonatal jaundice (phototherapy)",
    match: /neonatal (jaundice|hyperbilirubin)|jaundice (in|of) (the |a )?(newborn|neonate)|hyperbilirubinaemia|hyperbilirubinemia|phototherapy/i,
    scaffold: {
      indication: "Newborn was admitted on day [ … ] of life with jaundice [ up to … ] for evaluation and phototherapy.",
      primaryDiagnosis: "Neonatal hyperbilirubinaemia — [ physiological / ABO / Rh incompatibility / breastfeeding-related / other cause ]",
      procedure: {
        ...NO_PROCEDURE,
        name: "Phototherapy [ single / double surface ] [ ± exchange transfusion ]",
        findings: "[ peak TSB and the day of life; blood groups of mother and baby; DCT; haematocrit ]",
      },
      clinicalCourse: `Admitted on day [ … ] of life, [ term / preterm ] [ … ] weeks, birth weight [ … ] kg. TSB [ … ] on day [ … ]. Phototherapy from [ … ] to [ … ]; [ rebound TSB [ … ] after stopping ]. Feeding well at the breast, active, no signs of encephalopathy. ${WEIGHT}`,
      medications: [],
      advice: adv([
        { module: "Feeding", text: "Breastfeed frequently — at least 8 to 12 times in 24 hours. No water, glucose water or honey." },
        { module: "Jaundice watch", text: "Look at the baby's skin and eyes in daylight every day. Pale stools or dark urine that stains the nappy must be shown to a doctor the same day." },
        IMMUNISATION,
        followUp("on [ … ] for a jaundice and weight check"),
      ]),
      redFlags: RF_NEWBORN,
      patientActions: [
        "Attend the paediatric OPD on [ … ] for a jaundice check [ ± repeat bilirubin ].",
        "[ Hearing screen (OAE / BERA) on [ … ] — if the bilirubin reached exchange level. ]",
      ],
      primaryCareActions: ["Check jaundice and feeding at the home visit."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Age in days at onset of jaundice; extent; gestation and birth weight; mother's and baby's blood group; previous sibling with jaundice or exchange; feeding and weight loss; stool and urine colour; lethargy, poor suck, high-pitched cry, arching. Examination: extent of jaundice, hydration, cephalhaematoma, pallor, hepatosplenomegaly, neurological signs. Baseline: TSB, blood groups, DCT, haematocrit, retics, G6PD where indicated.",
    progressNote:
      "Each day — TSB with the hour of life (as recorded; thresholds read by the resident, not the app), phototherapy hours, feeding, weight, urine and stool counts, temperature, neurological signs. For discharge — phototherapy stopped, rebound checked if planned, feeding well.",
  },

  // ---- Meningitis (before seizure templates) ----
  {
    key: "paed_meningitis",
    label: "Meningitis",
    match: /meningitis|meningo-?encephalitis/i,
    scaffold: {
      indication: "Child was admitted with fever [ and fits / altered sensorium / neck stiffness / bulging fontanelle ] and was diagnosed with meningitis for IV antibiotics and monitoring.",
      primaryDiagnosis: "[ Acute bacterial / partially treated / tubercular / viral ] meningitis [ organism, if identified ]",
      procedure: { ...NO_PROCEDURE, name: "Lumbar puncture on [ … ]", findings: "[ CSF cells, protein, sugar, Gram stain, culture; neuroimaging if done ]" },
      clinicalCourse: `Admitted on [ date ] with [ presentation ]. LP on [ … ]: [ CSF findings ]. Treated with IV [ … ] for [ … ] days [ ± steroids ]. [ Seizures, if any, and how controlled. ] Fever settled on [ … ]; conscious, feeding well, [ no focal deficit / deficit … ] at discharge. ${WEIGHT}`,
      medications: [med("[ Antiseizure medicine, if started — as charted ]", "PO", "[ as charted ]", { indication: "only if seizures were treated", status: "new" })],
      advice: adv([MEDICINES, FEEDING, IMMUNISATION, followUp("on [ … ] for a neurological and developmental review")]),
      redFlags: [...RF_CHILD, "New weakness of an arm or leg, squint, or not responding to sound"],
      patientActions: [
        "Hearing test (BERA / OAE) on [ … ] — hearing loss can follow meningitis.",
        "Attend the paediatric OPD on [ … ] for developmental follow-up.",
        "[ Contacts advised prophylaxis — if meningococcal / Hib. ]",
      ],
      primaryCareActions: ["Watch development and hearing at each visit; refer early if a milestone slips."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Fever, headache, vomiting, irritability, fits, altered sensorium, neck pain; prior antibiotics; TB contact; ear discharge, head injury, VP shunt; immunisation (Hib, PCV). Examination: GCS / AVPU, fontanelle, neck stiffness, Kernig's, focal deficit, cranial nerves, fundus, signs of raised ICP, rash. Baseline: CSF analysis before antibiotics where safe, blood culture, glucose, electrolytes, imaging if indicated.",
    progressNote:
      "Each day — temperature, sensorium, fits, focal signs, head circumference in an infant, feeding, sodium and urine output, antibiotic day. For discharge — afebrile, conscious, feeding, course complete, hearing test arranged.",
  },

  // ---- Febrile seizure (\bfebrile so "afebrile" does not match) ----
  {
    key: "paed_febrile_seizure",
    label: "Febrile seizure",
    match: /\bfebrile (seizures?|convulsions?|fits?)|\b(simple|complex) febrile/i,
    scaffold: {
      indication: "Child was admitted after a [ simple / complex ] febrile seizure for observation and evaluation of the fever.",
      primaryDiagnosis: "[ Simple / complex ] febrile seizure with [ source of fever ]",
      procedure: { ...NO_PROCEDURE, findings: "[ source of fever; LP if done and why ]" },
      clinicalCourse: `Admitted on [ date ] after [ … ] episode(s) of [ generalised / focal ] seizure lasting [ … ] minutes with fever, as described by [ … ]. Source of fever: [ … ]. [ No further seizures. ] Returned to baseline, no focal deficit, feeding well at discharge. ${WEIGHT}`,
      medications: [M.paracetamolSos, M.rescueMidazolam],
      advice: adv([
        { module: "About febrile seizures", text: "These fits happen with fever in young children and usually stop by five to six years. They do not damage the brain. Fever medicine keeps the child comfortable but does not prevent a fit." },
        { module: "During a fit", text: "Lay the child on the side on a flat surface, loosen clothing, and note the time. Put nothing in the mouth. If it lasts more than five minutes, give the rescue medicine if one was prescribed and come to hospital." },
        MEDICINES,
        IMMUNISATION,
        followUp("on [ … ]"),
      ]),
      redFlags: [...RF_CHILD, "A fit lasting more than five minutes, or a second fit in the same illness", "Not back to normal within an hour after a fit, or weakness of one side"],
      patientActions: ["Attend the paediatric OPD on [ … ].", "Complete the vaccines due — they are safe after a febrile seizure."],
      primaryCareActions: ["Reassure; confirm the parents know the first-aid steps."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Description of the fit from the eyewitness — type, duration, number in 24 hours, post-ictal state, focal features; height and source of fever; age; previous febrile seizures; family history of febrile seizures or epilepsy; development; immunisation. Examination: sensorium, meningeal signs, fontanelle, focal deficit, source of fever. Baseline: tests directed at the fever source; LP only if meningitis is suspected.",
    progressNote:
      "Each day — further fits, sensorium, temperature, source of fever and its treatment, feeding. For discharge — back to baseline, fever source addressed, parents taught first aid for a fit.",
  },

  // ---- Status epilepticus / epilepsy ----
  {
    key: "paed_epilepsy",
    label: "Status epilepticus / epilepsy",
    match: /status epilepticus|epilep|seizure disorder|afebrile (seizures?|convulsions?)|breakthrough seizure/i,
    scaffold: {
      indication: "Child was admitted with [ status epilepticus / recurrent afebrile seizures / breakthrough seizures on treatment ] for seizure control and evaluation.",
      primaryDiagnosis: "[ Status epilepticus / epilepsy — seizure type as described; cause if known ]",
      procedure: { ...NO_PROCEDURE, findings: "[ EEG; neuroimaging; glucose, calcium, electrolytes; drug levels if done ]" },
      clinicalCourse: `Admitted on [ date ] with [ description of seizures, duration ]. Controlled with [ … ]. [ EEG / imaging findings. ] Started / continued on [ antiseizure medicine ]. Seizure-free for [ … ] hours, back to baseline, feeding well at discharge. ${WEIGHT}`,
      medications: [
        med("[ Antiseizure medicine — as charted ]", "PO", "BD", { status: "new", indication: "[ new / continued / dose changed ]" }),
        M.rescueMidazolam,
      ],
      advice: adv([
        { module: "Medicines", text: "Give the seizure medicine every day at the same times, even when the child is well. Never stop it suddenly. Keep a stock so it does not run out." },
        { module: "During a fit", text: "Lay the child on the side, note the time, put nothing in the mouth. If it lasts more than five minutes, give the rescue medicine and come to hospital." },
        { module: "Safety", text: "Supervise near water, fire, heights and roads. Showers rather than tub baths. Keep a seizure diary." },
        IMMUNISATION,
        followUp("on [ … ] with the seizure diary"),
      ]),
      redFlags: [...RF_CHILD, "A fit lasting more than five minutes, or fits one after another", "Rash, yellow eyes, or unusual drowsiness after starting a new medicine"],
      patientActions: [
        "Attend the paediatric neurology / paediatric OPD on [ … ] with the seizure diary.",
        "[ EEG / MRI on [ … ] ]",
        "Do not stop the seizure medicine without asking the doctor.",
      ],
      primaryCareActions: ["Check adherence and supply of the seizure medicine at each visit."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Eyewitness description of each seizure — onset, type, duration, frequency, post-ictal state; triggers; previous seizures and current drugs with adherence; birth history, development, head injury, family history; missed doses or intercurrent illness. Examination: sensorium, focal deficit, head circumference, neurocutaneous markers, fundus. Baseline: glucose, calcium, magnesium, electrolytes; EEG and neuroimaging as indicated.",
    progressNote:
      "Each day — seizure count and description, sensorium, drug and dose as charted, adverse effects, feeding. For discharge — seizure-free for the agreed period, oral medicine established, rescue plan and diary explained.",
  },

  // ---- Severe acute malnutrition (before diarrhoea and pneumonia) ----
  {
    key: "paed_sam",
    label: "Severe acute malnutrition",
    match: /severe acute malnutrition|\bSAM\b|severe wasting|kwashiorkor|marasm/i,
    scaffold: {
      indication: "Child was admitted with severe acute malnutrition [ with medical complications — … ] for stabilisation and nutritional rehabilitation.",
      primaryDiagnosis: "Severe acute malnutrition [ with / without oedema ] [ complications ]",
      procedure: { ...NO_PROCEDURE, findings: "[ admission weight, length, MUAC, oedema; infections found ]" },
      clinicalCourse: `Admitted on [ date ]: weight [ … ] kg, length/height [ … ] cm, MUAC [ … ] cm, oedema [ … ]. Stabilised with [ F-75 feeds, antibiotics, … ]; transitioned to [ F-100 / RUTF ] on [ … ]. Appetite test [ … ]. Oedema [ resolved on … ]. Discharged to [ community / outpatient ] management on [ date ]. ${WEIGHT} MUAC at discharge [ … ] cm.`,
      medications: [
        med("RUTF / home-based therapeutic diet", "PO", "[ as charted ]"),
        med("Iron", "PO", "OD", { indication: "rehabilitation phase only" }),
        med("Folic acid", "PO", "OD"),
        med("Multivitamin", "PO", "OD"),
        { ...M.amoxicillin, indication: "if the antibiotic course is not yet complete" },
      ],
      advice: adv([
        { module: "Feeding", text: "Feed the therapeutic diet exactly as taught, small amounts often, day and night. Continue breastfeeding. Add the family foods as taught — thick, energy-rich, with oil and a protein at each meal." },
        { module: "Hygiene", text: "Wash hands before preparing food and feeding. Give safe drinking water." },
        { module: "Play", text: "Talk to and play with the child every day — it helps recovery." },
        IMMUNISATION,
        followUp("[ weekly ] for weight and MUAC"),
      ]),
      redFlags: [...RF_CHILD, "Not eating the therapeutic food", "Losing weight, or new swelling of the feet or face", "Diarrhoea, or feels cold to touch"],
      patientActions: [
        "Attend the nutrition / paediatric OPD [ weekly ] for weight and MUAC until discharge from the programme.",
        "Collect the therapeutic food at each visit.",
      ],
      primaryCareActions: ["Enrol with the Anganwadi / community programme; weekly weight and MUAC; trace defaulters."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Diet history — breastfeeding, complementary feeding, 24-hour recall; weight loss; diarrhoea, vomiting, cough, fever; TB contact; HIV exposure; birth weight; immunisation; development; family and social circumstances. Examination: weight, length/height, MUAC, bilateral pitting oedema, danger signs, hypothermia, hydration, eye signs of vitamin A deficiency, skin, infection focus. Baseline: glucose, CBC, electrolytes, urine, chest X-ray, Mantoux, HIV as indicated.",
    progressNote:
      "Each day — weight, oedema, feed type and intake as charted, appetite, stools, temperature, glucose, infection, phase of treatment. For discharge — appetite test passed, oedema resolved, infections treated, caregiver trained, community follow-up arranged.",
  },

  // ---- Dengue ----
  {
    key: "paed_dengue",
    label: "Dengue",
    match: /dengue/i,
    scaffold: {
      indication: "Child was admitted with fever and a clinical / serological picture of dengue for monitoring through the critical phase.",
      primaryDiagnosis: "Dengue [ without warning signs / with warning signs / severe dengue ]",
      procedure: { ...NO_PROCEDURE, findings: "[ NS1 / IgM; platelet and haematocrit trend; USG for leak if done ]" },
      clinicalCourse: `Admitted on day [ … ] of fever. NS1 / IgM [ … ]. Platelet count and haematocrit trended through the febrile, critical and recovery phases; [ warning signs were / were not ] noted; [ fluids given … ]. [ No / Some ] bleeding. Afebrile for [ … ] hours, platelets [ … ] at discharge, eating well and passing urine normally. ${WEIGHT}`,
      medications: [M.paracetamolSos],
      advice: adv([
        { module: "Medicines", text: "Paracetamol only for fever. Do not give ibuprofen, aspirin or any painkiller injection." },
        FEEDING,
        { module: "Mosquito protection", text: "Use nets and full-sleeve clothes; empty stored water and coolers every week." },
        followUp("on [ … ] with a repeat platelet count"),
      ]),
      redFlags: [...RF_CHILD, "Severe tummy pain or repeated vomiting", "Bleeding from gums, nose, or in stool or urine", "Cold hands and feet, restlessness, or passing very little urine"],
      patientActions: ["Get a platelet count repeated on [ … ].", "Attend the paediatric OPD on [ … ] with the report."],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Day of fever; warning signs — abdominal pain, persistent vomiting, bleeding, lethargy, reduced urine; oral intake; neighbourhood cases. Examination: pulse, BP with pulse pressure, CRT, hepatomegaly, effusion, ascites, bleeding, tourniquet test if done. Baseline: NS1 / IgM by day of illness, CBC with haematocrit, LFT.",
    progressNote:
      "Each day — day of illness, vitals with pulse pressure and CRT, urine output as counted, haematocrit and platelet trend, warning signs, fluids as charted. For discharge — afebrile 24–48 hours without paracetamol, eating, passing urine, platelets rising, no respiratory distress.",
  },

  // ---- Nephrotic syndrome ----
  {
    key: "paed_nephrotic",
    label: "Nephrotic syndrome",
    match: /nephrotic/i,
    scaffold: {
      indication: "Child was admitted with [ generalised oedema / relapse ] of nephrotic syndrome [ with … complication ] for evaluation and steroid therapy.",
      primaryDiagnosis: "Nephrotic syndrome — [ first episode / relapse; steroid sensitive / dependent / resistant ] [ complications ]",
      procedure: { ...NO_PROCEDURE, findings: "[ urine albumin; serum albumin, cholesterol, creatinine; complement if done ]" },
      clinicalCourse: `Admitted on [ date ] with [ … ]. Urine albumin [ … ]. Started / continued on oral prednisolone on [ … ]. [ Infection / complication and treatment. ] Oedema reducing, [ urine protein nil / trace since … ], BP [ … ] at discharge. ${WEIGHT}`,
      medications: [
        med("Prednisolone", "PO", "OD, single morning dose after food", { duration: "[ … ] weeks, then as charted", indication: "do not stop suddenly" }),
        med("Calcium with vitamin D", "PO", "OD", { duration: "while on steroids" }),
      ],
      advice: adv([
        { module: "Urine testing", text: "Test the first morning urine for protein every day with the strip or boiling test taught, and write it in the diary." },
        { module: "Diet", text: "Normal diet; no extra salt while swollen. Do not restrict water unless told to." },
        { module: "Medicines", text: "Give prednisolone in the morning after food, at the dose written. Never stop it suddenly." },
        { module: "Immunisation", text: "No live vaccines while on high-dose steroids — ask before any vaccine. Pneumococcal and varicella vaccines are to be planned with the doctor." },
        followUp("on [ … ] with the urine diary"),
      ]),
      redFlags: [...RF_CHILD, "Swelling of the face or body coming back, or urine protein positive for three days", "Tummy pain, especially with fever", "Passing very little urine, or breathlessness"],
      patientActions: ["Attend the paediatric nephrology / paediatric OPD on [ … ] with the urine diary.", "Get [ creatinine / … ] repeated on [ … ]."],
      primaryCareActions: ["Check BP and weight; treat infections early — they trigger relapse."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset and progression of swelling; urine output and frothing; haematuria; previous episodes, steroid courses and response; infections; varicella and TB contact; immunisation. Examination: weight, BP, oedema, ascites, effusion, infection focus, Cushingoid features. Baseline: urine albumin and microscopy, serum albumin, cholesterol, creatinine, electrolytes, CBC; complement and HBsAg as indicated.",
    progressNote:
      "Each day — weight, BP, oedema, urine output, dipstick protein, steroid dose as charted, signs of infection or thrombosis. For discharge — oedema subsiding, BP controlled, parents taught urine testing and steroid schedule.",
  },

  // ---- Acute asthma ----
  {
    key: "paed_asthma",
    label: "Acute asthma exacerbation",
    match: /asthma/i,
    scaffold: {
      indication: "Child was admitted with an acute exacerbation of asthma [ with hypoxia / not responding to home treatment ] for bronchodilators and steroids.",
      primaryDiagnosis: "Acute exacerbation of asthma [ severity as assessed ] [ trigger ]",
      procedure: { ...NO_PROCEDURE, findings: "[ saturation on admission; chest X-ray if done ]" },
      clinicalCourse: `Admitted on [ date ] with [ breathlessness / wheeze ], saturation [ … ]. Treated with [ nebulised / inhaled salbutamol, ipratropium, steroids, oxygen, … ]. Weaned to spacer every [ … ] hours on [ … ]; in room air since [ … ]. Inhaler-with-spacer technique checked. ${WEIGHT}`,
      medications: [
        med("Salbutamol MDI with spacer", "Inhaled", "SOS for cough or wheeze", { status: "prn" }),
        med("Prednisolone", "PO", "OD", { duration: "[ … ] days in total" }),
        med("Budesonide / [ controller ] MDI with spacer", "Inhaled", "BD", { indication: "if a controller was started — rinse mouth after" }),
      ],
      advice: adv([
        { module: "Inhaler technique", text: "Use the spacer every time [ with mask under 4 years ]. Shake, one puff, breathe in and out through the spacer, then the next puff." },
        { module: "Action plan", text: "If the reliever is needed more often than every four hours, or does not help, come to hospital." },
        { module: "Triggers", text: "No smoking in the house; avoid smoke from chulha, mosquito coils and incense; reduce dust." },
        IMMUNISATION,
        followUp("in [ … ] days to review control"),
      ]),
      redFlags: [...RF_CHILD, "Reliever needed more often than every four hours, or not helping", "Too breathless to talk or feed, or lips turning blue"],
      patientActions: ["Attend the paediatric OPD in [ … ] days with the inhaler and spacer.", "Complete the steroid tablets for the days written."],
      primaryCareActions: ["Recheck inhaler technique; review control and controller need."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset and triggers; previous episodes, admissions and PICU stays; current relievers and controllers with technique and adherence; night symptoms; atopy; smoke exposure; family history. Examination: ability to talk / feed, respiratory rate, retractions, saturation, wheeze or silent chest, sensorium. Baseline: saturation; chest X-ray only if pneumonia, pneumothorax or first episode.",
    progressNote:
      "Each day — respiratory rate, work of breathing, saturation in room air, bronchodilator interval as charted, steroid day. For discharge — in room air, spacer every four hours or less often, technique checked, action plan given.",
  },

  // ---- Bronchiolitis (before pneumonia) ----
  {
    key: "paed_bronchiolitis",
    label: "Bronchiolitis",
    match: /bronchiolitis/i,
    scaffold: {
      indication: "Infant was admitted with cough, fast breathing [ and poor feeding / hypoxia ] and a clinical diagnosis of bronchiolitis for supportive care.",
      primaryDiagnosis: "Acute bronchiolitis [ ± hypoxia ]",
      procedure: { ...NO_PROCEDURE, findings: "[ saturation on admission; chest X-ray if done ]" },
      clinicalCourse: `Admitted on [ date ] with [ … ] days of cough and fast breathing; saturation [ … ]. Managed with [ oxygen, nasal suction, feeds / IV fluids ]. Off oxygen since [ … ]; feeding well [ at the breast ]. ${WEIGHT}`,
      medications: [M.paracetamolSos, med("Saline nasal drops", "Nasal", "SOS before feeds for a blocked nose", { status: "prn" })],
      advice: adv([
        { module: "Feeding", text: "Breastfeed more often, for shorter times. Clear the nose with saline drops before feeds." },
        { module: "What to expect", text: "The cough can last two to three weeks and slowly gets better. Antibiotics and cough syrups do not help." },
        { module: "Home", text: "No smoking near the baby. Wash hands before handling the baby." },
        IMMUNISATION,
        followUp("on [ … ]"),
      ]),
      redFlags: [...RF_CHILD, "Feeding less than half the usual amount, or fewer wet nappies", "Pauses in breathing, or lips turning blue"],
      patientActions: ["Attend the paediatric OPD on [ … ]."],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Age; prematurity; coryza then cough and fast breathing; feeding and wet nappies; apnoea; fever; congenital heart disease or chronic lung disease; smoke exposure; sick contacts. Examination: respiratory rate, retractions, saturation, crepitations and wheeze, hydration. Baseline: saturation; tests only if atypical.",
    progressNote:
      "Each day — respiratory rate, work of breathing, saturation, oxygen, feeding (breastfeeds / volume as said), wet nappies, apnoea. For discharge — saturation adequate in room air as charted, feeding adequately, parents confident.",
  },

  // ---- Pneumonia ----
  {
    key: "paed_pneumonia",
    label: "Pneumonia",
    match: /pneumonia|pneumonitis|\bLRTI\b|lower respiratory (tract )?infection/i,
    scaffold: {
      indication: "Child was admitted with fever, cough and fast breathing [ with chest indrawing / hypoxia / danger signs ] and a diagnosis of pneumonia for antibiotics and supportive care.",
      primaryDiagnosis: "[ Pneumonia / severe pneumonia ] [ side / lobe ] [ ± effusion ]",
      procedure: { ...NO_PROCEDURE, findings: "[ chest X-ray; saturation; blood culture ]" },
      clinicalCourse: `Admitted on [ date ] with [ … ] days of fever and cough; respiratory rate [ … ], saturation [ … ]. Treated with IV [ … ] [ ± oxygen for … days ]; switched to oral on [ … ]. Afebrile since [ … ], in room air, feeding well at discharge. ${WEIGHT}`,
      medications: [M.amoxicillin, M.paracetamolSos],
      advice: adv([
        { module: "Medicines", text: `${MEDICINES.text} Complete the full course of the antibiotic even when the child seems well.` },
        FEEDING,
        { module: "Home", text: "No smoking or chulha smoke near the child." },
        IMMUNISATION,
        followUp("after [ … ] days"),
      ]),
      redFlags: RF_CHILD,
      patientActions: ["Complete the antibiotic course.", "Attend the paediatric OPD after [ … ] days."],
      primaryCareActions: ["Check the child's breathing and feeding after two days."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Fever, cough, fast or difficult breathing, duration; danger signs; feeding; prior antibiotics; TB contact; measles; foreign body; recurrent chest infections; immunisation (Hib, PCV, measles). Examination: respiratory rate counted for a full minute, chest indrawing, saturation, grunting, auscultation, pallor, nutrition. Baseline: saturation, CBC, chest X-ray, blood culture in severe pneumonia.",
    progressNote:
      "Each day — temperature, respiratory rate, indrawing, saturation and oxygen, feeding, antibiotic day and route. For discharge — afebrile, in room air, feeding, on oral antibiotic.",
  },

  // ---- Acute gastroenteritis with dehydration ----
  {
    key: "paed_age",
    label: "Acute gastroenteritis with dehydration",
    match: /gastroenteritis|acute (watery )?diarrho?ea|dehydration|dysentery/i,
    scaffold: {
      indication: "Child was admitted with [ … ] loose stools [ and vomiting ] with [ some / severe ] dehydration as assessed, for rehydration.",
      primaryDiagnosis: "Acute gastroenteritis with [ some / severe ] dehydration",
      procedure: { ...NO_PROCEDURE, findings: "[ electrolytes; stool examination if done ]" },
      clinicalCourse: `Admitted on [ date ] with [ … ] loose stools and [ … ] vomits in [ … ]; [ findings of dehydration as recorded ]. Rehydrated with [ ORS / IV fluids per plan … ]. Tolerating ORS and feeds since [ … ], passing urine, stools reducing. ${WEIGHT}`,
      medications: [M.ors, M.zinc],
      advice: adv([
        { module: "ORS", text: "Mix one packet in the amount of clean water written on the packet — never less water. Give sips after each loose stool; make fresh every 24 hours." },
        { module: "Feeding", text: "Continue breastfeeding and the usual food during the diarrhoea. Give extra food for two weeks after recovery." },
        { module: "Hygiene", text: "Wash hands with soap after cleaning the child and before feeding. Give boiled or safe water." },
        IMMUNISATION,
        followUp("if the diarrhoea is not better in [ … ] days"),
      ]),
      redFlags: [...RF_CHILD, "Many watery stools, or blood in the stool", "Very thirsty, or sunken eyes, or passing very little urine"],
      patientActions: ["Complete the zinc for 14 days.", "Attend the paediatric OPD on [ … ] if not better."],
      primaryCareActions: ["Rotavirus vaccine if due."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Number and nature of stools (as counted by the parent), blood or mucus; vomiting; fever; urine output; thirst; feeding and what fluids given at home; drugs given; similar illness in family. Examination: weight, general condition, eyes, thirst, skin pinch, pulse, CRT, nutrition. Baseline: electrolytes in severe dehydration or IV fluids; stool tests if blood.",
    progressNote:
      "Each day — weight, stools and vomits as counted, urine, dehydration findings as recorded, fluids and ORS intake, feeding. For discharge — no dehydration signs, taking ORS and feeds, mother taught to prepare ORS.",
  },
];
