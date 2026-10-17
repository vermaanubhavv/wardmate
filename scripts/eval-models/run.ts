/**
 * Model comparison over the app's own AI routes, run through the Message Batches API (half
 * price) with a hard spend cap. Cases: scripts/eval-models/cases.ts — synthetic only.
 *
 *   node --env-file=.env.eval --import ./scripts/alias-register.mjs scripts/eval-models/run.ts --run A
 *
 * .env.eval holds EVAL_ANTHROPIC_API_KEY — a separate key in its own Console workspace with a
 * spend limit. The routes never see it: they get a dummy ANTHROPIC_API_KEY and every call they
 * make is intercepted (intercept.ts). Only this script talks to the API, and only to batches.
 *
 * Run the same command again until it prints the report. Each pass:
 *   1. collects a finished batch, if one is pending, and books its real cost;
 *   2. replays every case under every config; calls with no answer yet are captured;
 *   3. captured calls go out as one batch — refused if spent + worst-case > --budget;
 *   4. when nothing is left to capture, scores everything and writes report.md.
 * A route making two calls (final check) needs two rounds; that is automatic.
 *
 * Options:
 *   --run <name>      state lives in .eval-models/<name>/ (default A). The ledger is shared.
 *   --repeats <n>     runs per case and config (default 2). Safety needs zero failures in all.
 *   --configs a,b     subset of the configs below.
 *   --only route,...  subset of routes.
 *   --budget <usd>    cap across ALL runs (default 100).
 *   --dry             capture and price only; submit nothing.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { captured, loadAnswers, productionModel, runOnce, idFor, type Config, type Stored } from "./intercept.ts";

const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const RUN = arg("run") ?? "A";
const REPEATS = Number(arg("repeats") ?? 2);
const BUDGET = Number(arg("budget") ?? 100);
const DRY = process.argv.includes("--dry");
const ONLY = arg("only")?.split(",");

const isSonnetRoute = (m: string) => m.startsWith("claude-sonnet");
const CONFIGS: Config[] = [
  { id: "prod", model: null },
  { id: "sonnet-5-5", model: "claude-sonnet-5-5", appliesTo: isSonnetRoute },
  { id: "haiku-5-5", model: "claude-haiku-5-5" },
  { id: "haiku-5-5-low", model: "claude-haiku-5-5", effort: "low" },
  // The ceiling: worth knowing where Sonnet 5.5 falls short, not a candidate for every route.
  { id: "opus-5-5", model: "claude-opus-5-5", appliesTo: isSonnetRoute },
];
const configs = arg("configs") ? CONFIGS.filter((c) => arg("configs")!.split(",").includes(c.id)) : CONFIGS;

// $ per million tokens, from the claude-api skill's table (cached 2026-10-06). Batch = half.
const PRICE: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-sonnet-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
  "claude-haiku-4-5": [1, 5],
};
const price = (model: string) => PRICE[Object.keys(PRICE).find((k) => model.startsWith(k)) ?? ""] ?? [20, 100];
function costOf(model: string, u: Anthropic.Usage) {
  const [i, o] = price(model);
  const input = u.input_tokens * i + (u.cache_creation_input_tokens ?? 0) * i * 1.25 + (u.cache_read_input_tokens ?? 0) * i * 0.1;
  return ((input + u.output_tokens * o) / 1e6) * 0.5;
}
/** Upper bound for one request: ~3 chars a token (generous), every output token used, no cache. */
function worstCase(p: Anthropic.MessageCreateParamsNonStreaming) {
  const [i, o] = price(String(p.model));
  return ((JSON.stringify(p).length / 3) * i + p.max_tokens * o) / 1e6 * 0.5;
}

// --- state ----------------------------------------------------------------------------------
const DIR = `.eval-models/${RUN}`;
mkdirSync(DIR, { recursive: true });
const LEDGER = ".eval-models/ledger.json";
type Ledger = { spent: number; reserved: Record<string, number>; batches: { id: string; run: string; requests: number; cost?: number }[] };
const ledger: Ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : { spent: 0, reserved: {}, batches: [] };
const saveLedger = () => writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
const ANSWERS = `${DIR}/answers.jsonl`;
const PENDING = `${DIR}/pending.json`;

