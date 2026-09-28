import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * ASSESSING VOLUME STATUS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapters 15 and 16, which the source edition carries in full. Every number below
 * is the book's; the quotes give the PDF page it came from.
 */
export const volumeAssessmentV1: FluidTopic = {
  id: "volume_assessment",
  version: "1.0.0",
  title: "Assessing volume status at the bedside",
  group: "fluids",
  summary: "History, examination, fluid balance, lactate and the non-invasive monitors: what each one tells a resident about hypovolaemia and overload, and what it cannot.",
  setting: "Adult ward, emergency department and high-dependency unit",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["15 Fluid Assessment and Monitoring", "16 Basic and Non-Invasive Hemodynamic Monitoring"], pages: "94–105" },
  sections: [
    {
      id: "principles",
      title: "No single parameter",
      intro: "Both too little and too much fluid harm. Assessment rests on history, examination, haemodynamic monitoring and laboratory tests together, and is repeated after every resuscitation.",
      blocks: [
        points([
          "Fluid intake: volume and type, oral, nasogastric and intravenous.",
          "Abnormal losses: diarrhoea, vomiting, drains, high fever, insensible losses.",
          "Urine volume.",
          "Symptoms of hypovolaemia: increased thirst, oliguria, fatigue, weakness, dizziness on standing.",
          "Symptoms of hypervolaemia: swelling, weight gain, breathlessness worse on exertion or lying flat.",
          "Coexisting illness: diabetes, hypertension, ischaemic heart disease, heart failure, kidney failure, cirrhosis, hypoproteinaemia, malnutrition.",
          "Medication: antihypertensives, diuretics, laxatives.",
        ], "History to elicit"),
        caution([
          "Clinical examination predicts the severity of volume depletion poorly; signs do not always match the deficit. In severe depletion or shock, history plus a prompt examination is still enough to start treatment.",
        ]),
        quote("There is no single parameter that alone can precisely assess the hydration status", "94"),
      ],
    },
    {
      id: "hypovolaemia_grading",
      title: "Grading hypovolaemia by ECF loss",
      blocks: [
        table(
          ["Grade", "ECF reduction", "Signs (each grade adds to the one before)"],
          [
            ["Mild", "under 5%", "Diminished skin turgor; concentrated urine; loss of weight."],
            ["Moderate", "5 to 10%", "Oliguria under 400 mL/day; orthostatic tachycardia and hypotension (fall of 20 mm Hg or more systolic, or 10 mm Hg diastolic)."],
            ["Severe", "over 10%", "Hypotension; low pulse volume, tachycardia, tachypnoea; cold extremities, dry tongue, sunken eyeballs; capillary refill over 2 seconds and doughy skin turgor; abnormal mental status and confusion."],
          ]
        ),
        quote("Prolonged capillary refill time (>2 seconds), and reduced skin turgor (doughy feel)", "95"),
        quote("Orthostatic tachycardia and hypotension (fall of ≥20 mm Hg systolic blood pressure or 10 mm Hg diastolic blood pressure)", "95"),
      ],
    },
    {
      id: "dehydration_vs_hypovolaemia",
      title: "Dehydration is not hypovolaemia",
      intro: "The book treats them as fundamentally different disorders with different pathogenesis, features and management.",
      blocks: [
        table(
          ["Feature", "Dehydration", "Hypovolaemia"],
          [
            ["What is lost", "Pure water", "Salt and water together"],
            ["Compartment", "Intracellular volume contraction; hypertonicity", "Extracellular fluid deficit; contracted blood volume"],
            ["Blood pressure", "Normal; no orthostatic hypotension", "Orthostatic hypotension"],
            ["Heart rate", "Not a feature", "Tachycardia"],
            ["Skin turgor", "Not a feature", "Decreased"],
            ["Serum sodium", "High", "Normal or low"],
          ]
        ),
        quote("dehydration refers to pure water loss producing hypertonicity and intracellular volume contraction", "95"),
      ],
    },
    {
      id: "overload_signs",
      title: "Signs of overload",
      blocks: [
        points([
          "Peripheral oedema, sacral oedema in the bedridden, recent weight gain.",
          "Distended jugular vein.",
          "Third spacing: ascites, pleural fluid.",
          "Tachycardia, tachypnoea, orthopnoea.",
          "Basal crepitations and a third heart sound.",
        ], "At the bedside"),
        points([
          "Cardiomegaly, septal Kerley B-lines, congested vascular hilum, bilateral perihilar alveolar infiltrates in a butterfly distribution, pleural effusion.",
          "Not a sensitive or specific test for any of these; a first step that gives clues. Also used to check a central line tip and exclude an iatrogenic pneumothorax.",
        ], "On the chest X-ray"),
      ],
    },
    {
      id: "fluid_balance",
      title: "Intake, output and weight",
      blocks: [
        steps([
          "Intake–output chart: everything given, enteral and parenteral, against everything lost — urine, diarrhoea, vomit, drains and tubes, insensible losses.",
          "Hourly urine output in every haemodynamically unstable patient. It reflects tissue perfusion and hydration when there is no glycosuria, osmotic diuresis or diuretic. Aim for about 0.5 mL/kg/h or more.",
          "Daily weight: gain means fluid excess, loss means deficit. Its limitation is the patient too sick to weigh.",
        ]),
        caution(["Urine output misleads with glycosuria, osmotic diuresis or diuretic therapy."]),
        quote("Fluid therapy aims to achieve a urine output of approximately 0.5 mL/kg/h or more", "96"),
      ],
    },
    {
      id: "blood_pressure",
      title: "Blood pressure, postural drop and MAP",
      blocks: [
        points([
          "In mild hypovolaemia compensation holds the blood pressure up: a normal reading does not exclude hypovolaemia.",
          "Postural hypotension is a fall of at least 20 mm Hg systolic or 10 mm Hg diastolic within 3 minutes of standing. A strong sign of hypovolaemia once drugs and autonomic neuropathy are excluded.",
          "Mean arterial pressure judges perfusion better than systolic or diastolic alone. At least 60 mm Hg is needed to perfuse the vital organs; the Surviving Sepsis Campaign sets an initial target of 65 mm Hg in septic shock on vasopressors.",
        ]),
        formula(
          "Mean arterial pressure",
          "MAP = [SBP + (2 × DBP)] / 3",
          [
            { symbol: "MAP", meaning: "mean arterial pressure", unit: "mm Hg" },
            { symbol: "SBP", meaning: "systolic blood pressure", unit: "mm Hg" },
            { symbol: "DBP", meaning: "diastolic blood pressure", unit: "mm Hg" },
          ],
          { note: "At least 60 mm Hg for vital-organ perfusion; 65 mm Hg initial target in septic shock needing vasopressors.", calc: "map" }
        ),
        quote("MAP of at least 60 mm Hg is necessary to maintain the adequate perfusion of vital organs", "101"),
        quote("a fall of at least 20 mm Hg systolic blood pressure or 10 mm Hg diastolic blood pressure within 3 minutes of standing", "100"),
      ],
    },
    {
      id: "pulse_oximetry",
      title: "Pulse oximetry: the SpO2 to PaO2 ladder",
      intro: "The fifth vital sign. Cyanosis is a late sign of hypoxaemia; the oximeter finds it first.",
      blocks: [
        table(
          ["SpO2", "PaO2", "Meaning"],
          [
            ["96 to 100%", "80 to 100 mm Hg", "Normal"],
            ["under 90%", "60 mm Hg or less", "Significant hypoxaemia; below 90% the PaO2 falls very rapidly"],
            ["90 falling to 80%", "60 to 45 mm Hg", "Steep part of the curve"],
            ["under 80%", "about 40 mm Hg or less", "Life-threatening hypoxaemia"],
            ["under 70%", "—", "Oximeter reading unreliable"],
          ]
        ),
        caution([
          "Readings suffer with cold extremities, hypotension, poor circulation, movement, nail polish, abnormal haemoglobins and severe anaemia.",
          "Intravenous dyes such as methylene blue give a low SpO2 with a normal PaO2 on the gas — the oxygen saturation gap.",
        ]),
        quote("Less than 90% SpO2 correlates to a PaO2 of 60 mm Hg or less, which suggests significant hypoxemia", "101"),
      ],
    },
    {
      id: "ecg_and_echo",
      title: "ECG and echocardiography",
      blocks: [
        points([
          "Continuous ECG in every unstable patient: rate, rhythm, ischaemia, electrolyte effects.",
          "Leads II and V1 are most sensitive for P waves and arrhythmia; leads II, V2 and V5 for myocardial ischaemia.",
        ], "ECG"),
        points([
          "Safe, simple and preferred for the first look at an unstable patient: separates the types of shock; assesses RV and LV function, septal movement, pericardial effusion and tamponade, valve lesions, thrombus, embolism.",
          "Volume status and fluid responsiveness from vena cava size and its response to respiration, a fluid challenge or leg raising — detail in the fluid-responsiveness topic.",
          "Transthoracic first in hypotension: available, non-invasive, quick. Transoesophageal gives better images but usually needs intubation and is kept for selected cases: cardiac surgery, laparotomy, a poor chest window (chest wall injury, obesity).",
          "General ultrasound finds hidden blood loss (chest, abdomen, retroperitoneum, bladder, limb haematoma) and a source of sepsis.",
        ], "Echocardiography and ultrasound"),
        quote("Lead II and V1 are the most sensitive for detecting P waves and cardiac arrhythmias", "101"),
      ],
    },
    {
      id: "lung_ultrasound",
      title: "Lung ultrasound and B-lines",
      intro: "Detects extravascular lung water before clinical signs appear, so the book makes it the first-line test for pulmonary congestion during fluid therapy.",
      blocks: [
        table(
          ["Finding", "Threshold", "Meaning"],
          [
            ["B-line score (sum of all B-lines)", "under 5", "Normal"],
            ["B-line score", "over 15", "Moderate or severe pulmonary congestion"],
            ["B-lines in one view", "more than three", "Reliable clue for pulmonary oedema"],
            ["B-lines newly appearing", "any", "Early congestion — stop the fluid"],
          ],
          "B-lines (ultrasound lung comets)",
          "B-lines are pathological and absent in the euvolaemic, dry lung."
        ),
        table(
          ["Condition", "Sensitivity", "Specificity"],
          [
            ["Pneumonia", "94%", "96%"],
            ["Pneumothorax", "91%", "98%"],
          ],
          "Diagnostic accuracy quoted in the text"
        ),
        quote("The normal value of BLS is <5, and >15 BLS reflects moderate/ severe pulmonary congestion", "103"),
        quote("The new appearance of B-lines is an early sign of pulmonary congestion and guides clinicians to discontinue fluid administration", "103"),
      ],
    },
    {
      id: "lactate",
      title: "Serum lactate",
      intro: "The most useful laboratory parameter for monitoring the critically ill; a high level tracks the severity of sepsis.",
      blocks: [
        points([
          "Diagnosis: part of the severe sepsis and septic shock definitions.",
          "Prognosis on arrival: a raised prehospital or emergency-department lactate predicts mortality even with normal vital signs, and finds occult shock.",
          "Resuscitation: a component of the Surviving Sepsis bundle; trends guide therapy and serial values predict mortality.",
          "Repeat every 6 hours until normal. Lactate-guided therapy lowers hospital mortality.",
          "Normalisation within 6 hours of initial resuscitation strongly predicts survival; even normalisation within 24 hours independently predicts lower mortality. Persistent hyperlactataemia is a strong adverse sign.",
        ]),
        caution([
          "A raised lactate is multifactorial and non-specific: impaired oxygenation, beta-2 adrenergic stimulation, adrenaline and beta-2 agonists, liver failure, thiamine deficiency and more. The book calls equating lactate with tissue hypoxia a misconception. Read it in context.",
        ]),
        quote("serum lactate level is generally remeasured every 6 hours until it becomes normal", "98"),
        quote("Increased serum lactate level reflects tissue hypoxia is a misconception", "97"),
      ],
    },
    {
      id: "choosing_monitoring",
      title: "Choosing how much monitoring",
      blocks: [
        points([
          "Fewer than half of haemodynamically unstable critical patients are fluid responders; in the rest fluid may harm. Evaluate before giving it.",
          "No single technique suffices. Less invasive is safer and preferred for the initial look; invasive is more predictive and kept for the critical, unstable patient not responding to first-line therapy.",
          "Stable, non-critical: continuous ECG, frequent non-invasive blood pressure, pulse oximetry.",
          "Unstable, critical: arterial pulse contour analysis, transoesophageal echo, transpulmonary thermodilution for continuous monitoring.",
          "Dynamic parameters (pulse pressure variation, stroke volume variation, cardiac output) beat static ones (CVP, pulmonary artery catheter) for predicting fluid responsiveness — but are not routine in shock that answers initial treatment; they are for the complex high-risk patient who does not.",
        ]),
        table(
          ["Group", "Techniques"],
          [
            ["Basic and non-invasive", "Non-invasive BP, pulse oximetry, continuous ECG, ultrasound, echocardiography, chest X-ray"],
            ["Static", "IVC assessment, CVP, arterial cannulation, pulmonary artery catheter"],
            ["Dynamic: provocative tests", "Fluid challenge, passive leg raising, end-expiratory occlusion"],
            ["Dynamic: parameters", "Pulse pressure variation, stroke volume variation, cardiac output, plethysmographic variability index"],
            ["Cardiac output: non-invasive", "Transthoracic echo, bioimpedance or bioreactance, radial applanation tonometry, volume clamp, USCOM, PVI"],
            ["Cardiac output: minimally invasive", "Transoesophageal echo, transpulmonary thermodilution, lithium dilution, arterial pulse contour analysis, partial CO2 rebreathing"],
            ["Cardiac output: invasive", "Pulmonary artery thermodilution, bolus or continuous"],
          ],
          "Techniques and parameters for haemodynamic monitoring (Table 15.2)"
        ),
        quote("Less than 50% of hemodynamically unstable critical patients are ‘fluid responders’", "96"),
      ],
    },
  ],
};
