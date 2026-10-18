import { describe, expect, it } from "vitest";
import { checkSummary, checkSummaryText } from "../handover";
import type { Observation } from "../patient-state";

const lab = (label: string, value_text: string, ref_low: number | null, ref_high: number | null, unit: string | null = null) =>
  ({ id: label, kind: "lab", label, value_text, unit, ref_low, ref_high, ref_text: null }) as unknown as Observation;

describe("checkSummary", () => {
  const pending = [
    lab("Haemoglobin", "9.80", 13, 18, "g/dl"),
    lab("Neutrophils", "84.20", 40, 80, "%"),
    lab("Monocytes", "3.40", 2, 10, "%"),
    lab("Platelet Count", ".2.14", 1.5, 4.5),
  ];

  it("names only what the report flagged, counts the rest, never shows an unreadable value", () => {
    const s = checkSummary(pending, "M");
    expect(s.total).toBe(4);
    expect(s.flagged).toEqual(["Haemoglobin 9.8 g/dl L", "Neutrophils 84.2 % H"]);
    expect(s.unreadable).toBe(1);
    expect(checkSummaryText(s)).toBe(
      "4 values to check — flagged: Haemoglobin 9.8 g/dl L, Neutrophils 84.2 % H — 1 unreadable"
    );
  });
});
