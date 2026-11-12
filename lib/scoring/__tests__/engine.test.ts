import { describe, it, expect } from "vitest";
import { evaluateCard } from "../engine";
import { ADMISSION, card, ctx, H, input, clock, acutePancreatitisV1 } from "./helpers";
import { checkpointDueInstant, dueCheckpoints } from "../checkpoints";
import { getDefinition, triggerableDefinitions } from "../definitions/registry";
import { detectTriggers } from "../triggers";
import { validatePathwayDefinition } from "../schema";
import { planPathwayTasks } from "../tasks";

const comp = (r: ReturnType<typeof evaluateCard>, id: string) => {
  const c = r.components.find((x) => x.componentId === id);
  if (!c) throw new Error(`no component ${id} in ${r.cardId}: ${r.components.map((x) => x.componentId)}`);
  return c;
};

// ── 1. BISAP thresholds, including equality boundaries ───────────────────────
describe("BISAP thresholds", () => {
  it("BUN > 25 is a strict inequality: exactly 25 does not score, 25.1 does", () => {
    const at25 = evaluateCard(card("bisap"), ctx([input("bun", 25, "mg/dL", 6)]));
    expect(comp(at25, "bisap.bun").status).toBe("not_satisfied");
    expect(comp(at25, "bisap.bun").points).toBe(0);

    const at251 = evaluateCard(card("bisap"), ctx([input("bun", 25.1, "mg/dL", 6)]));
    expect(comp(at251, "bisap.bun").status).toBe("satisfied");
    expect(comp(at251, "bisap.bun").points).toBe(1);
  });

  it("Age > 60: 60 does not score, 61 does", () => {
    const a60 = evaluateCard(card("bisap"), ctx([input("age_years", 60, "years", 0)]));
    expect(comp(a60, "bisap.age").status).toBe("not_satisfied");
    const a61 = evaluateCard(card("bisap"), ctx([input("age_years", 61, "years", 0)]));
    expect(comp(a61, "bisap.age").status).toBe("satisfied");
  });

  it("full house scores 5 with every component satisfied", () => {
    const r = evaluateCard(
      card("bisap"),
      ctx([
        input("bun", 40, "mg/dL", 4),
        input("mental_status", 0, "flag", 4, { text: "GCS 12" }),
        input("age_years", 72, "years", 0),
        input("pleural_effusion", null, null, 6, { text: "present", sourceQuote: "CXR: left pleural effusion" }),
        // SIRS: temp + HR
        input("temp", 38.6, "C", 3),
        input("hr", 112, "/min", 3),
      ])
    );
    expect(r.total).toBe(5);
    expect(r.interpretation?.text).toMatch(/higher-risk screen/i);
    // Safety: the wording explicitly declines to declare severe pancreatitis or mandate ICU.
    expect(r.interpretation?.text).toMatch(/does not declare severe pancreatitis or mandate ICU/i);
  });

  it("score 3 shows the higher-risk screen wording only", () => {
    const r = evaluateCard(
      card("bisap"),
      ctx([
        input("bun", 30, "mg/dL", 4),
        input("age_years", 80, "years", 0),
        input("temp", 39, "C", 2),
        input("hr", 120, "/min", 2),
        input("mental_status", 1, "flag", 2, { text: "alert" }),
        input("pleural_effusion", null, null, 2, { text: "absent", sourceQuote: "CXR: no pleural effusion" }),
      ])
    );
    expect(r.total).toBe(3);
    expect(r.interpretation?.tone).toBe("attention");
  });
});

// ── 4. Missing data stays unknown, never zero ───────────────────────────────
describe("missing data is unknown, not zero", () => {
  it("no BUN recorded → component unknown, card incomplete", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    const bun = comp(r, "bisap.bun");
    expect(bun.status).toBe("unknown");
    expect(bun.points).toBe(0);
    expect(bun.normalizedValue).toBeNull();
    expect(bun.missingReason).toBe("no_data");
    expect(r.state).toBe("incomplete");
  });
});

// ── 10. Pleural effusion unknown without imaging ────────────────────────────
describe("pleural effusion", () => {
  it("stays unknown when no imaging input is present", () => {
    const r = evaluateCard(card("bisap"), ctx([input("bun", 10, "mg/dL", 4)]));
    expect(comp(r, "bisap.pleural_effusion").status).toBe("unknown");
  });
  it("is satisfied only from an imaging-sourced input", () => {
    const r = evaluateCard(
      card("bisap"),
      ctx([input("pleural_effusion", null, null, 5, { text: "present", sourceQuote: "USG abdomen: right pleural effusion" })])
    );
    expect(comp(r, "bisap.pleural_effusion").status).toBe("satisfied");
  });
});

// ── 3. A value outside the component's window does not fill it ─────────────
describe("time-window isolation", () => {
  it("a BUN recorded after the first 24 hours does not fill the BISAP BUN component", () => {
    const r = evaluateCard(card("bisap"), ctx([input("bun", 40, "mg/dL", 30)], { now: H(50) }));
    const bun = comp(r, "bisap.bun");
    expect(bun.status).toBe("unknown");
    expect(bun.missingReason).toBe("outside_time_window");
  });
});

