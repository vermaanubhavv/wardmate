import type { RegisterRow } from "@/lib/read-register";

export type MatchStatus = "matched" | "bed_mismatch" | "no_match" | "ambiguous";

export type MatchedRow = {
  row: RegisterRow;
  patientId: string | null;
  status: MatchStatus;
  /** Populated for 'ambiguous': the candidates a human has to choose between. */
  candidates: { id: string; display_name: string; bed: string }[];
  note: string | null;
};

type WardPatient = { id: string; display_name: string; bed: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Line up register rows with patients already on the ward.
 *
 * Matching is on name, with bed as a cross-check, because that is how this unit's register is
 * organised. The rule throughout is that anything short of an unambiguous match becomes a
 * question for the resident rather than a guess — writing a value onto the wrong patient is
 * the worst thing this feature could do, and it would be invisible afterwards.
 */
export function matchRegisterRows(rows: RegisterRow[], patients: WardPatient[]): MatchedRow[] {
  return rows.map((row) => {
    const name = norm(row.name);

    if (!name) {
      return {
        row,
        patientId: null,
        status: "no_match" as const,
        candidates: patients,
        note: "No name written on this row.",
      };
    }

    const exact = patients.filter((p) => norm(p.display_name) === name);

    // Fall back to token overlap, which catches "Ram Lal" against "Ramlal Yadav" and the
    // ordinary spelling drift of a handwritten name — but only ever as a candidate to
    // choose from, never as an automatic match.
    const nameTokens = new Set(name.split(" ").filter((t) => t.length > 2));
    const partial =
      exact.length > 0
        ? []
        : patients.filter((p) => {
            const theirs = new Set(norm(p.display_name).split(" ").filter((t) => t.length > 2));
            for (const t of nameTokens) if (theirs.has(t)) return true;
            return false;
          });

    if (exact.length === 1) {
      const p = exact[0];
      const bedWritten = norm(row.bed);
      const bedKnown = norm(p.bed);

      if (bedWritten && bedKnown && bedWritten !== bedKnown) {
        return {
          row,
          patientId: p.id,
          status: "bed_mismatch" as const,
          candidates: patients,
          note: `Register says bed ${row.bed}; the app has ${p.bed}.`,
        };
      }
      return { row, patientId: p.id, status: "matched" as const, candidates: [], note: null };
    }

    if (exact.length > 1) {
      return {
        row,
        patientId: null,
        status: "ambiguous" as const,
        candidates: exact,
        note: `${exact.length} patients on this ward share that name.`,
      };
    }

    if (partial.length > 0) {
      return {
        row,
        patientId: null,
        status: "ambiguous" as const,
        candidates: partial,
        note: "Name is close but not identical — confirm which patient this is.",
      };
    }

    return {
      row,
      patientId: null,
      status: "no_match" as const,
      candidates: patients,
      note: "No patient on this ward matches that name.",
    };
  });
}
