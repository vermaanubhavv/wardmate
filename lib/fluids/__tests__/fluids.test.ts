import { describe, it, expect } from "vitest";
import { CALCULATORS, runCalculator } from "@/lib/fluids/calc";
import { validateFluidTopic } from "@/lib/fluids/schema";
import { getFluidTopic, listFluidTopics } from "@/lib/fluids/topics";
import { turpSyndromeV1 } from "@/content/fluids/turp-syndrome.v1";

const clone = () => JSON.parse(JSON.stringify(turpSyndromeV1)) as typeof turpSyndromeV1;

describe("IV Fluid and Electrolyte Correction topics", () => {
  it("every shipped topic validates and only a named reviewer can mark one reviewed", () => {
    for (const t of listFluidTopics()) {
      expect(validateFluidTopic(t).ok, t.id).toBe(true);
      if (t.reviewStatus === "reviewed") expect(t.reviewedBy, t.id).toBeTruthy();
      else expect(t.reviewedBy, t.id).toBeNull();
      // Every number in a topic is the book's: each topic quotes at least one line with its page.
      expect(t.sections.some((s) => s.blocks.some((b) => b.kind === "quote")), `${t.id} quotes its source`).toBe(true);
    }
    expect(getFluidTopic("turp_syndrome")?.title).toBe("TURP syndrome");
    expect(getFluidTopic("nope")).toBeNull();
  });

  it("pins exactly which topics a clinician has signed off", () => {
    // Adding an id here is a claim that a named clinician read that topic. Nothing else is.
    expect(listFluidTopics().filter((t) => t.reviewStatus === "reviewed").map((t) => t.id).sort()).toEqual([
      "hypercalcaemia", "hyperkalaemia", "hypernatraemia", "hypocalcaemia", "hypokalaemia", "hyponatraemia",
    ]);
  });

  it("rejects a ragged table, an unknown calculator, a reviewed topic with no reviewer, and a missing source", () => {
    const ragged = clone();
    ragged.sections[1].blocks[0] = { kind: "table", columns: ["a", "b"], rows: [["only one"]] };
    expect(validateFluidTopic(ragged).issues.some((i) => i.message.includes("expected 2 cells"))).toBe(true);

    const badCalc = clone();
    badCalc.sections[0].blocks.push({ kind: "formula", name: "x", expression: "y", variables: [{ symbol: "y", meaning: "z" }], calc: "nope" as never });
    expect(validateFluidTopic(badCalc).issues.some((i) => i.message.includes("unknown calculator"))).toBe(true);

    const unsigned = clone();
    unsigned.reviewStatus = "reviewed";
    unsigned.reviewedBy = null;
    expect(validateFluidTopic(unsigned).issues.some((i) => i.path === "$.reviewedBy")).toBe(true);

    const unsourced = clone();
    unsourced.source = { chapters: [], pages: "" };
    expect(validateFluidTopic(unsourced).issues.some((i) => i.path === "$.source")).toBe(true);
  });
});

describe("calculators", () => {
  it("work the book's own examples", () => {
    // Parkland, 70 kg with 30% burn: 8.4 L in 24 h, 4.2 L in the first 8 h.
    expect(runCalculator("parkland", { weight: 70, tbsa: 30 })).toMatchObject({ value: 8400 });
    expect(runCalculator("parkland", { weight: 70, tbsa: 30 })?.note).toContain("4200 mL");
    // 70 kg adult: 60% water = 42 L.
    expect(runCalculator("tbw", { weight: 70, percent: 60 })).toMatchObject({ value: 42 });
    // Osmolality 2×140 + 90/18 + 14/2.8 = 290.
    expect(runCalculator("serum_osmolality", { na: 140, glucose: 90, bun: 14 })).toMatchObject({ value: 290 });
    expect(runCalculator("anion_gap", { na: 140, cl: 104, hco3: 24 })).toMatchObject({ value: 12 });
    expect(runCalculator("map", { sbp: 120, dbp: 80 })).toMatchObject({ value: 93.3 });
    // 100/50/20: 25 kg child = 1000 + 500 + 100 = 1600 mL/day.
    expect(runCalculator("holliday_segar", { weight: 25 })).toMatchObject({ value: 1600 });
    expect(runCalculator("daily_maintenance", { weight: 60 })).toMatchObject({ value: 1500 });
    // 1000 mL over 8 h with a 15-drop set = 31 drops/min.
    expect(runCalculator("drip_rate", { volume: 1000, hours: 8, dropFactor: 15 })).toMatchObject({ value: 31 });
    // Table 20.6: glucose 400, sodium 130 → 134.8; above 400 the factor is 2.4.
    expect(runCalculator("corrected_sodium_glucose", { na: 130, glucose: 400 })).toMatchObject({ value: 134.8 });
    expect(runCalculator("corrected_sodium_glucose", { na: 130, glucose: 600 })).toMatchObject({ value: 142 });
    // (125 − 115) × 30 L = 300 mEq, 600 mL of 3% saline.
    expect(runCalculator("sodium_requirement", { desired: 125, na: 115, tbw: 30 })).toMatchObject({ value: 300 });
    // 3% saline (513 mEq/L) into sodium 110, TBW 29 L: (513 − 110) / 30 = 13.4.
    expect(runCalculator("adrogue_madias", { infNa: 513, na: 110, tbw: 29 })).toMatchObject({ value: 13.4 });
    expect(runCalculator("free_water_deficit", { tbw: 42, na: 160 })).toMatchObject({ value: 6 });
    expect(runCalculator("corrected_calcium", { ca: 7.2, albumin: 2 })).toMatchObject({ value: 8.8 });
  });

  it("refuses an input outside its range or missing, rather than guessing", () => {
    expect(runCalculator("parkland", { weight: 70, tbsa: 0 })).toBeNull();
    expect(runCalculator("parkland", { weight: 70 })).toBeNull();
    expect(runCalculator("map", { sbp: 80, dbp: NaN })).toBeNull();
    for (const [k, c] of Object.entries(CALCULATORS)) {
      const inputs = Object.fromEntries(c.inputs.map((i) => [i.key, i.min]));
      expect(runCalculator(k as keyof typeof CALCULATORS, inputs), k).not.toBeNull();
    }
  });
});
