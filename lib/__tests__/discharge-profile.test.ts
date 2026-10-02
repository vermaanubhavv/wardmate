import { describe, expect, it } from "vitest";
import { getSpecialtyPack, SPECIALTY_KEYS } from "@/lib/specialty";
import { dischargeProfileFor, MEDICINE_PROCEDURE_SUGGESTIONS } from "@/lib/specialty/discharge";
import { CONDITION_VARIABLES } from "@/lib/discharge-entities";
import { runDischargeChecks, type DischargeCheckContext } from "@/lib/discharge-checks";
import { buildConditionProse } from "@/lib/discharge-compile";

const NSAID = /diclofenac|ibuprofen|aceclofenac|naproxen|ketorolac|etoricoxib|piroxicam|mefenamic/i;

describe("dischargeProfileFor", () => {
  it("general surgery keeps its set, its operations and its five-of-nine rule exactly", () => {
    const p = dischargeProfileFor(getSpecialtyPack("general_surgery"));
    expect(p.operative).toBe(true);
    expect(p.specialtyLabel).toBe("General Surgery");
    expect(p.usualMedicationSet).toEqual([
      { generic: "Pantop", strength: "40 mg", dose: null, route: "Oral", frequency: "OD" },
      { generic: "Paracetamol", strength: "500 mg", dose: null, route: "Oral", frequency: "TDS" },
      { generic: "Ondansetron", strength: "4 mg", dose: null, route: "Oral", frequency: "OD" },
      { generic: "Diclofenac", strength: "50 mg", dose: null, route: "Oral", frequency: "SOS" },
      { generic: "MVI", strength: null, dose: "1 tablet", route: "Oral", frequency: "OD" },
    ]);
    expect(p.procedureSuggestions).toHaveLength(50);
    expect(p.procedureSuggestions[0]).toBe("Laparoscopic cholecystectomy");
    expect(p.conditionKeys).toEqual(CONDITION_VARIABLES.map((v) => v.key));
    expect(p.conditionMinimum).toBe(5);
  });

  it("an unknown specialty degrades to the surgical profile", () => {
    expect(dischargeProfileFor(getSpecialtyPack("nonsense"))).toEqual(
      dischargeProfileFor(getSpecialtyPack("general_surgery"))
    );
  });

  it("internal medicine offers a set with no NSAID, every dose explicit", () => {
    const p = dischargeProfileFor(getSpecialtyPack("internal_medicine"));
    expect(p.operative).toBe(false);
    expect(p.specialtyLabel).toBe("Internal Medicine");
    expect(p.usualMedicationSet.length).toBeGreaterThan(0);
    for (const m of p.usualMedicationSet) {
      expect(m.generic).not.toMatch(NSAID);
      expect(m.strength).toBeTruthy();
      expect(m.frequency).toBeTruthy();
    }
    expect(p.procedureSuggestions).toEqual(MEDICINE_PROCEDURE_SUGGESTIONS);
    expect(p.conditionKeys).not.toContain("wound");
    expect(p.conditionKeys).not.toContain("drain");
    expect(p.conditionKeys).not.toContain("bowel");
  });

  it("no non-operating unit is offered an NSAID; paediatrics gets no fixed-dose set", () => {
    for (const key of SPECIALTY_KEYS) {
      const p = dischargeProfileFor(getSpecialtyPack(key));
      if (p.operative) continue;
      expect(p.usualMedicationSet.some((m) => NSAID.test(m.generic))).toBe(false);
    }
    expect(dischargeProfileFor(getSpecialtyPack("paediatrics")).usualMedicationSet).toEqual([]);
  });
});

describe("condition-at-discharge minimum", () => {
  const draftWith = (vars: Record<string, true | null>) =>
    ({
      clinicalCourse: { text: "", uncertainPoints: [] },
      diagnoses: [],
      relevantInvestigations: { items: [] },
      medications: [],
      histopathology: [],
      advice: { items: [], included: false },
      primaryCareActions: [],
      patientActions: [],
      procedures: [],
      indicationForAdmission: { text: "" },
      authentication: { doctorName: null },
      conditionAtDischarge: { vars, prose: "", proseEdited: false, freeText: null },
    }) as unknown as Parameters<typeof runDischargeChecks>[0];
  const ctx = (min?: number): DischargeCheckContext => ({
    activeMedicationCount: 0,
    followUpInOpenTasks: false,
    drainInSituOnRecord: false,
    conditionMinimum: min,
  });
  const incomplete = (d: ReturnType<typeof draftWith>, c: DischargeCheckContext) =>
    runDischargeChecks(d, c).blocking.some((b) => b.id === "condition-incomplete");

  it("four medicine variables satisfy a medicine unit but not the surgical default", () => {
    const d = draftWith({ afebrile: true, spo2: true, oralIntake: true, sensorium: true });
    expect(incomplete(d, ctx(4))).toBe(false);
    expect(incomplete(d, ctx())).toBe(true);
  });

  it("medicine variables reach the prose", () => {
    expect(buildConditionProse({ afebrile: true, spo2: true } as never)).toBe(
      "Patient is afebrile and maintaining SpO₂ on room air."
    );
  });
});
