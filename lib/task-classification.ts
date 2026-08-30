/** A job must be an unfinished, explicit future action. Treatment already given or continued
 * belongs in progress, even when extraction historically called it a plan. */
const UPDATE = /\b(given|administered|started|commenced|done|completed|cst|continue(?:\s+same)?(?:\s+treatment)?|maintain(?:ed)?|ongoing|on treatment)\b/i;

/**
 * Is this plan still a job to be done?
 *
 * It used to also require one of thirteen verbs — repeat, review, send, arrange, remove,
 * shift, discharge, consult, refer, check, follow-up, withhold, stop, start. Anything phrased
 * outside that list was dropped: "PAC clearance awaited", "NBM from midnight", "drain output
 * charting", "for surgery on Tuesday" are all real jobs and none of them match.
 *
 * That was worse than a missing feature, because the ward list counts open plans WITHOUT this
 * filter. A resident saw "1 to do" against a bed, opened the patient, and read "Nothing
 * outstanding" — and the to-do screen for the whole unit said every job was ticked off. The
 * job was in the database the whole time, unticked, invisible to the two screens where it
 * would have been acted on.
 *
 * So the whitelist is gone. A plan the resident stated is a job unless it reads as something
 * already given or continued, which is what UPDATE still catches. The cost of the loose
 * direction is an occasional line on the list that did not need to be there and can be
 * ticked; the cost of the tight one was work disappearing between two screens that both
 * claimed to be showing it. This app's whole argument is that absence is shown rather than
 * filled — a stated plan silently deleted for its wording is the opposite of that.
 */
export function isActionableTask(text: string | null | undefined): boolean {
  const value = (text ?? "").trim();
  return Boolean(value) && !UPDATE.test(value);
}
