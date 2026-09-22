# Taking a history in general surgery — extracted from the standard references

CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-22). This is the source document for the general-surgery
history trees (`content/history-trees/`) and for the surgical scaffolding they share. It records
what the standard texts prescribe, not what the app currently does; the gap table in §7 is the
difference.

## 1. Sources

Textbooks, cited as textbooks — no PubMed id is claimed for any of them, and nothing here is
attributed to an indexed paper unless the id has been checked against PubMed (the rule in
`docs/history-check.md`).

| Short name | Work | What it is used for here |
|---|---|---|
| Browse | *Browse's Introduction to the Symptoms and Signs of Surgical Disease* | The symptom-complex templates in §3 — lump, ulcer, pain, sinus/fistula. This is the reference for *how to interrogate a symptom* in surgery. |
| Bailey & Love | *Bailey & Love's Short Practice of Surgery* | Disease-specific history points and what is must-not-miss per presentation. |
| Hamilton Bailey | *Hamilton Bailey's Demonstrations of Physical Signs in Clinical Surgery* | The link from history item to the sign it predicts. |
| S. Das | *A Manual on Clinical Surgery* | The long-case structure as examined in India; the order below follows it. |
| Sabiston / Schwartz | *Sabiston Textbook of Surgery*; *Schwartz's Principles of Surgery* | Pre-operative assessment, risk and comorbidity (§5). |
| Macleod's / Hutchison's | already in `_helpers.ts` as `MACLEODS`, `HUTCHISONS` | General history skeleton, shared with medicine. |
| ATLS | *Advanced Trauma Life Support* (course manual) | AMPLE and the mechanism questions in §4. |

Where the texts disagree on order they do not disagree on content; the order below is Das's
because that is the order a resident is examined in.

## 2. The surgical history skeleton

The texts agree on eight blocks. Six are shared with medicine and are already in
`commonHpi()`. Two are surgical and are not:

1. **Informant and reliability** — in `commonHpi()`.
2. **Chief complaints, in the patient's words, each with its duration, in chronological order.**
   Surgical emphasis: complaints are listed *oldest first*, and a lump/ulcer is dated from when
   the patient first noticed it, not from when it started hurting.
3. **History of present illness** — the relevant symptom-complex template from §3, then the
   negatives that the differential turns on.
4. **Past history** — medical, plus the **past *surgical* history** in its own right (§5.1).
   This is the block the shared scaffolding is missing.
5. **Treatment history** — in `commonHpi()` as `prior_treatment` / `prior_investigations`, but
   surgery needs the drug classes in §5.3 named explicitly, because they change whether the
   patient can go to theatre.
6. **Personal history** — diet, bowel and bladder habit, sleep, appetite, tobacco, alcohol.
   Bowel and bladder habit are not optional in surgery; they are part of the HPI for most
   abdominal and anorectal complaints.
7. **Family history** — the cancers (breast, ovarian, colorectal, thyroid), bleeding disorders,
   and problems with anaesthesia in a blood relative.
8. **Socio-economic and occupational history** — who will change the dressing, who will bring
   the patient back for follow-up, what the work involves (lifting, standing, squatting), and
   whether the patient can afford the investigation being planned. Browse and Das both treat
   this as part of the history, not an afterthought; it determines what operation is offered.

## 3. The four symptom-complex templates (Browse)

These are the reusable question sets. Every general-surgery tree should be built out of one or
more of them rather than inventing its own order.

### 3.1 A lump

Eleven questions, in this order:

1. When was it first noticed?
2. What made the patient notice it (pain, appearance, someone else saw it, incidentally)?
3. What has happened to it since — bigger, smaller, unchanged, and how fast?
4. Does it ever disappear, or change with posture, coughing, straining, eating, periods?
5. Is it painful, and was it painful from the start or only later?
6. Are there other lumps anywhere?
7. Has it ever discharged, ulcerated, or changed colour?
8. Did anything precede it — injury, injection, insect bite, infection nearby?
9. Has it been treated or aspirated before, and did it come back?
10. What does the patient think it is, and what are they afraid of?
11. Systemic symptoms: fever, night sweats, weight loss, appetite.

### 3.2 An ulcer

1. When and how did it start — spontaneously, after trivial injury, after a blister, from a lump
   that broke down?
2. Has it got bigger or smaller, and has it ever healed and broken down again?
3. Is it painful; what makes the pain better or worse; is it worse at night or on elevation?
4. What comes out of it — serous, pus, blood — how much, and does it smell?
5. Any numbness or altered sensation in the area or in the foot?
6. Any other ulcers now or in the past, at this or another site?
7. Causative background: diabetes, claudication, varicose veins, previous DVT, immobility,
   footwear, occupation, leprosy or TB contact, autoimmune disease.
