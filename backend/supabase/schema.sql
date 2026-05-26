create extension if not exists "pgcrypto";

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  city text not null,
  city_code text,
  country text not null,
  country_code text,
  latitude double precision,
  longitude double precision,
  area text not null,
  area_code text,
  contract text not null,
  contract_code text,
  salary text,
  description text not null,
  requirements text,
  benefits text,
  languages text,
  language_items jsonb not null default '[]'::jsonb,
  experience text,
  experience_code text,
  contact_method text not null default 'email',
  contact text not null,
  is_urgent boolean not null default false,
  has_accommodation boolean not null default false,
  recruiter_plan text not null default 'free',
  status text not null default 'published',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs add column if not exists latitude double precision;
alter table public.jobs add column if not exists longitude double precision;
alter table public.jobs add column if not exists recruiter_plan text not null default 'free';

create index if not exists jobs_status_published_at_idx
  on public.jobs (status, published_at desc);

create index if not exists jobs_recruiter_id_idx
  on public.jobs (recruiter_id);

create table if not exists public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'contact_click')),
  visitor_id text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.job_events add column if not exists visitor_id text;

create index if not exists job_events_job_id_occurred_at_idx
  on public.job_events (job_id, occurred_at desc);

create index if not exists job_events_event_type_idx
  on public.job_events (event_type);

create unique index if not exists job_events_unique_visitor_event_idx
  on public.job_events (job_id, event_type, visitor_id)
  where visitor_id is not null;

create table if not exists public.user_job_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  list_type text not null check (list_type in ('favorite', 'apply_later')),
  created_at timestamptz not null default now(),
  unique (user_id, job_id, list_type)
);

create index if not exists user_job_lists_job_id_idx
  on public.user_job_lists (job_id);

create index if not exists user_job_lists_user_id_idx
  on public.user_job_lists (user_id, list_type, created_at desc);

alter table public.jobs enable row level security;

alter table public.jobs alter column salary drop not null;
alter table public.job_events enable row level security;
alter table public.user_job_lists enable row level security;

drop policy if exists "Public can read published jobs" on public.jobs;
create policy "Public can read published jobs"
  on public.jobs
  for select
  using (status = 'published');

drop policy if exists "Recruiters can insert own jobs" on public.jobs;
create policy "Recruiters can insert own jobs"
  on public.jobs
  for insert
  with check (auth.uid() = recruiter_id);

drop policy if exists "Recruiters can update own jobs" on public.jobs;
create policy "Recruiters can update own jobs"
  on public.jobs
  for update
  using (auth.uid() = recruiter_id)
  with check (auth.uid() = recruiter_id);

drop policy if exists "Public can insert job events" on public.job_events;
create policy "Public can insert job events"
  on public.job_events
  for insert
  with check (true);

drop policy if exists "Recruiters can read own job events" on public.job_events;
create policy "Recruiters can read own job events"
  on public.job_events
  for select
  using (
    exists (
      select 1
      from public.jobs
      where jobs.id = job_events.job_id
        and jobs.recruiter_id = auth.uid()
    )
  );

drop policy if exists "Candidates can manage own saved jobs" on public.user_job_lists;
create policy "Candidates can manage own saved jobs"
  on public.user_job_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
