import { describe, it, expect } from "vitest";
import { feverV1 } from "@/content/history-trees/fever.v1";
import { buildGapList } from "../gaps";
import { renderHistoryText } from "../render";
import { buildSources, type SlotResult } from "../sources";
import { applyResolutions, inputHash } from "../store";

const unaskedAll = (): SlotResult[] =>
  feverV1.slots.map((s) => ({ id: s.id, state: "unasked", evidence: null, value: null, conflict: null }));

function withStates(over: Record<string, Partial<SlotResult>>): SlotResult[] {
  return unaskedAll().map((s) => (over[s.id] ? { ...s, ...over[s.id] } : s));
}

const ev = (quote: string) => ({ quote, source: 0 });

describe("buildGapList", () => {
  it("lists every red flag first when nothing was asked, and no leading differential", () => {
    const g = buildGapList(feverV1, unaskedAll(), { postOp: false, mode: "ward" });
    expect(g.leading).toEqual([]);
    expect(g.bands[0].key).toBe("red_flag");
    expect(g.bands[0].gaps.map((x) => x.slot.id)).toEqual(feverV1.slots.filter((s) => s.group === "red_flag").map((s) => s.id));
    expect(g.bands[1].gaps).toEqual([]);
    expect(g.unasked).toBe(feverV1.slots.length);
  });

  it("orders discriminators by the leading differentials, without ever dropping a red flag", () => {
    const results = withStates({
      retro_orbital_pain: { state: "positive", evidence: ev("pain behind the eyes") },
      rash: { state: "positive", evidence: ev("rash") },
      headache: { state: "positive", evidence: ev("headache") },
    });
    const g = buildGapList(feverV1, results, { postOp: false, mode: "ward" });
    expect(g.leading[0].id).toBe("dengue");
    const red = g.bands[0].gaps.map((x) => x.slot.id);
    expect(red).toContain("neck_stiffness"); // anti-anchoring: still asked
    expect(red).toContain("altered_sensorium");
    const disc = g.bands[1].gaps.map((x) => x.slot.id);
    expect(disc).toContain("mosquito_exposure");
    expect(disc).not.toContain("retro_orbital_pain"); // answered
    expect(disc).not.toContain("bleeding"); // a red flag: already in band 1, never duplicated
    expect(g.bands[1].title).toMatch(/Dengue/);
  });

  it("answered slots are never gaps", () => {
    const results = withStates({ vomiting: { state: "negative", evidence: ev("no vomiting") } });
    const g = buildGapList(feverV1, results, { postOp: false, mode: "academic" });
    expect(g.bands.flatMap((b) => b.gaps).some((x) => x.slot.id === "vomiting")).toBe(false);
    expect(g.answered).toBe(1);
  });

  it("ward mode trims detailed-tier slots from bands 2 and 3 but never from red flags; academic shows all", () => {
    const ward = buildGapList(feverV1, unaskedAll(), { postOp: false, mode: "ward" });
    const academic = buildGapList(feverV1, unaskedAll(), { postOp: false, mode: "academic" });
    const wardIds = ward.bands[2].gaps.map((x) => x.slot.id);
    expect(wardIds).not.toContain("night_sweats");
    expect(academic.bands[2].gaps.map((x) => x.slot.id)).toContain("night_sweats");
    expect(ward.bands[0].gaps.length).toBe(academic.bands[0].gaps.length);
  });

  it("only considers post-operative fever for a post-op patient", () => {
    const results = withStates({ recent_surgery: { state: "positive", evidence: ev("operated") }, local_infection: { state: "positive", evidence: ev("wound") } });
    expect(buildGapList(feverV1, results, { postOp: false, mode: "ward" }).leading.map((l) => l.id)).not.toContain("post_op_fever");
    expect(buildGapList(feverV1, results, { postOp: true, mode: "ward" }).leading.map((l) => l.id)).toContain("post_op_fever");
  });
});

