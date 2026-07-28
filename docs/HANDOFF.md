# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **28 de julho de 2026 — UX-RADAR-001 em validação no PR #88**

<!-- IMPLEMENTATION_AUTHORIZATION: UX-RADAR-001 -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` — HTTP 200 |
| Deployment efetivo | `dpl_8b2S3v8wkZfXkzcEohrqp32qT2W9` — `READY` |
| SHA efetivo de Production | `ab8f4b83d23ea4f0337095838a14f4aad095450b` — PR #84 |
| Atualização de dependências | PR #83, merge `6ccb45eacc76a95b6cde0967a6040e259b6c351c` |
| Bloqueio automático de deploy | restaurado pelo PR #87 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1` |
| Última migration remota | `20260724011303_r3_responsaveis_oficiais` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Princípio transversal de dados | `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md` |
| Evolução futura do Radar | `docs/product/RADAR_GOVERNANCA_EVOLUCAO_POS_LEGADO.md` |
| Implementação funcional autorizada | UX-RADAR-001 — identidade e microcopy operacional do Radar |
| Próxima atividade | concluir UX-RADAR-001; E4 permanece sem autorização |

## Pacotes concluídos

- **E0:** cadeia documental v3.1/v1.2 e gate documental — PR #58.
- **E1:** Production alinhada à `main` — PR #59; bloqueio restaurado pelo PR #60.
- **E1A:** fatos históricos temporários de `pg_net` representados no Git — PR #61, sem reexecução de SQL.
- **Correção do histórico técnico:** PR #69, publicação #70 e bloqueio #71.
- **Preservação informacional:** consolidada no PR #72.
- **E3 — semânticas gerenciais:** PR #73, publicação #74 e bloqueio #75.
- **Radar de Governança:** PR #76, publicação #77 e bloqueio #78.
- **Manutenção de dependências:** PR #83, publicação #84 e bloqueio #87.

## Atualização de dependências de manutenção

Foram atualizadas exclusivamente dependências já existentes, sem instalação de nova biblioteca e sem alteração de comportamento de produto:

| Pacote | Versão anterior | Versão atual |
|---|---:|---:|
| `react-hook-form` | `7.82.0` | `7.83.0` |
| `@hookform/resolvers` | `5.4.0` | `5.5.7` |
| `@radix-ui/react-dialog` | `1.1.20` | `1.1.23` |
| `@radix-ui/react-alert-dialog` | `1.1.20` | `1.1.23` |
| `@radix-ui/react-dropdown-menu` | `2.1.21` | `2.1.24` |
| `typescript-eslint` | `8.64.0` | `8.65.0` |

O `package-lock.json` foi regenerado pelo npm em Node.js 24. O workflow temporário de geração do lockfile foi removido antes do PR final.

Validação concluída:

- `npm ci`;
- auditoria de vulnerabilidades;
- assinaturas e proveniência;
- lint;
- testes unitários, integração e cobertura;
- build e orçamento de bundle;
- Playwright e acessibilidade no navegador.

Nenhum código funcional, dado, schema, migration ou configuração do Supabase foi alterado. A análise específica do tratamento de `brace-expansion` permanece fora deste pacote.

## Refinamento UX-RADAR-001 em validação

O PR #88 implementa o escopo expressamente aprovado em 28 de julho de 2026:

- identidade completa do Radar no cabeçalho principal, sem hero duplicado;
- navegação inicial nomeada `Radar de Governança`;
- estado operacional dinâmico sem exposição de fornecedor ou mecanismo de armazenamento;
- três frases de decisão interna retiradas da interface, com cálculos, denominadores, rótulos neutros e documentação preservados;
- indicação visual `Ctrl/⌘ K` retirada, mantendo o atalho funcional;
- nenhum dado, schema, migration, permissão, métrica ou regra de cálculo alterado.

## Radar de Governança

### Identidade

- **Título:** `Radar de Governança`.
- **Subtítulo exato:** `Visão estratégica do fluxo de trabalho, com análise de dados e monitoramento da carteira de demandas.`
- **Posição:** cabeçalho principal do produto; não há segunda apresentação do título dentro da página.

