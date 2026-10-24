import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPERPHOSPHATAEMIA — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 27 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const hyperphosphataemiaV1: FluidTopic = {
  id: "hyperphosphataemia",
  version: "1.0.0",
  title: "Hyperphosphataemia: causes, work-up and management",
  group: "electrolytes",
  summary: "High phosphate: the four groups of causes, the calcium-phosphate product, the stepwise work-up, and acute and chronic management with diet, phosphate binders and dialysis.",
  setting: "Adult medical and surgical wards, CKD and dialysis patients",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["27 Hyperphosphatemia"], pages: "321–325", pageKind: "book" },
  sections: [
    {
      id: "definition",
      title: "Definition",
      blocks: [
        points([
          "Hyperphosphataemia: serum phosphate greater than 4.5 mg/dL (1.45 mmol/L) in adults.",
          "Renal excretion of phosphate is very effective, so a person with normal renal function is unlikely to develop it from increased intake.",
          "Rare in the general population; common in later stages of CKD with significantly impaired kidney function.",
        ]),
        quote("Hyperphosphatemia is defined as serum phosphate concentration greater than 4.5 mg/dL (1.45 mmol/L) in adults.", "321"),
      ],
    },
    {
      id: "causes",
      title: "Causes",
      intro: "The book classifies the causes into four groups by mechanism.",
      blocks: [
        table(
          ["Group", "Causes"],
          [
            ["1. Decreased renal phosphate excretion", "Impaired renal excretion: AKI or CKD with significant renal impairment, the most common cause. Increased renal tubular reabsorption: hypoparathyroidism, vitamin D toxicity, acromegaly or thyrotoxicosis"],
            ["2. Transcellular shift from ICF to ECF", "Extensive cell destruction: rhabdomyolysis, tumour lysis syndrome, massive haemolysis. Severe acidosis: severe lactic acidosis, diabetic acidosis, respiratory acidosis. Lack of insulin: diabetic ketoacidosis (before treatment)"],
            ["3. Acute massive phosphate load", "Phosphate-containing laxatives or enemas; IV or oral phosphate administration"],
            ["4. Spurious (printed \"pseudohypophosphatemia\")", "Falsely elevated phosphate from laboratory artefact (interference in the phosphate assay); relatively rare. Seen with hyperglobulinaemia (e.g. multiple myeloma), hyperlipidaemia, hyperbilirubinaemia, and certain medications (e.g. amphotericin B and heparin)"],
          ],
          "Etiology of hyperphosphataemia",
          "The book's heading for group 4 reads \"Spurious or pseudohypophosphatemia\", though the text describes falsely elevated phosphate."
        ),
        quote("Acute kidney injury (AKI) or chronic kidney disease with significant renal impairment are the most common cause of hyperphosphatemia [2].", "321"),
        quote("The falsely elevated phosphate levels due to laboratory artifact (interference in phosphate assay) is a relatively rare condition", "322"),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      intro: "Hyperphosphataemia itself is usually asymptomatic; presenting symptoms come from the following.",
      blocks: [
        points([
          "Hypocalcaemia: a common reason for presentation, causing weakness, muscle cramps, paraesthesia, tetany, positive Chvostek's and Trousseau's signs, laryngospasm, confusion and seizure.",
          "Metastatic calcification: in a few patients with severe chronic hyperphosphataemia, a high calcium-phosphate product raises the risk of calciphylaxis (precipitation of calcium phosphate in tissues), with soft-tissue and small-vessel calcification causing cutaneous necrosis and skin ulceration.",
          "In CKD, untreated chronic hyperphosphataemia risks secondary hyperparathyroidism, renal osteodystrophy and metastatic calcification.",
          "More commonly, the patient presents with symptoms of the underlying condition that causes the hyperphosphataemia.",
        ]),
        formula(
          "Calcium-phosphate product",
          "Ca²⁺ × Pi (both in mg/dL)",
          [
            { symbol: "Ca²⁺", meaning: "Total serum calcium", unit: "mg/dL" },
            { symbol: "Pi", meaning: "Serum phosphate", unit: "mg/dL" },
          ],
          { note: "Above 70 mg²/dL² the risk of calciphylaxis is high (p322). The binder section (p324) uses a different cut-off, Ca²⁺-Phos product >66, for avoiding calcium-based binders. Both are printed." }
        ),
        quote("Multiplication of the total calcium and phosphate (measured in mg/dL) determines the calcium-phosphate product.", "322"),
        quote("When the serum calcium-phosphorus product (Ca2+ × Pi) is above 70 mg2/dL2, the risk of calciphylaxis is high.", "322"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis",
      blocks: [
        steps([
          "History and physical examination: provide the clue to the underlying cause in many cases.",
          "Measure serum creatinine first to assess renal function, as renal failure is the most common cause. If creatinine is high, work up to differentiate AKI from CKD.",
          "Further investigations if the diagnosis is unclear and for complete assessment (table below).",
        ]),
        table(
          ["Test", "What it shows"],
          [
            ["Complete blood count", "Low haemoglobin in CKD and haemolysis"],
            ["Electrolytes", "Associated electrolyte disturbances"],
            ["Blood glucose", "Diabetic ketoacidosis"],
            ["Serum calcium", "High in vitamin D intoxication (high Ca²⁺, high PO₄, low PTH). Low in hypoparathyroidism (low Ca²⁺, high PO₄, low PTH) and CKD (low Ca²⁺, high PO₄, high PTH)"],
            ["Vitamin D", "High in vitamin D intoxication (high PO₄, high Ca²⁺, low PTH)"],
            ["PTH", "Low in hypoparathyroidism (low PTH, high PO₄, low Ca²⁺); high in CKD (high PTH, high PO₄, low Ca²⁺)"],
            ["Uric acid", "Tumour lysis syndrome: hyperuricaemia, hyperphosphataemia, hypocalcaemia and hyperkalaemia"],
            ["Creatine kinase (printed \"Creatinine kinase\")", "High in rhabdomyolysis"],
            ["Lactate dehydrogenase", "High in haemolysis"],
            ["Fractional phosphate excretion", ">15%: excess phosphate load (e.g. rhabdomyolysis, phosphate-containing laxative or enema, phosphate toxicity). <15%: impaired renal excretion (e.g. renal failure, hypoparathyroidism, ECF volume depletion, tumoral calcinosis)"],
            ["X-ray studies", "Defective bone development in chronic hyperphosphataemia; metastatic calcifications"],
            ["ECG", "Prolonged QT interval, a common ECG change in hypocalcaemia"],
          ],
          "Step 3: further investigations",
          "The book writes phosphate as PHO4 in this list."
        ),
        quote("Measure serum creatinine level first to assess renal function, as renal failure is the most common cause of hyperphosphatemia.", "322"),
        quote("Increased fractional excretion of phosphate (>15%) suggests excess phosphate load", "323"),
        quote("its decreased value (<15%) suggests impaired renal excretion of phosphate", "323"),
      ],
    },
    {
      id: "underlying",
      title: "Management: treat the underlying cause",
      intro: "Treatment is planned by etiology, severity, rapidity of onset and kidney function.",
      blocks: [
        points([
          "Treating the cause is the most important and effective measure; often no other therapy is needed (e.g. in diabetic ketoacidosis hyperphosphataemia usually improves rapidly with insulin and correction of the metabolic acidosis).",
          "Search for and remove exogenous phosphate supplementation of any form.",
        ]),
        quote("it is important to search for and remove exogenous phosphate supplementation of any form.", "323"),
      ],
    },
    {
      id: "acute",
      title: "Acute hyperphosphataemia",
      intro: "With normal renal function it usually resolves within 6 to 12 hours. In acute severe hyperphosphataemia with intact kidney function, measures to increase renal phosphate excretion are:",
      blocks: [
        points([
          "Saline infusion: extracellular volume expansion with IV normal saline can increase urinary phosphate excretion significantly.",
          "Loop diuretics: concomitant use helps renal phosphate excretion.",
          "Acetazolamide: also helps increase urinary phosphate excretion.",
          "Haemodialysis: the most effective therapy with severely impaired renal function from conditions such as rhabdomyolysis or tumour lysis syndrome when conservative measures fail. Also indicated in severe symptomatic acute hypocalcaemia, where injected calcium risks widespread soft-tissue calcification in the presence of high phosphate.",
        ]),
        caution([
          "Severe symptomatic acute hypocalcaemia with high phosphate: treatment with injected calcium carries the risk of widespread soft-tissue calcification; the book indicates haemodialysis here.",
        ]),
        quote("In patients with normal renal function, hyperphosphatemia usually resolves within 6 to 12 hours.", "323"),
        quote("where treatment with injected calcium carries the risk of widespread soft tissue calcification in the presence of high phosphate levels.", "323"),
        points([
          "The chapter prints no dose, volume or rate for saline, loop diuretics or acetazolamide.",
        ], "Not printed"),
      ],
    },
    {
      id: "chronic",
      title: "Chronic hyperphosphataemia: diet",
      blocks: [
        points([
          "Common in CKD and in CKD patients on haemodialysis; needs attention for the risk of cardiovascular morbidity and mortality, vascular calcification (printed \"vascular classification\"), secondary hyperparathyroidism and hospitalisation.",
          "KDOQI (2020) and KDIGO (2017) recommend dietary phosphate restriction, phosphate binders and dialysis therapy.",
          "Restricting phosphate intake to about 800 to 1000 mg/d is frequently the first and important step.",
          "Avoid phosphorus-rich food: milk and dairy (cheese, cottage cheese, ice cream), meat (especially organ meats), whole grains, processed foods, and carbonated beverages containing phosphoric acid.",
        ]),
        quote("Restricting phosphate intake to about 800 to 1000 mg/d in the diet is frequently the first and important step", "324"),
      ],
    },
    {
      id: "binders",
      title: "Oral phosphate binders",
      intro: "Binders reduce absorption of dietary phosphate from the gut. They are indicated when hyperphosphataemia increases persistently or progressively despite dietary restriction. Choice depends on serum calcium, cost, pill burden, iron stores, tolerability and side-effect profile.",
      blocks: [
        table(
          ["Binder", "Advantages", "Drawbacks"],
          [
            ["Calcium acetate, calcium carbonate (calcium-containing)", "Most widely used; effective when given with meals", "Risk of hypercalcaemia and vascular calcification"],
            ["Sevelamer (calcium-free)", "Corrects phosphate as well as calcium binders; no risk of hypercalcaemia; reduction in cardiovascular mortality; lowers total and LDL cholesterol; prevents and improves vascular calcification", "High cost, increased pill burden, GI intolerance (nausea, constipation); a recent large study failed to show cardiovascular or all-cause mortality benefit in dialysis and non-dialysis CKD"],
            ["Lanthanum carbonate (non-calcium; chewable tablet)", "Low pill burden; high efficacy (roughly twice as potent as calcium and sevelamer); less over-suppression of PTH", "Relatively high cost; possible toxicity from accumulation; no superiority for cardiovascular events (2021 trial showed no difference against calcium carbonate)"],
            ["Aluminium hydroxide (aluminium-containing)", "Effective and well tolerated", "Prolonged use avoided: aluminium toxicity causing adynamic bone disease, encephalopathy, microcytic anaemia and premature death"],
            ["Others: sucroferric oxyhydroxide, ferric citrate, nicotinic acid and nicotinamide, tenapanor, magnesium carbonate", "Also used as phosphate binders", "None printed"],
          ],
          "Phosphate binders"
        ),
        caution([
          "Calcium-based binders: avoid in hypercalcaemia, vitamin D intoxication, and Ca²⁺-Phos product >66.",
          "Aluminium hydroxide: prolonged use is avoided because of aluminium toxicity.",
        ]),
        quote("so avoid it in patients with hypercalcemia, vitamin D intoxication, and Ca2+-Phos product >66.", "324"),
        quote("high efficacy (roughly twice as potent as calcium and sevelamer)", "324"),
        quote("its prolonged use is currently avoided due to the risk of aluminum toxicity", "325"),
        points([
          "The chapter prints no binder doses.",
        ], "Not printed"),
      ],
    },
    {
      id: "rrt",
      title: "Renal replacement therapies",
      blocks: [
        points([
          "In CKD-ESRD on maintenance dialysis, conventional haemodialysis and peritoneal dialysis both remove phosphate, but standard dialysis is inadequate to bring serum phosphate into the normal range.",
          "For effective removal and better control: increased frequency and duration of haemodialysis, or a modality such as haemodiafiltration.",
        ]),
        quote("removing excess phosphate by standard dialysis therapy is inadequate to reduce serum phosphate concentration in the normal range.", "325"),
      ],
    },
  ],
};
