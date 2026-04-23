/*
  # Add perenual_id to custom_plants

  Allows tracking which custom plants were imported from the Perenual API,
  enabling the "already imported" check in the UI.

  1. Modified Tables
    - `custom_plants`
      - `perenual_id` (integer, nullable) — Perenual species ID if imported from their API
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_plants' AND column_name = 'perenual_id'
  ) THEN
    ALTER TABLE custom_plants ADD COLUMN perenual_id integer;
  END IF;
END $$;
