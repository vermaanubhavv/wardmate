-- Edits and deletes leave a trail; nothing on the record is hard-deleted any more.
--
-- Until now a value corrected by hand overwrote the old one and a deleted entry was gone,
-- cascade and all. For a record that is meant to replace the paper case sheet that is not
-- good enough: on paper a correction is struck through and initialled, and the struck-out
-- figure stays legible.
--
-- Three pieces, all at the database so every write path in the app is covered at once:
--
--   observation_history   append-only. One row per change to an observation — who, when,
--                         and the old and new snapshot — written by a trigger, never by the
--                         app. Members of the patient's ward may read it; nobody may write
--                         or alter it directly.
--
--   soft delete           entries and observations gain deleted_at / deleted_by. A BEFORE
--                         DELETE trigger turns the app's DELETE into an UPDATE that sets them
--                         (and, for an entry, marks its observations too). The read policies
--                         hide marked rows, so every screen and every security-invoker
--                         function stops seeing them without a code change. The one real
--                         delete left is the cascade from a purged patient (trash expiry,
--                         0029/0080): that arrives at trigger depth > 1 and is let through,
--                         so a patient's data still leaves the database on schedule.
--
--   edit returns to amber is app code (app/patients/[id]/actions.ts), not schema.
--
-- Admin-console functions that are security definer still count soft-deleted rows in
-- their totals; they are usage statistics, not the record.
--
-- Safe to run more than once.

begin;

alter table observations add column if not exists deleted_at timestamptz;
alter table observations add column if not exists deleted_by uuid references auth.users (id);
alter table entries      add column if not exists deleted_at timestamptz;
alter table entries      add column if not exists deleted_by uuid references auth.users (id);

-- ---------------------------------------------------------------------------
-- The trail
-- ---------------------------------------------------------------------------

create table if not exists observation_history (
  id             bigserial primary key,
  -- Plain uuids, not foreign keys: the trail must outlive a re-extraction that replaces the
  -- rows it describes. Only the patient link cascades, so a purged patient takes the trail
  -- with them.
  observation_id uuid not null,
  entry_id       uuid not null,
  patient_id     uuid not null references patients (id) on delete cascade,
  changed_by     uuid references auth.users (id),
  changed_at     timestamptz not null default now(),
  -- edit | confirm | done | undone | delete | update
  action         text not null,
  old            jsonb not null,
  new            jsonb not null
);

create index if not exists observation_history_patient_idx
  on observation_history (patient_id, changed_at desc);

alter table observation_history enable row level security;

drop policy if exists observation_history_read on observation_history;
create policy observation_history_read on observation_history for select using (
  exists (
    select 1 from patients p
    where p.id = observation_history.patient_id and is_ward_member(p.ward_id)
  )
);

-- select only. The trigger below runs as the table owner, so the app never needs insert.
grant select on observation_history to authenticated;

create or replace function observation_snapshot(o observations) returns jsonb
language sql immutable as $$
  select jsonb_build_object(
    'label', o.label,
    'value_text', o.value_text,
    'value_num', o.value_num,
    'unit', o.unit,
    'needs_confirmation', o.needs_confirmation,
    'confirmed_at', o.confirmed_at,
    'done_at', o.done_at,
    'urgency', o.urgency,
    'deleted_at', o.deleted_at
  )
$$;

create or replace function observations_record_history() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  act text;
begin
  -- Only the columns the snapshot covers count as a change; a touch to anything else is noise.
  if observation_snapshot(old) is not distinct from observation_snapshot(new) then
    return new;
  end if;

  if new.deleted_at is not null and old.deleted_at is null then
    act := 'delete';
  elsif (new.label, new.value_text, new.value_num, new.unit)
        is distinct from (old.label, old.value_text, old.value_num, old.unit) then
    act := 'edit';
  elsif new.confirmed_at is not null and old.confirmed_at is null then
    act := 'confirm';
  elsif new.done_at is not null and old.done_at is null then
    act := 'done';
  elsif new.done_at is null and old.done_at is not null then
    act := 'undone';
  else
    act := 'update';
  end if;

  insert into observation_history
    (observation_id, entry_id, patient_id, changed_by, action, old, new)
  values
    (new.id, new.entry_id, new.patient_id, auth.uid(), act,
     observation_snapshot(old), observation_snapshot(new));
  return new;
end;
$$;

drop trigger if exists observations_history on observations;
create trigger observations_history
  after update on observations
  for each row execute function observations_record_history();

-- ---------------------------------------------------------------------------
-- Soft delete
-- ---------------------------------------------------------------------------

create or replace function soft_delete_instead() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Depth 1 is the app's own DELETE. Deeper means a foreign-key cascade is doing it (a
  -- purged patient), and that one has to go through.
  if pg_trigger_depth() > 1 then
    return old;
  end if;

  if tg_table_name = 'entries' then
    update entries set deleted_at = now(), deleted_by = auth.uid()
      where id = old.id and deleted_at is null;
    update observations set deleted_at = now(), deleted_by = auth.uid()
      where entry_id = old.id and deleted_at is null;
  else
    update observations set deleted_at = now(), deleted_by = auth.uid()
      where id = old.id and deleted_at is null;
  end if;
  return null;
end;
$$;

drop trigger if exists entries_soft_delete on entries;
create trigger entries_soft_delete
  before delete on entries for each row execute function soft_delete_instead();

drop trigger if exists observations_soft_delete on observations;
create trigger observations_soft_delete
  before delete on observations for each row execute function soft_delete_instead();

-- Marked rows disappear from every read. Same shape as before plus the one condition.
drop policy if exists entries_read on entries;
create policy entries_read on entries for select using (
  deleted_at is null
  and exists (select 1 from patients p where p.id = entries.patient_id and is_ward_member(p.ward_id))
);

drop policy if exists observations_read on observations;
create policy observations_read on observations for select using (
  deleted_at is null
  and exists (select 1 from patients p where p.id = observations.patient_id and is_ward_member(p.ward_id))
);

drop policy if exists "hospital admins select entries" on entries;
create policy "hospital admins select entries" on entries for select using (
  deleted_at is null
  and exists (
    select 1 from patients p
    where p.id = entries.patient_id and ward_hospital_admin_access(p.ward_id)
  )
);

drop policy if exists "hospital admins select observations" on observations;
create policy "hospital admins select observations" on observations for select using (
  deleted_at is null
  and exists (
    select 1 from patients p
    where p.id = observations.patient_id and ward_hospital_admin_access(p.ward_id)
  )
);

commit;
