/**
 * Scores the amber check (lib/jev-observations.ts, `supported_i`) on the synthetic rows in
 * lib/evals/supported-cases.ts, for the live wording and the candidates below.
 *
 *   node --env-file=.env.local --import ./scripts/alias-register.mjs scripts/eval-supported.ts [--held-out]
 *
 * Needs TYPESAFE_API_KEY. One Jev request per row per wording.
 *
 * A row turns amber when Jev's yes is BELOW the bar. The two mistakes are not equal: an
 * unsupported row left green is a wrong value on the record; a supported row turned amber is a
 * tap, but enough of them teach residents to tap through amber unread. So read the table for
 * the bar that catches every unsupported row, then the fewest false ambers.
 */
import { SUPPORTED_CASES as TRAIN, SUPPORTED_HELD_OUT } from "../lib/evals/supported-cases.ts";
import { supportedQuestion } from "../lib/jev-observations.ts";
import { askJev } from "../lib/jev.ts";

const CANDIDATES: Record<string, (row: string) => unknown> = {
  // Chosen 2026-10-02: the first wording ("Does the quote actually state the value…?") left
  // 4/25 wrong rows green at 0.5 — a relative's history as the patient's, "to be removed" as
  // removed. This one caught 25/25 with 1 false amber. Add new candidates below.
  live: supportedQuestion,
};

const BARS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
const cases = process.argv.includes("--held-out") ? SUPPORTED_HELD_OUT : TRAIN;
const unsupported = cases.filter((c) => !c.supported).length;
const supportedN = cases.length - unsupported;

for (const [name, question] of Object.entries(CANDIDATES)) {
  // One request per row, as production sends one dictation's rows: in a single batch, rows
  // that share a quote on purpose (right vs left hernia) would be read against each other.
  const results = await Promise.all(
    cases.map((c) =>
      askJev({ observations: [{ label: c.label, value: c.value, quote: c.quote }] }, { supported_0: question("observations[0]") }, 30_000)
    )
  );
  const failed = results.find((r) => "fallback" in r);
  if (failed && "fallback" in failed) {
    console.error(`${name}: Jev unavailable (${failed.fallback})`);
    process.exit(1);
  }
  const p = results.map((r) => ("answers" in r ? (r.answers.supported_0?.noul ?? 1) : 1));
  const res = results[0] as { model: string };

  console.log(`\n== ${name} (${res.model})`);
  console.log("bar   wrong rows caught   false ambers");
  for (const b of BARS) {
    const caught = cases.filter((c, i) => !c.supported && p[i] < b).length;
    const falseAmber = cases.filter((c, i) => c.supported && p[i] < b).length;
    console.log(`  ${b.toFixed(1)}  ${String(caught).padStart(2)}/${unsupported}               ${String(falseAmber).padStart(2)}/${supportedN}`);
  }
  console.log("per row (p = probability the quote supports it):");
  cases.forEach((c, i) =>
    console.log(`  ${c.supported ? "ok   " : "WRONG"}  ${p[i].toFixed(2)}  ${c.label}: ${c.value}  ⟵  "${c.quote}"`)
  );
}