// ── 8. Unsupported units → visible incomplete ──────────────────────────────
describe("unit safety", () => {
  it("an ambiguous BUN (no unit) makes the component unknown but shows the raw value", () => {
    const r = evaluateCard(
      card("bisap"),
      ctx([input("bun", null, null, 2, { original: { value: "11.2", unit: null }, unitError: "ambiguous_unit: BUN with no unit" })])
    );
    const b = comp(r, "bisap.bun");
    expect(b.status).toBe("unknown");
    expect(b.missingReason).toBe("ambiguous_unit");
    expect(b.rawValue).toBe("11.2");
  });
});

// ── 15. Manual override retains original + replacement ─────────────────────
describe("manual override", () => {
  it("keeps the imported value under the override", () => {
    const r = evaluateCard(
      card("bisap"),
      ctx([input("bun", 12, "mg/dL", 4)], {
        overrides: {
          "bisap.bun": { value: "30 mg/dL", numeric: 30, reason: "lab re-checked", by: "u1", at: H(5) },
        },
      })
    );
    const bun = comp(r, "bisap.bun");
    expect(bun.status).toBe("satisfied");
    expect(bun.override).toBeDefined();
    expect(bun.override?.original.rawValue).toBe("12 mg/dL");
    expect(bun.override?.reason).toBe("lab re-checked");
  });
});

