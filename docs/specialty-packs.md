# Specialty packs — extending WardMate beyond general surgery

**Status: BUILT for MEDICAL ONCOLOGY (§7) and INTERNAL MEDICINE (§8), behind the
`SPECIALTY_PACKS` flag.** Written 2026-09-02 for the user (a general-surgery resident, not a
programmer). Shipping model: **one WardMate, each unit picks its specialty at setup** — not a fork.

The seam (Phase 0) shipped with the oncology pack on 2026-09-03. The internal-medicine pack
followed on 2026-09-04 — §2a is its brief, §8 is what got built. Phases 0–4 for medicine are
all built and, as of 2026-09-04, **pilot-activated**: seam, hospital-day pack, physician prompt,
lexicon, admission-anchored checklists (patch 0064), and the four scores CURB-65 / qSOFA+SIRS /
CHA₂DS₂-VASc / HAS-BLED — all `status: "active"`. Patches 0060–0064 are applied. The one
deliberate hold-back is the medicine discharge *condition* templates, pending the unit's
read-through. Going live still needs the env vars, the `ward_scoring_engine` row, the unit's
`specialty` set, and a deploy — see "To go live" in §8.

---

## 1. The problem in one paragraph

WardMate today assumes every unit is a general-surgery unit. That assumption is baked into the
code in about a dozen places: the day counter is "post-op day", the dictation prompt says
"a surgical resident's note", the auto-tasks fire off the operation date, the discharge
templates are keyed to operations (lap chole, breast, colorectal), the clinical scores are all
surgical (pancreatitis, cholangitis, appendicitis, UGI bleed), and the document slots include
an "OT notes" slot. A medicine unit has no operation, counts **hospital day** instead, thinks
in a **problem list**, and wants **CURB-65 / Wells / CHA₂DS₂-VASc**, not Ranson.

None of this is a rewrite. Most of the specialty-specific behaviour is *already* config-driven
(uploaded formats, the ward formulary, the scoring registry, and the lexicon is already split
into `core.ts` + `surgery.ts`). The work is to (a) name the seam, (b) move the surgical
assumptions behind it as the default pack, changing nothing a current user sees, then
(c) add a second pack.

---

## 2. The seam: a `SpecialtyPack`

One new column, one new code module per department.

### Database — patch `0060_ward_specialty.sql`

```sql
begin;

alter table wards
  add column if not exists specialty text not null default 'general_surgery';

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in ('general_surgery', 'internal_medicine'));

commit;
```

- Every existing ward keeps `general_surgery`. **Nothing changes for anyone already using the
  app.** This is the whole point of the default.
- `wards` is not `patients`, so the `current_patients` view does **not** need rebuilding
  (the trap from CONTEXT.md §5). But two RPCs return ward fields and must be checked:
  `ward_screen()` and `home_screen()`. If either is to expose `specialty` to the client in one
  round trip (§8 performance rule — round trips are the cost), the patch also replaces those
  functions. **Verify their current bodies before writing the patch.**
- Patch numbering: the last patch on disk is `0059`. **Confirm with the user that 0055–0059 are
  actually applied in Supabase** (memory notes several as "not yet applied") before calling the
  new one 0060.

### Code — `lib/specialty/`

```
lib/specialty/
  types.ts              the SpecialtyPack interface
  index.ts              getSpecialtyPack(key)  →  always returns a pack, never throws
  general-surgery.ts    the default — reproduces today's behaviour EXACTLY
  internal-medicine.ts  the new one
```

`SpecialtyPack` shape (draft — names will firm up in implementation):

