-- Automatic outreach emails: one short, personal check-in per person, sent from the database.
--
-- Three emails, each sent at most once per address (outreach_log's primary key enforces it):
--   waitlist  someone joined the waitlist and has no account yet
--   quiet     signed up 3+ days ago and has never recorded an entry, round or discharge
--   active    first entry / round / discharge was 7+ days ago — ask what works and what doesn't
--
-- A daily pg_cron job (04:30 UTC = 10:00 IST) calls send_outreach(), which posts everything due
-- in ONE request to Resend's batch endpoint via pg_net, so Resend's per-second rate limit is
-- never hit however many sign-ups arrive in a day. Replies go to Anubhav's inbox (reply_to).
--
-- The Resend key lives in Supabase Vault, never in this repo. Until it is added, send_outreach()
-- does nothing, so this patch is safe to push first:
--   select vault.create_secret('<resend api key>', 'resend_api_key');
-- Preview who would be emailed next, without sending:  select * from outreach_due();
--
-- Everyone already in profiles / waitlist when this runs was emailed by hand on 2026-09-26, so
-- they are backfilled as sent — the automation only ever writes to people who join after it.
--
-- Idempotent + self-transaction-wrapped per repo convention.

begin;

create extension if not exists pg_net with schema extensions;

create table if not exists outreach_log (
  email       text not null,
  kind        text not null check (kind in ('waitlist', 'quiet', 'active')),
  sent_at     timestamptz not null default now(),
  -- pg_net request id; the response sits in net._http_response for ~6 hours.
  request_id  bigint,
  primary key (email, kind)
);

-- Holds addresses. No policies: only the definer functions below ever touch it.
alter table outreach_log enable row level security;

insert into outreach_log (email, kind)
select lower(au.email), k.kind
from profiles pr
join auth.users au on au.id = pr.id
cross join (values ('waitlist'), ('quiet'), ('active')) k(kind)
where au.email is not null
on conflict do nothing;

insert into outreach_log (email, kind)
select lower(w.email), k.kind
from waitlist w
cross join (values ('waitlist'), ('quiet'), ('active')) k(kind)
on conflict do nothing;

-- "Hi Dr Priya" from "Dr. priya sharma"; "Hi Doctor" when no usable name is on file.
create or replace function outreach_greeting(raw_name text)
returns text
language sql
immutable
as $$
  select coalesce(
    'Hi Dr ' || initcap(nullif(split_part(trim(regexp_replace(coalesce(raw_name, ''), '^\s*dr\.?\s*', '', 'i')), ' ', 1), '')),
    'Hi Doctor'
  );
$$;

create or replace function outreach_due()
returns table (kind text, email text, greeting text, department text)
language sql
stable
security definer
set search_path = public
as $$
  with users as (
    select
      lower(au.email) as email,
      pr.display_name,
      pr.created_at,
      least(
        (select min(recorded_at) from entries where author_id = pr.id),
        (select min(created_at) from round_dictations where author_id = pr.id),
        (select min(created_at) from discharge_summaries where created_by = pr.id)
      ) as first_used
    from profiles pr
    join auth.users au on au.id = pr.id
    where au.email is not null and not pr.is_admin
  )
  select d.* from (
    select 'waitlist'::text as kind, lower(w.email) as email, outreach_greeting(w.name) as greeting,
           nullif(trim(regexp_replace(coalesce(w.department, ''), '\s*\(.*\)', '')), '') as department
    from waitlist w
    where not exists (select 1 from users u where u.email = lower(w.email))
    union all
    select 'quiet', u.email, outreach_greeting(u.display_name), null
    from users u
    where u.first_used is null and u.created_at < now() - interval '3 days'
    union all
    select 'active', u.email, outreach_greeting(u.display_name), null
    from users u
    where u.first_used < now() - interval '7 days'
  ) d
  where not exists (select 1 from outreach_log l where l.email = d.email and l.kind = d.kind)
$$;

create or replace function send_outreach()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  api_key text;
  due     jsonb;
  req     bigint;
  footer  constant text := E'\n\nThanks,\nAnubhav\nWardMate · wardmate.in';
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  if api_key is null then
    raise notice 'send_outreach: no resend_api_key in Vault, nothing sent';
    return 0;
  end if;

  -- Resend's batch endpoint takes at most 100 emails; anything beyond goes out tomorrow.
  select jsonb_agg(row) into due from (
    select jsonb_build_object(
      'kind', d.kind,
      'from', 'Anubhav from WardMate <anubhav@wardmate.in>',
      'reply_to', 'anubhavsinhmar@gmail.com',
      'to', jsonb_build_array(d.email),
      'subject', case d.kind
        when 'waitlist' then 'Thanks for joining the WardMate waitlist'
        when 'quiet'    then 'Can I help you get started with WardMate?'
        else                 'Quick question about WardMate'
      end,
      'text', d.greeting || E',\n\n' || case d.kind
        when 'waitlist' then
          E'I''m Anubhav, a surgery resident and the person building WardMate. Thanks for joining the waitlist.\n\n'
          || E'I''d love to understand your ward a little better:\n'
          || '1. On a typical ' || coalesce(d.department || ' ', '') || 'ward day, what eats most of your time: round notes, handovers, discharges, or something else?' || E'\n'
          || E'2. What made you sign up? What would you want WardMate to do for you?\n\n'
          || 'Just reply to this email, even a line or two helps. And if there''s anything I can help with in the meantime, tell me.'
        when 'quiet' then
          E'I''m Anubhav, a surgery resident and the person building WardMate. Thanks for signing up. It looks like you haven''t recorded a note or a round yet, so I wanted to check in.\n\n'
          || E'Could you tell me:\n'
          || E'1. What held you back: setup, not sure how it fits your rounds, no time, or something else?\n'
          || E'2. What were you hoping WardMate would help with when you signed up?\n\n'
          || 'If it helps, I''m happy to do a 10-minute call and set up your unit with you. Just reply to this email.'
        else
          E'I''m Anubhav, a surgery resident and the person building WardMate. Thank you for using it on your ward, it genuinely helps to know it''s getting real use.\n\n'
          || E'I''d love to hear how it''s going:\n'
          || E'1. What''s the one thing WardMate does that actually saves you time?\n'
          || E'2. Where does it get in your way, or feel slow or wrong?\n'
          || E'3. Is there anything you still do outside the app that you wish it handled?\n\n'
          || 'If anything is broken or confusing, just reply here and I''ll fix it or walk you through it. Happy to jump on a quick call too.'
      end || footer
    ) as row
    from outreach_due() d
    limit 100
  ) x;

  if due is null then return 0; end if;

  req := net.http_post(
    url     := 'https://api.resend.com/emails/batch',
    body    := (select jsonb_agg(e - 'kind') from jsonb_array_elements(due) e),
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json')
  );

  -- ponytail: logged as sent when queued, so a failed batch is not retried (at-most-once, never
  -- a double email). Check net._http_response for request_id within ~6h if a day looks quiet.
  insert into outreach_log (email, kind, request_id)
  select e->'to'->>0, e->>'kind', req from jsonb_array_elements(due) e
  on conflict do nothing;

  return jsonb_array_length(due);
end;
$$;

-- Addresses and the Resend key: nobody but the cron job (running as postgres) calls these.
revoke all on function outreach_due() from public, anon, authenticated;
revoke all on function send_outreach() from public, anon, authenticated;

commit;

do $$
declare existing_job bigint;
begin
  if not exists (select 1 from pg_namespace where nspname = 'cron') then
    raise exception 'Enable the pg_cron extension in Supabase, then run this patch again.';
  end if;

  select jobid into existing_job from cron.job where jobname = 'send-outreach-emails';
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule('send-outreach-emails', '30 4 * * *', 'select public.send_outreach();');
end;
$$;
