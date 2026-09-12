# Mapa de Fluxos × RLS — Tabelas Críticas

> **Status:** ✅ APLICADO em produção (migrations 019–025). Ver seção "Status de execução" no fim. Verificado com simulação de papéis via `scripts/db.mjs`.
> Gerado a partir de: (1) leitura das policies/funções reais do Postgres via `scripts/check-rls.mjs` e `scripts/inspect-schema.mjs`; (2) mapeamento de todos os `.from()`/`.rpc()` em `src/**`.
> Projeto Supabase: `pmxjotmuijonybnqulen`. Cliente único **anon** em `src/lib/supabaseClient.ts` (não existe `service_role` no frontend) → **toda a segurança real depende de RLS + do corpo das RPCs `SECURITY DEFINER`**. Os filtros `.eq(...)` no código são conveniência, não segurança.

---

## 1. Sumário executivo

O modelo de autorização **correto já existe** e está bem feito nos módulos `mi_*` (Melhor Idade) e `mp_*` (Medicina Preventiva): RLS ligado + funções helper `SECURITY DEFINER`. O problema está concentrado em ~10 tabelas *core* multi-tenant, onde o RLS foi **desligado** (ou afrouxado com `USING true`) para destravar o desenvolvimento.

**Ponto-chave que remove o principal medo:** as funções helper (`mi_can_access`, `mp_parceiro_pode_acessar`, `get_parceiro_id`, …) são todas `SECURITY DEFINER` — rodam com privilégio do dono e **ignoram o RLS de quem chama**. Ligar RLS nas tabelas críticas **não quebra** essas funções nem os módulos que já funcionam.

### Achados por severidade

| # | Severidade | Achado |
|---|---|---|
| 1 | 🔴🔴 **Crítico** | RPC `alterar_senha_usuario` **sem checagem de chamador** → qualquer anon reseta a senha de qualquer usuário (account takeover). Corrigir **antes** de qualquer RLS. |
| 2 | 🔴 Crítico | RPC `get_usuarios_com_email` **sem checagem de papel** → vaza e-mail+role de todos. |
| 3 | 🔴 Crítico | `titulares`, `usuarios_app`, `titular_modulos` com **RLS OFF** apesar de terem policies → tabelas 100% abertas (leitura e escrita) via anon key. |
| 4 | 🔴 Crítico | `config_sistema`, `parceiro_modulos`, `assinaturas` com **RLS OFF e sem policy** → abertas. |
| 5 | 🟠 Alto | `dependentes` e `titulares` com policy `anon ... USING true` + `consulta-recordacao` permite **enumerar PII por CPF** sem login. |
| 6 | 🟠 Alto | Policies `USING true` para `authenticated` em `login_logs`, `parceiros`, `recordacoes`, `usuarios_app`, `titular_modulos` → quebram o isolamento multi-tenant (um logado vê/edita dados de outro). |
| 7 | 🟡 Médio | Policy "Acesso a memorias do titular/subtitular" em `recordacoes` compara `dependentes.id_titular = auth.uid()` (id de titular vs auth uid) — **nunca casa**; e a tabela tem colunas duplicadas `id_dependente`/`dependente_id`. |

### Ordem de correção recomendada

