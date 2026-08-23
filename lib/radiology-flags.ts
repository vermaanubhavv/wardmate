/**
 * Flagging a radiological finding as worth listing under "Issues" — and the one thing this
 * file cannot do that lib/lab-ranges.ts can: a blood result has a number and a range to check
 * it against; "gallbladder wall thickened, pericholecystic fluid" does not. There is no numeric
 * threshold to apply here, and inventing one — deciding from wording alone that a scan
 * "sounds abnormal" — would be exactly the clinical judgement this app has refused to make
 * anywhere else.
 *
 * So this only recognises the one case that is not a judgement call at all: the resident's OWN
 * word for it. "USG abdomen — deranged LFT pattern on correlation" or "CT abnormal, free fluid
 * seen" says its own conclusion; this reads that word, not the finding itself. A report that
 * only describes what was seen, however concerning it might read to a clinician, is left alone —
 * that reading is the doctor's, not the app's.
 */

const RADIOLOGY_LABEL =
  /\b(usg|ultrasound|ultrasonography|sonography|ct|ct scan|hrct|mri|x-?ray|doppler|echo|echocardiography|angiography|mammograph\w*|barium)\b/i;

/** The same "the resident said so" rule lib/lab-ranges.ts applies to a number — here applied
 *  to a report with no number to check at all. */
const SAID_ABNORMAL = /\b(abnormal|deranged|derangement|grossly)\b/i;

export type RadiologyFlag = { label: string; value: string };

/**
 * Null unless BOTH: this reads as a radiology-type investigation, AND the resident's own
 * words say the result was abnormal. Absent either, this returns null — a descriptive-only
 * report is shown elsewhere as an ordinary finding, never promoted to "Issues" on this file's
 * say-so.
 */
export function flagRadiology(label: string, value: string | null): RadiologyFlag | null {
  if (!value || !value.trim()) return null;
  if (!RADIOLOGY_LABEL.test(label) && !RADIOLOGY_LABEL.test(value)) return null;
  if (!SAID_ABNORMAL.test(value)) return null;
  return { label, value: value.trim() };
}
