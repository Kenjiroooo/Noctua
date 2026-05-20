-- ============================================
-- Noctua — Supabase Database Schema (Multi-User)
-- Run this in the Supabase SQL Editor
-- ============================================
-- 
-- ⚠️ IMPORTANT SETUP STEPS:
-- 1. Go to Supabase Dashboard > Authentication > Providers > Email
-- 2. DISABLE "Confirm email" (so users can sign up without email verification)
-- 3. Run this ENTIRE script in the SQL Editor
--
-- If you already have the old single-user tables, run the
-- supabase-migration-auth.sql file INSTEAD of this one.
-- ============================================

-- 1. Notes table
CREATE TABLE IF NOT EXISTS notes (
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

-- 2. History table
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  type TEXT NOT NULL CHECK (type IN ('upload', 'summary', 'quiz', 'explain')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Settings table (key-value store per user)
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- 5. Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
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

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user ON history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_type ON history (type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, read);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results (user_id, created_at DESC);
