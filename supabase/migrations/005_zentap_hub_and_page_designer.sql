-- =========================================================================
-- MIGRATION 005: ZENTAP HUB PAGE + PAGE DESIGNER + ENHANCED AI REVIEW
-- Non-destructive additive migration: new tables, columns, indexes, RLS
-- Scoped behind per-business flag `hub_enabled` (default false)
-- =========================================================================

-- 1. Create page_design table
CREATE TABLE IF NOT EXISTS public.page_design (
    business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
    hub_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    logo_url TEXT,
    cover_url TEXT,
    tagline TEXT,
    address TEXT,
    maps_link TEXT,
    theme_preset TEXT NOT NULL DEFAULT 'modern_slate',
    primary_color TEXT NOT NULL DEFAULT '#ff7a00',
    accent_color TEXT NOT NULL DEFAULT '#ff7a00',
    bg_color TEXT NOT NULL DEFAULT '#0e1015',
    font TEXT NOT NULL DEFAULT 'Inter',
    button_style TEXT NOT NULL DEFAULT 'rounded', -- 'rounded' | 'pill' | 'square'
    card_style TEXT NOT NULL DEFAULT 'glass', -- 'glass' | 'flat' | 'elevated' | 'bordered'
    dark_mode TEXT NOT NULL DEFAULT 'dark', -- 'light' | 'dark' | 'auto'
    show_powered_by BOOLEAN NOT NULL DEFAULT TRUE,
    page_language TEXT NOT NULL DEFAULT 'en',
    texts JSONB NOT NULL DEFAULT '{
        "write_review_btn": "Write a Review",
        "call_btn": "Call",
        "directions_btn": "Directions",
        "about_heading": "About Us",
        "photos_heading": "Gallery",
        "offers_heading": "Special Offers",
        "hours_heading": "Opening Hours",
        "faqs_heading": "Frequently Asked Questions",
        "testimonials_heading": "Customer Stories",
        "disclaimer": "Honest reviews help real businesses grow."
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_design_hub_enabled 
    ON public.page_design (hub_enabled);

-- 2. Create page_buttons table
CREATE TABLE IF NOT EXISTS public.page_buttons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'review', 'whatsapp', 'instagram', 'facebook', 'youtube', 'call', 'directions', 'website', 'email', 'menu', 'booking', 'maps', 'custom'
    label TEXT NOT NULL,
    url_or_value TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_buttons_biz 
    ON public.page_buttons (business_id, visible, sort_order);

-- 3. Create page_sections table
CREATE TABLE IF NOT EXISTS public.page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'about', 'photos', 'offers', 'hours', 'faqs', 'testimonials', 'video'
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_sections_biz 
    ON public.page_sections (business_id, visible, sort_order);

-- 4. Create page_photos table
CREATE TABLE IF NOT EXISTS public.page_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_photos_biz 
    ON public.page_photos (business_id, sort_order);

-- 5. Add new fields to business_review_config (additive)
ALTER TABLE public.business_review_config 
    ADD COLUMN IF NOT EXISTS suggestions_count INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN IF NOT EXISTS voice_input_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 6. Create click_events table (tracking all button taps on Hub with source)
CREATE TABLE IF NOT EXISTS public.click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    button_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'web', -- 'qr' | 'nfc' | 'web'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_events_biz 
    ON public.click_events (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_type 
    ON public.click_events (business_id, button_type, created_at DESC);

-- 7. Row Level Security Policies
ALTER TABLE public.page_design ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Public can read visible page design, buttons, sections, photos
DROP POLICY IF EXISTS "Public can read page_design" ON public.page_design;
CREATE POLICY "Public can read page_design"
    ON public.page_design FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Public can read visible page_buttons" ON public.page_buttons;
CREATE POLICY "Public can read visible page_buttons"
    ON public.page_buttons FOR SELECT
    USING (visible = TRUE);

DROP POLICY IF EXISTS "Public can read visible page_sections" ON public.page_sections;
CREATE POLICY "Public can read visible page_sections"
    ON public.page_sections FOR SELECT
    USING (visible = TRUE);

DROP POLICY IF EXISTS "Public can read page_photos" ON public.page_photos;
CREATE POLICY "Public can read page_photos"
    ON public.page_photos FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Public can insert click_events" ON public.click_events;
CREATE POLICY "Public can insert click_events"
    ON public.click_events FOR INSERT
    WITH CHECK (TRUE);

-- Super admin / service role full access
DROP POLICY IF EXISTS "Superadmin full access to page_design" ON public.page_design;
CREATE POLICY "Superadmin full access to page_design"
    ON public.page_design FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to page_buttons" ON public.page_buttons;
CREATE POLICY "Superadmin full access to page_buttons"
    ON public.page_buttons FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to page_sections" ON public.page_sections;
CREATE POLICY "Superadmin full access to page_sections"
    ON public.page_sections FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to page_photos" ON public.page_photos;
CREATE POLICY "Superadmin full access to page_photos"
    ON public.page_photos FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to click_events" ON public.click_events;
CREATE POLICY "Superadmin full access to click_events"
    ON public.click_events FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');
