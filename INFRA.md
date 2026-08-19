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
| Speech-to-text | Pluggable — currently **OpenAI** | Behind `lib/stt/`, selected by the `STT_PROVIDER` env var. Swappable without touching anything else; the point of that seam is comparing engines on Indian-accented medical speech. |
| Outbound email | **Resend**, via Supabase's SMTP integration | Sends the sign-in codes. |
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
STT_PROVIDER
```

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

**Whoever takes this over should get a real migration tool running** (Supabase CLI migrations,
or something like it) before writing patch 0021. The manual-numbering approach worked for one
person iterating fast; it will not survive two people working at once.

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
