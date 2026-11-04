import { stripPatientHonorific } from "@/lib/patients";

/**
 * A new patient spoken with no signal and created later (app/api/patients/new-by-voice).
 * Client-safe: the connection bar reads the result, the route decides it.
 */

export type NewPatientResult = {
  /** created — added; exists — the same bed and name is already on the unit, not added again;
   *  incomplete — no name or no bed was heard; failed — the database refused it. */
  status: "created" | "exists" | "incomplete" | "failed";
  patient_id?: string;
  name: string;
  bed: string;
  /** What was heard, so a patient that could not be added can be typed in from it. */
  transcript: string;
  recorded_at: string;
  processed_at: string;
  error?: string;
};

const normName = (s: string) => stripPatientHonorific(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const normBed = (s: string) => s.toLowerCase().replace(/\bbed\b|\bno\.?\b/g, "").replace(/[^a-z0-9]+/g, "");

/** The obvious double: same bed and the same name, ignoring titles, case and punctuation. */
export function sameAdmission(
  onWard: { display_name: string | null; bed: string | null },
  spoken: { name: string; bed: string }
): boolean {
  return normBed(onWard.bed ?? "") === normBed(spoken.bed) && normName(onWard.display_name ?? "") === normName(spoken.name);
}
