import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The internal medicine keyterm core.
 *
 * WHY THESE WORDS. Nova-3 Medical already knows common medical English. What it reliably gets
 * wrong on an Indian medicine round is exactly this list: the tropical-fever serology spoken
 * as initials ("NS1", "Widal", "Weil-Felix", "MP smear", "scrub typhus IgM"), the anti-microbial
 * brand names off an Indian chart ("Monocef", "Magnex", "Piptaz", "Meropenem"), anti-tubercular
 * therapy spoken as one token ("ATT", "HRZE", "AKT-4"), the antihypertensive and insulin
 * vocabulary a diabetes/hypertension admission runs on ("labetalol infusion", "basal bolus",
 * "GRBS", "sliding scale"), and the haematology shorthand ("pancytopenia", "schistocytes",
 * "reticulocyte count", "peripheral smear").
 *
 * Where the surgical core is procedure- and anatomy-heavy, this one is DRUG-, SEROLOGY- and
 * SYNDROME-heavy. That difference is the whole point of a specialty lexicon.
 *
 * ~53 named diagnoses (2026-09-05), covering the unit's stated casemix in priority order —
 * infective, blood/immunity, uncontrolled hypertension and diabetes (docs/specialty-packs.md
 * §2a) — plus a fourth section for the cardiac, renal, neurological and hepatic admissions
 * that ride along on any general medicine ward. This is dictation vocabulary only: recognising
 * a name is not the same as WardMate having a scoring pathway or a discharge template for it —
 * see lib/scoring/definitions/ and lib/discharge-templates-medicine.ts for what is actually
 * built versus what is only spelled correctly.
 *
 * Everything here is tagged `internal-medicine`, so it is only ever boosted for a unit whose
 * pack asks for it. A surgical unit's keyterm budget is never spent on Weil-Felix.
 *
 * "RT" IS DELIBERATELY ABSENT — ambiguous between radiotherapy and Ryle's tube, and the app
 * already refuses to expand it (CONTEXT.md §2). Do not add it.
 */

const MED = "internal-medicine" as const;

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
    specialties: [MED],
    triggers: [term.toLowerCase(), ...aliases.map((a) => a.toLowerCase()), ...triggers],
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const brand = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication", "medication-brand"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation", "microbiology"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);

