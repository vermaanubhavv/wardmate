/**
 * Helper for turning on automatic deploys (the GitHub Actions pipeline in
 * .github/workflows/deploy.yml). Run:
 *
 *   npm run deploy:github
 *
 * It gathers the five values GitHub needs, copies the big one to your clipboard, and prints
 * exactly where to paste each. It changes nothing on its own.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ROOT, parseEnv, vercelProject, friendlyExit } from "./lib-deploy.mjs";

friendlyExit();

const read = (f) => (existsSync(path.join(ROOT, f)) ? readFileSync(path.join(ROOT, f), "utf8") : null);
const productionEnv = read("env/production.env");
const deployEnv = parseEnv(read("env/deploy.env") ?? "");
const { projectId, teamId } = vercelProject();

if (!productionEnv) {
  console.error("Missing env/production.env — run `npm run deploy:init` first.");
  process.exit(1);
}

// Copy the multi-line value to the clipboard so it doesn't have to be retyped.
let copied = false;
try {
  execFileSync("pbcopy", [], { input: productionEnv });
  copied = true;
} catch {
  /* not macOS, or no pbcopy — fall through */
}

let repoUrl = "your repo";
try {
  const remote = execFileSync("git", ["remote", "get-url", "origin"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const m = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
  if (m) repoUrl = `https://github.com/${m[1]}`;
} catch {
  /* no remote yet */
}

const rows = [
  ["PRODUCTION_ENV", copied ? "(copied to your clipboard — just paste)" : "the entire contents of env/production.env"],
  ["SUPABASE_DB_URL", deployEnv.get("SUPABASE_DB_URL") ?? "(not found in env/deploy.env — run deploy:init)"],
  ["VERCEL_PROJECT_ID", projectId ?? "(not linked — run `vercel link`)"],
  ["VERCEL_TEAM_ID", teamId ?? "(personal account — skip this one)"],
  ["VERCEL_TOKEN", "create a NEW token at https://vercel.com/account/tokens (don't reuse the CLI login)"],
];

console.log(
  [
    "",
    "To turn on automatic deploys:",
    "",
    "1. Put this code on GitHub (new private repo, then `git push`).",
    "2. In the Vercel dashboard, do NOT connect that repo — the Action deploys, and a",
    "   Vercel git connection would deploy everything twice.",
    `3. Open  ${repoUrl}/settings/secrets/actions  and add these five secrets:`,
    "",
    ...rows.map(([k, v]) => `   • ${k}\n       ${v}`),
    "",
    "4. Push a small change to the `main` branch and watch the repo's Actions tab.",
    "",
    "After that: edit a patch or an env value, `git push`, and it ships itself.",
    "",
  ].join("\n")
);
