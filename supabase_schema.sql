-- Discernment Center Candidate Portal schema
-- Run this in Supabase SQL Editor before using the portal.

create table if not exists public.candidate_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  state text not null default '',
  region text not null default '',
  married text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  state text not null default '',
  region text not null default '',
  overall numeric,
  overall_label text not null default '',
  routed_leader text not null default '',
  email_sent boolean not null default false,
  email_error text,
  message_id text,
  blob_key text,
  legacy_submission_id text,
  created_at timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;
alter table public.assessment_results enable row level security;

drop policy if exists "Users can read own profile" on public.candidate_profiles;
create policy "Users can read own profile" on public.candidate_profiles
for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.candidate_profiles;
create policy "Users can insert own profile" on public.candidate_profiles
for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.candidate_profiles;
create policy "Users can update own profile" on public.candidate_profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can read own assessment results" on public.assessment_results;
create policy "Users can read own assessment results" on public.assessment_results
for select using (auth.uid() = user_id);

-- Inserts are performed by the Netlify Function using the Supabase service role key.
-- The service role bypasses RLS. Do not expose the service role key in browser code.
