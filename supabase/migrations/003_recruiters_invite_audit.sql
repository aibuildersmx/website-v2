-- ============================================
-- Recruiters invite audit metadata
-- ============================================

alter table public.recruiters
add column if not exists last_invited_at timestamptz;
