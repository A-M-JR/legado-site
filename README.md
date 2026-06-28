# Legado Site (ILC)

Plataforma web do Instituto Legado e Conforto — landing pública + app autenticado (luto, recordações, diário, exercícios, admin).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Storage)

## Setup

```bash
yarn install
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
yarn dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Servidor de desenvolvimento |
| `yarn build` | Build de produção |
| `yarn lint` | ESLint |
| `yarn test` | Testes (Vitest) |
| `yarn audit` | Auditoria de dependências |

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anon (pública no client) |

**Nunca** commitar `.env` ou expor `service_role` no frontend.

## Segurança (Supabase)

Consulte [docs/RLS_CHECKLIST.md](docs/RLS_CHECKLIST.md) para policies RLS, Storage e RPCs a configurar no painel Supabase.

## Estrutura

```
src/
├── admin/           # Painel admin_master
├── admin-parceiro/  # Painel parceiro_admin
├── pages/           # Rotas públicas e legado-app
├── components/      # UI compartilhada
└── lib/             # Supabase client, validação, upload
```
