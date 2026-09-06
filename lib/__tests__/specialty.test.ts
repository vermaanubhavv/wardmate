import { describe, it, expect } from "vitest";
import {
  getSpecialtyPack,
  generalSurgeryPack,
  medicalOncologyPack,
  internalMedicinePack,
  listSpecialties,
} from "@/lib/specialty";
import { buildSystemPrompt } from "@/lib/extract";
import { dayLabel } from "@/lib/patients";
import { evaluateTrigger, type TriggerContext } from "@/lib/checklist-triggers";
import { matchDischargeTemplateFor, listDischargeTemplatesFor } from "@/lib/specialty/discharge";
import { HISTORY_SECTION_LABEL, sectionsForSpecialty } from "@/lib/case-history-sections";
import { caseHistorySectionOf, summariseCaseHistory } from "@/lib/case-history";

const surgical = { post_op_day: 2, admission_day: 4 };
const preOp = { post_op_day: null, admission_day: 1 };

describe("getSpecialtyPack — degrade, don't crash", () => {
  it("returns surgery for anything unrecognised, missing or empty", () => {
    for (const input of [null, undefined, "", "  ", "orthopaedics", "GENERAL SURGERY!!"]) {
      expect(getSpecialtyPack(input as string | null).key).toBe("general_surgery");
    }
  });

  it("is case- and whitespace-insensitive about a real key", () => {
    expect(getSpecialtyPack("  Medical_Oncology ").key).toBe("medical_oncology");
    expect(getSpecialtyPack(" INTERNAL_MEDICINE ").key).toBe("internal_medicine");
  });

  it("offers every pack to the picker", () => {
    expect(listSpecialties().map((p) => p.key)).toEqual([
      "general_surgery",
      "medical_oncology",
      "internal_medicine",
    ]);
  });
});

describe("phase 0 is a no-op for a surgical unit", () => {
  it("day labels are exactly what they always were", () => {
    expect(dayLabel(surgical)).toBe("POD 2");
    expect(dayLabel(preOp)).toBe("Day 1");
    // Explicitly passing the surgery pack must be identical to passing nothing.
    expect(dayLabel(surgical, generalSurgeryPack)).toBe(dayLabel(surgical));
  });

  it("POD 0 is still POD 0, not falsy-collapsed to the admission day", () => {
    expect(dayLabel({ post_op_day: 0, admission_day: 3 })).toBe("POD 0");
  });

  it("the extraction prompt still opens as a surgical resident's note", () => {
    const prompt = buildSystemPrompt(generalSurgeryPack);
    expect(prompt.startsWith("You convert a surgical resident's spoken ward-round note")).toBe(true);
    // No specialty guidance is appended for surgery, so the prompt is unchanged end to end.
    expect(prompt).toBe(buildSystemPrompt());
  });

  it("chemotherapy fields on a surgical patient change nothing", () => {
    expect(dayLabel({ ...surgical, cycle_day: 3, cycle_number: 2 })).toBe("POD 2");
  });
});

