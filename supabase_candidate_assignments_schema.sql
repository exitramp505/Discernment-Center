-- Candidate assignments system
-- Run this in Supabase SQL Editor.

create table if not exists public.candidate_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  candidate_email text,
  candidate_name text,
  item_key text not null,
  item_type text not null default 'form',
  status text not null default 'assigned',
  assigned_at timestamptz,
  hidden_at timestamptz,
  first_assigned_email_sent_at timestamptz,
  email_error text,
  candidate_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, item_key)
);

alter table public.candidate_assignments enable row level security;

drop policy if exists "Candidates can read assigned items" on public.candidate_assignments;
create policy "Candidates can read assigned items"
on public.candidate_assignments
for select
to authenticated
using (auth.uid() = user_id and status = 'assigned');

create index if not exists candidate_assignments_user_id_idx on public.candidate_assignments(user_id);
create index if not exists candidate_assignments_status_idx on public.candidate_assignments(status);
create index if not exists candidate_assignments_item_key_idx on public.candidate_assignments(item_key);
