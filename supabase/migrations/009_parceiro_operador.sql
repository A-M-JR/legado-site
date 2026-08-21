-- 009 — Papel parceiro_operador (funcionária da clínica)
-- Rodar no SQL Editor do Supabase

-- 1) Liberar o novo papel na coluna role de usuarios_app
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'usuarios_app'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE usuarios_app DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE usuarios_app
  ADD CONSTRAINT usuarios_app_role_check
  CHECK (role IN ('admin_master', 'parceiro_admin', 'parceiro_operador', 'titular', 'familiar'));

-- 1.1) Identificação da equipe da clínica (o titular tem nome/email na tabela titulares;
-- a operadora não tem titular vinculado, então guardamos aqui)
ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE usuarios_app ADD COLUMN IF NOT EXISTS email TEXT;

-- 2) Helpers de identidade do parceiro

-- Parceiro do usuário logado quando ele é equipe da clínica (admin ou operador)
CREATE OR REPLACE FUNCTION mp_parceiro_do_usuario()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT parceiro_id
  FROM usuarios_app
  WHERE auth_id = auth.uid()
    AND role IN ('parceiro_admin', 'parceiro_operador')
    AND COALESCE(status, 'ativo') = 'ativo'
    AND parceiro_id IS NOT NULL
  LIMIT 1
$$;

-- Parceiro do usuário logado seja ele equipe, titular ou familiar.
-- O vínculo com a clínica mora em usuarios_app (a tabela titulares não tem parceiro_id).
CREATE OR REPLACE FUNCTION mp_parceiro_do_contexto()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT ua.parceiro_id
       FROM usuarios_app ua
      WHERE ua.auth_id = auth.uid()
        AND ua.parceiro_id IS NOT NULL
      LIMIT 1),
    (SELECT ua.parceiro_id
       FROM usuarios_app ua
      WHERE ua.titular_id IN (SELECT mi_user_titular_ids())
        AND ua.parceiro_id IS NOT NULL
      LIMIT 1)
  )
$$;

-- O titular informado pertence à carteira do parceiro do usuário logado?
CREATE OR REPLACE FUNCTION mp_parceiro_pode_acessar(p_titular_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_titular_id IS NOT NULL
     AND mp_parceiro_do_usuario() IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM usuarios_app ua
       WHERE ua.titular_id = p_titular_id
         AND ua.parceiro_id = mp_parceiro_do_usuario()
     )
$$;

-- Acesso a dados do módulo: paciente/familiar (mi_can_access) OU equipe da clínica
CREATE OR REPLACE FUNCTION mp_can_access(p_titular_id UUID, p_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mi_can_access(p_titular_id, p_auth_id) OR mp_parceiro_pode_acessar(p_titular_id)
$$;
