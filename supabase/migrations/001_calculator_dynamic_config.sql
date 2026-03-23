-- =====================================================
-- CYF Custom - Dynamic Calculator Configuration
-- Migration: 001_calculator_dynamic_config
-- =====================================================
-- Creates tables for:
--   - user_roles (role-based access control)
--   - supervisor_permissions (granular permissions)
--   - calculator_configs (replaces hardcoded defaults)
--   - config_audit_log (change tracking)
--   - calculation_history (user calculation records)
-- =====================================================

-- ============================================================================
-- 1. user_roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'worker')),
  display_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 2. supervisor_permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS supervisor_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  can_edit_direct_costs BOOLEAN DEFAULT false,
  can_edit_depreciation BOOLEAN DEFAULT false,
  can_edit_labor BOOLEAN DEFAULT false,
  can_edit_financials BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_name)
);

-- ============================================================================
-- 3. calculator_configs (replaces hardcoded data in defaults.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calculator_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  config_version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  direct_costs JSONB NOT NULL DEFAULT '[]',
  depreciation JSONB NOT NULL DEFAULT '[]',
  indirect_costs JSONB,
  labor_costs JSONB,
  financials JSONB NOT NULL,
  extra_config JSONB,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_name, config_version)
);

CREATE INDEX IF NOT EXISTS idx_calculator_configs_active
  ON calculator_configs(module_name, is_active) WHERE is_active = true;

-- ============================================================================
-- 4. config_audit_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS config_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES calculator_configs(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  field_changed TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  previous_version INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_config_audit_module
  ON config_audit_log(module_name, changed_at DESC);

-- ============================================================================
-- 5. calculation_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  input_state JSONB NOT NULL,
  config_version INT NOT NULL,
  result_totals JSONB NOT NULL,
  quantity INT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calc_history_user
  ON calculation_history(user_id, created_at DESC);

-- ============================================================================
-- 6. RPC: Atomic config update with audit trail
-- ============================================================================

CREATE OR REPLACE FUNCTION update_calculator_config(
  p_config_id UUID,
  p_field TEXT,
  p_new_value JSONB,
  p_reason TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_old_value JSONB;
  v_module TEXT;
  v_version INT;
BEGIN
  -- Validate field name to prevent SQL injection
  IF p_field NOT IN ('direct_costs', 'depreciation', 'indirect_costs', 'labor_costs', 'financials', 'extra_config') THEN
    RAISE EXCEPTION 'Invalid field name: %', p_field;
  END IF;

  -- Get current values
  EXECUTE format('SELECT %I, module_name, config_version FROM calculator_configs WHERE id = $1', p_field)
    INTO v_old_value, v_module, v_version USING p_config_id;

  IF v_module IS NULL THEN
    RAISE EXCEPTION 'Config not found: %', p_config_id;
  END IF;

  -- Update the field
  EXECUTE format('UPDATE calculator_configs SET %I = $1, updated_by = $2, updated_at = now() WHERE id = $3', p_field)
    USING p_new_value, auth.uid(), p_config_id;

  -- Insert audit log entry
  INSERT INTO config_audit_log (config_id, module_name, changed_by, field_changed, old_value, new_value, change_reason, previous_version)
  VALUES (p_config_id, v_module, auth.uid(), p_field, v_old_value, p_new_value, p_reason, v_version);

  -- Bump version
  UPDATE calculator_configs SET config_version = config_version + 1 WHERE id = p_config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Helper function: get user role
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS TEXT AS $$
  SELECT role FROM user_roles WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 8. Row Level Security Policies
-- ============================================================================

-- user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_roles" ON user_roles
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "users_read_own_role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- supervisor_permissions
ALTER TABLE supervisor_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_permissions" ON supervisor_permissions
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "supervisor_read_own" ON supervisor_permissions
  FOR SELECT USING (user_id = auth.uid());

-- calculator_configs
ALTER TABLE calculator_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_active" ON calculator_configs
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_configs" ON calculator_configs
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "supervisor_update_permitted" ON calculator_configs
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'supervisor'
    AND EXISTS (
      SELECT 1 FROM supervisor_permissions sp
      WHERE sp.user_id = auth.uid()
      AND sp.module_name = calculator_configs.module_name
    )
  );

-- config_audit_log
ALTER TABLE config_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_all_audit" ON config_audit_log
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "anyone_insert_audit" ON config_audit_log
  FOR INSERT WITH CHECK (changed_by = auth.uid());

-- calculation_history
ALTER TABLE calculation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own" ON calculation_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_read_all_history" ON calculation_history
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- 9. Seed: Sublimación default config
-- ============================================================================

INSERT INTO calculator_configs (
  module_name,
  config_version,
  is_active,
  direct_costs,
  depreciation,
  labor_costs,
  financials,
  extra_config
) VALUES (
  'sublimacion',
  1,
  true,
  '[
    {"id": "producto", "label": "Producto base", "enabled": true, "price": 90, "quantity": 36},
    {"id": "papel", "label": "Papel sublimación", "enabled": true, "price": 10, "quantity": 100},
    {"id": "tinta", "label": "Tinta", "enabled": true, "price": 40, "quantity": 300},
    {"id": "cinta", "label": "Cinta térmica", "enabled": true, "price": 3, "quantity": 100},
    {"id": "empaque", "label": "Empaque", "enabled": true, "price": 5, "quantity": 50}
  ]'::jsonb,
  '[
    {"id": "impresora", "label": "Impresora", "enabled": true, "mode": "month", "price": 240, "unitsPerMonth": 100},
    {"id": "plancha", "label": "Plancha térmica", "enabled": true, "mode": "month", "price": 400, "unitsPerMonth": 100},
    {"id": "pc", "label": "PC", "enabled": true, "mode": "month", "price": 350, "unitsPerMonth": 100},
    {"id": "prensa", "label": "Prensa/plancha extra", "enabled": false, "mode": "month", "price": 180, "unitsPerMonth": 100},
    {"id": "resistencia", "label": "Resistencia", "enabled": false, "mode": "month", "price": 50, "unitsPerMonth": 100}
  ]'::jsonb,
  '{"enabled": false, "salary": 400, "hoursPerMonth": 176, "setupMinutes": 10, "runMinutesPerUnit": 1.5, "unitsPerBatch": 1}'::jsonb,
  '{"gananciaPct": 40, "impuestosPct": 16, "applyGanancia": true, "applyImpuestos": true}'::jsonb,
  null
)
ON CONFLICT (module_name, config_version) DO NOTHING;

-- ============================================================================
-- 10. Seed: Assign admin role to existing admin user
-- ============================================================================

DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'francisco.august.fa@gmail.com' LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role, display_name)
    VALUES (v_admin_id, 'admin', 'CYF Admin')
    ON CONFLICT (user_id) DO NOTHING;

    -- Update the calculator_configs created_by
    UPDATE calculator_configs SET created_by = v_admin_id WHERE created_by IS NULL;
  END IF;
END $$;
