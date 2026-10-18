# IV Fluid and Electrolyte Correction

A reference shelf on the Learn page (`/learn`, behind `NEXT_PUBLIC_HISTORY_CHECK=on` like the
rest of Learn): topics digested from **Pandya, *Practical Guidelines on Fluid Therapy*, 3rd
edition (2024)**. Each topic is a page of the book's own tables, formulas, protocols and
cautions, every number quoted with the PDF page it came from. Nothing on these pages is
written to a patient.

## What it is not

The history trees and examination checklists refuse treatment wording. These topics do the
opposite — they carry doses, rates and targets — so the rules differ:

- The page says once at the top that every number is the book's and that the page is reading
  material, not a prescription.
- Every topic ships `pending_clinician_review`; the shelf and the page show the chip. Marking a
  topic `reviewed` requires a named reviewer and is pinned by the test in
  `lib/fluids/__tests__/fluids.test.ts` — adding an id there is a claim that a clinician read it.
- A calculator (the "Work it" box under a formula) is arithmetic on what the resident typed,
  shown amber, never stored. Only formulas whose arithmetic the book actually prints are wired
  (`lib/fluids/calc.ts`).

## The source is a preview edition — read this before adding content

The PDF the shelf was built from (402 pages, two book pages per PDF page) is the publisher's
free preview. **36 of 57 chapters stop after their opening page** ("Want to read more?") and
carry only the chapter table of contents, one to two pages of introduction, and the reference
list. The chapters present in full are:

| Chapter | PDF pages |
|---|---|
| 1 Basic Physiology | 6–13 |
| 2 Overview of Intravenous Fluids | 14–22 |
| 8 Resuscitation Fluids | 42–68 |
| 9 Fluid Therapy in the Elderly | 69–72 |
| 15–19 Fluid assessment and haemodynamic monitoring | 93–147 |
| 37 Hepatorenal Syndrome | 205–217 |
| 45 TURP Syndrome | 252–258 |
| 46 Burns | 259–273 |
| 47 Urinary Diversion | 274–279 |
| 51–54 Obstetrics (see the topic's own coverage note) | 292–325 |
| 55–57 Parenteral Nutrition | 326–402 |

Everything on **phosphate and magnesium correction** (chapters 26–29), **acid–base** (30–33), the
**parenteral additive dosing** chapters (10–14), maintenance and colloids (5–7), the medical disorders other than HRS (34–36, 38–41), the perioperative chapters (42–44)
and paediatrics (48–50) is opening-only. Those topics carry what the openings say — definitions,
normal ranges, severity grades, compositions — and end with a **"Not in this edition"** section
listing the printed headings whose text is absent. They do not fill the gap from memory: the
product rule is that a clinical value is never invented, and a correction protocol attributed to
a book that did not supply it would be exactly that.

To complete the shelf, source the full edition (print or Kindle, fluidtherapy.org) and extend
the topics from it, or add a second reference (a published guideline) and say so in the topic's
`references` and `source`.

## Chapters added from the full edition

Chapters 20–25 (hyponatraemia, hypernatraemia, hypokalaemia, hyperkalaemia, hypocalcaemia,
hypercalcaemia) are built from a verbatim transcription of the full edition's printed pages,
made from the Kindle book. These topics set `source.pageKind: "book"`, so their pages and quotes
cite **printed book pages**, not PDF pages; the page labels say which.

How the transcription was checked before use:

- Every section in each chapter's own contents list is present; only reference lists are skipped.
- On the opening pages that also exist in the preview PDF, 94% of six-word runs match word for
  word, and the misses are heading formatting.
- One two-column interleave (book p. 288, the calcium normal range) and two OCR slips ("mEą")
  were found and repaired against the preview PDF.
- Every quote in these topics was then checked programmatically against the transcription on
  its cited book page.

An interleave on a page the preview does not carry cannot be caught by a script, so the
clinician sign-off for these topics should compare each dosing table against the book page.
When transcribing further chapters, tell the transcriber the book is two-column and to finish
the left column before the right.

## Data model

`lib/fluids/types.ts`. A `FluidTopic` has `group` (fluids · electrolytes · acid_base · settings),
`source` (chapters + PDF pages), `references`, review fields, and `sections` of `blocks`:

| Block | Use |
|---|---|
| `points` | bullets |
| `steps` | an ordered protocol |
| `table` | rectangular; the validator rejects a ragged row |
| `formula` | expression + named variables; optional `calc` wires a calculator |
| `caution` | amber box — the book's never/avoid statements, and the "Not in this edition" list |
| `quote` | a verbatim line under 25 words with its PDF page |

`lib/fluids/schema.ts` validates on first use (`lib/fluids/topics.ts`); a bad topic throws at
load rather than rendering wrong. Content lives in `content/fluids/*.v1.ts`, one export per
file, listed in `content/fluids/index.ts`. Constructors in `content/fluids/_helpers.ts`.

## Adding a topic

1. Write `content/fluids/<name>.v1.ts` from the source text only. Every section with a number
   gets a `quote` with its PDF page. Truncated source → end with `not_in_edition`.
2. Add the export to `content/fluids/index.ts`.
3. `npx vitest run lib/fluids` — validates every topic and works the calculators' examples.
4. It appears on `/learn` under its group, `pending_clinician_review`.
