# Indian clinical vocabulary → Deepgram Nova-3 Medical keyterms

Real-time dictation recognition for an Indian surgical ward, without shipping one enormous
dictionary to Deepgram on every recording.

```
MASTER WARDMATE LEXICON
  → patient / context selector      (lib/transcription/selectMedicalKeyterms.ts)
  → ~20–50 high-value terms
  → Nova-3 Medical keyterm list     (repeated ?keyterm= parameters)
  → transcription
```

---

## 1. Why keyterms exist

Deepgram **Nova-3 Medical** is trained on clinical speech, so it already spells anatomy,
procedures and generic drug names correctly. What it still gets wrong on an Indian ward round:

1. Indian hospital terminology — `PAC`, `P/A`, `attender`, `casualty`
2. Indian surgical ward terminology — `per abdomen`, `suture line healthy`, `soakage`
3. Local abbreviations — `KFT`, `GRBS`, `CBNAAT`, `POD`, `NBM`
4. Uncommon diagnoses — `appendicular lump`, `walled-off necrosis`, `perforation peritonitis`
5. Operations / procedures — `Lichtenstein hernioplasty`, `eTEP`, `PTBD`
6. Drains / devices — `Ryle's tube`, `Romovac`, `pigtail catheter`
7. Investigation terminology — `CECT abdomen`, `MRCP`, `HIDA scan`
8. Indian medication brand names — `Monocef`, `Piptaz`, `Emeset`, `Metrogyl`
9. Scoring systems / classifications — `Ranson's criteria`, `MCTSI`, `Wagner classification`
10. Patient-specific terminology — this patient's actual diagnosis, operation, drains, drugs

Nova-3 boosts a **keyterm list** — one phrase per repeated `keyterm` parameter, chosen when the
session starts. Keyterms carry **no weights**. We spend that budget on the unusual /
Indian / specialty-specific language above, never on ordinary clinical English the model
already knows.

Model / language are fixed:

```
model=nova-3-medical
language=en-IN
```

Hinglish history dictation is **not** added to this model — see STEP 15 of the brief. The code
is shaped so a future Hinglish mode can use a different model; nothing here changes when it
lands.

---

## 2. Master lexicon architecture

`lib/transcription/lexicon/` — one file per category, merged into `MASTER_LEXICON`:

| File | Contents |
|---|---|
| `core.ts` | the ~8 universal ward phrases sent on nearly every dictation |
| `india.ts` | Indian documentation language + daily ward-round phrases |
| `devices.ts` | drains, tubes, lines, stomas |
| `investigations.ts` | blood tests, panels, markers, microbiology |
| `radiology.ts` | imaging studies |
| `diagnoses.ts` | conditions, grouped by system (biliary, pancreas, appendix, obstruction, hernia, colorectal, diabetic foot, vascular, trauma) |
| `procedures.ts` | operations and bedside procedures |
| `surgery.ts` | high-value operative anatomy |
| `medications.ts` | generic drugs + Indian brands + IV fluids + critical-care vocabulary |
| `scores.ts` | scoring systems and classifications |

Each entry is a `MedicalLexiconEntry`:

```ts
{
  term: "Ranson's criteria",       // the exact string sent to Deepgram
  aliases: ["Ranson score", "Ransons criteria"],  // matched against, never sent
  categories: ["score"],
  diagnoses: ["pancreatitis"],      // family tokens — what a charted diagnosis is matched to
  procedures: ["cholecystectomy"],  // family tokens — what a charted operation is matched to
  devices: ["drain"],               // family tokens — what a charted device is matched to
  triggers: ["pancreatitis"],       // free-text fragments that pull the term in
  specialties: ["general-surgery"],
  priority: 80,                     // INTERNAL ONLY — never sent to Deepgram
  dedupeGroup: "closed-suction-drain", // near-synonyms: only the best-scoring one is sent
}
```

---

## 3. How patient-context selection works

`deriveDictationContext(patient, observations)` in `lib/transcription/patient-context.ts` maps
**existing** WardMate data onto a `DictationContext` — no schema migration:

| DictationContext field | Source |
|---|---|
| `diagnoses` | `current_patients.primary_diagnosis` + `observations` of kind `diagnosis` |
| `procedures` | `procedure_text` / template family (operated patients) |
| `plannedProcedures` | `procedure_text` / template family (pre-op patients) |
| `medications` | `observations` of kind `medication` (dose/route stripped) |
| `drains` | `observations` of kind `drain` |
| `devices` | device words found in `exam` / `plan` / `note` observations |
| `investigations` | `observations` of kind `lab` |
| `postOpDay` | `current_patients.post_op_day` |
| `specialty` | `"general-surgery"` (constant today) |

`selectMedicalKeyterms(context)` then scores every lexicon entry:

| Signal | Score |
|---|---|
| exact charted diagnosis / procedure / device / medication | +100 |
| planned (not-yet-done) procedure | +95 |
| device-specific term, device present | +100 |
| diagnosis-associated term (family token match) | +70–90 |
| scoring system relevant to the diagnosis | +80 |
| investigation relevant to the diagnosis | +70 |
| operative anatomy for the charted / planned operation | +70 |
| context trigger match | +60 |
| specialty core | +30 |
| Indian ward vocabulary | +20 |
| universal ward core | floored at 62 |

