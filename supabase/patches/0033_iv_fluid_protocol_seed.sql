-- CORE PROTOCOL 1 — IV Fluid Management, filed as six Quick Mode cards.
--
-- The source document (NICE CG174 / SCCM 2021, supplied by the unit) is a five-phase decision
-- algorithm — Resuscitation, Maintenance, Replacement, Redistribution, plus the assessment
-- that precedes it and the reassessment that runs through it — not a single flat checklist.
-- Quick Mode has no notion of sequence or branching, so cramming all of it into one card's
-- four lists would flatten "give this, then reassess, then branch" into an undifferentiated
-- pile. Filed as six cards instead, one per section of the source document, each small enough
-- to actually be a one-screen reference.
--
-- Deliberately NOT filed as red flags. The source document lists hypotension, shock, oliguria
-- etc. as INDICATIONS for choosing the resuscitation pathway — it does not rank them
-- warning/urgent/critical, and inventing that ranking would be exactly the kind of clinical
-- judgement this feature's own spec reserves for a human. They are filed as immediate_action
-- text instead, faithful to how the source actually presented them.
--
-- Every protocol below is inserted as 'draft'. Publishing is a deliberate, separate act from
-- /protocols, by a human who has read it back against the source.
--
-- Safe to run more than once — each block checks for its own title+version before inserting
-- anything, protocol or items.

begin;

do $$
declare
  publisher_id uuid := (select id from auth.users where lower(email) = 'anubhavsinhmar@gmail.com');
  new_id uuid;
