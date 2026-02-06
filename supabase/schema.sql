-- Spusť v Supabase SQL Editoru:
-- https://supabase.com/dashboard/project/fjvidkmqbctmgprmtnvc/sql/new

-- Tabulka historie menu
CREATE TABLE IF NOT EXISTS menu_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start TEXT NOT NULL,
  week_end TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  specialty JSONB NOT NULL,
  days JSONB NOT NULL
);

-- Tabulka vlastních jídel
CREATE TABLE IF NOT EXISTS custom_dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  protein TEXT NOT NULL CHECK (protein IN ('vege', 'chicken', 'pork', 'beef', 'fish', 'mixed')),
  heaviness TEXT NOT NULL CHECK (heaviness IN ('light', 'medium', 'heavy')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pro rychlé načítání historie
CREATE INDEX IF NOT EXISTS idx_menu_history_created_at ON menu_history(created_at DESC);

-- Povolit přístup pro service role (server-side)
ALTER TABLE menu_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dishes ENABLE ROW LEVEL SECURITY;

-- Politiky pro service_role (full access)
CREATE POLICY "Service role full access menu_history"
  ON menu_history FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access custom_dishes"
  ON custom_dishes FOR ALL
  USING (true)
  WITH CHECK (true);
