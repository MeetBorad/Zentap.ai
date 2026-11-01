-- =========================================================================
-- MIGRATION 006: AI MODEL MANAGER + AUTO-FAILOVER
-- Non-destructive additive migration: new tables, columns, indexes, RLS
-- Scoped for multi-provider AI resilience with zero-breakage fallback
-- =========================================================================

-- 1. Create ai_models table
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'anthropic' | 'openai' | 'google' | 'openrouter' | 'openai_compatible'
    model_id TEXT NOT NULL,
    base_url TEXT,
    api_key_encrypted TEXT,
    priority INTEGER NOT NULL DEFAULT 1,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'standby', -- 'active' | 'standby' | 'exhausted' | 'cooldown' | 'disabled'
    cooldown_until TIMESTAMPTZ,
    monthly_budget_usd NUMERIC(10, 4),
    input_cost_per_1m NUMERIC(10, 4) DEFAULT 0.25,
    output_cost_per_1m NUMERIC(10, 4) DEFAULT 1.25,
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_models_priority 
    ON public.ai_models (enabled, priority, status);

-- 2. Create ai_settings single-row table
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    failover_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    manual_primary_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
    exhausted_retry_hours INTEGER NOT NULL DEFAULT 6,
    cooldown_seconds INTEGER NOT NULL DEFAULT 60,
    alert_email TEXT,
    last_failover_at TIMESTAMPTZ,
    last_failover_info TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default global settings row if empty
INSERT INTO public.ai_settings (id, failover_enabled, exhausted_retry_hours, cooldown_seconds)
VALUES ('global', TRUE, 6, 60)
ON CONFLICT (id) DO NOTHING;

-- 3. Create ai_model_usage telemetry table
CREATE TABLE IF NOT EXISTS public.ai_model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    generation_id UUID,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    est_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_type TEXT,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_model_usage_model 
    ON public.ai_model_usage (model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_model_usage_biz 
    ON public.ai_model_usage (business_id, created_at DESC);

-- 4. Add nullable columns to existing tables
ALTER TABLE public.review_generations 
    ADD COLUMN IF NOT EXISTS model_id UUID;

ALTER TABLE public.business_review_config 
    ADD COLUMN IF NOT EXISTS model_override_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL;

-- 5. Row Level Security Policies
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_usage ENABLE ROW LEVEL SECURITY;

-- Super admin / service role full access
DROP POLICY IF EXISTS "Superadmin full access to ai_models" ON public.ai_models;
CREATE POLICY "Superadmin full access to ai_models"
    ON public.ai_models FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to ai_settings" ON public.ai_settings;
CREATE POLICY "Superadmin full access to ai_settings"
    ON public.ai_settings FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access to ai_model_usage" ON public.ai_model_usage;
CREATE POLICY "Superadmin full access to ai_model_usage"
    ON public.ai_model_usage FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@zentapdigitalsolutions.com' OR auth.role() = 'service_role');

-- Service role / public insert for usage telemetry
DROP POLICY IF EXISTS "Insert access to ai_model_usage" ON public.ai_model_usage;
CREATE POLICY "Insert access to ai_model_usage"
    ON public.ai_model_usage FOR INSERT
    WITH CHECK (TRUE);
