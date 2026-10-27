import { describe, expect, it } from "vitest";
import { numbersIn, objectiveComplaint, splitComplaint } from "@/lib/complaint-duration";

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

describe("objectiveComplaint", () => {
  it("writes a complaint as symptom – site × duration", () => {
    expect(objectiveComplaint("pain in the right upper abdomen since the last 10 days.")).toBe("Pain – RUQ × 10 days");
    expect(objectiveComplaint("pain abdomen in the right upper abdomen since the last 10 days")).toBe("Pain – RUQ × 10 days");
    expect(objectiveComplaint("right upper abdominal pain since 10 days")).toBe("Pain – RUQ × 10 days");
    expect(objectiveComplaint("fever since three days")).toBe("Fever × 3 days");
    expect(objectiveComplaint("Pain abdomen × 30 days")).toBe("Pain abdomen × 30 days");
    expect(objectiveComplaint("pain in the right knee for 2 weeks")).toBe("Pain – Rt knee × 2 weeks");
  });
  it("leaves narrative and duration-less lines alone", () => {
    expect(objectiveComplaint("Patient was apparently alright 10 days back when she developed pain in the right upper abdomen since 10 days")).toBeNull();
    expect(objectiveComplaint("pain in the right upper abdomen")).toBeNull();
    expect(objectiveComplaint("Jaundice")).toBeNull();
  });
});

describe("objectiveComplaint leaves drugs and jobs alone", () => {
  it("does not touch a drug line or a job", () => {
    expect(objectiveComplaint("Inj albumin for 5 days")).toBeNull();
    expect(objectiveComplaint("Repeat CBC for 3 days")).toBeNull();
    expect(objectiveComplaint("Inj Vitamin K 10 mg IM OD for 5 days")).toBeNull();
  });
});
