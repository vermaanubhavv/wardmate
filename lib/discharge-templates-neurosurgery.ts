import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * NEUROSURGERY discharge templates. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Same rules as the general-surgery set in lib/discharge-templates.ts: what is written here
 * prints as written unless the resident changes it, and every patient-specific blank is a
 * visible `[ … ]`, never a guess.
 *
 * Medication lines are PRE-FILLED on the product owner's direction — a STARTING SET for an adult
 * in an Indian teaching-hospital ward, to be checked against each patient. The antiepileptic
 * dose and stop date, the steroid taper, and when to restart an antiplatelet / anticoagulant are
 * patient-specific and are left as `[ … ]`. The myelomeningocele (infant) template and the VP
 * shunt template (often a child) carry NO fixed numeric dose — "[ per kg — as charted ]".
 *
 * `match` is tried against the typed procedure + diagnosis text; first match wins
 * (lib/specialty/discharge.ts), so the array is ordered specific-before-general.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for headache / pain", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "2 weeks", status: "new" } as TemplateMedication,
  levetiracetam: { generic: "Levetiracetam", strength: "[ dose as charted ]", route: "PO", frequency: "BD", duration: "[ … — stop date per neurosurgeon ]", indication: "seizure prophylaxis / control — do not stop on your own", status: "new" } as TemplateMedication,
  lactulose: { generic: "Lactulose", dose: "15 ml", route: "PO", frequency: "HS", duration: "2 weeks", indication: "keep stools soft, avoid straining", status: "new" } as TemplateMedication,
  tramadol: { generic: "Tramadol", strength: "50 mg", route: "PO", frequency: "SOS for severe pain", duration: "5 days", status: "prn" } as TemplateMedication,
  pregabalin: { generic: "Pregabalin", strength: "75 mg", route: "PO", frequency: "HS", duration: "4 weeks", indication: "neuropathic pain", status: "new" } as TemplateMedication,
  methylcobalamin: { generic: "Methylcobalamin", strength: "1500 mcg", route: "PO", frequency: "OD", duration: "4 weeks", status: "new" } as TemplateMedication,
  antithrombotic: { generic: "[ Antiplatelet / anticoagulant the patient was taking ]", status: "stopped", indication: "withheld — restart only when the neurosurgeon advises, on [ date ]" } as TemplateMedication,
};

const RF_HEAD = [
  "Worsening or severe headache, or repeated vomiting",
  "Increasing drowsiness, confusion, or difficulty waking up",
  "A fit (seizure)",
  "New weakness or numbness of an arm or leg, slurred speech, or blurred / double vision",
];
const RF_WOUND = [
  "Persistent or high fever, or neck stiffness",
  "Redness, swelling or discharge at the wound, or clear fluid leaking from the wound, nose or ear",
];
const RF_SPINE = [
  "New or worsening weakness or numbness in the arms or legs",
  "Loss of control of urine or stool, or numbness around the back passage",
];

const OPD = "Attend the Neurosurgery OPD after [ 7–10 days ] for a wound review and suture / staple removal.";
const AED_ADVICE = { module: "Medication instructions", text: "Take the fit-prevention tablet every day at the same time; never stop it suddenly. Do not drive, swim alone, climb heights or operate machinery until the neurosurgeon clears you." };
const HEAD_ACTIVITY = { module: "Activity restrictions", text: "Rest at home; increase activity gradually. No alcohol. No driving until cleared. Avoid straining, bending with the head down and heavy lifting for 6 weeks." };
const HEAD_WOUND = { module: "Wound care", text: "Keep the wound clean and dry. Do not wash the hair over the wound until the sutures are out; then wash gently with mild shampoo." };
const WATCHER = { module: "Activity restrictions", text: "A responsible adult should stay with the patient for the first 48–72 hours at home and watch for the warning signs below." };

// --- the eight -------------------------------------------------------------------------