begin
  -- 1. Assessment before prescribing (source sections A + B)
  if not exists (select 1 from company_protocols where title = 'IV Fluids — Assessment Before Prescribing' and version = 'v1') then
    insert into company_protocols (title, version, source_name, source_url, phase, status, created_by)
    values ('IV Fluids — Assessment Before Prescribing', 'v1', 'NICE CG174', 'https://www.nice.org.uk/guidance/cg174/chapter/recommendations', 'any', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt) values
      (new_id, 'immediate_action', 1, 'History: oral intake over preceding 24–48h, duration of fasting, thirst, vomiting (frequency, estimated volume, bilious/non-bilious), diarrhoea, NG losses, stoma output, drain output, fistula output, fever, excess sweating, polyuria, blood loss, diuretic use'),
      (new_id, 'immediate_action', 2, 'Comorbidities to check: CKD, AKI, heart failure, cirrhosis, nephrotic syndrome, diabetes, malnutrition'),
      (new_id, 'immediate_action', 3, 'Examination: HR, BP (± postural BP if relevant), capillary refill, peripheral temperature, JVP, oral mucosa, skin/tissue hydration, peripheral oedema, sacral oedema, lung crepitations, SpO₂, daily weight where appropriate'),
      (new_id, 'immediate_action', 4, 'Fluid monitoring to document: oral intake, IV intake, urine output, NG output, drain output, stoma output, vomitus/stools, net balance'),
      (new_id, 'investigation', 5, 'ABG'),
      (new_id, 'investigation', 6, 'Routine investigations: CBC, LFT, KFT, SE'),
      (new_id, 'investigation', 7, 'Viral markers'),
      (new_id, 'investigation', 8, 'PT-INR'),
      (new_id, 'pathway_step', 9, 'Reassess clinically, with KFT/electrolytes and fluid balance, at least daily while continuing IV therapy — resuscitation and replacement patients may need much more frequent review (NICE CG174)');
  end if;

  -- 2. Resuscitation (source section C)
  if not exists (select 1 from company_protocols where title = 'IV Fluids — Resuscitation' and version = 'v1') then
    insert into company_protocols (title, version, source_name, source_url, phase, status, created_by)
    values ('IV Fluids — Resuscitation', 'v1', 'NICE CG174 / Surviving Sepsis Campaign 2021', 'https://www.nice.org.uk/guidance/cg174/chapter/recommendations', 'any', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt) values
      (new_id, 'immediate_action', 1, 'Indications: hypotension, poor peripheral perfusion, tachycardia attributable to hypovolaemia, significant acute volume loss, oliguria with evidence of hypovolaemia, elevated lactate/hypoperfusion, shock'),
      (new_id, 'immediate_action', 2, 'Give an isotonic crystalloid — Normal Saline (NS) or Ringer Lactate (RL) — typically 500 mL over <15 minutes'),
      (new_id, 'immediate_action', 3, 'After every bolus, reassess: HR → BP/MAP → CRT → lungs → JVP → mental state → urine output → lactate if relevant'),
      (new_id, 'immediate_action', 4, 'Septic shock or sepsis-induced hypoperfusion: at least 30 mL/kg crystalloid in the first 3 hours — a weak recommendation; reassess throughout rather than fluid-loading indiscriminately'),
      (new_id, 'investigation', 5, 'Lactate, if relevant to perfusion status'),
      (new_id, 'pathway_step', 6, 'Decide next step after reassessment: repeat bolus / stop / assess for vasopressors / control bleeding source / operative intervention');
  end if;

  -- 3. Routine maintenance (source section D)
  if not exists (select 1 from company_protocols where title = 'IV Fluids — Routine Maintenance' and version = 'v1') then
    insert into company_protocols (title, version, source_name, source_url, phase, status, created_by)
    values ('IV Fluids — Routine Maintenance', 'v1', 'NICE CG174', 'https://www.nice.org.uk/guidance/cg174/chapter/recommendations', 'any', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt) values
      (new_id, 'immediate_action', 1, 'For a patient who cannot meet fluid needs orally/enterally but is otherwise euvolaemic — daily requirement: water 25–30 mL/kg/day, Na ~1 mmol/kg/day, K ~1 mmol/kg/day, Cl ~1 mmol/kg/day, glucose 50–100 g/day to reduce starvation ketosis'),
      (new_id, 'immediate_action', 2, 'Reduce to approximately 20–25 mL/kg/day in: elderly/frail, cardiac failure, renal impairment, malnutrition/refeeding risk'),
      (new_id, 'immediate_action', 3, 'In obesity, calculate toward ideal body weight rather than using actual body weight indiscriminately');
  end if;

  -- 4. Replacement (source section E)
  if not exists (select 1 from company_protocols where title = 'IV Fluids — Replacement' and version = 'v1') then
    insert into company_protocols (title, version, source_name, source_url, phase, status, created_by)
    values ('IV Fluids — Replacement', 'v1', 'Unit protocol', null, 'any', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt) values
      (new_id, 'immediate_action', 1, 'Replacement is separate from maintenance — document the abnormal loss requiring replacement (e.g. "NG output 1.4 L/24h → abnormal loss requiring replacement") rather than simply increasing the maintenance rate'),
      (new_id, 'immediate_action', 2, 'Total = maintenance + replacement of abnormal losses (NG, vomiting, stoma, diarrhoea, fistula, drains) + correction of any existing deficit');
  end if;

  -- 5. Redistribution risk (source section F)
  if not exists (select 1 from company_protocols where title = 'IV Fluids — Redistribution Risk' and version = 'v1') then
    insert into company_protocols (title, version, source_name, source_url, phase, status, created_by)
    values ('IV Fluids — Redistribution Risk', 'v1', 'Unit protocol', null, 'any', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt) values
      (new_id, 'immediate_action', 1, 'Consider redistribution/third-spacing in: sepsis, pancreatitis, peritonitis, major postoperative inflammatory response, hypoalbuminaemia, ascites, oedema'),
      (new_id, 'immediate_action', 2, 'A swollen patient can still have poor effective circulating volume — visible oedema does not mean the patient is fluid-replete intravascularly'),
      (new_id, 'immediate_action', 3, 'Do not give fluid on a fixed-volume rule (e.g. a flat "3 L RL/day") in this context — reassess individually');
  end if;

  -- 6. Reassessment (source section G)
  if not exists (select 1 from company_protocols where title = 'IV Fluids — Reassessment' and version = 'v1') then
    insert into company_protocols (title, version, source_name, source_url, phase, status, created_by)
    values ('IV Fluids — Reassessment', 'v1', 'NICE CG174', 'https://www.nice.org.uk/guidance/cg174/chapter/recommendations', 'any', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt) values
      (new_id, 'immediate_action', 1, 'Every ward round, ask: does this patient still require IV fluid?'),
      (new_id, 'immediate_action', 2, 'If the patient is drinking adequately, stop unnecessary IV fluids'),
      (new_id, 'pathway_step', 3, 'Use IV fluid therapy only when oral/enteral routes cannot meet needs, and stop it as soon as possible (NICE CG174)');
  end if;
end $$;

commit;
