-- Admin console: let the owner read the public waitlist.
--
-- `waitlist` (0059) only ever got an INSERT policy — anyone can join it, nobody could read it
-- back, not even a signed-in admin. `returns setof waitlist` sidesteps needing to know the
-- table's exact column list (it was created by hand, before this repo tracked it) while still
-- going through the same admin_check() gate as every other admin_*() function (patch 0068).

begin;

create or replace function admin_waitlist()
returns setof waitlist
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() then return; end if;
  return query select * from waitlist order by created_at desc;
end;
$$;

grant execute on function admin_waitlist() to authenticated;

commit;