| Field | What it controls | Surgery value | Medicine value |
|---|---|---|---|
| `key`, `label` | identity | `general_surgery` / "General Surgery" | `internal_medicine` / "Internal Medicine" |
| `dayNumbering` | the spine of the to-do list | `post_op` — counts from `surgery_date`, falls back to admission | `hospital_day` — always counts from `admitted_on`, ignores `surgery_date` |
| `terminology` | UI label map | `{ dayLabel: "POD", ... }` | `{ dayLabel: "Hospital day", ... }` |
| `extractPrompt` | the role line + which observation kinds matter | "surgical resident… procedure_done flips post-op status" | "physician… problem list, drug titration, pending diagnostics; no post-op concept" |
| `checklistTriggerSet` | which auto-task pack applies | POD-anchored | admission-anchored (VTE assessment, culture-before-antibiotic, antibiotic review at 48–72 h, …) |
| `dischargeFamilies` | template families offered | operation-keyed | condition-keyed (CAP, AECOPD, CHF decompensation, DKA, AKI, CVA, sepsis) |
| `scoringKeys` | which pathway definitions show in the picker | pancreatitis, cholangitis, cholecystitis, appendicitis-AIR, UGIB-GBS | CURB-65, qSOFA, Wells (DVT + PE), CHA₂DS₂-VASc, HAS-BLED, MELD-Na, Child-Pugh |
| `formatKinds` | which document slots the `/formats` page shows | all six incl. `ot_notes` | hides `ot_notes`; keeps discharge / notes / investigation / interdepartmental / logo |
| `lexicon` | dictation keyterm base list | `core` + `surgery` | `core` + `medicine` (new file, mirrors `lib/transcription/lexicon/surgery.ts`) |

`getSpecialtyPack()` **must fall back to `general_surgery` for any unknown or missing value.**
That is the same "degrade, don't crash" rule the glossary and RPC fallbacks already follow —
if patch 0060 hasn't run yet, the column read returns undefined and the app behaves exactly as
it does today.

---

## 2a. The medicine unit's real casemix (drives Phases 2–3)

From the user, 2026-09-03 — what a medicine ward here actually admits, in order:

1. **Infective etiologies** — fevers of unknown origin, sepsis, enteric fever, dengue, malaria,
   scrub typhus, TB (pulmonary + extrapulmonary), community pneumonia, UTI / pyelonephritis,
   cellulitis, meningitis.
2. **Blood & immunity** — anaemias (nutritional, haemolytic, of chronic disease), thrombocytopenia
   (dengue, ITP), pancytopenia, leukaemias / lymphoma under workup, SLE and other CTD flares,
   HIV and its opportunistic infections.
3. **Uncontrolled hypertension & diabetes** — hypertensive urgency / emergency, DKA, HHS,
   new-onset diabetes, hypoglycaemia, diabetic foot / infections crossing over from (1).

This ordering sets the priority of everything specialty-specific:

- **Discharge families** (Phase 2), first tranche: sepsis / bacteraemia, enteric fever, dengue
  (with warning-sign course), pulmonary TB (ATT start + notification), community pneumonia,
  pyelonephritis/UTI, cellulitis, DKA, HHS, hypertensive emergency, anaemia-for-evaluation,
  ITP / thrombocytopenia, SLE flare, HIV with OI. The generic "medical conservative course"
  template stays as the fallback for everything else.
- **Checklist triggers** (Phase 2), admission-anchored, casemix-shaped:
  - fever → blood cultures **before** first antibiotic dose; day-2–3 antibiotic review /
    de-escalation; malaria smear / NS1 / Widal / dengue serology sent; source documented.
  - any admission → VTE risk assessment within 24 h; capillary glucose charting if diabetic;
    HIV test offered where indicated.
  - platelets < 20 000, or < 50 000 with bleeding → recheck + haematology review flag.
  - DKA → hourly glucose, K⁺ before insulin, ketone/gas trend, anion-gap closure, transition
    to subcutaneous insulin with overlap.
  - BP ≥ 180/120 → end-organ screen (fundus, creatinine, ECG, urine protein) documented before
    labelling urgency vs emergency.
  - TB diagnosed → ATT start date, weight-based dosing, baseline LFT, notification.
- **Dictation lexicon** (`lib/transcription/lexicon/medicine.ts`, Phase 4): antibiotic names
  (piptaz, meropenem, doxycycline, ceftriaxone, artesunate…), ATT (HRZE), insulin regimens,
  antihypertensives, haematology terms (schistocytes, blasts, reticulocyte), serology names
  (NS1, Widal, Weil-Felix, ANA, dsDNA), OI terms. This lexicon is *drug- and serology-heavy*
  where the surgery one is procedure-heavy.
