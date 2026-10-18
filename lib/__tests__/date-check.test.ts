import { describe, it, expect } from "vitest";
import { dateQuestions, groundedDates, structuredDateQuestions, type DateAnchors } from "@/lib/date-check";

// Synthetic dates shaped like the audited summary: admitted 01/10, history op 14/08.
const anchors: DateAnchors = {
  today: "2026-10-01",
  admittedOn: "2026-10-01",
  dischargedOn: null,
  procedures: [{ name: "Incision and drainage", date: "2026-10-06" }],
};

describe("date check: structured dates (no model)", () => {
  it("asks about an operation dated after today or before admission", () => {
    expect(structuredDateQuestions(anchors)).toEqual([
      "Incision and drainage is dated 06/10/2026, which is after today — is that right?",
    ]);
    const early = { ...anchors, procedures: [{ name: "Laparotomy", date: "2026-09-20" }] };
    expect(structuredDateQuestions(early)[0]).toMatch(/before the admission on 01\/10\/2026/);
  });
  it("says nothing when the dates sit inside the stay", () => {
    expect(structuredDateQuestions({ ...anchors, procedures: [{ name: "Laparotomy", date: "2026-10-01" }] })).toEqual([]);
  });
});

describe("date check: dates Haiku read from the text", () => {
  const text = "lap chole done on 14/08/2026. Presented on 18/09/2026. Exploratory laparotomy on 29/08/26.";

  it("keeps only dates whose quote is in the text and carries the day", () => {
    const kept = groundedDates(
      [
        { quote: "lap chole done on 14/08/2026", date: "2026-08-14", event: "laparoscopic cholecystectomy", thisAdmission: false },
        { quote: "not in the text 14/08", date: "2026-08-14", event: "x", thisAdmission: true },
        { quote: "Presented on 18/09/2026", date: "2026-09-19", event: "admission", thisAdmission: true },
      ],
      text
    );
    expect(kept.map((k) => k.event)).toEqual(["laparoscopic cholecystectomy"]);
  });

  it("asks about this-admission events before admission, and an admission on two dates — not past history", () => {
    const q = dateQuestions(
      [
        { quote: "lap chole done on 14/08/2026", date: "2026-08-14", event: "laparoscopic cholecystectomy", thisAdmission: false },
        { quote: "Presented on 18/09/2026", date: "2026-09-18", event: "admission", thisAdmission: true },
      ],
      anchors
    );
    expect(q.some((x) => x.includes("cholecystectomy"))).toBe(false);
    expect(q).toContain('"Presented on 18/09/2026" is dated 18/09/2026, before the admission on 01/10/2026 — is that right?');
    expect(q).toContain("The admission is given 18/09/2026 and 01/10/2026 — which is right?");
  });

  it("asks when the text and the operation record disagree", () => {
    const q = dateQuestions(
      [{ quote: "drainage on 04/10/2026", date: "2026-10-04", event: "incision and drainage", thisAdmission: true }],
      { ...anchors, today: "2026-10-10" }
    );
    expect(q).toContain("The incision and drainage is given 04/10/2026 and 06/10/2026 — which is right?");
  });
});
