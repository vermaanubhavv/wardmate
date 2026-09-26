-- Feedback outreach is a small, private delivery ledger. It prevents duplicate messages,
-- records failures for retry, and stores unsubscribes. Only the server's service-role cron
-- reads or writes it; no client is granted access.

begin;

create table if not exists feedback_email_outreach (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  status          text not null default 'processing'
                  check (status in ('processing', 'sent', 'failed', 'unsubscribed')),
  delivery_id     uuid not null default gen_random_uuid(),
  attempts        integer not null default 0 check (attempts >= 0),
  last_attempt_at timestamptz,
  sent_at         timestamptz,
  unsubscribed_at timestamptz,
  provider_id     text,
  error           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table feedback_email_outreach enable row level security;

-- Atomically claims up to 100 eligible profiles. A failed or stranded processing job becomes
-- eligible again after one hour; Vercel does not retry failed cron invocations on its own.
create or replace function claim_feedback_email_jobs(p_limit integer default 100)
returns table (user_id uuid, email text, display_name text, delivery_id uuid)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if p_limit < 1 or p_limit > 100 then
    raise exception 'p_limit must be between 1 and 100';
  end if;

  return query
  with eligible as (
    select p.id, au.email, p.display_name
    from profiles p
    join auth.users au on au.id = p.id
    left join feedback_email_outreach f on f.user_id = p.id
    where p.is_admin = false
      and p.created_at <= now() - interval '24 hours'
      and au.email is not null
      and (
        f.user_id is null
        or (f.status = 'failed' and f.last_attempt_at < now() - interval '1 hour')
        or (f.status = 'processing' and f.last_attempt_at < now() - interval '1 hour')
      )
    order by p.created_at asc
    limit p_limit
    for update of p skip locked
  ), claimed as (
    insert into feedback_email_outreach (user_id, status, attempts, last_attempt_at, updated_at)
    select id, 'processing', 1, now(), now() from eligible
    on conflict (user_id) do update
      set status = 'processing',
          attempts = feedback_email_outreach.attempts + 1,
          last_attempt_at = now(),
          updated_at = now(),
          error = null
      where feedback_email_outreach.status in ('failed', 'processing')
    returning feedback_email_outreach.user_id, feedback_email_outreach.delivery_id
  )
  select c.user_id, e.email::text, e.display_name, c.delivery_id
  from claimed c
  join eligible e on e.id = c.user_id;
end;
$$;

revoke all on table feedback_email_outreach from anon, authenticated;
revoke all on function claim_feedback_email_jobs(integer) from public;
grant select, insert, update on table feedback_email_outreach to service_role;
grant execute on function claim_feedback_email_jobs(integer) to service_role;

notify pgrst, 'reload schema';

commit;
