-- Ward checklists for four acute-abdomen admissions on the general-surgery unit, whose picker
-- offered only appendicectomy, hernia, perianal and lap_chole.
--
-- WHAT THIS SEEDS. For each template family, its checklist protocol(s) (company_protocols + its
-- company_protocol_items), and one care_templates picker row so the family can be chosen on
-- the ward list. Same shape as 0089.
--
--   acute_pancreatitis       one protocol, 'before_surgery' (managed conservatively)
--   perforation_peritonitis  pre-operative + post-operative
--   intestinal_obstruction   conservative trial / pre-operative + post-operative
--   acute_cholecystitis      pre-operative + post-cholecystectomy
--
-- PHASE. lib/templates.ts phaseFor() gives 'after_surgery' once a patient has a surgery_date,
-- else 'before_surgery', and a protocol is matched on template_family + phase. Pancreatitis
-- has no surgery date, so it gets a 'before_surgery' protocol only.
--
-- PICKER ROWS. General surgery's pickerPhase is 'after_surgery', so every picker row is filed
-- under 'after_surgery' — including pancreatitis — because that is the phase the picker reads.
-- general-surgery.ts has checklistFamilies = null: it is offered every family no other pack
-- claims, and none of lib/specialty/*.ts claims these four.
--
-- Severity scores (BISAP, modified Marshall, Tokyo TG18 grade) are items to record here; the
-- score engine computes them separately. No drug or fluid doses or volumes anywhere. Drug
-- names appear only as aliases (words a resident dictates).
--
-- CLINICAL CONTENT: PENDING CLINICIAN REVIEW — seeded as draft; a later patch publishes it.
-- Drafts are invisible to residents (getTemplateForPatient matches published protocols only).
--
-- Requires: 0026, 0032, 0036, 0040, 0056, 0058, 0060.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title, and
-- the picker rows are inserted only where missing.

begin;

-- ---------------------------------------------------------------------------
-- acute_pancreatitis
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Acute Pancreatitis — Ward Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Pancreatitis — Ward Checklist', 'v1-draft',
            'WardMate general surgery pack', 'acute_pancreatitis', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'serum amylase / lipase', 'core', null, 'objective', null,
      array['amylase','lipase','serum lipase','serum amylase','enzymes'], null),
    (pre_id, 'investigation', 2, 'BISAP score', 'core', null, 'assessment', null,
      array['bisap','severity score','bisap score'], null),
    (pre_id, 'investigation', 3, 'modified Marshall score', 'core', null, 'assessment', null,
      array['marshall','modified marshall','organ failure score','atlanta','revised atlanta','severity'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 4, 'ultrasound for gallstones', 'core', null, 'objective', null,
      array['usg','ultrasound','gallstones','cholelithiasis','cbd','biliary'], null),
    (pre_id, 'investigation', 5, 'alcohol history', 'core', null, 'subjective', null,
      array['alcohol','drinking','ethanol','last drink','alcoholic'], null),
    (pre_id, 'investigation', 6, 'serum triglycerides and calcium', 'core', null, 'objective', null,
      array['triglycerides','tg','lipid profile','calcium','serum calcium','hypertriglyceridemia','hypercalcemia'], null),
    (pre_id, 'investigation', 7, 'fluid response and urine output', 'core', null, 'objective', 'Adequate urine output',
      array['uop','urine output','fluids','fluid balance','input output','bun','haematocrit','hct'], null),
    (pre_id, 'immediate_action', 8, 'analgesia given', 'core', null, 'plan', null,
      array['analgesia','pain relief','tramadol','paracetamol','opioid','pain score'], null),
    (pre_id, 'pathway_step', 9, 'early enteral feeding started', 'core', null, 'plan', null,
      array['orals','oral feeds','enteral','ryles feeds','nj feeding','nasojejunal','diet','allowed orally'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),
    (pre_id, 'investigation', 10, 'CECT timing — not before 72 h unless diagnosis in doubt', 'optional', null, 'checks', null,
      array['cect','ct abdomen','contrast ct','ct','ctsi','balthazar'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb),
    (pre_id, 'red_flag', 11, 'organ failure', 'core', 'critical', 'assessment', 'No organ failure',
      array['hypotension','shock','oliguria','rising creatinine','hypoxia','spo2 low','ards','persistent organ failure','sirs'], null),
    (pre_id, 'red_flag', 12, 'infected necrosis', 'core', 'urgent', 'assessment', 'No features of infected necrosis',
      array['fever','rising counts','gas in collection','infected necrosis','walled off necrosis','won','sepsis'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb),
    (pre_id, 'investigation', 13, 'abdominal distension and intra-abdominal pressure', 'optional', null, 'objective', 'Soft, not distended',
      array['distension','girth','iap','bladder pressure','abdominal compartment'], null),
    (pre_id, 'pathway_step', 14, 'plan for cholecystectomy if biliary', 'optional', null, 'plan', null,
      array['same admission cholecystectomy','interval cholecystectomy','lap chole planned','ercp'],
      '{"when": [{"type": "history", "pattern": "gall ?stones?|cholelithiasis|biliary pancreatitis"}], "effect": "core"}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- perforation_peritonitis
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Perforation Peritonitis — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Perforation Peritonitis — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'perforation_peritonitis', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'vitals and shock status', 'core', null, 'objective', null,
      array['pulse','bp','blood pressure','temperature','spo2','shock index','resp rate'], null),
    (pre_id, 'immediate_action', 2, 'IV access and resuscitation started', 'core', null, 'plan', null,
      array['iv line','cannula','resuscitation','iv fluids','crystalloids','ringer lactate','normal saline'], null),
    (pre_id, 'investigation', 3, 'erect abdominal X-ray / chest X-ray for free gas', 'core', null, 'objective', null,
      array['erect xray','x ray erect abdomen','cxr erect','free gas','pneumoperitoneum','gas under diaphragm'], null),
    (pre_id, 'investigation', 4, 'CT abdomen if diagnosis unclear', 'optional', null, 'objective', null,
      array['ct','cect','ct abdomen','usg','ultrasound','free fluid'], null),
    (pre_id, 'investigation', 5, 'CBC, RFT, electrolytes, LFT', 'core', null, 'objective', null,
      array['cbc','tlc','counts','rft','creatinine','urea','electrolytes','sodium','potassium','lft'], null),
    (pre_id, 'investigation', 6, 'sepsis markers — lactate, procalcitonin', 'core', null, 'objective', null,
      array['lactate','abg','procalcitonin','pct','crp'], null),
    (pre_id, 'investigation', 7, 'blood cultures sent', 'core', null, 'checks', null,
      array['blood culture','cultures sent','c/s'], null),
    (pre_id, 'immediate_action', 8, 'IV antibiotics given', 'core', null, 'plan', null,
      array['antibiotics','iv antibiotics','ceftriaxone','metronidazole','piperacillin','pip taz','meropenem'], null),
    (pre_id, 'immediate_action', 9, 'nasogastric tube inserted', 'core', null, 'plan', null,
      array['ng','ryles','ryles tube','nasogastric','rt aspirate'], null),
    (pre_id, 'immediate_action', 10, 'urinary catheter and urine output', 'core', null, 'plan', null,
      array['foley','catheter','uop','urine output','hourly urine'], null),
    (pre_id, 'investigation', 11, 'blood grouped and cross-matched', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','units reserved'], null),
    (pre_id, 'investigation', 12, 'consent for laparotomy including possible stoma', 'core', null, 'checks', null,
      array['consent','high risk consent','stoma consent','laparotomy consent','ostomy'], null),
    (pre_id, 'investigation', 13, 'anaesthetic fitness', 'core', null, 'checks', null,
      array['pac','anaesthesia clearance','fit for surgery','asa'], null),
    (pre_id, 'red_flag', 14, 'septic shock', 'core', 'critical', 'assessment', 'Haemodynamically stable',
      array['hypotension','shock','vasopressor','noradrenaline','oliguria','altered sensorium','cold peripheries'], null),
    (pre_id, 'red_flag', 15, 'raised lactate', 'core', 'urgent', 'objective', null,
      array['lactate high','hyperlactatemia'],
      '{"when": [{"type": "lab", "analyte": "lactate", "op": "gte", "value": 2}], "effect": "core"}'::jsonb);

  select id into post_id from company_protocols
   where title = 'Perforation Peritonitis — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Perforation Peritonitis — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'perforation_peritonitis', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day and procedure done', 'core', null, 'assessment', null,
      array['pod','post op day','graham patch','omental patch','primary closure','resection','ileostomy'], null),
    (post_id, 'investigation', 2, 'vitals and sepsis resolution', 'core', null, 'objective', 'Afebrile, haemodynamically stable',
      array['pulse','bp','temperature','fever spike','tachycardia','vasopressor weaned'], null),
    (post_id, 'investigation', 3, 'counts and sepsis markers trend', 'core', null, 'objective', null,
      array['tlc','counts','crp','procalcitonin','lactate'], null),
    (post_id, 'investigation', 4, 'drain output and character', 'core', null, 'objective', 'Serous, minimal',
      array['drain','drain output','serous','seropurulent','bilious','feculent','haemorrhagic'], null),
    (post_id, 'investigation', 5, 'urine output', 'core', null, 'objective', 'Adequate',
      array['uop','urine','catheter output'], null),
    (post_id, 'investigation', 6, 'nasogastric aspirate', 'core', null, 'objective', null,
      array['ng output','ryles aspirate','rt aspirate','ng removed'], null),
    (post_id, 'investigation', 7, 'return of bowel function', 'core', null, 'objective', 'Passed flatus',
      array['bowel sounds','flatus','stool','motion','ileus'], null),
    (post_id, 'pathway_step', 8, 'oral / enteral nutrition started', 'core', null, 'plan', null,
      array['orals','sips','liquids','diet','feeding jejunostomy','fj feeds','tpn'],
      '{"when": [{"type": "pod_gte", "days": 2}]}'::jsonb),
    (post_id, 'investigation', 9, 'stoma health and output', 'optional', null, 'objective', 'Stoma healthy, functioning',
      array['stoma','ileostomy','colostomy','stoma output','dusky stoma','stoma bag'],
      '{"when": [{"type": "history", "pattern": "stoma|ostomy"}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 10, 'wound', 'core', null, 'objective', 'Healthy, no discharge',
      array['incision','dressing','ssi','wound discharge','gaping','pus'], null),
    (post_id, 'red_flag', 11, 'anastomotic or repair leak', 'core', 'critical', 'assessment', 'No features of leak',
      array['bilious drain','feculent drain','leak','peritonism','new tachycardia','rising counts','fever'], null),
    (post_id, 'red_flag', 12, 'burst abdomen or wound dehiscence', 'core', 'urgent', 'objective', 'Wound intact',
      array['burst abdomen','dehiscence','serosanguinous discharge','gaping wound'],
      '{"when": [{"type": "pod_gte", "days": 4}]}'::jsonb),
    (post_id, 'investigation', 13, 'chest physiotherapy and mobilisation', 'optional', null, 'plan', null,
      array['spirometry','incentive spirometry','chest physio','ambulation','mobilised'], null),
    (post_id, 'pathway_step', 14, 'H. pylori treatment and ulcer biopsy follow-up', 'optional', null, 'plan', null,
      array['h pylori','h. pylori','eradication','ppi','biopsy','histopathology','hpe','ogd'],
      '{"when": [{"type": "history", "pattern": "ulcer|duodenal|gastric|pre-?pyloric|dup|gup"}], "effect": "core"}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- intestinal_obstruction
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Intestinal Obstruction — Conservative Trial / Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Intestinal Obstruction — Conservative Trial / Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'intestinal_obstruction', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'passage of flatus and stool', 'core', null, 'subjective', null,
      array['flatus','stool','motion','obstipation','constipation'], null),
    (pre_id, 'investigation', 2, 'vomiting', 'core', null, 'subjective', null,
      array['vomiting','bilious vomiting','feculent vomiting','emesis'], null),
    (pre_id, 'investigation', 3, 'abdominal girth and distension', 'core', null, 'objective', null,
      array['girth','abdominal girth','distension','distended'], null),
    (pre_id, 'investigation', 4, 'hernial orifices examined', 'core', null, 'objective', 'Hernial orifices free',
      array['hernial orifices','inguinal','femoral','umbilical','incisional','obstructed hernia'], null),
    (pre_id, 'investigation', 5, 'previous abdominal surgery', 'core', null, 'subjective', null,
      array['previous surgery','adhesions','prior laparotomy','scar'], null),
    (pre_id, 'immediate_action', 6, 'nasogastric decompression and NG output', 'core', null, 'plan', null,
      array['ng','ryles','ryles tube','ng output','rt aspirate','nasogastric'], null),
    (pre_id, 'immediate_action', 7, 'IV fluids and urine output', 'core', null, 'plan', null,
      array['iv fluids','uop','urine output','foley','input output'], null),
    (pre_id, 'investigation', 8, 'electrolytes and renal function', 'core', null, 'objective', null,
      array['sodium','potassium','electrolytes','rft','creatinine','urea'], null),
    (pre_id, 'investigation', 9, 'erect / supine abdominal X-ray', 'core', null, 'objective', null,
      array['x ray abdomen','xray','erect xray','supine xray','air fluid levels','dilated loops'], null),
    (pre_id, 'investigation', 10, 'CT abdomen — level and cause, transition point', 'optional', null, 'objective', null,
      array['ct','cect','ct abdomen','transition point','closed loop','whirl sign'], null),
    (pre_id, 'red_flag', 11, 'strangulation — continuous pain, peritonism, fever, tachycardia', 'core', 'critical', 'assessment', 'No features of strangulation',
      array['continuous pain','constant pain','peritonism','guarding','rebound','tenderness','fever','tachycardia','strangulation'], null),
    (pre_id, 'red_flag', 12, 'raised lactate or rising counts', 'core', 'urgent', 'objective', null,
      array['lactate','tlc','leucocytosis','acidosis'],
      '{"when": [{"type": "lab", "analyte": "lactate", "op": "gte", "value": 2}], "effect": "core"}'::jsonb),
    (pre_id, 'pathway_step', 13, 'review of conservative trial', 'core', null, 'assessment', null,
      array['conservative trial','conservative management','gastrografin','contrast challenge','not resolving'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (pre_id, 'pathway_step', 14, 'decision to operate', 'core', null, 'plan', null,
      array['plan laparotomy','posted for surgery','taken up for surgery','exploration'], null),
    (pre_id, 'investigation', 15, 'consent including possible resection / stoma', 'optional', null, 'checks', null,
      array['consent','high risk consent','stoma consent','resection'],
      '{"when": [{"type": "item_present", "label": "decision to operate"}], "effect": "core"}'::jsonb);

  select id into post_id from company_protocols
   where title = 'Intestinal Obstruction — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Intestinal Obstruction — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'intestinal_obstruction', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day and procedure done', 'core', null, 'assessment', null,
      array['pod','post op day','adhesiolysis','resection anastomosis','herniorrhaphy','ileostomy','colostomy'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable, afebrile',
      array['pulse','bp','temperature','spo2'], null),
    (post_id, 'investigation', 3, 'nasogastric aspirate', 'core', null, 'objective', null,
      array['ng output','ryles aspirate','rt aspirate','ng removed'], null),
    (post_id, 'investigation', 4, 'return of bowel function', 'core', null, 'objective', 'Passed flatus',
      array['bowel sounds','flatus','stool','motion'], null),
    (post_id, 'investigation', 5, 'abdominal distension', 'core', null, 'objective', 'Soft, not distended',
      array['distension','girth','soft abdomen'], null),
    (post_id, 'investigation', 6, 'drain output and character', 'core', null, 'objective', 'Serous, minimal',
      array['drain','drain output','serous','bilious','feculent','haemorrhagic'], null),
    (post_id, 'investigation', 7, 'urine output and electrolytes', 'core', null, 'objective', null,
      array['uop','urine','sodium','potassium','electrolytes'], null),
    (post_id, 'pathway_step', 8, 'oral feeds started', 'core', null, 'plan', null,
      array['orals','sips','liquids','diet','soft diet'],
      '{"when": [{"type": "pod_gte", "days": 2}]}'::jsonb),
    (post_id, 'investigation', 9, 'stoma health and output', 'optional', null, 'objective', 'Stoma healthy, functioning',
      array['stoma','ileostomy','colostomy','stoma output','high output stoma'],
      '{"when": [{"type": "history", "pattern": "stoma|ostomy"}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 10, 'wound', 'core', null, 'objective', 'Healthy, no discharge',
      array['incision','dressing','ssi','wound discharge','pus'], null),
    (post_id, 'red_flag', 11, 'anastomotic leak', 'core', 'critical', 'assessment', 'No features of leak',
      array['feculent drain','leak','peritonism','new tachycardia','rising counts','fever'],
      '{"when": [{"type": "history", "pattern": "resection|anastomosis"}]}'::jsonb),
    (post_id, 'red_flag', 12, 'prolonged ileus or early recurrent obstruction', 'core', 'warning', 'assessment', null,
      array['ileus','distension','vomiting','no flatus','high ng output'],
      '{"when": [{"type": "pod_gte", "days": 4}]}'::jsonb),
    (post_id, 'investigation', 13, 'chest physiotherapy and mobilisation', 'optional', null, 'plan', null,
      array['spirometry','incentive spirometry','chest physio','ambulation','mobilised'], null),
    (post_id, 'pathway_step', 14, 'histopathology of resected specimen followed up', 'optional', null, 'plan', null,
      array['hpe','histopathology','biopsy report'],
      '{"when": [{"type": "history", "pattern": "resection"}], "effect": "core"}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- acute_cholecystitis
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Acute Cholecystitis — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Cholecystitis — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'acute_cholecystitis', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'vitals', 'core', null, 'objective', null,
      array['pulse','bp','temperature','fever','spo2'], null),
    (pre_id, 'investigation', 2, 'Murphy sign and RUQ findings', 'core', null, 'objective', null,
      array['murphy','murphys sign','ruq tenderness','gb lump','palpable gallbladder'], null),
    (pre_id, 'investigation', 3, 'ultrasound findings', 'core', null, 'objective', null,
      array['usg','ultrasound','gb wall thickening','pericholecystic fluid','calculus','sonographic murphy'], null),
    (pre_id, 'investigation', 4, 'CBC and CRP', 'core', null, 'objective', null,
      array['cbc','tlc','counts','crp'], null),
    (pre_id, 'investigation', 5, 'LFT', 'core', null, 'objective', null,
      array['lft','bilirubin','alp','alkaline phosphatase','sgpt','sgot','ggt'], null),
    (pre_id, 'investigation', 6, 'CBD stone screen', 'core', null, 'assessment', null,
      array['cbd','cbd diameter','choledocholithiasis','mrcp','eus','cbd stone'], null),
    (pre_id, 'investigation', 7, 'Tokyo guidelines TG18 grade', 'core', null, 'assessment', null,
      array['tokyo','tg18','tokyo grade','grade i','grade ii','grade iii','severity'], null),
    (pre_id, 'immediate_action', 8, 'IV antibiotics given', 'core', null, 'plan', null,
      array['antibiotics','iv antibiotics','ceftriaxone','metronidazole','piperacillin','pip taz'], null),
    (pre_id, 'immediate_action', 9, 'analgesia given', 'core', null, 'plan', null,
      array['analgesia','pain relief','diclofenac','paracetamol','tramadol'], null),
    (pre_id, 'investigation', 10, 'amylase / lipase', 'optional', null, 'objective', null,
      array['amylase','lipase','gallstone pancreatitis'], null),
    (pre_id, 'pathway_step', 11, 'early laparoscopic cholecystectomy decision within 72 h', 'core', null, 'plan', null,
      array['early lap chole','index admission cholecystectomy','posted for lap chole','interval cholecystectomy','pct','cholecystostomy'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 12, 'anaesthetic fitness and consent', 'core', null, 'checks', null,
      array['pac','anaesthesia clearance','fit for surgery','consent','conversion to open consent'], null),
    (pre_id, 'red_flag', 13, 'cholangitis — fever, jaundice, pain; hypotension or confusion', 'core', 'critical', 'assessment', 'No jaundice, no rigors',
      array['charcot','jaundice','rigors','cholangitis','reynolds','hypotension','confusion','icterus'], null),
    (pre_id, 'red_flag', 14, 'gangrenous or perforated gallbladder', 'core', 'urgent', 'assessment', 'No features of gangrene or perforation',
      array['gangrene','emphysematous','perforated gb','empyema','generalised peritonitis','worsening pain'], null);

  select id into post_id from company_protocols
   where title = 'Acute Cholecystitis — Post-cholecystectomy Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Cholecystitis — Post-cholecystectomy Checklist', 'v1-draft',
            'WardMate general surgery pack', 'acute_cholecystitis', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day and procedure done', 'core', null, 'assessment', null,
      array['pod','post op day','lap chole','open cholecystectomy','subtotal cholecystectomy','converted'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable, afebrile',
      array['pulse','bp','temperature','spo2'], null),
    (post_id, 'investigation', 3, 'pain', 'core', null, 'subjective', 'Controlled',
      array['pain','shoulder tip pain','port site pain'], null),
    (post_id, 'investigation', 4, 'abdomen', 'core', null, 'objective', 'Soft, non-tender',
      array['abdomen','tenderness','distension','guarding'], null),
    (post_id, 'investigation', 5, 'drain output and character', 'optional', null, 'objective', 'Serous, minimal',
      array['drain','drain output','bilious drain','haemorrhagic','serous'],
      '{"when": [{"type": "history", "pattern": "drain"}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 6, 'oral intake', 'core', null, 'objective', 'Tolerating orally',
      array['orals','diet','sips','tolerating orals','nausea','vomiting'], null),
    (post_id, 'investigation', 7, 'port sites / wound', 'core', null, 'objective', 'Healthy, dry',
      array['port site','wound','incision','dressing','umbilical port'], null),
    (post_id, 'investigation', 8, 'urine output / voided', 'core', null, 'objective', 'Voided',
      array['uop','voided','passed urine','retention'], null),
    (post_id, 'investigation', 9, 'LFT', 'optional', null, 'objective', null,
      array['lft','bilirubin','alp','sgpt','sgot'],
      '{"when": [{"type": "pod_gte", "days": 1}]}'::jsonb),
    (post_id, 'red_flag', 10, 'bile leak', 'core', 'critical', 'assessment', 'No features of bile leak',
      array['bilious drain','bile in drain','biliary peritonitis','bile leak','fever','distension','peritonism'], null),
    (post_id, 'red_flag', 11, 'retained CBD stone or bile duct injury — jaundice, rising bilirubin', 'core', 'urgent', 'assessment', 'No jaundice',
      array['jaundice','icterus','rising bilirubin','retained stone','cbd injury','cholangitis'], null),
    (post_id, 'red_flag', 12, 'post-operative bleeding', 'core', 'urgent', 'objective', 'No bleeding',
      array['haemorrhagic drain','tachycardia','hypotension','falling hb','bleeding'], null),
    (post_id, 'pathway_step', 13, 'gallbladder histopathology followed up', 'optional', null, 'plan', null,
      array['hpe','histopathology','gb biopsy','incidental carcinoma'], null),
    (post_id, 'pathway_step', 14, 'drain removed', 'optional', null, 'plan', null,
      array['drain removed','drain out'],
      '{"when": [{"type": "item_present", "label": "drain output and character"}, {"type": "pod_gte", "days": 1}]}'::jsonb);
end $$;

-- =============================================================================================
-- PICKER ROWS
-- =============================================================================================
insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('acute_pancreatitis',      null::text, 'after_surgery'::care_phase, 'Acute pancreatitis'),
  ('perforation_peritonitis', null,       'after_surgery',             'Perforation peritonitis'),
  ('intestinal_obstruction',  null,       'after_surgery',             'Intestinal obstruction'),
  ('acute_cholecystitis',     null,       'after_surgery',             'Acute cholecystitis')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
