import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The pulmonary medicine keyterm core.
 *
 * WHY THESE WORDS. Nova-3 Medical knows ordinary respiratory English. What it gets wrong on an
 * Indian chest ward is this list: tuberculosis spoken as programme shorthand ("GeneXpert",
 * "CBNAAT", "HRZE", "AKT-4", "MDR-TB", "DOTS", "NTEP"), the oxygen and ventilation vocabulary
 * spoken as initials ("NIV", "BiPAP", "HFNC", "FiO2", "P by F ratio"), the inhaler and
 * nebuliser names off an Indian chart ("Foracort", "Duolin", "Seroflo", "Budecort"), the
 * bedside procedures ("pleural tap", "intercostal drain", "pleurodesis", "bronchoalveolar
 * lavage") and the sleep vocabulary the OPD runs on ("polysomnography", "AHI", "CPAP titration").
 *
 * Where the medicine core is serology- and drug-heavy and the surgical one is anatomy-heavy,
 * this one is AIRWAY-, OXYGEN- and TB-heavy. That difference is the point of a specialty core.
 *
 * Everything here is tagged `pulmonary-medicine`, so a surgical or obstetric unit never spends
 * its keyterm budget on "pleurodesis". Terms this ward shares with general medicine (dengue,
 * sepsis, the antibiotic brands) are NOT repeated here — the selector already reaches them
 * through the shared categories, and a duplicate term would only compete with itself.
 *
 * Auto-derived triggers shorter than five characters are dropped by `entry()` below, the same
 * rule the obstetrics core keeps and for the same reason: the selector matches a trigger as a
 * plain substring, so "ABG" inside "cabg" or "NIV" inside a longer word would silently inflate
 * an unrelated unit's keyterm list. `__tests__/pulmonary-medicine-collisions.test.ts` pins it.
 *
 * "RT" IS DELIBERATELY ABSENT here too — ambiguous between radiotherapy and Ryle's tube, and
 * the app refuses to expand it (CONTEXT.md §2). "ICD" is present only as "intercostal drain":
 * the bare initials also mean a disease classification and a cardiac device.
 */

const PULM = "pulmonary-medicine" as const;

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
    specialties: [PULM],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const brand = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication", "medication-brand"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const micro = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation", "microbiology"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const device = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["device", "critical-care"], a, tr, PRIORITY.RELATED);

