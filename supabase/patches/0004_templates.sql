-- Templates: what information is EXPECTED for a given operation, before and after surgery.
--
-- The load-bearing distinction: a template says what is expected, never what is assumed. It
-- can say "for a lap chole after surgery you would normally mention drain output" and then
-- show that item as NOT RECORDED if you did not say it. It must never supply a value. The
-- rule that the app only ever holds what was actually said or photographed is unchanged —
-- templates only make an absence visible instead of silent.
--
-- Phase is derived, not stored: a patient with no surgery_date is before surgery, one with a
-- surgery_date is after it. So a patient moves from the pre-op template to the post-op one
-- automatically on the day you record their operation.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

begin;

create type care_phase as enum ('before_surgery', 'after_surgery');

create table care_templates (
  id        uuid primary key default gen_random_uuid(),

  -- Null ward_id means the shared starter library, visible to everyone. A ward-owned copy
  -- (ward_id set) overrides the shared one, so a unit can correct a template for itself
  -- without editing anybody else's.
  ward_id   uuid references wards (id) on delete cascade,

  family    text not null,      -- 'lap_chole', 'appendicectomy', 'hernia', 'perianal'
  variant   text,               -- 'acute', 'interval', 'inguinal', 'fistula', ... or null
  phase     care_phase not null,
  name      text not null,      -- what the resident sees: "Lap chole — after surgery"

  created_at timestamptz not null default now(),

  unique (ward_id, family, variant, phase)
);

create table care_template_items (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references care_templates (id) on delete cascade,

  -- The canonical label. The extraction step is told about these, so that when you mention
  -- one of them it is stored under exactly this name and can be matched back. This is the
  -- only reliable way to line up free speech with an expected list.
  label       text not null,

  -- Other things you might call it, matched case-insensitively as a fallback.
  aliases     text[] not null default '{}',

  -- Advisory grouping only, for ordering the screen. Deliberately plain text rather than the
  -- observations enum, because pre-op items (consent, fitness, fasting) are not clinical
  -- values and should not be forced into that vocabulary.
  kind        text not null default 'note',

  -- 'core' items are the ones whose absence is worth showing. 'optional' ones are listed as
  -- reminders but do not count as gaps — otherwise every patient shows a wall of red.
  importance  text not null default 'core' check (importance in ('core', 'optional')),

  position    int not null default 0,
  hint        text,               -- short reminder wording shown before you speak

  unique (template_id, label)
);

create index care_template_items_template_idx on care_template_items (template_id, position);

-- Which template a patient follows. Variant is separate so 'hernia' + 'inguinal' resolves to
-- the right one, and so a ward can add variants without new columns.
alter table patients add column if not exists template_family text;
alter table patients add column if not exists template_variant text;

-- Templates are reference data, readable by every signed-in doctor. Only ward-owned rows are
-- writable, and only by that ward's members — nobody can edit the shared library from the app.
alter table care_templates      enable row level security;
alter table care_template_items enable row level security;

create policy care_templates_read on care_templates for select
  using (ward_id is null or is_ward_member(ward_id));
create policy care_templates_write on care_templates for insert
  with check (ward_id is not null and is_ward_member(ward_id));
create policy care_templates_update on care_templates for update
  using (ward_id is not null and is_ward_member(ward_id))
  with check (ward_id is not null and is_ward_member(ward_id));

create policy care_template_items_read on care_template_items for select
  using (exists (
    select 1 from care_templates t
    where t.id = care_template_items.template_id
      and (t.ward_id is null or is_ward_member(t.ward_id))
  ));
create policy care_template_items_write on care_template_items for insert
  with check (exists (
    select 1 from care_templates t
    where t.id = care_template_items.template_id
      and t.ward_id is not null and is_ward_member(t.ward_id)
  ));
create policy care_template_items_update on care_template_items for update
  using (exists (
    select 1 from care_templates t
    where t.id = care_template_items.template_id
      and t.ward_id is not null and is_ward_member(t.ward_id)
  ));

grant select, insert, update on care_templates      to authenticated;
grant select, insert, update on care_template_items to authenticated;

commit;
