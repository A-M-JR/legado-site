-- 021_rls_modulos.sql
-- RLS de titular_modulos e parceiro_modulos. Idempotente.
-- NÃO apaga dados; só ajusta policies e liga RLS.

-- ============ titular_modulos ============
-- Estava com RLS OFF apesar de 9 policies. Ligar RLS passa a valê-las.
-- Mantém as policies de admin/parceiro existentes (todas com escopo, sem USING true).
-- Remove APENAS a policy aberta e garante a leitura de escopo do titular.
ALTER TABLE public.titular_modulos ENABLE ROW LEVEL SECURITY;

-- Policy perigosa (qualquer autenticado lia tudo).
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON public.titular_modulos;

-- Titular/familiar lê os módulos dos titulares que administra / é dono.
-- (necessária p/ PrivateRoute, selecao-modulos e os layouts MI/MP contarem módulos)
DROP POLICY IF EXISTS titular_modulos_select_titular ON public.titular_modulos;
CREATE POLICY titular_modulos_select_titular ON public.titular_modulos
  FOR SELECT TO authenticated
  USING (
    titular_id IN (SELECT public.mi_user_titular_ids())
    OR public.mp_parceiro_pode_acessar(titular_id)
    OR public.is_admin_master()
  );

-- ============ parceiro_modulos ============
-- Estava com RLS OFF e sem policy. Só admin escreve; parceiro e titular leem.
ALTER TABLE public.parceiro_modulos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parceiro_modulos_select ON public.parceiro_modulos;
CREATE POLICY parceiro_modulos_select ON public.parceiro_modulos
  FOR SELECT TO authenticated
  USING (
    public.is_admin_master()
    OR parceiro_id = public.get_parceiro_id()
    OR parceiro_id IN (
      SELECT ua.parceiro_id FROM public.usuarios_app ua
      WHERE ua.titular_id IN (SELECT public.mi_user_titular_ids())
        AND ua.parceiro_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS parceiro_modulos_admin_write ON public.parceiro_modulos;
CREATE POLICY parceiro_modulos_admin_write ON public.parceiro_modulos
  FOR ALL TO authenticated
  USING (public.is_admin_master())
  WITH CHECK (public.is_admin_master());
