-- Letting a unit's owner see what their own team self-attested.
--
-- clinician_access has no real registry behind it — see 0028's own comment: "no global
-- registry is assumed to exist or to be reliable for every intern." Building one now would
-- mean inventing a confidence this app does not have, which is exactly the thing it refuses to
-- do with a clinical value, and a fabricated verification badge would be worse than none.
--
-- What IS real and available: the person who owns a unit knows their own team, by name, in
-- person. Today they cannot see what a member typed on the professional-access screen at
-- all — clinician_access_self_read (0028) restricts every row to its own user. This adds a
-- second, narrow way in: the owner of a ward may read the attestation of anyone who is a
-- member of THAT ward, and only that ward. It grants no new write, and no visibility into
-- units the reader does not own.
--
-- Safe to run more than once.

begin;

drop policy if exists clinician_access_owner_read on clinician_access;

create policy clinician_access_owner_read on clinician_access for select
  using (
    exists (
      select 1
      from ward_members wm
      join wards w on w.id = wm.ward_id
      where wm.user_id = clinician_access.user_id
        and w.owner_id = auth.uid()
    )
  );

commit;
