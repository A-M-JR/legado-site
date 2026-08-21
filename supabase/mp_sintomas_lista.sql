-- ============================================================
-- Lista de sintomas da clínica — só a função mp_seed_sintomas
-- Use este arquivo se o script completo JÁ foi rodado e você só
-- quer atualizar a lista. Pode rodar quantas vezes quiser.
-- ============================================================

CREATE OR REPLACE FUNCTION mp_seed_sintomas(p_parceiro_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_inseridos INT := 0;
BEGIN
  IF p_parceiro_id IS NULL OR p_parceiro_id <> mp_parceiro_do_usuario() THEN
    RAISE EXCEPTION 'Sem permissão para este parceiro';
  END IF;

  WITH sugeridos(nome, categoria, gravidade, ordem) AS (
    VALUES
      ('Sede excessiva (polidipsia)', 'Metabólico', 'media', 1),
      ('Urinar com frequência, inclusive à noite (poliúria/nictúria)', 'Urinário', 'media', 2),
      ('Fome excessiva (polifagia)', 'Metabólico', 'media', 3),
      ('Cansaço, fraqueza ou sonolência', 'Geral', 'media', 4),
      ('Visão embaçada/turva', 'Visão', 'alta', 5),
      ('Formigamento ou dormência nas mãos e pés', 'Neurológico', 'alta', 6),
      ('Feridas que demoram para cicatrizar', 'Dermatológico', 'alta', 7),
      ('Boca e pele secas', 'Dermatológico', 'baixa', 8),
      ('Desidratação', 'Geral', 'alta', 9),
      ('Perda de peso sem explicação', 'Metabólico', 'alta', 10),
      ('Infecções recorrentes, inclusive urinárias e de pele', 'Infeccioso', 'alta', 11)
  )
  INSERT INTO mp_sintomas_catalogo (parceiro_id, nome, categoria, gravidade_padrao, ordem)
  SELECT p_parceiro_id, s.nome, s.categoria, s.gravidade, s.ordem
  FROM sugeridos s
  WHERE NOT EXISTS (
    SELECT 1 FROM mp_sintomas_catalogo c
    WHERE c.parceiro_id = p_parceiro_id AND lower(c.nome) = lower(s.nome)
  );

  GET DIAGNOSTICS v_inseridos = ROW_COUNT;
  RETURN v_inseridos;
END
$fn$;

-- Depois de rodar: no painel do parceiro, em
-- "Cadastro de sintomas", clique em "Lista sugerida".
-- Ou descomente a linha abaixo trocando pelo id do parceiro:
-- SELECT mp_seed_sintomas('COLE_AQUI_O_ID_DO_PARCEIRO'::uuid);
