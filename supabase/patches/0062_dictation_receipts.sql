-- Make a dictation upload safe to retry — the same recording sent twice must not become two
-- entries (or two round drafts, or a drug recorded twice).
--
-- WHY THIS EXISTS. A recorder now saves its audio to the phone BEFORE it uploads and deletes
-- it only once the server confirms receipt (app/patients/[id]/recorder.tsx and friends,
-- lib/outbox.ts). Between "server processed it" and "phone deleted its copy" the app can be
-- killed — and the queue then sends the surviving copy again. There is also the plain case of
-- a resident, on a bad signal, tapping the failed upload's "Try now" while the first attempt
-- was actually still going.
--
-- Each recording carries a client_uuid (chosen on the phone, the moment recording starts, and
-- reused for every retry of that one recording). This table remembers, per client_uuid, the
-- exact JSON the route returned. Every dictation route checks it first: a second arrival with
-- a client_uuid already here returns the stored response and does no speech-to-text, no
-- extraction, no insert — cheap and side-effect-free.
--
-- SCOPE. Not a clinical record — a de-duplication ledger. Rows belong to the uploader
-- (author_id = auth.uid()) and are read by no one else. `response` holds the same body the
-- client already received once, nothing new.
--
-- GROWTH. One row per dictation. A busy resident makes perhaps 50 a day, so ~18k rows a year
-- per user — negligible, and never read after its recording's retry window (hours). If it
-- ever matters, this is safe to prune:
--   delete from public.dictation_receipts where created_at < now() - interval '30 days';
--
-- Safe to run more than once.

begin;

create table if not exists public.dictation_receipts (
  client_uuid uuid primary key,
  author_id   uuid not null references auth.users (id) on delete cascade,
  route       text not null,               -- 'voice' | 'round' | 'case-history'
  response    jsonb not null,              -- the exact body the route returned the first time
  created_at  timestamptz not null default now()
);

create index if not exists dictation_receipts_prune_idx
  on public.dictation_receipts (created_at);

alter table public.dictation_receipts enable row level security;

-- A raw `create table` in the SQL editor does not carry Supabase's automatic role grants, and
-- the table-level privilege check runs BEFORE RLS — so without this, inserts fail with
-- "42501: permission denied" before any policy is consulted. Same lesson as 0055 / 0059.
grant select, insert on public.dictation_receipts to authenticated;

drop policy if exists "own receipts: read" on public.dictation_receipts;
create policy "own receipts: read"
  on public.dictation_receipts for select to authenticated
  using (author_id = auth.uid());

drop policy if exists "own receipts: write" on public.dictation_receipts;
create policy "own receipts: write"
  on public.dictation_receipts for insert to authenticated
  with check (author_id = auth.uid());

commit;

-- Refresh PostgREST's schema cache so the new table is queryable immediately.
notify pgrst, 'reload schema';
