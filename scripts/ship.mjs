/**
 * The everyday deploy command:
 *
 *   npm run ship
 *
 * 1. applies any new SQL patches to the database
 * 2. pushes env/production.env to Vercel
 * 3. deploys to production
 *
 * Stops immediately if any step fails. Run `npm run deploy:init` once before the first use.
 */
import { execFileSync } from "node:child_process";
import { ROOT, friendlyExit } from "./lib-deploy.mjs";

friendlyExit();

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT });

console.log("\n=== 1/3  Database patches ===");
run("node", ["scripts/db-push.mjs"]);

console.log("\n=== 2/3  Environment variables ===");
run("node", ["scripts/env-sync.mjs"]);

console.log("\n=== 3/3  Deploy to production ===");
run("vercel", ["--prod"]);

console.log("\nShipped.");
