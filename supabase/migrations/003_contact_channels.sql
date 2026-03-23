-- ============================================================
-- 003_contact_channels.sql
-- Contact channels (Linktree-style) + form submissions
-- Idempotent: safe to re-run
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_channels (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL,
  label       text        NOT NULL,
  value       text        NOT NULL,        -- phone number, email, URL, etc.
  active      boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_form_submissions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text,
  phone       text,
  message     text        NOT NULL,
  read        boolean     NOT NULL DEFAULT false,
  admin_notes text,
  created_at  timestamptz DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE contact_channels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_form_submissions  ENABLE ROW LEVEL SECURITY;

-- contact_channels: anyone can read active channels; only admin can write
DROP POLICY IF EXISTS "contact_channels_public_read"   ON contact_channels;
DROP POLICY IF EXISTS "contact_channels_admin_write"   ON contact_channels;

CREATE POLICY "contact_channels_public_read" ON contact_channels
  FOR SELECT USING (true);

CREATE POLICY "contact_channels_admin_write" ON contact_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- contact_form_submissions: anyone can insert; admin/supervisor can read & update
DROP POLICY IF EXISTS "submissions_public_insert"      ON contact_form_submissions;
DROP POLICY IF EXISTS "submissions_admin_read"         ON contact_form_submissions;
DROP POLICY IF EXISTS "submissions_admin_update"       ON contact_form_submissions;

CREATE POLICY "submissions_public_insert" ON contact_form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "submissions_admin_read" ON contact_form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "submissions_admin_update" ON contact_form_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ── Auto-update timestamp ─────────────────────────────────────────────────

DROP TRIGGER IF EXISTS contact_channels_updated_at ON contact_channels;
CREATE TRIGGER contact_channels_updated_at
  BEFORE UPDATE ON contact_channels
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Seed from company_info (only if table is empty) ───────────────────────

DO $$
DECLARE
  v_phone     text := '584124553107';
  v_email     text := 'contacto@cyfcustoms.com';
  v_instagram text := 'https://instagram.com/cyfcustoms';
  v_facebook  text := 'https://facebook.com/cyfcustoms';
BEGIN
  -- Try to pull existing values from company_info
  BEGIN
    SELECT phone, email, instagram_url, facebook_url
      INTO v_phone, v_email, v_instagram, v_facebook
      FROM company_info LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    NULL; -- company_info doesn't exist or is empty — use defaults
  END;

  IF NOT EXISTS (SELECT 1 FROM contact_channels LIMIT 1) THEN
    INSERT INTO contact_channels (type, label, value, sort_order, active) VALUES
      ('whatsapp',  'WhatsApp',           v_phone,     1, true),
      ('email',     'Correo electrónico', v_email,     2, true),
      ('instagram', 'Instagram',          v_instagram, 3, true),
      ('facebook',  'Facebook',           v_facebook,  4, false);
  END IF;
END $$;
