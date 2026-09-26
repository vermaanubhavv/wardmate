-- History check: one row per run of a complaint tree against a patient's case history.
--
-- WHAT THIS IS. The "History check" card (lib/history-check/) maps what the resident has
-- already dictated in the case history onto a complaint-specific question tree and returns
-- the gaps plus a presentation-ready history. This table is the RUN LOG for that: which tree
-- version, which prompt version and which model produced a result, over which entries, and
-- what the deterministic validator rejected on the way. Nothing clinical is created here — a
-- run reads the case history and stores a mapping of it. The observations table is untouched.
--
-- IDEMPOTENT. input_hash covers the tree version, prompt version, model and the exact source
-- texts. The unique (patient_id, input_hash) means "run again with nothing changed" returns
-- the stored row and makes no API call (lib/history-check/store.ts checks before it calls).
--
-- IMMUTABLE. Rows are inserted, never updated or deleted through the app — a correction is a
-- new run. The one exception is `resolutions`: a resident's own explicit answer to a flagged
-- conflict or a "wrong patient" flag, written by tap. That is a column-level grant, not a
-- second policy, so nothing else on the row can be changed.
--
-- RLS mirrors entries/observations exactly: reachable only through a patient in a ward you
-- belong to (ward_id is denormalised so the policy is one is_ward_member() check, as the
-- scoring tables do), plus the 0077 hospital-admin read.
--
-- FEATURE FLAG. Read and written only when NEXT_PUBLIC_HISTORY_CHECK=on (lib/history-check/flag.ts).
--
-- Safe to run more than once.

begin;

create table if not exists public.history_checks (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references patients (id) on delete cascade,
  ward_id           uuid not null references wards (id) on delete cascade,
  created_by        uuid not null references auth.users (id),
  created_at        timestamptz not null default now(),

  tree_id           text not null,
  tree_version      text not null,
  prompt_version    text not null,
  model             text not null,

  -- What was read: the case-history entries, in order, and a hash over their exact text.
  source_entry_ids  uuid[] not null default '{}',
  input_hash        text not null,

  status            text not null check (status in ('ok', 'error')),
  -- The validated slots, rejections and any wrong-patient flag (lib/history-check/sources.ts
  -- CheckResult). Null on an error run.
  result            jsonb,
  -- What the validator threw out, kept so a wrong answer can be diagnosed. Duplicated out of
  -- `result` for the admin eye; the app reads `result`.
  rejections        jsonb not null default '[]'::jsonb,
  usage             jsonb,                 -- token counts from the API
  cost_usd          numeric,               -- estimate, from lib/history-check/extract.ts rates
  error             text,

  -- Resident's explicit resolutions of flagged items: { "<slot_id>": {"state": ..., "at": ..., "by": ...},
  -- "wrong_patient": {"dismissed": true, ...} }. Written by tap; see the grant below.
  resolutions       jsonb not null default '{}'::jsonb,

  unique (patient_id, input_hash)
);

create index if not exists history_checks_patient_idx
  on public.history_checks (patient_id, tree_id, created_at desc);

-- For the per-user hourly cap (lib/history-check/store.ts).
create index if not exists history_checks_author_idx
  on public.history_checks (created_by, created_at desc);

alter table public.history_checks enable row level security;

-- Table-level privileges run BEFORE RLS; a raw create table carries none (lesson of 0055/0059/
-- 0062). Update is granted on ONE column only — the row is otherwise immutable from the app.
grant select, insert on public.history_checks to authenticated;
grant update (resolutions) on public.history_checks to authenticated;

drop policy if exists history_checks_read on public.history_checks;
create policy history_checks_read on public.history_checks for select to authenticated
  using (
    is_ward_member(ward_id)
    and exists (select 1 from patients p where p.id = history_checks.patient_id and p.ward_id = history_checks.ward_id)
  );

drop policy if exists history_checks_insert on public.history_checks;
create policy history_checks_insert on public.history_checks for insert to authenticated
  with check (
    created_by = auth.uid()
    and is_ward_member(ward_id)
    and exists (select 1 from patients p where p.id = history_checks.patient_id and p.ward_id = history_checks.ward_id)
  );

drop policy if exists history_checks_resolve on public.history_checks;
create policy history_checks_resolve on public.history_checks for update to authenticated
  using (is_ward_member(ward_id))
  with check (is_ward_member(ward_id));

-- Hospital admins: read only, same shape as 0077.
drop policy if exists "hospital admins select history_checks" on public.history_checks;
create policy "hospital admins select history_checks" on public.history_checks for select
  using (ward_hospital_admin_access(ward_id));

commit;

notify pgrst, 'reload schema';
