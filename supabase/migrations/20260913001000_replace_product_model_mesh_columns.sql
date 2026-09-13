-- =====================================================
-- CYF Custom - product_models: replace front_mesh/back_mesh
-- with a dynamic sections JSONB array.
-- Migration: replace_product_model_mesh_columns
-- =====================================================
-- Old: front_mesh TEXT, back_mesh TEXT (hardcoded 2 sections)
-- New: sections JSONB (any number, any mesh_name, per-section
--      color, visibility, display_name)
--
-- This lets admin inspect any .glb client-side and map its
-- meshes to canonical sections (front/back/inside/neck/
-- left_sleeve/right_sleeve) without DB schema changes.
-- =====================================================

ALTER TABLE product_models
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill franela-sencilla (the only model currently in DB)
-- with the 6 sections detected from modelos/281/model.glb:
--   front, back, back_inside, neck, left_sleeve, right_sleeve
UPDATE product_models
SET sections = '[
  {"id":"front","mesh_name":"front","display_name":"Frente","color":"#FFFFFF","visible":true,"sort_order":1},
  {"id":"back","mesh_name":"back","display_name":"Espalda","color":"#FFFFFF","visible":true,"sort_order":2},
  {"id":"inside","mesh_name":"back_inside","display_name":"Interior","color":"#FFFFFF","visible":true,"sort_order":3},
  {"id":"neck","mesh_name":"neck","display_name":"Cuello","color":"#FFFFFF","visible":true,"sort_order":4},
  {"id":"left_sleeve","mesh_name":"left_sleeve","display_name":"Manga Izquierda","color":"#FFFFFF","visible":true,"sort_order":5},
  {"id":"right_sleeve","mesh_name":"right_sleeve","display_name":"Manga Derecha","color":"#FFFFFF","visible":true,"sort_order":6}
]'::jsonb
WHERE slug = 'franela-sencilla' AND jsonb_array_length(sections) = 0;

-- Drop the now-redundant single-purpose columns
ALTER TABLE product_models
  DROP COLUMN IF EXISTS front_mesh,
  DROP COLUMN IF EXISTS back_mesh;
