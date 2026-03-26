-- Dream Travel Survey - Supabase Setup Script
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/dymgoywxotfsilogovql/sql

-- 1. Create the survey results table
create table if not exists travel_survey_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  dream_destination text not null,
  destination_type text not null,
  traveler_type text not null,
  activities text[] not null,
  other_activity text
);

-- 2. Enable Row-Level Security
alter table travel_survey_results enable row level security;

-- 3. Allow anonymous users to insert (submit survey)
create policy "Allow public insert"
  on travel_survey_results for insert
  to anon
  with check (true);

-- 4. Allow anonymous users to read aggregated results
create policy "Allow public select"
  on travel_survey_results for select
  to anon
  using (true);
