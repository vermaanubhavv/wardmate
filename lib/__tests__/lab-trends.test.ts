import { describe, expect, it } from "vitest";
import { labTrends, sparklinePath } from "@/lib/lab-trends";

const lab = (label: string, value_text: string, recorded_at: string, value_num: number | null = null) => ({
  kind: "lab",
  label,
  value_text,
  value_num,
  unit: null,
  recorded_at,
});

describe("labTrends — one series per key lab, oldest first, numbers as recorded", () => {
  it("folds aliases onto one series and keeps the order of the key list", () => {
    const t = labTrends([
      lab("Creatinine", "1.4", "2026-11-03T04:00:00Z"),
      lab("Haemoglobin", "9.8", "2026-11-03T04:00:00Z"),
      lab("Hb", "11.2", "2026-11-01T04:00:00Z"),
      lab("hb%", "unreadable", "2026-11-02T04:00:00Z"),
      lab("MCV", "88", "2026-11-01T04:00:00Z"),
    ]);
    expect(t.map((s) => s.label)).toEqual(["Hb", "Creatinine"]);
    expect(t[0].points.map((p) => p.value)).toEqual([11.2, 9.8]);
  });
  it("uses the spoken number when extraction stored one", () => {
    expect(labTrends([lab("TLC", "eleven thousand", "2026-11-01T04:00:00Z", 11000)])[0].points[0].value).toBe(11000);
  });
});

describe("sparklinePath", () => {
  it("spans the box left to right and puts the highest value at the top", () => {
    const pts = [
      { at: "a", value: 10, text: "10", unit: null },
      { at: "b", value: 14, text: "14", unit: null },
      { at: "c", value: 12, text: "12", unit: null },
    ];
    expect(sparklinePath(pts, 60, 20)).toBe("2.0,18.0 30.0,2.0 58.0,10.0");
    expect(sparklinePath(pts.slice(0, 1), 60, 20)).toBe("");
  });
});
