import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * DERMATOLOGY discharge templates. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Same rule as lib/discharge-templates.ts: what is written here prints as written unless the
 * resident changes it; a genuinely patient-specific blank is `[ … ]` and prints as a visible
 * blank, never as a guess.
 *
 * Medication lines are a STARTING SET to be checked against each patient — allergy, weight,
 * renal and liver function, what they were already taking. Standard adult regimens are filled
 * in (topicals, emollients, antihistamines, standard antibiotic / antiviral courses). Doses that
 * are titrated per patient — systemic steroid tapers, azathioprine, methotrexate, cyclosporine,
 * leprosy MDT — are left as `[ … ]` on purpose.
 *
 * Non-operative: the `procedure` block is mostly blank. Ordered specific before general (first
 * match wins, lib/specialty/discharge.ts): SJS/TEN before other drug reactions, erythroderma
 * before psoriasis.
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

const M = {
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain or fever", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "while on steroids", status: "new" } as TemplateMedication,
  cetirizine: { generic: "Cetirizine", strength: "10 mg", route: "PO", frequency: "HS", duration: "14 days", indication: "itching", status: "new" } as TemplateMedication,
  hydroxyzine: { generic: "Hydroxyzine", strength: "25 mg", route: "PO", frequency: "HS", duration: "14 days", indication: "itching; causes drowsiness", status: "new" } as TemplateMedication,
  emollient: { generic: "White soft paraffin / liquid paraffin emollient", route: "topical", frequency: "TDS and after bathing", duration: "long term", indication: "all over the skin", status: "new" } as TemplateMedication,
  calciumD3: { generic: "Calcium carbonate + vitamin D3", strength: "500 mg / 250 IU", route: "PO", frequency: "BD after food", duration: "while on steroids", status: "new" } as TemplateMedication,
  prednisolone: { generic: "Prednisolone", dose: "[ … ]", route: "PO", frequency: "[ as per taper ]", duration: "[ taper schedule written below ]", indication: "do not stop suddenly", status: "new" } as TemplateMedication,
  mometasone: { generic: "Mometasone furoate 0.1% cream", route: "topical", frequency: "OD", duration: "2 weeks, then review", indication: "on the body; not on the face or skin folds", status: "new" } as TemplateMedication,
  clobetasol: { generic: "Clobetasol propionate 0.05% cream", route: "topical", frequency: "BD", duration: "2 weeks, then taper as advised", indication: "on the affected skin only; not on the face or skin folds", status: "new" } as TemplateMedication,
  lubricantEye: { generic: "Carboxymethylcellulose 0.5% eye drops", dose: "1 drop each eye", route: "topical (eye)", frequency: "QID", duration: "[ … ]", indication: "dry eyes", status: "new" } as TemplateMedication,
  mouthwash: { generic: "Chlorhexidine 0.2% mouthwash", dose: "10 ml", route: "gargle", frequency: "BD", duration: "14 days", indication: "mouth ulcers", status: "new" } as TemplateMedication,
  fusidic: { generic: "Fusidic acid 2% cream", route: "topical", frequency: "BD", duration: "7 days", indication: "on raw / crusted areas", status: "new" } as TemplateMedication,
};

const culprit: TemplateMedication = {
  generic: "[ Suspected culprit drug ]",
  indication: "never take again — it has been written on the drug-allergy card",
  status: "stopped",
};

const RF_SKIN = [
  "Fever, or feeling hot and shivery",
  "New blisters, or the rash spreading again",
  "Skin that is weeping pus or smells bad",
];
const RF_STEROID = ["Black stools, vomiting blood, or severe stomach pain (while on steroids)"];

const ALLERGY_CARD =
  "Carry the drug-allergy card always and show it to every doctor, chemist and dentist. Do not take any medicine, including over-the-counter, herbal or native remedies, without telling them about this reaction. Close blood relatives should also avoid the drug.";
const STEROID_ADVICE =
  "Take the steroid tablets in the morning after food, exactly as per the taper. Never stop them suddenly. Bring the tablets to every visit.";
const DERM_OPD = "Attend the Dermatology OPD on [ … ] with all reports.";

