import { describe, it, expect } from "vitest";
import { MASTER_LEXICON } from "@/lib/transcription/lexicon";
import { OBSTETRICS_GYNAECOLOGY } from "@/lib/transcription/lexicon/obstetrics-gynaecology";

/**
 * Guards the exact bug class docs/specialty-packs.md §9 documents for "RA"/"ALA": the
 * selector's context-trigger path matches a trigger as a plain substring
 * (lib/transcription/selectMedicalKeyterms.ts `tokenIn`), not a whole word, so a short trigger
 * token can silently fire on an unrelated term elsewhere in the master lexicon ("ANC" inside
 * "pancreatitis", "NST" inside "NSTEMI"). This test caught several real collisions during
 * development (§ obstetrics-gynaecology.ts's own `entry()` now filters auto-derived triggers
 * below 5 characters for exactly this reason) and pins that property so a future addition to
 * this file that reintroduces one fails loudly here instead of showing up as an inflated,
 * unrelated keyterm list on some other unit's dictation.
 */
describe("obstetrics-gynaecology lexicon triggers do not collide with the rest of the master lexicon", () => {
  it("no OBG trigger token is a substring of another specialty's term or alias", () => {
    const others = MASTER_LEXICON.filter(
      (e) => !(e.specialties ?? []).includes("obstetrics-gynaecology")
    );
    const otherStrings = others.flatMap((e) => [e.term, ...(e.aliases ?? [])]).map((s) => s.toLowerCase());

    const collisions: string[] = [];
    for (const entry of OBSTETRICS_GYNAECOLOGY) {
      for (const t of entry.triggers ?? []) {
        for (const s of otherStrings) {
          if (s !== t && s.includes(t)) collisions.push(`"${t}" (from "${entry.term}") ⊂ "${s}"`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });

  it("every auto-derived trigger is at least 5 characters, matching the entry() safety rule", () => {
    for (const entry of OBSTETRICS_GYNAECOLOGY) {
      for (const t of entry.triggers ?? []) {
        expect(t.length).toBeGreaterThanOrEqual(5);
      }
    }
  });
});
