# WardMate — infrastructure and setup

For a developer taking this over or joining. Written from what is actually configured, not
from what was planned — everything below is checked against the live project as of 2026-08-18.

---

## The one thing to do first

**This code has never been pushed to GitHub.** It exists as a local git repository on the
founder's laptop and is deployed straight from there with the Vercel CLI. There is no remote,
no PR review, no CI. Before anything else, get it onto GitHub (or wherever) and connect that
repo to Vercel for deploys — everything past this point assumes that has happened.

## Stack

| Layer | What | Notes |
|---|---|---|
| Framework | **Next.js** (App Router, React Server Components) | |
| Hosting | **Vercel** | Project name `wardmate`. Deployed via `vercel --prod` from the CLI today — see above. |
| Database | **Supabase** (Postgres) | Project ref `zrisashumxmiiwffhezc` → `https://zrisashumxmiiwffhezc.supabase.co`. Also provides auth and file storage. |
| AI | **Anthropic API** (`claude-opus-5`) | Structures spoken/typed notes into clinical values; reads photographed lab reports and the ward register. |
| Speech-to-text | Pluggable — **OpenAI**, **Sarvam** or **Deepgram** | Behind `lib/stt/`, selected by the `STT_PROVIDER` env var. Swappable without touching anything else; the point of that seam is comparing engines on Indian-accented medical speech. Deepgram runs `nova-3-medical` in `en-IN` with a per-patient keyterm list — see `docs/medical-dictation-keyterms.md`. |
| Outbound email | **Resend**, via Supabase's SMTP integration | Sends the sign-in codes. |
| Monitoring | **Sentry** (`@sentry/nextjs`) | Crash reports + 10%-sampled performance traces, browser and server. Dormant unless `NEXT_PUBLIC_SENTRY_DSN` is set. See "Sentry" below. |
| Styling | Tailwind, hand-rolled iOS-style components | No component library. |
| No ORM | Raw `@supabase/supabase-js` queries throughout | |

## Environment variables

