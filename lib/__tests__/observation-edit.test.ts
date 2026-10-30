import { describe, expect, it } from "vitest";
import { editedObservationPatch } from "@/lib/observation-edit";

describe("editedObservationPatch — a corrected value goes back to amber", () => {
  it("a confirmed dangerous value is unconfirmed again, with value_num following the words", () => {
    const p = editedObservationPatch({ needs_confirmation: true, value_num: 101 }, "99.4 F");
    expect(p).toEqual({ needs_confirmation: true, confirmed_at: null, confirmed_by: null, value_num: 99.4 });
  });

  it("a figure typed into prose makes it dangerous", () => {
    const p = editedObservationPatch({ needs_confirmation: false, value_num: null }, "drain 20 ml");
    expect(p.needs_confirmation).toBe(true);
    expect(p.value_num).toBeNull(); // the row was never numeric; no guess
  });

  it("prose stays prose", () => {
    const p = editedObservationPatch({ needs_confirmation: false, value_num: null }, "abdomen soft");
    expect(p.needs_confirmation).toBe(false);
  });

  it("a numeric row edited to words loses its number rather than keeping a stale one", () => {
    expect(editedObservationPatch({ needs_confirmation: true, value_num: 38 }, "afebrile").value_num).toBeNull();
  });
});
