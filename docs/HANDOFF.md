# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **30 de julho de 2026 — R4 encerrado e pauta do R5 aberta**

<!-- IMPLEMENTATION_AUTHORIZATION: NONE -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Integração funcional do R4 | PR #103, merge `1a24586b2045115dd2486bbf1efb498d9521d9d9` |
| Publicação do R4 | PR #104, merge `698d81056a72d9d8e7ef65b8d91cf67ca0fbbaf1` |
| Encerramento do release | PR #105, merge `e99cf821ef93016ce17ad93b33960aed468b5616` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Deployment Production | `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3` — `READY` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Última migration remota | `20260730064021_r4_preserve_exceptional_internal_state` |
| Dados preservados | 379 demandas, 764 históricos, 13 perfis |
| Implementação funcional autorizada | **Nenhuma nova implementação funcional autorizada** |
| Próxima atividade | debate pré-implementação do R5, começando pela análise de andamento, transições e reabertura |

## R4 — estado encerrado

O R4 foi aprovado, implementado, homologado e publicado em Production nas camadas de aplicação e banco.

### Regras vigentes

- nova demanda exige prazo interno com data;
- prazo interno não admite `Não se aplica`;
- nova demanda exige prazo final com data ou `Não se aplica`;
- `Não se aplica` no prazo final não exige justificativa inicial;
- quando ambos forem definidos, prazo interno não pode superar prazo final;
- data passada no primeiro registro de prazo é permitida sem justificativa automática;
- alteração posterior de prazo já registrado exige justificativa;
- ausência de prazo legado não bloqueia edição não relacionada;
- primeiro preenchimento de prazo legado é adequação progressiva e não exige justificativa;
- demandas ativas criadas no sistema exigem próxima providência e data;
- demandas legadas passam a exigir próxima providência nas movimentações pertinentes;
- data passada da próxima providência exige justificativa;
- encerramento limpa a providência corrente e preserva o histórico.

### Apresentação

- cartões superiores explicitam `Prazo final hoje` e `Prazo final vencido`;
- filtros específicos cobrem prazo interno e próxima providência;
- o período pode usar a data da próxima providência;
- a tabela acrescenta a coluna `Próxima providência` sem remover as existentes;
- o detalhe destaca a providência antes dos prazos;
- a leitura de proximidade usa sete dias corridos;
- `Atenção agora` permanece com o comportamento atual até reavaliação do R6;
- o Excel mantém equivalência semântica com a carteira.

### Delimitação preservada

A rota administrativa de qualidade prevista originalmente como proposta em R4-4 não foi autorizada nem implementada. Os filtros operacionais e a equivalência do Excel foram concluídos; o painel `/admin/qualidade` permanece vinculado à futura decisão OP-D06.

A reconciliação completa das propostas antigas do Plano Executivo está em `docs/execution/ATUALIZACAO_POS_R4_PRE_R5_2026-07-30.md`.

## Validação da aplicação

Evidências aprovadas:

- `npm ci` e patches transitivos;
- auditoria sem vulnerabilidades;
- assinaturas e proveniência de dependências;
- gate documental: 9 de 9 verificações;
- lint;
- 67 arquivos e 309 testes unitários e de integração;
- TypeScript;
- build Vite;
- inspeção do bundle público;
- bundle inicial de 194.068 bytes, 60,17% abaixo da linha de base;
- 22 de 22 cenários Playwright em desktop e mobile de 320 px;
- acessibilidade, contraste, navegação, filtros, modais, Excel, console e overflow.

Relatório detalhado: `docs/execution/RELATORIO_VALIDACAO_R4_2026-07-30.md`.

## Supabase remoto

As migrations foram aplicadas no projeto gratuito existente, sem criação de branch paga e sem cobrança adicional:

1. `20260730063742_r4_deadlines_and_follow_up_rules`;
2. `20260730063806_r4_deadline_consistency_constraints`;
3. `20260730063832_r4_preserve_legacy_deadline_metadata`;
4. `20260730063856_r4_final_deadline_state_constraints`;
5. `20260730063923_r4_optional_reason_compatibility`;
6. `20260730064021_r4_preserve_exceptional_internal_state`.

A homologação remota utilizou operações sintéticas em transações com `ROLLBACK` e confirmou preservação do legado, adequação progressiva, justificativas, próxima providência, histórico, encerramento, compatibilidade e grants restritos. Nenhum fixture permaneceu no banco.

## Verificação de Production

- deployment `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3` em estado `READY`;
- target `production` e SHA `698d81056a72d9d8e7ef65b8d91cf67ca0fbbaf1`;
- domínio principal e `/demandas` responderam HTTP 200;
- rewrite SPA preservado;
- nenhum erro de runtime detectado após a publicação;
- Supabase permaneceu `ACTIVE_HEALTHY`;
- integridade confirmada: 379 demandas, 764 históricos e zero fixture R4.

## Segurança e publicação

- nenhum achado bloqueante novo foi introduzido pelo R4;
- o bloqueio automático foi restaurado para `deploymentEnabled: false`;
- nenhum deployment temporário foi promovido diretamente;
- qualquer publicação futura exige novo release controlado.

## Próximo ciclo — R5

O R5 está em **debate pré-implementação**. Nenhum pacote está autorizado.

Pauta documental: `docs/product/PAUTA_DECISOES_R5_2026-07-30.md`.

Decisões ainda pendentes:

- OP-D07 — reabertura e transições;
- OP-D08 — prontuário canônico;
- OP-D09 — identidade legível do autor;
- OP-D10 — contexto dos eventos;
- OP-D11 — restauração;
- OP-D12 — link de origem;
- OP-D19 — link interno compartilhável.

A primeira discussão recomendada é **R5-2 — Andamento, transições de status e reabertura**, começando pela análise do funcionamento atual no código e no layout.

## Documentação vigente

1. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md`;
3. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
4. `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`;
5. `docs/PRODUCT_CONTEXT.md`;
6. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`;
7. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
8. `docs/execution/ATUALIZACAO_POS_R4_PRE_R5_2026-07-30.md`;
9. `docs/product/PAUTA_DECISOES_R5_2026-07-30.md`;
10. este Handoff.

## Reavaliações futuras registradas

Sem autorização automática:

- representação conjunta dos diferentes prazos quando houver cobertura real;
- destaque futuro dos filtros operacionais;
- revisão da próxima providência em tabela, detalhe e mobile;
- evolução do bloco `Atenção agora` no R6;
- novos indicadores do Radar após uso consistente dos campos.

## Regra de continuidade

Nenhum item de R5, R6, R2 ou outro ciclo está autorizado por inferência. A próxima atividade é exclusivamente o debate pré-implementação do R5 e o registro das decisões expressamente aprovadas.
