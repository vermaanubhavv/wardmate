import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * SODIUM BICARBONATE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 14 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const sodiumBicarbonateV1: FluidTopic = {
  id: "sodium_bicarbonate",
  version: "1.0.0",
  title: "Sodium bicarbonate: indications, dosing and precautions",
  group: "fluids",
  summary: "8.4%, 7.5% and 4.2% bicarbonate: composition, when the book uses it (acidosis, hyperkalaemia, cardiac arrest, TCA overdose, contrast AKI, urinary alkalinisation), the doses it prints, adverse effects and how to make an isotonic infusion.",
  setting: "Adult ward, emergency and ICU",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["14 Sodium Bicarbonate"], pages: "151–160", pageKind: "book" },
  sections: [
    {
      id: "composition",
      title: "Composition",
      intro: "An alkalinising agent used to correct metabolic acidosis, manage electrolyte imbalances, and in severe diarrhoea and poisoning.",
      blocks: [
        table(
          ["Strength, each mL", "Sodium", "Bicarbonate", "NaHCO3", "Osmolarity"],
          [
            ["8.4%", "1 mEq or mmol (23 mg)", "1 mEq or mmol (61 mg)", "84 mg", "2000 mOsmol/L"],
            ["7.5%", "0.89 mEq or mmol", "0.89 mEq or mmol", "75 mg", "1786 mOsmol/L"],
            ["4.2%", "0.5 mEq or mmol", "0.5 mEq or mmol", "42 mg", "1000 mOsmol/L"],
          ],
          "Composition per mL (p151)"
        ),
        table(
          ["Strength", "Volume (mL)", "Sodium (mEq)", "Bicarbonate (mEq)", "Osmolality"],
          [
            ["4.2% NaHCO3", "1.0", "0.5", "0.5", "1000 mOsm/L"],
            ["4.2% NaHCO3", "500", "250", "250", "1000 mOsm/L"],
            ["7.5% NaHCO3", "1.0", "0.89", "0.89", "1786 mOsm/L"],
            ["7.5% NaHCO3", "10", "8.9", "8.9", "1786 mOsm/L"],
            ["7.5% NaHCO3", "25", "22.5", "22.5", "1786 mOsm/L"],
            ["7.5% NaHCO3", "50", "44.5", "44.5", "1786 mOsm/L"],
            ["8.4% NaHCO3", "1.0", "1.0", "1.0", "2000 mOsm/L"],
            ["8.4% NaHCO3", "10", "10", "10", "2000 mOsm/L"],
            ["8.4% NaHCO3", "25", "25", "25", "2000 mOsm/L"],
            ["8.4% NaHCO3", "50", "50", "50", "2000 mOsm/L"],
          ],
          "Table 14.1 Sodium bicarbonate solutions: different strengths and composition",
          "The book prints the strength across its volume columns, with the osmolality once per strength; both are repeated on every row here so the table stays rectangular."
        ),
        quote("Sodium 1 mEq or mmol", "151"),
        quote("Osmolarity 1786 mOsmol/L", "151"),
      ],
    },
    {
      id: "pharmacology",
      title: "Pharmacological basis",
      blocks: [
        formula(
          "Bicarbonate as a buffer",
          "HCO3- + H+ = H2CO3 (carbonic acid)",
          [
            { symbol: "HCO3-", meaning: "bicarbonate anion from the dissociated injection" },
            { symbol: "H+", meaning: "hydrogen ion" },
            { symbol: "H2CO3", meaning: "carbonic acid" },
          ]
        ),
        points([
          "IV sodium bicarbonate dissociates to sodium and bicarbonate; bicarbonate buffers hydrogen ions and corrects metabolic acidosis.",
          "By raising pH and shifting potassium into cells, it corrects hyperkalaemia.",
          "With normal renal function bicarbonate is excreted readily; a higher plasma bicarbonate raises urinary bicarbonate loss and urinary pH.",
          "The alkalinising effect makes it useful in salicylate toxicity, phenobarbitone toxicity, tumour lysis syndrome and rhabdomyolysis.",
        ]),
        quote("correct metabolic acidosis by combining with hydrogen ions (HCO3 + H+ = H2CO3- carbonic acid)", "152"),
      ],
    },
    {
      id: "metabolic_acidosis",
      title: "Indication: metabolic acidosis",
      intro: "Used routinely in practice, but its role in acute metabolic acidosis is controversial; the book says to use it selectively, not routinely.",
      blocks: [
        table(
          ["Situation", "What the book says"],
          [
            ["Normal anion gap (hyperchloraemic) acidosis", "Indicated with pH <7.2 or serum HCO3 below 16–18 mEq/L. Replacing lost bicarbonate is beneficial and hastens recovery"],
            ["Lactic acidosis", "Controversial; generally only in life-threatening severe acidosis (pH <7.1), aiming at partial correction, not routine. The 2021 Surviving Sepsis Campaign Guidelines discourage it to improve haemodynamics or reduce vasopressors in septic shock with hypoperfusion-induced lactic acidaemia"],
            ["Lactic acidosis with severe AKI", "Recommended even with less severe acidosis (pH ≤7.2); reduces 28-day mortality and the need for dialysis in this subgroup"],
            ["Diabetic ketoacidosis", "Controversial and rarely indicated; very selectively with arterial pH less than 6.9 (American Diabetes Association). Recent literature discourages it"],
          ],
          "Common indications in metabolic acidosis (pp152–153)"
        ),
        points([
          "Possible harm in lactic acidosis: hypernatraemia, ECF volume expansion, increased lactate production, raised PaCO2 with paradoxical intracellular acidosis, CNS acidosis, hypokalaemia, hypocalcaemia, and overshoot or rebound alkalosis.",
          "Avoiding bicarbonate is described as prudent in mild to moderate acidosis.",
          "There is insufficient evidence of benefit in metabolic lactic acidosis.",
        ], "Why not routinely in lactic acidosis"),
        quote("metabolic acidosis having pH <7.2 [1] or serum HCO3 below 16–18 mEq/L", "152"),
        quote("generally used only in life-threatening severe metabolic acidosis (pH<7.1)", "152"),
        quote("even with less severe metabolic acidosis (pH≤7.2), bicarbonate therapy is recommended in patients with severe acute kidney injury", "153"),
        quote("extremely severe acidosis with arterial pH less than 6.9", "153"),
      ],
    },
    {
      id: "hyperkalaemia",
      title: "Indication: hyperkalaemia",
      blocks: [
        points([
          "Not recommended routinely, as first-line therapy, or as a single agent for acute hyperkalaemia.",
          "Recommended selectively in severe hyperkalaemia (serum potassium >6 mEq/L) with metabolic acidosis (pH <7.35, bicarbonate <17 mEq/L), intact renal function, and volume depletion or normal volume.",
          "Ineffective without significant metabolic acidosis, and in advanced CKD or stable haemodialysis patients.",
          "Give as an isotonic infusion rather than a bolus: for example 150 mEq in 1 L of 5% dextrose IV slowly over two to four hours.",
          "Assess volume status and sodium first: every 100 mL of 7.5% and 8.4% carries approximately 90 and 100 mEq of sodium respectively.",
          "Isotonic infusion suits patients who can tolerate or need sodium fluid loading (contracted intravascular volume), not those at risk of volume overload (heart failure, CKD).",
          "A 7.5% or 8.4% bolus has a neutral effect on potassium: the rise in pH shifts potassium into cells, while hypertonicity pulls water and potassium out of cells.",
        ]),
        quote("severely hyperkalemic patients (serum potassium >6 mEq/L) having metabolic acidosis (pH<7.35, bicarbonate levels <17 mEq/L)", "153"),
        quote("150 mEq in 1 L of 5% dextrose IV slowly over two to four hours", "153"),
        quote("contains approximately 90 mEq and 100 mEq of sodium, respectively", "153"),
      ],
    },
    {
      id: "cardiac_arrest",
      title: "Indication: cardiac arrest",
      blocks: [
        points([
          "Not recommended routinely in resuscitation: no evidence of benefit and potentially detrimental.",
          "May be reserved for arrest with hyperkalaemia, tricyclic antidepressant toxicity, pre-existing severe metabolic acidosis (pH <7.1), or prolonged (>10–20 min) arrest.",
          "Initial dose 1 mEq/kg, repeated according to arterial blood gas measurements.",
          "Give only after cardiac compression, intubation and adequate ventilation.",
        ]),
        quote("metabolic acidosis (pH <7.1), or patients with prolonged (>10–20 min) cardiac arrest", "154"),
        quote("The recommended initial dose of bicarbonate is 1 mEq/kg, with repeat administration based on arterial blood gas measurements.", "154"),
      ],
    },
    {
      id: "tca_overdose",
      title: "Indication: tricyclic antidepressant overdose",
      intro: "An effective antidote and the cornerstone of treatment.",
      blocks: [
        points([
          "Treat when there is haemodynamic instability, seizures, QRS prolongation (>100 msec) or ventricular arrhythmia.",
          "Mechanisms: a higher pH increases protein binding of the TCA, lowering active free drug; the sodium load counteracts TCA blockade of fast sodium channels, which causes the QRS prolongation.",
        ]),
        steps([
          "Bolus 1–2 mEq/kg bicarbonate.",
          "Then an IV infusion of 100–150 mEq sodium bicarbonate in 1000 mL of D5W.",
          "Adjust the dose to improvement in hypotension and narrowing of the widened QRS on ECG; monitor pH, serum sodium, potassium and bicarbonate.",
          "Goals: QRS <100 ms, serum pH 7.5–7.55, serum sodium 150–155 mEq/L.",
        ], "Dosing as printed"),
        quote("QRS prolongation (>100 msec), or ventricular arrhythmia", "154"),
        quote("Initially, 1–2 mEq/kg bicarbonate is administered as a bolus", "154"),
        quote("100–150 mEq sodium bicarbonate in 1000 ml of D5W", "154"),
        quote("maintain the serum pH between 7.5 and 7.55 and serum sodium 150–155 mEq/L", "154"),
      ],
    },
    {
      id: "contrast_aki",
      title: "Prevention of contrast-induced AKI",
      blocks: [
        points([
          "Volume expansion with bicarbonate was recommended by the 2012 KDIGO guideline and several studies.",
          "Regimen printed: 154 mL of 8.4% NaHCO3 in 1000 mL of 5% dextrose, 3 mL/kg/h for 1 hour before the procedure and 1 mL/kg/h for 6 hours after.",
          "The PRESERVE trial (2018) and later literature found bicarbonate no better than saline; both are accepted for volume expansion in high-risk patients.",
          "Normal saline is preferred: bicarbonate needs pharmacist compounding, costs more and adds no benefit.",
        ]),
        quote("154 mL of 8.4% NaHCO3 in 1000 mL of 5% dextrose is administered at a rate of 3 mL/kg/h for 1 hour", "154"),
        quote("1 mL/kg/h for 6 hours after the procedure", "154"),
      ],
    },
    {
      id: "urinary_alkalinisation",
      title: "Urinary alkalinisation",
      intro: "IV bicarbonate to make the urine alkaline (pH ≥7.5) increases elimination of some drugs and toxins. The term replaces forced alkaline diuresis: urine pH matters, not diuresis.",
      blocks: [
        points([
          "Barbiturates: used, but not first-line because of low efficiency; effective only for long-acting barbiturates such as phenobarbital.",
        ], "Barbiturate poisoning"),
        points([
          "Mainstay and first-line therapy. Alkaline urine increases renal salicylate excretion; alkalinising the plasma reduces lipid-soluble salicylate entering the CNS.",
          "Indicated in all symptomatic patients and with salicylate level >40 mg/dL (>2.9 mM); may help even with respiratory alkalosis (pH up to 7.55).",
        ], "Salicylate poisoning"),
        steps([
          "Initial bolus 1 mEq/kg of 8.4% sodium bicarbonate (1 mEq/mL).",
          "Then 2 to 3 mL/kg per hour of isotonic bicarbonate: 150 mL of 7.5% or 8.4% added to 1 litre of D5W.",
          "Titrate to serum pH 7.5–7.55 and urine pH ≥7.5.",
          "Add 40 mEq KCl per litre of infusion to keep serum potassium around 4.0–4.5 mEq/L, after ensuring adequate urine output and normal kidney function.",
          "Stop when salicylate falls below toxic levels (<40 mg/dL or <2.9 mM) and the patient is asymptomatic with a normal respiratory rate.",
        ], "Salicylate: administration as printed"),
        quote("salicylate level >40 mg/dL (>2.9 mM)", "155"),
        quote("An initial bolus of 1 mEq/kg of hypertonic sodium bicarbonate", "155"),
        quote("2 to 3 mL/kg per hour continuous infusion of isotonic bicarbonate solution (150 ml of 7.5% or 8.4% sodium bicarbonate", "155"),
        quote("adding 40 mEq of potassium chloride (KCl)/L of IV infusion", "155"),
        quote("maintain a serum pH of 7.5–7.55 and urine pH of ≥7.5", "155"),
        caution([
          "Tumour lysis syndrome: urinary alkalinisation is currently NOT recommended for prevention or treatment. It lowers calcium-phosphate solubility and promotes calcium phosphate precipitation in the renal tubules, heart and other organs; with rasburicase it carries a risk of heavy calcium phosphate precipitation; in animal studies normal saline was as effective at minimising uric acid precipitation.",
          "If alkalinisation is needed in tumour lysis, start it when hyperuricaemia develops and stop it when hyperphosphataemia develops.",
        ], "Tumour lysis syndrome"),
        points([
          "Isotonic bicarbonate infusion to prevent AKI when CPK is above 5000 units/L with severe muscle injury (e.g. crush injury).",
          "Rationale: prevents haem-protein precipitation, reducing direct pigment injury, myoglobin cast formation and uric acid crystallisation.",
          "Clinical evidence of benefit over standard saline is lacking, so it is not recommended as a single standard measure; it may help if diuresis follows volume repletion with metabolic acidosis or hyperkalaemia.",
        ], "Rhabdomyolysis"),
        caution([
          "Rhabdomyolysis: avoid bicarbonate infusion with hypocalcaemia or serum bicarbonate >30 mEq/L.",
        ]),
        quote("creatine phosphokinase (CPK) level is above 5000 units/L", "156"),
        quote("Avoid bicarbonate infusion in the presence of hypocalcemia and serum bicarbonate >30 mEq/L.", "156"),
      ],
    },
    {
      id: "adverse_effects",
      title: "Adverse effects and contraindications",
      blocks: [
        caution([
          "Metabolic alkalosis: may worsen alkalosis after chloride loss from vomiting or GI suction, or diuretic-induced hypochloraemic alkalosis.",
          "Hypernatraemia: 89 and 100 mEq/dL of sodium in 7.5% and 8.4%; prolonged therapy or large volumes can cause or worsen it.",
          "Oedematous or sodium-retaining states (heart failure, cirrhosis, renal impairment with anasarca, oliguria or anuria): use cautiously to avoid volume overload.",
          "Hypocalcaemia: risk of alkalosis-induced tetany.",
          "Respiratory acidosis: bicarbonate metabolism produces CO2, so hypercapnia can worsen with hypoventilation.",
          "Hypokalaemia: alkalosis shifts potassium into cells and can worsen it.",
          "Extravasation: hypertonic solutions risk vascular irritation, ulceration and sloughing.",
        ]),
        quote("(89 and 100 mEq/dL in 7.5% and 8.4% of NaHCO3, respectively)", "156"),
      ],
    },
    {
      id: "administration",
      title: "Administration",
      blocks: [
        caution([
          "Before giving bicarbonate, exclude volume overload, hypocalcaemia, hypokalaemia, alkalosis and respiratory acidosis, and ensure adequate ventilation and perfusion.",
          "Use a large IV line to minimise venous irritation.",
          "Avoid an IV bolus except in an emergency.",
          "Never treat just the acidosis; treat its cause at the same time.",
          "Avoid if ventilation is inadequate: risk of hypercapnia.",
          "Correct hypokalaemia before correcting acidosis: the intracellular potassium shift can cause life-threatening hypokalaemia.",
          "Give with caution in circulatory overload.",
          "Do not mix calcium with bicarbonate (precipitation), or bicarbonate with inotropes.",
          "Do not add 8.4% bicarbonate to normal saline to make an infusion: the result is hypertonic.",
        ], "Precautions"),
        table(
          ["Preparation", "Result as printed"],
          [
            ["150 mL of 8.4% (150 mEq) in 1 L of D5W", "1.26% solution; 552 mOsmol/L in the bag, isotonic (300 mOsmol/L) once infused as dextrose is consumed; 150 mEq sodium per litre"],
            ["150 mL of 8.4% in 1 L of normal saline", "608 mOsmol/L: hypertonic, do not use"],
          ],
          "Making an isotonic bicarbonate infusion (p157)"
        ),
        points([
          "Isotonic bicarbonate does not cause hypernatraemia, but raising bicarbonate needs a large volume of fluid.",
          "In severe hypovolaemia with metabolic acidosis it provides both volume and bicarbonate and can run at rates similar to other crystalloids.",
        ]),
        quote("it becomes a 1.26% sodium bicarbonate solution. In the bag, it is hypertonic (552 mOsmol/L)", "157"),
        quote("the osmolarity of the resulting solution will be 608 mOsmol/L", "157"),
      ],
    },
  ],
};
