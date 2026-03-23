-- =====================================================
-- CYF Custom - Ecommerce Orders Layer
-- Migration: 002_ecommerce_orders
-- =====================================================
-- Creates / extends tables for:
--   - products (add availability columns)
--   - orders
--   - order_items
--   - order_status_history
--   - payment_proofs
-- =====================================================

-- ============================================================================
-- 1. Extend products table
-- ============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'made_to_order', 'out_of_stock', 'discontinued')),
  ADD COLUMN IF NOT EXISTS min_order_qty INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
  ADD COLUMN IF NOT EXISTS print_techniques TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ============================================================================
-- 2. Order number sequence
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CYF-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. orders
-- NOTE: This table may already exist from the configurator flow (SuccessModal).
--       CREATE TABLE IF NOT EXISTS handles new installs.
--       The ALTER TABLE block below adds columns missing from the old schema.
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name   TEXT,
  product_color  TEXT,
  product_size   TEXT,
  screenshot_url TEXT,
  status         TEXT NOT NULL DEFAULT 'pending_payment',
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Add all new columns idempotently (no-op if column already exists)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number    TEXT,
  ADD COLUMN IF NOT EXISTS user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS guest_name      TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone     TEXT,
  ADD COLUMN IF NOT EXISTS guest_email     TEXT,
  ADD COLUMN IF NOT EXISTS subtotal_usd    NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_bs     NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS exchange_rate_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS delivery_address JSONB,
  ADD COLUMN IF NOT EXISTS delivery_notes  TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS confirmed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipped_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at    TIMESTAMPTZ;

-- Backfill order_number for any existing rows that don't have one
UPDATE orders SET order_number = generate_order_number() WHERE order_number IS NULL;

-- Now make order_number unique and non-null (safe after backfill)
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT generate_order_number();
ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4. order_items
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
  saved_design_id   UUID REFERENCES saved_designs(id) ON DELETE SET NULL,
  -- snapshot at order time
  product_name      TEXT NOT NULL,
  product_image_url TEXT,
  print_technique   TEXT,
  size              TEXT,
  color             TEXT,
  custom_notes      TEXT,
  -- pricing
  quantity          INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_usd    NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- total_price_usd generated as quantity * unit_price_usd
  total_price_usd   NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price_usd) STORED,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================================
-- 5. order_status_history (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_by  UUID REFERENCES auth.users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at DESC);

-- Auto-insert status history on status change
CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS orders_status_history ON orders;
CREATE TRIGGER orders_status_history
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION record_order_status_change();

-- ============================================================================
-- 6. payment_proofs
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_proofs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  file_name       TEXT,
  file_size       INTEGER,
  mime_type       TEXT,
  uploaded_by     UUID REFERENCES auth.users(id),
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  review_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  rejection_note  TEXT,
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_order ON payment_proofs(order_id, uploaded_at DESC);

-- ============================================================================
-- 7. Row Level Security
-- Using DROP POLICY IF EXISTS before CREATE to make the script re-runnable.
-- ============================================================================

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_orders" ON orders;
CREATE POLICY "users_insert_own_orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "users_update_own_pending" ON orders;
CREATE POLICY "users_update_own_pending" ON orders
  FOR UPDATE USING (
    user_id = auth.uid()
    AND status IN ('pending_payment', 'proof_rejected')
  );

DROP POLICY IF EXISTS "admin_manage_orders" ON orders;
CREATE POLICY "admin_manage_orders" ON orders
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "public_read_by_id" ON orders;
CREATE POLICY "public_read_by_id" ON orders
  FOR SELECT USING (true);

-- order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_items" ON order_items;
CREATE POLICY "users_read_own_items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "users_insert_own_items" ON order_items;
CREATE POLICY "users_insert_own_items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL))
  );

DROP POLICY IF EXISTS "admin_manage_items" ON order_items;
CREATE POLICY "admin_manage_items" ON order_items
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "public_read_items_by_order" ON order_items;
CREATE POLICY "public_read_items_by_order" ON order_items
  FOR SELECT USING (true);

-- order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_history" ON order_status_history;
CREATE POLICY "users_read_own_history" ON order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_read_all_status_history" ON order_status_history;
CREATE POLICY "admin_read_all_status_history" ON order_status_history
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "public_read_status_history" ON order_status_history;
CREATE POLICY "public_read_status_history" ON order_status_history
  FOR SELECT USING (true);

-- payment_proofs
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_upload_own_proof" ON payment_proofs;
CREATE POLICY "users_upload_own_proof" ON payment_proofs
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "users_read_own_proofs" ON payment_proofs;
CREATE POLICY "users_read_own_proofs" ON payment_proofs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_manage_proofs" ON payment_proofs;
CREATE POLICY "admin_manage_proofs" ON payment_proofs
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- 8. Storage bucket instructions (run manually in Supabase dashboard)
-- ============================================================================
-- Create bucket: payment-proofs
--   public: false
--   file size limit: 10485760 (10MB)
--   allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
--
-- Storage RLS (via dashboard Policies tab on the bucket):
--   INSERT: bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL
--   SELECT: get_user_role(auth.uid()) = 'admin'
--           OR (storage.foldername(name))[1] IN (
--             SELECT id::text FROM orders WHERE user_id = auth.uid()
--           )
