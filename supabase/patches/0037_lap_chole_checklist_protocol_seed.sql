-- Pilot for "the checklist should come from protocols, not a separate template system" — files
-- the existing Lap Chole checklist (supabase/patches/0005_template_seed.sql) as two protocol
-- cards instead, word for word, so nothing about what a resident sees changes yet. Filed as
-- 'draft': publishing is still a deliberate act by a human who has read it back, same as every
-- other protocol.
--
-- lib/templates.ts now checks for a published protocol matching a patient's
-- template_family/variant/phase before falling back to care_templates, so publishing either of
-- these switches "Where things stand" for lap chole patients over to reading from here. Every
-- other procedure (appendicectomy, hernia, perianal) still reads from care_templates
-- unchanged, until each gets its own protocol filed the same way.

begin;

do $$
declare
  publisher_id uuid := (select id from auth.users where lower(email) = 'anubhavsinhmar@gmail.com');
  new_id uuid;
begin
  if not exists (
    select 1 from company_protocols
    where title = 'Lap Chole — Before Surgery Checklist' and version = 'v1'
  ) then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Lap Chole — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'lap_chole', null, 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'imaging', 'core', array['usg','ultrasound','ultrasound findings','scan']),
      (new_id, 'investigation', 2, 'liver function', 'core', array['lft','bilirubin','alkaline phosphatase','sgpt','sgot']),
      (new_id, 'investigation', 3, 'jaundice', 'core', array['icterus','yellowing']),
      (new_id, 'investigation', 4, 'comorbidities', 'core', array['diabetes','hypertension','cardiac','comorbid']),
      (new_id, 'investigation', 5, 'blood thinners', 'core', array['anticoagulants','aspirin','clopidogrel','warfarin']),
      (new_id, 'investigation', 6, 'fitness', 'core', array['anaesthetic clearance','pac','pre anaesthetic checkup','fit for surgery']),
      (new_id, 'investigation', 7, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 8, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 9, 'previous episodes', 'optional', array['past attacks','previous attacks','biliary colic']),
      (new_id, 'pathway_step', 10, 'plan', 'optional', array['posting','list date','planned for']);
  end if;

  if not exists (
    select 1 from company_protocols
    where title = 'Lap Chole — After Surgery Checklist' and version = 'v1'
  ) then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Lap Chole — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'lap_chole', null, 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'fever', 'core', array['temperature','afebrile','febrile','temp']),
      (new_id, 'investigation', 3, 'pain', 'core', array['pain score','abdominal pain']),
      (new_id, 'investigation', 4, 'abdomen', 'core', array['abdominal examination','soft','distended','tenderness']),
      (new_id, 'investigation', 5, 'port sites', 'core', array['wound','port site','incision','dressing']),
      (new_id, 'investigation', 6, 'drain', 'core', array['drain output','drain fluid','tube drain']),
      (new_id, 'investigation', 7, 'oral intake', 'core', array['orals','tolerating orals','diet','feeds']),
      (new_id, 'investigation', 8, 'flatus', 'core', array['bowel sounds','passed flatus','motion','bowels']),
      (new_id, 'pathway_step', 9, 'plan', 'core', array['discharge','drain removal','suture removal']),
      (new_id, 'investigation', 10, 'shoulder tip pain', 'optional', array['shoulder pain']),
      (new_id, 'investigation', 11, 'bile in drain', 'optional', array['bilious drain','bile leak','biliary leak']),
      (new_id, 'investigation', 12, 'vitals', 'optional', array['pulse','bp','blood pressure','saturation','spo2']);
  end if;
end $$;

commit;
