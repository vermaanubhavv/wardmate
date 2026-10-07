import type { AdviceItem, MedicationStatus, Procedure } from "@/lib/discharge-entities";

/**
 * General-surgery discharge TEMPLATES — one per major diagnosis, reviewed and signed off by the
 * unit (see the "GS Discharge Templates" review document, v1.0).
 *
 * THE RULE THIS FILE KEEPS: what is written here prints as written, unless the resident changes
 * it. A default is the ward's standard wording for that diagnosis, not a placeholder — a card
 * the resident never opens still prints its default. The only exception is a genuinely
 * patient-specific blank — operative findings, a date, a drain output — written as `[ … ]`, which
 * prints as a visible blank if left rather than as a guess.
 *
 * This is the same class of thing as the "standard discharge medication set" and the "no
 * comorbidities" line the app already uses: an EDITABLE STARTING POINT a doctor signs off.
 *
 *   - The ONE-OFF flow (app/prepare-discharge/new) seeds every section from the chosen template.
 *   - A WARD patient's discharge stays compiled from the record. The template seeds its advice,
 *     red-flag and follow-up cards (switched on), and the AI writes the indication and clinical
 *     course from the record along the template's form — see applyDischargeTemplate() in
 *     lib/discharge-compile.ts and templateGuide() in lib/discharge-ai.ts.
 *
 * `clerkingFocus` and `progressNote` carry the history / daily-note focus for each diagnosis.
 * `progressNote` shows as a read-only "What to check today" hint in the note builder — never
 * saved, never prefilled, never sent to the AI compile. `clerkingFocus` is not yet wired.
 *
 * Conditional drugs — given only in some patients — are written with the generic name inside
 * `[ … ]` and the condition beside it, so a row nobody edited prints as visibly unfinished rather
 * than as a prescription every patient received.
 *
 * CLINICAL CONTENT: the corrections and the nine templates added after the Schwartz 11e review
 * (docs/surgical-history.md §12) are PENDING the unit's sign-off.
 *
 * Medication lines are a STARTING SET to be checked against each patient — allergy, renal
 * function, weight, cultures, what they were already taking.
 */

// Value import is safe: discharge-templates-urology.ts imports only TYPES from this file, so
// there is no runtime cycle.
import { UROLOGY_DISCHARGE_TEMPLATES } from "@/lib/discharge-templates-urology";


export type TemplateMedication = {
  generic: string;
  strength?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  /** A condition on whether to prescribe it, or the reason — e.g. "if infective". */
  indication?: string;
  status: MedicationStatus;
};

export type DischargeTemplate = {
  key: string;
  /** Shown on the card the resident picks. */
  label: string;
  /** Matched against the typed procedure text and the typed diagnosis. */
  match: RegExp;
  /** care_templates families that also select this template. */
  families?: string[];
  scaffold: {
    indication: string;
    primaryDiagnosis: string;
    procedure: Pick<Procedure, "name" | "anaesthesia" | "findings" | "drains" | "complications" | "outcome">;
    /** The default clinical-course skeleton — the standard beats for this diagnosis, with
     *  `[ … ]` for the patient-specific parts (dates, drain days, complications). */
    clinicalCourse: string;
    medications: TemplateMedication[];
    advice: AdviceItem[];
    redFlags: string[];
    patientActions: string[];
    primaryCareActions: string[];
    /** Seed the nine Condition-at-Discharge variables as satisfactory, for the resident to
     *  strike through what is not true — the way the old paper form printed "Satisfactory". */
    conditionAllSatisfactory: boolean;
  };
  clerkingFocus: string;
  progressNote: string;
};

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
  diclofenac: { generic: "Diclofenac", strength: "50 mg", route: "PO", frequency: "SOS for pain", duration: "5 days", status: "prn" } as TemplateMedication,
  ondansetron: { generic: "Ondansetron", strength: "4 mg", route: "PO", frequency: "SOS for vomiting", status: "prn" } as TemplateMedication,
  lactulose: { generic: "Lactulose", dose: "15 ml", route: "PO", frequency: "HS", duration: "7 days", indication: "keep stools soft, avoid straining", status: "new" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  enoxaparin28: { generic: "Enoxaparin", strength: "40 mg", route: "SC", frequency: "OD", duration: "28 days", indication: "extended thromboprophylaxis after cancer surgery", status: "new" } as TemplateMedication,
};

const RF_WOUND = [
  "Persistent or high fever",
  "Increasing redness, swelling, pain or discharge at a wound",
];
const RF_ABDO = [
  "Worsening abdominal pain or distension",
  "Persistent vomiting or inability to keep food down",
  "Not passing stool or flatus",
];

const OPD7 = "Attend the Surgery OPD after 7 days for a wound review.";
const HPE = "Bring the histopathology report to the follow-up visit.";
const LMWH28 = "Complete the full 28-day course of the blood-thinning injections.";
const ONCO_MDT = "Collect the histopathology report and attend the oncology / multidisciplinary clinic with it to decide further treatment.";


/** Refuses any haystack that names a cancer — used by the benign-breast match. */
const NOT_CANCER = String.raw`^(?![\s\S]*(carcinoma|cancer|malignan|\bca\b))[\s\S]*`;

/** Hydrocele / circumcision — the urology unit's reviewed template, reused rather than
 *  re-written; only the clinic name changes on a general-surgery ward. */
const URO_HYDROCELE = UROLOGY_DISCHARGE_TEMPLATES.find((t) => t.key === "uro_hydrocele_circumcision")!;
const HYDROCELE: DischargeTemplate = {
  ...URO_HYDROCELE,
  scaffold: {
    ...URO_HYDROCELE.scaffold,
    patientActions: [OPD7, "Sutures are absorbable [ / attend for suture removal on day 7–10 ]."],
  },
};


// --- the ten -------------------------------------------------------------------------

