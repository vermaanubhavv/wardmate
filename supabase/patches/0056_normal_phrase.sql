-- A checklist item's "normal" wording — what this line reads as on a routine round when
-- nothing is abnormal. Two uses:
--
--   1. "Current progress" prints the phrase (e.g. "Afebrile", "Tolerating orally") instead of
--      a bare "fever — NAD" for objective items nobody dictated.
--   2. The one-tap "Routine round" button on the patient page fills every un-recorded core
--      item with its phrase as a confirmed observation — the resident asserts it deliberately,
--      the same way ticking a box asserts it, then reviews the result.
--
-- Nullable on purpose: an item with no sensible "normal" (post-operative day, a diagnosis, a
-- plan step) simply carries none, and Routine round skips it.

begin;

alter table care_template_items   add column if not exists normal_phrase text;
alter table company_protocol_items add column if not exists normal_phrase text;

-- Seed the standard surgical ward-round items. Matched on the canonical label / prompt only;
-- an item phrased unusually just starts blank and can be filled in later.
with defaults(name, phrase) as (
  values
    ('fever',                  'Afebrile'),
    ('pain',                   'No fresh pain'),
    ('vomiting',               'No vomiting'),
    ('nausea',                 'No nausea'),
    ('cough',                  'No cough'),
    ('breathlessness',         'No breathlessness'),
    ('shoulder tip pain',      'None'),
    ('abdominal distension',   'No distension'),
    ('distension',             'No distension'),
    ('bleeding',               'No fresh bleeding'),
    ('oral intake',            'Tolerating orally'),
    ('flatus',                 'Passed'),
    ('first bowel motion',     'Passed'),
    ('bowel habit',            'Normal'),
    ('continence',             'Continent'),
    ('urinary retention',      'Passing urine normally'),
    ('ambulation',             'Mobilising'),
    ('drain',                  'Serous, not excessive'),
    ('wound',                  'Healthy, dry, no discharge'),
    ('dressing',               'Clean and dry'),
    ('port sites',             'Healthy'),
    ('skin condition',         'Intact'),
    ('sensorium',              'Conscious, oriented'),
    ('abdomen',                'Soft, non-tender'),
    ('per abdomen',            'Soft, non-tender'),
    ('local examination',      'No abnormality'),
    ('chest',                  'Clear, bilateral air entry'),
    ('vitals',                 'Stable'),
    ('jaundice',               'No jaundice')
)
update care_template_items t
  set normal_phrase = d.phrase
  from defaults d
  where t.normal_phrase is null
    and lower(btrim(t.label)) = d.name;

with defaults(name, phrase) as (
  values
    ('fever',                  'Afebrile'),
    ('pain',                   'No fresh pain'),
    ('vomiting',               'No vomiting'),
    ('nausea',                 'No nausea'),
    ('cough',                  'No cough'),
    ('breathlessness',         'No breathlessness'),
    ('shoulder tip pain',      'None'),
    ('abdominal distension',   'No distension'),
    ('distension',             'No distension'),
    ('bleeding',               'No fresh bleeding'),
    ('oral intake',            'Tolerating orally'),
    ('flatus',                 'Passed'),
    ('first bowel motion',     'Passed'),
    ('bowel habit',            'Normal'),
    ('continence',             'Continent'),
    ('urinary retention',      'Passing urine normally'),
    ('ambulation',             'Mobilising'),
    ('drain',                  'Serous, not excessive'),
    ('wound',                  'Healthy, dry, no discharge'),
    ('dressing',               'Clean and dry'),
    ('port sites',             'Healthy'),
    ('skin condition',         'Intact'),
    ('sensorium',              'Conscious, oriented'),
    ('abdomen',                'Soft, non-tender'),
    ('per abdomen',            'Soft, non-tender'),
    ('local examination',      'No abnormality'),
    ('chest',                  'Clear, bilateral air entry'),
    ('vitals',                 'Stable'),
    ('jaundice',               'No jaundice')
)
update company_protocol_items t
  set normal_phrase = d.phrase
  from defaults d
  where t.normal_phrase is null
    and lower(btrim(t.prompt)) = d.name;

commit;
