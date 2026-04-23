/*
  # Create Plants Catalog Table

  1. New Tables
    - `plants`
      - `id` (uuid, primary key) - Unique identifier for each plant
      - `name` (text, not null) - Common name of the plant
      - `scientific_name` (text) - Scientific/Latin name
      - `type` (text, not null) - Category: 'flower', 'vegetable', 'herb', 'shrub'
      - `description` (text) - General description of the plant
      - `image_url` (text) - URL to a wide/banner photo of the plant
      - `closeup_image_url` (text) - URL to a close-up detail photo
      - `light_requirement` (text, not null) - 'full_sun', 'partial_sun', 'shade'
      - `zone_min` (integer, not null) - Minimum USDA hardiness zone
      - `zone_max` (integer, not null) - Maximum USDA hardiness zone
      - `bloom_months` (integer array) - Months when the plant blooms (1-12), for flowers
      - `planting_months` (integer array) - Months when to plant (1-12)
      - `harvest_months` (integer array) - Months when to harvest (1-12), for vegetables
      - `days_to_maturity` (integer) - Approximate days from planting to maturity
      - `height_inches_min` (integer) - Minimum mature height in inches
      - `height_inches_max` (integer) - Maximum mature height in inches
      - `water_needs` (text) - 'low', 'moderate', 'high'
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on `plants` table
    - Add policy for all authenticated users to read plant catalog
    - Add policy for anon users to read plant catalog (public catalog)
*/

CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text DEFAULT '',
  type text NOT NULL CHECK (type IN ('flower', 'vegetable', 'herb', 'shrub')),
  description text DEFAULT '',
  image_url text DEFAULT '',
  closeup_image_url text DEFAULT '',
  light_requirement text NOT NULL DEFAULT 'full_sun' CHECK (light_requirement IN ('full_sun', 'partial_sun', 'shade')),
  zone_min integer NOT NULL DEFAULT 3,
  zone_max integer NOT NULL DEFAULT 10,
  bloom_months integer[] DEFAULT '{}',
  planting_months integer[] DEFAULT '{}',
  harvest_months integer[] DEFAULT '{}',
  days_to_maturity integer DEFAULT 0,
  height_inches_min integer DEFAULT 0,
  height_inches_max integer DEFAULT 0,
  water_needs text DEFAULT 'moderate' CHECK (water_needs IN ('low', 'moderate', 'high')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plant catalog"
  ON plants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can read plant catalog"
  ON plants
  FOR SELECT
  TO anon
  USING (true);
