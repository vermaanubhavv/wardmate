import { describe, it, expect } from "vitest";
import { buildWardTodoPreview, scoringPriorityToUrgency } from "@/lib/ward-todo-preview";
import type { WardTask } from "@/lib/todo";

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

describe("scoringPriorityToUrgency", () => {
  it("maps the scoring engine's priority scale onto red/yellow/green", () => {
    expect(scoringPriorityToUrgency("urgent")).toBe("red");
    expect(scoringPriorityToUrgency("soon")).toBe("yellow");
    expect(scoringPriorityToUrgency("routine")).toBe("green");
  });
});

describe("buildWardTodoPreview", () => {
  it("sorts red before yellow before green", () => {
    const tasks = [
      wardTask({ id: "t-green", effective: "green" }),
      wardTask({ id: "t-yellow", effective: "yellow" }),
      wardTask({ id: "t-red", effective: "red" }),
    ];
    expect(buildWardTodoPreview(tasks, 3).map((i) => i.id)).toEqual(["t-red", "t-yellow", "t-green"]);
  });

  it("caps at the given limit", () => {
    const tasks = [
      wardTask({ id: "t1", effective: "red" }),
      wardTask({ id: "t2", effective: "red" }),
      wardTask({ id: "t3", effective: "yellow" }),
      wardTask({ id: "t4", effective: "green" }),
    ];
    expect(buildWardTodoPreview(tasks, 3)).toHaveLength(3);
  });
});
