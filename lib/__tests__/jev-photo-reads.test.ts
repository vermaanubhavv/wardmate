import { describe, it, expect, vi } from "vitest";
import type { ReadLabValue } from "@/lib/read-lab-photo";
import type { RegisterRow } from "@/lib/read-register";

// Jev stubbed: "supported" is no for anything whose value contains "WRONG", yes otherwise;
// every plan is rescued as an open sampling job.
vi.mock("@/lib/jev", () => ({
  chosenProbability: (a?: { choice?: string; probabilities?: Record<string, number> }) =>
    a?.choice ? (a.probabilities?.[a.choice] ?? 0) : 0,
  askJev: async (state: { observations: { value: string }[] }, questions: Record<string, unknown>) => {
    const answers: Record<string, unknown> = {};
    for (const id of Object.keys(questions)) {
      const i = Number(id.split("_").pop());
      if (id.startsWith("supported_")) answers[id] = { noul: state.observations[i].value.includes("WRONG") ? 0.1 : 0.9 };
      if (id.startsWith("open_")) answers[id] = { noul: 0.9 };
      if (id.startsWith("category_")) answers[id] = { choice: "sampling", probabilities: { sampling: 0.95 } };
    }
    return { answers, model: "stub" };
  },
}));

const { judgeLabValues, judgeRegisterRows } = await import("@/lib/jev-observations");

const lab = (value_text: string): ReadLabValue => ({
  label: "Haemoglobin", value_text, value_num: null, unit: null, category: "lab",
  source_quote: "Haemoglobin 11.2 gm% 13.0 - 17.0", uncertain: false, ref_low: null, ref_high: null, ref_text: null,
});

describe("judgeLabValues", () => {
  it("marks only the value its printed line does not support as uncertain", async () => {
    const values = [lab("11.2"), lab("13.0 WRONG")];
    await judgeLabValues(values);
    expect(values.map((v) => v.uncertain)).toEqual([false, true]);
  });
});

describe("judgeRegisterRows", () => {
  const row = (finding: string, plans: string[]): RegisterRow => ({
    name: "Test", bed: "4", source_quote: "Bed 4 POD 2 temp 100 F / continue antibiotics, repeat CBC",
    findings: [{ label: "temp", value_text: finding }], plans, uncertain: false,
  });

  it("flags a row with an unsupported finding and judges each plan in order", async () => {
    const rows = [row("100 F", ["continue antibiotics, repeat CBC"]), row("102 F WRONG", [])];
    await judgeRegisterRows(rows);
    expect(rows[0].uncertain).toBe(false);
    expect(rows[0].plan_judgments).toEqual([{ task_open: true, task_category: "sampling" }]);
    expect(rows[1].uncertain).toBe(true);
    expect(rows[1].plan_judgments).toEqual([]);
  });
});

describe("redactIdentifiers (what reaches Jev from a register row)", async () => {
  const { redactIdentifiers } = await import("@/lib/jev-observations");

  it("removes the name and a bed that follows 'bed', keeps the same digits as values", () => {
    expect(redactIdentifiers("Bed 4 Ramesh Kumar POD 2 temp 100 F, drain 40 ml, 4 hourly vitals", "Ramesh Kumar", "4")).toBe(
      "Bed [bed] [name] POD 2 temp 100 F, drain 40 ml, 4 hourly vitals"
    );
  });

  it("removes a lone part of the name and a ward-label bed anywhere", () => {
    expect(redactIdentifiers("SW-12 Sita: afebrile, remove drain. sita tolerating orals", "Sita Devi", "SW-12")).toBe(
      "[bed] [name]: afebrile, remove drain. [name] tolerating orals"
    );
  });

  it("leaves text with no name or bed alone", () => {
    expect(redactIdentifiers("abd soft, BS +", "", "")).toBe("abd soft, BS +");
  });
});

describe("judgeRegisterRows sends no name or bed", async () => {
  it("redacts the row before it leaves", async () => {
    const jev = await import("@/lib/jev");
    const spy = vi.spyOn(jev, "askJev");
    const { judgeRegisterRows } = await import("@/lib/jev-observations");
    await judgeRegisterRows([{ name: "Ramesh Kumar", bed: "4", source_quote: "Bed 4 Ramesh Kumar temp 100 F / repeat CBC",
      findings: [{ label: "temp", value_text: "100 F" }], plans: ["repeat CBC"], uncertain: false }]);
    const sent = JSON.stringify(spy.mock.calls.map((c) => c[0]));
    expect(sent).not.toMatch(/Ramesh|Kumar|Bed 4/);
    expect(sent).toContain("[name]");
  });
});
