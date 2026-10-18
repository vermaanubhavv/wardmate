import { describe, expect, it } from "vitest";
import { effectiveUrgency, jobTitle } from "../urgency";

// Said at 9am IST on 1 Oct; read at 9am IST on 15 Oct.
const said = "2026-10-01T03:30:00Z";
const now = "2026-10-15T03:30:00Z";

describe("job wording", () => {
  it("drops a 'tomorrow' that has passed, so it cannot sit beside 'overdue'", () => {
    expect(jobTitle("drain to be removed tomorrow", said, now)).toBe("Drain to be removed");
  });

  it("names the day a red job was due", () => {
    expect(effectiveUrgency({ urgency: "red", recorded_at: said }, now).note).toBe(
      "due 1 Oct · 14 days overdue"
    );
  });

  it("dates a yellow job from the day after it was said", () => {
    expect(effectiveUrgency({ urgency: "yellow", recorded_at: said }, now).note).toBe(
      "due 2 Oct · 13 days overdue"
    );
  });
});
