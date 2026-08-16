-- The unit's own paperwork: the forms and layouts it actually uses.
--
-- Every unit writes its investigation slips, its referral notes, its discharge summaries and
-- its OT notes to a house style, and a resident who gets that style wrong has their note sent
-- back. The app has no way of knowing any of it — nothing in a transcript says how this unit
-- lays out a discharge summary.
--
-- So the unit uploads its own. Held against the WARD rather than a doctor, which is the same
-- reason patients are: a resident rotating out should not take the unit's paperwork with them.
--
-- One current file per kind. Uploading again replaces what is there, because a unit has one
-- current discharge format, not a history of them — the primary key enforces that rather than
-- leaving the app to guess which of several is live.
--
-- Safe to run more than once.

begin;

create table if not exists ward_formats (
  ward_id     uuid not null references wards (id) on delete cascade,

  -- The five things a unit was asked for. An enum rather than free text so the screen can
  -- show all five slots, filled or empty — an empty slot is a useful thing to see.
  kind        text not null check (kind in (
                'investigation',      -- investigation / lab request form
                'interdepartmental',  -- referral or call to another department
                'discharge',          -- discharge summary layout
                'notes',              -- daily / progress notes
                'ot_notes'            -- operation notes
              )),

  file_path   text not null,        -- in the 'evidence' bucket, under formats/<ward_id>/
  file_name   text,                 -- what it was called when uploaded, for recognising it
  mime_type   text,

  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users (id),

  primary key (ward_id, kind)
);

alter table ward_formats enable row level security;

drop policy if exists ward_formats_read on ward_formats;
drop policy if exists ward_formats_write on ward_formats;
drop policy if exists ward_formats_update on ward_formats;
drop policy if exists ward_formats_delete on ward_formats;

create policy ward_formats_read on ward_formats for select
  using (is_ward_member(ward_id));
create policy ward_formats_write on ward_formats for insert
  with check (is_ward_member(ward_id));
create policy ward_formats_update on ward_formats for update
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));
create policy ward_formats_delete on ward_formats for delete
  using (is_ward_member(ward_id));

grant select, insert, update, delete on ward_formats to authenticated;

-- A format belongs to a ward, not to a patient, so it is stored under formats/<ward_id>/...
-- Same shape as register/ and round/ — see 0009 and 0014 for why each was added.
drop policy if exists evidence_read on storage.objects;
drop policy if exists evidence_insert on storage.objects;
drop policy if exists evidence_delete on storage.objects;

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
      (storage.foldername(name))[1] in ('register', 'round', 'formats')
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
      (storage.foldername(name))[1] in ('register', 'round', 'formats')
      and is_ward_member(((storage.foldername(name))[2])::uuid)
    )
  )
);

-- Replacing a format leaves the old file behind without this. Deliberately limited to the
-- formats folder: a lab photo or a register page is evidence behind a stored value, and
-- nothing in the app should be able to delete those out from under a record.
create policy evidence_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = 'formats'
  and is_ward_member(((storage.foldername(name))[2])::uuid)
);

commit;
