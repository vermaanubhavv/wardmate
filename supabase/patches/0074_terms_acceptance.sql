-- Records that a doctor actually agreed to something before their patient data was processed.
-- Nothing did, before this — see the Clinician Data Agreement draft. Stamped alongside the
-- existing professional attestation in complete_clinician_onboarding() rather than as a
-- separate step, since a doctor is already on that screen once.
--
-- terms_version is a free-text tag ("draft-1", "2026-10-01") the app supplies, not validated
-- here — this table just needs to answer "did they see a version, and which one" later.
--
-- Safe to run more than once.

begin;

alter table profiles add column if not exists terms_accepted_at timestamptz;
alter table profiles add column if not exists terms_version text;

create or replace function complete_clinician_onboarding(
  clinician_name text,
  clinician_registration_number text,
  clinician_hospital_name text,
  clinician_department text,
  clinician_designation text,
  clinician_terms_version text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := btrim(clinician_name);
  clean_registration text := upper(regexp_replace(btrim(clinician_registration_number), '[^A-Za-z0-9/-]', '', 'g'));
  clean_hospital text := btrim(clinician_hospital_name);
  clean_department text := btrim(clinician_department);
  allowed_designations text[] := array['Intern', 'JR-1', 'JR-2', 'JR-3', 'SR', 'AP', 'Medical Officer', 'Consultant'];
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;
  if clean_name is null or char_length(clean_name) < 2 then raise exception 'Enter your full name.'; end if;
  if clean_hospital is null or char_length(clean_hospital) < 2 then raise exception 'Enter your hospital name.'; end if;
  if clean_department is null or char_length(clean_department) < 2 then raise exception 'Enter your department.'; end if;
  if clean_registration is null or char_length(clean_registration) < 4 or char_length(clean_registration) > 40 then
    raise exception 'Enter a valid registration or intern ID.';
  end if;
  if clinician_designation <> all(allowed_designations) then raise exception 'Choose a clinical designation.'; end if;
  if clinician_terms_version is null or btrim(clinician_terms_version) = '' then
    raise exception 'Accept the data agreement to continue.';
  end if;

  insert into clinician_access (user_id, full_name, registration_number, hospital_name, department, designation)
  values (auth.uid(), left(clean_name, 120), clean_registration, left(clean_hospital, 160), left(clean_department, 120), clinician_designation)
  on conflict (user_id) do update set
    full_name = excluded.full_name, registration_number = excluded.registration_number,
    hospital_name = excluded.hospital_name, department = excluded.department,
    designation = excluded.designation, attested_at = now();

  update profiles set
    display_name = left(clean_name, 120),
    department = left(clean_department, 120),
    designation = clinician_designation,
    terms_accepted_at = now(),
    terms_version = btrim(clinician_terms_version)
  where id = auth.uid();
end;
$$;

commit;
