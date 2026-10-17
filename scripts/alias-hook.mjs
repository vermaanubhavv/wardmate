/**
 * A module-resolution hook that maps the "@/..." path alias (tsconfig `paths`) to the project
 * root, so the pure-logic scripts in this folder can import app modules the same way the app
 * does. Node has no built-in for tsconfig path aliases, and the app's imports omit the ".ts"
 * extension (the bundler and tsc add it), so this appends it.
 *
 * Used via scripts/alias-register.mjs:  node --import ./scripts/alias-register.mjs scripts/foo.ts
 */
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../", import.meta.url).href;

// A dotted basename ("fever.v1") is not an extension — check what actually exists rather than
// guessing from the name.
const isFile = (u) => existsSync(fileURLToPath(u)) && statSync(fileURLToPath(u)).isFile();
function withTsExtension(target) {
  if (isFile(target)) return target;
  if (existsSync(fileURLToPath(target + ".ts"))) return target + ".ts";
  if (existsSync(fileURLToPath(target + "/index.ts"))) return target + "/index.ts";
  return target;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return nextResolve(withTsExtension(ROOT + specifier.slice(2)), context);
  }
  // App modules also import their siblings relatively and without an extension
  // ("./general-surgery"); resolve those the same way when the importer is inside the project.
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith(ROOT)) {
    return nextResolve(withTsExtension(new URL(specifier, context.parentURL).href), context);
  }
  return nextResolve(specifier, context);
}
