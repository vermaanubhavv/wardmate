import { DISCHARGE_TEMPLATES, GENERIC_DISCHARGE_TEMPLATE } from "@/lib/discharge-templates";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The urology pack — the kidney, ureter, bladder, prostate and the male genital tract.
 *
 * WHAT MAKES A UROLOGY WARD DIFFERENT. It keeps the surgical clock. What differs is that almost
 * every observation is about a tube, a stone or a stream.
 *
 * 1. WHAT IS DRAINING, AND HOW MUCH. A urology round is a round of catheters, stents, nephrostomy
 *    tubes and drains: "Foley draining clear", "haematuria clearing", "nephrostomy 400 ml",
 *    "DJ stent in situ", "three-way with irrigation running". Output is a number said aloud and
 *    it is recorded as said, never summed or converted by the app.
 *
 * 2. THE STONE HAS A SIDE, A SITE AND A SIZE, and all three are dictated: "left lower ureteric
 *    calculus 8 mm". A side is never inferred.
 *
 * 3. THE STREAM IS THE SYMPTOM. Hesitancy, straining, a poor stream, terminal dribbling,
 *    frequency and nocturia are what a prostate patient reports, and they are recorded in the
 *    words used rather than scored. IPSS is a questionnaire the patient answers, not a number
 *    this app may assemble from a conversation.
 *
 * 4. OBSTRUCTION IS WHAT DAMAGES THE KIDNEY. Creatinine before and after relief of obstruction,
 *    and urine output in the hours after, are the numbers this ward acts on — which is why the
 *    one score offered here is the AKI staging pathway.
 *
 * WHAT IT BORROWS, AND WHEN TO STOP. Discharge templates are the general-surgery ones: a
 * urological discharge is post-operative in shape, with a catheter or stent instruction added.
 * Its own (post-TURP, post-PCNL, post-URSL with stent removal date, post-nephrectomy) belong in
 * a `lib/discharge-templates-urology.ts` past pilot.
 *
 * SCORING is `kdigo_aki` alone. It is built, reviewed and active, and post-obstructive acute
 * kidney injury is this department's own daily problem rather than a score borrowed because it
 * exists. No prostate-cancer risk model and no stone-free prediction is offered: those are
 * prognostic, and a prognosis at a bedside is exactly what this app does not do.
 *
 * CLINICIAN SIGNED OFF FOR PILOT USE 2026-09-26 (Dr. Anubhav), product owner and general-surgery
 * resident, on his own direction and covering this pack's clinical content: the extraction
 * guidance, the day counter, the keyterm lexicon, the history-tree order and the scoring list
 * — including what it deliberately refuses to offer. NOT YET PILOTED ON A REAL UNIT: sign-off is
 * permission to pilot, not evidence of one. Runtime gating is unchanged. `SPECIALTY_PACKS=on` for the picker, patch 0086
 * before a unit can pick it.
 */
export const urologyPack: SpecialtyPack = {
  key: "urology",
  label: "Urology",
  blurb: "Stones, prostate, catheters and stents. Counts post-operative days; side, tube and output first.",

  terminology: {
    dayLabel: "POD",
    admissionNoun: "operation",
  },

  admissionPhrase: "a urology admission",

  dayCount: (p) => {
    if (p.post_op_day !== null) {
      return { clock: "post_op", n: p.post_op_day, text: `POD ${p.post_op_day}` };
    }
    return { clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` };
  },

  extractRoleLine:
    "You convert a urology resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Urology ward — what the words mean here:

- SIDE IS PART OF THE FINDING. "Left ureteric calculus", "right hydronephrosis", "left nephrostomy" — keep the side inside the observation as said, and record none if none was spoken. NEVER infer a side.
- WHAT IS DRAINING IS AN OBSERVATION WITH A NUMBER AND A COLOUR AS SAID: "Foley draining clear urine", "high coloured", "frank haematuria", "clots present", "urine output 1200 ml", "nephrostomy 400 ml", "drain 50 ml serous", "irrigation running", "bladder wash given". Record the figure spoken; never total or average figures yourself.
- TUBES AND STENTS ARE NAMED AND THEIR STATE RECORDED: "Foley 16 French", "three-way catheter", "suprapubic catheter", "DJ stent in situ", "stent removed", "PCN tube blocked", "catheter removed and voided", "trial void failed". These are notes or existing drain fields, not new operations.
- OPERATIONS ARE NAMED IN SHORTHAND and kept that way: "TURP", "TURBT", "PCNL", "URSL", "RIRS", "ESWL", "open pyelolithotomy", "radical nephrectomy", "orchidopexy", "circumcision", "optical urethrotomy", "hydrocelectomy". Record as procedure_done with the words said.
- STONE DETAIL IS STORED AS SPOKEN: site, side and size — "lower ureteric", "renal pelvic", "8 mm", "multiple", "staghorn". Never convert a size between units and never estimate one nobody gave.
- LOWER URINARY TRACT SYMPTOMS ARE THE PATIENT'S OWN WORDS: "poor stream", "straining", "hesitancy", "terminal dribbling", "frequency", "nocturia twice", "urgency", "retention", "catheterised in casualty". Do NOT assemble an IPSS score from these; it is a questionnaire the patient fills, not an inference.
- CONTINENCE AND ERECTILE FUNCTION are recorded only if raised, in the words used, and never assumed from the operation.
- THE KIDNEY NUMBERS ARE INVESTIGATIONS: "creatinine 3.2 falling", "urea 80", "potassium 5.8", "urine culture E coli", "ultrasound shows gross hydronephrosis", "DTPA split function 30 percent". Record with the unit as said.
- PROSTATE FINDINGS AND PSA ARE RECORDED AS SAID, NOT INTERPRETED: "PSA 18", "hard nodular prostate on DRE", "grade 2 enlargement", "biopsy Gleason 3 plus 4". Never grade a risk the resident did not state.
- Abbreviations to leave AS SAID: "TURP", "TURBT", "PCNL", "URSL", "RIRS", "ESWL", "DJ", "PCN", "SPC", "BPH", "PSA", "DRE", "LUTS", "RGU", "MCU".
`.trim(),

  checklistAnchor: "post_op",

  dischargeTemplates: DISCHARGE_TEMPLATES,
  genericDischargeTemplate: GENERIC_DISCHARGE_TEMPLATE,

  // Post-obstructive AKI is this ward's own problem, and the pathway is built and active.
  // Nothing prognostic is offered — see the header.
  scoringKeys: ["kdigo_aki"],

  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "ot_notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "after_surgery",

  // Empty: no urological checklist is written yet. Post-PCNL and post-TURP are the first two.
  checklistFamilies: [],

  lexiconSpecialty: "urology",

  // The stream and the blood lead — they are what brings a patient to this ward.
  historyTreeIds: [
    "burning_micturition",
    "haematuria",
    "decreased_urine_output",
    "scrotal_swelling",
    "polyuria",
    "abdominal_pain",
    "low_back_pain",
    "groin_swelling",
    "fever",
  ],
};
