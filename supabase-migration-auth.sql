-- ============================================
-- Noctua — Auth Migration Script
-- ============================================
-- Run this if you already have the old single-user tables.
-- This will DROP all existing tables and recreate them
-- with multi-user support.
--
-- ⚠️ WARNING: This will DELETE all existing data!
-- ============================================

-- ⚠️ BEFORE RUNNING THIS SCRIPT:
-- 1. Go to Supabase Dashboard > Authentication > Providers > Email
-- 2. DISABLE "Confirm email" toggle
--    (This lets users sign up instantly without email verification)
-- 3. Then run this script in the SQL Editor

-- Drop old policies
DROP POLICY IF EXISTS "Allow all on notes" ON notes;
DROP POLICY IF EXISTS "Allow all on history" ON history;
DROP POLICY IF EXISTS "Allow all on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all on settings" ON settings;
DROP POLICY IF EXISTS "Allow all on quiz_results" ON quiz_results;

-- Drop old indexes
DROP INDEX IF EXISTS idx_notes_created_at;
DROP INDEX IF EXISTS idx_history_created_at;
DROP INDEX IF EXISTS idx_history_type;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_quiz_results_created_at;

-- Drop old tables
DROP TABLE IF EXISTS quiz_results;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS notes;

-- Recreate tables with user_id
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'file')),
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  type TEXT NOT NULL CHECK (type IN ('upload', 'summary', 'quiz', 'explain')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

CREATE TABLE quiz_results (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('mcq', 'identification')),
  topic TEXT,
  questions JSONB NOT NULL,
  answers JSONB,
  score INTEGER,
  total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Per-user policies
CREATE POLICY "Users manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own history" ON history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own settings" ON settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own quiz_results" ON quiz_results
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_notes_user ON notes (user_id, created_at DESC);
CREATE INDEX idx_history_user ON history (user_id, created_at DESC);
CREATE INDEX idx_history_type ON history (type);
CREATE INDEX idx_notifications_user ON notifications (user_id, read);
CREATE INDEX idx_quiz_results_user ON quiz_results (user_id, created_at DESC);

-- Done! ✅
-- Now sign up from the app — each user will have their own isolated data.
