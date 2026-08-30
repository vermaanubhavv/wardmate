import type { DischargeMedication } from "@/lib/discharge-entities";
import { medicationFields } from "@/lib/medication-fields";
import {
  esicFrequency,
  esicRoute,
  esicDoseUnit,
  esicDurationUnit,
} from "@/lib/esic-prescription-codes";

/**
 * The discharge medications as the ESIC prescribing form's own field VALUES, for the browser
 * extension that fills that form.
 *
 * The discharge summary body no longer carries ESIC codes (protocol v1.0 — generic layout),
 * but the pilot unit still prescribes on the ESIC system, so this hand-off stays. Every value
 * here is an option VALUE, not display text — "53:1:3" for OD, "26" for oral — because the ESIC
 * lists hold many rows whose text repeats and selecting by value is the only way to mean one
 * specific entry.
 *
 * A drug with no confirmed formulary mapping is included with formulary: null rather than
 * dropped, so the extension can say "3 of 5 filled, 2 need linking" instead of silently
 * entering a shorter prescription than the doctor wrote.
 */
export type EsicMedication = {
  drug: string;
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
  patient: string;
  /** Checked against the record open in the hospital system before anything is entered. Null
   *  when WardMate never recorded one — which must stop the automation, not soften into a name
   *  match. */
  uhid: string | null;
  generatedAt: string;
  medications: EsicMedication[];
};

const numberOf = (text: string | null): string | null => text?.match(/^[\d.]+/)?.[0] ?? null;

/** Re-derive the neutral prescription codes for a discharge medication row by feeding its
 *  fields back through the same parser a dictated drug goes through. */
function codesFor(m: DischargeMedication) {
  const phrase = [m.strength, m.dose, m.route, m.frequency, m.duration].filter(Boolean).join(" ");
  return medicationFields(m.generic, phrase);
}

export function buildEsicPayload(
  medications: DischargeMedication[],
  patientName: string,
  uhid: string | null,
  formularyMappings: Map<string, string>
): EsicPayload {
  return {
    patient: patientName,
    uhid,
    generatedAt: new Date().toISOString(),
    medications: medications.map((m) => {
      const fields = codesFor(m);
      const doseUnit = esicDoseUnit(fields.doseUnitCode);
      const durationUnit = esicDurationUnit(fields.durationUnitCode);
      return {
        drug: m.generic,
        formulary: formularyMappings.get(m.drugKey) ?? null,
        doseValue: numberOf(fields.dose),
        doseUnit: doseUnit?.value ?? null,
        durationValue: fields.durationValue !== null ? String(fields.durationValue) : null,
        durationUnit: durationUnit?.value ?? null,
        frequency: esicFrequency(fields.frequencyCode)?.value ?? null,
        quantityValue: numberOf(fields.quantity),
        quantityUnit: doseUnit?.value ?? null,
        route: esicRoute(fields.routeCode)?.value ?? null,
      };
    }),
  };
}
