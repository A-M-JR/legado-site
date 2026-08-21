# Plano — Novo módulo **Medicina Preventiva**

> Base: análise do módulo `melhor-idade` (paciente), do `admin-parceiro` e do schema `mi_*` no Supabase.

---

## 1. Como o módulo Melhor Idade está montado hoje (ponto de partida)

| Camada | Onde está | Observação |
|---|---|---|
| Rotas | [App.tsx:101-139](../src/App.tsx) | `/melhor-idade` + filhas, dentro de `PrivateRoute` |
| Shell (header/sidebar/bottom nav) | [MelhorIdadeLayout.tsx](../src/modules/melhor-idade/components/MelhorIdadeLayout.tsx) | Provider + onboarding gate |
| Menu | [BottomNav.tsx](../src/modules/melhor-idade/components/BottomNav.tsx) | `NAV_ITEMS` alimenta bottom nav **e** sidebar |
| "Minha rotina" | rota `minha-rotina` → [CuidadoPage.tsx](../src/modules/melhor-idade/pages/CuidadoPage.tsx) + `cuidadoService` → tabela `mi_cuidados` | tarefas por período (manhã/tarde/noite), tipo, responsável, feito |
| "Meu cuidado" | rota `meu-cuidado` → [ReceitasPage.tsx](../src/modules/melhor-idade/pages/ReceitasPage.tsx) (1046 linhas) + `receitasService` → `mi_receitas` + `mi_consultas` | receita com foto, médico, validade, observações; consultas com calendário ([MiConsultasCalendario.tsx](../src/modules/melhor-idade/components/MiConsultasCalendario.tsx)) |
| Notificações do paciente | `mi_notificacoes` + [NotificacoesBell.tsx](../src/modules/melhor-idade/components/NotificacoesBell.tsx) | tipo tem CHECK: `mensagem, medicacao, consulta, cuidado, sistema` |
| Escopo de dados | [miScope.ts](../src/modules/melhor-idade/services/miScope.ts) | todo insert grava `titular_id` + `auth_id`; leitura filtra por `titular_id` |
| RLS | [001_melhor_idade.sql](../supabase/migrations/001_melhor_idade.sql) | `mi_can_access(titular_id, auth_id)` — **só titular/familiar. Parceiro NÃO enxerga nada hoje** |
| Catálogo de módulos | tabelas `modulos`, `parceiro_modulos`, `titular_modulos` | nomes atuais: `Legado`, `Cuidado ao Idoso`, `Cuidados Paliativos` |
| Roteamento pós-login | `direcionarParaModulo()` em [selecao-modulos/page.tsx](../src/pages/legado-app/selecao-modulos/page.tsx) | `if (nome.includes("idoso")) navigate("/melhor-idade")` |
| Painel do parceiro | [ParceiroLayout.tsx](../src/admin-parceiro/ParceiroLayout.tsx) + [dashboard.tsx](../src/admin-parceiro/dashboard.tsx) | hoje só "Meus Clientes"; **sem agenda, sem notificações, sem configurações** |

**Consequência principal:** as duas funcionalidades novas do lado do parceiro (agenda de consultas e caixa de sintomas) exigem **um caminho de acesso que não existe hoje** — RLS liberando o `parceiro_admin` a ler/escrever dados do paciente vinculado ao seu parceiro.

---

## 2. Decisões de arquitetura recomendadas

