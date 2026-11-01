-- ZenTap: Tag Layer Migration (Adapted for ZenTap Production DB)
-- Physical NFC Standees and Cards Layer with Dynamic Reassignment & Routing
-- Works safely with existing businesses and scans tables.

-- 1. Create Enums safely
DO $$ BEGIN
  CREATE TYPE tag_type AS ENUM ('review', 'whatsapp', 'instagram');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tag_form AS ENUM ('standee', 'card');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tag_destination AS ENUM ('zentap_page', 'direct');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Business Table Columns
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS google_review_link TEXT,
  ADD COLUMN IF NOT EXISTS review_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS valid_until DATE,
  ADD COLUMN IF NOT EXISTS service_valid_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS slug_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Synchronize alias columns
UPDATE public.businesses SET review_url = COALESCE(review_url, google_review_link) WHERE review_url IS NULL;
UPDATE public.businesses SET google_review_link = COALESCE(google_review_link, review_url) WHERE google_review_link IS NULL;
UPDATE public.businesses SET whatsapp = COALESCE(whatsapp, whatsapp_number) WHERE whatsapp IS NULL;
UPDATE public.businesses SET whatsapp_number = COALESCE(whatsapp_number, whatsapp) WHERE whatsapp_number IS NULL;
UPDATE public.businesses SET instagram = COALESCE(instagram, instagram_url) WHERE instagram IS NULL;
UPDATE public.businesses SET instagram_url = COALESCE(instagram_url, instagram) WHERE instagram_url IS NULL;

