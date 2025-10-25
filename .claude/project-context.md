# LOGiC Form Proxy - Project Context

## Project Overview

**Purpose:** Simple wildcard subdomain system for white-labeled iframe embeds of Go High Level (GHL) forms with URL parameter passthrough.

**Architecture:** Static HTML + Supabase + Vercel wildcard domains

**Use Case:** Healthcare client (and future clients) can give each affiliate a unique subdomain that embeds their specific GHL form with automatic tracking parameter passthrough.

---

## Core Concept

```
User visits: acme.healthclient.yourdomain.com?affiliate=XYZ&utm_source=google

System:
1. Extracts: client='healthclient', affiliate='acme'
2. Queries Supabase: SELECT ghl_form_url WHERE client='healthclient' AND affiliate='acme'
3. Renders: Full-page iframe with form URL + appended params
4. Result: GHL form loads with ?affiliate=XYZ&utm_source=google
```

---

## Tech Stack

- **Frontend:** Static HTML + Vanilla JavaScript (no framework)
- **Hosting:** Vercel (wildcard subdomain support)
- **Database:** Supabase (single table: `affiliate_pages`)
- **DNS:** Wildcard CNAME routing
- **Forms:** Go High Level (client's HIPAA-covered platform)

---

## Supabase Project

**Name:** `utility-db`
**Project ID:** `lrsioerkvxmvhkatphbc`
**URL:** `https://lrsioerkvxmvhkatphbc.supabase.co`
**Region:** `us-east-2`

### Database Schema

**Table:** `public.affiliate_pages`

```sql
create table public.affiliate_pages (
  client_slug text not null,       -- 'healthclient', 'client2', etc.
  affiliate_slug text not null,    -- 'acme', 'spark', 'partner1', etc.
  ghl_form_url text not null,      -- Full GHL form URL
  active boolean default true,     -- Set false to disable without deleting
  created_at timestamptz,
  updated_at timestamptz,
  primary key (client_slug, affiliate_slug)
);
```

**Key Constraints:**
- Slugs are **immutable** after creation (enforced by trigger)
- Rows **cannot be deleted** (enforced by trigger - set `active=false` instead)
- RLS policy: Public read access for `active=true` rows only

---

## Security Model

### What's Safe to Expose
✅ Supabase anon key (in client JavaScript)
✅ Client slugs (e.g., "healthclient")
✅ Affiliate slugs (e.g., "acme")
✅ GHL form URLs (public anyway)

### What's Protected
❌ Service role key (never in client code)
❌ PHI/PII (all patient data stays inside GHL iframe)
❌ Inactive affiliates (hidden via RLS)
❌ Slug modification (blocked by trigger)
❌ Row deletion (blocked by trigger)

### HIPAA Compliance
- All data entry happens **inside GHL iframe** (BAA in place)
- Parent page never touches PHI
- Only affiliate identifiers and UTM codes stored in Supabase
- Chain of custody maintained within GHL's HIPAA-covered environment

---

## File Structure

```
LOGiC-Form-Proxy/
├── .claude/
│   └── project-context.md     # This file
├── supabase/
│   └── schema.sql             # Database schema + RLS
├── DEPLOYMENT-PLAN.md         # Step-by-step deployment guide
├── INIT-CHECKLIST.md          # Phase-by-phase checklist
├── HANDOFF.md                 # Session handoff instructions
├── README.md                  # Quick reference
├── index.html                 # Static iframe loader (main app)
└── .gitignore                 # Git ignore rules
```

---

## URL Parameter Passthrough

**Whitelisted Parameters:**
- `affiliate` - Affiliate ID
- `master` - Master affiliate/referrer
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` - Marketing tracking
- `gclid`, `fbclid` - Ad platform tracking
- `ref`, `source` - General referral tracking

**How It Works:**
1. User visits: `acme.client.domain.com?affiliate=ABC&utm_source=google`
2. System fetches: `https://form.gohighlevel.com/v2/Forms/?id=123`
3. Final iframe src: `https://form.gohighlevel.com/v2/Forms/?id=123&affiliate=ABC&utm_source=google`

---

## Deployment Flow

### Development
1. Edit files locally
2. Test with hardcoded Supabase URL/key
3. Commit to GitHub

### Production
1. Vercel auto-deploys from GitHub main branch
2. No build step (static HTML)
3. Wildcard DNS routes all subdomains to same deployment
4. Edge-cached for performance

### Adding New Affiliates
```sql
-- No redeployment needed - just SQL insert
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url)
values ('healthclient', 'newaffiliate', 'https://form.gohighlevel.com/...');
```

Live in ~5 minutes (DNS propagation).

---

## Current Status

**Completed:**
- ✅ Supabase project created and linked
- ✅ Schema designed (ready to deploy)
- ✅ Static HTML app built
- ✅ Documentation complete
- ✅ Git initialized

**Next Steps:**
1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Get anon key and update `index.html`
3. Push to GitHub
4. Deploy to Vercel
5. Configure DNS (wildcard CNAME)
6. Insert test affiliates
7. Go live

---

## Common Operations

### Add New Client
```sql
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url)
values ('newclient', 'affiliate1', 'https://form.gohighlevel.com/...');
```

### Update Form URL
```sql
update public.affiliate_pages
set ghl_form_url = 'https://new-url.com'
where client_slug = 'healthclient' and affiliate_slug = 'acme';
```

### Disable Affiliate
```sql
update public.affiliate_pages
set active = false
where client_slug = 'healthclient' and affiliate_slug = 'old';
```

### View All Active
```sql
select client_slug, affiliate_slug, ghl_form_url
from public.affiliate_pages
where active = true
order by client_slug, affiliate_slug;
```

---

## Performance Expectations

- **Static HTML load:** ~50-100ms
- **Supabase query:** ~20-50ms (edge cached 24hrs)
- **GHL iframe render:** 300-800ms (depends on GHL)
- **Total TTFB:** < 1 second consistently

---

## Troubleshooting Guide

### "Page Not Found" Error
**Causes:**
- Affiliate doesn't exist in DB
- Affiliate is `active=false`
- DNS not propagated yet
- Supabase credentials wrong in `index.html`

**Fix:**
- Check DB: `select * from affiliate_pages where client_slug='...' and affiliate_slug='...'`
- Wait 5-10 min for DNS
- Verify anon key in browser console

### Iframe Won't Load
**Causes:**
- GHL form URL incorrect
- GHL blocks embedding (`X-Frame-Options`)
- CSP blocks iframe

**Fix:**
- Test GHL URL directly in browser
- Check console for `X-Frame-Options` errors
- Verify CSP in `index.html` allows GHL domains

### Parameters Not Passing Through
**Causes:**
- Parameter not in whitelist
- GHL form doesn't read URL params
- Browser strips params (rare)

**Fix:**
- Add param to whitelist in `index.html`
- Test: open iframe src directly and check URL
- Configure GHL form to read URL parameters

---

## Design Decisions

### Why Static HTML Instead of Framework?
- **Faster:** No framework overhead (~5KB vs 100KB+)
- **Simpler:** No build step, no dependencies
- **Cheaper:** Vercel free tier handles unlimited static pages
- **Sufficient:** Only need subdomain routing + iframe render

### Why Supabase Instead of Other DB?
- **Edge Network:** Sub-50ms queries globally
- **RLS Built-in:** Row-level security without custom auth
- **Free Tier:** 500MB DB, 2GB bandwidth/month
- **MCP Support:** Can manage via Claude Code MCP

### Why Wildcard DNS Instead of Per-Affiliate?
- **Scalability:** Add infinite affiliates without DNS changes
- **Speed:** One DNS entry vs hundreds
- **Simplicity:** Client doesn't need DNS access

### Why Immutable Slugs?
- **URL Stability:** Affiliates can't break their own links
- **Tracking Integrity:** Historical analytics stay valid
- **Simplicity:** No redirect logic needed

---

## Future Enhancements (Backlog)

- [ ] Admin dashboard (React/Lovable) for non-technical users
- [ ] Custom thank-you pages (redirect after form submit)
- [ ] Analytics tracking (pageviews, conversions)
- [ ] A/B testing (multiple forms per affiliate)
- [ ] Rate limiting (prevent abuse)
- [ ] Webhook integration (notify on form submit)
- [ ] Multi-domain support (client white-labels fully)

---

## Useful Commands

```bash
# Supabase
supabase projects list                           # Show all projects
supabase projects api-keys --project-ref <id>    # Get API keys
supabase db push                                 # Run migrations
supabase db reset                                # Reset local DB

# Git
git status                                       # Check changes
git add .                                        # Stage all
git commit -m "message"                          # Commit
git push                                         # Push to GitHub

# Vercel
vercel                                           # Deploy current dir
vercel --prod                                    # Deploy to production
vercel domains ls                                # List domains
```

---

## Contact & Ownership

**Project Owner:** Chris Bulmer
**Primary Use Case:** Healthcare client affiliate tracking
**Supabase Org:** `uwvixzxcnroeulbusgyi`
**GitHub Repo:** (to be created)
**Vercel Project:** (to be created)

---

**Last Updated:** 2025-10-24
**Status:** Phase 1 complete, ready for database provisioning
