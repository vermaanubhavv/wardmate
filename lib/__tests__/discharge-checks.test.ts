import { describe, expect, it } from "vitest";
import { drainStillIn, nsaidConcerns, sectionsWithBlanks } from "@/lib/discharge-checks";

const d = (value_text: string, recorded_at: string) => ({ kind: "drain", label: "drain output", value_text, recorded_at });

describe("drainStillIn", () => {
  it("reads the latest drain line, not any line in the admission", () => {
    expect(drainStillIn([d("Pelvic drain 40 ml serous", "2026-09-16T04:00:00Z"), d("Drain removed", "2026-09-18T04:00:00Z")])).toBe(false);
    expect(drainStillIn([d("Drain removed", "2026-09-16T04:00:00Z"), d("Drain 20 ml serous", "2026-09-18T04:00:00Z")])).toBe(true);
  });
  it("never treats 'no drain' or no drain line at all as a drain in situ", () => {
    expect(drainStillIn([d("No drain", "2026-09-16T04:00:00Z")])).toBe(false);
    expect(drainStillIn([])).toBe(false);
  });
});

describe("sectionsWithBlanks", () => {
  it("names each section that still carries a [ … ] template blank, once", () => {
    expect(sectionsWithBlanks([["clinicalCourse", "Underwent [procedure] on [date]."], ["advice", "Keep the wound dry."], ["clinicalCourse", "[ x ]"]])).toEqual(["clinicalCourse"]);
    expect(sectionsWithBlanks([["advice", "Keep the wound dry."]])).toEqual([]);
  });
});

describe("nsaidConcerns", () => {
  const med = (generic: string, status = "new") => ({ generic, status });
  it("warns on an NSAID with a blood thinner, and after a perforation", () => {
    expect(nsaidConcerns([med("Diclofenac"), med("[ Enoxaparin — after resection for cancer ]")], [])).toHaveLength(1);
    expect(nsaidConcerns([med("Diclofenac")], [{ text: "Duodenal ulcer perforation" }])).toHaveLength(1);
  });
  it("stays quiet without an NSAID, or once the NSAID is stopped", () => {
    expect(nsaidConcerns([med("Paracetamol"), med("Enoxaparin")], [{ text: "Perforation" }])).toEqual([]);
    expect(nsaidConcerns([med("Diclofenac", "stopped"), med("Enoxaparin")], [])).toEqual([]);
  });
});
