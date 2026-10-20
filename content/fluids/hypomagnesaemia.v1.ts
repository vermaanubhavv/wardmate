import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPOMAGNESAEMIA — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 28 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const hypomagnesaemiaV1: FluidTopic = {
  id: "hypomagnesaemia",
  version: "1.0.0",
  title: "Hypomagnesaemia: diagnosis and replacement",
  group: "electrolytes",
  summary: "Low magnesium: the serum bands, causes, features, urinary magnesium work-up, and oral, IM and IV replacement by severity with the book's doses, dilution, monitoring and stopping rules.",
  setting: "Adult medical, surgical and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["28 Hypomagnesemia"], pages: "326–335", pageKind: "book" },
  sections: [
    {
      id: "physiology",
      title: "Magnesium in the body",
      blocks: [
        points([
          "Hypomagnesaemia is expected particularly in ICU patients and usually follows renal and gastrointestinal losses. Hypermagnesaemia is less frequent; its most common cause is renal failure.",
          "Magnesium is the fourth most common cation of the body (after Na⁺, K⁺ and Ca²⁺), the second most common intracellular cation (after K⁺) and the commonest intracellular divalent cation.",
          "About 60% of body magnesium is in bone, 39% within cells and only 1% in the ECF. Of plasma magnesium up to 40% is protein-bound, 5–10% complexed and about 50–55% free ionised, the biologically active form.",
          "Clinical effects are set primarily by tissue magnesium, so serum levels have limited diagnostic value.",
          "Cofactor in mitochondrial oxidative phosphorylation and over 600 enzymatic reactions; roles in neuromuscular transmission, cardiovascular excitability, muscle contraction and PTH secretion.",
          "Magnesium regulates PTH release and its end-organ effect: hypocalcaemia from suppressed PTH occurs in both hypo- and hypermagnesaemia, usually symptomatic in hypomagnesaemia and transient in hypermagnesaemia.",
          "Recommended daily intake in adults: 400–420 mg for men, 310–320 mg for women.",
          "No single hormone plays a substantial role in magnesium homeostasis (the \"orphan ion\"). The 60% stored in bone as bioapatite does not exchange readily, so plasma magnesium may fall in depletion.",
          "30%–40% of dietary magnesium is absorbed, mainly in jejunum and ileum (passive paracellular, 90%), less in colon (active transcellular via TRPM6/7, 10%). Absorption rises with depletion, a low-magnesium diet and calcitriol; falls with a high-magnesium diet and foods rich in calcium, phosphate and fibre.",
          "About 80% of free, non-protein-bound magnesium is filtered; up to 96% of the filtered load is reabsorbed: 15–25% proximal tubule, 60–70% thick ascending limb (the primary site), 5–10% distal tubule.",
          "Reabsorption rises with dietary restriction, hypomagnesaemia, volume depletion, metabolic alkalosis, PTH, calcitonin, glucagon, insulin and aldosterone.",
          "Renal loss rises with loop diuretics, hypermagnesaemia, hypercalcaemia, volume expansion, metabolic acidosis, hypokalaemia, hypophosphataemia, osmotic diuretics (mannitol, urea) and thiazides. The book's list also names \"a magnesium-sparing diuretic (amiloride)\" here, while p330 says amiloride reduces urinary magnesium excretion.",
        ]),
        quote("About 60% of body magnesium is in bones, 39% is within the cells, and only 1% is in extracellular fluid (ECF).", "326"),
        quote("The daily magnesium intake recommended in adults is 400–420 mg for men and 310–320 mg for women.", "327"),
        quote("Approximately 30%–40% of dietary magnesium is absorbed.", "327"),
        quote("up to 96% of filtered magnesium is reabsorbed", "327"),
      ],
    },
    {
      id: "definition",
      title: "Definition, normal range and severity",
      blocks: [
        points([
          "Normal serum magnesium: 1.7 to 2.1 mg/dL (0.70 to 0.85 mmol/L, 1.4 to 1.7 mEq/L).",
          "Hypomagnesaemia: serum magnesium below 1.7 mg/dL (1.4 mEq/L or 0.7 mmol/L). It usually reflects a decreased total body content, but serum magnesium is only 0.3% of the body total, so it may not reflect it.",
          "Incidence 11% to 20% in hospitalised patients and 50–70% in the critically ill; associated with greater morbidity and mortality. Higher prevalence in ICU patients with chronic malnutrition, alcoholism and diabetes.",
        ]),
        table(
          ["Band", "mg/dL", "mmol/L", "mEq/L"],
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
          "Values exactly as printed. The bands overlap: mild 1.6-1.9 mg/dL against a normal range from 1.7 mg/dL, and moderate 0.4-0.6 mmol/L against severe <0.5 mmol/L. The severe band is <0.5 mmol/L in Table 28.1 but <0.4 mmol/L on p332 and in Table 28.3. The normal range is printed \"0w.85 mmol/L\" in the text (a misprint for 0.85)."
        ),
        formula(
          "Serum magnesium unit conversion",
          "1 mEq/L = 1.2 mg/dL = 0.5 mmol/L",
          [
            { symbol: "mEq/L", meaning: "milliequivalents per litre" },
            { symbol: "mg/dL", meaning: "milligrams per decilitre" },
            { symbol: "mmol/L", meaning: "millimoles per litre" },
          ],
          { note: "Printed under Table 28.1." }
        ),
        quote("Conversion factors for serum magnesium: 1 mEq/L = 1.2 mg/dL = 0.5 mmol/L", "326"),
        quote("Hypomagnesemia is defined as serum magnesium concentration less than 1.7 mg/dL (1.4 mEq/L or 0.7 mmol/L).", "328"),
        quote("ranges from 11% to 20% in hospitalized patients and 50–70% in critically ill patients", "328"),
      ],
    },
    {
      id: "causes",
      title: "Causes",
      intro: "Four categories: increased renal excretion, increased gastrointestinal losses, decreased intake, and intracellular shift.",
      blocks: [
        table(
          ["Category", "Causes"],
          [
            ["A. Increased renal excretion", "Loop, thiazide and osmotic diuretics; hyperaldosteronism, hyperparathyroidism, hyperthyroidism; hypercalcaemia; volume expansion; drugs: aminoglycosides, cisplatin, amphotericin B; chronic tubulointerstitial disease; post-obstructive diuresis, recovery from acute tubular necrosis; diabetic ketoacidosis; Gitelman syndrome and Bartter syndrome"],
            ["B. Increased gastrointestinal losses", "Malabsorption, chronic diarrhoea, laxative abuse; protracted vomiting or prolonged nasogastric aspiration; small bowel bypass surgery, acute pancreatitis; proton pump inhibitor (PPI); vitamin D deficiency"],
            ["C. Decreased intake", "Starvation or prolonged malnutrition; magnesium-deficient PN or IV fluids; chronic alcoholism"],
            ["D. Intracellular shift", "Treatment of diabetic ketoacidosis; refeeding syndrome; hungry bone syndrome"],
          ],
          "Table 28.2 Causes of hypomagnesaemia"
        ),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features and associated abnormalities",
      blocks: [
        points([
          "Nonspecific; depends on severity, coexisting hypocalcaemia and hypokalaemia, and the cause. Mild degrees are usually asymptomatic; symptoms are commonly seen when serum magnesium falls below 1.2 mg/dL (1.0 mEq/L, 0.5 mmol/L).",
          "General: anorexia, nausea, vomiting, weakness.",
          "Neuromuscular (similar to hypocalcaemia): lethargy, confusion, headache, depression, tremor, cramps, tingling and numbness, fasciculations, insomnia, ataxia, tetany with positive Trousseau and Chvostek signs, seizures.",
          "Cardiovascular: hypertension, tachycardia; ECG widening of QRS, peaked T waves, prolonged PR and QT, atrial and ventricular arrhythmia. Severe hypomagnesaemia risks torsades de pointes. Digitalis toxicity may be precipitated or aggravated.",
          "Hypocalcaemia: magnesium deficiency decreases PTH secretion and causes end-organ PTH resistance. If hypocalcaemia does not respond to calcium or vitamin D, think of hypomagnesaemia and correct it.",
          "Hypokalaemia: magnesium deficiency enhances renal potassium excretion; prevalence 40–60% in hypomagnesaemia, and it makes hypokalaemia refractory. If hypokalaemia does not respond to K⁺ replacement, rule out magnesium deficiency and correct it.",
          "Diabetes: hypomagnesaemia occurs in about 13.5 to 47.7% of type 2 DM and is associated with insulin resistance and poor glycometabolic control.",
          "Also linked to hypertension, cardiovascular disease, vascular calcification, hypercalciuria and nephrolithiasis.",
        ]),
        quote("symptoms are commonly seen in severe hypomagnesemia (serum magnesium", "328"),
        quote("concentration falls below 1.2 mg/dL, 1.0 mEq/L, or 0.5 mmol/L).", "329"),
        quote("The prevalence of hypokalemia in patients with hypomagnesemia may be as high as 40–60% [20].", "329"),
        quote("occurs in about 13.5 to 47.7% of type 2 DM", "329"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis",
      intro: "Hypomagnesaemia may be asymptomatic, so keep a high index of suspicion: check serum magnesium in chronic diarrhoea, chronic alcoholism, malnutrition and long hospital stays, and when hypokalaemia, hypocalcaemia or arrhythmias do not respond to standard therapy.",
      blocks: [
        steps([
          "History and physical examination usually establish the cause in most patients.",
          "Routine investigations: serum calcium, phosphate, albumin, electrolytes, creatinine, glucose and acid–base measurement.",
          "When the diagnosis is not clear, measure 24-hour urinary magnesium or the fractional excretion of magnesium (FEMg) on spot urine to separate renal from nonrenal causes. The 24-hour collection is preferred, because magnesium excretion varies with intake and diurnal rhythm.",
        ], "Three steps"),
        formula(
          "Fractional excretion of magnesium (FEMg)",
          "FEMg = [(UMg × PCr) / (PMg × UCr × 0.7)] × 100",
          [
            { symbol: "UMg", meaning: "urine magnesium concentration" },
            { symbol: "PMg", meaning: "plasma magnesium concentration" },
            { symbol: "UCr", meaning: "urine creatinine concentration" },
            { symbol: "PCr", meaning: "plasma creatinine concentration" },
          ],
          { note: "Result is a percentage." }
        ),
        table(
          ["Finding", "Suggests"],
          [
            ["24-hour urinary magnesium <10 mg or FEMg <2%", "Nonrenal cause: poor intake, gastrointestinal losses, or shift of magnesium into cells"],
            ["24-hour urinary magnesium >10–30 mg or FEMg >3% (with normal kidney function)", "Renal magnesium wasting: loop or thiazide diuretics, aminoglycosides, cisplatin, Bartter syndrome, Gitelman syndrome, familial hypomagnesaemia with hypercalciuria"],
          ],
          "Urinary magnesium"
        ),
        quote("FEMg = [(UMg × PCr) / (PMg × UCr × 0.7)] × 100", "330"),
        quote("24-hour urinary magnesium excretion <10 mg or FEMg <2%: It suggests nonrenal causes of hypomagnesemia", "330"),
        quote("24-hour urinary magnesium excretion >10–30 mg or FEMg >3% (with normal kidney function): It suggests renal magnesium wasting", "330"),
      ],
    },
    {
      id: "principles",
      title: "Management: underlying cause and principles of therapy",
      intro: "Plan correction for the individual patient: degree of hypomagnesaemia, urgency, renal function, haemodynamic stability, coexisting hypocalcaemia and hypokalaemia, and the cause.",
      blocks: [
        points([
          "Search for and correct the cause and coexisting hypocalcaemia and hypokalaemia. Amiloride reduces urinary magnesium excretion and may help in renal magnesium wasting.",
          "IV magnesium sulfate is the most useful agent: effective, well tolerated, available and inexpensive. IV is recommended for severe (serum magnesium <1 mg/dL) symptomatic hypomagnesaemia (seizures, tetany, life-threatening arrhythmias, severe neuromuscular irritability), or mild hypomagnesaemia when oral replacement is not tolerable.",
          "Infuse slowly over a prolonged period: a rapid infusion raises serum magnesium abruptly, inhibits renal reabsorption and loses up to 50% in the urine; intracellular stores refill gradually over a few days.",
          "Give IV magnesium at a rate not exceeding 1 gm/hour, and continue for at least 2 days after serum magnesium becomes normal.",
          "With normal kidney function the risk of hypermagnesaemia at recommended IV doses is minimal.",
          "Normomagnesaemia does not exclude depletion (ECF holds just 1% of body magnesium); consider empirical magnesium in patients at risk or with a consistent presentation.",
          "The rise after a dose is quick but lasts only a few hours: recheck serum magnesium several hours later, as an early level may be falsely high.",
          "Aim in symptomatic patients: serum magnesium above 1.5 mg/dL and below 3 mg/dL.",
          "Monitor serum magnesium 6 to 12 hourly if haemodynamically unstable, daily in stable inpatients, at least weekly after discharge. Continuous cardiac monitoring in severe symptomatic hypomagnesaemia with tetany, arrhythmias or seizures on IV magnesium.",
          "Replace magnesium in unexplained hypocalcaemia and/or hypokalaemia: with hypomagnesaemia they do not recover without it.",
        ]),
        caution([
          "Impaired kidney function: avoid IV magnesium or reduce the dose by 50% or more, and monitor serum magnesium frequently to avoid hypermagnesaemia.",
        ], "Renal failure"),
        quote("at a rate not exceeding 1 gm/hour) as an infusion", "331"),
        quote("at least 2 days after the serum magnesium level becomes normal", "331"),
        quote("leading to up to 50% loss of magnesium in the urine despite the presence of a total body deficit", "331"),
        quote("raise serum magnesium above 1.5 mg/dL and maintain it below 3 mg/dL", "331"),
        quote("measure serum magnesium levels 6 to 12 hourly in hemodynamically unstable patients, daily in stable hospitalized patients", "331"),
        quote("avoid or reduce the dose of IV magnesium by 50% or more", "332"),
      ],
    },
    {
      id: "replacement",
      title: "Replacement by severity",
      intro: "Severity and symptoms decide the route and rate. The aim is to raise serum magnesium and relieve symptoms while avoiding toxicity.",
      blocks: [
        table(
          ["Severity", "Magnesium level", "Recommended therapy"],
          [
            ["Mild hypomagnesaemia", "1.6–1.9 mg/dL; 0.7–0.8 mmol/L; 1.4–1.6 mEq/L", "Diet: increase magnesium-rich food. Oral: magnesium oxide 400 mg 2–3 times/day. IV/IM: 1 gm magnesium sulfate infused over 1 to 2 hours, or given intramuscularly every 6 hours for 4 doses"],
            ["Moderate hypomagnesaemia", "1.0–1.5 mg/dL; 0.4–0.6 mmol/L; 0.8–1.2 mEq/L", "2 to 4 gm magnesium sulfate infused over 4 to 12 hours"],
            ["Severe symptomatic hypomagnesaemia", "<1.0 mg/dL; <0.4 mmol/L; <0.8 mEq/L", "Haemodynamically unstable: 2 gm magnesium sulfate as a bolus over 2–15 min, then continuous infusion. Haemodynamically stable: 1 to 2 gm over one hour, then continuous infusion. Subsequent continuous infusion: 4 to 8 gm in 250–1000 mL D5W or normal saline over 12 to 24 hours"],
            ["Torsades de pointes", "-", "1 to 2 gm magnesium sulfate diluted in more than 10 ml saline or D5W pushed initially over 15 minutes, then a continuous 0.5 to 1 gm/hr infusion"],
            ["Maintenance dose of IV magnesium", "-", "30 to 60 mg/kg/day or 1–3 gm/day magnesium sulfate in parenteral nutrition"],
          ],
          "Table 28.3 Management of hypomagnesaemia (after treating the underlying disease)",
          "Magnesium sulfate 50%, 1 ampoule (2 ml) = 1 gm = 4 mmol = 8 mEq magnesium. If kidney function is impaired, reduce the IV dose by 50% or more."
        ),
        points([
          "Diet: green leafy vegetables, beef, seafood, nuts.",
          "Oral magnesium is first line for chronic mild hypomagnesaemia with minimal or no symptoms, and to replace ongoing losses after initial IV replacement. Sustained-release formulations are preferred.",
          "Usual oral dose with adequate kidney function: 240–1000 mg elemental magnesium in severe hypomagnesaemia; half that in mild (120 to 500 mg, 5 to 20 mmol or 10 to 40 mEq elemental), given as magnesium oxide 400 mg (240 mg elemental per tablet) 2–3 times/day.",
          "Diarrhoea is the main dose-limiting effect of oral magnesium and can worsen hypomagnesaemia: reduce the oral dose if it occurs.",
          "Mild, IV: about 1 to 2 gm magnesium sulfate infused slowly over 1 to 2 hours, if oral is not tolerated or appropriate and mild symptoms are present. If IV is not feasible, 1 gm IM every 6 hours for 4 doses. (The text says 1 to 2 gm; Table 28.3 says 1 gm.)",
          "Moderate: 2–4 gm magnesium sulfate IV intermittently over 4 to 12 hours, maximum 1 gm/hr; plus magnesium-rich food and higher-dose oral preparations if tolerated.",
          "Rule of thumb: each 1 gm (8 mEq) of IV magnesium raises serum magnesium by 0.15 mEq/L.",
        ]),
        steps([
          "Haemodynamically unstable: 2 gm magnesium, diluted in 50 mL D5W or normal saline, infused rapidly as a bolus over 2–15 min, then a continuous infusion.",
          "Haemodynamically stable: 1 to 2 gm magnesium, diluted in 100 mL D5W or normal saline, infused slowly over one hour, then a continuous infusion.",
          "Subsequent infusion: 4 to 8 gm magnesium in 250–1,000 mL D5W or normal saline over 12 to 24 hours, for 3 to 5 days, to keep magnesium above 1.5 mg/dL.",
        ], "Severe hypomagnesaemia (serum magnesium less than 1.0 mg/dL)"),
        quote("supplement magnesium oxide 400 mg (240 mg of elemental magnesium per tablet) 2–3 times/day", "332"),
        quote("intramuscular administration of 1 gm of magnesium every 6 hours for 4 doses is recommended.", "332"),
        quote("Administer 2–4 gm of magnesium sulfate IV intermittently over 4 to 12 hours (at a maximum rate of 1 gm/hr)", "332"),
        quote("Each 1 gm (8 mEq) of IV magnesium will raise the serum magnesium concentration by 0.15 mEq/L", "332"),
        quote("Initially, 2 gm magnesium (diluted in 50 mL of D5W or normal saline) is infused", "332"),
        quote("rapidly as a bolus over 2–15 min with subsequent continuous magnesium infusion", "333"),
        quote("Initially, 1 to 2 gm magnesium (diluted in 100 mL of D5W or normal saline) is infused slowly over one hour", "333"),
        quote("Administer 4 to 8 gm of magnesium diluted in 250–1,000 mL of D5W or normal saline", "333"),
        quote("over 12 to 24 hours for 3 to 5 days to keep the magnesium level above 1.5 mg/dL", "333"),
        quote("followed by a continuous 0.5 to 1 gm/hr magnesium sulfate infusion", "333"),
        quote("30 to 60 mg/kg/day or 1–3 gm/day magnesium sulfate in parenteral nutrition", "333"),
      ],
    },
    {
      id: "parenteral",
      title: "Parenteral magnesium: preparation, monitoring and safety",
      blocks: [
        points([
          "Magnesium sulfate 50%, 2 ml ampoule: 1 gm magnesium sulfate, 4 mmol / 8 mEq elemental magnesium. Each mL: 500 mg magnesium sulfate, 2 mmol / 4 mEq elemental magnesium.",
          "240 mg magnesium sulfate = 1 mmol or 2 mEq elemental magnesium.",
          "Always dilute 50% magnesium sulfate and mix thoroughly before use. For a peripheral vein dilute to 20% (200 mg/mL) or less: to 2 ml of 50% add 3 ml of D5W or normal saline (two parts drug, three parts diluent).",
          "50% magnesium sulfate has an osmolarity of 4060 mOsmol/L; extravasation risks tissue damage and necrosis.",
          "While giving IV magnesium, closely monitor heart rate, blood pressure, respiratory rate, patellar reflex, urine output and SpO₂.",
        ]),
        caution([
          "Avoid magnesium, or use it with caution, in severe renal failure, myasthenia gravis, cardiac ischaemia and heart block.",
          "Stop IV magnesium if respiratory rate is less than 12 breaths/minute, the knee jerk is absent, urine output is less than 25 mL/hour or less than 100 mL over 4 hours, or diastolic blood pressure falls more than 15 mmHg below baseline.",
          "Antidote: 10% calcium gluconate 10 ml IV slowly over 5–10 minutes to antagonise serious neuromuscular and cardiovascular effects.",
        ], "Precautions, stopping rules and antidote"),
        quote("provides 1 gm of magnesium sulfate or 4 mmol/8 mEq of elemental magnesium", "333"),
        quote("240 mg magnesium sulfate = 1 mmol or 2 mEq of elemental magnesium.", "333"),
        quote("dilute concentrated magnesium sulfate solutions to a concentration of 20% (200 mg/mL) or less.", "334"),
        quote("very high (4060 mOsmol/L)", "334"),
        quote("if respiratory rate is less than 12 breaths/minute, knee jerk is absent, urine output is less than 25 mL/hour", "334"),
        quote("Administer 10% calcium gluconate 10 ml IV slowly over 5–10 minutes", "334"),
      ],
    },
  ],
};
