-- =====================================================
-- CYF Custom - Storage RLS fix (round 5 — grants)
-- Migration: fix_storage_grants
-- =====================================================
-- Round 4 added policies on storage.s3_multipart_uploads and
-- storage.s3_multipart_uploads_parts, but those tables only
-- have SELECT granted to authenticated/anon (not INSERT).
-- Without INSERT grant, RLS isn't even evaluated — the
-- "permission denied for table" error happens first.
--
-- This migration grants INSERT/UPDATE/DELETE/SELECT on the
-- multipart tables so the policies from v4 can take effect.
--
-- Must run as supabase_admin (superuser) or storage table
-- owner. The migration runner does this automatically.
-- =====================================================

GRANT INSERT, UPDATE, DELETE, SELECT ON storage.s3_multipart_uploads TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON storage.s3_multipart_uploads_parts TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON storage.s3_multipart_uploads TO anon;
GRANT INSERT, UPDATE, DELETE, SELECT ON storage.s3_multipart_uploads_parts TO anon;