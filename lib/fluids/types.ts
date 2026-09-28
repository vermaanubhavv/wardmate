import type { Reference } from "@/lib/history-check/types";
import type { CalcKey } from "@/lib/fluids/calc";

/**
 * IV Fluid and Electrolyte Correction — reference topics for the Learn shelf.
 *
 * Unlike the history trees and examination checklists, this content DOES carry doses, rates
 * and targets: it is a digest of a standard fluid-therapy text (Pandya, Practical Guidelines
 * on Fluid Therapy, 3rd ed 2024) and a resident reads it the way they would read the book.
 * The page says so, once, and every number stays "pending clinician review" until a named
 * clinician signs the topic off. Nothing here is written to a patient.
 */
export const FLUID_GROUPS = ["fluids", "electrolytes", "acid_base", "settings"] as const;
export type FluidGroup = (typeof FLUID_GROUPS)[number];

export const FLUID_GROUP_LABEL: Record<FluidGroup, string> = {
  fluids: "Fluids and prescribing",
  electrolytes: "Electrolyte correction",
  acid_base: "Acid–base",
  settings: "Fluids by clinical setting",
};

export type FormulaVar = { symbol: string; meaning: string; unit?: string };

export type FluidBlock =
  | { kind: "points"; title?: string; items: string[] }
  | { kind: "table"; title?: string; columns: string[]; rows: string[][]; note?: string }
  | {
      kind: "formula";
      name: string;
      expression: string;
      variables: FormulaVar[];
      example?: string;
      note?: string;
      /** Wire the formula to a pure calculator so the page can work it for a set of inputs. */
      calc?: CalcKey;
    }
  | { kind: "steps"; title?: string; steps: string[] }
  | { kind: "caution"; title?: string; items: string[] }
  /** A short verbatim line from the source, with the PDF page, for the safety-critical numbers. */
  | { kind: "quote"; text: string; page: string };

export type FluidSection = {
  id: string;
  title: string;
  intro?: string;
  blocks: FluidBlock[];
};

export type FluidTopic = {
  id: string;
  version: string;
  title: string;
  group: FluidGroup;
  /** One line under the title on the shelf. */
  summary: string;
  setting: string;
  reviewStatus: "pending_clinician_review" | "reviewed";
  reviewedBy: string | null;
  references: Reference[];
  /** Which chapters of the source the topic digests, and the PDF page range. */
  source: { chapters: string[]; pages: string };
  sections: FluidSection[];
};
