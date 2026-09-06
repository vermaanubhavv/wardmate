import { describe, expect, it } from "vitest";
import { classifyVital, isKnownVital, matchVitalLabel } from "@/lib/vital-ranges";

describe("matchVitalLabel — a chart's own words still count as a vital", () => {
  it("matches what a resident says", () => {
    expect(matchVitalLabel("BP")).toBe("bp");
    expect(matchVitalLabel("pulse")).toBe("pr");
    expect(matchVitalLabel("HR")).toBe("pr");
    expect(matchVitalLabel("temperature")).toBe("temp");
    expect(matchVitalLabel("SpO2")).toBe("spo2");
    expect(matchVitalLabel("respiratory rate")).toBe("rr");
  });

  it("matches what an obs chart prints, units and all", () => {
    expect(matchVitalLabel("Blood Pressure (mmHg)")).toBe("bp");
    expect(matchVitalLabel("Pulse/min")).toBe("pr");
    expect(matchVitalLabel("Pulse Rate (bpm)")).toBe("pr");
    expect(matchVitalLabel("Temp. °F")).toBe("temp");
    expect(matchVitalLabel("SpO2 %")).toBe("spo2");
    expect(matchVitalLabel("RR (per min)")).toBe("rr");
  });

  it("does not turn a lab result into a vital", () => {
    expect(matchVitalLabel("haemoglobin")).toBeNull();
    expect(matchVitalLabel("creatinine")).toBeNull();
    expect(matchVitalLabel("drain output")).toBeNull();
    expect(isKnownVital("SGPT")).toBe(false);
  });

  it("still classifies the value once the label is matched", () => {
    expect(classifyVital("Blood Pressure (mmHg)", "128/82")).toEqual([
      { label: "Systolic", value: "128", flag: null, range: "90–140" },
      { label: "Diastolic", value: "82", flag: null, range: "60–90" },
    ]);
    const temp = classifyVital("Temp. °F", "101.4");
    expect(temp[0].value).toBe("101.4°F");
    expect(temp[0].flag).toBe("high");
  });
});
