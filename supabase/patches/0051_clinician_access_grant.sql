-- Let a signed-in doctor read their own professional-access row.
--
-- 0028 created clinician_access, enabled row-level security, and wrote the SELECT policies
-- (clinician_access_self_read; 0031 added clinician_access_owner_read) — but never granted the
-- table to the `authenticated` role. RLS is only consulted after the table-level privilege
-- check, so every direct read returned "permission denied for table clinician_access".
--
-- complete_clinician_onboarding() still worked because it is SECURITY DEFINER and runs as the
-- table owner, so the attestation was being saved on every attempt — but the onboarding page
-- reads the table directly to decide whether to show the unit-code step, that read failed
-- silently (the page only destructures `data`), hasProfessionalAccess stayed false, and the
-- doctor was returned to the same form forever.
--
-- SELECT only: the app never writes this table from application code — the write goes through
-- the SECURITY DEFINER function above.
--
-- Safe to run more than once.

grant select on clinician_access to authenticated;