- **Scores** (Phase 3): CURB-65 (pneumonia) and qSOFA + SIRS (sepsis) map straight onto
  tranche 1. CHA₂DS₂-VASc + HAS-BLED serve the AF cases that ride along. A dengue
  warning-sign checklist and a DKA-resolution checklist are better modelled as checklist
  triggers than as scores — see above.

## 3. Every wiring point (the actual work list)

Each of these currently hardcodes a surgical assumption. The change is the same each time:
read it from `getSpecialtyPack(ward.specialty)` instead. Grep done 2026-09-02.

**Day numbering**
- `lib/patient-state.ts` — `derivePatientState()` computes the day number. Route through
  `pack.dayNumbering`.
- `lib/checklist-triggers.ts` — `pod_gte` / `day_of_surgery` / `hours_since_surgery_gte`
  conditions. Medicine trigger set uses the already-existing `hours_since_admission_gte` instead.
- `lib/urgency.ts`, `lib/handover.ts`, `lib/ward.ts` — sort / display by day number.
- `lib/apply-procedure-done.ts`, `lib/diagnosis-from-procedure.ts` — surgery-only; medicine
  pack still *recognises* `procedure_done` (a medical patient can get a chest drain or a
  dialysis line) but it is shown as "s/p X on hospital day n" and does **not** reset the spine.

**Dictation → extraction**
- `lib/extract.ts` — `SYSTEM_PROMPT` opens "a surgical resident's spoken ward-round note".
  Pack supplies the role line and any kind-specific guidance. The **verbatim-quote safety check
  stays exactly as is** — it is specialty-independent and is the core clinical guarantee.
- `lib/transcription/lexicon/` — add `medicine.ts`; `patient-context.ts` picks the base list
  from the pack.
- `docs/medical-dictation-keyterms.md` — document the medicine lexicon alongside.

**Discharge**
- `lib/discharge-templates.ts` — families are surgical. Add medical families in the same shape;
  pack chooses the set. The card-stack workspace and the verbatim / completeness-check
  machinery are specialty-independent — leave them.
- `lib/discharge-ai.ts`, `lib/discharge-data.ts` — "post-op day" references → pack terminology.

**Scoring**
- `lib/scoring/definitions/registry.ts` — filter the offered list by `pack.scoringKeys`.
- New definition files under `lib/scoring/definitions/`. The engine, schema validator, time
  windows (`admission` / `symptom_onset` anchors already exist), and `sirs.ts` need **no
  change** — this framework was already built specialty-neutral.
- **Clinical governance: every medical score needs the same sign-off the surgical ones are
  getting.** Ship them `status: "draft"` until then.

**Setup / settings**
- `app/onboarding/create-unit-form.tsx` + `app/unit/actions.ts` `createWard` — add a specialty
  picker. `create_ward_for_current_user` RPC takes a second argument (patch 0060).
- `app/unit/page.tsx` — owner can change specialty later (rare; behind a confirm — it re-labels
  the whole unit).

**Feature flag**
- `SPECIALTY_PACKS` env flag. Off = picker hidden, everything forced to `general_surgery`.
  Ship dark, pilot with one real medicine unit, then flip.

---

## 4. Phasing (each phase ships on its own, verifiable)

| Phase | Content | How it's verified | User-visible? |
|---|---|---|---|
| **0 — the seam** | `SpecialtyPack` interface, registry, `getSpecialtyPack`, patch 0060, the `general_surgery` pack reproducing today exactly. Pure refactor. | `tsc --noEmit`, `eslint`, `next build`, `vitest`, plus a node script asserting day-number + trigger output is byte-identical before/after on sample patients. | **No.** Zero change. |
| **1 — Medicine core** | `internal-medicine.ts`: hospital-day numbering, extract prompt, terminology map. Specialty picker at setup, behind flag. | New unit set to medicine on a throwaway account; dictate a round; confirm "Hospital day 3" not "POD". | Only for flagged units. |
| **2 — Medicine tasks + discharge** | Admission-anchored checklist trigger set; medical discharge families. | Sample medicine patients through the checklist; generate a CAP discharge. | Flagged units. |
| **3 — Medicine scores** | CURB-65, qSOFA, Wells, CHA₂DS₂-VASc (+ others), `status: draft`. | Vitest cases per score from published worked examples. | Flagged units, marked draft. |
| **4 — Polish + pilot** | Medicine lexicon, `ot_notes` slot hidden, wording sweep. Flip `SPECIALTY_PACKS` on for the pilot unit. | Real use on one medicine unit for a week. | Yes, for the pilot. |

