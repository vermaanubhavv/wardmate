import { describe, it, expect } from "vitest";
import { complaintChipsFor, pastChipsFor } from "@/lib/case-history-chips";

describe("specialty-aware case-history chips", () => {
  it("gives each specialty its own complaint chip set", () => {
    const surgery = complaintChipsFor("general_surgery");
    const medicine = complaintChipsFor("internal_medicine");
    const oncology = complaintChipsFor("medical_oncology");
    const obgyn = complaintChipsFor("obstetrics_gynaecology");

    expect(surgery).toContain("Pain abdomen");
    expect(medicine).toContain("Fever");
    expect(medicine).not.toEqual(surgery);
    expect(oncology).toContain("Mouth ulcers");
    expect(oncology).not.toEqual(surgery);
    expect(obgyn).toContain("Labour pains");
    expect(obgyn).not.toEqual(surgery);
    expect(obgyn).not.toEqual(medicine);
  });

  it("gives medicine, oncology and O&G their own past-history chip set, distinct from surgery's", () => {
    const surgery = pastChipsFor("general_surgery");
    const medicine = pastChipsFor("internal_medicine");
    const obgyn = pastChipsFor("obstetrics_gynaecology");
    expect(medicine).toContain("CVA / Stroke");
    expect(medicine).not.toEqual(surgery);
    expect(obgyn).toContain("PIH / pre-eclampsia (previous pregnancy)");
    expect(obgyn).not.toEqual(surgery);
    expect(obgyn).not.toEqual(medicine);
  });

  it("degrades to the surgical set for an unknown or missing specialty — same rule getSpecialtyPack() follows", () => {
    expect(complaintChipsFor("something_new")).toEqual(complaintChipsFor("general_surgery"));
    expect(complaintChipsFor(null)).toEqual(complaintChipsFor("general_surgery"));
    expect(complaintChipsFor(undefined)).toEqual(complaintChipsFor("general_surgery"));
    expect(pastChipsFor(undefined)).toEqual(pastChipsFor("general_surgery"));
  });
});
