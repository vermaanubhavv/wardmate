import { describe, it, expect } from "vitest";
import { MASTER_LEXICON } from "@/lib/transcription/lexicon";
import { PULMONARY_MEDICINE } from "@/lib/transcription/lexicon/pulmonary-medicine";

/**
 * The same guard the obstetrics core carries, for the same bug class: the selector matches a
 * context trigger as a plain substring, so a short trigger from this file ("ABG" inside
 * "CABG", "NIV" inside a longer word) would silently inflate an unrelated unit's keyterm list.
 * `entry()` in pulmonary-medicine.ts drops auto-derived triggers below five characters; this
 * pins that, and pins that nothing left over fires INSIDE an unrelated word.
 *
 * WHY THIS ONE CHECKS WORD BOUNDARIES AND THE OBSTETRICS TEST DOES NOT. Obstetric vocabulary
 * barely overlaps the rest of the lexicon, so there a bare substring rule costs nothing. A
 * chest ward shares its words with general medicine by nature — "fever", "chest",
 * "tuberculosis" are supposed to be context triggers, and each of them sits inside a longer
 * legitimate phrase somewhere ("dengue fever", "chest X-ray"). Those are real word matches,
 * not the bug. What is the bug is a trigger landing inside a word that has nothing to do with
 * it, so that is what this asserts.
 */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("pulmonary-medicine lexicon triggers do not collide with the rest of the master lexicon", () => {
  it("no pulmonary trigger fires inside an unrelated word elsewhere in the lexicon", () => {
    const others = MASTER_LEXICON.filter((e) => !(e.specialties ?? []).includes("pulmonary-medicine"));
    const otherStrings = others.flatMap((e) => [e.term, ...(e.aliases ?? [])]).map((s) => s.toLowerCase());

    const collisions: string[] = [];
    for (const entry of PULMONARY_MEDICINE) {
      for (const t of entry.triggers ?? []) {
        const inside = new RegExp(`(?:[a-z]${esc(t)}|${esc(t)}[a-z])`);
        for (const s of otherStrings) {
          if (s !== t && inside.test(s)) collisions.push(`"${t}" (from "${entry.term}") inside "${s}"`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });

  it("every auto-derived trigger is at least 5 characters, matching the entry() safety rule", () => {
    for (const entry of PULMONARY_MEDICINE) {
      for (const t of entry.triggers ?? []) expect(t.length).toBeGreaterThanOrEqual(5);
    }
  });
});
