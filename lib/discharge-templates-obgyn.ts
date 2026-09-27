import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * OBSTETRICS & GYNAECOLOGY discharge templates.
 *
 * CONDITION TEMPLATES: REVIEWED (Dr Anubhav Verma, 2026-09-28). `OBGYN_DISCHARGE_TEMPLATES` (normal delivery,
 * LSCS, postpartum pre-eclampsia / gestational hypertension, PPH, ectopic, miscarriage / MTP with
 * evacuation, hysterectomy, antenatal admission discharged undelivered) were drafted on the
 * product owner's direction and signed off by him. That is a single-clinician sign-off; the
 * departmental read-through this pack was holding them for (docs/specialty-packs.md §8) is still
 * outstanding, and they remain an editable starting point to be corrected from it.
 *
 * Medication lines are a STARTING SET with standard adult strengths, chosen to be compatible
 * with breastfeeding after delivery, and are checked against each patient — allergy, Hb, renal
 * function, what she was already taking. The antihypertensive dose is a `[ … ]` blank because it
 * is titrated on the ward. Anti-D is never a drug line: it appears in the advice as a question
 * for the resident to answer from the blood group and the chart. `[ … ]` marks every
 * patient-specific blank.
 *
 * First match wins (lib/specialty/discharge.ts), so the array is ordered specific before
 * general: ectopic, PPH, miscarriage / MTP, hysterectomy, postpartum pre-eclampsia, LSCS, then
 * normal delivery, then the antenatal (undelivered) catch-all last.
 *
 * The generic template's `medications: []` is unchanged — with no condition known, a
 * prescription is patient-specific, never guessed.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

const STANDARD_RED_FLAGS = [
  "Fever, or foul-smelling vaginal discharge",
  "Heavy vaginal bleeding — soaking more than one pad an hour",
  "Severe headache, visual disturbance, or a fit",
  "Severe abdominal pain",
  "Wound (if operated) becoming red, swollen or discharging",
];

export const OBGYN_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "obgyn_generic",
  label: "Obstetrics & Gynaecology — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presenting problem / for delivery ] for [ investigation / obstetric or gynaecological management ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Delivery or procedure during this admission, if any — LSCS, normal delivery, D&C, laparoscopy, hysterectomy ]",
      anaesthesia: "",
      findings: "[ relevant findings — indication for the procedure, intra-operative findings ]",
      drains: "[ catheter / drain at discharge, if any ]",
      complications: "Nil",
      outcome: "[ Outcome — maternal and, where relevant, fetal/neonatal ]",
    },
    clinicalCourse:
      "Admitted on day [ … ] at [ POG / with presenting complaint ]. [ Course of labour or the gynaecological problem and how it was managed. ] [ Treatment given during the admission. ] The patient improved, was afebrile and haemodynamically stable, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: adv([
      { module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor." },
      { module: "Wound / perineal care", text: "[ wound or episiotomy care instructions, if applicable ]" },
      { module: "Follow-up", text: "Attend the obstetrics & gynaecology OPD on [ … ] with all reports." },
    ]),
    redFlags: STANDARD_RED_FLAGS,
    patientActions: [
      "Attend the obstetrics & gynaecology OPD on [ … ].",
      "Get [ … ] repeated on [ … ] and bring the report to the next visit.",
      "Bring this summary and all reports to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course; LMP, EDD and period of gestation where relevant; gravida/para/living/abortion record; antenatal course and booking status; menstrual and obstetric history; past medical, surgical and drug history; examination including per-abdomen and per-vaginum findings; provisional diagnosis and the plan. Baseline: CBC, blood group and Rh, urine routine, and the condition-specific tests (USG, OGTT, coagulation profile).",
  progressNote:
    "Each day — symptoms; vitals including blood pressure trend; per-abdomen and lochia/bleeding findings; oral intake; the results back and the plan; for a delivered patient, involution and breastfeeding. For discharge — afebrile, stable, involuting/wound healthy, tolerating orals, oral medicines prescribed, and follow-up written down.",
};


// --- condition templates (reviewed — see the header) ---------------------

