-- Admin console — one owner's cross-unit audit view: adoption, ward activity, feature usage,
-- friction points, a raw activity log, and a summary of the new client-side event stream.
--
-- WHY A NEW SET OF NARROW EXCEPTIONS. Same reasoning as patch 0065 (admin_ward_summary): every
-- normal screen runs as the calling doctor under RLS and can only ever see its own wards. An
-- owner's audit view is deliberately not that — it must count and read across EVERY ward. That
-- cannot be done as the calling user, so each function below is SECURITY DEFINER with the
-- ward-membership boundary replaced by ONE explicit admin check (admin_check()), never removed.
-- A non-admin who calls any of these gets an empty result, never an error — the same
-- "degrade, don't crash" as 0065, so poking the RPC reveals nothing.
--
-- WHAT THIS DOES NOT ADD. No role system. `profiles.is_admin` (added in 0065) stays a single
-- boolean an existing admin sets by hand in the SQL editor. No new patient columns, so
-- `current_patients` does not need rebuilding.
--
-- NEW TABLE: app_events. A lightweight, append-only stream of what screens get opened and what
-- features get used, written by the app as the signed-in doctor. It holds NO clinical values —
-- an event name, the path, an optional ward id, and a small `props` object the app controls.
-- Never put a patient value, a transcript, or a name in `props`.
--
-- Requires: 0065_admin_dashboard.sql (profiles.is_admin). Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- 1. The event stream
-- ---------------------------------------------------------------------------

create table if not exists app_events (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users (id) on delete set null,
  name       text not null,                 -- 'page_view', 'round_recording_started', …
  path       text,                          -- the route it happened on
  ward_id    uuid references wards (id) on delete set null,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_created_idx on app_events (created_at desc);
create index if not exists app_events_name_idx    on app_events (name, created_at desc);
create index if not exists app_events_actor_idx   on app_events (actor_id, created_at desc);

alter table app_events enable row level security;

-- A raw `create table` in the SQL editor carries none of Supabase's automatic role grants, and
-- the table privilege check runs BEFORE RLS — without this, every insert fails 42501 before a
-- policy is ever consulted. Same lesson as 0055 / 0059 / 0062.
grant select, insert on app_events to authenticated;

drop policy if exists "app_events: write own" on app_events;
create policy "app_events: write own"
  on app_events for insert to authenticated
  with check (actor_id = auth.uid());

-- Only an admin may read the stream back. Everyone else sees zero rows.
drop policy if exists "app_events: admin reads" on app_events;
create policy "app_events: admin reads"
  on app_events for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- ---------------------------------------------------------------------------
-- 2. The admin gate, once
-- ---------------------------------------------------------------------------

create or replace function admin_check()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin);
$$;

grant execute on function admin_check() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Overview — a single row of headline totals
-- ---------------------------------------------------------------------------

