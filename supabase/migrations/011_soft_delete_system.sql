-- supabase/migrations/011_soft_delete_system.sql
-- Unified Soft Delete architecture across all 6 ZenTap Admin Tables:
-- 1. clients
-- 2. payments
-- 3. qr_nfc_tags
-- 4. google_review_links
-- 5. social_links
-- 6. page_editor_configs

-- Add soft delete columns to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients (deleted_at);

-- Add soft delete columns to payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON public.payments (deleted_at);

-- Add soft delete columns to qr_nfc_tags
ALTER TABLE public.qr_nfc_tags
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_qr_nfc_tags_deleted_at ON public.qr_nfc_tags (deleted_at);

-- Add soft delete columns to google_review_links
ALTER TABLE public.google_review_links
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_google_review_links_deleted_at ON public.google_review_links (deleted_at);

-- Add soft delete columns to social_links
ALTER TABLE public.social_links
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_social_links_deleted_at ON public.social_links (deleted_at);

-- Add soft delete columns to page_editor_configs
ALTER TABLE public.page_editor_configs
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_page_editor_configs_deleted_at ON public.page_editor_configs (deleted_at);
