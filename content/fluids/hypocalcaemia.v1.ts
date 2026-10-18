import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPOCALCAEMIA — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 24 of the full edition. Every number below is the book's; quote pages are
 * printed book pages.
 */
export const hypocalcaemiaV1: FluidTopic = {
  id: "hypocalcaemia",
  version: "1.0.0",
  title: "Hypocalcaemia: diagnosis and correction",
  group: "electrolytes",
  summary: "Total, corrected and ionised calcium, the PTH-led work-up, IV calcium gluconate bolus and infusion, magnesium first when tetany persists, and long-term calcium and vitamin D.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["24 Hypocalcemia"], pages: "288–297", pageKind: "book" },
  sections: [
    {
      id: "physiology",
      title: "Calcium in the body",
      blocks: [
        points([
          "Calcium is essential for bone formation, neuromuscular function and blood coagulation.",
          "An adult body holds 1.2 to 1.4 kg of calcium (the text also prints 20 to 25 gm/kg): about 99% in bone, 1% in soft tissue cells and 0.15% in the ECF.",
          "Serum calcium is less than 1% of total body calcium, so it is a poor marker of total body calcium content.",
          "In the ECF: about 40% is protein bound (mainly albumin; not diffusible, not active); 50% is free ionised (diffusible and biologically active); 10% is complexed with anions such as phosphate, bicarbonate, citrate and lactate (diffusible but inactive).",
          "Dietary intake is about 1.0 to 1.3 gm/day in adults, of which 30%–35% is absorbed; excess is excreted in urine.",
        ]),
        table(
          ["Form", "Normal value"],
          [
            ["Total serum calcium", "8.5 to 10.5 mg/dL (4.3 to 5.2 mEq/L, 2.2 to 2.6 mmol/L)"],
            ["Ionised calcium", "4.3 to 5.3 mg/dL (2.2- 2.6 mEq/L, 1.16 to 1.31 mmol/L)"],
          ],
          "Normal ranges in three units",
          "Table 24.3 prints the ionised range as 1.1–1.3 mmol/L; the text gives 1.16 to 1.31 mmol/L."
        ),
        quote("The normal value is about 8.5 to 10.5 mg/dL (4.3 to 5.2 mEq/L, 2.2 to 2.6 mmol/L).", "288"),
        quote("its average standard value is 4.3 to 5.3 mg/dL (2.2- 2.6 mEq/L, 1.16 to 1.31 mmol/L)", "289"),
        quote("Out of this, about 99% is present in the bone, 1% in the soft tissue cells, and 0.15% in the extracellular fluid (ECF).", "288"),
      ],
    },
    {
      id: "corrected",
      title: "Corrected versus ionised calcium",
      blocks: [
        points([
          "Total calcium is affected by pH, protein and phosphate; hypoproteinaemia lowers total calcium while ionised calcium is unchanged, so hypocalcaemia may be wrongly diagnosed.",
          "Each 1 gm/dL fall in serum albumin lowers total calcium by about 0.8 mg/dL (0.4 mEq/L, 0.2 mmol/L).",
        ]),
        formula(
          "Corrected calcium",
          "Corrected calcium = measured total calcium + 0.8 × (4.0 − serum albumin)",
          [
            { symbol: "Measured total calcium", meaning: "Laboratory total serum calcium", unit: "mg/dL" },
            { symbol: "Serum albumin", meaning: "Laboratory serum albumin", unit: "gm/dL" },
            { symbol: "Corrected calcium", meaning: "Total calcium adjusted for albumin", unit: "mg/dL" },
          ],
          { calc: "corrected_calcium", note: "The book says current literature discourages this formula: it overestimates ionised calcium in hypoalbuminaemia, so hypocalcaemia is undertreated. When in a dilemma, measure ionised calcium." }
        ),
        quote("will reduce the total calcium concentration by approximately 0.8 mg/ dL (0.4 mEq/L, 0.2 mmol/L)", "289"),
        quote("Current literature discourages the use of corrected calcium in practice", "289"),
      ],
    },
    {
      id: "regulation",
      title: "Regulation",
      blocks: [
        points([
          "PTH raises calcium rapidly: renal calcium reabsorption, osteoclastic bone resorption, and conversion of vitamin D to calcitriol. Low calcium raises PTH by negative feedback.",
          "A rise in PTH gives hypercalcaemia and hypophosphataemia; a fall gives hypocalcaemia and hyperphosphataemia.",
          "Calcitriol raises calcium slowly but for longer, and is a potent suppressor of PTH.",
          "Calcitonin, from the thyroid parafollicular cells, lowers high calcium by reducing bone resorption.",
          "The calcium sensing receptor (CaSR) senses ionised calcium: high calcium suppresses PTH, low calcium promotes it.",
          "pH: acidosis increases ionised calcium; alkalosis decreases it, through calcium binding to albumin.",
          "Hyperphosphataemia binds calcium and lowers ionised calcium; hypomagnesaemia impairs PTH secretion and causes PTH resistance.",
        ]),
        table(
          ["Feature", "PTH", "1,25-dihydroxy vitamin D3", "Calcitonin"],
          [
            ["Stimulus for secretion", "Low Ca²⁺, high PHO₄, low calcitriol", "Low Ca²⁺ and PHO₄, low PTH", "High calcium"],
            ["Effect on serum calcium", "Increases rapidly", "Increases", "Decreases"],
            ["Effect on serum phosphorous", "Decreases", "Increases", "Decreases"],
            ["Effect on bones", "Increases bone resorption", "Increases bone resorption (weak effect)", "Decreases bone resorption"],
            ["Effect on intestine", "Increases production of calcitriol which indirectly increases intestinal Ca²⁺ and PHO₄ absorption", "Increases intestinal calcium and phosphorous absorption", "No direct effect"],
            ["Effect on kidney", "Increases urinary calcium reabsorption and decreases phosphorous reabsorption", "Increases urinary reabsorption of calcium and phosphorous (weak effect)", "Increases urinary excretion of Ca²⁺ and PHO₄"],
          ],
          "Table 24.1 Hormonal regulation of calcium and phosphorous"
        ),
      ],
    },
    {
      id: "definition",
      title: "Definition and severity",
      blocks: [
        points([
          "Hypocalcaemia: total serum calcium <8.5 mg/dL (<4.4 mEq/L or <2.2 mmol/L) with normal serum albumin, or ionised calcium <4.3 mg/dL (<2.2 mEq/L, <1.1 mmol/L).",
          "Common in critically ill patients; mild in most, life-threatening when severe.",
        ]),
        table(
          ["Calcium", "Normal mg/dL", "Normal mEq/L", "Normal mmol/L", "Mild–moderate mg/dL", "Mild–moderate mEq/L", "Mild–moderate mmol/L", "Severe mg/dL", "Severe mEq/L", "Severe mmol/L"],
          [
            ["Total", "8.5–10.5", "4.3–5.2", "2.2–2.6", "8.0–8.4", "4.0–4.2", "2.0–2.1", "<8.0", "<4.0", "<2.0"],
            ["Ionised", "4.3–5.3", "2.2–2.6", "1.1–1.3", "4.0–4.2", "2.0–2.1", "1.0–1.1", "<4.0", "<2.0", "<1.0"],
          ],
          "Table 24.3 Severity of hypocalcaemia",
          "Mild to moderate: weakness, paraesthesia, muscle cramps, tetany and mental changes. Severe: laryngeal spasms, seizures, bradycardia, hypotension and heart failure. The definition prints <4.4 mEq/L for total calcium while the normal range starts at 4.3 mEq/L, and the text gives mild to moderate ionised calcium as 4-4.5 mg/dL against 4.0–4.2 in the table; both are kept as printed."
        ),
        quote("Hypocalcemia is defined as total serum calcium <8.5 mg/dL (<4.4 mEq/L or <2.2 mmol/L) with normal serum albumin", "291"),
      ],
    },
    {
      id: "etiology",
      title: "Causes",
      blocks: [
        table(
          ["Group", "Causes"],
          [
            ["1. Hypoalbuminaemia", "Hypoalbuminaemia"],
            ["2. Hypoparathyroidism", "Postoperative/surgical (hungry bone syndrome); post-radiation, infiltrative; functional in hypomagnesaemia; autoimmune destruction, congenital, idiopathic"],
            ["3. Inadequate vitamin D", "Vitamin D deficiency (nutritional, lack of exposure to sunlight); malnutrition and malabsorption syndrome; liver disease, chronic kidney disease"],
            ["4. Resistance to vitamin D", "Vitamin D resistance rickets"],
            ["5. Redistribution, complexation or deposition of calcium", "Multiple red blood transfusions; acute pancreatitis, rhabdomyolysis, fat embolism, tumour lysis syndrome; hyperphosphataemia; sodium bicarbonate infusion, respiratory alkalosis"],
            ["6. Miscellaneous", "Sepsis, burns; drugs: bisphosphonate, denosumab, cisplatin, cinacalcet, phenobarbitone, phenytoin, and parenteral phosphate administration"],
          ],
          "Table 24.2 Causes of hypocalcaemia"
        ),
        points([
          "Hungry bone syndrome, after parathyroidectomy or thyroid surgery: rapid, profound and prolonged hypocalcaemia with hypophosphataemia and hypomagnesaemia, as osteoclastic resorption stops while osteoblasts keep taking up calcium.",
          "Vitamin D deficiency: poor intake, malabsorption or little sunlight; in renal or hepatic failure, poor conversion to calcitriol.",
          "Acute pancreatitis: free fatty acids from autodigested mesenteric fat bind calcium.",
        ]),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      blocks: [
        points([
          "Symptoms depend on the ionised calcium and the rate of onset, from neuromuscular excitability.",
          "Mild to moderate acute (ionised 4-4.5 mg/dL or 1-1.12 mmol/L): weakness, circumoral and distal paraesthesia, cramps, tetany, irritability, depression, psychosis.",
          "Severe acute (ionised <4 mg/dL [<1 mmol/L]): lethargy, confusion, laryngeal spasm, seizures, bradycardia, hypotension refractory to fluids and vasopressors, reversible heart failure. Hypocalcaemia can reduce the efficacy of digoxin.",
          "Chronic: mostly asymptomatic; fatigue, irritability, anxiety, depression, dry skin, cataract, osteopenia/osteoporosis.",
          "Signs: brisk tendon reflexes, latent tetany. Trousseau's sign (carpopedal spasm) is more specific than Chvostek's.",
          "Chvostek's sign: facial twitch on gentle tapping of the facial nerve about 2 cm anterior to the earlobe, below the zygomatic arch, mouth slightly open.",
          "Trousseau's sign: wrist and MCP flexion with hyperextended fingers when a BP cuff is inflated above systolic pressure for 3 minutes.",
          "ECG: prolonged QT (long ST segment) in severe hypocalcaemia.",
        ]),
        quote("Severe acute hypocalcemia (ionized serum calcium <4 mg/dL [<1 mmol/L]) may cause lethargy", "292"),
        quote("inflated above systolic pressure for 3 minutes to occlude the brachial artery", "292"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnostic approach",
      blocks: [
        steps([
          "History and examination: sun exposure, nutrition, low-calcium diet, renal or liver failure, chronic diarrhoea or intestinal disease, family history, and thyroid or parathyroid surgery. Look for neck scarring, hypotension, bony changes.",
          "Confirm true hypocalcaemia by ionised calcium, or by correcting total calcium for albumin.",
          "Measure PTH: low or inappropriately normal PTH with hypocalcaemia is diagnostic of hypoparathyroidism; high PTH points to acute or chronic kidney disease, vitamin D deficiency or pseudohypoparathyroidism.",
          "Measure phosphate, magnesium and vitamin D status.",
          "Check liver and renal function; further tests as history and examination suggest.",
        ], "Five steps"),
        points([
          "Low magnesium with normal–low PTH: hypomagnesaemia.",
          "High phosphate with low PTH: hypoparathyroidism.",
          "High PTH with high creatinine: CKD; with low vitamin D: vitamin D deficiency; with normal vitamin D: pseudohypoparathyroidism.",
        ], "Figure 24.1 Approach to hypocalcaemia"),
        table(
          ["Test", "Value", "Interpretation"],
          [
            ["Albumin", "Low", "Calculate corrected calcium"],
            ["PTH", "Low", "Hypoparathyroidism, calcium-sensing defect (rare)"],
            ["PTH", "N-Low", "Hypomagnesaemia"],
            ["PTH", "High", "Vitamin D deficiency or resistance, chronic kidney disease, pseudohypoparathyroidism"],
            ["Phosphate", "High", "Hypoparathyroidism, rhabdomyolysis, tumour lysis, or renal failure"],
            ["Phosphate", "Low", "Severe malnutrition, vitamin D deficiency"],
            ["Magnesium", "Low", "Hypomagnesaemia"],
            ["Magnesium", "High", "Renal failure"],
            ["Vitamin D", "Low", "Vitamin D deficiency or inadequate vitamin D activation (e.g., renal failure, hypoparathyroidism)"],
            ["Creatinine", "High", "Renal failure"],
            ["Alkaline phosphatase", "High", "Osteomalacia, rickets, or osteoblastic bone metastases"],
            ["Lipase", "High", "Pancreatitis"],
            ["CPK", "High", "Rhabdomyolysis"],
            ["pH", "High", "Alkalosis decreases ionised calcium"],
          ],
          "Table 24.4 Diagnosis of the aetiology of hypocalcaemia",
          "Other investigations: liver functions, 24-hour urinary calcium and phosphate, ECG, skeletal X-rays, renal ultrasonography, and bone mineral density by DXA."
        ),
        table(
          ["Condition", "PTH", "Phosphate", "Magnesium", "Vitamin D"],
          [
            ["Hypoparathyroidism", "Low", "High", "Normal", "Normal"],
            ["Hypomagnesaemia", "Normal-low", "Normal", "Low", "Normal"],
            ["Vitamin D deficiency", "High", "Normal", "Normal", "Low"],
            ["Chronic kidney disease (high creatinine)", "High", "High", "Normal-high", "Normal-low"],
            ["Pseudohypoparathyroidism (PTH resistant)", "High", "High", "Normal-high", "Normal-low"],
          ],
          "Table 24.5 Differential diagnosis of low ionised calcium"
        ),
      ],
    },
    {
      id: "acute",
      title: "Acute symptomatic hypocalcaemia",
      intro: "Severe symptomatic hypocalcaemia (tetany, seizures, laryngospasm, arrhythmias, refractory hypotension, ionised calcium <4 mg/dL [<1 mmol/L]) is treated as an emergency.",
      blocks: [
        steps([
          "Bolus: 10–20 ml of 10% calcium gluconate mixed in 50–100 mL of D5W (or normal saline), slowly over 10 minutes, with ECG monitoring.",
          "The bolus raises calcium for 2 to 3 hours only, so follow it with a continuous infusion to prevent rebound hypocalcaemia.",
          "Infusion: add 11 ampoules (110 ml) of 10% calcium gluconate (990 mg elemental calcium) to 900 ml of D5W or normal saline; the drip carries 1 mg/ml.",
          "Run at 0.5 mg to 1.5 mg/kg/hour in symptomatic patients; rapid infusion risks hypotension, bradycardia and arrhythmias.",
          "Check calcium every 4 to 6 hours and adjust the rate: relieve symptoms but keep serum calcium low-normal (8.0–8.5 mg/dL), especially in hypoparathyroidism, to limit hypercalciuria. Ionised calcium is the gold standard for monitoring.",
        ]),
        quote("Administer 10–20 ml of 10% calcium gluconate mixed in 50–100 mL of D5W (or normal saline) slowly over 10 minutes", "294"),
        quote("raises serum calcium for 2 to 3 hours only", "295"),
        quote("The calcium concentration of the drip will be 1 mg/ml.", "295"),
        quote("may be infused at a rate of 0.5 mg to 1.5 mg/kg/hour", "295"),
        quote("keep the serum calcium at the low-normal range (8.0–8.5 mg/dL)", "295"),
      ],
    },
    {
      id: "preparations",
      title: "Elemental calcium per preparation",
      blocks: [
        table(
          ["Preparation", "Elemental calcium", "Notes in the text"],
          [
            ["10% calcium gluconate, 10 ml ampoule", "1 gm or 90 mg elemental calcium per 10 ml", "Preferred and routinely used for symptomatic hypocalcaemia"],
            ["10% calcium chloride, 10 ml ampoule", "273 mg, 13.6 mEq, or 6.80 mmol per 10 ml", "Three times the elemental calcium of gluconate; highly irritant, unsuitable for a peripheral vein"],
          ],
          "IV calcium"
        ),
        quote("Each ampule of 10% calcium gluconate injection provides 1 gm or 90 mg elemental calcium per 10 ml.", "295"),
        quote("Each ampule of 10% calcium chloride injection provides 273 mg", "296"),
      ],
    },
    {
      id: "transfusion",
      title: "Massive transfusion",
      blocks: [
        points([
          "Citrate in blood products chelates calcium; severity tracks the number of packed red cells given.",
          "4 units of packed red cells plus FFP carries a significantly higher risk of severe hypocalcaemia.",
          "The optimal strategy is uncertain; common practice is 10 ml of 10% calcium gluconate after every 2-4 units of blood products.",
        ]),
        quote("infuse 10 ml of 10% calcium gluconate after transfusing every 2-4 units of blood products", "296"),
      ],
    },
    {
      id: "precautions",
      title: "Precautions with IV calcium",
      blocks: [
        caution([
          "Digitalis: continuous ECG monitoring during calcium infusion, as hypercalcaemia aggravates digitalis toxicity and may provoke life-threatening arrhythmias.",
          "Severe hyperphosphataemia (>6.5 mg/dL): avoid calcium, as the raised calcium-phosphorus product precipitates in soft tissues. In tumour lysis syndrome, avoid calcium or give it cautiously.",
          "Metabolic acidosis with hypocalcaemia (e.g. CKD): correct hypocalcaemia before acidosis, since correcting acidosis lowers ionised calcium.",
          "Do not coadminister calcium with bicarbonate-containing solutions: calcium carbonate may precipitate.",
          "Calcium chloride is highly irritant and unsuitable for infusion through a peripheral vein.",
        ]),
        quote("Avoid the administration of calcium in patients with severe hyperphosphatemia (>6.5 mg/ dL)", "296"),
      ],
    },
    {
      id: "magnesium",
      title: "Magnesium correction",
      intro: "If IV calcium fails to correct hypocalcaemia or relieve tetany, rule out hypomagnesaemia.",
      blocks: [
        steps([
          "If serum magnesium is <1.7 mEq/L: magnesium sulfate 2 gm (16 mEq) IV as a 10% solution over 10-15 minutes.",
          "Then 1 gm (8 mEq) in 100 ml infusion per hour to raise serum magnesium to normal.",
          "2 ml of 50% magnesium sulfate injection is one gram, or 8 mEq.",
        ]),
        quote("administer 2 gm (16 mEq) of magnesium sulfate intravenously as a 10% solution over 10-15 minutes", "296"),
        quote("followed by 1 gm (8 mEq) in 100 ml infusion per hour", "296"),
        quote("2 ml of Injection 50% Magnesium Sulfate is equivalent to one gram or 8 mEq", "296"),
      ],
    },
    {
      id: "chronic",
      title: "Long-term calcium and vitamin D",
      blocks: [
        points([
          "Asymptomatic chronic mild hypocalcaemia (ionised calcium >0.8 mmol/L): 1 to 3 gm per day of oral elemental calcium in 2-3 divided doses, best absorbed between meals.",
          "Calcium carbonate is cheaper and well tolerated; calcium citrate has better bioavailability at higher cost.",
          "Replace vitamin D when 25 hydroxyvitamin D is <20 ng/ml.",
          "Ergocalciferol 50,000 IU weekly or monthly to correct the deficit, then 1,000-2,000 IU daily as maintenance. Onset is slow (about two weeks); fat storage carries a higher risk of vitamin D intoxication.",
          "Calcitriol is preferred with abnormal vitamin D metabolism (renal or liver disease): 0.25-1.0 mcg/day orally. It is the most potent and fastest acting, shortest acting, with no risk of intoxication, but costs more.",
        ]),
        quote("needs 1 to 3 gm per day of oral elemental calcium in 2-3 divided doses", "296"),
        quote("Vitamin D should be replaced when the level of 25 hydroxyvitamin D is <20 ng/ml.", "297"),
        quote("followed by 1,000-2,000 IU daily supplementation as a maintenance dose", "297"),
        quote("recommended dose of oral calcitriol is 0.25-1.0 mcg/day", "297"),
      ],
    },
    {
      id: "hypoparathyroidism",
      title: "Underlying cause and hypoparathyroidism",
      blocks: [
        points([
          "Identifying and treating the underlying cause is an essential part of treatment.",
          "Hypoparathyroidism: calcium and vitamin D are first-line; choose calcitriol or alfacalcidol rather than ergocalciferol or cholecalciferol.",
          "Additional measures: thiazide diuretics, phosphate binders, and a low-salt, low-phosphorus diet.",
          "If conventional therapy fails, recombinant human PTH (1-84) improves quality of life, but is limited by cost, a black box warning for osteosarcoma, and availability.",
        ]),
      ],
    },
  ],
};
