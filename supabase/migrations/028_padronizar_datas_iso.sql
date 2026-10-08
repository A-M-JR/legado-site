-- 028_padronizar_datas_iso.sql
-- Padroniza as datas de dependentes em ISO yyyy-MM-dd.
--
-- dependentes.data_nascimento / data_falecimento são TEXTO: cadastros antigos gravavam dd/MM/aaaa,
-- os formulários atuais gravam ISO. O admin (input type="date") e o Melhor Idade só entendem ISO.
-- titulares.data_nascimento / data_falecimento já são do tipo DATE (sempre ISO): nada a converter.
--
-- Só converte datas dd/MM/aaaa VÁLIDAS. Datas impossíveis (ex.: 25/15/1990) ficam como estão e
-- aparecem na consulta final, junto com datas suspeitas dos titulares, para correção manual.
-- Idempotente.

CREATE OR REPLACE FUNCTION pg_temp.data_br_para_iso(v text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  IF v ~ '^\d{2}/\d{2}/\d{4}$' THEN
    RETURN to_char(make_date(substr(v, 7, 4)::int, substr(v, 4, 2)::int, substr(v, 1, 2)::int), 'YYYY-MM-DD');
  END IF;
  RETURN v;
EXCEPTION WHEN others THEN
  RETURN v; -- data impossível: mantém para correção manual
END;
$$;

UPDATE public.dependentes
SET data_nascimento = pg_temp.data_br_para_iso(data_nascimento)
WHERE data_nascimento ~ '^\d{2}/\d{2}/\d{4}$'
  AND pg_temp.data_br_para_iso(data_nascimento) <> data_nascimento;

UPDATE public.dependentes
SET data_falecimento = pg_temp.data_br_para_iso(data_falecimento)
WHERE data_falecimento ~ '^\d{2}/\d{2}/\d{4}$'
  AND pg_temp.data_br_para_iso(data_falecimento) <> data_falecimento;

-- Pendências para correção manual.
SELECT 'dependentes' AS tabela, id, nome, data_nascimento, data_falecimento,
       CASE
         WHEN data_nascimento !~ '^\d{4}-\d{2}-\d{2}$' THEN 'nascimento inválido'
         WHEN coalesce(data_falecimento, '') <> '' AND data_falecimento !~ '^\d{4}-\d{2}-\d{2}$' THEN 'falecimento inválido'
         ELSE 'falecimento antes do nascimento'
       END AS problema
FROM public.dependentes
WHERE (data_nascimento IS NOT NULL AND data_nascimento !~ '^\d{4}-\d{2}-\d{2}$')
   OR (coalesce(data_falecimento, '') <> '' AND data_falecimento !~ '^\d{4}-\d{2}-\d{2}$')
   OR (data_falecimento ~ '^\d{4}-\d{2}-\d{2}$' AND data_nascimento ~ '^\d{4}-\d{2}-\d{2}$'
       AND data_falecimento < data_nascimento)
UNION ALL
SELECT 'titulares', id, nome, data_nascimento::text, data_falecimento::text,
       CASE
         WHEN data_nascimento > current_date OR data_nascimento < date '1900-01-01' THEN 'nascimento fora do intervalo'
         WHEN data_falecimento > current_date THEN 'falecimento no futuro'
         ELSE 'falecimento antes do nascimento'
       END
FROM public.titulares
WHERE data_nascimento > current_date
   OR data_nascimento < date '1900-01-01'
   OR data_falecimento > current_date
   OR data_falecimento < data_nascimento;
