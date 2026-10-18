/**
 * The live case-history dictation flow: every section the router can emit has somewhere to go —
 * a stored observation label, the HOPI special case, or the "held for the resident to place"
 * set. The Deepgram streaming query is covered in lib/transcription/__tests__.
 */
import { describe, expect, it } from "vitest";
import {
  ROUTABLE_SECTIONS,
  HISTORY_SECTION_LABEL,
  EXAM_SECTION_LABEL,
  HELD_SECTIONS,
} from "@/lib/case-history-sections";

describe("section routing map", () => {
  it.each([...ROUTABLE_SECTIONS])('"%s" is either stored or explicitly held', (section) => {
    const placed =
      section === "hopi" ||
      Boolean(HISTORY_SECTION_LABEL[section]) ||
      Boolean(EXAM_SECTION_LABEL[section]) ||
      HELD_SECTIONS.has(section);
    expect(placed).toBe(true);
  });

  it("complaints is stored under 'chief complaints'", () => {
    expect(HISTORY_SECTION_LABEL.complaints).toBe("chief complaints");
  });

  it("abdomen is stored under 'per abdomen'", () => {
    expect(EXAM_SECTION_LABEL.abdomen).toBe("per abdomen");
  });

  it("diagnosis and plan are held, not auto-written", () => {
    expect(HELD_SECTIONS.has("diagnosis")).toBe(true);
    expect(HELD_SECTIONS.has("plan")).toBe(true);
    expect(HISTORY_SECTION_LABEL.diagnosis).toBeFalsy();
  });

  it("history and exam label sets do not overlap", () => {
    expect(Object.keys(HISTORY_SECTION_LABEL).filter((k) => k in EXAM_SECTION_LABEL)).toEqual([]);
  });

  it("the general-examination narrative is held, not written to a card", () => {
    expect(HELD_SECTIONS.has("examination")).toBe(true);
  });
});
