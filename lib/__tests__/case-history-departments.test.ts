import { describe, it, expect } from "vitest";
import { leadsFor, readField, writeField, splitFields } from "@/lib/case-history-departments";

describe("department prompts", () => {
  it("round-trips a prompt answer through the card's own text", () => {
    let t = "Previous LSCS 2023";
    t = writeField(t, "LMP", "12 Aug");
    expect(t).toBe("Previous LSCS 2023; LMP: 12 Aug");
    expect(readField(t, "LMP")).toBe("12 Aug");
    t = writeField(t, "LMP", "14 Aug");
    expect(readField(t, "lmp")).toBe("14 Aug");
    expect(writeField(t, "LMP", "")).toBe("Previous LSCS 2023");
    expect(readField("Previous LSCS 2023", "LMP")).toBe("");
  });

  it("splits answers out of the recorded lines and leaves the rest as said", () => {
    const { answers, rest } = splitFields(["G2P1L1; LMP: 12 Aug; EDD: 19 May"], ["LMP", "EDD", "Cycles"]);
    expect(answers).toEqual({ LMP: "12 Aug", EDD: "19 May" });
    expect(rest).toEqual(["G2P1L1"]);
  });

  it("gives every department a lead, and nothing to an unknown one", () => {
    expect(leadsFor("obstetrics_gynaecology")[0].key).toBe("obstetric");
    expect(leadsFor("psychiatry").map((l) => l.key)).toEqual(["personal", "family"]);
    expect(leadsFor("nonsense")).toEqual([]);
  });
});
