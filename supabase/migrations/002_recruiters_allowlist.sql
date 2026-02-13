-- ============================================
-- Recruiters allowlist for dashboard access
-- ============================================

create table if not exists public.recruiters (
  email text primary key,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recruiters enable row level security;

-- Keep recruiter emails lowercase to avoid case-sensitive mismatches.
insert into public.recruiters (email, is_active)
select lower(email), true
from auth.users
where email is not null
on conflict (email) do update
set is_active = excluded.is_active;
