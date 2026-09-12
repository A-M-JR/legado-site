-- 022_rls_titulares_usuarios.sql
-- RLS do núcleo: titulares e usuarios_app. Idempotente. NÃO apaga dados.
-- Estratégia: substituir as policies "USING true" por conjunto limpo baseado
-- nos helpers SECURITY DEFINER. Mantém a leitura pública anon de titulares
-- (será trocada por RPC na Fase 5).

-- ==================== titulares ====================
ALTER TABLE public.titulares ENABLE ROW LEVEL SECURITY;

-- Remove policies abertas / redundantes (não apaga dados, só regras).
DROP POLICY IF EXISTS "Titulares - SELECT" ON public.titulares;
DROP POLICY IF EXISTS "Titulares - INSERT" ON public.titulares;
DROP POLICY IF EXISTS "Titulares - UPDATE" ON public.titulares;
DROP POLICY IF EXISTS "Titulares - DELETE" ON public.titulares;
DROP POLICY IF EXISTS "Admin Master update titulares" ON public.titulares;
DROP POLICY IF EXISTS "parceiro_insert_titulares_parceiro_admin" ON public.titulares;
DROP POLICY IF EXISTS "parceiro_select_titulares" ON public.titulares;
DROP POLICY IF EXISTS "parceiro_select_titulares_pelo_parceiro" ON public.titulares;
DROP POLICY IF EXISTS "parceiro_update_titulares_pelo_parceiro" ON public.titulares;
-- OBS: "anon_read_from_public_route" (SELECT anon) é MANTIDA até a Fase 5.

DROP POLICY IF EXISTS t_select ON public.titulares;
CREATE POLICY t_select ON public.titulares
  FOR SELECT TO authenticated
  USING (
    auth.uid() = auth_id
    OR id IN (SELECT public.mi_user_titular_ids())
    OR public.mp_parceiro_pode_acessar(id)
    OR public.is_admin_master()
  );

DROP POLICY IF EXISTS t_insert ON public.titulares;
CREATE POLICY t_insert ON public.titulares
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = auth_id                       -- signup próprio (titular ou criado por admin/parceiro sob a sessão do novo user)
    OR public.mp_parceiro_do_usuario() IS NOT NULL  -- parceiro logado
    OR public.is_admin_master()
  );

DROP POLICY IF EXISTS t_update ON public.titulares;
CREATE POLICY t_update ON public.titulares
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = auth_id
    OR public.mp_parceiro_pode_acessar(id)
    OR public.is_admin_master()
  )
  WITH CHECK (
    auth.uid() = auth_id
    OR public.mp_parceiro_pode_acessar(id)
    OR public.is_admin_master()
  );

DROP POLICY IF EXISTS t_delete ON public.titulares;
CREATE POLICY t_delete ON public.titulares
  FOR DELETE TO authenticated
  USING (public.is_admin_master());

-- ==================== usuarios_app (pivô) ====================
ALTER TABLE public.usuarios_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON public.usuarios_app;
DROP POLICY IF EXISTS "Admin Master update usuarios_app" ON public.usuarios_app;
DROP POLICY IF EXISTS "usuarios_app_select_proprio_ou_mesmo_parceiro" ON public.usuarios_app;

-- SELECT: próprio, mesmo parceiro (parceiro_admin/operador) ou admin.
DROP POLICY IF EXISTS ua_select ON public.usuarios_app;
CREATE POLICY ua_select ON public.usuarios_app
  FOR SELECT TO authenticated
  USING (
    auth_id = auth.uid()
    OR parceiro_id = public.mp_parceiro_do_usuario()
    OR public.is_admin_master()
  );

-- INSERT: auto-provisionamento (sob a sessão do novo usuário) restrito a papéis
-- não-admin; parceiro/admin logados também podem. NUNCA permite virar admin.
DROP POLICY IF EXISTS ua_insert ON public.usuarios_app;
CREATE POLICY ua_insert ON public.usuarios_app
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      (auth_id = auth.uid() AND role IN ('titular','parceiro_operador'))
      OR (public.mp_parceiro_do_usuario() IS NOT NULL AND role IN ('titular','parceiro_operador'))
      OR public.is_admin_master()
    )
    AND (public.is_admin_master() OR role NOT IN ('admin_master','admin'))
  );

-- UPDATE: só parceiro (mesmo parceiro) ou admin. Bloqueia escalonamento de role.
DROP POLICY IF EXISTS ua_update ON public.usuarios_app;
CREATE POLICY ua_update ON public.usuarios_app
  FOR UPDATE TO authenticated
  USING (
    parceiro_id = public.mp_parceiro_do_usuario()
    OR public.is_admin_master()
  )
  WITH CHECK (
    (parceiro_id = public.mp_parceiro_do_usuario() OR public.is_admin_master())
    AND (public.is_admin_master() OR role NOT IN ('admin_master','admin'))
  );

-- DELETE: só admin (não há delete no frontend).
DROP POLICY IF EXISTS ua_delete ON public.usuarios_app;
CREATE POLICY ua_delete ON public.usuarios_app
  FOR DELETE TO authenticated
  USING (public.is_admin_master());
