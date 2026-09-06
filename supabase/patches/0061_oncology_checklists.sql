-- Medical oncology checklists — the two admission types the unit named first.
--
-- WHAT A CHECKLIST IS HERE. A protocol row plus its items. The items appear on a patient's
-- page as things the round is expected to have covered; anything with no value recorded shows
-- as an orange gap. An item can carry a `trigger` (patch 0058) so it only appears once it
-- applies — a rule evaluated in lib/checklist-triggers.ts.
--
-- WHY THESE TWO. From the unit's own casemix, in its own order: planned chemotherapy cycles,
-- and chemotherapy toxicity with febrile neutropenia at the top of it.
--
-- THE ONE THING THIS EXISTS FOR. Fever in a patient on chemotherapy is an emergency. Blood
-- cultures must be drawn BEFORE the first antibiotic dose, and that dose must go in within the
-- hour. Both are checklist lines below, and the "cultures sent before antibiotics" line is
-- raised to a gap the moment the patient is more than an hour into the admission, so a round
-- that has not answered it cannot look complete.
--
-- SCOPING. Protocols are matched to a patient by template_family, so these attach only to
-- patients carrying the oncology families. A surgical patient never has one, so seeding these
-- is invisible on a surgical ward.
--
-- WHY phase = 'before_surgery' ON AN ONCOLOGY CHECKLIST. The `phase` enum was written for a
-- surgical ward and is stored on live rows, so it is not being renamed. What it means in the
-- matcher is "which checklist applies now", and lib/templates.ts phaseFor() computes it from
-- whether the patient has an operation date. A medical oncology patient never has one, so the
-- value computed for them is always 'before_surgery' — and that is therefore the value their
-- checklist has to be filed under to be found. The pack's `pickerPhase` makes the ward picker
-- offer the same rows. Nothing about a surgical unit changes.
--
-- STATUS. Seeded as 'draft', which means residents CANNOT see them yet: getTemplateForPatient
-- only matches published protocols. That is deliberate — the content is not clinically signed
-- off. After the oncology unit has read both checklists through, publish them with:
--
--   update company_protocols set status = 'published', published_at = now()
--    where title in ('Febrile Neutropenia — Admission Checklist',
--                    'Chemotherapy Cycle — Checklist');
--
-- NOT CLINICALLY SIGNED OFF. Every threshold below is a clinical statement and must be read
-- through by the oncology unit before the pilot.
--
-- Requires: 0026_company_protocol_library.sql, 0058_checklist_item_trigger.sql,
--           0060_specialty_packs.sql.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

