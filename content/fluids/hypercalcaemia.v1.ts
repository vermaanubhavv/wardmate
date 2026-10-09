import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPERCALCAEMIA — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 25 of the full edition. Page numbers are printed book pages. Every number
 * below is the book's; the quotes give the page it came from. The chapter prints no corrected
 * calcium formula, so no calculator is wired.
 */
export const hypercalcaemiaV1: FluidTopic = {
  id: "hypercalcaemia",
  version: "1.0.0",
  title: "Hypercalcaemia: diagnosis and lowering calcium",
  group: "electrolytes",
  summary: "Severity cut-offs, PTH-led work-up, and the book's saline, calcitonin, bisphosphonate, denosumab, steroid and dialysis regimens with cause-specific treatment.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["25 Hypercalcemia"], pages: "299–309", pageKind: "book" },
  sections: [
    {
      id: "definition",
      title: "Definition and severity",
      blocks: [
        points([
          "Less common than hypocalcaemia: about 0.6–7.5% of hospitalised patients and less than 1.0% of outpatients.",
          "Hypercalcaemia: total serum calcium >10.5 mg/dL (>2.6 mmol/L) with normal serum albumin, or ionised calcium >5.2 mg/dL (>1.3 mmol/L).",
          "Severe: total calcium >14.0 mg/dL (>3.5 mmol/L) or ionised calcium >7.0 mg/dL (>1.7 mmol/L).",
          "Early detection and prompt treatment matter because of high morbidity and mortality.",
        ]),
        table(
          ["Severity", "Total mg/dL", "Total mmol/L", "Ionised mg/dL", "Ionised mmol/L", "Symptoms"],
          [
            ["Mild", "10.5-11.9", "2.6-3.0", "5.4-6.0", "1.3-1.50", "Asymptomatic or mild symptoms like malaise, weakness, anxiety, and other vague symptoms"],
            ["Moderate", "12.0-13.9", "3.0-3.5", "6.0-7.0", "1.5-1.7", "Weakness, fatigue, depression, constipation, anorexia, nausea, polyuria, and shortened QT interval"],
            ["Severe / hypercalcaemic crisis", ">14.0", ">3.5", ">7.0", ">1.7", "Delirium, lethargy, confusion, stupor, coma, vomiting, peptic ulcer disease, pancreatitis, hypovolaemia, AKI, and arrhythmias"],
          ],
          "Table 25.2 Severity of hypercalcaemia and its symptoms",
          "The text's definition starts ionised hypercalcaemia at >5.2 mg/dL, while the table's mild band starts at 5.4 mg/dL; both are kept as printed."
        ),
        quote("Hypercalcemia is defined as total serum calcium >10.5 mg/dL (>2.6 mmol/L) with normal serum albumin or ionized calcium >5.2 mg/dL (>1.3 mmol/L)", "299"),
        quote("When total serum calcium is >14.0 mg/dL (>3.5 mmol/L) or ionized calcium is >7.0 mg/dL (>1.7 mmol/L), it is considered severe hypercalcemia", "299"),
      ],
    },
    {
      id: "etiology",
      title: "Causes",
      intro: "Primary hyperparathyroidism and malignancy cause more than 90%; vitamin D toxicity is rising. Mechanisms: more bone resorption, more intestinal absorption, or less renal excretion.",
      blocks: [
        table(
          ["Mechanism", "Causes"],
          [
            ["1. Increased bone resorption", "Primary hyperparathyroidism; secondary hyperparathyroidism; malignancy (lung, breast, kidney, multiple myeloma); hyperthyroidism; lithium therapy"],
            ["2. Increased intestinal absorption", "Vitamin D or vitamin A excess; milk-alkali syndrome; granulomatous disease (sarcoidosis, tuberculosis)"],
            ["3. Decreased renal excretion", "Familial hypocalciuric hypercalcaemia; thiazide diuretics"],
            ["4. Miscellaneous causes", "Prolonged immobilisation; rhabdomyolysis (recovery stage); parenteral nutrition"],
          ],
          "Table 25.1 Causes of hypercalcaemia"
        ),
        points([
          "Primary hyperparathyroidism: most common cause, about 50 to 60% of ambulatory and 25% of hospitalised patients. Middle age (50–60 years), two to three times more common in women. High PTH, hypercalcaemia, hypophosphataemia, cortical bone loss, hypercalciuria. Usually mild; >80% from a single parathyroid adenoma.",
          "Familial hypocalciuric hypercalcaemia: rare, autosomal dominant. Mild hypercalcaemia, low urinary calcium, inappropriately normal or high PTH, onset before 40 (against after 50 with hypercalciuria in primary hyperparathyroidism).",
          "Malignancy: second commonest cause and the commonest in inpatients (up to 65%); in 20% to 30% of all cancer patients. Myeloma, lung (especially squamous cell), breast and kidney. Can be severe, rapidly progressive and fatal. PTH is typically low. About 80% from tumour PTHrP; the other 20% from osteolytic metastases.",
          "Vitamin D toxicity: increased intestinal absorption, rising with self-administration above recommended doses. Low PTH and hyperphosphataemia (common but not always).",
          "Milk-alkali syndrome: triad of hypercalcaemia, metabolic alkalosis and AKI, from large amounts of calcium antacids or calcium carbonate for osteoporosis.",
          "Granulomatous disease such as sarcoidosis: macrophages overproduce calcitriol; PTH suppressed.",
          "Thiazides: increase calcium reabsorption in the distal tubule; usually mild and transient (1 to 2 weeks), but can unmask or worsen primary hyperparathyroidism.",
          "Prolonged immobilisation: unopposed bone resorption, more common in children, adolescents and high-turnover states (thyrotoxicosis, Paget disease, extensive fractures).",
        ]),
        quote("This disorder is the most common cause of hypercalcemia in about 50%", "299"),
        quote("It is the most common cause of inpatient hypercalcemia (accounts for up to 65%). It occurs in 20% to 30% of all cancer patients", "300"),
        quote("Thiazideinduced hypercalcemia is usually mild and transient (1 to 2 weeks).", "301"),
      ],
    },
    {
      id: "features",
      title: "Clinical features",
      intro: "Features depend on severity and speed of onset; mild hypercalcaemia is generally asymptomatic. Classic mnemonic for primary hyperparathyroidism: renal stones, painful bones, abdominal groans, psychic moans.",
      blocks: [
        points([
          "General: weakness, easy fatigability, malaise.",
          "Nervous system: depression, lethargy, confusion, stupor, progressing to seizures and coma.",
          "Gastrointestinal: constipation, anorexia, nausea, vomiting; abdominal pain from peptic ulcer (gastrin stimulation) or pancreatitis.",
          "Renal: polyuria and nocturia from impaired concentrating ability; severe polyuria can cause ECF depletion and AKI; nephrocalcinosis, stones, renal colic, haematuria, chronic kidney disease.",
          "Skeletal: bone pain, arthritis, osteoporosis, pathological fracture, osteitis fibrosa cystica in hyperparathyroidism.",
          "Cardiac: hypertension, worse digitalis toxicity; ECG shortened QT interval and, when severe, arrhythmia such as complete heart block leading to cardiac arrest.",
          "Metastatic calcification: band keratopathy, red-eye syndrome, nephrocalcinosis, vascular calcification.",
        ]),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnostic approach",
      blocks: [
        steps([
          "Confirm true hypercalcaemia: measure ionised calcium, or correct total calcium for albumin when albumin is low or high.",
          "History and examination. Asymptomatic outpatients with mild hypercalcaemia (total 11.0 mg/dL or lower) present more than 6 months without apparent cause point towards primary hyperparathyroidism; hypertension is common in it. Symptomatic patients with abrupt onset and severe hypercalcaemia (14 mg/dL or higher) point towards malignancy. Renal stones favour long duration, so malignancy is unlikely. Ask about vitamin D, calcium, antacids and lithium, and a family history of stones or hypercalcaemia.",
          "Measure serum PTH: the first and most crucial test. High or inappropriately normal PTH means PTH-dependent hypercalcaemia (primary hyperparathyroidism is the commonest, in patients not on thiazides or lithium and without advanced kidney disease). Then urinary calcium: high suggests primary hyperparathyroidism, low suggests familial hypocalciuric hypercalcaemia.",
          "Low PTH means PTH-independent hypercalcaemia. High 25-hydroxyvitamin D: vitamin D toxicity. High 1,25-dihydroxyvitamin D: lymphoma or granulomatous disease (sarcoidosis, tuberculosis). Both normal: further work-up.",
          "Further work-up: malignancy survey (chest X-ray, mammogram, abdominal/chest CT); PTHrP; myeloma screen (serum/urine protein electrophoresis, serum free light chains); alkaline phosphatase; vitamin A level; TSH and free T4; CBC, BUN, creatinine, phosphorus, liver function; medications (thiazide, lithium) and immobilisation.",
        ], "Figure 25.1, step by step"),
        points([
          "CBC and ESR.",
          "Sodium, potassium, magnesium and phosphate.",
          "Renal, liver and thyroid function, with alkaline phosphatase, total protein and albumin.",
          "25-hydroxyvitamin D, 1,25-dihydroxyvitamin D and PTHrP (if available).",
          "Serum and urine protein electrophoresis and a skeletal survey.",
        ], "Tests commonly ordered"),
        points([
          "Low chloride, high HCO3 and raised BUN and creatinine: characteristic of milk-alkali syndrome.",
          "High total protein with reversed albumin/globulin ratio: consider multiple myeloma.",
          "Low phosphate: primary hyperparathyroidism and humoral hypercalcaemia of malignancy. High phosphate with renal impairment: suggests tertiary hyperparathyroidism.",
          "High 1,25-dihydroxyvitamin D: chest X-ray for granulomatous disease.",
          "Raised alkaline phosphatase in osteolytic hypercalcaemia from bone metastases such as breast.",
        ], "Laboratory clues"),
        quote("primary hyperparathyroidism is the etiology in asymptomatic outpatients with mild hypercalcemia (total serum calcium 11.0 mg/dL or lower)", "302"),
        quote("Malignancy is often the cause in symptomatic patients with an abrupt onset of diseases and severe hypercalcemia (serum calcium 14 mg/dL or higher).", "302"),
        quote("The measurement of serum PTH levels is the first and most crucial test in the diagnostic approach to hypercalcemia", "303"),
      ],
    },
    {
      id: "when_to_treat",
      title: "When to treat and choosing modalities",
      blocks: [
        points([
          "Mild (<12 mg/dL): asymptomatic patients need no immediate treatment; observe, correct volume deficits, withdraw offending agents such as thiazides, manage the cause.",
          "Moderate (12 to 14 mg/dL): symptoms decide. Chronic and asymptomatic: as for mild. Acute onset: usually symptomatic, treat as severe.",
          "Severe (>14 mg/dL): all patients need immediate treatment regardless of symptoms.",
          "Five strategies (Figure 25.2): enhance renal excretion, reduce gastrointestinal absorption, inhibit bone resorption, remove calcium directly from the ECF, treat the cause.",
          "First-line emergency measures: isotonic saline, forced calciuresis (effect within 2-4 hours), calcitonin (effect within 4-6 hours). Slower: bisphosphonates (within 2 days), glucocorticoids (within 3 days), denosumab (within 4 days). Haemodialysis works within 1 hour but only in selected patients.",
          "Rapid first-line measures, slower more potent measures and treatment of the cause are started simultaneously (Table 25.3).",
        ]),
        quote("Moderate hypercalcemia (12 to 14 mg/dL): Symptoms dictate the therapeutic plan in moderate hypercalcemia.", "305"),
        quote("isotonic saline hydration, forced calciuresis (effect within 2-4 hours), and calcitonin (effect within 4-6 hours)", "305"),
        quote("bisphosphonates (within 2 days), glucocorticoids (within 3 days), and denosumab (within 4 days)", "305"),
      ],
    },
    {
      id: "table_25_3",
      title: "Treatment of severe hypercalcaemia (Table 25.3)",
      blocks: [
        table(
          ["Group", "Treatment", "Route", "Regimen"],
          [
            ["1. Increase urinary excretion", "Normal saline", "IV", "200–300 mL/hour initially, 100 to 150 mL/hour after rehydration for 1–5 days"],
            ["1. Increase urinary excretion", "Furosemide", "IV", "20–40 mg every 12–24 hours after correction of hypovolaemia"],
            ["2. Inhibit bone resorption", "Calcitonin", "IV (as printed)", "4–8 IU/kg intramuscular (IM) or SC every 6 to 12 hours for the first 48 hours only"],
            ["2. Inhibit bone resorption", "Pamidronate", "IV", "60 to 90 mg in 100–200 ml of saline or D5W over 2–4 hours as a single dose, repeated only after one week if necessary"],
            ["2. Inhibit bone resorption", "Zoledronic acid", "IV", "4 mg in 50 ml saline or D5W over 15–30 minutes as a single dose, repeated only after one week if necessary"],
            ["2. Inhibit bone resorption", "Denosumab", "SC", "60 mg weekly for 4 weeks, followed by 60 mg monthly"],
            ["3. Decrease intestinal absorption", "Glucocorticoids", "IV, oral", "Hydrocortisone 200–300 mg/day for 3–5 days; prednisolone 20–40 mg/day for additional 5–7 days"],
            ["4. Remove calcium directly", "Haemodialysis", "-", "Variable"],
          ],
          "Table 25.3 regimens",
          "The table lists calcitonin's route as IV while its regimen and the text give IM or SC."
        ),
        table(
          ["Treatment", "Onset of action", "Duration of action", "Adverse effects"],
          [
            ["Normal saline", "2–4 hours", "While infusing", "Volume overload, exacerbate congestive heart failure"],
            ["Furosemide", "Minutes to hours", "During therapy", "Dehydration, hypokalaemia, hypomagnesaemia, may aggravate renal failure if given before adequate rehydration"],
            ["Calcitonin", "4–6 hours", "2–3 days", "Flushing, nausea, hypersensitivity, rarely allergic reactions, tachyphylaxis"],
            ["Pamidronate", "1–3 days", "2–4 weeks", "Nephrotoxicity, transient flu-like syndrome with fever, chills, and aches"],
            ["Zoledronic acid", "1–3 days", "2–4 weeks", "Nephrotoxicity, transient flu-like syndrome with fever, chills, and aches"],
            ["Denosumab", "4–10 days", "1–4 months", "Prolonged hypocalcaemia, risk of infection, with long-term use risk of osteonecrosis of the jaw and atypical femoral fractures"],
            ["Glucocorticoids", "2–5 days", "Days to weeks", "Hyperglycaemia, hypertension, hypokalaemia, interfere with chemotherapy"],
            ["Haemodialysis", "Immediately", "During dialysis", "Not significant"],
          ],
          "Table 25.3 onset, duration and adverse effects"
        ),
        quote("200–300 mL/hour Initially, 100 to 150 mL/hour after rehydration for 1–5 days", "306"),
        quote("20–40 mg every 12–24 hours after correction of hypovolemia", "306"),
        quote("60 to 90 mg in 100–200 ml of saline or D5W over 2–4 hours as a single dose", "306"),
        quote("4 mg in 50 ml saline or D5W over 15–30 minutes as a single dose, repeated only after one week if necessary", "306"),
        quote("Hydrocortisone 200–300 mg/day for 3–5 days", "306"),
        quote("Prednisolone 20–40 mg/day for additional 5–7 days", "306"),
      ],
    },
    {
      id: "saline",
      title: "Saline hydration and furosemide",
      blocks: [
        steps([
          "Normal saline at 200-300 mL/hour to correct hypovolaemia: the first, most important and effective step in symptomatic hypercalcaemia. It increases natriuresis and urinary calcium excretion.",
          "Patients with severe dehydration may need 1 to 2 L in the emergency department to replace lost volume.",
          "The old advice of 4 to 6 L in the first 24 hours is no longer recommended.",
          "Once the deficit is corrected, adjust saline to maintain urine output at 100 to 150 mL/hour, with close monitoring for volume overload.",
          "With hypoalbuminaemia, cardiac disease or renal insufficiency, limit saline to 75 to 150 mL/hour and consider judicious furosemide.",
          "With metabolic acidosis, large-volume saline can worsen acidosis; the book calls PlasmaLyte an excellent choice (no calcium). Ringer lactate is usually avoided because it contains calcium (3 mEq/L).",
        ], "Isotonic saline"),
        points([
          "Routine furosemide with normal renal and cardiac function is not preferred: risk of volume depletion and electrolyte disturbance, and more specific therapies exist.",
          "Reserved for impaired renal or cardiac function with risk of fluid overload, and only after volume expansion; Table 25.3 gives 20–40 mg IV every 12–24 hours.",
          "Avoid thiazide diuretics: they impair urinary calcium excretion.",
        ], "Loop diuretic"),
        quote("administration of normal saline at a rate of 200-300 mL/hour to correct hypovolemia", "305"),
        quote("Hypercalcemic patients with severe dehydration may require 1 to 2 L of fluid in the ED to replace the volume lost", "305"),
        quote("the administration of 4 to 6 L of intravenous normal fluid in the first 24 hours was recommended", "305"),
        quote("limit the rate of saline infusion to 75 to 150 mL/ hour and consider the judicious use of furosemide", "306"),
        quote("Ringer lactate is usually avoided in treating hypercalcemia because it contains calcium (3 mEq/L).", "307"),
      ],
    },
    {
      id: "bone",
      title: "Calcitonin, bisphosphonates, denosumab",
      blocks: [
        points([
          "Inhibits osteoclasts and increases urinary calcium excretion. For urgent therapy of severe hypercalcaemia (>14 mg/dL) or an acute rise with life-threatening symptoms.",
          "Lowers calcium by no more than 1 to 2 mg/dL and is short-lived: never monotherapy; give with rehydration, as a bridge until bisphosphonates act.",
          "Dose: 4-8 IU/kg IM or SC every 6 to 12 hours. Injectable form preferred; nasal spray not recommended.",
          "Stop after 48 hours: tachyphylaxis after 24 to 48 hours.",
        ], "Calcitonin"),
        points([
          "First choice for severe hypercalcaemia, particularly of malignancy. Onset approximately 48 to 72 hours, so start early alongside volume resuscitation and calcitonin.",
          "IV pamidronate (30, 60, or 90 mg) or IV zoledronic acid (4 mg). Zoledronic acid is about 100 to 850 times more potent and is preferred.",
          "Usually avoided in milk-alkali syndrome (risk of prolonged hypocalcaemia); caution in premenopausal women.",
          "Moderate renal insufficiency: dose reduction and longer infusion are necessary (the book gives no reduced doses). Avoid in severe renal insufficiency. Monitor serum creatinine during therapy.",
        ], "Bisphosphonates"),
        points([
          "Monoclonal antibody against RANKL. Used in hypercalcaemia of malignancy when bisphosphonates fail, hypercalcaemia is refractory, or bisphosphonates are contraindicated (e.g. renal dysfunction).",
          "Not immediately acting. 60 mg SC weekly for 4 weeks, then 60 mg monthly.",
          "Gallium nitrate and plicamycin are no longer used because of toxicity.",
        ], "Denosumab"),
        quote("it can decrease serum calcium by no more than 1 to 2 mg/dL", "307"),
        quote("Dose and administration: 4-8 IU/ kg IM or SC every 6 to 12 hours.", "307"),
        quote("IV Pamidronate (30, 60, or 90 mg) or IV zoledronic acid (4 mg) are the two most widely used bisphosphonates", "307"),
        quote("In patients with moderate renal insufficiency (GFR >30 mL/minute), dose reduction and an increase in infusion duration are necessary", "308"),
        quote("The recommended dosage is 60 mg SC weekly for 4 weeks, followed by 60 mg monthly.", "308"),
      ],
    },
    {
      id: "absorption_dialysis",
      title: "Glucocorticoids, phosphate and dialysis",
      blocks: [
        points([
          "Reduce calcitriol, so lower intestinal calcium absorption. Effective in vitamin D intoxication, sarcoidosis and haematological malignancies (myeloma, leukaemia, Hodgkin's disease). No effect in primary hyperparathyroidism or solid tumours.",
          "Onset about 2-4 days; hydrocortisone 200-300 mg/day or prednisolone 20-40 mg/day, usually for about 3-7 days.",
          "Ketoconazole and hydroxychloroquine reduce calcitriol production and correct calcitriol-induced hypercalcaemia.",
          "Phosphate (oral or infusion) lowers calcium but is discouraged: risk of calcium phosphate deposition in tissues.",
        ], "Reducing absorption"),
        points([
          "Haemodialysis or peritoneal dialysis with a low-calcium dialysate: the most potent, effective and rapid method. Avoid calcium-free dialysate (haemodynamic instability).",
          "Urgent haemodialysis for: heart failure, impaired renal function or end-stage renal disease where saline is risky and diuretics ineffective; severe hypercalcaemia when medical therapy fails or is contraindicated; hypercalcaemic crisis with severe neurological or cardiovascular symptoms, alongside medical management.",
          "The effect is transient, so other medical measures must be given at the same time.",
        ], "Dialysis"),
        quote("the recommended dose is 200-300 mg/ day of hydrocortisone or 20-40 mg/day of prednisolone, and it is usually given for about 3-7 days", "308"),
        quote("Avoid using calcium-free dialysate in severe hypercalcemia as it can cause hemodynamic instability", "308"),
      ],
    },
    {
      id: "cause",
      title: "Treating the cause",
      blocks: [
        points([
          "Stop responsible drugs.",
          "Specific treatment of malignancy, thyrotoxicosis, adrenal insufficiency, rhabdomyolysis.",
          "Steroids for granulomatous disease (e.g. sarcoidosis) or lymphoma.",
          "Primary hyperparathyroidism: surgery is the only cure. Parathyroidectomy for all symptomatic patients and most asymptomatic patients with calcium more than 1 mg/dL above normal, age <50 years, or end-organ disease (renal stones, nephrocalcinosis, impaired renal function, fragility fractures or osteoporosis with T score >2.5 as printed).",
          "Cinacalcet (calcimimetic) for parathyroid carcinoma or primary hyperparathyroidism: start 30 mg once or twice daily orally, maximum 90 mg three to four times daily.",
          "Vitamin D toxicity: stop vitamin D, stop a calcium-rich diet, increase salt and fluid intake; severe cases may need saline, corticosteroids and a bisphosphonate.",
        ]),
        quote("serum calcium levels greater than 1 mg/dL above normal, age <50 years, or end-organ disease", "309"),
        quote("initiated at a dose of 30 mg once- or twice daily orally, with a maximum dose of 90 mg three-four times daily", "309"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring and cautions",
      blocks: [
        caution([
          "Watch for volume overload on saline, especially with heart, kidney or albumin problems.",
          "Do not give furosemide before adequate rehydration.",
          "Monitor serum creatinine on IV bisphosphonates.",
          "Calcitonin loses effect after 24 to 48 hours.",
          "Denosumab can cause prolonged hypocalcaemia.",
        ]),
        quote("As IV bisphosphonates may be nephrotoxic, serum creatinine level monitoring is recommended during therapy", "308"),
        quote("Calcitonin is discontinued after 48 hours because of the development of tachyphylaxis after 24 to 48 hours", "307"),
      ],
    },
  ],
};
