# WardMate — brief for branding

Paste this into a branding or naming conversation. It describes what the product is, who it is
for, and the beliefs that shaped it. The name is settled; the section on it explains why.

---

## One line

A surgical ward round, recorded by speaking, that turns into the unit's paperwork by itself.

## The problem, concretely

An Indian surgical unit rounds on twenty to forty patients in the morning. One resident walks
with the consultant, holding a register, writing in it as they go. Everything after that —
the to-do list, the handover message, the investigation slips, the discharge summaries — is
built again from those scribbles, from memory, hours later, usually by the most junior person
present.

Three things go wrong, every day, in every unit:

- **The round is written twice.** Once in the register, once again into every document it
  feeds. Nobody has ever been paid to do the second one.
- **Jobs get lost.** "Remove the drain tomorrow" is said at 8am and remembered at 6pm, or not.
- **The handover is from memory.** What one shift knows and the next needs is reconstructed
  verbally, and the gaps are invisible until they matter.

## Who it is for

A surgical resident in India, on their feet, one hand free, on a phone. Not a desk. Not a
tablet on a trolley. The phone already in their pocket, in a corridor with poor signal, at
7am, before coffee, with a consultant three beds ahead of them.

Secondarily: the unit as a whole. Residents rotate every few months; the unit's patients, its
paperwork and its habits do not. The product belongs to the unit, not the doctor.

## What it does

- **Speak, and it records.** At the bedside, or as a run of beds — "bed 1 discharge today,
  bed 2 send fresh investigations" — and the app sorts out which patient is which.
- **Photograph the ward register**, and it reads the page.
- **Jobs become a checklist**, coloured by how soon they are due, across the whole unit. A job
  said as "tomorrow" turns red by itself the next morning.
- **The handover writes itself**, ready to paste into the unit's WhatsApp group.
- **The discharge summary comes out in the unit's own format**, with what is missing left
  visibly blank.
- **It works with no signal.** Recordings wait on the phone and send themselves later.

## The beliefs — this is the brand

These are not features. They are the argument the product makes, and any brand built on top of
it has to be able to make the same argument.

**It never invents a clinical value.** Not once, not helpfully, not to fill a gap. If the
resident did not say a temperature, there is no temperature. This is enforced twice over: the
model is told, and then the app checks that every value it produced can be quoted, word for
word, from what was actually said. Anything that cannot be is thrown away.

**Every value can be traced to its source.** One tap shows the sentence it came from or the
photograph it was read off. A number in this app is never only the app's word for it.

**Absence is shown, never filled.** A discharge summary prints a blank line where nothing was
recorded, rather than quietly omitting the field. Knowing what you have not been told is worth
more than a document that looks complete.

**It stores almost nothing about the patient.** A name, age, sex and bed, and — only if the unit
chooses to — the hospital's own UHID/IP and MRD numbers. No insurance number, no phone, no
address. If this database leaked it would be close to useless.

**The dangerous actions ask first, and say what they will do.** Not "are you sure?" but
"their six recordings and everything taken from them will be destroyed".

The shape of all five: **an app that is honest about what it does not know.** In a field full
of software that produces confident, plausible, wrong output, this one's selling point is that
it would rather show you a blank.

## Tone of voice

Plain, exact, unhurried. Written the way a good senior explains something: no adjectives doing
work that facts should do, no exclamation, no cheerfulness. Every message in the product tells
you what happened and what to do next — "No signal — saved on this phone. It will be sent when
you are back online."

Avoid: revolutionise, seamless, empower, AI-powered, smart. The product does not need to claim
intelligence; it needs to be trusted with a drug dose.

## How it looks today

Paste this section into a design tool along with the rest of the brief; it is what the shipped
app looks like, so new screens fit it rather than fight it.

**Base.** Deliberately close to iOS, because it sits on the same phone as Settings and Health:
the grouped grey background (`#f2f2f7`), content on white cards, hairline separators
(`#c6c6c8`), the system font and Apple's type scale (caption to large title). One fixed light
theme — ward lighting varies too much for a phone that changes appearance between rooms.

**The mark.** A teal ring, open at the lower right like a speech bubble, with three dots inside
— someone talking. `public/mark.png` is the designer's own artwork; the app icon and the small
"wardmate" lockup at the top of the ward list use it. A redrawn vector of it turns while the app
is busy.

**Colour — each one has one job.**

| Colour | Value | Its only job |
| --- | --- | --- |
| Teal | `#0b7f79` (mark: `#0f9e96`) | What you press: buttons, links, the mic, the selected tab |
| Orange | `#c2410c` on `#ffedd5` | "Check this": an unconfirmed number, drug or dose; a value still not recorded is the same orange as an outline, never filled |
| Red / yellow / green | red-500, amber-500, emerald-500 | How soon a job is due — Now, Soon, Has time — and nothing else |
| Red | `#ef4444` | The mic is live |
| Grey | `#636366` | Everything secondary: dates, labels, "nothing outstanding" |

A screen with nothing to do should look calm and nearly empty; colour appears only where
something needs the resident.

**Principles the screens follow.**

1. Quiet by default, loud by exception.
2. One fact, one place — each value, count and drug appears once per screen.
3. Numbers look clinical: the clinician's formatting, units and the report's own H/L flags,
   never raw machine text.
4. The check is the easy path: the safe action is the biggest button; shortcuts sit one step
   away ("Confirm all" asks "checked the report?").
5. Colour has one job each (above).

**The screens that exist.** The ward list (bed-first rows, a unit switcher in the title, To do
/ To check / Handover in one row). A patient, in four tabs — Today, History, Tests, Discharge —
under one clinical header (bed, name, day · operation · diagnosis) and three vitals (BP, PR,
SpO₂). To check (each value with the photo it was read off). To do (jobs under each patient,
graded Now / Soon / Has time). The handover (Watch tonight / Jobs open / Nothing outstanding,
and the same as WhatsApp text). One recording sheet for a single bed and for the whole round.
The round review, the clerking and progress note, the discharge summary in the unit's format,
search, unit settings, and the Learn shelf. It works offline and says so when what is shown was
saved earlier.

## The name

**WardMate**, chosen 2026-08-17.

What it does well: it names the WORK rather than the user, so it does not age out when
consultants, interns and nurses end up using it — which was the flaw in the working title it
replaced. "Ward" is the unit of everything here: the ward list, the ward round, the ward's own
paperwork. "Mate" sets the posture — something alongside the resident on the round, not a
system they report into.

It also passes the tests that matter: two syllables, said across a noisy ward without
spelling, typed by a tired thumb, and it survives "did you put it on WardMate?", which is how
it will actually be used.

Worth knowing about, rather than discovered later:

- "Mate" reads as friendly and British-Australian. In Indian English it is understood but
  less idiomatic, and it is informal for something that carries drug doses. Whether that
  warmth is an asset or a wrong note is a real branding decision, and the identity should
  settle it deliberately.
- There are unrelated products using "Ward" and using "Mate" separately. The pairing is the
  distinctive part; a trademark search in India is worth doing before anything is printed.
- The company name does not have to be this. Keeping them separate leaves room for a second
  product without renaming the first.

## Practical facts for whoever builds the identity

- Lives at wardmate.in, installed to the phone's home screen, and as an iPhone app that wraps
  the same site (docs/ios-app.md) — so it needs an **app icon** that reads at 60px, not just a
  logo.
- Built first for **general surgery in India**; other departments run on their own specialty
  packs (docs/specialty-packs.md). Design for Indian wards, honestly, rather than for a global
  product that does not exist yet.
