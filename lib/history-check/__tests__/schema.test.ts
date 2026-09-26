import { describe, it, expect } from "vitest";
import { validateHistoryTree } from "../schema";
import { feverV1 } from "@/content/history-trees/fever.v1";
import { HISTORY_TREES } from "@/content/history-trees";

const clone = () => JSON.parse(JSON.stringify(feverV1)) as typeof feverV1;

describe("history tree schema", () => {
  it("accepts every registered tree", () => {
    for (const tree of HISTORY_TREES) {
      expect(validateHistoryTree(tree)).toEqual({ ok: true, issues: [] });
    }
  });

  it("rejects a duplicate slot id", () => {
    const t = clone();
    t.slots.push({ ...t.slots[0] });
    const res = validateHistoryTree(t);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /duplicate slot id/.test(i.message))).toBe(true);
  });

  it("rejects a slot with no terms — the validator could never accept a negative for it", () => {
    const t = clone();
    t.slots[3].terms = [];
    const res = validateHistoryTree(t);
    expect(res.issues.some((i) => /at least one term/.test(i.message))).toBe(true);
  });

  it("rejects a gap that is not phrased as a question", () => {
    const t = clone();
    t.slots[3].question = "Duration of fever";
    expect(validateHistoryTree(t).issues.some((i) => /phrased as a question/.test(i.message))).toBe(true);
  });

  it("rejects a gap that reads as an instruction", () => {
    const t = clone();
    t.slots[3].question = "Start antibiotics?";
    expect(validateHistoryTree(t).issues.some((i) => /instruction/.test(i.message))).toBe(true);
  });

  it("rejects doses and treatment advice anywhere in the clinical text", () => {
    const t = clone();
    t.slots[3].question = "Was paracetamol 500 mg given?";
    expect(validateHistoryTree(t).issues.some((i) => /treatment wording/.test(i.message))).toBe(true);

    const u = clone();
    u.differentials[0].name = "Dengue — give IV fluids";
    expect(validateHistoryTree(u).issues.some((i) => /treatment wording/.test(i.message))).toBe(true);
  });

  it("rejects a tree with no red flags", () => {
    const t = clone();
    t.slots = t.slots.filter((s) => s.group !== "red_flag");
    t.differentials = t.differentials.map((d) => ({
      ...d,
      pointers: d.pointers.filter((id) => t.slots.some((s) => s.id === id)),
      discriminators: d.discriminators.filter((id) => t.slots.some((s) => s.id === id)),
    }));
    expect(validateHistoryTree(t).issues.some((i) => /red_flag/.test(i.message))).toBe(true);
  });

  it("rejects a differential pointing at an unknown slot", () => {
    const t = clone();
    t.differentials[0].discriminators.push("tail_length");
    expect(validateHistoryTree(t).issues.some((i) => /unknown slot 'tail_length'/.test(i.message))).toBe(true);
  });

  it("rejects an output order naming an unknown slot, and a non-value duration slot", () => {
    const t = clone();
    t.output.hpiOrder.push("nope");
    expect(validateHistoryTree(t).issues.some((i) => /unknown slot 'nope'/.test(i.message))).toBe(true);

    const u = clone();
    u.output.durationSlot = "rash";
    expect(validateHistoryTree(u).issues.some((i) => /must be a value slot/.test(i.message))).toBe(true);
  });

  it("rejects a reviewed tree with no reviewer named", () => {
    const t = clone();
    t.reviewStatus = "reviewed";
    // Set explicitly rather than relying on the cloned fixture's own value — the fixture is a
    // shipped tree and is reviewed, so it already names a reviewer.
    t.reviewedBy = null;
    expect(validateHistoryTree(t).issues.some((i) => i.path === "$.reviewedBy")).toBe(true);
  });

  it("requires lowercase terms and triggers", () => {
    const t = clone();
    t.slots[0].terms.push("Attendant");
    t.triggers.push("Fever");
    const res = validateHistoryTree(t);
    expect(res.issues.filter((i) => /lowercase/.test(i.message)).length).toBe(2);
  });
});

describe("fever tree content", () => {
  it("is clinician-reviewed, carries no doses, and names its setting", () => {
    expect(feverV1.reviewStatus).toBe("reviewed");
    expect(feverV1.reviewedBy).toBeTruthy();
    expect(feverV1.setting).toMatch(/north India/);
    const text = JSON.stringify(feverV1);
    expect(text).not.toMatch(/\d+\s?(mg|ml|mcg)\b/i);
  });

  it("names the differentials the brief asks for", () => {
    const ids = feverV1.differentials.map((d) => d.id);
    for (const want of ["dengue", "enteric", "malaria", "scrub_typhus", "sepsis_pneumonia", "tuberculosis", "hepatitis", "uti", "post_op_fever"]) {
      expect(ids).toContain(want);
    }
  });

  it("gates post-operative fever on the patient being post-op", () => {
    expect(feverV1.differentials.find((d) => d.id === "post_op_fever")?.appliesWhen).toBe("post_op");
  });
});

describe("tier and teaching text", () => {
  it("accepts core/detailed tiers and refuses anything else", () => {
    const t = clone();
    t.slots[5].tier = "detailed";
    expect(validateHistoryTree(t).ok).toBe(true);
    (t.slots[5] as { tier: string }).tier = "advanced";
    expect(validateHistoryTree(t).issues.some((i) => /core or detailed/.test(i.message))).toBe(true);
  });

  it("accepts a reason to ask, and refuses teaching text that states a diagnosis or a treatment", () => {
    const t = clone();
    t.slots[5].teach = "Pain behind the eyes is asked about because it separates some viral fevers from others.";
    expect(validateHistoryTree(t).ok).toBe(true);
    t.slots[5].teach = "This is dengue until proven otherwise.";
    expect(validateHistoryTree(t).issues.some((i) => /must not state a diagnosis/.test(i.message))).toBe(true);
    t.slots[5].teach = "Start paracetamol 500 mg if present.";
    expect(validateHistoryTree(t).issues.some((i) => /treatment wording/.test(i.message))).toBe(true);
  });

  it("marks every red flag and HPI slot core in the fever tree", () => {
    for (const s of feverV1.slots) {
      if (s.group === "red_flag" || s.group === "hpi") expect(s.tier ?? "core").toBe("core");
    }
  });
});
