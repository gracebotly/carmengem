alter table public.inquiries
  add column if not exists age int,
  add column if not exists phone text,
  add column if not exists location_type text,
  add column if not exists city text,
  add column if not exists preferred_time text;

-- Email is no longer always present (text-first visitors may leave only a phone).
alter table public.inquiries alter column email drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inquiries_location_type_check'
  ) then
    alter table public.inquiries
      add constraint inquiries_location_type_check
      check (location_type in ('incall', 'outcall'));
  end if;
end $$;
