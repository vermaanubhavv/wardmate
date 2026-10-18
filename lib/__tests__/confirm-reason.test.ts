import { describe, expect, it } from "vitest";
import { reasonFor } from "../confirm-queue";

describe("reasonFor", () => {
  it("says why each value is waiting, short enough for the card", () => {
    expect(reasonFor({ conflict_note: "Printing was unclear — check against the photo.", kind: "lab", source: "photo" })).toBe("Printing unclear");
    expect(reasonFor({ conflict_note: "Said 120/80 earlier today", kind: "vital", source: "voice" })).toBe("Said 120/80 earlier today");
    expect(reasonFor({ conflict_note: null, kind: "lab", source: "photo" })).toBe("Read off a photo");
    expect(reasonFor({ conflict_note: null, kind: "medication", source: "voice" })).toBe("Drug or dose");
    expect(reasonFor({ conflict_note: null, kind: "vital", source: "manual" })).toBe("Typed in");
    expect(reasonFor({ conflict_note: null, kind: "vital", source: "voice" })).toBe("Heard on the round");
  });
});
