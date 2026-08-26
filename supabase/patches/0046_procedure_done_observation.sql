-- Lets the app recognise "underwent lap chole", "s/p appendicectomy" — an operation reported as
-- ALREADY performed, not planned — as its own kind, distinct from planned_procedure (0039). See
-- lib/extract.ts for the extraction rule and lib/apply-procedure-done.ts for what happens when
-- one is recorded: the patient flips to post-operative immediately, no separate confirmation
-- step, which is what drives the post-op day count, the discharge summary's operative date, and
-- which checklist/protocol applies.
--
-- Without this patch, an observation of this kind fails the enum check on insert — and because
-- observations for one entry are inserted as a single batch, that ONE bad value fails the whole
-- insert and silently drops every other real finding from the same round (BP, drain, plan, all
-- of it), surfacing to the resident as "Nothing clinical was found in this." That is exactly the
-- bug this patch fixes: the code shipped a new kind without this migration alongside it.
--
-- A new enum value must be committed before any statement can use it — hence the split into two
-- transactions in one file, the same shape 0039_planned_procedure_observation.sql used.

begin;
alter type observation_kind add value if not exists 'procedure_done';
commit;

begin;
select 1; -- no-op transaction; the enum value above is now visible to the app.
commit;
