-- A publisher-authored hint for when a protocol applies, separate from its title. The matching
-- prompt in lib/extract.ts prefers this over guessing from title wording alone — for something
-- as clear-cut as "systolic BP under 90", the person who filed the protocol should get to say
-- exactly what triggers it, rather than leaving that call to how well the title alone reads.

begin;

alter table company_protocols add column if not exists match_hint text;

update company_protocols
set match_hint = 'Systolic blood pressure under 90, or pulse/heart rate over 100/min, or documented hypotension, shock, or tachycardia attributable to hypovolaemia.'
where title = 'IV Fluids — Resuscitation' and version = 'v1';

update company_protocols
set match_hint = 'Multiple episodes of vomiting or diarrhoea, or other abnormal fluid losses — NG aspirate, stoma output, drain output, fistula output — that go beyond routine maintenance.'
where title = 'IV Fluids — Replacement' and version = 'v1';

commit;
