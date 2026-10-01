import type { TaskCategory } from "@/lib/task-category";

/**
 * Synthetic plans with a known "By type" bucket, for scripts/eval-task-category.ts — tuning
 * Jev's category (lib/jev-observations.ts, `category_i`) and the bar below which the keyword
 * match (lib/task-category.ts) decides instead.
 *
 * EVERY LINE HERE IS INVENTED. No patient, no record, nothing copied from a real note.
 *
 * `category: null` is "other" — a job, but none of the four buckets. Several cases are where
 * the keywords go wrong on purpose ("send drain fluid for amylase" says drain, is a sample),
 * because those are the only places Jev can add anything.
 */
export type TaskCategoryCase = { text: string; category: TaskCategory | null };

export const TASK_CATEGORY_CASES: TaskCategoryCase[] = [
  { text: "Send fresh ABG", category: "sampling" },
  { text: "repeat Hb after transfusion", category: "sampling" },
  { text: "send CBC, LFT, KFT tomorrow morning", category: "sampling" },
  { text: "blood culture before the next antibiotic dose", category: "sampling" },
  { text: "send urine routine and culture", category: "sampling" },
  { text: "repeat serum potassium in the evening", category: "sampling" },
  { text: "send drain fluid for amylase", category: "sampling" },
  { text: "GRBS 6 hourly", category: "sampling" },
  { text: "send serum amylase and lipase", category: "sampling" },

  { text: "arrange USG abdomen", category: "radiology" },
  { text: "repeat chest X-ray", category: "radiology" },
  { text: "CECT abdomen with contrast tomorrow", category: "radiology" },
  { text: "MRCP to rule out CBD stones", category: "radiology" },
  { text: "review the HRCT report", category: "radiology" },
  { text: "Doppler of the left leg", category: "radiology" },
  { text: "2D echo before surgery", category: "radiology" },

  { text: "remove abdominal drain", category: "procedure" },
  { text: "change dressing of the surgical site", category: "procedure" },
  { text: "reinsert Foley catheter", category: "procedure" },
  { text: "remove alternate sutures on day 8", category: "procedure" },
  { text: "Ryle's tube removal tomorrow", category: "procedure" },
  { text: "pleural tap under USG guidance", category: "procedure" },
  { text: "I&D of the gluteal abscess", category: "procedure" },
  { text: "wound debridement in the ward", category: "procedure" },

  { text: "obtain consent for laparoscopic cholecystectomy", category: "consent" },
  { text: "high-risk consent for surgery", category: "consent" },
  { text: "blood transfusion consent", category: "consent" },
  { text: "consent for CT contrast", category: "consent" },

  { text: "discuss goals of care with family", category: null },
  { text: "surgery review tomorrow", category: null },
  { text: "refer to cardiology for clearance", category: null },
  { text: "start oral sips", category: null },
  { text: "continue drain output charting", category: null },
  { text: "step down antibiotics to oral", category: null },
  { text: "plan discharge tomorrow", category: null },
  { text: "ambulate the patient", category: null },
  { text: "counsel the patient about stoma care", category: null },
  { text: "inform if urine output below 30 ml per hour", category: null },
];

/**
 * Held out: written AFTER the wording was chosen on the set above, in different phrasing, and
 * never used to pick it. Run with --held-out.
 */
export const TASK_CATEGORY_HELD_OUT: TaskCategoryCase[] = [
  { text: "check serum sodium after the correction", category: "sampling" },
  { text: "send ascitic fluid for cell count and protein", category: "sampling" },
  { text: "repeat coagulation profile before surgery", category: "sampling" },
  { text: "send wound swab, the discharge is purulent", category: "sampling" },
  { text: "HbA1c and fasting sugar tomorrow", category: "sampling" },
  { text: "chase the pending culture report from micro", category: "sampling" },

  { text: "erect abdomen X-ray for air under the diaphragm", category: "radiology" },
  { text: "venous Doppler both lower limbs", category: "radiology" },
  { text: "CT KUB for the ureteric stone", category: "radiology" },
  { text: "follow up the MRI spine report", category: "radiology" },
  { text: "USG-guided marking of the collection", category: "radiology" },

  { text: "take out the chest drain if the lung is up", category: "procedure" },
  { text: "insert a central line before surgery", category: "procedure" },
  { text: "sitz bath and dressing twice a day", category: "procedure" },
  { text: "remove the stitches on the tenth day", category: "procedure" },
  { text: "abdominal paracentesis today", category: "procedure" },

  { text: "get the anaesthesia consent signed", category: "consent" },
  { text: "consent for stoma and possible bowel resection", category: "consent" },
  { text: "relatives to sign the high-risk form", category: "consent" },

  { text: "physiotherapy referral for mobilisation", category: null },
  { text: "switch IV pantoprazole to oral", category: null },
  { text: "explain the diagnosis to the relatives", category: null },
  { text: "monitor drain output hourly", category: null },
  { text: "keep NBM after midnight", category: null },
  { text: "medicine opinion for raised sugars", category: null },
];