1. **RPCs** (#1, #2) — mudança cirúrgica, alto impacto, **não** afeta fluxos legítimos.
2. **Vitórias fáceis:** `assinaturas` (sem uso no front → RLS deny-all) e `config_sistema` (leitura ampla + escrita admin).
3. **`titular_modulos`** e **`parceiro_modulos`** (menos arriscadas).
4. **`titulares`** e **`usuarios_app`** (núcleo — exigem os helpers e as rotas públicas via RPC).
5. **`dependentes`/`recordacoes`** + migrar rotas públicas para RPC restrita.
6. **`login_logs`**, **`parceiros`**, **`parceiro_notificacoes`** (apertar `USING true`).

> ⚠️ **Regra de ouro ao ligar RLS numa tabela que hoje está OFF:** ligar RLS faz o Postgres passar a **exigir** policy para *cada* operação. Se dropar uma policy `USING true` sem ter criado a policy de escopo equivalente, o fluxo legítimo quebra. Cada seção abaixo lista a policy de escopo que **precisa existir** para o fluxo continuar funcionando.

---

## 2. Modelo de acesso (helpers já existentes no banco)

Todas `SECURITY DEFINER`, `STABLE`, `search_path=public`:

- **`mi_user_titular_ids()`** → `SETOF uuid`: titulares que o usuário administra (via `usuarios_app.titular_id`) **ou** dos quais é o próprio dono (`titulares.auth_id = auth.uid()`).
- **`mi_can_access(p_titular_id, p_auth_id)`** → `p_auth_id = auth.uid() OR p_titular_id IN (mi_user_titular_ids())`.
- **`mp_parceiro_do_usuario()`** → `parceiro_id` do usuário logado **se** `role IN ('parceiro_admin','parceiro_operador')` e `status='ativo'`.
- **`mp_parceiro_pode_acessar(p_titular_id)`** → true se o parceiro do usuário logado é dono do titular (via `usuarios_app`).
- **`mp_can_access(p_titular_id, p_auth_id)`** → `mi_can_access(...) OR mp_parceiro_pode_acessar(...)`.
- **`get_parceiro_id()`** → `parceiro_id` do usuário logado (qualquer role).
- **`mp_parceiro_do_contexto()`** → parceiro do usuário **ou** do titular que ele administra.

### Helper que falta (proposto)

```sql
-- SECURITY DEFINER evita recursão de RLS ao ser usado em policies da própria usuarios_app.
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios_app
    WHERE auth_id = auth.uid()
      AND role IN ('admin_master','admin')
      AND COALESCE(status,'ativo') = 'ativo'
  );
$$;
```

`usuarios_app` (pivô): `auth_id, role, parceiro_id, titular_id, status`.
`titulares`: **não tem** `parceiro_id` — o vínculo com parceiro mora em `usuarios_app`. Por isso as policies de parceiro em `titulares` usam `mp_parceiro_pode_acessar(id)`.

---

## 3. RPCs `SECURITY DEFINER` — auditoria

| RPC | Chamada por (código) | Checa autorização internamente? | Ação |
|---|---|---|---|
| `alterar_senha_usuario(user_id, nova_senha)` | `admin/.../GerenciarUsuario.tsx:487` | ❌ **NÃO** — reseta senha de qualquer `user_id` | 🔴🔴 Adicionar guarda `is_admin_master()` no topo; `REVOKE EXECUTE ... FROM anon, authenticated`. Definir `search_path`. |
| `get_usuarios_com_email()` | `admin/TitularesPage.tsx:56`, `admin/AdminDashboard.tsx:201` | ❌ **NÃO** — lista todos os e-mails/roles | 🔴 Adicionar guarda `is_admin_master()`; `REVOKE ... FROM anon`. |
| `alterar_email_usuario(p_auth_id, p_novo_email)` | admin `GerenciarUsuario.tsx:190`; parceiro `EditTitularDialog.tsx:136` | ✅ Sim — valida role e escopo de parceiro | Manter. (Opcional: `REVOKE ... FROM anon`.) |
| `mi_get_homenageado_memoria` / `mp_get_pessoa_publica` | rotas públicas Mi/Mp | ✅ Retornam só `nome`+`imagem_url` | Manter. **Modelo** para leitura pública das demais tabelas. |

> Correção de #1 (modelo):
> ```sql
> CREATE OR REPLACE FUNCTION public.alterar_senha_usuario(user_id uuid, nova_senha text)
> RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path=public, auth AS $$
> BEGIN
>   IF NOT public.is_admin_master() THEN
>     RAISE EXCEPTION 'Sem permissão';
>   END IF;
>   ...  -- corpo atual
> END; $$;
> REVOKE EXECUTE ON FUNCTION public.alterar_senha_usuario(uuid,text) FROM anon, authenticated;
> ```

---

## 4. Tabelas críticas — estado atual × proposta

Notação das policies propostas: `SELECT/INSERT/UPDATE/DELETE` com a expressão de `USING` (leitura) / `WITH CHECK` (escrita).

### 4.1 `titulares`  — RLS **OFF**, 10 policies (ignoradas)

Colunas sensíveis: `email, telefone, cpf, auth_id`. Sem `parceiro_id`.

**Quem acessa (código):**
- **Público** (sem login): SELECT por `id` em `recordacoes-publicas/[id].tsx:31,71`, `sucesso.tsx:24` → só precisa de `nome, imagem_url, datas, falecido`.
- **Titular/familiar:** SELECT/UPDATE/INSERT da própria linha. A maioria filtra por `auth_id`, mas `legado-app/titulares/editar.tsx:42,136` filtra **só por `id`** → depende de RLS.
- **Parceiro:** SELECT/INSERT/UPDATE da carteira; `EditTitularDialog.tsx:58,145` e `dashboard.tsx:78` acessam **só por `id`/texto** → depende de RLS.
- **Admin_master:** acesso total.

**Proposta RLS (ligar RLS + substituir as 10 policies):**
- `SELECT`: `auth.uid() = auth_id OR id IN (SELECT mi_user_titular_ids()) OR mp_parceiro_pode_acessar(id) OR is_admin_master()`
- `INSERT` (self-signup, criação por parceiro/admin): `WITH CHECK (auth.uid() = auth_id OR mp_parceiro_do_usuario() IS NOT NULL OR is_admin_master())`
- `UPDATE`: `USING/WITH CHECK (auth.uid() = auth_id OR mp_parceiro_pode_acessar(id) OR is_admin_master())`
- `DELETE`: `is_admin_master()`
- **Remover** `anon_read_from_public_route` (SELECT anon `true`) e criar RPC `get_titular_publico(p_id uuid)` `SECURITY DEFINER` retornando só colunas públicas; ajustar as 3 páginas públicas para usá-la. (Padrão de `mi_get_homenageado_memoria`.)

### 4.2 `usuarios_app`  — RLS **OFF**, 3 policies (ignoradas). ⚠️ Pivô de autorização.

**Quem acessa:** base de todo o auth client-side (`PrivateRoute:85`, todos os `*Scope`). SELECT próprio sempre por `auth_id`. Parceiro lista/insere/atualiza equipe e vínculos por `parceiro_id`, mas **UPDATEs por `id`/`auth_id` não reconferem `parceiro_id`** (`equipeService.ts:89`, `EditTitularDialog.tsx:167`). Login faz **auto-INSERT** do próprio perfil (`login.tsx:66`, `role:'titular'`).

**Risco central:** escalonamento de privilégio — impedir que um usuário insira/atualize a própria linha para `role='admin_master'`.

**Proposta RLS:**
- `SELECT`: `auth_id = auth.uid() OR parceiro_id = mp_parceiro_do_usuario() OR is_admin_master()` (mantém a policy `usuarios_app_select_proprio_ou_mesmo_parceiro`; **remover** `Permitir leitura para autenticados` = `true`).
- `INSERT`: `WITH CHECK ( (auth_id = auth.uid() AND role = 'titular') OR (parceiro_id = mp_parceiro_do_usuario() AND role IN ('parceiro_operador','titular')) OR is_admin_master() )` — trava o auto-cadastro em `role='titular'`.
- `UPDATE`: `USING (parceiro_id = mp_parceiro_do_usuario() OR is_admin_master())` e `WITH CHECK` idem **+ impedir virar admin** (`role <> 'admin_master'` salvo `is_admin_master()`).
- `DELETE`: `is_admin_master()`.

> As policies acima usam **apenas** helpers `SECURITY DEFINER` → sem recursão de RLS sobre a própria `usuarios_app`.

### 4.3 `titular_modulos`  — RLS **OFF**, 9 policies (ignoradas)

**Quem acessa:** titular/familiar só SELECT (sempre por `titular_id`); parceiro e admin fazem SELECT/INSERT/UPDATE/DELETE. `GerenciarUsuario.tsx:230` (DELETE) e `GerenciarModulosTitular.tsx:146` (UPDATE por `id`) **não filtram por dono** → dependem de RLS.

**Proposta RLS:**
- `SELECT`: `titular_id IN (SELECT mi_user_titular_ids()) OR mp_parceiro_pode_acessar(titular_id) OR is_admin_master()`
  - ⚠️ **Obrigatório** criar a parte `titular_id IN (mi_user_titular_ids())`: hoje o titular só lê porque existe `Permitir leitura para autenticados = true`. Ao remover essa policy, sem a de escopo, **`PrivateRoute:205` e `selecao-modulos:65` quebram** (o app não decide os módulos).
- `INSERT/UPDATE/DELETE`: `mp_parceiro_pode_acessar(titular_id) OR is_admin_master()`
- **Remover** `Permitir leitura para autenticados` = `true`.

### 4.4 `dependentes`  — RLS **ON**, 6 policies (uma perigosa)

**Quem acessa:** anon lê 1 homenageado por `id`/**CPF** (PII!); autenticado CRUD por `id_titular`/`id`.

**Proposta RLS:**
- **Remover** `anon_read_from_public_route` (SELECT anon `true`). Criar RPC `get_dependente_publico(p_id uuid)` retornando só `id, nome, imagem_url, data_nascimento, data_falecimento, falecido`; e para a busca por CPF (`consulta-recordacao`) uma RPC `get_homenageado_por_cpf(p_cpf text)` — assim o anon **não** faz `select *` na tabela e a enumeração fica controlada server-side (ideal: rate limit / captcha).
- Manter/normalizar as policies autenticadas de titular/subtitular (usar `mi_can_access` ou `EXISTS(titulares … auth.uid())`).

### 4.5 `recordacoes`  — RLS **ON**, policies frouxas + 1 quebrada

**Quem acessa:** anon **INSERT** (deixar recado pelo link) — único acesso anon, ok; autenticado SELECT/DELETE.

**Problemas:** `recordacoes - SELECT/UPDATE/DELETE` são `authenticated USING true` (qualquer logado lê/apaga tudo). A policy "Acesso a memorias..." compara `dependentes.id_titular = auth.uid()` — **bug, nunca casa**. Colunas duplicadas `id_dependente` vs `dependente_id` (código usa `dependente_id`).

**Proposta RLS:**
- `INSERT` (anon): manter, mas restringir colunas/validar (idealmente via RPC com rate limit).
- `SELECT/DELETE` (autenticado): `EXISTS (SELECT 1 FROM dependentes d WHERE d.id = recordacoes.dependente_id AND (d.id_titular IN (SELECT mi_user_titular_ids()) OR d.auth_id = auth.uid()))` — **remover** os `USING true`.
- Decidir e consolidar `id_dependente`/`dependente_id` (dívida técnica).

### 4.6 `parceiros`  — RLS **ON**, policies `authenticated USING true`

**Quem acessa:** admin_master CRUD global; parceiro/operador e app legado só SELECT do próprio (`id = parceiro_id`); branding em `selecao-modulos:112`.

**Proposta RLS:**
- `SELECT`: `is_admin_master() OR id = get_parceiro_id() OR id IN (SELECT ua.parceiro_id FROM usuarios_app ua WHERE ua.titular_id IN (SELECT mi_user_titular_ids()))` (cobre o branding do titular sem vazar `cnpj/contrato_url` a todos).
- `INSERT/UPDATE`: `is_admin_master()` (**remover** os `true` — só admin cria/edita parceiro).

### 4.7 `parceiro_modulos`  — RLS **OFF, sem policy**

**Quem acessa:** admin_master lê + **upsert** (única escrita); parceiro/operador só SELECT por `parceiro_id`; titular lê em `selecao-modulos:42`.

**Proposta RLS (ligar):**
- `SELECT`: `is_admin_master() OR parceiro_id = get_parceiro_id() OR parceiro_id IN (SELECT ua.parceiro_id FROM usuarios_app ua WHERE ua.titular_id IN (SELECT mi_user_titular_ids()))`
- `INSERT/UPDATE/DELETE`: `is_admin_master()`

### 4.8 `parceiro_notificacoes`  — RLS **ON**, 3 policies

**Quem acessa:** só parceiro. `marcarLida` (`notificacoesParceiroService.ts:43`) faz UPDATE **só por `id`** → depende de RLS. Policies atuais já usam `mp_parceiro_do_usuario/contexto` — **manter/validar**: `USING/WITH CHECK (parceiro_id = mp_parceiro_do_usuario())`.

### 4.9 `config_sistema`  — RLS **OFF, sem policy** (singleton)

**Quem acessa:** SELECT amplo (tema/manutenção/branding, inclusive `ThemeProvider` possivelmente pré-login); UPDATE só admin_master.

**Proposta RLS (ligar):**
- `SELECT`: `true` (para `anon` e `authenticated`) — baixa sensibilidade; se quiser, expor só `nome_sistema, logo_url, cor_primaria, manutencao_ativa` via view/RPC.
- `UPDATE`: `is_admin_master()`. Sem INSERT/DELETE (singleton).

### 4.10 `assinaturas`  — RLS **OFF, sem policy**

**Sem uso no frontend** (`0` ocorrências). **Vitória fácil:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` sem nenhuma policy (deny-all para anon/authenticated). Se for usada por algum job, adicionar policy específica depois.

### 4.11 `login_logs`  — RLS **ON**, policies `true` demais

**Quem acessa:** INSERT por qualquer autenticado (o próprio login, payload com seu `auth_id`); SELECT só admin (um por `auth_id`, o dashboard **global sem filtro**).

**Proposta RLS:**
- `INSERT`: `WITH CHECK (auth_id = auth.uid())` (**remover** `Permitir insert de logs` = `true`; manter `users can insert own logs`).
- `SELECT`: `is_admin_master()` (opcional: parceiro vê logs do próprio `parceiro_id`). **Remover** `Permitir leitura para usuários autenticados` e `Permitir select de logs` (ambas `true`).

---

## 5. Operações que hoje dependem 100% de RLS (sem checagem no código)

Confirmam por que apertar o RLS é obrigatório — o cliente não protege:

- `usuarios_app`: UPDATE/INSERT de `role/status/parceiro_id` (risco de escalonamento).
- `titular_modulos`: DELETE (admin) e UPDATE por `id` (parceiro) sem filtro de dono.
- `titulares`: SELECT/UPDATE por `id` em `editar.tsx` e área de parceiro.
- `parceiro_notificacoes`: `marcarLida` por `id`.
- `login_logs`: SELECT global do dashboard.
- `parceiros`/`parceiro_modulos`: escrita sem validação de papel no client.

---

## 6. Próximos passos sugeridos

1. **Corrigir as RPCs #1 e #2** (guarda `is_admin_master()` + `REVOKE`) — migration curta, testável isoladamente. **Maior risco atual.**
2. Criar o helper `is_admin_master()` e as RPCs de leitura pública (`get_titular_publico`, `get_dependente_publico`, `get_homenageado_por_cpf`).
3. Escrever **uma migration por tabela** (idempotente: `DROP POLICY IF EXISTS` + `CREATE POLICY`), aplicar em **staging/branch** e validar cada fluxo com um usuário de cada papel (titular, familiar, parceiro_admin, operador, admin_master).
4. Rodar `node scripts/check-rls.mjs public` depois e reconferir no Security Advisor.
5. Só então aplicar em produção, tabela a tabela, na ordem da seção 1.

### Scripts de apoio (somente leitura) criados
- `scripts/check-rls.mjs` — status de RLS + todas as policies (`node scripts/check-rls.mjs [schema]`).
- `scripts/inspect-schema.mjs` — colunas das tabelas críticas + corpo dos helpers.
- `scripts/inspect-rpcs.mjs` — corpo das RPCs sensíveis.

> Estes scripts leem `SUPABASE_DB_PASSWORD` do `.env` (que está no `.gitignore`). **Não commitar a senha.**

---

## 7. Status de execução (aplicado em produção)

Aplicado e verificado com simulação de papéis (`scripts/db.mjs --as <uid>` / `--anon`, sempre em transação revertida). Todas as tabelas do schema `public` estão com **RLS ON**.

| Migration | Conteúdo | Verificação |
|---|---|---|
| `019_seguranca_rpcs.sql` | Helper `is_admin_master()`; guarda de admin em `alterar_senha_usuario` e `get_usuarios_com_email`; `REVOKE EXECUTE ... FROM anon` | titular → "Sem permissão"; admin → OK |
| `020_rls_faceis.sql` | RLS `assinaturas` (dono/admin) e `config_sistema` (leitura ampla, escrita admin) | anon lê config; anon não lê assinaturas |
| `021_rls_modulos.sql` | RLS `titular_modulos` (+ escopo do titular) e `parceiro_modulos` | titular vê só os seus; parceiro vê a carteira |
| `022_rls_titulares_usuarios.sql` | RLS núcleo `titulares` e `usuarios_app`; bloqueio de escalonamento de role | edição cruzada e auto-admin bloqueados |
| `023_rls_logs_parceiros.sql` | Aperto de `login_logs` (só admin lê) e `parceiros` (leitura escopada, escrita admin) | titular/parceiro não leem logs globais |
| `024_rls_dependentes_recordacoes.sql` | Grant por coluna p/ `anon` em `titulares`/`dependentes`; RPC `get_homenageado_por_cpf`; aperto de `recordacoes` | anon: `permission denied` em cpf/email/telefone; páginas públicas OK |
| `025_rls_v_auth_id.sql` | RLS deny-all na tabela residual `v_auth_id` | nenhuma tabela `public` sem RLS |

**Frontend:** `src/pages/consulta-recordacao/index.tsx` migrado de `SELECT ... .eq('cpf')` para `rpc('get_homenageado_por_cpf')`. Bônus: a busca antiga estava **quebrada** (comparava dígitos contra `cpf` armazenado formatado, 14 chars) — a RPC normaliza os dois lados e agora funciona.

### Itens residuais (recomendações, não bloqueiam)

1. **[Médio] Auto-provisionamento em `usuarios_app`.** Como os cadastros usam `signUp` no cliente (que troca a sessão), o `INSERT` roda sob a sessão do usuário recém-criado. A policy permite que um usuário insira a **própria** linha como `titular`/`parceiro_operador` com um `parceiro_id` qualquer — teoricamente, alguém poderia se vincular a um parceiro. Escalonamento para `admin_master`/`parceiro_admin` **está bloqueado**. Correção definitiva: mover a criação de usuários para uma **RPC `SECURITY DEFINER`** (ou Edge Function com `service_role`) chamada **após** restaurar a sessão do admin/parceiro, validando o autor.
2. **[Baixo] `titular_modulos` intra-parceiro.** A policy `Parceiros podem gerenciar módulos de seus titulares` [ALL] casa para qualquer usuário do mesmo `parceiro_id` (inclui titular). Não vaza entre parceiros. Opcional: restringir escrita a `role` de parceiro.
3. **[Baixo] Rate limit no INSERT anônimo de `recordacoes`** (spam). Considerar captcha/limite server-side.
4. **Tracking de migrations:** as 019–025 foram aplicadas direto via `scripts/db.mjs` (idempotentes). Para um ambiente novo, adicioná-las ao `PENDING` de `scripts/run-migrations.mjs` ou aplicar via este mesmo script.
