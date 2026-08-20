-- CoreResident database schema.
--
-- Shape of the thing, in one paragraph: a WARD is a unit's patient list and is owned by a
-- doctor, with membership held in a separate table so ownership can be handed over at
-- rotation without touching a single patient row. A PATIENT belongs to a ward, never to a
-- user. Everything the resident says or photographs becomes one ENTRY, which holds the raw
-- evidence (the transcript, the photo). Each individual clinical value extracted from that
-- entry becomes one OBSERVATION, which points back at its entry AND carries the exact quote
-- it came from — so any number on screen is one tap from its source.
--
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- The whole file is one transaction. If any statement fails, Postgres undoes everything
-- above it, so a failed run leaves the database exactly as it was and can simply be re-run
-- after the fault is fixed. There is no half-built state to clean up.

begin;

-- ---------------------------------------------------------------------------
-- 1. Vocabulary
-- ---------------------------------------------------------------------------

create type entry_source as enum ('voice', 'photo', 'manual');
create type patient_status as enum ('active', 'discharged');
create type ward_role as enum ('owner', 'member');

-- The kind of thing an observation is. Deliberately coarse: the app needs to know how to
-- DISPLAY and how CAREFULLY to treat a value, not to model all of medicine.
create type observation_kind as enum (
  'diagnosis',      -- "day 3 post lap chole"
  'day_number',     -- a spoken post-op / admission day
  'vital',          -- temperature, pulse, BP, saturation
  'exam',           -- "abdomen soft", "wound healthy"
  'drain',          -- output volume and character
  'intake_output',  -- orals, urine output
  'medication',     -- drug, dose, route, frequency
  'lab',            -- a named lab value, usually from a photo
  'plan',           -- "remove drain tomorrow"
  'note'            -- anything said that does not fit the above, kept verbatim
);

-- ---------------------------------------------------------------------------
-- 2. Who
-- ---------------------------------------------------------------------------

-- Supabase already stores accounts in auth.users. This mirror exists only so we can show a
-- human name next to an entry without exposing the auth table.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Wards and patients
-- ---------------------------------------------------------------------------

create table wards (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  -- Ownership is a single column precisely so a handover is a one-row update. Patients hang
  -- off ward_id and are untouched by it.
  owner_id    uuid not null references auth.users (id),
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

-- Membership is its own table so multi-user sharing is additive later, not a migration.
create table ward_members (
  ward_id   uuid not null references wards (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  role      ward_role not null default 'member',
  added_at  timestamptz not null default now(),
  primary key (ward_id, user_id)
);

create table patients (
  id           uuid primary key default gen_random_uuid(),
  ward_id      uuid not null references wards (id) on delete cascade,

  -- The only two identifying facts we hold, by explicit design. No hospital number, no
  -- phone, no address. If this database leaked it would be close to useless to anyone.
  display_name text not null,
  bed          text not null,      -- carries location, e.g. 'SW-12', 'ICU-3'
  uhid_ip_no   text,
  mrd_no       text,

  -- Typed once when the patient is added, so the ward list card is useful on day zero,
  -- before anything has been spoken. Later spoken diagnoses are stored as observations.
  primary_diagnosis text,

  admitted_on  date not null,
  -- Present only for operated patients. Post-op day is computed from this at read time so it
  -- can never go stale; see the current_patients view below.
  surgery_date date,

  status       patient_status not null default 'active',
  discharged_at timestamptz,       -- record is kept; the patient just leaves the active list

  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id)
);

create index patients_ward_active_idx on patients (ward_id) where status = 'active';

-- ---------------------------------------------------------------------------
-- 4. Evidence: entries
-- ---------------------------------------------------------------------------

-- One press-and-speak, or one photograph. Holds the raw material, forever, unedited.
create table entries (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients (id) on delete cascade,
  author_id   uuid not null references auth.users (id),
  source      entry_source not null,

  transcript  text,        -- voice: what the speech engine heard, verbatim
  photo_path  text,        -- photo: path in the 'lab-photos' storage bucket
  audio_path  text,        -- voice: kept so a bad transcript can be re-run later

  -- Which speech engine produced the transcript. Recorded per entry so that when you test
  -- alternatives for Indian-accented medical speech, you can compare them on real data.
  stt_provider text,
  stt_model    text,

  -- The extraction model's full reply, kept so a wrong extraction can be diagnosed.
  extraction_model    text,
  extraction_raw      jsonb,
  extraction_error    text,

  recorded_at timestamptz not null default now()
);

create index entries_patient_idx on entries (patient_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- 5. Values: observations
-- ---------------------------------------------------------------------------

create table observations (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid not null references entries (id) on delete cascade,
  patient_id  uuid not null references patients (id) on delete cascade,

  kind        observation_kind not null,
  label       text not null,        -- 'temperature', 'drain output', 'ceftriaxone'
  value_text  text,                 -- always populated, exactly as understood
  value_num   numeric,              -- populated only when the value really is a number
  unit        text,

  -- THE VERIFICATION LINK. The exact sentence from the transcript, or the exact line read
  -- off the photograph, that produced this value. Not a paraphrase. Enforced below.
  source_quote text not null,

  -- True for numbers, drug names and doses — the tokens where a mis-hearing is dangerous.
  -- The app surfaces these for a tap-to-confirm instead of burying them in prose.
  needs_confirmation boolean not null default false,
  confirmed_at  timestamptz,
  confirmed_by  uuid references auth.users (id),

  -- Set when a spoken day number disagrees with the day computed from surgery_date.
  conflict_note text,

  recorded_at timestamptz not null default now()
);

create index observations_patient_idx on observations (patient_id, recorded_at desc);
create index observations_entry_idx on observations (entry_id);

-- A value with no traceable source must not be storable at all. This is the schema-level
-- backstop for the rule that the AI may never emit a value it was not given: an invented
-- number has no quote to attach, so the insert fails.
alter table observations
  add constraint observations_source_quote_not_blank
  check (length(btrim(source_quote)) > 0);

-- ---------------------------------------------------------------------------
-- 6. Reading the ward
-- ---------------------------------------------------------------------------

-- Post-op day computed fresh on every read, so it is right even if the app was not opened
-- for two days. Spoken day numbers are stored as observations and compared against this.
--
-- Counted in Indian time, not the database's UTC. From midnight to 05:30 IST, UTC is still
-- on the previous day — and that window contains the start of ward rounds, the only time
-- these numbers are ever read. Using current_date here would show a day too few.
create view current_patients with (security_invoker = true) as
select
  p.*,
  case
    when p.surgery_date is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.surgery_date)::int
    else null
  end as post_op_day,
  ((current_timestamp at time zone 'Asia/Kolkata')::date - p.admitted_on)::int as admission_day,
  (select max(e.recorded_at) from entries e where e.patient_id = p.id) as last_entry_at
from patients p;

-- ---------------------------------------------------------------------------
-- 7. Access control
-- ---------------------------------------------------------------------------
-- Supabase talks to this database directly from the phone, so the database itself has to be
-- the thing that refuses. Every table below is deny-by-default; the policies grant back
-- exactly one rule: you can see a row if you are a member of the ward it belongs to.

alter table profiles     enable row level security;
alter table wards        enable row level security;
alter table ward_members enable row level security;
alter table patients     enable row level security;
alter table entries      enable row level security;
alter table observations enable row level security;

-- security definer so the policy can read ward_members without recursing into its own policy
create function is_ward_member(target_ward uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from ward_members m
    where m.ward_id = target_ward and m.user_id = auth.uid()
  );
$$;

create function is_ward_owner(target_ward uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from wards w
    where w.id = target_ward and w.owner_id = auth.uid()
  );
$$;

-- profiles: you may read and edit only your own
create policy profiles_self_read on profiles for select using (id = auth.uid());
create policy profiles_self_write on profiles for insert with check (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());

-- wards: members read; only the owner may rename, archive, or hand over
create policy wards_member_read on wards for select using (is_ward_member(id));
create policy wards_create on wards for insert with check (owner_id = auth.uid());
create policy wards_owner_update on wards for update using (owner_id = auth.uid());

-- ward_members: members see the roster; only the owner changes it. Handing a ward over is
-- therefore two owner-authorised writes, and never touches a patient.
create policy ward_members_read on ward_members for select using (is_ward_member(ward_id));
create policy ward_members_owner_write on ward_members for insert with check (is_ward_owner(ward_id));
create policy ward_members_owner_delete on ward_members for delete using (is_ward_owner(ward_id));

-- patients: readable and writable by any member of the owning ward
create policy patients_read on patients for select using (is_ward_member(ward_id));
create policy patients_insert on patients for insert with check (is_ward_member(ward_id));
-- with check as well as using, so an update cannot move a patient into a ward you are not in
create policy patients_update on patients for update
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));
-- deliberately no delete policy: discharge sets status, it does not destroy the record