1. **Módulo novo, tabelas novas (`mp_*`).** Não reaproveitar `mi_cuidados`/`mi_receitas`/`mi_consultas`. Um titular pode ter os dois módulos ativos e os dados se misturariam (a rotina do idoso não é a rotina preventiva). Custo: duplicar 3 tabelas. Benefício: zero risco de regressão no Melhor Idade, que está em produção.
2. **Pasta espelhada** `src/modules/medicina-preventiva/` com a mesma estrutura (`components/ pages/ services/ types/ lib/`).
3. **Componentes de UI reaproveitados por import direto** de `@/modules/melhor-idade/components` na fase 1 (`MiCard`, `MiPageHeader`, `MiDatePicker`, `MiFullscreenMedia`, `MiConsultasCalendario`) — são puramente apresentacionais. Só se houver divergência visual, promover para `src/modules/shared/ui/`.
4. **Uma única fonte de dados para a consulta.** A consulta criada pela funcionária no painel e a criada pelo paciente vivem na **mesma tabela** `mp_consultas`, diferenciadas por `origem` (`paciente` | `clinica`) e `status`. É isso que faz "se o paciente acessar, a consulta está lá" funcionar sem sincronização.
5. **Notificações em duas mãos:** `mp_notificacoes` (paciente, igual ao padrão `mi_notificacoes`) e `parceiro_notificacoes` (nova, para o painel do parceiro receber sintomas). Sem push nativo — é sino in-app com contador (mesmo padrão do `NotificacoesBell`).
6. **Perfil/onboarding:** o Melhor Idade tem onboarding obrigatório (`mi_perfis.onboarding_complete`). Para Medicina Preventiva recomendo **não** ter onboarding na v1 — o paciente entra direto na Home. Menos tela, menos atrito.

### 2.1 Decisões confirmadas

| Tema | Decisão |
|---|---|
| Acesso da funcionária | **Criar o papel novo `parceiro_operador`** (não reaproveitar `parceiro_admin`) — ver 6.1 |
| Cadastro de sintomas | **Por clínica**: `mp_sintomas_catalogo` tem `parceiro_id`; cada parceiro monta a própria lista |
| Quem cria consulta | **Somente a clínica.** O paciente é read-only nas consultas: visualiza, não cria/edita/cancela |
| Alerta de consulta | O **Início do paciente** mostra card fixo da **próxima consulta** (data/hora, profissional, local) + notificação quando a clínica agenda/remarca/cancela |
| Exames | **A clínica também lança exames** (solicita/agenda e anexa laudo), igual à agenda; o paciente também pode anexar os dele |
| WhatsApp | **Um número por unidade** da clínica → tabela `mp_unidades`; o paciente é vinculado a uma unidade |
| Tipos da rotina | **Tipos preventivos** (medicação, exercício, hidratação, medir pressão/glicemia, jejum pré-exame…), não os do Melhor Idade |

---

## 3. Estrutura do módulo (paciente)

Rota base `/medicina-preventiva`, menu:

| Menu | Rota | Origem do código |
|---|---|---|
| Início | `/medicina-preventiva` | novo `HomePage`: **card de alerta da próxima consulta** em destaque, exames pendentes, rotina de hoje, botão "registrar sintoma" |
| Minha rotina | `/medicina-preventiva/minha-rotina` | cópia de `CuidadoPage` → `mp_rotina` |
| Receitas e consultas | `/medicina-preventiva/receitas-consultas` | cópia de `ReceitasPage` → `mp_receitas` (CRUD do paciente) + `mp_consultas` (**somente leitura** — agenda da clínica, com calendário) |
| Exames e laudos | `/medicina-preventiva/exames-laudos` | derivado de `ReceitasPage`, campos de exame → `mp_exames` |
| Registro de sintomas | `/medicina-preventiva/sintomas` | tela nova → `mp_registros_sintomas` |
| Meu perfil | `/medicina-preventiva/perfil` | reaproveita `PerfilPage` (ou versão reduzida) |

---

## 4. Banco de dados — migrations novas

Arquivos sugeridos em `supabase/migrations/`, seguindo a numeração atual (última é `008`).

### `009_medicina_preventiva_core.sql`
Helpers + tabelas do paciente.

