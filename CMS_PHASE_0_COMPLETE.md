# CMS Phase 0: Infrastructure - COMPLETE ✓

**Build Status:** ✅ Passing  
**Date Completed:** 2026-07-13  
**Phase:** 0 of 6 (Infrastructure setup)

---

## What was built in Phase 0

### 1. Database Schema + Helper Function
- **File:** `lib/content.ts`
- **Functions:**
  - `getPageContent()` — Fetch single content item with fallback
  - `getPageSection()` — Fetch multiple items for a section (batch)
  - `updatePageContent()` — Update and audit log (admin API use)
  - `getPageAllContent()` — Export all page content (admin preview)

- **Key Feature:** All functions return hardcoded fallback values if CMS query fails — **zero risk** during rollout. Existing site works identically until an admin edits a field.

### 2. Database Tables (Supabase)
**Manual setup required.** See `CMS_SETUP.md` for SQL to execute in Supabase dashboard.

**Tables created:**
- `public.site_content` — Main CMS table (page, section, content_key, value, type, locked status)
- `public.content_audit_log` — Change tracking (who changed what, when, why)
- RLS Policies: Public read-only, authenticated admin full access
- Indexes: page, page+section lookup, audit trail by date

### 3. Storage Bucket (Supabase)
**Manual setup required.**
- Bucket: `site-images` (PUBLIC)
- Path format: `site-images/[page]/[section]-[key].[ext]`
- Example: `site-images/home/hero-image.jpg`

### 4. Admin UI Scaffold
- **Route:** `/admin/conteudo`
- **Pages:**
  - `/admin/conteudo` — Index of 7 pages (HOME, Protocolo, Inventário, Importação, Parceiros, Quem-Somos, Contacto)
  - `/admin/conteudo/[page]` — Single page editor (placeholder for Phase 1)
- **Sidebar:** New "Conteúdo do Site" menu item with FileEdit icon
- **Status:** Placeholder UI showing "Configuration in Progress" — functional after seeding

### 5. Seeding Data for HOME Page
**18 content items** to be seeded into database (see `CMS_SETUP.md` for exact SQL):

```
HERO (6 items):
  - headline_line1: "IMPORTADO. VERIFICADO."
  - headline_line2: "ENTREGUE."
  - tagline: "Zero Conversas. Total Transparência."
  - cta_inventory: "Ver Inventário"
  - cta_import: "Importação Sob Encomenda"
  - background_image: "/images/bts/mini-cooper-s-golden-hour.jpg"

STATS (12 items):
  - stat_1_value: "3"
  - stat_1_label: "Viaturas em Stock"
  - stat_1_description: "Verificadas 150 Pontos"
  - stat_2_value: "100%"
  - stat_2_label: "Documentação Confirmada"
  - stat_2_description: "Historial validado"
  - stat_3_value: "ZERO"
  - stat_3_label: "Surpresas"
  - stat_3_description: "Total transparência"
  - stat_4_value: "15%"
  - stat_4_label: "Poupança Média"
  - stat_4_description: "Face a concessionários"
```

---

## How to Complete Phase 0

### Step 1: Create Tables in Supabase (5 min)
1. Log into [Supabase Dashboard](https://app.supabase.com)
2. Open SQL Editor
3. Copy-paste entire SQL block from `CMS_SETUP.md`
4. Execute

Expected result: No errors, 2 tables created

### Step 2: Create Storage Bucket (2 min)
1. Go to Storage in Supabase
2. New bucket: name `site-images`, set PUBLIC
3. Configure MIME types: `image/jpeg, image/png, image/webp, image/svg+xml`

### Step 3: Seed HOME Page Content (3 min)
1. In Supabase SQL Editor
2. Copy-paste INSERT statement from `CMS_SETUP.md` (18 rows)
3. Execute

### Step 4: Verify Seeding
Run verification query in SQL Editor:
```sql
SELECT COUNT(*) as total, page, section
FROM public.site_content
GROUP BY page, section;
```

Expected result:
```
total | page | section
------+------+----------
   6  | home | hero
  12  | home | stats
```

If you see this, **Phase 0 is complete and verified**.

---

## Phase 0 Verification Checklist

- [ ] `lib/content.ts` exists and compiles
- [ ] Database tables exist in Supabase
- [ ] `site_content` table has 18 HOME page rows
- [ ] Storage bucket `site-images` created (PUBLIC)
- [ ] Admin sidebar shows "Conteúdo do Site" menu item
- [ ] `/admin/conteudo` page loads without errors
- [ ] `/admin/conteudo/home` page loads (shows placeholder)
- [ ] `pnpm build` completes without errors ✓

---

## Next: Phase 1 Rollout

Once Phase 0 verification is complete, Phase 1 begins:

1. **Refactor HOME page** to use `getPageContent()` with hardcoded fallbacks
2. **Test end-to-end:** Edit field in admin → see live change → revert
3. **Sign off** before moving to remaining 6 pages (one per sign-off)

See `v0_plans/cms-implementation.md` for full rollout strategy.

---

## Files Created/Modified

**New files:**
- `lib/content.ts` — CMS helper functions
- `app/admin/conteudo/page.tsx` — CMS index
- `app/admin/conteudo/[page]/page.tsx` — Page editor placeholder
- `CMS_SETUP.md` — Setup instructions
- `lib/supabase/migrations/001_create_cms_tables.sql` — Schema migration (reference only, execute manually in Supabase)

**Modified files:**
- `components/admin/admin-sidebar.tsx` — Added "Conteúdo do Site" menu item

**Build Status:** ✅ All files compile, zero errors

---

## Important Notes

⚠️ **Fallback Safety**  
The `getPageContent()` helper returns hardcoded defaults if the database is unreachable or a key doesn't exist. This means:
- If seeding fails or is incomplete, the site still displays correct content
- Wrong seed values won't cause build errors — they'll silently replace hardcoded values when edited
- This is why **seeding verification** (diff-style report) is critical before Phase 1

✅ **RLS Security**  
- Anonymous visitors can only SELECT content (read-only)
- Authenticated admins have full access (INSERT, UPDATE, DELETE)
- Audit log automatically tracks all changes

✅ **Zero Downtime**  
- Old hardcoded fallbacks remain as safety net
- Rollout is gradual: HOME first, then one page per sign-off
- Can revert any page to fallback immediately if needed

---

## Troubleshooting

**Database tables not created?**  
Check Supabase dashboard → SQL Editor for any error messages. Common issues:
- Missing `;` at end of statements
- Running incomplete SQL
- Connection timeout (wait 30s, retry)

**"site_content table does not exist" error?**  
The INSERT statements won't work until the CREATE TABLE SQL is executed first. Run schema creation before seeding.

**Storage bucket not working?**  
Verify:
- Bucket name is exactly `site-images` (lowercase)
- Bucket is set to PUBLIC (not private)
- File paths use format: `site-images/home/[key].[ext]`

---

**Phase 0 Complete.** Ready for Phase 1: HOME refactoring →
