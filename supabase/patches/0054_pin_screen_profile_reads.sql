-- Pin the profile read in ward_screen() and home_screen() to the calling user.
--
-- THE BUG. Both functions resolve "which unit am I looking at" from
--
--     with me as (select ... current_ward_id from profiles limit 1)
--
-- with no `where` clause. That was correct when they were written: the only profiles policy
-- was self-read, so row security already restricted the result to one row — the caller's.
--
-- Patch 0018 then added `profiles_ward_read`, which lets any unit member read every
-- co-member's profile row. From that point on, once a doctor joins a shared unit the
-- unfiltered `select ... from profiles limit 1` returns an ARBITRARY member's row, so
-- `current_ward_id` — and in home_screen the doctor's name/designation — resolve to whoever
-- Postgres happened to return first. Symptom: the app is stuck showing the wrong unit and
-- setting your own `current_ward_id` has no effect, because the function never reads your row.
--
-- THE FIX. Add `where id = auth.uid()` to the `me` CTE in both functions. Nothing else about
-- either function changes — same body, same `security invoker`, same grants, same output
-- shape. This is a straight re-`create or replace`.
--
-- Requires: 0044_ward_screen_vitals_labs.sql, 0023_home_screen.sql.
-- Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- ward_screen() — body identical to 0044 except the pinned `me` CTE.
-- ---------------------------------------------------------------------------

create or replace function ward_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    -- Pinned: profiles_ward_read (0018) exposes co-members' rows on a shared unit.
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

-- ---------------------------------------------------------------------------
-- home_screen() — body identical to 0023 except the pinned `me` CTE.
-- ---------------------------------------------------------------------------

create or replace function home_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    -- Pinned: profiles_ward_read (0018) exposes co-members' rows on a shared unit, so an
    -- unfiltered read returned an arbitrary member's name / current_ward_id.
    select display_name, designation, department, current_ward_id
    from profiles where id = auth.uid() limit 1
  ),
  w as (
    select * from wards
    where archived_at is null
    order by (id = (select current_ward_id from me)) desc nulls last, created_at
    limit 1
  ),
  counts as (
    select
      count(*) filter (where location = 'ward')      as ward,
      count(*) filter (where location = 'icu')       as icu,
      count(*) filter (where location = 'emergency') as emergency,
      count(*)                                       as total
    from patients
    where ward_id = (select id from w) and status = 'active'
  )
  select jsonb_build_object(
    'doctor', (
      select jsonb_build_object(
        'display_name', display_name, 'designation', designation, 'department', department
      ) from me
    ),
    'ward', (select jsonb_build_object('id', id, 'name', name) from w),
    'counts', (
      select jsonb_build_object(
        'ward', ward, 'icu', icu, 'emergency', emergency, 'total', total
      ) from counts
    )
  );
$$;

grant execute on function home_screen() to authenticated;

commit;
