import { describe, it, expect } from "vitest";
import { actionForPatient } from "../tasks";

const COMBINED = "Send urine analysis; pregnancy test if applicable";

describe("actionForPatient", () => {
  it("drops the pregnancy test for a male patient", () => {
    expect(actionForPatient(COMBINED, { sex: "Male", ageYears: 29 })).toBe("Send urine analysis");
    expect(actionForPatient(COMBINED, { sex: "M", ageYears: null })).toBe("Send urine analysis");
  });

  it("drops it for a known age outside 12–55", () => {
    expect(actionForPatient(COMBINED, { sex: "Female", ageYears: 68 })).toBe("Send urine analysis");
  });

  it("keeps it for a woman of reproductive age, or when sex or age is not recorded", () => {
    expect(actionForPatient(COMBINED, { sex: "F", ageYears: 29 })).toBe(COMBINED);
    expect(actionForPatient(COMBINED, { sex: null, ageYears: 29 })).toBe(COMBINED);
    expect(actionForPatient(COMBINED, { sex: "Female", ageYears: null })).toBe(COMBINED);
  });

  it("leaves other actions alone", () => {
    expect(actionForPatient("Send CBC with differential and CRP", { sex: "Male", ageYears: 29 })).toBe(
      "Send CBC with differential and CRP"
    );
  });
});
