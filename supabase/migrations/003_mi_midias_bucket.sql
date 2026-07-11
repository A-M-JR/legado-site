-- Bucket mi-midias (opcional — o app usa o bucket "titulares" por padrão)
-- Rode no SQL Editor do Supabase se quiser bucket dedicado ao Melhor Idade

INSERT INTO storage.buckets (id, name, public)
VALUES ('mi-midias', 'mi-midias', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "mi_midias_public_read" ON storage.objects;
CREATE POLICY "mi_midias_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'mi-midias');

DROP POLICY IF EXISTS "mi_midias_auth_upload" ON storage.objects;
CREATE POLICY "mi_midias_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'mi-midias' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "mi_midias_auth_update" ON storage.objects;
CREATE POLICY "mi_midias_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'mi-midias' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "mi_midias_auth_delete" ON storage.objects;
CREATE POLICY "mi_midias_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'mi-midias' AND auth.role() = 'authenticated');
