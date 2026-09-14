-- Fix: "column reference \"ward_id\" is ambiguous" on the admin console's Units tab.
--
-- ROOT CAUSE. admin_ward_activity() (patch 0068) declares `RETURNS TABLE (ward_id uuid, ...)`.
-- PL/pgSQL implicitly creates a variable named after every output column, in scope for the
-- WHOLE function body — so a bare `ward_id` inside any query in this function is ambiguous
-- between that variable and an actual table's `ward_id` column, even in an unrelated nested
-- subquery. The five `union all ... where ward_id = w.id` lines in the lateral "last activity"
-- subquery never qualified which `ward_id` they meant.
--
-- Every other admin_*() function is fine: admin_friction() has the same-looking lines but its
-- RETURNS TABLE has no `ward_id` column, so there is no variable to collide with.
-- admin_ward_summary() (patch 0065) does return a `ward_id` column too, but it never has a bare
-- `ward_id` reference — every comparison is already written `p.ward_id = w.id` — so it was never
-- affected. This patch changes nothing about ward_summary; it only re-defines ward_activity.
--
-- FIX. Table-qualify every `ward_id` reference inside the lateral subquery. Nothing else about
-- the function changes — same signature, same columns, same logic.
--
-- Requires: 0068_admin_console.sql. Safe to run more than once (create or replace).

begin;

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
      union all select max(rd.created_at) from round_dictations rd where rd.ward_id = w.id
      union all select max(rr.created_at) from register_reads rr where rr.ward_id = w.id
      union all select max(ds.updated_at) from discharge_summaries ds where ds.ward_id = w.id
      union all select max(ae.created_at) from app_events ae where ae.ward_id = w.id
      union all select max(wm.added_at) from ward_members wm where wm.ward_id = w.id
    ) x
  ) act on true
  order by act.last_activity desc nulls last;
end;
$$;

grant execute on function admin_ward_activity() to authenticated;

commit;
