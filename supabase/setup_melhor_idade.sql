-- ============================================================
-- MELHOR IDADE — setup completo (rode UMA vez no Supabase)
-- Dashboard → SQL Editor → New query → colar tudo → Run
-- ============================================================

-- ---------- 001: schema + RLS ----------

CREATE OR REPLACE FUNCTION mi_user_titular_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT titular_id FROM usuarios_app
  WHERE auth_id = auth.uid() AND titular_id IS NOT NULL
  UNION
  SELECT id FROM titulares WHERE auth_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION mi_can_access(p_titular_id UUID, p_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_auth_id = auth.uid()
    OR (p_titular_id IS NOT NULL AND p_titular_id IN (SELECT mi_user_titular_ids()))
$$;

CREATE TABLE IF NOT EXISTS mi_perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  nome TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  rede JSONB NOT NULL DEFAULT '[]'::jsonb,
  humor_atual TEXT CHECK (humor_atual IN ('bem', 'mais_ou_menos', 'precisa_apoio')),
  humor_atualizado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS mi_perfis_titular_id_unique
  ON mi_perfis(titular_id) WHERE titular_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS mi_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('medicacao', 'compromisso', 'cuidado', 'momento')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  horario TEXT,
  feito BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_cuidados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hora TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('remedio', 'comida', 'higiene', 'atividade')),
  periodo TEXT NOT NULL CHECK (periodo IN ('manha', 'tarde', 'noite')),
  responsavel TEXT,
  feito BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_registros_saude (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  time_label TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicamento TEXT NOT NULL,
  dosagem TEXT NOT NULL DEFAULT '',
  frequencia TEXT NOT NULL DEFAULT '',
  inicio DATE,
  validade DATE,
  medico TEXT NOT NULL DEFAULT '',
  especialidade TEXT NOT NULL DEFAULT '',
  data_consulta TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  medico TEXT NOT NULL,
  local TEXT,
  tipo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_historias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL DEFAULT '',
  privado BOOLEAN NOT NULL DEFAULT false,
  media_url TEXT,
  media_tipo TEXT CHECK (media_tipo IN ('foto', 'video')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_familia_memorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pessoa_id TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  remetente TEXT NOT NULL,
  anonimo BOOLEAN NOT NULL DEFAULT false,
  media_url TEXT,
  media_tipo TEXT CHECK (media_tipo IN ('foto', 'video')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('texto', 'audio', 'video')),
  remetente TEXT NOT NULL,
  relacao TEXT NOT NULL DEFAULT '',
  hora_label TEXT NOT NULL DEFAULT '',
  conteudo TEXT,
  duracao TEXT,
  thumbnail_url TEXT,
  audio_url TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  hora_label TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('mensagem', 'medicacao', 'consulta', 'cuidado', 'sistema')),
  lida BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_momentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'video')),
  url TEXT NOT NULL,
  favorito BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mi_contatos_apoio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  relacao TEXT NOT NULL DEFAULT '',
  foto_url TEXT NOT NULL DEFAULT '',
  telefone TEXT,
  emergencia BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mi_tarefas_scope ON mi_tarefas(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_cuidados_scope ON mi_cuidados(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_registros_saude_scope ON mi_registros_saude(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_historias_scope ON mi_historias(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_familia_memorias_scope ON mi_familia_memorias(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_mensagens_scope ON mi_mensagens(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_notificacoes_scope ON mi_notificacoes(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_momentos_scope ON mi_momentos(titular_id, auth_id);

ALTER TABLE mi_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_cuidados ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_registros_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_historias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_familia_memorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_momentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mi_contatos_apoio ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'mi_perfis', 'mi_tarefas', 'mi_cuidados', 'mi_registros_saude',
    'mi_receitas', 'mi_consultas', 'mi_historias', 'mi_familia_memorias',
    'mi_mensagens', 'mi_notificacoes', 'mi_momentos', 'mi_contatos_apoio'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_update ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_delete ON %I', t, t);

    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT USING (mi_can_access(titular_id, auth_id))',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (auth_id = auth.uid())',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE USING (mi_can_access(titular_id, auth_id))',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE USING (mi_can_access(titular_id, auth_id))',
      t, t
    );
  END LOOP;
END $$;

-- ---------- 002: família (mi_rede) ----------

CREATE TABLE IF NOT EXISTS mi_rede (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  relacao TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mi_rede_scope ON mi_rede(titular_id, auth_id);

ALTER TABLE mi_rede ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mi_rede_select ON mi_rede;
DROP POLICY IF EXISTS mi_rede_insert ON mi_rede;
DROP POLICY IF EXISTS mi_rede_update ON mi_rede;
DROP POLICY IF EXISTS mi_rede_delete ON mi_rede;

CREATE POLICY mi_rede_select ON mi_rede FOR SELECT USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mi_rede_insert ON mi_rede FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY mi_rede_update ON mi_rede FOR UPDATE USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mi_rede_delete ON mi_rede FOR DELETE USING (mi_can_access(titular_id, auth_id));

-- ---------- 004: campos extras mi_receitas ----------

ALTER TABLE mi_receitas
  ADD COLUMN IF NOT EXISTS ativa BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS observacoes TEXT NOT NULL DEFAULT '';

-- ---------- opcional: bucket mi-midias (app usa "titulares" por padrão) ----------

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

-- ---------- 005: recordações públicas MI ----------

UPDATE mi_rede r
SET titular_id = t.id
FROM titulares t
WHERE r.titular_id IS NULL AND r.auth_id = t.auth_id;

CREATE OR REPLACE FUNCTION mi_rede_pertence_titular(p_rede_id UUID, p_titular_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM mi_rede r
    WHERE r.id = p_rede_id
      AND (
        r.titular_id = p_titular_id
        OR (
          r.titular_id IS NULL
          AND EXISTS (
            SELECT 1 FROM titulares t
            WHERE t.id = p_titular_id AND t.auth_id = r.auth_id
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION mi_get_homenageado_memoria(p_titular_id UUID, p_pessoa_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_pessoa_id = 'eu' THEN
    SELECT json_build_object('nome', nome, 'imagem_url', imagem_url)
    INTO v_result
    FROM titulares
    WHERE id = p_titular_id;
  ELSE
    SELECT json_build_object('nome', r.nome, 'imagem_url', r.foto_url)
    INTO v_result
    FROM mi_rede r
    WHERE r.id = p_pessoa_id::uuid
      AND mi_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION mi_enviar_memoria_publica(
  p_titular_id UUID,
  p_pessoa_id TEXT,
  p_mensagem TEXT,
  p_remetente TEXT,
  p_anonimo BOOLEAN DEFAULT false,
  p_media_url TEXT DEFAULT NULL,
  p_media_tipo TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id UUID;
  v_id UUID;
BEGIN
  SELECT auth_id INTO v_auth_id FROM titulares WHERE id = p_titular_id;

  IF v_auth_id IS NULL AND p_pessoa_id ~ '^[0-9a-f]{8}-' THEN
    SELECT r.auth_id INTO v_auth_id
    FROM mi_rede r
    WHERE r.id = p_pessoa_id::uuid AND mi_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Titular não encontrado';
  END IF;

  IF p_pessoa_id = 'eu' THEN
    IF NOT EXISTS (SELECT 1 FROM titulares WHERE id = p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSIF p_pessoa_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    IF NOT mi_rede_pertence_titular(p_pessoa_id::uuid, p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSE
    RAISE EXCEPTION 'Pessoa inválida';
  END IF;

  INSERT INTO mi_familia_memorias (
    titular_id, auth_id, pessoa_id, mensagem, remetente, anonimo, media_url, media_tipo
  )
  VALUES (
    p_titular_id, v_auth_id, p_pessoa_id, p_mensagem, p_remetente, p_anonimo, p_media_url, p_media_tipo
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mi_rede_pertence_titular(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mi_get_homenageado_memoria(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mi_enviar_memoria_publica(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
