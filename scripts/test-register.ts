/**
 * Checks the register reader, and then the matcher, against a page whose contents are known.
 *
 *   node --env-file=.env.local scripts/test-register.ts <image>
 *
 * What is actually being tested is column discipline: a register is a grid, and the failure
 * that matters is a value read off the wrong line and written to the wrong patient. The
 * fixture gives each row distinct values so a bleed between rows is visible, and fades the
 * last row so an unreadable entry should come back flagged rather than confidently wrong.
 */
import { readFileSync } from "node:fs";
import { readRegister } from "../lib/read-register.ts";
import { matchRegisterRows } from "../lib/match-register.ts";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/test-register.ts <image>");
  process.exit(1);
}

// The ward as the app knows it. "Kaushalya" is deliberately absent so the faded row has
// nothing to match — it must land in no_match rather than being forced onto someone.
const WARD = [
  { id: "p1", display_name: "Shyamlal", bed: "1" },
  { id: "p2", display_name: "Ramlal", bed: "5" },
  { id: "p3", display_name: "Rama", bed: "ICU31" },
];

const bytes = readFileSync(path);
const t0 = Date.now();
const result = await readRegister(bytes.toString("base64"), "image/png");
const ms = Date.now() - t0;

console.log(`${result.rows.length} rows, ${ms} ms\n`);

for (const row of result.rows) {
  console.log(`  ${row.bed || "(no bed)"} · ${row.name || "(no name)"}${row.uncertain ? "   [UNCLEAR]" : ""}`);
  for (const f of row.findings) console.log(`      ${f.label}: ${f.value_text}`);
  for (const p of row.plans) console.log(`      to do: ${p}`);
}

console.log("\n--- matching against the ward ---");
const matched = matchRegisterRows(result.rows, WARD);
for (const m of matched) {
  const who = m.patientId ? WARD.find((p) => p.id === m.patientId)?.display_name : "—";
  console.log(`  ${m.row.name || "(no name)"} -> ${m.status}  (${who})${m.note ? `  ${m.note}` : ""}`);
}

const autoWritten = matched.filter((m) => m.status === "matched").length;
console.log(`\n${autoWritten} rows would be pre-selected; ${matched.length - autoWritten} need a decision.`);
