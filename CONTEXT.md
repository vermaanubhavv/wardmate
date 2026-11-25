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
- **It stores almost nothing identifying.** Name, age, sex, bed, and the optional UHID/IP and
  MRD numbers (patch 0024). No phone, no address. Tests, fixtures, logs and prompts carry
  synthetic data only.

Two rules were written, tested, and deliberately deleted for breaking this — both are documented
in the code as warnings not to re-add them:
- `"a febrile"` → `"afebrile"` — inverts the meaning (has fever → no fever).
- `"RT"` → `"Ryle's tube"` — ambiguous with radiotherapy.

---

## 3. Stack

- **Next.js 16.3** (App Router, React 19.2, Server Components + Server Actions), **Tailwind v4**
- **Supabase** — Postgres + Auth + Storage. Project ref `zrisashumxmiiwffhezc`
- **Anthropic API** — `claude-sonnet-5-5` (`AI_MODEL`) for structuring speech/photos into
  observations, `claude-haiku-5-5` (`FAST_MODEL`) for the live-dictation router and proofreads.
  Both live in `lib/model.ts`. **Sonnet is the ceiling**: `lib/__tests__/model.test.ts` fails if
  an Opus-class model id appears anywhere in the source. Read that file's comment before
  changing models
- **Deepgram** — the only speech-to-text engine: `nova-3-medical` in `en-IN`, given a per-patient
  keyterm list built from the patient's diagnoses / operation / drains / drugs — see
  `docs/medical-dictation-keyterms.md`
- **Vercel** — production deploys, project `wardmate` (directory still named `coreresident`)
- **GitHub** — `https://github.com/vermaanubhavv/wardmate` (private), branch `main`

Env vars: see `INFRA.md` and `env/*.example`. **No page or user request uses the service-role
key.** User-initiated writes go through RLS, or through `SECURITY DEFINER` Postgres functions
where a controlled write is needed. The key exists only for background jobs
(`lib/supabase/admin.ts`: the push and feedback-email crons, the unsubscribe link). Do not reach
for it anywhere else.

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

`supabase/schema.sql` is the base. Everything after it is a hand-numbered, idempotent,
`begin; … commit;`-wrapped patch in `supabase/patches/NNNN_name.sql`.

**Patches apply themselves on merge.** `.github/workflows/deploy.yml` runs `npm test` and then
`npm run db:push` on every push to `main`. `db:push` applies every file not yet in
`public._patch_log`, in filename order. It also fails the run if a public table lacks RLS or a
view lacks `security_invoker`. Nobody pastes SQL any more. To confirm a patch landed, read the
"Apply database patches" step of that run.

**Numbering:** take the next number after the highest file on the latest `main`, not on your
branch. Numbers have collided before: there are two `0111_*` files, and the offline-dictation
work had to be renumbered from 0112 to 0118. Renumber on merge if `main` has moved past you.

**Rule that bites every time:** `current_patients` is a view doing `select p.*`, frozen at
creation. Any new column on `patients` is invisible until the view is rebuilt. Every patch that
adds a patient column must `drop view if exists current_patients;` and recreate it. See 0006.

Also: several queries list patient columns explicitly rather than `select *`. A new column must
be added to `lib/ward.ts`, `app/patients/[id]/page.tsx`, and the `ward_screen()` RPC or it will
silently be missing.

Core tables: `profiles`, `wards`, `ward_members`, `patients`, `entries`, `observations`,
`care_templates`, `template_items`, `round_dictations`, `register_reads`, `ward_formats`,
`glossary_terms`.

A route that reads a column from a newer patch usually falls back when the column is missing
(see `processed_at` in `app/patients/[id]/page.tsx`). Keep doing that: Vercel and the patch
step run in parallel, so new code can be live about 30s before its patch is.

---

## 6. How data flows

```
speak / photograph
  → STT (lib/stt, Deepgram nova-3-medical, given medical keyterms)
  → lib/glossary.ts correctTranscript()      ← code list, then the unit's learned glossary
  → lib/extract.ts extractObservations()     ← claude-opus-5, VERBATIM-QUOTE CHECK IN CODE
  → observations rows, each with source_quote
  → lib/patient-state.ts derivePatientState()
  → the screens
```

