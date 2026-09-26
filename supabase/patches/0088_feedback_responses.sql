begin;

create table if not exists feedback_responses (
  id uuid primary key default gen_random_uuid(),
  discovered text not null, usage text not null, experience text not null,
  improvement text not null, would_return text not null, talk text not null,
  open_feedback text, contact text, created_at timestamptz not null default now()
);
alter table feedback_responses enable row level security;
drop policy if exists "Anyone can submit feedback" on feedback_responses;
create policy "Anyone can submit feedback" on feedback_responses for insert to anon, authenticated with check (true);
grant insert on feedback_responses to anon, authenticated;

create or replace function admin_feedback_responses()
returns setof feedback_responses language plpgsql security definer set search_path = public as $$
begin if not admin_check() then return; end if; return query select * from feedback_responses order by created_at desc; end;
$$;
grant execute on function admin_feedback_responses() to authenticated;
notify pgrst, 'reload schema';
commit;
