-- 027_limpar_espacos_nomes.sql
-- Remove espaços nas pontas e espaços duplicados dos nomes ("Maria Antonia " → "Maria Antonia").
-- Nomes assim quebram o *negrito* das mensagens de WhatsApp e o título do preview da nota.
-- Os formulários já limpam ao salvar (limparNome em src/lib/masks.ts); isto corrige o legado.
-- Idempotente. Só altera linhas que mudam.

UPDATE public.dependentes
SET nome = btrim(regexp_replace(nome, '\s+', ' ', 'g'))
WHERE nome IS NOT NULL
  AND nome <> btrim(regexp_replace(nome, '\s+', ' ', 'g'));

UPDATE public.titulares
SET nome = btrim(regexp_replace(nome, '\s+', ' ', 'g'))
WHERE nome IS NOT NULL
  AND nome <> btrim(regexp_replace(nome, '\s+', ' ', 'g'));
