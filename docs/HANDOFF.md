# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **28 de julho de 2026 — dependências de manutenção publicadas e bloqueio restaurado**

<!-- IMPLEMENTATION_AUTHORIZATION: none -->

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
| Implementação funcional autorizada | nenhuma |
| Próxima atividade | debate e decisão do E4; nenhuma implementação do E4 está autorizada |

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

O `package-lock.json` foi regenerado pelo npm em Node.js 24 e mantido consistente com as versões exatas do `package.json`. O workflow temporário usado apenas para gerar o lockfile foi removido antes do gate final.

Validação do pacote:

- instalação limpa por `npm ci`: aprovada;
- auditoria de vulnerabilidades: aprovada;
- assinaturas e proveniência do registro: aprovadas;
- lint: aprovado;
- testes unitários, de integração e cobertura: aprovados;
- build e orçamento de bundle: aprovados;
- Playwright e acessibilidade no navegador: aprovados;
- nenhuma nova dependência funcional foi adicionada;
- nenhum código funcional, dado, schema, migration ou configuração do Supabase foi alterado;
- o tratamento específico de `brace-expansion` permanece fora deste pacote e deverá ser analisado separadamente.

## Radar de Governança

O Radar superior está materialmente em Production e representa apenas dados confirmados, sem criar semânticas gerenciais não comprovadas.

### Indicadores atuais

- **Demandas em aberto**;
- **Em acompanhamento**;
- **Para assinatura**;
- **Vencem hoje**;
- **Vencidas**;
- **Providências imediatas**.

### Regras preservadas

- os indicadores acompanham a carteira atual;
- em **Visão geral** e **Demandas**, consideram toda a carteira aberta;
- em **Minhas demandas**, consideram somente as demandas do usuário conectado;
- clicar em um indicador aplica o filtro na própria carteira;
- nenhuma regra de responsabilidade foi alterada;
- nenhuma classificação gerencial não comprovada foi inferida.

## Estado dos ambientes

### GitHub

- `main` contém o estado funcional e documental vigente;
- branches de publicação e bloqueio já foram integradas;
- não há autorização implícita para novos ciclos de produto.

### Supabase

- projeto: `CTRH PROCESSOS`;
- ref: `kdhekkzwcokfrpcrsllr`;
- região: `sa-east-1`;
- nenhuma migration foi aplicada pelos pacotes de dependências, Radar ou documentação;
- nenhuma carga ou alteração de dados foi realizada.

### Vercel

- Production está em `READY`;
- o deployment atual corresponde ao pacote publicado pelo PR #84;
- o bloqueio automático foi restaurado pelo PR #87;
- nenhuma publicação automática permanece aberta.

## Próximos ciclos ainda não autorizados

- **E4:** decisões de produto ainda em debate;
- **R1:** legitimidade estrutural e restrições de edição;
- **R2:** consultas escaláveis e histórico sob demanda;
- **R4:** prazos e próxima providência;
- **R5:** andamento, prontuário e recuperação administrativa;
- **Segurança final:** antigo escopo E2 ampliado, conforme GOV-011.

Nenhuma dessas etapas está autorizada automaticamente pela conclusão do Radar ou pela atualização de dependências.

## Regra de continuidade

Antes de qualquer nova implementação funcional:

1. explicar o ciclo e suas decisões independentes;
2. registrar a decisão expressa no Registro de Decisões;
3. atualizar o marcador `IMPLEMENTATION_AUTHORIZATION` quando houver autorização;
4. criar branch própria;
5. executar o gate completo;
6. integrar somente após validação;
7. publicar apenas quando autorizado;
8. restaurar o bloqueio automático após a publicação.
