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
import { appendicitisAirV1 } from "./appendicitis-air.v1";
import { cholecystitisTg18V1 } from "./acute-cholecystitis-tg18.v1";
import { cholangitisTg18V1 } from "./acute-cholangitis-tg18.v1";
import { upperGiBleedGbsV1 } from "./upper-gi-bleed-gbs.v1";
import { curb65V1 } from "./curb-65.v1";
import { qsofaV1 } from "./qsofa.v1";
import { cha2ds2VascV1 } from "./cha2ds2-vasc.v1";
import { hasBledV1 } from "./has-bled.v1";
import { wellsDvtV1 } from "./wells-dvt.v1";
import { wellsPeV1 } from "./wells-pe.v1";
import { dkaSeverityV1 } from "./dka-severity.v1";
import { PATHWAY_SKELETONS } from "./skeletons";

const BUILT_IN: PathwayDefinition[] = [
  // General surgery
  acutePancreatitisV1,
  appendicitisAirV1,
  cholecystitisTg18V1,
  cholangitisTg18V1,
  upperGiBleedGbsV1,
  // Internal medicine — offered only to a unit whose specialty pack lists the pathwayId
  // (lib/specialty/internal-medicine.ts).
  curb65V1,
  qsofaV1,
  cha2ds2VascV1,
  hasBledV1,
  wellsDvtV1,
  wellsPeV1,
  dkaSeverityV1,
];

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

/**
 * The definitions a given unit is offered, filtered by its specialty pack's `scoringKeys`.
 *
 * An EMPTY key list means "offer nothing", and that is a deliberate clinical statement rather
 * than a gap: a medical oncology unit should never be shown Ranson's criteria or the AIR
 * score. Anything not listed simply cannot trigger for that unit.
 */
export function definitionsForSpecialty(scoringKeys: readonly string[]): PathwayDefinition[] {
  const allowed = new Set(scoringKeys);
  return triggerableDefinitions().filter((d) => allowed.has(d.pathwayId));
}

export function getDefinition(pathwayId: string, pathwayVersion: string): PathwayDefinition | null {
  return byKey.get(`${pathwayId}@${pathwayVersion}`) ?? null;
}

export function pathwaySkeletons() {
  return PATHWAY_SKELETONS;
}
