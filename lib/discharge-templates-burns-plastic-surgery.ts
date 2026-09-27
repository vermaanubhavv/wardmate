import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * BURNS & PLASTIC SURGERY discharge templates. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Same rule as lib/discharge-templates.ts: what is written here prints as written unless the
 * resident changes it; a genuinely patient-specific blank is `[ … ]` and prints as a visible
 * blank, never as a guess.
 *
 * Medication lines are a STARTING SET to be checked against each patient — allergy, weight,
 * renal function, wound cultures, what they were already taking. Adult doses only; the cleft
 * template (an infant) carries no numeric dose at all — every dose there is weight-based and
 * written by the treating team.
 *
 * Ordered specific before general (first match wins, lib/specialty/discharge.ts): contracture
 * and electrical before the burn-graft template, and the plain dressings template last.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  tramadolSos: { generic: "Tramadol", strength: "50 mg", route: "PO", frequency: "SOS for severe pain, maximum TDS", duration: "5 days", status: "prn" } as TemplateMedication,
  diclofenac: { generic: "Diclofenac", strength: "50 mg", route: "PO", frequency: "SOS for pain", duration: "5 days", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "7 days", status: "new" } as TemplateMedication,
  cetirizine: { generic: "Cetirizine", strength: "10 mg", route: "PO", frequency: "HS", duration: "14 days", indication: "itching of healing skin", status: "new" } as TemplateMedication,
  ssd: { generic: "Silver sulfadiazine 1% cream", route: "topical", frequency: "with each dressing change", duration: "till healed", indication: "on the raw areas", status: "new" } as TemplateMedication,
  emollient: { generic: "Liquid paraffin / white soft paraffin emollient", route: "topical", frequency: "TDS and after bathing", duration: "3 months", indication: "on healed skin and grafts, with gentle massage", status: "new" } as TemplateMedication,
  multivit: { generic: "Multivitamin with zinc and vitamin C", dose: "1 tablet", route: "PO", frequency: "OD", duration: "1 month", status: "new" } as TemplateMedication,
  protein: { generic: "High-protein nutritional supplement", dose: "2 scoops in milk / water", route: "PO", frequency: "BD", duration: "1 month", status: "new" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  lactulose: { generic: "Lactulose", dose: "15 ml", route: "PO", frequency: "HS", duration: "7 days", indication: "keep stools soft", status: "new" } as TemplateMedication,
};

const RF_WOUND = [
  "Fever, or feeling hot and shivery",
  "Increasing pain, redness or swelling around a wound or graft",
  "Foul smell, pus or green discharge from a dressing",
];
const RF_GRAFT = [
  "The graft or flap turning dark, black, or lifting off",
  "Bleeding that soaks through the dressing",
];

const OPD_DRESSING = "Attend the Plastic Surgery OPD / dressing room on [ … ] for the next dressing.";
const PRESSURE_GARMENT = "Wear the pressure garment for 23 hours a day once the graft / wound is stable, for 6–12 months; remove only for bathing and massage.";
const SCAR_CARE = "Massage the healed skin with moisturiser 3–4 times a day. Protect it from the sun (cover it, or sunscreen once fully healed) for at least a year.";
const DIET_HP = "High-protein, high-calorie diet — eggs, milk, pulses, paneer, meat or fish — to help the wounds heal.";

const BURN_CLERKING =
  "Time, place and agent of the burn (flame / scald / chemical / electrical / contact); closed-space exposure, smoke inhalation, hoarseness, stridor, soot in the mouth; first aid given (cool running water, duration); how it happened, and whether the history fits the injury; tetanus status; comorbidities. Examination: airway and breathing first; TBSA by Lund-Browder with depth per area; circumferential burns and distal circulation; face, hands, perineum and joints involved; associated injuries; weight. Baseline: CBC, electrolytes, renal function, blood glucose, urine output chart, [ carboxyhaemoglobin / ABG if inhalation suspected ], wound swab.";