**First pilot ships at end of Phase 2** (0 + 1 + 2). Phase 3 scores land after. Phase 4 polish
can overlap the pilot.

---

## 5. Decisions

Resolved 2026-09-03:

1. **Patch state** — 0055–0059 all applied and deployed. New patch is **`0060`**.
2. **Mixed units** — no. Medicine never needs POD. `specialty` lives on the **ward**, one per
   unit. (Confirmed.)
3. **Who picks the specialty** — set when the unit is created and it defines the unit for good.
   Every resident joins a specific unit by its join code; a medicine unit's code creates
   medicine residents. Changing a live unit's specialty is not a normal action — put it behind
   an owner-only confirm, or leave it out of v1 entirely.

4. **First medicine release = through Phase 2.** A medicine resident's first look includes
   hospital-day numbering, the physician dictation prompt, the specialty picker, admission-
   anchored checklists, and medical discharge templates. Scores (Phase 3) follow after the pilot.
5. **Medicine score set (Phase 3): CURB-65, qSOFA + SIRS, CHA₂DS₂-VASc, HAS-BLED.**
   Wells, MELD-Na, Child-Pugh deferred.

---

## 6. What this design deliberately does NOT touch

- The verbatim-quote guarantee in `lib/extract.ts` (§2 of CONTEXT.md) — specialty-independent,
  untouched.
- RLS / the security model — `specialty` is not a security boundary, just a display + behaviour
  switch. No policy changes.
- The discharge card-stack, completeness checks, "AI Clinical Course" — all specialty-neutral.
- The scoring engine, validator, time-window model — already neutral.
- Anything a current surgical unit sees. Phase 0 is provably a no-op for them.

---

## 7. What is built (2026-09-03) — medical oncology

Two patches and one new folder. Nothing a surgical unit sees has changed; that is tested, not
asserted — see `lib/__tests__/specialty.test.ts`.

### Patches

| Patch | What it does |
|---|---|
| `0060_specialty_packs.sql` | `wards.specialty`; `patients.regimen` / `cycle_number` / `cycle_started_on`; `current_patients.cycle_day`; `ward_screen()` and `home_screen()` return the specialty; `create_ward_for_current_user(text, text)` as a NEW overload (the one-argument version is untouched, so an un-redeployed client keeps working) |
| `0061_oncology_checklists.sql` | Two checklist protocols — febrile neutropenia and chemotherapy cycle — plus the seven `care_templates` rows that put the oncology families in the ward picker. Seeded `draft`, so **residents cannot see the checklists until the unit publishes them** (the one-line SQL is in the patch header) |

### Code

