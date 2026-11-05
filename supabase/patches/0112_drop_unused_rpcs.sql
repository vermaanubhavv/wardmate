-- Three RPCs nothing calls any more.
--
-- home_screen()          — the greeting screen it fed is gone; / now redirects to /ward.
-- admin_ward_summary()   — superseded by the admin console reads in lib/admin.ts.
-- admin_activity_log(int) — replaced by admin_activity_feed (0101 left it in place).
--
-- No `.rpc(...)` call in app/, lib/ or scripts/ names any of them, and no other function,
-- view or policy uses them. Tables are deliberately not dropped here: stt_comparisons and the
-- pathway_* tables may still hold rows, so they wait for a row count first.
--
-- Safe to run more than once.

begin;

drop function if exists public.home_screen();
drop function if exists public.admin_ward_summary();
drop function if exists public.admin_activity_log(int);

commit;
