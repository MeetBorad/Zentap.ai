-- =========================================================================
-- ZenTap.ai Production Database Schema & RLS Policies (Postgres / Supabase)
-- Version: 2.2 (Conflict-Safe Migration)
-- Handles existing legacy schema and replaces old empty subscriptions table.
-- =========================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop legacy conflicting empty tables from v1 schema if present
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- -------------------------------------------------------------------------
-- 0. Admin Users Registry
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default admin emails
INSERT INTO public.admin_users (email)
VALUES ('admin@zentap.ai'), ('meet@zentap.ai')
ON CONFLICT (email) DO NOTHING;

-- Helper function to check if requesting user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '') = 'admin'
    OR coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', '') IN (
      SELECT email FROM public.admin_users
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------------------
-- 1. Businesses Table (Private Merchant Records)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  address TEXT,
  category TEXT,
  gbp_link TEXT,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT CHECK (plan IN ('card_500', 'standee_1500', 'standee_auto_2000')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  review_url TEXT, -- NULL until admin configures it
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 2. Public Safe View for Assistant Pages (Protects Owner Privacy)
-- Anonymous visitors can ONLY see public venue details, never private emails/phones/plans.
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_businesses WITH (security_barrier = true) AS
SELECT 
  id,
  name,
  slug,
  review_url,
  active,
  category,
  city,
  address
FROM public.businesses
WHERE active = true;

-- Grant public read access to the safe view
GRANT SELECT ON public.public_businesses TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 3. Scans Table (Deduplicated visitor scan telemetry)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  source TEXT CHECK (source IN ('qr', 'nfc')) NOT NULL,
  visitor_hash TEXT NOT NULL,
  is_preview BOOLEAN DEFAULT FALSE NOT NULL,
  scanned_date DATE DEFAULT CURRENT_DATE NOT NULL,
  at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 4. Events Table (Rating taps, review clicks, private feedback events)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('rating', 'review_click', 'private_feedback')) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 5. Feedback Table (Confidential 1-2 star feedback for owners)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  text TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 6. Orders Table (Hardware purchase records)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  courier NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'in_production', 'shipped', 'delivered')),
  razorpay_id TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  tracking_number TEXT,
  courier_name TEXT,
  estimated_delivery TEXT,
  at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 7. Courier Rules Table (Configurable flat rate by zone)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courier_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  pincode_prefixes TEXT[] NOT NULL,
  rate NUMERIC(10, 2) NOT NULL,
  estimated_days TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

-- Seed standard courier rules
INSERT INTO public.courier_rules (zone_name, pincode_prefixes, rate, estimated_days, is_default)
VALUES 
  ('West Region (Priority Next-Day)', ARRAY['38', '39', '36', '37'], 69.00, '1-2 Days', false),
  ('Metro / Major Express Zones', ARRAY['1', '2', '4', '5', '6'], 99.00, '2-4 Days', true),
  ('Remote / Special Delivery Zones', ARRAY['7', '8', '9'], 149.00, '4-6 Days', false)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------------
-- 8. Subscriptions Table (Razorpay Recurring Billing)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  razorpay_subscription_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  monthly_amount NUMERIC(10, 2) DEFAULT 1000.00 NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'cancelled', 'halted', 'failed')),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- Indexes for High-Speed Routing & Real-Time Analytics
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_scans_biz_date ON public.scans(business_id, scanned_date);
CREATE INDEX IF NOT EXISTS idx_scans_visitor ON public.scans(visitor_hash);
CREATE INDEX IF NOT EXISTS idx_events_biz ON public.events(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_biz ON public.feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_biz ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_biz ON public.subscriptions(business_id);

-- -------------------------------------------------------------------------
-- Row Level Security (RLS) Configuration
-- -------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Businesses Table Policies
DROP POLICY IF EXISTS "Owners can view own business" ON public.businesses;
CREATE POLICY "Owners can view own business"
  ON public.businesses FOR SELECT
  USING (auth.uid() = owner_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Owners can insert own business" ON public.businesses;
CREATE POLICY "Owners can insert own business"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;
CREATE POLICY "Owners can update own business"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_user_id OR public.is_admin());

-- 2. Scans & Events Policies
DROP POLICY IF EXISTS "Public can insert scans" ON public.scans;
CREATE POLICY "Public can insert scans"
  ON public.scans FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert events" ON public.events;
CREATE POLICY "Public can insert events"
  ON public.events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view their scans" ON public.scans;
CREATE POLICY "Owners can view their scans"
  ON public.scans FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Owners can view their events" ON public.events;
CREATE POLICY "Owners can view their events"
  ON public.events FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
    OR public.is_admin()
  );

-- 3. Feedback Policies (Private to Owner & Admin)
DROP POLICY IF EXISTS "Public can submit private feedback" ON public.feedback;
CREATE POLICY "Public can submit private feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view their private feedback" ON public.feedback;
CREATE POLICY "Owners can view their private feedback"
  ON public.feedback FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
    OR public.is_admin()
  );

-- 4. Orders Policies
DROP POLICY IF EXISTS "Owners can view own orders" ON public.orders;
CREATE POLICY "Owners can view own orders"
  ON public.orders FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- 5. Courier Rules Policies
DROP POLICY IF EXISTS "Anyone can view courier rules" ON public.courier_rules;
CREATE POLICY "Anyone can view courier rules"
  ON public.courier_rules FOR SELECT
  USING (true);

-- 6. Subscriptions Policies
DROP POLICY IF EXISTS "Owners can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Owners can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_user_id = auth.uid())
    OR public.is_admin()
  );
