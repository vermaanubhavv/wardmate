import { describe, expect, it } from "vitest";
import { buildDischargeDocument } from "@/lib/discharge-render";
import { compileDischargeDraft } from "@/lib/discharge-compile";
import { oneOffContext } from "@/lib/discharge-oneoff";
import { derivePatientState } from "@/lib/patient-state";

const ward = {
  id: "ward-1",
  name: "Unit 3",
  letterhead: "E.S.I.C. MEDICAL COLLEGE & HOSPITAL\nNH-3, N.I.T. FARIDABAD, HARYANA",
};

function buildDoc(isEsicFaridabad: boolean) {
  const context = oneOffContext(
    { name: "Ram Kumar" },
    ward,
    "https://example.com/logo.png",
    new Map(),
    [],
    derivePatientState([], null),
    [],
    undefined,
    isEsicFaridabad
  );
  const draft = compileDischargeDraft(context);
  return buildDischargeDocument(draft, context);
}

describe("buildDischargeDocument hospital branding", () => {
  it("prints the logo and letterhead for the ESIC Faridabad pilot", () => {
    const doc = buildDoc(true);
    expect(doc.logoUrl).toBe("https://example.com/logo.png");
    expect(doc.letterheadLines).toContain("E.S.I.C. MEDICAL COLLEGE & HOSPITAL");
    expect(doc.unitName).toBe("Unit 3");
  });

  it("drops the logo and letterhead for every other hospital, but keeps the unit name", () => {
    const doc = buildDoc(false);
    expect(doc.logoUrl).toBeNull();
    expect(doc.letterheadLines).toEqual([]);
    expect(doc.unitName).toBe("Unit 3");
  });
});
