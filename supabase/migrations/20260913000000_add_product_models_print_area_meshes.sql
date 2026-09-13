-- =====================================================
-- CYF Custom - Add print-area mesh fields to product_models
-- Migration: add_product_models_print_area_meshes
-- =====================================================
-- Models like the franela GLB are split into multiple meshes
-- (front, back, sleeves, neck, ...). The configurator needs
-- to know which mesh is the "front print area" vs the
-- "back print area" so it can apply the user's design only
-- there and keep the rest as solid color.
--
-- Defaults match the glTF naming convention from Khronos
-- Blender I/O export ("front" / "back"). The admin can
-- override per-model if a custom GLB uses different names.
-- =====================================================

ALTER TABLE product_models
  ADD COLUMN IF NOT EXISTS front_mesh TEXT NOT NULL DEFAULT 'front',
  ADD COLUMN IF NOT EXISTS back_mesh  TEXT NOT NULL DEFAULT 'back';

-- Backfill existing models with the defaults.
UPDATE product_models
SET front_mesh = 'front', back_mesh = 'back'
WHERE front_mesh IS NULL OR back_mesh IS NULL;

-- Set franela-sencilla (model 281) explicitly to be safe.
UPDATE product_models
SET front_mesh = 'front', back_mesh = 'back'
WHERE slug = 'franela-sencilla';
