CREATE POLICY "Read app images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('reports','strays','thread-images','activity-images'));
CREATE POLICY "Upload app images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('reports','strays','thread-images','activity-images'));
CREATE POLICY "Update own app images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('reports','strays','thread-images','activity-images') AND owner = auth.uid());
CREATE POLICY "Delete own app images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('reports','strays','thread-images','activity-images') AND owner = auth.uid());