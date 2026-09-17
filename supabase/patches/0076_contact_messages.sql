-- The "Contact us" form on /home. No session required, same shape as the waitlist sign-up:
-- an anonymous visitor posts the form and RLS allows the insert for the anon role.
--
-- Unlike the waitlist table (created by hand, then patched in 0059 to fix missing grants and
-- a silently-skipped `if not exists`), this table is created here with its grants and RLS set
-- up from the start — see 0059_waitlist_grants.sql for exactly what goes wrong when that step
-- is skipped.
--
-- Anon gets insert only, not select: a visitor can send a message but not read anyone else's.
-- Reading them back is an authenticated-only job (an admin page, if one gets built later).

begin;

create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "Anyone can send a contact message" on contact_messages;
create policy "Anyone can send a contact message"
  on contact_messages for insert to anon, authenticated
  with check (true);

grant insert on contact_messages to anon, authenticated;
grant select on contact_messages to authenticated;

notify pgrst, 'reload schema';

commit;
