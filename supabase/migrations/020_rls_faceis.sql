-- 020_rls_faceis.sql
-- Liga RLS em tabelas simples. Idempotente (DROP POLICY IF EXISTS + CREATE).

-- ============ assinaturas ============
-- Sem uso no frontend. Liga RLS; leitura só do dono ou admin; escrita só admin.
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS assinaturas_select ON public.assinaturas;
CREATE POLICY assinaturas_select ON public.assinaturas
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_master());

DROP POLICY IF EXISTS assinaturas_admin_all ON public.assinaturas;
CREATE POLICY assinaturas_admin_all ON public.assinaturas
  FOR ALL TO authenticated
  USING (public.is_admin_master())
  WITH CHECK (public.is_admin_master());

-- ============ config_sistema (singleton) ============
-- Leitura ampla (tema/branding/manutenção, inclusive antes do login).
-- Escrita só admin_master.
ALTER TABLE public.config_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS config_sistema_select ON public.config_sistema;
CREATE POLICY config_sistema_select ON public.config_sistema
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS config_sistema_update ON public.config_sistema;
CREATE POLICY config_sistema_update ON public.config_sistema
  FOR UPDATE TO authenticated
  USING (public.is_admin_master())
  WITH CHECK (public.is_admin_master());

DROP POLICY IF EXISTS config_sistema_insert ON public.config_sistema;
CREATE POLICY config_sistema_insert ON public.config_sistema
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_master());
