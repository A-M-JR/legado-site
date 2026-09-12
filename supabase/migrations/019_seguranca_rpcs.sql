-- 019_seguranca_rpcs.sql
-- Corrige RPCs SECURITY DEFINER que não checavam o chamador.
-- Idempotente: CREATE OR REPLACE + REVOKE.
-- Contexto: cliente único anon; estas funções eram executáveis por `anon`.

-- 1) Helper de papel admin. SECURITY DEFINER para não sofrer recursão de RLS
--    quando usado dentro de policies da própria usuarios_app.
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_app
    WHERE auth_id = auth.uid()
      AND role IN ('admin_master','admin')
      AND COALESCE(status,'ativo') = 'ativo'
  );
$$;

-- 2) alterar_senha_usuario: SÓ admin master. Antes: sem checagem nenhuma.
CREATE OR REPLACE FUNCTION public.alterar_senha_usuario(user_id uuid, nova_senha text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $function$
DECLARE
  resultado JSON;
BEGIN
  IF NOT public.is_admin_master() THEN
    RAISE EXCEPTION 'Sem permissão para alterar senha';
  END IF;

  IF nova_senha IS NULL OR length(nova_senha) < 6 THEN
    RAISE EXCEPTION 'Senha inválida (mínimo 6 caracteres)';
  END IF;

  UPDATE auth.users
     SET encrypted_password = crypt(nova_senha, gen_salt('bf')),
         updated_at = now()
   WHERE id = user_id;

  IF FOUND THEN
    resultado := json_build_object('success', true, 'message', 'Senha alterada com sucesso');
  ELSE
    resultado := json_build_object('success', false, 'message', 'Usuário não encontrado');
  END IF;

  RETURN resultado;
END;
$function$;

-- 3) get_usuarios_com_email: SÓ admin master. Antes: retornava e-mail/role de todos.
CREATE OR REPLACE FUNCTION public.get_usuarios_com_email()
RETURNS TABLE(auth_id uuid, email text, role text, parceiro_id uuid, titular_id uuid, titular_nome text, parceiro_nome text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  IF NOT public.is_admin_master() THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  RETURN QUERY
  SELECT
    ua.auth_id,
    au.email::text       AS email,
    ua.role::text        AS role,
    ua.parceiro_id,
    ua.titular_id,
    t.nome::text         AS titular_nome,
    p.nome::text         AS parceiro_nome
  FROM public.usuarios_app ua
  LEFT JOIN auth.users au      ON au.id = ua.auth_id
  LEFT JOIN public.titulares t ON t.id = ua.titular_id
  LEFT JOIN public.parceiros p ON p.id = ua.parceiro_id
  ORDER BY ua.role;
END;
$function$;

-- 4) Defesa em profundidade: tirar EXECUTE do anon. `authenticated` continua
--    (admin loga como authenticated); a guarda interna faz a restrição real.
REVOKE EXECUTE ON FUNCTION public.alterar_senha_usuario(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_usuarios_com_email() FROM anon;
