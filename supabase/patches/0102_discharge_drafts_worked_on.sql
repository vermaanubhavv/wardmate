-- Discharge drafts: stop counting AI warm-ups as work left unfinished.
--
-- Adds discharge_worked_on() and redefines the five admin reports that counted drafts
-- (0068 overview, feature usage, friction; 0101 usage friction, activity feed) to use it.
-- The usage-friction "stuck in draft" signal is replaced by two sharper ones: patients sent
-- home without a finalised summary, and drafts someone worked on and then left.
-- Same signatures, same admin_check() gate. Safe to run more than once.

begin;

-- A discharge summary someone actually worked on. Opening the patient's Discharge tab pre-writes
-- the three AI sections (app/patients/[id]/discharge-tab.tsx), which creates a draft row nobody
-- has touched; counting those made the console report 14 "stuck" drafts when 12 were warm-ups.
-- Worked on = finalised, or any hand-filled section, or an AI section approved or edited.
-- ponytail: an edited-but-unapproved investigations list alone reads as a warm-up (its source
-- lives per item); approve-or-edit anything else and it counts.
create or replace function discharge_worked_on(d discharge_summaries)
returns boolean
language sql
stable
set search_path = public
as $$
  select d.status = 'finalised'
      -- Unsaved sections hold JSON null, not SQL NULL, so each is unwrapped first.
      or coalesce(nullif(d.encounter, 'null'), nullif(d.diagnoses, 'null'), nullif(d.procedures, 'null'),
                  nullif(d.histopathology, 'null'), nullif(d.medications, 'null'),
                  nullif(d.condition_at_discharge, 'null'), nullif(d.primary_care_actions, 'null'),
                  nullif(d.patient_actions, 'null'), nullif(d.advice, 'null'),
                  nullif(d.red_flags, 'null'), nullif(d.authentication, 'null')) is not null
      or coalesce(d.clinical_course->>'approvedAt', d.indication_for_admission->>'approvedAt',
                  d.relevant_investigations->>'approvedAt') is not null
      or coalesce(d.clinical_course->>'source', 'ai') <> 'ai'
      or coalesce(d.indication_for_admission->>'source', 'ai') <> 'ai';
$$;

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
    (select count(*) from discharge_summaries d where d.status = 'draft' and discharge_worked_on(d)),
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
  select 'Discharge summary', 'Draft (worked on)', count(*) from discharge_summaries d where d.status = 'draft' and discharge_worked_on(d)
  union all
  select 'Discharge summary', 'AI draft prepared, not worked on', count(*) from discharge_summaries d where d.status = 'draft' and not discharge_worked_on(d)
  union all
  select 'Discharge summary', 'Finalised', count(*) from discharge_summaries where status = 'finalised'
  union all
  select 'Value confirmation', 'Pending',   count(*) from observations where needs_confirmation and confirmed_at is null
  union all
  select 'Value confirmation', 'Confirmed', count(*) from observations where confirmed_at is not null;
end;
$$;

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
       where d2.ward_id = w.id and d2.status = 'draft' and discharge_worked_on(d2) and d2.updated_at < now() - interval '7 days')
      || ' discharge summaries in draft > 7 days',
    null::timestamptz
  from wards w
  where exists (
    select 1 from discharge_summaries d
    where d.ward_id = w.id and d.status = 'draft' and discharge_worked_on(d) and d.updated_at < now() - interval '7 days'
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

create or replace function admin_usage_friction()
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
    union all
    select 'Dictation', 'Transcripts corrected by hand',
           count(*) filter (where e.edited_at is not null), count(*),
           count(distinct e.edited_by) filter (where e.edited_at is not null),
           'The speech engine misheard enough that someone retyped it. Check the Speech engine table for which model.',
           max(e.edited_at)
    from entries e where e.recorded_at > since and e.source = 'voice'
    union all
    select 'Dictation', 'Same patient re-dictated within 3 minutes',
           count(*), null::bigint, count(distinct e.author_id),
           'A second voice note on the same patient straight after the first — usually because the first came out wrong.',
           max(e.recorded_at)
    from entries e
    where e.recorded_at > since and e.source = 'voice'
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
          from app_events where name = 'round_recording_started' and created_at > since) s
    cross join (select count(*) n from round_dictations
                where created_at > since
                  and created_at > (select coalesce(min(created_at), now()) from app_events where name = 'round_recording_started')) r
    union all
    select 'Ward round', 'Round dictations thrown away',
           count(*) filter (where r.status = 'discarded'), count(*),
           count(distinct r.author_id) filter (where r.status = 'discarded'),
           'The bed-by-bed split was not trusted enough to apply.',
           max(r.created_at) filter (where r.status = 'discarded')
    from round_dictations r where r.created_at > since
    union all
    select 'Ward round', 'Round dictations left unapplied (>1 day)',
           count(*), null::bigint, count(distinct r.author_id),
           'Recorded, split, and never applied or discarded.',
           max(r.created_at)
    from round_dictations r where r.status = 'draft' and r.created_at > since and r.created_at < now() - interval '1 day'
    union all
    select 'Paper register', 'Register reads thrown away',
           count(*) filter (where g.status = 'discarded'), count(*),
           count(distinct g.author_id) filter (where g.status = 'discarded'),
           'A photographed register the resident did not accept.',
           max(g.created_at) filter (where g.status = 'discarded')
    from register_reads g where g.created_at > since

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
    union all
    select 'Patients', 'Patients binned within a day of being created',
           count(*), null::bigint, count(distinct p.created_by),
           'Created and trashed almost at once — a mistake, a duplicate, or a test.',
           max(p.trashed_at)
    from patients p where p.created_at > since and p.trashed_at is not null and p.trashed_at < p.created_at + interval '1 day'

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
    from history_checks h where h.created_at > since

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
    union all
    select 'Discharge', 'Discharge summaries worked on, then left (>3 days)',
           count(*), null::bigint, count(distinct d.created_by),
           'Someone edited or approved sections and has not come back for 3+ days. (AI drafts prepared by opening the Discharge tab are not counted.)',
           max(d.updated_at)
    from discharge_summaries d
    join patients p on p.id = d.patient_id
    where d.status = 'draft' and discharge_worked_on(d) and d.updated_at < now() - interval '3 days'
      and p.trashed_at is null

    -- Safety values -------------------------------------------------------------
    union all
    select 'Confirm values', 'Flagged values left unconfirmed (>2 days)',
           count(*) filter (where o.confirmed_at is null and o.recorded_at < now() - interval '2 days'),
           count(*), null::bigint,
           'Numbers, drugs and doses surfaced for a tap-to-confirm that nobody tapped.',
           max(o.recorded_at) filter (where o.confirmed_at is null)
    from observations o where o.needs_confirmation and o.recorded_at > since

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

