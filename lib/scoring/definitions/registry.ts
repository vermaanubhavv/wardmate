/**
 * The definition registry. Built-in pathway definitions live in code and are validated on
 * load; `pathway_definitions` rows in the database can add or override versions later without
 * a deploy (see `docs/scoring-engine.md` → "Rolling out a new pathway version").
 *
 * Historical pathway instances always keep the exact `pathwayVersion` they were started on —
 * the store resolves an instance's definition by (pathwayId, pathwayVersion), never "latest"
 * (DOCX test 20).
 */

import { validatePathwayDefinition } from "../schema";
import type { PathwayDefinition } from "../types";
import { acutePancreatitisV1 } from "./acute-pancreatitis.v1";
import { PATHWAY_SKELETONS } from "./skeletons";

const BUILT_IN: PathwayDefinition[] = [acutePancreatitisV1];

// Fail fast in dev/test if a built-in definition is malformed.
for (const def of BUILT_IN) {
  const res = validatePathwayDefinition(def);
  if (!res.ok) {
    throw new Error(
      `Invalid built-in pathway definition ${def.pathwayId}@${def.pathwayVersion}:\n` +
        res.issues.map((i) => `  ${i.path}: ${i.message}`).join("\n")
    );
  }
}

const byKey = new Map<string, PathwayDefinition>();
for (const def of BUILT_IN) byKey.set(`${def.pathwayId}@${def.pathwayVersion}`, def);

export function builtInDefinitions(): PathwayDefinition[] {
  return [...BUILT_IN];
}

/** All definitions eligible to trigger (status active). Skeletons never appear here. */
export function activeDefinitions(): PathwayDefinition[] {
  return BUILT_IN.filter((d) => d.status === "active");
}

/**
 * Definitions the trigger engine considers. In production this is `status === "active"`; a
 * `draft` definition (like pancreatitis v1 today) is included only when
 * `SCORING_ENGINE_ALLOW_DRAFTS` is set, so a pilot can exercise it before governance sign-off.
 */
export function triggerableDefinitions(): PathwayDefinition[] {
  const allowDrafts = process.env.SCORING_ENGINE_ALLOW_DRAFTS === "on";
  return BUILT_IN.filter((d) => d.status === "active" || (allowDrafts && d.status === "draft")).map(
    (d) => (d.status === "draft" && allowDrafts ? { ...d, status: "active" as const } : d)
  );
}

export function getDefinition(pathwayId: string, pathwayVersion: string): PathwayDefinition | null {
  return byKey.get(`${pathwayId}@${pathwayVersion}`) ?? null;
}

export function pathwaySkeletons() {
  return PATHWAY_SKELETONS;
}
