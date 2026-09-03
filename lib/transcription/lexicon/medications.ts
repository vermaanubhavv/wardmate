import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Drugs, brand names, IV fluids and critical-care vocabulary.
 *
 * Generic names (ceftriaxone, meropenem) are here only so a charted drug is boosted — Nova-3
 * Medical spells them fine unprompted, so they carry generic priority and no family boost.
 * The Indian BRAND names are the real payload: they are what a resident actually says on the
 * round, and a general model writes an ordinary English word for "Monocef" or "Emeset". A
 * brand shares a `dedupeGroup` with its generic so only one of the pair is ever sent, and it
 * outranks the generic so the spoken form wins when the drug is on the chart.
 */
export const MEDICATIONS: MedicalLexiconEntry[] = [
  // --- Antibiotics: generic + Indian brand -----------------------------------------
  drug("ceftriaxone", ["ceftriaxone sulbactam"], "ceftriaxone"),
  brand("Monocef", ["ceftriaxone", "Oframax", "Monotax"], "ceftriaxone"),
  drug("cefoperazone sulbactam", ["cefoperazone-sulbactam", "cefoperazone with sulbactam"], "cefoperazone-sulbactam"),
  brand("Magnex", ["cefoperazone sulbactam", "Magnamycin", "Sulbacef"], "cefoperazone-sulbactam"),
  drug("piperacillin tazobactam", ["piperacillin-tazobactam", "pip tazo"], "pip-taz"),
  brand("Piptaz", ["piperacillin tazobactam", "Zosyn", "Tazact", "Pipzo"], "pip-taz"),
  drug("amoxicillin clavulanate", ["amoxicillin-clavulanate", "co-amoxiclav", "amox clav"], "amox-clav"),
  brand("Augmentin", ["amoxicillin clavulanate", "Clavam", "Moxikind CV"], "amox-clav"),
  drug("cefuroxime", ["cefuroxime axetil"], "cefuroxime"),
  brand("Ceftum", ["cefuroxime", "Zocef", "Supacef"], "cefuroxime"),
  drug("meropenem", [], "meropenem"),
  brand("Meronem", ["meropenem", "Me ropenem", "Merocrit", "Meronim"], "meropenem"),
  drug("imipenem cilastatin", ["imipenem-cilastatin"], "imipenem"),
  drug("metronidazole", [], "metronidazole"),
  brand("Metrogyl", ["metronidazole", "Metron", "Aristogyl"], "metronidazole"),
  drug("clindamycin", [], "clindamycin"),
  drug("amikacin", [], "amikacin"),
  brand("Mikacin", ["amikacin", "Amiktar", "Amicin"], "amikacin"),
  drug("gentamicin", [], "gentamicin"),
  drug("vancomycin", [], "vancomycin"),
  drug("teicoplanin", [], "teicoplanin"),
  brand("Targocid", ["teicoplanin"], "teicoplanin"),
  drug("colistin", ["colistimethate", "polymyxin E"], "colistin"),
  drug("linezolid", [], "linezolid"),
  brand("Linospan", ["linezolid", "Lizolid"], "linezolid"),
  drug("doxycycline", [], "doxycycline"),
  drug("fluconazole", [], "fluconazole"),

  // --- Analgesia, antiemetics, PPI, anticoagulation --------------------------------
  drug("paracetamol", ["acetaminophen", "PCM", "IV paracetamol"], "paracetamol"),
  brand("Neomol", ["paracetamol", "Perfalgan", "PCM infusion"], "paracetamol"),
  drug("diclofenac", ["diclofenac sodium"], "diclofenac"),
  brand("Voveran", ["diclofenac", "Dynapar", "Diclomol"], "diclofenac"),
  drug("ketorolac", ["ketorolac tromethamine"], "ketorolac"),
  brand("Ketanov", ["ketorolac", "Toradol"], "ketorolac"),
  drug("tramadol", [], "tramadol"),
  brand("Tramazac", ["tramadol", "Contramal", "Ultradol"], "tramadol"),
  drug("fentanyl", ["fentanyl infusion"], "fentanyl"),
  drug("buprenorphine", ["transdermal buprenorphine"], "buprenorphine"),
  drug("pantoprazole", ["IV pantoprazole"], "pantoprazole"),
  brand("Pan 40", ["pantoprazole", "Pantocid", "Pantop", "Pan-D"], "pantoprazole"),
  drug("ondansetron", [], "ondansetron"),
  brand("Emeset", ["ondansetron", "Zofer", "Vomikind", "Ondem"], "ondansetron"),
  drug("metoclopramide", [], "metoclopramide"),
  brand("Perinorm", ["metoclopramide", "Reglan"], "metoclopramide"),
  drug("enoxaparin", ["low molecular weight heparin", "LMWH"], "enoxaparin"),
  brand("Clexane", ["enoxaparin", "Cutenox", "Lupenox"], "enoxaparin"),
  drug("unfractionated heparin", ["UFH", "heparin infusion"], "heparin"),
  drug("serratiopeptidase", ["trypsin chymotrypsin", "trypsin-chymotrypsin"], "proteolytic-enzyme"),
  brand("Chymoral Forte", ["trypsin chymotrypsin", "Chymoral", "Enzomac"], "proteolytic-enzyme"),
  drug("furosemide", ["frusemide"], "furosemide"),
  brand("Lasix", ["furosemide", "frusemide"], "furosemide"),
  drug("human albumin", ["20% albumin", "albumin infusion", "salt poor albumin"], "albumin-infusion"),

  // --- Diabetes / endocrine on a surgical chart ----------------------------------
  drug("regular insulin", ["human actrapid insulin", "plain insulin", "insulin sliding scale", "GRBS based insulin"], "regular-insulin"),
  brand("Actrapid", ["regular insulin", "Huminsulin R"], "regular-insulin"),
  drug("insulin glargine", ["basal insulin"], "glargine"),
  brand("Lantus", ["insulin glargine", "Basalog", "Glaritus"], "glargine"),
  drug("hydrocortisone", ["stress dose steroid", "IV hydrocortisone"], "hydrocortisone"),

  // --- S. IV fluids -------------------------------------------------------------
  fluid("normal saline", ["NS", "0.9% saline", "0.9 percent saline", "isotonic saline"]),
  fluid("Ringer lactate", ["Ringer's lactate", "RL", "lactated Ringer's", "compound sodium lactate"]),
  fluid("DNS", ["dextrose normal saline", "dextrose with normal saline", "5% DNS"]),
  fluid("5% dextrose", ["D5", "five percent dextrose", "dextrose 5 percent", "10% dextrose", "25% dextrose"]),
  fluid("Plasma-Lyte", ["Plasmalyte", "Plasma-Lyte A", "balanced crystalloid", "Isolyte", "Isolyte M", "Isolyte P"]),

  // --- Critical care -----------------------------------------------------------
  crit("SIRS", ["systemic inflammatory response syndrome"], ["sepsis", "pancreatitis", "peritonitis", "cholangitis", "necrotizing"]),
  crit("sepsis", ["severe sepsis", "sepsis with organ dysfunction", "urosepsis"], ["sepsis", "septic", "peritonitis", "cholangitis", "necrotizing", "abscess"]),
  crit("septic shock", ["refractory septic shock", "distributive shock"], ["septic shock", "sepsis", "shock", "hypotension"]),
  crit("qSOFA", ["quick SOFA", "q SOFA score"], ["sepsis", "septic shock", "peritonitis", "cholangitis"]),
  crit("SOFA score", ["sequential organ failure assessment"], ["sepsis", "septic shock", "multi organ dysfunction"]),
  crit("noradrenaline", ["norepinephrine", "noradrenaline infusion", "on noradrenaline", "vasopressor support", "ionotropic support", "inotropic support"], ["septic shock", "shock", "sepsis", "hypotension"]),
  crit("vasopressin", ["vasopressin infusion", "second vasopressor"], ["septic shock", "refractory shock"]),
  crit("fluid resuscitation", ["fluid bolus", "crystalloid bolus", "aggressive fluid resuscitation", "goal directed resuscitation"], ["sepsis", "septic shock", "pancreatitis", "shock", "hypovolemia", "dehydration"]),
  crit("mean arterial pressure", ["MAP", "MAP target", "target MAP 65"], ["septic shock", "shock", "sepsis"]),
  crit("Glasgow Coma Scale", ["GCS", "GCS E4V5M6", "GCS drop"], ["trauma", "head injury", "altered sensorium", "encephalopathy"]),
  crit("enteral nutrition", ["enteral feeds", "NG feeds", "Ryle's tube feeds", "nasojejunal feeds", "early enteral feeding"], ["pancreatitis", "sepsis", "high output stoma", "prolonged ileus", "critical illness"]),
  crit("total parenteral nutrition", ["TPN", "parenteral nutrition", "central TPN"], ["enterocutaneous fistula", "short bowel", "prolonged ileus", "high output stoma", "intestinal failure"]),
  crit("high protein diet", ["protein supplementation", "high protein high calorie diet", "nutritional optimisation"], ["malnutrition", "hypoalbuminemia", "wound", "pressure ulcer", "enterocutaneous fistula"]),
];

function drug(term: string, aliases: string[], dedupeGroup: string): MedicalLexiconEntry {
  return { term, aliases, categories: ["medication"], priority: PRIORITY.GENERIC, dedupeGroup };
}

function brand(term: string, aliases: string[], dedupeGroup: string): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["medication-brand"],
    // Below an exact charted match, but above the bare generic so the spoken brand wins the
    // de-dupe when the drug is actually on the chart.
    priority: PRIORITY.RELATED,
    dedupeGroup,
  };
}

function fluid(term: string, aliases: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["fluid"],
    specialties: ["general-surgery"],
    priority: PRIORITY.SPECIALTY,
  };
}

function crit(term: string, aliases: string[], diagnoses: string[]): MedicalLexiconEntry {
  return { term, aliases, categories: ["critical-care"], diagnoses, priority: PRIORITY.SCORING_OR_INVESTIGATION };
}
