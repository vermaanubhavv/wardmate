import { describe, it, expect } from "vitest";
import { criticalFlag, criticalFlags, isDischargeable, risingCreatinine } from "@/lib/ward-flags";
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
    // NEWS2: anything short of Alert (GCS below 15) is a 3-point parameter.
    expect(medicine({ vitals: [vital("GCS", "14/15")] })[0]?.reason).toBe("reduced consciousness");
    expect(medicine({ vitals: [vital("GCS", "15/15")] })).toEqual([]);
    expect(medicine({ vitals: [vital("RR", "25")] })[0]?.reason).toBe("tachypnoea");
    expect(medicine({ vitals: [vital("SpO2", "91")] })[0]?.reason).toBe("hypoxia");
    expect(criticalFlags(patient({ vitals: [vital("Pulse", "131")] }), "pulmonary_medicine")[0]?.reason).toBe("tachycardia");
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

describe("NICE vital-sign bars: emergency medicine, oncology, paediatrics", () => {
  const reasons = (key: string, over: Partial<WardPatient>) => criticalFlags(patient(over), key).map((f) => f.reason);
  const em = (...v: [string, string][]) => reasons("emergency_medicine", { vitals: v.map(([l, x]) => vital(l, x)) });

  it("flags a single NEWS2 parameter scoring 3 on emergency medicine (NG253 1.6.2)", () => {
    expect(em(["RR", "25"])).toEqual(["tachypnoea"]);
    expect(em(["RR", "24"])).toEqual([]);
    expect(em(["RR", "8"])).toEqual(["bradypnoea"]);
    expect(em(["SpO2", "91"])).toEqual(["hypoxia"]);
    expect(em(["SpO2", "92"])).toEqual([]);
    expect(em(["BP", "90/60"])).toEqual(["hypotension"]);
    expect(em(["BP", "91/60"])).toEqual([]);
    expect(em(["BP", "220/110"])).toEqual(["severe hypertension"]);
    expect(em(["Pulse", "131"])).toEqual(["tachycardia"]);
    expect(em(["Pulse", "130"])).toEqual([]);
    expect(em(["Pulse", "40"])).toEqual(["bradycardia"]);
    expect(em(["Temp", "35.0"])).toEqual(["hypothermia"]);
    expect(em(["Temp", "95"])).toEqual(["hypothermia"]); // °F
    expect(em(["Temp", "96.8"])).toEqual([]);
    expect(em(["GCS", "14"])).toEqual(["reduced consciousness"]);
    expect(em(["GCS", "15"])).toEqual([]);
  });

  it("flags neutropenia on oncology from an absolute count only (CG151 1.4.4.1)", () => {
    const onco = (label: string, value: string) => reasons("medical_oncology", { labs: [lab(label, value)] });
    expect(onco("ANC", "0.4")).toEqual(["severe neutropenia"]);
    expect(onco("Absolute neutrophil count", "450")).toEqual(["severe neutropenia"]);
    expect(onco("ANC", "600")).toEqual([]);
    expect(onco("Neutrophils", "0.3")).toEqual([]);
    expect(onco("ANC", "40%")).toEqual([]);
    expect(reasons("internal_medicine", { labs: [lab("ANC", "0.2")] })).toEqual([]);
  });

  it("uses NICE NG254 high-risk criteria by age on paediatrics", () => {
    const child = (age: number | null, ...v: [string, string][]) =>
      reasons("paediatrics", { age_years: age, vitals: v.map(([l, x]) => vital(l, x)) });
    expect(child(0, ["RR", "60"])).toEqual(["tachypnoea"]);
    expect(child(0, ["RR", "59"])).toEqual([]);
    expect(child(2, ["Pulse", "150"])).toEqual(["tachycardia"]);
    expect(child(2, ["Pulse", "149"])).toEqual([]);
    expect(child(4, ["Temp", "35.9"])).toEqual(["hypothermia"]);
    expect(child(6, ["Temp", "35.9"])).toEqual([]);
    expect(child(9, ["RR", "25"])).toEqual(["tachypnoea"]);
    expect(child(13, ["BP", "90/60"])).toEqual(["hypotension"]);
    expect(child(13, ["Pulse", "130"])).toEqual([]);
    expect(child(7, ["Pulse", "55"])).toEqual(["bradycardia"]);
    expect(child(null, ["RR", "70"])).toEqual([]);
    expect(child(null, ["SpO2", "89"])).toEqual(["hypoxia"]);
    expect(child(17, ["RR", "25"])).toEqual(["tachypnoea"]);
    // Adult lab bars do not transfer to children.
    expect(reasons("paediatrics", { age_years: 5, labs: [lab("TLC", "25000"), lab("K", "6.4")] })).toEqual([]);
  });

  it("leaves surgery's vital bar exactly as it was", () => {
    const s = (...v: [string, string][]) => reasons("general_surgery", { vitals: v.map(([l, x]) => vital(l, x)) });
    expect(s(["RR", "34"], ["Temp", "94"], ["BP", "230/120"], ["Pulse", "38"], ["SpO2", "91"])).toEqual([]);
    expect(s(["SpO2", "89"], ["BP", "88/50"], ["Pulse", "121"])).toEqual(["hypoxia", "hypotension", "tachycardia"]);
  });
});

