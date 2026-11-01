-- =========================================================================
-- ZenTap Migration 007: Manual Payments & Extended Business Product Fields
-- Version: 7.0
-- Adds dedicated manual_payments table and support for the 4 official products
-- =========================================================================

-- 1. Extend businesses table with selected_product and whatsapp_support_number if missing
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS selected_product TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_support_number TEXT;

-- 2. Manual Payments Table
CREATE TABLE IF NOT EXISTS public.manual_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  business_name TEXT,
  product_purchased TEXT NOT NULL,
  total_agreed_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(10, 2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(10, 2) GENERATED ALWAYS AS (total_agreed_amount - amount_received) STORED,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy queries by business or date
CREATE INDEX IF NOT EXISTS idx_manual_payments_business_id ON public.manual_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_manual_payments_payment_date ON public.manual_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_manual_payments_status ON public.manual_payments(payment_status);

-- 3. Row Level Security for manual_payments
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to manual_payments" ON public.manual_payments;
CREATE POLICY "Admins have full access to manual_payments"
  ON public.manual_payments
  FOR ALL
  USING (
    coalesce(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '') = 'admin'
    OR coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', '') IN (
      SELECT email FROM public.admin_users
    )
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '') = 'admin'
    OR coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', '') IN (
      SELECT email FROM public.admin_users
    )
  );
