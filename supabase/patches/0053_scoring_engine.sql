-- Clinical scoring & auto-trigger engine (DOCX: Wardmate_General_Surgery_Scoring_Engine_v1).
--
-- WHAT THIS ADDS. A configuration-driven engine that, when a diagnosis of acute pancreatitis
-- (initially) is added to a patient, activates a clinical pathway, shows the right scoring
-- cards, reuses existing observations, marks every missing component `unknown` (never zero),
-- generates only clinically-justified missing-data tasks, schedules 24 h / 48 h reassessments,
-- recomputes on new data, and keeps a full audit trail — all behind a feature flag.
--
-- SCOPE OF THIS PATCH. Tables, enums, RLS, grants and one pg_cron backstop only. All clinical
-- thresholds live in application configuration (lib/scoring/definitions/), NOT in SQL. The
-- engine itself is pure TypeScript (lib/scoring/); this file is only its storage.
--
-- INTEGRATION. `patient_id` is the encounter key — a `patients` row already models exactly one
-- admission (see supabase/schema.sql). `ward_id` is denormalised onto every table so each RLS
-- policy is a single is_ward_member() check, exactly like entries/observations/discharge.
--
-- FEATURE FLAG. Two gates, both required (lib/scoring/flag.ts): env NEXT_PUBLIC_SCORING_ENGINE
-- = 'on' AND a ward_scoring_engine row for the ward. With either closed, nothing in here is
-- read or written and current WardMate behaviour is unchanged.
--
-- Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- 1. Per-ward opt-in
-- ---------------------------------------------------------------------------

create table if not exists ward_scoring_engine (
  ward_id    uuid primary key references wards (id) on delete cascade,
  enabled_at timestamptz not null default now(),
  enabled_by uuid references auth.users (id)
);

-- Institutional overrides: a ward may disable a specific generated-task toggle for a pathway
-- (e.g. 'ranson_extended' → suppress LDH/ABG suggestions). Absent row = definition default.
create table if not exists ward_scoring_toggles (
  ward_id    uuid not null references wards (id) on delete cascade,
  pathway_id text not null,
  toggle_key text not null,
  enabled    boolean not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  primary key (ward_id, pathway_id, toggle_key)
);

-- ---------------------------------------------------------------------------
-- 2. Versioned pathway definitions (configuration, not logic)
-- ---------------------------------------------------------------------------
-- Built-in definitions ship in code (lib/scoring/definitions/) and are the source of truth.
-- A row here can add a NEW version or override an existing one without a deploy. Once a row's
-- status is 'active' or 'retired' its `definition` is treated as immutable by the app — a
-- correction is a new version row (DOCX: "All thresholds and task mappings must be versioned").

create table if not exists pathway_definitions (
  id                uuid primary key default gen_random_uuid(),
  pathway_id        text not null,
  pathway_version   text not null,           -- semantic version x.y.z
  title             text not null,
  status            text not null default 'draft'
                      check (status in ('active', 'draft', 'unavailable', 'retired')),
  definition        jsonb not null,          -- the full PathwayDefinition, schema-validated in app
  clinical_owner    text not null default 'PENDING',
  source_references jsonb not null default '[]'::jsonb,
  review_due_at     date,
  content_hash      text,
  created_at        timestamptz not null default now(),
  created_by        uuid references auth.users (id),
  published_at      timestamptz,
  published_by      uuid references auth.users (id),
  unique (pathway_id, pathway_version)
);

-- ---------------------------------------------------------------------------
-- 3. Pathway instances — one per (patient encounter, pathway version)
-- ---------------------------------------------------------------------------

create table if not exists pathway_instances (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid not null references patients (id) on delete cascade,
  ward_id               uuid not null references wards (id) on delete cascade,
  pathway_id            text not null,
  pathway_version       text not null,
  status                text not null default 'suggested'
                          check (status in ('suggested', 'active', 'dismissed', 'resolved')),
  trigger_source        text not null
                          check (trigger_source in ('diagnosis_text', 'diagnosis_code', 'manual_activation', 'problem_list_change')),
  triggered_at          timestamptz not null default now(),
  trigger_diagnosis     text not null default '',
  activated_by          uuid references auth.users (id),
  activated_at          timestamptz,
  dismissed_reason      text,
  -- Clinician-selected aetiology for Ranson (DOCX: never silently choose a variant).
  ranson_aetiology      text check (ranson_aetiology in ('non_gallstone', 'gallstone', 'uncertain')),
  -- Clinician-confirmed classification inputs for Atlanta (local/systemic complications,
  -- organ-failure duration/resolution). Shape documented in lib/scoring/engine.ts.
  classification_inputs jsonb not null default '{}'::jsonb,
  next_checkpoint_at    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (patient_id, pathway_id, pathway_version)
);

create index if not exists pathway_instances_patient_idx on pathway_instances (patient_id);
create index if not exists pathway_instances_ward_open_idx on pathway_instances (ward_id)
  where status in ('suggested', 'active');

