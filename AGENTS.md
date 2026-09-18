<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

- Product rules that every feature follows: never invent a clinical value ("not recorded" is
  never a guess); every stored value keeps a verbatim source quote; a negative is stored only
  when explicitly said, and "not asked" is a distinct third state; numbers, drugs and doses
  stay amber until confirmed; only name, age, sex and bed identify a patient, and tests,
  fixtures, logs and prompts carry synthetic data only; suggestions are phrased as questions,
  never as a diagnosis or an instruction.
- Migrations are additive, hand-numbered under `supabase/patches/` and applied by `npm run db:push`.
- History check (trees, validator, Ward/Academic toggle, examination checklist, evals):
  `docs/history-check.md`.
