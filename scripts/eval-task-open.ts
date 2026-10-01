/**
 * Scores Jev's to-do rescue (lib/jev-observations.ts, `open_i`) on the synthetic plans in
 * lib/evals/task-open-cases.ts, for the live wording and the candidates below.
 *
 *   node --env-file=.env.local --import ./scripts/alias-register.mjs scripts/eval-task-open.ts [--held-out]
 *
 * Needs TYPESAFE_API_KEY. One Jev request per wording (all cases batched), so a run is cheap.
 *
 * What "good" means here is lopsided, on purpose: a job left hidden is the dangerous miss
 * (lib/task-classification.ts), a plan wrongly rescued is one extra line someone ticks. So read
 * the table for the highest threshold that still rescues every job, then the fewest wrong ones.
 */
import { TASK_OPEN_CASES as TRAIN, TASK_OPEN_HELD_OUT } from "../lib/evals/task-open-cases.ts";
import { openQuestion } from "../lib/jev-observations.ts";
import { askJev } from "../lib/jev.ts";
import { isActionableTask } from "../lib/task-classification.ts";

const CANDIDATES: Record<string, (path: string) => unknown> = {
  // Chosen 2026-10-02 over the first wording (13/16 rescued) and `examples` below.
  live: openQuestion,

  // Same idea with contrasting examples in the question, as TypeSafe's docs suggest when
  // options are easy to confuse.
  examples: (path) => ({
    type: "noul",
    instructions: {
      question: `Does \`${path}\` leave a task open for the ward team?`,
      open_examples: ["continue drain output charting", "CT done, report awaited", "remove catheter tomorrow"],
      closed_examples: ["continue IV antibiotics", "dressing done", "one unit PRBC given"],
    },
    criteria: {
      true: "Like `open_examples`: something still to do, chase or keep watching",
      false: "Like `closed_examples`: only a record of treatment given, done or continued",
    },
  }),
};

// --held-out scores the cases that were never used to choose the wording.
const TASK_OPEN_CASES = process.argv.includes("--held-out") ? TASK_OPEN_HELD_OUT : TRAIN;

const THRESHOLDS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];

const stray = TASK_OPEN_CASES.filter((c) => isActionableTask(c.text));
if (stray.length > 0) {
  console.error("These cases do not trip the keyword filter, so Jev is never asked about them:");
  for (const c of stray) console.error(`  ${c.text}`);
  process.exit(1);
}

const state = { observations: TASK_OPEN_CASES.map((c) => ({ label: "plan", value: c.text, quote: c.text })) };
const jobs = TASK_OPEN_CASES.filter((c) => c.job).length;
const notJobs = TASK_OPEN_CASES.length - jobs;

for (const [name, question] of Object.entries(CANDIDATES)) {
  const questions: Record<string, unknown> = {};
  TASK_OPEN_CASES.forEach((_, i) => (questions[`open_${i}`] = question(`observations[${i}].value`)));
  const res = await askJev(state, questions, 30_000);
  if ("fallback" in res) {
    console.error(`${name}: Jev unavailable (${res.fallback})`);
    process.exit(1);
  }
  const p = TASK_OPEN_CASES.map((_, i) => res.answers[`open_${i}`]?.noul ?? 0);

  console.log(`\n== ${name} (${res.model})`);
  console.log("threshold  jobs rescued   wrongly rescued");
  for (const t of THRESHOLDS) {
    const hit = TASK_OPEN_CASES.filter((c, i) => c.job && p[i] >= t).length;
    const wrong = TASK_OPEN_CASES.filter((c, i) => !c.job && p[i] >= t).length;
    console.log(`  ${t.toFixed(1)}       ${String(hit).padStart(2)}/${jobs}          ${String(wrong).padStart(2)}/${notJobs}`);
  }
  console.log("per case (p = probability it is a job):");
  TASK_OPEN_CASES.forEach((c, i) => console.log(`  ${c.job ? "JOB " : "done"}  ${p[i].toFixed(2)}  ${c.text}`));
}
