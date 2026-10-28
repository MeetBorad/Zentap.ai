-- ZenTap.ai Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Businesses / Merchants Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  google_review_url TEXT,
  yelp_url TEXT,
  tripadvisor_url TEXT,
  wifi_url TEXT,
  avg_rating NUMERIC(3, 2) DEFAULT 5.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Standees Hardware Table
CREATE TABLE IF NOT EXISTS public.standees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial TEXT UNIQUE NOT NULL, -- e.g. ZT-8821-A
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL, -- e.g. Front Checkout Counter
  model TEXT DEFAULT 'Matte Obsidian Acrylic',
  status TEXT DEFAULT 'online', -- online, idle, offline
  signal_strength INTEGER DEFAULT 99,
  battery_pct INTEGER DEFAULT 100,
  active_destination TEXT DEFAULT 'google', -- google, yelp, tripadvisor, wifi
  destination_url TEXT NOT NULL,
  taps_total INTEGER DEFAULT 0,
  taps_today INTEGER DEFAULT 0,
  last_tap_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  standee_id UUID REFERENCES public.standees(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  source TEXT DEFAULT 'google', -- google, private_intercept
  sentiment TEXT DEFAULT 'positive', -- positive, neutral, negative
  status TEXT DEFAULT 'published', -- published, intercepted, replied
  ai_suggested_reply TEXT,
  owner_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tap Telemetry Events Log
CREATE TABLE IF NOT EXISTS public.tap_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  standee_id UUID REFERENCES public.standees(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_standees_serial ON public.standees(serial);
CREATE INDEX IF NOT EXISTS idx_standees_business ON public.standees(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_tap_events_standee ON public.tap_events(standee_id);
CREATE INDEX IF NOT EXISTS idx_tap_events_created ON public.tap_events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tap_events ENABLE ROW LEVEL SECURITY;

-- Public read access policies for reviews and standee routing
CREATE POLICY "Public read access to businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Public read access to standees" ON public.standees FOR SELECT USING (true);
CREATE POLICY "Public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public insert tap telemetry" ON public.tap_events FOR INSERT WITH CHECK (true);
