-- Restores `zip`, dropped in error in 0004. Actively written for client-location
-- sessions. Table was empty, so no data was lost. ALREADY APPLIED.
alter table public.inquiries add column if not exists zip text;