```
-- helper: parceiro do usuário logado (role IN ('parceiro_admin','parceiro_operador'))
mp_parceiro_do_usuario() RETURNS UUID
-- helper: o titular pertence ao parceiro do usuário logado?
mp_parceiro_pode_acessar(p_titular_id UUID) RETURNS BOOLEAN
-- helper: reaproveita mi_user_titular_ids() para o lado paciente
mp_can_access(p_titular_id, p_auth_id) -- = mi_can_access OR mp_parceiro_pode_acessar
```

Tabelas:

- **`mp_rotina`** — estrutura de `mi_cuidados`, **tipos próprios**: `titular_id, auth_id, hora, titulo, descricao, periodo (manha|tarde|noite), responsavel, feito, created_at` + `tipo TEXT CHECK (tipo IN ('medicacao','exercicio','hidratacao','medicao','alimentacao','jejum','outro'))` + `valor_alvo TEXT` (ex.: "2 L", "120/80", "8 mil passos") e `unidade_medida TEXT`. Ícones novos no front (Pill, Activity, Droplet, HeartPulse, Utensils, Clock).
- **`mp_receitas`** — igual a `mi_receitas` (já com `ativa` e `observacoes`, que no `mi_` vieram só na migration 004).
- **`mp_consultas`** — `mi_consultas` + campos de agenda:
  `data_hora TIMESTAMPTZ`, `profissional TEXT`, `especialidade TEXT`, `local TEXT`, `tipo TEXT (presencial|online|retorno)`, `observacoes TEXT`,
  `origem TEXT CHECK (origem IN ('paciente','clinica')) DEFAULT 'paciente'`,
  `status TEXT CHECK (status IN ('agendada','confirmada','realizada','cancelada','faltou')) DEFAULT 'agendada'`,
  `parceiro_id UUID REFERENCES parceiros(id)`, `criado_por UUID REFERENCES auth.users(id)`.
  > Atenção: hoje `mi_consultas.data` é **TEXT em formato BR** (`dd/mm/aaaa`). Na tabela nova usar `TIMESTAMPTZ` — a agenda da clínica precisa de hora e de ordenação real.
- **`mp_exames`** — `titular_id, auth_id, nome_exame, tipo (laboratorial|imagem|outro), medico_solicitante, especialidade, laboratorio, data_solicitacao DATE, data_realizacao DATE, status (solicitado|agendado|realizado|resultado_disponivel), resultado_resumo TEXT, observacoes TEXT, arquivos JSONB (lista {url, nome, mime}), created_at`
  **+ campos de origem clínica** (mesmo esquema da agenda): `origem ('paciente'|'clinica')`, `parceiro_id`, `unidade_id`, `criado_por`, `data_hora_agendada TIMESTAMPTZ`.
  RLS: paciente pode inserir/editar **os seus** (`origem='paciente'`) e anexar arquivo nos da clínica; a clínica pode tudo dos pacientes do seu parceiro.
- **`mp_notificacoes`** — cópia de `mi_notificacoes` com CHECK ampliado: `('consulta','exame','sintoma','receita','rotina','sistema')`.

RLS: mesmo bloco `DO $ ... FOREACH t IN ARRAY [...]` do `001`, trocando `mi_can_access` por `mp_can_access`, e no INSERT permitindo **também** o parceiro (`auth_id = auth.uid() OR mp_parceiro_pode_acessar(titular_id)`).

> **`mp_consultas` é a exceção:** como só a clínica agenda, as policies de INSERT/UPDATE/DELETE dessa tabela exigem `mp_parceiro_pode_acessar(titular_id)` — o paciente tem **apenas SELECT**. Isso trava a regra no banco, não só na tela.

### `010_medicina_preventiva_parceiro.sql`
Lado da clínica.

