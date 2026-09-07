-- 015 — Medicina Preventiva: paciente também cria consultas
-- Depende de: 010_medicina_preventiva_core.sql, 011_medicina_preventiva_parceiro.sql
--
-- Muda a regra "só a clínica agenda": agora o paciente/familiar também cria e
-- edita consultas. Ambos os lados (paciente e clínica) enxergam tudo — a agenda
-- da clínica já lista sem filtrar por origem, então nada muda lá.

-- RLS: liberar INSERT/UPDATE/DELETE para o paciente também
DROP POLICY IF EXISTS mp_consultas_select ON mp_consultas;
DROP POLICY IF EXISTS mp_consultas_insert ON mp_consultas;
DROP POLICY IF EXISTS mp_consultas_update ON mp_consultas;
DROP POLICY IF EXISTS mp_consultas_delete ON mp_consultas;

CREATE POLICY mp_consultas_select ON mp_consultas
  FOR SELECT USING (mp_can_access(titular_id, auth_id));
CREATE POLICY mp_consultas_insert ON mp_consultas
  FOR INSERT WITH CHECK (auth_id = auth.uid() OR mp_parceiro_pode_acessar(titular_id));
CREATE POLICY mp_consultas_update ON mp_consultas
  FOR UPDATE USING (mp_can_access(titular_id, auth_id));
-- Paciente só apaga as próprias (origem='paciente'); clínica apaga qualquer uma da carteira.
CREATE POLICY mp_consultas_delete ON mp_consultas
  FOR DELETE USING (
    (origem = 'paciente' AND mi_can_access(titular_id, auth_id))
    OR mp_parceiro_pode_acessar(titular_id)
  );

-- Notificação: quando a clínica agenda, avisa o paciente (comportamento atual).
-- Quando o PACIENTE agenda (origem='paciente'), avisa a CLÍNICA no painel.
CREATE OR REPLACE FUNCTION mp_notificar_consulta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_titulo TEXT;
  v_quando TEXT;
  v_nome TEXT;
BEGIN
  v_quando := to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI');

  -- Consulta criada/alterada pelo paciente -> notifica o painel da clínica
  IF NEW.origem = 'paciente' THEN
    IF NEW.parceiro_id IS NULL THEN
      RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
      v_titulo := 'agendou uma consulta';
    ELSIF NEW.status = 'cancelada' AND OLD.status IS DISTINCT FROM 'cancelada' THEN
      v_titulo := 'cancelou uma consulta';
    ELSIF NEW.data_hora IS DISTINCT FROM OLD.data_hora THEN
      v_titulo := 'remarcou uma consulta';
    ELSE
      RETURN NEW;
    END IF;

    SELECT nome INTO v_nome FROM titulares WHERE id = NEW.titular_id;

    INSERT INTO parceiro_notificacoes (parceiro_id, titular_id, tipo, titulo, descricao, link, referencia_id)
    VALUES (
      NEW.parceiro_id,
      NEW.titular_id,
      'consulta',
      COALESCE(v_nome, 'Paciente') || ' ' || v_titulo,
      concat_ws(' · ', NULLIF(NEW.profissional, ''), NULLIF(NEW.local, ''), v_quando),
      '/admin-parceiro/agenda',
      NEW.id
    );

    RETURN NEW;
  END IF;

  -- Consulta da clínica -> notifica o paciente (comportamento original)
  IF TG_OP = 'INSERT' THEN
    v_titulo := 'Nova consulta agendada';
  ELSIF NEW.status = 'cancelada' AND OLD.status IS DISTINCT FROM 'cancelada' THEN
    v_titulo := 'Consulta cancelada';
  ELSIF NEW.data_hora IS DISTINCT FROM OLD.data_hora THEN
    v_titulo := 'Consulta remarcada';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO mp_notificacoes (titular_id, auth_id, titulo, descricao, hora_label, tipo, link)
  VALUES (
    NEW.titular_id,
    NEW.auth_id,
    v_titulo,
    concat_ws(' · ', NULLIF(NEW.profissional, ''), NULLIF(NEW.local, ''), v_quando),
    to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'),
    'consulta',
    '/medicina-preventiva/receitas-consultas'
  );

  RETURN NEW;
END
$fn$;

-- Trigger já existe (011); a função foi só substituída acima.