export const DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- 11 Benign breast lump / fibroadenoma — FIRST in the array, before breast_ca ----
  // breast_ca matches "breast lump", so this must sit above it. The leading look-ahead refuses
  // the whole haystack if it says carcinoma / cancer / malignancy / Ca anywhere, so "Ca breast,
  // excision of breast lump" still goes to breast_ca.
  // Schwartz 11e p. 551 (fibroadenoma: young women, grow to 1–2 cm then stop; > 3 cm "giant").
  {
    key: "benign_breast",
    label: "Benign breast lump (fibroadenoma) — excision",
    match: new RegExp(
      NOT_CANCER +
        String.raw`(fibroadenom|phyllodes|benign breast (lump|disease)|fibroadenosis|excision (biopsy )?of (a |the )?(right |left )?breast lump|breast lump excision|microdochectomy|(total )?duct excision|hadfield)`,
      "i"
    ),
    scaffold: {
      indication:
        "Patient was admitted for excision of a [right / left] breast lump — [fibroadenoma on triple assessment: clinical, ultrasound (BI-RADS __) and FNAC / core biopsy].",
      primaryDiagnosis: "[ Right / left ] breast [ fibroadenoma / benign phyllodes tumour / fibroadenosis / duct ectasia ] — [ size; quadrant ]",
      procedure: {
        name: "Excision of [ right / left ] breast lump [ / microdochectomy / total duct excision ]",
        anaesthesia: "[ General / local ] anaesthesia",
        findings: "[ size, quadrant, encapsulated / well-circumscribed, cut surface ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent excision of the [right / left] breast lump through a [circumareolar / inframammary / radial] incision under [general / local] anaesthesia on [date]. Recovery was uneventful, with no haematoma. The patient is comfortable with a clean, dry wound at discharge.",
      medications: [M.paracetamol, M.pantoprazole, M.diclofenac],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry for 48 hours; you may then bathe and pat it dry. Wear a well-fitting, supportive bra day and night for 1–2 weeks — it reduces pain and swelling." },
        { module: "Activity restrictions", text: "Resume normal daily activity from the next day. Avoid heavy lifting and strenuous arm work for 1 week." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Rapidly increasing swelling, hardness or bruising of the breast (haematoma)",
      ],
      patientActions: [
        OPD7,
        "Attend for suture removal on postoperative day 7–10 [ / sutures are absorbable ].",
        HPE,
        "Report any new lump in either breast.",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Lump — duration, rate of growth (rapid growth suggests a phyllodes tumour), pain, change with the menstrual cycle; nipple discharge (colour, single or multiple ducts) or retraction; skin change; age, menstrual and lactation history, hormone use; family history of breast or ovarian cancer; previous lumps or biopsies. Examination: both breasts and axillae — size, position, consistency, mobility, skin and nipple, axillary and supraclavicular nodes. Baseline: triple assessment — ultrasound (with mammogram if over 35–40), FNAC or core biopsy; pre-anaesthetic workup.",
    progressNote:
      "POD 0 — pain controlled; wound dry; no haematoma. POD 1 (or same day, day case) — comfortable; wound clean. Plan: discharge with advice and the histopathology follow-up.",
  },

  // ---- 07 Carcinoma breast (checked before generic terms) ----
  {
    key: "breast_ca",
    label: "Carcinoma breast",
    match: /carcinoma breast|(carcinoma|cancer|malignancy|\bca\b) (of )?(the )?(right |left |b\/l |bilateral )?breast|breast (cancer|carcinoma|malignancy)|\bMRM\b|modified radical mastectomy|(?<!subcutaneous )mastectomy(?![^.]*gyn(a)?ecomastia)|breast conservation|\bBCS\b|axillary (clearance|dissection)|breast[^.]{0,40}sentinel|sentinel[^.]{0,40}breast/i,
    scaffold: {
      indication:
        "Patient was admitted for [modified radical mastectomy / breast conservation surgery with axillary clearance] for carcinoma of the [right / left] breast.",
      primaryDiagnosis: "Carcinoma [right / left] breast — [cT_N_M_, stage; histology; ER / PR / HER2; grade]",
      procedure: {
        name: "[ Modified radical mastectomy / breast conservation surgery ] with [ sentinel node biopsy / axillary lymph node dissection ]",
        anaesthesia: "General anaesthesia",
        findings: "[ tumour site and size; skin or chest-wall involvement; axillary nodes; number of nodes retrieved; margins ]",
        drains: "[ axillary / pectoral suction drain(s) / nil (BCS with SLNB) ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. The postoperative recovery was uneventful. Flaps remained healthy and drain outputs declined steadily. Shoulder and arm exercises were commenced on the ward. The patient is comfortable, afebrile and ambulant at discharge [with the axillary drain in situ, output __ ml / 24 h].",
      medications: [M.paracetamol, M.pantoprazole, M.diclofenac],
      advice: adv([
        { module: "Drain care", text: "Record the daily output. Keep the bag below the wound. Attend for removal when the output is below 30–50 ml in 24 hours." },
        { module: "Wound care", text: "Keep the wound clean and dry; attend for a dressing review as advised." },
        { module: "Arm care (lymphoedema prevention)", text: "On the side of the surgery: no blood-pressure cuff, no blood sampling, no injections. Avoid cuts, burns and insect bites; wear gloves for household and garden work; elevate the arm if it feels heavy." },
        { module: "Physiotherapy", text: "Do the shoulder and arm exercises taught on the ward every day and increase the range gradually." },
        { module: "Diet", text: "Normal, high-protein diet." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "The skin flap turning dark or blue",
        "Rapidly increasing swelling of the arm or the wound area (large seroma)",
        "Calf pain or swelling, or breathlessness",
      ],
      patientActions: [
        "Attend the Surgery OPD in 5–7 days for a drain and wound review.",
        "Attend for suture removal on postoperative day 10–14.",
        ONCO_MDT,
        "Do the arm exercises every day.",
      ],
      primaryCareActions: [
        "Monitor the wound; aspirate or refer a symptomatic seroma.",
        "Reinforce the arm precautions on the operated side.",
        "Support attendance at oncology follow-up.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Lump — duration, growth, pain; nipple discharge or retraction; skin changes; axillary or arm swelling; symptoms of metastasis (bone pain, cough, weight loss); menstrual, reproductive and hormone history; family history of breast or ovarian cancer; previous imaging, biopsy and any neoadjuvant chemotherapy. Examination: lump characteristics and fixity, skin and nipple, axillary and supraclavicular nodes, the other breast, chest, abdomen and spine. Baseline: mammogram and ultrasound, core biopsy with immunohistochemistry, metastatic workup as per stage.",
    progressNote:
      "Each day — flap colour and viability (edge necrosis); collection under the flaps (haematoma, seroma); output and character of each drain separately; wound; shoulder and arm range of movement; pain; temperature. Discharge — flaps healthy; drain output [ __ ml / 24 h ]; arm exercises taught; drain-care instructions if a drain is still in.",
  },

  // ---- 08 Colorectal carcinoma ----
  {
    key: "colorectal_ca",
    label: "Colorectal carcinoma",
    match: /colorectal|carcinoma (colon|rectum|caecum|sigmoid|rectal)|(colon|rectal|rectum|caecal|sigmoid) (cancer|carcinoma|malignancy)|abdominoperineal|\bAPR\b|(?=[\s\S]*(carcinoma|cancer|malignan|\bca\b|growth|tumou?r))[\s\S]*(hemicolectomy|anterior resection|hartmann)/i,
    scaffold: {
      indication:
        "Patient was admitted for [procedure] for carcinoma of the [caecum / ascending / transverse / descending / sigmoid colon / rectum] [with obstruction].",
      primaryDiagnosis: "Carcinoma [site] colon / rectum — [cT_N_M_, stage; histology; MMR / MSI status]",
      procedure: {
        name: "[ Hemicolectomy / anterior resection / abdominoperineal resection / Hartmann's ] [ + diversion stoma ]",
        anaesthesia: "General anaesthesia",
        findings: "[ tumour site and size; serosal or adjacent-organ involvement; liver or peritoneal deposits; resection performed; anastomosis (hand-sewn / stapled) or stoma type and site; lymphadenectomy ]",
        drains: "[ pelvic drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; [R0 / R1]; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date], on an enhanced-recovery pathway with early mobilisation and graded oral intake. Bowel function returned on POD [__]; [the stoma began functioning on POD __]. Drains were removed as output declined. The patient is afebrile, tolerating a normal diet and [independently managing the stoma] at discharge.",
      medications: [
        M.paracetamol,
        { generic: "[ Tramadol — only if pain is not controlled ]", strength: "50 mg", route: "PO", frequency: "SOS", status: "prn" },
        M.pantoprazole,
        { ...M.lactulose, generic: "[ Lactulose — only if no ileostomy ]" },
        { generic: "[ Loperamide — only if ileostomy output stays above about 1.5 L a day ]", strength: "2 mg", route: "PO", indication: "with oral rehydration solution", status: "new" },
        { ...M.enoxaparin28, generic: "[ Enoxaparin — after resection for cancer ]" },
        { generic: "Stoma appliances and skin-care supplies", status: "new" },
      ],
      advice: adv([
        { module: "Stoma care", text: "Follow the routine taught on the ward: skin care, appliance change, and the effect of foods on output. Contact the stoma nurse for supplies and any problem. Support the stoma when coughing to prevent a parastomal hernia." },
        { module: "Diet", text: "Rebuild the diet gradually, low-residue at first. Keep well hydrated. Limit gas-forming foods if there is a stoma." },
        { module: "Wound care", text: "Keep the wound clean and dry." },
        { module: "Lifting restrictions", text: "No lifting over 5 kg for 6–8 weeks." },
        { module: "Medication instructions", text: "Continue the daily blood-thinning injection for the full 28 days." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "The wound edges separating",
        "Worsening abdominal pain or distension",
        "No stoma output for more than 12 hours, or a very high watery output with dehydration",
        "The stoma pulling in, prolapsing, or turning dark",
        "Bleeding from the back passage, calf pain, or breathlessness",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days for a wound and stoma review.",
        "Attend for suture removal on postoperative day 10–14.",
        LMWH28,
        ONCO_MDT,
        "Keep the stoma-nurse follow-up appointment.",
        "[ Diverting ileostomy: attend for a distal contrast study and stoma closure at 8–12 weeks / after adjuvant therapy. ]",
        "Surveillance: CEA every 3–6 months; colonoscopy at 1 year, or at 3–6 months if an obstructing tumour prevented a complete colonoscopy before surgery.",
      ],
      primaryCareActions: [
        "Monitor the wound and stoma.",
        "Teach or reinforce the blood-thinning injection technique.",
        "Check electrolytes if the stoma output is high.",
        "Support attendance at oncology follow-up.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Change in bowel habit; bleeding per rectum or melaena; tenesmus; mass; weight loss and anorexia; episodes of obstruction; symptoms of anaemia; family history (Lynch syndrome, FAP); previous colonoscopy; stoma-site marking before an operation that may need a stoma. Examination: abdominal mass, hepatomegaly, digital rectal examination (for a rectal tumour — distance from the anal verge, fixity), nodes. Baseline: colonoscopy with biopsy, CEA, CT of chest, abdomen and pelvis, MRI pelvis for rectal tumours, CBC.",
    progressNote:
      "Each day — enhanced-recovery milestones (out of bed, oral intake, off IV fluids, catheter out, analgesia step-down); flatus / stool or stoma — colour (pink / dusky / black), output volume and consistency; drain output and character; wound; on POD 3–7 the signs that raise a leak question — new tachycardia, fever, rising TLC / CRP, peritonism, ileus that does not settle; voiding once the catheter is out after pelvic dissection; electrolytes if ileostomy output is high; stoma teaching. Discharge — eating, stoma managed independently, drain out, voiding. Discharge with stoma supplies, thromboprophylaxis as decided, and clinic dates.",
  },

  // ---- 09 Carcinoma stomach / gastric outlet obstruction ----
  {
    key: "gastric_ca",
    label: "Carcinoma stomach / gastric outlet obstruction",
    match: /carcinoma stomach|gastric (cancer|carcinoma|malignancy)|gastrectomy|(?=[\s\S]*(carcinoma|cancer|malignan|\bca\b|growth|tumou?r))[\s\S]*(gastric outlet obstruction|\bGOO\b|gastro-?jejunostomy|feeding jejunostomy)/i,
    scaffold: {
      indication:
        "Patient was admitted with [epigastric pain, vomiting, weight loss and gastric outlet obstruction] due to carcinoma of the stomach, for [procedure].",
      primaryDiagnosis: "Carcinoma stomach — [antrum / body / gastro-oesophageal junction; cT_N_M_, stage; Lauren / Siewert type; HER2]",
      procedure: {
        name: "[ Distal / subtotal / total gastrectomy with D2 lymphadenectomy / palliative gastrojejunostomy + feeding jejunostomy ]",
        anaesthesia: "General anaesthesia",
        findings: "[ tumour site and size; serosal involvement; nodal disease; liver or peritoneal deposits; resection and reconstruction (Billroth II / Roux-en-Y); feeding jejunostomy; drains ]",
        drains: "[ as placed ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Optimised before surgery with correction of dehydration and electrolytes, nutritional support [via a feeding jejunostomy / parenteral nutrition] and stomach washouts. [Procedure] was performed on [date]. Postoperatively [a contrast study on POD __ showed no leak], and oral intake was cautiously escalated. Drains were removed as output declined. The patient is afebrile, tolerating small frequent feeds [and feeding-jejunostomy feeds] at discharge.",
      medications: [
        { ...M.pantoprazole, generic: "[ Pantoprazole — distal / subtotal gastrectomy or gastrojejunostomy only ]", frequency: "OD", duration: undefined },
        M.paracetamolSos,
        { generic: "[ Domperidone — only if delayed gastric emptying ]", strength: "10 mg", route: "PO", frequency: "TDS before meals", duration: "maximum 7 days", indication: "if delayed gastric emptying (QT risk — short course only)", status: "new" },
        { generic: "Vitamin B12", strength: "1000 mcg", route: "IM", frequency: "monthly", indication: "lifelong after total gastrectomy; check B12 yearly after distal gastrectomy", status: "new" },
        { generic: "Ferrous sulfate", route: "PO", frequency: "OD", status: "new" },
        { ...M.enoxaparin28, generic: "[ Enoxaparin — after resection for cancer ]" },
        { generic: "Feeding-jejunostomy feeds / high-calorie oral supplements", status: "new" },
      ],
      advice: adv([
        { module: "Diet", text: "Small, frequent meals; chew well; take fluids between rather than with meals; avoid large sugary meals; if you feel faint or sweaty after eating (dumping), lie down for a while and adjust the meal size." },
        { module: "Medication instructions", text: "Lifelong vitamin B12 injections after total gastrectomy. Continue the blood-thinning injection for 28 days." },
        { module: "Feeding jejunostomy care", text: "Flush before and after each feed; follow the feed schedule; if it blocks or comes out, contact the ward." },
        { module: "Lifting restrictions", text: "Keep the wound clean and dry; no lifting over 5 kg for 6–8 weeks." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Abdominal pain, distension, or a fast heartbeat",
        "Inability to tolerate any oral intake, or large-volume bilious vomiting",
        "The feeding tube blocking or falling out",
        "Black tarry stools, or breathlessness",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7–10 days.",
        "Attend for suture removal on postoperative day 12–14.",
        LMWH28,
        "Collect the histopathology report and attend the upper-GI multidisciplinary / oncology clinic with it.",
        "Keep the dietitian follow-up; start the scheduled B12 injections.",
      ],
      primaryCareActions: [
        "Monitor weight and nutrition.",
        "Support feeding-jejunostomy care and give the monthly B12 injection.",
        "Teach or reinforce the blood-thinning injection technique.",
        "Support attendance at oncology follow-up.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Epigastric pain; early satiety; vomiting (undigested food, timing after meals); weight loss; dysphagia; melaena or symptoms of anaemia; previous H. pylori, ulcer or partial gastrectomy; family history. Examination: nutritional status, epigastric mass, succussion splash, Virchow's node, Sister Mary Joseph nodule, hepatomegaly, ascites. Baseline: upper GI endoscopy with biopsy, CT of chest and abdomen, staging laparoscopy, CBC, albumin, electrolytes and blood gas (gastric outlet obstruction — hypochloraemic, hypokalaemic metabolic alkalosis).",
    progressNote:
      "Each day — Ryle's output and character; feeding-jejunostomy feed tolerance; drain output and character (bilious drain raises a duodenal-stump or anastomotic-leak question) [ ± drain amylase ]; contrast study if one is done; oral intake escalation; once feeds start in a malnourished or obstructed patient — potassium, phosphate, magnesium (refeeding); weight; sepsis parameters. Discharge — tolerating feeds, drains out. Discharge with feed plan, B12 schedule after total gastrectomy, and clinic dates.",
  },

  // ---- 12 Thyroidectomy — after gastric_ca (no collisions; anywhere before the generic) ----
  // Schwartz 11e p. 1663: transient hypocalcaemia in up to 50%, permanent < 2%; haematoma may
  // need emergency evacuation; bilateral cord palsy compromises the airway.
  // p. 1681: hypocalcaemia starts as perioral and fingertip tingling; most need only oral
  // calcium + vitamin D. Levothyroxine after total thyroidectomy is standard practice; the dose
  // is weight-based, so it is a blank.
  {
    key: "thyroidectomy",
    label: "Thyroidectomy (hemi / total)",
    match: /thyroidectom|thyroid lobectom|hemithyroid|goit(re|er)|\bMNG\b|thyroid (nodule|swelling|carcinoma|cancer|malignancy|neoplasm)|solitary (thyroid )?nodule|\bSTN\b|carcinoma (of )?(the )?thyroid|papillary thyroid|follicular (neoplasm|adenoma|carcinoma)|graves/i,
    families: ["thyroidectomy"],
    scaffold: {
      indication:
        "Patient was admitted for [hemithyroidectomy / total thyroidectomy] for [multinodular goitre / solitary thyroid nodule (FNAC Bethesda __) / Graves' disease / carcinoma thyroid] [with pressure symptoms].",
      primaryDiagnosis:
        "[ Multinodular goitre / solitary thyroid nodule / Graves' disease / papillary / follicular carcinoma thyroid ] — [ euthyroid / toxic; Bethesda category; retrosternal extension ]",
      procedure: {
        name: "[ Right / left hemithyroidectomy / near-total / total thyroidectomy ] [ + central compartment neck dissection ]",
        anaesthesia: "General anaesthesia",
        findings: "[ gland size and consistency; nodules; retrosternal extension; both recurrent laryngeal nerves identified and preserved; parathyroids identified and preserved / autotransplanted; nodes ]",
        drains: "[ nil / suction drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Postoperatively the voice was [normal / hoarse], there was no neck swelling or stridor, and swallowing was comfortable. [Serum calcium on POD 1: __ mg/dL; PTH: __.] [There were no symptoms of hypocalcaemia / perioral tingling settled on oral calcium (and calcitriol).] [The drain was removed on POD __.] The patient is comfortable and tolerating a normal diet at discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.diclofenac,
        { generic: "[ Levothyroxine — after total thyroidectomy ]", strength: "[ … ] mcg", route: "PO", frequency: "OD, empty stomach, 30–60 min before breakfast", indication: "after total thyroidectomy — dose by body weight; not routine after hemithyroidectomy", status: "new" },
        { generic: "[ Calcium carbonate (elemental calcium) — after total thyroidectomy ]", strength: "500 mg", route: "PO", frequency: "TDS", duration: "[ … ]", indication: "after total thyroidectomy — per serum calcium; take 4 hours apart from levothyroxine", status: "new" },
        { generic: "[ Calcitriol — only if hypocalcaemia with a low PTH ]", strength: "0.25 mcg", route: "PO", frequency: "BD", duration: "[ … ]", indication: "only if hypocalcaemia with a low PTH", status: "new" },
        { generic: "[ Carbimazole — toxic goitre / Graves' ]", indication: "toxic goitre / Graves' — stop after total thyroidectomy", status: "stopped" },
        { generic: "[ Propranolol — toxic goitre ]", strength: "[ … ]", route: "PO", indication: "toxic goitre — taper and stop over [ 1–2 weeks ] as advised", status: "changed" },
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the neck wound clean and dry for 48 hours; you may then bathe and pat it dry." },
        { module: "Diet", text: "Normal diet. Soft foods are easier if swallowing is uncomfortable for the first few days." },
        { module: "Medication instructions", text: "[ After total thyroidectomy: the thyroid tablet is lifelong — take it every morning on an empty stomach, 30–60 minutes before food. ] Take the calcium tablets 4 hours apart from the thyroid tablet. Do not stop the calcium tablets without a blood calcium check." },
        { module: "Activity restrictions", text: "Gentle neck movements from day one. Avoid heavy lifting and strenuous exercise for 2 weeks. A hoarse or tired voice in the first weeks usually improves — mention it at follow-up." },
      ]),
      redFlags: [
        "Increasing neck swelling, tightness in the neck, or difficulty or noisy breathing",
        "Tingling or numbness around the mouth or in the fingertips, or cramps or spasm of the hands",
        "Difficulty swallowing, or choking on liquids",
        "Voice getting worse",
        ...RF_WOUND,
      ],
      patientActions: [
        OPD7,
        "Attend for suture / clip removal on postoperative day [ 5–7 ] [ / sutures are absorbable ].",
        HPE,
        "[ Total thyroidectomy: get serum calcium checked on [ date ] and TSH 6 weeks after starting levothyroxine — the dose is adjusted to it. ]",
        "[ Carcinoma: attend the endocrine / nuclear medicine clinic with the histopathology report to decide on radioiodine. ]",
      ],
      primaryCareActions: [
        "Check serum calcium if there is tingling or cramps.",
        "Check TSH 6 weeks after starting levothyroxine and adjust the dose.",
        "Refer for laryngoscopy if the voice remains hoarse.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Swelling — duration, growth, sudden increase (haemorrhage into a nodule or malignancy); pressure symptoms — dysphagia, breathlessness, stridor, hoarseness; toxic symptoms — weight loss, palpitations, heat intolerance, tremor; hypothyroid symptoms; neck irradiation; family history of thyroid cancer or MEN; current antithyroid drugs and beta-blockers. Examination: moves with swallowing, size, nodularity, lower border (retrosternal extension), tracheal deviation, Pemberton's sign, cervical nodes, eye signs, pulse, tremor. Baseline: thyroid function tests, USG neck (TI-RADS), FNAC (Bethesda), pre-operative vocal-cord check (indirect / video laryngoscopy), serum calcium, CT neck and chest if retrosternal; euthyroid before surgery.",
    progressNote:
      "Each day — voice; breathing and stridor; neck swelling and drain output; perioral or fingertip tingling, Chvostek's and Trousseau's signs; serum calcium (± PTH) on POD 1 after total thyroidectomy; swallowing; wound. Discharge day — voice stable, no haematoma, calcium normal or stable on supplements, drain out.",
  },

  // ---- 06 Acute pancreatitis ----
  {
    key: "pancreatitis",
    label: "Acute pancreatitis",
    match: /(?<!chronic )pancreatitis/i,
    scaffold: {
      indication:
        "Patient was admitted with severe upper abdominal pain radiating to the back, with raised serum amylase / lipase and imaging features of acute pancreatitis, requiring inpatient management.",
      primaryDiagnosis:
        "Acute pancreatitis — [aetiology (gallstone / alcohol / hypertriglyceridaemia / idiopathic); severity (mild / moderately severe / severe, revised Atlanta)]",
      procedure: {
        name: "[ Only if an intervention was done: ERCP with sphincterotomy and stone extraction / percutaneous catheter drainage / necrosectomy ]",
        anaesthesia: "[ as applicable ]",
        findings: "[ with date, findings and drains ]",
        drains: "[ as placed ]",
        complications: "Nil",
        outcome: "[ as applicable ]",
      },
      clinicalCourse:
        "Managed with early goal-directed intravenous fluid resuscitation with a balanced crystalloid (Ringer's lactate), analgesia, antiemetics and early enteral nutrition. [ERCP with sphincterotomy and stone extraction was performed for biliary obstruction.] The clinical course was [uncomplicated / complicated by …]; pain settled, inflammatory markers and organ function normalised, and oral intake was re-established and tolerated. The patient is comfortable and tolerating a low-fat diet at discharge.",
      medications: [
        M.paracetamol,
        { generic: "[ Tramadol — only if pain is not controlled ]", strength: "50 mg", route: "PO", frequency: "SOS", status: "prn" },
        M.ondansetron,
        { generic: "[ Pancreatic enzyme supplement — only if steatorrhoea ]", frequency: "with meals", status: "new" },
        { generic: "[ Fenofibrate — only if hypertriglyceridaemia-induced ]", status: "new" },
        { generic: "[ Thiamine — alcohol aetiology ]", strength: "100 mg", route: "PO", frequency: "OD", indication: "alcohol aetiology; with alcohol-cessation support", status: "new" },
      ],
      advice: adv([
        { module: "Diet", text: "A low-fat diet with small, frequent meals. Rebuild intake gradually." },
        { module: "Medication instructions", text: "[ Strict, lifelong abstinence from alcohol (alcohol aetiology). ] Monitor blood sugar — pancreatitis can cause new diabetes." },
        { module: "Activity restrictions", text: "Rest for the first week, then resume normal activity as tolerated." },
      ]),
      redFlags: [
        "Severe or recurrent abdominal pain",
        "Persistent vomiting or inability to eat",
        "Fever",
        "Breathlessness, or passing much less urine than usual",
        "A new abdominal swelling or lump, or abdominal distension",
        "Yellowing of the eyes or skin",
      ],
      patientActions: [
        "Attend the Surgery OPD in 2 weeks.",
        "[ Moderately severe / severe, or a collection suspected: CECT at about 4 weeks. ]",
        "[ Gallstone pancreatitis: cholecystectomy done in this admission (mild) / planned once collections resolve (moderately severe or severe) — date: ]",
        "Get a fasting lipid profile and HbA1c done before the follow-up.",
      ],
      primaryCareActions: [
        "Repeat CBC, renal function, LFT and serum calcium after 1 week.",
        "Monitor blood glucose.",
        "Reinforce alcohol cessation and arrange support.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Pain — epigastric, band-like, radiating to the back, eased by leaning forward; alcohol intake (quantity, last drink); known gallstones; drugs; previous episodes; family history. Examination: epigastric tenderness, distension, signs of a pleural effusion, Cullen's and Grey-Turner's signs, temperature, signs of shock. Baseline: amylase / lipase, LFT, serum calcium, triglycerides, glucose, haematocrit, renal function, blood gas, CRP; USG abdomen for gallstones; severity score (BISAP / modified Glasgow). Contrast CT only if the diagnosis is in doubt, or after 72 hours when not improving or a local complication is suspected — CT does not predict severity.",
    progressNote:
      "Each day — pain score; oral intake and tolerance (feed as tolerated; Ryle's / nasojejunal feeds if not tolerated by day 3–5); fluid balance and urine output; organ-failure parameters (respiratory rate, SpO₂, BP, creatinine) and whether any has lasted beyond 48 hours; haematocrit / urea trend; abdominal examination and girth, bladder pressure if tense; temperature and CRP trend. On improvement — pain settled; eating; markers down. Mild gallstone pancreatitis — cholecystectomy in the same admission; severe or with collections — interval cholecystectomy once they settle. Discharge with follow-up imaging as needed.",
  },

  // ---- 13 Liver abscess — after pancreatitis, BEFORE cbd_stones and perforation ----
  // ("ruptured liver abscess with peritonitis" must not fall to perforation; "liver abscess
  // with cholangitis" is still a liver-abscess discharge.)
  // Schwartz 11e p. 1370: amoebic — metronidazole 750 mg TDS 7–10 days; aspiration only for
  // large / non-responding / left-lobe abscesses; the cavity takes 30–300 days to resolve, so a
  // residual cavity on follow-up USG is expected. p. 1369: pyogenic — antibiotics are the
  // cornerstone (Schwartz says ≥ 8 weeks IV; current Indian practice is 4–6 weeks total with an
  // oral step-down, hence the blank). The luminal agent is standard practice, not in Schwartz.
  {
    key: "liver_abscess",
    label: "Liver abscess (amoebic / pyogenic)",
    match: /liver abscess|hepatic abscess|(amoebic|amebic|pyogenic) (liver )?abscess|abscess (of|in) the liver|\bALA\b/i,
    scaffold: {
      indication:
        "Patient was admitted with [fever, right upper abdominal pain and tender hepatomegaly], with imaging showing [a solitary / multiple] liver abscess[es], requiring [antibiotics and image-guided aspiration / pigtail drainage].",
      primaryDiagnosis: "[ Amoebic / pyogenic ] liver abscess — [ segment / lobe; size __ × __ cm; solitary / multiple; ruptured / not ruptured ]",
      procedure: {
        name: "[ USG-guided needle aspiration / percutaneous pigtail catheter drainage / laparotomy and drainage for rupture ]",
        anaesthesia: "[ Local anaesthesia / general anaesthesia ]",
        findings: "[ volume and nature of pus (anchovy-sauce / foul-smelling); pus culture and amoebic serology sent ]",
        drains: "[ pigtail catheter (__ Fr) / nil ]",
        complications: "Nil",
        outcome: "[ Aspirated / drained successfully ]",
      },
      clinicalCourse:
        "Admitted with [fever and right upper quadrant pain]; [ultrasound / CT] showed [a __ × __ cm abscess in segment __]. Treated with [intravenous metronidazole / broad-spectrum antibiotics] [and USG-guided aspiration / pigtail drainage on [date], draining __ ml of pus]. [Amoebic serology: __; pus culture: __.] Fever settled by day [__] and pain and tenderness improved. [Pigtail output fell to __ ml / 24 h and it was removed on [date].] The patient is afebrile and tolerating a normal diet at discharge.",
      medications: [
        { generic: "[ Metronidazole — amoebic abscess ]", strength: "800 mg", route: "PO", frequency: "TDS", duration: "[ to complete 10 days in total ]", indication: "amoebic liver abscess", status: "new" },
        { generic: "[ Diloxanide furoate — amoebic abscess ]", strength: "500 mg", route: "PO", frequency: "TDS", duration: "10 days", indication: "amoebic — after metronidazole, to clear the gut carrier state", status: "new" },
        { generic: "[ Culture-directed oral antibiotic ]", duration: "[ to complete 4–6 weeks in total ]", indication: "pyogenic liver abscess — per pus / blood culture", status: "new" },
        M.paracetamolSos,
        M.pantoprazole,
        M.ondansetron,
      ],
      advice: adv([
        { module: "Drain care", text: "[ Pigtail in situ: keep the bag below the level of the drain; record the daily output; do not pull on the tube; flush as taught. ]" },
        { module: "Medication instructions", text: "No alcohol at all while taking metronidazole — it causes severe vomiting. [ Stop alcohol altogether. ]" },
        { module: "Diet", text: "Normal, high-protein diet. Drink boiled or filtered water and wash hands before eating and after the toilet." },
        { module: "Activity restrictions", text: "Avoid strenuous activity and heavy lifting until the follow-up ultrasound." },
      ]),
      redFlags: [
        "Return of fever or rigors",
        "Worsening right upper abdominal pain, or sudden severe pain spreading over the abdomen",
        "Chest pain, cough or breathlessness",
        "Yellowing of the eyes or skin",
        "The pigtail falling out, blocking or leaking around the site",
        "Persistent vomiting or inability to take the tablets",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days [ with the drain-output chart ].",
        "Get a repeat ultrasound of the abdomen in [ 2–4 ] weeks — a healing cavity can take months to disappear.",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
        "Get the CBC and LFT repeated before the follow-up visit.",
      ],
      primaryCareActions: [
        "Support completion of the antibiotic course.",
        "Check blood sugar — undiagnosed diabetes is common with a pyogenic abscess.",
        "Counsel on alcohol cessation, safe drinking water and hand hygiene.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Fever — duration, rigors; right upper abdominal pain, radiation to the right shoulder, pleuritic pain or cough; recent dysentery; alcohol (quantity, country liquor / toddy); diabetes; biliary disease, recent ERCP or abdominal sepsis; jaundice; weight loss (a necrotic tumour can mimic an abscess). Examination: tender hepatomegaly, intercostal tenderness, right basal chest signs, jaundice, peritonism (rupture). Baseline: CBC, LFT, PT / INR, blood sugar / HbA1c, renal function, amoebic serology, blood culture, USG abdomen (size, segment, liquefaction, volume), CT if complicated or unclear, chest X-ray; pus culture if aspirated.",
    progressNote:
      "Each day — fever curve; pain and liver tenderness; pigtail output and character; TLC and LFT trend; chest signs; repeat USG when indicated. Discharge — afebrile for 48 hours, pain settled, drain output low or drain out.",
  },

  // ---- 14 CBD stones / cholangitis / obstructive jaundice — after liver_abscess, BEFORE
  //      perforation, acute_cholecystitis and lap_chole ----
  // lap_chole matches "choledocholithiasis" and "cholecystectomy", so "CBD stones — ERCP and
  // lap chole" would go to the planned-chole template unless this sits above it. pancreatitis
  // stays above this one: gallstone pancreatitis with ERCP is a pancreatitis discharge.
  // Schwartz 11e p. 1409: after cholangitis from stones, elective cholecystectomy ≈ 6 weeks
  // after resolution; indwelling stents need planned exchange. p. 1408: T-tube cholangiogram
  // before removal, several weeks after placement. NSAIDs left out: jaundice → AKI risk.
  {
    key: "cbd_stones",
    label: "CBD stones / cholangitis / obstructive jaundice",
    match: /choledocholithiasis|\bCBD (stones?|calcul\w*|exploration|clearance)|common bile duct (stones?|calcul\w*|exploration)|cholangitis|\bERCP\b|choledochotomy|choledocho-?duodenostomy|T-?tube|obstructive jaundice|biliary (stent|stricture|obstruction)/i,
    scaffold: {
      indication:
        "Patient was admitted with [jaundice / right upper abdominal pain / fever with chills] due to [common bile duct stones / acute cholangitis / obstructive jaundice], requiring [ERCP / CBD exploration].",
      primaryDiagnosis: "[ Choledocholithiasis / acute cholangitis (Tokyo grade __) / obstructive jaundice — cause: __ ] [ with cholelithiasis ]",
      procedure: {
        name: "[ ERCP with sphincterotomy, stone extraction ± biliary stenting ] / [ Laparoscopic / open cholecystectomy with CBD exploration ± T-tube ]",
        anaesthesia: "[ Sedation (ERCP) / general anaesthesia ]",
        findings: "[ CBD diameter; number and size of stones; clearance complete / incomplete; stent type and size; character of bile; cholangiogram ]",
        drains: "[ T-tube / subhepatic drain / nil ]",
        complications: "Nil",
        outcome: "[ Duct cleared / stent placed for incomplete clearance ]",
      },
      clinicalCourse:
        "Admitted with [jaundice / cholangitis] and resuscitated with intravenous fluids [and intravenous antibiotics]. [ERCP with sphincterotomy and stone extraction (± a __ Fr plastic stent) was performed on [date].] [Cholecystectomy with CBD exploration (over a T-tube) was performed on [date].] Fever settled, and the serum bilirubin fell from [__] to [__] mg/dL. The patient is afebrile and tolerating a normal diet [with the T-tube clamped / draining __ ml] at discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.ondansetron,
        { ...M.amoxClav, generic: "[ Amoxicillin-clavulanate — cholangitis, per blood / bile culture ]", duration: "[ … ]" },
      ],
      advice: adv([
        { module: "Diet", text: "Normal diet. A low-fat diet is advised until the gallbladder has been removed." },
        { module: "Drain care", text: "[ T-tube: keep the bag below the level of the wound; record the daily output; do not pull on the tube; clamp it only as instructed. ]" },
        { module: "Medication instructions", text: "[ A plastic stent was placed in the bile duct. It must be removed or changed on the date given — a stent left in too long blocks and causes fever and jaundice. ]" },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for 2 weeks [ 6 weeks after open surgery ]." },
      ]),
      redFlags: [
        "Fever with chills and rigors",
        "Yellowing of the eyes or skin getting deeper, dark urine or pale stools",
        "Severe upper abdominal pain going through to the back",
        "Black stools or vomiting blood",
        "The T-tube falling out, bile leaking around it, or pain when it is clamped",
        "Redness, swelling or discharge at a wound or the T-tube site",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7–14 days with a repeat LFT.",
        "[ Attend on [ date ] for the repeat ERCP to remove / change the biliary stent. ]",
        "[ Gallstones in place: attend for the planned laparoscopic cholecystectomy about 6 weeks after recovery. ]",
        "[ T-tube: attend on [ date ] for a T-tube cholangiogram; the tube is removed only after it shows a clear duct. ]",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
      ],
      primaryCareActions: [
        "Repeat LFT after 1–2 weeks.",
        "Refer back the same day if fever with jaundice recurs.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Charcot's triad — fever with rigors, right upper quadrant pain, jaundice; confusion or hypotension (Reynolds' pentad); jaundice — duration, progression, pruritus, pale stools, dark urine; painless progressive jaundice with weight loss and anorexia (malignancy); previous cholecystectomy, ERCP or stent; bleeding tendency. Examination: icterus, scratch marks, palpable gallbladder (Courvoisier), hepatomegaly, mass, signs of sepsis. Baseline: LFT with direct bilirubin, ALP, GGT; PT / INR; CBC; renal function; amylase / lipase; blood culture; USG abdomen (CBD diameter, stones); MRCP; CT if malignancy suspected; Tokyo grade.",
    progressNote:
      "Each day — temperature and sepsis parameters; bilirubin trend; INR; after ERCP — abdominal pain, amylase, melaena; T-tube output and colour; oral intake. Discharge — afebrile, bilirubin falling, eating; stent and cholecystectomy plan written down.",
  },

  // ---- 15 Blunt abdominal trauma — after cbd_stones, BEFORE perforation and obstruction ----
  // ("traumatic jejunal perforation" / "hollow viscus injury" must not fall to perforation.)
  // Schwartz 11e p. 228: after splenectomy for trauma, vaccinate against pneumococcus, Hib and
  // meningococcus, optimally > 14 days after injury. No NSAIDs: a solid-organ injury managed
  // non-operatively, and post-haemorrhage / contrast kidneys.
  {
    key: "abdominal_trauma",
    label: "Blunt abdominal trauma (operated / non-operative)",
    match: /(blunt|penetrating) (trauma )?(to the )?abdom\w*|abdominal (trauma|injury)|trauma abdomen|(splenic|spleen|liver|hepatic|mesenteric|bowel|hollow viscus|pancreatic|duodenal) (injury|injuries|laceration|tear|trauma)|ha?emoperitoneum|trauma laparotomy|(stab|gunshot|penetrating) (injury|wound)[^.]{0,30}abdom/i,
    scaffold: {
      indication:
        "Patient was admitted following [a road traffic accident / fall from height / assault] on [date] with blunt abdominal trauma; [FAST / CT] showed [grade __ splenic / liver injury / haemoperitoneum / pneumoperitoneum], managed [non-operatively / with exploratory laparotomy].",
      primaryDiagnosis: "Blunt trauma abdomen with [ grade __ (AAST) splenic / liver injury / mesenteric tear / bowel perforation ] [ ; associated injuries ]",
      procedure: {
        name: "[ Non-operative management with serial examination ] / [ Exploratory laparotomy + splenectomy / splenorrhaphy / liver packing / repair or resection-anastomosis of bowel ]",
        anaesthesia: "[ General anaesthesia if operated ]",
        findings: "[ volume of haemoperitoneum; organ and grade of each injury; procedure for each; contamination ]",
        drains: "[ as placed ]",
        complications: "[ nil / specify ]",
        outcome: "[ managed non-operatively / laparotomy completed ]",
      },
      clinicalCourse:
        "Received in the emergency department [haemodynamically stable / in shock] and resuscitated as per ATLS [; __ units of blood transfused]. [The case was registered as a medico-legal case.] [CT abdomen showed __.] [Managed non-operatively with bed rest, serial abdominal examination and haemoglobin monitoring; haemoglobin remained stable at __ g/dL.] [Underwent exploratory laparotomy on [date]: __.] Oral intake was resumed and the patient mobilised [; drains were removed on POD __]. The patient is haemodynamically stable, afebrile, tolerating a normal diet and ambulant at discharge.",
      medications: [
        M.paracetamol,
        { generic: "[ Tramadol — only if pain is not controlled ]", strength: "50 mg", route: "PO", frequency: "SOS", status: "prn" },
        M.pantoprazole,
        M.lactulose,
        { generic: "[ Pneumococcal, Haemophilus influenzae type b and meningococcal vaccines — after splenectomy ]", indication: "after splenectomy — from day 14 after the injury, if not given before discharge", status: "new" },
      ],
      advice: adv([
        { module: "Activity restrictions", text: "No contact sports, heavy lifting, strenuous exercise or riding a two-wheeler for [ … ] weeks after a spleen or liver injury, even when you feel well — late bleeding can happen." },
        { module: "Wound care", text: "[ If operated: support the wound when coughing; keep it clean and dry. ]" },
        { module: "Lifting restrictions", text: "[ If operated: no lifting over 5 kg for 6–8 weeks. ]" },
        { module: "Medication instructions", text: "Avoid pain-killers of the NSAID group (ibuprofen, diclofenac) and blood thinners unless the surgical team prescribes them. [ After splenectomy: carry a card saying you have no spleen, have the influenza vaccine every year, and see a doctor the same day for any fever. ]" },
      ]),
      redFlags: [
        "Sudden or increasing abdominal pain, or pain in the left shoulder tip",
        "Dizziness, fainting, a fast heartbeat or looking pale",
        "Abdominal distension, persistent vomiting, or not passing stool or flatus",
        "Fever [ — after splenectomy, any fever ]",
        "Yellowing of the eyes or skin",
        "Blood in the urine",
        "Wound redness, swelling or discharge (if operated)",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days.",
        "[ If operated: attend for suture removal on postoperative day 12–14. ]",
        "[ After splenectomy: receive the pneumococcal, Hib and meningococcal vaccines on [ date ] if not already given. ]",
        "[ Attend for the repeat scan on [ date ] as advised for a high-grade injury. ]",
      ],
      primaryCareActions: [
        "Check haemoglobin if the patient feels faint or looks pale.",
        "[ After splenectomy: confirm the vaccines are complete, give the yearly influenza vaccine, and treat any fever promptly. ]",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Mechanism — road traffic accident (vehicle, speed, seat-belt, two-wheeler with or without helmet), fall (height), assault; time of injury; loss of consciousness; abdominal pain and its site, left shoulder-tip pain (Kehr's sign); vomiting; haematuria; other injuries; alcohol; anticoagulants or antiplatelets; last meal. Examination: ATLS primary survey; pulse, BP, shock index; seat-belt sign and bruising; distension, tenderness, guarding; FAST; chest, pelvis, spine and head; urethral meatus. Baseline: serial haemoglobin, blood group and cross-match, eFAST, CT abdomen with contrast if stable, urine for blood, amylase, LFT, renal function, chest and pelvic X-rays; medico-legal registration.",
    progressNote:
      "Non-operative — at first every 4–6 hours, then daily: pulse, BP, abdominal girth and examination, haemoglobin trend; diet and mobilisation once stable. Operated — as the perforation template. Discharge — haemoglobin stable, pain settled, eating and mobilising; activity restriction and vaccine plan written down.",
  },


  // ---- 05 Acute intestinal obstruction ----
  {
    key: "obstruction",
    label: "Acute intestinal obstruction",
    match: /intestinal obstruction|bowel obstruction|gall\s*stone ileus|\bSAIO\b|adhesive obstruction|obstructed hernia|sigmoid volvulus|\bvolvulus\b|intussusception|adhesiolysis|drip and suck/i,
    scaffold: {
      indication:
        "Patient was admitted with colicky abdominal pain, distension, vomiting and absolute constipation, with radiological features of intestinal obstruction, requiring inpatient management [and surgery].",
      primaryDiagnosis: "Acute intestinal obstruction [cause: adhesive / obstructed hernia / malignant / bands / volvulus / intussusception / stricture]",
      procedure: {
        name: "[ Conservative management (drip and suck) — or exploratory laparotomy ± adhesiolysis ± resection-anastomosis ± stoma ]",
        anaesthesia: "[ General anaesthesia if operated ]",
        findings: "[ level and cause of obstruction; bowel viability; procedure performed; length resected; anastomosis or stoma ]",
        drains: "[ as placed ]",
        complications: "[ nil / specify ]",
        outcome: "[ obstruction settled conservatively / laparotomy completed ]",
      },
      clinicalCourse:
        "Managed conservatively with nasogastric decompression, intravenous fluids and correction of electrolytes. The obstruction settled with return of bowel sounds and passage of flatus and stool. Oral intake was gradually reintroduced and tolerated. The patient is comfortable, tolerating orals and passing stool at discharge. [Surgical variant: replace with the laparotomy course.]",
      medications: [
        M.paracetamolSos,
        M.ondansetron,
        { ...M.lactulose, generic: "[ Lactulose — only if constipated ]", indication: "keep stools soft; bulk-forming agents avoided after adhesive obstruction" },
      ],
      advice: adv([
        { module: "Diet", text: "Small, frequent, low-residue meals for the first week, then a normal diet. Keep well hydrated." },
        { module: "Activity restrictions", text: "[ Wound and lifting advice if operated (as the perforation template). ]" },
        { module: "Medication instructions", text: "Keep the bowels regular; avoid becoming constipated." },
      ]),
      redFlags: [
        "Colicky abdominal pain with vomiting and distension returning",
        "Not passing stool or flatus",
        "Persistent or high fever",
        "Wound redness, swelling or discharge (if operated)",
      ],
      patientActions: [
        "Attend the Surgery OPD in 1–2 weeks.",
        "Attend for a colonoscopy / CT as advised where a cause has not been found or malignancy is suspected.",
        "Attend for suture removal if operated.",
        "[ Sigmoid volvulus decompressed: elective sigmoid colectomy, ideally in this admission — recurrence is common. ]",
        "[ Obstructed hernia reduced: attend for elective hernia repair. ]",
      ],
      primaryCareActions: [
        "Keep the bowels regular.",
        "Refer back promptly if obstructive symptoms recur.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Pain — colicky suggests simple obstruction, constant suggests strangulation; vomiting — early is proximal, feculent is distal or late; distension; time of last flatus and stool; previous abdominal or pelvic surgery (adhesions); known hernia; altered bowel habit, bleeding per rectum, weight loss (malignancy). Examination: distension, visible peristalsis, scars, all hernial orifices, bowel sounds, digital rectal examination. Baseline: erect and supine abdominal X-ray, CT abdomen with contrast, electrolytes, renal function, CBC, lactate.",
    progressNote:
      "Each day — Ryle's output volume and character; abdominal girth; flatus / stool passed; fluid balance and urine output; electrolytes (potassium); signs that raise a strangulation question — rising pulse, fever, pain becoming continuous, localised tenderness or guarding, rising TLC or lactate. Water-soluble contrast if given — contrast in the colon on the [ __ ]-hour film. Not settling by 48–72 hours, or any strangulation sign — the question of operation goes to the senior. On settling — Ryle's clamped, orals tolerated, tube removed, diet advanced. Plan discharge.",
  },

  // ---- 03 Abdominal wall hernia ----
  {
    key: "hernia",
    label: "Abdominal wall hernia",
    match: /hernio(plasty|rrhaphy)|(?<!hiatus |hiatal |diaphragmatic |paraoesophageal |para-oesophageal )\bhernia\b|mesh repair/i,
    families: ["hernia"],
    scaffold: {
      indication:
        "Patient was admitted with a [reducible / irreducible / obstructed] [right / left / bilateral] [inguinal / umbilical / incisional] hernia requiring surgical repair.",
      primaryDiagnosis: "[ Right / left ] [ inguinal / femoral / umbilical / incisional ] hernia",
      procedure: {
        name: "[ Site ] hernioplasty (mesh repair)",
        anaesthesia: "[ General / spinal ] anaesthesia",
        findings: "[ defect size; contents and their viability; sac dealt with; mesh type, size and fixation ]",
        drains: "[ nil / suction drain (large ventral) ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      clinicalCourse:
        "[Site] hernioplasty with mesh repair was performed on [date] under [general / spinal] anaesthesia. Recovery was uneventful; the patient passed urine without difficulty, mobilised and resumed oral intake. Pain was controlled on oral analgesia. The wound is healthy at discharge [and the drain, if placed, was removed on POD __].",
      medications: [M.paracetamol, M.pantoprazole, M.diclofenac, { ...M.lactulose, indication: "avoid straining" }],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry; remove the dressing after 48 hours if dry." },
        { module: "Lifting restrictions", text: "Resume normal activities, including lifting, as pain allows [ large incisional / ventral mesh repair: avoid heavy lifting for 4–6 weeks ]." },
        { module: "Activity restrictions", text: "Walk from the day of surgery and increase activity as comfort allows. Treat constipation and cough early." },
        { module: "Return-to-work advice", text: "Light or desk work in 1–2 weeks; heavy manual work usually by 3–4 weeks." },
        { module: "Activity restrictions", text: "[ Scrotal support for inguinal repair with scrotal swelling. ]" },
      ]),
      redFlags: [
        ...RF_WOUND,
        "A new or returning lump at the operation site",
        "Severe scrotal swelling or scrotal pain (inguinal repair)",
        "Inability to pass urine",
        "Vomiting with abdominal distension and not passing stool (recurrent obstruction)",
      ],
      patientActions: [
        OPD7,
        "Attend for suture removal on postoperative day 10.",
        "Return to heavy manual work usually by 3–4 weeks, as pain allows [ large incisional / ventral repair: after 4–6 weeks ].",
      ],
      primaryCareActions: ["Treat chronic cough / constipation / prostatism to reduce recurrence."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration; reducibility (spontaneous / manual / irreducible); dragging pain; episodes of obstruction (colicky pain, vomiting, constipation); precipitating factors — chronic cough, straining at stool, prostatism, ascites, heavy work; previous repair on either side. Examination: cough impulse, defect and contents, reducibility, testis and cord, the contralateral side, external genitalia. Baseline: pre-anaesthetic workup; USG if the diagnosis is uncertain.",
    progressNote:
      "POD 0 — pain; first void after surgery [ passed / catheterised ] (retention is common after spinal anaesthesia in older men); vitals; scrotal swelling or haematoma. POD 1 — ambulant; orals; wound; scrotal / cord collection. Plan: discharge with advice.",
  },

  HYDROCELE,

  // ---- 02 Acute appendicitis ----
  {
    key: "appendicectomy",
    label: "Acute appendicitis",
    match: /appendic(ectom|itis|ular (lump|abscess|mass|perforation))|perforated append/i,
    families: ["appendicectomy"],
    scaffold: {
      indication:
        "Patient was admitted with acute right iliac fossa pain, anorexia [and fever / vomiting] and clinical features of acute appendicitis, requiring inpatient management and appendicectomy.",
      primaryDiagnosis: "Acute appendicitis [uncomplicated / perforated / appendicular abscess / lump]",
      procedure: {
        name: "[ Laparoscopic / open ] appendicectomy",
        anaesthesia: "General anaesthesia",
        findings: "[ inflamed / gangrenous / perforated appendix; local pus; faecolith; base and mesoappendix ]",
        drains: "[ pelvic drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; appendix sent for histopathology.",
      },
      clinicalCourse:
        "Admitted with acute appendicitis and taken up for [laparoscopic / open] appendicectomy on [date] after resuscitation with intravenous fluids and antibiotics. Recovery was uneventful; oral intake was resumed and tolerated, and the patient mobilised progressively. [The drain was removed on POD __.] The patient is afebrile, ambulant and tolerating a normal diet at discharge.",
      medications: [
        M.paracetamol,
        { ...M.pantoprazole, frequency: "OD" },
        M.diclofenac,
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the wound clean and dry. The dressing may be removed after 48 hours if the wound is dry." },
        { module: "Diet", text: "Resume a normal diet gradually as tolerated." },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for 2–4 weeks." },
      ]),
      redFlags: [...RF_WOUND, ...RF_ABDO, "Inability to tolerate any oral intake"],
      patientActions: [
        OPD7,
        "Attend for suture removal on postoperative day 7–10.",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
        "[ Appendicular lump / abscess managed without surgery: colonoscopy / CT if over 40, and review for interval appendicectomy. ]",
        "Bring the histopathology report to the follow-up visit (it rules out a carcinoid or mucocele).",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Migratory pain (peri-umbilical to RIF); anorexia; nausea and vomiting; fever; diarrhoea or urinary symptoms; last menstrual period and gynaecological history in women. Examination: RIF tenderness, guarding, rebound, Rovsing's and psoas signs, mass, temperature. Baseline: CBC with differential, CRP, urine routine, urine pregnancy test in women; USG or CT if diagnosis unclear; Alvarado score.",
    progressNote:
      "POD 0 — orals as tolerated; pain; vitals; passed urine. POD 1 — diet; ambulant; wound; temperature; [ drain output ]. Perforated or gangrenous — antibiotics about 4 days after source control (no more than 24 hours if gangrenous without perforation); fever, diarrhoea or tenesmus around POD 5–7 raises a pelvic-collection question. Discharge when afebrile, eating and drain out.",
  },

  // ---- 01a Acute cholecystitis (acute admission) — checked before the elective template ----
  {
    key: "acute_cholecystitis",
    label: "Acute cholecystitis",
    match: /\bcholecystitis\b|gall\s*bladder perforation|empyema[^.]*gall\s*bladder|gangrenous cholecystitis|mirizzi/i,
    scaffold: {
      indication:
        "Patient was admitted with acute right upper abdominal pain, fever and ultrasound evidence of acute calculous cholecystitis, requiring inpatient management with intravenous fluids, analgesia and antibiotics [and laparoscopic cholecystectomy].",
      primaryDiagnosis: "Acute [ calculous / acalculous ] cholecystitis — Tokyo Grade [ I / II / III ]",
      procedure: {
        name: "[ Laparoscopic cholecystectomy (early, within 72 h / same admission) / percutaneous cholecystostomy / none — managed without surgery ]",
        anaesthesia: "General anaesthesia",
        findings: "[ acutely inflamed, distended, thick-walled gallbladder; pericholecystic fluid; dense adhesions; empyema / mucocele ]",
        drains: "[ subhepatic drain ]",
        complications: "Nil",
        outcome: "[ Procedure completed successfully; gallbladder sent for histopathology / managed without surgery ]",
      },
      clinicalCourse:
        "Admitted with acute calculous cholecystitis and managed initially with intravenous fluids, analgesia and intravenous antibiotics, with a good clinical response. [The patient underwent laparoscopic cholecystectomy on [date] during the same admission / settled on conservative management and is planned for an interval laparoscopic cholecystectomy in 6 weeks.] [The subhepatic drain remained non-bilious and was removed on POD __.] The patient is afebrile, ambulant and tolerating a normal diet at discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.diclofenac,
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the port-site wounds clean and dry. Sponge bath only for the first 48 hours; the dressings may then be removed and the wounds washed gently." },
        { module: "Diet", text: "Resume a normal diet. A low-fat diet is advised for the first 2–4 weeks." },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for 2 weeks. Walking is encouraged from day one." },
        { module: "Drain care", text: "[ If a drain is in situ: keep the bag below the level of the wound, record the daily output, and attend for removal as advised. ]" },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Return of fever or rigors",
        "Worsening abdominal pain, or pain in the right shoulder tip",
        "Persistent vomiting or inability to keep food down",
        "Yellowing of the eyes or skin, dark urine or pale stools",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days for a wound review and suture / clip removal.",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
        HPE,
        "[ If managed conservatively: attend for the planned interval cholecystectomy in 6 weeks. ]",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset, site and character of pain; radiation to the back or right shoulder; relation to fatty food; fever with rigors; nausea and vomiting; jaundice, pruritus, pale stools, dark urine; number and duration of previous attacks; previous USG / ERCP. Examination: temperature, Murphy's sign, a palpable tender gallbladder or mass, jaundice, guarding. Baseline: CBC with differential, CRP, LFT, amylase / lipase, USG abdomen (wall thickness, pericholecystic fluid, stone size, CBD diameter); MRCP if the CBD is dilated or the LFT is deranged; Tokyo Guidelines grade.",
    progressNote:
      "Each day (conservative phase) — temperature trend; pain; Murphy's sign; TLC / CRP trend; oral intake; jaundice. Post-operative — drain output [ __ ml ] and character (bile in the drain raises a bile-leak question — LFT, USG); orals; port sites; temperature. Plan: early cholecystectomy in the same admission where fit (Tokyo Guidelines 2018), otherwise interval; discharge when afebrile and eating.",
  },
  // Sits below appendicectomy and acute_cholecystitis so a perforated appendix or gallbladder
  // gets its own discharge rather than the laparotomy one.
  // ---- 04 Perforation peritonitis ----
  {
    key: "perforation",
    label: "Perforation peritonitis",
    match: /perforation|peritonitis|hollow viscus|graham patch|omentopexy|pneumoperitoneum/i,
    scaffold: {
      indication:
        "Patient was admitted with acute abdominal pain and clinical features of generalised peritonitis with radiological pneumoperitoneum, requiring emergency exploratory laparotomy.",
      primaryDiagnosis: "Hollow viscus perforation with peritonitis [prepyloric / duodenal / gastric / ileal / appendicular]",
      procedure: {
        name: "Exploratory laparotomy + [ primary closure with omentopexy / resection-anastomosis / stoma ] + peritoneal lavage",
        anaesthesia: "General anaesthesia",
        findings: "[ site and size of perforation; volume and nature of contamination; procedure performed; biopsy from the ulcer edge; peritoneal lavage volume ]",
        drains: "[ number and site — pelvic / subhepatic / paracolic ]",
        complications: "[ nil / specify ]",
        outcome: "[ completed as planned / damage control ]",
      },
      clinicalCourse:
        "Admitted in [sepsis / septic shock], resuscitated with intravenous fluids, broad-spectrum antibiotics and nasogastric decompression, and taken up for emergency laparotomy on [date]. A [site] perforation was found and [primary closure with omentopexy / resection-anastomosis / stoma] performed with thorough peritoneal lavage and drainage. Postoperatively the patient was managed [in the HDU / ICU with inotropic and ventilatory support], gradually weaned. Oral intake was resumed once bowel function returned and drains were removed sequentially. The patient is afebrile, tolerating orals and ambulant at discharge, with abdominal sutures in situ.",
      medications: [
        { generic: "[ Antibiotic — only if a course continues after discharge ]", duration: "[ … ]", indication: "most courses finish in hospital: ~4 days after source control (STOP-IT); ≤ 24 h after an uncomplicated or gangrenous non-perforated case", status: "new" },
        { generic: "[ Ileal (enteric) perforation: complete the culture-directed enteric-fever course ]", status: "new" },
        { generic: "[ Tubercular perforation: anti-tubercular treatment after histopathology ]", status: "new" },
        { ...M.pantoprazole, frequency: "BD", duration: "4 to 6 weeks", indication: "peptic perforation" },
        { generic: "[ H. pylori: test (ulcer-edge biopsy / stool antigen) and eradicate / empirical triple therapy ]", indication: "peptic perforation", status: "new" },
        M.paracetamolSos,
        { generic: "High-protein oral nutritional supplement", frequency: "BD", status: "new" },
      ],
      advice: adv([
        { module: "Wound care", text: "Support the wound when coughing. Keep it clean and dry; attend for a dressing review as advised." },
        { module: "Diet", text: "Build up the diet gradually with small, frequent meals." },
        { module: "Mobilisation", text: "Increase activity a little each day; continue chest physiotherapy and leg exercises." },
        { module: "Lifting restrictions", text: "No lifting over 5 kg and no strenuous activity for 6–8 weeks (risk of incisional hernia)." },
        { module: "Medication instructions", text: "Take the acid-suppression tablet as prescribed and avoid pain-killers of the NSAID group, smoking and alcohol (peptic perforation)." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "The wound edges separating, or a sudden gush of fluid from the wound",
        "Worsening abdominal pain or distension",
        "Not passing stool or flatus, or persistent vomiting",
        "Breathlessness",
        "Passing much less urine than usual",
      ],
      patientActions: [
        OPD7,
        "Attend for suture removal on postoperative day 12–14.",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
        "Upper GI endoscopy at 6–8 weeks — mandatory after a gastric ulcer perforation, to confirm healing and exclude malignancy.",
        "Bring any histopathology report to follow-up.",
      ],
      primaryCareActions: [
        "Monitor the wound; remove sutures if the hospital OPD is not accessible.",
        "Repeat renal function after 1 week if there was acute kidney injury during admission.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Sudden severe pain becoming generalised; time of onset; previous dyspepsia, NSAID, steroid, alcohol or smoking history; fever for weeks and contacts with fever (enteric); trauma. Examination: distension, generalised guarding and rigidity, absent bowel sounds, obliteration of liver dullness, temperature, signs of shock. Baseline: erect chest / abdominal X-ray for free gas, CBC, renal function, electrolytes, blood gas and lactate, blood cultures before antibiotics, blood group and cross-match; CT abdomen if the picture is unclear.",
    progressNote:
      "POD 0–2 (ICU / HDU if needed) — vitals, inotrope requirement, ventilation, urine output, Ryle's output, blood gas / lactate; abdomen soft / distended; each drain — output and character (bilious or feculent after repair raises a leak / fistula question). POD 3–5 — sepsis parameters; ileus resolving; flatus passed on POD [ __ ]; orals started; drains reducing; antibiotic day [ __ ] — with source control most need about 4 days, and no more than 24 hours for a gastroduodenal perforation operated within 24 hours. POD 5–8 — wound for SSI (open and drain if pus) and for serosanguinous discharge that can herald a burst abdomen; chest. POD 6+ — tolerating diet; drains removed; mobilising. Discharge when afebrile, eating and the wound settled.",
  },

  // ---- 01b Gallstone disease / cholelithiasis (planned laparoscopic cholecystectomy) ----
  {
    key: "lap_chole",
    label: "Gallstone disease (planned lap cholecystectomy)",
    match: /\blap\s*chole\b|cholelithiasis|gall\s*stones?\s*disease|gall\s*stones?(?!\s*ileus)|chol(e|y)cystectom|choledocholithiasis|biliary colic/i,
    families: ["lap_chole"],
    scaffold: {
      indication:
        "Patient was admitted for an elective laparoscopic cholecystectomy for symptomatic gallstone disease [with a history of recurrent biliary colic].",
      primaryDiagnosis: "Gallstone disease (cholelithiasis)",
      procedure: {
        name: "Elective laparoscopic cholecystectomy",
        anaesthesia: "General anaesthesia",
        findings: "[ gallbladder wall, adhesions, Calot's triangle anatomy, number of stones ]",
        drains: "[ subhepatic drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; gallbladder sent for histopathology.",
      },
      clinicalCourse:
        "The patient was admitted for an elective laparoscopic cholecystectomy for symptomatic cholelithiasis. Pre-anaesthetic assessment was completed and the patient was cleared for surgery. Laparoscopic cholecystectomy was performed on [date]; the postoperative period was uneventful, oral intake was resumed and the patient remained haemodynamically stable. [The subhepatic drain remained non-bilious and was removed on POD __.] The patient is afebrile, ambulant and tolerating a normal diet at discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.diclofenac,
      ],
      advice: adv([
        { module: "Wound care", text: "Keep the port-site wounds clean and dry. Sponge bath only for the first 48 hours; the dressings may then be removed and the wounds washed gently." },
        { module: "Diet", text: "Resume a normal diet. A low-fat diet is advised for the first 2–4 weeks." },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for 2 weeks. Walking is encouraged from day one." },
        { module: "Drain care", text: "[ If a drain is in situ: keep the bag below the level of the wound, record the daily output, and attend for removal as advised. ]" },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Worsening abdominal pain, or pain in the right shoulder tip",
        "Persistent vomiting or inability to keep food down",
        "Yellowing of the eyes or skin, dark urine or pale stools",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days for a wound review and suture / clip removal.",
        HPE,
        "If the histopathology report shows carcinoma, return urgently for an HPB / oncology referral.",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration and pattern of biliary colic; relation to fatty food; any episodes of fever, jaundice or pancreatitis (these change the plan); previous USG confirming stones; fitness for anaesthesia and comorbidities. Examination: usually unremarkable between attacks; Murphy's sign, scars, herniae. Baseline: USG abdomen, LFT, CBC, pre-anaesthetic workup; MRCP only if the CBD is dilated or the LFT is deranged.",
    progressNote:
      "POD 0 — orals once awake and not nauseated; pain and shoulder-tip pain; vitals; passed urine; drain output and character if one was placed. POD 1 — diet; ambulant; port sites; temperature; jaundice, bilious drain or increasing pain (raises a bile-leak or duct-injury question). Plan: remove the drain if placed and output is minimal and non-bilious; discharge with advice.",
  },

  // ---- 10 Benign anorectal disease ----
  {
    key: "perianal",
    label: "Benign anorectal disease",
    match: /haemorrhoid|hemorrhoid|fissure[- ]?in[- ]?ano|anal fissure|fistula[- ]?in[- ]?ano|anal fistula|fistulectom|fistulotom|(lateral internal )?sphincterotom|pilonidal|\bLIFT\b|\bseton\b/i,
    families: ["perianal"],
    scaffold: {
      indication:
        "Patient was admitted with [bleeding per rectum / perianal pain / perianal discharge] due to [grade III–IV haemorrhoids / chronic anal fissure / fistula-in-ano], requiring surgical management.",
      primaryDiagnosis: "[ Grade III / IV haemorrhoids / chronic anal fissure / inter- or trans-sphincteric fistula-in-ano ]",
      procedure: {
        name: "[ Haemorrhoidectomy / lateral internal sphincterotomy / fistulotomy / fistulectomy / seton / LIFT ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ position and grade of piles / fissure with sentinel tag and hypertrophied papilla / fistula tract, internal and external openings, relation to sphincter, seton placed ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Procedure completed successfully [; tissue sent for histopathology].",
      },
      clinicalCourse:
        "Underwent [procedure] under [spinal / general] anaesthesia on [date]. Postoperatively pain was controlled with regular analgesia and stool softeners, and the patient passed urine and had a bowel motion without difficulty. Sitz baths were commenced. The patient is comfortable, passing stool and voiding normally at discharge.",
      medications: [
        { ...M.paracetamol, duration: "5–7 days" },
        { ...M.diclofenac, frequency: "BD", duration: "5 days" },
        { generic: "Lactulose", dose: "15–30 ml", route: "PO", frequency: "HS, titrate to a soft stool", duration: "2 weeks", status: "new" },
        { generic: "Isabgol (psyllium husk)", dose: "1 teaspoon", route: "PO", frequency: "HS", status: "new" },
        { generic: "[ Metronidazole — haemorrhoidectomy only ]", strength: "400 mg", route: "PO", frequency: "TDS", duration: "5 days", indication: "reduces pain after haemorrhoidectomy", status: "new" },
        { generic: "[ Local anaesthetic ointment after haemorrhoidectomy / GTN or diltiazem only for a fissure managed without surgery ]", route: "topical", frequency: "BD", status: "new" },
      ],
      advice: adv([
        { module: "Wound care", text: "Warm sitz baths 2–3 times a day and after every bowel motion. Keep the area clean and dry between baths; avoid local trauma." },
        { module: "Diet", text: "A high-fibre diet with plenty of fluids to keep the stool soft." },
        { module: "Medication instructions", text: "Take the laxative regularly so that stools stay soft; do not become constipated. Apply the prescribed ointment." },
        { module: "Activity restrictions", text: "Avoid prolonged sitting and heavy lifting for 2 weeks." },
        { module: "Wound care", text: "[ Do not remove the seton; keep it clean. ]" },
        { module: "Wound care", text: "[ Pilonidal: open-wound dressings / flap care as taught; keep the natal cleft free of hair. ]" },
      ]),
      redFlags: [
        "Heavy or continuous bleeding from the back passage",
        "Inability to pass urine",
        "Inability to pass stool, or severe pain on defecation",
        "Persistent or high fever",
        "Increasing perianal pain, swelling or discharge",
        "Loss of control of stool or flatus",
      ],
      patientActions: [
        "Attend the Surgery OPD in 1 week.",
        "Continue the sitz baths and stool softeners until reviewed.",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
        "Bring any histopathology report to follow-up.",
        "[ Attend for seton adjustment or removal as scheduled. ]",
      ],
      primaryCareActions: [
        "Reinforce stool softeners and sitz baths.",
        "Review a non-healing wound or recurrent symptoms.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Bleeding — colour, whether on or after defecation, dripping versus mixed with stool; prolapse — reduces on its own, needs manual reduction, or irreducible; pain — a fissure gives severe pain on defecation lasting hours, an abscess gives constant throbbing pain; discharge; itching; bowel habit and constipation; previous anorectal surgery; risk factors for a specific fistula cause (inflammatory bowel disease, tuberculosis, immunosuppression). Examination: perianal inspection (tags, external opening, sentinel pile), digital rectal examination unless too painful, proctoscopy or sigmoidoscopy, examination under anaesthesia. Baseline: haemoglobin if there is chronic bleeding; colonoscopy if over 40 or with alarm features; MRI pelvis for a complex fistula.",
    progressNote:
      "POD 0 — pain score; first void [ passed / catheterised ]; bleeding; sitz baths started. POD 1 — first bowel motion [ passed / not yet ] and pain with it; analgesia; voiding; wound / pack. Plan: discharge with sitz baths, stool softeners and follow-up.",
  },
  // ---- 16 Varicose veins — after perianal (no collisions with existing regexes) ----
  // Schwartz 11e p. 996: after sclerotherapy, bandage 3–5 days then stockings ≥ 2 weeks;
  // ablation risks DVT, ecchymosis and saphenous nerve injury. The post-ablation duplex is
  // standard practice (heat-induced thrombus), not stated in Schwartz.
  {
    key: "varicose_veins",
    label: "Varicose veins (ligation-stripping / RFA / EVLA / sclerotherapy)",
    match: /varicos|\bGSV\b|\bSSV\b|saphenous|sapheno-?(femoral|popliteal)|\bSF[JP]\b|endovenous|\bEVL[AT]\b|sclerotherap|perforator (ligation|incompetence)|\bSEPS\b|venous (ulcer|insufficiency)|\bCVI\b/i,
    scaffold: {
      indication:
        "Patient was admitted for [SFJ ligation with GSV stripping / endovenous laser / radiofrequency ablation / foam sclerotherapy] for symptomatic varicose veins of the [right / left / both] lower limb[s] [with venous eczema / lipodermatosclerosis / healed / active venous ulcer].",
      primaryDiagnosis: "Primary varicose veins [ right / left ] lower limb — [ GSV / SSV reflux; CEAP C__ ]",
      procedure: {
        name: "[ SFJ ligation + GSV stripping (to knee) + stab avulsions / EVLA / RFA of GSV ± foam sclerotherapy / SPJ ligation ]",
        anaesthesia: "[ Spinal / tumescent local / general ] anaesthesia",
        findings: "[ SFJ / SPJ competence; tributaries ligated; length of vein stripped or ablated; perforators dealt with ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date] under [spinal / tumescent local] anaesthesia. The limb was wrapped in a compression bandage and mobilisation began [the same day / on POD 1]. There was no groin haematoma and no calf pain or swelling. The patient is ambulant and comfortable at discharge with the compression bandage / stocking in place.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.diclofenac,
        { generic: "Graduated compression stockings (class II)", indication: "[ thigh / below-knee ] length — wear during the day", status: "new" },
      ],
      advice: adv([
        { module: "Mobilisation", text: "Walk for 10 minutes every hour while awake, starting today. Do not sit or stand still for long; when sitting, keep the leg raised. Avoid long journeys for 2 weeks." },
        { module: "Wound care", text: "Keep the bandage on for [ 48 hours / 3–5 days ] as advised, then wear the compression stocking during the day for at least [ 2–6 ] weeks. Bruising and tender cords along the treated vein are expected and settle over a few weeks." },
        { module: "Return-to-work advice", text: "Desk work after [ 1 ] week; work that involves long standing or heavy lifting after [ 2–3 ] weeks." },
      ]),
      redFlags: [
        "Pain, swelling or tightness in the calf or thigh",
        "Sudden breathlessness or chest pain",
        "Bleeding that soaks through the bandage",
        ...RF_WOUND,
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days for a wound review [ and a duplex scan to confirm closure of the vein after ablation ].",
        "Attend for suture removal on postoperative day 7–10 [ / sutures are absorbable ].",
        "Wear the compression stocking as advised.",
      ],
      primaryCareActions: [
        "Encourage walking, weight control and leg elevation.",
        "[ Venous ulcer: continue compression and dressings until healed. ]",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Symptoms — aching, heaviness, itching, night cramps, swelling by evening; duration and progression; bleeding from a vein; ulcer; previous DVT (deep-system patency decides the operation); pregnancy, oral contraceptives; occupation with prolonged standing; previous surgery or sclerotherapy. Examination: distribution (GSV / SSV), skin changes (pigmentation, eczema, lipodermatosclerosis, ulcer), cough impulse at the SFJ, Trendelenburg / tourniquet tests, peripheral pulses (ABPI before compression). Baseline: venous duplex (reflux, deep-system patency), CBC, coagulation, pre-anaesthetic workup.",
    progressNote:
      "POD 0 — mobilised; bandage intact; groin and stab wounds; bleeding. POD 1 — calf soft and non-tender; walking; bandage / stocking in place. Plan: discharge with advice.",
  },

  // ---- 17 Diabetic foot — after varicose_veins, BEFORE abscess_drainage ----
  // ("diabetic foot abscess, debridement" must reach this, not the generic abscess template.)
  // Schwartz 11e p. 2014: neuropathy + PAD + impaired immunity; > 60% of non-traumatic
  // amputations are in diabetics; multidisciplinary care. p. 297: basic wound principles —
  // blood flow, infection control, debridement, dressing, OFFLOADING. NSAIDs left out
  // (diabetic kidney); glucose-lowering doses are physician-set, so blanks.
  {
    key: "diabetic_foot",
    label: "Diabetic foot — debridement / amputation",
    match: /diabetic foot|\bDFU\b|wagner|neuropathic ulcer|charcot foot|(toe|ray|forefoot|transmetatarsal|chopart|lisfranc|syme'?s?|below[- ]knee|above[- ]knee|guillotine) amputation|\b[AB]KA\b|amputation of (the )?(\w+ )?(toe|ray|foot|leg|limb)|(wet|dry) gangrene|gangrene (of )?(the )?(\w+ )?(toe|foot|leg)|(toe|foot) (gangrene|abscess)|(foot|plantar|heel) ulcer|plantar abscess|web[- ]?space (abscess|infection)/i,
    scaffold: {
      indication:
        "Patient, a known case of [type 2] diabetes mellitus [on __], was admitted with [an infected ulcer / abscess / wet gangrene] of the [right / left] foot [with uncontrolled blood sugar], requiring [surgical debridement / amputation].",
      primaryDiagnosis:
        "Diabetic foot [ right / left ] — [ Wagner grade __; infected ulcer / abscess / wet / dry gangrene; with / without osteomyelitis; neuropathic / neuro-ischaemic ]; type 2 diabetes mellitus [ controlled / uncontrolled ]",
      procedure: {
        name: "[ Wound debridement / incision and drainage / disarticulation of __ toe / ray amputation / transmetatarsal / below-knee / above-knee amputation ] [ ; relook debridement on [date] ]",
        anaesthesia: "[ Spinal / regional block / general ] anaesthesia",
        findings: "[ extent of necrosis and pus tracking; tendon and bone involvement; bleeding at the cut margin; tissue / bone sent for culture ]",
        drains: "[ nil / corrugated drain ]",
        complications: "Nil",
        outcome: "[ Wound left open for dressings / stump closed ]",
      },
      clinicalCourse:
        "Admitted with [an infected ulcer / abscess / gangrene] of the [right / left] foot and a blood sugar of [__ mg/dL]. Started on [intravenous antibiotics] and [insulin] with physician input. [Arterial Doppler: __; X-ray foot: __.] Underwent [procedure] on [date] [and relook debridement on [date]]. Tissue culture grew [__] and antibiotics were adjusted to it. The wound now shows [healthy granulation without slough]; blood sugar is controlled on [__]. The patient is afebrile and [mobilising non-weight-bearing on the operated foot with a walker] at discharge.",
      medications: [
        { ...M.paracetamol, indication: "NSAIDs avoided — diabetic kidney" },
        M.pantoprazole,
        { generic: "[ Culture-directed oral antibiotic ]", duration: "[ … ]", indication: "per tissue / bone culture [ — longer course if osteomyelitis ]", status: "new" },
        { generic: "Insulin / oral hypoglycaemic agents", strength: "[ … ]", indication: "as per the physician's discharge plan — write each drug and dose in full", status: "changed" },
        { generic: "[ Aspirin — if peripheral arterial disease ]", strength: "75 mg", route: "PO", frequency: "OD after food", indication: "if peripheral arterial disease — unless contraindicated", status: "new" },
        { generic: "Atorvastatin", strength: "[ … ]", route: "PO", frequency: "HS", indication: "diabetes / peripheral arterial disease", status: "new" },
      ],
      advice: adv([
        { module: "Wound care", text: "Get the wound dressed [ daily / on alternate days ] as advised, at the hospital or a nearby health centre. Keep the dressing clean and dry." },
        { module: "Activity restrictions", text: "Keep weight off the operated foot — use the walker, crutches or special footwear as advised. Walking on the wound stops it healing." },
        { module: "Foot care", text: "Look at both feet every day (use a mirror for the soles). Wash and dry between the toes. Never walk barefoot, even at home. Wear soft, well-fitting footwear and check inside shoes before putting them on. Do not cut corns yourself or put hot water or heat bags on the feet. Cut nails straight across." },
        { module: "Diet", text: "Diabetic diet as advised. Check blood sugar [ … ] times a day, keep a record and bring it to every visit." },
        { module: "Physiotherapy", text: "[ Amputation: keep the knee straight — no pillow under the knee; do the stump exercises taught on the ward. ]" },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Foul smell, blackening of the skin, or new pus from the wound",
        "Redness or swelling spreading up the foot or leg",
        "Blood sugar persistently above [ 300 ] mg/dL, or low-sugar symptoms (sweating, shaking, confusion)",
        "New pain, coldness or colour change in either foot",
        "Drowsiness, vomiting or fast breathing",
      ],
      patientActions: [
        "Attend the Surgery OPD after [ 5–7 ] days for a wound review.",
        "Get dressings done [ daily / on alternate days ] at [ the hospital / the nearest dispensary ].",
        "Attend the medicine / diabetes OPD with the sugar chart within 1 week.",
        "[ Complete the antibiotic course, if one continues after discharge. ]",
        "[ Attend for split-skin grafting / secondary suturing when the wound is ready. ]",
        "[ Attend the limb-fitting centre for prosthesis assessment once the stump has healed. ]",
      ],
      primaryCareActions: [
        "Continue dressings and watch for spreading infection.",
        "Titrate glucose-lowering treatment to the target.",
        "Examine the other foot; arrange protective footwear.",
        "Check renal function while on antibiotics.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Diabetes — duration, treatment, control; ulcer — onset and trigger (trauma, footwear, burn), painful or painless, discharge, smell, spread; fever; claudication or rest pain; previous ulcers or amputations; smoking; kidney, heart and eye disease. Examination: sepsis signs; ulcer site, size and depth, probe-to-bone, pus tracking along tendon sheaths, crepitus, extent of gangrene; pulses (femoral, popliteal, dorsalis pedis, posterior tibial) and ABPI; monofilament sensation; deformity (Charcot); the other foot. Baseline: blood sugar, HbA1c, ketones, CBC, CRP, renal function, electrolytes, X-ray foot (osteomyelitis, gas), arterial Doppler, pus / tissue culture, ECG; Wagner grade.",
    progressNote:
      "Each day — temperature and sepsis parameters; sugar chart and insulin; wound — slough, granulation, pus, smell, spreading cellulitis (mark the margin); culture report and antibiotic de-escalation; need for relook debridement; offloading; renal function. Discharge — infection controlled, sugar controlled, dressing and offloading plan set.",
  },

  // ---- 18 Abscess / soft-tissue infection — after perianal, appendicectomy, liver_abscess and
  //      diabetic_foot (each of those owns its own abscess); before lump_excision ----
  // Deliberately NOT a bare /abscess/: psoas, subphrenic, pelvic and other deep abscesses fall
  // through to the generic template rather than to an I&D discharge.
  // Schwartz 11e p. 173: a drained boil / abscess needs antibiotics only if there is significant
  // cellulitis or it does not settle; suspect MRSA if it persists. p. 550: breast abscess —
  // antibiotics and repeated (USG-guided) aspiration first; empty the breast.
  {
    key: "abscess_drainage",
    label: "Abscess / soft-tissue infection — I&D / debridement",
    match: /incision (and|&) drainage|\bI\s*(&|and)\s*D\b|(breast|sub-?areolar|axillary|gluteal|buttock|thigh|leg|arm|forearm|hand|neck|back|scalp|chest wall|abdominal wall|parotid|peri-?anal|ischio-?rectal|perineal|scrotal|groin|inguinal|injection[- ]site|subcutaneous|soft[- ]tissue|skin|stitch|wound) abscess|carbuncle|furuncle|\bboils?\b|necroti[sz]ing (fasciitis|soft[- ]tissue)|fournier|debridement|cellulitis|mastitis/i,
    families: ["abscess_debridement"],
    scaffold: {
      indication:
        "Patient was admitted with [a painful, fluctuant swelling / spreading cellulitis] over the [site] [with fever] [and uncontrolled blood sugar], requiring [incision and drainage / debridement].",
      primaryDiagnosis: "[ Site ] [ abscess / carbuncle / cellulitis / necrotising soft-tissue infection ] [ ; type 2 diabetes mellitus ]",
      procedure: {
        name: "[ Incision and drainage / USG-guided aspiration / wound debridement ] of [ site ] [ abscess ]",
        anaesthesia: "[ General / spinal / local ] anaesthesia",
        findings: "[ volume and nature of pus; loculi broken down; extent of necrosis; cavity size; pus sent for culture ]",
        drains: "[ nil / corrugated drain / cavity packed ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; pus sent for culture.",
      },
      clinicalCourse:
        "Admitted with [site] [abscess / cellulitis] [and a blood sugar of __ mg/dL]. Underwent [incision and drainage] under [anaesthesia] on [date]; [__ ml of pus] was drained and the cavity [packed]. Daily dressings were done and the cavity is now [clean and granulating]. [Pus culture grew __.] [Blood sugar was controlled on __.] The patient is afebrile [and the surrounding cellulitis has settled] at discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        { ...M.diclofenac, indication: "avoid in diabetic kidney disease or renal impairment" },
        { ...M.amoxClav, generic: "[ Amoxicillin-clavulanate — only if cellulitis or systemic features persist after drainage, or per pus culture ]" },
      ],
      advice: adv([
        { module: "Wound care", text: "Get the wound dressed [ daily ] as advised until it heals from the base. Some discharge on the dressing is expected and lessens day by day. [ Perianal: warm sitz baths 2–3 times a day and after each bowel motion. ]" },
        { module: "Medication instructions", text: "[ Diabetic: continue the diabetes treatment as advised and check blood sugar regularly — good sugar control helps the wound heal. ]" },
        { module: "Breastfeeding", text: "[ Breast abscess: keep feeding from the other breast and empty the affected breast by expressing or pumping; restart feeding from that side when advised. ]" },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Redness, swelling or blackening of the skin spreading beyond the wound",
        "Pus collecting again, or the wound swelling up",
        "Blood sugar persistently high (diabetic)",
      ],
      patientActions: [
        "Attend the Surgery OPD dressing room [ daily / on alternate days ] for dressings until the wound heals.",
        OPD7,
        "Complete the course of antibiotics, if prescribed.",
        "Bring the pus culture report to the follow-up visit.",
      ],
      primaryCareActions: [
        "Continue dressings until healed.",
        "Screen for diabetes (HbA1c) if not known.",
        "Investigate a recurrent abscess (diabetes, hidradenitis, MRSA).",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Site; duration; pain; fever; speed of spread; injection, injury or insect bite at the site; diabetes, steroids or immunosuppression; previous abscesses; lactation (breast abscess); injecting drug use. Examination: site, size, fluctuation, induration, surrounding cellulitis (mark the margin), crepitus, skin necrosis or bullae, pain out of proportion to the signs (necrotising infection), regional nodes, sepsis signs. Baseline: blood sugar, HbA1c, CBC, renal function, USG for depth and loculi, pus culture, X-ray for gas if necrotising infection is suspected (LRINEC as an adjunct only).",
    progressNote:
      "Each day — temperature; dressing — cavity size, discharge, granulation, slough; cellulitis margin; blood sugar; culture report. Discharge — afebrile, cellulitis settled, dressing plan set.",
  },

  // ---- 19 Lipoma / sebaceous cyst / minor lump / node biopsy — LAST before the array closes ----
  // Kept below abscess_drainage, so "infected sebaceous cyst — I&D" is an abscess discharge.
  // Schwartz 11e p. 527: "sebaceous" cysts are epidermoid cysts with a keratin-plugged punctum.
  // p. 1570: a mass > 5 cm, deep to fascia or enlarging needs imaging and biopsy before excision
  // (sarcoma) — hence the clerking line.
  {
    key: "lump_excision",
    label: "Excision of lipoma / sebaceous cyst / minor lump",
    match: /lipoma|sebaceous cyst|epiderm(oid|al)( inclusion)? cyst|dermoid cyst|trichilemmal|pilar cyst|neurofibroma|ganglion(?! (cell|block))|(skin|subcutaneous|soft[- ]tissue) (swelling|lump|nodule|lesion)|excision (biopsy )?of (a |an |the )?(swelling|lump|cyst|nodule|skin lesion)|(swelling|lump|cyst|nodule) excision|excision biopsy|lymph node (excision|biopsy)|(cervical )?node biopsy/i,
    scaffold: {
      indication:
        "Patient was admitted for excision of a [lipoma / sebaceous (epidermoid) cyst / __] over the [site] [ / excision biopsy of a (cervical) lymph node ].",
      primaryDiagnosis: "[ Lipoma / epidermoid (sebaceous) cyst / dermoid cyst / neurofibroma / ganglion / lymphadenopathy for evaluation ] — [ site; size ]",
      procedure: {
        name: "Excision of [ lipoma / sebaceous cyst / swelling ] over [ site ] [ / excision biopsy of __ lymph node ]",
        anaesthesia: "[ Local / general / spinal ] anaesthesia",
        findings: "[ size; capsule; contents; plane — subcutaneous / subfascial / intramuscular; excised completely ]",
        drains: "[ nil / suction drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent excision of the [swelling] under [local / general] anaesthesia on [date] [as a day case]. Recovery was uneventful, with no haematoma. The patient is comfortable with a clean, dry wound at discharge.",
      medications: [{ ...M.paracetamol, duration: "3 days" }, M.diclofenac],
      advice: adv([
        { module: "Wound care", text: "Keep the dressing clean and dry for 48 hours; you may then bathe and pat the wound dry." },
        { module: "Activity restrictions", text: "Resume normal activity from the next day. Avoid stretching or straining the wound until the sutures are out." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Increasing swelling or bruising under the wound",
      ],
      patientActions: [
        "Attend the Surgery OPD after 7 days for a wound review and suture removal [ day 10–14 on the back or over a joint ].",
        HPE,
      ],
      primaryCareActions: [
        "[ Lymph node biopsy: start treatment according to the report — e.g. anti-tubercular treatment through the national TB programme. ]",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration, growth, pain; discharge from a punctum and previous infections (sebaceous cyst); number and sites of other lumps; for a node — fever, night sweats, weight loss, cough, TB contact. Examination: site, size, shape, surface, consistency, fluctuation, slip sign, punctum, fixity to skin and deep structures, transillumination, regional nodes. A lump over 5 cm, deep to the fascia, hard or enlarging needs imaging (USG / MRI) and a core biopsy before excision — think of a sarcoma. Baseline: USG of the swelling if deep or large; FNAC for a node; blood sugar; pre-anaesthetic workup if under general anaesthesia.",
    progressNote:
      "Day of surgery — pain controlled; wound dry; no haematoma. Discharge the same day or POD 1 with advice and the histopathology follow-up.",
  },

];

/** Used when the typed diagnosis matches none of the ten — still gives the resident a
 *  scaffold to fill rather than a blank page. */
export const GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "generic",
  label: "General surgery — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [presentation / clinical problem] requiring [inpatient management / investigation / intervention / surgery].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure name ]",
      anaesthesia: "[ General / spinal / local ]",
      findings: "[ significant operative findings ]",
      drains: "[ drains, if any ]",
      complications: "Nil",
      outcome: "Procedure completed successfully.",
    },
    clinicalCourse:
      "Admitted with [presentation]. [Initial management.] [Procedure] was performed on [date]. The postoperative period was [uneventful]. The patient is afebrile, ambulant and tolerating a normal diet at discharge.",
    medications: [M.paracetamol, M.pantoprazole],
    advice: adv([
      { module: "Wound care", text: "Keep the wound clean and dry. Attend for a dressing review as advised." },
      { module: "Diet", text: "Resume a normal diet as tolerated." },
      { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous activity for [ … ] weeks." },
    ]),
    redFlags: [
      ...RF_WOUND,
      "Worsening abdominal pain",
      "Persistent vomiting or inability to keep food down",
      "Abdominal distension or not passing stool / flatus",
    ],
    patientActions: [OPD7, "Attend for suture removal on postoperative day [ … ].", "[ Complete the antibiotic course, if one continues after discharge. ]"],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and character; associated symptoms and relevant negatives; past medical, surgical and drug history; examination findings on arrival; provisional diagnosis and plan. Baseline investigations as indicated.",
  progressNote:
    "Each day — symptoms; vitals with temperature; examination; oral intake; flatus / stool; urine output; drains / tubes — output and character; wound; mobilisation; calf tenderness; the day's plan. On readiness — afebrile, eating, mobilising, wound healthy, tubes out. For discharge with advice.",
};

/** The list for the picker card. */
export function listDischargeTemplates(): { key: string; label: string }[] {
  return [...DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE].map((t) => ({ key: t.key, label: t.label }));
}

export function getDischargeTemplate(key: string | null | undefined): DischargeTemplate | null {
  if (!key) return null;
  if (key === GENERIC_DISCHARGE_TEMPLATE.key) return GENERIC_DISCHARGE_TEMPLATE;
  return DISCHARGE_TEMPLATES.find((t) => t.key === key) ?? null;
}

/** The template the typed procedure / diagnosis / care-template family points at, or null.
 *
 * The DIAGNOSIS wording is tried first — it is the most specific signal, and it is what tells
 * "acute cholecystitis" apart from planned "gallstone disease" when both would share the
 * lap_chole care-template family. The family is only a fallback for a vague diagnosis.
 * First match wins, so the array is ordered specific-before-general. */
export function matchDischargeTemplate(input: {
  procedureText?: string | null;
  diagnosisText?: string | null;
  templateFamily?: string | null;
}): DischargeTemplate | null {
  const haystack = `${input.procedureText ?? ""} ${input.diagnosisText ?? ""}`.trim();
  if (haystack) {
    const byText = DISCHARGE_TEMPLATES.find((t) => t.match.test(haystack));
    if (byText) return byText;
  }
  if (input.templateFamily) {
    const byFamily = DISCHARGE_TEMPLATES.find((t) => t.families?.includes(input.templateFamily!));
    if (byFamily) return byFamily;
  }
  return null;
}
