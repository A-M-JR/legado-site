-- Campos extras em mi_receitas (Melhor Idade)
-- Rodar no SQL Editor se a tabela já existir

ALTER TABLE mi_receitas
  ADD COLUMN IF NOT EXISTS ativa BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS observacoes TEXT NOT NULL DEFAULT '';
