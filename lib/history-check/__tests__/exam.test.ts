import { describe, it, expect } from "vitest";
import { validateExamChecklist } from "@/lib/history-check/exam-schema";
import { getExamChecklist, listExamChecklists } from "@/lib/history-check/exams";
import { generalPhysicalV1 } from "@/content/examination/general-physical.v1";

const clone = () => JSON.parse(JSON.stringify(generalPhysicalV1)) as typeof generalPhysicalV1;

describe("exam checklists", () => {
  it("every shipped checklist validates and is pending review", () => {
    for (const c of listExamChecklists()) {
      expect(validateExamChecklist(c).ok).toBe(true);
      expect(c.reviewStatus).toBe("pending_clinician_review");
    }
    expect(getExamChecklist("general_physical")?.title).toMatch(/General physical/);
    expect(getExamChecklist("nope")).toBeNull();
  });

  it("general physical examination is comprehensive: PICCLE, vitals, hydration, hands, neck", () => {
    const ids = generalPhysicalV1.sections.flatMap((s) => s.items.map((i) => i.id));
    for (const want of ["pallor", "icterus", "cyanosis_central", "clubbing", "koilonychia", "lymph_nodes", "oedema", "pulse_rate", "bp", "resp_rate", "temperature", "spo2", "jvp", "thyroid", "neck_stiffness", "flapping_tremor"]) {
      expect(ids).toContain(want);
    }
    expect(ids.length).toBeGreaterThan(60);
  });

  it("every item explains how to elicit it and what it is seen in", () => {
    for (const s of generalPhysicalV1.sections) {
      for (const i of s.items) {
        expect(i.how.length).toBeGreaterThan(30);
        expect(i.significance.length).toBeGreaterThan(20);
      }
    }
  });

  it("rejects doses, diagnosis claims, duplicate ids and empty sections", () => {
    const a = clone();
    a.sections[0].items[0].how = "Give 500 mg paracetamol and check the temperature.";
    expect(validateExamChecklist(a).ok).toBe(false);

    const b = clone();
    b.sections[0].items[0].significance = "This is meningitis.";
    expect(validateExamChecklist(b).ok).toBe(false);

    const c = clone();
    c.sections[1].items[0].id = c.sections[0].items[0].id;
    expect(validateExamChecklist(c).issues.some((i) => /duplicate item/.test(i.message))).toBe(true);

    const e = clone();
    e.sections[0].items = [];
    expect(validateExamChecklist(e).ok).toBe(false);

    const f = clone();
    f.references = [];
    expect(validateExamChecklist(f).ok).toBe(false);
  });
});
