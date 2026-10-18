import { describe, expect, it } from "vitest";
import { heardByBed } from "../heard-by-bed";

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
