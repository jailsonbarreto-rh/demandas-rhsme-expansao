# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **29 de julho de 2026 — A1-Core residual autorizado**

<!-- IMPLEMENTATION_AUTHORIZATION: A1-CORE -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` — HTTP 200 |
| Deployment efetivo | `dpl_GuVDMjfxjKYgnU2uTgidxE3Em2yh` — `READY` |
| SHA efetivo de Production | `1aa5e6c7fa7c1158881e44d9c75af94f81d18204` — PR #92 |
| Atualização de dependências | PR #83, merge `6ccb45eacc76a95b6cde0967a6040e259b6c351c` |
| Bloqueio automático de deploy | restaurado pelo PR #93 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1` |
| Última migration remota | `20260729133230_security_deleted_visibility_and_actor` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Princípio transversal de dados | `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md` |
| Evolução futura do Radar | `docs/product/RADAR_GOVERNANCA_EVOLUCAO_POS_LEGADO.md` |
| Implementação funcional autorizada | **A1-Core residual** — GOV-012, OP-D15, OP-D01 e A1-CORE-A01 |
| Próxima atividade | implementar o A1-Core residual; depois iniciar o R4 operacional, sem antecipar dados futuros |

## A1-Core autorizado

O responsável pelo produto determinou que a conclusão das funções atuais não dependa da chegada nem do formato do legado futuro. Está autorizado o núcleo residual estritamente necessário antes do R4:

- gate dinâmico de migrations;
- retirada dos contratos e chamadas operacionais antigas;
- revogação das duas RPCs obsoletas para usuários autenticados;
- concorrência otimista, sem sobrescrita silenciosa, merge automático ou alteração do responsável;
- preservação do formulário e ausência de efeitos no banco quando houver conflito.

R1-1, R1-4 autônomo e R2 saem do caminho crítico. A ordem dos prazos entra no R4-1. Nenhum dado atual será corrigido, preenchido ou reclassificado pelo A1-Core.


## Pacotes concluídos

- **E0:** cadeia documental v3.1/v1.2 e gate documental — PR #58.
- **E1:** Production alinhada à `main` — PR #59; bloqueio restaurado pelo PR #60.
- **E1A:** fatos históricos temporários de `pg_net` representados no Git — PR #61, sem reexecução de SQL.
- **E4 — RLS da lixeira e autoria administrativa:** decisões no PR #94, paridade do R3 no PR #95 e implementação no PR #96; migration `20260729133230` verificada em Production, sem deploy da Vercel.
- **Correção do histórico técnico:** PR #69, publicação #70 e bloqueio #71.
- **Preservação informacional:** consolidada no PR #72.
- **E3 — semânticas gerenciais:** PR #73, publicação #74 e bloqueio #75.
- **Radar de Governança:** PR #76, publicação #77 e bloqueio #78.
- **Manutenção de dependências:** PR #83, publicação #84 e bloqueio #87.
- **Refinamento UX-RADAR-001:** PR #88, publicação #89 e bloqueio #90.
- **Refinamento UX-RADAR-002:** PR #91, publicação #92 e bloqueio #93.

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

## Refinamento UX-RADAR-002 concluído

O responsável pelo produto aprovou em 28 de julho de 2026 um pacote estritamente visual e editorial:

- renomear o botão `Demandas` para `Todas as demandas`, preservando rota, ícone e comportamento;
- retirar da interface os rótulos `Composição atual` e `Leitura da carteira`, mantendo a região analítica acessível;
- eliminar o espaçamento residual da composição e harmonizar o ritmo vertical dos blocos;
- organizar os quatro destinos da navegação em duas colunas nas telas estreitas, sem estouro horizontal;
- preservar integralmente dados, schema, Supabase, permissões, métricas, cálculos, filtros e regras de negócio.

