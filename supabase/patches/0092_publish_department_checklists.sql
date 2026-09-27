-- 0092 — publish the department ward checklists seeded by 0089, 0090 and 0091.
--
-- Signed off by Dr Anubhav Verma on 2026-09-28 (PR "Ward checklists for every department").
-- Residents only see published protocols (company_protocols RLS), so until this runs the new
-- picker rows open onto empty checklists. Same shape as 0069, which published medicine's.
--
-- Publishes exactly the 71 protocols those three patches seed, by title — nothing else,
-- in particular not the oncology or surgical drafts. Idempotent: an already-published row is
-- left alone.

begin;

update company_protocols
set status = 'published', published_at = now()
where status <> 'published'
  and title in (
  'Acute Asthma — Checklist',
  'Acute Burns (Resuscitation) — Checklist',
  'Acute Psychosis — Admission Checklist',
  'Alcohol Withdrawal — Checklist',
  'Antenatal Admission — Checklist',
  'Autoimmune Blistering Disease — Checklist',
  'COPD Exacerbation — Checklist',
  'Caesarean Section (LSCS) — Post-operative Checklist',
  'Caesarean Section (LSCS) — Pre-operative Checklist',
  'Cast, Slab and Traction Care — Checklist',
  'Cataract Surgery — Post-operative Checklist',
  'Cataract Surgery — Pre-operative Checklist',
  'Corneal Ulcer — Admission Checklist',
  'Craniotomy — Post-operative Checklist',
  'Craniotomy — Pre-operative Checklist',
  'Ear Surgery (Tympanoplasty / Mastoidectomy) — Post-operative Checklist',
  'Ear Surgery (Tympanoplasty / Mastoidectomy) — Pre-operative Checklist',
  'Erythroderma — Checklist',
  'FESS — Post-operative Checklist',
  'FESS — Pre-operative Checklist',
  'Febrile Seizure — Checklist',
  'Flap Surgery — Post-operative Checklist',
  'Flap Surgery — Pre-operative Checklist',
  'Fracture Fixation — Post-operative Checklist',
  'Fracture Fixation — Pre-operative Checklist',
  'Glaucoma Surgery — Post-operative Checklist',
  'Glaucoma Surgery — Pre-operative Checklist',
  'Hand Surgery — Post-operative Checklist',
  'Hand Surgery — Pre-operative Checklist',
  'Head Injury — Checklist',
  'Heat Illness — Checklist',
  'Hip Fracture — Post-operative Checklist',
  'Hip Fracture — Pre-operative Checklist',
  'Joint Replacement (Arthroplasty) — Post-operative Checklist',
  'Joint Replacement (Arthroplasty) — Pre-operative Checklist',
  'Leprosy Reaction — Checklist',
  'Mania — Admission Checklist',
  'Neonatal Sepsis — Checklist',
  'Nephrectomy — Post-operative Checklist',
  'Nephrectomy — Pre-operative Checklist',
  'Normal Delivery — Labour Admission Checklist',
  'Normal Delivery — Postnatal Checklist',
  'Open Fracture — Post-operative Checklist',
  'Open Fracture — Pre-operative Checklist',
  'Paediatric Dehydration — Checklist',
  'Paediatric Pneumonia — Checklist',
  'Pleural Drain (ICD / Tapping) — Checklist',
  'Poisoning — Checklist',
  'Polytrauma — Checklist',
  'Pre-eclampsia — Admission Checklist',
  'SJS / TEN — Admission Checklist',
  'Severe Acute Malnutrition — Checklist',
  'Skin Graft — Post-operative Checklist',
  'Skin Graft — Pre-operative Checklist',
  'Snakebite — Checklist',
  'Spine Surgery — Post-operative Checklist',
  'Spine Surgery — Pre-operative Checklist',
  'Stone Surgery (URS / PCNL / DJ Stent) — Post-operative Checklist',
  'Stone Surgery (URS / PCNL / DJ Stent) — Pre-operative Checklist',
  'Suicide Risk — Checklist',
  'TURP — Post-operative Checklist',
  'TURP — Pre-operative Checklist',
  'Tonsillectomy — Post-operative Checklist',
  'Tonsillectomy — Pre-operative Checklist',
  'Tracheostomy — Post-operative Checklist',
  'Tracheostomy — Pre-operative Checklist',
  'Urinary Retention — Checklist',
  'VP Shunt — Post-operative Checklist',
  'VP Shunt — Pre-operative Checklist',
  'Vitreoretinal Surgery — Post-operative Checklist',
  'Vitreoretinal Surgery — Pre-operative Checklist'
  );

commit;
