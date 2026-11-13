/**
 * "Record now, process later" for the live dictation panel: how a late take is filed (the pure
 * mappings in lib/late-dictation.ts), what the outbox sends for it, and that a replayed take is
 * answered from its receipt without being transcribed or filed twice. Synthetic text only.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyDischargeLines,
  chunks,
  noteRows,
  noteSections,
  recordedAtFrom,
} from "@/lib/late-dictation";
import { progressNoteConfigFor } from "@/lib/progress-note-config";
import { body, type Pending } from "@/lib/outbox";
import type { DischargeDraft } from "@/lib/discharge-entities";

const surgery = progressNoteConfigFor("general_surgery");

describe("noteRows", () => {
  it("files each section the way its card stores it, numbers amber", () => {
    const exam = surgery.examSections[0];
    const { rows, unplaced } = noteRows(
      [
        { section: "complaints", text: "Mild pain at the wound site" },
        { section: "vital:BP", text: "120/80" },
        { section: exam.id, text: "Soft, non-tender" },
        { section: "plan", text: "Repeat CBC on day 3" },
        { section: "assessment", text: "Stable" },
      ],
      surgery
    );
    expect(unplaced).toEqual([]);
    expect(rows).toEqual([
      { kind: "note", label: "complaints", text: "Mild pain at the wound site", amber: false },
      { kind: "vital", label: "BP", text: "120/80", amber: true },
      { kind: "exam", label: exam.label, text: "Soft, non-tender", amber: false },
      { kind: "plan", label: "plan", text: "Repeat CBC on day 3", amber: true },
      { kind: "note", label: "assessment", text: "Stable", amber: false },
    ]);
  });

  it("sends drugs and anything that does not map cleanly to To check", () => {
    const { rows, unplaced } = noteRows(
      [
        { section: "meds", text: "Inj ceftriaxone 1 g IV BD" },
        { section: "flatus", text: "maybe" },
        { section: "nonsense", text: "something" },
      ],
      surgery
    );
    expect(rows).toEqual([]);
    expect(unplaced).toEqual(["Inj ceftriaxone 1 g IV BD", "maybe", "something"]);
  });

  it("only takes Passed / Not passed for a bowel line", () => {
    if (!surgery.bowelLine) return;
    expect(noteRows([{ section: "stool", text: "not passed" }], surgery).rows).toEqual([
      { kind: "exam", label: "stool", text: "Not passed", amber: false },
    ]);
  });

  it("offers the sorter the same keys the note workspace offers", () => {
    const keys = noteSections(surgery).map((s) => s.key);
    expect(keys).toContain("complaints");
    expect(keys).toContain("vital:BP");
    expect(keys).toContain("meds");
    for (const s of surgery.examSections) expect(keys).toContain(s.id);
  });
});

describe("applyDischargeLines", () => {
  const draft = {
    indicationForAdmission: { text: "", source: "ai", approvedAt: "2026-11-01T00:00:00Z", approvedBy: "u" },
    clinicalCourse: { text: "Underwent surgery.", source: "ai", approvedAt: "2026-11-01T00:00:00Z", approvedBy: "u" },
    conditionAtDischarge: { freeText: "" },
    primaryCareActions: [],
    patientActions: [],
  } as unknown as DischargeDraft;

  it("appends to the sections and clears an AI section's approval", () => {
    const { draft: next, touched, unplaced } = applyDischargeLines(draft, [
      { section: "clinicalCourse", text: "Uneventful recovery." },
      { section: "patientActions", text: "Review in OPD after a week" },
      { section: "medications", text: "Tab paracetamol 500 mg TDS" },
      { section: "diagnoses", text: "Acute appendicitis" },
    ]);
    expect(next.clinicalCourse.text).toBe("Underwent surgery. Uneventful recovery.");
    expect(next.clinicalCourse.approvedAt).toBeNull();
    expect(next.patientActions).toEqual(["Review in OPD after a week"]);
    expect(touched.sort()).toEqual(["clinicalCourse", "patientActions"]);
    // Drugs and the diagnosis are placed by the resident, never written in unseen.
    expect(unplaced).toEqual(["Tab paracetamol 500 mg TDS", "Acute appendicitis"]);
    // The draft passed in is untouched.
    expect(draft.clinicalCourse.text).toBe("Underwent surgery.");
  });
});

describe("chunks", () => {
  it("splits a long take at sentence ends, never mid-sentence", () => {
    const s = "Pain is less today. ".repeat(40).trim();
    const out = chunks(s, 100);
    expect(out.length).toBeGreaterThan(1);
    for (const c of out) expect(c.endsWith(".")).toBe(true);
    expect(out.join(" ")).toBe(s);
  });
});

describe("recordedAtFrom", () => {
  const now = Date.parse("2026-11-04T06:00:00Z");
  it("keeps a plausible recording time", () => {
    expect(recordedAtFrom("2026-11-04T05:12:00Z", now)).toBe("2026-11-04T05:12:00.000Z");
  });
  it("never trusts a future or ancient clock", () => {
    expect(recordedAtFrom("2026-11-05T05:12:00Z", now)).toBe("2026-11-04T06:00:00.000Z");
    expect(recordedAtFrom("2026-09-01T05:12:00Z", now)).toBe("2026-11-04T06:00:00.000Z");
    expect(recordedAtFrom("garbage", now)).toBe("2026-11-04T06:00:00.000Z");
  });
});

describe("outbox body for a late take", () => {
  it("carries the client id, screen and recording time", () => {
    const item: Pending = {
      id: "rec-1",
      kind: "dictation",
      url: "/api/entries/late-dictation",
      patientId: "p1",
      label: "Note dictation",
      audio: new Blob(["x"], { type: "audio/webm" }),
      mimeType: "audio/webm",
      screen: "note",
      recordedAt: "2026-11-04T05:12:00.000Z",
      queuedAt: "2026-11-04T05:15:00.000Z",
      attempts: 0,
    };
    const form = body(item).body as FormData;
    expect(form.get("client_uuid")).toBe("rec-1");
    expect(form.get("screen")).toBe("note");
    expect(form.get("recorded_at")).toBe("2026-11-04T05:12:00.000Z");
    expect((form.get("audio") as File).name).toBe("audio.webm");
  });
});

// The replay guard: the same take arriving twice is answered from its receipt.
const transcribe = vi.fn();
const prior = { entry_id: "e1", label: "Note dictation", recorded_at: "x", processed_at: "y", placed: 3, to_check: 1 };
vi.mock("@/lib/auth", () => ({ getUser: async () => ({ id: "u1" }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({}) }));
vi.mock("@/lib/stt", () => ({ transcribe, STT_MODEL: "m", STT_PROVIDER: "p" }));
vi.mock("@/lib/dictation-receipt", () => ({
  readReceipt: async (_s: unknown, uuid: string | null) => (uuid === "seen" ? prior : null),
  saveReceipt: vi.fn(),
}));

describe("late-dictation route replay", () => {
  beforeEach(() => transcribe.mockReset());

  it("returns the first answer for a take already processed, without transcribing again", async () => {
    const { POST } = await import("@/app/api/entries/late-dictation/route");
    const form = new FormData();
    form.set("patient_id", "p1");
    form.set("screen", "note");
    form.set("client_uuid", "seen");
    form.set("audio", new Blob(["x".repeat(2000)], { type: "audio/webm" }), "audio.webm");
    const res = await POST(new Request("http://x/api/entries/late-dictation", { method: "POST", body: form }));
    expect(await res.json()).toEqual(prior);
    expect(transcribe).not.toHaveBeenCalled();
  });

  it("refuses a screen it does not know", async () => {
    const { POST } = await import("@/app/api/entries/late-dictation/route");
    const form = new FormData();
    form.set("patient_id", "p1");
    form.set("screen", "elsewhere");
    form.set("audio", new Blob(["x"]), "audio.webm");
    const res = await POST(new Request("http://x/api/entries/late-dictation", { method: "POST", body: form }));
    expect(res.status).toBe(400);
  });
});
