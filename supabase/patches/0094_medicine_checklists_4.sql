-- Internal medicine — fourth checklist tranche: the eight picker families that still had no items.
--
-- WHAT THIS SEEDS. One protocol each, with its items, for eight template families whose picker
-- rows already exist (care_templates, patch 0064) but which carried no checklist until now:
--   hhs, uncontrolled_diabetes, uncontrolled_hypertension, anaemia_evaluation,
--   thrombocytopenia, pancytopenia, sle_flare, hiv_oi.
-- No care_templates rows are inserted here — 0064 already did that.
--
-- SHAPE — same as 0064 / 0067. Filed under phase 'before_surgery' because phaseFor() gives
-- every patient with no operation date that phase (see 0064's header). Triggers anchor on
-- admission (`hours_since_admission_gte`) and on recorded values (`history`, `lab`,
-- `item_present` / `item_absent`) — no new trigger code is needed. Red-flag rows carry a
-- severity; every other row has severity null (constraint from patch 0032).
--
-- LAB TRIGGERS AND UNITS. A `lab` condition compares the FIRST number in the recorded value.
-- The platelet threshold is written in cells/µL (20000), the same unit as 0067's dengue line;
-- a value typed as "18,000" or "0.18 lakh" reads as 18 or 0.18. The unit reviewing this should
-- decide the ward's platelet-entry convention before publishing.
--
-- NO DRUG DOSES anywhere. Drug names appear only as aliases, so a recorded value matches.
--
-- CLINICAL CONTENT: PENDING CLINICIAN REVIEW — seeded as draft; a later patch publishes it.
-- Residents cannot see these until then (getTemplateForPatient only matches published protocols).
--
-- Requires: 0026_company_protocol_library.sql, 0032_protocol_quick_mode.sql,
--           0058_checklist_item_trigger.sql, 0064_medicine_checklists.sql.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

do $$
declare
  hhs_id uuid;
  udm_id uuid;
  uhtn_id uuid;
  anaemia_id uuid;
  tcp_id uuid;
  pancyto_id uuid;
  sle_id uuid;
  hiv_id uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Hyperosmolar hyperglycaemic state
  -- ---------------------------------------------------------------------------
  select id into hhs_id from company_protocols
   where title = 'Hyperosmolar Hyperglycaemic State — Checklist' limit 1;

  if hhs_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Hyperosmolar Hyperglycaemic State — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'hhs', 'before_surgery', 'draft')
    returning id into hhs_id;
  end if;

  delete from company_protocol_items where protocol_id = hhs_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (hhs_id, 'investigation', 1, 'serum osmolality — measured or calculated', 'core', null, 'objective', null,
      array['osmolality','serum osmolality','calculated osmolality','effective osmolality','mosm'], null),
    (hhs_id, 'investigation', 2, 'sodium, corrected for glucose', 'core', null, 'objective', null,
      array['sodium','na+','corrected sodium','hyponatraemia','hypernatraemia'], null),
    (hhs_id, 'investigation', 3, 'potassium and renal function', 'core', null, 'objective', null,
      array['potassium','k+','creatinine','urea','aki','egfr'], null),
    (hhs_id, 'investigation', 4, 'ketones and gas — mixed DKA excluded', 'core', null, 'objective', null,
      array['ketones','urine ketones','vbg','abg','ph','bicarbonate','mixed dka'], null),
    (hhs_id, 'investigation', 5, 'estimated fluid deficit charted', 'core', null, 'assessment', null,
      array['fluid deficit','dehydration','deficit','estimated deficit','body weight'], null),
    (hhs_id, 'immediate_action', 6, 'fluid replacement plan and hourly input-output chart', 'core', null, 'plan', null,
      array['iv fluids','normal saline','fluid balance','input output','io chart','urine output','catheter'], null),
    (hhs_id, 'investigation', 7, 'hourly capillary glucose charting', 'core', null, 'objective', null,
      array['hourly grbs','hourly glucose','glucose chart','cbg hourly'], null),
    (hhs_id, 'investigation', 8, 'repeat osmolality and sodium — rate of fall', 'core', null, 'objective', null,
      array['repeat osmolality','repeat sodium','osmolality trend','sodium trend','rate of fall'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 4}], "effect": "core"}'::jsonb),
    (hhs_id, 'investigation', 9, 'precipitant identified', 'core', null, 'assessment', null,
      array['precipitant','infection','sepsis','mi','stroke','steroids','missed medication','new onset'], null),
    (hhs_id, 'investigation', 10, 'sensorium and neurological status', 'core', null, 'objective', 'Conscious and oriented',
      array['gcs','sensorium','drowsy','obtunded','seizure','focal deficit'], null),
    (hhs_id, 'red_flag', 11, 'falling sensorium or seizure during correction', 'core', 'critical', 'assessment', 'Sensorium stable',
      array['falling gcs','seizure','cerebral oedema','new drowsiness','altered sensorium'], null),
    (hhs_id, 'investigation', 12, 'VTE prophylaxis considered', 'core', null, 'plan', null,
      array['vte','dvt prophylaxis','thromboprophylaxis','enoxaparin','heparin','ted stockings'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (hhs_id, 'investigation', 13, 'foot and pressure-area check', 'optional', null, 'objective', 'Skin intact',
      array['pressure sore','foot examination','heel','bedsore','skin check'], null),
    (hhs_id, 'pathway_step', 14, 'transition to subcutaneous regimen and diabetes education', 'core', null, 'plan', null,
      array['subcutaneous insulin','basal bolus','oral hypoglycaemic','diabetes education','sick day rules'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 2. Uncontrolled diabetes
  -- ---------------------------------------------------------------------------
  select id into udm_id from company_protocols
   where title = 'Uncontrolled Diabetes — Checklist' limit 1;

  if udm_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Uncontrolled Diabetes — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'uncontrolled_diabetes', 'before_surgery', 'draft')
    returning id into udm_id;
  end if;

  delete from company_protocol_items where protocol_id = udm_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (udm_id, 'investigation', 1, 'duration of diabetes and current regimen', 'core', null, 'subjective', null,
      array['duration of diabetes','known diabetic','oha','insulin','metformin','glimepiride','regimen'], null),
    (udm_id, 'investigation', 2, 'adherence, diet and reason for poor control', 'core', null, 'subjective', null,
      array['adherence','compliance','missed doses','diet','cost','stopped medication'], null),
    (udm_id, 'investigation', 3, 'HbA1c', 'core', null, 'objective', null,
      array['hba1c','glycated haemoglobin','a1c'], null),
    (udm_id, 'investigation', 4, 'glucose profile — fasting, pre- and post-meal', 'core', null, 'objective', null,
      array['grbs','fbs','ppbs','glucose chart','cbg','sugar charting'], null),
    (udm_id, 'investigation', 5, 'ketones excluded', 'core', null, 'objective', 'Urine ketones negative',
      array['ketones','urine ketones','serum ketones'],
      '{"when": [{"type": "lab", "analyte": "glucose", "op": "gt", "value": 250}], "effect": "core"}'::jsonb),
    (udm_id, 'investigation', 6, 'foot examination — sensation, pulses, ulcers', 'core', null, 'objective', null,
      array['foot examination','monofilament','neuropathy','pedal pulses','foot ulcer','callus','vibration'], null),
    (udm_id, 'investigation', 7, 'fundus examination / ophthalmology referral', 'core', null, 'objective', null,
      array['fundus','fundoscopy','retinopathy','ophthalmology','npdr','pdr'], null),
    (udm_id, 'investigation', 8, 'urine albumin-creatinine ratio', 'core', null, 'objective', null,
      array['urine acr','acr','microalbuminuria','albuminuria','uacr'], null),
    (udm_id, 'investigation', 9, 'renal function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','egfr','renal function'], null),
    (udm_id, 'investigation', 10, 'lipid profile', 'core', null, 'objective', null,
      array['lipid profile','ldl','cholesterol','triglycerides','statin'], null),
    (udm_id, 'investigation', 11, 'infection screen — skin, urine, chest', 'optional', null, 'assessment', null,
      array['infection','uti','cellulitis','abscess','tb','foot infection'], null),
    (udm_id, 'red_flag', 12, 'hypoglycaemia episode on the ward', 'core', 'urgent', 'objective', 'No hypoglycaemia',
      array['hypoglycaemia','hypo','low sugar','sweating','grbs low'], null),
    (udm_id, 'investigation', 13, 'insulin technique and hypoglycaemia education', 'core', null, 'plan', null,
      array['insulin technique','injection sites','pen device','hypoglycaemia education','rule of 15','storage of insulin'],
      '{"when": [{"type": "history", "pattern": "insulin"}]}'::jsonb),
    (udm_id, 'pathway_step', 14, 'discharge regimen, glucose monitoring and follow-up planned', 'core', null, 'plan', null,
      array['discharge regimen','home glucose monitoring','glucometer','follow up','diabetes clinic'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 3. Uncontrolled hypertension (not an emergency — that is 0064's checklist)
  -- ---------------------------------------------------------------------------
  select id into uhtn_id from company_protocols
   where title = 'Uncontrolled Hypertension — Checklist' limit 1;

  if uhtn_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Uncontrolled Hypertension — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'uncontrolled_hypertension', 'before_surgery', 'draft')
    returning id into uhtn_id;
  end if;

  delete from company_protocol_items where protocol_id = uhtn_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (uhtn_id, 'investigation', 1, 'duration of hypertension and current drugs', 'core', null, 'subjective', null,
      array['known hypertensive','duration of hypertension','antihypertensives','amlodipine','telmisartan','regimen'], null),
    (uhtn_id, 'investigation', 2, 'adherence and lifestyle — salt, alcohol, NSAID or steroid use', 'core', null, 'subjective', null,
      array['adherence','compliance','missed doses','salt intake','alcohol','nsaids','steroids'], null),
    (uhtn_id, 'investigation', 3, 'repeat BP readings, correct cuff, both arms', 'core', null, 'objective', null,
      array['bp both arms','bp chart','repeat bp','cuff size','blood pressure'], null),
    (uhtn_id, 'investigation', 4, 'fundus examination', 'core', null, 'objective', null,
      array['fundus','fundoscopy','retinopathy','papilloedema'], null),
    (uhtn_id, 'investigation', 5, 'ECG', 'core', null, 'objective', null,
      array['ecg','ekg','lvh','strain pattern'], null),
    (uhtn_id, 'investigation', 6, 'renal function and electrolytes', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','electrolytes','potassium','egfr'], null),
    (uhtn_id, 'investigation', 7, 'urinalysis for protein and blood', 'core', null, 'objective', null,
      array['urine routine','proteinuria','haematuria','urine acr','acr'], null),
    (uhtn_id, 'investigation', 8, 'glucose and lipid profile', 'optional', null, 'objective', null,
      array['fbs','hba1c','lipid profile','ldl'], null),
    (uhtn_id, 'red_flag', 9, 'symptoms of end-organ damage — headache with vomiting, chest pain, breathlessness, visual loss, weakness', 'core', 'urgent', 'assessment', 'No end-organ symptoms',
      array['severe headache','chest pain','breathlessness','visual blurring','focal deficit','encephalopathy'], null),
    (uhtn_id, 'investigation', 10, 'secondary causes screened if young, resistant or hypokalaemic', 'core', null, 'assessment', null,
      array['secondary hypertension','renal doppler','aldosterone','renin','metanephrines','thyroid','osa','renal artery stenosis'],
      '{"when": [{"type": "history", "pattern": "young|resistant|hypokal|snoring|osa|spells|palpitation|renal bruit"}], "effect": "core"}'::jsonb),
    (uhtn_id, 'investigation', 11, 'echocardiography if LVH or cardiac symptoms', 'optional', null, 'plan', null,
      array['echo','2d echo','lv hypertrophy','ejection fraction'],
      '{"when": [{"type": "history", "pattern": "lvh|breathless|chest pain|murmur"}]}'::jsonb),
    (uhtn_id, 'pathway_step', 12, 'discharge regimen, home BP charting and follow-up', 'core', null, 'plan', null,
      array['discharge bp','home bp chart','follow up bp','bp clinic'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 4. Anaemia for evaluation
  -- ---------------------------------------------------------------------------
  select id into anaemia_id from company_protocols
   where title = 'Anaemia Evaluation — Checklist' limit 1;

  if anaemia_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Anaemia Evaluation — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'anaemia_evaluation', 'before_surgery', 'draft')
    returning id into anaemia_id;
  end if;

  delete from company_protocol_items where protocol_id = anaemia_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (anaemia_id, 'investigation', 1, 'blood loss history — GI, menstrual, haematuria', 'core', null, 'subjective', 'No overt blood loss',
      array['melena','malena','haematemesis','bleeding pr','menorrhagia','heavy periods','haematuria'], null),
    (anaemia_id, 'investigation', 2, 'diet, worm infestation and drug history', 'core', null, 'subjective', null,
      array['vegetarian','diet','worms','deworming','nsaids','antiepileptics','methotrexate'], null),
    (anaemia_id, 'investigation', 3, 'haemoglobin and red-cell indices (MCV, MCH, RDW)', 'core', null, 'objective', null,
      array['hb','haemoglobin','mcv','mch','mchc','rdw','indices'], null),
    (anaemia_id, 'investigation', 4, 'peripheral smear', 'core', null, 'objective', null,
      array['peripheral smear','pbs','smear','microcytic','macrocytic','dimorphic','schistocytes','spherocytes'], null),
    (anaemia_id, 'investigation', 5, 'reticulocyte count', 'core', null, 'objective', null,
      array['reticulocyte','retic count','corrected reticulocyte','rpi'], null),
    (anaemia_id, 'investigation', 6, 'iron studies — ferritin, serum iron, TIBC', 'core', null, 'objective', null,
      array['ferritin','serum iron','tibc','transferrin saturation','iron studies'], null),
    (anaemia_id, 'investigation', 7, 'vitamin B12 and folate', 'core', null, 'objective', null,
      array['b12','vitamin b12','folate','folic acid','cobalamin'], null),
    (anaemia_id, 'investigation', 8, 'stool for occult blood and ova/cysts', 'core', null, 'objective', null,
      array['stool occult blood','fobt','occult blood','stool routine','ova','hookworm'], null),
    (anaemia_id, 'investigation', 9, 'haemolysis screen — LDH, indirect bilirubin, haptoglobin, Coombs', 'core', null, 'objective', null,
      array['ldh','indirect bilirubin','haptoglobin','coombs','dct','haemolysis'],
      '{"when": [{"type": "history", "pattern": "haemoly|hemoly|jaundice|reticulocytosis|spherocyt|schistocyt|dark urine"}], "effect": "core"}'::jsonb),
    (anaemia_id, 'investigation', 10, 'renal and thyroid function', 'optional', null, 'objective', null,
      array['creatinine','ckd','tsh','thyroid function'], null),
    (anaemia_id, 'red_flag', 11, 'haemodynamic compromise or cardiac failure from anaemia', 'core', 'critical', 'assessment', 'Haemodynamically stable',
      array['tachycardia','hypotension','breathlessness at rest','heart failure','chest pain','syncope'], null),
    (anaemia_id, 'investigation', 12, 'transfusion need assessed and documented', 'core', null, 'plan', null,
      array['transfusion','prbc','packed cells','blood transfusion','cross match'],
      '{"when": [{"type": "lab", "analyte": "hb", "op": "lt", "value": 7}], "effect": "core"}'::jsonb),
    (anaemia_id, 'pathway_step', 13, 'endoscopy / GI evaluation if iron deficiency without a clear source', 'optional', null, 'plan', null,
      array['endoscopy','ugi scopy','colonoscopy','gastroenterology referral'],
      '{"when": [{"type": "history", "pattern": "iron deficiency|low ferritin|occult blood positive|fobt positive"}]}'::jsonb),
    (anaemia_id, 'pathway_step', 14, 'cause-specific replacement plan and repeat Hb at follow-up', 'core', null, 'plan', null,
      array['iron replacement','iv iron','b12 replacement','repeat hb','follow up'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 5. Thrombocytopenia
  -- ---------------------------------------------------------------------------
  select id into tcp_id from company_protocols
   where title = 'Thrombocytopenia — Checklist' limit 1;

  if tcp_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Thrombocytopenia — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'thrombocytopenia', 'before_surgery', 'draft')
    returning id into tcp_id;
  end if;

  delete from company_protocol_items where protocol_id = tcp_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (tcp_id, 'investigation', 1, 'bleeding history — gums, nose, skin, GI, urine, menstrual', 'core', null, 'subjective', 'No bleeding',
      array['gum bleeding','epistaxis','petechiae','bruising','melena','haematuria','menorrhagia'], null),
    (tcp_id, 'investigation', 2, 'fever, recent infection and travel', 'core', null, 'subjective', null,
      array['fever','dengue','malaria','viral illness','travel'], null),
    (tcp_id, 'investigation', 3, 'drug history — heparin, antibiotics, anticonvulsants, quinine, alcohol', 'core', null, 'subjective', null,
      array['heparin','linezolid','valproate','carbamazepine','quinine','alcohol','new drug'], null),
    (tcp_id, 'investigation', 4, 'peripheral smear — pseudothrombocytopenia (clumping) excluded', 'core', null, 'objective', null,
      array['peripheral smear','platelet clumps','clumping','pseudothrombocytopenia','citrate sample','edta'], null),
    (tcp_id, 'investigation', 5, 'examination for petechiae, mucosal bleeding, fundal haemorrhage, spleen', 'core', null, 'objective', 'No petechiae, no mucosal bleed',
      array['petechiae','purpura','wet purpura','mucosal bleed','fundus','splenomegaly'], null),
    (tcp_id, 'investigation', 6, 'dengue, malaria and scrub typhus tests', 'core', null, 'objective', null,
      array['ns1','dengue serology','mp smear','malaria antigen','scrub typhus igm','widal'],
      '{"when": [{"type": "history", "pattern": "fever"}], "effect": "core"}'::jsonb),
    (tcp_id, 'investigation', 7, 'coagulation profile — PT/INR, aPTT', 'core', null, 'objective', null,
      array['pt','inr','aptt','coagulation','fibrinogen','d-dimer','dic'], null),
    (tcp_id, 'investigation', 8, 'liver function and HIV / HCV / HBsAg', 'optional', null, 'objective', null,
      array['lft','hiv','hcv','hbsag','chronic liver disease'], null),
    (tcp_id, 'investigation', 9, 'daily platelet count and trend', 'core', null, 'objective', null,
      array['platelet count','platelet trend','repeat platelets','falling platelets'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (tcp_id, 'red_flag', 10, 'platelets below 20,000 — active bleeding assessed', 'core', 'critical', 'assessment', 'No active bleeding',
      array['severe thrombocytopenia','active bleeding','wet purpura','platelets below 20000'],
      '{"when": [{"type": "lab", "analyte": "platelet", "op": "lt", "value": 20000}], "effect": "core"}'::jsonb),
    (tcp_id, 'red_flag', 11, 'headache, vomiting or altered sensorium — intracranial bleed considered', 'core', 'critical', 'assessment', 'No neurological symptoms',
      array['headache','vomiting','altered sensorium','intracranial bleed','ich'], null),
    (tcp_id, 'investigation', 12, 'IM injections, NSAIDs and antiplatelets avoided', 'core', null, 'plan', 'Avoided',
      array['no im injection','nsaids avoided','aspirin stopped','antiplatelets held'], null),
    (tcp_id, 'investigation', 13, 'platelet transfusion need assessed', 'optional', null, 'plan', null,
      array['platelet transfusion','sdp','rdp','apheresis platelets'],
      '{"when": [{"type": "lab", "analyte": "platelet", "op": "lt", "value": 20000}]}'::jsonb),
    (tcp_id, 'pathway_step', 14, 'ITP / marrow work-up if persistent and unexplained', 'optional', null, 'plan', null,
      array['itp','immune thrombocytopenia','bone marrow','haematology referral'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 6. Pancytopenia
  -- ---------------------------------------------------------------------------
  select id into pancyto_id from company_protocols
   where title = 'Pancytopenia — Checklist' limit 1;

  if pancyto_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Pancytopenia — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'pancytopenia', 'before_surgery', 'draft')
    returning id into pancyto_id;
  end if;

  delete from company_protocol_items where protocol_id = pancyto_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pancyto_id, 'investigation', 1, 'symptoms of each line — fatigue, infections, bleeding', 'core', null, 'subjective', null,
      array['fatigue','recurrent infections','fever','bleeding','bruising'], null),
    (pancyto_id, 'investigation', 2, 'drug, toxin, alcohol and radiation exposure', 'core', null, 'subjective', null,
      array['methotrexate','chemotherapy','antithyroid','chloramphenicol','alcohol','radiation','pesticide'], null),
    (pancyto_id, 'investigation', 3, 'organomegaly and lymph nodes', 'core', null, 'objective', 'No organomegaly, no lymphadenopathy',
      array['splenomegaly','hepatomegaly','lymphadenopathy','lymph nodes'], null),
    (pancyto_id, 'investigation', 4, 'CBC with differential and reticulocyte count', 'core', null, 'objective', null,
      array['cbc','anc','absolute neutrophil count','differential','reticulocyte'], null),
    (pancyto_id, 'investigation', 5, 'peripheral smear — blasts, macrocytes, hypersegmented neutrophils', 'core', null, 'objective', null,
      array['peripheral smear','pbs','blasts','macrocytes','hypersegmented','leucoerythroblastic'], null),
    (pancyto_id, 'investigation', 6, 'vitamin B12 and folate', 'core', null, 'objective', null,
      array['b12','vitamin b12','folate','megaloblastic'], null),
    (pancyto_id, 'investigation', 7, 'LDH, liver function and viral markers (HIV, HBsAg, HCV)', 'core', null, 'objective', null,
      array['ldh','lft','hiv','hbsag','hcv'], null),
    (pancyto_id, 'investigation', 8, 'infective causes — malaria, kala-azar, TB, enteric', 'optional', null, 'objective', null,
      array['mp smear','malaria antigen','rk39','kala azar','tb','widal','blood culture'],
      '{"when": [{"type": "history", "pattern": "fever|splenomegaly"}]}'::jsonb),
    (pancyto_id, 'red_flag', 9, 'febrile neutropenia', 'core', 'critical', 'assessment', 'Afebrile',
      array['febrile neutropenia','fever with low anc','neutropenic sepsis'],
      '{"when": [{"type": "history", "pattern": "fever"}], "effect": "core"}'::jsonb),
    (pancyto_id, 'red_flag', 10, 'active bleeding', 'core', 'urgent', 'objective', 'No bleeding',
      array['bleeding','gum bleeding','epistaxis','melena','wet purpura'], null),
    (pancyto_id, 'investigation', 11, 'transfusion need (red cells / platelets) assessed', 'core', null, 'plan', null,
      array['transfusion','prbc','platelet transfusion','sdp'], null),
    (pancyto_id, 'investigation', 12, 'autoimmune screen if indicated (ANA)', 'optional', null, 'objective', null,
      array['ana','autoimmune','sle','dsdna'],
      '{"when": [{"type": "history", "pattern": "joint pain|rash|oral ulcer|photosensitiv"}]}'::jsonb),
    (pancyto_id, 'pathway_step', 13, 'bone marrow aspiration and biopsy if cause not found', 'core', null, 'plan', null,
      array['bone marrow','bone marrow aspiration','bm biopsy','trephine','haematology referral'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 7. SLE flare
  -- ---------------------------------------------------------------------------
  select id into sle_id from company_protocols
   where title = 'SLE Flare — Checklist' limit 1;

  if sle_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('SLE Flare — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'sle_flare', 'before_surgery', 'draft')
    returning id into sle_id;
  end if;

  delete from company_protocol_items where protocol_id = sle_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (sle_id, 'investigation', 1, 'organs involved in this flare — skin, joints, serosa, kidney, CNS, blood', 'core', null, 'subjective', null,
      array['rash','arthritis','joint pain','pleuritic pain','oral ulcers','seizure','psychosis','frothy urine','swelling'], null),
    (sle_id, 'investigation', 2, 'current immunosuppression and adherence', 'core', null, 'subjective', null,
      array['hydroxychloroquine','hcq','prednisolone','steroids','mycophenolate','azathioprine','adherence'], null),
    (sle_id, 'investigation', 3, 'anti-dsDNA, C3 and C4', 'core', null, 'objective', null,
      array['dsdna','anti-dsdna','c3','c4','complement','low complement'], null),
    (sle_id, 'investigation', 4, 'CBC — cytopenias', 'core', null, 'objective', null,
      array['cbc','haemoglobin','platelets','lymphopenia','leucopenia','coombs'], null),
    (sle_id, 'investigation', 5, 'urine routine, microscopy and protein quantification — nephritis', 'core', null, 'objective', null,
      array['urine routine','active sediment','rbc casts','proteinuria','upcr','24 hour urine protein'], null),
    (sle_id, 'investigation', 6, 'renal function', 'core', null, 'objective', 'Normal',
      array['creatinine','urea','egfr'], null),
    (sle_id, 'investigation', 7, 'BP and oedema', 'core', null, 'objective', null,
      array['blood pressure','hypertension','oedema','pedal oedema'], null),
    (sle_id, 'investigation', 8, 'infection excluded before escalating immunosuppression', 'core', null, 'assessment', null,
      array['infection excluded','blood culture','urine culture','cxr','procalcitonin','tb screen'], null),
    (sle_id, 'investigation', 9, 'disease activity recorded (SLEDAI)', 'core', null, 'assessment', null,
      array['sledai','sledai-2k','disease activity','bilag'], null),
    (sle_id, 'red_flag', 10, 'renal flare — rising creatinine or active sediment', 'core', 'urgent', 'assessment', null,
      array['lupus nephritis','rising creatinine','active sediment','rbc casts'],
      '{"when": [{"type": "history", "pattern": "nephritis|rbc cast|active sediment|proteinuria"}], "effect": "core"}'::jsonb),
    (sle_id, 'red_flag', 11, 'neuropsychiatric lupus — seizure, psychosis, altered sensorium', 'core', 'critical', 'assessment', 'No neurological features',
      array['seizure','psychosis','altered sensorium','npsle','stroke'], null),
    (sle_id, 'investigation', 12, 'antiphospholipid antibodies if thrombosis or pregnancy loss', 'optional', null, 'objective', null,
      array['apla','antiphospholipid','lupus anticoagulant','anticardiolipin','beta 2 glycoprotein'],
      '{"when": [{"type": "history", "pattern": "thrombosis|dvt|stroke|abortion|pregnancy loss|miscarriage"}]}'::jsonb),
    (sle_id, 'pathway_step', 13, 'renal biopsy considered for suspected nephritis', 'optional', null, 'plan', null,
      array['renal biopsy','kidney biopsy','nephrology referral','isn/rps class'],
      '{"when": [{"type": "item_present", "label": "urine routine, microscopy and protein quantification — nephritis"}, {"type": "history", "pattern": "nephritis|rbc cast|active sediment|proteinuria"}]}'::jsonb),
    (sle_id, 'investigation', 14, 'bone, eye and infection prophylaxis on long-term steroids — addressed?', 'optional', null, 'plan', null,
      array['calcium vitamin d','bone protection','eye check','hcq eye screening','pneumocystis prophylaxis'],
      '{"when": [{"type": "history", "pattern": "steroid|prednisolone|methylpred"}]}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 8. HIV with opportunistic infection
  -- ---------------------------------------------------------------------------
  select id into hiv_id from company_protocols
   where title = 'HIV with Opportunistic Infection — Checklist' limit 1;

  if hiv_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('HIV with Opportunistic Infection — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'hiv_oi', 'before_surgery', 'draft')
    returning id into hiv_id;
  end if;

  delete from company_protocol_items where protocol_id = hiv_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (hiv_id, 'investigation', 1, 'ART status — on ART, regimen, duration, adherence, recent switch', 'core', null, 'subjective', null,
      array['art','on art','art naive','tld','regimen','adherence','defaulter','lfu'], null),
    (hiv_id, 'investigation', 2, 'ART centre registration / NACO linkage (PRE-ART / ART number)', 'core', null, 'plan', null,
      array['art centre','naco','art number','pre-art','linkage','ictc','green book'], null),
    (hiv_id, 'investigation', 3, 'CD4 count', 'core', null, 'objective', null,
      array['cd4','cd4 count','cd4 cells'], null),
    (hiv_id, 'investigation', 4, 'viral load', 'optional', null, 'objective', null,
      array['viral load','hiv rna','vl','suppressed','unsuppressed'], null),
    (hiv_id, 'investigation', 5, 'TB screen — symptoms, sputum CBNAAT, chest X-ray, urine LAM if eligible', 'core', null, 'objective', null,
      array['tb screen','cbnaat','genexpert','truenat','sputum afb','cxr','urine lam','four symptom screen'], null),
    (hiv_id, 'investigation', 6, 'serum cryptococcal antigen', 'core', null, 'objective', null,
      array['crag','cryptococcal antigen','serum crag','india ink'],
      '{"when": [{"type": "lab", "analyte": "cd4", "op": "lt", "value": 200}], "effect": "core"}'::jsonb),
    (hiv_id, 'investigation', 7, 'OI screen by syndrome — oral candida, PCP, toxoplasma, CMV, diarrhoea pathogens', 'core', null, 'assessment', null,
      array['oral candidiasis','thrush','pcp','pneumocystis','toxoplasma','cmv retinitis','cryptosporidium','isospora'], null),
    (hiv_id, 'red_flag', 8, 'headache, fever or altered sensorium — meningitis / space-occupying lesion considered', 'core', 'critical', 'assessment', 'No neurological features',
      array['headache','neck stiffness','altered sensorium','seizure','focal deficit','cryptococcal meningitis','toxoplasmosis'], null),
    (hiv_id, 'red_flag', 9, 'hypoxia or respiratory distress', 'core', 'urgent', 'objective', 'Saturating well on room air',
      array['hypoxia','desaturation','spo2','breathlessness','respiratory distress','pcp'], null),
    (hiv_id, 'investigation', 10, 'fundus examination for CMV retinitis', 'optional', null, 'objective', null,
      array['fundus','cmv retinitis','ophthalmology'],
      '{"when": [{"type": "lab", "analyte": "cd4", "op": "lt", "value": 100}]}'::jsonb),
    (hiv_id, 'investigation', 11, 'hepatitis B / C and syphilis status', 'core', null, 'objective', null,
      array['hbsag','anti hcv','hcv','vdrl','rpr','syphilis'], null),
    (hiv_id, 'investigation', 12, 'renal and liver function before ART / OI treatment', 'core', null, 'objective', null,
      array['creatinine','egfr','lft','transaminases','bilirubin'], null),
    (hiv_id, 'investigation', 13, 'prophylaxis status — is the patient on cotrimoxazole, and on TB preventive therapy once TB is excluded?', 'core', null, 'plan', null,
      array['cotrimoxazole','ctx prophylaxis','ipt','tpt','tb preventive therapy','fluconazole prophylaxis'], null),
    (hiv_id, 'investigation', 14, 'ART start or continuation timing relative to the OI — documented with the ART centre?', 'core', null, 'plan', null,
      array['art timing','art initiation','deferred art','iris','immune reconstitution'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb),
    (hiv_id, 'pathway_step', 15, 'counselling, partner / family testing and follow-up at ART centre', 'core', null, 'plan', null,
      array['counselling','partner testing','disclosure','family testing','art centre follow up'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb);
end $$;

commit;
