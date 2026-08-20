/** A job must be an unfinished, explicit future action. Treatment already given or continued
 * belongs in progress, even when extraction historically called it a plan. */
const UPDATE = /\b(given|administered|started|commenced|done|completed|cst|continue(?:\s+same)?(?:\s+treatment)?|maintain(?:ed)?|ongoing|on treatment)\b/i;
const ACTION = /\b(repeat|review|send|arrange|remove|shift|discharge|consult|refer|check|follow[ -]?up|withhold|stop|start)\b/i;

export function isActionableTask(text: string | null | undefined): boolean {
  const value = (text ?? "").trim();
  return Boolean(value) && !UPDATE.test(value) && ACTION.test(value);
}
