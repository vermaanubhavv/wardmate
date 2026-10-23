import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * BASIC UNDERSTANDING AND APPROACH TO ACID–BASE DISORDERS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 30 of the full edition, from a text transcription (no page images). Page
 * numbers are the printed book pages. Every number below is the book's; the quotes give the
 * page it came from.
 */
export const acidBaseBasicsV1: FluidTopic = {
  id: "acid_base_basics",
  version: "1.0.0",
  title: "Acid–base disorders: terms, compensation and the step-by-step ABG approach",
  group: "acid_base",
  summary: "Normal values, the four primary disorders, the compensation formulas, mixed disorders, taking and reading a blood gas, the anion gap and its relatives, and the book's step-by-step approach with its ten worked cases.",
  setting: "Adult ward, emergency and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["30 Basic Understanding and Approach to Acid-Base Disorders"], pages: "341–359", pageKind: "book" },
  sections: [
    {
      id: "terminology",
      title: "Basic terminology and normal values",
      intro: "Acid–base disorders are common in the critically ill and can be the first sign of an underlying disease, such as Kussmaul's breathing in diabetic ketoacidosis or renal failure.",
      blocks: [
        points([
          "pH represents the concentration of free hydrogen ions and is inversely related to it: a fall in pH means a rise in H⁺.",
          "An acid donates H⁺ ions or raises their concentration, lowering pH. A base accepts H⁺ ions or lowers their concentration, raising pH.",
          "Acidaemia (\"acid blood\") is a blood pH below 7.35 with raised H⁺; acidosis is the abnormal process or disease that reduces pH, through more acid or less alkali.",
          "Alkalaemia (\"alkaline blood\") is a blood pH above 7.45 with lowered H⁺; alkalosis is the abnormal process or disease that raises pH, through less acid or more alkali.",
        ]),
        table(
          ["Clinical terminology", "Criteria"],
          [
            ["Normal pH", "7.4 (7.35–7.45)"],
            ["Acidaemia", "pH <7.35 (low pH)"],
            ["Alkalaemia", "pH >7.45 (high pH)"],
            ["Normal HCO₃", "24 (22–26) mEq/L"],
            ["Metabolic acidosis", "HCO₃ <22 mEq/L and low pH"],
            ["Metabolic alkalosis", "HCO₃ >26 mEq/L and high pH"],
            ["Normal PaCO₂", "40 (35–45) mm of Hg"],
            ["Respiratory acidosis", "PaCO₂ >45 mm of Hg and low pH"],
            ["Respiratory alkalosis", "PaCO₂ <35 mm of Hg and high pH"],
            ["Anion gap (AG)", "8 to 16 mEq/L"],
          ],
          "Table 30.1 Summary of acid–base terminology and their values (p342)",
          "The table prints the anion gap as 8 to 16 mEq/L; the anion-gap section (p353) gives 12 ± 2 mEq/L. Both are printed."
        ),
        quote("The normal value of pH in arterial blood is 7.4 (7.35-7.45).", "342"),
        quote("Metabolic alkalosis is defined by HCO₃ levels >26 mEq/L and a pH >7.45.", "342"),
        quote("Respiratory acidosis is defined by partial pressure of carbon dioxide (PaCO₂) >45 mm of Hg and a pH <7.35.", "342"),
        quote("Respiratory alkalosis is defined by PaCO₂ <35 mm of Hg and a pH >7.45.", "342"),
      ],
    },
    {
      id: "simple_disorders",
      title: "Simple acid–base disorders",
      intro: "A simple disorder is one primary disturbance, acidosis or alkalosis. \"Metabolic\" means a primary change in HCO₃; \"respiratory\" means a primary change in PaCO₂.",
      blocks: [
        table(
          ["Basic disorder", "H⁺", "pH", "Primary change", "Secondary change"],
          [
            ["Metabolic acidosis", "High", "Low", "Low HCO₃", "Low PaCO₂"],
            ["Metabolic alkalosis", "Low", "High", "High HCO₃", "High PaCO₂"],
            ["Respiratory acidosis", "High", "Low", "High PaCO₂", "High HCO₃"],
            ["Respiratory alkalosis", "Low", "High", "Low PaCO₂", "Low HCO₃"],
          ],
          "Table 30.2 Characteristics of primary acid–base disorders (p343)"
        ),
        points([
          "Metabolic acidosis (HCO₃ <22 mEq/L, pH <7.35): excess loss of bicarbonate (diarrhoea), excess accumulation of acid (diabetic ketoacidosis, lactic acidosis), or bicarbonate not generated (renal tubular acidosis).",
          "Metabolic alkalosis (HCO₃ >26 mEq/L, pH >7.45): excessive loss of hydrogen ions (vomiting); increased generation of HCO₃ (the book's example is salicylate poisoning); failure of renal bicarbonate excretion in hypovolaemia, hypokalaemia and hypochloraemia from loop or thiazide diuretics.",
          "Respiratory acidosis (PaCO₂ >45 mm of Hg, pH <7.35): CNS or respiratory disorders causing hypoventilation retain CO₂ (hypercapnia).",
          "Respiratory alkalosis (PaCO₂ <35 mm of Hg, pH >7.45): inappropriately high hyperventilation washes out CO₂ (hypocapnia).",
          "A mixed acid–base disorder is the simultaneous presence of more than one acid–base disorder.",
        ]),
        quote("Metabolic acidosis is defined by HCO₃ levels <22 mEq/L and a pH <7.35.", "343"),
      ],
    },
    {
      id: "physiology",
      title: "Physiology of acid–base regulation",
      blocks: [
        points([
          "pH is kept within 7.35 to 7.45. It governs cellular enzymatic reactions and ionic concentrations; any alteration can cause cardiac arrhythmias.",
          "Volatile acid (carbonic acid) sets the blood CO₂ and is excreted by the lungs: about 22,000 mEq a day.",
          "Non-volatile (fixed) acids such as sulfuric and phosphoric acid come from protein catabolism at roughly 1 mEq/kg and are excreted by the kidneys.",
          "Three regulators: buffers act immediately, the lungs act rapidly by eliminating CO₂, and the kidneys act slowly but have the most potent buffering effect.",
          "Buffers (bicarbonate, phosphate, proteins, haemoglobin, bone bicarbonate) act quickly but have limited capacity.",
          "Respiratory regulation: in metabolic acidosis, rate and depth of breathing rise and pCO₂ falls; in metabolic alkalosis, hypoventilation raises pCO₂. The response starts in about 30 minutes, is usually complete within 12 to 24 hours, and has greater buffering power than chemical buffers.",
          "Renal regulation: tubular secretion of H⁺, reabsorption of filtered bicarbonate and production of new HCO₃. It starts within hours and takes 5–6 days for peak effect. In metabolic acidosis normal kidneys can increase net acid excretion more than tenfold; in metabolic alkalosis they excrete more HCO₃; in respiratory acidosis they retain HCO₃; in respiratory alkalosis they excrete more.",
          "The transcript of p345 reads \"maintain plasma HCO₃ concentration and, thereby, pr regulation\": a word appears lost after \"thereby\". Kept as printed.",
        ]),
        formula(
          "Henderson–Hasselbalch equation (as printed)",
          "pH = 6.1 + log HCO₃ / (0.3 × PaCO₂) = pK + Kidney/Lung",
          [
            { symbol: "HCO₃", meaning: "serum bicarbonate", unit: "mEq/L" },
            { symbol: "PaCO₂", meaning: "arterial partial pressure of carbon dioxide", unit: "mm Hg" },
          ],
          { note: "Printed as \"6.1 + log HCO₃/0.3 x PaCO₂\"; the bracket around 0.3 × PaCO₂ is added here only to show that the product is the denominator. The book uses it to show that pH is set by the ratio of HCO₃ to PaCO₂." }
        ),
        quote("Extreme pH values falling below 7.2 or exceeding 7.55 can be potentially life-threatening", "344"),
        quote("About 22,000 mEq volatile acid is produced daily.", "344"),
        quote("response starts in about 30 minutes, is usually complete within 12 to 24 hours", "345"),
        quote("It has the most powerful buffering system, which starts within hours and takes 5-6 days for peak", "345"),
      ],
    },
    {
      id: "compensation",
      title: "Compensation and the same direction rule",
      blocks: [
        points([
          "Compensation is the body's response to neutralise the effect of the initial insult on pH. pH is held by the ratio of HCO₃ to PaCO₂.",
          "Primary metabolic disorders bring a compensatory respiratory change in PaCO₂; primary respiratory disorders bring a compensatory metabolic (renal) change in HCO₃.",
          "Same direction rule: the compensatory change is in the same direction as the primary change — low HCO₃ with low PaCO₂, high HCO₃ with high PaCO₂ (\"up yields up, down yields down\").",
          "Why calculate it: when the expected change matches the actual value, the disorder is simple; when the actual value differs significantly, or the changes go in opposite directions, consider a mixed disorder.",
        ]),
      ],
    },
    {
      id: "expected_compensation",
      title: "Expected compensation in the four simple disorders",
      blocks: [
        table(
          ["Disorder", "Primary change", "Expected compensation", "Upper limit of compensation", "Compensation time"],
          [
            ["Metabolic acidosis", "pH <7.35; HCO₃ <22 mEq/L", "Expected PaCO₂ = (1.5 × serum HCO₃) + 8, or = HCO₃ + 15", "PaCO₂ up to 10 mm Hg", "Respiratory compensation starts within 30 minutes and complete within 12–24 hrs"],
            ["Metabolic alkalosis", "pH >7.45; HCO₃ >26 mEq/L", "Increase in PaCO₂ = 0.7 × (Measured HCO₃ − 24)", "PaCO₂ up to 55 mm Hg", "Starts within a few minutes, complete within 24–36 hrs"],
            ["Respiratory acidosis", "pH <7.35; PaCO₂ >45 mm of Hg", "Acute: increase in HCO₃ = 0.1 × (Measured PaCO₂ − 40). Chronic: increase in HCO₃ = 0.4 × (Measured PaCO₂ − 40)", "HCO₃ up to 40 mEq/L", "Renal compensation begins within hours and complete within 2–5 days"],
            ["Respiratory alkalosis", "pH >7.45; PaCO₂ <35 mm of Hg", "Acute: fall in HCO₃ = 0.2 × (40 − Measured PaCO₂). Chronic: fall in HCO₃ = 0.4 × (40 − Measured PaCO₂)", "HCO₃ up to 10-12 mEq/L", "Renal compensation begins within hours and complete within 2–5 days"],
          ],
          "Table 30.3 Prediction of compensation for simple acid–base disorders (p346)",
          "Timings as printed. Table 30.3 gives renal compensation 2–5 days; the physiology section (p345) gives 5–6 days for the kidney's peak effect."
        ),
        formula(
          "Metabolic acidosis: Winter's formula",
          "Expected PaCO₂ = (1.5 × Serum HCO₃) + 8",
          [
            { symbol: "PaCO₂", meaning: "expected arterial CO₂ after respiratory compensation", unit: "mm Hg" },
            { symbol: "Serum HCO₃", meaning: "measured bicarbonate", unit: "mEq/L" },
          ],
          { note: "Table 30.3 also prints the shortcut Expected PaCO₂ = HCO₃ + 15.", example: "Case 2 (p357): HCO₃ 8 → (8 × 1.5) + 8 = 20 mm Hg." }
        ),
        formula(
          "Metabolic alkalosis",
          "Increase in PaCO₂ = 0.7 × (Measured HCO₃ − 24)",
          [
            { symbol: "Measured HCO₃", meaning: "serum bicarbonate", unit: "mEq/L" },
            { symbol: "24", meaning: "normal HCO₃", unit: "mEq/L" },
          ],
          { note: "About 0.6 to 0.7 mm Hg rise in PaCO₂ for each 1 mEq/L rise in HCO₃, up to approximately 55 mm Hg.", example: "Case 3 (p357): HCO₃ 34 → 0.7 × 10 = 7.0; expected PaCO₂ 40 + 7.0 = 47.0 mm Hg." }
        ),
        formula(
          "Acute respiratory acidosis",
          "Expected increase in HCO₃ = 0.1 × (Measured PaCO₂ − 40)",
          [
            { symbol: "Measured PaCO₂", meaning: "arterial CO₂", unit: "mm Hg" },
            { symbol: "40", meaning: "normal PaCO₂", unit: "mm Hg" },
          ],
          { note: "About 0.1 mEq/L per 1 mm Hg rise in PaCO₂.", example: "Case 4 (p357): PaCO₂ 80 → 0.1 × 40 = 4 mEq/L." }
        ),
        formula(
          "Chronic respiratory acidosis",
          "Expected increase in HCO₃ = 0.4 × (Measured PaCO₂ − 40)",
          [
            { symbol: "Measured PaCO₂", meaning: "arterial CO₂", unit: "mm Hg" },
            { symbol: "40", meaning: "normal PaCO₂", unit: "mm Hg" },
          ],
          { note: "The text says about 0.4–0.5 mEq/L per 1 mm Hg rise in PaCO₂; the formula uses 0.4." }
        ),
        formula(
          "Acute respiratory alkalosis",
          "Expected fall in HCO₃ = 0.2 × (40 − Measured PaCO₂)",
          [
            { symbol: "Measured PaCO₂", meaning: "arterial CO₂", unit: "mm Hg" },
            { symbol: "40", meaning: "normal PaCO₂", unit: "mm Hg" },
          ],
          { note: "About 0.2 mEq/L per 1 mm Hg change in PaCO₂.", example: "Case 1 (p357): PaCO₂ 21 → 0.2 × 19 = 3.8; expected HCO₃ 24 − 3.8 = 20.2 mEq/L." }
        ),
        formula(
          "Chronic respiratory alkalosis",
          "Expected fall in HCO₃ = 0.4 × (40 − Measured PaCO₂)",
          [
            { symbol: "Measured PaCO₂", meaning: "arterial CO₂", unit: "mm Hg" },
            { symbol: "40", meaning: "normal PaCO₂", unit: "mm Hg" },
          ],
          { note: "Written as in Table 30.3 (p346). The text on p347 prints it as 0.4 x (Measured PaCO₂ - 40), which is negative when PaCO₂ is low. Both are printed." }
        ),
        points([
          "In the respiratory alkalosis paragraph (p347) the transcript reads that compensation \"leads to a reduction in cO₂\" and gives the rates \"for each 1 mm Hg increase in PaCO₂\"; HCO₃ and a decrease in PaCO₂ appear to be meant. Kept as printed.",
        ]),
        quote("Expected PaCO₂ = (1.5 x Serum HCO₃) + 8", "346"),
        quote("Increase in PaCO₂ = 0.7 x (Measured HCO₃ - 24)", "347"),
        quote("Expected Increase in HCO₃ = 0.4 x (Measured PaCO₂ - 40)", "347"),
        quote("Expected Fall in HCO₃ = 0.2 × (40 - Measured PaCO₂)", "347"),
        quote("Expected Fall in HCO₃ = 0.4 x (Measured PaCO₂ - 40)", "347"),
      ],
    },
    {
      id: "mixed",
      title: "Mixed acid–base disorders",
      intro: "The independent coexistence of more than one primary acid–base disorder, often in the critically ill. The most common is metabolic with respiratory acidosis; the most detrimental are metabolic with respiratory acidosis and metabolic with respiratory alkalosis.",
      blocks: [
        table(
          ["Disorders", "Common causes"],
          [
            ["Metabolic acidosis + respiratory acidosis (low pH, low HCO₃, high PaCO₂)", "Cardiac arrest (hypoventilation + lactic acidosis); shock with respiratory failure; diabetic ketoacidosis with respiratory diseases"],
            ["Metabolic acidosis + respiratory alkalosis (normal pH, low HCO₃, low PaCO₂)", "Salicylate intoxication; Gram-negative sepsis; liver failure"],
            ["Metabolic alkalosis + respiratory acidosis (normal pH, high HCO₃, high PaCO₂)", "COPD with diuretics; metabolic alkalosis with severe hypokalaemia and respiratory weakness leading to hypoventilation"],
            ["Metabolic alkalosis + respiratory alkalosis (high pH, high HCO₃, low PaCO₂)", "Liver failure with vomiting; patient on ventilator with continuous nasogastric aspiration"],
            ["Metabolic acidosis + metabolic alkalosis (near normal pH and HCO₃)", "Diabetic ketoacidosis with vomiting; vomiting with severe volume depletion causing lactic acidosis"],
            ["Respiratory acidosis + respiratory alkalosis", "Do not co-exist"],
          ],
          "Table 30.4 Common mixed acid–base disorders (p348)"
        ),
        table(
          ["Triple disorder", "The book's example"],
          [
            ["High AG metabolic acidosis + metabolic alkalosis + respiratory alkalosis", "Alcoholic ketoacidosis, with vomiting, then sepsis or liver disease"],
            ["High AG metabolic acidosis + metabolic alkalosis + respiratory acidosis", "COPD with hypercapnia, metabolic alkalosis from diuretics or vomiting, then high AG acidosis from sepsis, hypotension or hypoxaemia"],
            ["High AG metabolic acidosis + normal AG metabolic acidosis + respiratory alkalosis", "Diabetic with an acute asthma attack (respiratory alkalosis), diabetic ketoacidosis and diarrhoea"],
          ],
          "Triple mixed disorders (p348)"
        ),
        caution([
          "Primary respiratory acidosis and respiratory alkalosis cannot coexist: the lungs create only one primary disturbance, high or low CO₂, and a primary respiratory disorder cannot have a compensatory respiratory response at the same time.",
        ]),
        quote("cannot coexist. The lungs can only create one primary disturbance characterized by either high or low CO₂ levels.", "348"),
      ],
    },
    {
      id: "history_primary_tests",
      title: "Diagnosis: history, examination and primary investigations",
      intro: "The book's approach: history and examination, primary investigations, a blood gas, choosing the interpretation method, reading the basic investigations, then the step-by-step approach.",
      blocks: [
        table(
          ["System", "Clinical disorder", "Expected acid–base disorder"],
          [
            ["Cardiovascular", "Congestive heart failure", "Respiratory alkalosis"],
            ["Cardiovascular", "Shock", "High AG metabolic acidosis"],
            ["Central nervous system", "Coma", "Respiratory acidosis or alkalosis"],
            ["Central nervous system", "Seizures", "Metabolic acidosis, respiratory alkalosis"],
            ["Endocrine", "Diabetic ketoacidosis", "High AG metabolic acidosis"],
            ["Endocrine", "Hyperaldosteronism", "Metabolic alkalosis"],
            ["Gastrointestinal", "Diarrhoea", "Normal AG metabolic acidosis"],
            ["Gastrointestinal", "Vomiting", "Metabolic alkalosis"],
            ["Renal", "Renal failure (acute or chronic)", "High AG metabolic acidosis"],
            ["Renal", "Renal tubular acidosis", "Normal AG metabolic acidosis"],
            ["Respiratory", "Tachypnoea, hyperventilation", "Respiratory alkalosis"],
            ["Respiratory", "Chronic hypoventilation", "Respiratory acidosis"],
            ["Miscellaneous", "Diuretic use (excessive)", "Metabolic alkalosis"],
            ["Miscellaneous", "Salicylate poisoning", "High AG acidosis, respiratory alkalosis"],
            ["Miscellaneous", "Sepsis and septic shock", "Lactic acidosis"],
          ],
          "Table 30.5 Clinical problems that may cause acid–base disorders (p349)"
        ),
        points([
          "Primary investigations: serum sodium, potassium, chloride, HCO₃ and anion gap; then complete blood count, urine analysis, urinary electrolytes, blood sugar and renal function tests.",
        ]),
      ],
    },
    {
      id: "blood_gas",
      title: "Obtaining a blood gas",
      intro: "There is no precise guideline for when to order an ABG; decide after evaluating each patient.",
      blocks: [
        points([
          "Selective use: arterial puncture is painful, carries a small risk of arterial occlusion and is relatively expensive, so it should not be routine. Except in emergencies, order electrolytes and HCO₃ first; with no significant disturbance on those and the clinical findings, an ABG is typically not required.",
        ], "Selective use of ABG"),
        points([
          "Emergencies in critically unstable patients where a significant acid–base disorder is suspected: immediately.",
          "History, examination and serum electrolytes suggesting a severe or progressive acid–base disorder.",
          "Significant respiratory distress from acute respiratory disease or an exacerbation of chronic respiratory disease.",
        ], "Indications"),
        caution([
          "Contraindications: an abnormal modified Allen's test, local infection, distorted anatomy, peripheral vascular disease, active Raynaud disease, arteriovenous fistulas.",
          "Relative contraindications: impaired coagulation — anticoagulation, thrombolytic therapy, known coagulopathies or low platelet count (printed \"<50\", no unit) — for the risk of bleeding and haematoma.",
        ], "Contraindications of ABG"),
        steps([
          "Perform the modified Allen's test.",
          "Clean the site (local anaesthesia is optional).",
          "Use a 21-gauge needle with a syringe flushed with heparin.",
          "Palpate the artery with one hand and insert the needle at a 45-degree angle.",
          "Collect 2–4 mL of blood, preferably without aspiration.",
          "After withdrawing the syringe, apply firm pressure at the puncture site.",
        ], "Radial artery puncture"),
        caution([
          "Collect into a low-friction syringe under arterial pressure; do not pull (suction) the syringe, as it may affect both PaCO₂ and PaO₂.",
          "Use a heparinised syringe but not excessive heparin, which dilutes the sample.",
          "Tap any air bubble to the surface and expel it: air raises PaO₂ and lowers PaCO₂.",
          "If analysis will be delayed more than a few minutes, put the capped syringe in ice water; red cell metabolism at room temperature can produce lactic acid and acidify the sample.",
        ], "Special precautions"),
        quote("Use a 21-gauge needle with a syringe.", "350"),
        quote("Collect 2-4 ml of blood, preferably without aspiration.", "350"),
        quote("low platelet count (<50)", "350"),
      ],
    },
    {
      id: "arterial_vs_venous",
      title: "Arterial vs venous blood gases",
      blocks: [
        points([
          "VBGs are increasingly used for pH, pCO₂ and HCO₃ in emergency services and ICUs because arteriovenous differences are small and relatively constant.",
          "Convenience: quicker, less painful, easier to collect, fewer needle-stick injuries, and easier in hypotensive settings.",
          "Effectiveness: for non-critical oxygenation and acid–base screening — chronic respiratory conditions, uraemic and DKA patients, trauma with limited arterial access at initial ED assessment, evaluation, early resuscitation and response assessment in shock, and routine testing.",
          "Compared with ABG, venous pH is about 0.02 to 0.04 lower, venous HCO₃ about 2 to 3 mEq/L higher, and venous pCO₂ about 3 to 8 mmHg higher.",
          "Peripheral VBG with finger pulse oximetry gives acid–base, ventilation and oxygenation information and may reduce routine ABGs, including in COPD exacerbations.",
          "ABG is mandatory: post-cardiac arrest or neurotrauma (pCO₂ management), and poor peripheral perfusion from severe shock, severe acidosis, severe hypoxaemia or ARDS (PaO₂ for oxygenation).",
        ]),
        table(
          ["Parameter", "Arterial sample", "Venous sample"],
          [
            ["pH", "7.4 (7.35-7.45)", "7.37 (7.33-7.42)"],
            ["PaCO₂/PvCO₂", "40 (35-45) mm Hg", "46 (41-51) mm Hg"],
            ["HCO₃", "22-26 mEq/L", "24-28 mEq/L"],
            ["Oxygen saturation", "93-98%", "65-75%"],
            ["Partial pressure of O₂ (PO₂)", "95-100 mm Hg", "35-40 mm Hg"],
          ],
          "Table 30.6 Normal adult arterial and venous blood gas values (p351)"
        ),
        quote("Venous pH tends to be approximately 0.02 to 0.04 pH units lower.", "351"),
        quote("Venous serum HCO₃ concentration is about 2 to 3 mEq/L higher.", "351"),
        quote("Venous pCO₂ is typically about 3 to 8 mmHg higher", "351"),
      ],
    },
    {
      id: "method",
      title: "Choosing the interpretation method",
      blocks: [
        points([
          "The choice is between the traditional Henderson–Hasselbalch (carbonic acid/bicarbonate) method and the physicochemical Stewart approach.",
          "Stewart's approach, used chiefly by intensivists, considers strong ion difference and weak acids, but the book says it does not significantly improve diagnostic or therapeutic ability in the critically ill.",
          "The book favours the traditional physiological approach: no significant differences with Stewart's method, and it is simpler, more practical and easy at the bedside.",
        ]),
      ],
    },
    {
      id: "basic_investigations",
      title: "Reading pH, bicarbonate and PaCO₂",
      intro: "ABG and serum electrolytes should be done at the same time.",
      blocks: [
        table(
          ["Value", "Normal", "Low", "High", "Normal value means"],
          [
            ["pH", "7.4 (7.35 to 7.45)", "<7.35: acidosis/acidaemia", ">7.45: alkalosis/alkalaemia", "No disorder, or a mixed disorder (metabolic acidosis with respiratory alkalosis, metabolic acidosis with metabolic alkalosis, metabolic alkalosis with respiratory acidosis)"],
            ["HCO₃ (mEq/L)", "24 (22-26)", "<22: metabolic acidosis (primary) or respiratory alkalosis (secondary)", ">26: metabolic alkalosis (primary) or respiratory acidosis (secondary)", "Does not exclude a disorder: acute respiratory disturbances or mixed disorders (metabolic acidosis with metabolic alkalosis)"],
            ["PaCO₂ (mm of Hg)", "40 (35-45)", "<35: respiratory alkalosis (primary) or metabolic acidosis (secondary)", ">45: respiratory acidosis (primary) or metabolic alkalosis (secondary)", "Does not exclude a disorder: mixed disorders like metabolic acidosis with metabolic alkalosis"],
          ],
          "Interpretation of basic investigations (pp352–353)",
          "The pH paragraph on p352 is garbled in the transcript (\"presence of acid-base disorders. Mixed disorders mixed disorders (i.e., …\"); the reading above is the plain sense of it."
        ),
        formula(
          "H⁺ from PaCO₂ and HCO₃",
          "H⁺ = 24 × (PaCO₂ / HCO₃)",
          [
            { symbol: "H⁺", meaning: "hydrogen ion concentration", unit: "nmol/L" },
            { symbol: "PaCO₂", meaning: "arterial CO₂", unit: "mm Hg" },
            { symbol: "HCO₃", meaning: "serum bicarbonate", unit: "mEq/L" },
          ]
        ),
        table(
          ["pH", "6.9", "7.0", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"],
          [["H⁺ (nmol/L)", "125", "100", "80", "64", "51", "40", "32", "25", "20"]],
          "Table 30.7 pH value and corresponding H⁺ ion concentration (p352)",
          "H⁺ falls by 20% for each 0.1 pH unit increment."
        ),
        quote("ABG and serum electrolytes should be performed simultaneously for the correct interpretation of acid-base disorders.", "352"),
        quote("H⁺ = 24 x (PaCO₂/HCO₃)", "352"),
        quote("Normal value: 24 (22-26) mEq/L.", "352"),
      ],
    },
    {
      id: "anion_gap",
      title: "Anion gap, corrected anion gap and the delta ratio",
      blocks: [
        formula(
          "Anion gap",
          "AG = Na⁺ − (Cl⁻ + HCO₃)",
          [
            { symbol: "AG", meaning: "anion gap; normal value 12 ± 2", unit: "mEq/L" },
            { symbol: "Na⁺", meaning: "serum sodium", unit: "mEq/L" },
            { symbol: "Cl⁻", meaning: "serum chloride", unit: "mEq/L" },
            { symbol: "HCO₃", meaning: "serum bicarbonate", unit: "mEq/L" },
          ],
          { example: "Case 2 (p357): 140 − (106 + 8) = 26, high.", note: "Table 30.1 prints the normal range as 8 to 16 mEq/L.", calc: "anion_gap" }
        ),
        points([
          "The anion gap is the charge difference between unmeasured anions (anionic protein, phosphate, sulfate, organic acids) and unmeasured cations (calcium, magnesium, potassium); a raised gap chiefly reflects more unmeasured anion.",
          "Albumin accounts for most of the gap, so hypoalbuminaemia gives an artificially low calculated gap.",
          "Uses: to classify metabolic acidosis as high or normal AG; to detect hidden metabolic acidosis when pH, HCO₃ and pCO₂ are all normal (metabolic acidosis with metabolic alkalosis) — so always calculate it, irrespective of pH; and to reveal mixed or triple disorders.",
          "The transcript of p353 reads \"High AG in cases with pH, HCO₃, and pCO₂ suggests…\"; \"normal\" appears to be missing before pH. Kept as printed.",
        ]),
        formula(
          "Corrected anion gap",
          "Corrected AG = Measured AG + 2.5 × [4 − Serum Albumin (gm/dL)]",
          [
            { symbol: "Measured AG", meaning: "calculated anion gap", unit: "mEq/L" },
            { symbol: "Serum Albumin", meaning: "serum albumin", unit: "gm/dL" },
          ],
          { note: "Add 2.5 mEq/L for every 1 gm/dL fall in serum albumin." }
        ),
        table(
          ["Normal AG metabolic acidosis (anion gap <12)", "High AG metabolic acidosis (anion gap >12)"],
          [
            ["Renal tubular acidosis", "Lactic acidosis"],
            ["Diarrhoea", "Ketoacids (diabetic, alcohol, starvation)"],
            ["Ureterogastrointestinal fistulas", "Toxic ingestions (methanol, ethylene glycol, or salicylates)"],
            ["Renal failure", "Sepsis"],
            ["Large volume infusion of normal saline", "Renal failure"],
          ],
          "Table 30.8 Classification of metabolic acidosis based on anion gap (p353)",
          "Renal failure appears in both columns as printed."
        ),
        points([
          "In high AG metabolic acidosis compare the rise in AG (calculated AG − 12) with the fall in HCO₃ (24 − measured HCO₃). Equal values suggest pure high AG metabolic acidosis.",
          "Rise in AG significantly greater (printed \">5 mmol/L\") than the fall in HCO₃: consider superimposed metabolic alkalosis — added bicarbonate makes HCO₃ fall less.",
          "Rise in AG significantly less (printed \"<5 mmol/L\") than the fall in HCO₃: consider superimposed normal AG metabolic acidosis — extra bicarbonate loss makes HCO₃ fall more.",
        ], "Rise in AG vs fall in HCO₃"),
        formula(
          "Delta ratio",
          "Delta ratio = (Change in AG) / (Change in HCO₃)",
          [
            { symbol: "Change in AG", meaning: "rise in anion gap", unit: "mEq/L" },
            { symbol: "Change in HCO₃", meaning: "fall in bicarbonate", unit: "mEq/L" },
          ],
          { note: "0.8–1.2: uncomplicated high AG metabolic acidosis. <0.8: superimposed normal AG metabolic acidosis. >1.2: superimposed metabolic alkalosis." }
        ),
        quote("= Na⁺ - (Cl⁻ + HCO₃) = 12 ± 2 mEq/L (Normal Value)", "353"),
        quote("for every 1 gm/dL decline in serum albumin, add 2.5 mEq/L to the AG to obtain the corrected value", "353"),
        quote("always calculate the anion gap in ABG interpretation, irrespective of pH status", "353"),
        quote("If the rise in anion gap is significantly greater (>5 mmol/L) than the fall in HCO₃, consider the possibility of superimposed metabolic alkalosis.", "354"),
        quote("Delta ratio <0.8: Superimposed normal AG metabolic acidosis in high AG metabolic acidosis.", "354"),
        quote("Delta ratio >1.2: Superimposed metabolic alkalosis in high AG", "354"),
      ],
    },
    {
      id: "other_investigations",
      title: "Potassium, pulse oximetry, osmolal gap and urinary anion gap",
      blocks: [
        points([
          "Serum potassium, normal 3.5 to 5.5 mEq/L. Low: metabolic alkalosis (vomiting, diuretics), respiratory alkalosis (shift into cells), normal AG metabolic acidosis (diarrhoea, distal RTA). High: metabolic acidosis of renal failure, type 4 RTA, DKA, or respiratory acidosis.",
          "Pulse oximetry, normal 96–100%. Below 90% suggests significant tissue hypoxia, printed as corresponding to a PaO₂ \"of less than 60%\" (the unit appears to be a slip for mm Hg; kept as printed). It screens for hypoxaemia but says nothing about PaCO₂: hypercapnia can occur at 100% saturation.",
          "Other investigations for the cause: blood lactate, ketones and salicylates.",
        ]),
        formula(
          "Osmolal gap",
          "Osmolal Gap = Measured − Calculated Osmolality; Calculated Osmolality = 2 × Na⁺ + Glucose (mg/dL)/18 + BUN (mg/dL)/2.8",
          [
            { symbol: "Na⁺", meaning: "serum sodium", unit: "mEq/L" },
            { symbol: "Glucose", meaning: "blood glucose", unit: "mg/dL" },
            { symbol: "BUN", meaning: "blood urea nitrogen", unit: "mg/dL" },
          ],
          { note: "Normal usually <10 mOsm/kg; above 10 is significant. In anion gap metabolic acidosis the major causes of a significant gap are ethylene glycol or methanol ingestion and propylene glycol infusion. Useful for unexplained high AG acidosis when toxic alcohol is suspected." }
        ),
        formula(
          "Urinary anion gap",
          "UAG = Urinary (Na⁺ + K⁺) − Urinary Cl⁻",
          [
            { symbol: "Urinary Na⁺, K⁺, Cl⁻", meaning: "spot urine concentrations", unit: "mEq/L" },
          ],
          { note: "Separates gastrointestinal from renal causes of hyperchloraemic (normal AG) metabolic acidosis. Usually zero or positive." }
        ),
        table(
          ["UAG", "Meaning in normal AG metabolic acidosis", "Common causes"],
          [
            ["Positive (>20)", "Impaired or normal renal ammonium (acid) excretion", "Distal (type 1) RTA; hyperkalaemic (type 4) RTA in hypoaldosteronism; moderate kidney dysfunction"],
            ["Negative (<20)", "Increased ammonium excretion (>80 mEq/L)", "Severe diarrhoea; proximal (type 2) RTA; NH₄Cl administration; carbonic anhydrase inhibitor therapy; advanced chronic kidney disease"],
          ],
          "Urinary anion gap (p355)",
          "Both cut-offs are printed as 20 (\">20\" positive, \"<20\" negative); kept as printed."
        ),
        caution([
          "The urinary anion gap is less reliable with polyuria, urine pH above 6.5, or ammonium excreted with an anion other than chloride (keto acids, acetylsalicylic acid, D-lactic acid, large amounts of penicillin).",
        ]),
        quote("Normal value: 3.5 to 5.5 mEq/L.", "354"),
        quote("A saturation of less than 90% suggests significant tissue hypoxia, corresponding to a PaO₂ of less than 60%.", "354"),
        quote("The normal value of the osmolal gap is usually <10 mOsm/kg", "355"),
        quote("Urinary Anion Gap = Urinary (Na⁺ + K⁺) - Urinary Cl⁻", "355"),
        quote("a negative UAG results from increased ammonium excretion (i.e., >80 mEq/L).", "355"),
        quote("when urine pH is greater than 6.5", "355"),
      ],
    },
    {
      id: "step_by_step",
      title: "A step-by-step diagnostic approach",
      blocks: [
        steps([
          "Is there an acid–base disorder? Look at PaCO₂ and HCO₃. If abnormal, go to step 2. If normal, there is either no disorder or, in the critically ill, rule out a mixed disorder (step 5).",
          "Acidosis or alkalosis? pH <7.35 suggests acidosis/acidaemia; pH >7.45 suggests alkalosis/alkalaemia (normal 7.35–7.45).",
          "What is the primary disorder? Low pH with low HCO₃: metabolic acidosis; low pH with high PaCO₂: respiratory acidosis. High pH with high HCO₃: metabolic alkalosis; high pH with low PaCO₂: respiratory alkalosis.",
          "Is it mixed? (a) Check direction: HCO₃ and PaCO₂ moving in opposite directions suggests a mixed disorder. (b) Compare expected compensation with the actual value: more or less than expected suggests a mixed disorder. (c) Always check the anion gap, whatever the pH — it may be the only clue. (d) In high AG metabolic acidosis compare the rise in AG (AG − 12) with the fall in HCO₃ (24 − HCO₃): equal is pure; rise greater suggests coexisting metabolic alkalosis; rise smaller suggests HCO₃ loss (diarrhoea) causing non-AG metabolic acidosis.",
          "Clinical correlation and cause: correlate the ABG with the clinical picture and order further tests on judgement — the serum osmolal gap for unexplained toxic alcohol poisoning in high AG acidosis, the urinary anion gap to separate gastrointestinal from renal causes in normal AG acidosis.",
        ]),
        quote("Look at PaCO₂ and HCO₃ to determine whether they are in a normal range.", "355"),
        quote("If the actual value is either more or less as compared to the calculated expected compensation, it suggests mixed disorder.", "356"),
      ],
    },
    {
      id: "examples",
      title: "Worked examples",
      blocks: [
        table(
          ["Case", "Setting", "Values", "Working", "Book's conclusion"],
          [
            ["1", "Anxious, chest tightness", "pH 7.54, HCO₃ 21, PaCO₂ 21", "Acute: fall in HCO₃ = 0.2 × (40 − 21) = 3.8; expected HCO₃ 20.2, close to 21", "Primary respiratory alkalosis (anxiety)"],
            ["2", "Poorly controlled IDDM, insulin missed 3 days", "pH 7.1, HCO₃ 8, PaCO₂ 20, Na⁺ 140, Cl⁻ 106, urinary ketones +++", "Expected PaCO₂ = (8 × 1.5) + 8 = 20, matches; AG = 140 − (106 + 8) = 26", "High AG metabolic acidosis (DKA)"],
            ["3", "CHF on furosemide", "pH 7.48, HCO₃ 34, PaCO₂ 48", "Rise in PaCO₂ = 0.7 × (34 − 24) = 7.0; expected 47.0, close to 48", "Primary metabolic alkalosis (diuretics)"],
            ["4", "Sleeping pills, RR 4/min", "pH 7.1, HCO₃ 28, PaCO₂ 80, PaO₂ 42", "Acute: rise in HCO₃ = 0.1 × (80 − 40) = 4; expected 28, matches", "Primary respiratory acidosis (respiratory failure)"],
            ["5", "Severe diarrhoea, breathless", "pH 7.1, HCO₃ 14, PaCO₂ 44, K⁺ 2.0", "HCO₃ low but PaCO₂ high: opposite directions; very low K⁺ weakens respiratory muscles", "Metabolic acidosis with respiratory acidosis"],
            ["6", "Shock, ventilated 4 h", "pH 7.48, HCO₃ 14, PaCO₂ 22", "Acute: fall in HCO₃ = 0.2 × (40 − 22) = 3.6; expected 20.4, actual 14 lower", "Respiratory alkalosis with metabolic acidosis (shock-induced lactic acidosis)"],
            ["7", "COPD, severe vomiting", "pH 7.4, HCO₃ 36, PaCO₂ 60", "Normal pH with abnormal HCO₃ and PaCO₂: opposite effects on pH", "Respiratory acidosis with metabolic alkalosis"],
            ["8", "Hepatic failure, persistent vomiting", "pH 7.54, HCO₃ 38, PaCO₂ 44", "Rise in PaCO₂ = 0.7 × (38 − 24) = 9.8; expected 49.8, actual 44 lower", "Metabolic alkalosis with respiratory alkalosis"],
            ["9", "Poorly controlled IDDM, severe vomiting", "pH 7.4, HCO₃ 24, PaCO₂ 40, Na⁺ 136, Cl⁻ 84, urinary ketones +++", "AG = 136 − (84 + 24) = 28 despite normal pH, HCO₃, PaCO₂", "DKA with metabolic alkalosis"],
            ["10", "Abdominal pain, vomiting, oliguria, shock", "pH 7.46, HCO₃ 20, pCO₂ 29, Na⁺ 126, K⁺ 4.0, Cl⁻ 79", "Acute: fall in HCO₃ = 0.2 × 11 = 2.2; expected 21.8, actual 20. AG = 126 − (79 + 20) = 27; rise in AG 15 > fall in HCO₃ 4", "Respiratory alkalosis, high AG metabolic acidosis and metabolic alkalosis"],
          ],
          "Examples of acid–base disorders (pp356–359)",
          "HCO₃, Na⁺, K⁺, Cl⁻ in mEq/L; PaCO₂ and PaO₂ in mm Hg."
        ),
        quote("The anion gap is 26 (AG = Na⁺ - (Cl⁻ + HCO₃) = 140 - (106 + 8) = 140 - 114 = 26", "357"),
        quote("Rise in AG = 27 - 12 = 15", "359"),
      ],
    },
  ],
};
