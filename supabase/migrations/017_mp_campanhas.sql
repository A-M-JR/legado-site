-- 017 — Medicina Preventiva: campanhas (folder de ação) para todos os pacientes
-- Depende de: 009 (mp_parceiro_do_usuario), 010 (mp_notificacoes), 013 (mp_familia_mensagens)
--
-- A clínica cria uma campanha (folder + texto) e dispara para toda a carteira por
-- vários canais: banner no dashboard do paciente (SELECT das ativas), sino
-- (mp_notificacoes) e mensagem (mp_familia_mensagens, pessoa_id='clinica').
-- O WhatsApp é resolvido no cliente (links wa.me por paciente).

CREATE TABLE IF NOT EXISTS mp_campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  texto TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  media_tipo TEXT CHECK (media_tipo IN ('foto', 'video', 'pdf')),
  link TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_campanhas_parceiro ON mp_campanhas(parceiro_id, ativo, created_at DESC);

ALTER TABLE mp_campanhas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mp_campanhas_select ON mp_campanhas;
DROP POLICY IF EXISTS mp_campanhas_insert ON mp_campanhas;
DROP POLICY IF EXISTS mp_campanhas_update ON mp_campanhas;
DROP POLICY IF EXISTS mp_campanhas_delete ON mp_campanhas;

-- A clínica vê tudo do seu parceiro; o paciente vê as ativas do parceiro dele.
CREATE POLICY mp_campanhas_select ON mp_campanhas
  FOR SELECT USING (
    parceiro_id = mp_parceiro_do_usuario()
    OR (
      ativo
      AND parceiro_id IN (
        SELECT parceiro_id FROM usuarios_app WHERE auth_id = auth.uid()
      )
    )
  );
CREATE POLICY mp_campanhas_insert ON mp_campanhas
  FOR INSERT WITH CHECK (parceiro_id = mp_parceiro_do_usuario());
CREATE POLICY mp_campanhas_update ON mp_campanhas
  FOR UPDATE USING (parceiro_id = mp_parceiro_do_usuario());
CREATE POLICY mp_campanhas_delete ON mp_campanhas
  FOR DELETE USING (parceiro_id = mp_parceiro_do_usuario());

-- Disparo: fan-out da campanha para a carteira, pelos canais escolhidos.
CREATE OR REPLACE FUNCTION mp_disparar_campanha(p_campanha_id UUID, p_canais TEXT[])
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_camp mp_campanhas%ROWTYPE;
  v_nome_parceiro TEXT;
  v_media_tipo TEXT;
  v_count INT := 0;
  r RECORD;
BEGIN
  SELECT * INTO v_camp FROM mp_campanhas WHERE id = p_campanha_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campanha não encontrada';
  END IF;

  -- Só a clínica dona pode disparar.
  IF v_camp.parceiro_id IS DISTINCT FROM mp_parceiro_do_usuario() THEN
    RAISE EXCEPTION 'Sem permissão para esta campanha';
  END IF;

  SELECT nome INTO v_nome_parceiro FROM parceiros WHERE id = v_camp.parceiro_id;

  -- mp_familia_mensagens só aceita media_tipo foto/video.
  v_media_tipo := CASE WHEN v_camp.media_tipo IN ('foto', 'video') THEN v_camp.media_tipo ELSE NULL END;

  FOR r IN
    SELECT DISTINCT ua.titular_id, ua.auth_id
    FROM usuarios_app ua
    WHERE ua.parceiro_id = v_camp.parceiro_id
      AND ua.role = 'titular'
      AND ua.titular_id IS NOT NULL
  LOOP
    IF 'sino' = ANY (p_canais) THEN
      INSERT INTO mp_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link)
      VALUES (
        r.titular_id,
        r.auth_id,
        v_camp.titulo,
        left(v_camp.texto, 120),
        to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'),
        'sistema',
        COALESCE(NULLIF(v_camp.link, ''), '/medicina-preventiva')
      );
    END IF;

    IF 'mensagem' = ANY (p_canais) AND r.auth_id IS NOT NULL THEN
      INSERT INTO mp_familia_mensagens (
        titular_id, auth_id, pessoa_id, mensagem, remetente, anonimo, media_url, media_tipo
      )
      VALUES (
        r.titular_id,
        r.auth_id,
        'clinica',
        concat_ws(E'\n\n', v_camp.titulo, v_camp.texto, NULLIF(v_camp.link, '')),
        COALESCE(v_nome_parceiro, 'Clínica'),
        false,
        CASE WHEN v_media_tipo IS NOT NULL THEN v_camp.media_url ELSE NULL END,
        v_media_tipo
      );
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$fn$;

GRANT EXECUTE ON FUNCTION mp_disparar_campanha(UUID, TEXT[]) TO authenticated;
