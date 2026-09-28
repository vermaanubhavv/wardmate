import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * PARENTERAL NUTRITION: ADMINISTRATION AND COMPLICATIONS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 57, which the source edition carries in full. Every number below is the
 * book's; the quotes give the PDF page it came from. Requirements and the per-nutrient rules
 * (chapter 55) and disease-specific PN (chapter 56) are separate topics.
 */
export const parenteralNutritionAdministrationV1: FluidTopic = {
  id: "parenteral_nutrition_administration",
  version: "1.0.0",
  title: "Parenteral nutrition: administration, refeeding and complications",
  group: "settings",
  summary: "Peripheral or central, which bag and which line, how to start and stop, and the mechanical, infective and metabolic complications with the book's management of each, refeeding syndrome above all.",
  setting: "Adult ICU, surgical and medical wards; nutrition support teams",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["57 Parenteral Nutrition: Administration and Complications"], pages: "379–402" },
  sections: [
    {
      id: "macronutrients",
      title: "Which macronutrients the patient needs",
      blocks: [
        table(
          ["Patient", "What the text gives"],
          [
            ["Stable, not malnourished, no oral intake for less than a week", "No PN. Dextrose infusion (more than 100 gm/day in an adult) with electrolytes and vitamins; grams of dextrose = daily kcal ÷ 3.4. Conserves nitrogen."],
            ["Stable, not malnourished, short duration (less than one week), low calorie need", "Amino acids plus dextrose (2-in-1). Introduce lipid within 7 days or less of starting PN to prevent essential fatty acid deficiency and to limit hyperglycaemia from a high glucose load."],
            ["Prolonged PN; peripheral PN needing significant calories but intolerant of carbohydrate; critically ill; hyperglycaemia, diabetes, respiratory failure", "All three macronutrients (dextrose, amino acids, lipid). Lipid adds calories, lowers the osmolarity and prevents essential fatty acid deficiency."],
          ]
        ),
        quote("dextrose infusions (>100 gm/day in adults), electrolytes, and vitamins serve as the primary approach", "380"),
        quote("introduce lipid administration within ≤7 days of starting PN to prevent essential fatty acid deficiency", "380"),
      ],
    },
    {
      id: "peripheral",
      title: "Peripheral PN",
      intro: "For a short period (less than 2 weeks) when central PN is undesirable or unavailable. The osmolarity of the formula must be below 900 mOsm/L: low-concentration dextrose (5–10%) and amino acids with a calorie-dense 20% lipid emulsion, whose 260 mOsm/L brings the osmolarity down and protects the vein.",
      blocks: [
        table(
          ["Feature", "Peripheral PN", "Central PN"],
          [
            ["Route", "Peripheral veins", "Central venous access"],
            ["Access site", "Peripheral veins", "Large peripheral veins or central veins"],
            ["Catheter tip", "Below the level of the axillary vein", "Central circulation (usually SVC, uncommonly IVC)"],
            ["Duration", "less than 2 weeks", "more than 7–14 days"],
            ["Nutritional needs", "Low", "High"],
            ["Daily calories", "1000–1500", "2000–3000"],
            ["Daily volume (mL)", "2000–3000", "1000–2000"],
            ["Osmolarity (mOsm/L)", "Low (600–850)", "High (more than 800–900)"],
            ["Carbohydrate", "30%", "55%–60%"],
            ["Fat emulsion", "Major caloric source", "Minor caloric source"],
            ["Prerequisite", "Good peripheral veins", "Successful cannulation of large peripheral or central veins"],
            ["Fluid", "No fluid restriction", "Needs fluid restriction"],
            ["Advantages", "Easy insertion, lower risk of infection and complications", "No limit to osmolality, pH or volume of infusion"],
            ["Disadvantages", "Short life span, only low-osmolality infusion", "Complex insertion, higher complication risk and cost"],
            ["Common complication", "Thrombophlebitis of veins", "Catheter sepsis"],
          ],
          "Table 57.1 Comparison of peripheral and central PN"
        ),
        points([
          "PN needed for less than a week; postoperative patients are the most suitable candidates.",
          "Nutritional need below 1500–1800 kcal per day.",
          "Central catheter insertion impossible, high-risk or contraindicated (for example coagulopathy).",
          "Sepsis or bacteraemia in a patient on central PN, to rest the central veins for a few days.",
        ], "Indications"),
        points([
          "High nutritional need (hypermetabolism, moderate to severe malnutrition, high risk of protein depletion): PPN cannot deliver enough.",
          "Fluid restriction: oliguria, oedema from cardiac, hepatic or renal failure.",
          "Critically ill patients who will not tolerate the volume PPN needs.",
          "PPN that cannot meet the full requirement: give PN centrally.",
          "PN needed for more than 2 weeks.",
        ], "Contraindications"),
        steps([
          "Add heparin (1 U/mL of total volume) and low-dose hydrocortisone to the formula.",
          "Glyceryl trinitrate transdermal patch on the skin over the catheter tip.",
          "Topical NSAID cream or gel over the vein.",
          "Limit the osmolarity of the PPN to 600 mOsm/L.",
          "Change the peripheral line every 72–96 hours.",
        ], "Preventing thrombophlebitis"),
        quote("The osmolarity of formulas for PPN should be less than 900 mOsm/L", "381"),
        quote("Limiting the osmolarity of PPN to 600 mOsm/L.", "382"),
        quote("Chang peripheral lines every 72–96 hours.", "382"),
      ],
    },
    {
      id: "central",
      title: "Central PN and the catheter",
      intro: "The most effective way to deliver a concentrated formula in a small volume, into the superior (uncommonly inferior) vena cava, for a patient needing PN for more than 7–14 days. The position of the distal tip, not the insertion site, makes an access central.",
      blocks: [
        points([
          "Mandatory for long-term PN (weeks to years) and whenever the formula cannot go peripherally: osmolarity above 800–900 mOsm/L, pH below 5 or above 9, or fluid restriction.",
          "Dextrose 50–70% and amino acids 8.5–10% make the solution hypertonic: 1000–1900 mOsm/L against a plasma osmolarity of 280 mOsm/L. Too irritant for a peripheral vein; central access only.",
          "Because dextrose and amino acids supply most of the calories, CPN needs less fat emulsion than PPN.",
          "Polyurethane for short- and medium-term use (less breakage, more thrombosis and infection); silicone for long-term or lifelong PN (less thrombosis and infection, suits ethanol locks, less mechanical stability). Antimicrobial-impregnated catheters reduce catheter-related bloodstream infection.",
          "Tip in the lower third of the superior vena cava or at the cavoatrial junction, parallel to the vessel wall; confirm by chest radiograph, fluoroscopy, point-of-care echocardiography or continuous ECG. The post-procedure film also shows pneumothorax, malposition and kinking.",
          "A single-lumen catheter used exclusively for PN: no other infusions or drugs, no blood sampling, no central venous pressure monitoring through it.",
        ]),
        table(
          ["Access", "Duration in the text", "Notes"],
          [
            ["Percutaneous non-tunnelled catheter (Seldinger; internal jugular, subclavian or femoral)", "short term, less than 14 days", "Preferred in acute care; upper-body site preferred; femoral discouraged (infection, thrombosis). Avoid for long-term PN."],
            ["PICC (50–60 cm polyurethane, cephalic or basilic vein, tip in lower SVC or right atrium)", "usually more than 2 weeks, less than six months", "Convenient, low placement risk, cost-effective; higher catheter-related venous thrombosis, possibly higher bloodstream infection. Sutureless securement with a subcutaneously anchored device."],
            ["Tunnelled catheter (Hickman, Broviac, Hohn, Groshong)", "more than 3 months to years", "Preferred for daily long-term access. Subclavian or internal jugular; tunnel about 10 cm under the skin; Dacron cuff 2 to 3 cm from the exit site as a bacterial barrier."],
            ["Implanted subcutaneous port", "more than 3 months to years", "Lower infection, cosmetically preferred, but rarely used for PN because access is needed every day."],
          ],
          "Sites and devices for central PN"
        ),
        quote("osmolarity of CPN 1000–1900 mOsm/L as compared to plasma osmolarity 280 mOsm/L", "383"),
        quote("femoral vein catheterization is discouraged because of the higher risk of infection and thrombotic complications", "383"),
      ],
    },
    {
      id: "systems_and_mode",
      title: "Delivery systems and infusion mode",
      blocks: [
        table(
          ["System", "For", "Against"],
          [
            ["Multiple bottle (separate bottles of carbohydrate, lipid, amino acid)", "Cheap; flexible; easy to adjust in a critically ill patient with changing needs", "Frequent handling and more nosocomial infection; different rates, additives and monitoring invite mistakes; physicochemical incompatibility; costlier once disposables and nursing time are counted"],
            ["Multichamber bag: 2CB (dextrose and amino acids) or 3CB (with lipid), with or without electrolytes", "Convenient single-line ready-to-use bag; less handling so fewer bloodstream infections; fewer calculation and compounding errors; recommended over compounded PN by SCCM-ASPEN 2016 when it meets the need; cheaper; long shelf life", "Composition cannot be changed; easy availability invites overuse; a 3-in-1 bag is opaque, hiding particulates, precipitate or fungal growth"],
            ["Hospital-compounded admixture", "Tailored to the individual", "Needs a sophisticated aseptic facility and skilled pharmacists; use is falling; greater risk of sepsis"],
          ],
          "Systems of delivering PN"
        ),
        points([
          "Continuous: pump at a constant rate over 24 hours. The usual regimen for acute, critical and hospitalised patients; avoids volume overload and the hyperglycaemia and hypertriglyceridaemia of fast infusion. Drawbacks: tethered to the pump, and fatty liver from continuously high insulin.",
          "Cyclic: a higher rate over 10 to 14 hours, typically overnight, then off. Better quality of life, fewer hepatobiliary complications, may limit or reverse PN-associated liver dysfunction. Attempt cautiously with glucose intolerance or oedema; not for the critically ill; effective and safe for stable long-term and home PN.",
        ], "Continuous versus cyclic"),
        quote("PN is infused at a higher rate over 10 to 14 hours (typically at night when the patient is sleeping)", "386"),
      ],
    },
    {
      id: "prescription",
      title: "Designing the formula: the 60 kg build",
      intro: "PN is a high-alert medication. Step 1 calculates the daily requirement and turns it into a prescription; step 2 chooses the commercial formula that matches it. The chapter's sample patient weighs 60 kg and is stable, euvolaemic with good urine output and under moderate stress.",
      blocks: [
        points([
          "Weight.",
          "Clinical status: stable or critical.",
          "Medical or surgical condition for which PN is indicated.",
          "Nutritional status and malnutrition, volume status, urine volume.",
          "Coexisting disorders: diabetes, hypertension, congestive heart failure, renal, liver and pulmonary disease, sepsis.",
          "Electrolyte and acid–base status.",
        ], "Table 57.2 Factors determining PN requirements"),
        steps([
          "Fluid at about 35 mL/kg: 35 × 60 = 2100 mL/day.",
          "Calories at about 25 kcal/kg: 25 × 60 = 1500 kcal/day.",
          "Protein for a stable patient at 1 gm/kg: 1 × 60 = 60 gm/day. At 4 kcal/gm that is 60 × 4 = 240 kcal.",
          "Lipid at 30% of total calories: 30% of 1500 = 450 kcal. At 9 kcal/gm, 450/9 = 50 gm of fat.",
          "Carbohydrate takes the rest: 1500 − (240 + 450) = 1500 − 690 = 810 kcal. At 3.4 kcal/gm, 810/3.4 = 238 gm of dextrose.",
          "Prescription: 2100 mL fluid, 1500 kcal, 60 gm amino acids, 50 gm fat, 238 gm dextrose, plus electrolytes, trace elements and vitamins as required.",
          "Choose the readymade solution that most closely matches. Permitted volume and nutrient concentration are inversely proportional: a concentrated bag (central) when fluid is restricted, a dilute one (peripheral) when volume is allowed. Micronutrients are co-administered.",
        ], "Step 1 and step 2 for the 60 kg patient"),
        formula(
          "Dextrose from the remaining calories",
          "gm dextrose/day = (total kcal − protein kcal − lipid kcal) ÷ 3.4",
          [
            { symbol: "total kcal", meaning: "kcal/kg × weight", unit: "kcal/day" },
            { symbol: "protein kcal", meaning: "grams of protein × 4", unit: "kcal/day" },
            { symbol: "lipid kcal", meaning: "the chosen share of total calories, here 30%; grams of fat = lipid kcal ÷ 9", unit: "kcal/day" },
            { symbol: "3.4", meaning: "kcal per gm of dextrose in solution", unit: "kcal/gm" },
          ],
          { example: "1500 − (240 + 450) = 810 kcal; 810/3.4 = 238 gm dextrose for the 60 kg patient." }
        ),
        quote("PN is a high-alert medication", "386"),
        quote("35 (mL/kg) × 60 (kg) = 2100 ml/day", "387"),
        quote("810/3.4 = 238 gm of dextrose will be required", "387"),
        quote("The volume of fluid permitted to the patient and the concentration of nutrients in the PN solution are inversely proportionate.", "388"),
      ],
    },
    {
      id: "products",
      title: "Commercial products in the text",
      intro: "Hospital pharmacies compound PN for few patients (facilities, sepsis risk, no outcome advantage), so standardised commercial products are preferred. Tables 57.3 and 57.4 are split here into a volume-energy-osmolarity half and a composition half. The book prints no formula for a bag's osmolarity; it is read from these tables.",
      blocks: [
        table(
          ["Solution (peripheral)", "Manufacturer", "Volume (mL)", "Calories (kcal)", "Osmolarity (mOsm/L)"],
          [
            ["Aminosyn-PF 7%", "Hospira", "500", "140", "561"],
            ["Aminoven 5%", "Fresenius Kabi", "500", "100", "490"],
            ["Aminoven infant 10%", "Fresenius Kabi", "100", "4", "885"],
            ["Aminomix peripheral (2CB)", "Fresenius Kabi", "1000", "390", "770"],
            ["Aminosyn II 4.25%/10% (2CB)", "Pfizer/Hospira", "1000", "483", "894"],
            ["Clinimix 4.25/10 (2CB)", "Baxter", "1000", "510", "930"],
            ["Nutriflex peri (2CB)", "B Braun", "1000", "480", "900"],
            ["Intralipid 10%", "Fresenius Kabi", "500", "550", "260"],
            ["Intralipid 20%", "Fresenius Kabi", "500", "1000", "260"],
            ["Lipofundin MCT/LCT 20%", "B Braun", "500", "954", "380"],
            ["Clinolipid 20%", "Baxter", "500", "1000", "270"],
            ["Lipoplus", "B Braun", "500", "955", "410"],
            ["SMOFlipid 20%", "Fresenius Kabi", "500", "1000", "270"],
            ["Kabiven peri (3CB)", "Fresenius Kabi", "1440", "1000", "750"],
            ["Nutriflex lipid peri (3CB)", "B Braun", "1000", "765", "840"],
            ["PeriOlimel N4 (3CB)", "Baxter", "1000", "700", "760"],
            ["Smofkabivan peri (3CB)", "Fresenius Kabi", "1448", "1000", "850"],
          ],
          "Table 57.3 Peripheral PN products: volume, calories, osmolarity"
        ),
        table(
          ["Solution (peripheral)", "Dextrose (gm)", "Amino acids (gm)", "Lipids (gm)"],
          [
            ["Aminosyn-PF 7%", "-", "35", "-"],
            ["Aminoven 5%", "-", "25", "0"],
            ["Aminoven infant 10%", "-", "10", "0"],
            ["Aminomix peripheral (2CB)", "63", "35", "-"],
            ["Aminosyn II 4.25%/10% (2CB)", "100", "42.5", "-"],
            ["Clinimix 4.25/10 (2CB)", "100", "42.5", "-"],
            ["Nutriflex peri (2CB)", "80", "40", "-"],
            ["Intralipid 10%", "-", "-", "50"],
            ["Intralipid 20%", "-", "-", "100"],
            ["Lipofundin MCT/LCT 20%", "-", "-", "100"],
            ["Clinolipid 20%", "-", "-", "100"],
            ["Lipoplus", "-", "-", "100"],
            ["SMOFlipid 20%", "-", "-", "100"],
            ["Kabiven peri (3CB)", "97", "34", "51"],
            ["Nutriflex lipid peri (3CB)", "64", "32", "40"],
            ["PeriOlimel N4 (3CB)", "75", "25.3", "30"],
            ["Smofkabivan peri (3CB)", "103", "46", "41"],
          ],
          "Table 57.3 Peripheral PN products: composition"
        ),
        table(
          ["Solution (central)", "Manufacturer", "Volume (mL)", "Calories (kcal)", "Osmolarity (mOsm/L)"],
          [
            ["Aminoven 10%", "Fresenius Kabi", "1000", "400", "999"],
            ["Aminosyn 10%", "Hospira", "1000", "400", "938"],
            ["FreAmine 10%", "B Braun", "1000", "388", "950"],
            ["Travasol 10%", "Baxter", "1000", "400", "999"],
            ["Aminomix Novum (2CB)", "Fresenius Kabi", "1000", "1000", "1779"],
            ["Aminosyn II 4.25%/20% (2CB)", "Pfizer", "1000", "850", "1295"],
            ["Clinimix 8/10 (2CB)", "Baxter", "1000", "663", "1308"],
            ["Nutriflex plus (2CB)", "B Braun", "1000", "792", "1400"],
            ["Kabiven (3CB)", "Fresenius Kabi", "1026", "872", "1060"],
            ["Nutriflex lipid plus (3CB)", "B Braun", "1250", "1265", "1540"],
            ["Olimel N9/Triomel N9 (3CB)", "Baxter", "1000", "1070", "1170"],
            ["Smofkabivan (3CB)", "Fresenius Kabi", "986", "1100", "1500"],
          ],
          "Table 57.4 Central PN products: volume, calories, osmolarity"
        ),
        table(
          ["Solution (central)", "Dextrose (gm)", "Amino acids (gm)", "Lipids (gm)"],
          [
            ["Aminoven 10%", "-", "100", "-"],
            ["Aminosyn 10%", "-", "100", "-"],
            ["FreAmine 10%", "-", "97", "-"],
            ["Travasol 10%", "-", "100", "-"],
            ["Aminomix Novum (2CB)", "200", "50", "-"],
            ["Aminosyn II 4.25%/20% (2CB)", "200", "42.5", "-"],
            ["Clinimix 8/10 (2CB)", "100", "80", "-"],
            ["Nutriflex plus (2CB)", "150", "48", "-"],
            ["Kabiven (3CB)", "100", "34", "40"],
            ["Nutriflex lipid plus (3CB)", "150", "48", "50"],
            ["Olimel N9/Triomel N9 (3CB)", "110", "56.9", "40"],
            ["Smofkabivan (3CB)", "125", "50", "38"],
          ],
          "Table 57.4 Central PN products: composition"
        ),
        table(
          ["Lipid source", "Product (manufacturer)", "Soybean oil", "MCT oil", "Olive oil", "Fish oil", "Omega-6 : omega-3"],
          [
            ["Soybean oil", "Intralipid (Fresenius Kabi), Ivelip (Baxter), Lipofundin N (B Braun), Liposyn III (Hospira)", "100%", "-", "-", "-", "7:1"],
            ["Soybean/MCT", "Lipofundin MCT/LCT (B Braun)", "50%", "50%", "-", "-", "7:1"],
            ["Soybean/MCT", "Structolipid (Fresenius Kabi)", "64%", "36%", "-", "-", "7:1"],
            ["Olive oil", "ClinOleic, Clinolipid (Baxter)", "20%", "-", "80%", "-", "9:1"],
            ["Fish oil containing", "Lipoplus (Lipidem) (B Braun)", "40%", "50%", "-", "10%", "3:1"],
            ["Fish oil containing", "SMOFlipid (Fresenius Kabi)", "30%", "30%", "25%", "15%", "2.5:1"],
            ["Fish oil containing", "Omegaven (Fresenius Kabi)", "-", "-", "-", "100%", "1:8"],
          ],
          "Table 57.5 Lipid emulsion products by lipid source"
        ),
        quote("standardized commercially available PN products are widely used and preferred over tailormade hospital compounded PN solutions", "387"),
      ],
    },
    {
      id: "initiation",
      title: "Starting PN and caring for the bag",
      blocks: [
        steps([
          "Assess nutritional status by history, examination and laboratory studies.",
          "Start only in a haemodynamically stable patient who can tolerate the volume. Correct electrolyte abnormalities and hyperglycaemia first.",
          "Day one: no more than 50% of the calculated requirement, to avoid hyperglycaemia and electrolyte disturbance.",
          "Increase gradually over 4 to 7 days to the goal.",
          "In the severely malnourished expect refeeding syndrome (rapid fall in potassium, magnesium and phosphorus): slow initiation and close electrolyte monitoring.",
        ], "Initiation"),
        caution([
          "Keep reconstituted bags refrigerated until 30 minutes before use. Inspect every bag for particulate matter, cloudiness or an oily layer.",
          "Strict asepsis on connecting and administering.",
          "Dextrose/amino acid formulations: infusion set with an in-built air vent and a 0.22-micron filter. Lipid-containing formulations: a larger 1.2-micron filter, or it clogs.",
          "No three-way stopcock (infection). No needle into the bag for air venting. No medication added to the bag.",
          "Do not let a bag hang for more than 24 hours.",
          "Do not use the PN line to draw blood, give medications or measure central venous pressure.",
        ], "Care of the PN mixture"),
        quote("PN should be initiated slowly (no more than 50% of the calculated requirements on the first day)", "390"),
        quote("use an infusion set with an in-built air vent and a 0.22-micron filter", "390"),
        quote("Do not allow the PN solution to hang for more than 24 hours.", "390"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring",
      intro: "Every patient on PN is watched for metabolic status (hyper- and hypoglycaemia), refeeding or overfeeding, micronutrient deficiency or toxicity, fluid and electrolytes, catheter complications including sepsis, and hepatic and other long-term complications.",
      blocks: [
        points([
          "Chest X-ray to check catheter placement after insertion.",
          "Vital signs at least every 4 hours. A rise in temperature is one of the earliest signs of catheter-related sepsis.",
          "Weigh daily, same time each morning after voiding, same scale. Weight gain may mean fluid overload.",
          "Site care and dressing change at least three times a week or whenever the dressing is wet.",
          "Glucose every 6 hours initially, then once a day; watch for thirst and polyuria. Keep blood glucose below 180 mg/dL.",
          "Renal function, electrolytes, liver function, phosphate, calcium and magnesium daily in the first week; once or twice a week once stable; less often long term.",
          "Response to therapy: clinical status and visceral proteins (albumin, prealbumin, transferrin), read against fluid status, organ function and infection. If recovery is inadequate, a nitrogen balance study guides amino acid intake; if calorie calculations are unsatisfactory, indirect calorimetry.",
          "Fever, chills or hypotension: the commonest cause is catheter-related bloodstream infection; draw blood cultures immediately, before antibiotics.",
        ]),
        table(
          ["Clinical data", "What to monitor"],
          [
            ["History", "Sense of well-being, strength for routine activity, fever; signs of fluid overload or glucose and electrolyte imbalance"],
            ["Vital signs", "Temperature, pulse, blood pressure, respiratory rate"],
            ["Fluid balance", "Strict input/output chart, daily weight, signs of overload or dehydration"],
            ["Local care", "Inspect and dress the vascular access site to rule out infection"],
            ["Delivery system", "Inspect the solution for contamination; pump function, catheter function, timely change of tubing and bags"],
          ],
          "Table 57.6 Clinical monitoring"
        ),
        table(
          ["Laboratory parameter", "Baseline and initial period", "Stable period", "Long term"],
          [
            ["Blood glucose", "6 hourly", "1–2 times/week", "Monthly"],
            ["BUN, creatinine, electrolytes, HCO3, PO4, Ca2+, Mg2+", "Daily", "Weekly", "Monthly"],
            ["CBC, liver function test, triglycerides, PT", "Weekly", "Weekly", "Monthly"],
            ["Micronutrient tests", "As indicated", "As indicated", "As indicated"],
          ],
          "Table 57.6 Laboratory monitoring during PN"
        ),
        quote("Record vital signs at least every 4 hours.", "390"),
        quote("Maintain blood glucose <180 mg/dL", "391"),
      ],
    },
    {
      id: "termination",
      title: "Stopping PN",
      blocks: [
        steps([
          "PN is temporary; aim for a slow, smooth transition to oral or enteral intake once gut function returns.",
          "Discontinue PN when the patient tolerates 60–70% of the total requirement orally or enterally.",
          "If oral or enteral intake stays below 60% of requirement, restart PN in 2–3 days.",
          "Taper gradually: no overfeeding while PN is reduced, no nutritional decline once it stops.",
          "If PN must stop abruptly, give 10% dextrose for a few hours to prevent hypoglycaemia.",
          "Monitor blood glucose closely for several hours after stopping; watch clinical status, hydration, weight and laboratory tests through the transition.",
        ]),
        quote("60–70% of the total nutritional requirements orally or enterally", "392"),
        quote("administer 10% dextrose for a few hours to prevent hypoglycemia.", "392"),
      ],
    },
    {
      id: "complications_by_time",
      title: "Complications by time on PN",
      intro: "Mechanical, metabolic and infectious. Most are reduced by careful management and supervision by an experienced nutrition support team.",
      blocks: [
        table(
          ["Period", "Mechanical", "Metabolic / GI", "Infectious"],
          [
            ["First 48 hours", "Malposition, haemothorax, pneumothorax, chylothorax, air embolism, cardiac arrhythmia, injury to the subclavian or carotid artery", "Fluid overload, hyperglycaemia, hypophosphataemia, hypokalaemia, hypomagnesaemia, refeeding syndrome", "-"],
            ["First two weeks", "Catheter displacement, catheter thrombosis, catheter occlusion, air embolism", "Hyperglycaemic coma, acid–base imbalance, electrolyte imbalance", "Catheter-induced sepsis, exit-site infection"],
            ["Three months onwards", "Fracture or tear of the catheter, catheter thrombosis, air embolism, blood loss", "Essential fatty acid deficiency, vitamin or trace element deficiency, PN metabolic bone disease, PN liver disease", "Tunnel infection, catheter sepsis, exit-site infection"],
          ],
          "Table 57.7 Complications of PN"
        ),
        quote("most complications are reduced with careful management and supervision by an experienced nutritional support team", "392"),
      ],
    },
    {
      id: "mechanical",
      title: "Mechanical complications",
      blocks: [
        points([
          "At insertion: malposition, pneumothorax, haemothorax, arterial injury, thoracic duct injury, nerve injury, air embolism, cardiac arrhythmia, cardiac perforation with tamponade. Ultrasound guidance by trained staff reduces them significantly.",
          "After subclavian or jugular insertion, an upright or semi-upright chest X-ray excludes malposition, pneumothorax and haemothorax and confirms the tip in the inferior third of the SVC or at the SVC–right atrium junction, parallel to the wall.",
          "Too far in: a tip in a cardiac chamber risks arrhythmia. Not far enough: hyperosmolar PN at a high tip damages the vein (thrombophlebitis).",
          "PN is three to eight times the osmolality of serum; long-term it injures endothelium and inflames the vein wall, causing upper-limb deep venous thrombosis. Most are asymptomatic; some present with neck or arm swelling, erythema, tenderness and warmth.",
        ]),
        steps([
          "Catheter-related thrombosis is treated primarily with anticoagulation; thrombolysis for selected high-risk patients.",
          "Remove the catheter if it is non-functional or no longer needed, anticoagulation is contraindicated, symptoms do not improve on anticoagulation, or the thrombosis threatens limb or life.",
        ], "Catheter thrombosis"),
        quote("The osmolarity of PN solutions is three to eight times the normal serum osmolality.", "393"),
        quote("Catheter-related thrombosis is treated primarily with anticoagulation", "393"),
      ],
    },
    {
      id: "crbsi",
      title: "Catheter-related bloodstream infection",
      intro: "The most common and serious complication of central PN: longer stay, higher cost, high morbidity and mortality. Usually preventable; usually traced to lapses in asepsis, catheter care or patient education. Skin organisms migrate along short-term catheters; long-term catheters are contaminated at the hub.",
      blocks: [
        points([
          "Upper-body site (internal jugular or subclavian) rather than femoral.",
          "Strict asepsis when connecting and disconnecting.",
          "A single-lumen catheter dedicated to PN, or a dedicated lumen on a multi-lumen catheter or PICC.",
          "Antibiotic-coated or antibiotic-impregnated catheters.",
        ], "Prevention"),
        steps([
          "Fever without another identifiable source raises the suspicion. Staphylococcus and Candida are the most frequent pathogens.",
          "Examine the insertion site and culture any drainage.",
          "Blood cultures from each lumen of the catheter and two sets from peripheral veins by separate venepuncture, before antibiotics. A catheter tip culture cannot substitute for blood cultures.",
          "Begin empiric broad-spectrum antibiotics through the lumen to salvage the catheter; in uncomplicated patients removal is unnecessary.",
          "Remove the catheter for tunnel or pocket infection; clinical deterioration, septic shock, endocarditis, septic thrombosis or abscess; or repeatedly positive blood cultures despite antibiotics.",
          "Guidewire exchange has fewer technical complications but is not recommended as an alternative to removal.",
        ], "When catheter sepsis is suspected"),
        quote("Catheter tip cultures cannot be used as a substitute for blood cultures", "394"),
        quote("it is not recommended as an alternative approach to removal", "394"),
      ],
    },
    {
      id: "hyperglycaemia",
      title: "Hyperglycaemia",
      intro: "Occurs in more than half of patients on PN and raises complications and mortality. Risk factors: excess or rapid dextrose, obesity (BMI above 25 kg/m2), pre-existing diabetes or liver impairment, hyperglycaemia before PN, surgical indication, corticosteroids, infection, critical illness. New hyperglycaemia in a previously normoglycaemic patient should raise suspicion of infection.",
      blocks: [
        points([
          "The greatest danger from PN in the first 24 hours: osmotic diuresis and glycosuria, free-water loss, hyperosmolar non-ketotic dehydration, coma, death. Best treated by prevention.",
          "Glucose above 180 mg/dL carries more complications; the target is 140–180 mg/dL.",
        ]),
        table(
          ["Insulin regimen", "Where the text uses it"],
          [
            ["Continuous intravenous insulin infusion", "Unstable and critically ill patients needing maximal flexibility of dose"],
            ["Insulin added to the PN bag", "General wards where a separate insulin infusion is not feasible; convenient and physiological, but inappropriate in unstable patients and raises infection risk"],
            ["Insulin in the bag plus subcutaneous sliding scale", "Non-critically ill type 2 diabetes; better control after PN interruption"],
            ["Subcutaneous insulin", "Stable patients transitioning from intravenous to subcutaneous insulin before the infusion stops"],
          ],
          "Insulin regimens"
        ),
        steps([
          "Do not overfeed: starting dose below 20–25 kcal/kg/d.",
          "Restrict dextrose to 100–150 gm/day initially and give it slowly, 2–3 mg/kg/minute.",
          "Increase the lipid share if needed, to supply calories and limit dextrose.",
          "Count other intravenous dextrose: peritoneal dialysis solution, antibiotic drips.",
          "Check glucose every 4–6 hours and raise insulin accordingly.",
        ], "Prevention"),
        quote("Hyperglycemia is the greatest danger from PN during the first 24 hours.", "394"),
        quote("the current recommendation is to keep glucose concentration 140–180 mg/dL", "394"),
        quote("Restrict dextrose in PN to 100–150 gm/day initially and administer it slowly (2–3 mg/kg/minute).", "395"),
      ],
    },
    {
      id: "hypoglycaemia",
      title: "Hypoglycaemia",
      intro: "Uncommon on PN but dangerous. Causes: over-treatment of hyperglycaemia with insulin (highest risk with an insulin drip), and rebound after abrupt discontinuation, as with cyclic PN. Prone: advanced age, poor nutrition, diabetes, renal failure, liver disease, ICU patients, long-term PN, insulin by drip, inadequate monitoring.",
      blocks: [
        steps([
          "Before stopping, taper the infusion at half the rate for 1–2 hours.",
          "If PN must stop abruptly, run a dextrose-containing fluid for about 1 or 2 hours.",
          "Insulin added to the bag carries a low risk of hypoglycaemia on abrupt discontinuation.",
          "Do not chase tight control: a target of 140–180 mg/dL reduces hypoglycaemia.",
          "Monitor glucose closely and adjust insulin meticulously; avoid a high insulin-to-dextrose ratio in the bag.",
        ]),
        quote("tapper down infusion at half the rate for 1–2 h to reduce the risk of rebound hypoglycemia", "395"),
      ],
    },
    {
      id: "refeeding",
      title: "Refeeding syndrome",
      intro: "Shifts of fluid, electrolytes, metabolism and vitamins when nutrition is restarted after malnutrition or prolonged fasting. Often neglected; can kill. Hypophosphataemia is the hallmark. The text lists risk factors and cites NICE only for the 50% starting dose; it does not reproduce a formal NICE criteria table.",
      blocks: [
        points([
          "Severe malnutrition, BMI below 18.5 kg/m2, weight loss above 10% in the last 3–6 months, poor or no intake for more than 5 days.",
          "Alcohol abuse, anorexia nervosa, depression, bariatric surgery, bowel resection, malabsorption, insulin, chemotherapy, antacids, diuretics.",
          "Low baseline phosphate, potassium or magnesium.",
        ], "High-risk patients"),
        points([
          "Starvation switches the body to fat, glucose and insulin fall, and intracellular phosphate, potassium, magnesium and thiamine are depleted.",
          "Carbohydrate restarts insulin, which drives phosphorus, potassium and magnesium into cells: severe hypophosphataemia, hypokalaemia, hypomagnesaemia.",
          "Thiamine need rises with replenishment; without it glucose goes to lactate rather than ATP (lactic acidosis), with Wernicke's encephalopathy or dry beriberi, or oedema, heart failure and wet beriberi.",
          "Symptoms appear within the first 2–5 days and range from mild to life-threatening with the degree of malnutrition and comorbidity.",
        ], "Mechanism and timing"),
        table(
          ["System", "Features in the text"],
          [
            ["Cardiovascular", "Fluid overload, congestive heart failure, arrhythmias, bradycardia or tachycardia, hypotension"],
            ["Respiratory", "Respiratory failure, pulmonary oedema, hypoventilation, failure to wean from the ventilator"],
            ["Neurological", "Paraesthesia, ataxia, delirium, Wernicke's encephalopathy"],
            ["Musculoskeletal", "Weakness, fatigue, myalgia, rhabdomyolysis"],
            ["Miscellaneous", "Abdominal pain, constipation, vomiting, anaemia, metabolic acidosis"],
          ],
          "Clinical features (from hypophosphataemia, hypokalaemia, hypomagnesaemia, sodium retention and thiamine deficiency)"
        ),
        steps([
          "Search for and recognise the high-risk patient.",
          "Baseline potassium, magnesium and phosphorus before nutrition support.",
          "Give electrolytes prophylactically even at low-normal levels, with thiamine, water- and fat-soluble vitamins and zinc, iron and selenium in standard maintenance doses, alongside the feed. Suggested daily electrolytes: potassium 1–1.5 mEq/kg, magnesium 0.2–0.4 mEq/kg, phosphate 0.3–0.6 mmol/kg.",
          "If electrolytes are severely low, delay nutrition until corrected.",
          "Thiamine 100 mg per day, given before any dextrose-containing intravenous fluid, for 5–7 days or longer.",
          "Start calories low: no more than 50% of energy requirement (NICE), or 100–150 gm of dextrose or 10–20 kcal/kg for the first 24 hours (ASPEN 2020).",
          "Advance by 33% of the goal every 1 to 2 days.",
          "Sodium and fluid with care, to avoid overload.",
          "Vital signs every 4 hours on the first day; daily weight and intake–output chart; potassium, magnesium and phosphorus every 12 hours for the first three days.",
          "Overt symptoms or abnormal electrolytes: curtail the feed. Refeeding hypophosphataemia: reduce energy temporarily or restrict it for 48 hours, then increase gradually. Oedema or heart failure: reduce fluid. Replace electrolytes aggressively to the serum levels.",
        ], "Prevention and treatment"),
        quote("Hypophosphatemia is the hallmark of the syndrome.", "396"),
        quote("1–1.5 mEq/kg potassium, 0.2–0.4 mEq/kg magnesium, and 0.3–0.6 mmol/kg phosphate", "397"),
        quote("The recommended dose of thiamine is 100 mg per day, to be administered before initiating dextrose-containing IV fluids", "397"),
        quote("advance by 33% of a goal every 1 to 2 days", "397"),
        quote("Monitor serum potassium, magnesium, and phosphorus every 12 hours for the first three days.", "397"),
      ],
    },
    {
      id: "hepatic",
      title: "Hepatic complications",
      intro: "Liver disease affects 4.3% to 65% of patients on PN: steatosis (overfeeding), cholestasis (impaired bile secretion) and gallbladder sludge or stones (stasis). It ranges from a benign transient rise in liver tests to fibrosis, portal hypertension and end-stage liver failure in a few. PNAC, PNALD and IFALD describe the spectrum; IFALD is now the preferred term, though PNALD and IFALD are used interchangeably.",
      blocks: [
        points([
          "Conjugated bilirubin above 2 mg/dL is the primary marker, generally early (within 2 weeks of starting PN). Exclude other causes of liver disease first.",
          "Risk factors: excess energy or overfeeding, glucose overload, lipid above 1 gm/kg/d, soybean-oil emulsion, continuous infusion, no enteral stimulation, carnitine and choline deficiency.",
        ]),
        steps([
          "Avoid more than 25 to 30 kcal/kg: less steatosis.",
          "Avoid more than 5 mg/kg/min of carbohydrate.",
          "Non-protein energy about 70–85% carbohydrate and 15–30% lipid.",
          "Restrict soybean-based lipid to below 1 gm/kg body weight/d to treat children with PNALD.",
          "Replace soybean lipid partly or wholly with fish-oil omega-3 emulsion (lower n6/n3 ratio) to prevent and treat PNALD.",
          "Prefer cyclic PN, 12 to 16 hours, so fat is mobilised in the gap; switching stabilises or improves liver function.",
          "Early oral or enteral nutrition, even small amounts, stimulates the enterohepatic circulation of bile acids.",
        ], "Prevention and treatment"),
        quote("Elevated serum conjugated bilirubin >2 mg/dL is the primary marker of PN-associated liver disease", "397"),
        quote("Avoid administration of >5 mg/kg/min/d carbohydrate to prevent PNALD/IFALD", "398"),
      ],
    },
    {
      id: "cautions",
      title: "Never and avoid",
      blocks: [
        caution([
          "PN is a high-alert medication.",
          "Peripheral PN must be below 900 mOsm/L, ideally limited to 600 mOsm/L. Above 800–900 mOsm/L, pH below 5 or above 9, or fluid restriction: central only.",
          "Femoral access is discouraged for central PN. Do not leave the tip in a cardiac chamber or too high in the vein.",
          "No three-way stopcock, no venting needle, no medication in the bag, no bag hanging beyond 24 hours, no blood draws, drugs or CVP through the PN line.",
          "0.22-micron filter for 2-in-1; 1.2-micron for lipid-containing PN.",
          "Cyclic PN is not for the critically ill; caution with glucose intolerance or oedema.",
          "A catheter tip culture does not replace blood cultures; guidewire exchange does not replace removal.",
          "Hyperglycaemia is the greatest danger in the first 24 hours; new hyperglycaemia means think infection. Insulin in the bag is inappropriate in unstable patients.",
          "Thiamine before dextrose in anyone at refeeding risk.",
        ]),
        quote("These hypertonic CPN solutions are too irritant for a peripheral vein and should be infused only through central venous access.", "383"),
      ],
    },
  ],
};
