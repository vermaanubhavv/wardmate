import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * MEDICAL ONCOLOGY discharge templates — one per admission type a medical oncology unit
 * actually admits, in the priority the unit gave: planned chemotherapy cycles, chemotherapy
 * toxicity and febrile neutropenia, and the haematological malignancies.
 *
 * THE SAME RULE AS THE SURGICAL FILE: what is written here prints as written unless the
 * resident changes it. A default is the ward's standard wording for that situation, not a
 * placeholder. A genuinely patient-specific blank is written as `[ … ]` and prints as a
 * visible blank if left, never as a guess.
 *
 * NOT SIGNED OFF YET. The surgical templates carry the unit's v1.0 review. These are drafted
 * from standard practice and MUST be read through by the oncology unit before the pilot —
 * every drug, dose and threshold in this file is a clinical statement.
 *
 * WHY THE `procedure` BLOCK IS USED FOR CHEMOTHERAPY. The discharge document has one
 * "what was done to the patient" block. On a surgical ward that is the operation; on an
 * oncology ward it is the cycle that was delivered. `anaesthesia` is left empty on purpose —
 * an empty field is not printed (see procedureLines in lib/discharge-render.ts), so no
 * oncology summary carries an anaesthesia line.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

const M = {
  ondansetron: { generic: "Ondansetron", strength: "8 mg", route: "PO", frequency: "BD", duration: "3 days", indication: "then SOS for vomiting", status: "new" } as TemplateMedication,
  dexamethasone: { generic: "Dexamethasone", strength: "4 mg", route: "PO", frequency: "BD after food", duration: "3 days", indication: "delayed emesis", status: "new" } as TemplateMedication,
  domperidone: { generic: "Domperidone", strength: "10 mg", route: "PO", frequency: "TDS before food", duration: "5 days", status: "new" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "14 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", indication: "see red flags — do NOT take for fever without telling the unit first", status: "prn" } as TemplateMedication,
  gcsf: { generic: "Filgrastim (G-CSF)", strength: "300 mcg", route: "SC", frequency: "OD", duration: "[ … ] days", indication: "as charted; stop on count recovery", status: "new" } as TemplateMedication,
  allopurinol: { generic: "Allopurinol", strength: "300 mg", route: "PO", frequency: "OD", duration: "[ … ]", indication: "tumour lysis prophylaxis", status: "new" } as TemplateMedication,
  cotrimoxazole: { generic: "Co-trimoxazole", strength: "160/800 mg", route: "PO", frequency: "three days a week", indication: "Pneumocystis prophylaxis while on steroids / purine analogues", status: "new" } as TemplateMedication,
  fluconazole: { generic: "Fluconazole", strength: "150 mg", route: "PO", frequency: "OD", duration: "[ … ]", indication: "oral candidiasis / prophylaxis as charted", status: "new" } as TemplateMedication,
  chlorhexidine: { generic: "Chlorhexidine / saline-bicarbonate mouthwash", dose: "10 ml", route: "gargle", frequency: "QID", duration: "10 days", indication: "mucositis care", status: "new" } as TemplateMedication,
  ors: { generic: "Oral rehydration salts", dose: "1 sachet in 1 litre", route: "PO", frequency: "sip through the day", duration: "till stools settle", status: "new" } as TemplateMedication,
  loperamide: { generic: "Loperamide", strength: "2 mg", route: "PO", frequency: "after each loose stool, maximum 8 in a day", indication: "STOP and report if there is fever or blood in the stool", status: "prn" } as TemplateMedication,
  folicAcid: { generic: "Folic acid", strength: "5 mg", route: "PO", frequency: "OD", duration: "[ … ]", status: "new" } as TemplateMedication,
  zoledronic: { generic: "Zoledronic acid", strength: "4 mg", route: "IV", frequency: "once every 4 weeks", indication: "dose adjusted to renal function; dental check before starting", status: "new" } as TemplateMedication,
  acyclovir: { generic: "Acyclovir", strength: "400 mg", route: "PO", frequency: "BD", indication: "zoster prophylaxis while on bortezomib / anti-CD38", status: "new" } as TemplateMedication,
};

// --- shared wording ---------------------------------------------------------------------

/** THE oncology red flag. Fever in a patient on chemotherapy is an emergency until the count
 *  is known — it is written first on every card in this file, in the same words. */
const RF_FEVER =
  "Fever of 100.4 °F (38 °C) or above, or chills and rigors — go to the nearest emergency AT ONCE, tell them you are on chemotherapy, and do not take paracetamol before your temperature is recorded.";