The patient's **actual** charted diagnosis / procedure / drug / device is also emitted verbatim
as its own keyterm at score 100+ (`syntheticPatientTerms`), so the words on this chart always
outrank the library.

Selection then:

1. keeps entries scoring **≥ 55**, plus the synthetic patient terms;
2. sorts deterministically (score → priority → shorter term → alphabetical);
3. de-duplicates: exact string, then `dedupeGroup`, then whole-phrase containment
   (`Ryle's tube` vs `NG tube` → one keyterm);
4. tops up from the specialty core if a thin context produced < 16 terms;
5. enforces the ceilings below.

Selection is **pure and deterministic** — no LLM, no network. Runs in well under a millisecond.

---

## 4. Internal priority vs Deepgram keyterms

`priority` and the computed `score` are **internal**. They decide *which* terms are chosen and
in *what order* they are trimmed. They are **never** sent to Deepgram — Nova-3 keyterms have no
weight syntax. `buildDeepgramUrl` emits only the term strings.

---

## 5. The 20–50 term target

A single-patient context typically produces **20–50** keyterms. Fewer means the context was
thin (top-up fills toward 16); more is trimmed. This is a target, not a hard rule.

---

## 6. The 400-token WardMate application ceiling

Deepgram's keyterm token limit is ~500. WardMate's own ceiling is **400**, leaving headroom.
`estimateKeytermTokens` deliberately over-counts (words + apostrophe/hyphen splits + 1). If a
selection exceeds 400 tokens, the **lowest-scoring** terms are dropped first. Independently, a
**hard cap of 80 terms** applies (`MAX_KEYTERMS`).

---

## 7. Repeated `keyterm` URL parameter — required

```
✅ ?model=nova-3-medical&language=en-IN&keyterm=Ryle%27s+tube&keyterm=Ranson%27s+criteria&keyterm=CECT+abdomen
❌ keyterm=Ryle's tube,Ranson's criteria,CECT abdomen      (comma-joined)
❌ keyterm=Ranson's criteria:2                              (legacy weight)
```

`buildDeepgramParams` uses `URLSearchParams.append` (never `.set`) for keyterms, so every one
survives. `lib/stt/deepgram.ts` is the only caller in the app.

---

## 8. Adding new vocabulary

Edit the relevant file in `lib/transcription/lexicon/`. Add an entry:

```ts
proc("laparoscopic ventral mesh rectopexy", ["LVMR"], ["rectopexy"], ["rectal prolapse"]),
```

- `term` = the spelling you want Deepgram to output.
- `aliases` = other spellings / expansions the patient context might be written as.
- family tokens (`diagnoses` / `procedures` / `devices`) = what a charted value matches against.
- keep `priority` in the 40–100 band described in `types.ts`.

Run `npx vitest run lib/transcription`.

---

## 9. Adding a diagnosis vocabulary pack

A "pack" is just a coherent set of entries sharing `diagnoses` family tokens. To add e.g. a
**thyroid** pack: create `lib/transcription/lexicon/thyroid.ts`, export a `THYROID` array
(diagnoses, the operations, the anatomy, the scores), and spread it into `MASTER_LEXICON` in
`lexicon/index.ts`. Nothing else changes — the selector picks it up for any patient whose
charted diagnosis matches the family tokens.

---

## 10. Hospital-specific lexicon extension

The layered model (`GLOBAL wardmate-india → SPECIALTY general-surgery → HOSPITAL ESIC →
PATIENT`) is supported without a new admin UI:

- `DictationContext.customTerms` — pass extra `MedicalLexiconEntry[]` straight into the selector.
- `SelectKeytermOptions.extraTerms` — same, at the call site.
- `LexiconProvider` (in `lexicon/index.ts`) — the interface a database-backed provider
  implements to load a ward's / hospital's vocabulary (consultant names, ward names, local drug
  brands, local operation names) and hand it to `mergeLexicon`.

A custom entry whose `term` matches a base term **replaces** it (re-prioritise / re-spell);
otherwise it is appended.

### Future learning loop

WardMate already records transcription corrections (`glossary_terms`, promoted after 3
sightings — see `lib/glossary.ts`, `flagMisheard`). A repeated correction of e.g.
`"Ransom criteria" → "Ranson's criteria"` in a pancreatitis context can later:

- add `"Ransom criteria"` as an **alias** on the `Ranson's criteria` entry, or
- raise that entry's internal `priority`.

The lexicon's `aliases` field is the extension point. **Do not** auto-learn from a single
correction in production — the 3-sighting rule stays.

---

## 11. Testing procedure

```bash
npx vitest run lib/transcription        # selector + URL builder
npx vitest run lib/stt                  # provider wiring
npx tsc --noEmit                        # types
npm run build                           # production build
```

`lib/transcription/__tests__/selectMedicalKeyterms.test.ts` covers the brief's eight cases:
acute pancreatitis, inguinal hernia, diabetic foot, post-op lap chole, exact-medication-wins,
the 80-term / 400-token ceilings, synonym collapse, and the repeated-`keyterm` query string.

To eyeball a selection during development, `describeSelection(context)` returns a **PHI-safe**
summary — `{ selectedCount, estimatedTokens, reasons, terms }`, no patient identifiers. In
`NODE_ENV=development` the voice / case-history routes log this line per dictation.
