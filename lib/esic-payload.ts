import type { DischargeNote } from "@/lib/discharge";
import {
  esicFrequency,
  esicRoute,
  esicDoseUnit,
  esicDurationUnit,
} from "@/lib/esic-prescription-codes";

/**
 * The discharge medications as the hospital prescribing form's own field values, for the
 * browser extension that fills that form.
 *
 * Every value here is an OPTION VALUE, not display text — "53:1:3" for OD, "26" for oral,
 * "213" for tablets. That is the whole point: the route list holds five separate entries whose
 * text mentions "intravenous", and the formulary holds 871 rows whose text repeats. Selecting
 * by value is the only way to mean one specific thing.
 *
 * A drug with no confirmed formulary mapping is included with formulary: null rather than
 * dropped, so the extension can say "3 of 5 filled, these 2 need linking" instead of silently
 * entering a shorter prescription than the doctor wrote.
 */
export type EsicMedication = {
  /** WardMate's own name for the drug, shown to the resident so they can follow along. */
  drug: string;
  /** The hospital formulary's exact wording. Null until a clinician has confirmed which entry
   *  this drug is — the extension must skip these, never guess. */
  formulary: string | null;
  doseValue: string | null;
  doseUnit: string | null;
  durationValue: string | null;
  durationUnit: string | null;
  frequency: string | null;
  quantityValue: string | null;
  quantityUnit: string | null;
  route: string | null;
};

export type EsicPayload = {
  /** Stamped so the extension can show it and the resident can see at a glance that they are
   *  about to fill the patient they think they are. The extension never matches on it — it
   *  cannot know which patient the ESIC page has open — it only displays it. */
  patient: string;
  generatedAt: string;
  medications: EsicMedication[];
};

/** Splits "7 Tablet(s)" into the number, which is all the form's text box wants. */
const numberOf = (text: string | null): string | null => text?.match(/^[\d.]+/)?.[0] ?? null;

export function buildEsicPayload(note: DischargeNote): EsicPayload {
  return {
    patient: note.header.name,
    generatedAt: new Date().toISOString(),
    medications: note.advice.rows.map((row) => {
      const doseUnit = esicDoseUnit(row.doseUnitCode);
      const durationUnit = esicDurationUnit(row.durationUnitCode);
      return {
        drug: row.drugName || row.drug,
        formulary: row.formularyName,
        doseValue: numberOf(row.dose),
        doseUnit: doseUnit?.value ?? null,
        durationValue: row.durationValue !== null ? String(row.durationValue) : null,
        durationUnit: durationUnit?.value ?? null,
        frequency: esicFrequency(row.frequencyCode)?.value ?? null,
        // Quantity uses the same unit list as dose, and the same unit — a course of tablets is
        // dispensed in tablets. Left null with the number when the unit has no entry in the
        // hospital's list (an inhaler puff), so a human chooses rather than this file guessing.
        quantityValue: numberOf(row.quantity),
        quantityUnit: doseUnit?.value ?? null,
        route: esicRoute(row.routeCode)?.value ?? null,
      };
    }),
  };
}
