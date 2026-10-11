import { describe, expect, it } from "vitest";
import { SPECIALTY_KEYS, getSpecialtyPack } from "@/lib/specialty";
import { shortLabel } from "@/lib/specialty/labels";

describe("shortLabel", () => {
  it("keeps general surgery as it always read", () => {
    expect(shortLabel(getSpecialtyPack("general_surgery"))).toBe("Gen. Surgery");
  });

  it("gives every department a non-empty short label", () => {
    for (const key of SPECIALTY_KEYS) {
      expect(shortLabel(getSpecialtyPack(key)).trim()).not.toBe("");
    }
  });
});
