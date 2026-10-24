import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * METABOLIC ACIDOSIS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 31 of the full edition, from a text transcription (no page images). Page
 * numbers are the printed book pages. Every number below is the book's; the quotes give the
 * page it came from.
 */
export const metabolicAcidosisV1: FluidTopic = {
  id: "metabolic_acidosis",
  version: "1.0.0",
  title: "Metabolic acidosis: causes, work-up and alkali therapy",
  group: "acid_base",
  summary: "Anion gap classification and causes, the diagnostic gaps and Winter's formula, when bicarbonate helps and when it harms, the book's dose formula and goals, chronic alkali agents, and treatment by cause.",
  setting: "Adult ward, emergency and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["31 Metabolic Acidosis"], pages: "361–379", pageKind: "book" },
  sections: [
    {
      id: "definition",
      title: "Definition, mechanisms and the anion gap",
      blocks: [
        points([
          "A fall in plasma HCO3 and a fall in pH below 7.35. PaCO2 falls secondarily through hyperventilation, which minimises the fall in pH.",
          "Four mechanisms: loss of HCO3 through the GI tract or kidneys, overproduction of endogenous non-volatile acids, ingestion or infusion of acid or potential acids, and failure of H⁺ excretion by the kidney.",
          "High anion gap examples: lactic acidosis, ketoacidosis, ingested toxins, acute or chronic renal impairment. Normal anion gap examples: diarrhoea, renal tubular acidosis, large-volume saline.",
        ]),
        formula(
          "Anion gap",
          "AG = Na⁺ − (Cl⁻ + HCO3)",
          [
            { symbol: "AG", meaning: "anion gap; normal value 12 ± 2" },
            { symbol: "Na⁺", meaning: "serum sodium" },
            { symbol: "Cl⁻", meaning: "serum chloride" },
            { symbol: "HCO3", meaning: "serum bicarbonate" },
          ],
          { note: "Units are not printed with the formula. Table 31.1 gives the normal anion gap as 6-12 mEq and high as >12 mEq; the text's normal value is 12 ± 2. Both kept as printed." }
        ),
        table(
          ["Group", "Mechanism", "Causes and how the acidosis occurs"],
          [
            ["Normal anion gap (6-12 mEq), NAGMA", "1. GI loss of bicarbonate", "Diarrhoea: loss of bicarbonate-rich stool; colonic secretion of HCO3 in exchange for chloride causes hyperchloraemia. Laxative abuse. External pancreatic or small-bowel drainage: loss of bicarbonate-rich fluid. Urinary diversion: colonic secretion of HCO3 in exchange for urinary chloride and reabsorption of urinary ammonium."],
            ["Normal anion gap (6-12 mEq), NAGMA", "2. Renal loss of bicarbonate", "Renal tubular acidosis: impaired tubular excretion of hydrogen ions as ammonium or inadequate reabsorption of filtered HCO3. Acute and chronic kidney failure: impaired renal ammonia production and secretion, limiting H⁺ excretion. Acetazolamide: carbonic anhydrase inhibition increases renal bicarbonate excretion."],
            ["Normal anion gap (6-12 mEq), NAGMA", "3. Addition of acid", "Hyperalimentation: excess chloride-containing lysine and arginine in parenteral nutrition, and hydrochloric acid added to amino acid PN mixtures to lower the pH."],
            ["Normal anion gap (6-12 mEq), NAGMA", "4. Dilution", "Normal saline: excessive chloride-rich, buffer-free saline dilutes serum bicarbonate, giving hyperchloraemic acidosis."],
            ["High anion gap (>12 mEq), HAGMA", "1. Increased production of endogenous acids", "Lactic acidosis: overproduction of lactic acid in sepsis, shock, hypoxia and with medication such as metformin. Ketoacidosis: ketoacids accumulate in uncontrolled diabetes, excessive alcohol intake or prolonged starvation."],
            ["High anion gap (>12 mEq), HAGMA", "2. Addition of exogenous acids", "Toxins: methanol, ethylene glycol, salicylates. Ethanol: excessive alcohol consumption."],
            ["High anion gap (>12 mEq), HAGMA", "3. Failure to excrete acid", "Renal failure: decreased renal acid excretion and accumulation of sulfuric and phosphoric acid in severe kidney dysfunction."],
          ],
          "Table 31.1 Common causes of metabolic acidosis"
        ),
        table(
          ["Letter", "Cause"],
          [
            ["G", "Glycols (ethylene glycol and propylene glycol)"],
            ["O", "Oxoproline"],
            ["L", "L-lactate"],
            ["D", "D-lactate"],
            ["M", "Methanol"],
            ["A", "Aspirin (salicylates)"],
            ["R", "Renal failure (uraemia)"],
            ["K", "Ketoacidosis (diabetic/alcoholic/starvation)"],
          ],
          "Table 31.2 GOLDMARK: causes of high anion gap metabolic acidosis"
        ),
        quote("a fall in plasma HCO₃ and a fall in pH (below 7.35)", "361"),
        quote("= Na⁺ - (Cl⁻ + HCO₃) = 12 ± 2 (Normal Value)", "362"),
        quote("Normal anion gap (6-12 mEq) metabolic acidosis (NAGMA)", "362"),
      ],
    },
    {
      id: "lactic_acidosis_cause",
      title: "Lactic acidosis",
      intro: "One of the most common causes of high anion gap acidosis, often in ICU patients with critical illness or multiorgan failure. It follows when lactate production exceeds hepatic clearance.",
      blocks: [
        points([
          "Plasma lactate is usually 0.5 to 1.5 mEq/L; lactic acidosis is generally defined as lactate above 4-5 mEq/L. Severe lactic acidosis carries high mortality.",
          "Type A (inadequate oxygen delivery): severe hypoxaemia or anaemia; tissue hypoperfusion from cardiogenic, septic or haemorrhagic shock, cardiopulmonary arrest, or regional hypoperfusion such as mesenteric or limb ischaemia; anaerobic muscle activity with seizures or generalised convulsions.",
          "Type B (altered cellular metabolism, not related to tissue oxygenation): diabetes, thiamine deficiency, severe infection, liver disease, short bowel syndrome, leukaemia or lymphoma; metformin, antiretrovirals causing mitochondrial dysfunction, salicylates, isoniazid; chronic severe alcoholism, ethylene glycol, methanol or propylene glycol poisoning.",
        ]),
        quote("plasma lactate levels range from 0.5 to 1.5 mEq/L, and lactic acidosis is generally defined when lactate levels exceed 4-5 mEq/L", "363"),
      ],
    },
    {
      id: "ketoacidosis_cause",
      title: "Diabetic and alcoholic ketoacidosis",
      intro: "Both share the same mechanism: insulin deficiency, raised counter-regulatory hormones (glucagon, cortisol, catecholamines) and lipolysis, forming acidic ketones, particularly beta-hydroxybutyrate.",
      blocks: [
        points([
          "DKA is the most common cause of ketoacidosis, usually in uncontrolled type 1 diabetes, when insulin is missed or inadequate, commonly precipitated by infection, trauma, surgery, emotional stress, myocardial ischaemia, gastroenteritis or pancreatitis.",
          "DKA triad: hyperglycaemia (blood glucose >200 mg/dL), metabolic acidosis (venous pH <7.3 and serum bicarbonate <18 mmol/L), and ketonaemia or ketonuria.",
          "The routine urine ketone test detects acetoacetate and acetone but may miss beta-hydroxybutyrate, the main ketone, and so underestimate ketosis. If available, direct measurement of serum beta-hydroxybutyrate is the preferred test.",
          "Patients with DKA are always volume depleted; correcting this with a large volume of saline can cause hyperchloraemic normal anion gap acidosis during recovery.",
          "Alcoholic ketoacidosis: mainly malnourished people who drink heavily over a short period; nausea, vomiting, abdominal pain and severe fluid depletion. Criteria: pH <7.3, serum bicarbonate <15 mEq/L, anion gap >14; often with hypokalaemia, hypomagnesaemia and hypophosphataemia.",
          "Low to normal blood glucose favours alcoholic ketoacidosis; hyperglycaemia indicates DKA. When unclear, a lower HbA1c is a clue to alcoholic ketoacidosis.",
        ]),
        quote("glucose concentration of >200 mg/dL), metabolic acidosis (venous pH <7.3 and serum bicarbonate <18 mmol/L)", "364"),
        quote("a low pH (<7.3), reduced serum bicarbonate levels (<15 mEq/L), an elevated anion gap (>14)", "364"),
      ],
    },
    {
      id: "salicylate_rta_cause",
      title: "Salicylate poisoning and renal tubular acidosis",
      blocks: [
        points([
          "Salicylate toxicity commonly gives a mixed disorder: respiratory alkalosis from direct stimulation of the medullary respiratory centre, and high anion gap metabolic acidosis from interference with cellular metabolism.",
          "Common features of salicylate poisoning: tinnitus, nausea, vomiting, hyperventilation, tachycardia, non-cardiogenic pulmonary oedema, altered mental status, seizures and coma.",
          "Type 1 (distal) RTA: impaired distal hydrogen ion secretion (H⁺-ATPase pump or H⁺/K⁺ exchanger defect); inappropriately high urine pH (>5.5), hypokalaemia, decreased urinary ammonium; nephrolithiasis, nephrocalcinosis and metabolic bone disease.",
          "Type 2 (proximal) RTA: impaired proximal bicarbonate reabsorption; urine pH acidic (<5.5) when bicarbonate is low, alkaline (>5.5) once bicarbonate therapy raises serum bicarbonate; hypokalaemia; with Fanconi syndrome also glycosuria, generalised aminoaciduria and phosphaturia.",
          "Type 4 (hyperkalaemic) RTA: impaired distal potassium secretion, often from hypoaldosteronism or aldosterone resistance; hyperkalaemia disproportionate to the fall in GFR, mild acidosis; high urinary pH, high serum potassium, kidney function may be compromised.",
        ]),
        table(
          ["Feature", "Distal RTA (Type 1)", "Proximal RTA (Type 2)", "Hyperkalaemic RTA (Type 4)"],
          [
            ["Acid–base", "Hyperchloraemic normal AG metabolic acidosis", "Hyperchloraemic normal AG metabolic acidosis", "Hyperchloraemic normal AG metabolic acidosis"],
            ["Serum potassium", "Hypokalaemic RTA", "Hypokalaemic RTA", "Hyperkalaemic RTA"],
            ["Incidence", "Rare", "Rare", "Common"],
            ["Metabolic acidosis", "Severe", "Moderate", "Mild"],
            ["Serum HCO3", "Can be significantly low (<10 mEq/L)", "Usually 12 to 20 mEq/L", "Usually >17 mEq/L"],
            ["Primary defect", "Impaired distal H⁺ excretion", "Reduced proximal HCO3 reabsorption (bicarbonate wasting)", "Reduced aldosterone secretion or aldosterone resistance"],
            ["Fractional HCO3 excretion", "<5%", ">10-15%", "5-10%"],
            ["Urine pH", "Always >5.3", "Low (<5.5)", "Variable, usually >5.3"],
            ["Urine anion gap", "Positive (>20 mEq/L)", "Negative", "Positive (>20 mEq/L)"],
            ["Urine NH₄⁺", "Low", "Low", "Low"],
            ["Urine citrate", "Low", "High/normal", "Low/normal"],
            ["Urine Ca²⁺/Cr ratio", "High", "Normal", "Normal"],
            ["Renal stones / nephrocalcinosis", "Yes", "No", "No"],
            ["Bone disease", "Often present", "Common", "Absent"],
            ["Kidney function", "Usually normal", "Usually normal", "CKD is common"],
            ["Causes", "Sjögren's syndrome, SLE, RA, amphotericin B toxicity", "Multiple myeloma, acetazolamide, Fanconi syndrome", "Diabetic nephropathy, chronic interstitial nephritis, adrenal insufficiency, K⁺-sparing diuretics"],
            ["Alkali requirement", "1 to 3 mEq/kg/day", "Large, 10 to 15 mEq/kg/day", "1 to 3 mEq/kg/day"],
            ["Response", "Responds promptly", "Poor response", "Moderate response"],
          ],
          "Table 31.3 Comparison of the types of renal tubular acidosis",
          "As printed. The table gives distal RTA urine pH as always >5.3 while the text says >5.5; it gives urine NH₄⁺ as low in proximal RTA while the diagnosis section says NH₄Cl excretion rises appropriately in proximal RTA (negative urine anion gap); and its distal RTA alkali requirement (1 to 3 mEq/kg/day) differs from the treatment section's 1-2 mEq/kg/day."
        ),
        quote("Urinary pH is acidic (pH <5.5) when bicarbonate levels are low", "365"),
        quote("Large 10 to 15 mEq/kg/day", "365"),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      intro: "Manifestations depend on the underlying disorder and on the rapidity of onset and severity of the acidosis.",
      blocks: [
        points([
          "Pulmonary: Kussmaul's breathing (rapid, deep, laboured breathing at a consistent pace) suggests metabolic acidosis. Prolonged hyperventilation in acute acidaemia can cause respiratory muscle fatigue, decreased diaphragmatic contractility, respiratory failure and cyanosis.",
          "Cardiovascular: in severe acidaemia (pH <7.2), increased susceptibility to arrhythmias and decreased response to inotropes; hypotension from depressed myocardial contractility and arterial vasodilatation.",
          "Neurological: anxiety, headache, confusion, lethargy and drowsiness through to coma.",
          "Metabolic: severe acidaemia can cause hyperkalaemia, hyperphosphataemia and shift of potassium and phosphorus out of cells. Chronic acidaemia, as in renal failure, can cause stunted growth and rickets in children, and bone demineralisation and osteomalacic fractures in adults.",
          "Other: anorexia, nausea, vomiting and muscle weakness, especially in infants and young children.",
        ]),
        quote("When severe acidemia (pH <7.2) is present, there is an increased susceptibility to cardiac", "366"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis: history and investigations",
      blocks: [
        points([
          "Kussmaul's breathing is the most important diagnostic presentation.",
          "Pre-existing diabetes, renal failure and recurrent renal stones point to both the presence and the cause of acidosis.",
          "Suspect lactic acidosis with hypotension, shock, cardiac failure and septicaemia.",
          "Order a toxicology panel in high anion gap acidosis with suspected drug or toxic ingestion.",
        ], "History"),
        steps([
          "Confirm the diagnosis: arterial blood gas showing low HCO3, low pH and a compensatory fall in PaCO2.",
          "Find the cause, tests individualised to history and examination: anion gap, serum electrolytes, blood sugar, renal function, serum lactate, salicylate levels; urine for pH, ketones and oxalate crystals.",
          "Always send serum electrolytes with the ABG so the anion gap can be calculated, and classify as normal or high anion gap.",
          "In normal anion gap acidosis, calculate the urinary anion gap.",
          "In unexplained high anion gap acidosis, especially with suspected toxic alcohol ingestion, calculate the osmolal gap.",
          "Look for coexisting disorders: compare actual PaCO2 with the expected value from Winter's formula, and in high anion gap acidosis compare the rise in anion gap with the fall in HCO3.",
        ], "Investigations"),
        formula(
          "Urinary anion gap",
          "UAG = Urinary (Na⁺ + K⁺) − Urinary Cl⁻",
          [
            { symbol: "Urinary Na⁺, K⁺, Cl⁻", meaning: "urine sodium, potassium and chloride" },
          ],
          { note: "As printed: normally zero or positive. Negative UAG (<20): renal acidification intact, as in GI HCO3 loss (diarrhoea), proximal (type 2) RTA or carbonic anhydrase inhibitor therapy. Positive UAG (>20): impaired NH₄Cl excretion, as in distal (type 1) RTA or renal failure. The book prints the negative threshold as \"<20\", not a negative number; kept as printed." }
        ),
        formula(
          "Osmolal gap",
          "Osmolal gap = Measured − Calculated osmolality",
          [
            { symbol: "Measured", meaning: "measured serum osmolality", unit: "mOsm/kg" },
            { symbol: "Calculated", meaning: "calculated serum osmolality", unit: "mOsm/kg" },
          ],
          { note: "Normal is typically <10 mOsm/kg; a significantly higher gap indicates possible ethylene glycol, methanol or propylene glycol. The book does not print the calculated-osmolality formula here." }
        ),
        formula(
          "Winter's formula (expected PaCO2)",
          "Expected PaCO2 = (1.5 × Serum HCO3) + 8",
          [
            { symbol: "Serum HCO3", meaning: "measured serum bicarbonate" },
          ],
          { note: "In simple metabolic acidosis actual and expected PaCO2 are the same. Actual higher: coexisting respiratory acidosis. Actual lower: coexisting respiratory alkalosis. No ± range is printed." }
        ),
        formula(
          "Delta anion gap and delta HCO3",
          "Rise in AG = Calculated AG − 12;  Fall in HCO3 = 24 − Measured HCO3",
          [
            { symbol: "Calculated AG", meaning: "the patient's anion gap" },
            { symbol: "Measured HCO3", meaning: "the patient's serum bicarbonate" },
          ],
          { note: "In pure high anion gap acidosis the two are equal. Rise in AG significantly greater (>5 mmol/L) than the fall in HCO3: consider superimposed metabolic alkalosis. Rise significantly lesser (printed \"<5 mmol/L\") than the fall: consider superimposed normal anion gap acidosis." }
        ),
        quote("Negative urinary anion gap (<20)", "367"),
        quote("The normal osmolal gap value is typically <10 mOsm/kg", "367"),
        quote("(1.5 x Serum HCO₃) + 8", "367"),
        quote("The rise in AG (or Delta AG) = Calculated AG-12", "368"),
        quote("greater (>5 mmol/L) than the fall in HCO₃, consider the possibility of superimposed", "368"),
      ],
    },
    {
      id: "general_measures",
      title: "Treatment: general measures",
      blocks: [
        steps([
          "Treat the underlying disorder meticulously: the most critical measure, and may be the only treatment needed for mild to moderate acidosis.",
          "Fluid replacement: balanced solutions such as Ringer's lactate are preferred, correcting hypovolaemia and supplying buffer. Isotonic bicarbonate solution (dextrose 5% 850 ml with NaHCO3 150 mEq/L) is a useful option for replacing fluid and correcting severe acidosis at the same time.",
          "Correct electrolytes, especially potassium: acidosis can raise potassium and mask hypokalaemia, and correcting the acidosis can worsen pre-existing hypokalaemia.",
          "Supportive care: because sodium bicarbonate increases CO2 production, assess and ensure adequate ventilation before giving it. Empiric antibiotics after cultures in suspected sepsis; nutrition; manage precipitating factors; monitor closely.",
          "Alkali therapy: indications, goals, routes and doses differ between acute and chronic acidosis (below).",
        ]),
        points([
          "As printed, the potassium point says correction can shift potassium \"from the extracellular and intracellular compartments\"; the direction is ambiguous in the text.",
        ]),
        quote("(e.g., dextrose 5% 850 ml with NaHCO₃ 150 mEq/L)", "368"),
        quote("increase CO₂ production, it is vital to assess and ensure adequate", "368"),
      ],
    },
    {
      id: "acute_indications",
      title: "Alkali therapy in acute acidosis: indications",
      intro: "The book calls bicarbonate in acute metabolic acidosis controversial: use it selectively, not routinely, after weighing the patient, the cause and the risks.",
      blocks: [
        table(
          ["Situation", "Indication as printed"],
          [
            ["Normal anion gap (hyperchloraemic) acidosis", "pH <7.2 or serum HCO3 below 16–18 mEq/L; replacing lost bicarbonate is beneficial and hastens recovery"],
            ["Lactic acidosis", "Not routine; reserved for selected patients with life-threatening severe acidosis (pH <7.1). The 2021 Surviving Sepsis Campaign Guidelines discourage bicarbonate to improve haemodynamics or reduce vasopressors in septic shock with hypoperfusion-induced lactic acidaemia"],
            ["Lactic acidosis with severe acute kidney injury", "Recommended even with less severe acidosis (pH 7.1 to 7.2); reduces 28-day mortality and need for dialysis"],
            ["Diabetic ketoacidosis", "Rarely indicated; very selectively with arterial pH less than 6.9 (American Diabetes Association); recent literature discourages it"],
            ["Metabolic acidosis with hyperkalaemia", "Should be used, as it lowers serum potassium by shifting potassium into cells"],
          ],
          "Indications for bicarbonate"
        ),
        quote("(NAGMA) is pH <7.2 [3] or serum HCO₃ below 16–18 mEq/L [5]", "369"),
        quote("reserved for selected patients with life-threatening severe metabolic acidosis (pH<7.1)", "369"),
        quote("even with less severe metabolic acidosis (pH 7.1 to 7.2), bicarbonate therapy is recommended", "369"),
        quote("severe acidosis with arterial pH less than 6.9", "369"),
      ],
    },
    {
      id: "acute_benefits_harms",
      title: "Benefits and harms of bicarbonate in acute acidosis",
      blocks: [
        points([
          "Corrects compensatory hyperventilation, which if prolonged can cause exhaustion and respiratory failure.",
          "In severe acidosis (pH <7.1) treats decreased contractility and cardiac output, vasodilatation, impaired catecholamine response and arrhythmia risk; correcting pH improves cardiac output, mean arterial pressure and oxygen delivery.",
          "In AKI, associated with reduced need for renal replacement therapy in the ICU.",
        ], "Proposed benefits"),
        points([
          "In lactic acidosis bicarbonate is given only to selected patients, aimed at partial correction only, and not routinely. Reasons: it can be harmful; mild to moderate acidosis may be beneficial; and there is no strong evidence of benefit.",
        ], "Why selective use"),
        caution([
          "Hypernatraemia and ECF volume expansion, especially in heart or renal failure: 100 ml of 7.5% and 8.4% NaHCO3 provides 89 and 100 mEq of sodium. The sodium in 150 ml of 8.4% NaHCO3 is roughly that of 1000 ml of 0.9% saline or 300 ml of 3% saline.",
          "Hyperosmolar states: 7.5% and 8.4% NaHCO3 have osmolality of 1786 and 2000 mOsm/L; avoid large-volume boluses.",
          "Increased lactate production as raising pH removes acidotic inhibition of phosphofructokinase.",
          "Rise in PaCO2 and paradoxical intracellular acidosis: bicarbonate generates CO2, which enters cells faster than HCO3; if CO2 is not cleared by perfusion and ventilation, intracellular acidosis worsens.",
          "CNS acidosis: CO2 crosses the blood–brain barrier readily while bicarbonate does not, and the rising pH blunts the hyperventilation drive; paradoxical CNS acidosis can cause cerebral oedema.",
          "Hypokalaemia from intracellular potassium shift.",
          "Ionised hypocalcaemia from increased calcium binding to albumin with abrupt alkalosis, which may contribute to reduced cardiac output, hypotension and reduced catecholamine responsiveness.",
          "Overshoot or rebound alkalosis in recovery, from infused bicarbonate plus lactate converted to bicarbonate.",
          "Decreased vasomotor tone and myocardial contractility.",
        ], "Bicarbonate therapy can be harmful"),
        quote("(100 ml of 7.5% and 8.4% NaHCO₃ provides 89 and 100 mEq of sodium, respectively)", "370"),
        quote("content of 150 ml of 8.4% NaHCO₃ is roughly similar to that of 1000 ml of 0.9% saline and 300 ml of 3%", "370"),
        quote("(1786 mOsm/L and 2000 mOsm/L, respectively)", "370"),
      ],
    },
    {
      id: "acute_evidence",
      title: "Mild to moderate acidosis and the evidence",
      blocks: [
        table(
          ["Degree", "pH", "Serum HCO3"],
          [
            ["Mild", "7.30-7.36", ">20 mEq/L"],
            ["Moderate", "7.20-7.29", "10-19 mEq/L"],
          ],
          "Grades in which the book says evidence is growing against bicarbonate"
        ),
        points([
          "Mild to moderate acidosis (pH falling from 7.40 to 7.20) may be beneficial: more tissue oxygen delivery, vasodilatation with greater tissue blood flow, and increased contractility from higher ionised calcium.",
          "The harmful effects are restricted to pH less than 7.2. Cardiac output rose as pH fell from 7.40 to 7.20 but falls once pH drops below 7.1-7.2.",
          "Surviving Sepsis and French guidelines do not recommend bicarbonate in mild to moderate lactic acidosis.",
          "Human studies, including two 2018 trials (Jaber; Zhang), showed no mortality benefit in lactic acidosis without acute kidney injury; supportive studies are few and small.",
          "Some recent literature suggests benefit: Fujii 2019 (rises in pH, bicarbonate, base excess, sodium and PaCO2), Fujii 2021 (faster resolution, better PaO2/FiO2 and MAP in vasopressor-dependent patients), Huang 2023 (lower ICU and hospital mortality in septic moderate lactic acidosis).",
          "Conclusion: avoid routine bicarbonate in less severe lactic acidosis (pH 7.1 or higher); careful use may benefit selected patients with acute kidney injury and severe lactic acidosis (pH <7.1).",
        ]),
        quote("mild (pH 7.30-7.36, serum HCO₃ >20 mEq/L) to moderate (pH 7.20-7.29, serum HCO₃ 10-19 mEq/L)", "371"),
        quote("restricted only to patients with pH less than 7.2", "372"),
        quote("its careful use may benefit selected patients with acute kidney injury and severe lactic acidosis (pH <7.1)", "372"),
      ],
    },
    {
      id: "acute_dose_goals",
      title: "Bolus vs infusion, dose, goals and precautions",
      blocks: [
        points([
          "A bolus corrects acidaemia rapidly, but an isotonic infusion in 5% dextrose is preferred to a hypertonic bolus: more controlled, with less risk of sodium overload, pulmonary oedema and hypernatraemia.",
        ], "Bolus vs infusion"),
        formula(
          "Bicarbonate dose (empirical)",
          "Bicarbonate dose = 0.5 × Weight (kg) × Desired ΔHCO3;  Desired ΔHCO3 = Targeted HCO3 − Serum HCO3",
          [
            { symbol: "Weight", meaning: "body weight", unit: "kg" },
            { symbol: "Targeted HCO3", meaning: "the bicarbonate level aimed for" },
            { symbol: "Serum HCO3", meaning: "measured serum bicarbonate" },
          ],
          { note: "The book labels the dose \"(mEq/L)\". Usually 50% of the dose over the first 3 to 4 hours and the remainder over 8 to 24 hours. A rough guide for initial therapy only, to be modified by serial bicarbonate and arterial pH; many authorities prefer an empirical approach to formula-based calculation." }
        ),
        table(
          ["Situation", "Goal as printed"],
          [
            ["Normal anion gap (hyperchloraemic) acidosis", "Raise pH above 7.2 and slowly raise plasma bicarbonate to 22 mEq/L"],
            ["Lactic acidosis (high anion gap)", "Maintain arterial pH up to 7.1-7.2 and bicarbonate up to 10-12 mEq/L. Caution: do not raise blood pH above 7.20"],
            ["Lactic acidosis with acute kidney injury", "Maintain arterial pH above 7.3"],
            ["Diabetic ketoacidosis", "Raise arterial pH slightly, only up to 7.0"],
          ],
          "Goals of bicarbonate therapy",
          "Kept as printed: the AKI goal (pH above 7.3) sits beside the lactic acidosis caution not to exceed 7.20."
        ),
        caution([
          "Avoid overcorrection and an \"overshoot\" metabolic alkalosis.",
          "Establish a proper large IV line and monitor electrolytes.",
          "Avoid IV boluses except in emergencies; give rapid or large-volume infusions cautiously to prevent circulatory overload.",
          "The book refers to Chapter 14, Sodium Bicarbonate, for more detail.",
        ], "Precautions with IV bicarbonate"),
        quote("infusion as an isotonic mixture in 5% dextrose is preferable rather than as a hypertonic bolus", "373"),
        quote("0.5 × Weight (kg) × Desired ΔHCO₃", "373"),
        quote("Usually, 50% of the dose is replaced over the initial 3 to 4 hours and the remainder over 8 to 24 hours", "373"),
        quote("Raise pH above 7.2 and slowly increase the plasma bicarbonate level to 22 mEq/L", "373"),
        quote("maintain the arterial pH up to 7.1-7.2 and increase the bicarbonate level up to 10-12 mEq/L", "373"),
        quote("Caution: Do not raise the blood pH to greater than 7.20.", "373"),
        quote("Maintain the arterial pH above 7.3.", "373"),
        quote("Raise the arterial pH slightly, only up to 7.0.", "373"),
        quote("avoiding IV boluses (except in emergencies)", "373"),
      ],
    },
    {
      id: "chronic_alkali",
      title: "Alkali therapy in chronic acidosis",
      intro: "The most common causes of chronic metabolic acidosis are advanced CKD, diarrhoea and the renal tubular acidoses.",
      blocks: [
        points([
          "Relieves respiratory muscle fatigue and dyspnoea from compensatory hyperventilation.",
          "Improves muscle wasting and weakness.",
          "Prevents bone demineralisation and resorption.",
          "In CKD, generally considered safe and may slow progression to kidney failure; more data are needed.",
          "In distal (type 1) RTA, reduces urinary calcium excretion and so nephrocalcinosis and stones.",
        ], "Benefits"),
        points([
          "Sodium bicarbonate is preferred in chronic kidney disease: 1 g provides 11.5 mEq of HCO3, commonly at 0.5 to 1 mEq/kg/day.",
          "Potassium citrate is preferred in renal tubular acidosis (corrects hypokalaemia and acidosis, helps prevent nephrocalcinosis and nephrolithiasis), but carries a risk of hyperkalaemia in CKD.",
          "Citrate requirement varies with severity; starting dose usually 50 to 100 mEq per day, adjusted to response and ongoing bicarbonate losses, monitored by electrolytes and bicarbonate.",
        ], "Agents"),
        table(
          ["Citrate formulation", "Composition as printed"],
          [
            ["Potassium citrate and citric acid USP oral solution", "Each mL: 2 mEq potassium, equivalent to 2 mEq bicarbonate"],
            ["Potassium citrate–sodium citrate–citric acid solution", "1 mEq potassium and 1 mEq sodium, equivalent to 2 mEq bicarbonate (volume not printed)"],
            ["Shohl's solution", "Sodium citrate 100 mg/mL and citric acid 66.8 mg/mL; each 1 mL delivers 1 mEq of bicarbonate and of sodium"],
          ],
          "Citrate salts"
        ),
        quote("of NaHCO₃ provides 11.5 mEq of HCO₃ and is commonly administered at a dose of 0.5 to 1 mEq/kg/day", "374"),
        quote("each mL provides 2 mEq of potassium ion and is equivalent to 2 mEq of bicarbonate", "374"),
        quote("1 mEq of sodium ion, equivalent to 2 mEq of bicarbonate", "374"),
        quote("with each 1 mL delivering 1 mEq of both bicarbonate and sodium", "375"),
        quote("The starting dose is usually 50 to 100 mEq per day", "375"),
      ],
    },
    {
      id: "lactic_acidosis_treatment",
      title: "Treatment: lactic acidosis",
      blocks: [
        steps([
          "Aim for adequate perfusion and oxygenation.",
          "Find and treat the underlying cause; in many cases this is the only therapy needed.",
          "Surviving Sepsis Campaign: early crystalloid resuscitation with balanced solutions and timely vasopressors, noradrenaline, to a MAP of 65 mmHg.",
          "In sepsis: blood cultures, a focused search for the source, and broad-spectrum antibiotics within the first hour of recognition.",
          "NaHCO3 only in selected patients with severe acidaemia (pH less than 7.1), for partial correction only; with severe acute kidney injury it can help even at pH 7.1 to 7.2 (less dialysis, survival benefit).",
          "Give it as an isotonic infusion rather than a hypertonic bolus; ensure adequate ventilation first, and monitor and correct hypokalaemia and hypocalcaemia.",
          "Dialysis can be lifesaving in refractory severe lactic acidosis.",
        ]),
        caution([
          "Bicarbonate can enhance lactate production through phosphofructokinase stimulation, raise CO2 with paradoxical intracellular acidosis, and cause hypernatraemia, ECF expansion, hypocalcaemia, hypokalaemia, and overshoot or rebound alkalosis.",
        ]),
        quote("target a mean arterial pressure (MAP) of 65 mmHg", "375"),
        quote("beneficial only in selected patients with severe acidemia (pH less than 7.1) and should be given for partial correction only", "375"),
      ],
    },
    {
      id: "ketoacidosis_treatment",
      title: "Treatment: diabetic and alcoholic ketoacidosis",
      blocks: [
        points([
          "DKA: the mainstay is adequate IV fluids and electrolytes, insulin, and addressing precipitating factors.",
          "Bicarbonate is not recommended in adult DKA with pH ≥6.9. It is recommended in a few patients with pH <6.9, shock, or severe life-threatening hyperkalaemia (serum potassium >6.5-7 mEq/L).",
          "ADA regimen for pH ≤6.9: 100 mEq sodium bicarbonate (two ampoules) in 400 ml sterile water with 20 mEq KCl, infused at 200 ml/h until venous pH is >7.0.",
          "As printed, the thresholds overlap at exactly 6.9 (not recommended at ≥6.9; ADA regimen at ≤6.9; p369 says less than 6.9).",
        ], "Diabetic ketoacidosis"),
        steps([
          "Thiamine: 200 mg prophylactically with glucose to avoid Wernicke's encephalopathy; thiamine should not delay dextrose.",
          "Dextrose to correct hypoglycaemia and suppress ketogenesis. First exclude severe hypokalaemia (correct it before dextrose) and hyperglycaemia; with severe hyperglycaemia insulin may be needed and the infusion is saline without dextrose.",
          "IV resuscitation with balanced crystalloids (Ringer's lactate or PlasmaLyte) or normal saline.",
          "Replace potassium, phosphate and magnesium; oral or IV potassium phosphate for hypokalaemia with hypophosphataemia. In undernourished alcoholic patients, view normal electrolytes cautiously: hypokalaemia, hypophosphataemia and thiamine deficiency may appear 12 to 24 hours after glucose.",
          "Bicarbonate is usually unnecessary, even at pH <7.0, because supportive care alone corrects the acidosis quickly.",
          "Encourage stopping alcohol.",
        ], "Alcoholic ketoacidosis"),
        quote("is not recommended in adult patients with DKA with pH ≥6.9", "376"),
        quote("(serum potassium >6.5-7 mEq/L)", "376"),
        quote("administering 100 mEq of sodium bicarbonate (two ampules) diluted in 400 ml of sterile water", "376"),
        quote("with 20 mEq of potassium chloride (KCI) to be infused at a rate of 200 ml/h until the venous pH is >7.0", "376"),
        quote("200 mg of thiamine prophylactically together with glucose", "376"),
        quote("thiamine should not delay the administration of dextrose.", "376"),
        quote("12 to 24 hours after glucose administration", "376"),
        quote("usually unnecessary, even in patients with severe acidemia (i.e., pH <7.0)", "376"),
      ],
    },
    {
      id: "salicylate_renal_treatment",
      title: "Treatment: salicylate poisoning and renal failure",
      blocks: [
        steps([
          "If ingestion is recent, consider gastric lavage with activated charcoal to reduce absorption.",
          "Supportive care: vital signs, oxygenation, airway.",
          "Fluids: IV Ringer's lactate or normal saline for dehydration and hypotension, to keep renal perfusion and urine output. Severe intoxication can leave deficits as high as 4 to 6 litres.",
          "Alkalinisation (mainstay in moderate or severe toxicity): IV sodium bicarbonate to raise urine pH from 6.5 to 7.5 with continuous urine output, using an isotonic bicarbonate solution (150 ml containing 132 mmol sodium bicarbonate in 1 litre of 5% dextrose); this can raise salicylate excretion more than fivefold and limits CNS entry.",
          "Coexisting respiratory alkalosis is not a contraindication to sodium bicarbonate.",
          "Give adequate glucose (risk of low brain glucose even with normal plasma glucose) and potassium (hypokalaemia is common and worsens with alkaline diuresis).",
          "Haemodialysis for persistently high salicylate levels (>100 mg/dL), severe acidosis, marked neurological symptoms, organ dysfunction, severely impaired kidney function or fluid overload.",
        ], "Salicylate (aspirin) poisoning"),
        points([
          "As printed, the fluid step says IV fluids \"decrease extracellular fluid volume\", which reads as a slip in the source; kept as printed, not corrected.",
          "The concentration of the 150 ml bicarbonate is not printed.",
          "Renal failure: in CKD, oral alkali such as sodium bicarbonate to keep serum bicarbonate at about the normal value (25 mEq/L) helps prevent muscle catabolism, bone demineralisation, rickets or osteomalacia, and slows CKD progression.",
        ]),
        quote("fluid deficits as high as 4 to 6 liters", "377"),
        quote("Raising urine pH from 6.5 to 7.5", "377"),
        quote("(150 ml containing 132 mmol of sodium bicarbonate in 1 liter of 5% dextrose)", "377"),
        quote("it is not a contraindication for administering sodium bicarbonate", "377"),
        quote("(>100 mg/dL), severe acidosis, marked neurological", "377"),
        quote("at approximately the normal value (25 mEq/L)", "377"),
      ],
    },
    {
      id: "nagma_treatment",
      title: "Treatment: GI bicarbonate loss and renal tubular acidosis",
      blocks: [
        points([
          "GI losses such as diarrhoea: correct hypovolaemia and hypokalaemia and manage the acidosis; in severe acidosis supplement NaHCO3 IV or orally.",
        ], "GI loss of bicarbonate"),
        points([
          "Distal (type 1): potassium supplementation and alkali to correct hypokalaemia and reach a normal serum bicarbonate (22 to 24 mEq/L). Potassium citrate helps bone health (less demineralisation, nephrocalcinosis and stones; in children better bone density, no rickets, normal growth), corrects hypokalaemia and protects kidney function. Dose: 1-2 mEq/kg/day potassium citrate or sodium bicarbonate is usually sufficient, adjusted to serial bicarbonate.",
          "Proximal (type 2): treat underlying causes (multiple myeloma, carbonic anhydrase inhibitors, vitamin D deficiency). Normally about 80-90% of filtered bicarbonate is reabsorbed proximally; in proximal RTA ingested alkali is promptly lost in urine. Large oral alkali doses (10-15 mEq/kg/day), plus potassium and phosphate. If high-dose alkali fails or is poorly tolerated, adding 12.5 to 25 mg of a thiazide can help. Vitamin D and phosphate correction for bone health.",
          "Hyperkalaemic (type 4): 1 to 3 mEq/kg/day of potassium-free alkali; for hyperkalaemia, dietary potassium restriction, low-dose fludrocortisone (0.1 mg per day) in aldosterone deficiency without hypertension, heart failure or oedema, loop diuretics (1 to 2 mg/kg/day) and, if needed, cation-exchange resin.",
          "Transcript note: the last line of p378 was illegible, but the sentence continues on p379 without an apparent gap. The transcript ends at p379; pages 380–381 (probably references) were not transcribed, so it cannot be confirmed that the type 4 RTA list ends where p379 does.",
        ], "Renal tubular acidosis"),
        caution([
          "The distal RTA dose here (1-2 mEq/kg/day) differs from Table 31.3 (1 to 3 mEq/kg/day); both are as printed.",
        ]),
        quote("achieve a normal serum bicarbonate concentration (22 to 24 mEq/L)", "378"),
        quote("Dose: 1-2 mEq/kg/day potassium citrate or sodium bicarbonate is usually", "378"),
        quote("Large amounts of oral alkali (10-15 mEq/kg/day) are required", "378"),
        quote("adding 12.5 to 25 mg of thiazide diuretics can be beneficial.", "378"),
        quote("providing 1 to 3 mEq/kg/day of potassium-free alkali.", "379"),
        quote("low-dose fludrocortisone (0.1 mg per day)", "379"),
        quote("loop diuretics (1 to 2 mg/kg/day)", "379"),
      ],
    },
  ],
};