A implementação funcional foi concluída no PR #91 e publicada pelo PR #92. O gate final aprovou 260 testes unitários/integração, 22 cenários Playwright em desktop e mobile — incluindo 320 px —, lint, auditoria, cobertura, build e orçamento do bundle. A comparação visual confirmou a remoção dos textos e o novo rótulo, sem estouro horizontal. Production `dpl_GuVDMjfxjKYgnU2uTgidxE3Em2yh` ficou `READY` no SHA `1aa5e6c7fa7c1158881e44d9c75af94f81d18204`; o domínio principal respondeu HTTP 200. O pacote não autorizou qualquer item do E4.

## Refinamento UX-RADAR-001 concluído

O PR #88 implementou o escopo expressamente aprovado em 28 de julho de 2026:

- identidade completa do Radar no cabeçalho principal, sem hero duplicado;
- navegação inicial nomeada `Radar de Governança`;
- estado operacional dinâmico sem exposição de fornecedor ou mecanismo de armazenamento;
- três frases de decisão interna retiradas da interface, com cálculos, denominadores, rótulos neutros e documentação preservados;
- indicação visual `Ctrl/⌘ K` retirada, mantendo o atalho funcional;
- nenhum dado, schema, migration, permissão, métrica ou regra de cálculo alterado.

Publicação e validação:

- Preview `dpl_GFCunid48X5mkGQkHT9mGbxoBf5j` — `READY` no SHA `995267fd212e304ecdcbf8d688b9e77d8cdd0e49`;
- Production `dpl_Ct3jYSQ3fNaobbzTcHRTpKdMcH8t` — `READY` no SHA `2143ab1669cb873ee5c1c0bced19dc90a97ea5ae`;
- domínio principal HTTP 200 com o título `Fluxo CTRH — Radar de Governança`;
- 260 testes unitários/integração e 22 cenários Playwright aprovados;
- gate documental, compatibilidade transitiva e inspeção do bundle público aprovados;
- Supabase `ACTIVE_HEALTHY`, consultado sem escrita e sem alteração de schema;
- `npm ci` fixado na Vercel para impedir reaplicação de patches sobre dependências restauradas do cache.

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

## E4 concluído em Production

As decisões OP-D17, E4-D01 e E4-A01 foram implementadas e verificadas em 29 de julho de 2026:

- somente administrador ativo consulta demandas logicamente excluídas e seus históricos;
- demandas ativas continuam consultáveis por todos os usuários ativos;
- `responsavel_id` identifica a pessoa de referência, sem criar posse exclusiva;
- administrador ou editor ativo pode continuar qualquer demanda ativa, inclusive quando atribuída a outra pessoa;
- cada ação e comentário registra quem efetivamente os praticou;
- agir não altera o responsável; somente reatribuição explícita modifica `responsavel_id`;
- operação autenticada usa `auth.uid()`; rotina administrativa sem sessão somente preserva ator previamente validado;
- leitor e perfil inativo permanecem sem as permissões vedadas;
- nenhum autor foi inferido para o legado.

O PR #96 integrou a migration `20260729133230_security_deleted_visibility_and_actor.sql`. A verificação pós-migration preservou 379 demandas, nenhuma excluída, 764 históricos, 13 perfis ativos, 378 `updated_by` nulos e 378 `created_by` nulos. Grants, função de gatilho e Advisors não apresentaram regressão do E4; a API permaneceu saudável.

Uma entrada redundante de histórico de migration, criada durante a concorrência entre a integração Git e uma reaplicação idempotente, foi reconciliada por alvo exato. O histórico remoto final contém somente a versão canônica `20260729133230`, sem reversão de schema ou alteração de dados.

O pacote não alterou frontend, rotas ou responsáveis existentes e não gerou Preview nem deployment da Vercel.

## Pendências posteriores

- **A1-Core:** autorizado e pendente de implementação.
- **R4:** próximo marco funcional após o A1-Core.
- **R5:** andamento, prontuário e recuperação administrativa após o R4.
- **R2:** consultas escaláveis e histórico sob demanda, adiado para depois das funções prioritárias.
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
