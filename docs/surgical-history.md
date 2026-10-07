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
| Sabiston / Schwartz | *Sabiston Textbook of Surgery* (20th ed.; ch. 10, 13, 14, 45 and 64 read for §9); *Schwartz's Principles of Surgery* | Pre-operative assessment, risk and comorbidity (§5, §9); venous disease (§9.2). |
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

Steps 1-4 are built (review status since superseded — see §9.4). The twelve surgical trees carry `surgicalBackground()`, the six per-tree
gaps in §7 are closed, the surgical texts are cited, and all twelve are `reviewStatus:
"reviewed"` (Dr Anubhav Verma, 2026-09-22) at version 1.1.0. Step 4 added three trees — `thyroid_swelling`, `post_op_problem` and `burns` — and closed the
obstructive-jaundice gap inside the existing `jaundice` tree rather than as a separate tree: a
second tree triggering on the same word would have shown the resident two overlapping question
lists for one complaint. `jaundice` v1.1.0 gains whether the jaundice fluctuates, whether pain
came before the yellowness, and any previous biliary operation or procedure; it already asked
stool colour (`pale_stools`) and itching. All three are `reviewed` (Dr Anubhav Verma, 2026-09-23), bringing the signed-off set to fifteen.
`jaundice` stays pending: it is a medicine-ward tree that now carries the obstructive questions,
and a physician should read it.

One deliberate deviation from §6: last food and fluid sits in `exposure`, not `red_flag`. A
red-flag positive raises the safety level of the whole history, and a patient who has eaten is a
timing question, not a danger signal. `acute: true` promotes it from the long case to the ward
round instead.

## 9. What Sabiston adds — history guidelines derived from the 20th edition

Source read: *Sabiston Textbook of Surgery*, 20th ed. (Townsend et al., Elsevier 2017) — ch. 10
"Principles of Preoperative and Operative Surgery", ch. 13 "Surgery in the Geriatric Patient",
ch. 14 "Anesthesiology Principles", ch. 45 "Acute Abdomen", ch. 64 "Venous Disease". Cited as a
textbook (`SABISTON`, `SABISTON_GERIATRIC`, `SABISTON_VENOUS`), no PubMed id claimed. Scores the
text uses (ASA, RCRI, Caprini, Child-Pugh, Mini-Cog) are **not** computed anywhere: the history
asks the questions that feed them, and nothing more.

### 9.1 The pre-operative history (ch. 10, 13, 14)

Sabiston's rule is that pre-operative evaluation is not screening for undiagnosed disease but
identifying comorbidity that changes the operation; tests are sent on the strength of the
history, not routinely. The history it asks of every patient, beyond §5:

| Domain | What the text asks | Why (as Sabiston frames it) |
|---|---|---|
| Heart | Chest pain or breathlessness on exertion; known MI, failure, valve, arrhythmia; stroke/TIA; **date** of any MI, angioplasty or stent; symptoms now at rest or worsening | The ACC/AHA stepwise algorithm: unstable symptoms stop elective surgery; ≥4 METs (two flights of stairs) lets it proceed; MI and stent dates set timing |
| Lungs | COPD/asthma, inhaler use, recent exacerbation, past intubation; sputum or chest infection in the past month; smoking and when it stopped; snoring, witnessed apnoea, daytime sleepiness | Box 10-5 / Table 10-8 risk factors for post-operative pulmonary complications; OSA guidance in ch. 14 |
| Kidney, liver | Kidney disease, dialysis, urine output; jaundice, hepatitis (and how acquired), abdominal swelling, itching, bleeding | Creatinine ≥2 is a cardiac risk factor; cirrhosis class drives abdominal-operation mortality; a known blood-borne infection matters if the team is injured |
| Endocrine | Diabetes — type, treatment, control, end-organ damage; thyroid over/under-activity; **steroid use at any time in the past year** | Adrenal suppression is judged on the past year, not today's drug chart (Box 10-8) |
| Bleeding and clots | **Personal or family history of abnormal bleeding** — easy bruising, bleeding after dental extraction, a cut or an operation; previous DVT/PE and when; anticoagulants, antiplatelets, NSAIDs, herbals | "All patients undergoing surgery are questioned to assess their bleeding risk"; coagulation tests only if the history suggests it; VTE within 3 months is high risk |
| Reserve | Unintentional weight loss in 6 months; four-question function screen (out of bed, dress and bathe, cook, shop); falls in the past year; memory and decline (from the family too); past post-operative confusion; vision and hearing; two-question mood screen | Box 10-1 ACS NSQIP / AGS geriatric checklist; weight loss >10% in 6 months and dependence are independent predictors of death (Table 10-3) |
| Habits | Alcohol amount, last drink, past withdrawal (CAGE); tobacco | Alcohol dependence raises pneumonia, sepsis and wound breakdown and needs withdrawal cover |
| Goals and support | What the patient expects; who supports them at home; who decides if they cannot | Box 10-1: treatment goals, family and social support, a designated decision-maker |
| Airway | Previous anaesthetic records and trouble; loose or false teeth; mouth opening, neck movement | Box 14-3 airway history |
| Fasting | Last food (6–8 h) and clear fluid (2 h) | ASA fasting guidance in ch. 10 |

