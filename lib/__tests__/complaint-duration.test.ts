import { describe, expect, it } from "vitest";
import { numbersIn, splitComplaint } from "@/lib/complaint-duration";

describe("splitComplaint", () => {
  it("reads a dictated complaint into name × duration, with the site for HOPI", () => {
    expect(splitComplaint("pain abdomen in the right upper abdomen since the last 10 days.")).toEqual({
      name: "Pain abdomen",
      duration: "10 days",
      site: "RUQ",
    });
    expect(splitComplaint("fever since ten days")).toEqual({ name: "Fever", duration: "10 days", site: null });
    expect(splitComplaint("vomiting for 1 week")).toEqual({ name: "Vomiting", duration: "1 week", site: null });
  });
  it("reads back what the workspace saves, and leaves anything else alone", () => {
    expect(splitComplaint("Pain abdomen × 30 days")).toEqual({ name: "Pain abdomen", duration: "30 days", site: null });
    expect(splitComplaint("Jaundice")).toEqual({ name: "Jaundice", duration: "", site: null });
    expect(splitComplaint("Max 3 days").duration).toBe("");
  });
});

describe("numbersIn", () => {
  it("reads words and digits alike", () => {
    expect([...numbersIn("ten days, 2 weeks, a month")]).toEqual(["10", "2"]);
  });
});