-- 3. Tag Code Sequence & Tags Table
CREATE SEQUENCE IF NOT EXISTS tag_code_seq START 1;

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,                                  -- permanent, lowercase printed hardware code (e.g. zt-0042)
  form tag_form NOT NULL DEFAULT 'standee',            -- physical item (standee or card)
  type tag_type,                                       -- null while unassigned / free in inventory
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  assignment_id UUID,                                  -- current open assignment
  destination tag_destination NOT NULL DEFAULT 'zentap_page',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  chip_written BOOLEAN NOT NULL DEFAULT FALSE,         -- verified written with NFC Tools
  label TEXT,                                          -- employee name / location note
  whatsapp_number TEXT,                                -- card: direct WhatsApp phone
  whatsapp_message TEXT,                               -- card: prefilled message
  instagram_handle TEXT,                               -- card: handle or URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tags_code_format CHECK (code ~ '^[a-z0-9][a-z0-9-]{1,63}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS tags_code_key ON public.tags (lower(code));
CREATE INDEX IF NOT EXISTS tags_business_idx ON public.tags (business_id);

-- 3b. Ensure chip_written, pin_hash, password_hash, reset_level exist if table already existed
ALTER TABLE public.tags 
  ADD COLUMN IF NOT EXISTS chip_written BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pin_hash TEXT DEFAULT '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_level TEXT;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS pin_hash TEXT DEFAULT '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3c. Partner / Owner Actions Audit Log
CREATE TABLE IF NOT EXISTS public.partner_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'pin_verify_success', 'pin_verify_fail', 'lockout', 'details_update', 'card_reset'
  ip_address TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_actions_tag_idx ON public.partner_actions (lower(tag_code));
CREATE INDEX IF NOT EXISTS partner_actions_biz_idx ON public.partner_actions (business_id);

-- 4. Tag Assignments History (preserves analytics when reassigned)
CREATE TABLE IF NOT EXISTS public.tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type tag_type NOT NULL,
  label TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS one_open_assignment_per_tag
  ON public.tag_assignments (tag_id) WHERE released_at IS NULL;

DO $$ BEGIN
  ALTER TABLE public.tags
    ADD CONSTRAINT tags_assignment_fk
    FOREIGN KEY (assignment_id) REFERENCES public.tag_assignments(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Scans Table Updates
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES public.tag_assignments(id) ON DELETE SET NULL;

-- Make visitor_hash optional for hardware scan logs
ALTER TABLE public.scans ALTER COLUMN visitor_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS scans_tag_idx ON public.scans (tag_id);
CREATE INDEX IF NOT EXISTS scans_assignment_idx ON public.scans (assignment_id);

-- 6. Atomic Admin Operations (Functions)
CREATE OR REPLACE FUNCTION generate_tag_batch(p_count INT, p_form tag_form DEFAULT 'standee')
RETURNS SETOF public.tags LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  i INT;
BEGIN
  IF p_count < 1 OR p_count > 500 THEN
    RAISE EXCEPTION 'count must be 1-500';
  END IF;

  FOR i IN 1..p_count LOOP
    RETURN QUERY
      INSERT INTO public.tags (code, form, chip_written)
      VALUES ('zt-' || lpad(nextval('tag_code_seq')::TEXT, 4, '0'), p_form, FALSE)
      RETURNING *;
  END LOOP;
END $$;

-- Create Single Tag (with optional custom code e.g. zt-0105 or legacy slug)
CREATE OR REPLACE FUNCTION create_single_tag(
  p_code TEXT DEFAULT NULL,
  p_form tag_form DEFAULT 'standee',
  p_chip_written BOOLEAN DEFAULT FALSE,
  p_business UUID DEFAULT NULL,
  p_type tag_type DEFAULT NULL
) RETURNS public.tags LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code TEXT;
  v_tag public.tags;
BEGIN
  IF p_code IS NOT NULL AND trim(p_code) <> '' THEN
    v_code := lower(trim(p_code));
    IF NOT (v_code ~ '^[a-z0-9][a-z0-9-]{1,63}$') THEN
      RAISE EXCEPTION 'code format invalid (only lowercase, digits, hyphens 2-64 chars)';
    END IF;
  ELSE
    v_code := 'zt-' || lpad(nextval('tag_code_seq')::TEXT, 4, '0');
  END IF;

  INSERT INTO public.tags (code, form, chip_written)
  VALUES (v_code, p_form, p_chip_written)
  RETURNING * INTO v_tag;

  IF p_business IS NOT NULL THEN
    PERFORM assign_tag(v_tag.id, p_business, COALESCE(p_type, 'review'::tag_type));
    SELECT * INTO v_tag FROM public.tags WHERE id = v_tag.id;
  END IF;

  RETURN v_tag;
END $$;

CREATE OR REPLACE FUNCTION release_tag(p_tag UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.tag_assignments
     SET released_at = NOW()
   WHERE tag_id = p_tag AND released_at IS NULL;

  UPDATE public.tags SET
    business_id = NULL,
    assignment_id = NULL,
    type = NULL,
    destination = 'zentap_page',
    active = TRUE,
    label = NULL,
    whatsapp_number = NULL,
    whatsapp_message = NULL,
    instagram_handle = NULL
   WHERE id = p_tag;
END $$;

CREATE OR REPLACE FUNCTION assign_tag(
  p_tag UUID,
  p_business UUID,
  p_type tag_type,
  p_label TEXT DEFAULT NULL,
  p_whatsapp_number TEXT DEFAULT NULL,
  p_whatsapp_message TEXT DEFAULT NULL,
  p_instagram_handle TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_assignment UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.businesses WHERE id = p_business AND deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'business is deleted';
  END IF;

  PERFORM release_tag(p_tag); -- wipes previous assignment while preserving history

  INSERT INTO public.tag_assignments (tag_id, business_id, type, label)
  VALUES (p_tag, p_business, p_type, p_label)
  RETURNING id INTO v_assignment;

  UPDATE public.tags SET
    business_id = p_business,
    assignment_id = v_assignment,
    type = p_type,
    label = p_label,
    whatsapp_number = p_whatsapp_number,
    whatsapp_message = p_whatsapp_message,
    instagram_handle = p_instagram_handle
   WHERE id = p_tag;
END $$;

-- Soft delete business: releases all attached tags, stamps deleted_at
CREATE OR REPLACE FUNCTION soft_delete_business(p_business UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  n INT := 0;
  t RECORD;
BEGIN
  FOR t IN SELECT id FROM public.tags WHERE business_id = p_business LOOP
    PERFORM release_tag(t.id);
    n := n + 1;
  END LOOP;
  UPDATE public.businesses SET deleted_at = NOW(), active = FALSE WHERE id = p_business;
  RETURN n;
END $$;

-- 7. Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_assignments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON FUNCTION generate_tag_batch(INT, tag_form) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION create_single_tag(TEXT, tag_form, BOOLEAN, UUID, tag_type) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION release_tag(UUID) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION assign_tag(UUID, UUID, tag_type, TEXT, TEXT, TEXT, TEXT) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION soft_delete_business(UUID) FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION generate_tag_batch(INT, tag_form) TO service_role;
GRANT EXECUTE ON FUNCTION create_single_tag(TEXT, tag_form, BOOLEAN, UUID, tag_type) TO service_role;
GRANT EXECUTE ON FUNCTION release_tag(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION assign_tag(UUID, UUID, tag_type, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION soft_delete_business(UUID) TO service_role;