**Applied as:** a new tree, `preop_assessment` ("Before an operation"), triggered by "pre op",
"posted for surgery", "fitness for surgery", "pre anaesthetic" and similar. It reuses
`surgicalBackground()` for §5 and adds the rows above. Its differentials are not diseases but
the eight kinds of perioperative trouble the history screens for — heart, chest, bleeding,
venous clot, sugar/steroid/thyroid, delirium, low reserve, anaesthetic/airway — each worded as a
reason to ask. Red flags: unstable cardiac symptoms, MI or stent within a year, previous venous
clot, pregnancy (the bleeding question comes from `surgicalBackground()`, §9.4).

### 9.2 Varicose veins (ch. 64)

No tree covered a leg with veins and no ulcer. Sabiston's history:

- **The symptom pattern of venous pooling** — dull ache, heaviness, tiredness; absent on waking,
  worse by afternoon and after prolonged standing, relieved by elevation or stockings; ankle
  swelling; itching and burning over the lower calf.
- **Venous claudication** — bursting pain on exercise relieved by rest and elevation, which points
  to outflow obstruction from a past DVT (secondary disease).
- **Arterial symptoms in the same leg** — because compression can harm a leg with arterial disease.
- **Pelvic congestion** in multiparous women — pelvic pain, dyspareunia, bladder fullness on standing.
- **Risk factors** — age, female sex, pregnancies, family history, injury to the limb, obesity;
  prolonged standing.
- **Classification by cause** (CEAP "E") — congenital (since childhood, birthmark, limb
  overgrowth), primary, secondary (previous DVT, fracture, immobilisation).
- **The indications for treatment, asked as red flags** — bleeding from a varix, ulceration (open
  or healed), recurrent superficial thrombophlebitis; plus sudden whole-leg swelling, which is a
  separate question from slow ankle swelling.

**Applied as:** a new tree, `varicose_veins`. The ulcer stays in `leg_ulcer`; here it is a red flag.

### 9.3 What Sabiston confirms and does not change

- **Acute abdomen (ch. 45)** — open-ended questions for onset, character, location, radiation and
  chronology; migration of pain; relation to food and to movement; whether flatus and stool are
  still passing; vomiting before or after the pain; previous surgery; the atypical presentations
  in the pregnant, the elderly and the immunocompromised. All of it is already in `abdominal_pain`
  v1.1.0 (`migration`, `relation_to_meals_bowel`, `obstipation`, `previous_episodes`,
  `previous_surgery`, `peritonism_symptoms`, `IMMUNOCOMPROMISE`). No change.

### 9.4 Applied to every surgical tree

Four Sabiston items were added to the shared `surgicalBackground()`, so every tree that carries
it now asks them: a personal or family bleeding tendency (`surg_bleeding_tendency`, core), steroid
at any time in the past year (`surg_steroid_past_year`), unintentional weight loss over six months
(`surg_weight_loss`) and snoring with witnessed pauses (`surg_snoring_apnoea`) — the last three
`detailed`, so the ward round is not lengthened. All `exposure`, like the rest of the block.

