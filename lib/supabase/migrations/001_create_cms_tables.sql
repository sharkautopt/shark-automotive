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
