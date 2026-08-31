# Clinical scoring & auto-trigger engine

Configuration-driven scoring for surgical ward pathways.

**Shipped surface (deliberately minimal — product decision):** the acute-pancreatitis pathway
computes **one score, BISAP**, from values already recorded. It shows as a line in the progress
note ("BISAP – 2/5"); the inputs it still needs appear as ordinary items in the to-do list.
There is **no separate scoring screen and no manual verification step** — the score is
recalculated automatically whenever the data changes (computed-on-read, like post-op day).

**Engine capability (not shipped, kept for governance + tests):** the generic engine also
supports staged/legacy scores (Ranson gallstone / non-gallstone, change-from-baseline, 48-hour
locked checkpoints), structured classification (Revised Atlanta / Modified Marshall with a
persistence timer), and documentation-only cards (Modified CTSI). Those card definitions live
in `definitions/acute-pancreatitis.v1.ts` as `PANCREATITIS_EXTENDED_CARDS`, exercised only by
`lib/scoring/__tests__/`. Adding them to the shipped pathway is a config + governance change,
not engine work. The other 19 DOCX pathways are added the same way (`definitions/skeletons.ts`).

Everything here is **behind a feature flag and OFF by default**. With the flag closed, nothing
in `lib/scoring/` or `supabase/patches/0053` is read or written and WardMate behaves exactly as
before.

---

## 1. Architecture

```
observations (existing)                          pathway_definitions (versioned config)
        │                                                  │
        ▼                                                  ▼
lib/scoring/observations-adapter.ts  ──►  EngineInput[]     PathwayDefinition
        │                                        │              │
        │                                        ▼              ▼
        │                              lib/scoring/engine.ts (PURE)
        │                              ├─ time-windows.ts   (admission / first / worst / …)
        │                              ├─ units.ts          (safe normalisation, reject ambiguous)
        │                              ├─ operators.ts      (allow-listed, NO eval)
        │                              ├─ sirs.ts / marshall.ts
        │                              └─ tasks.ts          (dedup vs existing world)
        │                                        │
        ▼                                        ▼
lib/scoring/store.ts (server-only)  ◄────────────┘
   syncPatientPathways() · recomputeInstance()
        │
        ├─► pathway_instances / pathway_cards / pathway_card_history
        ├─► pathway_tasks / pathway_checkpoints / pathway_events
        └─► pathway_audit  (append-only)
        │
        ▼
app/patients/[id]/scoring/  (server actions + <ScoringPanel/>)
```

* **The engine (`lib/scoring/*.ts` except `store.ts` / `read.ts` / `flag.ts`) is pure.** No
  database, no `Date.now()` inside evaluation — the caller passes `now`. Fully unit-tested.
* **`store.ts` is the only bridge** to the database and the only place clinical data is read.
* **`patient_id` is the encounter key** — a `patients` row already models exactly one
  admission (see `supabase/schema.sql`). One `pathway_instance` per `(patient, pathway,
  version)`.

## 2. Configuration schema

A `PathwayDefinition` (`lib/scoring/types.ts`) is validated by
`validatePathwayDefinition()` (`lib/scoring/schema.ts`). The validator **rejects**:

| Rejected | Why |
|---|---|
| duplicate `componentId` (in a card or across the pathway) | ambiguous provenance |
| a component/card with no `window` | silent mixing of time periods |
| an unsupported `canonicalUnit` | engine can't normalise it |
| an operator not in `ALLOWED_OPERATORS` | no arbitrary expressions |
| a task `action` matching the unsafe-verb list (`prescribe`, `transfuse`, `transfer to ICU`, `perform ERCP`, …) | no autonomous treatment |
| a task with no `reason` | every task must answer "why is Wardmate suggesting this?" |
| a `lockedUntilCheckpoint` / `recomputeCards` naming an undefined checkpoint/card | dangling reference |
| a numeric operator with no threshold, `in_range` without `[low,high]` | malformed rule |