`surgicalBackground({ omit: ["surg_weight_loss"] })` drops the weight question from the sixteen trees that
already ask weight loss in their own words (abdominal pain and distension, anorectal pain,
bleeding per rectum, bone swelling, breast lump, constipation, dysphagia, groin swelling,
haematemesis, leg ulcer, limp, lump, post-burn contracture, pressure sore, scrotal swelling); a
second identical question would show up as its own gap. `thyroid_swelling` keeps it: its own
weight question is about an overactive gland, not reserve. `haematemesis` keeps both its own
bruising question and the new one, which adds family history and bleeding after procedures.

All twenty-two trees were version-bumped and set back to `pending_clinician_review`; each goes
back on the pinned list in `trees.test.ts` only when re-read. `preop_assessment` now takes these
four from the helper instead of asking them itself, which means its bleeding question is
`exposure`, no longer a red flag.

## 10. What S. Das adds — *A Manual on Clinical Surgery*, 13th ed.

Source read: the 13th-edition EPUB (an OCR of the print book). Chapter 1 "General scheme of
case-taking" was read in full; the history sections of chapters 3–9, 11, 12, 14, 15, 18, 20, 26–28,
30, 31, 33–36, 38 and 39 were read chapter by chapter against the tree each one feeds. Cited as
`DAS_CLINICAL_SURGERY`, now on every tree that carries `surgicalBackground()` — none of them
cited it before, though §1 named it as the source of the long-case order.

### 10.1 The general scheme (ch. 1) — in `surgicalBackground()`

Das's long case, after particulars and chief complaints in the order they appeared, asks of
every surgical patient:

- **"Were you perfectly well before this?"** — because a complaint the patient thought unrelated
  (hunger pains months before a perforation) is often the clue (`surg_well_before`).
- **Associated diseases** — diabetes, hypertension, asthma, tuberculosis, bleeding disorders,
  rheumatic fever (`surg_other_illnesses`, core).
- **Past history in date order** — peptic ulcer, pancreatitis, tuberculosis, gallbladder disease,
  appendicitis, operations and accidents (`surg_past_illnesses`; operations were already
  `surg_previous_operations`).
- **Drug history and allergy** — already `surg_regular_drugs`, `surg_steroid_past_year`,
  `surg_allergy`.
- **Personal history** — smoking and alcohol stay in each tree's own words (§5); in a woman, the
  menstrual history, last period, pregnancies and caesarean section (`surg_menstrual_obstetric`).
- **Family history** — cancers, tuberculosis, diabetes, piles, haemophilia (`surg_family_illness`).
- **Occupation and residence** — varicose veins in bus conductors, scrotal cancer in sweeps,
  filaria and leprosy by district (`surg_occupation_residence`).

All `exposure`; all `detailed` except other illnesses. `omit` drops any of them from a tree that
already asks it in its own words — weight loss in sixteen trees, family history in `lump`,
`dysphagia`, `varicose_veins`, `sinus_fistula`; menstrual history in the two abdominal trees and
`varicose_veins`; occupation in five; other illnesses in `burns` and `preop_assessment`.

### 10.2 Per-chapter questions added to existing trees

Each was checked against every existing slot and the helpers first; only items Das states and the
tree did not already ask were added (marked in each file with a "S. Das" comment above them).

