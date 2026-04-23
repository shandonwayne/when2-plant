/*
  # Create custom_plants table

  Allows authenticated users to create their own plant entries that appear
  alongside the shared catalog. Each row is owned by a single user.

  1. New Tables
    - `custom_plants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) — owner
      - `name` (text) — common name
      - `scientific_name` (text) — optional latin name
      - `type` (text) — flower | vegetable | herb | shrub
      - `description` (text)
      - `image_url` (text)
      - `light_requirement` (text) — full_sun | partial_sun | shade
      - `zone_min` (int) — USDA zone range
      - `zone_max` (int)
      - `bloom_months` (int[])
      - `planting_months` (int[])
      - `harvest_months` (int[])
      - `days_to_maturity` (int)
      - `height_inches_min` (int)
      - `height_inches_max` (int)
      - `water_needs` (text) — low | moderate | high
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can SELECT, INSERT, UPDATE, DELETE only their own rows
*/

CREATE TABLE IF NOT EXISTS custom_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  scientific_name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'flower',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  light_requirement text NOT NULL DEFAULT 'full_sun',
  zone_min integer NOT NULL DEFAULT 1,
  zone_max integer NOT NULL DEFAULT 13,
  bloom_months integer[] NOT NULL DEFAULT '{}',
  planting_months integer[] NOT NULL DEFAULT '{}',
  harvest_months integer[] NOT NULL DEFAULT '{}',
  days_to_maturity integer NOT NULL DEFAULT 0,
  height_inches_min integer NOT NULL DEFAULT 0,
  height_inches_max integer NOT NULL DEFAULT 0,
  water_needs text NOT NULL DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE custom_plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom plants"
  ON custom_plants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom plants"
  ON custom_plants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom plants"
  ON custom_plants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom plants"
  ON custom_plants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
