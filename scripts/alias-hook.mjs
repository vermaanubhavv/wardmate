/**
 * A module-resolution hook that maps the "@/..." path alias (tsconfig `paths`) to the project
 * root, so the pure-logic scripts in this folder can import app modules the same way the app
 * does. Node has no built-in for tsconfig path aliases, and the app's imports omit the ".ts"
 * extension (the bundler and tsc add it), so this appends it.
 *
 * Used via scripts/alias-register.mjs:  node --import ./scripts/alias-register.mjs scripts/foo.ts
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../", import.meta.url).href;

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    let target = ROOT + specifier.slice(2);
    const lastSegment = target.split("/").pop() ?? "";
    if (!lastSegment.includes(".")) {
      if (existsSync(fileURLToPath(target + ".ts"))) target += ".ts";
      else if (existsSync(fileURLToPath(target + "/index.ts"))) target += "/index.ts";
    }
    return nextResolve(target, context);
  }
  return nextResolve(specifier, context);
}
