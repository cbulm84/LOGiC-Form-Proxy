-- LOGiC Form Proxy - Supabase Schema
-- Run this in Supabase SQL Editor after creating the project

-- ============================================================
-- TABLE: affiliate_pages
-- Stores client → affiliate → GHL form URL mappings
-- ============================================================

create table if not exists public.affiliate_pages (
  client_slug text not null,
  affiliate_slug text not null,
  ghl_form_url text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (client_slug, affiliate_slug)
);

-- Add helpful comment
comment on table public.affiliate_pages is 'Maps client subdomains to affiliate GHL form URLs';
comment on column public.affiliate_pages.client_slug is 'Client identifier (e.g., "healthclient")';
comment on column public.affiliate_pages.affiliate_slug is 'Affiliate identifier (e.g., "acme")';
comment on column public.affiliate_pages.ghl_form_url is 'Full GHL form URL to embed in iframe';
comment on column public.affiliate_pages.active is 'Set to false to disable affiliate without deleting';

-- ============================================================
-- TRIGGER: Prevent slug changes after creation
-- ============================================================

create or replace function prevent_slug_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Prevent changing slugs after creation
  if tg_op = 'UPDATE' and (
    new.client_slug is distinct from old.client_slug
    or new.affiliate_slug is distinct from old.affiliate_slug
  ) then
    raise exception 'Slugs cannot be changed after creation. Create a new record instead.';
  end if;

  -- Prevent deletion (use active=false instead)
  if tg_op = 'DELETE' then
    raise exception 'Records cannot be deleted. Set active=false to disable.';
  end if;

  -- Update timestamp on modifications
  if tg_op = 'UPDATE' then
    new.updated_at = now();
  end if;

  return new;
end;
$$;

create trigger prevent_affiliate_mutation
  before update or delete on public.affiliate_pages
  for each row
  execute function prevent_slug_change();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.affiliate_pages enable row level security;

-- Public read access for active affiliates only
create policy "public_read_active_affiliates"
  on public.affiliate_pages
  for select
  using (active = true);

-- No public insert/update/delete (only via service_role)
-- If you need authenticated admin access, add policies here

-- ============================================================
-- INDEXES (for performance)
-- ============================================================

create index if not exists idx_affiliate_pages_client
  on public.affiliate_pages(client_slug);

create index if not exists idx_affiliate_pages_active
  on public.affiliate_pages(active)
  where active = true;

-- ============================================================
-- TEST DATA (optional - remove in production)
-- ============================================================

-- Uncomment to insert test data:
-- insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url, active)
-- values
--   ('testclient', 'demo', 'https://form.gohighlevel.com/v2/Forms/?id=DEMO123', true),
--   ('testclient', 'sample', 'https://form.gohighlevel.com/v2/Forms/?id=SAMPLE456', true);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- View all active affiliates
-- select * from public.affiliate_pages where active = true order by client_slug, affiliate_slug;

-- Count affiliates per client
-- select client_slug, count(*) as affiliate_count
-- from public.affiliate_pages
-- where active = true
-- group by client_slug;

-- ============================================================
-- COMPLETE ✓
-- ============================================================
