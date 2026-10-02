import { describe, it, expect } from "vitest";
import { criticalFlag, criticalFlags, isDischargeable } from "@/lib/ward-flags";
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

describe("criticalFlags — per department, every hit", () => {
  const medicine = (over: Partial<WardPatient>) => criticalFlags(patient(over), "internal_medicine");

  it("leaves surgery exactly as it was: no electrolyte, glucose, RR or GCS alarms; TLC > 16,000", () => {
    const p = patient({
      vitals: [vital("RR", "34"), vital("GCS", "E1V2M3"), vital("GRBS", "52")],
      labs: [lab("K", "6.8"), lab("Na", "116"), lab("Creatinine", "5.2"), lab("TLC", "18200")],
    });
    for (const key of [undefined, null, "general_surgery", "orthopaedics"]) {
      expect(criticalFlags(p, key).map((f) => f.reason)).toEqual(["leucocytosis"]);
    }
  });

  it("flags K⁺ at either end on a medical ward", () => {
    expect(medicine({ labs: [lab("Potassium", "5.9")] })).toEqual([]);
    expect(medicine({ labs: [lab("Potassium", "6.4")] })[0]).toEqual({ label: "K⁺", value: "6.4", reason: "hyperkalaemia" });
    expect(medicine({ labs: [lab("S. potassium", "2.4")] })[0]?.reason).toBe("hypokalaemia");
    expect(criticalFlags(patient({ labs: [lab("K", "6.4")] }), "pulmonary_medicine")[0]?.label).toBe("K⁺");
  });

  it("flags Na⁺ ≤ 120 or ≥ 160 on a medical ward", () => {
    expect(medicine({ labs: [lab("Na", "121")] })).toEqual([]);
    expect(medicine({ labs: [lab("Sodium", "118 mmol/L")] })[0]?.reason).toBe("severe hyponatraemia");
    expect(medicine({ labs: [lab("Na", "162")] })[0]?.reason).toBe("severe hypernatraemia");
  });

  it("raises the TLC bar for medicine", () => {
    expect(medicine({ labs: [lab("TLC", "22000")] })).toEqual([]);
    expect(medicine({ labs: [lab("TLC", "34000")] })[0]?.reason).toBe("leucocytosis");
  });

  it("reads glucose, RR and GCS on a medical ward, and never flags creatinine alone", () => {
    expect(medicine({ vitals: [vital("GRBS", "54 mg/dL")] })[0]?.reason).toBe("hypoglycaemia");
    expect(medicine({ vitals: [vital("GRBS", "3.1 mmol/L")] })[0]?.reason).toBe("hypoglycaemia");
    expect(medicine({ labs: [lab("RBS", "450")] })[0]?.reason).toBe("severe hyperglycaemia");
    expect(medicine({ vitals: [vital("GRBS", "110")] })).toEqual([]);
    expect(medicine({ labs: [lab("Sr. creatinine", "6.2")] })).toEqual([]);
    expect(medicine({ vitals: [vital("RR", "30 /min")] })[0]?.reason).toBe("tachypnoea");
    expect(medicine({ vitals: [vital("GCS", "E2V2M4")] })[0]?.value).toBe("E2V2M4");
    expect(medicine({ vitals: [vital("GCS", "9/15")] })).toEqual([]);
    expect(medicine({ vitals: [vital("GCS", "E2VTM4")] })).toEqual([]);
  });

  it("returns every hit, worst first, and criticalFlag() is the first of them", () => {
    const p = patient({ vitals: [vital("SpO2", "86%")], labs: [lab("K", "6.4"), lab("Na", "118")] });
    expect(criticalFlags(p, "internal_medicine").map((f) => f.label)).toEqual(["SpO₂", "K⁺", "Na⁺"]);
    expect(criticalFlag(p, "internal_medicine")?.label).toBe("SpO₂");
    expect(criticalFlags(patient({ vitals: [vital("BP", "84/50")], labs: [lab("Hb", "4.2")] })).length).toBe(2);
  });
});

describe("isDischargeable — nothing critical, nothing outstanding", () => {
  it("is dischargeable with no flag, nothing unconfirmed, no open tasks", () => {
    expect(isDischargeable(patient({ unconfirmed_count: 0, open_task_count: 0 }), null)).toBe(true);
  });

  it("is not dischargeable when critically flagged, even with nothing else outstanding", () => {
    const flag = { label: "BP", value: "84/50", reason: "hypotension" };
    expect(isDischargeable(patient({ unconfirmed_count: 0, open_task_count: 0 }), flag)).toBe(false);
  });

  it("is not dischargeable with anything unconfirmed", () => {
    expect(isDischargeable(patient({ unconfirmed_count: 1, open_task_count: 0 }), null)).toBe(false);
  });

  it("is not dischargeable with an open task", () => {
    expect(isDischargeable(patient({ unconfirmed_count: 0, open_task_count: 1 }), null)).toBe(false);
  });
});