8. Systemic: fever, weight loss, cough.

### 3.3 Pain

SOCRATES, which the surgical texts state as: site, onset (sudden vs gradual, and what the
patient was doing), character, radiation, associated symptoms, timing and periodicity,
exacerbating and relieving factors (including **relation to meals, to defaecation, and to
movement** — the surgical additions), severity now and at worst. Then, always:

- has there been a *previous identical episode*, and how did it settle?
- has the *character* of the pain changed (colic becoming constant is the question that matters
  in an acute abdomen; it is asked, never interpreted);
- what treatment was taken outside, and did it relieve it?

### 3.4 A sinus or a fistula, and a discharging wound

Where it opened, what came out and how much, whether it ever closed and reopened, what operation
or injury preceded it, whether anything has ever been seen to come out (pus, stool, urine, food,
a piece of bone or thread), and any TB, Crohn's or previous radiation.

## 4. Presentation-specific must-ask sets

The quartets and triads the surgical texts insist on, which a symptom tree must not leave to
chance:

| Presentation | The set the texts require |
|---|---|
| Intestinal obstruction | Pain, vomiting, distension, absolute constipation (no flatus, no stool) — all four, with **which came first**, and whether the vomit became bilious or faeculent. |
| Acute abdomen | The four above, plus: sudden or gradual, migration of pain, relation to movement and coughing, fever, last menstrual period in any woman of reproductive age, previous abdominal operation (bands), and when the patient last ate and drank. |
| Upper GI bleed | Retching before the first vomit, amount and appearance, melaena, known liver disease, NSAIDs / steroids / anticoagulants, previous bleed or ulcer, alcohol. |
| Lower GI bleed / change in bowel habit | Colour and relation to stool, mucus, tenesmus, alternating habit, weight and appetite, family history of bowel cancer, anaemia symptoms. |
| Hernia | Reducibility, cough impulse, what brings it out, has it ever failed to go back, and the obstruction quartet if it has. |
| Trauma | AMPLE — Allergies, Medications, Past illness and pregnancy, Last meal, Events and mechanism — plus **time since injury**, tetanus status, blood loss at the scene, and what was given before arrival. |
| Breast lump | Relation to cycle, nipple discharge (single duct, bloody), skin and nipple change, axillary lump, arm swelling, reproductive and hormonal history, family history. |
| Thyroid / neck swelling | Pressure symptoms (swallowing, breathing, voice), hyper- and hypo- symptoms as questions, movement on swallowing as reported by the patient, and duration before any recent rapid change. |
| Obstructive jaundice | Colour of urine and stool, itching, whether the jaundice fluctuates, pain before the jaundice, fever with rigors, weight loss, and previous biliary surgery or intervention. |

## 5. The pre-operative block — the part a medical history does not have

This is the largest single gap (see §7). The texts treat it as part of the history, not as a
separate anaesthetic form, because it changes what is offered and when.

### 5.1 Past surgical history

Every previous operation: what it was, when, where, under what anaesthetic, was it planned or
emergency, was there any problem during or after it (bleeding, re-operation, wound infection,
prolonged ventilation, ICU stay), and is there an operation note or discharge summary available.
Previous abdominal surgery is a specific question for anyone with an acute abdomen or
obstruction. Any implant, mesh, prosthesis, stent, pacemaker or metal.

### 5.2 Anaesthetic and transfusion history

Any previous anaesthetic and any trouble with it (delayed waking, awareness, severe post-op
vomiting, difficult airway reported to the patient), problems with anaesthesia in a blood
relative, loose or capped teeth, and previous blood transfusion with any reaction.

### 5.3 Drugs that change the plan

Asked as classes, never as drug-and-dose: blood thinners and antiplatelets, steroids, drugs for
diabetes including injections, drugs for blood pressure and heart, inhalers, hormone pills or
contraceptives, herbal and traditional preparations, and anything stopped recently and why. Any
drug allergy, and what happened.

### 5.4 Fitness

Exercise tolerance in the patient's own terms (how many stairs, how far on the flat, and has
that changed), chest pain or breathlessness on exertion, snoring and daytime sleepiness, recent
chest infection or fever, diabetes and how it is controlled, smoking and alcohol in amount and
duration, and current weight trend.

### 5.5 Immediate

Time of last food and last fluid; current fasting status; bowel and bladder function today;
catheter, drain, stoma or tube already in place.

## 6. How this maps onto the tree schema

