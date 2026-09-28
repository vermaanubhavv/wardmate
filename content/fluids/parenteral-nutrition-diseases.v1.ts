import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * PARENTERAL NUTRITION IN SPECIFIC DISEASES — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 56. One section per disease group the chapter covers, in the chapter's
 * order. Every number is the book's; the quotes give the PDF page it came from. The general
 * principles, requirements, administration and complications of PN are separate topics.
 */
export const parenteralNutritionDiseasesV1: FluidTopic = {
  id: "parenteral_nutrition_diseases",
  version: "1.0.0",
  title: "Parenteral nutrition in specific diseases",
  group: "settings",
  summary: "How the energy, protein, lipid and electrolyte targets of PN change in kidney injury, burns, cancer, critical illness, fistulae, liver disease, pancreatitis, surgery, lung disease and short bowel.",
  setting: "Adult ICU, nephrology, surgical, hepatology and respiratory wards",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["56 Parenteral Nutrition in Specific Diseases"], pages: "349–378" },
  sections: [
    {
      id: "aki",
      title: "Acute kidney injury",
      intro: "Malnutrition is common in AKI and a poor prognostic marker; low calorie and amino acid intake carries higher hospital mortality. Enteral feeding is preferred; PN is for inadequate enteral intake or significant gut dysfunction.",
      blocks: [
        points([
          "Early PN may delay renal recovery and prolong renal replacement therapy: the extra amino acids are catabolised to urea. ESPEN 2019 starts PN within three to seven days, giving half the predicted or measured energy need at first.",
          "Energy: uncomplicated AKI 20–30 kcal/kg/day (the same as a normal adult); about 25 to 35 kcal/kg/day in critically ill AKI (severe sepsis, respiratory failure, burns, multi-organ failure) and during CRRT. Higher calories do not improve outcome; indirect calorimetry is the recommended method.",
          "Protein, not on dialysis: 0.8–1.0 g/kg/day for stable non-catabolic patients (KDIGO 2012), 1.2–2 g/kg for critical ICU patients (ASPEN 2016). Excess protein aggravates uraemia and contributes to acidosis.",
          "Non-protein calories: carbohydrate about 65–70% (3 to 5 g/kg/day), lipid 30–35% (0.8 to 1.0 g/kg/day).",
          "Fluid and electrolytes: adjust fluid to urine output; most oliguric patients also need sodium restriction; maximally concentrated PN through a central line; restrict potassium, magnesium and phosphorus in the bag to avoid hyperkalaemia, hypermagnesaemia and hyperphosphataemia.",
        ]),
        table(
          ["Requirement", "ESPEN 2006", "KDIGO 2012", "ASPEN 2016"],
          [
            ["Energy", "20–30 kcal/kg/d", "20–30 kcal/kg/d", "25–30 kcal/kg/d"],
            ["Protein, non-catabolic AKI without dialysis", "0.6–0.8 gm/kg, max. 1.0 gm/kg", "0.8–1.0 gm/kg", "1.2–2 gm/kg"],
            ["Protein, RRT in hypercatabolism", "1.0–1.5 gm/kg", "1.0–1.5 gm/kg for RRT, up to 1.7 gm/kg for CRRT", "Additional 0.2 gm/kg up to 2.5 gm/kg"],
            ["Carbohydrates", "3–5 gm/kg (max. 7 gm/kg)", "-", "-"],
            ["Lipid", "0.8–1.2 gm/kg (max. 1.5 gm/kg)", "-", "-"],
          ],
          "Table 56.1 Guidelines for nutritional requirements in acute kidney injury"
        ),
        table(
          ["Modality", "Amino acid lost"],
          [
            ["Conventional haemodialysis", "about 3–6 gm"],
            ["Sustained low-efficiency dialysis (SLED)", "7–10 gm"],
            ["Continuous venovenous haemofiltration (CVVH)", "14–22 gm per session"],
          ],
          "Amino acid loss into the effluent during renal replacement therapy",
          "KDIGO protein replacement: 1.0–1.5 gm/kg/d on intermittent RRT, up to 1.7 gm/kg/d on CRRT. To replace the CRRT loss the text recommends 1.5–2.5 gm/kg/day."
        ),
        caution([
          "Do not restrict protein in AKI to avoid or delay the start of dialysis.",
          "Early PN in AKI should be avoided — it delays recovery.",
        ]),
        quote("do not restrict protein intake in AKI patients to avoid or delay the initiation of dialysis", "350"),
        quote("starting PN within three to seven days and providing half of the predicted or measured energy need", "350"),
      ],
    },
    {
      id: "burns",
      title: "Burns",
      intro: "Protein and micronutrients are lost through the lost skin barrier, energy expenditure rises to replace heat loss, and the post-burn hypermetabolic catabolic state is prolonged.",
      blocks: [
        points([
          "Enteral nutrition is preferred. PN is not recommended routinely in burns (overfeeding, impaired immunity, liver failure, higher mortality) and is given only when EN is not feasible, not tolerated or inadequate.",
          "Energy: indirect calorimetry is the standard; the predictive equations over- or underestimate. When calorimetry is unavailable the Toronto equation is recommended in adults.",
          "Protein: 1.5 to 2 gm/kg/day in adults (ESPEN 2013, ASPEN 2016).",
          "Carbohydrate: up to 60% of total energy intake from nutritional and non-nutritional sources. Poor glucose control worsens outcome — keep glucose under 144 mg/dL and over 81 mg/dL, preferably by continuous intravenous insulin infusion.",
          "Lipid: less than 35% of total energy; monitor total fat delivery.",
          "Central venous access is preferred because metabolic demands are high.",
          "Glutamine 0.3 gm/kg/day is beneficial. Early supra-nutritional zinc, copper, selenium and vitamins B1, C, D and E.",
        ]),
        quote("keep glucose levels under 144 mg/dL (and over 81 mg/dL)", "352"),
        quote("ASPEN (2016) guidelines recommend 1.5 to 2 gm protein/kg/day in adults", "352"),
      ],
    },
    {
      id: "cancer",
      title: "Cancer",
      intro: "Cancer-related malnutrition, weight loss and cachexia occur in 30 to 80 percent of patients and reduce the benefit of therapy, increase chemotherapy toxicity and shorten survival.",
      blocks: [
        points([
          "Not recommended routinely in well-nourished cancer patients: no advantage and associated harm.",
          "Prolonged loss of access to the digestive tract — perforation, intestinal obstruction, high-output entero-cutaneous fistula, chylothorax.",
          "Chemotherapy- or radiotherapy-induced GI toxicity limiting oral or enteral intake for more than 1–2 weeks.",
          "Haematopoietic stem cell transplantation when severe mucositis, ileus or intractable vomiting limit oral or enteral intake.",
          "Unlikely to benefit rapidly progressive or terminal malignancy, where anticancer therapy is ineffective.",
        ], "Indications"),
        table(
          ["Nutrient", "Requirement in the text"],
          [
            ["Energy", "about 20–25 kcal/kg/day bedridden; 25–30 kcal/kg/day ambulatory"],
            ["Protein", ">1 gm/kg/day, preferably up to 1.5 gm/kg/day"],
            ["Carbohydrate", "roughly 40–50% or less of non-protein energy"],
            ["Lipid", "up to 50% of non-protein energy; about 0.5–1.5 gm/kg/day (maximum 2 gm/kg/d)"],
          ],
          "Requirements",
          "A higher fat-to-carbohydrate ratio is recommended in weight-losing, cachectic patients with insulin resistance: lipid is energy-dense and lowers the glycaemic load."
        ),
        quote("PN is not recommended routinely in well-nourished cancer patients", "353"),
        quote("about 20–25 kcal/kg/day for bedridden cancer patients and 25–30 kcal/kg/day for ambulatory cancer patients", "353"),
      ],
    },
    {
      id: "cardiac",
      title: "Cardiac disease",
      blocks: [
        points([
          "Chronic heart failure risks malnutrition through low intake, raised energy expenditure and impaired anabolism; cardiac cachexia carries high mortality. Reduced bowel perfusion causes bowel-wall oedema and malabsorption.",
          "Oral supplementation and enteral nutrition are preferred; very few patients need PN.",
          "Volume overload and hyponatraemia are the risks, so PN is used cautiously and in concentrated solutions. Lipid emulsion gives more calories (9 kcal/gm) in a smaller volume.",
        ]),
        quote("PN should be used cautiously, preferably using concentrated PN solutions", "353"),
        quote("Lipid emulsion can provide greater calories (9 kcal/gm) with a smaller volume", "353"),
      ],
    },
    {
      id: "critical_illness",
      title: "Critical illness",
      intro: "Malnutrition affects about 38% to 78% of critically ill patients. In the acute early phase catabolism generates energy endogenously, so early PN at standard energy targets overfeeds.",
      blocks: [
        table(
          ["Stage", "ICU days", "Metabolism", "Characteristic"],
          [
            ["Acute phase, early period", "1–2", "Catabolism", "Metabolic instability and severe increase in catabolism"],
            ["Acute phase, late period", "3–7", "Catabolism", "Significant muscle wasting and stabilisation of the metabolic disturbances"],
            ["Post-acute late phase", "After day 7", "Anabolism", "Improvement and rehabilitation"],
            ["Post-acute late phase", "After day 7", "Catabolism", "Chronicity with persistent inflammatory/catabolic state and prolonged hospitalisation"],
          ],
          "Table 56.2 Metabolic characteristic of critical illness"
        ),
        points([
          "EN is preferred by every recent guideline. The CALORIES trial found hypocaloric PN as safe as EN at an equivalent dose — the advantage of EN may be the calorie dose rather than the route.",
          "Timing: EPaNIC (2011) showed harm from early PN and benefit from late PN. ESPEN 2019 starts PN between ICU days 3 and 7; ASPEN/SCCM 2016 after 7 days.",
          "Well-nourished, low-risk patients generally do not need exclusive PN in the first seven days. High nutrition risk or severe malnutrition: exclusive PN at the earliest if EN is not feasible.",
          "Supplemental PN when oral/EN fails to meet more than 60% of energy and protein needs after seven to ten days.",
        ], "When"),
        steps([
          "First week: hypocaloric PN, 20 kcal/kg/d or less (70–80% of the estimated energy requirement) with at least 1.2 gm protein/kg/d. After stabilisation increase gradually to 100% of the estimate.",
          "Energy: indirect calorimetry preferred; total expenditure about 20 to 30 kcal/kg/day. Initial 70–80% of the measured expenditure is beneficial; more or less is harmful.",
          "Serum phosphorus below 0.65 mmol/L (2 mg/dL): refeeding risk — restrict calories to 50% of the calculated need for 2 to 3 days.",
          "Protein: up to 1.3 gm/kg/day (ESPEN 2019), 1.2–2.0 gm/kg/day (ASPEN/SCCM 2016). A low dose first (under 0.8 gm/kg/day before day 3) then more than 0.8 gm/kg/d after day 3 reduces mortality. Combine with exercise.",
          "Glucose: not more than 5 mg/kg/min (ESPEN 2019). Target 140 or 150 to 180 mg/dL; insulin infusion when above 150 mg/dL to keep below 180 mg/dL.",
          "Lipid: start at 0.7 gm/kg/day; not more than 1.5 gm/kg/day or 100 gm/week; about 30% of total calories. Measure triglyceride at baseline and regularly; keep below 400 mg/dL (4.5 mmol/L).",
          "Fish-oil lipid emulsion 0.1–0.2 gm/kg/day (EPA + DHA) in surgical and high-risk patients (sepsis, ARDS, PICS); evidence in non-surgical patients is insufficient.",
          "Vitamins and trace elements are given separately — commercial PN bags do not contain them.",
        ], "How"),
        table(
          ["Component", "Critically ill patients", "Stable patients"],
          [
            ["Total calories", "20 to 30 kcal/kg/d", "20 to 30 kcal/kg/d"],
            ["Protein", "1.3 (1.2–2.0) gm/kg/d", "0.8 to 1.5 gm/kg/d"],
            ["Carbohydrate", "Not >5 mg/kg/min", "4–5 mg/kg/min"],
            ["Lipid", "Less than 1.5 gm/kg/d (100 gm/wk)", "1 gm/kg/d"],
            ["Fluid", "Minimum needed to deliver adequate macronutrients", "30 to 40 mL/kg/d"],
          ],
          "Table 56.3 Nutritional requirements in critical and stable patients"
        ),
        caution([
          "SCCM/ASPEN 2016 recommends against pure soybean-oil lipid emulsion in the first week of PN.",
          "Parenteral glutamine is not recommended in critically ill, unstable or complex ICU patients or in multi-organ failure, especially with liver or renal failure (Canadian 2015, ASPEN 2016, ESPEN 2019).",
        ]),
        quote("hypocaloric PN (≤20 kcal/kg/d or 70–80% of estimated energy requirements) with an adequate protein supplementation (≥1.2 gm protein/kg/d)", "355"),
        quote("restrict calorie intake to 50% of the calculated energy needs for 2 to 3 days", "355"),
        quote("the amount of glucose should not exceed 5 mg/kg/min", "356"),
        quote("the total dose of lipid should not exceed 1.5 gm lipids/kg/day or a maximum of 100 gm/week", "356"),
        quote("maintain triglyceride levels below 400 mg/dL (4.5 mmol/L)", "357"),
      ],
    },
    {
      id: "gi_fistulae",
      title: "Gastrointestinal fistulae",
      intro: "A high-output fistula loses more than 500 mL in 24 hours and carries fluid, electrolytes, protein, vitamins and trace minerals with it; malnutrition follows in about 55–90%. Nutrient depletion and sepsis are the leading causes of death.",
      blocks: [
        points([
          "PN is started after the initial fluid and electrolyte resuscitation and control of sepsis. It buys time to correct sepsis before reconstructive surgery and postpones hazardous emergency surgery.",
          "Indications: high output (more than 500 mL/day), distal obstruction, or less than 75 cm of bowel before the fistula; oral or EN inadequate beyond 7 days; supplemental PN when EN alone cannot meet the goal.",
        ]),
        table(
          ["Nutrient", "Requirement in the text"],
          [
            ["Energy", "25 to 35 kcal/kg per day"],
            ["Protein", "1.5–2.0 gm/kg/d; up to 2.5 gm/kg/d in high-output fistula (ASPEN-FELANPE) — effluent protein loss can reach 75 gm/day"],
            ["Lipid", "roughly 20–30% of calories; fish-oil emulsion beneficial"],
            ["Vitamin C and zinc", "about ten times the daily allowance"],
            ["Other vitamins", "two times normal"],
          ],
          "Requirements in high-output fistula"
        ),
        quote("High output GI fistulas (loss greater than 500 ml of fluid in 24 hours)", "357"),
        quote("requires 25 to 35 kcal/kg per day of total caloric intake and 1.5–2.0 gm/kg/d of protein", "358"),
      ],
    },
    {
      id: "ibd",
      title: "Inflammatory bowel disease",
      intro: "Malnutrition occurs in about 6% to 16% of patients with IBD and worsens complications and mortality. PN does not raise the remission rate or reduce the need for surgery and is less effective than steroids in Crohn's disease.",
      blocks: [
        points([
          "Oral or EN cannot supply more than 60% of energy needs in Crohn's disease with gut dysfunction or short bowel.",
          "Oral or EN impossible: severe vomiting or diarrhoea, no access.",
          "Oral or EN contraindicated: paralytic ileus, obstructed bowel, intestinal ischaemia, severe shock.",
          "Complications: anastomotic leak, high-output intestinal fistula.",
          "Perioperative and postoperative periods when oral or EN cannot start within 7 days.",
        ], "Indications"),
        caution(["PN and bowel rest should not be used routinely as primary therapy for IBD. Correcting dehydration and replacing micronutrients matter more than bowel rest alone."]),
        quote("PN and bowel rest should not be used routinely as primary therapies for IBD", "358"),
        quote("cannot supply >60% of energy needs", "358"),
      ],
    },
    {
      id: "liver",
      title: "Liver disease",
      intro: "Malnutrition affects about 20% of compensated and 50%–90% of advanced cirrhosis. It causes sarcopenia, encephalopathy, variceal bleeding, infection and longer stays.",
      blocks: [
        points([
          "PN is second-line when oral or EN is inadequate or contraindicated; prompt PN in moderate or severe malnutrition; early postoperative PN after liver transplantation or surgery when EN is not feasible; consider it with an unprotected airway, poor cough and swallow, or hepatic encephalopathy.",
          "Basal metabolic rate: actual body weight in cirrhosis without ascites, ideal body weight with ascites.",
          "Carbohydrate 50–60% and lipid about 40–50% of non-protein energy.",
          "Vitamins (fat- and water-soluble) and micronutrients are supplemented. Vitamin K is routinely given for a raised prothrombin time but the evidence is limited. Zinc deficit is common and the evidence for zinc in hepatic encephalopathy is growing.",
        ]),
        table(
          ["Energy", "Clinical conditions"],
          [
            ["25–30 kcal/kg/d", "Compensated liver cirrhosis"],
            ["30–35 kcal/kg/d", "Acute liver failure, alcoholic hepatitis, decompensated cirrhosis (in nonobese individuals), cirrhotic with malnutrition, hepatic encephalopathy, preoperatively and postoperative cirrhotic patients"],
            ["25 kcal/kg/d", "Obese cirrhotic patient"],
            ["35–40 kcal/kg/d", "Critically ill cirrhotic patients"],
          ],
          "Table 56.4 Energy requirements in liver diseases"
        ),
        table(
          ["Protein", "Clinical conditions"],
          [
            ["1.2 gm/kg/d", "Non-malnourished compensated liver cirrhosis"],
            ["1.5 gm/kg/d", "Decompensated cirrhosis (in nonobese individuals), malnourished and/or sarcopenic cirrhotic patients"],
            ["1.2–1.5 gm/kg/d", "Preoperatively and postoperative cirrhotic patients, hepatic encephalopathy"],
            ["1.5–2 gm/kg/d", "High volume recurrent ascites with sarcopenia"],
            ["2.0–2.5 gm/kg/d", "Obese cirrhotic patient"],
            [">1.2 gm/kg/d", "Critically ill cirrhotic patients"],
          ],
          "Table 56.5 Protein requirements in liver diseases"
        ),
        points([
          "Salt: dietary sodium restriction is first-line in ascites — about 80–113 mEq sodium or 5–6.5 gm of salt per day. Weigh the modest benefit against the malnutrition an unpalatable diet causes. Not recommended without ascites.",
          "Fluid: 1 to 1.5 L per day only in clinical hypervolaemia with severe hyponatraemia (serum sodium below 125 mmol/L). Not in hypovolaemic hyponatraemia or mild to moderate hyponatraemia.",
        ], "Fluid and salt"),
        caution([
          "Protein restriction to prevent hepatic encephalopathy is a misconception. It increases catabolism; high protein improves mental status and does not precipitate or worsen encephalopathy.",
          "No salt restriction without ascites; no fluid restriction in hypovolaemic or mild to moderate hyponatraemia.",
        ]),
        quote("Restriction of protein should be avoided because it increases protein catabolism", "360"),
        quote("intake of about 80–113 mEq sodium or 5–6.5 gm of salt per day", "360"),
        quote("Restriction of fluid to 1 to 1.5 L per day should be considered only in patients with clinical hypervolemia", "360"),
      ],
    },
    {
      id: "pancreatitis",
      title: "Pancreatitis",
      intro: "About 20% of acute pancreatitis is severe, with mortality raised by 19–30%. Severe disease is hypercatabolic. The concept of pancreatic rest — nil by mouth and PN — is outdated, detrimental and should be abandoned: starvation loses the mucosal barrier and invites translocation, enzyme secretion is already suppressed, and PN for bowel rest brings hyperglycaemia, electrolyte disturbance, line infection, sepsis and cost.",
      blocks: [
        points([
          "EN is safer, more effective and preferred in the early phase. Early EN (within 72, 48 or 24 hours) beats delayed EN; inability to feed enterally for more than 72–96 hours risks rapid deterioration, infected necrosis and death.",
          "Mild acute pancreatitis (about 80%): normal food as tolerated, starting with a soft low-fat solid diet; no EN or PN. If oral intake is not possible within 72 hours, start EN on day 4.",
          "Nasogastric feeding is preferred; nasojejunal for high aspiration risk, gastric intolerance, severe gastroparesis, partial gastric outlet obstruction from oedema or pseudocyst, and after minimally invasive necrosectomy.",
          "Raised intra-abdominal pressure: start EN gently at 10–20 mL/h by the nasojejunal route when IAP is below 15 mmHg; IAP above 15 mmHg may need EN reduced or stopped. Even a small amount of EN alongside PN helps in severe disease with an open abdomen.",
        ], "Enteral first"),
        points([
          "PN is not started until EN has been attempted for at least 2–3 days.",
          "EN impossible or contraindicated: prolonged paralytic ileus, duodenal obstruction from oedema or pseudocyst, complex pancreatic fistulae, haemodynamic instability or inotrope requirement.",
          "Targets not achievable through EN; enteral access cannot be maintained or the nasal tube is not tolerated; EN worsens abdominal pain.",
          "Abdominal compartment syndrome with IAP above 20 mmHg.",
          "As EN tolerance returns, taper PN and transition to EN as soon as possible.",
        ], "Indications for PN"),
        table(
          ["Nutrient", "Requirement in the text"],
          [
            ["Energy", "25–30 kcal/kg/day"],
            ["Protein", "1.2 to 1.5 gm/kg/day"],
            ["Carbohydrate", "4–6 gm/kg/day"],
            ["Lipid", "up to 2 gm/kg/day"],
          ],
          "Rough requirements in severe acute pancreatitis"
        ),
        steps([
          "Mixed energy from carbohydrate, fat and protein; avoid overfeeding and hyperglycaemia.",
          "Glucose: monitor closely; insulin to keep blood sugar below 180 mg/dL (10 mmol/L).",
          "Lipid: safe and effective unless triglyceride exceeds 350 mg/dL or there is thrombocytopenia. Check triglyceride before PN, monitor regularly, keep below 400 mg/dL; stop lipid temporarily above 400 mg/dL (4.5 mmol/L). Infuse gradually over 10–12 hours.",
          "L-glutamine 0.20 gm/kg per day with PN reduces infectious complications and mortality. Its benefit is confined to PN — do not add glutamine to enteral feeding.",
        ], "Prescribing"),
        quote("PN should not be initiated until all attempts are made with EN for at least 2–3 days", "363"),
        quote("In abdominal compartment syndrome with IAP >20 mmHg, patients cannot tolerate EN, and PN is indicated.", "363"),
        quote("IV lipids should be administered gradually over a period of 10–12 hours", "364"),
        quote("The recommended dose of L-glutamine is 0.20 gm/kg per day", "364"),
      ],
    },
    {
      id: "perioperative",
      title: "Perioperative nutrition",
      intro: "Malnutrition affects about 20% to 40% of hospital inpatients and, in surgical patients, lengthens stay and raises infection, poor wound healing and death. PN is lifesaving in prolonged gastrointestinal failure.",
      blocks: [
        points([
          "Indicated in severe malnutrition — weight loss over 10–15%, serum albumin below 3.0 gm/dL, BMI below 18.5, or nutrition risk index below 83.5 — when oral or enteral nutrition cannot be achieved.",
          "7–10 days of preoperative PN reduces postoperative complications, provided the operation can be safely postponed. Restoring nutritional and metabolic status takes about 7 to 14 days; PN continues postoperatively.",
          "Mild to moderate malnutrition: do not delay surgery and avoid preoperative PN.",
        ], "Preoperative PN"),
        points([
          "Not routine: it increases postoperative complications.",
          "Previously well-nourished, unlikely to resume oral or enteral feeding within 10 days (obstruction, complications impairing gut function). Not indicated if intake is likely within 7 days.",
          "Previously malnourished, oral or EN not feasible or not tolerated within 5–7 days.",
          "Previously severely malnourished undergoing emergency surgery: start as soon as possible.",
          "Supplemental PN when oral or enteral intake cannot meet at least 50% of needs for more than seven days.",
          "Typical settings: anastomotic failure, fistula, mechanical obstruction, diffuse peritonitis, paralytic ileus, severe acute pancreatitis, bowel ischaemia, short bowel syndrome.",
        ], "Postoperative PN — indications"),
        table(
          ["Preoperative state", "When to start postoperative PN"],
          [
            ["Severe malnutrition on preoperative PN", "Postoperative day 1, as a continuation"],
            ["Severe malnutrition, oral or EN unlikely", "As soon as possible"],
            ["Nutritionally at risk, oral or EN not possible", "Within 3 to 5 days"],
            ["No preoperative malnutrition", "Delay around 5 days — early PN gives no benefit in most non-critically ill patients"],
            ["Well-nourished, stable, intake below 50% of needs", "Supplemental PN after 7 days"],
          ],
          "Timing of postoperative PN",
          "Supplement vitamins and trace elements with postoperative PN."
        ),
        caution(["Postoperative PN should not be used routinely."]),
        quote("weight loss >10–15%, serum albumin <3.0 gm/dL, body mass index (BMI) <18.5 or nutrition risk index (NRI) score <83.5", "365"),
        quote("Postoperative parenteral nutrition should not be used routinely", "365"),
        quote("PN should be delayed for around 5 days after surgery", "365"),
      ],
    },
    {
      id: "pulmonary",
      title: "Pulmonary disease",
      intro: "Malnutrition affects about 10% to 60% of COPD. Underfed patients catabolise protein, the respiratory muscles waste, ventilatory drive and the response to hypoxia fall, weaning fails and infection rises. Oral or enteral feeding is preferred; PN when gut function is impaired for a prolonged period.",
      blocks: [
        points([
          "Energy: about 30 kcal/kg/day for weight maintenance, as high as 45 kcal/kg/day for weight gain; in malnourished patients up to 1.7 times resting energy expenditure.",
          "Avoid overfeeding: excess dextrose and lipid raise CO2 production and the work of breathing — detrimental where CO2 is retained.",
          "Spontaneously ventilating COPD: more lipid (up to about 50%) and less carbohydrate (about 30%), since lipid gives more energy for less CO2. Fish-oil lipid is beneficial in high-risk critical ARDS.",
          "On a ventilator: low-carbohydrate, high-lipid formulas were meant to shorten ventilation, but several studies failed to show it and ASPEN-SCCM 2016 recommends against manipulating the respiratory quotient this way in ICU acute respiratory failure.",
          "Acute respiratory failure accumulates fluid: use a concentrated, volume-restricted formula.",
          "Avoid hypokalaemia, hypophosphataemia, hypocalcaemia and hypomagnesaemia — they weaken the respiratory muscles. Start PN gradually in the severely malnourished to avoid refeeding.",
          "Vitamin D deficiency is common and linked to infection and faster decline; GOLD 2020 screens every COPD patient admitted with an exacerbation and supplements if needed.",
        ]),
        formula(
          "Energy requirement in malnourished COPD",
          "Energy = up to 1.7 × REE",
          [
            { symbol: "Energy", meaning: "Daily energy requirement in a malnourished COPD patient", unit: "kcal/day" },
            { symbol: "REE", meaning: "Resting energy expenditure", unit: "kcal/day" },
          ],
          { note: "The text gives the multiplier only; it does not give a method for REE here." }
        ),
        table(
          ["Protein", "Clinical state"],
          [
            ["0.8–1.5 gm/kg/d", "Stable, non-malnourished COPD patients without nutritional risk"],
            ["Up to 1.5 gm/kg/d", "Acutely unwell (exacerbating) COPD, for daily requirements and to avoid further protein losses; pulmonary rehabilitation with exercise to gain or retain lean muscle mass; malnourished outpatients to achieve weight gain"],
          ],
          "Table 56.6 Protein requirement in COPD patients"
        ),
        quote("about 30 kcal/kg/day for weight maintenance", "367"),
        quote("may be as high as 45 kcal/kg/day for patients aiming to achieve weight gain", "367"),
      ],
    },
    {
      id: "short_bowel",
      title: "Short bowel syndrome",
      intro: "Malabsorption after extensive small-bowel resection. Severe when more than 75% of the small bowel is resected, the terminal ileum and ileocaecal valve are removed, or the remaining bowel is diseased. A colon in continuity reduces dependence on PN.",
      blocks: [
        points([
          "Large-volume diarrhoea with hypovolaemia, metabolic acidosis, hypokalaemia, hypomagnesaemia, hypocalcaemia; malnutrition and water- and fat-soluble vitamin deficit.",
          "Gastric acid hypersecretion from loss of the inhibitory hormones of jejunum and distal ileum.",
          "D-lactic acidosis: colonic fermentation of malabsorbed carbohydrate — a high anion gap acidosis.",
          "Calcium oxalate nephrolithiasis: unabsorbed fat binds calcium, free oxalate is absorbed by the intact colon; chronic dehydration, hypocitraturia, hypomagnesuria, low urine volume and low pH add to the risk.",
        ], "Presentations"),
        points([
          "PN is generally needed when the remaining functional small bowel is under 50–70 cm with a colon in continuity, or under 100–150 cm without a colon.",
        ]),
        steps([
          "First acute stage (three to four weeks): large volumes of electrolyte-containing IV fluid to replace losses — balanced crystalloid or half normal saline with potassium is usually adequate. Critically ill unstable patients stay nil by mouth. PN if EN is not possible within one week in severe SBS, and only after fluid, electrolyte and haemodynamic correction. Supplemental EN prevents mucosal atrophy and drives adaptation; bolus feeds cause diarrhoea, so slow continuous overnight tube feeding is used.",
          "Second adaptive stage (up to 2 years): start enteral feeding as faecal loss falls, cut PN gradually. At least 1 gm/kg/week of IV lipid to prevent essential fatty acid deficiency. Overfeeding and soybean-based lipid raise the risk of intestinal failure-associated liver disease; fish-oil lipid lowers it. Glutamine is not recommended. Vitamins A, D, E and K; monthly vitamin B12 injection if the terminal ileum or more than 100 cm of ileum is resected; magnesium supplementation with correction of sodium depletion.",
          "Third maintenance stage: about 50% of adults reverse intestinal failure within two years; the rest need home PN for months, years or life. Overnight cyclic PN rather than continuous — less IFALD, freedom from the pump by day. Oral diet or EN advanced slowly to small frequent meals. D-lactic acidosis: hydration, carbohydrate restriction, non-absorbable antibiotics against D-lactate-forming bacteria, thiamine.",
        ], "The three stages"),
        caution([
          "Glutamine, by PN or EN, is not recommended in SBS.",
          "Avoid overfeeding and soybean-based lipid in long-term PN (IFALD); avoid continuous home PN infusion.",
        ]),
        quote("Patients with SBS generally need PN when the length of the remaining functional small bowel is <50–70 cm", "369"),
        quote("administration of a minimal 1 gm/kg/week of intravenous lipid emulsion is recommended", "370"),
      ],
    },
  ],
};
