import { describe, expect, it } from "vitest";
import { antibioticDay, courseLength, isAntibiotic, isCourse, startForDay, withDay } from "@/lib/antibiotics";

describe("isAntibiotic", () => {
  it("knows generics, stems and ward brand names", () => {
    for (const l of ["Inj Ceftriaxone 1 g IV BD", "Inj Piperacillin-tazobactam 4.5 g IV TDS", "Inj Metronidazole 500 mg IV TDS",
      "Tab Augmentin 625 mg BD", "Inj Meropenem 1 g IV TDS", "Tab Doxycycline 100 mg BD", "Inj Monocef 1 g", "Tab Co-trimoxazole DS BD"])
      expect(isAntibiotic(l), l).toBe(true);
  });
  it("leaves every other drug alone", () => {
    for (const l of ["Inj Pantoprazole 40 mg IV OD", "Inj Ondansetron 4 mg IV TDS", "Tab Paracetamol 650 mg SOS", "Tab Fluconazole 150 mg", "Inj Insulin regular"])
      expect(isAntibiotic(l), l).toBe(false);
  });
});

describe("antibiotic day", () => {
  it("counts the start date as Day 1, in calendar days", () => {
    expect(antibioticDay("2026-10-19", "2026-10-21T05:00:00Z")).toBe(3);
    expect(antibioticDay("2026-10-21", "2026-10-21")).toBe(1);
    expect(antibioticDay("2026-10-22", "2026-10-21")).toBeNull();
    expect(startForDay(3, "2026-10-21")).toBe("2026-10-19");
  });
  it("writes the day before, after, or not at all", () => {
    expect(withDay("Inj Ceftriaxone 1 g IV BD", 3, "after")).toBe("Inj Ceftriaxone 1 g IV BD (Day 3)");
    expect(withDay("Inj Ceftriaxone 1 g IV BD", 3, "before")).toBe("Day 3 – Inj Ceftriaxone 1 g IV BD");
    expect(withDay("Inj Ceftriaxone 1 g IV BD", 3, "off")).toBe("Inj Ceftriaxone 1 g IV BD");
  });
});

describe("timed drugs", () => {
  it("reads the course length written on the line, never guesses one", () => {
    expect(courseLength("Inj Vitamin K 10 mg IM OD for 5 days")).toBe(5);
    expect(courseLength("Tab Pantoprazole 40 mg OD x 14 days")).toBe(14);
    expect(courseLength("Tab Doxycycline 100 mg BD × 7 days")).toBe(7);
    expect(courseLength("Tab Fluconazole 150 mg OD 5/7")).toBe(5);
    expect(courseLength("Tab Iron 1 tab OD for 2 weeks")).toBe(14);
    expect(courseLength("Syp Lactulose 15 ml HS for five days")).toBe(5);
    expect(courseLength("Inj Pantoprazole 40 mg IV OD")).toBeNull();
  });
  it("counts any timed drug, and writes D2/5", () => {
    const vitK = "Inj Vitamin K 10 mg IM OD for 5 days";
    expect(isCourse(vitK)).toBe(true);
    expect(isAntibiotic(vitK)).toBe(false);
    expect(withDay(vitK, 1, "before")).toBe("D1/5 – Inj Vitamin K 10 mg IM OD for 5 days");
    expect(withDay(vitK, 2, "after")).toBe("Inj Vitamin K 10 mg IM OD for 5 days (D2/5)");
    expect(withDay("Inj Ceftriaxone 1 g IV BD for 7 days", 3, "after")).toBe("Inj Ceftriaxone 1 g IV BD for 7 days (D3/7)");
    expect(isCourse("Inj Pantoprazole 40 mg IV OD")).toBe(false);
  });
});

describe("albumin", () => {
  it("reads 'inj albumin for 5 days' as D1/5, and counts albumin with no length as Day N", () => {
    expect(withDay("inj albumin for 5 days", 1, "after")).toBe("inj albumin for 5 days (D1/5)");
    expect(isCourse("Inj Albumin 20% 100 ml IV OD")).toBe(true);
    expect(isAntibiotic("Inj Albumin 20% 100 ml IV OD")).toBe(false);
    expect(withDay("Inj Albumin 20% 100 ml IV OD", 2, "after")).toBe("Inj Albumin 20% 100 ml IV OD (Day 2)");
  });
});