Nothing in §2–§5 needs a schema change. Every item is a `yes_no` or `value` slot in one of the
five existing groups:

- §3 templates → `hpi` and `associated`;
- §4 must-ask sets → `red_flag` where the answer changes urgency, `associated` otherwise;
- §5.1–§5.5 → `exposure` (it is background that modifies the reading), with the two
  time-critical ones — previous abdominal surgery, and last meal — as `red_flag` in the acute
  trees only.

The product rules hold unchanged: one symptom per slot, every question ends in "?", no question
reads as an instruction, no drug name or dose in any question or term, `teach` states why the
question is asked and never what the answer means, and a negative is only ever recorded when it
was explicitly said.

## 7. Gap against the eleven surgical trees already shipped

Checked against `abdominal-pain`, `abdominal-distension`, `anorectal-pain`, `bleeding-per-rectum`,
`breast-lump`, `constipation`, `dysphagia`, `groin-swelling`, `haematemesis`, `leg-ulcer`,
`lump`, `scrotal-swelling`.

**Already covered well.** The §3 lump and ulcer templates are essentially present in `lump` and
`leg-ulcer`; SOCRATES is complete in `abdominal-pain`; the obstruction quartet is present in
`abdominal-pain` (`obstipation`, `bilious_faeculent_vomiting`, `distension`) and in
`abdominal-distension` (`obstruction`, `flatus_stools`); the UGI-bleed and bowel-habit sets in
§4 are complete in `haematemesis` and `bleeding-per-rectum`.

**Missing everywhere — the pre-operative block (§5).** No tree asks about previous anaesthesia,
anaesthetic trouble in the family, transfusion history, exercise tolerance, implants, or last
meal. `previous_surgery` exists in only four trees (`abdominal-pain`, `abdominal-distension`,
`constipation`, and as `previous_hernia_surgery` / `previous_anal_surgery` / 
`previous_surgery_radiation` in three others) and asks only whether there was one, not what or
when or with what trouble. Anticoagulants appear only in `bleeding-per-rectum` and
`haematemesis`, where they are asked as a bleeding cause rather than as an operability question.

**Missing items inside existing trees.**

| Tree | Missing, per the texts |
|---|---|
| `abdominal-pain` | Time of last food and fluid; change in the *character* of the pain (colic → constant). |
| `lump` | "Has it ever been aspirated or treated and come back?"; "What does the patient think it is?" |
| `leg-ulcer` | Whether it has ever healed and broken down; night pain relieved by hanging the leg. |
| `breast-lump` | Lactation and duration of last breastfeeding as a value, not only `fever_lactation`. |
| `dysphagia` | Whether solids or liquids came first is present; missing is a previous foreign body or impaction. |
| `groin-swelling` | What brings the swelling out (work, cough, straining) is present as occupation; missing is "has it ever failed to go back and then gone back". |

**No tree yet for** — the surgical presentations in §4 with no home: obstructive jaundice is
covered by the medical `jaundice` tree, which does not ask stool colour, fluctuation, or
previous biliary intervention; thyroid/neck swelling falls to the generic `lump`; there is no
burns tree and no post-operative-complication tree (fever, wound, drain, non-passage of flatus
after an operation), though `appliesWhen: "post_op"` already exists in the differential schema.

## 8. Proposed next steps, smallest first

1. **A shared `surgicalBackground()` in `_helpers.ts`**, the §5 block as ~8 slots in `exposure`,
   added to the twelve surgical trees. One helper, one edit per tree, no schema change. This is
   the single biggest gap and the cheapest fix.
2. The six per-tree additions in the table above, as `version` bumps.
3. Reference constants for the surgical texts (`BROWSE`, `BAILEY_LOVE`, `HAMILTON_BAILEY`,
   `DAS`, `SABISTON`, `SCHWARTZ`, `ATLS`) beside `MACLEODS` / `HUTCHISONS`, so surgical trees
   cite a surgical source.
4. New trees only if the unit wants them: `obstructive_jaundice`, `thyroid_swelling`,
   `post_op_problem`, `burns`.

Steps 1-3 are built. The twelve surgical trees carry `surgicalBackground()`, the six per-tree
gaps in §7 are closed, the surgical texts are cited, and all twelve are `reviewStatus:
"reviewed"` (Dr Anubhav Verma, 2026-09-22) at version 1.1.0. Step 4 is not built — say the word.

One deliberate deviation from §6: last food and fluid sits in `exposure`, not `red_flag`. A
red-flag positive raises the safety level of the whole history, and a patient who has eaten is a
timing question, not a danger signal. `acute: true` promotes it from the long case to the ward
round instead.
