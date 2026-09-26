import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The paediatrics keyterm core.
 *
 * WHY THESE WORDS. A children's ward is dictated in weights, per-kilogram orders and danger signs:
 * "ceftriaxone 100 per kg per day", "chest indrawing", "skin pinch goes back slowly", "MUAC 11.5",
 * "immunised for age", "TSB 14 on day four". The programme vocabulary (ORS, SAM, pentavalent,
 * FBNC) is Indian and Nova-3 Medical does not hold it.
 *
 * Everything here is tagged `paediatrics`. The shared categories reach the drugs and the general
 * investigations; what is here is what changes meaning in a child.
 *
 * NOTE ON DOSES. These terms exist so the DICTATION is transcribed correctly. Nothing in this file
 * or anywhere else lets the app compute a dose from a weight — see the extraction guidance in
 * lib/specialty/paediatrics.ts, which forbids it explicitly.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`, so "ORS", "SAM", "MUAC",
 * "BCG", "TSB" and "AGE" are never triggers — only spoken content stored verbatim.
 */

const PAED = "paediatrics" as const;

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
    specialties: [PAED],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const ward = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["india-ward"], a, tr, PRIORITY.INDIA_WARD);
// NOT "core": that category is sent on nearly every dictation, and a child's danger signs have
// no business in an adult surgical round. These are presentations, scoped to this pack.
const obs = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.SPECIALTY);

export const PAEDIATRICS: MedicalLexiconEntry[] = [
  // --- The common admissions --------------------------------------------------------------
  dx("acute gastroenteritis", ["acute watery diarrhoea", "dysentery", "some dehydration", "severe dehydration", "no dehydration", "rotaviral diarrhoea", "persistent diarrhoea"], ["loose stools", "vomiting in a child"]),
  dx("bronchiolitis", ["acute bronchiolitis", "wheeze associated lower respiratory infection", "viral pneumonia", "bronchopneumonia", "severe pneumonia with indrawing", "empyema in a child", "croup", "acute laryngotracheobronchitis"], ["cough and fast breathing"]),
  dx("febrile seizure", ["simple febrile seizure", "complex febrile seizure", "status epilepticus in a child", "afebrile seizure", "generalised tonic clonic seizure", "infantile spasms", "epilepsy on treatment"], ["fits", "convulsion"]),
  dx("severe acute malnutrition", ["moderate acute malnutrition", "marasmus", "kwashiorkor", "nutritional oedema", "failure to thrive", "stunting", "wasting", "growth faltering"], ["not gaining weight"]),
  dx("nutritional anaemia", ["iron deficiency anaemia in a child", "megaloblastic anaemia", "sickle cell disease", "thalassaemia major on transfusion", "haemolytic anaemia", "immune thrombocytopenia in a child"], ["pallor"]),
  dx("enteric fever in a child", ["dengue with warning signs", "malaria in a child", "scrub typhus in a child", "measles", "chickenpox", "mumps", "pertussis", "diphtheria", "tetanus", "tuberculosis in a child", "primary complex"], ["fever in a child"]),
  dx("nephrotic syndrome", ["acute post-streptococcal glomerulonephritis", "urinary tract infection in a child", "vesicoureteric reflux", "acute kidney injury in a child", "posterior urethral valve"], ["swelling of face", "puffiness"]),
  dx("congenital heart disease", ["ventricular septal defect", "atrial septal defect", "patent ductus arteriosus", "tetralogy of Fallot", "acyanotic heart disease", "cyanotic spell", "congestive cardiac failure in a child", "acute rheumatic fever", "rheumatic heart disease"], ["murmur", "bluish spells"]),
  dx("neonatal jaundice", ["physiological jaundice", "pathological jaundice", "ABO incompatibility", "Rh incompatibility", "neonatal sepsis", "birth asphyxia", "hypoxic ischaemic encephalopathy", "respiratory distress syndrome", "meconium aspiration", "transient tachypnoea of the newborn", "neonatal hypoglycaemia", "low birth weight", "preterm baby"], ["newborn", "day of life"]),
  dx("developmental and genetic conditions", ["global developmental delay", "cerebral palsy", "Down syndrome", "autism spectrum disorder", "hypothyroidism congenital", "seizure disorder with delay"], ["not achieving milestones"]),

  // --- The findings a child is judged by --------------------------------------------------
  obs("danger signs in a child", ["unable to feed", "lethargic or unconscious", "convulsions", "persistent vomiting", "chest indrawing", "subcostal retractions", "intercostal retractions", "grunting", "nasal flaring", "head nodding", "stridor at rest", "central cyanosis", "cold peripheries", "capillary refill prolonged"], ["danger signs", "respiratory distress"]),
  obs("dehydration assessment findings", ["sunken eyes", "dry tongue", "skin pinch goes back slowly", "skin pinch goes back very slowly", "drinking eagerly", "not able to drink", "irritable and restless", "sunken fontanelle", "decreased urine output in a child", "tears absent"], ["dehydration"]),
  obs("feeding and intake", ["accepting feeds well", "refusing feeds", "exclusively breastfed", "breastfed on demand", "top feeds given", "expressed breast milk", "spoon feeding", "nasogastric feeds started", "feeds withheld", "ORS after each stool", "zinc started"], ["feeding"]),
  obs("growth measurements", ["weight for age", "weight for height", "height for age", "mid-upper arm circumference", "head circumference", "length measured", "weight gain per day", "plotted on growth chart", "weight same as admission"], ["weight for age", "growth faltering"]),

  // --- The background every paediatric history asks for -----------------------------------
  ward("birth history", ["term normal delivery", "caesarean delivery", "birth weight recorded", "cried immediately after birth", "did not cry immediately", "NICU stay after birth", "home delivery", "institutional delivery", "weeks at delivery"], ["birth history"]),
  ward("immunisation history", ["immunised for age", "partially immunised", "not immunised", "BCG scar present", "pentavalent doses given", "oral polio vaccine", "measles rubella vaccine", "as per national immunisation schedule", "catch-up vaccination planned"], ["immunisation"]),
  ward("developmental milestones", ["social smile achieved", "neck holding", "sitting without support", "standing with support", "walking independently", "bisyllables spoken", "pincer grasp", "milestones appropriate for age", "regression of milestones"], ["milestones", "child development"]),

  // --- Drugs and fluids, as ordered and never calculated ----------------------------------
  drug("per kilogram orders", ["per kg per day", "per kg per dose", "in two divided doses", "in three divided doses", "maintenance fluid per kg", "bolus twenty ml per kg", "holliday segar maintenance", "syrup paracetamol", "syrup ibuprofen", "oral amoxicillin", "injection ceftriaxone", "injection ampicillin with gentamicin", "nebulised salbutamol", "nebulised adrenaline", "oral prednisolone", "iron and folic acid syrup", "vitamin D drops", "zinc syrup", "albendazole single dose", "ORS sachet"], ["dose", "per kg"]),

  // --- Investigations that read differently in a child ------------------------------------
  test("paediatric investigations", ["total serum bilirubin", "TSB with age in hours", "sepsis screen", "C reactive protein in a child", "blood culture in a child", "Mantoux test", "gastric aspirate for AFB", "chest radiograph in a child", "stool routine examination", "urine culture by catheter sample", "neurosonogram", "echocardiography report", "thyroid profile newborn screening", "haemoglobin electrophoresis", "peripheral smear for malaria parasite"], ["investigation in a child"]),
  test("phototherapy and newborn care", ["phototherapy started", "double surface phototherapy", "exchange transfusion", "radiant warmer", "kangaroo mother care", "oxygen by hood", "CPAP for the newborn", "surfactant given"], ["newborn care", "jaundice"]),
];
