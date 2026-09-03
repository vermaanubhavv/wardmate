import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The universal core — the handful of Indian ward phrases worth boosting on almost every
 * dictation regardless of the patient.
 *
 * Kept deliberately tiny (see STEP 6 of the brief). Nova-3 Medical already knows ordinary
 * clinical English; this is only the shorthand an Indian resident actually says that a general
 * model writes an English word for. Device-specific phrases ("Ryle's tube", "drain output")
 * are NOT here — they live in devices.ts behind a trigger so they are sent only when that
 * device is present.
 */
export const CORE: MedicalLexiconEntry[] = [
  {
    term: "per abdomen",
    aliases: ["P/A", "P/A soft", "per abdominal examination"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "post operative day",
    aliases: ["POD", "post-op day", "postoperative day"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "urine output",
    aliases: ["adequate urine output", "I/O charting", "input output charting"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "passing flatus",
    aliases: ["not passing flatus", "flatus passed"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "bowels opened",
    aliases: ["bowels not opened", "passed stools", "not passed stools", "motion passed"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "tolerating orally",
    aliases: ["tolerating orals", "oral intake adequate", "orally allowed", "sips allowed"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "nil by mouth",
    aliases: ["NBM", "NPO", "nil per oral", "nil orally"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
  {
    term: "suture line healthy",
    aliases: ["suture line", "wound healthy", "staple line healthy"],
    categories: ["core", "india-round"],
    priority: PRIORITY.INDIA_WARD,
  },
];
