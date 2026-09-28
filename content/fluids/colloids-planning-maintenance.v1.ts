import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, table } from "@/content/fluids/_helpers";

/**
 * COLLOIDS, PLANNING AND MAINTENANCE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of the opening pages of chapters 5–7. The source edition is the free preview: each
 * chapter stops after its introduction, so this topic carries the principles the book states
 * there and none of the tables, formulas or regimens the full chapters hold. Every line below
 * is the book's; the quotes give the page it came from.
 */
export const colloidsPlanningMaintenanceV1: FluidTopic = {
  id: "colloids_planning_maintenance",
  version: "1.0.0",
  title: "Colloids, planning a prescription and maintenance fluids: principles in this edition",
  group: "fluids",
  summary: "What a colloid is and what it does not replace; the four rights of a fluid prescription; who needs maintenance fluid and what it is for — the preview edition's opening pages only.",
  setting: "Adult ward, emergency, ICU and surgical units; anyone writing a fluid prescription",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "5 Colloid Solutions (opening only)",
      "6 Principles, Planning, and Prescribing Fluid Therapy (opening only)",
      "7 Maintenance Fluid Therapy (opening only)",
    ],
    pages: "30–41",
  },
  sections: [
    {
      id: "colloids",
      title: "Colloid solutions",
      intro: "Chapter 5. Volume expanders used for fluid resuscitation in hypovolaemic patients.",
      blocks: [
        points([
          "Definition: electrolyte solutions fortified with large-molecular-weight molecules that do not pass through semipermeable membranes and so are retained within the vascular system.",
          "The theoretical advantage over crystalloids: intravascular distribution, drawing fluid from extravascular spaces by higher oncotic pressure, and a prolonged effect — so a more effective plasma volume expander that improves blood pressure more rapidly.",
          "The book's quantitative claim: compared with crystalloids, colloids are three times more effective in expanding blood volume and increasing cardiac output.",
          "In haemorrhagic shock, when plasma or blood is not immediately available, colloid infusion to correct circulating volume is vital and often life-saving.",
          "Potency as a plasma volume expander differs between commercial colloids (Table 5.1, not printed in the preview).",
          "Colloids versus crystalloids is a long-standing debate; colloids were the attractive and preferred choice for resuscitation about a decade ago. The benefits claimed for them: greater, more rapid and more prolonged volume expansion with a smaller volume, less salt and water overload and oedema, and speedier haemodynamic goals with less organ damage and organ failure.",
        ]),
        caution([
          "A colloid given for haemorrhagic shock does not replace blood: the book says a blood transfusion is subsequently required to maintain the capacity to carry oxygen.",
          "The three-times claim is the book's introductory statement, cited to one reference; the chapter's own advantages-and-disadvantages table (Table 5.2) and its albumin, starch, gelatin and dextran sections are not in the preview, so the claim stands here without the book's qualifications.",
        ]),
        quote("colloids are three times more effective in expanding blood volume and increasing cardiac output", "30"),
        quote("a blood transfusion is subsequently required to maintain the adequate capacity to carry oxygen", "30"),
      ],
    },
    {
      id: "planning_prescribing",
      title: "Principles of planning and prescribing",
      intro: "Chapter 6. Fluid administration is commonly needed in hospitalised patients, especially in the emergency department, ICU and surgical units. The chapter opens by asking why it must be planned meticulously.",
      blocks: [
        points([
          "Fluid is the essential and most commonly required intravenous treatment in acutely ill hospitalised patients; timely, appropriate, properly designed fluid administration is lifesaving.",
          "Prescription plans vary markedly across the dynamic phases of an illness, so they need frequent attention, evaluation and change.",
          "Prescribing intravenous fluid is complex. Doctors' basic knowledge of it is poor, and errors in fluid type, rate or volume lead to morbidity and mortality that is preventable.",
          "An IV fluid is not just an innocent bag of water: under- and over-administration may both be harmful.",
          "Fluid overload is one of the most common complications of overzealous IV fluid administration, often overlooked but harmful.",
        ], "Why plan meticulously"),
        table(
          ["Right", "Wording on page 36"],
          [
            ["1", "right type of fluid"],
            ["2", "right volume"],
            ["3", "right time"],
            ["4", "right route"],
          ],
          "The four rights named in the chapter opening",
          "Prescribe fluid the way any other pharmacological prescription, an antibiotic or drug, is prescribed, and tailor it to the patient's individualised needs; the book says this reduces risk and improves outcome. The chapter's three indication categories, resuscitation, maintenance and replacement fluids, are named in its contents only."
        ),
        quote("IV fluids are not just an innocent bag of water; their under or over-administration may be potentially harmful", "36"),
        quote("use the right type of fluid, in the right volume at the right time, by the right route", "36"),
      ],
    },
    {
      id: "maintenance",
      title: "Maintenance fluid therapy",
      intro: "Chapter 7. The preview carries the eligibility criterion, the physiological basis and the opening of the sodium-concentration discussion.",
      blocks: [
        points([
          "Who needs it: patients who are euvolaemic and haemodynamically stable but unable to take adequate fluid by the oral or enteral route.",
          "What it replaces: anticipated insensible losses and sensible losses.",
          "The goal: replace the ongoing daily physiological losses (urine, faeces, sweat), maintain normal water and electrolyte balance, and provide adequate calories to avoid starvation ketosis.",
          "The ideal maintenance fluid gives adequate water and electrolytes to preserve extracellular volume and tissue perfusion without volume depletion, fluid overload or electrolyte disturbance, plus supplementation for optimal calories.",
        ]),
        table(
          ["Loss", "Examples named on page 39"],
          [
            ["Insensible", "respiration, perspiration, stools"],
            ["Sensible", "urine"],
          ],
          "Insensible and sensible losses"
        ),
        caution([
          "The sodium concentration of a maintenance fluid is, in the book's words, crucial but debatable, because of two common and potentially harmful effects: hyponatraemia and volume overload. The concept of the appropriate concentration for adults is changing like a pendulum shift — the preview cuts off there, before the book gives a figure.",
        ], "The sodium hazard"),
        quote("euvolemic, hemodynamically stable but unable to take adequate fluid by oral or enteral route need maintenance intravenous (IV) fluids", "39"),
        quote("two common and potentially harmful effects, hyponatremia [3, 4] and volume overload [5, 6]", "39"),
        quote("provide adequate calories to avoid starvation ketosis", "39"),
      ],
    },
    {
      id: "not_in_edition",
      title: "Not in this edition",
      intro: "The source is the free preview. Each chapter is cut after its opening page and the remainder is replaced by the reference list. No colloid product data, prescription-writing steps, daily requirements or maintenance volumes appear in the text present.",
      blocks: [
        caution([
          "The preview edition stops after the introduction of chapter 5; its Tables 5.1 and 5.2 and its sections on human albumin, hydroxyethyl starch, gelatin and dextran (pharmacology, indications, adverse effects, contraindications, administration) are not reproduced here.",
          "The preview edition stops after the introduction of chapter 6; its sections on the goals of fluid therapy, principles and guidelines, planning and prescribing, and the indications for resuscitation, maintenance and replacement fluids are not reproduced here.",
          "The preview edition stops after the sodium-concentration opening of chapter 7; its sections on iatrogenic fluid overload and fluid creep, indications, selection and type of fluid, hypotonic fluids, monitoring, the volume and rate of maintenance fluid and its cautions, and any daily-requirement figures or weight-based formulas, are not reproduced here.",
        ], "Absent from the source text"),
      ],
    },
  ],
};
