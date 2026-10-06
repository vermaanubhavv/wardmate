import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPERKALAEMIA — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 23 of the full edition. Every number below is the book's; the quotes give
 * the printed book page it came from.
 */
export const hyperkalaemiaV1: FluidTopic = {
  id: "hyperkalaemia",
  version: "1.0.0",
  title: "Hyperkalaemia: emergency treatment and lowering potassium",
  group: "electrolytes",
  summary: "Protect the heart with calcium, shift potassium with insulin-dextrose and salbutamol, remove it with diuretics, binders or dialysis, and keep RAAS blockers safe.",
  setting: "Adult medical and surgical wards",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["23 Hyperkalemia"], pages: "269–283", pageKind: "book" },
  sections: [
    {
      id: "what",
      title: "What it is",
      blocks: [
        points([
          "Hyperkalaemia is a serum potassium greater than 5.5 mEq/L.",
          "Rare in the general population; more common in CKD, heart failure, diabetes and with renin-angiotensin-aldosterone system inhibitors (RAASi).",
          "Linked to more hospitalisations, cardiovascular events and all-cause mortality. Acute severe hyperkalaemia can cause arrhythmia, cardiac arrest and death.",
          "CKD is the most common risk factor, and hyperkalaemia is the most common electrolyte disturbance in CKD; its prevalence rises as CKD advances.",
        ]),
        quote("A serum potassium level greater than 5.5 mEq/L is considered hyperkalemia.", "269"),
        quote("CKD is the most common risk factor for hyperkalemia", "269"),
      ],
    },
    {
      id: "severity",
      title: "Severity grades",
      intro: "Table 23.4 grades acute hyperkalaemia by serum potassium and ECG changes, as printed.",
      blocks: [
        table(
          ["Severity of hyperkalaemia", "Serum K+ concentration and ECG changes"],
          [
            ["Mild", "Serum K+ 5.0–5.9 mEq/L, no ECG changes"],
            ["Moderate", "Serum K+ 6.0–6.4 mEq/L, no ECG changes; or serum K+ 5.0–5.9 mEq/L with ECG changes"],
            ["Severe", "As printed: no ECG changes; serum K+ 6.0–6.4 mEq/L with ECG changes"],
          ],
          "Table 23.4 Classification of severity of acute hyperkalaemia",
          "The Severe row is incomplete in the source as transcribed (its first potassium range is missing). The Mild grade starts at 5.0 mEq/L, while the text defines hyperkalaemia as greater than 5.5 mEq/L; both are the book's."
        ),
        quote("Serum K+ 5.0-5.9 mEq/L, No ECG changes", "274"),
        quote("Serum K+ 6.0-6.4 mEq/L, No ECG changes", "274"),
      ],
    },
    {
      id: "causes",
      title: "Causes",
      intro: "Most common: renal dysfunction (acute or chronic), drugs impairing potassium excretion, diabetes, cell lysis, and pseudohyperkalaemia.",
      blocks: [
        table(
          ["Mechanism", "Causes"],
          [
            ["1. Increased potassium intake", "IV fluid containing potassium; high-potassium foods (rare unless renal dysfunction); potassium-containing drugs"],
            ["2. Tissue breakdown", "Bleeding into soft tissue, GI tract or body cavities; haemolysis, rhabdomyolysis, tumour lysis syndrome; catabolic state"],
            ["3. Shift of potassium out of cells", "Tissue damage (ischaemia or shock), severe exercise; metabolic acidosis; poorly controlled diabetes (insulin deficiency, hyperglycaemia, hyperosmolality); aldosterone deficiency; hyperkalaemic periodic paralysis, succinylcholine"],
            ["4. Impaired potassium excretion", "AKI or CKD; potassium-sparing diuretics, ACE inhibitors, ARBs, NSAIDs, heparin, cyclosporine; reduced tubular excretion: Addison's disease, hyporeninaemic hypoaldosteronism (diabetic nephropathy, interstitial nephritis, type 4 RTA, NSAIDs), amyloidosis; effective circulatory volume depletion"],
            ["5. Pseudohyperkalaemia", "Haemolysis of blood samples; prolonged tourniquet or fist clenching; marked thrombocytosis or leucocytosis"],
          ],
          "Table 23.1 Causes of hyperkalaemia"
        ),
        table(
          ["Group", "Drugs"],
          [
            ["Impair renal potassium excretion", "Potassium-sparing diuretics; ACE inhibitors, ARBs; NSAIDs and COX-2 inhibitors; calcineurin inhibitors; heparin; trimethoprim"],
            ["Promote transcellular potassium shift", "Nonselective beta blockers; digitalis; succinylcholine"],
          ],
          "Table 23.2 Drug-induced hyperkalaemia"
        ),
        points([
          "Potassium-sparing diuretics are the common cause: spironolactone and eplerenone block aldosterone receptors; amiloride and triamterene block ENaC.",
          "ACE inhibitors and ARBs cut aldosterone release, especially in renal compromise. NSAIDs and COX-2 inhibitors cause hyporeninaemic hypoaldosteronism and lower renal blood flow and GFR.",
          "Calcineurin inhibitors (cyclosporin, tacrolimus) reduce aldosterone synthesis and distal potassium secretion. Heparin inhibits aldosterone synthesis. Trimethoprim blocks distal ENaC like amiloride.",
          "Nonselective beta-blockers (propranolol, labetalol) block beta-2 mediated uptake. Digitalis toxicity inhibits Na-K-ATPase, dose-dependent. Succinylcholine depolarises muscle with large potassium efflux.",
          "Diabetes: hyporeninaemic hypoaldosteronism (type 4 RTA); shift out of cells in DKA (lack of insulin, hyperosmolality, acidosis); obstruction, volume depletion and co-prescribed ACEI, ARBs, nonselective beta-blockers, NSAIDs, heparin.",
          "Dietary potassium rarely causes hyperkalaemia unless renal function is impaired.",
        ], "Drugs and other causes"),
      ],
    },
    {
      id: "pseudo",
      title: "Pseudohyperkalaemia",
      blocks: [
        points([
          "Suspect it when the patient is asymptomatic, renal function is normal, ECG changes are absent and the cause is unexplained.",
          "During collection: tight tourniquet for long, repeated fist-clenching, small-bore needles, traumatic venepuncture. After collection: haemolysis, platelets >500,000/µL or white cells 70,000/µL, high storage temperature, pressurised centrifugation.",
          "To exclude it, measure plasma potassium (heparin tube) on a carefully drawn sample alongside serum (clot activator tube).",
          "Serum potassium higher than plasma by more than 0.4 mEq/L, drawn simultaneously, points to pseudohyperkalaemia.",
          "Reverse pseudohyperkalaemia: plasma potassium falsely higher than serum, commonly from extreme leucocytosis such as CLL.",
        ]),
        quote("serum potassium is higher than plasma potassium (difference greater than 0.4 mEq/L) when both samples are obtained simultaneously", "272"),
        quote("marked elevated platelet (>500,000/uL) or white blood cells (70,000/uL)", "272"),
      ],
    },
    {
      id: "clinical",
      title: "Clinical features",
      blocks: [
        points([
          "Correlation between level and symptoms is poor, but severe hyperkalaemia of rapid onset is always symptomatic. Often asymptomatic until 6.5 to 7.0 mEq/L; at 7.0 mEq/L or more, serious neuromuscular and conduction problems are common.",
          "Neuromuscular: fatigue and weakness first; hyporeflexia and ascending paralysis (legs, trunk, arms, face, rarely respiratory muscles); patient stays alert as cranial-nerve muscles are spared; circumoral paraesthesia, fasciculations. Reduced ammonium excretion may cause metabolic acidosis.",
          "Cardiac: usually no signs; palpitation in a few; bradycardia is an important clue in severe hyperkalaemia.",
          "ECG changes usually appear above 7.2 mEq/L, but track the rate of rise more than the level: early (6 to 7 mEq/L) in rapid onset, while chronic hyperkalaemia may show a normal ECG above 7 mEq/L. A normal ECG does not exclude hyperkalaemia.",
        ]),
        quote("Hyperkalemia is often asymptomatic until serum potassium concentration is above 6.5 to 7.0 mEq/L.", "272"),
        quote("ECG changes usually occur when serum potassium levels are above 7.2 mEq/L", "273"),
        quote("ECG changes occur early (potassium 6 to 7 mEq/L) with rapid onset hyperkalemia", "273"),
      ],
    },
    {
      id: "ecg",
      title: "ECG by level",
      blocks: [
        steps([
          "Tall, peaked, narrow T-waves: the earliest sign.",
          "P-wave widening and flattening, PR prolongation, loss of P-waves.",
          "Progressive QRS widening and ST depression, merging with T-waves into a sine wave.",
          "Sine wave: ominous, predicts imminent ventricular fibrillation and asystole.",
          "Bradycardia and arrhythmias: sinus bradycardia, sinus arrest, slow junctional and ventricular escape rhythms, VT or VF, asystole.",
        ], "Usual sequence"),
        table(
          ["Serum potassium", "Common ECG findings"],
          [
            ["5.5–6.5 mEq/L", "Tall 'tented' narrow-based T-waves"],
            ["6.5–7.0 mEq/L", "Prolonged PR interval, P-wave widening and loss, widening of QRS complex"],
            ["7.0–9.0 mEq/L", "Bradyarrhythmia, bizarre QRS complex, sine waves (QRS merges with T-waves)"],
            [">9.0 mEq/L", "Atrioventricular dissociation, ventricular tachycardia or fibrillation, and cardiac standstill"],
          ],
          "Table 23.3 ECG findings of hyperkalaemia"
        ),
        quote("5.5-6.5 mEq/L Tall 'tented' narrow-based T-waves", "273"),
        quote(">9.0 mEq/L Atrioventricular dissociation, ventricular tachycardia or fibrillation, and cardiac standstill", "273"),
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis and finding the cause",
      blocks: [
        points([
          "Suspect it in high-risk patients (renal failure, potassium-sparing diuretics, ACE inhibitors, ARBs) with new fatigue and weakness. Serum potassium greater than 5.5 mEq/L is diagnostic.",
          "History and examination settle most causes: renal failure, drugs, diet and supplements, pseudohyperkalaemia. Examine vitals, urine output and volume status for ECF depletion, and respiratory and other muscle weakness.",
          "Asymptomatic, normal ECG and no clue to the cause: exclude pseudohyperkalaemia first.",
        ]),
        table(
          ["Test performed", "Etiology diagnosed or excluded"],
          [
            ["Electrolytes", "The basic test for diagnosis"],
            ["CBC", "Anaemia, haemolysis, leucocytosis, leukaemia, thrombocytopenia"],
            ["ECG", "Changes of hyperkalaemia"],
            ["Blood urea, creatinine", "AKI or CKD"],
            ["Creatine kinase (CPK)", "Rhabdomyolysis"],
            ["Arterial blood gas (ABG)", "Normal anion gap hyperchloraemic metabolic acidosis"],
            ["Blood sugar", "Diabetes"],
            ["Plasma cortisol, ACTH stimulation test", "Adrenal insufficiency"],
          ],
          "Table 23.5 Investigations to establish the etiological diagnosis"
        ),
        points([
          "TTKG was used earlier (a value <7 may indicate hypoaldosteronism) but is no longer reliable and is not recommended for hyperkalaemia.",
          "Use the spot urine K+/creatinine ratio instead: helpful in acute, less useful in chronic hyperkalaemia.",
          "Ratio >200 mEq/g or >20 mmol/mmol: appropriate renal response, a clue to a non-renal cause. A low ratio indicates a renal defect (CKD, volume depletion, hyporeninaemic hypoaldosteronism).",
          "In chronic hyperkalaemia, a 24-hour urine collection is needed instead, avoiding diurnal variation.",
        ], "Urine potassium excretion"),
        quote("TTKG was not found to be reliable and therefore is currently not recommended in evaluating hyperkalemia", "275"),
        quote("urine K⁺/creatinine ratio >200 mEq/g or >20 mmol/mmol suggests an appropriate renal response", "275"),
      ],
    },
    {
      id: "overview",
      title: "Treatment at a glance",
      intro: "Urgency depends on clinical status, ECG changes and severity. Goals: stabilise the myocardium, shift potassium into cells, remove it from the body, and treat the cause.",
      blocks: [
        table(
          ["Step", "Medication", "Mechanism", "Onset", "Duration", "Caution"],
          [
            ["1. Protect the heart", "IV calcium (10 ml of 10%)", "Cardiac membrane stabilisation", "Immediate", "30–60 minutes", "Do not co-administer with bicarbonate (precipitates in the line). Risk of worsening digitalis toxicity and hypercalcaemia"],
            ["2. Redistribution", "IV insulin plus dextrose (10 units + 50 ml of 50% dextrose)", "Shift K+ from ECF to ICF", "10–20 minutes", "4–6 hours", "High risk of hypoglycaemia: monitor blood glucose closely"],
            ["2. Redistribution", "Nebulised albuterol (salbutamol) (20 mg in 4 ml)", "Shift K+ from ECF to ICF", "20–30 minutes", "2–4 hours", "Risk of tachycardia"],
            ["2. Redistribution", "Isotonic bicarbonate (150 ml of NaHCO3 in 1 L D5W)", "Shift K+ from ECF to ICF", "4–6 hours", "During infusion", "Selectively, not routinely: risk of volume overload. Only if metabolic acidosis"],
            ["3. Remove K+", "IV furosemide (60–120 mg)", "Urinary potassium excretion", "15 minutes", "2–3 hours", "Correct hypovolaemia simultaneously; avoid volume depletion"],
            ["3. Remove K+", "K+ binders: patiromer, SZC or SPS", "Increases GI potassium excretion", "2–24 hours", "4–6 hours", "Slow onset, not suitable for acute management"],
            ["3. Remove K+", "Haemodialysis", "Extracorporeal elimination", "Immediate", "Few hours", "Needs vascular access; not readily available everywhere"],
          ],
          "Table 23.6 Treatment of hyperkalaemia: emergency management",
          "Subsequent management for chronic hyperkalaemia (same table): restrict dietary potassium, treat identifiable causes, stop drugs that raise potassium, correct hypovolaemia, continue GI cation exchangers. The table prints bicarbonate as 150 ml of NaHCO3 while the text prints 150 mEq (three 50 ml ampoules of 8.4%); the table prints salbutamol as 20 mg while the text gives 10–20 mg."
        ),
        caution([
          "Calcium, insulin-dextrose, salbutamol and bicarbonate do not remove potassium from the body; they are not preferred for stable, asymptomatic chronic hyperkalaemia.",
        ]),
        quote("IV insulin plus dextrose (10 units + 50 ml of 50% dextrose)", "276"),
        quote("IV furosemide (60–120 mg)", "276"),
        quote("Nebulized albuterol (salbutamol) (20 mg in 4 ml)", "276"),
      ],
    },
    {
      id: "calcium",
      title: "Step 1: protect the heart with calcium",
      blocks: [
        table(
          ["Preparation", "Elemental calcium per 10 ml of 10%", "Use"],
          [
            ["Calcium gluconate", "93 mg, 2.2 mmol, 4.5 mEq", "First line. 10–20 ml (1–2 ampoules) over 2 to 3 minutes via a large peripheral vein with continuous ECG monitoring"],
            ["Calcium chloride", "273 mg, 6.8 mmol, 13.6 mEq", "Three times the calcium; single dose instead of sequential gluconate doses; irritates veins and causes necrosis on extravasation, so needs a central line"],
          ]
        ),
        points([
          "Effect begins within minutes and lasts 30–60 minutes. Repeat if ECG changes persist after 5–10 minutes or recur after improvement.",
          "Equivalent initial dosing per current recommendations: 10 ml (1 g) calcium chloride or 30 ml (3 g) calcium gluconate.",
          "Calcium does not lower potassium: never use it alone; combine with temporary and definitive measures.",
        ]),
        caution([
          "Digitalis: calcium may precipitate digitalis-induced arrhythmia. Use cautiously and selectively; give 10 mL of 10% calcium gluconate in 100 mL of dextrose 5% slowly over 20 to 30 minutes. Human studies did not link calcium in digitalis toxicity to adverse outcomes.",
          "Never let calcium and bicarbonate meet in a needle, syringe or line: chalky precipitate.",
        ]),
        quote("The usual dose is 10-20 ml (1-2 ampules) infused over 2 to 3 minutes via a large peripheral vein", "276"),
        quote("The dose can be repeated if the ECG changes persist after 5-10 minutes", "276"),
        quote("10 ml, 1 gm of IV calcium chloride, or 30 ml, 3 gm of IV calcium gluconate", "277"),
        quote("10 mL of 10% calcium gluconate in 100 mL of dextrose 5%", "277"),
        quote("Every 10 ml of 10% calcium chloride solution contains 273 mg, 6.8 mmol, or 13.6 mEq elemental calcium.", "277"),
        quote("contains 93 mg, 2.2 mmol, or 4.5 mEq elemental calcium", "276"),
      ],
    },
    {
      id: "insulin",
      title: "Step 2a: insulin and glucose",
      intro: "The first measure for lowering potassium rapidly: fast, reliable, dose-dependent, and works in CKD-ESRD.",
      blocks: [
        table(
          ["Method", "Regimen in the text", "Note"],
          [
            ["Bolus", "10 units regular insulin IV bolus, then 25 g glucose (50 ml of dextrose 50%, or 100 ml of dextrose 25%)", "Easier; earlier and greater effect; risk of hypoglycaemia"],
            ["Infusion", "10 units regular insulin in 500 mL of dextrose 10% over 60 minutes", "Less rebound hypoglycaemia and less vein irritation"],
          ]
        ),
        points([
          "Effect begins in 10–15 minutes, peaks at 60 minutes, lasts about 4 to 6 hours; lowers potassium by about 0.5 to 1.2 mEq/L. Repeat every two to four hours if hyperkalaemia persists.",
          "Do not give glucose without insulin: endogenous insulin is variable and hyperglycaemia can raise potassium.",
          "Glucose ≥250 mg/dL (14 mmol/L): give insulin alone, no glucose.",
          "Insulin with a beta-2 agonist is synergistic and reduces hypoglycaemia.",
        ]),
        caution([
          "Hypoglycaemia usually comes 60 to 150 min after the dose (peak 90 min). Check blood glucose every hour for about 5 to 6 hours.",
          "Higher risk: non-diabetics with pre-treatment glucose <126 mg/dL (7.0 mmol/L), renal failure (AKI, CKD 3–4, ESRD), low body weight, female sex, elderly.",
          "To reduce it: 5 units instead of 10; or 0.1 units/kg up to 10 units; or 50 g glucose instead of 25 g; or insulin as an infusion (e.g. 4 hours); or 10% dextrose at 50 mL/hour for 5 hours afterwards.",
        ], "Hypoglycaemia"),
        quote("10 units of regular insulin is administered as a bolus injection, followed by 25 gm of glucose infusion", "277"),
        quote("10 units of regular insulin is added to 500 mL of dextrose 10% and infused slowly over 60 minutes", "277"),
        quote("monitor blood glucose every hour for about 5 to 6 hours", "278"),
        quote("10% dextrose at 50 mL/hour for 5 hours", "278"),
        quote("serum glucose is ≥250 mg/dL or 14 mmol/L), avoid glucose administration and use insulin alone", "278"),
        quote("Regular insulin usually reduces plasma potassium concentration by about 0.5 to 1.2 mEq/L.", "278"),
      ],
    },
    {
      id: "salbutamol",
      title: "Step 2b: salbutamol",
      intro: "Give immediately after calcium and insulin. Simple, potent, safe and underused.",
      blocks: [
        points([
          "Nebulised: 10–20 mg in 4 ml of saline over 10 minutes. IV: 0.5 mg in 100 mL of 5% dextrose over 10 to 15 minutes.",
          "Use the lower 10 mg nebulised dose in ischaemic heart disease, tachyarrhythmia and open-angle glaucoma.",
          "Onset about 20 to 30 minutes, lasts 2 to 4 hours, lowers potassium by 0.5 to 1.5 mEq/L. With insulin the fall is about 1.2 to 1.5 mEq/L.",
          "Nebulised is preferred in the emergency department: no hypoglycaemia, fewer side effects (tremor, tachycardia, palpitations, headache) than IV.",
        ]),
        caution([
          "A common mistake is the bronchodilator dose (2.5–5.0 mg). The hyperkalaemia dose is 10–20 mg, 4 to 8 times greater.",
          "Do not use a beta-2 agonist alone in severe hyperkalaemia.",
        ]),
        quote("10-20 mg in 4 ml of saline by nebulization over 10 minutes or 0.5 mg diluted in 100", "278"),
        quote("the dose of salbutamol nebulization recommended for hyperkalemia is 10-20 mg", "279"),
        quote("reduces serum potassium by about 1.2 to 1.5 mEq/L", "279"),
      ],
    },
    {
      id: "bicarbonate",
      title: "Step 2c: sodium bicarbonate",
      blocks: [
        points([
          "Not routine: limited effect alone or combined, with side effects. Not recommended for acute emergency treatment as it takes several hours.",
          "Only with metabolic acidosis in patients who can take the sodium load: isotonic infusion of 150 mEq NaHCO3 (three 50 ml ampoules of 8.4%) in 1 L of dextrose 5%, over 4 to 6 hours, not a bolus.",
          "Ineffective without acidosis. An IV push of hypertonic bicarbonate is ineffective because the osmolality rise counteracts the pH effect.",
          "CKD-ESRD patients seldom respond and may not tolerate the sodium and volume.",
        ]),
        caution([
          "Side effects: hypernatraemia, hypocalcaemia, volume overload; excess alkali can provoke tetany.",
          "Keep apart from calcium gluconate in needle, syringe and infusion set.",
        ]),
        quote("150 mEq of NaHCO₃ Three 50 ml ampoule of 8.4% NaHCO₃ in 1 L of dextrose 5%", "279"),
        quote("in the absence of acidosis, bicarbonate is ineffective", "279"),
      ],
    },
    {
      id: "diuretics",
      title: "Step 3a: diuretics",
      blocks: [
        points([
          "Normal or mildly reduced renal function: loop diuretic, often with a thiazide. In euvolaemic or hypovolaemic patients, normal saline or isotonic bicarbonate alongside to prevent volume depletion.",
          "Moderate renal impairment: loop diuretics (furosemide, bumetanide) are most effective with volume overload. Limited effect in severe renal insufficiency.",
          "Adjust the dose to severity and renal function. Table 23.6 gives IV furosemide 60–120 mg, onset 15 minutes, lasting 2–3 hours.",
        ]),
        caution(["Avoid diuretics in hypovolaemic or oliguric hyperkalaemic patients."]),
        quote("Avoid the use of diuretics in hypovolemic or oliguric patients with hyperkalemia.", "280"),
        quote("IV furosemide (60–120 mg) Potassium excretion in urine 15 minutes 2–3 hours", "276"),
      ],
    },
    {
      id: "binders",
      title: "Step 3b: potassium binders",
      intro: "Newer binders matter most in drug-induced chronic hyperkalaemia, letting RAASi continue for their heart, kidney and mortality benefit.",
      blocks: [
        table(
          ["Feature", "Sodium polystyrene sulfonate (SPS)", "Patiromer", "Sodium zirconium cyclosilicate (SZC)"],
          [
            ["US FDA/EMA approval", "1958/NA", "2015/2017", "2018/2018"],
            ["Site of action", "Colon", "Distal colon", "Entire GI tract"],
            ["Exchange ion for K+", "Sodium", "Calcium", "Sodium and hydrogen"],
            ["Mechanism", "Sodium-potassium exchange resin", "Calcium-potassium cation exchange, also binds Mg2+", "Selectively binds potassium in exchange for Na+ and H+"],
            ["Onset", "Variable (hours to days)", "7 hours", "1 hour"],
            ["Duration", "4–24 hours", "12–48 hours", "2.2–12 hours"],
            ["Administration", "Oral suspension or enema", "Oral suspension", "Oral suspension"],
            ["Sodium content", "1500 mg or 65.25 mmol Na per 15 g dose", "None", "800 mg or 34.8 mmol Na per 10 g dose"],
            ["Sorbitol content", "20 g in each 15 g of SPS", "4 g in each 8.4 g of oral suspension", "None"],
            ["Initial dose", "Oral: 15 g, 1–4 times daily. Enema: 30 g every 6 hr", "Oral: 8.4 g once daily", "Oral: 10 g 3 times daily. Maintenance: 10 g once daily"],
            ["Separation from other drugs", "3 hr before or after", "3 hr before or after", "2 hr before or after"],
            ["Adverse effects", "Nausea, vomiting, constipation, colonic necrosis", "Constipation, nausea, flatulence, diarrhoea, abdominal pain", "Fluid overload, oedema, hypokalaemia"],
          ],
          "Table 23.7 Potassium binding agents"
        ),
        points([
          "SPS: not for emergencies (peak 4–6 hours). Oral 15 g with 20 g (100 ml 20%) sorbitol 3–4 times daily, or retention enema of 30 to 50 g in 100 ml warm water every 6 hours. Each gram binds 1 mEq potassium and releases 2–3 mEq sodium: caution in heart failure or volume overload.",
          "Patiromer: sodium-free; start 8.4 g per day, up to 25.2 g per day. Adverse effects include hypomagnesaemia and GI upset. Preferred over SZC in chronic hyperkalaemia (CKD, heart failure) because SZC's sodium raises oedema risk.",
          "SZC: 10 g three times a day for about 48 hours, then 10 g once daily. Onset 1 hour, so recommended for acute life-threatening hyperkalaemia.",
          "The literature favours the newer binders, but SPS remains widely used as they are expensive and not available everywhere; recent meta-analyses did not find a statistically high necrosis risk with SPS.",
        ]),
        caution([
          "SPS only with normal bowel function: avoid in ileus, bowel obstruction, severe constipation, recent bowel surgery. Risk of ulceration, bleeding, ischaemia and colonic necrosis, especially with sorbitol; US FDA in 2009 advised against concomitant sorbitol.",
        ]),
        points([
          "The SPS enema dose is 30 to 50 g in the text and 30 g in Table 23.7.",
          "SZC side effects: the table lists fluid overload, oedema and hypokalaemia; the text adds constipation and headache.",
          "Table 23.6 gives binders an onset of 2–24 hours and a duration of 4–6 hours, which differs from the per-agent figures in Table 23.7.",
        ], "Where the book differs"),
        quote("the usual dose is 15 gm mixed with 20 gm (100 ml 20%) of sorbitol administered 3-4 times daily", "280"),
        quote("retention enema consisting of 30 to 50 gm of resins mixed in 100 ml of warm water administered every 6 hours", "280"),
        quote("The recommended initial dose is 8.4 gm per day, and the higher dose is adjusted up to 25.2 gm per day", "282"),
        quote("10 gm administered orally three times a day for about 48 hours, and the maintenance dose is 10 gm once daily", "282"),
        quote("binds with 1 mEq of potassium and releases 2-3 mEq of sodium", "281"),
        quote("1500 mg or 65.25 mmol Na' per each 15 gm dose", "281"),
      ],
    },
    {
      id: "dialysis",
      title: "Step 3c: dialysis",
      blocks: [
        points([
          "Haemodialysis is the most rapid, effective and reliable method: removes 25–50 mEq/hour.",
          "Used in renal failure and in severe life-threatening hyperkalaemia unresponsive to standard measures.",
          "Peritoneal dialysis removes potassium very slowly (5 mEq/hour) but effectively.",
        ]),
        quote("hemodialysis (potassium removal rate 25-50 mEq/hour)", "282"),
        quote("potassium removal rate 5 mEq/hour", "282"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring",
      blocks: [
        points([
          "Cardiac monitoring and potassium frequency depend on severity and manifestations.",
          "In emergency management of severe hyperkalaemia: continuous cardiac monitoring for all, potassium usually 2–4 hourly.",
          "Blood glucose hourly for about 5 to 6 hours after insulin (see insulin).",
        ]),
        quote("frequent estimation of potassium concentration (usually 2-4 hourly)", "282"),
      ],
    },
    {
      id: "chronic",
      title: "Chronic hyperkalaemia and the cause",
      blocks: [
        steps([
          "Restrict dietary potassium: avoid fruit juice, coconut water and potassium-rich food.",
          "Stop drugs that raise potassium (Table 23.2) and potassium-containing medicines or fluids.",
          "Potassium binders.",
          "Addison's disease: glucocorticoid (hydrocortisone). Hypoaldosteronism: fludrocortisone 0.2 mg/day.",
          "Treat diabetic ketoacidosis.",
          "Chronic hyperkalaemia with metabolic acidosis: sodium bicarbonate tablets or sodium citrate (Shohl's solution).",
          "Hyperkalaemic periodic paralysis: inhaled beta-agonist acutely; diuretics or acetazolamide chronically.",
          "Hypovolaemia: isotonic bicarbonate (150 mEq in a litre of D5W) if bicarbonate is low; Ringer's lactate or PlasmaLyte if it is normal. Avoid large volumes of normal saline, which may raise potassium.",
        ]),
        quote("supplement (0.2 mg/day, fludrocortisone)", "283"),
        quote("isotonic bicarbonate solution (150 mEq of sodium bicarbonate in a liter of D5W)", "283"),
      ],
    },
    {
      id: "raasi",
      title: "Preventing it with RAAS blockers",
      blocks: [
        table(
          ["Situation", "What the book advises"],
          [
            ["Before starting ACE-I or ARB", "Measure urea and electrolytes"],
            ["Serum K+ >5.0 mEq/L", "Use these drugs cautiously"],
            ["After starting or each dose titration", "Repeat urea and electrolytes at 1 week"],
            ["Serum K+ 5.5–5.9 mEq/L", "Halve the RAASi dose and monitor potassium closely"],
            ["Serum K+ >6.0 mEq/L", "Discontinue in patients without heart failure"],
          ]
        ),
        points([
          "In HFrEF, RAASi and mineralocorticoid receptor antagonists (spironolactone, eplerenone) cut mortality and morbidity, so the aim is to lower potassium and continue them; patiromer and SZC may allow this.",
        ]),
        quote("use these drugs cautiously if the serum K⁺ is >5.0 mEq/L", "283"),
        quote("If serum K⁺ is 5.5-5.9 mEq/L, reduce the dose of RAASi drugs by half", "283"),
        quote("If serum K⁺ is >6.0 mEq/L, discontinue these drugs in patients without heart failure.", "283"),
      ],
    },
  ],
};