const M = {
  ifa: { generic: "Iron + folic acid (IFA)", strength: "60 mg elemental iron + 500 mcg folic acid", route: "PO", frequency: "OD after food", duration: "180 days", status: "new" } as TemplateMedication,
  calcium: { generic: "Calcium carbonate + vitamin D3", strength: "500 mg elemental calcium", route: "PO", frequency: "BD", duration: "180 days", indication: "not at the same time as the iron tablet", status: "new" } as TemplateMedication,
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", status: "prn" } as TemplateMedication,
  ibuprofenSos: { generic: "Ibuprofen", strength: "400 mg", route: "PO", frequency: "SOS for pain, after food", duration: "5 days", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
  lactulose: { generic: "Lactulose", dose: "15 ml", route: "PO", frequency: "HS", duration: "7 days", indication: "keep stools soft, avoid straining", status: "new" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "5 days", indication: "if indicated — not routine after prophylaxis", status: "new" } as TemplateMedication,
  doxycycline: { generic: "Doxycycline", strength: "100 mg", route: "PO", frequency: "BD", duration: "5 days", indication: "if indicated", status: "new" } as TemplateMedication,
  enoxaparin: { generic: "Enoxaparin", strength: "40 mg", route: "SC", frequency: "OD", duration: "[ 10 days / 6 weeks ]", indication: "only if the VTE risk assessment calls for it", status: "new" } as TemplateMedication,
  labetalol: { generic: "Labetalol", dose: "[ … ] — as titrated on the ward", route: "PO", frequency: "[ BD / TDS ]", indication: "step down as BP settles, as advised", status: "new" } as TemplateMedication,
  nifedipine: { generic: "Nifedipine (extended release)", dose: "[ … ] — as titrated on the ward", route: "PO", frequency: "[ OD / BD ]", indication: "if used instead of, or with, labetalol", status: "new" } as TemplateMedication,
};

const RF_POSTNATAL = [
  "Heavy vaginal bleeding — soaking more than one pad an hour, or passing large clots",
  "Fever, or foul-smelling vaginal discharge",
  "Severe headache, blurred vision, or a fit",
  "Breathlessness, chest pain, or pain and swelling of one leg",
  "Painful, red, hot area in the breast with fever",
  "Burning or difficulty passing urine, or not passing urine",
  "Feeling very low, unable to cope, or thoughts of harming yourself or the baby",
];
const RF_WOUND = "Wound becoming red, swollen, painful or discharging, or the wound opening";

const BREASTFEEDING = { module: "Breastfeeding", text: "Exclusive breastfeeding on demand, day and night, for six months. All the medicines on this list are safe while breastfeeding." };
const DIET = { module: "Diet", text: "Normal, high-protein diet with extra fluids. Take the iron and calcium tablets at different times of the day." };
const CONTRACEPTION = { module: "Contraception", text: "Contraception discussed: [ PPIUCD inserted / method chosen — … / to decide at follow-up ]." };
const ANTI_D = { module: "Anti-D", text: "[ Mother Rh negative? — anti-D given on [ … ] / not indicated (Rh positive / baby Rh negative) ]" };
const BABY = { module: "Baby", text: "Get the baby's birth-dose vaccines given and keep the immunisation card safe." };
const OPD = (when: string) => ({ module: "Follow-up", text: `Attend the obstetrics & gynaecology OPD ${when} with this summary and all reports.` });

export const OBGYN_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Ectopic pregnancy ----
  {
    key: "obg_ectopic",
    label: "Ectopic pregnancy (laparotomy / laparoscopy)",
    match: /ectopic|tubal pregnancy|salpingectomy|salpingostomy/i,
    scaffold: {
      indication: "Patient was admitted with [ pain abdomen / bleeding per vaginum / collapse ] at [ … ] weeks of amenorrhoea and a diagnosis of [ ruptured / unruptured ] ectopic pregnancy, requiring surgical management.",
      primaryDiagnosis: "[ Ruptured / unruptured ] [ right / left ] tubal ectopic pregnancy",
      procedure: {
        name: "[ Laparoscopic / open ] [ salpingectomy / salpingostomy ] [ side ]",
        anaesthesia: "General anaesthesia",
        findings: "[ site of ectopic; rupture; haemoperitoneum volume; contralateral tube and ovaries ]",
        drains: "[ nil / drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ … ]; urine pregnancy test positive, serum β-hCG [ … ], USG [ … ]. Underwent [ procedure ] on [ date ] [ with transfusion of … units ]. Recovery was uneventful; tolerating orals, ambulant, passing urine. Hb at discharge [ … ].",
      medications: [M.paracetamol, M.pantoprazole, M.ibuprofenSos, M.ifa, M.amoxClav],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry." },
        { module: "Activity", text: "Gradual return to activity; no heavy lifting for [ 2 weeks after laparoscopy / 6 weeks after laparotomy ]." },
        ANTI_D,
        { module: "Next pregnancy", text: "In the next pregnancy, get an early ultrasound at six weeks to confirm the pregnancy is in the womb." },
        CONTRACEPTION,
        OPD("after 7 days"),
      ]),
      redFlags: ["Severe abdominal or shoulder-tip pain", "Fainting, dizziness, or a fast heartbeat", "Heavy vaginal bleeding", "Fever", RF_WOUND],
      patientActions: [
        "Attend the OPD after 7 days for a wound review and the histopathology report.",
        "[ Serum β-hCG repeated weekly until negative — after salpingostomy. ]",
      ],
      primaryCareActions: ["Check Hb after two weeks."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Amenorrhoea and LMP; pain — site, onset, shoulder-tip pain; bleeding per vaginum; fainting; previous ectopic, PID, tubal surgery, IUCD, infertility treatment; obstetric history; blood group. Examination: pulse, BP, pallor, abdominal guarding, per-vaginum — cervical motion tenderness, adnexal mass. Baseline: UPT, serum β-hCG, TVS, CBC, blood group and cross-match.",
    progressNote:
      "Each day — pulse, BP, pallor, pain, abdomen, wound, urine output, Hb. For discharge — stable, Hb acceptable, wound healthy, anti-D decided, HPE and follow-up arranged.",
  },

  // ---- Postpartum haemorrhage ----
  {
    key: "obg_pph",
    label: "Postpartum haemorrhage",
    match: /postpartum ha?emorrhage|post-partum ha?emorrhage|\bPPH\b|atonic uterus|retained placenta/i,
    scaffold: {
      indication: "Patient delivered by [ normal vaginal delivery / LSCS ] on [ date ] and had a postpartum haemorrhage requiring [ … ].",
      primaryDiagnosis: "[ Primary / secondary ] postpartum haemorrhage due to [ atony / trauma / retained tissue / coagulopathy ] after [ mode of delivery ]",
      procedure: {
        name: "[ Uterotonics / manual removal of placenta / repair of tear / balloon tamponade / B-Lynch / ligation / hysterectomy ]",
        anaesthesia: "[ as applicable ]",
        findings: "[ estimated blood loss; cause found ]",
        drains: "[ catheter / drain, if any ]",
        complications: "Nil",
        outcome: "[ Haemostasis achieved ]",
      },
      clinicalCourse:
        "Delivered on [ date ] by [ … ]. Estimated blood loss [ … ] ml; managed with [ uterotonics / procedure ] and [ … ] units of blood / products [ ± IV iron ]. Monitored [ in HDU for … ]; no further bleeding. Uterus well contracted, lochia normal, Hb [ … ] at discharge. Breastfeeding established.",
      medications: [M.ifa, M.calcium, M.paracetamolSos, M.amoxClav],
      advice: adv([BREASTFEEDING, DIET, ANTI_D, CONTRACEPTION, BABY, OPD("after 2 weeks with a repeat Hb")]),
      redFlags: RF_POSTNATAL,
      patientActions: [
        "Get Hb repeated after 2 weeks and attend the OPD with the report.",
        "Tell the doctor at the next pregnancy that you had PPH — deliver in a hospital with blood available.",
      ],
      primaryCareActions: ["Check Hb and adherence to iron; postnatal visits as scheduled."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mode and time of delivery; estimated blood loss and how measured; risk factors — multiple pregnancy, polyhydramnios, prolonged labour, previous PPH, anaemia, APH; placental completeness; drugs given. Examination: pulse, BP, shock index, pallor, uterine tone and height, perineum and cervix, bladder. Baseline: CBC, blood group and cross-match, coagulation profile, renal function.",
    progressNote:
      "Each day — pulse, BP, uterine tone, lochia, urine output, Hb, transfusion given. For discharge — no active bleeding, Hb acceptable, oral iron prescribed, breastfeeding.",
  },

  // ---- Miscarriage / MTP with evacuation (threatened abortion excluded — goes to antenatal) ----
  {
    key: "obg_evacuation",
    label: "Miscarriage / MTP with evacuation",
    match: /(?<!threatened )(miscarriage|abortion)|\bMTP\b|evacuation|suction (and )?evacuation|\bD ?& ?[CE]\b|\bMVA\b|products of conception/i,
    scaffold: {
      indication: "Patient was admitted at [ … ] weeks with [ incomplete / missed / inevitable miscarriage / request for MTP under the MTP Act ] for uterine evacuation.",
      primaryDiagnosis: "[ Incomplete / missed / inevitable miscarriage / MTP ] at [ … ] weeks",
      procedure: {
        name: "[ Suction evacuation / MVA / D&E ] [ ± medical priming ]",
        anaesthesia: "[ Paracervical block / short GA / sedation ]",
        findings: "[ uterine size; products obtained ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed; products sent for histopathology.",
      },
      clinicalCourse:
        "Admitted on [ date ]; USG [ … ]. Underwent [ procedure ] on [ date ]. Bleeding settled, afebrile, tolerating orals, passing urine. Hb [ … ] at discharge.",
      medications: [M.paracetamolSos, M.ibuprofenSos, M.doxycycline, { ...M.ifa, duration: "3 months" }],
      advice: adv([
        { module: "What to expect", text: "Light bleeding or spotting for up to two weeks is expected. Use pads, not tampons. No intercourse until the bleeding stops." },
        ANTI_D,
        CONTRACEPTION,
        { module: "Support", text: "Losing a pregnancy is hard. Ask for support if you feel low." },
        OPD("after 2 weeks"),
      ]),
      redFlags: ["Heavy bleeding — soaking more than one pad an hour", "Fever, or foul-smelling discharge", "Severe abdominal pain", "Fainting or dizziness"],
      patientActions: ["Attend the OPD after 2 weeks with the histopathology report.", "[ Pregnancy test after 3 weeks — if medical method or incomplete evacuation suspected. ]"],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "LMP and weeks of gestation; bleeding — amount, clots, tissue passed; pain; fever; previous miscarriages; for MTP — indication and consent under the MTP Act; blood group; contraceptive history. Examination: pulse, BP, pallor, per-speculum (os, products), per-vaginum (uterine size, adnexa). Baseline: UPT, USG, CBC, blood group and Rh.",
    progressNote:
      "Post-procedure — pulse, BP, bleeding, pain, temperature, voiding. For discharge — bleeding minimal, stable, anti-D decided, contraception chosen.",
  },

  // ---- Hysterectomy ----
  {
    key: "obg_hysterectomy",
    label: "Hysterectomy (abdominal / vaginal)",
    match: /hysterectomy|\bTAH\b|\bNDVH\b|\bLAVH\b|\bTLH\b|\bVH\b/i,
    scaffold: {
      indication: "Patient was admitted for [ total abdominal / vaginal / laparoscopic ] hysterectomy [ ± BSO ] for [ fibroid uterus / AUB / uterovaginal prolapse / … ].",
      primaryDiagnosis: "[ Indication ]",
      procedure: {
        name: "[ Total abdominal / non-descent vaginal / vaginal with PFR / laparoscopic ] hysterectomy [ ± bilateral salpingo-oophorectomy ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ uterine size; adnexa; adhesions; ovaries conserved or removed ]",
        drains: "[ nil / drain; catheter removed on POD … ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [ procedure ] on [ date ]. Postoperative recovery was uneventful; catheter removed on POD [ … ] and passing urine freely; bowels opened; ambulant and tolerating a normal diet. Wound / vault healthy at discharge.",
      medications: [M.paracetamol, M.pantoprazole, M.ibuprofenSos, M.lactulose, M.amoxClav],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry. A small amount of brownish vaginal discharge for a few weeks is expected." },
        { module: "Lifting restrictions", text: "No heavy lifting or straining for 6 weeks." },
        { module: "Activity restrictions", text: "No intercourse for 6 weeks, and until the vault is checked." },
        { module: "Return-to-work advice", text: "Light work after [ 2–4 ] weeks; heavy work after 6 weeks." },
        OPD("after 7 days with the histopathology report"),
      ]),
      redFlags: ["Fever", "Heavy or foul-smelling vaginal bleeding or discharge", RF_WOUND, "Pain or burning passing urine, leakage of urine, or not passing urine", "Worsening abdominal pain or distension, or vomiting", "Pain and swelling of one leg, or breathlessness"],
      patientActions: ["Attend the OPD after 7 days for a wound review and the histopathology report.", "[ Suture removal on POD … — if non-absorbable. ]"],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Indication — menstrual history, AUB pattern, pressure symptoms, prolapse symptoms; Pap smear and endometrial sampling results; parity and family complete; previous surgery; medical comorbidities. Examination: pallor, abdominal mass, per-speculum, per-vaginum, prolapse grading. Baseline: CBC, blood group, renal function, blood sugar, USG, Pap smear, pre-anaesthetic workup.",
    progressNote:
      "Each day — pain, vitals, urine output and catheter, bowel function, wound, vaginal bleeding, mobilisation. For discharge — voiding, bowels opened, afebrile, wound healthy, HPE follow-up arranged.",
  },

  // ---- Postpartum pre-eclampsia / gestational hypertension (only once delivered) ----
  {
    key: "obg_preeclampsia",
    label: "Pre-eclampsia / gestational hypertension (postpartum)",
    match: /^(?=.*((?<!un)deliver|lscs|caesarean|cesarean|postpartum|post-partum|puerper|\bPNC\b|\bNVD\b|\bFTND\b))(?=.*(pre-?eclampsia|eclampsia|gestational hypertension|\bPIH\b|\bHELLP\b))/i,
    scaffold: {
      indication: "Patient with [ pre-eclampsia [ with severe features ] / gestational hypertension / eclampsia ] was delivered by [ … ] on [ date ] and monitored postpartum for blood pressure control.",
      primaryDiagnosis: "[ Pre-eclampsia / gestational hypertension / eclampsia / HELLP ], delivered by [ … ] on [ date ]",
      procedure: {
        name: "[ Normal vaginal delivery / LSCS ] on [ date ]",
        anaesthesia: "[ as applicable ]",
        findings: "[ indication for delivery; baby — sex, weight, Apgar ]",
        drains: "",
        complications: "Nil",
        outcome: "[ Mother and baby outcome ]",
      },
      clinicalCourse:
        "Admitted at [ … ] weeks with BP [ … ] and [ proteinuria / symptoms ]. [ Magnesium sulphate given for … hours. ] Delivered on [ date ] by [ … ]. Postpartum BP controlled on [ antihypertensive ]; renal and liver function [ … ]; platelets [ … ]. BP at discharge [ … ]. Breastfeeding established.",
      medications: [M.labetalol, M.nifedipine, M.ifa, M.calcium, M.paracetamolSos],
      advice: adv([
        { module: "Blood pressure", text: "Get the BP checked every [ … ] days at the nearest centre and write it down. The tablets are reduced as the BP settles — only on a doctor's advice." },
        { module: "Pain relief", text: "Use paracetamol for pain. Ask before taking any other painkiller." },
        { module: "Next pregnancy", text: "Book early in the next pregnancy and tell the doctor about this pre-eclampsia — aspirin from early pregnancy may be advised." },
        BREASTFEEDING,
        ANTI_D,
        CONTRACEPTION,
        OPD("after 1 week with the BP record"),
      ]),
      redFlags: ["Severe headache, blurred vision or seeing flashing lights", "Pain in the upper abdomen or under the right ribs", "A fit", "Breathlessness, or swelling of the face and hands", "BP above the level written on this summary", ...RF_POSTNATAL.filter((r) => !r.startsWith("Severe headache"))],
      patientActions: [
        "Attend the OPD after 1 week with the BP record.",
        "Urine protein and BP check at 6 weeks; if BP is still raised at 12 weeks, see a physician.",
      ],
      primaryCareActions: ["Check BP every [ … ] days and step down the antihypertensive as advised; refer if above the target written."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Gestation; BP readings and when first raised; headache, visual symptoms, epigastric pain, fits, breathlessness, reduced fetal movements; previous pre-eclampsia; chronic hypertension, renal disease, diabetes; drugs. Examination: BP, oedema, reflexes, fundus, fetal assessment. Baseline: urine protein, CBC with platelets, LFT, renal function, LDH, coagulation, fetal USG and Doppler.",
    progressNote:
      "Each day — BP chart, symptoms, urine output, magnesium toxicity checks while on it, platelets, LFT, renal function, antihypertensive as charted. For discharge — BP controlled on oral medicine, no symptoms, labs improving, BP-check plan written down.",
  },

  // ---- LSCS (before normal delivery) ----
  {
    key: "obg_lscs",
    label: "Caesarean section (LSCS)",
    match: /lscs|caesarean|cesarean|c-?section/i,
    scaffold: {
      indication: "Patient was admitted at [ … ] weeks [ in labour / for elective delivery ] and underwent [ emergency / elective ] LSCS for [ indication ].",
      primaryDiagnosis: "G[ … ]P[ … ] — [ emergency / elective ] LSCS at [ … ] weeks for [ indication ]",
      procedure: {
        name: "[ Emergency / elective ] lower-segment caesarean section",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ baby — sex, weight, Apgar; liquor; placenta; uterus, tubes and ovaries; [ tubal ligation ] ]",
        drains: "[ nil ]",
        complications: "Nil",
        outcome: "[ Live baby, … kg; mother stable ]",
      },
      clinicalCourse:
        "Underwent [ emergency / elective ] LSCS on [ date ] for [ indication ]. Postoperative recovery uneventful; catheter removed on POD [ … ]; ambulant, tolerating a normal diet, passing urine and flatus. Uterus involuting, lochia normal, wound healthy. Breastfeeding established. Baby [ with mother / in NICU ].",
      medications: [M.paracetamol, M.ibuprofenSos, M.pantoprazole, M.ifa, M.calcium, M.lactulose, M.amoxClav, M.enoxaparin],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry; bathe normally and pat it dry." },
        { module: "Lifting restrictions", text: "Nothing heavier than the baby for 6 weeks." },
        BREASTFEEDING,
        DIET,
        ANTI_D,
        CONTRACEPTION,
        { module: "Next pregnancy", text: "Space the next pregnancy by at least 18 months, and deliver in a hospital — tell the doctor you had a caesarean." },
        BABY,
        OPD("after 7 days for a wound review, and at 6 weeks"),
      ]),
      redFlags: [...RF_POSTNATAL, RF_WOUND],
      patientActions: ["Attend the OPD after 7 days for a wound review [ ± suture removal ].", "Postnatal check at 6 weeks."],
      primaryCareActions: ["Postnatal home visits as scheduled; check wound, BP, breastfeeding and mood."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Obstetric formula, LMP, EDD, gestation; booking and antenatal course; indication for caesarean; previous caesareans; labour events; medical disorders; blood group. Examination: vitals, fundal height, lie, presentation, fetal heart, per-vaginum where relevant. Baseline: CBC, blood group and cross-match, urine, viral markers, USG.",
    progressNote:
      "Each day (POD) — pain, vitals, urine and catheter, bowel sounds and flatus, oral intake, uterine involution, lochia, wound, breastfeeding, mobilisation. For discharge — afebrile, ambulant, voiding, wound healthy, breastfeeding established.",
  },

  // ---- Normal vaginal delivery ----
  {
    key: "obg_nvd",
    label: "Normal vaginal delivery",
    match: /normal (vaginal )?delivery|vaginal delivery|delivered vaginally|\bNVD\b|\bFTND\b|\bPTVD\b|\bSVD\b|episiotomy|(vacuum|forceps|instrumental) (assisted )?delivery/i,
    scaffold: {
      indication: "Patient was admitted at [ … ] weeks in [ spontaneous / induced ] labour and delivered vaginally.",
      primaryDiagnosis: "G[ … ]P[ … ] — [ term / preterm ] vaginal delivery at [ … ] weeks [ ± episiotomy / tear ]",
      procedure: {
        name: "[ Normal / vacuum / forceps ] vaginal delivery [ with episiotomy / … degree tear, repaired ]",
        anaesthesia: "[ local infiltration / epidural / nil ]",
        findings: "[ baby — sex, weight, Apgar; placenta complete; blood loss ]",
        drains: "",
        complications: "Nil",
        outcome: "[ Live baby, … kg; mother stable ]",
      },
      clinicalCourse:
        "Delivered on [ date ] at [ time ]; [ episiotomy / tear ] repaired. Postpartum course uneventful — afebrile, uterus involuting, lochia normal, passing urine, perineum healthy. Breastfeeding established. Baby [ with mother ].",
      medications: [M.ifa, M.calcium, M.paracetamolSos, { ...M.lactulose, indication: "if episiotomy or tear — keep stools soft" }],
      advice: adv([
        { module: "Perineal care", text: "Wash the perineum with clean water after passing urine and stool, and change pads often. Sitz baths help with pain." },
        BREASTFEEDING,
        DIET,
        ANTI_D,
        CONTRACEPTION,
        BABY,
        OPD("at 6 weeks, or earlier if a problem"),
      ]),
      redFlags: RF_POSTNATAL,
      patientActions: ["Postnatal check at 6 weeks.", "Get the baby's vaccines given as per the card."],
      primaryCareActions: ["Postnatal home visits as scheduled; check BP, bleeding, breastfeeding and mood."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Obstetric formula, LMP, EDD, gestation; booking and antenatal course; onset of labour, leaking, bleeding, fetal movements; medical disorders; blood group. Examination: vitals, fundal height, lie, presentation, fetal heart, contractions, per-vaginum. Baseline: CBC, blood group, urine, viral markers.",
    progressNote:
      "Each day — vitals, uterine involution, lochia, perineum, voiding, breastfeeding, mood. For discharge — afebrile, stable, voiding, perineum healthy, breastfeeding established.",
  },

  // ---- Antenatal admission discharged undelivered (last: the catch-all for undelivered stays) ----
  {
    key: "obg_antenatal",
    label: "Antenatal admission — discharged undelivered",
    match: /hyperemesis|preterm labou?r|threatened (preterm|abortion|miscarriage)|false labou?r|antepartum|\bAPH\b|placenta pr(a)?evia|reduced fetal movements?|undelivered|antenatal|pre-?eclampsia|gestational hypertension|\bPIH\b/i,
    scaffold: {
      indication: "Patient was admitted at [ … ] weeks with [ hyperemesis / threatened preterm labour / … ] and is discharged undelivered after the condition settled.",
      primaryDiagnosis: "G[ … ]P[ … ] at [ … ] weeks — [ condition ], undelivered",
      procedure: {
        name: "[ Nil / antenatal corticosteroids given on … ]",
        anaesthesia: "",
        findings: "[ USG — fetal growth, liquor, placenta; relevant labs ]",
        drains: "",
        complications: "Nil",
        outcome: "Condition settled; pregnancy continuing.",
      },
      clinicalCourse:
        "Admitted on [ date ] at [ … ] weeks with [ … ]. Managed with [ … ]. [ Antenatal corticosteroids given on … ]. Symptoms settled; fetal wellbeing reassuring [ USG / NST ]. Tolerating orals and fit for discharge on [ date ].",
      medications: [
        { ...M.ifa, status: "continue", duration: "through pregnancy" },
        { ...M.calcium, status: "continue", duration: "through pregnancy" },
        { generic: "Doxylamine + pyridoxine", strength: "10 mg + 10 mg", dose: "[ … ] tablets", route: "PO", frequency: "HS", indication: "if hyperemesis", status: "new" },
        { generic: "Ondansetron", strength: "4 mg", route: "PO", frequency: "SOS for vomiting", indication: "if hyperemesis", status: "prn" },
        { ...M.labetalol, indication: "if hypertensive" },
        { generic: "Aspirin", strength: "150 mg", route: "PO", frequency: "HS", duration: "[ until … weeks ]", indication: "if started for pre-eclampsia prevention", status: "continue" },
      ],
      advice: adv([
        { module: "Diet", text: "[ Small, frequent, dry meals and plenty of fluids (hyperemesis) / normal diet ]. Take the iron and calcium tablets at different times." },
        { module: "Fetal movements", text: "Count the baby's movements every day; come in the same day if they reduce." },
        ANTI_D,
        OPD("on [ … ] for the next antenatal visit"),
      ]),
      redFlags: [
        "Bleeding or leaking of water from the vagina",
        "Regular painful tightenings of the abdomen",
        "Baby moving less than usual",
        "Severe headache, blurred vision, upper abdominal pain, or a fit",
        "Unable to keep any food or water down, or passing very little urine",
        "Fever",
      ],
      patientActions: ["Attend the antenatal OPD on [ … ].", "Get [ … ] done before the next visit."],
      primaryCareActions: ["Routine antenatal care; check BP and urine at each visit."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Obstetric formula, LMP, EDD, gestation; booking status and antenatal course; the presenting complaint — vomiting with ketosis, pain, tightenings, leaking, bleeding, fetal movements, BP symptoms; previous preterm birth; medical disorders; blood group. Examination: vitals, hydration, fundal height, lie, presentation, fetal heart, per-speculum where relevant. Baseline: CBC, urine (ketones, culture), electrolytes, USG, NST.",
    progressNote:
      "Each day — symptoms, vitals, intake and output, fetal heart and movements, contractions, the day's plan. For discharge — symptoms settled, fetal wellbeing reassuring, oral intake adequate, next antenatal visit fixed.",
  },
];
