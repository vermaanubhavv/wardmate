import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * IV FLUIDS: COMPOSITION, TONICITY AND CHOICE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 2, which the source edition carries in full, and the opening pages of
 * chapters 3 and 4, which it does not (see the last section). Every number below is the book's;
 * the quotes give the PDF page it came from. Where the book contradicts itself the table note
 * says so and leaves both numbers standing.
 */
export const ivFluidsOverviewV1: FluidTopic = {
  id: "iv_fluids_overview",
  version: "1.0.0",
  title: "IV fluids: composition, tonicity and choice",
  group: "fluids",
  summary: "What is in each bag, how it behaves once infused, who should not get it, and how to set the drip rate by hand.",
  setting: "Every ward that hangs a bag without a pump",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: ["2 Overview of Intravenous Fluids", "3 Dextrose and Sodium Chloride Solutions (opening only)", "4 Balanced and Multi-electrolyte Solutions (opening only)"],
    pages: "14–29",
  },
  sections: [
    {
      id: "principles",
      title: "Before prescribing",
      blocks: [
        points([
          "Consider the underlying cause of the fluid deficit and the type of electrolyte imbalance; coexisting conditions (diabetes, hypertension, ischaemic heart disease, renal or hepatic disorders); and clinical status (age, hydration, vital signs, urine output).",
          "Answer, for every prescription: when is IV fluid appropriate and when avoided; which fluid and why; how much and by what calculation; at what rate and drop rate; what are the contraindications of each fluid; how to choose a fluid to correct an electrolyte imbalance.",
          "The oral route is always preferred over the IV route. IV therapy is nonetheless life-saving in many clinical problems.",
          "Fluid therapy is used for resuscitation, maintenance, replacing and restoring deficits, as a drug carrier and for nutrition.",
        ]),
        quote("As a principle, the oral route is always preferred over the IV route.", "14"),
      ],
    },
    {
      id: "indications_contraindications",
      title: "Indications, contraindications and complications",
      blocks: [
        points([
          "Resuscitation in moderate to severe dehydration and shock, where urgent and rapid replacement is needed.",
          "Maintenance when oral intake is not possible or is insufficient (coma, anaesthesia, surgery).",
          "Restoring or replacing losses: severe vomiting, diarrhoea, fever, burns; third-space loss (sepsis, burns, ascites, pancreatitis, ileus); blood loss (trauma, surgery).",
          "Correcting electrolyte and acid–base disorders.",
          "Correcting severe hypoglycaemia, where IV 25% dextrose is life-saving.",
          "Vehicle for IV medications (antibiotics, chemotherapy, insulin, vasopressors).",
          "Parenteral nutrition.",
          "Critical problems: shock, anaphylaxis, severe asthma, cardiac arrest, forced diuresis in drug overdose, poisoning.",
          "Monitoring haemodynamic function and administering diagnostic reagents.",
        ], "Indications, as listed"),
        caution([
          "IV fluid should be avoided if the patient can take oral fluid.",
          "Preferably avoid IV fluid in a patient with congestive heart failure or volume overload.",
        ], "Contraindications"),
        points([
          "Advantages: controlled and predictable administration; immediate response through direct intravascular infusion; rapid correction of life-threatening disturbances.",
          "Disadvantages: more expensive and needs strict asepsis; feasible only in supervised hospitalised patients; the wrong fluid, volume, rate or technique can cause serious harm.",
        ]),
        table(
          ["Kind", "Complications listed"],
          [
            ["Local", "Haematoma, infiltration, infusion phlebitis."],
            ["Systemic", "Circulatory overload with rapid or large-volume infusion, especially in patients with cardiac problems. Rigors, air embolism, septicaemia."],
            ["Others", "Fluid contamination, fungus in IV fluids, mixing of incompatible drugs, incorrect infusion technique, IV set or catheter problems, human error."],
          ]
        ),
        quote("To correct severe hypoglycemia, where IV 25% dextrose is life-saving.", "16"),
      ],
    },
    {
      id: "composition",
      title: "Composition of common IV solutions",
      intro: "Table 2.1 as printed, split in three so it reads on a phone. A dash means the fluid contains none; NA means the book gives no value. Dextrose is in gm/L, everything else in mEq/L except osmolality in mOsm/L.",
      blocks: [
        table(
          ["Fluid", "Dextrose gm/L", "kcal/L", "Na+", "K+", "Cl−"],
          [
            ["5% dextrose", "50", "170", "–", "–", "–"],
            ["10% dextrose", "100", "340", "–", "–", "–"],
            ["0.45% saline", "–", "–", "77", "–", "77"],
            ["D5W, 0.45% saline", "50", "170", "77", "–", "77"],
            ["Normal (0.9%) saline", "–", "–", "154", "–", "154"],
            ["Dextrose saline", "50", "170", "154", "–", "154"],
            ["Ringer's lactate", "–", "–", "130", "4.0", "109"],
            ["Ringer's acetate", "–", "–", "130", "5.0", "112"],
            ["PlasmaLyte", "–", "–", "140", "5.0", "98"],
            ["Sterofundin", "–", "–", "145", "4.0", "127"],
            ["Isolyte-G", "50", "170", "63", "17", "150"],
            ["Isolyte-M", "50", "170", "37", "35", "37"],
            ["Isolyte-P", "50", "170", "25", "20", "24"],
            ["Isolyte-E", "50", "170", "140", "10", "103"],
            ["Isolyte-S", "–", "–", "141", "5.0", "98"],
          ],
          "Table 2.1, part 1: dextrose, calories, sodium, potassium, chloride",
          "The text gives Isolyte-G chloride as 154 mEq/L (alongside normal saline and dextrose saline) where this table prints 150."
        ),
        table(
          ["Fluid", "Acetate", "Lactate", "Gluconate", "Citrate", "NH4+"],
          [
            ["5% dextrose", "–", "–", "–", "–", "–"],
            ["10% dextrose", "–", "–", "–", "–", "–"],
            ["0.45% saline", "–", "–", "–", "–", "–"],
            ["D5W, 0.45% saline", "–", "–", "–", "–", "–"],
            ["Normal (0.9%) saline", "–", "–", "–", "–", "–"],
            ["Dextrose saline", "–", "–", "–", "–", "–"],
            ["Ringer's lactate", "–", "28", "–", "–", "–"],
            ["Ringer's acetate", "27", "–", "–", "–", "–"],
            ["PlasmaLyte", "27", "–", "23", "–", "–"],
            ["Sterofundin", "24", "–", "–", "–", "–"],
            ["Isolyte-G", "–", "–", "–", "–", "70"],
            ["Isolyte-M", "20", "–", "–", "–", "–"],
            ["Isolyte-P", "23", "–", "–", "–", "–"],
            ["Isolyte-E", "47", "–", "–", "8.0", "–"],
            ["Isolyte-S", "27", "–", "23", "–", "–"],
          ],
          "Table 2.1, part 2: buffers and ammonium (mEq/L)"
        ),
        table(
          ["Fluid", "Ca2+", "Mg2+", "HPO4", "Osmolality mOsm/L", "SID mEq/L"],
          [
            ["5% dextrose", "–", "–", "–", "252", "0"],
            ["10% dextrose", "–", "–", "–", "505", "0"],
            ["0.45% saline", "–", "–", "–", "154", "0"],
            ["D5W, 0.45% saline", "–", "–", "–", "406", "0"],
            ["Normal (0.9%) saline", "–", "–", "–", "308", "0"],
            ["Dextrose saline", "–", "–", "–", "560", "0"],
            ["Ringer's lactate", "3.0", "–", "–", "273", "28"],
            ["Ringer's acetate", "3.0", "2.0", "–", "276", "27"],
            ["PlasmaLyte", "–", "3.0", "–", "295", "50"],
            ["Sterofundin", "5.0", "2.0", "–", "309", "29"],
            ["Isolyte-G", "–", "–", "–", "578", "NA"],
            ["Isolyte-M", "–", "–", "15", "415", "NA"],
            ["Isolyte-P", "–", "3.0", "3.0", "348", "NA"],
            ["Isolyte-E", "5.0", "3.0", "–", "595", "57"],
            ["Isolyte-S", "5.0", "3.0", "1.0", "295", "NA"],
          ],
          "Table 2.1, part 3: calcium, magnesium, phosphate, osmolality, strong ion difference",
          "The text gives Ringer's lactate and Ringer's acetate calcium as 2 mEq/L in one place (the calcium paragraph) and 3 mEq/L in another (this table and the description of RL); the book does not reconcile them. PlasmaLyte osmolality is 295 here and in the text but 290 in Table 2.5."
        ),
        points([
          "Balanced crystalloids such as Ringer's lactate, PlasmaLyte and Sterofundin are the physiological IV fluids. RL is the most commonly used; its electrolytes are close to ECF: Na+ 130, K+ 4, Cl− 109, lactate (bicarbonate) 28 and Ca2+ 3 mEq/L.",
          "Sodium: normal saline and dextrose saline carry the most, 154 mEq/L, which is 9 gm of NaCl per litre (1 gm NaCl = 17.1 mEq Na+).",
          "Chloride: normal saline, D5NS and Isolyte-G carry the most, 154 mEq/L.",
          "Potassium: Isolyte-M has the highest at 35 mEq/L; the balanced crystalloids carry only 4–5 mEq/L.",
          "Magnesium: Ringer's acetate and Sterofundin 2 mEq/L; PlasmaLyte, Isolyte-P, Isolyte-E and Isolyte-S 3 mEq/L.",
          "Calcium: Ringer's lactate and Ringer's acetate 2 mEq/L; Sterofundin, Isolyte-E and Isolyte-S 5 mEq/L.",
          "Phosphate: Isolyte-M 15 mEq/L; Isolyte-P 3 mEq/L.",
          "Glucose-free: normal saline, Ringer's lactate, PlasmaLyte, Sterofundin, so they do not worsen hyperglycaemia. Sodium- and chloride-free: only 5%, 10% and 20% dextrose; Isolyte-M and Isolyte-P are relatively low in both. Potassium-free: normal saline, dextrose saline, 5%, 10% and 20% dextrose.",
        ], "Bird's eye view, as the book gives it"),
        quote("normal saline (NS) and dextrose saline (D5NS) contain the maximum amount of sodium, with 154 mEq/L or 9 gm of NaCl per liter", "17"),
        quote("Isolyte-M has the highest potassium content, with 35 mEq/L", "17"),
      ],
    },
    {
      id: "sodium_potassium",
      title: "Sodium and potassium content, ranked",
      blocks: [
        table(
          ["IV solution", "Sodium mEq/L"],
          [
            ["3% NaCl", "513.0"],
            ["NS, D5NS", "154.0"],
            ["Sterofundin", "145.0"],
            ["PlasmaLyte", "140.0"],
            ["RL", "130.0"],
            ["0.45% NaCl", "77.0"],
            ["Isolyte-G", "63.0"],
            ["Isolyte-M", "37.0"],
            ["Isolyte-P", "25.0"],
          ],
          "Table 2.3 Sodium concentration of IV fluids"
        ),
        table(
          ["IV solution", "Potassium mEq/L"],
          [
            ["Isolyte-M", "35.0"],
            ["Isolyte-P", "20.0"],
            ["Isolyte-G", "17.0"],
            ["PlasmaLyte", "5.0"],
            ["RL and Sterofundin", "4.0"],
            ["Inj. potassium chloride 15%", "20 mEq/10 ml"],
          ],
          "Table 2.4 Potassium concentration of IV fluids",
          "Chapter 1's worked example gives the same 10 ml ampoule of 15% KCl as 19.5 mEq."
        ),
        quote("balanced crystalloids such as RL, PlasmaLyte, and Sterofundin contain only 4–5 mEq/L of potassium", "17"),
      ],
    },
    {
      id: "acid_base_effects",
      title: "Fluids that correct acidosis or alkalosis",
      blocks: [
        points([
          "Some fluids carry bicarbonate precursors. Ringer's lactate has 28 mEq/L of lactate, converted to bicarbonate in the liver, correcting metabolic acidosis.",
          "Acetate is converted to bicarbonate in the liver and peripheral tissues: PlasmaLyte 27 mEq/L, Sterofundin 24, Isolyte-P 23, Isolyte-M 20.",
          "Isolyte-G is the only IV fluid that directly corrects metabolic alkalosis. Its ammonium chloride (NH4Cl 70 mEq/L) is converted to H+ ions and urea in the liver; the H+ corrects the alkalosis.",
        ]),
        quote("the presence of ammonium chloride (NH4Cl = 70 mEq/L) in Isolyte-G, which undergoes conversion into H + ions and urea", "18"),
      ],
    },
    {
      id: "maintenance",
      title: "Daily maintenance need in adults",
      blocks: [
        table(
          ["Adult", "Water", "Sodium", "Potassium", "Dextrose"],
          [["Normal requirement", "25–30 mL/kg/day", "1 mEq/kg/day", "1 mEq/kg/day", "100 gm/day to prevent starvation ketosis"]],
          "Table 2.2 Maintenance requirement of water, sodium, potassium and dextrose"
        ),
        formula(
          "Daily maintenance water",
          "Water per day = 25 to 30 mL × weight",
          [
            { symbol: "weight", meaning: "body weight", unit: "kg" },
            { symbol: "25 to 30 mL", meaning: "normal daily requirement per kilogram", unit: "mL/kg/day" },
          ],
          { note: "Table 2.2, PDF page 17. Alongside the water, 1 mEq/kg/day each of sodium and potassium and 100 gm/day of dextrose to prevent starvation ketosis.", calc: "daily_maintenance" }
        ),
        quote("25–30 mL/kg/day 1 mEq/kg/day 1 mEq/kg/day 100 gm/day to prevent starvation ketosis", "17"),
      ],
    },
    {
      id: "classification",
      title: "Classification by composition and by tonicity",
      blocks: [
        points([
          "By composition: crystalloids (solutions in sterile water with varying electrolytes and dextrose); colloids (water, electrolytes and plasma-derived protein or semi-synthetic starch that stays distributed and does not readily cross semi-permeable membranes; called volume or plasma expanders; albumin, hydroxyethyl starch, gelatine, dextran); whole blood and blood products.",
          "Crystalloids by buffers and electrolytes: dextrose and sodium chloride solutions (5% dextrose, normal saline, dextrose saline, half normal saline, half normal saline with dextrose); balanced crystalloids (Ringer's lactate, Ringer's acetate, PlasmaLyte, Sterofundin); multiple electrolyte solutions (Isolyte-G, -M, -P, -E, -S).",
        ]),
        table(
          ["Characteristic", "Isotonic", "Hypotonic", "Hypertonic"],
          [
            ["Osmolality (mOsm/L)", "270–310", "Less than 270", "Greater than 310"],
            ["Distribution and effect", "Remains within ECF and expands the ECF compartment", "Fluid quickly moves from the intravascular space into the cells", "Pulls water from the cells into the intravascular space"],
            ["Effect on cell size", "No effect", "Swollen", "Shrink"],
            ["Examples (mOsm/L)", "0.9% NaCl 308; Ringer's lactate 273; PlasmaLyte 290", "0.45% NaCl 154; 0.33% NaCl 103", "3% NaCl 1026; D5W + 0.9% NaCl 560"],
          ],
          "Table 2.5 Classification of crystalloid solutions according to osmolality",
          "The table carries the marginal note that normal serum osmolality is 275–295 mOsm/kg. PlasmaLyte is 290 here but 295 in Table 2.1 and the text."
        ),
        points([
          "Isotonic: same electrolyte concentration as plasma. Stays in the ECF, distributed between intravascular and interstitial spaces, so expands the intravascular compartment more effectively than hypotonic fluid; cells neither swell nor shrink. The text also lists Ringer's acetate 276 and Sterofundin 309 mOsm/L.",
          "Hypotonic: lower electrolyte concentration than plasma. Moves quickly from the intravascular space into cells and interstitium and swells cells. 0.45% NaCl, 0.33% NaCl, 5% dextrose, 10% dextrose, D5W + 0.45% NaCl.",
          "Hypertonic: higher than plasma. Draws water from cells into the intravascular space, shrinks cells and increases ECF volume. 3% NaCl and 5% dextrose in 0.9% saline are the most widely used.",
        ]),
        quote("Isotonic fluids have an osmolality of 270–310 mOsm/L.", "19"),
        quote("Hypotonic fluids have an osmolality of less than 270 mOsm/L", "19"),
      ],
    },
    {
      id: "in_vivo_osmolality",
      title: "In the bag versus in the body",
      blocks: [
        table(
          ["Fluid", "In the bag", "After dextrose is metabolised"],
          [
            ["5% dextrose", "252 mOsm/L, near isotonic", "Pure water: hypotonic"],
            ["10% dextrose", "505 mOsm/L", "Pure hypotonic water with zero osmolality"],
            ["D5W + 0.45% NaCl", "406 mOsm/L, hypertonic", "0.45% NaCl only, 154 mOsm/L: hypotonic"],
            ["5% dextrose in 0.9% saline", "560 mOsm/L, hypertonic", "Like normal saline: isotonic, so not used for cerebral oedema"],
          ]
        ),
        points([
          "Choose these fluids on the expected in-vivo osmolality, not the package label.",
          "3% sodium chloride is a mainstay for cerebral oedema: it shrinks brain cells without the risk of hypotension because it expands ECF volume.",
        ]),
        quote("selection should be based on the expected in vivo osmolality rather than what is mentioned on the package label", "20"),
      ],
    },
    {
      id: "cautions",
      title: "Cautions the book stresses",
      blocks: [
        caution([
          "Hypotonic fluid moves quickly into cells and shrinks the vascular bed; it can exacerbate pre-existing hypovolaemia and hypotension and risks cardiovascular collapse.",
          "Hypotonic fluid can cause or exacerbate cerebral oedema: avoid it in patients at risk of raised intracranial pressure (stroke, head injury, neurosurgery).",
        ], "Hypotonic fluids"),
        caution([
          "Hypertonic fluid expands ECF volume and risks volume overload and pulmonary oedema: avoid in cardiac or renal patients with circulatory overload.",
          "Hypertonic fluid shrinks cells: avoid in conditions causing cellular dehydration.",
        ], "Hypertonic fluids"),
        caution([
          "High-sodium fluids with care, for the risk of fluid overload: normal saline and dextrose saline (154 mEq/L, 9 gm of salt per litre) and Ringer's lactate (130 mEq/L, approximately 7 gm of salt per litre).",
          "High-potassium fluids cautiously, for the risk of hyperkalaemia: Isolyte-M, Isolyte-P, Isolyte-G.",
          "Ammonium chloride in Isolyte-G converts to hydrogen ions and urea and can exacerbate uraemic acidosis.",
        ], "Renal failure"),
        quote("avoid it in patients who are at risk for increased intracranial pressure (stroke, head injury, or neurosurgery)", "20"),
        quote("should be avoided in cardiac or renal patients with circulatory overload", "21"),
        quote("Ringer's lactate (130 mEq/L or approximately 7 gm of salt per liter), are administered with care", "18"),
      ],
    },
    {
      id: "drip_rate",
      title: "Drop rate by hand",
      intro: "Most non-ICU wards have no pump. Verify the drop factor printed on the administration set before calculating. Macro drip sets deliver 10, 15 or 20 drops per mL depending on the manufacturer; micro drip sets deliver 60 micro drops per mL.",
      blocks: [
        formula(
          "Macro drops per minute",
          "Volume/hour = total volume ÷ hours; Volume/min = volume/hour ÷ 60; Drops/min = volume/min × drop factor",
          [
            { symbol: "total volume", meaning: "fluid to be delivered", unit: "ml" },
            { symbol: "hours", meaning: "duration of the infusion", unit: "h" },
            { symbol: "drop factor", meaning: "drops per mL of the administration set: 10, 15 or 20 macro; 60 micro", unit: "drops/mL" },
          ],
          {
            example: "600 mL over 5 hours through a 15 drops/mL set: 600 ÷ 5 = 120 ml/hour; 120 ÷ 60 = 2 ml/min; 2 × 15 = 30 macro drops per minute.",
            note: "The three steps are printed on PDF pages 21–22.",
            calc: "drip_rate",
          }
        ),
        steps([
          "Rule of ten: litres to be given in 24 hours × 10 = macro drops per minute. 2.0 L in 24 h gives 20; 3.5 L gives 35; 1 L in 8 h is 3.0 L a day, 30 drops/min; 1 L in 6 h is 4.0 L a day, 40 drops/min.",
          "Rule of four: ml per hour ÷ 4 = macro drops per minute. 60 ml/h gives 15; 200 ml/h gives 50.",
        ], "Short cuts for a 15 drops/mL macro set"),
        points([
          "Micro drip, 60 micro drops per mL: ml per hour equals micro drops per minute. 30 ml/h is 30 micro drops/min; 45 ml/h is 45.",
        ]),
        quote("Macro drops/min = 2 ml × 15 = 30 macro drop rates per min", "22"),
        quote("IV Fluid in Liters/24 hours × 10 = Macro Drop Rate/min", "22"),
        quote("Volume in ml/hour ÷ 4 = Macro drop rate/min", "22"),
        quote("Commercially available micro drip tubing delivers small-sized drops, with typically 1 mL providing 60 micro drops.", "22"),
      ],
    },
    {
      id: "d5w",
      title: "5% dextrose: what the opening of chapter 3 says",
      blocks: [
        table(
          ["Per litre of 5% dextrose (D5W)", "Value"],
          [
            ["Dextrose", "50 gm"],
            ["Osmolality", "252 mOsm/L"],
            ["Caloric value", "170 kcal/L"],
            ["pH", "4.3 (3.2 to 6.5)"],
            ["Each 100 ml", "Hydrous dextrose USP 5 gm"],
          ]
        ),
        points([
          "D5W provides free water with glucose and no electrolytes; it is selected when water is needed but not electrolytes.",
          "Plain water is not given intravenously because it can haemolyse red cells. The dextrose makes the fluid near isotonic (252 mOsm/L) in the bag so it does not haemolyse; once infused the dextrose is consumed rapidly and the water left behind is hypotonic.",
        ]),
        quote("Dextrose 50 gm Osmolality 252 mOsm/L Caloric value 170 kcal/L pH 4.3 (3.2 to 6.5)", "23"),
        quote("D5W is selected when there is a need for water but not electrolytes.", "23"),
      ],
    },
    {
      id: "balanced_opening",
      title: "Balanced crystalloids: what the opening of chapter 4 says",
      blocks: [
        points([
          "Crystalloids whose composition closely resembles ECF are termed balanced or physiological solutions.",
          "They distribute throughout the ECF and expand plasma volume about as well as normal saline.",
          "They contain somewhat less sodium and significantly less chloride than normal saline, which the book counts as an advantage for resuscitation or routine maintenance.",
          "Bicarbonate is unstable in plastic containers, so lactate, acetate, gluconate and malate stand in for it.",
          "Ringer's lactate is the most widely used balanced crystalloid; it is also called Hartmann's solution, sodium lactate solution or lactated Ringer's (LR).",
        ]),
        quote("Ringer's lactate is the most widely used balanced crystalloid.", "26"),
      ],
    },
    {
      id: "not_in_edition",
      title: "Not in this edition",
      blocks: [
        caution([
          "The preview edition stops after the opening page of chapter 3; its sections on 5% dextrose indications, contraindications, precautions and rate of administration, and on normal saline, dextrose saline, half normal saline, half normal saline with dextrose and Table 3.1, are not reproduced here.",
          "The preview edition stops after the first lines of chapter 4; its sections on Ringer's lactate (composition, pharmacological basis, indications, contraindications and precautions), Ringer's solution, Hartmann's solution, the newer balanced crystalloids, Ringer's acetate, PlasmaLyte, Sterofundin, Isolyte-G, Isolyte-M and Isolyte-P are not reproduced here. Their compositions appear only as Table 2.1 above.",
        ]),
      ],
    },
  ],
};
