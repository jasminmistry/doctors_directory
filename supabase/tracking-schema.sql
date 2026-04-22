create table if not exists public.directory_events (
  id bigint generated always as identity primary key,
  timestamp timestamptz not null default now(),
  page_url text not null,
  page_type text not null,
  referrer text not null,
  country text not null default 'unknown',
  device_type text not null default 'desktop',
  cta_label text not null,
  cta_target_url text
);

create index if not exists directory_events_page_type_idx
  on public.directory_events (page_type);

create index if not exists directory_events_timestamp_idx
  on public.directory_events (timestamp desc);

create table if not exists public.directory_leads (
  id bigint generated always as identity primary key,
  timestamp timestamptz not null default now(),
  page_url text not null,
  page_type text not null,
  referrer text not null,
  country text not null default 'unknown',
  device_type text not null default 'desktop',
  name text not null,
  contact text not null,
  treatment text,
  location text,
  budget text
);

create index if not exists directory_leads_page_type_idx
  on public.directory_leads (page_type);

create index if not exists directory_leads_timestamp_idx
  on public.directory_leads (timestamp desc);
