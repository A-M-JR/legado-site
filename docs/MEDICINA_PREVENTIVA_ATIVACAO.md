# Medicina Preventiva — o que foi entregue e como ativar

> Implementação completa do plano em [PLANO_MEDICINA_PREVENTIVA.md](PLANO_MEDICINA_PREVENTIVA.md).
> `npm run build` e `npm test` passando.

---

## 1. Ativação (nesta ordem)

### 1.1 Rodar as migrations
```bash
npm run db:migrate
```
Precisa de `SUPABASE_DB_PASSWORD` no `.env`. Ou cole no SQL Editor do Supabase, em ordem:

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/009_parceiro_operador.sql` | papel `parceiro_operador`, colunas `nome`/`email` em `usuarios_app`, helpers `mp_parceiro_do_usuario`, `mp_parceiro_do_contexto`, `mp_parceiro_pode_acessar`, `mp_can_access` |
| `supabase/migrations/010_medicina_preventiva_core.sql` | `mp_rotina`, `mp_receitas`, `mp_consultas`, `mp_exames`, `mp_notificacoes` + RLS (consulta é read-only para o paciente) |
| `supabase/migrations/011_medicina_preventiva_parceiro.sql` | `mp_unidades`, `mp_parceiro_config`, `mp_paciente_unidade`, `mp_sintomas_catalogo`, `mp_registros_sintomas`, `parceiro_notificacoes` + triggers de notificação |
| `supabase/migrations/012_medicina_preventiva_storage_seed.sql` | bucket privado `mp-arquivos`, módulo “Medicina Preventiva” no catálogo, função `mp_seed_sintomas` |
| `supabase/migrations/014_medicina_preventiva_lembretes.sql` | config de lembrete em `mp_parceiro_config`, tabela `mp_consulta_lembretes`, funções `mp_gerar_lembretes_consultas` / `mp_gerar_lembretes_do_parceiro` e o job `mp_lembretes_consulta` no pg_cron |

### 1.2 Liberar o módulo
1. **Admin master** → Parceiros → Gerenciar módulos: marcar *Medicina Preventiva* para a clínica.
2. **Painel do parceiro** → Meus Clientes → Gerenciar módulos do titular: marcar o módulo para cada paciente.
   (Pacientes novos herdam automaticamente os módulos do parceiro.)

### 1.3 Configurar a clínica (painel do parceiro, como `parceiro_admin`)
1. **Unidades e WhatsApp** → cadastrar ao menos uma unidade com número. Sem isso o botão de WhatsApp fica desativado no app.
2. Definir a **unidade padrão** e, se quiser, vincular cada paciente a uma unidade (na mesma tela).
3. **Cadastro de sintomas** → botão *Lista sugerida* carrega 16 sintomas comuns; depois é só ajustar.
4. **Equipe** → criar as operadoras (`parceiro_operador`).
5. **Lembretes** → escolher de quantos dias antes o paciente é avisado (pode marcar mais de uma antecedência) e a hora do disparo. O padrão é *1 dia antes, às 09:00*.

### 1.4 Habilitar o pg_cron (para o lembrete automático)
Dashboard → Database → Extensions → habilitar **pg_cron**, e rodar a migration 014 de novo.
Sem ele nada quebra: os lembretes passam a ser gerados quando alguém da clínica abre a tela **Lembretes** (ou clica em *Gerar avisos agora*).

---

## 2. O que o paciente vê — `/medicina-preventiva`

| Tela | Rota | Resumo |
|---|---|---|
| Início | `/medicina-preventiva` | card da **próxima consulta** com contagem (“Em 3 dias”), atalhos de rotina/exames/receitas e botão de sintomas |
| Minha rotina | `/minha-rotina` | itens por período com tipos preventivos: medicação, exercício, hidratação, medir sinais, alimentação, jejum pré-exame — com meta e unidade (ex.: 2 L, 120/80) |
| Receitas e consultas | `/receitas-consultas` | aba **Consultas** somente leitura (agenda da clínica, com status) e aba **Receitas** com CRUD + foto |
| Exames e laudos | `/exames-laudos` | exames próprios e os lançados pela clínica; anexo múltiplo de PDF/foto (ou foto na hora pelo celular) em bucket privado, com miniatura e visualizador por link assinado. Cada anexo guarda quem enviou — o paciente só apaga os dele |
| Registro de sintomas | `/sintomas` | chips do catálogo da clínica, intensidade, observação, foto → salva, notifica o painel e libera o botão do WhatsApp da unidade |

O sino do topo mostra as notificações (`mp_notificacoes`) com atualização em tempo real.

---

## 3. O que a clínica vê — `/admin-parceiro`

| Menu | Rota | Quem acessa |
|---|---|---|
| Meus Clientes | `/dashboard` | admin e operadora |
| Agenda | `/agenda` | admin e operadora — criar, editar, remarcar, mudar status e excluir consultas |
| Lembretes | `/lembretes` | admin configura a antecedência e a hora; operadora vê a fila do dia e dispara o WhatsApp em 1 clique |
| Sintomas recebidos | `/sintomas` | admin e operadora — inbox com foto, status e atalho de WhatsApp para o paciente |
| Exames | `/exames` | admin e operadora — solicitar, agendar, preencher o laudo, anexar vários PDFs/imagens (arrastar e soltar, com miniatura e visualizador), liberar resultado e excluir |
| Cadastro de sintomas | `/sintomas/catalogo` | admin edita, operadora só lê |
| Unidades e WhatsApp | `/unidades` | só admin |
| Equipe | `/equipe` | só admin |

Sino no cabeçalho com as notificações de `parceiro_notificacoes` (realtime).

---

## 4. Automações no banco (triggers)

| Gatilho | Efeito |
|---|---|
| Novo registro de sintoma | cria notificação no painel da clínica |
| Consulta criada / remarcada / cancelada | cria notificação para o paciente |
| Exame da clínica criado, agendado ou com resultado liberado | cria notificação para o paciente |
| Job `mp_lembretes_consulta` (pg_cron, de hora em hora) | cria o lembrete de véspera no sino do paciente, na antecedência e na hora que a clínica configurou, sem repetir o mesmo aviso |

---

## 5. Pontos que dependem de você

- **Testar RLS com as três contas** (titular, operadora, admin do parceiro) antes de abrir para os pacientes.
- **Senha da operadora**: é criada pelo painel com senha provisória (o `signUp` roda no navegador e a sessão do admin é restaurada em seguida). Peça troca no primeiro acesso.
- **Bucket `mp-arquivos` é privado**: laudos e fotos de sintoma só abrem por link assinado (1 h; 7 dias no link enviado por WhatsApp).
- Fotos de **receita** continuam no bucket público `titulares` (pasta `mp/receitas`), igual ao Melhor Idade.
