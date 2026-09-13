-- =====================================================
-- CYF Custom - Storage RLS fix (round 4 — root cause)
-- Migration: fix_storage_policies_v4
-- =====================================================
-- Round 1: COALESCE(owner, auth.uid()) for objects → failed
--          because Storage sets owner_id (text) not owner (uuid).
-- Round 2: trigger to normalise owner_id → blocked, no CREATE on
--          storage schema from migration runner.
-- Round 3: inline owner_id cast in policy → ok for storage.objects,
--          but user deleted the 3 models_admin_* policies by hand.
-- Round 4 (this): re-add the 3 models policies + add policies for
--          the multipart tables AND storage.buckets, all of which
--          had ZERO policies → RLS denied everything by default.
--
-- Tables affected (RLS on, policies = 0 before):
--   storage.buckets                         (need SELECT for all)
--   storage.s3_multipart_uploads            (need CRUD for admin on models)
--   storage.s3_multipart_uploads_parts      (need CRUD for admin on models)
--   storage.objects                         (need models_admin_* re-added)
--
-- Owner resolution: only storage.objects has an `owner uuid` column.
-- The multipart tables have only `owner_id text` (uuid-as-string).
-- Buckets has no owner column. So policies on multipart/buckets must
-- check `owner_id` (text → uuid cast) instead of `owner`.
-- =====================================================

-- ── 1. Re-add models policies on storage.objects ──────────────────────
DROP POLICY IF EXISTS "models_admin_insert" ON storage.objects;
CREATE POLICY "models_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'models'
    AND get_user_role(
      COALESCE(
        owner,
        CASE WHEN owner_id IS NOT NULL
              AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
             THEN owner_id::uuid
             ELSE NULL END,
        auth.uid()
      )
    ) = 'admin'
  );

DROP POLICY IF EXISTS "models_admin_update" ON storage.objects;
CREATE POLICY "models_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'models'
    AND get_user_role(
      COALESCE(
        owner,
        CASE WHEN owner_id IS NOT NULL
              AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
             THEN owner_id::uuid
             ELSE NULL END,
        auth.uid()
      )
    ) = 'admin'
  );

DROP POLICY IF EXISTS "models_admin_delete" ON storage.objects;
CREATE POLICY "models_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'models'
    AND get_user_role(
      COALESCE(
        owner,
        CASE WHEN owner_id IS NOT NULL
              AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
             THEN owner_id::uuid
             ELSE NULL END,
        auth.uid()
      )
    ) = 'admin'
  );

-- ── 2. storage.buckets: SELECT for everyone (needed by API) ───────────
DROP POLICY IF EXISTS "buckets_read_all" ON storage.buckets;
CREATE POLICY "buckets_read_all" ON storage.buckets
  FOR SELECT USING (true);

-- ── 3. storage.s3_multipart_uploads: admin CRUD on models bucket ──────
-- Only `owner_id` (text) here, no `owner` (uuid) column.
DROP POLICY IF EXISTS "models_multipart_insert" ON storage.s3_multipart_uploads;
CREATE POLICY "models_multipart_insert" ON storage.s3_multipart_uploads
  FOR INSERT WITH CHECK (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "models_multipart_select" ON storage.s3_multipart_uploads;
CREATE POLICY "models_multipart_select" ON storage.s3_multipart_uploads
  FOR SELECT USING (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "models_multipart_update" ON storage.s3_multipart_uploads;
CREATE POLICY "models_multipart_update" ON storage.s3_multipart_uploads
  FOR UPDATE USING (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "models_multipart_delete" ON storage.s3_multipart_uploads;
CREATE POLICY "models_multipart_delete" ON storage.s3_multipart_uploads
  FOR DELETE USING (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

-- ── 4. storage.s3_multipart_uploads_parts: admin CRUD on models bucket ─
DROP POLICY IF EXISTS "models_multipart_parts_insert" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "models_multipart_parts_insert" ON storage.s3_multipart_uploads_parts
  FOR INSERT WITH CHECK (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "models_multipart_parts_select" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "models_multipart_parts_select" ON storage.s3_multipart_uploads_parts
  FOR SELECT USING (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "models_multipart_parts_update" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "models_multipart_parts_update" ON storage.s3_multipart_uploads_parts
  FOR UPDATE USING (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "models_multipart_parts_delete" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "models_multipart_parts_delete" ON storage.s3_multipart_uploads_parts
  FOR DELETE USING (
    bucket_id = 'models'
    AND (
      (owner_id IS NOT NULL
       AND owner_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       AND get_user_role(owner_id::uuid) = 'admin')
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

-- ── 5. payment-proofs multipart tables (anon uploads, admin reads) ────
DROP POLICY IF EXISTS "payment_proofs_multipart_insert" ON storage.s3_multipart_uploads;
CREATE POLICY "payment_proofs_multipart_insert" ON storage.s3_multipart_uploads
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_select" ON storage.s3_multipart_uploads;
CREATE POLICY "payment_proofs_multipart_select" ON storage.s3_multipart_uploads
  FOR SELECT USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_update" ON storage.s3_multipart_uploads;
CREATE POLICY "payment_proofs_multipart_update" ON storage.s3_multipart_uploads
  FOR UPDATE USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_delete" ON storage.s3_multipart_uploads;
CREATE POLICY "payment_proofs_multipart_delete" ON storage.s3_multipart_uploads
  FOR DELETE USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_parts_insert" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "payment_proofs_multipart_parts_insert" ON storage.s3_multipart_uploads_parts
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_parts_select" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "payment_proofs_multipart_parts_select" ON storage.s3_multipart_uploads_parts
  FOR SELECT USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_parts_update" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "payment_proofs_multipart_parts_update" ON storage.s3_multipart_uploads_parts
  FOR UPDATE USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_multipart_parts_delete" ON storage.s3_multipart_uploads_parts;
CREATE POLICY "payment_proofs_multipart_parts_delete" ON storage.s3_multipart_uploads_parts
  FOR DELETE USING (bucket_id = 'payment-proofs');