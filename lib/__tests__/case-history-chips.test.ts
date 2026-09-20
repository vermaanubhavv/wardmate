import { describe, it, expect } from "vitest";
import { complaintChipsFor, pastChipsFor } from "@/lib/case-history-chips";

describe("specialty-aware case-history chips", () => {
  it("gives each specialty its own complaint chip set", () => {
    const surgery = complaintChipsFor("general_surgery");
    const medicine = complaintChipsFor("internal_medicine");
    const oncology = complaintChipsFor("medical_oncology");

    expect(surgery).toContain("Pain abdomen");
    expect(medicine).toContain("Fever");
    expect(medicine).not.toEqual(surgery);
    expect(oncology).toContain("Mouth ulcers");
    expect(oncology).not.toEqual(surgery);
  });

  it("gives medicine and oncology their own past-history chip set, distinct from surgery's", () => {
    const surgery = pastChipsFor("general_surgery");
    const medicine = pastChipsFor("internal_medicine");
    expect(medicine).toContain("CVA / Stroke");
    expect(medicine).not.toEqual(surgery);
  });

  it("degrades to the surgical set for an unknown or missing specialty — same rule getSpecialtyPack() follows", () => {
    expect(complaintChipsFor("something_new")).toEqual(complaintChipsFor("general_surgery"));
    expect(complaintChipsFor(null)).toEqual(complaintChipsFor("general_surgery"));
    expect(complaintChipsFor(undefined)).toEqual(complaintChipsFor("general_surgery"));
    expect(pastChipsFor(undefined)).toEqual(pastChipsFor("general_surgery"));
  });
});
