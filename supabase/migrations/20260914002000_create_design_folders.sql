-- =====================================================
-- CYF Custom - Design folders (UI groupings)
-- Migration: create_design_folders
-- =====================================================
-- Persists user-created design folders ("playlists" of designs).
-- A folder is just a name + an ordered list of saved_designs ids
-- the user has explicitly added. The configurator's right-side
-- "Mis diseños" panel reads the active folder from activeFolderAtom
-- and reactively re-fetches when it (or its membership) changes.
--
-- RLS: per-user ownership, same pattern as saved_designs.
-- =====================================================

CREATE TABLE IF NOT EXISTS design_folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  design_ids  UUID[] NOT NULL DEFAULT '{}'::uuid[],
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS design_folders_user_idx
  ON design_folders(user_id, created_at DESC);

ALTER TABLE design_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_folders" ON design_folders;
CREATE POLICY "users_manage_own_folders" ON design_folders
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
