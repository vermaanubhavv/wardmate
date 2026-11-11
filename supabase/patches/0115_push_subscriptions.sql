-- Web push: where a phone can be reached.
--
-- One row per browser/phone that has turned notifications on (app/unit/push-toggle.tsx). The
-- row IS the switch: turning notifications off deletes it, so there is no second flag to
-- fall out of step. What gets sent is deliberately narrow — a red job handed to you, and the
-- handover-time digest (app/api/cron/push) — and nothing in the payload names a patient.
--
-- Members read, write and delete only their own rows. The cron sender uses the service role.
--
-- Safe to run more than once.

begin;

create table if not exists push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

drop policy if exists push_subscriptions_own on push_subscriptions;
create policy push_subscriptions_own on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on push_subscriptions to authenticated;

commit;
