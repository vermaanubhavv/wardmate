import { describe, it, expect } from "vitest";
import { MASTER_LEXICON } from "@/lib/transcription/lexicon";
import { NEUROSURGERY } from "@/lib/transcription/lexicon/neurosurgery";

/**
 * The collision guard every specialty core carries — see
 * `pulmonary-medicine-collisions.test.ts` for the full reasoning.
 *
 * The bug class: the selector matches a context trigger as a plain substring, so a short
 * trigger from this file would silently inflate an unrelated unit's keyterm list. `entry()` in
 * neurosurgery.ts drops auto-derived triggers below five characters; this pins that, and pins
 * that nothing left over fires INSIDE an unrelated word.
 *
 * Word boundaries rather than bare substrings, as the pulmonary test does it: a neurosurgical ward shares "seizure", "drain" and "imaging" with medicine and with surgery. A real
 * word match is not the bug; a trigger landing inside an unrelated word is.
 *
 * This caught real collisions while these five cores were written — a bare "drain" trigger that
 * fired on any ward's drain, a bare "catheter" that fired on any Foley, four paediatric entries
 * mistakenly filed under `core` (which is sent on nearly every dictation, so an adult surgical
 * round was being handed a child's danger signs), and "torsion" reaching from gynaecology into
 * "testicular torsion". Every one was fixed in the lexicon, never by loosening this test.
 */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("neurosurgery lexicon triggers do not collide with the rest of the master lexicon", () => {
  it("no neurosurgical trigger fires inside an unrelated word elsewhere in the lexicon", () => {
    const others = MASTER_LEXICON.filter((e) => !(e.specialties ?? []).includes("neurosurgery"));
    const otherStrings = others.flatMap((e) => [e.term, ...(e.aliases ?? [])]).map((s) => s.toLowerCase());

    const collisions: string[] = [];
    for (const entry of NEUROSURGERY) {
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
    for (const entry of NEUROSURGERY) {
      for (const t of entry.triggers ?? []) expect(t.length).toBeGreaterThanOrEqual(5);
    }
  });
});