`lib/specialty/` — `types.ts` (the interface), `index.ts` (`getSpecialtyPack`, never throws,
always falls back to surgery), `general-surgery.ts` (today's behaviour, written down),
`medical-oncology.ts`, `discharge.ts` (pack-aware template selection).

What the oncology pack changes, and where:

- **Day numbering** — `C2 D3` off `cycle_started_on`, falling back to `Day n` from admission
  when there is no active cycle. An operation never starts the count: a chemoport is not POD 0.
  (`lib/patients.ts` `dayLabel`, `lib/handover.ts`, the ward list.)
- **Dictation** — the extraction prompt's role line becomes "a medical oncology resident's",
  plus a ward-guidance section: the day number is a cycle day, a regimen is a diagnosis-level
  fact and is never split into its drugs, a toxicity grade is only ever recorded if spoken,
  chemotherapy given is not a `procedure_done`. **Every safety rule and the verbatim-quote
  check are shared and untouched** — the surgical prompt is byte-identical to what it was,
  which is asserted in code.
- **Keyterms** — `lib/transcription/lexicon/oncology.ts`: regimens, cytotoxics, targeted
  agents, supportive drugs, count and toxicity vocabulary, response and staging shorthand,
  access devices, tumour markers. Chosen automatically from the unit's specialty; a surgical
  unit's keyterm budget is never spent on bortezomib. "RT" is deliberately absent — ambiguous
  between radiotherapy and Ryle's tube.
- **Checklists** — new trigger conditions `cycle_day_gte` / `cycle_day_lte` / `day_of_cycle` /
  `on_regimen` alongside the existing post-op ones. The febrile-neutropenia checklist turns
  "blood cultures sent before antibiotics" and "first antibiotic dose time" into gaps once the
  patient is an hour in.
- **Discharge** — `lib/discharge-templates-oncology.ts`: febrile neutropenia, chemotherapy
  cycle, chemotherapy toxicity, leukaemia induction, lymphoma, myeloma, transfusion support,
  plus a generic fallback. Every one carries the same fever red flag in the same words.
- **Scores** — the pack's `scoringKeys` is EMPTY, so no surgical pathway can trigger on an
  oncology unit. MASCC, Cairo-Bishop and ECOG are the next phase, after the pilot.
- **Formats** — no `ot_notes` slot.
- **Setup** — a department picker on the create-unit form, shown only when `SPECIALTY_PACKS=on`.

### The flag

`SPECIALTY_PACKS=on` in the server environment. Off (the default) hides the picker and every
new unit is general surgery. The packs still exist and still work; they are simply unreachable.

### Added 2026-09-04

Both patches applied in Supabase. Three things went in on top of the pack:

**Chemotherapy is enterable.** Regimen (with a suggestion list), cycle number and cycle start
date, on the add-patient form and on the edit dialog behind the pen — shown only on an oncology
unit, so a surgical unit's save never touches those columns. Clearing the regimen clears the
cycle with it and the patient counts hospital days again. A cycle number with no start date is
refused rather than half-stored, because it would print a number that looks like a day and is
not one. The patient page now leads with the unit's own clock: `C2 D3 R-CHOP` where a surgical
patient reads `POD 0 Lap chole`.

**The OPD-paper reader captures everything a paper prints.** It was name, age, sex, IP number
and diagnosis; it is now those plus MRD number (kept strictly apart from the IP number — a
paper carrying only one unlabelled identifier fills MRD and leaves IP null rather than
guessing), bed, date of admission, an operation *only if already performed*, and on an oncology
paper the regimen, cycle number and cycle start date. `C3D1` reads as cycle 3, day 1. An
ambiguous date returns null. Photographing a second paper adds to the form rather than resetting
it, and nothing the paper did not carry overwrites a box already typed by hand.

One thing the paper deliberately does NOT set: the management dropdown. An operation named on
the paper does mean the patient arrives operated, but selecting "Post-op" puts a date-of-
operation box on screen pre-filled with today — a date nobody read off anything. The operation
text is kept; the resident chooses the phase and types the real date.

**The clerking card stack has an oncology form.** Four history cards and a performance status
card, inserted after the general background, in the order an oncologist actually takes a
history:

| Card | What it holds |
|---|---|
| Oncological history | Site, histology, IHC / molecular markers, stage, date of diagnosis |
| Treatment received | Previous surgery, radiotherapy, earlier lines with cycles and response |
| Current cycle | The regimen running now, which cycle, which day, dose changes |
| Toxicity since last cycle | What the last cycle did, graded only if a grade was actually decided |
| Performance status | ECOG 0–4 as exclusive choices, in the scale's own wording |

Each is chips-plus-free-text over the same string, so a card filled by tapping and one filled by
dictation are the same card. The live dictation router is told about these sections only on an
oncology unit — a segment routed to one on any other unit is dropped rather than filed somewhere
it cannot be reviewed. All five are `alwaysShow: false`, so a surgical case sheet does not grow
five "NR" lines it has no way to answer.

The "Current cycle" card is narrative only. The day count on the ward list comes from the
patient record's own regimen and cycle-start fields, and the card says so — otherwise a resident
would fill the card and wonder why the counter never moved.

### Known rough edges, for the pilot

1. **The checklists are `draft` and invisible until published.** Deliberate: the content is not
   clinically signed off. Publish with the SQL in the header of patch 0061.
2. **The discharge templates are not signed off either.** Every drug, dose and threshold in
   `lib/discharge-templates-oncology.ts` is a clinical statement and needs the unit's read-through,
   the way the surgical templates got their v1.0 review.
3. **The checklist picker still calls itself a procedure picker.** An oncology unit picks
   "Chemotherapy cycle" from a control labelled for operations. A wording sweep is a Phase 4 job.

---

## 8. What is built (2026-09-04) — internal medicine

One patch (`0063`) and one new pack file, on top of the §7 seam. Nothing a surgical or an
oncology unit sees has changed; `lib/__tests__/specialty.test.ts` covers it (30 tests).

### Patch

| Patch | What it does |
|---|---|
| `0063_internal_medicine.sql` | Widens `wards_specialty_check` and the `create_ward_for_current_user(text, text)` guard to allow `internal_medicine`. **That is the whole seam patch** — a medicine unit needs no new patient columns: its day counter is `current_patients.admission_day`, which every patient already has. |
| `0064_medicine_checklists.sql` | Three checklist protocols — **Febrile Illness — Admission**, **Diabetic Ketoacidosis**, **Hypertensive Emergency** — plus 21 `care_templates` picker rows for the medicine families. Seeded `draft`, so **residents cannot see the checklists until the unit publishes them** (publish SQL is in the patch header). Attaches only to patients carrying a medicine family — invisible on a surgical or oncology ward. |

### Code

`lib/specialty/internal-medicine.ts` — the pack. Plus `internal_medicine` added to
`SPECIALTY_KEYS` / the registry, `"admission"` added to `checklistAnchor`, and
`"internal-medicine"` added to the lexicon `Specialty` union.

What the medicine pack changes, and where:

- **Day numbering** — always `Day n` from admission. Never POD, never a cycle. A bedside
  procedure (a pleural tap, an LP, a dialysis line) does not flip the patient to POD 0 —
  `dayCount` ignores `post_op_day` and the chemo fields entirely.
- **Terminology** — `dayLabel` "HD", `admissionNoun` "problem" (the round thinks in a problem
  list, not an operation).
- **Dictation** — the extraction prompt's role line becomes "a physician's spoken ward-round
  note", plus a ward-guidance section: the day number is a hospital day (there is no post-op
  day), a diagnosis is usually a syndrome-under-workup and the "?" and "for evaluation" are
  kept, "ATT"/"HRZE" are never expanded into their component drugs, a glucose/ketone/BP is
  only ever recorded if spoken, urgency-vs-emergency is never decided by the model. **Every
  safety rule and the verbatim-quote check are shared and untouched.**
