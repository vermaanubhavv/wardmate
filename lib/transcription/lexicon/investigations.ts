import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Blood tests, panels, markers — plus microbiology.
 *
 * Nova-3 Medical already spells "haemoglobin", "creatinine" and "bilirubin" correctly, so the
 * plain analyte names are deliberately NOT here. What is here: the Indian-chart abbreviations a
 * general model spaces out or hears an English word for (KFT, GRBS, PPBS, SGOT), and the
 * diagnosis-linked investigations worth boosting for the right patient (lipase/amylase for
 * pancreatitis, procalcitonin/lactate for sepsis).
 */
export const INVESTIGATIONS: MedicalLexiconEntry[] = [
  // --- Indian-chart abbreviations, boosted for the whole surgical unit -----------------
  abbr("CBC", ["complete blood count", "CBC with differential"]),
  abbr("TLC", ["total leukocyte count", "total leucocyte count"]),
  abbr("DLC", ["differential leukocyte count", "differential leucocyte count"]),
  abbr("KFT", ["kidney function test", "renal function test", "RFT"]),
  abbr("LFT", ["liver function test"]),
  abbr("PT INR", ["PT/INR", "prothrombin time INR", "coagulation profile", "PT APTT INR"]),
  abbr("GRBS", ["general random blood sugar", "capillary blood glucose", "RBS", "random blood sugar"]),
  abbr("FBS", ["fasting blood sugar"]),
  abbr("PPBS", ["post prandial blood sugar", "postprandial blood sugar"]),
  abbr("HbA1c", ["glycated hemoglobin", "glycosylated haemoglobin"]),
  abbr("SGOT", ["AST", "aspartate transaminase"]),
  abbr("SGPT", ["ALT", "alanine transaminase"]),
  abbr("ALP", ["alkaline phosphatase", "serum alkaline phosphatase"]),
  abbr("GGT", ["gamma GT", "gamma glutamyl transferase"]),
  abbr("PCV", ["packed cell volume", "hematocrit", "haematocrit"]),
  abbr("ABG", ["arterial blood gas"]),
  abbr("VBG", ["venous blood gas"]),

  // --- Diagnosis-linked markers -----------------------------------------------------
  marker("serum lipase", ["lipase"], ["pancreatitis"]),
  marker("serum amylase", ["amylase"], ["pancreatitis"]),
  marker("CRP", ["C-reactive protein", "c reactive protein"], ["pancreatitis", "sepsis", "abscess", "cholangitis", "appendicitis", "collection", "cellulitis", "necrotizing"]),
  marker("procalcitonin", ["PCT"], ["sepsis", "septic shock", "cholangitis", "peritonitis", "necrotizing"]),
  marker("serum lactate", ["lactate", "blood lactate", "lactate clearance"], ["sepsis", "septic shock", "ischemia", "ischaemia", "peritonitis", "obstruction", "shock"]),
  marker("total bilirubin", ["direct bilirubin", "indirect bilirubin", "serum bilirubin", "conjugated bilirubin"], ["obstructive jaundice", "cholangitis", "choledocholithiasis", "cbd stone", "periampullary", "cholangiocarcinoma"]),
  marker("serum albumin", ["albumin", "hypoalbuminemia", "hypoalbuminaemia"], ["pancreatitis", "peritonitis", "malnutrition", "carcinoma", "high output stoma", "enterocutaneous fistula"]),
  marker("viral markers", ["HIV", "HBsAg", "hepatitis B surface antigen", "anti-HCV", "HCV", "retroviral status"], ["pre-op"]),

  // --- Microbiology ----------------------------------------------------------------
  micro("blood culture", ["blood culture sensitivity", "blood C/S"], ["sepsis", "septic shock", "cholangitis", "fever", "line sepsis"]),
  micro("pus culture", ["pus for culture sensitivity", "pus C/S", "wound culture", "wound swab"], ["abscess", "wound", "cellulitis", "diabetic foot", "necrotizing", "collection", "surgical site infection"]),
  micro("urine culture", ["urine culture sensitivity", "urine C/S", "urine routine microscopy"], ["urinary tract infection", "catheter", "fever"]),
  micro("drain fluid culture", ["drain fluid analysis", "drain fluid amylase", "peritoneal fluid culture"], ["anastomotic leak", "collection", "bile leak", "peritonitis"]),
  micro("culture and sensitivity", ["culture sensitivity", "C and S", "C/S"], []),
  micro("Gram stain", ["gram staining", "gram positive cocci", "gram negative bacilli"], []),
  micro("GeneXpert", ["CBNAAT", "cartridge based nucleic acid amplification test", "Xpert MTB RIF"], ["koch's", "tuberculosis", "abdominal tb", "tubercular"]),
  micro("AFB", ["acid fast bacilli", "ZN stain", "Ziehl Neelsen stain"], ["koch's", "tuberculosis", "tubercular"]),
];

/** An abbreviation worth boosting across the surgical unit — it is charted on nearly every
 *  patient and the model spells it out letter by letter. */
function abbr(term: string, aliases: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["investigation"],
    specialties: ["general-surgery"],
    priority: PRIORITY.SPECIALTY,
  };
}

/** A marker boosted only for the diagnoses it actually informs. */
function marker(term: string, aliases: string[], diagnoses: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["investigation"],
    diagnoses,
    priority: PRIORITY.SCORING_OR_INVESTIGATION,
  };
}

function micro(term: string, aliases: string[], diagnoses: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["microbiology"],
    diagnoses: diagnoses.length ? diagnoses : undefined,
    priority: PRIORITY.SCORING_OR_INVESTIGATION,
  };
}
