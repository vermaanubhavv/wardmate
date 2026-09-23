# History check

A card on the patient's **History** tab that reads the case-history entries, maps them onto a
complaint-specific question tree, and shows what has and has not been asked. It generates no
clinical value: every stored answer carries a verbatim quote from the dictation, "not asked" is
a third state that is never rendered as a negative, and the output is a list of questions to
consider, never a diagnosis or an instruction.

Feature flag: `NEXT_PUBLIC_HISTORY_CHECK=on` (env, Vercel + `.env.local`). With the flag off the
card is not rendered, the API route returns 404, the server actions refuse, the `/learn` pages
return 404, and nothing under `lib/history-check/` is queried. Off by default.

Clinical content (the trees, the examination checklist, the teaching lines) is marked
`pending_clinician_review` and shows that chip on the card and the learning pages until a
clinician sets `reviewStatus: "reviewed"` and `reviewedBy` in the file.

The fifteen general-surgery trees (abdominal pain, abdominal distension, anorectal pain, bleeding
per rectum, breast lump, burns, constipation, dysphagia, groin swelling, haematemesis, leg ulcer,
lump, problem after an operation, scrotal swelling, neck swelling (thyroid)) are `reviewed`,
signed off by Dr Anubhav Verma — the first twelve on 2026-09-22, the last three on 2026-09-23.
Every other tree is still pending, including `jaundice`, which is a medicine-ward tree even
though it now carries the obstructive questions. `trees.test.ts` pins that list, so a tree cannot drift into "reviewed" as
a side effect of an edit.

## Pipeline

```
case-history entries (voice transcript | photo transcript | typed observations)
  → lib/history-check/sources.ts     buildSources: numbered sources, oldest first
  → lib/history-check/extract.ts     one model call, JSON schema output, cached system block
  → lib/history-check/validate.ts    deterministic post-validator (see rules below)
  → history_checks row               (patch 0078) result + rejections + usage + cost
  → lib/history-check/view.ts        rendered for Ward and Academic on the server
  → app/patients/[id]/history-check-card.tsx
```

Validator rules, in code not in the prompt:

- every quote must be a literal substring (case- and whitespace-insensitive) of the source it
  cites, else the slot becomes `unasked` and a rejection is recorded;
- a `negative` needs an explicit negation word before one of the slot's terms in that quote,
  with no affirmation in the same clause; "no headache, vomiting present" is a negative for
  headache only;
- a value slot needs its value verbatim in the source;
- unknown states and unknown slot ids are dropped;
- conflict quotes and the wrong-patient quote are checked the same way.

The English-only negation lexicon is by design: entries are dictated by residents, interns and
students, not by patients or attendants.

Idempotency: `inputHash` is sha256 over tree id, tree version, prompt version, model and the
ordered `(entry id, text)` pairs. A second run with nothing changed returns the stored row and
makes no model call. Rate limit: `HOURLY_CAP` (30) runs per user per hour, counting error runs.
Cost: `estimateCostUsd` from the usage block is stored on the row and logged by
`log.info("history check run", …)` with token counts.

## Data model

`history_checks` (supabase/patches/0078): one row per `(patient_id, input_hash)`. `result` is
the validated `CheckResult`; `rejections` is what the validator overruled; `resolutions` is the
resident's taps (a slot state, or a dismissal, each with `at` and `by`), overlaid on read and
never written into `result`. RLS: ward members select/insert; update is granted on
`resolutions` only. Additive; nothing existing changed.

Rendering (`view.ts`) computes both modes at once:

| Mode | Gap list | Text |
|---|---|---|
| Ward | red flags always; discriminating and remaining questions trimmed to `tier: "core"` | same |
| Academic | every unasked question, with the `teach` line where one exists | same, plus every unasked red flag listed |

A slot in conflict (two statements disagree) is shown in amber with both quotes and buttons
(Present / Explicitly absent / Not asked / Leave as is). Until resolved it counts as unasked and
is kept out of the history text. A wrong-patient flag is shown first with the sentence that
triggered it. Numeric values render amber with "(unconfirmed)"; there is no confirm flow in v1.

## Content

### Trees — `content/history-trees/`

Forty-nine complaints: fever, chest pain, breathlessness, abdominal pain, jaundice, cough,
oedema, headache, altered sensorium / seizures, limb weakness, diarrhoea / vomiting, generalised
weakness, giddiness, decreased urine output, constipation, abdominal distension, lump, bleeding
per rectum, burning micturition, loss of weight / appetite, palpitations, joint pain,
haematemesis, polyuria / polydipsia, low back pain, sore throat, fever with rash, poisoning /
snake bite, dysphagia, groin swelling, breast lump, anorectal pain, leg ulcer, and scrotal
swelling, head injury, shock, and four paediatric complaints (fever, diarrhoea, cough or
difficult breathing, and seizure), bleeding per vaginum, vaginal discharge, labour pains and
leaking, fever on chemotherapy, blood in the urine, and limb injury.

Forty-nine trees in all, spanning general medicine, general surgery, emergency medicine,
paediatrics, medical oncology, obstetrics and gynaecology, orthopaedics, urology and
neurosurgery — the specialty order set by the product owner.

