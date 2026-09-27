import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * ORTHOPAEDICS discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * Same rules as the general-surgery set in lib/discharge-templates.ts: what is written here
 * prints as written unless the resident changes it, and every patient-specific blank is a
 * visible `[ … ]`, never a guess.
 *
 * Medication lines are PRE-FILLED on the product owner's direction — a STARTING SET for an adult
 * in an Indian teaching-hospital ward, to be checked against each patient (allergy, renal
 * function, weight, bleeding risk, cultures, what they were already taking). Where the dose
 * depends on the patient (anticoagulant in renal impairment, culture-directed antibiotics) the
 * line carries `[ … ]` instead.
 *
 * `match` is tried against the typed procedure + diagnosis text; first match wins
 * (lib/specialty/discharge.ts), so the array is ordered specific-before-general.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "7 days", status: "new" } as TemplateMedication,
  aceclofenac: { generic: "Aceclofenac", strength: "100 mg", route: "PO", frequency: "BD after food", duration: "5 days", indication: "avoid if renal impairment, peptic ulcer or elderly frail", status: "new" } as TemplateMedication,
  tramadol: { generic: "Tramadol", strength: "50 mg", route: "PO", frequency: "SOS for severe pain", duration: "5 days", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "while on pain-killers", status: "new" } as TemplateMedication,
  calciumD3: { generic: "Calcium carbonate + vitamin D3", strength: "500 mg + 250 IU", route: "PO", frequency: "BD", duration: "6 weeks", status: "new" } as TemplateMedication,
  cholecalciferol: { generic: "Cholecalciferol (vitamin D3)", strength: "60,000 IU", route: "PO", frequency: "once a week", duration: "8 weeks", indication: "[ if vitamin D low / osteoporotic fracture ]", status: "new" } as TemplateMedication,
  lactulose: { generic: "Lactulose", dose: "15 ml", route: "PO", frequency: "HS", duration: "7 days", indication: "constipation while less mobile / on opioids", status: "new" } as TemplateMedication,
  enoxaparin: { generic: "Enoxaparin", strength: "40 mg", route: "SC", frequency: "OD", duration: "[ 28–35 days ]", indication: "thromboprophylaxis — [ dose per renal function; avoid / adjust if CrCl < 30 ]", status: "new" } as TemplateMedication,
  pregabalin: { generic: "Pregabalin", strength: "75 mg", route: "PO", frequency: "HS", duration: "4 weeks", indication: "radicular / neuropathic pain", status: "new" } as TemplateMedication,
  methylcobalamin: { generic: "Methylcobalamin", strength: "1500 mcg", route: "PO", frequency: "OD", duration: "4 weeks", status: "new" } as TemplateMedication,
  cefuroxime: { generic: "Cefuroxime", strength: "500 mg", route: "PO", frequency: "BD", duration: "5 days", indication: "[ or per culture ]", status: "new" } as TemplateMedication,
};

const RF_WOUND = [
  "Persistent or high fever",
  "Increasing redness, swelling, pain or discharge at the wound",
];
const RF_LIMB = [
  "Increasing pain, tightness or swelling of the limb not eased by elevation and pain-killers",
  "Numbness, tingling, coldness, or the fingers / toes turning pale or blue",
  "Inability to move the fingers or toes",
];
const RF_DVT = [
  "Pain or swelling of the calf or thigh",
  "Sudden breathlessness or chest pain",
];

const OPD = "Attend the Orthopaedics OPD after [ 2 weeks ] for a wound review and suture / staple removal.";
const XRAY = "Attend with a check X-ray of the operated part at [ 6 weeks ] as advised.";

// --- the eight -------------------------------------------------------------------------

