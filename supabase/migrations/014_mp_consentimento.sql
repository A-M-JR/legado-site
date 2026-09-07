-- 014 — Medicina Preventiva: termo de consentimento (LGPD)
-- Depende de: 009_parceiro_operador.sql (mp_can_access), 010_medicina_preventiva_core.sql
--
-- Registra o aceite do paciente ao termo que autoriza a Medicina Preventiva a
-- acessar informações de outros médicos inseridas no iLC do paciente.

CREATE TABLE IF NOT EXISTS mp_consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  versao TEXT NOT NULL,
  aceito_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_consentimentos_scope
  ON mp_consentimentos(titular_id, auth_id, versao);

ALTER TABLE mp_consentimentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mp_consentimentos_select ON mp_consentimentos;
DROP POLICY IF EXISTS mp_consentimentos_insert ON mp_consentimentos;

-- Paciente/familiar e a clínica leem o aceite; só o próprio usuário registra o dele.
CREATE POLICY mp_consentimentos_select ON mp_consentimentos
  FOR SELECT USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_consentimentos_insert ON mp_consentimentos
  FOR INSERT WITH CHECK (auth_id = auth.uid());