export const NEUROSURGERY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Myelomeningocele repair (infant — NO numeric doses) ----
  {
    key: "ns_myelomeningocele",
    label: "Myelomeningocele repair (infant)",
    match: /myelomeningocele|meningomyelocele|meningocele|\bMMC\b|spina bifida|neural tube defect|\bNTD\b/i,
    scaffold: {
      indication:
        "Baby was admitted [ on day __ of life ] with a [ lumbosacral ] myelomeningocele [ intact / leaking ] for surgical repair [ with hydrocephalus ].",
      primaryDiagnosis: "[ Lumbosacral / thoracolumbar ] myelomeningocele [ ruptured / intact ] [ + hydrocephalus / Chiari II ] — lower-limb function [ … ]",
      procedure: {
        name: "Repair of myelomeningocele [ + VP shunt / ETV ]",
        anaesthesia: "General anaesthesia",
        findings: "[ sac size; placode; neural tissue; dural closure; skin closure / flap ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Repair completed.",
      },
      clinicalCourse:
        "Baby was nursed prone and the sac kept moist before repair on [date]. Postoperatively the wound [ healed well ]; head circumference was measured daily [ __ cm → __ cm ] and the anterior fontanelle remained [ soft / tense ]. [ A VP shunt was placed on __ for hydrocephalus. ] Feeding is established [ breastfeeding ]. Lower-limb movement is [ … ]; bladder [ dribbling / retaining — CIC taught ]. Baby is afebrile and feeding well at discharge.",
      medications: [
        { generic: "Paracetamol", strength: "[ per kg — as charted ]", route: "PO", frequency: "[ as charted ]", indication: "SOS for pain / fever", status: "prn" },
        { generic: "[ Antibiotic, if indicated ]", strength: "[ per kg — as charted ]", route: "PO", frequency: "[ as charted ]", duration: "[ … ]", indication: "[ per culture / urine prophylaxis if advised ]", status: "new" },
        { generic: "Folic acid (for the mother's next pregnancy)", strength: "[ as advised ]", route: "PO", frequency: "OD", indication: "start before the next conception — counselling given", status: "new" },
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the back wound clean and dry and away from urine and stool — nurse the baby on the side or tummy, with the nappy folded below the wound." },
        { module: "Catheter care", text: "[ Clean intermittent catheterisation every __ hours as taught, with clean hands and a clean catheter. ]" },
        { module: "Physiotherapy", text: "Move the legs through the exercises taught; protect numb skin from heat, pressure and injury; check the feet and skin every day." },
        { module: "Diet", text: "Continue breastfeeding on demand." },
        { module: "Medication instructions", text: "Measure the head size at every visit. The mother should take folic acid before and during any future pregnancy — it lowers the risk of this happening again." },
      ]),
      redFlags: [
        "Fever, poor feeding or excessive sleepiness",
        "Vomiting, a bulging soft spot, the head growing fast, or the eyes looking downward (sunset eyes)",
        "Leakage of clear fluid or pus from the back wound, or the wound opening",
        "A fit, high-pitched cry, or noisy breathing / pauses in breathing",
        "Foul-smelling or cloudy urine, or no wet nappies",
      ],
      patientActions: [
        "Attend the Neurosurgery OPD after [ 1 week ] for a wound review and head-circumference measurement.",
        "Get a cranial ultrasound at [ … ] as advised.",
        "Attend the paediatric, urology and physiotherapy clinics as scheduled.",
      ],
      primaryCareActions: [
        "Measure and chart head circumference at every visit; refer if crossing centiles or the fontanelle is tense.",
        "Complete immunisations on schedule.",
        "Support CIC and early developmental follow-up.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Antenatal scans and folic-acid intake; gestation, birth weight, mode of delivery, APGAR; time since birth; whether the sac is intact or leaking; leg movement and posture; passage of urine and meconium, dribbling; feeding; previous sibling with a neural tube defect. Examination: sac size, site, epithelialisation, CSF leak; head circumference, fontanelle, sutures; lower-limb power and reflexes, deformities (clubfoot, hip dislocation); anal tone and wink; bladder; other anomalies. Baseline: cranial USG, spine USG / MRI, CBC, renal USG, blood group.",
    progressNote:
      "Each day — temperature; feeding; head circumference and fontanelle; wound (CSF leak, soiling); leg movement; urine output and bladder emptying. Discharge day — wound healing, head size stable, feeding well; CIC taught if needed; follow-up fixed.",
  },

  // ---- Burr-hole evacuation of chronic SDH (before the craniotomy template) ----
  {
    key: "ns_chronic_sdh_burrhole",
    label: "Burr-hole drainage — chronic SDH",
    match: /chronic (subdural|SDH)|\bCSDH\b|burr[- ]?holes?|twist[- ]drill/i,
    scaffold: {
      indication:
        "Patient was admitted with [ headache / confusion / limb weakness / falls ] over [ __ weeks ] with CT showing a [ right / left / bilateral ] chronic subdural haematoma with mass effect, requiring evacuation.",
      primaryDiagnosis: "[ Right / left / bilateral ] chronic subdural haematoma [ thickness __ mm; midline shift __ mm ]",
      procedure: {
        name: "[ Single / double ] burr-hole evacuation and irrigation of chronic SDH [ + subdural drain ]",
        anaesthesia: "[ Local with sedation / general ] anaesthesia",
        findings: "[ motor-oil fluid under pressure; brain re-expansion ]",
        drains: "[ Subdural drain — removed on POD __ ]",
        complications: "Nil",
        outcome: "Haematoma evacuated.",
      },
      clinicalCourse:
        "Admitted with [presentation]; [ antiplatelet / anticoagulant was stopped and reversed ]. Underwent burr-hole evacuation on [date]. Nursed flat [ for 24–48 hours ] with the drain, which was removed on POD [ __ ]. Neurology improved [ GCS __ → __; power __ ]. [ Post-op CT: … ] The patient is alert, oriented and walking [ with support ] at discharge.",
      medications: [M.paracetamol, M.pantoprazole, { ...M.levetiracetam, indication: "[ only if started / seizures ] — do not stop on your own" }, M.lactulose, M.antithrombotic],
      advice: adv([HEAD_WOUND, HEAD_ACTIVITY, WATCHER, { module: "Mobilisation", text: "Walk with support at first; make the home safe against falls." }]),
      redFlags: RF_HEAD.concat(RF_WOUND, ["A fall or a new head injury"]),
      patientActions: [
        OPD,
        "Get a repeat CT head at [ 4–6 weeks ] and bring it to the OPD.",
        "Do NOT restart blood thinners / antiplatelets until the neurosurgeon advises.",
      ],
      primaryCareActions: [
        "Falls-risk review.",
        "Review the need for the antithrombotic with the neurosurgeon before restarting.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Headache, confusion, memory change, gait disturbance, limb weakness, falls; trivial head injury weeks earlier; antiplatelets, anticoagulants; alcohol; liver disease; baseline function. Examination: GCS, orientation, pupils, focal deficit, pronator drift, gait, signs of other injuries. Baseline: NCCT head, CBC, coagulation (PT/INR), platelets, renal function, electrolytes, blood sugar.",
    progressNote:
      "Each day — GCS and orientation; pupils; limb power; headache; drain output; position (flat); sodium; seizure watch. Discharge day — drain out, neurology improved or stable, mobilising; antithrombotic plan written.",
  },

  // ---- Craniotomy for tumour ----
  {
    key: "ns_craniotomy_tumour",
    label: "Craniotomy — brain tumour",
    match: /(brain|intracranial|cerebral|cerebellar|posterior fossa|intraventricular|frontal|temporal|parietal|occipital) (tumou?r|mass|lesion|SOL)|space[- ]occupying lesion|\bSOL\b|glioma|glioblastoma|\bGBM\b|astrocytoma|oligodendroglioma|meningioma|schwannoma|acoustic neuroma|vestibular|craniopharyngioma|pituitary (adenoma|macroadenoma|tumou?r)|medulloblastoma|ependymoma|(brain|cerebral) metasta|excision of (the )?(tumou?r|lesion)|craniotomy[^.]*tumou?r|tumou?r[^.]*craniotomy|tumou?r excision|decompression of tumou?r|transsphenoidal/i,
    scaffold: {
      indication:
        "Patient was admitted with [ headache / seizures / focal deficit / visual loss ] with imaging showing a [ site ] [ lesion ], for surgical excision.",
      primaryDiagnosis: "[ Site ] [ lesion — provisional: meningioma / glioma / metastasis ] — histopathology [ awaited ]",
      procedure: {
        name: "[ Right / left ] [ site ] craniotomy and [ gross-total / near-total / subtotal ] excision of [ lesion ] [ / transsphenoidal excision ]",
        anaesthesia: "General anaesthesia",
        findings: "[ tumour consistency, vascularity, plane; extent of resection; bone flap replaced ]",
        drains: "[ subgaleal drain / nil ]",
        complications: "Nil",
        outcome: "Excision completed; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Pre-operatively started on steroids and antiepileptics. Underwent [procedure] on [date]. Post-op CT showed [ no haematoma; extent of resection __ ]. Neurology is [ improved / unchanged / new deficit __ ]; [ no seizures ]. Steroids are being tapered. [ Sodium and urine output monitored — no DI / SIADH. ] The patient is alert, ambulant [ with support ] and eating at discharge.",
      medications: [
        { generic: "Dexamethasone", strength: "[ taper as charted ]", route: "PO", frequency: "[ … ]", duration: "[ taper over __ days, then stop ]", indication: "brain swelling — do not stop suddenly", status: "new" },
        { ...M.pantoprazole, duration: "while on steroid" },
        M.levetiracetam,
        M.paracetamol,
        M.lactulose,
        { generic: "[ Hydrocortisone / thyroxine / desmopressin ]", strength: "[ … ]", indication: "[ after pituitary surgery — per endocrine plan ]", status: "new" },
      ],
      advice: adv([
        HEAD_WOUND,
        AED_ADVICE,
        { module: "Medication instructions", text: "Take the steroid tablets in the reducing dose exactly as written, after food. Check blood sugar during the steroid course if diabetic." },
        HEAD_ACTIVITY,
        { module: "Physiotherapy", text: "[ Continue the limb / speech exercises taught. ]" },
      ]),
      redFlags: RF_HEAD.concat(RF_WOUND, ["Excessive thirst and passing large amounts of urine (after pituitary surgery)"]),
      patientActions: [
        OPD,
        "Collect the histopathology report and attend the neuro-oncology / tumour board clinic with it to decide radiotherapy / chemotherapy.",
        "Get an MRI brain at [ … ] as advised.",
      ],
      primaryCareActions: [
        "Monitor blood sugar and blood pressure on steroids.",
        "Support adherence to the antiepileptic and steroid taper.",
        "Support attendance at oncology follow-up.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Headache (morning, with vomiting), seizures, focal weakness, speech, personality change, visual loss, hearing loss, hormonal symptoms (pituitary); duration and progression; primary cancer elsewhere, weight loss, smoking. Examination: GCS, higher functions, cranial nerves, fundus, visual fields and acuity, motor and sensory, cerebellar signs; breast, chest and nodes if metastasis suspected. Baseline: MRI brain with contrast, CT, CBC, electrolytes, blood sugar, coagulation; pituitary hormones and visual fields for sellar lesions; chest imaging.",
    progressNote:
      "Each day — GCS; pupils; limb power; speech; seizures; wound and drain; sodium and urine output (DI / SIADH); blood sugar on steroids; steroid dose today. Discharge day — neurologically stable, wound healthy, steroid taper written, histopathology follow-up fixed.",
  },

  // ---- Craniotomy for EDH / SDH (trauma) ----
  {
    key: "ns_craniotomy_trauma",
    label: "Craniotomy — EDH / acute SDH",
    match: /\bEDH\b|extradural|epidural ha?ematoma|\bA?SDH\b|acute subdural|subdural ha?ematoma|contusion (evacuation|excision)|craniotomy|craniectomy|evacuation of (the )?ha?ematoma|depressed (skull )?fracture elevation|elevation of depressed/i,
    scaffold: {
      indication:
        "Patient was admitted after [ mechanism of injury ] with head injury [ GCS __ ] and CT showing a [ right / left ] [ extradural / acute subdural ] haematoma with mass effect, requiring emergency evacuation.",
      primaryDiagnosis: "Traumatic brain injury — [ right / left ] [ site ] [ EDH / acute SDH ] [ + contusion / fracture ]; GCS at admission [ __ ]",
      procedure: {
        name: "[ Right / left ] [ site ] craniotomy [ / decompressive craniectomy ] and evacuation of [ EDH / SDH ]",
        anaesthesia: "General anaesthesia",
        findings: "[ haematoma volume; bleeding source; brain condition; bone flap replaced / stored in abdomen / bone bank ]",
        drains: "[ subgaleal / extradural drain — removed on POD __ ]",
        complications: "Nil",
        outcome: "Haematoma evacuated.",
      },
      clinicalCourse:
        "Received on [date] after [mechanism], GCS [ __ ]. Taken up for [procedure] on [date]. Postoperatively [ managed in the ICU / ventilated for __ days ]; post-op CT showed [ complete evacuation ]. GCS improved to [ __ ]; [ no seizures ]. The patient is [ conscious, oriented, ambulant with support ] and tolerating orals at discharge.",
      medications: [M.paracetamol, M.pantoprazole, M.levetiracetam, M.lactulose],
      advice: adv([
        HEAD_WOUND,
        AED_ADVICE,
        HEAD_ACTIVITY,
        WATCHER,
        { module: "Activity restrictions", text: "[ After craniectomy (bone flap removed): wear the protective helmet whenever out of bed; do not lie on the side of the bone defect. ]" },
      ]),
      redFlags: RF_HEAD.concat(RF_WOUND, ["The skin over the bone defect becoming very tense or very sunken (after craniectomy)"]),
      patientActions: [
        OPD,
        "Get a repeat CT head at [ … ] as advised.",
        "[ Attend for cranioplasty (bone-flap replacement) at [ 3 months ]. ]",
      ],
      primaryCareActions: [
        "Screen for post-traumatic headache, memory and mood problems.",
        "Support adherence to the antiepileptic.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Mechanism and time of injury; loss of consciousness and lucid interval; vomiting, seizures, ENT bleed or CSF leak; alcohol; helmet; antiplatelets / anticoagulants; other injuries (ATLS). Examination: GCS (E V M) with trend, pupils size and reaction, lateralising signs, scalp wound, signs of base-of-skull fracture, cervical spine, other injuries. Baseline: NCCT head (and cervical spine as indicated), CBC, coagulation, blood group and cross-match, blood sugar, electrolytes.",
    progressNote:
      "Each day — GCS; pupils; limb power; seizures; sodium; wound and drain; ICP / ventilation if in the ICU; chest; feeding. Discharge day — GCS 15 or at plateau, mobilising, eating, wound healthy; antiepileptic plan written.",
  },

  // ---- VP shunt (often a child — no fixed adult doses) ----
  {
    key: "ns_vp_shunt",
    label: "VP shunt — hydrocephalus",
    match: /\bVP shunt|\bVPS\b|ventriculo-?peritoneal|hydrocephalus|\bETV\b|endoscopic third ventriculostomy|shunt (revision|malfunction|block)/i,
    scaffold: {
      indication:
        "Patient was admitted with [ headache, vomiting, gait disturbance / increasing head size ] due to [ obstructive / communicating ] hydrocephalus [ cause ], for a ventriculoperitoneal shunt.",
      primaryDiagnosis: "[ Obstructive / communicating ] hydrocephalus secondary to [ … ]",
      procedure: {
        name: "[ Right / left ] [ Kaufmann / Frazier ] point VP shunt [ medium-pressure chamber ] [ / ETV / shunt revision ]",
        anaesthesia: "General anaesthesia",
        findings: "[ CSF opening pressure and appearance; CSF sent for analysis ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Shunt placed and functioning.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Postoperatively symptoms improved [ headache settled / fontanelle soft / head circumference __ cm ]; the shunt chamber refilled well [ post-op CT: catheter tip position, ventricle size ]. Abdomen soft, feeding / eating well. The patient is afebrile and at neurological baseline at discharge.",
      medications: [
        { generic: "Paracetamol", strength: "[ 650 mg (adult) / per kg — as charted (child) ]", route: "PO", frequency: "SOS for pain", status: "prn" },
        { ...M.pantoprazole, duration: "5 days", indication: "[ adult ]" },
        { ...M.lactulose, dose: "[ 15 ml (adult) / per kg — as charted (child) ]" },
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the head and abdominal wounds clean and dry; do not press on the shunt valve unless told to." },
        { module: "Activity restrictions", text: "Normal activity is allowed; avoid contact sports and blows to the head. Carry this summary — tell every doctor there is a shunt (MRI may need a valve check)." },
        { module: "Diet", text: "[ Normal diet / continue breastfeeding ]." },
      ]),
      redFlags: [
        "Headache, vomiting, drowsiness or irritability — the symptoms that were there before the shunt",
        "In a baby: a bulging soft spot, the head growing fast, or the eyes looking downward",
        "Fever, redness or swelling along the shunt track, or at the wounds",
        "Abdominal pain or swelling",
        "A fit",
      ],
      patientActions: [
        OPD,
        "Get a CT head / cranial ultrasound at [ … ] as advised.",
        "The shunt stays for life — come straight to the emergency department with any warning sign.",
      ],
      primaryCareActions: ["Measure head circumference in infants at each visit.", "Refer urgently with any sign of shunt block or infection."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Headache (morning, with vomiting), visual blurring, gait, cognition, urinary incontinence (NPH triad); in infants — head growth, irritability, feeding, fontanelle, sunset eyes; cause — tumour, TBM, IVH, previous meningitis, MMC; previous shunts. Examination: GCS, fundus (papilloedema), sixth-nerve palsy, head circumference, fontanelle, gait; abdomen (previous surgery, peritonitis). Baseline: CT / MRI brain, CSF analysis if infection suspected, CBC, electrolytes, abdominal USG if revision.",
    progressNote:
      "Each day — GCS; headache / vomiting; pupils; head circumference and fontanelle (infant); shunt chamber refill; wounds; abdomen; temperature. Discharge day — symptoms resolved, wounds healthy, afebrile, eating.",
  },

  // ---- Spinal fixation for spine injury ----
  {
    key: "ns_spine_fixation",
    label: "Spinal fixation — spine injury",
    match: /spin(e|al) (injury|trauma|fracture)|spinal cord injury|\bSCI\b|(vertebral|vertebra|burst|wedge|compression|odontoid|hangman|jefferson) fracture|fracture[^.]{0,30}\b[CDTL]\d{1,2}\b|fracture[- ]dislocation|pedicle screw|spinal fixation|(posterior|anterior) (stabili[sz]ation|fixation)|lateral mass|paraplegi|quadriplegi|tetraplegi|paraparesis|quadriparesis/i,
    scaffold: {
      indication:
        "Patient was admitted after [ mechanism of injury ] with [ back / neck pain ] [ and weakness of the limbs ] due to a [ level ] [ fracture / fracture-dislocation ], requiring spinal stabilisation.",
      primaryDiagnosis: "[ Level ] [ burst / fracture-dislocation ] — ASIA [ A / B / C / D / E ], neurological level [ __ ]",
      procedure: {
        name: "[ Posterior pedicle-screw fixation (levels) / anterior cervical corpectomy and fusion / lateral-mass fixation ] [ + decompression ]",
        anaesthesia: "General anaesthesia",
        findings: "[ injury pattern; cord / dura; construct and levels ]",
        drains: "[ suction drain — removed on POD __ ]",
        complications: "Nil",
        outcome: "Stabilisation completed; check X-ray satisfactory.",
      },
      clinicalCourse:
        "Received after [mechanism] on [date], ASIA [ __ ]. Underwent [procedure] on [date]. Postoperatively neurology is [ unchanged / improved — ASIA __ ]. Mobilised [ in a brace / wheelchair ] under physiotherapy. Bladder [ voiding / on CIC / indwelling catheter ]; bowel [ regimen established ]; pressure areas [ intact ]. The patient is afebrile at discharge.",
      medications: [
        M.paracetamol,
        M.tramadol,
        M.pantoprazole,
        M.pregabalin,
        { ...M.lactulose, duration: "continue", indication: "bowel regimen" },
        { generic: "Bisacodyl", strength: "10 mg", route: "PR", frequency: "[ alternate days ]", indication: "[ bowel regimen if cord injury ]", status: "new" },
        { generic: "Enoxaparin", strength: "40 mg", route: "SC", frequency: "OD", duration: "[ … weeks ]", indication: "[ if paralysed / immobile — dose per renal function ]", status: "new" },
      ],
      advice: adv([
        { module: "Mobilisation", text: "[ Wear the brace / collar whenever up. ] Get in and out of bed by log-rolling as taught." },
        { module: "Activity restrictions", text: "Change position every 2 hours; check the skin over the back, hips and heels daily; use the air mattress / cushion. Avoid hot-water bottles on numb skin." },
        { module: "Catheter care", text: "[ Clean intermittent catheterisation every __ hours as taught / keep the catheter bag below the bladder and change the catheter every __ weeks. ]" },
        { module: "Physiotherapy", text: "Do the limb, breathing and transfer exercises every day; continue rehabilitation." },
        { module: "Lifting restrictions", text: "No lifting, bending or twisting for 3 months." },
        { module: "Wound care", text: "Keep the wound clean and dry." },
      ]),
      redFlags: [
        ...RF_SPINE,
        "Fever, or wound redness, swelling or discharge",
        "A red or broken area of skin (pressure sore)",
        "Cloudy or foul urine, or fever with chills",
        "Sudden severe headache, sweating and a pounding heart with a blocked catheter or constipation (in high cord injury)",
        "Calf swelling, or breathlessness",
      ],
      patientActions: [OPD, "Get a check X-ray of the spine at [ 6 weeks ].", "Attend physical-medicine / rehabilitation as scheduled."],
      primaryCareActions: [
        "Pressure-area, bladder and bowel review at each visit.",
        "Treat UTI per culture.",
        "Screen for depression; link to disability certification and rehabilitation.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Mechanism and time of injury; neck / back pain; weakness, numbness, paraesthesia; bladder and bowel function; priapism; breathing difficulty; other injuries; previous function. Examination: log-roll, spinal tenderness and step, full ASIA chart (motor, light touch, pin-prick, sacral sparing, anal tone, bulbocavernosus reflex), respiratory function, neurogenic shock. Baseline: X-ray and CT of the spine, MRI for cord and ligaments, CBC, blood group, renal function, ABG if cervical.",
    progressNote:
      "Each day — ASIA motor and sensory score; respiratory function (cervical); bladder method and residue; bowel movement; pressure areas; wound and drain; DVT prophylaxis; mobilisation. Discharge day — neurology documented, bladder and bowel routine established, carers trained, rehabilitation arranged.",
  },

  // ---- Lumbar / cervical decompression ----
  {
    key: "ns_spine_decompression",
    label: "Lumbar / cervical decompression",
    match: /laminectomy|laminoplasty|laminotomy|discectomy|microdiscectomy|\bACDF\b|anterior cervical|corpectomy|foraminotomy|fenestration|decompression|\bPIVD\b|disc prolapse|prolapsed (intervertebral )?disc|canal stenosis|\bLCS\b|\bCSM\b|cervical spondylotic|myelopathy|radiculopathy|\bTLIF\b|\bPLIF\b|spondylolisthesis/i,
    scaffold: {
      indication:
        "Patient was admitted with [ radicular pain / neurogenic claudication / myelopathy ] due to [ PIVD / canal stenosis / cervical spondylotic myelopathy ] at [ level ], not responding to conservative treatment, requiring decompression.",
      primaryDiagnosis: "[ Lumbar PIVD L__–L__ / lumbar canal stenosis / cervical spondylotic myelopathy C__–C__ ] [ with radiculopathy / myelopathy ]",
      procedure: {
        name: "[ Microdiscectomy / laminectomy / ACDF / cervical laminoplasty ] at [ level ] [ + fusion ]",
        anaesthesia: "General anaesthesia",
        findings: "[ disc / ligamentum / osteophyte compressing __; dural tear (nil); implant ]",
        drains: "[ suction drain / nil ]",
        complications: "Nil",
        outcome: "Decompression completed.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Postoperatively [ radicular pain resolved / neurology improved — power __, Nurick / mJOA __ ]; bladder and bowel function normal; [ no dysphagia / hoarseness after anterior cervical surgery ]. Mobilised from POD [ __ ] [ with a collar / lumbar belt ]. The patient is comfortable and walking independently at discharge.",
      medications: [M.paracetamol, M.tramadol, M.pantoprazole, M.pregabalin, M.methylcobalamin, M.lactulose],
      advice: adv([
        { module: "Mobilisation", text: "Walk every day, increasing the distance gradually. [ Wear the cervical collar / lumbar belt when up for __ weeks. ]" },
        { module: "Activity restrictions", text: "No forward bending, twisting or long drives for 6 weeks. [ Cervical: avoid looking up for long and sleeping without neck support. ]" },
        { module: "Lifting restrictions", text: "No lifting over 5 kg for 6 weeks." },
        { module: "Physiotherapy", text: "Begin the strengthening exercises taught at [ 4–6 weeks ]." },
        { module: "Wound care", text: "Keep the wound clean and dry." },
      ]),
      redFlags: [
        ...RF_SPINE,
        "Fever, or wound redness, swelling or discharge",
        "Clear fluid leaking from the wound, or headache on sitting up",
        "Difficulty swallowing or breathing, or neck swelling (after front-of-neck surgery)",
      ],
      patientActions: [OPD, "Attend physiotherapy at [ 4–6 weeks ].", "[ Check X-ray at 6 weeks if fused. ]"],
      primaryCareActions: ["Refer back urgently with any new weakness or bladder / bowel disturbance."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Neck / back pain versus limb pain, dermatome; numbness, weakness; hand clumsiness, gait imbalance (myelopathy); bladder and bowel, saddle anaesthesia; claudication distance; conservative treatment tried; red flags (fever, weight loss, cancer, TB). Examination: posture, tenderness, SLR / femoral stretch, Spurling, dermatomal sensation, myotomal power, reflexes, Hoffmann, Babinski, clonus, tandem gait, perianal sensation and anal tone. Baseline: MRI of the spine, X-rays with flexion-extension views, pre-anaesthetic workup.",
    progressNote:
      "Each day — limb pain versus before; power and sensation; bladder / bowel; wound and drain; swallowing and voice (anterior cervical); mobilisation. Discharge day — walking, neurology stable or better, wound dry.",
  },

  // ---- Traumatic brain injury — conservative (last: most generic head-injury wording) ----
  {
    key: "ns_tbi_conservative",
    label: "Traumatic brain injury — conservative",
    match: /head injury|\bTBI\b|traumatic brain|brain injury|cerebral contusion|\bcontusions?\b|concussion|diffuse axonal|\bDAI\b|traumatic (SAH|subarachnoid)|\btSAH\b|skull fracture|fracture (of the )?skull|pneumocephalus/i,
    scaffold: {
      indication:
        "Patient was admitted after [ mechanism of injury ] with head injury [ GCS __ ] [ with loss of consciousness / vomiting / seizure ] and CT findings of [ contusion / small SDH / tSAH / fracture ] not requiring surgery, for observation.",
      primaryDiagnosis: "[ Mild / moderate / severe ] traumatic brain injury — [ CT findings ]; GCS at admission [ __ ]",
      procedure: {
        name: "[ Conservative management — no operation ] [ / scalp wound suturing ]",
        anaesthesia: "[ Local, if sutured ]",
        findings: "[ repeat CT on __: stable / resolving ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Managed conservatively.",
      },
      clinicalCourse:
        "Received on [date] after [mechanism], GCS [ __ ]. Managed with neuro-observation, head-end elevation, analgesia, antiemetics [ and antiepileptic prophylaxis ]. Repeat CT on [date] showed [ no progression ]. GCS improved to [ 15/15 ]; no new deficit; tolerating orals. The patient is conscious, oriented and ambulant at discharge.",
      medications: [
        { ...M.paracetamol, frequency: "TDS / SOS for headache" },
        M.pantoprazole,
        { ...M.levetiracetam, indication: "[ if started — seizure prophylaxis, usually 7 days / longer if a seizure occurred ] — do not stop on your own" },
        { generic: "Ondansetron", strength: "4 mg", route: "PO", frequency: "SOS for vomiting", status: "prn" },
      ],
      advice: adv([
        WATCHER,
        HEAD_ACTIVITY,
        { module: "Activity restrictions", text: "Rest the brain for a few days: limit screens and reading if they bring on headache, then return gradually to study / work. No contact sport until cleared." },
        { module: "Medication instructions", text: "Avoid sleeping tablets and alcohol. Use only the pain-killer prescribed." },
      ]),
      redFlags: RF_HEAD.concat(["Clear fluid or blood from the nose or ear", "Unusual behaviour or irritability"]),
      patientActions: [
        "Attend the Neurosurgery OPD after [ 1–2 weeks ].",
        "[ Suture removal on day 7 if the scalp was sutured. ]",
        "[ Repeat CT head at __ if advised. ]",
      ],
      primaryCareActions: ["Screen for post-concussion symptoms (headache, memory, mood, sleep)."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism and time of injury; loss of consciousness and duration; amnesia; vomiting; seizure; headache; ENT bleed or CSF leak; alcohol; helmet / seat belt; antiplatelets / anticoagulants; age over 65. Examination: GCS with trend, pupils, lateralising signs, scalp wounds, signs of base-of-skull fracture, cervical spine, other injuries. Baseline: NCCT head per CT head rules, cervical spine imaging as indicated, CBC, coagulation, blood sugar.",
    progressNote:
      "Each day — GCS hourly-to-4-hourly trend; pupils; headache; vomiting; seizures; limb power; sodium; repeat CT result. Discharge day — GCS 15 (or baseline), no deficit, tolerating orals, mobilising; carer briefed on warning signs.",
  },
];

/** When the typed diagnosis matches none of the eight. */
export const NEUROSURGERY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "ns_generic",
  label: "Neurosurgery — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presentation ] requiring [ inpatient management / investigation / surgery ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure name ]",
      anaesthesia: "[ General / local ]",
      findings: "[ significant operative findings ]",
      drains: "[ drains, if any ]",
      complications: "Nil",
      outcome: "Procedure completed successfully.",
    },
    clinicalCourse:
      "Admitted with [presentation], GCS [ __ ]. [Procedure] was performed on [date]. The postoperative period was [uneventful]; neurology is [ stable / improved ]. The patient is afebrile, alert and mobilising at discharge.",
    medications: [M.paracetamolSos, M.pantoprazole],
    advice: adv([HEAD_WOUND, HEAD_ACTIVITY]),
    redFlags: RF_HEAD.concat(RF_WOUND),
    patientActions: [OPD],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and progression; headache, vomiting, seizures, weakness, bladder and bowel; past medical and drug history (antiplatelets, anticoagulants); GCS, pupils, cranial nerves, motor and sensory examination; provisional diagnosis and plan. Baseline: CT / MRI as indicated, CBC, coagulation.",
  progressNote:
    "Each day — GCS; pupils; limb power; seizures; wound / drain; the day's plan. On readiness — neurologically stable, wound healthy, mobilising. For discharge with advice.",
};