describe("medical oncology counts by the cycle", () => {
  const p = medicalOncologyPack;

  it("names the cycle and the day within it", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 2, cycle_day: 3, cycle_number: 2 }).text)
      .toBe("C2 D3");
  });

  it("counts the cycle day from 1, not 0 — day 1 is the day the drugs go up", () => {
    const d = p.dayCount({ post_op_day: null, admission_day: 1, cycle_day: 1, cycle_number: 1 });
    expect(d).toEqual({ clock: "cycle", n: 1, text: "C1 D1" });
  });

  it("drops the cycle prefix when the cycle number was never recorded", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 5, cycle_day: 4 }).text).toBe("D4");
  });

  it("falls back to the hospital day when there is no active cycle", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 6 })).toEqual({
      clock: "admission",
      n: 6,
      text: "Day 6",
    });
  });

  it("an operation does NOT start the count — a chemoport is not POD 0", () => {
    // A medical oncology patient who had a port inserted still reads by cycle, never POD.
    expect(p.dayCount({ post_op_day: 0, admission_day: 3, cycle_day: 2, cycle_number: 4 }).text)
      .toBe("C4 D2");
    expect(p.dayCount({ post_op_day: 1, admission_day: 3 }).text).toBe("Day 3");
  });

  it("its extraction prompt keeps every shared safety rule and adds ward guidance", () => {
    const prompt = buildSystemPrompt(p);
    expect(prompt.startsWith("You convert a medical oncology resident's")).toBe(true);
    expect(prompt).toContain("Never output a clinical value that is not present in the transcript");
    expect(prompt).toContain("source_quote that is copied VERBATIM");
    expect(prompt).toContain("CHEMOTHERAPY CYCLE DAY");
  });

  it("offers no surgical scoring pathway", () => {
    expect(p.scoringKeys).toEqual([]);
    expect(generalSurgeryPack.scoringKeys).toContain("acute_pancreatitis");
  });

  it("has no OT notes slot", () => {
    expect(p.formatKinds).not.toContain("ot_notes");
    expect(generalSurgeryPack.formatKinds).toContain("ot_notes");
  });
});

describe("internal medicine counts by the hospital day", () => {
  const p = internalMedicinePack;

  it("always reads the admission day — never POD, never a cycle", () => {
    expect(p.dayCount({ post_op_day: null, admission_day: 3 })).toEqual({
      clock: "admission",
      n: 3,
      text: "Day 3",
    });
    // A bedside procedure (a tap, a line) must not flip a medicine patient to POD 0.
    expect(p.dayCount({ post_op_day: 0, admission_day: 4 }).text).toBe("Day 4");
    // Stray chemo fields (wrong-pack data) are ignored too.
    expect(p.dayCount({ post_op_day: null, admission_day: 5, cycle_day: 2, cycle_number: 1 }).text)
      .toBe("Day 5");
  });

  it("its extraction prompt is a physician's note and keeps every shared safety rule", () => {
    const prompt = buildSystemPrompt(p);
    expect(prompt.startsWith("You convert a physician's spoken ward-round note")).toBe(true);
    expect(prompt).toContain("Never output a clinical value that is not present in the transcript");
    expect(prompt).toContain("source_quote that is copied VERBATIM");
    expect(prompt).toContain("HOSPITAL DAY");
    expect(prompt).toContain("There is no post-op day on this ward");
  });

  it("offers its seven medicine scores and no surgical pathway, and no OT notes slot", () => {
    expect(p.scoringKeys).toEqual([
      "curb_65",
      "qsofa",
      "cha2ds2_vasc",
      "has_bled",
      "wells_dvt",
      "wells_pe",
      "dka_severity",
    ]);
    expect(p.scoringKeys).not.toContain("acute_pancreatitis");
    expect(p.formatKinds).not.toContain("ot_notes");
  });

  it("anchors its checklist on admission, not the operation", () => {
    expect(p.checklistAnchor).toBe("admission");
  });

  it("ships the generic discharge template until the unit's clinical read-through", () => {
    // MEDICINE_DISCHARGE_TEMPLATES is deliberately empty for the pilot — see the file header.
    expect(p.dischargeTemplates).toEqual([]);
    expect(listDischargeTemplatesFor(p).map((t) => t.key)).toEqual([p.genericDischargeTemplate.key]);
    expect(matchDischargeTemplateFor(p, { diagnosisText: "dengue fever with warning signs" })).toBeNull();
  });
});