Corrections are applied to the **transcript before extraction**, never as a "correct it silently"
prompt instruction. If the model corrected a term while structuring, its quote would no longer
appear in the transcript and the whole observation would be **discarded** — missing data, with
nothing said. This is subtle, and it has already been got wrong once. A prompt-side glossary
(`getPromptGlossary()`) was written for that approach and later deleted. Do not bring it back.

The raw hearing is kept in `entries.original_transcript` and shown behind the (i) as "Heard: …"
whenever it differs.

The speech routes: `app/api/entries/voice` (bedside), `app/api/round` (whole round, split per
bed), `app/api/patients/parse` (spoken new patient), `app/api/entries/case-history`, and the
two offline catch-up routes, `app/api/entries/late-dictation` and
`app/api/patients/new-by-voice`. The last two take a take recorded with no signal and file it
at the time it was said. The round route also accepts typed text
— **that branch is deliberately not corrected.**

---

## 7. Routes

- `/` — public landing; `/home` — signed-in landing (name, unit, counts)
- `/ward` — the ward list
- `/patients/[id]` — one patient (header, vitals, jobs, to check, record by day, labs,
  scoring, discharge). Sub-routes: `note`, `discharge`, `case-history`, `history-check`,
  `prepare-discharge`
- `/patients/new`, `/todo`, `/handover` ("Update" in the UI), `/confirm` (real dictation
  conflicts only)
- `/unit` (settings, invite, push toggle), `/unit/discharged`, `/unit/trash`,
  `/unit/access-log`; `/join?code=…` (invite link)
- `/learn` (examination, fluids, history), `/protocols`, `/formats`, `/round/[id]`,
  `/register/[id]`
- `/admin/*` — internal console, see `docs/admin-console.md`
- `/login`, `/auth/callback`, `/onboarding`, `/terms`, `/waitlist`, `/feedback`

---

## 8. Performance — do not undo these

Both were measured, not guessed. From this server **every query costs ~220ms regardless of what
it asks**, so the *number of round trips* is the loading time.

1. **`proxy.ts`** reads JWT expiry locally out of the cookie and only calls
   `supabase.auth.getUser()` within 10 minutes of expiry. It used to call it on every request:
   ~2000ms per page. Safe because middleware was never the security boundary.
2. **`ward_screen()` RPC** collapses six queries into one. `lib/ward-screen.ts` falls back to
   the old multi-query path if the RPC is missing.

`lib/auth.ts` has `getUser()` (network, React-`cache`d) and `getDoctorName()` (local cookie read,
display only — explicitly not for authorisation).

---

## 9. Design language

iOS-native-adjacent, on a phone, one-handed, at 7am. Apple's own system colours except the
accent, which is the brand teal (`#0b7f79` for what you press, `#0f9e96` in the mark; the colour roles are in `BRAND.md`). Light theme only, deliberately: ward lighting varies
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

**Newer direction (as of the visual-refresh work, §12): the flatness went too far.** Interns
called the app boring — nothing helped a resident tell "fine" from "needs attention" at a
glance. The fix was additive, not a re-theme: `lucide-react` for icons (previously zero icon
library; brand-specific marks like the wordmark/mic stay in `app/icons.tsx`), plus semantic
colour tokens in `app/globals.css` — `--critical-bg`/`--critical-fg`/`--critical-dot`,
`--warn-bg`/`--warn-fg`/`--warn-dot`, `--good-bg`/`--good-fg`/`--good-dot` (Tailwind utilities:
`bg-critical-bg`, `text-warn-fg`, etc.) — so a new screen reaches for a token instead of
re-typing a raw Tailwind shade. Same single-fixed-light-theme, iOS-chrome philosophy as above;
this is about purposeful colour/icons on top of it, not a rewrite. `app/ward/page.tsx` is the
reference implementation — its `Badge` component is the pattern to copy.

---

## 10. Open issues

Nothing is open in `CONTEXT.md` itself. Track work in GitHub issues and PRs. The old list here
(permanent delete, patches 0021–0023, the unwired glossary, "no tests") is all resolved.
Deletion was fixed by patches 0015/0025, the glossary function was removed, and there is now a
Vitest suite of about 1,400 tests that runs on every merge.

