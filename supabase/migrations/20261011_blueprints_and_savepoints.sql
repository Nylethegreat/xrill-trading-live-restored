-- Blueprint page: one JSON blueprint per member + manual savepoints.
create table if not exists public.blueprints (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.blueprint_savepoints (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists blueprint_savepoints_user_idx on public.blueprint_savepoints (user_id, created_at desc);

alter table public.blueprints enable row level security;
alter table public.blueprint_savepoints enable row level security;

create policy "Members read own blueprint" on public.blueprints for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members insert own blueprint" on public.blueprints for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Members update own blueprint" on public.blueprints for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Members delete own blueprint" on public.blueprints for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Members read own savepoints" on public.blueprint_savepoints for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members insert own savepoints" on public.blueprint_savepoints for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Members delete own savepoints" on public.blueprint_savepoints for delete to authenticated using ((select auth.uid()) = user_id);
