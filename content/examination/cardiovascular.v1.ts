import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, ebem, HUTCHISONS, MACLEODS, rce } from "@/content/history-trees/_helpers";

/**
 * CARDIOVASCULAR SYSTEM EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * The long-case order taught in Indian medical colleges: peripheral signs, pulse, blood
 * pressure, jugular venous pressure, then the precordium by inspection, palpation and
 * auscultation, and finally the back and abdomen for the consequences of a failing pump.
 * Rheumatic valve disease remains common here, so the murmur items carry more weight than
 * the Anglo-American textbooks give them.
 *
 * Each item says how to elicit the sign and what it is associated with. Nothing names a
 * treatment, and nothing tells the reader what the patient has.
 */
const item = (
  id: string,
  label: string,
  how: string,
  significance: string,
  extra: Partial<Pick<ExamItem, "normal" | "tier">> = {}
): ExamItem => ({ id, label, how, significance, ...extra });

const d = { tier: "detailed" as const };

export const cardiovascularV1: ExamChecklist = {
  id: "cardiovascular",
  version: "1.0.0",
  title: "Cardiovascular system examination",
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient have abnormal central venous pressure?", 1996, "8594245"),
    rce("Does this patient have aortic regurgitation?", 1999, "10376577"),
    rce("Is this patient hypovolemic?", 1999, "10086438"),
    ebem("Does this patient have congestive heart failure?", 2008, "18175378"),
    MACLEODS,
    HUTCHISONS,
    BATES,
  ],
  sections: [
    {
      id: "position_general",
      title: "Position and peripheral signs",
      intro: "Position the patient at 45 degrees, chest and neck exposed, in good light, and examine from the right. Look at the hands, face and neck before the chest — the peripheral signs often name the problem before the stethoscope does.",
      items: [
        item("general_look", "General look and respiratory effort", "From the foot of the bed note whether the patient is comfortable, breathless at rest, propped up on pillows, or unable to lie flat. Count the respiratory rate while appearing to feel the pulse.", "Breathlessness at rest and an inability to lie flat are seen in pulmonary congestion; a patient sitting forward and still may be guarding against pericardial or pleuritic pain.", { normal: "Comfortable at rest, lying flat without distress." }),
        item("cyanosis", "Cyanosis", "Look at the tongue and buccal mucosa for central cyanosis in good natural light, and at the nail beds, nose tip and ear lobes for peripheral cyanosis. Warm the hands before calling peripheral cyanosis.", "Central cyanosis is seen with right-to-left shunts and severe lung disease; peripheral cyanosis alone is seen with a low cardiac output, cold, or local arterial disease.", { normal: "No central or peripheral cyanosis." }),
        item("clubbing", "Clubbing", "Look at the nail bed from the side for loss of the normal angle, feel for fluctuation of the nail bed, and place opposing fingers back to back looking for loss of the diamond-shaped window. Grade from fluctuation through loss of angle to drumstick appearance.", "In a cardiac context, clubbing is seen with infective endocarditis and with cyanotic congenital heart disease; the profile angle and phalangeal depth ratio are the reproducible measures.", { normal: "No clubbing." }),
        item("peripheral_stigmata", "Splinter haemorrhages, Osler nodes, Janeway lesions", "Inspect the nail beds for linear splinter haemorrhages, the finger pulps for tender nodules, and the palms and soles for non-tender flat red macules.", "These peripheral signs are seen in infective endocarditis, though all are uncommon and their absence does not exclude it.", d),
        item("pallor", "Pallor", "Pull down the lower eyelid and look at the palpebral conjunctiva, the tongue and the palmar creases.", "Pallor is seen with anaemia, which both mimics and worsens cardiac symptoms, and which produces a flow murmur of its own.", { normal: "No pallor." }),
        item("oedema", "Dependent oedema", "Press firmly with the thumb for at least fifteen seconds over the medial malleolus, the dorsum of the foot, and up the shin. In a bed-bound patient also press over the sacrum. Note the level to which it extends and whether it pits.", "Pitting oedema rising up the legs is seen with right-sided cardiac failure, and also with low albumin, renal disease and venous obstruction, so the finding is never read alone.", { normal: "No pedal or sacral oedema." }),
      ],
    },
    {
      id: "pulse",
      title: "Arterial pulse",
      intro: "Examine the radial pulse first for rate and rhythm, then a large central artery (carotid or brachial) for character and volume — character cannot be judged reliably at the wrist.",
      items: [
        item("rate", "Rate", "Count the radial pulse for a full sixty seconds. If the rhythm is irregular, count the apical rate by auscultation at the same time as the radial pulse.", "A rate that is fast is seen with fever, anaemia, thyroid excess, pain, hypovolaemia and arrhythmia; a slow rate with conduction block, drug effect and raised intracranial pressure.", { normal: "Pulse 72 per minute." }),
        item("rhythm", "Rhythm and pulse deficit", "Decide whether the rhythm is regular, regularly irregular, or irregularly irregular. When irregular, have one examiner count the apex while another counts the radial pulse over the same minute, and record the difference.", "An irregularly irregular pulse with a pulse deficit is seen in atrial fibrillation; the deficit reflects beats too weak to reach the wrist.", { normal: "Regular rhythm, no pulse deficit." }),
        item("character", "Character", "Feel the brachial or carotid artery. Note how quickly the pulse rises and falls: slow-rising and sustained, sharp and collapsing, or double-peaked. For a collapsing pulse, check for shoulder pain first, then raise the arm above the head while the flat of your hand rests across the radial pulse.", "A slow-rising sustained pulse is associated with aortic stenosis; a collapsing pulse with aortic regurgitation and with high-output states; the early diastolic murmur remains the more useful finding for regurgitation.", { normal: "Normal character and volume." }),
        item("volume", "Volume", "Judge the displacement of the arterial wall under the fingers, comparing with your own.", "A low volume pulse is seen with reduced stroke volume, hypovolaemia and shock; a high volume pulse with anaemia, fever, thyroid excess and arteriovenous shunting.", d),
        item("radioradial_radiofemoral", "Radio-radial and radio-femoral delay", "Palpate both radial pulses simultaneously, then the radial and femoral pulses on the same side together.", "Radio-radial delay or inequality is associated with subclavian obstruction and aortic dissection; radio-femoral delay with coarctation of the aorta, which is a reversible cause of hypertension in the young.", { normal: "No radio-radial or radio-femoral delay." }),
        item("peripheral_pulses", "All peripheral pulses", "Palpate brachial, carotid (one at a time, never both together), femoral, popliteal, posterior tibial and dorsalis pedis on both sides, and record each as present, feeble or absent.", "Absent or feeble peripheral pulses are seen with peripheral arterial disease, embolism and dissection, and their distribution localises the level of obstruction.", { normal: "All peripheral pulses palpable and equal." }),
        item("pulsus_paradoxus", "Pulsus paradoxus", "Inflate the cuff above systolic, then deflate slowly, noting the pressure at which sounds are first heard only in expiration and then the pressure at which they are heard throughout the cycle. The difference is the paradox.", "An inspiratory fall in systolic pressure of more than ten millimetres of mercury is seen in cardiac tamponade, constrictive pericarditis and severe airway obstruction.", d),
      ],
    },
    {
      id: "blood_pressure",
      title: "Blood pressure",
      items: [
        item("bp_technique", "Measuring blood pressure correctly", "Rest the patient five minutes, seated or supine, arm supported at heart level, using a cuff whose bladder encircles at least eighty per cent of the arm. Palpate the systolic first, then inflate thirty above it, deflating at two to three millimetres per second. Read the first and fifth Korotkoff sounds.", "A cuff too small for the arm reads falsely high, which is a common and avoidable source of a wrong label in a large-armed patient.", { normal: "Blood pressure within the expected range for age." }),
        item("both_arms", "Both arms", "Measure in both arms at the first assessment.", "A sustained difference between arms of more than twenty millimetres of mercury systolic is associated with subclavian disease and with aortic dissection.", { normal: "No significant difference between arms." }),
        item("postural_bp", "Postural drop", "Measure supine, then again after one and three minutes of standing, asking about giddiness at each point.", "A fall on standing, or severe postural dizziness preventing the measurement, is seen with volume depletion, blood loss, autonomic failure and drug effect; severe postural dizziness is among the most useful bedside findings for large blood loss.", d),
        item("pulse_pressure", "Pulse pressure", "Subtract diastolic from systolic.", "A wide pulse pressure is associated with aortic regurgitation, anaemia, thyroid excess and stiff arteries in the elderly; a narrow pulse pressure with aortic stenosis, tamponade and a low output state.", d),
      ],
    },
    {
      id: "jvp",
      title: "Jugular venous pressure",
      intro: "The jugular venous pressure is read from the internal jugular, not the external, using the pulsation rather than a visible cord. The column gives a bedside reading of right atrial pressure.",
      items: [
        item("jvp_height", "Height of the column", "Lay the patient at 45 degrees, head turned slightly away, neck muscles relaxed, with tangential lighting. Identify the internal jugular pulsation between the heads of sternocleidomastoid. Measure the vertical height of the top of the pulsation above the sternal angle, and add five centimetres for the right atrium.", "A raised jugular venous pressure is seen with right-sided cardiac failure, fluid overload, tamponade, constriction and pulmonary hypertension; a low or absent column is seen with volume depletion.", { normal: "Jugular venous pressure not raised." }),
        item("jvp_vs_carotid", "Distinguishing venous from arterial pulsation", "A venous pulsation has two peaks per cycle, is impalpable, varies with respiration and posture, is obliterated by light pressure at the base of the neck, and fills from above when occluded.", "Mistaking the carotid for the jugular is the commonest error here, and it turns a normal neck into a falsely reassuring or falsely alarming finding.", d),
        item("jvp_waveform", "Waveform", "Watch for the a wave (atrial contraction), the x descent, the v wave (atrial filling) and the y descent, timing against the carotid on the opposite side.", "Giant a waves are seen with tricuspid stenosis and pulmonary hypertension; cannon a waves with complete heart block; large v waves with tricuspid regurgitation; absent a waves with atrial fibrillation.", d),
        item("hepatojugular", "Abdominojugular reflux", "Warn the patient, then press firmly and steadily over the right upper abdomen for fifteen seconds while watching the neck, ensuring the patient keeps breathing normally and does not strain.", "A sustained rise in the venous column during pressure is associated with right ventricular failure and raised filling pressures.", d),
        item("kussmaul", "Kussmaul's sign", "Watch the venous column through quiet inspiration.", "A paradoxical rise in the jugular venous pressure on inspiration is seen in constrictive pericarditis, right ventricular infarction and severe right heart failure.", d),
      ],
    },
    {
      id: "precordium_inspection_palpation",
      title: "Precordium: inspection and palpation",
      items: [
        item("inspection", "Inspection of the precordium", "With the chest fully exposed and viewed tangentially, look for shape and symmetry, precordial bulge, visible pulsations, scars (midline sternotomy, left submammary, subclavian pacemaker pocket), dilated veins and the apex beat.", "A precordial bulge is seen with cardiac enlargement dating from childhood; scars record previous surgery that the history may not have mentioned.", { normal: "Precordium normal in shape, no visible pulsations or scars." }),
        item("apex_beat", "Apex beat: position", "Locate the lowermost and outermost point at which the cardiac impulse is palpable, using the flat of the hand then one finger, and describe it by intercostal space and its relation to the mid-clavicular line. If impalpable, turn the patient to the left lateral position and say so.", "Displacement outward and downward is seen with left ventricular dilatation; an impalpable apex with obesity, emphysema, pericardial effusion or dextrocardia.", { normal: "Apex beat in the fifth intercostal space, medial to the mid-clavicular line." }),
        item("apex_character", "Apex beat: character", "Feel whether the impulse is brief and tapping, forceful and sustained (heaving), diffuse and ill-sustained, or double.", "A heaving sustained apex is associated with pressure overload such as aortic stenosis and hypertension; a diffuse hyperdynamic apex with volume overload such as mitral or aortic regurgitation; a tapping apex with mitral stenosis.", d),
        item("parasternal_heave", "Parasternal heave", "Place the heel of the hand flat to the left of the sternum with the fingers lifted, and feel for a sustained outward lift during systole.", "A left parasternal heave is seen with right ventricular enlargement, most often from pulmonary hypertension or mitral valve disease.", { normal: "No parasternal heave." }),
        item("thrills", "Thrills", "Use the palm and the metacarpophalangeal heads over each valve area, with the patient in expiratory breath-hold.", "A palpable thrill accompanies a murmur loud enough to be graded four or more, and its timing and site point to the valve responsible.", { normal: "No thrills." }),
        item("palpable_sounds", "Palpable heart sounds", "Feel at the apex and at the upper left sternal edge for a tapping first sound or a palpable second sound.", "A palpable second sound in the pulmonary area is associated with pulmonary hypertension.", d),
      ],
    },
    {
      id: "auscultation",
      title: "Precordium: auscultation",
      intro: "Listen at all four areas with diaphragm then bell, timing every sound against the carotid pulse. Then add the manoeuvres: left lateral with the bell at the apex, and sitting forward in expiration at the left sternal edge.",
      items: [
        item("heart_sounds", "First and second heart sounds", "Identify the first sound at the apex and the second at the base, timing against the carotid. Note intensity, and whether the second sound splits and how that split moves with respiration.", "A loud first sound is associated with mitral stenosis; a soft first sound with mitral regurgitation and with a long conduction interval; wide fixed splitting of the second sound with atrial septal defect; a loud pulmonary component with pulmonary hypertension.", { normal: "First and second heart sounds normal, no added sounds." }),
        item("added_sounds", "Third and fourth heart sounds", "Listen with the bell at the apex in the left lateral position, in expiration, for a low-pitched sound in early diastole (third) or just before the first sound (fourth).", "A third sound in an adult is associated with a dilated poorly compliant ventricle and with heart failure; a fourth sound with a stiff ventricle as in hypertension and aortic stenosis.", d),
        item("murmur_timing", "Murmurs: timing", "Decide first whether the murmur is systolic or diastolic by timing against the carotid, then whether the murmur falls early, mid, late or throughout.", "A pansystolic murmur is associated with mitral or tricuspid regurgitation and with a ventricular septal defect; an ejection systolic murmur with aortic or pulmonary stenosis and with high flow; an early diastolic murmur with aortic or pulmonary regurgitation; a mid-diastolic murmur with mitral or tricuspid stenosis.", { normal: "No murmurs." }),
        item("murmur_character", "Murmurs: site, radiation, character and grade", "Record where the murmur is loudest, where it radiates, its pitch and shape, and its grade out of six, noting that grade four and above are palpable.", "Radiation to the axilla is associated with mitral regurgitation; radiation to the carotids with aortic stenosis; a harsh crescendo-decrescendo shape with outflow obstruction.", d),
        item("dynamic_manoeuvres", "Dynamic manoeuvres", "Listen at the apex with the bell in the left lateral position for mitral diastolic murmurs, and at the left sternal edge with the diaphragm with the patient sitting forward in held expiration for aortic regurgitation. Note the effect of inspiration on right-sided murmurs.", "Right-sided murmurs become louder on inspiration; the early diastolic murmur of aortic regurgitation is often audible only when the patient sits forward in expiration, and missing that step is how the murmur goes unheard.", d),
        item("pericardial_rub", "Pericardial rub", "Listen with the diaphragm at the left sternal edge with the patient sitting forward, in held expiration, for a scratching sound with up to three components.", "A pericardial rub is associated with pericarditis of any cause, including uraemic, tuberculous, viral and post-infarction; it may come and go over hours.", d),
      ],
    },
    {
      id: "completion",
      title: "Completing the examination",
      items: [
        item("lung_bases", "Lung bases", "Percuss and auscultate the posterior lung bases with the patient sitting forward.", "Bibasal fine late-inspiratory crackles and a stony dull base are seen with pulmonary congestion and pleural effusion in cardiac failure.", { normal: "Lung bases clear." }),
        item("liver_ascites", "Liver and ascites", "Palpate for the liver edge, noting tenderness and whether the edge pulsates, and percuss for shifting dullness.", "A tender enlarged liver is seen with congestion from right heart failure; a pulsatile liver with tricuspid regurgitation; ascites with advanced right-sided failure and with constriction.", { normal: "No hepatomegaly, no ascites." }),
        item("sacral_oedema", "Sacral oedema", "Roll the patient and press over the sacrum for fifteen seconds.", "Sacral oedema is seen in bed-bound patients with fluid overload, in whom the legs may look deceptively normal.", { normal: "No sacral oedema." }),
        item("fundus_urine", "Fundus and urine", "Examine the fundus where hypertension or endocarditis is suspected, and test the urine for blood and protein.", "Retinal changes are seen with sustained hypertension; Roth spots and microscopic haematuria are associated with infective endocarditis.", d),
      ],
    },
  ],
};
