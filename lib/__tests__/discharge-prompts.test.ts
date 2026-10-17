import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { getSpecialtyPack } from "@/lib/specialty";
import {
  courseSystem,
  dischargePromptWordsFor,
  indicationSystem,
  investigationsSystem,
  NON_OPERATIVE,
  OPERATIVE,
} from "@/lib/specialty/discharge-prompts";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

describe("discharge prompts: one generic prompt, department words plugged in", () => {
  it("general surgery sends exactly the prompts it always has", () => {
    const w = dischargePromptWordsFor(getSpecialtyPack("general_surgery"));
    // Hashes of the prompts as they were in lib/discharge-ai.ts before the split.
    expect(sha(courseSystem(w))).toBe("b6d2667b7e9d71b09abb7a29a0eed0183fcced7eb84b7c20afebd0b88cbe6316");
    expect(sha(indicationSystem(w))).toBe("273147745fc129ae4168e5a9096d2206e1ad0c96d440cd19f871f29aa823cef3");
    expect(sha(investigationsSystem(w))).toBe("ca54a530c780724c7a99e5cb07db9534f78c5410ff3008fb7c22f0663cc89eda");
  });

  it("a department without words of its own gets the generic base for its clock", () => {
    expect(dischargePromptWordsFor(getSpecialtyPack("orthopaedics"))).toBe(OPERATIVE);
    expect(dischargePromptWordsFor(getSpecialtyPack("paediatrics"))).toBe(NON_OPERATIVE);
  });

  it("no non-surgical department's prompts carry general surgery's words", () => {
    for (const key of ["internal_medicine", "paediatrics", "pulmonary_medicine", "medical_oncology", "psychiatry"]) {
      const w = dischargePromptWordsFor(getSpecialtyPack(key));
      const all = courseSystem(w) + indicationSystem(w) + investigationsSystem(w);
      expect(all, key).not.toMatch(/general-surgery|lap chole|right iliac fossa|biliary|operation dates/);
    }
  });

  it("every department keeps the shared safety rules", () => {
    for (const key of ["general_surgery", "internal_medicine", "orthopaedics", "paediatrics"]) {
      const w = dischargePromptWordsFor(getSpecialtyPack(key));
      expect(courseSystem(w)).toContain("If the digest does not contain it, it did not happen.");
      expect(courseSystem(w)).toContain("do NOT pick one");
      expect(investigationsSystem(w)).toContain("A line you cannot ground in a given observation must not be produced.");
    }
  });

  it("a department's own rules are numbered on after the shared ones", () => {
    const course = courseSystem(dischargePromptWordsFor(getSpecialtyPack("internal_medicine")));
    expect(course).toMatch(/\n11\. Where the digest records how a deranged value/);
    expect(course).toContain("internal-medicine discharge summary");
  });
});
