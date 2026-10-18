import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, table } from "@/content/fluids/_helpers";

/**
 * ELECTROLYTE DISORDERS: OVERVIEW — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * v2.0.0: chapters 20–25 moved to their own full topics (hyponatraemia, hypernatraemia,
 * hypokalaemia, hyperkalaemia, hypocalcaemia, hypercalcaemia), built from the full edition.
 * What remains digests the openings of chapters 26–29. This edition of the source carries, for each of
 * these chapters, only the contents list and the first page or two (definitions, normal ranges,
 * physiology, severity grades, etiology). The correction sections are not in the text, and the
 * final section says so chapter by chapter. Every number below is the book's; the quotes give
 * the PDF page it came from.
 */
export const electrolyteDisordersOverviewV1: FluidTopic = {
  id: "electrolyte_disorders_overview",
  version: "2.0.0",
  title: "Phosphate and magnesium disorders: definitions and severity in this edition",
  group: "electrolytes",
  summary: "Phosphate and magnesium: what the book defines and how it grades severity. Their correction sections are awaiting the full edition.",
  setting: "Adult ward and ICU; a reference to read, not a correction protocol",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "26 Hypophosphatemia (opening only)",
      "27 Hyperphosphatemia (opening only)",
      "28 Hypomagnesemia (opening only)",
      "29 Hypermagnesemia (opening only)",
    ],
    pages: "170–180",
  },
  sections: [
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
          "Chapter 26 Hypophosphatemia: its sections on etiology (acute respiratory alkalosis, sepsis, increased insulin secretion, diabetic ketoacidosis, hungry bone syndrome, postoperative), acute and chronic clinical features, history and examination, basic investigations, urinary phosphate excretion, PTH and vitamin D, other tests, basic principles of management, precautions and correction of underlying causes are not reproduced here.",
          "Chapter 27 Hyperphosphatemia: its sections on spurious or pseudohyperphosphataemia, clinical features, history and examination, serum creatinine, further investigations, treatment of underlying etiology, acute hyperphosphataemia, chronic hyperphosphataemia, dietary phosphate restriction, oral phosphate binders and renal replacement therapies are not reproduced here.",
          "Chapter 28 Hypomagnesemia: its sections on etiology, clinical features, history and examination, routinely ordered investigations, urinary magnesium excretion, correction of underlying etiology, basic principles of therapy, replacement in mild, moderate and severe hypomagnesaemia and parenteral magnesium therapy are not reproduced here.",
          "Chapter 29 Hypermagnesemia: its cardiac and hypocalcaemia-related clinical features (Table 29.1), diagnosis and management are not reproduced here.",
        ], "Sections whose text is absent from this edition"),
      ],
    },
  ],
};
