-- 014 — Medicina Preventiva: lembrete de consulta (sino do app + fila de WhatsApp)
-- Depende de: 010 e 011
--
-- Antes desta migration o paciente só era avisado no momento em que a clínica
-- criava/remarcava/cancelava a consulta. Não existia nada que rodasse no tempo,
-- então não havia o aviso de véspera. Aqui entram:
--   1. a configuração por clínica (quantos dias antes, a que hora);
--   2. o registro do que já foi avisado, para não repetir;
--   3. a função que gera os lembretes, agendada de hora em hora no pg_cron.

-- 1. Configuração da clínica -------------------------------------------------
ALTER TABLE mp_parceiro_config
  ADD COLUMN IF NOT EXISTS lembrete_ativo BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS lembrete_dias INT[] NOT NULL DEFAULT '{1}',
  ADD COLUMN IF NOT EXISTS lembrete_hora TIME NOT NULL DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS lembrete_whatsapp_mensagem TEXT NOT NULL DEFAULT
    'Olá {paciente}! Passando para lembrar da sua consulta {quando}{profissional}{local}. Qualquer dúvida, é só chamar por aqui.';

-- Dias válidos: 0 (no próprio dia) até 30, no máximo 5 avisos.
-- CHECK não aceita subquery, então a faixa é validada por contenção de array.
DO $chk$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mp_parceiro_config_lembrete_dias_chk') THEN
    ALTER TABLE mp_parceiro_config
      ADD CONSTRAINT mp_parceiro_config_lembrete_dias_chk CHECK (
        COALESCE(array_length(lembrete_dias, 1), 0) <= 5
        AND lembrete_dias <@ ARRAY[
          0,1,2,3,4,5,6,7,8,9,10,
          11,12,13,14,15,16,17,18,19,20,
          21,22,23,24,25,26,27,28,29,30
        ]
      );
  END IF;
END
$chk$;

-- A config só existia quando alguém abria a tela de Unidades. Sem linha, o cron
-- não teria o que ler — então toda clínica nasce com "1 dia antes, às 09:00".
INSERT INTO mp_parceiro_config (parceiro_id)
SELECT p.id FROM parceiros p
ON CONFLICT (parceiro_id) DO NOTHING;

-- 2. O que já foi avisado ----------------------------------------------------
CREATE TABLE IF NOT EXISTS mp_consulta_lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID NOT NULL REFERENCES mp_consultas(id) ON DELETE CASCADE,
  parceiro_id UUID REFERENCES parceiros(id) ON DELETE CASCADE,
  titular_id UUID REFERENCES titulares(id) ON DELETE CASCADE,
  dias_antes INT NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('app', 'whatsapp')),
  enviado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consulta_id, dias_antes, canal)
);

CREATE INDEX IF NOT EXISTS idx_mp_consulta_lembretes_parceiro
  ON mp_consulta_lembretes(parceiro_id, created_at DESC);

ALTER TABLE mp_consulta_lembretes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mp_consulta_lembretes_select ON mp_consulta_lembretes;
DROP POLICY IF EXISTS mp_consulta_lembretes_insert ON mp_consulta_lembretes;
DROP POLICY IF EXISTS mp_consulta_lembretes_delete ON mp_consulta_lembretes;

CREATE POLICY mp_consulta_lembretes_select ON mp_consulta_lembretes
  FOR SELECT USING (mp_parceiro_pode_acessar(titular_id));
CREATE POLICY mp_consulta_lembretes_insert ON mp_consulta_lembretes
  FOR INSERT WITH CHECK (mp_parceiro_pode_acessar(titular_id));
-- Desmarcar um envio de WhatsApp (clicou sem querer) é da clínica; o 'app' fica.
CREATE POLICY mp_consulta_lembretes_delete ON mp_consulta_lembretes
  FOR DELETE USING (canal = 'whatsapp' AND mp_parceiro_pode_acessar(titular_id));

-- 3. Geração dos lembretes ---------------------------------------------------

