# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **25 de julho de 2026 — PR #55 de reconciliação documental pós-R3**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrsllr` |
| `main` usada como base documental | `967a727d25fcbae848a7556da510e9387581f7b7` |
| Último Production documentado | `98ce45df2e05d223c89227dea244dc53a7d4e363` — PR #52 |
| Branch documental | `docs/sincronizar-regras-pos-r3` |
| Pull request | `#55 — docs: reconciliar regras vigentes após o R3` |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Plano vigente proposto | `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.1.md` |
| Atividade atual | Revisão e homologação do PR documental #55 |
| Próxima atividade | Debate pré-implementação do R1, somente após merge e homologação desta correção documental |

## Decisões vigentes de responsabilidade

- `responsavel_id` é a identidade oficial do responsável.
- Novas demandas e futuras reatribuições selecionam usuário cadastrado por UUID ou permanecem sem responsável.
- Responsável externo e nome livre não são opções atuais.
- O nome textual vinculado a UUID é derivado pelo servidor.
- Informação textual legada sem UUID pode ser preservada sem virar opção futura.
- 378 demandas históricas permanecem vinculadas aos perfis oficiais.
- `Vanessa Migrado` permanece como única informação histórica conhecida sem UUID.
- Demandas sem UUID não aparecem em carteira pessoal.

## Navegação vigente

- `/demandas` representa a carteira completa da equipe.
- `/minhas-demandas` representa somente demandas vinculadas ao UUID autenticado.
- `escopo=meu` existe somente como compatibilidade legada e redireciona para `/minhas-demandas`.
- As duas carteiras possuem cabeçalho contextual e alternância direta.
- `Limpar filtros` não troca a carteira.
- Detalhes preservam carteira, filtros e rota de origem.
- Indicadores contextuais usam a carteira atualmente aberta.

## Reconciliação documental do PR #55

Foram instituídos ou atualizados:

- `AGENTS.md`;
- `README.md`;
- `docs/PRODUCT_CONTEXT.md`;
- `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.1.md`;
- `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.3.md`;
- `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.2.md`;
- `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.0.md`;
- `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
- `docs/SUPABASE_SETUP.md`;
- `docs/execution/HISTORICO_DOCUMENTAL_CTRH.md`;
- `.github/pull_request_template.md`.

Planos, adendos, protocolo e especificação anteriores potencialmente conflitantes foram marcados como históricos e apontam para seus substitutos. A íntegra original permanece recuperável no histórico Git, inclusive no commit-base `967a727d25fcbae848a7556da510e9387581f7b7`.

## Política permanente de documentação

Toda alteração concreta de lógica, regra de negócio, permissão, obrigatoriedade, modelo de dados, cálculo, rota ou comportamento visível deve atualizar no mesmo PR todos os documentos vigentes afetados.

A entrega não está concluída quando apenas o código e os testes estão corretos. Também é necessário:

1. registrar a decisão;
2. sincronizar Product Context, plano, AGENTS, ADRs e documentação técnica;
3. atualizar este Handoff;
4. marcar textos históricos conflitantes;
5. pesquisar no repositório por orientações antigas;
6. preencher o checklist documental do PR.

## Fotografia reconciliada de Production

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas vinculadas a perfil oficial | 378 |
| Informação histórica sem UUID | 1 |
| Históricos | 764 |
| Perfis | 13 |
| Divergências UUID–nome | 0 |
| Links de origem cadastrados | 0 |

## Estado dos ciclos

| Ciclo | Estado |
|---|---|
| R1 | próximo debate; implementação não autorizada |
| R2 | pendente após R1 |
| R3 | implementado e preservado |
| R4 | pendente após R1, R2 e R3 |
| R5 | suspenso até R4 |
| R6–R12 | futuros |

A execução cronológica retoma R1 e R2. O R3 não deve ser desfeito nem reexecutado.

## Pendências estruturantes reconhecidas

- cinco constraints ainda `NOT VALID`;
- concorrência otimista ausente;
- carregamento integral de demandas e histórico;
- paginação apenas visual;
- recargas integrais após mutações e Realtime;
- E2E Supabase ainda a estruturar;
- semântica do campo `setor` ainda aberta;
- R4 ainda não entregue como experiência completa;
- R5 não autorizado.

## Publicação e segurança operacional

O PR #55 é exclusivamente documental:

- não altera frontend, banco, migrations, RLS, Auth, Realtime ou dados;
- não exige deployment de Preview ou Production;
- não autoriza execução funcional de R1 ou qualquer ciclo posterior;
- mantém o bloqueio de deploy automático vigente.

## Regra de continuidade

Depois do merge e da homologação do PR #55, o próximo trabalho permitido é analisar e debater o R1 item a item. A implementação do R1 dependerá de nova autorização expressa sobre o escopo consolidado.
