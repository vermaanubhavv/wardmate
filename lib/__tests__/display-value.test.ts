import { describe, expect, it } from "vitest";
import { displayLabel, displayValue, isUnreadable } from "../display-value";

describe("displayValue", () => {
  it("writes printed numbers the way a clinician would, without changing them", () => {
    expect(displayValue("15640.00")).toBe("15,640");
    expect(displayValue("9.80")).toBe("9.8");
    expect(displayValue("84.20")).toBe("84.2");
    expect(displayValue("0.50")).toBe("0.5");
    expect(displayValue(".5")).toBe("0.5");
    expect(displayValue("1500")).toBe("1500");
    expect(displayValue("250000")).toBe("2,50,000");
    expect(displayValue("1,23,456.70")).toBe("1,23,456.7");
    expect(displayValue("-2.50")).toBe("-2.5");
    expect(displayValue("140")).toBe("140");
  });

  it("never shows a malformed number as if it were one", () => {
    expect(displayValue(".2.14")).toBe("Unreadable");
    expect(displayValue("1..2")).toBe("Unreadable");
    expect(isUnreadable(".2.14")).toBe(true);
  });

  it("names a printed blank as absence", () => {
    expect(displayValue("--")).toBe("Not reported");
    expect(displayValue("—")).toBe("Not reported");
    expect(displayValue("NA")).toBe("Not reported");
    expect(displayValue(null)).toBe("Not reported");
    expect(isUnreadable("--")).toBe(true);
  });

  it("leaves everything that is not a plain number exactly as it was", () => {
    for (const v of ["120/80", "A febrile", "Passed", "2+", "Soft, non-tender", "Inj Ceftriaxone 1 g IV BD"]) {
      expect(displayValue(v)).toBe(v);
    }
    expect(isUnreadable("120/80")).toBe(false);
  });
});

describe("displayLabel", () => {
  it("puts every label in sentence case and leaves an author's capitals alone", () => {
    expect(displayLabel("oral intake")).toBe("Oral intake");
    expect(displayLabel("drain")).toBe("Drain");
    expect(displayLabel("P/A")).toBe("P/A");
    expect(displayLabel("Chest")).toBe("Chest");
    expect(displayLabel("PAC")).toBe("PAC");
  });
});
