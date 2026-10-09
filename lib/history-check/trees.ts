import { HISTORY_TREES } from "@/content/history-trees";
import { validateHistoryTree, validatedOnce } from "@/lib/history-check/schema";
import type { HistoryTree } from "@/lib/history-check/types";

/** The tree registry, validated on first use. One version per tree id. */
const all = validatedOnce(HISTORY_TREES, validateHistoryTree, "History tree");

/** Every tree — what the picker offers. */
export function listTrees(): HistoryTree[] {
  return [...all()];
}

/** A specific version, or the registered one when none is given. Null when unknown. */
export function getTree(id: string, version?: string | null): HistoryTree | null {
  return all().find((t) => t.id === id && (!version || t.version === version)) ?? null;
}

/**
 * Which trees the recorded chief complaints point at. Plain word matching on what the
 * resident already dictated — no model call, no inference. A trigger that only appears
 * immediately after a negation ("no fever") does not count. Returns each matching tree, in
 * registry order.
 */
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

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
