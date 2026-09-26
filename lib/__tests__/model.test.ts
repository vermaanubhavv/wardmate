import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { AI_MODEL } from "@/lib/model";

/**
 * Sonnet is the ceiling (standing decision 2026-09-26 — see lib/model.ts).
 *
 * Cheaper is allowed: the live-dictation router deliberately runs on Haiku. Anything ABOVE
 * Sonnet is not, and this fails the build rather than leaving it to a code reviewer to notice
 * a one-word model-id change in a diff.
 */

const FORBIDDEN = /claude-(opus|fable|mythos)/;

/** Source that actually ships or runs — excludes this file, which names the ids on purpose. */
function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      sourceFiles(path, out);
    } else if (/\.tsx?$/.test(name) && !path.endsWith("__tests__/model.test.ts")) {
      out.push(path);
    }
  }
  return out;
}

describe("the model ceiling", () => {
  it("pins AI_MODEL to Sonnet", () => {
    expect(AI_MODEL).toBe("claude-sonnet-5");
  });

  it("has no Opus/Fable/Mythos model id anywhere in lib/ or app/", () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles("lib"), ...sourceFiles("app")]) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (FORBIDDEN.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
