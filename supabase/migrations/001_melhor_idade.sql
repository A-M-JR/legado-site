-- Melhor Idade — schema + RLS
-- Rodar no SQL Editor do Supabase

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

-- Perfis
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

-- Rotina do dia
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

-- Cuidados
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

-- Saúde
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

-- Histórias e memórias
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

-- Mensagens e notificações
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_mi_tarefas_scope ON mi_tarefas(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_cuidados_scope ON mi_cuidados(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_registros_saude_scope ON mi_registros_saude(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_historias_scope ON mi_historias(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_familia_memorias_scope ON mi_familia_memorias(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_mensagens_scope ON mi_mensagens(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_notificacoes_scope ON mi_notificacoes(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mi_momentos_scope ON mi_momentos(titular_id, auth_id);

-- RLS
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

-- Policies (padrão para todas as tabelas mi_*)
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

-- Storage bucket mi-midias
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
