-- Ward checklists for five elective / septic general-surgery families the unit's picker lacked
-- (it offered only appendicectomy, hernia, perianal and lap_chole — 0005 / 0037 / 0038).
--
-- WHAT THIS SEEDS. For each template family, two checklist protocols (company_protocols + their
-- company_protocol_items) — a pre-operative one ('before_surgery') and a post-operative one
-- ('after_surgery') — and one care_templates picker row so the family can be chosen on the ward
-- list. Same shape as 0089.
--
--   general_surgery  breast_surgery        MRM / breast-conserving surgery / excision of lump
--                    colorectal_resection  hemicolectomy / anterior resection / APR, ± stoma
--                    gastrectomy           subtotal / total gastrectomy with D2 dissection
--                    thyroidectomy         hemithyroidectomy / total thyroidectomy
--                    abscess_debridement   abscess I&D, diabetic foot / necrotising infection
--                                          debridement, toe amputation
--
-- OWNERSHIP. The general-surgery pack has checklistFamilies = null, so it is offered every
-- family no other pack claims. None of the five names above appears in any other pack's
-- checklistFamilies (lib/specialty/*.ts), so they land on general surgery only.
--
-- PHASE. lib/templates.ts phaseFor() gives 'after_surgery' once a patient has a surgery_date,
-- else 'before_surgery'; a protocol is matched on template_family + phase. The picker rows are
-- filed under 'after_surgery' because that is general surgery's pickerPhase. The picker row
-- carries no items; the protocols supply them.
--
-- LAB TRIGGERS. A lab trigger matches the analyte against the normalised observation label, so
-- the calcium and glucose triggers below key off the item labels 'serum calcium' and
-- 'blood glucose' in the same protocol.
--
-- No drug doses anywhere. Drug names appear only as aliases (words a resident dictates).
--
-- CLINICAL CONTENT: PENDING CLINICIAN REVIEW — seeded as draft; a later patch publishes it.
-- Drafts are invisible to residents (getTemplateForPatient matches published protocols only).
--
-- Requires: 0026, 0032, 0036, 0040, 0056, 0058, 0060.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title, and
-- the picker rows are inserted only where missing.

begin;

-- ---------------------------------------------------------------------------
-- breast_surgery
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Breast Surgery — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Breast Surgery — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'breast_surgery', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'planned procedure and side', 'core', null, 'assessment', null,
      array['mrm','modified radical mastectomy','bcs','breast conserving surgery','wide local excision','excision of lump','lumpectomy','left breast','right breast'], null),
    (pre_id, 'investigation', 2, 'tissue diagnosis', 'core', null, 'objective', null,
      array['fnac','core biopsy','trucut','tru-cut','biopsy report','histology','hpe'], null),
    (pre_id, 'investigation', 3, 'receptor status', 'core', null, 'objective', null,
      array['er','pr','her2','her2 neu','ihc','receptor','triple negative','ki67'], null),
    (pre_id, 'investigation', 4, 'breast imaging', 'core', null, 'objective', null,
      array['mammogram','mammography','usg breast','ultrasound breast','birads','bi-rads'], null),
    (pre_id, 'investigation', 5, 'axillary status', 'core', null, 'objective', null,
      array['axilla','axillary nodes','axillary lymph nodes','n stage','node positive','node negative'], null),
    (pre_id, 'investigation', 6, 'metastatic work-up', 'core', null, 'objective', null,
      array['staging','cect chest','cect abdomen','chest x-ray','usg abdomen','bone scan','pet ct','metastasis'], null),
    (pre_id, 'pathway_step', 7, 'tumour board decision', 'core', null, 'plan', null,
      array['tumour board','tumor board','mdt','multidisciplinary','neoadjuvant chemotherapy','nact','upfront surgery'], null),
    (pre_id, 'investigation', 8, 'clip or marker placed before neoadjuvant therapy', 'optional', null, 'objective', null,
      array['clip','marker','tumour bed marker','post nact'],
      '{"when": [{"type": "history", "pattern": "neoadjuvant|nact|post chemo"}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 9, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','asa'], null),
    (pre_id, 'investigation', 10, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','informed consent','breast reconstruction discussed'], null),
    (pre_id, 'immediate_action', 11, 'blood grouped and reserved', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','blood reserved','units reserved'], null),
    (pre_id, 'immediate_action', 12, 'side marked', 'core', null, 'checks', null,
      array['site marking','side marking','marked'], null),
    (pre_id, 'investigation', 13, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null);

  select id into post_id from company_protocols
   where title = 'Breast Surgery — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Breast Surgery — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'breast_surgery', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','temperature','spo2'], null),
    (post_id, 'investigation', 3, 'drain output', 'core', null, 'objective', null,
      array['drain','suction drain','romovac','axillary drain','flap drain','drain volume'], null),
    (post_id, 'investigation', 4, 'flap and wound', 'core', null, 'objective', 'Flaps healthy, wound dry',
      array['flap','wound','dressing','suture line','incision'], null),
    (post_id, 'red_flag', 5, 'flap necrosis or haematoma', 'core', 'urgent', 'objective', 'No haematoma, flaps viable',
      array['haematoma','hematoma','flap necrosis','dusky flap','flap edge necrosis','tense swelling'], null),
    (post_id, 'red_flag', 6, 'wound infection', 'core', 'warning', 'objective', 'No signs of infection',
      array['ssi','surgical site infection','pus','discharge','erythema','cellulitis'], null),
    (post_id, 'pathway_step', 7, 'arm and shoulder exercises', 'core', null, 'plan', null,
      array['arm exercises','shoulder exercises','physiotherapy','physio','shoulder mobilisation'],
      '{"when": [{"type": "pod_gte", "days": 1}]}'::jsonb),
    (post_id, 'pathway_step', 8, 'lymphoedema precautions on operated side', 'core', null, 'plan', null,
      array['lymphoedema','lymphedema','arm care','no cannula on operated side','no bp on operated side','arm elevation'], null),
    (post_id, 'pathway_step', 9, 'drain removal', 'core', null, 'plan', null,
      array['drain removed','drain out','remove drain'],
      '{"when": [{"type": "pod_gte", "days": 3}]}'::jsonb),
    (post_id, 'investigation', 10, 'seroma', 'optional', null, 'objective', 'No seroma',
      array['seroma','fluid collection','aspiration','seroma aspiration'],
      '{"when": [{"type": "item_present", "label": "drain removal"}]}'::jsonb),
    (post_id, 'pathway_step', 11, 'suture or staple removal', 'core', null, 'plan', null,
      array['suture removal','stitch removal','staple removal','sr'],
      '{"when": [{"type": "pod_gte", "days": 10}]}'::jsonb),
    (post_id, 'pathway_step', 12, 'histopathology report', 'core', null, 'plan', null,
      array['hpe','histopathology','margins','margin status','nodes positive','pathology report'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb),
    (post_id, 'pathway_step', 13, 'adjuvant plan referral', 'optional', null, 'plan', null,
      array['oncology referral','adjuvant chemotherapy','radiotherapy','hormone therapy','tumour board'], null);
end $$;

-- ---------------------------------------------------------------------------
-- colorectal_resection
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Colorectal Resection — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Colorectal Resection — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'colorectal_resection', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'planned procedure', 'core', null, 'assessment', null,
      array['right hemicolectomy','left hemicolectomy','anterior resection','low anterior resection','apr','abdominoperineal resection','sigmoid colectomy','hartmann'], null),
    (pre_id, 'investigation', 2, 'colonoscopy and biopsy', 'core', null, 'objective', null,
      array['colonoscopy','sigmoidoscopy','biopsy','histology','hpe','adenocarcinoma'], null),
    (pre_id, 'investigation', 3, 'staging imaging', 'core', null, 'objective', null,
      array['cect','cect abdomen','cect chest','mri pelvis','mri rectum','staging','metastasis','liver mets'], null),
    (pre_id, 'investigation', 4, 'CEA', 'core', null, 'objective', null,
      array['cea','carcinoembryonic antigen','tumour marker'], null),
    (pre_id, 'pathway_step', 5, 'tumour board decision', 'core', null, 'plan', null,
      array['tumour board','tumor board','mdt','neoadjuvant','chemoradiation','ncrt','short course rt'], null),
    (pre_id, 'investigation', 6, 'haemoglobin and nutrition', 'core', null, 'objective', null,
      array['hb','haemoglobin','albumin','anaemia','weight loss','nutrition'], null),
    (pre_id, 'immediate_action', 7, 'bowel preparation', 'core', null, 'checks', null,
      array['bowel prep','bowel preparation','peg','mechanical bowel prep','enema'], null),
    (pre_id, 'immediate_action', 8, 'stoma site marked', 'core', null, 'checks', null,
      array['stoma marking','stoma site','stoma nurse','stoma counselling','marked'],
      '{"when": [{"type": "history", "pattern": "stoma|ostomy|\\bapr\\b|abdominoperineal|low anterior|hartmann"}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 9, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','asa'], null),
    (pre_id, 'investigation', 10, 'consent including stoma', 'core', null, 'checks', null,
      array['consent taken','consented','stoma consent','high risk consent'], null),
    (pre_id, 'immediate_action', 11, 'blood cross-matched and reserved', 'core', null, 'checks', null,
      array['crossmatch','cross match','blood reserved','units reserved','prbc'], null),
    (pre_id, 'immediate_action', 12, 'thromboprophylaxis plan', 'core', null, 'plan', null,
      array['dvt prophylaxis','vte prophylaxis','stockings','enoxaparin','heparin'], null),
    (pre_id, 'red_flag', 13, 'obstruction or perforation', 'core', 'critical', 'assessment', 'No features of obstruction',
      array['obstruction','distension','not passing flatus','perforation','peritonitis','absolute constipation'], null);

  select id into post_id from company_protocols
   where title = 'Colorectal Resection — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Colorectal Resection — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'colorectal_resection', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','temperature','spo2','heart rate'], null),
    (post_id, 'investigation', 3, 'abdomen', 'core', null, 'objective', 'Soft, appropriately tender, not distended',
      array['abdomen','distension','tenderness','guarding','bowel sounds'], null),
    (post_id, 'investigation', 4, 'drain output', 'core', null, 'objective', null,
      array['drain','pelvic drain','abdominal drain','drain volume','drain character'], null),
    (post_id, 'investigation', 5, 'stoma function', 'core', null, 'objective', 'Stoma healthy, pink, functioning',
      array['stoma','colostomy','ileostomy','stoma output','stoma colour','flatus in bag'],
      '{"when": [{"type": "history", "pattern": "stoma|ostomy|\\bapr\\b|abdominoperineal|hartmann"}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 6, 'return of bowel function', 'core', null, 'subjective', 'Passing flatus',
      array['flatus','passed flatus','bowel movement','stools','ileus'], null),
    (post_id, 'investigation', 7, 'urine output', 'core', null, 'objective', 'Adequate',
      array['uop','catheter output','urine'], null),
    (post_id, 'pathway_step', 8, 'oral feeds started', 'core', null, 'plan', null,
      array['orals','oral sips','liquids','soft diet','ryles removed','ryles tube','nasogastric'],
      '{"when": [{"type": "pod_gte", "days": 1}]}'::jsonb),
    (post_id, 'red_flag', 9, 'anastomotic leak', 'core', 'critical', 'assessment', 'No features of leak',
      array['leak','anastomotic leak','feculent drain','peritonitis','tachycardia','fever','sepsis'],
      '{"when": [{"type": "pod_gte", "days": 3}, {"type": "pod_lte", "days": 7}], "effect": "core"}'::jsonb),
    (post_id, 'red_flag', 10, 'stoma ischaemia or retraction', 'core', 'urgent', 'objective', 'Stoma pink and viable',
      array['dusky stoma','black stoma','stoma necrosis','retraction','stoma retraction'],
      '{"when": [{"type": "history", "pattern": "stoma|ostomy|\\bapr\\b|abdominoperineal|hartmann"}]}'::jsonb),
    (post_id, 'investigation', 11, 'wound', 'core', null, 'objective', 'Healthy, dry',
      array['incision','dressing','suture line','perineal wound','ssi'], null),
    (post_id, 'pathway_step', 12, 'stoma care teaching', 'optional', null, 'plan', null,
      array['stoma teaching','stoma bag change','stoma nurse','appliance'],
      '{"when": [{"type": "history", "pattern": "stoma|ostomy|\\bapr\\b|abdominoperineal|hartmann"}, {"type": "pod_gte", "days": 3}]}'::jsonb),
    (post_id, 'pathway_step', 13, 'suture or staple removal', 'core', null, 'plan', null,
      array['suture removal','stitch removal','staple removal','sr'],
      '{"when": [{"type": "pod_gte", "days": 10}]}'::jsonb),
    (post_id, 'pathway_step', 14, 'histopathology report', 'core', null, 'plan', null,
      array['hpe','histopathology','margins','crm','nodes','lymph node yield','pathology report'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- gastrectomy
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Gastrectomy — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Gastrectomy — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'gastrectomy', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'planned procedure', 'core', null, 'assessment', null,
      array['subtotal gastrectomy','distal gastrectomy','total gastrectomy','d2','d2 lymphadenectomy','gastrojejunostomy'], null),
    (pre_id, 'investigation', 2, 'endoscopy and biopsy', 'core', null, 'objective', null,
      array['ugie','ugi endoscopy','endoscopy','ogd','biopsy','histology','hpe','adenocarcinoma'], null),
    (pre_id, 'investigation', 3, 'staging imaging', 'core', null, 'objective', null,
      array['cect','cect abdomen','cect chest','staging','metastasis','ascites','pet ct'], null),
    (pre_id, 'investigation', 4, 'staging laparoscopy', 'optional', null, 'objective', null,
      array['staging laparoscopy','diagnostic laparoscopy','peritoneal wash','peritoneal cytology'], null),
    (pre_id, 'pathway_step', 5, 'tumour board decision', 'core', null, 'plan', null,
      array['tumour board','tumor board','mdt','perioperative chemotherapy','neoadjuvant','flot'], null),
    (pre_id, 'investigation', 6, 'nutritional status', 'core', null, 'objective', null,
      array['albumin','weight loss','bmi','nutrition','malnutrition','sga'], null),
    (pre_id, 'investigation', 7, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','haemoglobin','anaemia'], null),
    (pre_id, 'immediate_action', 8, 'nutritional optimisation', 'optional', null, 'plan', null,
      array['nutrition support','dietician','nj feeding','nasojejunal','feeding','oral supplements'], null),
    (pre_id, 'red_flag', 9, 'gastric outlet obstruction', 'core', 'urgent', 'assessment', 'No outlet obstruction',
      array['goo','gastric outlet obstruction','projectile vomiting','succussion splash','vomiting'], null),
    (pre_id, 'immediate_action', 10, 'electrolytes corrected', 'core', null, 'objective', null,
      array['electrolytes','sodium','potassium','chloride','alkalosis'],
      '{"when": [{"type": "item_present", "label": "gastric outlet obstruction"}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 11, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','asa'], null),
    (pre_id, 'investigation', 12, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','high risk consent','feeding jejunostomy consent'], null),
    (pre_id, 'immediate_action', 13, 'blood cross-matched and reserved', 'core', null, 'checks', null,
      array['crossmatch','cross match','blood reserved','units reserved','prbc'], null),
    (pre_id, 'immediate_action', 14, 'thromboprophylaxis plan', 'core', null, 'plan', null,
      array['dvt prophylaxis','vte prophylaxis','stockings','enoxaparin','heparin'], null);

  select id into post_id from company_protocols
   where title = 'Gastrectomy — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Gastrectomy — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'gastrectomy', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','temperature','spo2','heart rate','respiratory rate'], null),
    (post_id, 'investigation', 3, 'nasogastric output', 'core', null, 'objective', null,
      array['ryles','ryles tube','rt output','ng output','nasogastric','aspirate'], null),
    (post_id, 'investigation', 4, 'drain output', 'core', null, 'objective', null,
      array['drain','abdominal drain','subhepatic drain','drain volume','drain character'], null),
    (post_id, 'investigation', 5, 'abdomen', 'core', null, 'objective', 'Soft, appropriately tender, not distended',
      array['abdomen','distension','tenderness','guarding','bowel sounds'], null),
    (post_id, 'pathway_step', 6, 'feeding jejunostomy feeds', 'core', null, 'plan', null,
      array['fj','feeding jejunostomy','fj feeds','jejunostomy feeds','enteral feeds','feed tolerance'],
      '{"when": [{"type": "pod_gte", "days": 1}]}'::jsonb),
    (post_id, 'investigation', 7, 'return of bowel function', 'core', null, 'subjective', 'Passing flatus',
      array['flatus','passed flatus','bowel movement','stools','ileus'], null),
    (post_id, 'investigation', 8, 'urine output', 'core', null, 'objective', 'Adequate',
      array['uop','catheter output','urine'], null),
    (post_id, 'investigation', 9, 'chest', 'core', null, 'objective', 'Clear, air entry bilaterally equal',
      array['chest','air entry','crepts','basal atelectasis','incentive spirometry','chest physio'], null),
    (post_id, 'red_flag', 10, 'anastomotic or duodenal stump leak', 'core', 'critical', 'assessment', 'No features of leak',
      array['leak','anastomotic leak','duodenal stump leak','bilious drain','peritonitis','tachycardia','sepsis'],
      '{"when": [{"type": "pod_gte", "days": 3}, {"type": "pod_lte", "days": 7}], "effect": "core"}'::jsonb),
    (post_id, 'pathway_step', 11, 'oral feeds started', 'core', null, 'plan', null,
      array['orals','oral sips','liquids','soft diet','ryles removed','dye study','contrast study'],
      '{"when": [{"type": "pod_gte", "days": 3}]}'::jsonb),
    (post_id, 'investigation', 12, 'wound', 'core', null, 'objective', 'Healthy, dry',
      array['incision','dressing','suture line','ssi','fj site'], null),
    (post_id, 'pathway_step', 13, 'suture or staple removal', 'core', null, 'plan', null,
      array['suture removal','stitch removal','staple removal','sr'],
      '{"when": [{"type": "pod_gte", "days": 10}]}'::jsonb),
    (post_id, 'pathway_step', 14, 'histopathology report', 'core', null, 'plan', null,
      array['hpe','histopathology','margins','nodes','lymph node yield','pathology report'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb),
    (post_id, 'pathway_step', 15, 'vitamin B12 and iron plan at discharge', 'optional', null, 'plan', null,
      array['b12','vitamin b12','iron','dumping advice','small frequent meals'], null);
end $$;

-- ---------------------------------------------------------------------------
-- thyroidectomy
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Thyroidectomy — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Thyroidectomy — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'thyroidectomy', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'planned procedure', 'core', null, 'assessment', null,
      array['hemithyroidectomy','total thyroidectomy','near total thyroidectomy','lobectomy','central neck dissection'], null),
    (pre_id, 'investigation', 2, 'thyroid function', 'core', null, 'objective', 'Euthyroid',
      array['tft','thyroid function test','tsh','t3','t4','ft4','euthyroid'], null),
    (pre_id, 'investigation', 3, 'FNAC report', 'core', null, 'objective', null,
      array['fnac','bethesda','cytology','papillary','follicular neoplasm','colloid goitre'], null),
    (pre_id, 'investigation', 4, 'ultrasound neck', 'core', null, 'objective', null,
      array['usg neck','ultrasound neck','tirads','ti-rads','nodule','cervical nodes'], null),
    (pre_id, 'investigation', 5, 'vocal cord status on indirect laryngoscopy', 'core', null, 'objective', 'Both cords mobile',
      array['il','ild','indirect laryngoscopy','vocal cords','cord mobility','dle','laryngoscopy'], null),
    (pre_id, 'investigation', 6, 'airway and retrosternal extension', 'core', null, 'objective', null,
      array['x-ray neck','tracheal deviation','retrosternal','cect neck','stridor','airway'], null),
    (pre_id, 'investigation', 7, 'baseline serum calcium', 'core', null, 'objective', null,
      array['calcium','ca','baseline calcium','pth'], null),
    (pre_id, 'red_flag', 8, 'thyrotoxic at time of surgery', 'core', 'urgent', 'assessment', 'Euthyroid',
      array['thyrotoxic','hyperthyroid','tachycardia','tremors','not euthyroid'],
      '{"when": [{"type": "history", "pattern": "graves|thyrotoxic|hyperthyroid|toxic (multi)?nodular|toxic adenoma"}], "effect": "core"}'::jsonb),
    (pre_id, 'red_flag', 9, 'stridor or airway compromise', 'core', 'critical', 'objective', 'No stridor',
      array['stridor','breathlessness','tracheal compression','airway compromise'], null),
    (pre_id, 'investigation', 10, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','asa','difficult airway'], null),
    (pre_id, 'investigation', 11, 'consent including voice change and hypocalcaemia risk', 'core', null, 'checks', null,
      array['consent taken','consented','voice change','nerve injury','hypocalcaemia'], null),
    (pre_id, 'immediate_action', 12, 'blood grouped and reserved', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','blood reserved'], null),
    (pre_id, 'investigation', 13, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null);

  select id into post_id from company_protocols
   where title = 'Thyroidectomy — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Thyroidectomy — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'thyroidectomy', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','temperature','spo2','respiratory rate'], null),
    (post_id, 'red_flag', 3, 'neck haematoma or airway compromise', 'core', 'critical', 'objective', 'Neck flat, no swelling, no stridor',
      array['neck haematoma','hematoma','neck swelling','stridor','breathlessness','tense neck'], null),
    (post_id, 'red_flag', 4, 'voice change', 'core', 'urgent', 'subjective', 'Voice normal',
      array['hoarseness','voice change','weak voice','rln','recurrent laryngeal nerve','aspiration on drinking'], null),
    (post_id, 'investigation', 5, 'serum calcium', 'core', null, 'objective', null,
      array['calcium','ca','serum ca','pth','ionised calcium'],
      '{"when": [{"type": "pod_gte", "days": 1}], "effect": "core"}'::jsonb),
    (post_id, 'red_flag', 6, 'symptoms of hypocalcaemia', 'core', 'urgent', 'assessment', 'No perioral tingling or carpopedal spasm',
      array['tingling','perioral numbness','paraesthesia','carpopedal spasm','chvostek','trousseau','tetany'],
      '{"when": [{"type": "lab", "analyte": "calcium", "op": "lt", "value": 8}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 7, 'drain output', 'core', null, 'objective', null,
      array['drain','neck drain','suction drain','drain volume'], null),
    (post_id, 'investigation', 8, 'wound', 'core', null, 'objective', 'Healthy, dry',
      array['incision','dressing','suture line','collar incision','ssi'], null),
    (post_id, 'pathway_step', 9, 'drain removal', 'core', null, 'plan', null,
      array['drain removed','drain out','remove drain'],
      '{"when": [{"type": "pod_gte", "days": 1}]}'::jsonb),
    (post_id, 'pathway_step', 10, 'oral feeds started', 'core', null, 'plan', null,
      array['orals','oral sips','liquids','soft diet'], null),
    (post_id, 'pathway_step', 11, 'thyroxine replacement plan', 'core', null, 'plan', null,
      array['thyroxine','levothyroxine','eltroxin','tsh follow-up'],
      '{"when": [{"type": "history", "pattern": "total thyroidectomy|near total"}], "effect": "core"}'::jsonb),
    (post_id, 'pathway_step', 12, 'suture removal', 'core', null, 'plan', null,
      array['suture removal','stitch removal','sr','subcuticular'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb),
    (post_id, 'pathway_step', 13, 'histopathology report', 'core', null, 'plan', null,
      array['hpe','histopathology','papillary','follicular','capsular invasion','pathology report'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb),
    (post_id, 'pathway_step', 14, 'radioiodine or endocrine referral', 'optional', null, 'plan', null,
      array['rai','radioiodine','nuclear medicine','endocrinology','thyroglobulin'], null);
end $$;

-- ---------------------------------------------------------------------------
-- abscess_debridement
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Abscess Drainage / Debridement — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Abscess Drainage / Debridement — Pre-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'abscess_debridement', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'site and extent of infection', 'core', null, 'objective', null,
      array['abscess','cellulitis','diabetic foot','wagner','necrotising fasciitis','gangrene','toe','site'], null),
    (pre_id, 'investigation', 2, 'planned procedure', 'core', null, 'assessment', null,
      array['incision and drainage','i&d','i and d','debridement','wound debridement','toe amputation','ray amputation','disarticulation'], null),
    (pre_id, 'investigation', 3, 'vitals and sepsis screen', 'core', null, 'objective', 'Stable',
      array['pulse','bp','temperature','spo2','qsofa','sirs','sepsis'], null),
    (pre_id, 'red_flag', 4, 'necrotising infection or septic shock', 'core', 'critical', 'assessment', 'No features of necrotising infection',
      array['crepitus','necrotising fasciitis','rapidly spreading','bullae','skin necrosis','hypotension','septic shock','gas gangrene'], null),
    (pre_id, 'investigation', 5, 'blood glucose', 'core', null, 'objective', null,
      array['rbs','grbs','sugar','blood sugar','glucose','hba1c','ketones'], null),
    (pre_id, 'red_flag', 6, 'uncontrolled glucose or ketoacidosis', 'core', 'urgent', 'assessment', 'Glucose controlled',
      array['dka','ketoacidosis','ketones','hyperglycaemia','uncontrolled sugar'],
      '{"when": [{"type": "lab", "analyte": "glucose", "op": "gt", "value": 250}], "effect": "core"}'::jsonb),
    (pre_id, 'immediate_action', 7, 'glucose control plan', 'core', null, 'plan', null,
      array['insulin','sliding scale','insulin infusion','physician review','medicine consult'],
      '{"when": [{"type": "history", "pattern": "diabet|\\bdm\\b|t2dm|sugar"}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 8, 'renal function and counts', 'core', null, 'objective', null,
      array['tlc','wbc','creatinine','urea','kft','rft','crp'], null),
    (pre_id, 'investigation', 9, 'peripheral pulses and arterial Doppler', 'core', null, 'objective', null,
      array['pulses','dorsalis pedis','dp','pt','posterior tibial','doppler','arterial doppler','abi'],
      '{"when": [{"type": "history", "pattern": "diabetic foot|foot|toe|gangrene"}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 10, 'X-ray of the part', 'core', null, 'objective', null,
      array['x-ray foot','xray foot','x ray','osteomyelitis','gas in soft tissue','bone involvement'],
      '{"when": [{"type": "history", "pattern": "diabetic foot|foot|toe|gangrene"}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 11, 'pus or tissue culture sent', 'core', null, 'objective', null,
      array['culture','pus culture','tissue culture','c/s','sensitivity','blood culture'], null),
    (pre_id, 'investigation', 12, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','asa'], null),
    (pre_id, 'investigation', 13, 'consent including further debridement or amputation', 'core', null, 'checks', null,
      array['consent taken','consented','relook','high risk consent','amputation consent'], null),
    (pre_id, 'immediate_action', 14, 'tetanus prophylaxis', 'optional', null, 'plan', null,
      array['tetanus','tt','tetanus toxoid'], null);

  select id into post_id from company_protocols
   where title = 'Abscess Drainage / Debridement — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Abscess Drainage / Debridement — Post-operative Checklist', 'v1-draft',
            'WardMate general surgery pack', 'abscess_debridement', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable, afebrile',
      array['pulse','bp','temperature','spo2','fever','afebrile'], null),
    (post_id, 'investigation', 3, 'wound appearance', 'core', null, 'objective', 'Healthy granulation, no slough',
      array['wound','slough','granulation','discharge','pus','necrotic tissue','wound bed'], null),
    (post_id, 'red_flag', 4, 'spreading infection or fresh necrosis', 'core', 'critical', 'objective', 'No spreading cellulitis',
      array['spreading cellulitis','fresh necrosis','crepitus','foul smell','septic','hypotension'], null),
    (post_id, 'pathway_step', 5, 'dressing plan', 'core', null, 'plan', null,
      array['dressing','daily dressing','betadine dressing','saline dressing','nprt','vac','negative pressure'], null),
    (post_id, 'investigation', 6, 'culture report', 'core', null, 'objective', null,
      array['culture','pus culture','c/s','sensitivity','organism','mrsa','pseudomonas'],
      '{"when": [{"type": "pod_gte", "days": 2}]}'::jsonb),
    (post_id, 'pathway_step', 7, 'antibiotic reviewed against culture', 'core', null, 'plan', null,
      array['antibiotic','de-escalation','culture directed','sensitivity','change antibiotic'],
      '{"when": [{"type": "item_present", "label": "culture report"}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 8, 'blood glucose', 'core', null, 'objective', null,
      array['rbs','grbs','sugar','blood sugar','glucose','sugar charting'], null),
    (post_id, 'red_flag', 9, 'uncontrolled glucose', 'core', 'urgent', 'assessment', 'Glucose controlled',
      array['hyperglycaemia','uncontrolled sugar','dka','ketones'],
      '{"when": [{"type": "lab", "analyte": "glucose", "op": "gt", "value": 250}], "effect": "core"}'::jsonb),
    (post_id, 'investigation', 10, 'counts and renal function', 'optional', null, 'objective', null,
      array['tlc','wbc','crp','creatinine','kft'], null),
    (post_id, 'pathway_step', 11, 'need for relook debridement', 'core', null, 'plan', null,
      array['relook','re-debridement','second look','further debridement','amputation'],
      '{"when": [{"type": "pod_gte", "days": 1}]}'::jsonb),
    (post_id, 'pathway_step', 12, 'offloading and foot care', 'optional', null, 'plan', null,
      array['offloading','foot care','footwear','non weight bearing','limb elevation'],
      '{"when": [{"type": "history", "pattern": "diabetic foot|foot|toe"}], "effect": "core"}'::jsonb),
    (post_id, 'pathway_step', 13, 'wound cover plan', 'optional', null, 'plan', null,
      array['secondary suturing','skin graft','ssg','split skin graft','flap','healing by secondary intention'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb),
    (post_id, 'pathway_step', 14, 'histopathology report', 'optional', null, 'plan', null,
      array['hpe','histopathology','tissue histology','pathology report','marjolin'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb);
end $$;

-- =============================================================================================
-- PICKER ROWS — general surgery pickerPhase is 'after_surgery'.
-- =============================================================================================
insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('breast_surgery',       null::text, 'after_surgery'::care_phase, 'Breast surgery (MRM / BCS / excision)'),
  ('colorectal_resection', null,       'after_surgery',             'Colorectal resection (hemicolectomy / AR / APR)'),
  ('gastrectomy',          null,       'after_surgery',             'Gastrectomy (subtotal / total, D2)'),
  ('thyroidectomy',        null,       'after_surgery',             'Thyroidectomy (hemi / total)'),
  ('abscess_debridement',  null,       'after_surgery',             'Abscess drainage / debridement')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
