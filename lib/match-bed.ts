export type BedMatchStatus = "matched" | "ambiguous" | "no_match" | "free";

export type BedMatch = {
  status: BedMatchStatus;
  patientId: string | null;
  candidates: { id: string; display_name: string; bed: string }[];
  note: string | null;
};

type WardPatient = { id: string; display_name: string; bed: string };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The trailing number of a bed label: "SW-12" gives 12, "ICU-3" gives 3. */
function bedNumber(s: string): string | null {
  const m = s.match(/(\d+)\s*$/);
  return m ? String(parseInt(m[1], 10)) : null;
}

/**
 * Work out which patient a spoken bed means.
 *
 * Deliberately in code rather than left to the model, because this is the step where a
 * mistake is invisible afterwards: an instruction on the wrong patient reads perfectly
 * normally. Anything short of exactly one match becomes a question for the resident.
 *
 * A bare number is accepted — residents say "bed 1", not "bed S-W-one" — but only when the
 * ward has exactly one bed ending in that number. A unit with both SW-1 and ICU-1 makes
 * "bed 1" ambiguous, and it is asked about rather than resolved by picking the first.
 */
export function matchBed(spoken: string, patients: WardPatient[]): BedMatch {
  const said = norm(spoken);

  if (!said) {
    return {
      status: "no_match",
      patientId: null,
      candidates: patients,
      note: "No bed was said — choose the patient this is about.",
    };
  }

  const exact = patients.filter((p) => norm(p.bed) === said);
  if (exact.length === 1) {
    return { status: "matched", patientId: exact[0].id, candidates: [], note: null };
  }
  if (exact.length > 1) {
    return {
      status: "ambiguous",
      patientId: null,
      candidates: exact,
      note: `${exact.length} patients are recorded in bed ${spoken}.`,
    };
  }

  // Spoken as a bare number: match on the number the unit's bed labels end with.
  const spokenNumber = bedNumber(spoken);
  if (spokenNumber && /^\d+$/.test(said)) {
    const byNumber = patients.filter((p) => bedNumber(p.bed) === spokenNumber);

    if (byNumber.length === 1) {
      return { status: "matched", patientId: byNumber[0].id, candidates: [], note: null };
    }
    if (byNumber.length > 1) {
      return {
        status: "ambiguous",
        patientId: null,
        candidates: byNumber,
        note: `More than one bed ends in ${spokenNumber} — which one?`,
      };
    }
  }

  return {
    status: "no_match",
    patientId: null,
    candidates: patients,
    note: `No patient is in bed ${spoken}.`,
  };
}

/**
 * For an admission the check runs the other way: the bed must NOT already be occupied.
 *
 * An occupied bed is the signal that something was misheard — either the bed number, or the
 * fact that this was an admission at all — so it is surfaced with the patient already there
 * named, rather than quietly creating a second patient in one bed.
 */
export function matchFreeBed(spoken: string, patients: WardPatient[]): BedMatch {
  const taken = matchBed(spoken, patients);

  if (taken.status === "no_match") {
    return { status: "free", patientId: null, candidates: [], note: null };
  }

  // Whoever is already there: the single match, or every candidate when it was ambiguous.
  const occupants =
    taken.patientId !== null
      ? patients.filter((p) => p.id === taken.patientId)
      : taken.candidates;

  return {
    status: "ambiguous",
    patientId: null,
    candidates: occupants,
    note: `Bed ${spoken} already has a patient. Check the bed before admitting to it.`,
  };
}