- **`mp_unidades`** — `id, parceiro_id, nome, whatsapp_numero TEXT, telefone, endereco, ativo BOOLEAN, ordem INT`. **É aqui que mora o número do WhatsApp** (um por unidade).
- **`mp_paciente_unidade`** — `titular_id UNIQUE, parceiro_id, unidade_id`. Define a unidade de referência do paciente (usada pelo botão de WhatsApp e como padrão ao agendar). Se o paciente não tiver vínculo, cai na unidade marcada como padrão do parceiro.
- **`mp_parceiro_config`** — `parceiro_id UNIQUE, whatsapp_mensagem_padrao TEXT, unidade_padrao_id, updated_at` (config geral do parceiro; o número ficou na unidade).
- **`mp_sintomas_catalogo`** — `id, parceiro_id, nome, descricao, categoria, gravidade_padrao (baixa|media|alta), ativo BOOLEAN, ordem INT`. É o "cadastro de sintomas" do admin parceiro.
- **`mp_registros_sintomas`** — `id, titular_id, auth_id, parceiro_id, sintomas JSONB (lista {id, nome}), intensidade TEXT, observacao TEXT, foto_url TEXT, status (novo|em_analise|respondido|arquivado) DEFAULT 'novo', whatsapp_enviado BOOLEAN DEFAULT false, created_at`.
- **`parceiro_notificacoes`** — `id, parceiro_id, titular_id, tipo (sintoma|consulta|sistema), titulo, descricao, link, referencia_id, lida, created_at`.

RLS: SELECT/UPDATE para `parceiro_admin` do mesmo `parceiro_id`; INSERT em `mp_registros_sintomas` pelo paciente (`auth_id = auth.uid()`); `mp_sintomas_catalogo` legível pelo paciente do parceiro (precisa ler para preencher o formulário).

> Trigger recomendado: `AFTER INSERT ON mp_registros_sintomas` → insere em `parceiro_notificacoes`. Fazer no banco evita depender do cliente (e do RLS do cliente) para criar a notificação da clínica.

### `011_medicina_preventiva_seed.sql`
- `INSERT INTO modulos (nome, ativo) VALUES ('Medicina Preventiva', true)`.
- Sugestão de catálogo inicial de sintomas (febre, dor de cabeça, tontura, falta de ar, dor no peito, náusea, tosse, dor abdominal…) — inserir por parceiro no primeiro acesso ou deixar botão "carregar lista sugerida" na tela de cadastro.

---

## 5. Frontend — módulo do paciente

Arquivos novos em `src/modules/medicina-preventiva/`:

```
components/MpLayout.tsx          (cópia de MelhorIdadeLayout, sem onboarding gate)
components/MpBottomNav.tsx       (NAV_ITEMS: Início, Rotina, Receitas/Consultas, Exames, Sintomas)
components/MpNotificacoesBell.tsx
context/MedicinaPreventivaContext.tsx
lib/storage.ts                   (MP_EXAMES_FOLDER, MP_SINTOMAS_FOLDER)
pages/HomePage.tsx
pages/RotinaPage.tsx             (de CuidadoPage)
pages/ReceitasConsultasPage.tsx  (de ReceitasPage)
pages/ExamesPage.tsx             (de ReceitasPage, campos de exame)
pages/SintomasPage.tsx           (nova)
services/mpScope.ts              (clone de miScope + parceiro_id do titular)
services/rotinaService.ts
services/receitasConsultasService.ts
services/examesService.ts
services/sintomasService.ts
services/notificacoesService.ts
types/index.ts
```

Alterações em arquivos existentes:
- [App.tsx](../src/App.tsx): lazy imports + bloco `<Route path="/medicina-preventiva" element={<MpLayout/>}>` com as 6 rotas filhas.
- [selecao-modulos/page.tsx](../src/pages/legado-app/selecao-modulos/page.tsx): em `direcionarParaModulo`, `if (n.includes("preventiva")) navigate("/medicina-preventiva")`; e o card precisa de ícone/cor própria (hoje há um `if/else` por nome).
- [PrivateRoute.tsx](../src/components/PrivateRoute.tsx): incluir `/medicina-preventiva` nas regras de path por role (hoje há checagens explícitas por prefixo de rota).