const RF_BLEEDING = "Any bleeding — gums, nose, blood in urine or stool, or new bruises or red spots on the skin.";
const RF_INTAKE = "Vomiting or mouth ulcers severe enough that you cannot keep fluids down.";
const RF_BREATHLESS = "New breathlessness, chest pain, or a cough with sputum.";
const RF_LINE = "Redness, pain, swelling or discharge at the chemoport or PICC line site.";

const FEVER_CARD =
  "Fever card: this patient is on chemotherapy. Fever is a medical emergency. Send a complete blood count, take blood cultures BEFORE the first antibiotic dose, and give the first intravenous antibiotic within one hour. Do not manage at home.";

const A_HYGIENE = { module: "Infection precautions", text: "Wash hands often. Avoid crowds and anyone with a cough, cold or fever. Eat freshly cooked hot food; avoid raw salads, cut fruit from outside and unboiled water." };
const A_MOUTH = { module: "Mouth care", text: "Rinse the mouth with the prescribed mouthwash four times a day and after every meal. Use a soft toothbrush." };
const A_FLUIDS = { module: "Fluids", text: "Drink 2.5 to 3 litres of water a day unless you have been told to restrict fluids." };
const A_CONTRA = { module: "Contraception", text: "Use reliable contraception during treatment and for the period the unit has advised afterwards. Tell the unit at once if a pregnancy is suspected." };

const PA_NEXT_CYCLE = "Next cycle is due on [ … ]. Come to the day-care unit fasting only if you have been told to.";
const PA_COUNTS = "Get a complete blood count done on [ … ] (day [ … ] of this cycle) and bring the report to the next visit.";
const PA_FEVER = "Record your temperature if you feel unwell. For 100.4 °F or above, come straight to the emergency — do not wait for morning.";
const PA_BRING = "Bring this summary, your treatment card and all reports to every visit.";

const PC_NO_HOME_FEVER =
  "Do not treat fever in this patient at home or with oral antibiotics. Refer to the oncology unit or the nearest emergency the same day for a blood count and cultures.";
const PC_NO_IM =
  "Avoid intramuscular injections, aspirin and NSAIDs while the platelet count is low.";

// --- the templates ----------------------------------------------------------------------

