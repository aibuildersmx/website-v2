alter table public.jobs
  add column if not exists team text;

alter table public.jobs
  drop constraint if exists jobs_status_check;

update public.jobs
set status = 'Last Call'
where status = 'Closing Soon';

alter table public.jobs
  add constraint jobs_status_check check (status in ('New', 'Urgent', 'Last Call'));
