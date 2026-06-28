# Checklist RLS — Supabase

Aplicar manualmente no painel Supabase (SQL Editor / Authentication / Policies).

## Tabelas críticas

- [ ] `usuarios_app` — usuário só lê/atualiza próprio registro; admin via role
- [ ] `titulares` — titular/familiar acessa apenas titular vinculado
- [ ] `dependentes` — acesso restrito ao titular dono
- [ ] `recordacoes` — insert público limitado; leitura/delete só dono
- [ ] `diarios_luto` — CRUD apenas `auth_id` do usuário
- [ ] `exercicios_realizados` — CRUD apenas `auth_id` do usuário

## Operações públicas

- [ ] `recordacoes` INSERT anônimo — limitar colunas, rate limit (Edge Function ou Supabase)
- [ ] `dependentes` SELECT por CPF — retornar apenas colunas públicas (nome, imagem, datas)
- [ ] Bloquear auto-insert em `usuarios_app` no login (usar trigger ou policy)

## RPCs

- [ ] `alterar_senha_usuario` — restrito a `service_role` ou admin verificado server-side

## Storage

- [ ] Buckets `titulares`, `dependentes`, `recordacoes` — validar MIME e tamanho nas policies
- [ ] Upload público em `recordacoes/publicas/` — somente imagens, tamanho máximo

## IDOR (queries sem filtro auth_id no frontend)

RLS deve garantir que update/delete em `titulares`, `dependentes`, `diarios_luto` e `recordacoes` só afetem registros do usuário autenticado.

## Rotação de chaves

- [ ] Rotacionar `anon key` e `service_role key` após remover `.env` do histórico Git
- [ ] Nunca expor `service_role` no frontend (apenas variáveis `VITE_*`)
