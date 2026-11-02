-- supabase/migrations/013_drop_unnecessary_tables.sql
-- Drop unnecessary, obsolete, and empty legacy tables so Supabase shows only active tables.

-- 1. Legacy duplicate deleted audit tables (superseded by unified deleted_at / deleted_by on primary tables)
DROP TABLE IF EXISTS public.deleted_businesses CASCADE;
DROP TABLE IF EXISTS public.deleted_payments CASCADE;
DROP TABLE IF EXISTS public.deleted_google_review_links CASCADE;
DROP TABLE IF EXISTS public.deleted_social_links CASCADE;
DROP TABLE IF EXISTS public.deleted_qr_nfc_tags CASCADE;
DROP TABLE IF EXISTS public.deleted_page_editor_configs CASCADE;

-- 2. Legacy prototypes & abandoned tables from early iterations
DROP TABLE IF EXISTS public.manual_payments CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.partner_actions CASCADE;
DROP TABLE IF EXISTS public.tag_assignments CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.reset_requests CASCADE;
DROP TABLE IF EXISTS public.business_review_config CASCADE;
DROP TABLE IF EXISTS public.review_options CASCADE;
DROP TABLE IF EXISTS public.review_generations CASCADE;
DROP TABLE IF EXISTS public.review_events CASCADE;
DROP TABLE IF EXISTS public.private_feedback CASCADE;
DROP TABLE IF EXISTS public.page_design CASCADE;
DROP TABLE IF EXISTS public.page_buttons CASCADE;
DROP TABLE IF EXISTS public.page_sections CASCADE;
DROP TABLE IF EXISTS public.page_photos CASCADE;
DROP TABLE IF EXISTS public.click_events CASCADE;
DROP TABLE IF EXISTS public.ai_models CASCADE;
DROP TABLE IF EXISTS public.ai_model_usage CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