Set in `.env.local` locally and in Vercel's project settings for production. Names only —
values are not reproduced here:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
SARVAM_API_KEY
DEEPGRAM_API_KEY
STT_PROVIDER
NEXT_PUBLIC_LIVE_DICTATION
NEXT_PUBLIC_SENTRY_DSN     # empty = Sentry off; a real DSN turns it on. Not a secret.
SENTRY_ORG                # build-time only, for source-map upload
SENTRY_PROJECT            # build-time only
SENTRY_AUTH_TOKEN         # build-time only, IS a secret — set in Vercel, not in the browser
```

To trial Deepgram Nova-3 Medical, set `DEEPGRAM_API_KEY` and `STT_PROVIDER=deepgram`. The key
is used only on the server (the API routes call `lib/stt`); it is never sent to the browser.

**Live case-history dictation** (`NEXT_PUBLIC_LIVE_DICTATION=1`) adds a "Dictate the whole
clerking" flow: the browser streams the microphone straight to Deepgram Nova-3 Medical and
each pause-delimited thought is sorted into its card as the resident speaks. It needs
`DEEPGRAM_API_KEY` set regardless of `STT_PROVIDER` (it mints a 30-second Deepgram token in
`/api/transcribe/live-token`; the long-lived key never reaches the browser). Every other
"Speak" button is unaffected and keeps using `STT_PROVIDER`. Leave the flag unset to hide the
feature.

To trial Sarvam Saaras, set `SARVAM_API_KEY` and `STT_PROVIDER=sarvam` locally and in Vercel.
Sarvam's synchronous endpoint returns one transcript for recordings up to 30 seconds, so use
short bedside notes while evaluating it; longer round recordings should stay on OpenAI until a
Sarvam batch/realtime flow is added.

The Supabase key is the **publishable** (anon) key, not the service role key — deliberately.
The app never uses a service-role key from application code; every read and write goes through
row-level security as the signed-in doctor. The one exception is described under "Database
functions" below, and it is scoped narrowly on purpose.

## Database

Everything is applied as a sequence of **hand-written, hand-run SQL patches** — there is no
migration tool. They live in `supabase/patches/`, are numbered, and each is idempotent (safe
to run twice). Nineteen have shipped:

```
0001  grants
0002  diagnosis field, IST-based day counting
0004  care templates (per-operation checklists)
0005  starter template library
0006  rebuild the current_patients view
0007  evidence (photo) storage
0008  task completion
0009  round register reading
0010  age and sex
0011  pre-op/conservative/workup management state
0012  job urgency (red/yellow/green)
0013  free-text procedure names
0014  whole-round voice dictation
0015  permanent delete (two-step, see below)
0016  entry accept/edit/delete
0017  per-ward uploaded document formats
0018  ward join codes
0019  discharge summary letterhead
0020  single-round-trip ward list function
```

**Applying patches is now automated** — see "Automating deploys" below. `npm run db:push`
applies every patch not yet recorded in the `public._patch_log` table, in filename order. The
hand-numbered convention stays; the pasting-into-the-SQL-Editor step is gone. New patches still
need to be idempotent and wrapped in `begin; ... commit;`.

### Row-level security is the actual security boundary

Every table has RLS policies keyed on ward membership. The application layer (Next.js
middleware, page-level checks) is a courtesy that avoids unnecessary round trips — it is
**not** what stops a doctor from seeing another ward's patients. That is enforced by Postgres,
on every query, regardless of what the frontend does or fails to do. Read `supabase/schema.sql`
before touching auth or ward-scoping logic; the comments there explain the model in more depth
than this document does.

### Database functions (`SECURITY INVOKER`)

One performance-motivated exception to "everything is a direct table query": `ward_screen()`
(patch 0020) returns the whole ward list — patients, badge counts, templates — in one round
trip instead of six. It is declared `SECURITY INVOKER`, meaning it runs as the calling doctor
and is bound by the same RLS policies as a normal query. **If a future function needs
`SECURITY DEFINER`, treat that as a real security decision requiring review, not a convenience
— a mis-scoped definer function is how one ward sees another ward's patients.**

### What's deliberately NOT stored

Patients have a name and a bed. No hospital ID, no phone number, no address. This is a product
decision as much as an engineering one — see `BRAND.md` — and it should not be casually
"fixed" by adding fields later without that context.

### Deletion is two-step by design

A patient can only be hard-deleted (`0015`) if already soft-removed from the ward first. That
is enforced at the RLS policy level, not just in the UI, specifically so that no single
mis-aimed action in the interface can destroy a clinical record outright.

## Auth

Supabase Auth, two methods live:

1. **Email OTP** — a 6-digit code, not a magic link. This is deliberate: the app is installed
   as a home-screen PWA, and a magic link opens in the system browser, which can leave the
   installed app still signed out. A typed code has no such failure mode. See the comment at
   the top of `middleware.ts` and `app/login/page.tsx`.
2. **Google OAuth** — added as a faster alternative for the many doctors already on Gmail. It
   still round-trips through a browser, so it inherits some of the same PWA risk; the OTP
   route was kept as the guaranteed fallback rather than replaced. Requires Google Cloud OAuth
   credentials (Client ID + secret) entered into Supabase Auth → Providers.

Outbound auth mail (OTP codes) is sent via **Resend**, configured as custom SMTP inside
Supabase Auth settings, sending from `wardmate.in`. Domain (SPF/DKIM) verification for that
domain was completed 2026-08-18.

### The middleware is a performance layer now, not just a gate

`middleware.ts` used to call Supabase on every single request to verify the session — this
was costing roughly 2 seconds per request in production (measured, not estimated) and was the
single largest source of latency in the app. It now reads the JWT expiry locally and only
calls Supabase when the token is genuinely close to expiring. This is safe only because the
real authorization check happens twice more downstream — every page calls `getUser()` itself,
and RLS enforces access regardless. **Do not remove either of those two downstream checks on
the assumption the middleware already covers it — it deliberately does not, for speed.**

## Domains & DNS

- **Production:** `https://wardmate.in`, registered via GoDaddy, DNS also hosted at GoDaddy.
- `www.wardmate.in` is a CNAME to Vercel; the apex is an A record to Vercel's edge IP.
- Fallback address `coreresident.vercel.app` still resolves and still works — same
  deployment, kept as a safety net during the domain transition. Worth deprecating explicitly
  once `wardmate.in` has been the primary address for a while.
- Resend's sending records (SPF, DKIM, the `send.` subdomain MX/TXT) are on the same GoDaddy
  DNS zone. **Do not delete or "clean up" the `send` subdomain records** — they look unfamiliar
  next to the app's own DNS but they are what makes auth email deliverable at all; removing
  them silently breaks every sign-in code.

## Offline support

The app is a installable PWA (`public/manifest.webmanifest`, `public/sw.js`) with real offline
behaviour, not just an icon:

- Pages are cached network-first via the service worker, including the RSC payloads Next.js
  fetches for client-side navigation (not just full page loads — this took a second pass to
  get right, see the comments in `public/sw.js` on why both request shapes had to be handled).
- A banner tells the user explicitly when they're viewing a cached, possibly-stale screen.
- Voice recordings made with no connectivity are queued in **IndexedDB** in the browser
  (`lib/outbox.ts`) and flushed automatically when connectivity returns. This exists because
  losing a recorded ward round to a dead network is the single worst failure mode the app has.
- The offline queue's IndexedDB name deliberately still contains the old `coreresident` string
  even after the rebrand — changing it would orphan any recordings already queued on a doctor's
  phone. Do not "fix" this for cosmetic consistency.

## AI usage patterns worth knowing before changing them

- Every AI-assisted write (voice transcription → structured value, photographed report →
  value, register photo → row) is designed to be **reviewed and explicitly accepted or edited
  by the doctor before it's treated as confirmed**. The system does not auto-commit anything
  a model produced without a human step in between. This is a hard product constraint, not an
  MVP shortcut — see `BRAND.md`'s "beliefs" section.
