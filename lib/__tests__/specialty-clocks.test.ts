import { describe, expect, it } from "vitest";
import { getSpecialtyPack } from "@/lib/specialty";
import {
  checklistFieldLabel,
  clockColumns,
  noteStatusLine,
  readsChemoColumns,
  usesBurnClock,
  usesCycleClock,
} from "@/lib/specialty/clocks";

const gs = getSpecialtyPack("general_surgery");
const onc = getSpecialtyPack("medical_oncology");
const burns = getSpecialtyPack("burns_plastic_surgery");
const im = getSpecialtyPack("internal_medicine");
const paeds = getSpecialtyPack("paediatrics");

describe("which clocks a pack uses", () => {
  it("matches the old key checks exactly", () => {
    expect([usesBurnClock(gs), usesBurnClock(onc), usesBurnClock(burns), usesBurnClock(im)]).toEqual([false, false, true, false]);
    expect([usesCycleClock(gs), usesCycleClock(onc), usesCycleClock(burns), usesCycleClock(im)]).toEqual([false, true, false, false]);
    expect(readsChemoColumns(gs)).toBe(false);
    for (const p of [onc, burns, im, paeds]) expect(readsChemoColumns(p), p.key).toBe(true);
    expect([clockColumns(gs), clockColumns(im), clockColumns(onc), clockColumns(burns)]).toEqual([
      "", "", "cycle_day, cycle_number", "burn_day",
    ]);
  });

  it("checklist field label per unit", () => {
    expect(checklistFieldLabel("general_surgery")).toBe("Operation");
    expect(checklistFieldLabel(null)).toBe("Operation");
    expect(checklistFieldLabel("orthopaedics")).toBe("Operation");
    expect(checklistFieldLabel("medical_oncology")).toBe("Chemo cycle / checklist");
    expect(checklistFieldLabel("internal_medicine")).toBe("Checklist");
    expect(checklistFieldLabel("paediatrics")).toBe("Checklist");
  });
});

describe("noteStatusLine", () => {
  const base = { surgery_date: null, post_op_day: null, management: null };

  it("surgery prints exactly what it always did", () => {
    expect(noteStatusLine(gs, { ...base, surgery_date: "2026-09-10", post_op_day: 3 })).toBe("Post Op Day (3)");
    expect(noteStatusLine(gs, { ...base, surgery_date: "2026-09-10" })).toBe("Post Op Day (—)");
    expect(noteStatusLine(gs, { ...base, management: "preop" })).toBe("Pre-op");
    expect(noteStatusLine(gs, base)).toBeNull();
  });

  it("oncology and burns print their own clock; medicine its management word", () => {
    expect(noteStatusLine(onc, { ...base, cycle_day: 3, cycle_number: 2 })).toBe("C2 D3");
    expect(noteStatusLine(onc, { ...base, management: "conservative" })).toBe("On treatment");
    expect(noteStatusLine(burns, { ...base, burn_day: 4, surgery_date: "2026-09-10", post_op_day: 2 })).toBe("PBD 4");
    expect(noteStatusLine(burns, { ...base, surgery_date: "2026-09-10", post_op_day: 2 })).toBe("Post Op Day (2)");
    expect(noteStatusLine(im, { ...base, management: "workup" })).toBe(
      noteStatusLine(gs, { ...base, management: "workup" })
    );
  });
});

describe("noteStatusLine with a leftover operation date", () => {
  it("never reads Post Op Day on a unit that does not operate; surgery still does", async () => {
    const { noteStatusLine } = await import("@/lib/specialty/clocks");
    const { getSpecialtyPack } = await import("@/lib/specialty");
    const p = { surgery_date: "2026-09-28", post_op_day: 5, management: null, admission_day: 7 };
    expect(noteStatusLine(getSpecialtyPack("internal_medicine"), p)).toBeNull();
    expect(noteStatusLine(getSpecialtyPack("general_surgery"), p)).toBe("Post Op Day (5)");
  });
});
