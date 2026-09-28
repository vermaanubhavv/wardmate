import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HEPATORENAL SYNDROME — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 37, which the source edition carries in full. Every number below is the
 * book's; the quotes give the page it came from.
 */
export const hepatorenalSyndromeV1: FluidTopic = {
  id: "hepatorenal_syndrome",
  version: "1.0.0",
  title: "Hepatorenal syndrome: albumin and vasoconstrictors",
  group: "settings",
  summary: "Kidney injury in advanced cirrhosis: how the book confirms it, the albumin challenge, and the terlipressin, noradrenaline and midodrine regimens with their stop rules.",
  setting: "Hepatology, gastroenterology and general medicine, adult ward and ICU",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["37 Hepatorenal Syndrome"], pages: "205–217" },
  sections: [
    {
      id: "what",
      title: "What it is",
      blocks: [
        points([
          "Kidney failure is the most frequent organ failure in acute or chronic liver disease, in 20–50% of hospitalised cirrhotic patients.",
          "HRS is one of many causes of acute kidney injury in liver disease: rapidly progressive renal failure without apparent pathological abnormality in the kidneys.",
          "Mortality about 32 to 37%; readmission about 23%.",
          "Common precipitants: gastrointestinal bleeding, large volume paracentesis, diuretics, NSAIDs, spontaneous bacterial peritonitis and other infections.",
        ]),
        table(
          ["Classification", "Definition in the text", "Median survival"],
          [
            ["Type 1 HRS, now HRS-AKI", "A 2-fold increase of serum creatinine to at least 2.5 mg/dL, or a fall in creatinine clearance by 50% to less than 20 mL/min, within 2 weeks", "8 to 12 weeks"],
            ["Type 2 HRS, now HRS-NAKI", "Slowly progressive kidney impairment with ascites resistant to diuretics", "about 6 months"],
          ],
          "Old and new names"
        ),
        quote("creatinine to at least 2.5 mg/dL or a decrease of creatinine clearance by 50% to less than 20 mL/min within 2 weeks", "206"),
      ],
    },
    {
      id: "criteria",
      title: "Diagnostic criteria of HRS-AKI",
      intro: "Table 37.1 in the text, from the International Club of Ascites (2019). All six must hold.",
      blocks: [
        table(
          ["#", "Criterion"],
          [
            ["1", "Presence of cirrhosis and ascites"],
            ["2", "Presence of AKI (increase in serum creatinine >0.3 mg/dL within 48 hours, or >50% increase in serum creatinine from baseline in 3 months)"],
            ["3", "Lack of improvement of serum creatinine (decrease of creatinine ≤0.3 mg/dL of baseline) after at least 48 hr of diuretic withdrawal and volume expansion with albumin (1 gm/kg body weight/day for 2 d)"],
            ["4", "Absence of shock (septic, cardiogenic, distributive)"],
            ["5", "Exclusion of current or prior treatment with nephrotoxic drugs"],
            ["6", "Absence of proteinuria ≥500 mg/day, microhematuria, or structural abnormalities on ultrasonography"],
          ],
          "Table 37.1 Diagnostic criteria of HRS-AKI"
        ),
        quote("increase in serum creatinine >0.3 mg/dL within 48 hours, or >50% increase in serum creatinine from baseline in 3 months", "206"),
      ],
    },
    {
      id: "mechanism",
      title: "How it happens",
      blocks: [
        points([
          "Vasodilatation: portal hypertension releases nitric oxide and prostaglandins, dilating the splanchnic and systemic arteries.",
          "Activation of vasoconstrictors: effective arterial volume falls, baroreceptors fire, and the renin-angiotensin-aldosterone system, vasopressin and the sympathetic nervous system are switched on.",
          "Renal vasoconstriction: the renal circulation is very sensitive to these vasoconstrictors, so renal perfusion falls sharply.",
          "Cardiac dysfunction: cardiac output rises at first, then falls as liver disease progresses, cutting renal blood flow further.",
        ], "Haemodynamic: the splanchnic arterial vasodilation theory"),
        points([
          "Gut permeability rises, bacteria translocate to mesenteric lymph nodes and pro-inflammatory cytokines are released.",
          "Nitric oxide in splanchnic arterioles deepens the vasodilatation and drives renal hypoperfusion; immune cells damage tissue; metabolism is altered.",
        ], "Systemic inflammation"),
      ],
    },
    {
      id: "diagnosis",
      title: "Work-up: a diagnosis of exclusion",
      blocks: [
        points([
          "AKI in cirrhosis has many causes that coexist and overlap: hypovolaemia (GI bleeding, diuretics, GI losses), drugs and contrast, infections, intrinsic renal disease, obstructive uropathy.",
          "HRS accounts for about 15–43% of AKI in liver disease; hypovolaemia for 27–50%; acute tubular necrosis for about 14–35%.",
          "Detailed history, clinical assessment, laboratory tests and abdominal imaging to exclude prerenal AKI, ATN (hypovolaemic shock, infection, nephrotoxins), abdominal compartment syndrome, glomerulonephritis, acute interstitial nephritis and obstruction.",
          "ATN versus HRS-AKI is difficult to separate; urinary biomarkers are described as promising.",
          "The albumin challenge is the diagnostic step: renal recovery within 48 hours of albumin, with risk factors removed and diuretics stopped, favours prerenal AKI; failure to improve suggests HRS-AKI.",
        ]),
        quote("hepatorenal syndrome is the cause of AKI in about 15–43%", "207"),
        quote("The reversal of AKI in 48 hours with volume expansion favors prerenal AKI", "208"),
      ],
    },
    {
      id: "prevention",
      title: "Prevention",
      blocks: [
        steps([
          "Avoid nephrotoxic drugs: NSAIDs, aminoglycosides, amphotericin, ACE inhibitors, angiotensin receptor blockers, radiographic dye. Use diuretics and laxatives judiciously.",
          "Detect and treat infections early; antibiotic prophylaxis for those at increased risk of spontaneous bacterial peritonitis.",
          "Correct intravascular volume depletion from excess diuretics, lactulose diarrhoea, variceal bleeding or large volume paracentesis without albumin.",
          "Spontaneous bacterial peritonitis: albumin with the antibiotics, 1.5 g/kg within 6 hours of detecting the infection (day 1) and 1 g/kg 48 hours after the first dose (day 3).",
          "Large volume paracentesis: replace 6–8 g of albumin for every litre of ascites removed.",
          "Antibiotic prophylaxis in advanced cirrhosis: oral norfloxacin (or trimethoprim-sulfamethoxazole if unavailable) lowers the one-year probability of SBP, delays HRS and improves survival; rifaximin also reduced HRS-AKI.",
          "Diagnose and manage gastrointestinal bleeding promptly.",
          "Pentoxifylline 1200 mg/day reduced the risk of HRS-AKI in alcoholic hepatitis; larger studies are needed.",
          "In alcoholic hepatitis: early treatment, abstinence and nutritional supplementation.",
        ]),
        quote("1.5 gm/kg within 6 hours of detection of infection (on the first day) and a second dose of 1 gm/kg after 48 hours", "208"),
        quote("replacing 6–8 gm of albumin for every liter of ascites removed reduces the risk of HRS-AKI", "208"),
      ],
    },
    {
      id: "goals",
      title: "Goals and general measures",
      blocks: [
        points([
          "Identify and treat reversible factors.",
          "Correct hypovolaemia and avoid volume overload.",
          "Raise the mean arterial pressure by 10–15 mmHg or more from baseline — the most effective approach for renal perfusion.",
          "Reverse the haemodynamic disturbance and the AKI; stabilise, give renal replacement therapy if needed, and bridge to liver transplantation.",
        ], "Goals"),
        steps([
          "Find and treat the precipitant.",
          "Volume expansion first, with crystalloid or intravenous albumin. Normal saline is preferred for hypovolaemia from vomiting or excess diuretics; blood or blood products for gastrointestinal bleeding.",
          "Assess volume carefully: the patient may be intravascularly depleted despite ascites and oedema, and over-infusion worsens ascites, pleural effusion, heart failure and respiratory failure. Use history, examination, laboratory tests, X-ray imaging and point-of-care ultrasound.",
          "Stop beta-blockers when blood pressure is low or borderline. Stop nephrotoxic drugs.",
          "Stop diuretics. Stop spironolactone in particular.",
          "Spontaneous bacterial peritonitis: albumin and antibiotics promptly. Albumin is not recommended for HRS with infections other than SBP.",
          "Look for and treat electrolyte disorders (hyponatraemia, hyperkalaemia, hypokalaemia) and acid–base disorders (respiratory alkalosis, metabolic alkalosis, metabolic acidosis).",
          "Measure vitals, urine output, fluid balance and daily weight.",
        ], "General measures"),
        caution([
          "Do not use diuretics to force urine output in severe AKI in HRS — they deplete volume and can trigger or worsen HRS.",
          "Discontinue spironolactone: the book calls the hyperkalaemia risk life-threatening.",
        ]),
        quote("rise in MAP ≥10–15 mmHg from baseline", "208"),
        quote("it is essential to discontinue spironolactone in HRS as it carries the risk of life-threatening hyperkalemia", "209"),
      ],
    },
    {
      id: "albumin",
      title: "Albumin",
      intro: "Albumin plus a vasopressor is first-line for HRS-AKI and is started as soon as possible. Albumin alone is less effective than the combination.",
      blocks: [
        table(
          ["When", "Dose in the text"],
          [
            ["Days 1 and 2", "1 g/kg/day, up to 100 g/day, for two consecutive days; preferably in divided doses, e.g. 25 g every 6 hours"],
            ["Thereafter", "20–40 g daily"],
            ["Until", "Serum creatinine is within 0.3 mg of its baseline value"],
            ["Stop", "Within 14 days if there is no response or only a partial response"],
          ],
          "Albumin in HRS-AKI"
        ),
        points([
          "Albumin raises oncotic pressure, expands circulating volume, improves haemodynamics and cardiac output, and increases renal perfusion; the text also lists antioxidant, anti-inflammatory, inotropic, renal autoregulatory and endothelial-glycocalyx effects.",
          "ATTIRE (2021): tailoring albumin to raise serum albumin to 3.0 g/dL or more did not reduce infection, kidney dysfunction or death.",
        ]),
        caution([
          "The major risk is volume overload, especially pulmonary oedema. Assess volume status before each dose and do not give albumin to an overloaded patient.",
          "Albumin raises preload and terlipressin raises afterload; together they can precipitate pulmonary oedema.",
        ]),
        quote("Recommended dose of albumin is 1 gm/kg/d (up to 100 gm/d) for two consecutive days", "210"),
        quote("Subsequently, the dose may decrease to 20–40 gm daily.", "210"),
        quote("Combination therapy is discontinued within 14 days if patients do not respond or respond partially", "210"),
      ],
    },
    {
      id: "vasoconstrictors",
      title: "Vasoconstrictors",
      intro: "Given with albumin as soon as HRS is suspected. Terlipressin is the first and most preferred agent; it improved renal function in 24–44% of patients, with a mortality benefit that remains controversial.",
      blocks: [
        table(
          ["Drug", "Dose in the text", "Escalation and limits", "Setting"],
          [
            ["Terlipressin (V1 agonist)", "1–2 mg/12 h by continuous IV infusion, or 0.5–1.0 mg/4–6 h by IV bolus. One 8.5 mL ampoule = 1 mg terlipressin acetate", "Start at serum creatinine >1.5 mg/dL. If no response, increase the infusion stepwise from 2 mg/day to a maximum of 12 mg/day by urine output and creatinine. Avoid at creatinine <1.5 mg/dL and at >5.0 mg/dL", "ICU or ward; infusion preferred to boluses (better tolerated, lower effective dose)"],
            ["Noradrenaline (alpha agonist)", "0.5 to 3 mg/h; usually started at 1 mg/hour by continuous infusion", "Increased gradually to maintain mean arterial pressure", "ICU only: needs a central venous catheter and close monitoring for arrhythmia and ischaemia"],
            ["Midodrine (oral alpha agonist) + octreotide (somatostatin analogue)", "Midodrine 5–7.5 mg three times daily orally; octreotide 50 mcg/h by continuous infusion or 100–200 mcg/8 h subcutaneously", "Midodrine up to a maximum of 15 mg three times daily", "General ward when terlipressin is unavailable and noradrenaline cannot be given outside ICU; lower renal recovery, not preferred in ICU"],
          ]
        ),
        table(
          ["Setup", "First-line drugs", "Class", "Route"],
          [
            ["Albumin", "To all patients (expands intravascular volume)", "—", "—"],
            ["Terlipressin available — ICU", "Terlipressin", "Vasopressin analogue", "IV"],
            ["Terlipressin available — wards", "Terlipressin", "Vasopressin analogue", "IV"],
            ["Terlipressin not available — ICU", "Norepinephrine", "Alpha agonist", "IV"],
            ["Terlipressin not available — wards", "Midodrine and octreotide", "Alpha agonist; somatostatin analogue", "Oral and SQ"],
          ],
          "Table 37.2 Vasoconstrictor with albumin in hepatorenal syndrome",
          "Duration of therapy: about 1–2 weeks. Goal: raise mean arterial pressure by 10–15 mmHg; serum creatinine <1.5 mg/dL."
        ),
        points([
          "Midodrine with octreotide and albumin is the most effective therapy for raising serum sodium in the dilutional hyponatraemia of HRS. Midodrine alone does not improve renal function.",
          "Poor response to terlipressin: higher bilirubin, higher creatinine, CKD with structural injury, severe bacterial infection, and failure to raise MAP and cardiac output.",
          "Terlipressin was introduced in 1990 and approved by the US FDA in September 2022; before that noradrenaline was the first-line agent in the USA, with equal efficacy in meta-analyses.",
        ]),
        quote("1–2 mg/12 h by continuous IV infusion or 0.5–1.0 mg/4–6 h by IV boluses", "211"),
        quote("increased stepwise from 2 mg/day to a maximum of 12 mg/d", "211"),
        quote("The dose of norepinephrine varies from 0.5 to 3 mg/h in HRS.", "212"),
        quote("5–7.5 mg thrice daily orally, which can be increased maximum up to 15 mg three times daily", "212"),
      ],
    },
    {
      id: "terlipressin_cautions",
      title: "Terlipressin: when not to give it, when to stop",
      blocks: [
        caution([
          "Do not start at serum creatinine <1.5 mg/dL — milder HRS-AKI is usually reversible with fluid expansion alone.",
          "Avoid at serum creatinine >5.0 mg/dL or higher.",
          "Usually avoided in coronary artery disease, cerebral or peripheral vascular disease, cardiac arrhythmias, asthma, COPD and the elderly.",
          "Adverse effects: abdominal pain, nausea and diarrhoea from gut smooth-muscle spasm; coronary or peripheral ischaemia; dyspnoea and respiratory distress from pulmonary vasoconstriction plus cardiac overload (terlipressin afterload, albumin preload).",
          "Stop the combination within 14 days if there is no response or only a partial response.",
        ]),
        points([
          "Use albumin judiciously; watch for respiratory distress; pulse oximetry; frequent chest radiographs or point-of-care ultrasound.",
        ], "Reducing respiratory adverse events"),
        quote("initiate terlipressin at early stages of AKI (i.e., serum creatinine >1.5 mg/dL)", "210"),
        quote("avoided in patients with advanced renal dysfunction (i.e., serum creatinine >5.0 mg/dL or higher)", "211"),
      ],
    },
    {
      id: "response",
      title: "Judging response",
      blocks: [
        table(
          ["Finding", "What the text calls it"],
          [
            ["Renal recovery within 48 hours of albumin, diuretics stopped, risk factors removed", "Prerenal AKI, not HRS"],
            ["Serum creatinine back to within 0.3 mg of baseline on albumin plus vasoconstrictor", "Response: therapy is continued until this point"],
            ["Serum creatinine <1.5 mg/dL and MAP up 10–15 mmHg", "Goal of therapy (Table 37.2)"],
            ["No response or partial response at 14 days", "Stop the combination"],
          ]
        ),
        quote("continued until serum creatinine reduces to a value within 0.3 mg of the baseline value", "210"),
      ],
    },
    {
      id: "beyond_drugs",
      title: "When drugs fail",
      blocks: [
        points([
          "Renal replacement therapy: controversial; offered when medical treatment fails but the kidney or liver may recover, or the patient is a transplant candidate. Indications: worsening renal function, electrolyte disturbance, or increasing volume overload despite optimum vasoconstrictor therapy.",
          "TIPS: salvage only; improved creatinine, urine volume and urinary sodium in a meta-analysis but is contraindicated in severe liver failure or severe hepatic encephalopathy and carries bleeding, worsening liver function and encephalopathy. Not routinely recommended.",
          "Liver transplantation: the only curative treatment for both types of HRS.",
          "Simultaneous liver-kidney transplantation when renal recovery is not expected after liver transplant: dialysis for 6 weeks or more with GFR ≤25 mL/min for more than 6 weeks, or underlying advanced CKD, or CKD requiring dialysis.",
        ]),
        quote("AKI associated with dialysis ≥6 weeks and glomerular filtration rate [GFR] ≤25 mL/min for more than 6 weeks", "213"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring",
      blocks: [
        points([
          "Vitals, urine output, fluid balance and daily weight, with close observation.",
          "Response is read from urine output and serum creatinine; the 48-hour albumin challenge separates prerenal AKI from HRS-AKI.",
          "On terlipressin: respiratory distress, pulse oximetry, frequent chest radiographs or point-of-care ultrasound.",
          "On noradrenaline: ICU or close monitoring for arrhythmia and ischaemia; titrate to mean arterial pressure.",
          "Volume status before every albumin dose; electrolytes and acid–base throughout.",
        ]),
        quote("Measure vitals, urine output, fluid balance, and daily weight and closely monitor patients.", "209"),
      ],
    },
  ],
};
