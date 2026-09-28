import type { Reference } from "@/lib/history-check/types";
import type { FluidBlock, FormulaVar } from "@/lib/fluids/types";
import type { CalcKey } from "@/lib/fluids/calc";

/** The one source every topic digests. Chapter and page go in the topic's `source`. */
export const PANDYA: Reference = {
  title: "Practical Guidelines on Fluid Therapy, 3rd edition",
  source: "Dr Sanjay Pandya, Rajkot (fluidtherapy.org)",
  year: 2024,
  url: "https://www.fluidtherapy.org",
};

/** Small constructors so a topic file reads as content rather than braces. */
export const points = (items: string[], title?: string): FluidBlock => ({ kind: "points", items, ...(title ? { title } : {}) });
export const steps = (stepsList: string[], title?: string): FluidBlock => ({ kind: "steps", steps: stepsList, ...(title ? { title } : {}) });
export const caution = (items: string[], title?: string): FluidBlock => ({ kind: "caution", items, ...(title ? { title } : {}) });
export const table = (columns: string[], rows: string[][], title?: string, note?: string): FluidBlock => ({ kind: "table", columns, rows, ...(title ? { title } : {}), ...(note ? { note } : {}) });
export const quote = (text: string, page: string): FluidBlock => ({ kind: "quote", text, page });
export const formula = (
  name: string,
  expression: string,
  variables: FormulaVar[],
  extra: { example?: string; note?: string; calc?: CalcKey } = {}
): FluidBlock => ({ kind: "formula", name, expression, variables, ...extra });
