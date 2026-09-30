-- Admin insights — the numbers behind the console's "what to work on next" page.
--
-- Three read-only reports, each SECURITY DEFINER behind admin_check() exactly like 0068: a
-- non-admin gets an empty result, never an error. No new tables, no clinical values read —
-- only who did something and when, plus the `page_view` screen label from app_events.
--
-- Requires: 0068_admin_console.sql (app_events, admin_check). Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- 1. Weekly active people — last 12 weeks, with new signups alongside
-- ---------------------------------------------------------------------------

create or replace function admin_weekly_active()
returns table (week date, active_users bigint, new_users bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  with weeks as (
    select generate_series(date_trunc('week', now()) - interval '11 weeks',
                           date_trunc('week', now()), interval '1 week') w
  ),
  act as (
    select distinct uid, date_trunc('week', at) wk from (
      select author_id uid, recorded_at at from entries
      union all select author_id, created_at from round_dictations
      union all select actor_id, created_at from app_events where actor_id is not null
    ) x where at >= (select min(w) from weeks)
  )
  select
    weeks.w::date,
    (select count(*) from act where act.wk = weeks.w),
    (select count(*) from profiles p where date_trunc('week', p.created_at) = weeks.w)
  from weeks
  order by weeks.w;
end;
$$;

grant execute on function admin_weekly_active() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Activation funnel — each step counts people who also passed every step above it
-- ---------------------------------------------------------------------------

create or replace function admin_funnel()
returns table (step int, label text, users bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  with act as (
    select uid, count(distinct at::date) days, max(at) last_at from (
      select author_id uid, recorded_at at from entries
      union all select author_id, created_at from round_dictations
      union all select actor_id, created_at from app_events where actor_id is not null
    ) x group by uid
  ),
  u as (
    select
      pr.id,
      pr.id in (select m.user_id from ward_members m) in_unit,
      pr.id in (select p.created_by from patients p where p.created_by is not null) added_patient,
      (pr.id in (select e.author_id from entries e where e.author_id is not null)
        or pr.id in (select r.author_id from round_dictations r where r.author_id is not null)) recorded,
      coalesce(act.days, 0) >= 2 returned,
      coalesce(act.last_at > now() - interval '14 days', false) recent
    from profiles pr
    left join act on act.uid = pr.id
  )
  select 1, 'Signed up', count(*) from u
  union all select 2, 'Created or joined a unit', count(*) filter (where in_unit) from u
  union all select 3, 'Added a patient', count(*) filter (where in_unit and added_patient) from u
  union all select 4, 'Recorded a note or round', count(*) filter (where in_unit and added_patient and recorded) from u
  union all select 5, 'Came back on another day', count(*) filter (where in_unit and added_patient and recorded and returned) from u
  union all select 6, 'Still using it (last 14 days)', count(*) filter (where in_unit and added_patient and recorded and returned and recent) from u
  order by 1;
end;
$$;

grant execute on function admin_funnel() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Screen usage — page_view grouped by the normalised screen path
-- ---------------------------------------------------------------------------

create or replace function admin_screen_usage()
returns table (screen text, views bigint, people bigint, views_30d bigint, people_30d bigint, last_seen timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select
    coalesce(ev.props->>'screen', ev.path, '—'),
    count(*),
    count(distinct ev.actor_id),
    count(*) filter (where ev.created_at > now() - interval '30 days'),
    count(distinct ev.actor_id) filter (where ev.created_at > now() - interval '30 days'),
    max(ev.created_at)
  from app_events ev
  where ev.name = 'page_view'
  group by 1
  order by count(*) desc;
end;
$$;

grant execute on function admin_screen_usage() to authenticated;

notify pgrst, 'reload schema';
commit;
