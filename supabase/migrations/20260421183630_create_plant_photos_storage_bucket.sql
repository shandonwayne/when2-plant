/*
  # Create plant-photos storage bucket

  Allows authenticated users to upload custom plant photos.

  1. Storage
    - Bucket `plant-photos` (public read)
  2. Security
    - Authenticated users can upload to their own user folder
    - Anyone can read (public bucket for displaying images)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload plant photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'plant-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view plant photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'plant-photos');

CREATE POLICY "Users can delete their own plant photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'plant-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