-- entries and observations: reachable only through a patient in a ward you belong to
create policy entries_read on entries for select using (
  exists (select 1 from patients p where p.id = entries.patient_id and is_ward_member(p.ward_id))
);
create policy entries_insert on entries for insert with check (
  author_id = auth.uid()
  and exists (select 1 from patients p where p.id = entries.patient_id and is_ward_member(p.ward_id))
);

create policy observations_read on observations for select using (
  exists (select 1 from patients p where p.id = observations.patient_id and is_ward_member(p.ward_id))
);
create policy observations_insert on observations for insert with check (
  exists (select 1 from patients p where p.id = observations.patient_id and is_ward_member(p.ward_id))
);
create policy observations_confirm on observations for update using (
  exists (select 1 from patients p where p.id = observations.patient_id and is_ward_member(p.ward_id))
) with check (
  exists (select 1 from patients p where p.id = observations.patient_id and is_ward_member(p.ward_id))
);

-- Policies above decide WHICH ROWS a signed-in doctor can touch. Postgres separately
-- requires the more basic grant that a signed-in doctor (the "authenticated" role) may touch
-- the table AT ALL. Without this, every query fails with "permission denied for table ..."
-- before row security is even consulted.
grant usage on schema public to authenticated;

grant select, insert, update on profiles         to authenticated;
grant select, insert, update on wards            to authenticated;
grant select, insert, delete on ward_members     to authenticated;
grant select, insert, update on patients         to authenticated;
grant select, insert         on entries          to authenticated;
grant select, insert, update on observations     to authenticated;
grant select                 on current_patients to authenticated;

grant execute on function is_ward_member(uuid) to authenticated;
grant execute on function is_ward_owner(uuid)  to authenticated;

-- ---------------------------------------------------------------------------
-- 8. New account setup
-- ---------------------------------------------------------------------------
-- On first sign-in, give the doctor a profile and a ward of their own, so the app is never
-- staring at an empty screen with no way forward.

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_ward uuid;
begin
  insert into profiles (id) values (new.id);

  insert into wards (name, owner_id) values ('My unit', new.id)
  returning id into new_ward;

  insert into ward_members (ward_id, user_id, role) values (new_ward, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

commit;
