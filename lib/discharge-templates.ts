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
 *   - A WARD patient's discharge stays compiled from the record; the template only OFFERS its
 *     advice and red-flag cards (switched off until the resident turns them on) — see
 *     applyDischargeTemplate() in lib/discharge-compile.ts.
 *
 * `clerkingFocus` and `progressNote` carry the reviewed history / daily-note defaults for each
 * diagnosis. They are not yet wired into the clerking and progress-note card stacks; they live
 * here so the reviewed content is in one place when that wiring is done.
 *
 * Medication lines are a STARTING SET to be checked against each patient — allergy, renal
 * function, weight, cultures, what they were already taking.
 */

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
const ANTIBIOTICS = "Complete the prescribed course of antibiotics.";
const HPE = "Bring the histopathology report to the follow-up visit.";
const LMWH28 = "Complete the full 28-day course of the blood-thinning injections.";
const ONCO_MDT = "Collect the histopathology report and attend the oncology / multidisciplinary clinic with it to decide further treatment.";

// --- the ten -------------------------------------------------------------------------

export const DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- 07 Carcinoma breast (checked before generic terms) ----
  {
    key: "breast_ca",
    label: "Carcinoma breast",
    match: /carcinoma breast|breast (cancer|carcinoma|malignancy|lump)|\bMRM\b|modified radical mastectomy|mastectomy|breast conservation|\bBCS\b|axillary (clearance|dissection)|sentinel node/i,
    scaffold: {
      indication:
        "Patient was admitted for [modified radical mastectomy / breast conservation surgery with axillary clearance] for carcinoma of the [right / left] breast.",
      primaryDiagnosis: "Carcinoma [right / left] breast — [cT_N_M_, stage; histology; ER / PR / HER2; grade]",
      procedure: {
        name: "[ Modified radical mastectomy / breast conservation surgery ] with [ sentinel node biopsy / axillary lymph node dissection ]",
        anaesthesia: "General anaesthesia",
        findings: "[ tumour site and size; skin or chest-wall involvement; axillary nodes; number of nodes retrieved; margins ]",
        drains: "Axillary and pectoral suction drains",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. The postoperative recovery was uneventful. Flaps remained healthy and drain outputs declined steadily. Shoulder and arm exercises were commenced on the ward. The patient is comfortable, afebrile and ambulant at discharge [with the axillary drain in situ, output __ ml / 24 h].",
      medications: [M.paracetamol, M.pantoprazole, M.diclofenac, { ...M.amoxClav, indication: "if indicated" }],
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
      "Each day — flap colour and viability; output of each drain separately; wound; shoulder and arm range of movement; pain; temperature. Discharge day — flaps healthy, drain output declining; arm exercises taught; discharge with drain-care instructions if a drain is still in.",
  },

  // ---- 08 Colorectal carcinoma ----
  {
    key: "colorectal_ca",
    label: "Colorectal carcinoma",
    match: /colorectal|carcinoma (colon|rectum|caecum|sigmoid|rectal)|(colon|rectal|rectum|caecal|sigmoid) (cancer|carcinoma|malignancy)|hemicolectomy|anterior resection|abdominoperineal|\bAPR\b|hartmann/i,
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
        { ...M.paracetamol, indication: "± Tramadol 50 mg PO SOS" },
        M.pantoprazole,
        M.lactulose,
        M.enoxaparin28,
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
      "Change in bowel habit; bleeding per rectum or melaena; tenesmus; mass; weight loss and anorexia; episodes of obstruction; symptoms of anaemia; family history (Lynch syndrome, FAP); previous colonoscopy. Examination: abdominal mass, hepatomegaly, digital rectal examination (for a rectal tumour — level, fixity), nodes. Baseline: colonoscopy with biopsy, CEA, CT of chest, abdomen and pelvis, MRI pelvis for rectal tumours, CBC.",
    progressNote:
      "Each day — enhanced-recovery milestones (mobilisation, oral intake, off IV fluids, catheter out, analgesia step-down); bowel or stoma function; drain output; wound; sepsis parameters; progress with stoma teaching. Discharge day — eating, stoma managed independently, drain out. Discharge with stoma supplies, thromboprophylaxis and clinic dates.",
  },

  // ---- 09 Carcinoma stomach / gastric outlet obstruction ----
  {
    key: "gastric_ca",
    label: "Carcinoma stomach / gastric outlet obstruction",
    match: /carcinoma stomach|gastric (cancer|carcinoma|malignancy|outlet obstruction)|\bGOO\b|gastrectomy|gastro-?jejunostomy|feeding jejunostomy/i,
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
        { ...M.pantoprazole, frequency: "OD", duration: undefined },
        M.paracetamolSos,
        { generic: "Domperidone", strength: "10 mg", route: "PO", frequency: "TDS before meals", indication: "if delayed gastric emptying", status: "new" },
        { generic: "Vitamin B12", strength: "1000 mcg", route: "IM", frequency: "monthly", indication: "after total / subtotal gastrectomy", status: "new" },
        { generic: "Ferrous sulfate", route: "PO", frequency: "OD", status: "new" },
        M.enoxaparin28,
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
      "Epigastric pain; early satiety; vomiting (undigested food, timing after meals); weight loss; dysphagia; melaena or symptoms of anaemia; previous H. pylori, ulcer or partial gastrectomy; family history. Examination: nutritional status, epigastric mass, succussion splash, Virchow's node, Sister Mary Joseph nodule, hepatomegaly, ascites. Baseline: upper GI endoscopy with biopsy, CT of chest and abdomen, staging laparoscopy, CBC, albumin, electrolytes.",
    progressNote:
      "Each day — nasogastric output; feeding-jejunostomy feed tolerance; drain output and amylase; the contrast-study result; oral intake escalation; weight; sepsis parameters. Discharge day — tolerating feeds, drains out, no leak. Discharge with feed plan, B12 schedule and clinic dates.",
  },

  // ---- 06 Acute pancreatitis ----
  {
    key: "pancreatitis",
    label: "Acute pancreatitis",
    match: /pancreatitis/i,
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
        "Managed with early aggressive intravenous fluid resuscitation, analgesia, antiemetics and early enteral nutrition. [ERCP with sphincterotomy and stone extraction was performed for biliary obstruction.] The clinical course was [uncomplicated / complicated by …]; pain settled, inflammatory markers and organ function normalised, and oral intake was re-established and tolerated. The patient is comfortable and tolerating a low-fat diet at discharge.",
      medications: [
        { ...M.paracetamol, indication: "± Tramadol 50 mg PO SOS" },
        { ...M.pantoprazole, duration: "2 weeks" },
        M.ondansetron,
        { generic: "Pancreatic enzyme supplement", frequency: "with meals", indication: "if steatorrhoea", status: "new" },
        { generic: "Fenofibrate / statin", indication: "for hypertriglyceridaemia", status: "new" },
        { generic: "Thiamine", strength: "100 mg", route: "PO", frequency: "OD", indication: "alcohol aetiology; with alcohol-cessation support", status: "new" },
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
        "Attend the Surgery OPD in 2 weeks with a repeat ultrasound / CT to look for a collection.",
        "Attend for an interval laparoscopic cholecystectomy in 4–6 weeks (gallstone pancreatitis) — attend for the review and date.",
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
      "Pain — epigastric, band-like, radiating to the back, eased by leaning forward; alcohol intake (quantity, last drink); known gallstones; drugs; previous episodes; family history. Examination: epigastric tenderness, distension, signs of a pleural effusion, Cullen's and Grey-Turner's signs, temperature, signs of shock. Baseline: amylase / lipase, LFT, serum calcium, triglycerides, glucose, renal function, blood gas, CRP; USG abdomen; contrast CT at 72 hours if severe; severity score (BISAP / modified Glasgow).",
    progressNote:
      "Each day — pain score; oral intake and tolerance; fluid balance and urine output; SIRS and organ-failure parameters (respiratory rate, oxygenation, creatinine); abdominal examination; CRP trend. On improvement — pain settled; eating a low-fat diet; markers down. Plan discharge with follow-up imaging and interval cholecystectomy.",
  },

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
        { ...M.amoxClav, duration: "5–7 days", indication: "per culture — e.g. + Metronidazole 400 mg PO TDS" },
        { ...M.pantoprazole, frequency: "BD", duration: "4 to 6 weeks", indication: "peptic perforation" },
        { generic: "H. pylori eradication", indication: "if indicated", status: "new" },
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
        ANTIBIOTICS,
        "Attend for an upper GI endoscopy at 6–8 weeks to confirm ulcer healing and exclude malignancy (peptic perforation).",
        "Bring any histopathology report to follow-up.",
      ],
      primaryCareActions: [
        "Monitor the wound; remove sutures if the hospital OPD is not accessible.",
        "Repeat renal function after 1 week if there was acute kidney injury during admission.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Sudden severe pain becoming generalised; time of onset; previous dyspepsia, NSAID, steroid, alcohol or smoking history; fever for weeks and contacts with fever (enteric); trauma. Examination: distension, generalised guarding and rigidity, absent bowel sounds, obliteration of liver dullness, temperature, signs of shock. Baseline: erect chest / abdominal X-ray for free gas, CBC, renal function, electrolytes, blood gas, blood group and cross-match; CT abdomen if the picture is unclear.",
    progressNote:
      "POD 0–2 (ICU / HDU) — vitals, inotrope requirement, ventilation, urine output, nasogastric output, blood gas; abdomen soft / distended; drains — output and character. POD 3–5 — sepsis parameters improving; ileus resolving; flatus passed on POD [__]; orals started; drains reducing. POD 6+ — tolerating diet; drains removed; wound reviewed; mobilising. Plan discharge when afebrile and eating.",
  },

  // ---- 05 Acute intestinal obstruction ----
  {
    key: "obstruction",
    label: "Acute intestinal obstruction",
    match: /intestinal obstruction|bowel obstruction|\bSAIO\b|adhesive obstruction|obstructed hernia|sigmoid volvulus|\bvolvulus\b|intussusception|adhesiolysis|drip and suck/i,
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
        { ...M.pantoprazole, duration: "5 days" },
        M.ondansetron,
        { generic: "Isabgol (psyllium husk)", dose: "1 teaspoon", route: "PO", frequency: "HS", indication: "for recurrent adhesive obstruction — keep stools soft", status: "new" },
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
      "Each day — nasogastric output volume and character; abdominal girth; bowel sounds; flatus / stool passed; fluid balance and urine output; electrolytes. On settling — nasogastric tube clamped and trial of orals tolerated; tube removed; diet advanced. Plan discharge.",
  },

  // ---- 03 Abdominal wall hernia ----
  {
    key: "hernia",
    label: "Abdominal wall hernia",
    match: /hernio(plasty|rrhaphy)|\bhernia\b|mesh repair/i,
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
        { module: "Lifting restrictions", text: "Do not lift weights over 5 kg for 6 weeks." },
        { module: "Activity restrictions", text: "Avoid straining, hard coughing and strenuous activity for 6 weeks. Treat constipation and cough early." },
        { module: "Return-to-work advice", text: "Light or desk work after 2 weeks; heavy manual work after 6 weeks." },
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
        "Avoid heavy manual work for 6 weeks.",
      ],
      primaryCareActions: ["Treat chronic cough / constipation / prostatism to reduce recurrence."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration; reducibility (spontaneous / manual / irreducible); dragging pain; episodes of obstruction (colicky pain, vomiting, constipation); precipitating factors — chronic cough, straining at stool, prostatism, ascites, heavy work; previous repair on either side. Examination: cough impulse, defect and contents, reducibility, testis and cord, the contralateral side, external genitalia. Baseline: pre-anaesthetic workup; USG if the diagnosis is uncertain.",
    progressNote:
      "POD 0 — pain controlled; passed urine; vitals stable; [scrotal oedema noted]. POD 1 — ambulant; orals tolerated; wound clean and dry; no scrotal collection. Plan: discharge with advice.",
  },

  // ---- 02 Acute appendicitis ----
  {
    key: "appendicectomy",
    label: "Acute appendicitis",
    match: /appendic(ectom|itis)/i,
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
        { ...M.amoxClav, indication: "or Cefixime 200 mg PO BD + Metronidazole 400 mg PO TDS if perforated / contaminated" },
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
        ANTIBIOTICS,
        "Bring the histopathology report to the follow-up visit (it rules out a carcinoid or mucocele).",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Migratory pain (peri-umbilical to RIF); anorexia; nausea and vomiting; fever; diarrhoea or urinary symptoms; last menstrual period and gynaecological history in women. Examination: RIF tenderness, guarding, rebound, Rovsing's and psoas signs, mass, temperature. Baseline: CBC with differential, CRP, urine routine, urine pregnancy test in women; USG or CT if diagnosis unclear; Alvarado score.",
    progressNote:
      "POD 0 — orals as tolerated; pain controlled; vitals stable; passed urine. POD 1 — tolerating diet; ambulant; wound clean; afebrile; [drain minimal]. Plan: discharge if drain out and afebrile. POD 2 — for discharge with advice.",
  },

  // ---- 01 Gallstone disease & acute cholecystitis ----
  {
    key: "lap_chole",
    label: "Gallstone disease & acute cholecystitis",
    match: /chol(e|y)cystectom|lap\s*chole|gall\s*stone|cholelithiasis|calculous cholecystitis|choledocholithiasis|biliary colic/i,
    families: ["lap_chole"],
    scaffold: {
      indication:
        "Patient was admitted with right upper abdominal pain and ultrasound-confirmed gallstones [with features of acute cholecystitis, if present], requiring inpatient management and laparoscopic cholecystectomy.",
      primaryDiagnosis: "Gallstone disease [/ acute calculous cholecystitis]",
      procedure: {
        name: "Laparoscopic cholecystectomy",
        anaesthesia: "General anaesthesia",
        findings: "[ distended / thick-walled gallbladder, adhesions, Calot's triangle anatomy, stones ]",
        drains: "[ subhepatic drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; gallbladder sent for histopathology.",
      },
      clinicalCourse:
        "Admitted with acute calculous cholecystitis and managed initially with intravenous fluids, analgesia and antibiotics. Following optimisation, laparoscopic cholecystectomy was performed on [date]. The postoperative period was uneventful; oral intake was resumed and the patient remained haemodynamically stable. [The subhepatic drain remained non-bilious and was removed on POD __.] The patient is afebrile, ambulant and tolerating a normal diet at discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.diclofenac,
        { ...M.amoxClav, indication: "if infective / empyema" },
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
        ANTIBIOTICS,
        HPE,
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset, site and character of pain; radiation to back or right shoulder; relation to fatty food; nausea and vomiting; fever with rigors; jaundice, pruritus, pale stools, dark urine; previous similar episodes; previous USG / ERCP. Examination: Murphy's sign, palpable gallbladder or mass, jaundice, temperature. Baseline: LFT, amylase / lipase, CBC, USG abdomen (wall thickness, stone size, CBD diameter); MRCP if CBD dilated or LFT deranged.",
    progressNote:
      "POD 0 — nil orally / sips; drain output [__ ml], nature; pain controlled; vitals stable; urine output adequate. POD 1 — orals started and tolerated; drain [< 30 ml serous]; ambulant; port sites clean and dry; afebrile. Plan: normal diet, remove drain if minimal, plan discharge. POD 2 — normal diet tolerated; drain removed; wounds healthy; pain minimal. For discharge with advice.",
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
        { generic: "Metronidazole", strength: "400 mg", route: "PO", frequency: "TDS", duration: "5 days", indication: "reduces pain after haemorrhoidectomy", status: "new" },
        { generic: "Local anaesthetic / GTN / diltiazem ointment", route: "topical", frequency: "BD", indication: "as prescribed", status: "new" },
      ],
      advice: adv([
        { module: "Wound care", text: "Warm sitz baths 2–3 times a day and after every bowel motion. Keep the area clean and dry between baths; avoid local trauma." },
        { module: "Diet", text: "A high-fibre diet with plenty of fluids to keep the stool soft." },
        { module: "Medication instructions", text: "Take the laxative regularly so that stools stay soft; do not become constipated. Apply the prescribed ointment." },
        { module: "Activity restrictions", text: "Avoid prolonged sitting and heavy lifting for 2 weeks." },
        { module: "Wound care", text: "[ Do not remove the seton; keep it clean. ]" },
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
        ANTIBIOTICS,
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
      "POD 0 — pain score; first void [passed / catheterised]; bleeding minimal; started sitz baths. POD 1 — passed stool with a soft motion; pain controlled on oral analgesia; voiding normally; wound reviewed. Plan: discharge with sitz baths, laxatives and follow-up.",
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
    medications: [M.paracetamol, M.pantoprazole, M.diclofenac],
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
    patientActions: [OPD7, "Attend for suture removal on postoperative day [ … ].", ANTIBIOTICS],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and character; associated symptoms and relevant negatives; past medical, surgical and drug history; examination findings on arrival; provisional diagnosis and plan. Baseline investigations as indicated.",
  progressNote:
    "Each day — symptoms; vitals; examination; oral intake; drain / wound; the day's plan. On readiness — afebrile, eating, mobilising, wound healthy. For discharge with advice.",
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
 *  First match wins, so the array is ordered specific-before-general. */
export function matchDischargeTemplate(input: {
  procedureText?: string | null;
  diagnosisText?: string | null;
  templateFamily?: string | null;
}): DischargeTemplate | null {
  if (input.templateFamily) {
    const byFamily = DISCHARGE_TEMPLATES.find((t) => t.families?.includes(input.templateFamily!));
    if (byFamily) return byFamily;
  }
  const haystack = `${input.procedureText ?? ""} ${input.diagnosisText ?? ""}`.trim();
  if (haystack) {
    const byText = DISCHARGE_TEMPLATES.find((t) => t.match.test(haystack));
    if (byText) return byText;
  }
  return null;
}
