import {
  MEDICINE_DISCHARGE_TEMPLATES,
  MEDICINE_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-medicine";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The dermatology pack.
 *
 * WHAT MAKES A SKIN WARD DIFFERENT. Most of dermatology happens in an outpatient clinic, and
 * the few patients who are admitted are admitted because their skin has stopped working as an
 * organ — a severe drug reaction, a blistering disease, erythroderma. Both halves share one
 * discipline that this pack exists to enforce.
 *
 * 1. MORPHOLOGY IS THE OBSERVATION; THE DIAGNOSIS IS NOT. "Annular scaly plaque with central
 *    clearing" is what was seen. "Tinea" is a conclusion, and the resident says it separately
 *    or not at all. The guidance below stores the description as dictated and never promotes a
 *    description into a disease — the anchoring this whole app is built to avoid.
 *
 * 2. THE DRUG TIMELINE IS THE HISTORY. In a drug reaction, which medicine and how many days
 *    before the rash is the entire clinical question. It is recorded as the drug named and the
 *    interval said, never reconstructed and never inferred from what the patient is on now.
 *
 * 3. A PATCH THAT HAS LOST SENSATION IS ASKED ABOUT, NOT ASSUMED. Leprosy remains present and
 *    is missed when nobody asks; it is a slot in the `skin_lesion` tree for that reason, and
 *    the guidance keeps "no sensation over the patch" as the finding it is.
 *
 * 4. BODY SURFACE AREA IS RECORDED ONLY WHEN SPOKEN. A percentage decides how ill a patient
 *    with a peeling rash is, and it is an estimate a clinician makes at the bedside. The app
 *    never computes one, never converts "most of the back" into a number, and never grades
 *    severity from the words around it.
 *
 * WHAT THIS PACK BORROWS. The medicine discharge templates — an inpatient dermatology discharge
 * is medical in shape (problem, course, what was started, what to apply, follow-up). Its own
 * (severe drug reaction, pemphigus, erythroderma, leprosy under the national programme with its
 * monthly follow-up) are the first thing to add past pilot.
 *
 * SCORING IS EMPTY, deliberately. SCORTEN, PASI and BSA-based indices are real instruments that
 * this app has not built, not reviewed and does not compute. Offering none is the honest state.
 *
 * CLINICIAN SIGNED OFF FOR PILOT USE 2026-09-26 (Dr. Anubhav), product owner and general-surgery
 * resident, on his own direction and covering this pack's clinical content: the extraction
 * guidance, the day counter, the keyterm lexicon, the history-tree order and the scoring list
 * — including what it deliberately refuses to offer. NOT YET PILOTED ON A REAL UNIT: sign-off is
 * permission to pilot, not evidence of one. Runtime gating is unchanged. `SPECIALTY_PACKS=on` and patch 0084 first.
 */
export const dermatologyPack: SpecialtyPack = {
  key: "dermatology",
  label: "Dermatology",
  blurb: "Skin, venereology and leprosy. Counts hospital days; morphology recorded, never promoted to a diagnosis.",

  terminology: {
    dayLabel: "HD",
    admissionNoun: "problem",
  },

  admissionPhrase: "a dermatology admission",

  // The hospital day. A skin biopsy, a patch test or a phototherapy session is a procedure and
  // does not start a post-operative clock.
  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine:
    "You convert a dermatology resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Skin ward and clinic — what the words mean here:

- THE DESCRIPTION IS THE OBSERVATION. "Annular scaly plaque with central clearing over the left thigh", "flaccid bullae with Nikolsky positive", "hypopigmented patch over the right cheek". Store the morphology, the site and the distribution exactly as dictated. If a diagnosis was also said, that is a SEPARATE observation — never turn a description into a disease the resident did not name.
- SITE AND DISTRIBUTION ARE PART OF THE FINDING: "flexural", "extensor surfaces", "photo-exposed areas", "web spaces", "both groins", "generalised". Keep them inside the observation as said; never infer a distribution from a diagnosis.
- THE DRUG TIMELINE IS RECORDED AS THE DRUG AND THE INTERVAL SPOKEN: "started phenytoin three weeks back", "took some tablets from a shop four days before the rash", "one injection at a local clinic". Record the drug named and the interval said. Do NOT reconstruct a timeline, do not convert "some tablets" into a drug name, and do not assume the current chart caused the rash.
- LOSS OF SENSATION OVER A PATCH IS A FINDING IN ITS OWN RIGHT: "no sensation over the patch", "reduced sweating", "thickened ulnar nerve". Record it as said. Absence of the statement is not a normal sensation — record nothing.
- BODY SURFACE AREA IS ONLY EVER WHAT WAS SPOKEN: "about 40 percent involved", "most of the back". Never compute a percentage, never convert words into a number, and never grade a rash as mild, moderate or severe yourself.
- MUCOSAL SITES ARE COUNTED SEPARATELY AND AS SAID: "oral erosions present", "genital erosions", "eyes congested", "lips crusted". Two mucosal sites in a drug reaction is a clinical fact the resident states; the app does not infer it from a list.
- TOPICAL AND SYSTEMIC TREATMENT ARE BOTH MEDICATIONS, and what is applied matters as much as what is swallowed: "clobetasol cream twice daily", "permethrin applied whole body, family treated", "methotrexate weekly", "itraconazole started", "MDT blister pack given". Record the drug, route and any frequency actually spoken. An over-the-counter combination cream is recorded as the words used.
- BEDSIDE TESTS ARE INVESTIGATIONS: "KOH mount showed hyphae", "Tzanck smear", "slit skin smear negative", "punch biopsy sent", "DIF sent", "patch test with Indian standard series". Record the result only when a result was spoken.
- ITCH AND ITS TIMING ARE SYMPTOMS, recorded as said: "itching worse at night", "whole family itching", "no itch". The last of those is a negative only because it was said.
- Abbreviations to leave AS SAID: "KOH", "DIF", "MDT", "SJS", "TEN", "DRESS", "BSA", "PUVA", "NBUVB", "STI". Store the letters that were said.
`.trim(),

  checklistAnchor: "admission",

  dischargeTemplates: MEDICINE_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: MEDICINE_GENERIC_DISCHARGE_TEMPLATE,

  // Empty on purpose: SCORTEN, PASI and the BSA indices are real instruments this app has not
  // built or reviewed, and it does not compute them.
  scoringKeys: [],

  // No OT notes slot.
  formatKinds: ["investigation", "interdepartmental", "discharge", "notes", "logo"] as FormatKind[],

  pickerPhase: "before_surgery",

  // Empty: no dermatology checklist has been written. Cellulitis is medicine's row, and
  // claiming it here would be this app deciding a clinical scope nobody signed off.
  checklistFamilies: [],

  lexiconSpecialty: "dermatology",

  // The skin complaint first, then the febrile rash, then what walks into the same clinic.
  historyTreeIds: [
    "skin_lesion",
    "fever_with_rash",
    "leg_ulcer",
    "lump",
    "burning_micturition",
    "joint_pain",
    "loss_of_weight_appetite",
    "fever",
  ],
};
