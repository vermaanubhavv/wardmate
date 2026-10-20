import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * POTASSIUM CHLORIDE AND POTASSIUM PHOSPHATE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 13 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const potassiumChlorideAndPhosphateV1: FluidTopic = {
  id: "potassium_chloride_and_phosphate",
  version: "1.0.0",
  title: "Potassium chloride and potassium phosphate",
  group: "fluids",
  summary: "Injection KCl and potassium phosphates: composition, indications, cautions, the book's peripheral and central rates and concentrations, phosphate dosing by severity, and monitoring.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["13 Potassium Chloride and Potassium Phosphate"], pages: "144–150", pageKind: "book" },
  sections: [
    {
      id: "overview",
      title: "Two potassium salts",
      blocks: [
        points([
          "Potassium chloride is the more common choice and is widely used to correct hypokalaemia.",
          "Potassium phosphate is given less often, mainly to manage or prevent hypophosphataemia, especially when it comes with hypokalaemia.",
        ]),
      ],
    },
    {
      id: "kcl_composition",
      title: "Potassium chloride: composition",
      blocks: [
        table(
          ["Inj. 15% potassium chloride", "Value as printed"],
          [
            ["Potassium, each mL", "2 mEq"],
            ["KCl, each mL", "150 mg"],
            ["Osmolarity", "4024 mOsmol/L (calc)"],
            ["pH", "6.0 (4.0 to 8.0)"],
            ["Potassium per 10 mL ampoule", "20.0 mEq"],
            ["KCl per 10 mL ampoule", "1.5 mg"],
          ],
          "Composition (p144)",
          "The KCl per ampoule is printed as 1.5 mg; at 150 mg per mL a 10 mL ampoule would hold 1.5 g. Kept as printed for the reviewer to check against the book."
        ),
        quote("Potassium 2 mEq", "144"),
        quote("Osmolarity 4024 mOsmol/L (calc)", "144"),
        quote("Available as 10 ml ampules which provides:", "144"),
        quote("Potassium 20.0 mEq", "144"),
      ],
    },
    {
      id: "kcl_pharmacology",
      title: "Potassium chloride: pharmacological basis",
      blocks: [
        points([
          "Potassium is chiefly intracellular, at 140 to 150 mEq/L, the most abundant intracellular cation. Normal serum potassium is 3.5–5.0 mEq/L; extracellular potassium regulates nerve conduction and muscle contraction, particularly in the heart.",
          "The kidneys retain potassium incompletely (unlike sodium), so loss continues on a potassium-free diet and even in hypokalaemia: patients on maintenance fluid therapy need potassium supplementation.",
          "Where sodium and potassium are both lost (diarrhoea, vomiting, diuretic therapy), raised aldosterone retains sodium and the kidney loses potassium, causing or aggravating hypokalaemia; adequate potassium is needed along with sodium.",
        ]),
        quote("concentrations of 140 to 150 mEq/L and is the most abundant intracellular cation", "144"),
        quote("The normal range for serum potassium is 3.5–5.0 mEq/L", "144"),
      ],
    },
    {
      id: "kcl_indications",
      title: "Potassium chloride: indications",
      blocks: [
        points([
          "Prevention of hypokalaemia: added to IV fluids for patients on maintenance fluid therapy. Normal adult requirement 1 mEq/kg/day (about 60 mEq/day).",
          "Correction of hypokalaemia from abnormal losses or deficit (diuretic therapy, vomiting, diarrhoea, diabetic ketoacidosis, corticosteroid therapy) or in digoxin toxicity, when oral replacement is inadequate or not feasible.",
          "Addition to peritoneal dialysis fluid to customise its potassium concentration.",
          "Cardioplegia: concentrated potassium chloride achieves cardiac standstill during cardiac bypass surgery.",
        ]),
        quote("The normal requirement of potassium in an adult is 1 mEq/kg/day (about 60 mEq/day) [1].", "145"),
      ],
    },
    {
      id: "kcl_adverse_contra",
      title: "Potassium chloride: adverse effects and contraindications",
      blocks: [
        points([
          "Higher concentrations through a peripheral vein can cause local pain, phlebitis or venous thrombosis.",
          "Improper use can cause hyperkalaemia, which if severe causes serious, life-threatening cardiac arrhythmia.",
        ], "Adverse effects"),
        caution([
          "Unknown potassium status: do not use injection potassium chloride without knowing the potassium status.",
          "Kidney failure: use cautiously; hyperkalaemia is a potential risk.",
          "High risk of hyperkalaemia: use cautiously in oliguria, severe adrenal insufficiency, crush syndrome, severe burns, severe haemolytic reactions, and with ACEI, ARB or potassium-sparing diuretic therapy.",
        ], "Contraindications"),
        quote("Do not use injection potassium chloride without knowing potassium status.", "145"),
      ],
    },
    {
      id: "kcl_administration",
      title: "Potassium chloride: administration",
      blocks: [
        caution([
          "Never give undiluted potassium chloride as a direct IV push: it may cause instant death. Always dilute it in the infusion.",
          "Mix thoroughly (invert the bag fully at least 10 times): KCl is heavier and may settle at the bottom of the bag, and the resulting inadvertent bolus can cause life-threatening arrhythmia.",
          "Always label the potassium-containing solution carefully and clearly.",
        ]),
        points([
          "Add KCl to saline rather than dextrose: dextrose stimulates insulin release, transiently lowering plasma potassium and aggravating hypokalaemia.",
          "Usual maximum concentration: 40 mEq in 1 L of solution.",
          "Every 10 mEq of IV KCl roughly raises serum potassium by about 0.1 mEq/L.",
          "Prefer ready-to-use glucose-free, potassium-containing premixed diluted solutions, if available.",
          "Impaired renal function: potassium dose ≤50% of the initial empirical dose.",
          "Hypokalaemia usually comes with hypomagnesaemia; co-administering magnesium helps, as hypomagnesaemia promotes urinary potassium loss and can make hypokalaemia refractory.",
        ]),
        table(
          ["Situation", "Rate and route as printed"],
          [
            ["Peripheral vein", "Maximum 10 mEq/hour; maximum concentration 40 mEq/L. Central line essential for a faster rate or greater concentration"],
            ["Serum K⁺ >2.5 mEq/L", "Normally not above 10 mEq/hour; total not above 200 mEq/day"],
            ["Symptomatic and severe (K⁺ <2.5 mEq/L)", "Up to 20 mEq/hour with continuous ECG monitoring"],
            ["Critically ill, life-threatening (K⁺ <2.0 mEq/L)", "Very cautiously, up to 40 mEq/hour for initial urgent correction, via central line with close continuous ECG monitoring and frequent lab assessment"],
          ],
          "Rates of IV potassium chloride"
        ),
        quote("Never administer an undiluted injection of potassium chloride as a direct intravenous push, as it may cause instant death.", "145"),
        quote("the maximum concentration of injection potassium chloride is 40 mEq in 1L of solution.", "145"),
        quote("Every 10 mEq of IV potassium chloride replacement will roughly increase serum levels by about 0.1 mEq/L [3].", "145"),
        quote("the recommended maximum rate is 10 mEq/hour, and the maximum concentration is 40 mEq/L.", "145"),
        quote("rate should not normally exceed 10 mEq/hour, and the total dose should not exceed 200 mEq/day [4].", "146"),
        quote("the maximum rate of potassium infusion of up to 20 mEq/hour with continuous electrocardiogram (ECG) monitoring is safe [5].", "146"),
        quote("potassium can be infused very cautiously at a rate of up to 40 mEq/hour for the initial urgent correction", "146"),
        quote("Ensure thorough mixing (by fully inverting the bag at least 10 times)", "146"),
        quote("the dose of potassium should be ≤50% of the initial empirical dose [9].", "146"),
      ],
    },
    {
      id: "kphos_composition",
      title: "Potassium phosphate: composition",
      blocks: [
        table(
          ["Inj. potassium phosphates", "Phosphate", "Potassium"],
          [
            ["Each mL", "3 mmol", "4.4 mEq"],
            ["5 mL ampoule", "15.0 mmol", "22.0 mEq"],
            ["15 mL ampoule", "45.0 mmol", "66.0 mEq"],
            ["50 mL pharmacy bulk package vial", "150.0 mmol", "222.0 mEq"],
          ],
          "Composition (p146)",
          "Each mL also contains monobasic potassium phosphate (KH2PO4) 224 mg and dibasic potassium phosphate (K2HPO4) 236 mg. Osmolarity 7400 mOsm/L."
        ),
        quote("Osmolarity 7400 mOsm/L", "146"),
        quote("Phosphate 45.0 mmol", "146"),
        quote("Potassium 66.0 mEq", "146"),
      ],
    },
    {
      id: "kphos_pharmacology",
      title: "Potassium phosphate: pharmacological basis",
      blocks: [
        points([
          "Phosphorus is a constituent of nucleic acids, proteins and some vitamins; hypophosphataemic symptoms come from intracellular phosphate deficiency impairing energy production, protein synthesis, cell signalling and pH regulation.",
          "Severe hypophosphataemia is frequent in critically ill patients and carries arrhythmia, skeletal muscle weakness, respiratory muscle dysfunction with failure to wean, longer ICU stay, morbidity and mortality: phosphate replacement is essential.",
          "With hypokalaemia, potassium phosphates are preferred: 4.4 mEq of potassium per mL along with 3 mmol of phosphate.",
          "Dilute before use: osmolality 7400 mOsm/L, against 252 (5% dextrose), 273 (Ringer's lactate) and 308 (normal saline) mOsm/L.",
        ]),
        quote("providing 4.4 mEq of potassium in each ml along with 3 mmol of phosphate.", "147"),
        quote("it is extremely hypertonic, with an osmolality of 7400 mOsm/L.", "147"),
      ],
    },
    {
      id: "kphos_indications",
      title: "Potassium phosphate: indications",
      blocks: [
        points([
          "Hypophosphataemia: severe (serum phosphate <1 mg/dL or 0.32 mmol/L), symptomatic moderate, and other degrees when oral or enteral intake is not possible, restricted or contraindicated.",
          "Hypokalaemia with hypophosphataemia (diabetic ketoacidosis, refeeding syndrome, chronic alcoholism): 4.4 mEq/mL is more than twice the 2.0 mEq/mL of 15% KCl.",
          "Hypernatraemia with hypophosphataemia: sodium-free potassium phosphates preferred over sodium phosphates.",
          "Parenteral nutrition: prevents hypophosphataemia. Adult phosphorus requirement about 20–40 mmol/day, or 10–15 mmol/L of PN solution.",
        ]),
        quote("(serum phosphate <1 mg/dL or 0.32 mmol/L)", "147"),
        quote("the approximate dose of phosphorus required is 20–40 mmol/day [13] or 10–15 mmol/L of PN solution", "147"),
      ],
    },
    {
      id: "kphos_adverse",
      title: "Potassium phosphate: adverse effects",
      blocks: [
        points([
          "Cardiovascular: hypotension, cardiac arrhythmia, heart block, cardiac arrest.",
          "Endocrine and metabolic: hypocalcaemia, hypomagnesaemia, hyperkalaemia, hyperphosphataemia.",
          "Neurological: tingling, numbness, tremor, tetany, seizures.",
          "Pulmonary: embolism from pulmonary vascular calcium phosphate precipitates.",
          "Renal: nephrocalcinosis from calcium phosphate precipitates causing acute kidney injury.",
          "Local: pain, phlebitis or venous thrombosis through a peripheral vein.",
          "Aluminium toxicity: concentrated potassium phosphate contains aluminium; prolonged use in renal failure may cause toxicity.",
        ]),
      ],
    },
    {
      id: "kphos_precautions",
      title: "Potassium phosphate: precautions and contraindications",
      blocks: [
        caution([
          "Avoid bolus: do not infuse undiluted or rapidly; it can cause hyperkalaemia, hypocalcaemia, hypotension, arrhythmias and cardiac arrest.",
          "Serum potassium 4 or more (printed as mEq/dL): avoid or use cautiously. Use cautiously where hyperkalaemia is a risk: oliguria, severe adrenal insufficiency, extensive tissue breakdown (e.g. severe burns), ACEI, ARB or potassium-sparing diuretics.",
          "Each 1 mmol of phosphate also gives 1.5 mEq of potassium: count it in the total electrolytes infused.",
          "Renal insufficiency: avoid, or reduce the phosphate dose by 50%.",
          "Hypercalcaemia: calcium-phosphate may precipitate in tissues (calciphylaxis).",
          "Significant hypocalcaemia: rapid phosphate can cause acute severe hypocalcaemia with tetany and seizures; normalise calcium first.",
          "Do not co-administer parenteral nutrition or IV fluids containing magnesium or calcium.",
          "Avoid venous damage: dilute properly, or use a central line for concentrated or hypertonic solutions.",
        ]),
        quote("Avoid or use IV phosphate cautiously if serum potassium is 4 mEq/dL or more", "148"),
        quote("each 1 mmol of phosphate concomitantly provides 1.5 mEq of potassium", "148"),
        quote("use it cautiously by reducing the dose of phosphate by 50%.", "148"),
      ],
    },
    {
      id: "kphos_administration",
      title: "Potassium phosphate: administration",
      blocks: [
        steps([
          "Watch before you start: check serum potassium, calcium, phosphate, magnesium and creatinine to exclude hyperkalaemia, hypocalcaemia, hypomagnesaemia and renal failure. If the Ca × PO4 product is greater than 60 (printed as mg/dL), avoid phosphate.",
          "Write a one-time order: dose of phosphate (in mmol), type and volume of diluent, route and rate. Re-evaluate before each subsequent order; severe cases may need several doses.",
          "Dilute: 100 to 500 mL of 5% dextrose or 0.9% sodium chloride, mixed thoroughly, given IV slowly. Do not dilute in calcium-containing Ringer's lactate (calcium-phosphate precipitation).",
          "Choose the route by rate and concentration (table below).",
          "Monitor: serum phosphate and calcium every 6 to 12 hours; sodium, potassium, magnesium and creatinine every 12 to 24 hours. ECG monitoring for infusions above 6.4 mmol phosphate (potassium above 10 mEq) per hour.",
        ]),
        table(
          ["Route", "Rate", "Dilution as printed"],
          [
            ["Peripheral", "Maximum about 6.4 mmol phosphate/hour (10 mEq potassium/hour)", "10 mL in 500 mL diluent: 6 mmol phosphate and 8.8 mEq potassium per 100 mL"],
            ["Central", "Higher, e.g. 15 mmol phosphate/hour (22 mEq potassium)", "30 mL in 500 mL (or 6 mL in 100 mL): 18 mmol phosphate and 26.4 mEq potassium per 100 mL"],
          ],
          "Peripheral vs central venous access"
        ),
        quote("Calculate Ca × PO4 product and If the product is greater than 60 mg/dL, avoid infusing phosphate", "148"),
        quote("(i.e., 100 to 500 mL of 5% dextrose or 0.9% sodium chloride)", "148"),
        quote("the maximum rate of administration is about 6.4 mmol phosphate per hour (10 mEq potassium/hour).", "149"),
        quote("will provide 6 mmol phosphates and 8.8 mEq potassium per 100 mL of solution", "149"),
        quote("will provide 18 mmol phosphates and 26.4 mEq potassium per 100 mL.", "149"),
        quote("Serum phosphate and calcium concentration should be monitored every 6 to 12 hours", "149"),
        quote("ECG monitoring is recommended for infusions of >6.4 mmol phosphates (potassium >10 mEq) per hour.", "150"),
      ],
    },
    {
      id: "kphos_dosing",
      title: "Phosphate dose by severity",
      intro: "The book says no agreement or guideline exists; regimens are based on severity and weight.",
      blocks: [
        table(
          ["Dose", "Serum phosphate (mg/dL)", "Serum phosphate (mmol/L)", "Initial infusion, Clark et al", "Initial infusion, Brown et al"],
          [
            ["Low", "2.3 to 3.0", "0.73 to 0.96", "0.16 mmol/kg", "0.32 mmol/kg"],
            ["Intermediate", "1.6 to 2.2", "0.51 to 0.72", "0.32 mmol/kg", "0.64 mmol/kg"],
            ["High", "<1.6", "<0.50", "0.64 mmol/kg", "1.0 mmol/kg"],
          ],
          "Table 13.1 Guidelines for IV phosphate therapy for hypophosphataemia"
        ),
        points([
          "Infuse potassium phosphate if serum potassium is <4 mEq/L; above 4 mEq/L use sodium phosphate instead.",
          "IV potassium phosphorus at 7.5 mmol/hour, given slowly, is printed as definitely safe.",
          "In parenteral nutrition, phosphate should not exceed 15 mmol/L.",
          "Stop when asymptomatic and serum phosphate >2 mg/dL, unless loss or intake failure persists.",
        ], "Table 13.1 notes"),
        table(
          ["Serum phosphate", "Dose as printed"],
          [
            ["1.25 mg/dL (0.40 mmol/L) or more", "0.08 to 0.24 mmol/kg over six hours (up to 30 mmol maximum total dose)"],
            ["1.25 mg/dL (0.40 mmol/L) or less", "0.25 to 0.50 mmol/kg over 8 to 12 hours (up to 80 mmol maximum total dose)"],
            ["Symptomatic, severe (<1.5 mg/dL; printed as 0.48 mmol/kg)", "Up to 15 mmol/hour"],
          ],
          "Simple recommendations",
          "Both bands are printed as including 1.25 mg/dL. The severe band's second unit is printed as mmol/kg."
        ),
        quote("Infuse potassium phosphate if serum potassium is <4 mEq/L.", "149"),
        quote("Administration of IV potassium phosphorus slowly at 7.5 mmol/hour is definitely safe.", "149"),
        quote("the dose of phosphate should not exceed 15 mmol/L.", "149"),
        quote("Administer phosphate at the rate 0.08 to 0.24 mmol/kg over six hours (up to 30 mmol maximum total dose) [20].", "149"),
        quote("Administer phosphate at the rate 0.25 to 0.50 mmol/kg over 8 to 12 hours (up to 80 mmol maximum total dose) [20].", "149"),
        quote("administer phosphate at a rate of up to 15 mmol/hour [21].", "149"),
      ],
    },
  ],
};
