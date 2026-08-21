-- 012 — Medicina Preventiva: bucket privado de laudos/fotos + seed do módulo
-- Depende de: 010 e 011

-- Bucket PRIVADO para laudos, pedidos de exame e fotos de sintoma.
-- Acesso sempre por signed URL. Convenção de caminho: <titular_id>/<pasta>/<arquivo>
INSERT INTO storage.buckets (id, name, public)
VALUES ('mp-arquivos', 'mp-arquivos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Converte texto em UUID sem estourar erro (o bucket guarda outros formatos de caminho)
CREATE OR REPLACE FUNCTION mp_uuid_seguro(p_txt TEXT)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
AS $fn$
BEGIN
  RETURN p_txt::uuid;
EXCEPTION
  WHEN others THEN RETURN NULL;
END
$fn$;

DROP POLICY IF EXISTS "mp_arquivos_select" ON storage.objects;
CREATE POLICY "mp_arquivos_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mp-arquivos'
    AND (
      mp_uuid_seguro((storage.foldername(name))[1]) IN (SELECT mi_user_titular_ids())
      OR mp_parceiro_pode_acessar(mp_uuid_seguro((storage.foldername(name))[1]))
    )
  );

DROP POLICY IF EXISTS "mp_arquivos_insert" ON storage.objects;
CREATE POLICY "mp_arquivos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mp-arquivos'
    AND (
      mp_uuid_seguro((storage.foldername(name))[1]) IN (SELECT mi_user_titular_ids())
      OR mp_parceiro_pode_acessar(mp_uuid_seguro((storage.foldername(name))[1]))
    )
  );

DROP POLICY IF EXISTS "mp_arquivos_update" ON storage.objects;
CREATE POLICY "mp_arquivos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'mp-arquivos'
    AND (
      mp_uuid_seguro((storage.foldername(name))[1]) IN (SELECT mi_user_titular_ids())
      OR mp_parceiro_pode_acessar(mp_uuid_seguro((storage.foldername(name))[1]))
    )
  );

DROP POLICY IF EXISTS "mp_arquivos_delete" ON storage.objects;
CREATE POLICY "mp_arquivos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mp-arquivos'
    AND (
      mp_uuid_seguro((storage.foldername(name))[1]) IN (SELECT mi_user_titular_ids())
      OR mp_parceiro_pode_acessar(mp_uuid_seguro((storage.foldername(name))[1]))
    )
  );

-- Módulo no catálogo.
-- A tabela modulos tem slug NOT NULL, então gravamos nome + slug.
INSERT INTO modulos (nome, slug, ativo)
SELECT 'Medicina Preventiva', 'medicina-preventiva', true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos
  WHERE nome = 'Medicina Preventiva' OR slug = 'medicina-preventiva'
);

-- Lista de sintomas da clínica (usada pelo botão "Lista sugerida" no painel)
CREATE OR REPLACE FUNCTION mp_seed_sintomas(p_parceiro_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_inseridos INT := 0;
BEGIN
  IF p_parceiro_id IS NULL OR p_parceiro_id <> mp_parceiro_do_usuario() THEN
    RAISE EXCEPTION 'Sem permissão para este parceiro';
  END IF;

  WITH sugeridos(nome, categoria, gravidade, ordem) AS (
    VALUES
      ('Sede excessiva (polidipsia)', 'Metabólico', 'media', 1),
      ('Urinar com frequência, inclusive à noite (poliúria/nictúria)', 'Urinário', 'media', 2),
      ('Fome excessiva (polifagia)', 'Metabólico', 'media', 3),
      ('Cansaço, fraqueza ou sonolência', 'Geral', 'media', 4),
      ('Visão embaçada/turva', 'Visão', 'alta', 5),
      ('Formigamento ou dormência nas mãos e pés', 'Neurológico', 'alta', 6),
      ('Feridas que demoram para cicatrizar', 'Dermatológico', 'alta', 7),
      ('Boca e pele secas', 'Dermatológico', 'baixa', 8),
      ('Desidratação', 'Geral', 'alta', 9),
      ('Perda de peso sem explicação', 'Metabólico', 'alta', 10),
      ('Infecções recorrentes, inclusive urinárias e de pele', 'Infeccioso', 'alta', 11)
  )
  INSERT INTO mp_sintomas_catalogo (parceiro_id, nome, categoria, gravidade_padrao, ordem)
  SELECT p_parceiro_id, s.nome, s.categoria, s.gravidade, s.ordem
  FROM sugeridos s
  WHERE NOT EXISTS (
    SELECT 1 FROM mp_sintomas_catalogo c
    WHERE c.parceiro_id = p_parceiro_id AND lower(c.nome) = lower(s.nome)
  );

  GET DIAGNOSTICS v_inseridos = ROW_COUNT;
  RETURN v_inseridos;
END
$fn$;