describe("cycle-anchored checklist triggers", () => {
  const base: TriggerContext = {
    values: "",
    postOpDay: null,
    hoursSinceSurgery: null,
    hoursSinceAdmission: null,
    hasValue: () => false,
    labs: [],
  };

  it("cycle_day_gte fires only on an active cycle at or past the day", () => {
    const t = { when: [{ type: "cycle_day_gte" as const, days: 8 }] };
    expect(evaluateTrigger(t, { ...base, cycleDay: 8 }).active).toBe(true);
    expect(evaluateTrigger(t, { ...base, cycleDay: 7 }).active).toBe(false);
    expect(evaluateTrigger(t, base).active).toBe(false);
  });

  it("day_of_cycle means cycle day 1", () => {
    const t = { when: [{ type: "day_of_cycle" as const }] };
    expect(evaluateTrigger(t, { ...base, cycleDay: 1 }).active).toBe(true);
    expect(evaluateTrigger(t, { ...base, cycleDay: 2 }).active).toBe(false);
  });

  it("on_regimen needs a recorded regimen", () => {
    const t = { when: [{ type: "on_regimen" as const }] };
    expect(evaluateTrigger(t, { ...base, onRegimen: true }).active).toBe(true);
    expect(evaluateTrigger(t, { ...base, onRegimen: false }).active).toBe(false);
  });

  it("a surgical patient never trips a cycle condition", () => {
    const t = {
      when: [{ type: "cycle_day_gte" as const, days: 1 }, { type: "on_regimen" as const }],
    };
    expect(evaluateTrigger(t, { ...base, postOpDay: 3, hoursSinceSurgery: 72 }).active).toBe(false);
  });
});

describe("discharge templates follow the unit", () => {
  it("febrile neutropenia matches the oncology set, not the surgical one", () => {
    const onc = matchDischargeTemplateFor(medicalOncologyPack, {
      diagnosisText: "febrile neutropenia post chemotherapy",
    });
    expect(onc?.key).toBe("febrile_neutropenia");
    expect(
      matchDischargeTemplateFor(generalSurgeryPack, { diagnosisText: "febrile neutropenia" })
    ).toBeNull();
  });

  it("an operation matches the surgical set, not the oncology one", () => {
    expect(
      matchDischargeTemplateFor(generalSurgeryPack, { diagnosisText: "carcinoma breast for MRM" })
        ?.key
    ).toBe("breast_ca");
  });

  it("every oncology template goes home with the fever red flag", () => {
    const all = [
      ...medicalOncologyPack.dischargeTemplates,
      medicalOncologyPack.genericDischargeTemplate,
    ];
    expect(all.length).toBeGreaterThan(5);
    for (const t of all) {
      expect(t.scaffold.redFlags.some((r) => /100\.4|38 °C/.test(r))).toBe(true);
    }
  });

  it("a checklist family picks the matching oncology summary", () => {
    // What the ward list sets on a patient (care_templates.family, seeded by patch 0061) has
    // to reach the right discharge template even when nobody typed a diagnosis.
    expect(
      matchDischargeTemplateFor(medicalOncologyPack, { templateFamily: "febrile_neutropenia" })
        ?.key
    ).toBe("febrile_neutropenia");
    expect(
      matchDischargeTemplateFor(medicalOncologyPack, { templateFamily: "myeloma" })?.key
    ).toBe("myeloma");
  });

  it("each unit's checklist picker reads its own phase", () => {
    expect(generalSurgeryPack.pickerPhase).toBe("after_surgery");
    // A medical oncology patient never has an operation date, so phaseFor() computes
    // before_surgery for them — the picker has to offer the rows filed under it.
    expect(medicalOncologyPack.pickerPhase).toBe("before_surgery");
  });

  it("the picker lists the unit's own templates plus its generic fallback", () => {
    const keys = listDischargeTemplatesFor(medicalOncologyPack).map((t) => t.key);
    expect(keys).toContain("chemo_cycle");
    expect(keys).toContain("oncology_generic");
    expect(keys).not.toContain("breast_ca");
  });
});

