-- Internal medicine checklists — the three admission types the unit named first.
--
-- WHAT A CHECKLIST IS HERE. A protocol row plus its items. The items appear on a patient's
-- page as things the round is expected to have covered; anything with no value recorded shows
-- as an orange gap. An item can carry a `trigger` (patch 0058) so it only appears once it
-- applies — evaluated in lib/checklist-triggers.ts. Internal medicine's pack anchors its
-- triggers on ADMISSION (there is no operation and no cycle), using `hours_since_admission_gte`
-- and `lab` conditions that already exist — no new trigger code was needed.
--
-- WHY THESE THREE. From the unit's own casemix, in its own order (docs/specialty-packs.md §2a):
-- febrile illness and sepsis; then the blood/immunity workups; then uncontrolled hypertension
-- and diabetes. The first tranche of checklists is the febrile-illness admission, DKA, and the
-- hypertensive emergency.
--
-- THE ONE THING THE FEVER CHECKLIST EXISTS FOR. Blood cultures must be drawn BEFORE the first
-- antibiotic dose. That line is raised to a gap the moment the patient is more than an hour
-- into the admission, so a round that has not answered it cannot look complete — the same
-- mechanism the oncology febrile-neutropenia checklist uses.
--
-- SCOPING. Protocols are matched to a patient by template_family, so these attach only to
-- patients carrying a medicine family. A surgical or oncology patient never has one, so seeding
-- these is invisible on those wards.
--
-- WHY phase = 'before_surgery' ON A MEDICINE CHECKLIST. The `phase` enum was written for a
-- surgical ward and is stored on live rows, so it is not being renamed. lib/templates.ts
-- phaseFor() computes 'before_surgery' for any patient with no operation date — which every
-- medicine patient is — so that is the value the checklist must be filed under to be found.
-- The pack's `pickerPhase` makes the ward picker offer the same rows.
--
-- STATUS. Seeded 'draft' — residents CANNOT see these yet (getTemplateForPatient only matches
-- published protocols). Deliberate: the content is not clinically signed off. After the
-- medicine unit has read all three through, publish with:
--
--   update company_protocols set status = 'published', published_at = now()
--    where title in ('Febrile Illness — Admission Checklist',
--                    'Diabetic Ketoacidosis — Checklist',
--                    'Hypertensive Emergency — Checklist');
--
-- NOT CLINICALLY SIGNED OFF. Every threshold and interval below is a clinical statement and
-- must be read through by the medicine unit before the pilot.
--
-- Requires: 0026_company_protocol_library.sql, 0058_checklist_item_trigger.sql,
--           0060_specialty_packs.sql, 0063_internal_medicine.sql.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

