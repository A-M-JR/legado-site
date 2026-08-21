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