- **Keyterms** — `lib/transcription/lexicon/internal-medicine.ts`: tropical-fever serologies
  (NS1, Widal, Weil-Felix, MP smear, CBNAAT), Indian anti-microbial brand names (Monocef,
  Magnex, Piptaz, Meronem), ATT as one token, antihypertensive and insulin vocabulary, and the
  haematology shorthand (peripheral smear, reticulocyte, Coombs, marrow). Drug-, serology- and
  syndrome-heavy where the surgical core is procedure-heavy. "RT" is deliberately absent.
- **Checklists (Phase 2)** — `checklistAnchor: "admission"`. The admission-anchored trigger
  conditions (`hours_since_admission_gte`, `lab`, `history`) already exist — no new trigger
  code. Three checklists seeded `draft` by patch `0064` (febrile illness, DKA, hypertensive
  emergency); the febrile-illness one raises "blood cultures sent before antibiotics" to a gap
  once the patient is an hour in.
- **Discharge (Phase 2)** — ships the **generic medical template only**
  (`lib/discharge-templates-medicine.ts`, `MEDICINE_DISCHARGE_TEMPLATES` is `[]` on purpose).
  A medicine discharge prescription is entirely patient-specific, so the generic scaffold is
  visible `[ … ]` blanks with no guessed drug list. The condition-keyed set (enteric fever,
  dengue, DKA, hypertensive emergency, …) is deferred to the medicine unit's clinical
  read-through — the one deliberate hold-back, kept from the earlier decision to not ship
  unreviewed medical prescriptions.
