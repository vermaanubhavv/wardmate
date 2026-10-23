import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * METABOLIC ALKALOSIS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 32 of the full edition, from a text transcription (no page images).
 * Page numbers are the printed book pages. Every number below is the book's; the quotes give
 * the page it came from.
 */
export const metabolicAlkalosisV1: FluidTopic = {
  id: "metabolic_alkalosis",
  version: "1.0.0",
  title: "Metabolic alkalosis",
  group: "acid_base",
  summary: "Raised HCO3 with high pH: how it is generated and maintained, urinary chloride and blood pressure to find the cause, the compensation and anion-gap checks, and saline-responsive and saline-resistant treatment, including the book's HCl and acetazolamide figures.",
  setting: "Adult medical and surgical wards and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["32 Metabolic Alkalosis"], pages: "382–390", pageKind: "book" },
  sections: [
    {
      id: "definition",
      title: "Definition",
      blocks: [
        points([
          "The most common acid–base disorder, typically developing after admission in the critically ill rather than being present on arrival, unlike metabolic acidosis.",
          "A primary rise in serum HCO3 above 26 mEq/L with pH above 7.45 and a compensatory rise in PaCO2 from alveolar hypoventilation.",
          "Hypochloraemia and hypokalaemia are the electrolyte disturbances commonly encountered with it.",
          "Compensatory hypoventilation is slow compared with the hyperventilation of metabolic acidosis, and it is limited by hypoxia: severe hypoxia (PO2 below 60 mmHg) is a potent stimulus to breathe and offsets the compensation.",
          "Chronic respiratory acidosis also shows a raised HCO3 and raised PaCO2; the differentiating feature is a low pH.",
        ]),
        quote("Increased serum HCO₃ (>26 mEq/L), with high pH (>7.45), confirms the diagnosis of metabolic alkalosis.", "386"),
        quote("severe hypoxia (PO, <60 mm Hg) is a potent stimulus to increase alveolar ventilation", "382"),
      ],
    },
    {
      id: "pathogenesis",
      title: "Pathogenesis: generation and maintenance",
      intro: "Two distinct phases sustain a metabolic alkalosis: something generates the rise in HCO3, and something stops the kidney excreting it.",
      blocks: [
        table(
          ["Generation factors", "Maintenance factors"],
          [
            ["GI loss of H⁺ ion", "Hypovolaemia"],
            ["Renal loss of H⁺ ion", "Hypochloraemia"],
            ["Exogenous HCO3 load", "Hypokalaemia"],
            ["Endogenous alkali gain", "Aldosterone excess"],
            ["Hypokalaemia", "Reduced GFR/kidney failure"],
            ["Post-hypercapnic", "—"],
          ],
          "Table 32.1 Generation and maintenance factors of metabolic alkalosis",
          "The maintenance column has five entries against six generation factors; the last cell is left blank in the book."
        ),
        points([
          "GI loss of H⁺: vomiting, nasogastric suction, congenital chloride-losing diarrhoea.",
          "Renal loss of H⁺: diuretics, primary hyperaldosteronism, Bartter syndrome, Gitelman syndrome.",
          "Exogenous HCO3 load: HCO3 administration, balanced crystalloids containing buffers, blood products with citrate as anticoagulant, milk-alkali syndrome.",
          "Endogenous alkali gain: rebound alkalosis in the recovery phase of diabetic ketoacidosis or lactic acidosis.",
          "Hypokalaemia: urinary potassium loss is driven by volume-depletion aldosterone or mineralocorticoid excess; K⁺ moves out of cells and H⁺ moves in to keep electroneutrality, producing alkalosis.",
          "Post-hypercapnic: chronic hypercapnia raises bicarbonate in compensation; when mechanical ventilation starts, CO2 falls quickly but bicarbonate falls slowly, leaving an alkalosis.",
        ], "Generation"),
        points([
          "Normally excess bicarbonate is rapidly excreted in the urine; the alkalosis persists when the kidneys fail to eliminate it.",
          "Hypovolaemia: less HCO3 is filtered (ECF contraction) and more is reabsorbed in the proximal and distal tubules.",
          "Hypochloraemia: less chloride reaches the collecting tubules, limiting bicarbonate excretion and raising reabsorption, even without volume depletion.",
          "Hypokalaemia (volume-depleted or volume-expanded): drives H⁺ into cells; stimulates the apical H⁺/K⁺ ATPase in the collecting duct (K⁺ reabsorbed, H⁺ secreted); stimulates renal ammoniagenesis with new HCO3 generation; raises proximal reabsorption of filtered HCO3.",
          "Aldosterone excess or increased mineralocorticoid activity: sodium reabsorbed in exchange for K⁺ and H⁺ secretion, so more bicarbonate is reabsorbed; the K⁺ secretion adds hypokalaemia.",
          "Reduced GFR/kidney failure: less HCO3 is filtered.",
        ], "Maintenance"),
      ],
    },
    {
      id: "etiology",
      title: "Causes: saline-responsive and saline-resistant",
      intro: "The most important causes are loss of gastric secretions (e.g. vomiting), diuretics, hypokalaemia and aldosterone excess. ECF volume, blood pressure, urinary chloride and serum potassium point to the cause; urinary chloride splits it into two groups.",
      blocks: [
        table(
          ["Group", "Urinary chloride", "Volume / blood pressure", "Causes in the figure"],
          [
            ["Saline responsive", "Low (<20 mEq/L)", "ECF volume depletion", "Vomiting/gastric suction; diuretics; hypercapnia correction"],
            ["Saline responsive", "Low (<20 mEq/L)", "No ECF volume depletion", "NaHCO3 infusion (printed \"NaHCO₂\"); balanced salt solution; multiple transfusion(s)"],
            ["Saline resistant", "High (>20 mEq/L)", "Normal or increased ECF volume, hypertensive", "Hyperaldosteronism; Cushing syndrome; renal artery stenosis"],
            ["Saline resistant", "High (>20 mEq/L)", "Normal or increased ECF volume, normotensive or hypotensive", "Severe K⁺ depletion; Bartter syndrome (printed \"Barter's\"); Gitelman syndrome; recent use of diuretics"],
          ],
          "Figure 32.1 Approach to metabolic alkalosis",
          "The figure reached the transcript as scattered labels. Which causes sit under \"ECF volume depletion\" and which under \"No ECF volume depletion\" is this digest's reading of the layout; check it against the book's figure."
        ),
        points([
          "Saline-responsive is the more common form, usually with signs of extracellular volume contraction (contraction alkalosis); most often from loss of gastric secretions and diuretic therapy. Hypotension, orthostatic fall in blood pressure and hypokalaemia are the commonest associated features.",
          "Saline-resistant is less common and comes with euvolaemia or hypervolaemia. Blood pressure separates its causes.",
          "With hypertension it suggests RAAS overactivity: plasma renin and aldosterone separate hyperaldosteronism, Cushing syndrome and renal artery stenosis.",
          "Without hypertension (less common), think of Bartter syndrome, Gitelman syndrome, severe potassium depletion or recent diuretic use.",
        ]),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      blocks: [
        points([
          "Rarely causes specific manifestations; features vary with severity and usually come from the underlying cause or the associated volume, potassium or magnesium depletion.",
          "High pH binds calcium to albumin, giving hypocalcaemia and neuromuscular symptoms.",
          "Mild to moderate (serum HCO3 <40 mEq/L, pH <7.50): usually asymptomatic. Severe (serum HCO3 >45 mEq/L, pH >7.55): symptoms become evident. The book gives no band for HCO3 40–45 mEq/L.",
          "CNS: from hypocalcaemia-driven neuromuscular excitability: paraesthesia, light-headedness (printed \"light headache\"), tetany, carpopedal spasm, confusion, seizures.",
          "CVS: hypotension and arrhythmias, usually from hypovolaemia, hypokalaemia and hypomagnesaemia rather than the alkalaemia itself.",
          "Respiratory: in moderate to severe alkalosis, compensatory hypoventilation may cause hypoxia in pre-existing lung disease, and can impair weaning and make extubation difficult.",
          "Other: weakness, muscle cramps and postural dizziness from hypovolaemia; muscle weakness and polyuria from hypokalaemia. Can precipitate hepatic encephalopathy in susceptible people by raising ammonia production.",
        ]),
        quote("(serum HCO₃ <40 mEq/L, pH <7.50) are usually asymptomatic", "385"),
        quote("is severe (serum HCO₃ >45 mEq/L, pH >7.55)", "385"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis: confirm it and find the cause",
      intro: "Three steps: confirm the diagnosis, establish the cause, and identify coexisting acid–base disorders.",
      blocks: [
        steps([
          "Confirm: raised serum HCO3 (>26 mEq/L) with high pH (>7.45). Primary respiratory acidosis also raises PaCO2 (and HCO3), but its pH is low. Always obtain a blood gas: arterial is the gold standard, venous a convenient, acceptable alternative.",
          "History: often gives the cause; when unclear, evaluate stepwise.",
          "Examination: hypertension and ECF volume status, especially postural changes in pulse and blood pressure.",
          "Laboratory: serum potassium, sodium, chloride, calcium, magnesium, BUN and creatinine; then urinary chloride, plasma renin and aldosterone.",
          "Urinary chloride below 20 mEq/L (saline-responsive): vomiting, nasogastric suction, diuretic therapy, post-hypercapnia syndrome, exogenous HCO3 load.",
          "Urinary chloride above 20 mEq/L (saline-resistant): split by blood pressure (Table 32.2). With hypertension, renin and aldosterone are essential. With normal or low blood pressure, ask about recent thiazide or loop diuretics and check serum potassium and magnesium; if diuretics, severe hypokalaemia and hypomagnesaemia are absent, suspect Bartter or Gitelman syndrome.",
        ]),
        table(
          ["Blood pressure", "Renin and aldosterone", "Group", "Causes"],
          [
            ["High", "Low renin, high aldosterone", "Primary hyperaldosteronism", "Adenoma; bilateral adrenal hyperplasia; carcinoma"],
            ["High", "High renin, high aldosterone", "Secondary aldosteronism", "Malignant hypertension, renal artery stenosis, renin-secreting tumour"],
            ["High", "Low renin, low aldosterone", "Apparent mineralocorticoid excess", "Liquorice, Cushing syndrome, Liddle syndrome, congenital adrenal hyperplasia"],
            ["Normal or low", "Not printed", "Not printed", "Recent use of diuretics, severe K⁺ depletion, Bartter or Gitelman syndromes, hypomagnesaemia"],
          ],
          "Table 32.2 Approach to metabolic alkalosis with high urinary chloride (chloride-resistant alkalosis)",
          "The blood-pressure headings span the columns in the book; they are repeated here on each row."
        ),
        table(
          ["Feature", "Bartter syndrome", "Gitelman syndrome"],
          [
            ["Shared", "Genetic; metabolic alkalosis, reduced ECF volume, normal or low blood pressure, hypokalaemia, high renin, secondary hyperaldosteronism, polyuria and polydipsia", "Same"],
            ["Onset", "Typically infancy", "Usually later in life"],
            ["Symptoms", "More severe", "Milder"],
            ["Urine calcium", "Hypercalciuria", "Hypocalciuria"],
            ["Serum magnesium", "Usually normal", "Low"],
          ],
          "Bartter and Gitelman syndromes"
        ),
        quote("(urine chloride <20 mEq/L) are vomiting, nasogastric suction, diuretic therapy", "386"),
        quote("Saline-resistant metabolic alkalosis (urine chloride >20 mEq/L)", "386"),
        caution([
          "The text on p385–386 reads oddly in two places and is kept as printed: the first step is described as confirming \"primary metabolic or primary respiratory acidosis\" (the context is metabolic alkalosis against respiratory acidosis), and respiratory acidosis is said to show \"increased CO₂ and increased PaCO₂\" (HCO3 appears to be meant). Check against the book.",
        ], "Transcript wording"),
      ],
    },
    {
      id: "coexisting",
      title: "Coexisting acid–base disorders",
      blocks: [
        formula(
          "Expected respiratory compensation",
          "Expected increase in PaCO2 = 0.7 × (Measured HCO3 − 24)",
          [
            { symbol: "Measured HCO3", meaning: "Measured serum bicarbonate", unit: "mEq/L" },
            { symbol: "24", meaning: "The baseline HCO3 the book subtracts", unit: "mEq/L" },
          ],
          { note: "Actual pCO2 higher than expected suggests coexisting respiratory acidosis; lower than expected suggests coexisting respiratory alkalosis." }
        ),
        formula(
          "Anion gap",
          "AG = Na⁺ − (Cl⁻ + HCO3)",
          [
            { symbol: "Na⁺", meaning: "Serum sodium", unit: "mEq/L" },
            { symbol: "Cl⁻", meaning: "Serum chloride", unit: "mEq/L" },
            { symbol: "HCO3", meaning: "Serum bicarbonate", unit: "mEq/L" },
          ],
          { note: "An anion gap above 20 mEq/L in metabolic alkalosis suggests a coexisting high anion gap metabolic acidosis." }
        ),
        quote("Expected increase in PaCO₂ = 0.7 × Rise in HCO₃ (Measured HCO₃ – 24)", "387"),
        quote("gap [Na⁺−(Cl⁻+HCO₃)] is high (i.e., greater than 20 mEq/L)", "387"),
      ],
    },
    {
      id: "saline_responsive",
      title: "Management: the cause, and saline-responsive alkalosis",
      intro: "Treating the underlying cause is generally enough in most cases; specific therapy may be indicated in symptomatic or moderate to severe alkalosis.",
      blocks: [
        points([
          "Aim: adequate correction of hypovolaemia, hypochloraemia, hypokalaemia and hypomagnesaemia.",
          "Saline with potassium: IV normal saline with potassium chloride is the preferred solution, correcting both hypochloraemia and hypokalaemia. Restoring volume lets the kidney excrete sodium bicarbonate.",
          "Gastric acid: H2 blockers or, more effectively, proton pump inhibitors reduce H⁺ loss with vomiting or nasogastric suction. Octreotide controls hypergastrinaemia and gastric H⁺ secretion in Zollinger-Ellison syndrome.",
          "Diuretics: hold or reduce the dose. Where they are needed (heart failure, cirrhosis with oedema): dose reduction, KCl supplementation, adding a K⁺-sparing diuretic such as spironolactone, or combining a carbonic anhydrase inhibitor with loop and/or thiazide diuretics.",
          "Dialysis with a low bicarbonate bath may be considered in a few patients unresponsive to standard treatment or acetazolamide, particularly with volume overload, profound electrolyte abnormalities and renal failure.",
          "Post-hypercapnic alkalosis on starting ventilation in chronic hypercapnia: reduce minute ventilation (lower rate or tidal volume), correct hypovolaemia and hypokalaemia, and consider acetazolamide, which raises urinary bicarbonate excretion.",
        ]),
        caution([
          "Avoid or stop exogenous alkali: NaHCO3 infusions, balanced crystalloids with lactate or acetate buffers, and citrate-containing blood products.",
        ]),
        quote("Treatment of the underlying cause is generally sufficient to correct metabolic alkalosis in most cases.", "387"),
        quote("is the preferred solution for correcting hypovolemia in metabolic alkalosis", "387"),
        quote("Dialysis therapy with a low bicarbonate bath may be considered", "388"),
      ],
    },
    {
      id: "hydrochloric_acid",
      title: "Hydrochloric acid (rare use)",
      intro: "For severe metabolic alkalosis (pH >7.55) with profound symptoms that is refractory to standard treatment, or when other treatments are contraindicated, diluted HCl can lower plasma HCO3 rapidly.",
      blocks: [
        steps([
          "Diluted HCl is not available commercially; the pharmacist prepares it. Commercial HCl is a 1 N solution.",
          "Mix 100 mL of 1 N HCl with 900 mL of normal saline, dextrose 5% or sterile water: a 0.1 N solution providing 100 mEq/L of H⁺.",
          "To deliver 10 mEq/hour of H⁺, give 100 mL of this pre-mixed solution slowly over an hour.",
          "Safe infusion rate: 0.1 to 0.2 mEq/kg/hour.",
          "Goal: partial correction, reducing HCO3 to a safe level, e.g. 35 mEq/L or lower.",
        ]),
        formula(
          "HCl dose (H⁺ ion deficit)",
          "H⁺ deficit (mEq) = 0.3 × Body weight (kg) × (Measured HCO3 − Desired HCO3)",
          [
            { symbol: "Body weight", meaning: "Body weight", unit: "kg" },
            { symbol: "Measured HCO3", meaning: "Measured serum bicarbonate", unit: "mEq/L" },
            { symbol: "Desired HCO3", meaning: "Target bicarbonate", unit: "mEq/L" },
          ]
        ),
        caution([
          "HCl is highly corrosive: give the diluted solution cautiously via a central line; extravasation causes severe irritation, thrombophlebitis and tissue necrosis.",
        ]),
        quote("severe metabolic alkalosis (pH >7.55) with profound clinical symptoms is refractory", "388"),
        quote("mix 100 mL of 1 N hydrochloric acid with 900 mL of normal saline, dextrose 5%, or sterile water", "388"),
        quote("contains 0.1 normal HCl and provides 100 mEq/L of H⁺.", "388"),
        quote("administer 100 mL of this pre-mixed solution slowly over an hour", "388"),
        quote("H⁺ Ion Deficit (mEq) = 0.3 × Body Weight (kg) × (Measured – Desired HCO₃ [mEq/L])", "388"),
        quote("The safe infusion rate of HCl is 0.1 to 0.2 mEq/ kg/hour.", "388"),
        quote("aiming to reduce HCO₃ to a safe bicarbonate level, e.g., 35 mEq/L or lower", "388"),
      ],
    },
    {
      id: "saline_resistant",
      title: "Management: saline-resistant alkalosis",
      intro: "Driven by increased aldosterone effect; with volume expansion it does not benefit from rehydration. Basics: treat the cause, block Na⁺ reabsorption with aldosterone antagonists, acetazolamide for bicarbonaturia, aggressive correction of hypokalaemia, dietary sodium restriction.",
      blocks: [
        points([
          "Cause-specific: surgical removal of the pituitary tumour or adrenal adenoma in Cushing's syndrome; stop liquorice; potassium-sparing diuretics (spironolactone, eplerenone, amiloride, triamterene) for primary mineralocorticoid excess and primary hyperaldosteronism; indomethacin for Bartter syndrome.",
          "Hypokalaemia is present in nearly all saline-resistant alkalosis and correcting it is essential: potassium-rich diet, oral or IV potassium judged by severity, and potassium-sparing diuretics (aldosterone antagonists such as spironolactone and eplerenone; ENaC inhibitors such as amiloride and triamterene). Correction also reduces the severity of hypertension.",
          "Acetazolamide: inhibits proximal tubular carbonic anhydrase, causing bicarbonaturia and a fall in pH. Used where volume expansion with normal saline is not tolerated, such as diuretic-resistant heart failure. Commonly 250 to 500 mg a day, once or twice daily.",
          "Spironolactone: corrects hypokalaemia by aldosterone antagonism; useful in primary or secondary hyperaldosteronism and volume-overload states such as congestive heart failure.",
          "Amiloride: blocks distal sodium channels. Not commonly used in metabolic alkalosis, but preferred in Liddle syndrome, where spironolactone is ineffective.",
        ]),
        caution([
          "Acetazolamide can cause hypokalaemia, which aggravates the alkalosis: monitor potassium carefully and correct hypokalaemia aggressively.",
          "During spironolactone therapy monitor serum potassium carefully to prevent life-threatening hyperkalaemia.",
        ]),
        quote("Acetazolamide is commonly prescribed at daily doses ranging from 250 to 500 mg, usually taken once or twice a day.", "389"),
        quote("occurs in nearly all saline-resistant alkalosis, and correction of potassium deficiency is essential", "389"),
        quote("careful monitoring of serum potassium levels is crucial to prevent life-threatening hyperkalemia.", "390"),
      ],
    },
  ],
};
