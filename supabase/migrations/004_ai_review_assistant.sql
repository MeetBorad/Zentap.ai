-- =========================================================================
-- MIGRATION 004: AI REVIEW ASSISTANT SUITE
-- Non-destructive additions: new tables, enum types, indexes, and RLS policies
-- Everything is scoped per-business behind the `ai_review_enabled` flag.
-- =========================================================================

-- 1. Enum Types (Safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_language') THEN
        CREATE TYPE review_language AS ENUM ('english', 'hinglish', 'gujarati_roman', 'hindi_roman', 'mixed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_tone') THEN
        CREATE TYPE review_tone AS ENUM ('friendly', 'professional', 'casual', 'warm');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_length') THEN
        CREATE TYPE review_length AS ENUM ('short', 'medium', 'long');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_option_kind') THEN
        CREATE TYPE review_option_kind AS ENUM ('product', 'aspect');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_event_type') THEN
        CREATE TYPE review_event_type AS ENUM ('copied', 'opened_google');
    END IF;
END $$;

-- 2. Business Review Configuration Table
CREATE TABLE IF NOT EXISTS public.business_review_config (
    business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
    ai_review_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    language review_language NOT NULL DEFAULT 'english',
    tone review_tone NOT NULL DEFAULT 'friendly',
    default_length review_length NOT NULL DEFAULT 'medium',
    highlights TEXT DEFAULT '',
    facebook_url TEXT,
    website_url TEXT,
    address TEXT,
    google_review_link TEXT,
    show_icons JSONB NOT NULL DEFAULT '{"instagram": true, "whatsapp": true, "facebook": true, "website": true}'::jsonb,
    monthly_generation_cap INTEGER NOT NULL DEFAULT 300,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rapid lookup
CREATE INDEX IF NOT EXISTS idx_business_review_config_enabled 
    ON public.business_review_config (ai_review_enabled);

-- 3. Review Options (Products & Aspects configured per business)
CREATE TABLE IF NOT EXISTS public.review_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    kind review_option_kind NOT NULL DEFAULT 'aspect',
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_options_biz_kind 
    ON public.review_options (business_id, kind, active, sort_order);

-- 4. Review Generations (Log of generated drafts for telemetry & deduplication)
CREATE TABLE IF NOT EXISTS public.review_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    tag_id TEXT,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    length review_length NOT NULL DEFAULT 'medium',
    language review_language NOT NULL DEFAULT 'english',
    option_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    output_text TEXT NOT NULL,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_generations_biz_time 
    ON public.review_generations (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_generations_ip_time 
    ON public.review_generations (ip_hash, created_at DESC);

-- 5. Review Events (Tracking when customers copy or open Google)
CREATE TABLE IF NOT EXISTS public.review_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    generation_id UUID REFERENCES public.review_generations(id) ON DELETE SET NULL,
    event review_event_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_events_biz_event 
    ON public.review_events (business_id, event, created_at DESC);

-- 6. Private Feedback Table (for 1-3 star secondary feedback)
CREATE TABLE IF NOT EXISTS public.private_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    feedback_text TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    tag_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_private_feedback_biz 
    ON public.private_feedback (business_id, created_at DESC);

-- 7. Row Level Security (RLS)
ALTER TABLE public.business_review_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_feedback ENABLE ROW LEVEL SECURITY;

-- Public read for active config and active review options
DROP POLICY IF EXISTS "Public can read business review config" ON public.business_review_config;
CREATE POLICY "Public can read business review config"
    ON public.business_review_config FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Public can read active review options" ON public.review_options;
CREATE POLICY "Public can read active review options"
    ON public.review_options FOR SELECT
    USING (active = TRUE);

-- Super admin / service role has full access
DROP POLICY IF EXISTS "Superadmin full access to review config" ON public.business_review_config;
CREATE POLICY "Superadmin full access to review config"
    ON public.business_review_config FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to review options" ON public.review_options;
CREATE POLICY "Superadmin full access to review options"
    ON public.review_options FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to generations" ON public.review_generations;
CREATE POLICY "Superadmin full access to generations"
    ON public.review_generations FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to review events" ON public.review_events;
CREATE POLICY "Superadmin full access to review events"
    ON public.review_events FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to private feedback" ON public.private_feedback;
CREATE POLICY "Superadmin full access to private feedback"
    ON public.private_feedback FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

-- Public insert policies for telemetry and private feedback
DROP POLICY IF EXISTS "Public can insert review events" ON public.review_events;
CREATE POLICY "Public can insert review events"
    ON public.review_events FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can submit private feedback" ON public.private_feedback;
CREATE POLICY "Public can submit private feedback"
    ON public.private_feedback FOR INSERT
    WITH CHECK (TRUE);

-- 8. Seed Standard Aspect Presets Function
CREATE OR REPLACE FUNCTION public.seed_default_review_presets(target_biz_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.review_options (business_id, kind, label, sort_order, active)
    VALUES
        (target_biz_id, 'aspect', 'Cleanliness', 1, TRUE),
        (target_biz_id, 'aspect', 'Nice Staff', 2, TRUE),
        (target_biz_id, 'aspect', 'Good Behaviour', 3, TRUE),
        (target_biz_id, 'aspect', 'Excellent Quality', 4, TRUE),
        (target_biz_id, 'aspect', 'Fair Pricing', 5, TRUE),
        (target_biz_id, 'aspect', 'Fast Service', 6, TRUE),
        (target_biz_id, 'aspect', 'Good Ambience', 7, TRUE),
        (target_biz_id, 'aspect', 'Value for Money', 8, TRUE),
        (target_biz_id, 'aspect', 'Hygiene', 9, TRUE),
        (target_biz_id, 'aspect', 'Professional Team', 10, TRUE),
        (target_biz_id, 'aspect', 'On-time Delivery', 11, TRUE),
        (target_biz_id, 'aspect', 'Easy Parking', 12, TRUE)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