export const ONCOLOGY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Febrile neutropenia (checked first: it is an admission type, not a diagnosis) ----
  {
    key: "febrile_neutropenia",
    label: "Febrile neutropenia",
    match: /febrile neutropenia|\bFN\b|neutropenic (fever|sepsis)|fever with neutropenia|post[- ]chemo(therapy)? fever/i,
    families: ["febrile_neutropenia"],
    scaffold: {
      indication:
        "Patient on chemotherapy for [ diagnosis ] was admitted with fever on day [ … ] of cycle [ … ] of [ regimen ], with an absolute neutrophil count of [ … ].",
      primaryDiagnosis:
        "Febrile neutropenia — [ diagnosis, stage ] on [ regimen ], cycle [ … ] day [ … ]; ANC [ … ]; [ source identified / no source identified ]",
      procedure: {
        name: "Empirical intravenous antibiotic therapy for febrile neutropenia",
        anaesthesia: "",
        findings: "[ ANC at presentation; blood cultures from peripheral and line; urine, chest imaging, examined sites — mouth, perianum, line site, chest, skin ]",
        drains: "[ chemoport / PICC — kept or removed, tip culture if removed ]",
        complications: "Nil",
        outcome: "Afebrile with count recovery; discharged on the plan below.",
      },
      clinicalCourse:
        "Admitted with fever on day [ … ] of cycle [ … ] of [ regimen ]. Blood cultures were taken from a peripheral vein and from the line BEFORE the first antibiotic dose, and empirical [ piperacillin-tazobactam ] was started within one hour. ANC at admission was [ … ]. Cultures grew [ … / no growth at 48 hours ]. Antibiotics were [ continued / de-escalated / escalated ] on day [ … ] after review. G-CSF was [ given / not given ]. The patient became afebrile on [ date ] and the neutrophil count recovered to [ … ] on [ date ]. Fit for discharge, afebrile for 48 hours with a recovering count.",
      medications: [M.gcsf, M.paracetamolSos, M.chlorhexidine, M.pantoprazole],
      advice: adv([
        { module: "Infection precautions", text: A_HYGIENE.text },
        A_MOUTH,
        A_FLUIDS,
        { module: "Chemotherapy", text: "The next cycle and its dose will be decided at the review visit after seeing the counts. Do not restart chemotherapy on your own." },
      ]),
      redFlags: [RF_FEVER, RF_BLEEDING, RF_INTAKE, RF_BREATHLESS, RF_LINE],
      patientActions: [PA_FEVER, PA_COUNTS, "Attend the oncology OPD on [ … ] for review before the next cycle.", PA_BRING],
      primaryCareActions: [PC_NO_HOME_FEVER, PC_NO_IM, FEVER_CARD],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "The regimen, the cycle and the exact day of the cycle; the last chemotherapy date; the last known counts and nadir; onset and pattern of fever; localising symptoms — mouth, throat, perianal pain, dysuria, cough, diarrhoea, line site; previous febrile episodes and what grew; antibiotic exposure; prophylaxis and G-CSF given; transfusion history. Examination: temperature, perfusion and blood pressure (look for sepsis early), oral cavity, perianum (do NOT do a digital rectal examination), chest, skin, and every line site. Baseline: CBC with differential and ANC, blood cultures from peripheral and line before antibiotics, urine culture, chest imaging, renal and liver function, lactate, CRP.",
    progressNote:
      "Each day — temperature trend and time to defervescence; ANC and platelet trend; culture results and day of antibiotic; source found or still not found; oral intake; line site; G-CSF given or not. Escalate on persistent fever beyond 72 hours or any new organ sign. For discharge — afebrile 48 hours, ANC rising, tolerating orals, source treated or excluded.",
  },

  // ---- Planned chemotherapy cycle, solid tumour ----
  {
    key: "chemo_cycle",
    label: "Chemotherapy cycle (solid tumour)",
    match: /chemotherapy|\bchemo\b|cycle \d|\bFOLFOX\b|\bFOLFIRI\b|\bCAPOX\b|carboplatin|cisplatin|paclitaxel|docetaxel|gemcitabine|pemetrexed|\bAC[- ]?T\b|neoadjuvant|adjuvant chemo/i,
    families: ["chemo_cycle"],
    scaffold: {
      indication:
        "Patient was admitted for cycle [ … ] of [ regimen ] for [ diagnosis, stage ].",
      primaryDiagnosis:
        "[ Primary site ] carcinoma — [ histology; cTNM / pTNM, stage; receptor and molecular markers ]; on [ regimen ], cycle [ … ] of [ … ]; ECOG [ … ]",
      procedure: {
        name: "Cycle [ … ] of [ regimen ]",
        anaesthesia: "",
        findings: "[ pre-chemotherapy counts, renal and liver function, weight and body surface area; dose given as percentage of the planned dose and the reason for any reduction ]",
        drains: "[ chemoport / PICC / peripheral line ]",
        complications: "[ Nil / infusion reaction / extravasation — describe ]",
        outcome: "Cycle delivered in full as planned; tolerated well.",
      },
      clinicalCourse:
        "Admitted for cycle [ … ] of [ regimen ]. Pre-chemotherapy assessment showed ECOG [ … ], weight [ … ] kg, haemoglobin [ … ], ANC [ … ], platelets [ … ], creatinine [ … ] and bilirubin [ … ]. The patient was found fit for chemotherapy and consent was taken. Pre-hydration and antiemetic premedication were given as per protocol and cycle [ … ] was administered on [ date ] at [ 100 ] % of the planned dose [ reduced to … % because … ]. The infusion was tolerated without a reaction or extravasation. The patient remained comfortable, tolerated orals, and was fit for discharge on [ date ] with the antiemetic and supportive plan below.",
      medications: [M.ondansetron, M.dexamethasone, M.domperidone, M.pantoprazole, M.chlorhexidine, M.paracetamolSos],
      advice: adv([A_HYGIENE, A_MOUTH, A_FLUIDS, { module: "Diet", text: "Eat small frequent meals. Freshly cooked, hot, well-washed food. Avoid outside food during the low-count period." }, A_CONTRA]),
      redFlags: [RF_FEVER, RF_INTAKE, RF_BLEEDING, RF_LINE, "Numbness, tingling or burning of the hands and feet that is worse than after the last cycle."],
      patientActions: [PA_NEXT_CYCLE, PA_COUNTS, PA_FEVER, PA_BRING],
      primaryCareActions: [PC_NO_HOME_FEVER, FEVER_CARD],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "The diagnosis with histology, stage and molecular markers; intent of treatment (curative, adjuvant, neoadjuvant or palliative) and whether the patient knows it; the regimen, the cycle number and what is planned in total; toxicity after the last cycle graded by what it stopped the patient doing — vomiting, mucositis, diarrhoea, neuropathy, fever; interval admissions and transfusions; weight trend and appetite; comorbidities and drugs; ECOG performance status. Examination: performance status, weight and body surface area, mucosa, line site, the primary site and nodes, chest and abdomen, neuropathy. Baseline: CBC with ANC, renal and liver function, electrolytes; regimen-specific tests — echocardiogram for anthracyclines, audiometry and creatinine clearance for cisplatin, hepatitis B and C and HIV serology before rituximab or steroids.",
    progressNote:
      "Day of admission — fitness for chemotherapy: counts, renal and liver function, weight, ECOG, consent. Chemotherapy day — premedication given, drugs and doses run, infusion tolerated, any reaction or extravasation. Day after — vomiting, oral intake, mucosa, line site. For discharge — tolerating orals, no fever, antiemetics prescribed, next cycle and count dates given.",
  },

  // ---- Chemotherapy toxicity / supportive-care admission ----
  {
    key: "chemo_toxicity",
    label: "Chemotherapy toxicity (mucositis, emesis, diarrhoea)",
    match: /mucositis|stomatitis|chemo(therapy)?[- ]induced|intractable vomiting|persistent vomiting|chemo(therapy)? (toxicity|diarrho?ea)|dehydration (after|post) chemo/i,
    families: ["chemo_toxicity"],
    scaffold: {
      indication:
        "Patient on [ regimen ] for [ diagnosis ] was admitted on day [ … ] of cycle [ … ] with [ grade … mucositis / intractable vomiting / diarrhoea ] and [ dehydration / inability to maintain oral intake ].",
      primaryDiagnosis:
        "[ Chemotherapy-induced mucositis / nausea and vomiting / diarrhoea ], grade [ … ] — on [ regimen ], cycle [ … ] day [ … ], for [ diagnosis, stage ]",
      procedure: {
        name: "Supportive management of chemotherapy toxicity",
        anaesthesia: "",
        findings: "[ grade of the toxicity; counts; electrolytes and renal function on admission; stool and blood cultures if fever ]",
        drains: "[ chemoport / PICC / peripheral line ]",
        complications: "Nil",
        outcome: "Toxicity settled to grade [ … ]; maintaining oral intake at discharge.",
      },
      clinicalCourse:
        "Admitted on day [ … ] of cycle [ … ] of [ regimen ] with [ toxicity ], graded [ … ]. There was no fever and the ANC was [ … ] [ / febrile neutropenia was excluded / treated — see above ]. The patient was managed with intravenous fluids, [ antiemetics / mouth care and analgesia / antidiarrhoeals ], correction of [ potassium / magnesium / sodium ], and nutritional support. Oral intake was re-established on [ date ]. The toxicity settled to grade [ … ] and the patient was fit for discharge. The next cycle will be [ delayed to … / given at a reduced dose of … % ] and this has been recorded on the treatment card.",
      medications: [M.ondansetron, M.chlorhexidine, M.fluconazole, M.ors, M.loperamide, M.pantoprazole, M.paracetamolSos],
      advice: adv([
        A_MOUTH,
        { module: "Diet", text: "Soft, bland, lukewarm food. Avoid spicy, sour, rough and very hot food while the mouth is sore. Small frequent portions." },
        A_FLUIDS,
        A_HYGIENE,
      ]),
      redFlags: [RF_FEVER, RF_INTAKE, "Loose stools more than [ 4 ] times a day, or any blood in the stool.", RF_BLEEDING],
      patientActions: [PA_COUNTS, PA_FEVER, "Attend the oncology OPD on [ … ] to decide the timing and dose of the next cycle.", PA_BRING],
      primaryCareActions: [PC_NO_HOME_FEVER, "Do not give an antidiarrhoeal if there is fever or blood in the stool — refer instead."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "The regimen and the exact day of the cycle; what the patient can and cannot eat or drink and since when; number and character of stools; vomiting frequency and whether drugs are being kept down; the antiemetics actually taken at home and how; mouth pain and its effect on swallowing; fever at any point; weight change. Examination: hydration, weight, oral cavity graded, abdomen, perianum, line site. Baseline: CBC with ANC, electrolytes with magnesium, renal function, and stool studies if diarrhoea.",
    progressNote:
      "Each day — the toxicity graded again, oral intake in millilitres, stool count, vomiting episodes, weight, electrolytes, ANC. For discharge — maintaining oral intake without drips, toxicity down to grade 1, electrolytes corrected, next-cycle plan written.",
  },

  // ---- Acute leukaemia — induction / consolidation ----
  {
    key: "leukaemia_induction",
    label: "Acute leukaemia — induction / consolidation",
    match: /\bAML\b|\bALL\b|acute (myeloid|lymphoblastic|promyelocytic) leuka?emia|\bAPL\b|induction chemotherapy|consolidation chemotherapy|blast crisis/i,
    families: ["leukaemia_induction"],
    scaffold: {
      indication:
        "Patient was admitted for [ induction / consolidation ] chemotherapy for [ acute leukaemia subtype ].",
      primaryDiagnosis:
        "[ Acute myeloid / lymphoblastic leukaemia ] — [ subtype by morphology, flow cytometry, cytogenetics and molecular markers; risk group ]; [ induction / consolidation ] [ … ]",
      procedure: {
        name: "[ Induction / consolidation ] chemotherapy — [ regimen ]",
        anaesthesia: "",
        findings: "[ presenting counts and blast percentage; bone marrow aspiration and biopsy with flow cytometry, cytogenetics and molecular panel; CNS status on CSF study ]",
        drains: "[ central line / chemoport — inserted on … ]",
        complications: "[ Nil / tumour lysis syndrome / febrile neutropenia / bleeding — describe ]",
        outcome: "[ Day-14 / end-of-induction marrow: … ]",
      },
      clinicalCourse:
        "Admitted with [ presentation ]. Counts at presentation were haemoglobin [ … ], total leucocyte count [ … ] with [ … ] % blasts and platelets [ … ]. Bone marrow aspiration and biopsy on [ date ] confirmed [ diagnosis ] with [ flow cytometry / cytogenetics / molecular findings ]. Tumour lysis prophylaxis with hydration and [ allopurinol / rasburicase ] was started before chemotherapy and the metabolic panel was monitored [ … ] hourly. [ Regimen ] was started on [ date ]. The course was complicated by [ febrile neutropenia on day … , treated with … / nil ]. Transfusion support: [ … ] units of packed cells and [ … ] units of platelets. Counts recovered from [ date ]. [ Day-14 / end-of-induction ] marrow showed [ … ]. Fit for discharge, afebrile with a recovering count, on the plan below.",
      medications: [M.allopurinol, M.cotrimoxazole, M.fluconazole, M.acyclovir, M.chlorhexidine, M.pantoprazole, M.paracetamolSos],
      advice: adv([
        { module: "Infection precautions", text: A_HYGIENE.text + " Avoid gardening, construction dust and pets' litter while the counts are low." },
        A_MOUTH,
        A_FLUIDS,
        { module: "Bleeding precautions", text: "No intramuscular injections, no aspirin or painkillers of the brufen type, soft toothbrush, no shaving with a blade, and avoid constipation and straining." },
        A_CONTRA,
      ]),
      redFlags: [RF_FEVER, RF_BLEEDING, RF_BREATHLESS, RF_LINE, "Severe headache, drowsiness, confusion or a fit."],
      patientActions: [PA_COUNTS, PA_FEVER, "Attend on [ … ] for the count check and the next block of treatment.", PA_BRING],
      primaryCareActions: [PC_NO_HOME_FEVER, PC_NO_IM, "Transfuse only with irradiated and leucodepleted products, and only after discussing with the treating unit.", FEVER_CARD],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration of fever, fatigue, bleeding and bone pain; infections and transfusions already had; any preceding cytotoxic or radiation exposure or marrow disorder; comorbidities that decide fitness for intensive treatment; who is at home to look after the patient and how far away they live — it decides whether ambulatory count monitoring is safe. Examination: performance status, pallor, petechiae and bleeding sites, oral cavity and gums, lymph nodes, liver and spleen, testes, sternal tenderness, fundus, and a full septic screen. Baseline: CBC with peripheral smear and blast count, marrow aspiration, biopsy, flow cytometry, cytogenetics and molecular panel; CSF study where indicated; coagulation profile and fibrinogen (urgently if promyelocytic leukaemia is suspected); uric acid, potassium, phosphate, calcium and renal function; hepatitis B and C and HIV serology; echocardiogram before anthracyclines; blood group and antibody screen.",
    progressNote:
      "Each day — temperature, counts with ANC and platelets, transfusions given, tumour lysis panel while at risk, mucositis grade, oral intake, line site, and the day of the chemotherapy block. Note every culture and every antibiotic day. For discharge — afebrile, ANC and platelets recovering without support, mucositis settled, prophylaxis prescribed and the return date fixed.",
  },

  // ---- Lymphoma ----
  {
    key: "lymphoma_chemo",
    label: "Lymphoma — chemotherapy cycle",
    match: /lymphoma|Hodgkin|\bNHL\b|\bDLBCL\b|\bABVD\b|R-?CHOP|\bCHOP\b|rituximab/i,
    families: ["lymphoma_chemo"],
    scaffold: {
      indication:
        "Patient was admitted for cycle [ … ] of [ regimen ] for [ lymphoma subtype, stage ].",
      primaryDiagnosis:
        "[ Hodgkin / non-Hodgkin ] lymphoma, [ subtype ] — [ Ann Arbor stage; B symptoms present or absent; IPI / IPS score ]; on [ regimen ], cycle [ … ] of [ … ]",
      procedure: {
        name: "Cycle [ … ] of [ regimen ]",
        anaesthesia: "",
        findings: "[ pre-chemotherapy counts, renal and liver function; hepatitis B, C and HIV serology status; echocardiogram before anthracycline; dose given as a percentage of planned ]",
        drains: "[ chemoport / PICC / peripheral line ]",
        complications: "[ Nil / rituximab infusion reaction / tumour lysis — describe ]",
        outcome: "Cycle delivered as planned; tolerated well.",
      },
      clinicalCourse:
        "Admitted for cycle [ … ] of [ regimen ]. Pre-chemotherapy counts, renal and liver function were acceptable and the patient was found fit. [ For the first cycles with a high disease burden: tumour lysis prophylaxis with hydration and allopurinol was given and the metabolic panel was monitored. ] Premedication and the cycle were given on [ date ] at [ 100 ] % of the planned dose. [ The rituximab infusion was tolerated without a reaction. ] The patient remained afebrile, tolerated orals and was fit for discharge on [ date ]. Response assessment by [ CT / PET-CT ] is planned after cycle [ … ].",
      medications: [M.ondansetron, M.dexamethasone, M.allopurinol, M.cotrimoxazole, M.pantoprazole, M.chlorhexidine, M.paracetamolSos],
      advice: adv([A_HYGIENE, A_MOUTH, A_FLUIDS, A_CONTRA, { module: "Fertility", text: "Discuss fertility preservation with the unit before the next cycle if this has not already been decided." }]),
      redFlags: [RF_FEVER, RF_BLEEDING, RF_INTAKE, RF_BREATHLESS, RF_LINE],
      patientActions: [PA_NEXT_CYCLE, PA_COUNTS, PA_FEVER, "Attend for the planned [ CT / PET-CT ] on [ … ] and bring the films and report.", PA_BRING],
      primaryCareActions: [PC_NO_HOME_FEVER, FEVER_CARD],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration and site of node enlargement; B symptoms — fever, drenching night sweats, weight loss over 10 % in six months — asked and recorded as present or absent, because they are part of the stage; pruritus and alcohol-induced pain; mediastinal symptoms; the biopsy report with immunohistochemistry; staging scans; hepatitis B status before rituximab; toxicity and counts after the last cycle. Examination: all node groups with size, liver and spleen, Waldeyer's ring, skin, testes, and performance status. Baseline: CBC, LDH, uric acid, renal and liver function, hepatitis B and C and HIV serology, echocardiogram before an anthracycline, PET-CT for staging and response, and marrow study where indicated.",
    progressNote:
      "Day of admission — fitness, counts, hepatitis B status, echocardiogram if due. Chemotherapy day — premedication, drugs and doses, infusion tolerated, reaction or not. Day after — intake, mucosa, fever, tumour lysis panel while at risk. For discharge — afebrile, eating, antiemetics and prophylaxis prescribed, next cycle and scan dates given.",
  },

  // ---- Multiple myeloma ----
  {
    key: "myeloma",
    label: "Multiple myeloma",
    match: /myeloma|plasma cell (dyscrasia|neoplasm)|\bVRd\b|bortezomib|lenalidomide|daratumumab|\bMGUS\b/i,
    families: ["myeloma"],
    scaffold: {
      indication:
        "Patient was admitted for [ cycle … of regimen / management of … ] for multiple myeloma.",
      primaryDiagnosis:
        "Multiple myeloma, [ light chain / IgG / IgA ] type — [ ISS / R-ISS stage; cytogenetic risk ]; with [ anaemia / renal impairment / bone disease / hypercalcaemia ]; on [ regimen ], cycle [ … ]",
      procedure: {
        name: "Cycle [ … ] of [ regimen ]",
        anaesthesia: "",
        findings: "[ counts, calcium, creatinine and creatinine clearance, serum free light chain ratio and M-protein trend; skeletal survey or whole-body imaging findings ]",
        drains: "[ chemoport / PICC / peripheral line ]",
        complications: "[ Nil / neuropathy / infection — describe ]",
        outcome: "Cycle delivered; tolerated well.",
      },
      clinicalCourse:
        "Admitted for cycle [ … ] of [ regimen ]. On admission the haemoglobin was [ … ], calcium [ … ], creatinine [ … ] and the M-protein / free light chain was [ … ]. [ Hypercalcaemia was corrected with hydration and … / Renal function was supported with hydration and avoidance of nephrotoxic drugs. ] The cycle was given on [ date ] with dose adjustment for [ renal function / neuropathy ] as recorded. Bone disease was treated with [ zoledronic acid / denosumab ] and pain control. Peripheral neuropathy was graded [ … ] before the cycle. The patient was fit for discharge on [ date ].",
      medications: [M.acyclovir, M.cotrimoxazole, M.zoledronic, M.pantoprazole, M.paracetamolSos, M.ondansetron],
      advice: adv([
        A_HYGIENE,
        A_FLUIDS,
        { module: "Bone care", text: "Stay gently active but avoid lifting weights, sudden twisting and falls. Report any new back pain at once — it may mean a fracture." },
        { module: "Kidney care", text: "Avoid painkillers of the brufen type and any medicine not prescribed by this unit. Keep up the fluid intake." },
        { module: "Dental care", text: "Complete any dental treatment before the bone injection and tell every dentist that you are on it." },
      ]),
      redFlags: [RF_FEVER, "New or worsening back pain, or weakness, numbness or difficulty passing urine — go to the emergency at once.", RF_BLEEDING, "Confusion, excessive thirst or a drop in urine output."],
      patientActions: [PA_NEXT_CYCLE, "Get creatinine, calcium and a complete blood count done on [ … ] and bring the reports.", PA_FEVER, PA_BRING],
      primaryCareActions: [PC_NO_HOME_FEVER, "Avoid NSAIDs and contrast studies without discussing with the unit — the kidneys are at risk."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Bone pain — site, character, night pain, any sudden change suggesting a fracture; neurological symptoms suggesting cord compression; fatigue and breathlessness; infections; thirst, confusion and urine output; drug history including painkillers and native medicines; neuropathy graded by what it stops the patient doing. Examination: performance status, pallor, spinal tenderness and deformity, a focused neurological examination of the lower limbs including sensory level and anal tone, hydration, and infection sites. Baseline: CBC, calcium, renal function with creatinine clearance, albumin, beta-2 microglobulin, LDH, serum and urine protein electrophoresis with immunofixation, serum free light chains, marrow study, and whole-body low-dose CT or MRI.",
    progressNote:
      "Each day — pain score and what it stops the patient doing, calcium, creatinine and urine output, counts, neuropathy grade, and the cycle day. For discharge — pain controlled on the written regimen, calcium and creatinine stable, bone treatment given, next cycle and lab dates fixed.",
  },

  // ---- Cytopenia / transfusion support ----
  {
    key: "transfusion_support",
    label: "Cytopenia / transfusion support",
    match: /transfusion|anaemia for (transfusion|correction)|thrombocytopenia|pancytopenia|count support|packed (cell|red)|platelet transfusion/i,
    families: ["transfusion_support"],
    scaffold: {
      indication:
        "Patient with [ diagnosis ] on [ regimen ] was admitted for correction of [ anaemia / thrombocytopenia / pancytopenia ] with a [ haemoglobin / platelet count ] of [ … ].",
      primaryDiagnosis:
        "[ Chemotherapy-induced / disease-related ] [ anaemia / thrombocytopenia / pancytopenia ] — in [ diagnosis, stage ], on [ regimen ], cycle [ … ] day [ … ]",
      procedure: {
        name: "Transfusion support",
        anaesthesia: "",
        findings: "[ counts before and after transfusion; number and type of units — packed cells, single-donor or random-donor platelets; irradiated and leucodepleted as indicated ]",
        drains: "[ chemoport / PICC / peripheral line ]",
        complications: "[ Nil / transfusion reaction — describe ]",
        outcome: "Counts corrected; no transfusion reaction.",
      },
      clinicalCourse:
        "Admitted with [ symptomatic anaemia / thrombocytopenia with bleeding / an asymptomatic count below the transfusion threshold ]. Counts on admission were haemoglobin [ … ], ANC [ … ] and platelets [ … ]. [ … ] units of [ irradiated leucodepleted packed cells / platelets ] were transfused on [ dates ] without a reaction. Post-transfusion counts were [ … ]. There was no active bleeding at discharge. The cause of the cytopenia is [ chemotherapy nadir / marrow involvement / bleeding / nutritional — with the relevant workup sent ]. The next cycle will be [ delayed / dose-reduced / given as planned ].",
      medications: [M.folicAcid, M.pantoprazole, M.paracetamolSos],
      advice: adv([
        { module: "Bleeding precautions", text: "No intramuscular injections, no aspirin or painkillers of the brufen type, soft toothbrush, no blade shaving, and avoid straining at stool." },
        A_HYGIENE,
        { module: "Activity", text: "Get up slowly. Avoid driving and working at a height until the blood count is back up." },
        A_FLUIDS,
      ]),
      redFlags: [RF_BLEEDING, RF_FEVER, "Increasing breathlessness, chest pain or fainting.", "Black stools or vomiting of blood."],
      patientActions: [PA_COUNTS, PA_FEVER, "Attend on [ … ] for the count check.", PA_BRING],
      primaryCareActions: [PC_NO_IM, PC_NO_HOME_FEVER, "Use only irradiated and leucodepleted products where the unit has specified them."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Symptoms of anaemia and of bleeding, with sites; the regimen and the day of the cycle; the count trend and previous nadirs; transfusion history, reactions and how many units so far; diet, and any blood loss from the gut or the genital tract. Examination: pallor, bleeding sites including gums, skin, fundus if the platelets are very low, liver and spleen, and a septic screen. Baseline: CBC with smear and reticulocyte count, blood group and antibody screen, iron studies, B12 and folate where the picture fits, renal and liver function, and a marrow study if the cause is unexplained.",
    progressNote:
      "Each day — counts before and after each unit, bleeding sites, transfusion reactions, and the cause under investigation. For discharge — count above the agreed threshold, no active bleeding, cause identified or being worked up, and the next count date given.",
  },
];

/** Used when the typed diagnosis matches none of the above — still a scaffold, never a blank
 *  page, and still carrying the fever red flag every oncology patient must go home with. */
export const ONCOLOGY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "oncology_generic",
  label: "Medical oncology — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient with [ diagnosis, stage ] was admitted for [ chemotherapy / management of a complication of treatment / symptom control / investigation ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Treatment given during this admission ]",
      anaesthesia: "",
      findings: "[ pre-treatment counts and organ function; what was given and at what dose ]",
      drains: "[ chemoport / PICC / peripheral line ]",
      complications: "Nil",
      outcome: "[ Outcome of this admission ]",
    },
    clinicalCourse:
      "Admitted with [ presentation ] on day [ … ] of cycle [ … ] of [ regimen ] for [ diagnosis ]. [ Management given. ] The patient improved and was fit for discharge on [ date ] with the plan below.",
    medications: [M.ondansetron, M.pantoprazole, M.chlorhexidine, M.paracetamolSos],
    advice: adv([A_HYGIENE, A_MOUTH, A_FLUIDS]),
    redFlags: [RF_FEVER, RF_BLEEDING, RF_INTAKE, RF_LINE],
    patientActions: [PA_COUNTS, PA_FEVER, "Attend the oncology OPD on [ … ].", PA_BRING],
    primaryCareActions: [PC_NO_HOME_FEVER, FEVER_CARD],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "The diagnosis with histology and stage, the intent of treatment and what the patient understands of it; the regimen, cycle and day; toxicity since the last cycle graded by what it stopped the patient doing; performance status and weight trend; comorbidities and all drugs including native medicines; who is at home and how far away the hospital is. Examination: performance status, mucosa, line site, the primary site and nodes, chest and abdomen, and a septic screen. Baseline: CBC with ANC, renal and liver function, electrolytes, and anything the regimen specifically requires.",
  progressNote:
    "Each day — temperature, counts, oral intake, the toxicity being treated and its grade, line site, and the cycle day. For discharge — afebrile, tolerating orals, supportive drugs prescribed, and the next cycle and count dates written down.",
};
