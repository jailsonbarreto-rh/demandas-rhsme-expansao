# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-22 — Ciclo 4 concluído em banco, GitHub e Production**

## Estado final

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| PR do Ciclo 4 | `#41` — mesclado |
| Merge | `91c18b4ce6ff99ac1bf8c7e803e1b917fb718e91` |
| Commit operacional de Production | `f7af6cbc4df61495bb2519e60ed9dcf227a4ae70` |
| Commit de restauração do bloqueio | `4b8ba28c46dd6a22a990a75b3e65573601b30d7c` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Deployment do Ciclo 4 | `dpl_7UirrHm6KwzqpvSH3KFevXmvnrtk` — `READY` |
| Bloqueio automático | restaurado |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, saudável |
| Migrations do Ciclo 4 | aplicadas, homologadas e alinhadas ao histórico remoto |
| Próximo ciclo | Ciclo 5 autorizado |

O domínio principal responde HTTP 200 e serve o frontend do Ciclo 4. O banco preserva 379 demandas, 385 históricos e 5 perfis; nenhum registro de homologação permaneceu.

## Ciclo 4 — entrega

### Operações auditáveis

Foram criadas RPCs nomeadas para:

- `criar_sme_demanda_v2`;
- `editar_sme_demanda`;
- `registrar_andamento_sme_demanda`;
- `transicionar_status_sme_demanda`;
- `excluir_sme_demanda`;
- `restaurar_sme_demanda`;
- `listar_perfis_minimos`.

Todas as mutações:

- validam o papel do usuário no banco;
- obtêm autoria por `auth.uid()`;
- bloqueiam a demanda com `FOR UPDATE`;
- atualizam demanda e histórico na mesma transação;
- registram o tipo do evento e os campos efetivamente alterados;
- não dependem de actor id informado pelo navegador.

### Experiência do usuário

- demanda ativa exige próxima ação e data de acompanhamento;
- edição exige justificativa;
- andamento pode ser registrado sem inventar uma troca de status;
- transição para o mesmo status é recusada e orienta o uso de andamento;
- encerramento limpa próxima ação e data;
- exclusão exige motivo e apenas oculta logicamente o registro;
- restauração exige motivo e preserva a trilha;
- busca, filtros, URL, Excel, Realtime, acessibilidade e responsividade foram preservados.

### Exclusão lógica e segurança

A exclusão física deixou de ser uma rota operacional:

- `UPDATE` direto nos campos operacionais foi revogado de `authenticated`;
- `DELETE` direto foi revogado de `authenticated`;
- a política `editores atualizam demandas` foi removida;
- a política `administradores ativos excluem demandas` foi removida;
- exclusão e restauração ocorrem somente pelas RPCs auditáveis;
- leitores continuam sem permissão de mutação.

As APIs v1 permanecem disponíveis temporariamente apenas para compatibilidade, conforme o Plano Mestre. Novos fluxos usam os contratos v2.

## Migrations versionadas

```text
supabase/migrations/20260722123530_cycle4_helpers_and_create_v2.sql
supabase/migrations/20260722123627_cycle4_edit_demand.sql
supabase/migrations/20260722123713_cycle4_progress_and_status.sql
supabase/migrations/20260722123920_cycle4_admin_restore_and_grants.sql
supabase/migrations/20260722123935_cycle4_block_direct_writes.sql
```

Os prefixos correspondem às versões registradas pelo Supabase remoto. A migration originalmente combinada foi dividida sem alterar seu conteúdo funcional, eliminando drift entre repositório e banco.

## Evidências finais

### Aplicação

- instalação pelo lockfile: PASS;
- auditoria de vulnerabilidades: PASS;
- assinaturas e proveniência: PASS;
- lint: PASS;
- 221 testes unitários e de integração: PASS;
- build e orçamento do bundle: PASS;
- Playwright desktop/mobile: PASS;
- Preview do SHA final: `READY`, HTTP 200.

### Supabase efêmero

- migrations anteriores aplicadas: PASS;
- usuários sintéticos inseridos: PASS;
- cinco migrations do Ciclo 4 aplicadas: PASS;
- editor cria, edita, registra andamento e transiciona: PASS;
- editor não exclui nem restaura: PASS;
- administrador exclui e restaura: PASS;
- autoria por `auth.uid()`: PASS;
- rollback da mutação quando o histórico falha: PASS;
- concorrência simples: PASS;
- `UPDATE` e `DELETE` diretos recusados: PASS;
- replay completo da cadeia do zero: PASS;
- ambiente destruído: PASS.

### Produção

| Invariante | Resultado |
|---|---:|
| Demandas | 379 |
| Históricos | 385 |
| Perfis | 5 |
| Duplicidades | 0 |
| Históricos órfãos | 0 |
| Exclusões lógicas preexistentes | 0 |
| RPCs do Ciclo 4 | 7 |
| Privilégio direto de `UPDATE` | não |
| Privilégio direto de `DELETE` | não |
| Políticas físicas antigas | ausentes |

O smoke transacional em produção executou criação, edição, andamento, transição, exclusão e restauração. Confirmou autoria, sequência de eventos e bloqueio das escritas diretas. O `ROLLBACK` deixou zero registros de teste e preservou as contagens 379/385/5.

## Advisories

O linter do Supabase informa que as RPCs `SECURITY DEFINER` são executáveis por `authenticated`. Isso é intencional: as funções possuem `search_path` vazio, grants explícitos e validação interna de perfil ativo, editor ou administrador.

Permanecem avisos anteriores, não criados pelo Ciclo 4:

- tabelas privadas de importação com RLS e sem políticas, porque não são acessíveis pelos papéis do aplicativo;
- proteção contra senhas vazadas desativada no Supabase Auth.

## Rollback

Em incidente de frontend:

- manter RPCs, schema e histórico;
- reverter para o deployment estável do Ciclo 3;
- não reabrir escrita direta;
- não apagar eventos de auditoria.

Em incidente de banco, corrigir somente por nova migration versionada.

## Próximo ciclo autorizado

**Ciclo 5 — Responsável vinculado ao login e Minhas demandas.**

Objetivo: substituir a dependência de texto livre por identidade de perfil, preservando responsáveis externos e históricos. O ciclo deverá implementar:

- seleção explícita entre responsável interno, externo e não atribuído;
- carteira “Minhas demandas” baseada em UUID;
- filtro por responsável com URL compartilhável;
- relatório de mapeamento do legado;
- aplicação somente de correspondências aprovadas, nunca de sugestões automáticas ambíguas.

## Histórico resumido

- **Ciclo 0:** contexto, decisões e linha de base;
- **Ciclo 1:** retirada dos dados reais do bundle público;
- **Ciclo 2:** semântica única e filtros tipados;
- **Ciclo 3:** expansão aditiva do modelo e aplicação segura;
- **Ciclo 4:** mutações auditáveis, autoria, andamento, exclusão lógica e bloqueio de escritas diretas.
