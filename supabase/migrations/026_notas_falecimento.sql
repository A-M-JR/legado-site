-- 026_notas_falecimento.sql
-- Nota de falecimento pública (velório, sepultamento, frase, coroa de flores).
-- Uma linha por homenageado (id de dependentes OU titulares). Idempotente. NÃO apaga dados.

CREATE TABLE IF NOT EXISTS public.notas_falecimento (
  homenageado_id  uuid PRIMARY KEY,
  frase           text CHECK (char_length(frase) <= 300),
  whatsapp_flores text CHECK (char_length(whatsapp_flores) <= 20),
  -- [{ "tipo": "Velório", "local": "...", "endereco": "...", "data": "yyyy-MM-dd", "hora": "HH:mm" }]
  cerimonias      jsonb NOT NULL DEFAULT '[]'::jsonb
                  CHECK (jsonb_typeof(cerimonias) = 'array' AND jsonb_array_length(cerimonias) <= 6),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Quem pode editar a nota: admin, o próprio usuário do homenageado, a família
-- (titular dono do dependente) ou o parceiro (funerária) que atende o titular.
CREATE OR REPLACE FUNCTION public.pode_gerenciar_homenageado(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin_master()
    OR EXISTS (
      SELECT 1 FROM public.dependentes d
      WHERE d.id = p_id
        AND (
          d.auth_id = auth.uid()
          OR d.id_titular IN (SELECT public.mi_user_titular_ids())
          OR public.mp_parceiro_pode_acessar(d.id_titular)
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.titulares t
      WHERE t.id = p_id
        AND (
          t.auth_id = auth.uid()
          OR t.id IN (SELECT public.mi_user_titular_ids())
          OR public.mp_parceiro_pode_acessar(t.id)
        )
    );
$$;

REVOKE ALL ON FUNCTION public.pode_gerenciar_homenageado(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode_gerenciar_homenageado(uuid) TO authenticated;

ALTER TABLE public.notas_falecimento ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.notas_falecimento TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notas_falecimento TO authenticated;

-- Leitura pública: a nota é feita para ser compartilhada (não contém CPF/e-mail/telefone da família).
DROP POLICY IF EXISTS nf_select ON public.notas_falecimento;
CREATE POLICY nf_select ON public.notas_falecimento
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS nf_insert ON public.notas_falecimento;
CREATE POLICY nf_insert ON public.notas_falecimento
  FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerenciar_homenageado(homenageado_id));

DROP POLICY IF EXISTS nf_update ON public.notas_falecimento;
CREATE POLICY nf_update ON public.notas_falecimento
  FOR UPDATE TO authenticated
  USING (public.pode_gerenciar_homenageado(homenageado_id))
  WITH CHECK (public.pode_gerenciar_homenageado(homenageado_id));

DROP POLICY IF EXISTS nf_delete ON public.notas_falecimento;
CREATE POLICY nf_delete ON public.notas_falecimento
  FOR DELETE TO authenticated
  USING (public.pode_gerenciar_homenageado(homenageado_id));
