import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Scoring systems and classifications a surgical unit quotes on the round.
 *
 * Each is boosted only for the diagnoses it belongs to — Ranson and BISAP for a pancreatitis
 * patient, Wagner for a diabetic foot, Tokyo grading for cholecystitis / cholangitis. A general
 * model hears "Ranson" as "ransom" and "Alvarado" as "alverado", so these earn their place in
 * the keyterm budget for the right patient.
 */
export const SCORES: MedicalLexiconEntry[] = [
  score("Ranson's criteria", ["Ranson score", "Ransons criteria", "Ranson's score"], ["pancreatitis", "pancreatic"]),
  score("BISAP score", ["BISAP", "bedside index of severity in acute pancreatitis"], ["pancreatitis", "pancreatic"]),
  score("revised Atlanta classification", ["Atlanta classification", "Atlanta criteria", "revised Atlanta criteria"], ["pancreatitis", "pancreatic", "necrosis", "collection"]),
  score("modified CT severity index", ["MCTSI", "modified CTSI", "CT severity index", "Balthazar score", "Balthazar grading"], ["pancreatitis", "pancreatic", "necrosis"]),
  score("APACHE II score", ["APACHE 2", "APACHE II", "acute physiology and chronic health evaluation"], ["pancreatitis", "sepsis", "septic shock", "necrotizing", "peritonitis"]),
  score("Alvarado score", ["MANTRELS score", "modified Alvarado score", "AIR score", "appendicitis inflammatory response score"], ["appendicitis", "appendicular", "right iliac fossa pain"]),
  score("Tokyo Guidelines grading", ["Tokyo guidelines", "Tokyo grading", "TG18", "Tokyo grade 2", "Tokyo grade 3"], ["cholecystitis", "cholangitis", "biliary"]),
  score("Child-Pugh score", ["Child Pugh class", "Child's classification", "CTP score"], ["cirrhosis", "chronic liver disease", "portal hypertension", "cld"]),
  score("MELD score", ["model for end stage liver disease", "MELD Na"], ["cirrhosis", "chronic liver disease", "cld", "liver failure"]),
  score("Clavien-Dindo classification", ["Clavien Dindo grade", "Clavien-Dindo grade", "CD grade"], ["complication", "post operative complication", "anastomotic leak", "surgical site infection", "collection"]),
  score("ASA physical status", ["ASA grade", "ASA class", "ASA 3", "American Society of Anesthesiologists grade"], ["pre-op", "comorbidity", "high risk"]),
  score("Wagner classification", ["Wagner grade", "Wagner-Meggitt classification", "Meggitt Wagner grade"], ["diabetic foot", "foot ulcer", "dfu", "gangrene"]),
  score("University of Texas classification", ["UT wound classification", "Texas grade"], ["diabetic foot", "foot ulcer", "dfu"]),
  score("Rutherford classification", ["Rutherford category", "Rutherford grade"], ["acute limb ischemia", "critical limb ischemia", "peripheral arterial disease", "ischaemia"]),
  score("WIfI score", ["wound ischemia foot infection score", "WIfI classification"], ["diabetic foot", "critical limb ischemia", "foot ulcer"]),
  score("CEAP classification", ["CEAP grade", "clinical etiological anatomical pathophysiological classification"], ["varicose veins", "venous insufficiency", "venous ulcer"]),
  score("Mannheim Peritonitis Index", ["MPI", "Mannheim peritonitis score"], ["peritonitis", "perforation", "hollow viscus", "faecal peritonitis"]),
  score("WSES classification", ["WSES grading", "World Society of Emergency Surgery classification"], ["appendicitis", "cholecystitis", "peritonitis", "perforation", "diverticulitis"]),
  score("Hinchey classification", ["Hinchey grade", "modified Hinchey classification"], ["diverticulitis", "diverticular", "colonic perforation"]),
  score("AAST organ injury scale", ["AAST grade", "organ injury scaling", "OIS grade"], ["trauma", "splenic injury", "liver injury", "renal injury", "polytrauma"]),
  score("POSSUM score", ["P-POSSUM", "physiological and operative severity score"], ["emergency laparotomy", "high risk", "peritonitis"]),
];

function score(term: string, aliases: string[], diagnoses: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["score"],
    diagnoses,
    priority: PRIORITY.SCORING_OR_INVESTIGATION,
  };
}
