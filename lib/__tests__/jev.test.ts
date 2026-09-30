import { describe, it, expect } from "vitest";
import type { ExtractedObservation } from "@/lib/extract";
import { applyJudgments } from "@/lib/jev-observations";
import { applyMeanings } from "@/lib/history-check/jev-check";
import type { CheckResult } from "@/lib/history-check/sources";
import { isActionableTask } from "@/lib/task-classification";
import { classifyTaskCategory } from "@/lib/task-category";

const sure = (choice: string, p = 0.95) => ({ choice, probabilities: { [choice]: p } });

function obs(kind: ExtractedObservation["kind"], value_text: string, needs_confirmation = false): ExtractedObservation {
  return {
    kind, label: kind, value_text, value_num: null, unit: null, source_quote: value_text,
    needs_confirmation, urgency: null, pac_verdict: null,
  };
}

describe("applyJudgments (ward dictation)", () => {
  it("turns an unsupported row amber and never turns an amber row green", () => {
    const rows = [obs("vital", "BP 110/70"), obs("vital", "pulse 88", true)];
    applyJudgments(rows, { supported_0: { noul: 0.1 }, supported_1: { noul: 0.99 } });
    expect(rows.map((r) => r.needs_confirmation)).toEqual([true, true]);
  });

  it("rescues a hidden plan and stores a confident category, plans only", () => {
    const rows = [obs("plan", "Continue IV antibiotics, repeat CBC tomorrow"), obs("vital", "BP 110/70")];
    applyJudgments(rows, {
      open_0: { noul: 0.9 },
      category_0: sure("sampling"),
      category_1: sure("radiology"),
    });
    expect(rows[0].task_open).toBe(true);
    expect(rows[0].task_category).toBe("sampling");
    expect(rows[1].task_category).toBeUndefined();
  });

  it("stores nothing on an unsure category or a no on open", () => {
    const rows = [obs("plan", "Continue same treatment")];
    applyJudgments(rows, { open_0: { noul: 0.2 }, category_0: sure("procedure", 0.4) });
    expect(rows[0].task_open).toBeUndefined();
    expect(rows[0].task_category).toBeUndefined();
  });
});

describe("readers", () => {
  it("a stored rescue shows a plan the keywords hide; nothing stored changes nothing", () => {
    expect(isActionableTask("Continue IV antibiotics, repeat CBC tomorrow")).toBe(false);
    expect(isActionableTask("Continue IV antibiotics, repeat CBC tomorrow", true)).toBe(true);
    expect(isActionableTask("", true)).toBe(false);
  });

  it("a stored category wins over keywords; 'other' means none; null falls back", () => {
    expect(classifyTaskCategory("Remove drain after USG", "radiology")).toBe("radiology");
    expect(classifyTaskCategory("Send blood culture", "other")).toBeNull();
    expect(classifyTaskCategory("Send blood culture", null)).toBe("sampling");
  });
});

describe("applyMeanings (history check)", () => {
  const run = (): CheckResult => ({
    slots: [
      { id: "vomiting", state: "positive", evidence: { quote: "no vomiting", source: 0 }, value: null, conflict: null },
      { id: "fever", state: "negative", evidence: { quote: "no fever", source: 0 }, value: null, conflict: null },
    ],
    rejections: [],
    wrongPatient: null,
  });

  it("downgrades a slot Jev confidently reads the other way, and records why", () => {
    const r = run();
    applyMeanings(r, [0, 1], { meaning_0: sure("denied"), meaning_1: sure("denied") });
    expect(r.slots.map((s) => s.state)).toEqual(["unasked", "negative"]);
    expect(r.rejections).toEqual([
      { slotId: "vomiting", claimed: "positive", becomes: "unasked", reason: "quote_means_otherwise", quote: "no vomiting" },
    ]);
  });

  it("leaves a slot alone when Jev is unsure or has no answer", () => {
    const r = run();
    applyMeanings(r, [0, 1], { meaning_0: sure("denied", 0.6) });
    expect(r.slots.map((s) => s.state)).toEqual(["positive", "negative"]);
  });
});
