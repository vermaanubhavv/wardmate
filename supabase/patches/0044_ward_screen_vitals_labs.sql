-- Adds each patient's latest vitals reading and latest-per-test labs to ward_screen(), so the
-- ward list can flag a critical value without a second round trip per patient.
--
-- Deliberately returns raw observations, not a verdict. Whether 77% or a heart rate of 10 counts
-- as critical is decided in TypeScript by the exact same lib/vital-ranges.ts and
-- lib/lab-ranges.ts the patient page already uses — see supabase/patches/0037 onward for why
-- that logic lives there and not in SQL: it needs the patient's sex, the ward's own accumulated
-- lab ranges, and the report's own printed range, none of which belong duplicated into a
-- database function that would then need to agree with the TypeScript forever.
--
-- Safe to run more than once.

begin;

create or replace function ward_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    select current_ward_id from profiles limit 1
  ),
  w as (
    select * from wards
    where archived_at is null
    order by (id = (select current_ward_id from me)) desc nulls last, created_at
    limit 1
  ),
  p as (
    select * from current_patients
    where ward_id = (select id from w) and status = 'active'
  ),
  obs as (
    select
      patient_id,
      count(*) filter (where needs_confirmation and confirmed_at is null) as unconfirmed,
      count(*) filter (where kind = 'plan' and done_at is null) as open_tasks
    from observations
    where patient_id in (select id from p)
    group by patient_id
  ),
  ent as (
    select patient_id, count(*) as entries
    from entries
    where patient_id in (select id from p)
    group by patient_id
  ),
  -- Every vital said in the same breath as the patient's most recent one — the same reading
  -- app/patients/[id]/page.tsx's VitalsPanel groups on, so the ward list and the patient page
  -- can never show a different "latest" from each other.
  vit as (
    select o.patient_id, jsonb_agg(jsonb_build_object(
      'label', o.label, 'value_text', o.value_text, 'recorded_at', o.recorded_at
    )) as vitals
    from observations o
    where o.patient_id in (select id from p)
      and o.kind = 'vital'
      and o.recorded_at = (
        select max(o2.recorded_at) from observations o2
        where o2.patient_id = o.patient_id and o2.kind = 'vital'
      )
    group by o.patient_id
  ),
  -- One row per test, the most recent result for it — a stale critical value from a week ago
  -- must not keep flagging a patient whose repeat came back normal.
  latest_lab as (
    select distinct on (patient_id, lower(label))
      patient_id, label, value_text, ref_low, ref_high, ref_text, recorded_at
    from observations
    where patient_id in (select id from p) and kind = 'lab'
    order by patient_id, lower(label), recorded_at desc
  ),
  lab as (
    select patient_id, jsonb_agg(jsonb_build_object(
      'label', label, 'value_text', value_text,
      'ref_low', ref_low, 'ref_high', ref_high, 'ref_text', ref_text,
      'recorded_at', recorded_at
    )) as labs
    from latest_lab
    group by patient_id
  )
  select jsonb_build_object(
    'ward', (
      select jsonb_build_object(
        'id', id, 'name', name, 'owner_id', owner_id,
        'join_code', join_code, 'letterhead', letterhead
      ) from w
    ),
    'patients', coalesce((
      select jsonb_agg(
        to_jsonb(p) || jsonb_build_object(
          'unconfirmed_count', coalesce(obs.unconfirmed, 0),
          'open_task_count',   coalesce(obs.open_tasks, 0),
          'entry_count',       coalesce(ent.entries, 0),
          'vitals',            coalesce(vit.vitals, '[]'::jsonb),
          'labs',              coalesce(lab.labs, '[]'::jsonb)
        )
      )
      from p
      left join obs on obs.patient_id = p.id
      left join ent on ent.patient_id = p.id
      left join vit on vit.patient_id = p.id
      left join lab on lab.patient_id = p.id
    ), '[]'::jsonb),
    'removed_count', (
      select count(*) from patients
      where ward_id = (select id from w) and status = 'discharged'
    ),
    'procedures', coalesce((
      select jsonb_agg(jsonb_build_object('family', family, 'variant', variant, 'name', name))
      from care_templates where phase = 'after_surgery'
    ), '[]'::jsonb)
  );
$$;

grant execute on function ward_screen() to authenticated;

commit;
