-- Run this in the Supabase SQL editor.
create table if not exists public.url_scan_cache (
  url text primary key,
  safe_browsing_result jsonb,
  virustotal_result jsonb,
  scanned_at timestamptz not null default now()
);

alter table public.url_scan_cache enable row level security;

create policy "Allow URL scan cache reads"
  on public.url_scan_cache for select
  to anon
  using (true);

create policy "Allow URL scan cache writes"
  on public.url_scan_cache for insert
  to anon
  with check (true);

create policy "Allow URL scan cache updates"
  on public.url_scan_cache for update
  to anon
  using (true)
  with check (true);
