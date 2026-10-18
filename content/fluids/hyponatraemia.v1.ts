import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPONATRAEMIA — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 20 of the full edition (book pages 219–242). Every number below is the
 * book's; the quotes give the printed page it came from.
 */
export const hyponatraemiaV1: FluidTopic = {
  id: "hyponatraemia",
  version: "1.0.0",
  title: "Hyponatraemia: diagnosis and correction",
  group: "electrolytes",
  summary: "Low serum sodium: the stepwise work-up, hypertonic saline boluses for severe symptoms, safe correction limits, SIADH and its second-line drugs.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["20 Hyponatremia"], pages: "219–242", pageKind: "book" },
  sections: [
    {
      id: "physiology",
      title: "Sodium and water physiology",
      intro: "Disorders of sodium concentration are primarily disorders of water, not of total body sodium.",
      blocks: [
        points([
          "Serum sodium concentration = total body sodium / total body water: it falls when body water rises.",
          "Normal serum osmolality is 275–290 mOsm/kg; hyponatraemia is usually associated with low serum osmolality.",
          "Thirst is stimulated by a 1–2% rise in ECF osmolality (the most important stimulus), a 10–15% fall in plasma volume, hypotension and angiotensin II.",
          "ADH inserts aquaporin channels in the collecting duct; up to 18 litres of water can be reabsorbed there under its influence.",
          "Water excess is handled by less ADH, more atrial natriuretic peptide and suppressed thirst.",
          "Sodium: 140 mEq/L in ECF vs 10 mEq/L intracellular; total body sodium about 3,500 to 5,000 mEq; over 90% of ECF osmolality.",
          "Daily sodium requirement about 1 mEq/kg/day; 1 g of sodium chloride contains 17.1 mEq sodium; sweat sodium 40–60 mEq/L.",
          "ECF volume reflects total body sodium content. Effective arterial blood volume normally moves with ECF volume, except in heart failure and cirrhosis, where ECF is increased but EABV is reduced.",
        ]),
        formula(
          "Calculated serum osmolality",
          "Serum osmolality = 2 [Na⁺] + Glucose/18 + BUN/2.8",
          [
            { symbol: "Na⁺", meaning: "Serum sodium", unit: "mEq/L" },
            { symbol: "Glucose", meaning: "Blood glucose", unit: "mg/dL" },
            { symbol: "BUN", meaning: "Blood urea nitrogen", unit: "mg/dL" },
          ],
          { note: "Result in mOsm/kg. The work-up itself uses measured osmolality (freezing point depression osmometer).", calc: "serum_osmolality" }
        ),
        quote("Serum Osmolality (Calculated) = 2 [Na⁺] + Glucose/18 + BUN/2.8", "220"),
        quote("1 gm of sodium chloride contains 17.1 mEq sodium.", "221"),
        quote("The daily sodium requirement is about 1 mEq/kg/day", "221"),
        table(
          ["Feature", "Water regulation (osmoregulation)", "ECF volume (sodium content regulation)"],
          [
            ["Regulation of", "The proportion of sodium to water (osmolality)", "Total body sodium and water (ECF volume)"],
            ["What is sensed?", "Plasma osmolality", "Effective circulating volume"],
            ["Sensor", "Hypothalamic osmoreceptors", "Vascular volume receptors (carotid sinus, aortic arch, renal afferent arterioles, atria)"],
            ["Effector pathways", "Thirst, antidiuretic hormone", "Renin-angiotensin-aldosterone system, sympathetic nervous system, ANP, ADH"],
            ["Response to excess", "Water excess, low plasma osmolality: inhibit ADH release, causing increased excretion of diluted urine; suppress thirst and reduce water intake. Net effect: excretion of excess water and correction of low osmolality", "Hypervolaemia/ECF Na⁺ excess: increases renal loss of sodium and water; reduce thirst; peripheral vasodilatation. Net effect: excretion of excess salt and water causing correction of hypervolaemia"],
            ["Response to deficit", "Water deficit, high plasma osmolality: stimulate thirst and water intake, increase ADH release, causing water reabsorption. Net effect: retention of water and correction of high osmolality", "Hypovolaemia/ECF Na⁺ deficit: increases renal absorption of sodium and water; increased thirst and salt craving; peripheral vasoconstriction. Net effect: retention of salt and water causing correction of hypovolaemia"],
            ["Method to assess", "Primarily laboratory evaluation", "Primarily physical examination"],
          ],
          "Table 20.1 Regulation of water and sodium balance"
        ),
      ],
    },
    {
      id: "classification",
      title: "Definition, classification and severity",
      blocks: [
        points([
          "Hyponatraemia is serum sodium <135 mEq/L; it occurs in about 15% to 30% of hospitalised patients and about 7% of ambulatory patients.",
          "It usually means water excess, not sodium deficiency: the idea that all patients need sodium supplementation is called a wrong concept.",
          "It is linked with longer hospital stay, readmission and higher mortality.",
        ]),
        quote("Hyponatremia is defined as serum sodium <135 mEq/L", "222"),
        table(
          ["Basis", "Category 1", "Category 2", "Category 3"],
          [
            ["Measured serum osmolality", "Hypotonic (true): low osmolality <280 mOsm/kg", "Isotonic: normal osmolality 280–295 mOsm/kg", "Hypertonic: high osmolality >295 mOsm/kg"],
            ["Time of development", "Acute <48 hours", "Chronic >48 hours", "Unknown: chronic"],
            ["Severity of sodium concentration", "Mild 130–135 mEq/L", "Moderate 125–129 mEq/L", "Severe <125 mEq/L"],
            ["Degree of symptoms", "Mild: none, symptoms of chronic hyponatraemia", "Moderate: nausea, headache, confusion", "Severe: vomiting, seizures, coma, death"],
            ["Volume status", "Hypovolaemic", "Hypervolaemic", "Euvolaemic"],
          ],
          "Table 20.2 Classification of hyponatraemia",
          "Table 20.2 puts normal osmolality at 280–295 mOsm/kg; the text, Figure 20.1 and Table 20.5 use 275–290 mOsm/kg. Both are printed."
        ),
        quote("Mild 130–135 mEq/L", "224"),
        quote("Severe <125 mEq/L", "224"),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      blocks: [
        points([
          "Symptoms depend on the rate of onset, the severity and the duration (acute or chronic, less or more than 48 hours).",
          "Acute and severe hyponatraemia is symptomatic; chronic and mild hyponatraemia is well tolerated with vague, nonspecific symptoms.",
          "Symptoms are neurological: hypo-osmolality swells brain cells inside a rigid skull, raising intracranial pressure; severe cases herniate (unequal or fixed dilated pupils, hypoventilation, cardiovascular instability, incontinence, respiratory arrest).",
          "Mild chronic hyponatraemia: fatigue, attention deficits, memory loss, unsteady gait, recurrent unexplained falls, osteoporosis, bone fragility and fractures, more common in the elderly.",
        ]),
        table(
          ["Severity", "Serum sodium (mEq/L)", "Symptoms"],
          [
            ["Mild", "130–135", "Usually asymptomatic, symptoms of chronic hyponatraemia"],
            ["Moderate", "125–129", "Nausea, malaise, mild lethargy, weakness, cramps, headache, confusion"],
            ["Severe", "<125", "Vomiting, delirium, drowsiness, diminished reflexes, convulsions, coma, death"],
          ],
          "Table 20.3 Manifestations of acute hyponatraemia"
        ),
        quote("Moderate 125–129 Nausea, malaise, mild lethargy, weakness, cramps, headache, confusion", "225"),
      ],
    },
    {
      id: "diagnosis",
      title: "Step-by-step diagnosis",
      intro: "Three crucial tests (serum osmolality, urine osmolality, urine sodium) plus a volume assessment (Figure 20.1).",
      blocks: [
        steps([
          "Step 1, history and examination: duration (acute or chronic), cause (diarrhoea, vomiting), underlying illness (heart failure, cirrhosis, nephrotic syndrome, hypothyroidism, adrenal insufficiency), drugs (diuretics, antihypertensives, antidepressants, hypotonic IV fluids). Examine hydration and look for serious signs of cerebral oedema.",
          "Step 2, measured serum osmolality: normal (275–290 mOsm/kg) points to pseudohyponatraemia; high (>290 mOsm/kg) to hypertonic hyponatraemia; low (<275 mOsm/kg) confirms true hypotonic hyponatraemia.",
          "Step 3, urine osmolality: low (<100 mOsm/kg) suggests psychogenic polydipsia, low solute intake (beer potomania, tea and toast diet) or reset osmostat; high (>100 mOsm/kg) means water excretion is impaired (hypovolaemia, SIADH, adrenal insufficiency).",
          "Step 4, volume status: hypovolaemic, hypervolaemic or euvolaemic; treatment differs between the three.",
          "Step 5, urine sodium: separates renal from extrarenal loss (Table 20.7).",
          "Step 6, further tests: uric acid and urea, glucose, creatinine, protein, triglycerides, potassium, thyroid function, ACTH and ACTH stimulation, acid–base.",
          "Step 7, isotonic saline challenge when hypovolaemia versus SIADH is equivocal: sodium rises with saline in hypovolaemia; a fall after saline suggests SIADH.",
        ]),
        quote("Normal (275–290 mOsm/kg) → Pseudohyponatremia", "226"),
        quote("Low (<275 mOsm/kg) → True Hypotonic Hyponatremia", "226"),
        quote("Low urine osmolality (<100 mOsm/kg) with diluted urine suggests psychogenic polydipsia", "228"),
        table(
          ["Test and result"],
          [
            ["1. Serum osmolality. Low: true hyponatraemia. Normal or elevated: pseudohyponatraemia or hypertonic hyponatraemia"],
            ["2. Urine osmolality. Low (<100 mOsm/kg): diluted urine suggests primary polydipsia with normal water excretion, low solute intake (beer potomania syndrome), post TURP. High (>100 mOsm/kg): conditions in which water excretion is impaired (hypovolaemia, SIADH, adrenal insufficiency)"],
            ["3. Urine sodium concentration. <20 mEq/L: hypovolaemia, cirrhosis, congestive heart failure. >20 mEq/L: SIADH, adrenal insufficiency, or renal salt wasting (diuretics, renal disease, or hypoaldosteronism)"],
          ],
          "Table 20.4 Major steps in the initial evaluation of hyponatraemia"
        ),
        quote("<20 mEq/L: Hypovolemia, cirrhosis, congestive heart failure", "226"),
        table(
          ["Volume status", "Urinary Na⁺ <20 mEq/L", "Urinary Na⁺ >20 mEq/L"],
          [
            ["1. Hypovolaemia: dry tongue, reduced skin turgor, tachycardia, low BP, or postural hypotension", "Extra-renal losses: diarrhoea, vomiting, burns, pancreatitis", "Renal losses: diuretics, Addison's disease, cerebral salt wasting syndrome, salt-losing nephropathy"],
            ["2. Euvolaemic", "Primary polydipsia, water intoxication, decreased solute intake", "SIADH, glucocorticoid deficiency, hypothyroidism, drugs"],
            ["3. Hypervolaemic: oedema, ascites, increased JVP, basal lung crackles", "Congestive heart failure, cirrhosis, nephrotic syndrome", "Renal failure, any cause"],
          ],
          "Table 20.7 Classification by volume status and urine sodium"
        ),
        points([
          "Low uric acid and urea favour euvolaemic hyponatraemia; both are high in hypovolaemic hyponatraemia.",
          "Serum protein is high in multiple myeloma and low in cirrhosis.",
          "High potassium suggests renal insufficiency, adrenal insufficiency with hypoaldosteronism, or a fixed-dose ARB with hydrochlorothiazide; low potassium suggests diuretics, diarrhoea or vomiting.",
          "Metabolic alkalosis with hypokalaemia suggests vomiting or diuretics; metabolic acidosis with hypokalaemia suggests diarrhoea, with hyperkalaemia adrenal insufficiency.",
        ], "Step 6 in detail"),
      ],
    },
    {
      id: "osmolality",
      title: "Pseudohyponatraemia and hypertonic hyponatraemia",
      blocks: [
        points([
          "Pseudohyponatraemia (isotonic): a laboratory artefact of indirect ion-specific electrode or flame photometry in marked hyperlipidaemia or hyperproteinaemia. Measure sodium by direct ion-specific electrode and always check cholesterol and triglycerides. It needs no therapy.",
          "Hypertonic (translocational) hyponatraemia: glucose, mannitol, glycerol, glycine, sorbitol or hyperosmolar contrast pull water out of cells and dilute sodium. Hyperglycaemia is the most common cause in hospital. Treat the cause.",
          "In severe hyperglycaemia a normal measured sodium actually suggests hypernatraemia.",
        ]),
        table(
          ["Hyponatraemia", "Serum osmolality", "Etiology", "Mechanism"],
          [
            ["True hypotonic", "Low <275 mOsm/kg", "Multiple (Table 20.7)", "Reduced ratio of sodium to water due to water excess or sodium deficit"],
            ["Pseudohyponatraemia", "Normal 275–290 mOsm/kg", "Severe hyperlipidaemia and hyperproteinaemia", "An increased nonaqueous portion of the serum is responsible for falsely low Na⁺ concentration"],
            ["Hypertonic or translocational", "High >290 mOsm/kg", "Hyperglycaemia, mannitol, glycerol, glycine, or sorbitol", "Hypertonicity shifts water from ICF to the ECF, causing hyponatraemia due to dilution"],
          ],
          "Table 20.5 Interpretation of measured serum osmolality"
        ),
        table(
          ["Cause", "Equation", "Worked example"],
          [
            ["Hyperglycaemia", "For each 100 mg/dL increase in glucose above 100 mg/dL, sodium falls by 1.6 mEq/L; the factor is 2.4 when blood sugar is >400 mg/dL. Corrected Na⁺ = measured Na⁺ + 1.6 × [(glucose − 100)/100]", "Glucose 400, sodium 130: 130 + 1.6 × 3 = 134.8 mEq/L"],
            ["Hypertriglyceridaemia", "For each 500 mg/dL increase in triglyceride above 100 mg/dL, sodium falls by 1.0 mEq/L. Corrected Na⁺ = measured Na⁺ + 1.0 × [(triglyceride − 100)/500]", "Triglyceride 1200, sodium 130: 130 + 1.0 × 2.2 = 132.2 mEq/L"],
            ["Hyperproteinaemia", "For every 1 g/dL rise in protein above 8 g/dL, sodium falls by 4.0 mEq/L. Corrected Na⁺ = measured Na⁺ + 4.0 × [protein − 8]", "Protein 11, sodium 130: 130 + 4.0 × 3 = 142.0 mEq/L"],
          ],
          "Table 20.6 Corrected sodium in hypertonic and isotonic hyponatraemia"
        ),
        formula(
          "Sodium corrected for hyperglycaemia",
          "Corrected Na⁺ = Measured Na⁺ + 1.6 × (Glucose − 100)/100; factor 2.4 when glucose >400 mg/dL",
          [
            { symbol: "Measured Na⁺", meaning: "Measured serum sodium", unit: "mEq/L" },
            { symbol: "Glucose", meaning: "Serum glucose", unit: "mg/dL" },
          ],
          { example: "Glucose 400 mg/dL, sodium 130 mEq/L → 134.8 mEq/L", calc: "corrected_sodium_glucose" }
        ),
        quote("the suggested formula will be a fall of 2.4 mEq/L in serum sodium for every 100 mg/dL increase in", "227"),
        quote("= 130 + 1.6 × 3 = 130 + 4.8 = 134.8 mEq/L", "228"),
        quote("for every 500 mg/dL increase in serum triglyceride concentration (above 100 mg/dL), serum sodium will decrease by 1.0 mEq/L", "227"),
        quote("for every 1 gm/dL increase in serum protein (above 8 gm/dL), serum sodium will decrease by 4.0 mEq/L", "227"),
      ],
    },
    {
      id: "special",
      title: "Causes of special importance",
      blocks: [
        points([
          "Diuretics: hyponatraemia usually occurs with thiazides rather than loop diuretics, commonly in older women with low body mass. Thiazides combine urinary sodium loss, reduced free water excretion, ADH-driven water retention and thirst. Loop diuretics produce hypotonic urine and are even used to treat euvolaemic and hypervolaemic hyponatraemia.",
          "SIADH: the most common cause of euvolaemic hyponatraemia; high urinary sodium, osmolality and specific gravity despite low serum sodium.",
          "Cerebral salt wasting: in acute neurological disorders, most commonly subarachnoid haemorrhage; urinary sodium loss with ECF depletion. Its treatment is the opposite of SIADH (Table 20.8).",
          "Exercise-associated hyponatraemia: acute, severe and potentially life-threatening, most commonly after endurance exercise; excess free water intake with persistent ADH secretion.",
        ]),
        table(
          ["Feature", "CSW", "SIADH"],
          [
            ["Mechanism", "Excessive excretion of sodium and water by the kidney", "Retention of water by kidney due to increased ADH"],
            ["Intracranial diseases (similar)", "Common", "Common"],
            ["Serum sodium concentration (similar)", "Decreased", "Decreased"],
            ["Urinary sodium excretion (similar)", "Increased", "Increased"],
            ["Serum uric acid (similar)", "Decreased", "Decreased"],
            ["Initial fractional excretion of urate (similar)", "High", "High"],
            ["Renal/adrenal/thyroid function (similar)", "Normal", "Normal"],
            ["Incidence", "Rare", "Common"],
            ["ECF volume status", "Hypovolaemia", "Euvolaemia or hypervolaemia"],
            ["Postural hypotension", "Present", "Absent"],
            ["Body weight", "Decreased", "Normal/slightly increased"],
            ["Urine volume", "Normal or low", "High"],
            ["BUN", "Increased", "Normal"],
            ["Fractional excretion of urate after correction", "High", "Normal"],
            ["Brain natriuretic peptide level", "Increased", "Normal"],
            ["Serum ADH", "Normal", "High"],
            ["Effective measures", "Salt and fluid supplementation, fludrocortisone", "Fluid restriction, 3% NaCl, vaptans"],
            ["Response to normal saline", "Corrects hyponatraemia", "May worsen hyponatraemia"],
            ["Avoid", "Fluid restriction, diuretics, vaptans", "Normal saline, hypotonic fluids, liberal intake of fluids"],
          ],
          "Table 20.8 Cerebral salt wasting vs SIADH"
        ),
      ],
    },
    {
      id: "management",
      title: "Management principles",
      blocks: [
        points([
          "There is no fixed protocol. Treatment depends on symptom severity, duration (acute within 48 hours, chronic >48 hours), volume status and cause.",
          "Goals: treat neurological emergencies urgently; avoid too slow or too fast correction; individualise, treat the cause, monitor and prevent recurrence.",
        ]),
        table(
          ["Axis", "Finding", "Approach (Figure 20.2)"],
          [
            ["Symptoms", "Severe", "3% NaCl bolus, fluid restriction, ± loop diuretics"],
            ["Symptoms", "Moderate", "3% NaCl slow infusion, fluid restriction, ± loop diuretics or vaptans"],
            ["Symptoms", "Minimal", "General measures"],
            ["Volume status", "Hypovolaemia", "IV saline or balanced fluid, avoid hypotonic fluids"],
            ["Volume status", "Hypervolaemia", "Salt and fluid restriction, avoid IV fluids, loop diuretics ± vaptans"],
            ["Volume status", "Euvolaemia", "Fluid restriction, supplement salt, loop diuretics, oral urea ± vaptans"],
            ["All", "General measures", "Stop offending agents, etiological treatment, monitoring, daily weight"],
          ],
          "Figure 20.2 Management of hyponatraemia"
        ),
      ],
    },
    {
      id: "severe",
      title: "Severely symptomatic hyponatraemia",
      intro: "Urgent treatment is justified irrespective of biochemical degree, timing and volume status.",
      blocks: [
        steps([
          "Give 3% NaCl, the preferred agent, in a peripheral vein.",
          "American guidelines 2013: 100 mL bolus of 3% saline IV over 10 minutes; if severe neurological symptoms persist, repeat twice (total 300 mL).",
          "European guidelines 2014: 150 mL bolus of 3% saline over 20 minutes, repeated in symptomatic patients after measuring serum sodium between infusions.",
          "Prefer rapid intermittent bolus to slow continuous infusion: more effective, less risk of overcorrection, no calculations; supported by both guidelines and the SALSA trial (2021).",
          "If hypertonic saline is not readily available: 50 mL bolus of 8.4% sodium bicarbonate (50 mEq sodium, as in 100 mL of 3% NaCl), infused slowly over 5–10 minutes; avoid in metabolic alkalosis.",
          "Hypervolaemic patients: add a loop diuretic to increase free water excretion and avoid volume overload.",
          "Initial goal: raise serum sodium by 4–6 mEq/L.",
        ]),
        quote("The infusion of a 100 mL bolus of 3% hypertonic saline intravenously over 10 minutes is recommended for initial treatment (American Guidelines 2013)", "233"),
        quote("this bolus may be repeated twice (for a total dose of 300 mL)", "233"),
        quote("150 mL bolus infusions of 3% saline (to be given over 20 minutes)", "233"),
        quote("A 50 ml bolus of hypertonic bicarbonate (8.4% sodium bicarbonate) is an effective alternative option", "233"),
        quote("Slow bicarbonate infusion (over 5–10 minutes) is recommended", "233"),
        quote("The goal of initial urgent treatment is to raise serum sodium by 4–6 mEq/L", "233"),
      ],
    },
    {
      id: "rate",
      title: "Rate of correction and osmotic demyelination",
      intro: "Hyponatraemia that develops quickly should be treated fast; hyponatraemia that develops slowly should be corrected slowly.",
      blocks: [
        table(
          ["Situation", "ODS risk", "Limit"],
          [
            ["Acute symptomatic", "Normal", "Not more than 10 mEq/L over the first 24 hours, then 8 mEq/L a day"],
            ["Acute symptomatic", "High", "Not more than 8 mEq/L over 24 hours on any day"],
            ["Chronic", "Low", "Not more than 4–8 mEq/L over 24 hours"],
            ["Chronic", "High", "Not more than 4–6 mEq/L over 24 hours"],
          ],
          "Correction limits",
          "The goal is sodium up to 130 mEq/L, not normal. Table 20.12 (SIADH) instead prints a rise of 10–12 mEq/day in acute and 4–6 mEq in 24 hours in chronic hyponatraemia; the text limits acute correction to 10 mEq/L in the first 24 hours. Both are printed. The chapter gives no separate 48-hour limit."
        ),
        quote("the rate of correction should not exceed 10 mEq/L over the first 24 hours", "234"),
        quote("In patients at high risk of ODS, the correction rate should not exceed 8 mEq/L over 24 hours on any day", "234"),
        quote("should not exceed 4–8 mEq/L over 24 hours, and in high-risk patients for ODS, it should not exceed 4–6 mEq/L over 24 hours", "234"),
        quote("The goal of correction of sodium is up to 130 mEq/L and not its normal value", "234"),
        caution([
          "ODS risk factors: hypokalaemia, cirrhosis, alcoholism, malnutrition, older women on thiazide diuretics, initial sodium <115 mEq/L.",
          "ODS symptoms are delayed 2–6 days after overcorrection: lethargy, dysarthria, dysphasia, flaccid paresis, coma, locked-in syndrome. MRI is the preferred test.",
          "Inadvertent overcorrection: 5% dextrose and desmopressin re-lower sodium to an acceptable level. The chapter gives no doses for this.",
          "Chronic hyponatraemia, even asymptomatic, still needs treatment (falls, fractures, gait), but always gradually.",
        ], "Osmotic demyelination syndrome"),
        quote("low initial serum sodium level (<115 mEq/L) are prone to develop ODS", "234"),
        quote("usually delayed by 2–6 days following rapid overcorrection", "234"),
      ],
    },
    {
      id: "volume",
      title: "Treatment by volume status",
      blocks: [
        points([
          "0.9% saline or balanced crystalloid at 0.5–1.0 mL/kg per hour corrects most cases.",
          "Restrict plain water and low-sodium fluids (dextrose solutions, 0.45% NaCl, all Isolyte solutions).",
          "Diuretic-induced: stop the diuretic, supplement salt and potassium. Cerebral salt wasting: fludrocortisone.",
        ], "Hypovolaemic"),
        quote("0.9% normal saline or balanced crystalloid solution at 0.5–1.0 mL/kg per hour", "235"),
        points([
          "Usually asymptomatic in heart failure and cirrhosis; salt supplementation is generally avoided.",
          "Mainstays: salt restriction and fluid restriction (intake less than insensible losses plus urine output). Loop diuretics are first line; spironolactone helps prevent hypokalaemia.",
          "Vaptans selectively as second line if fluid restriction and loop diuretics fail.",
          "Acute severe symptomatic oedematous patients: cautious 3% NaCl with fluid restriction and high-dose furosemide.",
          "Renal failure, oliguria and overload not responding: haemodialysis.",
        ], "Hypervolaemic"),
        points([
          "Treat the cause; SIADH is the most common. Stop drugs that cause SIADH.",
          "Adrenal insufficiency: glucocorticoid at maintenance or stress doses. Hypothyroidism: thyroid hormone.",
        ], "Euvolaemic"),
      ],
    },
    {
      id: "formulas",
      title: "Formulas for estimating correction",
      blocks: [
        formula(
          "Conventional formula",
          "Sodium requirement = (Desired Na⁺ − Actual Na⁺) × Total body water",
          [
            { symbol: "Desired Na⁺", meaning: "Target serum sodium", unit: "mEq/L" },
            { symbol: "Actual Na⁺", meaning: "Measured serum sodium", unit: "mEq/L" },
            { symbol: "Total body water", meaning: "Total body water", unit: "L" },
          ],
          { note: "Result in mEq of sodium. 2 mL of 3% NaCl contains 1 mEq sodium.", calc: "sodium_requirement" }
        ),
        quote("Sodium Requirement = (Desired Na⁺ - Actual Na⁺) × Total Body Water", "235"),
        formula(
          "Adrogué–Madias formula",
          "Change in serum Na⁺ = (Infusate Na⁺ − Serum Na⁺) / (Total body water + 1)",
          [
            { symbol: "Infusate Na⁺", meaning: "Sodium in 1 L of the chosen fluid (Table 20.9)", unit: "mEq/L" },
            { symbol: "Serum Na⁺", meaning: "Measured serum sodium", unit: "mEq/L" },
            { symbol: "Total body water", meaning: "Total body water", unit: "L" },
          ],
          { note: "Predicted rise in serum sodium per litre infused, mEq/L. The book warns it carries a risk of inadvertent overcorrection.", calc: "adrogue_madias" }
        ),
        quote("Change in Serum Sodium Concentration = (Infusate Na / L – Serum Na) / (Total Body Water (L) + 1)", "236"),
        formula(
          "3% saline rule",
          "1 mL/kg of 3% NaCl raises serum Na⁺ by 1 mEq/L",
          [
            { symbol: "mL/kg", meaning: "Volume of 3% NaCl per kg body weight", unit: "mL/kg" },
          ],
          { note: "2 mL of 3% NaCl contains 1 mEq of sodium." }
        ),
        quote("Administration of 1mL/kg of 3% NaCl (hypertonic saline) increases the serum Na⁺ by 1mEq/L.", "236"),
        caution([
          "These methods are only a rough guide; the Adrogué formula risks inadvertent overcorrection.",
          "Equations cannot predict sodium change reliably with 3% NaCl: fluid restriction, milder SIADH, furosemide and rapid changes in urine composition all shift the result. Rely on frequent sodium measurements instead.",
        ]),
        quote("Different equations and formulas cannot predict serum sodium change reliably while infusing 3% NaCl", "240"),
        quote("rely on frequent measurements of the serum sodium for correcting hyponatremia", "241"),
      ],
    },
    {
      id: "general",
      title: "General measures, fluids and monitoring",
      blocks: [
        points([
          "Treat the cause: stop thiazides, SSRIs and antiepileptics; restrict water in psychogenic polydipsia; replace volume; treat postoperative pain and hypothyroidism; replace glucocorticoid in adrenal insufficiency.",
          "Restrict free water regardless of volume status: total oral and IV intake generally less than 1.0 to 1.5 litre per day in hypervolaemic or euvolaemic patients.",
          "Monitor neurological status, vitals, volume status, fluid balance and electrolytes serially; step down as symptoms resolve.",
          "With hypertonic saline in acutely symptomatic patients, check serum sodium 2–4 hourly.",
        ]),
        quote("less than 1.0 to 1.5 liter per day in hypervolemic or euvolemic patients", "236"),
        quote("monitor serum sodium very closely (2–4 hourly)", "234"),
        table(
          ["Solution", "Solution Na⁺ (mEq/L)", "IV fluid", "IV fluid Na⁺ (mEq/L)"],
          [
            ["8.4% NaHCO₃", "1000", "Ringer's lactate", "130"],
            ["7.5% NaHCO₃", "900", "0.45% NaCl", "77"],
            ["5% NaCl", "855", "Isolyte-G", "65"],
            ["3% NaCl", "513", "Isolyte-M", "40"],
            ["0.9% NaCl", "154", "0.2% NaCl", "34"],
            ["PlasmaLyte", "140", "5% dextrose", "0"],
          ],
          "Table 20.9 Sodium concentration of IV fluids",
          "The text says 8.4% sodium bicarbonate has 1 mEq sodium per mL; the table prints 1000 mEq/L."
        ),
        quote("8.4% NaHCO₃ 1000 Ringer's lactate 130", "237"),
      ],
    },
    {
      id: "siadh",
      title: "SIADH: causes and diagnosis",
      blocks: [
        points([
          "ADH secretion independent of osmotic or haemodynamic stimuli; water retention dilutes sodium; ECF expansion lowers aldosterone and raises ANP, causing natriuresis and concentrated urine; higher renal blood flow keeps oedema from appearing.",
          "Causes: increased hypothalamic secretion, ectopic ADH (usually malignancy), enhanced ADH effect (chlorpropamide), or ADH-like drugs.",
        ]),
        table(
          ["Group", "Causes"],
          [
            ["Central nervous system disorders", "Stroke, trauma, subarachnoid haemorrhage, meningitis, encephalitis"],
            ["Malignancies", "Small-cell carcinoma of the lung, carcinoma of the gastrointestinal tract"],
            ["Pulmonary diseases", "Pneumonia, tuberculosis, acute respiratory failure, positive pressure ventilation"],
            ["Drugs", "Carbamazepine, oxcarbazepine, SSRIs, chlorpropamide, cyclophosphamide, desmopressin (DDAVP), and other drugs"],
            ["Miscellaneous", "HIV infection, nausea, and postoperative pain"],
          ],
          "Table 20.10 Common etiology of SIADH"
        ),
        table(
          ["Type", "Criterion"],
          [
            ["Essential", "Hypotonic hyponatraemia (low serum osmolality <275 mOsm/kg H₂O)"],
            ["Essential", "Clinical euvolaemia; exclude hypovolaemia and hypervolaemia"],
            ["Essential", "Inappropriately concentrated urine (urinary osmolality high >100 mOsm/kg H₂O)"],
            ["Essential", "Elevated urinary [Na⁺] (>30 mEq/L) with normal dietary sodium intake"],
            ["Essential", "Absence of adrenal insufficiency, hypothyroidism, renal disease with salt wastage, cirrhosis, or heart failure"],
            ["Essential", "No recent use of diuretic agents"],
            ["Supporting", "Low serum uric acid (<4 mg/dL)"],
            ["Supporting", "Low blood urea nitrogen <10 mg/dL"],
            ["Supporting", "Fractional excretion of uric acid >10%"],
            ["Supporting", "Abnormal response to water load (excretion of <80% of a 20 mL/kg load in 4 h)"],
            ["Supporting", "Failure to improve or worsening of hyponatraemia after 0.9% saline infusion"],
            ["Supporting", "Correction of hyponatraemia with fluid restriction"],
          ],
          "Table 20.11 Diagnostic criteria of SIADH",
          "SIADH criteria use urine sodium >30 mEq/L; Tables 20.4 and 20.7 split urine sodium at 20 mEq/L."
        ),
        quote("Elevated urinary [Na⁺] (>30 mEq/L) with normal dietary sodium intake", "239"),
        quote("Abnormal response to water load (excretion of <80% of a 20 mL/kg load in 4 h)", "239"),
      ],
    },
    {
      id: "siadh_treatment",
      title: "SIADH: treatment",
      intro: "First line is water restriction; if it fails or symptoms persist, increase water excretion.",
      blocks: [
        table(
          ["Setting", "Measures"],
          [
            ["All", "Treat underlying etiology"],
            ["Acute", "Water restriction, hypertonic saline, furosemide, avoid hypotonic fluids"],
            ["Chronic", "Water restriction, high salt, furosemide, high protein diet, vaptans, oral urea, demeclocycline, lithium"],
            ["Target", "Gradual rise of sodium to 130 mEq/L; rate of rise 10–12 mEq/day in acute and 4–6 mEq in 24 hours in chronic hyponatraemia"],
          ],
          "Table 20.12 Treatment of SIADH"
        ),
        quote("Rate of rise of sodium 10–12 mEq/day in acute hyponatremia and 4–6 mEq in 24 hours in chronic hyponatremia", "239"),
        points([
          "Daily fluid intake less than 800 mL, or 500 mL below the 24-hour urine volume. Intake counts every drink and every IV solution.",
          "Slow (several days) and limited by thirst; many patients need second-line therapy.",
          "Predictors of poor response: urine volume <1500 mL/d, urine osmolality >500 mOsm/kg H₂O, Furst ratio >1 (urine Na⁺ + K⁺ exceeds serum Na⁺).",
          "Avoid fluid restriction in subarachnoid haemorrhage (cerebral vasospasm and infarction).",
        ], "Fluid restriction"),
        quote("500 mL below the 24-hour urine volume to achieve fluid restriction", "238"),
        quote("the daily fluid intake recommended in SIADH is less than 800 ml", "238"),
        quote("low urine volume (<1500 mL/d), the high osmolality of urine (>500 mOsm/kg H₂O), and the Furst equation ratio >1", "239"),
        points([
          "Sodium rises only when the infused fluid's osmolality exceeds the urine's (0.9% NaCl = 308 mOsm/kg; 3% NaCl = 1026 mOsm/kg).",
          "With urine fixed at 600 mOsm/kg, 1,000 mL of 0.9% saline (about 300 mOsm) is excreted in 500 mL, retaining about 500 mL of water: normal saline can worsen hyponatraemia (desalination).",
          "1,000 mL of 3% NaCl is excreted in about 1,700 mL of urine, losing about 700 mL of retained water. Fluid restriction and furosemide enhance this.",
        ], "Why saline strength matters"),
        quote("When 1,000 ml of 3% NaCl is infused, all NaCl is excreted in a larger volume of urine, approximately 1,700 ml.", "240"),
      ],
    },
    {
      id: "siadh_drugs",
      title: "SIADH: diuretics, solute and drugs",
      blocks: [
        points([
          "Loop diuretics: low dose as second line for short-term treatment of moderate or profound SIADH (European guidelines); limited long-term role. Furosemide twice a day with salt, especially when urine osmolality is greater than 500 mOsm/kg, in SIADH of limited duration.",
          "Oral salt: 1 g NaCl tablet gives about 17 mEq sodium; usually with a loop diuretic, 6–9 g per day in divided doses (2–3 tablets three times a day).",
          "Oral urea: with fluid restriction, emerging as front line for chronic hyponatraemia; 15 g packets, usual dose 15–60 g per day. Avoid in severe renal failure and in cirrhosis with hepatic encephalopathy.",
          "High-protein diet also increases free-water excretion.",
        ]),
        quote("the dose commonly used is 6–9 gm per day in divided doses (e.g., 2–3 tablets three times per day)", "241"),
        quote("Oral urea is available as 15 gm of per packet. Its usual dose ranges between 15–60 gm per day.", "241"),
        points([
          "Use only in selected SIADH: persistent neurological symptoms with sodium below 120 mEq/L despite other measures; brief expected duration (e.g. pneumonia); a specific need to raise sodium (e.g. surgery).",
          "Second line for ADH-dependent hypervolaemic and euvolaemic hyponatraemia refractory to primary treatment.",
          "Concerns: hepatotoxicity, thirst, frequency, fatigue, overly rapid correction, high cost.",
        ], "Tolvaptan"),
        caution([
          "Start low: 7.5 mg a day, with close electrolyte monitoring.",
          "Avoid in hypovolaemia, severe neurological symptoms, liver disease including cirrhosis, or inability to sense or respond to thirst.",
          "No concomitant diuretics or hypertonic saline; stop fluid restriction first; allow free fluids for the first 24–48 hours with water available.",
          "Do not use for more than 30 days.",
        ], "Tolvaptan safety"),
        quote("Initiation of therapy in low dose (i.e., 7.5 mg a day).", "242"),
        quote("Permit ad libitum fluid intake during the first 24–48 hours of treatment.", "242"),
        quote("Avoiding its use for more than 30 days.", "242"),
        points([
          "Demeclocycline: current literature recommends against it (unpredictable, nephrotoxic, hepatotoxic).",
          "Lithium: almost abandoned because of toxicity.",
        ], "Demeclocycline and lithium"),
      ],
    },
  ],
};
