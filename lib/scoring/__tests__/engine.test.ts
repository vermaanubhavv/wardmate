import { describe, it, expect } from "vitest";
import { evaluateCard, canVerifyCard } from "../engine";
import { ADMISSION, card, ctx, H, input, clock, acutePancreatitisV1 } from "./helpers";
import { checkpointDueInstant, dueCheckpoints } from "../checkpoints";
import { getDefinition, triggerableDefinitions } from "../definitions/registry";
import { detectTriggers } from "../triggers";
import { validatePathwayDefinition } from "../schema";
import { planPathwayTasks, eventDedupKey } from "../tasks";

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
    expect(r.interpretation?.text).toMatch(/Higher-risk screen/);
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
  it("no BUN recorded → component unknown, card incomplete, not verifiable", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    const bun = comp(r, "bisap.bun");
    expect(bun.status).toBe("unknown");
    expect(bun.points).toBe(0);
    expect(bun.normalizedValue).toBeNull();
    expect(bun.missingReason).toBe("no_data");
    expect(r.state).toBe("incomplete");
    expect(canVerifyCard(r).ok).toBe(false);
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

// ── 3. Admission data cannot populate the 48-hour stage ─────────────────────
describe("time-window isolation", () => {
  it("an admission calcium does not fill the Ranson 48-hour calcium component", () => {
    const r = evaluateCard(
      card("ranson_48h_nongallstone"),
      ctx([input("calcium", 7, "mg/dL", 2)], { checkpointDueAt: { ranson_48h: H(48) }, now: H(50) })
    );
    const ca = comp(r, "ranson_48h_nongallstone.calcium");
    expect(ca.status).toBe("unknown");
    expect(ca.missingReason).toBe("outside_time_window");
  });

  it("the 48-hour card is locked (not_started) before the checkpoint is due", () => {
    const r = evaluateCard(
      card("ranson_48h_nongallstone"),
      ctx([input("calcium", 7, "mg/dL", 44)], { checkpointDueAt: { ranson_48h: H(48) }, now: H(30) })
    );
    expect(r.state).toBe("not_started");
    expect(comp(r, "ranson_48h_nongallstone.calcium").missingReason).toBe("checkpoint_not_due");
  });
});

// ── 2. Both Ranson variants, all thresholds ────────────────────────────────
describe("Ranson variants", () => {
  it("non-gallstone admission thresholds", () => {
    const r = evaluateCard(
      card("ranson_admission_nongallstone"),
      ctx([
        input("age_years", 56, "years", 0),
        input("wbc", 16001, "cells/mm3", 2),
        input("glucose", 201, "mg/dL", 2),
        input("ldh", 351, "IU/L", 2),
        input("ast", 251, "IU/L", 2),
      ])
    );
    expect(r.total).toBe(5);
  });
  it("non-gallstone admission boundary values do NOT score", () => {
    const r = evaluateCard(
      card("ranson_admission_nongallstone"),
      ctx([
        input("age_years", 55, "years", 0),
        input("wbc", 16000, "cells/mm3", 2),
        input("glucose", 200, "mg/dL", 2),
        input("ldh", 350, "IU/L", 2),
        input("ast", 250, "IU/L", 2),
      ])
    );
    expect(r.total).toBe(0);
  });
  it("gallstone admission uses the higher cut-offs (age 70, WBC 18k, glucose 220, LDH 400)", () => {
    const belowGallstone = evaluateCard(
      card("ranson_admission_gallstone"),
      ctx([
        input("age_years", 65, "years", 0),
        input("wbc", 17000, "cells/mm3", 2),
        input("glucose", 210, "mg/dL", 2),
        input("ldh", 380, "IU/L", 2),
        input("ast", 240, "IU/L", 2),
      ])
    );
    expect(belowGallstone.total).toBe(0);
    const above = evaluateCard(
      card("ranson_admission_gallstone"),
      ctx([
        input("age_years", 71, "years", 0),
        input("wbc", 18001, "cells/mm3", 2),
        input("glucose", 221, "mg/dL", 2),
        input("ldh", 401, "IU/L", 2),
        input("ast", 251, "IU/L", 2),
      ])
    );
    expect(above.total).toBe(5);
  });

  it("non-gallstone 48h: Hct fall > 10 points and BUN rise > 5 use change-from-baseline", () => {
    const r = evaluateCard(
      card("ranson_48h_nongallstone"),
      ctx(
        [
          input("hct", 45, "%", 2),
          input("hct", 33, "%", 46), // fall of 12
          input("bun", 20, "mg/dL", 2),
          input("bun", 27, "mg/dL", 46), // rise of 7
          input("calcium", 7.5, "mg/dL", 46),
          input("pao2", 55, "mmHg", 46),
          input("base_deficit", 5, "mEq/L", 46),
          input("fluid_sequestration", 7, "L", 46, { sourceQuote: "estimated fluid sequestration 7 L" }),
        ],
        { checkpointDueAt: { ranson_48h: H(48) }, now: H(50) }
      )
    );
    expect(comp(r, "ranson_48h_nongallstone.hct_fall").status).toBe("satisfied");
    expect(comp(r, "ranson_48h_nongallstone.bun_rise").status).toBe("satisfied");
    expect(r.total).toBe(6);
  });

  it("gallstone 48h has no PaO2 component and a lower BUN-rise / base-deficit cut-off", () => {
    const g = card("ranson_48h_gallstone");
    expect(g.inputs.some((i) => i.componentId.endsWith(".pao2"))).toBe(false);
    const r = evaluateCard(
      g,
      ctx(
        [
          input("bun", 20, "mg/dL", 2),
          input("bun", 23, "mg/dL", 46), // rise 3 → > 2 for gallstone
          input("base_deficit", 5.5, "mEq/L", 46), // > 5 for gallstone
          input("fluid_sequestration", 4.5, "L", 46),
        ],
        { checkpointDueAt: { ranson_48h: H(48) }, now: H(50) }
      )
    );
    expect(comp(r, "ranson_48h_gallstone.bun_rise").status).toBe("satisfied");
    expect(comp(r, "ranson_48h_gallstone.base_deficit").status).toBe("satisfied");
    expect(comp(r, "ranson_48h_gallstone.fluid_sequestration").status).toBe("satisfied");
  });
});

// ── 8. Unsupported units → visible incomplete ──────────────────────────────
describe("unit safety", () => {
  it("an ambiguous WBC (no unit) makes the component unknown but shows the raw value", () => {
    const r = evaluateCard(
      card("ranson_admission_nongallstone"),
      ctx([input("wbc", null, null, 2, { original: { value: "11.2", unit: null }, unitError: "ambiguous_unit: WBC with no unit" })])
    );
    const w = comp(r, "ranson_admission_nongallstone.wbc");
    expect(w.status).toBe("unknown");
    expect(w.missingReason).toBe("ambiguous_unit");
    expect(w.rawValue).toBe("11.2");
  });
});

// ── 12 & 13. Atlanta persistence timer ────────────────────────────────────
describe("Revised Atlanta persistence", () => {
  const run = (ci: Record<string, unknown>) =>
    evaluateCard(card("atlanta"), ctx([input("creatinine", 3.5, "mg/dL", 10)], { classificationInputs: ci, now: H(30) }));

  it("organ failure present for < 48 h is NOT classified as persistent/severe", () => {
    const r = run({ organFailureDurationHours: 24 });
    expect(r.classification).toBe("moderately_severe");
    expect(r.classification).not.toBe("severe");
  });
  it("organ failure for exactly 48 h is severe", () => {
    const r = run({ organFailureDurationHours: 48 });
    expect(r.classification).toBe("severe");
  });
  it("organ failure for 47 h is not yet severe", () => {
    const r = run({ organFailureDurationHours: 47 });
    expect(r.classification).not.toBe("severe");
  });
  it("mild only when no organ failure and complications explicitly absent", () => {
    const r = evaluateCard(
      card("atlanta"),
      ctx([input("creatinine", 0.9, "mg/dL", 10)], {
        classificationInputs: { localComplications: false, systemicComplications: false },
        now: H(30),
      })
    );
    expect(r.classification).toBe("mild");
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

// ── 9. No CT task solely for mCTSI + card not built without a CT ────────────
describe("mCTSI does not drive a CT order", () => {
  it("no generated task references contrast CT or an mCTSI component", () => {
    const bisapResult = evaluateCard(card("bisap"), ctx([input("bun", 10, "mg/dL", 4)]));
    const decisions = planPathwayTasks(
      acutePancreatitisV1,
      [bisapResult],
      [input("bun", 10, "mg/dL", 4)],
      clock(12),
      { resolvedInputKeys: new Set(), activeOrders: new Set(), openTaskKeys: new Set(), disabledToggles: new Set() }
    );
    for (const d of decisions) {
      expect(d.task.action.toLowerCase()).not.toMatch(/\bct\b|contrast ct|mctsi/);
      expect(d.task.componentId ?? "").not.toMatch(/mctsi/);
    }
  });
  it("pleural-effusion component never generates a task (noAutoTask)", () => {
    const r = evaluateCard(card("bisap"), ctx([input("bun", 10, "mg/dL", 4)]));
    const decisions = planPathwayTasks(acutePancreatitisV1, [r], [], clock(12), {
      resolvedInputKeys: new Set(),
      activeOrders: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    expect(decisions.some((d) => d.task.componentId === "bisap.pleural_effusion")).toBe(false);
  });
});

// ── 6 & 7. Existing result / order suppresses a duplicate task ──────────────
describe("task deduplication against the world", () => {
  const bisapMissing = () => evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));

  it("an existing in-window result links instead of creating", () => {
    const decisions = planPathwayTasks(acutePancreatitisV1, [bisapMissing()], [], clock(12), {
      resolvedInputKeys: new Set(["bun"]),
      activeOrders: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    const bunTask = decisions.find((d) => d.task.componentId === "bisap.bun");
    expect(bunTask?.outcome).toBe("link_existing_result");
  });

  it("an active matching order suppresses the duplicate", () => {
    const decisions = planPathwayTasks(acutePancreatitisV1, [bisapMissing()], [], clock(12), {
      resolvedInputKeys: new Set(),
      activeOrders: new Set(["bun"]),
      openTaskKeys: new Set(),
      disabledToggles: new Set(),
    });
    expect(decisions.find((d) => d.task.componentId === "bisap.bun")?.outcome).toBe("link_existing_order");
  });

  it("an already-present task key is not recreated", () => {
    const decisions = planPathwayTasks(acutePancreatitisV1, [bisapMissing()], [], clock(12), {
      resolvedInputKeys: new Set(),
      activeOrders: new Set(),
      openTaskKeys: new Set(["acute_pancreatitis:bisap:bisap.bun"]),
      disabledToggles: new Set(),
    });
    expect(decisions.find((d) => d.task.componentId === "bisap.bun")?.outcome).toBe("already_present");
  });

  it("a disabled institutional toggle suppresses its task", () => {
    const decisions = planPathwayTasks(acutePancreatitisV1, [], [], clock(12), {
      resolvedInputKeys: new Set(),
      activeOrders: new Set(),
      openTaskKeys: new Set(),
      disabledToggles: new Set(["ranson_extended"]),
    });
    const ldh = decisions.find((d) => d.task.dedupKey.includes("ldh_ast"));
    expect(ldh?.outcome).toBe("suppressed_toggle");
  });
});

// ── 5 & 19. Event dedup key is deterministic (idempotent replay) ────────────
describe("event idempotency", () => {
  it("eventDedupKey is stable for the same event", () => {
    const a = eventDedupKey({ encounterId: "p1", pathwayId: "acute_pancreatitis", pathwayVersion: "1.0.0", eventType: "new_lab", sourceId: "obs-9", checkpoint: null });
    const b = eventDedupKey({ encounterId: "p1", pathwayId: "acute_pancreatitis", pathwayVersion: "1.0.0", eventType: "new_lab", sourceId: "obs-9", checkpoint: null });
    expect(a).toBe(b);
    expect(a).toBe("p1:acute_pancreatitis:1.0.0:new_lab:obs-9:-");
  });
  it("planPathwayTasks never returns two decisions with the same dedup key", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    const decisions = planPathwayTasks(acutePancreatitisV1, [r, r], [], clock(12), {
      resolvedInputKeys: new Set(),
      activeOrders: new Set(),
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

// ── 17. Verification requires completeness (permission + safety gate) ──────
describe("verification gate", () => {
  it("cannot verify while a required component is unknown", () => {
    const r = evaluateCard(card("bisap"), ctx([input("age_years", 70, "years", 0)]));
    expect(canVerifyCard(r).ok).toBe(false);
  });
  it("can verify once every required component is answered", () => {
    const r = evaluateCard(
      card("bisap"),
      ctx([
        input("bun", 10, "mg/dL", 4),
        input("age_years", 50, "years", 0),
        input("mental_status", 1, "flag", 4, { text: "alert" }),
        input("temp", 37, "C", 3),
        input("hr", 80, "/min", 3),
        input("rr", 16, "/min", 3),
        input("wbc", 8000, "cells/mm3", 3),
        input("pleural_effusion", null, null, 5, { text: "absent", sourceQuote: "CXR: no effusion" }),
      ])
    );
    expect(r.missingRequiredCount).toBe(0);
    expect(canVerifyCard(r).ok).toBe(true);
  });
});

// ── 20. Historical instances keep their exact version ─────────────────────
describe("versioning", () => {
  it("getDefinition resolves by exact (id, version) and returns null for an unknown version", () => {
    expect(getDefinition("acute_pancreatitis", "1.0.0")?.pathwayVersion).toBe("1.0.0");
    expect(getDefinition("acute_pancreatitis", "9.9.9")).toBeNull();
  });
});

// ── Trigger detection (configured code + text fallback + exclusions) ───────
describe("trigger detection", () => {
  const withActive = () => {
    process.env.SCORING_ENGINE_ALLOW_DRAFTS = "on";
    return triggerableDefinitions();
  };
  it("matches a free-text working diagnosis", () => {
    const m = detectTriggers({ text: "? acute pancreatitis, gallstone" }, withActive());
    expect(m[0]?.pathwayId).toBe("acute_pancreatitis");
    expect(m[0]?.source).toBe("diagnosis_text");
  });
  it("does not match an excluded phrase", () => {
    const m = detectTriggers({ text: "chronic pancreatitis" }, withActive());
    expect(m.length).toBe(0);
  });
  it("matches a configured ICD code", () => {
    const m = detectTriggers({ text: "abdominal pain", codes: ["K85.9"] }, withActive());
    expect(m[0]?.source).toBe("diagnosis_code");
  });
});

// ── SIRS / Modified Marshall units are honoured ───────────────────────────
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
