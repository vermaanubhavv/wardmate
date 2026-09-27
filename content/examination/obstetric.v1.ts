import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, DUTTA_OBSTETRICS, HUTCHISONS, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * OBSTETRIC EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * General examination, then the abdomen (inspection, fundal height, the four Leopold grips,
 * auscultation of the fetal heart), and, in labour, the vaginal examination. Anaemia and
 * hypertensive disorders of pregnancy are the background against which the general findings
 * are read on an Indian labour ward, so pallor, oedema and blood pressure come first.
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

export const obstetricV1: ExamChecklist = {
  id: "obstetric",
  version: "1.0.0",
  title: "Obstetric examination",
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DUTTA_OBSTETRICS, MACLEODS, HUTCHISONS, BATES],
  sections: [
    {
      id: "preparation_obs",
      title: "Consent, chaperone and position",
      intro: "Explain, take consent and have a female chaperone present before any abdominal or vaginal examination. Ask her to empty her bladder first, and avoid lying her flat for long in late pregnancy.",
      items: [
        item("consent_chaperone_obs", "Consent and chaperone", "Explain what the examination involves, take verbal consent, and ensure a female chaperone is present throughout. Record the chaperone's name.", "Consent and a chaperone protect the woman's dignity and the examiner, and a vaginal examination without them is not acceptable practice.", { normal: "Consent taken, chaperone present." }),
        item("position_obs", "Bladder and position", "Ask her to empty her bladder. Examine semi-recumbent or with a slight left lateral tilt, exposed from below the breasts to the symphysis, with the legs slightly flexed.", "A full bladder raises the fundal height and makes the presenting part hard to feel; lying flat in late pregnancy is associated with supine hypotension from caval compression.", { normal: "Bladder empty, examined with a left lateral tilt." }),
      ],
    },
    {
      id: "general_obs",
      title: "General examination",
      items: [
        item("general_look_obs", "General look, height and gait", "Note build, nutrition, height and gait as she walks in. Record weight and compare with the booking weight.", "Short stature and a limp or spinal deformity are associated with a contracted pelvis; poor weight gain with fetal growth restriction; sudden weight gain with fluid retention.", { normal: "Average build, normal gait." }),
        item("pallor_obs", "Pallor", "Look at the lower palpebral conjunctiva, tongue, nail beds and palms in daylight.", "Pallor is associated with anaemia, the commonest medical problem in pregnancy in India, and raises the question of how much blood loss she could tolerate at delivery.", { normal: "No pallor." }),
        item("oedema_obs", "Oedema", "Press over the medial malleolus and shin for several seconds and look for pitting. Look also at the face, hands and sacrum.", "Pedal oedema alone is common in late pregnancy; oedema of the face and hands, or oedema that appears suddenly, raises the question of pre-eclampsia and is read alongside the blood pressure and urine.", { normal: "No pedal oedema." }),
        item("pulse_obs", "Pulse and temperature", "Count the radial pulse for a full minute and record the temperature.", "A persistent tachycardia is associated with anaemia, infection, dehydration, haemorrhage and thyroid disease; fever in labour raises chorioamnionitis.", { normal: "Pulse regular, afebrile." }),
        item("bp_obs", "Blood pressure", "Measure seated or in left lateral tilt with the arm at heart level and an appropriately sized cuff, using Korotkoff phase five for the diastolic. Repeat if raised.", "A raised blood pressure after twenty weeks is associated with gestational hypertension and pre-eclampsia; a reading taken supine or with a small cuff misleads.", { normal: "Blood pressure within the normal range." }),
        item("urine_protein_obs", "Urine for protein and sugar", "Test a clean-catch midstream sample with a dipstick at every visit.", "Proteinuria with raised blood pressure is associated with pre-eclampsia; glycosuria raises the question of gestational diabetes and needs a blood test to settle it.", d),
        item("jaundice_obs", "Icterus", "Look at the sclera in daylight with the patient looking down.", "Jaundice in pregnancy is associated with viral hepatitis, intrahepatic cholestasis of pregnancy, HELLP syndrome and acute fatty liver.", { normal: "No icterus." }),
        item("thyroid_obs", "Thyroid", "Inspect the neck as she swallows, then palpate from behind for size, nodules and tenderness.", "Mild symmetrical enlargement is common in pregnancy; a nodule or a large goitre is associated with thyroid disease that affects the fetus as well as the mother.", d),
        item("breasts_obs", "Breasts and nipples", "With consent and the chaperone present, inspect for the pregnancy changes and palpate for lumps. Look at the nipples for retraction or cracks.", "Retracted or flat nipples are associated with difficulty in breastfeeding; a lump found in pregnancy needs evaluation and is not assumed to be a physiological change.", d),
        item("cvs_rs_obs", "Heart and lungs", "Auscultate the heart and both lung bases.", "A soft ejection murmur is common in pregnancy; a diastolic murmur or basal crackles raise rheumatic heart disease and pulmonary oedema, which the rising cardiac output of pregnancy unmasks.", { normal: "Heart sounds normal, chest clear." }),
      ],
    },
    {
      id: "inspection_obs",
      title: "Abdominal inspection",
      items: [
        item("shape_obs", "Size and shape of the uterus", "Look from the side of the bed at the size of the abdomen and the shape of the uterine swelling.", "A longitudinally ovoid uterus is associated with a longitudinal lie; a broad transversely ovoid uterus with a transverse lie; an abdomen larger than the dates with twins, polyhydramnios or wrong dates.", { normal: "Uterus longitudinally ovoid, size corresponds to period of gestation." }),
        item("skin_changes_obs", "Linea nigra and striae", "Look for the pigmented midline linea nigra and for striae gravidarum, noting whether they are fresh (pink) or old (silvery white).", "Old silvery striae are associated with a previous pregnancy; fresh striae with the current stretching of the abdominal wall.", d),
        item("scars_obs", "Scars", "Look for a Pfannenstiel, midline or laparoscopic scar and ask what operation it was for.", "A previous caesarean scar is associated with a risk of scar dehiscence in labour, and the kind of uterine incision matters more than the skin scar.", { normal: "No scars." }),
        item("fetal_movements_obs", "Visible fetal movements and umbilicus", "Watch for fetal movements and note whether the umbilicus is flat or everted.", "Visible fetal movements after twenty weeks are associated with a live fetus; an everted umbilicus with a distended uterus from polyhydramnios or multiple pregnancy.", d),
      ],
    },
    {
      id: "palpation_obs",
      title: "Palpation",
      intro: "Measure the fundal height first, then perform the four grips in order, facing the woman's head for the first three and her feet for the fourth.",
      items: [
        item("fundal_height", "Fundal height", "Place the ulnar border of the left hand at the top of the uterus and relate the fundus to the symphysis, umbilicus and xiphisternum.", "A fundus higher than the dates is associated with wrong dates, multiple pregnancy, polyhydramnios and macrosomia; a fundus lower than the dates with growth restriction, oligohydramnios and fetal death.", { normal: "Fundal height corresponds to period of gestation." }),
        item("sfh", "Symphysio-fundal height", "With the bladder empty and the fundus located, measure with a tape from the top of the symphysis to the fundus, tape face down, then read the figure in centimetres.", "After twenty-four weeks the height in centimetres roughly matches the weeks of gestation, and a difference of more than three centimetres raises growth or liquor abnormalities.", { normal: "Symphysio-fundal height corresponds to gestation." }),
        item("fundal_grip", "First grip: fundal grip", "Facing the head, palpate the fundus with both hands to identify which pole occupies it.", "A broad soft irregular fundal pole is associated with the breech in the fundus and a cephalic presentation; a hard round ballotable pole in the fundus with a breech presentation.", { normal: "Broad soft pole at the fundus." }),
        item("lateral_grip", "Second grip: lateral grip", "Place the hands flat on either side of the uterus and steady one side while palpating the other, feeling for the smooth curve of the back and the knobbly limbs.", "The position of the back guides where to listen for the fetal heart and, with the presenting part, gives the position of the fetus.", { normal: "Back on the left, limbs on the right." }),
        item("lie_obs", "Lie", "From the first two grips, relate the long axis of the fetus to the long axis of the uterus.", "An oblique or transverse lie near term is associated with placenta praevia, polyhydramnios, multiparity with a lax abdomen and pelvic tumours, and changes how labour is approached.", { normal: "Longitudinal lie." }),
        item("pawlik_grip", "Third grip: Pawlik's grip", "With the right hand, grasp the lower pole just above the symphysis between thumb and fingers, gently, and try to move it side to side.", "A hard round ballotable part is associated with an unengaged head; a part that cannot be moved suggests engagement; an empty lower pole with a transverse lie.", { normal: "Cephalic presentation." }),
        item("pelvic_grip", "Fourth grip: pelvic grip", "Face the woman's feet and, with the fingertips of both hands, press down and in along the direction of the inlet on either side of the presenting part.", "Converging hands are associated with a head not entered in the pelvis; diverging hands with a head that has entered; the side where the sinciput is felt helps judge flexion.", d),
        item("engagement_fifths", "Engagement in fifths palpable", "Estimate how many finger-breadths of the head remain palpable above the pelvic brim, expressed as fifths.", "A head that is three fifths or more palpable at term in a primigravida raises cephalopelvic disproportion, a malposition or placenta praevia; two fifths or fewer palpable is associated with engagement.", { normal: "Head two fifths palpable." }),
        item("liquor_obs", "Liquor", "Judge how easily the fetal parts are felt and whether a fluid thrill is present.", "Parts felt with difficulty, with a tense uterus, are associated with polyhydramnios; parts felt too easily, with a uterus small for dates, with oligohydramnios.", { normal: "Liquor clinically adequate." }),
        item("uterine_tenderness", "Uterine tenderness and tone", "Palpate the whole uterus gently, watching her face, and note whether it relaxes between contractions.", "A tender, tense uterus that does not relax is associated with placental abruption; scar tenderness in a woman with a previous caesarean raises impending rupture.", { normal: "Uterus relaxed and non-tender." }),
        item("contractions_obs", "Contractions", "Keep a hand on the fundus for ten minutes and count the contractions, their duration and strength.", "Regular painful contractions with cervical change are associated with labour; more than five in ten minutes with hyperstimulation, which reduces fetal oxygenation.", d),
        item("estimated_weight", "Estimated fetal weight", "Estimate the fetal size from the fundal height and the grips, and compare with the dates.", "A clinical estimate that is large or small for dates raises the same questions as a discrepant fundal height and is checked by ultrasound.", d),
      ],
    },
    {
      id: "auscultation_obs",
      title: "Auscultation",
      items: [
        item("fhs", "Fetal heart rate and rhythm", "Listen with a Pinard stethoscope or Doppler over the fetal back, below the umbilicus for a cephalic presentation. Count for a full minute while feeling the maternal pulse, and in labour listen during and immediately after a contraction.", "A rate persistently below or above the normal range, or decelerations after contractions, are associated with fetal compromise; confirming it differs from the maternal pulse prevents recording the mother's heart as the baby's.", { normal: "Fetal heart heard, regular, rate within the normal range." }),
        item("fhs_site", "Site of maximum intensity", "Note the quadrant where the heart is loudest.", "The site helps judge presentation and position; a heart heard loudest above the umbilicus is associated with a breech presentation, and two distinct rates with twins.", d),
      ],
    },
    {
      id: "vaginal_obs",
      title: "Vaginal examination in labour",
      intro: "Performed only when indicated, with consent and a chaperone, using aseptic technique. Never perform a digital examination while bleeding in pregnancy is unexplained until placenta praevia has been excluded by ultrasound.",
      items: [
        item("consent_pv_obs", "Indication, consent and chaperone", "State the indication, take fresh verbal consent, ensure the chaperone is present, and exclude a low-lying placenta before examining if she is bleeding.", "A vaginal examination in the presence of placenta praevia is associated with torrential haemorrhage, which is why the indication is stated first.", { normal: "Indication stated, consent taken, chaperone present." }),
        item("vulva_obs", "Vulva and perineum", "Inspect for discharge, bleeding, draining liquor, varicosities, old tears and scars.", "Fresh bleeding, draining liquor and offensive discharge each change the next step; an old perineal scar is associated with a rigid perineum.", { normal: "No bleeding or discharge." }),
        item("dilatation", "Cervical dilatation", "With two sterile gloved fingers, estimate the diameter of the os in centimetres.", "Dilatation plotted on the partograph over time is associated with progress in labour; slow dilatation raises inefficient contractions, malposition and disproportion.", { normal: "Cervix os dilatation recorded in centimetres." }),
        item("effacement", "Effacement and consistency", "Estimate the length of the cervix as a percentage of its uneffaced length, and note its consistency (soft or firm) and position (anterior or posterior).", "A soft, effaced, anterior cervix is associated with a favourable cervix, which is scored as the Bishop score.", d),
        item("station", "Station of the presenting part", "Relate the lowest bony point of the presenting part to the ischial spines, in centimetres above or below.", "Descent measured by station alongside the abdominal fifths tracks progress; a station that is low with a head still largely palpable abdominally is associated with caput and moulding rather than true descent.", { normal: "Station recorded relative to the spines." }),
        item("membranes_liquor", "Membranes and liquor colour", "Feel for intact membranes bulging through the os; if ruptured, note the colour and smell of the draining liquor.", "Meconium-stained liquor is associated with fetal compromise; blood-stained liquor with abruption; foul-smelling liquor with chorioamnionitis.", { normal: "Membranes intact, or liquor clear." }),
        item("presenting_part_pv", "Presenting part, position, caput and moulding", "Identify the presenting part and its position from the sutures and fontanelles, and grade caput and moulding.", "A deflexed head, an occipito-posterior position, and increasing caput or moulding are associated with obstructed progress.", d),
        item("cord_pv", "Cord", "Feel for a loop of cord in front of or beside the presenting part, particularly after the membranes rupture.", "A cord felt below the presenting part is associated with cord prolapse, an obstetric emergency.", { normal: "No cord felt." }),
        item("pelvis_assessment", "Clinical pelvimetry", "Where indicated, attempt to reach the sacral promontory, assess the sacral curve, the side walls, the prominence of the ischial spines, the subpubic angle and the intertuberous diameter.", "A reachable promontory, prominent spines, a narrow subpubic angle and convergent side walls are associated with a contracted pelvis and raise cephalopelvic disproportion.", d),
      ],
    },
  ],
};
