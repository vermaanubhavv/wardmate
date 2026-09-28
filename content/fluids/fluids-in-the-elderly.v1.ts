import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * FLUID THERAPY IN THE ELDERLY — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 9. The source edition prints the whole chapter (PDF 69–72, text and
 * references); it is short, and what it does not cover is listed in the last section. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const fluidsInTheElderlyV1: FluidTopic = {
  id: "fluids_in_the_elderly",
  version: "1.0.0",
  title: "Fluid therapy in the elderly",
  group: "settings",
  summary: "Why older adults dehydrate on smaller losses, how the book diagnoses it when the usual signs fail, and how much less it prescribes.",
  setting: "Adult medical and surgical wards, older patients",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["9 Fluid Therapy in the Elderly"], pages: "69–72" },
  sections: [
    {
      id: "physiology",
      title: "What changes with age",
      blocks: [
        points([
          "Total body water falls by about 10–15% because lean body mass is lost.",
          "Thirst perception is reduced: the central control of thirst is impaired.",
          "Renal blood flow, glomerular filtration rate and renal mass decline progressively.",
          "The kidney concentrates urine and conserves water less well, so older adults are prone to dehydration.",
          "Atrial natriuretic peptide activity rises and renin and aldosterone fall; sodium is retained less well, so hyponatraemia and hypovolaemia are more likely.",
        ]),
        quote("Decrease in total body water by about 10–15% due to reduced lean body mass.", "69"),
      ],
    },
    {
      id: "why_it_matters",
      title: "Why dehydration matters here",
      blocks: [
        points([
          "Hypovolaemia affects about 20% to 30% of older adults; dehydration is the most common cause of hospitalisation in the elderly.",
          "It lengthens hospital stay and raises costs, morbidity and mortality.",
          "It causes acute confusion, constipation, urinary tract infection, kidney stones, exhaustion and pressure ulcers; orthostatic hypotension impairs brain perfusion and leads to dizziness, falls and fractures.",
          "Timely aggressive fluid administration improves outcomes.",
        ]),
        points([
          "A smaller body-water fraction, so a smaller loss is already a deficit.",
          "Inability to reach water: physical limitation, no help.",
          "Reduced thirst and altered awareness or mental status.",
          "Declining renal concentrating ability.",
          "The habit of drinking less than younger people; intake below the recommended requirement.",
          "Common medications, such as diuretics for hypertension.",
        ], "Why the risk is higher"),
        quote("which affects about 20% to 30% of older adults", "69"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosing dehydration",
      intro: "The usual bedside signs are unreliable in older adults; the book replaces them with a seven-item clue set and one laboratory test.",
      blocks: [
        table(
          ["Not useful in the elderly", "Useful clue (4 or more of 7 = volume depletion)"],
          [
            ["Skin turgor", "Mental confusion"],
            ["Mouth dryness", "Non-fluent speech"],
            ["Weight change", "Extremity weakness"],
            ["Urine colour", "Dry mucous membranes"],
            ["Specific gravity", "Dry tongue"],
            ["Bioelectrical impedance", "Furrowed tongue"],
            ["—", "Sunken eyes"],
          ]
        ),
        points(["Directly measured serum osmolality above 300 mOsm/kg is a reliable test for dehydration in the elderly."], "Laboratory"),
        quote("the presence of ≥4 criteria out of 7 indicates volume depletion", "70"),
        quote("Directly measured serum osmolality >300 mOsm/kg is a reliable test to diagnose dehydration in the elderly", "70"),
      ],
    },
    {
      id: "requirement",
      title: "How much they need",
      blocks: [
        table(
          ["Figure", "Value", "Source named in the text"],
          [
            ["Total fluid intake, men, all ages", "2.5 L/day", "ESPEN 2022, EFSA 2010"],
            ["Total fluid intake, women, all ages", "2.0 L/day", "ESPEN 2022, EFSA 2010"],
            ["Share from drinks and beverages", "70–80%", "—"],
            ["Share from food", "20%", "—"],
            ["Minimum intake, elderly male", "2.0 L/day", "ESPEN, EFSA"],
            ["Minimum intake, elderly female", "1.6 L/day", "ESPEN, EFSA"],
            ["IV maintenance, elderly", "20–25 mL/kg/day", "NICE"],
            ["IV maintenance, adult", "25–30 mL/kg/day", "NICE"],
            ["Total body water, elderly", "45–50% of body weight", "—"],
            ["Total body water, adult", "50–60% of body weight", "—"],
          ],
          "Intake targets and maintenance figures"
        ),
        formula(
          "Daily maintenance water (NICE)",
          "Maintenance (mL/day) = weight (kg) × 25–30 mL/kg/day",
          [{ symbol: "weight", meaning: "Body weight", unit: "kg" }],
          {
            example: "60 kg: 1,500–1,800 mL/day at the adult 25–30 mL/kg/day; 1,200–1,500 mL/day at the elderly 20–25 mL/kg/day.",
            note: "The book gives the elderly figure as 20–25 mL/kg/day, lower than the adult 25–30 the calculator uses. Low body weight and a smaller body-water fraction (45–50% against 50–60%) are why the total volume is prescribed carefully.",
            calc: "daily_maintenance",
          }
        ),
        quote("a minimum of 2.0 L/day for elderly males, and 1.6 L/day for elderly females", "70"),
        quote("about 20–25 mL/kg/day in the elderly, while intravenous (IV) fluid requirement in an adult person is approximately 25–30 mL/kg/day", "71"),
        quote("about 45–50% of body weight in the elderly compared to 50–60% of body weight in adults", "71"),
      ],
    },
    {
      id: "prevention",
      title: "Prevention",
      blocks: [
        steps([
          "Ensure access to oral fluids; offer drinks frequently; encourage intake according to the person's preferences through the day.",
          "Screen every hospitalised older adult for dehydration, for early detection and prevention, and treat if required.",
          "Assess urine output and fluid balance frequently during the stay.",
          "If diuretics are prescribed, adjust the dose appropriately.",
        ]),
      ],
    },
    {
      id: "management",
      title: "Management in the text",
      blocks: [
        points([
          "Give fluids orally or by nasogastric tube where possible, both for maintenance and to correct depletion.",
          "A euvolaemic patient kept nil by mouth may need intravenous maintenance; the requirement is lower than in a younger adult (see above).",
          "Hypovolaemic older adults who cannot drink are given isotonic fluid intravenously, chosen by the fluid lost, its composition, and the electrolyte and acid–base state.",
        ], "Principles"),
        table(
          ["Situation", "Fluid the book prefers"],
          [
            ["Hypovolaemia and hypotension (resuscitation)", "Ringer's lactate or normal saline"],
            ["Hypovolaemia with hypernatraemia from water loss or poor intake", "Hypotonic fluid supplementation"],
            ["Diarrhoea or metabolic acidosis", "Balanced crystalloid such as Ringer's lactate"],
            ["Vomiting, hypovolaemic hyponatraemia, metabolic alkalosis", "Normal saline"],
          ],
          "Choice of IV fluid"
        ),
        caution([
          "Cardiac or renal impairment is common in these patients: do not prescribe large volumes without first assessing fluid status.",
          "The volume given is set by clinical assessment, an accurate daily body weight, a strict intake–output chart, serum electrolytes, renal function and serum osmolarity. Improving blood pressure and urine output usually mean the fluid is working.",
        ]),
        quote("avoid prescribing large volumes without assessing the patient’s fluid status", "71"),
      ],
    },
    {
      id: "not_in_edition",
      title: "What this chapter does not give",
      blocks: [
        caution([
          "The chapter is printed in full in this edition (PDF 69–72) and is brief. It gives no dehydration grading (mild, moderate, severe or a percentage deficit), no rate for correcting a deficit, no bolus volume for the elderly, and no dosing figures for heart failure or chronic kidney disease beyond the caution above. The hyponatraemia risk is explained by mechanism only, without a numeric threshold.",
        ]),
      ],
    },
  ],
};
