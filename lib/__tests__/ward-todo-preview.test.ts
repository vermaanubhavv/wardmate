import { describe, it, expect } from "vitest";
import { buildWardTodoPreview, countWardOutstanding, scoringPriorityToUrgency } from "@/lib/ward-todo-preview";
import type { WardTask } from "@/lib/todo";
import type { ScoringTask } from "@/lib/scoring/read";

function wardTask(over: Partial<WardTask>): WardTask {
  return {
    id: "t1",
    patient_id: "p1",
    label: "Remove drain",
    value_text: null,
    source_quote: "remove the drain",
    urgency: "yellow",
    graded_at: null,
    recorded_at: "2026-09-19T05:00:00Z",
    patient: { display_name: "Mr. A. Verma", bed: "B2" },
    effective: "yellow",
    note: null,
    repeats: 0,
    ...over,
  };
}

function scoringTask(over: Partial<ScoringTask>): ScoringTask {
  return {
    id: "s1",
    patientId: "p2",
    action: "Send CBC, LFT, KFT, SE",
    reason: "Routine pancreatitis panel",
    priority: "urgent",
    responsibleRole: "resident",
    status: "suggested",
    dueAt: null,
    pathwayTitle: "Acute pancreatitis",
    ...over,
  };
}

const patients = [
  { id: "p1", bed: "B2", display_name: "Mr. A. Verma" },
  { id: "p2", bed: "B7", display_name: "Mrs. R. Iyer" },
];

describe("scoringPriorityToUrgency", () => {
  it("maps the scoring engine's priority scale onto red/yellow/green", () => {
    expect(scoringPriorityToUrgency("urgent")).toBe("red");
    expect(scoringPriorityToUrgency("soon")).toBe("yellow");
    expect(scoringPriorityToUrgency("routine")).toBe("green");
  });
});

describe("buildWardTodoPreview", () => {
  it("sorts red before yellow before green, across both sources", () => {
    const tasks = [wardTask({ id: "t-yellow", effective: "yellow" })];
    const scoringByPatient = new Map([["p2", [scoringTask({ id: "s-red", priority: "urgent" })]]]);

    const preview = buildWardTodoPreview(tasks, scoringByPatient, patients, 3);

    expect(preview.map((i) => i.id)).toEqual(["s-red", "t-yellow"]);
  });

  it("caps at the given limit", () => {
    const tasks = [
      wardTask({ id: "t1", effective: "red" }),
      wardTask({ id: "t2", effective: "red" }),
      wardTask({ id: "t3", effective: "yellow" }),
      wardTask({ id: "t4", effective: "green" }),
    ];
    const preview = buildWardTodoPreview(tasks, new Map(), patients, 3);
    expect(preview).toHaveLength(3);
  });

  it("carries the pathway title as suggestedBy for a scoring-engine item, and leaves it unset for a plan task", () => {
    const tasks = [wardTask({ id: "t1" })];
    const scoringByPatient = new Map([["p2", [scoringTask({ id: "s1", pathwayTitle: "HEART score" })]]]);
    const preview = buildWardTodoPreview(tasks, scoringByPatient, patients, 3);

    const scoringItem = preview.find((i) => i.id === "s1");
    const planItem = preview.find((i) => i.id === "t1");
    expect(scoringItem?.suggestedBy).toBe("HEART score");
    expect(planItem?.suggestedBy).toBeUndefined();
  });

  it("drops a scoring task whose patient isn't in the given patient list", () => {
    const scoringByPatient = new Map([["missing-patient", [scoringTask({})]]]);
    expect(buildWardTodoPreview([], scoringByPatient, patients, 3)).toHaveLength(0);
  });
});

describe("countWardOutstanding", () => {
  it("adds plan tasks and every scoring task across all patients", () => {
    const tasks = [wardTask({ id: "t1" }), wardTask({ id: "t2" })];
    const scoringByPatient = new Map([
      ["p1", [scoringTask({ id: "s1" }), scoringTask({ id: "s2" })]],
      ["p2", [scoringTask({ id: "s3" })]],
    ]);
    expect(countWardOutstanding(tasks, scoringByPatient)).toBe(5);
  });

  it("is zero when both sources are empty", () => {
    expect(countWardOutstanding([], new Map())).toBe(0);
  });
});
