-- Família / rede de apoio (Melhor Idade)
-- Rodar após 001_melhor_idade.sql

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