-- "hoje", "amanhã" ou "em N dias" — usado no título da notificação.
CREATE OR REPLACE FUNCTION mp_rotulo_lembrete(p_dias INT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $fn$
  SELECT CASE
    WHEN p_dias <= 0 THEN 'Sua consulta é hoje'
    WHEN p_dias = 1 THEN 'Sua consulta é amanhã'
    ELSE format('Sua consulta é em %s dias', p_dias)
  END
$fn$;

/**
 * Cria as notificações de lembrete das consultas que caem na janela configurada.
 * p_parceiro_id NULL = todas as clínicas (uso do cron, respeitando a hora de cada uma).
 * p_ignorar_hora = TRUE roda fora do horário (uso do botão "gerar agora" no painel).
 */
CREATE OR REPLACE FUNCTION mp_gerar_lembretes_consultas(
  p_parceiro_id UUID DEFAULT NULL,
  p_ignorar_hora BOOLEAN DEFAULT false
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_agora  TIMESTAMP := now() AT TIME ZONE 'America/Sao_Paulo';
  v_hoje   DATE := v_agora::date;
  v_hora   INT := date_part('hour', v_agora);
  v_criados INT := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      c.id,
      c.titular_id,
      c.auth_id,
      c.parceiro_id,
      c.data_hora,
      c.profissional,
      c.local,
      d.dias
    FROM mp_parceiro_config cfg
    CROSS JOIN LATERAL unnest(cfg.lembrete_dias) AS d(dias)
    JOIN mp_consultas c ON c.parceiro_id = cfg.parceiro_id
    WHERE cfg.lembrete_ativo
      AND (p_parceiro_id IS NULL OR cfg.parceiro_id = p_parceiro_id)
      AND (p_ignorar_hora OR date_part('hour', cfg.lembrete_hora) = v_hora)
      AND c.status IN ('agendada', 'confirmada')
      AND (c.data_hora AT TIME ZONE 'America/Sao_Paulo')::date = v_hoje + d.dias
      AND NOT EXISTS (
        SELECT 1 FROM mp_consulta_lembretes l
        WHERE l.consulta_id = c.id
          AND l.dias_antes = d.dias
          AND l.canal = 'app'
      )
  LOOP
    INSERT INTO mp_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link)
    VALUES (
      r.titular_id,
      r.auth_id,
      mp_rotulo_lembrete(r.dias),
      concat_ws(' · ',
        to_char(r.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
        NULLIF(r.profissional, ''),
        NULLIF(r.local, '')
      ),
      to_char(v_agora, 'DD/MM HH24:MI'),
      'consulta',
      '/medicina-preventiva/receitas-consultas'
    );

    INSERT INTO mp_consulta_lembretes (consulta_id, parceiro_id, titular_id, dias_antes, canal)
    VALUES (r.id, r.parceiro_id, r.titular_id, r.dias, 'app')
    ON CONFLICT (consulta_id, dias_antes, canal) DO NOTHING;

    v_criados := v_criados + 1;
  END LOOP;

  RETURN v_criados;
END
$fn$;

-- O cron chama a versão ampla; ninguém do lado do cliente pode.
REVOKE ALL ON FUNCTION mp_gerar_lembretes_consultas(UUID, BOOLEAN) FROM PUBLIC;

/** Versão segura para o painel: gera só os da clínica do usuário logado. */
CREATE OR REPLACE FUNCTION mp_gerar_lembretes_do_parceiro()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_parceiro UUID := mp_parceiro_do_usuario();
BEGIN
  IF v_parceiro IS NULL THEN
    RAISE EXCEPTION 'Sem permissão de clínica';
  END IF;

  RETURN mp_gerar_lembretes_consultas(v_parceiro, true);
END
$fn$;

GRANT EXECUTE ON FUNCTION mp_gerar_lembretes_do_parceiro() TO authenticated;

-- 4. Agendamento de hora em hora ---------------------------------------------
-- O cron do Postgres roda em UTC; por isso a função compara a hora de
-- São Paulo com a hora configurada e nós disparamos toda hora, aos 5 minutos.
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;

    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mp_lembretes_consulta') THEN
      PERFORM cron.unschedule('mp_lembretes_consulta');
    END IF;

    PERFORM cron.schedule(
      'mp_lembretes_consulta',
      '5 * * * *',
      'SELECT mp_gerar_lembretes_consultas()'
    );

    RAISE NOTICE 'Lembretes agendados: mp_lembretes_consulta roda de hora em hora.';
  ELSE
    RAISE NOTICE 'pg_cron indisponível neste projeto. Habilite em Dashboard -> Database -> Extensions e rode esta migration de novo. Sem ele, os lembretes só são gerados quando a clínica abre a tela de Lembretes.';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Não foi possível agendar o cron (%). Habilite pg_cron no Dashboard e rode esta migration de novo.', SQLERRM;
END
$cron$;