Known, deliberately parked: the onboarding form's link to the clinician data agreement
(`app/onboarding/professional-form.tsx`) waits on legal review of the draft.

---

## 11. Working agreements that have held up

- **Patches are numbered and idempotent; CI applies them** (§5). Always `begin;`/`commit;`,
  `if not exists`, `drop policy if exists` before `create policy`.
- **Merging to `main` is the deploy.** Vercel's Git integration builds production, and
  `deploy.yml` runs tests and patches. Open a PR, wait for the **Vercel** status check to
  report success (`mcp__github__pull_request_read`, `method: "get_status"`), then merge. Do not
  merge on a pending check.
- **Tests are the floor.** `npm test` before every push. Write a test for any new pure function
  in `lib/`, in the existing `lib/**/__tests__/` pattern. `npm run lint` should show 0 errors.
  `tsc --noEmit` needs `npx next typegen` first, or `LayoutProps` reads as missing.
- **Git author must be a real identity.** Commits once carried a local placeholder
  (`anubhavverma@Anubhavs-MacBook-Air.local`) and Vercel silently BLOCKED every deploy for it.
  Fixed; do not let it regress.
- **Comments explain WHY, especially for anything counterintuitive.** This codebase is heavily
  commented on purpose — the non-obvious decisions above are recorded where they will be found.
  Match that.
- **Say what was not verified.** Screens behind a login could not be visually confirmed by the
  previous agent; it said so each time rather than implying otherwise. Keep doing that.

---

## 12. Visual refresh — where it stands

Rolled out screen by screen, a mockup approved before code on each large screen:

- **Phase 1–2** (PRs #15–#17): ward page, login, front door, onboarding, new patient.
- **Phase 3 — done** (the 2026-10-18 UI/UX audit, PRs #156–#167): the patient screen (#160:
  one clinical header, three vitals, every drug once, outstanding-only pills), ward list
  (#158), to check (#159), to do and handover (#161), the recording sheet (#163), unit
  settings (#167), and colour roles brought up to the shipped app (#164, see `BRAND.md`).
- **Phase 4 — started.** The discharge workspace opens on the summary (2026-11-17): what it
  will say, with "N things need you" pinned on top, every ready section one line below as it
  will print, Finalise always in the bar; a section opens on tap and finishing it goes to the
  next that needs you. Mockup approved as direction A. Still to do: `prepare-discharge`, `formats`,
  `protocols`, `round/[id]`, `register/[id]`, `learn/*`, and the admin panel (lowest priority;
  internal tooling). Same process: read the screen, mock it up, get approval, then build. Reuse
  the semantic tokens in `app/globals.css` and the `lucide-react` conventions. Check an icon's
  export name exists before importing it (`ls node_modules/lucide-react/dist/esm/icons | grep …`).

**Standing limitation of a cloud session:** it has no Supabase credentials, and the proxy
blocks the Vercel preview URL. Verification is build, lint, tests and the Vercel check. Say
that plainly; the user still checks screens against real ward data themselves.

Deferred by the user to its own session: **new specialty packs and scoring pathways** (see
`docs/specialty-packs.md`, `docs/scoring-engine.md`).

**Colour tokens reconciled against BRAND.md (2026-11-25).** BRAND.md's colour table is the
authority; `app/globals.css` now says which job each token has. `--accent`, `--muted`,
`--recording`, the `--warn-*` pair and the three `*-dot` urgency colours already agreed with it
value for value. What changed: green outside job urgency is gone from the app (PAC "Fit", the
finalised tick, the investigation chip, "saved"/"held" lines are teal or grey — the same call
the audit made in #164), the live-dictation pulse uses `--recording`, and the Learn fluids
pages use the `warn` tokens instead of raw orange shades. Two things left as they are, on
purpose: the admin console keeps its own category chips (green, blue, violet) because it is
not a ward screen, and `--critical-bg`/`--critical-fg` (red tint for a dangerous value, a
failed read, a destructive action) stay in use, and BRAND.md's table now has a "Red tint" row
naming that job (danger, never decoration).
