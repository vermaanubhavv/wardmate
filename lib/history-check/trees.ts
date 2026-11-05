import { HISTORY_TREES } from "@/content/history-trees";
import { validateHistoryTree, validatedOnce } from "@/lib/history-check/schema";
import type { HistoryTree } from "@/lib/history-check/types";
import { escape } from "@/lib/history-check/validate";
import type { NegativeSlot } from "@/lib/relevant-negatives";

/** The tree registry, validated on first use. Old versions stay registered so a stored run
 *  still renders against the tree it was answered on. */
const all = validatedOnce(HISTORY_TREES, validateHistoryTree, "History tree");

/** The newest version of every tree — what the picker offers. */
export function listTrees(): HistoryTree[] {
  const latest = new Map<string, HistoryTree>();
  for (const t of all()) {
    const cur = latest.get(t.id);
    if (!cur || t.version.localeCompare(cur.version, undefined, { numeric: true }) > 0) latest.set(t.id, t);
  }
  return [...latest.values()];
}

/** A specific version, or the newest when none is given. Null when unknown. */
export function getTree(id: string, version?: string | null): HistoryTree | null {
  if (version) return all().find((t) => t.id === id && t.version === version) ?? null;
  return listTrees().find((t) => t.id === id) ?? null;
}

/**
 * Which trees the recorded chief complaints point at. Plain word matching on what the
 * resident already dictated — no model call, no inference. A trigger that only appears
 * immediately after a negation ("no fever") does not count. Returns each matching tree, in
 * registry order.
 */
/** The yes/no slots of the trees these complaints suggest, slim, for the Relevant-negatives
 *  card (lib/relevant-negatives.ts). Server-side: the trees never reach the browser. */
export function negativeSlotsFor(chiefComplaintTexts: string[]): NegativeSlot[] {
  return suggestTrees(chiefComplaintTexts)
    .flatMap((t) => t.slots)
    .filter((s) => s.kind === "yes_no")
    .map((s) => ({ label: s.label, terms: s.terms, group: s.group, tier: s.tier }));
}

export function suggestTrees(chiefComplaintTexts: string[]): HistoryTree[] {
  const text = chiefComplaintTexts.join(" \n ").toLowerCase();
  if (!text.trim()) return [];
  return listTrees().filter((tree) =>
    tree.triggers.some((trigger) => {
      const re = new RegExp(`(^|[^a-z])${escape(trigger)}([^a-z]|$)`, "g");
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        const before = text.slice(Math.max(0, m.index - 12), m.index + m[1].length);
        if (!/\b(no|not|nil|denies|without|afebrile)\s*$/.test(before)) return true;
      }
      return false;
    })
  );
}
