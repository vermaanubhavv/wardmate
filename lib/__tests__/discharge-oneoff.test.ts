import { describe, expect, it } from "vitest";
import { getSpecialtyPack } from "@/lib/specialty";
import { derivePatientState } from "@/lib/patient-state";
import { buildOneOffDraft, NO_TEMPLATE, oneOffContext, type OneOffIdentity } from "@/lib/discharge-oneoff";
import { listDischargeTemplatesFor } from "@/lib/specialty/discharge";

// Synthetic only.
const ward = { id: "w-test", name: "Unit Alpha", letterhead: null };
const ctx = (identity: OneOffIdentity, specialty = "general_surgery") =>
  oneOffContext(identity, ward, null, new Map(), [], derivePatientState([], null), [], getSpecialtyPack(specialty));

describe("buildOneOffDraft", () => {
  it("the empty one-off draft invents nothing", () => {
    const { draft, template } = buildOneOffDraft(ctx({}), NO_TEMPLATE, {});
    expect(template).toBeNull();
    expect(draft.diagnoses).toEqual([]);
    expect(draft.procedures).toEqual([]);
    expect(draft.medications).toEqual([]);
    expect(draft.indicationForAdmission.text).toBe("");
    expect(draft.clinicalCourse.text).toBe("");
    expect(draft.advice.included).toBe(false);
    expect(Object.values(draft.conditionAtDischarge.vars).every((v) => v == null)).toBe(true);
    expect(draft.admission.unit).toBe("Unit Alpha");
  });

  it("NO_TEMPLATE wins even when the typed diagnosis would match one", () => {
    const identity = { name: "Test Patient", diagnosis: "Acute calculous cholecystitis" };
    expect(buildOneOffDraft(ctx(identity), NO_TEMPLATE, identity).template).toBeNull();
    expect(buildOneOffDraft(ctx(identity), null, identity).template).not.toBeNull();
  });

  it("a chosen template seeds every section with [ … ] blanks", () => {
    const pack = getSpecialtyPack("general_surgery");
    const key = listDischargeTemplatesFor(pack)[0].key;
    const { draft, template } = buildOneOffDraft(ctx({ name: "Test Patient" }), key, { name: "Test Patient" });
    expect(template?.key).toBe(key);
    expect(draft.indicationForAdmission.text).toMatch(/\[[^\]]*\]/);
    expect(draft.procedures.length).toBeGreaterThan(0);
    expect(draft.advice.included).toBe(true);
  });

  it("the checks follow the unit's profile, not the surgical default", () => {
    expect(buildOneOffDraft(ctx({}), NO_TEMPLATE, {}).checkContext.conditionMinimum).toBe(5);
    expect(buildOneOffDraft(ctx({}, "internal_medicine"), NO_TEMPLATE, {}).checkContext.conditionMinimum).toBe(4);
  });
});