describe("renderHistoryText", () => {
  it("prints 'not recorded' for everything when nothing was dictated, and never a negative", () => {
    const t = renderHistoryText({ tree: feverV1, results: unaskedAll(), mode: "ward" });
    expect(t).toContain("Fever, duration not recorded");
    expect(t).toContain("Pertinent negatives: none recorded");
    expect(t).toContain("Pertinent positives: none recorded");
    expect(t).not.toMatch(/\bno [a-z]/); // no "no vomiting" style line anywhere
    expect(t).toContain("Not recorded (red flags):");
  });

  it("prints only the resident's own words, in long-case order, with numeric values marked unconfirmed", () => {
    const results = withStates({
      duration: { state: "positive", evidence: ev("since 5 days"), value: "since 5 days" },
      onset_mode: { state: "positive", evidence: ev("sudden"), value: "sudden onset" },
      chills_rigors: { state: "positive", evidence: ev("with chills") },
      headache: { state: "positive", evidence: ev("headache") },
      vomiting: { state: "negative", evidence: ev("no vomiting") },
      informant: { state: "positive", evidence: ev("attendant"), value: "attendant, wife" },
    });
    const t = renderHistoryText({
      tree: feverV1,
      results,
      mode: "ward",
      header: "SW-12 · Test · 40/M",
      background: [{ label: "Past history", lines: ["K/C/O diabetes"] }, { label: "Family history", lines: [] }],
    });
    const lines = t.split("\n");
    expect(lines[0]).toBe("SW-12 · Test · 40/M");
    expect(lines[1]).toBe("Fever x since 5 days (unconfirmed)");
    expect(lines[2]).toBe("Informant — informant: attendant, wife");
    expect(lines[3]).toMatch(/^HPI — Onset: not recorded; Mode of onset: sudden onset; Grade: not recorded; .*Chills and rigors: present/);
    expect(t).toContain("Pertinent positives: headache");
    expect(t).toContain("Pertinent negatives: no vomiting");
    expect(t).toContain("Past history: K/C/O diabetes");
    expect(t).not.toContain("Family history");
    // Long-case order: HPI before positives before negatives before background.
    expect(t.indexOf("HPI")).toBeLessThan(t.indexOf("Pertinent positives"));
    expect(t.indexOf("Pertinent negatives")).toBeLessThan(t.indexOf("Past history"));
  });

  it("flags conflicts instead of picking a side", () => {
    const results = withStates({ vomiting: { state: "negative", evidence: ev("no vomiting"), conflict: ev("vomiting twice") } });
    const t = renderHistoryText({ tree: feverV1, results, mode: "ward" });
    expect(t).toContain("Conflicting statements (resolve): vomiting");
    expect(t).not.toContain("Pertinent negatives: no vomiting");
  });

  it("academic mode lists everything not recorded", () => {
    const t = renderHistoryText({ tree: feverV1, results: unaskedAll(), mode: "academic" });
    expect(t).toMatch(/^Not recorded: /m);
    expect(t).toContain("night sweats");
  });
});

describe("store helpers (pure)", () => {
  it("hashes the exact source text, the entry, the tree version and the model", () => {
    const a = buildSources([{ id: "e1", source: "voice", transcript: "fever since 5 days", recorded_at: "2026-09-10T00:00:00Z", observations: [] }]);
    const b = buildSources([{ id: "e1", source: "voice", transcript: "fever since 5 days.", recorded_at: "2026-09-10T00:00:00Z", observations: [] }]);
    const c = buildSources([{ id: "e2", source: "voice", transcript: "fever since 5 days", recorded_at: "2026-09-10T00:00:00Z", observations: [] }]);
    const h = (s: typeof a, v = "1.0.0", m = "claude-sonnet-5") => inputHash("fever", v, m, s);
    expect(h(a)).toBe(h(a));
    expect(h(a)).not.toBe(h(b));
    expect(h(a)).not.toBe(h(c));
    expect(h(a)).not.toBe(h(a, "1.0.1"));
    expect(h(a)).not.toBe(h(a, "1.0.0", "claude-haiku-4-5"));
  });

  it("applies a resident's resolution as an explicit answer with no quote and no conflict", () => {
    const results = withStates({ vomiting: { state: "negative", evidence: ev("no vomiting"), conflict: ev("vomiting twice") } });
    const out = applyResolutions(results, { vomiting: { state: "positive", at: "2026-09-10T00:00:00Z", by: "u1" } });
    const v = out.find((s) => s.id === "vomiting")!;
    expect(v).toMatchObject({ state: "positive", evidence: null, conflict: null, resolved: true });
    expect(applyResolutions(results, null)).toBe(results);
  });

  it("buildSources drops empty entries and orders oldest first", () => {
    const s = buildSources([
      { id: "new", source: "voice", transcript: "later", recorded_at: "2026-09-11T00:00:00Z", observations: [] },
      { id: "empty", source: "voice", transcript: "   ", recorded_at: "2026-09-09T00:00:00Z", observations: [] },
      { id: "old", source: "manual", transcript: null, recorded_at: "2026-09-10T00:00:00Z", observations: [{ label: "x", value_text: "typed" }] },
    ]);
    expect(s.map((x) => [x.index, x.entryId, x.kind])).toEqual([[0, "old", "manual"], [1, "new", "voice"]]);
  });
});
