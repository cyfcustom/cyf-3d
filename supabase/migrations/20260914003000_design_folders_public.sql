-- =====================================================
-- CYF Custom - Public design folders
-- Migration: design_folders_public
-- =====================================================
-- Lets a folder owner mark a design_folders row as public. When
-- is_public = true, anonymous visitors can SELECT the folder AND the
-- saved_designs referenced by it. Write access (INSERT/UPDATE/DELETE)
-- stays restricted to the row owner via the existing per-user policy.
--
-- This unblocks public surfaces (e.g. /juntos-a-seul) that need to
-- render saved designs without forcing visitors to sign in, while
-- keeping the owner's other designs private until they opt in.
--
-- The slug column lets a public surface find a folder by stable name
-- (e.g. 'seul') instead of hardcoding the row's UUID.
-- =====================================================

-- ── 1. Columns ──────────────────────────────────────────────────────────
ALTER TABLE design_folders
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE design_folders
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Partial index — public folder lookups by slug (campaign page hits this).
CREATE INDEX IF NOT EXISTS design_folders_public_slug_idx
  ON design_folders(slug)
  WHERE is_public = TRUE;

-- ── 2. RLS ──────────────────────────────────────────────────────────────

-- Anon (and authed users) can SELECT any folder marked public.
-- The owner's existing "users_manage_own_folders" ALL policy still
-- covers their own rows; the new SELECT policy is OR'd in for public rows.
DROP POLICY IF EXISTS "public_select_public_folders" ON design_folders;
CREATE POLICY "public_select_public_folders" ON design_folders
  FOR SELECT USING (is_public = TRUE);

-- Anon can SELECT saved_designs that are referenced by a public folder.
-- ANY(design_ids) checks membership of the design id in the folder's
-- uuid[] of design ids. The owner retains exclusive write access via
-- their existing "users_manage_own_designs" ALL policy.
DROP POLICY IF EXISTS "public_select_designs_in_public_folders" ON saved_designs;
CREATE POLICY "public_select_designs_in_public_folders" ON saved_designs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM design_folders df
      WHERE df.is_public = TRUE
        AND saved_designs.id = ANY(df.design_ids)
    )
  );
