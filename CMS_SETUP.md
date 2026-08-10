# Shark Automotive CMS Setup Guide

## Phase 0: Infrastructure Setup

### Step 1: Create Database Tables

Log into your Supabase dashboard and execute this SQL in the SQL Editor:

```sql
-- CMS Content Management Tables

-- Main content table: stores all editable page content
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  value TEXT,
  content_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'textarea', 'image', 'number'
  character_limit INTEGER,
  locked BOOLEAN DEFAULT FALSE, -- locked fields cannot be edited (legal disclaimer, footer NIPC)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID,
  
  UNIQUE(page, section, content_key),
  CONSTRAINT valid_content_type CHECK (content_type IN ('text', 'textarea', 'image', 'number'))
);

-- Audit log: tracks all changes to site content
CREATE TABLE IF NOT EXISTS public.content_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.site_content(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: site_content
-- Public (anonymous) can only SELECT, not modify
CREATE POLICY "site_content_public_select"
  ON public.site_content
  FOR SELECT
  USING (true);

-- Authenticated admin can SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "site_content_admin_all"
  ON public.site_content
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies: content_audit_log
-- Public can SELECT audit log
CREATE POLICY "audit_log_public_select"
  ON public.content_audit_log
  FOR SELECT
  USING (true);

-- Authenticated admin can INSERT audit logs
CREATE POLICY "audit_log_admin_insert"
  ON public.content_audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_content_page ON public.site_content(page);
CREATE INDEX IF NOT EXISTS idx_site_content_page_section ON public.site_content(page, section);
CREATE INDEX IF NOT EXISTS idx_audit_log_content_id ON public.content_audit_log(content_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON public.content_audit_log(changed_at DESC);
```

### Step 2: Create Storage Bucket

Create a new Storage bucket named `site-images` and set it to **PUBLIC** (allow list access):

1. Go to Storage in Supabase
2. Create new bucket: `site-images`
3. Set Access: PUBLIC
4. Allowed MIME types: `image/jpeg, image/png, image/webp, image/svg+xml`

### Step 3: Seed HOME Page Content

After tables are created, run this SQL to seed the HOME page:

```sql
INSERT INTO public.site_content (page, section, content_key, value, content_type, locked) VALUES
-- HERO
('home', 'hero', 'headline_line1', 'IMPORTADO. VERIFICADO.', 'text', FALSE),
('home', 'hero', 'headline_line2', 'ENTREGUE.', 'text', FALSE),
('home', 'hero', 'tagline', 'Zero Conversas. Total Transparência.', 'text', FALSE),
('home', 'hero', 'cta_inventory', 'Ver Inventário', 'text', FALSE),
('home', 'hero', 'cta_import', 'Importação Sob Encomenda', 'text', FALSE),
('home', 'hero', 'background_image', '/images/bts/mini-cooper-s-golden-hour.jpg', 'image', FALSE),

-- STATS
('home', 'stats', 'stat_1_value', '3', 'text', FALSE),
('home', 'stats', 'stat_1_label', 'Viaturas em Stock', 'text', FALSE),
('home', 'stats', 'stat_1_description', 'Verificadas 150 Pontos', 'text', FALSE),
('home', 'stats', 'stat_2_value', '100%', 'text', FALSE),
('home', 'stats', 'stat_2_label', 'Documentação Confirmada', 'text', FALSE),
('home', 'stats', 'stat_2_description', 'Historial validado', 'text', FALSE),
('home', 'stats', 'stat_3_value', 'ZERO', 'text', FALSE),
('home', 'stats', 'stat_3_label', 'Surpresas', 'text', FALSE),
('home', 'stats', 'stat_3_description', 'Total transparência', 'text', FALSE),
('home', 'stats', 'stat_4_value', '15%', 'text', FALSE),
('home', 'stats', 'stat_4_label', 'Poupança Média', 'text', FALSE),
('home', 'stats', 'stat_4_description', 'Face a concessionários', 'text', FALSE);
```

### Seeding Verification Report

After seeding, verify all 18 HOME page items were inserted correctly:

```
================================================================================
🔍 SEEDING VERIFICATION REPORT
================================================================================

### HOME PAGE (18 items)
────────────────────────────────────────────────────────────────────────────

#### HERO
  [✓] hero.headline_line1: "IMPORTADO. VERIFICADO."
  [✓] hero.headline_line2: "ENTREGUE."
  [✓] hero.tagline: "Zero Conversas. Total Transparência."
  [✓] hero.cta_inventory: "Ver Inventário"
  [✓] hero.cta_import: "Importação Sob Encomenda"
  [✓] hero.background_image: "/images/bts/mini-cooper-s-golden-hour.jpg"

#### STATS
  [✓] stats.stat_1_value: "3"
  [✓] stats.stat_1_label: "Viaturas em Stock"
  [✓] stats.stat_1_description: "Verificadas 150 Pontos"
  [✓] stats.stat_2_value: "100%"
  [✓] stats.stat_2_label: "Documentação Confirmada"
  [✓] stats.stat_2_description: "Historial validado"
  [✓] stats.stat_3_value: "ZERO"
  [✓] stats.stat_3_label: "Surpresas"
  [✓] stats.stat_3_description: "Total transparência"
  [✓] stats.stat_4_value: "15%"
  [✓] stats.stat_4_label: "Poupança Média"
  [✓] stats.stat_4_description: "Face a concessionários"

================================================================================
Summary: 18 ✓ | 0 ✗
================================================================================
```

## Phase 1: HOME Page Refactoring

Once seeding is complete and verified, move to Phase 1:

1. `/admin/conteudo/home` will open the HOME content editor
2. Edit a test field (e.g., hero tagline)
3. Verify the change appears live on the home page
4. Revert the change
5. Sign off before moving to remaining pages

See `v0_plans/cms-implementation.md` for full rollout plan.
