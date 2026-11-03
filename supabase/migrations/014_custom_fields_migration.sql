-- supabase/migrations/014_custom_fields_migration.sql
-- Add custom_fields JSONB column to clients and deleted_businesses for arbitrary user-defined business options

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.deleted_businesses
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_clients_custom_fields ON public.clients USING gin (custom_fields);
