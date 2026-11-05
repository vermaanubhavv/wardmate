import { describe, expect, it } from "vitest";
import { body, toSend, type Pending } from "../outbox";

const item = (id: string, attempts: number): Pending => ({
  id,
  kind: "bedside",
  url: "/api/entries/voice",
  label: "Bedside note",
  audio: new Blob(),
  mimeType: "audio/mp4",
  queuedAt: "2026-10-18T09:00:00Z",
  attempts,
});

describe("toSend", () => {
  const items = [item("fresh", 0), item("refused", 1), item("uploading", 0)];
  const uploading = new Set(["uploading"]);

  it("never auto-retries a recording the server refused", () => {
    expect(toSend(items, uploading, false).map((i) => i.id)).toEqual(["fresh"]);
  });

  it("retries a refused recording when the resident presses Try again", () => {
    expect(toSend(items, uploading, true).map((i) => i.id)).toEqual(["fresh", "refused"]);
  });
});

describe("body", () => {
  const base = { id: "x", label: "", queuedAt: "2026-10-18T09:00:00Z", attempts: 0, patientId: "p1" };

  it("posts a typed note as JSON", () => {
    const b = body({ ...base, kind: "text", url: "/api/entries/text", text: "drain 5 ml" });
    expect(b.headers?.["content-type"]).toBe("application/json");
    expect(JSON.parse(String(b.body))).toEqual({ patient_id: "p1", text: "drain 5 ml" });
  });

  it("posts a photo as a form with the patient", () => {
    const b = body({ ...base, kind: "photo", url: "/api/entries/photo", photo: new Blob(["img"], { type: "image/jpeg" }) });
    const form = b.body as FormData;
    expect(form.get("patient_id")).toBe("p1");
    expect((form.get("photo") as File).type).toBe("image/jpeg");
  });

  it("posts a recording with its extension and client id", () => {
    const b = body({ ...base, kind: "bedside", url: "/api/entries/voice", audio: new Blob(), mimeType: "audio/mp4" });
    const form = b.body as FormData;
    expect((form.get("audio") as File).name).toBe("audio.m4a");
    expect(form.get("client_uuid")).toBe("x");
  });
});