export const INTERNAL_MEDICINE: MedicalLexiconEntry[] = [
  // --- Febrile-illness syndromes and diagnoses ------------------------------------------
  dx("enteric fever", ["typhoid", "typhoid fever", "salmonella typhi"], ["fever", "widal"]),
  dx("dengue fever", ["dengue", "DHF", "dengue haemorrhagic fever", "dengue shock syndrome", "DSS"], ["fever", "thrombocytopenia", "ns1"]),
  dx("scrub typhus", ["orientia tsutsugamushi", "rickettsial fever", "eschar"], ["fever", "weil felix"]),
  dx("malaria", ["falciparum malaria", "vivax malaria", "P. falciparum", "P. vivax"], ["fever", "mp smear"]),
  dx("leptospirosis", ["lepto", "weil disease"], ["fever", "jaundice", "aki"]),
  dx("pulmonary tuberculosis", ["pulmonary TB", "sputum positive TB", "koch's", "kochs"], ["cough", "att", "afb"]),
  dx("extrapulmonary tuberculosis", ["EPTB", "abdominal tuberculosis", "tubercular meningitis", "TBM", "pott's spine"], ["att"]),
  dx("community-acquired pneumonia", ["CAP", "lobar pneumonia", "bronchopneumonia"], ["cough", "consolidation", "curb"]),
  dx("urinary tract infection", ["UTI", "pyelonephritis", "acute pyelonephritis", "urosepsis"], ["dysuria", "fever"]),
  dx("cellulitis", ["erysipelas", "skin and soft tissue infection", "SSTI"], ["fever", "erythema"]),
  dx("acute febrile illness", ["AFI", "PUO", "FUO", "pyrexia of unknown origin", "fever of unknown origin", "undifferentiated fever"]),
  dx("sepsis", ["septic shock", "bacteraemia", "severe sepsis"], ["fever", "hypotension", "lactate", "qsofa"]),
  dx("acute meningoencephalitis", ["meningitis", "encephalitis", "AES", "acute encephalitis syndrome"], ["fever", "altered sensorium"]),
  dx("viral hepatitis", ["hepatitis A", "hepatitis E", "acute viral hepatitis", "AVH", "icteric fever"], ["jaundice", "fever"]),
  // "ALA" and "IE" are deliberately absent as bare aliases/triggers: "ala" sits inside
  // "malaria" (a diagnosis in this very list) and "ie" inside ordinary words — same substring
  // risk as "RA"/"MI"/"ACS" above.
  dx("amoebic liver abscess", ["liver abscess", "pyogenic liver abscess"], ["right hypochondrial pain"]),
  dx("infective endocarditis", ["bacterial endocarditis", "vegetations on echo"], ["murmur", "blood culture"]),
  dx("chikungunya", ["chikungunya fever", "chik fever"], ["fever", "joint pain", "arthralgia"]),
  dx("infective osteomyelitis / septic arthritis", ["osteomyelitis", "septic arthritis", "pyogenic arthritis"], ["fever", "joint swelling"]),

  // --- Blood and immunity ---------------------------------------------------------------
  dx("anaemia for evaluation", ["anemia for evaluation", "severe anaemia", "nutritional anaemia", "megaloblastic anaemia", "iron deficiency anaemia"]),
  dx("thrombocytopenia", ["low platelets", "ITP", "immune thrombocytopenia", "immune thrombocytopenic purpura"], ["platelets", "bleeding"]),
  dx("pancytopenia", ["bicytopenia", "aplastic anaemia", "bone marrow failure"], ["marrow", "transfusion"]),
  dx("haemolytic anaemia", ["hemolytic anaemia", "AIHA", "autoimmune haemolytic anaemia", "G6PD deficiency"], ["reticulocyte", "coombs"]),
  dx("acute leukaemia", ["acute leukemia", "AML", "ALL", "blast crisis", "leukaemia for workup"], ["blasts", "marrow"]),
  dx("lymphoma", ["Hodgkin lymphoma", "non-Hodgkin lymphoma", "NHL", "lymphadenopathy for evaluation"]),
  dx("systemic lupus erythematosus", ["SLE", "lupus", "lupus flare", "lupus nephritis"], ["ana", "dsdna"]),
  dx("HIV disease", ["retroviral disease", "RVD", "AIDS", "HIV with opportunistic infection"], ["cd4", "art"]),
  // "RA" and "RF" are deliberately absent as bare aliases/triggers — two letters is a common
  // substring of ordinary ward words ("drain", "abdominal"…) and pulls this in on anything.
  // See the "RT" precedent above. "RA flare" is long enough to be safe.
  dx("rheumatoid arthritis", ["RA flare", "seropositive arthritis"], ["anti-ccp"]),
  dx("ANCA-associated vasculitis", ["vasculitis", "granulomatosis with polyangiitis", "GPA", "microscopic polyangiitis", "MPA"], ["anca", "renal"]),
  dx("multiple myeloma", ["myeloma", "plasma cell dyscrasia", "MM for workup"], ["m band", "spep"]),
  dx("disseminated intravascular coagulation", ["DIC", "consumptive coagulopathy"], ["pt", "fibrinogen", "d dimer"]),
  dx("antiphospholipid syndrome", ["APLA syndrome", "APS"], ["lupus anticoagulant", "anticardiolipin"]),

  // --- Uncontrolled hypertension and diabetes ------------------------------------------
  dx("hypertensive emergency", ["hypertensive crisis", "accelerated hypertension", "malignant hypertension", "hypertensive encephalopathy"], ["target organ damage"]),
  dx("hypertensive urgency", ["uncontrolled hypertension", "severe hypertension"]),
  dx("diabetic ketoacidosis", ["DKA", "ketoacidosis"], ["ketones", "anion gap", "insulin infusion"]),
  dx("hyperosmolar hyperglycaemic state", ["HHS", "HONK", "hyperosmolar non-ketotic"], ["hyperglycaemia", "osmolality"]),
  dx("uncontrolled type 2 diabetes", ["uncontrolled diabetes", "poorly controlled diabetes", "new onset diabetes"], ["hba1c", "grbs"]),
  dx("diabetic foot", ["diabetic foot infection", "diabetic foot ulcer", "wet gangrene"], ["diabetes", "cellulitis"]),
  dx("hypoglycaemia", ["hypoglycemia", "low sugar", "sulfonylurea-induced hypoglycaemia"], ["grbs"]),
  dx("diabetic ketoacidosis resolving", ["DKA resolving", "gap closed", "anion gap closed"]),
  dx("hypothyroidism", ["myxedema coma", "myxoedema coma", "severe hypothyroidism"], ["tsh", "t4"]),
  dx("thyrotoxicosis", ["thyroid storm", "hyperthyroidism", "graves disease flare"], ["tsh", "t3", "t4"]),
  dx("adrenal insufficiency", ["addisonian crisis", "adrenal crisis"], ["cortisol", "acth"]),

  // --- Cardiac, renal, neurological and hepatic admissions ----------------------------
  // "MI" and "ACS" are deliberately absent as bare aliases/triggers — same substring risk as
  // "RA" above ("ACS" sits inside plenty of ordinary text at 3 letters via partial matches on
  // shorter fragments, and "MI" is two). NSTEMI/STEMI are long enough to be safe.
  dx("acute coronary syndrome", ["NSTEMI", "STEMI", "unstable angina"], ["troponin", "ecg"]),
  dx("decompensated heart failure", ["acute heart failure", "CHF exacerbation", "acute pulmonary oedema", "acute decompensated heart failure", "ADHF"], ["bnp", "orthopnoea"]),
  dx("atrial fibrillation", ["AF", "AFib", "atrial flutter", "AF with RVR", "rapid ventricular rate"], ["cha2ds2", "has-bled"]),
  dx("acute kidney injury", ["AKI", "acute renal failure", "ARF"], ["creatinine", "urine output"]),
  dx("chronic kidney disease", ["CKD", "end stage renal disease", "ESRD", "CKD on dialysis"], ["egfr", "creatinine"]),
  dx("cerebrovascular accident", ["CVA", "stroke", "ischaemic stroke", "haemorrhagic stroke", "TIA", "transient ischaemic attack"], ["nihss", "ct brain"]),
  dx("seizure disorder", ["status epilepticus", "new onset seizures", "epilepsy", "GTCS"], ["eeg"]),
  dx("decompensated chronic liver disease", ["cirrhosis with decompensation", "CLD decompensated", "hepatic encephalopathy", "ascites with SBP"], ["child pugh", "meld"]),
  dx("alcohol withdrawal", ["delirium tremens", "DT", "alcohol withdrawal seizures"], ["ciwa"]),
  dx("COPD exacerbation", ["acute exacerbation of COPD", "AECOPD", "chronic bronchitis exacerbation"], ["spo2", "abg"]),
  dx("acute severe asthma", ["status asthmaticus", "asthma exacerbation", "bronchial asthma acute attack"], ["peak flow", "spo2"]),

  // --- Serology / microbiology / fever workup -----------------------------------------
  test("NS1 antigen", ["NS1", "dengue NS1", "dengue antigen"], ["dengue"]),
  test("dengue serology", ["dengue IgM", "dengue IgG", "dengue ELISA", "MAC ELISA"], ["dengue"]),
  test("Widal test", ["widal", "typhi dot", "typhidot", "salmonella serology"], ["enteric fever", "typhoid"]),
  test("Weil-Felix test", ["weil felix", "OXK", "scrub typhus IgM"], ["scrub typhus", "rickettsia"]),
  test("peripheral smear for malarial parasite", ["MP smear", "MP", "malaria parasite", "QBC", "malaria antigen", "OptiMAL"], ["malaria"]),
  test("blood culture", ["blood culture and sensitivity", "BACTEC", "peripheral culture", "central line culture"], ["sepsis", "fever"]),
  test("sputum for AFB", ["AFB", "acid-fast bacilli", "Ziehl-Neelsen", "ZN stain", "sputum microscopy"], ["tuberculosis"]),
  test("GeneXpert", ["CBNAAT", "cartridge based NAAT", "Xpert MTB/RIF", "rifampicin resistance"], ["tuberculosis"]),
  test("Mantoux test", ["tuberculin skin test", "TST", "PPD"], ["tuberculosis"]),
  test("leptospira serology", ["lepto IgM", "leptospira MAT", "microscopic agglutination test"], ["leptospirosis"]),
  test("procalcitonin", ["PCT"], ["sepsis"]),
  test("peripheral smear", ["PBS", "peripheral blood film", "PBF", "smear for blasts", "schistocytes"], ["anaemia", "pancytopenia", "leukaemia"]),
  test("reticulocyte count", ["retic count", "corrected reticulocyte"], ["haemolytic anaemia", "anaemia"]),
  test("direct Coombs test", ["DCT", "direct antiglobulin test", "DAT"], ["haemolytic anaemia"]),
  test("bone marrow aspiration", ["BMA", "marrow aspirate", "trephine biopsy"], ["pancytopenia", "leukaemia"]),
  test("ANA by immunofluorescence", ["ANA", "antinuclear antibody", "anti-dsDNA", "anti-ds-DNA", "ENA profile", "complement C3 C4"], ["SLE", "lupus"]),
  test("HbA1c", ["glycated haemoglobin", "glycosylated haemoglobin"], ["diabetes"]),
  test("capillary blood glucose", ["GRBS", "RBS", "CBG", "grid", "sugar chart", "hourly GRBS"], ["diabetes", "dka"]),
  test("venous blood gas", ["VBG", "ABG", "arterial blood gas", "anion gap", "bicarbonate"], ["dka", "sepsis"]),
  test("urine ketones", ["serum ketones", "beta-hydroxybutyrate", "blood ketones"], ["dka"]),

  // --- Antimicrobials: generic + Indian brands ----------------------------------------
  drug("ceftriaxone", ["cef triaxone"]),
  brand("Monocef", ["monocef", "ceftriaxone monocef"], ["ceftriaxone"]),
  drug("piperacillin-tazobactam", ["pip-tazo", "pip taz", "tazobactam"]),
  brand("Piptaz", ["piptaz", "zosyn", "tazact"], ["piperacillin"]),
  brand("Magnex", ["magnex", "cefoperazone sulbactam", "sulbactomax"], ["cefoperazone"]),
  drug("meropenem", ["mero"]),
  brand("Meronem", ["meronem", "meromac"], ["meropenem"]),
  drug("doxycycline", ["doxy"], ["scrub typhus", "rickettsia", "leptospirosis"]),
  drug("azithromycin", ["azithro"], ["scrub typhus", "enteric fever"]),
  drug("artesunate", ["IV artesunate", "artemisinin"], ["malaria"]),
  drug("artemether-lumefantrine", ["ACT", "coartem", "AL"], ["malaria"]),
  drug("vancomycin", ["vanco"]),
  drug("anti-tubercular therapy", ["ATT", "AKT", "AKT-4", "AKT-3", "HRZE", "HRE", "isoniazid rifampicin pyrazinamide ethambutol", "4-FDC"], ["tuberculosis"]),
  drug("insulin infusion", ["insulin drip", "regular insulin infusion", "actrapid infusion"], ["dka", "hhs"]),
  drug("basal bolus insulin", ["basal-bolus", "subcutaneous insulin", "sliding scale insulin", "correctional insulin", "premixed insulin"], ["diabetes"]),
  drug("labetalol", ["labetalol infusion"], ["hypertensive emergency"]),
  drug("nitroglycerin infusion", ["GTN drip", "NTG infusion", "nitroglycerine"], ["hypertensive emergency"]),
  drug("telmisartan", ["telma", "telmisartan amlodipine", "telma-am"], ["hypertension"]),
  drug("amlodipine", ["amlong", "amlodipine"], ["hypertension"]),
  drug("hydrocortisone", ["IV hydrocortisone", "efcorlin"], ["sepsis", "adrenal"]),

  // --- Haematology / ward vocabulary -------------------------------------------------
  entry("packed red blood cell transfusion", ["medication"], ["PRBC", "packed cells", "blood transfusion", "SDP", "single donor platelets", "random donor platelets", "RDP", "FFP", "fresh frozen plasma", "cryoprecipitate"], [], PRIORITY.RELATED),
  entry("absolute neutrophil count", ["investigation"], ["ANC", "TLC with differential", "neutropenia", "total leucocyte count"], [], PRIORITY.SPECIALTY),
  entry("anion gap", ["investigation"], ["high anion gap metabolic acidosis", "HAGMA", "gap closing"], ["dka"], PRIORITY.SPECIALTY),
  entry("target organ damage", ["diagnosis"], ["end organ damage", "TOD", "hypertensive retinopathy", "grade 4 retinopathy", "papilloedema"], ["hypertensive emergency"], PRIORITY.SPECIALTY),
  entry("altered sensorium", ["diagnosis"], ["altered mental status", "AMS", "GCS", "drowsy", "disoriented"], [], PRIORITY.SPECIALTY),
];
