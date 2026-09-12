-- 024_rls_dependentes_recordacoes.sql
-- Fecha vazamento de PII anon (cpf/email/telefone) e aperta recordacoes.
-- Idempotente. NÃO apaga dados.

-- ===== 1) Restrição por COLUNA para o papel anon =====
-- As páginas públicas (recordacoes-publicas, sucesso) só leem colunas não sensíveis
-- por id. Removemos o acesso do anon às colunas sensíveis (cpf, email, telefone,
-- auth_id, id_titular). A policy de linha (anon_read_from_public_route) continua,
-- mas agora limitada às colunas abaixo.
REVOKE SELECT ON public.titulares FROM anon;
GRANT SELECT (id, nome, imagem_url, data_nascimento, data_falecimento, falecido)
  ON public.titulares TO anon;

REVOKE SELECT ON public.dependentes FROM anon;
GRANT SELECT (id, nome, imagem_url, data_nascimento, data_falecimento, falecido)
  ON public.dependentes TO anon;

-- ===== 2) Busca por CPF via RPC restrita (substitui SELECT anon por CPF) =====
-- Evita que o anon filtre/enumere por CPF direto na tabela. Retorna só colunas públicas.
CREATE OR REPLACE FUNCTION public.get_homenageado_por_cpf(p_cpf text)
RETURNS TABLE(id uuid, nome text, imagem_url text, data_nascimento text, data_falecimento text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Normaliza os dois lados (o cpf é armazenado formatado, ex.: 000.000.000-00).
  SELECT id, nome, imagem_url, data_nascimento, data_falecimento
  FROM public.dependentes
  WHERE regexp_replace(COALESCE(cpf,''), '\D', '', 'g')
        = regexp_replace(COALESCE(p_cpf,''), '\D', '', 'g')
    AND regexp_replace(COALESCE(p_cpf,''), '\D', '', 'g') <> ''
  LIMIT 1;
$$;

-- ===== 3) recordacoes: apertar leitura/exclusão autenticada =====
-- Antes: qualquer autenticado lia/apagava todas as recordações.
ALTER TABLE public.recordacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recordacoes - SELECT" ON public.recordacoes;   -- authenticated true
DROP POLICY IF EXISTS "recordacoes - DELETE" ON public.recordacoes;   -- authenticated true
DROP POLICY IF EXISTS "recordacoes - UPDATE" ON public.recordacoes;   -- authenticated true
DROP POLICY IF EXISTS "recordacoes - INSERT" ON public.recordacoes;   -- anon true (redundante)
DROP POLICY IF EXISTS "Acesso a memorias do titular/subtitular" ON public.recordacoes; -- bug (nunca casava)

-- Leitura: só quem administra o dependente homenageado (ou admin).
DROP POLICY IF EXISTS recordacoes_select ON public.recordacoes;
CREATE POLICY recordacoes_select ON public.recordacoes
  FOR SELECT TO authenticated
  USING (
    public.is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.dependentes d
      WHERE d.id = COALESCE(recordacoes.dependente_id, recordacoes.id_dependente)
        AND (d.id_titular IN (SELECT public.mi_user_titular_ids()) OR d.auth_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS recordacoes_delete ON public.recordacoes;
CREATE POLICY recordacoes_delete ON public.recordacoes
  FOR DELETE TO authenticated
  USING (
    public.is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.dependentes d
      WHERE d.id = COALESCE(recordacoes.dependente_id, recordacoes.id_dependente)
        AND (d.id_titular IN (SELECT public.mi_user_titular_ids()) OR d.auth_id = auth.uid())
    )
  );

-- INSERT público continua via "Liberar INSERT geral" (WITH CHECK dependente_id IS NOT NULL),
-- que cobre anon e authenticated. Deixá-la como está.
