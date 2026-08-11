-- Reading the ward round register.
--
-- One photograph writes to several patients at once, which makes it the most dangerous
-- operation in the app: a misread row lands on the wrong person's record, and nothing on the
-- server can re-read an image to catch it. So a register photo produces a DRAFT that is
-- reviewed and approved patient by patient. Until then nothing exists but the photo itself
-- and what the model claims to have read.
--
-- Safe to run more than once.

begin;

create table if not exists register_reads (
  id          uuid primary key default gen_random_uuid(),
  ward_id     uuid not null references wards (id) on delete cascade,
  author_id   uuid not null references auth.users (id),

  photo_path  text not null,
  raw         jsonb,              -- what the model read, before any human agreed with it

  status      text not null default 'draft'
              check (status in ('draft', 'applied', 'discarded')),

  created_at  timestamptz not null default now(),
  applied_at  timestamptz
);

create index if not exists register_reads_ward_idx on register_reads (ward_id, created_at desc);

alter table register_reads enable row level security;

drop policy if exists register_reads_read on register_reads;
drop policy if exists register_reads_insert on register_reads;
drop policy if exists register_reads_update on register_reads;

create policy register_reads_read on register_reads for select
  using (is_ward_member(ward_id));
create policy register_reads_insert on register_reads for insert
  with check (is_ward_member(ward_id) and author_id = auth.uid());
create policy register_reads_update on register_reads for update
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

grant select, insert, update on register_reads to authenticated;

-- Register photographs belong to a ward, not to any one patient, so they are stored under
-- register/<ward_id>/... The policies from 0007 only allowed <patient_id>/..., so both
-- shapes are now permitted — patient-scoped for lab reports, ward-scoped for the register.
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
      (storage.foldername(name))[1] = 'register'
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
      (storage.foldername(name))[1] = 'register'
      and is_ward_member(((storage.foldername(name))[2])::uuid)
    )
  )
);

commit;
