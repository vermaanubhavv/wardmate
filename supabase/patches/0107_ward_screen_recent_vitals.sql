-- Each vital's own latest reading reaches the ward alarms.
--
-- ward_screen() as patch 0106 left it, plus 'vitals_recent': every vital recorded in the 24
-- hours before the patient's latest reading. The existing 'vitals' key (the latest set only)
-- is unchanged; lib/ward-flags.ts prefers vitals_recent and keeps each vital's newest value,
-- so an RR or GCS taken in an earlier round still raises its flag when the later set left it
-- out.
--
-- Additive: one new key on each patient; every existing key is unchanged. Safe to run more
-- than once. Requires 0106_ward_screen_creatinine_history.sql.

begin;

create or replace function ward_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    select current_ward_id from profiles where id = auth.uid() limit 1
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
  -- Every vital of the 24 hours before the patient's latest reading, newest first. 'vitals'
  -- above is only the latest set, so a 6am RR or GCS left out of the 8am set never reached
  -- the ward alarms; lib/ward-flags.ts takes each vital's own newest value from this. Bounded
  -- to a day from the latest reading, so yesterday's numbers never raise today's alarm.
  vit_recent as (
    select o.patient_id, jsonb_agg(jsonb_build_object(
      'label', o.label, 'value_text', o.value_text, 'recorded_at', o.recorded_at
    ) order by o.recorded_at desc) as vitals_recent
    from observations o
    join (
      select patient_id, max(recorded_at) as latest
      from observations
      where patient_id in (select id from p) and kind = 'vital'
      group by patient_id
    ) m on m.patient_id = o.patient_id
    where o.kind = 'vital'
      and o.recorded_at > m.latest - interval '24 hours'
    group by o.patient_id
  ),
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
  ),
  -- Every creatinine of the last 8 days, newest first: NICE NG148's AKI criteria compare the
  -- latest result with the ones before it (a rise of 26 micromol/L within 48 hours, or 50% within
  -- 7 days), which the latest-per-test list above cannot. The labels are lib/lab-ranges.ts's
  -- creatinine aliases, so "creatine kinase" or "creatinine clearance" never count.
  cre as (
    select patient_id, jsonb_agg(jsonb_build_object(
      'value_text', value_text, 'recorded_at', recorded_at
    ) order by recorded_at desc) as creatinine
    from observations
    where patient_id in (select id from p)
      and kind = 'lab'
      and recorded_at > now() - interval '8 days'
      and lower(trim(label)) ~ '^((s|sr|serum)\.? ?)?creatinine$|^cr$'
    group by patient_id
  )
  select jsonb_build_object(
    'ward', (
      select jsonb_build_object(
        'id', id, 'name', name, 'owner_id', owner_id,
        'join_code', join_code, 'letterhead', letterhead,
        'specialty', specialty
      ) from w
    ),
    'patients', coalesce((
      select jsonb_agg(
        to_jsonb(p) || jsonb_build_object(
          'unconfirmed_count', coalesce(obs.unconfirmed, 0),
          'open_task_count',   coalesce(obs.open_tasks, 0),
          'entry_count',       coalesce(ent.entries, 0),
          'vitals',            coalesce(vit.vitals, '[]'::jsonb),
          'labs',              coalesce(lab.labs, '[]'::jsonb),
          'creatinine_7d',     coalesce(cre.creatinine, '[]'::jsonb),
          'vitals_recent',     coalesce(vit_recent.vitals_recent, '[]'::jsonb)
        )
      )
      from p
      left join obs on obs.patient_id = p.id
      left join ent on ent.patient_id = p.id
      left join vit on vit.patient_id = p.id
      left join lab on lab.patient_id = p.id
      left join cre on cre.patient_id = p.id
      left join vit_recent on vit_recent.patient_id = p.id
    ), '[]'::jsonb),
    'removed_count', (
      select count(*) from patients
      where ward_id = (select id from w) and status = 'discharged'
    ),
    -- Every checklist row, WITH its phase, rather than only the after-surgery ones. Which
    -- phase a unit's picker offers is now the specialty's call (pack.pickerPhase) and the
    -- filtering happens in lib/ward-screen.ts. A surgical unit still sees exactly the same
    -- list it always did.
    'procedures', coalesce((
      select jsonb_agg(jsonb_build_object(
        'family', family, 'variant', variant, 'name', name, 'phase', phase
      ))
      from care_templates
    ), '[]'::jsonb)
  );
$$;

grant execute on function ward_screen() to authenticated;

notify pgrst, 'reload schema';
commit;
