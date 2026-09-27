-- Ward checklists for urology, neurosurgery, burns & plastic surgery and pulmonary medicine.
--
-- WHAT THIS SEEDS. Fifteen template families, each a company_protocols row (or two) plus its
-- items, and one care_templates picker row per family so the ward picker can offer it:
--   urology              turp, stone_surgery, nephrectomy, urinary_retention
--   neurosurgery         head_injury, craniotomy, spine_surgery, vp_shunt
--   burns & plastic      acute_burns, skin_graft, flap_surgery, hand_surgery
--   pulmonary medicine   copd_exacerbation, acute_asthma, pleural_drain
--
-- PHASES. lib/templates.ts phaseFor() files a patient under 'after_surgery' once they have an
-- operation date, else 'before_surgery'. Operative families therefore get two protocols
-- ('… — Pre-operative Checklist' / '… — Post-operative Checklist'); non-operative families
-- (urinary_retention, head_injury, acute_burns, all three pulmonary) get one 'before_surgery'
-- protocol, since those patients carry no operation date. The picker row uses the pack's
-- pickerPhase: 'after_surgery' for urology, neurosurgery and burns; 'before_surgery' for
-- pulmonary (which also keeps medicine's cap, pulmonary_tb and vte_suspected).
--
-- TRIGGERS (patch 0058, lib/checklist-triggers.ts) only where time or history genuinely changes
-- whether a line applies: post-op day for trial void / first graft look / flap chart, hours
-- since admission for antibiotic-style reviews, and history patterns for PCNL-only and
-- electrical-burn-only lines. No drug doses anywhere.
--
-- STATUS. Every protocol is 'draft', version 'v1-draft' — residents cannot see them until
-- published (getTemplateForPatient matches published protocols only).
--
-- CLINICAL CONTENT: PENDING CLINICIAN REVIEW — seeded as draft; a later patch publishes it.
--
-- Requires: 0026, 0032, 0036, 0040, 0056, 0058, 0060 and the department patches 0081, 0085, 0086.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

-- =============================================================================
-- UROLOGY
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  -- TURP — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'TURP — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('TURP — Pre-operative Checklist', 'v1-draft', 'WardMate urology pack',
            'turp', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'lower urinary tract symptoms / IPSS', 'core', null, 'subjective', null,
      array['ipss','luts','frequency','nocturia','poor stream','hesitancy','dribbling','straining'],
      null),
    (p_id, 'investigation', 2, 'indication for surgery', 'core', null, 'subjective', null,
      array['retention','failed trial void','recurrent uti','bladder stone','haematuria','failed medical therapy'],
      null),
    (p_id, 'investigation', 3, 'catheter status', 'core', null, 'objective', 'Not catheterised',
      array['catheterised','per urethral catheter','foley','suprapubic catheter','spc'],
      null),
    (p_id, 'investigation', 4, 'digital rectal examination', 'core', null, 'objective', null,
      array['dre','per rectal','prostate size','prostate consistency','nodule'],
      null),
    (p_id, 'investigation', 5, 'ultrasound KUB with prostate volume and residual urine', 'core', null, 'objective', null,
      array['usg kub','prostate volume','pvr','post void residual','hydronephrosis','upper tracts'],
      null),
    (p_id, 'investigation', 6, 'PSA', 'core', null, 'objective', null,
      array['psa','prostate specific antigen'],
      null),
    (p_id, 'investigation', 7, 'urine culture sterile', 'core', null, 'objective', 'Urine culture sterile',
      array['urine culture','urine c/s','uti','sterile urine','urine routine'],
      null),
    (p_id, 'investigation', 8, 'renal function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','rft','kft','electrolytes'],
      null),
    (p_id, 'investigation', 9, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 10, 'uroflowmetry', 'optional', null, 'objective', null,
      array['uroflow','qmax','flow rate'],
      null),
    (p_id, 'investigation', 11, 'blood grouped and cross-matched', 'core', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'investigation', 12, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 13, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent','retrograde ejaculation explained'],
      null),
    (p_id, 'investigation', 14, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- TURP — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'TURP — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('TURP — Post-operative Checklist', 'v1-draft', 'WardMate urology pack',
            'turp', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'continuous bladder irrigation', 'core', null, 'objective', null,
      array['cbi','irrigation','irrigation running','irrigation stopped','irrigation rate'],
      null),
    (p_id, 'investigation', 3, 'irrigation effluent colour', 'core', null, 'objective', 'Clear effluent',
      array['effluent','urine colour','pink','rose','clear','haematuria','bag colour'],
      null),
    (p_id, 'red_flag', 4, 'clot retention', 'core', 'urgent', 'objective', 'No clot retention',
      array['clots','catheter blocked','clot','bladder washout','distended bladder','suprapubic pain'],
      null),
    (p_id, 'investigation', 5, 'catheter traction', 'optional', null, 'objective', null,
      array['traction','catheter traction released'],
      null),
    (p_id, 'investigation', 6, 'serum sodium', 'core', null, 'objective', null,
      array['sodium','na','electrolytes','hyponatraemia'],
      '{"when": [{"type": "pod_lte", "days": 1}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 7, 'TURP syndrome signs', 'core', 'critical', 'objective', 'No confusion, bradycardia or visual disturbance',
      array['turp syndrome','confusion','restless','bradycardia','hyponatraemia','visual disturbance','nausea'],
      null),
    (p_id, 'investigation', 8, 'haemoglobin', 'optional', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'investigation', 9, 'input / output chart', 'core', null, 'objective', null,
      array['intake output','i/o','urine output','irrigation balance'],
      null),
    (p_id, 'red_flag', 10, 'fever / urosepsis', 'core', 'urgent', 'objective', 'Afebrile',
      array['fever','rigors','urosepsis','chills','hypotension'],
      null),
    (p_id, 'investigation', 11, 'catheter removal and trial void', 'core', null, 'plan', null,
      array['trial void','twoc','catheter removed','voiding well','catheter out'],
      '{"when": [{"type": "pod_gte", "days": 2}]}'::jsonb),
    (p_id, 'investigation', 12, 'histopathology', 'optional', null, 'objective', null,
      array['hpe','histopath','biopsy','specimen'],
      null),
    (p_id, 'pathway_step', 13, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','uroflow review','hpe review'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Stone Surgery (URS / PCNL / DJ Stent) — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Stone Surgery (URS / PCNL / DJ Stent) — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Stone Surgery (URS / PCNL / DJ Stent) — Pre-operative Checklist', 'v1-draft', 'WardMate urology pack',
            'stone_surgery', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'stone size, site and side', 'core', null, 'objective', null,
      array['stone size','laterality','renal pelvis','ureteric','lower calyx','staghorn','hounsfield'],
      null),
    (p_id, 'investigation', 2, 'NCCT KUB', 'core', null, 'objective', null,
      array['ncct','ct kub','ct urogram','ncct kub'],
      null),
    (p_id, 'investigation', 3, 'hydronephrosis', 'core', null, 'objective', null,
      array['hydro','hdn','pelvicalyceal dilatation','hydroureteronephrosis'],
      null),
    (p_id, 'investigation', 4, 'urine culture sterile', 'core', null, 'objective', 'Urine culture sterile',
      array['urine culture','urine c/s','uti','sterile urine','urine routine'],
      null),
    (p_id, 'investigation', 5, 'renal function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','rft','kft','electrolytes'],
      null),
    (p_id, 'investigation', 6, 'split function / renal scan', 'optional', null, 'objective', null,
      array['dtpa','ec scan','split function','renogram'],
      null),
    (p_id, 'investigation', 7, 'pre-existing stent or nephrostomy', 'core', null, 'objective', 'No stent or nephrostomy',
      array['dj stent','pcn','nephrostomy','stent in situ'],
      null),
    (p_id, 'investigation', 8, 'coagulation profile and platelets', 'core', null, 'objective', 'Normal',
      array['pt','inr','aptt','coagulation','platelets','platelet count'],
      null),
    (p_id, 'investigation', 9, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 10, 'blood grouped and cross-matched', 'optional', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'pathway_step', 11, 'procedure planned', 'core', null, 'plan', null,
      array['urs','rirs','pcnl','mini pcnl','dj stenting','eswl','cystoscopy'],
      null),
    (p_id, 'investigation', 12, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 13, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 14, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Stone Surgery (URS / PCNL / DJ Stent) — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Stone Surgery (URS / PCNL / DJ Stent) — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Stone Surgery (URS / PCNL / DJ Stent) — Post-operative Checklist', 'v1-draft', 'WardMate urology pack',
            'stone_surgery', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'urine colour / haematuria', 'core', null, 'objective', 'Clear urine',
      array['urine colour','haematuria','pink urine','clear urine'],
      null),
    (p_id, 'investigation', 3, 'nephrostomy tube output', 'core', null, 'objective', null,
      array['pcn','nephrostomy','pcn output','tube output','pcn clamped','pcn removed'],
      '{"when": [{"type": "history", "pattern": "pcnl|nephrostomy|\\bpcn\\b"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 4, 'catheter', 'core', null, 'objective', null,
      array['foley','catheter','catheter removed','voiding'],
      null),
    (p_id, 'investigation', 5, 'flank / tube site', 'core', null, 'objective', 'Tube site dry',
      array['flank','tube site','leak','urine leak','wound'],
      null),
    (p_id, 'red_flag', 6, 'fever / urosepsis', 'core', 'urgent', 'objective', 'Afebrile',
      array['fever','rigors','urosepsis','chills','hypotension'],
      null),
    (p_id, 'red_flag', 7, 'significant bleeding', 'core', 'critical', 'objective', 'No significant bleeding',
      array['bleeding','clots','falling hb','pcn bleed','tachycardia'],
      null),
    (p_id, 'red_flag', 8, 'breathlessness / pleural injury', 'core', 'urgent', 'objective', 'Chest clear',
      array['breathless','hydrothorax','pleural effusion','reduced air entry','supracostal'],
      '{"when": [{"type": "history", "pattern": "pcnl|supracostal|nephrostomy|\\bpcn\\b"}]}'::jsonb),
    (p_id, 'investigation', 9, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'investigation', 10, 'residual stone on check imaging', 'core', null, 'objective', null,
      array['kub x-ray','ncct','residual fragments','stone clearance','stone free'],
      null),
    (p_id, 'investigation', 11, 'DJ stent in situ and removal date', 'core', null, 'plan', 'No stent placed',
      array['dj stent','stent','stent removal','stent card','stent date'],
      null),
    (p_id, 'investigation', 12, 'stone analysis sent', 'optional', null, 'plan', null,
      array['stone analysis','stone composition'],
      null),
    (p_id, 'pathway_step', 13, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','stent removal date','metabolic workup','fluid intake advice'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Nephrectomy — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Nephrectomy — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Nephrectomy — Pre-operative Checklist', 'v1-draft', 'WardMate urology pack',
            'nephrectomy', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'indication', 'core', null, 'subjective', null,
      array['rcc','renal mass','non functioning kidney','pyonephrosis','donor','xgp'],
      null),
    (p_id, 'investigation', 2, 'contrast CT and staging', 'core', null, 'objective', null,
      array['cect','ct abdomen','ct urography','staging','ivc thrombus','renal vein','tnm'],
      null),
    (p_id, 'investigation', 3, 'contralateral kidney function', 'core', null, 'objective', null,
      array['dtpa','split function','contralateral kidney','other kidney'],
      null),
    (p_id, 'investigation', 4, 'renal function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','rft','kft','electrolytes'],
      null),
    (p_id, 'investigation', 5, 'chest imaging', 'core', null, 'objective', 'No metastases',
      array['cxr','ct chest','metastasis','chest x-ray'],
      null),
    (p_id, 'investigation', 6, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'investigation', 7, 'coagulation profile and platelets', 'core', null, 'objective', 'Normal',
      array['pt','inr','aptt','coagulation','platelets','platelet count'],
      null),
    (p_id, 'investigation', 8, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 9, 'blood grouped and cross-matched', 'core', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'investigation', 10, 'urine culture sterile', 'core', null, 'objective', 'Urine culture sterile',
      array['urine culture','urine c/s','uti','sterile urine','urine routine'],
      null),
    (p_id, 'pathway_step', 11, 'approach planned', 'core', null, 'plan', null,
      array['open','laparoscopic','radical','partial','simple','robotic'],
      null),
    (p_id, 'investigation', 12, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 13, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 14, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Nephrectomy — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Nephrectomy — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Nephrectomy — Post-operative Checklist', 'v1-draft', 'WardMate urology pack',
            'nephrectomy', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'urine output', 'core', null, 'objective', null,
      array['uo','urine output','hourly urine','input output'],
      null),
    (p_id, 'investigation', 3, 'renal function', 'core', null, 'objective', null,
      array['creatinine','urea','rft','kft','electrolytes'],
      '{"when": [{"type": "pod_gte", "days": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 4, 'drain output', 'core', null, 'objective', null,
      array['drain','drain fluid','drain removed'],
      null),
    (p_id, 'red_flag', 5, 'bleeding / haemodynamic instability', 'core', 'critical', 'objective', 'Haemodynamically stable',
      array['tachycardia','hypotension','falling hb','blood in drain','shock'],
      null),
    (p_id, 'investigation', 6, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'investigation', 7, 'chest / respiratory', 'core', null, 'objective', 'Chest clear',
      array['air entry','incentive spirometry','pneumothorax','atelectasis','breathing exercise'],
      null),
    (p_id, 'investigation', 8, 'abdomen and bowel function', 'core', null, 'objective', null,
      array['flatus','bowel sounds','distension','ileus','bowels opened'],
      null),
    (p_id, 'investigation', 9, 'oral intake', 'core', null, 'objective', null,
      array['orals','tolerating orals','diet','feeds'],
      null),
    (p_id, 'investigation', 10, 'wound', 'core', null, 'objective', 'Wound healthy',
      array['incision','dressing','suture line','soakage','wound'],
      null),
    (p_id, 'investigation', 11, 'ambulation and VTE prophylaxis', 'core', null, 'plan', null,
      array['mobilised','ambulating','dvt prophylaxis','stockings'],
      null),
    (p_id, 'red_flag', 12, 'chyle or urine leak', 'core', 'warning', 'objective', 'No chyle or urine leak',
      array['milky drain','chyle','urine leak','drain creatinine'],
      null),
    (p_id, 'investigation', 13, 'histopathology', 'optional', null, 'objective', null,
      array['hpe','histopath','biopsy','specimen'],
      null),
    (p_id, 'pathway_step', 14, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','hpe review','renal function follow up'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Urinary Retention — Checklist
  select id into p_id from company_protocols
   where title = 'Urinary Retention — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Urinary Retention — Checklist', 'v1-draft', 'WardMate urology pack',
            'urinary_retention', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'onset and precipitant', 'core', null, 'subjective', null,
      array['acute','chronic','painful','painless','constipation','anticholinergic','post op','alcohol','drug induced'],
      null),
    (p_id, 'investigation', 2, 'prior lower urinary tract symptoms', 'core', null, 'subjective', null,
      array['luts','ipss','poor stream','frequency','nocturia','hesitancy'],
      null),
    (p_id, 'investigation', 3, 'catheterised: date and volume drained', 'core', null, 'objective', null,
      array['catheterised','residual volume','drained','foley','catheter size'],
      null),
    (p_id, 'red_flag', 4, 'neurological cause screened', 'core', 'urgent', 'objective', 'No back pain, saddle anaesthesia or leg weakness',
      array['cauda equina','saddle anaesthesia','back pain','leg weakness','perianal sensation'],
      null),
    (p_id, 'investigation', 5, 'digital rectal examination', 'core', null, 'objective', null,
      array['dre','per rectal','prostate size','faecal loading'],
      null),
    (p_id, 'investigation', 6, 'renal function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','rft','kft','electrolytes'],
      null),
    (p_id, 'red_flag', 7, 'post-obstructive diuresis', 'core', 'warning', 'objective', 'No post-obstructive diuresis',
      array['diuresis','high urine output','polyuria','post obstructive'],
      null),
    (p_id, 'investigation', 8, 'urine routine and culture', 'core', null, 'objective', null,
      array['urine routine','urine culture','urine c/s','pus cells'],
      null),
    (p_id, 'investigation', 9, 'ultrasound KUB', 'core', null, 'objective', null,
      array['usg kub','prostate volume','hydronephrosis','bladder wall'],
      null),
    (p_id, 'investigation', 10, 'PSA', 'optional', null, 'objective', null,
      array['psa','prostate specific antigen'],
      null),
    (p_id, 'investigation', 11, 'alpha-blocker started', 'core', null, 'plan', null,
      array['alpha blocker','tamsulosin','silodosin','alfuzosin'],
      null),
    (p_id, 'investigation', 12, 'bowels', 'optional', null, 'subjective', null,
      array['constipation','bowels opened','stool'],
      null),
    (p_id, 'pathway_step', 13, 'trial void', 'core', null, 'plan', null,
      array['twoc','trial without catheter','voided','failed trial','pvr after void'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb),
    (p_id, 'pathway_step', 14, 'plan if trial fails', 'optional', null, 'plan', null,
      array['recatheterise','turp planned','cisc','long term catheter'],
      null);
end $$;


-- =============================================================================
-- NEUROSURGERY
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  -- Head Injury — Checklist
  select id into p_id from company_protocols
   where title = 'Head Injury — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Head Injury — Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'head_injury', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'mechanism and time of injury', 'core', null, 'subjective', null,
      array['rta','fall','assault','time of injury','helmet','two wheeler'],
      null),
    (p_id, 'investigation', 2, 'loss of consciousness / amnesia', 'core', null, 'subjective', null,
      array['loc','amnesia','lucid interval','unconscious'],
      null),
    (p_id, 'investigation', 3, 'vomiting, seizure or ENT bleed', 'core', null, 'subjective', 'No vomiting, seizure or ENT bleed',
      array['vomiting','seizure','ear bleed','nasal bleed','ent bleed','csf leak','otorrhoea','rhinorrhoea'],
      null),
    (p_id, 'investigation', 4, 'GCS', 'core', null, 'objective', null,
      array['gcs','glasgow coma scale','e v m','e4v5m6','sensorium'],
      null),
    (p_id, 'investigation', 5, 'pupils', 'core', null, 'objective', 'Pupils equal and reactive',
      array['pupils','perl','nerl','anisocoria','dilated pupil','pupil size'],
      null),
    (p_id, 'investigation', 6, 'hourly neuro observations charted', 'core', null, 'checks', null,
      array['neuro obs','hourly gcs','neuro chart','neuro observation'],
      null),
    (p_id, 'red_flag', 7, 'fall in GCS or new pupil asymmetry', 'core', 'critical', 'objective', 'No fall in GCS, pupils unchanged',
      array['gcs drop','deterioration','new anisocoria','blown pupil','cushing','bradycardia','drowsier'],
      null),
    (p_id, 'investigation', 8, 'CT head done', 'core', null, 'objective', null,
      array['ncct head','ct brain','edh','sdh','contusion','sah','midline shift','fracture'],
      null),
    (p_id, 'investigation', 9, 'cervical spine cleared', 'core', null, 'objective', null,
      array['c spine','cervical collar','neck','c-spine'],
      null),
    (p_id, 'investigation', 10, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 11, 'other injuries (secondary survey)', 'core', null, 'objective', 'No other injuries',
      array['chest injury','abdominal injury','fractures','secondary survey','efast'],
      null),
    (p_id, 'investigation', 12, 'seizure watch', 'core', null, 'objective', 'No seizures',
      array['seizure','fits','convulsion','antiepileptic','levetiracetam','phenytoin'],
      null),
    (p_id, 'investigation', 13, 'serum sodium', 'core', null, 'objective', null,
      array['sodium','na','electrolytes','hyponatraemia'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),
    (p_id, 'investigation', 14, 'repeat CT need reviewed', 'optional', null, 'assessment', null,
      array['repeat ct','follow up ct','interval ct'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),
    (p_id, 'investigation', 15, 'medico-legal case informed', 'optional', null, 'checks', null,
      array['mlc','medico legal','police intimation'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Craniotomy — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Craniotomy — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Craniotomy — Pre-operative Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'craniotomy', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'indication and lesion on imaging', 'core', null, 'objective', null,
      array['mri','ct','tumour','sol','edh','sdh','aneurysm','lesion'],
      null),
    (p_id, 'investigation', 2, 'GCS', 'core', null, 'objective', null,
      array['gcs','glasgow coma scale','e v m','e4v5m6','sensorium'],
      null),
    (p_id, 'investigation', 3, 'pupils', 'core', null, 'objective', 'Pupils equal and reactive',
      array['pupils','perl','nerl','anisocoria','dilated pupil','pupil size'],
      null),
    (p_id, 'investigation', 4, 'focal neurological deficit', 'core', null, 'objective', 'No focal deficit',
      array['power','weakness','hemiparesis','speech','cranial nerves','visual fields'],
      null),
    (p_id, 'investigation', 5, 'seizure history and antiepileptics', 'core', null, 'subjective', null,
      array['seizure','fits','antiepileptic','levetiracetam','phenytoin'],
      null),
    (p_id, 'investigation', 6, 'steroids', 'optional', null, 'plan', null,
      array['dexamethasone','steroid','perilesional oedema'],
      null),
    (p_id, 'investigation', 7, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 8, 'coagulation profile and platelets', 'core', null, 'objective', 'Normal',
      array['pt','inr','aptt','coagulation','platelets','platelet count'],
      null),
    (p_id, 'investigation', 9, 'sodium and blood sugar', 'core', null, 'objective', null,
      array['sodium','na','sugar','glucose','grbs'],
      null),
    (p_id, 'investigation', 10, 'blood grouped and cross-matched', 'core', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'investigation', 11, 'site and side marked', 'core', null, 'checks', null,
      array['site marked','side marked','laterality'],
      null),
    (p_id, 'investigation', 12, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 13, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 14, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Craniotomy — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Craniotomy — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Craniotomy — Post-operative Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'craniotomy', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'GCS', 'core', null, 'objective', null,
      array['gcs','glasgow coma scale','e v m','e4v5m6','sensorium'],
      null),
    (p_id, 'investigation', 3, 'pupils', 'core', null, 'objective', 'Pupils equal and reactive',
      array['pupils','perl','nerl','anisocoria','dilated pupil','pupil size'],
      null),
    (p_id, 'investigation', 4, 'hourly neuro observations charted', 'core', null, 'checks', null,
      array['neuro obs','hourly gcs','neuro chart','neuro observation'],
      '{"when": [{"type": "pod_lte", "days": 2}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 5, 'neurological deterioration', 'core', 'critical', 'objective', 'GCS stable, no new deficit',
      array['gcs drop','new weakness','drowsy','anisocoria','deterioration'],
      null),
    (p_id, 'investigation', 6, 'limb power / focal deficit', 'core', null, 'objective', 'No new focal deficit',
      array['power','weakness','hemiparesis','speech'],
      null),
    (p_id, 'investigation', 7, 'post-operative CT', 'core', null, 'objective', null,
      array['post op ct','ncct','check ct','haematoma','pneumocephalus','residual'],
      null),
    (p_id, 'investigation', 8, 'drain output', 'optional', null, 'objective', null,
      array['subgaleal drain','drain','evd','drain removed'],
      null),
    (p_id, 'investigation', 9, 'wound and bone flap', 'core', null, 'objective', 'Wound healthy, flap lax',
      array['wound','flap','bone flap','swelling','dressing'],
      null),
    (p_id, 'red_flag', 10, 'CSF leak', 'core', 'urgent', 'objective', 'No CSF leak',
      array['csf leak','rhinorrhoea','otorrhoea','wound leak'],
      null),
    (p_id, 'investigation', 11, 'seizure watch', 'core', null, 'objective', 'No seizures',
      array['seizure','fits','convulsion','antiepileptic','levetiracetam','phenytoin'],
      null),
    (p_id, 'investigation', 12, 'sodium and urine output', 'core', null, 'objective', null,
      array['sodium','urine output','polyuria','diabetes insipidus','siadh','csw'],
      null),
    (p_id, 'red_flag', 13, 'fever / meningism', 'core', 'urgent', 'objective', 'Afebrile, no neck stiffness',
      array['fever','neck stiffness','meningitis','photophobia'],
      null),
    (p_id, 'investigation', 14, 'mobilisation and VTE prophylaxis', 'core', null, 'plan', null,
      array['mobilised','stockings','dvt','compression','physiotherapy'],
      null),
    (p_id, 'investigation', 15, 'histopathology', 'optional', null, 'objective', null,
      array['hpe','histopath','biopsy','specimen'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Spine Surgery — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Spine Surgery — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Spine Surgery — Pre-operative Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'spine_surgery', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'indication and level on imaging', 'core', null, 'objective', null,
      array['mri spine','level','disc','pivd','canal stenosis','fracture','listhesis'],
      null),
    (p_id, 'investigation', 2, 'motor power by myotome', 'core', null, 'objective', null,
      array['power','mrc','myotomes','weakness','foot drop'],
      null),
    (p_id, 'investigation', 3, 'sensory level', 'core', null, 'objective', null,
      array['sensation','sensory level','dermatome','numbness'],
      null),
    (p_id, 'investigation', 4, 'bladder and bowel function', 'core', null, 'subjective', 'Bladder and bowel continent',
      array['bladder','bowel','retention','incontinence','saddle'],
      null),
    (p_id, 'investigation', 5, 'reflexes / long tract signs', 'optional', null, 'objective', null,
      array['reflexes','plantar','babinski','hoffmann','clonus'],
      null),
    (p_id, 'investigation', 6, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 7, 'coagulation profile and platelets', 'core', null, 'objective', 'Normal',
      array['pt','inr','aptt','coagulation','platelets','platelet count'],
      null),
    (p_id, 'investigation', 8, 'blood grouped and cross-matched', 'optional', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'investigation', 9, 'level marking and positioning plan', 'core', null, 'checks', null,
      array['level marking','prone','c-arm','positioning'],
      null),
    (p_id, 'investigation', 10, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 11, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 12, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Spine Surgery — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Spine Surgery — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Spine Surgery — Post-operative Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'spine_surgery', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'motor power compared with pre-op', 'core', null, 'objective', 'Power at pre-operative baseline',
      array['power','mrc','weakness','foot drop'],
      null),
    (p_id, 'investigation', 3, 'sensation', 'core', null, 'objective', 'Sensation at pre-operative baseline',
      array['sensation','numbness','sensory level'],
      null),
    (p_id, 'red_flag', 4, 'new weakness or cauda equina signs', 'core', 'critical', 'objective', 'No new deficit',
      array['new weakness','worsening power','saddle anaesthesia','retention','epidural haematoma'],
      null),
    (p_id, 'investigation', 5, 'bladder function / catheter', 'core', null, 'objective', null,
      array['catheter','voiding','retention','catheter removed'],
      null),
    (p_id, 'investigation', 6, 'drain output', 'core', null, 'objective', null,
      array['drain','hemovac','drain removed'],
      null),
    (p_id, 'investigation', 7, 'wound', 'core', null, 'objective', 'Wound healthy',
      array['incision','dressing','suture line','soakage','wound'],
      null),
    (p_id, 'red_flag', 8, 'CSF leak / dural tear', 'core', 'urgent', 'objective', 'No CSF leak',
      array['csf leak','dural tear','clear discharge','wound leak','postural headache'],
      null),
    (p_id, 'investigation', 9, 'radicular pain', 'core', null, 'subjective', null,
      array['pain','radicular pain','leg pain','arm pain','pain score'],
      null),
    (p_id, 'investigation', 10, 'mobilisation with brace', 'core', null, 'plan', null,
      array['mobilised','brace','collar','ambulation','physiotherapy'],
      null),
    (p_id, 'investigation', 11, 'check x-ray', 'optional', null, 'objective', null,
      array['post op x-ray','implant position','screws'],
      null),
    (p_id, 'investigation', 12, 'VTE prophylaxis', 'core', null, 'plan', null,
      array['dvt prophylaxis','stockings','compression'],
      null),
    (p_id, 'pathway_step', 13, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','brace advice','suture removal'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- VP Shunt — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'VP Shunt — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('VP Shunt — Pre-operative Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'vp_shunt', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'cause of hydrocephalus', 'core', null, 'subjective', null,
      array['hydrocephalus','tbm','tumour','congenital','nph','aqueductal stenosis'],
      null),
    (p_id, 'investigation', 2, 'raised ICP symptoms', 'core', null, 'subjective', null,
      array['headache','vomiting','blurring','diplopia','drowsy'],
      null),
    (p_id, 'investigation', 3, 'GCS', 'core', null, 'objective', null,
      array['gcs','glasgow coma scale','e v m','e4v5m6','sensorium'],
      null),
    (p_id, 'investigation', 4, 'pupils', 'core', null, 'objective', 'Pupils equal and reactive',
      array['pupils','perl','nerl','anisocoria','dilated pupil','pupil size'],
      null),
    (p_id, 'investigation', 5, 'fundus', 'core', null, 'objective', null,
      array['papilloedema','fundus','fundoscopy'],
      null),
    (p_id, 'investigation', 6, 'CT / MRI ventricles', 'core', null, 'objective', null,
      array['ct','mri','ventricles','evans index','periventricular lucency'],
      null),
    (p_id, 'investigation', 7, 'CSF analysis', 'optional', null, 'objective', null,
      array['csf','csf protein','csf cells','csf culture'],
      null),
    (p_id, 'red_flag', 8, 'active infection excluded', 'core', 'urgent', 'objective', 'No active infection',
      array['fever','csf infection','abdominal infection','skin infection','uti'],
      null),
    (p_id, 'investigation', 9, 'abdomen for peritoneal end', 'core', null, 'objective', 'Abdomen soft, no previous surgery',
      array['abdomen','previous surgery','peritonitis','ascites'],
      null),
    (p_id, 'investigation', 10, 'head circumference', 'optional', null, 'objective', null,
      array['head circumference','ofc','fontanelle'],
      null),
    (p_id, 'investigation', 11, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 12, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 13, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- VP Shunt — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'VP Shunt — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('VP Shunt — Post-operative Checklist', 'v1-draft', 'WardMate neurosurgery pack',
            'vp_shunt', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'GCS', 'core', null, 'objective', null,
      array['gcs','glasgow coma scale','e v m','e4v5m6','sensorium'],
      null),
    (p_id, 'investigation', 3, 'pupils', 'core', null, 'objective', 'Pupils equal and reactive',
      array['pupils','perl','nerl','anisocoria','dilated pupil','pupil size'],
      null),
    (p_id, 'red_flag', 4, 'shunt malfunction signs', 'core', 'critical', 'objective', 'No headache, vomiting or drowsiness',
      array['headache','vomiting','drowsy','shunt block','bulging fontanelle','malfunction'],
      null),
    (p_id, 'investigation', 5, 'shunt reservoir / chamber', 'optional', null, 'objective', null,
      array['reservoir','chamber','pumping','refill'],
      null),
    (p_id, 'investigation', 6, 'wounds: head and abdomen', 'core', null, 'objective', 'Wounds healthy',
      array['wound','tract','cranial wound','abdominal wound'],
      null),
    (p_id, 'red_flag', 7, 'fever / shunt infection', 'core', 'urgent', 'objective', 'Afebrile',
      array['fever','shunt infection','redness along tract','meningism'],
      null),
    (p_id, 'investigation', 8, 'abdomen', 'core', null, 'objective', 'Abdomen soft, not distended',
      array['abdomen','distension','pseudocyst','peritonitis','bowel sounds'],
      null),
    (p_id, 'investigation', 9, 'oral intake', 'core', null, 'objective', null,
      array['orals','tolerating orals','diet','feeds'],
      null),
    (p_id, 'investigation', 10, 'post-operative CT', 'optional', null, 'objective', null,
      array['ct','ventricle size','catheter position'],
      null),
    (p_id, 'investigation', 11, 'shunt series x-ray', 'optional', null, 'objective', null,
      array['shunt series','x-ray','tubing continuity'],
      null),
    (p_id, 'pathway_step', 12, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','shunt advice','warning signs explained'],
      null);
end $$;


-- =============================================================================
-- BURNS AND PLASTIC SURGERY
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  -- Acute Burns (Resuscitation) — Checklist
  select id into p_id from company_protocols
   where title = 'Acute Burns (Resuscitation) — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Burns (Resuscitation) — Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'acute_burns', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'time, mechanism and agent of burn', 'core', null, 'subjective', null,
      array['flame','scald','electrical','chemical','time of burn','closed space','lpg','kerosene','cylinder blast'],
      null),
    (p_id, 'red_flag', 2, 'airway threat / inhalation injury', 'core', 'critical', 'objective', 'No signs of inhalation injury',
      array['singed nasal hair','soot','hoarseness','stridor','facial burns','carbonaceous sputum','closed space'],
      null),
    (p_id, 'investigation', 3, 'TBSA and depth charted', 'core', null, 'objective', null,
      array['tbsa','lund and browder','rule of nines','percentage burns','superficial','deep dermal','full thickness'],
      null),
    (p_id, 'immediate_action', 4, 'fluid resuscitation plan charted', 'core', null, 'plan', null,
      array['parkland','fluid plan','ringer lactate','resuscitation','fluids','first 8 hours'],
      null),
    (p_id, 'investigation', 5, 'hourly urine output with target recorded', 'core', null, 'objective', null,
      array['urine output','hourly urine','uo','catheter','target urine','catheterised'],
      null),
    (p_id, 'investigation', 6, 'vitals and perfusion', 'core', null, 'objective', 'Haemodynamically stable',
      array['pulse','bp','blood pressure','crt','perfusion','cold peripheries'],
      null),
    (p_id, 'investigation', 7, 'escharotomy need assessed', 'core', null, 'assessment', 'No circumferential burns, distal circulation intact',
      array['circumferential','escharotomy','distal pulses','compartment','chest excursion'],
      null),
    (p_id, 'investigation', 8, 'tetanus', 'core', null, 'plan', null,
      array['tetanus','tt','tetanus toxoid','tig','tetanus immunoglobulin'],
      null),
    (p_id, 'investigation', 9, 'pain relief', 'core', null, 'plan', null,
      array['analgesia','pain score','pain'],
      null),
    (p_id, 'investigation', 10, 'baseline labs', 'core', null, 'objective', null,
      array['cbc','rft','electrolytes','abg','cohb','lactate','blood sugar'],
      null),
    (p_id, 'investigation', 11, 'ECG and CK for electrical burn', 'core', null, 'objective', null,
      array['ecg','ck','cpk','myoglobinuria','entry wound','exit wound'],
      '{"when": [{"type": "history", "pattern": "electric|current|lightning|high voltage"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 12, 'wound care / dressing', 'core', null, 'plan', null,
      array['dressing','silver sulfadiazine','ssd','collagen','exposure method'],
      null),
    (p_id, 'investigation', 13, 'nutrition started', 'core', null, 'plan', null,
      array['feeds','ryles','enteral','nutrition','high protein'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 14, 'burn wound sepsis', 'core', 'urgent', 'objective', 'No features of sepsis',
      array['fever','wound discharge','hypothermia','altered sensorium','thrombocytopenia','feed intolerance'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb),
    (p_id, 'investigation', 15, 'medico-legal case informed', 'core', null, 'checks', null,
      array['mlc','medico legal','police intimation','dying declaration'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Skin Graft — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Skin Graft — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Skin Graft — Pre-operative Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'skin_graft', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'wound bed ready', 'core', null, 'objective', null,
      array['granulation','healthy granulation','slough','wound bed','graftable'],
      null),
    (p_id, 'investigation', 2, 'wound swab culture', 'core', null, 'objective', null,
      array['wound swab','culture','pseudomonas','streptococcus','c/s'],
      null),
    (p_id, 'investigation', 3, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'investigation', 4, 'serum albumin / nutrition', 'core', null, 'objective', null,
      array['albumin','protein','nutrition'],
      null),
    (p_id, 'investigation', 5, 'blood sugar', 'optional', null, 'objective', null,
      array['sugar','grbs','hba1c','diabetes'],
      null),
    (p_id, 'investigation', 6, 'area to be grafted', 'core', null, 'objective', null,
      array['size','area','tbsa grafted'],
      null),
    (p_id, 'pathway_step', 7, 'donor site identified', 'core', null, 'plan', null,
      array['donor site','thigh','split thickness','ssg','stsg','ftsg'],
      null),
    (p_id, 'investigation', 8, 'blood grouped and cross-matched', 'optional', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'investigation', 9, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 10, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 11, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Skin Graft — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Skin Graft — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Skin Graft — Post-operative Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'skin_graft', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'graft dressing intact', 'core', null, 'objective', null,
      array['dressing','tie over','bolster','vac','dressing intact'],
      null),
    (p_id, 'investigation', 3, 'first graft inspection', 'core', null, 'objective', null,
      array['first dressing','graft inspection','graft check','dressing opened'],
      '{"when": [{"type": "pod_gte", "days": 5}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 4, 'graft take', 'core', null, 'objective', 'Graft taken well',
      array['graft take','percentage take','graft taken','adherent'],
      null),
    (p_id, 'red_flag', 5, 'graft loss / haematoma / infection', 'core', 'urgent', 'objective', 'No haematoma, seroma or infection under graft',
      array['haematoma','seroma','graft loss','pus','foul smell','shearing'],
      null),
    (p_id, 'investigation', 6, 'donor site', 'core', null, 'objective', 'Donor site healthy',
      array['donor site','donor dressing','donor soakage','donor healing'],
      null),
    (p_id, 'investigation', 7, 'immobilisation and elevation', 'core', null, 'plan', null,
      array['splint','immobilised','elevation','bed rest'],
      null),
    (p_id, 'investigation', 8, 'fever', 'core', null, 'objective', 'Afebrile',
      array['temperature','afebrile','febrile','temp'],
      null),
    (p_id, 'investigation', 9, 'pain score', 'core', null, 'subjective', null,
      array['pain','pain score','analgesia'],
      null),
    (p_id, 'investigation', 10, 'haemoglobin', 'optional', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'pathway_step', 11, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','dressing plan','pressure garment','moisturiser'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Flap Surgery — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Flap Surgery — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Flap Surgery — Pre-operative Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'flap_surgery', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'defect and indication', 'core', null, 'objective', null,
      array['defect','exposed bone','exposed tendon','reconstruction','oncological defect'],
      null),
    (p_id, 'pathway_step', 2, 'flap planned', 'core', null, 'plan', null,
      array['free flap','pedicled flap','alt','latissimus','radial forearm','cross leg','perforator flap'],
      null),
    (p_id, 'investigation', 3, 'recipient vessels assessed', 'core', null, 'objective', null,
      array['doppler','cta','angiogram','recipient vessels','pulses'],
      null),
    (p_id, 'investigation', 4, 'smoking status', 'core', null, 'subjective', null,
      array['smoker','bidi','tobacco','smoking stopped'],
      null),
    (p_id, 'investigation', 5, 'diabetes and vascular disease', 'core', null, 'subjective', null,
      array['diabetes','pvd','sugar','hba1c'],
      null),
    (p_id, 'investigation', 6, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','haemoglobin','cbc','falling hb'],
      null),
    (p_id, 'investigation', 7, 'coagulation profile and platelets', 'core', null, 'objective', 'Normal',
      array['pt','inr','aptt','coagulation','platelets','platelet count'],
      null),
    (p_id, 'investigation', 8, 'anticoagulants / antiplatelets asked', 'core', null, 'subjective', null,
      array['aspirin','clopidogrel','warfarin','apixaban','blood thinner','antiplatelet','stopped on'],
      null),
    (p_id, 'investigation', 9, 'blood grouped and cross-matched', 'core', null, 'plan', null,
      array['grouping','crossmatch','cross match','blood reserved','units arranged'],
      null),
    (p_id, 'investigation', 10, 'flap and perforators marked', 'core', null, 'checks', null,
      array['marking','perforator marked','doppler marking'],
      null),
    (p_id, 'investigation', 11, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 12, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 13, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Flap Surgery — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Flap Surgery — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Flap Surgery — Post-operative Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'flap_surgery', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'flap monitoring chart', 'core', null, 'checks', null,
      array['flap chart','flap obs','hourly flap','flap monitoring'],
      '{"when": [{"type": "pod_lte", "days": 3}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 3, 'flap colour', 'core', null, 'objective', 'Flap pink',
      array['colour','pale','congested','dusky','blue','pink'],
      null),
    (p_id, 'investigation', 4, 'capillary refill', 'core', null, 'objective', 'Capillary refill brisk',
      array['crt','capillary refill','blanching'],
      null),
    (p_id, 'investigation', 5, 'flap temperature and turgor', 'core', null, 'objective', 'Flap warm, turgor normal',
      array['warm','cold','turgor','tense','soft'],
      null),
    (p_id, 'investigation', 6, 'pinprick bleeding / Doppler signal', 'core', null, 'objective', null,
      array['pinprick','bleeding on pin prick','doppler','handheld doppler','signal'],
      null),
    (p_id, 'red_flag', 7, 'venous congestion', 'core', 'critical', 'objective', 'No venous congestion',
      array['congested','dusky','purple','brisk dark bleeding','venous congestion','swollen flap'],
      null),
    (p_id, 'red_flag', 8, 'arterial insufficiency', 'core', 'critical', 'objective', 'No signs of arterial insufficiency',
      array['pale','white','cold flap','no bleeding','absent doppler'],
      null),
    (p_id, 'red_flag', 9, 'haematoma under flap', 'core', 'urgent', 'objective', 'No haematoma',
      array['haematoma','swelling under flap','collection'],
      null),
    (p_id, 'investigation', 10, 'position with no pressure on pedicle', 'core', null, 'checks', null,
      array['positioning','no pressure on pedicle','no tight dressing','elevation'],
      null),
    (p_id, 'investigation', 11, 'warmth, hydration and blood pressure maintained', 'core', null, 'plan', null,
      array['warm room','well hydrated','urine output','avoid hypotension'],
      null),
    (p_id, 'investigation', 12, 'drain output', 'optional', null, 'objective', null,
      array['drain','drain fluid','drain removed'],
      null),
    (p_id, 'investigation', 13, 'donor site', 'core', null, 'objective', 'Donor site healthy',
      array['donor site','donor wound','donor dressing'],
      null),
    (p_id, 'pathway_step', 14, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','mobilisation','dangling protocol','flap care advice'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Hand Surgery — Pre-operative Checklist
  select id into p_id from company_protocols
   where title = 'Hand Surgery — Pre-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Hand Surgery — Pre-operative Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'hand_surgery', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'mechanism and time of injury', 'core', null, 'subjective', null,
      array['crush','cut','machine injury','time of injury','sharp','chaff cutter','thresher','glass'],
      null),
    (p_id, 'investigation', 2, 'hand dominance and occupation', 'core', null, 'subjective', null,
      array['right handed','left handed','dominant hand','occupation'],
      null),
    (p_id, 'investigation', 3, 'neurovascular status of each digit', 'core', null, 'objective', null,
      array['capillary refill','digital nerve','two point discrimination','sensation','pulses'],
      null),
    (p_id, 'investigation', 4, 'tendon function', 'core', null, 'objective', null,
      array['fds','fdp','extensor','flexion','cannot flex','tendon cut'],
      null),
    (p_id, 'investigation', 5, 'x-ray hand', 'core', null, 'objective', null,
      array['x-ray','fracture','foreign body'],
      null),
    (p_id, 'investigation', 6, 'wound contamination', 'core', null, 'objective', null,
      array['contaminated','clean','soil','crush'],
      null),
    (p_id, 'investigation', 7, 'tetanus', 'core', null, 'plan', null,
      array['tetanus','tt','tetanus toxoid','tig','tetanus immunoglobulin'],
      null),
    (p_id, 'investigation', 8, 'antibiotics started', 'core', null, 'plan', null,
      array['antibiotic','antibiotics started'],
      null),
    (p_id, 'red_flag', 9, 'devascularised digit / compartment', 'core', 'urgent', 'objective', 'All digits perfused',
      array['white finger','cold finger','no crt','amputation','compartment','tense hand'],
      null),
    (p_id, 'investigation', 10, 'amputated part preserved', 'core', null, 'objective', null,
      array['amputated part','replant','ice','wrapped'],
      '{"when": [{"type": "history", "pattern": "amputat|replant"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 11, 'fitness / anaesthetic clearance', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','high risk consent'],
      null),
    (p_id, 'investigation', 12, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 13, 'fasting status', 'core', null, 'checks', null,
      array['npo','nbm','nil by mouth','fasting'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Hand Surgery — Post-operative Checklist
  select id into p_id from company_protocols
   where title = 'Hand Surgery — Post-operative Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Hand Surgery — Post-operative Checklist', 'v1-draft', 'WardMate burns and plastic surgery pack',
            'hand_surgery', 'after_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'post-operative day', 'core', null, 'objective', null,
      array['pod','post op day','day'],
      null),
    (p_id, 'investigation', 2, 'hand elevation', 'core', null, 'plan', null,
      array['elevation','sling','high arm','elevated'],
      null),
    (p_id, 'investigation', 3, 'digit perfusion', 'core', null, 'objective', 'All digits pink with brisk capillary refill',
      array['capillary refill','crt','colour','warm fingers'],
      null),
    (p_id, 'red_flag', 4, 'digit ischaemia or compartment syndrome', 'core', 'critical', 'objective', 'No ischaemia or compartment signs',
      array['white finger','dusky finger','pain on passive stretch','tense','compartment'],
      null),
    (p_id, 'investigation', 5, 'splint position', 'core', null, 'objective', null,
      array['splint','pop slab','position of safety','dorsal blocking splint'],
      null),
    (p_id, 'investigation', 6, 'sensation', 'core', null, 'objective', null,
      array['sensation','numbness','tingling'],
      null),
    (p_id, 'investigation', 7, 'swelling', 'optional', null, 'objective', null,
      array['swelling','oedema'],
      null),
    (p_id, 'investigation', 8, 'wound', 'core', null, 'objective', 'Wound healthy',
      array['incision','dressing','suture line','soakage','wound'],
      null),
    (p_id, 'investigation', 9, 'pain score', 'core', null, 'subjective', null,
      array['pain','pain score','analgesia'],
      null),
    (p_id, 'investigation', 10, 'hand therapy / early mobilisation started', 'core', null, 'plan', null,
      array['physiotherapy','hand therapy','active movement','kleinert','early active motion'],
      '{"when": [{"type": "pod_gte", "days": 2}]}'::jsonb),
    (p_id, 'investigation', 11, 'fever', 'optional', null, 'objective', 'Afebrile',
      array['temperature','afebrile','febrile','temp'],
      null),
    (p_id, 'pathway_step', 12, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','follow-up','suture removal','splint review','hand therapy'],
      null);
end $$;


-- =============================================================================
-- PULMONARY MEDICINE
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  -- COPD Exacerbation — Checklist
  select id into p_id from company_protocols
   where title = 'COPD Exacerbation — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('COPD Exacerbation — Checklist', 'v1-draft', 'WardMate pulmonary medicine pack',
            'copd_exacerbation', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'trigger of exacerbation', 'core', null, 'subjective', null,
      array['infection','sputum colour','purulent sputum','non compliance','biomass','exposure'],
      null),
    (p_id, 'investigation', 2, 'baseline and current breathlessness', 'core', null, 'subjective', null,
      array['mmrc','breathlessness','exercise tolerance','orthopnoea'],
      null),
    (p_id, 'investigation', 3, 'SpO2 with oxygen target recorded', 'core', null, 'objective', null,
      array['spo2','saturation','oxygen','target saturation','fio2','venturi','nasal prongs'],
      null),
    (p_id, 'investigation', 4, 'ABG', 'core', null, 'objective', null,
      array['abg','pco2','ph','hypercapnia','respiratory acidosis'],
      null),
    (p_id, 'red_flag', 5, 'NIV or ventilation criteria', 'core', 'critical', 'objective', 'No indication for NIV',
      array['acidosis','rising pco2','drowsy','niv','bipap','fatigue','accessory muscles'],
      null),
    (p_id, 'investigation', 6, 'chest x-ray', 'core', null, 'objective', null,
      array['cxr','pneumothorax','consolidation','hyperinflation'],
      null),
    (p_id, 'investigation', 7, 'ECG', 'optional', null, 'objective', null,
      array['ecg','cor pulmonale','af','p pulmonale'],
      null),
    (p_id, 'investigation', 8, 'sputum sent', 'core', null, 'objective', null,
      array['sputum culture','gram stain','sputum afb','cbnaat','genexpert'],
      null),
    (p_id, 'investigation', 9, 'bronchodilators and steroids started', 'core', null, 'plan', null,
      array['nebulisation','salbutamol','ipratropium','steroid','prednisolone','hydrocortisone'],
      null),
    (p_id, 'investigation', 10, 'antibiotic decision', 'core', null, 'plan', null,
      array['antibiotic','antibiotics started','no antibiotic'],
      null),
    (p_id, 'investigation', 11, 'smoking / biomass exposure and cessation', 'core', null, 'subjective', null,
      array['smoker','bidi','chulha','biomass','quit smoking'],
      null),
    (p_id, 'investigation', 12, 'inhaler technique checked', 'core', null, 'plan', null,
      array['inhaler technique','mdi','spacer','rotacap','dpi'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 13, 'vaccination status', 'optional', null, 'plan', null,
      array['influenza vaccine','pneumococcal vaccine','vaccination'],
      null),
    (p_id, 'investigation', 14, 'VTE risk assessment', 'core', null, 'assessment', null,
      array['vte','dvt prophylaxis','thromboprophylaxis','ted stockings','compression stockings'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),
    (p_id, 'pathway_step', 15, 'pulmonary rehabilitation and discharge plan', 'core', null, 'plan', null,
      array['pulmonary rehabilitation','spirometry follow up','home oxygen','discharge'],
      null);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Acute Asthma — Checklist
  select id into p_id from company_protocols
   where title = 'Acute Asthma — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Asthma — Checklist', 'v1-draft', 'WardMate pulmonary medicine pack',
            'acute_asthma', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'severity: speech, respiratory rate, pulse, PEFR', 'core', null, 'objective', null,
      array['pefr','peak flow','respiratory rate','speaking','sentences','pulse'],
      null),
    (p_id, 'red_flag', 2, 'life-threatening features', 'core', 'critical', 'objective', 'No life-threatening features',
      array['silent chest','cyanosis','exhaustion','altered sensorium','hypotension','poor effort','bradycardia'],
      null),
    (p_id, 'investigation', 3, 'SpO2 with oxygen target recorded', 'core', null, 'objective', null,
      array['spo2','saturation','oxygen','target saturation','fio2','venturi','nasal prongs'],
      null),
    (p_id, 'investigation', 4, 'ABG', 'optional', null, 'objective', null,
      array['abg','pco2','ph','normal pco2'],
      null),
    (p_id, 'investigation', 5, 'trigger identified', 'core', null, 'subjective', null,
      array['infection','allergen','dust','smoke','non adherence','nsaid','aspirin'],
      null),
    (p_id, 'investigation', 6, 'previous ICU admission / intubation', 'core', null, 'subjective', 'No previous ICU admission',
      array['previous icu','intubated','ventilated','near fatal'],
      null),
    (p_id, 'investigation', 7, 'controller therapy and adherence', 'core', null, 'subjective', null,
      array['ics','inhaler','controller','adherence','budesonide','formoterol'],
      null),
    (p_id, 'investigation', 8, 'bronchodilators and steroids started', 'core', null, 'plan', null,
      array['nebulisation','salbutamol','ipratropium','steroid','prednisolone','hydrocortisone'],
      null),
    (p_id, 'investigation', 9, 'response reassessed', 'core', null, 'assessment', null,
      array['pefr after','reassessment','response to nebulisation','improved'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 10, 'chest x-ray', 'optional', null, 'objective', null,
      array['cxr','pneumothorax','consolidation'],
      null),
    (p_id, 'investigation', 11, 'serum potassium', 'optional', null, 'objective', null,
      array['potassium','k','hypokalaemia'],
      null),
    (p_id, 'investigation', 12, 'inhaler technique checked', 'core', null, 'plan', null,
      array['inhaler technique','mdi','spacer','rotacap','dpi'],
      null),
    (p_id, 'pathway_step', 13, 'written asthma action plan', 'core', null, 'plan', null,
      array['action plan','asthma plan','discharge plan'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb);
end $$;

do $$
declare
  p_id uuid;
begin
  -- Pleural Drain (ICD / Tapping) — Checklist
  select id into p_id from company_protocols
   where title = 'Pleural Drain (ICD / Tapping) — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Pleural Drain (ICD / Tapping) — Checklist', 'v1-draft', 'WardMate pulmonary medicine pack',
            'pleural_drain', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'indication', 'core', null, 'subjective', null,
      array['effusion','empyema','pneumothorax','hydropneumothorax','malignant effusion','haemothorax'],
      null),
    (p_id, 'investigation', 2, 'imaging and site marked', 'core', null, 'objective', null,
      array['cxr','usg chest','usg guided','site marked'],
      null),
    (p_id, 'investigation', 3, 'side confirmed', 'core', null, 'checks', null,
      array['laterality','right','left','side'],
      null),
    (p_id, 'investigation', 4, 'coagulation profile and platelets', 'core', null, 'objective', 'Normal',
      array['pt','inr','aptt','coagulation','platelets','platelet count'],
      null),
    (p_id, 'investigation', 5, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent'],
      null),
    (p_id, 'investigation', 6, 'pleural fluid sent', 'core', null, 'objective', null,
      array['pleural fluid','ada','protein','ldh','sugar','cell count','cytology','afb','cbnaat','gram stain','culture'],
      null),
    (p_id, 'investigation', 7, 'serum LDH and protein (Light''s criteria)', 'core', null, 'objective', null,
      array['serum ldh','serum protein','lights criteria'],
      null),
    (p_id, 'investigation', 8, 'drain swinging and bubbling', 'core', null, 'objective', null,
      array['swinging','bubbling','oscillating','drain column'],
      null),
    (p_id, 'investigation', 9, 'drain output and character', 'core', null, 'objective', null,
      array['drain output','straw coloured','haemorrhagic','pus','chylous'],
      null),
    (p_id, 'red_flag', 10, 're-expansion oedema / vasovagal reaction', 'core', 'urgent', 'objective', 'No cough, breathlessness or hypotension after drainage',
      array['re-expansion','cough after tapping','breathless','hypotension','vasovagal'],
      null),
    (p_id, 'red_flag', 11, 'surgical emphysema / blocked drain / tension', 'core', 'critical', 'objective', 'No surgical emphysema, drain patent',
      array['surgical emphysema','subcutaneous emphysema','blocked drain','kinked','tension'],
      null),
    (p_id, 'investigation', 12, 'post-procedure chest x-ray', 'core', null, 'objective', null,
      array['check x-ray','post icd x-ray','tube position','lung expansion'],
      null),
    (p_id, 'investigation', 13, 'drain site', 'core', null, 'objective', 'Drain site clean',
      array['drain site','icd site','leak','dressing'],
      null),
    (p_id, 'investigation', 14, 'drain removal criteria reviewed', 'core', null, 'assessment', null,
      array['drain removal','stopped bubbling','output less','clamping','icd removed'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb),
    (p_id, 'investigation', 15, 'analgesia and breathing exercises', 'optional', null, 'plan', null,
      array['analgesia','incentive spirometry','chest physiotherapy'],
      null);
end $$;

-- =============================================================================
-- Picker rows — one per family, in the pack's pickerPhase. No items of their own: the
-- protocol supplies the checklist. Idempotent by NOT EXISTS (ward_id and variant are null, and
-- Postgres treats nulls as distinct, so ON CONFLICT would not catch a rerun).
-- =============================================================================

insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('turp', null::text, 'after_surgery'::care_phase, 'TURP'),
  ('stone_surgery', null, 'after_surgery', 'Stone surgery (URS / PCNL / DJ stent)'),
  ('nephrectomy', null, 'after_surgery', 'Nephrectomy'),
  ('urinary_retention', null, 'after_surgery', 'Urinary retention (catheterised / trial void)'),
  ('head_injury', null, 'after_surgery', 'Head injury — observation'),
  ('craniotomy', null, 'after_surgery', 'Craniotomy'),
  ('spine_surgery', null, 'after_surgery', 'Spine surgery'),
  ('vp_shunt', null, 'after_surgery', 'VP shunt'),
  ('acute_burns', null, 'after_surgery', 'Acute burns — resuscitation'),
  ('skin_graft', null, 'after_surgery', 'Skin graft'),
  ('flap_surgery', null, 'after_surgery', 'Flap surgery'),
  ('hand_surgery', null, 'after_surgery', 'Hand surgery'),
  ('copd_exacerbation', null, 'before_surgery', 'COPD exacerbation'),
  ('acute_asthma', null, 'before_surgery', 'Acute asthma'),
  ('pleural_drain', null, 'before_surgery', 'Pleural drain (ICD / tapping)')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
