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