export const DERMATOLOGY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "dermatology_generic",
  label: "Dermatology — generic template",
  match: /.^/,
  scaffold: {
    indication: "Patient was admitted with [ presenting skin problem ] for [ evaluation / inpatient management ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Skin biopsy / other bedside procedure, if any ]",
      anaesthesia: "",
      findings: "[ biopsy / immunofluorescence / culture results ]",
      drains: "",
      complications: "Nil",
      outcome: "[ Outcome of this admission ]",
    },
    clinicalCourse:
      "Admitted on [ date ] with [ presentation ]. [ Working diagnosis and how it was reached. ] [ Treatment given. ] The skin lesions [ improved / healed ]; the patient is afebrile, eating and fit for discharge on [ date ] with the plan below.",
    medications: [M.emollient, M.cetirizine],
    advice: adv([
      { module: "Skin care", text: "Bathe with lukewarm water and a mild soap; pat dry; apply the moisturiser immediately after bathing." },
      { module: "Medicines", text: "Apply the creams only where advised and for as long as advised. Do not buy steroid creams over the counter." },
      { module: "Follow-up", text: DERM_OPD },
    ]),
    redFlags: RF_SKIN,
    patientActions: [DERM_OPD, "Bring this summary and all reports to every visit."],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Onset, site of first lesion, spread and evolution; itch, pain, fever; mucosal (eyes, mouth, genitals) involvement; all drugs in the last 8 weeks including native medicines; past skin disease; atopy; contacts. Examination: morphology and distribution, percentage of body surface involved, mucosae, nails, hair, lymph nodes; vitals. Baseline: CBC, renal and liver function, glucose; biopsy / scraping / swab as indicated.",
  progressNote:
    "Each day — new lesions; healing of old; mucosae; itch; temperature; intake; drug side-effects. For discharge — no new lesions, afebrile, eating, taper and topical plan written down.",
};

