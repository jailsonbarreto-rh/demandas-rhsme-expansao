# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **27 de julho de 2026 — E3 publicado e bloqueio automático restaurado (PRs #73–#75)**

<!-- IMPLEMENTATION_AUTHORIZATION: none -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` — HTTP 200 |
| Deployment efetivo | `dpl_H5TFobDu94pyMCeu4s8FkSjeVwU7` — `READY` |
| SHA efetivo de Production | `f9873c59d5c097bb00c82a76b65c2abb6ff95009` — PR #74 |
| Implementação funcional do E3 | PR #73, merge `99acdf0b7f27d22f71119522bacb4d3ac72118e3` |
| Bloqueio automático de deploy | restaurado pelo PR #75 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1` |
| Última migration remota | `20260724011303_r3_responsaveis_oficiais` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Princípio transversal de dados | `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md` |
| Implementação autorizada após este pacote | nenhuma |
| Próxima atividade | debate e decisão do E4; nenhuma implementação do E4 está autorizada |

## Pacotes concluídos

- **E0:** cadeia documental v3.1/v1.2 consolidada e gate documental instituído no PR #58.
- **E1:** Production alinhada ao estado funcional da `main`, incluindo o PR #53, pelo PR #59; bloqueio restaurado no PR #60.
- **E1A:** fatos históricos temporários de `pg_net` representados no Git no PR #61, sem reexecução de SQL.
- **Correção do histórico técnico:** implementada no PR #69, publicada pelo PR #70 e protegida pelo PR #71.
- **Preservação informacional:** consolidada documentalmente no PR #72.
- **E3 — semânticas gerenciais:** concluído no PR #73, publicado pelo PR #74 e seguido da restauração do bloqueio no PR #75.

## E3 — semânticas gerenciais objetivas

### Problema corrigido

Alguns rótulos atribuíam às contagens significados não comprovados pelos dados:

- `Setores mais Ativos` podia sugerir atividade ou produtividade;
- `Ativas` era impreciso para demandas apenas não encerradas;
- `Ranking de responsáveis` podia sugerir competição ou desempenho individual.

### Redação vigente

- `Demandas por setor informado`;
- `Em acompanhamento`;
- `Distribuição por responsável — 10 maiores volumes`;
- `Registros recentes do histórico`, já corrigido na etapa anterior.

O campo `setor` continua sendo texto informado na demanda. Sua contagem não comprova produtividade, desempenho, esforço executado ou estrutura organizacional oficial.

### Superfícies alteradas

- Visão Geral;
- resumo analítico do Excel;
- seção de distribuição por setor do Excel;
- distribuição por responsável no Excel;
- nomes internos do contrato analítico;
- testes de microcopy e documentação.

### Preservação

- nenhum dado foi alterado;
- nenhuma demanda, responsável, status, prazo, comentário ou histórico foi reescrito;
- cálculos, quantidades, filtros e recortes permaneceram idênticos;
- nenhuma migration foi criada ou executada;
- nenhuma estrutura, policy, função ou registro do Supabase foi modificado.

A decisão está registrada como OP-D02 e detalhada em `docs/adr/ADR-005-semantica-setor-e-distribuicoes.md`.

## Validação do E3

- TDD com RED confirmado antes da implementação;
- auditoria de dependências: aprovada;
- assinaturas e proveniência: aprovadas;
- lint: aprovado;
- testes unitários, integração e cobertura: aprovados;
- build e orçamento de bundle: aprovados;
- testes Playwright: aprovados;
- Preview: `READY` e HTTP 200;
- Production: `READY` e HTTP 200;
- SHA publicado corresponde ao PR operacional #74.

## Princípio transversal de preservação informacional

As decisões GOV-009 e GOV-010 orientam toda alteração futura:

- regras atuais permanecem rígidas para novos cadastros e operações;
- dados oficiais legados ou históricos incompatíveis não podem ser apagados, omitidos, truncados, sobrescritos ou convertidos silenciosamente em vazio;
- toda transformação preserva valor original, proveniência e razão;
- correlação automática somente ocorre quando comprovável;
- informação não associada permanece como pendência, ambiguidade ou conflito para saneamento posterior;
- o princípio se aplica a todos os campos e eventos;
- auditoria técnica e apresentação operacional são camadas distintas;
- qualquer risco de perda ou sobrescrita deve ser apresentado ao responsável pelo produto antes da implementação.

`Vanessa Migrado` permanece como caso canônico de informação histórica preservada sem UUID até vínculo oficial posterior.

## Decisão sobre dados reais e segurança final

A retirada de dados reais dos repositórios, a contenção do repositório predecessor, a revisão de deployments antigos e eventual reescrita de histórico Git permanecem adiadas para um pacote consolidado de segurança ao final das implementações funcionais e antes da entrega do produto para uso.

Até esse momento:

- nenhum arquivo real será apagado por essa frente;
- nenhum histórico será reescrito;
- a segurança final não bloqueará implementações funcionais independentes;
- os dados serão preservados para desenvolvimento e conferência do legado.

## Estado funcional preservado

- `responsavel_id` continua sendo a identidade oficial do responsável.
- `/demandas` continua sendo a carteira da equipe.
- `/minhas-demandas` continua sendo a carteira pessoal por UUID.
- Indicadores e filtros continuam contextuais à carteira aberta.
- A paginação padrão de 50 registros e a opção de 100 permanecem.
- Os eventos técnicos continuam preservados no banco e traduzidos apenas na apresentação.

## Pendências posteriores do plano

- **E4:** RLS da lixeira e autoria administrativa — depende de debate da OP-D17 e autorização expressa.
- **R1:** integridade, contratos e concorrência.
- **R2:** consultas escaláveis e histórico sob demanda.
- **R4:** prazos e próxima providência.
- **R5:** andamento, prontuário e recuperação administrativa.
- **Segurança final:** antigo escopo E2 ampliado, conforme GOV-011.

Nenhuma dessas etapas está autorizada automaticamente pela conclusão do E3.

## Regra de continuidade

1. nenhuma decisão `OP-Dxx` pode ser inferida dos planos;
2. o responsável pelo produto autoriza expressamente o próximo pacote;
3. cada pacote permanece isolado em branch e PR próprios;
4. alterações de banco futuras exigem preflight da cadeia de migrations antes da aplicação;
5. toda etapa concluída atualiza os documentos vigentes afetados no mesmo trabalho;
6. atualização de status decorrente da conclusão normal de uma tarefa não cria novo ciclo de planejamento;
7. qualquer alteração que possa comprometer informação oficial para e retorna para decisão expressa.
