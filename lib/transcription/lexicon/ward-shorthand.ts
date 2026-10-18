import type { MedicalLexiconEntry, Specialty } from "./types";
import { PRIORITY, specialtyEntry } from "./types";

/**
 * The ward shorthand each department writes that the rest of the lexicon does not already
 * carry as a term + abbreviation pair: "range of motion" / "ROM", "right eye" / "RE",
 * "per vaginum" / "P/V".
 *
 * ONE SOURCE. These are ordinary lexicon entries (the full phrase is the keyterm, the
 * abbreviation an alias), and lib/shorthand-derive.ts reads every entry in the master lexicon
 * for pairs whose abbreviation spells the phrase's initials. So the words dictation is boosted
 * with and the shorthand a finding is displayed in come from the same rows and cannot drift.
 *
 * To add one: the phrase as said (each word starting with the next letter of the
 * abbreviation; "of", "and", "with" and the like may sit between), then the abbreviation.
 * A pair whose initials do not spell the abbreviation is not derived; shorthand.test.ts says so.
 * Priority is the lowest there is, so a pair never pushes a real clinical term out of a
 * unit's keyterm budget.
 */

const pairs = (spec: Specialty, list: [string, string][]): MedicalLexiconEntry[] =>
  list.map(([phrase, abbr]) => specialtyEntry(spec)(phrase, ["india-ward"], [abbr], [], PRIORITY.GENERIC));

/** Every ward, every department: history and examination headings. No triggers, so they are
 *  never boosted on their own. */
const CORE: MedicalLexiconEntry[] = (
  [
    ["complaints of", "C/O"],
    ["on examination", "O/E"],
    ["shortness of breath", "SOB"],
    ["loss of consciousness", "LOC"],
  ] as const
).map(([phrase, abbr]) => ({ term: phrase, aliases: [abbr], categories: ["india-ward"], priority: PRIORITY.GENERIC }));

