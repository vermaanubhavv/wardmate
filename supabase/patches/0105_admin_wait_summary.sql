-- How long residents wait, read back for the admin console's Events tab.
--
-- The browser logs one `wait` event per thing a resident sits and watches — an AI draft, a
-- card save, Finalise, Print (lib/track.ts startWait): props { what, ms, ok }. No clinical value
-- is ever in it. This summarises the last 30 days per `what`: how many, the median and 90th
-- percentile in milliseconds, the slowest, and how many failed. Admin only, like every other
-- admin_* function (patch 0068).

begin;

create or replace function admin_wait_summary()
returns table (
  what      text,
  waits     bigint,
  people    bigint,
  p50_ms    integer,
  p90_ms    integer,
  max_ms    integer,
  failed    bigint,
  last_seen timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;

  return query
  select
    ev.props->>'what',
    count(*),
    count(distinct ev.actor_id),
    (percentile_cont(0.5) within group (order by (ev.props->>'ms')::numeric))::integer,
    (percentile_cont(0.9) within group (order by (ev.props->>'ms')::numeric))::integer,
    max((ev.props->>'ms')::numeric)::integer,
    count(*) filter (where ev.props->>'ok' = 'false'),
    max(ev.created_at)
  from app_events ev
  where ev.name = 'wait'
    and ev.created_at > now() - interval '30 days'
    and ev.props->>'what' is not null
    and jsonb_typeof(ev.props->'ms') = 'number'
  group by ev.props->>'what'
  order by 5 desc nulls last;
end;
$$;

grant execute on function admin_wait_summary() to authenticated;

commit;