### Consultas no lado do paciente (read-only)
- `ReceitasConsultasPage` mostra a aba **Consultas** sem botão "nova consulta" — lista + calendário ([MiConsultasCalendario](../src/modules/melhor-idade/components/MiConsultasCalendario.tsx) reaproveitado), com status e badge "agendado pela clínica".
- **Card de alerta no Início:** `proximaConsulta()` = primeira linha de `mp_consultas` com `data_hora >= now()` e `status IN ('agendada','confirmada')`, ordenada asc. Card destacado com contagem ("faltam 3 dias"), profissional, local e botão "ver detalhes". Se não houver, card neutro ("nenhuma consulta agendada").
- Toda vez que a clínica **agenda, remarca ou cancela**, entra uma linha em `mp_notificacoes` (tipo `consulta`) → sino do paciente.

### Tela "Registro de sintomas" (detalhe do fluxo pedido)
1. Chips multi-seleção com os sintomas de `mp_sintomas_catalogo` do parceiro do paciente (+ campo "outro").
2. Campo **Observação** (textarea).
3. Campo **Foto** (upload opcional, 1 imagem — mesmo padrão de upload da receita).
4. **Salvar** → insere em `mp_registros_sintomas` → trigger gera a notificação no painel do parceiro.
5. **Depois de salvo**, aparece o botão **"Enviar para a clínica pelo WhatsApp"**:
   - resolve a unidade do paciente (`mp_paciente_unidade` → fallback `mp_parceiro_config.unidade_padrao_id`) e lê `mp_unidades.whatsapp_numero`;
   - monta `https://wa.me/55<numero>?text=<encodeURIComponent(texto)>` com nome do paciente, data/hora, sintomas, observação e link público da foto;
   - marca `whatsapp_enviado = true`;
   - grava `unidade_id` no registro do sintoma (a clínica precisa saber para qual unidade foi);
   - se a unidade não tiver número, botão desabilitado com aviso ("a clínica ainda não cadastrou o WhatsApp").

---

## 6. Frontend — painel do admin parceiro

Alterações em [ParceiroLayout.tsx](../src/admin-parceiro/ParceiroLayout.tsx): `menuItems` ganha 4 entradas + sino de notificações no header (contador de `parceiro_notificacoes` não lidas).

| Menu | Rota | Tela |
|---|---|---|
| Agenda / Consultas | `/admin-parceiro/agenda` | `AgendaParceiroPage.tsx` — lista + calendário, filtro por paciente/status/período, criar consulta (selecionar paciente da carteira, data/hora, profissional, especialidade, local, tipo, observação), editar, cancelar, marcar realizada |
| Sintomas recebidos | `/admin-parceiro/sintomas` | `SintomasRecebidosPage.tsx` — inbox: paciente, data, sintomas, observação, foto (lightbox), mudar status, atalho WhatsApp para o paciente |
| Cadastro de sintomas | `/admin-parceiro/sintomas/catalogo` | `CatalogoSintomasPage.tsx` — CRUD de `mp_sintomas_catalogo`, ativar/desativar, ordenar |
| Exames | `/admin-parceiro/exames` | `ExamesParceiroPage.tsx` — solicitar/agendar exame para o paciente, anexar laudo, mudar status |
| Unidades | `/admin-parceiro/unidades` | `UnidadesPage.tsx` — CRUD de `mp_unidades` (nome, WhatsApp, endereço), definir unidade padrão (só `parceiro_admin`) |
| Configurações | `/admin-parceiro/configuracoes` | `ConfiguracoesParceiroPage.tsx` — WhatsApp da clínica e mensagem padrão (só `parceiro_admin`) |
| Equipe | `/admin-parceiro/equipe` | `EquipeParceiroPage.tsx` — cadastrar/inativar operadoras (só `parceiro_admin`) |

Rotas correspondentes em [App.tsx:82-85](../src/App.tsx), dentro do `<Route path="/admin-parceiro" element={<ParceiroLayout />}>`.

