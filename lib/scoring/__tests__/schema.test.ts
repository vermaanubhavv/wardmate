import { describe, it, expect } from "vitest";
import { validatePathwayDefinition } from "../schema";
import { acutePancreatitisV1 } from "../definitions/acute-pancreatitis.v1";

const clone = () => JSON.parse(JSON.stringify(acutePancreatitisV1));

describe("pathway definition schema", () => {
  it("accepts the built-in acute pancreatitis definition", () => {
    expect(validatePathwayDefinition(acutePancreatitisV1)).toEqual({ ok: true, issues: [] });
  });

  it("rejects a duplicate component id", () => {
    const d = clone();
    d.cards[0].inputs.push({ ...d.cards[0].inputs[0] });
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /duplicate/i.test(i.message))).toBe(true);
  });

  it("rejects a component with no time window", () => {
    const d = clone();
    delete d.cards[0].inputs[0].window;
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /time window is mandatory/i.test(i.message))).toBe(true);
  });

  it("rejects an unknown operator", () => {
    const d = clone();
    d.cards[0].inputs[0].rule.op = "approximately";
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /operator must be one of/i.test(i.message))).toBe(true);
  });

  it("rejects an unsupported canonical unit", () => {
    const d = clone();
    d.cards[0].inputs[0].canonicalUnit = "furlongs";
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /unsupported canonical unit/i.test(i.message))).toBe(true);
  });

  it("rejects a checkpoint reference to an undefined checkpoint", () => {
    const d = clone();
    d.cards[0].lockedUntilCheckpoint = "nope";
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
  });

  it("rejects a task with no reason", () => {
    const d = clone();
    d.tasks[0].reason = "";
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /every task must be explainable/i.test(i.message))).toBe(true);
  });

  it("rejects a numeric operator without a threshold", () => {
    const d = clone();
    delete d.cards[0].inputs[0].rule.value;
    const res = validatePathwayDefinition(d);
    expect(res.ok).toBe(false);
  });
});
