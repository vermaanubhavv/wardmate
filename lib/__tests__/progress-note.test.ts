import { describe, expect, it } from "vitest";
import { buildProgressNote, type ProgressNotePatient } from "@/lib/progress-note";
import type { Observation } from "@/lib/patient-state";

function obs(partial: Partial<Observation> & Pick<Observation, "kind" | "label">): Observation {
  return {
    id: "id",
    value_text: null,
    value_num: null,
    unit: null,
    source_quote: "",
    needs_confirmation: false,
    confirmed_at: null,
    conflict_note: null,
    done_at: null,
    urgency: "routine",
    graded_at: null,
    recorded_at: "2026-09-18T04:00:00.000Z",
    ...partial,
  } as Observation;
}

const patient: ProgressNotePatient = {
  display_name: "Mr. Ram Kumar",
  age_years: 45,
  sex: "male",
  bed: "12",
  uhid_ip_no: "IP123",
  mrd_no: null,
  admitted_on: "2026-09-15T00:00:00.000Z",
};

describe("buildProgressNote SOAP grouping", () => {
  it("keeps the fixed ESIC observation/plan column exactly as before", () => {
    const todays: Observation[] = [
      obs({ kind: "note", label: "complaint", value_text: "Pain at incision site" }),
      obs({ kind: "vital", label: "BP", value_text: "120/80" }),
      obs({ kind: "exam", label: "Abdomen", value_text: "Soft, non-tender" }),
    ];
    const note = buildProgressNote(patient, todays, todays, "Acute appendicitis");

    // Untouched by the SOAP refactor — same shape the ESIC sheet and copy button rely on.
    expect(note.observation.some((l) => l.startsWith("C/O -"))).toBe(true);
    expect(note.plan[0]).toBe("Plan:");
    expect(note.header.uhid).toBe("IP123");
  });

  it("splits today's round into subjective/objective/assessment without dropping facts", () => {
    const todays: Observation[] = [
      obs({ kind: "note", label: "complaint", value_text: "Pain at incision site" }),
      obs({ kind: "vital", label: "BP", value_text: "120/80" }),
      obs({ kind: "exam", label: "Abdomen", value_text: "Soft, non-tender" }),
      obs({ kind: "note", label: "assessment", value_text: "Stable, improving" }),
    ];
    const note = buildProgressNote(patient, todays, todays, "Acute appendicitis", {
      status: "Post Op Day (2)",
    });

    expect(note.subjective.join(" ")).toContain("Pain at incision site");
    expect(note.objective.join(" ")).toContain("120/80");
    expect(note.objective.join(" ")).toContain("Soft, non-tender");
    expect(note.assessment.join(" ")).toContain("Acute appendicitis");
    expect(note.assessment.join(" ")).toContain("Stable, improving");
    // Nothing here belongs in Plan — that stays exactly the existing `plan` column.
    expect(note.subjective.join(" ")).not.toContain("120/80");
  });

  it("prints the label with a blank rather than inventing a value that was never recorded", () => {
    const note = buildProgressNote(patient, [], [], null);
    expect(note.header.dob).toMatch(/^_+$/);
    expect(note.practitionerName).toBeNull();
  });

  it("uses the signed-in doctor's own name when their profile has one", () => {
    const note = buildProgressNote(patient, [], [], null, { practitionerName: "Dr. Anubhav" });
    expect(note.practitionerName).toBe("Dr. Anubhav");
  });
});