| Tree | Added from Das |
|---|---|
| `abdominal_pain` | smoking; blood and mucus per rectum; periodicity of attacks; precipitating event (purgative, straining, jolting); effect of pressure on the pain |
| `abdominal_distension` | colic turned constant (red flag); blood and mucus per rectum (red flag); when vomiting began relative to pain; needing more and more laxative |
| `constipation` | needing more and more laxative; stool colour; colic turned constant (red flag) |
| `haematemesis` | iron or bismuth (false melaena); smoking; loss of ulcer periodicity; vomiting of stale food; dietary habit |
| `anorectal_pain` | pain that builds and settles when it discharges; previous anal abscess; length of prolapse; past dysentery; family history of piles, polyps or bowel cancer |
| `bleeding_per_rectum` | urgent stool on waking (spurious morning diarrhoea); pus or foul discharge; sacral or sciatic pain |
| `groin_swelling` | where it first appeared and which way it spread; testis missing on that side since childhood; filarial attacks |
| `scrotal_swelling` | trigger for the pain (strain, lifting, intercourse); haematuria with a quickly appearing varicocele (red flag); upper abdominal lump; fall astride, stricture or periurethral abscess (red flag); soot, tar or oil at work |
| `thyroid_swelling` | sleep at night; irregular heartbeat; goitre in the family; goitrogenic medicines; previous abscess in the front of the neck |
| `breast_lump` | when the nipple turned in (since puberty or recent); previous breast abscess; throbbing pain |
| `dysphagia` | liquids before solids; blood in the vomit; previous endoscopy or dilatation; previous hiatus repair or vagotomy; past diphtheria |
| `varicose_veins` | sudden breathlessness, chest pain or haemoptysis (red flag); night cramps; abdominal swelling; constipation; white leg in a past pregnancy |
| `lump` | which came first, pain or swelling; infection in the drainage area; sudden growth after years; arose from a scar or mole; movement limited; swelling under the jaw at meals |
| `leg_ulcer` | began as a lump that broke down; disease of the spine, cord or nerves; past syphilis |
| `pressure_sore` | kidney disease |
| `bone_swelling` | pain before swelling; infection elsewhere before; flare-ups; brittle bones in the family; many fractures since childhood |
| `hand_injury` | constant burning pain since the injury; wound infected or slow to heal |
| `spinal_injury` | band-like girdle pain and its level |
| `road_traffic_accident` | coughing blood; blood in the vomit; urge to void with only drops versus no urge; where the blow landed |
| `limp` | dull ache or throbbing; past urethral discharge or STI; past typhoid or pneumonia; gout or rheumatism in the family |
| `post_op_problem` | haemoptysis; hiccups; vomiting while drowsy from the anaesthetic |

Das has no history guidance for an acute burn or a post-burn contracture; those two trees gain
only the §10.1 background.

### 10.3 New trees for Das chapters with no home

- **`ventral_hernia`** (ch. 38, pp. 609–610) — umbilical, para-umbilical, epigastric and
  incisional hernias and divarication of the recti, separated by site; intermittent pain from a
  tight para-umbilical neck; epigastric pain after meals mistaken for an ulcer; raised abdominal
  pressure behind an acquired umbilical hernia; an infected earlier wound behind an incisional one.
  The groin tree's bare "hernia" trigger means both are suggested for an undifferentiated hernia.
- **`sinus_fistula`** (ch. 5) — the opening itself as the complaint: site, since birth, how it
  began, what comes out, bone chips, heals and reopens, operation at the site, earlier gland
  swelling, TB / Crohn's / colitis, chronic empyema; red flags for stool, urine or bile from the
  opening and a blocked collection.
- **`abdominal_lump`** (ch. 35, with its pointers to ch. 3, 34 and 37) — region, how it was
  noticed, growth, pain before or after, gut, biliary, urinary and gynaecological symptoms, other
  lumps; dysentery (liver abscess), urticaria (hydatid), worms, injury (pseudocyst).

All three are `pending_clinician_review`, each with a synthetic eval case that passes.

## 11. What Hamilton Bailey adds — *Demonstrations of Physical Signs in Clinical Surgery*, 19th ed.

A book of physical signs, so it adds less history than Das; what it adds is mostly the history
that a sign is waiting on. Chapter 1 (history-taking) was read in full; the history passages of
chapters 2–4, 6–10, 13, 14, 18, 25–30, 32–37 and 39 were read against the trees they feed.
Cited as `HAMILTON_BAILEY` on every tree that carries `surgicalBackground()`. Slots added from it
sit under a "Hamilton Bailey" comment in each file.

### 11.1 The general scheme (ch. 1) — in `surgicalBackground()`

- **Recreational drugs** (`surg_recreational_drugs`) — asked nowhere before.
- **The patient's own idea of the cause, and what they fear** (`surg_patient_concern`) — omitted
  from `lump` and `preop_assessment`, which already ask it in their own words.
- **Occupation now and in the past, and who lives with and depends on the patient** — folded into
  Das's `surg_occupation_residence`.
- **The same complaint in the family** — folded into Das's `surg_family_illness`.

### 11.2 Per-chapter questions added to existing trees

