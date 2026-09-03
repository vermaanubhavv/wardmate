# Specialty packs — extending WardMate beyond general surgery

**Status: DESIGN, not yet approved. No code written.** Written 2026-09-02 for the user
(a general-surgery resident, not a programmer). First target department: **Internal Medicine**.
Shipping model chosen: **one WardMate, each unit picks its specialty at setup** — not a fork.

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

---

## 5. Decisions I need from you before Phase 0

1. **Patch state** — are 0055, 0056, 0057, 0058, 0059 actually applied in Supabase? (Paste the
   output of `select max(...)`—I'll give you the exact SQL.) The new patch's number depends on it.
2. **Mixed units** — does any real medicine unit also run surgical patients it would want POD
   for? My assumption: no, one specialty per unit, matching how Indian units are actually
   organised. If wrong, the design moves `specialty` to the patient, which is more work.
3. **Who picks the specialty** — unit owner only, at creation, changeable later with a warning?
   Or fixed once set?
4. **Scope of the first medicine release** — is "hospital-day numbering + medicine dictation
   prompt + a picker" (Phases 0–1) a useful thing to put in front of a medicine resident, or
   should the first thing they see already include the checklist and discharge work (through
   Phase 2)?
5. **Score list** — the table in §2 is my starting set for medicine. Add / cut any?

---

## 6. What this design deliberately does NOT touch

- The verbatim-quote guarantee in `lib/extract.ts` (§2 of CONTEXT.md) — specialty-independent,
  untouched.
- RLS / the security model — `specialty` is not a security boundary, just a display + behaviour
  switch. No policy changes.
- The discharge card-stack, completeness checks, "AI Clinical Course" — all specialty-neutral.
- The scoring engine, validator, time-window model — already neutral.
- Anything a current surgical unit sees. Phase 0 is provably a no-op for them.
