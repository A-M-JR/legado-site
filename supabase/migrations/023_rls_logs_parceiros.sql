-- 023_rls_logs_parceiros.sql
-- Aperta policies "USING true" em login_logs e parceiros. Idempotente. NÃO apaga dados.

-- ==================== login_logs ====================
-- Antes: qualquer autenticado lia todos os logs; qualquer um inseria qualquer log.
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir insert de logs" ON public.login_logs;              -- INSERT true
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.login_logs; -- SELECT true
DROP POLICY IF EXISTS "Permitir select de logs" ON public.login_logs;              -- SELECT true
DROP POLICY IF EXISTS "admins can read logs" ON public.login_logs;                 -- deixava parceiro_admin ler tudo

-- INSERT: cada usuário só registra o próprio login.
DROP POLICY IF EXISTS ll_insert_own ON public.login_logs;
CREATE POLICY ll_insert_own ON public.login_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- SELECT: só admin_master (dashboard e detalhe de usuário são telas de admin).
DROP POLICY IF EXISTS ll_select_admin ON public.login_logs;
CREATE POLICY ll_select_admin ON public.login_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_master());

-- ==================== parceiros ====================
-- Antes: qualquer autenticado lia (cnpj/contrato), inseria e atualizava parceiros.
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.parceiros;        -- INSERT true
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON public.parceiros;   -- SELECT true
DROP POLICY IF EXISTS "Permitir update para autenticados" ON public.parceiros;    -- UPDATE true

-- SELECT: admin; o próprio parceiro (qualquer role vinculado); e o titular lê o
-- parceiro ao qual está vinculado (branding da tela de módulos).
DROP POLICY IF EXISTS parceiros_select ON public.parceiros;
CREATE POLICY parceiros_select ON public.parceiros
  FOR SELECT TO authenticated
  USING (
    public.is_admin_master()
    OR id = public.get_parceiro_id()
    OR id IN (
      SELECT ua.parceiro_id FROM public.usuarios_app ua
      WHERE ua.titular_id IN (SELECT public.mi_user_titular_ids())
        AND ua.parceiro_id IS NOT NULL
    )
  );

-- INSERT/UPDATE/DELETE: só admin_master (única origem no frontend).
DROP POLICY IF EXISTS parceiros_admin_write ON public.parceiros;
CREATE POLICY parceiros_admin_write ON public.parceiros
  FOR ALL TO authenticated
  USING (public.is_admin_master())
  WITH CHECK (public.is_admin_master());
