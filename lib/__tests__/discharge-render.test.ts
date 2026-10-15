import { describe, expect, it } from "vitest";
import { buildDischargeDocument, procedureLines } from "@/lib/discharge-render";
import { getSpecialtyPack } from "@/lib/specialty";
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

describe("red flags on a post-op summary", () => {
  function draftFor(surgeryDate: string | null) {
    const context = oneOffContext({ name: "Test Patient" }, ward, null, new Map(), [], derivePatientState([], null), []);
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

  it("stays off on a unit that does not operate, even with a leftover operation date", () => {
    const context = oneOffContext(
      { name: "Test Patient" }, ward, null, new Map(), [], derivePatientState([], null), [],
      getSpecialtyPack("internal_medicine")
    );
    const draft = compileDischargeDraft({ ...context, patient: { ...context.patient, surgery_date: "2026-09-28" } });
    expect(draft.redFlags.included).toBe(false);
  });
});

describe("procedures on a unit that does not operate", () => {
  const proc = (over: Partial<import("@/lib/discharge-entities").Procedure>) => ({
    id: "p", name: "", date: null, indication: null, anaesthesia: null, findings: null,
    drains: null, complications: null, outcome: null, source: "resident" as const, ...over,
  });
  function docFor(packKey: string, procedures: ReturnType<typeof proc>[]) {
    const context = oneOffContext(
      { name: "Test Patient" }, ward, null, new Map(), [], derivePatientState([], null), [],
      getSpecialtyPack(packKey)
    );
    return buildDischargeDocument({ ...compileDischargeDraft(context), procedures }, context);
  }

  it("prints one line — what, when, what it found — under 'Procedures'", () => {
    const doc = docFor("internal_medicine", [
      proc({ name: "Pleural tap", date: "2026-10-12", findings: "200 ml serous fluid drained" }),
    ]);
    expect(doc.proceduresHeading).toBe("Procedures");
    expect(procedureLines(doc.procedures[0], doc.proceduresBrief)).toEqual([
      "Pleural tap done on 12 Oct 2026 — 200 ml serous fluid drained",
    ]);
  });

  it("leaves the section off when no procedure was actually done", () => {
    expect(docFor("internal_medicine", []).procedures).toEqual([]);
    expect(docFor("internal_medicine", [proc({ name: "No procedure done" }), proc({ name: "  " })]).procedures).toEqual([]);
  });

  it("keeps surgery's 'Operation / Procedures' and its full lines", () => {
    const doc = docFor("general_surgery", [proc({ name: "Laparoscopic cholecystectomy", findings: "Gall bladder distended" })]);
    expect(doc.proceduresHeading).toBe("Operation / Procedures");
    expect(doc.proceduresBrief).toBe(false);
    expect(procedureLines(doc.procedures[0], doc.proceduresBrief)).toEqual([
      "Laparoscopic cholecystectomy",
      "  Significant findings: Gall bladder distended",
    ]);
  });
});
