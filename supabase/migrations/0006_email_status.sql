-- Records the server-side MX lookup result so questionable addresses are visible
-- to the owner. Never blocks a submission — warn-only by design. ALREADY APPLIED.
alter table public.inquiries
  add column if not exists email_status text not null default 'unchecked';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inquiries_email_status_check') then
    alter table public.inquiries add constraint inquiries_email_status_check
      check (email_status in ('unchecked', 'ok', 'no_mx'));
  end if;
end $$;
