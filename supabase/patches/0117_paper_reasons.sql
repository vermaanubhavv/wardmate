-- One question, asked once a day: "What made you reach for paper today?"
--
-- The whole point of this phase is to replace the paper the resident still writes by hand,
-- and the resident is the only one who knows which piece of paper that was today. Free text,
-- a few words; a unit and a user so the answers can be read per unit. No patient is involved.
-- Read by the admin console (admin_paper_reasons), the same way as feedback_responses (0088).
--
-- Safe to run more than once.

begin;

create table if not exists paper_reasons (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  ward_id    uuid references wards (id) on delete set null,
  text       text not null check (length(btrim(text)) > 0),
  created_at timestamptz not null default now()
);

alter table paper_reasons enable row level security;

drop policy if exists paper_reasons_insert_own on paper_reasons;
create policy paper_reasons_insert_own on paper_reasons
  for insert to authenticated with check (user_id = auth.uid());

grant insert on paper_reasons to authenticated;

create or replace function admin_paper_reasons()
returns table (id uuid, created_at timestamptz, ward_name text, text text)
language plpgsql security definer set search_path = public as $$
begin
  if not admin_check() then return; end if;
  return query
    select r.id, r.created_at, w.name, r.text
    from paper_reasons r left join wards w on w.id = r.ward_id
    order by r.created_at desc;
end;
$$;
grant execute on function admin_paper_reasons() to authenticated;

notify pgrst, 'reload schema';

commit;
