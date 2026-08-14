CREATE POLICY "Anyone can view lost stray images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lost-strays');

CREATE POLICY "Members can upload lost stray images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lost-strays' AND auth.uid()::text = (storage.foldername(name))[1]);