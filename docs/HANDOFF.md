# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **30 de julho de 2026 — R4 em Production**

<!-- IMPLEMENTATION_AUTHORIZATION: NONE -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Integração funcional | PR #103, merge `1a24586b2045115dd2486bbf1efb498d9521d9d9` |
| Publicação | PR #104, merge `698d81056a72d9d8e7ef65b8d91cf67ca0fbbaf1` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Deployment Production | `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3` — `READY` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Última migration remota | `20260730064021_r4_preserve_exceptional_internal_state` |
| Dados preservados | 379 demandas, 764 históricos, 13 perfis |
| Implementação funcional autorizada | **Nenhuma nova implementação funcional autorizada** |
| Próxima atividade | iniciar novo debate pré-implementação; nenhum ciclo posterior está autorizado por inferência |

## R4 — estado atual

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

A homologação remota utilizou operações sintéticas em transações com `ROLLBACK` e confirmou:

- preservação das lacunas legadas;
- primeira adequação sem justificativa;
- alteração posterior com justificativa obrigatória;
- próxima providência obrigatória em movimentações pertinentes;
- data passada da providência com justificativa;
- histórico auditável com ator;
- encerramento sem providência corrente;
- compatibilidade sem contorno das regras;
- execução das RPCs apenas por `authenticated`.

Nenhum fixture permaneceu no banco. As contagens finais continuam em 379 demandas e 764 históricos.

## Verificação de Production

- deployment `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3` em estado `READY`;
- target `production` e SHA `698d81056a72d9d8e7ef65b8d91cf67ca0fbbaf1`;
- domínio principal respondeu HTTP 200;
- rota `/demandas` respondeu HTTP 200 e preservou o rewrite SPA;
- título publicado: `Fluxo CTRH — Radar de Governança`;
- nenhum erro de runtime detectado após a publicação;
- Supabase permaneceu `ACTIVE_HEALTHY`;
- integridade confirmada: 379 demandas, 764 históricos e zero fixture R4.

## Segurança e Advisors

Nenhum achado bloqueante novo foi introduzido pelo R4.

Os avisos sobre `SECURITY DEFINER` são compatíveis com a arquitetura vigente: funções com `search_path` fixo, grants restritos e autorização interna por `private.can_edit()`. Avisos preexistentes sobre índices, chaves estrangeiras, tabelas privadas de backup e proteção contra senha vazada permanecem fora do escopo do R4.

## Proteções de publicação

- o PR final de encerramento restaura `vercel.json` para `deploymentEnabled: false`;
- branches temporárias de validação e release não integram a configuração funcional;
- nenhum deployment temporário foi promovido diretamente;
- Production foi gerada pela integração da `main`;
- qualquer publicação futura exige novo release controlado.

## Documentação vigente

1. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md`;
3. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
4. `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`;
5. `docs/PRODUCT_CONTEXT.md`;
6. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`;
7. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
8. este Handoff.

## Reavaliações futuras registradas

Sem autorização automática:

- representação conjunta dos diferentes prazos quando houver cobertura real;
- destaque futuro dos filtros operacionais;
- revisão da próxima providência em tabela, detalhe e mobile;
- evolução do bloco `Atenção agora` no R6;
- novos indicadores do Radar após uso consistente dos campos.

## Regra de continuidade

Nenhum item de R5, R6, R2 ou outro ciclo está autorizado por inferência. O próximo ciclo deve voltar ao debate pré-implementação e ao Registro de Decisões.
