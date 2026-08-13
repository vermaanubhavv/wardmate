# CoreResident — what exists, for a design handoff

Paste this into Claude chat or Claude design when you want help with layout or new screens.
It describes what is already built and the rules the app is held to, so that anything designed
on top of it fits rather than fights it.

---

## What the app is

A phone-first web app (a PWA — installs to the home screen, no app store) for surgical ward
rounds in an Indian general surgery unit. The resident **speaks at the bedside** instead of
writing, and the app accumulates a record per patient across the admission and produces a
handover for the whole unit.

The user is a surgery resident on a round: one hand, one thumb, standing up, moving between
beds, often in a hurry. **Every screen is designed to be used standing at a bedside**, not
sitting at a desk.

## The rules everything obeys

These are not style preferences. They are why the app is trustworthy, and any new screen has
to keep them.

1. **The app never invents a clinical value.** It records only what was actually said,
   photographed, or typed. If the resident didn't say a temperature, there is no temperature —
   and the screen says "not recorded" rather than showing a blank or a plausible number.
2. **Every stored value keeps a link back to its source** — the exact sentence from the
   transcript, or the photo it was read off. That quote is shown under the value, in italics.
   A number on screen is never just the app's paraphrase.
3. **Absence is shown as absence.** Never a placeholder, never a guess. Where something is
   missing and matters, it is shown in amber as a gap.
4. **Anything derived from a date is computed fresh on every read, never stored** — post-op day,
   day of admission, and how overdue a job is. A stored answer would be wrong by morning.
5. **Dangerous values are surfaced for a one-tap check**, not buried: any number, drug, dose,
   route, frequency. These show amber until confirmed.
6. **Only the patient's name, age, sex and bed are stored.** No hospital numbers, no phone,
   no address. If the database leaked it would be close to useless.

## Visual language as it stands

- **Dark throughout.** Background near-black, cards a slightly lighter slate, thin borders.
- **Accent is a light sky blue**, used for primary buttons (dark text on blue) and links.
- **Amber** means "needs your attention but nothing is wrong" — unconfirmed values, gaps.
- **Red / yellow / green** are reserved exclusively for job urgency (see below).
- Type: system sans. Bed numbers and day counts are **monospace / tabular** so columns line up.
- Layout: single column, `max-width` about 28rem, centred, generous vertical padding.
- Primary actions are **fixed to the bottom of the screen** under the thumb, over a gradient
  fade so content scrolls underneath. Lists get bottom padding so nothing hides behind them.
- Touch targets are large — buttons are a full 16px of vertical padding, roughly 56px tall.

## Screens that exist

### 1. Ward list — `/` (the home screen)

The unit's patient list, ordered by bed, walking order. Header has the ward name, patient
count, and links to **To do** and **Ward round**. Bottom holds **Read round register** and
**Add patient**.

Each patient is a card:

```
SW-12   Sharma, 62/M                              ✏️
        POD 2 Lap chole · Cholelithiasis
        POST OP    2 to do    ● 1 to confirm
```

- **Bed leads the card** — on a round you are looking for a bed, not a name.
- Name carries age and sex inline.
- Second line: day count, operation, diagnosis — one clinical thought.
- Badges: management type, open jobs, unconfirmed values.
- The **pen** opens an edit dialog (name, bed, age, sex, operation, management).

### 2. Patient — `/patients/[id]`

Header: back to ward, position ("3 of 12"), **Next →** to the next bed. Name with pen, day
count, bed, operation, diagnosis, management badge.

Then, in order:
- **To do** — open jobs, each with a tick box, a colour dot, and the quote it came from.
  Completed jobs collapse into a "N done" fold.
- **To confirm** — amber cards for unconfirmed numbers and drugs, each with a Correct button.
- **Where things stand** — the current value of each thing the operation's checklist expects,
  in the checklist's order, with anything else recorded below it. Missing items say
  "not recorded" in amber.
- **Record** — the history, grouped into "sittings" (everything said within 30 minutes of
  arriving at the bed is one block). Photos appear inline; transcripts fold open.

Fixed at the bottom: **Tap to speak** (large, blue), **Photograph a lab report**, and a line
listing what still hasn't been covered for this operation.

### 3. Ward round / handover — `/handover`

Every active patient in one scroll, for reading off at shift change. Per patient: bed, name,
day, operation, diagnosis, management, then only what needs attention — open jobs, values to
confirm, checklist gaps. Patients with nothing outstanding say so in one line.

Fixed at the bottom: **Copy for WhatsApp**, which copies a plain-text version, because that is
where handover actually happens.

### 4. To do — `/todo`

Every outstanding job across the whole unit, grouped by urgency, most urgent first. Within a
group, ordered by bed so working down the list is still a walk. Each row: tick box, colour dot,
the job, the bed and name (tappable), and the quote.

### 5. Add patient — `/patients/new`

The one screen where typing is expected, because it happens once per admission. Bed, name,
age, sex, diagnosis (with suggestions from past patients), operation (free text with
suggestions), admission date, an "has been operated" toggle revealing date of surgery, and
management.

### 6. Round register — `/register/[id]`

Photograph the unit's paper round register; the app reads it and shows a **review screen**.
Nothing is written until the resident approves it, because one photo touches many patients.

### 7. Sign in — `/login`

Email, then an emailed code. No passwords.

## The urgency colours

The only place red/yellow/green appear. Jobs are graded from the resident's own words, and
tapping the dot cycles the colour by hand.

| Colour | Means | From words like |
|---|---|---|
| 🔴 Now | Within hours, or today | "right now", "before evening", "today" |
| 🟡 Soon | Today or tomorrow | "tomorrow", "in the morning" |
| 🟢 Has time | No hurry | "before discharge", "no hurry" |
| ⚪ Not graded | Nobody has decided yet | *no timeframe was said* |

**Ungraded is drawn as an empty dashed ring, and sorts ABOVE green.** This matters: a job with
no stated timeframe is not a job known to be safe. Colouring it green would be the app
claiming something the resident never said.

A yellow job **turns red by itself the next day** and says why — "due today", "2 days overdue".
Green never climbs, ungraded never climbs.

## Vocabulary

- **Ward** = the unit's patient list, not a physical ward. Patients are scattered, so bed
  numbers carry location: `SW-12`, `ICU-3`.
- **POD** = post-operative day, counted from the date of surgery. Patients not operated show
  `Day 4`, counted from admission. The label always says which.
- **Management** = `POST OP` (automatic, from the surgery date), or `PRE OP`, `CONSERVATIVE`,
  `WORKUP` (chosen).
- **Entry** = one press-and-speak or one photograph. **Observation** = one clinical value
  pulled out of an entry. **Plan** = a job; it appears in To do until ticked.
- **Template** = the checklist of what to mention for a given operation. It says what is
  *expected*, never what is *true*.

## What is NOT built yet

Useful to know when designing:

- **No discharge** — a patient can be added but never taken off the list from within the app.
- **No search or filter** on the ward list.
- **No multi-user sharing** — the database supports it, no interface exists.
- **No editing or deleting a recorded observation** once stored.
- **No notifications** of any kind.
- **No offline mode** — it needs a connection to save.
- **No printed or PDF output** — handover is copied as text.
- **No settings screen.**

## Stack

Next.js (App Router, server components) on Vercel · Supabase for database, sign-in and photo
storage, with row-level security so the database itself refuses anyone who isn't a member of
the ward · Anthropic API for pulling structure out of speech and reading lab photos · Tailwind
for styling · speech-to-text via a provider chosen per entry.
