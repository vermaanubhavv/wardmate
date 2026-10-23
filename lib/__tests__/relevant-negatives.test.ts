import { describe, expect, it } from "vitest";
import { answerOf, negativeChecklist, setAnswer } from "@/lib/relevant-negatives";

describe("relevant negatives checklist", () => {
  it("offers the complaint tree's associated symptoms the HOPI has not covered", () => {
    const items = negativeChecklist(["Pain abdomen"], "RUQ, dull ache, fever with chills");
    expect(items).toContain("Jaundice / dark urine / pale stools");
    expect(items).toContain("Blood in vomit / black stools");
    expect(items).not.toContain("Fever");
  });
  it("writes one point per answer, reads it back, and clears on a second tap", () => {
    let t = setAnswer("", "Jaundice", "no");
    t = setAnswer(t, "Vomiting", "yes");
    expect(t).toBe("There is no history of jaundice.\nThere is history of vomiting.");
    expect(answerOf(t, "Jaundice")).toBe("no");
    t = setAnswer(t, "Jaundice", "yes");
    expect(t).toBe("There is history of vomiting.\nThere is history of jaundice.");
    expect(setAnswer(t, "Vomiting", "yes")).toBe("There is history of jaundice.");
    expect(answerOf("Typed by hand.", "Jaundice")).toBeNull();
  });
});