Built-in definitions are validated **on module load** (`definitions/registry.ts`) — a malformed
definition throws in dev/test, never ships.

### Operators (the whole allow-list)

`gt · gte · lt · lte · eq · present · absent · in_range`. Composite criteria (`sirs`,
`modified_marshall`, `revised_atlanta`, `structured_extraction`) are named `CardCalculation`
kinds handled by dedicated tested functions — they are **not** expressible as data rules.

## 3. Event lifecycle & idempotency

`syncPatientPathways(patientId)` is the single entrypoint. Called from:

* `app/patients/[id]/page.tsx` on every patient-page load (the "computed fresh on read"
  pattern, same as post-op day).
* after any diagnosis write (add via `refreshPatientScoring`).

It is **idempotent**: trigger detection never re-creates an instance that already exists
(a dismissed instance stays dismissed); every recompute is deterministic from current
`observations`; cards/tasks/checkpoints all have unique keys.

`recordEvent()` writes a row to `pathway_events` keyed by the canonical dedup key

```
encounter_id : pathway_id : pathway_version : event_type : source_id : checkpoint
```

A unique constraint makes a replayed event a no-op (returns `false`).

## 4. Task deduplication

`planPathwayTasks()` (`lib/scoring/tasks.ts`) produces a `TaskDecision` per candidate. Before
creating an investigation task it checks, in order:

1. an acceptable existing **result** for the input key → `link_existing_result`
2. an active matching **order** → `link_existing_order` (this product has no order entry yet,
   so `activeOrders` is always empty today)
3. an existing unresolved **task** with the same dedup key → `already_present`
4. a **disabled institutional toggle** → `suppressed_toggle` (audited)

Only `create` inserts a new row. A component flagged `noAutoTask` (pleural effusion for BISAP,
every mCTSI component) never produces a task — Wardmate does not order a CT to complete a score.

## 5. Time-window behaviour

`lib/scoring/time-windows.ts` — every helper **requires** an explicit `TimeWindow`
`{ anchor, startHours?, endHours?, label }`. Anchors: `admission`, `symptom_onset`
(stored separately per DOCX §1), `activation`, `checkpoint`.

Selectors: `admission` (nearest window start) · `first` · `highest` · `lowest` · `worst`
(extreme that favours the criterion) · `change_from_baseline` (needs `baselineWindow`, and
**both** endpoints, or returns nothing) · `at_checkpoint`.

A value that exists but falls outside the window → component `unknown` with
`missingReason: "outside_time_window"`, **never** counted. A checkpoint-locked card
before its due time → every component `checkpoint_not_due`, card `not_started`.

## 6. Units

`lib/scoring/units.ts` normalises BUN, urea, glucose, calcium, creatinine, WBC, LDH, AST,
PaO₂, PaCO₂, base deficit, haematocrit, SBP, HR, RR, temperature, FiO₂. It:

* preserves the original value + unit (kept on the `EngineInput` and shown in the UI);
* converts mmol/L↔mg/dL, µmol/L→mg/dL (creatinine), ×10⁹/L→cells/mm³ (WBC), kPa→mmHg, °F→°C,
  fraction↔%;
* **rejects** ambiguous units (WBC with no unit — `11.2` vs `11200`; glucose in g/L) and
  unsupported units — the component becomes `unknown`, the raw value is still displayed.

Where a criterion depends on the lab's own limit of normal, the engine uses the reference
range printed beside the result (`observations.ref_low/ref_high`), not a hard-coded absolute.

## 7. Audit model

`pathway_audit` is **append-only** — insert + select grants only, no update/delete policy or
grant. Recorded actions: `pathway_suggested`, `pathway_accepted`, `pathway_dismissed`,
`card_calculated`, `component_overridden`, `task_generated`, `task_suppressed`,
`task_declined`, `task_completed`, `result_verified`, `formula_version_changed`,
`checkpoint_executed`, `pathway_resolved`.

