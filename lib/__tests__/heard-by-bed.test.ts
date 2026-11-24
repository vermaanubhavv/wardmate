import { describe, expect, it } from "vitest";
import { heardByBed, heardByPinnedBed } from "../heard-by-bed";

describe("heardByBed", () => {
  it("splits at each bed number", () => {
    expect(heardByBed("Bed 1 discharge today. Bed no. 2, send fresh investigations")).toEqual([
      { bed: "1", text: "discharge today." },
      { bed: "2", text: "send fresh investigations" },
    ]);
  });
  it("keeps words before the first bed, and a bed with nothing said yet", () => {
    expect(heardByBed("morning round bed number 12a")).toEqual([
      { bed: null, text: "morning round" },
      { bed: "12A", text: "" },
    ]);
  });
  it("leaves text with no bed as it is", () => {
    expect(heardByBed("all stable")).toEqual([{ bed: null, text: "all stable" }]);
    expect(heardByBed("")).toEqual([]);
  });
});

describe("heardByPinnedBed", () => {
  const phrases = ["POD 2, afebrile.", "Stop ceftriaxone.", "Pain controlled.", "Bed 16, discharge today."];
  it("files words after each tap under the tapped bed, and still splits at a spoken bed", () => {
    expect(heardByPinnedBed(phrases, [{ at: 0, bed: "12" }, { at: 2, bed: "Bay 2.1" }])).toEqual([
      { bed: "12", text: "POD 2, afebrile. Stop ceftriaxone." },
      { bed: "Bay 2.1", text: "Pain controlled." },
      { bed: "16", text: "discharge today." },
    ]);
  });
  it("shows the bed you just tapped before anything is said, and drops a bed skipped past", () => {
    expect(heardByPinnedBed(phrases.slice(0, 1), [{ at: 0, bed: "12" }, { at: 1, bed: "13" }, { at: 1, bed: "14" }])).toEqual([
      { bed: "12", text: "POD 2, afebrile." },
      { bed: "14", text: "" },
    ]);
  });
  it("is the plain preview with no taps", () => {
    expect(heardByPinnedBed(phrases, [])).toEqual(heardByBed(phrases.join(" ")));
  });
});