- **Scores (Phase 3)** — `scoringKeys: ["curb_65", "qsofa", "cha2ds2_vasc", "has_bled"]`. Four
  new definition files under `lib/scoring/definitions/`, registered, all `status: "draft"`.
  SIRS rides inside the qSOFA pathway as a second card (`calculation: { kind: "sirs" }`).
  `sex` was added as a synthetic engine input (`lib/scoring/observations-adapter.ts`) for
  CHA₂DS₂-VASc. Every score carries safety wording that declines to prescribe — "discuss
  anticoagulation", "assess for critical care", never "start" / "give". No surgical pathway
  can ever trigger on a medicine unit (only listed `pathwayId`s are offered). All triple-gated:
  `status: draft` + `SCORING_ENGINE_ALLOW_DRAFTS` + `NEXT_PUBLIC_SCORING_ENGINE` + a per-ward
  `ward_scoring_engine` row.
- **Formats** — no `ot_notes` slot.
- **Dictation keyterms doc (Phase 4)** — `docs/medical-dictation-keyterms.md` §2 now lists the
  two specialty lexicon files.
- **Setup** — the department picker already lists every pack via `listSpecialties()`; internal
  medicine appears automatically when `SPECIALTY_PACKS=on`. No app-layer change was needed.

### Verified

`tsc --noEmit` clean, `eslint` clean, `vitest` **194/194** (30 specialty + 20 medicine-score
tests; every definition passes the schema validator on load, now with `status: "active"`).
`next build` was **not** run in this session (a dev server for this folder is held by another
session).

### Activation state (2026-09-04)

Patches `0060`–`0064` are **applied** in Supabase. On the product owner's direction the pilot
was activated:

- **Scores** — all four flipped to `status: "active"` in code (was `draft`). `clinicalOwner`
  records the pilot activation and each keeps its `reviewDueAt` for the formal governance pass.
- **Checklists** — publish with the SQL in `0064`'s header (`update company_protocols set
  status = 'published' …`).

Still owned by the user, not code (see the "To go live" checklist below): the Vercel env vars
(`SPECIALTY_PACKS=on`, `NEXT_PUBLIC_SCORING_ENGINE=on`), the per-ward `ward_scoring_engine` row,
setting the medicine unit's `wards.specialty`, and the `vercel --prod` deploy.

### To go live — the steps only the user can run

```sql
-- 1. Publish the three medicine checklists
update company_protocols set status = 'published', published_at = now()
 where title in ('Febrile Illness — Admission Checklist',
                 'Diabetic Ketoacidosis — Checklist',
                 'Hypertensive Emergency — Checklist');

-- 2. Mark the medicine unit (replace the join code with the real one)
update wards set specialty = 'internal_medicine'
 where join_code = 'XXXXXX';

