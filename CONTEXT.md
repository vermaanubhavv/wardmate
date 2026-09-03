# WardMate — full context for a new agent

Paste this whole file into a fresh session (Codex or otherwise) before touching the code.
It is written to be read once, top to bottom, by someone who has never seen this repo.

---

## 1. What it is

A voice-driven ward-round app for surgical residents in India. A resident on rounds speaks
patient updates out loud — "bed 3, POD 2, drain 5 ml, discharge tomorrow" — or photographs the
paper ward register, and the app turns that into a structured per-patient record: a colour-coded
to-do list across the whole unit, a WhatsApp-ready handover, and a discharge summary in the
unit's own format. It works with no signal; recordings queue on the phone and send later.

Live at **https://wardmate.in**. One unit, one hospital, real patients. Not a prototype.

**The user is a practising general-surgery resident, not a programmer.** Explain in plain
language. Give exact taps and exact SQL to paste. Do not assume they can read a stack trace.

---

## 2. The rule that governs everything

**The app never invents a clinical value.** Not to be helpful, not to fill a gap, not to make a
document look complete. If the resident did not say a temperature, there is no temperature.

This is enforced in code, not just in prompts. In `lib/extract.ts`, every observation the model
returns must carry a `source_quote` that appears **verbatim** in the transcript; anything that
fails that check is discarded rather than stored. An invented value has nothing to quote, so it
cannot survive.

Corollaries that have repeatedly decided design arguments:

- **Absence is shown, not filled.** The discharge summary prints a blank line where nothing was
  recorded. Knowing what you have not been told is worth more than a complete-looking document.
- **Every value traces to its source.** One tap on the (i) shows the sentence or photo it came
  from. A number here is never only the app's word for it.
- **Display may tidy; storage may not.** Rewriting "post-op day four" as "POD 4" on screen is
  fine. Changing what is stored is not, unless the raw is kept alongside.
- **Correct the machine, never the doctor.** Speech-to-text mishearings are corrected
  automatically. Anything a human typed is left exactly as typed.

  **The patient's name is the one exception, and it is deliberate.** A leading honorific
  ("Mr", "Smt", "Shri" …) is stripped by `stripPatientHonorific()` on the way *in* as well as on
  the way out — see `addPatient` and `updatePatientIdentity` in `app/patients/actions.ts`. The
  reasoning: a name is an identifier here, not a clinical observation. Nothing is inferred and no
  meaning can change, whereas "Mr Sharma" and "Sharma" stored as two different strings is a real
  source of duplicate patients on a ward that types the name differently each admission. The
  function only ever removes a leading title and returns the original if that would leave nothing,
  so it cannot empty a name. Do not extend this to any clinical field.
- **It stores almost nothing identifying.** A name and a bed. No hospital number, no phone, no
  address. If this database leaked it would be close to useless.

Two rules were written, tested, and deliberately deleted for breaking this — both are documented
in the code as warnings not to re-add them:
- `"a febrile"` → `"afebrile"` — inverts the meaning (has fever → no fever).
- `"RT"` → `"Ryle's tube"` — ambiguous with radiotherapy.

---

## 3. Stack

- **Next.js 16.3** (App Router, React 19.2, Server Components + Server Actions), **Tailwind v4**
- **Supabase** — Postgres + Auth + Storage. Project ref `zrisashumxmiiwffhezc`
- **Anthropic API** — `claude-opus-5`, structuring speech/photos into observations
- **OpenAI** — `gpt-4o-transcribe` for speech-to-text (`STT_PROVIDER=openai`)
- **Sarvam** — `saaras:v3` for Indian-English speech-to-text (`STT_PROVIDER=sarvam`); its
  synchronous trial path accepts recordings up to 30 seconds
- **Deepgram** — `nova-3-medical` in `en-IN` (`STT_PROVIDER=deepgram`), given a per-patient
  keyterm list built from the patient's diagnoses / operation / drains / drugs — see
  `docs/medical-dictation-keyterms.md`
- **Vercel** — production deploys, project `wardmate` (directory still named `coreresident`)
- **GitHub** — `https://github.com/vermaanubhavv/wardmate` (private), branch `main`, ~74 commits

