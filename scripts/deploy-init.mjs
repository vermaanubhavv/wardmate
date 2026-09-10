/**
 * One-time guided setup for automated deploys. Run once:
 *
 *   npm run deploy:init
 *
 * It connects to Vercel (if not already), downloads the current production environment
 * variables into env/production.env so you don't retype them, asks for the one value it
 * cannot discover (the Supabase database connection string), and tells the patch tracker
 * which SQL patches are already live.
 *
 * Safe to run again — it only fills in what is missing.
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { ROOT, parseEnv, friendlyExit } from "./lib-deploy.mjs";

friendlyExit();

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
const tryRun = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};
const step = (n, msg) => console.log(`\n[${n}/5] ${msg}`);

// 1 — Vercel login -------------------------------------------------------------------------
step(1, "Checking your Vercel login…");
let who = tryRun("vercel", ["whoami"]);
if (!who) {
  console.log("Not logged in. Opening the Vercel login (a browser window will appear)…");
  run("vercel", ["login"]);
  who = tryRun("vercel", ["whoami"]);
}
console.log(who ? `  logged in as ${who}` : "  (continuing)");

// 2 — Link the folder to the project ------------------------------------------------------
step(2, "Connecting this folder to your Vercel project…");
if (existsSync(path.join(ROOT, ".vercel/project.json"))) {
  const { projectName } = JSON.parse(
    readFileSync(path.join(ROOT, ".vercel/project.json"), "utf8")
  );
  console.log(`  already linked to "${projectName}"`);
} else {
  run("vercel", ["link"]);
}

// 3 — Create the managed env file -------------------------------------------------------
step(3, "Setting up env/production.env (the settings you'll manage from code)…");
const prodPath = path.join(ROOT, "env/production.env");
if (existsSync(prodPath)) {
  console.log("  already exists — leaving it alone");
} else {
  const example = readFileSync(path.join(ROOT, "env/production.env.example"), "utf8");
  writeFileSync(prodPath, example);
  console.log(
    "  created from the template.\n" +
      "  It holds ONLY the variables you want to change from code (the Sentry DSN, the STT\n" +
      "  provider, feature flags). Your API keys and Supabase secrets already live in Vercel\n" +
      "  and don't belong here. Fill in the values you care about, then `npm run env:sync`."
  );
  const showCurrent = tryRun("vercel", ["env", "ls", "production"]);
  if (showCurrent) {
    console.log("\n  For reference, what Vercel has today:\n");
    console.log(showCurrent.split("\n").map((l) => "    " + l).join("\n"));
  }
}

// 4 — The one value we can't discover: the DB connection string --------------------------
step(4, "Supabase database connection string (needed to apply SQL patches automatically)");
const deployPath = path.join(ROOT, "env/deploy.env");
const deployEnv = existsSync(deployPath)
  ? parseEnv(readFileSync(deployPath, "utf8"))
  : new Map();

if (deployEnv.get("SUPABASE_DB_URL")) {
  console.log("  already saved in env/deploy.env");
} else {
  console.log(
    "  Get it from: Supabase dashboard -> your project -> Project Settings -> Database\n" +
      "  -> 'Connection string' -> URI tab. Use the one on port 5432 (not the pooler).\n" +
      "  It looks like postgresql://postgres:YOUR-PASSWORD@db.xxxx.supabase.co:5432/postgres\n"
  );
  const rl = createInterface({ input: stdin, output: stdout });
  const url = (await rl.question("  Paste it here (or press Enter to skip): ")).trim();
  rl.close();
  if (url) {
    appendFileSync(
      deployPath,
      (existsSync(deployPath) ? "" : "# Deploy-script credentials. Never committed, never sent to Vercel.\n") +
        `SUPABASE_DB_URL=${url}\n`
    );
    console.log("  saved to env/deploy.env");
  } else {
    console.log("  skipped — `npm run db:push` won't work until this is set");
  }
}

// 5 — Baseline the patch tracker --------------------------------------------------------
step(5, "Recording which SQL patches are already live…");
if (existsSync(deployPath) && parseEnv(readFileSync(deployPath, "utf8")).get("SUPABASE_DB_URL")) {
  run("node", ["scripts/db-push.mjs", "--baseline"]);
  run("node", ["scripts/db-push.mjs", "--status"]);
} else {
  console.log("  skipped (no database connection string). Run `npm run db:push -- --baseline` later.");
}

console.log(
  [
    "",
    "Setup done.",
    "",
    "From now on:",
    "  npm run ship          apply new SQL patches + push env vars + deploy to production",
    "  npm run db:push       just apply new SQL patches",
    "  npm run env:sync      just push env/production.env to Vercel",
    "",
    "Want deploys to happen automatically on `git push`?  npm run deploy:github",
    "",
  ].join("\n")
);
