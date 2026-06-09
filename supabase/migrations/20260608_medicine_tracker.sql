-- Medicine tracker: medication definitions + daily adherence logs.
-- Run this in Supabase dashboard → SQL Editor.

create table if not exists medications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  dose        text,
  notes       text,
  morning     boolean not null default false,
  lunch       boolean not null default false,
  evening     boolean not null default false,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row exists iff that medication's dose was taken on that day at that slot.
create table if not exists medication_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references medications(id) on delete cascade,
  log_date      date not null default current_date,
  slot          text not null check (slot in ('morning','lunch','evening')),
  created_at    timestamptz not null default now(),
  unique (medication_id, log_date, slot)
);

create index if not exists medication_logs_lookup
  on medication_logs (user_id, log_date);

alter table medications     enable row level security;
alter table medication_logs enable row level security;

create policy "own_medications"     on medications     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_medication_logs" on medication_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Table grants (RLS still restricts rows to the owner).
grant select, insert, update, delete
  on table public.medications, public.medication_logs
  to anon, authenticated;
