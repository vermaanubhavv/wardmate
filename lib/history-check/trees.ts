import { HISTORY_TREES } from "@/content/history-trees";
import { validateHistoryTree } from "./schema";
import type { HistoryTree } from "./types";

/**
 * The tree registry, validated on first use. A content file that fails validation throws
 * here, which surfaces in the test suite and at build — never as a half-working card on a
 * ward.
 */
let validated: readonly HistoryTree[] | null = null;

function all(): readonly HistoryTree[] {
  if (validated) return validated;
  for (const tree of HISTORY_TREES) {
    const res = validateHistoryTree(tree);
    if (!res.ok) {
      const detail = res.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
      throw new Error(`History tree ${tree.id}@${tree.version} is invalid — ${detail}`);
    }
  }
  const seen = new Set<string>();
  for (const t of HISTORY_TREES) {
    const key = `${t.id}@${t.version}`;
    if (seen.has(key)) throw new Error(`History tree ${key} is registered twice`);
    seen.add(key);
  }
  validated = HISTORY_TREES;
  return validated;
}

function semverDesc(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
  return 0;
}

/** The newest version of every tree — what the picker offers. */
export function listTrees(): HistoryTree[] {
  const latest = new Map<string, HistoryTree>();
  for (const t of all()) {
    const cur = latest.get(t.id);
    if (!cur || semverDesc(cur.version, t.version) > 0) latest.set(t.id, t);
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
 * immediately after a negation ("no fever") does not count. Returns the newest version of
 * each matching tree, in registry order.
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
