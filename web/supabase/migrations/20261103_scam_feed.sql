alter table if exists public.scam_reports
  add column if not exists normalized_value text,
  add column if not exists abuse_flags integer not null default 0;

create index if not exists scam_reports_normalized_value_idx
  on public.scam_reports (normalized_value);

create index if not exists scam_reports_abuse_flags_idx
  on public.scam_reports (abuse_flags);