create or replace function admin_overview()
returns table (
  users               bigint,
  admins              bigint,
  wards_active        bigint,
  wards_archived      bigint,
  patients_active     bigint,
  patients_total      bigint,
  entries_total       bigint,
  voice_entries       bigint,
  photo_entries       bigint,
  round_dictations    bigint,
  discharges_draft    bigint,
  discharges_finalised bigint,
  signups_7d          bigint,
  signups_30d         bigint,
  active_users_7d     bigint,
  active_wards_7d     bigint,
  events_7d           bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  with active_actors as (
    select author_id as uid, recorded_at as at from entries
    union all
    select author_id, created_at from round_dictations
    union all
    select actor_id, created_at from app_events where actor_id is not null
  )
  select
    (select count(*) from profiles),
    (select count(*) from profiles where is_admin),
    (select count(*) from wards where archived_at is null),
    (select count(*) from wards where archived_at is not null),
    (select count(*) from patients where status = 'active'),
    (select count(*) from patients),
    (select count(*) from entries),
    (select count(*) from entries where source = 'voice'),
    (select count(*) from entries where source = 'photo'),
    (select count(*) from round_dictations),
    (select count(*) from discharge_summaries where status = 'draft'),
    (select count(*) from discharge_summaries where status = 'finalised'),
    (select count(*) from profiles where created_at > now() - interval '7 days'),
    (select count(*) from profiles where created_at > now() - interval '30 days'),
    (select count(distinct uid) from active_actors where at > now() - interval '7 days'),
    (select count(distinct ward_id) from (
        select ward_id, created_at from round_dictations
        union all select ward_id, created_at from app_events where ward_id is not null
        union all select p.ward_id, e.recorded_at from entries e join patients p on p.id = e.patient_id
     ) w where created_at > now() - interval '7 days'),
    (select count(*) from app_events where created_at > now() - interval '7 days');
end;
$$;

grant execute on function admin_overview() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Signups per week — last 12 weeks
-- ---------------------------------------------------------------------------

create or replace function admin_signups_weekly()
returns table (week date, signups bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select w::date, coalesce(c.n, 0)
  from generate_series(date_trunc('week', now()) - interval '11 weeks',
                       date_trunc('week', now()), interval '1 week') w
  left join (
    select date_trunc('week', created_at) wk, count(*) n
    from profiles group by 1
  ) c on c.wk = w
  order by w;
end;
$$;

grant execute on function admin_signups_weekly() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Per-user adoption
-- ---------------------------------------------------------------------------

create or replace function admin_users()
returns table (
  user_id           uuid,
  name              text,
  email             text,
  is_admin          boolean,
  joined_at         timestamptz,
  wards             bigint,
  patients_added    bigint,
  entries           bigint,
  voice_entries     bigint,
  round_dictations  bigint,
  discharges        bigint,
  last_active       timestamptz,
  days_since_active numeric,
  days_since_signup numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select
    pr.id,
    pr.display_name,
    au.email::text,
    pr.is_admin,
    pr.created_at,
    (select count(*) from ward_members m where m.user_id = pr.id),
    (select count(*) from patients p where p.created_by = pr.id),
    (select count(*) from entries e where e.author_id = pr.id),
    (select count(*) from entries e where e.author_id = pr.id and e.source = 'voice'),
    (select count(*) from round_dictations r where r.author_id = pr.id),
    (select count(*) from discharge_summaries d where d.created_by = pr.id),
    la.last_active,
    round(extract(epoch from now() - la.last_active) / 86400, 1),
    round(extract(epoch from now() - pr.created_at) / 86400, 1)
  from profiles pr
  left join auth.users au on au.id = pr.id
  left join lateral (
    select max(at) as last_active from (
      select max(recorded_at) at from entries where author_id = pr.id
      union all select max(created_at) from round_dictations where author_id = pr.id
      union all select max(created_at) from app_events where actor_id = pr.id
      union all select max(updated_at) from discharge_summaries where created_by = pr.id
    ) x
  ) la on true
  order by la.last_active desc nulls last;
end;
$$;

grant execute on function admin_users() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Per-ward activity
-- ---------------------------------------------------------------------------

create or replace function admin_ward_activity()
returns table (
  ward_id              uuid,
  ward_name            text,
  join_code            text,
  specialty            text,
  archived             boolean,
  members              bigint,
  active_patients      bigint,
  total_patients       bigint,
  entries_7d           bigint,
  entries_30d          bigint,
  round_dictations_30d bigint,
  round_discarded_30d  bigint,
  discharges_finalised bigint,
  last_activity        timestamptz,
  days_since_activity  numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select
    w.id,
    w.name,
    w.join_code,
    w.specialty,
    w.archived_at is not null,
    (select count(*) from ward_members m where m.ward_id = w.id),
    (select count(*) from patients p where p.ward_id = w.id and p.status = 'active'),
    (select count(*) from patients p where p.ward_id = w.id),
    (select count(*) from entries e join patients p on p.id = e.patient_id
       where p.ward_id = w.id and e.recorded_at > now() - interval '7 days'),
    (select count(*) from entries e join patients p on p.id = e.patient_id
       where p.ward_id = w.id and e.recorded_at > now() - interval '30 days'),
    (select count(*) from round_dictations r
       where r.ward_id = w.id and r.created_at > now() - interval '30 days'),
    (select count(*) from round_dictations r
       where r.ward_id = w.id and r.status = 'discarded' and r.created_at > now() - interval '30 days'),
    (select count(*) from discharge_summaries d where d.ward_id = w.id and d.status = 'finalised'),
    act.last_activity,
    round(extract(epoch from now() - act.last_activity) / 86400, 1)
  from wards w
  left join lateral (
    select max(at) as last_activity from (
      select max(e.recorded_at) at from entries e join patients p on p.id = e.patient_id where p.ward_id = w.id
      union all select max(created_at) from round_dictations where ward_id = w.id
      union all select max(created_at) from register_reads where ward_id = w.id
      union all select max(updated_at) from discharge_summaries where ward_id = w.id
      union all select max(created_at) from app_events where ward_id = w.id
      union all select max(added_at) from ward_members where ward_id = w.id
    ) x
  ) act on true
  order by act.last_activity desc nulls last;
end;
$$;

grant execute on function admin_ward_activity() to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Feature usage — a flat (feature, metric, count) table the page groups
-- ---------------------------------------------------------------------------

create or replace function admin_feature_usage()
returns table (feature text, metric text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select 'Dictation', 'Voice entries',   count(*) from entries where source = 'voice'
  union all
  select 'Dictation', 'Photo entries',   count(*) from entries where source = 'photo'
  union all
  select 'Dictation', 'Manual entries',  count(*) from entries where source = 'manual'
  union all
  select 'Dictation', 'Extraction errors', count(*) from entries where extraction_error is not null
  union all
  select 'Ward round', 'Applied',   count(*) from round_dictations where status = 'applied'
  union all
  select 'Ward round', 'Draft (unapplied)', count(*) from round_dictations where status = 'draft'
  union all
  select 'Ward round', 'Discarded', count(*) from round_dictations where status = 'discarded'
  union all
  select 'Paper register', 'Applied',   count(*) from register_reads where status = 'applied'
  union all
  select 'Paper register', 'Discarded', count(*) from register_reads where status = 'discarded'
  union all
  select 'Discharge summary', 'Draft',     count(*) from discharge_summaries where status = 'draft'
  union all
  select 'Discharge summary', 'Finalised', count(*) from discharge_summaries where status = 'finalised'
  union all
  select 'Value confirmation', 'Pending',   count(*) from observations where needs_confirmation and confirmed_at is null
  union all
  select 'Value confirmation', 'Confirmed', count(*) from observations where confirmed_at is not null;
end;
$$;

grant execute on function admin_feature_usage() to authenticated;

-- Speech engine split, kept separate because provider/model is a two-level breakdown.
create or replace function admin_stt_breakdown()
returns table (provider text, model text, entries bigint, errors bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select
    coalesce(stt_provider, '—'),
    coalesce(stt_model, '—'),
    count(*),
    count(*) filter (where extraction_error is not null)
  from entries
  where source = 'voice'
  group by 1, 2
  order by count(*) desc;
end;
$$;

grant execute on function admin_stt_breakdown() to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Friction — where people sign up or start and then stall
-- ---------------------------------------------------------------------------

create or replace function admin_friction()
returns table (
  category text,
  severity text,          -- 'high' | 'medium' | 'low'
  subject  text,
  detail   text,
  since    timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  -- Signed up, never dictated, and it has been more than 3 days.
  return query
  select
    'Quiet account', 'high',
    coalesce(pr.display_name, au.email::text, pr.id::text),
    'Signed up ' || round(extract(epoch from now() - pr.created_at) / 86400) || ' days ago, no dictations yet',
    pr.created_at
  from profiles pr
  left join auth.users au on au.id = pr.id
  where pr.created_at < now() - interval '3 days'
    and not exists (select 1 from entries e where e.author_id = pr.id)
    and not exists (select 1 from round_dictations r where r.author_id = pr.id);

  -- An active ward that has gone silent for two weeks or more.
  return query
  select
    'Cold unit', 'high', w.name,
    case when act.last_activity is null then 'No activity ever recorded'
         else 'Last activity ' || round(extract(epoch from now() - act.last_activity) / 86400) || ' days ago' end,
    act.last_activity
  from wards w
  left join lateral (
    select max(at) last_activity from (
      select max(e.recorded_at) at from entries e join patients p on p.id = e.patient_id where p.ward_id = w.id
      union all select max(created_at) from round_dictations where ward_id = w.id
      union all select max(updated_at) from discharge_summaries where ward_id = w.id
    ) x
  ) act on true
  where w.archived_at is null
    and (act.last_activity is null or act.last_activity < now() - interval '14 days')
    and w.created_at < now() - interval '14 days';

  -- A single-person unit that has patients but has not spread to a second user.
  return query
  select
    'Solo unit', 'medium', w.name,
    'One member, ' || (select count(*) from patients p where p.ward_id = w.id and p.status = 'active') || ' active patients — not shared with the team',
    w.created_at
  from wards w
  where w.archived_at is null
    and w.created_at < now() - interval '14 days'
    and (select count(*) from ward_members m where m.ward_id = w.id) = 1
    and exists (select 1 from patients p where p.ward_id = w.id and p.status = 'active');

  -- Round dictations recorded but thrown away — the split the resident did not trust.
  return query
  select
    'Round dictations discarded', 'medium', w.name,
    d.discarded || ' of ' || d.total || ' round dictations discarded (last 30 days)',
    null::timestamptz
  from wards w
  join lateral (
    select
      count(*) total,
      count(*) filter (where status = 'discarded') discarded
    from round_dictations r
    where r.ward_id = w.id and r.created_at > now() - interval '30 days'
  ) d on true
  where d.total >= 3 and d.discarded::numeric / d.total >= 0.3;

  -- Discharge summaries opened and left in draft for over a week.
  return query
  select
    'Discharge stuck in draft', 'medium',
    w.name,
    (select count(*) from discharge_summaries d2
       where d2.ward_id = w.id and d2.status = 'draft' and d2.updated_at < now() - interval '7 days')
      || ' discharge summaries in draft > 7 days',
    null::timestamptz
  from wards w
  where exists (
    select 1 from discharge_summaries d
    where d.ward_id = w.id and d.status = 'draft' and d.updated_at < now() - interval '7 days'
  );

  -- Dangerous values surfaced for a tap-to-confirm and never confirmed.
  return query
  select
    'Unconfirmed values', 'low', w.name,
    count(*) || ' flagged values never confirmed (older than 2 days)',
    min(o.recorded_at)
  from observations o
  join patients p on p.id = o.patient_id
  join wards w on w.id = p.ward_id
  where o.needs_confirmation and o.confirmed_at is null
    and o.recorded_at < now() - interval '2 days'
  group by w.name
  having count(*) > 0;
end;
$$;

grant execute on function admin_friction() to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Raw activity log — a unified reverse-chronological feed
-- ---------------------------------------------------------------------------

create or replace function admin_activity_log(p_limit int default 150)
returns table (at timestamptz, actor text, kind text, summary text, ward text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select * from (
    select e.recorded_at,
           coalesce(pr.display_name, 'someone'),
           'dictation',
           'Dictation (' || e.source || ')' || case when e.extraction_error is not null then ' — extraction error' else '' end,
           w.name
    from entries e
    join patients p on p.id = e.patient_id
    join wards w on w.id = p.ward_id
    left join profiles pr on pr.id = e.author_id

    union all
    select r.created_at, coalesce(pr.display_name, 'someone'), 'round',
           'Round dictation ' || r.status, w.name
    from round_dictations r
    join wards w on w.id = r.ward_id
    left join profiles pr on pr.id = r.author_id

    union all
    select d.finalised_at, coalesce(pr.display_name, 'someone'), 'discharge',
           'Discharge summary finalised', w.name
    from discharge_summaries d
    join wards w on w.id = d.ward_id
    left join profiles pr on pr.id = d.finalised_by
    where d.finalised_at is not null

    union all
    select w.created_at, coalesce(pr.display_name, 'someone'), 'unit',
           'Unit created', w.name
    from wards w
    left join profiles pr on pr.id = w.owner_id

    union all
    select m.added_at, coalesce(pr.display_name, 'someone'), 'member',
           'Joined unit', w.name
    from ward_members m
    join wards w on w.id = m.ward_id
    left join profiles pr on pr.id = m.user_id

    union all
    select ev.created_at, coalesce(pr.display_name, 'someone'), 'event',
           ev.name || coalesce(' · ' || (ev.props->>'label'), ''), w.name
    from app_events ev
    left join wards w on w.id = ev.ward_id
    left join profiles pr on pr.id = ev.actor_id
  ) feed(at, actor, kind, summary, ward)
  where feed.at is not null
  order by feed.at desc
  limit greatest(1, least(p_limit, 500));
end;
$$;

grant execute on function admin_activity_log(int) to authenticated;

-- ---------------------------------------------------------------------------
-- 10. Event stream summary — one row per event name
-- ---------------------------------------------------------------------------

create or replace function admin_event_summary()
returns table (
  name       text,
  events     bigint,
  actors     bigint,
  events_7d  bigint,
  first_seen timestamptz,
  last_seen  timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select
    ev.name,
    count(*),
    count(distinct ev.actor_id),
    count(*) filter (where ev.created_at > now() - interval '7 days'),
    min(ev.created_at),
    max(ev.created_at)
  from app_events ev
  group by ev.name
  order by count(*) desc;
end;
$$;

grant execute on function admin_event_summary() to authenticated;

commit;

-- Reminder: you become an admin the same way as in patch 0065 —
--
--   update profiles set is_admin = true
--    where id = (select id from auth.users where email = 'you@example.com');
