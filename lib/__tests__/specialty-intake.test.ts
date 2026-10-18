import { describe, expect, it } from "vitest";
import { generalSurgeryPack, getSpecialtyPack } from "@/lib/specialty";
import { COMMON_DIAGNOSES, commonDiagnosesFor, hasOperationClock } from "@/lib/specialty/intake";
import { managementChoicesFor, managementLabel } from "@/lib/patients";

describe("per-unit intake data", () => {
  it("general surgery is unchanged", () => {
    expect(commonDiagnosesFor("general_surgery").slice(0, 5)).toEqual([
      "Cholelithiasis",
      "Acute appendicitis",
      "Acute calculous cholecystitis",
      "Inguinal hernia",
      "Fissure in ano",
    ]);
    expect(managementChoicesFor("general_surgery").map((c) => c.label)).toEqual([
      "Pre-op",
      "Conservative",
      "Workup",
      "Post-op",
    ]);
    expect(managementLabel({ surgery_date: "2026-01-01", management: null }, generalSurgeryPack)).toBe("POST OP");
    // No department has no operation clock, so no POST OP.
    expect(managementLabel({ surgery_date: "2026-01-01", management: null })).toBeNull();
    expect(managementLabel({ surgery_date: null, management: "conservative" }, generalSurgeryPack)).toBe("CONSERVATIVE");
  });

  it("medicine gets its own list and no operation choices", () => {
    expect(commonDiagnosesFor("internal_medicine")[0]).toBe("Dengue fever");
    expect(commonDiagnosesFor("internal_medicine")).not.toContain("Cholelithiasis");
    expect(managementChoicesFor("internal_medicine").map((c) => c.value)).toEqual(["conservative", "workup"]);
    expect(managementChoicesFor("internal_medicine")[0].label).toBe("On treatment");
    // A stored pre-op survives an edit.
    expect(managementChoicesFor("internal_medicine", "preop").map((c) => c.value)).toContain("preop");
    const im = getSpecialtyPack("internal_medicine");
    expect(managementLabel({ surgery_date: "2026-01-01", management: null }, im)).toBeNull();
    expect(managementLabel({ surgery_date: null, management: "conservative" }, im)).toBe("ON TREATMENT");
  });

  it("unknown keys fall back to the general list; non-surgical packs without a list get none", () => {
    expect(commonDiagnosesFor("not_a_unit")).toBe(commonDiagnosesFor("general"));
    expect(commonDiagnosesFor(undefined)).toBe(commonDiagnosesFor("general"));
    expect(commonDiagnosesFor("general")).not.toContain("Cholelithiasis");
    expect(commonDiagnosesFor("orthopaedics")).toBe(COMMON_DIAGNOSES);
    expect(commonDiagnosesFor("psychiatry")).toEqual([]);
    expect(commonDiagnosesFor("orthopaedics")).toBe(COMMON_DIAGNOSES);
    expect(hasOperationClock(getSpecialtyPack("medical_oncology"))).toBe(false);
    expect(hasOperationClock(getSpecialtyPack("burns_plastic_surgery"))).toBe(true);
  });
});
