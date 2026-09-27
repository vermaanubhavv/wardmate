-- 0096 — publish the medicine and oncology checklists seeded by 0093, 0094 and 0095, and the two
-- oncology checklists 0061 seeded but no patch ever published (febrile neutropenia, chemo cycle).
--
-- Signed off by Dr Anubhav Verma on 2026-09-28 (PR "Fill the empty medicine and oncology
-- checklists"). Residents only see published protocols, so until this runs those picker entries
-- open onto empty checklists. Same shape as 0069 and 0092: exactly these 24, by title;
-- idempotent.

begin;

update company_protocols
set status = 'published', published_at = now()
where status <> 'published'
  and title in (
  'Sepsis — Admission Checklist',
  'Enteric Fever — Checklist',
  'Malaria — Checklist',
  'Scrub Typhus — Checklist',
  'Community-Acquired Pneumonia — Checklist',
  'Pyelonephritis — Checklist',
  'Cellulitis — Checklist',
  'Pulmonary Tuberculosis — NTEP Checklist',
  'Acute Febrile Encephalopathy — Checklist',
  'Hyperosmolar Hyperglycaemic State — Checklist',
  'Uncontrolled Diabetes — Checklist',
  'Uncontrolled Hypertension — Checklist',
  'Anaemia Evaluation — Checklist',
  'Thrombocytopenia — Checklist',
  'Pancytopenia — Checklist',
  'SLE Flare — Checklist',
  'HIV with Opportunistic Infection — Checklist',
  'Chemotherapy Toxicity — Admission Checklist',
  'Acute Leukaemia Induction — Checklist',
  'Lymphoma Chemotherapy — Checklist',
  'Multiple Myeloma — Checklist',
  'Transfusion Support — Checklist',
  'Febrile Neutropenia — Admission Checklist',
  'Chemotherapy Cycle — Checklist'
  );

commit;
