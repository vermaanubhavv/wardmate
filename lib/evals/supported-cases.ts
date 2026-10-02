/**
 * Synthetic extracted rows with a known answer, for scripts/eval-supported.ts — tuning the
 * amber check (lib/jev-observations.ts, `supported_i`): does the quote actually say the value?
 *
 * EVERY LINE HERE IS INVENTED. No patient, no record, nothing copied from a real note.
 *
 * Only soft findings: numbers, drugs, doses and procedures-done are amber before Jev is asked
 * (the extraction prompt's rule 4), so they are never scored. The unsupported rows are the
 * mistakes an extractor makes with real quotes — a denial stored as present, the wrong side,
 * a suspicion stored as a diagnosis, a relative's history stored as the patient's, planned
 * stored as done. The supported rows paraphrase on purpose: equivalent words must pass, or
 * the check turns every shorthand amber and residents learn to tap through it.
 */
export type SupportedCase = { label: string; value: string; quote: string; supported: boolean };

export const SUPPORTED_CASES: SupportedCase[] = [
  { label: "abdomen", value: "soft, non-tender", quote: "abdomen soft, non-tender", supported: true },
  { label: "wound", value: "healthy", quote: "wound looks healthy, no discharge", supported: true },
  { label: "diagnosis", value: "acute appendicitis", quote: "impression acute appendicitis", supported: true },
  { label: "oral intake", value: "tolerating orals", quote: "taking orally well", supported: true },
  { label: "plan", value: "remove drain", quote: "drain can come out tomorrow", supported: true },
  { label: "PAC", value: "fit", quote: "PAC fit for surgery under GA", supported: true },
  { label: "bowel sounds", value: "present", quote: "BS +", supported: true },
  { label: "vomiting", value: "no vomiting", quote: "no vomiting since morning", supported: true },
  { label: "planned procedure", value: "lap chole", quote: "posted for lap chole on Monday", supported: true },
  { label: "diagnosis", value: "cholelithiasis", quote: "USG shows multiple gallstones, cholelithiasis", supported: true },
  { label: "guarding", value: "no guarding", quote: "P/A soft, no guarding or rigidity", supported: true },
  { label: "flatus", value: "passed flatus", quote: "flatus passed, stools not yet", supported: true },
  { label: "diagnosis", value: "right inguinal hernia", quote: "reducible right inguinal hernia", supported: true },
  { label: "chest", value: "clear", quote: "chest B/L AE equal, clear", supported: true },
  { label: "mobility", value: "ambulating", quote: "patient is up and walking around the ward", supported: true },

  { label: "abdomen", value: "tender", quote: "abdomen non-tender", supported: false },
  { label: "tenderness", value: "right iliac fossa", quote: "tenderness in the left iliac fossa", supported: false },
  { label: "bowel sounds", value: "absent", quote: "no guarding", supported: false },
  { label: "procedure", value: "lap chole done", quote: "posted for lap chole on Monday", supported: false },
  { label: "PAC", value: "fit", quote: "PAC pending, ECG awaited", supported: false },
  { label: "wound", value: "healthy", quote: "wound was healthy yesterday, now there is a purulent discharge", supported: false },
  { label: "diagnosis", value: "acute appendicitis", quote: "rule out acute appendicitis", supported: false },
  { label: "comorbidity", value: "diabetes", quote: "mother is diabetic", supported: false },
  { label: "vomiting", value: "present", quote: "no vomiting since morning", supported: false },
  { label: "drain", value: "removed", quote: "drain to be removed tomorrow", supported: false },
  { label: "oral intake", value: "tolerating orals", quote: "orals started but vomited twice", supported: false },
  { label: "diagnosis", value: "left inguinal hernia", quote: "reducible right inguinal hernia", supported: false },
  { label: "chest", value: "clear", quote: "crepitations at the right base", supported: false },
  { label: "jaundice", value: "icterus present", quote: "no pallor, no icterus", supported: false },
  { label: "plan", value: "discharge today", quote: "discharge once the drain is out", supported: false },
];

/**
 * Held out: written AFTER the wording was chosen on the set above, in different phrasing, and
 * never used to pick it. Run with --held-out.
 */
export const SUPPORTED_HELD_OUT: SupportedCase[] = [
  { label: "abdomen", value: "distended", quote: "abdomen distended, tympanic", supported: true },
  { label: "stoma", value: "healthy", quote: "stoma pink and functioning", supported: true },
  { label: "fever", value: "afebrile", quote: "no fever spikes overnight", supported: true },
  { label: "diagnosis", value: "perforation peritonitis", quote: "this is perforation peritonitis, posting for exploratory laparotomy", supported: true },
  { label: "plan", value: "start soft diet", quote: "can go on to a soft diet today", supported: true },
  { label: "urine output", value: "adequate", quote: "passing urine well, output adequate", supported: true },
  { label: "comorbidity", value: "hypertension", quote: "known hypertensive on amlodipine", supported: true },
  { label: "pain", value: "relieved", quote: "pain is much better since yesterday", supported: true },
  { label: "PAC", value: "fit with conditions", quote: "fit for surgery subject to cardiology clearance", supported: true },
  { label: "drain", value: "removed", quote: "drain taken out this morning", supported: true },

  { label: "abdomen", value: "distended", quote: "abdomen not distended", supported: false },
  { label: "comorbidity", value: "hypertension", quote: "father had hypertension", supported: false },
  { label: "diagnosis", value: "perforation peritonitis", quote: "?perforation, get an erect X-ray", supported: false },
  { label: "stoma", value: "healthy", quote: "stoma looks dusky", supported: false },
  { label: "drain", value: "removed", quote: "remove the drain once output settles", supported: false },
  { label: "fever", value: "afebrile", quote: "spiked 101 F last night", supported: false },
  { label: "plan", value: "start soft diet", quote: "keep NBM, soft diet only after the leak test", supported: false },
  { label: "swelling", value: "left leg", quote: "swelling of the right leg since two days", supported: false },
  { label: "pain", value: "relieved", quote: "pain was relieved after the injection but has come back", supported: false },
  { label: "PAC", value: "fit", quote: "anaesthesia says unfit for now, optimise sugars first", supported: false },
];
