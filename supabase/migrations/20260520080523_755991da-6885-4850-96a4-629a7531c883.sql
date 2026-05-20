
ALTER TABLE public.tenants_registry
  ADD COLUMN IF NOT EXISTS alternate_mobile text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS timings text,
  ADD COLUMN IF NOT EXISTS established_year integer;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-logos', 'tenant-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read tenant logos" ON storage.objects;
CREATE POLICY "Public read tenant logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tenant-logos');

DROP POLICY IF EXISTS "Anyone can upload tenant logos" ON storage.objects;
CREATE POLICY "Anyone can upload tenant logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tenant-logos');

DROP POLICY IF EXISTS "Anyone can update tenant logos" ON storage.objects;
CREATE POLICY "Anyone can update tenant logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tenant-logos');

DROP POLICY IF EXISTS "Anyone can delete tenant logos" ON storage.objects;
CREATE POLICY "Anyone can delete tenant logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tenant-logos');