Surgical trees add `surgicalBackground()` from `_helpers.ts`: previous operations and what went
wrong with them, anaesthetic and transfusion history, blood thinners, regular medicines, allergy,
exercise tolerance, implants, and last food and fluid. All `exposure`, ids prefixed `surg_` so a
tree can carry both these and its own "previous hernia surgery". `surgicalBackground({ acute:
true })` promotes the last-meal question from the long case to the ward round. Last food and
fluid is deliberately not a red flag: a red-flag positive raises the safety level of the whole
history, and a patient who has eaten is a timing question, not a danger signal.
`docs/surgical-history.md` is where the content came from.

Paediatric trees add `paedBackground()` from `_helpers.ts`: birth history, immunisation,
development, feeding and growth. Age is deliberately not a slot — it comes from the patient
record, and only name, age, sex and bed identify a patient.

Some complaints legitimately match more than one tree — "breast lump" suggests both the generic
`lump` tree and `breast_lump`, and a bite suggests both `poisoning_snakebite` and any tree its
symptoms match. `suggestTrees` returns all of them in registry order; the card is built to show
more than one.

Every PubMed id in a tree's `references` has been checked against PubMed — title, journal and
year all match the cited record. Two reference constructors exist because the JAMA "Rational
Clinical Examination" series and the Annals of Emergency Medicine "Evidence-Based EM / Rational
Clinical Examination abstract" series are different journals: use `rce()` for the former and
`ebem()` for the latter, and never relabel one as the other. Where no indexed source was
verified, the tree cites the textbooks alone rather than a plausible-looking citation. Shared
constructors are in `_helpers.ts` (`yn`, `val`, `commonHpi`, `IMMUNOCOMPROMISE`, `PREGNANCY`,
`rce`, textbook references). Schema in `lib/history-check/types.ts`, validator in
`lib/history-check/schema.ts`.

A tree has: `id`, `version`, `complaint`, `triggers` (words in a chief complaint that suggest
it), `setting`, `reviewStatus`/`reviewedBy`, `references` (required; PubMed ids when indexed),
`slots`, `differentials`, `output.durationSlot` and `output.hpiOrder`.

A slot has: `id`, `group` (informant | hpi | associated | red_flag | exposure), `kind`
(`yes_no` | `value`), `label`, `question` (must end in "?", must not read as an order), `terms`
(lowercase, what the validator looks for), optional `numeric` (stays unconfirmed), optional
`tier` (`core` default, `detailed` = academic only; red flags ignore tier), optional `teach`
(why it is asked; must not state a diagnosis).

A differential has `pointers` (positive slots that raise it) and `discriminators` (slots that
would separate it), and optionally `appliesWhen: "post_op"`. It orders the gap list and is
worded as "questions that would help separate X / Y". It is never shown as a diagnosis.

**To add a complaint**

1. Copy `content/history-trees/headache.v1.ts` to `<complaint>.v1.ts`; keep one symptom per
   slot; put every must-not-miss question in `red_flag`; give every tree at least one
   reference.
2. Add it to `content/history-trees/index.ts`.
3. `npm test -- lib/history-check` — the schema test validates every registered tree and prints
   the failing path. Common rejections: an uppercase term, a question without "?", a question
   starting with an instruction verb, a dose or drug frequency anywhere, `teach` text containing
   "this is" / "it is" / "confirms" / "rules out".
4. Add one or two eval cases for it in `lib/history-check/evals/cases.ts` (synthetic only) and
   run the eval script below.

To change a shipped tree, bump `version`; old versions stay in the index so stored runs render
with the version they were run against.

### Examination checklists — `content/examination/`

`general-physical.v1.ts` is the head-to-toe survey (preliminaries, vitals, anthropometry,
pallor / icterus / cyanosis / clubbing / koilonychia / lymphadenopathy / oedema, hydration, skin
and nails, head and mouth, neck, hands, trunk and limbs). Every item carries `how` (shown behind
the (i) on `/learn/examination/general_physical`), `significance` ("seen in …") and optionally
`normal`. Types in `lib/history-check/exam-types.ts`, validator in `exam-schema.ts` (same
dose / diagnosis rules), registry in `content/examination/index.ts`, test in
`__tests__/exam.test.ts`.

## Evals

`lib/history-check/evals/cases.ts` holds synthetic dictations with expected slot states,
each naming the tree it runs against (`treeId`, default `fever`), including adversarial ones (silence only, "no X, Y present", attendant-vs-patient contradiction,
two entries that disagree, a wrong-patient sentence, typed workspace input, post-op). No real
patient data, ever.

```bash
node --env-file=.env.local --import ./scripts/alias-register.mjs scripts/eval-history-check.ts \
  --model claude-haiku-4-5 --max-calls 12 [--only plain-english,attendant]
```

It prints per-slot pass/fail, validator downgrades, tokens and cost, and stops at the call cap.
Unit tests (`npm test`) never call the API.

## Rollback

- **Hide it:** unset `NEXT_PUBLIC_HISTORY_CHECK` and redeploy. Card, route, actions and
  `/learn` disappear; stored rows are untouched.
- **Remove it:** revert the commits on this branch. The only schema change is the additive
  table in `0078_history_checks.sql`; drop it with `drop table if exists public.history_checks;`
  if you want the rows gone. No existing table, column or policy was altered.
