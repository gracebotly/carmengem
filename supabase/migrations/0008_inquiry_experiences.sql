-- Apply before deploying the conditional contact form/API.
-- Nullable fields preserve existing inquiries and partial-lead capture.
alter table public.inquiries
  add column if not exists experience text check (experience in ('virtual', 'in-person')),
  add column if not exists virtual_format text,
  add column if not exists screening_method text,
  add column if not exists screening_value text,
  add column if not exists preferred_date date;