export const BURNS_PLASTIC_SURGERY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "burns_plastic_surgery_generic",
  label: "Burns & Plastic Surgery — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient was admitted with [ presenting problem ] for [ wound management / reconstruction / procedure ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure(s) during this admission — debridement, graft, flap, repair ]",
      anaesthesia: "[ General / regional / local ] anaesthesia",
      findings: "[ wound size and site; tissue involved; cover used; donor site ]",
      drains: "[ nil / suction drain ]",
      complications: "Nil",
      outcome: "[ Outcome — graft take / flap status at discharge ]",
    },
    clinicalCourse:
      "Admitted on [ date ] with [ presentation ]. [ Procedure(s) and dates. ] [ Graft take / flap status; dressings; complications if any. ] The patient is afebrile, comfortable on oral analgesia and fit for discharge on [ date ] with the plan below.",
    medications: [M.paracetamol, M.pantoprazole],
    advice: adv([
      { module: "Wound care", text: "Keep the dressing clean and dry; do not open it at home unless told to." },
      { module: "Diet", text: DIET_HP },
      { module: "Medicines", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor." },
    ]),
    redFlags: [...RF_WOUND, ...RF_GRAFT],
    patientActions: [OPD_DRESSING, "Bring this summary to every visit."],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint, mechanism and duration of the wound or deformity; previous treatment and operations; smoking, diabetes, nutrition and other factors that delay healing; tetanus status; examination of the wound (site, size, depth, exposed structures, infection) and the function it affects; baseline CBC, glucose, albumin, wound swab.",
  progressNote:
    "Each day — pain; temperature; dressing (soakage, smell); graft or flap status; donor site; nutrition; physiotherapy. For discharge — afebrile, wound or graft stable, dressing plan and next dressing date written down.",
};