export const ORTHOPAEDICS_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Septic arthritis / osteomyelitis (checked first — "washout" / "debridement") ----
  {
    key: "ortho_septic_bone_joint",
    label: "Septic arthritis / osteomyelitis",
    match: /septic arthritis|pyogenic arthritis|arthrotomy|(joint|knee|hip|shoulder|arthroscopic) (wash-?out|lavage)|osteomyelitis|sequestrectom|saucerisation|saucerization|bone abscess|brodie/i,
    scaffold: {
      indication:
        "Patient was admitted with [ pain, swelling and fever of the (joint / limb) ] with clinical and laboratory features of [ septic arthritis / acute / chronic osteomyelitis ], requiring surgical drainage and intravenous antibiotics.",
      primaryDiagnosis: "[ Septic arthritis of the (right / left) (joint) / (acute / chronic) osteomyelitis of the (bone) ] — [ organism and sensitivity ]",
      procedure: {
        name: "[ Arthrotomy and joint washout / arthroscopic lavage / sequestrectomy and saucerisation / drainage of subperiosteal abscess ]",
        anaesthesia: "[ General / spinal ] anaesthesia",
        findings: "[ nature and volume of pus; cartilage state; sequestrum size and site; involucrum; samples sent for culture, AFB and histopathology ]",
        drains: "[ suction drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed; pus and tissue sent for culture and histopathology.",
      },
      clinicalCourse:
        "Admitted with [presentation]. Blood and aspirate cultures were sent and empirical intravenous antibiotics started. Underwent [procedure] on [date]. Culture grew [ organism ] sensitive to [ … ]; antibiotics were changed accordingly. Fever settled, local signs and CRP / ESR improved [ CRP __ → __ ]. The limb was [ splinted / mobilised ]. The patient is afebrile with a healthy wound at discharge, to complete oral antibiotics.",
      medications: [
        { generic: "[ Culture-directed oral antibiotic ]", strength: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … weeks — total course per organism and response ]", indication: "per culture sensitivity", status: "new" },
        M.paracetamol,
        { ...M.aceclofenac, frequency: "SOS for pain", status: "prn" },
        M.pantoprazole,
      ],
      advice: adv([
        { module: "Medication instructions", text: "The antibiotic course is long. Take every dose for the full duration even when the pain and fever are gone; stopping early lets the infection come back." },
        { module: "Wound care", text: "Keep the wound clean and dry; attend for dressings as advised." },
        { module: "Mobilisation", text: "[ Non-weight-bearing / partial weight-bearing ] on the affected limb with support until reviewed." },
        { module: "Physiotherapy", text: "Gentle range-of-movement exercises of the joint as taught, to prevent stiffness." },
        { module: "Diet", text: "A high-protein diet. Keep blood sugar well controlled if diabetic." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Return of joint swelling or pain, or inability to move the joint",
        "Pus or discharge from the wound or a new sinus",
        "Rash, diarrhoea or severe stomach upset on the antibiotic",
      ],
      patientActions: [
        OPD,
        "Complete the full antibiotic course: [ … weeks ].",
        "Get CBC, CRP and ESR repeated at [ 2 weeks ] and bring the reports.",
        XRAY,
      ],
      primaryCareActions: [
        "Monitor for antibiotic side-effects and adherence.",
        "Repeat CRP / ESR as advised; refer back if rising.",
        "Optimise blood sugar in diabetics.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Pain, swelling, fever, onset and duration; inability to bear weight or move the joint; preceding trauma, injection, surgery or skin infection; discharging sinus and extruded bone pieces (chronic osteomyelitis); diabetes, immunosuppression, sickle-cell disease, IV drug use; TB contact and constitutional symptoms. Examination: temperature, joint effusion, warmth, painful restriction of movement, local tenderness, sinus, limb length and deformity, regional nodes. Baseline: CBC, CRP, ESR, blood culture, joint aspirate (cell count, Gram stain, culture, AFB), blood sugar, X-ray of the part, USG / MRI as indicated.",
    progressNote:
      "Each day — temperature trend; pain; joint swelling and range; wound and drain output; CRP / TLC trend; culture report and antibiotic change; limb splintage. Discharge day — afebrile, CRP falling, wound healthy, oral antibiotic chosen and duration fixed; follow-up bloods and X-ray planned.",
  },

  // ---- Open fracture — debridement and external fixator ----
  {
    key: "ortho_open_fracture_exfix",
    label: "Open fracture — external fixator",
    match: /open fracture|compound fracture|gustilo|external fixat|ex-?fix|\bJESS\b|\bLRS\b|ilizarov|ring fixator/i,
    scaffold: {
      indication:
        "Patient was admitted after [ mechanism of injury ] with an open fracture of the [ right / left ] [ bone ] [ Gustilo-Anderson grade __ ], requiring debridement and skeletal stabilisation.",
      primaryDiagnosis: "Open fracture [ right / left ] [ bone, site ] — Gustilo-Anderson grade [ I / II / IIIA / IIIB / IIIC ]",
      procedure: {
        name: "Wound debridement and [ external fixator (uniplanar / JESS / LRS / ring) ] application [ + wound closure / flap / split-skin graft ]",
        anaesthesia: "[ Spinal / general / regional block ] anaesthesia",
        findings: "[ wound size and contamination; soft-tissue and bone loss; neurovascular status; fixator construct ]",
        drains: "[ nil / NPWT (vacuum dressing) ]",
        complications: "Nil",
        outcome: "Procedure completed; limb stabilised.",
      },
      clinicalCourse:
        "Received after [mechanism] on [date]; tetanus prophylaxis and intravenous antibiotics were given in the emergency department. Underwent debridement and external fixator application on [date] [ and relook debridement on __ / wound cover by __ on __ ]. Postoperatively the limb was elevated; distal neurovascular status remained intact; pin sites are clean. The patient is afebrile and mobilising [ non-weight-bearing with a walker ] at discharge. [ Definitive fixation is planned on __. ]",
      medications: [
        M.cefuroxime,
        M.paracetamol,
        M.aceclofenac,
        M.pantoprazole,
        M.calciumD3,
        { ...M.enoxaparin, duration: "[ until mobile ]", indication: "[ if lower-limb injury and immobile ] — dose per renal function" },
      ],
      advice: adv([
        { module: "Wound care", text: "Clean each pin site once a day as taught (sterile saline, dry gauze). Do not remove the crusts forcibly. Keep the fixator clean and dry." },
        { module: "Mobilisation", text: "[ Non-weight-bearing ] on the injured limb with a walker / crutches until told otherwise." },
        { module: "Physiotherapy", text: "Move the joints above and below the fixator and do toe / finger exercises several times a day. Keep the limb elevated when resting." },
        { module: "Activity restrictions", text: "Do not adjust or loosen any part of the fixator. Stop smoking — it delays bone healing." },
        { module: "Diet", text: "A high-protein, calcium-rich diet." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Pus, spreading redness or loosening at a pin site",
        ...RF_LIMB,
        ...RF_DVT,
      ],
      patientActions: [
        "Attend the Orthopaedics OPD after [ 1 week ] for a pin-site and wound review.",
        "Attend for suture removal on postoperative day [ 12–14 ].",
        "Complete the antibiotic course.",
        "[ Attend for definitive fixation / wound cover on __. ]",
        XRAY,
      ],
      primaryCareActions: [
        "Check pin sites and the wound; treat a pin-site infection early.",
        "Support smoking cessation.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Mechanism and time of injury; time to first antibiotic; tetanus status; contamination (farm, road, water); other injuries (ATLS primary and secondary survey); smoking, diabetes, previous function. Examination: wound size, contamination, soft-tissue loss, exposed bone, distal pulses, capillary refill, sensation and motor function, compartment signs, photographs of the wound. Baseline: X-ray of the whole bone with the joints above and below, CBC, blood group and cross-match, renal function, blood sugar.",
    progressNote:
      "Each day — distal neurovascular status; compartment check; wound / NPWT and pin sites; temperature; antibiotic day; limb elevation; mobilisation. Discharge day — pin sites clean, wound settling, mobilising safely; next surgery date and pin-site care taught.",
  },

  // ---- Hip fracture ----
  {
    key: "ortho_hip_fracture",
    label: "Hip fracture — hemiarthroplasty / DHS / PFN",
    match: /hip fracture|fracture[d]?(?: of)?(?: the)? (neck of (the )?femur|femoral neck|intertrochanteric|subtrochanteric|proximal femur)|(neck of (the )?femur|femoral neck|intertrochanteric|inter-trochanteric|subtrochanteric|trochanteric|\bNOF\b) fracture|\bIT fracture|hemiarthroplasty|bipolar (hemi|prosthesis)|austin[- ]moore|\bDHS\b|dynamic hip screw|\bPFNA?\b|proximal femoral nail|cannulated (cancellous )?screw/i,
    scaffold: {
      indication:
        "Patient was admitted after [ a fall at home ] with pain and inability to bear weight on the [ right / left ] hip, with an X-ray showing a [ neck of femur / intertrochanteric / subtrochanteric ] fracture requiring surgical fixation.",
      primaryDiagnosis: "[ Right / left ] [ intracapsular neck of femur (Garden __) / intertrochanteric / subtrochanteric ] fracture",
      procedure: {
        name: "[ Bipolar / unipolar hemiarthroplasty (cemented / uncemented) / DHS fixation / PFN / cannulated screw fixation ]",
        anaesthesia: "[ Spinal / general ] anaesthesia [ + fascia iliaca block ]",
        findings: "[ fracture pattern; reduction achieved; implant size; tip-apex distance ]",
        drains: "[ suction drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; check X-ray satisfactory.",
      },
      clinicalCourse:
        "Admitted after [mechanism] on [date]. Optimised for surgery [ correction of anaemia / electrolytes / medical review ]. Underwent [procedure] on [date]. Postoperatively [ … units of blood were transfused ]; check X-ray showed [ satisfactory reduction and implant position ]. Mobilised [ full weight-bearing / partial weight-bearing ] with a walker from POD [ __ ] under physiotherapy. Delirium, pressure areas and bowels were monitored. The patient is afebrile, comfortable and walking with a walker at discharge.",
      medications: [
        M.paracetamol,
        M.tramadol,
        M.pantoprazole,
        { ...M.enoxaparin, duration: "[ 28–35 days ] from surgery" },
        M.calciumD3,
        { ...M.cholecalciferol, indication: "osteoporotic fracture — [ check vitamin D ]" },
        M.lactulose,
      ],
      advice: adv([
        { module: "Mobilisation", text: "Walk with the walker several times a day, [ full / partial ] weight on the operated leg as taught. Do not walk unaided until reviewed." },
        { module: "Activity restrictions", text: "[ After hemiarthroplasty: do not bend the hip beyond 90°, do not cross the legs, do not sit on a low stool or squat, keep a pillow between the knees in bed. ]" },
        { module: "Physiotherapy", text: "Do the ankle-pump, quadriceps and hip exercises taught on the ward every day." },
        { module: "Wound care", text: "Keep the wound clean and dry." },
        { module: "Medication instructions", text: "Give the blood-thinning injection daily for the full course. Take calcium and vitamin D as prescribed — [ bone-strengthening treatment will be discussed at follow-up ]." },
        { module: "Activity restrictions", text: "Make the home safe against falls: good lighting, no loose rugs, a raised commode / western toilet, a support rail." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Sudden severe hip pain, the leg turning out or shortening, or a click and inability to bear weight (dislocation / fixation failure)",
        ...RF_DVT,
        "New confusion or drowsiness",
        "A red or broken area of skin over the back, buttocks or heels",
      ],
      patientActions: [
        OPD,
        "Complete the full course of the blood-thinning injections.",
        XRAY,
        "Discuss treatment for osteoporosis at the follow-up visit.",
      ],
      primaryCareActions: [
        "Teach or give the daily blood-thinning injection.",
        "Review delirium, bowels and pressure areas.",
        "Falls-risk assessment and medication review (sedatives, antihypertensives).",
        "Start / continue osteoporosis treatment.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Mechanism of fall and why (syncope, dizziness, trip); time since fall and time on the floor; pre-injury mobility and walking aid; living situation; previous fractures; comorbidities, anticoagulants and antiplatelets; cognition. Examination: shortening and external rotation, tenderness, distal neurovascular status, pressure areas, other injuries (wrist, head), cardiorespiratory examination. Baseline: X-ray pelvis with both hips and lateral of the hip, CBC, renal function, electrolytes, blood sugar, coagulation, ECG, chest X-ray, blood group and cross-match; AMTS / delirium screen.",
    progressNote:
      "Each day — pain; delirium screen; haemoglobin; urine output and catheter; bowels; pressure areas; wound; chest; thromboprophylaxis given; weight-bearing status and physiotherapy progress. Discharge day — walking with a walker, wound healthy, bowels open, catheter out and voiding; thromboprophylaxis and falls plan in place.",
  },

  // ---- Total knee / hip replacement ----
  {
    key: "ortho_arthroplasty",
    label: "Total knee / hip replacement",
    match: /\bTKR\b|\bTKA\b|\bTHR\b|\bTHA\b|total (knee|hip) (replacement|arthroplasty)|(knee|hip) replacement|unicondylar|\bUKA\b/i,
    scaffold: {
      indication:
        "Patient was admitted for an elective [ total knee / total hip ] replacement of the [ right / left / both ] side(s) for [ osteoarthritis / rheumatoid arthritis / avascular necrosis ] with pain and loss of function despite conservative treatment.",
      primaryDiagnosis: "[ Primary osteoarthritis / rheumatoid arthritis / AVN of femoral head ] — [ right / left / bilateral ] [ knee / hip ]",
      procedure: {
        name: "[ Right / left / bilateral ] [ total knee / total hip ] arthroplasty [ cemented / uncemented / hybrid ]",
        anaesthesia: "[ Spinal / combined spinal-epidural ] anaesthesia [ + adductor canal block ]",
        findings: "[ deformity and its correction; bone quality; implant make and sizes ]",
        drains: "[ suction drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; check X-ray satisfactory.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Mobilised full weight-bearing with a walker from POD [ __ ] under physiotherapy; [ knee flexion __° / hip precautions taught ]. [ Drain removed on POD __. ] Check X-ray showed satisfactory implant position. The patient is afebrile, the wound is healthy and the patient is walking with a walker and climbing stairs with support at discharge.",
      medications: [
        M.paracetamol,
        M.aceclofenac,
        M.tramadol,
        M.pantoprazole,
        { generic: "Rivaroxaban", strength: "10 mg", route: "PO", frequency: "OD", duration: "[ 14 days after knee / 35 days after hip replacement ]", indication: "thromboprophylaxis — [ check CrCl; avoid if < 15, caution < 30 ] (or enoxaparin 40 mg SC OD)", status: "new" },
        M.calciumD3,
      ],
      advice: adv([
        { module: "Mobilisation", text: "Walk with the walker several times a day, full weight as tolerated. Progress to a stick when advised." },
        { module: "Physiotherapy", text: "Do the exercises taught every day — [ knee: bending and straightening, quadriceps, ice after exercise / hip: abduction and strengthening ]. Aim for [ knee flexion of 90° by 2 weeks ]." },
        { module: "Activity restrictions", text: "[ After hip replacement: for 6 weeks do not bend the hip beyond 90°, cross the legs, squat, or sit cross-legged or on a low seat; use a raised toilet seat. ] Avoid squatting and sitting on the floor." },
        { module: "Wound care", text: "Keep the wound clean and dry; do not apply anything to it." },
        { module: "Medication instructions", text: "Take the blood-thinning tablet daily for the full course. Tell any doctor or dentist you have a joint replacement — antibiotics may be needed before dental or urinary procedures." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Wound leaking fluid after the first few days",
        "Sudden pain with the leg turning, shortening or giving way (dislocation)",
        ...RF_DVT,
        "Bleeding gums, blood in the urine or black stools on the blood thinner",
      ],
      patientActions: [
        OPD,
        "Complete the blood-thinner course.",
        XRAY,
        "Attend outpatient physiotherapy as scheduled.",
      ],
      primaryCareActions: [
        "Encourage the exercise programme.",
        "Treat any infection anywhere promptly (risk to the joint).",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Pain — site, night pain, rest pain; walking distance and aids; stiffness; deformity; previous injections or surgery on the joint; response to conservative treatment; comorbidities (diabetes, heart disease), anticoagulants, dental and skin infections, steroid use. Examination: gait, deformity (varus / valgus, fixed flexion), range of movement, limb length, ligament stability, distal pulses, spine and other joints, skin over the joint. Baseline: standing X-rays of the joint, CBC, ESR / CRP, blood sugar and HbA1c, renal function, urine routine and culture, ECG, echo if indicated, dental check.",
    progressNote:
      "Each day — pain; wound and drain; haemoglobin; distal neurovascular status; range of movement achieved; weight-bearing and distance walked; thromboprophylaxis given; calf check. Discharge day — independent with a walker, stairs with support, wound healthy, target range reached, blood-thinner plan understood.",
  },

  // ---- Arthroscopy — ACL reconstruction ----
  {
    key: "ortho_acl_arthroscopy",
    label: "Arthroscopic ACL reconstruction",
    match: /\bACL\b|anterior cruciate|\bPCL\b|posterior cruciate|arthroscop|menisc(ectomy|al repair|us)|ligament reconstruction/i,
    scaffold: {
      indication:
        "Patient was admitted for arthroscopic reconstruction of an [ ACL ] tear of the [ right / left ] knee [ with meniscal injury ] following [ a sports / twisting injury ], with instability.",
      primaryDiagnosis: "[ Right / left ] knee [ ACL tear ] [ + medial / lateral meniscus tear ]",
      procedure: {
        name: "Arthroscopic [ ACL reconstruction with (hamstring / BTB / peroneus) graft ] [ + partial meniscectomy / meniscal repair ]",
        anaesthesia: "[ Spinal / general ] anaesthesia",
        findings: "[ ligament and meniscal findings; cartilage; graft size; fixation (endobutton / interference screw) ]",
        drains: "[ nil / suction drain ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. The knee was placed in a [ hinged knee brace locked in extension ]. Pain was controlled; quadriceps and straight-leg-raise exercises started on POD 1 and the patient mobilised [ partial / full weight-bearing ] with crutches. The wound is healthy and the patient is comfortable at discharge.",
      medications: [M.paracetamol, M.aceclofenac, M.pantoprazole, M.tramadol],
      advice: adv([
        { module: "Mobilisation", text: "Walk with crutches, [ partial / full ] weight as tolerated, wearing the knee brace [ locked in extension ] until reviewed." },
        { module: "Physiotherapy", text: "Follow the ACL rehabilitation programme: quadriceps sets, straight-leg raise, ankle pumps, and knee bending up to [ 90° ] as taught. Ice the knee for 20 minutes after exercise." },
        { module: "Activity restrictions", text: "No running, twisting, jumping or sport until cleared — usually not before 6–9 months." },
        { module: "Wound care", text: "Keep the portal and graft-site wounds clean and dry." },
      ]),
      redFlags: [...RF_WOUND, "The knee becoming very swollen, hot and painful", ...RF_DVT],
      patientActions: [
        "Attend the Orthopaedics OPD after [ 2 weeks ] for suture removal.",
        "Attend the physiotherapy department as scheduled.",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism of injury (twisting, non-contact, pop), immediate swelling, ability to continue play; episodes of giving way; locking or catching (meniscus); sport and activity level; previous knee injury. Examination: effusion, joint-line tenderness, Lachman, anterior drawer, pivot shift, McMurray, collateral ligaments, range of movement, quadriceps wasting. Baseline: X-ray knee, MRI knee, pre-anaesthetic workup.",
    progressNote:
      "POD 0 — pain; distal neurovascular status; dressing; brace position. POD 1 — straight-leg raise achieved; flexion __°; mobilising with crutches; wound dry. Plan: discharge with brace and rehabilitation protocol.",
  },

  // ---- Lumbar discectomy / spinal decompression (ortho-spine) ----
  {
    key: "ortho_spine_decompression",
    label: "Lumbar discectomy / spinal decompression",
    match: /discectomy|microdiscectomy|laminectomy|laminotomy|fenestration|spinal decompression|\bPIVD\b|prolapsed (intervertebral )?disc|disc prolapse|lumbar canal stenosis|\bLCS\b|\bTLIF\b|\bPLIF\b/i,
    scaffold: {
      indication:
        "Patient was admitted with [ low back pain radiating to the (right / left) leg / neurogenic claudication ] due to [ PIVD at L__–L__ / lumbar canal stenosis ] not responding to conservative treatment, requiring surgical decompression.",
      primaryDiagnosis: "[ PIVD L__–L__ with (right / left) radiculopathy / lumbar canal stenosis L__–L__ ]",
      procedure: {
        name: "[ Fenestration and discectomy / microdiscectomy / laminectomy and decompression ] at L__–L__ [ + TLIF / pedicle-screw fixation ]",
        anaesthesia: "General anaesthesia",
        findings: "[ disc fragment — sequestrated / extruded; nerve root compression; dural tear (nil) ]",
        drains: "[ suction drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed; root decompressed.",
      },
      clinicalCourse:
        "Underwent [procedure] on [date]. Postoperatively the leg pain [ resolved / improved ]; neurology is [ unchanged / improved — power __ ]; bladder and bowel function normal. [ Drain removed on POD __. ] Mobilised with [ a lumbar belt ] from POD [ __ ]. The patient is comfortable, walking independently with a healthy wound at discharge.",
      medications: [
        M.paracetamol,
        M.aceclofenac,
        M.pantoprazole,
        M.pregabalin,
        M.methylcobalamin,
        { generic: "Thiocolchicoside", strength: "4 mg", route: "PO", frequency: "BD", duration: "5 days", indication: "muscle spasm", status: "new" },
        M.lactulose,
      ],
      advice: adv([
        { module: "Mobilisation", text: "Walk every day, increasing the distance gradually. Wear the lumbar belt when up [ for 6 weeks ]." },
        { module: "Activity restrictions", text: "No forward bending, twisting, sitting on the floor or long car journeys for 6 weeks. Log-roll to get out of bed." },
        { module: "Lifting restrictions", text: "No lifting over 5 kg for 6 weeks; bend the knees, not the back." },
        { module: "Physiotherapy", text: "Start the back-strengthening exercises taught at [ 4–6 weeks ]." },
        { module: "Wound care", text: "Keep the wound clean and dry." },
      ]),
      redFlags: [
        ...RF_WOUND,
        "Clear fluid leaking from the wound, or headache on sitting up",
        "New weakness or numbness in the legs",
        "Numbness around the back passage or genitals, or loss of control of urine or stool",
      ],
      patientActions: [OPD, "Attend physiotherapy at [ 4–6 weeks ]."],
      primaryCareActions: ["Refer back urgently with any new weakness or bladder / bowel disturbance."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Back pain and leg pain — which dominates, dermatome, duration; claudication distance; numbness, weakness, foot drop; bladder and bowel symptoms, saddle anaesthesia; conservative treatment tried; red flags (fever, weight loss, trauma, cancer history, TB). Examination: posture, spinal tenderness, SLR and crossed SLR, femoral stretch, dermatomal sensation, myotomal power, reflexes, perianal sensation and anal tone, peripheral pulses. Baseline: MRI lumbosacral spine, X-ray with flexion-extension views, pre-anaesthetic workup.",
    progressNote:
      "Each day — leg pain versus before; power and sensation by root; bladder / bowel; wound and drain; mobilisation. Discharge day — walking independently, neurology stable or better, wound dry, no CSF leak.",
  },

  // ---- Fracture fixation — ORIF plate / nail ----
  {
    key: "ortho_fracture_fixation",
    label: "Fracture fixation — ORIF plate / nail",
    match: /\bORIF\b|\bCRIF\b|open reduction|internal fixation|\bplat(e|ing)\b|(intramedullary|interlocking|\bIM|\bIL|femoral|femur|tibial|tibia|humeral|humerus) nail|nailing|\bILN\b|\bTENS\b|elastic nail|k-?wires?|kirschner|\bCRPP\b|tension band|\bTBW\b|lag screw/i,
    scaffold: {
      indication:
        "Patient was admitted after [ mechanism of injury ] with a closed fracture of the [ right / left ] [ bone, site ] requiring operative fixation.",
      primaryDiagnosis: "[ Right / left ] closed [ fracture pattern ] fracture of the [ bone, site ] [ classification ]",
      procedure: {
        name: "[ Open reduction and internal fixation with (plate type) / closed reduction and intramedullary nailing / K-wire fixation / tension-band wiring ]",
        anaesthesia: "[ Spinal / general / regional block ] anaesthesia",
        findings: "[ fracture pattern; comminution; reduction achieved; implant ]",
        drains: "[ suction drain / nil ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; check X-ray satisfactory.",
      },
      clinicalCourse:
        "Admitted after [mechanism] on [date]; the limb was splinted and elevated. Underwent [procedure] on [date]. Distal neurovascular status remained intact; check X-ray showed [ satisfactory reduction and implant position ]. Mobilised [ non- / partial weight-bearing ] under physiotherapy. The patient is afebrile, comfortable and the wound is healthy at discharge.",
      medications: [
        M.paracetamol,
        M.aceclofenac,
        M.tramadol,
        M.pantoprazole,
        M.calciumD3,
        { ...M.enoxaparin, duration: "[ until mobile ]", indication: "[ lower-limb / pelvic fracture with reduced mobility ] — dose per renal function" },
      ],
      advice: adv([
        { module: "Mobilisation", text: "[ Non-weight-bearing / partial / full weight-bearing ] on the operated limb with [ crutches / walker ] until reviewed. [ Upper limb: arm sling for comfort. ]" },
        { module: "Physiotherapy", text: "Move the fingers / toes and the free joints several times a day; do the exercises taught. Keep the limb elevated when resting." },
        { module: "Wound care", text: "Keep the wound clean and dry." },
        { module: "Activity restrictions", text: "No driving or heavy work until the fracture has united. Stop smoking — it slows bone healing." },
        { module: "Diet", text: "A high-protein, calcium-rich diet." },
      ]),
      redFlags: [...RF_WOUND, ...RF_LIMB, ...RF_DVT],
      patientActions: [OPD, XRAY, "Attend physiotherapy as scheduled."],
      primaryCareActions: ["Check the wound; support smoking cessation."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism and time of injury; other injuries; hand dominance / occupation; previous function; smoking, diabetes, steroids, osteoporosis; anticoagulants. Examination: deformity, swelling, skin integrity (closed / open), distal pulses, capillary refill, sensation and motor function of named nerves, compartment signs, joints above and below. Baseline: X-ray two views with joints above and below, CT for intra-articular fractures, CBC, blood group, renal function, blood sugar.",
    progressNote:
      "Each day — pain; distal neurovascular status; compartment check; swelling and elevation; wound and drain; weight-bearing and physiotherapy. Discharge day — check X-ray satisfactory, wound healthy, mobilising safely with the aid, neurovascular intact.",
  },

  // ---- Closed reduction and cast / slab ----
  {
    key: "ortho_closed_reduction_cast",
    label: "Closed reduction and cast / slab",
    match: /closed reduction|\bcast\b|\bslab\b|\bPOP\b|plaster|above[- ]knee|below[- ]knee|above[- ]elbow|below[- ]elbow|colles|conservative(ly)? (manage|treat)[^.]*fracture|fracture[^.]*conservative/i,
    scaffold: {
      indication:
        "Patient was admitted after [ mechanism of injury ] with a closed [ fracture / dislocation ] of the [ right / left ] [ bone, site ] managed by closed reduction and immobilisation.",
      primaryDiagnosis: "[ Right / left ] closed [ fracture / dislocation ] of the [ bone, site ]",
      procedure: {
        name: "Closed reduction and [ above- / below-elbow / above- / below-knee ] [ plaster cast / POP slab ]",
        anaesthesia: "[ Sedation / haematoma block / regional block / general ] anaesthesia",
        findings: "[ reduction achieved on check X-ray ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Reduction satisfactory; limb immobilised.",
      },
      clinicalCourse:
        "Admitted after [mechanism] on [date]. Closed reduction under [ anaesthesia ] and [ cast / slab ] application was done on [date]; check X-ray showed [ acceptable reduction ]. The limb was elevated and swelling settled; distal circulation and sensation remain normal. The patient is comfortable at discharge.",
      medications: [M.paracetamol, M.aceclofenac, M.pantoprazole, M.calciumD3],
      advice: adv([
        { module: "Activity restrictions", text: "Keep the plaster dry and do not push anything inside it. Do not cut or remove it. Keep the limb raised above heart level for the first few days." },
        { module: "Physiotherapy", text: "Move the fingers / toes and the free joints often." },
        { module: "Mobilisation", text: "[ Non-weight-bearing with crutches (lower limb) / arm in a sling (upper limb) ] until reviewed." },
      ]),
      redFlags: [
        ...RF_LIMB,
        "The plaster feeling too tight, cracking, becoming loose or wet",
        "A burning or rubbing sore under the plaster, or a bad smell",
        ...RF_DVT,
      ],
      patientActions: [
        "Attend the Orthopaedics OPD after [ 1 week ] with a check X-ray in the plaster.",
        "[ Slab to be completed to a full cast on __. ] Plaster removal expected at [ __ weeks ].",
      ],
      primaryCareActions: ["Check the plaster and circulation if the patient returns with pain or swelling."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Mechanism and time of injury; hand dominance; previous injury to the limb; osteoporosis risk. Examination: deformity, swelling, skin, distal pulses, capillary refill, sensation and motor function, joints above and below. Baseline: X-ray two views with the joints above and below; post-reduction X-ray.",
    progressNote:
      "Each day — pain; swelling; circulation, sensation and movement of the fingers / toes; plaster check; elevation. Discharge day — swelling settled, neurovascular intact, plaster comfortable, check X-ray acceptable.",
  },
];

/** When the typed diagnosis matches none of the eight. */
export const ORTHOPAEDICS_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "ortho_generic",
  label: "Orthopaedics — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presentation / injury ] requiring [ inpatient management / surgery ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure name ]",
      anaesthesia: "[ General / spinal / regional ]",
      findings: "[ significant operative findings; implant ]",
      drains: "[ drains, if any ]",
      complications: "Nil",
      outcome: "Procedure completed successfully.",
    },
    clinicalCourse:
      "Admitted with [presentation]. [Procedure] was performed on [date]. The postoperative period was [uneventful]; distal neurovascular status remained intact. The patient is afebrile, comfortable and mobilising [ with support ] at discharge.",
    medications: [M.paracetamol, M.aceclofenac, M.pantoprazole],
    advice: adv([
      { module: "Wound care", text: "Keep the wound clean and dry." },
      { module: "Mobilisation", text: "[ Weight-bearing status ] with [ walking aid ] until reviewed." },
      { module: "Physiotherapy", text: "Do the exercises taught on the ward every day." },
    ]),
    redFlags: [...RF_WOUND, ...RF_LIMB, ...RF_DVT],
    patientActions: [OPD, XRAY],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, mechanism and duration; function before the problem; past medical, surgical and drug history; examination of the part with distal neurovascular status and the joints above and below; provisional diagnosis and plan. Baseline: X-rays and investigations as indicated.",
  progressNote:
    "Each day — pain; distal neurovascular status; wound / drain; mobilisation; the day's plan. On readiness — afebrile, wound healthy, mobilising safely. For discharge with advice.",
};