describe("rising creatinine — NICE NG148 rec 1.3.1", () => {
  const at = (hoursAgo: number) => new Date(Date.parse("2026-10-15T08:00:00Z") - hoursAgo * 3600_000).toISOString();
  const cr = (value_text: string, hoursAgo: number) => ({ value_text, recorded_at: at(hoursAgo) });

  it("flags a rise of 26 micromol/L or more within 48 hours", () => {
    expect(risingCreatinine([cr("1.4", 0), cr("1.1", 24)])).toEqual({
      label: "Creatinine",
      value: "1.1 → 1.4",
      reason: "rising creatinine (AKI)",
    }); // 0.3 mg/dL = 26.5 micromol/L
    expect(risingCreatinine([cr("1.35", 0), cr("1.1", 24)])).toBeNull(); // 22 micromol/L
    expect(risingCreatinine([cr("126", 0), cr("100", 40)])?.value).toBe("100 → 126"); // micromol/L
    expect(risingCreatinine([cr("1.4", 0), cr("1.1", 60)])).toBeNull(); // > 48 h, < 50%
  });

  it("flags a 50% rise over the lowest result of the past 7 days", () => {
    expect(risingCreatinine([cr("1.5", 0), cr("1.3", 30), cr("1.0", 120)])?.value).toBe("1.0 → 1.5");
    expect(risingCreatinine([cr("1.4", 0), cr("1.0", 120)])).toBeNull(); // 40%
    expect(risingCreatinine([cr("2.0", 0), cr("1.0", 200)])).toBeNull(); // older than 7 days
  });

  it("never flags a falling or a single result, or a stable high one (known CKD)", () => {
    expect(risingCreatinine([cr("1.0", 0), cr("2.0", 24)])).toBeNull();
    expect(risingCreatinine([cr("4.2", 0)])).toBeNull();
    expect(risingCreatinine([cr("6.1", 0), cr("6.0", 24), cr("5.9", 72)])).toBeNull();
    expect(risingCreatinine([])).toBeNull();
  });

  it("is on for medical, emergency, oncology and paediatric units, not surgery", () => {
    const p = { creatinine_7d: [cr("1.5", 0), cr("1.0", 24)] };
    for (const key of ["internal_medicine", "pulmonary_medicine", "emergency_medicine", "medical_oncology", "paediatrics"]) {
      expect(criticalFlags(patient(p), key).map((f) => f.reason), key).toContain("rising creatinine (AKI)");
    }
    expect(criticalFlags(patient(p), "general_surgery")).toEqual([]);
  });
});
