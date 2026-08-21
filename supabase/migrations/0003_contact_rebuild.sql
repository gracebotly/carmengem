-- Contact rebuild: drop incall/outcall constraint, add zip.

alter table public.inquiries
  drop constraint if exists inquiries_location_type_check;

alter table public.inquiries
  add column if not exists zip text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inquiries_location_type_check_v2'
  ) then
    alter table public.inquiries
      add constraint inquiries_location_type_check_v2
      check (location_type in ('studio', 'client'));
  end if;
end $$;
