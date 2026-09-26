import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The urology keyterm core.
 *
 * WHY THESE WORDS. A urology round is dictated in tubes, stones and streams: the operation as
 * initials ("TURP", "PCNL", "URSL", "RIRS"), the drainage ("Foley draining clear", "nephrostomy
 * 400 ml", "DJ stent in situ"), the stone by side, site and size, and the lower urinary tract
 * symptoms in the patient's own words. Nova-3 Medical does not hold the initials, and mis-hearing
 * "URSL" as "usual" is the kind of error this file exists to prevent.
 *
 * Everything here is tagged `urology`. Shared terms (creatinine, culture, catheter care) live in
 * the shared categories and are not repeated.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`, so "TURP", "PCNL", "DJ",
 * "PCN", "SPC", "BPH", "PSA", "DRE" and "LUTS" are never triggers — only spoken content stored
 * verbatim.
 */

const URO = "urology" as const;

function entry(
  term: string,
  categories: MedicalLexiconEntry["categories"],
  aliases: string[] = [],
  triggers: string[] = [],
  priority: number = PRIORITY.SPECIALTY
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories,
    specialties: [URO],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const dev = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["device"], a, tr, PRIORITY.RELATED);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const sym = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.SPECIALTY);

export const UROLOGY: MedicalLexiconEntry[] = [
  // --- Stones, which are most of the ward --------------------------------------------------
  dx("ureteric calculus", ["lower ureteric calculus", "mid ureteric calculus", "upper ureteric calculus", "vesicoureteric junction calculus", "impacted calculus"], ["renal colic", "flank pain"]),
  dx("renal calculus", ["renal pelvic calculus", "lower pole calculus", "staghorn calculus", "multiple renal calculi", "bladder calculus", "urethral calculus"], ["urinary stone disease"]),
  dx("hydronephrosis", ["gross hydronephrosis", "hydroureteronephrosis", "pelviureteric junction obstruction", "cortical thinning", "obstructive uropathy", "pyonephrosis"], ["urinary obstruction", "urinary stone"]),

  // --- Prostate and the bladder outlet ----------------------------------------------------
  dx("benign prostatic hyperplasia", ["benign enlargement of prostate", "grade two prostatomegaly", "median lobe enlargement", "bladder outlet obstruction", "high pressure chronic retention"], ["poor stream", "retention of urine"]),
  dx("carcinoma prostate", ["adenocarcinoma prostate", "Gleason score recorded", "metastatic prostate cancer", "hormone sensitive disease", "bone metastases from prostate"], ["raised PSA", "hard prostate"]),
  dx("acute urinary retention", ["chronic retention with overflow", "catheterised in casualty", "failed trial of void", "residual urine significant"], ["not passing urine"]),
  dx("urethral stricture", ["bulbar urethral stricture", "meatal stenosis", "post-traumatic stricture", "stricture segment length"], ["poor stream", "straining"]),

  // --- Infection, the bladder and the kidney ----------------------------------------------
  dx("acute pyelonephritis", ["gas forming pyelonephritis", "renal abscess", "perinephric collection", "urosepsis", "recurrent urinary tract infection", "catheter associated urinary infection"], ["fever with chills", "flank tenderness"]),
  dx("bacterial cystitis", ["haemorrhagic cystitis", "interstitial cystitis", "neurogenic bladder", "overactive bladder", "vesicoureteric reflux"], ["burning micturition"]),
  dx("carcinoma bladder", ["transitional cell carcinoma bladder", "non-muscle invasive bladder tumour", "muscle invasive disease", "papillary growth on cystoscopy"], ["painless haematuria"]),
  dx("renal cell carcinoma", ["Wilms tumour", "renal mass", "upper tract urothelial carcinoma", "adrenal incidentaloma"], ["haematuria", "flank mass"]),

  // --- The male genital tract --------------------------------------------------------------
  dx("hydrocele", ["varicocele", "epididymo-orchitis", "testicular torsion", "undescended testis", "testicular tumour", "phimosis", "paraphimosis", "balanoposthitis"], ["scrotal swelling", "scrotal pain"]),
  dx("erectile dysfunction and infertility", ["oligospermia", "azoospermia", "semen analysis done", "varicocele related infertility"], ["infertility"]),

  // --- The operations, as spoken ----------------------------------------------------------
  proc("transurethral resection of prostate", ["bipolar TURP", "holmium laser enucleation of prostate", "transurethral incision of prostate", "open prostatectomy", "chips sent for histopathology"], ["prostate surgery"]),
  proc("percutaneous nephrolithotomy", ["mini percutaneous nephrolithotomy", "retrograde intrarenal surgery", "ureterorenoscopy with lithotripsy", "extracorporeal shock wave lithotripsy", "open pyelolithotomy", "cystolitholapaxy"], ["stone surgery"]),
  proc("transurethral resection of bladder tumour", ["radical cystectomy", "ileal conduit", "partial cystectomy", "intravesical BCG instillation", "mitomycin instillation"], ["bladder tumour"]),
  proc("nephrectomy", ["radical nephrectomy", "simple nephrectomy", "partial nephrectomy", "nephroureterectomy", "pyeloplasty", "renal transplant"], ["renal mass"]),
  proc("cystoscopy", ["diagnostic cystoscopy", "urethral dilatation", "optical internal urethrotomy", "urethroplasty", "suprapubic cystostomy"], ["cystoscopy"]),
  proc("scrotal and penile surgery", ["hydrocelectomy", "Jaboulay procedure", "orchidopexy", "orchidectomy", "high inguinal orchidectomy", "circumcision", "varicocelectomy", "vasectomy"], ["scrotal surgery"]),
  proc("stent and tube placement", ["DJ stent placement", "DJ stent removal", "percutaneous nephrostomy", "antegrade stenting", "ureteric catheterisation"], ["ureteric stent", "nephrostomy"]),

  // --- The tubes and what comes out of them -----------------------------------------------
  dev("Foley catheter", ["three-way catheter", "suprapubic catheter", "catheter draining clear urine", "catheter blocked", "bladder wash given", "continuous bladder irrigation", "catheter removed and voided", "condom drainage", "clean intermittent catheterisation"], ["urinary catheter", "bladder drainage"]),
  dev("double J stent", ["percutaneous nephrostomy tube", "nephrostomy draining", "stent in situ", "stent encrustation", "pigtail drain in collection"], ["ureteric stent", "nephrostomy"]),

  // --- What the patient reports, in their words --------------------------------------------
  sym("lower urinary tract symptoms", ["poor stream", "straining to pass urine", "hesitancy", "terminal dribbling", "intermittent stream", "sense of incomplete emptying", "frequency of urine", "nocturia", "urgency", "urge incontinence", "stress incontinence", "dribbling of urine"], ["prostate", "voiding difficulty"]),
  sym("haematuria", ["frank haematuria", "painless haematuria", "clot retention", "initial haematuria", "terminal haematuria", "clots passed"], ["blood in urine"]),

  // --- Investigations ---------------------------------------------------------------------
  test("ultrasound kidney ureter bladder", ["post-void residual urine", "prostate volume estimated", "ultrasound shows hydronephrosis", "non-contrast CT KUB", "intravenous urography", "CT urography", "retrograde urethrogram", "micturating cystourethrogram"], ["imaging"]),
  test("renal function and urine tests", ["serum creatinine", "blood urea", "urine routine and microscopy", "urine culture and sensitivity", "twenty-four hour urine protein", "urine cytology", "stone analysis report"], ["kidney function"]),
  test("prostate specific antigen", ["free to total PSA ratio", "PSA density", "digital rectal examination findings", "TRUS guided biopsy", "uroflowmetry", "urodynamic study", "DTPA renogram", "split renal function"], ["prostate assessment"]),
  drug("urological medications", ["tamsulosin", "silodosin", "dutasteride", "finasteride", "solifenacin", "mirabegron", "potassium citrate syrup", "tamsulosin with dutasteride", "alpha blocker started"], ["prostate", "stone expulsion"]),
];
