import { describe, it, expect } from "vitest";
import { applyFixes, safeFix, sameFacts } from "@/lib/final-check";

// Synthetic text throughout — the shapes from the audited discharge summary, no patient data.
describe("final check: only mechanical edits survive", () => {
  it("applies the four safe kinds", () => {
    const { fields, fixes } = applyFixes(
      {
        proc: "Inscision and drainage",
        med: "metformin 500 mg 500 mg OD",
        exam: "soft , tender abdomen",
        advice: "Rest. [ Wound and lifting advice if operated. ] Keep hydrated.",
      },
      [
        { field: "proc", kind: "spelling", before: "Inscision", after: "Incision" },
        { field: "med", kind: "repeated_words", before: "500 mg 500 mg", after: "500 mg" },
        { field: "exam", kind: "punctuation", before: "soft , tender", after: "soft, tender" },
        { field: "advice", kind: "placeholder", before: "[ Wound and lifting advice if operated. ]", after: "" },
      ]
    );
    expect(fields).toEqual({
      proc: "Incision and drainage",
      med: "metformin 500 mg OD",
      exam: "soft, tender abdomen",
      advice: "Rest. Keep hydrated.",
    });
    expect(fixes).toHaveLength(4);
  });

  it("refuses edits that change meaning", () => {
    const t = "hypokalaemia, left side, 3.2 mm fluid, [illegible] word";
    expect(safeFix(t, { kind: "spelling", before: "hypokalaemia", after: "hyperkalaemia" })).toBe(false);
    expect(safeFix(t, { kind: "spelling", before: "left", after: "right" })).toBe(false);
    expect(safeFix(t, { kind: "punctuation", before: "3.2 mm", after: "32 mm" })).toBe(false);
    expect(safeFix(t, { kind: "placeholder", before: "[illegible]", after: "" })).toBe(false);
    expect(safeFix(t, { kind: "spelling", before: "not in text", after: "x" })).toBe(false);
    expect(safeFix(t, { kind: "rewrite", before: "left side", after: "right side" })).toBe(false);
  });

  it("turns month-first dates day-first, and only those", () => {
    const { fields, fixes } = applyFixes({ a: "done on 08/14/2026, seen 05/06/2026" }, []);
    expect(fields.a).toBe("done on 14/08/2026, seen 05/06/2026");
    expect(fixes).toEqual([{ field: "a", kind: "date_format", before: "08/14/2026", after: "14/08/2026" }]);
  });
});

describe("final check: rewording keeps the facts", () => {
  const before =
    "Patient was managed conservatively with IV analgesic IV antibiotic IV fluid and periodic, hemoglobin hematocrit and vitals. Monitoring Ortho opinion taken in view of right sided patella fracture and left-sided clavicular fracture";
  it("accepts a re-framed paragraph", () => {
    const after =
      "The patient was managed conservatively with intravenous analgesics, intravenous antibiotics and intravenous fluids, with periodic monitoring of haemoglobin, haematocrit and vitals. An orthopaedic opinion was taken in view of the right-sided patella fracture and the left-sided clavicular fracture.";
    expect(sameFacts(before, after)).toBe(true);
  });
  it("rejects a lost side, a changed number or an added negative", () => {
    expect(sameFacts(before, before.replace("left-sided", "the"))).toBe(false);
    expect(sameFacts("2nd-8th rib fractures", "2nd-9th rib fractures")).toBe(false);
    expect(sameFacts("tenderness present", "no tenderness present")).toBe(false);
  });
});
