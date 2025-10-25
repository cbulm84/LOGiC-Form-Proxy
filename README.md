# LOGiC Form Proxy

Simple wildcard subdomain system for white-labeled iframe embeds. Maps client subdomains to Go High Level forms with URL parameter passthrough.

## How It Works

```
User visits: acme.healthclient.yourdomain.com?affiliate=XYZ

1. Static HTML loads from Vercel
2. JavaScript extracts: client='healthclient', affiliate='acme'
3. Queries Supabase for GHL form URL
4. Renders full-page iframe with params appended
```

## Tech Stack

- **Frontend**: Static HTML + vanilla JavaScript
- **Hosting**: Vercel (wildcard subdomains)
- **Database**: Supabase (affiliate mappings)
- **DNS**: Wildcard CNAME → Vercel

## Quick Start

### 1. Supabase Setup

```bash
# Create new project in Supabase dashboard: "utility-db"
# Run supabase/schema.sql in SQL Editor
# Copy your project URL and anon key
```

### 2. Update Configuration

Edit `index.html` and replace:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# Import to Vercel
# - Framework: Other
# - Build Command: (blank)
# - Output Directory: .
# - Install Command: (blank)
```

### 4. Add Wildcard Domain

**In DNS (GoDaddy/etc):**
```
Type:  CNAME
Name:  *
Value: cname.vercel-dns.com
```

**In Vercel:**
- Add domain: `*.yourdomain.com`
- Wait for verification

### 5. Add Affiliates

```sql
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url)
values ('healthclient', 'acme', 'https://form.gohighlevel.com/v2/Forms/?id=ABC123');
```

### 6. Test

Visit: `https://acme.healthclient.yourdomain.com?affiliate=TEST`

## Adding New Clients

```sql
-- One SQL insert per affiliate
insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url)
values ('newclient', 'partner1', 'https://form.gohighlevel.com/...');
```

No redeploy needed. Changes are instant.

## URL Parameter Passthrough

These params are automatically forwarded to the GHL form:
- `affiliate`, `master`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `fbclid`
- `ref`, `source`

Example:
```
Input:  acme.client.domain.com?affiliate=ABC&utm_source=google
Output: form.gohighlevel.com/...?id=123&affiliate=ABC&utm_source=google
```

## Security

- **Anon Key Exposure**: Safe - RLS policies restrict access
- **Immutable Slugs**: Cannot be changed after creation
- **No Deletion**: Rows cannot be deleted (set `active=false` instead)
- **HIPAA Safe**: No PHI stored; all data collection happens inside GHL iframe

## Files

```
LOGiC-Form-Proxy/
├── index.html              # Static iframe loader
├── supabase/
│   └── schema.sql         # Database schema + RLS
├── DEPLOYMENT-PLAN.md     # Detailed setup guide
├── README.md              # This file
└── .gitignore
```

## Troubleshooting

**Page shows "Not Found":**
- Check affiliate exists in Supabase with `active=true`
- Verify DNS has propagated (5-10 min after CNAME change)
- Check browser console for API errors

**Iframe won't load:**
- Verify GHL form URL is correct
- Check for `X-Frame-Options` errors in console
- Ensure GHL allows embedding

**DNS not resolving:**
- Confirm wildcard CNAME: `*` → `cname.vercel-dns.com`
- Test with `nslookup subdomain.client.domain.com`
- Verify domain added to Vercel project

## Maintenance

**Update form URL:**
```sql
update public.affiliate_pages
set ghl_form_url = 'https://new-url.com'
where client_slug = 'client1' and affiliate_slug = 'acme';
```

**Disable affiliate:**
```sql
update public.affiliate_pages
set active = false
where client_slug = 'client1' and affiliate_slug = 'old';
```

**View all active:**
```sql
select * from public.affiliate_pages
where active = true
order by client_slug, affiliate_slug;
```

## Performance

- **Page Load**: ~50-100ms (static HTML, edge cached)
- **Database Query**: ~20-50ms (Supabase cached 24hrs)
- **Iframe Render**: 300-800ms (depends on GHL)

## License

Internal use only.