Server env vars (names only): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `SARVAM_API_KEY`, `DEEPGRAM_API_KEY`, `STT_PROVIDER`. **There is no service-role key, on
purpose.** Controlled writes use `SECURITY DEFINER` Postgres functions instead.

Auth: Google OAuth (primary) + 6-digit email OTP via Resend. Google callback must point at
Supabase's own URL (`https://zrisashumxmiiwffhezc.supabase.co/auth/v1/callback`), not the app's.

---

## 4. Security model — read this before touching data access

**Row-Level Security in Postgres is the actual boundary.** Middleware and app code are a
performance courtesy; they are not what keeps one unit's patients away from another's.

- `is_ward_member(ward_id)` is a `SECURITY DEFINER` helper every policy leans on.
- The `ward_screen()` and `home_screen()` RPCs are `SECURITY INVOKER` **deliberately** — they run
  as the calling doctor so every table stays filtered by the same policies. A `SECURITY DEFINER`
  version would hand every ward in the database to anyone who called it. Do not "optimise" this.
- The one intentional `SECURITY DEFINER` write path is `flag_glossary_term()`, whose body is
  fixed so a caller can add a correction pair and do nothing else.

---

## 5. Database

`supabase/schema.sql` is the base. Everything after it is a hand-numbered, idempotent patch in
`supabase/patches/NNNN_name.sql`, run by pasting into the Supabase SQL Editor. **There is no
migration tool.** This is the single biggest fragility in the project.

**Rule that bites every time:** `current_patients` is a view doing `select p.*`, frozen at
creation. Any new column on `patients` is invisible until the view is rebuilt. Every patch that
adds a patient column must `drop view if exists current_patients;` and recreate it. See 0006.

Also: several queries list patient columns explicitly rather than `select *`. A new column must
be added to `lib/ward.ts`, `app/patients/[id]/page.tsx`, and the `ward_screen()` RPC or it will
silently be missing.

Core tables: `profiles`, `wards`, `ward_members`, `patients`, `entries`, `observations`,
`care_templates`, `template_items`, `round_dictations`, `register_reads`, `ward_formats`,
`glossary_terms`.

### Patch status — VERIFY BEFORE ASSUMING

| Patch | What | Status |
|---|---|---|
| 0001–0020 | base through `ward_screen()` | applied |
| 0021 | `planned_surgery_date` | **unconfirmed — ask the user** |
| 0022 | `glossary_terms` + `flag_glossary_term()` | **unconfirmed — ask** |
| 0023 | `patients.location`, `profiles.designation/department`, `home_screen()` | **NOT run** |

The app degrades rather than crashes when a patch is missing — glossary returns empty, landing
counts read zero with a note naming the patch. Check before debugging a "bug".

---

## 6. How data flows

```
speak / photograph
  → STT (lib/stt, gpt-4o-transcribe, given MEDICAL_VOCABULARY_HINT)
  → lib/glossary.ts correctTranscript()      ← code list, then the unit's learned glossary
  → lib/extract.ts extractObservations()     ← claude-opus-5, VERBATIM-QUOTE CHECK IN CODE
  → observations rows, each with source_quote
  → lib/patient-state.ts derivePatientState()
  → the screens
```

Corrections are applied to the **transcript before extraction**, never as a "correct it silently"
prompt instruction. If the model corrected a term while structuring, its quote would no longer
appear in the transcript and the whole observation would be **discarded** — missing data, with
nothing said. This is subtle, it has already been got wrong once, and it is why
`getPromptGlossary()` exists but is deliberately unwired.

The raw hearing is kept in `entries.original_transcript` and shown behind the (i) as "Heard: …"
whenever it differs.

Three routes take speech: `app/api/entries/voice` (bedside), `app/api/round` (whole round, split
per bed), `app/api/patients/parse` (spoken new patient). The round route also accepts typed text
— **that branch is deliberately not corrected.**

---

## 7. Routes

- `/` — landing: name, designation, department, unit, counts by ward/ICU/emergency
- `/ward` — the ward list (this was `/` until recently; check link targets if something 404s)
- `/patients/[id]` — one patient: to-dos, unconfirmed, "where things stand" (collapsed), record
  by day (collapsible), discharge
