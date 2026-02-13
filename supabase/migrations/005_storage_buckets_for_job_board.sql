-- ============================================
-- Storage buckets and policies for job board uploads
-- ============================================

-- Buckets used by the dashboard upload flow.
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Replace policies idempotently to avoid duplicate-policy errors.
drop policy if exists "Public read company logos" on storage.objects;
create policy "Public read company logos"
  on storage.objects
  for select
  using (bucket_id = 'company-logos');

drop policy if exists "Authenticated upload company logos" on storage.objects;
create policy "Authenticated upload company logos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'company-logos');

drop policy if exists "Authenticated update company logos" on storage.objects;
create policy "Authenticated update company logos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'company-logos')
  with check (bucket_id = 'company-logos');

drop policy if exists "Authenticated delete company logos" on storage.objects;
create policy "Authenticated delete company logos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'company-logos');