const stored = new Map<string, Stored>();
if (existsSync(ANSWERS)) {
  for (const line of readFileSync(ANSWERS, "utf8").split("\n").filter(Boolean)) {
    const r = JSON.parse(line) as { custom_id: string; result: Stored };
    stored.set(r.custom_id, r.result);
  }
}

const key = process.env.EVAL_ANTHROPIC_API_KEY;
// The routes check for a key before calling; this one never leaves the process.
process.env.ANTHROPIC_API_KEY = "intercepted-by-eval-models";
delete process.env.TYPESAFE_API_KEY; // Claude's path only: Jev is a different comparison.
const api = key ? new Anthropic({ apiKey: key }) : null;

// --- 1. collect -----------------------------------------------------------------------------
if (existsSync(PENDING)) {
  const { id } = JSON.parse(readFileSync(PENDING, "utf8")) as { id: string };
  if (!api) throw new Error("A batch is pending; set EVAL_ANTHROPIC_API_KEY to collect it.");
  const b = await api.messages.batches.retrieve(id);
  if (b.processing_status !== "ended") {
    const c = b.request_counts;
    console.log(`batch ${id}: ${b.processing_status} — ${c.succeeded} done, ${c.processing} processing, ${c.errored} errored. Run again later.`);
    process.exit(0);
  }
  let cost = 0;
  const lines: string[] = [];
  for await (const r of await api.messages.batches.results(id)) {
    const result: Stored = r.result.type === "succeeded" ? { type: "succeeded", message: r.result.message } : { type: r.result.type, error: "error" in r.result ? r.result.error : undefined };
    if (result.type === "succeeded") cost += costOf(result.message.model, result.message.usage);
    stored.set(r.custom_id, result);
    lines.push(JSON.stringify({ custom_id: r.custom_id, result }));
  }
  writeFileSync(ANSWERS, (existsSync(ANSWERS) ? readFileSync(ANSWERS, "utf8") : "") + lines.join("\n") + "\n");
  ledger.spent += cost;
  delete ledger.reserved[id];
  const entry = ledger.batches.find((x) => x.id === id);
  if (entry) entry.cost = cost;
  saveLedger();
  writeFileSync(`${DIR}/collected-${id}.json`, readFileSync(PENDING));
  (await import("node:fs")).unlinkSync(PENDING);
  console.log(`collected ${lines.length} results, cost $${cost.toFixed(2)} · total spent $${ledger.spent.toFixed(2)} of $${BUDGET}`);
}
loadAnswers(stored);

// --- 2. replay / capture --------------------------------------------------------------------
const { allCases } = await import("./cases.ts");
const cases = allCases().filter((c) => !ONLY || ONLY.includes(c.route));
type Row = { route: string; caseId: string; config: string; rep: number; failures: string[]; error?: string; ids: string[] };
const rows: Row[] = [];
let waiting = 0;

for (const c of cases) {
  for (const cfg of configs) {
    for (let rep = 0; rep < REPEATS; rep++) {
      const prefix = `${c.route}|${c.id}|${cfg.id}|r${rep}`;
      const out = await runOnce(prefix, cfg, c.run);
      if (out.kind === "n/a") break;
      if (out.kind === "captured") { waiting++; continue; }
      const ids = [0, 1, 2, 3].map((n) => idFor(`${prefix}|c${n}`)).filter((id) => stored.has(id));
      rows.push(out.kind === "error"
        ? { route: c.route, caseId: c.id, config: cfg.id, rep, failures: [`error: ${out.error}`], error: out.error, ids }
        : { route: c.route, caseId: c.id, config: cfg.id, rep, failures: c.check(out.value), ids });
    }
  }
}

