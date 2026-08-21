-- 013 — Medicina Preventiva: rede de familiares/cuidadores + mensagens
-- Depende de: 001 (mi_can_access, mi_user_titular_ids) e 010
--
-- IMPORTANTE: estas duas tabelas são PRIVADAS do paciente e da família.
-- A equipe da clínica NÃO tem acesso (por isso usamos mi_can_access,
-- e não mp_can_access como no resto do módulo).

CREATE TABLE IF NOT EXISTS mp_rede (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  relacao TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mp_familia_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pessoa_id TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  remetente TEXT NOT NULL,
  anonimo BOOLEAN NOT NULL DEFAULT false,
  media_url TEXT,
  media_tipo TEXT CHECK (media_tipo IN ('foto', 'video')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_rede_scope ON mp_rede(titular_id, auth_id);
CREATE INDEX IF NOT EXISTS idx_mp_familia_mensagens_scope
  ON mp_familia_mensagens(titular_id, auth_id, pessoa_id);

ALTER TABLE mp_rede ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_familia_mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mp_rede_select ON mp_rede;
DROP POLICY IF EXISTS mp_rede_insert ON mp_rede;
DROP POLICY IF EXISTS mp_rede_update ON mp_rede;
DROP POLICY IF EXISTS mp_rede_delete ON mp_rede;

CREATE POLICY mp_rede_select ON mp_rede FOR SELECT USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_rede_insert ON mp_rede FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY mp_rede_update ON mp_rede FOR UPDATE USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_rede_delete ON mp_rede FOR DELETE USING (mi_can_access(titular_id, auth_id));

DROP POLICY IF EXISTS mp_familia_mensagens_select ON mp_familia_mensagens;
DROP POLICY IF EXISTS mp_familia_mensagens_insert ON mp_familia_mensagens;
DROP POLICY IF EXISTS mp_familia_mensagens_update ON mp_familia_mensagens;
DROP POLICY IF EXISTS mp_familia_mensagens_delete ON mp_familia_mensagens;

CREATE POLICY mp_familia_mensagens_select ON mp_familia_mensagens
  FOR SELECT USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_familia_mensagens_insert ON mp_familia_mensagens
  FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY mp_familia_mensagens_update ON mp_familia_mensagens
  FOR UPDATE USING (mi_can_access(titular_id, auth_id));
CREATE POLICY mp_familia_mensagens_delete ON mp_familia_mensagens
  FOR DELETE USING (mi_can_access(titular_id, auth_id));

-- ------------------------------------------------------------
-- Convite público: quem recebe o link/QR posta sem ter conta
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION mp_rede_pertence_titular(p_rede_id UUID, p_titular_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1
    FROM mp_rede r
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
$fn$;

CREATE OR REPLACE FUNCTION mp_get_pessoa_publica(p_titular_id UUID, p_pessoa_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
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
    FROM mp_rede r
    WHERE r.id = p_pessoa_id::uuid
      AND mp_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  RETURN v_result;
END;
$fn$;

CREATE OR REPLACE FUNCTION mp_enviar_mensagem_publica(
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
AS $fn$
DECLARE
  v_auth_id UUID;
  v_id UUID;
BEGIN
  SELECT auth_id INTO v_auth_id FROM titulares WHERE id = p_titular_id;

  IF v_auth_id IS NULL AND p_pessoa_id ~ '^[0-9a-f]{8}-' THEN
    SELECT r.auth_id INTO v_auth_id
    FROM mp_rede r
    WHERE r.id = p_pessoa_id::uuid AND mp_rede_pertence_titular(r.id, p_titular_id);
  END IF;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Paciente não encontrado';
  END IF;

  IF p_pessoa_id = 'eu' THEN
    IF NOT EXISTS (SELECT 1 FROM titulares WHERE id = p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSIF p_pessoa_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    IF NOT mp_rede_pertence_titular(p_pessoa_id::uuid, p_titular_id) THEN
      RAISE EXCEPTION 'Pessoa não encontrada';
    END IF;
  ELSE
    RAISE EXCEPTION 'Pessoa inválida';
  END IF;

  INSERT INTO mp_familia_mensagens (
    titular_id, auth_id, pessoa_id, mensagem, remetente, anonimo, media_url, media_tipo
  )
  VALUES (
    p_titular_id, v_auth_id, p_pessoa_id, p_mensagem, p_remetente, p_anonimo, p_media_url, p_media_tipo
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION mp_rede_pertence_titular(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mp_get_pessoa_publica(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mp_enviar_mensagem_publica(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT)
  TO anon, authenticated;
