import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * PARENTERAL NUTRITION: PRINCIPLES AND REQUIREMENTS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 55, which the source edition carries in full. Every number below is the
 * book's; the quotes give the PDF page it came from. Administration, refeeding and
 * complications (chapter 57) and disease-specific PN (chapter 56) are separate topics.
 */
export const parenteralNutritionPrinciplesV1: FluidTopic = {
  id: "parenteral_nutrition_principles",
  version: "1.0.0",
  title: "Parenteral nutrition: indications, requirements and building a prescription",
  group: "settings",
  summary: "Who needs PN and when to start, how the book estimates energy, protein, dextrose, lipid and micronutrient needs, and the 60 kg worked examples that turn them into volumes.",
  setting: "Adult ICU, surgical and medical wards; any patient who cannot be fed through the gut",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["55 Parenteral Nutrition: Principles and Requirements"], pages: "326–348" },
  sections: [
    {
      id: "what",
      title: "What it is and the basic principles",
      intro: "Intravenous administration of nutrients, vitamins, electrolytes and medications to a patient who cannot take or tolerate enteral nutrition or has a non-functional gastrointestinal tract.",
      blocks: [
        points([
          "Life-supporting for critically ill patients who cannot ingest, absorb or assimilate nutrients, for non-critically ill patients with pre-existing malnutrition, and for non-stressed hospitalised patients who cannot take oral intake for 5 to 7 or more days.",
          "If the intestines are functioning, use them. Enteral nutrition is preferred, but safe and sufficient delivery of nutrition has higher priority than the route.",
          "Avoid overfeeding: excess carbohydrate causes hyperglycaemia, hepatic steatosis and more CO2; excess protein causes azotaemia and metabolic acidosis; excess fat causes hyperlipidaemia.",
          "Method of delivery, timing and type of formula matter more than the exact amounts of nutrients.",
          "A catabolic patient cannot be made fully anabolic. The goal is to prevent wasting of protein and to provide essential and conditionally essential nutrients.",
          "Even a token enteral supplement is recommended for a patient on total PN: it maintains mucosal integrity, prevents bacterial translocation, feeds the gut its preferred fuels, keeps the liver in the circuit and prevents cholelithiasis.",
        ]),
        steps([
          "Select the patient: PN only when the potential benefit (prognosis, quality of life) exceeds the risk.",
          "Select and establish the route on the basis of long-term versus short-term need.",
          "Calculate the requirements of fluid, energy, glucose, lipids, proteins, minerals and vitamins, with disease-specific modifications.",
          "Convert the requirements into a prescription and prepare or select a formula.",
          "Administer, monitor and avoid complications.",
        ], "Table 55.1 Planning PN support"),
        quote("non-stressed but hospitalized patients who cannot take oral intake for 5 to 7 or more days", "327"),
      ],
    },
    {
      id: "indications",
      title: "Indications and when to start",
      blocks: [
        table(
          ["Group", "Indications in the text"],
          [
            ["A. General", "Critical illness with inadequate oral or enteral nutrition for more than 5–7 days. In critically ill patients with severe malnutrition or high nutrition risk, start PN as soon as feasible if oral or enteral nutrition is not possible or inadequate."],
            ["B. Impaired absorption", "GI fistula, short bowel syndrome, small bowel obstruction, effects of radiation or chemotherapy."],
            ["B. Need for bowel rest", "Severe acute necrotising pancreatitis, inflammatory bowel disease, mesenteric ischaemia, peritonitis, perioperative (bowel resection, major gastrointestinal surgery)."],
            ["B. Motility disorders", "Prolonged ileus."],
            ["B. Cannot achieve or maintain enteral access", "Haemodynamic instability, massive gastrointestinal bleeding, unacceptable aspiration risk, hyperemesis gravidarum, eating disorders."],
            ["C. Significant multiorgan disease", "Significant renal, hepatic and pulmonary disease or critical illness (multiorgan failure, severe head injury, burns) preventing adequate oral or enteral nutrition."],
          ],
          "Table 55.2 Indications of PN"
        ),
        points([
          "Active severe gastrointestinal bleeding, bowel obstruction, perforation, generalised peritonitis, severe paralytic ileus, high-output external fistula, intractable vomiting or diarrhoea.",
          "Active shock or severe haemodynamic instability on high-dose vasopressors: start enteral nutrition once resuscitated and/or vasopressor doses are declining.",
          "No safe access to the gastrointestinal tract; complications of enteral feeding (aspiration, severe diarrhoea, intestinal ischaemia in ischaemic bowel).",
        ], "Contraindications to enteral nutrition, which make PN the route"),
        points([
          "Even in critical patients the decision to start PN is never an emergency. With a haemodynamically stable patient and normal electrolytes and glucose, the risk of PN is low.",
          "Early PN benefits severely malnourished critically ill patients, severe necrotising acute pancreatitis and high-output fistula with large nutrient losses.",
          "Initial therapy of the critical illness may itself restore oral or enteral intake, so the patient may never need PN.",
        ], "Timing"),
        quote("Even in critical patients, the decision to start PN is never an emergency.", "331"),
        quote("Critical illness with inadequate oral or enteral nutrition for >5–7 days", "330"),
      ],
    },
    {
      id: "contraindications",
      title: "Contraindications and cautious use",
      blocks: [
        points([
          "Enteral or oral nutrition meets the requirement.",
          "Well-nourished, stable, non-catabolic patient in whom oral or enteral nutrition is likely within five to seven days: for most patients who need short-term support the risks of PN outweigh the benefits.",
          "Severe liver failure, cardiac failure, cardiogenic shock, blood dyscrasias.",
          "Undue risk in inserting a catheter solely for PN.",
          "To prolong life in a terminally ill patient with a poor expected outcome and little prospect of good quality of life.",
        ], "General contraindications"),
        table(
          ["Situation", "Threshold in the text"],
          [
            ["Azotaemia", "BUN >100 mg/dL"],
            ["Severe hyperglycaemia", "glucose >300 mg/dL"],
            ["Hypernatraemia", "Na+ >150 mEq/L"],
            ["Hypokalaemia", "K+ <3 mEq/L"],
            ["Hypochloraemia", "Cl- <85 mEq/L"],
            ["Hypophosphataemia", "phosphorus <2 mg/dL"],
            ["Haemodynamic instability, volume overload", "no number given; PN carries high risk"],
          ],
          "Cautious use: PN carries high risk when these are present"
        ),
        points([
          "Compromised pulmonary function and ventilator weaning: avoid excess carbohydrate (more CO2).",
          "Lipids with caution if triglycerides are consistently above 350 mg/dL, in severe sepsis, moderate jaundice, platelets below 50,000 to 60,000/mm, ARDS or severe respiratory disease.",
          "Heart or kidney failure: avoid excess PN volume.",
          "Hepatic encephalopathy and severe renal failure: modified amino acids preferred over standard.",
        ], "Disease-specific cautions"),
        quote("azotemia (BUN >100 mg/dL), severe hyperglycemia (glucose >300 mg/dL)", "331"),
        quote("For Most patients who require short-term support, the risks of PN outweigh the benefits.", "331"),
      ],
    },
    {
      id: "route",
      title: "Route: what pushes a solution to a central line",
      intro: "The route is chosen at step 2 of the plan (long-term versus short-term need). In this chapter the driver is osmolarity: concentrated dextrose needs a central vein, lipid emulsion lowers the osmolarity of a peripheral mixture.",
      blocks: [
        table(
          ["Concentration", "Dextrose (gm/L)", "Calories (kcal/L)", "Osmolarity (mOsm/L)"],
          [
            ["5%", "50", "170", "253"],
            ["10%", "100", "340", "505"],
            ["20%", "200", "680", "1,010"],
            ["25%", "250", "850", "1,330"],
            ["50%", "500", "1,700", "2,525"],
            ["70%", "700", "2,380", "3,535"],
          ],
          "Table 55.6 Characteristics of dextrose solutions"
        ),
        points([
          "Plasma osmolarity is 280 mOsm/L. Dextrose above 10% is hyperosmolar enough to cause thrombophlebitis and needs a central line.",
          "Most central PN formulations use 50–70% dextrose, diluted to 15–30% once mixed with the other macronutrients.",
          "Lipid emulsion is 260 mOsm/L, almost the same as plasma; adding it lowers the osmolarity of the mixture and is why lipid is an important component of peripheral PN.",
          "The peripheral osmolarity ceiling and the catheter choices are in chapter 57 (the administration topic).",
        ]),
        quote("Concentrated dextrose solution (above 10%) has high osmolarity as compared to plasma osmolarity (280 mOsm/L)", "335"),
        quote("the osmolarity of lipid emulsion is low (260 mOsm/L), almost the same as that of plasma", "340"),
      ],
    },
    {
      id: "fluid",
      title: "Fluid requirement",
      blocks: [
        points([
          "Average-sized adult: about 25–30 mL/kg/d. Correct any volume deficit before starting PN.",
          "Add abnormal losses: diuretics, diarrhoea, vomiting, nasogastric drainage, wound output, perspiration. Enteric losses carry minerals, so add those too.",
          "Restrict in fluid overload from cardiac, pulmonary, hepatic or renal failure.",
          "Subtract the volume given by the enteral route from the estimated total.",
        ]),
        quote("In adult patients of average-sized, the fluid requirements are about 25–30 mL/kg/d.", "331"),
      ],
    },
    {
      id: "energy",
      title: "Energy: how much and how it is estimated",
      intro: "Total energy expenditure has four parts: resting energy expenditure (about two-thirds), activity (one-quarter to one-third), the thermal effect of food (about 10%) and the disease factor. The adult total is 20–30 kcal/kg/d.",
      blocks: [
        formula(
          "Simple weight-based estimate (Table 55.3)",
          "REE (kcal/day) = 30 × weight in kg",
          [
            { symbol: "REE", meaning: "resting energy expenditure", unit: "kcal/day" },
            { symbol: "weight", meaning: "actual body weight; ideal body weight in the obese", unit: "kg" },
          ],
          {
            example: "The chapter's worked patient: 60 kg at 25 kcal/kg gives 60 × 25 = 1500 kcal/day.",
            note: "The text multiplies actual body weight by 25–30 kcal and then adjusts for activity and illness (Table 55.4).",
          }
        ),
        formula(
          "Harris-Benedict equation (Table 55.3)",
          "Man: REE = 66 + (13.7 × W) + (5.0 × H) - (6.7 × A). Woman: REE = 655 + (9.6 × W) + (1.8 × H) - (4.7 × A)",
          [
            { symbol: "REE", meaning: "resting energy expenditure", unit: "kcal/day" },
            { symbol: "W", meaning: "weight: actual in the undernourished, ideal in the obese", unit: "kg" },
            { symbol: "H", meaning: "height", unit: "cm" },
            { symbol: "A", meaning: "age", unit: "years" },
          ],
          { note: "The book prints no Harris-Benedict worked example. Weight-based and Harris-Benedict estimates often overestimate; it is wiser to give fewer calories than too many." }
        ),
        formula(
          "Total energy expenditure from REE",
          "TEE = REE × AF × DF × TF",
          [
            { symbol: "TEE", meaning: "total energy expenditure", unit: "kcal/day" },
            { symbol: "REE", meaning: "resting energy expenditure from Harris-Benedict", unit: "kcal/day" },
            { symbol: "AF", meaning: "activity factor (Table 55.4)" },
            { symbol: "DF", meaning: "disease factor (Table 55.4)" },
            { symbol: "TF", meaning: "thermal factor for fever (Table 55.4)" },
          ]
        ),
        table(
          ["Activity factor (AF)", "Disease factor (DF)", "Thermal factor (TF)"],
          [
            ["1.2 bed rest", "1.10 on ventilator", "1.1 at 38°C"],
            ["1.3 out of bed", "1.25 general surgery", "1.2 at 39°C"],
            ["1.4 active", "1.3 sepsis", "1.3 at 40°C"],
            ["-", "1.6 multiorgan failure", "1.4 at 41°C"],
            ["-", "1.7 30–50% burns", "-"],
            ["-", "1.8 50–70% burns", "-"],
            ["-", "2.0 70–90% burns", "-"],
          ],
          "Table 55.4 Guidelines for adjustment in energy requirements"
        ),
        formula(
          "Indirect calorimetry (Table 55.3)",
          "REE (Man) = (3.9 × VO2) + (1.1 × VCO2) - 61",
          [
            { symbol: "REE", meaning: "resting energy expenditure", unit: "kcal/day" },
            { symbol: "VO2", meaning: "oxygen consumption measured by the metabolic cart" },
            { symbol: "VCO2", meaning: "carbon dioxide production measured by the metabolic cart" },
          ],
          { note: "The gold standard: the other two methods are inaccurate in the significantly underweight, overweight or critically ill. The text does not print the units of VO2 and VCO2." }
        ),
        caution([
          "Severely malnourished critically ill patients are at high risk of refeeding syndrome: start with hypocaloric PN (less than 20 kcal/kg/d) with adequate protein.",
        ]),
        quote("Adult patients' appropriate total energy requirement is 20–30 kcal/kg/d", "332"),
        quote("it is wiser to administer lesser calories rather than too many calories", "333"),
        quote("administer hypocaloric PN (energy intake less than 20 kcal/kg/d) with adequate protein intake", "333"),
      ],
    },
    {
      id: "macronutrient_split",
      title: "How the calories are divided",
      blocks: [
        table(
          ["Macronutrient", "% contribution", "Calories per gm"],
          [
            ["Carbohydrates", "50–60%", "1 gm dextrose = 3.4 kcal"],
            ["Lipids", "20–30%", "1 gm lipid = 9 kcal"],
            ["Proteins", "15–20%", "1 gm protein = 4 kcal"],
          ],
          "Table 55.5 Macronutrient composition in PN solutions"
        ),
        points([
          "Energy comes mainly from the non-protein calories (carbohydrate and lipid); protein is directed to anabolism, not fuel.",
          "In practice non-protein calories are given roughly 60–70% as glucose and 30–40% as lipid. The mixed fuel cuts CO2 production and the work of breathing in stressed patients.",
          "Overfeeding causes severe hyperglycaemia with osmotic diuresis, more nosocomial infection, higher oxygen consumption and CO2 production, and hepatic steatosis.",
        ]),
        quote("a common approach is to provide approximately 60–70% of calories from glucose and 30–40% from lipids", "333"),
      ],
    },
    {
      id: "dextrose",
      title: "Dextrose",
      intro: "The cheapest and most used calorie source. Hydrated dextrose monohydrate gives 3.4 kcal/gm (dietary carbohydrate 4 kcal/gm). Usually 50–70% of total energy is given as dextrose.",
      blocks: [
        table(
          ["Rule", "Number in the text"],
          [
            ["Requirement, stable patient", "about 4–5 mg/kg/min"],
            ["Requirement, critically ill, trauma, sepsis", "less than 4 mg/kg/min"],
            ["Never exceed", "5 mg/kg/min"],
            ["Maximum rate of oxidation", "about 4–5 mg/kg/min, that is 5.8–7.2 gm/kg/day"],
            ["Minimum for obligate glucose users (brain, red cells, immune cells, renal medulla)", "about 2 gm/kg/d, a minimum of 100–150 gm/day"],
            ["First day of PN", "no more than 150 to 200 gm"],
            ["First day in diabetes or refeeding risk", "100 to 150 gm"],
            ["Start rate when hyperglycaemia is likely (diabetes, sepsis, obesity, steroids)", "1–2 gm/kg body weight/day"],
            ["Blood sugar target", "140–180 mg/dL"],
            ["Insulin usually started at", "more than 140 mg/dL if diabetic; more than 180 mg/dL if non-diabetic"],
          ],
          "Dose, rate and glucose limits"
        ),
        points([
          "Insulin, when needed, is given by continuous infusion or added to the nutrition bag; both are common and efficient.",
          "Hyperglycaemia is the commonest drawback: intravenous dextrose bypasses the entero-insular axis, so the same load raises glucose more than oral or enteral carbohydrate.",
          "Carbohydrate has the highest respiratory quotient (1.0); it is not the sole calorie source in a respiratory-compromised patient or one weaning from the ventilator.",
          "Nitrogen sparing: glucose stimulates insulin, reduces muscle protein breakdown and spares amino acid oxidation.",
        ]),
        formula(
          "Grams of dextrose from carbohydrate calories",
          "gm dextrose/day = carbohydrate kcal/day ÷ 3.4",
          [
            { symbol: "carbohydrate kcal/day", meaning: "the share of total energy to be given as dextrose", unit: "kcal/day" },
            { symbol: "3.4", meaning: "kcal per gm of hydrated dextrose monohydrate", unit: "kcal/gm" },
          ],
          { example: "60 kg man at 25 kcal/kg/d = 1500 kcal/day; 60% as carbohydrate = 900 kcal; 900 ÷ 3.4 = 264.7 gm dextrose/day. D50 has 50 gm per 100 mL, so about 529 mL/day, 22 mL per hour." }
        ),
        quote("Dextrose requirements are about 4–5 mg/kg/min in stable patients and less than 4 mg/kg/min in critically ill", "334"),
        quote("Start with no more than 150 to 200 gm of dextrose on the first day of PN.", "334"),
        quote("maintain blood sugar levels between 140–180 mg/dL", "335"),
        quote("900 divided by 3.4 = 264.7 gm of dextrose/day.", "336"),
      ],
    },
    {
      id: "protein",
      title: "Protein and nitrogen",
      intro: "Given as free crystalline amino acids to synthesise protein, replace nitrogen losses and prevent skeletal muscle breakdown, not as fuel. About 15 to 20% of total energy should come from protein, with enough non-protein calories alongside or the protein is burnt.",
      blocks: [
        points([
          "1 gm of amino acid oxidised gives 4 kcal. 6.25 gm of protein contains 1 gm of nitrogen.",
          "Standard solutions are 3 to 15%; a 10% solution holds 100 gm of protein per litre. About 40–50% of the amino acids are essential.",
          "Calorie to nitrogen ratio of 100–150:1 is satisfactory for normal patients.",
          "Stable adult: about 0.8–1.5 gm/kg/day. Critically ill: optimal about 1.5 gm/kg/day; more does not produce a positive nitrogen balance, and above 1.7 gm/kg/day it goes to ureagenesis, not anabolism.",
          "Higher need (1.5–2.5 gm/kg/day) in massive burns, severe trauma, hypoproteinaemia, protein-losing enteropathy or nephropathy, and on dialysis.",
        ]),
        table(
          ["Clinical condition", "Protein (gm/kg ideal body weight/day)"],
          [
            ["Stable", "0.8–1.5"],
            ["Critically ill, trauma, sepsis", "1.2–2.5"],
            ["Acute kidney injury (undialysed)", "0.8–2.0"],
            ["Renal replacement therapy", "Additional 0.2 gm/kg/d, up to 2.5 gm/kg/d"],
            ["Burns", "1.5–2.0"],
            ["Hepatic failure", "1.2–2.0"],
            ["Traumatic brain injury", "1.5–2.5"],
          ],
          "Table 55.7 Recommended daily protein intake"
        ),
        formula(
          "Nitrogen balance (stable patients on amino acid infusion)",
          "Nitrogen Balance = Nitrogen Intake - Nitrogen Loss; Nitrogen Intake = Protein Intake (gm) / 6.25; Nitrogen Loss = 24-Hour UUN + 4",
          [
            { symbol: "Nitrogen Intake", meaning: "grams of nitrogen given, from protein intake divided by 6.25", unit: "gm/day" },
            { symbol: "Protein Intake", meaning: "protein infused in 24 hours", unit: "gm" },
            { symbol: "24-Hour UUN", meaning: "grams of nitrogen excreted in the urine over 24 hours as urea nitrogen", unit: "gm" },
            { symbol: "4", meaning: "4 gm of nitrogen lost each day as insensible losses through skin and gastrointestinal tract", unit: "gm/day" },
          ],
          { note: "Positive balance suggests anabolism or nitrogen retention; negative balance suggests net nitrogen loss." }
        ),
        formula(
          "Amino acid solution volume",
          "protein (gm/day) = weight (kg) × dose (gm/kg/day); volume (mL) = protein (gm) ÷ gm per 100 mL × 100",
          [
            { symbol: "dose", meaning: "protein requirement for the clinical condition (Table 55.7)", unit: "gm/kg/day" },
            { symbol: "gm per 100 mL", meaning: "5 for a 5% solution, 10 for a 10% solution", unit: "gm/100 mL" },
          ],
          { example: "60 kg man at 1.0 gm/kg/day needs 60 gm/day: 1200 mL of 5% or 600 mL of 10% amino acid solution." }
        ),
        caution([
          "Reduce or stop standard amino acids if BUN exceeds 100 mg/dL, or if a patient with hepatic encephalopathy worsens with a rising ammonia during the infusion.",
          "Hepatic insufficiency: standard amino acids may cause metabolic alkalosis, raised ammonia, stupor or coma. Renal failure: marked rise in BUN. Excess acetate in the solution can worsen alkalosis.",
          "Excess protein or too few calories makes urea; the renal water loss can cause hypertonic dehydration, especially in young children, unless extra water is given.",
        ]),
        quote("6.25 gm of protein contains 1 gm of nitrogen.", "336"),
        quote("A calorie to nitrogen ratio of 100–150:1 will be satisfactory for normal patients.", "336"),
        quote("if excess protein (>1.7 gm/kg/day) is provided, it results in excess ureagenesis", "337"),
        quote("Nitrogen Loss = 24-Hour UUN + 4", "337"),
        quote("required volume of 5% and 10% of amino acid preparations will be 1200 and 600 ml/day, respectively", "338"),
      ],
    },
    {
      id: "lipids",
      title: "Lipid emulsions",
      intro: "Lipid injectable emulsions give dense calories (9 kcal/gm) that cut the dextrose load, and supply the essential fatty acids linoleic and linolenic acid. Soybean emulsions contain egg-yolk phospholipid as emulsifier, glycerin for isotonicity and sodium hydroxide to bring the pH to about 8.0.",
      blocks: [
        table(
          ["Rule", "Number in the text"],
          [
            ["Calories", "10% = 1.1 kcal/mL; 20% = 2.0 kcal/mL; 30% = 3.0 kcal/mL"],
            ["Osmolarity", "260 mOsm/L"],
            ["30% emulsion", "only for pharmacy total nutrient admixture (3-in-1); not for direct intravenous administration"],
            ["Share of non-protein calories", "about 25–40%"],
            ["Requirement (ASPEN 2019)", "1 gm/kg/d stable; less than 1 gm/kg/d critically ill, trauma, sepsis"],
            ["Start dose", "0.7 gm/kg/day"],
            ["Upper recommended dose", "1 gm/kg/day"],
            ["Never exceed (ESPEN 2019)", "1.5 gm/kg/day"],
            ["Infusion rate", "not above 0.7 kcal/kg/hr; complications with more than 1.0 kcal/kg/hr or 0.11 gm/kg/hr"],
            ["Infusion time", "slowly over 12 hours; discard bottles and tubing hung alone after 12 hours"],
            ["PN bag hang time", "maximum 24 hours; discard remaining solution and tubing"],
            ["Triglycerides", "check at least weekly; reduce or stop if above 400 mg/dL; do not use if above 1000 mg/dL"],
            ["For essential fatty acids only", "3 to 4 days a week; daily when used as a calorie source"],
          ],
          "Dose, rate and stop rules"
        ),
        points([
          "No lipid for more than 2 weeks causes essential fatty acid deficiency: dry scaly rash, hair loss, thrombocytopenia, anaemia, poor wound healing, infection. Beyond 2 weeks give about 2% to 4% of total calories as linoleic acid and 0.25% to 0.5% as alpha-linolenic acid.",
          "Respiratory quotient: lipid 0.7, protein 0.8, carbohydrate 1.0; lipid makes the least CO2 and is preferred in respiratory compromise.",
          "Wrap in aluminium foil or carbon paper: light forms toxic peroxides. Lipid is a rich medium for bacteria and fungi, so scrupulous handwashing before handling.",
          "Given piggyback with a 2-in-1 (dextrose and amino acids) or as a 3-in-1 all-in-one bag. Lipid is less stable in a 3-in-1: destabilised droplets coalesce and can embolise, and the bag has a shorter storage life.",
          "Most adverse effects are from hypertriglyceridaemia (infusion faster than lipoprotein lipase clears it), not from the lipid itself.",
        ]),
        table(
          ["Generation", "Composition", "Omega-6 : omega-3", "Rationale and benefits", "Products"],
          [
            ["First", "100% soy oil", "7:1", "Supplies essential fatty acids and energy", "Intralipid, Nutrilipid"],
            ["Second", "50% soy oil, 50% MCT", "7:1", "MCT reduces the soy and omega-6 content", "Lipofundin MCT/LCT"],
            ["Third", "20% soy oil, 80% olive oil", "9:1/NA", "Less soy; less inflammation and immune suppression", "ClinOleic/Clinolipid"],
            ["Fourth", "30% soy oil, 30% MCT, 25% olive oil, 15% fish oil", "2.5:1", "Lower omega-6:omega-3, fewer infections, shorter stay; preferred in critically ill and surgical patients", "SMOFlipid"],
          ],
          "Table 55.8 Classification, composition and benefits of lipid injectable emulsions",
          "First-generation soybean emulsions are recommended for short-term use (less than 2 weeks) in stable patients with normal liver function tests. Fish-oil-containing emulsions are preferred in sepsis, critical illness and surgical patients."
        ),
        points([
          "Large amount of calories in a small volume.",
          "Improves glucose tolerance and reduces insulin levels.",
          "Reduces the risk of refeeding syndrome.",
          "Lower osmolarity: less thrombophlebitis, safe for peripheral PN.",
          "Supplies essential fatty acids.",
          "Less CO2 production than glucose oxidation, useful in respiratory compromise and ventilator weaning.",
        ], "Table 55.9 Advantages of lipid emulsion in PN solutions"),
        formula(
          "Lipid emulsion volume",
          "volume (mL) = lipid kcal/day ÷ kcal per mL",
          [
            { symbol: "lipid kcal/day", meaning: "the share of total energy to be given as lipid", unit: "kcal/day" },
            { symbol: "kcal per mL", meaning: "1.1 for a 10% emulsion, 2.0 for a 20% emulsion", unit: "kcal/mL" },
          ],
          {
            example: "60 kg man at 25 kcal/kg/d = 1500 kcal/day; 30% as lipid = 450 kcal; 10% emulsion about 409 mL (450 ÷ 1.1); 20% emulsion 225 mL (450 ÷ 2.0).",
            note: "The printed example says 'to provide 600 kcal/day' in one sentence while the arithmetic uses 450 kcal (30% of 1500). The inconsistency is the source's and is reproduced as printed.",
          }
        ),
        caution([
          "Avoid lipid in severe hypertriglyceridaemia, risk of fat embolism, hypersensitivity to the emulsion, severe metabolic acidosis, acute shock, anaemia, severe coagulopathy and intravascular coagulation. Use cautiously in the obese (more hyperglycaemia and hypertriglyceridaemia).",
          "Reduce or stop lipid above 400 mg/dL triglycerides: pancreatitis, and reduced diffusion capacity in severe chronic obstructive lung disease.",
        ]),
        quote("at a dose of 0.7 gm/kg/day, the upper recommended dose is 1 gm/kg/day, and it should not exceed 1.5 gm/kg/day (ESPEN 2019)", "339"),
        quote("reduce dose if serum triglycerides >400 mg/dL and do not use if serum triglycerides >1000 mg/dL", "341"),
        quote("the rate should not exceed 0.7 kcal/kg/hr.", "341"),
        quote("PN solution bag may hang for a maximum of 24 hours", "341"),
        quote("to provide 600 kcal/day required volume of 10% and 20% of lipid emulsion will be about 409 ml", "342"),
      ],
    },
    {
      id: "special_amino_acids",
      title: "Disease-specific amino acids and immunonutrients",
      blocks: [
        points([
          "Hepatic formula: rich in branched-chain amino acids (valine, leucine, isoleucine; 35–45%), low in aromatic amino acids and methionine. Recommended only in cirrhosis with grade III–IV hepatic encephalopathy refractory to standard management; mental recovery improves but outcome does not, and cost is high, so it is not first-line.",
          "Use standard amino acids in liver disease without encephalopathy, in grade I or II, once encephalopathy resolves, and for pre-operative nutrition after liver transplantation.",
          "Acute kidney injury: do not restrict protein. Non-catabolic non-dialysis AKI 0.8–1.0 gm/kg/day; on renal replacement 1.0–1.5 gm/kg/d (KDIGO 2012) or an extra 0.2 gm/kg/day up to 2.5 gm/kg/day (ASPEN 2016). Nephro-solutions are controversial; they may help patients not needing dialysis.",
          "Glutamine: not recommended in critically ill, unstable and complex ICU patients or multiorgan failure, especially with liver or renal failure (Canadian 2015, ASPEN 2016, ESPEN 2019). May be used in stable PN patients with adequate energy and protein after excluding haemodynamic instability and hepatic or renal failure: 0.2–0.4 gm/kg/day (0.3–0.6 gm/kg/day of alanyl-glutamine dipeptide).",
          "Omega-3 fatty acids: emulsions containing them reduce infection, sepsis and ICU and hospital stay and are preferred over standard emulsions in hospitalised adults on PN. SMOFlipid is 30% soybean, 30% MCT, 25% olive, 15% fish oil.",
          "Arginine alone is not recommended in the critically ill or severe sepsis. An enteral formula with arginine and fish oil is used perioperatively in malnourished patients having major cancer surgery and in severe trauma.",
        ]),
        quote("BCAAs should not be used as the first-line treatment for hepatic encephalopathy", "342"),
        quote("the recommended dose of glutamine is 0.2–0.4 gm/kg/day (0.3–0.6 gm/kg/day of alanyl-glutamine dipeptide)", "343"),
      ],
    },
    {
      id: "electrolytes",
      title: "Electrolytes",
      blocks: [
        table(
          ["Electrolyte", "Daily parenteral requirement (adult)"],
          [
            ["Sodium", "1.0–2.0 mEq/kg"],
            ["Potassium", "1.0–2.0 mEq/kg"],
            ["Magnesium", "8.0–20 mEq"],
            ["Phosphate", "20–40 mmol"],
            ["Calcium", "10–15 mEq"],
          ],
          "Table 55.10 Electrolytes",
          "Values for a normal adult; modify for the clinical situation."
        ),
        points([
          "Sodium is restricted where volume overload threatens (cardiac, liver, renal failure) and given liberally where expansion is wanted (GI losses).",
          "Potassium need rises with renal potassium loss, amphotericin B, and in the severely malnourished as PN starts.",
          "After phosphate is met, sodium and potassium are added as chloride or acetate salts. Acetate becomes bicarbonate in the liver: preferred in metabolic acidosis. Chloride salts for large chloride loss (nasogastric aspiration) with metabolic alkalosis.",
        ]),
        caution([
          "Sodium bicarbonate is incompatible with PN: it precipitates with calcium and magnesium. Never infuse bicarbonate through a common line with PN.",
        ]),
        quote("acetate is a preferred salt in patients with metabolic acidosis", "344"),
        quote("bicarbonate salts should never be infused through a common intravenous line with PN.", "345"),
      ],
    },
    {
      id: "micronutrients",
      title: "Trace elements and vitamins",
      blocks: [
        table(
          ["Trace mineral", "Daily requirement", "Fat-soluble vitamin", "Daily requirement"],
          [
            ["Chromium", "≤10 mcg", "Vitamin A", "990 mcg (3300 IU)"],
            ["Copper", "0.3–0.5 mg", "Vitamin D", "5.0 mcg (200 IU)"],
            ["Manganese", "55 mcg", "Vitamin E", "10 mg (10 IU)"],
            ["Selenium", "60–100 mcg", "Vitamin K", "150 mcg"],
            ["Zinc", "3.0–5.0 mg", "-", "-"],
          ],
          "Table 55.10 Trace minerals and fat-soluble vitamins"
        ),
        table(
          ["Water-soluble vitamin", "Daily requirement"],
          [
            ["Thiamine (B1)", "6.0 mg"],
            ["Riboflavin (B2)", "3.6 mg"],
            ["Niacin (B3)", "40 mg"],
            ["Pantothenic acid (B5)", "15 mg"],
            ["Pyridoxine (B6)", "6.0 mg"],
            ["Folic acid (B9)", "600 mcg"],
            ["Cobalamin (B12)", "5.0 mcg"],
            ["Ascorbic acid (C)", "200 mg"],
            ["Biotin", "60 mcg"],
          ],
          "Table 55.10 Water-soluble vitamins"
        ),
        points([
          "Standard trace-element mixes contain zinc, copper, chromium, manganese and selenium; they do not contain iron or iodine. Iodine need is 70–150 mcg/day and elemental iron 1 mg/day.",
          "Iron is usually not given: body stores suffice, it destabilises lipid emulsion (incompatible with 3-in-1 bags) and free iron may feed bacteria in the critically ill.",
          "Selenium for long-term PN: deficiency causes muscle weakness and fatal cardiomyopathy.",
          "Deficiency develops quickly in stressed patients or with GI losses; stable patients show none for about two months without supplementation.",
          "Parenteral trace-element needs are lower than enteral (poor gut absorption, chromium under 10%), but some are higher than body need because systemic delivery bypasses the liver and is lost in urine.",
          "Vitamins are the reverse: parenteral needs exceed enteral. Light degrades vitamin A, riboflavin and vitamin K; sulfite preservative degrades thiamine; some adheres to tubing and bags. Water-soluble vitamins are given at four to five times the usual requirement.",
          "Aqueous multivitamin preparations lack vitamin K, which is given in the multivitamin or added to the lipid; it may harm a patient on oral anticoagulants.",
          "Add vitamins and trace elements to the bag shortly before use, for stability.",
        ]),
        quote("The daily requirement of iodine is 70–150 mcg and 1 mg of elemental iron", "345"),
        quote("The recommended dose for water-soluble vitamins is four to five times the usual", "346"),
        quote("it may be detrimental to patients receiving oral anticoagulants", "346"),
      ],
    },
    {
      id: "prescription_60kg",
      title: "The chapter's 60 kg worked examples, assembled",
      intro: "Chapter 55 works each macronutrient for the same patient: a 60 kg man at 25 kcal/kg/d. The three calculations are printed separately (dextrose page 336, protein page 338, lipid page 342); chapter 57 builds a different 60 kg prescription by subtracting protein and lipid calories first, and that build is in the administration topic.",
      blocks: [
        steps([
          "Total energy: 60 × 25 = 1500 kcal/day.",
          "Dextrose, 60% of total: 900 kcal. 900 ÷ 3.4 = 264.7 gm dextrose/day. D50 holds 50 gm per 100 mL, so about 529 mL/day of D50, 22 mL per hour.",
          "Protein at 1.0 gm/kg: 60 gm/day. A 5% solution gives 5 gm per 100 mL, a 10% solution 10 gm per 100 mL, so 1200 mL of 5% or 600 mL of 10%.",
          "Lipid, 30% of total: 450 kcal. 10% emulsion is 1.1 kcal/mL, so about 409 mL; 20% emulsion is 2.0 kcal/mL, so 225 mL.",
          "Add electrolytes, trace elements and vitamins from Table 55.10, adjusted to the clinical situation.",
          "Apply the first-day limits before running the full prescription: no more than 150 to 200 gm dextrose (100 to 150 gm in diabetes or refeeding risk), lipid from 0.7 gm/kg/day.",
        ]),
        quote("Total caloric requirements will be 60×25=1500 kcal/day", "336"),
        quote("required volume of D50 will be about 529 ml/day (22 ml per hour)", "336"),
        quote("lipid requirement will be 450 (30% of 1500) kcal/day", "342"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring in the text",
      blocks: [
        points([
          "Blood sugar: keep 140–180 mg/dL; insulin only if necessary.",
          "Triglycerides at least weekly on lipid; reduce or stop the lipid above 400 mg/dL.",
          "Nitrogen balance in stable patients on amino acids: 24-hour urine urea nitrogen plus 4 gm against protein intake divided by 6.25.",
          "BUN: reduce or stop standard amino acids above 100 mg/dL. Ammonia and mental state in hepatic encephalopathy.",
        ]),
        quote("triglyceride levels should be monitored at least weekly", "341"),
      ],
    },
    {
      id: "cautions",
      title: "Never and avoid",
      blocks: [
        caution([
          "PN must not be undertaken lightly; it is potentially harmful and dangerous without due precautions. The decision to start is never an emergency.",
          "Dextrose should not exceed 5 mg/kg/min. No more than 150 to 200 gm on day one.",
          "Lipid should not exceed 1.5 gm/kg/day; reduce above 400 mg/dL triglycerides, none above 1000 mg/dL; rate not above 0.7 kcal/kg/hr.",
          "30% lipid emulsion is not for direct intravenous administration.",
          "Discard lipid hung alone after 12 hours; a PN bag hangs for a maximum of 24 hours.",
          "Bicarbonate is never infused through a common line with PN.",
          "Iron is incompatible with 3-in-1 lipid-containing PN and is not routine in the critically ill.",
          "Dextrose above 10% needs a central line.",
          "Protein above 1.7 gm/kg/day makes urea, not muscle.",
          "Branched-chain amino acid formula is not first-line for hepatic encephalopathy; glutamine is not for the unstable, critically ill or those with multiorgan, liver or renal failure.",
          "Vitamin K may be detrimental with oral anticoagulants.",
        ]),
        quote("parenteral nutrition must not be undertaken lightly", "331"),
        quote("it is not recommended for direct intravenous administration", "338"),
      ],
    },
  ],
};
