-- 025_rls_v_auth_id.sql
-- v_auth_id é uma TABELA residual (1 col id uuid, 1 linha), sem uso no frontend,
-- mas com RLS off e DML aberto ao anon. Liga RLS deny-all (sem policy).
-- NÃO apaga dados.
ALTER TABLE public.v_auth_id ENABLE ROW LEVEL SECURITY;
