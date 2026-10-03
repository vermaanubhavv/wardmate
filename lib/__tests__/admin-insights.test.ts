import { describe, it, expect } from "vitest";
import { recommend, screenLabel, groupScreens, funnelByDepartment } from "@/lib/admin-insights";

const empty = { funnel: [], weeks: [], usage: [], stt: [], screens: [], friction: [], feedback: [] };

describe("admin insights", () => {
  it("names the biggest funnel drop and ranks it first", () => {
    const recs = recommend({
      ...empty,
      funnel: [
        { step: 1, label: "Signed up", users: 20 },
        { step: 2, label: "Created or joined a unit", users: 18 },
        { step: 3, label: "Added a patient", users: 15 },
        { step: 4, label: "Recorded a note or round", users: 5 },
      ],
    });
    expect(recs[0].priority).toBe("high");
    expect(recs[0].title).toContain("recorded a note or round");
    expect(recs[0].evidence).toContain("10 of 15");
  });

  it("stays quiet on tiny numbers and nudges for feedback when there is none", () => {
    const recs = recommend({ ...empty, funnel: [{ step: 1, label: "Signed up", users: 2 }, { step: 2, label: "x", users: 0 }] });
    expect(recs.map((r) => r.title)).toEqual(["No feedback collected yet"]);
  });

  it("flags a weekly-active drop using the last full week, not the partial current one", () => {
    const recs = recommend({
      ...empty,
      weeks: [
        { week: "a", active_users: 10, new_users: 0 },
        { week: "b", active_users: 5, new_users: 0 },
        { week: "c", active_users: 0, new_users: 0 },
      ],
    });
    expect(recs.some((r) => r.title === "Weekly active people fell" && r.evidence.includes("5 active last week"))).toBe(true);
  });

  it("maps screen paths to plain names and merges learn slugs", () => {
    expect(screenLabel("/patients/:id/discharge")).toBe("Discharge summary");
    expect(screenLabel("/learn/history/acute-abdomen")).toBe("Learn · history");
    expect(screenLabel("/something-new")).toBe("/something-new");
    const g = groupScreens([
      { screen: "/learn/history/a", views: 3, people: 2, views_30d: 3, people_30d: 2, last_seen: "2026-01-01" },
      { screen: "/learn/history/b", views: 4, people: 1, views_30d: 1, people_30d: 1, last_seen: "2026-02-01" },
    ]);
    expect(g).toHaveLength(1);
    expect(g[0]).toMatchObject({ label: "Learn · history", views: 7, views_30d: 4, last_seen: "2026-02-01" });
  });

  it("promotes high-severity usage friction", () => {
    const recs = recommend({
      ...empty,
      usageFriction: [
        { area: "Ward round", signal: "Round dictations thrown away", severity: "high", occurrences: 4, out_of: 7, people: 3, detail: "d", last_seen: null },
        { area: "Discharge", signal: "Stuck", severity: "medium", occurrences: 10, out_of: null, people: 8, detail: "d", last_seen: null },
      ],
    });
    expect(recs[0].title).toBe("Ward round: round dictations thrown away");
    expect(recs[0].evidence).toContain("4 of 7 (57%)");
    expect(recs.some((r) => r.title.startsWith("Discharge"))).toBe(false);
  });

  it("groups the department funnel, labels departments, and drops empty ones", () => {
    const row = (specialty: string, step: number, users: number) => ({ specialty, step, label: "", users });
    const out = funnelByDepartment([
      row("internal_medicine", 2, 3), row("internal_medicine", 1, 4),
      row("general_surgery", 1, 9), row("general_surgery", 2, 9),
      row("none", 1, 0),
    ]);
    expect(out.map((d) => d.label)).toEqual(["General Surgery", expect.any(String)]);
    expect(out[1].counts).toEqual([4, 3]);
  });
});
