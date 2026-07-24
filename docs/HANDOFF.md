# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **24 de julho de 2026 — navegação das carteiras do R3 em Production**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrsllr` |
| Código funcional publicado | `0173eb946133845b5c6da3604673bf4ac81ddadb` — PR #50 |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Linha de base funcional | Ciclos originais 0 a 4 concluídos; responsáveis oficiais e navegação das carteiras do R3 implementados |
| Atividade atual | **Homologação visual e funcional da nova navegação pelo responsável do produto** |
| Próximo ciclo | Não autorizado até a homologação e nova decisão expressa |

## Identidade oficial dos responsáveis

- `responsavel_id` é a identidade oficial do responsável.
- Novas demandas e edições usam seleção de usuários cadastrados; texto livre não é aceito.
- RPCs e gatilho impedem divergência entre UUID e nome.
- 378 demandas históricas permanecem vinculadas aos perfis oficiais.
- `Vanessa Migrado` permanece preservada como única informação histórica sem UUID.
- Permissões, papéis, status e demais regras de negócio foram preservados.

## Navegação das carteiras publicada

- `/demandas` representa a carteira completa da equipe.
- `/minhas-demandas` representa somente as demandas vinculadas ao UUID do usuário autenticado.
- A navegação principal possui aba permanente `Minhas demandas`.
- O cabeçalho exibe um cartão compacto e destacado para acesso direto à carteira pessoal.
- As duas carteiras possuem cabeçalho contextual e ação visível para alternância direta.
- `Limpar filtros` limpa somente critérios de pesquisa e nunca troca a carteira atual.
- URLs antigas com `escopo=meu` são redirecionadas para `/minhas-demandas`, preservando os demais filtros.
- Os detalhes de demanda preservam a carteira de origem na rota.
- Demandas sem UUID, inclusive `Vanessa Migrado`, não aparecem na carteira pessoal.
- O callout grande e o banner que apresentavam `Minhas demandas` como filtro foram removidos.
- Nenhuma migration, tabela, função ou dado do Supabase foi alterado nesta revisão.

## Fotografia reconciliada de Production

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas vinculadas a perfil oficial | 378 |
| `Vanessa Migrado` com UUID nulo | 1 |
| Históricos | 764 |
| Perfis | 13 |
| Divergências UUID–nome | 0 |

## Segurança de dependências

- O React Router 7.18.1 foi substituído pelo pacote principal `react-router` 8.3.0 após uma nova vulnerabilidade alta ser detectada pelo `npm audit`.
- O lockfile foi regenerado pelo próprio npm.
- A auditoria de vulnerabilidades e a verificação de assinaturas e proveniência foram aprovadas.
- O workflow agora preserva o relatório de `npm audit` como artefato para rastreabilidade.

## Validação realizada

- análise estática aprovada;
- testes unitários, integração e cobertura aprovados;
- build e orçamento do bundle aprovados;
- testes Playwright desktop e mobile aprovados;
- cenários cobertos: cartão pessoal, aba permanente, alternância geral ↔ pessoal, limpeza de filtros, indicadores rápidos, detalhes e URL legada;
- Preview `dpl_2RimMsjqEnZYT6sGwQoaYbce7LAb` validado em estado `READY`;
- Production `dpl_Ej7wPRRaLhHAfF153e9Pnc3RfcTP` validada em estado `READY`;
- domínio oficial e rewrites `/minhas-demandas` e `/minhas-demandas/:id` validados com resposta HTTP 200.

## Publicação e segurança operacional

- PR de responsáveis oficiais: `#46`.
- PR do primeiro acesso visual: `#48`.
- PR da navegação definitiva das carteiras: `#50`.
- O deploy automático foi habilitado somente durante a publicação controlada e restaurado para bloqueado no encerramento.

## Regra de continuidade

A próxima ação é a homologação visual e funcional em Production pelo responsável do produto. Nenhum novo ciclo ou ampliação funcional está autorizado automaticamente.
