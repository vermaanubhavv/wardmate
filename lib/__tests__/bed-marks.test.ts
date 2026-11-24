import { describe, expect, it, vi } from "vitest";
import { insertBedMarks, parseBedMarks } from "../bed-marks";

const words = [
  { word: "Stop", start: 0.4 },
  { word: "ceftriaxone.", start: 0.9 },
  { word: "Repeat", start: 6.2 },
  { word: "Hb.", start: 6.6 },
];

describe("insertBedMarks", () => {
  it("writes the pinned bed before the first word said after each tap", () => {
    expect(insertBedMarks(words, [{ bed: "12", at: 0 }, { bed: "14", at: 5 }])).toBe(
      "Bed 12. Stop ceftriaxone. Bed 14. Repeat Hb."
    );
  });
  it("keeps only the last of several taps before the same word", () => {
    expect(insertBedMarks(words, [{ bed: "12", at: 2 }, { bed: "14", at: 3 }])).toBe(
      "Stop ceftriaxone. Bed 14. Repeat Hb."
    );
  });
  it("adds nothing for a tap after the last word, or with no taps", () => {
    expect(insertBedMarks(words, [{ bed: "15", at: 9 }])).toBe("Stop ceftriaxone. Repeat Hb.");
    expect(insertBedMarks(words, [])).toBe("Stop ceftriaxone. Repeat Hb.");
  });
});

describe("parseBedMarks", () => {
  it("keeps well-formed marks, sorted by time", () => {
    expect(parseBedMarks('[{"bed":"14","at":5},{"bed":"12A","at":0}]')).toEqual([
      { bed: "12A", at: 0 },
      { bed: "14", at: 5 },
    ]);
  });
  it("drops anything malformed rather than trusting it", () => {
    expect(parseBedMarks('[{"bed":"<b>","at":1},{"bed":"3","at":-1},{"bed":"4"}]')).toEqual([]);
    expect(parseBedMarks("not json")).toEqual([]);
    expect(parseBedMarks(null)).toEqual([]);
  });
});

describe("parseBedMarks with the ward's beds", () => {
  it("keeps a real bed whose label the plain pattern would refuse", () => {
    const beds = new Set(["Bay 2.1", "ICU (iso) 3"]);
    expect(parseBedMarks('[{"bed":"Bay 2.1","at":1},{"bed":"ICU (iso) 3","at":2}]', beds)).toEqual([
      { bed: "Bay 2.1", at: 1 },
      { bed: "ICU (iso) 3", at: 2 },
    ]);
    expect(parseBedMarks('[{"bed":"Bay 9.9","at":1}]', beds)).toEqual([]);
  });
});

describe("recordingClock", () => {
  it("leaves paused time out, so taps line up with the transcriber's word timings", async () => {
    const { recordingClock } = await import("../use-dictation");
    let t = 0;
    const c = recordingClock(() => t);
    c.start();
    t = 30_000; c.pause();          // 30 s recorded
    t = 120_000;                    // 90 s talking to seniors
    expect(c.seconds()).toBe(30);   // a tap now lands at 0:30
    c.resume();
    t = 125_000;
    expect(c.seconds()).toBe(35);
    c.pause(); c.pause();           // a double tap does not double count
    expect(c.seconds()).toBe(35);
  });
});

describe("pinnedBedRoundEnabled", () => {
  it("is on only for the units listed in PINNED_BED_UNITS", async () => {
    const { pinnedBedRoundEnabled } = await import("../bed-marks");
    vi.stubEnv("PINNED_BED_UNITS", "TESTAAAA, TESTBBBB");
    expect(pinnedBedRoundEnabled("TESTBBBB")).toBe(true);
    expect(pinnedBedRoundEnabled("OTHER123")).toBe(false);
    expect(pinnedBedRoundEnabled(null)).toBe(false);
    vi.unstubAllEnvs();
    expect(pinnedBedRoundEnabled("TESTBBBB")).toBe(false);
  });
});
