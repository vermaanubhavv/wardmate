-- Side-by-side speech-engine comparison (app/tools/transcribe).
--
-- WHY THIS EXISTS. WardMate can run three speech engines — OpenAI gpt-4o-transcribe, Sarvam
-- Saaras, Deepgram Nova-3 Medical — but only one at a time, chosen by STT_PROVIDER. Deciding
-- which one hears an Indian surgical ward best needs them heard against the SAME audio, not a
-- week on each and a vague memory. This table stores one such comparison per recording: what
-- each engine returned, how long it took, and which one the resident judged best.
--
-- SCOPE. A personal trial tool, not part of any patient's record. Rows belong to the person
-- who made them (author_id = auth.uid()) and are visible to no one else — deliberately unlike
-- entries/observations, which are shared across a ward. Nothing here is clinical; the audio
-- itself is not kept.
--
-- Safe to run more than once.

begin;

create table if not exists stt_comparisons (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references auth.users (id) on delete cascade,

  -- One object per engine that ran:
  --   { provider, model, text, corrected_text, ms, error }
  -- `text` is the raw hearing; `corrected_text` has the shared ward-glossary pass applied, so
  -- the comparison can be read either before or after the layer that is identical for all three.
  results          jsonb not null default '[]'::jsonb,

  duration_seconds numeric,               -- length of the clip, for a words-per-second sense
  note             text,                  -- optional: what was being said, ward noise, etc.
  best_provider    text,                  -- set later, when the resident picks a winner

  created_at       timestamptz not null default now()
);

create index if not exists stt_comparisons_author_idx
  on stt_comparisons (author_id, created_at desc);

alter table stt_comparisons enable row level security;

drop policy if exists stt_comparisons_own on stt_comparisons;
create policy stt_comparisons_own on stt_comparisons for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- RLS restricts the rows; the role still needs the table privilege or every query 403s before
-- a policy is even consulted. (See the onboarding/shared-unit breakages that were exactly this.)
grant select, insert, update, delete on stt_comparisons to authenticated;

commit;
