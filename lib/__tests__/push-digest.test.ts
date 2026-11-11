import { describe, expect, it } from "vitest";
import { handoverDigest } from "@/lib/push-digest";

const now = "2026-11-11T13:00:00.000Z";
const job = (urgency: "red" | "yellow" | "green" | null, recorded_at: string) => ({ urgency, graded_at: null, recorded_at });

describe("handoverDigest — counts red as the calendar has it today", () => {
  it("a Soon from yesterday has come due and counts; a Soon from today does not", () => {
    const d = handoverDigest([job("yellow", "2026-11-10T04:00:00.000Z"), job("yellow", now), job("red", now)], now);
    expect(d.body).toBe("2 red jobs assigned to you still open.");
    expect(d.url).toBe("/handover");
  });
  it("names no count when nothing is red", () => {
    expect(handoverDigest([job("green", now), job(null, now)], now).body).toBe("Open WardMate to read the handover.");
  });
});