Serviços novos em `src/admin-parceiro/services/`: `agendaParceiroService.ts`, `sintomasParceiroService.ts`, `catalogoSintomasService.ts`, `configParceiroService.ts` — todos filtrando por `parceiro_id` vindo do `useOutletContext().userProfile`.

Quando a funcionária salva a consulta: insere em `mp_consultas` (`origem='clinica'`, `parceiro_id`, `criado_por`) **e** em `mp_notificacoes` do paciente ("Nova consulta agendada pela clínica"). O paciente vê a mesma linha em Receitas e consultas — sem duplicação de dado.

### 6.1 Novo papel `parceiro_operador`

A funcionária entra com papel próprio, com acesso reduzido. O que muda:

**Banco**
- `usuarios_app.role` passa a aceitar `parceiro_operador` (se houver CHECK na coluna, alterar; se for TEXT livre, só documentar).
- Registro da operadora: `auth_id`, `parceiro_id`, `role='parceiro_operador'`, `titular_id = NULL`, `status='ativo'`.
- Helper `mp_parceiro_do_usuario()` considera `role IN ('parceiro_admin','parceiro_operador')` — os dois papéis leem/escrevem agenda e sintomas do próprio parceiro.

**Front — arquivos a alterar**

| Arquivo | Mudança |
|---|---|
| [PrivateRoute.tsx:7](../src/components/PrivateRoute.tsx) | union `UserProfile.role` ganha `"parceiro_operador"` |
| [PrivateRoute.tsx:150](../src/components/PrivateRoute.tsx) | guarda de `/admin-parceiro` passa a aceitar os dois papéis de parceiro |
| [PrivateRoute.tsx:185](../src/components/PrivateRoute.tsx) | redirecionamento pós-login do parceiro idem |
| [PrivateRoute.tsx:30](../src/components/PrivateRoute.tsx) | `resolverIdentidadeLogin` — operadora também exibe o nome do parceiro |
| [PrivateRoute.tsx:176](../src/components/PrivateRoute.tsx) | `isAdminModuloPreview` inclui `/medicina-preventiva` |
| [ParceiroLayout.tsx](../src/admin-parceiro/ParceiroLayout.tsx) | `menuItems` filtrado por papel (matriz abaixo); badge do header mostra "Operador" quando for o caso |
| [selecao-modulos/page.tsx](../src/pages/legado-app/selecao-modulos/page.tsx) | `isParceiroPreview` considera os dois papéis |

**Matriz de permissão do painel**

| Tela | `parceiro_admin` | `parceiro_operador` |
|---|---|---|
| Meus Clientes | criar / editar / módulos | **só leitura** (precisa ver a carteira para agendar) |
| Agenda / Consultas | total | total |
| Sintomas recebidos | total | total |
| Cadastro de sintomas | total | leitura |
| Exames | total | total |
| Configurações / Unidades (WhatsApp) | total | leitura |
| Equipe (operadoras) | total | — |

**Cadastro da operadora:** seguir o padrão de [NovoTitularDialog.tsx:56](../src/admin-parceiro/NovoTitularDialog.tsx) — `supabase.auth.signUp` no front e **restaurar a sessão do admin** com `setSession` no `finally` (o `signUp` troca a sessão ativa), depois inserir o vínculo em `usuarios_app`. Sem `service_role` no front é o caminho possível hoje; se quiser algo mais limpo depois, vira Edge Function com `admin.createUser`.

---

## 7. Pontos de atenção / riscos

