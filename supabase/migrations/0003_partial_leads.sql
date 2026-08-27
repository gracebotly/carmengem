-- Splits the single name field and adds partial-lead support. ALREADY APPLIED.
alter table public.inquiries
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists status text not null default 'complete',
  add column if not exists updated_at timestamptz not null default now();

alter table public.inquiries alter column name drop not null;
alter table public.inquiries alter column message drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inquiries_status_check') then
    alter table public.inquiries add constraint inquiries_status_check
      check (status in ('partial', 'complete'));
  end if;
end $$;

create index if not exists inquiries_status_created_idx
  on public.inquiries (status, created_at desc);
