-- Medical oncology checklists, part two — the five picker families 0061 left empty.
--
-- WHAT THIS SEEDS. One protocol plus its items for each of the oncology families that the
-- ward picker already offers (care_templates rows seeded in 0061) but that had no checklist:
-- chemo_toxicity, leukaemia_induction, lymphoma_chemo, myeloma, transfusion_support. No
-- care_templates rows are inserted here — the picker rows exist.
--
-- SHAPE. Identical to 0061: one protocol per family, phase 'before_surgery' (the value
-- phaseFor() computes for a patient with no operation date — see 0061's note), items carry an
-- optional `trigger` evaluated in lib/checklist-triggers.ts. Lab triggers compare the first
-- number recorded against an item whose label contains the analyte; thresholds assume the
-- units Indian labs report (mg/dL, mEq/L). Severity is set on red_flag rows only.
--
-- NO DOSES. No drug or blood-product doses or volumes appear anywhere below; decisions a
-- consultant owns (dose holds, prophylaxis, transfusion) are phrased as questions.
--
-- CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28) — seeded as draft; 0096 publishes it
-- (together with 0061's two, which were never published).
--
-- Requires: 0026_company_protocol_library.sql, 0058_checklist_item_trigger.sql,
--           0060_specialty_packs.sql, 0061_oncology_checklists.sql.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

do $$
declare
  tx_id uuid;
  li_id uuid;
  ly_id uuid;
  mm_id uuid;
  ts_id uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Chemotherapy toxicity
  -- ---------------------------------------------------------------------------
  select id into tx_id from company_protocols
   where title = 'Chemotherapy Toxicity — Admission Checklist' limit 1;

  if tx_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Chemotherapy Toxicity — Admission Checklist', 'v1-draft', 'WardMate oncology pack',
            'chemo_toxicity', 'before_surgery', 'draft')
    returning id into tx_id;
  end if;

  delete from company_protocol_items where protocol_id = tx_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (tx_id, 'investigation', 1, 'regimen and day of cycle', 'core', null, 'subjective', null,
      array['regimen','cycle','cycle day','last chemotherapy','last chemo date'], null),
    (tx_id, 'investigation', 2, 'mucositis CTCAE grade', 'core', null, 'objective', 'No mucositis',
      array['mucositis','oral ulcers','stomatitis','mucositis grade'], null),
    (tx_id, 'investigation', 3, 'diarrhoea CTCAE grade', 'core', null, 'objective', 'No diarrhoea',
      array['diarrhoea','diarrhea','loose stools','stool frequency','diarrhoea grade'], null),
    (tx_id, 'investigation', 4, 'nausea and vomiting CTCAE grade', 'core', null, 'objective', 'No nausea or vomiting',
      array['nausea','vomiting','emesis','nausea grade'], null),
    (tx_id, 'investigation', 5, 'peripheral neuropathy CTCAE grade', 'core', null, 'objective', 'No neuropathy',
      array['neuropathy','tingling','numbness','paraesthesia','neuropathy grade'], null),
    (tx_id, 'investigation', 6, 'hand-foot syndrome CTCAE grade', 'optional', null, 'objective', 'No hand-foot syndrome',
      array['hand foot syndrome','hand-foot','palmar plantar','ppe','hfs'], null),
    (tx_id, 'investigation', 7, 'blood counts', 'core', null, 'objective', null,
      array['cbc','anc','platelets','haemoglobin','counts','tlc'], null),
    (tx_id, 'investigation', 8, 'renal function and electrolytes', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','sodium','potassium','electrolytes','rft','kft'], null),
    (tx_id, 'investigation', 9, 'liver function', 'core', null, 'objective', 'Normal',
      array['lft','bilirubin','sgpt','sgot','alt','ast'], null),
    (tx_id, 'investigation', 10, 'hydration and oral intake', 'core', null, 'objective', 'Well hydrated, tolerating orals',
      array['hydration','dehydration','oral intake','intake output','io chart'], null),
    (tx_id, 'red_flag', 11, 'fever with low counts', 'core', 'critical', 'assessment', 'Afebrile',
      array['fever','febrile neutropenia','temperature','rigors'], null),
    (tx_id, 'red_flag', 12, 'dehydration with rising creatinine', 'core', 'urgent', 'assessment', null,
      array['aki','acute kidney injury','rising creatinine','oliguria'],
      '{"when": [{"type": "lab", "analyte": "creatinine", "op": "gt", "value": 1.5}], "effect": "core"}'::jsonb),
    (tx_id, 'pathway_step', 13, 'should the next cycle be held or dose-modified?', 'core', null, 'plan', null,
      array['dose hold','hold chemo','dose reduction','dose modification','defer cycle'],
      '{"when": [{"type": "on_regimen"}]}'::jsonb),
    (tx_id, 'pathway_step', 14, 'toxicity discussed with consultant', 'optional', null, 'plan', null,
      array['discussed with consultant','consultant informed','senior review'], null);

  -- ---------------------------------------------------------------------------
  -- 2. Acute leukaemia — induction
  -- ---------------------------------------------------------------------------
  select id into li_id from company_protocols
   where title = 'Acute Leukaemia Induction — Checklist' limit 1;

  if li_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Leukaemia Induction — Checklist', 'v1-draft', 'WardMate oncology pack',
            'leukaemia_induction', 'before_surgery', 'draft')
    returning id into li_id;
  end if;

  delete from company_protocol_items where protocol_id = li_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    -- Tumour lysis labs: the first week is when they move.
    (li_id, 'investigation', 1, 'serum uric acid', 'core', null, 'objective', null,
      array['uric acid','urate','s uric acid'], null),
    (li_id, 'investigation', 2, 'serum potassium', 'core', null, 'objective', null,
      array['potassium','k','k+','s potassium'], null),
    (li_id, 'investigation', 3, 'serum phosphate', 'core', null, 'objective', null,
      array['phosphate','phosphorus','po4','s phosphorus'], null),
    (li_id, 'investigation', 4, 'serum calcium', 'core', null, 'objective', null,
      array['calcium','ca','s calcium','ionised calcium'], null),
    (li_id, 'investigation', 5, 'serum creatinine', 'core', null, 'objective', null,
      array['creatinine','s creatinine','rft','kft'], null),
    (li_id, 'immediate_action', 6, 'hydration and urine output', 'core', null, 'plan', null,
      array['hydration','iv fluids','urine output','intake output','io chart'],
      '{"when": [{"type": "cycle_day_lte", "days": 7}], "effect": "core"}'::jsonb),
    (li_id, 'red_flag', 7, 'laboratory tumour lysis — hyperkalaemia', 'core', 'critical', 'assessment', null,
      array['tls','tumour lysis','hyperkalaemia','ecg changes'],
      '{"when": [{"type": "lab", "analyte": "potassium", "op": "gte", "value": 6}], "effect": "core"}'::jsonb),
    (li_id, 'red_flag', 8, 'laboratory tumour lysis — hyperuricaemia', 'core', 'urgent', 'assessment', null,
      array['tls','tumour lysis','hyperuricaemia'],
      '{"when": [{"type": "lab", "analyte": "uric acid", "op": "gte", "value": 8}], "effect": "core"}'::jsonb),
    (li_id, 'investigation', 9, 'daily fever and infection surveillance', 'core', null, 'objective', 'Afebrile, no focus of infection',
      array['fever','temperature','infection','septic screen','perianal','oral cavity'], null),
    (li_id, 'investigation', 10, 'is antifungal prophylaxis in place?', 'core', null, 'plan', null,
      array['antifungal','antifungal prophylaxis','posaconazole','fluconazole','voriconazole'], null),
    (li_id, 'investigation', 11, 'transfusion threshold checked against today''s counts', 'core', null, 'checks', null,
      array['transfusion threshold','haemoglobin','platelets','prbc','sdp','rdp'], null),
    (li_id, 'investigation', 12, 'central line site and function', 'core', null, 'objective', 'Line site clean, flushing well',
      array['central line','picc','chemoport','line site','hickman','line care'], null),
    (li_id, 'pathway_step', 13, 'CNS prophylaxis lumbar puncture', 'core', null, 'plan', null,
      array['lp','lumbar puncture','intrathecal','it chemo','csf','cns prophylaxis'], null),
    (li_id, 'pathway_step', 14, 'day-14 bone marrow', 'optional', null, 'plan', null,
      array['day 14 marrow','interim marrow','bone marrow aspiration','bma'],
      '{"when": [{"type": "cycle_day_gte", "days": 14}]}'::jsonb),
    (li_id, 'pathway_step', 15, 'end-of-induction marrow and MRD', 'core', null, 'plan', null,
      array['day 28 marrow','end of induction','mrd','remission marrow','bma'],
      '{"when": [{"type": "cycle_day_gte", "days": 28}], "effect": "core"}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 3. Lymphoma — chemotherapy
  -- ---------------------------------------------------------------------------
  select id into ly_id from company_protocols
   where title = 'Lymphoma Chemotherapy — Checklist' limit 1;

  if ly_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Lymphoma Chemotherapy — Checklist', 'v1-draft', 'WardMate oncology pack',
            'lymphoma_chemo', 'before_surgery', 'draft')
    returning id into ly_id;
  end if;

  delete from company_protocol_items where protocol_id = ly_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (ly_id, 'investigation', 1, 'histology and subtype', 'core', null, 'assessment', null,
      array['biopsy','histopathology','ihc','subtype','dlbcl','hodgkin','nhl'], null),
    (ly_id, 'investigation', 2, 'stage and staging PET-CT', 'core', null, 'assessment', null,
      array['stage','pet ct','pet-ct','staging','ann arbor','cect'], null),
    (ly_id, 'investigation', 3, 'hepatitis B screen before rituximab', 'core', null, 'checks', null,
      array['hbsag','anti hbc','hepatitis b','hbv','viral markers'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (ly_id, 'investigation', 4, 'HIV and hepatitis C status', 'core', null, 'checks', null,
      array['hiv','anti hcv','hcv','viral markers'], null),
    (ly_id, 'investigation', 5, 'echocardiogram before anthracycline', 'core', null, 'checks', null,
      array['echo','2d echo','lvef','ejection fraction','muga'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (ly_id, 'investigation', 6, 'pre-chemotherapy counts', 'core', null, 'objective', null,
      array['cbc','anc','platelets','haemoglobin','counts before chemo'],
      '{"when": [{"type": "day_of_cycle"}], "effect": "core"}'::jsonb),
    (ly_id, 'investigation', 7, 'renal and liver function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','lft','bilirubin','rft','kft'], null),
    (ly_id, 'investigation', 8, 'LDH and uric acid', 'core', null, 'objective', null,
      array['ldh','lactate dehydrogenase','uric acid','urate'], null),
    (ly_id, 'investigation', 9, 'is the tumour lysis risk high enough for prophylaxis?', 'core', null, 'assessment', null,
      array['tls risk','tumour lysis risk','bulky disease','allopurinol','rasburicase','hydration'],
      '{"when": [{"type": "cycle_day_lte", "days": 7}]}'::jsonb),
    (ly_id, 'red_flag', 10, 'laboratory tumour lysis', 'core', 'urgent', 'assessment', null,
      array['tls','tumour lysis','hyperuricaemia'],
      '{"when": [{"type": "lab", "analyte": "uric acid", "op": "gte", "value": 8}], "effect": "core"}'::jsonb),
    (ly_id, 'red_flag', 11, 'infusion reaction', 'core', 'urgent', 'objective', 'No infusion reaction',
      array['infusion reaction','rigors during infusion','hypersensitivity','rituximab reaction'], null),
    (ly_id, 'investigation', 12, 'B symptoms and node size', 'optional', null, 'subjective', null,
      array['b symptoms','fever','night sweats','weight loss','lymph nodes','node size'], null),
    (ly_id, 'pathway_step', 13, 'interim response assessment', 'core', null, 'plan', null,
      array['interim pet','response assessment','deauville','interim scan'], null),
    (ly_id, 'pathway_step', 14, 'next cycle date', 'core', null, 'plan', null,
      array['next cycle','due on','next admission'], null);

  -- ---------------------------------------------------------------------------
  -- 4. Multiple myeloma
  -- ---------------------------------------------------------------------------
  select id into mm_id from company_protocols
   where title = 'Multiple Myeloma — Checklist' limit 1;

  if mm_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Multiple Myeloma — Checklist', 'v1-draft', 'WardMate oncology pack',
            'myeloma', 'before_surgery', 'draft')
    returning id into mm_id;
  end if;

  delete from company_protocol_items where protocol_id = mm_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (mm_id, 'investigation', 1, 'serum calcium', 'core', null, 'objective', null,
      array['calcium','ca','s calcium','corrected calcium'], null),
    (mm_id, 'investigation', 2, 'serum creatinine', 'core', null, 'objective', null,
      array['creatinine','s creatinine','rft','kft','egfr'], null),
    (mm_id, 'investigation', 3, 'haemoglobin and counts', 'core', null, 'objective', null,
      array['cbc','hb','haemoglobin','platelets','counts'], null),
    (mm_id, 'investigation', 4, 'SPEP and serum free light chains', 'core', null, 'objective', null,
      array['spep','m band','m protein','flc','free light chains','kappa lambda ratio','immunofixation'], null),
    (mm_id, 'investigation', 5, 'skeletal imaging', 'core', null, 'objective', null,
      array['skeletal survey','pet ct','low dose ct','mri spine','lytic lesions'], null),
    (mm_id, 'investigation', 6, 'bone pain and back pain', 'core', null, 'subjective', 'No bone pain',
      array['bone pain','back pain','pain score'], null),
    (mm_id, 'red_flag', 7, 'cord compression — new weakness, sensory level or sphincter change', 'core', 'critical', 'objective',
      'No limb weakness, no sensory level, sphincters intact',
      array['cord compression','paraparesis','weakness legs','sensory level','urinary retention','bladder bowel'], null),
    (mm_id, 'red_flag', 8, 'hypercalcaemia', 'core', 'urgent', 'assessment', null,
      array['hypercalcaemia','high calcium','confusion','polyuria'],
      '{"when": [{"type": "lab", "analyte": "calcium", "op": "gt", "value": 11}], "effect": "core"}'::jsonb),
    (mm_id, 'red_flag', 9, 'worsening renal function', 'core', 'urgent', 'assessment', null,
      array['aki','cast nephropathy','rising creatinine','oliguria'],
      '{"when": [{"type": "lab", "analyte": "creatinine", "op": "gt", "value": 2}], "effect": "core"}'::jsonb),
    (mm_id, 'investigation', 10, 'has a dental check been done before bisphosphonate?', 'core', null, 'checks', null,
      array['dental check','dental clearance','zoledronic acid','bisphosphonate','denosumab','onj'], null),
    (mm_id, 'investigation', 11, 'is VTE prophylaxis in place on lenalidomide or thalidomide?', 'core', null, 'plan', null,
      array['vte prophylaxis','thromboprophylaxis','aspirin','lmwh','lenalidomide','thalidomide','imid'],
      '{"when": [{"type": "on_regimen"}]}'::jsonb),
    (mm_id, 'investigation', 12, 'is herpes zoster prophylaxis in place on bortezomib?', 'optional', null, 'plan', null,
      array['acyclovir','zoster prophylaxis','bortezomib','antiviral prophylaxis'],
      '{"when": [{"type": "on_regimen"}]}'::jsonb),
    (mm_id, 'investigation', 13, 'peripheral neuropathy', 'optional', null, 'objective', 'No neuropathy',
      array['neuropathy','tingling','numbness','bortezomib neuropathy'], null),
    (mm_id, 'pathway_step', 14, 'transplant eligibility discussed', 'optional', null, 'plan', null,
      array['transplant','asct','stem cell transplant','transplant eligible'], null);

  -- ---------------------------------------------------------------------------
  -- 5. Cytopenia / transfusion support
  -- ---------------------------------------------------------------------------
  select id into ts_id from company_protocols
   where title = 'Transfusion Support — Checklist' limit 1;

  if ts_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Transfusion Support — Checklist', 'v1-draft', 'WardMate oncology pack',
            'transfusion_support', 'before_surgery', 'draft')
    returning id into ts_id;
  end if;

  delete from company_protocol_items where protocol_id = ts_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (ts_id, 'investigation', 1, 'pre-transfusion counts', 'core', null, 'objective', null,
      array['cbc','hb','haemoglobin','platelets','pre transfusion counts'], null),
    (ts_id, 'investigation', 2, 'indication and threshold documented', 'core', null, 'assessment', null,
      array['indication','transfusion threshold','symptomatic anaemia','bleeding','trigger'], null),
    (ts_id, 'immediate_action', 3, 'consent for transfusion', 'core', null, 'checks', null,
      array['consent','transfusion consent','blood consent'], null),
    (ts_id, 'immediate_action', 4, 'group and crossmatch sent', 'core', null, 'checks', null,
      array['grouping','crossmatch','cross match','blood group','sample to blood bank'], null),
    (ts_id, 'investigation', 5, 'does this patient need irradiated or leucodepleted products?', 'core', null, 'checks', null,
      array['irradiated','leucodepleted','leukodepleted','leucoreduced','cmv negative','special requirements'], null),
    (ts_id, 'immediate_action', 6, 'bedside identity check at start', 'core', null, 'checks', null,
      array['bedside check','two person check','patient identity','bag label checked'], null),
    (ts_id, 'investigation', 7, 'baseline vitals before transfusion', 'core', null, 'objective', null,
      array['baseline vitals','pre transfusion vitals','temperature','pulse','blood pressure'], null),
    (ts_id, 'red_flag', 8, 'acute transfusion reaction — fever, rigors or rash', 'core', 'urgent', 'objective',
      'No transfusion reaction',
      array['transfusion reaction','febrile reaction','rigors','urticaria','rash','itching'], null),
    (ts_id, 'red_flag', 9, 'anaphylaxis or hypotension during transfusion', 'core', 'critical', 'objective', null,
      array['anaphylaxis','hypotension','stridor','wheeze','collapse'], null),
    (ts_id, 'red_flag', 10, 'breathlessness during or after transfusion', 'core', 'critical', 'objective', null,
      array['taco','trali','breathlessness','desaturation','pulmonary oedema','fluid overload'], null),
    (ts_id, 'red_flag', 11, 'haemolysis — dark urine, back pain, fever', 'core', 'critical', 'objective', null,
      array['haemolytic reaction','dark urine','haemoglobinuria','loin pain','abo incompatibility'], null),
    (ts_id, 'investigation', 12, 'post-transfusion counts', 'core', null, 'objective', null,
      array['post transfusion counts','post transfusion hb','platelet increment','repeat cbc'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (ts_id, 'investigation', 13, 'bleeding signs', 'core', null, 'objective', 'No bleeding',
      array['bleeding','petechiae','purpura','gum bleed','epistaxis','malena'], null),
    (ts_id, 'pathway_step', 14, 'cause of cytopenia being addressed', 'optional', null, 'assessment', null,
      array['cause','marrow suppression','nutritional','haemolysis workup','bone marrow'], null);
end $$;

commit;
