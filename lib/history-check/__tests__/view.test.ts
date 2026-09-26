import { describe, it, expect } from "vitest";
import { feverV1 } from "@/content/history-trees/fever.v1";
import { buildRunView } from "@/lib/history-check/view";
import type { HistoryCheckRun } from "@/lib/history-check/store";
import type { HistorySource, SlotResult } from "@/lib/history-check/sources";

const sources: HistorySource[] = [
  { index: 0, entryId: "e1", kind: "voice", recordedAt: "2026-09-10T08:00:00Z", text: "fever since 3 days, no headache, attendant says vomiting present" },
  { index: 1, entryId: "e2", kind: "manual", recordedAt: "2026-09-11T08:00:00Z", text: "patient says no vomiting" },
];

function slot(id: string, state: SlotResult["state"], extra: Partial<SlotResult> = {}): SlotResult {
  return { id, state, evidence: null, value: null, conflict: null, ...extra };
}

const okRun = (over: Partial<HistoryCheckRun> = {}): HistoryCheckRun => ({
  id: "run1",
  patient_id: "p1",
  tree_id: "fever",
  tree_version: "1.0.0",
  prompt_version: "1",
  model: "test",
  input_hash: "h",
  source_entry_ids: ["e1", "e2"],
  status: "ok",
  result: {
    slots: [
      slot("duration", "positive", { evidence: { quote: "fever since 3 days", source: 0 }, value: "3 days" }),
      slot("headache", "negative", { evidence: { quote: "no headache", source: 0 } }),
      slot("vomiting", "positive", { evidence: { quote: "vomiting present", source: 0 }, conflict: { quote: "no vomiting", source: 1 } }),
    ],
    rejections: [{ slotId: "rash", claimed: "negative", becomes: "unasked", reason: "no_negation_in_quote", quote: "rash" }],
    wrongPatient: null,
  },
  usage: null,
  cost_usd: 0.01,
  error: null,
  resolutions: {},
  created_at: "2026-09-11T09:00:00Z",
  ...over,
});

describe("buildRunView", () => {
  it("lists answered slots with quotes and source labels, marks numerics unconfirmed", () => {
    const v = buildRunView(feverV1, okRun(), sources, { postOp: false });
    const dur = v.answered.find((a) => a.slotId === "duration")!;
    expect(dur.unconfirmed).toBe(true);
    expect(dur.quote?.quote).toBe("fever since 3 days");
    expect(dur.quote?.source).toMatch(/^Voice · /);
    const hd = v.answered.find((a) => a.slotId === "headache")!;
    expect(hd.state).toBe("negative");
    expect(v.rejected).toBe(1);
  });

  it("keeps a conflicting slot out of answered and out of the text until resolved", () => {
    const v = buildRunView(feverV1, okRun(), sources, { postOp: false });
    expect(v.conflicts.map((c) => c.slotId)).toEqual(["vomiting"]);
    expect(v.conflicts[0].second.source).toMatch(/^Typed · /);
    expect(v.answered.some((a) => a.slotId === "vomiting")).toBe(false);
    expect(v.ward.text).not.toMatch(/Vomiting/);
    expect(v.ward.bands.flatMap((b) => b.gaps).some((g) => g.slotId === "vomiting")).toBe(true);
  });

  it("applies a resident's resolution and drops the conflict", () => {
    const run = okRun({ resolutions: { vomiting: { state: "negative", at: "2026-09-11T10:00:00Z", by: "u1" } } });
    const v = buildRunView(feverV1, run, sources, { postOp: false });
    expect(v.conflicts).toEqual([]);
    const vom = v.answered.find((a) => a.slotId === "vomiting")!;
    expect(vom.state).toBe("negative");
    expect(vom.resolved).toBe(true);
    expect(vom.quote).toBeNull();
  });

  it("ward mode hides detailed-tier gaps, academic shows them with teaching lines and red flags in both", () => {
    const tree = JSON.parse(JSON.stringify(feverV1)) as typeof feverV1;
    tree.slots.find((s) => s.id === "neck_stiffness")!.teach = "Asked because meningeal irritation can hide behind any fever.";
    const v = buildRunView(tree, okRun(), sources, { postOp: false });
    const wardIds = new Set(v.ward.bands.flatMap((b) => b.gaps.map((g) => g.slotId)));
    const acadIds = new Set(v.academic.bands.flatMap((b) => b.gaps.map((g) => g.slotId)));
    for (const s of feverV1.slots.filter((s) => s.group === "red_flag")) {
      expect(wardIds.has(s.id)).toBe(true);
      expect(acadIds.has(s.id)).toBe(true);
    }
    const detailed = feverV1.slots.filter((s) => s.tier === "detailed" && s.group !== "red_flag");
    expect(detailed.length).toBeGreaterThan(0);
    expect(detailed.some((s) => wardIds.has(s.id))).toBe(false);
    expect(detailed.every((s) => acadIds.has(s.id))).toBe(true);
    expect(v.academic.bands.flatMap((b) => b.gaps).some((g) => g.teach)).toBe(true);
    expect(v.ward.bands.flatMap((b) => b.gaps).every((g) => g.teach === null)).toBe(true);
  });

  it("an error run carries the error and nothing else", () => {
    const v = buildRunView(feverV1, okRun({ status: "error", result: null, error: "boom" }), sources, { postOp: false });
    expect(v.status).toBe("error");
    expect(v.error).toBe("boom");
    expect(v.answered).toEqual([]);
    expect(v.ward.bands).toEqual([]);
  });

  it("surfaces a wrong-patient flag and its dismissal", () => {
    const run = okRun();
    run.result!.wrongPatient = { quote: "patient says no vomiting", source: 1 };
    expect(buildRunView(feverV1, run, sources, { postOp: false }).wrongPatient?.quote).toBe("patient says no vomiting");
    run.resolutions = { wrong_patient: { dismissed: true, at: "x", by: "u" } };
    expect(buildRunView(feverV1, run, sources, { postOp: false }).wrongPatientDismissed).toBe(true);
  });
});

