import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, table } from "@/content/fluids/_helpers";

/**
 * CIRRHOSIS, ENCEPHALOPATHY, PANCREATITIS, LUNG DISEASE AND DKA — v1.0.0.
 * CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * The source edition carries only the opening page or two of chapters 35, 36, 38, 39 and 40:
 * definitions, pathophysiology and diagnostic criteria, then the reference list. The
 * management bodies are not reproduced. This topic records exactly what is printed and, in
 * its last section, names what is missing so nobody reads absence as advice.
 */
export const liverPancreasLungDkaV1: FluidTopic = {
  id: "liver_pancreas_lung_dka",
  version: "1.0.0",
  title: "Cirrhosis, encephalopathy, pancreatitis, lung disease and DKA: what this edition gives",
  group: "settings",
  summary: "Definitions, thresholds and diagnostic rules from the opening pages of five chapters — and a plain list of the management sections this edition does not print.",
  setting: "General medicine, gastroenterology, respiratory and emergency, adult ward",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "35 Ascites in Cirrhosis (opening only)",
      "36 Hepatic Encephalopathy (opening only)",
      "38 Acute Pancreatitis (opening only)",
      "39 Fluid Therapy in Bronchial Asthma, ARDS and Mechanical Ventilation (opening only)",
      "40 Diabetic Ketoacidosis and Hyperosmolar Hyperglycemic State (opening only)",
    ],
    pages: "199–204, 218–231",
  },
  sections: [
    {
      id: "ascites",
      title: "Ascites in cirrhosis (chapter 35)",
      blocks: [
        points([
          "Ascites is pathological fluid accumulation in the peritoneal cavity; decompensated cirrhosis causes about 80% of cases.",
          "About 60% of patients with compensated cirrhosis develop ascites within 10 years of diagnosis.",
          "Five-year survival with ascites is about 30%, against about 80% in compensated cirrhosis.",
          "Refractory ascites: cannot be mobilised, or recurs after large volume paracentesis, despite dietary sodium restriction and diuretics. It carries poor survival.",
        ]),
        table(
          ["Portal pressure (hepatic–portal gradient)", "Meaning in the text"],
          [
            ["approximately <5 mmHg", "normal"],
            ["usually >12 mmHg", "required for ascites to develop"],
          ],
          "Portal pressure thresholds"
        ),
        points([
          "Four factors drive ascites: portal hypertension, splanchnic vasodilatation, renal sodium and water retention, hypoalbuminaemia.",
          "Portal hypertension arises from increased intrahepatic resistance (distorted vascular architecture) plus increased portal inflow (splanchnic vasodilatation); the raised sinusoidal hydrostatic pressure drives transudation into the peritoneum.",
          "Without elevated portal pressure, ascites or oedema do not occur.",
        ], "Pathophysiology, part A only"),
        quote("a portal pressure of usually >12 mmHg is required for ascites to develop", "199"),
      ],
    },
    {
      id: "encephalopathy",
      title: "Hepatic encephalopathy (chapter 36)",
      blocks: [
        points([
          "A potentially reversible spectrum of neurological or psychiatric abnormality, from subclinical change to coma, complicating decompensated liver disease or portosystemic shunting.",
          "About 30 to 45% of patients with cirrhosis develop overt hepatic encephalopathy.",
        ]),
        points([
          "Neurotoxins: ammonia, benzodiazepines and benzodiazepine-like compounds such as GABA, manganese deposited in the basal ganglia.",
          "Increased GABA and serotonin neurotransmission.",
          "False neurotransmitters (tyramine, octopamine, beta-phenylethanolamines) competing with normal catecholamines.",
          "Altered brain energy from impaired hepatic gluconeogenesis in terminal liver failure.",
          "Systemic inflammation exacerbating the harm of hyperammonaemia.",
          "Blood–brain barrier changes increasing the influx of neurotoxins.",
        ], "Proposed mechanisms"),
        quote("About 30 to 45% of patients with cirrhosis develop overt hepatic encephalopathy", "202"),
      ],
    },
    {
      id: "pancreatitis",
      title: "Acute pancreatitis (chapter 38)",
      blocks: [
        points([
          "Cellular injury and inflammation of the pancreas with abrupt deep epigastric pain and raised lipase or amylase.",
          "Causes: gallstones about 42%, chronic alcohol about 21%; less often hypertriglyceridaemia, post-ERCP, hypercalcaemia, trauma, infection, idiopathic.",
        ]),
        table(
          ["Diagnosis needs at least two of three", "Detail in the text"],
          [
            ["Typical abdominal pain", "acute onset, severe, persistent, epigastric and left upper quadrant"],
            ["Pancreatic enzymes", "threefold elevation of serum lipase and serum amylase"],
            ["Imaging", "CT, MRI or ultrasound findings consistent with acute pancreatitis"],
          ]
        ),
        points([
          "Classification by pathology, onset and severity is in Table 38.1, which this edition does not print.",
          "Treatment is individualised to severity, cause, complications and coexisting disease, in three categories: initial medical management, endoscopic therapy, surgical therapy.",
        ]),
        quote("Threefold elevation in pancreatic enzymes activity (serum lipase and serum amylase)", "218"),
      ],
    },
    {
      id: "asthma",
      title: "Bronchial asthma, ARDS and ventilation (chapter 39)",
      intro: "Only the asthma hydration rationale is printed.",
      blocks: [
        points([
          "Adequate hydration protects the lung epithelium and promotes mucociliary clearance; cough is more prevalent in dehydration even in healthy people.",
          "An attack loses water and sodium chloride through poor oral intake, the work of breathing, insensible loss from hyperventilation, cold sweat and fever.",
          "Dehydration worsens respiratory symptoms and lung function in asthma.",
        ]),
        points([
          "Thickened secretions, leading to mucus plugging and airway obstruction.",
          "Release of inflammatory markers such as histamine: smooth-muscle contraction, bronchial secretion and mucosal oedema.",
        ], "Two problems of dehydration"),
        quote("dehydration worsens respiratory symptoms and lung function in patients with bronchial asthma", "223"),
      ],
    },
    {
      id: "dka",
      title: "Diabetic ketoacidosis and HHS (chapter 40)",
      blocks: [
        points([
          "DKA: a common hyperglycaemic emergency with low mortality — hyperglycaemia with ketoacidosis, typically in type 1 diabetes, with significant fluid and electrolyte imbalance.",
          "HHS: less common — hyperglycaemia with hyperosmolality and no ketoacidosis — and has a high mortality rate.",
        ]),
        table(
          ["Triad", "Cut-off as printed"],
          [
            ["Hyperglycaemia", "Blood glucose >200 mg/dL or 11.0 mmol/L"],
            ["Metabolic acidosis", "Venous pH <7.3 and serum bicarbonate <18 mmol/L (ISPAD 2022) or 15 mmol/L (JBDS 2023)"],
            ["Ketonaemia or ketonuria", "Capillary ketones >3 mmol/L or urine ketones ++ (moderate or large)"],
          ],
          "DKA definition"
        ),
        points([
          "Blood beta-hydroxybutyrate, where it can be measured, is the more precise and sensitive test.",
        ]),
        quote("Venous pH <7.3 and serum bicarbonate <18 mmol/L [1] (or 15 mmol/L [2]).", "228"),
        quote("Blood glucose concentration of >200 mg/dL or 11.0 mmol/L.", "228"),
      ],
    },
    {
      id: "not_in_edition",
      title: "What this edition does not print",
      intro: "Each chapter's contents page lists the sections below, but the preview edition stops before them. Nothing in this topic should be read as the book's fluid, drug or electrolyte advice for these conditions.",
      blocks: [
        caution([
          "The preview edition stops after the opening page of chapter 35; its sections on management, goals of therapy, salt restriction, fluid restriction and bed rest, diuretics, large volume paracentesis, drugs in ascites, other measures and monitoring are not reproduced here.",
          "The preview edition stops after the opening page of chapter 36; its sections on classification, basic principles, nutrition, avoiding hypoglycaemia, correction of metabolic alkalosis, hypokalaemia and hyponatraemia, selection of IV fluids, lactulose and rifaximin are not reproduced here.",
          "The preview edition stops after the opening page of chapter 38; its sections on classification (Table 38.1), control of pain, fluid resuscitation, electrolyte and metabolic disorders, nutrition, antibiotics, other drugs, endoscopic therapy and surgical therapy are not reproduced here.",
          "The preview edition stops after the opening page of chapter 39; its sections on electrolyte and acid–base disorders in asthma, fluid therapy in ARDS (avoiding overload, conservative management, fluid regimen, diuretics, choice of IV fluid) and fluid therapy in mechanical ventilation are not reproduced here.",
          "The preview edition stops after the opening page of chapter 40; its sections on fluid replacement, insulin, potassium, bicarbonate, phosphate and monitoring, and the whole of hyperosmolar hyperglycaemic state, are not reproduced here.",
        ]),
      ],
    },
  ],
};
