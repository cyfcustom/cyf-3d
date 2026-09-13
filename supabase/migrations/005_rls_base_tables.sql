-- =====================================================
-- CYF Custom - RLS hardening for base tables
-- Migration: 005_rls_base_tables
-- =====================================================
-- Enables RLS on the base tables created in 000.
-- Runs AFTER 001 so it can use get_user_role() / user_roles.
--
--   catalog tables (products, product_categories, product_models):
--     public read, admin-only writes (AdminModelsPage / dashboard)
--   company_info: public read, admin-only writes
--   saved_designs: per-user ownership
--
-- Idempotent: safe to re-run.
-- =====================================================

-- ── products ────────────────────────────────────────────────────────────────

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- ── product_categories ──────────────────────────────────────────────────────

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON product_categories;
CREATE POLICY "categories_public_read" ON product_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_admin_all" ON product_categories;
CREATE POLICY "categories_admin_all" ON product_categories
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- ── product_models ─────────────────────────────────────────────────────────

ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "models_public_read" ON product_models;
CREATE POLICY "models_public_read" ON product_models
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "models_admin_all" ON product_models;
CREATE POLICY "models_admin_all" ON product_models
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- ── company_info ───────────────────────────────────────────────────────────

ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_info_public_read" ON company_info;
CREATE POLICY "company_info_public_read" ON company_info
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "company_info_admin_all" ON company_info;
CREATE POLICY "company_info_admin_all" ON company_info
  FOR ALL USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- ── saved_designs ──────────────────────────────────────────────────────────

ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_designs" ON saved_designs;
CREATE POLICY "users_manage_own_designs" ON saved_designs
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Auto-update updated_at (set_updated_at() comes from 002) ───────────────

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS product_categories_updated_at ON product_categories;
CREATE TRIGGER product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS product_models_updated_at ON product_models;
CREATE TRIGGER product_models_updated_at
  BEFORE UPDATE ON product_models
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS company_info_updated_at ON company_info;
CREATE TRIGGER company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();