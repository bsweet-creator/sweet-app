-- FIX: tables had RLS enabled but the anon/authenticated roles were never
-- granted table privileges, so every query failed with
-- "permission denied for table" (42501). RLS still restricts rows per user.
-- Run this in Supabase dashboard → SQL Editor.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on table public.user_settings, public.tasks, public.transactions
  to anon, authenticated;

-- Ensure tables created by FUTURE migrations are granted automatically,
-- so this doesn't happen again.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
