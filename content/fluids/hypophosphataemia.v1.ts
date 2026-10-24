import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPOPHOSPHATAEMIA — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 26 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const hypophosphataemiaV1: FluidTopic = {
  id: "hypophosphataemia",
  version: "1.0.0",
  title: "Hypophosphataemia: diagnosis and replacement",
  group: "electrolytes",
  summary: "Low phosphate: severity grades, causes, the urinary phosphate work-up, and oral and IV replacement with the book's doses, rates, preparations and precautions.",
  setting: "Adult medical and surgical wards and ICU",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["26 Hypophosphatemia"], pages: "313–320", pageKind: "book" },
  sections: [
    {
      id: "physiology",
      title: "Phosphate in the body",
      blocks: [
        points([
          "Phosphate is needed for almost all cellular functions: cell membranes, phospholipids, nucleic acids, acid buffering, enzyme systems and ATP.",
          "Daily dietary intake is about 1000 mg. Rich foods: animal proteins (meat, chicken, fish, egg), dairy products, dry fruits and certain vegetables (carrot, corn, groundnut, fresh peas, sweet potato).",
          "Four organs keep serum phosphate in range: small intestine, kidneys, bones and parathyroid glands. Intestinal absorption is largely unregulated, so more dietary phosphate means more absorbed; 1,25-dihydroxy vitamin D also increases gut absorption.",
          "The kidneys regulate serum phosphate under PTH, FGF23, active vitamin D (calcitriol) and insulin.",
          "Raise renal excretion and lower serum phosphate: high PTH, FGF23, high dietary phosphate, ECF volume expansion, metabolic acidosis, hypokalaemia. FGF23 is produced by osteocytes in response to hyperphosphataemia, high PTH and increased calcitriol.",
          "Lower renal excretion and raise serum phosphate: high vitamin D, insulin, low PTH, low dietary phosphate.",
          "Shift phosphate into cells and lower serum phosphate: alkalaemia, insulin, refeeding syndrome, hungry bone syndrome, dextrose infusion.",
          "Calcium and phosphate move in opposite directions: when blood calcium rises, phosphate falls.",
        ]),
        quote("The daily dietary phosphate intake is about 1000 mg per day.", "313"),
      ],
    },
    {
      id: "definition",
      title: "Definition and severity",
      blocks: [
        table(
          ["Grade", "Serum phosphorus (mg/dL)", "Serum phosphorus (mmol/L)"],
          [
            ["Hypophosphataemia", "<2.5", "<0.80"],
            ["Mild", "2–2.5", "0.65–0.81"],
            ["Moderate", "1–2", "0.32–0.65"],
            ["Severe", "<1", "0.32 (printed without the < sign)"],
          ],
          "Definition and severity grades (p313)"
        ),
        points([
          "Uncommon in the general population; up to 5% of hospitalised patients, more in trauma, alcoholism, DKA, sepsis and ICU patients, with high mortality in the ICU.",
        ]),
        quote("Hypophosphatemia is defined as a serum phosphorus level <2.5 mg/dL (or <0.80 mmol/L).", "313"),
        quote("into mild (2–2.5 mg/dL or 0.65–0.81 mmol/L), moderate (1–2 mg/dL or 0.32–0.65 mmol/L), or severe (<1 mg/dL or 0.32 mmol/L) degree.", "313"),
        quote("occurs in up to 5% of hospitalized patients", "313"),
      ],
    },
    {
      id: "causes",
      title: "Causes",
      intro: "The most common causes are respiratory alkalosis, sepsis, diabetic ketoacidosis and the postoperative period.",
      blocks: [
        table(
          ["Group", "Causes"],
          [
            ["1. Decreased intestinal absorption/intake", "Vitamin D deficiency; vitamin D dependent rickets type I and II; malabsorption, phosphate-binding antacids; poor intake from chronic protein malnutrition"],
            ["2. Increased renal excretion", "Hyperparathyroidism (primary or secondary); vitamin D deficiency; phosphaturic drugs (diuretics, theophylline, corticosteroids); X-linked hypophosphataemic rickets; volume expansion; Fanconi syndrome"],
            ["3. Intracellular shift of phosphate", "Acute respiratory alkalosis; dextrose infusion; insulin therapy/refeeding syndrome; hungry bone syndrome"],
            ["4. Other causes", "Metabolic alkalosis; phosphate removal by renal replacement therapies; diabetic ketoacidosis"],
          ],
          "Table 26.1 Causes of hypophosphataemia"
        ),
        points([
          "Acute respiratory alkalosis: one of the most common causes, from hyperventilation in sepsis, liver failure, pain, acute salicylate poisoning, or overventilation on a ventilator. A rise in intracellular pH stimulates glycolysis, which shifts phosphorus into cells.",
          "Sepsis: mechanism unclear, but a common cause, and associated with a marked increase in mortality.",
          "Increased insulin secretion: in refeeding syndrome, DKA or rapid dextrose infusion, high insulin shifts phosphorus into cells. Chronic alcoholism, anorexia nervosa and chronic malnutrition carry greater risk during carbohydrate refeeding.",
          "DKA: intracellular shift from insulin therapy, volume expansion from fluid repletion and correction of acidosis; and prolonged urinary phosphate loss from hyperglycaemia-induced osmotic diuresis.",
          "Hungry bone syndrome: a sudden fall in high PTH after parathyroidectomy, with preexisting osteopenia, deposits calcium and phosphate in bone, giving significant hypocalcaemia and hypophosphataemia.",
          "Postoperative period: glucose and antacids, volume expansion, respiratory alkalosis from pain, perioperative catecholamine surge, prior diuretic use and poor oral intake can together cause severe hypophosphataemia.",
        ], "The common causes"),
        quote("The most common causes of hypophosphatemia are respiratory alkalosis, sepsis, diabetic ketoacidosis, and the postoperative period.", "314"),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      blocks: [
        points([
          "Severity and chronicity determine the picture. Mild hypophosphataemia is usually asymptomatic; a wide variety of symptoms usually appears when plasma phosphate is below 1 mg/dL (0.32 mmol/L).",
          "Three mechanisms: lower intracellular ATP disrupting cell function in many organs; lower erythrocyte 2,3-DPG raising haemoglobin's oxygen affinity and reducing tissue oxygen delivery; and a prolonged mineral defect causing musculoskeletal complaints and deformities in chronic hypophosphataemia.",
        ]),
        table(
          ["System", "Acute features as printed"],
          [
            ["Muscular", "Proximal muscle weakness (the most common symptom); weak hand grip, slurred speech, dysphagia, ileus; rhabdomyolysis in acute severe hypophosphataemia, commonly in alcoholics and patients on parenteral nutrition without phosphate supplementation"],
            ["Respiratory", "Respiratory failure from diaphragm and respiratory muscle weakness, with hypoxia; failure to wean from ventilation, common in the ICU"],
            ["Cardiac", "Impaired myocardial contractility with heart failure, more vasoactive support after cardiac surgery, arrhythmias: severe but uncommon"],
            ["Neurological", "Paraesthesia, altered mental status, confusion, lethargy, progressing to seizures or coma"],
            ["Haematological", "Red cell dysfunction (tissue hypoxia, rigidity, haemolysis); leucocyte dysfunction (impaired phagocytosis and chemotaxis, gram-negative sepsis); platelet dysfunction (thrombocytopenia, petechial haemorrhages)"],
          ],
          "A. Acute hypophosphataemia"
        ),
        points([
          "B. Chronic hypophosphataemia: mineralisation defects with muscle and bone pain, rickets in children, osteomalacia in adults, and fractures.",
          "Anticipate it and check phosphate before or during therapy in refeeding syndrome, DKA, hyperosmolar hyperglycaemic nonketotic syndrome, CRRT, and failure or difficulty weaning from ventilation.",
        ]),
        quote("a wide variety of symptoms are usually evident when plasma phosphate is below 1 mg/dL (0.32 mmol/L).", "315"),
        quote("Proximal muscle weakness is the most common symptom of hypophosphatemia.", "315"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnostic approach",
      blocks: [
        steps([
          "History and examination: dietary intake, alcoholism, diarrhoea, medications, IV fluids infused. Skeletal deformities, bone pain, muscle weakness and nontraumatic fractures suggest chronic hypophosphataemia; in children, hypophosphataemic rickets gives skeletal deformities (e.g. leg bowing) and short stature with bone pain.",
          "Basic investigations: serum sodium, potassium, calcium, magnesium, PTH, vitamin D, alkaline phosphatase, serum protein, serum creatinine and acid–base parameters (respiratory alkalosis).",
          "If the diagnosis is not clear: urinary phosphate excretion, by 24-hour urine collection or fractional excretion of phosphate (FePO4) from a random specimen.",
          "With renal phosphate wasting: serum calcium, PTH and vitamin D.",
          "Other tests: high CPK suggests rhabdomyolysis. In very few selected patients FGF23 is measured; it is high in hereditary hypophosphataemic rickets (XLH) and tumour-induced osteomalacia.",
        ]),
        table(
          ["Urinary phosphate", "Meaning", "Causes"],
          [
            ["24-hour urine PO4 <100 mg or FePO4 <5%", "Appropriately low renal phosphate excretion (the usual response)", "Intracellular shift (refeeding syndrome, DKA, acute respiratory alkalosis); decreased GI absorption (malabsorption, antacids, phosphate binders)"],
            ["24-hour urine PO4 ≥100 mg or FePO4 ≥5%", "Inappropriately high: renal phosphate wasting", "Primary hyperparathyroidism; vitamin D deficiency; Fanconi syndrome; other causes"],
          ],
          "Step 3 and Figure 26.1: urinary phosphate excretion"
        ),
        table(
          ["Cause of renal phosphate wasting", "Findings as printed"],
          [
            ["Primary hyperparathyroidism", "High calcium, high PTH"],
            ["Vitamin D deficiency", "Low calcium, high PTH; serum 25-hydroxyvitamin D may be low or inappropriately normal"],
            ["Fanconi syndrome", "Uricosuria, aminoaciduria, normoglycaemic glucosuria and phosphaturia; metabolic acidosis (Figure 26.1)"],
          ],
          "Step 4: serum PTH and vitamin D"
        ),
        quote("The usual response to hypophosphatemia is 24-hour urine phosphate excretion less than 100 mg or a FePO4 less than 5 percent.", "317"),
        quote("A 24-hour urine phosphate excretion greater than or equal to 100 mg or a FePO4 greater than or equal to 5 percent", "317"),
        quote("24h Urine PO4 ≥ 100 mg or FePO4 ≥ 5%", "316"),
      ],
    },
    {
      id: "principles",
      title: "Management: basic principles",
      intro: "Treatment depends on severity, symptoms, onset (acute or chronic), coexisting problems needing caution (renal failure, hypercalcaemia, hypocalcaemia) and the underlying condition.",
      blocks: [
        points([
          "Mild cases: more dietary phosphorus may be adequate. Skim milk is an excellent source (900 mg/L).",
          "Oral replacement is safer and preferred over IV: mild hypophosphataemia, asymptomatic moderate hypophosphataemia, and chronic hypophosphataemia.",
          "IV is generally reserved for symptomatic moderate hypophosphataemia, severe acute hypophosphataemia, or patients unable to take oral preparations.",
          "Goal of acute IV therapy: raise serum phosphorus to a safe range (>1.0 mg/dL) and correct symptoms, then switch to oral.",
          "Magnesium deficiency often coexists: look for it and treat it. The chapter prints no magnesium dose.",
          "The skim milk figure differs between the text (900 mg/L) and Table 26.3 (1.0 gm, 32 mmol/L per litre). Both are printed.",
        ]),
        quote("Skim milk is an excellent source of phosphorus (900 mg/L).", "317"),
        quote("raise the serum phosphorus concentration to a safe range (>1.0 mg/dL)", "318"),
      ],
    },
    {
      id: "by_severity",
      title: "Treatment by severity",
      blocks: [
        table(
          ["Severity", "Serum phosphate", "Symptoms", "Preferred route", "Oral dose", "IV dose"],
          [
            ["Mild", "2.0–2.5 mg/dL (0.65–0.81 mmol/L)", "Asymptomatic", "Oral", "40–80 mmol in 4–5 divided doses", "0.08–0.16 mmol/kg"],
            ["Moderate", "1.0–2.0 mg/dL (0.32–0.65 mmol/L)", "Asymptomatic", "Oral", "40–80 mmol in 4–5 divided doses", "0.16–0.32 mmol/kg"],
            ["Moderate", "1.0–2.0 mg/dL (0.32–0.65 mmol/L)", "Symptomatic", "IV", "Oral preparations not preferred", "0.32–1.0 mmol/kg"],
            ["Severe", "<1.0 mg/dL (<0.3 mmol/L)", "Symptomatic", "IV", "Oral preparations not preferred", "0.32–1.0 mmol/kg"],
          ],
          "Table 26.2 Treatment of hypophosphataemia",
          "Injections of sodium phosphate and potassium phosphate both provide 3 mmol of phosphate per mL."
        ),
        points([
          "Oral: usually 40–80 mmol daily in 3–4 divided doses (1–2 packets/tablets of PHOS-NAK or K⁺ PHOS Neutral 3–4 times daily). Table 26.2 prints 4–5 divided doses; both are printed.",
          "Oral limitations: unpredictable absorption; nausea, diarrhoea, abdominal pain.",
          "IV: sodium or potassium phosphate diluted in normal saline or 5% dextrose, infused slowly, usually not faster than 7.5 mmol per hour, with serum phosphate every 12–24 hours.",
          "Potassium phosphate when hypokalaemia coexists; sodium phosphate with hyperkalaemia.",
        ]),
        quote("Injection of sodium phosphate and potassium phosphate both provide 3 mmol of phosphates per milliliter", "318"),
        quote("0.32–1.0 mmol/kg", "318"),
        quote("The usual dose for oral phosphate supplementation is 40–80 mmol daily in 3–4 divided doses", "318"),
        quote("the rate should not exceed 7.5 mmol per hour) with serum phosphate monitoring every 12–24 hours.", "318"),
      ],
    },
    {
      id: "preparations",
      title: "Oral and IV preparations",
      blocks: [
        table(
          ["Preparation", "Phosphate", "Sodium", "Potassium"],
          [
            ["Oral: skim milk (1 litre)", "1.0 gm, 32 mmol/L", "28 mEq", "38 mEq"],
            ["Oral: PHOS-NAK powder (1 packet 1.5 gm)", "250 mg, 8.0 mmol", "6.9 mEq, 160 mg", "7.1 mEq, 280 mg"],
            ["Oral: K-PHOS neutral tablet", "250 mg, 8.0 mmol", "13.0 mEq, 298 mg", "1.1 mEq, 45 mg"],
            ["Oral: K-PHOS original tablet", "114 mg, 3.68 mmol", "0", "3.7 mEq, 144 mg"],
            ["Oral: K-Phos no. 2 tablet", "250 mg, 8.0 mmol", "5.8 mEq, 134 mg", "2.3 mEq, 88 mg"],
            ["IV: inj. sodium phosphate", "3.0 mmol/mL", "4.0 mEq", "0"],
            ["IV: inj. potassium phosphate", "3.0 mmol/mL", "0", "4.4 mEq"],
          ],
          "Table 26.3 Oral and IV phosphate preparations",
          "The IV rows print sodium and potassium in mEq without a volume; the per-mL basis is not stated in the table."
        ),
        quote("PHOS-NAK powder (1 packet 1.5 gm)", "319"),
        quote("Inj. potassium phosphate", "319"),
      ],
    },
    {
      id: "precautions",
      title: "Precautions",
      blocks: [
        caution([
          "Hypercalcaemia: phosphate raises the calcium-phosphate product, which may precipitate in tissues (calciphylaxis).",
          "Hypocalcaemia: IV phosphate can lower calcium rapidly.",
          "Chronic kidney disease: risk of hyperphosphataemia from accumulation; give about 50% lower dose.",
          "Hypoparathyroidism: hypocalcaemia is common, so replace phosphate cautiously to avoid aggravating it.",
        ]),
        points([
          "DKA: insulin drives phosphate into cells, but routine replacement is not recommended (no benefit, and normal dietary intake corrects it). Replacement is needed for selected patients with severe hypophosphataemia (<1.0 mg/dL), cardiac dysfunction, haemolytic anaemia and/or respiratory depression.",
        ]),
        quote("administer about 50% lower dose of phosphate.", "318"),
        quote("the routine replacement of phosphate is not recommended because of the lack of benefits", "318"),
        quote("severe hypophosphatemia (serum phosphate concentration <1.0 mg/dL), cardiac dysfunction, hemolytic anemia, and/or respiratory depression", "319"),
      ],
    },
    {
      id: "underlying",
      title: "Correction of underlying causes",
      blocks: [
        points([
          "Vitamin D deficiency: vitamin D supplementation.",
          "Fanconi syndrome: usually oral phosphate, active vitamin D, alkali and correction of the fluid deficit.",
          "Hypophosphataemic rickets: high-dose oral phosphate with calcitriol. Burosumab, a monoclonal antibody against FGF23, is approved for X-linked hypophosphataemia and may be used when disease is refractory to conventional therapy; cost and availability are major limitations. No doses are printed.",
        ]),
      ],
    },
    {
      id: "coverage",
      title: "Coverage note",
      blocks: [
        caution([
          "The chapter's opening page (book p312: chapter contents and the start of the physiology section, including the normal serum phosphorus range) was not among the page images transcribed; this topic begins at p313 and carries nothing from p312.",
        ]),
      ],
    },
  ],
};