create or replace function admin_activity_feed(
  p_limit int default 200,
  p_kind  text default null,
  p_actor uuid default null,
  p_ward  uuid default null,
  p_views boolean default false
)
returns table (at timestamptz, actor_id uuid, actor text, ward_id uuid, ward text, kind text, summary text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select f.at, f.actor_id, coalesce(pr.display_name, 'someone'), f.ward_id, w.name, f.kind, f.summary
  from (
    select p.created_at at, p.created_by actor_id, p.ward_id, 'patient' kind, 'Created a patient' summary
    from patients p
    union all
    select p.discharged_at, null::uuid, p.ward_id, 'patient', 'Discharged a patient'
    from patients p where p.discharged_at is not null
    union all
    select p.trashed_at, null::uuid, p.ward_id, 'patient', 'Moved a patient to Trash'
    from patients p where p.trashed_at is not null

    union all
    select e.recorded_at, e.author_id, p.ward_id,
           case when e.extraction_error is not null then 'problem' else 'note' end,
           case
             when e.extraction_error is not null then 'A note could not be read (extraction failed)'
             when e.is_case_history then 'Recorded a case history'
             when e.source = 'voice' then 'Added a voice note'
             when e.source = 'photo' then 'Added a photo (lab report / paper)'
             else 'Typed a note'
           end
    from entries e join patients p on p.id = e.patient_id
    union all
    select e.edited_at, e.edited_by, p.ward_id, 'note', 'Corrected a transcript by hand'
    from entries e join patients p on p.id = e.patient_id where e.edited_at is not null

    union all
    select r.created_at, r.author_id, r.ward_id, 'round',
           case r.status when 'applied' then 'Dictated a ward round (applied)'
                         when 'discarded' then 'Dictated a ward round, then discarded it'
                         else 'Dictated a ward round (not yet applied)' end
    from round_dictations r
    union all
    select g.created_at, g.author_id, g.ward_id, 'register',
           case g.status when 'applied' then 'Read the paper register (applied)'
                         when 'discarded' then 'Read the paper register, then discarded it'
                         else 'Read the paper register (not yet applied)' end
    from register_reads g

    union all
    select d.created_at, d.created_by, d.ward_id, 'discharge',
           case when discharge_worked_on(d) then 'Started a discharge summary'
                else 'Opened the Discharge tab (AI first draft prepared)' end
    from discharge_summaries d
    union all
    select d.finalised_at, d.finalised_by, d.ward_id, 'discharge', 'Finalised a discharge summary'
    from discharge_summaries d where d.finalised_at is not null

    union all
    select h.created_at, h.created_by, h.ward_id,
           case when h.error is not null then 'problem' else 'history' end,
           case when h.error is not null then 'History check failed' else 'Ran a history check' end
    from history_checks h

    union all
    select w2.created_at, w2.owner_id, w2.id, 'unit', 'Created a unit'
    from wards w2
    union all
    select m.added_at, m.user_id, m.ward_id, 'unit', 'Joined a unit'
    from ward_members m
    -- The owner is added as a member when the unit is created; that is not a join.
    where not exists (select 1 from wards w3 where w3.id = m.ward_id and w3.owner_id = m.user_id)

    union all
    select ev.created_at, ev.actor_id, ev.ward_id,
           case when ev.name = 'page_view' then 'view'
                when ev.name like '%failed%' or ev.name like '%error%' then 'problem'
                else 'feature' end,
           -- The page turns names into words; props carry a screen or a reason, never a value.
           ev.name || coalesce(' · ' || coalesce(ev.props->>'screen', ev.props->>'reason', ev.props->>'label'), '')
    from app_events ev
    -- patient_added duplicates the patients row above.
    where ev.name <> 'patient_added'
  ) f
  left join profiles pr on pr.id = f.actor_id
  left join wards w on w.id = f.ward_id
  where f.at is not null
    and (p_views or f.kind <> 'view' or p_kind = 'view')
    and (p_kind is null or f.kind = p_kind)
    and (p_actor is null or f.actor_id = p_actor)
    and (p_ward is null or f.ward_id = p_ward)
  order by f.at desc
  limit greatest(1, least(p_limit, 1000));
end;
$$;

notify pgrst, 'reload schema';
commit;
