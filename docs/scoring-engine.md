# Clinical scoring & auto-trigger engine

Configuration-driven scoring for surgical ward pathways.

**Shipped surface (product decision — one grading per disease, ward-side only):**

| Pathway | Score | Card type |
|---|---|---|
| Acute pancreatitis | BISAP | calculator |
| Acute appendicitis | AIR | calculator (banded criteria) |
| Acute upper GI bleeding | Glasgow-Blatchford | calculator (banded criteria) |
| Acute cholecystitis | Tokyo Guidelines 2018 severity | tiered classification (Grade I/II/III) |
| Acute cholangitis | Tokyo Guidelines 2018 severity | tiered classification (Grade II = any 2) |

All 12 shipped pathways (5 surgery + 7 internal-medicine, see the specialty packs) are
`status: "active"` — single-clinician pilot sign-off by Dr. Anubhav on 2026-09-07, recorded in
each definition's `clinicalOwner`; a departmental / multidisciplinary governance review is
still scheduled at each pathway's `reviewDueAt`. Runtime is still triple-gated
(`NEXT_PUBLIC_SCORING_ENGINE` + a per-ward `ward_scoring_engine` row + the unit's specialty
pack). A brand-new pathway still starts `draft` and needs the same sign-off before activation.

Each disease shows **one card** on the patient page:
- the number (or grade), one line, with an **interpretation** band;
- objective criteria auto-filled from recorded labs/vitals;
- criteria that need a clinician's eye (mental status, guarding, melaena, organ dysfunction) as
  **one-tap toggles** — or a single "**Confirm — all normal**" when only they are pending, which
  shows a **provisional** number until confirmed (the assumption is displayed, never stored);
- the full breakdown and the **source citation + risk bands** behind a tap;
- clinician answers are written as real `observations` too, so they land in the note / case
  history.

Also: a line per score in the **progress note**, and **one investigations to-do** per pathway
that clears when the relevant panel is back. No manual verification step — scores recalculate
on read (like post-op day).

**Engine capability (not shipped, kept for governance + tests):** staged/legacy scores (Ranson
gallstone / non-gallstone, change-from-baseline, 48-hour locked checkpoints), Revised Atlanta /
Modified Marshall with a persistence timer, documentation-only cards (Modified CTSI). These live
as `PANCREATITIS_EXTENDED_CARDS` in `definitions/acute-pancreatitis.v1.ts`, exercised only by
`lib/scoring/__tests__/`. The remaining DOCX pathways are recorded (not built) under §8 "Unbuilt pathways".

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
   `"active"` only after sign-off. A `draft` never triggers (the old
   `SCORING_ENGINE_ALLOW_DRAFTS` pilot switch was removed when no draft remained; re-add it in
   `triggerableDefinitions()` if a draft ever needs piloting).

There is a worked example: the whole of `acute-pancreatitis.v1.ts` is nothing but data + two
local builder functions for the repeated Ranson variants.

### Unbuilt pathways

