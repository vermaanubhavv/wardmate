# Ward shorthand on display

Findings and jobs are shown in the unit's ward shorthand ("RUQ tenderness", "Send CBC tomorrow AM",
"VA RE 6/9" on an eye ward). Display only: `value_text` and `source_quote` never change. No model
call — `lib/shorthand.ts`, rules only.

## Where the rules come from

- `HAND_RULES` in `lib/shorthand.ts` — patterns a fixed phrase cannot say (abdominal regions, the
  ways a ward says "bowel sounds present", drug timings). Every department.
- `lib/shorthand-table.ts` — generated from the dictation lexicon (`lib/transcription/lexicon`) by
  `lib/shorthand-derive.ts`: core pairs (untagged entries) plus one table per specialty pack. A pair
  is taken only when the abbreviation's letters are the initials of the phrase's words, so synonyms
  and opposites never become rules. An abbreviation that would mean two things on one ward
  (AF = fibrillation / flutter, PR = pulse rate / partial response, POD = post-operative day /
  pouch of Douglas) is dropped there and the words show as said.
- A word that gives an abbreviation two letters ("intraocular" → the IO of IOP, "transurethral" →
  the TU of TURP) counts only if it is in the hand-checked `COMPOUNDS` list in
  `lib/shorthand-derive.ts`. Withheld by hand: HR, GA, AL, IUD (device or death).
- Department pairs the lexicon lacked live in `lib/transcription/lexicon/ward-shorthand.ts` — real
  lexicon entries, so speech keyterms and display are one source.

To add a pair: add it to the lexicon, then `npx vitest run shorthand-table -u`.
`lib/__tests__/shorthand.test.ts` runs one test per rule and a table-wide guard (no rule in any
department adds a number, side, site or negation, or swaps a finding).

## Screens that use it

| Screen | Where |
| --- | --- |
| Handover (screen and WhatsApp text) | `app/handover/page.tsx`, `lib/handover.ts` — diagnosis, done today, jobs |
| Ward list | `app/ward/page.tsx` — diagnosis line |
| To do | `app/todo/todo-lists.tsx`, `lib/ward-todo-preview.ts` |
| Patient page | jobs, SOAP rows, objective summary, case-history card (`app/patients/[id]/page.tsx`) |
| Case-history read-back | `case-history-card.tsx` (patient page and the case-history workspace) |
| Progress-note print sheet | `app/patients/[id]/note/note-line.tsx` (SOAP, overlay and ESIC layouts) |

## Deliberately not

- Discharge summary and every patient-facing print — full words.
- Case-history print (`case-history/print`) and the copied progress-note text — the record as dictated.
- Stored values, source quotes, the extractor and anything sent to a model.

## Learning loop

An edit into a shorter form on the patient page (`updateObservation`) is read by
`shorthandPair()`; a pair with no number and no negation change is recorded through
`flag_shorthand_suggestion` (`supabase/patches/0109_shorthand_suggestions.sql`). `/admin/shorthand`
lists them to approve or reject. Approving applies nothing: the approved pair goes into
`ward-shorthand.ts` in the next change, where the guard tests run on it.
