-- supabase/migrations/009_admin_webpages_redesign.sql
-- Dedicated tables for ZenTap Admin Webpages Redesign:
-- 1. clients & deleted_businesses
-- 2. payments
-- 3. qr_nfc_tags
-- 4. google_review_links
-- 5. social_links
-- 6. page_editor_configs

-- 1. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT UNIQUE NOT NULL, -- e.g. ZT-0001
  business_name TEXT NOT NULL,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  whatsapp TEXT,
  instagram_link TEXT,
  facebook_link TEXT,
  city TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DELETED BUSINESSES AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.deleted_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  whatsapp TEXT,
  instagram_link TEXT,
  facebook_link TEXT,
  city TEXT,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deleted_by TEXT DEFAULT 'admin',
  notes TEXT
);

-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL, -- e.g. ZT-0001
  business_name TEXT NOT NULL,
  product TEXT NOT NULL,
  product_price NUMERIC DEFAULT 0,
  selling_rate NUMERIC DEFAULT 0, -- Amount received / selling rate
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'UPI', -- 'UPI', 'Cash'
  payment_status TEXT DEFAULT 'Pending Unpaid', -- 'Completed paid', 'Partial Advance', 'Pending Unpaid'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. QR/NFC TAGS GENERATOR TABLE
CREATE TABLE IF NOT EXISTS public.qr_nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id TEXT UNIQUE NOT NULL, -- ST1, ST2... or CRD1, CRD2...
  product_type TEXT NOT NULL, -- 'Counter Standee' or 'Business NFC Card'
  business_id TEXT, -- e.g. ZT-0001 or NULL if unassigned
  business_name TEXT,
  link TEXT NOT NULL, -- https://www.zentapdigitalsolutions.com/t/ST1
  scans_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. GOOGLE LINKS & QR SHARING (STANDEES ONLY)
CREATE TABLE IF NOT EXISTS public.google_review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id TEXT UNIQUE NOT NULL, -- e.g. ST1
  business_id TEXT NOT NULL, -- e.g. ZT-0001
  business_name TEXT NOT NULL,
  link_of_tag_id TEXT NOT NULL,
  business_google_review_link TEXT,
  destination TEXT DEFAULT 'not_assigned', -- 'not_assigned', 'direct_google', 'zentap_google'
  setup_status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  total_scans INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SOCIAL LINKS & QR SETTING (CARDS ONLY)
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id TEXT UNIQUE NOT NULL, -- e.g. CRD1
  business_id TEXT NOT NULL, -- e.g. ZT-0001
  business_name TEXT NOT NULL,
  social_platform TEXT DEFAULT 'N/A', -- 'WhatsApp', 'Instagram', 'Facebook', 'N/A'
  link_of_tag_id TEXT NOT NULL,
  social_link TEXT,
  destination TEXT DEFAULT 'not_assigned', -- 'not_assigned', 'assigned'
  setup_status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  total_scans INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PAGE EDITOR CONFIGS (STANDEE USERS)
CREATE TABLE IF NOT EXISTS public.page_editor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id TEXT UNIQUE NOT NULL, -- e.g. ST1
  business_id TEXT NOT NULL, -- e.g. ZT-0001
  business_name TEXT NOT NULL,
  link_url TEXT NOT NULL,
  setup_status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  config_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON public.clients (business_id);
CREATE INDEX IF NOT EXISTS idx_deleted_businesses_bid ON public.deleted_businesses (business_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON public.payments (business_id);
CREATE INDEX IF NOT EXISTS idx_qr_nfc_tags_tag_id ON public.qr_nfc_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_qr_nfc_tags_business_id ON public.qr_nfc_tags (business_id);
CREATE INDEX IF NOT EXISTS idx_google_review_links_tag ON public.google_review_links (tag_id);
CREATE INDEX IF NOT EXISTS idx_social_links_tag ON public.social_links (tag_id);
CREATE INDEX IF NOT EXISTS idx_page_editor_tag ON public.page_editor_configs (tag_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_editor_configs ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE POLICIES FOR ADMIN / SERVICE ROLE
CREATE POLICY "Admin full access on clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on deleted_businesses" ON public.deleted_businesses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on qr_nfc_tags" ON public.qr_nfc_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on google_review_links" ON public.google_review_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on social_links" ON public.social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on page_editor_configs" ON public.page_editor_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read on qr_nfc_tags and redirect tables for instant scan resolution
CREATE POLICY "Public read for scans on qr_nfc_tags" ON public.qr_nfc_tags FOR SELECT TO anon USING (true);
CREATE POLICY "Public read for scans on google_review_links" ON public.google_review_links FOR SELECT TO anon USING (true);
CREATE POLICY "Public read for scans on social_links" ON public.social_links FOR SELECT TO anon USING (true);
CREATE POLICY "Public read for scans on page_editor_configs" ON public.page_editor_configs FOR SELECT TO anon USING (true);
