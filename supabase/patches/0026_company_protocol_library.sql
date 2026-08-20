-- Company-managed clinical protocol library.
--
-- A protocol is centrally authored and versioned. Ward members may read published material;
-- only named Company Protocol Publishers can create or change it. The patient-facing app will
-- present prompts for clinician review, never execute a treatment or order automatically.

begin;

create table if not exists protocol_publishers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

create or replace function is_protocol_publisher()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from protocol_publishers where user_id = auth.uid());
$$;

create table if not exists company_protocols (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  version text not null,
  source_name text not null,
  source_url text,
  template_family text,
  template_variant text,
  phase text not null default 'any' check (phase in ('any', 'before_surgery', 'after_surgery')),
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  review_on date,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  published_at timestamptz,
  published_by uuid references auth.users (id)
);

create table if not exists company_protocol_items (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references company_protocols (id) on delete cascade,
  position integer not null check (position > 0),
  prompt text not null check (length(btrim(prompt)) > 0),
  unique (protocol_id, position)
);

create index if not exists company_protocols_match_idx
  on company_protocols (status, template_family, template_variant, phase);

alter table protocol_publishers enable row level security;
alter table company_protocols enable row level security;
alter table company_protocol_items enable row level security;

create policy protocol_publishers_self_read on protocol_publishers for select
  using (user_id = auth.uid());
create policy company_protocols_read on company_protocols for select to authenticated
  using (status = 'published' or is_protocol_publisher());
create policy company_protocols_write on company_protocols for all to authenticated
  using (is_protocol_publisher()) with check (is_protocol_publisher());
create policy company_protocol_items_read on company_protocol_items for select to authenticated
  using (exists (select 1 from company_protocols p where p.id = protocol_id and (p.status = 'published' or is_protocol_publisher())));
create policy company_protocol_items_write on company_protocol_items for all to authenticated
  using (is_protocol_publisher()) with check (is_protocol_publisher());

grant select on protocol_publishers, company_protocols, company_protocol_items to authenticated;
grant insert, update, delete on company_protocols, company_protocol_items to authenticated;
grant execute on function is_protocol_publisher() to authenticated;

-- First publishers. This is idempotent and only grants access once the corresponding account
-- has signed in to WardMate at least once.
insert into protocol_publishers (user_id)
select id from auth.users where lower(email) in ('anubhavsinhmar@gmail.com', 'sarahsmjain@gmail.com')
on conflict (user_id) do nothing;

commit;
