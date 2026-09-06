import { describe, expect, it } from "vitest";
import { groupInvestigations, isInvestigation, panelOf } from "@/lib/investigations";
import type { Observation } from "@/lib/patient-state";

const obs = (over: Partial<Observation> & { label: string; recorded_at: string }): Observation => ({
  id: `${over.label}-${over.recorded_at}`,
  kind: "lab",
  value_text: "1",
  value_num: 1,
  unit: null,
  source_quote: "",
  needs_confirmation: false,
  confirmed_at: null,
  conflict_note: null,
  done_at: null,
  urgency: null as unknown as Observation["urgency"],
  graded_at: null,
  ...over,
});

describe("panelOf — a resident's name for what was sent", () => {
  it("gathers analytes into the panel they are sent as", () => {
    expect(panelOf(obs({ label: "haemoglobin", recorded_at: "2026-09-03T04:00:00Z" }))).toBe("CBC");
    expect(panelOf(obs({ label: "ALT", recorded_at: "2026-09-03T04:00:00Z" }))).toBe("LFT");
    expect(panelOf(obs({ label: "S. creatinine", recorded_at: "2026-09-03T04:00:00Z" }))).toBe("RFT");
    expect(panelOf(obs({ label: "serum lipase", recorded_at: "2026-09-03T04:00:00Z" }))).toBe(
      "Pancreatic enzymes"
    );
  });

  it("names imaging by its modality", () => {
    expect(panelOf(obs({ label: "USG abdomen", recorded_at: "2026-09-03T04:00:00Z" }))).toBe("USG");
    expect(panelOf(obs({ label: "CECT abdomen", recorded_at: "2026-09-03T04:00:00Z" }))).toBe("CT");
    expect(panelOf(obs({ label: "Chest X-ray", recorded_at: "2026-09-03T04:00:00Z" }))).toBe("X-ray");
  });

  it("never forces an unrecognised test into a panel", () => {
    expect(panelOf(obs({ label: "Procalcitonin", recorded_at: "2026-09-03T04:00:00Z" }))).toBe(
      "Other investigations"
    );
  });

  it("leaves things that are not investigations alone", () => {
    expect(isInvestigation(obs({ kind: "plan", label: "remove drain", recorded_at: "x" }))).toBe(false);
    expect(isInvestigation(obs({ kind: "vital", label: "BP", recorded_at: "x" }))).toBe(false);
  });
});

describe("groupInvestigations — one line per report", () => {
  const values = [
    obs({ label: "Hb", recorded_at: "2026-09-01T05:00:00Z" }),
    obs({ label: "TLC", recorded_at: "2026-09-01T05:00:00Z" }),
    obs({ label: "SGPT", recorded_at: "2026-09-01T05:01:00Z" }),
    obs({ label: "Hb", recorded_at: "2026-09-03T05:00:00Z" }),
    obs({ kind: "plan", label: "repeat CBC", recorded_at: "2026-09-03T05:00:00Z" }),
  ];

  it("folds a panel's analytes into one report and keeps the days apart", () => {
    const out = groupInvestigations(values);
    expect(out.map((r) => `${r.panel} ${r.day}`)).toEqual([
      "CBC 2026-09-03",
      "LFT 2026-09-01",
      "CBC 2026-09-01",
    ]);
    expect(out[2].values.map((v) => v.label)).toEqual(["Hb", "TLC"]);
  });

  it("does not swallow a plan that merely mentions a test", () => {
    const out = groupInvestigations(values);
    expect(out.flatMap((r) => r.values).some((v) => v.kind === "plan")).toBe(false);
  });

  it("flags a report still waiting to be confirmed against its photograph", () => {
    const out = groupInvestigations([
      obs({ label: "Hb", recorded_at: "2026-09-03T05:00:00Z", needs_confirmation: true }),
    ]);
    expect(out[0].needsConfirmation).toBe(true);
  });
});
