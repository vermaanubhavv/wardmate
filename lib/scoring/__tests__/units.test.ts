import { describe, it, expect } from "vitest";
import { normalizeUnit } from "../units";

describe("unit normalisation", () => {
  it("BUN: mg/dL passes through, mmol/L converts, unitless accepted as mg/dL", () => {
    expect(normalizeUnit("bun", 25, "mg/dL")).toEqual({ ok: true, value: 25, unit: "mg/dL" });
    expect(normalizeUnit("bun", 9, "mmol/L")).toMatchObject({ ok: true, unit: "mg/dL" });
    expect(normalizeUnit("bun", 25, null)).toEqual({ ok: true, value: 25, unit: "mg/dL" });
  });

  it("creatinine: µmol/L converts to mg/dL", () => {
    const r = normalizeUnit("creatinine", 176.8, "umol/L");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(2.0, 1);
  });

  it("WBC: x10^9/L scales up; unitless is rejected as ambiguous, never guessed", () => {
    expect(normalizeUnit("wbc", 16.2, "x10^9/L")).toEqual({ ok: true, value: 16200, unit: "cells/mm3" });
    expect(normalizeUnit("wbc", 16200, "/cumm")).toEqual({ ok: true, value: 16200, unit: "cells/mm3" });
    const bad = normalizeUnit("wbc", 11.2, null);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.reason).toBe("ambiguous_unit");
  });

  it("glucose g/L is ambiguous and rejected", () => {
    const r = normalizeUnit("glucose", 2, "g/L");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("ambiguous_unit");
  });

  it("temperature Fahrenheit converts only when explicit", () => {
    const r = normalizeUnit("temp", 100.4, "F");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(38, 1);
  });

  it("haematocrit fraction converts to percent", () => {
    expect(normalizeUnit("hct", 0.45, "L/L")).toEqual({ ok: true, value: 45, unit: "%" });
  });

  it("PaO2 kPa converts to mmHg", () => {
    const r = normalizeUnit("pao2", 8, "kPa");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(60, 0);
  });

  it("an entirely unsupported unit is rejected, not coerced", () => {
    const r = normalizeUnit("ldh", 300, "banana");
    expect(r.ok).toBe(false);
  });
});