export const PULMONARY_MEDICINE: MedicalLexiconEntry[] = [
  // --- Obstructive and airway disease --------------------------------------------------
  dx("chronic obstructive pulmonary disease", ["COPD", "acute exacerbation of COPD", "AECOPD", "chronic bronchitis", "emphysema"], ["breathless", "wheeze"]),
  dx("bronchial asthma", ["acute severe asthma", "status asthmaticus", "asthma exacerbation"], ["wheezing", "inhaler"]),
  dx("bronchiectasis", ["post-tubercular bronchiectasis", "traction bronchiectasis"], ["sputum", "haemoptysis"]),
  dx("obstructive sleep apnoea", ["sleep apnoea", "sleep disordered breathing", "obesity hypoventilation syndrome"], ["snoring", "sleepiness"]),
  dx("allergic bronchopulmonary aspergillosis", ["ABPA", "aspergilloma", "fungal ball", "chronic pulmonary aspergillosis"], ["wheezing", "haemoptysis"]),

  // --- Tuberculosis, the casemix this ward is built around ------------------------------
  // "pulmonary tuberculosis" itself is already in the internal-medicine core; what a chest
  // ward adds is what happens after it — the lung left behind once the drugs are finished.
  dx("post-tubercular sequelae", ["post-tubercular lung disease", "old Koch's", "healed tuberculosis", "fibrocavitary lung"], ["haemoptysis", "breathless"]),
  dx("drug resistant tuberculosis", ["MDR-TB", "multidrug resistant tuberculosis", "XDR-TB", "rifampicin resistant"], ["genexpert", "cbnaat"]),
  dx("tubercular pleural effusion", ["tubercular effusion", "pleural tuberculosis", "lymphocytic exudate"], ["effusion", "adenosine deaminase"]),
  dx("miliary tuberculosis", ["disseminated tuberculosis", "miliary mottling"], ["fever", "chest x-ray"]),
  micro("GeneXpert", ["CBNAAT", "Xpert MTB RIF", "NAAT for TB", "cartridge based test"], ["sputum", "tuberculosis"]),
  micro("sputum for acid-fast bacilli", ["sputum AFB", "ZN stain", "Ziehl-Neelsen", "smear microscopy", "AFB smear"], ["tuberculosis"]),
  micro("line probe assay", ["LPA", "first line LPA", "second line LPA"], ["resistance"]),
  micro("mycobacterial culture", ["MGIT culture", "liquid culture", "drug susceptibility testing", "DST"], ["tuberculosis"]),
  drug("anti-tubercular therapy", ["ATT", "HRZE", "AKT-4", "AKT-3", "fixed dose combination", "intensive phase", "continuation phase"], ["tuberculosis"]),
  drug("bedaquiline", ["BDQ", "shorter oral regimen", "linezolid", "clofazimine", "cycloserine"], ["drug resistant"]),
  entry("National TB Elimination Programme", ["india-ward"], ["NTEP", "RNTCP", "DOTS", "Nikshay", "TB notification"], ["tuberculosis"], PRIORITY.INDIA_WARD),

  // --- Infection, interstitial and occupational -----------------------------------------
  dx("pleural effusion", ["massive effusion", "loculated effusion", "empyema", "parapneumonic effusion"], ["breathless", "tap"]),
  dx("pneumothorax", ["spontaneous pneumothorax", "tension pneumothorax", "hydropneumothorax"], ["sudden breathless", "chest pain"]),
  dx("lung abscess", ["cavitary lesion", "necrotising pneumonia"], ["fever", "foul sputum"]),
  dx("interstitial lung disease", ["ILD", "pulmonary fibrosis", "hypersensitivity pneumonitis", "usual interstitial pneumonia", "UIP pattern"], ["dry cough", "clubbing"]),
  dx("occupational lung disease", ["silicosis", "pneumoconiosis", "byssinosis", "stone dust exposure", "biomass exposure"], ["dust", "exposure"]),
  dx("bronchogenic carcinoma", ["lung carcinoma", "lung malignancy", "mass lesion lung", "lung primary"], ["smoker", "haemoptysis", "weight loss"]),
  dx("cor pulmonale", ["pulmonary hypertension", "right heart failure", "pulmonary arterial hypertension"], ["pedal swelling", "breathless"]),
  dx("acute respiratory distress syndrome", ["ARDS", "acute lung injury", "bilateral infiltrates"], ["hypoxia", "ventilator"]),
  dx("type 2 respiratory failure", ["type two respiratory failure", "hypercapnic respiratory failure", "carbon dioxide retention"], ["drowsy", "headache"]),
  dx("type 1 respiratory failure", ["type one respiratory failure", "hypoxaemic respiratory failure"], ["hypoxia"]),

  // --- Bedside procedures and devices ----------------------------------------------------
  proc("pleural tap", ["diagnostic tap", "therapeutic tap", "thoracocentesis", "thoracentesis", "pleural aspiration"], ["effusion"]),
  // "intercostal drain" is already a generic device term, reachable from every unit; only the
  // things said about one while it is in are added here.
  proc("intercostal drain management", ["water seal", "column movement", "underwater seal", "air leak", "drain clamped", "drain removed"], ["pneumothorax", "empyema"]),
  proc("pleurodesis", ["chemical pleurodesis", "talc pleurodesis"], ["recurrent effusion"]),
  proc("bronchoscopy", ["fibreoptic bronchoscopy", "flexible bronchoscopy", "bronchoalveolar lavage", "BAL", "endobronchial biopsy", "EBUS"], ["mass", "haemoptysis"]),
  proc("pleural biopsy", ["closed pleural biopsy", "Abrams needle", "medical thoracoscopy"], ["effusion"]),
  device("non-invasive ventilation", ["NIV", "BiPAP", "bilevel", "CPAP", "IPAP", "EPAP", "NIV trial"], ["respiratory failure"]),
  device("high flow nasal cannula", ["HFNC", "high flow oxygen", "nasal high flow"], ["hypoxia"]),
  device("oxygen delivery", ["nasal prongs", "face mask", "venturi mask", "non-rebreathing mask", "NRBM", "oxygen at litres"], ["hypoxia"]),
  device("nebulisation", ["nebuliser", "nebulised", "spacer", "metered dose inhaler", "dry powder inhaler", "rotahaler"], ["wheezing"]),

  // --- Tests the round quotes -------------------------------------------------------------
  test("arterial blood gas", ["blood gas", "ABG report", "pH and PCO2", "bicarbonate", "base excess", "lactate on gas"], ["respiratory failure"]),
  test("pulmonary function test", ["spirometry", "PFT", "FEV1", "FVC", "FEV1 by FVC", "post bronchodilator reversibility", "DLCO"], ["obstruction"]),
  test("six minute walk test", ["6MWT", "walk test", "desaturation on walking"], ["exercise"]),
  test("pleural fluid analysis", ["pleural fluid protein", "pleural fluid ADA", "adenosine deaminase", "Light's criteria", "pleural fluid cytology"], ["effusion"]),
  test("chest radiograph", ["chest x-ray", "CXR", "PA view", "lateral decubitus", "cavity", "consolidation", "fibrocavitary"], ["chest"]),
  test("HRCT chest", ["high resolution CT chest", "CT thorax", "CT pulmonary angiogram", "CTPA", "honeycombing", "ground glass"], ["chest"]),
  test("polysomnography", ["sleep study", "apnoea hypopnoea index", "AHI value", "level one study", "CPAP titration", "Epworth sleepiness scale"], ["snoring", "sleepiness"]),
  test("peak expiratory flow rate", ["PEFR", "peak flow", "personal best"], ["wheezing"]),

  // --- Inhalers and the drugs spoken by brand ----------------------------------------------
  brand("Foracort", ["Foracort rotacap", "formoterol budesonide"], ["inhaler"]),
  brand("Duolin", ["Duolin respule", "levosalbutamol ipratropium"], ["nebulisation"]),
  brand("Seroflo", ["salmeterol fluticasone"], ["inhaler"]),
  brand("Budecort", ["budesonide respule"], ["nebulisation"]),
  brand("Asthalin", ["salbutamol respule", "Asthalin nebulisation"], ["wheezing"]),
  drug("tiotropium", ["long acting muscarinic antagonist", "LAMA inhaler"], ["copd"]),
  drug("montelukast", ["leukotriene antagonist"], ["wheezing"]),
  drug("pirfenidone", ["nintedanib", "antifibrotic"], ["fibrosis"]),
];
