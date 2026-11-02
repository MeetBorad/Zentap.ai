-- supabase/migrations/010_admin_tables_enhancements.sql
-- Dedicated audit tables for deleted records across Admin tabs:
-- 1. deleted_payments
-- 2. deleted_google_review_links
-- 3. deleted_social_links
-- 4. deleted_qr_nfc_tags
-- 5. deleted_page_editor_configs

-- 1. DELETED PAYMENTS
CREATE TABLE IF NOT EXISTS public.deleted_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT,
  business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  product TEXT NOT NULL,
  product_price NUMERIC DEFAULT 0,
  selling_rate NUMERIC DEFAULT 0,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'UPI',
  payment_status TEXT DEFAULT 'Pending Unpaid',
  notes TEXT,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by TEXT DEFAULT 'admin'
);

-- 2. DELETED GOOGLE REVIEW LINKS
CREATE TABLE IF NOT EXISTS public.deleted_google_review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id TEXT,
  tag_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  link_of_tag_id TEXT NOT NULL,
  business_google_review_link TEXT,
  destination TEXT,
  setup_status TEXT,
  total_scans INT DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by TEXT DEFAULT 'admin'
);

-- 3. DELETED SOCIAL LINKS
CREATE TABLE IF NOT EXISTS public.deleted_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id TEXT,
  tag_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  social_platform TEXT,
  link_of_tag_id TEXT NOT NULL,
  social_link TEXT,
  destination TEXT,
  setup_status TEXT,
  total_scans INT DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by TEXT DEFAULT 'admin'
);

-- 4. DELETED QR/NFC TAGS
CREATE TABLE IF NOT EXISTS public.deleted_qr_nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_ref_id TEXT,
  tag_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  business_id TEXT,
  business_name TEXT,
  link TEXT NOT NULL,
  scans_count INT DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by TEXT DEFAULT 'admin'
);

-- 5. DELETED PAGE EDITOR CONFIGS
CREATE TABLE IF NOT EXISTS public.deleted_page_editor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id TEXT,
  tag_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  link_url TEXT NOT NULL,
  setup_status TEXT,
  config_data JSONB,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by TEXT DEFAULT 'admin'
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_del_pay_business_id ON public.deleted_payments (business_id);
CREATE INDEX IF NOT EXISTS idx_del_google_tag ON public.deleted_google_review_links (tag_id);
CREATE INDEX IF NOT EXISTS idx_del_social_tag ON public.deleted_social_links (tag_id);
CREATE INDEX IF NOT EXISTS idx_del_qr_tag ON public.deleted_qr_nfc_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_del_pe_tag ON public.deleted_page_editor_configs (tag_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.deleted_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_google_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_qr_nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_page_editor_configs ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Admin full access on deleted_payments" ON public.deleted_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on deleted_google_review_links" ON public.deleted_google_review_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on deleted_social_links" ON public.deleted_social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on deleted_qr_nfc_tags" ON public.deleted_qr_nfc_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on deleted_page_editor_configs" ON public.deleted_page_editor_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
