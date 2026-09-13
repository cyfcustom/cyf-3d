-- =====================================================
-- CYF Custom - Base Schema (catalog, designs, company)
-- Migration: 000_base_schema
-- =====================================================
-- Creates the base tables that 001+ assume to exist:
--   - products
--   - product_categories
--   - product_models
--   - saved_designs
--   - company_info
-- Plus the storage buckets used by the app.
--
-- Idempotent (CREATE TABLE IF NOT EXISTS): safe to re-run
-- and safe on databases where these tables were already
-- created manually via the dashboard (they are untouched).
--
-- NOTE: RLS hardening for these tables lives in
-- 005_rls_base_tables.sql, which runs after 001 (it needs
-- user_roles / get_user_role()).
-- =====================================================

-- ============================================================================
-- 1. products
--    Columns added by migration 002 (availability, min_order_qty,
--    lead_time_days, print_techniques, tags) are declared here so the
--    final schema is complete; 002's ADD COLUMN IF NOT EXISTS becomes a no-op.
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  base_price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  category         TEXT,
  description      TEXT,
  image_url        TEXT,
  is_customizable  BOOLEAN DEFAULT true,
  model_3d_url     TEXT,
  availability     TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'made_to_order', 'out_of_stock', 'discontinued')),
  min_order_qty    INTEGER NOT NULL DEFAULT 1,
  lead_time_days   INTEGER,
  print_techniques TEXT[],
  tags             TEXT[],
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Bring pre-existing (dashboard-created) products tables up to the base
-- schema before the indexes below. On fresh DBs and on DBs where 002 already
-- ran, every line is a no-op (ADD COLUMN IF NOT EXISTS).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'made_to_order', 'out_of_stock', 'discontinued')),
  ADD COLUMN IF NOT EXISTS min_order_qty INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
  ADD COLUMN IF NOT EXISTS print_techniques TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ============================================================================
-- 2. product_categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. product_models
--    ON DELETE RESTRICT matches the admin UI, which refuses to delete a
--    category that still has models.
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_models (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  model_url     TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_models_category ON product_models(category_id, sort_order);

-- ============================================================================
-- 4. saved_designs
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_designs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  name          TEXT,
  layers        JSONB NOT NULL DEFAULT '[]'::jsonb,
  configuration JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_designs_user ON saved_designs(user_id, created_at DESC);

-- ============================================================================
-- 5. company_info (singleton row used across pages + 003's channel seed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_info (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL DEFAULT 'CYF Custom',
  slogan                    TEXT NOT NULL DEFAULT 'Amor para ayudar',
  phone                     TEXT NOT NULL DEFAULT '584124553107',
  email                     TEXT NOT NULL DEFAULT 'contacto@cyfcustoms.com',
  instagram_url             TEXT,
  facebook_url              TEXT,
  whatsapp_message_template TEXT NOT NULL DEFAULT '¡Hola CYF Custom! 👋',
  address                   TEXT NOT NULL DEFAULT 'Mérida, Venezuela',
  zelle_email               TEXT,
  bank_rif                  TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- Seed defaults only if the table is empty (keeps existing dashboard rows)
INSERT INTO company_info (name, slogan, phone, email, instagram_url, facebook_url, whatsapp_message_template, address, zelle_email, bank_rif)
SELECT 'CYF Custom', 'Amor para ayudar', '584124553107', 'contacto@cyfcustoms.com',
       'https://instagram.com/cyfcustoms', 'https://facebook.com/cyfcustoms',
       '¡Hola CYF Custom! 👋', 'Mérida, Venezuela', 'pagos@cyfcustoms.com', 'J-000000000'
WHERE NOT EXISTS (SELECT 1 FROM company_info LIMIT 1);

-- ============================================================================
-- 6. Storage buckets used by the app
--    models:        public 3D model files (glb + thumbnails)
--    payment-proofs: private proof uploads (10MB, images/pdf per migration 002)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('models', 'models', true, NULL, NULL),
  ('payment-proofs', 'payment-proofs', false, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;