-- 016 — Medicina Preventiva: canal de mensagem clínica -> paciente
-- Depende de: 009 (mp_parceiro_pode_acessar), 013 (mp_familia_mensagens)
--
-- O mural mp_familia_mensagens é privado do paciente/família (RLS mi_can_access),
-- então a clínica não escreve nele diretamente. Esta RPC SECURITY DEFINER permite
-- que a equipe do parceiro poste uma mensagem para o paciente (pessoa_id='clinica'),
-- que o paciente lê no mesmo mural "Minha família".

CREATE OR REPLACE FUNCTION mp_enviar_mensagem_clinica(
  p_titular_id UUID,
  p_mensagem TEXT,
  p_remetente TEXT,
  p_media_url TEXT DEFAULT NULL,
  p_media_tipo TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_auth_id UUID;
  v_id UUID;
BEGIN
  -- Só a equipe do parceiro dono do paciente pode enviar.
  IF NOT mp_parceiro_pode_acessar(p_titular_id) THEN
    RAISE EXCEPTION 'Sem permissão para este paciente';
  END IF;

  SELECT auth_id INTO v_auth_id FROM titulares WHERE id = p_titular_id;

  IF v_auth_id IS NULL THEN
    SELECT auth_id INTO v_auth_id
    FROM usuarios_app
    WHERE titular_id = p_titular_id AND role = 'titular'
    LIMIT 1;
  END IF;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Paciente sem conta de acesso';
  END IF;

  INSERT INTO mp_familia_mensagens (
    titular_id, auth_id, pessoa_id, mensagem, remetente, anonimo, media_url, media_tipo
  )
  VALUES (
    p_titular_id, v_auth_id, 'clinica', p_mensagem, p_remetente, false, p_media_url, p_media_tipo
  )
  RETURNING id INTO v_id;

  -- Aviso no sino do paciente
  INSERT INTO mp_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link)
  VALUES (
    p_titular_id,
    v_auth_id,
    'Mensagem da clínica',
    left(p_mensagem, 120),
    to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'),
    'sistema',
    '/medicina-preventiva/familia/clinica'
  );

  RETURN v_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION mp_enviar_mensagem_clinica(UUID, TEXT, TEXT, TEXT, TEXT)
  TO authenticated;
