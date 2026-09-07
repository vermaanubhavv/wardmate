import { describe, it, expect } from "vitest";
import { criticalFlag } from "@/lib/ward-flags";
import type { WardPatient } from "@/lib/patients";

function patient(over: Partial<WardPatient>): WardPatient {
  return {
    id: "p1",
    display_name: "Test",
    age_years: 40,
    sex: "male",
    bed: "1",
    uhid_ip_no: null,
    mrd_no: null,
    primary_diagnosis: null,
    admitted_on: "2026-09-01",
    surgery_date: null,
    planned_surgery_date: null,
    post_op_day: null,
    admission_day: 1,
    last_entry_at: null,
    template_family: null,
    template_variant: null,
    procedure_text: null,
    management: null,
    location: "ward",
    unconfirmed_count: 0,
    open_task_count: 0,
    entry_count: 0,
    vitals: [],
    labs: [],
    ...over,
  };
}

const vital = (label: string, value_text: string) => ({ label, value_text, recorded_at: "2026-09-07T00:00:00Z" });
const lab = (label: string, value_text: string) => ({
  label,
  value_text,
  ref_low: null,
  ref_high: null,
  ref_text: null,
  recorded_at: "2026-09-07T00:00:00Z",
});

describe("criticalFlag — only genuinely critical findings", () => {
  it("does not flag mild derangements", () => {
    expect(
      criticalFlag(
        patient({
          vitals: [vital("PR", "108"), vital("BP", "150/95"), vital("SpO2", "93%")],
          labs: [lab("SGPT", "100"), lab("Absolute Eosinophil Count", "0.35"), lab("Hb", "10.2")],
        })
      )
    ).toBeNull();
  });

  it("PR 120 is not critical; PR 121 is", () => {
    expect(criticalFlag(patient({ vitals: [vital("PR", "120 /min")] }))).toBeNull();
    expect(criticalFlag(patient({ vitals: [vital("PR", "121 /min")] }))?.reason).toBe("tachycardia");
  });

  it("flags hypotension (SBP < 90) and hypoxia (SpO2 < 90)", () => {
    expect(criticalFlag(patient({ vitals: [vital("BP", "84/50")] }))?.reason).toBe("hypotension");
    expect(criticalFlag(patient({ vitals: [vital("SpO2", "88%")] }))?.reason).toBe("hypoxia");
  });

  it("flags WBC > 16000 across scales, not below", () => {
    expect(criticalFlag(patient({ labs: [lab("TLC", "15800")] }))).toBeNull();
    expect(criticalFlag(patient({ labs: [lab("TLC", "18200")] }))?.reason).toBe("leucocytosis");
    expect(criticalFlag(patient({ labs: [lab("Total Leucocyte Count", "17.4")] }))?.reason).toBe("leucocytosis");
  });

  it("flags platelets < 50000 across scales", () => {
    expect(criticalFlag(patient({ labs: [lab("Platelets", "60000")] }))).toBeNull();
    expect(criticalFlag(patient({ labs: [lab("Platelets", "42000")] }))?.reason).toBe("severe thrombocytopenia");
    expect(criticalFlag(patient({ labs: [lab("Platelet Count", "38")] }))?.reason).toBe("severe thrombocytopenia");
    expect(criticalFlag(patient({ labs: [lab("PLT", "0.3")] }))?.reason).toBe("severe thrombocytopenia");
  });

  it("flags Hb < 5", () => {
    expect(criticalFlag(patient({ labs: [lab("Hb", "6.1")] }))).toBeNull();
    expect(criticalFlag(patient({ labs: [lab("Hb", "4.2")] }))?.reason).toBe("severe anaemia");
  });

  it("flags an ICU / support entry, carrying its text", () => {
    const f = criticalFlag(patient({ vitals: [vital("ICU", "on noradrenaline 0.08")] }));
    expect(f).toEqual({ label: "ICU", value: "on noradrenaline 0.08", reason: "on ICU / organ support" });
    expect(criticalFlag(patient({ vitals: [vital("ICU", "yes")] }))?.value).toBe("");
    expect(criticalFlag(patient({ vitals: [vital("ICU", "")] }))).toBeNull();
  });

  it("falls back to the management text for vasopressors", () => {
    expect(criticalFlag(patient({ management: "POD 2, on noradrenaline, ventilated" }))?.reason).toBe(
      "vasopressor support"
    );
  });
});
