-- =========================================================================
-- ZenTap — Comprehensive Row Level Security (RLS) Enforcement
-- Migration: 015_enforce_rls_policies_and_rate_limits.sql
-- =========================================================================

-- 1. Ensure RLS is explicitly enabled on all core tables
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_editor_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deleted_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deleted_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deleted_google_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deleted_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deleted_qr_nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deleted_page_editor_configs ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy permissive / unisolated policies if existing
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;
DROP POLICY IF EXISTS "Public can read active standees" ON public.qr_nfc_tags;
DROP POLICY IF EXISTS "Public can read active google links" ON public.google_review_links;
DROP POLICY IF EXISTS "Public can read page editor configs" ON public.page_editor_configs;

-- 3. Public Read Policies (Only active, non-deleted records for visitor routing)
CREATE POLICY "Public can view active businesses"
  ON public.businesses
  FOR SELECT
  USING (is_deleted = false AND active = true);

CREATE POLICY "Public can read active standees"
  ON public.qr_nfc_tags
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Public can read active google links"
  ON public.google_review_links
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Public can read page editor configs"
  ON public.page_editor_configs
  FOR SELECT
  USING (deleted_at IS NULL);

-- 4. Multi-Tenant Business Owner Isolation
CREATE POLICY "Owners can update own business"
  ON public.businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- 5. Public Telemetry Logging (Scans, Click Events, Feedback)
DROP POLICY IF EXISTS "Public can insert scan telemetry" ON public.scans;
CREATE POLICY "Public can insert scan telemetry"
  ON public.scans
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;
CREATE POLICY "Public can insert feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (true);

-- 6. Lock down financial, AI credentials, and deleted archives strictly to service_role / admins
-- (By not declaring anonymous INSERT/UPDATE/DELETE policies, Supabase defaults to rejecting unauthorized writes)