export const BURNS_PLASTIC_SURGERY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Post-burn contracture release (checked before the burn-graft template) ----
  {
    key: "burn_contracture_release",
    label: "Post-burn contracture release with graft / flap",
    match: /contracture/i,
    scaffold: {
      indication: "Patient was admitted with a post-burn contracture of the [ neck / axilla / elbow / hand / knee / … ] limiting [ movement / function ], for contracture release and cover.",
      primaryDiagnosis: "Post-burn contracture [ site ] — [ grade / degree of restriction ]",
      procedure: {
        name: "Contracture release [ site ] with [ split-skin graft / full-thickness graft / local flap (Z-plasty / transposition) ]",
        anaesthesia: "[ General / regional ] anaesthesia",
        findings: "[ band / sheet contracture; range before and after release; raw area size; structures exposed; donor site ]",
        drains: "[ nil ]",
        complications: "Nil",
        outcome: "Contracture released; [ graft take __% / flap healthy ] at the first dressing.",
      },
      clinicalCourse:
        "Underwent release of the [ site ] contracture with [ cover ] on [ date ]. The part was splinted in the position of release. The first dressing on POD [ __ ] showed [ graft take __% / a healthy flap ]. The donor site is [ healing / healed ]. Physiotherapy was started on POD [ __ ]. The patient is afebrile and comfortable at discharge with the splint in place.",
      medications: [M.paracetamol, M.diclofenac, M.pantoprazole, M.cetirizine, M.emollient],
      advice: adv([
        { module: "Wound care", text: "Keep the dressing clean and dry until the next dressing. Keep the donor-site dressing on until it falls off on its own." },
        { module: "Splint", text: "Wear the splint as taught — [ at all times / at night ] — to hold the release; remove only for exercises." },
        { module: "Physiotherapy", text: "Do the stretching exercises taught on the ward several times a day once the graft is stable. The contracture comes back if the stretching stops." },
        { module: "Scar care", text: SCAR_CARE },
        { module: "Pressure garment", text: PRESSURE_GARMENT },
      ]),
      redFlags: [...RF_WOUND, ...RF_GRAFT, "Numbness, colour change or severe pain beyond the splint"],
      patientActions: [OPD_DRESSING, "Attend physiotherapy on [ … ].", "Keep wearing the splint and pressure garment for as long as advised."],
      primaryCareActions: ["Reinforce splint and exercise adherence; refer back early if the range is being lost."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Original burn — date, agent, treatment, whether grafted; functional loss (daily activities, work); progression of the contracture; previous releases. Examination: site, type (band / sheet), range of movement, skin quality around it, joint and tendon status beneath, possible donor sites. Baseline: CBC, glucose, pre-anaesthetic workup; X-ray of the joint if long-standing.",
    progressNote:
      "Each day — pain; temperature; splint position; limb perfusion distal to the release. First dressing — graft take / flap colour; donor site. Then — physiotherapy started and range achieved. For discharge — graft or flap stable, splint fitted, exercise and garment plan taught.",
  },

  // ---- Electrical burns ----
  {
    key: "electrical_burns",
    label: "Electrical burns",
    match: /electric(al)?[^.]{0,20}(burn|injury|contact)|electrocution|high[- ]voltage|low[- ]voltage|lightning/i,
    scaffold: {
      indication: "Patient was admitted with [ high / low ]-voltage electrical burns [ entry __ / exit __ ], [ __% TBSA ], for monitoring, wound management and [ debridement / fasciotomy / cover ].",
      primaryDiagnosis: "[ High / low ]-voltage electrical burns — [ __% TBSA; sites; depth ] [ ± fasciotomy / amputation ]",
      procedure: {
        name: "[ Fasciotomy / serial debridement / split-skin grafting / flap cover / amputation ] — [ dates ]",
        anaesthesia: "[ General / regional ] anaesthesia",
        findings: "[ entry and exit wounds; deep muscle necrosis; exposed tendon / bone / vessels; compartments ]",
        drains: "[ nil ]",
        complications: "[ Nil / rhabdomyolysis / acute kidney injury / arrhythmia — as occurred ]",
        outcome: "[ Wounds covered / healing; limb status ]",
      },
      clinicalCourse:
        "Admitted on [ date ] after [ mechanism ]. ECG on admission [ … ]; cardiac monitoring for [ __ ] hours [ uneventful ]. Urine was monitored for myoglobinuria; renal function [ remained normal / recovered ]. Underwent [ procedures with dates ]. [ Graft take / flap status. ] The patient is afebrile, the wounds are [ healed / healing ] and the patient is fit for discharge.",
      medications: [M.paracetamol, M.tramadolSos, M.pantoprazole, M.cetirizine, M.ssd, M.emollient, M.multivit, M.protein],
      advice: adv([
        { module: "Wound care", text: "Keep the dressings clean and dry; dressings as advised at the OPD." },
        { module: "Physiotherapy", text: "Keep moving the joints of the affected limb as taught, many times a day." },
        { module: "Diet", text: DIET_HP },
        { module: "Scar care", text: SCAR_CARE },
        { module: "Eye and nerve checks", text: "Electrical injury can cause cataract or nerve problems weeks to months later — report any blurring of vision, weakness or numbness." },
        { module: "Safety", text: "Do not work near live wires until cleared; follow electrical safety at home and work." },
      ]),
      redFlags: [...RF_WOUND, ...RF_GRAFT, "Palpitations, chest pain or fainting", "Dark or cola-coloured urine, or passing much less urine", "New weakness, numbness or blurred vision"],
      patientActions: [OPD_DRESSING, "Get an eye check on [ … ] (cataract screening).", "Attend physiotherapy on [ … ]."],
      primaryCareActions: ["Watch for delayed cataract and peripheral neuropathy; refer back if found."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      BURN_CLERKING +
      " Electrical-specific: voltage (high / low), AC / DC, duration of contact, fall from height, loss of consciousness, entry and exit points; ECG, CK and urine myoglobin; compartments of every limb in the current path; spine and head for a fall.",
    progressNote:
      "Each day — cardiac rhythm (first 24 h); urine output and colour; CK and renal function trend; compartments and distal pulses; wounds; temperature. For discharge — wounds covered or healing, renal function normal, physiotherapy plan and eye review arranged.",
  },

  // ---- Burns with tangential excision and grafting ----
  {
    key: "burns_excision_ssg",
    label: "Burns — tangential excision and split-skin grafting",
    match: /(tangential|early) excision|burn[^.]*(graft|\bSSG\b|\bSTSG\b)|(graft|\bSSG\b|\bSTSG\b)[^.]*burn/i,
    scaffold: {
      indication: "Patient was admitted with [ flame / scald / chemical / contact ] burns, [ __% TBSA, deep partial / full thickness ], for resuscitation, excision and grafting.",
      primaryDiagnosis: "[ Agent ] burns [ __% TBSA; deep partial / full thickness; sites ]",
      procedure: {
        name: "Tangential excision and split-skin grafting [ sites ] — [ dates ]",
        anaesthesia: "General anaesthesia",
        findings: "[ area excised; bed quality; graft meshed / sheet; donor site(s) ]",
        drains: "[ nil ]",
        complications: "Nil",
        outcome: "[ Graft take __% ]; donor site [ healed / healing ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ __% TBSA ] burns; resuscitated with intravenous fluids to urine output. Underwent tangential excision and split-skin grafting on [ date(s) ]. The first graft inspection on POD [ __ ] showed [ __% take ]; [ residual raw areas were re-grafted / healing by dressings ]. Nutrition was supported with a high-protein diet. The patient is afebrile, ambulant, and fit for discharge with [ small residual raw areas __ / all areas healed ].",
      medications: [M.paracetamol, M.tramadolSos, M.pantoprazole, M.cetirizine, { ...M.ssd, indication: "on any residual raw areas" }, M.emollient, M.multivit, M.protein],
      advice: adv([
        { module: "Wound care", text: "Keep the graft dressing dry and undisturbed until the OPD. Keep the donor-site dressing on until it lifts off on its own; do not peel it." },
        { module: "Diet", text: DIET_HP },
        { module: "Physiotherapy", text: "Keep moving every joint near a graft as taught, to stop it tightening." },
        { module: "Scar care", text: SCAR_CARE },
        { module: "Pressure garment", text: PRESSURE_GARMENT },
      ]),
      redFlags: [...RF_WOUND, ...RF_GRAFT, "Blisters or breakdown on healed skin that do not heal"],
      patientActions: [OPD_DRESSING, "Get measured for a pressure garment on [ … ].", "Attend physiotherapy on [ … ]."],
      primaryCareActions: ["Support nutrition; check healed areas for breakdown and early contracture."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus: BURN_CLERKING,
    progressNote:
      "Each day — vitals and temperature; urine output (early phase); pain; dressing soakage and smell; nutrition and weight; physiotherapy. Graft inspection — take %, loss areas, donor site. For discharge — graft stable, afebrile, eating well, dressing / garment / physiotherapy plan written down.",
  },

  // ---- Cleft lip / palate (infant — NO numeric doses) ----
  {
    key: "cleft_lip_palate",
    label: "Cleft lip / palate repair",
    match: /cleft|cheiloplasty|palatoplasty|palatorrhaphy/i,
    scaffold: {
      indication: "Child was admitted for primary repair of a [ unilateral / bilateral ] cleft [ lip / palate / lip and palate ].",
      primaryDiagnosis: "[ Unilateral / bilateral ] cleft [ lip / palate / lip and palate ] — [ complete / incomplete ]",
      procedure: {
        name: "[ Cheiloplasty (technique __) / palatoplasty (technique __) ]",
        anaesthesia: "General anaesthesia",
        findings: "[ width of the cleft; nasal deformity; palatal repair details ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Repair completed; suture line intact at discharge.",
      },
      clinicalCourse:
        "Underwent [ procedure ] on [ date ]. Feeding was resumed [ by spoon / cup / as advised ] on [ POD __ ]. The suture line is intact and clean, the child is feeding well, afebrile and passing urine at discharge. Weight at discharge [ … ].",
      medications: [
        { generic: "Paracetamol syrup", dose: "[ weight-based dose as charted ]", route: "PO", frequency: "[ as charted ]", duration: "[ … ] days", indication: "pain or fever", status: "new" },
        { generic: "Amoxicillin-clavulanate syrup", dose: "[ weight-based dose as charted ]", route: "PO", frequency: "[ as charted ]", duration: "[ … ] days", indication: "if prescribed", status: "new" },
      ],
      advice: adv([
        { module: "Feeding", text: "Feed [ with a spoon / cup / as shown on the ward ]; do not use a bottle or let the child suck on anything hard until the doctor allows. Give a few sips of clean water after each feed to keep the repair clean." },
        { module: "Wound care", text: "Keep the lip suture line clean by gently wiping away dried milk and blood with a clean wet cotton swab. Do not let the child rub or pull at the lip; use arm splints if given." },
        { module: "Activity restrictions", text: "No toys, spoons or fingers in the mouth. Keep the child away from others with colds and coughs." },
        { module: "Speech and follow-up", text: "Cleft care goes on for years — hearing, teeth and speech checks are part of it. Keep every appointment." },
      ]),
      redFlags: [
        "Fever",
        "Bleeding from the lip, mouth or nose",
        "The repair opening up",
        "Not feeding, or much fewer wet nappies than usual",
        "Noisy breathing, breathing difficulty, or unusual sleepiness",
      ],
      patientActions: ["Attend the Plastic Surgery OPD on [ … ] for a wound check [ and suture removal ].", "Attend the speech / ENT / dental review on [ … ].", "Bring this summary to every visit."],
      primaryCareActions: ["Monitor weight gain and feeding; check hearing and speech milestones; support the cleft-team follow-up."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Type of cleft; feeding method and difficulty, weight gain and growth chart; nasal regurgitation; ear infections; associated anomalies and syndromes (heart, limbs); birth and antenatal history; family history of clefts; immunisation status. Examination: cleft extent, nasal deformity, alveolus, palate; chest and heart; weight. Baseline: CBC, pre-anaesthetic checks per the anaesthetist; echo if a murmur.",
    progressNote:
      "Each day — airway and breathing; bleeding; feeding and intake; wet nappies; temperature; suture line; arm splints. For discharge — feeding well, afebrile, suture line intact, parents confident with feeding and lip care.",
  },

  // ---- Hand injury — tendon / nerve repair ----
  {
    key: "hand_tendon_nerve_repair",
    label: "Hand injury — tendon / nerve repair",
    match: /tendon|nerve repair|neurorrhaphy|tenorrhaphy|flexor|extensor|hand injury|digital nerve|finger (injury|laceration)|replant/i,
    scaffold: {
      indication: "Patient was admitted with a [ cut / crush ] injury to the [ right / left ] [ hand / wrist / finger ] with [ tendon / nerve / vessel ] injury, for exploration and repair.",
      primaryDiagnosis: "[ Right / left ] [ hand / wrist ] injury — [ tendons / nerves / vessels injured; zone ]",
      procedure: {
        name: "Wound exploration and repair of [ tendons __ / nerves __ / vessels __ ]",
        anaesthesia: "[ Regional (brachial plexus block) / general ] anaesthesia",
        findings: "[ structures cut and their level / zone; repair technique; associated fracture ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Repair completed; hand placed in a [ dorsal blocking / other ] splint.",
      },
      clinicalCourse:
        "Underwent exploration and repair of [ structures ] on [ date ]. The hand was elevated and splinted in [ position ]. Circulation of the fingers remained good. The wound is clean. Hand therapy was started on POD [ __ ] with [ protocol ]. The patient is comfortable and fit for discharge with the splint in place.",
      medications: [M.paracetamol, M.diclofenac, M.pantoprazole, { ...M.amoxClav, indication: "open / contaminated wound" }],
      advice: adv([
        { module: "Splint", text: "Keep the splint on at all times, day and night, for [ … ] weeks. Do not remove it or use the hand to grip or lift anything." },
        { module: "Elevation", text: "Keep the hand raised above the heart level (on pillows, or in a sling when walking) for the first week." },
        { module: "Hand therapy", text: "Do only the exercises the therapist taught, exactly as taught. Using the hand too early can snap the repair." },
        { module: "Wound care", text: "Keep the dressing clean and dry." },
        { module: "Nerve recovery", text: "Feeling returns slowly, over months. Protect numb fingers from burns and cuts." },
      ]),
      redFlags: [...RF_WOUND, "A finger turning pale, blue or cold", "Sudden loss of finger movement or a snapping feeling", "Severe pain not relieved by the medicines"],
      patientActions: ["Attend the Plastic Surgery OPD on [ … ] for a wound check.", "Attend hand therapy on [ … ] and at every scheduled session.", "Attend for suture removal on postoperative day 10–14."],
      primaryCareActions: ["Check adherence to the splint; refer back urgently if movement is suddenly lost."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Time and mechanism (sharp / crush / glass / machine); hand dominance and occupation; tetanus status; first aid. Examination: posture of the fingers (cascade); FDS and FDP of each finger; extensors; two-point discrimination on each digital nerve; capillary refill of each finger; associated fracture. Baseline: X-ray of the hand; CBC; pre-anaesthetic workup.",
    progressNote:
      "Each day — capillary refill of every finger; pain; splint position; elevation; dressing; temperature. For discharge — perfusion good, splint correct, therapy protocol taught and first session booked.",
  },

  // ---- Pressure sore debridement and flap ----
  {
    key: "pressure_sore_flap",
    label: "Pressure sore — debridement and flap",
    match: /pressure (sore|ulcer|injury)|bed ?sore|decubitus|(sacral|ischial|trochanteric) (sore|ulcer)/i,
    scaffold: {
      indication: "Patient was admitted with a [ grade __ ] [ sacral / ischial / trochanteric ] pressure sore, [ background: paraplegia / immobility ], for debridement and flap cover.",
      primaryDiagnosis: "[ Grade __ ] [ site ] pressure sore [ ± osteomyelitis ] in a patient with [ underlying condition ]",
      procedure: {
        name: "Debridement [ ± ostectomy ] and [ rotation / advancement / myocutaneous ] flap cover of the [ site ] sore",
        anaesthesia: "[ General / spinal ] anaesthesia",
        findings: "[ sore size and depth; bone involvement; bursa; flap used ]",
        drains: "[ suction drain ]",
        complications: "Nil",
        outcome: "Flap healthy at discharge; [ drain removed on POD __ ].",
      },
      clinicalCourse:
        "Underwent debridement and [ flap ] cover on [ date ] after optimising nutrition [ and treating infection per culture ]. The patient was nursed off the flap with two-hourly turning. The flap has remained healthy; [ the drain was removed on POD __ ]. [ Bowel and bladder care as per the background condition. ] The patient is afebrile and fit for discharge.",
      medications: [
        M.paracetamol,
        M.pantoprazole,
        M.lactulose,
        M.multivit,
        M.protein,
        { generic: "[ Antibiotic as per culture ]", dose: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "if osteomyelitis / infection was treated", status: "new" },
      ],
      advice: adv([
        { module: "Pressure care", text: "Do not lie or sit on the flap for [ … ] weeks. Turn every 2 hours, day and night. Use an air / water mattress. Sitting is built up slowly, only as the doctor advises." },
        { module: "Skin checks", text: "Check all pressure points (back, hips, heels) every day for redness; if redness does not fade within 30 minutes of taking pressure off, report it." },
        { module: "Bowel and bladder care", text: "Keep the area clean and dry; change soiled pads at once; catheter / bowel routine as taught." },
        { module: "Diet", text: DIET_HP },
      ]),
      redFlags: [...RF_WOUND, ...RF_GRAFT, "The wound opening up, or fluid collecting under the flap", "A new red or dark patch over any bony point"],
      patientActions: ["Attend the Plastic Surgery OPD on [ … ].", "Attend for suture removal on postoperative day 14–21.", "Arrange an air / water mattress before going home."],
      primaryCareActions: ["Home-nursing support for turning and skin checks; manage continence; treat spasticity; nutrition support."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Cause of immobility (spinal injury, stroke, frailty); duration of the sore; previous sores and flaps; continence and catheter; spasticity and contractures; nutrition and weight; home support and mattress. Examination: site, size, grade, undermining, bone exposure, discharge; all other pressure points; neurological level. Baseline: CBC, albumin, glucose, wound swab, X-ray / MRI of the underlying bone if osteomyelitis suspected.",
    progressNote:
      "Each day — flap colour, capillary refill and swelling; drain output; turning chart; other pressure points; continence; temperature; nutrition. For discharge — flap healthy, drain out, caregivers trained in turning and skin checks, mattress arranged.",
  },

  // ---- Flap cover for a wound ----
  {
    key: "flap_cover",
    label: "Flap cover for a wound (local / regional)",
    match: /\bflap\b|soft[- ]tissue cover|wound cover|raw area|exposed (bone|tendon|implant)/i,
    scaffold: {
      indication: "Patient was admitted with a wound over the [ site ] with [ exposed bone / tendon / implant ] after [ trauma / infection / excision ], for debridement and flap cover.",
      primaryDiagnosis: "[ Site ] wound with [ exposed structure ] — [ cause ]",
      procedure: {
        name: "Debridement and [ local / regional ] flap cover [ flap name ] [ + SSG to the donor site ]",
        anaesthesia: "[ General / regional ] anaesthesia",
        findings: "[ defect size; structures exposed; flap used and its pedicle; donor site closure ]",
        drains: "[ nil / suction drain ]",
        complications: "Nil",
        outcome: "Flap healthy at discharge.",
      },
      clinicalCourse:
        "Underwent debridement and [ flap ] cover of the [ site ] wound on [ date ]. Flap monitoring showed [ good colour and capillary refill throughout ]. [ Donor-site graft take __%. ] The limb was elevated and [ splinted ]. The patient is afebrile and comfortable and fit for discharge.",
      medications: [M.paracetamol, M.diclofenac, M.pantoprazole, { ...M.amoxClav, indication: "if indicated" }, M.multivit],
      advice: adv([
        { module: "Flap care", text: "Do not press on, lie on, or wrap anything tight around the flap. Keep the part raised as taught." },
        { module: "Wound care", text: "Keep the dressings clean and dry until the next OPD visit." },
        { module: "Activity restrictions", text: "No smoking — it can kill the flap." },
        { module: "Diet", text: DIET_HP },
      ]),
      redFlags: [...RF_WOUND, ...RF_GRAFT, "The flap becoming pale and cold, or swollen and purple"],
      patientActions: ["Attend the Plastic Surgery OPD on [ … ].", "Attend for suture removal on postoperative day 10–14."],
      primaryCareActions: ["Smoking cessation; diabetes control if diabetic."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Cause and age of the wound; previous debridements and fixation; smoking, diabetes, peripheral vascular disease; tetanus status. Examination: site, size, exposed structures, infection, surrounding skin, distal pulses and sensation, candidate flaps and donor sites. Baseline: CBC, glucose, wound swab; X-ray of underlying bone / implant; Doppler if the flap depends on a named vessel.",
    progressNote:
      "Each day — flap colour, temperature, capillary refill, turgor; drain; limb elevation; donor site; temperature. For discharge — flap healthy, donor site settled, flap-protection advice given.",
  },

  // ---- Burns managed with dressings (last: plain "burn") ----
  {
    key: "burns_dressings",
    label: "Burns — managed with dressings (superficial / partial thickness)",
    match: /burn|scald|flame injury/i,
    scaffold: {
      indication: "Patient was admitted with [ flame / scald / chemical / contact ] burns, [ __% TBSA, superficial / superficial partial thickness ], for fluid management, pain control and dressings.",
      primaryDiagnosis: "[ Agent ] burns [ __% TBSA; superficial / partial thickness; sites ]",
      procedure: {
        name: "[ Nil / serial dressings under sedation ]",
        anaesthesia: "",
        findings: "[ burn areas and depth on re-assessment ]",
        drains: "Nil",
        complications: "Nil",
        outcome: "Burns [ healed / healing ] by dressings.",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ __% TBSA ] burns; [ resuscitated with intravenous fluids to urine output / managed with oral fluids ]. Managed with [ dressing agent ] dressings every [ … ] days. The burns [ healed by day __ / are healing with small residual areas __ ]. The patient is afebrile, eating well and fit for discharge.",
      medications: [M.paracetamol, M.pantoprazole, M.cetirizine, { ...M.ssd, indication: "on the remaining raw areas" }, M.emollient, M.multivit],
      advice: adv([
        { module: "Wound care", text: "Keep the dressings clean and dry. Do not apply toothpaste, oil, ghee, ink or home remedies on burns." },
        { module: "Scar care", text: SCAR_CARE },
        { module: "Diet", text: DIET_HP },
        { module: "Physiotherapy", text: "Keep moving the joints near the burns as taught." },
        { module: "Burn prevention", text: "At home: keep children away from the kitchen and hot liquids; cook with the stove at waist height; wear close-fitting cotton clothes near fire." },
      ]),
      redFlags: RF_WOUND,
      patientActions: [OPD_DRESSING, "Keep the healed skin moisturised and out of the sun."],
      primaryCareActions: ["Check that the burns heal within 2–3 weeks; refer back if not (may need grafting)."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus: BURN_CLERKING,
    progressNote:
      "Each day — vitals; urine output (early phase); pain; oral intake; dressing soakage and smell; re-assessment of depth; temperature. For discharge — afebrile, eating, burns healed or healing, dressing plan and next dressing date written down.",
  },
];