describe("the oncology clerking card stack", () => {
  it("adds the four disease cards and performance status, in that order", () => {
    const onc = sectionsForSpecialty("medical_oncology");
    expect(onc).toEqual(
      expect.arrayContaining([
        "onco_disease",
        "onco_treatment",
        "onco_cycle",
        "onco_toxicity",
        "performance",
      ])
    );
    // The order they are walked in: the disease, what was given, what is running, the damage.
    const idx = (k: string) => onc.indexOf(k as (typeof onc)[number]);
    expect(idx("onco_disease")).toBeLessThan(idx("onco_treatment"));
    expect(idx("onco_treatment")).toBeLessThan(idx("onco_cycle"));
    expect(idx("onco_cycle")).toBeLessThan(idx("onco_toxicity"));
  });

  it("gives a surgical unit exactly the sections it always had", () => {
    const surgical = sectionsForSpecialty("general_surgery");
    for (const k of ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity", "performance"]) {
      expect(surgical).not.toContain(k);
    }
    expect(surgical).toContain("complaints");
    expect(surgical).toContain("abdomen");
  });

  it("an unknown or missing specialty gets the base set, never another unit's cards", () => {
    for (const key of [null, undefined, "", "cardiology"]) {
      expect(sectionsForSpecialty(key)).toEqual(sectionsForSpecialty("general_surgery"));
    }
  });

  it("every oncology section has somewhere to be stored", () => {
    for (const k of ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity", "performance"]) {
      expect(HISTORY_SECTION_LABEL[k]).toBeTruthy();
    }
  });

  it("the oncology sections read back out of the record they were written to", () => {
    // The label written by the workspace has to resolve to the card that shows it, or a saved
    // clerking would reappear as unfiled 'other'.
    expect(caseHistorySectionOf("oncological history")).toBe("onco_disease");
    expect(caseHistorySectionOf("treatment received")).toBe("onco_treatment");
    expect(caseHistorySectionOf("current cycle")).toBe("onco_cycle");
    expect(caseHistorySectionOf("toxicity since last cycle")).toBe("onco_toxicity");
    expect(caseHistorySectionOf("performance status")).toBe("performance");
  });

  it("none of them prints on a clerking that never filled them", () => {
    // alwaysShow is false for every oncology section, so a surgical case sheet does not grow
    // five "NR" lines it has no way to answer.
    const view = summariseCaseHistory([
      { id: "1", kind: "note", label: "chief complaints", value_text: "pain abdomen 2 days" },
    ]);
    const keys = view.sections.filter((s) => !s.hidden).map((s) => s.key);
    expect(keys).not.toContain("onco_disease");
    expect(keys).not.toContain("performance");
  });

  it("but does print once the oncology clerking has filled it", () => {
    const view = summariseCaseHistory([
      { id: "1", kind: "note", label: "oncological history", value_text: "Ca left breast, IDC grade 2, cT2N1M0" },
    ]);
    const disease = view.sections.find((s) => s.key === "onco_disease");
    expect(disease?.hidden).toBe(false);
    expect(disease?.lines[0].text).toContain("IDC grade 2");
  });
});

describe("the oncology examination cards", () => {
  it("adds a node survey and a mucosa/skin/line card after performance status", () => {
    const onc = sectionsForSpecialty("medical_oncology");
    expect(onc).toEqual(expect.arrayContaining(["onco_nodes", "onco_mucosa_line"]));
    const idx = (k: string) => onc.indexOf(k as (typeof onc)[number]);
    expect(idx("performance")).toBeLessThan(idx("onco_nodes"));
  });

  it("never reaches a non-oncology unit", () => {
    const surgical = sectionsForSpecialty("general_surgery");
    expect(surgical).not.toContain("onco_nodes");
    expect(surgical).not.toContain("onco_mucosa_line");
  });

  it("has a label to be stored under", () => {
    expect(HISTORY_SECTION_LABEL.onco_nodes).toBe("lymph node survey");
    expect(HISTORY_SECTION_LABEL.onco_mucosa_line).toBe("mucosa, skin and vascular access");
  });

  it("falls through to the generic exam bucket on the patient page, same as local examination", () => {
    // Neither label is in exam-summary.ts's SYSTEM_NAMES, so both print as-is rather than
    // being relabelled — the same path "local examination" already takes.
    const view = summariseCaseHistory([
      { id: "1", kind: "exam", label: "lymph node survey", value_text: "Cervical — enlarged, 1.5 cm" },
    ]);
    // Not one of the four HistorySection keys, so it comes back in `other` for the exam
    // summary to render, not silently dropped.
    expect(view.other.some((o) => o.label === "lymph node survey")).toBe(true);
  });
});
