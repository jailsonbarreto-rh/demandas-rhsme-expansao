# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **24 de julho de 2026 — indicadores contextuais do R3 em Production**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrsllr` |
| Código funcional publicado | `98ce45df2e05d223c89227dea244dc53a7d4e363` — PR #52 |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Linha de base funcional | Ciclos originais 0 a 4 concluídos; responsáveis oficiais, navegação das carteiras e indicadores contextuais do R3 implementados |
| Atividade atual | **Homologação do refinamento final dos indicadores pelo responsável do produto** |
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
- Nenhuma migration, tabela, função ou dado do Supabase foi alterado nesta revisão.

## Indicadores contextuais publicados

- `Em acompanhamento`, `Para assinatura`, `Vencem hoje` e `Vencidas` usam a carteira completa na Visão geral e em `/demandas`.
- Em `/minhas-demandas`, os quatro indicadores usam somente demandas cujo `responsavel_id` corresponde ao UUID autenticado.
- A quantidade de demandas com providência imediata segue o mesmo contexto da carteira ativa.
- Os cliques nos indicadores preservam a carteira aberta e aplicam o filtro somente dentro dela.
- Ao alternar entre carteira pessoal e geral, as quantidades são recalculadas imediatamente.
- A lógica existente do cabeçalho foi preservada; apenas a coleção de entrada passou a ser a carteira delimitada pela rota.

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

- O React Router 7.18.1 foi substituído pelo pacote principal `react-router` 8.3.0 após uma vulnerabilidade alta ser detectada pelo `npm audit`.
- O lockfile foi regenerado pelo próprio npm.
- A auditoria de vulnerabilidades e a verificação de assinaturas e proveniência foram aprovadas.
- O workflow preserva o relatório de `npm audit` como artefato para rastreabilidade.

## Validação realizada

- auditoria de dependências e assinaturas aprovada;
- análise estática aprovada;
- testes unitários, integração e cobertura aprovados;
- build e orçamento do bundle aprovados;
- testes Playwright desktop e mobile aprovados;
- cenário contextual validado com contagens distintas para carteira geral e pessoal;
- filtro `Para assinatura` validado dentro das duas carteiras;
- Preview `dpl_269KLitdSkMVa6DUNHArpWbUG8Q5` validado em estado `READY`;
- Production `dpl_44HusLjkHEJxpKtvWQFfrgJmXvNR` validada em estado `READY`;
- domínio oficial validado com resposta HTTP 200.

## Publicação e segurança operacional

- PR de responsáveis oficiais: `#46`.
- PR do primeiro acesso visual: `#48`.
- PR da navegação definitiva das carteiras: `#50`.
- PR dos indicadores contextuais: `#52`.
- O deploy automático foi habilitado somente durante a publicação controlada e restaurado para bloqueado no encerramento.

## Regra de continuidade

A próxima ação é a homologação visual e funcional do refinamento dos indicadores em Production. Nenhum novo ciclo ou ampliação funcional está autorizado automaticamente.