export const DERMATOLOGY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- SJS / TEN ----
  {
    key: "sjs_ten",
    label: "Stevens–Johnson syndrome / TEN",
    match: /\bSJS\b|stevens[- ]johnson|toxic epidermal necrolysis|lyell/i, // bare "TEN" left out: /i would match the word "ten"
    scaffold: {
      indication: "Patient was admitted with an acute blistering mucocutaneous drug reaction [ __% BSA detachment ] after [ suspected culprit drug ], for supportive care.",
      primaryDiagnosis: "[ Stevens–Johnson syndrome / SJS–TEN overlap / toxic epidermal necrolysis ] — [ __% BSA; SCORTEN __ ]; suspected culprit [ … ]",
      procedure: {
        name: "Nil",
        anaesthesia: "",
        findings: "[ skin biopsy, if done; ophthalmology findings ]",
        drains: "",
        complications: "[ Nil / infection / ocular involvement — as occurred ]",
        outcome: "Re-epithelialised [ fully / except __ ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ __ ] days after starting [ culprit drug ], which was stopped on admission. Managed with barrier nursing, fluid and nutritional support, non-adherent dressings, eye and mouth care [ and cyclosporine / systemic steroid / IVIG — as given ]. Ophthalmology reviewed on [ … ]. Re-epithelialisation was [ complete / near-complete ] by day [ __ ]. The patient is afebrile, eating and fit for discharge.",
      medications: [
        culprit,
        { generic: "Cyclosporine", dose: "[ … ]", route: "PO", frequency: "[ as per ward chart ]", duration: "[ … ]", indication: "if started in the ward", status: "new" },
        { ...M.prednisolone, indication: "if started in the ward; do not stop suddenly" },
        M.emollient,
        M.lubricantEye,
        M.mouthwash,
        M.cetirizine,
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Drug allergy", text: ALLERGY_CARD },
        { module: "Skin care", text: "Moisturise the new skin often; avoid the sun; darker or lighter patches fade slowly over months." },
        { module: "Eye care", text: "Use the eye drops as prescribed. Do not rub the eyes. The eye doctor must see you even if the eyes feel fine." },
        { module: "Mouth care", text: "Soft, bland food; use the mouthwash; avoid spicy and very hot food until the mouth heals." },
      ]),
      redFlags: [...RF_SKIN, "Eye pain, redness, sticky eyes or blurred vision", "Not able to eat or drink because of mouth pain", "Pain or difficulty passing urine"],
      patientActions: [DERM_OPD, "Attend the Ophthalmology OPD on [ … ].", "Carry the drug-allergy card always."],
      primaryCareActions: ["Record the culprit drug as an allergy in every record; watch for late eye, genital and nail complications."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Every drug in the last 8 weeks with start dates (anticonvulsants, allopurinol, sulfonamides, NSAIDs, nevirapine, antibiotics, native medicines); prodrome; timeline of rash and mucosal involvement; eyes, mouth, genitals; previous reactions. Examination: % body surface with detachment, Nikolsky sign, target lesions, all mucosae, vitals. Baseline: CBC, renal and liver function, glucose, bicarbonate, electrolytes (SCORTEN), blood and skin cultures; biopsy; ophthalmology review on day 1.",
    progressNote:
      "Each day — new detachment; re-epithelialisation; eyes (ophthalmology), mouth, genitals; fluid balance and intake; temperature; cultures; SCORTEN day 3. For discharge — re-epithelialised, eating, culprit drug on the allergy card, eye follow-up booked.",
  },

  // ---- DRESS / other severe drug reaction ----
  {
    key: "drug_reaction_dress",
    label: "Severe cutaneous drug reaction / DRESS",
    match: /\bDRESS\b|drug (reaction|rash|eruption|hypersensitivity)|drug[- ]induced|adverse cutaneous|\bAGEP\b|exanthematous pustulosis/i,
    scaffold: {
      indication: "Patient was admitted with a [ widespread rash / fever / facial swelling / organ involvement ] after [ suspected culprit drug ], for evaluation and management of a severe drug reaction.",
      primaryDiagnosis: "[ DRESS (RegiSCAR __) / AGEP / severe maculopapular drug eruption ] — suspected culprit [ … ]; organs involved [ … ]",
      procedure: {
        name: "Nil",
        anaesthesia: "",
        findings: "[ eosinophil count; atypical lymphocytes; liver / renal involvement; biopsy ]",
        drains: "",
        complications: "Nil",
        outcome: "Rash settling; organ function [ normalised / improving ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ __ ] weeks after starting [ culprit drug ], which was stopped. [ Eosinophilia / transaminitis / renal involvement ] noted. Treated with [ systemic steroids / topical steroids and supportive care ]. Fever settled on day [ __ ]; liver [ and renal ] function [ improving ]. Fit for discharge on a steroid taper with blood tests planned.",
      medications: [culprit, M.prednisolone, M.pantoprazole, M.calciumD3, M.mometasone, M.emollient, M.cetirizine],
      advice: adv([
        { module: "Drug allergy", text: ALLERGY_CARD },
        { module: "Steroid tablets", text: STEROID_ADVICE },
        { module: "Blood tests", text: "The reaction can flare again for weeks as the steroid is reduced. Get the blood tests done on time." },
      ]),
      redFlags: [...RF_SKIN, "Yellow eyes, dark urine, or passing much less urine", "Face swelling returning", ...RF_STEROID],
      patientActions: [DERM_OPD, "Get CBC, liver and renal function repeated on [ … ].", "Carry the drug-allergy card always.", "[ Thyroid function at 3 months, if DRESS. ]"],
      primaryCareActions: ["Record the culprit as an allergy; watch for late thyroid disease and diabetes after DRESS."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "All drugs in the last 8 weeks with dates (anticonvulsants, allopurinol, dapsone, sulfonamides, antitubercular drugs, vancomycin); fever; facial swelling; lymph nodes; jaundice, urine output, breathlessness. Examination: rash type and extent, facial oedema, pustules, mucosae, nodes, liver. Baseline: CBC with eosinophils and smear, liver and renal function, urine routine, CRP; RegiSCAR scoring.",
    progressNote:
      "Each day — fever; rash; facial oedema; eosinophil count; liver and renal function trend; steroid dose. For discharge — afebrile, labs improving, taper and test dates written down.",
  },

  // ---- Pemphigus vulgaris ----
  {
    key: "pemphigus_vulgaris",
    label: "Pemphigus vulgaris",
    match: /pemphigus/i,
    scaffold: {
      indication: "Patient was admitted with [ new / relapsed ] pemphigus vulgaris with [ extensive skin erosions / oral erosions limiting intake ], for disease control.",
      primaryDiagnosis: "Pemphigus vulgaris [ mucocutaneous / mucosal ] — [ PDAI __ ]",
      procedure: {
        name: "[ Nil / skin biopsy with DIF / rituximab infusion — dates ]",
        anaesthesia: "",
        findings: "[ histology; DIF; anti-Dsg 1 / 3 titres ]",
        drains: "",
        complications: "Nil",
        outcome: "Disease [ controlled — no new blisters for __ days ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ]. Diagnosis [ confirmed by biopsy and DIF / known ]. Treated with [ systemic steroids / rituximab on __ / azathioprine / DP pulse ] with dressings of the erosions and mouth care. No new blisters since day [ __ ]; erosions [ healing ]. Eating well and fit for discharge.",
      medications: [
        M.prednisolone,
        { generic: "Azathioprine", dose: "[ … ]", route: "PO", frequency: "[ as titrated in ward ]", duration: "[ … ]", indication: "if started; after TPMT / baseline counts", status: "new" },
        M.pantoprazole,
        M.calciumD3,
        M.mouthwash,
        M.fusidic,
        M.emollient,
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Steroid tablets", text: STEROID_ADVICE },
        { module: "Infection precautions", text: "The treatment lowers resistance to infection. Avoid crowds and people with fever; report fever at once." },
        { module: "Skin care", text: "Handle the skin gently; do not burst blisters — the doctor will guide you on dressings." },
        { module: "Mouth care", text: "Soft, bland food; use the mouthwash; avoid spicy and very hot food." },
      ]),
      redFlags: [...RF_SKIN, "Mouth ulcers so painful you cannot eat or drink", ...RF_STEROID],
      patientActions: [DERM_OPD, "Get CBC, liver function and blood sugar on [ … ].", "Bring the steroid tablets to every visit."],
      primaryCareActions: ["Monitor blood sugar, BP and weight on steroids; check counts on azathioprine."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset in mouth or skin; spread; pain and intake; weight loss; previous treatment and steroid exposure; drugs (thiol drugs); diabetes, hypertension, TB, hepatitis. Examination: flaccid blisters and erosions, Nikolsky, % BSA, oral / genital / eye involvement, PDAI. Baseline: CBC, renal and liver function, glucose, HBsAg, anti-HCV, HIV, chest X-ray, TPMT if azathioprine planned; biopsy with DIF; anti-Dsg ELISA.",
    progressNote:
      "Each day — new blisters; healing of erosions; oral intake; temperature; glucose and BP on steroids; infection. For discharge — no new blisters, eating, taper and blood-test dates written down.",
  },

  // ---- Bullous pemphigoid ----
  {
    key: "bullous_pemphigoid",
    label: "Bullous pemphigoid",
    match: /pemphigoid/i,
    scaffold: {
      indication: "Patient was admitted with widespread tense blisters and itch, for evaluation and control of bullous pemphigoid.",
      primaryDiagnosis: "Bullous pemphigoid [ __% BSA ] [ suspected trigger: … ]",
      procedure: {
        name: "[ Nil / skin biopsy with DIF ]",
        anaesthesia: "",
        findings: "[ histology; DIF ]",
        drains: "",
        complications: "Nil",
        outcome: "No new blisters for [ __ ] days.",
      },
      clinicalCourse:
        "Admitted on [ date ] with tense blisters over [ sites ]. Diagnosis [ confirmed by biopsy and DIF ]. [ Possible trigger drug (e.g. gliptin) stopped. ] Treated with super-potent topical steroid [ ± doxycycline / systemic steroid ]. Blisters stopped by day [ __ ]; erosions healing. Fit for discharge.",
      medications: [
        { ...M.clobetasol, indication: "on the whole body except the face (unless also affected); the amount per day as the doctor showed" },
        { generic: "Doxycycline", strength: "100 mg", route: "PO", frequency: "BD after food", duration: "[ … ]", indication: "sit up for 30 minutes after taking it", status: "new" },
        { ...M.prednisolone, indication: "if started; do not stop suddenly" },
        M.emollient,
        M.cetirizine,
        M.calciumD3,
      ],
      advice: adv([
        { module: "Skin care", text: "Apply the steroid cream every day as shown, even on areas without blisters if advised. A family member may need to help." },
        { module: "Steroid tablets", text: STEROID_ADVICE },
        { module: "Falls", text: "Elderly patients: take care getting up; skin tears easily — pad bed rails and avoid tight clothing." },
      ]),
      redFlags: [...RF_SKIN, "Confusion, drowsiness or not eating (elderly)", ...RF_STEROID],
      patientActions: [DERM_OPD, "Get blood sugar and electrolytes checked on [ … ]."],
      primaryCareActions: ["Watch blood sugar and BP; review other drugs for triggers (gliptins, diuretics)."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Age; itch preceding blisters; drug history (gliptins, diuretics, antibiotics); neurological disease (stroke, dementia, Parkinson's); mobility and who helps at home. Examination: tense blisters on urticarial base, % BSA, mucosae; general condition. Baseline: CBC with eosinophils, renal and liver function, glucose; biopsy with DIF; BP180 / BP230 ELISA.",
    progressNote:
      "Each day — new blisters; healing; itch; temperature; intake; glucose and BP if on steroids; skin infection. For discharge — no new blisters, carer trained in topical application.",
  },

  // ---- Erythroderma (before psoriasis) ----
  {
    key: "erythroderma",
    label: "Erythroderma",
    match: /erythroderm|exfoliative dermatitis/i,
    scaffold: {
      indication: "Patient was admitted with generalised redness and scaling of the skin (> 90% BSA), for evaluation of the cause and supportive care.",
      primaryDiagnosis: "Erythroderma secondary to [ psoriasis / eczema / drug / idiopathic / … ]",
      procedure: {
        name: "[ Nil / skin biopsy ]",
        anaesthesia: "",
        findings: "[ biopsy; underlying cause ]",
        drains: "",
        complications: "[ Nil / hypoalbuminaemia / infection ]",
        outcome: "Erythema and scaling [ settling ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with erythroderma. Cause identified as [ … ] [ culprit drug stopped ]. Managed with emollients, wet wraps, mid-potency topical steroids, temperature and fluid care, nutrition [ and methotrexate / cyclosporine / other ]. Erythema and scaling settled to [ __% ]. Afebrile and fit for discharge.",
      medications: [
        M.emollient,
        M.mometasone,
        M.hydroxyzine,
        { generic: "[ Methotrexate / cyclosporine / other, for the underlying cause ]", dose: "[ … ]", route: "PO", frequency: "[ as titrated in ward ]", duration: "[ … ]", indication: "if started", status: "new" },
        { generic: "Folic acid", strength: "5 mg", route: "PO", frequency: "[ as per methotrexate schedule ]", indication: "only if on methotrexate", status: "new" },
      ],
      advice: adv([
        { module: "Skin care", text: "Apply the moisturiser generously and often — the skin loses water and heat. Keep warm but avoid overheating." },
        { module: "Diet", text: "High-protein diet; drink plenty of fluids." },
        { module: "Medicines", text: "Do not use any new medicine or native remedy without asking the doctor." },
      ]),
      redFlags: [...RF_SKIN, "Shivering or feeling very cold", "Swelling of the feet, breathlessness, or passing much less urine"],
      patientActions: [DERM_OPD, "Get CBC, albumin, renal and liver function repeated on [ … ]."],
      primaryCareActions: ["Watch for relapse and for infection; review drugs for a trigger."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Pre-existing skin disease (psoriasis, eczema); new drugs; abrupt steroid stop; fever, chills; weight loss, lymph nodes, night sweats (lymphoma); itch. Examination: % BSA, scaling, nails, hair, palms and soles, nodes, oedema, temperature. Baseline: CBC with smear (Sézary cells), albumin, electrolytes, renal and liver function; biopsy; HIV.",
    progressNote:
      "Each day — erythema and scaling %; temperature; fluid balance and weight; oedema; albumin; skin infection. For discharge — erythema settling, afebrile, cause and plan written down.",
  },

  // ---- Psoriasis flare ----
  {
    key: "psoriasis_flare",
    label: "Psoriasis flare",
    match: /psoria/i,
    scaffold: {
      indication: "Patient was admitted with a flare of [ plaque / pustular ] psoriasis [ __% BSA / PASI __ ], for control.",
      primaryDiagnosis: "[ Chronic plaque / generalised pustular ] psoriasis — flare [ PASI __ ] [ ± psoriatic arthritis ]",
      procedure: {
        name: "[ Nil / phototherapy sessions ]",
        anaesthesia: "",
        findings: "[ trigger identified ]",
        drains: "",
        complications: "Nil",
        outcome: "[ PASI __ at discharge ]",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ] [ trigger: … ]. Treated with emollients, topical steroid and keratolytic [ and methotrexate / cyclosporine / acitretin / phototherapy ]. Improved to [ PASI __ ]. Fit for discharge.",
      medications: [
        { generic: "Methotrexate", dose: "[ … ]", route: "PO", frequency: "ONCE A WEEK on [ day ]", duration: "[ … ]", indication: "weekly, not daily", status: "new" },
        { generic: "Folic acid", strength: "5 mg", route: "PO", frequency: "[ as per methotrexate schedule ]", indication: "not on the methotrexate day", status: "new" },
        { ...M.clobetasol, indication: "on the thick plaques only; not on the face or skin folds" },
        { generic: "Salicylic acid 3% + coal tar ointment", route: "topical", frequency: "HS", duration: "4 weeks", indication: "on thick scaly plaques", status: "new" },
        M.emollient,
        M.cetirizine,
      ],
      advice: adv([
        { module: "Methotrexate", text: "Take methotrexate only ONCE A WEEK on the fixed day. Taking it daily is dangerous. Avoid alcohol. Do not start any painkiller or antibiotic without telling the doctor." },
        { module: "Skin care", text: "Moisturise daily; do not pick scales; lukewarm baths." },
        { module: "Triggers", text: "Stop smoking and alcohol; keep weight and sugar under control; tell doctors you have psoriasis before any new medicine." },
      ]),
      redFlags: [...RF_SKIN, "Mouth ulcers, sore throat, or unusual bruising (methotrexate)", "Pus spots appearing all over with fever"],
      patientActions: [DERM_OPD, "Get CBC, liver and renal function on [ … ] (methotrexate monitoring)."],
      primaryCareActions: ["Screen for metabolic syndrome; monitor methotrexate bloods; avoid beta-blockers, lithium and systemic steroids where possible."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration and pattern of psoriasis; triggers (infection, drugs — beta-blockers, lithium, antimalarials; steroid withdrawal; stress; alcohol); previous systemic treatment and response; joint pain and morning stiffness; comorbidities (diabetes, hypertension, fatty liver). Examination: PASI / BSA, pustules, nails, scalp, joints. Baseline: CBC, liver and renal function, lipids, glucose, HBsAg, anti-HCV, HIV, chest X-ray (before systemic therapy).",
    progressNote:
      "Each day — PASI / extent; pustules; temperature; itch; bloods on systemic therapy. For discharge — improving, methotrexate day and blood-test dates written down.",
  },

  // ---- Leprosy with reaction ----
  {
    key: "leprosy_reaction",
    label: "Leprosy with reaction (type 1 / ENL)",
    match: /lepro|hansen|\bENL\b|lepra|erythema nodosum leprosum|type[- ]?(1|I) reaction|reversal reaction/i,
    scaffold: {
      indication: "Patient was admitted with [ type 1 (reversal) reaction / erythema nodosum leprosum ] in [ paucibacillary / multibacillary ] leprosy [ with neuritis ], for control of the reaction.",
      primaryDiagnosis: "[ BT / BB / BL / LL ] Hansen's disease — [ type 1 reaction / ENL ] [ with neuritis of __ nerve(s) ]; disability grade [ … ]",
      procedure: {
        name: "[ Nil / slit-skin smear / nerve biopsy ]",
        anaesthesia: "",
        findings: "[ BI / MI; nerve function assessment ]",
        drains: "",
        complications: "Nil",
        outcome: "Reaction [ settling ]; nerve function [ stable / improving ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ]. MDT [ continued / started on __ ]. Reaction treated with [ prednisolone / clofazimine / thalidomide / NSAIDs ] and rest of the affected limbs [ splints ]. Nerve function assessed on [ dates ]. Fever and new lesions settled by day [ __ ]. Fit for discharge.",
      medications: [
        { generic: "[ MB-MDT adult / PB-MDT adult blister pack ] (rifampicin + clofazimine + dapsone)", dose: "[ as per MDT pack ]", route: "PO", frequency: "[ as per MDT pack ]", duration: "[ … ] — complete every pack", indication: "do not stop during the reaction", status: "continue" },
        M.prednisolone,
        { generic: "[ Clofazimine / thalidomide for ENL ]", dose: "[ … ]", route: "PO", frequency: "[ as titrated in ward ]", duration: "[ … ]", indication: "if ENL; thalidomide never in a woman who could become pregnant", status: "new" },
        M.pantoprazole,
        M.calciumD3,
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Medicines", text: "Keep taking the MDT pack every day and collect the next pack on time. The reaction is not a sign that the treatment is failing." },
        { module: "Steroid tablets", text: STEROID_ADVICE },
        { module: "Hand and foot care", text: "Soak and oil numb hands and feet daily; check them for cuts and blisters; wear protective footwear; use a cloth to hold hot vessels." },
        { module: "Eye care", text: "Protect the eyes; report redness, pain or difficulty closing them." },
        { module: "Stigma", text: "Leprosy on treatment is not infectious to family members, and it is fully curable. Normal living, work and school continue." },
      ]),
      redFlags: ["New numbness, weakness, or pain along a nerve", "New painful red lumps with fever", "Red or painful eyes, or difficulty closing the eye", "Wound or blister on a numb hand or foot", ...RF_STEROID],
      patientActions: [DERM_OPD, "Collect the next MDT pack on [ … ] from [ … ].", "Get a nerve function check on [ … ]."],
      primaryCareActions: ["Supervise monthly MDT under the national programme; examine household contacts; monthly nerve function assessment while on steroids."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Diagnosis and classification; MDT start date and adherence; timing of reaction; fever, joint pain, eye symptoms, testicular pain; new numbness or weakness. Examination: skin lesions (inflamed / new / ENL nodules), all peripheral nerves for thickening and tenderness, voluntary muscle and sensory testing of hands, feet, eyes, disability grade, eyes, testes. Baseline: CBC, renal and liver function, glucose, urine; slit-skin smear; G6PD before dapsone if not done.",
    progressNote:
      "Each day — fever; new lesions / ENL nodules; nerve tenderness; VMT / ST record; eyes; steroid side-effects. For discharge — reaction settling, nerve function charted, MDT continued, steroid taper and next pack date written down.",
  },

  // ---- Cellulitis / pyoderma ----
  {
    key: "cellulitis_pyoderma",
    label: "Cellulitis / extensive pyoderma",
    match: /cellulitis|erysipelas|pyoderma(?! gangrenosum)|impetigo|furunc|carbunc|infected (eczema|dermatitis)/i,
    scaffold: {
      indication: "Patient was admitted with [ cellulitis of the __ / extensive pyoderma ] with [ fever ], for intravenous antibiotics.",
      primaryDiagnosis: "[ Cellulitis __ / erysipelas / extensive impetigo / furunculosis ] [ portal of entry: … ]",
      procedure: {
        name: "[ Nil / incision and drainage ]",
        anaesthesia: "",
        findings: "[ pus culture and sensitivity ]",
        drains: "",
        complications: "Nil",
        outcome: "Erythema and swelling [ settling ].",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ]. Treated with intravenous [ … ], limb elevation [ and drainage ]. Fever settled on day [ __ ]; erythema receding from the marked margin. Switched to oral antibiotics on [ … ]. Portal of entry [ … ] treated. Fit for discharge.",
      medications: [
        { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "[ … ] days (to complete 7–14 days total)", indication: "or as per culture", status: "new" },
        M.fusidic,
        { generic: "Clotrimazole 1% cream", route: "topical", frequency: "BD", duration: "4 weeks", indication: "if tinea between the toes (portal of entry)", status: "new" },
        { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "3 days", status: "new" },
        M.pantoprazole,
      ],
      advice: adv([
        { module: "Elevation", text: "Keep the leg raised on pillows when sitting or lying down until the swelling settles." },
        { module: "Skin care", text: "Keep the feet clean and dry, especially between the toes; moisturise cracked heels; wear footwear." },
        { module: "Medicines", text: "Complete the full antibiotic course even if the skin looks better." },
        { module: "Hygiene", text: "Use a separate towel; wash hands after touching the lesions." },
      ]),
      redFlags: ["Fever returning", "Redness spreading beyond the marked line", "Blisters, black patches, or severe pain out of proportion", "Pus collecting under the skin"],
      patientActions: [DERM_OPD, "Complete the antibiotic course."],
      primaryCareActions: ["Check blood sugar; treat tinea pedis and lymphoedema to prevent recurrence."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Onset, spread, pain, fever; portal of entry (tinea pedis, wound, insect bite, eczema); diabetes; previous episodes; lymphoedema; venous disease. Examination: margin (mark it), warmth, tenderness, fluctuance, blisters, crepitus, pain out of proportion; lymph nodes; web spaces. Baseline: CBC, CRP, glucose, renal function; swab / pus culture; blood culture if febrile.",
    progressNote:
      "Each day — temperature; margin against the mark; pain; swelling; pus; glucose. For discharge — afebrile, margin receding, on oral antibiotics, portal of entry treated.",
  },

  // ---- Herpes zoster (admitted) ----
  {
    key: "herpes_zoster",
    label: "Herpes zoster (admitted)",
    match: /zoster|shingles|\bHZO\b/i,
    scaffold: {
      indication: "Patient was admitted with herpes zoster of the [ dermatome ] [ disseminated / ophthalmic / severe pain / immunocompromised ], for antiviral therapy.",
      primaryDiagnosis: "Herpes zoster [ dermatome ] [ ± ophthalmicus / dissemination / secondary infection ]",
      procedure: {
        name: "Nil",
        anaesthesia: "",
        findings: "[ Tzanck / PCR; HIV status; ophthalmology findings ]",
        drains: "",
        complications: "Nil",
        outcome: "Lesions crusting.",
      },
      clinicalCourse:
        "Admitted on [ date ] with [ presentation ], day [ __ ] of rash. Treated with [ intravenous acyclovir / oral antiviral ] from [ … ], analgesia [ and ophthalmology care ]. No new vesicles since day [ __ ]; lesions crusting. Fit for discharge to complete the antiviral course.",
      medications: [
        { generic: "Valacyclovir", strength: "1 g", route: "PO", frequency: "TDS", duration: "[ … ] days (to complete 7 days total)", indication: "dose reduced if kidney function is low", status: "new" },
        { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "7 days", status: "new" },
        { generic: "Pregabalin", strength: "75 mg", route: "PO", frequency: "HS", duration: "[ … ]", indication: "burning / nerve pain; reduce if kidney function is low; causes drowsiness", status: "new" },
        { generic: "Calamine lotion", route: "topical", frequency: "TDS", duration: "till crusts fall", status: "new" },
        M.fusidic,
        { ...M.lubricantEye, indication: "if the eye was involved, with the eye doctor's drops" },
      ],
      advice: adv([
        { module: "Infection precautions", text: "Keep the rash covered until all blisters have crusted. Avoid contact with pregnant women, newborns and anyone who has not had chickenpox." },
        { module: "Skin care", text: "Keep the area clean and dry; do not burst the blisters; loose cotton clothes." },
        { module: "Pain", text: "Pain after zoster can last weeks; take the pain medicine regularly and report if it is not controlled." },
      ]),
      redFlags: [...RF_SKIN, "Eye pain, redness or blurred vision", "Weakness of the face or a limb, confusion, severe headache or neck stiffness", "Rash spreading beyond one band on the body"],
      patientActions: [DERM_OPD, "[ Attend the Ophthalmology OPD on … if the eye was involved. ]", "Complete the antiviral course."],
      primaryCareActions: ["Look for immunosuppression (HIV, diabetes, malignancy); follow up post-herpetic neuralgia."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Day of rash; prodromal pain; dermatome; eye symptoms, tip-of-nose lesion (Hutchinson's sign); facial weakness, ear lesions; immunosuppression (HIV, diabetes, steroids, chemotherapy, malignancy); previous zoster. Examination: dermatome, dissemination (> 20 vesicles outside), secondary infection, eyes, cranial nerves. Baseline: CBC, renal function, glucose, HIV (with consent); Tzanck / PCR if atypical; ophthalmology if V1.",
    progressNote:
      "Each day — new vesicles; crusting; pain score; eyes; neurological signs; temperature; renal function on acyclovir. For discharge — no new vesicles, crusting, pain controlled on oral medicines.",
  },
];
