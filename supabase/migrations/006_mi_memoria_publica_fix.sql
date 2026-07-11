-- Fix: mi_rede com titular_id NULL + backfill

UPDATE mi_rede r
SET titular_id = t.id
FROM titulares t
WHERE r.titular_id IS NULL AND r.auth_id = t.auth_id;

CREATE OR REPLACE FUNCTION mi_rede_pertence_titular(p_rede_id UUID, p_titular_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM mi_rede r
    WHERE r.id = p_rede_id
      AND (
        r.titular_id = p_titular_id
        OR (
          r.titular_id IS NULL
          AND EXISTS (
            SELECT 1 FROM titulares t
            WHERE t.id = p_titular_id AND t.auth_id = r.auth_id
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION mi_get_homenageado_memoria(p_titular_id UUID, p_pessoa_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_pessoa_id = 'eu' THEN
    SELECT json_build_object('nome', nome, 'imagem_url', imagem_url)
    INTO v_result
    FROM titulares
    WHERE id = p_titular_id;
  ELSE
    SELECT json_build_object('nome', r.nome, 'imagem_url', r.foto_url)
    INTO v_result
    FROM mi_rede r
    WHERE r.id = p_pessoa_id::uuid
      AND mi_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  RETURN v_result;
END;
$$;

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

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mi_rede_pertence_titular(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mi_get_homenageado_memoria(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mi_enviar_memoria_publica(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