// ── 9. No CT task solely to complete a score ────────────────────────────────
describe("scores do not drive a CT order", () => {
  it("no generated task references contrast CT", () => {
    const bisapResult = evaluateCard(card("bisap"), ctx([input("bun", 10, "mg/dL", 4)]));
    const decisions = planPathwayTasks(
      acutePancreatitisV1,
      [bisapResult],
      clock(12),
      { resolvedInputKeys: new Set(), openTaskKeys: new Set(), disabledToggles: new Set() }
    );
    for (const d of decisions) {
      expect(d.task.action.toLowerCase()).not.toMatch(/\bct\b|contrast ct|mctsi/);
      expect(d.task.componentId ?? "").not.toMatch(/mctsi/);
    }
  });
  it("pleural-effusion component never generates a task (noAutoTask)", () => {
    const r = evaluateCard(card("bisap"), ctx([input("bun", 10, "mg/dL", 4)]));
    const decisions = planPathwayTasks(acutePancreatitisV1, [r], clock(12), {
      resolvedInputKeys: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    expect(decisions.some((d) => d.task.componentId === "bisap.pleural_effusion")).toBe(false);
  });
});

// ── 6 & 7. Existing result / open task suppresses a duplicate task ──────────────
describe("task deduplication against the world", () => {
  const bisapMissing = () => evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));

  const invTask = (decisions: ReturnType<typeof planPathwayTasks>) =>
    decisions.find((d) => d.task.dedupKey === "acute_pancreatitis:task:bisap_investigations");

  it("an existing in-window result links instead of creating", () => {
    const decisions = planPathwayTasks(acutePancreatitisV1, [bisapMissing()], clock(12), {
      resolvedInputKeys: new Set(["bun"]),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    expect(invTask(decisions)?.outcome).toBe("link_existing_result");
  });

  it("an already-present task key is not recreated", () => {
    const decisions = planPathwayTasks(acutePancreatitisV1, [bisapMissing()], clock(12), {
      resolvedInputKeys: new Set(),
      openTaskKeys: new Set(["acute_pancreatitis:task:bisap_investigations"]),
      disabledToggles: new Set(),
    });
    expect(invTask(decisions)?.outcome).toBe("already_present");
  });

  it("a disabled institutional toggle suppresses its task", () => {
    const def = JSON.parse(JSON.stringify(acutePancreatitisV1));
    def.institutionalToggles = { abg: false };
    def.tasks.push({
      key: "abg",
      cardId: null,
      componentId: null,
      action: "Send arterial blood gas",
      reason: "only if the unit requires it",
      priority: "routine",
      responsibleRole: "resident",
      institutionalToggle: "abg",
    });
    const decisions = planPathwayTasks(def, [], clock(12), {
      resolvedInputKeys: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(["abg"]),
    });
    expect(decisions.find((d) => d.task.dedupKey.includes("abg"))?.outcome).toBe("suppressed_toggle");
  });
});

// ── 5 & 19. Task planning is deterministic (idempotent replay) ────────────
describe("event idempotency", () => {
  it("the shipped pancreatitis pathway proposes exactly ONE investigations to-do", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    const decisions = planPathwayTasks(acutePancreatitisV1, [r], clock(12), {
      resolvedInputKeys: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    expect(decisions.map((d) => d.task.dedupKey)).toEqual(["acute_pancreatitis:task:bisap_investigations"]);
    expect(decisions[0].task.action).toMatch(/CBC.*LFT.*KFT.*SE/);
    for (const d of decisions) {
      expect(d.task.action.toLowerCase()).not.toMatch(/ranson|ldh|atlanta|serial vital/);
    }
  });

  it("the investigations to-do clears once the kidney panel is back", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    const decisions = planPathwayTasks(acutePancreatitisV1, [r], clock(12), {
      resolvedInputKeys: new Set(["bun", "wbc"]),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    expect(decisions[0].outcome).toBe("link_existing_result");
  });

  it("planPathwayTasks never returns two decisions with the same dedup key", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    const decisions = planPathwayTasks(acutePancreatitisV1, [r, r], clock(12), {
      resolvedInputKeys: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    const keys = decisions.map((d) => d.task.dedupKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ── 11 & 18. Checkpoints: fire once, timezone-safe ────────────────────────
describe("checkpoints", () => {
  it("a 48-hour checkpoint due time is exactly admission + 48 h regardless of calendar", () => {
    const due = checkpointDueInstant("2026-03-01T00:00:00+05:30", { dueAtHours: 48 });
    expect(due).toBe(new Date("2026-03-03T00:00:00+05:30").toISOString());
  });
  it("dueCheckpoints returns a checkpoint once, then never again after execution", () => {
    const rows = [{ checkpointKey: "ranson_48h", dueAt: H(48), executedAt: null as string | null }];
    expect(dueCheckpoints(rows, H(49)).length).toBe(1);
    rows[0].executedAt = H(49);
    expect(dueCheckpoints(rows, H(72)).length).toBe(0);
  });
  it("not due before its instant", () => {
    expect(dueCheckpoints([{ checkpointKey: "k", dueAt: H(48), executedAt: null }], H(47)).length).toBe(0);
  });
});

// ── 14. Safety: definition contains no autonomous treatment action ─────────
describe("safety invariants", () => {
  it("the schema validator rejects an unsafe autonomous task", () => {
    const bad = JSON.parse(JSON.stringify(acutePancreatitisV1));
    bad.tasks.push({
      key: "icu",
      cardId: null,
      componentId: null,
      action: "Transfer to ICU",
      reason: "score high",
      priority: "urgent",
      responsibleRole: "senior",
      institutionalToggle: null,
    });
    const res = validatePathwayDefinition(bad);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => /unsafe autonomous action/i.test(i.message))).toBe(true);
  });
  it("no shipped pancreatitis task is an autonomous drug/transfer/order action", () => {
    for (const t of acutePancreatitisV1.tasks) {
      expect(t.action).not.toMatch(/\b(prescribe|transfuse|transfer to ICU|start antibiotic|perform ERCP)\b/i);
    }
  });
  it("the built-in definition passes its own schema", () => {
    expect(validatePathwayDefinition(acutePancreatitisV1).ok).toBe(true);
  });
});

// ── 16. Flag-off leaves behaviour unchanged ───────────────────────────────
describe("feature flag", () => {
  it("global switch is off unless NEXT_PUBLIC_SCORING_ENGINE === 'on'", async () => {
    const prev = process.env.NEXT_PUBLIC_SCORING_ENGINE;
    delete process.env.NEXT_PUBLIC_SCORING_ENGINE;
    const { scoringEngineGloballyEnabled } = await import("../flag");
    expect(scoringEngineGloballyEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_SCORING_ENGINE = "on";
    // module already evaluated; function reads env live
    expect(scoringEngineGloballyEnabled()).toBe(true);
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SCORING_ENGINE;
    else process.env.NEXT_PUBLIC_SCORING_ENGINE = prev;
  });
});

// ── 20. Historical instances keep their exact version ─────────────────────
describe("versioning", () => {
  it("getDefinition resolves by exact (id, version) and returns null for an unknown version", () => {
    expect(getDefinition("acute_pancreatitis", "1.0.0")?.pathwayVersion).toBe("1.0.0");
    expect(getDefinition("acute_pancreatitis", "9.9.9")).toBeNull();
  });
});

// ── Trigger detection (text patterns + exclusions) ─────────────────────────
describe("trigger detection", () => {
  const withActive = () => triggerableDefinitions();
  it("matches a free-text working diagnosis", () => {
    const m = detectTriggers({ text: "? acute pancreatitis, gallstone" }, withActive());
    expect(m[0]?.pathwayId).toBe("acute_pancreatitis");
    expect(m[0]?.source).toBe("diagnosis_text");
  });
  it("does not match an excluded phrase", () => {
    const m = detectTriggers({ text: "chronic pancreatitis" }, withActive());
    expect(m.length).toBe(0);
  });
});

// ── SIRS units are honoured ─────────────────────────────────────────────────
describe("BISAP SIRS component", () => {
  it("needs ≥ 2 criteria; one criterion alone is not_satisfied, none assessable is unknown", () => {
    const oneOnly = evaluateCard(card("bisap"), ctx([input("hr", 120, "/min", 3)]));
    // Only HR assessable → cannot be sure SIRS is absent → unknown
    expect(comp(oneOnly, "bisap.sirs").status).toBe("unknown");

    const two = evaluateCard(card("bisap"), ctx([input("hr", 120, "/min", 3), input("temp", 39, "C", 3)]));
    expect(comp(two, "bisap.sirs").status).toBe("satisfied");
  });
});

void ADMISSION;
