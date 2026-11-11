import { describe, expect, it } from "vitest";
import { nudgeSentence } from "@/lib/checklist-nudges";

describe("nudgeSentence", () => {
  it("reads as the round says it", () => {
    expect(nudgeSentence("POD 3", "Lap chole", ["Drain removal", "Suture removal"])).toBe("POD 3 Lap chole — drain removal, suture removal not documented");
  });
  it("leaves the operation out when there is none, and says nothing when nothing is missing", () => {
    expect(nudgeSentence("Day 2", null, ["Wound check"])).toBe("Day 2 — wound check not documented");
    expect(nudgeSentence("Day 2", null, [])).toBeNull();
  });
});
