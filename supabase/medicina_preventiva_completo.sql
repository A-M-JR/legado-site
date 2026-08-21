-- ============================================================
-- MEDICINA PREVENTIVA — script único (migrations 009 a 013)
-- Cole tudo no SQL Editor do Supabase e rode de uma vez.
-- Pode rodar mais de uma vez sem quebrar (IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- ------------------------------------------------------------
-- 009_parceiro_operador.sql
-- ------------------------------------------------------------

-- 009 — Papel parceiro_operador (funcionária da clínica)
-- Rodar no SQL Editor do Supabase

-- 1) Liberar o novo papel na coluna role de usuarios_app
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'usuarios_app'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE usuarios_app DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE usuarios_app
  ADD CONSTRAINT usuarios_app_role_check
  CHECK (role IN ('admin_master', 'parceiro_admin', 'parceiro_operador', 'titular', 'familiar'));

-- 1.1) Identificação da equipe da clínica (o titular tem nome/email na tabela titulares;
-- a operadora não tem titular vinculado, então guardamos aqui)
ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS email TEXT;

-- 2) Helpers de identidade do parceiro

-- Parceiro do usuário logado quando ele é equipe da clínica (admin ou operador)
CREATE OR REPLACE FUNCTION mp_parceiro_do_usuario()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT parceiro_id
  FROM usuarios_app
  WHERE auth_id = auth.uid()
    AND role IN ('parceiro_admin', 'parceiro_operador')
    AND COALESCE(status, 'ativo') = 'ativo'
    AND parceiro_id IS NOT NULL
  LIMIT 1
$$;

-- Parceiro do usuário logado seja ele equipe, titular ou familiar.
-- O vínculo com a clínica mora em usuarios_app (a tabela titulares não tem parceiro_id).
CREATE OR REPLACE FUNCTION mp_parceiro_do_contexto()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT ua.parceiro_id
       FROM usuarios_app ua
      WHERE ua.auth_id = auth.uid()
        AND ua.parceiro_id IS NOT NULL
      LIMIT 1),
    (SELECT ua.parceiro_id
       FROM usuarios_app ua
      WHERE ua.titular_id IN (SELECT mi_user_titular_ids())
        AND ua.parceiro_id IS NOT NULL
      LIMIT 1)
  )
$$;

-- O titular informado pertence à carteira do parceiro do usuário logado?
CREATE OR REPLACE FUNCTION mp_parceiro_pode_acessar(p_titular_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_titular_id IS NOT NULL
     AND mp_parceiro_do_usuario() IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM usuarios_app ua
       WHERE ua.titular_id = p_titular_id
         AND ua.parceiro_id = mp_parceiro_do_usuario()
     )
$$;

-- Acesso a dados do módulo: paciente/familiar (mi_can_access) OU equipe da clínica
CREATE OR REPLACE FUNCTION mp_can_access(p_titular_id UUID, p_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mi_can_access(p_titular_id, p_auth_id) OR mp_parceiro_pode_acessar(p_titular_id)
$$;


-- ------------------------------------------------------------
-- 010_medicina_preventiva_core.sql
-- ------------------------------------------------------------

-- 010 — Medicina Preventiva: tabelas do paciente + RLS
-- Depende de: 001_melhor_idade.sql (mi_can_access) e 009_parceiro_operador.sql

-- Rotina preventiva
CREATE TABLE IF NOT EXISTS mp_rotina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hora TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('medicacao', 'exercicio', 'hidratacao', 'medicao', 'alimentacao', 'jejum', 'outro')),
  periodo TEXT NOT NULL CHECK (periodo IN ('manha', 'tarde', 'noite')),
  valor_alvo TEXT NOT NULL DEFAULT '',
  unidade_medida TEXT NOT NULL DEFAULT '',
  responsavel TEXT,
  feito BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Receitas (o paciente cadastra)
