/**
 * Push `env/production.env` into the Vercel project, so environment variables stop being
 * dashboard typing. Idempotent: creates what is missing, updates what changed, leaves the
 * rest alone.
 *
 *   npm run env:sync                 apply
 *   npm run env:sync -- --dry-run    show what would change, change nothing
 *
 * Manages the Production value of each variable. Preview and Development are left alone.
 *
 * No configuration needed locally: the project is read from `.vercel/project.json` and the
 * API token from the login the Vercel CLI already did. In CI, set VERCEL_TOKEN,
 * VERCEL_PROJECT_ID and VERCEL_TEAM_ID instead.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  ROOT,
  parseEnv,
  loadEnvFiles,
  vercelProject,
  vercelToken,
  vercelApi,
  friendlyExit,
} from "./lib-deploy.mjs";

friendlyExit();

const ENV_FILE = path.join(ROOT, "env/production.env");
const DRY = process.argv.includes("--dry-run");

loadEnvFiles("env/deploy.env", ".env.local");

if (!existsSync(ENV_FILE)) {
  console.error(
    `Missing env/production.env.\nRun \`npm run deploy:init\` once to set it up, ` +
      `or copy env/production.env.example to it.`
  );
  process.exit(1);
}
const wanted = parseEnv(readFileSync(ENV_FILE, "utf8"));
// Never sync Vercel-managed keys, empty values, or the "[SENSITIVE]" placeholder that
// `vercel env pull` writes for secrets it can't read back — pushing that would clobber a
// real secret.
for (const [k, v] of [...wanted]) {
  if (k.startsWith("VERCEL_") || !v || v === "[SENSITIVE]") {
    if (v === "[SENSITIVE]") console.log(`skipping ${k} — value is a "[SENSITIVE]" placeholder`);
    wanted.delete(k);
  }
}

const token = vercelToken();
const { projectId, teamId } = vercelProject();
if (!token || !projectId) {
  console.error(
    "Could not find Vercel credentials.\n" +
      "Locally: run `vercel login` and `vercel link` once.\n" +
      "In CI: set VERCEL_TOKEN and VERCEL_PROJECT_ID."
  );
  process.exit(1);
}

const api = vercelApi(token, teamId);
const { envs: existing } = await api("GET", `/v9/projects/${projectId}/env?decrypt=true`);

let created = 0;
let updated = 0;
let unchanged = 0;

for (const [key, value] of wanted) {
  // The record that governs this variable in Production (its target list contains it).
  const prod = existing.find((e) => e.key === key && (e.target ?? []).includes("production"));

  if (prod && prod.value === value) {
    unchanged++;
  } else if (prod) {
    console.log(`${DRY ? "[dry-run] would update" : "updating "} ${key}`);
    if (!DRY) await api("PATCH", `/v9/projects/${projectId}/env/${prod.id}`, { value });
    updated++;
  } else {
    console.log(`${DRY ? "[dry-run] would create" : "creating "} ${key} (Production)`);
    if (!DRY)
      await api("POST", `/v10/projects/${projectId}/env`, {
        key,
        value,
        type: "encrypted",
        target: ["production"],
      });
    created++;
  }
}

console.log(`\n${DRY ? "[dry-run] " : ""}${created} created, ${updated} updated, ${unchanged} unchanged.`);
if (!DRY && (created || updated)) console.log("Redeploy for the changes to take effect.");
