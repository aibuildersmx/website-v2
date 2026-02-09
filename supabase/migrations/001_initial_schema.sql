-- ============================================
-- AI Builders Job Board - Initial Schema
-- ============================================

-- Companies (Recruiters)
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  created_at timestamptz default now()
);

-- Jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  location_type text check (location_type in ('Remote', 'Hybrid', 'On-site')),
  salary text,
  experience text,
  tags text[] default '{}',
  status text default 'New' check (status in ('New', 'Urgent', 'Closing Soon')),
  apply_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade not null,
  name text not null,
  email text not null,
  resume_url text,
  linkedin_url text,
  message text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_jobs_company on public.jobs(company_id);
create index idx_jobs_active on public.jobs(is_active) where is_active = true;
create index idx_jobs_status on public.jobs(status);
create index idx_applications_job on public.applications(job_id);

-- Updated at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_jobs_updated
  before update on public.jobs
  for each row execute function public.handle_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- Public read access for active jobs
create policy "Anyone can view active jobs"
  on public.jobs for select
  using (is_active = true);

-- Public read access for companies (for job listings)
create policy "Anyone can view companies"
  on public.companies for select
  using (true);

-- Public can submit applications
create policy "Anyone can submit applications"
  on public.applications for insert
  with check (true);

-- ============================================
-- Storage Bucket for Logos
-- ============================================

-- Run this in the Supabase dashboard under Storage:
-- Create bucket: company-logos (public)
-- Create bucket: resumes (private)
