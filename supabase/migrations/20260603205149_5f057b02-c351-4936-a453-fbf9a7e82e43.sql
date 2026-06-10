-- Public read access for story-audio (bucket is already public, make policy explicit)
CREATE POLICY "Public read story-audio"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'story-audio');

-- Block all client-side writes. Server uses service_role which bypasses RLS.
CREATE POLICY "Block client inserts to story-audio"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Block client updates to story-audio"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Block client deletes to story-audio"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (false);