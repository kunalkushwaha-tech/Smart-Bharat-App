-- Run this in the Supabase SQL editor.
create table if not exists public.scam_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  scam_type text not null,
  contact_info text not null,
  description text
);

alter table public.scam_reports enable row level security;

create policy "Anyone can submit anonymous scam reports"
  on public.scam_reports for insert
  to anon
  with check (true);

-- Keep raw contact_info private to the table. The public view exposes only masked values.
revoke select on public.scam_reports from anon;
revoke update, delete on public.scam_reports from anon;

create or replace view public.scam_reports_public
with (security_invoker = false) as
select
  id,
  created_at,
  scam_type,
  case
    when contact_info ~ '^\+?[0-9\s().-]+$'
      then '••••' || right(regexp_replace(contact_info, '[^0-9]', '', 'g'), 4)
    else split_part(regexp_replace(contact_info, '^https?://', ''), '/', 1) || '/••••'
  end as contact_info,
  description
from public.scam_reports;

grant select on public.scam_reports_public to anon;

-- Do not add custom authentication here. If accounts are introduced later, use Clerk or Supabase Auth.
