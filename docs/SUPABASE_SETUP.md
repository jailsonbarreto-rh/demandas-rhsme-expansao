# Supabase e operação multiusuário

**Atualizado em:** 26 de julho de 2026  
**Estado:** vigente após as migrations auditáveis, o R3 e a reconciliação documental do E0.

O projeto Supabase da Central de Demandas é o **CTRH PROCESSOS**, ref `kdhekkzwcokfrpcrsllr`, na região `sa-east-1`.

A aplicação mantém dois modos:

- `supabase`: persistência compartilhada, autenticação real, RLS e Realtime;
- `local`: desenvolvimento e testes com dados sintéticos; recusado quando `PROD=true`.

## 1. Fonte de verdade e autoridade documental

Supabase é a fonte de verdade dos dados operacionais em produção.

Regras de produto não devem ser inferidas apenas do schema ou de uma migration histórica. Consulte a ordem completa em `AGENTS.md` e, para esta matéria:

1. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
2. `docs/PRODUCT_CONTEXT.md`;
3. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`;
4. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
5. `docs/HANDOFF.md`.

Toda alteração de schema, RPC, RLS, Auth ou Realtime deve cumprir a `POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`.

## 2. Migrations

A cadeia versionada está em `supabase/migrations/` e deve ser aplicada exclusivamente pelos arquivos do repositório, na ordem dos prefixos.

Os marcos principais atualmente aplicados são:

1. criação de perfis, demandas, histórico, RLS, Realtime e RPCs iniciais;
2. revogação de execução anônima e índices de chaves estrangeiras;
3. importação e auditoria do legado;
4. expansão aditiva do modelo com prazos semânticos, próxima ação, origem, exclusão lógica e eventos estruturados;
5. RPCs auditáveis de criação, edição, andamento, transição, exclusão e restauração;
6. grants e contratos administrativos necessários;
7. R3 de responsáveis oficiais por UUID e coerência UUID–nome.

### 2.1 Divergência histórica reconhecida

O histórico remoto contém duas versões temporárias de `pg_net` sem arquivo homônimo na árvore Git:

```text
20260723231805_enable_pg_net_for_r3_user_provisioning
20260723232308_remove_pg_net_after_r3_user_provisioning
```

O Pacote E0 apenas registra a divergência. A reconstrução fiel dos arquivos pertence ao E1A e não foi executada. Nenhum novo pacote que crie migration deve começar antes da reconciliação, e os registros remotos não devem ser reescritos ou reaplicados por inferência.

Não mantenha neste documento uma lista manual considerada mais autoritativa que o próprio diretório. Antes de qualquer migration, confirme os arquivos existentes, o histórico remoto e o estado de `main`.

Para um projeto novo:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

## 3. Estado atual do domínio

### 3.1 Demandas

`public.sme_demandas` inclui, entre outros:

- número, tipo, assunto e classificação;
- `responsavel_id` e snapshot textual `responsavel`;
- prazo interno e final com situação e justificativa;
- próxima ação e data de acompanhamento;
- status e setor;
- link e origem;
- autoria e timestamps;
- metadados de exclusão lógica.

### 3.2 Histórico

`public.sme_historico` preserva:

- demanda;
- tipo de evento;
- status anterior e resultante;
- setor;
- comentário ou justificativa;
- alterações estruturadas antes/depois;
- autoria e data.

Tipos oficiais:

```text
criacao
andamento
mudanca_status
edicao
reatribuicao
alteracao_prazo
exclusao
restauracao
```

### 3.3 Responsabilidade após o R3

A regra vigente é:

- `responsavel_id` identifica oficialmente o responsável;
- o nome é derivado do perfil no servidor;
- nova demanda ou reatribuição seleciona usuário cadastrado por UUID;
- sem responsável é permitido com UUID nulo e texto vazio;
- responsável externo e nome livre não são opções atuais;
- texto legado sem UUID pode ser preservado sem virar opção futura;
- `Vanessa Migrado` permanece como exceção histórica conhecida;
- carteira pessoal usa somente igualdade de UUID.

A função `listar_perfis_minimos()` fornece os perfis disponíveis à interface conforme o contrato vigente. RPCs e gatilho impedem divergência entre UUID e nome.

## 4. RPCs operacionais vigentes

O frontend atual utiliza ou possui contratos para:

- `criar_sme_demanda_v2`;
- `editar_sme_demanda`;
- `registrar_andamento_sme_demanda`;
- `transicionar_status_sme_demanda`;
- `excluir_sme_demanda`;
- `restaurar_sme_demanda`;
- `listar_perfis_minimos`.

As RPCs obtêm autoria por `auth.uid()`, validam papel no banco e gravam mutação e evento na mesma transação.

As RPCs v1 permanecem temporariamente disponíveis apenas por compatibilidade e somente poderão ser revogadas no R12 após homologação integral.

## 5. RLS e papéis

- usuário ativo consulta demandas e histórico;
- administrador e editor executam mutações operacionais autorizadas;
- somente administrador exclui logicamente e restaura;
- leitor não executa mutações;
- perfil pendente ou inativo não acessa dados operacionais;
- `anon` não consulta tabelas nem executa RPCs operacionais;
- inserções e atualizações diretas não substituem RPCs;
- o último administrador ativo não pode ser removido ou rebaixado.

Uma interface pode ocultar ação, mas a segurança real deve continuar no banco.

## 6. Fotografia reconciliada de Production

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas vinculadas por UUID | 378 |
| Informação histórica sem UUID | 1 |
| Históricos | 764 |
| Perfis | 13 |
| Divergências UUID–nome | 0 |
| Links de origem cadastrados | 0 |

Eventos conhecidos:

| Tipo | Quantidade |
|---|---:|
| criação | 379 |
| reatribuição | 378 |
| mudança de status | 7 |
| andamento | 0 |
| edição | 0 |
| alteração de prazo | 0 |
| exclusão | 0 |
| restauração | 0 |

Essas contagens são fotografia de 25/07/2026, não constantes de aplicação. Toda operação futura deve consultar novamente o banco.

## 7. Pendências estruturais reconhecidas

Antes de ampliar R4 e R5, permanecem para debate e execução controlada:

- validação formal das cinco constraints `NOT VALID`;
- concorrência otimista por versão esperada;
- alinhamento de limites entre banco e Zod;
- definição do contrato de `link_origem`;
- paginação real no servidor;
- histórico sob demanda;
- redução de recargas integrais após RPC e Realtime;
- E2E contra Supabase real ou efêmero por papel.

Essas pendências não autorizam mudança automática. Seguem a governança do R1 e R2.

## 8. Dados e segurança operacional

- dados reais não entram em `src`, fixtures públicas, logs, screenshots ou artefatos;
- chaves secretas e `service_role` não entram no Vite;
- scripts de bootstrap ficam fora do grafo do cliente;
- modo local usa somente dados sintéticos;
- migrations materiais exigem backup legível e invariantes;
- rollback de frontend não apaga colunas ou eventos válidos;
- correção de banco ocorre por nova migration versionada, nunca por edição manual não registrada.

## 9. Integração Vercel

Variáveis públicas aceitas:

```dotenv
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Também podem existir equivalentes públicos compatíveis com a integração de hospedagem. Configuração parcial deve produzir erro controlado. Produção nunca aceita modo local.

## 10. Verificação

Depois de alteração consolidada:

```bash
npm ci
npm run check:docs
npm run check:full
```

Para mudança de banco, execute também:

- replay integral das migrations em ambiente seguro;
- consultas de invariantes e contagens;
- testes de papéis e chamadas diretas;
- verificação de RLS e grants;
- smoke de Realtime;
- atualização dos tipos gerados;
- atualização de Handoff, plano, Product Context e documentação afetada.

No deployment, confirmar login real, carregamento remoto, ações por papel, persistência, Realtime e ausência de dados administrativos no bundle.
