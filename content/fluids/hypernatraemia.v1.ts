import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPERNATRAEMIA — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 21 of the full edition. Page numbers are the printed book pages.
 */
export const hypernatraemiaV1: FluidTopic = {
  id: "hypernatraemia",
  version: "1.0.0",
  title: "Hypernatraemia: diagnosis and correction",
  group: "electrolytes",
  summary: "Sodium above 145 mEq/L: causes by volume status, how to read the work-up, the water deficit formulas, which fluid by which route, and how fast to bring sodium down.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["21 Hypernatremia"], pages: "246–252", pageKind: "book" },
  sections: [
    {
      id: "what",
      title: "What it is",
      blocks: [
        points([
          "Plasma sodium greater than 145 mEq/L. It always means hypertonicity (hyperosmolality).",
          "Usually due to water deficit, not sodium overload: lack of water, loss of water, or primary sodium gain.",
          "About 1%–3% of hospitalised patients and 9% of the critically ill, with mortality about 40–60%.",
          "Normal thirst is the most potent protection, so it is seen chiefly in the very young, very old, very sick, bed-ridden or debilitated, or when water is unavailable, restricted, thirst is impaired, or the patient is comatose or confused.",
          "A pure water deficit leading to hypernatraemia is called dehydration.",
        ]),
        quote("an increase in plasma sodium concentration greater than 145 mEq/L, always results in hypertonicity (hyperosmolality)", "246"),
        quote("about 1%-3% of all hospitalized patients and 9% in critically ill patients", "246"),
      ],
    },
    {
      id: "causes",
      title: "Causes by volume status",
      intro: "Table 21.1 in the text. Insufficient water intake (lack of access to water, impaired thirst or altered consciousness) is an important coexisting factor that maintains hypernatraemia in every group.",
      blocks: [
        table(
          ["ECF volume", "Urinary Na⁺", "Examples"],
          [
            ["Hypovolaemia: loss of hypotonic fluid", "<20 mEq/L", "Extrarenal loss. GI: osmotic diarrhoea, enterocutaneous fistula, protracted vomiting. Dermal: heat exposure, severe burns, severe exercise. Respiratory: febrile patients on a ventilator"],
            ["Hypovolaemia: loss of hypotonic fluid", ">20 mEq/L", "Renal loss. Loop diuretics, osmotic diuresis due to hyperglycaemia, urea or mannitol, intrinsic renal diseases, post-obstructive diuresis"],
            ["Euvolaemia: loss of pure water", "<20 mEq/L", "Renal loss. Central diabetes insipidus: lack of ADH, idiopathic or due to head injury, surgery or neoplasm. Nephrogenic diabetes insipidus: resistance to ADH, commonly due to chronic kidney disease, hypercalcaemia, hypokalaemia, lithium, amphotericin B and obstruction"],
            ["Euvolaemia: loss of pure water", ">20 mEq/L", "Extrarenal loss. Large respiratory or dermal insensible losses"],
            ["Hypervolaemia: hypertonic sodium gain", ">20 mEq/L", "Hypertonic infusion: hypertonic saline or sodium bicarbonate, hypertonic enteral or parenteral feeding. Other: Cushing syndrome, salt intoxication, soy sauce"],
          ],
          "Table 21.1 Causes of hypernatraemia"
        ),
        quote("Hypertonic infusion: Hypertonic saline or sodium bicarbonate (NaHCO₃) infusion, hypertonic enteral or parenteral feeding", "247"),
      ],
    },
    {
      id: "features",
      title: "Clinical features",
      blocks: [
        points([
          "Chiefly neurological; depends on speed of onset, duration, severity, cause and volume status.",
          "Early: extreme fatigue, muscular weakness, lethargy, cramps, nausea, malaise, irritability.",
          "Severe (sodium greater than 160 mEq/L): hyperthermia, headache, muscle twitching, altered mental status, confusion, delirium, focal neurological deficit, occasionally coma. Convulsions are usually absent but can occur with aggressive rehydration or inadvertent sodium loading.",
          "Chronic (>48 h): brain adaptation restores cell water, so symptoms are fewer and milder.",
          "Acute: severe symptoms typically with sodium above 155–160 mEq/L. Brain shrinkage pulls on the venous sinuses and can cause intracerebral and subarachnoid haemorrhage, irreversible damage or death.",
          "Excessive thirst, dry sticky mucous membranes and raised temperature are characteristic. Hypovolaemia is hard to detect; orthostatic hypotension and tachycardia may be an early clue.",
          "Urine volume is low in hypovolaemia and high in diabetes insipidus or osmotic diuresis. Polyuria (persistent urine output of more than 100 mL/h) with excessive thirst often presents diabetes insipidus, with dilute urine despite hypernatraemia.",
        ]),
        quote("In severe hypernatremia (i.e., sodium greater than 160 mEq/L)", "247"),
        quote("Severe symptoms typically occur in acute hypernatremia with serum sodium levels above 155-160 mEq/L", "247"),
        quote("Polyuria (persistent urine output of more than 100 mL/h)", "248"),
      ],
    },
    {
      id: "water_vs_isotonic",
      title: "Why pure water loss looks milder",
      intro: "Pure water loss is shared across total body water (2/3 from ICF, 1/3 from ECF), and intravascular volume is 1/4 of ECF, so the circulation loses much less than in isotonic loss.",
      blocks: [
        table(
          ["Reduction in", "Loss of 1000 mL by isotonic loss", "Loss of 1000 mL by pure water depletion"],
          [
            ["ICF volume", "-", "667 mL"],
            ["ECF volume", "1000 mL", "333 mL"],
            ["Intravascular volume", "250 mL", "83 mL"],
          ],
          "Table 21.2 Distribution of fluid loss in isotonic and pure water depletion"
        ),
        quote("Intravascular volume | 250 ml | 83 ml", "248"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis",
      intro: "History, examination and recent medications may give the cause; if they clinch it, laboratory studies may not be needed, but frequent electrolyte checks still are. Useful tests: serum electrolytes, glucose, BUN, creatinine, urine volume, osmolality and glycosuria, and response to vasopressin.",
      blocks: [
        table(
          ["Test", "Interpretation"],
          [
            ["Plasma osmolality", "In hypernatraemia, serum osmolality is always >290 mOsm/kg"],
            ["Urinary osmolality >800 mOsm/kg", "Small volume of concentrated urine, the appropriate renal response. Hypovolaemic hypernatraemia from GI, dermal or respiratory losses with impaired thirst or no access to water. Hypervolaemic hypernatraemia from salt overload"],
            ["Urinary osmolality <800 mOsm/kg", "Suggests a defect in renal water conservation"],
            ["Urinary osmolality 300 to 800 mOsm/kg", "Osmotic diuresis, partial central DI, central DI with volume depletion, partial nephrogenic DI"],
            ["Urinary osmolality <300 mOsm/kg", "Inappropriately dilute urine: complete central or nephrogenic DI"],
            ["Spot urinary Na⁺ <20 mEq/L", "Hypovolaemic hypernatraemia from GI, dermal or respiratory losses; euvolaemic hypernatraemia from central or nephrogenic DI"],
            ["Spot urinary Na⁺ >20 mEq/L", "Osmotic diuresis, infusion of hypertonic saline or NaHCO₃"],
            ["Water restriction test", "Normally urinary osmolality rises. In central or nephrogenic DI, polyuria and dilute urine persist despite restriction"],
            ["Response to desmopressin", "10 µg intranasal desmopressin (DDAVP) after careful water restriction. Urinary osmolality rises by at least 50% in central DI; no response in nephrogenic DI"],
          ],
          "Table 21.3 Interpretation of investigations in hypernatraemia"
        ),
        quote("In hypernatremia, serum osmolality is always >290 mOsm/kg", "249"),
        quote("Urinary osmolality will increase by at least 50% in central diabetes insipidus but lack of response in nephrogenic DI", "249"),
        quote("<300 mOsm/kg (inappropriately dilute urine): Complete forms of central or nephrogenic DI", "249"),
      ],
    },
    {
      id: "goals",
      title: "Goals and the underlying cause",
      blocks: [
        steps([
          "Correct volume depletion and shock promptly if present.",
          "Stop ongoing excess water loss by treating the cause, and give enough water to prevent recurrence.",
          "Correct the water deficit gradually until the patient is asymptomatic.",
          "Lower sodium slowly and gently to avoid cerebral oedema, while avoiding the symptoms of brain shrinkage.",
        ], "Therapeutic goals"),
        points([
          "Two factors set the plan: ECF volume status, and the severity of symptoms with the rate of development.",
          "Treat the cause: diabetes insipidus, hyperglycaemia, hypokalaemia, hypercalcaemia, diarrhoea. Control fever. Stop mannitol, lactulose, diuretics or drugs linked to nephrogenic DI. Withdraw hypertonic tube feeds.",
        ]),
      ],
    },
    {
      id: "volume_status",
      title: "Treatment by volume status",
      blocks: [
        steps([
          "Haemodynamically unstable: restoring perfusion comes first. Normal saline or Ringer's lactate is the fluid of choice whatever the sodium. 0.9% NaCl (154 mEq/L) is usually below the patient's sodium, so it corrects hypotension without an unnecessarily rapid fall.",
          "Haemodynamically stable: after isotonic fluid (normal saline, Ringer's lactate or PlasmaLyte), replace the water deficit and ongoing losses with hypotonic fluid: oral water, 5% dextrose, 0.2% or 0.45% sodium chloride.",
          "Correct about 50% of the water deficit in the first 24 hours and the rest over the next 48 hours.",
        ], "Hypovolaemic"),
        quote("Correct about 50% of the water deficit in the first 24 hours; the remaining water deficit is restored over the next 48 hours.", "250"),
        points([
          "Diabetes insipidus is the most common cause.",
          "Central DI: desmopressin (DDAVP) nasal spray 10–20 µg per 12–24 hours, or orally 0.1–0.8 mg per 12 hours.",
          "Nephrogenic DI: thiazide (such as hydrochlorothiazide 25 mg once or twice daily), NSAIDs, less salt and protein, and correct hypercalcaemia or hypokalaemia or stop drugs such as lithium.",
          "Amiloride 2.5 to 10 mg per day may add to a thiazide, especially in lithium-induced nephrogenic DI.",
        ], "Euvolaemic"),
        quote("nasal spray (10-20 ug per 12-24 hours) or orally (0.1-0.8 mg orally per 12 hours)", "250"),
        quote("hydrochlorothiazide, 25 mg once or twice daily", "250"),
        quote("using a dose of 2.5 to 10 mg per day", "250"),
        points([
          "Usually from large amounts of hypertonic sodium IV fluid (hypertonic saline, NaHCO₃), often in the ICU.",
          "Stop the cause, give loop diuretics, and add hypotonic IV fluid or enteral water to help sodium excretion, taking care not to overload.",
          "Dialysis may be indicated in a few with severe complications such as oliguric renal failure or intractable overload with dyspnoea when medical management fails.",
        ], "Hypervolaemic"),
      ],
    },
    {
      id: "deficit",
      title: "Calculating the water deficit",
      intro: "The book gives three formulas. Add ongoing and insensible losses to the calculated deficit, and correct the total fluid deficit over 48–72 hours.",
      blocks: [
        formula(
          "a. Free-water deficit",
          "Free-water deficit = TBW × ((serum Na⁺ ÷ 140) − 1)",
          [
            { symbol: "TBW", meaning: "Current total body water", unit: "L" },
            { symbol: "serum Na⁺", meaning: "Measured serum sodium", unit: "mEq/L" },
            { symbol: "Free-water deficit", meaning: "Water to replace, before ongoing losses", unit: "L" },
          ],
          { calc: "free_water_deficit" }
        ),
        formula(
          "b. Change in serum Na⁺ with 1 litre of the solution",
          "Change in serum Na⁺ = (solution Na⁺ − serum Na⁺) ÷ (TBW + 1)",
          [
            { symbol: "solution Na⁺", meaning: "Sodium in the infused fluid", unit: "mEq/L" },
            { symbol: "serum Na⁺", meaning: "Measured serum sodium", unit: "mEq/L" },
            { symbol: "TBW", meaning: "Total body water", unit: "L" },
            { symbol: "Change in serum Na⁺", meaning: "Expected change after 1 litre", unit: "mEq/L" },
          ],
          { calc: "adrogue_madias" }
        ),
        formula(
          "c. Rough estimate of volume to give",
          "Volume = 3–4 mL × body weight × desired Na⁺ reduction",
          [
            { symbol: "Volume", meaning: "Fluid to administer", unit: "mL" },
            { symbol: "body weight", meaning: "Body weight", unit: "kg" },
            { symbol: "desired Na⁺ reduction", meaning: "Planned fall in serum sodium", unit: "mEq/L" },
          ]
        ),
        quote("Current Total Body Water-TBW (L) × {(Serum [Na⁺] ÷ 140) − 1}", "251"),
        quote("3-4 ml x Body Weight (kg) x (Desired Na⁺ Reduction [mEq/L])", "251"),
        quote("Correct the total fluid deficit over 48-72 hours.", "251"),
      ],
    },
    {
      id: "route_fluid",
      title: "Route and choice of fluid",
      blocks: [
        points([
          "Best route: free water by mouth or nasogastric tube. Large deficits are hard to correct through the gut alone, so it is commonly combined with IV fluid.",
          "Hypotensive: isotonic fluid (normal saline or Ringer's lactate), whatever the sodium.",
          "Use oral water as the primary method whenever feasible.",
          "Severe hypernatraemia usually needs large volumes; common choices are 5% dextrose, 0.2% or 0.45% saline.",
        ]),
        caution([
          "Give 5% dextrose cautiously: rapid large volumes risk hyperglycaemia even without diabetes, and the osmotic diuresis loses more free water and worsens hypernatraemia. Use insulin if needed.",
        ]),
        quote("commonly used fluids to correct fluid deficit include dextrose 5%, 0.2%, or 0.45% saline", "251"),
      ],
    },
    {
      id: "rate",
      title: "Rate of correction",
      blocks: [
        points([
          "Acute (<24 hours): more symptomatic; correct relatively rapidly to reduce the risk of cerebral oedema. The precise safe rate is not known.",
          "Chronic (>48 hours): less symptomatic; correct more slowly. The traditional aim is 12 mEq/L over 24 hours.",
          "A rate above 0.5 mEq/L per hour carries a risk of cerebral oedema with death or convulsion, documented mainly in neonates.",
          "Growing evidence: this risk is not seen in adults, and slower correction has been linked to longer stays, excess mortality and neurological damage. Chauhan et al. (2019) and Feigin et al. found no harm, or better survival, with rapid correction, so the trend is to correct severe hypernatraemia rapidly.",
        ]),
        quote("Acute hypernatremia (<24 hours) is more symptomatic and requires rapid correction", "250"),
        quote("the traditional recommendation is to aim for a correction rate of 12 mEq/L over 24 hours", "252"),
        quote("A serum sodium correction rate greater than 0.5 mEq/L per hour carries the risk of cerebral edema", "252"),
        caution([
          "The book does not classify onset between 24 and 48 hours. It also gives two timelines: 50% in 24 hours then the rest over 48 hours (72 hours in all) for hypovolaemia, and 48–72 hours for the total deficit generally. Both are kept as printed.",
        ], "Where the text is not exact"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring",
      intro: "Formulas cannot predict the volume exactly because of ongoing GI losses, variable free water in urine and insensible losses.",
      blocks: [
        points([
          "Watch clinical status; chart fluids given, urine output and weight.",
          "Serum sodium every 1–2 hours in acute and every 6–8 hours in chronic hypernatraemia, and adjust the prescription.",
        ]),
        quote("serial monitoring of serum sodium (every 1-2 hours in acute hypernatremia and 6-8 hours in chronic hypernatremia)", "252"),
      ],
    },
  ],
};
