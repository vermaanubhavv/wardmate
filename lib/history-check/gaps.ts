import type { Differential, HistoryTree, Slot } from "@/lib/history-check/types";
import type { SlotResult } from "@/lib/history-check/sources";

/**
 * From validated slots to "what has not been asked", in the order the brief fixes:
 *
 *   1. must-not-miss red flags — ALWAYS, whatever the leading differentials, so a story that
 *      sounds like dengue does not stop anyone asking about neck stiffness;
 *   2. discriminating questions for the leading differentials;
 *   3. the rest of the history.
 *
 * "Leading" is decided by counting POSITIVE pointer slots per differential. It orders the gap
 * list and nothing else — it is never shown as a diagnosis, and the card words it as
 * "questions that would help tell X from Y".
 *
 * Mode is applied here, on read. "ward" trims band 3 to core-tier slots; "academic" shows the
 * whole tree and the teaching line. Red flags ignore the tier in both.
 */

export type CheckMode = "ward" | "academic";

export type Gap = {
  slot: Slot;
  /** Which differentials this gap would help separate. Empty in bands 1 and 3. */
  forDifferentials: string[];
};

export type GapBand = {
  key: "red_flag" | "discriminating" | "rest";
  title: string;
  gaps: Gap[];
};

export type LeadingDifferential = {
  id: string;
  name: string;
  score: number;
  /** The POSITIVE pointer slots that raised this differential — the "why" behind its place in
   *  the ordering. Facts already in the history, never a claim about what the patient has. */
  supportedBy: string[];
};

export type GapList = {
  leading: LeadingDifferential[];
  bands: GapBand[];
  /** Slots answered either way — what the gap list is NOT about. */
  answered: number;
  unasked: number;
};

const MAX_LEADING = 3;

export function buildGapList(
  tree: HistoryTree,
  results: SlotResult[],
  opts: { postOp: boolean; mode: CheckMode }
): GapList {
  const state = new Map(results.map((r) => [r.id, r.state]));
  const isUnasked = (id: string) => (state.get(id) ?? "unasked") === "unasked";

  const applicable: Differential[] = tree.differentials.filter(
    (d) => !d.appliesWhen || (d.appliesWhen === "post_op" && opts.postOp)
  );

  const scored = applicable
    .map((d) => {
      const supportedBy = d.pointers.filter((p) => state.get(p) === "positive");
      return { id: d.id, name: d.name, score: supportedBy.length, supportedBy };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const leading = scored.slice(0, MAX_LEADING);

  const placed = new Set<string>();

  // Band 1: every unasked red flag, tree order, regardless of tier or differential.
  const redFlags: Gap[] = tree.slots
    .filter((s) => s.group === "red_flag" && isUnasked(s.id))
    .map((s) => {
      placed.add(s.id);
      return { slot: s, forDifferentials: [] };
    });

  // Band 2: unasked discriminators of the leading differentials, in tree order, each once,
  // tagged with every leading differential it serves.
  const discriminating: Gap[] = [];
  if (leading.length > 0) {
    const wanted = new Map<string, string[]>();
    for (const d of leading) {
      const def = applicable.find((x) => x.id === d.id)!;
      for (const id of def.discriminators) {
        if (placed.has(id) || !isUnasked(id)) continue;
        wanted.set(id, [...(wanted.get(id) ?? []), d.name]);
      }
    }
    for (const s of tree.slots) {
      const names = wanted.get(s.id);
      if (!names) continue;
      if (opts.mode === "ward" && (s.tier ?? "core") !== "core") continue;
      placed.add(s.id);
      discriminating.push({ slot: s, forDifferentials: names });
    }
  }

  // Band 3: everything else unasked, trimmed to core in ward mode.
  const rest: Gap[] = tree.slots
    .filter((s) => !placed.has(s.id) && isUnasked(s.id))
    .filter((s) => opts.mode === "academic" || (s.tier ?? "core") === "core")
    .map((s) => ({ slot: s, forDifferentials: [] }));

  const unasked = tree.slots.filter((s) => isUnasked(s.id)).length;

  return {
    leading,
    bands: [
      { key: "red_flag", title: "Must not miss", gaps: redFlags },
      {
        key: "discriminating",
        title:
          leading.length > 0
            ? `Would help separate ${leading.map((l) => l.name).join(" / ")}`
            : "Discriminating questions",
        gaps: discriminating,
      },
      { key: "rest", title: "Rest of the history", gaps: rest },
    ],
    answered: tree.slots.length - unasked,
    unasked,
  };
}
