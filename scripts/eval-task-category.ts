/**
 * Scores the /todo "By type" bucket (lib/jev-observations.ts, `category_i`) on the synthetic
 * plans in lib/evals/task-category-cases.ts, for the live wording and the candidates below.
 *
 *   node --env-file=.env.local --import ./scripts/alias-register.mjs scripts/eval-task-category.ts [--held-out]
 *
 * Needs TYPESAFE_API_KEY. One Jev request per wording (all cases batched).
 *
 * Scored as the screen works: Jev's bucket where its probability clears the bar, the keyword
 * match (lib/task-category.ts) below it. A wrong bucket only files a job under the wrong
 * heading — it is never hidden — so the two mistakes cost the same and plain accuracy is the
 * measure. The table shows keywords alone for comparison.
 */
import { TASK_CATEGORY_CASES as TRAIN, TASK_CATEGORY_HELD_OUT } from "../lib/evals/task-category-cases.ts";
import { categoryQuestion } from "../lib/jev-observations.ts";
import { askJev, chosenProbability } from "../lib/jev.ts";
import { classifyTaskCategory } from "../lib/task-category.ts";

const CANDIDATES: Record<string, (path: string) => unknown> = {
  // Chosen 2026-10-02: the first wording ("Who carries out the ward job in …?", bar 0.7)
  // scored 37/38 and 25/25; this one 38/38 and 25/25 at 0.8. Add new candidates below.
  live: categoryQuestion,
};

const THRESHOLDS = [0, 0.5, 0.6, 0.7, 0.8, 0.9];
const cases = process.argv.includes("--held-out") ? TASK_CATEGORY_HELD_OUT : TRAIN;
const label = (c: string | null) => c ?? "other";

const keywordRight = cases.filter((c) => classifyTaskCategory(c.text) === c.category).length;
console.log(`keywords alone: ${keywordRight}/${cases.length}`);

const state = { observations: cases.map((c) => ({ label: "plan", value: c.text, quote: c.text })) };
for (const [name, question] of Object.entries(CANDIDATES)) {
  const questions: Record<string, unknown> = {};
  cases.forEach((_, i) => (questions[`category_${i}`] = question(`observations[${i}].value`)));
  const res = await askJev(state, questions, 30_000);
  if ("fallback" in res) {
    console.error(`${name}: Jev unavailable (${res.fallback})`);
    process.exit(1);
  }
  const answers = cases.map((_, i) => res.answers[`category_${i}`]);

  console.log(`\n== ${name} (${res.model})`);
  console.log("bar   right (Jev above the bar, keywords below)   decided by Jev");
  for (const t of THRESHOLDS) {
    let right = 0;
    let byJev = 0;
    cases.forEach((c, i) => {
      const a = answers[i];
      const useJev = Boolean(a?.choice) && chosenProbability(a) >= t;
      const got = useJev ? (a!.choice === "other" ? null : a!.choice) : classifyTaskCategory(c.text);
      if (useJev) byJev++;
      if (got === c.category) right++;
    });
    console.log(`  ${t.toFixed(1)}  ${String(right).padStart(2)}/${cases.length}                                      ${byJev}`);
  }
  console.log("Jev's misses (truth ← Jev @ p):");
  cases.forEach((c, i) => {
    const a = answers[i];
    if (a?.choice !== label(c.category)) {
      console.log(`  ${label(c.category).padEnd(9)} ← ${(a?.choice ?? "-").padEnd(9)} @ ${chosenProbability(a).toFixed(2)}  ${c.text}`);
    }
  });
}
