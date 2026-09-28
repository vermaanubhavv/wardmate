import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * FLUID RESPONSIVENESS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapters 17, 18 and 19, which the source edition carries in full. Every number
 * below is the book's; the quotes give the PDF page it came from. The text dump drops the
 * rendered equations for the IVC indices, PPV, SVV and PVI, so those are described in words.
 */
export const fluidResponsivenessV1: FluidTopic = {
  id: "fluid_responsiveness",
  version: "1.0.0",
  title: "Fluid responsiveness: CVP, leg raise, fluid challenge and dynamic indices",
  group: "fluids",
  summary: "Will this patient's cardiac output rise with fluid? Static pressures, vena cava measurements, the provocative tests and the dynamic indices, with every threshold the book gives.",
  setting: "Adult high-dependency unit, intensive care and theatre",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: {
    chapters: ["17 Static Hemodynamic Monitoring Techniques", "18 Fluid Responsiveness: Provocative Techniques and Dynamic Parameters", "19 Cardiac Output Monitoring"],
    pages: "106–147",
  },
  sections: [
    {
      id: "whom_to_test",
      title: "Whom to test",
      intro: "Fluid raises blood volume, venous return, cardiac output and organ perfusion — but only about half of patients in shock benefit, and excess fluid worsens outcome.",
      blocks: [
        points([
          "No test is needed when hypovolaemia is evident on examination.",
          "No fluid challenge when overload is clinically obvious.",
          "Test the haemodynamically unstable patient whose fluid losses are not apparent.",
          "Dynamic variables are preferred over static ones. The provocative tests are the fluid challenge, passive leg raising and end-expiratory occlusion; the parameters are pulse pressure variation, stroke volume variation, the plethysmographic variability index and cardiac output.",
        ]),
        table(
          ["Method", "Fluid challenge", "Passive leg raising", "End-expiratory occlusion"],
          [
            ["Nature", "Non-invasive", "Non-invasive", "Invasive"],
            ["Ventilation", "Spontaneous", "Spontaneous", "Mechanical"],
            ["Technique", "Intravenous fluid loading", "Internal volume challenge", "Internal volume challenge"],
            ["Reversible", "No", "Yes", "Yes"],
            ["Parameter", "Cardiac output", "Cardiac output", "Cardiac output"],
            ["Threshold", "15% standard; 6% mini", "10%", "5%"],
            ["How to measure", "Needs a very precise technique: pulse contour analysis, echocardiography", "Direct continuous cardiac output: pulse contour analysis, echocardiography or bioreactance", "Direct continuous cardiac output: pulse contour analysis, echocardiography"],
            ["Limits", "Risk of volume overload", "High intra-abdominal pressure, head trauma, leg movement not possible", "Non-intubated patients; 15-second hold not possible"],
          ],
          "Provocative tests side by side (Table 18.1)"
        ),
        quote("Avoid fluid challenge if volume overload is obvious clinically", "121"),
      ],
    },
    {
      id: "ivc",
      title: "Inferior vena cava on echo",
      intro: "Simple, non-invasive and preferred to invasive methods for the first evaluation of shock. Transthoracic subcostal longitudinal view, measured 1 to 2 cm caudal to the junction with the right atrium.",
      blocks: [
        points([
          "Spontaneous breathing: inspiration lowers intrathoracic pressure, venous return rises and the IVC collapses; it expands in expiration. The collapsibility index (cIVC) is built from the maximal diameter at end-expiration and the minimal at end-inspiration.",
          "Positive-pressure ventilation reverses this: the IVC distends in inspiration and collapses in expiration. The distensibility index (dIVC) is built from the maximal diameter at end-inspiration, the minimal at end-expiration and the mean of the two.",
          "Prediction is better on the ventilator: controlled large tidal volumes and small PEEP give uniform swings; spontaneous breathing varies between patients and between breaths.",
          "A single maximal diameter predicts poorly and is not useful in most patients — only very low or very high values help.",
        ], "Physiology and what is measured"),
        table(
          ["Breathing", "Measurement", "Threshold", "Interpretation"],
          [
            ["Spontaneous", "End-expiratory diameter", "under 10 mm, or complete collapse", "Hypovolaemia; give fluid"],
            ["Spontaneous", "Diameter", "over 25 mm", "Hypervolaemia; fluid not appropriate"],
            ["Spontaneous", "Average", "about 18 mm with about 50% inspiratory collapse", "Normal reference"],
            ["Spontaneous", "Collapsibility index", "over 40%", "Moderate predictor of responsiveness"],
            ["Spontaneous", "Collapsibility index", "under 40%", "Does not exclude responsiveness"],
            ["Spontaneous", "Collapsibility index, very distended IVC", "under 15%", "Likely not responsive"],
            ["Spontaneous", "Respiratory variation", "absent", "Not fluid responsive"],
            ["Ventilated", "End-expiratory diameter", "under 13 mm", "Strong indicator of volume depletion"],
            ["Ventilated", "Diameter", "over 25 mm", "Excludes fluid responsiveness"],
            ["Ventilated", "Single static diameter", "any", "Does not predict status or responsiveness — often distended by positive pressure"],
            ["Ventilated", "Distensibility index", "over 18%, or diameter variability over 12%", "May predict responsiveness"],
            ["Ventilated", "Distensibility index", "under 18%", "Not responsive; benefit unlikely"],
            ["Ventilated, on TOE", "SVC collapsibility", "36%", "Separates responders from non-responders: sensitivity 90%, specificity 100%"],
          ]
        ),
        points([
          "Controlled-mode ventilation.",
          "Tidal volume 8 mL/kg or more; PEEP 5 cm H2O or less. Prediction is poor below 8 mL/kg or above 5 cm H2O.",
          "Normal intra-abdominal pressure.",
          "No acute cor pulmonale or severe right ventricular dysfunction.",
        ], "Prerequisites for the ventilated indices"),
        caution([
          "There is no valve between the vena cava and the right atrium: a high right atrial pressure expands the IVC and blunts collapse. Consider right atrial pressure, respiratory disease that changes intrathoracic swings, and intra-abdominal pressure.",
          "Evidence is conflicting in both breathing groups; the book calls it a subject of debate. Specificity is high, sensitivity low.",
        ]),
        quote("an end-expiratory IVC diameter of less than 13 mm is a strong indicator of volume depletion", "108"),
        quote("If the distensibility index is >18% or IVC diameter variability is >12%, it may predict fluid responsiveness", "109"),
        quote("collapsibility index >40%, is a moderate predictor of fluid responsiveness", "110"),
      ],
    },
    {
      id: "cvp",
      title: "Central venous pressure",
      intro: "The most used method in the ICU: the pressure in the vena cava at the right atrium, through a central line, reflecting right ventricular preload far more than left.",
      blocks: [
        points([
          "Determined by vascular volume, right ventricular compliance, pulmonary vascular resistance, thoracic, pericardial and abdominal pressures, peripheral vascular tone and posture.",
          "On a ventilator CVP rises with PEEP: roughly 5 cm H2O more PEEP raises CVP by 2.5 cm H2O.",
          "Unreliable in pulmonary vascular disease and hypertension, right ventricular disease, heart failure, valve disease, tense ascites and high intra-abdominal pressure.",
          "Evidence: CVP relates poorly to blood volume and cannot predict the response to a fluid challenge. Static CVP for volume or responsiveness is not recommended, unreliable and potentially dangerous. It stays in use because better methods are not easily available.",
        ]),
        table(
          ["CVP", "Value", "What the book does with it"],
          [
            ["Normal, electronic transducer", "2 to 6 mmHg", "Always read with the clinical state"],
            ["Normal, water manometer", "3 to 10 cm H2O", "Always read with the clinical state"],
            ["Extreme values", "under 6 to 8 mmHg; over 12 to 15 mmHg", "The values that genuinely help predict volume status"],
            ["Low", "under 6 mmHg", "An initial moderate bolus is unlikely to harm; most respond"],
            ["Target during fluid administration, when no better predictor is available", "8 to 12 mmHg", "Not a target if the patient is stable — then set the upper limit individually and keep CVP as low as perfusion allows"],
            ["Rising trend", "over 8 mmHg", "Warns that fluid replacement is no longer needed: a stopping rule against overload"],
            ["Prognostic", "over 10 mmHg", "More mortality, more acute kidney injury, worse outcome (renal venous congestion)"],
            ["High", "over 15 mmHg", "Does not respond to fluid; avoid fluid"],
          ]
        ),
        table(
          ["Low CVP", "High CVP"],
          [
            ["True hypovolaemia: blood loss, fluid loss, fluid shift", "Volume overload"],
            ["Relative hypovolaemia from vasodilatation: spinal anaesthesia, septicaemia, anaphylaxis", "Cardiac: heart failure, tamponade, constrictive pericarditis, tricuspid regurgitation"],
            ["", "Pulmonary: embolism, pulmonary hypertension, tension pneumothorax, COPD, cor pulmonale, positive-pressure ventilation"],
          ],
          "Causes"
        ),
        caution([
          "A normal CVP does not exclude volume depletion. A single value does not help; the trend and the extremes do.",
        ]),
        quote("The normal value of CVP is 2 to 6 mmHg", "110"),
        quote("roughly 5 cmH2O increase in PEEP will cause a 2.5 cmH2O increase in CVP", "110"),
        quote("a reasonable CVP target is 8–12 mmHg", "111"),
        quote("Patients with high CVP values (greater than 15 mmHg) do not respond to fluid administration", "112"),
      ],
    },
    {
      id: "arterial_line_and_svo2",
      title: "Arterial line, pulmonary artery catheter and SvO2",
      blocks: [
        points([
          "Arterial cannulation gives beat-to-beat pressure, frequent gases, and the waveform from which PPV and SVV and the response to a fluid challenge or leg raise are read.",
          "Radial first: superficial, ulnar collateral, compressible, few complications. Do the modified Allen test before cannulating. Its lumen is under 3 mm; on high vasopressor doses or severe vasoconstriction the radial pressure reads low and underestimates central pressure.",
          "Femoral: easiest and fastest in shock, palpable when peripheral pulses are not, accurate on high vasopressors and in hypothermia, fewer failures — but more infection, less mobility and a retroperitoneal haematoma that is hard to control and slow to diagnose.",
          "The pulmonary artery catheter, once the gold standard for cardiac output, is now used sparingly: it did not improve survival, its cardiac output readings are often inaccurate in the critically ill, and a static wedge pressure does not predict fluid responsiveness. It remains the only device that continuously monitors right ventricular function; the book keeps it for unexplained or multifactorial shock, right ventricular failure with pulmonary hypertension, and tamponade or constriction when echo is inconclusive.",
        ]),
        table(
          ["Mixed venous saturation (SvO2, from the pulmonary artery)", "Meaning"],
          [
            ["60 to 80%", "Normal"],
            ["under 65%", "Poor prognosis"],
            ["under 60%", "Serious risk of tissue hypoxia; urgent correction"],
          ],
          undefined,
          "Low SvO2: low cardiac output, anaemia, hypoxaemia, or raised oxygen demand (sepsis, hyperthermia, burns, seizures, shivering)."
        ),
        caution([
          "Never give drugs through an arterial line — serious tissue damage.",
          "Avoid magnetic resonance imaging and electrocautery with a pulmonary artery catheter in place.",
        ]),
        quote("The normal value of SvO2 is 60–80%, and SvO2 less than 65% is of poor prognostic value", "116"),
        quote("Avoid using arterial lines to administer medication, as it can lead to serious tissue damage", "113"),
      ],
    },
    {
      id: "fluid_challenge",
      title: "Fluid challenge and mini-fluid challenge",
      intro: "A small volume given quickly to see whether the left ventricle raises its stroke volume. Usually done for hypotension and oliguria; balanced crystalloid preferred, though the fluid type does not change the proportion of responders.",
      blocks: [
        table(
          ["Challenge", "Volume", "Time", "Positive response"],
          [
            ["Standard", "500 mL crystalloid", "20 to 30 minutes", "Stroke volume up 10 to 15%, cardiac index up 15% or more"],
            ["Standard, alternative", "200 to 250 mL", "5 to 10 minutes", "As above"],
            ["Mini", "100 mL crystalloid", "1 minute", "Assessed by TTE velocity–time integral, pulse-contour cardiac output or change in SVV; Table 18.1 gives 6%"],
            ["Mini, weight-based", "4 mL/kg balanced crystalloid", "5 minutes", "As above"],
          ]
        ),
        steps([
          "Heart rate, blood pressure, clinical signs, CVP and wedge pressure cannot judge the response — measure a dynamic parameter (PPV, stroke volume, SVV, cardiac index) with a cardiac output monitor; valid in spontaneous breathers too.",
          "The maximal effect on cardiac output comes about one minute after the challenge ends: measure promptly.",
          "Give further fluid only to responders.",
        ]),
        caution([
          "300 to 500 mL is more a treatment than a test; repeated boluses overload, which is probably more harmful than hypovolaemia: pulmonary and bowel-wall oedema, glycocalyx damage, tissue hypoxia, acute kidney injury, slower ARDS recovery, higher mortality.",
          "In leaky capillaries 95% of infused fluid has left the vessels within 90 minutes, so the gain is short-lived.",
          "The mini challenge produces small, brief changes: it needs a very sensitive and precise technique.",
        ]),
        quote("Usually, 500 mL crystalloid is administered over 20–30 minutes (or 200–250 mL is administered over 5–10 minutes)", "122"),
        quote("100 ml of the crystalloid bolus is infused rapidly over one minute", "123"),
        quote("95% of the infused fluid shifts to interstitial space within 90 minutes", "123"),
      ],
    },
    {
      id: "passive_leg_raise",
      title: "Passive leg raising",
      intro: "Shifts about 300 mL of venous blood from the legs into the thorax: a reversible internal fluid challenge with no fluid given, valid in spontaneous breathing, on the ventilator, with low lung compliance and in arrhythmia.",
      blocks: [
        steps([
          "Start 45 degrees head-up, semi-recumbent — not supine — for 3 minutes and record baseline haemodynamics.",
          "Lower the trunk and head to horizontal and raise the legs to 45 degrees by moving the bed, not by hand. Hold for one minute and reassess at once.",
          "The effect is transient: take the second set of values within the first 90 seconds of leg elevation.",
          "Positive test: cardiac output or stroke volume (or pulse pressure) rises by 10% or more — predicts fluid responsiveness. A smaller rise predicts a poor response.",
          "Measure cardiac output directly: pulse contour analysis, transthoracic echo, oesophageal Doppler, bioreactance or volume-clamp contour analysis. Systolic pressure from an oscillometric cuff is neither sensitive nor specific.",
        ]),
        points([
          "A negative test is the clue to stop fluid and reach for vasopressors instead.",
          "During renal replacement therapy a positive test predicts hypotension before fluid removal.",
        ]),
        caution([
          "Not useful with raised intra-abdominal pressure (false negative). Not feasible under anaesthesia or in the agitated. Avoid in neurotrauma (raises intracranial pressure), in those needing immobilisation (hip or lower-limb fracture), and with compression stockings.",
        ]),
        quote("Positive PLR test is defined as a 10% or more increase in cardiac output/ stroke volume or pulse pressure", "124"),
        quote("obtain the subsequent hemodynamic values fast within the first 90 seconds following leg elevation", "124"),
      ],
    },
    {
      id: "end_expiratory_occlusion",
      title: "End-expiratory occlusion",
      intro: "Ventilated patients only. Holding the ventilator at end-expiration prolongs the low intrathoracic pressure, venous return increases, and cardiac output rises only in responders.",
      blocks: [
        steps([
          "Interrupt the ventilator for 15 seconds at end-expiration and measure cardiac output — pulse contour analysis is standard; echo is also supported.",
          "A rise of more than 5% predicts fluid responsiveness with high accuracy.",
          "Adding a 15-second end-inspiratory hold enlarges the change in responders: the threshold becomes 13% and echo assessment becomes feasible.",
        ]),
        points([
          "Reliable in arrhythmia, ARDS, low compliance and low tidal volume. Preferred in the operating theatre; none of the leg-raise constraints apply.",
          "Needs a patient who tolerates 15 seconds without a spontaneous breath.",
        ]),
        quote("A more than 5% increase in cardiac output predicts fluid responsiveness with a high degree of accuracy", "125"),
      ],
    },
    {
      id: "dynamic_indices",
      title: "PPV, SVV and PVI",
      intro: "Heart–lung interaction read from the arterial waveform or the oximeter trace. Better than CVP or wedge pressure at predicting responsiveness; many bedside monitors compute them automatically.",
      blocks: [
        points([
          "Pulse pressure is systolic minus diastolic and varies with respiration. PPV is computed from the maximum, minimum and mean pulse pressure across a respiratory cycle, taken from an arterial catheter and averaged over three or more breaths. PPV predicts better than SVV.",
          "SVV is the percentage change between the maximal and minimal stroke volume averaged over several respiratory cycles; from an arterial catheter, oesophageal Doppler, bioimpedance or bioreactance.",
          "PVI is derived automatically by the pulse oximeter from the variation of the perfusion index between inspiration and expiration. Reasonably reliable perioperatively and in ventilated critical patients; PVI-guided goal-directed therapy improves major-surgery outcomes, though a recent meta-analysis found its reliability limited.",
        ]),
        table(
          ["Index", "Value", "Interpretation"],
          [
            ["PPV", "over 13%", "Strongly associated with volume responsiveness"],
            ["PPV", "9 to 13%", "Grey zone: no definite fluid strategy. With tidal volume 8 mL/kg or more, a transient rise to 12 mL/kg (augmented PPV) gives excellent predictability"],
            ["PPV", "under 9%", "Unresponsive; avoid fluid"],
            ["PPV after tidal volume challenge", "absolute rise of 3.5% or more", "Responsive, with excellent accuracy"],
            ["SVV", "over 10%", "Fluid responsive"],
            ["PVI", "over 14%", "Preload dependence; fluid responsive"],
          ]
        ),
        steps([
          "On low tidal volume ventilation PPV can be low even in a responder.",
          "Raise the tidal volume from 6 to 8 mL/kg for 1 minute and record the absolute change in PPV.",
          "A rise of 3.5% or more predicts fluid responsiveness.",
        ], "Tidal volume challenge"),
        caution([
          "PPV is valid only when the patient is intubated on volume-cycled ventilation with no spontaneous effort, tidal volume over 8 mL/kg and no arrhythmia. Its accuracy with raised intra-abdominal pressure is uncertain.",
          "PPV and SVV are unreliable with spontaneous breathing, tidal volume under 8 mL/kg, arrhythmia, right ventricular dysfunction and low lung compliance — the usual ICU conditions, which is why they serve surgery better.",
          "PVI is less reliable in spontaneously breathing children, arrhythmia, probe malposition, movement and on noradrenaline, which damps the plethysmographic signal.",
        ]),
        quote("PPV >13% is strongly associated with volume responsiveness", "126"),
        quote("If PPV is low (<9), it suggests fluid unresponsiveness, and administration of fluids should be avoided", "126"),
        quote("tidal volume is increased from 6 to 8 mL/kg for 1 minute, and the resultant absolute changes in PPV are measured", "126"),
        quote("SVV greater than 10% is associated with fluid responsiveness", "127"),
        quote("a PVI value >14% predicts preload dependence and is suggestive of fluid responsiveness", "127"),
      ],
    },
    {
      id: "cardiac_output_devices",
      title: "Cardiac output monitors",
      intro: "Classified by invasiveness, technology and calibration. Calibrated devices remove bias against a known standard and are preferred in severe shock; uncalibrated ones use built-in correction factors, need no calibration and suit stable patients for short periods such as surgery.",
      blocks: [
        table(
          ["Method", "Calibration", "Devices", "Limits the book names"],
          [
            ["Transthoracic echo (non-invasive)", "Calibrated", "Ultrasound, echo", "Operator dependent; probe position; unreliable with high output, light sedation, structural change; intermittent only"],
            ["Bioimpedance or bioreactance (non-invasive)", "Uncalibrated", "BioZ Dx, ECOM, NICOM (Cheetah)", "Poor for absolute values in surgical and critical patients — trend only; percentage error 42%; interference, arrhythmia, effusion, oedema, chest tubes, pacemakers, movement"],
            ["Radial applanation tonometry (non-invasive)", "Uncalibrated", "T-line", "Not suitable in the unstable critically ill"],
            ["Volume clamp, finger cuff (non-invasive)", "Uncalibrated", "CNAP, ClearSight/Nexfin", "Poor accuracy in obesity, cardiac surgery and ICU; not with gross peripheral oedema or severe vasoconstriction"],
            ["Ultrasound cardiac output (non-invasive)", "Uncalibrated", "USCOM", "—"],
            ["Plethysmographic variability index (non-invasive)", "Uncalibrated", "MASSIMO", "See the PVI cautions above"],
            ["Transoesophageal echo or Doppler (minimally invasive)", "Calibrated", "CardioQ, WAKI TO", "Needs intubation and sedation; probe displacement; non-continuous; one patient at a time; no blood pressure; contraindicated with oesophageal surgery, varices, stricture, tumour, fistula, coagulopathy, upper GI bleed"],
            ["Transpulmonary thermodilution (minimally invasive)", "Calibrated", "PiCCO, VolumeView, EV1000", "Central plus large arterial line; no PA pressure or SvO2; manual cold-water calibration; inaccurate below 2 L/min; misses the short changes of leg raise and occlusion tests"],
            ["Lithium dilution (minimally invasive)", "Calibrated", "LiDCO, LiDCO Plus, PulseCO", "Not in pregnancy, weight under 40 kg, lithium therapy or high-dose non-depolarising blockers"],
            ["Arterial pulse contour analysis (minimally invasive)", "Calibrated: PiCCO Plus, LiDCO Plus. Uncalibrated: FloTrac/Vigileo, LiDCO rapid, PRAM/MostCare, ProAQT/PulsioFlex", "As listed", "Less accurate with low SVR (sepsis, chronic liver failure), LV dysfunction, noradrenaline, open aneurysm repair, off-pump bypass; low accuracy with spontaneous breathing, arrhythmia, low tidal volume, abnormal abdominal pressure; uncalibrated systems need frequent recalibration when unstable"],
            ["Partial CO2 rebreathing (minimally invasive)", "Uncalibrated", "NiCO", "Only intubated, sedated, volume-controlled, stable patients; poor with anaemia and lung disease; no volume information; avoid in severe hypercapnia, raised intracranial pressure, pulmonary hypertension"],
            ["Pulmonary artery thermodilution (invasive)", "Calibrated", "Swan-Ganz catheter", "Invasive complications; slow to catch abrupt change; errors with low output, hypothermia, shunts, valve disease; poor predictor of responsiveness; no MRI or electrocautery"],
          ],
          "Haemodynamic monitoring systems (Table 19.1) with each device's stated limits"
        ),
        points([
          "Transpulmonary thermodilution is the book's new gold standard: a cold bolus into the SVC through an internal jugular or subclavian line, read by a thermistor-tipped femoral, axillary or brachial arterial catheter; it also calibrates continuous pulse contour analysis and yields global end-diastolic volume, extravascular lung water and pulmonary vascular permeability. Kept for complex or prolonged major surgery, major liver surgery and severe shock, especially ARDS with rising vasopressor needs.",
          "Transoesophageal Doppler: probe like a nasogastric tube to the descending thoracic aorta at the fifth to sixth intercostal space, roughly the 35 to 45 cm mark.",
        ]),
        quote("percentage errors were 42% for bioimpedance and bioreactance", "136"),
        quote("It provides inaccurate measurements in patients with very low cardiac output (<2 L/min)", "140"),
        quote("Avoid this technique during pregnancy and in patients weighing less than 40 kg", "140"),
      ],
    },
    {
      id: "tte_cardiac_output",
      title: "Cardiac output by transthoracic echo",
      intro: "Now a routine bedside standard, comparable to pulmonary artery thermodilution. Even non-cardiologist ICU physicians learn it quickly.",
      blocks: [
        formula(
          "Cardiac output from the left ventricular outflow tract",
          "CO = SV × HR; SV = LVOT VTI × LVOT CSA",
          [
            { symbol: "CO", meaning: "cardiac output" },
            { symbol: "SV", meaning: "stroke volume" },
            { symbol: "HR", meaning: "heart rate" },
            { symbol: "LVOT VTI", meaning: "velocity–time integral at the left ventricular outflow tract, pulsed-wave Doppler in the apical five-chamber view" },
            { symbol: "LVOT CSA", meaning: "cross-sectional area of the outflow tract, the area of a circle from the LVOT diameter measured in systole in the parasternal long-axis view" },
          ],
          { note: "Average three measurements in sinus rhythm and five in atrial fibrillation. The text prints no units." }
        ),
        points([
          "Signs of hypovolaemia on TTE: a small, hyperdynamic left ventricle with end-diastolic area under 10 cm2 in the parasternal short axis, or papillary apposition (kissing ventricles). Both predict fluid responsiveness; apposition is falsely positive in LV hypertrophy, vasodilatation and high inotrope doses.",
          "The same study gives IVC size and variation, LV size, wall motion and both ventricles' function.",
        ]),
        quote("averaging three measurements within one TTE examination is recommended in patients with sinus rhythm", "134"),
        quote("left ventricular end-diastolic area in the parasternal short axis view <10 cm2", "135"),
      ],
    },
    {
      id: "pa_thermodilution",
      title: "Pulmonary artery thermodilution",
      intro: "The traditional gold standard, through a Swan-Ganz catheter.",
      blocks: [
        steps([
          "Bolus technique: inject about 10 mL of cold saline through the proximal lumen in the right atrium.",
          "The thermistor at the pulmonary artery tip records the transient fall in blood temperature; the monitor computes cardiac output by the modified Stewart–Hamilton equation — the fall is inversely proportional to flow.",
          "Perform three measurements and average them.",
        ]),
        points([
          "Advantages: a non-toxic thermal indicator, repeatable when fluid is allowed, no manual calibration, and pulmonary artery pressures, right and left filling pressures and SvO2 alongside.",
          "Continuous variant: a thermal filament at right ventricular level warms blood in a semi-random pattern, giving a continuous display without repeated boluses, less infection and fewer operator errors.",
        ]),
        caution([
          "Errors with low cardiac output, hypothermia, shunts and valve disease; slow to detect abrupt change; a poor predictor of fluid responsiveness.",
          "Avoid magnetic resonance imaging and electrocautery with the catheter in place.",
        ]),
        quote("about 10 ml of cold saline solution is injected via the proximal lumen of PAC in the right atrium", "142"),
      ],
    },
  ],
};
