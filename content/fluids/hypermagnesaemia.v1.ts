import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPERMAGNESAEMIA — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 29 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const hypermagnesaemiaV1: FluidTopic = {
  id: "hypermagnesaemia",
  version: "1.0.0",
  title: "Hypermagnesaemia: diagnosis and management",
  group: "electrolytes",
  summary: "High magnesium: the definition, causes, clinical features by magnesium level, the work-up, and management from stopping magnesium to calcium gluconate, saline diuresis and haemodialysis.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["29 Hypermagnesemia"], pages: "336–338", pageKind: "book" },
  sections: [
    {
      id: "definition",
      title: "Definition",
      blocks: [
        points([
          "Hypermagnesaemia is an uncommon electrolyte disorder: serum magnesium above 2.6 mg/dL (1.1 mmol/L, or 2.14 mEq/L).",
          "A normal kidney excretes a magnesium load effectively, so hypermagnesaemia is rarely seen when renal function is normal.",
        ]),
        quote("defined as serum magnesium concentration above 2.6 mg/dL (1.1 mmol/L, or 2.14 mEq/L).", "336"),
      ],
    },
    {
      id: "causes",
      title: "Etiology",
      intro: "Frequently iatrogenic: almost always impaired excretion in AKI or CKD, or a large magnesium load.",
      blocks: [
        table(
          ["Group", "Causes"],
          [
            ["Renal failure", "AKI or CKD patients receiving magnesium-containing antacids, laxatives, or IV fluids"],
            ["Excessive magnesium intake", "IV magnesium sulfate for preeclampsia or eclampsia; aggressive IV magnesium for hypomagnesaemia; large amounts of magnesium salts as cathartics or antacids; rectal magnesium sulfate enemas"],
            ["Compartment shift or leak", "Untreated diabetic ketoacidosis, tumour lysis syndrome, acute rhabdomyolysis, haemolysis, severe burns"],
            ["Miscellaneous", "Milk-alkali syndrome; impaired renal excretion of magnesium in primary hyperparathyroidism, adrenal insufficiency and hypothyroidism"],
          ],
          "Common causes"
        ),
      ],
    },
    {
      id: "clinical_features",
      title: "Clinical features",
      intro: "Chiefly neuromuscular, cardiac and related to hypocalcaemia; they vary with the magnesium level and in severe form can be fatal.",
      blocks: [
        table(
          ["mg/dL", "mEq/L", "mmol/L", "Clinical effects"],
          [
            ["2.5–5.0", "2.1–4.2", "1.05–2.1", "Clinically asymptomatic"],
            ["5.0–7.0", "4.2–5.8", "2.1–2.9", "Nausea, vomiting, flushing, weakness, lethargy, drowsiness, confusion, and impaired deep tendon (patellar) reflexes"],
            ["7.0–12.0", "5.8–10.0", "2.9–5.0", "Loss of deep tendon reflexes, transient hypocalcemia, confusion, somnolence, paralytic ileus, bladder paralysis, bradycardia, hypotension, hypoventilation, and ECG changes (P-Q interval prolongation, widen QRS complex)"],
            [">12.0", ">10.0", ">5.0", "Muscle flaccid paralysis, respiratory failure, complete heart block, and cardiac arrest"],
          ],
          "Table 29.1 Clinical features of hypermagnesemia",
          "Values exactly as printed. The table's lowest band starts at 2.5 mg/dL, below the 2.6 mg/dL definition on p336."
        ),
        quote("7.0–12.0 | 5.8–10.0 | 2.9–5.0", "337"),
        quote(">12.0 | >10.0 | >5.0 | Muscle flaccid paralysis, respiratory failure, complete heart block, and cardiac arrest", "337"),
        points([
          "Neuromuscular: magnesium inhibits acetylcholine release at the neuromuscular endplate. Muscle weakness, lethargy, loss of deep tendon jerks, paresis leading to respiratory depression, respiratory failure and quadriparesis. Smooth-muscle paralysis can present as paralytic ileus or urinary retention.",
          "Cardiovascular: magnesium blocks calcium channels and intracellular potassium channels needed for repolarisation. Hypotension from peripheral vasodilatation is often refractory to volume expansion and vasopressors, and is one of the earliest manifestations. Conduction defects cause bradycardia, and cardiac asystole in severe cases.",
          "ECG: prolonged PR, QRS and QT intervals with sinus bradycardia, atrioventricular block, and lastly complete heart block in more severe cases.",
          "Hypocalcaemia: transient and asymptomatic, from decreased PTH secretion and end-organ resistance to PTH.",
        ]),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis",
      blocks: [
        steps([
          "Serum magnesium and ECG: the two basic tests to diagnose the disorder and its severity.",
          "Detailed history and examination to establish the clinical disorder responsible.",
          "First step: creatinine (renal function) and electrolytes, including K⁺, Ca²⁺ and phosphorus (coexisting abnormalities). Renal failure is the most common cause, and hypocalcaemia a common concurrent disorder.",
          "Selectively, by clinical evaluation: creatinine kinase, uric acid, LDH, PTH, thyroid function tests, blood sugar and serum acetone, to exclude rhabdomyolysis, tumour lysis syndrome, haemolysis, hyperparathyroidism, hypothyroidism and diabetic ketoacidosis respectively.",
        ]),
      ],
    },
    {
      id: "management",
      title: "Management",
      intro: "Treatment depends on magnesium concentration, severity of symptoms, renal function and the underlying cause.",
      blocks: [
        points([
          "Eliminate exogenous sources: stop magnesium-containing antacids and laxatives and discontinue magnesium-containing IV fluids.",
        ]),
        caution([
          "Avoid long-term magnesium-containing medications in patients with kidney failure.",
          "Monitor serum magnesium closely in patients receiving parenteral magnesium.",
          "In preeclampsia, discontinue the infusion if respiratory rate is <12 breaths/minute, deep tendon reflexes are absent, and urine output is <25 mL/hour or <100 mL over 4 hours.",
        ], "Prevention and precautions"),
        quote("respiratory rate is <12 breaths/minute, deep tendon reflexes are absent, and urine output is <25 mL/hour or <100 mL over 4 hours.", "338"),
        points([
          "Temporary antidote: 10% calcium gluconate, 10 ml (1 gm) IV, infused slowly over 5–10 minutes; can be repeated after 5 minutes if symptomatic patients do not improve. Calcium counters the effect of magnesium on neuromuscular and cardiac function without changing the magnesium level.",
          "Forced saline diuresis: if renal function is normal, high-volume saline infusion (e.g. 150 mL/hour) followed by furosemide enhances renal magnesium excretion.",
          "Haemodialysis: in severe kidney disease, the effective and preferred treatment to remove excess magnesium and correct severe symptomatic hypermagnesaemia.",
          "Emergency supportive treatment: mechanical ventilation for impaired respiration; a temporary pacemaker may be necessary for significant bradyarrhythmias.",
        ], "Treatment"),
        quote("10% calcium gluconate, 10 ml (1 gm) IV is infused slowly over 5–10 minutes and can be repeated after 5 minutes", "338"),
        quote("high-volume saline infusion (e.g., 150 mL/hour) followed by furosemide for diuresis", "338"),
      ],
    },
  ],
};
