import { describe, expect, it } from "vitest";
import {
  buildDeepgramParams,
  buildDeepgramUrl,
  keytermBudget,
  MAX_KEYTERMS,
} from "../buildDeepgramUrl";

describe("buildDeepgramUrl", () => {
  it("defaults to nova-3-medical / en-IN and repeats keyterm", () => {
    const p = buildDeepgramParams(["Ryle's tube", "Ranson's criteria"]);
    expect(p.get("model")).toBe("nova-3-medical");
    expect(p.get("language")).toBe("en-IN");
    expect(p.getAll("keyterm")).toEqual(["Ryle's tube", "Ranson's criteria"]);
  });

  it("carries through extra Deepgram flags without inventing any", () => {
    const p = buildDeepgramParams(["x"], { extra: { smart_format: true, diarize: false } });
    expect(p.get("smart_format")).toBe("true");
    expect(p.get("diarize")).toBe("false");
    expect(p.get("punctuate")).toBeNull();
  });

  it("never emits a comma-joined list or a legacy :weight", () => {
    const url = buildDeepgramUrl(["Ryle's tube", "Ranson's criteria", "CECT abdomen"]);
    expect(url).not.toMatch(/keyterm=[^&]*%2C/);
    expect(url).not.toMatch(/keyterm=[^&]*%3A\d/);
    expect((url.match(/[?&]keyterm=/g) ?? []).length).toBe(3);
  });

  it("drops case-insensitive duplicates and holds the 80-term cap", () => {
    const many = Array.from({ length: 120 }, (_, i) => `term ${i}`);
    many.push("TERM 0"); // dupe of "term 0"
    const p = buildDeepgramParams(many);
    expect(p.getAll("keyterm").length).toBe(MAX_KEYTERMS);
  });

  it("reports a PHI-safe keyterm budget", () => {
    const b = keytermBudget(["acute pancreatitis", "Ranson's criteria", "CECT abdomen"]);
    expect(b.count).toBe(3);
    expect(b.estimatedTokens).toBeGreaterThan(0);
    expect(b.withinWardmateCeiling).toBe(true);
    expect(b.withinDeepgramLimit).toBe(true);
  });
});