export const WARD_SHORTHAND: MedicalLexiconEntry[] = [
  ...CORE,
  ...pairs("ophthalmology", [
    ["right eye", "RE"],
    ["left eye", "LE"],
    ["both eyes", "BE"],
    ["visual acuity", "VA"],
    ["best corrected visual acuity", "BCVA"],
    ["anterior chamber", "AC"],
    ["relative afferent pupillary defect", "RAPD"],
    ["small incision cataract surgery", "SICS"],
    ["counting fingers", "CF"],
    ["hand movements", "HM"],
    ["perception of light", "PL"],
    ["primary open angle glaucoma", "POAG"],
    ["pars plana vitrectomy", "PPV"],
    ["central retinal vein occlusion", "CRVO"],
    ["branch retinal vein occlusion", "BRVO"],
    ["central retinal artery occlusion", "CRAO"],
    ["proliferative diabetic retinopathy", "PDR"],
    ["non proliferative diabetic retinopathy", "NPDR"],
    ["pan retinal photocoagulation", "PRP"],
    ["fundus fluorescein angiography", "FFA"],
    ["dilated fundus evaluation", "DFE"],
    ["keratic precipitates", "KP"],
    ["laser peripheral iridotomy", "LPI"],
  ]),
  ...pairs("orthopaedics", [
    ["range of motion", "ROM"],
    ["non weight bearing", "NWB"],
    ["partial weight bearing", "PWB"],
    ["full weight bearing", "FWB"],
    ["open reduction internal fixation", "ORIF"],
    ["closed reduction internal fixation", "CRIF"],
    ["plaster of paris", "POP"],
    ["total hip replacement", "THR"],
    ["total knee replacement", "TKR"],
    ["anterior cruciate ligament", "ACL"],
    ["posterior cruciate ligament", "PCL"],
    ["proximal femoral nail", "PFN"],
    ["dynamic hip screw", "DHS"],
    ["straight leg raise", "SLR"],
    ["neck of femur", "NOF"],
  ]),
  ...pairs("internal-medicine", [
    ["jugular venous pressure", "JVP"],
    ["diabetes mellitus", "DM"],
    ["ischaemic heart disease", "IHD"],
    ["coronary artery disease", "CAD"],
    ["congestive cardiac failure", "CCF"],
    ["myocardial infarction", "MI"],
    ["acute coronary syndrome", "ACS"],
    ["respiratory system", "RS"],
    ["central nervous system", "CNS"],
  ]),
  ...pairs("obstetrics-gynaecology", [
    ["per vaginum", "P/V"],
    ["per vaginal", "P/V"],
    ["per speculum", "P/S"],
    ["post partum haemorrhage", "PPH"],
    ["ante partum haemorrhage", "APH"],
    ["normal vaginal delivery", "NVD"],
    ["symphysis fundal height", "SFH"],
  ]),
  ...pairs("ent", [
    ["tympanic membrane", "TM"],
    ["chronic suppurative otitis media", "CSOM"],
    ["acute suppurative otitis media", "ASOM"],
    ["otitis media with effusion", "OME"],
    ["conductive hearing loss", "CHL"],
    ["external auditory canal", "EAC"],
    ["inferior turbinate hypertrophy", "ITH"],
  ]),
  ...pairs("psychiatry", [
    ["mental status examination", "MSE"],
    ["alcohol dependence syndrome", "ADS"],
    ["major depressive disorder", "MDD"],
    ["obsessive compulsive disorder", "OCD"],
    ["generalised anxiety disorder", "GAD"],
    ["deliberate self harm", "DSH"],
    ["electro convulsive therapy", "ECT"],
  ]),
  ...pairs("dermatology", [
    ["body surface area", "BSA"],
    ["stevens johnson syndrome", "SJS"],
    ["toxic epidermal necrolysis", "TEN"],
    ["pemphigus vulgaris", "PV"],
    ["discoid lupus erythematosus", "DLE"],
    ["psoriasis area and severity index", "PASI"],
    ["drug reaction with eosinophilia and systemic symptoms", "DRESS"],
  ]),
  ...pairs("neurosurgery", [
    ["traumatic brain injury", "TBI"],
    ["diffuse axonal injury", "DAI"],
    ["lumbar puncture", "LP"],
    ["anterior cervical discectomy and fusion", "ACDF"],
    ["middle cerebral artery", "MCA"],
  ]),
  ...pairs("paediatrics", [
    ["severe acute malnutrition", "SAM"],
    ["moderate acute malnutrition", "MAM"],
    ["low birth weight", "LBW"],
    ["very low birth weight", "VLBW"],
    ["respiratory distress syndrome", "RDS"],
    ["hypoxic ischaemic encephalopathy", "HIE"],
    ["kangaroo mother care", "KMC"],
    ["oral rehydration solution", "ORS"],
    ["mid upper arm circumference", "MUAC"],
    ["transient tachypnoea of the newborn", "TTN"],
  ]),
  ...pairs("emergency-medicine", [
    ["advanced cardiac life support", "ACLS"],
    ["basic life support", "BLS"],
    ["rapid sequence intubation", "RSI"],
    ["capillary refill time", "CRT"],
    ["road traffic accident", "RTA"],
  ]),
  ...pairs("urology", [
    ["benign prostatic hyperplasia", "BPH"],
    ["lower urinary tract symptoms", "LUTS"],
    ["acute urinary retention", "AUR"],
    ["post void residual", "PVR"],
    ["international prostate symptom score", "IPSS"],
    ["urinary tract infection", "UTI"],
  ]),
  ...pairs("burns_plastic_surgery", [
    ["total body surface area", "TBSA"],
    ["full thickness skin graft", "FTSG"],
    ["split skin graft", "SSG"],
    ["negative pressure wound therapy", "NPWT"],
    ["vacuum assisted closure", "VAC"],
  ]),
];
