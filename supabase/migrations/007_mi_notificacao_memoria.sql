-- Notificação automática quando chega uma memória pública (mensagem da família)

CREATE OR REPLACE FUNCTION mi_enviar_memoria_publica(
  p_titular_id UUID,
  p_pessoa_id TEXT,
  p_mensagem TEXT,
  p_remetente TEXT,
  p_anonimo BOOLEAN DEFAULT false,
  p_media_url TEXT DEFAULT NULL,
  p_media_tipo TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id UUID;
  v_id UUID;
  v_remetente TEXT;
  v_hora TEXT;
BEGIN
  SELECT auth_id INTO v_auth_id FROM titulares WHERE id = p_titular_id;

  IF v_auth_id IS NULL AND p_pessoa_id ~ '^[0-9a-f]{8}-' THEN
    SELECT r.auth_id INTO v_auth_id
    FROM mi_rede r
    WHERE r.id = p_pessoa_id::uuid AND mi_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Titular não encontrado';
  END IF;

  IF p_pessoa_id = 'eu' THEN
    IF NOT EXISTS (SELECT 1 FROM titulares WHERE id = p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSIF p_pessoa_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    IF NOT mi_rede_pertence_titular(p_pessoa_id::uuid, p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSE
    RAISE EXCEPTION 'Pessoa inválida';
  END IF;

  INSERT INTO mi_familia_memorias (
    titular_id, auth_id, pessoa_id, mensagem, remetente, anonimo, media_url, media_tipo
  )
  VALUES (
    p_titular_id, v_auth_id, p_pessoa_id, p_mensagem, p_remetente, p_anonimo, p_media_url, p_media_tipo
  )
  RETURNING id INTO v_id;

  v_remetente := CASE WHEN p_anonimo OR p_remetente IS NULL OR p_remetente = ''
                      THEN 'Alguém especial' ELSE p_remetente END;
  v_hora := 'Hoje — ' || to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI');

  INSERT INTO mi_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link, lida)
  VALUES (
    p_titular_id,
    v_auth_id,
    'Nova recordação recebida',
    v_remetente || ' deixou uma nova memória para você.',
    v_hora,
    'mensagem',
    '/melhor-idade/familia',
    false
  );

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mi_enviar_memoria_publica(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