describe("safety level and differential reasoning on the run view", () => {
  const redFlags = feverV1.slots.filter((s) => s.group === "red_flag");
  const withSlots = (slots: SlotResult[]) => okRun({ result: { slots, rejections: [], wrongPatient: null } });

  it("an unresolved conflict on a red flag counts as unasked, not as a negative", () => {
    // A contradiction is not reassurance: until the resident resolves it, the red flag is
    // still an open question and the level must not fall to 0.
    const run = withSlots(
      redFlags.map((s, i) =>
        i === 0
          ? slot(s.id, "negative", { evidence: { quote: "no", source: 0 }, conflict: { quote: "yes", source: 1 } })
          : slot(s.id, "negative", { evidence: { quote: "no", source: 0 } })
      )
    );
    const v = buildRunView(feverV1, run, sources, { postOp: false });
    expect(v.conflicts.map((c) => c.slotId)).toEqual([redFlags[0].id]);
    expect(v.safety?.level).toBe(1);
    expect(v.safety?.complete).toBe(false);
    expect(v.safety?.unasked).toContain(redFlags[0].id);
  });

  it("reaches 0 only when every red flag is explicitly negative", () => {
    const v = buildRunView(
      feverV1,
      withSlots(redFlags.map((s) => slot(s.id, "negative", { evidence: { quote: "no", source: 0 } }))),
      sources,
      { postOp: false }
    );
    expect(v.safety?.level).toBe(0);
    expect(v.safety?.complete).toBe(true);
  });

  it("names the findings that raised each leading differential", () => {
    const diff = feverV1.differentials[0];
    const pointer = diff.pointers[0];
    const v = buildRunView(
      feverV1,
      withSlots([slot(pointer, "positive", { evidence: { quote: "yes", source: 0 } })]),
      sources,
      { postOp: false }
    );
    const led = v.leadingDetail.find((l) => l.name === diff.name);
    expect(led).toBeDefined();
    // Labels, not raw slot ids — the card prints these to the resident.
    expect(led!.supportedBy).toContain(feverV1.slots.find((s) => s.id === pointer)!.label);
  });

  it("shows no safety level at all when the run failed, rather than a reassuring zero", () => {
    const v = buildRunView(feverV1, okRun({ status: "error", error: "boom", result: null }), sources, { postOp: false });
    expect(v.safety).toBeNull();
    expect(v.leadingDetail).toEqual([]);
  });
});
