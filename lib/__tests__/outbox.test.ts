import { describe, expect, it } from "vitest";
import { toSend, type Pending } from "../outbox";

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