-- 3. Turn the scoring engine on for that ward
insert into ward_scoring_engine (ward_id)
select id from wards where join_code = 'XXXXXX'
on conflict (ward_id) do nothing;
```

Vercel (Project → Settings → Environment Variables, then redeploy):
`SPECIALTY_PACKS=on`, `NEXT_PUBLIC_SCORING_ENGINE=on`.

Deploy: `npx vercel --prod --yes` from a clean tree.

### Known rough edges, for the pilot

1. **The medicine discharge condition-templates are the one thing not built** — deliberately,
   pending the medicine unit's read-through of the prescriptions. `MEDICINE_DISCHARGE_TEMPLATES`
   gets its condition set once that sign-off happens. The generic template works today.
2. **Scores are active but the formal governance review is still on the books** (`reviewDueAt`
   on each). Runtime is still triple-gated, so nothing shows unless the engine env var and the
   ward row are both set.
3. **The checklist picker still calls itself a procedure picker** — shared Phase 4 wording
   sweep with oncology, not yet done.

---

## 9. More medicine scores + diagnoses + checklists (2026-09-05)

Extending §8, on request: three more scores, ~28 more diagnoses in the dictation lexicon, and
two more checklists.

**Scores** — `lib/scoring/definitions/wells-dvt.v1.ts`, `wells-pe.v1.ts`, `dka-severity.v1.ts`,
all `status: "active"` from the moment they're written (same pilot-activation basis as §8's
four). `internalMedicinePack.scoringKeys` is now
`["curb_65","qsofa","cha2ds2_vasc","has_bled","wells_dvt","wells_pe","dka_severity"]` — 7 total.

- **Wells DVT / Wells PE** — the classic two-tier scores. Wells DVT's "-2 if an alternative
  diagnosis is at least as likely" criterion can't be encoded as negative points (the schema
  requires `points >= 0`), so it's kept as a `points: 0` component whose answer is surfaced as
  an explicit override in the interpretation text ("if Yes, treat as unlikely regardless of the
  number") rather than silently miscomputed.
- **DKA severity** — a `tiered_classification` card (mild/moderate/severe, ADA/JBDS criteria),
  the same shape as the surgical Tokyo-Guidelines cards. Grades DKA once diagnosed; does not
  itself distinguish DKA from HHS, which stays a clinical judgement, on purpose (see the file's
  header for why forcing that into one ladder would have been wrong).
- Added `bicarbonate` to the scoring engine's observation adapter (`lib/scoring/observations-
  adapter.ts`) — it wasn't a recognised analyte before DKA severity needed it.

**Diagnosis lexicon** — `lib/transcription/lexicon/internal-medicine.ts` grew from ~25 to ~53
named diagnoses: more infective (viral hepatitis, amoebic liver abscess, infective endocarditis,
chikungunya, osteomyelitis/septic arthritis), more blood/immunity (RA, ANCA vasculitis, myeloma,
DIC, APLA), more endocrine (hypothyroid/myxedema, thyrotoxicosis/thyroid storm, adrenal crisis),
and a new fourth section for the cardiac/renal/neuro/hepatic admissions that ride along on any
general medicine ward (ACS, decompensated heart failure, AF, AKI, CKD, stroke, seizures,
decompensated CLD, alcohol withdrawal, COPD/asthma exacerbation).

**A real bug found and fixed while adding these**: three of the new abbreviation aliases (`RA`,
`MI`/`ACS`, `IE`, `ALA`) are short enough to appear as accidental substrings inside unrelated
words the matching algorithm checks via plain `.includes()` — `"RA"` inside "abdominal **dra**in",
`"ALA"` inside "m**ala**ria" (a diagnosis in the same list). This isn't a hypothetical: it broke
the existing `20–50 term` selection test for a *surgical* pancreatitis context, because
specialty is a scoring boost, not a filter — every unit's dictation is scored against the whole
merged lexicon. Fixed by dropping the bare short alias in each case (same reasoning the file
already applies to excluding `RT`) while keeping the longer, safe forms (`RA flare`, `NSTEMI`,
`STEMI`, `bacterial endocarditis`, `liver abscess`). Caught by the existing test suite, not
missed by it — the value of not skipping "unrelated-looking" test failures.

**Checklists** — `supabase/patches/0067_medicine_checklists_2.sql`, seeded `draft` like 0064:
- **Suspected VTE** (new family `vte_suspected`) — clinical probability documented, D-dimer,
  imaging, bleeding risk before anticoagulating, dose, renal function, follow-up duration. Ties
  directly to the two new Wells scores.
- **Dengue — Warning Signs** (reuses the existing `dengue` family from 0064) — WHO 2009 warning
  signs, platelet/haematocrit trend, fluid plan by phase, NSAIDs avoided, shock signs excluded.
  This was named as a to-do back in §2a ("better modelled as a checklist trigger than a score")
  and is now built as exactly that.
- One item appended to the existing DKA checklist — "severity graded" — via a guarded `INSERT`,
  not a delete-and-rebuild, so it can't disturb anything already customised on the other 13.

**Verified**: `tsc --noEmit` clean, `eslint` clean, `vitest` **218/218** (33 in the medicine-
scores suite, up from 20). `next build` not run this session.

**Still true from §8**: all of this is inert in production until 0066/0067 are run in Supabase
and the code is deployed (`npx vercel --prod --yes` from inside `coreresident/`). The discharge
condition-templates are still the one deliberate hold-back.
