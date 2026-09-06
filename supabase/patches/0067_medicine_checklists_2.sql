-- Internal medicine — second checklist tranche: suspected VTE, and dengue warning signs.
--
-- WHY THESE TWO. VTE ties directly to the Wells DVT / Wells PE scores added alongside this
-- patch (lib/scoring/definitions/wells-dvt.v1.ts, wells-pe.v1.ts) — the checklist is the
-- workflow half, the score is the calculation half. Dengue warning signs was named back in
-- docs/specialty-packs.md §2a as "better modelled as a checklist trigger than a score" and is
-- built here as exactly that.
--
-- Also appends ONE new item to the existing DKA checklist from patch 0064 — "severity graded" —
-- so the checklist and the new DKA-severity score (lib/scoring/definitions/dka-severity.v1.ts)
-- point at each other. This is an INSERT guarded by NOT EXISTS, not a delete-and-rebuild of
-- that checklist, so it cannot disturb anything a unit has already customised on the other 13.
--
-- SCOPING AND STATUS — same as 0064. Protocols seeded 'draft': invisible to residents until
-- published. Publish alongside 0064's set with:
--
--   update company_protocols set status = 'published', published_at = now()
--    where title in ('Suspected VTE — Checklist', 'Dengue — Warning Signs Checklist');
--
-- NOT CLINICALLY SIGNED OFF. Requires: 0064_medicine_checklists.sql. Safe to run more than once.

begin;

do $$
declare
  vte_id uuid;
  dengue_id uuid;
  dka_id uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Suspected VTE
  -- ---------------------------------------------------------------------------
  select id into vte_id from company_protocols
   where title = 'Suspected VTE — Checklist' limit 1;

  if vte_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Suspected VTE — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'vte_suspected', 'before_surgery', 'draft')
    returning id into vte_id;
  end if;

  delete from company_protocol_items where protocol_id = vte_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (vte_id, 'investigation', 1, 'clinical probability documented (Wells score)', 'core', 'assessment', null,
      array['wells score','wells dvt','wells pe','pretest probability','clinical probability'], null),
    (vte_id, 'investigation', 2, 'D-dimer sent, if the score calls for one', 'core', 'objective', null,
      array['d-dimer','ddimer','d dimer'], null),
    (vte_id, 'investigation', 3, 'imaging ordered — compression ultrasound (DVT) or CTPA (PE)', 'core', 'plan', null,
      array['compression ultrasound','doppler','ctpa','ct pulmonary angiography','v/q scan'], null),
    (vte_id, 'investigation', 4, 'bleeding risk considered before anticoagulating', 'core', 'assessment', null,
      array['bleeding risk','has-bled','contraindication to anticoagulation','platelet count'], null),
    (vte_id, 'investigation', 5, 'anticoagulation decision and dose documented', 'core', 'plan', null,
      array['anticoagulation started','heparin','lmwh','enoxaparin','doac','apixaban','rivaroxaban','warfarin','not anticoagulated'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 4}], "effect": "core"}'::jsonb),
    (vte_id, 'investigation', 6, 'renal function checked before dosing (LMWH / DOAC)', 'core', 'objective', null,
      array['creatinine','egfr','renal function'], null),
    (vte_id, 'investigation', 7, 'source / provoking factor identified', 'optional', 'assessment', null,
      array['provoked','unprovoked','immobilisation','malignancy screen','surgery','ocp','pregnancy'], null),
    (vte_id, 'investigation', 8, 'follow-up and duration of anticoagulation planned', 'core', 'plan', null,
      array['duration of anticoagulation','follow up','opd follow up','inr monitoring'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 2. Dengue — warning signs (WHO 2009 classification)
  -- ---------------------------------------------------------------------------
  select id into dengue_id from company_protocols
   where title = 'Dengue — Warning Signs Checklist' limit 1;

  if dengue_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Dengue — Warning Signs Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'dengue', 'before_surgery', 'draft')
    returning id into dengue_id;
  end if;

  delete from company_protocol_items where protocol_id = dengue_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (dengue_id, 'investigation', 1, 'day of illness tracked (day of fever, not hospital day)', 'core', 'subjective', null,
      array['day of fever','dof','day of illness'], null),
    (dengue_id, 'investigation', 2, 'NS1 / serology sent', 'core', 'objective', null,
      array['ns1','dengue igm','dengue igg','dengue serology'], null),
    (dengue_id, 'investigation', 3, 'daily platelet count and trend', 'core', 'objective', null,
      array['platelet count','platelet trend','falling platelets'], null),
    (dengue_id, 'investigation', 4, 'haematocrit / packed cell volume trend', 'core', 'objective', null,
      array['haematocrit','hct','pcv','hemoconcentration'], null),
    (dengue_id, 'investigation', 5, 'warning signs assessed — abdominal pain, persistent vomiting, mucosal bleeding, lethargy/restlessness, liver enlargement, rising haematocrit with falling platelets', 'core', 'assessment', 'No warning signs',
      array['abdominal pain','persistent vomiting','mucosal bleeding','gum bleeding','lethargy','restlessness','hepatomegaly','warning signs'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (dengue_id, 'investigation', 6, 'fluid plan per phase (febrile / critical / recovery)', 'core', 'plan', null,
      array['fluid plan','iv fluids','fluid chart','critical phase','defervescence'], null),
    (dengue_id, 'investigation', 7, 'NSAIDs / aspirin / intramuscular injections avoided', 'core', 'plan', 'NSAIDs avoided',
      array['nsaids avoided','no diclofenac','no ibuprofen','no im injection','avoid aspirin'], null),
    (dengue_id, 'investigation', 8, 'signs of shock excluded (pulse pressure, capillary refill, cold extremities)', 'core', 'objective', 'No signs of shock',
      array['pulse pressure','capillary refill','cold extremities','narrow pulse pressure','dengue shock syndrome'],
      '{"when": [{"type": "history", "pattern": "warning sign|restless|lethargy|bleeding"}], "effect": "core"}'::jsonb),
    (dengue_id, 'investigation', 9, 'platelet transfusion threshold discussed if very low / bleeding', 'optional', 'plan', null,
      array['platelet transfusion','sdp','rdp','prophylactic platelets'],
      '{"when": [{"type": "lab", "analyte": "platelets", "op": "lt", "value": 10000}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 3. One appended item on the existing DKA checklist (patch 0064) — ties it to the new
  --    DKA-severity score. Guarded so this cannot duplicate on a re-run or disturb the other 13.
  -- ---------------------------------------------------------------------------
  select id into dka_id from company_protocols
   where title = 'Diabetic Ketoacidosis — Checklist' limit 1;

  if dka_id is not null and not exists (
    select 1 from company_protocol_items
     where protocol_id = dka_id and prompt = 'severity graded (mild / moderate / severe)'
  ) then
    insert into company_protocol_items
      (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
    values
      (dka_id, 'investigation', 14, 'severity graded (mild / moderate / severe)', 'core', 'assessment', null,
        array['dka severity','mild dka','moderate dka','severe dka'], null);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. The one new picker row this tranche needs. Dengue already has a row from patch 0064.
-- ---------------------------------------------------------------------------

insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, 'vte_suspected', null::text, 'before_surgery'::care_phase, 'Suspected VTE'
where not exists (
  select 1 from care_templates c
  where c.ward_id is null and c.family = 'vte_suspected' and c.variant is null
    and c.phase = 'before_surgery'
);

commit;
