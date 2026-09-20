import { describe, it, expect } from "vitest";
import { historyReadsNormal, summariseCaseHistory, caseHistorySectionOf } from "@/lib/case-history";

type Obs = { id: string; kind: string; label: string; value_text: string | null };

const obs = (id: string, label: string, value_text: string | null, kind = "note"): Obs => ({
  id,
  kind,
  label,
  value_text,
});

describe("personal history section", () => {
  it("routes 'personal history' and its aliases to the personal bucket", () => {
    expect(caseHistorySectionOf("personal history")).toBe("personal");
    expect(caseHistorySectionOf("habits")).toBe("personal");
    expect(caseHistorySectionOf("addiction history")).toBe("personal");
    expect(caseHistorySectionOf("Addictions")).toBe("personal");
  });

  it("is NR when nobody recorded it, NAD when a denial was recorded, and shown when positive", () => {
    const nr = summariseCaseHistory([obs("1", "past history", "K/C/O DM")]);
    const personalNr = nr.sections.find((s) => s.key === "personal")!;
    expect(personalNr.note).toBe("NR");
    expect(personalNr.hidden).toBe(false);

    // "Non-smoker" does not match the denial-prefix shape ("no "/"nil "/"not " + word) that
    // collapses a line to NAD — historyReadsNormal requires whitespace after the lead word, and
    // "non-smoker" has a hyphen there instead. So it stays a printed line, not a silent NAD;
    // that is the existing, intentional behaviour of historyReadsNormal, asserted here so a
    // future change to that regex is caught rather than silently changing what gets printed.
    const stated = summariseCaseHistory([obs("1", "personal history", "Non-smoker, no alcohol")]);
    const personalStated = stated.sections.find((s) => s.key === "personal")!;
    expect(personalStated.lines.map((l) => l.text)).toEqual(["Non-smoker, no alcohol"]);

    const positive = summariseCaseHistory([
      obs("1", "personal history", "Chronic smoker, one pack a day for fifteen years"),
    ]);
    const personalPositive = positive.sections.find((s) => s.key === "personal")!;
    expect(personalPositive.lines.map((l) => l.text)).toEqual([
      "Chronic smoker, one pack a day for fifteen years",
    ]);
  });

  it("plain 'no addictions' collapses to NAD, like any other denied section", () => {
    const summary = summariseCaseHistory([obs("1", "personal history", "no addictions")]);
    const personal = summary.sections.find((s) => s.key === "personal")!;
    expect(personal.note).toBe("NAD");
    expect(personal.lines).toEqual([]);
  });

  it("does not fall into 'other' (the examination) and does not collide with past history", () => {
    const summary = summariseCaseHistory([
      obs("1", "past history", "K/C/O HTN since 2019"),
      obs("2", "personal history", "Smoker, ten cigarettes a day"),
    ]);
    expect(summary.other).toHaveLength(0);
    const past = summary.sections.find((s) => s.key === "past")!;
    const personal = summary.sections.find((s) => s.key === "personal")!;
    expect(past.lines.map((l) => l.text)).toEqual(["K/C/O HTN since 2019"]);
    expect(personal.lines.map((l) => l.text)).toEqual(["Smoker, ten cigarettes a day"]);
  });
});

describe("historyReadsNormal — personal-history denials", () => {
  it("reads plain denials as normal", () => {
    expect(historyReadsNormal("no addictions")).toBe(true);
    expect(historyReadsNormal("nil")).toBe(true);
    expect(historyReadsNormal("non-smoker")).toBe(false); // a plain positive statement, not a denial
  });

  it("keeps a denial with a real detail attached", () => {
    expect(historyReadsNormal("no addictions, but chews gutka occasionally")).toBe(false);
  });
});
