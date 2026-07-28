# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **28 de julho de 2026 — Radar de Governança publicado e bloqueio automático restaurado (PRs #76–#78)**

<!-- IMPLEMENTATION_AUTHORIZATION: none -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` — HTTP 200 |
| Deployment efetivo | `dpl_G4DYuCYfyNZ464oTTRVQbi842KFx` — `READY` |
| SHA efetivo de Production | `a6fe540003ea2c2f2519c185a1b3c956081a3da7` — PR #77 |
| Implementação funcional do Radar | PR #76, merge `37e8734f9b79936a551bb985f85b0de13f9fe06c` |
| Bloqueio automático de deploy | restaurado pelo PR #78 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1` |
| Última migration remota | `20260724011303_r3_responsaveis_oficiais` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Princípio transversal de dados | `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md` |
| Evolução futura do Radar | `docs/product/RADAR_GOVERNANCA_EVOLUCAO_POS_LEGADO.md` |
| Implementação autorizada após este pacote | nenhuma |
| Próxima atividade | debate e decisão do E4; nenhuma implementação do E4 está autorizada |

## Pacotes concluídos

- **E0:** cadeia documental v3.1/v1.2 consolidada e gate documental instituído no PR #58.
- **E1:** Production alinhada ao estado funcional da `main` pelo PR #59; bloqueio restaurado no PR #60.
- **E1A:** fatos históricos temporários de `pg_net` representados no Git no PR #61, sem reexecução de SQL.
- **Correção do histórico técnico:** implementada no PR #69, publicada pelo PR #70 e protegida pelo PR #71.
- **Preservação informacional:** consolidada documentalmente no PR #72.
- **E3 — semânticas gerenciais:** concluído no PR #73, publicado pelo PR #74 e protegido pelo PR #75.
- **Radar de Governança:** implementado no PR #76, publicado pelo PR #77 e protegido pelo PR #78.

## Radar de Governança

### Identidade da área

- **Título:** `Radar de Governança`.
- **Subtítulo exato:** `Visão estratégica do fluxo de trabalho, com análise de dados e monitoramento da carteira de demandas.`

A redação é institucional e neutra. Ela não afirma que o trabalho precisa melhorar nem promete resultado automático; informa que a área oferece visão estratégica, análise e monitoramento.

### Componentes preservados e reorganizados

- `Atenção agora`;
- distribuição por status;
- demandas por setor informado;
- registros recentes do histórico.

Esses componentes não foram duplicados. A implementação reorganizou sua hierarquia visual e adicionou somente as duas leituras aprovadas.

### Cobertura dos prazos

A nova leitura apresenta separadamente, para prazo interno e prazo final:

- definido;
- não informado;
- não se aplica;
- percentual de cobertura sobre a carteira.

A situação de vencimento é calculada somente entre as demandas com prazo final definido e exibe seu denominador. Ausência de prazo não é tratada como regularidade nem incorporada silenciosamente ao universo de casos em dia.

### Distribuição por responsável

A nova leitura apresenta:

- agrupamento oficial por `responsavel_id`;
- quantidade de demandas por responsável;
- composição visual por status;
- `Vínculo legado pendente` para informação textual histórica sem UUID;
- `Sem responsável` para ausência real de atribuição.

As duas últimas situações não são combinadas. `Vanessa Migrado` permanece visível como vínculo legado pendente, sem ser apagada, omitida ou apresentada como ausência de responsável.

A distribuição não representa produtividade, desempenho, eficiência ou equivalência da carga de trabalho.

### Polimento visual

- nova hierarquia tipográfica;
- cabeçalho institucional próprio;
- cartões analíticos com densidade e espaçamento revisados;
- barras segmentadas e legendas consistentes;
- números com alinhamento e leitura tabular;
- responsividade em desktop, tablet e celular;
- contraste corrigido após auditoria automática de acessibilidade.

## Evolução após a chegada integral do legado

As ideias que dependem de dados ainda não disponíveis ou de cobertura insuficiente foram preservadas em:

`docs/product/RADAR_GOVERNANCA_EVOLUCAO_POS_LEGADO.md`

O documento registra, sem autorizar implementação automática:

- evolução temporal da carteira;
- entradas, encerramentos e saldo por período;
- envelhecimento da carteira;
- permanência por status e gargalos;
- próximas providências e agenda de acompanhamento;
- cumprimento de prazos;
- perfil ampliado por tipo, classificação e setor informado;
- cobertura e qualidade dos dados após reconciliação do legado.

Essas leituras somente poderão ser implementadas quando houver proveniência, cobertura e série histórica suficientes. Datas de importação não poderão ser usadas como datas operacionais, e estoque não poderá ser convertido em indicador de produtividade.

## Validação do Radar

- TDD com RED confirmado antes da implementação;
- auditoria de dependências: aprovada;
- assinaturas e proveniência: aprovadas;
- lint: aprovado;
- testes unitários, de integração e cobertura: aprovados;
- build e orçamento de bundle: aprovados;
- testes Playwright e axe em desktop e mobile: aprovados;
- contraste insuficiente encontrado no primeiro ciclo e corrigido antes da integração;
- Production: `READY` e HTTP 200;
- nenhum dado, cálculo persistido, schema, policy, função, migration ou registro do Supabase foi alterado.

A decisão está detalhada em `docs/adr/ADR-006-radar-governanca-leituras-atuais.md`.

## E3 — semânticas gerenciais objetivas

As redações vigentes permanecem:

- `Demandas por setor informado`;
- `Em acompanhamento`;
- `Distribuição por responsável`;
- `Registros recentes do histórico`.

O campo `setor` continua sendo texto informado na demanda. Sua contagem não comprova produtividade, desempenho, esforço executado ou estrutura organizacional oficial.

## Princípio transversal de preservação informacional

As decisões GOV-009 e GOV-010 orientam toda alteração futura:

- regras atuais permanecem rígidas para novos cadastros e operações;
- dados oficiais legados ou históricos incompatíveis não podem ser apagados, omitidos, truncados, sobrescritos ou convertidos silenciosamente em vazio;
- toda transformação preserva valor original, proveniência e razão;
- correlação automática somente ocorre quando comprovável;
- informação não associada permanece como pendência, ambiguidade ou conflito para saneamento posterior;
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

Nenhuma dessas etapas está autorizada automaticamente pela conclusão do Radar.

## Regra de continuidade

1. nenhuma decisão `OP-Dxx` pode ser inferida dos planos;
2. o responsável pelo produto autoriza expressamente o próximo pacote;
3. cada pacote permanece isolado em branch e PR próprios;
4. alterações de banco futuras exigem preflight da cadeia de migrations antes da aplicação;
5. toda etapa concluída atualiza os documentos vigentes afetados no mesmo trabalho;
6. atualização de status decorrente da conclusão normal de uma tarefa não cria novo ciclo de planejamento;
7. qualquer alteração que possa comprometer informação oficial para e retorna para decisão expressa.
