import { describe, it, expect } from "vitest";
import { MASTER_LEXICON } from "@/lib/transcription/lexicon";
import { BURNS_PLASTIC_SURGERY } from "@/lib/transcription/lexicon/burns-plastic-surgery";

/**
 * The same guard the obstetrics core carries, for the same bug class: the selector matches a
 * context trigger as a plain substring, so a short trigger from this file ("ABG" inside "CABG", "ANC" inside "pancreatitis") would silently inflate an unrelated unit's keyterm list.
 * `entry()` in burns-plastic-surgery.ts drops auto-derived triggers below five characters; this
 * pins that, and pins that nothing left over fires INSIDE an unrelated word.
 *
 * WHY THIS CHECKS WORD BOUNDARIES AND THE OBSTETRICS TEST DOES NOT. Burns vocabulary overlaps the general-surgery core wherever wounds, dressings and grafts are concerned. A trigger
 * sitting inside a longer legitimate phrase is a real word match, not the bug. The bug is a
 * trigger landing inside a word that has nothing to do with it, so that is what this asserts.
 */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("burns lexicon triggers do not collide with the rest of the master lexicon", () => {
  it("no burns trigger fires inside an unrelated word elsewhere in the lexicon", () => {
    const others = MASTER_LEXICON.filter((e) => !(e.specialties ?? []).includes("burns_plastic_surgery"));
    const otherStrings = others.flatMap((e) => [e.term, ...(e.aliases ?? [])]).map((s) => s.toLowerCase());

    const collisions: string[] = [];
    for (const entry of BURNS_PLASTIC_SURGERY) {
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
    for (const entry of BURNS_PLASTIC_SURGERY) {
      for (const t of entry.triggers ?? []) expect(t.length).toBeGreaterThanOrEqual(5);
    }
  });
});