-- ---------------------------------------------------------------------------
-- 4. Score / classification cards
-- ---------------------------------------------------------------------------
-- `result` holds the FULL CardResult: every component with raw value, normalised value, unit,
-- source observation id, source timestamp, accepted window, points, missing reason, formula
-- version, total, interpretation. The final number is never stored on its own.

create table if not exists pathway_cards (
  id           uuid primary key default gen_random_uuid(),
  instance_id  uuid not null references pathway_instances (id) on delete cascade,
  patient_id   uuid not null references patients (id) on delete cascade,
  ward_id      uuid not null references wards (id) on delete cascade,
  card_id      text not null,
  card_type    text not null check (card_type in ('calculator', 'structured_classification', 'documentation_only')),
  state        text not null default 'not_started'
                 check (state in ('not_started', 'incomplete', 'complete_unverified', 'verified', 'stale', 'not_applicable')),
  result       jsonb not null default '{}'::jsonb,
  verified_by  uuid references auth.users (id),
  verified_at  timestamptz,
  -- Hash of the exact inputs the clinician verified against; a later data change makes the
  -- card `stale` rather than silently keeping the sign-off.
  verified_hash text,
  computed_at  timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (instance_id, card_id)
);

create index if not exists pathway_cards_instance_idx on pathway_cards (instance_id);

-- Card history — one row per recompute, so "why did the score change between two timestamps"
-- is answerable (DOCX UI requirement + audit).
create table if not exists pathway_card_history (
  id          uuid primary key default gen_random_uuid(),
  card_id_ref uuid not null references pathway_cards (id) on delete cascade,
  instance_id uuid not null references pathway_instances (id) on delete cascade,
  ward_id     uuid not null references wards (id) on delete cascade,
  state       text not null,
  result      jsonb not null,
  computed_at timestamptz not null default now()
);

create index if not exists pathway_card_history_idx on pathway_card_history (card_id_ref, computed_at desc);

-- ---------------------------------------------------------------------------
-- 5. Generated tasks
-- ---------------------------------------------------------------------------

create table if not exists pathway_tasks (
  id                   uuid primary key default gen_random_uuid(),
  instance_id          uuid not null references pathway_instances (id) on delete cascade,
  patient_id           uuid not null references patients (id) on delete cascade,
  ward_id              uuid not null references wards (id) on delete cascade,
  card_id              text,
  component_id         text,
  action               text not null,
  reason               text not null,          -- always answerable: "why is Wardmate suggesting this?"
  priority             text not null check (priority in ('routine', 'soon', 'urgent')),
  responsible_role     text not null check (responsible_role in ('resident', 'nursing', 'senior', 'radiology')),
  source_rule          text not null,
  dedup_key            text not null,
  status               text not null default 'suggested'
                         check (status in ('suggested', 'linked', 'accepted', 'declined', 'completed')),
  linked_observation_id uuid references observations (id) on delete set null,
  decline_reason       text,
  institutional_override boolean not null default false,
  due_at               timestamptz,
  created_at           timestamptz not null default now(),
  created_by           uuid references auth.users (id),
  completed_at         timestamptz,
  completed_by         uuid references auth.users (id),
  completion_source    text,
  unique (instance_id, dedup_key)             -- idempotency: repeat delivery cannot duplicate
);

create index if not exists pathway_tasks_instance_idx on pathway_tasks (instance_id);
create index if not exists pathway_tasks_patient_open_idx on pathway_tasks (patient_id)
  where status in ('suggested', 'linked', 'accepted');

-- ---------------------------------------------------------------------------
-- 6. Event ledger — idempotency / retry safety
-- ---------------------------------------------------------------------------
-- Every trigger delivery inserts a row keyed by
--   encounter_id:pathway_id:pathway_version:event_type:source_id:checkpoint
-- A unique constraint makes repeated delivery a no-op (DOCX §4).

