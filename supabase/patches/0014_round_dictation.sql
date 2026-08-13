-- Dictating the whole round in one go.
--
-- "Bed 1 discharge today, bed 2 send fresh investigations, bed 3 medicine consult" is one
-- recording that writes to three different patients — the same risk class as the register
-- photograph, and handled the same way: it produces a DRAFT that is reviewed bed by bed and
-- approved before anything is written.
--
-- The danger here is specific and worth naming. A mis-heard bed number does not produce an
-- obviously wrong entry; it produces a perfectly plausible one on the wrong patient. "Bed 1"
-- and "bed 11" differ by a syllable spoken across a noisy ward, and "discharge today" landing
-- on the wrong person is invisible the moment it is stored. No check on the server can catch
-- it, because the words themselves are not wrong — only their destination is. So the resident
-- sees which patient each instruction is about, by name, before any of it exists.
--
-- The audio is kept so a disputed segment can be listened to again, the way a lab photo can
-- be looked at again.
--
-- Safe to run more than once.

begin;

create table if not exists round_dictations (
  id          uuid primary key default gen_random_uuid(),
  ward_id     uuid not null references wards (id) on delete cascade,
  author_id   uuid not null references auth.users (id),

  transcript  text not null,        -- what the speech engine heard, verbatim
  audio_path  text,                 -- kept so a disputed segment can be replayed
  stt_provider text,
  stt_model    text,

  raw         jsonb,                -- the split into beds, before any human agreed with it
  model       text,

  status      text not null default 'draft'
              check (status in ('draft', 'applied', 'discarded')),

  created_at  timestamptz not null default now(),
  applied_at  timestamptz
);

create index if not exists round_dictations_ward_idx
  on round_dictations (ward_id, created_at desc);

alter table round_dictations enable row level security;

drop policy if exists round_dictations_read on round_dictations;
drop policy if exists round_dictations_insert on round_dictations;
drop policy if exists round_dictations_update on round_dictations;

create policy round_dictations_read on round_dictations for select
  using (is_ward_member(ward_id));
create policy round_dictations_insert on round_dictations for insert
  with check (is_ward_member(ward_id) and author_id = auth.uid());
create policy round_dictations_update on round_dictations for update
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

grant select, insert, update on round_dictations to authenticated;

-- A round dictation belongs to a ward, not to any one patient — it is about several — so its
-- audio is stored under round/<ward_id>/... The 0009 policies allowed only <patient_id>/...
-- and register/<ward_id>/..., so without this the upload is refused and the recording is
-- lost silently, leaving nothing to replay when a routed segment is later disputed.
drop policy if exists evidence_read on storage.objects;
drop policy if exists evidence_insert on storage.objects;

create policy evidence_read on storage.objects for select to authenticated
using (
  bucket_id = 'evidence'
  and (
    exists (
      select 1 from patients p
      where p.id::text = (storage.foldername(name))[1]
        and is_ward_member(p.ward_id)
    )
    or (
      (storage.foldername(name))[1] in ('register', 'round')
      and is_ward_member(((storage.foldername(name))[2])::uuid)
    )
  )
);

create policy evidence_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'evidence'
  and (
    exists (
      select 1 from patients p
      where p.id::text = (storage.foldername(name))[1]
        and is_ward_member(p.ward_id)
    )
    or (
      (storage.foldername(name))[1] in ('register', 'round')
      and is_ward_member(((storage.foldername(name))[2])::uuid)
    )
  )
);

commit;
