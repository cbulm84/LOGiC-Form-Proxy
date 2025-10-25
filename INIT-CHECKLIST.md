# Initialization Checklist - LOGiC Form Proxy

Use this checklist to track progress from setup to production deployment.

---

## Phase 1: Supabase Setup

- [ ] **1.1** Supabase project created: `utility-db` ✓ (DONE)
- [ ] **1.2** Supabase CLI linked ✓ (DONE)
- [ ] **1.3** Run `supabase/schema.sql` in SQL Editor
  - Verify table created: `public.affiliate_pages`
  - Verify trigger created: `prevent_affiliate_mutation`
  - Verify RLS policy: `public_read_active_affiliates`
- [ ] **1.4** Get project credentials
  - Copy Project URL: `https://lrsioerkvxmvhkatphbc.supabase.co`
  - Copy Anon Key: `eyJ...` (from Settings → API)
- [ ] **1.5** Test query (optional):
  ```sql
  select * from public.affiliate_pages limit 1;
  ```

---

## Phase 2: Local Configuration

- [ ] **2.1** Update `index.html` with Supabase credentials
  - Replace `SUPABASE_URL` with actual URL
  - Replace `SUPABASE_ANON_KEY` with actual key
- [ ] **2.2** Verify files are complete:
  ```bash
  ls -la
  # Should show: index.html, README.md, DEPLOYMENT-PLAN.md, supabase/
  ```
- [ ] **2.3** Test locally (optional):
  - Open `index.html` in browser
  - Check console for errors
  - Expect "Page Not Found" (normal - no affiliates yet)

---

## Phase 3: Git & GitHub

- [ ] **3.1** Initialize Git:
  ```bash
  git init
  ```
- [ ] **3.2** Add files:
  ```bash
  git add .
  ```
- [ ] **3.3** First commit:
  ```bash
  git commit -m "Initial commit: LOGiC Form Proxy"
  ```
- [ ] **3.4** Create GitHub repo:
  ```bash
  # Option A: Via gh CLI
  gh repo create LOGiC-Form-Proxy --public --source=. --remote=origin

  # Option B: Create manually on github.com
  # Then: git remote add origin <repo-url>
  ```
- [ ] **3.5** Push to GitHub:
  ```bash
  git push -u origin main
  ```
- [ ] **3.6** Verify repo is public and accessible

---

## Phase 4: Vercel Deployment

- [ ] **4.1** Import repo to Vercel
  - Go to: https://vercel.com/new
  - Select `LOGiC-Form-Proxy` repo
- [ ] **4.2** Configure build settings:
  - Framework Preset: **Other**
  - Build Command: *(leave blank)*
  - Output Directory: `.`
  - Install Command: *(leave blank)*
- [ ] **4.3** Deploy
- [ ] **4.4** Note deployment URL:
  - Example: `https://logic-form-proxy.vercel.app`
- [ ] **4.5** Test deployment:
  - Visit the URL
  - Should show "Page Not Found" (expected)
  - Check console for API errors

---

## Phase 5: Database Test Data

- [ ] **5.1** Insert first test affiliate:
  ```sql
  insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url, active)
  values (
    'testclient',
    'demo',
    'https://form.gohighlevel.com/v2/Forms/?id=YOUR_ACTUAL_FORM_ID',
    true
  );
  ```
- [ ] **5.2** Verify insert:
  ```sql
  select * from public.affiliate_pages;
  ```
