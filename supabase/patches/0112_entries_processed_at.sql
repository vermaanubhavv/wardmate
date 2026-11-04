-- When a dictation recorded with no signal was actually processed.
--
-- The live dictation panel (note, discharge, clerking) records onto the phone when there is no
-- signal and sends the take later (app/api/entries/late-dictation). The entry is timed when the
-- words were SAID — recorded_at, so it lands on the right day's note — and this column says when
-- the server got to it, so the timeline can show "recorded 10:42, processed 11:15".
--
-- Null for everything else: an entry processed as it was recorded needs no second time.
--
-- Additive; safe to run more than once.

begin;

alter table entries add column if not exists processed_at timestamptz;

commit;
