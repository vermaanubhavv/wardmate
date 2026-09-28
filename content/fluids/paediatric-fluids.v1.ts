import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps } from "@/content/fluids/_helpers";

/**
 * PAEDIATRIC FLUIDS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Chapters 48, 49 and 50 are present in the source edition only as openings: the contents
 * list, the introduction and the reference list, cut off by the publisher's "Want to read
 * more?" marker. This topic carries what those openings say and nothing else. Every table,
 * formula, volume and composition the headings promise is absent from the text and is NOT
 * filled in here.
 */
export const paediatricFluidsV1: FluidTopic = {
  id: "paediatric_fluids",
  version: "1.0.0",
  title: "Paediatric fluids and oral rehydration: what this edition gives",
  group: "settings",
  summary: "Three chapters that survive only as openings: the framework the book sets out, and an explicit list of the numbers it does not supply.",
  setting: "Paediatric ward and emergency; reference only",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "48 Resuscitation and Maintenance Fluid Therapy in Children (opening only)",
      "49 Replacement Fluid Therapy and its Monitoring in Children (opening only)",
      "50 Oral Rehydration Therapy (opening only)",
    ],
    pages: "280–291",
  },
  sections: [
    {
      id: "resuscitation_maintenance",
      title: "Resuscitation and maintenance fluids in children (chapter 48)",
      intro: "Only the introduction survives. Resuscitation fluids establish haemodynamic stability, adequate intravascular volume and tissue perfusion; maintenance fluids keep hydration and electrolyte balance.",
      blocks: [
        points([
          "Oral fluid replacement is always a safe and preferred mode.",
          "Intravenous therapy is indicated to correct or maintain fluid and electrolyte balance in shock, severe dehydration, uncontrolled vomiting or diarrhoea, inability to drink, paralytic ileus with abdominal distension, impaired sensorium, and other serious complications.",
          "The aims fall into three groups — resuscitation, maintenance and replacement — and the distinction matters because the choice of fluid, its composition, volume and rate differ for each.",
        ]),
        points([
          "Resuscitation fluids: crystalloids versus colloids; normal saline versus balanced crystalloids; the role of blood transfusion; timing; bolus versus continuous infusion; volume of the bolus; avoiding volume overload.",
          "Maintenance fluids: requirements; prescribing; hypotonic fluids outdated; the basis of the shift to isotonic fluids; the current recommendation of isotonic maintenance; commercial versus custom-made solutions; dextrose and potassium content; exceptions; the rate controversy; avoiding overload.",
          "Maintenance fluids for neonates: physiological considerations and prescribing. A prescription summary closes the chapter.",
        ], "What the contents list promises (text absent)"),
        quote("Oral fluid replacement is always a safe and preferred mode", "280"),
      ],
    },
    {
      id: "replacement",
      title: "Replacement fluid therapy and monitoring in children (chapter 49)",
      intro: "Replacement is the third pillar after resuscitation and maintenance: it replenishes the pre-existing deficit and covers ongoing losses such as vomiting and diarrhoea. The chapter's five-step plan and the first paragraph on severity survive; nothing after them does.",
      blocks: [
        steps([
          "Severity assessment: mild, moderate or severe dehydration.",
          "Laboratory assessment.",
          "Establish the type of dehydration by sodium concentration — hyponatraemic, isonatraemic or hypernatraemic — and plan treatment on that distinction.",
          "Identify the underlying cause (diarrhoea, vomiting, diabetic ketoacidosis) and individualise treatment.",
          "Monitoring: close clinical assessment, periodic laboratory tests, strict measurement of urine volume and a daily weight chart.",
        ], "The five steps, as printed"),
        points([
          "Severity decides both the urgency of intervention and the volume of fluid needed. Assessment has three parts: asking specific questions, looking at visible signs, and physical examination — summarised in Table 49.1, which is not present in the text.",
          "The contents list promises treatment by type (isonatraemic, hyponatraemic, hypernatraemic), treatment by cause (diarrhoea, vomiting, diabetic ketoacidosis) and monitoring (examination and vital signs, fluid balance and weight chart, laboratory tests). None of that text is present.",
        ]),
        quote("The five crucial steps to planning optimal and effective replacement fluid therapy in children", "285"),
        quote("Asking specific questions, looking at visible signs, and physical examinations, as summarized in Table 49.1", "286"),
      ],
    },
    {
      id: "oral_rehydration",
      title: "Oral rehydration therapy (chapter 50)",
      intro: "The introduction and the paragraph distinguishing therapy from solution survive; the compositions, plans and doses do not.",
      blocks: [
        points([
          "Oral rehydration therapy changed the outcome for millions of children with diarrhoea and has saved more lives than any other treatment in the past century. It is cheap, non-invasive and has a lower complication rate than intravenous fluid.",
          "It removes the need for venous access — a skilled task, especially in infants — and avoids the pulmonary oedema and electrolyte imbalance that intravenous therapy risks. Its low cost leads to underestimation and underuse.",
          "Oral rehydration therapy is the broad practice of rehydrating with salt, sugar and water in various forms. Oral rehydration solution is a specific scientifically designed glucose–electrolyte formulation such as the WHO mixture, and is the most effective of the options.",
        ]),
        points([
          "Indications and contraindications; the pharmacological basis (salt water with and without glucose); recommended composition (glucose, sodium, osmolarity, potassium, citrate for acidosis); types (WHO standard, WHO low osmolarity, ReSoMal, rice-based); zinc; treatment plans A, B and C by severity; method of administration; monitoring.",
        ], "What the contents list promises (text absent)"),
        quote("saved more lives than any other treatment modality over the past century", "289"),
        quote("ORS stands out as the most scientifically advanced and effective method for treating dehydration among all ORT options", "290"),
      ],
    },
    {
      id: "not_in_edition",
      title: "Not in this edition's text",
      intro: "Each of the three chapters is cut at the publisher's preview marker on PDF pages 281, 286 and 290. The headings below are printed in the contents lists; their text is not. Nothing here is filled from any other source.",
      blocks: [
        caution([
          "Chapter 48: no bolus volume for resuscitation, no maintenance formula or table (Holliday–Segar), no isotonic-versus-hypotonic detail, no dextrose or potassium content for maintenance fluid, no maintenance rate, no neonatal fluids by day of life, no prescription summary.",
          "Chapter 49: no Table 49.1 dehydration grading, no deficit formula, no laboratory assessment, no treatment for isonatraemic, hyponatraemic or hypernatraemic dehydration, no diarrhoea, vomiting or diabetic ketoacidosis protocols, no per-loss replacement volumes, no monitoring detail.",
          "Chapter 50: no ORS composition (WHO standard, WHO low osmolarity, ReSoMal, rice-based), no osmolarity values, no zinc dose, no Plan A, B or C volumes by age or weight, no method of administration, no monitoring.",
        ], "Absent from the text, by chapter"),
        quote("Want to read more? Get Printed Version Get Kindle Version", "281"),
      ],
    },
  ],
};
