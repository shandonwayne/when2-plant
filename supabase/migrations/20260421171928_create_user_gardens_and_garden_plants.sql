/*
  # Create User Gardens and Garden Plants Tables

  1. New Tables
    - `user_gardens`
      - `id` (uuid, primary key) - Unique identifier for the garden
      - `user_id` (uuid, not null) - References auth.users
      - `name` (text, not null) - Name of the garden
      - `usda_zone` (integer, not null) - User's USDA hardiness zone (1-13)
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

    - `garden_plants`
      - `id` (uuid, primary key) - Unique identifier
      - `garden_id` (uuid, not null) - References user_gardens
      - `plant_id` (uuid, not null) - References plants
      - `notes` (text) - User's personal notes about this plant
      - `added_at` (timestamptz) - When the plant was added

  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own garden data
    - Users can only read/write plants in their own gardens

  3. Indexes
    - Index on user_gardens.user_id for fast lookup
    - Index on garden_plants.garden_id for fast lookup
    - Unique constraint on garden_plants (garden_id, plant_id) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS user_gardens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL DEFAULT 'My Garden',
  usda_zone integer NOT NULL DEFAULT 7 CHECK (usda_zone >= 1 AND usda_zone <= 13),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_gardens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gardens"
  ON user_gardens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gardens"
  ON user_gardens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gardens"
  ON user_gardens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gardens"
  ON user_gardens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_gardens_user_id ON user_gardens(user_id);

CREATE TABLE IF NOT EXISTS garden_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES user_gardens(id) ON DELETE CASCADE,
  plant_id uuid NOT NULL REFERENCES plants(id),
  notes text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  UNIQUE(garden_id, plant_id)
);

ALTER TABLE garden_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own garden plants"
  ON garden_plants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_gardens
      WHERE user_gardens.id = garden_plants.garden_id
      AND user_gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert into own gardens"
  ON garden_plants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_gardens
      WHERE user_gardens.id = garden_plants.garden_id
      AND user_gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own garden plants"
  ON garden_plants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_gardens
      WHERE user_gardens.id = garden_plants.garden_id
      AND user_gardens.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_gardens
      WHERE user_gardens.id = garden_plants.garden_id
      AND user_gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from own gardens"
  ON garden_plants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_gardens
      WHERE user_gardens.id = garden_plants.garden_id
      AND user_gardens.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_garden_plants_garden_id ON garden_plants(garden_id);
