-- 0099 — publish the general-surgery ward checklists: the sixteen in 0037 / 0038 (word for word
-- the care_templates checklists residents already see, never published) and the seventeen new
-- ones in 0097 / 0098.
--
-- Signed off by Dr Anubhav Verma on 2026-09-28 (PR "General surgery ward checklists: nine new
-- procedures"). Same shape as 0069 / 0092 / 0096: exactly these 37, by title; idempotent.

begin;

update company_protocols
set status = 'published', published_at = now()
where status <> 'published'
  and title in (
  'Lap Chole — Before Surgery Checklist',
  'Lap Chole — After Surgery Checklist',
  'Appendicectomy, Acute — Before Surgery Checklist',
  'Appendicectomy, Acute — After Surgery Checklist',
  'Appendicectomy, Interval — Before Surgery Checklist',
  'Appendicectomy, Interval — After Surgery Checklist',
  'Inguinal Hernia — Before Surgery Checklist',
  'Inguinal Hernia — After Surgery Checklist',
  'Umbilical Hernia — Before Surgery Checklist',
  'Umbilical Hernia — After Surgery Checklist',
  'Epigastric Hernia — Before Surgery Checklist',
  'Epigastric Hernia — After Surgery Checklist',
  'Incisional Hernia — Before Surgery Checklist',
  'Incisional Hernia — After Surgery Checklist',
  'Anal Fissure — Before Surgery Checklist',
  'Anal Fissure — After Surgery Checklist',
  'Anal Fistula — Before Surgery Checklist',
  'Anal Fistula — After Surgery Checklist',
  'Haemorrhoids — Before Surgery Checklist',
  'Haemorrhoids — After Surgery Checklist',
  'Breast Surgery — Pre-operative Checklist',
  'Breast Surgery — Post-operative Checklist',
  'Colorectal Resection — Pre-operative Checklist',
  'Colorectal Resection — Post-operative Checklist',
  'Gastrectomy — Pre-operative Checklist',
  'Gastrectomy — Post-operative Checklist',
  'Thyroidectomy — Pre-operative Checklist',
  'Thyroidectomy — Post-operative Checklist',
  'Abscess Drainage / Debridement — Pre-operative Checklist',
  'Abscess Drainage / Debridement — Post-operative Checklist',
  'Acute Pancreatitis — Ward Checklist',
  'Perforation Peritonitis — Pre-operative Checklist',
  'Perforation Peritonitis — Post-operative Checklist',
  'Intestinal Obstruction — Conservative Trial / Pre-operative Checklist',
  'Intestinal Obstruction — Post-operative Checklist',
  'Acute Cholecystitis — Pre-operative Checklist',
  'Acute Cholecystitis — Post-cholecystectomy Checklist'
  );

commit;
