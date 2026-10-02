import { describe, expect, it } from "vitest";
import { clerkingFormatFor, examStepsFor, hopiTemplateIdFor } from "@/lib/specialty/clerking";

describe("hopiTemplateIdFor — complaint to HOPI template", () => {
  it.each([
    // the wrong-organ cases, on every unit
    ["Chest pain", "general_surgery", "chest_pain"],
    ["Chest pain", "internal_medicine", "chest_pain"],
    ["Joint pain", "internal_medicine", "joint_pain"],
    ["Swelling of legs", "internal_medicine", "oedema"],
    ["Swelling of legs", "medical_oncology", "oedema"],
    ["Decreased urine output", "internal_medicine", "decreased_urine"],
    ["Increased thirst and urination", "internal_medicine", "polyuria"],
    ["Breathlessness", "internal_medicine", "breathlessness"],
    ["Cough", "internal_medicine", "cough"],
    ["Coughing blood", "internal_medicine", "cough"],
    ["Palpitations", "internal_medicine", "palpitations"],
    ["Altered sensorium", "internal_medicine", "altered_sensorium"],
    ["Bone pain", "medical_oncology", "other_site_pain"],
    ["Back pain", "medical_oncology", "other_site_pain"],
    // medicine fever asks about rash and bleeding; surgery keeps its own
    ["Fever", "internal_medicine", "fever_medicine"],
    ["Fever with rash", "internal_medicine", "fever_medicine"],
    ["Fever", "general_surgery", "fever"],
    // surgery exactly as before
    ["Pain abdomen", "general_surgery", "abdominal_pain"],
    ["Pain in anus", "general_surgery", "abdominal_pain"],
    ["Groin swelling", "general_surgery", "lump"],
    ["Scrotal swelling", "general_surgery", "lump"],
    ["Lump", "general_surgery", "lump"],
    ["Burning micturition", "general_surgery", "dysuria"],
    ["Headache", "general_surgery", "headache"],
    ["Abdominal distension", "general_surgery", "distension"],
    ["Bleeding per rectum", "general_surgery", "pr_bleed"],
    ["Difficulty swallowing", "general_surgery", "generic"],
  ])("%s on %s → %s", (complaint, specialty, id) => {
    expect(hopiTemplateIdFor(complaint, specialty)).toBe(id);
  });

  it("an unknown or missing unit reads as surgery", () => {
    expect(hopiTemplateIdFor("Fever", null)).toBe("fever");
    expect(hopiTemplateIdFor("Fever", "nonsense")).toBe("fever");
  });
});

describe("examStepsFor", () => {
  it("surgery keeps its exact cards", () => {
    expect(examStepsFor("general_surgery")).toEqual(["piccle", "vitals", "abdomen", "chest", "local"]);
    expect(examStepsFor(undefined)).toEqual(["piccle", "vitals", "abdomen", "chest", "local"]);
  });
  it("medicine walks CVS and CNS and no local examination", () => {
    expect(examStepsFor("internal_medicine")).toEqual(["piccle", "vitals", "cvs", "chest", "abdomen", "cns"]);
  });
  it("a recorded local examination is never hidden", () => {
    expect(examStepsFor("internal_medicine", (id) => id === "local")).toContain("local");
  });
});

describe("clerkingFormatFor", () => {
  const titles = (s?: string) => clerkingFormatFor(s).map((f) => f.title);
  it("surgery reads exactly as before", () => {
    expect(titles("general_surgery")).toEqual([
      "Chief complaints", "History of present illness", "Past history", "Family history",
      "Medication history", "Surgical history", "Menstrual & obstetric history", "Personal history",
      "General examination", "Vitals", "Per abdomen", "Other systems", "Local examination",
      "Provisional diagnosis", "Plan",
    ]);
  });
  it("medicine lists CVS and CNS, no local examination", () => {
    const t = titles("internal_medicine");
    expect(t).toContain("Cardiovascular system");
    expect(t).toContain("Central nervous system");
    expect(t).not.toContain("Local examination");
    expect(t).not.toContain("Other systems");
  });
});
