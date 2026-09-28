import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * RESUSCITATION FLUIDS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 8, which the source edition carries in full (text PDF 43–62, references
 * 62–68). Every number below is the book's; the quotes give the page it came from. The chapter
 * prints no shock classification, haemorrhage classes, shock index, lactate or urine-output
 * target — so none appear here.
 */
export const resuscitationFluidsV1: FluidTopic = {
  id: "resuscitation_fluids",
  version: "1.0.0",
  title: "Resuscitation fluids: what, how much, how fast, when to stop",
  group: "fluids",
  summary: "Bolus size and timing, the sepsis volume, the MAP target, the four phases, saline against balanced crystalloid, colloids, albumin, HES and the transfusion thresholds.",
  setting: "Emergency, ICU and adult ward — hypovolaemic and septic shock",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["8 Resuscitation Fluids"], pages: "42–68" },
  sections: [
    {
      id: "what",
      title: "What resuscitation is for",
      blocks: [
        points([
          "Fluid resuscitation is the rapid administration of intravenous fluid to restore or maintain circulating volume during severe hypovolaemia or shock from sudden, significant fluid or blood loss.",
          "Commonest indications in the critically ill: severe hypovolaemia, sepsis, trauma, burns, perioperative volume loss.",
          "The objective is a large volume quickly — to restore circulating volume, stabilise haemodynamics and restore tissue perfusion and oxygen delivery — without harm from fluid overload. Find and treat the cause of shock at the same time.",
          "Three categories of fluid: crystalloids (normal saline, Ringer's lactate, chloride-restrictive balanced crystalloids such as PlasmaLyte); colloids (albumin, hydroxyethyl starch, dextran, gelatine); blood products (packed red cells).",
          "Crystalloids are first-line. Colloids are second-line for selected hypotensive patients — albumin is safe but very expensive and reserved for specific settings; HES, dextran and gelatin are not recommended. Blood products are essential with significant blood loss or anaemia with hypotension.",
        ]),
        quote("restore tissue perfusion and oxygen delivery without causing harm due to fluid overload", "43"),
      ],
    },
    {
      id: "how_fast",
      title: "How much, how fast",
      intro: "Hypovolaemic shock is a medical emergency; fluid starts immediately. Delay leads to ischaemic injury and possibly irreversible shock and multiorgan failure.",
      blocks: [
        table(
          ["Item", "The book's figure"],
          [
            ["Initial crystalloid bolus", "500 mL within 15 minutes, crystalloid with 130–154 mEq/L sodium"],
            ["Usual initial total", "1–2 litres given rapidly to establish haemodynamic stability"],
            ["Sepsis-induced hypoperfusion (Surviving Sepsis Campaign 2021)", "at least 30 mL/kg IV crystalloid within the first 3 hours"],
            ["Predictor of a fluid-refractory state", "fluid delayed more than 2 hours after diagnosis"],
            ["Initial target", "mean arterial pressure 65 mmHg"],
          ],
          "Timing and targets"
        ),
        steps([
          "Start at once through large-bore cannulas; in sepsis draw blood for lactate and cultures first, then begin.",
          "Crystalloid bolus of 500 mL over 15 minutes; repeat towards 1–2 litres while reassessing.",
          "In sepsis complete at least 30 mL/kg within the first 3 hours — earlier resuscitation improves survival. PROCESS, ARISE and PROMISE patients had received about this volume before randomisation.",
          "Aim for MAP 65 mmHg. Plan any further fluid on frequent reassessment of clinical parameters, haemodynamic status and laboratory tests.",
          "No response to adequate fluid: consider vasopressors and inotropes, and exclude other causes of shock (cardiogenic, septic).",
          "Kidney impairment or congestive heart failure: resuscitate under close monitoring. Consider earlier vasopressors when the patient is at risk of overload and to reach the MAP target sooner.",
        ], "Sequence in the text"),
        quote("crystalloid fluids containing 130–154 mEq/L sodium are infused as a bolus of 500 mL within 15 minutes", "43"),
        quote("at least 30 mL/kg of IV crystalloid fluid should be given within the first 3 hours", "43"),
        quote("Delayed administration of fluid (>2 hours after diagnosis) is the most crucial predictor of the fluid refractory state", "43"),
        quote("An initial target of fluid resuscitation is to achieve a mean arterial pressure (MAP) of 65 mmHg", "43"),
      ],
    },
    {
      id: "phases",
      title: "The four phases — and when to stop",
      intro: "The need for fluid changes over time. The chapter gives the Hoste four-phase model by hour range; it prints no other stopping rule beyond this and the overload warnings.",
      blocks: [
        table(
          ["Phase", "Time from onset of shock", "Strategy"],
          [
            ["Salvage", "0–24 h", "Rapid fluid replacement in adequate volume is essential."],
            ["Optimisation and stabilisation", "24–96 h", "Requirement falls; reduce the infused volume."],
            ["De-escalation", "more than 96 h", "Restrictive strategy is associated with better outcomes."],
          ]
        ),
        points([
          "Frequent reassessment after the initial bolus decides every further litre.",
          "Colloids are sometimes added to crystalloids precisely to reach stability with less volume and a smaller positive balance — fatal pulmonary oedema and organ dysfunction are the harms of large crystalloid volumes.",
        ], "Restraint in the text"),
        quote("Restrictive strategy during the last de-escalation phase (>96 h) is associated with better outcomes", "43"),
      ],
    },
    {
      id: "where_a_litre_goes",
      title: "Where a litre goes",
      intro: "The ability to expand intravascular volume is what raises blood pressure. Table 8.1 gives the distribution of 1000 mL of each fluid.",
      blocks: [
        table(
          ["Compartment (mL of 1000 mL infused)", "5% dextrose", "0.45% saline", "RL and 0.9% saline", "Colloids / blood products"],
          [
            ["Intracellular fluid", "667", "333", "0", "0"],
            ["Extracellular fluid", "333", "667", "1000", "1000"],
            ["Interstitial fluid", "250", "500", "750", "0"],
            ["Intravascular fluid", "83", "167", "250", "1000"],
          ],
          "Table 8.1 — distribution of IV solutions in body fluid compartments"
        ),
        points([
          "5% dextrose: 1000 mL raises ECF by only 330 mL and leaves just 83 mL (about 8%) in the vessels — a poor pressure rise. Given fast it also loads more than 25 g glucose an hour, causing osmotic diuresis: urine output rises despite hypovolaemia, gives a false impression that the deficit is corrected, and replacement is slowed.",
          "Dextrose saline: 1000 mL carries 50 g dextrose with 154 mEq sodium and chloride; fast infusion causes hyperglycaemia and osmotic diuresis. Not for resuscitation.",
          "Normal saline and Ringer's lactate are sodium-rich and stay in the ECF — 25% intravascular, 75% interstitial. A litre expands the intravascular volume by about 250 mL, a much faster pressure rise than 5% dextrose.",
          "They are dextrose-free — safe when the glycaemic status is unknown — and cheap, available, non-infectious, reaction-free and easy to store, so they are the preferred initial fluid.",
          "Colloids and blood products: large molecules stay in the vessels, so 100% of the volume expands plasma — the most potent way to raise pressure, and less pulmonary oedema because oncotic pressure draws fluid in from the interstitium. Despite this they are not preferred over crystalloids in practice.",
        ]),
        quote("all dextrose-containing fluids are not appropriate for fluid resuscitation", "45"),
        quote("Infusion of 1 liter of these fluids will expand intravascular volume by about 250 ml", "45"),
      ],
    },
    {
      id: "compositions",
      title: "What is in the bag",
      blocks: [
        table(
          ["Fluid", "Na+", "K+", "Cl-", "Acetate", "Lactate", "Ca2+", "Mg2+", "Gluconate", "Osm (mOsm/L)", "SID"],
          [
            ["Plasma", "136–145", "3.5–5.0", "98–106", "–", "–", "2.2–2.6", "0.8–1.0", "–", "285–295", "40"],
            ["0.9% NaCl", "154", "–", "154", "–", "–", "–", "–", "–", "308", "0"],
            ["Ringer's lactate", "130", "4.0", "109", "–", "28", "3.0", "–", "–", "273", "28"],
            ["PlasmaLyte", "140", "5.0", "98", "27", "–", "–", "3.0", "23", "295", "50"],
            ["Sterofundin", "145", "4.0", "127", "24", "–", "5.0", "2.0", "–", "309", "29"],
          ],
          "Table 8.2 — composition of plasma and IV crystalloid resuscitation fluids (mEq/L unless stated)",
          "SID = strong ion difference. The book quotes RL osmolality as 273 in this table and 278 mOsmol/L in the PlasmaLyte section, and plasma as 285, 290 or 285–295 in different passages; PlasmaLyte magnesium appears as 3.0 mEq/L here and 1.5 mmol/L in prose (the same amount)."
        ),
        quote("SID: Normal value = 40; Normal saline = 0; RL = 28, PlasmaLyte = 50", "48"),
      ],
    },
    {
      id: "normal_saline",
      title: "Normal saline",
      blocks: [
        points([
          "Readily available, cheap, and compatible with co-infusion of blood products and drugs such as ceftriaxone.",
          "154 mEq/L sodium expands intravascular volume and corrects hypotension.",
          "Preferred in brain injury, hypochloraemia, hypovolaemic hyponatraemia and metabolic alkalosis. Osmolarity 308 mOsm/L against plasma about 285 mOsm/kg — no cerebral oedema risk in neurological patients.",
          "Glucose-free, so ideal when glycaemic status is unknown.",
        ], "Advantages"),
        points([
          "It is neither normal nor physiological. Against Ringer's lactate: chloride 154 versus 109 mEq/L; no buffer; no potassium or calcium. Chloride is about 50% higher than serum.",
          "Large volumes cause hyperchloraemic acidosis, more acute kidney injury, more renal replacement therapy, higher hospital mortality, coagulopathy, hyperkalaemia and more interstitial fluid retention.",
          "Acidosis: the SID of saline is zero, so infusion lowers plasma SID; renal bicarbonate reabsorption falls; bicarbonate is diluted.",
          "Kidney injury: chloride reaching the distal tubule is sensed by the macula densa, which constricts the afferent arteriole (tubuloglomerular feedback), lowering renal perfusion and GFR.",
          "Hyperkalaemia: saline acidosis shifts potassium out of cells. That saline is safe in hyperkalaemia because it contains no potassium is a myth; Ringer's lactate lowers potassium and is often preferred.",
        ], "Disadvantages"),
        points([
          "More than 2 litres of saline can cause hyperchloraemic acidosis, acute kidney injury, coagulopathy, haemodynamic instability and potential mortality. Avoid large volumes in everyone, especially at high risk of or with incipient AKI.",
          "Small to moderate volumes do not increase AKI — modest saline is acceptable with normal kidney function, no hyperchloraemia and no sepsis.",
          "Saline is the fluid of choice in metabolic alkalosis, hypovolaemia from vomiting or upper gastrointestinal suction, traumatic brain injury, and in patients receiving blood products.",
        ], "Selective use"),
        quote("Infusion of large quantities (>2 L) of supraphysiologic chloride containing normal saline can cause hyperchloremic metabolic acidosis", "53"),
      ],
    },
    {
      id: "balanced_crystalloids",
      title: "Balanced crystalloids and Ringer's lactate",
      blocks: [
        points([
          "Formulated to mirror plasma electrolytes, osmolality and pH, so large volumes can be given without electrolyte disturbance.",
          "They carry bicarbonate precursors — lactate, acetate, gluconate, malate — because bicarbonate itself is unstable in plastic containers.",
          "Chloride below 112 mEq/L: RL 109 and PlasmaLyte A 98, against plasma 102 and saline 154 mEq/L.",
          "Serum lactate: each litre of RL holds 28 mmol sodium lactate, but the rise in serum lactate is transient and under 1.00 mmol/L, so serial lactate readings are not materially confounded.",
          "RL does not cause lactic acidosis. Lactic acid (pH 2.44 to 3.51) is an acid; the sodium lactate in RL (pH 6.0 to 7.3) is a conjugate base that absorbs hydrogen ions and may correct acidosis or cause metabolic alkalosis.",
          "Hyperkalaemia: RL holds 4 mEq/L potassium and cannot raise serum potassium above 4 mEq/L; a hyperkalaemic patient's level trends towards 4. Because 98% of potassium is intracellular and acidosis shifts it out, correcting acidosis with RL can lower potassium.",
          "Diabetic ketoacidosis: RL may be considered over saline — dextrose-free, less hyperchloraemic acidosis, provides bicarbonate, lower cost, shorter stay, quicker resolution of acidosis.",
        ]),
        points([
          "Neurological: RL is hypotonic (273 mOsm/L against plasma about 285 mOsm/kg) and can cause or worsen cerebral oedema — avoid where intracranial pressure may rise: aneurysmal subarachnoid haemorrhage, traumatic brain injury, neurosurgery.",
          "Liver: lactate is metabolised in the liver. Cirrhosis or dysfunction is not an absolute contraindication, but in severe or frank liver failure and after liver transplant a bicarbonate- or acetate-buffered fluid (PlasmaLyte) is preferred, acetate being metabolised in all tissues.",
          "Metabolic alkalosis in severe liver failure or cirrhosis (vomiting, nasogastric suction, diuretics, hypovolaemia) promotes ammonia production and hepatic encephalopathy — avoid buffer-providing balanced fluids in such patients.",
          "Large volumes: hyperlactataemia, metabolic alkalosis, hypotonicity; sodium 130 mEq/L can produce hyponatraemia.",
          "Calcium in RL may make it unsuitable for co-infusion with blood products through the same line.",
        ], "Where RL is avoided"),
        quote("Ringer's lactate is safer than normal saline in hyperkalemia", "50"),
        quote("RL can cause or exacerbate cerebral edema and should, therefore, be avoided in cases with a risk of raised intracranial pressure", "50"),
      ],
    },
    {
      id: "evidence",
      title: "Saline against balanced crystalloid: the evidence as the book reads it",
      intro: "The chapter reviews the trials, meta-analyses and guidelines and finds none showing saline superior. The narrative is condensed here; the numbers are the book's.",
      blocks: [
        table(
          ["Study", "n / setting", "Finding"],
          [
            ["Shaw 2012, Ann Surg", "30,994 saline vs 926 PlasmaLyte, open abdominal surgery", "Less postoperative morbidity with PlasmaLyte."],
            ["Yunos 2012, JAMA", "760 critically ill", "Chloride-restrictive strategy: significantly less AKI and renal replacement therapy."],
            ["McCluskey 2013, Anesth Analg", "22,851 non-cardiac surgery", "Postoperative hyperchloraemia linked to higher mortality, renal dysfunction, longer stay."],
            ["Raghunathan 2014, Crit Care Med", "53,448 ICU sepsis", "Lower in-hospital mortality with balanced fluids."],
            ["SMART 2018, NEJM", "15,802 critically ill", "Balanced fluids: lower death, RRT or persistent renal dysfunction."],
            ["SALT-ED 2018, NEJM", "13,347 non-critically ill", "No difference in hospital-free days; fewer major adverse kidney events with balanced fluids."],
            ["SPLIT 2015, JAMA", "2,278 ICU", "No reduction in AKI with buffered fluid; median saline exposure under 2 L."],
            ["SALT 2017, AJRCCM", "974 ICU", "No difference in AKI or major adverse kidney events."],
            ["BaSICS 2021, JAMA", "11,000 ICU", "No difference in mortality or AKI."],
            ["PLUS 2022, NEJM", "5,000 ICU", "No reduction in mortality or kidney injury."],
            ["Krajewski 2015, Br J Surg", "21 studies, 6,253 patients", "High-chloride fluids: more AKI, no mortality benefit."],
            ["Hammond 2022; Beran 2022; Zampieri 2024 (meta-analyses)", "critically ill and sepsis", "Lower mortality (and AKI in sepsis) with balanced fluids."],
            ["Isha 2023, Front Med", "2,022 sepsis, retrospective", "No difference in mortality, stay, ventilation or RRT."],
            ["Surviving Sepsis 2021; ESICM 2024", "guidelines", "Balanced crystalloid suggested over saline (SSC 2017 had said either); ESICM prefers balanced in severe volume depletion, sepsis and kidney injury."],
          ]
        ),
        points([
          "No trial shows saline superior to a balanced crystalloid. The neutral trials (SPLIT, SALT, BaSICS, PLUS) gave modest saline volumes; the benefit of balanced fluids is most evident with large volumes and in sepsis.",
          "The preference for balanced crystalloids is without high-quality evidence, but low risk of harm and a real possibility of benefit make them a prudent choice.",
        ]),
        quote("not a single study has demonstrated the superiority of saline over balanced crystalloids", "52–53"),
      ],
    },
    {
      id: "choosing_a_crystalloid",
      title: "Choosing the crystalloid",
      intro: "The chapter's own conclusions, gathered into one table. Select considering history, cause, and acid–base and electrolyte disorders.",
      blocks: [
        table(
          ["Situation", "The book's preference"],
          [
            ["Default resuscitation; sepsis; acutely ill critical patients; surgical patients; trauma; high AKI risk; acute pancreatitis; diarrhoea; burns", "Ringer's lactate (balanced crystalloid first-line)"],
            ["Metabolic acidosis, hyperchloraemia, raised creatinine, risk of kidney injury, large volumes anticipated", "Balanced crystalloid — benefit most evident here"],
            ["Metabolic alkalosis with hypochloraemia; vomiting or upper GI suction; hypovolaemic hyponatraemia", "Normal saline"],
            ["Traumatic brain injury or risk of raised intracranial pressure; neurosurgery; aneurysmal SAH", "Normal saline (RL is hypotonic; albumin avoided in severe TBI)"],
            ["Receiving blood products through the same line", "Normal saline (RL calcium precipitates with citrate) or calcium-free PlasmaLyte"],
            ["Frank hepatic failure; post-liver-transplant; shock with impaired lactate metabolism; need to trend lactate", "PlasmaLyte (acetate buffered) rather than RL"],
            ["Unknown glycaemic status", "Any dextrose-free crystalloid; never 5% dextrose or dextrose saline"],
          ]
        ),
        quote("balanced crystalloids could be a prudent choice in clinical practice", "53"),
      ],
    },
    {
      id: "plasmalyte_vs_rl",
      title: "PlasmaLyte or Ringer's lactate",
      blocks: [
        points([
          "Lactate is metabolised mainly in the liver — impaired in substantial liver dysfunction, extreme hypoxia, severe sepsis and septic shock, and tissue hypoperfusion from pronounced hypotension. Acetate is metabolised in tissues throughout the body, its capacity is preserved in shock, it converts rapidly to bicarbonate and needs little oxygen.",
          "RL limitations: no buffering and lactate accumulation when the liver fails (confounding lactate as a resuscitation marker); hypotonic (278 against plasma 290 mOsmol/L in this passage), so caution in cerebral oedema; sodium 130 against 140 mEq/L, so large volumes can cause hyponatraemia; calcium precipitates with citrate in transfused blood.",
          "PlasmaLyte: acetate, gluconate and maleate buffers give bicarbonate even in severe liver failure and shock and do not touch serum lactate; osmolality equals plasma (290 mOsmol/L); sodium 140 mEq/L; calcium-free; 1.5 mmol/L magnesium — useful in hypomagnesaemia, cautious where hypermagnesaemia threatens.",
          "Trials comparing lactate and acetate buffers are small and of low certainty either way; there is no consensus. RL stays the most preferred — cheap, available, physiological. PlasmaLyte is an excellent choice where RL is relatively contraindicated, not yet a strong recommendation, and cost limits it.",
        ]),
        table(
          ["PlasmaLyte suggested in", "Why, per the text"],
          [
            ["Diabetic ketoacidosis", "Dextrose-free; less hyperchloraemic acidosis; bicarbonate; faster resolution; shorter ICU and hospital stay."],
            ["Perioperative — major open GI and liver surgery including transplant, complex cardiac surgery", "Better acid–base, electrolytes and lactate; lower mortality than saline on the day of major surgery."],
            ["Critically ill and trauma patients, except traumatic brain injury", "Likely the optimal resuscitation fluid in most."],
            ["Priming the cardiopulmonary bypass circuit", "Less metabolic acidosis, better calcium."],
            ["Deceased-donor kidney transplantation", "Less delayed graft function (BEST-Fluids); fewer acute electrolyte disturbances in children; preferred over saline."],
          ]
        ),
        quote("PlasmaLyte should be preferred over normal saline as the fluid of choice in deceased donor kidney transplantation", "57"),
      ],
    },
    {
      id: "colloids",
      title: "Colloids: second-line, selective",
      blocks: [
        points([
          "Potent: rapid haemodynamic improvement with small volumes for longer. Recommended for a select few patients, never routinely.",
          "Rationale: greater expansion (all of it stays intravascular, so less volume and fewer large-crystalloid harms — hyperchloraemic acidosis, dilutional coagulopathy, tissue oedema, weight gain, anasarca, delayed healing); faster achievement of haemodynamic endpoints; longer intravascular half-life.",
          "These theoretical advantages have not translated into better safety or long-term outcomes in the large trials.",
        ]),
        table(
          ["Study", "Finding"],
          [
            ["Cochrane Injuries Group 1998", "Albumin may increase mortality in the critically ill."],
            ["SAFE 2004", "4% albumin and saline: similar outcomes at 28 days."],
            ["Cochrane 2011 (38 trials)", "No evidence albumin lowers mortality in burns or hypoalbuminaemia."],
            ["Xu 2014 (5 RCTs, 3,658 severe sepsis)", "Trend to lower 90-day mortality with albumin."],
            ["Patel 2014 (16 trials, 4,190 sepsis)", "Albumin did not reduce all-cause mortality."],
            ["ALBIOS 2014 (1,800 septic)", "20% albumin versus crystalloid: no difference at 28 or 90 days."],
            ["6S 2012; CHEST 2012; Cochrane 2013", "HES: more renal replacement therapy; 6S significantly higher 90-day mortality."],
            ["CRISTAL 2013", "No difference in 28-day mortality; lower 90-day mortality with colloids."],
            ["Cochrane 2013 (78 RCTs); Cochrane 2018", "No survival benefit and higher cost; starches slightly increase transfusion and RRT."],
            ["Martin and Bassett 2019 (55 RCTs)", "Crystalloids less effective than colloids at stabilising resuscitation endpoints."],
            ["Surviving Sepsis 2021; ESICM 2024", "Crystalloids for initial and ongoing resuscitation; crystalloids over colloids, especially non-bleeding hypovolaemia."],
          ],
          "Colloid trials in brief"
        ),
        points([
          "Crystalloids are favoured over colloids for septic and non-septic resuscitation; no indication exists for routine colloid use.",
          "Colloids are usually added to crystalloids when a large crystalloid volume is likely, to reach stability with less volume and less positive balance.",
          "Synthetic colloids (HES, dextran, gelatin) are not used routinely — tubular necrosis and acute kidney injury.",
        ], "Current recommendations"),
        quote("no indications currently exist for the routine use of colloids over crystalloids", "60"),
      ],
    },
    {
      id: "albumin",
      title: "Albumin",
      blocks: [
        points([
          "Not first-line in septic or non-septic patients. A second-line adjunct with crystalloids when the patient is unresponsive to crystalloids, needs substantial crystalloid volumes to reach haemodynamic endpoints, or cannot tolerate large-volume crystalloid; also in cirrhosis.",
          "Reduces the total crystalloid volume needed; more effective when the patient is hypoalbuminaemic.",
          "In sepsis, early combination of albumin (particularly 20%) with balanced crystalloids within the first 24 hours decreases mortality.",
          "Recommended in spontaneous bacterial peritonitis, hepatorenal syndrome, large-volume paracentesis above 5 L, and cirrhosis.",
          "Costs 30 to 100 times a crystalloid, with occasional supply shortages.",
        ]),
        caution([
          "Avoid albumin for resuscitation in severe traumatic brain injury — mortality rises, most likely through raised intracranial pressure. 4% albumin is hypotonic (260 mOsmol/kg) and increases brain oedema.",
        ]),
        quote("Avoid albumin for resuscitation in patients with severe traumatic brain injury (TBI)", "60"),
        quote("The 30 to 100 times higher cost of albumin compared to crystalloids", "60"),
      ],
    },
    {
      id: "hes_gelatin_dextran",
      title: "Hydroxyethyl starch, gelatin, dextran",
      blocks: [
        points([
          "HES was once the commonest colloid; current recommendations are against it. Adverse effects: more acute kidney injury, more renal replacement therapy, excessive postoperative bleeding, more transfusion, higher mortality.",
          "Its only remaining indication is as an adjuvant for hypovolaemia from acute blood loss when crystalloids alone are insufficient. The FDA has also raised safety concerns.",
        ]),
        table(
          ["Date", "European Medicines Agency", "Rule"],
          [
            ["2013", "PRAC restriction", "Lowest effective dose for the shortest period; not beyond 24 hours; monitor kidney function for 90 days; no longer in sepsis, burns or the critically ill; only for hypovolaemia from acute blood loss when crystalloids are insufficient."],
            ["July 2018", "Tightened", "Dose less than 30 mL/kg; maximum duration under 24 hours; initial phase of volume resuscitation only; monitor kidney function for at least 90 days."],
            ["24 June 2022", "Suspended", "Marketing authorisation suspended — persistent use in contraindicated populations; risks outweigh benefits."],
          ],
          "HES regulatory limits"
        ),
        points([
          "Gelatin: more anaphylaxis, AKI, bleeding and mortality; Surviving Sepsis 2021 advises against it in sepsis and septic shock.",
          "Dextran: used in vascular surgery to lower viscosity and improve microvascular flow after grafting, but restricted — antithrombotic action, renal dysfunction, hypersensitivity, interference with blood grouping and cross-matching. Highest anaphylaxis risk of the synthetic colloids.",
        ]),
        quote("dose less than 30 mL/kg and maximum duration <24 hours", "59"),
        quote("the EMA suspended the use of HES on 24 June 2022", "61"),
      ],
    },
    {
      id: "blood_transfusion",
      title: "Blood in hypovolaemic shock",
      intro: "With massive blood loss or active bleeding, transfusion joins fluid replacement and haemorrhage control. Decisions rest on the clinical state.",
      blocks: [
        table(
          ["Patient", "Transfuse when", "Note"],
          [
            ["Hospitalised, haemodynamically stable adult", "haemoglobin 7 g/dL or below (haematocrit 21% or below)", ""],
            ["High risk — cardiac surgery, myocardial or other organ ischaemia", "haemoglobin 8 g/dL or below", "maintain haemoglobin at 8 g/dL or above"],
            ["Ongoing significant bleeding with hypovolaemia", "on pulse, blood pressure, rate of bleeding and estimated loss — not serial haemoglobin alone", "large volumes: massive transfusion protocol, plasma : platelets : red cells 1:1:1"],
            ["Everyone", "do not raise haemoglobin above 10 g/dL or haematocrit above 30%", "higher haematocrit adds nothing to oxygen transport and raises viscosity, causing stasis in impaired capillaries"],
          ]
        ),
        quote("blood transfusion is necessary if the hemoglobin level drops to ≤7 gm/dL (hematocrit ≤21%)", "62"),
        quote("infuse one unit of plasma, one unit of platelets, and one unit of red blood cells (1:1:1 ratio)", "62"),
        quote("hemoglobin and hematocrit should not be raised over 10 gm/dL and 30%, respectively", "62"),
      ],
    },
    {
      id: "cautions",
      title: "Cautions the chapter states",
      blocks: [
        caution([
          "Never 5% dextrose or dextrose saline for resuscitation — poor expansion, and osmotic diuresis masks the hypovolaemia.",
          "Avoid more than 2 litres of normal saline; avoid large saline volumes at any AKI risk.",
          "Saline is not safe in hyperkalaemia merely because it lacks potassium; its acidosis can worsen hyperkalaemia. RL does not cause lactic acidosis and is safer in hyperkalaemia.",
          "Avoid RL in traumatic brain injury, aneurysmal SAH, neurosurgery and brain oedema; in frank hepatic failure or after liver transplant; where metabolic alkalosis threatens hepatic encephalopathy; and use with caution in severe metabolic alkalosis with hypochloraemia.",
          "Do not run RL with citrated blood through the same line. Large RL volumes: hyponatraemia, hyperlactataemia, metabolic alkalosis.",
          "PlasmaLyte: caution where hypermagnesaemia is a risk.",
          "Colloids are not first-line and have no routine indication. Albumin is avoided in severe TBI. HES is suspended; gelatin is not for sepsis; dextran carries anaphylaxis and cross-matching problems.",
          "In sepsis, fluid delayed more than 2 hours after diagnosis predicts fluid-refractory shock.",
          "Do not over-transfuse: haemoglobin no higher than 10 g/dL, haematocrit no higher than 30%.",
          "Kidney impairment or heart failure: resuscitate under close monitoring and consider earlier vasopressors.",
        ]),
        quote("Fluid resuscitation should be done under close monitoring in high-risk patients who have kidney impairment or congestive heart failure", "43"),
      ],
    },
  ],
};