| Tree | Added from Hamilton Bailey |
|---|---|
| `abdominal_pain` | pain waking at night; atrial fibrillation or recent heart attack (red flag — mesenteric embolus); ectopic risk factors; fever before the pain (typhoid) |
| `abdominal_distension` | earlier cancer; bleeding after menopause; earlier attacks that settled (volvulus); large meal after a religious fast |
| `abdominal_lump` | earlier cancer; bleeding after menopause; past malaria |
| `constipation` | earlier attacks that settled |
| `haematemesis` | burn, head injury or serious illness; kidney failure; abdominal injury in recent weeks (haemobilia) |
| `anorectal_pain` | holding back stool for fear of pain; boils in the armpits or groins; perianal blisters or sores |
| `bleeding_per_rectum` | earlier treatment for piles, fissure or fistula; perianal itching; holding back stool |
| `groin_swelling` | pain since an earlier repair; sore, lump or bleeding at the anus; inner-thigh pain (obturator) |
| `ventral_hernia` | pain or bleeding with periods (endometriosis); discharge from the navel; stoma and fitting the bag |
| `scrotal_swelling` | repeated antibiotic courses for urine infection (genitourinary TB); discharging sinus on the scrotum; perianal source before the redness (red flag) |
| `thyroid_swelling` | onset at puberty or around pregnancy; family endocrine or polyp syndromes; proximal weakness; stones, bones, thirst |
| `breast_lump` | discharge spontaneous or only on squeezing; past cancer elsewhere or lymphoma radiation; smoking; in a man, testis, steroids, cannabis |
| `dysphagia` | severe chest pain after retching (red flag); early fullness after meals; salted, smoked or pickled food |
| `varicose_veins` | smoking; clots in young relatives; cancer |
| `preop_assessment` | high blood pressure or cholesterol; fainting on effort (red flag); pillows needed lying flat; claudication or known aneurysm |
| `lump` | facial weakness with a parotid lump (red flag); character of any discharge; bleeding or itching of a mole; recent sore throat before a neck lump |
| `leg_ulcer` | pain before the ulcer; able to check own feet; bandage, plaster or splint over the spot; radiotherapy to the area |
| `pressure_sore` | plaster, splint or bandage pressing on the skin |
| `bone_swelling` | long-standing swelling now growing (red flag) |
| `sinus_fistula` | wind or gas from the opening; something driven in at the site |
| `road_traffic_accident` | airbags opened; damage to the vehicle |
| `spinal_injury` | what happened before the fall; surface landed on; fragile bones; known cancer |
| `hand_injury` | alcohol; nail biting or nail care; infection elsewhere; autoimmune or vascular disease |
| `limp` | walking distance and shoes and socks; low birth weight (Perthes); neck tilt or foot deformity at birth (hip dysplasia) |
| `burns` | chemical swallowed (red flag) |
| `post_op_problem` | redness spreading beyond the wound (red flag); drip or cannula site; urine leaking from the vagina after pelvic surgery |

`post_burn_contracture` gains only the §11.1 background.

## 12. Senior review against Schwartz, and the daily note and discharge

*Schwartz's Principles of Surgery*, 11th ed. (Brunicardi et al., McGraw Hill 2019), was split into
its 54 chapters and read, chapter by chapter, against the 27 surgical trees, the general-surgery
progress note and the general-surgery discharge templates, as a senior surgeon would review a
resident's work: correct what is wrong, remove what is duplicated, keep the ward round short.
Slots added from it sit under a "Schwartz" comment in each tree.

### 12.1 History trees

**Clinical corrections** (the ones that changed what a resident would record):

- *Biliary colic* — the `periodicity` teach said gallbladder pain grumbles on between attacks;
  Schwartz describes discrete attacks with the patient well in between.
- *Torsion* — the age clause made torsion read as an adolescent-only diagnosis; it now asks
  abrupt onset at a definite moment or waking from sleep, at any age. Das's "almost always an
  exciting cause" is kept but marked as not reassuring when absent.
- *Testicular tumour* — "hard painless mass" now asks a hard lump within the testis, painful or
  not (most present with pain or a mass).
- *Goitrogens* — sulphonylureas removed; amiodarone, lithium and iodide added (Schwartz Table 38-3).
- *Burns* — lime and cement are brushed off before washing; the "large area / extremes of age"
  slot no longer asks age (it comes from the record) or matches every "years".
