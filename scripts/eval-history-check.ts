/**
 * Runs the History check extractor against the synthetic cases in
 * lib/history-check/evals/cases.ts and scores what survives the validator.
 *
 *   node --env-file=.env.local --import ./scripts/alias-register.mjs scripts/eval-history-check.ts
 *
 * Options (all optional):
 *   --model <id>        default claude-haiku-4-5 (cheapest adequate). Pass claude-sonnet-5 to
 *                       test the production model.
 *   --max-calls <n>     hard cap on API calls, default 12. The script stops when it is reached.
 *   --only <id,id>      run only these case ids.
 *
 * Every call costs money; the run prints tokens and an estimated cost per case and in total.
 * The validator itself is covered by unit tests that make no calls — this script is for
 * seeing how the MODEL behaves on the traps, not for CI.
 */
import { EVAL_CASES } from "../lib/history-check/evals/cases.ts";
import { getTree } from "../lib/history-check/trees.ts";
import { buildSources } from "../lib/history-check/sources.ts";
import { estimateCostUsd, extractHistoryCheck, type ExtractionUsage } from "../lib/history-check/extract.ts";
import { validateExtraction } from "../lib/history-check/validate.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const model = arg("model") ?? "claude-haiku-4-5";
const maxCalls = Number(arg("max-calls") ?? 12);
const only = arg("only")?.split(",").map((s) => s.trim()).filter(Boolean);

const cases = only ? EVAL_CASES.filter((c) => only.includes(c.id)) : EVAL_CASES;
if (cases.length > maxCalls) {
  console.log(`Capped: ${cases.length} cases but --max-calls ${maxCalls}. Running the first ${maxCalls}.`);
}

const totals: ExtractionUsage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
let calls = 0;
let slotChecks = 0;
let slotPasses = 0;
let casesPassed = 0;
const failures: string[] = [];

console.log(`model: ${model}   cases: ${Math.min(cases.length, maxCalls)}\n`);

for (const c of cases.slice(0, maxCalls)) {
  // Most cases run against fever; a tree-specific case names its own.
  const tree = getTree(c.treeId ?? "fever");
  if (!tree) throw new Error(`${c.id}: tree '${c.treeId ?? "fever"}' not found`);
  console.log(`=== ${c.id} — ${c.title}  [${tree.id}@${tree.version}]`);
  console.log(`    ${c.note}`);
  const sources = buildSources(c.entries);
  const t0 = Date.now();
  let extracted;
  try {
    calls++;
    extracted = await extractHistoryCheck(tree, sources, c.patient, { model });
  } catch (e) {
    console.log(`    API ERROR: ${e instanceof Error ? e.message : String(e)}`);
    failures.push(`${c.id}: api error`);
    continue;
  }
  const ms = Date.now() - t0;
  const result = validateExtraction(tree, extracted.raw, sources);
  for (const k of Object.keys(totals) as (keyof ExtractionUsage)[]) totals[k] += extracted.usage[k];
  const cost = estimateCostUsd(extracted.model, extracted.usage);

  let casePass = true;
  for (const [slotId, want] of Object.entries(c.expect)) {
    slotChecks++;
    const got = result.slots.find((s) => s.id === slotId);
    const ok = got?.state === want;
    if (ok) slotPasses++;
    else casePass = false;
    const q = got?.evidence ? ` "${got.evidence.quote}"` : "";
    console.log(`    ${ok ? "ok  " : "FAIL"} ${slotId}: want ${want}, got ${got?.state ?? "(missing)"}${q}`);
  }
  for (const slotId of c.expectConflict ?? []) {
    slotChecks++;
    const got = result.slots.find((s) => s.id === slotId);
    const ok = Boolean(got?.conflict);
    if (ok) slotPasses++;
    else casePass = false;
    console.log(`    ${ok ? "ok  " : "FAIL"} ${slotId}: conflict expected, got ${got?.conflict ? `"${got.conflict.quote}"` : "none"} (state ${got?.state})`);
  }
  if (c.expectWrongPatient !== undefined) {
    slotChecks++;
    const ok = Boolean(result.wrongPatient) === c.expectWrongPatient;
    if (ok) slotPasses++;
    else casePass = false;
    console.log(`    ${ok ? "ok  " : "FAIL"} wrong_patient: want ${c.expectWrongPatient}, got ${result.wrongPatient ? `"${result.wrongPatient.quote}"` : "null"}`);
  }
  // Anything the model claimed that the validator threw out — this is the safety net working.
  if (result.rejections.length) {
    console.log(`    validator downgraded ${result.rejections.length}:`);
    for (const r of result.rejections) console.log(`      ${r.slotId}: ${r.claimed} → ${r.becomes} (${r.reason}) "${r.quote ?? ""}"`);
  }
  // Negatives that survived but were not expected — worth a human eye.
  const surprise = result.slots.filter((s) => s.state === "negative" && c.expect[s.id] !== "negative");
  if (surprise.length) {
    console.log(`    unscored negatives (check these): ${surprise.map((s) => `${s.id} "${s.evidence?.quote}"`).join("; ")}`);
  }
  if (casePass) casesPassed++;
  else failures.push(c.id);
  console.log(
    `    ${ms} ms · in ${extracted.usage.input_tokens} (cache read ${extracted.usage.cache_read_input_tokens}, write ${extracted.usage.cache_creation_input_tokens}) · out ${extracted.usage.output_tokens} · ~$${cost?.toFixed(4) ?? "?"}\n`
  );
}

const totalCost = estimateCostUsd(model, totals);
console.log("=== summary");
console.log(`calls: ${calls}   cases passed: ${casesPassed}/${Math.min(cases.length, maxCalls)}   slot checks passed: ${slotPasses}/${slotChecks}`);
if (failures.length) console.log(`failed: ${failures.join(", ")}`);
console.log(
  `tokens: in ${totals.input_tokens}, cache read ${totals.cache_read_input_tokens}, cache write ${totals.cache_creation_input_tokens}, out ${totals.output_tokens}   estimated cost: $${totalCost?.toFixed(4) ?? "?"}`
);
