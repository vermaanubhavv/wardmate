import { describe, it, expect } from "vitest";
import { scoringPriorityToUrgency } from "@/lib/urgency";

describe("scoringPriorityToUrgency", () => {
  it("maps the scoring engine's priority scale onto red/yellow/green", () => {
    expect(scoringPriorityToUrgency("urgent")).toBe("red");
    expect(scoringPriorityToUrgency("soon")).toBe("yellow");
    expect(scoringPriorityToUrgency("routine")).toBe("green");
  });
});
