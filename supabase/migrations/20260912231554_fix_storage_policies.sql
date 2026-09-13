-- =====================================================
-- CYF Custom - Storage RLS fix
-- Migration: fix_storage_policies
-- =====================================================
-- Root cause: Supabase Storage does NOT propagate
-- `request.jwt.claims` to the Postgres session before
-- INSERTing into `storage.objects`. So `auth.uid()`
-- returns NULL inside Storage-triggered INSERTs, even
-- though it works fine for PostgREST-triggered ones.
--
-- Verified by direct simulation:
--   - INSERT as `authenticated` with auth.uid()=NULL  -> RLS rejects
--   - INSERT as `authenticated` with auth.uid()=admin -> RLS passes
--   - INSERT as `supabase_storage_admin` (owner)      -> RLS bypassed
--
-- Storage DOES set the `owner` column to the user's uid
-- (from the JWT), even though it doesn't set
-- `request.jwt.claims`. So we use COALESCE(owner,
-- auth.uid()) so both paths work:
--   - PostgREST path: owner=NULL, auth.uid()=uid -> uses auth.uid()
--   - Storage path:   owner=uid, auth.uid()=NULL -> uses owner
--
-- Must run as a role with ownership of storage.objects
-- (supabase_storage_admin / supabase_admin), which the
-- Dashboard SQL editor provides.
-- =====================================================

DROP POLICY IF EXISTS "models_admin_insert" ON storage.objects;
CREATE POLICY "models_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'models'
    AND get_user_role(COALESCE(owner, auth.uid())) = 'admin'
  );

DROP POLICY IF EXISTS "models_admin_update" ON storage.objects;
CREATE POLICY "models_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'models'
    AND get_user_role(COALESCE(owner, auth.uid())) = 'admin'
  );

DROP POLICY IF EXISTS "models_admin_delete" ON storage.objects;
CREATE POLICY "models_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'models'
    AND get_user_role(COALESCE(owner, auth.uid())) = 'admin'
  );

DROP POLICY IF EXISTS "payment_proofs_admin_select" ON storage.objects;
CREATE POLICY "payment_proofs_admin_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs'
    AND get_user_role(COALESCE(owner, auth.uid())) = 'admin'
  );

DROP POLICY IF EXISTS "payment_proofs_admin_update" ON storage.objects;
CREATE POLICY "payment_proofs_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'payment-proofs'
    AND get_user_role(COALESCE(owner, auth.uid())) = 'admin'
  );

DROP POLICY IF EXISTS "payment_proofs_admin_delete" ON storage.objects;
CREATE POLICY "payment_proofs_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'payment-proofs'
    AND get_user_role(COALESCE(owner, auth.uid())) = 'admin'
  );

-- payment_proofs_public_insert unchanged (anon can upload proofs).