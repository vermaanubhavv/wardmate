/**
 * Apply every supabase/patches/*.sql that has not run yet, in filename order, once each.
 *
 * Replaces opening the Supabase SQL Editor and pasting patches by hand. A `public._patch_log`
 * table records which files have run; each invocation runs only the missing ones, in order,
 * recording each as it succeeds. If a patch fails, nothing after it runs and it is not
 * recorded, so a re-run resumes from there.
 *
 *   npm run db:push                 apply pending patches
 *   npm run db:push -- --status     list applied / pending, run nothing
 *   npm run db:push -- --dry-run    show what would run, run nothing
 *   npm run db:push -- --baseline   record every current patch as applied WITHOUT running it
 *                                   — `npm run deploy:init` does this for you once
 *   npm run db:push -- --forget 0062   drop the log rows for 0062 and everything after it,
 *                                   so the next `db:push` re-runs them (safe: patches are
 *                                   idempotent, so re-running an already-applied one is a
 *                                   no-op). Use if --baseline marked something as done that
 *                                   was not actually applied.
 *
 * Needs `SUPABASE_DB_URL` (Supabase -> Project Settings -> Database -> Connection string ->
 * URI, direct connection on port 5432). Kept in `env/deploy.env`; in CI it is a GitHub Secret.
 *
 * Each patch file wraps itself in `begin; ... commit;`, so this runs the file exactly as a
 * human would paste it — it does not add a transaction of its own. Keep new patches
 * self-wrapped and idempotent.
 */
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import pg from "pg";
import { ROOT, loadEnvFiles, friendlyExit } from "./lib-deploy.mjs";

friendlyExit();
loadEnvFiles("env/deploy.env", ".env.local");

const PATCH_DIR = path.join(ROOT, "supabase/patches");
const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!DB_URL) {
  console.error(
    "SUPABASE_DB_URL is not set.\n" +
      "Run `npm run deploy:init` once, or put it in env/deploy.env " +
      "(copy env/deploy.env.example)."
  );
  process.exit(1);
}

const forgetIdx = process.argv.indexOf("--forget");
const forgetFrom = forgetIdx !== -1 ? process.argv[forgetIdx + 1] : null;
const mode = forgetFrom
  ? "forget"
  : process.argv.includes("--baseline")
    ? "baseline"
    : process.argv.includes("--status")
      ? "status"
      : process.argv.includes("--dry-run")
        ? "dry-run"
        : "apply";

const sha = (f) =>
  createHash("sha256").update(readFileSync(path.join(PATCH_DIR, f))).digest("hex");
const files = readdirSync(PATCH_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
try {
  await client.query(`
    create table if not exists public._patch_log (
      filename   text primary key,
      applied_at timestamptz not null default now(),
      sha256     text
    )
  `);

  const applied = new Set(
    (await client.query("select filename from public._patch_log")).rows.map((r) => r.filename)
  );
  const pending = files.filter((f) => !applied.has(f));

  if (mode === "status") {
    for (const f of files) console.log(`${applied.has(f) ? "  applied" : "* PENDING"}  ${f}`);
    console.log(`\n${applied.size} applied, ${pending.length} pending`);
  } else if (mode === "forget") {
    const drop = files.filter((f) => f >= forgetFrom && applied.has(f));
    if (drop.length === 0) {
      console.log(`Nothing recorded at or after "${forgetFrom}".`);
    } else {
      await client.query("delete from public._patch_log where filename = any($1)", [drop]);
      console.log(`Forgot ${drop.length} patch(es):`);
      for (const f of drop) console.log("  " + f);
      console.log("\nRun `npm run db:push` to (re-)apply them.");
    }
  } else if (mode === "baseline") {
    for (const f of pending) {
      await client.query(
        "insert into public._patch_log (filename, sha256) values ($1, $2) on conflict do nothing",
        [f, sha(f)]
      );
    }
    console.log(
      `Baselined ${pending.length} patch file(s) as already applied. No SQL was run.\n` +
        "From now on `npm run db:push` only runs patches added after this point."
    );
  } else if (pending.length === 0) {
    console.log("Nothing to apply — the database is up to date.");
  } else {
    console.log(`${pending.length} patch(es) to apply:`);
    for (const f of pending) console.log("  " + f);
    if (mode === "dry-run") {
      console.log("\n--dry-run: nothing was run.");
    } else {
      console.log("");
      for (const f of pending) {
        process.stdout.write(`applying ${f} ... `);
        try {
          await client.query(readFileSync(path.join(PATCH_DIR, f), "utf8"));
          await client.query(
            "insert into public._patch_log (filename, sha256) values ($1, $2)",
            [f, sha(f)]
          );
          console.log("ok");
        } catch (e) {
          console.log("FAILED");
          console.error(
            `\n${f} failed — it was not recorded and nothing after it ran.\n\n${e.message}\n`
          );
          process.exit(1);
        }
      }
      console.log(`\nDone — ${pending.length} patch(es) applied.`);
    }
  }
} finally {
  await client.end();
}
