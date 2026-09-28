import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote } from "@/content/fluids/_helpers";

/**
 * PERIOPERATIVE AND NEUROSURGICAL FLUIDS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * The source edition carries only the opening page or two of chapters 41–44 (table of contents,
 * first section, then the publisher's "want to read more" banner and the reference list). This
 * topic digests exactly that text and nothing more. No dose, target or table appears here
 * because none is printed; the final section lists what the full chapters cover but this
 * edition does not reproduce.
 */
export const perioperativeAndNeuroV1: FluidTopic = {
  id: "perioperative_and_neuro",
  version: "1.0.0",
  title: "Perioperative and neurosurgical fluids: principles in this edition",
  group: "settings",
  summary: "The goals, the stress-hormone physiology and the fluid choices the opening pages of chapters 41–44 state — and a list of what those chapters cover that this edition omits.",
  setting: "Neurosurgical, surgical and anaesthetic wards, adult",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "41 Neurological Disorders (opening only)",
      "42 Preoperative Fluid Therapy (opening only)",
      "43 Intraoperative Fluid Therapy (opening only)",
      "44 Postoperative Fluid Therapy (opening only)",
    ],
    pages: "232–251",
  },
  sections: [
    {
      id: "neurological",
      title: "Neurological disorders: goals and fluid choice",
      blocks: [
        points([
          "Fluid replacement in traumatic brain injury and neurosurgery has three goals: haemodynamic stability; cerebral perfusion and oxygenation to prevent brain damage; prevention of cerebral oedema.",
          "After aneurysmal subarachnoid haemorrhage patients are prone to volume contraction from cerebral salt wasting, with increased urine output. Volume depletion plus vasospasm raises the risk of cerebral ischaemia and stroke, so they need large volumes of sodium-rich fluid to correct hypovolaemia and keep euvolaemia and normonatraemia.",
          "Choice of fluid depends on composition, tonicity and the type of buffer.",
          "The 2018 ESICM consensus recommends crystalloids as first-line resuscitation and preferred maintenance fluid, and advises against colloids in neurointensive care.",
          "Normal saline (0.9% sodium chloride), isotonic, is the most commonly used and preferred crystalloid for neurological patients.",
        ]),
        caution(["Avoid colloids in neurointensive care patients (ESICM 2018)."]),
        quote("advise against using colloids in neurointensive care patients", "232"),
        quote("large volumes of sodium-rich IV fluids to correct hypovolemia, maintain euvolemia and normonatremia", "232"),
        quote("Isotonic solution normal saline (0.9% sodium chloride) is the most commonly used and preferred crystalloid for neurological patients", "232–233"),
      ],
    },
    {
      id: "preoperative",
      title: "Preoperative: why surgical patients differ",
      blocks: [
        points([
          "Fluid therapy in surgical patients maintains haemodynamic stability, organ perfusion and hydration during and after surgery; the type and amount depend on preoperative status, extent of surgical trauma, duration of surgery and comorbidity.",
          "Proper fluid management reduces complications after major surgery, shortens stay and improves outcomes.",
          "Acute stress raises ACTH, so the adrenal secretes large amounts of cortisol and aldosterone: sodium retention and urinary potassium loss. Hypovolaemia during major surgery raises aldosterone further.",
          "Increased aldosterone for the first 2–3 postoperative days increases sodium and water reabsorption.",
          "Pain and stress increase ADH secretion during the first 2–3 postoperative days; ADH reduces urine output and increases water reabsorption, which helps correct postoperative hypotension.",
          "Consequently the maintenance fluid required on the first postoperative day is lower.",
          "The deficit from preoperative oral restriction (nothing by mouth) must be taken into account and replenished before or during surgery.",
        ]),
        quote("increased aldosterone secretion for the first 2-3 postoperative days leads to increased sodium and water reabsorption", "237"),
        quote("the amount of maintenance fluid required on the first postoperative day is lower due to the increased ADH secretion", "237–238"),
        quote("Fluid deficit resulting from preoperative oral fluid restriction (nothing by mouth-NPO) must be taken into account and replenished", "238"),
      ],
    },
    {
      id: "intraoperative",
      title: "Intraoperative: the goal and the harms of overload",
      blocks: [
        points([
          "Intraoperative hypovolaemia and hypotension are common in high-risk prolonged surgery (major abdominal, cardiac), in the elderly and in pre-existing disease, and carry high morbidity, postoperative mortality and adverse outcomes.",
          "The goal is to prevent and correct hypovolaemia and hypotension while avoiding fluid overload.",
          "Fluid overload causes impaired tissue oxygenation, pulmonary oedema, impaired wound healing, acute kidney injury, prolonged bowel dysfunction and longer stay.",
          "Diagnose and treat the cause of hypovolaemia rather than only replacing fluid.",
          "Surgical blood loss is the major cause; the volume depends on the type and duration of surgery and on pre-existing or acquired haemostatic defects. Trauma surgery is the most common cause of severe blood loss. Anticoagulants such as warfarin and antiplatelets such as clopidogrel raise the bleeding risk. The text stops after this first cause.",
        ]),
        quote("prevent and correct hypovolemia and hypotension while avoiding fluid overload", "241"),
        quote("Trauma surgery is the most common cause of severe blood loss", "241–242"),
      ],
    },
    {
      id: "postoperative",
      title: "Postoperative: three principles of balance",
      blocks: [
        points([
          "Postoperative fluid therapy depends on thorough evaluation; no single regimen suits everyone.",
          "Aim: keep the patient normovolaemic, maintain circulating volume, optimise organ perfusion, promote wound healing, provide calories to prevent catabolism, and prevent hypovolaemia, overload, electrolyte imbalance and acid–base disturbance.",
        ]),
        points([
          "Replace ongoing losses: haemorrhage, drainage, third-space and insensible losses.",
          "Provide maintenance requirements.",
          "Correct pre-existing deficits: preoperative and intraoperative losses.",
        ], "The three principles"),
        points([
          "Bleeding, intraoperative and postoperative.",
          "Fluid deficit: an uncorrected preoperative NPO deficit; a zero-balance or restrictive intraoperative strategy; maintenance not replaced during prolonged surgery; ongoing gastrointestinal losses (vomiting, diarrhoea).",
        ], "Causes of postoperative hypovolaemia and hypotension (the portion printed)"),
        quote("no single postoperative fluid regimen suits everyone", "248"),
        quote("utilization of 'zero-balance' or 'restrictive fluid strategy' to replace intraoperative losses", "249"),
      ],
    },
    {
      id: "not_in_edition",
      title: "What these chapters cover that this edition does not reproduce",
      intro: "Each chapter's printed table of contents names sections whose text is absent from the preview edition. Nothing from them appears above; do not read their absence as the book's silence.",
      blocks: [
        caution([
          "The preview edition stops after the opening page of chapter 41; its sections on balanced crystalloids (Ringer's lactate, PlasmaLyte), hypotonic fluid, albumin, hydroxyethyl starch, maintaining euvolaemia, avoiding hyperglycaemia, and osmotherapy (mannitol, hypertonic saline, and their comparison) are not reproduced here.",
          "The preview edition stops after the opening page of chapter 42; its sections on correction of hypovolaemia, correction of anaemia, correction of other disorders, preoperative fasting and fasting guidelines for children are not reproduced here.",
          "The preview edition stops after the opening page of chapter 43; its sections on the remaining causes of hypovolaemia, selecting the type of fluid (balanced crystalloids, normal saline, albumin, hydroxyethyl starch, gelatine, blood products), quantity and strategy (minimal or moderate trauma surgery, major invasive surgery, the traditional approach, restrictive versus liberal therapy, goal-directed therapy) and monitoring are not reproduced here.",
          "The preview edition stops after the opening page of chapter 44; its sections on indications and duration of IV fluids, determining the volume, fluids immediately after surgery (Ringer's lactate, normal saline, PlasmaLyte, albumin, other colloids, blood transfusion), potassium supplementation (importance, timing, strategy), caloric supplementation, maintenance fluids in the subsequent period and monitoring are not reproduced here.",
        ]),
      ],
    },
  ],
};
