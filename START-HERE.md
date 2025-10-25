# 🚀 NEW SESSION - START HERE

## Quick Context
You're working on **LOGiC Form Proxy** - a wildcard subdomain iframe system for white-labeled GHL forms.

**Current Status:** ✅ Project structure complete, ⏳ Ready for database setup

---

## What This Session Needs to Do

### 1. Run Database Migration
Use Supabase MCP or CLI to deploy `supabase/schema.sql`

**Via MCP (Recommended):**
```
Use Supabase MCP to apply migration from supabase/schema.sql
```

**Via Dashboard:**
- Open Supabase SQL Editor
- Copy/paste contents of `supabase/schema.sql`
- Run it

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: LOGiC Form Proxy"
gh repo create LOGiC-Form-Proxy --public --source=. --remote=origin
git push -u origin main
```

### 3. Deploy to Vercel
- Import repo at vercel.com/new
- Framework: **Other**
- Build Command: `node build.js`
- Output Directory: `dist`
- Add Environment Variables:
  - `SUPABASE_URL` = `https://lrsioerkvxmvhkatphbc.supabase.co`
  - `SUPABASE_ANON_KEY` = (get from: `supabase projects api-keys --project-ref lrsioerkvxmvhkatphbc`)
- Deploy

### 4. Test Existing Data
The database already has 39 affiliates ready to test!

Example: `monster_michael_todd.direct.yourdomain.com`

To add more:
```sql
insert into public.sellerportal_affiliate_codes (client_slug, tag, form_url, status)
values ('testclient', 'demo', 'https://form.gohighlevel.com/v2/Forms/?id=FORM_ID', 'active');
```

---

## Important Files

- **HANDOFF.md** - Detailed handoff with all context
- **INIT-CHECKLIST.md** - Phase-by-phase checklist
- **.claude/project-context.md** - Full project documentation
- **DEPLOYMENT-PLAN.md** - Step-by-step deployment guide
- **supabase/schema.sql** - Database schema (run this first!)
- **index.html** - Main app (needs credentials updated)

---

## Supabase Project Info

- **Name:** utility-db
- **Project ID:** lrsioerkvxmvhkatphbc
- **URL:** https://lrsioerkvxmvhkatphbc.supabase.co
- **CLI:** Already linked ✓

---

## Success Criteria

✅ Schema deployed in Supabase
✅ `index.html` updated with credentials
✅ GitHub repo created and pushed
✅ Vercel deployment live
✅ Test affiliate loads GHL form in iframe

---

**Read HANDOFF.md for complete details.**
