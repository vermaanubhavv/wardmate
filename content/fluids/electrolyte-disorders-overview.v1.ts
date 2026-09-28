import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, table } from "@/content/fluids/_helpers";

/**
 * ELECTROLYTE DISORDERS: OVERVIEW — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of the openings of chapters 20–29. This edition of the source carries, for each of
 * these chapters, only the contents list and the first page or two (definitions, normal ranges,
 * physiology, severity grades, etiology). The correction sections are not in the text, and the
 * final section says so chapter by chapter. Every number below is the book's; the quotes give
 * the PDF page it came from.
 */
export const electrolyteDisordersOverviewV1: FluidTopic = {
  id: "electrolyte_disorders_overview",
  version: "1.0.0",
  title: "Electrolyte disorders: definitions, normal ranges and severity in this edition",
  group: "electrolytes",
  summary: "Sodium, potassium, calcium, phosphate and magnesium: what the book defines, how it grades severity, and which correction chapters this edition does not carry.",
  setting: "Adult ward and ICU; a reference to read, not a correction protocol",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "20 Hyponatremia (opening only)",
      "21 Hypernatremia (opening only)",
      "22 Hypokalemia (opening only)",
      "23 Hyperkalemia (opening only)",
      "24 Hypocalcemia (opening only)",
      "25 Hypercalcemia (opening only)",
      "26 Hypophosphatemia (opening only)",
      "27 Hyperphosphatemia (opening only)",
      "28 Hypomagnesemia (opening only)",
      "29 Hypermagnesemia (opening only)",
    ],
    pages: "148–180",
  },
  sections: [
    {
      id: "sodium_physiology",
      title: "Sodium and water: the opening statement",
      intro: "The chapter opens by putting sodium concentration in terms of water, not salt.",
      blocks: [
        points([
          "Water excess or deficit leads to hyponatraemia and hypernatraemia; disorders of sodium concentration occur primarily from water imbalance, not from changes in total body sodium content.",
          "Serum sodium falls when total body water rises and rises when total body water falls, so the book teaches sodium disorders through the physiology of water balance.",
          "Serum osmolality is determined mainly by sodium salts, so water regulation is also discussed as the regulation of body fluid osmolality (osmoregulation).",
          "Normal serum osmolality is 275–290 mOsm/kg.",
        ]),
        formula(
          "Calculated serum osmolality",
          "2 × Na + glucose / 18 + BUN / 2.8",
          [
            { symbol: "Na", meaning: "serum sodium", unit: "mEq/L" },
            { symbol: "glucose", meaning: "blood glucose", unit: "mg/dL" },
            { symbol: "BUN", meaning: "blood urea nitrogen", unit: "mg/dL" },
          ],
          {
            note: "Page 149 names the variables and units (osmolality in mOsm/kg, sodium in mEq/L, glucose and BUN in mg/dL) and the normal range 275–290 mOsm/kg; the equation itself is an image that did not survive extraction, so the coefficients shown are the standard form (2 × Na + glucose/18 + BUN/2.8), not read off the page.",
            calc: "serum_osmolality",
          }
        ),
        quote("disorders of sodium concentration occur primarily due to water imbalance", "148"),
        quote("Normal serum osmolality is 275–290 mOsm/kg.", "149"),
        quote("osmolality is in mOsm/kg, sodium in mEq/L, glucose in mg/dL, and blood urea nitrogen (BUN) in mg/dL", "149"),
      ],
    },
    {
      id: "hyponatraemia",
      title: "Hyponatraemia: what this edition carries",
      blocks: [
        points([
          "Hyponatraemia is usually associated with low serum osmolality.",
          "The chapter's contents list shows it classifies hyponatraemia, gives a step-by-step diagnosis, singles out diuretics, SIADH, cerebral salt wasting and exercise-associated hyponatraemia, and stratifies treatment by symptom severity, chronicity and volume status. It also carries a separate SIADH section with diagnostic criteria and treatment.",
          "A numeric definition of hyponatraemia and its severity bands are not in the text present.",
        ]),
        quote("Hyponatremia is usually associated with low serum osmolality.", "149"),
      ],
    },
    {
      id: "hypernatraemia",
      title: "Hypernatraemia: definition, frequency, mortality",
      blocks: [
        points([
          "Defined as a plasma sodium concentration greater than 145 mEq/L; it always results in hypertonicity (hyperosmolality) and usually occurs from lack of water, loss of water or primary sodium gain.",
          "Less frequent than hyponatraemia: about 1%–3% of all hospitalised patients and 9% of the critically ill, but it carries a significantly higher mortality, about 40–60%.",
          "The book sets one line in capitals: hypernatraemia is usually due to water deficit and not sodium overload.",
          "Normal thirst is the most potent protection. In healthy adults it occurs only when water is unavailable or restricted, thirst is impaired, or the patient cannot drink because of a comatose-confused state; so it is seen chiefly in the very young, very old, very sick, bed-ridden or debilitated.",
          "A pure water deficit leading to hypernatraemia is called dehydration.",
          "Table 21.1 classifies causes by volume status, water loss or salt gain, urinary sodium and underlying etiology; its contents are not in the text present.",
        ]),
        quote("plasma sodium concentration greater than 145 mEq/L, always results in hypertonicity", "153"),
        quote("about 1%–3% of all hospitalized patients and 9% in critically ill patients", "153"),
        quote("carries significantly higher mortality (about 40–60%)", "153"),
        quote("HYPERNATREMIA IS USUALLY DUE TO WATER DEFICIT AND NOT SODIUM OVERLOAD.", "153"),
      ],
    },
    {
      id: "potassium_physiology",
      title: "Potassium: distribution and homeostasis",
      blocks: [
        table(
          ["Quantity", "Value in the text"],
          [
            ["Total body potassium", "about 3,500 mEq"],
            ["Intracellular share", "98%"],
            ["Extracellular share", "2%"],
            ["Normal serum potassium", "3.5 to 5.0 mEq/L"],
            ["Intracellular concentration", "140 to 150 mEq/L"],
            ["Average daily intake, adult men", "about 77 mEq"],
            ["Average daily intake, adult women", "about 59 mEq"],
            ["Absorbed in the upper GI tract", "90% of intake"],
            ["Of the absorbed potassium", "kidneys excrete 90%, stool 10%"],
          ],
          "Numbers printed on pages 156–157"
        ),
        points([
          "Potassium is the major intracellular cation and the second most abundant cation in the body after sodium.",
          "Roles listed: normal cell function (DNA and protein synthesis, cell division and growth, enzyme function); neuromuscular transmission (membrane potential, excitability, nerve conduction, skeletal, cardiac and smooth muscle contraction); intracellular osmolality and cell volume; acid-base balance and intracellular pH.",
        ]),
        quote("Total body potassium is about 3,500 mEq. Out of this, 98% of potassium is intracellular", "156"),
        quote("normal serum potassium concentration is 3.5 to 5.0 mEq/L vs. an intracellular 140 to 150 mEq/L", "156"),
        quote("average potassium intake is about 77 and 59 mEq per day in adult men and women", "157"),
      ],
    },
    {
      id: "hypokalaemia",
      title: "Hypokalaemia: what this edition carries",
      blocks: [
        points([
          "The chapter opening carries only the potassium physiology above. A numeric definition of hypokalaemia and its severity grades are not in the text present.",
          "Its contents list shows the chapter covers etiology, clinical features and ECG changes, a diagnosis built on history and examination, laboratory evaluation, urinary potassium excretion and acid-base status, and a management section on estimating the deficit, choosing oral or intravenous replacement, precautions, potassium-containing IV fluids and the target of supplementation.",
        ]),
        quote("kidneys excrete 90%, and the remaining 10% is excreted in the stool", "157"),
      ],
    },
    {
      id: "hyperkalaemia",
      title: "Hyperkalaemia: definition and causes",
      blocks: [
        points([
          "A serum potassium greater than 5.5 mEq/L is hyperkalaemia.",
          "Incidence is very low in the general population but rises with chronic kidney disease, heart failure, diabetes and RAAS-inhibitor treatment. It is associated with increased hospitalisation, cardiovascular events and all-cause mortality; acute severe hyperkalaemia can cause arrhythmia, cardiac arrest and death.",
          "Most common causes: renal dysfunction (acute or chronic), medication impairing potassium excretion, diabetes mellitus, cell lysis (rhabdomyolysis, tumour lysis syndrome, massive haemolysis) and pseudohyperkalaemia.",
          "CKD is the most common risk factor for hyperkalaemia, hyperkalaemia is the most common electrolyte disturbance in CKD, and its prevalence rises as CKD advances.",
          "Drugs cause hyperkalaemia by affecting renal potassium excretion, inhibiting the renin-angiotensin-aldosterone system, or shifting potassium from intracellular to extracellular fluid. The drug list (Table 23.2) and the causes-by-mechanism list (Table 23.1) are not in the text present.",
        ]),
        quote("A serum potassium level greater than 5.5 mEq/L is considered hyperkalemia.", "159"),
        quote("CKD is the most common risk factor for hyperkalemia", "159"),
      ],
    },
    {
      id: "calcium_physiology",
      title: "Calcium: distribution and normal range",
      blocks: [
        points([
          "An average adult carries 20 to 25 gm/kg or 1.2 to 1.4 kg of calcium, the most abundant cation in the body: about 99% in bone, 1% in soft tissue cells and 0.15% in the extracellular fluid.",
          "Serum calcium is less than 1% of total body calcium and so a poor marker of total body content.",
          "Normal serum calcium is about 8.5 to 10.5 mg/dL (4.3 to 5.2 mEq/L, 2.2 to 2.6 mmol/L).",
        ]),
        table(
          ["Form of ECF calcium", "Share", "Diffusible", "Biologically active"],
          [
            ["Bound to proteins (mainly albumin)", "about 40%", "no", "no"],
            ["Free ionised", "50%", "yes", "yes"],
            ["Complexed with anions (phosphate, bicarbonate, citrate, lactate, sulfate)", "10%", "yes", "no"],
          ],
          "The three forms of extracellular calcium"
        ),
        quote("The normal value is about 8.5 to 10.5 mg/dL (4.3 to 5.2 mEq/L, 2.2 to 2.6 mmol/L).", "164"),
        quote("50% of calcium is in an ionized form which is diffusible and biologically active.", "165"),
      ],
    },
    {
      id: "hypercalcaemia",
      title: "Hypercalcaemia: definitions and causes",
      blocks: [
        table(
          ["Grade", "Total serum calcium", "Ionised calcium"],
          [
            ["Hypercalcaemia (with normal serum albumin)", ">10.5 mg/dL (>2.6 mmol/L)", ">5.2 mg/dL (>1.3 mmol/L)"],
            ["Severe hypercalcaemia", ">14.0 mg/dL (>3.5 mmol/L)", ">7.0 mg/dL (>1.7 mmol/L)"],
          ],
          "Definitions printed on page 167"
        ),
        points([
          "Less common than hypocalcaemia: about 0.6–7.5% of hospitalised patients and less than 1.0% of outpatients. Early detection and prompt treatment matter because it carries high morbidity and mortality.",
          "Primary hyperparathyroidism and malignancy are the two most common causes, together accounting for more than 90% of patients. Hypercalcaemia from vitamin D toxicity has risen significantly in recent times.",
          "Mechanisms: enhanced bone resorption, increased intestinal absorption, or decreased renal calcium excretion (Table 25.1, not in the text present).",
          "A definition of hypocalcaemia and its severity grades are not in the text present; chapter 24 opens with the physiology above and stops.",
        ]),
        quote("total serum calcium >10.5 mg/dL (>2.6 mmol/L) with normal serum albumin or ionized calcium >5.2 mg/dL (>1.3 mmol/L)", "167"),
        quote("Primary hyperparathyroidism and malignancy are the two most common causes of hypercalcemia in more than 90% of patients", "167"),
      ],
    },
    {
      id: "phosphate",
      title: "Phosphate: normal range and hyperphosphataemia",
      blocks: [
        points([
          "Phosphate and phosphorus are used interchangeably. Phosphate is the most abundant intracellular anion, the second-largest mineral after calcium, and about 1% of body weight.",
          "About 85% is in bone and teeth as hydroxyapatite; only 1% is in the extracellular fluid, so serum phosphorus may not reflect total body content. A pH change shifts phosphate too: acidosis moves it from intracellular to extracellular fluid and raises the serum value.",
          "Normal adult serum phosphorus is 2.5 to 4.5 mg/dL (0.75 to 1.45 mmol/L). Measure fasting: diurnal variation is as much as 50%, lower in the morning and higher at night and after meals. Clinically the level reflects nutritional status.",
          "Hyperphosphataemia is a serum phosphate greater than 4.5 mg/dL (1.45 mmol/L) in adults. Renal excretion is very effective, so it is unlikely from intake alone with normal kidneys; it is rare in the general population and common in later-stage CKD.",
          "A definition of hypophosphataemia and its severity grades are not in the text present.",
        ]),
        table(
          ["Mechanism", "Causes as printed"],
          [
            ["Decreased renal phosphate excretion", "Impaired excretion: AKI or CKD with significant renal impairment, the most common cause. Increased tubular reabsorption: hypoparathyroidism, vitamin D toxicity, acromegaly or thyrotoxicosis."],
            ["Transcellular shift from ICF to ECF", "Extensive cell destruction: rhabdomyolysis, tumour lysis syndrome, massive haemolysis. Severe acidosis: severe lactic acidosis, diabetic acidosis, respiratory acidosis. Lack of insulin: diabetic ketoacidosis before treatment."],
            ["Acute massive phosphate load", "Phosphate-containing laxatives or enemas; IV or oral phosphate administration."],
            ["Spurious or pseudohyperphosphataemia", "Heading only in the contents list; its text is not present."],
          ],
          "Hyperphosphataemia: the four etiology groups"
        ),
        quote("Normal serum phosphorus levels in adults range from 2.5 to 4.5 mg/dL (0.75 to 1.45 mmol/L).", "170"),
        quote("serum phosphate concentration greater than 4.5 mg/dL (1.45 mmol/L) in adults", "173"),
      ],
    },
    {
      id: "magnesium_physiology",
      title: "Magnesium: distribution, normal range and Table 28.1",
      blocks: [
        points([
          "Magnesium disorder, especially hypomagnesaemia, is expected in ICU patients and usually follows renal and gastrointestinal losses. Hypermagnesaemia is less frequent; its most common cause is renal failure.",
          "Magnesium is the fourth most common cation in the body (after sodium, potassium and calcium), the second most common intracellular cation (after potassium) and the commonest intracellular divalent cation.",
          "About 60% is in bone, 39% within cells and only 1% in the extracellular fluid. Of plasma magnesium up to 40% is protein-bound, 5–10% complexed and about 50–55% free ionised, the biologically active fraction, as with calcium.",
          "Normal serum magnesium is 1.7 to 2.1 mg/dL (0.70 to 0.85 mmol/L, 1.4 to 1.7 mEq/L).",
          "Clinical effects are set mainly by tissue magnesium, so serum levels have limited diagnostic value.",
        ]),
        table(
          ["Category", "mg/dL", "mmol/L", "mEq/L"],
          [
            ["Hypomagnesaemia, severe", "<1.0", "<0.5", "<0.8"],
            ["Hypomagnesaemia, moderate", "1.0-1.5", "0.4-0.6", "0.8-1.2"],
            ["Hypomagnesaemia, mild", "1.6-1.9", "0.7-0.8", "1.4-1.6"],
            ["Normal range", "1.7-2.1", "0.70-0.85", "1.4-1.7"],
            ["Hypermagnesaemia, mild", "4.8-7.2", "2.0-3.0", "4.0-6.0"],
            ["Hypermagnesaemia, moderate", "7.2-12", "3.0-5.0", "6.0-10"],
            ["Hypermagnesaemia, severe", ">12", ">5", ">10"],
          ],
          "Table 28.1 Interpretation of serum magnesium concentration",
          "Values exactly as printed. The book's own bands overlap: mild hypomagnesaemia 1.6-1.9 mg/dL against a normal range of 1.7-2.1 mg/dL, and moderate 0.4-0.6 mmol/L against severe <0.5 mmol/L. Nothing between 2.1 and 4.8 mg/dL is graded here; chapter 29 defines hypermagnesaemia from 2.6 mg/dL."
        ),
        formula(
          "Serum magnesium unit conversion",
          "1 mEq/L = 1.2 mg/dL = 0.5 mmol/L",
          [
            { symbol: "mEq/L", meaning: "milliequivalents per litre" },
            { symbol: "mg/dL", meaning: "milligrams per decilitre" },
            { symbol: "mmol/L", meaning: "millimoles per litre" },
          ],
          { note: "Conversion factors printed under Table 28.1." }
        ),
        quote("Conversion factors for serum magnesium: 1 mEq/L = 1.2 mg/dL = 0.5 mmol/L", "176"),
        quote("The normal serum magnesium level is 1.7 to 2.1 mg/dL", "177"),
        quote("serum magnesium levels have limited diagnostic value", "177"),
      ],
    },
    {
      id: "hypermagnesaemia",
      title: "Hypermagnesaemia: definition, causes and features",
      blocks: [
        points([
          "Uncommon; defined as a serum magnesium above 2.6 mg/dL (1.1 mmol/L, or 2.14 mEq/L). A normal kidney excretes a magnesium load effectively, so it is rarely seen with normal renal function.",
          "Frequently iatrogenic: almost always either impaired excretion in AKI or CKD, or administration of magnesium in a large amount.",
        ]),
        table(
          ["Group", "Causes as printed"],
          [
            ["Renal failure", "AKI or CKD patients receiving magnesium-containing antacids, laxatives, or IV fluids."],
            ["Excessive magnesium intake", "IV magnesium sulfate for preeclampsia or eclampsia; aggressive treatment of hypomagnesaemia with IV magnesium; large amounts of magnesium salts as cathartics or antacids; rectal magnesium sulfate enemas."],
            ["Compartment shift or leak", "Untreated diabetic ketoacidosis, tumour lysis syndrome, acute rhabdomyolysis, haemolysis, severe burns."],
            ["Miscellaneous", "Milk-alkali syndrome; impaired renal excretion from primary hyperparathyroidism, adrenal insufficiency, hypothyroidism."],
          ],
          "Common causes"
        ),
        points([
          "Symptoms are chiefly neuromuscular, cardiac and related to hypocalcaemia, varying with the level and potentially fatal in severe form; the level-by-level summary (Table 29.1) is not in the text present.",
          "Neuromuscular: magnesium inhibits acetylcholine release at the endplate and blocks transmission, giving muscular weakness, lethargy, loss of deep tendon jerks, and paresis leading to respiratory depression, respiratory failure and quadriparesis. Smooth-muscle paralysis may present as paralytic ileus or urinary retention.",
          "The cardiac and hypocalcaemia-related features, diagnosis and management are not in the text present.",
        ], "Clinical features"),
        quote("serum magnesium concentration above 2.6 mg/dL (1.1 mmol/L, or 2.14 mEq/L)", "179"),
        quote("Hypermagnesemia is frequently iatrogenic", "179"),
        quote("muscular paresis leading to respiratory depression, respiratory failure, and quadriparesis", "179"),
      ],
    },
    {
      id: "not_in_edition",
      title: "What this edition does not carry",
      intro: "Each chapter's contents list names sections whose text is absent from this edition. None of them is reproduced here, and nothing above stands in for them.",
      blocks: [
        caution([
          "Chapter 20 Hyponatremia: its sections on classification, etiology, clinical features, step-by-step diagnosis, diuretics, SIADH, cerebral salt wasting, exercise-associated hyponatraemia, goal of therapy, hypertonic saline, loop diuretics, initial correction goal, rate of correction, chronic hyponatraemia, treatment by volume status, formulas for correction, vasopressin receptor antagonists, general guidelines, monitoring, and the whole SIADH section (etiology, pathogenesis, clinical features, diagnostic criteria, fluid restriction, hypertonic saline, loop diuretics, high solute intake, vasopressin receptor antagonists, demeclocycline and lithium) are not reproduced here.",
          "Chapter 21 Hypernatremia: its sections on etiology (Table 21.1), clinical features and CNS dysfunction in chronic and acute hypernatraemia, diagnosis, goals, correction of underlying causes, treatment by volume status (hypovolaemic, euvolaemic, hypervolaemic), treatment by onset, calculation of water deficit, route of fluid replacement, selecting replacement fluids, rate of correction and monitoring are not reproduced here.",
          "Chapter 22 Hypokalemia: its sections on regulation of serum potassium, correlation of serum and body potassium, etiology, clinical features and ECG changes, history and examination, laboratory evaluation, urinary potassium excretion, acid-base status, goals, prevention, estimation of the potassium deficit, selection of treatment modality, precautions, how much and how long, oral supplementation, intravenous supplementation (formulations, potassium-containing IV fluids, indications, recommendations for administration, special considerations), the target of supplementation and correction of underlying causes are not reproduced here.",
          "Chapter 23 Hyperkalemia: its sections on impaired renal potassium excretion, transcellular shift, diabetes, increased oral intake, pseudohyperkalaemia, neuromuscular and cardiac manifestations, ECG changes, diagnosis, history and examination, laboratory evaluation, goals, emergency management (protection with calcium gluconate; redistribution with insulin and glucose, beta-adrenergic agonists, sodium bicarbonate; removal with diuretics, potassium binders, dialysis), monitoring, chronic hyperkalaemia and specific etiological treatment, together with Tables 23.1 and 23.2, are not reproduced here.",
          "Chapter 24 Hypocalcemia: its sections on ionised calcium, corrected total calcium, regulation (PTH, vitamin D, calcitonin, calcium-sensing receptor, effect of pH, effect of phosphate and magnesium), etiology (postsurgical, vitamin D deficiency, acute pancreatitis), clinical features, diagnosis (history and examination, confirming the diagnosis, PTH, phosphate, magnesium and vitamin D, other tests), acute management, emergency therapy, calcium gluconate infusion, monitoring, calcium chloride, massive transfusion, precautions, long-term management, calcium and vitamin D supplementation and treatment of underlying etiology are not reproduced here.",
          "Chapter 25 Hypercalcemia: its sections on primary hyperparathyroidism, malignancy, vitamin D toxicity, milk alkali syndrome, granulomatous diseases, thiazide diuretics, immobilisation, clinical features, confirming the diagnosis, history and examination, PTH, other tests, selection of modality, isotonic saline hydration, furosemide, calcitonin, bisphosphonates, denosumab, glucocorticoids, phosphate, dialysis and specific treatment of underlying causes, together with Table 25.1, are not reproduced here.",
          "Chapter 26 Hypophosphatemia: its sections on etiology (acute respiratory alkalosis, sepsis, increased insulin secretion, diabetic ketoacidosis, hungry bone syndrome, postoperative), acute and chronic clinical features, history and examination, basic investigations, urinary phosphate excretion, PTH and vitamin D, other tests, basic principles of management, precautions and correction of underlying causes are not reproduced here.",
          "Chapter 27 Hyperphosphatemia: its sections on spurious or pseudohyperphosphataemia, clinical features, history and examination, serum creatinine, further investigations, treatment of underlying etiology, acute hyperphosphataemia, chronic hyperphosphataemia, dietary phosphate restriction, oral phosphate binders and renal replacement therapies are not reproduced here.",
          "Chapter 28 Hypomagnesemia: its sections on etiology, clinical features, history and examination, routinely ordered investigations, urinary magnesium excretion, correction of underlying etiology, basic principles of therapy, replacement in mild, moderate and severe hypomagnesaemia and parenteral magnesium therapy are not reproduced here.",
          "Chapter 29 Hypermagnesemia: its cardiac and hypocalcaemia-related clinical features (Table 29.1), diagnosis and management are not reproduced here.",
        ], "Sections whose text is absent from this edition"),
      ],
    },
  ],
};
