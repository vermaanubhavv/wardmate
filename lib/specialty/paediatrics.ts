import {
  MEDICINE_DISCHARGE_TEMPLATES,
  MEDICINE_GENERIC_DISCHARGE_TEMPLATE,
} from "@/lib/discharge-templates-medicine";
import type { FormatKind } from "@/lib/formats";
import type { SpecialtyPack } from "./types";

/**
 * The paediatrics pack — the general paediatric ward.
 *
 * WHAT MAKES A PAEDIATRIC WARD DIFFERENT, and why this is the pack where the app must be most
 * careful:
 *
 * 1. THE DAY IS THE HOSPITAL DAY. There is no operation and no cycle. A paediatric surgical
 *    admission belongs to a surgical unit, not here.
 *
 * 2. EVERY DOSE IS PER KILOGRAM, AND THE APP MUST NEVER DO THAT ARITHMETIC. "Ceftriaxone 100 per
 *    kg per day", "paracetamol 15 per kg", "maintenance at 100 ml per kg" are recorded exactly as
 *    spoken. The app does not multiply a dose by a weight, does not convert a per-kilogram order
 *    into millilitres, and does not check a dose against a range. A paediatric drug error is a
 *    decimal point, and a decimal point this app moved would be indefensible.
 *
 * 3. THE WEIGHT IS A CLINICAL VALUE, not a detail — it is the denominator of every order and the
 *    marker of nutrition. It is recorded as said, with the date it was taken when that was said.
 *
 * 4. THE PARENT IS THE HISTORIAN. The complaint arrives second-hand ("mother says he has not
 *    passed urine since morning"), and who said it is part of the record.
 *
 * 5. THE MILESTONES, THE IMMUNISATION AND THE BIRTH HISTORY are background that the paediatric
 *    history trees already ask for through `paedBackground()` — see docs/history-check.md.
 *
 * SCORING IS EMPTY, AND THAT IS THE MOST IMPORTANT LINE IN THIS FILE. Every pathway WardMate has
 * built and reviewed is an ADULT one. CURB-65, qSOFA, HEART, Wells and CHA₂DS₂-VASc are not
 * validated in children and several are actively misleading there; offering one on a paediatric
 * ward because it happens to exist would be the worst thing this seam could do. Nothing is
 * offered until a paediatric pathway is built and reviewed for children.
 *
 * DISCHARGE TEMPLATES are the medicine ones, which are condition-keyed rather than operation-
 * keyed and so hold the right shape — but they carry adult wording, and paediatric templates
 * (bronchiolitis, pneumonia, acute gastroenteritis with a plan for the weight, febrile seizure,
 * severe acute malnutrition) are the first thing to add past pilot, in a
 * `lib/discharge-templates-paediatrics.ts`.
 *
 * NOT YET PILOTED ON A REAL UNIT. `SPECIALTY_PACKS=on` for the picker, patch 0086 before a unit
 * can pick it.
 */
