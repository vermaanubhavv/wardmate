-- Which printable layout /note prints against: the ESIC Medical College Faridabad pilot's own
-- paper form (the fixed 11-line structure lib/progress-note.ts was built from, word for word),
-- or the generic SOAP layout everyone else gets.
--
-- Every ward in this database today IS the ESIC Faridabad pilot — general surgery units,
-- oncology, internal medicine, all one hospital (see the pilot sign-off notes throughout
-- lib/scoring/definitions and lib/esic-payload.ts). So existing wards are backfilled true, kept
-- on the sheet they already print and sign. The column defaults false, so any ward created after
-- this patch — a different hospital coming onto the app — gets the SOAP layout without anyone
-- having to opt out of ESIC's.
--
-- Idempotent + self-transaction-wrapped per repo convention.

begin;

alter table wards add column if not exists is_esic_faridabad boolean not null default false;

update wards set is_esic_faridabad = true where not is_esic_faridabad;

notify pgrst, 'reload schema';

commit;
