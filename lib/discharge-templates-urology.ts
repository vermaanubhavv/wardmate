import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * UROLOGY discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * Same rules as the general-surgery set in lib/discharge-templates.ts: what is written here
 * prints as written unless the resident changes it, and every patient-specific blank is a
 * visible `[ … ]`, never a guess.
 *
 * Medication lines are PRE-FILLED on the product owner's direction — a STARTING SET for an adult
 * in an Indian teaching-hospital ward, to be checked against each patient (allergy, renal
 * function, urine culture, what they were already taking). NSAIDs are deliberately left out
 * after nephrectomy (single kidney). Culture-directed antibiotics and stone-prevention doses
 * carry `[ … ]`.
 *
 * `match` is tried against the typed procedure + diagnosis text; first match wins
 * (lib/specialty/discharge.ts), so the array is ordered specific-before-general. "Stent" is
 * only ever matched as a DJ / double-J stent, so a cardiac stent in the history does not
 * pull a urology template.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", status: "prn" } as TemplateMedication,
  diclofenac: { generic: "Diclofenac", strength: "50 mg", route: "PO", frequency: "SOS for pain", duration: "5 days", indication: "avoid if renal impairment", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
  nitrofurantoin: { generic: "Nitrofurantoin", strength: "100 mg", route: "PO", frequency: "BD", duration: "5 days", indication: "[ or per urine culture ]; avoid if eGFR < 45", status: "new" } as TemplateMedication,
  cefixime: { generic: "Cefixime", strength: "200 mg", route: "PO", frequency: "BD", duration: "5 days", indication: "[ or per urine culture ]", status: "new" } as TemplateMedication,
  tamsulosin: { generic: "Tamsulosin", strength: "0.4 mg", route: "PO", frequency: "HS", status: "new" } as TemplateMedication,
  solifenacin: { generic: "Solifenacin", strength: "5 mg", route: "PO", frequency: "OD", indication: "stent / bladder-spasm discomfort", status: "new" } as TemplateMedication,
  oxybutynin: { generic: "Oxybutynin", strength: "5 mg", route: "PO", frequency: "SOS for bladder spasm", indication: "while the catheter is in", status: "prn" } as TemplateMedication,
  lactulose: { generic: "Lactulose", dose: "15 ml", route: "PO", frequency: "HS", duration: "2 weeks", indication: "keep stools soft, avoid straining", status: "new" } as TemplateMedication,
  potassiumCitrate: { generic: "Potassium citrate", strength: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "[ stone prevention — per stone analysis / urine pH; avoid if hyperkalaemia or renal failure ]", status: "new" } as TemplateMedication,
};

const RF_URINE = [
  "Fever with chills and rigors",
  "Inability to pass urine, or the catheter stops draining",
  "Heavy bleeding in the urine, or passing clots",
];
const HYDRATE = { module: "Diet", text: "Drink 2.5–3 litres of water a day (enough to keep the urine pale) unless told to restrict fluids." };
const STENT_DATE = "Attend on [ date ] for removal of the DJ stent. The stent MUST be removed or changed on time — a forgotten stent blocks and damages the kidney.";
const STENT_ADVICE = { module: "Activity restrictions", text: "A DJ stent is in place. Some urgency, frequency, pink urine and loin discomfort on passing urine are expected. It must be removed on the date given." };

// --- the nine --------------------------------------------------------------------------

