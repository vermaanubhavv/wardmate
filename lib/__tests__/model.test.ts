import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { AI_MODEL } from "@/lib/model";

/**
 * Sonnet is the ceiling (standing decision 2026-09-26 — see lib/model.ts).
 *
 * Cheaper is allowed: the live-dictation router deliberately runs on Haiku. Anything ABOVE
 * Sonnet is not, and this fails the build rather than leaving it to a reviewer to catch a
 * one-word model-id change in a diff.
 *
 * WHAT THIS MATCHES, and why it is not simply "the string claude-opus anywhere". An id can
 * appear as DATA without anything running on it — `lib/history-check/extract.ts` keeps a rate
 * table (`"claude-opus-5": { input: 5, output: 25 }`) so the eval printout can price a call
 * whatever model produced it. That is not a violation, and a blanket scan flags it. So this
 * looks for an id in the one position that means "call this": assigned to a model-ish name, or
 * passed as a `model:` property.
 *
 * The gap that leaves, stated rather than papered over: a forbidden id bound to an
 * unrelated-looking name first (`const m = "claude-opus-5"` … `model: m`) slips through. The
 * AI_MODEL assertion below covers the one constant the whole app actually routes through, which
 * is the realistic way this would regress.
 */

const ABOVE_SONNET = /claude-(opus|fable|mythos)/;

/** `model: "claude-opus-5"`, `AI_MODEL = "claude-opus-5"`, `const ROUTING_MODEL = "…"`. */
const CALLED_AS_MODEL = new RegExp(
  String.raw`\bmodel\w*\s*[:=]\s*["'\`]` + ABOVE_SONNET.source,
  "i"
);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) sourceFiles(path, out);
    // This file names the ids on purpose, so it exempts itself.
    else if (/\.tsx?$/.test(name) && !path.endsWith("__tests__/model.test.ts")) out.push(path);
  }
  return out;
}

describe("the model ceiling", () => {
  it("pins AI_MODEL to Sonnet", () => {
    expect(AI_MODEL).toBe("claude-sonnet-5");
  });

  it("calls no model above Sonnet anywhere in lib/ or app/", () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles("lib"), ...sourceFiles("app")]) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (CALLED_AS_MODEL.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