do $$
declare
  fn_id uuid;
  cx_id uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Febrile neutropenia
  -- ---------------------------------------------------------------------------
  select id into fn_id from company_protocols
   where title = 'Febrile Neutropenia — Admission Checklist' limit 1;

  if fn_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Febrile Neutropenia — Admission Checklist', 'v1-draft', 'WardMate oncology pack',
            'febrile_neutropenia', 'before_surgery', 'draft')
    returning id into fn_id;
  end if;

  delete from company_protocol_items where protocol_id = fn_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (fn_id, 'investigation', 1, 'absolute neutrophil count', 'core', 'objective', null,
      array['anc','neutrophil count','counts','tlc with differential','nadir'], null),

    -- The two time-critical lines. Both become gaps once the patient is an hour in, because an
    -- hour is the standard the unit is held to and a blank line after it is the finding.
    (fn_id, 'investigation', 2, 'blood cultures sent before antibiotics', 'core', 'objective', null,
      array['cultures','blood culture','peripheral culture','line culture','culture sent'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (fn_id, 'investigation', 3, 'first antibiotic dose time', 'core', 'objective', null,
      array['antibiotic started','piptaz','first dose','empirical antibiotic','door to antibiotic'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),

    (fn_id, 'investigation', 4, 'source of fever', 'core', 'objective', 'No source identified',
      array['focus','source','septic screen','chest','urine','line site','perianal','oral cavity'], null),
    (fn_id, 'investigation', 5, 'line site examined', 'core', 'objective', 'Line site clean',
      array['chemoport','picc','central line','port site','line site'], null),
    (fn_id, 'investigation', 6, 'regimen and day of cycle', 'core', 'subjective', null,
      array['regimen','cycle','cycle day','last chemotherapy','last chemo date'], null),
    (fn_id, 'investigation', 7, 'haemodynamic status', 'core', 'objective', 'Haemodynamically stable',
      array['blood pressure','perfusion','shock','lactate','sepsis'], null),

    -- Reviews that only make sense once time has passed.
    (fn_id, 'investigation', 8, 'antibiotic review at 48 hours', 'core', 'assessment', null,
      array['de-escalation','escalation','antibiotic review','culture result'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (fn_id, 'investigation', 9, 'antifungal cover considered', 'optional', 'assessment', null,
      array['antifungal','caspofungin','voriconazole','persistent fever'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 96}]}'::jsonb),
    (fn_id, 'investigation', 10, 'G-CSF given', 'optional', 'plan', null,
      array['gcsf','g-csf','filgrastim','grafeel','growth factor'], null),
    (fn_id, 'investigation', 11, 'count recovery', 'core', 'objective', null,
      array['anc recovering','count recovery','counts improving'], null);

  -- ---------------------------------------------------------------------------
  -- 2. Planned chemotherapy cycle
  -- ---------------------------------------------------------------------------
  select id into cx_id from company_protocols
   where title = 'Chemotherapy Cycle — Checklist' limit 1;

  if cx_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Chemotherapy Cycle — Checklist', 'v1-draft', 'WardMate oncology pack',
            'chemo_cycle', 'before_surgery', 'draft')
    returning id into cx_id;
  end if;

  delete from company_protocol_items where protocol_id = cx_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    -- Fitness for the cycle: everything that must be true before the drugs go up. Shown on the
    -- day the cycle starts, when it is the only question that matters.
    (cx_id, 'investigation', 1, 'pre-chemotherapy counts', 'core', 'objective', null,
      array['cbc','anc','platelets','haemoglobin','counts before chemo'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (cx_id, 'investigation', 2, 'renal and liver function', 'core', 'objective', 'Normal',
      array['creatinine','urea','lft','bilirubin','creatinine clearance'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (cx_id, 'investigation', 3, 'weight and body surface area', 'core', 'objective', null,
      array['weight','bsa','body surface area','dose calculation'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (cx_id, 'investigation', 4, 'ECOG performance status', 'core', 'objective', null,
      array['ecog','performance status','ps'], null),
    (cx_id, 'investigation', 5, 'consent for chemotherapy', 'core', 'plan', null,
      array['consent','informed consent'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (cx_id, 'investigation', 6, 'dose given as percentage of planned', 'core', 'plan', null,
      array['dose','full dose','dose reduction','dose modified','percent dose'],
      '{"when": [{"type": "on_regimen"}]}'::jsonb),
    (cx_id, 'investigation', 7, 'antiemetic premedication', 'core', 'plan', null,
      array['premedication','ondansetron','palonosetron','aprepitant','dexamethasone'], null),
    (cx_id, 'investigation', 8, 'vascular access', 'core', 'objective', null,
      array['chemoport','picc','central line','peripheral line','port flushed'], null),
    (cx_id, 'investigation', 9, 'infusion reaction or extravasation', 'core', 'objective',
      'No infusion reaction or extravasation',
      array['reaction','extravasation','rigors during infusion','hypersensitivity'], null),

    -- After the drugs: toxicity, and the nadir the whole cycle is timed around.
    (cx_id, 'investigation', 10, 'oral intake and mucositis', 'core', 'objective', 'Tolerating orals, no mucositis',
      array['mucositis','oral ulcers','intake','stomatitis'],
      '{"when": [{"type": "cycle_day_gte", "days": 2}]}'::jsonb),
    (cx_id, 'investigation', 11, 'nadir count check arranged', 'core', 'plan', null,
      array['nadir','count check','cbc on day','repeat counts'],
      '{"when": [{"type": "cycle_day_gte", "days": 7}], "effect": "core"}'::jsonb),
    (cx_id, 'investigation', 12, 'fever advice given', 'core', 'plan', null,
      array['fever card','fever advice','when to come back','red flags'], null),
    (cx_id, 'investigation', 13, 'next cycle date', 'core', 'plan', null,
      array['next cycle','due on','next admission'], null);
end $$;

-- ---------------------------------------------------------------------------
-- 3. The picker rows.
--
-- A protocol only reaches a patient once somebody has set that patient's template_family. On
-- the ward list that is chosen from care_templates, so each oncology family needs a row here
-- for it to be offerable at all. These carry no items of their own — the published protocol
-- above supplies the checklist — they exist to put the choice on the screen.
--
-- ward_id null = the shared starter library, the same place the surgical templates live.
-- ---------------------------------------------------------------------------

-- Idempotent by hand rather than by ON CONFLICT: the unique index is on
-- (ward_id, family, variant, phase), and both ward_id and variant are null here — Postgres
-- treats nulls as distinct, so ON CONFLICT would not catch a second run and the rows would
-- double.
insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('chemo_cycle',         null::text, 'before_surgery'::care_phase, 'Chemotherapy cycle'),
  ('febrile_neutropenia', null,       'before_surgery',             'Febrile neutropenia'),
  ('chemo_toxicity',      null,       'before_surgery',             'Chemotherapy toxicity'),
  ('leukaemia_induction', null,       'before_surgery',             'Leukaemia — induction'),
  ('lymphoma_chemo',      null,       'before_surgery',             'Lymphoma — chemotherapy'),
  ('myeloma',             null,       'before_surgery',             'Multiple myeloma'),
  ('transfusion_support', null,       'before_surgery',             'Cytopenia / transfusion support')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
