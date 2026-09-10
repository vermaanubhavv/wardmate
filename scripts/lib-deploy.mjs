/**
 * Shared helpers for the deploy scripts (db-push, env-sync, ship, deploy-init).
 * Everything here is best-effort auto-discovery so the scripts need as little hand-set
 * configuration as possible.
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Parse a KEY=VALUE .env file into a Map. Ignores blank lines and `#` comments. */
export function parseEnv(text) {
  const out = new Map();
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out.set(m[1], m[2].replace(/^["']|["']$/g, ""));
  }
  return out;
}

/** Load the named .env files into process.env (without overwriting anything already set). */
export function loadEnvFiles(...files) {
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const [k, v] of parseEnv(readFileSync(p, "utf8"))) {
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

/** projectId + teamId, from env vars or `.vercel/project.json` (written by `vercel link`). */
export function vercelProject() {
  const link = path.join(ROOT, ".vercel/project.json");
  const fromFile = existsSync(link) ? JSON.parse(readFileSync(link, "utf8")) : {};
  return {
    projectId: process.env.VERCEL_PROJECT_ID || fromFile.projectId,
    teamId: process.env.VERCEL_TEAM_ID || fromFile.orgId,
  };
}

/**
 * A Vercel API token: an explicit env var if set, otherwise the one the Vercel CLI already
 * stored when you ran `vercel login`. Returns null if neither is available.
 */
export function vercelToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const candidates = [
    path.join(homedir(), "Library/Application Support/com.vercel.cli/auth.json"),
    path.join(homedir(), ".local/share/com.vercel.cli/auth.json"),
    path.join(homedir(), ".config/com.vercel.cli/auth.json"),
  ];
  for (const c of candidates) {
    try {
      const token = JSON.parse(readFileSync(c, "utf8")).token;
      if (token) return token;
    } catch {
      // try the next path
    }
  }
  return null;
}

/** Minimal Vercel REST client bound to a token + optional team. */
export function vercelApi(token, teamId) {
  return async (method, pathname, body) => {
    const join = pathname.includes("?") ? "&" : "?";
    const url = `https://api.vercel.com${pathname}` + (teamId ? `${join}teamId=${teamId}` : "");
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${pathname} -> ${res.status} ${await res.text()}`);
    return res.status === 204 ? null : res.json();
  };
}

export function friendlyExit() {
  process.on("unhandledRejection", (e) => {
    console.error("\n" + (e?.message ?? e) + "\n");
    process.exit(1);
  });
}
