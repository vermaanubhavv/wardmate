import { describe, it, expect } from "vitest";
import { deriveDoneToday } from "@/lib/handover";
import type { Observation } from "@/lib/patient-state";

function obs(over: Partial<Observation>): Observation {
  return {
    id: "o1",
    kind: "lab",
    label: "Hb",
    value_text: "9.2",
    value_num: 9.2,
    unit: null,
    source_quote: "Hb 9.2",
    needs_confirmation: false,
    confirmed_at: null,
    conflict_note: null,
    done_at: null,
    urgency: null,
    graded_at: null,
    recorded_at: "2026-09-19T05:00:00Z",
    ...over,
  };
}

// 2026-09-19T05:00:00Z is 2026-09-19 in IST (UTC+5:30); 2026-09-18T17:00:00Z is 2026-09-18
// in IST — see lib/urgency.ts istDate().
const TODAY = "2026-09-19";

describe("deriveDoneToday", () => {
  it("includes a lab result recorded today, with its value", () => {
    const items = deriveDoneToday([obs({ id: "l1", kind: "lab", label: "Hb", value_text: "9.2" })], [], TODAY);
    expect(items).toEqual([{ id: "l1", text: "Hb: 9.2" }]);
  });

  it("excludes a lab result recorded on an earlier day", () => {
    const items = deriveDoneToday(
      [obs({ id: "l1", kind: "lab", recorded_at: "2026-09-18T17:00:00Z" })],
      [],
      TODAY
    );
    expect(items).toEqual([]);
  });

  it("includes the operation, labelled distinctly, when done today", () => {
    const items = deriveDoneToday(
      [obs({ id: "p1", kind: "procedure_done", label: "Operation", value_text: "Lap cholecystectomy" })],
      [],
      TODAY
    );
    expect(items).toEqual([{ id: "p1", text: "Operated: Lap cholecystectomy" }]);
  });

  it("includes a task completed today, using its own wording", () => {
    const doneToday = obs({ id: "t1", kind: "plan", value_text: "Remove drain", done_at: "2026-09-19T06:00:00Z" });
    expect(deriveDoneToday([], [doneToday], TODAY)).toEqual([{ id: "t1", text: "Remove drain" }]);
  });

  it("excludes a task completed on an earlier day", () => {
    const doneEarlier = obs({ id: "t1", value_text: "Remove drain", done_at: "2026-09-17T06:00:00Z" });
    expect(deriveDoneToday([], [doneEarlier], TODAY)).toEqual([]);
  });

  it("excludes routine vitals and other kinds not in scope", () => {
    const items = deriveDoneToday(
      [obs({ kind: "vital", label: "BP", value_text: "120/80" }), obs({ kind: "medication", label: "Paracetamol" })],
      [],
      TODAY
    );
    expect(items).toEqual([]);
  });

  it("combines all three sources", () => {
    const items = deriveDoneToday(
      [
        obs({ id: "l1", kind: "lab", label: "Hb", value_text: "9.2" }),
        obs({ id: "p1", kind: "procedure_done", value_text: "Appendicectomy" }),
      ],
      [obs({ id: "t1", value_text: "Remove drain", done_at: "2026-09-19T06:00:00Z" })],
      TODAY
    );
    expect(items.map((i) => i.id)).toEqual(["l1", "p1", "t1"]);
  });
});
