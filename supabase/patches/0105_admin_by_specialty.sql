-- Admin console: compare departments (wards.specialty, patch 0060).
--
-- 1. admin_funnel_by_specialty — admin_funnel's six steps, per department. A person's department
--    is the specialty of every unit they are a member of, so someone in a surgery unit and a
--    medicine unit counts under both. People in no unit appear once, under 'none'.
-- 2. admin_usage_friction_for(p_specialty) — admin_usage_friction (0102's version), restricted to
--    one department. A signal whose row carries a unit (rounds, register reads, patients, history
--    checks, discharge summaries) or a patient (entries, observations) is restricted by that
--    unit's specialty. Screen views and app events carry no unit, so they are restricted by the
--    person: someone who is a member of a unit in that department. p_specialty = 'none' means
--    people in no unit, matching the funnel.
--
-- admin_funnel() and admin_usage_friction() are left exactly as they are. Same SECURITY DEFINER
-- + admin_check() gate as 0068: a non-admin gets nothing, never an error. No clinical values.
--
-- Requires: 0060 (wards.specialty), 0100, 0102. Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- Helpers — "does this unit / patient / person belong to that department?"
-- Called only from the SECURITY DEFINER reports below, so not granted to anyone.
-- ---------------------------------------------------------------------------

create or replace function admin_ward_is(p_ward uuid, p_specialty text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (select 1 from wards w
                 where w.id = p_ward and coalesce(w.specialty, 'general_surgery') = p_specialty);
$$;

create or replace function admin_patient_is(p_patient uuid, p_specialty text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (select 1 from patients p join wards w on w.id = p.ward_id
                 where p.id = p_patient and coalesce(w.specialty, 'general_surgery') = p_specialty);
$$;

create or replace function admin_actor_is(p_user uuid, p_specialty text)
returns boolean
language sql
stable
set search_path = public
as $$
  select p_user is not null and case
    when p_specialty = 'none' then not exists (select 1 from ward_members m where m.user_id = p_user)
    else exists (select 1 from ward_members m join wards w on w.id = m.ward_id
                 where m.user_id = p_user and coalesce(w.specialty, 'general_surgery') = p_specialty)
  end;
$$;

revoke execute on function admin_ward_is(uuid, text) from public, anon, authenticated;
revoke execute on function admin_patient_is(uuid, text) from public, anon, authenticated;
revoke execute on function admin_actor_is(uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. Activation funnel, per department
-- ---------------------------------------------------------------------------

create or replace function admin_funnel_by_specialty()
returns table (specialty text, step int, label text, users bigint)
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
  ),
  dept as (
    select distinct m.user_id uid, coalesce(w.specialty, 'general_surgery') sp
    from ward_members m join wards w on w.id = m.ward_id
    union all
    select pr.id, 'none' from profiles pr
    where not exists (select 1 from ward_members m where m.user_id = pr.id)
  ),
  x as (select d.sp, u.* from dept d join u on u.id = d.uid)
  select x.sp, 1, 'Signed up', count(*) from x group by x.sp
  union all select x.sp, 2, 'Created or joined a unit', count(*) filter (where in_unit) from x group by x.sp
  union all select x.sp, 3, 'Added a patient', count(*) filter (where in_unit and added_patient) from x group by x.sp
  union all select x.sp, 4, 'Recorded a note or round', count(*) filter (where in_unit and added_patient and recorded) from x group by x.sp
  union all select x.sp, 5, 'Came back on another day', count(*) filter (where in_unit and added_patient and recorded and returned) from x group by x.sp
  union all select x.sp, 6, 'Still using it (last 14 days)', count(*) filter (where in_unit and added_patient and recorded and returned and recent) from x group by x.sp
  order by 1, 2;
end;
$$;

grant execute on function admin_funnel_by_specialty() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Friction seen during use, for one department — last 30 days
-- ---------------------------------------------------------------------------

create or replace function admin_usage_friction_for(p_specialty text)
returns table (
  area        text,
  signal      text,
  severity    text,   -- 'high' | 'medium' | 'low'
  occurrences bigint,
  out_of      bigint, -- the denominator, where one makes sense (else null)
  people      bigint,
  detail      text,
  last_seen   timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  since constant timestamptz := now() - interval '30 days';
begin
  if not admin_check() then return; end if;

  return query
  with views as (
    select actor_id, created_at, props->>'screen' screen
    from app_events where name = 'page_view' and created_at > since
      and admin_actor_is(actor_id, p_specialty)
  ),
  signals as (
    -- Dictation ----------------------------------------------------------------
    select 'Dictation' area, 'Notes the AI could not read' signal,
           count(*) filter (where e.extraction_error is not null) n,
           count(*) d,
           count(distinct e.author_id) filter (where e.extraction_error is not null) ppl,
           'Voice or photo notes that ended with an extraction error — the resident got nothing back.' detail,
           max(e.recorded_at) filter (where e.extraction_error is not null) last_at
    from entries e where e.recorded_at > since and e.source in ('voice', 'photo')
      and admin_patient_is(e.patient_id, p_specialty)
    union all
    select 'Dictation', 'Transcripts corrected by hand',
           count(*) filter (where e.edited_at is not null), count(*),
           count(distinct e.edited_by) filter (where e.edited_at is not null),
           'The speech engine misheard enough that someone retyped it. Check the Speech engine table for which model.',
           max(e.edited_at)
    from entries e where e.recorded_at > since and e.source = 'voice'
      and admin_patient_is(e.patient_id, p_specialty)
    union all
    select 'Dictation', 'Same patient re-dictated within 3 minutes',
           count(*), null::bigint, count(distinct e.author_id),
           'A second voice note on the same patient straight after the first — usually because the first came out wrong.',
           max(e.recorded_at)
    from entries e
    where e.recorded_at > since and e.source = 'voice'
      and admin_patient_is(e.patient_id, p_specialty)
      and exists (select 1 from entries e0
                  where e0.patient_id = e.patient_id and e0.author_id = e.author_id and e0.source = 'voice'
                    and e0.recorded_at < e.recorded_at and e0.recorded_at > e.recorded_at - interval '3 minutes')

    -- Ward round ----------------------------------------------------------------
    union all
    select 'Ward round', 'Round recordings started but never saved',
           greatest(0, s.n - coalesce(r.n, 0)), s.n, s.ppl,
           'Recording was started more times than a round dictation came back — lost audio, a failed upload, or given up mid-way.',
           s.last_at
    from (select count(*) n, count(distinct actor_id) ppl, max(created_at) last_at
          from app_events where name = 'round_recording_started' and created_at > since
            and admin_actor_is(actor_id, p_specialty)) s
    cross join (select count(*) n from round_dictations
                where created_at > since and admin_ward_is(ward_id, p_specialty)
                  and created_at > (select coalesce(min(created_at), now()) from app_events where name = 'round_recording_started')) r
    union all
    select 'Ward round', 'Round dictations thrown away',
           count(*) filter (where r.status = 'discarded'), count(*),
           count(distinct r.author_id) filter (where r.status = 'discarded'),
           'The bed-by-bed split was not trusted enough to apply.',
           max(r.created_at) filter (where r.status = 'discarded')
    from round_dictations r where r.created_at > since and admin_ward_is(r.ward_id, p_specialty)
    union all
    select 'Ward round', 'Round dictations left unapplied (>1 day)',
           count(*), null::bigint, count(distinct r.author_id),
           'Recorded, split, and never applied or discarded.',
           max(r.created_at)
    from round_dictations r where r.status = 'draft' and r.created_at > since and r.created_at < now() - interval '1 day'
      and admin_ward_is(r.ward_id, p_specialty)
    union all
    select 'Paper register', 'Register reads thrown away',
           count(*) filter (where g.status = 'discarded'), count(*),
           count(distinct g.author_id) filter (where g.status = 'discarded'),
           'A photographed register the resident did not accept.',
           max(g.created_at) filter (where g.status = 'discarded')
    from register_reads g where g.created_at > since and admin_ward_is(g.ward_id, p_specialty)

    -- Patients ------------------------------------------------------------------
    union all
    select 'Patients', 'Add patient opened, nothing saved',
           count(*), (select count(*) from (select distinct actor_id, created_at::date from views where screen = '/patients/new') t),
           count(distinct v.actor_id),
           'Days someone opened Add patient and no patient was created by them that day.',
           max(v.created_at)
    from (select distinct on (actor_id, created_at::date) actor_id, created_at
          from views where screen = '/patients/new' order by actor_id, created_at::date, created_at desc) v
    where not exists (select 1 from patients p where p.created_by = v.actor_id and p.created_at::date = v.created_at::date)
    union all
    select 'Patients', 'Add patient failed',
           count(*), null::bigint, count(distinct actor_id),
           'The save returned an error. The Activity tab (Problems) shows each reason.',
           max(created_at)
    from app_events where name = 'add_patient_failed' and created_at > since
      and admin_actor_is(actor_id, p_specialty)
    union all
    select 'Patients', 'Patients binned within a day of being created',
           count(*), null::bigint, count(distinct p.created_by),
           'Created and trashed almost at once — a mistake, a duplicate, or a test.',
           max(p.trashed_at)
    from patients p where p.created_at > since and p.trashed_at is not null and p.trashed_at < p.created_at + interval '1 day'
      and admin_ward_is(p.ward_id, p_specialty)

    -- Case history & history check ---------------------------------------------
    union all
    select 'Case history', 'Case history opened, nothing recorded',
           count(*), null::bigint, count(distinct v.actor_id),
           'Days someone opened New case history and recorded no case history that day.',
           max(v.created_at)
    from (select distinct on (actor_id, created_at::date) actor_id, created_at
          from views where screen = '/patients/:id/case-history/new' order by actor_id, created_at::date, created_at desc) v
    where not exists (select 1 from entries e where e.author_id = v.actor_id and e.is_case_history
                        and e.recorded_at::date = v.created_at::date)
    union all
    select 'Case history', 'History checks that failed',
           count(*) filter (where h.error is not null), count(*),
           count(distinct h.created_by) filter (where h.error is not null),
           'The AI history check returned an error instead of a result.',
           max(h.created_at) filter (where h.error is not null)
    from history_checks h where h.created_at > since and admin_ward_is(h.ward_id, p_specialty)

    -- Discharge -----------------------------------------------------------------
    union all
    select 'Discharge', 'Discharge screen opened, nothing started',
           count(*), null::bigint, count(distinct v.actor_id),
           'Days someone opened a discharge summary and neither started nor finalised one that day.',
           max(v.created_at)
    from (select distinct on (actor_id, created_at::date) actor_id, created_at
          from views where screen = '/patients/:id/discharge' order by actor_id, created_at::date, created_at desc) v
    where not exists (select 1 from discharge_summaries d
                      where (d.created_by = v.actor_id and d.created_at::date = v.created_at::date and discharge_worked_on(d))
                         or (d.finalised_by = v.actor_id and d.finalised_at::date = v.created_at::date)
                         or (d.created_by = v.actor_id and d.updated_at::date = v.created_at::date))
    union all
    select 'Discharge', 'Patients sent home without a finalised summary',
           count(*) filter (where not exists (select 1 from discharge_summaries d where d.patient_id = p.id and d.status = 'finalised')),
           count(*),
           count(distinct p.created_by) filter (where not exists (select 1 from discharge_summaries d where d.patient_id = p.id and d.status = 'finalised')),
           'Marked discharged with no finalised summary — either written elsewhere, or the summary flow was skipped.',
           max(p.discharged_at) filter (where not exists (select 1 from discharge_summaries d where d.patient_id = p.id and d.status = 'finalised'))
    from patients p where p.status = 'discharged' and p.discharged_at > since
      and admin_ward_is(p.ward_id, p_specialty)
    union all
    select 'Discharge', 'Discharge summaries worked on, then left (>3 days)',
           count(*), null::bigint, count(distinct d.created_by),
           'Someone edited or approved sections and has not come back for 3+ days. (AI drafts prepared by opening the Discharge tab are not counted.)',
           max(d.updated_at)
    from discharge_summaries d
    join patients p on p.id = d.patient_id
    where d.status = 'draft' and discharge_worked_on(d) and d.updated_at < now() - interval '3 days'
      and p.trashed_at is null and admin_ward_is(d.ward_id, p_specialty)

    -- Safety values -------------------------------------------------------------
    union all
    select 'Confirm values', 'Flagged values left unconfirmed (>2 days)',
           count(*) filter (where o.confirmed_at is null and o.recorded_at < now() - interval '2 days'),
           count(*), null::bigint,
           'Numbers, drugs and doses surfaced for a tap-to-confirm that nobody tapped.',
           max(o.recorded_at) filter (where o.confirmed_at is null)
    from observations o where o.needs_confirmation and o.recorded_at > since
      and admin_patient_is(o.patient_id, p_specialty)

    -- First session ---------------------------------------------------------------
    union all
    select 'Onboarding', 'Opened onboarding, never made or joined a unit',
           count(distinct v.actor_id), null::bigint, count(distinct v.actor_id),
           'Got as far as onboarding and stopped there.',
           max(v.created_at)
    from views v
    where v.screen = '/onboarding'
      and not exists (select 1 from ward_members m where m.user_id = v.actor_id)
  )
  select x.area, x.signal, x.sev, x.n, x.d, x.ppl, x.detail, x.last_at
  from (
    select s.*,
           case
             when s.d is not null and s.d >= 5 and s.n::numeric / s.d >= 0.3 then 'high'
             when s.n >= 10 or (s.d is not null and s.d >= 5 and s.n::numeric / s.d >= 0.15) then 'medium'
             else 'low'
           end sev
    from signals s
    where s.n > 0
  ) x
  order by case x.sev when 'high' then 0 when 'medium' then 1 else 2 end, x.n desc;
end;
$$;

grant execute on function admin_usage_friction_for(text) to authenticated;

notify pgrst, 'reload schema';
commit;
