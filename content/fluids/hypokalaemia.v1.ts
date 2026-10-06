import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPOKALAEMIA — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 22 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const hypokalaemiaV1: FluidTopic = {
  id: "hypokalaemia",
  version: "1.0.0",
  title: "Hypokalaemia: diagnosis and replacement",
  group: "electrolytes",
  summary: "Low potassium: severity bands, the ECG, urine potassium and acid–base work-up, and oral and IV replacement with the book's rates, concentrations and cautions.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["22 Hypokalemia"], pages: "254–266", pageKind: "book" },
  sections: [
    {
      id: "physiology",
      title: "Potassium in the body",
      blocks: [
        points([
          "Total body potassium is about 3,500 mEq: 98% intracellular, 2% extracellular.",
          "Normal serum potassium is 3.5 to 5.0 mEq/L; intracellular concentration is 140 to 150 mEq/L.",
          "Average intake about 77 mEq/day in adult men and 59 mEq/day in women. 90% is absorbed in the upper GI tract; of this the kidneys excrete 90% and stool 10%.",
          "Transcellular shift corrects plasma potassium within minutes without changing total body potassium; renal excretion is slow (several hours) but definitive.",
          "Shift out of cells (ICF to ECF): metabolic acidosis, insulin deficiency, plasma hyperosmolality, strenuous exercise, cell lysis, aldosterone deficiency, alpha-adrenergic agonists, beta-adrenergic blockade.",
          "Shift into cells (ECF to ICF): insulin, beta-adrenergic stimulation, aldosterone, metabolic alkalosis, hypo-osmolality.",
          "The healthy kidney can excrete as much as 400 mEq of potassium per day. With very poor intake it can lower 24-hour urinary potassium to 5-25 mEq (printed as mEq/L/day) but never to zero.",
          "Renal excretion rises with aldosterone, distal delivery of sodium and water (diuretics, osmotic diuresis), high serum potassium, and negatively charged anions such as bicarbonate in the collecting duct.",
          "Serum potassium falls less than proportionately with a body deficit because potassium shifts out of cells, so the level of hypokalaemia may underestimate the total body deficit.",
        ]),
        quote("Total body potassium is about 3,500 mEq. Out of this, 98% of potassium is intracellular, and just 2% of potassium is extracellular.", "254"),
        quote("the normal serum potassium concentration is 3.5 to 5.0 mEq/L vs. an intracellular 140 to 150 mEq/L.", "254"),
        quote("excrete as high as 400 mEq of potassium per day without causing clinically significant hyperkalemia.", "255"),
        quote("the level of hypokalemia may underestimate the total body potassium deficit.", "256"),
      ],
    },
    {
      id: "definition",
      title: "Definition and severity",
      blocks: [
        points([
          "Hypokalaemia: persistent reduction of serum potassium below 3.5 mEq/L.",
          "Below 2.5 mEq/L it is severe and life-threatening.",
          "Incidence up to 21% in hospitalised patients and 2% to 3% in outpatients.",
        ]),
        table(
          ["Band", "Serum K⁺ (mEq/L)"],
          [
            ["Borderline", "3.5-3.9"],
            ["Mild", "3.0-3.4"],
            ["Moderate", "2.5-2.9"],
            ["Severe", "<2.5"],
          ],
          "Severity bands used for treatment selection (p262)"
        ),
        quote("persistent reduction of serum potassium (K⁺) below 3.5 mEq/L. When serum potassium level is <2.5 mEq/L, hypokalemia is severe and life-threatening", "256"),
        quote("its incidence is up to 21% in hospitalized patients and 2% to 3% in outpatients", "256"),
      ],
    },
    {
      id: "causes",
      title: "Causes",
      intro: "Diuretics, vomiting, diarrhoea and hypomagnesaemia are the most common causes.",
      blocks: [
        table(
          ["Group", "Causes"],
          [
            ["1. Poor intake (rarely the sole cause)", "Low dietary intake (malnutrition), anorexia nervosa, or potassium-free intravenous fluids"],
            ["2. Extrarenal / non-renal loss (urinary potassium excretion <20-30 mEq/day)", "Vomiting, diarrhoea, large nasogastric aspiration, laxatives, ureterosigmoidostomy, excessive sweating"],
            ["3. Renal loss (urinary potassium excretion >20-30 mEq/day)", "Diuretics, osmotic diuresis, DKA, polyuria (e.g. post-ATN or post-obstructive diuresis); mineralocorticoid excess (primary or secondary aldosteronism), Cushing's syndrome, steroid therapy; magnesium deficiency, amphotericin B, Bartter's syndrome; renal tubular acidosis types I or II"],
            ["4. Redistribution (shift of K⁺ into cells)", "Insulin release, beta-adrenergic agonist (e.g. salbutamol), metabolic alkalosis, hypokalaemic periodic paralysis, refeeding syndrome"],
            ["5. Pseudohypokalaemia", "Delayed sample analysis in patients with high WBC count (e.g. acute myelogenous leukaemia)"],
          ],
          "Table 22.1 Causes of hypokalaemia"
        ),
        points([
          "Diuretics: loop and thiazide diuretics, through increased distal sodium delivery and hypovolaemia-induced aldosterone. Dose-dependent; more frequent with thiazides than loop diuretics.",
          "Vomiting: gastric juice holds less than 10 mEq/L of potassium, so the loss is chiefly renal, from hyperaldosteronism, alkalaemia and distal bicarbonate delivery; alkalosis also shifts potassium into cells.",
          "Diarrhoea: loss of potassium-rich fluid (K⁺ 50-100 mEq/L) plus renal loss from RAAS activation. Diarrhoeal fluid has about 30 mEq/L bicarbonate, so normal anion gap acidosis may follow, and the acidosis can mask the hypokalaemia or understate the deficit.",
          "Hypomagnesaemia: a common cause of hypokalaemia refractory to potassium; present in more than 50% of clinically significant hypokalaemia, most often with loop or thiazide diuretics.",
        ], "The common causes"),
        quote("Extrarenal loss/non-renal loss (Urinary potassium excretion <20-30 mEq/day)", "257"),
        quote("hypokalemia occurs due to loss of potassium-rich fluid (K⁺ content 50-100 mEq/L)", "257"),
        quote("Magnesium deficiency occurs in more than 50%", "257"),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features and ECG",
      blocks: [
        points([
          "Features depend on severity and rate of fall and seldom occur unless serum potassium is less than 3 mEq/L; mainly neuromuscular and cardiac.",
          "Fatigue, myalgia, leg cramps, lower limb muscle weakness.",
          "Smooth muscle: constipation, ileus, urinary retention.",
          "More severe: progressive weakness, ascending paralysis, hyporeflexia, hypoventilation from respiratory muscle involvement, virtually complete paralysis; rhabdomyolysis.",
          "Life-threatening arrhythmias such as torsades de pointes and ventricular tachycardia; triggers or worsens digitalis-associated arrhythmias.",
          "Metabolic acidosis, low urine specific gravity and polyuria from inability to concentrate urine.",
          "Stimulates proximal tubular ammoniagenesis and can precipitate or aggravate hepatic encephalopathy in hepatic failure.",
          "ECG changes do not correlate well with serum potassium. The earliest change is a decrease in T wave amplitude. ST depression mimics ischaemic heart disease.",
        ]),
        table(
          ["Potassium concentration", "ECG manifestations"],
          [
            ["<3.5 mEq/L", "Decrease in amplitude, flattening, or inversion of T-waves"],
            ["<3.0 mEq/L", "ST-segment depression, PR-interval prolongation, QT interval prolongation, prominent U waves (best seen in mid-precordial V2-V3 leads), tall P-wave, premature ventricular beats"],
            ["<2.5 mEq/L", "Atrial fibrillation, atrial flutter, atrial tachycardia, ventricular and supraventricular tachyarrhythmias, torsades de pointes (most classic), ventricular fibrillation"],
          ],
          "Table 22.2 Electrocardiographic changes of hypokalaemia"
        ),
        quote("seldom occurs unless serum potassium is less than 3 mEq/L.", "258"),
        quote("the earliest ECG change in hypokalemia is a decrease in T wave amplitude.", "258"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnostic approach",
      blocks: [
        steps([
          "History: GI losses, polyuria of DKA, anything shifting potassium into cells (insulin, beta-adrenergic agonists, sodium bicarbonate), medicines (laxatives, loop or thiazide diuretics, antibiotics), poor intake.",
          "Blood pressure is essential: with hypertension the common causes are primary aldosteronism (Conn's syndrome), Cushing's syndrome, renovascular disease and diuretics given for hypertension. Also assess volume status, arrhythmia, neurological signs and signs of hyperthyroidism or Cushing's syndrome.",
          "Laboratory: sodium, chloride, magnesium, calcium, phosphate, glucose, arterial blood gas, anion gap, complete blood count, BUN, creatinine and serum osmolality.",
          "If the cause is still unclear: urinary potassium excretion, then acid–base status (Figures 22.1 and 22.2).",
        ]),
        table(
          ["Test", "Points from the text", "Threshold"],
          [
            ["Spot urine potassium", "Simple and most commonly obtained; misleading if urine sodium is lower than 30 mEq/L and/or urine osmolality is lower than plasma osmolality", "Not printed"],
            ["24-hour urine potassium", "Most accurate, gold standard; cumbersome, impractical, unsuitable for urgent needs", "Below 25 to 30 mEq/day: appropriate renal conservation (extrarenal loss or transcellular shift). Above 25 to 30 mEq/day: urinary potassium wasting"],
            ["Spot urine potassium-to-creatinine ratio", "Rapid and reliable when 24-hour collection is not feasible; unaffected by urine volume or osmolality", ">13 mEq/g creatinine (1.5 mEq/mmol): inappropriate renal wasting. <13 mEq/g: GI losses, transcellular shift, remote diuretic use or poor intake"],
            ["Transtubular potassium gradient (TTKG)", "Semiquantitative index of collecting duct K⁺ secretion; inaccurate if urine osmolality is lower than serum osmolality or urine sodium <25 mEq/L; recent literature does not recommend it", ">7 renal wasting; <3 extrarenal loss"],
          ],
          "Measuring urinary potassium excretion"
        ),
        formula(
          "Transtubular potassium gradient, as printed",
          "TTKG = (Urine K⁺ / Serum K⁺) × (Urine osmolality / Serum osmolality)",
          [
            { symbol: "Urine K⁺", meaning: "Urine potassium", unit: "mEq/L" },
            { symbol: "Serum K⁺", meaning: "Serum potassium", unit: "mEq/L" },
            { symbol: "Urine osmolality", meaning: "Urine osmolality", unit: "mOsm/kg" },
            { symbol: "Serum osmolality", meaning: "Serum osmolality", unit: "mOsm/kg" },
          ],
          { note: "The book prints the osmolality ratio as a multiplier, urine over serum. Not wired to the calculator, which divides by that ratio. The book adds that recent literature does not recommend this test." }
        ),
        quote("TTKG = (Urine K⁺/Serum K⁺) × (Urine Osmolality/Serum Osmolality).", "261"),
        quote("The value of TTKG >7 indicates renal potassium wasting and the value <3 suggests extrarenal potassium loss.", "261"),
        quote("Recent literature does not recommend this test, and therefore not used for the diagnosis of hypokalemia", "261"),
        quote("Urinary potassium excretion below 25 to 30 mEq per day suggests appropriate renal conservation of potassium", "259"),
        quote("The value of urine potassium-to-creatinine ratio is >13 mEq/g creatinine (1.5 mEq/mmol) usually indicates inappropriate renal wasting of potassium", "261"),
        quote("misleading results if the urine sodium is lower than 30 mEq/L", "259"),
      ],
    },
    {
      id: "low_urine_k",
      title: "Low urine potassium: by acid–base status",
      intro: "Figure 22.1: spot urine potassium-to-creatinine ratio below 13 mEq/g creatinine (the text gives low renal excretion as <25 mEq/day).",
      blocks: [
        table(
          ["Acid–base status", "Causes"],
          [
            ["Metabolic acidosis", "Lower gastrointestinal losses"],
            ["No change in pH", "Transcellular shift: hypokalaemic periodic paralysis, insulin, beta-adrenergic agonist"],
            ["Metabolic alkalosis", "Surreptitious vomiting, remote use of diuretic"],
          ],
          "Figure 22.1 Approach with low urinary potassium excretion"
        ),
        quote("Low Spot Urine Potassium-Creatinine Ratio (<13 mEq/g creatinine)", "260"),
        quote("The causes of hypokalemia with low renal K⁺ excretion (<25 mEq/day) are summarized in Figure 22.1.", "261"),
      ],
    },
    {
      id: "high_urine_k",
      title: "High urine potassium: by acid–base, blood pressure, chloride, renin",
      intro: "Figure 22.2: spot urine potassium-to-creatinine ratio above 13 mEq/g creatinine.",
      blocks: [
        table(
          ["Branch", "Further test", "Causes"],
          [
            ["Metabolic acidosis", "None printed", "Diabetic ketoacidosis, type 1 (distal) or type 2 (proximal) RTA, amphotericin B"],
            ["Variable acid–base", "None printed", "Renal salt wasting"],
            ["Metabolic alkalosis, normal BP", "Urinary chloride <20 mEq/L", "Vomiting, penicillins including piperacillin"],
            ["Metabolic alkalosis, normal BP", "Urinary chloride >20 mEq/L", "Diuretics, Mg deficiency, Bartter's syndrome, Gitelman syndrome"],
            ["Metabolic alkalosis, high BP", "Renin and aldosterone both high", "Renal artery stenosis, malignant hypertension, or renin-secreting tumour causing secondary aldosteronism"],
            ["Metabolic alkalosis, high BP", "Low renin, high aldosterone", "Primary aldosteronism (Conn's syndrome) from adrenal adenoma or bilateral cortical hyperplasia, glucocorticoid-suppressible hyperaldosteronism"],
            ["Metabolic alkalosis, high BP", "Renin and aldosterone both low", "Cushing's syndrome, licorice, Liddle's syndrome, congenital adrenal hyperplasia (11-beta hydroxylase deficiency, 17-alpha hydroxylase deficiency)"],
          ],
          "Figure 22.2 Approach with high urinary potassium excretion"
        ),
        quote("Low urinary chloride (<20 mEq/L): Vomiting, Pencillins including Piperacillin", "260"),
        quote("High urinary chloride (>20 mEq/L): Diuretics, Mg deficiency, Bartter's syndrome, Gitelman Syndrome", "260"),
      ],
    },
    {
      id: "goals_prevention",
      title: "Goals and prevention",
      blocks: [
        steps([
          "Prevent hypokalaemia.",
          "Prevent life-threatening complications: cardiac arrhythmia and neuromuscular dysfunction such as diaphragmatic weakness and rhabdomyolysis.",
          "Correct the deficit and raise serum potassium to a safe level.",
          "Treat the cause, reduce or stop the offending agent, minimise ongoing losses.",
        ], "Therapeutic goals"),
        points([
          "Normal intake of about 50-100 mEq/day in adults is enough to prevent hypokalaemia.",
          "Patients on digitalis, long-term diuretics or large doses of steroids should receive a potassium-rich diet and supplement. Prevention matters especially with digitalis, hepatic failure, previous myocardial infarction or ischaemic heart disease, and diabetes mellitus.",
          "Diuretic-induced hypokalaemia or hyperaldosteronism: reduce the loop or thiazide dose, restrict sodium and give 20 mEq/day of potassium chloride.",
          "Critical and postoperative patients with normal potassium and creatinine: a maintenance dose of intravenous potassium prevents hypokalaemia.",
        ], "Prevention"),
        quote("Normal potassium intake of about 50-100 mEq/day in adults is sufficient to prevent hypokalemia.", "261"),
        quote("providing 20 mEq/day of potassium chloride are usually sufficient to prevent", "261"),
      ],
    },
    {
      id: "deficit",
      title: "Estimating the deficit",
      blocks: [
        points([
          "There is no fixed formula. Roughly, a 1 mEq/L fall in serum potassium equals a 300-400 mEq total body deficit.",
          "The deficit rises exponentially as potassium falls (Table 22.3), so this estimate may grossly underestimate the requirement.",
          "The two figures do not sit together: 300-400 mEq per 1 mEq/L in the text, but Table 22.3 gives 100-200 mEq at 3.0 mEq/L. Both are printed; neither replaces monitoring.",
        ]),
        table(
          ["Serum K⁺ (mEq/L)", "Total K⁺ deficit (mEq)"],
          [
            ["3.0", "100-200"],
            ["2.0", "400-600"],
            ["<2.0", ">600"],
          ],
          "Table 22.3 Total-body potassium deficit in the absence of a transcellular shift"
        ),
        quote("mEq/L fall in serum potassium = roughly 300-400 mEq total body potassium deficit", "262"),
        quote("Therefore, it may grossly underestimate the requirement of potassium.", "262"),
      ],
    },
    {
      id: "by_severity",
      title: "Treatment by severity",
      blocks: [
        table(
          ["Severity", "Treatment in the text"],
          [
            ["Borderline (3.5-3.9 mEq/L)", "Dietary potassium. Consider oral potassium chloride 20 mEq/day to prevent hypokalaemia with diuretics or hyperaldosteronism"],
            ["Mild (3.0-3.4 mEq/L)", "Dietary potassium. Oral potassium. IV potassium chloride if oral cannot be tolerated (severe nausea, vomiting, abdominal distress, non-functioning GI tract)"],
            ["Moderate (2.5-2.9 mEq/L)", "Dietary potassium. Oral KCl 40 to 100 mEq/day. IV if oral not tolerated: 10-20 mEq/h through a peripheral vein until K⁺ is normal or oral is possible and safe. High-risk patients (life-threatening arrhythmia, severe neuromuscular dysfunction, digitalis toxicity, recent or ongoing cardiac ischaemia, advanced liver disease) may need IV"],
            ["Severe (<2.5 mEq/L)", "IV potassium through a central line at 20-40 mEq/h until K⁺ is normal or the patient is asymptomatic"],
          ],
          "Selection of treatment modality"
        ),
        quote("Consider oral potassium chloride 20 mEq/day to prevent hypokalemia with diuretics or hyperaldosteronism.", "262"),
        quote("Administer IV potassium at 10-20 mEq/h through the peripheral vein", "262"),
        quote("Intravenous potassium should be given with a central line at 20-40 mEq/h", "262"),
        quote("(KCI 40 to 100 mEq/day).", "262"),
      ],
    },
    {
      id: "precautions",
      title: "Before starting potassium, and how much",
      blocks: [
        caution([
          "Oliguria or anuria: avoid potassium or give it cautiously.",
          "Potassium-sparing diuretics, ACE inhibitors and renal failure carry a high risk of hyperkalaemia: supplement cautiously.",
          "Digitalis slows potassium entry into cells, so faster IV infusion risks transient hyperkalaemia: infuse more slowly.",
          "Above 20 mEq/hour in any patient: continuous ECG monitoring and frequent serum potassium.",
        ]),
        points([
          "No fixed formula sets the amount: monitor serum potassium closely and adjust.",
          "For an average deficit of about 200-400 mEq, 50-100 mEq a day corrects it slowly but adequately.",
          "Severe hypokalaemia or high ongoing losses may need larger doses, correcting over days; severe loss may take weeks.",
          "If an adequate dose and duration fail to raise serum potassium, exclude hypomagnesaemia.",
        ]),
        quote("Continuous ECG monitoring and frequent serum potassium level estimation are advisable if the infusion rate is >20 mEq/hour in any patient.", "263"),
        quote("When the average potassium deficit is about 200-400 mEq, the daily admin-", "263"),
      ],
    },
    {
      id: "oral",
      title: "Oral potassium",
      blocks: [
        points([
          "Potassium-rich food: fruit juices, coconut water, banana, dry fruits, chocolate, coffee, soup, potassium-rich salt substitutes.",
          "Oral is cheaper and safer, with minimal risk of hyperkalaemia when renal function is adequate.",
          "Mild to moderate hypokalaemia (3 to 3.5 mEq/L) with normal renal function and no abnormal urinary losses: potassium chloride 40 to 100 mEq/day (10-20 mEq, 2-5 times), with treatment of the cause.",
          "Severe or symptomatic hypokalaemia needs faster replacement, most easily IV.",
          "Side effects: GI irritation, abdominal discomfort, nausea, diarrhoea; oesophageal or small bowel erosion and stricture are uncommon. Dilute the solution in 100-250 mL of water, with or after food.",
          "Prefer IV over oral in severe hypokalaemia (K⁺ <2.5 mEq/L), severe shock (unpredictable gut absorption), and patients who cannot tolerate oral or are nil by mouth.",
        ]),
        table(
          ["Preparation", "Potassium content"],
          [
            ["Potassium chloride 10% oral solution", "20 mEq per 15 mL (10 mL = 1 g KCl = 13.4 mEq)"],
            ["Potassium chloride tablets and capsules", "8 mEq or 10 mEq per tablet"],
          ],
          "Oral preparations"
        ),
        points([
          "Potassium chloride is preferred with metabolic alkalosis and with chloride depletion from diuretics or vomiting, as it corrects both deficits. Dietary potassium is mostly coupled with phosphate, so it does little for chloride depletion.",
          "Potassium citrate or bicarbonate is preferred with normal anion gap metabolic acidosis (diarrhoea, distal RTA) for its alkalinising effect.",
        ], "Choosing the salt"),
        quote("the average dose of potassium chloride is 40 to 100 mEq/day (10-20 mEq, 2-5 times)", "263"),
        quote("contains 20 mEq potassium per 15 ml oral solution (10 ml solution = 1gm KCI = 13.4 mEq of potassium).", "263"),
        quote("capsules contain 8 mEq or 10 mEq of potassium per tablet.", "263"),
        quote("proper dilution in 100-250 mL of water, with or after food.", "263"),
      ],
    },
    {
      id: "iv",
      title: "Intravenous potassium",
      blocks: [
        table(
          ["Preparation", "Content", "Use"],
          [
            ["Inj. potassium chloride 15%, 10 mL ampoule", "20 mEq potassium (each mL = 2 mEq)", "Most common IV formulation; primary treatment or adjunct to oral"],
            ["Inj. potassium phosphate, 10/15/20 mL ampoules", "3 mmol phosphate/mL and 4.4 mEq potassium/mL", "Hypophosphataemia with hypokalaemia (e.g. DKA, alcohol abuse, refeeding syndrome)"],
          ],
          "IV preparations"
        ),
        table(
          ["IV fluid", "Potassium (mEq/L)"],
          [
            ["Isolyte-M", "35.0"],
            ["Isolyte-P", "20.0"],
            ["Isolyte-G", "17.0"],
            ["Isolyte-E", "10.0"],
            ["PlasmaLyte", "5.0"],
            ["RL Sterofundin", "4.0"],
          ],
          "Table 22.4 Potassium concentration of IV fluids",
          "The table's last column header prints \"RL Sterofundin\" as one entry with one value."
        ),
        points([
          "IV carries a higher risk of hyperkalaemia than oral: reserve it for severe hypokalaemia (K⁺ <3 mEq/L) and for patients who are symptomatic or cannot tolerate oral.",
          "The text's threshold here (<3 mEq/L) differs from the severity table, which allows IV in mild hypokalaemia when oral is not tolerated and calls only <2.5 mEq/L severe.",
        ], "Indications"),
        steps([
          "Avoid infusing at rate >10-20 mEq/hr.",
          "Avoid infusing at concentration >40 mEq/L.",
          "Avoid infusing total amount >240 mEq/day.",
          "Monitor closely with frequent serum potassium.",
          "Doses >20 mEq/hour or concentrations >40 mEq/L require cardiac monitoring.",
          "Concentrated infusions (>40 mEq/L) are given by infusion pump (the transcription loses words across the page break); they are indicated when the requirement is high or fluid must be restricted. Peripheral concentrated KCl causes local pain, phlebitis or venous thrombosis.",
          "Dilute KCl in normal saline or 0.45% saline. Avoid dextrose-containing diluents: dextrose releases insulin, which drives potassium into cells.",
          "Shake the drip well; do not add KCl to a hanging bottle, as mixing will be improper.",
        ], "Recommendations for administration (\"no rule is absolute\")"),
        caution([
          "Never infuse undiluted potassium chloride directly as a bolus: sudden hyperkalaemia and cardiac arrest.",
          "Do not add potassium chloride to Isolyte-M, which already carries 35 mEq/L.",
          "Hypokalaemia is safer than hyperkalaemia; avoid overenthusiastic treatment. Rapid IV correction can cause dangerous hyperkalaemia even in potassium-depleted patients.",
          "The severe band (p262) gives 20-40 mEq/h by central line, above the general 10-20 mEq/hr ceiling (p264). Both are printed.",
        ]),
        quote("Inj. potassium chloride 15%, 10 ml ampoule contains 20 mEq of potassium (Each ml of 15% KCI = 2 mEq of potassium).", "264"),
        quote("Each ml of potassium phosphate contains 3 mmol Phosphate/mL and 4.4 mEq Potassium/mL.", "264"),
        quote("IV potassium supplementation should be reserved for severe hypokalemia (K⁺ <3 mEq/L)", "264"),
        quote("Avoid infusing at rate >10-20 mEq/hr.", "264"),
        quote("Avoid infusing at concentration >40 mEq/L.", "264"),
        quote("Avoid infusing total amount >240 mEq/day.", "264"),
        quote("(>20 mEq/hour) or higher concentrations (>40 mEq/L) requires cardiac monitoring.", "264"),
        quote("Never infuse undiluted inj. potassium chloride directly intravenously as a bolus form", "265"),
        quote("Avoid adding potassium chloride to Isolyte-M because this fluid is rich in potassium (K⁺ content 35 mEq/L).", "265"),
        quote("Add KCI to normal saline or 0.45% saline to prepare potassium infusion.", "265"),
      ],
    },
    {
      id: "special",
      title: "Special situations",
      blocks: [
        points([
          "Metabolic acidosis with severe hypokalaemia: replace potassium before correcting the acidosis; sodium bicarbonate shifts potassium into cells and may be life-threatening.",
          "Hypomagnesaemia: the most common cause of refractory hypokalaemia, especially on loop or thiazide diuretics. Always check magnesium and correct it, orally or IV, to speed potassium correction and lower arrhythmia risk. The chapter prints no magnesium dose.",
          "DKA: serum potassium is high-normal or raised in about 95% at presentation, yet the average adult deficit is about 3-5 mEq/kg body weight. Hypokalaemia develops in about 50% during treatment, from insulin and acidosis correction shifting potassium into cells, vomiting and osmotic diuresis, and dilution by IV fluids.",
        ]),
        table(
          ["Serum K⁺", "ADA guidance in DKA"],
          [
            ["3.3 to 5.2 mEq/L", "Inj. KCl 20-30 mEq in each litre of IV fluid, started after diuresis"],
            ["<3.3 mEq/L", "Inj. KCl 20-30 mEq in each litre of IV fluid; temporarily hold insulin until K⁺ >3.3 mEq/L"],
          ],
          "Potassium in DKA"
        ),
        quote("on average has about 3-5 mEq/ kg/body weight potassium deficit", "265"),
        quote("3.3 to 5.2 mEq/L: Inj. KCI 20-30 mEq in each liter of IV fluid to be initiated after diuresis.", "266"),
        quote("temporarily hold the administration of Insulin till K⁺ > 3.3 mEq/L.", "266"),
      ],
    },
    {
      id: "target",
      title: "Targets, monitoring and the underlying cause",
      blocks: [
        table(
          ["Patient group", "Target serum K⁺ (mEq/L)"],
          [
            ["Most patients", "4.0-5.0"],
            ["Cardiac patients", "4.0-4.6"],
            ["DKA", "4-5"],
          ],
          "Target of supplementation"
        ),
        points([
          "Once cardiac rhythm is normal and respiratory muscle strength restored, taper and stop the infusion and move to oral potassium.",
          "Vomiting or continuous nasogastric aspiration: a proton pump inhibitor reduces hypokalaemia by cutting hydrogen and chloride loss and so the alkalosis-driven renal loss.",
          "Diuretic loss: stop or reduce the diuretic, potassium-rich diet, oral potassium, correct hypomagnesaemia, add a mineralocorticoid receptor antagonist (spironolactone or eplerenone) or amiloride; comorbidity drugs such as ACE inhibitors, ARBs or beta-blockers raise serum potassium.",
          "Spironolactone helps in primary hyperaldosteronism, advanced heart failure and with thiazide or loop diuretics.",
          "Hypokalaemic thyrotoxic periodic paralysis: oral propranolol decreases frequency and severity of attacks.",
        ]),
        quote("a serum potassium level of 4.0-5.0 mEq/L in most of the patients", "266"),
        quote("4.0-4.6 mEq/L in cardiac patients", "266"),
      ],
    },
  ],
};