- *Tetanus* — asked as course and timing together, not the last injection only.
- *Post-operative fever* — "early fever points away from the chest" was wrong; the teach now
  separates fever in the first two days from fever that starts or climbs after the third.
- *Pre-op* — stent type as well as date; decompensated heart failure joins the unstable-cardiac
  red flag; last meal (fasting) back on the ward round; steroids and implants core; hormone pill,
  reflux and a stopped antiplatelet asked.
- *Spinal shock* — the complete-loss teach no longer reads an early complete deficit as final.
- *Inflammatory breast cancer*, *pulsatile lump / groin swelling* (aneurysm or false aneurysm before
  a needle), *intersphincteric abscess*, *carbon monoxide after smoke*, *aorto-enteric fistula* —
  missing must-not-miss red flags, added.

**Duplicates removed** — slots added by different passes that asked the same thing (for example
`femoral_position` / `position`, `lump_in_testis` / `hard_painless_mass`, `hoarseness_with_dysphagia`
/ `hoarseness`, `flatus_stools` / `obstruction`, `anticoagulants` / `surg_blood_thinners`), each
deleted with its differential references repointed.

**Red flags** — kept only where a positive changes urgency; risk factors (family history, past
radiation, smoking, a clot years ago) moved to exposure. `tier` on a red flag is a no-op (red flags
always show), so those were regrouped rather than left misleading.

**Ward-round length** — Ward mode shows red flags and core slots. The shared blocks alone put
15–16 core questions on every tree, so `surgicalBackground()` gained `detailed: [...]` and
`core: [...]` beside `omit`, the elective pre-op items (anaesthetic trouble, exercise tolerance,
bleeding tendency) are academic on a non-acute tree, transfusion always is, and the injury trees
spread `TRAUMA_BG` — an AMPLE-sized core with the rest in academic mode. Core slots per tree went
from 28–39 to 18–31; nothing was deleted to get there, only moved to Academic.

### 12.2 The daily progress note (general surgery)

- New **Wound** line (shared `WOUND` section, plus induration, staples, port sites).
- New **Drains / tubes / I-O** line — each drain's output and character, Ryle's aspirate,
  catheter and urine output, stoma, intake/output. Dictation already extracted these
  observations; until now the surgical sheet had nowhere to print them.
- Complaint chips: the flatus / stool chips (already the Flatus / Stool card) removed; nausea,
  wound discharge, retention and calf pain added.
- Plan chips: the diet ladder (NBM → sips → liquids → soft → normal), tubes out, mobilise,
  incentive spirometry, dressing, suture / staple removal, stoma care, DVT-prophylaxis review,
  step down / stop antibiotics, culture follow-up (Schwartz ch. 6, 12, 50).
- **What to check today** — the matching discharge template's per-diagnosis `progressNote` now
  shows, collapsed and read-only, above the note's card stack. Never saved, prefilled or sent to
  the AI. Those strings were corrected first (pancreatitis: CT does not predict severity, same-
  admission cholecystectomy for mild gallstone disease; perforation: antibiotic duration after
  source control; strings that stated expected findings rewritten as things to check).
- The discharge drain check now reads the latest drain observation, so "drain serous" on POD 1
  no longer outlives "drain removed" on POD 3, and "No drain" never reads as one in situ.

### 12.3 Discharges (general surgery)

- **Conditional drugs** — a drug given only in some patients now carries its condition inside a
  `[ … ]` generic name, so an unedited row prints visibly unfinished instead of as a prescription
  every patient received. A test enforces it. Second drugs hidden inside another drug's
  `indication` (tramadol, metronidazole, cefixime) became their own rows.
- **Antibiotics** — default post-discharge courses removed where current practice finishes them
  in hospital: STOP-IT (about 4 days after source control), Tokyo 2018 (≤ 24 h after
  cholecystectomy for grade I–II), none after clean elective surgery.
- **Condition at discharge** — "healthy surgical wounds" and "drain removed" are no longer
  pre-marked by any template (a conservatively managed patient has neither); the resident marks
  them. This is in the shared engine, so it applies to every department.