CREATE TABLE IF NOT EXISTS mp_receitas (
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

-- Consultas: SOMENTE a clínica cria; o paciente apenas visualiza
CREATE TABLE IF NOT EXISTS mp_consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID NOT NULL REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parceiro_id UUID REFERENCES parceiros(id) ON DELETE SET NULL,
  unidade_id UUID,
  data_hora TIMESTAMPTZ NOT NULL,
  profissional TEXT NOT NULL DEFAULT '',
  especialidade TEXT NOT NULL DEFAULT '',
  local TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online', 'retorno', 'exame')),
  observacoes TEXT NOT NULL DEFAULT '',
  origem TEXT NOT NULL DEFAULT 'clinica' CHECK (origem IN ('paciente', 'clinica')),
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'realizada', 'cancelada', 'faltou')),
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exames e laudos: o paciente cadastra os dele, a clínica solicita/agenda e anexa laudo
CREATE TABLE IF NOT EXISTS mp_exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID NOT NULL REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parceiro_id UUID REFERENCES parceiros(id) ON DELETE SET NULL,
  unidade_id UUID,
  nome_exame TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'laboratorial' CHECK (tipo IN ('laboratorial', 'imagem', 'outro')),
  medico_solicitante TEXT NOT NULL DEFAULT '',
  especialidade TEXT NOT NULL DEFAULT '',
  laboratorio TEXT NOT NULL DEFAULT '',
  data_solicitacao DATE,
  data_hora_agendada TIMESTAMPTZ,
  data_realizacao DATE,
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'agendado', 'realizado', 'resultado_disponivel', 'cancelado')),
  resultado_resumo TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  arquivos JSONB NOT NULL DEFAULT '[]'::jsonb,
  origem TEXT NOT NULL DEFAULT 'paciente' CHECK (origem IN ('paciente', 'clinica')),
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notificações do paciente
CREATE TABLE IF NOT EXISTS mp_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  hora_label TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'exame', 'sintoma', 'receita', 'rotina', 'sistema')),
  lida BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_rotina_scope ON mp_rotina(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mp_receitas_scope ON mp_receitas(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mp_consultas_titular ON mp_consultas(titular_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_mp_consultas_parceiro ON mp_consultas(parceiro_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_mp_exames_titular ON mp_exames(titular_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mp_exames_parceiro ON mp_exames(parceiro_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mp_notificacoes_scope ON mp_notificacoes(titular_id, auth_id);

ALTER TABLE mp_rotina ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_notificacoes ENABLE ROW LEVEL SECURITY;

-- Policies padrão: paciente/familiar + equipe da clínica
DO $policies$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['mp_rotina', 'mp_receitas', 'mp_notificacoes']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_update ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_delete ON %I', t, t);

    EXECUTE format('CREATE POLICY %I_select ON %I FOR SELECT USING (mp_can_access(titular_id, auth_id))', t, t);
    EXECUTE format('CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (auth_id = auth.uid() OR mp_parceiro_pode_acessar(titular_id))', t, t);
    EXECUTE format('CREATE POLICY %I_update ON %I FOR UPDATE USING (mp_can_access(titular_id, auth_id))', t, t);
    EXECUTE format('CREATE POLICY %I_delete ON %I FOR DELETE USING (mp_can_access(titular_id, auth_id))', t, t);
  END LOOP;
END
$policies$;

-- mp_consultas: paciente só lê. Escrita é exclusiva da equipe da clínica.
DROP POLICY IF EXISTS mp_consultas_select ON mp_consultas;
DROP POLICY IF EXISTS mp_consultas_insert ON mp_consultas;
DROP POLICY IF EXISTS mp_consultas_update ON mp_consultas;
DROP POLICY IF EXISTS mp_consultas_delete ON mp_consultas;

CREATE POLICY mp_consultas_select ON mp_consultas
  FOR SELECT USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_consultas_insert ON mp_consultas
  FOR INSERT WITH CHECK (mp_parceiro_pode_acessar(titular_id));
CREATE POLICY mp_consultas_update ON mp_consultas
  FOR UPDATE USING (mp_parceiro_pode_acessar(titular_id));
CREATE POLICY mp_consultas_delete ON mp_consultas
  FOR DELETE USING (mp_parceiro_pode_acessar(titular_id));

-- mp_exames: paciente cria os dele e pode anexar laudo; clínica gerencia todos da carteira
DROP POLICY IF EXISTS mp_exames_select ON mp_exames;
DROP POLICY IF EXISTS mp_exames_insert ON mp_exames;
DROP POLICY IF EXISTS mp_exames_update ON mp_exames;
DROP POLICY IF EXISTS mp_exames_delete ON mp_exames;

CREATE POLICY mp_exames_select ON mp_exames
  FOR SELECT USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_exames_insert ON mp_exames
  FOR INSERT WITH CHECK (auth_id = auth.uid() OR mp_parceiro_pode_acessar(titular_id));
CREATE POLICY mp_exames_update ON mp_exames
  FOR UPDATE USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_exames_delete ON mp_exames
  FOR DELETE USING (
    (origem = 'paciente' AND mi_can_access(titular_id, auth_id))
    OR mp_parceiro_pode_acessar(titular_id)
  );

-- updated_at automático
CREATE OR REPLACE FUNCTION mp_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS trg_mp_consultas_touch ON mp_consultas;
CREATE TRIGGER trg_mp_consultas_touch BEFORE UPDATE ON mp_consultas
  FOR EACH ROW EXECUTE FUNCTION mp_touch_updated_at();

DROP TRIGGER IF EXISTS trg_mp_exames_touch ON mp_exames;
CREATE TRIGGER trg_mp_exames_touch BEFORE UPDATE ON mp_exames
  FOR EACH ROW EXECUTE FUNCTION mp_touch_updated_at();


-- ------------------------------------------------------------
-- 011_medicina_preventiva_parceiro.sql
-- ------------------------------------------------------------

-- 011 — Medicina Preventiva: lado da clínica (unidades, sintomas, notificações)
-- Depende de: 009_parceiro_operador.sql e 010_medicina_preventiva_core.sql

-- Unidades da clínica — é aqui que mora o WhatsApp
CREATE TABLE IF NOT EXISTS mp_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp_numero TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  endereco TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Config geral do parceiro
CREATE TABLE IF NOT EXISTS mp_parceiro_config (
  parceiro_id UUID PRIMARY KEY REFERENCES parceiros(id) ON DELETE CASCADE,
  whatsapp_mensagem_padrao TEXT NOT NULL DEFAULT 'Olá! Registrei novos sintomas no app.',
  unidade_padrao_id UUID REFERENCES mp_unidades(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unidade de referência do paciente
CREATE TABLE IF NOT EXISTS mp_paciente_unidade (
  titular_id UUID PRIMARY KEY REFERENCES titulares(id) ON DELETE CASCADE,
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES mp_unidades(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cadastro de sintomas — por clínica
CREATE TABLE IF NOT EXISTS mp_sintomas_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT '',
  gravidade_padrao TEXT NOT NULL DEFAULT 'media' CHECK (gravidade_padrao IN ('baixa', 'media', 'alta')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS mp_sintomas_catalogo_nome_unico
  ON mp_sintomas_catalogo(parceiro_id, lower(nome));

-- Registros de sintomas enviados pelo paciente
CREATE TABLE IF NOT EXISTS mp_registros_sintomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID NOT NULL REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parceiro_id UUID REFERENCES parceiros(id) ON DELETE SET NULL,
  unidade_id UUID REFERENCES mp_unidades(id) ON DELETE SET NULL,
  sintomas JSONB NOT NULL DEFAULT '[]'::jsonb,
  intensidade TEXT NOT NULL DEFAULT 'media' CHECK (intensidade IN ('leve', 'media', 'forte')),
  observacao TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'respondido', 'arquivado')),
  whatsapp_enviado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notificações do painel do parceiro
CREATE TABLE IF NOT EXISTS parceiro_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('sintoma', 'consulta', 'exame', 'sistema')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  link TEXT,
  referencia_id UUID,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_unidades_parceiro ON mp_unidades(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_mp_sintomas_catalogo_parceiro ON mp_sintomas_catalogo(parceiro_id, ativo);
CREATE INDEX IF NOT EXISTS idx_mp_registros_sintomas_parceiro ON mp_registros_sintomas(parceiro_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mp_registros_sintomas_titular ON mp_registros_sintomas(titular_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parceiro_notificacoes ON parceiro_notificacoes(parceiro_id, lida, created_at DESC);

ALTER TABLE mp_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_parceiro_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_paciente_unidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_sintomas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_registros_sintomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiro_notificacoes ENABLE ROW LEVEL SECURITY;

-- Unidades e catálogo: leitura para quem é do parceiro (equipe ou paciente), escrita só da equipe
DROP POLICY IF EXISTS mp_unidades_select ON mp_unidades;
DROP POLICY IF EXISTS mp_unidades_write ON mp_unidades;
CREATE POLICY mp_unidades_select ON mp_unidades
  FOR SELECT USING (parceiro_id = mp_parceiro_do_contexto());
CREATE POLICY mp_unidades_write ON mp_unidades
  FOR ALL USING (parceiro_id = mp_parceiro_do_usuario())
  WITH CHECK (parceiro_id = mp_parceiro_do_usuario());

DROP POLICY IF EXISTS mp_parceiro_config_select ON mp_parceiro_config;
DROP POLICY IF EXISTS mp_parceiro_config_write ON mp_parceiro_config;
CREATE POLICY mp_parceiro_config_select ON mp_parceiro_config
  FOR SELECT USING (parceiro_id = mp_parceiro_do_contexto());
CREATE POLICY mp_parceiro_config_write ON mp_parceiro_config
  FOR ALL USING (parceiro_id = mp_parceiro_do_usuario())
  WITH CHECK (parceiro_id = mp_parceiro_do_usuario());

DROP POLICY IF EXISTS mp_sintomas_catalogo_select ON mp_sintomas_catalogo;
DROP POLICY IF EXISTS mp_sintomas_catalogo_write ON mp_sintomas_catalogo;
CREATE POLICY mp_sintomas_catalogo_select ON mp_sintomas_catalogo
  FOR SELECT USING (parceiro_id = mp_parceiro_do_contexto());
CREATE POLICY mp_sintomas_catalogo_write ON mp_sintomas_catalogo
  FOR ALL USING (parceiro_id = mp_parceiro_do_usuario())
  WITH CHECK (parceiro_id = mp_parceiro_do_usuario());

-- Vínculo paciente/unidade: paciente lê o seu, clínica gerencia
DROP POLICY IF EXISTS mp_paciente_unidade_select ON mp_paciente_unidade;
DROP POLICY IF EXISTS mp_paciente_unidade_write ON mp_paciente_unidade;
CREATE POLICY mp_paciente_unidade_select ON mp_paciente_unidade
  FOR SELECT USING (
    titular_id IN (SELECT mi_user_titular_ids())
    OR mp_parceiro_pode_acessar(titular_id)
  );
CREATE POLICY mp_paciente_unidade_write ON mp_paciente_unidade
  FOR ALL USING (mp_parceiro_pode_acessar(titular_id))
  WITH CHECK (mp_parceiro_pode_acessar(titular_id));

-- Registros de sintomas: paciente insere e lê os seus; clínica lê e atualiza status
DROP POLICY IF EXISTS mp_registros_sintomas_select ON mp_registros_sintomas;
DROP POLICY IF EXISTS mp_registros_sintomas_insert ON mp_registros_sintomas;
DROP POLICY IF EXISTS mp_registros_sintomas_update ON mp_registros_sintomas;
DROP POLICY IF EXISTS mp_registros_sintomas_delete ON mp_registros_sintomas;
CREATE POLICY mp_registros_sintomas_select ON mp_registros_sintomas
  FOR SELECT USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_registros_sintomas_insert ON mp_registros_sintomas
  FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY mp_registros_sintomas_update ON mp_registros_sintomas
  FOR UPDATE USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_registros_sintomas_delete ON mp_registros_sintomas
  FOR DELETE USING (mi_can_access(titular_id, auth_id));

-- Notificações do painel
DROP POLICY IF EXISTS parceiro_notificacoes_select ON parceiro_notificacoes;
DROP POLICY IF EXISTS parceiro_notificacoes_update ON parceiro_notificacoes;
DROP POLICY IF EXISTS parceiro_notificacoes_insert ON parceiro_notificacoes;
CREATE POLICY parceiro_notificacoes_select ON parceiro_notificacoes
  FOR SELECT USING (parceiro_id = mp_parceiro_do_usuario());
CREATE POLICY parceiro_notificacoes_update ON parceiro_notificacoes
  FOR UPDATE USING (parceiro_id = mp_parceiro_do_usuario());
CREATE POLICY parceiro_notificacoes_insert ON parceiro_notificacoes
  FOR INSERT WITH CHECK (parceiro_id = mp_parceiro_do_contexto());

DROP TRIGGER IF EXISTS trg_mp_registros_sintomas_touch ON mp_registros_sintomas;
CREATE TRIGGER trg_mp_registros_sintomas_touch BEFORE UPDATE ON mp_registros_sintomas
  FOR EACH ROW EXECUTE FUNCTION mp_touch_updated_at();

-- Sintoma registrado -> notificação no painel da clínica
CREATE OR REPLACE FUNCTION mp_notificar_sintoma()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_nome TEXT;
  v_lista TEXT;
BEGIN
  IF NEW.parceiro_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT nome INTO v_nome FROM titulares WHERE id = NEW.titular_id;

  SELECT string_agg(item ->> 'nome', ', ')
    INTO v_lista
    FROM jsonb_array_elements(NEW.sintomas) AS item;

  INSERT INTO parceiro_notificacoes (parceiro_id, titular_id, tipo, titulo, descricao, link, referencia_id)
  VALUES (
    NEW.parceiro_id,
    NEW.titular_id,
    'sintoma',
    COALESCE(v_nome, 'Paciente') || ' registrou sintomas',
    COALESCE(NULLIF(v_lista, ''), NEW.observacao),
    '/admin-parceiro/sintomas',
    NEW.id
  );

  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS trg_mp_notificar_sintoma ON mp_registros_sintomas;
CREATE TRIGGER trg_mp_notificar_sintoma AFTER INSERT ON mp_registros_sintomas
  FOR EACH ROW EXECUTE FUNCTION mp_notificar_sintoma();

-- Consulta agendada/remarcada/cancelada pela clínica -> notificação do paciente
CREATE OR REPLACE FUNCTION mp_notificar_consulta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_titulo TEXT;
  v_quando TEXT;
BEGIN
  v_quando := to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI');

  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Nova consulta agendada';
  ELSIF NEW.status = 'cancelada' AND OLD.status IS DISTINCT FROM 'cancelada' THEN
    v_titulo := 'Consulta cancelada';
  ELSIF NEW.data_hora IS DISTINCT FROM OLD.data_hora THEN
    v_titulo := 'Consulta remarcada';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO mp_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link)
  VALUES (
    NEW.titular_id,
    NEW.auth_id,
    v_titulo,
    concat_ws(' · ', NULLIF(NEW.profissional, ''), NULLIF(NEW.local, ''), v_quando),
    to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'),
    'consulta',
    '/medicina-preventiva/receitas-consultas'
  );

  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS trg_mp_notificar_consulta ON mp_consultas;
CREATE TRIGGER trg_mp_notificar_consulta AFTER INSERT OR UPDATE ON mp_consultas
  FOR EACH ROW EXECUTE FUNCTION mp_notificar_consulta();

-- Exame lançado/atualizado pela clínica -> notificação do paciente
CREATE OR REPLACE FUNCTION mp_notificar_exame()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_titulo TEXT;
BEGIN
  IF NEW.origem <> 'clinica' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Novo exame solicitado';
  ELSIF NEW.status = 'resultado_disponivel' AND OLD.status IS DISTINCT FROM 'resultado_disponivel' THEN
    v_titulo := 'Resultado de exame disponível';
  ELSIF NEW.data_hora_agendada IS DISTINCT FROM OLD.data_hora_agendada AND NEW.data_hora_agendada IS NOT NULL THEN
    v_titulo := 'Exame agendado';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO mp_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link)
  VALUES (
    NEW.titular_id,
    NEW.auth_id,
    v_titulo,
    concat_ws(' · ', NEW.nome_exame, NULLIF(NEW.laboratorio, '')),
    to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'),
    'exame',
    '/medicina-preventiva/exames-laudos'
  );

  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS trg_mp_notificar_exame ON mp_exames;
CREATE TRIGGER trg_mp_notificar_exame AFTER INSERT OR UPDATE ON mp_exames
  FOR EACH ROW EXECUTE FUNCTION mp_notificar_exame();

-- FKs de unidade nas tabelas do core (criadas antes de mp_unidades existir)
DO $fks$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mp_consultas_unidade_id_fkey') THEN
    ALTER TABLE mp_consultas
      ADD CONSTRAINT mp_consultas_unidade_id_fkey
      FOREIGN KEY (unidade_id) REFERENCES mp_unidades(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mp_exames_unidade_id_fkey') THEN
    ALTER TABLE mp_exames
      ADD CONSTRAINT mp_exames_unidade_id_fkey
      FOREIGN KEY (unidade_id) REFERENCES mp_unidades(id) ON DELETE SET NULL;
  END IF;
END
$fks$;


-- ------------------------------------------------------------
-- 012_medicina_preventiva_storage_seed.sql
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- 013_medicina_preventiva_familia.sql
-- ------------------------------------------------------------

-- 013 — Medicina Preventiva: rede de familiares/cuidadores + mensagens
-- Depende de: 001 (mi_can_access, mi_user_titular_ids) e 010
--
-- IMPORTANTE: estas duas tabelas são PRIVADAS do paciente e da família.
-- A equipe da clínica NÃO tem acesso (por isso usamos mi_can_access,
-- e não mp_can_access como no resto do módulo).

CREATE TABLE IF NOT EXISTS mp_rede (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  relacao TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mp_familia_mensagens (
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

CREATE INDEX IF NOT EXISTS idx_mp_rede_scope ON mp_rede(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mp_familia_mensagens_scope
  ON mp_familia_mensagens(titular_id, auth_id, pessoa_id);

ALTER TABLE mp_rede ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_familia_mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mp_rede_select ON mp_rede;
DROP POLICY IF EXISTS mp_rede_insert ON mp_rede;
DROP POLICY IF EXISTS mp_rede_update ON mp_rede;
DROP POLICY IF EXISTS mp_rede_delete ON mp_rede;

CREATE POLICY mp_rede_select ON mp_rede FOR SELECT USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_rede_insert ON mp_rede FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY mp_rede_update ON mp_rede FOR UPDATE USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_rede_delete ON mp_rede FOR DELETE USING (mi_can_access(titular_id, auth_id));

DROP POLICY IF EXISTS mp_familia_mensagens_select ON mp_familia_mensagens;
DROP POLICY IF EXISTS mp_familia_mensagens_insert ON mp_familia_mensagens;
DROP POLICY IF EXISTS mp_familia_mensagens_update ON mp_familia_mensagens;
DROP POLICY IF EXISTS mp_familia_mensagens_delete ON mp_familia_mensagens;

CREATE POLICY mp_familia_mensagens_select ON mp_familia_mensagens
  FOR SELECT USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_familia_mensagens_insert ON mp_familia_mensagens
  FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY mp_familia_mensagens_update ON mp_familia_mensagens
  FOR UPDATE USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_familia_mensagens_delete ON mp_familia_mensagens
  FOR DELETE USING (mi_can_access(titular_id, auth_id));

-- ------------------------------------------------------------
-- Convite público: quem recebe o link/QR posta sem ter conta
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION mp_rede_pertence_titular(p_rede_id UUID, p_titular_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1
    FROM mp_rede r
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
$fn$;

CREATE OR REPLACE FUNCTION mp_get_pessoa_publica(p_titular_id UUID, p_pessoa_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
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
    FROM mp_rede r
    WHERE r.id = p_pessoa_id::uuid
      AND mp_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  RETURN v_result;
END;
$fn$;

CREATE OR REPLACE FUNCTION mp_enviar_mensagem_publica(
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
AS $fn$
DECLARE
  v_auth_id UUID;
  v_id UUID;
BEGIN
  SELECT auth_id INTO v_auth_id FROM titulares WHERE id = p_titular_id;

  IF v_auth_id IS NULL AND p_pessoa_id ~ '^[0-9a-f]{8}-' THEN
    SELECT r.auth_id INTO v_auth_id
    FROM mp_rede r
    WHERE r.id = p_pessoa_id::uuid AND mp_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Paciente não encontrado';
  END IF;

  IF p_pessoa_id = 'eu' THEN
    IF NOT EXISTS (SELECT 1 FROM titulares WHERE id = p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSIF p_pessoa_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    IF NOT mp_rede_pertence_titular(p_pessoa_id::uuid, p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSE
    RAISE EXCEPTION 'Pessoa inválida';
  END IF;

  INSERT INTO mp_familia_mensagens (
    titular_id, auth_id, pessoa_id, mensagem, remetente, anonimo, media_url, media_tipo
  )
  VALUES (
    p_titular_id, v_auth_id, p_pessoa_id, p_mensagem, p_remetente, p_anonimo, p_media_url, p_media_tipo
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION mp_rede_pertence_titular(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mp_get_pessoa_publica(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mp_enviar_mensagem_publica(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT)
  TO anon, authenticated;


-- ============================================================
-- Conferência rápida (opcional): rode depois e veja se retorna tudo
-- ============================================================
-- SELECT nome, ativo FROM modulos WHERE nome = 'Medicina Preventiva';
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name LIKE 'mp_%' ORDER BY 1;
-- SELECT id, public FROM storage.buckets WHERE id = 'mp-arquivos';