export const paediatricsPack: SpecialtyPack = {
  key: "paediatrics",
  label: "Paediatrics",
  blurb: "The children's ward. Counts hospital days; weight, per-kilogram doses and the parent's account.",

  terminology: {
    dayLabel: "Hospital day",
    admissionNoun: "admission",
  },

  admissionPhrase: "a paediatric admission",

  // The hospital day, always. A child on a paediatric ward has no operation date to count from;
  // if one exists the admission is a surgical one and belongs to a surgical unit.
  dayCount: (p) => ({ clock: "admission", n: p.admission_day, text: `Day ${p.admission_day}` }),

  extractRoleLine:
    "You convert a paediatric resident's spoken ward-round note into structured observations.",

  extractGuidance: `
Paediatric ward — what the words mean here:

- NEVER CALCULATE A DOSE. Per-kilogram orders are recorded EXACTLY as spoken — "ceftriaxone 100 per kg per day in two divided doses", "paracetamol 15 per kg SOS", "maintenance fluid 100 ml per kg per day", "bolus 20 ml per kg". Do not multiply by the weight, do not convert to millilitres or to a total daily dose, and do not compare a dose with any reference range. If the resident said a total as well, keep both exactly as said.
- THE WEIGHT AND ITS DATE ARE OBSERVATIONS: "weight 8.4 kg", "weighed today", "same as admission", "length 72 cm", "head circumference 45 cm", "mid-upper arm circumference 11.5". Never estimate a weight from an age and never carry an old weight forward as today's.
- WHO GAVE THE HISTORY IS PART OF IT: "mother says", "father reports", "grandmother brought him", "as per the referral letter". Keep the attribution in the observation.
- FEEDING IS A VITAL OBSERVATION IN A CHILD: "accepting feeds", "refusing feeds", "breastfed on demand", "top feeds started", "two spoons of ORS after each stool", "not accepting orally since morning". Record as said.
- URINE OUTPUT AND STOOLS ARE COUNTED THE WAY A PARENT COUNTS THEM: "passed urine three times", "six loose stools since night", "nappies wet twice". Keep the count and the interval said; never convert to ml per kg per hour.
- DEHYDRATION, RESPIRATORY DISTRESS AND DANGER SIGNS ARE FINDINGS, NOT GRADES: "sunken eyes", "skin pinch goes back slowly", "drinking eagerly", "chest indrawing", "grunting", "nasal flaring", "head nodding", "saturation 91 percent in room air", "unable to feed", "lethargic". Do not classify a dehydration as some or severe, and do not grade a distress, unless the resident said that word.
- MILESTONES, IMMUNISATION AND BIRTH HISTORY are recorded as stated: "immunised for age", "BCG scar present", "two doses of pentavalent", "term normal delivery", "birth weight 2.6 kg", "NICU stay for three days", "sits without support", "not yet walking". Never mark a child immunised for age because of their age.
- SEIZURES, THEIR TYPE AND THEIR DURATION are recorded as described: "one episode, generalised, two minutes, with fever", "no post-ictal weakness", "eyes rolled up". Never label an epilepsy syndrome.
- THE NEWBORN WORDS, when a neonate is on the ward, stay as said: "jaundice up to the chest", "bilirubin 14 on day four", "phototherapy started", "double surface", "sepsis screen negative", "TSB and age plotted". Never read a phototherapy or exchange threshold off a chart yourself.
- Abbreviations to leave AS SAID: "ORS", "SAM", "MAM", "MUAC", "BCG", "TSB", "NICU", "AGE" (acute gastroenteritis in this ward — store the letters said), "FBNC", "ARI".
`.trim(),

  // Admission-anchored, as medicine is: there is no operation and no cycle here.
  checklistAnchor: "admission",

  // Condition-keyed medicine templates, on adult wording — see the header for what replaces them.
  dischargeTemplates: MEDICINE_DISCHARGE_TEMPLATES,
  genericDischargeTemplate: MEDICINE_GENERIC_DISCHARGE_TEMPLATE,

  // EMPTY, AND DELIBERATELY SO. Every built pathway is validated in adults only. See the header:
  // this is the single most important line in this pack.
  scoringKeys: [],

  // No OT notes slot: this ward has no operating theatre. A child who is operated on belongs to
  // a surgical unit.
  formatKinds: [
    "investigation",
    "interdepartmental",
    "discharge",
    "notes",
    "logo",
  ] as FormatKind[],

  pickerPhase: "before_surgery",

  // Empty: no paediatric checklist has been written, and not one of medicine's 22 is a child's
  // admission — the drugs, the doses and the thresholds inside them are all adult.
  checklistFamilies: [],

  lexiconSpecialty: "paediatrics",

  // The four paediatric trees first, in the order a children's ward admits them.
  historyTreeIds: [
    "paediatric_fever",
    "paediatric_breathing",
    "paediatric_diarrhoea",
    "paediatric_seizure",
    "fever_with_rash",
    "jaundice",
    "oedema",
    "poisoning_snakebite",
  ],
};
