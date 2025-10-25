# LOGiC Form Proxy - Deployment Plan

## Overview
Simple wildcard subdomain iframe proxy system. Each client gets subdomains that embed Go High Level forms with URL parameter passthrough.

**Architecture:**
- **Vercel**: Hosts static HTML (wildcard subdomains)
- **Supabase**: Stores subdomain → GHL form URL mappings
- **DNS**: Wildcard CNAME routing all subdomains to Vercel

---

## Project Info

- **GitHub Repo**: `LOGiC-Form-Proxy`
- **Supabase Project**: `utility-db`
- **Vercel Project**: `logic-form-proxy`
- **Domain**: TBD (client will provide custom domain)

---

## Deployment Steps

### 1. Supabase Setup ✓

**Create Project:**
- [x] Create new Supabase project: `utility-db`
- [ ] Copy project URL (format: `https://XXXXX.supabase.co`)
- [ ] Copy anon key (from Settings → API)
- [ ] Run SQL schema (see `supabase/schema.sql`)

**What you'll need:**
```
SUPABASE_URL=https://XXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

---

### 2. GitHub Repo Setup

- [ ] Push this repo to GitHub
- [ ] Ensure these files exist:
  - `index.html` (static iframe loader)
  - `supabase/schema.sql` (database schema)
  - `README.md` (setup instructions)

---

### 3. Vercel Deployment

**Import Project:**
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import `LOGiC-Form-Proxy` repo
- [ ] **Build Settings:**
  - Framework Preset: **Other**
  - Build Command: *(leave blank)*
  - Output Directory: `.`
  - Install Command: *(leave blank)*

**Add Environment Variables:**
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)

**Deploy:**
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note the Vercel URL (e.g., `logic-form-proxy.vercel.app`)

---

### 4. Domain Configuration

**Client's Domain (e.g., `clientdomain.com`):**

**In GoDaddy (or their DNS provider):**
- [ ] Add wildcard CNAME:
  ```
  Type:  CNAME
  Name:  *
  Value: cname.vercel-dns.com
  TTL:   Default (3600)
  ```

**In Vercel:**
- [ ] Go to Project Settings → Domains
- [ ] Add domain: `*.clientdomain.com`
- [ ] Wait for verification (~5-10 minutes)

---

### 5. Test Configuration

**Add Test Affiliate:**
```sql
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url)
values ('testclient', 'demo', 'https://form.gohighlevel.com/v2/Forms/?id=YOUR_FORM_ID');
```

**Test URL:**
```
https://demo.testclient.clientdomain.com?affiliate=TEST&utm_source=demo
```

**Expected Result:**
- Page loads instantly
- GHL form appears in full-page iframe
- URL params are appended to iframe src

---

## Adding New Clients

### Step 1: Insert Client Mapping
```sql
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url, active)
values ('newclient', 'affiliate1', 'https://form.gohighlevel.com/v2/Forms/?id=ABC123', true);
```

### Step 2: DNS (One-Time Per Client)
If using client's custom domain, add wildcard CNAME pointing to Vercel.

### Step 3: Test
Visit: `https://affiliate1.newclient.clientdomain.com`

**Done. No redeployment needed.**

---

## Ongoing Maintenance

### Update Form URL
```sql
update public.affiliate_pages
set ghl_form_url = 'https://new-url.com'
where client_slug = 'client1' and affiliate_slug = 'acme';
```

### Disable Affiliate
```sql
update public.affiliate_pages
set active = false
where client_slug = 'client1' and affiliate_slug = 'oldaffiliate';
```

### View All Active Affiliates
```sql
select client_slug, affiliate_slug, ghl_form_url
from public.affiliate_pages
where active = true
order by client_slug, affiliate_slug;
```

---

## Troubleshooting

### Issue: "Page Not Found" Error
**Check:**
1. Is the affiliate record in Supabase with `active = true`?
2. Does the subdomain format match? (e.g., `affiliate.client.domain.com`)
3. Is DNS propagated? (Wait 5-10 minutes after adding CNAME)
4. Check browser console for API errors

### Issue: Iframe Not Loading
**Check:**
1. Is the GHL form URL correct?
2. Does GHL allow embedding? (Check for X-Frame-Options errors in console)
3. Are URL params being passed correctly?

### Issue: DNS Not Resolving
**Check:**
1. Is wildcard CNAME added? (`*` → `cname.vercel-dns.com`)
2. Has DNS propagated? Use `nslookup subdomain.client.domain.com`
3. Is domain added to Vercel project?

---

## Security Notes

- **Anon Key Exposure**: Safe - RLS policies protect data
- **PHI/PII**: Never store in `affiliate_pages` table
- **Slug Immutability**: Enforced by trigger - cannot be changed after creation
- **No Deletion**: Rows cannot be deleted (set `active = false` instead)

---

## Performance

- **Edge Cached**: Supabase responses cached for 24hrs
- **Static HTML**: Sub-100ms load time
- **Iframe Load**: Depends on GHL (typically 300-800ms)

---

## Files Reference

```
LOGiC-Form-Proxy/
├── DEPLOYMENT-PLAN.md       # This file
├── README.md                # Project overview
├── index.html               # Static page (iframe loader)
├── .gitignore              # Git ignore rules
└── supabase/
    └── schema.sql          # Database schema + RLS policies
```

---

## Next Steps

1. ✅ Create Supabase project: `utility-db`
2. ⏳ Get Supabase URL and anon key
3. ⏳ Run `supabase/schema.sql`
4. ⏳ Push repo to GitHub
5. ⏳ Deploy to Vercel
6. ⏳ Configure DNS
7. ⏳ Test with demo affiliate

---

**Status:** Ready for Supabase URL + anon key to continue setup.
