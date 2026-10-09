import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * Builders shared by every lib/discharge-templates*.ts file. A leaf module on purpose:
 * discharge-templates.ts imports the urology templates at runtime, so helpers living there would
 * form an import cycle with every specialty file that used them.
 */

export const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

type ProcedureScaffold = DischargeTemplate["scaffold"]["procedure"];

/** A procedure scaffold whose complications default to "Nil". */
export const proc = (p: Omit<ProcedureScaffold, "complications"> & { complications?: string }): ProcedureScaffold => ({
  complications: "Nil",
  ...p,
});

/** The standard adult lines several specialties print word for word. */
export const COMMON_MEDS = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
};
