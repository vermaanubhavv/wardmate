import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * OBSTETRIC FLUIDS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapters 51–54, which the source edition carries in full. Every number below is
 * the book's; the quotes give the page it came from. Chapter 53 prints no magnesium sulfate
 * regimen and none is given here.
 */
export const obstetricFluidsV1: FluidTopic = {
  id: "obstetric_fluids",
  version: "1.0.0",
  title: "Obstetric fluids: pregnancy, caesarean, pre-eclampsia, haemorrhage and labour hyponatraemia",
  group: "settings",
  summary: "What pregnancy does to the numbers, and the book's fluid rules for hyperemesis, labour, spinal hypotension, pre-eclampsia, postpartum haemorrhage and hyponatraemia in labour.",
  setting: "Obstetric ward, labour room and theatre; anaesthesia",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: [
      "51 Maternal Changes and Fluid Management during Pregnancy",
      "52 Fluid Management for Cesarean Delivery",
      "53 Fluid Management in Preeclampsia and Postpartum Hemorrhage",
      "54 Hyponatremia during Labor",
    ],
    pages: "292–325",
  },
  sections: [
    {
      id: "physiology",
      title: "What pregnancy changes",
      intro: "Haemodynamic changes begin just after conception and resolve within six weeks of delivery. The expanded blood volume is what lets most women tolerate the blood loss of delivery.",
      blocks: [
        table(
          ["Parameter", "Change in the text"],
          [
            ["Sodium retained over the pregnancy", "900 to 1000 mEq"],
            ["Total body water retained", "6 to 8 litres"],
            ["Plasma volume", "rises from the fourth week, peaks at 28 to 34 weeks; up 40% to 50%"],
            ["Red cell volume", "up only 15% to 20% — haemodilution, the physiological anaemia of pregnancy"],
            ["Cardiac output", "up 30% to 40% (stroke volume and heart rate); maximum around 28–30 weeks"],
            ["Blood pressure", "falls early; usually 10 mmHg below baseline in the second trimester; back to non-pregnant levels by term as vascular resistance rises"],
            ["Each first-stage contraction", "displaces 300 to 500 ml of blood into the circulation; central blood volume up by as much as 500 ml; cardiac output up 50% with each contraction"],
            ["Immediately postpartum", "cardiac output 80 percent above pre-labour values (autotransfusion from uterine involution); up to 75% above baseline across labour and delivery"],
            ["Average blood loss at delivery", "300–400 ml vaginal; 500–800 ml caesarean"],
          ]
        ),
        quote("there is a retention of 900 to 1000 mEq of sodium and 6 to 8 liters of total body water", "293"),
        quote("The maternal plasma volume increases by 40% to 50% during pregnancy", "293"),
      ],
    },
    {
      id: "hyperemesis",
      title: "Hyperemesis gravidarum",
      intro: "Nausea and vomiting affect 50%–90% of pregnancies; hyperemesis, the severe form, 0.3% to 3%. It brings weight loss, dehydration, ketoacidosis, hypokalaemic metabolic alkalosis from lost gastric acid, and thiamine and vitamin K deficiency. Thiamine deficiency is present in about 60% of patients.",
      blocks: [
        points([
          "Persistent vomiting, three or more times per 24 hours, despite antiemetics.",
          "5% or more loss of pre-pregnancy weight.",
          "Severe dehydration: fatigue, dizziness, reduced skin turgor, postural change in blood pressure and pulse, ketonuria, electrolyte imbalance, hypochloraemic metabolic alkalosis, raised haematocrit, raised BUN to creatinine ratio, abnormal urine specific gravity.",
          "Ambulatory intravenous hydration is the recommended first line and is as effective as inpatient care; admit if vomiting persists after rehydration and outpatient management fails.",
        ], "Indications for intravenous fluid"),
        table(
          ["Phase", "Fluid", "Volume and rate as printed", "Why"],
          [
            ["Initial aggressive rehydration, severe dehydration", "Ringer's lactate", "2 litres rapidly: first 1 litre over 2 hours, second 1 litre over 4 hours", "Ringer's lactate is preferred for the initial phase"],
            ["Symptomatic, severe hyponatraemia (serum sodium <120 mEq/L)", "Ringer's lactate (sodium 130 mEq/L)", "as above", "Lower risk of rapid correction and central pontine myelinolysis than a large volume of normal saline (sodium 154 mEq/L)"],
            ["Subsequent slower rehydration; sodium >120 mEq/L with hypochloraemia and minimal symptoms", "Normal saline (154 mEq/L sodium and chloride)", "slower", "Corrects the vomiting-induced hypochloraemia, hyponatraemia, hypokalaemia and metabolic alkalosis"],
            ["Hypokalaemia (usual)", "20 mEq/L potassium chloride in normal or half-normal saline, by serum sodium", "infused slowly over 6 to 8 hours", "—"],
            ["Severe hypokalaemia", "One litre normal saline with 40 mEq potassium chloride", "over 4–6 hours", "10 mEq of potassium per hour is a safe rate if urine output is adequate"],
            ["Thiamine", "100 mg intravenously", "with the initial fluid on day one, then 100 mg daily for the next two or three days", "Prevents Wernicke's encephalopathy; give before any dextrose"],
            ["Maintenance, after thiamine and potassium", "Dextrose-based; 10% dextrose rather than 5%", "—", "Calories and faster relief of nausea; dextrose saline improved moderate–severe cases more than normal saline"],
          ],
          "Fluid selection in the text"
        ),
        steps([
          "Continue intravenous hydration until ketosis and vitamin deficiencies are corrected and oral fluids are tolerated.",
          "Then check and correct magnesium, calcium and phosphorus.",
          "Daily input–output chart, blood urea and serum electrolytes while the deficit is being replaced.",
        ], "Duration and monitoring"),
        caution([
          "No dextrose in the initial fluid: it can precipitate Wernicke's encephalopathy in a thiamine-deficient woman, and the insulin it releases shifts potassium into cells and worsens hypokalaemia.",
          "In severe hyponatraemia do not give a large volume of normal saline rapidly.",
        ]),
        quote("2 liters of Ringer's lactate is infused rapidly initially (first 1 liter RL over 2 hours followed by second 1-liter RL over 4 hours)", "294"),
        quote("In severe hyponatremia, avoid rapid administration of a large volume of high sodium containing normal saline (sodium 154 mEq/L)", "294"),
        quote("one liter of normal saline with 40 mEq potassium chloride to be infused over 4–6 hours", "295"),
        quote("10 mEq of potassium per hour is a safe infusion rate if urine output is adequate", "295"),
        quote("Supplement 100 mg of thiamine intravenously with the initial IV fluid on the first day and another 100 mg daily", "295"),
      ],
    },
    {
      id: "labour",
      title: "Normal labour and vaginal delivery",
      intro: "Labour is prolonged vigorous exercise; glucose is the substrate, and glycogen depletion brings ketonaemia, hypoglycaemia and acidosis. Dehydration may lengthen labour. Judge hydration by urine output and ketonuria.",
      blocks: [
        points([
          "The nil-by-mouth policy rested on aspiration risk under emergency general anaesthesia; that risk is very low, and restriction causes dehydration and ketosis. Low-risk women are allowed and encouraged to take moderate amounts of clear liquids. What matters for aspiration is the particulate content, not the volume.",
          "Restrict oral intake in women at high aspiration risk (morbid obesity, diabetes, difficult airway) or who may need a caesarean.",
          "Solid food and particulate fluids are avoided in active labour (ACOG 2009, ASA 2016) because gastric emptying is prolonged; the evidence for this in low-risk women is questioned.",
          "Continuous intravenous infusion is not routinely recommended in normal labour (Cochrane 2013, WHO 2014, ACOG 2019). Its harms: restricted movement, peripheral swelling and overload, postpartum breast swelling and feeding problems, a bloated newborn with greater weight loss after birth.",
        ], "Oral intake and routine drips"),
        points([
          "High-risk pregnancy, or oral intake restricted because a caesarean may be needed.",
          "Ketosis in labour.",
          "After epidural or spinal anaesthesia for caesarean, to prevent or treat hypotension.",
          "Oxytocin infusion for induction or augmentation.",
          "Nausea, vomiting, diarrhoea, maternal exhaustion, prolonged labour, blood loss, intravenous antibiotics or other drugs.",
        ], "When intravenous fluid is indicated"),
        table(
          ["Item", "Recommendation in the text"],
          [
            ["Default solute", "Dextrose — in nulliparous women denied oral intake it shortens total labour without raising complications"],
            ["Usual maintenance fluid", "5% dextrose in 0.45 percent saline, normal saline, or Ringer's lactate"],
            ["Avoid", "Sodium-free 5% dextrose: maternal and neonatal hyponatraemia"],
            ["Rate", "250 ml/hour rather than 125 ml/hour: shorter labour and fewer caesareans in nulliparous women with restricted oral intake"],
          ],
          "Type, volume and rate"
        ),
        table(
          ["Intake before elective caesarean", "Uncomplicated", "High aspiration risk"],
          [
            ["Clear liquids", "up to 2 hours before induction of anaesthesia (ASA 2016); a high-calorie carbohydrate drink up to two hours before reduces thirst, hunger, anxiety and dehydration", "restrict for 6 or more hours, case by case"],
            ["Solid food", "6 to 8 hours", "—"],
          ],
          "Preoperative fasting"
        ),
        quote("continuous IV fluid infusion is not routinely recommended in normal labor", "297"),
        quote("Avoid administering sodium-free 5% dextrose solution because it may cause maternal and neonatal hyponatremia", "297"),
        quote("IV fluid administration at a rate of 250 ml/hour, rather than 125 ml/hour, is associated with a shorter duration of labor", "298"),
        quote("may have clear liquids up to 2 hours before induction of anesthesia", "298"),
      ],
    },
    {
      id: "caesarean_loading",
      title: "Caesarean under spinal: fluid loading",
      intro: "Spinal anaesthesia is the commonest technique for caesarean and maternal hypotension its commonest complication: 70–80% of elective caesareans, against about 33% in non-pregnant women. Sympathetic block dilates the lower body and leaves a relative hypovolaemia. Sustained hypotension cuts uteroplacental perfusion and causes fetal hypoxia, acidosis and neonatal depression; the mother gets nausea, vomiting and dizziness from transient brainstem ischaemia.",
      blocks: [
        points([
          "Hypotension: systolic below 90 mmHg, or a fall in mean arterial pressure of more than 30% from baseline.",
          "Goal: systolic at or above 100 mmHg, or at or above 90% of an accurately measured baseline.",
          "Large-bore access, preferably 16 or 18 gauge, before the spinal. Combinations of fluid, vasopressor and positioning beat any single measure.",
        ], "Definition and target"),
        table(
          ["Strategy", "Timing", "Fluid and volume", "Verdict in the text"],
          [
            ["Crystalloid preload", "15–20 minutes before the spinal", "Ringer's lactate 10–20 mL/kg", "Clinically ineffective because it redistributes rapidly; currently not recommended"],
            ["Colloid preload", "Before the spinal", "not quantified", "Reduces hypotension, but preload is not superior to co-load, so do not delay the spinal to give it"],
            ["Crystalloid co-load", "Started with the spinal, as fast as possible", "Ringer's lactate about 10–15 ml per kg or 500 to 1000 mL, dextrose-free", "More effective than crystalloid preload and as effective as colloid preload; the recommended approach"],
            ["Colloid co-load", "With the spinal", "Tetrastarch (HES 130/0.4) seems safer than other colloids; a smaller volume than crystalloid", "Equal to crystalloid co-load, not superior to colloid preload; crystalloids preferred on cost, availability and adverse effects"],
            ["Total crystalloid during and after caesarean", "—", "Usually 2 to 3 litres; more with sepsis, vomiting, prolonged labour without intake, or greater blood loss", "—"],
            ["Pre-eclampsia", "—", "Mild to moderate loading only, a smaller volume", "Spinal causes less hypotension than in healthy women; a large volume risks pulmonary oedema"],
          ]
        ),
        caution([
          "Co-load with dextrose-free fluid. Maternal hyperglycaemia becomes fetal hyperglycaemia and hyperinsulinaemia; after the cord is clamped the glucose stops and the insulin does not, and the newborn becomes hypoglycaemic.",
          "Fluid alone is not usually enough: a significant proportion of women also need a vasopressor, and prophylactic vasopressor beats reactive treatment for neonatal outcome.",
        ]),
        quote("Maternal hypotension is defined as systolic blood pressure (SBP) <90 mmHg or a reduction in mean arterial blood pressure >30% fall from baseline", "301"),
        quote("Treatment aims to maintain systolic blood pressure ≥100 mmHg or ≥90% of an accurately measured baseline blood pressure", "302"),
        quote("a bolus of about 10–15 ml per kg or 500 to 1000 mL of Ringer's lactate is infused as fast as possible", "302"),
        quote("Use dextrose free IV fluids for crystalloid co-loading because it avoids maternal hyperglycemia", "302"),
      ],
    },
    {
      id: "caesarean_vasopressors",
      title: "Caesarean under spinal: vasopressors and positioning",
      intro: "Titrated phenylephrine with crystalloid co-load is probably the best option; a phenylephrine infusion co-administered with crystalloid has been shown to eliminate the likelihood of spinal hypotension.",
      blocks: [
        table(
          ["Vasopressor", "Phenylephrine", "Ephedrine", "Norepinephrine (noradrenaline)"],
          [
            ["Mechanism", "Selective direct α1 receptor agonist", "Direct α and β agonist and indirect release of norepinephrine", "Direct α1 and β1 agonist"],
            ["Arterial vasoconstriction", "Potent", "Less potent", "Potent"],
            ["Chronotropic effect", "Negative", "Positive", "Positive"],
            ["Maternal heart rate", "Reflex bradycardia", "Tachycardia", "Increased"],
            ["Cardiac output", "Decrease", "Increase", "Modest increase"],
            ["Onset", "Faster", "Slower", "Immediate"],
            ["Duration", "Short-acting (15 to 20 minutes)", "Relatively long (about 60 min), so a longer period of hypotension", "Very short (1 to 2 minutes)"],
            ["Advantage", "No maternal tachycardia, better titratability", "No maternal bradycardia", "Less negative effect on heart rate and cardiac output"],
            ["Selection", "Currently preferred in post-spinal hypotension; preferred in maternal tachycardia", "Preferred in maternal bradycardia", "Beneficial in bradycardia and compromised cardiac function in recent studies"],
            ["Strength and dilution", "10 mg/mL; 1 mL in 100 ml normal saline equals 100 mcg/mL", "30 mg/mL or 50 mg/mL; 1 mL in 10 ml normal saline equals 3 mg/mL or 5 mg/mL", "1 mg/mL; 2 mL in 500 ml D5W or D5NS equals 4 mcg/mL"],
            ["Commonly used doses", "50 to 100 mcg IV bolus or 25 to 100 mcg/min IV infusion", "5 to 10 mg IV boluses or 1 to 5 mg/min IV infusion", "Further studies are required before routine use"],
          ],
          "Table 52.1 Vasopressors in spinal hypotension during cesarean delivery",
          "The table prints an infusion range of 25 to 100 mcg/min; the chapter text recommends 25–50 mcg/min. Both are given here as printed."
        ),
        steps([
          "Preparation: a 1 ml ampoule holds 10 mg. Add 1 ml (10 mg) to 100 ml of normal saline for 100 mcg/ml.",
          "Prophylactic bolus: 50 to 100 mcg (0.5 to 1 ml), repeated every 2 to 5 minutes as required, to a total of no more than 200 micrograms.",
          "Prophylactic infusion, the AAGBI 2018 first line: 25–50 mcg/min (0.25 to 0.5 ml/min) by pump, started as soon as the spinal is given and titrated to systolic pressure and pulse. The lower dose gives more hypotension; the higher dose more reactive hypertension and bradycardia.",
          "Bolus then infusion: a bolus immediately after the spinal followed by the infusion maintains pressure without the delay of infusion alone.",
          "Infusion beats bolus-only on intraoperative nausea and vomiting. High doses cause baroreceptor bradycardia and reduce maternal cardiac output.",
        ], "Phenylephrine in the text"),
        points([
          "Hypotension with tachycardia — the usual response: phenylephrine.",
          "Hypotension with bradycardia — the unusual, vagal-like response: ephedrine, 5 to 10 mg boluses or 1 to 5 mg/min. Ephedrine is falling out of favour: tachyphylaxis, delayed onset, long duration that hampers titration, and more placental transfer with fetal acidosis. It may suit compromised cardiac function, uteroplacental insufficiency and pre-eclampsia.",
          "Low baseline heart rate or poor cardiac function, where phenylephrine is relatively contraindicated: norepinephrine, which still needs more evidence before routine use.",
        ], "Choosing by maternal heart rate"),
        points([
          "Supine, the gravid uterus compresses the aorta and inferior vena cava. Left lateral uterine displacement with a 15° table tilt is routinely recommended alongside the other measures.",
          "After an uncomplicated caesarean, oral intake within six hours brings earlier bowel function, earlier ambulation, less intravenous fluid, less sepsis, earlier breastfeeding and a shorter, cheaper stay.",
          "Intraoperative nausea and vomiting are reduced by preventing hypotension (liberal perioperative fluid, prophylactic phenylephrine or ephedrine), metoclopramide with ondansetron, and minimal visceral manipulation. Antiemetic combinations beat monotherapy.",
        ], "Positioning and after the operation"),
        quote("prophylactic bolus of IV phenylephrine is 50 to 100 mcg (0.5 to 1 ml)", "304"),
        quote("do not give more than a total dose of 200 micrograms (mcg)", "304"),
        quote("Currently recommended dose of phenylephrine infusion is 25–50 mcg/min. (0.25 to 0.5 ml/min)", "304"),
        quote("The commonly used dose of ephedrine is 5 to 10 mg IV boluses or 1 to 5 mg/min IV infusion", "305"),
        quote("50 to 100 mcg IV bolus or 25 to 100 mcg/min IV infusion", "306"),
      ],
    },
    {
      id: "preeclampsia",
      title: "Pre-eclampsia: restrict, measure, do not chase",
      intro: "Hypertension with significant proteinuria after 20 weeks; suspect it when weight gain is sudden and rapid, more than 2.3 kg/week. The paradox is intravascular depletion alongside an expanded extracellular fluid volume, so excess fluid and the mobilisation of sequestered fluid carry a high risk of pulmonary oedema. Guidelines are against plasma volume expansion (NICE, SOGC, SOMANZ) and for restriction (NICE, GAIN, CMQCC, SOGC). This chapter gives no magnesium sulfate regimen; anticonvulsant medication appears only as something intravenous fluid is a vehicle for.",
      blocks: [
        table(
          ["Situation", "Limit as printed"],
          [
            ["General restriction", "Maximum 40 ml per hour plus the previous hour's urine output, up to a total of 80 ml per hour or 1 mL/kg/hr"],
            ["Severe pre-eclampsia without fluid losses", "Total intake 80 ml/hour — oral, drug and intravenous together"],
            ["Antenatal, caesarean likely", "Nil by mouth, or oral fluid 30 ml per hour or less"],
            ["Oxytocin", "High-concentration infusion, 30 IU in 500 mL, or dilute in just 50 mL by infusion pump"],
            ["Spinal co-load", "500 mL to 1000 mL is sufficient unless replacing blood loss; never a fixed preload bolus"],
            ["Postpartum, until diuresis", "Intravenous plus oral 80 mL per hour or less; taper and stop the drip once she tolerates more than 80 mL of oral fluid per hour"],
            ["Physiological postpartum oliguria", "Less than 15 mL/h in the first six hours: wait and observe, do not give fluid"],
            ["Oliguria persisting beyond 6 hours", "Exclude renal disease or a rising creatinine, then a fluid challenge of 250–500 ml normal saline or Ringer's lactate"],
            ["Natural diuresis", "Typically within 36–48 hours"],
            ["Oliguria beyond 24 hours with rising creatinine", "Postpartum renal failure"],
            ["Maintenance in a fasting woman", "Slowly over 24 hours; volume matches urine output plus insensible loss"],
            ["SpO2", "A fall below 95% may mean impending pulmonary oedema; fluid overload is the most likely cause of a falling saturation"],
            ["Preferred fluid", "Balanced crystalloids: Hartmann's, Ringer's lactate or PlasmaLyte"],
          ]
        ),
        steps([
          "She is oedematous: restrict fluid to avoid pulmonary oedema, assess frequently, and record the balance carefully.",
          "Volumetric pump for every infusion; give infused drugs in concentrated solutions.",
          "Replace obvious blood loss at delivery — but pulmonary oedema carries a higher risk of death than oliguric renal failure, so do not overuse crystalloid for haemorrhage in a pre-eclamptic woman.",
          "No preload before the spinal; 500–1000 mL of careful co-load.",
          "Indwelling catheter with hourly urometer. Keep the restriction until the postpartum diuresis, and do not chase the rise in urine output that follows delivery.",
          "Central line only for significant obstetric bleeding or severe heart dysfunction, after checking coagulation and platelets — HELLP is common.",
          "Monitor SpO2. Diuretics only once pulmonary oedema is confirmed; antepartum furosemide only for pulmonary oedema.",
        ], "Basic principles, in the book's order"),
        points([
          "Vehicle for intravenous labetalol or hydralazine; replacement of ongoing blood and fluid loss; vehicle for induction agents and anticonvulsant medication; maintenance in a fasting woman; oliguria from a suspected or confirmed intravascular deficit.",
          "Neuraxial anaesthesia is preferred: less spinal hypotension than in healthy women, while general anaesthesia risks aspiration, hypertensive surges at intubation and extubation (crisis, stroke) and a difficult airway from laryngeal oedema.",
          "Phenylephrine is the first-line vasopressor; a prophylactic infusion is not usually required and the dose needed may be lower. The fetus tolerates sudden falls badly, so monitor pressure closely and give a low dose if needed.",
          "Postpartum, intravascular volume rises as third-space fluid returns and the uterus autotransfuses; the greatest risk of eclampsia is in the first 48 hours.",
        ], "When fluid is given, and anaesthesia"),
        caution([
          "Never a routine fixed intravenous preload before neuraxial anaesthesia in pre-eclampsia.",
          "Do not treat the physiological oliguria of the first six hours with fluid.",
          "Avoid both dopamine and furosemide for persistent oliguria.",
        ]),
        quote("40 ml per hour plus the previous hour's urine output, up to a total of 80 ml per hour or 1 mL/kg/hr", "311"),
        quote("Deterioration of SpO2 below 95% may indicate impending pulmonary edema", "311"),
        quote("Pulmonary edema kills, but oliguria and renal failure do not, so administer fluid cautiously in preeclampsia", "312"),
        quote("restrict total fluid intake to 80 ml/hour, which includes oral, drug, and intravenous fluids", "312"),
        quote("A prophylactically or routine fixed intravenous fluid preload bolus should never be administered before initiating neuraxial anesthesia in preeclampsia", "313"),
        quote("Avoid administering fluids to treat this physiological oliguria (<15 mL/h urine output during the initial six hours", "313"),
        quote("A fluid bolus of 250–500 ml of normal saline or Ringer's lactate can be tried as a fluid challenge", "313"),
        quote("Both dopamine and furosemide should be avoided to treat persistent oliguria", "313"),
      ],
    },
    {
      id: "pph_recognition",
      title: "Postpartum haemorrhage: definitions and early clues",
      intro: "Around 30% of maternal deaths, 10 every hour. Uterine atony accounts for 80% of primary haemorrhage; placenta praevia, rupture, trauma, abruption and retained placenta for the rest. Loss is often concealed and pregnancy physiology masks hypovolaemia, so clinical signs correlate poorly with the volume lost. Keep a high index of suspicion; the onset of signs of volume loss warrants aggressive replacement.",
      blocks: [
        table(
          ["Guideline", "Definition"],
          [
            ["Common working definition", "≥500 ml vaginal delivery; ≥1000 ml caesarean. Minor 500–1000 mL; major more than 1000 mL, subdivided moderate 1000–2000 mL and severe more than 2000 mL"],
            ["WHO 2012", "Blood loss >500 mL within 24 hours"],
            ["FIGO 2012", ">500 ml in a vaginal birth and >1000 ml in a caesarean section"],
            ["RCOG 2016", "Minor: 500–1000 ml without clinical shock. Major: >1000 mL and continuous bleeding or clinical shock"],
            ["RANZCOG 2017", ">500 ml during the puerperium. Severe: >1000 mL"],
            ["ACOG 2017", "≥1000 ml or more, or signs and symptoms of hypovolaemia due to blood loss"],
            ["NHS Obstetric Hemorrhage 2018", "Primary minor 500–1000 ml within 24 hours; moderate 1000–1500 mL; severe ≥1500 mL; massive ≥2000 mL within 24 hours, haemodynamic instability or sign of shock"],
            ["NATA consensus 2019", "Primary >500 mL within 24 hours; severe >1000 mL within 24 hours with signs of hypovolaemia; massive life-threatening >2500 mL or hypovolaemic shock"],
          ],
          "Table 53.1 Postpartum hemorrhage definitions"
        ),
        table(
          ["Clinical", "Laboratory"],
          [
            ["Tachycardia (>100 bpm) without clinical hypovolaemia and with adequate pain control", "Hb fall >2 gm/dL before intravenous fluids"],
            ["Hypotension: BP ≤85/45 mmHg, or a fall of 20% from baseline", "Severe metabolic acidosis (base excess <-4, pH <7.2)"],
            ["Oliguria, urine <500 ml/day", "Shock index >0.9"],
            ["Persistent or recurrent hypotension despite fluid and/or vasopressors", "Serum lactate >4.0 mmol/L"],
            ["Excessive requirement for intravenous fluid", "Coagulopathy present"],
            ["Cool extremities, tachypnoea, inappropriate fear, restlessness or confusion", "—"],
          ],
          "Table 53.2 Clues for early or undetected postpartum hemorrhage"
        ),
        formula(
          "Shock index",
          "SI = HR / SBP",
          [
            { symbol: "SI", meaning: "Shock index; normal 0.5 to 0.7, higher values indicate shock and haemodynamic instability; above 0.9 is a laboratory-table clue" },
            { symbol: "HR", meaning: "Heart rate", unit: "beats/min" },
            { symbol: "SBP", meaning: "Systolic blood pressure", unit: "mmHg" },
          ],
          {
            note: "Peak shock index may detect haemorrhage better than heart rate or systolic pressure alone, but it is not a screening tool by itself. The transfusion-indication bullet prints the threshold as \">9\"; Table 53.2 prints >0.9.",
          }
        ),
        quote("blood loss of ≥500 ml for a vaginal delivery and ≥1000 ml for a cesarean birth", "314"),
        quote("divide the heart rate by the systolic blood pressure. The normal value of the shock index is between 0.5 and 0.7", "315"),
      ],
    },
    {
      id: "pph_resuscitation",
      title: "Postpartum haemorrhage: fluid resuscitation",
      intro: "Damage control resuscitation: hypotensive fluid resuscitation, blood product transfusion, and rapid identification and control of the bleeding by medical means and damage-control surgery. Raise the legs, give oxygen, keep her warm.",
      blocks: [
        table(
          ["Step", "Detail as printed"],
          [
            ["Access", "Wide-bore cannula; a 14 gauge infuses almost double the volume of an 18 gauge. Draw baseline bloods."],
            ["Until blood arrives", "Immediate rapid crystalloid (or colloid), warmed, by rapid infusion device where possible"],
            ["How much", "Crystalloid at approximately three times the estimated blood loss"],
            ["Ceiling before transfusion", "No more than 2 litres of crystalloid or 1.5 litres of colloid"],
            ["Strategy", "Hypotensive (permissive) resuscitation, not the conventional aggressive approach of more than 2 litres"],
            ["Systolic target while bleeding", "80–90 mm Hg until major bleeding is controlled"],
            ["Alternative mean arterial target", "50–60 mm Hg or 55–65 mm Hg, by the guideline cited"],
            ["Other goals", "Urine output >0.5 mL/kg/hr, normal mental status; packed cells follow the crystalloid immediately to keep haemoglobin above 8 gm/dL"],
            ["Which crystalloid", "Isotonic crystalloid over colloid (WHO 2012, Cochrane 2018). Ringer's lactate is increasingly recommended first choice; normal saline is usual on the labour ward, but more than 2 L causes hyperchloraemic acidosis and acute kidney injury"],
            ["Priority", "Replace fast and warm the fluid; the specific type matters less"],
          ]
        ),
        caution([
          "More than 2 litres of crystalloid: dilutional coagulopathy, third spacing, hypothermia from cold fluid, and worse maternal outcome.",
          "No dextrose-containing fluid (5% dextrose, dextrose saline): hyperglycaemia and osmotic diuresis.",
          "No dextrans: platelet dysfunction, interference with cross-matching, hazardous. No hydroxyethyl starch in major haemorrhage.",
          "Ringer's lactate and blood never in the same line: the calcium may clot the blood.",
        ]),
        quote("Compared to 18 gauge, 14 gauge cannula can infuse almost double the fluid volume", "316"),
        quote("avoiding using more than 2 liters of crystalloid solutions or 1.5 liters of colloids in the treatment of PPH before resorting to blood transfusion", "316"),
        quote("infuse crystalloid at a volume that is approximately three times the estimated volume of blood loss", "317"),
        quote("maintain a target systolic blood pressure of 80–90 mm Hg until major bleeding has been controlled", "317"),
        quote("Ringer's lactate and blood should not be administered in the same line because the calcium in the RL solution may cause clotting", "319"),
      ],
    },
    {
      id: "pph_blood",
      title: "Postpartum haemorrhage: blood replacement",
      intro: "Because large-volume crystalloid dilutes clotting factors, overloads and cools, the trend is haemostatic resuscitation: early blood components with permissive hypotension. There are no clear thresholds; a woman bleeding acutely can have a normal haemoglobin, so the decision is clinical.",
      blocks: [
        points([
          "Haemoglobin below 6 gm/dL, irrespective of symptoms.",
          "Clinically severe, uncontrollable haemorrhage.",
          "Blood loss of 1500 ml or more usually needs transfusion.",
          "Symptomatic (maternal tachycardia >110 beats per minute, dizziness, syncope) with active bleeding, whatever the haemoglobin — do not wait for laboratory results.",
          "A raised shock index with lactate >4.0 mmol/L and a low immediate postpartum haemoglobin predicts the need.",
          "Usually not needed when loss is small and she is asymptomatic; rarely needed above 10.0 gm/dL.",
        ], "Indications for red cells"),
        table(
          ["Item", "In the text"],
          [
            ["Product", "Packed red cells, to avoid crystalloid dilutional coagulopathy; O Rh negative when the group is unknown or cross-match is delayed in life-threatening bleeding"],
            ["Effect per unit", "About 1 gm/dL rise in haemoglobin"],
            ["Massive transfusion ratio", "Red cells : fresh frozen plasma : platelets 1:1:1, mimicking whole blood; fewer complications and better survival"],
            ["Post-transfusion goals", "Haemoglobin >8 gm/dL; platelets >50,000/mm3; fibrinogen >150–200 mg/dL; prothrombin time <1.5 times normal"],
            ["Hyperkalaemia", "Older stored packed cells carry about 5 mEq of potassium per unit (300 mL); high risk after massive transfusion"],
            ["Hypocalcaemia and citrate toxicity", "Each unit contains about 3 mg of citrate (as printed); a sick liver clears it poorly, it binds ionised calcium. Women receiving large volumes need calcium injections; monitor for toxicity"],
            ["Other complications", "Allergic reactions, volume overload, TRALI"],
          ]
        ),
        quote("Women with a hemoglobin value <6 gm/dL, irrespective of symptoms", "318"),
        quote("red blood cells, fresh frozen plasma (FFP), and platelets are in a 1:1:1 ratio", "318"),
        quote("each unit can be expected to increase the hemoglobin level by about 1 gm/dL", "318"),
        quote("Platelet counts greater than 50,000/mm3", "318"),
        quote("older stored PRBCs contain about 5 mEq of potassium per unit (300 mL)", "319"),
      ],
    },
    {
      id: "labour_hyponatraemia",
      title: "Hyponatraemia during labour",
      intro: "Labour itself does not cause hyponatraemia, defined here as serum sodium below 130 mEq/L, but it raises the risk, and after prolonged labour it is not uncommon and is hazardous to mother and newborn.",
      blocks: [
        table(
          ["Predisposing factor", "Numbers in the text"],
          [
            ["Lower baseline sodium", "Pregnancy 130–140 mEq/L against 135–145 mEq/L in non-pregnant adults; about 6 to 8 litres of water retained in the late third trimester"],
            ["Impaired water excretion", "Healthy capacity 900 ml/h; late pregnancy maximum 600 mL/h"],
            ["Oxytocin", "Structurally similar to vasopressin, so it retains water — more endogenous release in labour plus synthetic infusion"],
          ]
        ),
        table(
          ["Total intake in labour (oral + IV)", "Hyponatraemia at delivery"],
          [
            ["up to 1 litre", "1%"],
            ["1 to 2.5 litres", "5%"],
            ["above 2.5 litres", "as high as 26%"],
          ],
          "Incidence by intake",
          "Other causes: excessive oral water in prolonged labour; home-birth transfers after prolonged labour (high endogenous oxytocin plus hypotonic oral fluid); liberal intravenous fluid; large volumes of oxytocin in 5% dextrose for prolonged periods; hyperemesis, psychiatric disorders, diuretics, SSRIs, ecstasy."
        ),
        points([
          "Mother: the usual symptoms (nausea, lethargy, headache, agitation, confusion, drowsiness, seizures) plus a prolonged second stage, instrumental birth and emergency caesarean for failure to progress.",
          "Newborn, because water crosses the placenta freely: irritability, lethargy and feeding difficulty when mild; seizures, respiratory distress, apnoea, hyperbilirubinaemia and coma when severe.",
        ], "Harm"),
        steps([
          "Fluid balance chart: record oral and intravenous intake and urine output every four hours; measure electrolytes when imbalance is suspected.",
          "A positive balance above 1500 ml means high risk — check the serum sodium.",
          "Keep the balance neutral; do not encourage excessive drinking.",
          "Avoid hypotonic intravenous fluid such as 5% dextrose in labour.",
          "High-dose or prolonged oxytocin: use a higher concentration to cut the volume, dilute in normal saline or Ringer's lactate, never in electrolyte-free 5% dextrose.",
          "Monitor sodium in women on oxytocin, with a positive balance above 1500 ml, with symptoms, or with sodium below 130 mEq/L.",
        ], "Prevention"),
        points([
          "Dilutional: restrict oral and intravenous fluid, stop the oxytocin, add furosemide if there is evidence of overload.",
          "Severe symptoms (seizures, loss of consciousness): hypertonic saline with close sodium monitoring — the chapter defers the detail to its hyponatraemia chapter.",
          "Hypovolaemic depletion hyponatraemia, less common in labour: normal saline is preferred.",
        ], "Treatment"),
        quote("hyponatremia (defined as serum sodium <130 mEq/L)", "323"),
        quote("the maximum renal ability to excrete a water load reduces to 600 mL/h", "323"),
        quote("5% for those with a total fluid intake between 1 to 2.5 liters", "324"),
        quote("The risk of hyponatremia increases to as high as 26% for those with a total fluid intake above 2.5 liters", "324"),
        quote("If a woman's fluid balance exceeds positive 1500 ml, her risk of developing hyponatremia is high", "324"),
        quote("Avoid the administration of hypotonic IV fluids like 5% dextrose during labor", "324"),
      ],
    },
  ],
};
