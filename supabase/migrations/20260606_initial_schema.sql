-- Run this in Supabase dashboard → SQL Editor

create table if not exists user_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  monthly_budget numeric(10,2) not null default 0,
  daily_addition numeric(10,2) not null default 0,
  balance_snapshot numeric(10,2) not null default 0,
  snapshot_date  date not null default current_date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  parent_id    uuid references tasks(id) on delete cascade,
  status       text not null default 'todo' check (status in ('todo','done','archived')),
  is_active    boolean not null default false,
  sort_order   integer not null default 0,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(10,2) not null,
  note       text,
  type       text not null default 'expense' check (type in ('expense','daily_addition')),
  created_at timestamptz not null default now()
);

alter table user_settings  enable row level security;
alter table tasks           enable row level security;
alter table transactions    enable row level security;

create policy "own_settings"     on user_settings  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_tasks"        on tasks           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_transactions" on transactions    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Table-level grants. RLS (above) restricts WHICH rows; these grants allow
-- the roles to touch the tables at all. Without them every query is denied.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on table public.user_settings, public.tasks, public.transactions
  to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
