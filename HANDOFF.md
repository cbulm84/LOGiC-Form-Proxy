# Session Handoff - LOGiC Form Proxy

## Project Status: Ready for Database Setup

### What We've Built So Far

**Project Type:** Wildcard subdomain iframe proxy for white-labeled GHL forms
**Supabase Project:** `utility-db` (linked via CLI)
**Project Reference ID:** `lrsioerkvxmvhkatphbc`
**Project URL:** `https://lrsioerkvxmvhkatphbc.supabase.co`

### Files Created ✓

```
LOGiC-Form-Proxy/
├── DEPLOYMENT-PLAN.md     # Step-by-step deployment guide
├── README.md              # Quick reference and troubleshooting
├── index.html             # Static iframe loader (needs credentials updated)
├── .gitignore             # Git ignore rules
└── supabase/
    └── schema.sql         # Database schema with RLS policies
```

### Current State

- ✅ Supabase CLI installed (v2.40.7)
- ✅ Supabase project created: `utility-db`
- ✅ Project linked via CLI: `lrsioerkvxmvhkatphbc`
- ✅ All base files created
- ⏳ **NEXT**: Run schema migration and get credentials
- ⏳ **NEXT**: Update `index.html` with Supabase credentials
- ⏳ **NEXT**: Push to GitHub and deploy to Vercel

---

## What This Does

**Simple Explanation:**
Each client gets their own set of subdomains. When someone visits `acme.healthclient.yourdomain.com`, the system:
1. Looks up "healthclient" + "acme" in Supabase
2. Gets the GHL form URL
3. Renders it in a full-page iframe
4. Passes through URL parameters (affiliate IDs, UTM codes, etc.)

**Use Case:**
- Healthcare client has 50 affiliates
- Each gets a unique subdomain: `affiliate1.healthclient.domain.com`
- All embed different GHL forms for tracking
- Client manages everything via SQL inserts (no redeployments)

---

## Next Session Tasks

### 1. Run Database Schema Migration

**Option A: Via Supabase Dashboard (Recommended)**
```sql
-- Copy entire contents of supabase/schema.sql
-- Paste into Supabase SQL Editor
-- Run it
```

**Option B: Via MCP (if connected)**
```
Use the Supabase MCP tools to:
1. Apply the migration from supabase/schema.sql
2. Verify table creation
3. Test RLS policies
```

**Option C: Via CLI Migration**
```bash
# Create migration file
supabase migration new initial_schema

# Copy schema.sql content into the new migration file
# Then run:
supabase db push
```

### 2. Get Project Credentials

**Via CLI:**
```bash
# Get project settings
supabase projects api-keys --project-ref lrsioerkvxmvhkatphbc
```

**Via Dashboard:**
- Go to Settings → API
- Copy:
  - Project URL: `https://lrsioerkvxmvhkatphbc.supabase.co`
  - `anon` `public` key (starts with `eyJ...`)

### 3. Update index.html

Replace these lines in `index.html`:
```javascript
const SUPABASE_URL = 'REPLACE_WITH_YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'REPLACE_WITH_YOUR_ANON_KEY';
```

With:
```javascript
const SUPABASE_URL = 'https://lrsioerkvxmvhkatphbc.supabase.co';
const SUPABASE_ANON_KEY = '<paste-anon-key-here>';
```

### 4. Initialize Git and Push to GitHub

```bash
cd /c/Users/cbulm/LOGiC-Form-Proxy

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: LOGiC Form Proxy infrastructure"

# Create GitHub repo (via gh CLI or manually)
gh repo create LOGiC-Form-Proxy --public --source=. --remote=origin

# Push
git push -u origin main
```

### 5. Deploy to Vercel

**Via Vercel Dashboard:**
1. Go to vercel.com/new
2. Import `LOGiC-Form-Proxy` repo
3. Configure:
   - Framework: **Other**
   - Build Command: *(leave blank)*
   - Output Directory: `.`
   - Install Command: *(leave blank)*
4. Deploy

**Add Environment Variables (optional - for future use):**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://lrsioerkvxmvhkatphbc.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-anon-key>`

*(Not required since we're hardcoding in index.html, but good for future)*

### 6. Test with Sample Data

**Insert test affiliate:**
```sql
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url, active)
values ('testclient', 'demo', 'https://form.gohighlevel.com/v2/Forms/?id=YOUR_GHL_FORM_ID', true);
```

**Test URL (once domain configured):**
```
https://demo.testclient.yourdomain.com?affiliate=TEST&utm_source=demo
```

### 7. Configure DNS (When Ready)

**In GoDaddy (or client's DNS):**
```
Type:  CNAME
Name:  *
Value: cname.vercel-dns.com
TTL:   Default
```

**In Vercel:**
- Settings → Domains
- Add: `*.yourdomain.com`
- Wait for verification

---

## Important Notes

### Security
- ✅ **Anon key in client code is SAFE** - RLS policies protect data
- ✅ **No PHI stored** - Only client slugs, affiliate slugs, and GHL URLs
- ✅ **Slugs are immutable** - Cannot be changed after creation (enforced by trigger)
- ✅ **No deletion** - Rows cannot be deleted (set `active=false` instead)

### What's Non-Critical
This system stores:
- Client identifiers (e.g., "healthclient")
- Affiliate identifiers (e.g., "acme")
- Public GHL form URLs

**No sensitive data.** All patient data stays inside the GHL iframe (HIPAA-covered).

### Performance
- Static HTML: ~50-100ms load
- Supabase query: ~20-50ms (edge cached)
- GHL iframe: 300-800ms (depends on GHL)
- **Total TTFB: < 1 second**

---

## Reference Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/lrsioerkvxmvhkatphbc
- **Deployment Guide**: See `DEPLOYMENT-PLAN.md`
- **Quick Reference**: See `README.md`
- **Schema**: See `supabase/schema.sql`

---

## Questions to Answer Next Session

1. **Do you want to use the client's custom domain or a neutral one?**
   - Client domain: `*.clientdomain.com`
   - Your domain: `*.logicproxy.io` (you'd need to buy this)
   - Vercel default: `*.logic-form-proxy.vercel.app`

2. **What's the actual GHL form URL for testing?**
   - Need a real form ID to test the iframe embed

3. **Multi-client or single-client for now?**
   - Current schema supports multiple clients
   - Can simplify if only one client initially

---

## Commands Cheat Sheet

```bash
# Check Supabase link status
supabase projects list

# Get API keys
supabase projects api-keys --project-ref lrsioerkvxmvhkatphbc

# Run migrations (if using CLI approach)
supabase db push

# Deploy edge functions (future use)
supabase functions deploy

# Git commands
git status
git add .
git commit -m "message"
git push
```

---

## Success Criteria

✅ Database schema deployed
✅ Test affiliate inserted
✅ `index.html` updated with credentials
✅ GitHub repo created and pushed
✅ Vercel deployment live
✅ Test URL loads and shows GHL form in iframe
✅ URL parameters pass through correctly

---

**Status: Ready for MCP-enabled session to complete database setup and deployment.**

Last updated: 2025-10-24
