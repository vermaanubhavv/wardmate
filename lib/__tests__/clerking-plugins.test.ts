import { describe, expect, it } from "vitest";
import {
  EXAM_CARD,
  alwaysShowsObstetricCard,
  clerkingExampleFor,
  clerkingFormatFor,
  examStepsFor,
  hopiAttrsFor,
  hopiTemplateIdFor,
  localExamHintFor,
} from "@/lib/specialty/clerking";
import { EXAM_SECTION_LABEL, sectionsForSpecialty, specialtyCardsFor } from "@/lib/case-history-sections";

describe("clerking plugins — surgery unchanged", () => {
  it("surgery walk, sections, wording and obstetric rule are exactly as before", () => {
    expect(examStepsFor("general_surgery")).toEqual(["piccle", "vitals", "abdomen", "chest", "local"]);
    expect(clerkingFormatFor("general_surgery").map((s) => s.title)).toContain("Other systems");
    expect(specialtyCardsFor("general_surgery")).toEqual({ history: [], exam: [] });
    const s = sectionsForSpecialty("general_surgery");
    for (const k of ["cvs", "cns", "mse", "skin", "onco_disease", "performance"]) expect(s).not.toContain(k);
    expect(localExamHintFor("general_surgery")).toMatch(/the lump, the hernia, the wound, the perianal region/);
    expect(clerkingExampleFor("general_surgery")).toMatch(/tender in the RIF/);
    expect(alwaysShowsObstetricCard("general_surgery")).toBe(false);
    expect(hopiTemplateIdFor("Fever", "general_surgery")).toBe("fever");
  });
  it("a recorded MSE is never hidden, even on surgery", () => {
    expect(examStepsFor("general_surgery", (id) => id === "mse")).toContain("mse");
  });
});

describe("clerking plugins — new exam cards", () => {
  it("psychiatry walks a mental status examination card and can file into it", () => {
    expect(examStepsFor("psychiatry")).toContain("mse");
    expect(clerkingFormatFor("psychiatry").map((s) => s.title)).toContain("Mental status examination");
    expect(sectionsForSpecialty("psychiatry")).toContain("mse");
    expect(EXAM_SECTION_LABEL.mse).toBe(EXAM_CARD.mse.label);
  });
  it("dermatology walks a skin card first and can file into it", () => {
    expect(examStepsFor("dermatology").slice(0, 3)).toEqual(["piccle", "vitals", "skin"]);
    expect(sectionsForSpecialty("dermatology")).toContain("skin");
    expect(EXAM_SECTION_LABEL.skin).toBe(EXAM_CARD.skin.label);
  });
  it("oncology walks CVS and CNS and keeps its own node / mucosa / performance cards", () => {
    expect(examStepsFor("medical_oncology")).toEqual(expect.arrayContaining(["cvs", "cns", "chest", "abdomen"]));
    expect(sectionsForSpecialty("medical_oncology")).toEqual(expect.arrayContaining(["cvs", "cns", "onco_nodes"]));
    expect(specialtyCardsFor("medical_oncology").history).toEqual([
      "onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity",
    ]);
    expect(specialtyCardsFor("medical_oncology").exam.slice(0, 3)).toEqual(["performance", "onco_nodes", "onco_mucosa_line"]);
  });
});

describe("clerking plugins — fever and obstetric", () => {
  it("paediatrics gets the medicine fever history; oncology adds chemotherapy prompts", () => {
    expect(hopiTemplateIdFor("Fever", "paediatrics")).toBe("fever_medicine");
    expect(hopiTemplateIdFor("Fever", "medical_oncology")).toBe("fever_oncology");
    const options = hopiAttrsFor("Fever", "medical_oncology").flatMap((a) => a.options);
    expect(options).toContain("Since last chemo cycle");
    expect(options).toContain("Chills / rigors with infusion");
    expect(options).not.toContain("No chills"); // prompts only — a denial is never a tap
  });
  it("only obstetrics always shows the obstetric card", () => {
    expect(alwaysShowsObstetricCard("obstetrics_gynaecology")).toBe(true);
    expect(alwaysShowsObstetricCard("internal_medicine")).toBe(false);
    expect(alwaysShowsObstetricCard(null)).toBe(false);
  });
});
