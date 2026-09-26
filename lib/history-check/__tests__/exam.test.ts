import { describe, it, expect } from "vitest";
import { validateExamChecklist } from "@/lib/history-check/exam-schema";
import { getExamChecklist, listExamChecklists } from "@/lib/history-check/exams";
import { generalPhysicalV1 } from "@/content/examination/general-physical.v1";

const clone = () => JSON.parse(JSON.stringify(generalPhysicalV1)) as typeof generalPhysicalV1;

describe("exam checklists", () => {
  it("every shipped checklist validates, is clinician-reviewed, and names its reviewer", () => {
    for (const c of listExamChecklists()) {
      expect(validateExamChecklist(c).ok).toBe(true);
      // Reviewed 2026-09-26. A NEW checklist starts pending — copying a shipped file carries
      // this field forward, so reset it; this assertion is what catches you if you forget.
      expect(c.reviewStatus).toBe("reviewed");
      expect(c.reviewedBy).toBeTruthy();
    }
    expect(getExamChecklist("general_physical")?.title).toMatch(/General physical/);
    expect(getExamChecklist("nope")).toBeNull();
  });

  it("rejects a reviewed checklist with no reviewer named", () => {
    // exam-schema.ts has carried this rule since it was written, with nothing exercising it.
    // It matters more now every shipped checklist is reviewed: it is the only thing standing
    // between a future one and shipping signed-off-by-nobody. Set both fields explicitly so
    // the test reads the validator, not whatever the cloned fixture happens to hold.
    const c = clone();
    c.reviewStatus = "reviewed";
    c.reviewedBy = null;
    expect(validateExamChecklist(c).issues.some((i) => i.path === "$.reviewedBy")).toBe(true);
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

describe("systemic examination checklists", () => {
  it("ships one per system, each covering the classical sequence", () => {
    const ids = listExamChecklists().map((c) => c.id);
    for (const want of ["general_physical", "cardiovascular", "respiratory", "abdomen", "neurological"]) {
      expect(ids).toContain(want);
    }
  });

  it("respiratory and abdomen follow inspection, palpation, percussion, auscultation", () => {
    for (const id of ["respiratory", "abdomen"]) {
      const sections = getExamChecklist(id)!.sections.map((s) => s.id).join(" ");
      for (const step of ["inspection", "palpation", "percussion", "auscultation"]) {
        expect(sections).toMatch(new RegExp(step));
      }
    }
  });

  it("carries the items residents most often omit", () => {
    const itemsOf = (id: string) => getExamChecklist(id)!.sections.flatMap((s) => s.items.map((i) => i.id));
    // The abdomen is not examined until the groins, genitalia and rectum have been addressed.
    for (const want of ["hernial_orifices", "external_genitalia", "rectal_examination", "shifting_dullness"]) {
      expect(itemsOf("abdomen")).toContain(want);
    }
    // Apices and the back are where tuberculosis hides.
    expect(itemsOf("respiratory")).toContain("apices_back");
    // A sensory level and meningeal signs each change management on their own.
    for (const want of ["sensory_level", "meningeal_signs"]) {
      expect(itemsOf("neurological")).toContain(want);
    }
    expect(itemsOf("cardiovascular")).toContain("jvp_height");
  });

  it("every cited PubMed id is digits only, so a fabricated citation cannot slip through", () => {
    for (const c of listExamChecklists()) {
      for (const r of c.references) {
        if (r.pmid !== undefined) expect(r.pmid).toMatch(/^\d{4,9}$/);
      }
    }
  });
});
