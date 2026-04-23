/*
  # Add perenual_id column to plants table

  1. Modified Tables
    - `plants`
      - Added `perenual_id` (integer, nullable, unique) - stores the Perenual API species ID for tracking source data and preventing duplicate imports

  2. Notes
    - Uses IF NOT EXISTS to safely re-run
    - Unique constraint prevents duplicate plant entries from API imports
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'perenual_id'
  ) THEN
    ALTER TABLE plants ADD COLUMN perenual_id integer UNIQUE;
  END IF;
END $$;
