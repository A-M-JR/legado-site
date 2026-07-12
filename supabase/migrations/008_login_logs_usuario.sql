-- Campos de identificação do usuário nos logs de login
ALTER TABLE public.login_logs
  ADD COLUMN IF NOT EXISTS usuario_nome TEXT,
  ADD COLUMN IF NOT EXISTS usuario_email TEXT,
  ADD COLUMN IF NOT EXISTS usuario_role TEXT;
