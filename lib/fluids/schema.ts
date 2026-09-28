import { validateReference, type ValidationResult } from "@/lib/history-check/schema";
import { CALCULATORS } from "@/lib/fluids/calc";
import { FLUID_GROUPS, type FluidBlock, type FluidSection, type FluidTopic } from "@/lib/fluids/types";

const ID = /^[a-z][a-z0-9_]*$/;
type Add = (path: string, message: string) => void;

/**
 * The content is data and data is checked before it is shown. This validator does NOT ban
 * doses (the topics are a digest of a dosing text); it checks shape, ids, that every topic
 * cites its source chapters and pages, that tables are rectangular, that formulas name their
 * variables, and that a wired calculator exists.
 */
export function validateFluidTopic(topic: unknown): ValidationResult {
  const issues: { path: string; message: string }[] = [];
  const add: Add = (path, message) => issues.push({ path, message });
  if (typeof topic !== "object" || topic === null) return { ok: false, issues: [{ path: "$", message: "topic must be an object" }] };
  const t = topic as Partial<FluidTopic>;
  if (!t.id || !ID.test(t.id)) add("$.id", "required, lowercase snake_case");
  if (!t.version || !/^\d+\.\d+\.\d+$/.test(t.version)) add("$.version", "semver required");
  if (!t.title) add("$.title", "required");
  if (!t.summary) add("$.summary", "required");
  if (!t.setting) add("$.setting", "required");
  if (!t.group || !(FLUID_GROUPS as readonly string[]).includes(t.group)) add("$.group", `must be one of ${FLUID_GROUPS.join(", ")}`);
  if (t.reviewStatus !== "pending_clinician_review" && t.reviewStatus !== "reviewed") add("$.reviewStatus", "must be pending_clinician_review or reviewed");
  if (t.reviewStatus === "reviewed" && !t.reviewedBy) add("$.reviewedBy", "a reviewed topic must name its reviewer");
  if (!Array.isArray(t.references) || t.references.length === 0) add("$.references", "at least one reference required");
  else t.references.forEach((r, i) => validateReference(r, `$.references[${i}]`, add));
  if (!t.source || !Array.isArray(t.source.chapters) || t.source.chapters.length === 0 || !t.source.pages) add("$.source", "chapters and pages required");
  if (!Array.isArray(t.sections) || t.sections.length === 0) {
    add("$.sections", "at least one section required");
    return { ok: issues.length === 0, issues };
  }
  const seen = new Set<string>();
  t.sections.forEach((s, i) => validateSection(s, `$.sections[${i}]`, add, seen));
  return { ok: issues.length === 0, issues };
}

function validateSection(s: FluidSection | undefined, p: string, add: Add, seen: Set<string>) {
  if (!s || typeof s !== "object") return add(p, "section must be an object");
  if (!s.id || !ID.test(s.id)) add(`${p}.id`, "required, lowercase snake_case");
  else if (seen.has(s.id)) add(`${p}.id`, `duplicate section id "${s.id}"`);
  else seen.add(s.id);
  if (!s.title) add(`${p}.title`, "required");
  if (!Array.isArray(s.blocks) || s.blocks.length === 0) return add(`${p}.blocks`, "at least one block required");
  s.blocks.forEach((b, i) => validateBlock(b, `${p}.blocks[${i}]`, add));
}

const nonEmpty = (xs: unknown, p: string, add: Add) => {
  if (!Array.isArray(xs) || xs.length === 0) return add(p, "at least one entry required");
  xs.forEach((x, i) => { if (typeof x !== "string" || !x.trim()) add(`${p}[${i}]`, "empty"); });
};

function validateBlock(b: FluidBlock | undefined, p: string, add: Add) {
  if (!b || typeof b !== "object") return add(p, "block must be an object");
  switch (b.kind) {
    case "points":
    case "caution":
      return nonEmpty(b.items, `${p}.items`, add);
    case "steps":
      return nonEmpty(b.steps, `${p}.steps`, add);
    case "quote":
      if (!b.text) add(`${p}.text`, "required");
      if (!b.page) add(`${p}.page`, "PDF page required");
      return;
    case "table":
      nonEmpty(b.columns, `${p}.columns`, add);
      if (!Array.isArray(b.rows) || b.rows.length === 0) return add(`${p}.rows`, "at least one row required");
      b.rows.forEach((row, i) => {
        if (!Array.isArray(row) || row.length !== b.columns.length) add(`${p}.rows[${i}]`, `expected ${b.columns?.length} cells`);
      });
      return;
    case "formula":
      if (!b.name) add(`${p}.name`, "required");
      if (!b.expression) add(`${p}.expression`, "required");
      if (!Array.isArray(b.variables) || b.variables.length === 0) add(`${p}.variables`, "name the variables");
      else b.variables.forEach((v, i) => { if (!v.symbol || !v.meaning) add(`${p}.variables[${i}]`, "symbol and meaning required"); });
      if (b.calc !== undefined && !(b.calc in CALCULATORS)) add(`${p}.calc`, `unknown calculator "${b.calc}"`);
      return;
    default:
      add(`${p}.kind`, `unknown block kind "${(b as { kind?: string }).kind}"`);
  }
}