- [ ] **5.3** Test with Vercel URL:
  - Visit: `https://demo.testclient.logic-form-proxy.vercel.app`
  - **Expected**: Should show error (subdomain doesn't match Vercel pattern yet)
  - This is OK - we need custom domain for wildcard routing

---

## Phase 6: Custom Domain Setup

### Option A: Use Client's Domain

- [ ] **6.1** Get client's domain (e.g., `clientdomain.com`)
- [ ] **6.2** Add wildcard CNAME in their DNS:
  ```
  Type:  CNAME
  Name:  *
  Value: cname.vercel-dns.com
  TTL:   3600 (or default)
  ```
- [ ] **6.3** Add domain to Vercel:
  - Project Settings → Domains
  - Add: `*.clientdomain.com`
  - Wait for verification (5-10 min)
- [ ] **6.4** Test with custom domain:
  ```
  https://demo.testclient.clientdomain.com
  ```
  - Should load GHL form in iframe
  - No errors in console

### Option B: Use Your Own Domain (Future)

- [ ] **6.1** Purchase domain (e.g., `logicproxy.io`)
- [ ] **6.2** Add wildcard CNAME:
  ```
  Type:  CNAME
  Name:  *
  Value: cname.vercel-dns.com
  ```
- [ ] **6.3** Add to Vercel: `*.logicproxy.io`
- [ ] **6.4** Test: `https://demo.testclient.logicproxy.io`

---

## Phase 7: Production Testing

- [ ] **7.1** Test URL parameter passthrough:
  ```
  https://demo.testclient.DOMAIN.com?affiliate=ABC&utm_source=test
  ```
  - Open browser DevTools → Network
  - Check iframe src includes: `&affiliate=ABC&utm_source=test`
- [ ] **7.2** Test with real GHL form:
  - Verify form loads completely
  - Submit test data
  - Confirm data appears in GHL
- [ ] **7.3** Test affiliate pre-fill (if GHL supports it):
  - URL params should auto-populate hidden fields in GHL
- [ ] **7.4** Test on mobile:
  - Iframe should be responsive
  - Form should be usable
- [ ] **7.5** Test edge cases:
  - Invalid subdomain → Shows "Page Not Found"
  - Inactive affiliate (`active=false`) → Shows "Page Not Found"
  - Missing params → Still loads (params optional)

---

## Phase 8: Client Onboarding

- [ ] **8.1** Add production affiliates:
  ```sql
  insert into public.affiliate_pages (client_slug, affiliate_slug, ghl_form_url)
  values
    ('healthclient', 'acme', 'https://form.gohighlevel.com/...'),
    ('healthclient', 'spark', 'https://form.gohighlevel.com/...'),
    ('healthclient', 'partner3', 'https://form.gohighlevel.com/...');
  ```
- [ ] **8.2** Share URLs with client:
  - `acme.healthclient.DOMAIN.com`
  - `spark.healthclient.DOMAIN.com`
  - `partner3.healthclient.DOMAIN.com`
- [ ] **8.3** Document for client:
  - How to add URL parameters
  - What parameters are supported
  - How to request new affiliates (via you)
- [ ] **8.4** Set up monitoring (optional):
  - Vercel Analytics
  - Supabase logs
  - Uptime monitor

---

## Phase 9: Documentation & Handoff

- [ ] **9.1** Create `.claude` file with project context
- [ ] **9.2** Document maintenance procedures:
  - How to add new affiliates (SQL)
  - How to update form URLs (SQL)
  - How to disable affiliates (SQL)
- [ ] **9.3** Create client-facing docs (if needed)
- [ ] **9.4** Archive this checklist for future reference

---

## Rollback Plan

If something goes wrong:

1. **Vercel deployment fails:**
   - Check build logs in Vercel
   - Verify files are in root directory
   - Ensure no framework is selected

2. **DNS not resolving:**
   - Wait 5-10 min for propagation
   - Use `nslookup subdomain.client.domain.com`
   - Verify CNAME is correct

3. **Database errors:**
   - Check RLS policies are enabled
   - Verify anon key is correct in `index.html`
   - Check Supabase logs for errors

4. **Iframe won't load:**
   - Check GHL form URL is correct
   - Look for `X-Frame-Options` errors in console
   - Verify GHL allows embedding

---

## Success Metrics

✅ **All phases complete**
✅ **Test affiliate loads form correctly**
✅ **URL params pass through**
✅ **No console errors**
✅ **Mobile responsive**
✅ **Client can access all affiliate URLs**

---

## Future Enhancements (Optional)

- [ ] Add analytics tracking
- [ ] Create admin dashboard for non-technical users
- [ ] Add custom thank-you pages
- [ ] Implement A/B testing
- [ ] Add rate limiting
- [ ] Set up automated backups
- [ ] Create staging environment

---

**Last Updated:** 2025-10-24
**Status:** Phase 1 complete, ready for Phase 2