- Discharge summaries are built from structured data the doctor already confirmed, in a
  per-ward custom letterhead/template (`0019`, `0017`) — they are not freshly generated prose
  from a model at discharge time. Read `app/patients/[id]/discharge-section.tsx` (or wherever
  it currently lives) before assuming otherwise.

## Sentry

Error and performance monitoring, added 2026-09-09. The integration is committed but **inert
until `NEXT_PUBLIC_SENTRY_DSN` is set** — with no DSN, `Sentry.init` is a no-op and the app is
byte-for-byte what it was before.

Files: `instrumentation-client.ts` (browser), `sentry.server.config.ts` /
`sentry.edge.config.ts` (server + middleware), `instrumentation.ts` (wires those in),
`app/global-error.tsx` (root-level crash screen — the only error boundary above the app
chrome), `next.config.ts` (`withSentryConfig`), `middleware.ts` (allowlists `/monitoring`).

### Privacy — read before changing any Sentry config

WardMate is a clinical tool, so the config is deliberately conservative:

- `sendDefaultPii: false` everywhere — no IP address, no cookies, no request bodies, no
  end-user identity attached to a report.
- `lib/sentry-scrub.ts` runs in `beforeSend` on every runtime. It strips query strings,
  replaces patient UUIDs in URLs with `:id` (same collapse `app/page-view.tsx` does), drops
  `console` breadcrumbs, and removes request headers/cookies/body. A missed report is an
  acceptable price; a patient identifier in a third-party dashboard is not.
- **Session Replay is off** (`replaysSessionSampleRate: 0`). It screenshots the DOM, which on
  a ward screen is patient data. Do not turn it on without a real DPA/consent conversation.
- The one thing the scrubber cannot catch is a name passed straight into `throw new
  Error(...)`. Error messages must describe what failed, never who.

### Turning it on

1. Create a Sentry account → new project, platform **Next.js**. Free tier is fine to start.
2. Copy the **DSN** (Project Settings → Client Keys). Set `NEXT_PUBLIC_SENTRY_DSN` in
   `.env.local` and in Vercel (all environments).
3. For source maps: create an **auth token** (Settings → Auth Tokens, scope
   `project:releases`). Set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` in Vercel
   only. Without these the build still succeeds — stack traces are just minified.
4. Redeploy. Confirm by triggering a test error and seeing it land in Sentry.

## Automating deploys

Added 2026-09-10.

### One-time setup

```
npm run deploy:init
```

Guided. Logs into Vercel and links the folder if needed, **downloads the current production
env vars** into `env/production.env` (no retyping), asks for the one thing it can't discover
(the Supabase connection string), and baselines the SQL-patch tracker. Safe to re-run.

### Everyday

```
npm run ship
```

= apply new SQL patches → push `env/production.env` to Vercel → `vercel --prod`. Stops on the
first failure. Replaces the manual "paste patches, edit dashboard, run `vercel --prod`" dance.

Sub-commands if you want just one part: `npm run db:push`, `npm run env:sync` (both take
`-- --dry-run` and `-- --status`).

### How each part works

- **`scripts/db-push.mjs`** — keeps a `public._patch_log` table of which `supabase/patches/*.sql`
  files have run; applies the rest in filename order, each recorded only on success. Patches
  must stay idempotent and `begin; … commit;`-wrapped. Needs `SUPABASE_DB_URL` (direct
  connection, port 5432), stored in git-ignored `env/deploy.env`.
- **`scripts/env-sync.mjs`** — `env/production.env` is the source of truth; every line is
  pushed to Vercel (Production + Preview), unchanged ones skipped. `VERCEL_*` keys in the file
  (added by `vercel env pull`) are ignored. Locally it reads the project from
  `.vercel/project.json` and the token from your `vercel login` — no config.

### Automatic deploys on `git push` (optional)

```
npm run deploy:github
```

Prints the five GitHub secrets to add and copies the big one to your clipboard, then the
Action in `.github/workflows/deploy.yml` runs `test → db:push → env:sync → deploy` on every
push to `main`. **Don't also connect the repo in Vercel's dashboard** — the Action deploys, a
Vercel Git connection would double it. Use a *fresh* token from vercel.com/account/tokens for
the secret (the CLI login token expires).

## Known gaps / near-term work

- No CI, no automated tests, no staging environment. Every deploy today is a human running
  `vercel --prod` after eyeballing the change.
- No git remote (see top of document).
- SMS/phone-number sign-in was discussed and explicitly deferred — it requires DLT template
  registration with Indian telecom carriers before any SMS can be sent to Indian numbers at
  all, which is a multi-week compliance process, not a code change.
- The founder is non-technical and has been operating Supabase/Vercel/DNS dashboards directly
  via screen-share-style guidance. Expect some config drift from "what the code assumes" vs.
  "what's actually toggled in each dashboard" — worth an audit pass early.
