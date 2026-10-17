import { hasOperationClock } from "./intake";
import type { SpecialtyPack } from "./types";

/**
 * The department-specific words inside the AI prompts, kept out of the packs so they stay
 * untouched.
 *
 * THE RULE: general surgery's prompts are byte-identical to what they were before this file
 * existed (prompt caching is a prefix match, and the surgical prompts are the ones the evals
 * were run against). Every helper here returns the surgical wording for general_surgery, and
 * `forWard` returns its input untouched for it.
 */

/** Who is speaking, lifted from the pack's own extraction role line — "a surgical resident",
 *  "a chest physician", "an emergency physician". */
export function speakerOf(pack: SpecialtyPack): string {
  return pack.extractRoleLine.match(/^You convert (.+?)'s spoken/)?.[1] ?? "a resident";
}

type Swap = [from: string, to: string];

/**
 * A prompt written for a surgical ward, reworded for this unit: who is speaking, what kind of
 * admission it is, plus any prompt-specific `extra` swaps ([surgical wording, this unit's]).
 * General surgery gets the text back exactly as written.
 */
export function forWard(text: string, pack: SpecialtyPack, extra: Swap[] = []): string {
  if (pack.key === "general_surgery") return text;
  const speaker = speakerOf(pack);
  const swaps: Swap[] = [
    ...extra,
    ["a surgical resident", speaker],
    ["A surgical resident", speaker.replace(/^a/, "A")],
    ["a surgical admission", pack.admissionPhrase],
    ["a surgical patient's", "a patient's"],
    ["a surgical ward-round", "a ward-round"],
  ];
  return swaps.reduce((t, [from, to]) => t.split(from).join(to), text);
}

/**
 * The worked examples inside the shared extraction prompt (lib/extract.ts).
 *
 * A unit with an operation clock gets the surgical examples and the procedure / PAC blocks
 * exactly as before. A unit without one (medicine, oncology, psychiatry, paediatrics,
 * dermatology, emergency) never flips a patient to post-op, so it is not taught to record a
 * completed operation or a pre-anaesthetic verdict, and its examples are a medical ward's.
 * A department wanting its own examples adds a branch here.
 */
export type ExtractExamples = {
  /** Appended to rule 4's list of things that always need a one-tap check. */
  confirmProcedure: string;
  /** Rule 6's example sentence and what it yields. */
  identity: string;
  labels: string;
  diagnosis: string;
  dayNumber: string;
  /** The planned_procedure, procedure_done and pac_status guidance, or "" for none. */
  procedureBlocks: string;
  planExamples: string;
  notPlanExamples: string;
  splitPlan: string;
  onePlan: string;
};

export function extractExamplesFor(pack: SpecialtyPack): ExtractExamples {
  return hasOperationClock(pack) ? SURGICAL : MEDICAL;
}

const SURGICAL: ExtractExamples = {
  confirmProcedure:
    ", and every procedure_done observation (see below — it silently flips the patient's post-op status)",
  identity: `"bed number 1, Shyamlal, 36-year-old male, post-op day 2, abdomen soft" yields exactly TWO observations: the day number and the abdomen`,
  labels: `"temperature", "drain output", "ceftriaxone", "abdomen"`,
  diagnosis: "cholelithiasis",
  dayNumber: "a post-operative or admission day",
  procedureBlocks: `
- planned_procedure: When the transcript names the operation a patient is intended to have — "pt for radical hysterectomy", "posted for lap chole", "planned for TAH + BSO", "case posted for appendicectomy", "listed for" — record kind "planned_procedure", label "planned procedure", and value_text as the named operation exactly as said, including every part joined by "+" or "and" ("TAH + BSO + frozen" stays together, it is one planned operation, not three). This is only for a genuinely FUTURE, not-yet-done operation — an operation already performed is procedure_done instead, never this kind.

- procedure_done: When the transcript states that an operation has ALREADY been carried out — not planned, not upcoming — for example "patient underwent lap chole", "taken up for surgery, cholecystectomy done", "operated today", "s/p appendicectomy". Record kind "procedure_done", label "procedure done", and value_text as the operation named exactly as said. This is a significant fact: the app flips the patient to post-operative the moment this is recorded, which changes their post-op day count and their checklist. Use it ONLY for an operation reported as freshly performed — someone naming a distant, unrelated PAST surgery as background history ("K/C/O appendicectomy 10 years back", "prior C-section") is a comorbidities/history note, never this kind. Because a mis-heard "planned for" versus "underwent" would wrongly flip a patient to post-op, set needs_confirmation to true on every procedure_done observation without exception.
- pac_status: When the transcript states the outcome of a pre-anaesthetic checkup — "PAC done, fit for surgery", "PAC clearance given", "declared unfit", "fit subject to control of sugars", "PAC awaited", "anaesthetist has not seen him yet" — record kind "pac_status", label "PAC", and value_text as the verdict exactly as said, INCLUDING any stated conditions. Set pac_verdict to the normalised reading of that sentence:
  - "fit": cleared outright, with nothing attached. "PAC done, fit", "cleared for surgery", "fit for GA".
  - "fit_with_conditions": cleared, but the transcript attaches something that must happen or hold — "fit subject to control of blood sugar", "fit provided BP is controlled", "fit for spinal but not GA", "clearance given, needs cardiology review first".
  - "unfit": explicitly not cleared. "declared unfit", "not fit for surgery", "PAC refused clearance".
  - "pending": the transcript says the checkup has not happened or the answer is not back yet — "PAC awaited", "PAC pending", "anaesthetist yet to review", "sent for PAC".
  Set pac_verdict to null for every observation that is not a pac_status. NEVER infer a verdict the transcript did not state: a resident mentioning "PAC" with no outcome ("PAC file is on the trolley") is not a verdict, and a patient simply being scheduled for theatre is not a clearance. If no PAC outcome was stated, emit no pac_status at all — silence is the correct answer.

  A "pending" VERDICT IS ALSO A JOB. "PAC clearance awaited", "PAC pending", "anaesthetist yet to review" state where things stand AND leave something for somebody to do: the patient has to be sent for that review. Emit BOTH — the pac_status carrying the verdict as said, and a plan whose value_text is exactly "send for PAC review". The plan's words are the JOB, not the words of the verdict: a to-do list reading "PAC clearance awaited" tells a resident the state of the world, which they can already read above, instead of what to pick up and do. Its source_quote is still the sentence that stated the pending verdict, exactly as said. Two observations from one sentence, both quoting it, exactly as a conditional verdict below produces both. "Sent for PAC" is the same: the checkup has not reported back, so the job of chasing it is still open. Do NOT emit the plan when the transcript states an outcome — fit, fit with conditions, or unfit — because then the review has happened and there is nothing left to send anyone for.

  WHEN A PAC VERDICT CARRIES CONDITIONS, EMIT THE CONDITIONS AS PLANS TOO. "Fit subject to control of blood sugar and a cardiology opinion" is THREE observations: the pac_status carrying the whole verdict, plus a plan "control of blood sugar" and a plan "cardiology opinion". They are separate because the verdict is a finding to read and the conditions are jobs someone has to do, ticked off one at a time. Both carry a source_quote from the same sentence, which is correct and expected.`,
  planExamples: `"remove drain tomorrow", "repeat haemoglobin", "discharge if afebrile"`,
  notPlanExamples: `"Telma Amlo given stat", "CST", "continue same treatment", "antibiotics started", or "drain removed"`,
  splitPlan: `"Drain out and discharge tomorrow" is two plans — "drain out tomorrow" and "discharge tomorrow"`,
  onePlan: `"Remove the drain" is one plan, not "remove" and "the drain"`,
};

const MEDICAL: ExtractExamples = {
  confirmProcedure: "",
  identity: `"bed number 1, Shyamlal, 36-year-old male, day 3 of admission, chest clear" yields exactly TWO observations: the day number and the chest`,
  labels: `"temperature", "urine output", "ceftriaxone", "chest"`,
  diagnosis: "pneumonia",
  dayNumber: "an admission or treatment day",
  procedureBlocks: "",
  planExamples: `"repeat chest X-ray tomorrow", "repeat haemoglobin", "discharge if afebrile"`,
  notPlanExamples: `"Telma Amlo given stat", "CST", "continue same treatment", "antibiotics started", or "nebulisation given"`,
  splitPlan: `"Stop oxygen and discharge tomorrow" is two plans — "stop oxygen tomorrow" and "discharge tomorrow"`,
  onePlan: `"Repeat the chest X-ray" is one plan, not "repeat" and "the chest X-ray"`,
};
