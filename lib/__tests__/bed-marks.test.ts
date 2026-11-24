import { describe, expect, it } from "vitest";
import { insertBedMarks, parseBedMarks } from "../bed-marks";

const words = [
  { word: "Stop", start: 0.4 },
  { word: "ceftriaxone.", start: 0.9 },
  { word: "Repeat", start: 6.2 },
  { word: "Hb.", start: 6.6 },
];

describe("insertBedMarks", () => {
  it("writes the pinned bed before the first word said after each tap", () => {
    expect(insertBedMarks(words, [{ bed: "12", at: 0 }, { bed: "14", at: 5 }])).toBe(
      "Bed 12. Stop ceftriaxone. Bed 14. Repeat Hb."
    );
  });
  it("keeps only the last of several taps before the same word", () => {
    expect(insertBedMarks(words, [{ bed: "12", at: 2 }, { bed: "14", at: 3 }])).toBe(
      "Stop ceftriaxone. Bed 14. Repeat Hb."
    );
  });
  it("adds nothing for a tap after the last word, or with no taps", () => {
    expect(insertBedMarks(words, [{ bed: "15", at: 9 }])).toBe("Stop ceftriaxone. Repeat Hb.");
    expect(insertBedMarks(words, [])).toBe("Stop ceftriaxone. Repeat Hb.");
  });
});

describe("parseBedMarks", () => {
  it("keeps well-formed marks, sorted by time", () => {
    expect(parseBedMarks('[{"bed":"14","at":5},{"bed":"12A","at":0}]')).toEqual([
      { bed: "12A", at: 0 },
      { bed: "14", at: 5 },
    ]);
  });
  it("drops anything malformed rather than trusting it", () => {
    expect(parseBedMarks('[{"bed":"<b>","at":1},{"bed":"3","at":-1},{"bed":"4"}]')).toEqual([]);
    expect(parseBedMarks("not json")).toEqual([]);
    expect(parseBedMarks(null)).toEqual([]);
  });
});
