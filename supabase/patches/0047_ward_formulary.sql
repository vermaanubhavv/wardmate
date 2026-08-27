-- The unit's own hospital formulary, and the mapping from what a resident SAYS to the entry
-- the hospital's prescribing system actually lists.
--
-- WHY THIS EXISTS. WardMate records "T. Pan 40mg" because that is what was said. The hospital's
-- prescribing screen lists "Pantoprazole Caps/Tab. 40mg." — and also lists "Domperidone 30mg.,
-- Pantoprazole 40mg. -SRCaps/Tab.", which is a different drug. Matching those two by text is
-- not a small imprecision: tested against a real 1,557-row formulary, six of ten common drugs
-- resolved to a combination product or the wrong route on nearest-text match. Pantoprazole
-- resolved to the Domperidone combination.
--
-- So nothing in this schema matches drugs automatically, and nothing is allowed to. A mapping
-- row exists only because a clinician looked at the candidates and chose one — the same rule
-- glossary_terms follows for mishearings, and observations follow for values. What the app
-- contributes is remembering the choice, not making it.
--
-- Formulary rows are per-ward because each hospital stocks its own, and the same drug name can
-- mean a different item in another building.
--
-- Safe to run more than once.

begin;

-- One row per DISTINCT formulary entry. The source list repeats entries (the same drug held as
-- several stock batches — 1,557 rows collapsing to 1,057 distinct texts), and those duplicates
-- are interchangeable to the patient, so only the distinct text is kept.
create table if not exists ward_formulary_items (
  id         uuid primary key default gen_random_uuid(),
  ward_id    uuid not null references wards (id) on delete cascade,
  item_text  text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists ward_formulary_items_unique_idx
  on ward_formulary_items (ward_id, item_text);

-- Searched by substring on every mapping lookup.
create index if not exists ward_formulary_items_ward_idx
  on ward_formulary_items (ward_id);

alter table ward_formulary_items enable row level security;

drop policy if exists ward_formulary_read on ward_formulary_items;
create policy ward_formulary_read on ward_formulary_items for select
  using (public.is_ward_member(ward_id));

-- Importing the list is a unit-wide act, so it is the owner's: the same person who may rename
-- the ward and set its letterhead.
drop policy if exists ward_formulary_write on ward_formulary_items;
create policy ward_formulary_write on ward_formulary_items for insert
  with check (exists (select 1 from wards w where w.id = ward_id and w.owner_id = auth.uid()));

drop policy if exists ward_formulary_delete on ward_formulary_items;
create policy ward_formulary_delete on ward_formulary_items for delete
  using (exists (select 1 from wards w where w.id = ward_id and w.owner_id = auth.uid()));

grant select, insert, delete on ward_formulary_items to authenticated;


-- What a drug recorded in WardMate corresponds to in this ward's formulary. One row per drug
-- name per ward, written only when a clinician confirmed the choice.
create table if not exists medication_formulary_map (
  id           uuid primary key default gen_random_uuid(),
  ward_id      uuid not null references wards (id) on delete cascade,
  -- The drug as WardMate holds it, lowercased and space-collapsed for lookup. Never the whole
  -- dictated phrase — "t. pan 40mg" and "pan" must reach the same mapping.
  drug_key     text not null,
  item_text    text not null,
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz not null default now()
);

create unique index if not exists medication_formulary_map_unique_idx
  on medication_formulary_map (ward_id, drug_key);

alter table medication_formulary_map enable row level security;

drop policy if exists medication_map_read on medication_formulary_map;
create policy medication_map_read on medication_formulary_map for select
  using (public.is_ward_member(ward_id));

-- Any member of the unit may confirm a mapping — it is a clinical judgement a resident makes
-- while discharging a patient, not an administrative setting. Unlike the formulary import,
-- which replaces the whole list and is therefore the owner's.
drop policy if exists medication_map_write on medication_formulary_map;
create policy medication_map_write on medication_formulary_map for insert
  with check (public.is_ward_member(ward_id) and confirmed_by = auth.uid());

drop policy if exists medication_map_update on medication_formulary_map;
create policy medication_map_update on medication_formulary_map for update
  using (public.is_ward_member(ward_id))
  with check (public.is_ward_member(ward_id));

-- A mapping chosen wrongly has to be removable by whoever notices, not only by whoever made it.
drop policy if exists medication_map_delete on medication_formulary_map;
create policy medication_map_delete on medication_formulary_map for delete
  using (public.is_ward_member(ward_id));

grant select, insert, update, delete on medication_formulary_map to authenticated;

commit;
