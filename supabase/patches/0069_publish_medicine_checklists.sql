-- Publish the five internal-medicine checklists for alpha testing.
--
-- Patches 0064 and 0067 seeded five checklist protocols as 'draft' — invisible to residents
-- until published, on purpose, pending the medicine unit's read-through. The product owner has
-- now asked to publish everything and begin alpha testing, correcting from real use rather than
-- holding it back for a full departmental review first (same basis the scores and discharge
-- templates were released on — see docs/specialty-packs.md §9, lib/specialty/internal-medicine.ts).
--
-- Idempotent: re-running this only re-stamps published_at/published_by on rows already published.
-- Requires: 0064_medicine_checklists.sql, 0067_medicine_checklists_2.sql.

begin;

update company_protocols
set status = 'published',
    published_at = now()
where title in (
  'Febrile Illness — Admission Checklist',
  'Diabetic Ketoacidosis — Checklist',
  'Hypertensive Emergency — Checklist',
  'Suspected VTE — Checklist',
  'Dengue — Warning Signs Checklist'
)
and status <> 'published';

commit;
