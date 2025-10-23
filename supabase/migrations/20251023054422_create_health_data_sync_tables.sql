/*
  # Create Health Data Sync Tables

  1. New Tables
    - `health_sync_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users)
      - `source` (text) - 'apple_health' or 'google_fit'
      - `steps` (integer) - number of steps recorded
      - `distance` (numeric) - distance in meters
      - `calories` (numeric) - calories burned
      - `sync_date` (date) - date of the health data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `synced_to_training` (boolean) - whether converted to training session
      - `training_id` (text) - reference to created training if synced

    - `health_sync_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users, unique)
      - `apple_health_enabled` (boolean) - enable Apple Health sync
      - `google_fit_enabled` (boolean) - enable Google Fit sync
      - `auto_sync_enabled` (boolean) - enable automatic sync
      - `steps_threshold` (integer) - steps threshold for creating training (default 6000)
      - `last_sync_date` (timestamptz) - last successful sync
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS health_sync_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL CHECK (source IN ('apple_health', 'google_fit')),
  steps integer DEFAULT 0,
  distance numeric DEFAULT 0,
  calories numeric DEFAULT 0,
  sync_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_to_training boolean DEFAULT false,
  training_id text,
  UNIQUE(user_id, source, sync_date)
);

CREATE TABLE IF NOT EXISTS health_sync_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  apple_health_enabled boolean DEFAULT false,
  google_fit_enabled boolean DEFAULT false,
  auto_sync_enabled boolean DEFAULT true,
  steps_threshold integer DEFAULT 6000,
  last_sync_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE health_sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_sync_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health sync sessions"
  ON health_sync_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health sync sessions"
  ON health_sync_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health sync sessions"
  ON health_sync_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health sync sessions"
  ON health_sync_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health sync settings"
  ON health_sync_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health sync settings"
  ON health_sync_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health sync settings"
  ON health_sync_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health sync settings"
  ON health_sync_settings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_health_sync_sessions_user_date 
  ON health_sync_sessions(user_id, sync_date DESC);

CREATE INDEX IF NOT EXISTS idx_health_sync_sessions_synced 
  ON health_sync_sessions(user_id, synced_to_training);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_health_sync_sessions_updated_at ON health_sync_sessions;
CREATE TRIGGER update_health_sync_sessions_updated_at
  BEFORE UPDATE ON health_sync_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_sync_settings_updated_at ON health_sync_settings;
CREATE TRIGGER update_health_sync_settings_updated_at
  BEFORE UPDATE ON health_sync_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