// --- 3. submit ------------------------------------------------------------------------------
if (captured.length) {
  const worst = captured.reduce((s, r) => s + worstCase(r.params), 0);
  const reserved = Object.values(ledger.reserved).reduce((a, b) => a + b, 0);
  const byModel = new Map<string, number>();
  for (const r of captured) byModel.set(String(r.params.model), (byModel.get(String(r.params.model)) ?? 0) + 1);
  console.log(`${captured.length} calls to send (${[...byModel].map(([m, n]) => `${m} ×${n}`).join(", ")})`);
  console.log(`worst case $${worst.toFixed(2)} · spent $${ledger.spent.toFixed(2)} · reserved $${reserved.toFixed(2)} · budget $${BUDGET}`);
  if (ledger.spent + reserved + worst > BUDGET) {
    console.log("REFUSED: this batch could exceed the budget. Narrow it with --only / --configs / --repeats.");
    process.exit(1);
  }
  if (DRY || !api) {
    console.log(DRY ? "--dry: nothing sent." : "No EVAL_ANTHROPIC_API_KEY: nothing sent.");
    process.exit(0);
  }
  writeFileSync(`${DIR}/keys.json`, JSON.stringify(Object.fromEntries(captured.map((r) => [r.custom_id, r.key])), null, 1));
  const batch = await api.messages.batches.create({ requests: captured.map(({ custom_id, params }) => ({ custom_id, params })) });
  ledger.reserved[batch.id] = worst;
  ledger.batches.push({ id: batch.id, run: RUN, requests: captured.length });
  saveLedger();
  writeFileSync(PENDING, JSON.stringify({ id: batch.id, at: new Date().toISOString() }));
  console.log(`sent batch ${batch.id}. Run the same command again to collect it (usually under an hour, at most 24 h).`);
  process.exit(0);
}
if (waiting) throw new Error(`${waiting} routes waiting but nothing captured — a bug in intercept.ts`);

// --- 4. score -------------------------------------------------------------------------------
const msgOf = (id: string) => { const s = stored.get(id); return s?.type === "succeeded" ? s.message : null; };
const report: string[] = [
  `# Model comparison — run ${RUN}`,
  "",
  `${REPEATS} repeat(s) per case. A cell is **cases fully passed / cases**; ⚠ counts SAFETY failures (any one rules the config out for that route).`,
  "Cost is the real batch cost per case (half the live price). Spent so far across runs: $" + ledger.spent.toFixed(2) + ".",
  "",
];
const routes = [...new Set(rows.map((r) => r.route))];
const cfgIds = configs.map((c) => c.id);
report.push(`| route | ${cfgIds.join(" | ")} |`, `|---|${cfgIds.map(() => "---").join("|")}|`);
for (const route of routes) {
  const cells = cfgIds.map((cfg) => {
    const rs = rows.filter((r) => r.route === route && r.config === cfg);
    if (!rs.length) return "—";
    const byCase = new Map<string, Row[]>();
    for (const r of rs) byCase.set(r.caseId, [...(byCase.get(r.caseId) ?? []), r]);
    const passed = [...byCase.values()].filter((x) => x.every((r) => !r.failures.length)).length;
    const safety = rs.reduce((n, r) => n + r.failures.filter((f) => f.startsWith("SAFETY")).length, 0);
    const msgs = rs.flatMap((r) => r.ids.map(msgOf)).filter((m): m is Anthropic.Message => !!m);
    const cost = msgs.reduce((s, m) => s + costOf(m.model, m.usage), 0) / rs.length;
    const cut = msgs.filter((m) => m.stop_reason === "max_tokens").length;
    const refused = msgs.filter((m) => m.stop_reason === "refusal").length;
    const prod = rs[0].ids[0] ? productionModel.get(rs[0].ids[0]) : undefined;
    return `${passed}/${byCase.size}${safety ? ` ⚠${safety}` : ""} · $${(cost * 1000).toFixed(2)}/1k${cut ? ` · ${cut} cut off` : ""}${refused ? ` · ${refused} refused` : ""}${cfg === "prod" && prod ? ` (${prod})` : ""}`;
  });
  report.push(`| ${route} | ${cells.join(" | ")} |`);
}
report.push("", "Cost column is $ per 1,000 cases at batch price; double it for live traffic.", "", "## Failures", "");
for (const r of rows.filter((x) => x.failures.length)) report.push(`- **${r.route} / ${r.caseId}** [${r.config} r${r.rep}]: ${r.failures.join("; ")}`);
writeFileSync(`${DIR}/report.md`, report.join("\n") + "\n");
console.log(report.slice(0, 7 + routes.length + 2).join("\n"));
console.log(`\nfull report: ${DIR}/report.md`);
process.exit(0);
