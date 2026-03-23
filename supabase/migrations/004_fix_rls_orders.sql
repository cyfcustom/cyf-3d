-- ============================================================
-- 004_fix_rls_orders.sql
-- Security patch: tighten RLS on orders, order_items,
-- order_status_history, and payment_proofs
--
-- Fixes:
--   SEC-1: public_read_by_id exposed ALL orders (incl. PII of
--          authenticated users) to anonymous visitors.
--          Replaced with scoped guest-only read policy.
--   SEC-2: proof upload policy allowed any authenticated user
--          to upload proofs to guest orders. Tightened to:
--            - auth users → only their own orders
--            - anon users → only guest orders (user_id IS NULL)
--   SEC-3: no SELECT policy on payment_proofs for guest orders.
--          Added scoped anon read for guest-order proofs.
--
-- Idempotent: safe to re-run
-- ============================================================

-- ── orders ────────────────────────────────────────────────────────────────

-- SEC-1: remove the blanket USING (true) policy
DROP POLICY IF EXISTS "public_read_by_id" ON orders;

-- Replace with: anon users can only read GUEST orders (user_id IS NULL).
-- Authenticated users still use the existing "users_read_own_orders" policy.
DROP POLICY IF EXISTS "anon_read_guest_orders" ON orders;
CREATE POLICY "anon_read_guest_orders" ON orders
  FOR SELECT USING (user_id IS NULL);

-- ── order_items ───────────────────────────────────────────────────────────

-- SEC-1: remove blanket USING (true) on order_items
DROP POLICY IF EXISTS "public_read_items_by_order" ON order_items;

-- Replace: anon users can read items only for guest orders
DROP POLICY IF EXISTS "anon_read_guest_order_items" ON order_items;
CREATE POLICY "anon_read_guest_order_items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id IS NULL
    )
  );

-- ── order_status_history ──────────────────────────────────────────────────

-- SEC-1: remove blanket USING (true) on order_status_history
DROP POLICY IF EXISTS "public_read_status_history" ON order_status_history;

-- Replace: anon users can read history only for guest orders
DROP POLICY IF EXISTS "anon_read_guest_order_history" ON order_status_history;
CREATE POLICY "anon_read_guest_order_history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id IS NULL
    )
  );

-- ── payment_proofs ────────────────────────────────────────────────────────

-- SEC-2: old policy allowed any authed user to upload to any guest order.
-- Replace with split policy:
--   • Authenticated users → only their own orders (user_id = auth.uid())
--   • Anon users → guest orders only (user_id IS NULL, uploaded_by IS NULL)
DROP POLICY IF EXISTS "users_upload_own_proof" ON payment_proofs;

DROP POLICY IF EXISTS "auth_upload_own_proof" ON payment_proofs;
CREATE POLICY "auth_upload_own_proof" ON payment_proofs
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "anon_upload_guest_proof" ON payment_proofs;
CREATE POLICY "anon_upload_guest_proof" ON payment_proofs
  FOR INSERT WITH CHECK (
    uploaded_by IS NULL
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id IS NULL
    )
  );

-- SEC-3: add SELECT access so guests can read their order's proofs
DROP POLICY IF EXISTS "anon_read_guest_proofs" ON payment_proofs;
CREATE POLICY "anon_read_guest_proofs" ON payment_proofs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id IS NULL
    )
  );
