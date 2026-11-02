-- supabase/migrations/012_single_source_of_truth_tags.sql
-- Unified Single Source of Truth for QR/NFC Tags, Standees and Cards

-- 1. Extend qr_nfc_tags with destination routing columns
ALTER TABLE public.qr_nfc_tags
  ADD COLUMN IF NOT EXISTS google_review_link TEXT,
  ADD COLUMN IF NOT EXISTS destination TEXT DEFAULT 'not_assigned',
  ADD COLUMN IF NOT EXISTS social_platform TEXT DEFAULT 'N/A',
  ADD COLUMN IF NOT EXISTS social_link TEXT;

-- 2. Extend clients with google_review_link if not present
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS google_review_link TEXT;

-- 3. Dedicated sequence table for concurrency-safe tag generation
CREATE TABLE IF NOT EXISTS public.tag_sequences (
  product_type TEXT PRIMARY KEY,
  prefix TEXT NOT NULL,
  last_val INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial sequences
INSERT INTO public.tag_sequences (product_type, prefix, last_val)
VALUES
  ('Counter Standee', 'ST', 0),
  ('Business NFC Card', 'CRD', 0)
ON CONFLICT (product_type) DO NOTHING;

-- Synchronize last_val with existing data in qr_nfc_tags
UPDATE public.tag_sequences ts
SET last_val = COALESCE((
  SELECT MAX(NULLIF(SUBSTRING(tag_id FROM '[0-9]+'), '')::INT)
  FROM public.qr_nfc_tags
  WHERE tag_id ~ ('^' || ts.prefix || '[0-9]+$')
), 0);

-- Enable RLS on tag_sequences
ALTER TABLE public.tag_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on tag_sequences" ON public.tag_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read on tag_sequences" ON public.tag_sequences FOR SELECT TO anon USING (true);

-- 4. Atomic batch tag generation function
-- Guaranteed all-or-nothing, concurrent-safe with SELECT FOR UPDATE
CREATE OR REPLACE FUNCTION public.generate_tags_batch(
  p_product_type TEXT,
  p_count INT,
  p_business_id TEXT DEFAULT NULL,
  p_business_name TEXT DEFAULT NULL
)
RETURNS SETOF public.qr_nfc_tags
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix TEXT;
  v_start_val INT;
  v_end_val INT;
  v_curr_val INT;
  v_tag_id TEXT;
  v_link TEXT;
  v_base_url TEXT := 'https://www.zentapdigitalsolutions.com';
BEGIN
  -- Strict server-side bounds check: 1 to 100
  IF p_count < 1 OR p_count > 100 THEN
    RAISE EXCEPTION 'Batch quantity must be between 1 and 100 (received %)', p_count;
  END IF;

  IF p_product_type NOT IN ('Counter Standee', 'Business NFC Card') THEN
    RAISE EXCEPTION 'Invalid product type: %', p_product_type;
  END IF;

  -- Atomic row lock on sequence record prevents any collision
  SELECT prefix, last_val INTO v_prefix, v_start_val
  FROM public.tag_sequences
  WHERE product_type = p_product_type
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sequence not configured for product type: %', p_product_type;
  END IF;

  v_end_val := v_start_val + p_count;

  -- Update atomic counter
  UPDATE public.tag_sequences
  SET last_val = v_end_val,
      updated_at = now()
  WHERE product_type = p_product_type;

  -- Insert all tags in this batch transaction
  FOR v_curr_val IN (v_start_val + 1) .. v_end_val LOOP
    v_tag_id := v_prefix || v_curr_val;
    v_link := v_base_url || '/t/' || v_tag_id;

    RETURN QUERY
    INSERT INTO public.qr_nfc_tags (
      tag_id,
      product_type,
      business_id,
      business_name,
      link,
      scans_count,
      destination,
      social_platform
    )
    VALUES (
      v_tag_id,
      p_product_type,
      p_business_id,
      p_business_name,
      v_link,
      0,
      'not_assigned',
      CASE WHEN p_product_type = 'Business NFC Card' THEN 'N/A' ELSE NULL END
    )
    RETURNING *;
  END LOOP;
END;
$$;

-- 5. Views for Google Links & Social Links showing "Moved" is a VIEW, NOT a copy!
CREATE OR REPLACE VIEW public.google_links_view AS
SELECT 
  t.id,
  t.tag_id,
  t.business_id,
  COALESCE(c.business_name, t.business_name, '') AS business_name,
  t.link AS link_of_tag_id,
  COALESCE(t.google_review_link, c.google_review_link, '') AS business_google_review_link,
  COALESCE(t.destination, 'not_assigned') AS destination,
  -- Dynamic setup status worked out on the fly
  CASE 
    WHEN COALESCE(t.google_review_link, c.google_review_link, '') ~* '^https?://.+' THEN 'completed'
    ELSE 'pending'
  END AS setup_status,
  t.scans_count AS total_scans,
  t.created_at,
  t.updated_at,
  t.deleted_at,
  t.deleted_by
FROM public.qr_nfc_tags t
LEFT JOIN public.clients c ON t.business_id = c.business_id
WHERE t.product_type = 'Counter Standee'
  AND t.business_id IS NOT NULL;

CREATE OR REPLACE VIEW public.social_links_view AS
SELECT 
  t.id,
  t.tag_id,
  t.business_id,
  COALESCE(c.business_name, t.business_name, '') AS business_name,
  COALESCE(t.social_platform, 'N/A') AS social_platform,
  t.link AS link_of_tag_id,
  COALESCE(t.social_link, '') AS social_link,
  COALESCE(t.destination, 'not_assigned') AS destination,
  -- Dynamic setup status worked out on the fly
  CASE 
    WHEN t.social_platform IN ('WhatsApp', 'Instagram', 'Facebook') 
     AND COALESCE(t.social_link, '') ~* '^(https?://|wa\.me/).+' THEN 'completed'
    ELSE 'pending'
  END AS setup_status,
  t.scans_count AS total_scans,
  t.created_at,
  t.updated_at,
  t.deleted_at,
  t.deleted_by
FROM public.qr_nfc_tags t
LEFT JOIN public.clients c ON t.business_id = c.business_id
WHERE t.product_type = 'Business NFC Card'
  AND t.business_id IS NOT NULL;
