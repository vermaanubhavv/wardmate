import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, table } from "@/content/fluids/_helpers";

/**
 * ACID–BASE DISORDERS AND GI LOSSES — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapters 30–34, of which the source edition carries only the openings: the
 * definitions, the anion gap, the respiratory compensation rules and the gastric juice
 * composition. The treatment sections are not in the text and are listed as absent, not
 * filled in. Every number below is the book's; the quotes give the page it came from.
 */
export const acidBaseAndGiLossesV1: FluidTopic = {
  id: "acid_base_and_gi_losses",
  version: "1.0.0",
  title: "Acid–base disorders and gastrointestinal losses: definitions in this edition",
  group: "acid_base",
  summary: "The definitions, the anion gap, the respiratory compensation rules and what vomiting takes away — and which sections the edition does not carry.",
  setting: "Adult ward, emergency and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "30 Basic Understanding and Approach to Acid-Base Disorders (opening only)",
      "31 Metabolic Acidosis (opening only)",
      "32 Metabolic Alkalosis (opening only)",
      "33 Respiratory Acid-Base Disorders (opening only)",
      "34 Gastrointestinal Losses and Upper GI Bleeding (opening only)",
    ],
    pages: "181–198",
  },
  sections: [
    {
      id: "terminology",
      title: "Normal pH and the basic terms",
      blocks: [
        points([
          "pH represents the concentration of free hydrogen ions and has an inverse relationship with it: a fall in pH means a rise in H+.",
          "Normal arterial pH is 7.4, range 7.35–7.45.",
          "An acid donates H+ ions or, added to a solution, raises the H+ concentration and so lowers the pH.",
          "Acidaemia (acid blood) is a blood pH below normal, under 7.35, with a raised H+ concentration.",
          "Acidosis is the abnormal process or disease that reduces pH below 7.35 through more acid or less alkali.",
          "The book stresses that acid–base disorders can be the first sign of an underlying disease, giving Kussmaul's breathing in diabetic ketoacidosis or renal failure as its example.",
        ]),
        quote("The normal value of pH in arterial blood is 7.4 (7.35–7.45).", "182"),
        quote("Acidosis is an abnormal process or disease that reduces pH (pH <7.35)", "182"),
      ],
    },
    {
      id: "metabolic_acidosis",
      title: "Metabolic acidosis and the anion gap",
      blocks: [
        points([
          "A fall in plasma HCO3 with a fall in pH below 7.35. PaCO2 falls secondarily through hyperventilation, which minimises the fall in pH.",
          "Four mechanisms: loss of HCO3 through the gut or kidneys, overproduction of endogenous non-volatile acids, ingestion or infusion of acid or potential acids, and failure of H+ excretion by the kidney.",
          "High anion gap examples in the text: lactic acidosis, ketoacidosis, ingested toxins, acute or chronic renal impairment.",
          "Normal anion gap examples in the text: diarrhoea, renal tubular acidosis, large-volume saline administration.",
          "The GOLDMARK mnemonic is named for the high anion gap causes; its expansion (Table 31.2) is not in the text.",
        ]),
        formula(
          "Anion gap",
          "AG = Na+ − (Cl− + HCO3)",
          [
            { symbol: "AG", meaning: "anion gap; normal value 12 ± 2", unit: "mEq/L" },
            { symbol: "Na+", meaning: "serum sodium", unit: "mEq/L" },
            { symbol: "Cl−", meaning: "serum chloride", unit: "mEq/L" },
            { symbol: "HCO3", meaning: "serum bicarbonate", unit: "mEq/L" },
          ],
          { note: "The text gives no worked example and no albumin correction.", calc: "anion_gap" }
        ),
        quote("a fall in plasma HCO3 and a fall in pH (below 7.35)", "184"),
        quote("Anion Gap (AG) = Na+ - (Cl- + HCO3) = 12 ± 2 (Normal Value)", "185"),
      ],
    },
    {
      id: "metabolic_alkalosis",
      title: "Metabolic alkalosis",
      blocks: [
        points([
          "A primary rise in serum HCO3 above 26 mEq/L with pH above 7.45 and a compensatory rise in PaCO2 from alveolar hypoventilation.",
          "The most common acid–base disorder, typically developing after admission in the critically ill rather than being present on arrival.",
          "Hypochloraemia and hypokalaemia are the electrolyte disturbances that commonly go with it.",
          "Compensatory hypoventilation is slow compared with the hyperventilation of metabolic acidosis, and it is limited by hypoxia: a PO2 below 60 mmHg is a potent stimulus to breathe and overrides the compensation.",
          "Chronic respiratory acidosis also shows a raised HCO3 and raised PaCO2; the differentiating feature is a low pH.",
          "Generation of the alkalosis, as listed: GI loss of H+ (vomiting, nasogastric suction, congenital chloride-losing diarrhoea); renal loss of H+ (diuretics, primary hyperaldosteronism, Bartter and Gitelman syndromes); exogenous HCO3 load (HCO3 administration, balanced crystalloids containing buffers, citrate-anticoagulated blood products, milk-alkali syndrome).",
        ]),
        quote("an increase in serum HCO3 (>26 mEq/L), a high pH (>7.45)", "188"),
        quote("severe hypoxia (PO2 <60 mm Hg) is a potent stimulus to increase alveolar ventilation", "188"),
      ],
    },
    {
      id: "respiratory_acidosis",
      title: "Respiratory acidosis: acute, chronic and the compensation rules",
      blocks: [
        points([
          "Primary hypercapnia: PaCO2 above 45 mmHg with pH below 7.35 and a variable compensatory rise in plasma HCO3. Alveolar ventilation fails to keep pace with CO2 production.",
          "Acute develops rapidly, within 48 hours; chronic develops over days to weeks, beyond 48 hours.",
          "Renal compensation is increased urinary H+ secretion with acidic urine and a gradual rise in HCO3 — small in the acute form because it is slow, substantial in the chronic form.",
        ]),
        table(
          ["Form", "Time course", "HCO3 rise per 10 mmHg PaCO2", "pH fall per 10 mmHg PaCO2"],
          [
            ["Acute respiratory acidosis", "under 48 hours", "1 mEq/L", "0.1"],
            ["Chronic respiratory acidosis", "over 48 hours", "4 mEq/L", "0.03"],
          ],
          "Expected compensation",
          "Serum HCO3 usually does not exceed 38 mEq/L through compensation alone; above 38 mEq/L think of a concomitant metabolic alkalosis."
        ),
        quote("Every 10 mm of Hg rise in PaCO2 causes 1 mEq/L rise in HCO3 and 0.1 fall in pH.", "191"),
        quote("Every 10 mm Hg rise in PaCO2 causes a 4 mEq/L rise in HCO3 and a 0.03 fall in pH.", "191"),
        quote("If HCO3 is >38 mEq/L, think of concomitant metabolic alkalosis.", "191"),
      ],
    },
    {
      id: "vomiting",
      title: "Gastric juice and what vomiting takes away",
      blocks: [
        table(
          ["Constituent of gastric juice", "Printed value"],
          [
            ["Sodium", "20–60 mEq/L"],
            ["Potassium", "14 mEq/L"],
            ["Chloride", "140 mEq/L"],
            ["Hydrogen ion", "60–80 mEq/L"],
          ],
          "Gastric juice, as printed",
          "Bicarbonate and daily volume are not stated. Table 34.1, the full composition of GI secretions, is not in the text."
        ),
        points([
          "Vomiting or nasogastric suction leads to hypokalaemic, hypochloraemic metabolic alkalosis with hypovolaemia.",
          "Because HCl-containing gastric juice is lost, hypochloraemia with metabolic alkalosis comes first; hypokalaemia follows.",
        ]),
        quote("Sodium (Na+) 20–60 mEq/L, chloride (Cl-) 140 mEq/L, potassium (K+) 14 mEq/L, and hydrogen ions (H+) 60–80 mEq/L", "194"),
        quote("hypochloremia with metabolic alkalosis, and hypokalemia occurs subsequently", "194"),
      ],
    },
    {
      id: "not_in_edition",
      title: "Not in this edition of the text",
      intro: "Each chapter's contents list names these sections, but their text is absent. Nothing here has been filled from memory.",
      blocks: [
        caution([
          "Chapter 30: Table 30.1 normal values; alkali, alkalaemia and alkalosis definitions; simple disorders; physiology of regulation (buffers, respiratory, renal); compensation and the same direction rule with the expected compensation for each disorder; mixed and triple disorders; diagnosis, ABG indications, contraindications and collection, arterial versus venous gases, interpretation; the step-by-step approach and examples.",
          "Chapter 31: Table 31.1 causes by anion gap; Table 31.2 GOLDMARK; lactic acidosis, DKA, alcoholic ketoacidosis, salicylate poisoning and RTA aetiology; clinical features; diagnosis and investigations; all treatment — general measures, alkali therapy in acute acidosis (indications, benefits, rationale for selective use, bicarbonate therapy can be harmful, bolus versus infusion, calculation of volume, goals, precautions), alkali therapy in chronic acidosis and alkali agent compositions, and treatment in specific situations.",
          "Chapter 32: Table 32.1; maintenance of alkalosis; aetiology; clinical features; diagnosis (confirming, aetiological, coexisting disorders); management — underlying cause, saline-responsive and saline-resistant alkalosis.",
          "Chapter 33: respiratory acidosis versus metabolic alkalosis; hypercapnia and hypoxaemia; aetiology; clinical features; diagnosis; treatment (general measures, oxygen therapy, ventilatory support, alkali therapy); the whole respiratory alkalosis section.",
          "Chapter 34: Table 34.1 composition of GI secretions; Figure 34.1; vomiting management (aetiological treatment, correction of hypovolaemia and electrolytes, fluid selection for gastric irrigation); the whole diarrhoea section including oral rehydration and IV therapy; the whole upper GI bleeding section — presentations, assessment, stabilisation, blood transfusion, medications, nasogastric tube, endoscopy, specific treatment, risk factors, monitoring.",
        ], "Section headings printed without text"),
      ],
    },
  ],
};
