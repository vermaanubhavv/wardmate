import { describe, expect, it, vi } from "vitest";
import type { ExtractedObservation } from "@/lib/extract";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/templates", () => ({
  listTemplateChoices: async () => [],
  resolveProcedure: (text: string) => ({ procedure_text: text, template_family: null, template_variant: null }),
}));

const { applyProcedureDone } = await import("@/lib/apply-procedure-done");
const { generalSurgeryPack, getSpecialtyPack } = await import("@/lib/specialty");

const done: ExtractedObservation = {
  kind: "procedure_done", label: "procedure done", value_text: "pleural tap done", value_num: null,
  unit: null, source_quote: "pleural tap done", needs_confirmation: true, urgency: null, pac_verdict: null,
};
const patient = { surgery_date: null, template_family: null, template_variant: null, procedure_text: null };

function fakeSupabase() {
  const update = vi.fn<(row: Record<string, unknown>) => { eq: () => Promise<object> }>(() => ({
    eq: async () => ({}),
  }));
  return { client: { from: () => ({ update }) } as never, update };
}

describe("applyProcedureDone", () => {
  it("never turns a medicine-side patient post-op", async () => {
    for (const key of ["pulmonary_medicine", "internal_medicine", "medical_oncology"]) {
      const { client, update } = fakeSupabase();
      await applyProcedureDone(client, "p1", patient, [done], getSpecialtyPack(key));
      expect(update, key).not.toHaveBeenCalled();
    }
  });

  it("still flips a general-surgery patient to post-op", async () => {
    const { client, update } = fakeSupabase();
    await applyProcedureDone(client, "p1", patient, [{ ...done, value_text: "lap chole" }], generalSurgeryPack);
    expect(update).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ procedure_text: "lap chole" }));
  });
});