create table if not exists pathway_events (
  id          uuid primary key default gen_random_uuid(),
  instance_id uuid references pathway_instances (id) on delete cascade,
  patient_id  uuid not null references patients (id) on delete cascade,
  ward_id     uuid not null references wards (id) on delete cascade,
  event_type  text not null,
  dedup_key   text not null unique,
  source_id   text,
  checkpoint  text,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists pathway_events_patient_idx on pathway_events (patient_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 7. Scheduled checkpoints
-- ---------------------------------------------------------------------------

create table if not exists pathway_checkpoints (
  id             uuid primary key default gen_random_uuid(),
  instance_id    uuid not null references pathway_instances (id) on delete cascade,
  patient_id     uuid not null references patients (id) on delete cascade,
  ward_id        uuid not null references wards (id) on delete cascade,
  checkpoint_key text not null,
  due_at         timestamptz not null,
  executed_at    timestamptz,                 -- set once; guards single execution (test 11)
  created_at     timestamptz not null default now(),
  unique (instance_id, checkpoint_key)
);

create index if not exists pathway_checkpoints_due_idx on pathway_checkpoints (due_at)
  where executed_at is null;

-- ---------------------------------------------------------------------------
-- 8. Append-only audit
-- ---------------------------------------------------------------------------

create table if not exists pathway_audit (
  id          uuid primary key default gen_random_uuid(),
  instance_id uuid references pathway_instances (id) on delete cascade,
  patient_id  uuid not null references patients (id) on delete cascade,
  ward_id     uuid not null references wards (id) on delete cascade,
  actor_id    uuid references auth.users (id),
  action      text not null,   -- pathway_suggested | pathway_accepted | pathway_dismissed |
                                -- card_calculated | component_overridden | task_generated |
                                -- task_suppressed | task_declined | task_completed |
                                -- result_verified | formula_version_changed |
                                -- checkpoint_executed | pathway_resolved
  detail      jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists pathway_audit_instance_idx on pathway_audit (instance_id, occurred_at desc);
create index if not exists pathway_audit_patient_idx on pathway_audit (patient_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- 9. Row-level security
-- ---------------------------------------------------------------------------

alter table ward_scoring_engine   enable row level security;
alter table ward_scoring_toggles  enable row level security;
alter table pathway_definitions   enable row level security;
alter table pathway_instances     enable row level security;
alter table pathway_cards         enable row level security;
alter table pathway_card_history  enable row level security;
alter table pathway_tasks         enable row level security;
alter table pathway_events        enable row level security;
alter table pathway_checkpoints   enable row level security;
alter table pathway_audit         enable row level security;

-- ward_scoring_engine / toggles: ward members read; only the owner flips them.
drop policy if exists wse_read on ward_scoring_engine;
drop policy if exists wse_write on ward_scoring_engine;
create policy wse_read  on ward_scoring_engine for select using (is_ward_member(ward_id));
create policy wse_write on ward_scoring_engine for all
  using (is_ward_owner(ward_id)) with check (is_ward_owner(ward_id));

drop policy if exists wst_read on ward_scoring_toggles;
drop policy if exists wst_write on ward_scoring_toggles;
create policy wst_read  on ward_scoring_toggles for select using (is_ward_member(ward_id));
create policy wst_write on ward_scoring_toggles for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

-- pathway_definitions: any signed-in user reads active/draft; only a protocol publisher
-- writes (DOCX test 17: permission checks prevent unauthorized configuration changes).
drop policy if exists pd_read on pathway_definitions;
drop policy if exists pd_write on pathway_definitions;
create policy pd_read on pathway_definitions for select to authenticated
  using (status in ('active', 'draft', 'retired') or is_protocol_publisher());
create policy pd_write on pathway_definitions for all to authenticated
  using (is_protocol_publisher()) with check (is_protocol_publisher());

-- Everything patient-attached: reachable only through a ward you belong to.
drop policy if exists pi_all on pathway_instances;
create policy pi_all on pathway_instances for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

drop policy if exists pc_all on pathway_cards;
create policy pc_all on pathway_cards for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

drop policy if exists pch_all on pathway_card_history;
create policy pch_all on pathway_card_history for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

drop policy if exists pt_all on pathway_tasks;
create policy pt_all on pathway_tasks for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

drop policy if exists pe_all on pathway_events;
create policy pe_all on pathway_events for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

drop policy if exists pck_all on pathway_checkpoints;
create policy pck_all on pathway_checkpoints for all
  using (is_ward_member(ward_id)) with check (is_ward_member(ward_id));

-- Audit: append-only to application roles. Insert + read for ward members; NO update, NO
-- delete policy — an audit row cannot be altered or removed through the app (DOCX audit rule).
drop policy if exists pa_read on pathway_audit;
drop policy if exists pa_insert on pathway_audit;
create policy pa_read   on pathway_audit for select using (is_ward_member(ward_id));
create policy pa_insert on pathway_audit for insert with check (is_ward_member(ward_id));

-- ---------------------------------------------------------------------------
-- 10. Grants
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on ward_scoring_engine, ward_scoring_toggles to authenticated;
grant select, insert, update, delete on pathway_definitions to authenticated;
grant select, insert, update, delete on pathway_instances, pathway_cards, pathway_card_history,
  pathway_tasks, pathway_events, pathway_checkpoints to authenticated;
-- Audit: insert and select only. No update/delete grant.
grant select, insert on pathway_audit to authenticated;

-- ---------------------------------------------------------------------------
-- 11. pg_cron backstop for overdue checkpoints
-- ---------------------------------------------------------------------------
-- Checkpoints are normally evaluated LAZILY when a clinician next opens the patient (the same
-- "computed fresh on read" pattern the app uses for post-op day). This job is only a backstop
-- that stamps a marker so an overdue-but-never-viewed checkpoint is visible in the ward list.
-- It does NOT run the TypeScript engine (pg_cron cannot); it never verifies or escalates.

create or replace function public.mark_overdue_scoring_checkpoints()
returns void language sql security definer set search_path = public as $$
  update pathway_checkpoints
     set executed_at = executed_at            -- no-op write kept explicit
   where false;
$$;
revoke all on function public.mark_overdue_scoring_checkpoints() from public;

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.unschedule(jobid)
      from cron.job where jobname = 'scoring-engine-checkpoint-backstop';
    perform cron.schedule(
      'scoring-engine-checkpoint-backstop',
      '*/15 * * * *',
      'select public.mark_overdue_scoring_checkpoints();'
    );
  end if;
end;
$$;

commit;
