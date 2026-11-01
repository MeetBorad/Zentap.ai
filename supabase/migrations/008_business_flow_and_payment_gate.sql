-- =========================================================================
-- ZenTap Migration 008: Business Schema Harmonization & Payment Confirmation Gate
-- Version: 8.0
-- Adds missing business table columns and removes legacy restrictive constraints
-- =========================================================================

-- 1. Drop restrictive legacy check constraints on businesses
DO $$ BEGIN
  ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_plan_check;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_payment_status_check;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- 2. Add all extended columns to public.businesses
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS redirect_mode TEXT DEFAULT 'interactive_profile',
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS selected_product TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_support_number TEXT,
  ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_confirmed_by TEXT;

-- 3. Ensure owner_user_id is nullable for admin-registered businesses
ALTER TABLE public.businesses ALTER COLUMN owner_user_id DROP NOT NULL;

-- 4. Enable RLS and ensure admin policies exist
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to businesses" ON public.businesses;
CREATE POLICY "Admins have full access to businesses"
  ON public.businesses
  FOR ALL
  USING (
    coalesce(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '') = 'admin'
    OR coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', '') IN (
      SELECT email FROM public.admin_users
    )
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '') = 'admin'
    OR coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', '') IN (
      SELECT email FROM public.admin_users
    )
  );

-- 5. Safe index on payment status and slug
CREATE INDEX IF NOT EXISTS idx_businesses_payment_status ON public.businesses(payment_status);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(lower(slug));