### Componentes preservados

- `Atenção agora`;
- distribuição por status;
- demandas por setor informado;
- registros recentes do histórico.

### Leituras adicionadas

**Cobertura dos prazos**

- prazo interno e prazo final separados;
- definido, não informado e não se aplica;
- percentual de cobertura;
- vencimento calculado somente entre prazos finais definidos, com denominador explícito.

**Distribuição por responsável**

- agrupamento oficial por `responsavel_id`;
- quantidade e composição por status;
- `Vínculo legado pendente` separado de `Sem responsável`;
- nenhuma inferência de produtividade, desempenho ou equivalência da carga.

`Vanessa Migrado` permanece visível como vínculo legado pendente, sem UUID, até saneamento oficial posterior.

### Evolução futura

As leituras dependentes da chegada integral e reconciliação do legado permanecem em `docs/product/RADAR_GOVERNANCA_EVOLUCAO_POS_LEGADO.md`, sem autorização automática:

- evolução temporal da carteira;
- entradas, encerramentos e saldo por período;
- envelhecimento;
- permanência por status e gargalos;
- próximas providências;
- cumprimento de prazos;
- perfil ampliado por tipo, classificação e setor;
- cobertura e qualidade da base completa.

Datas de importação não podem ser tratadas como datas operacionais, e estoque não pode ser convertido em produtividade.

## Semânticas vigentes

- `Demandas por setor informado`;
- `Em acompanhamento`;
- `Distribuição por responsável`;
- `Registros recentes do histórico`.

O campo `setor` é texto informado na demanda. Sua contagem não comprova produtividade, desempenho, esforço executado ou estrutura organizacional oficial.

## Preservação informacional

- regras atuais são rígidas para novos cadastros e operações;
- dados oficiais legados ou históricos incompatíveis não podem ser apagados, omitidos, truncados, sobrescritos ou convertidos silenciosamente em vazio;
- toda transformação preserva valor original, proveniência e razão;
- correlação automática somente ocorre quando comprovável;
- informação não associada permanece como pendência, ambiguidade ou conflito;
- auditoria técnica e apresentação operacional são camadas distintas;
- qualquer risco de perda ou sobrescrita deve voltar ao responsável pelo produto antes da implementação.

## Segurança final

A retirada de dados reais dos repositórios, contenção do repositório predecessor, revisão de deployments antigos e eventual reescrita de histórico Git permanecem adiadas para pacote consolidado ao final das implementações funcionais e antes da entrega do produto para uso.

Até esse momento, nenhum arquivo real ou histórico será apagado por essa frente.

## Estado funcional preservado

- `responsavel_id` é a identidade oficial do responsável;
- `/demandas` é a carteira da equipe;
- `/minhas-demandas` é a carteira pessoal por UUID;
- indicadores e filtros permanecem contextuais à carteira aberta;
- paginação padrão de 50 e opção de 100 permanecem;
- eventos técnicos continuam preservados no banco e traduzidos apenas na apresentação.

## Pendências posteriores

- **E4:** RLS da lixeira e autoria administrativa — depende de debate e autorização expressa.
- **R1:** integridade, contratos e concorrência.
- **R2:** consultas escaláveis e histórico sob demanda.
- **R4:** prazos e próxima providência.
- **R5:** andamento, prontuário e recuperação administrativa.
- **Segurança final:** antigo escopo E2 ampliado, conforme GOV-011.

Nenhuma dessas etapas está autorizada automaticamente.

## Regra de continuidade

1. nenhuma decisão `OP-Dxx` pode ser inferida dos planos;
2. o responsável pelo produto autoriza expressamente o próximo pacote;
3. cada pacote permanece isolado em branch e PR próprios;
4. alterações futuras de banco exigem preflight da cadeia de migrations;
5. toda etapa concluída atualiza os documentos vigentes no mesmo trabalho;
6. qualquer alteração que possa comprometer informação oficial para e retorna para decisão expressa.
