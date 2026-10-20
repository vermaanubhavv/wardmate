import { describe, expect, it } from "vitest";
import { antibioticDay, isAntibiotic, startForDay, withDay } from "@/lib/antibiotics";

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
