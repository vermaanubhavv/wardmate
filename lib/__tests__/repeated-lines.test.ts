import { describe, expect, it } from "vitest";
import { isDayCountLabel, repeatedLines } from "@/lib/patient-state";

const line = (label: string, value: string | null, at = "2026-09-30T04:00:00Z") => ({ label, value, at });

describe("repeatedLines", () => {
  it("keeps the fuller of two lines where one is inside the other", () => {
    expect(
      repeatedLines([line("P/A", "Soft, non-tender"), line("P/A", "Soft, Non-tender, Non-distended, Bowel sounds present")])
    ).toEqual(new Set([0]));
    expect(
      repeatedLines([line("Ceftriaxone", "Inj Ceftriaxone"), line("Injection", "Inj Ceftriaxone 1 g IV BD")])
    ).toEqual(new Set([0]));
  });

  it("keeps the latest of the same label", () => {
    expect(
      repeatedLines([line("Diagnosis", "cholelithiasis", "2026-09-29T04:00:00Z"), line("diagnosis ", "Cholelithiasis")])
    ).toEqual(new Set([0]));
  });

  it("does not let a negation swallow the finding it negates, or hide gaps or different findings", () => {
    expect(repeatedLines([line("Pallor", "pallor"), line("Pallor on exam", "no pallor")])).toEqual(new Set());
    expect(repeatedLines([line("Chest", "clear"), line("Wound", "clear and dry")])).toEqual(new Set());
    expect(repeatedLines([line("Drain", null), line("Drain output", "30 ml serous")])).toEqual(new Set());
  });
});

describe("isDayCountLabel", () => {
  it("recognises stored day counts only", () => {
    expect(isDayCountLabel("exam", "post-operative day")).toBe(true);
    expect(isDayCountLabel("note", "Post-op day")).toBe(true);
    expect(isDayCountLabel("day_number", "day")).toBe(true);
    expect(isDayCountLabel("plan", "drain removal on POD 3")).toBe(false);
  });
});