export const UROLOGY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Radical / simple nephrectomy ----
  {
    key: "uro_nephrectomy",
    label: "Radical / simple nephrectomy",
    match: /nephrectomy|nephroureterectomy|renal (cell )?(carcinoma|mass|tumou?r)|\bRCC\b|non-?functioning kidney|\bNFK\b|pyonephrosis|xanthogranulomatous/i,
    scaffold: {
      indication:
        "Patient was admitted for [ radical / partial / simple ] nephrectomy for [ a (right / left) renal mass / a non-functioning (right / left) kidney due to __ ].",
      primaryDiagnosis: "[ Renal cell carcinoma (right / left) — cT_N_M_ / non-functioning (right / left) kidney secondary to __ ]",
      procedure: {
        name: "[ Open / laparoscopic ] [ radical / partial / simple ] nephrectomy [ + adrenalectomy / lymphadenectomy ]",
        anaesthesia: "General anaesthesia",
        findings: "[ tumour size and site; renal vein / IVC; nodes; adhesions; specimen ]",
        drains: "[ retroperitoneal drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Postoperatively urine output and serum creatinine were monitored [ creatinine __ → __ ]. Oral intake resumed on POD [ __ ]; drain and catheter removed on POD [ __ ]. The patient is afebrile, ambulant, tolerating a normal diet and voiding well at discharge.",
      medications: [
        M.paracetamol,
        { generic: "Tramadol", strength: "50 mg", route: "PO", frequency: "SOS for severe pain", duration: "5 days", status: "prn" },
        M.pantoprazole,
        M.lactulose,
        { generic: "Enoxaparin", strength: "40 mg", route: "SC", frequency: "OD", duration: "[ 28 days ]", indication: "[ after cancer surgery — dose per renal function ]", status: "new" },
      ],
      advice: adv([
        { module: "Medication instructions", text: "You now have one kidney. Avoid pain-killers of the NSAID group (diclofenac, ibuprofen, aceclofenac) and any medicine not prescribed by a doctor. Tell every doctor you have one kidney." },
        HYDRATE,
        { module: "Wound care", text: "Keep the wound clean and dry." },
        { module: "Lifting restrictions", text: "No lifting over 5 kg for 6 weeks." },
      ]),
      redFlags: [
        "Persistent or high fever",
        "Increasing redness, swelling or discharge at the wound",
        "Passing much less urine than usual, or swelling of the feet",
        "Worsening abdominal or flank pain or distension",
        "Calf pain or swelling, or breathlessness",
      ],
      patientActions: [
        "Attend the Urology OPD after [ 7–10 days ] for suture removal.",
        "Get serum creatinine checked at [ 2 weeks ] and bring the report.",
        "Collect the histopathology report and attend the uro-oncology clinic with it.",
      ],
      primaryCareActions: [
        "Monitor blood pressure and renal function; avoid nephrotoxic drugs.",
        "Support attendance at oncology follow-up.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Haematuria, flank pain, flank mass; weight loss, fever; varicocele of recent onset; bone pain or cough (metastases); history of stones, pyonephrosis or TB (non-functioning kidney); smoking; hypertension, diabetes. Examination: flank mass, varicocele, nodes, pedal oedema, blood pressure. Baseline: CECT abdomen, chest imaging, DTPA / DMSA split function, serum creatinine and eGFR, CBC, urine culture, pre-anaesthetic workup.",
    progressNote:
      "Each day — urine output; creatinine trend; drain output and character; bowel function and oral intake; wound; temperature. Discharge day — creatinine stable, drain and catheter out, voiding, eating.",
  },

  // ---- Pyeloplasty (checked before URS — it leaves a DJ stent) ----
  {
    key: "uro_pyeloplasty",
    label: "Pyeloplasty (PUJ obstruction)",
    match: /pyeloplasty|\bPUJO?\b|\bUPJO?\b|pelvi-?ureteric junction|ureteropelvic junction/i,
    scaffold: {
      indication:
        "Patient was admitted for [ open / laparoscopic ] pyeloplasty for [ right / left ] pelvi-ureteric junction obstruction with [ pain / reduced split function / infection ].",
      primaryDiagnosis: "[ Right / left ] PUJ obstruction [ + secondary calculi ] — split function [ __ % ]",
      procedure: {
        name: "[ Open / laparoscopic ] [ Anderson-Hynes dismembered ] pyeloplasty with DJ stenting",
        anaesthesia: "General anaesthesia",
        findings: "[ cause — intrinsic stenosis / crossing vessel; pelvis size; stones removed; stent size ]",
        drains: "[ perinephric drain ]",
        complications: "Nil",
        outcome: "Procedure completed; DJ stent in situ.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Drain output settled and the drain was removed on POD [ __ ]; the catheter was removed on POD [ __ ] and the patient voided well. The patient is afebrile, ambulant and eating normally at discharge with the DJ stent in situ.",
      medications: [M.paracetamol, M.diclofenac, M.pantoprazole, M.cefixime, { ...M.solifenacin, frequency: "SOS", status: "prn" }],
      advice: adv([STENT_ADVICE, HYDRATE, { module: "Wound care", text: "Keep the wound(s) clean and dry." }, { module: "Lifting restrictions", text: "No lifting over 5 kg for 4–6 weeks." }]),
      redFlags: [...RF_URINE, "Increasing loin pain or swelling", "Leakage of urine from the wound"],
      patientActions: [
        "Attend the Urology OPD after [ 7–10 days ] for suture removal.",
        STENT_DATE + " [ usually 4–6 weeks ]",
        "Get a renal scan (DTPA) / ultrasound at [ 3 months ] after stent removal.",
      ],
      primaryCareActions: ["Treat urinary infection promptly; confirm the stent-removal date is kept."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Loin pain (especially after large fluid intake), episodes of infection, haematuria, stones, loin mass; previous surgery; renal function. Examination: loin mass, tenderness, blood pressure. Baseline: USG KUB, CT urography, DTPA with diuretic renogram (split function, drainage), renal function, urine culture.",
    progressNote:
      "Each day — drain output; urine output and haematuria; temperature; wound. Discharge day — drain out, catheter out and voiding, afebrile; stent-removal date written.",
  },

  // ---- PCNL ----
  {
    key: "uro_pcnl",
    label: "PCNL (renal stone)",
    match: /\bPCNL\b|percutaneous nephrolithotomy|nephrolithotomy|staghorn/i,
    scaffold: {
      indication:
        "Patient was admitted for percutaneous nephrolithotomy for a [ __ mm / staghorn ] [ right / left ] renal calculus with [ pain / infection / obstruction ].",
      primaryDiagnosis: "[ Right / left ] renal calculus [ size, site — pelvic / calyceal / staghorn ]",
      procedure: {
        name: "[ Right / left ] [ standard / mini ] PCNL [ + DJ stenting / tubeless ]",
        anaesthesia: "General anaesthesia",
        findings: "[ access calyx; stone burden; clearance; residual fragments; stone sent for analysis ]",
        drains: "[ nephrostomy tube / tubeless ]",
        complications: "Nil",
        outcome: "Procedure completed; [ complete / near-complete ] clearance.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Postoperative haematuria settled; [ the nephrostomy was clamped and removed on POD __ ]; the catheter was removed and the patient voided well. Post-op X-ray KUB / USG showed [ no residual / __ mm residual ] stone. The patient is afebrile, comfortable and ambulant at discharge [ with a DJ stent in situ ].",
      medications: [M.paracetamol, M.diclofenac, M.pantoprazole, M.cefixime, { ...M.tamsulosin, duration: "until stent removal", indication: "stent discomfort" }, M.potassiumCitrate],
      advice: adv([
        STENT_ADVICE,
        HYDRATE,
        { module: "Diet", text: "Reduce salt, avoid excess meat and packaged foods; normal calcium intake — do not cut out milk products. [ Specific advice after stone analysis. ]" },
        { module: "Drain care", text: "[ Nephrostomy site: keep the dressing dry; a little leakage for 1–2 days is expected. ]" },
        { module: "Activity restrictions", text: "No strenuous activity or heavy lifting for 2 weeks." },
      ]),
      redFlags: [...RF_URINE, "Bleeding or persistent urine leak from the nephrostomy site", "Severe loin pain", "Breathlessness or chest pain"],
      patientActions: [
        "Attend the Urology OPD after [ 1 week ].",
        STENT_DATE,
        "Bring the stone-analysis report to follow-up.",
        "Get an ultrasound KUB at [ 3 months ].",
      ],
      primaryCareActions: ["Reinforce fluid intake; treat urinary infection early."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Loin pain, haematuria, fever and UTI episodes, passage of stones, previous stone surgery; diet, fluid intake, family history, gout, recurrent UTI; medicines (calcium, vitamin D). Examination: loin tenderness, mass. Baseline: NCCT KUB, urine culture, renal function, serum calcium and uric acid, coagulation, CBC.",
    progressNote:
      "Each day — haematuria grade; nephrostomy and catheter output; temperature (post-PCNL sepsis); haemoglobin; chest (supracostal access). Discharge day — urine clear, tubes out, afebrile; stent date written.",
  },

  // ---- URS / DJ stenting for ureteric stone ----
  {
    key: "uro_urs_dj",
    label: "URS / DJ stenting — ureteric stone",
    match: /\bURSL?\b|ureteroscop|\bRIRS\b|retrograde intrarenal|\bDJ\s*stent|\bDJS\b|double[- ]?j|ureteric (stone|calculus|calculi)|ureteral (stone|calculus)|(lower|upper|mid) ureteric calculus|laser lithotripsy|ureterolithotripsy/i,
    scaffold: {
      indication:
        "Patient was admitted with [ right / left ] renal colic due to a [ __ mm ] [ upper / mid / lower ] ureteric calculus [ with hydronephrosis / infection ] requiring ureteroscopic management.",
      primaryDiagnosis: "[ Right / left ] [ upper / mid / lower ] ureteric calculus [ __ mm ] [ with hydroureteronephrosis ]",
      procedure: {
        name: "[ Right / left ] [ semirigid URS / RIRS ] with [ laser / pneumatic ] lithotripsy + DJ stenting [ / DJ stenting alone ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ stone site and size; fragmentation; clearance; ureteric oedema; stent size ]",
        drains: "Per-urethral catheter (removed before discharge)",
        complications: "Nil",
        outcome: "Procedure completed; DJ stent in situ.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. The catheter was removed on POD [ __ ] and the patient voided well. Pain settled on oral analgesia. [ Post-op X-ray KUB: stent in position, no residual stone. ] The patient is afebrile and comfortable at discharge with the DJ stent in situ.",
      medications: [
        M.paracetamol,
        M.diclofenac,
        M.pantoprazole,
        M.nitrofurantoin,
        { ...M.tamsulosin, duration: "until stent removal", indication: "stent discomfort / fragment passage" },
        { ...M.solifenacin, frequency: "SOS", status: "prn" },
        M.potassiumCitrate,
      ],
      advice: adv([STENT_ADVICE, HYDRATE, { module: "Diet", text: "Reduce salt and excess meat; normal calcium intake. [ Specific advice after stone analysis. ]" }]),
      redFlags: [...RF_URINE, "Severe loin pain not settling with the pain-killers"],
      patientActions: [
        "Attend the Urology OPD after [ 1 week ].",
        STENT_DATE + " [ usually 2–4 weeks ]",
        "Bring the stone-analysis report to follow-up.",
      ],
      primaryCareActions: ["Reinforce fluid intake; confirm the stent-removal date is kept."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Colicky loin-to-groin pain, vomiting, haematuria, fever with rigors (infected obstructed kidney — an emergency), previous stones, single kidney, pregnancy in women. Examination: renal angle tenderness, temperature, blood pressure. Baseline: NCCT KUB, urine routine and culture, renal function, CBC, serum calcium and uric acid.",
    progressNote:
      "Each day — pain; temperature; haematuria; catheter out and voiding; renal function if obstructed. Discharge day — voiding, afebrile, pain controlled; stent-removal date written.",
  },

  // ---- TURBT ----
  {
    key: "uro_turbt",
    label: "TURBT (bladder tumour)",
    match: /\bTURBT\b|\bTURBt\b|transurethral resection of (the )?bladder|bladder (tumou?r|cancer|carcinoma|mass|growth)|urothelial carcinoma|carcinoma (of the )?bladder/i,
    scaffold: {
      indication:
        "Patient was admitted with [ painless haematuria ] and a bladder tumour on imaging / cystoscopy, for transurethral resection.",
      primaryDiagnosis: "Bladder tumour [ size, number, site ] — [ histology, grade, stage, muscle present — awaited ]",
      procedure: {
        name: "Cystoscopy and TURBT [ + single-dose intravesical mitomycin C ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ number, size, site, papillary / solid; resection complete; detrusor muscle sampled; bimanual examination ]",
        drains: "Three-way catheter with bladder irrigation (removed on POD [ __ ])",
        complications: "Nil",
        outcome: "Resection completed; chips sent for histopathology.",
      },
      clinicalCourse:
        "Underwent TURBT on [date] [ with a single post-operative instillation of intravesical chemotherapy ]. Bladder irrigation was stopped when the urine cleared on POD [ __ ], and the catheter was removed on POD [ __ ] with a successful void. The patient is afebrile, voiding clear urine and ambulant at discharge.",
      medications: [M.paracetamol, M.nitrofurantoin, M.lactulose, M.oxybutynin],
      advice: adv([
        HYDRATE,
        { module: "Activity restrictions", text: "Avoid heavy lifting, straining and sexual activity for 2–3 weeks; a little blood in the urine around day 10–14 (scab separation) is expected — drink more water." },
        { module: "Medication instructions", text: "Stop smoking — it is the main cause of bladder cancer and of it coming back." },
      ]),
      redFlags: RF_URINE,
      patientActions: [
        "Collect the histopathology report and attend the Urology OPD / uro-oncology clinic on [ date ] with it.",
        "[ Intravesical BCG / chemotherapy schedule to be decided on the histopathology. ]",
        "Attend for check cystoscopy at [ 3 months ].",
      ],
      primaryCareActions: ["Support smoking cessation.", "Refer back promptly with any new haematuria."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Painless haematuria, clots, retention; irritative symptoms; smoking; occupational dye / rubber exposure; previous bladder tumour and its histology; weight loss, bone pain. Examination: pallor, suprapubic mass, bimanual under anaesthesia, nodes. Baseline: USG KUB, CT urography, urine cytology, renal function, CBC, urine culture.",
    progressNote:
      "Each day — irrigation rate and urine colour; clots; haemoglobin; catheter; temperature. Discharge day — urine clear, catheter out and voiding; histopathology follow-up fixed.",
  },

  // ---- TURP ----
  {
    key: "uro_turp",
    label: "TURP (benign prostatic enlargement)",
    match: /\bTURP\b|transurethral resection of (the )?prostate|\bHoLEP\b|\bTUIP\b|\bThuLEP\b|laser (enucleation|vaporisation) of (the )?prostate|(simple|open|millin'?s?|transvesical) prostatectomy/i,
    scaffold: {
      indication:
        "Patient was admitted for transurethral resection of the prostate for benign prostatic enlargement with [ bothersome lower urinary tract symptoms / refractory retention / recurrent UTI / bladder stones ].",
      primaryDiagnosis: "Benign prostatic enlargement [ prostate volume __ ml; PSA __ ] [ with retention ]",
      procedure: {
        name: "[ Monopolar / bipolar ] TURP [ / HoLEP ]",
        anaesthesia: "Spinal anaesthesia",
        findings: "[ lobes, prostate size, bladder trabeculation, stones; resection weight ]",
        drains: "Three-way catheter with bladder irrigation",
        complications: "Nil",
        outcome: "Procedure completed; chips sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Bladder irrigation was stopped on POD [ __ ] when the urine cleared; the catheter was removed on POD [ __ ] and the patient voided with a good stream [ post-void residual __ ml ]. The patient is afebrile and voiding clear urine at discharge.",
      medications: [
        M.paracetamol,
        M.nitrofurantoin,
        M.lactulose,
        { ...M.tamsulosin, duration: "[ 2–4 weeks ]", indication: "[ if slow stream after catheter removal — per surgeon ]" },
        M.oxybutynin,
      ],
      advice: adv([
        HYDRATE,
        { module: "Activity restrictions", text: "Avoid straining at stool, heavy lifting, cycling and sexual activity for 4–6 weeks. Some blood in the urine between days 10 and 14 is expected — drink more water." },
        { module: "Medication instructions", text: "Dry (retrograde) ejaculation is expected after the operation. Some burning and urgency may last a few weeks." },
      ]),
      redFlags: RF_URINE,
      patientActions: [
        "Attend the Urology OPD after [ 4–6 weeks ] with a uroflowmetry and post-void residual.",
        "Bring the histopathology report to the follow-up visit.",
      ],
      primaryCareActions: ["Treat urinary infection per culture; refer back with retention or heavy haematuria."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "LUTS — voiding (hesitancy, poor stream, straining, dribbling) and storage (frequency, nocturia, urgency); IPSS; episodes of retention; haematuria; UTI; bladder stones; drugs (anticholinergics, alpha-blockers, 5-ARI); diabetes, neurological disease. Examination: palpable bladder, DRE (size, consistency, nodules), external genitalia, neurological screen. Baseline: USG KUB with prostate volume and PVR, uroflowmetry, PSA, renal function, urine culture.",
    progressNote:
      "Each day — irrigation and urine colour; clots; haemoglobin; sodium (TUR syndrome); catheter. Discharge day — urine clear, catheter out, voiding with a low residue.",
  },

  // ---- Urethral stricture ----
  {
    key: "uro_stricture",
    label: "Urethral stricture — OIU / urethroplasty",
    match: /urethral stricture|stricture (of the )?urethra|stricture urethra|\bOIU\b|optical (internal )?urethrotomy|\bDVIU\b|urethrotomy|urethroplasty|\bBMG\b|buccal mucosa(l)? graft/i,
    scaffold: {
      indication:
        "Patient was admitted with [ poor stream / retention / suprapubic catheter ] due to a [ __ cm ] [ bulbar / penile / posterior ] urethral stricture [ aetiology ] for [ optical internal urethrotomy / urethroplasty ].",
      primaryDiagnosis: "[ Bulbar / penile / pan-anterior / posterior ] urethral stricture [ length __ cm ] [ aetiology: idiopathic / traumatic / instrumentation / lichen sclerosus ]",
      procedure: {
        name: "[ Optical internal urethrotomy / excision and primary anastomosis / buccal mucosal graft urethroplasty ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ stricture site and length; calibre; graft size ]",
        drains: "[ Per-urethral catheter (__ Fr) / suprapubic catheter ]",
        complications: "Nil",
        outcome: "Procedure completed; catheter in situ.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. [ OIU: the catheter was removed on POD __ and the patient voided with a good stream; self-calibration was taught. / Urethroplasty: the patient is discharged on the catheter, to return for a pericatheter urethrogram and catheter removal at 3 weeks. ] The patient is afebrile and comfortable at discharge.",
      medications: [M.paracetamol, M.diclofenac, M.cefixime, M.oxybutynin, M.lactulose],
      advice: adv([
        { module: "Catheter care", text: "Keep the catheter bag below the bladder and the tube free of kinks; empty the bag when two-thirds full; wash around the catheter with soap and water daily; do not pull on it." },
        { module: "Activity restrictions", text: "[ After OIU: do the self-calibration (self-dilatation) exactly as taught — (daily / weekly) — it prevents the stricture coming back. ]" },
        { module: "Wound care", text: "[ After buccal graft: salt-water mouth rinses after meals; soft diet for a week. Keep the perineal wound clean and dry. ]" },
        HYDRATE,
      ]),
      redFlags: [...RF_URINE, "Slowing of the urinary stream again", "Swelling or discharge from the perineal wound"],
      patientActions: [
        "[ After urethroplasty: attend on (date) for a pericatheter urethrogram and catheter removal. ]",
        "Attend the Urology OPD with a uroflowmetry at [ 3 months ].",
        "[ Continue self-calibration as scheduled. ]",
      ],
      primaryCareActions: ["Treat UTI per culture; refer back if the stream slows."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Poor stream, straining, spraying, retention; duration; previous catheterisation, instrumentation, pelvic fracture or perineal trauma, urethritis; previous urethrotomies; UTI. Examination: palpable bladder, meatus, penile skin (lichen sclerosus), perineum, suprapubic catheter site. Baseline: uroflowmetry, RGU and MCU, USG with PVR, renal function, urine culture.",
    progressNote:
      "Each day — catheter draining and its position; urine colour; temperature; wound / oral graft site; self-calibration teaching. Discharge day — afebrile; catheter plan or voiding well; calibration schedule understood.",
  },

  // ---- Hydrocele / circumcision (day-care) ----
  {
    key: "uro_hydrocele_circumcision",
    label: "Hydrocele / circumcision (day-care)",
    match: /hydrocele|hydrocoelectomy|hydrocelectomy|jaboulay|eversion of (the )?sac|lord'?s (plication|procedure)|circumcision|phimosis|paraphimosis|balanitis/i,
    scaffold: {
      indication:
        "Patient was admitted as a day case for [ hydrocelectomy for a (right / left) primary vaginal hydrocele / circumcision for phimosis ].",
      primaryDiagnosis: "[ Right / left / bilateral ] primary vaginal hydrocele / [ phimosis / recurrent balanoposthitis ]",
      procedure: {
        name: "[ Jaboulay's eversion / Lord's plication / excision of sac ] / [ Circumcision ]",
        anaesthesia: "[ Spinal / local / general ] anaesthesia",
        findings: "[ fluid volume and character; testis normal ] / [ prepuce; glans ]",
        drains: "[ nil / corrugated drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date] as a day case. The patient passed urine, pain was controlled with oral analgesia and there was no haematoma. The patient is discharged the same day [ / on POD 1 ].",
      medications: [
        M.paracetamol,
        { generic: "Ibuprofen", strength: "400 mg", route: "PO", frequency: "TDS after food", duration: "3 days", status: "new" },
        { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "BD", duration: "5 days", indication: "[ if indicated ]", status: "new" },
        { generic: "Lidocaine 2% jelly", route: "topical", frequency: "SOS", indication: "after circumcision — apply to the wound for pain", status: "prn" },
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry. [ Hydrocele: wear a scrotal support / tight underwear for 2 weeks. ] [ Circumcision: apply the jelly, wear loose clothing; swelling for a week is normal. ]" },
        { module: "Activity restrictions", text: "Avoid cycling, heavy lifting and sexual activity for 3–4 weeks." },
      ]),
      redFlags: [
        "Persistent or high fever",
        "Rapidly increasing scrotal swelling or bruising (haematoma)",
        "Bleeding that does not stop with firm pressure for 10 minutes",
        "Inability to pass urine",
      ],
      patientActions: [
        "Attend the Urology OPD after [ 7 days ] for a wound review.",
        "Sutures are absorbable [ / attend for suture removal on day 7–10 ].",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Swelling — duration, size change, pain; ability to get above it; transillumination; filarial exposure; trauma. Phimosis — ballooning, recurrent balanitis, painful erection, diabetes. Examination: scrotal swelling, testis palpable, cough impulse (exclude hernia), transillumination; prepuce and meatus. Baseline: USG scrotum if the testis is not felt; blood sugar; pre-anaesthetic workup.",
    progressNote:
      "Day of surgery — pain; voided; scrotal swelling / wound bleeding. Discharge — voiding, pain controlled, no haematoma.",
  },

  // ---- Acute urinary retention — discharged on catheter ----
  {
    key: "uro_retention_catheter",
    label: "Acute urinary retention — on catheter, trial void",
    match: /urinary retention|retention of urine|acute retention|\bAUR\b|chronic retention|trial (of )?void|\bTWOC\b|\bBPH\b|benign prostatic|prostatomegaly|\bBPE\b|\bLUTS\b/i,
    scaffold: {
      indication:
        "Patient was admitted with acute retention of urine [ precipitated by __ ] due to [ benign prostatic enlargement ], relieved by urethral catheterisation.",
      primaryDiagnosis: "Acute urinary retention due to [ benign prostatic enlargement (volume __ ml) ] [ precipitant: constipation / UTI / drugs / alcohol ]",
      procedure: {
        name: "Per-urethral catheterisation [ __ Fr Foley ] [ / suprapubic cystostomy ]",
        anaesthesia: "[ Local anaesthetic gel ]",
        findings: "[ drained volume __ ml; urine appearance ]",
        drains: "Per-urethral catheter in situ at discharge",
        complications: "Nil",
        outcome: "Retention relieved.",
      },
      clinicalCourse:
        "Presented on [date] with acute retention; catheterisation drained [ __ ml ]. [ Post-obstructive diuresis / renal function __ → __ ]. The precipitant [ __ ] was treated and an alpha-blocker started. [ Trial without catheter on __ failed / not yet attempted. ] The patient is afebrile and is discharged on the catheter with a plan for trial void.",
      medications: [
        { ...M.tamsulosin, duration: "continue", indication: "started for trial void" },
        { generic: "Finasteride", strength: "5 mg", route: "PO", frequency: "OD", duration: "continue", indication: "[ if prostate > 30–40 ml ]", status: "new" },
        M.lactulose,
        { ...M.nitrofurantoin, indication: "[ only if UTI — per urine culture ]" },
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Catheter care", text: "Keep the catheter bag below the bladder and the tube free of kinks; empty the bag when two-thirds full; wash around the catheter with soap and water daily; do not pull on it. Use the leg bag by day and the large bag at night." },
        { module: "Medication instructions", text: "Take the prostate tablet every night; stand up slowly as it can cause dizziness. Avoid cold / cough remedies with antihistamines or decongestants, and alcohol." },
        { module: "Diet", text: "Drink normally (about 2 litres a day) but avoid large volumes at night. Keep the bowels regular." },
      ]),
      redFlags: [
        "Fever with chills and rigors",
        "The catheter stops draining, or urine leaks around it with lower-abdominal pain",
        "Heavy bleeding or clots in the urine",
        "[ After catheter removal: ] unable to pass urine for more than 6 hours with lower-abdominal pain",
      ],
      patientActions: [
        "Attend the Urology OPD on [ date ] for catheter removal and trial void [ after 3–7 days of the alpha-blocker ].",
        "Bring the USG KUB with prostate volume, PSA and renal function reports.",
        "[ If the trial void fails: re-catheterise and discuss TURP. ]",
      ],
      primaryCareActions: [
        "Change the catheter if blocked; do not remove it before the trial-void date unless advised.",
        "Review drugs that cause retention (anticholinergics, antihistamines, opioids).",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset of retention; prior LUTS and IPSS; precipitants — constipation, UTI, alcohol, cold remedies, anticholinergics, opioids, recent surgery or anaesthesia; haematuria; back pain, leg weakness or saddle numbness (cauda equina). Examination: palpable bladder, DRE (prostate size, nodules, anal tone), perianal sensation, lower-limb neurology. Baseline: drained volume, renal function, electrolytes, urine culture, USG KUB with prostate volume, PSA (after catheterisation-related rise settles).",
    progressNote:
      "Each day — urine output (post-obstructive diuresis); creatinine trend; catheter draining; bowels; alpha-blocker started. Discharge day — renal function settling, catheter care taught, trial-void date fixed.",
  },
];

/** When the typed diagnosis matches none of the nine. */
export const UROLOGY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "uro_generic",
  label: "Urology — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presentation ] requiring [ inpatient management / investigation / surgery ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure name ]",
      anaesthesia: "[ General / spinal / local ]",
      findings: "[ significant findings ]",
      drains: "[ catheter / stent / drain at discharge, if any ]",
      complications: "Nil",
      outcome: "Procedure completed successfully.",
    },
    clinicalCourse:
      "Admitted with [presentation]. [Procedure] was performed on [date]. The postoperative period was [uneventful]; [ the catheter was removed and the patient voided well ]. The patient is afebrile and ambulant at discharge.",
    medications: [M.paracetamol, M.pantoprazole],
    advice: adv([
      HYDRATE,
      { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for [ … ] weeks." },
    ]),
    redFlags: RF_URINE,
    patientActions: [
      "Attend the Urology OPD on [ date ].",
      "[ Attend for stent / catheter removal on (date). ]",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset and duration; LUTS, haematuria, loin pain, fever; previous urological procedures, stents and catheters; past medical and drug history; examination including abdomen, genitalia and DRE; provisional diagnosis and plan. Baseline: urine routine and culture, renal function, USG KUB.",
  progressNote:
    "Each day — urine output and colour; catheter / drain; temperature; renal function; the day's plan. On readiness — afebrile, voiding or catheter plan clear. For discharge with advice.",
};
