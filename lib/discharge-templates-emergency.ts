import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";
import type { AdviceItem } from "@/lib/discharge-entities";

/**
 * EMERGENCY MEDICINE discharge templates. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * For a patient discharged DIRECTLY from the emergency department or its observation ward — not
 * admitted to a unit. The scaffold's "procedure" is the observation / emergency procedure.
 *
 * These PRE-FILL a typical adult discharge prescription, on the product owner's direction. The
 * medication lines are a STARTING SET to be checked against each patient — allergy, renal
 * function, pregnancy, what they were already taking. Anything dose-titrated or organ-function
 * dependent is left as `[ … ]` and prints as a visible blank, never a guess. Tetanus and rabies
 * vaccination are advice lines; the schedule is the one written on the patient's card.
 *
 * `[ … ]` marks every patient-specific blank. Ordered specific before general — first match wins
 * (lib/specialty/discharge.ts): snakebite before animal bite; poisoning (excluding "food
 * poisoning") before gastroenteritis; head injury before laceration (a scalp wound after a
 * head injury needs the head-injury advice); heat illness before gastroenteritis ("dehydration").
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "3 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain or fever", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
  ondansetronSos: { generic: "Ondansetron", strength: "4 mg", route: "PO", frequency: "SOS for vomiting", status: "prn" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  ors: { generic: "Oral rehydration salts (ORS)", dose: "1 sachet in 1 litre of clean water", route: "PO", frequency: "Sip through the day; a glass after each loose stool", duration: "Until stools and urine are normal", status: "new" } as TemplateMedication,
};

const TETANUS = { module: "Medication instructions", text: "Tetanus injection: [ given today / already up to date ]. If a course was started, complete it on the dates written on the card." };
const ED_RETURN = "Come back to the emergency at any time, day or night, if any warning sign below appears.";
const NO_DRIVE = { module: "Activity restrictions", text: "Do not drive, operate machinery or work at heights for [ … ] hours." };

function obs(name: string, findings: string, anaesthesia = ""): DischargeTemplate["scaffold"]["procedure"] {
  return { name, anaesthesia, findings, drains: "Nil", complications: "Nil", outcome: "Stable and fit for discharge from the emergency / observation ward." };
}

// --- generic -------------------------------------------------------------------------

export const EMERGENCY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "emergency_generic",
  label: "Emergency medicine — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient presented to the emergency department with [ presenting problem ] and was [ assessed / treated / observed ] in the emergency / observation ward.",
    primaryDiagnosis: "",
    procedure: obs("[ Observation for [ … ] hours / emergency procedure, if any ]", "[ triage category; vitals on arrival and at discharge; investigations and results ]"),
    clinicalCourse:
      "Presented on [ date, time ] with [ presentation ]. Triaged [ … ]. [ Assessment and investigations. ] [ Treatment given in the emergency. ] Observed for [ … ] hours; symptoms settled, vitals remained stable, and the patient was fit for discharge on [ date, time ] with the plan below.",
    medications: [],
    advice: adv([{ module: "Medication instructions", text: "Take the medicines exactly as listed." }]),
    redFlags: ["Symptoms returning or getting worse", "Fainting, confusion or drowsiness", "Breathlessness or chest pain", "Persistent vomiting or unable to drink"],
    patientActions: [ED_RETURN, "Attend the [ … ] OPD on [ … ] with this summary."],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Time of arrival and mode; presenting complaint with onset and duration; mechanism for injury; triage category and vitals on arrival; allergies; current drugs; relevant past history; last meal; examination findings; the working diagnosis and what was done in the emergency; who accompanies the patient.",
  progressNote:
    "Observation — vitals and GCS at the set intervals; symptoms; response to treatment; results back. For discharge — stable vitals over the observation period, symptoms settled, able to walk / drink, responsible adult available where needed, warning signs explained.",
};

// --- the ten -------------------------------------------------------------------------

export const EMERGENCY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Snakebite (before animal bite) ----
  {
    key: "snakebite",
    label: "Snakebite — after observation",
    match: /snake ?bite|bitten by (a )?snake|envenom|\bASV\b|anti[- ]?snake venom|\b(viper|krait|cobra)\b/i,
    scaffold: {
      indication: "Patient presented with an alleged snakebite on the [ site ] on [ date, time ] and was observed for signs of envenomation.",
      primaryDiagnosis: "Snakebite [ — no envenomation (dry bite) / envenomation — haemotoxic / neurotoxic, treated with ASV ]",
      procedure: obs("Observation for [ … ] hours with serial 20-minute whole-blood clotting tests [ ± ASV [ … ] vials ]", "[ 20WBCT results; bite-site swelling and its progression; ptosis / neuro signs; urine output and colour; CBC, PT/INR, renal function ]"),
      clinicalCourse:
        "Presented [ … ] hours after a snakebite on the [ site ]. [ No local or systemic signs of envenomation developed; serial 20WBCTs were normal. / Developed [ … ] and received [ … ] vials of ASV; clotting normalised by [ … ]. ] Observed for [ … ] hours with stable vitals, normal urine output and no bleeding. Discharged on [ date, time ].",
      medications: [{ ...M.paracetamolSos, indication: "for pain — do NOT take painkillers like diclofenac, ibuprofen or aspirin" }],
      advice: adv([
        { module: "Wound care", text: "Keep the bite site clean and dry. Do not cut, suck, burn or apply herbs to it. Keep the limb comfortable and slightly raised." },
        TETANUS,
        { module: "Medication instructions", text: "Do not take diclofenac, ibuprofen, aspirin or native medicines — they can cause bleeding." },
        { module: "Activity restrictions", text: "[ If ASV was given: fever, rash, itching or joint pains in the next 1–2 weeks can be a reaction to the anti-venom — come back to be seen. ]" },
      ]),
      redFlags: [
        "Bleeding from gums, nose, the bite site, in urine (red or dark urine) or vomit, or black stools",
        "Drooping eyelids, double vision, difficulty swallowing, speaking or breathing",
        "Increasing swelling, blistering or blackening at the bite",
        "Passing very little urine",
        "Severe abdominal pain, fainting or drowsiness",
      ],
      patientActions: [ED_RETURN, "Get a CBC, PT/INR and renal function on [ … ] if advised.", "Attend the Medicine / Emergency follow-up on [ … ]."],
      primaryCareActions: ["Recheck urine output, bleeding and bite-site swelling in 24–48 hours.", "Watch for serum sickness after ASV."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Time and place of bite; snake seen or brought (description only — do not handle); first aid given (tourniquet, cutting, native treatment); time to arrival; local pain and swelling; bleeding, ptosis, diplopia, dysphagia, breathlessness, abdominal pain, urine colour and output. Examination: bite marks, swelling extent (mark and time it), regional nodes, bleeding sites, ptosis, neck-flexor weakness, single-breath count, vitals. Baseline: 20WBCT at arrival and every 6 hours, CBC, PT/INR, renal function, urine for blood.",
    progressNote:
      "Observation — 20WBCT at the set intervals; swelling margin; ptosis / neuro signs; urine output and colour; vitals; ASV vials and reactions. For discharge — no envenomation (or resolved after ASV), clotting normal, observed for the full period, bleeding and neuro warning signs explained.",
  },

  // ---- Animal bite ----
  {
    key: "animal_bite",
    label: "Animal bite — wound care and rabies vaccine",
    match: /\b(dog|cat|monkey|animal|rat|mongoose|jackal|fox|bat|human)[- ]?bites?\b|bitten by (a |an )?(dog|cat|monkey|animal|rat)|\brabies\b|\bARV\b|anti[- ]?rabies|category (II|III|2|3) (exposure|bite|wound)/i,
    scaffold: {
      indication: "Patient presented with a [ dog / cat / monkey / … ] bite on the [ site ] on [ date ] — WHO category [ II / III ] exposure.",
      primaryDiagnosis: "[ Dog / cat / monkey / … ] bite, [ site ] — category [ II / III ] exposure",
      procedure: obs("Wound washing with soap and running water for 15 minutes and antiseptic; anti-rabies vaccine [ ± rabies immunoglobulin infiltrated into the wound ]", "[ number, site and depth of wounds; bleeding; animal — owned / stray, vaccinated / not known ]"),
      clinicalCourse:
        "Presented on [ date ] with a [ … ] bite. The wound was washed thoroughly and cleaned. Anti-rabies vaccine dose 1 was given on [ date ] [ and rabies immunoglobulin was infiltrated into the wound ]. The wound was [ left open / loosely approximated ]. Tetanus [ … ]. Discharged on [ date ] with the vaccination card.",
      medications: [
        { ...M.amoxClav, indication: "for deep, hand, face or cat / monkey bites and punctures" },
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Medication instructions", text: "Complete the rabies vaccine schedule on the days written on the card — every dose, even if the animal looks well. Bring the card to every dose." },
        { module: "Wound care", text: "Keep the wound clean; wash gently with soap and water daily. Do not apply chilli, turmeric, oil or other substances. Do not get it stitched elsewhere without telling the doctor about the bite." },
        TETANUS,
        { module: "Activity restrictions", text: "If the animal is owned and can be watched, note whether it stays healthy for 10 days and tell the doctor — but do not stop the vaccine on your own." },
      ]),
      redFlags: [
        "Increasing redness, swelling, pain or pus at the bite, or red streaks up the limb",
        "Fever",
        "Tingling or pain at the bite site after it has healed, fear of water, restlessness or confusion",
      ],
      patientActions: ["Take the next vaccine doses on the days written on the card at [ vaccination centre ].", "Attend for a wound check in 2–3 days."],
      primaryCareActions: ["Ensure every vaccine dose is taken on schedule.", "Check the wound for infection."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Animal — species, owned or stray, vaccination status, provoked or unprovoked, can it be observed; date and time; site, number and depth of wounds (head, face, hands, genitals are high-risk); bleeding; previous rabies vaccination; tetanus status; immune suppression. Examination: each wound — type, depth, contamination; tendons, nerves, vessels for hand bites. Category of exposure (WHO I / II / III) decides vaccine and immunoglobulin.",
    progressNote:
      "At discharge — wound washed and cleaned, category recorded, vaccine dose 1 given (± immunoglobulin), tetanus addressed, card handed over with the schedule written on it, wound-check date given.",
  },

  // ---- Poisoning after observation ----
  {
    key: "poisoning",
    label: "Poisoning (organophosphate / other) — after observation",
    match: /(?<!food )poison|organo ?phosph|\bOPC\b|insecticide|pesticide|overdose|paraquat|rodenticide|rat[- ]?kill|kerosene (ingestion|consumption)|self[- ]harm|suicid|(drug|tablet|substance|chemical) ingestion|consumed (poison|tablets|insecticide)/i,
    scaffold: {
      indication: "Patient presented after [ alleged / accidental / intentional ] ingestion of [ substance, amount ] at [ time, date ] and was observed for toxicity.",
      primaryDiagnosis: "[ Organophosphate / … ] poisoning — [ intentional / accidental ] [ — mild, resolved ]",
      procedure: obs("Decontamination [ skin wash / gastric lavage if indicated ] and observation for [ … ] hours", "[ substance and container label; time since ingestion; cholinergic signs; atropine required; serum cholinesterase; ABG; renal and liver function; ECG ]"),
      clinicalCourse:
        "Presented [ … ] hours after ingestion of [ … ]. Decontaminated [ … ]. [ Required atropine [ … ] and pralidoxime [ … ] / did not develop signs of toxicity. ] Observed for [ … ] hours after the last dose of [ atropine ] with stable vitals, clear chest, normal power and no intermediate-syndrome features. Reviewed by psychiatry on [ date ] [ — assessment: … ]. Medicolegal case intimated [ MLC no. … ]. Discharged on [ date, time ] to the care of [ relative ].",
      medications: [{ ...M.pantoprazole, indication: "if gastric irritation" }, M.ondansetronSos],
      advice: adv([
        { module: "Activity restrictions", text: "Stay with a responsible family member at all times for the next days. Family: remove all pesticides, medicines, sharp objects and ropes from the home, or lock them away." },
        { module: "Medication instructions", text: "Attend the psychiatry follow-up — talking to someone helps, and treatment works." },
        { module: "Diet", text: "Normal diet as tolerated." },
      ]),
      redFlags: [
        "Weakness of the neck, arms or legs, drooping eyelids, or difficulty breathing or swallowing",
        "Excessive sweating, drooling, vomiting, diarrhoea, or small pupils returning",
        "Drowsiness, confusion or a fit",
        "Any thoughts of self-harm — come to the emergency or call the helpline at once",
      ],
      patientActions: [
        ED_RETURN,
        "Attend the Psychiatry OPD on [ … ].",
        "Get [ renal / liver function ] repeated on [ … ] if advised.",
      ],
      primaryCareActions: ["Follow up for suicide risk; ensure psychiatry attendance.", "Watch for delayed weakness (intermediate syndrome) in the first days after OP poisoning."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Substance — name, container / label, amount, time; route; intent and circumstances; vomiting or lavage before arrival; co-ingestion of alcohol or tablets; symptoms — salivation, sweating, vomiting, diarrhoea, breathlessness, weakness, drowsiness; past self-harm and psychiatric history; current stressors. Examination: GCS, pupils, secretions, chest, heart rate, fasciculations, power including neck flexion, smell. Baseline: serum cholinesterase (OP), ABG, glucose, electrolytes, renal and liver function, ECG, chest X-ray. Medicolegal intimation.",
    progressNote:
      "Observation — GCS, pupils, secretions, chest, heart rate, BP, power and neck flexion at the set intervals; atropine / oxime doses and time of the last. For discharge — off atropine for the required period, no weakness, psychiatry review done, MLC completed, safety advice given to family.",
  },

  // ---- Minor head injury (before laceration) ----
  {
    key: "minor_head_injury",
    label: "Minor head injury — observed",
    match: /head injury|\bMHI\b|minor head|concussion|\bTBI\b|scalp (laceration|wound|haematoma|hematoma)|trauma to (the )?head|hit (on )?(the )?head/i,
    scaffold: {
      indication: "Patient presented after a [ fall / road traffic accident / assault ] on [ date, time ] with a head injury and was observed in the emergency.",
      primaryDiagnosis: "Minor head injury, GCS 15/15 [ with scalp laceration / haematoma ]",
      procedure: obs("Observation for [ … ] hours with neuro-observations [ ± scalp wound toilet and suturing ]", "[ GCS on arrival and throughout; loss of consciousness; amnesia; vomiting; CT head — done / not indicated, result; cervical spine cleared ]"),
      clinicalCourse:
        "Presented [ … ] hours after a [ mechanism ]. GCS 15/15 on arrival [ with brief loss of consciousness / no loss of consciousness ]. [ CT head showed no acute abnormality / CT not indicated by the decision rule. ] [ Scalp wound sutured. ] Observed for [ … ] hours with GCS 15/15 throughout, no vomiting and no focal deficit. Discharged on [ date, time ] with a responsible adult.",
      medications: [{ ...M.paracetamolSos, indication: "for headache — no sleeping tablets or alcohol" }],
      advice: adv([
        { module: "Activity restrictions", text: "A responsible adult must stay with the patient for the next 24 hours. Rest; no alcohol and no sleeping tablets." },
        NO_DRIVE,
        { module: "Return-to-work advice", text: "Return to study, work and sport gradually, only when headache and dizziness have gone; no contact sport until cleared." },
        { module: "Wound care", text: "[ Keep the scalp wound dry for 48 hours; sutures out on day [ … ]. ]" },
      ]),
      redFlags: [
        "Drowsiness, difficult to wake, or confusion",
        "Vomiting more than once",
        "Headache getting worse",
        "Weakness or numbness of the arm or leg, slurred speech, or blurred / double vision",
        "A fit",
        "Clear fluid or blood from the nose or ear",
      ],
      patientActions: [ED_RETURN, "[ Attend for suture removal on day [ … ]. ]", "See a doctor if symptoms last more than 2 weeks."],
      primaryCareActions: ["Review persistent post-concussion symptoms.", "Refer back if any red flag."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism and time; loss of consciousness and its duration; amnesia before / after; vomiting; headache; seizure; alcohol or drugs; anticoagulant or antiplatelet use; age; bleeding disorder. Examination: GCS, pupils, focal deficit, scalp wounds, signs of skull-base fracture, cervical spine, other injuries. CT head per decision rule.",
    progressNote:
      "Observation — GCS, pupils, limb power and vitals at the set intervals; vomiting; headache. For discharge — GCS 15/15 throughout, no vomiting, CT normal or not indicated, responsible adult present, head-injury advice given.",
  },

  // ---- Simple laceration sutured ----
  {
    key: "laceration",
    label: "Simple laceration — sutured",
    match: /lacerat|\bCLW\b|incised wound|cut (wound|injury)|wound (toilet|repair|closure)|sutur/i,
    scaffold: {
      indication: "Patient presented with a [ … ] cm laceration over the [ site ] sustained on [ date, time ] by [ mechanism ].",
      primaryDiagnosis: "Simple laceration, [ site ], [ … ] cm",
      procedure: obs("Wound toilet and primary suturing ([ … ] sutures, [ suture material ])", "[ length, depth, contamination; tendon, nerve, vessel and bone checked — intact; foreign body excluded / X-ray ]", "Local anaesthesia"),
      clinicalCourse:
        "Presented with a [ … ] cm laceration over the [ site ]. Neurovascular status and tendon function distal to the wound were intact. The wound was cleaned, explored and closed with [ … ] sutures under local anaesthesia. Tetanus [ … ]. Discharged on [ date, time ].",
      medications: [M.paracetamol, { ...M.amoxClav, indication: "only if contaminated, a hand wound, or a bite" }],
      advice: adv([
        { module: "Wound care", text: "Keep the dressing clean and dry for 48 hours, then wash gently and pat dry. Keep the part raised to reduce swelling." },
        TETANUS,
        { module: "Activity restrictions", text: "Avoid stretching the wound or heavy use of the part until the sutures are out." },
      ]),
      redFlags: ["Increasing redness, swelling, pain, warmth or pus at the wound", "Fever", "Numbness, weakness or colour change beyond the wound", "The wound opening up"],
      patientActions: ["Get the sutures removed on day [ … ] (face ~5 days, scalp ~7–10, limbs and over joints ~10–14) at [ … ].", "Wound check in 2–3 days if dirty or on antibiotics."],
      primaryCareActions: ["Wound check and suture removal on the day written."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism (glass, metal, bite, crush), time, contamination; tetanus status; diabetes, immune suppression, anticoagulants; hand dominance and occupation for hand wounds. Examination: size, depth, edges, contamination, foreign body; distal sensation, power, circulation and each tendon's function before anaesthesia; X-ray for glass or suspected fracture.",
    progressNote:
      "At discharge — wound explored and closed, distal neurovascular and tendon function intact after repair, tetanus addressed, suture-removal day written.",
  },

  // ---- Soft-tissue injury / sprain ----
  {
    key: "soft_tissue_injury",
    label: "Soft-tissue injury / sprain",
    match: /sprain|\bstrain\b|soft[- ]tissue injur|contusion|blunt (trauma|injury)|ligament (injury|sprain|tear)|\bbruise|twisting injury/i,
    scaffold: {
      indication: "Patient presented with pain and swelling of the [ site ] after a [ fall / twisting injury / blow ] on [ date ].",
      primaryDiagnosis: "[ Sprain / contusion / soft-tissue injury ] of the [ site ] — no bony injury",
      procedure: obs("[ Crepe bandage / splint / slab ] and analgesia", "[ tenderness site; X-ray — no fracture / not indicated by the decision rule; distal neurovascular status intact ]"),
      clinicalCourse:
        "Presented with a [ … ] injury. [ X-ray of the [ … ] showed no fracture / was not indicated. ] Distal circulation and sensation were intact. [ Crepe bandage / splint ] applied and analgesia given. Able to [ bear weight / use the limb ] at discharge on [ date, time ].",
      medications: [
        { generic: "Ibuprofen", strength: "400 mg", route: "PO", frequency: "TDS after food", duration: "5 days", indication: "avoid if kidney disease, stomach ulcer, asthma worsened by painkillers, or pregnancy", status: "new" },
        M.pantoprazole,
        { generic: "Diclofenac gel", strength: "1%", route: "Topical", frequency: "TDS", duration: "7 days", status: "new" },
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Activity restrictions", text: "Rest, ice (wrapped in a cloth, 15–20 minutes every 2–3 hours for 2 days), compression bandage (loosen if the toes / fingers turn cold, blue or numb) and elevation above the heart." },
        { module: "Mobilisation", text: "Start gentle movement after 48 hours and increase as pain allows. [ Use the crutch / sling as shown. ]" },
      ]),
      redFlags: ["Pain or swelling getting worse after 2–3 days", "Fingers or toes cold, blue, pale or numb", "Unable to bear weight or use the limb at all", "Severe pain not relieved by the tablets"],
      patientActions: ["See the Orthopaedics OPD on [ … ] if not improving in 1 week (a small fracture can show later on X-ray)."],
      primaryCareActions: ["Re-examine and X-ray if not improving at 7–10 days."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism, time, ability to bear weight immediately and now; swelling onset; previous injury to the same part; occupation and hand dominance. Examination: swelling, bruising, point tenderness over bone (decision rules — Ottawa ankle / knee), joint stability, range of movement, distal pulses, sensation and power. X-ray when the decision rule says so.",
    progressNote:
      "At discharge — fracture excluded or not indicated, distal neurovascular status intact, support applied, RICE and follow-up advice given.",
  },

  // ---- Renal colic settled ----
  {
    key: "renal_colic",
    label: "Renal colic — settled",
    match: /renal colic|ureteric (colic|calcul|stone)|kidney stone|renal (calcul|stone)|nephrolithiasis|urolithiasis|\bureterolithiasis\b|\bKUB stone/i,
    scaffold: {
      indication: "Patient presented with acute [ right / left ] loin-to-groin colicky pain [ with vomiting / haematuria ] suggestive of renal colic.",
      primaryDiagnosis: "[ Right / left ] renal colic — [ … ] mm [ upper / mid / lower ureteric / VUJ ] calculus [ with / without ] hydronephrosis",
      procedure: obs("Analgesia and observation", "[ USG KUB / NCCT KUB — stone size and site, hydronephrosis; urine routine; renal function; CBC ]"),
      clinicalCourse:
        "Presented with renal colic. Pain settled with [ … ]. Imaging showed [ … ]. Renal function was [ normal / … ]; no fever or signs of infection. Tolerating orals and pain-free at discharge on [ date, time ].",
      medications: [
        { generic: "Tamsulosin", strength: "0.4 mg", route: "PO", frequency: "HS", duration: "Until the stone passes, up to 4 weeks", indication: "for distal ureteric stone ≤ 10 mm (medical expulsive therapy); may cause dizziness on standing", status: "new" },
        { generic: "Diclofenac", strength: "50 mg", route: "PO", frequency: "SOS for pain, up to TDS after food", duration: "5 days", indication: "only if renal function is normal", status: "prn" },
        M.pantoprazole,
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Diet", text: "Drink 2.5–3 litres of water a day (urine should stay pale). Less salt; avoid excess tea, cola and packaged foods." },
        { module: "Activity restrictions", text: "Stay active. [ Strain the urine and keep any stone passed for analysis. ]" },
      ]),
      redFlags: ["Fever or chills with the pain", "Pain not controlled by the tablets", "Persistent vomiting", "Passing very little or no urine"],
      patientActions: ["Attend the Urology OPD on [ … ] with a repeat X-ray KUB / USG KUB done on [ … ] to check the stone has passed.", ED_RETURN],
      primaryCareActions: ["Confirm stone passage on imaging; refer if not passed in 4 weeks or if infection / obstruction."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Pain — onset, site, radiation, colicky; vomiting; haematuria; dysuria, fever (infected obstructed kidney is an emergency); previous stones; single kidney; renal disease; pregnancy in women; urinary retention. Examination: renal angle tenderness, abdomen to exclude other causes, temperature. Baseline: urine routine, renal function, CBC, USG KUB or NCCT KUB.",
    progressNote:
      "Observation — pain score and analgesia; vomiting; temperature; urine output. For discharge — pain settled, afebrile, renal function normal, stone size suitable for trial of passage, follow-up imaging date written.",
  },

  // ---- Hypoglycaemia corrected ----
  {
    key: "hypoglycaemia",
    label: "Hypoglycaemia — corrected",
    match: /hypoglyc/i,
    scaffold: {
      indication: "Patient, a known case of [ type 1 / type 2 ] diabetes on [ insulin / sulfonylurea ], presented with [ sweating / confusion / unresponsiveness ] and a capillary glucose of [ … ] mg/dL.",
      primaryDiagnosis: "Hypoglycaemia [ — cause: missed meal / dose error / renal impairment / alcohol / … ]",
      procedure: obs("IV dextrose [ … ] and observation for [ … ] hours with hourly capillary glucose", "[ glucose on arrival and serially; renal function; the drug and dose responsible ]"),
      clinicalCourse:
        "Presented with symptomatic hypoglycaemia (glucose [ … ] mg/dL). Corrected with [ … ]; GCS returned to 15/15. The cause was [ … ]. Observed for [ … ] hours with glucose maintained above [ … ] mg/dL after a normal meal. [ Diabetes medicine revised as below. ] Discharged on [ date, time ] with a family member.",
      medications: [
        { generic: "Usual diabetes medicine(s) — revised", dose: "[ … ]", route: "[ … ]", frequency: "[ … ]", indication: "the medicine / dose that caused the low sugar was [ reduced / stopped ]", status: "changed" },
      ],
      advice: adv([
        { module: "Diet", text: "Eat regular meals; never skip a meal after taking insulin or diabetes tablets. Carry glucose tablets, sugar or a sweet drink at all times." },
        { module: "Medication instructions", text: "If sweating, shaking, hunger or confusion: take 3–4 teaspoons of sugar or glucose in water at once, then a meal; check the sugar again after 15 minutes if you have a meter. Family: if not able to swallow, do not force food — bring to the emergency." },
        NO_DRIVE,
      ]),
      redFlags: ["Low sugar episodes happening again", "Confusion, drowsiness or a fit", "Not able to eat or drink"],
      patientActions: ["Check and write down the sugar [ before meals and at bedtime ] for the next [ … ] days.", "Attend the Medicine / Diabetes OPD on [ … ] with the sugar record."],
      primaryCareActions: ["Review the diabetes regimen and renal function; confirm no further hypoglycaemia."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Symptoms and how found; diabetes type and duration; exact drugs and doses, last dose and last meal; recent dose change; missed meals, vomiting, exercise, alcohol; renal or liver disease; previous episodes and awareness; non-diabetic — other drugs, sepsis, adrenal. Examination: GCS, injuries from a fall, signs of infection. Baseline: glucose, renal function, electrolytes.",
    progressNote:
      "Observation — hourly capillary glucose; GCS; meals taken. For discharge — glucose stable after a meal for the required period (longer for sulfonylurea or long-acting insulin), cause identified, regimen revised, family taught.",
  },

  // ---- Heat illness recovered (before gastroenteritis) ----
  {
    key: "heat_illness",
    label: "Heat illness — recovered",
    match: /heat (stroke|exhaustion|illness|syncope|cramps?|injury)|heatstroke|sunstroke|hyperthermia|heat[- ]related/i,
    scaffold: {
      indication: "Patient presented after [ working / exertion ] in the heat with [ fainting / cramps / exhaustion / confusion ] and a temperature of [ … ].",
      primaryDiagnosis: "[ Heat exhaustion / heat syncope / heat cramps / heat stroke — recovered ]",
      procedure: obs("Active cooling and IV fluids; observation for [ … ] hours", "[ core temperature on arrival; GCS; electrolytes; renal function; CK; liver function ]"),
      clinicalCourse:
        "Presented with [ … ] after heat exposure; temperature [ … ] on arrival. Cooled and rehydrated with [ … ]. Temperature normalised and symptoms resolved by [ … ]; GCS 15/15. Electrolytes, renal function and CK were [ … ]. Discharged on [ date, time ] tolerating orals.",
      medications: [M.ors, M.paracetamolSos],
      advice: adv([
        { module: "Diet", text: "Drink plenty of water and ORS / lemon water with salt; avoid alcohol, tea and coffee in excess." },
        { module: "Activity restrictions", text: "Rest in a cool place for [ … ] days. Avoid work in the sun between 12 and 4 pm; wear light, loose clothing and a head cover; take breaks in the shade and drink water every 20 minutes when working." },
      ]),
      redFlags: ["Confusion, fainting or a fit", "Temperature rising again", "Passing very little or dark urine", "Muscle pain with dark urine"],
      patientActions: ["Get renal function and electrolytes repeated on [ … ] if advised.", ED_RETURN],
      primaryCareActions: ["Recheck renal function if abnormal; counsel on heat precautions at work."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Exposure — activity, duration, time of day; fluids taken; symptoms — cramps, dizziness, fainting, confusion, seizure, vomiting; sweating; drugs (diuretics, anticholinergics, antipsychotics); alcohol; age and comorbidities. Examination: core temperature, GCS, hydration, BP, heart rate. Baseline: electrolytes, renal function, glucose, CK, liver function, urine for myoglobin.",
    progressNote:
      "Observation — temperature, GCS, vitals, urine output; fluids given. For discharge — normothermic, GCS 15/15, tolerating orals, urine output adequate, labs normal or improving.",
  },

  // ---- Acute gastroenteritis rehydrated ----
  {
    key: "gastroenteritis",
    label: "Acute gastroenteritis — rehydrated",
    match: /gastroenteritis|\bAGE\b|acute diarrh|diarrh(o)?ea|loose stools|food poisoning|dehydration/i,
    scaffold: {
      indication: "Patient presented with [ … ] episodes of loose stools [ and vomiting ] for [ … ] days with [ no / some ] dehydration.",
      primaryDiagnosis: "Acute gastroenteritis with [ no / some ] dehydration — rehydrated",
      procedure: obs("[ Oral / IV ] rehydration and observation for [ … ] hours", "[ hydration status; electrolytes; renal function; stool routine if blood / mucus ]"),
      clinicalCourse:
        "Presented with acute gastroenteritis and [ … ] dehydration. Rehydrated with [ ORS / IV fluids [ … ] ]. Vomiting settled; tolerating oral fluids; passed urine. [ Electrolytes and renal function … ]. Discharged on [ date, time ].",
      medications: [M.ors, M.ondansetronSos, M.paracetamolSos],
      advice: adv([
        { module: "Diet", text: "Keep drinking ORS and other fluids. Eat light, home-cooked food (rice, khichdi, curd, banana) in small amounts. Avoid outside food and street drinks." },
        { module: "Medication instructions", text: "Antibiotics are not needed for most loose motions — take them only if prescribed." },
        { module: "Activity restrictions", text: "Wash hands with soap after using the toilet and before eating or cooking. Drink boiled or filtered water." },
      ]),
      redFlags: ["Unable to keep fluids down", "Blood in the stools", "Passing very little urine, or feeling dizzy on standing", "High fever or severe abdominal pain", "Drowsiness or confusion"],
      patientActions: [ED_RETURN, "See a doctor if the loose motions last more than 3 days."],
      primaryCareActions: ["Recheck hydration if symptoms persist; stool examination if bloody or prolonged."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Stool frequency, volume, blood or mucus; vomiting; fever; abdominal pain; urine output; food and water source, others affected; travel; recent antibiotics; diabetes, renal disease, diuretics. Examination: hydration — pulse, BP lying and standing, mucosa, skin turgor, capillary refill; abdomen. Baseline: electrolytes and renal function if dehydrated; stool routine if bloody.",
    progressNote:
      "Observation — stool and vomiting episodes; fluids in; urine output; vitals. For discharge — tolerating oral fluids, passed urine, vitals normal, ORS explained.",
  },
];