- **Corrections** — pancreatitis (goal-directed balanced crystalloid, not "aggressive";
  cholecystectomy timing; imaging at four weeks only if severe; chronic pancreatitis no longer
  matches), perforation (H. pylori test-and-treat, mandatory endoscopy after a gastric
  perforation, enteric and tubercular rows), obstruction (no bulk laxative after adhesive
  obstruction; volvulus and hernia follow-up), hernia (return to activity as pain allows —
  HerniaSurge — with the 4–6-week restriction kept for large ventral repairs), colorectal
  (lactulose not with an ileostomy, loperamide for high output, stoma closure and CEA /
  colonoscopy surveillance), gastric (no PPI after total gastrectomy, domperidone ≤ 7 days,
  lifelong B12), perianal, lap chole (carcinoma on histopathology), generic (no NSAID default).
- **Matching** — benign cases no longer reach the cancer templates (breast lump, ileocaecal TB
  hemicolectomy, corrosive gastric outlet obstruction); hiatus hernia, chronic pancreatitis and
  gynaecomastia no longer match; perforated appendix and gallbladder reach their own templates;
  gallstone ileus reaches obstruction. A matching test covers 27 typed diagnoses.
- **Nine new templates** — benign breast lump, thyroidectomy, liver abscess, CBD stones /
  cholangitis / obstructive jaundice, blunt abdominal trauma, varicose veins, diabetic foot,
  abscess / soft-tissue infection, lipoma / cyst / minor lump; and the urology hydrocele template
  reused with a Surgery-OPD follow-up.
- **Checks** (warnings, never blocking) — a `[ … ]` template blank left in any section; an NSAID
  beside a blood thinner, or after a peptic ulcer, perforation or GI bleed.

All of §12 is **pending the unit's clinical sign-off**: the surgical trees stay
`pending_clinician_review`, the progress-note config says so in its header, and the discharge
templates file records it.

### 12.4 Follow-ups after the review

- **`head_injury` v1.1.0** — a seizure after the injury is a red flag (Schwartz groups it with
  vomiting and amnesia as reasons for prompt imaging). Terms that let an unrelated word fill a
  slot were removed: "alcohol" from the blood-thinner red flag, "age" and "old" from the
  over-65 red flag (they matched any "30-year-old"), "slipped" and "tripped" from the
  medical-cause-of-fall question.
- **`limb_injury` v1.1.0** — the same "slipped / tripped" fix on its cause-of-fall red flag, and
  tetanus asked as course and timing.
- **`jaundice` v1.2.0** — dark urine no longer *raises* haemolysis (haemolytic jaundice is
  acholuric; it stays a discriminator); the duplicate bleeding question folded into the red flag;
  alcohol moved from red flag to exposure; two teach lines that stated a diagnosis or an
  instruction rewritten. A physician should read this one — it is a medicine-ward tree.
- **Validator** — `quoteNegatesItem` read the "has" inside "has not" as an affirmation that ended
  the denial, so every "has not …" was dropped. The affirmation check now starts after the
  negation phrase. "since" still ends a denial, by design ("no vomiting since 2 days" stays
  unasked), so "has not passed urine since the burn" remains unasked.
- **`post_op_problem` v1.2.0** — `flatus_stool` is asked as the problem ("no flatus or stool
  since the operation"), so a positive answer is the one that raises ileus or obstruction, as its
  differentials already assumed. **`thyroid_swelling` v1.2.0** — "pain" and "difficulty in
  swallowing" added as terms. **`burns` v1.2.0** — "unconscious" removed from `other_injuries`
  (falls, jumps, blasts); unconsciousness after smoke belongs to the carbon-monoxide red flag.
- The three history-check eval cases that failed on `main` now pass; two expectations that
  contradicted the validator's deliberate rules were changed to "unasked" with the reason.
- `scripts/alias-hook.mjs` resolves extensionless relative imports, so `scripts/test-discharge.ts`
  runs again (36/36).
- **`IMMUNOCOMPROMISE`** (shared, 42 trees) — diabetes removed from both the question and the
  terms, on the owner's ruling that diabetes says nothing about immune status: "no diabetes" was
  being accepted as a denial of immunocompromise. Trees that need diabetes as an infection risk
  ask it in their own slot. Every tree carrying the flag was version-bumped and set to pending.
