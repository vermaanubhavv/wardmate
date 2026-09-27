import { describe, it, expect } from "vitest";
import { toEngineInputs, type ObservationRow } from "../observations-adapter";

const ADM = "2026-01-10T00:00:00+05:30";
let n = 0;
const row = (o: Partial<ObservationRow>): ObservationRow => ({
  id: `o${n++}`,
  kind: "lab",
  label: "",
  value_text: null,
  value_num: null,
  unit: null,
  source_quote: "",
  recorded_at: "2026-01-10T06:00:00+05:30",
  ref_low: null,
  ref_high: null,
  ...o,
});

const facts = { ageYears: 64, sex: "male", admittedAt: ADM };

describe("observations adapter", () => {
  it("reads the ward's own charted vitals — BP as systolic and diastolic, PR as heart rate, SpO2", () => {
    const inputs = toEngineInputs(
      [
        row({ kind: "vital", label: "BP", value_text: "90/60", source_quote: "90/60" }),
        row({ kind: "vital", label: "PR", value_text: "124 /min", source_quote: "124 /min" }),
        row({ kind: "vital", label: "SpO2", value_text: "93% RA", source_quote: "93% RA" }),
      ],
      facts
    );
    expect(inputs.find((i) => i.key === "sbp")?.value).toBe(90);
    expect(inputs.find((i) => i.key === "dbp")?.value).toBe(60);
    expect(inputs.find((i) => i.key === "hr")?.value).toBe(124);
    expect(inputs.find((i) => i.key === "spo2")?.value).toBe(93);
  });

  it("does not read a per-rectal finding labelled PR as a pulse", () => {
    const inputs = toEngineInputs([row({ kind: "exam", label: "PR", value_text: "no mass, 2 cm above", source_quote: "PR no mass" })], facts);
    expect(inputs.find((i) => i.key === "hr")).toBeUndefined();
  });

  it("synthesises an age input at admission from the patient record", () => {
    const inputs = toEngineInputs([], facts);
    const age = inputs.find((i) => i.key === "age_years");
    expect(age?.value).toBe(64);
    expect(age?.at).toBe(ADM);
  });

  it("derives BUN from a recorded blood urea when BUN itself is absent", () => {
    const inputs = toEngineInputs([row({ label: "Blood urea", value_num: 60, unit: "mg/dL" })], facts);
    const bun = inputs.find((i) => i.key === "bun");
    expect(bun).toBeDefined();
    expect(bun?.value).toBeCloseTo(28, 0); // 60 * 0.4665
    expect(bun?.sourceQuote).toMatch(/derived from urea/);
  });

  it("carries a unit error through as unitError (→ unknown), not a wrong number", () => {
    const inputs = toEngineInputs([row({ label: "TLC", value_num: 11.2, unit: null })], facts);
    const wbc = inputs.find((i) => i.key === "wbc");
    expect(wbc?.value).toBeNull();
    expect(wbc?.unitError).toMatch(/ambiguous/);
  });

  it("only treats pleural effusion as evidence when the source looks like imaging", () => {
    const noImg = toEngineInputs([row({ kind: "exam", label: "chest", value_text: "?pleural effusion clinically", source_quote: "reduced air entry, ?pleural effusion" })], facts);
    expect(noImg.some((i) => i.key === "pleural_effusion")).toBe(false);

    const img = toEngineInputs([row({ kind: "lab", label: "CXR", value_text: "left pleural effusion", source_quote: "CXR: left pleural effusion" })], facts);
    expect(img.find((i) => i.key === "pleural_effusion")?.text).toBe("present");
  });

  it("maps GCS < 15 to an impaired-mental-status flag of 0", () => {
    const inputs = toEngineInputs([row({ kind: "exam", label: "GCS", value_text: "GCS 13", source_quote: "GCS E3V4M6 = 13" })], facts);
    const ms = inputs.find((i) => i.key === "mental_status");
    expect(ms?.value).toBe(0);
  });
});