The remaining DOCX top-20 pathways are recorded here, not in code ("Mark a pathway unavailable
rather than implementing a formula from memory"). Each row is the *product* decision — preferred
scoring system(s), trigger concepts, timing, card type — so a clinical author has a starting
point. It deliberately carries NO thresholds. Rows marked **licensing review** carry proprietary
content (AJCC, AIS/ISS, BI-RADS, TI-RADS) that needs content-governance / licensing review. Some
(MPI, LRINEC, ABSI) have since shipped as their own definitions; the notes still apply.

| Pathway | Preferred systems | Trigger concepts | Timing | Card type | Notes |
|---|---|---|---|---|---|
| Adhesive small-bowel obstruction (`adhesive_sbo`, MVP1) | Bologna/WSES red-flag pathway; 24-hour water-soluble contrast checkpoint | small bowel obstruction, adhesive obstruction, SAIO, sub-acute intestinal obstruction | Admission checklist; 24-h contrast radiograph checkpoint; hard reassessment by 72 h | structured classification | DOCX: 'Do not invent a score' — timed checklist with red flags, not a number. Peritonitis / strangulation / ischaemia contraindicate non-operative management. |
| Perforation peritonitis / secondary peritonitis (`perforation_peritonitis`, MVP1) | Mannheim Peritonitis Index; SOFA (ongoing organ dysfunction) | perforation peritonitis, hollow viscus perforation, secondary peritonitis, pneumoperitoneum | MPI partly intra-operative — must not delay source control; SOFA repeated with change | calculator | Display institution-selected MPI threshold; never treat as a surgical-indication score. |
| Acute diverticulitis (`acute_diverticulitis`, MVP3) | WSES CT classification; modified Hinchey (academic familiarity) | acute diverticulitis, sigmoid diverticulitis, complicated diverticulitis | CT-based staging when clinically appropriate; reassess on peritonitis / organ dysfunction | structured classification | Avoid auto-generating colonoscopy during the acute episode. |
| Diabetic foot ulcer / infection (`diabetic_foot`, MVP2) | IWGDF/IDSA infection severity; SVS WIfI; Wagner (secondary academic descriptor) | diabetic foot, diabetic foot infection, diabetic foot ulcer, DFU, DFI | Infection severity + WIfI at presentation; serial reassessment | structured classification | WIfI ischaemia: prefer toe pressure / TcPO₂ in diabetes (ABI may be falsely high). |
| Necrotising soft-tissue infection / Fournier gangrene (`nsti`, MVP2) | Clinical emergency pathway (primary); LRINEC (adjunct only); SOFA; FGSI (optional, Fournier) | necrotising fasciitis, NSTI, Fournier gangrene, necrotising soft tissue infection | Immediate senior review timer; scoring/imaging must not delay exploration | calculator | SAFETY: a low LRINEC must NEVER produce an 'NSTI excluded' or reassuring green state. Sensitivity ~68% at ≥6, ~41% at ≥8. |
| Groin and ventral/incisional hernia (`hernia`, MVP3) | European Hernia Society (EHS) classification | inguinal hernia, incisional hernia, ventral hernia, femoral hernia, paraumbilical hernia | Structured documentation card — not an emergency risk calculator | structured classification | Incarceration/obstruction/strangulation → launch the acute-abdomen / bowel-obstruction workflow instead. |
| Haemorrhoidal disease (`haemorrhoids`, MVP3) | Goligher grade I–IV; symptom/complication descriptors; ACRSI 2016 suffix (optional local extension) | haemorrhoids, piles, prolapsing haemorrhoids, thrombosed pile | Examination documentation and procedure selection | structured classification | Do not attribute rectal bleeding to haemorrhoids without age/risk-appropriate evaluation. |
| Fistula-in-ano (`fistula_in_ano`, MVP3) | Parks classification; St James University Hospital MRI grade; Garg (optional, complex) | fistula in ano, anal fistula, perianal fistula, recurrent anal fistula | Structured descriptors; MRI for recurrent/complex disease when clinically selected | structured classification | Do not let Goodsall's rule auto-assign the internal opening. |
| Breast lesion / breast cancer (`breast_cancer`, MVP3) | ACR BI-RADS; Nottingham histologic grade; current AJCC TNM / prognostic stage | breast lump, breast cancer, carcinoma breast, BIRADS 4, BIRADS 5 | Imaging assessment → tissue diagnosis → verified oncology staging field | documentation only, structured classification; **licensing review** | LICENSING: BI-RADS content and AJCC staging tables need a commercial content agreement. Final stage group assigned by the managing physician, not the app. |
| Thyroid nodule / thyroid cancer (`thyroid_nodule`, MVP3) | ACR TI-RADS; Bethesda System 2023; current AJCC TNM | thyroid nodule, thyroid cancer, TIRADS 4, TIRADS 5, Bethesda | US risk + size thresholds → FNA decision → verified staging for confirmed cancer | documentation only, structured classification; **licensing review** | LICENSING: TI-RADS and AJCC content need content-governance/licensing review. Discordance triggers senior review, not an automatic operation. |
| Colorectal cancer (`colorectal_cancer`, MVP3) | current AJCC TNM; CAP-style synoptic elements | colon cancer, rectal cancer, colorectal carcinoma, CRC | Primarily extraction, completeness checking and longitudinal tracking | documentation only; **licensing review** | LICENSING: do not reproduce licensed AJCC tables without a commercial content agreement. Do not compute a final stage group from incomplete pathology/imaging. |
| Major trauma / polytrauma (`major_trauma`, MVP2) | GCS + Shock Index (immediate); Revised Trauma Score (first pre-intervention obs); ISS after AIS coding | polytrauma, major trauma, RTA polytrauma, blunt trauma | GCS + SI immediately; RTS from first valid pre-intervention observations; ISS after definitive AIS coding | calculator, documentation only; **licensing review** | LICENSING: AIS/ISS is a licensed standard — do not generate AIS codes from casual text. RTS: preserve first pre-intervention values; flag intubation/sedation limits. |
| Blunt solid-organ abdominal trauma (`solid_organ_trauma`, MVP2) | AAST Organ Injury Scale (as reported); WSES class (anatomy + haemodynamics) | liver laceration, splenic injury, blunt abdominal trauma, AAST grade | AAST-OIS grade from radiology/operation; WSES class combines with haemodynamic status | documentation only, structured classification; **licensing review** | SAFETY: haemodynamic instability overrides a low anatomic grade. LICENSING: AAST-OIS is official/licensed grading content. |
| Blunt chest trauma (`blunt_chest_trauma`, MVP2) | Thoracic Trauma Severity Score (TTSS); RibScore (optional, CT fracture pattern) | blunt chest trauma, rib fractures, flail chest, pulmonary contusion, haemothorax | Monitoring/escalation aid — not a substitute for immediate treatment of tension pneumothorax or respiratory failure | calculator | TTSS 13–25 predicts high ARDS risk. |
| Major burns (`major_burns`, MVP2) | TBSA + burn depth (core record); revised Baux (adult mortality risk); ABSI (optional) | burns, flame burn, scald, electrical burn, inhalation injury | TBSA/depth at presentation; serial evolution; Baux is prognostic, not treatment-withholding | calculator, documentation only | FLUIDS: do not hard-code one Parkland order. Make the formula institution-configurable, show time since burn, subtract fluid already given, require clinician confirmation. |

## 9. Rolling out a new pathway version

* Versions are immutable once `active`/`retired`. A correction is a **new version** row.
* A running `pathway_instance` keeps its exact `pathway_version` forever — `store.ts` resolves
  the definition by `(pathwayId, pathwayVersion)`, never "latest". A new publication never
  mutates an in-progress or completed run.
* Definitions are built-in only (`definitions/registry.ts`); a new version ships with a deploy.
  The `pathway_definitions` table exists (patch 0053) but nothing writes it and the engine no
  longer reads it.

## 10. Feature flags

| Gate | Where | Effect when closed |
|---|---|---|
| `NEXT_PUBLIC_SCORING_ENGINE=on` | env (Vercel + `.env.local`) | global kill-switch; module inert |
| a `ward_scoring_engine` row for the ward | DB (ward owner opts in) | that ward is untouched |
| `ward_scoring_toggles` rows | DB, per ward + pathway | disable a specific generated-task toggle (e.g. `ranson_extended`) |

`isScoringEngineEnabled(wardId)` requires **both** the env switch and the ward row.

## 11. Clinical-governance review

Each pathway carries its governance state in three fields on the definition: `clinicalOwner`
(who has reviewed it and when), `sourceReferences` (the papers/guidelines it is built from),
and `reviewDueAt` (when it must be re-checked). There is no separate approval table — the
`clinicalOwner` string is the record, and it is shown to clinicians in the score-card footer.

**Current state (2026-09-07):** all 12 shipped pathways carry a single-clinician pilot
sign-off by Dr. Anubhav — reviewed criterion-by-criterion against the cited sources. A
departmental / multidisciplinary review is still scheduled at each `reviewDueAt` (2027). Four
known simplifications were reviewed and accepted for the pilot and are noted in the relevant
files: Glasgow-Blatchford Hb bands use the male thresholds for both sexes; the cholangitis
albumin cut-off is fixed at 2.5 g/dL rather than each lab's own lower limit; Wells DVT's
"−2 for an alternative diagnosis" is a result override, not a negative point; Wells PE's
heart-rate criterion is a clinician tap rather than auto-read from vitals.

A new pathway still starts `status: "draft"` and needs the same sign-off before activation.

**Batch 2 (2026-09-07, `active`, single-clinician pilot sign-off):** Mannheim Peritonitis
Index (`perforation_peritonitis` — surgery), LRINEC (`nsti` — surgery; every band `attention`,
low score reads "does not exclude", plus a score-independent urgent-review task), HEART
(`heart_score` — medicine), CIWA-Ar (`ciwa_ar` — surgery + medicine), Child-Pugh (`child_pugh`
— surgery + medicine), KDIGO AKI stage (`kdigo_aki` — surgery + medicine). `ciwa_ar`,
`child_pugh` and `kdigo_aki` are cross-listed on both packs because they present on surgical
wards too. New engine kind `max_points` (KDIGO stage = worst sub-score, never the sum).

Licensing review required before enabling: **AJCC TNM, AIS/ISS, BI-RADS, ACR TI-RADS**, and any
third-party calculator text/logo (§8 "Unbuilt pathways", rows marked **licensing review**).

## 12. Test strategy

`npm test` (Vitest, `vitest.config.ts`). Pure-logic only — no jsdom, no Next runtime.

`lib/scoring/__tests__/` covers the DOCX acceptance list: every BISAP/Ranson threshold incl.
equality boundaries, both Ranson variants, admission-vs-48h isolation, missing-stays-unknown,
event/task dedup, existing-result/-order suppression, unsupported-unit → incomplete, no CT task
for mCTSI, pleural effusion unknown without imaging, checkpoint fires once, organ failure < 48 h
not persistent, persistence → severe only at ≥ 48 h, no autonomous treatment action, override
keeps original + replacement, flag-off unchanged, verification requires completeness, timezone
-safe checkpoints, historical version pinning.
