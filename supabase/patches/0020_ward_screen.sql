-- The whole ward list, in one trip.
--
-- Measured from the server, every query costs about 220ms whatever it asks for — auth 233,
-- profiles 221, wards 230, patients 218, observations 215, entries 223, templates 221. Uniform
-- cost regardless of complexity means the price is the journey, not the work, and the only
-- lever left is making fewer journeys. The ward list was making six.
--
-- SECURITY INVOKER, which is the whole point: this runs as the doctor who called it, so every
-- table it touches is filtered by exactly the same row policies as before. It sees their
-- profile row because the policy says id = auth.uid(); it sees a ward because they are a
-- member of it. Nothing here grants any access — it only asks for what six separate queries
-- were already asking for, in one breath. A SECURITY DEFINER version would have been faster to
-- write and would have quietly handed every ward in the database to anybody who called it.
--
-- The counts are now counted BY the database rather than by the app. The old code fetched
-- every observation row and every entry row for the ward, over the wire, to count them in
-- JavaScript — which grows with every round recorded, forever. count(*) filter does it where
-- the data already is, and returns two integers per patient.
--
-- Bed order is deliberately NOT done here. The app sorts beds naturally, so that SW-2 comes
-- before SW-10, and Postgres would sort them as text.
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
    -- Row security restricts profiles to the caller's own row, so this needs no where clause
    -- and no auth call from the app to work out whose row to ask for.
    select current_ward_id from profiles limit 1
  ),
  w as (
    -- The chosen unit first, the oldest as the fallback, resolved in one pass rather than by
    -- asking, finding nothing, and asking again.
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
          'entry_count',       coalesce(ent.entries, 0)
        )
      )
      from p
      left join obs on obs.patient_id = p.id
      left join ent on ent.patient_id = p.id
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
