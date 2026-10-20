import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * CALCIUM AND HYPERTONIC DEXTROSE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 10 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from. Table 10.1, which opens
 * the additive chapters 10–14, is reproduced in full as the first section.
 */
export const calciumAndHypertonicDextroseV1: FluidTopic = {
  id: "calcium_and_hypertonic_dextrose",
  version: "1.0.0",
  title: "Calcium gluconate, calcium chloride and hypertonic dextrose",
  group: "fluids",
  summary: "The special-solutions table, then calcium gluconate and chloride (composition, dilution, maximum rate, eight indications with doses, contraindications) and 25% and 50% dextrose.",
  setting: "Adult ward, emergency and ICU",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: ["10 Calcium Gluconate, Calcium Chloride, and Hypertonic Dextrose Solutions"],
    pages: "115–122",
    pageKind: "book",
  },
  sections: [
    {
      id: "master_table",
      title: "Table 10.1: commonly used special solutions",
      intro: "The book opens the additive chapters (10–14) with one table of the commonly used special solutions, reproduced here as printed.",
      blocks: [
        table(
          ["Injection", "Content in mEq/ml", "Volume of amp (mL)", "Content in mEq/amp", "gm/10 ml amp"],
          [
            ["Calcium gluconate 10%", "Ca2+ = 0.45", "10", "Ca2+ = 4.5/10 ml", "1.0"],
            ["Calcium chloride 10%", "Ca2+ = 1.36", "10", "Ca2+ = 13.6/10 ml", "1.0"],
            ["Hypertonic (3%) saline", "Na+ = 0.5", "100", "Na+ = 51/100 ml", "3.0"],
            ["Magnesium sulfate 50%", "Mg2+ = 4", "2.0", "Mg2+ = 8/2 ml", "1.0"],
            ["Potassium chloride 15%", "K+ = 2.0", "10", "K+ = 20/10 ml", "1.5"],
            ["Potassium phosphates", "K+ = 4.4; PH4 = 3.0", "15", "K+ = 66/15 ml; PH4 = 45/15 ml", "-"],
            ["7.5% NaHCO3", "HCO3 = 0.9", "10", "HCO3 = 9/10 ml", "0.75"],
            ["8.4% NaHCO3", "HCO3 = 1.0", "20", "HCO3 = 10/10 ml", "0.84"],
          ],
          "Table 10.1 Composition of commonly used special solutions",
          "Printed as in the book. PH4 is the book's abbreviation for phosphate. The 8.4% NaHCO3 row prints an ampoule volume of 20 mL against a content of 10/10 ml."
        ),
        points([
          "The special solutions the book names: calcium chloride, calcium gluconate, dextrose 25% and 50%, hypertonic saline, magnesium sulfate, potassium chloride, potassium phosphate and sodium bicarbonate.",
        ]),
        quote("Commonly used special solutions are calcium chloride, calcium gluconate, dextrose 25% and 50%, hypertonic saline", "115"),
      ],
    },
    {
      id: "calcium_composition",
      title: "Calcium gluconate and calcium chloride: composition",
      intro: "Two different salt forms, commonly used in various emergency conditions. Both come as a 10% solution in a 10 mL ampoule containing 1 g of the salt.",
      blocks: [
        table(
          ["Each mL contains", "10% calcium gluconate", "10% calcium chloride"],
          [
            ["Calcium ion (mg)", "9.3", "27.3"],
            ["Calcium ion (mmol)", "0.22", "0.68"],
            ["Calcium ion (mEq)", "0.465", "0.136"],
            ["Osmolarity (mOsm/L)", "680", "2000"],
          ],
          "Composition per mL (page 116)",
          "The book prints 0.136 mEq/mL for calcium chloride; its own Table 10.1 gives 1.36 mEq/mL and Table 10.2 gives 13.6 mEq per 10 mL."
        ),
        table(
          ["Calcium salt", "Elemental Ca per gm (mg)", "mmol", "mEq", "Osmolarity (mOsm/L)"],
          [
            ["10% Calcium gluconate (monohydrate) 10 ml", "93", "2.2", "4.5", "680"],
            ["10% Calcium chloride (dihydrate) 10 ml", "273", "6.8", "13.6", "2000"],
          ],
          "Table 10.2 Composition of injection calcium gluconate and calcium chloride"
        ),
        quote("Each 10 ml or 1 gm of calcium gluconate solution contains 2.2 mmol or 4.5 mEq of elemental calcium.", "116"),
        quote("10 ml or 1 gm of calcium chloride solution contains 6.8 mmol or 13.6 mEq of elemental calcium [1].", "116"),
      ],
    },
    {
      id: "calcium_basis",
      title: "Choosing the salt, dilution and maximum rate",
      blocks: [
        points([
          "Calcium chloride gives three times more elemental calcium: one 10 mL ampoule equals 30 mL (three ampoules) of calcium gluconate. Current literature suggests both have similar onset of action and efficacy.",
          "Calcium chloride is more potent but highly irritant, with a greater risk of tissue necrosis, extravasation and venous thrombophlebitis, and requires a central line.",
          "Calcium gluconate is less irritant and better tolerated through a peripheral IV, so it is preferred in emergencies where a central line is unavailable.",
          "Give both intravenously slowly, preferably diluted with an equal amount of sterile water for injection, 5% dextrose or normal saline.",
          "Maximum recommended rate: 1.5 mL/minute for calcium gluconate, 1.0 mL/minute for calcium chloride.",
        ]),
        caution([
          "Rapid infusion carries the risk of hypotension, bradycardia, cardiac arrhythmias, syncope and cardiac arrest.",
        ]),
        quote("10 ml or one ampule of calcium chloride is equivalent to 30 ml or three ampules of calcium gluconate", "116"),
        quote("preferably after dilution, with an equal amount of sterile water for injection, 5% dextrose, or normal saline.", "116"),
        quote("The maximum rate of administration recommended is 1.5 ml/minute for calcium gluconate and 1.0 ml/minute for calcium chloride.", "116"),
      ],
    },
    {
      id: "hyperkalaemia",
      title: "A. Hyperkalaemia",
      intro: "IV calcium is the first step in the emergency management of hyperkalaemia and is lifesaving when it is severe. It antagonises the depolarising effects of hyperkalaemia and stabilises cardiac cell membranes without lowering serum potassium; the benefit persists in normocalcaemic patients.",
      blocks: [
        points([
          "Give promptly in: severe hyperkalaemia; strongly suspected hyperkalaemia on ECG (absent P waves, prolonged PR interval, wide QRS, sine-wave pattern) without waiting for the laboratory report; cardiac arrest.",
          "Effect starts fastest of all measures (1 to 3 minutes) and lasts about 30 to 60 minutes, protecting the heart until other measures act.",
          "Calcium chloride is preferred if a central venous line is available or the patient is in circulatory shock or cardiac arrest.",
        ], "Indications and effect"),
        steps([
          "One ampoule (10 mL) of 10% calcium gluconate IV slowly over 2 to 3 minutes under continuous ECG monitoring.",
          "Reassess the ECG after 5 minutes.",
          "Repeat the dose if ECG changes persist, worsen or recur after initial improvement; three ampoules are often needed.",
        ], "Dose"),
        caution([
          "Calcium chloride is given slower: 0.5 to 1 mL of solution over 1 minute.",
          "Digitalised patients with severe hyperkalaemia: give IV calcium very cautiously — 10 mL of 10% calcium gluconate diluted in 100 mL of D5W over 20 to 30 minutes rather than 5 minutes — to avoid acute hypercalcaemia and digitalis toxicity.",
        ]),
        quote("One ampule or 10 ml of 10% calcium gluconate is infused IV slowly over 2 to 3 minutes under continuous ECG monitoring [9].", "117"),
        quote("(just in 1 to 3 minutes) and it lasts for about 30 to 60 minutes.", "117"),
        quote("three ampules are often needed to see the improvement in the ECG changes of hyperkalemia", "117"),
        quote("It is very important to reassess ECG after 5 minutes", "117"),
        quote("calcium chloride is slower, i.e., 0.5 to 1 mL of solution over 1 minute.", "117"),
        quote("10 ml of 10% calcium gluconate diluted in 100 ml of D5W and infused over 20 to 30 minutes, rather than 5 minutes", "117"),
      ],
    },
    {
      id: "hypocalcaemia",
      title: "B. Severe, acute, symptomatic hypocalcaemia",
      blocks: [
        steps([
          "Severe acute hypocalcaemia (ionised calcium <0.8 mmol/L) or hypocalcaemic tetany: 10 to 20 mL of calcium gluconate diluted in 50–100 mL of 5% dextrose, IV slowly over 10 to 20 minutes under ECG monitoring. Repeat boluses until acute symptoms recover.",
          "Boluses raise serum calcium only for about 2–3 hours, so follow with a continuous infusion: 100 mL (10 ampoules) of calcium gluconate (22.5 mmol of calcium) in 1,000 mL of 5% dextrose or 0.9% saline, at 50 mL/hour initially.",
          "Monitor ionised calcium every 4 to 6 hours; adjust the dose to keep serum calcium at the lower end of the normal range.",
          "Once symptoms recover and improved calcium levels are stable, taper the infusion gradually over 24–48 hours.",
        ]),
        quote("(ionized calcium <0.8 mmol/L), or hypocalcemic tetany, 10 to 20 ml of calcium gluconate diluted in 50–100 ml of 5% dextrose", "117"),
        quote("is infused intravenously slowly over 10 to 20 minutes under ECG monitoring [12, 13].", "117"),
        quote("adding 100 ml or 10 Amp of calcium gluconate (22.5 mmol of calcium) in 1,000 ml of 5% dextrose or 0.9% saline", "117"),
        quote("is administered at the rate of 50 ml/hour initially [12, 13].", "117"),
        quote("Ionized calcium is monitored every 4 to 6 hours", "117"),
        quote("calcium infusion is gradually tapered over 24–48 hours.", "118"),
      ],
    },
    {
      id: "hypermagnesaemia",
      title: "C. Severe hypermagnesaemia",
      blocks: [
        points([
          "Calcium is the antidote for cardiac and respiratory depression in magnesium overdose: it antagonises magnesium at the neuromuscular junction and reverses arrhythmias, hypotension and respiratory depression.",
          "Initial emergency treatment: 10 to 20 mL of 10% calcium gluconate by slow IV injection; monitor closely and repeat until neuromuscular and cardiac disturbances improve.",
          "Magnesium toxicity is frequently encountered in obstetric patients receiving magnesium sulfate to prevent eclampsia.",
        ]),
        quote("Slow intravenous administration of 10 to 20 mL of 10% calcium gluconate is recommended for the initial emergency treatment.", "118"),
      ],
    },
    {
      id: "ccb_beta_blocker",
      title: "D. Calcium-channel blocker and E. β-blocker overdose",
      blocks: [
        points([
          "CCB overdose: IV calcium is first-line therapy for initial temporary support in symptomatic patients. It raises extracellular calcium, antagonises the CCB competitively and overcomes its cardiovascular toxicity.",
          "Initial dose: IV bolus of 30–60 mL of 10% calcium gluconate or 10–20 mL of 10% calcium chloride, given slowly.",
          "The effect is transient, so an additional bolus or a continuous infusion may follow: 0.6 to 1.2 mL/kg/h of 10% calcium gluconate or 0.2 to 0.4 mL/kg/h of 10% calcium chloride.",
          "Titrate the infusion to haemodynamic response, keeping ionised calcium less than two times the normal.",
          "β-blocker overdose: IV calcium salts have an inotropic effect and reverse hypotension, but do not improve bradycardia.",
        ]),
        quote("IV bolus of 30–60 ml of 10% calcium gluconate or 10–20 ml of 10% calcium chloride to be administered slowly [14].", "118"),
        quote("0.6 to 1.2 mL/kg/h of 10% calcium gluconate or 0.2 to 0.4 mL/kg/h of 10% calcium chloride.", "118"),
        quote("maintaining ionized calcium less than two times the normal [18].", "118"),
      ],
    },
    {
      id: "citrate",
      title: "F. Preventing citrate toxicity",
      intro: "Citrate binds ionised calcium. In citrate-induced hypocalcaemia total calcium is near normal but the ionised fraction is reduced; the risk is substantially greater with major liver dysfunction. IV calcium is used routinely in multiple blood transfusions, plasmapheresis and CRRT.",
      blocks: [
        points([
          "Each unit of stored packed red cells contains about 3 g citrate, metabolised by the liver within 5 minutes in healthy adults. Ionised hypocalcaemia occurs only when transfusion exceeds one unit every five minutes or the patient has liver dysfunction.",
          "If indicated: 10 to 20 mL of 10% calcium gluconate IV via a different vein for each 500 mL of blood transfused.",
          "Abnormal liver function with severe symptomatic hypocalcaemia: 10% calcium chloride is preferable, 2 to 5 mL IV, preferably via central vein access, for each 500 mL of blood transfused.",
        ], "Multiple blood transfusions"),
        points([
          "Hypocalcaemia comes from citrate used as the regional anticoagulant in the apheresis circuit, the citrate content of FFP (approximately 15% of citrate by volume), and calcium-free 5% albumin (binds ionised calcium, and dilutes it when given in large volume).",
          "Prophylactic calcium reduces citrate-induced hypocalcaemic symptoms: 2–3 mL of 10% calcium gluconate (IV slow bolus over 10 minutes or continuous infusion to the return line) with each 100 mL FFP.",
          "With 5% albumin-based return fluid, calcium gluconate as a concurrent continuous infusion at 10 mL/litre to the return line reduces citrate toxicity more effectively than IV bolus or oral calcium.",
        ], "Plasmapheresis"),
        points([
          "Regional citrate anticoagulation (RCA) is recommended for CRRT: longer filter lifespan, less bleeding, less need for transfusion.",
          "Citrate is infused in the arterial limb and chelates ionised calcium; calcium is given post filter into the venous return line to replace effluent losses and keep systemic ionised calcium in the normal range.",
        ], "Citrate anticoagulation in CRRT"),
        quote("the transfusion rate exceeds one unit every five minutes or the patient has liver dysfunction [19].", "118"),
        quote("10 to 20 mL of 10% calcium gluconate is administered intravenously via a different vein for each 500 mL of blood transfused", "118"),
        quote("just 2 to 5 mL is administered intravenously, preferably via central vein access, for each 500 mL of blood transfused [20].", "118"),
        quote("Administration of 2–3 mL of 10% calcium gluconate (IV slow bolus over 10 minutes/continuous infusion to the return line)", "119"),
        quote("with each 100 mL FFP can prevent citrate toxicity [24].", "119"),
        quote("(at the rate of 10 ml/liter to the return line)", "119"),
      ],
    },
    {
      id: "hf_and_arrest",
      title: "G. Hydrofluoric acid burns and H. cardiac resuscitation",
      blocks: [
        points([
          "HF burns: standard practice is calcium gluconate local gel and, if pain persists, intradermal 5% calcium gluconate into and around the affected areas.",
          "Cardiac arrest: IV calcium may help selected patients with hyperkalaemia, hypocalcaemia or calcium channel blocker overdose, but is not routinely recommended because raised serum calcium can harm the heart and vascular smooth muscle.",
          "Usual adult bolus in these settings: 10 mL of 10% calcium gluconate or 5–10 mL of 10% calcium chloride.",
        ]),
        quote("intradermal 5% calcium gluconate into and around the affected areas [38].", "119"),
        quote("The usual adult bolus dose in these settings is 10 mL of 10% calcium gluconate or 5–10 mL of 10% calcium chloride.", "120"),
      ],
    },
    {
      id: "calcium_contraindications",
      title: "Calcium: contraindications and precautions",
      blocks: [
        caution([
          "Avoid intramuscular or subcutaneous calcium: it causes tissue necrosis and sloughing.",
          "Hypercalcaemia potentiates digitalis toxicity: avoid calcium or use it cautiously in patients taking digitalis.",
          "IV calcium is contraindicated in hypercalcaemia and ventricular fibrillation.",
          "Do not co-administer calcium with bicarbonate-containing solutions (calcium carbonate precipitates).",
          "Do not mix calcium-containing solutions with ceftriaxone (particulate formation).",
        ]),
      ],
    },
    {
      id: "dextrose_composition",
      title: "Hypertonic dextrose 25% and 50%: composition and basis",
      blocks: [
        table(
          ["Each 100 mL contains", "25% dextrose", "50% dextrose"],
          [
            ["Dextrose", "25 gm", "50 gm"],
            ["Osmolality", "1262 mOsm/L", "2525 mOsm/L"],
            ["Caloric value", "850 kcal/L", "1700 kcal/L"],
          ],
          "Composition (page 120)",
          "Dextrose delivers 3.4 kcal/gm."
        ),
        points([
          "Dextrose supplies calories, spares protein and prevents catabolism.",
          "As a concentrated form it is useful when faster replacement of dextrose is needed, as in hypoglycaemic coma.",
          "Where fluid must be restricted (congestive heart failure, volume overload, cirrhosis, oliguric renal failure) it gives a rich source of calories in a minimal volume.",
        ]),
        quote("Osmolality 1262 mOsm/L", "120"),
        quote("Osmolality 2525 mOsm/L", "120"),
        quote("Dextrose delivers 3.4 kcal/gm", "120"),
      ],
    },
    {
      id: "dextrose_indications",
      title: "Hypertonic dextrose: indications and contraindications",
      blocks: [
        points([
          "Hypoglycaemia: rapid correction of insulin-induced hypoglycaemia or hypoglycaemic coma — usually 100 mL of 25% dextrose, repeated if needed.",
          "Nutrition: 25% and 50% dextrose for calories and fluid on maintenance fluid therapy, or mixed with amino acid solution as part of parenteral nutrition.",
          "Hyperkalaemia: 25% dextrose is co-administered with regular insulin to prevent hypoglycaemia.",
        ], "Indications"),
        caution([
          "Delirium tremens with dehydration, intracranial haemorrhage, and severe dehydration.",
          "Avoid in a diabetic patient unless there is severe hypoglycaemia.",
        ], "Contraindications"),
        quote("Usually100 mL of 25% dextrose is infused, and the dose is repeated if needed.", "120"),
      ],
    },
    {
      id: "dextrose_adverse",
      title: "Hypertonic dextrose: adverse effects and cautions",
      blocks: [
        caution([
          "Rapid infusion can cause hyperglycaemia, glycosuria, diuresis and dehydration: unless the patient is hypoglycaemic, infuse slowly and monitor serum glucose closely.",
          "Malnourished and chronic alcoholic patients: supplement thiamine at the same time to prevent Wernicke encephalopathy.",
          "Taper concentrated dextrose gradually: abrupt withdrawal may cause rebound hypoglycaemia.",
          "May cause local pain, vein irritation and thrombophlebitis.",
        ]),
      ],
    },
  ],
};
