-- Dropped `zip` believing it unused. This was a mistake, reverted in 0005.
-- Kept so the repo matches Supabase migration history. ALREADY APPLIED.
alter table public.inquiries drop column if exists zip;
