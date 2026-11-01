-- supabase/migrations/003_requests_migration.sql
-- ZenTap: Owner Reset Requests, Partial Unique Indexes & Business Purge Procedure

-- 1. Create Reset Requests Table
CREATE TABLE IF NOT EXISTS public.reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('card_reset', 'pin_reset')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  decided_by TEXT
);

CREATE INDEX IF NOT EXISTS reset_requests_tag_idx ON public.reset_requests (tag_id);
CREATE INDEX IF NOT EXISTS reset_requests_status_idx ON public.reset_requests (status);
CREATE INDEX IF NOT EXISTS reset_requests_partner_idx ON public.reset_requests (partner_id);

-- 2. Soft Delete Uniqueness (Allow Re-using Slugs & Emails of Soft-Deleted Businesses)
-- First create partial unique indexes that only check rows where deleted_at IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS businesses_slug_active_unique 
  ON public.businesses (lower(slug)) 
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS businesses_email_active_unique 
  ON public.businesses (lower(email)) 
  WHERE deleted_at IS NULL;

-- Safely drop old unconditional constraints if present
DO $$ BEGIN
  ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_slug_key;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_email_key;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- 3. Business Permanent Purge Function (Service Role Only)
-- Refuses if any hardware tag is still assigned to this business
CREATE OR REPLACE FUNCTION purge_business(p_business_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_assigned_count INT;
BEGIN
  -- Refuse if any tag is still assigned to this business
  SELECT COUNT(*) INTO v_assigned_count
    FROM public.tags
   WHERE business_id = p_business_id;

  IF v_assigned_count > 0 THEN
    RAISE EXCEPTION 'Cannot purge business: % card/standee(s) are still assigned. Release tags first.', v_assigned_count;
  END IF;

  -- 1. Delete associated scans
  DELETE FROM public.scans WHERE business_id = p_business_id;

  -- 2. Delete tag assignments history for this business
  DELETE FROM public.tag_assignments WHERE business_id = p_business_id;

  -- 3. Delete reset requests for this business
  DELETE FROM public.reset_requests WHERE business_id = p_business_id;

  -- 4. Delete partner actions logged for this business
  DELETE FROM public.partner_actions WHERE business_id = p_business_id;

  -- 5. Delete customer feedback
  DELETE FROM public.feedback WHERE business_id = p_business_id;

  -- 6. Delete orders
  DELETE FROM public.orders WHERE business_id = p_business_id;

  -- 7. Delete the business row permanently
  DELETE FROM public.businesses WHERE id = p_business_id;
END $$;

-- 4. Row Level Security
ALTER TABLE public.reset_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reset_requests FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION purge_business(UUID) FROM public, anon, authenticated;

GRANT ALL ON public.reset_requests TO service_role;
GRANT EXECUTE ON FUNCTION purge_business(UUID) TO service_role;
