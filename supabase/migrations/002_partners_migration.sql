-- supabase/migrations/002_partners_migration.sql
-- ZenTap: Partners Architecture & Partner Security Layer
-- Enables multi-partner tag ownership, partner PINs, lockout tracking, and activity audit.

-- 1. Create Partners Table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pin_hash TEXT NOT NULL,                                              -- hashed 6-digit PIN
  can_register BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT TRUE,
  reset_level TEXT NOT NULL DEFAULT 'needs_approval' CHECK (reset_level IN ('off', 'needs_approval', 'direct')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked', 'disabled')),
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partners_phone_idx ON public.partners (phone);
CREATE INDEX IF NOT EXISTS partners_status_idx ON public.partners (status);

-- 2. Link Tags to Partners (Cards Owned by Partner)
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tags_partner_idx ON public.tags (partner_id);

-- 3. Update / Ensure Partner Actions Table
CREATE TABLE IF NOT EXISTS public.partner_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  tag_code TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'pin_verify_success', 'pin_verify_fail', 'lockout', 'details_update', 'card_reset', 'partner_created', 'pin_reset'
  ip_address TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure partner_id column exists if table was created previously
ALTER TABLE public.partner_actions
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS partner_actions_partner_idx ON public.partner_actions (partner_id);
CREATE INDEX IF NOT EXISTS partner_actions_tag_idx ON public.partner_actions (lower(tag_code));
CREATE INDEX IF NOT EXISTS partner_actions_biz_idx ON public.partner_actions (business_id);

-- 4. Partner Management Functions
CREATE OR REPLACE FUNCTION sell_cards_to_partner(p_partner UUID, p_tag_ids UUID[])
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE public.tags
     SET partner_id = p_partner
   WHERE id = ANY(p_tag_ids);
   
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END $$;

CREATE OR REPLACE FUNCTION reset_partner_pin(p_partner UUID, p_new_pin_hash TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.partners
     SET pin_hash = p_new_pin_hash,
         failed_attempts = 0,
         locked_until = NULL,
         updated_at = NOW()
   WHERE id = p_partner;
END $$;

-- 5. Row Level Security
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_actions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.partners FROM public, anon, authenticated;
REVOKE ALL ON public.partner_actions FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION sell_cards_to_partner(UUID, UUID[]) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION reset_partner_pin(UUID, TEXT) FROM public, anon, authenticated;

GRANT ALL ON public.partners TO service_role;
GRANT ALL ON public.partner_actions TO service_role;
GRANT EXECUTE ON FUNCTION sell_cards_to_partner(UUID, UUID[]) TO service_role;
GRANT EXECUTE ON FUNCTION reset_partner_pin(UUID, TEXT) TO service_role;