do $$
declare
  fi_id uuid;
  dka_id uuid;
  hte_id uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Febrile illness — admission
  -- ---------------------------------------------------------------------------
  select id into fi_id from company_protocols
   where title = 'Febrile Illness — Admission Checklist' limit 1;

  if fi_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Febrile Illness — Admission Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'febrile_illness', 'before_surgery', 'draft')
    returning id into fi_id;
  end if;

  delete from company_protocol_items where protocol_id = fi_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (fi_id, 'investigation', 1, 'duration and pattern of fever', 'core', 'subjective', null,
      array['onset of fever','days of fever','fever chart','stepwise','evening rise','intermittent'], null),
    (fi_id, 'investigation', 2, 'localising symptoms / focus of infection', 'core', 'subjective', 'No localising symptoms',
      array['cough','dysuria','loose stools','abdominal pain','headache','neck stiffness','rash','joint pain','burning micturition'], null),

    -- The time-critical line. Becomes a gap once the patient is an hour in.
    (fi_id, 'investigation', 3, 'blood cultures sent before antibiotics', 'core', 'objective', null,
      array['blood culture','cultures','culture sent','c/s','bactec'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (fi_id, 'investigation', 4, 'first antibiotic dose time', 'core', 'objective', null,
      array['antibiotic started','first dose','empirical antibiotic','ceftriaxone','piptaz','door to antibiotic'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),

    (fi_id, 'investigation', 5, 'tropical fever workup sent', 'core', 'objective', null,
      array['ns1','dengue serology','widal','typhidot','mp smear','malaria antigen','weil felix','scrub typhus igm','leptospira'], null),
    (fi_id, 'investigation', 6, 'complete blood count with platelet count', 'core', 'objective', null,
      array['cbc','tlc','platelets','platelet count','haemoglobin','wbc'], null),
    (fi_id, 'investigation', 7, 'renal and liver function', 'core', 'objective', 'Normal',
      array['creatinine','urea','lft','bilirubin','sgot','sgpt','transaminases'], null),
    (fi_id, 'investigation', 8, 'urine routine and culture', 'core', 'objective', null,
      array['urine routine','urinalysis','urine culture','urine microscopy','pus cells'], null),
    (fi_id, 'investigation', 9, 'chest imaging if respiratory symptoms', 'optional', 'objective', null,
      array['chest x-ray','cxr','consolidation','chest imaging'],
      '{"when": [{"type": "history", "pattern": "cough|breathless|sputum|chest pain|desaturation"}]}'::jsonb),
    (fi_id, 'investigation', 10, 'HIV test offered', 'core', 'plan', null,
      array['hiv','retroviral','elisa for hiv','hiv rapid'], null),
    (fi_id, 'investigation', 11, 'haemodynamic status / sepsis screen', 'core', 'objective', 'Haemodynamically stable',
      array['blood pressure','perfusion','shock','lactate','qsofa','sofa'], null),
    (fi_id, 'investigation', 12, 'VTE risk assessment', 'core', 'assessment', null,
      array['vte','dvt prophylaxis','thromboprophylaxis','enoxaparin','ted stockings'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),

    -- Review that only makes sense once time has passed.
    (fi_id, 'investigation', 13, 'antibiotic review / de-escalation at 48–72 hours', 'core', 'assessment', null,
      array['de-escalation','escalation','antibiotic review','culture result','sensitivity'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (fi_id, 'investigation', 14, 'platelet trend if thrombocytopenia', 'core', 'objective', null,
      array['platelet trend','repeat platelets','falling platelets','platelets improving'],
      '{"when": [{"type": "lab", "analyte": "platelets", "op": "lt", "value": 100}], "effect": "core"}'::jsonb),
    (fi_id, 'investigation', 15, 'defervescence / clinical response', 'core', 'assessment', null,
      array['afebrile','fever settled','defervesced','still spiking','fever trend'], null);

  -- ---------------------------------------------------------------------------
  -- 2. Diabetic ketoacidosis
  -- ---------------------------------------------------------------------------
  select id into dka_id from company_protocols
   where title = 'Diabetic Ketoacidosis — Checklist' limit 1;

  if dka_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Diabetic Ketoacidosis — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'dka', 'before_surgery', 'draft')
    returning id into dka_id;
  end if;

  delete from company_protocol_items where protocol_id = dka_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (dka_id, 'investigation', 1, 'venous blood gas — pH and bicarbonate', 'core', 'objective', null,
      array['vbg','abg','ph','bicarbonate','hco3','acidosis'], null),
    (dka_id, 'investigation', 2, 'anion gap', 'core', 'objective', null,
      array['anion gap','gap','hagma','gap closing','gap closed'], null),
    (dka_id, 'investigation', 3, 'blood or urine ketones', 'core', 'objective', null,
      array['ketones','beta hydroxybutyrate','urine ketones','serum ketones'], null),
    (dka_id, 'investigation', 4, 'serum potassium before starting insulin', 'core', 'objective', null,
      array['potassium','k+','serum k','hypokalaemia','hyperkalaemia'], null),
    (dka_id, 'investigation', 5, 'precipitant identified', 'core', 'assessment', null,
      array['precipitant','infection','missed insulin','noncompliance','new onset','sepsis','mi'], null),
    (dka_id, 'investigation', 6, 'fixed-rate insulin infusion started', 'core', 'plan', null,
      array['insulin infusion','insulin drip','fixed rate','actrapid infusion','regular insulin'], null),
    (dka_id, 'investigation', 7, 'hourly capillary glucose charting', 'core', 'objective', null,
      array['hourly grbs','hourly glucose','glucose chart','cbg hourly'], null),
    (dka_id, 'investigation', 8, 'fluid resuscitation and balance', 'core', 'plan', null,
      array['iv fluids','normal saline','fluid balance','ns','deficit replacement'], null),
    (dka_id, 'investigation', 9, 'repeat gas / gap at 2–4 hours', 'core', 'objective', null,
      array['repeat vbg','repeat gas','gap trend','ph trend'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 2}], "effect": "core"}'::jsonb),
    (dka_id, 'investigation', 10, 'transition to subcutaneous insulin with overlap', 'core', 'plan', null,
      array['subcutaneous insulin','basal bolus','overlap','stop infusion','sc insulin','glargine'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 12}]}'::jsonb),
    (dka_id, 'investigation', 11, 'oral intake re-established', 'core', 'objective', 'Tolerating orals',
      array['oral intake','eating','tolerating diet','npo'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 12}]}'::jsonb),
    (dka_id, 'investigation', 12, 'diabetes and sick-day education given', 'core', 'plan', null,
      array['diabetes education','sick day rules','insulin technique','never stop insulin'], null),
    (dka_id, 'investigation', 13, 'HbA1c sent', 'core', 'objective', null,
      array['hba1c','glycated haemoglobin'], null);

  -- ---------------------------------------------------------------------------
  -- 3. Hypertensive emergency
  -- ---------------------------------------------------------------------------
  select id into hte_id from company_protocols
   where title = 'Hypertensive Emergency — Checklist' limit 1;

  if hte_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Hypertensive Emergency — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'hypertensive_emergency', 'before_surgery', 'draft')
    returning id into hte_id;
  end if;

  delete from company_protocol_items where protocol_id = hte_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (hte_id, 'investigation', 1, 'blood pressure in both arms', 'core', 'objective', null,
      array['bp both arms','blood pressure','bp reading','sbp','dbp'], null),
    (hte_id, 'investigation', 2, 'fundus examination', 'core', 'objective', null,
      array['fundus','fundoscopy','retinopathy','papilloedema','grade 4 changes'], null),
    (hte_id, 'investigation', 3, 'ECG', 'core', 'objective', null,
      array['ecg','ekg','lvh','ischaemia','strain pattern'], null),
    (hte_id, 'investigation', 4, 'renal function and electrolytes', 'core', 'objective', 'Normal',
      array['creatinine','urea','electrolytes','potassium','egfr'], null),
    (hte_id, 'investigation', 5, 'urinalysis for protein and blood', 'core', 'objective', null,
      array['urine routine','proteinuria','haematuria','urine protein','acr'], null),
    (hte_id, 'investigation', 6, 'target-organ damage — assessment and grading', 'core', 'assessment', null,
      array['target organ','end organ','encephalopathy','lv failure','aki','stroke','dissection'], null),
    (hte_id, 'investigation', 7, 'urgency vs emergency documented', 'core', 'assessment', null,
      array['hypertensive urgency','hypertensive emergency','crisis'], null),
    (hte_id, 'investigation', 8, 'controlled BP reduction plan (target and rate)', 'core', 'plan', null,
      array['labetalol','ntg','nitroglycerin','gtn drip','target bp','percent reduction','oral agents'], null),
    (hte_id, 'investigation', 9, 'secondary hypertension screen if indicated', 'optional', 'plan', null,
      array['secondary hypertension','renal doppler','aldosterone','metanephrines','renal artery'],
      '{"when": [{"type": "history", "pattern": "young|resistant|hypokalaemia|snoring|osa|spells"}]}'::jsonb),
    (hte_id, 'investigation', 10, 'oral regimen at discharge and home BP plan', 'core', 'plan', null,
      array['discharge bp','home bp chart','amlodipine','telmisartan','follow up bp'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- 4. The picker rows.
--
-- A protocol only reaches a patient once somebody has set that patient's template_family. On
-- the ward list that is chosen from care_templates, so each medicine family that should be
-- offerable needs a row here. These carry no items of their own — the published protocol
-- supplies the checklist for the three above; the rest are labels a resident can attach so
-- the matching discharge template (once seeded) and any future checklist can find the patient.
--
-- ward_id null = the shared starter library, the same place the surgical templates live.
-- Idempotent by hand: the unique index is on (ward_id, family, variant, phase) and both
-- ward_id and variant are null, which Postgres treats as distinct — so ON CONFLICT would not
-- catch a second run.
-- ---------------------------------------------------------------------------

insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('febrile_illness',         null::text, 'before_surgery'::care_phase, 'Febrile illness / PUO'),
  ('sepsis',                  null,       'before_surgery',             'Sepsis / bacteraemia'),
  ('enteric_fever',           null,       'before_surgery',             'Enteric fever'),
  ('dengue',                  null,       'before_surgery',             'Dengue'),
  ('malaria',                 null,       'before_surgery',             'Malaria'),
  ('scrub_typhus',            null,       'before_surgery',             'Scrub typhus / rickettsia'),
  ('cap',                     null,       'before_surgery',             'Community-acquired pneumonia'),
  ('pyelonephritis',          null,       'before_surgery',             'UTI / pyelonephritis'),
  ('cellulitis',              null,       'before_surgery',             'Cellulitis / soft-tissue infection'),
  ('pulmonary_tb',            null,       'before_surgery',             'Pulmonary tuberculosis'),
  ('dka',                     null,       'before_surgery',             'Diabetic ketoacidosis'),
  ('hhs',                     null,       'before_surgery',             'Hyperosmolar hyperglycaemic state'),
  ('uncontrolled_diabetes',   null,       'before_surgery',             'Uncontrolled diabetes'),
  ('hypertensive_emergency',  null,       'before_surgery',             'Hypertensive emergency'),
  ('uncontrolled_hypertension', null,     'before_surgery',             'Uncontrolled hypertension'),
  ('anaemia_evaluation',      null,       'before_surgery',             'Anaemia for evaluation'),
  ('thrombocytopenia',        null,       'before_surgery',             'Thrombocytopenia / ITP'),
  ('pancytopenia',            null,       'before_surgery',             'Pancytopenia / marrow failure'),
  ('sle_flare',               null,       'before_surgery',             'SLE flare'),
  ('hiv_oi',                  null,       'before_surgery',             'HIV with opportunistic infection'),
  ('acute_febrile_encephalopathy', null,  'before_surgery',             'Acute febrile encephalopathy')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
