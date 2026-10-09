import { describe, expect, it } from "vitest";
import { buildDischargeDocument } from "@/lib/discharge-render";
import { compileDischargeDraft } from "@/lib/discharge-compile";
import { oneOffContext } from "@/lib/discharge-oneoff";
import { derivePatientState } from "@/lib/patient-state";
import { generalPack, generalSurgeryPack, type SpecialtyPack } from "@/lib/specialty";

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

describe("red flags on a post-op summary", () => {
  function draftFor(surgeryDate: string | null, pack: SpecialtyPack = generalSurgeryPack) {
    const context = oneOffContext({ name: "Test Patient" }, ward, null, new Map(), [], derivePatientState([], null), [], pack);
    return compileDischargeDraft({ ...context, patient: { ...context.patient, surgery_date: surgeryDate } });
  }

  it("is switched on, with warnings, once the patient is operated", () => {
    const { redFlags } = draftFor("2026-09-28");
    expect(redFlags.included).toBe(true);
    expect(redFlags.items.length).toBeGreaterThan(0);
  });

  it("stays off for a patient never operated", () => {
    expect(draftFor(null).redFlags.included).toBe(false);
  });

  it("stays off on a unit that does not operate, even with an operation date", () => {
    expect(draftFor("2026-09-28", generalPack).redFlags.included).toBe(false);
  });

  it("heads the procedures section by whether the unit operates", () => {
    const docFor = (pack: SpecialtyPack) => {
      const context = oneOffContext({ name: "Test Patient" }, ward, null, new Map(), [], derivePatientState([], null), [], pack);
      return buildDischargeDocument(compileDischargeDraft(context), context);
    };
    expect(docFor(generalSurgeryPack).proceduresHeading).toBe("Operation / Procedures");
    expect(docFor(generalPack).proceduresHeading).toBe("Procedures");
  });
});
