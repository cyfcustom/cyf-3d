-- =====================================================
-- CYF Custom - Design library: model_slug column + design-images bucket
-- Migration: design_images_and_model_slug
-- =====================================================
-- Wires the configurator's "Mis diseños" feature into Supabase so a
-- design (colors + images + positions) saved by an authenticated user
-- can be reloaded from any browser after signing in to the same account.
--
-- Reuses the existing `saved_designs` table (per-user RLS from
-- 005_rls_base_tables.sql) and adds:
--   1. model_slug column + index — so the list can be filtered by the
--      current product model without scanning JSONB.
--   2. design-images storage bucket — public read (cross-browser image
--      loading by URL), authenticated write, owner-only update/delete.
--   3. storage.objects + multipart policies + grants — mirrors the
--      models-bucket pattern from migration 20260912231700 so multipart
--      uploads also work (prevents the same "permission denied" failure
--      mode we hit on the models bucket).
--
-- Idempotent: safe to re-run.
-- =====================================================

-- ── 1. saved_designs: model_slug column + index ──────────────────────
ALTER TABLE saved_designs
  ADD COLUMN IF NOT EXISTS model_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_saved_designs_user_slug
  ON saved_designs(user_id, model_slug, created_at DESC);

-- ── 2. design-images bucket (public read) ────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('design-images', 'design-images', true, 10485760,
   ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ── 3. storage.objects policies ──────────────────────────────────────
-- Public SELECT (cross-browser load by URL), authenticated INSERT,
-- owner-only UPDATE/DELETE so users can only manage their own uploads.
DROP POLICY IF EXISTS "design_images_public_read" ON storage.objects;
CREATE POLICY "design_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'design-images');

DROP POLICY IF EXISTS "design_images_authenticated_insert" ON storage.objects;
CREATE POLICY "design_images_authenticated_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'design-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "design_images_owner_update" ON storage.objects;
CREATE POLICY "design_images_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'design-images'
    AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "design_images_owner_delete" ON storage.objects;
CREATE POLICY "design_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'design-images'
    AND owner = auth.uid()
  );

-- ── 4. multipart tables: policies + grants ──────────────────────────
-- storage.s3_multipart_uploads has only owner_id (text), no owner (uuid).
-- Buckets has no owner. Mirror the models-bucket pattern.

-- Grants (required so policies can be evaluated — RLS denial happens
-- before policy check if the role lacks the table privilege).
GRANT INSERT, UPDATE, DELETE, SELECT ON storage.s3_multipart_uploads TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON storage.s3_multipart_uploads_parts TO authenticated;

DROP POLICY IF EXISTS "design_images_multipart_insert" ON storage.s3_multipart_uploads;
CREATE POLICY "design_images_multipart_insert" ON storage.s3_multipart_uploads
  FOR INSERT WITH CHECK (
    bucket_id = 'design-images'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND owner_id::uuid = auth.uid())
      OR auth.uid() IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "design_images_multipart_select" ON storage.s3_multipart_uploads;
CREATE POLICY "design_images_multipart_select" ON storage.s3_multipart_uploads
  FOR SELECT USING (
    bucket_id = 'design-images'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND owner_id::uuid = auth.uid())
      OR auth.uid() IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "design_images_multipart_update" ON storage.s3_multipart_uploads;
CREATE POLICY "design_images_multipart_update" ON storage.s3_multipart_uploads
  FOR UPDATE USING (
    bucket_id = 'design-images'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND owner_id::uuid = auth.uid())
      OR auth.uid() IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "design_images_multipart_delete" ON storage.s3_multipart_uploads;
CREATE POLICY "design_images_multipart_delete" ON storage.s3_multipart_uploads
  FOR DELETE USING (
    bucket_id = 'design-images'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND owner_id::uuid = auth.uid())
      OR auth.uid() IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "design_images_multipart_parts_insert" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "design_images_multipart_parts_insert" ON storage.s3_multipart_uploads_parts
  FOR INSERT WITH CHECK (bucket_id = 'design-images');

DROP POLICY IF EXISTS "design_images_multipart_parts_select" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "design_images_multipart_parts_select" ON storage.s3_multipart_uploads_parts
  FOR SELECT USING (bucket_id = 'design-images');

DROP POLICY IF EXISTS "design_images_multipart_parts_update" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "design_images_multipart_parts_update" ON storage.s3_multipart_uploads_parts
  FOR UPDATE USING (bucket_id = 'design-images');

DROP POLICY IF EXISTS "design_images_multipart_parts_delete" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "design_images_multipart_parts_delete" ON storage.s3_multipart_uploads_parts
  FOR DELETE USING (bucket_id = 'design-images');
