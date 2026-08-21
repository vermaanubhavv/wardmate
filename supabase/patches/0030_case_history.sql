-- The admission clerking note — history, examination, provisional diagnosis, plan — captured
-- once per patient rather than folded into the day-by-day round record.
--
-- It is still an ENTRY, not a new kind of thing. Everything that already exists for an entry —
-- the verbatim-quote check on extraction, the stored photo or audio as evidence, tap-to-edit,
-- the (i) showing what was actually said or photographed — applies to a case history exactly as
-- it does to a round note, because it is read and structured by the same pipeline. The only
-- thing that makes it different is where it is SHOWN: pinned near the top of the patient's page
-- as standing context, not folded into a dated day the way an ordinary round note is.
--
-- is_case_history is a plain boolean rather than a new value on entry_source, deliberately.
-- source already says HOW it was captured (voice or photo); this says WHAT it is for. The two
-- are independent — a case history can arrive either way — and entry_source is a Postgres enum,
-- which cannot safely gain a value inside the same transaction that would go on to use it.
--
-- Safe to run more than once.

begin;

alter table entries add column if not exists is_case_history boolean not null default false;

-- One patient normally has one, occasionally an addendum. Read far more often than written,
-- and only ever filtered on patient_id + this flag, so a partial index costs little and keeps
-- the patient page's case-history lookup off a full scan of that patient's entries.
create index if not exists entries_case_history_idx
  on entries (patient_id)
  where is_case_history;

commit;
