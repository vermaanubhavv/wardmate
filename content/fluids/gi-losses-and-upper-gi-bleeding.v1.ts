import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * GASTROINTESTINAL LOSSES AND UPPER GI BLEEDING — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 34 of the full edition, from a text transcription (no page images).
 * Page numbers are the printed book pages. Every number below is the book's; the quotes give
 * the page it came from.
 */
export const giLossesAndUpperGiBleedingV1: FluidTopic = {
  id: "gi_losses_and_upper_gi_bleeding",
  version: "1.0.0",
  title: "Gastrointestinal losses and upper GI bleeding",
  group: "settings",
  summary: "What vomiting and diarrhoea take away and which fluid replaces it, and upper GI bleeding: assessment, resuscitation, transfusion thresholds, medications, endoscopy timing and monitoring.",
  setting: "Adult ward, emergency and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["34 Gastrointestinal Losses and Upper GI Bleeding"], pages: "403–418", pageKind: "book" },
  sections: [
    {
      id: "composition",
      title: "Composition of gastrointestinal secretions",
      intro: "Vomiting, diarrhoea and haematemesis are the common disorders the chapter covers. Table 34.1 sets out what each secretion carries and the disturbance its loss tends to cause.",
      blocks: [
        table(
          ["Secretion or type of loss", "pH", "Common disturbances", "Na⁺ (mEq/L)", "K⁺ (mEq/L)", "Cl⁻ (mEq/L)", "HCO₃⁻ (mEq/L)", "H⁺ (mEq/L)"],
          [
            ["Saliva", "6.0–7.0", "-", "40", "20", "40", "30", "Not printed"],
            ["Stomach or vomiting", "1.5–3.5", "Metabolic alkalosis, hypokalaemia, hypochloraemia", "20–60", "14", "140", "-", "60–80"],
            ["Bile", "7.0–8.0", "Metabolic acidosis", "145", "5.0", "105", "30", "-"],
            ["Pancreas", "7.0–8.8", "Metabolic acidosis", "125–138", "8.0", "56", "85", "-"],
            ["Jejunal loss via stoma or fistula", "7.0–8.0", "Metabolic acidosis", "140", "5.0", "135", "8.0", "-"],
            ["Ileal loss, new", "7.5–8.0", "Metabolic acidosis", "110–140", "5.0", "75–125", "0–30", "-"],
            ["Ileal loss, adapted", "7.5–8.0", "Metabolic acidosis", "50–100", "5.0", "25–75", "0–30", "Not printed"],
            ["Colon or diarrhoea", "7.5–8.5", "Metabolic acidosis, hypokalaemia", "30–140", "9.0–30", "90", "20–33", "-"],
          ],
          "Table 34.1 Composition of gastrointestinal secretions and potential disturbances due to losses (p404)",
          "\"Not printed\" marks a cell the transcription leaves empty rather than printing a dash. The transcription flags a merged cell in this table without saying which."
        ),
        quote("Sodium (Na⁺) 20-60 mEq/L, chloride (Cl⁻) 140 mEq/L, potassium (K⁺) 14 mEq/L, and hydrogen ions (H⁺) 60-80 mEq/L", "404"),
      ],
    },
    {
      id: "vomiting_abnormalities",
      title: "Vomiting: fluid and electrolyte abnormalities",
      intro: "Vomiting or nasogastric suction leads to hypokalaemic, hypochloraemic metabolic alkalosis with hypovolaemia. Hypochloraemia with metabolic alkalosis usually comes first; hypokalaemia follows (Figure 34.1).",
      blocks: [
        points([
          "Hypovolaemia: fluid loss decreases extracellular fluid volume.",
          "Hypokalaemia: loss of fluid and sodium causes hypovolaemia and so raised aldosterone, which increases distal sodium reabsorption and urinary potassium secretion. The metabolic alkalosis causes bicarbonaturia, and sodium bicarbonate delivered to the cortical collecting tubule increases lumen negativity and urinary potassium excretion.",
          "So the hypokalaemia of vomiting comes chiefly from potassium lost in urine and only partly from the gastric juice itself.",
          "Metabolic alkalosis is multifactorial: H⁺ is lost in acidic gastric juice (normally it would be reabsorbed distally in the intestine); hypovolaemia raises proximal tubular bicarbonate reabsorption; and with severe potassium depletion, aldosterone in the collecting duct secretes H⁺ instead of potassium, giving aciduria that aggravates the alkalosis — \"paradoxical aciduria\".",
          "Hypochloraemia: gastric juice is rich in hydrochloric acid, so vomiting loses a large amount of chloride.",
          "Urine: spot urine chloride stays low from hypovolaemia and hypochloraemia. Early, urinary potassium and bicarbonate are high (alkaline urine). If vomiting or suction persists, sodium and bicarbonate reabsorption rise and urinary bicarbonate falls; with severe hypokalaemia, aldosterone drives urinary hydrogen secretion and the urine turns acidic.",
          "The chapter prints two figures for what is lost that do not match Table 34.1: sodium lost in vomiting \"(20-40 mEq/L)\" against 20-60 mEq/L in gastric juice, and gastric potassium \"just 5 to 10 mEq/L\" against 14 mEq/L in the table and text on the same page. All are kept as printed.",
        ]),
        table(
          ["Time", "Urine potassium", "Urine chloride", "Urine HCO₃", "Urine pH"],
          [
            ["Day 1–3", "Increased", "Decreased", "Increased", ">6.5 alkaline"],
            ["Late", "Decreased", "Decreased", "Decreased", "<5.5 aciduria"],
          ],
          "Table 34.2 Variation in urinary electrolytes with vomiting (p406)"
        ),
        quote("leads to hypokalemic, hypochloremic metabolic alkalosis with hypovolemia.", "404"),
        quote("because of loss of fluid and sodium (20-40 mEq/L) causes hypovolemia", "404"),
        quote("in gastric secretions is just 5 to 10 mEq/L", "404"),
        quote("rich in hydrochloric acid (about 140 mEq/L chloride)", "405"),
        quote("Urinary loss of H+ ion in metabolic alkalosis is \"paradoxical aciduria\".", "405"),
        quote("the spot urine chloride concentration is persistently low due to hypovolemia and hypochloremia.", "405"),
        quote("aldosterone increases sodium reabsorption and urinary hydrogen secretion, causing acidic urine.", "406"),
      ],
    },
    {
      id: "vomiting_management",
      title: "Vomiting: management",
      blocks: [
        steps([
          "Aetiological treatment: search for and treat the specific cause of vomiting. (The printed sentence, \"to prevent or aggravate disturbances\", appears to have lost a word; kept as printed.)",
          "Correct hypovolaemia and electrolytes: the most preferred fluid is normal saline plus potassium; in a few patients the multi-electrolyte solution Isolyte-G is used. 5% dextrose with 0.9% NaCl can be used to add calories. The volume of saline is set by the severity of hypovolaemia.",
          "Potassium: when oral supplementation is not possible or inadequate, give it IV — usually 20-40 mEq/L potassium chloride added to saline for previous and ongoing losses.",
          "Judge the response by clinical criteria and urine output, plus urinary pH and chloride: acidic urine calls for more vigorous fluid replacement; alkaline urine and rising urine chloride show the volume and chloride deficit is being corrected.",
        ]),
        points([
          "Restoring volume decreases proximal tubular bicarbonate reabsorption, so the kidney excretes bicarbonate and the alkalosis corrects.",
          "Correcting the volume and sodium deficit lowers aldosterone; with sodium available distally, potassium and H⁺ secretion fall, preventing further hypokalaemia and alkalosis. Existing hypokalaemia still needs potassium.",
          "Its chloride (154 mEq/L) corrects hypochloraemia, and more chloride in the collecting duct allows Cl⁻/HCO₃ exchange, favouring bicarbonate secretion.",
          "So saline corrects every abnormality of vomiting or continuous nasogastric aspiration except the potassium deficit (Figure 34.2).",
        ], "Why normal saline works"),
        points([
          "Isolyte-G is the specific fluid for upper GI loss: ammonia, high chloride, potassium and sodium replace hydrogen, chloride, potassium and sodium losses. The book calls it the only commercially available IV fluid that provides H⁺ ions and directly corrects metabolic alkalosis.",
          "Balanced crystalloids (Ringer's lactate, PlasmaLyte) are not preferred: lactate and acetate are converted to bicarbonate and may worsen the alkalosis.",
        ], "Other fluids"),
        caution([
          "Shock, oliguria or renal failure: give potassium cautiously or avoid it.",
          "Avoid plain water for gastric irrigation: it draws more electrolyte-containing gastric secretion into the stomach, and removing it depletes fluid and electrolytes further. Normal saline is the ideal irrigation fluid, especially with electrolyte disturbance, hypovolaemia or haemodynamic instability.",
          "With continuous nasogastric aspiration, restrict ice chips by mouth: the water is suctioned back out with gastric fluid and electrolytes.",
        ]),
        quote("The most preferred IV fluid to correct deficit due to vomiting is normal saline plus potassium infusion", "406"),
        quote("The maximum chloride concentration (154 mEq/L) in normal saline corrects hypochloremia.", "406"),
        quote("contains ammonia (70 mEq/L), high chloride (154 mEq/L), potassium (17 mEq/L), and sodium (63 mE/L) content", "406"),
        quote("may worsen alkalosis and therefore are, not preferred.", "406"),
        quote("Usually, 20-40 mEq/L potassium chloride is added to saline to restore previous and ongoing potassium losses.", "407"),
        quote("In patients with shock, oliguria, or renal failure, potassium supplementation should be done cautiously or avoided.", "407"),
        quote("Acidic urine suggests the need for more vigorous fluid replacement", "407"),
        quote("However, avoid the use of plain water for irrigation.", "407"),
        quote("it is essential to restrict the ice chips given by mouth.", "408"),
      ],
    },
    {
      id: "diarrhoea_abnormalities",
      title: "Diarrhoea: fluid and electrolyte abnormalities",
      intro: "What changes depends on the type of diarrhoea, its severity and the treatment given. The end result the book describes is hypokalaemic, hyperchloraemic metabolic acidosis (Figure 34.3).",
      blocks: [
        table(
          ["Type of diarrhoea", "Causes", "Characteristics", "Composition (mEq/L)", "Common abnormalities"],
          [
            ["Secretory", "Cholera, Escherichia coli, or Clostridioides difficile", "Electrolyte-rich fluid with high Na⁺, Cl⁻, K⁺ and HCO₃", "Na⁺ 100–130, Cl⁻ 90–100, K⁺ 9–30, HCO₃ 20–33", "Hyponatraemia, hypokalaemia, metabolic acidosis"],
            ["Osmotic", "Lactulose, magnesium sulfate, sorbitol, or polyethylene glycol (PEG)", "Electrolyte-poor watery diarrhoea with low Na⁺, Cl⁻, K⁺ and HCO₃", "Na⁺ 10–36, Cl⁻ 2–10, K⁺ 9–30, HCO₃ 2–7", "Hypokalaemia, hypernatraemia"],
            ["Congenital chloride diarrhoea", "Defect in the apical Cl⁻/HCO₃ exchanger", "Watery diarrhoea with high chloride", "Na⁺ >100, Cl⁻ >90, K⁺ >10", "Metabolic alkalosis with hypochloraemia, hypokalaemia"],
          ],
          "Table 34.3 Characteristics of diarrhoeal fluids and electrolyte abnormalities (p408)",
          "Potassium is printed as 9–30 mEq/L for both the electrolyte-rich and the electrolyte-poor type, in the table and the text."
        ),
        points([
          "Hypovolaemia: secretory diarrhoea (E. coli, Vibrio cholerae, rotavirus) increases small-bowel secretion; osmotic diarrhoea (poorly absorbed solutes, or malabsorption in children — printed as \"glucose or lactate\") decreases absorption; vomiting or fever adds water loss.",
          "Sodium: every patient has a sodium deficit; the ratio of sodium to water lost sets serum sodium. Most have isotonic dehydration. Hyponatraemia is common in severe diarrhoea — volume depletion stimulates ADH, and drinking water or hypotonic fluids, or receiving hypotonic IV fluid (e.g. 5% dextrose), lowers sodium. Large-volume osmotic diarrhoea loses more water than sodium and can cause hypernatraemic dehydration, uncommon in alert patients who can respond to thirst and reach water.",
          "Hypokalaemia: common, because diarrhoeal fluid is rich in potassium; secondary hyperaldosteronism from hypovolaemia adds renal and intestinal loss. Serum potassium can mislead: acidosis shifts potassium out of cells, so it may be normal or even high despite a body deficit.",
          "Metabolic acidosis: normal anion gap acidosis is common, as fluid secreted beyond the pylorus is rich in bicarbonate. In a few, severe hypovolaemia causes lactic acidosis or renal failure and a high anion gap acidosis, which worsens rapidly when the kidneys cannot compensate.",
          "Hyperchloraemia: the ileal and colonic Cl/HCO₃ exchanger absorbs chloride as bicarbonate is secreted, and sodium chloride co-absorption by gut and kidney adds to it.",
        ]),
        quote("with sodium (Na⁺) levels ranging from 100 to 130 mEq/L", "408"),
        quote("featuring sodium (Na⁺) levels between 10 and 36 mEq/L", "408"),
        quote("In severe diarrhea, hyponatremia is common, while hypernatremia occurs in very few patients", "409"),
        quote("Normally, 8-15 mEq potassium ions are excreted in stool daily", "409"),
        quote("serum potassium may be normal (or even high) despite the loss of total exchangeable body potassium", "409"),
      ],
    },
    {
      id: "diarrhoea_management",
      title: "Diarrhoea: management",
      blocks: [
        steps([
          "Aetiological treatment: search for and treat the specific cause (the printed sentence again reads \"to prevent or aggravate disturbances\").",
          "Correct dehydration.",
          "Correct the sodium deficit, which indirectly prevents potassium loss and chloride retention.",
          "Treat hypokalaemia and metabolic acidosis together.",
        ], "Goals of fluid therapy"),
        caution([
          "Treating the acidosis without potassium in a hypokalaemic patient may cause dangerous hypokalaemia; giving potassium without addressing the acidosis can cause dangerous hyperkalaemia.",
          "Do not replace diarrhoeal losses wholly with electrolyte-free drinks (water, glucose water, tea, soft drinks, fruit drinks): they can cause hyponatraemia and do not correct hypovolaemia.",
          "Hypotonic fluids (Isolyte-M, Isolyte-P, 5% dextrose) are usually avoided, as hyponatraemia is common. Electrolyte-free IV fluids such as 5% or 10% dextrose are called unacceptable and harmful; rapid large volumes of 5% dextrose can cause hyperglycaemia, osmotic diuresis and further loss. The exception is the small group with hypernatraemic dehydration, who may need hypotonic fluid.",
        ]),
        points([
          "Oral rehydration therapy is the preferred first choice: available, simple and safe. ORS provides sodium, potassium, chloride and bicarbonate with glucose; glucose absorption carries sodium and water across the upper intestine even in infective diarrhoea. Chapter 50 covers ORT in detail.",
          "IV fluid is indicated for severe dehydration and shock, persistent vomiting preventing ORS, or ORT failing against greater losses. Start ORS as soon as the patient can drink.",
          "Preferred IV fluids are Ringer's lactate and normal saline; none is ideal, and some patients need potassium and/or bicarbonate added.",
        ], "Oral and IV rehydration"),
        table(
          ["Fluid", "What it gives", "What it lacks or risks"],
          [
            ["Ringer's lactate (WHO preferred for severe diarrhoea)", "Sodium 130 mEq/L; bicarbonate 28 mEq/L by hepatic conversion of lactate; some potassium. Better clinical response and faster correction of hypokalaemia, bicarbonate and pH than saline", "Potassium only 4 mEq/L and no glucose: needs glucose (oral or IV) to meet calories and prevent hypoglycaemia; may need added potassium and at times bicarbonate"],
            ["Normal saline", "Corrects hypovolaemia; supplies sodium and water, suppressing aldosterone and further urinary potassium loss; restored renal perfusion lets the kidney correct acidosis", "No potassium, no base. Chloride 154 mEq/L: large volumes risk hyperchloraemic metabolic acidosis, and hyperchloraemia risks acute kidney injury"],
          ],
          "IV fluids for diarrhoeal deficits",
          "The text compares saline's 154 mEq/L chloride with \"100 mEq/L serum sodium\"; the comparison reads as if serum chloride was meant. Kept as printed."
        ),
        quote("The World Health Organization (WHO) recommends Ringer lactate as the preferred IV fluid to correct dehydration due to severe diarrhea", "411"),
        quote("An adequate concentration of sodium (130 mEq/L).", "411"),
        quote("An adequate (28 mEq/L) bicarbonate (by hepatic conversion of lactate)", "411"),
        quote("the potassium concentration of RL is low just 4 mEq/L) and does not contain glucose.", "412"),
        quote("rich in chloride (154 mEq/L compared to 100 mEq/L serum sodium)", "412"),
        quote("hypotonic fluids like Isolyte M, Isolyte P, and 5% dextrose are usually avoided.", "412"),
      ],
    },
    {
      id: "ugib_presentation",
      title: "Upper GI bleeding: causes and presentations",
      intro: "Bleeding proximal to the ligament of Treitz. The most common GI emergency requiring hospital admission.",
      blocks: [
        points([
          "Causes: peptic ulcer disease (about 47%), oesophageal varices from portal hypertension, acute erosive gastritis, gastric cancer, lower oesophageal tear (Mallory-Weiss syndrome), and others.",
          "Haematemesis: vomiting fresh blood or coffee-ground material.",
          "Melaena: black, tarry stool; may follow a loss of as little as 50-100 mL.",
          "Haematochezia: fresh red or maroon blood per rectum in a few patients with acute massive upper GI bleeding (usually >1000 mL) and rapid transit.",
          "Other symptoms: epigastric pain, weakness, dizziness, orthostatic hypotension; in severe cases syncope and shock.",
        ]),
        quote("peptic ulcer disease (about 47%)", "412"),
        quote("melena may develop after losing as little as 50-100 ml of blood.", "412"),
        quote("upper GI bleed (usually >1000 mL)", "412"),
      ],
    },
    {
      id: "ugib_assessment",
      title: "Upper GI bleeding: initial assessment",
      intro: "Assess haemodynamic status, resuscitate and stabilise first; then look for the cause and plan specific therapy.",
      blocks: [
        table(
          ["Finding", "Suggests"],
          [
            ["Resting tachycardia", "Mild to moderate hypovolaemia (loss of less than 15% of total blood volume)"],
            ["Supine hypotension (systolic BP less than 100 mmHg)", "Severe, life-threatening acute bleeding (loss of approximately 40% of total blood volume)"],
            ["Postural hypotension (SBP fall >20 mmHg and/or heart rate rise >20 beats/min, supine to standing)", "Loss of 15% or more of total blood volume"],
          ],
          "Haemodynamic assessment",
          "A patient can be stable lying flat despite significant loss, so always look for postural change."
        ),
        points([
          "Complete blood count: a fall in haemoglobin supports the diagnosis, but a normal value does not exclude loss — it may stay normal early until haemodilution — and haemoglobin is not a reliable guide to severity. With active bleeding, repeat it every 2-8 hours depending on severity.",
          "Coagulation (INR, partial thromboplastin time): detects coagulopathy from liver dysfunction or anticoagulants.",
          "Blood group and cross-match at least two units if a significant bleed is suspected.",
          "Metabolic profile: AST, ALT, albumin, creatinine, blood urea nitrogen.",
          "History: severity of loss, likely source, comorbidity (malignancy, COPD, coronary artery disease), and medicines — anticoagulants (heparin, warfarin, dabigatran, rivaroxaban, apixaban), antiplatelets (clopidogrel, aspirin) and NSAIDs.",
        ], "Laboratory tests and history"),
        quote("Resting tachycardia usually suggests mild to moderate hypovolemia (loss of less than 15% of total blood volume)", "413"),
        quote("Supine hypotension (systolic blood pressure less than 100 mm Hg)", "413"),
        quote("(loss of approximately 40% of total blood volume)", "413"),
        quote("fall in systolic blood pressure (SBP) >20 mm Hg and/or increase in heart rate of >20 beats/min", "413"),
        quote("a loss of 15% or more of total blood volume", "413"),
        quote("monitor hemoglobin levels serially (every 2-8 hours)", "413"),
        quote("Blood group and cross-matching of at least two units of blood", "413"),
      ],
    },
    {
      id: "ugib_stabilisation",
      title: "Upper GI bleeding: stabilisation",
      blocks: [
        steps([
          "Intravenous access: with significant bleeding, at least two large-bore peripheral cannulas (18 gauge or larger), or urgent central access.",
          "Fluid resuscitation, the first and most crucial step: at least 500 mL of crystalloid (normal saline or Ringer's lactate) to maintain blood pressure; rapid crystalloid in major bleeding until blood arrives. If hypotension persists or worsens, increase the rate and start vasopressors for temporary support.",
          "Oxygen by nasal cannula for hypoxia, to keep SpO₂ ≥94% (transcribed as \"SpO,\").",
          "Nil by mouth, in preparation for urgent endoscopy.",
          "Foley catheter to monitor urine output.",
          "Endotracheal intubation for those at high risk of aspiration: altered mental status, massive or anticipated massive bleeding.",
        ]),
        caution([
          "Colloids are not supported for resuscitation: potential kidney injury, coagulopathy and anaphylaxis, with no benefit over crystalloids.",
        ]),
        points([
          "The transcription interleaves the two columns of p413: the \"Intravenous access\" bullet appears mid-way through the complete blood count bullet. It belongs under Stabilisation, where it is placed here.",
        ]),
        quote("inserting at least two large-bore peripheral catheters (18 gauge or larger)", "414"),
        quote("should be administered at least 500mL of readily available", "414"),
        quote("Current evidence does not support the use of colloids for resuscitation", "414"),
        quote("require oxygen supplementation by nasal cannula to keep SpO, ≥94%", "414"),
      ],
    },
    {
      id: "ugib_transfusion",
      title: "Upper GI bleeding: blood transfusion and coagulopathy",
      intro: "Decide on transfusion from presentation, vital signs, nasogastric aspirate, initial haemoglobin and its rate of fall, and comorbidity.",
      blocks: [
        table(
          ["Situation", "Transfusion in the text"],
          [
            ["Haemodynamically unstable, signs of haemorrhagic shock", "Begin transfusion without delay, before the haemoglobin result; do not withhold in massive bleeding on the haemoglobin level; transfuse urgently even at higher haemoglobin"],
            ["Haemodynamically stable adult", "Red cells if haemoglobin <7 g/dL (restrictive threshold, recommended over a liberal 9.0-10.0 g/dL)"],
            ["High risk (pre-existing cardiovascular disease, older adults)", "Red cells at a higher haemoglobin, <8 g/dL"],
            ["Goal in stable patients", "Haemoglobin 8-9 g/dL"],
            ["Stable, no active bleeding", "One unit of packed red cells at a time, then reassess; each unit raises haemoglobin by roughly 1 g/dL"],
          ],
          "When to transfuse, and to what"
        ),
        caution([
          "Avoid over-transfusion (e.g. haemoglobin >9 g/dL): it raises rebleeding and mortality, especially in variceal bleeding, where volume expansion raises portal venous pressure.",
        ]),
        points([
          "INR greater than 2.5 with active bleeding: traditionally fresh frozen plasma and vitamin K. Current literature favours prothrombin complex concentrate over FFP for severe coagulopathy (more factor, low volume, faster onset, safer, convenient); cost and availability limit it.",
          "Platelets <50,000 with active bleeding: platelet transfusion is indicated. Platelet transfusion for antiplatelet-drug dysfunction with a normal count is traditional, but recent studies do not support the benefit.",
          "Massive transfusion: 10 units of red cells within 24 hours, or three units within one hour. The protocol gives a balanced transfusion approximating whole blood — one unit plasma, one platelets, one red cells (1:1:1) — to avoid dilutional coagulopathy, acidosis and hypothermia.",
        ], "Coagulopathy, platelets and massive transfusion"),
        quote("Red blood cells (RBC) transfusion is recommended if the hemoglobin level is <7 gm/dL for hemodynamically stable hospitalized adult patients", "414"),
        quote("be transfused urgently, even at higher hemoglobin levels", "414"),
        quote("upper Gi bleeding need blood transfusion at a higher value of hemoglobin (<8 gm/ dL)", "415"),
        quote("maintain hemoglobin between 8-9 gm/ dL in stable patients", "415"),
        quote("Over-transfusion (e.g., hemoglobin >9 gm/dL) increases the risk of rebleeding and mortality", "415"),
        quote("administer just one unit of packed red blood cells (PRBCs) at a time", "415"),
        quote("Each unit of packed red blood cells roughly increases 1 gm of hemoglobin.", "415"),
        quote("with INR greater than 2.5 are traditionally treated with fresh frozen plasma", "415"),
        quote("When the platelet count is <50,000 in actively bleeding patients, platelet transfision is indicated.", "415"),
        quote("10 units of red cells within 24 hours or three units of red cells within one hour", "415"),
        quote("one unit of plasma, one unit of platelets, and one unit of red blood cells (1:1:1 ratio)", "415"),
      ],
    },
    {
      id: "ugib_medications",
      title: "Upper GI bleeding: medications",
      blocks: [
        table(
          ["Drug", "Dose and timing in the text", "Notes"],
          [
            ["PPI before endoscopy (esomeprazole or pantoprazole)", "80 mg IV bolus immediately after starting fluid resuscitation", "Helps clot formation and downstages the lesion, reducing endoscopic haemostasis; no benefit in rebleeding, surgery or mortality, so routine use is conflicting"],
            ["PPI after endoscopy (peptic ulcer)", "High dose 8 mg/h continuous infusion for 72 hours; then, without bleeding, oral twice daily for 14 days, then once daily for four to eight weeks", "Rebleeding risk is highest in the first 72 hours"],
            ["Erythromycin", "Single dose 250 mg IV over 20 to 30 minutes, 30 to 120 minutes before endoscopy", "Recommended: better visualisation, fewer second endoscopies, may shorten stay. Avoid with prolonged QTc"],
            ["Vasoactive drugs (terlipressin, somatostatin, octreotide, vapreotide)", "Start as soon as bleeding is suspected in cirrhosis with oesophageal varices", "Improve bleeding control, transfusion need, stay and in-hospital mortality; not recommended in non-variceal bleeding. Terlipressin widely used; octreotide used in the USA before September 2022"],
            ["Antibiotics in cirrhosis (variceal or other bleeding)", "Usual first choice ceftriaxone 1 g IV daily for seven days", "Reduce infection, rebleeding, mortality and stay; recent literature suggests quinolones and beta-lactams alone or combined"],
          ],
          "Medications"
        ),
        caution([
          "Antacids and H2-receptor antagonists (printed \"H⁺ 2-receptor\") are not recommended in acute upper GI bleeding.",
          "Metoclopramide is not recommended: the evidence is scanty.",
          "Tranexamic acid is not recommended: no benefit and a possible increase in venous thromboembolism.",
          "Vasoactive drugs are not recommended in non-variceal bleeding (e.g. peptic ulcer).",
        ]),
        quote("80 mg IV bolus) immediately after initiating fluid resuscitation and before endoscopy", "415"),
        quote("pre-endoscopy PPIs are without benefits in rebleeding,", "415"),
        quote("So high-dose (8 mg/h) PPI therapy is recommended as a continuous infusion for 72 hours post-endoscopy", "416"),
        quote("given twice daily for 14 days, followed by a once-daily dose for four to eight weeks", "416"),
        quote("The use of antacids and H⁺ 2-receptor antagonists is not recommended", "416"),
        quote("(250 mg intravenously over 20 to 30 minutes), given 30 to 120 minutes before endoscopy", "416"),
        quote("it should be avoided in patients with prolonged QTc intervals.", "416"),
        quote("these drugs are not recommended in non-variceal upper gastrointestinal", "416"),
        quote("ceftriaxone 1 gm IV daily for seven days", "416"),
        quote("current literature does not recommend the use of tranexamic acid", "416"),
      ],
    },
    {
      id: "ugib_ng_endoscopy",
      title: "Upper GI bleeding: nasogastric tube and endoscopy",
      blocks: [
        points([
          "Nasogastric aspiration or lavage is no longer recommended: painful, a negative aspirate does not exclude upper GI bleeding, it does not change rebleeding or mortality, and it can harm. In selected patients it may help tell upper from lower GI bleeding or clear blood and clots before emergency endoscopy.",
          "Endoscopy localises the bleeding site, stratifies risk and treats high-risk and active bleeding. Perform it after resuscitation, haemodynamic stabilisation and optimising comorbidity.",
          "Endoscopic therapy is recommended for high-risk lesions: ulcers with active spurting or oozing, and non-bleeding visible vessels.",
          "Non-variceal methods: sclerosant injection (epinephrine or absolute ethanol) and thermal therapies (bipolar electrocoagulation, heater probe) or endoscopic clips. Variceal band ligation is the method of choice for oesophageal variceal bleeding.",
        ]),
        table(
          ["Timing", "Guidance in the text"],
          [
            ["Early: ≤24 hours from presentation, usually 12-24 hours, after resuscitation", "Strongly recommended; reduces transfusion, rebleeding, mortality, surgery, stay and cost"],
            ["Delayed: >24 hours", "Avoid; higher mortality and longer stay"],
            ["Urgent: ≤12 hours", "Not favoured over early endoscopy; conflicting results"],
            ["Emergent: ≤6 hours", "Not recommended; no benefit or possibly worse outcomes"],
          ],
          "Timing of endoscopy",
          "The transcription splits the urgent-endoscopy bullet across the columns of p417 (\"Recent evidence does not favor urgent\" sits beside the tranexamic acid line)."
        ),
        quote("nasogastric aspiration/lavage is not recommended in patients with acute upper Gi bleeding", "417"),
        quote("(≤24 hours from the time of patient presentation, usually between 12-24 hours)", "417"),
        quote("Avoid delayed endoscopy (>24 hours)", "417"),
        quote("(≤12 hours) upper GI endoscopy compared to early endoscopy because of conflicting results", "417"),
        quote("Emergent endoscopy (performed ≤6 hours from the time of patient", "417"),
        quote("The endoscopic method of choice is variceal band ligation", "417"),
      ],
    },
    {
      id: "ugib_risk_monitoring",
      title: "Upper GI bleeding: specific treatment, risk and monitoring",
      blocks: [
        points([
          "Specific treatment: establish the underlying cause and plan further treatment from it.",
          "The Glasgow-Blatchford score (GBS) is recommended to stratify patients into higher or lower risk of poor outcome, guiding urgency and management.",
          "High risk, with poor outcomes: GBS ≥8–12, persistent bloody vomiting, bloody gastric aspirate, tachycardia, hypotension, and comorbidity such as cirrhosis.",
          "Monitoring: close observation with frequent haemodynamic measurements, hourly urine output, watching for haematemesis, haematochezia or persistent melaena, and haemoglobin every two to eight hours.",
          "The transcription ends at book page 418 with the Monitoring paragraph, the last heading in the contents list; that paragraph reads as complete. Page 419 onward was not transcribed.",
        ]),
        quote("The glasgow blatchford score (GBS) is currently recommended", "417"),
        quote("GBS ≥8–12, persistent bloody vomiting", "418"),
        quote("every two to eight hourly monitoring of hemoglobin.", "418"),
      ],
    },
  ],
};