A manual override is stored as a `component_overridden` audit row carrying the new value +
reason; the engine re-derives the imported value on every recompute and keeps it under
`component.override.original` — **the original imported value is never destroyed**.

`pathway_card_history` keeps one row per recompute, so "why did the score change between two
timestamps" is answerable (`getCardHistory()` / the panel's history view).

## 8. Adding a new pathway (no engine changes)

1. Write `lib/scoring/definitions/<slug>.v1.ts` exporting a `PathwayDefinition`
   (`status: "draft"`, real `sourceReferences`, `clinicalOwner`, `reviewDueAt`).
2. Register it in `definitions/registry.ts` (`BUILT_IN` array). It is schema-validated on load.
3. Add tests under `lib/scoring/__tests__/` — every threshold, including equality boundaries,
   and the time-window isolation cases.
4. Governance: fill in the clinical owner, sources, changelog, and expiry. Flip `status` to
   `"active"` only after sign-off (or set `SCORING_ENGINE_ALLOW_DRAFTS=on` for a pilot).

There is a worked example: the whole of `acute-pancreatitis.v1.ts` is nothing but data + two
local builder functions for the repeated Ranson variants.

### Skeletons

`definitions/skeletons.ts` holds the other 19 pathways as `status: "unavailable"` records —
preferred scoring system(s), trigger concepts, timing, card type, and a `licensingReview` flag
for AJCC / AIS-ISS / BI-RADS / TI-RADS content. The engine never activates them and the UI
never shows them to ordinary users.

## 9. Rolling out a new pathway version

* Versions are immutable once `active`/`retired`. A correction is a **new version** row.
* A running `pathway_instance` keeps its exact `pathway_version` forever — `store.ts` resolves
  the definition by `(pathwayId, pathwayVersion)`, never "latest". A new publication never
  mutates an in-progress or completed run.
* A DB row in `pathway_definitions` for a new `(pathway_id, pathway_version)` adds a version
  without a deploy; a row that re-uses an existing version overrides the built-in for future
  recomputes of instances on that version.

## 10. Feature flags

| Gate | Where | Effect when closed |
|---|---|---|
| `NEXT_PUBLIC_SCORING_ENGINE=on` | env (Vercel + `.env.local`) | global kill-switch; module inert |
| a `ward_scoring_engine` row for the ward | DB (ward owner opts in) | that ward is untouched |
| `SCORING_ENGINE_ALLOW_DRAFTS=on` | env | lets a `draft` pathway trigger for piloting |
| `ward_scoring_toggles` rows | DB, per ward + pathway | disable a specific generated-task toggle (e.g. `ranson_extended`) |

`isScoringEngineEnabled(wardId)` requires **both** the env switch and the ward row.

## 11. Clinical-governance review

Nothing is clinically live until, per pathway: a named clinical owner, a source list, approval
records, an effective date, and configured local toggles exist. `acute-pancreatitis.v1` ships
as `status: "draft"` with `clinicalOwner: "PENDING_CLINICAL_OWNER"` deliberately.

Licensing review required before enabling: **AJCC TNM, AIS/ISS, BI-RADS, ACR TI-RADS**, and any
third-party calculator text/logo (`skeletons.ts` → `licensingReview: true`).

## 12. Test strategy

`npm test` (Vitest, `vitest.config.ts`). Pure-logic only — no jsdom, no Next runtime.

`lib/scoring/__tests__/` covers the DOCX acceptance list: every BISAP/Ranson threshold incl.
equality boundaries, both Ranson variants, admission-vs-48h isolation, missing-stays-unknown,
event/task dedup, existing-result/-order suppression, unsupported-unit → incomplete, no CT task
for mCTSI, pleural effusion unknown without imaging, checkpoint fires once, organ failure < 48 h
not persistent, persistence → severe only at ≥ 48 h, no autonomous treatment action, override
keeps original + replacement, flag-off unchanged, verification requires completeness, timezone
-safe checkpoints, historical version pinning.
