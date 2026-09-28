import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, table } from "@/content/fluids/_helpers";

/**
 * PARENTERAL ADDITIVES — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of the composition pages of chapters 10–14. The source edition is the free preview:
 * each chapter stops after its composition and pharmacological-basis opening, so this topic
 * carries what is in the ampoule and nothing about how to give it. Every number below is the
 * book's; the quotes give the page it came from.
 */
export const parenteralAdditivesV1: FluidTopic = {
  id: "parenteral_additives",
  version: "1.0.0",
  title: "Parenteral additives: what is in the ampoule",
  group: "fluids",
  summary: "Calcium, hypertonic saline, magnesium, potassium and bicarbonate: strength, mEq per mL and per ampoule, osmolarity — composition only, as the preview edition prints it.",
  setting: "Adult ward, emergency and ICU; any prescriber adding an electrolyte to a bag",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "10 Calcium Gluconate, Calcium Chloride, and Hypertonic Dextrose Solutions (opening only)",
      "11 Hypertonic Saline (opening only)",
      "12 Magnesium Sulfate (opening only)",
      "13 Potassium Chloride and Potassium Phosphate (opening only)",
      "14 Sodium Bicarbonate (opening only)",
    ],
    pages: "73–92",
  },
  sections: [
    {
      id: "master_table",
      title: "Table 10.1: the additives at a glance",
      intro: "The book opens the additive chapters with one table of the commonly used special solutions. It is reproduced as printed, mEq per mL and per ampoule.",
      blocks: [
        table(
          ["Injection", "Content in mEq/mL", "Volume of amp (mL)", "Content in mEq/amp", "g per 10 mL amp"],
          [
            ["Calcium gluconate 10%", "Ca2+ = 0.45", "10", "Ca2+ = 4.5/10 mL", "1.0"],
            ["Calcium chloride 10%", "Ca2+ = 1.36", "10", "Ca2+ = 13.6/10 mL", "1.0"],
            ["Hypertonic (3%) saline", "Na+ = 0.5", "100", "Na+ = 51/100 mL", "3.0"],
            ["Magnesium sulfate 50%", "Mg2+ = 4", "2.0", "Mg2+ = 8/2 mL", "1.0"],
            ["Potassium chloride 15%", "K+ = 2.0", "10", "K+ = 20/10 mL", "1.5"],
            ["Potassium phosphates", "K+ = 4.4; PH4 = 3.0", "15", "K+ = 66/15 mL; PH4 = 45/15 mL", "–"],
            ["7.5% NaHCO3", "HCO3 = 0.9", "10", "HCO3 = 9/10 mL", "0.75"],
            ["8.4% NaHCO3", "HCO3 = 1.0", "20", "HCO3 = 10/10 mL", "0.84"],
          ],
          "Composition of commonly used special solutions (Table 10.1)",
          "Printed as in the book. PH4 is the book's abbreviation for phosphate, and its phosphate figures sit under the mEq heading with no separate unit. In the 8.4% NaHCO3 row the text prints an ampoule volume of 20 mL against a content of 10/10 mL, which is presumably 1 mEq per mL; Table 14.1 lists 8.4% presentations of 1, 10, 25 and 50 mL only."
        ),
        points([
          "The additives the book names as commonly used: calcium chloride, calcium gluconate, dextrose 25% and 50%, hypertonic saline, magnesium sulfate, potassium chloride, potassium phosphate and sodium bicarbonate.",
          "From the printed figures, a 10 mL ampoule of calcium chloride 10% carries about three times the calcium of a 10 mL ampoule of calcium gluconate 10% (13.6 against 4.5 mEq).",
        ]),
        quote("Calcium gluconate 10% Ca2+ = 0.45 10 Ca2+ = 4.5/10 ml 1.0", "73"),
        quote("Calcium chloride 10% Ca2+ = 1.36 10 Ca2+ = 13.6/10 ml 1.0", "73"),
      ],
    },
    {
      id: "calcium",
      title: "Calcium gluconate and calcium chloride",
      intro: "Chapter 10. The preview carries the opening line and the Table 10.1 rows; nothing else of the chapter survives.",
      blocks: [
        points([
          "Two different salt forms, commonly used in various emergency conditions.",
          "Calcium gluconate 10%: 0.45 mEq calcium per mL; a 10 mL ampoule gives 4.5 mEq and contains 1.0 g of the salt.",
          "Calcium chloride 10%: 1.36 mEq calcium per mL; a 10 mL ampoule gives 13.6 mEq and contains 1.0 g of the salt.",
          "Hypertonic dextrose 25% and 50% are named in the opener and the chapter contents; the preview prints no composition for them.",
          "mmol per mL, osmolarity and elemental calcium per gram of salt are not stated in the text present.",
        ]),
        quote("two different salt forms commonly used in various emergency conditions", "74"),
      ],
    },
    {
      id: "hypertonic_saline",
      title: "Hypertonic saline 3% and 5%",
      intro: "Chapter 11. A concentrated form of sodium chloride in water; 3% and 5% are the solutions in common use.",
      blocks: [
        table(
          ["Solution", "Sodium per 100 mL", "Chloride per 100 mL", "Osmolality (as printed)", "NaCl per 100 mL", "Sodium per litre"],
          [
            ["3% hypertonic saline", "51.3 mEq", "51.3 mEq", "1026.0 mOsm/L", "3 g", "513 mEq/L"],
            ["5% hypertonic saline", "85.5 mEq", "85.5 mEq", "1710.0 mOsm/L", "5 g", "855 mEq/L"],
          ],
          "Composition, chapter 11 (page 76)",
          "The chapter heads these values Osmolality while giving them in mOsm/L; the magnesium, potassium and bicarbonate chapters print Osmolarity. Table 10.1 rounds 3% saline to 0.5 mEq/mL and 51 mEq per 100 mL."
        ),
        points([
          "Normal plasma sodium for comparison: 140 mEq/L.",
          "The pharmacological basis the preview keeps: a high sodium concentration can rapidly raise serum sodium and reduce cerebral oedema, so the book recommends it for life-threatening hyponatraemia.",
          "It is chosen to deliver a large amount of sodium in a small volume — the euvolaemic or hypervolaemic hyponatraemic patient who needs salt but fluid restriction.",
        ]),
        quote("Sodium 51.3 mEq Chloride 51.3 mEq Osmolality 1026.0 mOsm/L", "76"),
        quote("513 mEq/L and 855 mEq/L respectively compared to normal plasma concentration of 140 mEq/L", "76"),
      ],
    },
    {
      id: "magnesium_sulfate",
      title: "Magnesium sulfate",
      intro: "Chapter 12. The most common parenterally used magnesium salt; available in several concentrations.",
      blocks: [
        table(
          ["Preparation", "Content as printed"],
          [
            ["50% magnesium sulfate, each mL", "Magnesium sulfate USP 500 mg; 4.06 mEq or 2.03 mmol magnesium ions; osmolarity 4060 mOsm/L"],
            ["50% magnesium sulfate, per ampoule", "1 g in 2 mL and 5 g in 10 mL"],
            ["20% magnesium sulfate", "Magnesium sulfate USP 2 g in 10 mL"],
            ["10% magnesium sulfate", "Magnesium sulfate USP 1 g in 10 mL"],
          ],
          "Composition, chapter 12 (page 81)",
          "Table 10.1 rounds the 50% solution to 4 mEq/mL and 8 mEq per 2 mL ampoule."
        ),
        formula(
          "Magnesium sulfate conversion",
          "1 g MgSO4 = 4 mmol Mg = 8 mEq Mg",
          [
            { symbol: "g MgSO4", meaning: "mass of magnesium sulfate salt", unit: "g" },
            { symbol: "mmol Mg", meaning: "millimoles of magnesium ion", unit: "mmol" },
            { symbol: "mEq Mg", meaning: "milliequivalents of magnesium ion", unit: "mEq" },
          ],
          {
            example: "From the printed presentations: a 2 mL ampoule of 50% (1 g) is 4 mmol or 8 mEq; a 10 mL ampoule of 50% (5 g) is 20 mmol or 40 mEq; 10 mL of 20% (2 g) is 8 mmol or 16 mEq; 10 mL of 10% (1 g) is 4 mmol or 8 mEq.",
            note: "The per-mL figure for 50% (500 mg = 2.03 mmol = 4.06 mEq) is the same relationship before rounding.",
          }
        ),
        points([
          "Magnesium is the second most common intracellular cation and a co-factor in many biochemical reactions; it takes part in nerve transmission, neurochemical transmission, cardiac and muscular excitability and vasomotor tone, and affects the regulation of calcium and potassium.",
          "The chapter's pharmacological-basis section on eclampsia calls the mechanism unclear and probably multi-factorial, through vascular and neurological routes; the text is cut there.",
        ]),
        quote("Magnesium Sulfate 1 gm = 4 mmol mg = 8 mEq mg", "81"),
        quote("Magnesium Sulfate USP 500 mg 4.06 mEq or 2.03 mmol Magnesium ions Osmolarity 4060 mOsm/L", "81"),
      ],
    },
    {
      id: "potassium",
      title: "Potassium chloride and potassium phosphate",
      intro: "Chapter 13. Potassium chloride is the more common salt and is widely used to correct hypokalaemia; potassium phosphate is given less often, mainly to manage or prevent hypophosphataemia.",
      blocks: [
        table(
          ["15% potassium chloride", "Value as printed"],
          [
            ["Potassium, each mL", "2 mEq"],
            ["KCl, each mL", "150 mg"],
            ["Osmolarity", "4024 mOsmol/L (calc)"],
            ["pH", "6.0 (4.0 to 8.0)"],
            ["Ampoule", "10 mL"],
            ["Potassium per 10 mL ampoule", "20.0 mEq"],
            ["KCl per 10 mL ampoule", "1.5 mg"],
          ],
          "Composition, chapter 13 (page 87)",
          "The text prints KCl 1.5 mg per 10 mL ampoule, which is presumably 1.5 g: the same page gives 150 mg per mL, and Table 10.1 gives 1.5 g per 10 mL."
        ),
        table(
          ["Potassium phosphates", "Value as printed in Table 10.1"],
          [
            ["Potassium, each mL", "4.4 mEq"],
            ["Phosphate (PH4), each mL", "3.0"],
            ["Vial", "15 mL"],
            ["Potassium per 15 mL", "66 mEq"],
            ["Phosphate (PH4) per 15 mL", "45"],
          ],
          "Composition, potassium phosphate (page 73)",
          "The only potassium phosphate figures in the preview are the Table 10.1 row. The phosphate numbers carry no separate unit label; pH, osmolarity and the mmol phosphate figure are not in the text present."
        ),
        points([
          "Potassium is chiefly intracellular, at 140 to 150 mEq/L, and is the most abundant intracellular cation. The normal serum range is 3.5–5.0 mEq/L.",
          "The kidneys retain potassium incompletely (unlike sodium), so loss continues on a potassium-free diet and even in hypokalaemia — the book's reason for adding potassium to maintenance fluid.",
          "Where sodium and potassium are both lost (diarrhoea, vomiting, diuretics), aldosterone retains sodium and the kidney loses potassium, causing or aggravating hypokalaemia; potassium is supplemented along with sodium.",
        ]),
        quote("Each ml contains: Potassium 2 mEq KCl 150 mg", "87"),
        quote("Available as 10 ml ampules which provides: Potassium 20.0 mEq", "87"),
      ],
    },
    {
      id: "sodium_bicarbonate",
      title: "Sodium bicarbonate",
      intro: "Chapter 14. An alkalinising agent used to correct metabolic acidosis, manage electrolyte imbalances and in the treatment of severe diarrhoea and poisoning.",
      blocks: [
        table(
          ["Strength, each mL", "Sodium", "Bicarbonate", "NaHCO3", "Osmolarity"],
          [
            ["8.4%", "1 mEq or mmol (23 mg)", "1 mEq or mmol (61 mg)", "84 mg", "2000 mOsmol/L"],
            ["7.5%", "0.89 mEq or mmol", "0.89 mEq or mmol", "75 mg", "1786 mOsmol/L"],
            ["4.2%", "0.5 mEq or mmol", "0.5 mEq or mmol", "42 mg", "1000 mOsmol/L"],
          ],
          "Composition per mL, chapter 14 (page 89)"
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
          "Sodium bicarbonate solutions: different strengths and composition (Table 14.1)",
          "The book prints the osmolality once per strength; it is repeated here on every row so the table stays rectangular. Table 10.1 rounds 7.5% to 0.9 mEq/mL and 9 mEq per 10 mL."
        ),
        formula(
          "Bicarbonate as a buffer",
          "HCO3- + H+ = H2CO3 (carbonic acid)",
          [
            { symbol: "HCO3-", meaning: "bicarbonate anion from the dissociated injection" },
            { symbol: "H+", meaning: "hydrogen ion" },
            { symbol: "H2CO3", meaning: "carbonic acid" },
          ],
          { note: "The book's pharmacological basis: intravenous sodium bicarbonate dissociates to sodium and bicarbonate; the bicarbonate buffers hydrogen ions and so corrects metabolic acidosis, and by raising pH and shifting potassium into cells it corrects hyperkalaemia." }
        ),
        quote("Sodium 1 mEq or mmol Bicarbonate 1 mEq or mmol", "89"),
        quote("correct metabolic acidosis by combining with hydrogen ions (HCO3 + H+ = H2CO3 - carbonic acid)", "90"),
      ],
    },
    {
      id: "not_in_edition",
      title: "Not in this edition",
      intro: "The source is the free preview. Each chapter is cut after its composition page and the remainder is replaced by the reference list. Any dose, rate, dilution or incompatibility rule for these additives must come from the full edition or another reference.",
      blocks: [
        caution([
          "The preview edition stops after the composition page of chapter 10; its sections on indications (hyperkalaemia, hypocalcaemia, hypermagnesaemia, calcium-channel and beta-blocker overdose, citrate toxicity, hydrofluoric acid burns, cardiac resuscitation), dose, dilution, maximum rate, contraindications and incompatibilities for calcium gluconate and calcium chloride, and the whole of hypertonic dextrose, are not reproduced here.",
          "The preview edition stops after the pharmacological-basis opening of chapter 11; its sections on indications (severe symptomatic hyponatraemia, cerebral oedema, plasma volume expansion, heart failure, cystic fibrosis), bolus volume, preparation of 3% saline, rate of sodium correction, monitoring and adverse effects for hypertonic saline are not reproduced here.",
          "The preview edition stops after the pharmacological-basis opening of chapter 12; its sections on indications, loading dose, dilution, maximum rate, monitoring, antidote, contraindications and adverse effects for magnesium sulfate are not reproduced here.",
          "The preview edition stops after the composition page of chapter 13; its sections on indications, dose, dilution, maximum concentration and rate, monitoring, contraindications and cautions for potassium chloride and potassium phosphate are not reproduced here.",
          "The preview edition stops after the pharmacological-basis opening of chapter 14; its sections on indications (metabolic acidosis, hyperkalaemia, cardiac arrest, tricyclic overdose, contrast-induced AKI, urinary alkalinisation), the bicarbonate deficit formula, dose, dilution, rate, incompatibilities, adverse effects and contraindications for sodium bicarbonate are not reproduced here.",
        ], "Absent from the source text"),
      ],
    },
  ],
};