1. **RLS é o item mais delicado.** Hoje nenhuma policy `mi_*` prevê parceiro. As policies novas precisam ser testadas com 3 usuários (titular, familiar, parceiro_admin) antes de subir — um erro aqui vaza dado clínico entre clínicas.
2. **O papel `parceiro_operador` toca o PrivateRoute inteiro.** As checagens de rota são strings hardcoded por papel; esquecer um dos pontos da tabela 6.1 derruba o login da operadora ou libera rota indevida. Testar login das duas contas de parceiro depois da mudança.
3. **Upload de laudo.** [uploadImagem](../src/lib/uploadImage.ts) comprime para 512px e força JPG — inutiliza laudo/PDF. Exames precisam de um `uploadArquivo` novo (aceitar PDF, limite ~10 MB, sem compressão) e provavelmente bucket/pasta próprios com leitura restrita (o bucket `mi-midias` é **público**; laudo em bucket público é exposição de dado de saúde — recomendo bucket privado + signed URL).
4. **Foto do sintoma** também pode conter dado sensível → mesma recomendação de bucket privado.
5. **Data como TEXT** em `mi_consultas` é um débito existente; na tabela nova já nascer `TIMESTAMPTZ` evita repetir o problema (mas exige converter os helpers de [consultaDates.ts](../src/modules/melhor-idade/lib/consultaDates.ts)).
6. **Notificação é polling in-app**, não push. Se a clínica precisar de aviso em tempo real, usar Supabase Realtime na tabela `parceiro_notificacoes` (barato de ligar) — ou aceitar o refresh ao abrir o painel.
7. **LGPD:** sintomas + foto + laudo são dado de saúde. Vale registrar consentimento no primeiro acesso ao módulo e revisar o [RLS_CHECKLIST.md](RLS_CHECKLIST.md) com as tabelas `mp_*`.

---

## 8. Ordem de execução sugerida

| Fase | Entrega | Depende de |
|---|---|---|
| 0 | Papel `parceiro_operador`: banco + PrivateRoute + menu por papel + tela Equipe (ver 6.1) | — |
| 1 | Migrations `009`/`010`/`011` + seed do módulo + policies testadas (incl. `mp_consultas` read-only p/ paciente) | 0 |
| 2 | Shell do módulo paciente: layout, nav, rotas, Home, `mpScope` | 1 |
| 3 | Minha rotina (`mp_rotina`) — cópia direta, menor risco | 2 |
| 4 | Receitas e consultas (`mp_receitas` CRUD + `mp_consultas` leitura) + card de próxima consulta no Início | 2 |
| 5 | Exames e laudos (paciente) + `uploadArquivo` (PDF/bucket privado) | 2, 4 |
| 6 | Painel parceiro: Unidades (WhatsApp) + Cadastro de sintomas | 1 |
| 7 | Registro de sintomas (paciente) + botão WhatsApp + trigger de notificação | 5, 6 |
| 8 | Inbox de sintomas no painel + sino de notificações do parceiro | 7 |
| 9 | Agenda no painel (criar/gerenciar consultas) + notificação para o paciente | 4 |
| 10 | Exames pelo painel da clínica (solicitar/agendar/anexar laudo) + notificação | 5, 9 |
| 11 | Habilitar módulo para o parceiro/titulares piloto + testes ponta a ponta | todas |

---

## 9. Decisões

### Fechadas
1. **Papel da funcionária:** papel novo `parceiro_operador`. ✔
2. **Cadastro de sintomas:** por clínica (`parceiro_id` no catálogo). ✔
3. **Quem cria consulta:** só a clínica; paciente visualiza e recebe alerta da próxima consulta no Início. ✔
4. **Exames:** a clínica também lança (solicita, agenda, anexa laudo) — o paciente igualmente pode cadastrar os seus. ✔
5. **WhatsApp:** um número **por unidade** (`mp_unidades`), com o paciente vinculado a uma unidade. ✔
6. **Rotina preventiva:** tipos próprios (medicação, exercício, hidratação, medição, alimentação, jejum). ✔

### Em aberto
- Nada bloqueando. Detalhes que dá para resolver na implementação: lista inicial de sintomas sugeridos por clínica, e se o paciente pode trocar de unidade sozinho (proposta: não, só a clínica).
