import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * BODY WATER, ELECTROLYTES AND UNITS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 1, which the source edition carries in full. Every number below is the
 * book's; the quotes give the PDF page it came from. The mg/dL to mEq/L and mEq/L to mg/dL
 * conversion formulas are printed as images in the source and are not reproduced; only the
 * book's worked examples are.
 */
export const bodyWaterAndUnitsV1: FluidTopic = {
  id: "body_water_and_units",
  version: "1.0.0",
  title: "Body water, electrolytes and units",
  group: "fluids",
  summary: "Compartments and their volumes, normal plasma electrolytes, mEq and mg conversions, osmolality, and the daily water arithmetic.",
  setting: "Every ward; the physiology every fluid prescription rests on",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["1 Basic Physiology"], pages: "6–13" },
  sections: [
    {
      id: "total_body_water",
      title: "Total body water",
      blocks: [
        points([
          "Total body water varies mainly with body weight, and also with age, sex and fat content.",
          "About 60% of body weight in a young adult male and about 50% in a young adult female.",
          "Adipose tissue holds little water, so an obese person has proportionately less body water than a lean person of the same weight.",
          "Newborns have the highest percentage, as high as 80%, which declines with age.",
          "Measured by indicator dilution (deuterium oxide, tritium oxide, oxygen-18 labelled water) or bioelectrical impedance analysis.",
        ]),
        table(
          ["Group", "Total body water (% of body weight)"],
          [
            ["Adult male", "60%"],
            ["Adult female", "50%"],
            ["Elderly", "50%"],
            ["Adult obese", "50%"],
            ["Infant", "70%"],
            ["Neonate", "80%"],
          ],
          "Table 1.1 Average total body water as a percentage of body weight"
        ),
        quote("Total body water content is about 60% of body weight in a young adult male and about 50% in a young adult female", "6"),
      ],
    },
    {
      id: "compartments",
      title: "Fluid compartments",
      blocks: [
        points([
          "Total body water is divided into intracellular fluid (ICF) and extracellular fluid (ECF).",
          "ICF is all the body water within cells: normally two thirds of total body water and 40% of body weight. Water balance regulates the ICF volume.",
          "ECF is all body water outside cells, in the tissue spaces (interstitial fluid), the blood vessels (plasma) and the lymphatics. Normally one third of total body water and 20% of body weight. Sodium balance regulates the ECF volume.",
          "ECF is subdivided into interstitial fluid (three quarters of ECF, 15% of body weight) and plasma (one quarter of ECF, one twelfth of total body water, 5% of body weight).",
          "A small transcellular compartment of ECF includes cerebrospinal fluid and the synovial, peritoneal, pericardial and intraocular fluids.",
        ]),
        table(
          ["Fluid type", "Total", "ICF", "ECF", "Interstitial", "Plasma"],
          [
            ["% of body weight", "60%", "40%", "20%", "15%", "5%"],
            ["Volume for 70 kg weight", "42.0 L", "28.0 L", "14.0 L", "10.5 L", "3.5 L"],
          ],
          "Table 1.2 Distribution of fluid volume in body compartments"
        ),
        formula(
          "Total body water and its compartments",
          "TBW = weight × fraction; ICF = two thirds of TBW; ECF = one third of TBW",
          [
            { symbol: "TBW", meaning: "total body water", unit: "L" },
            { symbol: "weight", meaning: "body weight", unit: "kg" },
            { symbol: "fraction", meaning: "share of body weight that is water: 0.60 adult male, 0.50 adult female, elderly or obese, 0.70 infant, 0.80 neonate" },
            { symbol: "ICF", meaning: "intracellular fluid, 40% of body weight", unit: "L" },
            { symbol: "ECF", meaning: "extracellular fluid, 20% of body weight", unit: "L" },
          ],
          {
            example: "70 kg man: 42.0 L total, 28.0 L intracellular, 14.0 L extracellular (10.5 L interstitial, 3.5 L plasma).",
            note: "The book prints this as Table 1.2 (PDF page 7), the percentages and the 70 kg volumes, not as an equation.",
            calc: "tbw",
          }
        ),
        quote("The ICF is normally two third of total body water and 40% of total body weight.", "7"),
      ],
    },
    {
      id: "movement",
      title: "How water and solutes move",
      blocks: [
        points([
          "Cell membranes are selectively permeable. Water passes freely in response to changes in solute concentration, so the osmolalities in all compartments are equal.",
          "Hydrostatic pressure and oncotic pressure are the two major determinants of water and electrolyte movement between compartments.",
          "The major water-retaining solutes are sodium in the ECF, potassium in the ICF and plasma protein in the intravascular compartment.",
          "Solutes cannot pass freely; they move by active and passive transport. The sodium–potassium pump (Na+-K+-ATPase) is the major force keeping sodium extracellular and potassium intracellular.",
          "Because sodium is confined chiefly to the ECF, sodium-containing fluids are distributed throughout the ECF and expand both the interstitial and intravascular spaces; the interstitial expansion is approximately three times that of the plasma.",
        ]),
        table(
          ["Electrolyte", "ECF (mEq/L)", "ICF (mEq/L)"],
          [
            ["Sodium", "142.00", "10.00"],
            ["Potassium", "4.30", "150.00"],
            ["Chloride", "104.00", "2.00"],
            ["Bicarbonate", "24.00", "6.00"],
            ["Calcium", "5.00", "0.01"],
            ["Magnesium", "3.00", "40.00"],
            ["Phosphate and sulfate", "8.00", "15.00"],
          ],
          "Table 1.3 The electrolyte concentration of body fluids"
        ),
        table(
          ["Ion", "ECF", "ICF"],
          [
            ["Major cation", "Sodium", "Potassium and magnesium"],
            ["Major anion", "Chloride and bicarbonate", "Phosphate, sulfate and protein"],
          ],
          "Table 1.4 Major ions in ECF and ICF"
        ),
        quote("the interstitial space expansion is approximately three times as much as the plasma", "9"),
      ],
    },
    {
      id: "water_balance",
      title: "Normal water balance and daily need",
      blocks: [
        points([
          "A healthy adult consumes an average of 2000 ml of water per day; intake and output balance at steady state.",
          "Intake: drinks, water in food, and water synthesised by oxidation. Thirst regulates intake: water loss raises ECF osmotic pressure, osmoreceptors in the hypothalamic thirst centre trigger thirst; drinking and gastric distension inhibit it.",
          "Loss: kidneys, faeces, sweat (sensible perspiration), evaporation from the skin (insensible perspiration) and the lungs. The kidney plays the major role, adjusting urine volume.",
          "Water loss increases with exercise, excessive sweating, fever, burns and surgery.",
        ]),
        formula(
          "Normal daily insensible fluid loss",
          "Insensible loss − insensible input = 1000 − 300 = 700 ml",
          [
            { symbol: "insensible loss", meaning: "500 ml skin, 400 ml lung, 100 ml stool", unit: "ml/day" },
            { symbol: "insensible input", meaning: "water from oxidation", unit: "ml/day" },
          ],
          { example: "Daily fluid requirement for a normal person = urine output + 700 ml.", note: "Printed on PDF page 8." }
        ),
        quote("Insensible fluid loss = 1000 ml (500 ml through the skin, 400 ml through the lung, and 100 ml through stool)", "8"),
        quote("So, daily fluid requirement = urine output + 700 ml.", "8"),
      ],
    },
    {
      id: "plasma_electrolytes",
      title: "Normal plasma electrolytes",
      blocks: [
        table(
          ["Electrolyte", "mEq/L", "mmol/L", "mg/dL"],
          [
            ["Sodium", "136 to 145", "136 to 145", "not given"],
            ["Potassium", "3.5 to 5.0", "3.5 to 5.0", "not given"],
            ["Calcium, total", "4.5 to 5.6", "2.2 to 2.6", "8.5–10.5"],
            ["Calcium, ionised", "2.2 to 2.6", "1.05 to 1.3", "4.3–5.3"],
            ["Magnesium", "1.4 to 1.7", "0.70 to 0.85", "1.7–2.1"],
            ["Chloride", "96 to 106", "96 to 106", "not given"],
            ["Bicarbonate", "22 to 26", "22 to 26", "not given"],
          ],
          "Table 1.6 Normal plasma electrolyte concentrations",
          "The mg/dL column is the table's footnote; the book gives mg/dL only for calcium and magnesium."
        ),
        quote("The normal values for total calcium and ionized calcium are 8.5-10.5 mg/dL and 4.3-5.3 mg/dL, respectively.", "10"),
      ],
    },
    {
      id: "units",
      title: "Moles, equivalents and milliequivalents",
      blocks: [
        points([
          "An ion is an atom or group of atoms with an electric charge. Anions are negative (Cl−, HCO3−, phosphate); cations are positive (Na+, K+, Mg2+). Anion has an n for negative; cation has a t for plus.",
          "Concentrations are measured in mg/dL, mEq/L, or mOsm/L or mOsm/kg.",
          "A mole of any non-dissociable substance contains about 6.022 × 10^23 particles. One mole is the atomic or molecular weight in grams; one millimole is that weight in milligrams. The atomic weight of sodium is 23, so 23 mg of Na+ in 1 litre gives 1 mmol/L.",
          "An equivalent is a mole of ionic charges: atomic weight in grams multiplied by valence. For single-charged ions (Na+, K+, Cl−, H+) a mole equals an equivalent; one mole of Ca2+ equals two equivalents.",
          "Uncharged molecules such as glucose are quantified in moles, in practice in mg or gm. Ions can be quantified as moles or equivalents.",
          "mmol and mEq are used rather than mol and Eq because serum concentrations are extremely low: potassium 0.004 mol/L reads more usefully as 4 mmol/L or 4 mEq/L.",
        ]),
        formula(
          "Equivalents",
          "Equivalents = Moles × Valence",
          [
            { symbol: "Moles", meaning: "amount of the ion", unit: "mol" },
            { symbol: "Valence", meaning: "charge carried by the ion" },
          ],
          { example: "One mole of calcium ion (Ca2+) equals two equivalents.", note: "Printed on PDF page 10." }
        ),
        table(
          ["Substance", "Symbol or formula", "Atomic or molecular weight"],
          [
            ["Calcium", "Ca2+", "40.1"],
            ["Carbon", "C", "12.0"],
            ["Chloride ion", "Cl−", "35.5"],
            ["Hydrogen ion", "H+", "1.0"],
            ["Magnesium ion", "Mg2+", "24.3"],
            ["Oxygen", "O", "16.0"],
            ["Phosphorus", "P", "31.0"],
            ["Potassium ion", "K+", "39.1"],
            ["Sodium ion", "Na+", "23.0"],
            ["Ammonium", "NH4+", "18.0"],
            ["Bicarbonate ion", "HCO3−", "61.0"],
            ["Phosphate ion", "PO4 3−", "95.0"],
            ["Water", "H2O", "18.0"],
          ],
          "Table 1.5 Atomic and molecular weights of important substances"
        ),
        quote("one mole of calcium ion (Ca 2+) equals two equivalents", "10"),
      ],
    },
    {
      id: "meq_mg_conversion",
      title: "Converting between mEq and mg",
      intro: "The book prints formulas for mg/dL to mEq/L, mEq/L to mg/dL and mg/dL to mmol/L as images; they are not reproduced in this edition's text. Its worked examples are.",
      blocks: [
        steps([
          "1 gm of NaCl in 1 litre of water: 1 gm/L = 1,000 mg/L = 100 mg/dL. Valence of NaCl is 1; molecular weight 58.5 (Na+ 23 and Cl− 35.5). Result: 1 gm NaCl/L = 17.1 mEq/L, so 1 gm of NaCl contains 17.1 mEq sodium and 17.1 mEq chloride.",
          "1 litre of NaCl solution containing 154 mEq: molecular weight 58.5, valence 1. Result: 9009 mg/L of NaCl. 9009 divided by 154 is 58.5, so 100 ml of NaCl solution containing 1 mEq of NaCl has 58.5 mg of salt.",
          "The two constants to keep: sodium is 17.1 mEq per gm of NaCl, and 1 mEq is 58.5 mg of NaCl.",
        ], "Worked examples with sodium chloride"),
        table(
          ["Salt", "mEq cation or anion per gm of salt", "mg of salt per mEq"],
          [
            ["Sodium chloride", "17", "58"],
            ["Potassium chloride", "13", "75"],
            ["Sodium bicarbonate", "12", "84"],
            ["Calcium gluconate", "4", "224"],
            ["Calcium chloride", "14", "73"],
            ["Magnesium sulfate", "8", "123"],
          ],
          "Table 1.7 Conversion between mEq and mg"
        ),
        steps([
          "10 ml of 15% KCl = 1.5 gm KCl per ampoule. 1 gm of KCl contains 13 mEq of K+ (Table 1.7). 1.5 × 13 = 19.5 mEq of potassium per ampoule.",
          "25 ml of 7.5% NaHCO3 = 1.86 gm NaHCO3 per ampoule. 1 gm of NaHCO3 contains 12 mEq of Na+ (Table 1.7). 1.86 × 12 = 22.3 mEq of sodium per ampoule.",
        ], "Worked examples with ampoules"),
        caution([
          "Chapter 2's Table 2.4 lists the same 10 ml ampoule of 15% KCl as 20 mEq/10 ml, against 19.5 mEq in this worked example. The book does not reconcile the two.",
        ]),
        quote("So, 1 gm of NaCl contains 17.1 mEq sodium and 17.1 mEq chloride", "11"),
        quote("10 ml amp. of 15% KCl contains 19.5 mEq of potassium.", "11"),
        quote("A 25 ml ampoule of 7.5% NaHCO3 contains 22.3 mEq of Na+.", "12"),
      ],
    },
    {
      id: "osmolality",
      title: "Osmotic pressure, osmolality and osmolarity",
      blocks: [
        points([
          "Osmotic pressure determines the distribution of water between compartments, particularly between ECF and ICF. It is proportional to the number of particles per unit volume of solvent, not to their type, valence or weight. To generate it, the solute must be unable to cross the cell membrane.",
          "One osmole is 1 gm molecular weight (1 mol) of a non-dissociable substance such as glucose, 6.022 × 10^23 particles. A milliosmole is one thousandth of that; body fluids are measured in mOsm/kg of water.",
          "For glucose, which does not dissociate, an osmole equals a mole. A mole of sodium chloride, which dissociates almost completely, equals 2 osmoles.",
          "Osmolality is solute per kilogram of water (mOsm/kg). Osmolarity is solute per litre of solution (mOsm/L). Litre has the r of osmolarity; kilogram has the l of osmolality.",
          "Temperature changes the volume of solvent and solute, so osmolarity varies with it; osmolality, by weight, is more accurate. The difference is negligible and osmolarity is easier to measure, so it is used more commonly.",
          "The osmolality of any solution is measured by its freezing point.",
          "Plasma osmolality is determined largely by sodium salts, with a lesser contribution from other ions, glucose and urea. Normal plasma osmolality is 285 (275–295) mOsm/kg.",
          "Effective osmolality is set by solutes that do not freely cross the cell membrane and so hold water in the ECF. Urea is lipid-soluble and crosses membranes: it counts in calculated plasma osmolality but not in effective osmolality, so total and effective osmolality differ.",
          "Normally glucose contributes only 5 mOsm/kg to effective osmolality, so plasma sodium is the determinant and reflector of plasma osmolality.",
        ]),
        caution([
          "No equation for calculated serum osmolality is printed in chapter 1. The book gives one in the hyponatraemia chapter (PDF page 149), where the equation itself is an image; the text names its inputs only as sodium in mEq/L, glucose in mg/dL and blood urea nitrogen in mg/dL, and gives normal serum osmolality there as 275–290 mOsm/kg against 285 (275–295) here.",
        ]),
        quote("Normal plasma osmolality is 285 (275–295) mOsm/kg.", "13"),
        quote("Under normal circumstances, glucose accounts for only 5 mOsm/kg in effective osmolality.", "13"),
      ],
    },
  ],
};
