-- 018 — Alterar o e-mail de LOGIN (auth.users) ao editar o cadastro
-- Depende de: 009_parceiro_operador.sql (papéis de parceiro)
--
-- Editar o cadastro só mudava titulares.email (o e-mail "da plataforma"); o e-mail
-- de login fica em auth.users e exige privilégio de admin. Esta RPC SECURITY DEFINER
-- (mesmo padrão de alterar_senha_usuario) troca o e-mail de login de outro usuário,
-- autorizando: admin global (admin_master) ou a clínica dona do paciente.

CREATE OR REPLACE FUNCTION alterar_email_usuario(p_auth_id UUID, p_novo_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_caller UUID := auth.uid();
  v_caller_role TEXT;
  v_caller_parceiro UUID;
  v_target_parceiro UUID;
  v_email TEXT := lower(trim(p_novo_email));
  v_autorizado BOOLEAN := false;
BEGIN
  IF v_email IS NULL OR v_email = '' OR position('@' IN v_email) = 0 THEN
    RAISE EXCEPTION 'E-mail inválido';
  END IF;

  SELECT role, parceiro_id
    INTO v_caller_role, v_caller_parceiro
    FROM usuarios_app
   WHERE auth_id = v_caller
   LIMIT 1;

  -- Admin global pode tudo.
  IF v_caller_role IN ('admin_master', 'admin') THEN
    v_autorizado := true;
  -- Clínica só mexe nos próprios pacientes.
  ELSIF v_caller_role IN ('parceiro_admin', 'parceiro_operador') AND v_caller_parceiro IS NOT NULL THEN
    SELECT parceiro_id INTO v_target_parceiro
      FROM usuarios_app
     WHERE auth_id = p_auth_id
     LIMIT 1;
    IF v_target_parceiro = v_caller_parceiro THEN
      v_autorizado := true;
    END IF;
  END IF;

  IF NOT v_autorizado THEN
    RAISE EXCEPTION 'Sem permissão para alterar este e-mail';
  END IF;

  -- E-mail já usado por outra conta?
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = v_email AND id <> p_auth_id
  ) THEN
    RAISE EXCEPTION 'Este e-mail já está em uso por outra conta';
  END IF;

  -- Atualiza o e-mail de login e mantém a conta confirmada.
  UPDATE auth.users
     SET email = v_email,
         email_confirmed_at = COALESCE(email_confirmed_at, now()),
         updated_at = now()
   WHERE id = p_auth_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Mantém a identidade de e-mail em sincronia (login por e-mail/senha).
  UPDATE auth.identities
     SET identity_data = jsonb_set(identity_data, '{email}', to_jsonb(v_email)),
         updated_at = now()
   WHERE user_id = p_auth_id AND provider = 'email';
END;
$fn$;

GRANT EXECUTE ON FUNCTION alterar_email_usuario(UUID, TEXT) TO authenticated;
