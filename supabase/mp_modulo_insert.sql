-- ============================================================
-- Só o que faltou: cadastrar o módulo no catálogo.
-- A tabela modulos é (id, slug NOT NULL UNIQUE, nome, ativo).
-- Pode rodar quantas vezes quiser.
-- ============================================================

INSERT INTO modulos (nome, slug, ativo)
SELECT 'Medicina Preventiva', 'medicina-preventiva', true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos
  WHERE nome = 'Medicina Preventiva' OR slug = 'medicina-preventiva'
);

-- Conferência
SELECT id, nome, slug, ativo FROM modulos ORDER BY nome;
