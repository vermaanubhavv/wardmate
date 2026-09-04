import { describe, expect, it } from "vitest";
import { summariseObjective, type ExamValue } from "@/lib/exam-summary";

let n = 0;
const lab = (label: string, value: string): ExamValue => ({
  id: `l${n++}`,
  label,
  value,
  recordedAt: null,
});

describe("summariseObjective — lab prominence", () => {
  it("keeps a deranged minor index (MCV, AEC) off the face and behind the fold", () => {
    const s = summariseObjective([
      lab("Hb", "11.5"),
      lab("MCV", "104"),
      lab("absolute eosinophil count", "820"),
    ]);
    expect(s.labs.map((l) => l.label)).not.toContain("MCV");
    expect(s.labs.map((l) => l.label)).not.toContain("Eosinophils");
    const muted = s.mutedLabs.map((l) => l.label);
    expect(muted).toEqual(expect.arrayContaining(["MCV", "Eosinophils"]));
    expect(s.mutedLabs.find((l) => l.label === "MCV")?.outOfRange).toBe(true);
  });

  it("shows in-range CBC and KFT core lines, with potassium first", () => {
    const s = summariseObjective([
      lab("Hb", "14"),
      lab("Creatinine", "0.9"),
      lab("Sodium", "139"),
      lab("Potassium", "4.2"),
    ]);
    const key = s.keyLabs.map((l) => l.label);
    expect(key).toEqual(expect.arrayContaining(["Hb", "Creatinine", "Na", "K"]));
    expect(key[0]).toBe("K");
    expect(s.normalLabCount).toBe(0);
  });

  it("shows only the deranged part of an LFT, counts the normal parts", () => {
    const s = summariseObjective([
      lab("ALP", "240"),
      lab("SGPT", "30"),
      lab("SGOT", "28"),
      lab("Albumin", "4.1"),
    ]);
    expect(s.labs.map((l) => l.label)).toEqual(["ALP"]);
    expect(s.labs[0].flag).toBe("high");
    // the three in-range LFT components are folded into the count, not listed
    expect(s.normalLabCount).toBe(3);
    expect(s.keyLabs).toHaveLength(0);
  });

  it("for a gallstone patient, collapses the LFT to ALP and mutes the rest", () => {
    const s = summariseObjective(
      [
        lab("ALP", "90"),
        lab("SGPT", "120"),
        lab("T. bilirubin", "2.4"),
        lab("Albumin", "4.0"),
      ],
      { etiology: "biliary" }
    );
    // ALP in range but kept on the face because it is the watch-list analyte
    expect(s.keyLabs.map((l) => l.label)).toEqual(["ALP"]);
    // deranged SGPT and bilirubin are NOT foregrounded — behind the fold, with a count
    expect(s.labs).toHaveLength(0);
    const muted = s.mutedLabs.map((l) => l.label);
    expect(muted).toEqual(expect.arrayContaining(["SGPT", "T. bilirubin", "Albumin"]));
    expect(s.mutedLabs.filter((l) => l.outOfRange)).toHaveLength(2);
  });

  it("still foregrounds a deranged creatinine or potassium", () => {
    const s = summariseObjective([lab("Creatinine", "3.2"), lab("Potassium", "6.1")]);
    expect(s.labs.map((l) => l.label).sort()).toEqual(["Creatinine", "K"]);
    expect(s.labs.every((l) => l.flag)).toBe(true);
  });
});
