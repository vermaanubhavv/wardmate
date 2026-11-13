/**
 * A new patient spoken with no signal and added when it returns: the double-patient guards
 * (the same recording replayed, and the same bed and name already on the unit) and what the
 * outbox sends. Synthetic names only.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sameAdmission } from "@/lib/new-patient-voice";
import { body, type Pending } from "@/lib/outbox";

describe("sameAdmission", () => {
  it("matches the same bed and name, ignoring title, case and punctuation", () => {
    expect(sameAdmission({ display_name: "Test Patient", bed: "Bed 5" }, { name: "Mr. test patient", bed: "5" })).toBe(true);
  });
  it("does not match another bed or another name", () => {
    expect(sameAdmission({ display_name: "Test Patient", bed: "5" }, { name: "Test Patient", bed: "6" })).toBe(false);
    expect(sameAdmission({ display_name: "Test Patient", bed: "5" }, { name: "Other Patient", bed: "5" })).toBe(false);
  });
});

describe("outbox body for a new patient", () => {
  it("carries the unit, the client id and when it was spoken", () => {
    const item: Pending = {
      id: "rec-np",
      kind: "new-patient",
      url: "/api/patients/new-by-voice",
      wardId: "w1",
      label: "New patient",
      audio: new Blob(["x"], { type: "audio/mp4" }),
      mimeType: "audio/mp4",
      recordedAt: "2026-11-04T05:12:00.000Z",
      queuedAt: "2026-11-04T05:12:30.000Z",
      attempts: 0,
    };
    const form = body(item).body as FormData;
    expect(form.get("ward_id")).toBe("w1");
    expect(form.get("client_uuid")).toBe("rec-np");
    expect(form.get("recorded_at")).toBe("2026-11-04T05:12:00.000Z");
  });
});

const insert = vi.fn();
const onWard = [{ id: "existing", display_name: "Test Patient", bed: "5" }];
const transcribe = vi.fn(async () => ({ text: "Test Patient, 40 year old, bed 5" }));
const spoken = { name: "Test Patient", age_years: 40, sex: null, bed: "5", diagnosis: null, procedure: null };
const receipts = new Map<string, unknown>([["seen", { status: "created", patient_id: "p-first" }]]);

vi.mock("@/lib/auth", () => ({ getUser: async () => ({ id: "u1" }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => {
      const q = {
        select: () => q,
        eq: () => q,
        then: (ok: (v: unknown) => unknown) => Promise.resolve({ data: onWard }).then(ok),
        insert: (row: unknown) => {
          insert(row);
          return { select: () => ({ single: async () => ({ data: { id: "new" }, error: null }) }) };
        },
      };
      return q;
    },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/stt", () => ({ transcribe }));
vi.mock("@/lib/glossary", () => ({ correctTranscript: async (t: string) => ({ text: t }) }));
vi.mock("@/lib/read-new-patient", () => ({ readSpokenPatient: async () => ({ patient: spoken }) }));
vi.mock("@/lib/ward", () => ({ getWardPack: async () => ({ lexiconSpecialty: null }), getWardSpecialtyStored: async () => null }));
vi.mock("@/lib/templates", () => ({ listTemplateChoices: async () => [], resolveProcedure: () => ({}) }));
vi.mock("@/lib/dictation-receipt", () => ({
  readReceipt: async (_s: unknown, uuid: string | null) => (uuid ? (receipts.get(uuid) ?? null) : null),
  saveReceipt: async () => {},
}));

const post = async (uuid: string, bed = "5") => {
  spoken.bed = bed;
  const { POST } = await import("@/app/api/patients/new-by-voice/route");
  const form = new FormData();
  form.set("ward_id", "w1");
  form.set("client_uuid", uuid);
  form.set("audio", new Blob(["x".repeat(2000)], { type: "audio/mp4" }), "audio.m4a");
  return (await POST(new Request("http://x/api/patients/new-by-voice", { method: "POST", body: form }))).json();
};

describe("new-by-voice route", () => {
  beforeEach(() => {
    insert.mockReset();
    transcribe.mockClear();
  });

  it("answers a replayed recording from its receipt and adds nobody", async () => {
    expect(await post("seen")).toEqual({ status: "created", patient_id: "p-first" });
    expect(transcribe).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("does not double a patient already on the unit in that bed", async () => {
    const r = await post("fresh-1");
    expect(r.status).toBe("exists");
    expect(r.patient_id).toBe("existing");
    expect(insert).not.toHaveBeenCalled();
  });

  it("adds the patient with only what was said, admitted the day it was spoken", async () => {
    const r = await post("fresh-2", "7");
    expect(r.status).toBe("created");
    expect(insert).toHaveBeenCalledTimes(1);
    const row = insert.mock.calls[0][0] as Record<string, unknown>;
    expect(row).toMatchObject({ ward_id: "w1", bed: "7", display_name: "Test Patient", age_years: 40, sex: null, primary_diagnosis: null });
    expect(row.admitted_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
