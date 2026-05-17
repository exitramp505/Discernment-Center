-- Discernment Center Application module
-- Run this once in Supabase SQL Editor before testing application uploads.

create table if not exists public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  candidate_name text not null default '',
  email text not null default '',
  phone text not null default '',
  state text not null default '',
  region text not null default '',
  status text not null default 'draft',
  completion numeric not null default 0,
  application jsonb not null default '{}'::jsonb,
  photo_path text,
  photo_name text,
  resume_path text,
  resume_name text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_applications enable row level security;

drop policy if exists "Users can read own application" on public.candidate_applications;
create policy "Users can read own application"
on public.candidate_applications for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own application" on public.candidate_applications;
create policy "Users can insert own application"
on public.candidate_applications for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own application" on public.candidate_applications;
create policy "Users can update own application"
on public.candidate_applications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('candidate-uploads', 'candidate-uploads', false)
on conflict (id) do nothing;
