import { describe, expect, it } from "vitest";
import { applyCorrections, wordsToDigits } from "@/lib/corrections";

const fix = (s: string) => applyCorrections(s).text;

describe("spoken numbers after anything charted as a number", () => {
  it("writes the BP the way the chart does", () => {
    expect(fix("BP is one twenty by eighty")).toBe("BP is 120/80");
    expect(fix("BP is one twenty by 80")).toBe("BP is 120/80");
    expect(fix("blood pressure one ten over seventy, pulse ninety two")).toBe("BP 110/70, pulse 92");
    expect(applyCorrections("BP one twenty by 80").changes).toContainEqual({ from: "one twenty by 80", to: "120/80" });
  });

  it("covers the other vitals, drains and power", () => {
    expect(fix("temperature ninety eight point six. SpO2 ninety eight percent on room air")).toBe(
      "temperature 98.6. SpO2 98 percent on room air"
    );
    expect(fix("pulse one oh five, RR twenty two, GCS fifteen by fifteen")).toBe("pulse 105, RR 22, GCS 15/15");
    expect(fix("drain output one hundred and twenty ml serous")).toBe("drain output 120 ml serous");
    expect(fix("power four by five in right upper limb, five upon five on the left")).toBe(
      "power 4/5 in right upper limb, 5/5 on the left"
    );
  });

  it("covers intake and output, and labs", () => {
    expect(fix("urine output eight hundred ml. RT output two hundred ml bilious")).toBe(
      "urine output 800 ml. RT output 200 ml bilious"
    );
    expect(fix("input two thousand five hundred and fifty ml")).toBe("input 2550 ml");
    expect(fix("intake fifteen hundred, UO six fifty")).toBe("intake 1500, UO 650");
    expect(fix("stoma output a thousand ml, ICD three hundred")).toBe("stoma output 1000 ml, ICD 300");
    expect(fix("Ryle's tube aspirate fifty ml, Hb nine point eight")).toBe("Ryle's tube aspirate 50 ml, Hb 9.8");
  });

  it("leaves numbers with no reading cue alone", () => {
    expect(fix("one twenty patients on the list. Abdomen soft")).toBe("one twenty patients on the list. Abdomen soft");
    expect(fix("pulse 88. one drain in situ")).toBe("pulse 88. one drain in situ");
  });

  it("parses the ward's spoken forms", () => {
    expect(wordsToDigits("one twenty five")).toBe("125");
    expect(wordsToDigits("a hundred")).toBe("100");
    expect(wordsToDigits("thirty seven point five")).toBe("37.5");
    expect(wordsToDigits("one twenty eighty")).toBe("120 80");
  });
});