- `/patients/new`, `/todo`, `/handover`, `/unit`, `/formats`, `/removed`, `/round/[id]`,
  `/register/[id]`, `/login`, `/auth/callback`

---

## 8. Performance — do not undo these

Both were measured, not guessed. From this server **every query costs ~220ms regardless of what
it asks**, so the *number of round trips* is the loading time.

1. **`middleware.ts`** reads JWT expiry locally out of the cookie and only calls
   `supabase.auth.getUser()` within 10 minutes of expiry. It used to call it on every request:
   ~2000ms per page. Safe because middleware was never the security boundary.
2. **`ward_screen()` / `home_screen()` RPCs** collapse six and four queries into one.
   `lib/ward-screen.ts` falls back to the old multi-query path if the RPC is missing and reports
   `fellBack`.

`lib/auth.ts` has `getUser()` (network, React-`cache`d) and `getDoctorName()` (local cookie read,
display only — explicitly not for authorisation).

---

## 9. Design language

iOS-native-adjacent, on a phone, one-handed, at 7am. Apple's own system colours except the
accent, which is the brand teal `#0f9e96`. Light theme only, deliberately: ward lighting varies
and an app that changes appearance between rooms is one more thing to think about.

Font: the **phone's system font**. A brand typeface (Sora) was tried and pulled — native won.

The mark (`app/mark.tsx`) is a **hand-measured vector reconstruction**. The designer's supplied
SVGs embed the mark as a raster image; only the lettering in them is real vector, so the ring
could not be animated from them. Geometry was measured off the rendered pixels. If a true vector
master ever arrives, its paths drop into that one file. Animations: ring spins + dots pulse
left-to-right while working; a ring pings out from the mic while recording; all disabled under
`prefers-reduced-motion`.

**Recent direction: less on screen.** The user pushed back hard on crowding. Reading is the
default; editing is a mode (pencil toggle per record). One chip per patient row, not three.
Reference sections fold; actionable ones do not. Do not add permanent chrome to serve a rare
action — that mistake has been made and reverted twice.

---

## 10. Open issues

1. **Permanent delete does not work.** Reported repeatedly. Confirmed so far: the
   `patients_delete` RLS policy EXISTS, RLS is on and not forced, FK cascades on
   `entries`/`observations` are correct. **Not yet checked: whether `DELETE` is actually
   GRANTed to the `authenticated` role** — a policy says *which* rows, a grant says *whether at
   all*, and `create policy` succeeding says nothing about `grant delete`. Next step:

   ```sql
   select count(*) from information_schema.role_table_grants
   where table_schema='public' and table_name='patients'
     and privilege_type='DELETE' and grantee='authenticated';
   ```
   If 0 → `grant delete on patients to authenticated;`. The app now surfaces the database's own
   error on `/removed?failed=…`; that wording is the fastest route to the answer.

2. **Patch 0023 not run** — landing counts read zero until it is.
3. **0021 / 0022 unconfirmed** — ask before assuming a feature is broken.
4. **`getPromptGlossary()` is unwired** — intentional, see §6. Delete it or wire it, don't
   half-do it.
5. **No tests, no CI.** Verification so far is `tsc --noEmit`, `eslint`, `next build`, plus
   node scripts for pure logic (correction rules, date maths) — that pattern has caught real
   bugs and is worth continuing.

---

## 11. Working agreements that have held up

- **Patches are numbered, idempotent, and pasted by hand.** Next is `0024`. Always
  `begin;`/`commit;`, `if not exists`, `drop policy if exists` before `create policy`.
- **Deploy with `npx vercel --prod --yes`.** It occasionally returns a transient error; retry
  once before investigating.
- **Git author must be a real identity.** Commits once carried a local placeholder
  (`anubhavverma@Anubhavs-MacBook-Air.local`) and Vercel silently BLOCKED every deploy for it.
  Fixed; do not let it regress.
- **Comments explain WHY, especially for anything counterintuitive.** This codebase is heavily
  commented on purpose — the non-obvious decisions above are recorded where they will be found.
  Match that.
- **Say what was not verified.** Screens behind a login could not be visually confirmed by the
  previous agent; it said so each time rather than implying otherwise. Keep doing that.
