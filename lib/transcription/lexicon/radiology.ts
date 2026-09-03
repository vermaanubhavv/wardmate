import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Imaging studies.
 *
 * The abbreviations here (CECT, NCCT, MRCP, HIDA, eFAST) are the ones Nova-3 spaces out or
 * mangles, and the modality+region phrases ("CECT abdomen and pelvis") are how a surgical unit
 * actually orders them. Broad `diagnoses` tokens because a CT abdomen is relevant to most acute
 * surgical presentations — but not to, say, a clean hernia list, so it still is not universal.
 */
const ABDO_DIAGNOSES = [
  "pancreatitis",
  "cholecystitis",
  "cholangitis",
  "choledocholithiasis",
  "cbd stone",
  "appendicitis",
  "appendicular",
  "obstruction",
  "perforation",
  "peritonitis",
  "abscess",
  "collection",
  "trauma",
  "carcinoma",
  "growth",
  "mass",
  "ischemia",
  "ischaemia",
  "diverticulitis",
  "fistula",
  "pseudocyst",
  "necrosis",
];

export const RADIOLOGY: MedicalLexiconEntry[] = [
  img("CECT abdomen", ["contrast enhanced CT abdomen", "CECT abdomen and pelvis", "CECT abdomen pelvis", "CT abdomen with contrast"], ABDO_DIAGNOSES),
  img("CECT chest abdomen pelvis", ["CECT chest abdomen and pelvis", "CT chest abdomen pelvis", "staging CT"], ["carcinoma", "growth", "malignancy", "metastasis", "staging"]),
  img("NCCT abdomen", ["non contrast CT abdomen", "plain CT abdomen", "NCCT KUB"], ["renal colic", "ureteric calculus", "obstruction", "trauma"]),
  img("NCCT head", ["non contrast CT head", "plain CT brain", "CT brain"], ["trauma", "head injury", "altered sensorium", "fall"]),
  img("CT angiography", ["CT angiogram", "CTA", "CT mesenteric angiography"], ["ischemia", "ischaemia", "gi bleed", "acute limb ischemia", "mesenteric"]),
  img("USG abdomen", ["ultrasound abdomen", "USG whole abdomen", "USG abdomen and pelvis", "USG abdomen pelvis", "ultrasonography abdomen"], ABDO_DIAGNOSES),
  img("USG KUB", ["ultrasound KUB", "USG kidney ureter bladder"], ["renal colic", "hydronephrosis", "ureteric calculus", "obstruction"]),
  img("focused assessment with sonography in trauma", ["FAST scan", "eFAST", "extended FAST", "FAST positive", "FAST negative", "POCUS"], ["trauma", "blunt trauma abdomen", "rta", "polytrauma", "hemoperitoneum"]),
  img("erect abdominal X-ray", ["X-ray abdomen erect", "erect X-ray abdomen", "X-ray abdomen standing"], ["obstruction", "perforation", "pneumoperitoneum", "ileus"]),
  img("chest X-ray", ["X-ray chest PA view", "CXR", "X-ray chest"], ["perforation", "pneumoperitoneum", "aspiration", "pre-op", "pleural effusion", "chest tube"]),
  img("MRCP", ["magnetic resonance cholangiopancreatography", "MR cholangiopancreatography"], ["choledocholithiasis", "cbd stone", "obstructive jaundice", "cholangitis", "biliary stricture", "periampullary", "pancreatitis", "cholangiocarcinoma"]),
  img("ERCP", ["endoscopic retrograde cholangiopancreatography"], ["choledocholithiasis", "cbd stone", "obstructive jaundice", "cholangitis", "biliary stricture", "periampullary", "bile leak"]),
  img("HIDA scan", ["hepatobiliary iminodiacetic acid scan", "cholescintigraphy"], ["acute cholecystitis", "biliary dyskinesia", "bile leak"]),
  img("MRI pelvis", ["MRI pelvis for fistula", "MR fistulogram"], ["fistula in ano", "perianal fistula", "recurrent fistula", "carcinoma rectum"]),
  img("venous Doppler", ["lower limb venous Doppler", "Doppler for DVT", "compression ultrasound"], ["dvt", "deep vein thrombosis", "swollen limb", "varicose veins"]),
  img("arterial Doppler", ["lower limb arterial Doppler", "peripheral arterial Doppler"], ["peripheral arterial disease", "acute limb ischemia", "critical limb ischemia", "gangrene", "claudication"]),
];

function img(term: string, aliases: string[], diagnoses: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["radiology"],
    diagnoses,
    priority: PRIORITY.SCORING_OR_INVESTIGATION,
  };
}
