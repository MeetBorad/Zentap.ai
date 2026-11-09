-- supabase/migrations/016_business_context.sql
-- Business Context & Review Intelligence table for multi-tiered grounding (Owner > Website > Grounding)

CREATE TABLE IF NOT EXISTS public.business_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL UNIQUE,
  business_name TEXT,
  category TEXT,
  area TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  keywords JSONB DEFAULT '[]'::jsonb,
  website_url TEXT,
  source TEXT DEFAULT 'owner',
  confidence NUMERIC DEFAULT 1.0,
  refreshed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_business_context_business_id ON public.business_context (business_id);
CREATE INDEX IF NOT EXISTS idx_business_context_refreshed_at ON public.business_context (refreshed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.business_context ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated read for review generation
CREATE POLICY "Allow public read access to business context"
  ON public.business_context
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full management
CREATE POLICY "Allow service role full access to business context"
  ON public.business_context
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

